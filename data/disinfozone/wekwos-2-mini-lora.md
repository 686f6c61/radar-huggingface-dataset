# disinfozone/wekwos-2-mini-lora

## Resumen

Wekwos-2-Mini LoRA es un adaptador PEFT de rango 32 publicado por el usuario disinfozone que especializa el modelo base thinkingmachines/Inkling-2-Mini en la generacion de texto en protoindoeuropeo (PIE), una lengua reconstruida sin hablantes nativos. El adaptador se distribuye como un unico fichero safetensors de 1,48 GB con 434 tensores en FP32 y se aplica sobre todas las capas del modelo base, incluyendo la cabeza de lenguaje.

El modelo resuelve un problema muy concreto de linguistica historica: producir formas y textos coherentes en una protolengua reconstruida siguiendo convenciones academicas. Segun la model card, el adaptador acumula una linaje de entrenamiento en tres fases (SFT hibrido con cadena de pensamiento durante 3 epocas, seguido de dos rondas de GRPO con 150 y 90 pasos) y alcanza 88,2 en modo estricto y 90,5 en modo laxo sobre el conjunto de evaluacion PIE Benchmark v2 de 607 elementos.

La relevancia actual es doble: por un lado demuestra un flujo de trabajo reproducible de adaptacion de bajo rango sobre un modelo base cuantizado en NVFP4 y MXFP8, con scripts incluidos para desquantizar, fusionar y exportar a MLX y GGUF; por otro, ejemplifica el uso de RL (GRPO) para tareas de dominio muy especializado donde los datos son escasos y la verificacion es costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE con bucle (inkling2_loop); rango 32, alpha 32, scale 1.0, all-linear |
| Parametros totales | Adaptador: 434 tensores FP32 en 1,48 GB; modelo base: no disponible en la informacion proporcionada |
| Parametros activos | No disponible (el modelo base es MoE con 128 expertos enrutados por capa, pero no se especifica el numero de activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); exportaciones del proyecto en BF16, MLX mixto (6/8 bits) y GGUF Q4_K_M a Q8_0 |
| Idiomas soportados | Protoindoeuropeo (etiqueta `ine`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el proyecto ofrece tambien BF16, MLX y GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32 y escala 1.0 aplicado de forma all-linear sobre las 24 capas del modelo base Inkling-2-Mini. Los objetivos incluyen las seis proyecciones de atencion (`wq_du`, `wk_dv`, `wv_dv`, `wo_ud`, `wr_du`, `gate_attn`), los 128 expertos enrutados de cada capa del MoE (`w1`, `w3`, `w2`) y la cabeza de lenguaje `lm_head`. En total son 193 tensores objetivo que, tras la fusion, dan lugar a un checkpoint BF16 puro de 53,4 GB; el adaptador almacena 434 tensores FP32.

El entrenamiento consta de tres etapas segun la model card: una fase de SFT hibrido con cadena de pensamiento durante 3 epocas, seguida de dos rondas de GRPO (150 pasos la v2 y 90 pasos la v3) sobre el corpus wekwos-corpus. El flujo de publicacion incluye scripts para desquantizar el modelo base (NVFP4 en capas 0-19, MXFP8 en 20-23) en FP32, fusionar el adaptador, eliminar los companions de cuantizacion y `hf_quant_config.json`, y escribir un checkpoint BF16 fragmentado que conserva la torre de vision y `mtp.safetensors`. Tambien se proporciona un exportador a MLX con precision mixta (expertos enrutados a 6 bits, atencion, embedding y cabeza LM a 8 bits, controladores de bucle, routers y torre de vision en BF16/FP32) y se documenta la conversion a GGUF mediante llama.cpp.

## Capacidades

- Generacion de texto en protoindoeuropeo reconstruido, con convenciones de notacion academica (laringales, sonantes silabicas, ablaut).
- Razonamiento con cadena de pensamiento hibrida, heredada de la fase de SFT.
- Generacion de texto en ingles como idioma de soporte.
- Capacidades multimodales heredadas del modelo base: la fusion conserva la torre de vision.
- Soporte de decodificacion especulativa mediante `mtp.safetensors` del modelo base (multi-token prediction), preservado en el proceso de fusion.
- Ajuste fino adicional posible: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuar entrenandose.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en linguistica historica: generar paradigmas verbales y nominales en PIE para contrastar hipotesis de reconstruccion, aprovechando el ajuste especifico sobre el benchmark PIE v2.
- Docencia universitaria: producir ejemplos de formas protoindoeuropeas con su cadena de razonamiento para explicar correspondencias foneticas en clase.
- Creacion de corpus sinteticos: generar grandes volumenes de texto en PIE etiquetado para entrenar o evaluar otros sistemas de procesamiento de lenguas historicas.
- Verificacion de etimologias: usar el modelo como asistente para proponer formas intermedias entre una raiz PIE y sus descendientes en lenguas indoeuropeas atestiguadas.
- Experimentacion metodologica: reproducir el pipeline SFT + GRPO sobre un modelo MoE cuantizado en NVFP4/MXFP8 como caso de estudio de adaptacion de bajo rango.
- Despliegue en Apple Silicon: exportar el modelo fusionado a MLX (23,0 GB) para inferencia local en estaciones de trabajo Mac con memoria unificada amplia.
- Integracion en pipelines de investigacion reproducibles: los scripts de fusion y exportacion permiten regenerar los checkpoints BF16 y MLX a partir del adaptador y del modelo base.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del PIE Benchmark v2 (607 elementos de retencion):

| Benchmark | Modo estricto | Modo laxo |
|---|---|---|
| PIE Benchmark v2 (607 items) | 88,2 | 90,5 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador solo: 1,48 GB adicionales sobre el modelo base.
- Checkpoint fusionado BF16: 53,4 GB en disco; requiere al menos 53,4 GB de VRAM o memoria unificada para inferencia en BF16.
- Build MLX para Apple Silicon: 23,0 GB; cabe en Mac con 32 GB de memoria unificada o superior.
- GGUFs disponibles de Q4_K_M a Q8_0 para llama.cpp; el tamano exacto por cuantizacion no se detalla en la informacion disponible.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano del checkpoint BF16 se necesita una GPU de 80 GB (A100/H100) o reparto multi-GPU.
- Opciones de despliegue: llama.cpp (GGUF), MLX (mlx-lm con soporte `inkling2_loop`), y el ecosistema Hugging Face/PEFT para el checkpoint BF16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo base thinkingmachines/Inkling-2-Mini seria el termino de comparacion natural, pero no se detallan sus especificaciones ni sus resultados en el benchmark PIE v2 sin el adaptador.

## Limitaciones y advertencias

- El protoindoeuropeo es una lengua reconstruida: no existe verdad de referencia absoluta, por lo que las salidas deben validarse contra la literatura academica.
- Riesgo de alucinacion en formas y etimologias plausibles pero incorrectas, especialmente fuera del dominio cubierto por el corpus de entrenamiento.
- El benchmark de evaluacion (607 elementos) es pequeno y especifico del proyecto; no garantiza generalizacion a otros subdominios del PIE.
- Cobertura linguistica limitada a PIE e ingles; no se documentan otros idiomas.
- Longitud de contexto no documentada; conviene verificar el limite efectivo del modelo base antes de usarlo en produccion.
- El adaptador depende de un modelo base con cuantizacion propietaria (NVFP4/MXFP8) y de scripts de fusion especificos; cualquier cambio en el modelo base puede romper la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/disinfozone/wekwos-2-mini-lora
- Modelo MLX listo para usar: https://huggingface.co/disinfozone/wekwos-2-mini
- Checkpoint BF16 completo: https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- GGUFs: https://huggingface.co/disinfozone/wekwos-2-mini-GGUF
- Corpus de entrenamiento: https://huggingface.co/datasets/disinfozone/wekwos-corpus
- Benchmark de retencion: https://github.com/davidtorcivia/wekwos-bench
- Sitio del proyecto: https://wekwos.com/model
