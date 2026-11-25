# phosai/elgon-streaming-v3

## Resumen

Elgon-streaming-v3 es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por phosai, obtenido mediante fine-tuning del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` para el idioma luganda (`lug`). El modelo está diseñado para transcripción en tiempo real con distintos tamaños de bloque de atención, lo que permite ajustar el equilibrio entre latencia y precisión en función de las necesidades de la aplicación.

Con aproximadamente 638 millones de parámetros y un tamaño de repositorio de 2,6 GB en formato safetensors, el modelo se sitúa en la gama compacta de ASR, lo que facilita su despliegue en infraestructura modesta. La arquitectura subyacente es la del modelo Nemotron 3.5 ASR streaming de NVIDIA, adaptada mediante fine-tuning completo o parcial con una estrategia de replay de datos en inglés para preservar capacidades multilingües.

Su relevancia actual radica en la escasez de modelos ASR de calidad para idiomas de bajos recursos como el luganda, y en la incorporación de múltiples contextos de atención que permiten operar con ventanas de 80 ms hasta 1120 ms, cubriendo desde aplicaciones de baja latencia hasta transcripción por lotes con mayor precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron 3.5 ASR streaming (transformer encoder-decoder para ASR) |
| Parámetros totales | 637.997.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contextos de atención entrenados: [56,0], [56,1], [56,3], [56,6], [56,13]) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Luganda (`lug`) y retención de inglés (`en-US`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema ASR en streaming de aproximadamente 600 millones de parámetros. El fine-tuning se realizó mediante método completo o parcial (Full/Partial FT) durante 30.000 pasos con una tasa de aprendizaje de 3e-05 y un escalado del decodificador de 0,5x. Se entrenaron cinco contextos de atención distintos: `[56,0]`, `[56,1]`, `[56,3]`, `[56,6]` y `[56,13]`, que corresponden a ventanas de 80 ms, 160 ms, 320 ms, 560 ms y 1120 ms respectivamente.

La estrategia de entrenamiento incluyó una fracción de replay del 25% con datos en inglés (`en-US`), lo que permite al modelo mantener cierta capacidad de transcripción en inglés mientras se especializa en luganda. Esta técnica de replay es habitual para mitigar el olvido catastrófico en fine-tuning de modelos multilingües. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO ni detalles sobre la composición exacta del dataset de entrenamiento.

## Capacidades

- Reconocimiento automático del habla en streaming para luganda, con soporte de cinco configuraciones de latencia (80 ms a 1120 ms).
- Transcripción con puntuación y capitalización (evaluación "Punctuated+Cased") y modo lenient sin normalización estricta.
- Retención de capacidades ASR en inglés estadounidense gracias al replay durante el fine-tuning.
- Operación en modo streaming con diferentes tamaños de bloque de atención, lo que permite adaptar el modelo a requisitos de latencia variables.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio (más allá del propio ASR) ni modo de razonamiento explícito.

## Casos de uso

- Transcripción en tiempo real de reuniones y entrevistas en luganda: con el contexto `[56,0]` (80 ms), el modelo puede alimentar subtítulos en vivo con latencia mínima, adecuado para videoconferencias y retransmisiones.
- Subtitulado automático de contenido audiovisual: usando contextos intermedios como `[56,3]` (320 ms), se obtiene un equilibrio entre precisión (30,00% WER en waxal-test) y latencia para plataformas de vídeo bajo demanda.
- Atención al cliente en centros de llamadas: el modelo puede transcribir conversaciones telefónicas en luganda para su análisis posterior, con el contexto `[56,13]` (1120 ms) que ofrece el menor WER (29,77% en waxal-test).
- Archivado y búsqueda de audio histórico: la transcripción por lotes con el contexto de mayor ventana permite indexar grabaciones en luganda para búsqueda textual y cumplimiento normativo.
- Aplicaciones de accesibilidad para hablantes de luganda: dictado por voz y conversión de voz a texto en dispositivos con requisitos de latencia moderados, aprovechando el tamaño compacto del modelo (638M parámetros).
- Sistemas de subtitulado bilingüe luganda-inglés: la retención de inglés (WER de 10,80% en replay-en-US con `[56,13]`) permite transcribir contenido mixto o generar traducciones pivotando desde la transcripción en luganda.
- Investigación lingüística y creación de corpus: el modelo facilita la generación de transcripciones a gran escala de material en luganda para estudios de lingüística computacional y entrenamiento de modelos posteriores.

## Benchmarks y rendimiento

Resultados de WER (%) publicados en la model card, en formato Puntuado+Capitalizado (Lenient entre paréntesis):

| Dataset | [56,0] (80ms) | [56,1] (160ms) | [56,3] (320ms) | [56,6] (560ms) | [56,13] (1120ms) |
|---|---|---|---|---|---|
| waxal-test | 30,53% (22,94%) | 30,29% (22,72%) | 30,00% (22,34%) | 29,98% (22,06%) | 29,77% (21,75%) |
| cv-test | 37,12% (31,73%) | 36,85% (31,49%) | 36,08% (30,74%) | 35,65% (30,29%) | 35,54% (30,17%) |
| replay-en-US | 11,88% (7,22%) | 11,21% (6,91%) | 11,03% (6,58%) | 10,96% (6,66%) | 10,80% (6,58%) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 638M parámetros, en fp16 se requieren aproximadamente 1,3 GB solo para pesos; en fp32, unos 2,6 GB. La VRAM total dependerá del runtime y del tamaño de lote.
- GPU recomendadas: no disponible. Por tamaño, una GPU consumer como RTX 3060 (12 GB) o superior debería ser suficiente para inferencia en fp16, aunque no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, pero no confirmada en la documentación.
- Opciones de despliegue: no disponible. No se especifican runtimes compatibles (vLLM, llama.cpp, Ollama, TGI u otros). El formato safetensors sugiere uso con frameworks de PyTorch/Hugging Face Transformers, pero no se detalla.
- Latencia y throughput estimados: no disponible. Los contextos de atención entrenados (80 ms a 1120 ms) indican la latencia algorítmica del streaming, pero no se proporcionan métricas de throughput en hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (ASR streaming para idiomas de bajos recursos).

## Limitaciones y advertencias

- El WER en luganda es elevado (29,77%–37,12% según dataset y contexto), lo que limita su uso en aplicaciones que requieran transcripción de alta fidelidad sin revisión humana.
- El rendimiento en `cv-test` (35,54%–37,12%) es notablemente peor que en `waxal-test` (29,77%–30,53%), lo que sugiere sensibilidad a la variabilidad del dominio y posible sobreajuste al conjunto de evaluación principal.
- La licencia no está disponible, por lo que no se puede confirmar si se permite uso comercial; es imprescindible verificarla antes de cualquier despliegue en producción.
- El modelo está especializado en luganda con retención de inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- No se especifican sesgos conocidos, pero al ser un fine-tuning sobre un modelo base entrenado con datos no documentados, pueden heredarse sesgos del corpus original.
- Riesgo de alucinación inherente a los sistemas ASR: el modelo puede generar transcripciones plausibles pero incorrectas, especialmente en audio con ruido, acentos no representados o vocabulario técnico.
- No se dispone de información sobre el dataset de entrenamiento (composición, tamaño, procedencia), lo que dificulta evaluar la cobertura lingüística y la representatividad.
- El repositorio no tiene descargas ni likes, lo que indica que no ha sido validado por la comunidad; se recomienda precaución en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/phosai/elgon-streaming-v3
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b (referenciado en la model card, no verificado en la búsqueda)
