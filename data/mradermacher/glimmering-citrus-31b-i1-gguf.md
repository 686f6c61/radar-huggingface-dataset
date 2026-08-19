# mradermacher/Glimmering-Citrus-31B-i1-GGUF

## Resumen

Glimmering-Citrus-31B-i1-GGUF es un repositorio de cuantización GGUF con archivo imatrix, publicado por mradermacher, que contiene los pesos cuantizados del modelo base Vortex5/Glimmering-Citrus-31B. Este modelo base es un merge creado con mergekit, orientado a tareas de roleplay y storytelling, con licencia Apache 2.0 y soporte únicamente para inglés. El repositorio actual no incluye los archivos de cuantización completos, sino únicamente el archivo de imatrix (0.1 GB) que permite generar cuantizaciones personalizadas; los quants estáticos se encuentran en un repositorio hermano (Glimmering-Citrus-31B-GGUF).

La relevancia de este repositorio radica en que facilita la ejecución local de un modelo de aproximadamente 30.7 mil millones de parámetros en hardware de consumo, gracias al formato GGUF y a la posibilidad de aplicar cuantización con imatrix para mejorar la calidad de las mismas. Sin embargo, al carecer de documentación técnica detallada sobre la arquitectura, el entrenamiento o los benchmarks, su evaluación rigurosa requiere consultar fuentes adicionales o el propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como transformers, pero sin detalle) |
| Parametros totales | 30.697.345.596 (30.7B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se proporciona archivo imatrix, no los quants) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base (Vortex5/Glimmering-Citrus-31B) en la model card ni en los resultados de busqueda web. Se sabe que es un merge creado con mergekit, lo que sugiere una combinacion de multiples modelos preentrenados, pero se desconocen los componentes exactos, el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas. La unica informacion confirmada es que el modelo esta etiquetado como transformers y que el repositorio actual es una cuantizacion GGUF con imatrix, lo que implica que los pesos originales se han convertido a este formato para su uso en inferencia local.

## Capacidades

- Generacion de texto: el modelo esta disenado para tareas de roleplay y storytelling, por lo que es capaz de producir narrativa coherente y dialogos en ingles.
- Conversacion: etiquetado como "conversational", apto para chatbots y sistemas de dialogo multi-turno.
- Multilingue: no, solo soporta ingles (segun la etiqueta "en").
- Tool calling / function calling: no se menciona en la informacion disponible.
- Agentes y multi-step reasoning: no se menciona.
- Vision: no se menciona; aunque algunos resultados de busqueda sugieren que un modelo llamado "Muse Glimmer" de Meta tiene capacidades de vision, no hay evidencia de que Glimmering-Citrus sea ese modelo.

## Casos de uso

- Creacion de narrativa interactiva: el modelo puede generar historias ramificadas o continuar tramas en juegos de rol textuales, aprovechando su orientacion a storytelling.
- Chatbots de personaje: ideal para aplicaciones de roleplay donde se necesita mantener una personalidad consistente a lo largo de conversaciones largas.
- Generacion de dialogos para guiones o videojuegos: puede producir intercambios naturales entre personajes ficticios.
- Asistente de escritura creativa: ayuda a autores a explorar ideas, desarrollar personajes o superar bloqueos creativos.
- Simulacion de conversaciones para entrenamiento: util en entornos educativos o de investigacion para practicar tecnicas de entrevista o negociacion.
- Prototipado de asistentes conversacionales: al ser un modelo de 31B cuantizado, puede desplegarse en local para pruebas de concepto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~30.7B, una cuantizacion Q4_K_M tipica ocuparia aproximadamente 18-20 GB de VRAM, pero no se proporcionan los tamanos de los quants en este repositorio. Se recomienda al menos 24 GB de VRAM para una ejecucion comoda en GPU de consumo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (si se dispone de 40 GB) o GPUs con 24 GB o mas de memoria.
- Compatibilidad con consumer GPU: si, siempre que se utilice una cuantizacion adecuada (Q4 o inferior) y se disponga de suficiente VRAM.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores que soporten este formato. Tambien se puede usar con vLLM si se convierte a otro formato, aunque no es el caso directo.
- Latencia y throughput: no se proporcionan datos. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo base es un merge sin documentacion publica, y no se conocen sus resultados frente a alternativas como Llama 3.1 30B, Qwen 2.5 32B o Mistral Large 2. Se recomienda consultar el repositorio del modelo base (Vortex5/Glimmering-Citrus-31B) para obtener datos comparativos, si estan disponibles.

## Limitaciones y advertencias

- Idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir contenido sesgado o factualmente incorrecto, especialmente en tareas de roleplay donde la creatividad prima sobre la precision.
- Calidad de cuantizacion: al ser un repositorio de cuantizacion, la calidad final depende del tipo de quant elegido; cuantizaciones agresivas (Q2, Q3) pueden degradar significativamente el rendimiento.
- Falta de documentacion: no hay informacion sobre el proceso de entrenamiento, los datos utilizados ni las limitaciones especificas del modelo base, lo que dificulta evaluar su idoneidad para produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base tambien cumpla con esta licencia, ya que los merges pueden heredar restricciones de sus componentes.
- Repositorio incompleto: este repo solo contiene el archivo imatrix, no los quants listos para usar; los usuarios deben descargar los quants del repositorio estatico o generarlos ellos mismos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Glimmering-Citrus-31B-i1-GGUF
- Modelo base (Vortex5/Glimmering-Citrus-31B): https://huggingface.co/Vortex5/Glimmering-Citrus-31B
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Glimmering-Citrus-31B-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
