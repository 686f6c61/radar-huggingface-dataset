# Lucasgitguy-co/Xiaomi-OCR-0-CORD-MLX-LoRA

## Resumen

Xiaomi-OCR-0-CORD-MLX-LoRA es un adaptador LoRA experimental publicado por el usuario Lucasgitguy-co sobre el modelo base Xiaomi-OCR-0 de Xiaomi Research. Su proposito es mapear imagenes de tickets y recibos a JSON estructurado siguiendo el esquema del dataset CORD v2 de NAVER CLOVA. Se distribuye en formato MLX de 4 bits para ejecucion en Apple Silicon mediante la libreria mlx-vlm, no como un checkpoint Transformers autonomo ni como un adaptador PEFT estandar.

El modelo base Xiaomi-OCR-0 es un modelo vision-lenguaje unificado de aproximadamente 0.8-0.9B parametros orientado al parseo de documentos y a la comprension OCR. Segun la informacion publica, parte de Qwen3.5-0.8B y se entrena sobre un corpus centrado en OCR de unos 170M de muestras, con tecnicas de anclaje de texto Q-Mask, preentrenamiento continuado (CPT) y aprendizaje por refuerzo multitarea (Mix-RL). Este adaptador concreto anade un ajuste fino supervisado especifico para extraccion de campos de recibos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada en el repositorio del adaptador y sin resultados de evaluacion publicados en la informacion disponible. Resulta util como referencia de receta de ajuste fino (LoRA rango 8, alpha 16, congelacion de pesos base y vision, perdida solo en el turno del asistente) para tareas de extraccion estructurada sobre MLX, pero no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo vision-lenguaje (base Xiaomi-OCR-0, derivado de Qwen3.5-0.8B) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 0.9B (0.8B en la descripcion del repositorio GitHub) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el filtrado de entrenamiento excluye ejemplos de mas de 1.536 tokens procesados |
| Tipos de cuantizacion | Base MLX de 4 bits segun la model card; no se detallan otras variantes |
| Idiomas soportados | No disponibles (el dataset CORD v2 es predominantemente en ingles) |
| Licencia | No disponible para el adaptador; el modelo base se publica bajo Apache 2.0 y el dataset CORD v2 bajo CC BY 4.0 |
| Formato de pesos | weights.safetensors (formato MLX) con adapter_config.json asociado; no es formato PEFT |
| Rango LoRA | 8 (alpha 16) |
| Resolucion de imagen | Lado maximo de 640 pixeles |
| Libreria | mlx-vlm |
| Tamano del repo | 0.0 GB (sin pesos visibles en el momento de la consulta) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo vision-lenguaje transformer que combina un codificador visual con un decodificador de lenguaje; el modelo base Xiaomi-OCR-0 se describe como un VLM unificado de 0.8-0.9B parametros entrenado con un corpus de aproximadamente 170M muestras centradas en OCR, mediante anclaje de texto Q-Mask, preentrenamiento continuado y RL multitarea. El adaptador en si es un LoRA de rango 8 y alpha 16 que congela tanto los pesos del modelo base como los del codificador visual, y entrena unicamente las proyecciones de bajo rango sobre la perdida del turno del asistente (supervised assistant-only loss).

La receta de entrenamiento declara learning rate 5e-5, tamano de batch 1, acumulacion de gradiente de 8 y hasta dos pasadas sobre la particion de entrenamiento preparada. Las imagenes se redimensionan a un lado maximo de 640 pixeles y se descartan por completo los ejemplos que superan los 1.536 tokens procesados. Los datos provienen de CORD v2 (naver-clova-ix/cord-v2), con las anotaciones `gt_parse` convertidas a objetivos JSON para el asistente y manteniendo separadas las particiones oficiales de entrenamiento, validacion y test. El repositorio incluye ficheros de trazabilidad como `preparation.json` (tamanos de las particiones retenidas), `train.json` (configuracion), `requirements-lock.txt` (entorno instalado) y `selected_checkpoint.txt` (checkpoint seleccionado para publicacion). No se documenta ninguna innovacion arquitectonica propia del adaptador mas alla del ajuste LoRA.

## Capacidades

- Extraccion estructurada de informacion: convierte imagenes de recibos en JSON con los campos definidos por el esquema `gt_parse` de CORD v2.
- Comprension de documentos con OCR: hereda del modelo base la capacidad de leer texto en imagenes y relacionarlo con una estructura de salida.
- Generacion de JSON como objetivo del asistente: el adaptador esta entrenado especificamente para producir respuestas JSON en el turno del asistente.
- Ejecucion en Apple Silicon mediante MLX y mlx-vlm, con base cuantizada a 4 bits.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multipaso.
- No se documenta modo thinking, audio ni otras modalidades mas alla de imagen y texto.
- Capacidades multilingues: no disponibles; el dataset de ajuste es CORD v2, predominantemente en ingles.
- Capacidad general de OCR: la model card advierte explicitamente que los resultados no establecen una mejora del OCR general.

## Casos de uso

- Digitalizacion de tickets de compra en prototipos locales: el adaptador transforma una fotografia de recibo en JSON con campos de linea de producto, subtotal, impuestos y total, ejecutandose en un Mac con MLX sin necesidad de GPU dedicada.
- Experimentacion con ajuste fino LoRA sobre MLX: sirve como receta reproducible (rango 8, alpha 16, congelacion de base y vision, perdida solo en asistente) para equipos que quieran adaptar Xiaomi-OCR-0 a otros esquemas de extraccion.
- Pruebas de concepto de contabilidad automatizada: a partir de los JSON generados se pueden alimentar pipelines de conciliacion de gastos, siempre con validacion humana dado el riesgo de campos ausentes o alucinados.
- Evaluacion comparativa de extraccion de recibos: los ficheros `baseline.json`, `quantized-baseline.json` y `finetuned.json` permiten medir la diferencia entre el modelo base y el adaptador sobre el subconjunto de test filtrado.
- Investigacion sobre cuantizacion 4-bit en tareas de OCR estructurado: el adaptador permite estudiar como afecta la cuantizacion MLX a la precision de extraccion de campos frente a la linea base sin cuantizar.
- Educacion y demostraciones: util para mostrar en un portatil Apple Silicon el flujo completo de un VLM de documentos con LoRA, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ficheros de evaluacion (`baseline.json`, `quantized-baseline.json`, `finetuned.json`) y advierte que las metricas cubren el subconjunto de test redimensionado y filtrado por longitud, no el benchmark oficial completo de CORD, y que no se reclama ninguna mejora por adelantado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base de 0.8-0.9B cuantizado a 4 bits en MLX, la huella es reducida y cabe holgadamente en memoria unificada de equipos Apple Silicon.
- GPU recomendadas: el adaptador esta disenado para Apple Silicon mediante MLX; no se documenta soporte para GPU NVIDIA en este repositorio.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon; no se confirma compatibilidad con GPUs de consumo NVIDIA para este artefacto concreto.
- Opciones de despliegue: mlx-vlm con `prepare_model_for_training` y carga de `weights.safetensors`; no se documenta vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-CORD-MLX-LoRA | Base 0.9B + LoRA r8 | No disponible | Extraccion de recibos CORD en MLX | No disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| Xiaomi-OCR-0 (base) | 0.9B | No disponible | VLM unificado para OCR y documentos | Apache 2.0 | Hugging Face y GitHub |
| Donut (referencia CORD) | No disponible en la informacion | No disponible | Modelo OCR end-to-end sin OCR externo | No disponible en la informacion | No disponible en la informacion |

La comparacion con alternativas especificas de extraccion de recibos no esta disponible en la informacion proporcionada; solo se confirma el modelo base y la referencia al dataset CORD v2.

## Limitaciones y advertencias

- El adaptador no es autonomo: requiere el modelo base Xiaomi-OCR-0 y mlx-vlm, y no funciona como checkpoint Transformers ni como adaptador PEFT estandar.
- El repositorio declara 0.0 GB de tamano y cero descargas; los pesos pueden no estar disponibles o no haberse subido correctamente en el momento de la consulta.
- La licencia del adaptador no esta declarada, lo que impide confirmar condiciones de uso comercial; el modelo base es Apache 2.0 y el dataset CORD v2 es CC BY 4.0.
- Riesgo de alucinacion: la model card advierte que pueden faltar campos JSON o inventarse.
- La resolucion maxima de 640 pixeles puede hacer ilegible el texto pequeno, con perdida de precision en recibos densos.
- El filtrado por longitud excluye ejemplos de mas de 1.536 tokens procesados, por lo que el adaptador no se ha entrenado con recibos largos.
- Se desconoce el solapamiento entre el preentrenamiento del modelo base y CORD, lo que puede inflar las metricas.
- Las evaluaciones cubren un subconjunto filtrado, no el benchmark oficial completo de CORD, y no demuestran mejora en OCR general.
- No hay datos publicados sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de recibos.
- Para produccion se recomienda validacion humana de la salida JSON y pruebas propias de robustez antes de cualquier integracion.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-CORD-MLX-LoRA
- Modelo base Xiaomi-OCR-0 en Hugging Face: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Repositorio GitHub de Xiaomi-OCR-0: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
