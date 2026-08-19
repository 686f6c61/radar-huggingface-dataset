# pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp

## Resumen

Este modelo es una cuantización en 4 bits del conocido Qwen3.8-27B-Uncensored, realizada por el usuario pyros-vault mediante la herramienta oQ (oMLX v0.6.1) con precisión mixta. El resultado es un archivo en formato MLX safetensors, pensado principalmente para su ejecución en hardware Apple Silicon a través de la librería MLX. La etiqueta "uncensored" indica que se ha eliminado o reducido el filtrado de contenido del modelo original, lo que permite generar respuestas sin las restricciones habituales de seguridad.

Un punto crítico a destacar: aunque el nombre del repositorio indica "27B", los pesos reales contenidos en los safetensors suman 4.926.789.872 parámetros (aproximadamente 4,9 mil millones). Esta discrepancia es significativa y debe tenerse en cuenta antes de su uso. Es posible que el autor haya subido solo una parte de los pesos, o que el nombre sea incorrecto. En cualquier caso, los datos técnicos que se ofrecen a continuación se basan en la información real disponible en el repositorio.

El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un modelo denso de visión y lenguaje con una ventana de contexto de 262 000 tokens, licencia Apache 2.0 y capacidades destacadas en razonamiento, programación y tareas agénticas. Esta versión cuantizada hereda esas capacidades, aunque con las limitaciones propias de la reducción de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense, vision-language) |
| Parametros totales | 4.926.789.872 (segun safetensors; el nombre sugiere 27B, discrepancia sin resolver) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada para esta version; el modelo base soporta 262 000 tokens |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | No especificados; el modelo base soporta multiples idiomas (chino, ingles, etc.) |
| Licencia | No disponible en el repositorio; el modelo base es Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B se construye sobre la arquitectura Qwen3.5, un transformer denso que integra un codificador de vision. Segun la ficha de LM Studio, es un "compact, deployment-friendly dense vision-language model" con capacidades mejoradas para planificacion autonoma y tareas agénticas de multiples pasos. El entrenamiento original incluyo datos de texto e imagenes, con tecnicas de RLHF y DPO para alinear el comportamiento, aunque la version "uncensored" elimina parte de ese alineamiento.

Esta version concreta no anade innovaciones arquitectonicas: se limita a aplicar cuantizacion de 4 bits con grupo de 64 y precision mixta mediante la herramienta oQ de oMLX. La cuantizacion reduce el tamaño del modelo y acelera la inferencia en hardware compatible con MLX, a costa de una posible perdida de precision en tareas complejas. No se proporcionan detalles sobre el dataset de entrenamiento de esta version ni sobre el proceso de "uncensoring" aplicado.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base, incluyendo razonamiento paso a paso y resolucion de problemas complejos.
- Vision y lenguaje: al ser un modelo vision-language, puede procesar imagenes junto con texto (aunque no se confirma si esta cuantizacion conserva el codificador de vision completo).
- Programacion: el modelo base destaca en tareas de codigo, y esta version deberia mantener esa capacidad con posibles degradaciones por la cuantizacion.
- Tareas agénticas: soporte para planificacion autonoma y ejecucion de multiples pasos con retroalimentacion del entorno, segun la descripcion del modelo base.
- Sin censura: el modelo ha sido modificado para eliminar restricciones de contenido, lo que permite generar respuestas que el modelo original rechazaria.
- Multilingue: el modelo base soporta varios idiomas, aunque no se especifica cuales en esta version.

## Casos de uso

- Despliegue local en Apple Silicon: gracias al formato MLX y la cuantizacion de 4 bits, el modelo puede ejecutarse en Mac con suficiente memoria unificada (16 GB o mas) para tareas de generacion de texto y chat.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno (4,9 B de parametros reales), es adecuado para experimentar con tecnicas de prompting, RAG o agentes sin necesidad de infraestructura costosa.
- Generacion de contenido creativo sin restricciones: la naturaleza "uncensored" permite explorar temas que otros modelos bloquean, como ficcion adulta, opinion politica controvertida o humor negro.
- Asistente de programacion local: puede integrarse en entornos de desarrollo como autocompletado o chat de codigo, aprovechando su capacidad de generacion de codigo y su bajo consumo de recursos.
- Analisis de imagenes y texto combinados: si el codificador de vision se conserva, puede usarse para tareas de captioning, VQA o extraccion de informacion de documentos escaneados.
- Investigacion academica sobre alineamiento y censura: al ser una version sin censura, permite estudiar el comportamiento del modelo cuando se eliminan las salvaguardas, comparandolo con la version original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version cuantizada. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, programacion y razonamiento, pero no se dispone de esos datos en el repositorio. Se recomienda consultar la ficha del modelo original para obtener referencias de rendimiento, teniendo en cuenta que la cuantizacion de 4 bits puede reducir la precision en tareas exigentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,9 GB, por lo que se necesita al menos 18 GB de memoria disponible (VRAM o RAM unificada) para cargar el modelo completo. Con cuantizacion de 4 bits, el uso real de memoria puede ser inferior, pero no se especifica.
- GPU recomendadas: al ser formato MLX, esta optimizado para Apple Silicon (M1, M2, M3 y superiores). Tambien puede ejecutarse en GPUs NVIDIA mediante adaptadores, pero no es el objetivo principal.
- Compatibilidad con GPU de consumo: una RTX 4090 (24 GB VRAM) o RTX 3090 (24 GB) pueden cargar el modelo sin problemas. GPUs con 16 GB (como RTX 4080) podrian tener dificultades si el modelo requiere mas de 16 GB.
- Opciones de despliegue: al ser MLX, se puede usar con la libreria mlx-lm o a traves de herramientas como Ollama (si se convierte a GGUF). No se menciona soporte para vLLM o TGI en este formato.
- Latencia y throughput: no se proporcionan datos. En Apple Silicon, la inferencia de modelos de ~5 B en 4 bits suele alcanzar decenas de tokens por segundo, pero depende del chip y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27 B | 262 000 | Apache 2.0 | safetensors, GGUF | Modelo original, sin cuantizar, con censura |
| Qwen3.8-27B-Uncensored (JonathanColetti) | 27 B | 262 000 | No especificada | GGUF, MLX | Version sin censura del mismo modelo |
| Este modelo (pyros-vault) | 4,9 B (segun safetensors) | No especificado | No disponible | MLX safetensors | Cuantizacion 4-bit del modelo uncensored |

La discrepancia en el numero de parametros hace que esta version no sea directamente comparable con el modelo base. Si los pesos reales son 4,9 B, se acerca mas a modelos como Llama 3.1 8B o Qwen2.5 7B, aunque con la arquitectura Qwen3.5. No se dispone de datos de rendimiento para establecer una comparativa fiable.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre indica 27 B pero los safetensors contienen 4,9 B. Esto puede deberse a un error del autor o a una subida incompleta. Verificar antes de usar.
- Contenido sin censura: el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas. No es adecuado para aplicaciones orientadas al publico general sin un filtrado adicional.
- Degradacion por cuantizacion: la cuantizacion de 4 bits puede reducir la precision en tareas de razonamiento complejo, matematicas o generacion de codigo. Se recomienda evaluar en el caso de uso concreto.
- Licencia no clara: al no especificarse la licencia, no se garantiza el uso comercial. El modelo base es Apache 2.0, pero la version "uncensored" puede tener restricciones adicionales.
- Sin soporte oficial: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad. No hay garantias de funcionamiento correcto.
- Limitaciones de vision: no se confirma si el codificador de vision se conserva integro tras la cuantizacion. Si se necesita procesamiento de imagenes, probar antes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ4e-fp16-mtp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version uncensored de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Repositorio GitHub con instrucciones para GGUF/Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Articulo sobre ejecucion local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
