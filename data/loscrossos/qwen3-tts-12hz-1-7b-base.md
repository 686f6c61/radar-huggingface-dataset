# loscrossos/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba. Se trata del modelo base de 1,7 B de parámetros de la familia, pensado para clonación rápida de voz a partir de unos 3 segundos de audio de referencia y para servir como punto de partida para fine-tuning de otros modelos TTS. El repositorio analizado (`loscrossos/Qwen3-TTS-12Hz-1.7B-Base`) es un espejo de terceros del modelo original `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, con 0 descargas y 0 likes en el momento de la consulta.

La propuesta técnica es un LM discreto con múltiples codebooks (discrete multi-codebook LM) que modela el habla de extremo a extremo, evitando la cascada habitual LM + DiT y sus cuellos de botella de información. El modelo se apoya en el tokenizador acústico propio Qwen3-TTS-Tokenizer-12Hz, que comprime la señal a 12 Hz preservando información paralingüística y del entorno acústico. Según el autor, cubre 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y soporta generación en streaming con una latencia extremo a extremo declarada de 97 ms.

Su relevancia práctica está en dos ejes: latencia muy baja para interacción en tiempo real (con arquitectura de streaming híbrida de doble pista que permite emitir el primer paquete de audio tras un solo carácter de entrada) y licencia Apache 2.0, que facilita el uso comercial y la modificabilidad. No se han publicado en la información disponible resultados de benchmarks objetivos ni detalles de la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook extremo a extremo (Qwen3-TTS), con tokenizador acústico Qwen3-TTS-Tokenizer-12Hz y generación en streaming híbrida de doble pista (Dual-Track) |
| Parametros totales | 1.928.677.440 (1,93 B), según safetensors |
| Parametros activos | No aplica: la información disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; los pesos se publican en safetensors y el repo ocupa 4,5 GB, tamaño compatible con precisión bf16 |
| Idiomas soportados | 10: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, además de perfiles de voz dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de LM discreto con múltiples codebooks que modela directamente tokens acústicos en lugar de predecir mel-espectrogramas para luego sintetizar con un vocoder DiT. La señal de voz se representa con el tokenizador propio Qwen3-TTS-Tokenizer-12Hz (12 tramas por segundo), que actúa como codificador y decodificador: comprime el audio y lo reconstruye mediante una arquitectura ligera no basada en DiT. El autor sostiene que este esquema preserva información paralingüística (timbre, prosodia, emoción) y las características del entorno acústico, y que evita las pérdidas de información y los errores en cascada típicos de los pipelines LM + DiT.

La generación se apoya en una arquitectura de streaming híbrida de doble pista: un único modelo cubre modo streaming y no streaming, y puede emitir el primer paquete de audio en cuanto se introduce un carácter, con latencia extremo a extremo declarada de 97 ms. La variante Base está orientada a clonación de voz a partir de audio del usuario (unos 3 segundos) y a fine-tuning; a diferencia de las variantes VoiceDesign y CustomVoice, la tabla del autor no marca soporte de control por instrucciones en esta variante.

No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni detalles del proceso de alineación. Tampoco se detalla la ventana de contexto del modelo de lenguaje subyacente. La referencia técnica citada en los metadatos es el preprint arXiv:2601.15621.

## Capacidades

- Síntesis de voz multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, con perfiles de voz dialectales adicionales.
- Clonación rápida de voz a partir de una muestra de audio del usuario de unos 3 segundos (capacidad específica de la variante Base).
- Generación en streaming y no streaming con el mismo modelo, con el primer paquete de audio disponible tras un solo carácter de entrada.
- Comprensión contextual del texto para adaptar tono, velocidad de habla y expresión emocional según la semántica del texto, según declara el autor.
- Robustez mejorada frente a texto de entrada ruidoso (afirmación del autor, sin métricas publicadas).
- Preservación de información paralingüística y de entorno acústico gracias al tokenizador de 12 Hz.
- Base para fine-tuning de otros modelos TTS de la familia.
- No se documenta en la información disponible soporte de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la muestra de referencia para clonación.

## Casos de uso

- Clonación de voz personalizada para asistentes: a partir de 3 segundos de audio del usuario se puede construir una voz consistente para un asistente conversacional, sin necesidad de entrenamiento adicional.
- Agentes de voz en tiempo real: con una latencia declarada de 97 ms hasta el primer paquete de audio y modo streaming, encaja en pipelines de telefonía o atención al cliente donde la respuesta hablada debe empezar antes de que el LLM termine de generar el texto.
- Locución y doblaje multilingüe: un mismo contenido puede sintetizarse en los 10 idiomas soportados, manteniendo un perfil de voz común para una marca o un narrador.
- Audiolibros y contenido largo: el modo no streaming permite generar fragmentos completos con control de velocidad y entonación según la semántica del texto.
- Accesibilidad y lectura en voz alta: integración en aplicaciones que convierten texto en audio para personas con discapacidad visual, con voces personalizables por usuario.
- Prototipado de productos de voz y fine-tuning: al ser un modelo base de 1,93 B, se puede ajustar con datasets propios (dominio, idioma, estilo) y servir como punto de partida de variantes especializadas.
- Pruebas A/B de voces en marketing: generar variantes de un mismo guion con distintos timbres y ritmos para evaluar preferencia antes de producir la locución definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas comparativas de métricas objetivas (WER, MOS, similitud de hablante) frente a otros sistemas TTS.

Datos declarados por el autor, no verificables con la información disponible:

| Dato declarado | Valor |
|---|---|
| Latencia extremo a extremo (streaming) | 97 ms |
| Primer paquete de audio | Inmediato tras un solo carácter de entrada |
| Frecuencia del tokenizador acústico | 12 Hz |
| Audio necesario para clonación | 3 segundos |
| Idiomas cubiertos | 10 |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,93 B de parámetros, no confirmado por el autor): en bf16/fp16, unos 3,9 GB solo de pesos, con 5-6 GB contando activaciones y buffers; en int8, alrededor de 2 GB; en int4, alrededor de 1,2 GB. Son estimaciones, no cifras oficiales.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con margen amplio en bf16; tarjetas de 8 GB pueden requerir cuantización o gestión cuidadosa de memoria.
- GPU de datacenter recomendadas para servicio concurrente: NVIDIA L4, A10, A100 y H100, en función del número de streams simultáneos y del modo streaming.
- Despliegue: el autor menciona el paquete `qwen-tts` y vLLM como rutas de carga del modelo (los pesos se descargan automáticamente por nombre de modelo). También se documenta la descarga manual vía ModelScope o `huggingface-cli`. No se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la única cifra publicada es la latencia extremo a extremo de 97 ms en modo streaming. No hay datos de throughput (caracteres o segundos de audio por segundo) ni de rendimiento con batching.

## Comparativa con modelos similares

La información disponible solo permite comparar dentro de la propia familia Qwen3-TTS; no se han proporcionado datos de sistemas TTS de otros proveedores.

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (este) | 1,93 B | 10 | Si | No indicado en la tabla del autor | Si (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7 B | 10 | Si | Si (9 timbres premium) | No indicado | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7 B | 10 | Si | Si (diseno por descripcion) | No indicado | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6 B | 10 | Si | No indicado | Si (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6 B | 10 | Si | Si (9 timbres premium) | No indicado | Apache 2.0 |

Alternativas de otros fabricantes (por ejemplo, sistemas TTS open source equivalentes en tamaño o tarea): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar calidad (MOS), inteligibilidad (WER) ni similitud de hablante frente a alternativas; cualquier decisión de producción debería basarse en una evaluación propia.
- El repositorio analizado es un espejo de terceros con 0 descargas y 0 likes; conviene usar el repositorio oficial `Qwen/Qwen3-TTS-12Hz-1.7B-Base` para garantizar integridad y actualizaciones.
- La model card proporcionada está truncada; pueden faltar secciones sobre limitaciones, uso responsable y detalles de entrenamiento.
- La clonación de voz permite usos suplantatorios (deepfakes de audio). Aunque la licencia Apache 2.0 permite uso comercial, en la UE es exigible consentimiento explícito del hablante y el cumplimiento del AI Act en materia de transparencia sobre contenido sintético.
- Esta variante Base no figura con control por instrucciones en la tabla del autor; para control de estilo o timbre por lenguaje natural hay que usar las variantes CustomVoice o VoiceDesign.
- Longitud de contexto del LM subyacente no disponible: no se puede garantizar el comportamiento en textos muy largos sin fragmentación previa.
- Cobertura idiomática declarada pero sin métricas por idioma; el rendimiento en español y en variedades dialectales no está cuantificado.
- Riesgo de alucinación acústica o de prosodia incorrecta en texto con números, siglas, abreviaturas o puntuación ambigua; el autor afirma robustez frente a texto ruidoso, pero sin datos públicos que lo respalden.
- Sesgos potenciales en los timbres y perfiles de voz incluidos (género, edad, dialecto) que pueden no representar adecuadamente a determinados grupos de hablantes; no se documenta composición del dataset.
- No se documentan requisitos de atribución ni restricciones adicionales más allá de Apache 2.0, pero deben verificarse en el repositorio oficial.

## Enlaces

- Repositorio analizado: https://huggingface.co/loscrossos/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio original referenciado en la model card: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador acústico: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante con control por instrucciones: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Variante de diseño de voz: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante base pequena: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Preprint citado en los metadatos: https://arxiv.org/abs/2601.15621
- Imagen de introduccion citada por el autor: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura citado por el autor: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
- Descarga vía ModelScope: `modelscope download --model Qwen/Qwen3-TTS-12Hz-1.7B-Base --local_dir ./Qwen3-TTS-12Hz-1.7B-Base`
- Descarga vía Hugging Face CLI: `huggingface-cli download Qwen/Qwen3-TTS-12Hz-1.7B-Base --local-dir ./Qwen3-TTS-12Hz-1.7B-Base`
