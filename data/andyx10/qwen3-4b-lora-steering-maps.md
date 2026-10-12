# andyx10/qwen3-4b-lora-steering-maps

## Resumen

`andyx10/qwen3-4b-lora-steering-maps` no es un modelo de lenguaje, sino un artefacto de interpretabilidad para Qwen3-4B. Contiene mapas lineales fijos y estadísticas del modelo base que permiten predecir, a partir únicamente de los pesos de un adaptador LoRA, el vector de steering de tipo diff-means que ese adaptador induce en el residual stream. Un vector diff-means se define como la media del cambio que un fine-tune introduce en la salida de un bloque `L`: `v_L = mean_t [h_L^finetuned(t) - h_L^base(t)]`.

El método descompone ese cambio por sitio de escritura al residual stream: `o_proj` y `down_proj` se aproximan por su escritura media ponderada por la activación de su vector de lectura sobre la entrada media del modelo base; `gate_proj` y `up_proj` mediante una aproximación de primer orden de la salida del MLP; y `v_proj` de forma exacta bajo el patrón de atención del modelo base. Cada constante se transporta hasta el bloque objetivo `L` multiplicándola por `M(s → L)`, el jacobiano medio de la salida del bloque `L` respecto a una constante añadida en el sitio `s`. Los adaptadores de `q_proj` y `k_proj` se omiten porque desactivarlos altera el vector medido como máximo 0,02 en coseno.

El resultado es una herramienta de *model diffing* y auditoría: permite estimar el efecto de un LoRA sobre las activaciones internas sin ejecutar el adaptador ni comparar inferencias. El repositorio ocupa 21,1 GB y está construido sobre `Qwen/Qwen3-4B` en la revisión `1cfa9a7208912126459214e8b04321603b3df60c`, usando los primeros documentos del stream de FineWeb. Es relevante para investigación en mecanicismo interpretability y para pipelines de evaluación de adaptadores, aunque su adopción es todavía nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de interpretabilidad compuesto por mapas lineales jacobianos `[2560, 2560]` y estadísticas de activaciones; el modelo base (Qwen3-4B) es un transformer decoder-only denso con GQA |
| Parametros totales | No aplica como modelo. El modelo base Qwen3-4B tiene aproximadamente 4.000 millones de parámetros. El artefacto almacena unos 8.730 millones de coeficientes float16 en los mapas y unos 1.790 millones en las pendientes del MLP (del orden de 10.500 millones en total, calculado a partir de las dimensiones descritas en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al artefacto. Los mapas se calcularon con secuencias de 30 tokens (posición 0 excluida, media en posiciones 1-29); las estadísticas, sobre 7.424 posiciones. El modelo base Qwen3-4B declara 32.768 tokens de contexto nativo, ampliables con YaRN según su documentación pública |
| Tipos de cuantizacion | Ninguno. Los ficheros se distribuyen en float16 (mapas y pendientes MLP) y float32 (estadísticas). No hay variantes cuantizadas |
| Idiomas soportados | No aplica: el artefacto no genera texto. Las estadísticas y los mapas se calcularon sobre documentos en inglés de FineWeb |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16 y float32) más ficheros JSON (`manifest.json`, `summary.json`) |
| Modelo base | Qwen/Qwen3-4B, revisión `1cfa9a7208912126459214e8b04321603b3df60c` |
| Tamano del repositorio | 21,1 GB |
| Ficheros de mapas | 36 ficheros `maps/block_LL.safetensors` (17,5 GB en total); para el bloque objetivo `L`, una matriz float16 `[2560, 2560]` por cada sitio de escritura (`o_proj`, `down_proj`) en bloques `≤ L` |
| Ficheros de estadisticas | `stats/mean_inputs.safetensors` (float32), `stats/mlp_slope.safetensors` (3,6 GB, float16, `[9728, 2560]` por bloque), `stats/attn_mixed.safetensors` (float32, `[32 cabezas de consulta, 2560]` por bloque) |
| Autor | andyx10 |
| Fecha de publicacion | 2026-10-11 (creado); 2026-10-11 (actualizado) |
| Descargas / likes | 0 / 0 |
| Etiquetas | interpretability, lora, steering-vectors, model-diffing, jacobian |

## Arquitectura y entrenamiento

El artefacto no se entrena: sus matrices se calculan una sola vez sobre el modelo base congelado. Para cada sitio de escritura se define una constante que aproxima la contribución media del adaptador. En `o_proj` y `down_proj` se usa la escritura media `a (b · μ) / r`, donde `μ` es la entrada media del módulo en el modelo base y `r` el rango del LoRA, de modo que la escritura queda ponderada por cuánto dispara su vector de lectura sobre esa entrada media. En `gate_proj` y `up_proj` se aplica una expansión de primer orden de la salida del MLP, que solo requiere dos matrices fijas por bloque (`S_g`, pendiente local del MLP por su entrada, y `S_u`); el resultado se suma en el sitio de `down_proj`. En `v_proj` el cálculo es exacto bajo el patrón de atención del modelo base y se añade en el sitio de `o_proj`. Los adaptadores de `q_proj` y `k_proj` se descartan por su contribución marginal (≤ 0,02 de coseno al desactivarlos).

El transporte de cada constante hasta el bloque objetivo se realiza con `M(s → L)`, el jacobiano medio de la salida del bloque `L` respecto a una constante añadida en el sitio `s`. El autor lo describe como el límite de pequeña perturbación de ajustar un mapa lineal sobre efectos de adaptador sintéticos aleatorios; cuando el único objetivo es el último bloque, equivale a una lente jacobiana, pero aquí todos los bloques son objetivo. Los datos de calibración proceden de los primeros documentos del stream de FineWeb: 64 documentos para los mapas (media sobre posiciones 1-29 de secuencias de 30 tokens) y 256 documentos, es decir 7.424 posiciones, para las estadísticas. No se emplearon RLHF, DPO ni ningún otro ajuste por preferencias; el objeto de estudio son adaptadores LoRA de terceros con la convención `delta(x) = (x @ b) @ a / r`, donde para PEFT `b = lora_A.weight.T` y `a = lora_B.weight.T * (lora_alpha / r) * r`.

## Capacidades

- Predicción del vector de steering diff-means en la salida de cualquier bloque (0-35) a partir exclusivamente de los pesos del adaptador LoRA, sin ejecutar el adaptador ni realizar comparaciones de inferencia.
- Descomposición del efecto del adaptador por sitio de escritura al residual stream (`o_proj` y `down_proj`), lo que permite atribuir el cambio a módulos concretos.
- Transporte del efecto de un sitio `s` a un bloque objetivo `L` mediante mapas jacobianos precalculados, con soporte para los 36 bloques del modelo.
- Model diffing: cuantificación de la diferencia funcional entre un modelo base y su versión ajustada en el espacio de activaciones, no en el espacio de pesos.
- Auditoría de adaptadores: estimación del desplazamiento del residual stream inducido por un LoRA de origen desconocido antes de desplegarlo.
- Compatibilidad con la convención estándar de PEFT LoRA para `lora_A`, `lora_B` y `lora_alpha`.
- API programática en Python mediante `safetensors` y `huggingface_hub`, con función de ejemplo `site_constants` y `predict`.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades multilingües, de visión ni de audio: es un artefacto de análisis.

## Casos de uso

- Auditoría previa al despliegue de adaptadores LoRA: dado un adaptador de procedencia externa, se calcula su vector de steering previsto y se compara con el de adaptadores conocidos para detectar cambios de comportamiento anómalos antes de servirlo en producción.
- Selección de la capa objetivo para técnicas de steering: como los mapas cubren los 36 bloques, se puede estimar en qué profundidad el efecto del adaptador es mayor y elegir esa capa para intervenciones posteriores.
- Model diffing y análisis de contribuciones: la descomposición por sitio de escritura permite determinar si un fine-tune actúa principalmente sobre la ruta de atención (`o_proj`, `v_proj`) o sobre el MLP (`gate_proj`, `up_proj`, `down_proj`).
- Investigación en interpretabilidad mecanicista: sirve como banco de pruebas reproducible para estudiar si los efectos de un LoRA son lineales y aditivos en el residual stream, comparando la predicción con la medición real.
- Optimización de pipelines de evaluación de adaptadores: al no requerir ejecutar el adaptador ni generar texto, la predicción es mucho más barata que medir el vector diff-means con inferencias emparejadas sobre un corpus.
- Control de calidad en CI/CD de fine-tuning: integrando `predict()` en el pipeline, cada nuevo LoRA puede superar un umbral de similitud estructural respecto a adaptadores de referencia antes de publicarse.
- Reproducibilidad de experimentos de steering: los mapas fijos y las estadísticas permiten que terceros reproduzcan el mismo cálculo sin recalibrar sobre el modelo base.
- Estudio de la relación entre el rango del LoRA y su impacto efectivo: variando `r` y el módulo objetivo se puede medir cómo cambia la constante predicha en cada sitio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K en la información disponible, ya que el artefacto no es un modelo generativo. El repositorio sí documenta métricas de fidelidad del método:

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno entre el vector predicho y el medido | 0,99 | Comprobado contra el pipeline de evaluación en un único "organismo" (adaptador) |
| Cambio maximo en el vector medido al desactivar adaptadores de `q_proj` / `k_proj` | ≤ 0,02 en coseno | Medición sobre el modelo base |
| Documentos de calibracion de los mapas | 64 documentos de FineWeb | 30 tokens por documento, posicion 0 excluida, media en posiciones 1-29 |
| Documentos de calibracion de las estadisticas | 256 documentos (7.424 posiciones) | FineWeb |

No hay datos publicados de throughput, latencia ni precisión agregada sobre múltiples adaptadores; el valor 0,99 corresponde a un solo caso verificado.

## Requisitos de hardware

- Disco: 21,1 GB para el repositorio completo. No es necesario cargarlo entero en memoria: basta con descargar el fichero de mapas del bloque objetivo y los tres ficheros de estadísticas.
- Memoria para las estadísticas: `mlp_slope.safetensors` pesa 3,6 GB en float16; `mean_inputs` y `attn_mixed` son de pocos megabytes. Cargar las pendientes en float32 supone unos 7,2 GB de RAM.
- Memoria para los mapas: cada matriz `[2560, 2560]` ocupa 13,1 MB en float16 y 26,2 MB en float32. Un fichero de bloque contiene `2 × (L+1)` matrices: aproximadamente 26,2 MB para `block_00` y 943,7 MB para `block_35`. Convertidos a float32 para el producto matricial (como hace el código de ejemplo), el bloque 35 requiere unos 1,9 GB.
- Pesos del modelo base: Qwen3-4B en bfloat16 ocupa aproximadamente 8 GB. El código de ejemplo solo necesita los tensores de `o_proj` y `down_proj` de cada capa, no una pasada forward completa, aunque `from_pretrained` carga el modelo entero.
- VRAM estimada: unos 8-9 GB para el modelo base en bfloat16 más 1-2 GB para el bloque de mapas de mayor tamaño y las estadísticas. Un total práctico de 12-16 GB permite ejecutar el flujo completo.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090. Cabe en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090, RTX 5090); en GPUs de 8-12 GB habría que cargar el modelo base en 8 bits o procesar bloque a bloque.
- CPU: viable. Los productos matriciales son pequeños (`[2560, 2560]` por vector) y pueden ejecutarse en CPU con 12-16 GB de RAM para el bloque objetivo, aunque las pendientes MLP en float32 exigen más memoria.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo. El despliegue se limita a PyTorch con `safetensors` y `huggingface_hub`, integrándolo como biblioteca dentro de un script de análisis o de un pipeline de CI.
- Latencia y throughput: no disponibles. El cálculo consiste en multiplicaciones matriz-vector de tamaño `2560 × 2560` acumuladas sobre los sitios de escritura, más la preparación de constantes por bloque; el coste dominante es la carga del modelo base y de las estadísticas.

## Comparativa con modelos similares

No existe una categoría estándar de artefactos equivalentes, por lo que la comparación se hace contra el modelo base y contra adaptadores LoRA convencionales de Qwen3-4B.

| Elemento | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| andyx10/qwen3-4b-lora-steering-maps | Mapas jacobianos y estadísticas para predicción de steering vectors | No aplica (~10.500 millones de coeficientes almacenados) | No aplica (calibrado con secuencias de 30 tokens) | Coseno 0,99 frente al vector medido en un adaptador | no disponible | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3-4B | Transformer decoder-only denso, modelo base | ~4.000 millones | 32.768 tokens nativos (ampliable con YaRN según su documentación) | Benchmarks públicos en su propia model card | Apache 2.0 (según su ficha pública) | Ampliamente distribuido en HuggingFace |
| yokobo-ai/qwen3-4b-agent-trajectory-lora-v1 | Adaptador LoRA para Qwen3-4B orientado a trayectorias de agente | No disponible | Hereda el del modelo base | No disponible | No disponible | Repositorio HuggingFace |
| Bibliotecas genéricas de steering vectors (por ejemplo, implementaciones de diff-means o de intervenciones sobre activaciones) | Herramientas de propósito general | No aplica | No aplica | No disponible | Variable según la herramienta | Ecosistema Python |

La diferencia principal frente a un adaptador LoRA es que este artefacto no modifica el modelo ni genera salidas: describe el efecto de otros adaptadores. Frente a las bibliotecas genéricas de steering, su ventaja es que los mapas y estadísticas están precalculados específicamente para Qwen3-4B en una revisión concreta, lo que evita recalibrar.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución. Conviene contactar con el autor antes de integrarlo en un producto.
- Dependencia estricta del modelo base: los mapas solo son válidos para `Qwen/Qwen3-4B` en la revisión `1cfa9a7208912126459214e8b04321603b3df60c`. Cualquier otro tamaño, variante o revisión de Qwen3 invalida los resultados.
- Cobertura limitada: no cubre adaptadores en `q_proj` ni `k_proj`. Según el autor, desactivarlos cambia el vector medido como máximo 0,02 en coseno, pero esa cota procede de la misma metodología que se está evaluando.
- Aproximaciones internas: `gate_proj` y `up_proj` se tratan con una expansión de primer orden; `o_proj` y `down_proj` con una escritura media. Los efectos no lineales de adaptadores entrenados con objetivos alejados del texto corriente no quedan capturados.
- Validación escasa: el coseno de 0,99 se verificó en un único "organismo" (un solo adaptador). No hay evidencia publicada de generalización a otros LoRA, rangos, datasets o tareas.
- Sesgo de calibración: las estadísticas se calcularon sobre los primeros documentos del stream de FineWeb, en inglés y con secuencias de 30 tokens sin la posición 0. Dominios o idiomas distintos pueden degradar la predicción, y el artefacto no declara soporte multilingüe.
- Convención de adaptadores obligatoria: la predicción asume `delta(x) = (x @ b) @ a / r` con `b = lora_A.weight.T` y `a = lora_B.weight.T * (lora_alpha / r) * r`. Otras convenciones de escalado producen resultados incorrectos.
- El artefacto no genera texto y no puede usarse como modelo: cualquier expectativa de inferencia, tool calling o razonamiento es inaplicable.
- Riesgo de interpretación errónea: un vector de steering previsto describe un desplazamiento medio en el residual stream, no una garantía de cambio de comportamiento. La relación entre ese desplazamiento y las capacidades observables del adaptador no está establecida en la documentación.
- Sin mantenimiento conocido: 0 descargas y 0 likes en el momento de la consulta, sin historial de actualizaciones posterior a la fecha de creación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andyx10/qwen3-4b-lora-steering-maps
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Revision del modelo base usada por los mapas: `1cfa9a7208912126459214e8b04321603b3df60c`
- Adaptador LoRA de Qwen3-4B para trayectorias de agente (referencia comparativa): https://huggingface.co/yokobo-ai/qwen3-4b-agent-trajectory-lora-v1
- Tutorial de fine-tuning completo de Qwen3-4B en una H100 (Azure Databricks): https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
- Notas sobre steering en modelos Qwen3, incluida la profundidad óptima por capa: https://omar.bet/2026/01/17/What-I-Learned-Steering-Qwen3-Models/
- Guía de fine-tuning de Qwen3-4B con LoRA y despliegue local con llama.cpp: https://layerx.xyz/blog/fine-tuning-small-llm-customer-support
