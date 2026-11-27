# namkiett/phowhisper-qwen-asr

## Resumen

PhoWhisper-Qwen ASR es un modelo de reconocimiento automático del habla (ASR) especializado en vietnamita que combina un codificador de audio PhoWhisper con un decodificador basado en un LLM Qwen. Lo desarrolla el usuario namkiett y se distribuye en Hugging Face bajo licencia Apache 2.0. La propuesta arquitectónica es la de un "speech-LLM": en lugar de un decoder CTC o seq2seq clásico, se proyectan las representaciones acústicas al espacio de embeddings de un modelo de lenguaje para generar la transcripción.

El modelo emplea como codificador `vinai/PhoWhisper-medium` y como decodificador `Qwen/Qwen2.5-0.5B-Instruct`, unidos mediante un adaptador compuesto por una convolución Conv1D con downsampling 4x y un proyector MLP. El checkpoint publicado contiene 60.613.248 parámetros en formato safetensors, lo que sugiere que los pesos del codificador y del decodificador no se incluyen completos en el repositorio, sino que se cargan desde sus respectivos modelos base.

Su relevancia radica en la escasez de modelos ASR abiertos específicos para vietnamita con arquitectura speech-LLM y licencia permisiva. El modelo está pensado para transcripción de audio de 16 kHz y se integra con `transformers` mediante `trust_remote_code=True`, exponiendo una API simple de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-LLM (encoder PhoWhisper-medium + adaptador Conv1D/MLP + decoder Qwen2.5-0.5B-Instruct) |
| Parametros totales | 60.613.248 (safetensors publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código custom, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma speech-LLM: un encoder acústico preentrenado (`vinai/PhoWhisper-medium`) extrae representaciones del audio, que pasan por un adaptador formado por una capa Conv1D con factor de downsampling 4x y un proyector MLP. Estas representaciones proyectadas se inyectan en el decodificador `Qwen/Qwen2.5-0.5B-Instruct`, que genera el texto de la transcripción de forma autorregresiva. El checkpoint de pesos indicado en la model card proviene de `namkiett/phowhisper-qwen-phoaudio/phoaudio_final.pt`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el esquema de congelación de pesos (si el encoder y el LLM se mantienen congelados y solo se entrena el adaptador, o si hay fine-tuning parcial). El repositorio ocupa 2,0 GB y los 60,6 millones de parámetros publicados en safetensors parecen corresponder principalmente al adaptador y a componentes auxiliares, no al total del sistema.

## Capacidades

- Reconocimiento automático del habla en vietnamita a partir de audio de 16 kHz (archivos `.wav`, `.mp3` u arrays NumPy).
- Transcripción de voz a texto mediante una API de alto nivel (`model.transcribe(...)`).
- Integración con el ecosistema `transformers` mediante `AutoModel` y código remoto.
- Generación de texto autorregresiva gracias al decodificador Qwen2.5-0.5B-Instruct.
- No se documentan capacidades de traducción, diarización, timestamps, tool calling, agentes, visión ni audio más allá del ASR.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para vietnamita.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo convierte grabaciones de audio de 16 kHz en texto plano, adecuado para actas y resúmenes posteriores.
- Subtitulado automático de vídeo en vietnamita: se puede procesar el audio extraído de cada clip y generar subtítulos con un pipeline de segmentación previa.
- Atención al cliente y centros de llamadas: transcripción de grabaciones de soporte telefónico para análisis de calidad, búsqueda de palabras clave y auditoría.
- Generación de corpus textual a partir de archivos de audio: útil para investigadores que necesitan datasets de texto en vietnamita derivados de fuentes orales.
- Accesibilidad: conversión de contenido hablado (podcasts, clases, notas de voz) en texto legible para personas con discapacidad auditiva.
- Prototipado de asistentes de voz en vietnamita: el modelo actúa como módulo ASR dentro de un pipeline más amplio de reconocimiento de intención y respuesta.
- Investigación en speech-LLM: sirve como referencia reproducible para estudiar la conexión encoder Whisper + decoder Qwen en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,6 millones de parámetros publicados y un decodificador de 0,5B, la inferencia en fp16 requiere del orden de 1-2 GB de VRAM, aunque el total real depende de los pesos cargados desde los modelos base.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer moderna (RTX 3060, RTX 4090) debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño del decodificador (0,5B) y del adaptador.
- Opciones de despliegue: `transformers` con `accelerate` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhoWhisper-Qwen ASR (este) | 60,6 M publicados + base Qwen2.5-0.5B | no disponible | vi | Apache 2.0 | Hugging Face |
| vinai/PhoWhisper-medium | no disponible | no disponible | vi | no disponible | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | no disponible | multilingüe | no disponible | Hugging Face |
| Whisper (OpenAI) | variable (tiny a large) | 30 s por ventana | multilingüe | MIT | Abierto |

La comparación con alternativas puramente ASR como Whisper o PhoWhisper no es directa, ya que este modelo introduce un decodificador LLM. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo soporta vietnamita; no se ha validado para otros idiomas.
- No se documentan sesgos conocidos, pero al derivar de un LLM (Qwen2.5) y de un encoder entrenado con datos vietnamitas, puede heredar sesgos lingüísticos y culturales de ambos.
- Riesgo de alucinación: al usar un decodificador generativo, existe la posibilidad de que produzca texto no presente en el audio, especialmente con ruido o audio de baja calidad.
- No se especifican la longitud máxima de audio ni el contexto del decodificador; audios largos pueden requerir segmentación manual.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los modelos base (`vinai/PhoWhisper-medium` y `Qwen/Qwen2.5-0.5B-Instruct`), que no se detalla en la información disponible.
- No hay benchmarks publicados que permitan estimar la calidad de transcripción (WER) en dominios concretos.
- El repositorio tiene pocas descargas (220) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namkiett/phowhisper-qwen-asr
- Checkpoint de pesos citado: https://huggingface.co/namkiett/phowhisper-qwen-phoaudio
- Encoder base: https://huggingface.co/vinai/PhoWhisper-medium
- Decodificador base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
