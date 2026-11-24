# amd/Laguna-S-2.1_gpuep_1.0_gpu_128

## Resumen

Laguna-S-2.1_gpuep_1.0_gpu_128 es una distribucion cuantizada del modelo base poolside/Laguna-S-2.1, publicada por AMD para su despliegue optimizado sobre hardware Ryzen AI mediante ONNX Runtime GenAI. El modelo original es un transformer de tipo Mixture of Experts (MoE) orientado a generacion de texto y conversacion, y esta version ha sido convertida al formato ONNX con pesos INT4 para reducir el peso en memoria y habilitar inferencia local en aceleradores integrados de AMD.

La publicacion corre a cargo de AMD, que ha aplicado una estrategia de cuantizacion post-entrenamiento (RTN, cuantizacion por grupos) sobre el decodificador de texto, los expertos compartidos y el LM head, manteniendo activaciones en FP16. El repositorio ocupa 62,2 GB y esta etiquetado con el backend hip-ep, lo que indica soporte para aceleracion GPU/EP en el ecosistema ONNX Runtime.

Es relevante ahora porque demuestra el flujo de despliegue de modelos MoE grandes en formato ONNX cuantizado para hardware AMD, un camino alternativo a los pesos safetensors/GGUF habituales. La informacion publica disponible es limitada: no se detallan parametros totales, longitud de contexto ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun tags del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (RTN, grupo 128 en decodificador; grupo 32 en LM head), activaciones FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (modelo base); modificaciones AMD bajo MIT |
| Formato de pesos | ONNX (ONNX Runtime GenAI) |

## Arquitectura y entrenamiento

El modelo base poolside/Laguna-S-2.1 es un transformer con arquitectura Mixture of Experts, tal como indican las etiquetas del repositorio (moe, laguna, poolside). No se dispone de informacion publica en la documentacion proporcionada sobre el numero de parametros, el numero de expertos, la longitud de contexto nativa ni la composicion del dataset de entrenamiento o las etapas de alineacion (RLHF/DPO).

Esta version de AMD no reentrena el modelo: aplica una conversion a ONNX y cuantizacion post-entrenamiento. El decodificador de texto usa RTN con grupo de 128 y pesos INT4, los expertos MoE usan QMoE INT4 con bloque de 128, los expertos compartidos usan MatMulNBits INT4 y el LM head usa RTN con grupo de 32, simetrico y accuracy_level 4. Las activaciones se mantienen en FP16. No incluye componentes de vision ni de embedding, es un decodificador solo de texto. La etiqueta hip-ep sugiere soporte de ejecucion en GPU mediante el execution provider de ONNX Runtime.

## Capacidades

- Generacion de texto y conversacion en ingles (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo, heredados del modelo base poolside (no verificable con datos publicados en esta ficha).
- Arquitectura MoE con enrutamiento por expertos, lo que permite activar solo una fraccion de los parametros por token (el numero exacto no esta disponible).
- Inferencia optimizada en ONNX Runtime GenAI sobre hardware AMD Ryzen AI.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Despliegue local en equipos con Ryzen AI: el formato ONNX INT4 y el backend hip-ep permiten ejecutar un modelo MoE de gran tamano en hardware AMD integrado, reduciendo la dependencia de GPUs dedicadas.
- Asistentes conversacionales en ingles embebidos en aplicaciones de escritorio: la cuantizacion INT4 reduce el peso en memoria y facilita la distribucion en entornos con recursos limitados.
- Prototipado de pipelines ONNX Runtime GenAI: sirve como referencia para integrar modelos MoE cuantizados en aplicaciones que ya usan el stack de Microsoft/AMD.
- Generacion de codigo en herramientas de desarrollo locales: el modelo base esta orientado a codigo; esta version permite probar ese flujo en hardware AMD sin GPUs de datacenter.
- Evaluacion comparativa de backends: util para medir latencia y calidad de la cuantizacion INT4 frente a los pesos originales en safetensors.
- Educacion e investigacion: permite estudiar el comportamiento de un MoE cuantizado en ONNX sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 62,2 GB, lo que da una referencia del espacio en disco necesario para los pesos ONNX INT4.
- GPU recomendadas: hardware AMD Ryzen AI con soporte hip-ep; no se especifican modelos concretos de GPU en la documentacion.
- Compatibilidad con GPU consumer (RTX 4090, etc.): no confirmada en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime GenAI con el execution provider hip-ep; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Laguna-S-2.1_gpuep_1.0_gpu_128 (este) | no disponible | no disponible | ONNX INT4 | openmdw-1.1 / MIT (modificaciones) | Cuantizado por AMD para Ryzen AI |
| poolside/Laguna-S-2.1 | no disponible | no disponible | safetensors (presumible) | openmdw-1.1 | Modelo base original |
| Otras alternativas MoE de codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado.
- La cuantizacion INT4 puede degradar la calidad respecto al modelo base en tareas de razonamiento o codigo complejo; no se han publicado evaluaciones que lo cuantifiquen.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos especificos para este modelo.
- La licencia del modelo base es OpenMDW 1.1 y las modificaciones de AMD se publican bajo MIT; es necesario cumplir ambas para uso comercial.
- El repositorio esta orientado a hardware AMD Ryzen AI con ONNX Runtime GenAI; su uso en otros backends no esta soportado oficialmente.
- No se dispone de informacion sobre longitud de contexto, parametros totales ni rendimiento, lo que dificulta planificar su uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Laguna-S-2.1_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Licencia OpenMDW 1.1 (referencia en la model card del modelo base)
