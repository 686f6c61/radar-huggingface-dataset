# Neurobrix/Janus-Pro-7B-nbx

## Resumen

Janus-Pro-7B-nbx es un contenedor `.nbx` del modelo multimodal Janus-Pro-7B desarrollado originalmente por DeepSeek (deepseek-ai). NeuroBrix se limita a empaquetar el modelo original junto con su grafo de computación, pesos, configuración de conexión entre componentes y valores por defecto de ejecución, de modo que pueda ejecutarse en el motor de inferencia NeuroBrix. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: es el mismo modelo, con la misma licencia MIT, redistribuido en un formato propietario orientado a la inferencia local.

Janus-Pro-7B es un modelo "any-to-any" que combina comprensión de imágenes y generación de imágenes con generación de texto. La arquitectura del modelo original separa la codificación visual en dos rutas independientes (una para entender imágenes y otra para generarlas), lo que evita el conflicto que surge cuando un único codificador visual debe servir tanto para tareas de percepción como de síntesis. El contenedor pesa 14,8 GB y está pensado para ejecutarse en GPUs NVIDIA, GPUs de Mac (Metal) y CPU.

La relevancia de esta ficha es doble: por un lado, documenta las capacidades del modelo base Janus-Pro-7B; por otro, aclara qué aporta y qué no aporta el empaquetado de NeuroBrix. Dado que el modelo tiene 0 descargas y 0 likes en el momento de la consulta y que la model card del contenedor no incluye especificaciones técnicas propias, buena parte de los datos de arquitectura y entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal any-to-any del base Janus-Pro-7B; el contenedor no detalla la arquitectura interna) |
| Parametros totales | 7B (según el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor se distribuye como un único artefacto de 14,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | contenedor `.nbx` propietario de NeuroBrix (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal any-to-any. Janus-Pro-7B, según la documentación pública de DeepSeek, emplea una separación de rutas visuales: un codificador para comprensión de imágenes y otro para generación, ambos conectados a un transformer de lenguaje. Sin embargo, estos detalles no aparecen en la model card del contenedor y no deben tomarse como verificados a partir de la información disponible.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. El contenedor de NeuroBrix no modifica los pesos: incluye el grafo de computación del modelo, los pesos originales, la topología de conexión entre componentes y los valores por defecto de ejecución. La innovación técnica del paquete es de infraestructura, no de modelado: permite planificar automáticamente en qué dispositivo se ejecuta cada parte del modelo (una GPU, varias, streaming o host) y ofrece dos motores, uno basado en PyTorch y otro basado en Triton sin dependencia de PyTorch, con kernels nbxtensor certificados por clase de GPU.

## Capacidades

- Comprensión de imágenes: el modelo puede recibir una imagen y un prompt de texto para describirla, analizarla o responder preguntas sobre ella.
- Generación de imágenes: el pipeline any-to-any del modelo base incluye síntesis de imágenes a partir de texto, aunque el contenedor documenta explícitamente el modo texto con entrada de imagen.
- Generación de texto: el motor de lenguaje del modelo base produce respuestas textuales.
- Multimodalidad any-to-any: combinación de entradas y salidas de texto e imagen según el pipeline declarado.
- Ejecución local: el contenedor está diseñado para inferencia local en NVIDIA, Metal y CPU.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Descripción automática de imágenes en local: con `neurobrix run --mode text --input-image photo.jpg --prompt "Describe this image."` se obtiene una descripción textual sin enviar la imagen a un servicio externo, lo que resulta adecuado para flujos con requisitos de privacidad.
- Etiquetado y catalogación de imágenes: el modelo puede generar descripciones y metadatos textuales para bibliotecas de imágenes, útil en gestión de activos digitales donde no se quiere depender de APIs de terceros.
- Asistencia a accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla o documentación accesible, ejecutándose en hardware local.
- Prototipado multimodal en estaciones de trabajo: el contenedor permite probar el modelo en una GPU consumer o en un Mac con Metal sin montar un stack de PyTorch manualmente, lo que acelera la evaluación inicial.
- Investigación sobre inferencia multimodal: el motor Triton con kernels nbxtensor certificados por clase de GPU facilita medir el comportamiento del modelo en distintos backends y comparar PyTorch frente a Triton.
- Despliegue en entornos sin PyTorch: el motor Triton no requiere PyTorch, lo que permite ejecutar el modelo en imágenes de contenedor mínimas o en entornos donde instalar PyTorch es problemático.
- Procesamiento por streaming en hardware limitado: la planificación automática del motor permite repartir el modelo entre varias GPUs, hacer streaming de pesos o ejecutarlo en host, útil cuando la VRAM disponible es inferior al tamaño completo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del contenedor no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas multimodales, y tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El contenedor ocupa 14,8 GB en disco; el modelo base es de 7B parámetros, por lo que en precisión completa requeriría del orden de 14 GB solo para pesos, más memoria para activaciones y el codificador visual. Estas cifras son estimaciones a partir del tamaño declarado y no datos verificados en la información.
- GPUs recomendadas: no se especifican modelos concretos. El contenedor declara compatibilidad con GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- Cabe en GPU consumer: no confirmado. Dado el tamaño del contenedor (14,8 GB), una GPU con 16 GB o más de VRAM sería el mínimo plausible, pero no se aporta confirmación.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (sin PyTorch, con kernels nbxtensor). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Janus-Pro-7B-nbx (NeuroBrix) | 7B | no disponible | any-to-any | MIT | `.nbx` | Hugging Face, neurobrix.org |
| deepseek-ai/Janus-Pro-7B (original) | 7B | no disponible | any-to-any | MIT | safetensors (formato habitual en el Hub) | Hugging Face |
| Alternativas multimodales de 7B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es frente al modelo original: el contenedor `.nbx` no cambia pesos ni licencia, pero sustituye el formato estándar del Hub por un artefacto propietario que requiere el motor NeuroBrix. Para el resto de alternativas de la misma categoría no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- El contenedor no es un modelo nuevo: hereda íntegramente los sesgos, limitaciones y riesgos de alucinación del Janus-Pro-7B original, que no se detallan en la información disponible.
- La model card no declara idiomas soportados, por lo que no puede garantizarse un comportamiento correcto en castellano ni en ningún otro idioma concreto.
- No se documentan la longitud de contexto ni las limitaciones de resolución o formato de imagen.
- El formato `.nbx` es propietario: no es compatible con vLLM, llama.cpp, Ollama, TGI ni con el ecosistema estándar de safetensors/GGUF. Migrar a otro motor exige volver al modelo original.
- La licencia MIT del modelo base se mantiene, pero conviene verificar los términos del motor NeuroBrix por separado, ya que la licencia del contenedor no cubre necesariamente el software de ejecución.
- El modelo tiene 0 descargas y 0 likes, y el contenedor se creó y actualizó el mismo día (13 de noviembre de 2026), sin historial de uso que permita validar su funcionamiento en producción.
- No hay benchmarks publicados para este contenedor, por lo que no puede verificarse que el rendimiento con los kernels Triton sea equivalente al del modelo original con PyTorch.
- El SHA-256 del contenedor está publicado (`868f975f2ddb01d5552a0958c1a01fcd9b8d9dda834c5b76c57e033f8bccb3e2`), lo que permite verificar la integridad de la descarga.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/Janus-Pro-7B-nbx
- Modelo original: https://huggingface.co/deepseek-ai/Janus-Pro-7B
- Descarga del contenedor: https://neurobrix.org/models/deepseek-ai/Janus-Pro-7B
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Repositorio de kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentación: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
