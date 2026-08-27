# salohcin714/granite-4.2-3b-3bit-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-3bit-mlx` es una cuantización de 3 bits del modelo Granite 4.2 3B de IBM, convertida al formato MLX para ejecución nativa en Apple Silicon. El autor, salohcin714, ha tomado los pesos originales de `ibm-granite/granite-4.2-3b` y los ha transformado mediante `mlx-lm` 0.31.3, aplicando una cuantización afín de 3 bits con grupo de tamaño 64 y redondeo al más cercano, sin calibración ni fine-tuning adicional. El resultado es un artefacto de 1,6 GB que permite ejecutar un modelo de razonamiento con tool calling en Macs con Metal, reduciendo significativamente los requisitos de memoria frente al modelo original en precisión completa.

La relevancia de este modelo radica en que democratiza el acceso a la familia Granite 4.2 de IBM, que incorpora chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento, todo ello en un paquete optimizado para hardware de Apple. Al estar licenciado bajo Apache 2.0, puede utilizarse comercialmente sin restricciones, lo que lo convierte en una opción atractiva para desarrolladores que buscan desplegar asistentes conversacionales o agentes en entornos macOS con recursos limitados. No obstante, al ser una cuantización agresiva, se espera una pérdida de precisión respecto al modelo original, aunque no se han publicado benchmarks específicos para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (del modelo base Granite 4.2 3B) |
| Parametros totales | 457.648.640 (en el archivo safetensors cuantizado; el modelo base original tiene ~3.000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (consultar documentacion del modelo base) |
| Tipos de cuantizacion | 3-bit affine, group size 64, round-to-nearest, sin calibracion |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer decoder-only denso, post-entrenado sobre los modelos base Granite 4.1. Segun la documentacion de IBM, incorpora chain-of-thought integrado, modos de pensamiento flexibles (thinking mode) y tool calling aumentado con razonamiento. El proceso de entrenamiento del modelo base incluye una fase de pre-entrenamiento (descrita en el blog de Granite 4.1) seguida de un post-entrenamiento especifico para la familia 4.2, que afina las capacidades de razonamiento y uso de herramientas.

La cuantizacion aplicada en este repositorio es puramente post-hoc: se convirtieron los pesos a formato MLX y se cuantizaron a 3 bits con grupo de 64, utilizando redondeo al vecino mas cercano y sin calibracion sobre datos de validacion. No se anadio ningun dato de entrenamiento ni se realizo fine-tuning. Se eliminaron los pesos redundantes de `lm_head.weight` cuando el modelo ata las embeddings de entrada y salida, lo que reduce el tamano del archivo. Esta cuantizacion agresiva (3 bits) implica una perdida de precision notable, aunque el tamaño resultante de 1,6 GB lo hace muy manejable para inferencia en Apple Silicon.

## Capacidades

- Generacion de texto y conversacion multi-turno con formato de chat estandar.
- Razonamiento con chain-of-thought integrado, activable mediante modos de pensamiento flexibles (thinking mode).
- Tool calling / function calling aumentado con razonamiento, util para agentes que necesitan invocar APIs o herramientas externas.
- Soporte multilingue en 12 idiomas: ingles, aleman, español, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Capacidad de seguir instrucciones y completar tareas de texto generico.
- Al ser una cuantizacion del modelo original, conserva las capacidades del modelo base, aunque con posible degradacion en tareas que requieren alta precision.

## Casos de uso

- Asistentes conversacionales en macOS: el modelo puede integrarse en aplicaciones de escritorio para Mac que requieran un asistente local sin conexion, aprovechando la ventana de contexto y el soporte multilingue para atender consultas en varios idiomas.
- Generacion de codigo en entornos de desarrollo: gracias al tool calling y al razonamiento, puede usarse como autocompletado inteligente o para generar fragmentos de codigo en pipelines de CI/CD, ejecutandose en Macs de desarrollo sin necesidad de GPU dedicada.
- Analisis de texto multilingue: su soporte para 12 idiomas permite clasificar, resumir o extraer informacion de documentos en diferentes lenguas, util en aplicaciones de inteligencia de negocio o procesamiento de datos.
- Agentes autonomos ligeros: al soportar tool calling y razonamiento multi-paso, puede actuar como agente para tareas como busqueda de informacion, gestion de calendario o automatizacion de flujos, ejecutandose localmente en un Mac.
- Prototipado rapido de chatbots: los desarrolladores pueden desplegar este modelo en un Mac para probar interacciones conversacionales antes de migrar a modelos mas grandes en produccion, gracias a su bajo consumo de memoria.
- Educacion e investigacion: al ser Apache 2.0 y de tamano reducido, es adecuado para experimentos de procesamiento de lenguaje natural en entornos academicos, donde se puede ejecutar en portatiles Apple sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion 3-bit en la informacion disponible. Los benchmarks publicados por IBM corresponden al modelo base Granite 4.2 3B en su forma original, y no deben interpretarse como aplicables a este artefacto cuantizado. Para obtener datos de rendimiento, se recomienda ejecutar evaluaciones propias sobre las tareas de interes, ya que la cuantizacion de 3 bits puede degradar significativamente la precision en comparacion con el modelo original.

## Requisitos de hardware

- Dispositivo: Apple Silicon (M1 o posterior) con macOS 13.0 o superior, ya que el formato MLX requiere Metal.
- Memoria RAM: se estima que el modelo necesita alrededor de 1,6 GB de memoria para cargar los pesos, mas overhead de ejecucion. Un Mac con 8 GB de RAM unificada deberia ser suficiente para inferencia basica.
- GPU: no se requiere GPU dedicada; la GPU integrada del chip Apple Silicon es suficiente gracias a la optimizacion de MLX.
- Opciones de despliegue: se puede usar con la libreria `mlx-lm` (como se muestra en el ejemplo de uso) o integrarse en aplicaciones mediante la API de MLX. No es compatible con vLLM, llama.cpp u Ollama en su forma actual, ya que el formato es especifico de MLX.
- Latencia y throughput: no se dispone de datos medidos. En un Mac con chip M1 Pro, se espera una generacion de varios tokens por segundo, pero depende de la longitud de la secuencia y del modo de pensamiento activado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-3bit-mlx | 457M (cuantizado) | 3-bit | MLX | Apache 2.0 | No disponible | Cuantizacion agresiva, para Apple Silicon |
| salohcin714/granite-4.2-3b-5bit-mlx | No disponible | 5-bit | MLX | Apache 2.0 | No disponible | Misma conversion pero con 5 bits, mayor precision |
| ibm-granite/granite-4.2-3b | ~3B | Original (BF16) | Safetensors | Apache 2.0 | No disponible | Modelo base de IBM, requiere mas memoria |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos para comparar con otros modelos de 3B como Llama 3.2 o Qwen 2.5 en este contexto.

## Limitaciones y advertencias

- La cuantizacion de 3 bits con grupo de 64 y sin calibracion puede provocar una perdida de precision significativa en tareas de razonamiento complejo, matematicas o generacion de codigo, en comparacion con el modelo original.
- No se han realizado evaluaciones de sesgos o alucinaciones sobre esta version cuantizada; el modelo base puede presentar sesgos derivados de sus datos de entrenamiento, y la cuantizacion podria amplificar errores.
- La longitud de contexto no se ha verificado en esta conversion; se recomienda consultar la documentacion del modelo base para conocer el limite real.
- El modelo no esta afiliado ni respaldado por IBM; "Granite" es una marca comercial de IBM utilizada de forma descriptiva.
- Aunque la licencia Apache 2.0 permite uso comercial, los benchmarks publicados por IBM no son aplicables a este artefacto cuantizado, por lo que el rendimiento real debe validarse en cada caso de uso.
- Al estar limitado a MLX, no es portable a entornos CUDA o ROCm sin una conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-3bit-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina principal de IBM Granite: https://www.ibm.com/granite
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
