# Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx

## Resumen

Qwen3-Omni-30B-A3B-Instruct-nbx es un contenedor `.nbx` del modelo multimodal Qwen3-Omni-30B-A3B-Instruct desarrollado por Qwen (Alibaba), empaquetado por Neurobrix para su ejecución en el motor de inferencia NeuroBrix. El modelo subyacente es un transformer multimodal any-to-any de tipo Mixture of Experts con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, diseñado para procesar y generar texto, imagen, audio y vídeo. Este contenedor no modifica los pesos ni la licencia del modelo original: NeuroBrix únicamente añade el grafo de computación, los pesos empaquetados y los valores por defecto de ejecución necesarios para que el motor los cargue.

La relevancia de este artefacto reside en el empaquetado: el contenedor ocupa 70,6 GB e incluye todo lo necesario para ejecutar el modelo en GPUs NVIDIA, GPUs de Mac (Metal) y CPU, con dos backends alternativos (PyTorch y Triton mediante kernels nbxtensor). El motor planifica automáticamente la distribución de los componentes del modelo entre las GPUs y la memoria disponibles, incluyendo ejecución multi-GPU, streaming o descarga parcial a host. Esto facilita el despliegue local de un modelo multimodal de gran tamaño sin tener que gestionar manualmente la orquestación de pesos y grafos.

El modelo base conserva la licencia Apache 2.0 del original y su pipeline es any-to-any. La información disponible sobre el contenedor no incluye detalles sobre el entrenamiento, los idiomas soportados ni resultados de benchmarks, por lo que esta ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any con Mixture of Experts (modelo base Qwen3-Omni-30B-A3B-Instruct) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | aproximadamente 3 mil millones (3B) por token, segun la nomenclatura A3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computacion + pesos + configuracion de runtime); tamano del contenedor 70,6 GB |
| SHA-256 del contenedor | `d19b72ae15297495013d985d0bdd66a55b36051fb4c5b53a42e639b777e40448` |
| Backends de ejecucion | PyTorch y Triton (kernels nbxtensor, sin dependencia de PyTorch) |
| Hardware soportado | GPUs NVIDIA, GPUs de Mac (Metal) y CPU |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El contenedor envuelve el modelo Qwen3-Omni-30B-A3B-Instruct, un transformer multimodal con arquitectura Mixture of Experts: 30B parametros totales con aproximadamente 3B activos por token. La naturaleza any-to-any implica que el modelo acepta y produce multiples modalidades (texto, imagen, audio y video, segun la model card del contenedor). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion, ya que la model card del contenedor remite a la del modelo original sin reproducir esos datos.

La innovacion tecnica de este artefacto no esta en el modelo sino en el empaquetado: el contenedor `.nbx` incluye el grafo de computacion completo, los pesos, la topologia de conexion entre componentes y los valores por defecto de runtime. El motor NeuroBrix planifica la colocacion de cada parte del modelo en funcion de las GPUs y memoria detectadas, y ofrece dos rutas de ejecucion: el motor PyTorch convencional o el motor Triton con kernels nbxtensor certificados por clase de GPU. No se dispone de informacion sobre innovaciones del modelo base como decodificacion especulativa o atencion lineal en la documentacion proporcionada.

## Capacidades

- Generacion y comprension multimodal any-to-any: procesa entradas de texto, imagen, audio y video, y genera salidas en multiples modalidades segun el pipeline declarado.
- Ejecucion local en hardware de consumo y profesional: soporta GPUs NVIDIA, GPUs de Mac con Metal y CPU.
- Planificacion automatica de recursos: el motor distribuye el modelo entre una o varias GPUs, con streaming o descarga a host.
- Doble backend de inferencia: PyTorch o Triton con kernels nbxtensor sin PyTorch.
- Importacion via CLI con aceptacion de licencia (`neurobrix import ... --accept-license`).
- Ejecucion por modos (`--mode text`) con soporte de entrada de imagen (`--input-image`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio: la model card menciona familia multimodal y pipeline any-to-any, pero no detalla modos especificos.

## Casos de uso

- Descripcion de imagenes en local: el comando documentado `neurobrix run --model Qwen/Qwen3-Omni-30B-A3B-Instruct --mode text --input-image photo.jpg --prompt "Describe this image."` permite generar descripciones de imagenes sin depender de servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Procesamiento multimodal por lotes en estaciones de trabajo: al soportar GPUs NVIDIA y Mac con Metal, el contenedor puede ejecutarse en equipos de desarrollo existentes para tareas de analisis de imagen y texto en pipelines internos.
- Prototipado de aplicaciones any-to-any: el pipeline any-to-any del modelo base permite experimentar con entradas y salidas multimodales antes de invertir en infraestructura dedicada.
- Inferencia en hardware heterogeneo: la planificacion automatica del motor permite desplegar el mismo contenedor en un servidor multi-GPU o en un portatil con GPU de consumo, reduciendo el trabajo de portabilidad.
- Evaluacion de modelos multimodales en investigación: investigadores que necesitan comparar el comportamiento del modelo Qwen3-Omni en distintas configuraciones de hardware pueden usar el contenedor para estandarizar el runtime.
- Despliegue con backend Triton sin PyTorch: entornos donde instalar PyTorch es problematico pueden usar los kernels nbxtensor certificados por clase de GPU para ejecutar el modelo.
- Automatizacion de flujos con CLI: la interfaz `neurobrix import` y `neurobrix run` facilita integrar la inferencia en scripts y tareas programadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del contenedor: 70,6 GB, lo que da una referencia del espacio en disco necesario para los pesos empaquetados.
- VRAM estimada para inferencia: no disponible de forma explicita; el motor NeuroBrix puede distribuir el modelo entre varias GPUs, hacer streaming o descargar componentes a host, por lo que la VRAM minima depende de la configuracion de planificacion.
- GPUs recomendadas: no disponible en la informacion proporcionada; el contenedor declara soporte para GPUs NVIDIA, GPUs de Mac (Metal) y CPU.
- Cabe en GPU de consumo: no disponible de forma concluyente; el soporte de streaming y descarga a host sugiere que puede ejecutarse en configuraciones con VRAM limitada, pero no se especifican modelos concretos.
- Opciones de despliegue: motor NeuroBrix con backend PyTorch o backend Triton (kernels nbxtensor); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx | 30B totales, ~3B activos | no disponible | Apache 2.0 | Hugging Face (contenedor `.nbx`) | Empaquetado NeuroBrix con backend PyTorch/Triton y soporte NVIDIA/Metal/CPU |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 30B totales, ~3B activos | no disponible | Apache 2.0 | Hugging Face (modelo original) | Modelo base sin empaquetar; requiere runtime propio |
| Otros modelos multimodales any-to-any de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion suministrada.

## Limitaciones y advertencias

- La model card del contenedor remite explicitamente a la del modelo original para el entrenamiento, el uso previsto y las limitaciones, que se aplican sin cambios; esta ficha no reproduce esos datos por no estar disponibles.
- No se dispone de informacion sobre sesgos conocidos del modelo base.
- No se dispone de informacion sobre tasas de alucinacion ni sobre evaluaciones de fiabilidad.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.
- No se especifica la longitud de contexto, un dato critico para planificar aplicaciones con conversaciones largas o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero el contenedor no añade garantias propias; cualquier restriccion del modelo original se mantiene.
- El contenedor ocupa 70,6 GB, lo que exige espacio en disco significativo y tiempos de descarga considerables.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- El ecosistema NeuroBrix es especifico: la ejecucion requiere instalar el paquete `neurobrix` y aceptar la licencia mediante la CLI, lo que añade una dependencia adicional frente al modelo original.
- No se dispone de datos de latencia ni throughput, lo que dificulta dimensionar infraestructura para produccion.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/Neurobrix/Qwen3-Omni-30B-A3B-Instruct-nbx
- Modelo original: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Descarga del contenedor: https://neurobrix.org/models/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Repositorio de kernels nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Hub de NeuroBrix: https://neurobrix.org
- Documentacion: https://docs.neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
