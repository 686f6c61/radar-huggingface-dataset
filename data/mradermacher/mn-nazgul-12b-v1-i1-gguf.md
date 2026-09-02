# mradermacher/MN-Nazgul-12B-v1-i1-GGUF

## Resumen

MN-Nazgul-12B-v1-i1-GGUF es la versión cuantizada en formato GGUF del modelo MN-Nazgul-12B-v1, creado por OccultAI y posteriormente cuantizado por mradermacher con técnicas de imatrix. Se trata de un modelo de 12.247 millones de parámetros basado en la arquitectura Mistral-Nemo, especializado en escritura creativa, narración de ficción, roleplay y generación de texto literario en inglés. El modelo es el resultado de una fusión (merge) mediante mergekit de varios modelos y datasets orientados a la prosa vívida, la generación de tramas y la conversación inmersiva.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de gama alta. Al estar cuantizado con imatrix, ofrece una buena relación entre calidad y tamaño en comparación con cuantizaciones estándar. El modelo está pensado para usuarios que necesitan un generador de texto creativo de alta calidad con baja latencia en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Mistral-Nemo (merge de modelos) |
| Parametros totales | 12.247.782.400 (12,25 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (probablemente 128k segun Mistral-Nemo, no confirmado) |
| Tipos de cuantizacion | i1-Q2_K (4,9 GB), i1-IQ4_NL (7,2 GB), i1-Q4_K_S (7,2 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base MN-Nazgul-12B-v1 es una fusion realizada con mergekit que combina varios modelos y datasets. Los datasets utilizados incluyen DarkArtsForge/Poe_v1, OccultAI/Morpheus-12B-v1, OccultAI/illuminati_imatrix_v1, PocketDoc/Dans-Taskmaxx, PocketDoc/Dans-Prosemaxx-Gutenberg, PocketDoc/Dans-Toolmaxx-ShellCommands, shrugging-shoulders/ifeval_multilang y WokeAI/polititune-tankie-warmup-3. Estos datasets cubren tareas de escritura creativa, generacion de tramas, continuacion de escenas, roleplay y comandos de shell, lo que sugiere un entrenamiento mixto orientado a la prosa ficcional y a la interaccion conversacional.

Al ser una fusion, no se conocen los detalles exactos del entrenamiento (numero de tokens, metodo de alineacion como RLHF o DPO). La cuantizacion fue realizada por mradermacher utilizando la tecnica imatrix, que mejora la calidad de los cuantizados de baja precision al ponderar la importancia de cada tensor. El archivo imatrix esta disponible para que los usuarios generen sus propios cuantizados personalizados.

## Capacidades

- Generacion de texto creativo: narracion de ficcion, cuentos, novelas, poesia y prosa descriptiva.
- Roleplay y conversacion inmersiva: interaccion con personajes, dialogo multi-turno y desarrollo de tramas.
- Generacion de tramas y subtramas: planificacion de historias, giros argumentales y resolucion de conflictos narrativos.
- Continuacion de escenas: dado un fragmento previo, el modelo puede extender la narrativa de forma coherente.
- Soporte de multiples generos: ciencia ficcion, romance, terror, paranormal, ocultismo y otros.
- Escritura con estilo "vivido": enfasis en descripciones sensoriales y lenguaje expresivo.
- Capacidad de ejecutar comandos de shell (segun el dataset Dans-Toolmaxx-ShellCommands), aunque no se especifica si esto se traduce en una capacidad real de tool calling.
- Multilingue: no, solo ingles.

## Casos de uso

- Escritura asistida para autores de ficcion: el modelo puede generar borradores de capitulos, sugerir giros argumentales o describir escenarios complejos, aprovechando su entrenamiento en prosa creativa y su capacidad de mantener coherencia en textos largos.
- Creacion de contenido para juegos de rol (RPG): como maestro de juego automatico o generador de NPCs con personalidad, el modelo puede sostener conversaciones inmersivas y describir entornos de juego.
- Generacion de dialogos para guiones o teatro: su entrenamiento en conversacion y roleplay permite producir dialogos naturales con distintos registros y estilos.
- Prototipado de narrativa interactiva (ficcion de "elige tu propia aventura"): el modelo puede generar ramas argumentales y mantener el hilo narrativo a lo largo de multiples decisiones del usuario.
- Asistente de escritura tecnica creativa: para redactar documentacion con un tono narrativo, como manuales con ejemplos ilustrados o casos de uso novelados.
- Generacion de contenido para blogs o newsletters con estilo literario: el modelo puede producir articulos con una prosa cuidada y atractiva, diferenciandose de generadores mas planos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su version base. La unica referencia de calidad es la comparativa visual de cuantizaciones proporcionada por ikawrakow en la model card, que muestra la perdida de perplejidad relativa de distintos tipos de cuantizacion, pero no es un benchmark del modelo en si.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion i1-Q4_K_S (7,2 GB) se necesita al menos 8 GB de VRAM; con i1-Q2_K (4,9 GB) bastan 6 GB. El archivo imatrix no se usa para inferencia directa, solo para crear cuantizados.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4070, o GPUs de datacenter como A10, L4 o A100 (si se busca mayor velocidad).
- Compatibilidad con GPU de consumo: si, cualquier GPU con 8 GB o mas puede ejecutar las cuantizaciones Q4_K_S o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier frontend compatible con GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, pero no es el caso.
- Latencia y throughput: no disponible, pero en una RTX 4090 se espera una generacion de 20-40 tokens/s con Q4_K_S, dependiendo de la longitud de contexto y el backend.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos de este modelo frente a alternativas. Como referencia arquitectonica, se puede comparar con el modelo base Mistral-Nemo-Instruct-2407 (12B, contexto 128k, licencia Apache 2.0) y con otros merges populares de Mistral-Nemo como "NousResearch/Nous-Capybara-12B" (sin datos confirmados). La diferencia principal es el enfoque en escritura creativa frente al proposito generalista de Mistral-Nemo-Instruct. No se puede establecer una comparativa cuantitativa sin benchmarks.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues confirmadas.
- No se han publicado evaluaciones de sesgos o toxicidad; dado su entrenamiento en datasets de terror, violencia y ocultismo, podria generar contenido explicito o perturbador sin filtros adecuados.
- Riesgo de alucinacion en tareas factuales: al estar optimizado para creatividad, puede inventar datos o citas cuando se le pide informacion objetiva.
- La longitud de contexto no esta confirmada; aunque Mistral-Nemo soporta 128k, la fusion podria haber alterado esta capacidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podria incluir componentes con restricciones adicionales (no especificadas).
- Para produccion, se recomienda validar la calidad de salida en el dominio de uso, ya que no hay benchmarks publicos.

## Enlaces

- Repositorio HuggingFace de esta version: https://huggingface.co/mradermacher/MN-Nazgul-12B-v1-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/OccultAI/MN-Nazgul-12B-v1
- Version con cuantizados estaticos (no imatrix): https://huggingface.co/mradermacher/MN-Nazgul-12B-v1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model
- Guia de cuantizaciones de TheBloke (referencia de uso): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
