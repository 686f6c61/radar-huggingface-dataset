# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ2-mtp es una cuantizacion mixta de precision del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un destilado de la familia MiMo sobre una base Qwen (segun la nomenclatura del identificador). El autor de la cuantizacion es bambocher y se ha generado con la herramienta oQ de oMLX v0.7.3, orientada a ejecucion en Apple Silicon mediante el framework MLX.

El checkpoint resultante pesa 4,6 GB (4,29 GiB) y contiene 9.653.104.368 parametros logicos distribuidos en tres componentes: el modelo de lenguaje (8.954B), un codificador de vision (0.456B) y una cabeza MTP (multi-token prediction, 0.243B). La cuantizacion no es uniforme: combina bloques afines de 2, 3, 4 y 5 bits con grupos de 64 y 128, mas un 5,08% de pesos en BF16, alcanzando un promedio efectivo de 3,817 bits por peso.

Su relevancia practica esta en que permite ejecutar un modelo multimodal de ~9,6B con cabeza de prediccion especulativa en equipos con memoria unificada moderada, a costa de una perdida de precision significativa en mas del 60% de los pesos (2 bits). La ficha se limita a los datos publicados; no hay informacion sobre licencia, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`), con torre de vision y cabeza MTP; pesos en MLX |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín: 2 bits grupo 64 (62,0%), 3 bits grupo 128 (5,5%), 3 bits grupo 64 (10,5%), 4 bits grupo 64 (2,2%), 5 bits grupo 64 (14,7%), BF16 (5,1%); promedio 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,509 GB (3,268 GiB) |
| Vision | 0,456B | 0,912 GB (0,849 GiB) |
| Cabeza MTP | 0,243B | 0,185 GB (0,172 GiB) |
| Total | 9,653B | 4,606 GB (4,290 GiB) |

## Arquitectura y entrenamiento

La informacion disponible describe unicamente el proceso de cuantizacion, no el entrenamiento original. El modelo base es un destilado (sufijo `Distill`) de MiMo-V2.6 sobre una arquitectura etiquetada como `qwen3_5`, con tres subconjuntos diferenciados de pesos: un modelo de lenguaje de 8,954B parametros, una torre de vision de 0,456B y una cabeza MTP de 0,243B. La presencia de esta ultima sugiere soporte de prediccion multi-token, habitual en decodificacion especulativa para acelerar la generacion.

La cuantizacion se ha realizado con oQ (oMLX v0.7.3) en modo de precision mixta: la mayor parte de los pesos (62,008%) se almacena en afín de 2 bits con grupo de 64, mientras que capas presumiblemente mas sensibles conservan 3, 4 o 5 bits, y un 5,083% permanece en BF16 (probablemente normas, sesgos o capas de entrada/salida). No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 8,954B constituye el nucleo del checkpoint.
- Procesamiento de vision: incluye torre visual de 0,456B parametros, por lo que se trata de un modelo multimodal imagen-texto.
- Prediccion multi-token (MTP): cabeza dedicada de 0,243B, orientada a decodificacion especulativa y mayor velocidad de generacion.
- Ejecucion en Apple Silicon mediante MLX: el formato y la libreria estan optimizados para memoria unificada de chips M-series.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 4,6 GB cabe en equipos con 16 GB de RAM unificada, permitiendo ejecutar un modelo multimodal de ~9,6B sin GPU dedicada mediante MLX.
- Prototipado rapido de pipelines vision-lenguaje: la torre de vision integrada permite experimentar con tareas de descripcion de imagenes o VQA en local antes de migrar a un modelo mayor o a una version de mayor precision.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad entre el modelo base en BF16 y esta variante de 3,817 bits/peso en tareas concretas del propio flujo de trabajo.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP permite probar tecnicas de prediccion multi-token en entornos MLX y comparar el throughput frente a decodificacion autoregresiva estandar.
- Asistentes offline en portatiles: al no requerir conexion ni GPU dedicada, encaja en escenarios de privacidad donde los datos no deben salir del dispositivo.
- Banquito de pruebas para despliegue en produccion: sirve para validar prompts, plantillas y formatos de salida antes de invertir en infraestructura con el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits y el almacenamiento; no incluye metricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM / memoria unificada: el checkpoint ocupa 4,29 GiB en disco; en ejecucion hay que sumar cache KV y activaciones, por lo que se recomienda un minimo de 8-16 GB de memoria unificada.
- GPU dedicadas: no aplica de forma nativa; el formato MLX esta pensado para Apple Silicon, no para CUDA.
- Cabe en consumer GPU: no directamente, al no haber pesos GGUF ni CUDA en este repositorio; requeriria conversion a otro formato.
- Apple Silicon: chips M1/M2/M3/M4 con 16 GB o mas de memoria unificada son el objetivo natural del checkpoint.
- Opciones de despliegue: MLX y oMLX (herramienta que genero la cuantizacion); vLLM, llama.cpp, Ollama y TGI no son compatibles con estos pesos tal cual.
- Latencia y throughput: no disponibles; la cabeza MTP sugiere optimizacion para velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ2-mtp (este) | 9,653B | no disponible | Mixta 2-5 bits (3,817 bits/peso) | safetensors MLX | no disponible |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B | no disponible | BF16 (presumible) | safetensors | no disponible |
| Alternativas de ~9B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la busqueda realizada; la comparativa se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 62% de los pesos esta en 2 bits con grupo de 64, lo que puede degradar tareas de razonamiento, matematicas y fidelidad de codigo frente al modelo base en BF16.
- Perdida de precision no evaluada: no hay benchmarks que cuantifiquen la degradacion, por lo que el impacto real es desconocido.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base bambocher/MiMo-V2.6-Distill-Qwen-9B antes de cualquier despliegue productivo.
- Dependencia de plataforma: los pesos MLX solo se ejecutan en Apple Silicon; no hay versiones GGUF ni CUDA en este repositorio.
- Idiomas no documentados: se desconoce la cobertura linguistica real y el comportamiento en castellano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad ni de sesgos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la calidad del checkpoint.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog, demo o repositorio adicional: no disponible
