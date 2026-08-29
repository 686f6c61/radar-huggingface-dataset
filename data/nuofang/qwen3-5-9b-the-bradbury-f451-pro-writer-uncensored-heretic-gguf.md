# nuofang/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF del modelo `DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic`, un fine-tune de Qwen3.5-9B orientado a la escritura creativa sin filtros de seguridad, inspirado en la novela *Fahrenheit 451* de Ray Bradbury. El autor de la cuantización, nuofang, ha generado los pesos GGUF con calibración imatrix dirigida a novelas chinas y role-playing, preservando a la vez lógica y sentido común. El modelo resultante está pensado para inferencia local mediante llama.cpp y herramientas compatibles.

La relevancia de este modelo reside en su carácter "uncensored" (sin censura) aplicado a la generación literaria, un nicho demandado por escritores, desarrolladores de juegos narrativos y aficionados al role-playing que necesitan un modelo capaz de producir texto creativo sin restricciones temáticas. Con aproximadamente 8,95 mil millones de parámetros, se sitúa en un rango que permite ejecución en hardware de consumo con cuantización adecuada. No se dispone de información oficial sobre la longitud de contexto, licencia o idiomas soportados, aunque la calibración imatrix sugiere un enfoque bilingüe chino-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no listadas en el repositorio) |
| Idiomas soportados | No disponible (la calibracion imatrix sugiere chino e ingles) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B realizado con Unsloth, según la informacion de FriendliAI. El ajuste se ha orientado a la escritura creativa sin censura, tomando como referencia la novela *Fahrenheit 451* de Ray Bradbury, lo que implica un entrenamiento dirigido a estilos literarios, dialogos y narrativa. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion GGUF se ha generado con calibracion imatrix, un metodo que optimiza la cuantizacion basandose en la importancia de los pesos. Segun el autor, los datos de calibracion se centran en novelas chinas y role-playing, manteniendo logica y sentido comun. El repositorio incluye ademas un archivo `mmproj` (proyector multimodal), lo que sugiere una posible capacidad de vision, aunque no esta confirmada en la documentacion.

## Capacidades

- Generacion de texto creativo: novelas, relatos, dialogos y poesia con estilo literario.
- Role-playing: capaz de mantener personajes y tramas en conversaciones multi-turno.
- Escritura sin censura: no aplica filtros de seguridad tematicos, lo que permite abordar contenido adulto o controvertido.
- Posible soporte multimodal: la presencia de `mmproj` sugiere capacidad de procesamiento de imagenes, aunque no esta documentada.
- Multilingue limitado: la calibracion imatrix apunta a chino e ingles, pero no hay confirmacion oficial de otros idiomas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Escritura de ficcion literaria: un autor puede usar el modelo para generar borradores de capitulos, desarrollar tramas o explorar estilos narrativos, aprovechando su entrenamiento basado en Bradbury.
- Role-playing en juegos de texto: el modelo puede actuar como director de juego o personaje no jugador, manteniendo coherencia narrativa en sesiones largas gracias a su capacidad de conversacion multi-turno.
- Generacion de dialogos para guiones: util para escribir guiones de cine, teatro o series, donde se requiere un tono literario y sin restricciones tematicas.
- Creacion de contenido para juegos narrativos: desarrolladores de videojuegos o juegos de mesa pueden generar misiones, descripciones de escenarios y dialogos de personajes.
- Asistente de escritura creativa: el modelo puede sugerir continuaciones, reescribir pasajes o generar ideas a partir de premisas dadas, sin limitaciones de contenido.
- Traduccion literaria: aunque no confirmado, su calibracion bilingue chino-ingles podria servir para traducir textos narrativos manteniendo el estilo, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su variante cuantizada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~9 B con cuantizacion GGUF, las variantes de menor precision (Q4_K_M, Q5_K_M) pueden caber en GPUs con 8-12 GB de VRAM. Las cuantizaciones mas altas (Q8_0) requeriran al menos 12-16 GB.
- GPU recomendadas: RTX 3060/4060 (12 GB) para cuantizaciones bajas; RTX 3090/4090 o A100 para cuantizaciones altas o mayor velocidad.
- Compatible con hardware de consumo: si, con cuantizacion adecuada (Q4_K_M o inferior) en GPUs de 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a otro formato) y cualquier herramienta compatible con GGUF.
- Latencia y throughput: no disponibles. Dependera de la GPU y la cuantizacion; en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base Qwen3.5-9B es el punto de referencia natural, pero no se conocen sus especificaciones exactas en este contexto. Otros fine-tunes de escritura creativa sin censura (como los basados en Llama-3-8B o Mistral-7B) podrian ser comparables, pero no hay datos publicados de rendimiento relativo. Se recomienda evaluar localmente con tareas especificas de escritura.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna licencia, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Contenido sin censura: al no aplicar filtros de seguridad, el modelo puede generar texto ofensivo, explicito o perjudicial. El usuario es responsable del uso.
- Sesgos desconocidos: no hay informacion sobre sesgos de genero, raza o ideologicos; el entrenamiento basado en una novela especifica puede introducir sesgos estilisticos o tematicos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o incoherente, especialmente en contextos largos.
- Contexto no especificado: se desconoce la longitud maxima de contexto soportada, lo que limita la planificacion de despliegues con ventanas largas.
- Calidad de la cuantizacion: la imatrix esta calibrada para chino y role-playing; en otros dominios o idiomas la calidad puede degradarse.
- Soporte multimodal incierto: la presencia de `mmproj` no garantiza que el modelo funcione correctamente con entradas de imagen; requiere validacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nuofang/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Articulo en UncensoredHub: https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations
- Ficha en FriendliAI: https://friendli.ai/models/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Pagina de Ollama para Qwen3.5: https://ollama.com/library/qwen3.5:9b
