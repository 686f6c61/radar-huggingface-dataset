# Omeratias/arzillm

## Resumen

arzillm es un modelo de lenguaje experimental de 100,9 millones de parametros publicado por el usuario Omeratias en Hugging Face. Esta disenado especificamente para conversaciones cortas e informales en ingles y hebreo, y su rasgo mas diferencial es que procesa bytes UTF-8 en crudo sin un tokenizer aprendido, lo que elimina la dependencia de un vocabulario preentrenado y permite cubrir cualquier secuencia de texto en ambos idiomas sin tokens fuera de vocabulario.

El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse localmente en Apple Silicon mediante un runtime MLX propio del autor, no incluido en el repositorio de Hugging Face. El tamano del repo (0,4 GB) es coherente con un modelo de ~100M de parametros en precision de 16 bits, aunque no se especifica el formato exacto de los pesos.

La relevancia de arzillm es acotada: se trata de un experimento de arquitectura (tokenizacion a nivel de byte con runtime MLX) mas que de un modelo de proposito general. La model card es explicita sobre sus limitaciones: procesa cada mensaje de forma independiente, sin memoria conversacional, y puede dar respuestas incorrectas o fuera de tema, especialmente ante formulaciones poco habituales. No se han publicado benchmarks, detalles de arquitectura ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer a nivel de bytes, segun la model card) |
| Parametros totales | 100,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,4 GB; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card indica que arzillm procesa bytes UTF-8 en crudo sin tokenizer aprendido, lo que situa al modelo en la familia de arquitecturas byte-level. No se especifica si se trata de un transformer denso convencional, un modelo con atencion lineal u otra variante; tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni la funcion de activacion. El unico dato estructural confirmado es el recuento de parametros: 100,9 millones.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones como decodificacion especulativa. La model card menciona un runtime MLX personalizado para ejecucion local en Apple Silicon, pero no se incluye en el repositorio ni se documenta su implementacion. Tampoco se detalla la longitud de contexto soportada, un dato critico para evaluar el modelo en produccion.

## Capacidades

- Generacion de texto conversacional breve: responde a prompts cotidianos con respuestas cortas y completas, segun la model card.
- Procesamiento a nivel de byte: al operar sobre bytes UTF-8 en crudo, no depende de un vocabulario fijo y puede representar cualquier cadena en ingles o hebreo.
- Soporte bilingue limitado: ingles y hebreo, segun los metadatos del modelo.
- Ejecucion local en Apple Silicon mediante el runtime MLX del autor.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, razonamiento multi-paso ni modo thinking.
- Sin capacidades de vision, audio ni multimodalidad.
- Sin memoria conversacional: cada mensaje se procesa de forma independiente.

## Casos de uso

- Prototipado de chat local en Apple Silicon: el modelo puede integrarse en una aplicacion de escritorio para Mac que genere respuestas cortas sin conexion, aprovechando el runtime MLX y el reducido tamano de 100,9M de parametros.
- Experimentacion con tokenizacion byte-level: util como banco de pruebas para investigadores que quieran comparar el comportamiento de un modelo sin tokenizer frente a arquitecturas BPE o SentencePiece en tareas de generacion corta.
- Generacion de respuestas de una sola interaccion: adecuado para formularios, asistentes de FAQ o widgets donde cada consulta es independiente y no se requiere contexto previo.
- Procesamiento de texto en hebreo sin vocabulario preentrenado: el enfoque byte-level evita problemas de cobertura lexica en un idioma con morfologia rica y alfabeto no latino.
- Demos educativas de modelos de lenguaje: su tamano reducido y licencia Apache 2.0 permiten usarlo en cursos o talleres para ilustrar el ciclo completo de inferencia local.
- Evaluacion comparativa de runtimes: sirve para medir latencia y consumo de memoria de MLX frente a otras alternativas (llama.cpp, vLLM) en hardware Apple, aunque no se publican cifras de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 100,9M de parametros, una estimacion razonable en FP16 seria de aproximadamente 0,2 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,1 GB, pero son calculos derivados del recuento de parametros, no datos publicados.
- GPU recomendadas: la model card solo menciona ejecucion en Apple Silicon mediante MLX; no se documentan GPU NVIDIA ni AMD.
- Compatibilidad con GPU de consumo: por tamano, cabria en cualquier GPU consumer moderna (RTX 3060 en adelante), pero no hay confirmacion de que existan pesos en formatos compatibles con CUDA.
- Opciones de despliegue: runtime MLX propietario del autor para Apple Silicon. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| arzillm | 100,9 M | no disponible | en, he | Apache 2.0 | Byte-level, runtime MLX, sin benchmarks |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 8.192 tokens | en (principalmente) | Apache 2.0 | Transformer con tokenizer BPE, benchmarks publicados, soporte en llama.cpp y transformers |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | multilingue (incluye hebreo parcial) | Apache 2.0 | Mayor tamano, tool calling, amplia disponibilidad de cuantizaciones |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | en (principalmente) | Apache 2.0 | Mayor capacidad pero mas exigente en recursos |

La comparacion es orientativa: arzillm no publica metricas, por lo que no es posible contrastar calidad frente a estas alternativas. Su ventaja diferencial es el enfoque byte-level y el soporte nativo de hebreo sin tokenizer; su desventaja es la ausencia de documentacion tecnica y de ecosistema de despliegue.

## Limitaciones y advertencias

- Sin memoria conversacional: cada mensaje se procesa de forma aislada, lo que impide mantener contexto en dialogos multi-turno.
- Riesgo elevado de respuestas incorrectas o fuera de tema, segun reconoce el propio autor, especialmente ante formulaciones poco familiares.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin una evaluacion propia.
- Documentacion tecnica minima: no se detallan arquitectura interna, contexto maximo, datos de entrenamiento ni formato de pesos.
- Cobertura linguistica limitada a ingles y hebreo; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Dependencia de un runtime MLX propietario del autor, no incluido en el repositorio, lo que complica la reproducibilidad y el despliegue fuera de Apple Silicon.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no haber datos de calidad ni de sesgos, el usuario asume todo el riesgo de validacion.
- Riesgo de sesgos no evaluado: no se ha publicado ninguna auditoria de sesgo ni de seguridad.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omeratias/arzillm
- No se han encontrado papers, blogs, repositorios de codigo, demos ni documentacion adicional del runtime MLX en la informacion disponible.
