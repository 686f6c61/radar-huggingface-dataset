# SC117/Ornith-1.5-35B-A3B-MTP-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de codificacion agéntica auto-mejorante desarrollado por el equipo Ornith (ornith.ai). Extiende Ornith-1.0 ampliando el bucle de auto-mejora desde la optimizacion de scaffolds y rollouts hasta la optimizacion conjunta de generacion de tareas, construccion de scaffolds y rollouts de soluciones mediante aprendizaje por refuerzo. El modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas y mejora su politica a partir de la experiencia acumulada.

Con una arquitectura MoE (Mixture of Experts) de 35B parametros totales y solo 3B activos por token, supera a su competidor directo Qwen3.6-35B en todos los benchmarks de codificacion y agente publicados. Esta version GGUF, publicada por SC117, incluye el proyector de vision mmproj-BF16.gguf para capacidades multimodales (imagen y texto) con llama.cpp, y el MTP (Multi-Token Prediction) es nativo del modelo, sin necesidad de injertos externos. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) |
| Parametros totales | 35B |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye cuantizacion APEX, no se especifican los niveles exactos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para vision) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B utiliza una arquitectura MoE basada en Qwen3.5, con 256 expertos enrutados de los cuales 8 estan activos por token. La red se compone de 40 capas transformer mas una capa MTP (Multi-Token Prediction) nativa, que permite predecir multiples tokens futuros simultaneamente, mejorando la eficiencia de decodificacion y la coherencia del razonamiento.

El entrenamiento se realizo sobre la base de Qwen3.5 y Gemma4, con etapas de continued pretraining, mid-training y post-training. La innovacion clave es el bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se utilizan como datos de entrenamiento para aprendizaje por refuerzo. Este proceso se repite de forma iterativa, permitiendo que el modelo mejore continuamente sin intervencion humana. No se dispone de datos concretos sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento avanzado, especialmente orientado a tareas de codificacion y agentes.
- Codificacion agéntica: capaz de planificar, ejecutar y depurar codigo en entornos complejos.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Razonamiento multi-paso (multi-step reasoning) para tareas de agente y resolucion de problemas.
- Capacidades multimodales: el proyector de vision mmproj permite procesar imagenes junto con texto, habilitando tareas como captura de pantalla, diagramas o documentacion visual.
- MTP nativo: prediccion multi-token que acelera la inferencia y mejora la coherencia.
- Auto-mejora: el modelo puede generar sus propias tareas de entrenamiento y mejorar su politica mediante RL, lo que lo hace especialmente adecuado para entornos de desarrollo continuo.

## Casos de uso

- Desarrollo de agentes de codificacion autonomos: el modelo puede gestionar tareas complejas de programacion, como refactorizacion, generacion de tests y correccion de bugs, gracias a su capacidad de razonamiento multi-paso y tool calling.
- Integracion en pipelines de CI/CD: puede generar y revisar codigo automaticamente, ejecutar pruebas y proponer parches, reduciendo la intervencion manual en el ciclo de desarrollo.
- Asistente de programacion multimodal: con el proyector de vision, puede interpretar capturas de pantalla de interfaces, diagramas de arquitectura o documentacion visual para generar codigo o explicaciones.
- Automatizacion de tareas de mantenimiento de repositorios: puede analizar issues, generar commits y gestionar pull requests de forma autonoma, aprovechando su capacidad de auto-mejora.
- Generacion de documentacion tecnica: a partir de codigo fuente o especificaciones, puede producir documentacion detallada y ejemplos de uso.
- Entrenamiento y evaluacion de modelos de codificacion: su bucle de auto-mejora puede utilizarse para generar datasets sinteticos de tareas de programacion, utiles para fine-tuning de otros modelos.
- Soporte tecnico automatizado: puede responder consultas sobre APIs, depurar errores y proporcionar soluciones paso a paso, gracias a su capacidad de razonamiento y su conocimiento de codigo.

## Benchmarks y rendimiento

Segun la model card del autor, Ornith-1.5-35B-A3B supera a Qwen3.6-35B en todos los benchmarks de codificacion y agente. Los resultados publicados son:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 67.8 |
| SWE-bench Verified | 79.0 |
| SWE-bench Pro | 59.6 |
| SWE-bench Multilingual | 71.4 |
| NL2Repo | 46.2 |
| MCP-Atlas | 70.2 |
| ClawEval | 72.5 |

No se han publicado resultados comparativos detallados con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo MoE de 35B parametros totales, la memoria necesaria depende de la cuantizacion. En FP16 se requieren aproximadamente 70 GB; en INT8 unos 35 GB; en INT4 unos 17.5 GB. Las cuantizaciones GGUF permiten ajustar el consumo.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 (80GB) o H100. Con cuantizacion INT4, es posible ejecutarlo en GPUs de consumo como RTX 4090 (24GB) o RTX 3090 (24GB), aunque con limitaciones de velocidad.
- Al ser MoE con solo 3B activos, la latencia por token es relativamente baja comparada con modelos densos de 35B, pero la memoria sigue dependiendo de los parametros totales.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM (si soporta MoE), TGI y cualquier framework que acepte GGUF. El proyector de vision requiere llama.cpp o compatible con mmproj.
- Throughput estimado: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La unica comparacion directa mencionada es con Qwen3.6-35B, del cual no se proporcionan datos numericos. Ambos son modelos MoE de 35B con 3B activos, pero Ornith-1.5 supera a Qwen3.6 en todos los benchmarks de codificacion y agente segun el autor. No se dispone de informacion sobre otros modelos comparables en la misma categoria.

## Limitaciones y advertencias

- No se especifican los idiomas soportados; se asume un enfoque principal en ingles, aunque podria tener capacidades multilingues limitadas.
- La longitud de contexto no esta documentada, lo que puede afectar a tareas que requieran ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en generacion de codigo complejo o respuestas factuales.
- El bucle de auto-mejora puede generar tareas sesgadas si el modelo parte de datos de entrenamiento sesgados, aunque no se han documentado sesgos especificos.
- La licencia MIT permite uso comercial, pero se recomienda verificar los terminos de los modelos base (Qwen3.5, Gemma4) si se utiliza en productos comerciales.
- Para produccion, es necesario validar la calidad del codigo generado, ya que el modelo puede producir soluciones incorrectas o inseguras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-MTP-APEX-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Pagina oficial del modelo: https://ornith.ai/ornith_1_5.html
- ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
