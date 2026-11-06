# IndexTeam/Index-Translate-omni-2B-GGUF

## Resumen

Index-Translate-omni-2B es un modelo de traducción multimodal desarrollado por IndexTeam, exportado en formato GGUF para su uso con llama.cpp. Forma parte de la familia Index-Translate, que cubre traducción de texto multilingüe con restricciones de terminología y formato, traducción de imágenes y reconocimiento de voz con traducción bidireccional chino-inglés. Esta variante concreta es la exportación cuantizada del checkpoint de 2B parámetros, pensada para despliegue local y en entornos con recursos limitados.

El modelo se construye sobre una base tipo Qwen3.5 (la model card compara explícitamente contra Qwen3.5-2B en las tareas de traducción de imagen) y cuenta con 2.390.384.448 parámetros totales según los safetensors originales. La exportación GGUF incluye los pesos del modelo de lenguaje y un proyector de visión separado (`mmproj`), pero no incluye el codificador de audio ni el conector o runtime de audio del modelo original, por lo que no es un modelo de traducción de audio de extremo a extremo.

Su relevancia actual radica en que ofrece capacidades de traducción texto e imagen en un paquete de menos de 5 GB en f16 y por debajo de 1,6 GB en Q4_K_M, con licencia Apache 2.0 y compatibilidad con llama.cpp, lo que permite ejecutarlo en hardware de consumo. Los idiomas declarados son chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base tipo Qwen3.5), con proyector de visión separado; exportación para llama.cpp |
| Parametros totales | 2.390.384.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores de visión mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores de visión en GGUF separados |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo multimodal de traducción construido sobre una base tipo Qwen3.5, con pesos de lenguaje y un proyector de visión separado. La exportación GGUF contiene el modelo de lenguaje y, opcionalmente, soporte de visión mediante `mmproj`; no contiene el codificador de audio, el conector de audio ni el runtime de audio del modelo original, que están disponibles en los repositorios FP8 o FP4.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card reproduce las tablas de resultados del modelo original (Index-Translate-Omni 9B y 35BA3B) y aclara explícitamente que estas no son mediciones nuevas de esta exportación cuantizada; las verificaciones realizadas aquí se limitan a comprobar que cada cuantización y ambos proyectores de visión cargan y se ejecutan correctamente en llama.cpp, con una comprobación de perplejidad sobre un corpus corto de 128 tokens de contexto y un solo chunk.

## Capacidades

- Traducción de texto multilingüe (chino-inglés) con soporte de restricciones de terminología y formato.
- Traducción de imágenes (image-to-text) mediante el proyector de visión opcional.
- Reconocimiento automático de voz y traducción de voz bidireccional chino-inglés en el modelo original; no disponible en esta exportación GGUF por ausencia del codificador y runtime de audio.
- Seguimiento de instrucciones de traducción, incluyendo restricciones de formato y términos obligatorios (evaluado con instTrans e IFMTBench en el modelo original).
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües limitadas a chino e inglés según la model card.

## Casos de uso

- Traducción de documentación técnica chino-inglés: el modelo puede traducir texto manteniendo terminología y formato controlados, útil para localizar manuales y fichas de producto con glosarios fijos.
- Traducción de capturas de pantalla e interfaces: gracias al proyector de visión, puede procesar imágenes con texto y generar la traducción, adecuado para localizar aplicaciones y material gráfico.
- Procesamiento por lotes en local: con cuantizaciones de 1,5 GB (Q4_K_M) puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, integrable en scripts de traducción masiva.
- Asistencia a la localización de contenido web: traducción de páginas y fragmentos con restricciones de formato, útil en pipelines de publicación multilingüe.
- Traducción en entornos con requisitos de privacidad: al ejecutarse con llama.cpp de forma local, los datos no salen del equipo, apropiado para documentos sensibles.
- Prototipado de aplicaciones de traducción multimodal: la combinación de texto e imagen en un único modelo de 2B facilita experimentar con interfaces que reciben capturas o fotos y devuelven texto traducido.
- Evaluación comparativa de cuantizaciones: la tabla de perplejidad publicada permite seleccionar el equilibrio tamaño/calidad para un despliegue concreto.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo original (Index-Translate-Omni), no a esta exportación cuantizada. Se reproducen a continuación los datos de la model card.

Traducción de texto:

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore | instTrans_minor Quality / IFscore / Off-target | IFMTBench XCOMET-XXL / IFscore |
|---|---:|---:|---:|
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU/chrF2 mayor es mejor):

| Modelo | ASR chino CER | ASR inglés CER | Inglés → chino | Chino → inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traducción de imagen (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B | 75.602 | 70.005 | 71.067 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Perplejidad de las cuantizaciones GGUF (corpus corto, 128 tokens de contexto):

| Cuantizacion | Tamano | PPL | Cambio vs f16 |
|---|---:|---:|---:|
| f16 | 4.79 GB | 17.9097 | baseline |
| Q8_0 | 2.55 GB | 17.9232 | +0.08% |
| Q6_K | 1.97 GB | 17.6471 | -1.47% |
| Q5_K_M | 1.76 GB | 18.4522 | +3.03% |
| Q5_K_S | 1.72 GB | 18.3716 | +2.58% |
| Q4_K_M | 1.56 GB | 19.0381 | +6.30% |
| Q4_K_S | 1.50 GB | 18.5846 | +3.77% |
| Q3_K_L | 1.38 GB | 20.0465 | +11.93% |
| Q3_K_M | 1.32 GB | 20.0618 | +12.02% |
| Q3_K_S | 1.24 GB | 25.2040 | +40.73% |
| Q2_K | 1.14 GB | 42.2343 | +135.82% |
| IQ4_XS | 1.47 GB | 18.3964 | +2.72% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para Q4_K_M, 2,6 GB para Q8_0 y 4,8 GB para f16, más el proyector de visión si se usa (mmproj-f16 o mmproj-Q8_0, tamaño no especificado en la información disponible).
- GPU recomendadas: la verificación oficial se realizó en una H100 con llama.cpp; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM puede alojar las cuantizaciones pequeñas.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, así como en equipos con CPU y suficiente RAM para las cuantizaciones de menor tamaño.
- Opciones de despliegue: llama.cpp (requiere un build en o posterior al commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` con soporte Qwen3.5), con `llama-cli` para uso directo y `--mmproj` para entrada de imagen. No se mencionan otras opciones en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion de imagen (MMTIT) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Index-Translate-Omni 2B (esta exportacion GGUF) | 2,39B | no disponible | 65.809 | Apache 2.0 | GGUF en HuggingFace |
| Index-Translate-Omni 9B | no disponible | no disponible | 77.604 | no disponible en la informacion | Checkpoint original |
| Index-Translate-Omni 35BA3B | 35B (3B activos) | no disponible | 77.011 | no disponible en la informacion | Checkpoint original |
| Qwen3.5-2B | no disponible | no disponible | 52.164 | no disponible en la informacion | Modelo base de referencia |

## Limitaciones y advertencias

- La exportación GGUF no incluye el codificador de audio, el conector ni el runtime de audio; no es un modelo de traducción de audio de extremo a extremo. Para audio debe usarse el repositorio FP8 o FP4.
- Los benchmarks publicados corresponden al modelo original, no a esta exportación cuantizada; la verificación de esta exportación se limita a carga y perplejidad sobre un corpus corto.
- Idiomas soportados limitados a chino e inglés según la model card; el rendimiento en otros idiomas no está documentado.
- La cuantización Q2_K muestra un incremento de perplejidad del +135,82% y Q3_K_S del +40,73%; no se recomiendan para producción.
- El ASR en inglés del modelo 2B original tiene un CER de 34,2560, notablemente peor que el del 9B (14,4097), lo que indica menor robustez en esa tarea.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto específicas en la documentación proporcionada.
- Licencia Apache 2.0, que permite uso comercial; deben revisarse igualmente las condiciones de los componentes base (Qwen3.5) si se redistribuye.
- Requiere un build de llama.cpp con soporte Qwen3.5 en o posterior al commit indicado; versiones anteriores pueden no cargar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-omni-2B-GGUF
- Model card del modelo original: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados de Index-Translate: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
