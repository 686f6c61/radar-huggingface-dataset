# juice500/xls-r-6-phonemodel

## Resumen

`xls-r-6-phonemodel` es un modelo de segmentación y reconocimiento fonético en inglés construido sobre las representaciones congeladas de `facebook/wav2vec2-xls-r-300m`, un modelo auto-supervisado de voz de 300 millones de parámetros. Lo desarrolla el autor de Hugging Face `juice500` (grupo de investigación vinculado al repositorio `juice500ml/phonespam`) y se publica como el punto (encoder XLS-R, capa 6) de una rejilla experimental descrita en el artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026).

El modelo no es un transformer generativo al uso: implementa el método SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del encoder en un vector de 43 activaciones fonológicas interpretables (voz, nasalidad, estridencia, silabicidad, etc.). A partir de esa representación, dos cabezas ligeras resuelven la segmentación en fronteras y el etiquetado de cada segmento con un inventario de fonemas.

Es relevante porque demuestra que un encoder congelado de 300 M de parámetros, sin fine-tuning completo, puede producir segmentación y reconocimiento fonético de forma interpretable y con un coste de entrenamiento mínimo. El repositorio está pensado como referencia secundaria: el propio autor indica que el mejor modelo de la familia es `juice500/wavlm-24-phonemodel`, por lo que esta variante sirve para reproducir el punto de la rejilla correspondiente a XLS-R capa 6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder auto-supervisado XLS-R (wav2vec2) congelado + cabezas SPAM (mapeo de activaciones fonológicas) |
| Parametros totales | 300 M en el encoder base (XLS-R-300m); cabezas adicionales no cuantificadas en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por fotogramas; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); admite restricción a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el código y el modelo); PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `phonespam.PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder XLS-R-300m congelado (familia wav2vec2, operando sobre audio a 16 kHz) del que se extraen las representaciones de la capa 6, y un módulo SPAM que transforma cada fotograma en un vector de 43 activaciones fonológicas en el rango [0, 1] con nombres como `silence+`, `syl+`, `son+`. Sobre esa representación interpretable actúan dos cabezas: una de segmentación (detección de fronteras entre unidades) y otra de reconocimiento (etiquetado con fonemas). El pipeline completo se expone mediante `model.transcribe()`, que devuelve segmentos contiguos con tiempos en segundos.

El entrenamiento utiliza el corpus TIMIT (`timit-asr/timit_asr`), un dataset clásico de voz leída en inglés con anotaciones fonéticas a nivel de fonema. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado fonético). La innovación técnica destacable es precisamente el mapeo SPAM: convertir la representación opaca de un S3M en activaciones fonológicas interpretables, lo que permite inspeccionar qué rasgos articulatorios detecta el encoder y restringir el vocabulario de salida a inventarios fonológicos de lenguas concretas mediante PHOIBLE.

## Capacidades

- Segmentación fonética: detección de fronteras entre unidades fonéticas en audio de voz.
- Reconocimiento de fonemas: etiquetado de cada segmento con un símbolo de un inventario fonológico.
- Representación fonológica interpretable: vector de 43 activaciones (`voicing`, `nasality`, `stridency`, etc.) por fotograma, accesible vía `model.spam()`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la salida a un inventario PHOIBLE concreto (útil para adaptar el reconocimiento a otras lenguas).
- Procesamiento de audio a 16 kHz con salida de segmentos contiguos con marcas temporales en segundos.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo thinking: es un modelo discriminativo de etiquetado fonético.
- Capacidad multilingüe limitada: el modelo está entrenado en inglés; el soporte de otras lenguas depende del inventario PHOIBLE elegido, no de entrenamiento específico.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos fonéticos automáticos sobre corpus de habla para estudiar fenómenos de coarticulación, elisión o asimilación, aprovechando la representación interpretable de 43 rasgos.
- Anotación asistida de corpus de voz: pre-anotar segmentos y etiquetas fonéticas en grabaciones en inglés para revisión humana, reduciendo el coste frente a la anotación manual.
- Docencia de fonética: visualizar las activaciones fonológicas (`spam.featnames`) sobre un audio para explicar rasgos como la sonoridad o la nasalidad de forma gráfica.
- Análisis de pronunciación: comparar la secuencia de fonemas reconocida con una transcripción de referencia para detectar desviaciones en aprendices de inglés.
- Adaptación a otras lenguas: usar `vocab_for_language` con inventarios PHOIBLE para probar el modelo en lenguas no inglesas y evaluar su transferencia cero-disparo.
- Reproducibilidad de investigación: replicar el punto (XLS-R, capa 6) de la rejilla del artículo SPAM para comparar con otras capas y encoders (por ejemplo, WavLM 24).
- Filtrado y análisis de spam telefónico: el tag `spam` del repo sugiere su uso en pipelines de análisis de audio telefónico, aunque la información disponible no detalla este flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder XLS-R-300m en fp32 ocupa aproximadamente 1,2 GB de pesos; en fp16 alrededor de 0,6 GB. Las cabezas SPAM añaden una cantidad no especificada pero presumiblemente pequeña.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El modelo también puede ejecutarse en CPU para audios cortos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el paquete `phonespam` (`pip install phonespam`) es la vía oficial, con `PhoneModel.from_pretrained(..., device="cuda")`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/xls-r-6-phonemodel` | 300 M (encoder congelado) | Audio 16 kHz, capa 6 | Segmentación y reconocimiento fonético | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | no disponible (WavLM base) | Audio 16 kHz, capa 24 | Segmentación y reconocimiento fonético | no disponible | Hugging Face |
| `facebook/wav2vec2-xls-r-300m` | 300 M | Audio 16 kHz | Representaciones auto-supervisadas (base) | no disponible | Hugging Face |
| `facebook/wav2vec2-base-960h` | 95 M | Audio 16 kHz | Reconocimiento de voz (ASR) | no disponible | Hugging Face |

El modelo comparable más directo es `juice500/wavlm-24-phonemodel`, que el propio autor señala como el mejor de la familia. Frente a un ASR clásico como `wav2vec2-base-960h`, la diferencia es de tarea: aquí la salida es fonética (segmentos y fonemas), no texto ortográfico.

## Limitaciones y advertencias

- Entrenado únicamente en inglés (TIMIT); el rendimiento en otras lenguas no está validado y depende del inventario PHOIBLE elegido.
- TIMIT es un corpus de voz leída, de dominio limitado y con hablantes acústicamente controlados; el rendimiento en habla espontánea, ruidosa o telefónica puede degradarse notablemente.
- Es un punto secundario de la rejilla experimental: el propio autor recomienda `wavlm-24-phonemodel` como mejor modelo, por lo que este no debe tomarse como referencia de máxima calidad.
- Riesgo de alucinación en el sentido de etiquetas fonéticas incorrectas en fonemas ausentes del inventario o en audio fuera de dominio; no hay métricas publicadas que permitan acotar el error.
- Sesgos potenciales derivados del corpus TIMIT (variedades del inglés americano, demografía concreta de hablantes); no se documentan análisis de sesgo.
- La licencia MIT cubre el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en runtime, que es CC BY-SA 3.0 y tiene condiciones de atribución y compartición independientes.
- El repositorio es de 0.0 GB y tiene 0 descargas y 0 likes: es un artefacto de investigación reciente, sin validación comunitaria ni garantías de mantenimiento.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; su uso en pipelines de producción debe limitarse a la tarea de etiquetado fonético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-6-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Modelo recomendado de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
