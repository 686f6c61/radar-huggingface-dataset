# Jinstudio/MOSS-Audio-8B-Instruct

## Resumen

MOSS-Audio-8B-Instruct es un modelo abierto de comprensión de audio publicado en HuggingFace bajo la cuenta Jinstudio. La model card atribuye su desarrollo a MOSI.AI, al equipo OpenMOSS y a Shanghai Innovation Institute. Forma parte de una familia de cuatro variantes (4B/8B, Instruct/Thinking) y está orientado a la comprensión unificada de voz, sonidos ambientales y música, no solo a la transcripción.

El modelo combina un codificador de audio propio, un adaptador de modalidad y un LLM que genera texto de forma autorregresiva. Según los pesos safetensors, tiene 9.052.463.488 parámetros (aproximadamente 9,05 mil millones), aunque se comercializa como 8B. Soporta inglés y chino, se distribuye con licencia Apache-2.0 y su pipeline es audio-text-to-text.

Su relevancia está en que cubre tareas que suelen requerir varios sistemas: ASR con timestamps, análisis de hablante y emoción, eventos acústicos, descripción de escena, música, QA temporal y razonamiento multi-paso sobre audio. La model card no incluye longitud de contexto, resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modular: codificador de audio MOSS-Audio-Encoder + adaptador de modalidad + LLM autorregresivo |
| Parámetros totales | 9.052.463.488 (aproximadamente 9,05 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se documentan GGUF, AWQ, GPTQ ni otros formatos |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; requiere custom_code |
| Pipeline | audio-text-to-text |
| Tamaño del repositorio | 18,1 GB |
| Autor en HuggingFace | Jinstudio |
| Desarrolladores según model card | MOSI.AI, OpenMOSS y Shanghai Innovation Institute |
| Variantes de la familia | 4B-Instruct, 4B-Thinking, 8B-Instruct, 8B-Thinking |

## Arquitectura y entrenamiento

MOSS-Audio sigue un diseño modular de tres componentes: un codificador de audio entrenado desde cero (MOSS-Audio-Encoder), un adaptador de modalidad y un LLM que genera texto de forma autorregresiva. El audio se codifica en representaciones temporales continuas a 12,5 Hz, que el adaptador proyecta al espacio de embeddings del LLM. No se describe como un modelo MoE.

La innovación principal es DeepStack: además de la salida de la última capa del codificador, se seleccionan capas tempranas e intermedias, se proyectan de forma independiente y se inyectan en las primeras capas del LLM para conservar prosodia, transitorios y estructura tiempo-frecuencia. También se insertan tokens de tiempo a intervalos fijos durante el pretraining para que el modelo aprenda qué ocurrió y cuándo. La familia incluye entrenamiento con chain-of-thought y RL; la variante Instruct está optimizada para seguir instrucciones directas. No se dispone del número de tokens, de la composición del dataset ni de detalles de RLHF/DPO.

## Capacidades

- Comprensión de voz y contenido: transcripción ASR con salida de texto estructurada y alineación a nivel de palabra y de frase.
- Análisis de hablante, emoción y eventos: identifica características del hablante, estados emocionales y eventos acústicos.
- Extracción de pistas de escena: interpreta sonidos de fondo, ruido ambiental, música y señales no verbales para inferir contexto.
- Comprensión musical: analiza estilo, progresión emocional, instrumentación y características acústicas salientes.
- QA y resumen sobre audio: responde preguntas y resume reuniones, podcasts, entrevistas y grabaciones ambientales.
- QA sensible al tiempo: responde preguntas con referencia temporal y ASR con timestamps de palabra o de frase.
- Razonamiento complejo multi-paso sobre audio, con entrenamiento CoT y RL; la variante Thinking está orientada a cadena de pensamiento.
- Multilingüe: inglés y chino.
- Tool calling y function calling: no documentados.
- Agentes: se documenta razonamiento multi-paso, pero no un framework de agentes ni orquestación de herramientas.
- Otras modalidades: solo audio; no se documenta visión, generación de audio ni audio-vídeo.

## Casos de uso

- Transcripción de reuniones y entrevistas con marcas de tiempo: se le pasa el audio y se solicita ASR con timestamps de palabra o frase; es adecuado para generar actas y subtítulos revisables.
- Análisis de llamadas de atención al cliente: permite detectar emoción, eventos acústicos y resumir la conversación; útil para control de calidad y formación, con revisión humana.
- Catalogación de archivos musicales: describe estilo, instrumentación y progresión emocional de un fragmento; sirve para enriquecer metadatos y sistemas de recomendación.
- Búsqueda y QA sobre archivos de audio: responde preguntas del tipo “¿qué se dijo en el minuto X?” gracias al QA temporal; encaja en archivos de podcasts y grabaciones largas segmentadas.
- Accesibilidad y subtitulado: genera subtítulos alineados a nivel de palabra o frase; requiere revisión manual por el riesgo de errores en audio ruidoso.
- Monitorización acústica de entornos: detecta eventos y describe la escena sonora; puede apoyar mantenimiento, seguridad o análisis de ruido, sin sustituir sistemas críticos.
- Análisis de entrevistas de investigación: resume temas y extrae citas aproximadas con marcas temporales; debe usarse con consentimiento y verificación posterior.
- Auditoría de contenido en audio: resume y detecta eventos en grabaciones; puede asistir a equipos de moderación, pero no reemplaza la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección “Evaluation”, pero no se han proporcionado cifras de MMLU, HumanEval, GSM8K, WER, DER ni otros benchmarks en el material disponible.

## Requisitos de hardware

- No se documentan requisitos oficiales de hardware; las cifras siguientes son estimaciones a partir de 9,05 mil millones de parámetros.
- FP16: aproximadamente 18,1 GB solo para pesos; con codificador, activaciones y caché, unos 22-26 GB para lote pequeño. Audios largos aumentan el consumo.
- INT8: aproximadamente 9,1 GB para pesos; unos 12-16 GB en total, si existen pesos cuantizados, algo no documentado.
- INT4: aproximadamente 4,5-5,5 GB para pesos; unos 8-10 GB en total, si existen pesos cuantizados, algo no documentado.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para FP16 con margen; RTX 4090 o RTX 3090 de 24 GB para FP16 ajustado o cuantización; una GPU de 16 GB requiere cuantización.
- GPU de consumo: sí, especialmente con cuantización; en 24 GB se puede intentar FP16 con lote pequeño.
- Despliegue: la model card documenta SGLang Serving y una app Gradio; el repositorio usa custom_code. vLLM, TGI, llama.cpp y Ollama no están confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-8B-Instruct | 9.052.463.488 (9,05B) | No disponible | Instrucción directa | Apache-2.0 | HuggingFace, esta ficha |
| MOSS-Audio-8B-Thinking | 8B (dato real no disponible) | No disponible | Cadena de pensamiento | No disponible en la información | Colección OpenMOSS |
| MOSS-Audio-4B-Instruct | 4B (dato real no disponible) | No disponible | Instrucción directa | No disponible en la información | Colección OpenMOSS |
| MOSS-Audio-4B-Thinking | 4B (dato real no disponible) | No disponible | Cadena de pensamiento | No disponible en la información | Colección OpenMOSS |

No se dispone de benchmarks para comparar rendimiento entre variantes. Las variantes 4B reducen el coste de inferencia, pero no hay datos públicos de calidad en la información disponible.

## Limitaciones y advertencias

- No se documentan sesgos concretos; al estar entrenado principalmente en inglés y chino, puede rendir peor en español y en otros idiomas.
- Riesgo de alucinación en resúmenes, QA y timestamps; conviene verificar las salidas contra el audio original.
- No hay cifras de WER, DER, MMLU ni otros benchmarks, por lo que no se puede evaluar objetivamente su rendimiento.
- La longitud de contexto no está disponible; para audios largos habrá que segmentar y gestionar el estado entre fragmentos.
- No se documenta soporte de tool calling, agentes, visión ni generación de audio; el alcance declarado es comprensión audio-texto.
- La licencia Apache-2.0 permite uso comercial con obligaciones de atribución; deben revisarse el custom_code y las dependencias externas.
- El modelo se presenta como 8B, pero los pesos suman 9,05 mil millones de parámetros; el dimensionamiento de hardware debe usar el dato real.
- Blog y paper están anunciados como “coming soon”; falta información sobre dataset, RLHF/DPO y evaluación.
- El audio puede contener datos personales; su uso en producción exige consentimiento, base legal y cumplimiento del RGPD.
- No debe usarse en decisiones críticas sin revisión humana, especialmente en diagnóstico, seguridad o moderación automatizada.

## Enlaces

- [HuggingFace: Jinstudio/MOSS-Audio-8B-Instruct](https://huggingface.co/Jinstudio/MOSS-Audio-8B-Instruct)
- [Colección OpenMOSS de MOSS-Audio](https://huggingface.co/collections/OpenMOSS-Team/moss-audio)
- [MOSI.AI](https://mosi.cn/#hero)
- [OpenMOSS](https://www.open-moss.com/)
- [Shanghai Innovation Institute](https://www.sii.edu.cn/)
- [Twitter de OpenMOSS](https://x.com/Open_MOSS)
- [Discord de OpenMOSS](https://discord.gg/Xf3aXddCjc)
- WeChat: asset local del repositorio en `./assets/wechat.jpg`
- Blog y paper: anunciados como “coming soon” en la model card, sin URL disponible.
