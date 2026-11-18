# Noctalin/Qwen3.8-27B-oQ8e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ8e-fp16-mtp es una cuantización mixta del modelo Qwen3.8-27B, publicada por el usuario Noctalin en Hugging Face el 18 de noviembre de 2026. El checkpoint conserva 27.781 millones de parámetros lógicos distribuidos en un archivo de 30,9 GB, con un promedio efectivo de 8,905 bits por peso. La mayor parte de la carga (el 98,143 % de los pesos lógicos) se almacena en cuantización afín de 8 bits con grupos de 64, mientras que una fracción pequeña se mantiene en FP16 y FP32 para preservar precisión en capas sensibles.

El modelo está pensado para ejecutarse con MLX, el framework de Apple para silicio unificado, y se distribuye en formato safetensors. Incorpora tres componentes diferenciados: el modelo de lenguaje (26.896B parámetros), un codificador visual (0.461B) y una cabeza MTP (Multi-Token Prediction) de 0.425B, lo que sugiere capacidades multimodales y decodificación especulativa. La cuantización se realizó con oMLX v0.8.0, herramienta de cuantización mixta del proyecto oQ.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización mixta de precisión sobre un modelo de casi 28B parámetros, con desglose detallado de distribución de bits. Por otro, permite evaluar si un checkpoint de este tamaño y formato es viable en hardware Apple consumer o profesional. La información pública disponible es escasa: no hay model card del modelo base, ni benchmarks, ni licencia declarada, ni idiomas especificados, lo que limita cualquier evaluación rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); incluye vision encoder y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit group 64 (98,143 %), FP16 (0,198 %), FP32 (1,658 %); promedio efectivo 8,905 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El tag `qwen3_5` sugiere que deriva de la familia Qwen3.5, y el desglose de componentes indica tres bloques: un modelo de lenguaje de 26.896B parametros logicos, un modulo de vision de 0.461B y una cabeza MTP de 0.425B. La presencia de vision encoder confirma capacidades multimodales, y la cabeza MTP apunta a decodificacion multi-token, tecnica de decodificacion especulativa que predice varios tokens por paso para acelerar la inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la estrategia de cuantizacion mas alla de la tabla de distribucion: se aplico oMLX v0.8.0 con cuantizacion mixta, manteniendo en FP32 el 1,658 % de los pesos (0.461B parametros, 1.716 GiB) y en FP16 el 0,198 % (0.055B parametros, 0.103 GiB), presumiblemente en capas o tensores sensibles a la precision. El resto se cuantizo a 8 bits afines con grupo de 64.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5 esta orientado a tareas de lenguaje general, aunque no hay evaluacion publicada de este checkpoint concreto.
- Procesamiento de vision: el checkpoint incluye un encoder visual de 0.461B parametros, lo que habilita tareas de imagen a texto (descripcion, VQA, OCR) siempre que el runtime MLX cargue correctamente ese modulo.
- Decodificacion multi-token (MTP): la cabeza de 0.425B permite decodificacion especulativa, con potencial de mejora en throughput respecto a decodificacion autoregresiva estandar.
- Tool calling y function calling: no confirmado en la informacion disponible; depende de las capacidades del modelo base Qwen3.5, no documentadas aqui.
- Razonamiento multi-paso y agentes: no confirmado.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y la cuantizacion a ~8,9 bits efectivos permiten cargar un modelo de 27,8B en equipos con memoria unificada de 32 GB o superior, algo inviable con pesos FP16 (que requeririan ~55 GB). Uso tipico: prototipado y asistentes locales sin conexion.
- Procesamiento de documentos con vision: el encoder visual permite extraer texto e informacion estructurada de imagenes y PDFs escaneados en un pipeline local, sin enviar datos a la nube.
- Aceleracion de generacion con MTP: en aplicaciones interactivas (chat, autocompletado) la cabeza multi-token puede reducir la latencia por token generado, siempre que el runtime MLX soporte decodificacion especulativa.
- Evaluacion comparativa de tecnicas de cuantizacion: el desglose de bits por componente convierte este checkpoint en un caso de estudio util para investigadores que analicen el impacto de la cuantizacion mixta en calidad frente a tamanos.
- Fine-tuning ligero o adaptadores sobre base cuantizada: con 8,9 bits efectivos y grupo 64, es posible experimentar con LoRA en MLX sobre un modelo grande en hardware consumer, aunque la cuantizacion puede limitar la estabilidad del entrenamiento.
- Despliegue de asistentes con contexto multimodal en entornos de privacidad estricta: al ejecutarse localmente en MLX, los datos no salen del dispositivo, lo que encaja en escenarios sanitarios, legales o de investigacion con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 30,9 GB en disco y 28,799 GiB de almacenamiento de tensores; en inferencia se necesita memoria adicional para KV cache y activaciones. Con contexto corto, un equipo con 32 GB de memoria unificada es el minimo practico; 48-64 GB es recomendable para contextos largos.
- GPU recomendadas: el formato MLX esta disenado para silicio Apple (series M1 a M4, con ventaja en M-Pro y M-Max por ancho de banda de memoria). No es directamente compatible con CUDA; en GPUs NVIDIA habria que reconvertir los pesos a otro formato.
- Cabe en GPU consumer: en Apple Silicon, si en configuraciones de 32 GB o mas. En GPUs NVIDIA consumer (RTX 4090, 24 GB) no cabe en este formato sin conversion y cuantizacion adicional.
- Opciones de despliegue: `mlx` (libreria declarada), `mlx-lm` para el modelo de lenguaje, y herramientas del ecosistema oMLX/oQ para carga y conversion. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-fp16-mtp (este) | 27,781B | no disponible | Mixta ~8,9 bits | no disponible | safetensors (MLX) |
| Qwen3-30B-A3B (referencia de familia) | 30,5B totales / 3,3B activos | 32K nativo (extensible) | no aplica (original) | Apache 2.0 | safetensors |
| Gemma 3 27B (referencia de tamano) | 27B | 128K | no aplica (original) | Gemma Terms | safetensors |

Nota: la comparativa con Qwen3-30B-A3B y Gemma 3 27B es orientativa por tamano y familia; no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa. La licencia del modelo base no se declara en este repo, por lo que la disponibilidad comercial queda sin confirmar.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base Qwen3.5 subyacente; no se puede asumir uso comercial sin verificar la licencia original.
- Sin benchmarks: no hay ninguna evaluacion publicada de calidad, lo que impide estimar la degradacion introducida por la cuantizacion mixta frente al modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no se puede acotar su magnitud en este checkpoint.
- Sesgos: no documentados; dependen del dataset de entrenamiento del modelo base, no descrito.
- Idiomas: no se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- Dependencia de MLX: el checkpoint esta en formato MLX y no es portable directamente a CUDA, ROCm ni CPU convencional sin conversion.
- Repo con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso comunitario ni validacion externa de que la carga funcione correctamente.
- La cabeza MTP y el encoder visual requieren soporte especifico del runtime; si `mlx-lm` u otra herramienta no los reconoce, podrian ignorarse o fallar al cargar.
- Cuantizacion de 8 bits con grupo 64: puede degradar tareas de precision (matematicas, codigo) mas que una cuantizacion de mayor granularidad, aunque no hay datos que lo confirmen.

## Enlaces

- Hugging Face: https://huggingface.co/Noctalin/Qwen3.8-27B-oQ8e-fp16-mtp
- Repositorio oQ / oMLX (herramienta de cuantizacion citada): https://github.com/jundot/omlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
