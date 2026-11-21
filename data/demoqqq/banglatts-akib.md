# demoqqq/banglatts-akib

## Resumen

Bangla TTS — Akib es un modelo de síntesis de voz (text-to-speech) en bengalí construido sobre la arquitectura VITS y distribuido en formato ONNX compatible con sherpa-onnx. Lo desarrolla el usuario demoqqq a partir del modelo base EMTIAZZ Bangladeshi Bengali VITS, afinado con un conjunto de 2.381 clips (152,1 minutos) de la voz de Akib leyendo guiones de Rakib. El entrenamiento se detuvo en 64 épocas de las 65 planificadas, con batch 8, y el checkpoint publicado corresponde al paso 17.500 (final de la época 62/63).

El modelo resuelve un problema acotado: disponer de una voz bengalí concreta, distinguible de las voces Rakib y Kiki del mismo autor, en un artefacto ONNX fp32 a 22.050 Hz listo para inferencia offline con sherpa-onnx. Su relevancia es práctica para desarrolladores que necesitan TTS bengalí local sin dependencias de la nube, aunque el modelo es un fine-tune de nicho con escasa documentación técnica publicada.

El repositorio ocupa 0,1 GB y contiene únicamente `model.onnxx` (VITS ONNX fp32) y `tokens_sherpa.txt` (92 tokens). No se han publicado parámetros totales, contexto, licencia ni idiomas soportados más allá del bengalí implícito en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases; `max_num_sentences` 1 recomendado) |
| Tipos de cuantizacion | solo fp32 (el artefacto publicado es ONNX fp32) |
| Idiomas soportados | bengalí (implícito por la model card; no se declara lista oficial) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnxx`, compatible con sherpa-onnx) + `tokens_sherpa.txt` |

## Arquitectura y entrenamiento

El modelo emplea VITS, una arquitectura de TTS de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial durante el entrenamiento, con salida a 22.050 Hz. El artefacto publicado es la exportación ONNX fp32 del generador, pensada para el camino VITS de `OfflineTts` de sherpa-onnx, con parámetros de inferencia recomendados: `noise_scale` 0,667, `noise_scale_w` 0,8, `length_scale` 1,0 y `max_num_sentences` 1.

El entrenamiento parte del modelo base EMTIAZZ Bangladeshi Bengali VITS y se afina sobre 2.381 clips (152,1 minutos) de la voz de Akib, con batch 8 durante 64 épocas. El vocabulario de tokens es de 92 entradas, compartido con las voces Kiki v2, Rakib v2 y triple-combined del mismo autor. La model card indica que antes de sintetizar texto bengalí escrito es necesario normalizar las formas compuestas য়→য+়, ড়→ড+় y ঢ়→ঢ+় (solo formas descompuestas), lo que sugiere que el vocabulario no cubre directamente esas variantes. No se documentan composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí a partir de texto escrito, con salida de audio a 22.050 Hz.
- Voz con identidad concreta (Akib), distinta de las voces Rakib y Kiki del mismo autor.
- Inferencia offline mediante sherpa-onnx (`OfflineTts`, camino VITS).
- Control de prosodia y velocidad mediante `noise_scale`, `noise_scale_w` y `length_scale`.
- Procesamiento por frases (`max_num_sentences` 1), adecuado para síntesis incremental.
- No se documentan tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.

## Casos de uso

- Locución de contenido audiovisual en bengalí: generar narraciones para vídeos, podcasts o audiolibros usando la voz Akib, con control de velocidad mediante `length_scale` para ajustar la duración al metraje.
- Sistemas de accesibilidad: convertir texto bengalí en audio para lectores de pantalla o interfaces de asistencia, ejecutando sherpa-onnx en local sin enviar contenido a servicios externos.
- Asistentes conversacionales locales: integrar el ONNX como motor TTS de un asistente de voz en bengalí, sintetizando cada respuesta frase a frase con `max_num_sentences` 1 para reducir latencia percibida.
- Generación de avisos y anuncios automatizados: producir mensajes hablados en bengalí para transporte público, comercios o sistemas de megafonía a partir de plantillas de texto.
- Pruebas A/B de voces sintéticas: comparar Akib frente a Rakib y Kiki (mismo vocabulario de 92 tokens) en estudios de preferencia de voz para aplicaciones dirigidas a hablantes de bengalí.
- Prototipado de doblaje y previsualización: generar pistas de voz temporales para maquetas de vídeo antes de contratar locución humana, dado el reducido tamaño del artefacto (0,1 GB) y su despliegue offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras oficiales; al tratarse de un VITS ONNX fp32 de repo de 0,1 GB, la huella de memoria es reducida y apta para CPU, pero no se publican medidas.
- GPU recomendadas: no disponible; sherpa-onnx permite ejecución en CPU y, si se configura, en GPU, sin que la model card especifique modelos concretos (A100, H100, RTX 4090, etc.).
- GPU consumer: previsiblemente viable en GPU consumer por el tamaño del artefacto, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: sherpa-onnx (`OfflineTts`, camino VITS) con `model.onnxx` y `tokens_sherpa.txt`; no se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI) por tratarse de un modelo TTS y no de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bangla TTS — Akib (demoqqq) | no disponible | no disponible (TTS por frases) | no disponible | no disponible | ONNX en Hugging Face |
| Rakib v2 (mismo autor) | no disponible | no disponible | no disponible | no disponible | citado en la model card; disponibilidad no verificada |
| Kiki v2 (mismo autor) | no disponible | no disponible | no disponible | no disponible | citado en la model card; disponibilidad no verificada |
| EMTIAZZ Bangladeshi Bengali VITS (base) | no disponible | no disponible | no disponible | no disponible | citado como base; disponibilidad no verificada |

No se dispone de cifras de parámetros, contexto ni benchmarks para ninguno de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: se detuvo en 64 de 65 épocas por decisión del usuario, y el checkpoint publicado corresponde al paso 17.500 (final de la época 62/63), no al final del entrenamiento planificado.
- Dataset pequeño y de un solo hablante: 2.381 clips (152,1 minutos) limitan la variedad prosódica y de estilos; la voz solo reproduce el registro de Akib leyendo guiones concretos.
- Normalización obligatoria del texto: hay que descomponer য়, ড় y ঢ় antes de sintetizar; omitirla puede producir errores de pronunciación.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del ONNX; la licencia del modelo base EMTIAZZ tampoco se detalla en la información disponible.
- Idiomas: solo bengalí; no se declaran otros idiomas ni variantes regionales.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, ruido o pronunciaciones erráticas en texto fuera de distribución, entradas muy largas o caracteres no cubiertos por el vocabulario de 92 tokens.
- Sesgos: no se documentan sesgos conocidos, pero la voz está condicionada por un único hablante y un corpus restringido.
- Documentación escasa: sin parámetros, benchmarks, latencias ni guía de producción; la integración depende de la documentación de sherpa-onnx.
- Fecha de creación del repositorio (2026-11-21) y cero descargas: sin validación externa ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/demoqqq/banglatts-akib
- sherpa-onnx (runtime recomendado): no disponible en la información proporcionada
- Modelo base EMTIAZZ Bangladeshi Bengali VITS: no disponible enlace directo
- Paper de VITS: no disponible en la información proporcionada
- Repositorios, blogs o demos adicionales: no disponibles
