# davitlive5/Lapillus-v2

## Resumen

Lapillus-v2 es un modelo de reconocimiento automático del habla (ASR) especializado en armenio oriental, desarrollado por David Ghazaryan (usuario `davitlive5` en Hugging Face). Se trata de un ajuste fino de Lapillus-v1 orientado a audio telefónico y de call center, manteniendo la precisión del modelo original sobre habla limpia. El modelo emplea la arquitectura FastConformer en configuración híbrida RNN-T + CTC, con 115 millones de parámetros, e incorpora un modelo de lenguaje opcional de 6-gramas para decodificación con beam search.

La relevancia del modelo radica en su enfoque específico: el armenio es un idioma con recursos limitados en ASR, y el audio telefónico (banda 300–3400 Hz, 8 kHz, códecs G.711, pérdida de paquetes) supone un reto adicional. Lapillus-v2 aborda ambos problemas mediante aumentación de datos en tiempo real que simula condiciones de call center, logrando reducciones relativas de WER de entre el 14% y el 21% respecto a su predecesor.

El repositorio incluye los pesos del modelo en formato NeMo (1,8 GB) y un modelo de lenguaje KenLM de 6-gramas a nivel de token entrenado sobre 8 millones de frases en armenio. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido RNN-T + CTC |
| Parametros totales | 115 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio de hasta ~30 s recomendados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | armenio (hy), armenio oriental |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo), modelo de lenguaje KenLM (.nemo) |

## Arquitectura y entrenamiento

Lapillus-v2 es un modelo FastConformer en configuración híbrida, con cabezas de decodificación RNN-T y CTC combinadas mediante una función de pérdida ponderada (0,7 RNN-T + 0,3 CTC). Se inicializa desde Lapillus-v1 y se ajusta finamente sobre aproximadamente 87 horas de habla en armenio oriental de fuentes públicas: OpenSLR SLR160, el conjunto de entrenamiento de FLEURS, audiolibros en armenio y VoxPopuli. La aumentación en tiempo real simula condiciones de telefonía: variación de velocidad (0,9–1,1), respuestas de impulso de sala, ruido y música de MUSAN, babble de 3–6 hablantes, filtrado paso banda telefónico, remuestreo a 8 kHz, códecs G.711 (μ-law y A-law), pérdida de paquetes y clipping.

El entrenamiento emplea AdamW con learning rate 3e-5 y schedule coseno, EMA de 0,999, 12 000 pasos en bf16, seleccionando el mejor checkpoint EMA en el paso 10 000. Posteriormente se aplica un promedio de pesos 50/50 con Lapillus-v1 para preservar la precisión sobre habla limpia. El modelo de lenguaje es un KenLM de 6-gramas a nivel de token entrenado sobre 8 millones de frases en armenio procedentes de FineWeb-2 y de las transcripciones de entrenamiento. Se eliminaron todas las frases de entrenamiento y del LM que coincidían con frases de test de ArmBench o compartían alguna secuencia de 7 palabras con ellas, y no se usaron clips de test de Common Voice 26.

## Capacidades

- Reconocimiento automático del habla en armenio oriental con salida de texto que incluye puntuación y mayúsculas.
- Decodificación híbrida RNN-T y CTC, con soporte de decodificación greedy y beam search.
- Integración de modelo de lenguaje de 6-gramas para decodificación con beam search (beam 4, alpha 0,3).
- Robustez ante audio telefónico simulado: ruido de fondo, babble, música, reverberación, banda telefónica, códecs G.711 y pérdida de paquetes.
- Procesamiento de audio de 16 kHz mono; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz.
- No soporta tool calling, agentes, visión ni audio multilingüe; es un modelo ASR monolingüe especializado.

## Casos de uso

- Transcripción de llamadas en call centers armenios: el modelo está entrenado con aumentación que simula exactamente las condiciones de telefonía (banda 300–3400 Hz, 8 kHz, G.711, pérdida de paquetes), lo que lo hace adecuado para transcribir grabaciones reales de centros de atención con una tasa de error esperada en torno al 12,5% en Common Voice telefónico simulado.
- Subtitulado y documentación de reuniones en armenio oriental: con habla limpia y segmentos inferiores a 30 segundos, el WER baja al 4,48% en Common Voice 26, lo que permite generar actas y transcripciones de calidad en entornos de oficina.
- Análisis de calidad y compliance en atención al cliente: la transcripción con puntuación y mayúsculas facilita el análisis posterior de sentimiento, detección de palabras clave y auditoría de conversaciones.
- Indexación y búsqueda de archivos de audio en armenio: transcripción por lotes de archivos de audio para construir índices de búsqueda textual sobre grabaciones de entrevistas, programas de radio o archivos históricos.
- Generación de subtítulos para vídeo en armenio: el modelo produce texto con puntuación y capitalización, lo que reduce el postprocesado necesario para publicar subtítulos.
- Investigación en ASR para lenguas de bajos recursos: sirve como punto de partida para ajustes finos en otras variedades del armenio o para experimentos de aumentación telefónica en idiomas con recursos limitados.
- Transcripción de audiolibros y contenido de VoxPopuli: dado que estas fuentes forman parte del entrenamiento, el modelo está adaptado al registro de lectura y a voces de narración.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (WER normalizado, menor es mejor). Los conjuntos "Phone" son los conjuntos de test oficiales pasados por una simulación fija de call center (ruido de fondo, babble, música, reverberación, banda 300–3400 Hz, 8 kHz, G.711 μ-law/A-law, pérdida de paquetes).

| Conjunto de test | Lapillus-v1 (greedy) | Lapillus-v2 (beam 4 + LM) | Variación relativa |
|---|---|---|---|
| ArmBench Common Voice 26 test (6892 utts) | 5,19 | 4,48 | −14% |
| ArmBench FLEURS test (932 utts) | 6,70 | 5,73 | −14% |
| Phone Common Voice 26 test (2000 utts) | 15,21 | 12,50 | −18% |
| Phone FLEURS test (932 utts) | 12,42 | 9,86 | −21% |

Con el mismo decodificador beam + LM, Lapillus-v1 obtiene 4,51 / 5,91 / 13,13 / 10,59, de modo que los nuevos pesos mejoran en los cuatro conjuntos y el decodificador aporta la mayor parte de la ganancia en habla limpia. Los resultados del model-index no están verificados de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 115 M de parámetros, el modelo en precisión completa ocupa del orden de 0,5 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor reporta una RTX 5070 para las pruebas de latencia; cualquier GPU con al menos 2–4 GB de VRAM es suficiente. A100 y H100 son válidas pero sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit[asr]`) es la vía oficial; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR NeMo).
- Latencia y throughput: aproximadamente 0,13 s para una locución de 7 s en una RTX 5070 con beam 4 + LM, similar a la decodificación greedy en GPU. Se recomienda dividir audio de más de 30 segundos en segmentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Common Voice 26) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lapillus-v2 | 115 M | segmentos ~30 s | 4,48 (beam 4 + LM) | CC-BY-4.0 | Hugging Face |
| Lapillus-v1 | 115 M | segmentos ~30 s | 5,19 (greedy) / 4,51 (beam 4 + LM) | CC-BY-4.0 | Hugging Face |
| NVIDIA `stt_hy_fastconformer_hybrid_large_pc` | no disponible | no disponible | no disponible | CC-BY-4.0 | NGC / Hugging Face |

Lapillus-v2 se deriva de Lapillus-v1 y, en última instancia, del modelo de NVIDIA `stt_hy_fastconformer_hybrid_large_pc`. No se dispone de datos de benchmarks de este último en la información proporcionada para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Solo armenio oriental; se esperan más errores en armenio occidental.
- Evaluado sobre audio telefónico simulado; las grabaciones reales de call center pueden diferir y degradar el rendimiento.
- La precisión cae en diálogo de cine, habla superpuesta intensa, nombres poco frecuentes y terminología especializada.
- Los números se escriben como palabras, no como dígitos.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y respetar las condiciones de la licencia.
- Modelo monolingüe: no admite otros idiomas ni tareas distintas del ASR.
- El audio debe ser mono a 16 kHz; el audio telefónico de 8 kHz requiere remuestreo previo.
- Se recomienda segmentar audio de más de 30 segundos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/Lapillus-v2
- Modelo base Lapillus-v1: https://huggingface.co/davitlive5/Lapillus-v1
- Modelo de NVIDIA de origen (`stt_hy_fastconformer_hybrid_large_pc`): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
- Cita: Ghazaryan, David (2026). *Lapillus-v2: Armenian Speech Recognition for Call Centers*. https://huggingface.co/davitlive5/Lapillus-v2
