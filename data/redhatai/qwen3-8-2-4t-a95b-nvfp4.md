# RedHatAI/Qwen3.8-2.4T-A95B-NVFP4

## Resumen

RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 es una version cuantizada del modelo base Qwen/Qwen3.8-2.4T-A95B, desarrollada por Red Hat AI. El modelo original, creado por el equipo de Qwen, es un Mixture-of-Experts (MoE) de 2,4 billones de parametros con aproximadamente 95 mil millones de parametros activos por token, disenado para tareas complejas de codificacion, investigacion, trabajo profesional y agentes de largo horizonte. Esta version concreta aplica cuantizacion NVFP4 (4 bits) a las capas MoE, lo que reduce significativamente el peso del modelo y permite su despliegue en entornos con multiples GPUs de alta gama.

La relevancia de este modelo radica en que acerca un modelo de clase Qwen-Max a la comunidad open source, con una licencia MIT que permite uso comercial sin restricciones. La cuantizacion NVFP4, realizada con LLM Compressor, mantiene un rendimiento muy cercano al modelo original (92,9 frente a 92,6 en GPQA Diamond) mientras reduce los requisitos de memoria, lo que lo convierte en una opcion atractiva para organizaciones que necesitan desplegar un modelo de razonamiento de gran escala sin incurrir en los costes del modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (atencion + MoE), 92 capas, 512 expertos enrutados + 1 experto compartido, 10 expertos activos |
| Parametros totales | 2,4 billones (modelo original); 1.380.546.965.032 en pesos cuantizados NVFP4 |
| Parametros activos | ~95 mil millones (MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.8-2.4T-A95B soporta hasta 1M segun la documentacion de Qwen3.8-Max |
| Tipos de cuantizacion | NVFP4 (esta version); tambien existe FP8 (RedHatAI/Qwen3.8-2.4T-A95B-FP8) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura MoE hibrida con 92 capas que combinan atencion tradicional con capas de mezcla de expertos. Dispone de 512 expertos enrutados, de los cuales se activan 10 por token, mas un experto compartido adicional. Esta configuracion permite alcanzar una capacidad total de 2,4 billones de parametros manteniendo un coste computacional por token equivalente a un modelo de aproximadamente 95 mil millones de parametros. La mezcla de atencion y MoE esta disenada para optimizar el rendimiento en tareas de razonamiento largo y flujos de trabajo agenciales.

La version NVFP4 ha sido cuantizada por Red Hat AI utilizando LLM Compressor, una herramienta del ecosistema vLLM. La cuantizacion se aplica especificamente a las capas MoE, reduciendo la precision a 4 bits (NVFP4) mientras se mantiene la precision de las capas de atencion. No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Razonamiento avanzado: el modelo esta optimizado para tareas de razonamiento complejo y multi-paso, con soporte de modo thinking (razonamiento explicito) activable mediante el parametro `--reasoning-parser qwen3` en vLLM.
- Generacion de codigo: disenado para tareas de programacion de alta complejidad, incluyendo generacion, depuracion y refactorizacion de codigo.
- Tareas agenciales de largo horizonte: capaz de ejecutar flujos de trabajo multi-paso con fiabilidad, como investigacion automatizada o analisis de documentos extensos.
- Analisis de documentos a gran escala: gracias a su amplia ventana de contexto (hasta 1M en el modelo base), puede procesar documentos largos y corpora extensos.
- Trabajo profesional: orientado a aplicaciones de productividad, redaccion tecnica, analisis de datos y soporte a la investigacion.
- Capacidades multilingues: no se han publicado datos especificos sobre los idiomas soportados en la informacion disponible.

## Casos de uso

- Asistente de programacion en entornos de desarrollo integrado: el modelo puede integrarse en IDE como VSCode o JetBrains para ofrecer autocompletado, revision de codigo y sugerencias de refactorizacion, aprovechando su capacidad de razonamiento y generacion de codigo de alta calidad.
- Agente de investigacion automatizada: con su modo thinking y su capacidad de razonamiento multi-paso, puede recopilar informacion, sintetizar articulos cientificos y generar informes tecnicos, ejecutando tareas de busqueda y analisis de forma autonoma.
- Analisis de documentos legales o financieros: su ventana de contexto amplia permite procesar contratos extensos, informes anuales o expedientes completos, extrayendo clausulas relevantes y resumiendo contenido de forma precisa.
- Soporte tecnico de nivel avanzado: puede gestionar conversaciones multi-turno con contexto largo, diagnosticar problemas tecnicos complejos y proponer soluciones detalladas, integrandose en plataformas de atencion al cliente de empresas tecnologicas.
- Generacion de documentacion tecnica: a partir de especificaciones o codigo fuente, el modelo puede redactar manuales, guias de API y documentacion de arquitectura, manteniendo coherencia y precision tecnica.
- Automatizacion de flujos de trabajo agenciales: puede orquestar multiples herramientas y APIs (function calling) para ejecutar tareas como la gestion de incidencias, la planificacion de proyectos o la monitorizacion de sistemas, gracias a su capacidad de razonamiento de largo horizonte.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en GPQA Diamond (con `--reasoning-effort xhigh`):

| Modelo | GPQA Diamond |
|---|---|
| Qwen/Qwen3.8-2.4T-A95B-NVFP4 (original) | 92,6 |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-FP8 | No disponible |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 | 92,9 |
| Inferact/Qwen3.8-2.4T-A95B-NVFP4 | 92,9 |

La version cuantizada por Red Hat AI obtiene una puntuacion ligeramente superior a la del modelo original cuantizado, lo que sugiere que el proceso de cuantizacion no degrada el rendimiento en esta tarea. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1425 GB en disco, por lo que se requiere un cluster de GPUs con memoria agregada superior a 1,5 TB para cargar el modelo en memoria.
- GPUs recomendadas: NVIDIA H100 (80 GB), H200 (141 GB), B200 (192 GB) o sistemas como el GB300 NVL72. Se recomienda un minimo de 8 GPUs con al menos 80 GB de VRAM cada una.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamano del modelo.
- Despliegue: el modelo esta disenado para vLLM, con el siguiente comando recomendado:
  ```bash
  vllm serve RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 \
      --tensor-parallel-size 8 \
      --enable-expert-parallel 8 \
      --reasoning-parser qwen3
  ```
- Latencia y throughput: no se han publicado datos especificos. Dado el tamano del modelo y el uso de NVFP4, se espera un throughput moderado en comparacion con modelos mas pequenos, pero optimizado para tareas de razonamiento complejo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | GPQA Diamond |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-2.4T-A95B (base) | 2,4T (95B activos) | Hasta 1M | Sin cuantizar | MIT | No disponible |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 | 2,4T (95B activos) | No disponible | NVFP4 | MIT | 92,9 |
| RedHatAI/Qwen3.8-2.4T-A95B-FP8 | 2,4T (95B activos) | No disponible | FP8 | MIT | No disponible |
| Inferact/Qwen3.8-2.4T-A95B-NVFP4 | 2,4T (95B activos) | No disponible | NVFP4 | MIT | 92,9 |

Las tres versiones cuantizadas ofrecen un rendimiento similar en GPQA Diamond, siendo la de Red Hat AI ligeramente superior a la original. La principal diferencia entre NVFP4 y FP8 es el equilibrio entre precision y uso de memoria: NVFP4 (4 bits) reduce mas el peso del modelo, mientras que FP8 (8 bits) mantiene mayor precision pero ocupa mas espacio.

## Limitaciones y advertencias

- Requisitos de hardware extremadamente elevados: el modelo necesita un cluster de GPUs de gama alta con mas de 1,5 TB de memoria agregada, lo que limita su uso a organizaciones con infraestructura dedicada.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de gran tamano, puede generar contenido falso o inventado, especialmente en tareas de razonamiento abierto. Se recomienda validar las salidas en entornos de produccion.
- Sesgos potenciales: no se han publicado evaluaciones de sesgo para este modelo. Los modelos de la serie Qwen pueden reflejar sesgos presentes en sus datos de entrenamiento.
- Limitaciones de contexto: aunque el modelo base soporta hasta 1M de contexto, la version cuantizada no especifica si mantiene esa capacidad. Se recomienda probar con secuencias largas antes de desplegar en produccion.
- Soporte de idiomas no documentado: no se ha publicado informacion sobre los idiomas soportados, lo que puede afectar a su uso en entornos multilingues.
- Dependencia de vLLM: el modelo esta optimizado para vLLM y puede no funcionar correctamente con otros motores de inferencia sin adaptaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Version FP8 de Red Hat AI: https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-FP8
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guia de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Blog de NVIDIA sobre despliegue: https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/
- Documentacion de LLM Compressor: https://github.com/vllm-project/llm-compressor/blob/main/docs/key-models/qwen3.5/nvfp4-moe-example.md
