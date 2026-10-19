# shaeel12/moonshine-base-urdu-final-repo

## Resumen

`moonshine-base-urdu-final-repo` es un modelo de reconocimiento automático del habla (ASR) para urdu publicado por el usuario `shaeel12` en Hugging Face. Se trata de un fine-tune de `moonshine-ai/moonshine-base-ar`, un modelo de la familia Moonshine —encoder-decoder transformer de aproximadamente 61,5 millones de parámetros— originalmente orientado al árabe y ajustado aquí sobre el dataset `shaeel12/urdu-speech-unified`.

El modelo aborda la transcripción de audio en urdu, un idioma con relativamente pocos recursos ASR abiertos en comparación con el inglés. La familia Moonshine resulta relevante porque procesa audio de longitud variable (el coste computacional escala con la duración real del audio, no con un padding fijo de 30 s como Whisper) y está diseñada para transcripción en vivo y comandos de voz en dispositivos con recursos limitados.

Ahora bien, la única métrica publicada es un WER del 60,3 % en el conjunto de desarrollo, un valor muy alto que indica un rendimiento pobre para uso real. Además, el repositorio no declara licencia, no tiene descargas ni validación de la comunidad, y la model card se titula "Moonshine Tiny" aunque el recuento de parámetros (61,5 M) corresponde a la variante Base. Debe tratarse como un baseline experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Moonshine) |
| Parametros totales | 61.514.752 (~61,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa audio de longitud variable; no se publica límite máximo de duración) |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye pesos safetensors) |
| Idiomas soportados | Urdu (`ur`) |
| Licencia | No disponible (no declarada en el repositorio; los modelos Moonshine upstream se distribuyen bajo MIT según la documentación de Moonshine Voice) |
| Formato de pesos | safetensors |
| Modelo base | `moonshine-ai/moonshine-base-ar` |
| Dataset de ajuste | `shaeel12/urdu-speech-unified` |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Moonshine: un transformer encoder-decoder para speech-to-text que consume audio de longitud variable, de modo que el coste de inferencia crece con la duración real de la entrada en lugar de con una ventana fija. El modelo parte de `moonshine-base-ar`, la variante "base" (~61,5 M de parámetros) orientada al árabe, y se ha ajustado sobre el corpus `shaeel12/urdu-speech-unified` para transcribir urdu.

No se dispone de información sobre el volumen de tokens o de horas de audio empleadas en el ajuste, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas. La model card solo aporta el resultado de desarrollo (WER 60,3 %) y la identidad del dataset; no se documentan hiperparámetros, particiones de evaluación ni detalles del preprocesado. Tampoco se especifica si el ajuste congeló el encoder, el decoder o ambos.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en urdu, con salida de texto plano.
- Procesamiento de audio de longitud variable, lo que permite alimentar clips cortos sin padding artificial.
- Orientación a transcripción en vivo y comandos de voz, gracias al diseño de bajo coste de la familia Moonshine.
- Adecuado para despliegue en entornos con recursos limitados (CPU o GPU de gama baja) por su tamaño de ~61,5 M de parámetros.
- No soporta tool calling ni function calling: es un modelo puramente ASR, sin interfaz de instrucciones.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de visión, audio generativo ni traducción: solo transcribe audio a texto.
- Capacidad multilingüe limitada al urdu según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Prototipado de transcripción en urdu: usar el modelo como primer eslabón en un pipeline de speech-to-text para validar la viabilidad de una aplicación antes de invertir en un modelo mayor; su tamaño reducido permite iterar rápido en local.
- Etiquetado asistido de corpus: pretranscribir audio en urdu y revisar manualmente las salidas para acelerar la anotación de nuevos datasets, teniendo en cuenta el WER elevado y el consiguiente esfuerzo de corrección.
- Baseline de investigación: servir como punto de partida para comparar futuros fine-tunes de Moonshine en urdu, dado que es un repositorio pequeño y reproducible con una métrica de referencia publicada (WER 60,3 % en dev).
- Comandos de voz en dispositivos edge: integrar el modelo en aplicaciones de dictado o control por voz en urdu sobre hardware modesto (CPU, Raspberry Pi o móvil) donde un modelo de ~61 M de parámetros cabe holgadamente.
- Subtitulado offline de clips cortos: generar subtítulos preliminares para vídeos de corta duración en urdu, con revisión humana posterior obligatoria por la tasa de error.
- Preprocesamiento para pipelines NLU: convertir audio en urdu a texto para alimentar clasificadores de intención, análisis de sentimiento o motores de búsqueda, aceptando que la calidad de la transcripción limitará la precisión aguas abajo.
- Transcripción de encuestas y entrevistas: procesar grabaciones de campo en urdu para su posterior análisis cualitativo, con verificación manual de los fragmentos críticos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto |
|---|---|---|
| WER | 60,3 % | Desarrollo (dev) del dataset de ajuste |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Al tratarse de un modelo ASR, las métricas relevantes serían WER/CER por dominio y condición acústica, de las cuales solo se reporta el WER de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~246 MB en fp32, ~123 MB en fp16 y ~62 MB en int8 (cálculo teórico a partir de los 61,5 M de parámetros; no verificado con el repositorio).
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090 o una A100 están sobredimensionadas para este modelo. Una GTX 1650, una RTX 3060 o incluso una GPU integrada son suficientes.
- Cabe holgadamente en GPU consumer y en CPU: el cuello de botella es el frontend de audio, no el modelo.
- Opciones de despliegue: `transformers` (PyTorch con safetensors), exportación a ONNX Runtime / `.ort` (formato habitual del ecosistema Moonshine) y la librería Moonshine Voice para inferencia en streaming. vLLM y TGI no son adecuados: están pensados para modelos de lenguaje, no para ASR encoder-decoder de este tamaño.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF (real-time factor) ni de latencia por clip para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shaeel12/moonshine-base-urdu-final-repo` | ~61,5 M | Urdu | 60,3 % (dev) | No declarada | Hugging Face |
| `moonshine-ai/moonshine-base-ar` (base) | ~61,5 M | Árabe | No disponible | MIT (upstream) | Hugging Face |
| `shaeel12/moonshine-tiny-urdu` | ~27 M (variante tiny) | Urdu | No disponible | No disponible | Hugging Face |
| Whisper base (OpenAI) | ~74 M (aprox.) | ~99 idiomas, incl. urdu | No disponible en esta ficha | MIT | Hugging Face / OpenAI |

La comparación directa con Whisper es pertinente por tamaño y tarea, pero no se dispone de cifras de WER comparables en urdu dentro de la información proporcionada. La ventaja diferencial de Moonshine frente a Whisper es el procesamiento de audio de longitud variable y su orientación a streaming en dispositivos de bajos recursos.

## Limitaciones y advertencias

- WER del 60,3 % en desarrollo: en la práctica implica que más de la mitad de las palabras se transcriben mal; no es apto para producción sin un salto cualitativo previo (más datos, mejor ajuste o un modelo mayor).
- Licencia no declarada: existe incertidumbre legal sobre el uso comercial. Aunque el Moonshine upstream es MIT según la documentación, el fine-tune no hereda necesariamente esa declaración de forma explícita.
- Inconsistencia en la model card: el título dice "Moonshine Tiny" mientras que el recuento de parámetros corresponde a la variante Base; conviene verificar la configuración antes de confiar en la nomenclatura.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el repositorio se creó y actualizó el mismo día, sin historial de versiones.
- Evaluación insuficiente: solo se reporta WER de desarrollo, sin desglose por dominio, hablante, género, dialecto ni condición acústica (ruido, teléfono, micrófono lejano).
- Cobertura de idioma restringida al urdu; no se declaran variantes dialectales ni manejo de code-switching con inglés, habitual en el habla real en urdu.
- Riesgo de alucinación en la transcripción: los modelos ASR encoder-decoder pueden generar texto plausible cuando el audio es ininteligible o está fuera de distribución.
- Sin soporte de instrucciones, tool calling ni razonamiento: no debe plantearse como sustituto de un LLM.
- Restricciones de audio no documentadas: se desconoce el comportamiento con clips muy largos, silencios prolongados o audio musical.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaeel12/moonshine-base-urdu-final-repo
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-base-ar
- Dataset de ajuste: https://huggingface.co/datasets/shaeel12/urdu-speech-unified
- Fine-tune relacionado del mismo autor: https://huggingface.co/shaeel12/moonshine-tiny-urdu
- Otro fine-tune relacionado del mismo autor: https://huggingface.co/shaeel12/moonshine-base-urdu-final-pta-nhi-ab
- Documentación de Moonshine Voice (modelos disponibles): https://moonshine-voice.readthedocs.io/en/stable/models/available-models/
- DeepWiki de Moonshine (variantes de modelo): https://deepwiki.com/moonshine-ai/moonshine/8-model-variants
- Ficha en Free2AITools: https://free2aitools.com/model/shaeel12/moonshine-base-urdu-final-pta-nhi-ab
