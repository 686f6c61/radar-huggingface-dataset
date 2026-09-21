# nkkbr/Mini-K3-1H-kda-kernel-8-v2_D

## Resumen

Mini-K3-1H-kda-kernel-8-v2_D es un checkpoint de preentrenamiento de la familia Mini-K3-1H v2, publicada por el usuario nkkbr en HuggingFace. Se trata de un modelo de lenguaje decoder-only de aproximadamente 1.017 millones de parametros logicos, construido como proxy a escala reducida de la arquitectura Kimi-K3 para realizar comparaciones controladas de diseno. Conserva los operadores KDA (atencion linear con decaimiento) y Gated MLA (atencion latente con puerta de salida) de Kimi-K3, ademas de residuales de atencion por bloques, mezcla de expertos Stable LatentMoE, activaciones SiTU y Quantile Balancing en el enrutador. La variante concreta de este repositorio es la "kda-kernel-8", que fija la profundidad del kernel de convolucion causal depthwise de KDA en 8.

El modelo pertenece a un experimento de 20 arquitecturas comparadas bajo un esquema de inicializacion determinista con semilla base 20260914, donde los parametros con el mismo nombre y forma arrancan identicos byte a byte entre variantes. Esto permite atribuir las diferencias de rendimiento exclusivamente al cambio arquitectonico aislado. Los pesos se distribuyen en formato safetensors con codigo de modelado propio en PyTorch.

Es relevante ahora porque forma parte de una linea de investigacion sobre alternativas a la atencion softmax tradicional (linear attention, MoE de grano fino) en un momento en que estos disenos se estan llevando a escala de produccion. Ahora bien, la revision descrita en la model card corresponde al tag `checkpoint-tokens-000000000000-init`, es decir, al estado de inicializacion: cero objetivos de next-token consumidos y cero pasos de optimizador, por lo que no es un modelo funcional para generacion de texto util.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 13 capas (9 KDA de atencion linear + 4 Gated MLA), con MoE en las capas posteriores a la primera densa |
| Parametros totales | 1.016.946.412 |
| Parametros activos | 353.722.092 por token (MoE con 64 expertos enrutados + 2 compartidos, top-4) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento declarada) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` y codigo de modelado propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Ancho oculto / cabezas de atencion / ancho de cabeza KDA | 1024 / 12 / 128 |
| Kernel de convolucion causal depthwise en KDA | 8 |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Modo posicional de MLA | NoPE (sin codificacion posicional explicita) |
| Capas KDA | indices 1, 2, 3, 5, 6, 7, 9, 10, 11 |
| Capas Gated MLA | indices 4, 8, 12, 13 |
| Ancho oculto de experto enrutado | 512 |
| Tamano de bloque de residuales de atencion | 4 |
| Vocabulario / BOS / EOS de generacion / PAD | 163840 / 163584 / 163586 / 163839 |
| Precision de parametros | BF16, con estado de control de decaimiento KDA, convolucion, normalizacion y enrutador en FP32 |
| Revision actual | `checkpoint-tokens-000000000000-init` (0 tokens validos, 0 pasos de optimizador) |
| Objetivo de entrenamiento final | tag `checkpoint-tokens-016000000000-final` tras 16.000.000.000 objetivos de perdida validos |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer hibrido de 13 capas que alterna dos mecanismos de atencion: KDA, un esquema de atencion linear con decaimiento por cabeza y convolucion causal depthwise de kernel 8, y Gated MLA, una atencion latente multi-cabeza con modo posicional NoPE y puerta de salida activada. La primera capa es densa y las restantes incorporan Stable LatentMoE con 64 expertos enrutados y 2 compartidos, seleccionando 4 expertos por token y combinando con anchura oculta de 512 por experto. Ademas, la red aplica residuales de atencion por bloques de tamano 4 y activaciones SiTU.

Respecto al entrenamiento, la receta documentada incluye Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de parametros matriciales y AdamW como respaldo para vectores y embeddings, con weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1% de warmup lineal y Quantile Balancing en linea con histograma de 1000 bins. El enrutador selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. No se realizo post-entrenamiento (ni RLHF ni DPO). Los documentos se empaquetan con aislamiento estricto: MLA usa mascara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de convolucion corta Q/K/V en cada frontera de segmento. Cada checkpoint numerado es un tag Git inmutable, y todos los runs consumen la misma secuencia de mezcla de datos, append-only e inmutable. La revision publicada en `main` corresponde al punto de partida sin entrenamiento, por lo que no refleja ningun aprendizaje.

## Capacidades

- Generacion de texto autoregresiva: capacidad teorica derivada de la tarea de modelado de lenguaje, no verificada en la revision actual.
- Razonamiento, codigo y matematicas: no disponible; el modelo no ha sido evaluado en tareas downstream.
- Tool calling / function calling: no soportado de forma nativa ni documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el vocabulario de 163840 entradas sugiere cobertura amplia, pero no hay idiomas declarados.
- Modo de pensamiento (thinking mode): no implementado.
- Vision o audio: no; el modelo es explicitamente text-only.
- Capacidades especiales: ninguna declarada mas alla de servir como banco de pruebas de ablaciones arquitectonicas y de exponer un enrutado MoE con Quantile Balancing observable.
- Aislamiento de documentos en atencion e inferencia recurrente, util para experimentos sobre como tratar contextos largos empaquetados.

## Casos de uso

- Reproducibilidad de ablaciones arquitectonicas: la inicializacion determinista con semilla base 20260914 y nombres/formas canonicos permite que los parametros compartidos entre dos de las 20 variantes empiecen identicos byte a byte. Este checkpoint sirve como punto cero verificable para comprobar que una replica del experimento parte del mismo estado.
- Validacion de pipelines de entrenamiento: con 0 pasos de optimizador y 0 tokens consumidos, el tag `init` es util para hacer smoke tests de carga de pesos, calculo de perdida, empaquetado de documentos y reinicio de estado recurrente en fronteras de segmento sin contaminar una ejecucion real.
- Estudio de eficiencia de atencion linear frente a atencion latente: comparar la variante kernel-8 con otras del mismo barrido (cambios en la proporcion KDA/MLA, granularidad de decaimiento, longitud de convolucion o codificacion posicional) permite medir el efecto de cada decision en perdida de validacion a 8K de longitud.
- Investigacion sobre enrutado de mezcla de expertos: la combinacion de puntuaciones sesgadas para seleccionar y sigmoideas renormalizadas para combinar, junto con Quantile Balancing en linea, constituye un banco de pruebas para estudiar equilibrio de carga y colapso de expertos a escala de 64 expertos enrutados.
- Analisis de kernels de convolucion depthwise: la profundidad de kernel fijada en 8 y los 128 grupos de decaimiento por cabeza permiten medir coste y calidad de estado recurrente en implementaciones CUDA propias.
- Punto de partida para preentrenamiento continuado o fine-tuning: los tags numerados son inmutables, de modo que el tag final tras 16.000 millones de tokens puede usarse como base para ajuste supervisado o DPO en investigacion academica.
- Diagnostico de estabilidad de optimizadores hibridos: la combinacion de Muon por cabeza, Muon general y respaldo AdamW con QK-Clip es replicable desde cero con este checkpoint para estudiar divergencias tempranas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint intermedio de investigacion que no ha sido evaluado en tareas downstream, y que la perdida de validacion (NLL) y la perplejidad se registran en W&B y en el JSONL de metricas del run, pero sin cifras publicadas en el repositorio. No se dispone, por tanto, de valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,0 GB solo para pesos (1.016.946.412 parametros x 2 bytes), mas cache de activaciones y estado recurrente. El repositorio ocupa 2,0 GB.
- VRAM estimada en FP32: aproximadamente 4,1 GB para pesos. Las estimaciones de INT8 (~1,0 GB) e INT4 (~0,5 GB) son teoricas, ya que no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 en inferencia single-stream. Una RTX 4090, RTX 3090, L40S, A100 o H100 sobran para este tamano; el modelo cabe comodamente en GPU de consumo.
- Coste de computo por token: con 353.722.092 parametros activos, el regimen de FLOPs se aproxima al de un modelo denso de ~350M, aunque el estado recurrente de KDA y la convolucion depthwise anaden coste secuencial no paralelizable.
- Opciones de despliegue: al usar una arquitectura propia definida por `modeling_mini_k3.py` y `configuration_mini_k3.py`, no hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, y no existen pesos GGUF. El despliegue requiere el codigo incluido en el repositorio; el autor menciona `initialize_model.py` y `smoke_test.py` para uso local.
- Entrenamiento: el autor referencia un "hardware benchmark choice" en los manifiestos JSON, pero no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existen modelos estrictamente comparables, porque Mini-K3-1H v2 es un proxy de investigacion con una arquitectura hibrida KDA + Gated MLA poco habitual. La tabla siguiente contrasta caracteristicas estructurales basicas con modelos densos de tamano parecido; los datos de estos ultimos provienen de sus fichas publicas y no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mini-K3-1H-kda-kernel-8-v2_D | 1,017 MM totales / 353,7 MM activos (MoE) | 8.192 | no disponible | safetensors con codigo propio, sin soporte en runtimes estandar |
| Llama 3.2 1B | ~1,24 MM densos | 128.000 | Llama Community License | safetensors, amplio soporte (vLLM, llama.cpp, Ollama) |
| Qwen2.5 1.5B | ~1,54 MM densos | 32.768 (ampliable) | Apache 2.0 | safetensors, amplio soporte |
| TinyLlama 1.1B | ~1,1 MM densos | 2.048 | Apache 2.0 | safetensors y GGUF, amplio soporte |

La comparacion de rendimiento no es posible: Mini-K3-1H v2 no publica resultados de benchmarks y la revision disponible esta en estado de inicializacion, mientras que los modelos de contraste son modelos post-entrenados y evaluados.

## Limitaciones y advertencias

- Estado sin entrenar: la revision accesible corresponde al tag `init`, con 0 tokens consumidos y 0 pasos de optimizador. Las salidas seran esencialmente aleatorias y no deben interpretarse como texto coherente.
- No es un asistente: no ha recibido instruccion ni post-entrenamiento (sin SFT, RLHF ni DPO), por lo que no sigue instrucciones.
- Sesgos: no documentados, pero al ser un modelo en estado de inicializacion no hay analisis de sesgo posible; en la version final dependerian del corpus de preentrenamiento.
- Alucinacion: riesgo no evaluado. La model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Limitaciones de contexto: 8.192 tokens de longitud de secuencia en entrenamiento; sin datos sobre extrapolacion con RoPE o YaRN (MLA usa NoPE, lo que complica la extension posicional).
- Idiomas: no declarados. Cualquier afirmacion sobre cobertura multilingue es especulativa.
- Licencia: no disponible. No se puede asumir uso comercial sin confirmacion explicita del autor, y menos aun porque los datasets de origen conservan sus propias licencias y no se redistribuyen.
- Estado del optimizador deliberadamente no publicado, lo que impide reanudar el entrenamiento exactamente desde cualquier checkpoint.
- Extrapolacion cientifica: el propio autor advierte de que las conclusiones sobre ranking de arquitecturas a esta escala y con 8K de longitud requieren confirmacion antes de extrapolarse a Kimi-K3 completo.
- Produccion: no apto. Es un artefacto de investigacion sin soporte en librerias estandar de servido, sin cuantizaciones y sin evaluaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-kda-kernel-8-v2_D
- Archivos internos del repositorio citados en la model card: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `config.json`, `model.safetensors`, manifiestos JSON de configuracion y metricas JSONL del run.
- Metricas de entrenamiento: registradas por el autor en Weights & Biases (no se proporciona URL concreta en la informacion disponible).
- La busqueda web realizada no devolvio ningun resultado relevante: los enlaces recuperados pertenecen a un sitio de streaming de animacion en persa y no guardan relacion con el modelo, su paper ni su repositorio de experimentos. No se dispone de enlaces a paper, blog tecnico, repositorio de codigo de entrenamiento ni demo.
