# smabarathi/ahlussunnah-recite

## Resumen

`smabarathi/ahlussunnah-recite` es una conversión al formato GGML de whisper.cpp del modelo de reconocimiento automático de voz (ASR) `tarteel-ai/whisper-base-ar-quran`, desarrollado originalmente por Tarteel AI. El autor, smabarathi, lo publica cuantizado en q8_0 para su uso en la aplicación móvil Ahlussunnah Family (Qirthas), orientada a la comprobación de recitación del Corán en árabe sobre dispositivo. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos son los del modelo base, sin modificaciones adicionales según la model card.

El modelo hereda la arquitectura Whisper de OpenAI en su variante `base`, con aproximadamente 74 millones de parámetros, y está especializado en árabe coránico mediante fine-tuning sobre el corpus de Tarteel AI. La conversión a GGML y la cuantización q8_0 reducen el peso del repositorio a unos 0,1 GB, lo que permite inferencia en CPU y en dispositivos móviles sin GPU dedicada, un requisito habitual en aplicaciones de recitación que funcionan offline.

Su relevancia es acotada pero concreta: cubre un nicho muy específico (ASR de árabe coránico en local) y sirve como ejemplo de pipeline de conversión whisper.cpp → GGML para despliegue en aplicaciones móviles. No es un modelo de propósito general ni compite con modelos de lenguaje; es un componente de ASR especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | ~74 millones (variante base de Whisper) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | q8_0 (GGML) |
| Idiomas soportados | arabe (especializado en arabe coranico) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper `base`: un transformer encoder-decoder con atención multi-cabeza estándar, entrenado originalmente por OpenAI para transcripción multilingüe y posteriormente ajustado por Tarteel AI sobre audio de recitación coránica en árabe. El modelo base `tarteel-ai/whisper-base-ar-quran` es el resultado de ese fine-tuning; el artefacto aquí publicado no añade entrenamiento adicional, según indica la model card ("No other changes").

La única transformación aplicada es la conversión a formato GGML mediante whisper.cpp y la cuantización a q8_0, que reduce la precisión de los pesos a 8 bits por parámetro. No se documentan en la información disponible el número de tokens de audio de entrenamiento, la composición exacta del dataset de Tarteel AI ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional más allá de la propia cuantización para despliegue en dispositivo.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, con especialización en recitación coránica.
- Transcripción de audio a texto en árabe para verificación de recitación en la aplicación Qirthas.
- Inferencia en dispositivo (on-device) en CPU mediante whisper.cpp, sin necesidad de GPU.
- Funcionamiento offline una vez descargado el archivo GGML.
- No dispone de tool calling ni function calling (es un modelo ASR, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al árabe; no se documentan otros idiomas.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación de recitación coránica en aplicaciones móviles: el modelo transcribe el audio del usuario y permite compararlo con el texto esperado para detectar errores de recitación, funcionando en local gracias al formato GGML y a su tamaño reducido.
- Aplicaciones religiosas offline: al ejecutarse con whisper.cpp en CPU, puede integrarse en apps que deben funcionar sin conexión en entornos con conectividad limitada.
- Prototipado de ASR árabe en dispositivos de bajos recursos: sirve como base para experimentar con transcripción de árabe coránico en Raspberry Pi, móviles o portátiles sin GPU.
- Evaluación de pipelines de conversión whisper.cpp: útil como referencia para equipos que quieran replicar el flujo de conversión de un modelo Whisper fine-tuneado a GGML q8_0.
- Transcripción de audio de estudio coránico: para generar borradores de texto a partir de grabaciones de recitación que luego se revisan manualmente.
- Investigación en ASR especializado: como punto de partida para comparar el rendimiento de variantes cuantizadas frente al modelo original en tareas de reconocimiento de árabe coránico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de CPU; en GPU, el modelo q8_0 de ~74 M de parámetros ocupa del orden de decenas de MB, por lo que cabe en cualquier GPU con memoria mínima.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En caso de usar GPU, cualquier tarjeta moderna (RTX 4090, A100, H100) lo ejecutaría con holgura, pero no es el escenario previsto.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: whisper.cpp (formato nativo GGML); no se documentan otras integraciones como vLLM, TGI u Ollama para este artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| smabarathi/ahlussunnah-recite | ~74 M | no disponible | Apache-2.0 | GGML q8_0 | Conversion de whisper base arabe coranico |
| tarteel-ai/whisper-base-ar-quran | ~74 M | no disponible | Apache-2.0 | safetensors (original) | Modelo base del que deriva; requiere conversion para whisper.cpp |
| openai/whisper-base | ~74 M | no disponible | MIT | safetensors, GGML | Whisper base multilingue general, sin especializacion coranica |

## Limitaciones y advertencias

- Es un modelo ASR especializado en árabe coránico; no es adecuado para transcripción de propósito general ni para otros idiomas.
- Al derivar de Whisper `base`, su capacidad de reconocimiento es limitada en comparación con variantes `small`, `medium` o `large`, especialmente en audio con ruido o acentos no vistos en entrenamiento.
- La cuantización q8_0 introduce una pérdida de precisión respecto a los pesos originales, aunque en este caso el autor no documenta métricas de degradación.
- Riesgo de alucinación en la transcripción: como todo modelo ASR, puede generar texto plausible que no corresponde al audio, especialmente en segmentos silenciosos o ruidosos.
- No se documentan sesgos específicos ni evaluación de robustez en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Tarteel AI y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- No se proporcionan instrucciones de uso, ejemplos de código ni parámetros de decodificación recomendados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/smabarathi/ahlussunnah-recite
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- whisper.cpp (repositorio del runtime): https://github.com/ggerganov/whisper.cpp
