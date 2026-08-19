# mradermacher/Agentic-30B-A3B-i1-GGUF

## Resumen

Agentic-30B-A3B-i1-GGUF es una cuantización GGUF del modelo base opencsg/Agentic-30B-A3B, preparada por mradermacher (nethype GmbH). El modelo original es un transformer de arquitectura MoE (mezcla de expertos) con 30.500 millones de parámetros totales y aproximadamente 3.300 millones de parámetros activos, orientado a tareas agénticas, uso de herramientas (tool calling) y llamadas a funciones (function calling). Está basado en la familia Qwen3, como indican los tags de HuggingFace, y soporta los idiomas chino e inglés.

Esta versión concreta se distribuye únicamente en formato GGUF, con una única cuantización de baja precisión (i1-Q2_K) de 11,4 GB, pensada para permitir la ejecución del modelo en hardware de consumo con recursos limitados. La cuantización está optimizada con imatrix, lo que mejora la calidad relativa de la cuantización de baja precisión. No se han publicado resultados de benchmarks ni detalles adicionales sobre el entrenamiento del modelo base en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basado en Qwen3 |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | ~3,3 B (por el nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,4 GB), con archivo imatrix para crear quants propios |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | other (no especificada; verificar la del modelo base opencsg/Agentic-30B-A3B) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base opencsg/Agentic-30B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 30,5 mil millones de parámetros totales y alrededor de 3,3 mil millones de parámetros activos, según la nomenclatura del nombre (A3B). La arquitectura está inspirada en Qwen3, como se refleja en los tags del repositorio, aunque no se especifican detalles concretos como el número de expertos o la política de activación. El modelo está diseñado para tareas agénticas, con soporte para tool calling, function calling y skills.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card no aporta datos sobre el proceso de entrenamiento del modelo original. La cuantización GGUF realizada por mradermacher se ha optimizado con el método imatrix, que reduce la pérdida de calidad en cuantizaciones de baja precisión.

## Capacidades

- Generacion de texto y razonamiento multilingue en chino e ingles.
- Soporte de tool calling y function calling, segun los tags del repositorio.
- Disenado para tareas agentic, incluyendo uso de skills y ejecucion de acciones.
- Integrable en pipelines de agentes (vLLM, llama.cpp, etc.) mediante formatos GGUF.
- No se confirman capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Agentes autonomos para automatizacion de tareas: el modelo puede integrarse en frameworks de agentes que requieran llamar a funciones y procesar multiples pasos, aprovechando su soporte de tool calling y su arquitectura MoE para mantener un coste computacional moderado.
- Asistentes de codigo en entornos de desarrollo: aunque no es un modelo especializado en codigo, su capacidad de razonamiento y tool calling permite integrarlo en IDEs o pipelines de CI/CD para generar, revisar o autocompletar fragmentos de codigo.
- Chatbots multilingües para atencion al cliente: con soporte para chino e ingles, puede desplegarse en servicios de mensajeria para gestionar conversaciones multi-turno, usando herramientas externas para consultar bases de datos o APIs.
- Automatizacion de flujos de trabajo con herramientas externas: puede actuar como orquestador que decide que funcion llamar en cada paso, por ejemplo en sistemas de gestion de tareas o integraciones con APIs.
- Prototipado rapido de agentes de IA: su cuantizacion Q2_K permite ejecutarlo en GPUs de consumo, ideal para pruebas y desarrollo local sin necesidad de infraestructura de alto rendimiento.
- Analisis y resumen de documentos en entornos empresariales: con contexto largo (no confirmado, pero probablemente 256K por su base Qwen3), puede procesar documentos extensos, aunque no se ha validado este dato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otros para este modelo especifico ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF de 11,4 GB (i1-Q2_K) requiere aproximadamente 12-14 GB de VRAM para inferencia con llama.cpp o similares, considerando el overhead de contexto y el espacio de computacion.
- GPU recomendadas: puede ejecutarse en RTX 3090 (24 GB), RTX 4090 (24 GB), o GPUs profesionales como A100 (40/80 GB) si se necesita mayor margen. No es adecuado para GPUs de menos de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), o cualquier backend compatible con GGUF. La cuantizacion Q2_K es de baja precision, por lo que se recomienda probar la calidad en tareas reales.
- Latencia y throughput: no hay datos publicados. Para un modelo MoE con 3,3 B activos, se espera una latencia moderada en consumer GPUs, pero la cuantizacion Q2_K puede reducir el rendimiento numerico.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en los datos proporcionados. Se puede considerar Qwen3-Coder-30B-A3B-Instruct como alternativa de la misma familia, pero no hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion i1-Q2_K es de muy baja precision (2 bits), lo que puede provocar una degradacion notable en la calidad de la generacion, especialmente en tareas complejas o de razonamiento.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto en la informacion disponible.
- La licencia se indica como "other" (otra), no es una licencia estandar como Apache 2.0 o MIT. Es necesario revisar la licencia del modelo base opencsg/Agentic-30B-A3B para conocer las restricciones de uso comercial y modificacion.
- No se especifica la longitud de contexto soportada, aunque por su base Qwen3 podria ser de 256K, pero no esta confirmado.
- La model card no incluye informacion sobre limitaciones de idioma o sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Agentic-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/opencsg/Agentic-30B-A3B
- Repositorio de cuantizaciones static (sin imatrix): https://huggingface.co/mradermacher/Agentic-30B-A3B-GGUF
- Referencia de Qwen3-Coder (para contexto de arquitectura): https://github.com/QwenLM/Qwen3-Coder
