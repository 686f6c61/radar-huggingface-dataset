# Neurobrix/Qwen3-30B-A3B-Thinking-2507-nbx

## Resumen

Qwen3-30B-A3B-Thinking-2507-nbx es un contenedor `.nbx` publicado por Neurobrix que empaqueta el modelo Qwen3-30B-A3B-Thinking-2507 desarrollado por Qwen (Alibaba). No se trata de un modelo nuevo ni de un fine-tune: los pesos, la licencia y el comportamiento son identicos a los del modelo original; Neurobrix solo anade el grafo de computacion, la descripcion de conexiones entre componentes y los valores por defecto de ejecucion necesarios para que el motor NeuroBrix lo ejecute.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token (de ahi el sufijo A3B), disenado para generacion de texto con modo de razonamiento explicito (thinking). La variante 2507 corresponde a la revision de julio de 2025 del checkpoint Thinking. El contenedor ocupa 61,1 GB y se distribuye con licencia Apache 2.0.

Su relevancia es practica: permite ejecutar un MoE de 30B en hardware heterogeneo (varias GPU, GPU unica, GPU de Apple con Metal o CPU) mediante planificacion automatica del reparto de capas y memoria, con dos motores alternativos (PyTorch o Triton sin dependencia de PyTorch). Es una opcion orientada a inferencia local, no a servir a gran escala en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base Qwen3-30B-A3B-Thinking-2507) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | aproximadamente 3.000 millones por token (A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el contenedor se distribuye en un unico formato de 61,1 GB) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.nbx` (grafo de computacion + pesos + metadatos de runtime); no se distribuye en safetensors ni GGUF en este repositorio |
| Tamano del contenedor | 61,1 GB |
| SHA-256 | `0cc82fd592363f4b9883d636e114104d2b25753b3562be2edfc2771ab04c41e2` |
| Libreria / motor | neurobrix (motores PyTorch y Triton) |
| Hardware soportado | GPU NVIDIA (CUDA), GPU de Apple (Metal), CPU |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo original de Qwen: un transformer con capas de mezcla de expertos (MoE) en las que se activan aproximadamente 3.000 millones de parametros por token de un total de 30.000 millones. El checkpoint es la revision 2507 de la familia Thinking, pensada para generar cadenas de razonamiento antes de la respuesta final. No se dispone en la informacion proporcionada de detalles sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas especificas del checkpoint.

El trabajo de Neurobrix se limita al empaquetado: el contenedor incluye el grafo de computacion del modelo, los pesos, la descripcion de como se conectan sus componentes y los valores por defecto de runtime. El motor planifica automaticamente donde ejecutar cada parte del modelo segun las GPU y la memoria disponibles (una GPU, varias, streaming de pesos o ejecucion en host). El motor Triton utiliza kernels propios (`nbxtensor`) certificados por clase de GPU y no requiere PyTorch instalado.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (cadena de razonamiento previa a la respuesta).
- Generacion de codigo, segun las capacidades del modelo base Qwen3-30B-A3B-Thinking-2507.
- Razonamiento matematico y tareas de multiple paso, segun el modelo base.
- Capacidades multilingues: no detalladas en la informacion proporcionada.
- Tool calling / function calling: no confirmado en la informacion proporcionada para este empaquetado.
- Ejecucion en inferencia local sobre NVIDIA, Apple Metal y CPU mediante el motor NeuroBrix.
- Seleccion automatica de motor (PyTorch o Triton) y planificacion de reparto de memoria entre dispositivos.

## Casos de uso

- Inferencia local en estaciones de trabajo: ejecutar un MoE de 30B en una o varias GPU del propio equipo mediante `neurobrix run`, sin depender de APIs externas ni de infraestructura cloud.
- Despliegue en equipos Apple Silicon: el soporte de Metal permite ejecutar el modelo en Mac con GPU integrada, un escenario donde la mayoria de stacks de inferencia requieren adaptaciones manuales.
- Ejecucion en CPU para entornos sin GPU: util para validacion funcional, pruebas de integracion o generacion por lotes de baja prioridad donde el throughput no es critico.
- Prototipado de razonamiento multi-paso: el modo thinking del checkpoint 2507 permite generar trazas de razonamiento para evaluar pipelines de agentes antes de llevarlos a produccion.
- Sustitucion controlada de un servicio remoto: al mantener la licencia Apache 2.0 del original, se puede integrar en productos comerciales internos sin cambiar el marco legal.
- Entornos con requisitos de reproducibilidad: el contenedor incluye SHA-256 y valores de runtime fijos, lo que facilita fijar una version exacta del entorno de ejecucion en pipelines de CI.
- Evaluacion comparativa de motores: al soportar PyTorch y Triton sobre el mismo contenedor, permite medir diferencias de rendimiento entre ambos backends en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del contenedor no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada por cuantizacion. El contenedor completo ocupa 61,1 GB; NeuroBrix puede ejecutarlo en una GPU, en varias, con streaming de pesos o parcialmente en host, lo que reduce el requisito por dispositivo a costa de ancho de banda.
- GPU recomendadas: no especificadas en la informacion proporcionada. El motor Triton certifica kernels por clase de GPU, pero la model card no enumera las clases soportadas.
- Compatibilidad con GPU de consumo: no confirmada. Un MoE de 30B en precision nativa no cabe en una GPU de consumo de 24 GB sin streaming o cuantizacion, y el repositorio no documenta opciones de cuantizacion.
- Opciones de despliegue: motor NeuroBrix (backend PyTorch o backend Triton con kernels `nbxtensor`), sobre NVIDIA CUDA, Apple Metal o CPU. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507-nbx (este) | 30B | ~3B | no disponible | Apache 2.0 | `.nbx` | Empaquetado NeuroBrix para inferencia local multi-dispositivo |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (original) | 30B | ~3B | no disponible | Apache 2.0 | safetensors (formato habitual del Hub) | Pesos originales; requiere stack de inferencia propio |
| Alternativas de tamano y arquitectura similares | no disponible | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo distinto: cualquier sesgo, alucinacion o limitacion del Qwen3-30B-A3B-Thinking-2507 original aplica sin cambios. La model card remite explicitamente a la del modelo base.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad para este empaquetado.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue concreta sin consultar la documentacion del modelo original.
- Longitud de contexto no indicada en la informacion proporcionada; conviene verificarla en la model card de Qwen antes de disenar prompts largos.
- Sin datos de cuantizacion publicados: el contenedor se distribuye en un unico formato de 61,1 GB, lo que limita el despliegue en hardware con poca memoria.
- Dependencia de un ecosistema joven: el motor NeuroBrix y los kernels `nbxtensor` son componentes propios del autor del empaquetado; la compatibilidad con otras herramientas del ecosistema (vLLM, llama.cpp, TGI) no esta documentada.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a Qwen y revisar los terminos del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Neurobrix/Qwen3-30B-A3B-Thinking-2507-nbx
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Descarga del contenedor: https://neurobrix.org/models/Qwen/Qwen3-30B-A3B-Thinking-2507
- Repositorio GitHub de NeuroBrix: https://github.com/NeuroBrix
- Kernels Triton nbxtensor: https://github.com/NeuroBrix/nbxtensor
- Documentacion: https://docs.neurobrix.org
- Hub: https://neurobrix.org
- Canal de YouTube: https://www.youtube.com/@NeuroBrix
