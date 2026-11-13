# Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx

## Resumen

Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx es un contenedor `.nbx` que empaqueta el modelo Qwen3-Coder-30B-A3B-Instruct, desarrollado originalmente por Qwen (Alibaba), para su ejecucion en el motor de inferencia NeuroBrix. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo modelo, con los mismos pesos y la misma licencia Apache 2.0, pero reempaquetado junto con su grafo de computacion, pesos, topologia de componentes y valores por defecto de runtime para que el engine de NeuroBrix pueda planificar su despliegue sobre el hardware disponible.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, especializado en generacion de codigo. La relevancia de este contenedor es operativa: permite ejecutar el modelo en NVIDIA, Mac (Metal) y CPU, con dos backends (PyTorch y Triton via nbxtensor), y con planificacion automatica de reparto entre varias GPUs, streaming o host.

El contenedor ocupa 61,1 GB y se distribuye con hash SHA-256 verificado. Dado que el modelo original es de codigo abierto y ampliamente conocido, esta ficha describe principalmente el modelo base y anade las particularidades del empaquetado NeuroBrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | aproximadamente 3.000 millones (3B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo + pesos + runtime); el modelo base se distribuye habitualmente en safetensors |
| Tamano del contenedor | 61,1 GB |
| SHA-256 | `1b66110dee203108fc6831c257e31d0e5e958e4a5683af578c18ac9c49cc1df5` |
| Libreria | neurobrix |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura Mixture-of-Experts: de los 30B parametros totales, solo unos 3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. Esta es la misma familia arquitectonica que Qwen3-Coder-30B-A3B-Instruct publica Qwen; los detalles concretos de composicion del dataset, numero de tokens de entrenamiento, fases de RLHF/DPO y posibles innovaciones (por ejemplo, decodificacion especulativa o atencion lineal) no estan recogidos en la informacion proporcionada y deben consultarse en la model card original de Qwen.

El aporte especifico de Neurobrix no es de entrenamiento, sino de empaquetado y ejecucion: el contenedor `.nbx` incluye el grafo de computacion del modelo, los pesos, la descripcion de como se conectan sus componentes y los valores por defecto de runtime. El engine planifica la distribucion de cada parte del modelo entre las GPUs y la memoria disponibles (una GPU, varias, streaming o host) y ofrece dos backends: PyTorch y Triton mediante kernels nbxtensor certificados por clase de GPU. No se ha realizado ningun ajuste fino adicional sobre los pesos originales.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion (generacion, completado, explicacion y refactorizacion de codigo).
- Razonamiento multi-paso y resolucion de problemas, heredado de la familia Qwen3-Coder.
- Soporte de tool calling / function calling: el modelo base Qwen3-Coder-Instruct esta disenado para integracion con herramientas, aunque la informacion proporcionada no detalla la interfaz exacta en el contenedor.
- Capacidades agenticas: el modelo base esta orientado a flujos de agente y razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada; deben consultarse en la model card original.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada para este contenedor.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede completar y explicar codigo en linea; el contenedor permite ejecutarlo localmente en la maquina del desarrollador sin depender de APIs externas.
- Generacion de codigo en pipelines de CI/CD: integrado como paso de generacion o revision de parches, con la ventaja de que el contenedor planifica automaticamente el uso de GPU disponible en el runner.
- Refactorizacion y migracion de codigo: el modelo base esta entrenado para tareas de transformacion de codigo; el contenedor permite desplegarlo en infraestructura propia.
- Agentes autonomos de resolucion de tareas: gracias a las capacidades agenticas y de tool calling del modelo base, se puede usar en bucles de razonamiento multi-paso con llamadas a herramientas.
- Despliegue en hardware heterogeneo: el motor NeuroBrix reparte el modelo entre varias GPUs, hace streaming o lo ejecuta en CPU, lo que permite usar el modelo en estaciones de trabajo con una sola GPU o en Mac con Metal.
- Prototipado e investigacion local: al ejecutarse con backend Triton sin PyTorch, facilita entornos ligeros para experimentacion con modelos de codigo de gran tamano.
- Evaluacion comparativa de motores de inferencia: util para medir el rendimiento de NeuroBrix frente a vLLM, llama.cpp u otros sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El contenedor no aporta mediciones propias de MMLU, HumanEval, GSM8K ni otras; para datos del modelo base debe consultarse la model card original de Qwen/Qwen3-Coder-30B-A3B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el contenedor ocupa 61,1 GB en disco y el modelo base tiene 30B parametros, por lo que en precision completa requiere varias GPUs de gran capacidad o tecnicas de reparto/streaming.
- GPUs recomendadas: no especificadas en la informacion; el motor declara soporte para NVIDIA, Mac (Metal) y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el reparto entre varias GPUs y el streaming del motor NeuroBrix podrian permitirlo, pero no hay datos concretos.
- Opciones de despliegue: NeuroBrix (`pip install neurobrix`, `neurobrix import` y `neurobrix run`), con backend PyTorch o Triton (nbxtensor). Otros motores (vLLM, llama.cpp, Ollama, TGI) no estan mencionados para este contenedor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx | 30B | ~3B | no disponible | Apache 2.0 | `.nbx` |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30B | ~3B | no disponible | Apache 2.0 | safetensors |
| Otros modelos de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa mas directa es con el modelo original de Qwen, del que este contenedor es un reempaquetado: mismos pesos, misma licencia y mismas capacidades, con la diferencia del formato de distribucion y del motor de ejecucion. No se dispone de informacion sobre alternativas comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El contenedor hereda integramente los sesgos y limitaciones del modelo base Qwen3-Coder-30B-A3B-Instruct; no se ha realizado ningun ajuste que los mitigue.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en generacion de codigo con APIs o librerias poco comunes.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento en castellano; debe verificarse contra la model card original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original por si existieran condiciones adicionales.
- El contenedor depende del motor NeuroBrix y de su ecosistema (kernels nbxtensor certificados por clase de GPU); no es directamente compatible con vLLM, llama.cpp u otros motores sin conversion.
- El modelo base tiene 30B parametros totales: el despliegue en hardware modesto depende de las capacidades de reparto y streaming del motor, cuyo rendimiento real no esta documentado en la informacion disponible.
- El SHA-256 del contenedor debe verificarse tras la descarga para garantizar la integridad de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Descarga del contenedor: https://neurobrix.org/models/Qwen/Qwen3-Coder-30B-A3B-Instruct
- GitHub de NeuroBrix: https://github.com/NeuroBrix
- Repositorio nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- YouTube: https://www.youtube.com/@NeuroBrix
