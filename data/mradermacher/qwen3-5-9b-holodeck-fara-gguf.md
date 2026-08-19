# mradermacher/Qwen3.5-9B-Holodeck-Fara-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo `nightmedia/Qwen3.5-9B-Holodeck-Fara`, un fine-tune y merge de la familia Qwen3.5-9B orientado a la escritura creativa, la generación de ficción y el roleplaying. El modelo base ha sido sometido a un proceso de "abliteración" (eliminación de rechazos) y se distribuye como "uncensored", lo que permite una generación de texto sin restricciones temáticas, aunque con los riesgos asociados a ese enfoque. El autor de la cuantización, mradermacher, proporciona múltiples niveles de compresión (desde Q2_K hasta f16) y archivos multimodales (mmproj) que sugieren capacidades de visión cuando se combinan con el proyector adecuado.

El modelo tiene aproximadamente 8.950 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones propias. Su relevancia actual radica en ofrecer una alternativa de código abierto, de tamaño medio, especializada en tareas narrativas y de rol, con soporte para inglés y chino. Al ser una versión cuantizada, puede ejecutarse en hardware de consumo, lo que amplía su accesibilidad para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, sin detalles publicos) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj Q8_0 y f16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama, etc.) |

## Arquitectura y entrenamiento

El modelo base `nightmedia/Qwen3.5-9B-Holodeck-Fara` es un merge creado con mergekit y posteriormente afinado con la herramienta Unsloth, segun los tags de la model card. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Los tags "heretic", "abliterated" y "uncensored" indican que se aplico un proceso de eliminacion de las capas de rechazo tipicas de los modelos alineados, con el objetivo de permitir una generacion de contenido sin censura tematica.

La cuantizacion GGUF realizada por mradermacher no altera la arquitectura subyacente; solo convierte los pesos a formatos de menor precision para reducir el uso de memoria y acelerar la inferencia en CPU o GPU. La presencia de archivos `mmproj` (proyeccion multimodal) sugiere que el modelo base podria tener capacidades de procesamiento de imagenes, aunque no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto creativo: ficcion, ciencia ficcion, romance y otros generos, con enfasis en prosa vivida y detallada.
- Escritura narrativa: creacion de tramas, subtramas, continuacion de escenas y desarrollo de historias completas.
- Roleplaying: interaccion conversacional para juegos de rol, con capacidad de mantener personajes y contextos.
- Generacion de dialogos y descripciones: util para guiones, novelas o contenido interactivo.
- Soporte multilingue: ingles y chino, segun la model card.
- Posible soporte multimodal: los archivos `mmproj` incluidos en el repo sugieren que el modelo puede procesar imagenes cuando se combina con un proyector de vision, aunque no hay documentacion oficial al respecto.
- Sin restricciones de contenido: al estar "uncensored", no aplica filtros de seguridad estandar, lo que permite explorar temas sensibles (con los riesgos asociados).

## Casos de uso

- Escritura de ficcion asistida: un autor puede usar el modelo para generar borradores de capitulos, sugerir giros argumentales o describir escenarios. Su ventana de contexto (aunque no especificada) y su entrenamiento en narrativa lo hacen adecuado para mantener coherencia en textos largos.
- Juegos de rol por texto: el modelo puede actuar como director de juego o como personaje no jugador, respondiendo a las acciones del usuario con coherencia y creatividad. Su naturaleza "uncensored" permite tramas adultas sin restricciones.
- Generacion de contenido para videojuegos: creacion de dialogos, misiones o descripciones de objetos para juegos independientes, aprovechando su capacidad de generar texto variado y contextual.
- Creacion de guiones para medios audiovisuales: el modelo puede esbozar escenas, escribir dialogos o estructurar secuencias narrativas, acelerando el trabajo de guionistas.
- Asistente de escritura creativa en chino e ingles: al soportar ambos idiomas, puede ayudar a redactar contenido bilingue o traducir creativamente manteniendo el tono narrativo.
- Prototipado rapido de narrativa interactiva: desarrolladores de novelas visuales o ficcion interactiva pueden integrar el modelo via API para generar respuestas dinamicas en funcion de las elecciones del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version base. La ausencia de estas cifras impide comparaciones objetivas con otros modelos de tamano similar.

## Requisitos de hardware

- Inferencia en CPU: las cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) pueden ejecutarse en sistemas con al menos 8 GB de RAM, aunque con velocidades modestas. Se recomienda usar llama.cpp o Ollama.
- GPU consumer: una GPU con 8 GB de VRAM (por ejemplo, RTX 3060 o RTX 4060) puede cargar la cuantizacion Q4_K_M (5,7 GB) o Q5_K_S (6,4 GB). Para Q8_0 (9,6 GB) se necesitan 12 GB de VRAM (RTX 3060 12GB, RTX 4070 Ti).
- GPU profesional: para la version f16 (18 GB) se recomienda una GPU con 24 GB de VRAM, como A100 40GB, RTX 4090 o RTX A6000.
- Despliegue: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). No es compatible directamente con vLLM o TGI, que requieren pesos en formato safetensors.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de entre 30 y 60 tokens por segundo para un modelo de 9B, pero son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Holodeck-Fara (GGUF) | 8,95 B | no disponible | Apache 2.0 | GGUF | Escritura creativa, roleplaying, sin censura |
| Qwen3-8B (base) | 8,1 B | 32K (tipico en Qwen3) | Apache 2.0 | safetensors, GGUF | Modelo generalista, razonamiento y codigo |
| Llama-3.1-8B-Instruct | 8,03 B | 128K | Llama 3.1 (uso comercial permitido) | safetensors, GGUF | Asistente general, multilingue |
| Mistral-7B-Instruct | 7,24 B | 32K | Apache 2.0 | safetensors, GGUF | Asistente general, eficiente |

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento publicados para el modelo evaluado. La principal diferencia de Holodeck-Fara es su especializacion en narrativa y su ausencia de filtros de contenido, frente a alternativas mas equilibradas en tareas generales.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser un modelo "uncensored" y "abliterated", puede generar texto ofensivo, explicito o perjudicial. No es apto para aplicaciones donde se requiera moderacion automatica.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos, nombres o detalles inconsistentes, especialmente en contextos largos.
- Contexto limitado: no se ha confirmado la longitud de contexto soportada. Es probable que herede la ventana de Qwen3.5-9B (posiblemente 32K o 128K), pero sin datos oficiales no se puede garantizar.
- Sesgos: el entrenamiento en datos no filtrados puede amplificar sesgos sociales, culturales o de genero presentes en el corpus.
- Idiomas: solo ingles y chino estan declarados; otros idiomas pueden tener un rendimiento deficiente.
- Soporte multimodal incierto: los archivos mmproj existen, pero no hay documentacion que confirme el funcionamiento de la vision. Se recomienda probar antes de usarlo en produccion.
- Requisitos de hardware: las versiones de mayor precision (Q8_0, f16) requieren GPUs con mucha VRAM, lo que puede limitar su uso en entornos modestos.
- Mantenimiento: el repositorio no muestra actividad reciente (creado en agosto de 2026) y el autor no garantiza actualizaciones ni soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Holodeck-Fara-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Fara
- Pagina de referencia del autor (lista de archivos): https://hf.tst.eu/model#Qwen3.5-9B-Holodeck-Fara-GGUF
- Guia de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de Qwen3.5 en Ollama (informacion general): https://ollama.com/library/qwen3.5:9b
