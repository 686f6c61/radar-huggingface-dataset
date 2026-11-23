# mondhs/whisper-small-lt-10s-20261121-ct2

## Resumen

El modelo `mondhs/whisper-small-lt-10s-20261121-ct2` es una conversión al formato CTranslate2 del ajuste fino `mondhs/whisper-small-lt-10s-20261121`, una adaptación de Whisper Small al lituano. Lo publica el usuario `mondhs` en Hugging Face y su propósito es servir como motor de reconocimiento automático del habla (ASR) en lituano dentro del ecosistema `faster-whisper`, que es la implementación de inferencia optimizada basada en CTranslate2.

La relevancia práctica del modelo reside en el formato: al estar convertido a CTranslate2, puede cargarse directamente con `faster-whisper`, lo que reduce el consumo de memoria y aumenta el throughput frente a la inferencia estándar de Whisper en PyTorch, especialmente en CPU y en GPU de gama media. El modelo base es Whisper Small, una arquitectura transformer encoder-decoder de aproximadamente 244 millones de parámetros, aunque no se especifica en la información disponible el número exacto de parámetros del ajuste fino.

La ficha se ve limitada por la escasez de información publicada: el repo no incluye resultados de benchmarks, detalles del proceso de entrenamiento ni instrucciones de uso más allá de los metadatos. Además, el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a CTranslate2 |
| Parametros totales | no disponible (modelo base Whisper Small, ~244 M segun la arquitectura original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small procesa ventanas de audio de 30 s por defecto; el nombre del modelo sugiere entrenamiento con fragmentos de 10 s) |
| Tipos de cuantizacion | no disponible (CTranslate2 admite int8, int8_float16, float16, float32, pero no se especifica cual se ha usado) |
| Idiomas soportados | lituano (lt) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper Small, un transformer encoder-decoder diseñado para ASR con espectrogramas log-Mel como entrada y tokens de texto como salida. La conversión a CTranslate2 no altera la arquitectura, sino que transforma los pesos a un formato optimizado para inferencia con kernels cuantizados y gestión eficiente de memoria.

El ajuste fino se realizó sobre el dataset `liepa-project/LIEPA-3_read-spon-dial_16kHz`, según los metadatos del repo. El nombre del modelo incluye `10s`, lo que sugiere que el entrenamiento se hizo con fragmentos de audio de 10 segundos, aunque no se detalla el número de horas, la composición exacta del corpus ni si se aplicaron técnicas de aumento de datos o regularización. No se dispone de información sobre el proceso de entrenamiento (épocas, learning rate, precisión mixta) ni sobre posibles etapas de RLHF o DPO, que en ASR no son habituales.

## Capacidades

- Reconocimiento automático del habla en lituano, con salida de texto transcrito.
- Inferencia optimizada mediante CTranslate2 y compatible con `faster-whisper`.
- Procesamiento de audio en ventanas de 10 segundos según el nombre del modelo (aunque Whisper Small admite ventanas de hasta 30 s).
- Soporte de decodificación con timestamps a nivel de segmento (característica de Whisper).
- Capacidad de traducción implícita a inglés (heredada de Whisper), aunque el ajuste fino se centra en transcripción en lituano.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en lituano: el modelo puede convertir grabaciones de audio en texto para actas o búsquedas posteriores, con la ventaja de que `faster-whisper` permite procesar audio en streaming o por lotes con bajo consumo de memoria.
- Subtitulado automático de vídeos en lituano: gracias a la salida con timestamps de Whisper, se pueden generar subtítulos sincronizados para plataformas educativas o de contenido.
- Atención al cliente en lituano: integración en un pipeline de ASR para transcribir llamadas o mensajes de voz y alimentar un sistema de análisis de sentimiento o enrutamiento.
- Investigación lingüística: corpus de habla lituana transcritos para estudios fonéticos o de variación dialectal, aprovechando el corpus LIEPA-3 como base de entrenamiento.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos audiovisuales en lituano.
- Despliegue en entornos con recursos limitados: al estar en CTranslate2, puede ejecutarse en CPU con cuantización int8, lo que facilita su uso en servidores sin GPU o en dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para Whisper Small en float16 se suelen necesitar alrededor de 1-2 GB de VRAM, y en int8 menos de 1 GB, pero no se confirma la cuantización usada en este repo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float16 (GTX 1650, RTX 3050, T4). Para int8 puede funcionar en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como GTX 1060 6GB, RTX 2060, RTX 3060, etc., aunque no se especifica.
- Opciones de despliegue: `faster-whisper` (biblioteca principal), CTranslate2 directamente, y potencialmente servidores compatibles con CTranslate2. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| mondhs/whisper-small-lt-10s-20261121-ct2 | ~244 M (base Whisper Small) | no disponible | lt | MIT | CTranslate2 |
| openai/whisper-small | ~244 M | 30 s audio | multilingue (99 idiomas) | MIT | PyTorch, safetensors |
| whisper-small en CTranslate2 (conversión genérica) | ~244 M | 30 s audio | multilingue | MIT | CTranslate2 |

No se dispone de datos de rendimiento comparativo (WER) para este ajuste fino frente a alternativas.

## Limitaciones y advertencias

- El modelo está especializado en lituano; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- No se han publicado métricas de error (WER/CER) ni evaluaciones independientes, por lo que se desconoce su calidad real frente a Whisper Small original o frente a otros ajustes finos en lituano.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido o silencios largos.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado o en entornos corporativos.
- Aunque la licencia es MIT, el modelo base Whisper Small de OpenAI también es MIT, pero se debe verificar que el corpus LIEPA-3 no imponga restricciones adicionales (no se detalla en la información disponible).
- El nombre del modelo sugiere entrenamiento con ventanas de 10 s, lo que podría afectar a la coherencia en audios más largos si no se segmentan adecuadamente.
- No se especifica la cuantización aplicada en la conversión a CTranslate2, lo que puede afectar a la precisión si se usa int8.

## Enlaces

- [Hugging Face: mondhs/whisper-small-lt-10s-20261121-ct2](https://huggingface.co/mondhs/whisper-small-lt-10s-20261121-ct2)
- [Modelo base: mondhs/whisper-small-lt-10s-20261121](https://huggingface.co/mondhs/whisper-small-lt-10s-20261121)
- [Dataset: liepa-project/LIEPA-3_read-spon-dial_16kHz](https://huggingface.co/datasets/liepa-project/LIEPA-3_read-spon-dial_16kHz)
- [Repositorio faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- [CTranslate2](https://github.com/OpenNMT/CTranslate2)
