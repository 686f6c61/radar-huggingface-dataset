# Neurobrix/granite-3.1-1b-a400m-instruct-nbx

## Resumen
Este repositorio no contiene un modelo nuevo, sino el modelo `ibm-granite/granite-3.1-1b-a400m-instruct` de IBM empaquetado como contenedor `.nbx` para el motor de inferencia NeuroBrix. El autor del empaquetado es NeuroBrix, que no modifica los pesos ni la licencia originales (Apache 2.0). El contenedor incluye el grafo de computación del modelo, los pesos, la topología de conexión entre componentes y los valores por defecto de ejecución que necesita el motor.

El modelo subyacente es un transformer denso de tipo MoE con 1.000 millones de parámetros totales y 400 millones activos por token, diseñado por IBM para generación de texto e instrucciones. Su interés radica en que ofrece un equilibrio entre coste computacional (solo activa el 40 % de los parámetros) y calidad, y en que NeuroBrix permite ejecutarlo con un motor propio basado en Triton que no requiere PyTorch, planificando automáticamente la distribución entre una o varias GPU, memoria host o CPU.

La relevancia de esta ficha es doble: por un lado, documenta el modelo base de IBM; por otro, describe las particularidades del empaquetado NeuroBrix, que añade una capa de despliegue sobre el modelo original sin alterar su comportamiento. Cualquier evaluación de calidad debe remitirse al modelo original, ya que este repositorio no publica benchmarks propios ni variaciones de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), según el modelo base de IBM |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | 400 millones (400M) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.nbx` (grafo + pesos + runtime); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento
El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) que activa 400 millones de parámetros de un total de 1.000 millones por token procesado. Esta configuración reduce el coste de inferencia frente a un modelo denso de 1B, manteniendo una capacidad de representación mayor que un denso de 400M. La model card del repositorio no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; esa información corresponde al modelo original de IBM y no se reproduce aquí.

El empaquetado NeuroBrix añade una capa de ejecución que no altera la arquitectura del modelo. El contenedor `.nbx` (2,8 GB) incluye el grafo de computación, los pesos, las conexiones entre componentes y los valores por defecto del runtime. El motor NeuroBrix planifica la colocación de cada parte del modelo según las GPU y memoria disponibles, y ofrece dos backends: uno basado en PyTorch y otro basado en Triton (kernel `nbxtensor`) que no requiere PyTorch y está certificado por clase de GPU. No se documentan innovaciones de decodificación especulativa ni atención lineal en la información disponible.

## Capacidades
- Generación de texto e instrucciones en inglés y otros idiomas del modelo base (no se detallan en la información proporcionada).
- Razonamiento de propósito general y respuesta a instrucciones, heredado del ajuste instructivo de IBM.
- Generación de código, incluyendo ejemplos como funciones en Python (la model card muestra un ejemplo de inversión de cadenas).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Ejecución en NVIDIA GPU, GPU de Mac (Metal) y CPU mediante el motor NeuroBrix.
- Ejecución con backend PyTorch o con backend Triton sin PyTorch.

## Casos de uso
- Asistente de código en local: el modelo puede generar funciones y fragmentos de código en Python y otros lenguajes, y ejecutarse en una estación de trabajo con GPU consumer gracias a sus 400M parámetros activos y al contenedor de 2,8 GB.
- Prototipado rápido de aplicaciones de texto: permite importar el modelo con un solo comando (`neurobrix import`) y ejecutarlo con `neurobrix run`, lo que reduce el tiempo de puesta en marcha en entornos de investigación.
- Despliegue en hardware heterogéneo: el motor planifica la ejecución entre una o varias GPU, memoria host o CPU, lo que facilita su uso en portátiles con GPU integrada, servidores sin GPU dedicada o clústeres pequeños.
- Generación de texto en entornos sin PyTorch: el backend Triton con kernels `nbxtensor` permite ejecutar el modelo en infraestructuras donde no se quiere instalar el stack de PyTorch.
- Tareas de instrucción general en local: resúmenes, reescritura, clasificación y respuesta a preguntas simples, con la ventaja de que los datos no salen del equipo.
- Evaluación comparativa de motores de inferencia: sirve como banco de pruebas para medir el rendimiento de NeuroBrix frente a otros runtimes (llama.cpp, vLLM) sobre el mismo modelo base.
- Educación y experimentación: el tamaño reducido y la licencia Apache 2.0 permiten usar el modelo en cursos y talleres sin restricciones comerciales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 1B parámetros en FP16 requiere aproximadamente 2 GB de pesos, pero no se confirma el formato de pesos del contenedor.
- GPU recomendadas: no se especifican modelos concretos. El motor NeuroBrix soporta NVIDIA GPU, GPU de Mac (Metal) y CPU.
- Compatibilidad con GPU consumer: no se detalla. El tamaño del contenedor (2,8 GB) sugiere que puede caber en GPU consumer con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: motor NeuroBrix (backend PyTorch o backend Triton con kernels `nbxtensor`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| granite-3.1-1b-a400m-instruct (original) | 1B | 400M | no disponible | Apache 2.0 | safetensors (formato habitual en Hugging Face) |
| granite-3.1-1b-a400m-instruct-nbx (este repositorio) | 1B | 400M | no disponible | Apache 2.0 | Contenedor `.nbx` para NeuroBrix |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias
- Este repositorio es un empaquetado, no un modelo nuevo: cualquier limitación del modelo original de IBM se aplica sin cambios.
- No se documentan sesgos conocidos, pero al ser un modelo de lenguaje entrenado con datos web, es probable que herede sesgos sociales y culturales del corpus original.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones específicas en la información disponible.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y se indique si se han realizado cambios.
- Dependencia del motor NeuroBrix: el contenedor `.nbx` solo se ejecuta con la librería `neurobrix`; no es directamente compatible con otros runtimes sin conversión.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la librería NeuroBrix es un proyecto relativamente nuevo; conviene evaluar su estabilidad antes de usarlo en producción.
- El contenedor incluye un SHA-256 verificable (`58cd33fee67e4cde7df86039b07eb743a2eead731b93c4c4270cb1b3c08bcf67`), lo que permite comprobar la integridad de la descarga.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Neurobrix/granite-3.1-1b-a400m-instruct-nbx
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-instruct
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentación de NeuroBrix: https://docs.neurobrix.org
- Canal de YouTube de NeuroBrix: https://www.youtube.com/@NeuroBrix
- Descarga del contenedor: https://neurobrix.org/models/ibm-granite/granite-3.1-1b-a400m-instruct
