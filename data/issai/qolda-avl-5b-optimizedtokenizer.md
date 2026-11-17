# issai/Qolda-AVL-5B-OptimizedTokenizer

## Resumen

Qolda-AVL-5B-OptimizedTokenizer es un modelo audio-vision-lenguaje de 5.260 millones de parametros desarrollado por ISSAI (Instituto de Investigacion en Inteligencia Artificial de Kazajistan). Extiende el modelo de chat multimodal Qwen3.5-4B con una rama de audio basada en el encoder de Whisper-large-v3-turbo afinado para kazajo, y esta disenado especificamente para kazajo, ruso e ingles. Resuelve el problema de dotar de comprension de voz a un modelo de lenguaje compacto sin degradar sus capacidades de texto y vision.

La innovacion principal es arquitectonica y de entrenamiento: el modelo de lenguaje y el encoder de audio permanecen congelados, y el audio se incorpora mediante un conector entrenable (13 M de parametros) mas un adaptador LoRA de solo audio (r=16, 30,5 M) que se activa unicamente cuando el prompt contiene audio. Esto garantiza que las respuestas de texto e imagen sean identicas bit a bit a las del modelo de chat base. Ademas, el conector reduce la secuencia de audio a 12,5 tokens por segundo (4 veces menos que su predecesor), lo que abarata el coste de contexto en inferencia.

El modelo incorpora un tokenizador optimizado para kazajo y ruso que reduce el numero de tokens necesarios para texto kazajo en un factor de 1,98 respecto a Qwen3.5, con un promedio de 1,76 tokens por palabra en kazajo frente a 3,48 del modelo original. Con 4.579.897.856 parametros en pesos safetensors y licencia Apache 2.0, se posiciona como una opcion practica para aplicaciones de voz en lenguas de Asia Central.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Qwen3.5-4B (congelado) + encoder Whisper-large-v3-turbo (congelado) + conector entrenable + LoRA de solo audio |
| Parametros totales | 5.260 millones (4,58 B en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | kazajo (kk), ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina tres componentes. El modelo de lenguaje es issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer, un Qwen3.5 de 4,58 B con tokenizador optimizado para kazajo y ruso, que permanece completamente congelado. El encoder de audio es el de Whisper-large-v3-turbo (0,64 B), afinado previamente por ISSAI para kazajo y tambien congelado, que produce 50 frames por segundo de audio. El conector realiza `average-pool x4 → LayerNorm → Linear → GELU → Linear`, convirtiendo 4 frames de Whisper en un token de audio, de modo que un segundo de audio equivale a 12,5 tokens en el modelo de lenguaje. Adicionalmente, una segunda entrada lee la capa 18 de Whisper (capa intermedia con mas informacion de hablante: 93% de precision en deteccion de genero frente al 51% de la ultima capa) mediante su propio LayerNorm y una proyeccion inicializada a cero.

El entrenamiento se realizo en dos etapas con el LLM y el encoder congelados. La etapa 1 entreno solo el conector con una pasada sobre 2,22 M de ejemplos (learning rate 1e-4, cosine, 50% de respuestas con modo thinking). La etapa 2 entreno el conector, la entrada de capa 18 y un adaptador LoRA (r=16, alpha=32, 30,5 M de parametros) sobre las proyecciones de atencion, atencion lineal y MLP de las 32 capas del LLM, con 425 k ejemplos (learning rate 5e-5 para el conector y 1e-4 para el LoRA). El LoRA se activa solo con prompts de audio; desactivado, los logits de texto e imagen son identicos bit a bit al modelo de chat (diferencia maxima 0,0 en kazajo, ruso, ingles e imagen).

Los datos de entrenamiento incluyen reconocimiento de voz en ingles (652 k, 29%), ruso (558 k, 25%) y kazajo (132 k, 12%), identificacion de idioma en 17 lenguas (244 k, 11%), traduccion de voz ingles→kazajo (134 k, 6%), instrucciones habladas autodestiladas (134 k, 6%), sonidos cotidianos y musica (63 k x2 y 44 k, 6% y 2%), y genero, emocion y sonidos de animales (30 k x3, 4%). El 1% de las filas se reservo para test y se eliminaron del entrenamiento los clips presentes en el conjunto de test SAKURA.

## Capacidades

- Generacion de texto con modo thinking explicito mediante etiquetas `<think> … </think>`.
- Comprension de imagen (vision) heredada del modelo de chat Qwen3.5-4B, con logits identicos al modelo base.
- Reconocimiento automatico de voz (ASR) en kazajo, ruso e ingles.
- Traduccion de voz, incluyendo ingles→kazajo.
- Identificacion de idioma hablado en 17 lenguas.
- Preguntas y respuestas sobre audio (audio question answering), incluyendo tareas de SAKURA y SpokenMQA.
- Clasificacion de genero del hablante, emocion y sonidos de animales.
- Reconocimiento de sonidos cotidianos y musica.
- Instrucciones habladas: respuestas generadas a partir de la transcripcion del audio.
- Entrada de audio de 0,3 a 30 segundos por prompt, con cualquier frecuencia de muestreo (remuestreada a 16 kHz).
- Soporte multilingue en kazajo, ruso e ingles.
- No se menciona soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- **Transcripcion de reuniones en kazajo y ruso**: el modelo puede convertir audio de hasta 30 segundos por clip en texto, con un coste de 12,5 tokens por segundo de audio que permite procesar segmentos largos encadenando clips sin agotar el contexto.
- **Atencion al cliente por voz en kazajo**: al combinar ASR y razonamiento en un solo modelo, se puede construir un asistente que transcriba la consulta del usuario y genere una respuesta en la misma pasada, con el modo thinking activable para consultas complejas.
- **Traduccion de contenido audiovisual ingles→kazajo**: el modelo fue entrenado especificamente con 134 k ejemplos de traduccion de voz ingles→kazajo, lo que lo hace adecuado para subtitulado y localizacion de material formativo.
- **Analisis de llamadas con deteccion de emocion y genero**: la lectura de la capa 18 de Whisper aporta informacion de hablante (93% de precision en genero), util para enrutamiento de llamadas o control de calidad en centros de contacto.
- **Accesibilidad para personas con discapacidad visual**: el modelo acepta imagen y audio en el mismo prompt, por lo que puede describir el entorno a partir de una foto y una consulta hablada, manteniendo intactas las capacidades de vision del modelo base.
- **Procesamiento de archivos de audio en lote**: al estar el LLM y el encoder congelados y el LoRA desactivado para texto, se puede desplegar una unica instancia que sirva tanto peticiones de texto e imagen (identicas al modelo de chat) como peticiones de audio, simplificando la infraestructura.
- **Clasificacion de sonidos ambientales y musica**: con 63 k ejemplos de sonidos cotidianos y 44 k de musica, sirve para etiquetado de archivos de audio en bibliotecas o plataformas de contenido.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan tres modelos en tres areas. La tabla de audio question answering solo muestra el valor de Qolda-AVL-5B (68,3) y el modelo nuevo queda 2,7 puntos por detras, es decir, 65,6, aunque el resto de cifras de audio no se detallan en la informacion disponible.

| Metrica | Qwen3.5-4B | Qolda-AVL-5B | Qolda-AVL-5B-OptimizedTokenizer |
|---|---|---|---|
| Tokens por palabra, kazajo | 3,48 | no disponible | 1,76 |
| Tokens por palabra, ruso | 1,89 | no disponible | 1,72 |
| Tokens por palabra, ingles | 1,25 | no disponible | 1,25 |
| Tokens de audio por segundo | no aplica | 50 | 12,5 |
| Media en texto kazajo (7 benchmarks) | 76,44 | 70,88 | 78,33 |
| Media en vision (9 benchmarks) | 74,2 | 68,2 | 74,2 |
| Media en audio QA (20 tareas) | no aplica | 68,3 | 65,6 (2,7 puntos menos) |

No se han publicado en la informacion disponible los resultados individuales de los benchmarks que componen cada media, ni datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,5 GB solo para pesos (5,26 B x 2 bytes), mas overhead de activaciones y cache KV; se recomienda un minimo de 16 GB para audio de hasta 30 segundos.
- GPU recomendadas: A100 40 GB o H100 para despliegue en produccion con batching; RTX 4090 (24 GB) o L40S para inferencia individual.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en bfloat16; en GPUs de 16 GB requeriria cuantizacion, para la cual no se han publicado pesos ni recetas en la informacion disponible.
- Opciones de despliegue: no se especifican en la model card; al usar safetensors y arquitectura compatible con Qwen3.5, es previsible su uso con vLLM o TGI, pero la integracion del conector y el LoRA de audio requiere verificacion previa. No se confirma soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qolda-AVL-5B-OptimizedTokenizer | 5,26 B | no disponible | 12,5 tokens/s | kk, ru, en | Apache 2.0 | Hugging Face |
| Qolda-AVL-5B | no disponible | no disponible | 50 tokens/s | kk, ru, en | no disponible | Hugging Face |
| Qwen3.5-4B | 4 B (aprox.) | no disponible | no | no disponible | no disponible | Hugging Face |

Frente a Qolda-AVL-5B, el modelo nuevo mejora texto kazajo (78,33 frente a 70,88) y vision (74,2 frente a 68,2), reduce los tokens de audio por segundo de 50 a 12,5 y mejora el reconocimiento de voz en ruso e ingles y la traduccion de voz, aunque queda 2,7 puntos por detras en audio question answering. Frente a Qwen3.5-4B, iguala la media de vision (74,2) y supera la media de texto kazajo (78,33 frente a 76,44) gracias al tokenizador optimizado, anadiendo audio a un coste de contexto mucho menor.

## Limitaciones y advertencias

- El modelo queda 2,7 puntos por detras de Qolda-AVL-5B en audio question answering (65,6 frente a 68,3), por lo que para tareas puras de QA sobre audio el predecesor puede ser preferible.
- Acepta un solo clip de audio por prompt, con duracion limitada a 30 segundos; audios mas largos requieren segmentacion externa.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar con precision prompts largos que combinen audio, imagen y texto.
- Solo cubre kazajo, ruso e ingles; el rendimiento fuera de estas lenguas no esta documentado.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad; como todo modelo generativo, existe riesgo de alucinacion en respuestas de texto y de transcripciones erroneas en audio con ruido o acentos no representados en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan las condiciones de los datos de entrenamiento de terceros (Whisper, Qwen) que podrian aplicar restricciones adicionales.
- El adaptador LoRA debe activarse explicitamente solo para prompts con audio; una integracion incorrecta puede degradar las respuestas de texto e imagen, que de otro modo son identicas al modelo de chat.
- No se confirma soporte en frameworks de inferencia habituales (vLLM, llama.cpp, Ollama), lo que anade riesgo de integracion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/Qolda-AVL-5B-OptimizedTokenizer
- Modelo base de chat: https://huggingface.co/issai/Qwen3.5-4B-Kazakh-OptimizedTokenizer
- Predecesor: https://huggingface.co/issai/Qolda-AVL-5B
- Modelo de referencia sin audio: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de vision original: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Encoder de audio: https://huggingface.co/openai/whisper-large-v3-turbo
