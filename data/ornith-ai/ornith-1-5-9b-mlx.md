# ornith-ai/Ornith-1.5-9B-MLX

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9 000 millones de parámetros desarrollado por ornith-ai, presentado como el miembro más ligero de la familia Ornith-1.5. El modelo extiende Ornith-1.0 —construido sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training— incorporando un bucle de auto-mejora de extremo a extremo que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. En lugar de depender de tareas fijas curadas por humanos y harnesses diseñados manualmente, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la política a través de RL.

Con 8 953 801 728 parámetros, el modelo está diseñado para un despliegue eficiente en una sola GPU y es apto para edge en dispositivos móviles mediante su variante cuantizada Ornith-1.5-9B-Mobile. La versión MLX aquí documentada está optimizada para Apple Silicon. Los benchmarks publicados muestran resultados destacados en tareas de codificación y resolución de problemas de software, superando a modelos de tamaño similar como Qwen3.5-9B y acercándose a modelos MoE más grandes como Qwen3.6-35B-A3B en varias pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma4) |
| Parametros totales | 8 953 801 728 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo MLX; se esperan cuantizaciones 4-bit y 8-bit propias de MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso que parte de la base de Qwen3.5 y Gemma4, sobre los que se aplicaron fases de continued pretraining, mid-training y post-training. La innovacion principal reside en el bucle de auto-mejora: el sistema genera sus propias tareas de entrenamiento, construye scaffolds (estructuras de apoyo para resolver tareas) y optimiza los rollouts de soluciones mediante aprendizaje por refuerzo. Este proceso conjunto permite que el modelo descubra estrategias de resolucion sin depender de un conjunto fijo de tareas humanas ni de harnesses disenados manualmente.

El entrenamiento incluye una fase de RL que recompensa tanto la calidad de las tareas generadas como la efectividad de los scaffolds y las soluciones producidas. Aunque no se especifican los volumenes exactos de datos ni la composicion del dataset, el enfoque de auto-mejora sugiere un ciclo iterativo donde el modelo se evalua a si mismo y se reentrena sobre sus propios descubrimientos. La arquitectura densa de 9B permite un despliegue eficiente en una sola GPU, a diferencia de los modelos MoE de la misma familia (35B-A3B y 397B).

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software: obtiene 70.6 en SWE-bench Verified y 47.5 en SWE-bench Pro, superando a Qwen3.5-9B (53.2 y 31.3 respectivamente).
- Uso de terminal y agentes de linea de comandos: alcanza 46.2 en Terminal-Bench 2.1 (Terminus-2) y 47 en la variante Claude Code, mostrando capacidad para ejecutar comandos y resolver tareas de sistema.
- Razonamiento agente multi-paso: el entrenamiento con scaffolds y rollouts optimizados sugiere capacidad para descomponer problemas complejos en pasos intermedios.
- Auto-mejora y generacion de tareas: el modelo puede generar sus propias tareas de entrenamiento, lo que indica cierta capacidad meta-cognitiva para formular problemas.
- Soporte de tool calling y function calling: no se menciona explicitamente, pero los resultados en Terminal-Bench y SWE-bench implican interaccion con herramientas y entornos de ejecucion.
- Multilingue: limitado al ingles segun la ficha tecnica.

## Casos de uso

- Resolucion automatica de issues en repositorios de software: con 70.6 en SWE-bench Verified, el modelo puede integrarse en pipelines de CI/CD para proponer parches y soluciones a bugs reportados, reduciendo el tiempo de triaje en equipos de desarrollo.
- Agente de terminal para operaciones de sistema: gracias a su rendimiento en Terminal-Bench 2.1, puede ejecutar comandos, gestionar archivos y automatizar tareas administrativas en entornos Linux/macOS, actuando como un asistente de linea de comandos.
- Asistente de programacion en IDE: el modelo puede generar fragmentos de codigo, explicar APIs y refactorizar funciones directamente en editores como VS Code o JetBrains, aprovechando su contexto de codigo y razonamiento.
- Generacion de casos de prueba y verificacion de codigo: su capacidad para entender requisitos y generar soluciones permite crear suites de tests unitarios y de integracion a partir de descripciones de funcionalidad.
- Automatizacion de tareas de mantenimiento de repositorios: puede clasificar issues, generar resumenes de cambios, y proponer mejoras de estilo o rendimiento en pull requests.
- Despliegue en dispositivos moviles (via variante Mobile): la version cuantizada permite ejecutar el modelo en smartphones para asistentes de codigo offline o herramientas de autocompletado en apps de desarrollo movil.
- Investigacion en auto-mejora de modelos: el enfoque de generacion de tareas y scaffolds puede servir como base para experimentos academicos sobre aprendizaje por refuerzo y meta-aprendizaje.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados publicados en la model card, comparando Ornith-1.5-9B con modelos de referencia. Los datos de SWE-bench Multilingual no estan completos en la informacion disponible.

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46.2 | 43.1 | 21.3 | 52.5 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 47.0 | 40.6 | 18.9 | 49.2 | - |
| SWE-bench Verified | 70.6 | 69.4 | 53.2 | 73.4 | 52.0 |
| SWE-bench Pro | 47.5 | 42.9 | 31.3 | 49.5 | 35.7 |
| SWE-bench Multilingual | no disponible | no disponible | no disponible | no disponible | no disponible |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en todas las metricas publicadas y se acerca a Qwen3.6-35B-A3B (un MoE de 35B con 3B activos) en SWE-bench Pro, aunque queda por detras en Terminal-Bench y SWE-bench Verified. Frente a Gemma-4-31B, el modelo de 9B gana en SWE-bench Verified y Pro, pero pierde en Terminal-Bench Terminus-2.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo denso de 9B, en FP16 requiere aproximadamente 18 GB de memoria; con cuantizacion 8-bit unos 9 GB; con 4-bit unos 4.5 GB (estimaciones basadas en el tamaño de parametros, no en datos oficiales).
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090/4090) puede ejecutar el modelo en FP16 o 8-bit con comodidad; GPUs de 16 GB (RTX 4080, A100 40GB) son suficientes para 8-bit; para 4-bit bastan 8 GB (RTX 3060, etc.).
- En Apple Silicon: al ser un repo MLX, esta optimizado para Macs con chip M1/M2/M3/M4; un Mac con 16 GB de RAM unificada puede ejecutar la version 8-bit, y 32 GB para FP16.
- Opciones de despliegue: al ser MLX, se puede usar con mlx-lm, mlx-lm-server, o integrarse en aplicaciones Swift; para GPU NVIDIA se puede convertir a GGUF para llama.cpp u Ollama, o a formato vLLM si se desea servir con alta concurrencia.
- Latencia y throughput: no disponibles; al ser un modelo denso de 9B, se espera una latencia de decodificacion de unos 20-40 tokens/s en GPU moderna con cuantizacion 4-bit, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | SWE-bench Pro | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B | 9B denso | no disponible | 70.6 | 47.5 | 46.2 | no disponible |
| Ornith-1.0-9B | 9B denso | no disponible | 69.4 | 42.9 | 43.1 | no disponible |
| Qwen3.5-9B | 9B denso | no disponible | 53.2 | 31.3 | 21.3 | no disponible |
| Qwen3.6-35B-A3B | 35B MoE (3B activos) | no disponible | 73.4 | 49.5 | 52.5 | no disponible |
| Gemma-4-31B | 31B denso | no disponible | 52.0 | 35.7 | 42.1 | no disponible |

Ornith-1.5-9B se posiciona como el mejor modelo denso de 9B en tareas de codificacion entre los comparados, superando a su predecesor y a Qwen3.5-9B. Frente al MoE de 35B, ofrece un rendimiento cercano con un coste computacional mucho menor (9B densos vs 3B activos en inferencia). La licencia no disponible es una limitacion importante para uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican los terminos de uso, lo que impide determinar si es utilizable en proyectos comerciales o propietarios. Se recomienda contactar con ornith-ai antes de cualquier despliegue en produccion.
- Idioma limitado: el modelo solo soporta ingles, lo que restringe su uso en aplicaciones multilingues o en entornos donde se requiera castellano u otros idiomas.
- Riesgo de alucinacion: como todo LLM, puede generar codigo o respuestas incorrectas, especialmente en tareas poco representadas en su entrenamiento. Se recomienda validacion humana en entornos criticos.
- Sesgos potenciales: al estar entrenado principalmente con datos en ingles y enfocado a tareas de codificacion, puede presentar sesgos hacia estilos de programacion occidentales y descuidar practicas de otras regiones.
- Contexto no especificado: se desconoce la longitud maxima de contexto, lo que dificulta planificar tareas que requieran ventanas largas (documentacion extensa, repositorios grandes).
- Datos de entrenamiento no publicados: no se detalla la composicion del dataset ni el volumen de tokens, lo que impide evaluar posibles problemas de copyright o calidad de los datos.
- Rendimiento en produccion no verificado: los benchmarks son de la model card del autor; no hay evaluaciones independientes publicadas que confirmen estos resultados en entornos reales.

## Enlaces

- Repositorio HuggingFace (version MLX): https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Repositorio HuggingFace (version principal): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Coleccion Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.online/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-9b-ornith-ai
