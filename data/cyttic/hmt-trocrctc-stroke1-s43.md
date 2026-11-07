# cyttic/hmt-trocrctc-stroke1-s43

## Resumen

El modelo `cyttic/hmt-trocrctc-stroke1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumento de datos denominado `htr-metrics-transfer`. Se basa en la arquitectura TrOCR combinada con una cabeza de decodificacion CTC, y se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo para evitar fuga de informacion.

El modelo forma parte de una familia de experimentos que varian la estrategia de *augmentation* (`stroke1`) y la semilla de entrenamiento (`43`), lo que sugiere que su proposito principal es servir como pieza de comparacion en un estudio controlado sobre transferencia de metricas en HTR, mas que como modelo de produccion generalista. Su tamano es reducido (unos 87,3 millones de parametros) y esta especializado en hebreo (`he`), con licencia MIT.

Es relevante ahora por su caracter abierto y ligero, que permite reproducir experimentos de HTR en hardware modesto, y porque documenta explicitamente sus metricas de evaluacion (CER 0,1107 y WER 0,4539) sobre el conjunto de test HHD Option-B con decodificacion voraz y sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (transformer encoder-decoder para vision-texto, decodificacion CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la estirpe TrOCR: un *encoder* de vision tipo ViT procesa la imagen de la linea de texto manuscrito y un *decoder* transformer genera la secuencia de caracteres. En esta variante (`trocrctc`) la decodificacion se realiza mediante CTC (*Connectionist Temporal Classification*) en lugar de decodificacion autorregresiva clasica, lo que simplifica el alineamiento y permite decodificacion voraz sin modelo de lenguaje.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en el conjunto de desarrollo, con la augmentation `stroke1` y semilla 43. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo HTR). Los detalles completos del estudio se remiten a un fichero `results.json` no incluido en la informacion disponible.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes de lineas de texto.
- Transcripcion caracter a caracter mediante decodificacion CTC voraz.
- Funcionamiento sin modelo de lenguaje externo (evaluacion greedy, no LM).
- Especializacion en un dominio acotado (manuscrito hebreo del corpus HHD).
- No se documentan capacidades de tool calling, agentes, vision general, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada al hebreo segun la model card.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo transcribe lineas de texto escaneadas, adecuado para patrimonios documentales donde se requiere un OCR especializado en escritura manual hebrea.
- Reproduccion de experimentos de HTR: al estar identificado por augmentation y semilla, permite replicar el estudio `htr-metrics-transfer` y comparar el efecto de `stroke1` frente a otras estrategias.
- Baseline en investigacion academica: su tamano reducido (87 M de parametros) y licencia MIT lo hacen util como punto de partida para experimentos de transferencia de metricas.
- Evaluacion de pipelines de preprocesado: sirve para medir como afectan distintas tecnicas de aumento (en este caso `stroke1`) al CER y WER de un reconocedor CTC.
- Prototipado en hardware modesto: al ocupar aproximadamente 0,3 GB en safetensors, puede cargarse en GPUs de consumo para pruebas rapidas de transcripcion.
- Generacion de datos etiquetados辅助: puede emplearse para pre-anotar lineas manuscritas hebreas que luego se corrigen manualmente, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1107 | HHD Option-B test, decodificacion greedy, sin LM |
| WER | 0,4539 | HHD Option-B test, decodificacion greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB en precision completa (fp32) para los 87,3 M de parametros; menos de 0,2 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: al no haber variantes GGUF publicadas, el despliegue natural es via `transformers` con safetensors; llama.cpp u Ollama no estan soportados de forma directa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke1-s43 | 87,3 M | no disponible | TrOCR + CTC, hebreo | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | Transformer vision-texto, ingles | MIT | Hugging Face |
| Modelos HTR especificos de hebreo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no soporta otros idiomas.
- Entrenado sobre un corpus concreto (`hhd-optionb-split`); puede degradarse fuera de ese dominio.
- El WER de 0,4539 es elevado, lo que indica errores frecuentes a nivel de palabra; el CER de 0,1107 es aceptable pero no apto para produccion sin revision humana.
- Evaluado con decodificacion voraz y sin modelo de lenguaje; el rendimiento podria variar con otras estrategias de decodificacion.
- Riesgo de alucinacion y sustituciones caracter a caracter inherente a los modelos CTC sin LM.
- Posibles sesgos derivados de los escritores y la composicion del corpus de entrenamiento.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion.

## Enlaces

- [Hugging Face: cyttic/hmt-trocrctc-stroke1-s43](https://huggingface.co/cyttic/hmt-trocrctc-stroke1-s43)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
