# bakhtawar123/balochi-whisper-small-v3

## Resumen

Balochi Whisper-small v3 es un ajuste fino mediante LoRA del modelo Whisper-small de OpenAI, orientado al reconocimiento automático de voz (ASR) en lengua balochi. Lo desarrolla el usuario de Hugging Face bakhtawar123 y se publica bajo el identificador `bakhtawar123/balochi-whisper-small-v3`. El modelo parte de la arquitectura encoder-decoder transformer de Whisper-small, con 241.734.912 parámetros totales, y añade un adaptador LoRA de rango 32 con aproximadamente 13 millones de parámetros entrenables.

El problema que aborda es la escasez de sistemas ASR para balochi, una lengua iraní noroccidental hablada principalmente en Pakistán, Irán y Afganistán, que carece de soporte en los modelos multilingües comerciales. El autor entrena sobre 4.781 enunciados (unas 3,6 horas de audio) de dos variantes dialectales: suleimani (2.281 clips) y makrani/meridional (2.500 clips). Para compensar la ausencia del balochi en el vocabulario de Whisper, el decodificador se condiciona con el token de idioma urdu, la lengua soportada más cercana en escritura persoárabe.

Es relevante ahora porque demuestra un flujo de bajo coste (LoRA sobre un modelo pequeño) para lenguas de bajos recursos, aunque sus métricas de calidad son todavía de borrador: WER del 54,42 % y CER del 26,73 % en el conjunto de test retenido de 240 clips. El autor advierte explícitamente de que no es un modelo general de balochi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptadores LoRA (r=32) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE; ~13M parámetros entrenables en el adaptador LoRA) |
| Longitud de contexto | no disponible (ventana de audio de Whisper-small, 30 s por segmento, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Balochi (dialectos suleimani y makrani/meridional); prompt de decodificación en urdu |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el checkpoint Whisper-small de OpenAI, un transformer encoder-decoder diseñado para ASR multilingüe. Sobre él se aplica un ajuste fino con LoRA de rango 32 (unos 13 millones de parámetros entrenables), lo que permite adaptar el modelo sin reentrenar los 241,7 millones de parámetros completos. El decodificador se condiciona con el token de idioma urdu, decisión motivada por ser la lengua soportada por Whisper más próxima al balochi en escritura persoárabe.

Los datos de entrenamiento consisten en 4.781 enunciados (aproximadamente 3,6 horas) de dos hablantes: 2.281 clips de la variante suleimani y 2.500 de la variante makrani/meridional. Las transcripciones se normalizaron eliminando la puntuación final y unificando variantes de puntos de código. No se documenta el uso de RLHF ni DPO, ni el número total de tokens de audio procesados. El conjunto de test retenido consta de 240 clips (115 suleimani y 125 makrani). La configuración de generación (prompt en urdu, sin tokens suprimidos) se distribuye en `generation_config.json`.

## Capacidades

- Transcripción de voz a texto en balochi para las variantes suleimani y makrani/meridional.
- Reconocimiento de audio de corta duración y habla clara, según indica el autor.
- Decodificación condicionada por token de idioma urdu para forzar la salida en escritura persoárabe.
- Normalización de transcripciones (sin puntuación final, variantes de codepoints unificadas).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del balochi con prompt en urdu.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento (thinking).

## Casos de uso

- Transcripción exploratoria de entrevistas en balochi: el modelo puede generar borradores de texto para revisión humana posterior, útil cuando no existe alternativa ASR para la lengua, aunque el WER del 54 % exige corrección manual.
- Documentación lingüística de campo: investigadores que recopilan corpus orales de variantes suleimani y makrani pueden obtener transcripciones preliminares para acelerar el etiquetado.
- Subtitulado asistido de vídeos cortos: para clips de audio claros y de pocos segundos, el modelo sirve como primer paso antes de la revisión por un hablante nativo.
- Prototipado de aplicaciones de voz para comunidades balochi: desarrolladores pueden integrar el modelo vía `transformers` para validar flujos de ASR antes de invertir en datos y modelos mayores.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible de ajuste LoRA sobre Whisper-small para lenguas sin soporte nativo.
- Generación de datos pseudoetiquetados: las transcripciones del modelo pueden filtrarse y corregirse para ampliar corpus de entrenamiento de futuros modelos de balochi.
- Evaluación comparativa de dialectos: permite medir diferencias de rendimiento entre suleimani y makrani en un mismo pipeline.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test retenido (240 clips):

| Conjunto | Clips | WER | CER |
|---|---|---|---|
| Global | 240 | 54,42 % | 26,73 % |
| Suleimani | 115 | 62,35 % | 33,23 % |
| Makrani (meridional) | 125 | 45,60 % | 19,14 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los 241,7 millones de parámetros; en fp16 aproximadamente 0,5 GB. Cifras estimadas a partir del número de parámetros, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, con amplio margen, al tratarse de un modelo de 241 millones de parámetros.
- Opciones de despliegue: `transformers` (WhisperForConditionalGeneration y WhisperProcessor), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta conversión disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bakhtawar123/balochi-whisper-small-v3 | 241,7 M | no disponible | Balochi (2 dialectos) | no disponible | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | Multilingüe (sin balochi) | MIT (según el modelo original) | Hugging Face |
| whisper-small ajustado a otras lenguas de bajos recursos | ~244 M | 30 s de audio | Variable | Variable | Hugging Face |

La comparación directa con otros modelos ASR de balochi no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad de borrador: WER del 54,42 % global, con un 62,35 % en suleimani, lo que limita su uso sin revisión humana.
- No es un modelo general de balochi: solo se han probado los dialectos suleimani y makrani; otras variantes y voces no vistas no están evaluadas.
- Entrenado con solo dos hablantes y 3,6 horas de audio, lo que favorece el sobreajuste a esas voces y condiciones de grabación.
- Riesgo elevado de alucinación y errores en audio ruidoso, con acentos no vistos o con habla solapada.
- El condicionamiento con token de urdu puede introducir sesgos léxicos y ortográficos hacia el urdu en la salida.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de desplegarlo en producción.
- La model card cita el identificador `umairjamali/balochi-whisper-small-v3` en el código de ejemplo, distinto del repositorio `bakhtawar123/balochi-whisper-small-v3`, lo que puede provocar errores de carga.
- No se documentan cuantizaciones ni formatos alternativos a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bakhtawar123/balochi-whisper-small-v3
- Referencia citada en la model card (identificador alternativo): https://huggingface.co/umairjamali/balochi-whisper-small-v3
- Whisper-small original de OpenAI: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
