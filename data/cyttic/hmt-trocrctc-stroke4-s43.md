# cyttic/hmt-trocrctc-stroke4-s43

## Resumen

cyttic/hmt-trocrctc-stroke4-s43 es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado sobre la arquitectura TrOCR con cabecera CTC. Lo desarrolla cyttic, autor del repositorio, en el marco de un estudio de aumentación de datos denominado «htr-metrics-transfer», cuyo objetivo es medir cómo distintas estrategias de aumentación afectan a la transferibilidad de las métricas de reconocimiento entre conjuntos de escritores. Se trata de un artefacto experimental, no de un modelo listo para producción.

El modelo tiene 87,3 millones de parámetros (dato confirmado en los safetensors) y está especializado en hebreo manuscrito. Se entrena sobre la partición de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores de dev, y se evalúa sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,1069 y WER 0,4451.

Su relevancia es acotada y de carácter metodológico: forma parte de una familia de variantes (stroke4, geom4, etc.) con distintas semillas, pensadas para comparar el efecto de la aumentación en HTR. No es un modelo generalista ni compite con sistemas OCR/HTR comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (tag `ctc`, modelo `trocrctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision para lineas de texto manuscrito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, pero con una variante de cabecera CTC en lugar de decodificacion autorregresiva. El sufijo `trocrctc` en el nombre y el tag `ctc` confirman este diseno. El encoder procesa la imagen de la linea manuscrita y la salida se alinea mediante CTC, lo que permite decodificacion greedy sin modelo de lenguaje.

El entrenamiento se realizo sobre la particion de train de `cyttic/hhd-optionb-split` menos los escritores de dev, con la aumentacion `stroke4` y semilla 43. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni sobre el uso de RLHF/DPO (no aplicable en un modelo HTR). La innovacion destacable es precisamente el protocolo experimental: variantes de aumentacion con semillas fijas para estudiar la transferencia de metricas entre escritores.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes de lineas.
- Decodificacion CTC greedy sin modelo de lenguaje externo.
- Salida a nivel de caracteres y palabras, evaluada con CER y WER.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no, solo hebreo.
- Capacidades especiales: ninguna adicional (sin modo thinking, vision general, audio ni otras).

## Casos de uso

- Investigacion en HTR: servir como punto de comparacion dentro del estudio de aumentacion para medir el efecto de `stroke4` frente a otras variantes.
- Transcripcion de manuscritos hebreos historicos: reconocimiento de lineas en colecciones digitalizadas, con la salvedad de que el CER ~0,107 limita su uso a entornos de transcripcion asistida.
- Reproducibilidad de experimentos: semilla fija (43) y dataset publico permiten replicar los resultados del estudio.
- Generacion de lineas base (baselines): comparar contra variantes `geom4` y otras semillas del mismo autor.
- Analisis de transferencia entre escritores: evaluar el comportamiento del modelo cuando los escritores de test no aparecen en entrenamiento.
- Prototipado academico: integrar el modelo en pipelines de investigacion sobre reconocimiento de escritura a mano.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1069 | HHD Option-B test, greedy, sin LM |
| WER | 0,4451 | HHD Option-B test, greedy, sin LM |

Comparativa con variantes del mismo autor (segun la busqueda web):

| Modelo | Aumentacion | Semilla | CER | WER |
|---|---|---|---|---|
| hmt-trocrctc-stroke4-s43 | stroke4 | 43 | 0,1069 | 0,4451 |
| hmt-trocrctc-geom4-s42 | geom4 | 42 | 0,0712 | 0,3156 |
| hmt-trocrctc-stroke4-s42 | stroke4 | 42 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 87,3 M de parametros, la inferencia en fp32 requiere aproximadamente 0,35 GB y en fp16 alrededor de 0,17 GB, mas el overhead del encoder de vision (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por tamano; tambien A100/H100 para lotes grandes.
- Cabe en GPU consumer: si, por el reducido numero de parametros.
- Opciones de despliegue: no confirmadas; al ser un modelo de vision con safetensors, requiere frameworks de inferencia de vision (por ejemplo, Transformers) y no encaja directamente en llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER/WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hmt-trocrctc-stroke4-s43 | 87,3 M | no disponible | 0,1069 / 0,4451 | MIT | Hugging Face |
| hmt-trocrctc-geom4-s42 | ~87,3 M | no disponible | 0,0712 / 0,3156 | MIT (presumible) | Hugging Face |
| hmt-trocrctc-stroke4-s42 | ~87,3 M | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de benchmarks frente a modelos HTR externos (por ejemplo, TrOCR original de Microsoft o sistemas OCR comerciales).

## Limitaciones y advertencias

- Modelo experimental de investigacion, no validado para produccion.
- CER de 0,1069 y WER de 0,4451: la tasa de error a nivel de palabra es alta.
- Entrenado y evaluado solo en hebreo manuscrito; no generaliza a otros idiomas.
- Evaluado con decodificacion greedy y sin modelo de lenguaje, lo que limita la correccion de errores.
- Sesgos conocidos: no documentados, pero el dataset esta restringido a los escritores de `hhd-optionb-split`.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir transcripciones erroneas en caracteres ambiguos.
- Licencia MIT: permite uso comercial, aunque el autor no garantiza idoneidad.
- Limitaciones de contexto e idioma no documentadas mas alla de lo indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s43
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
- Dataset de entrenamiento: `cyttic/hhd-optionb-split` (referenciado en la model card)
- Paper, blog o repositorio adicional: no disponible
