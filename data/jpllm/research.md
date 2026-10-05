# jpllm/Research

## Resumen

jpllm/Research es un repositorio de investigación que documenta una arquitectura Transformer compacta denominada Supra-Mini, con 812.800 parámetros, diseñada para explorar dos hipótesis teóricas concretas: reducir el coste de "borrar" el token de entrada en el flujo residual (lo que el autor llama *Residual Memory Burden*) y evitar el desperdicio paramétrico de proyecciones de rango completo en cada subcapa. El modelo se entrena íntegramente en JAX/Flax y se distribuye como checkpoints serializados en formato `.msgpack`, no como pesos safetensors o GGUF.

La propuesta técnica combina tres piezas: actualizaciones de bajo rango (64 dimensiones activas sobre un `d_model` de 128) rellenadas con ceros, una difusión isométrica mediante matrices ortonormalizadas de Sylvester-Hadamard que reparte la energía por las 128 coordenadas sin alterar la norma L2, y permutaciones pseudoaleatorias fijas por subcapa para maximizar la distancia de Grassmann entre subespacios. La cabeza de decodificación añade un filtro dinámico de Gram-Schmidt con una puerta dependiente del estado oculto que resta la componente colineal al embedding de entrada.

Es relevante ahora como artefacto de investigación reproducible más que como modelo de producción: el autor publica cinco checkpoints (de 10M a 100M tokens acumulados), documenta las pérdidas de cada uno y reporta un throughput de entre 186.000 y 246.000 tokens por segundo en un núcleo TPU v5e-1, con menos de 7 minutos de cómputo total para 100M de tokens. Todo el entrenamiento se hizo sobre corpus públicos pequeños (TinyStories, FineWeb, smollm-corpus, dclm-edu y una fracción de Cosmo) con ventana de contexto de 256 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compacto con difusión isométrica de Hadamard y anti-resíduo de Gram-Schmidt dinámico (6 capas, 12 subcapas atención+FFN) |
| Parametros totales | 812.800 (0,81 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_len=256`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión de entrenamiento en Flax) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los corpus dominantes son mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Flax serializado con `flax.serialization`, extensión `.msgpack` (directorio `checkpoints/`); no se publican safetensors ni GGUF |
| Dimension del modelo | `d_model=128`, `num_heads=4`, `d_head=16`, `num_layers=6` |
| Subespacio activo por subcapa | 64 de 128 dimensiones |
| Framework | JAX + Flax |
| Tokenizer | `SupraLabs/Supra-Mini-v6-1M` (referenciado, no incluido en este repositorio) |
| Tamano del repositorio | 0,0 GB según HuggingFace (los checkpoints no aparecen en el listado de tamano) |

## Arquitectura y entrenamiento

El bloque de cómputo de cada subcapa sigue una secuencia fija: extracción no lineal en un subespacio local de bajo rango (64 dimensiones), relleno con 64 ceros hasta 128, rotación mediante una permutación pseudoaleatoria fija `Π_l` que rompe la simetría diádica, multiplicación por la matriz de Sylvester-Hadamard de 128 (ortonormalizada, con `HᵀH = I` y `|H_ij| = 1/√128`) y suma lineal al flujo residual. La difusión de Hadamard preserva la norma L2 mientras reparte la energía de forma equiprobable entre las 128 coordenadas. Con 12 subespacios de actualización mutuamente incoherentes (permutaciones `{Π_1, …, Π_12}` generadas con semilla 2026), el acumulador residual cubre el espacio R^128 completo pese a que cada subcapa solo active 64 dimensiones.

La cabeza de decodificación implementa un filtro dinámico de Gram-Schmidt: `h_orth = h_final - g(h) ⊙ proj_{x_0}(h_final)`, donde `g(h) = sigmoid(W_gate @ h_final + b)`. La idea es descargar a las capas ocultas de aprender una interferencia destructiva contra el embedding de entrada, y evitar el colapso de repetición cuando la sintaxis requiere repetir tokens. Según la model card, el gate baja a valores aproximados de 0,18–0,25 en contextos con guiones, viñetas o saltos de línea, preservando el token original. La cabeza de salida está atada al embedding (`W_embedᵀ`).

El entrenamiento se realizó en un núcleo TPU v5e-1 con pérdida *hard cross-entropy*, salvo en los dos últimos checkpoints, que usan una mezcla `0.65 · OneHot + 0.35 · Top-5 Soft` (auto-destilación). El autor reporta cinco hitos: 10M tokens sobre TinyStories (loss 2,7381), 30M tokens sobre mezcla web (50% FineWeb, 30% Cosmo, 10% DCLM, 10% Tiny; loss 4,7582), 80M tokens sobre mezcla web general con annealing de `5e-4` a `5e-5`, 85M tokens con auto-destilación (caída abrupta de entropía de −0,85 nats) y 100M tokens con auto-destilación, punto que el autor describe como "punto fijo asintótico comprobado" con `ΔH ≈ −0,04` nats. No se documenta uso de RLHF ni DPO, ni se detalla la composición exacta del dataset de mezcla web más allá de esos porcentajes.

## Capacidades

- Generación de texto autoregresiva en dominios muy restringidos: el checkpoint de 10M tokens está entrenado sobre TinyStories y el de 30M sobre mezcla web, con vocabulario del tokenizer Supra-Mini-v6-1M.
- Modelado de sintaxis superficial y markdown: el checkpoint de 30M se describe explícitamente como competente en "dominio de sintaxis y markdown", plausible dado el peso de FineWeb en la mezcla.
- Repetición controlada de tokens: el gate de Gram-Schmidt está diseñado para permitir repeticiones legítimas (guiones, viñetas, saltos de línea) sin colapsar en bucles degenerativos.
- Instrumentación interpretable: la función `model.apply` devuelve `logits`, `gate_h`, `proj_x_in` y un cuarto valor no detallado, lo que permite analizar el valor del gate y la proyección por token.
- Razonamiento, matemáticas, código, visión, audio, tool calling, function calling, uso de agentes y capacidades multilingües: no disponibles / no documentadas. No hay evidencia en la model card de que el modelo soporte ninguna de estas capacidades, y con 812.800 parámetros y 256 tokens de contexto no es razonable asumirlas.

## Casos de uso

- Investigación en arquitecturas eficientes: reproducir el experimento completo (100M de tokens en menos de 7 minutos en TPU v5e-1) para validar o refutar la hipótesis de la difusión isométrica de Hadamard frente a un Transformer de referencia con el mismo presupuesto de parámetros.
- Estudio del *Residual Memory Burden*: instrumentar `gate_h` y `proj_x_in` en distintos corpus para medir empíricamente cuándo el modelo necesita preservar el embedding de entrada y cuándo lo sobrescribe.
- Experimentos de interpretabilidad sobre ortogonalidad: usar las 12 permutaciones y la matriz de Hadamard para analizar la distancia de Grassmann entre subespacios de actualización y su relación con la pérdida final.
- Docencia y prototipado en JAX/Flax: el modelo entrena y se sirve en minutos sobre hardware modesto, lo que lo convierte en un banco de pruebas realista para pipelines de Flax, serialización `.msgpack` y bucles de entrenamiento con `jax.jit`.
- Ablación de estrategias de decodificación: comparar cross-entropy dura contra auto-destilización `0.65 · OneHot + 0.35 · Top-5 Soft` usando los cinco checkpoints publicados como escalones de tokens acumulados.
- Generación de texto en dominios sintéticos o infantiles: el checkpoint de TinyStories es utilizable para completar narraciones cortas y simples en inglés dentro de la ventana de 256 tokens, como componente de demostraciones educativas.
- Benchmarking de throughput en aceleradores: usar el rango reportado de 186.000–246.000 tok/s en TPU v5e-1 como referencia para comparar el coste de transformadas de Hadamard frente a atención estándar en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos publicados son la perdida de entrenamiento, los tokens acumulados y el throughput por checkpoint:

| Checkpoint | Tokens acumulados | Corpus | Funcion de perdida | Perdida | Throughput |
|---|---|---|---|---|---|
| `supra_mini_tied_gs_params.msgpack` | 10M | TinyStories | Hard cross-entropy | 2,7381 | 246k tok/s |
| `supra_mini_20m_general_mix.msgpack` | 30M | Mezcla web (50% FineWeb, 30% Cosmo, 10% DCLM, 10% Tiny) | Hard cross-entropy | 4,7582 | 186k–246k tok/s (rango global) |
| `supra_mini_70m_general_mix.msgpack` | 80M | Mezcla web general | Hard CE con annealing 5e-4 → 5e-5 | no disponible (descrita como "estabilizada") | 186k–246k tok/s (rango global) |
| `supra_mini_75m_self_distill.msgpack` | 85M | Mezcla web general | 0,65 OneHot + 0,35 Top-5 Soft | caída de entropia de −0,85 nats | 186k–246k tok/s (rango global) |
| `supra_mini_90m_self_distill.msgpack` | 100M | Mezcla web general | 0,65 OneHot + 0,35 Top-5 Soft | ΔH ≈ −0,04 nats (punto fijo asintotico) | 186k–246k tok/s (rango global) |

Tiempo total de computo reportado: menos de 7 minutos para 100M de tokens de entrenamiento y evaluacion en un nucleo TPU v5e-1.

## Requisitos de hardware

- VRAM estimada para inferencia: con 812.800 parámetros, el peso en fp32 ocupa aproximadamente 3,25 MB y en fp16 aproximadamente 1,63 MB, más activaciones (batch × 256 × 128 en fp32). Cabe holgadamente en cualquier GPU consumer, en iGPU y en CPU.
- GPUs recomendadas: no se requiere ninguna GPU dedicada. El autor entrenó y evaluó en TPU v5e-1; cualquier RTX 3060 o superior, e incluso un portátil sin GPU discreta, es suficiente para inferencia.
- Cabe en GPU consumer: sí, en absolutamente todas las GPU consumer actuales y en la mayoría de sistemas embebidos con JAX.
- Opciones de despliegue: JAX + Flax con el módulo `modeling_supra_gs.py` referenciado en la model card, cargando pesos con `flax.serialization.from_bytes`. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM: no existen pesos GGUF ni safetensors, y la arquitectura incorpora operaciones (Hadamard, permutaciones, gate de Gram-Schmidt) que no forman parte de los grafos estándar de esos servidores.
- Latencia y throughput: 186.000–246.000 tokens/segundo en un núcleo TPU v5e-1. No se publican cifras de latencia por token ni throughput en GPU o CPU.

## Comparativa con modelos similares

La comparativa se limita a alternativas de escala equiparable o propósito similar (modelos diminutos de investigación y juguetes educativos). Los datos de terceros son los habitualmente públicos y pueden variar según la revisión del repositorio; no se dispone de cifras de benchmarks comparables publicadas por el autor de Supra-Mini.

| Modelo | Parametros | Contexto | Framework / formato | Licencia | Notas |
|---|---|---|---|---|---|
| jpllm/Research (Supra-Mini) | 0,81 M | 256 | JAX/Flax, `.msgpack` | Apache 2.0 | Arquitectura experimental con Hadamard y gate de Gram-Schmidt; sin benchmarks estandar |
| TinyStories (modelos de 1M–33M de roneneldan) | 1 M – 33 M | 512 aprox. | PyTorch / safetensors | MIT (segun el repositorio original) | Mismo corpus de entrenamiento en el checkpoint de 10M; referencia natural para comparar calidad en narrativa simple |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 | PyTorch / safetensors, GGUF comunitario | Apache 2.0 | Dos ordenes de magnitud mas grande; comparable solo como cota superior de calidad por parametro |
| GPT-2 small | 124 M | 1024 | PyTorch / safetensors | MIT | Referencia clasica de modelo pequeno; sin relacion con el corpus ni la arquitectura de Supra-Mini |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos y Supra-Mini.

## Limitaciones y advertencias

- Escala minima: 812.800 parametros y 256 tokens de contexto limitan severamente la coherencia a medio plazo, el seguimiento de instrucciones y cualquier tarea de razonamiento. No es apto para producción general.
- Idiomas: la model card no declara idiomas soportados. Los corpus dominantes (TinyStories, FineWeb, dclm-edu) son mayoritariamente en inglés, por lo que el comportamiento en castellano es impredecible.
- Sin benchmarks estandar: no hay evaluaciones de MMLU, HumanEval, GSM8K ni similares; cualquier afirmación de calidad relativa carece de respaldo publicado.
- Riesgo de alucinacion: no cuantificado. En modelos de este tamano entrenados con pocos cientos de millones de tokens, la generacion factual fiable no es esperable.
- Sesgos: no documentados. Los corpus de entrenamiento (FineWeb, dclm-edu, TinyStories) arrastran los sesgos propios de datos web filtrados, pero no se ha realizado ninguna evaluacion al respecto.
- Discrepancia en la documentacion: la model card describe 12 subcapas con subespacios incoherentes, mientras que el ejemplo de codigo instancia `num_layers=6`; previsiblemente 6 capas × 2 subcapas (atencion + FFN) = 12 subcapas, pero conviene verificarlo antes de reproducir el experimento.
- Dependencia del codigo del autor: los pesos `.msgpack` requieren `modeling_supra_gs.py`, `generate_hadamard_matrix` y `generate_sublayer_permutations` con la semilla correcta (2026). Sin ese codigo o con una semilla distinta, los pesos no son cargables.
- Tokenizer externo: se referencia `SupraLabs/Supra-Mini-v6-1M`, que no forma parte de este repositorio; si deja de estar disponible, los checkpoints quedan inutilizables tal cual.
- Metadatos inconsistentes en HuggingFace: el repositorio figura con 0,0 GB de tamano y 0 descargas, mientras que la model card describe cinco checkpoints en `checkpoints/`. Conviene comprobar la disponibilidad real de los ficheros antes de planificar cualquier uso.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin evaluaciones de seguridad ni de sesgo, no se recomienda su despliegue en entornos con usuarios finales.
- Los resultados de busqueda web asociados a esta consulta corresponden a material de J.P. Morgan sobre investigación en IA y no guardan relación con este modelo; no se ha utilizado ninguna informacion de esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jpllm/Research
- Tokenizer referenciado: https://huggingface.co/SupraLabs/Supra-Mini-v6-1M
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset dclm-edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
