# pyros-vault/Qwen3.8-27B-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ6e-mtp es una versión cuantizada y "abliterated" (sin censura) del modelo Qwen3.8-27B, publicada por el usuario pyros-vault en HuggingFace. El modelo base, desarrollado por orcarouter, es una variante sin censura del Qwen3.8-27B original de Alibaba, que ha sido sometida a un proceso de abliteración para eliminar los rechazos y restricciones de seguridad del modelo. Esta versión concreta aplica además una cuantización mixta de 6 bits mediante la herramienta oQ (oMLX v0.6.1), lo que reduce significativamente el peso del modelo manteniendo un buen equilibrio entre calidad y eficiencia.

El modelo está orientado a casos de uso de red-teaming, investigación de seguridad y generación de contenido sin restricciones. Es un modelo multimodal (imagen-texto) con capacidades de razonamiento, function calling y predicción multi-token (MTP). Su formato MLX lo hace especialmente adecuado para despliegue en hardware Apple Silicon, aunque también existen versiones GGUF para otros entornos. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para equipos que necesitan un modelo de 27B parámetros desplegable en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), familia Qwen 3.8 |
| Parametros totales | ~27 mil millones (denominacion del modelo; la metadata reporta 6.612.941.552, probablemente referido al archivo cuantizado) |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ mixed-precision); tambien disponible en Q4_K_M (GGUF) y FP8 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (tambien GGUF para Ollama/llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de la familia Qwen 3.8, capaz de procesar tanto texto como imagenes. Incluye soporte nativo para razonamiento (reasoning mode), function calling y prediccion multi-token (MTP), una tecnica que permite predecir varios tokens futuros simultaneamente para acelerar la inferencia. La arquitectura interna exacta (numero de capas, dimensiones, atencion) no se detalla en la informacion disponible, pero por el nombre y los tags se trata de un modelo denso de 27 mil millones de parametros.

El proceso de creacion de esta variante concreta ha sido doble. Primero, el modelo base fue sometido a un proceso de abliteracion (abliteration) para eliminar los mecanismos de rechazo y censura del modelo original, dando lugar a orcarouter/Qwen3.8-27B-Uncensored. Segun la informacion de modelos similares como Huihui-Qwen3.8-27B-abliterated, esta tecnica suele dejar intactas las primeras capas y los componentes visuales y MTP. Posteriormente, pyros-vault aplico una cuantizacion mixta de 6 bits con group size 64 utilizando la herramienta oQ de oMLX, optimizada para hardware Apple Silicon. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de fine-tuning del modelo base.

## Capacidades

- Generacion de texto y conversacion multimodal: procesa tanto texto como imagenes como entrada (image-text-to-text).
- Razonamiento multi-step: soporta modos de thinking y razonamiento encadenado.
- Function calling / tool calling: puede invocar herramientas externas y APIs de forma estructurada.
- Prediccion multi-token (MTP): acelera la inferencia prediciendo varios tokens a la vez.
- Generacion de contenido sin censura: al ser abliterated, no aplica los rechazos tipicos de seguridad del modelo original, lo que permite explorar temas sensibles.
- Multilingue: soporta ingles y chino.
- Despliegue eficiente en Apple Silicon: el formato MLX con cuantizacion de 6 bits esta optimizado para Metal y memoria unificada.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo permite a investigadores probar vulnerabilidades y sesgos de modelos de lenguaje sin las restricciones de seguridad habituales, facilitando la identificacion de riesgos en sistemas de IA.
- Generacion de contenido creativo sin filtros: escritores y creadores pueden explorar temas controvertidos o adultos sin que el modelo rechace las peticiones, util para ficcion, guiones o narrativa experimental.
- Asistente de codigo con function calling: integrable en pipelines de desarrollo donde se necesite un modelo que invoque herramientas, lea repositorios y genere parches, con la ventaja de no rechazar peticiones de codigo ofensivo o de doble uso.
- Analisis de imagenes y documentos: al ser multimodal, puede extraer informacion de capturas, diagramas o documentos escaneados y razonar sobre ellos, util en entornos de investigacion.
- Despliegue local en Mac Studio o MacBook Pro: gracias al formato MLX y la cuantizacion de 6 bits, el modelo cabe en equipos Apple con 32 GB o mas de memoria unificada, permitiendo inferencia offline sin conexion a APIs.
- Experimentacion en entornos aislados: laboratorios de IA que necesitan un modelo sin restricciones para probar tecnicas de jailbreak, evaluar robustez o entrenar sistemas de deteccion de contenido danino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta variante cuantizada. El modelo base Qwen3.8-27B ha sido evaluado por Alibaba, pero los resultados no se incluyen en la documentacion de esta version.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 23.7 GB en formato MLX de 6 bits. Para inferencia se recomienda al menos 24 GB de memoria unificada en Apple Silicon (M2 Max, M3 Max o superior).
- GPU recomendadas: Apple Silicon con 32 GB o mas de RAM unificada (Mac Studio, MacBook Pro). En el ecosistema NVIDIA, la version GGUF Q4_K_M (~16.8 GB) puede ejecutarse en una RTX 4090 o A100 de 24 GB.
- Compatibilidad con consumer GPU: si, en GPUs de 24 GB o mas con la version GGUF cuantizada a 4 bits.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp, Ollama (version GGUF), vLLM (si se convierte a formato compatible).
- Latencia y throughput: no disponible. Al ser un modelo de 27B con MTP, se espera una velocidad de generacion superior a la de modelos sin MTP, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-oQ6e-mtp (este) | ~27B | no disponible | Apache 2.0 | MLX 6-bit | Abliterated, cuantizado para Apple Silicon |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | ~27B | no disponible | Apache 2.0 | FP8 | Abliterated, precision completa |
| Huihui-Qwen3.8-27B-abliterated | ~27B | no disponible | Apache 2.0 | no disponible | Abliterated, primeras 15 capas sin ablater |
| Qwen3.8-27B (original) | ~27B | no disponible | Apache 2.0 | varios | Modelo base de Alibaba, con censura |

## Limitaciones y advertencias

- Contenido sin censura: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin rechazo. Su uso en produccion debe limitarse a entornos controlados y con supervisión humana.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede inventar informacion, especialmente en temas especializados o de actualidad.
- Idiomas limitados: solo soporta ingles y chino de forma fiable; otros idiomas pueden producir resultados degradados.
- Contexto no documentado: no se ha publicado la longitud de contexto de esta variante, lo que dificulta dimensionar su uso en tareas de ventana larga.
- Formato propietario: el formato MLX esta optimizado para Apple Silicon; para otros entornos es necesario convertir o usar las versiones GGUF, que pueden tener diferencias de calidad.
- Sesgos del modelo base: al ser una variante de Qwen, puede heredar sesgos culturales y linguisticos del entrenamiento original, amplificados por la eliminacion de filtros de seguridad.
- Sin garantias de rendimiento: al no haber benchmarks publicados, no se puede verificar la calidad real de la cuantizacion de 6 bits frente a la version original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ6e-mtp
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Version FP8 del modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Repositorio GitHub con version GGUF y Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Version abliterated de Huihui: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Guia de despliegue en produccion: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production
