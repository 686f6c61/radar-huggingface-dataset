# cyttic/hmt-trocrctc-stroke3-s43

## Resumen

`cyttic/hmt-trocrctc-stroke3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el autor `cyttic` dentro de un estudio de *augmentation* denominado `htr-metrics-transfer`. El modelo parte de la arquitectura TrOCR con cabecera CTC (`trocrctc`) y ha sido entrenado con una estrategia de aumentación de datos concreta (`stroke3`) y una semilla fija (`43`), lo que lo convierte en una variante reproducible de un experimento comparativo más amplio.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito en hebreo (`he`), un idioma con alfabeto propio y convenciones de escritura de derecha a izquierda que complican el reconocimiento respecto a lenguajes latinos. Con 87,3 millones de parámetros y un repositorio de 0,3 GB, es un modelo compacto orientado a tareas de investigación y evaluación de transferencia de métricas, no a un uso generalista.

Es relevante ahora porque documenta de forma explícita un protocolo experimental (split de entrenamiento sin los escritores de dev, test Option-B, decodificación greedy sin modelo de lenguaje) y publica métricas concretas de CER y WER, lo que permite reproducir y comparar variantes de aumentación sobre la misma base arquitectónica. Su licencia MIT facilita su reutilización en investigación y en prototipos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (`trocrctc`); transformer encoder-decoder para visión-texto |
| Parámetros totales | 87.279.756 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en TrOCR, un transformer encoder-decoder diseñado para reconocimiento de texto en imágenes, al que se le ha acoplado una cabecera CTC (`trocrctc`) en lugar de la decodificación autoregresiva habitual. Esta variante CTC permite decodificación greedy sin modelo de lenguaje, lo que simplifica el pipeline de inferencia y reduce dependencias externas.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores que componen el conjunto de desarrollo (*dev writers*), una decisión que evita fuga de información entre escritores y hace que la evaluación mida generalización a escritores no vistos. La aumentación aplicada es `stroke3` y la semilla es 43. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,1109 y WER 0,4585. Los detalles completos se remiten a `results.json` en el repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de carácter y de palabra (métricas CER y WER reportadas).
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Entrenamiento reproducible mediante semilla fija y protocolo de split documentado.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de manuscritos hebreos: el modelo transcribe imágenes de escritura manual a texto plano, adecuado para archivos históricos y colecciones documentales en hebreo.
- Investigación en aumentación de datos: sirve como punto de comparación reproducible (semilla 43, aumentación `stroke3`) frente a otras variantes del mismo estudio `htr-metrics-transfer`.
- Evaluación de transferencia de métricas HTR: permite medir CER y WER sobre el test HHD Option-B bajo un protocolo fijo y compararlos con configuraciones alternativas.
- Prototipado de pipelines OCR para hebreo: al ser un modelo de 87,3 M de parámetros y 0,3 GB, puede integrarse en prototipos ligeros de transcripción sin infraestructura pesada.
- Análisis de generalización a escritores no vistos: al haberse entrenado sin los *dev writers*, es útil para estudiar robustez frente a variabilidad de caligrafía.
- Base para *fine-tuning* en dominios específicos: su licencia MIT y formato safetensors permiten adaptarlo a corpus propios de manuscritos hebreos.

## Benchmarks y rendimiento

| Conjunto de evaluación | Decodificación | Modelo de lenguaje | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,1109 | 0,4585 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 87,3 M de parámetros en precisión completa el peso ronda los 0,35 GB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superiores) debería ser suficiente.
- Cabe en consumer GPU: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrctc-stroke3-s43` | 87,3 M | no disponible | 0,1109 | MIT | Hugging Face |
| `cyttic/hmt-trocrctc-stroke3-s42` | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa documentada en la información disponible es la variante con semilla 42 del mismo estudio, de tamaño idéntico pero sin métricas publicadas en los datos proporcionados.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo; no se documenta soporte multilingüe.
- El WER de 0,4585 indica una tasa elevada de errores a nivel de palabra, lo que limita su uso en transcripción de alta fidelidad sin revisión humana.
- Al evaluarse sin modelo de lenguaje, no se aplica corrección contextual; un LM externo podría reducir errores, pero no forma parte del modelo.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus concreto de escritores, puede degradarse frente a estilos caligráficos no representados.
- Riesgo de alucinación no cuantificado en la información disponible.
- Aunque la licencia es MIT, conviene verificar las condiciones de uso del corpus de entrenamiento (`cyttic/hhd-optionb-split`) antes de un despliegue comercial.
- Es un modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke3-s43
- Variante con semilla 42: https://huggingface.co/cyttic/hmt-trocrctc-stroke3-s42
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (referencia en la model card; no se proporciona URL directa en la información disponible)
