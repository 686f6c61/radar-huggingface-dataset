# Abu-Dju/Index-Translate-omni-9B-GGUF

## Resumen

Index-Translate-omni-9B es un modelo multimodal de traduccion desarrollado por IndexTeam, distribuido en formato GGUF por el usuario Abu-Dju para su uso con llama.cpp. El modelo cubre traduccion de texto multilingue, traduccion de imagenes (image-to-text), reconocimiento automatico de voz y traduccion bidireccional chino-ingles de audio, aunque la exportacion GGUF solo conserva el modelo de lenguaje y el proyector de vision, no el codificador de audio original.

Con 8.953.803.264 parametros (aproximadamente 9B), el modelo se presenta como una alternativa especializada en traduccion frente a los modelos de proposito general, con resultados de benchmarks propios en FLORES, WMT24++, WMT26, MEME, IFMTBench y tareas de ASR y traduccion de voz. La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de cuantizaciones desde f16 hasta Q2_K permite desplegarlo en hardware muy diverso.

Su relevancia actual radica en la combinacion de traduccion de texto con restricciones de terminologia y formato, traduccion de imagenes y soporte de vision en un unico modelo de ~9B, algo poco habitual en la categoria de modelos especializados en traduccion. La limitacion de audio en la version GGUF debe tenerse en cuenta para no confundirla con la version completa FP8/FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 segun los benchmarks de imagen), con proyector de vision; no se detalla la arquitectura exacta en la informacion disponible |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores de vision mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se construye sobre la familia Index-Translate y que los benchmarks de traduccion de imagen comparan cada modelo Omni con su baseline Qwen3.5, lo que sugiere que la arquitectura subyacente deriva de Qwen3.5. El modelo incorpora un proyector de vision separado (mmproj) para el procesamiento de imagenes, y en su version original incluye modulos de audio (codificador de audio, conector de audio y runtime de audio) que no estan presentes en la exportacion GGUF.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona soporte de restricciones de terminologia y formato en la traduccion, lo que implica un entrenamiento orientado al seguimiento de instrucciones (instruction following), con benchmarks especificos como instTrans e IFMTBench para medir esta capacidad. Tampoco se detalla ninguna innovacion tecnica como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto multilingue con soporte de restricciones de terminologia y formato (terminology and formatting constraints).
- Traduccion de imagenes (image-to-text): extrae y traduce texto presente en imagenes mediante el proyector de vision.
- Reconocimiento automatico de voz (ASR) para chino e ingles: en la version original FP8/FP4, no en la GGUF.
- Traduccion bidireccional chino-ingles de voz: en la version original FP8/FP4, no en la GGUF.
- Seguimiento de instrucciones de traduccion (instTrans, instTrans_minor, IFMTBench).
- Capacidades conversacionales (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de vision mediante el proyector mmproj en llama.cpp.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Traduccion de documentacion tecnica chino-ingles: el modelo permite fijar terminologia y formato mediante instrucciones, lo que resulta adecuado para mantener consistencia en glosarios y guias de estilo en proyectos de localizacion.
- Localizacion de interfaces y contenido web: con un modelo de ~9B y cuantizacion Q4_K_M (5,63 GB), puede desplegarse en servidores modestos para traducir cadenas de UI y contenido editorial con contexto de producto.
- Traduccion de imagenes en entornos de comercio electronico: el proyector de vision permite procesar capturas, etiquetas o embalajes con texto en chino o ingles y generar la traduccion correspondiente.
- Procesamiento de documentos escaneados: combinando vision y traduccion de texto, el modelo puede extraer texto de imagenes de documentos y traducirlo, util en gestion documental y archivos.
- Asistencia a la traduccion en tiempo real de texto: con llama.cpp y una GPU consumer, se puede integrar en herramientas de escritorio o plugins de navegador para traduccion bajo demanda sin depender de APIs externas.
- Investigacion en traduccion automatica: los benchmarks publicados (FLORES COMET22 0.8789, WMT24++ 0.8601, WMT26 Judge 75.35, MEME 0.7387) permiten usar el modelo como referencia o baseline en experimentos de traduccion con restricciones.
- Traduccion de subtitulos y transcripciones: aunque la GGUF no incluye audio, la version original FP8/FP4 permite ASR y traduccion de voz chino-ingles, adecuada para pipelines de subtitulado.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion corresponden a los modelos originales publicados por IndexTeam, no a nuevas evaluaciones de esta exportacion cuantizada. La model card indica que se reprodujeron las tablas del modelo original.

Traduccion de texto:

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate 35BA3B (preview) | 0.8794 | 0.8586 | 76.76 | 0.7405 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore | instTrans_minor Quality / IFscore / Off-target | IFMTBench XCOMET-XXL / IFscore |
|---|---:|---:|---:|
| Index-Translate 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate 35BA3B (preview) | 0.6901 / 0.8336 | 0.5151 / 0.7715 / 4.05% | 0.7926 / 0.8991 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU/chrF2 mayor es mejor):

| Modelo | Chinese ASR CER | English ASR CER | English → Chinese | Chinese → English |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traduccion de imagen (COMET22 x 100, mayor es mejor):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B | 75.602 | 70.005 | 71.067 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Perplejidad de las cuantizaciones GGUF (corpus corto de validacion, contexto de 128 tokens, un chunk):

| Cuantizacion | Tamano | PPL | Cambio vs f16 |
|---|---:|---:|---:|
| f16 | 17.92 GB | 11.4870 | baseline |
| Q8_0 | 9.53 GB | 11.5140 | +0.23% |
| Q6_K | 7.36 GB | 11.4985 | +0.10% |
| Q5_K_M | 6.47 GB | 11.7721 | +2.48% |
| Q5_K_S | 6.31 GB | 11.5769 | +0.78% |
| Q4_K_M | 5.63 GB | 11.0747 | -3.59% |
| Q4_K_S | 5.35 GB | 10.3659 | -9.76% |
| Q3_K_L | 4.93 GB | 12.6886 | +10.46% |
| Q3_K_M | 4.62 GB | 11.8177 | +2.88% |
| Q3_K_S | 4.26 GB | 14.4046 | +25.40% |
| Q2_K | 3.83 GB | 27.3589 | +138.17% |
| IQ4_XS | 5.23 GB | 11.3353 | -1.32% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para f16, 9,5 GB para Q8_0, 6,5 GB para Q5_K_M, 5,6 GB para Q4_K_M, 5,2 GB para IQ4_XS y 3,8 GB para Q2_K, a los que hay que sumar el proyector de vision (mmproj-f16 o mmproj-Q8_0) si se usa entrada de imagen.
- GPU recomendadas: H100 para la verificacion realizada por el autor; A100 40/80 GB para f16 en produccion; RTX 4090 (24 GB) para f16 o Q8_0; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M.
- Cabe en GPU consumer: si, desde Q4_K_M (5,63 GB) en adelante en GPUs de 8 GB o mas; Q2_K cabe en 4-6 GB pero con una degradacion de perplejidad del +138,17% que lo desaconseja.
- Opciones de despliegue: llama.cpp (requiere un build en o posterior al commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` con soporte Qwen3.5), con `llama-cli` o `llama-server`. No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion texto (FLORES COMET22) | Traduccion imagen (MMTIT) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Index-Translate-Omni 9B | ~9B | no disponible | 0.8789 | 77.604 | Apache 2.0 | GGUF en HF |
| Index-Translate-Omni 2B | ~2B | no disponible | 0.8655 | 65.809 | Apache 2.0 | HF (original) |
| Index-Translate-Omni 35BA3B | 35B totales / 3B activos | no disponible | 0.8795 | 77.011 | Apache 2.0 | HF (original) |
| Qwen3.5-9B (baseline) | ~9B | no disponible | no disponible | 73.814 | no disponible en la informacion | no disponible |

El modelo de 9B supera a su baseline Qwen3.5-9B en traduccion de imagen (77.604 frente a 73.814 en MMTIT) y queda cerca del modelo 35BA3B en traduccion de texto (0.8789 frente a 0.8795), con un coste computacional mucho menor.

## Limitaciones y advertencias

- La exportacion GGUF no incluye el codificador de audio, el conector de audio ni el runtime de audio: no es un modelo de traduccion de audio de extremo a extremo. Para audio hay que usar los repositorios FP8 o FP4.
- Idiomas soportados limitados a chino e ingles (zh, en); no se documenta soporte de otros idiomas.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- La cuantizacion Q2_K presenta una degradacion de perplejidad del +138,17% respecto a f16, y Q3_K_S del +25,40%; no son recomendables para produccion.
- La verificacion de las cuantizaciones se realizo con un corpus corto de validacion (128 tokens, un chunk) y es una comprobacion de regresion, no una evaluacion completa.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base (Qwen3.5) si se redistribuye.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abu-Dju/Index-Translate-omni-9B-GGUF
- Modelo original: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks del modelo original: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
