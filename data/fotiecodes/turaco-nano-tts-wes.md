# fotiecodes/turaco-nano-tts-wes

## Resumen

Turaco-nano-tts-wes es un modelo de síntesis de voz (text-to-speech) de 109,5 millones de parámetros desarrollado por el usuario fotiecodes como parte de la iniciativa Turaco, orientada a modelos de lenguaje y voz para lenguas africanas de bajos recursos. Se trata de un ajuste fino del modelo Pocket TTS de Kyutai, adaptado para generar habla en pidgin inglés de Camerún (código ISO `wes`), una variedad lingüística con escasísima representación en tecnologías del habla comerciales.

El modelo se presenta como un piloto de investigación experimental, de un solo hablante y entrenado sobre aproximadamente 59 minutos de audio de Common Voice 27.0. Su interés principal reside en el tamaño: con 109,5 millones de parámetros y un archivo de pesos de 438 MB en FP32 (incluyendo el códec), es unas 14,9 veces más pequeño que la release anterior de la familia (Turaco CSM, 1.632 millones de parámetros), lo que lo sitúa como candidato a inferencia en CPU y, potencialmente, en dispositivos móviles o navegador, aunque estas conversiones aún no se han validado.

La relevancia actual del modelo es doble: por un lado, explora la viabilidad de adaptar arquitecturas TTS compactas a lenguas de bajos recursos con presupuestos de entrenamiento mínimos (200 pasos de optimizador); por otro, publica de forma transparente la receta, las métricas objetivas y las limitaciones de evaluación, incluyendo la advertencia explícita de que no se han realizado pruebas de escucha con hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai), ajuste fino; incluye códec de voz y sampler acústico congelado |
| Parametros totales | 109.501.826 (códec incluido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | Pidgin inglés de Camerún (`wes`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (438.033.312 bytes, FP32, códec incluido); voz piloto en `voice.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Kyutai Pocket TTS, una arquitectura compacta de generación de habla que combina un tokenizador preentrenado con un sampler acústico. En este ajuste se conservan tanto el tokenizador como el sampler preentrenado, y los pesos del sampler permanecen congelados; el ajuste se aplica sobre el resto del modelo. El checkpoint publicado corresponde a `checkpoint_00000200.pt`, derivado de la revisión upstream `a4a6054db281f0f34f3d44d626a972a44560dc83`.

El entrenamiento se realizó sobre Common Voice Scripted Speech 27.0 — Cameroon Pidgin: 998 clips seleccionados (unos 59 minutos de audio) de un único hablante anónimo, con audio mono a 24 kHz. Los splits agrupados por transcripción quedaron en 897 clips de entrenamiento, 50 de validación y 51 de test. Se usó AdamW con learning rate 1e-5, batch size 1 con acumulación de 8, FP32 sobre una Tesla T4 y EMA con decay 0,95, durante 200 pasos de optimizador. El alineamiento forzado se hizo con un modelo CTC de inglés como aproximación al pidgin, lo que el autor advierte que puede introducir errores de frontera. La adaptación directa del estudiante publicado se plantea como alternativa experimental al pipeline habitual de adaptación del profesor seguido de destilación por profundidad.

## Capacidades

- Síntesis de voz a partir de texto en pidgin inglés de Camerún, con un hablante piloto precomputado incluido en el repositorio.
- Inferencia en CPU verificada en Python mediante la librería `pocket-tts`.
- Carga del modelo vía identificador de Hugging Face (`hf://fotiecodes/turaco-nano-tts-wes/wes.yaml`) y del estado de voz desde `voice.safetensors`.
- Recomputación del estado de voz a partir de un audio de referencia, ya que el estado incluido se calculó con estos pesos exactos y debe regenerarse si cambian.
- Generación de muestras pareadas base/ajustado con el mismo texto, voz de referencia, temperatura y semillas para comparación objetiva.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- **Accesibilidad y lectura en voz alta para hablantes de pidgin camerunés**: el modelo permite convertir texto en habla inteligible en una variedad que los sistemas TTS comerciales no cubren, con un peso de 438 MB que puede ejecutarse en CPU sin GPU dedicada.
- **Prototipado de asistentes de voz locales**: al verificar inferencia en CPU con la librería `pocket-tts`, sirve para construir demos de asistentes conversacionales en entornos sin acelerador hardware, aceptando la latencia variable según dispositivo.
- **Investigación en TTS para lenguas de bajos recursos**: la receta completa (200 pasos, AdamW, LR 1e-5, EMA 0,95) y las métricas objetivas publicadas permiten replicar y comparar estrategias de ajuste fino con presupuestos mínimos sobre otras variedades lingüísticas.
- **Generación de material audio para aplicaciones educativas o comunitarias**: con la licencia CC-BY-4.0, se pueden producir locuciones en pidgin para contenidos formativos o informativos, citando la autoría y manteniendo la atribución exigida.
- **Evaluación comparativa de arquitecturas TTS compactas**: el par base/ajustado con muestras pareadas en `samples/baseline/` y `samples/finetuned/` facilita estudios de degradación o mejora perceptual entre el modelo original y la adaptación.
- **Base para futuras adaptaciones a otras lenguas africanas**: al ser un ajuste directo sobre un estudiante publicado, el flujo sirve como plantilla para adaptar Pocket TTS a otras variedades con corpus pequeños, sin pasar por el pipeline de destilación completo.
- **Integración en pipelines de investigación con evaluación controlada**: los archivos `metrics/alignment_counts.json` y `results.json` permiten auditar recuentos, alineamientos y resultados generados de forma reproducible.

## Benchmarks y rendimiento

| Medición | Resultado |
|---|---:|
| GPU de entrenamiento | Tesla T4 |
| Pasos de optimizador | 200 |
| Clips entrenamiento / validación / test | 897 / 50 / 51 |
| Objetivo de validación base | 0,527815 |
| Objetivo de validación final | 0,341064 |
| Reducción relativa del objetivo | 35,38 % |
| Parámetros (códec incluido) | 109.501.826 |
| Bytes del archivo de pesos | 438.033.312 |

| Objetivo (pesos crudos) | Antes de adaptación | Último checkpoint |
|---|---:|---:|
| flow_loss | 0,439705 | 0,330442 |
| eos_loss | 0,881103 | 0,106222 |
| loss | 0,527815 | 0,341064 |

Estas cifras son mediciones del objetivo con semilla fija y teacher forcing, no puntuaciones de precisión de pronunciación ni de calidad perceptual. No se presentan resultados de MMLU, HumanEval, GSM8K ni WER de ASR inglés como métrica de precisión en pidgin. No hay benchmarks perceptuales (MOS) ni comparativas publicadas frente a otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 109,5 millones de parámetros en FP32 y 438 MB de pesos, el modelo está diseñado para ejecutarse en CPU, por lo que la VRAM no es el factor limitante.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4; no se documentan requisitos de GPU para inferencia más allá de la verificación en CPU.
- ¿Cabe en GPU consumer? Sí, por tamaño (438 MB de pesos), aunque el objetivo declarado es CPU y edge.
- Opciones de despliegue: librería `pocket-tts` en Python (verificada); conversión a navegador y móvil pendiente de validación según el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la velocidad en CPU varía según el dispositivo y que no se han realizado benchmarks de latencia en móvil ni navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Archivo de pesos | Precisión | Licencia | Estado |
|---|---:|---:|---|---|---|
| **Turaco Nano (este modelo)** | 109.501.826 | 438.033.312 bytes | FP32 | CC-BY-4.0 | Publicado, piloto experimental |
| Turaco CSM (fotiecodes/turaco-csm-tts-wes-1b) | 1.632.100.161 | 3.297.957.042 bytes | FP16 | no disponible en la información | Publicado previamente |
| kyutai/pocket-tts (modelo base) | no disponible | no disponible | no disponible | no disponible en la información | Modelo upstream |

Frente a Turaco CSM, Nano tiene aproximadamente 14,9 veces menos parámetros y un archivo de pesos unas 7,5 veces menor, pero el propio autor advierte que un peso menor no implica paridad de latencia, memoria ni calidad de habla. No se dispone de comparativas con otros modelos TTS de pidgin camerunés ni con sistemas comerciales en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante entrenado con frases leídas: no se ha demostrado rendimiento con hablantes no vistos, formato largo ni conversación.
- No se han realizado evaluaciones de escucha con hablantes nativos; la pronunciación, el acento y la entonación requieren validación perceptual.
- Las métricas publicadas son objetivos con teacher forcing y semilla fija, no precisión de pronunciación ni MOS; el éxito de exportación no implica calidad.
- El alineamiento CTC se realizó con un modelo de inglés como aproximación al pidgin, lo que puede introducir errores de frontera en los datos de entrenamiento.
- La validación usa recortes aleatorios de prefijo y el registro de validación emplea pesos crudos mientras la exportación usa EMA, lo que puede generar discrepancias entre métricas y comportamiento desplegado.
- El estado de voz incluido se calculó con estos pesos exactos; si se modifican los pesos, debe recomputarse.
- Riesgo de alucinación o artefactos acústicos no cuantificado; no se documentan sesgos específicos más allá de la limitación a un único hablante anónimo.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el carácter experimental y la falta de validación perceptual desaconsejan su uso en producción sin evaluación adicional.
- El corpus fuente declara CC0, pero el modelo derivado queda bajo CC-BY-4.0; conviene revisar las condiciones de atribución en despliegues.
- No hay soporte documentado de cuantización, despliegue en navegador o móvil, ni benchmarks de latencia en esos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fotiecodes/turaco-nano-tts-wes
- Modelo base (Kyutai Pocket TTS): https://huggingface.co/kyutai/pocket-tts
- Release anterior de la familia (Turaco CSM): https://huggingface.co/fotiecodes/turaco-csm-tts-wes-1b
- Dataset Common Voice Scripted Speech 27.0 — Cameroon Pidgin: https://mozilladatacollective.com/datasets/cmu61lm5800kco107ohj0e507
