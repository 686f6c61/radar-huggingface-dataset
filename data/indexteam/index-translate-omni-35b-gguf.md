# IndexTeam/Index-Translate-omni-35B-GGUF

## Resumen

Index-Translate-omni-35B es un modelo de traducción multimodal desarrollado por IndexTeam, distribuido en formato GGUF para su uso con llama.cpp. Forma parte de la familia Index-Translate, que cubre traducción de texto multilingüe, traducción de imágenes, reconocimiento automático de voz y traducción bidireccional chino-inglés. El modelo completo cuenta con 34.660.610.688 parámetros (aproximadamente 35B) y se distribuye bajo licencia Apache 2.0.

La versión aquí descrita es una exportación cuantizada del checkpoint original alojado en ModelScope. El export GGUF incluye los pesos del modelo de lenguaje y un proyector visual opcional (`mmproj`), pero no incluye el codificador de audio ni el conector de audio originales, por lo que no funciona como modelo de traducción de audio de extremo a extremo. Para tareas de audio es necesario recurrir a los repositorios FP8 o FP4 del autor.

El modelo resulta relevante para desarrolladores que necesitan un sistema de traducción especializado con soporte de imagen a texto, capaz de ejecutarse en infraestructura local mediante llama.cpp. Su enfoque en restricciones terminológicas y de formato, junto con su capacidad de seguir instrucciones de traducción, lo diferencia de los modelos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector visual); detalles internos no disponibles |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | No disponible (la nomenclatura "35BA3B" sugiere arquitectura MoE con ~3B activos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores visuales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); f16 dividido en dos shards, resto en archivo único |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal que combina un modelo de lenguaje con un proyector visual para tareas de imagen a texto. El export GGUF contiene 693 tensores de lenguaje, 333 tensores visuales y 529 tensores de audio compartidos, según el manifiesto del autor. La nomenclatura "35BA3B" del checkpoint original sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3B parámetros activos, aunque la información disponible no detalla la configuración interna de la MoE ni el número exacto de tokens de entrenamiento.

No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO. El modelo está especializado en traducción con restricciones de terminología y formato, lo que indica un entrenamiento orientado a seguir instrucciones específicas de traducción. La versión GGUF es una conversión del checkpoint original publicado en ModelScope, con 74 archivos fijados por SHA-256.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones terminológicas y de formato.
- Traducción de imágenes (image-to-text) mediante el proyector visual incluido en el export GGUF.
- Reconocimiento automático de voz (ASR) para chino e inglés: limitado en esta exportación GGUF, que no incluye el codificador de audio.
- Traducción bidireccional de voz chino-inglés: no disponible en el export GGUF por la misma limitación de audio.
- Seguimiento de instrucciones de traducción (instTrans), con métricas publicadas de calidad y off-target.
- Traducción con formato controlado (IFMTBench), orientada a mantener restricciones de formato en la salida.
- Soporte de conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").

## Casos de uso

- Traducción de documentación técnica chino-inglés: el modelo puede traducir textos con terminología específica y restricciones de formato, adecuado para manuales y documentación de producto donde la consistencia terminológica es crítica.
- Localización de interfaces y contenido visual: gracias al proyector visual incluido, puede procesar imágenes con texto (capturas, carteles, infografías) y generar traducciones, útil en flujos de localización de aplicaciones.
- Traducción por lotes en pipelines de CI/CD: al ejecutarse con llama.cpp, puede integrarse en scripts automatizados para traducir recursos de software antes de cada release, sin depender de APIs externas.
- Procesamiento de contenido multimodal en local: desarrolladores que necesitan traducir imágenes con texto sin enviar datos a servicios en la nube pueden desplegar el modelo con llama.cpp en hardware propio.
- Evaluación de calidad de traducción con restricciones: el modelo permite definir terminología obligatoria y formatos de salida, útil en proyectos donde se requiere control estricto del resultado.
- Investigación en traducción automática: sirve como base para experimentos con modelos de traducción especializados y para comparar el rendimiento de cuantizaciones GGUF frente al checkpoint original.
- Asistencia a la traducción en entornos con recursos limitados: las cuantizaciones Q4_K_M (21,17 GB) y Q3_K_M (16,76 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de consumo alto.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo original (Index-Translate-Omni 35BA3B), no a esta exportación cuantizada. Se reproducen a continuación.

Traducción de texto (métricas COMET22 y juez):

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |

Seguimiento de instrucciones de traducción:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |

Voz (CER en porcentaje, menor es mejor; BLEU/chrF2 mayor es mejor):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino (BLEU/chrF2/CER) | Chino → Inglés (BLEU/chrF2/CER) |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 13.0053 | 15.4950 | 40.074 / 32.862 / 44.8097 | 32.411 / 53.452 / 46.1700 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B (baseline) | 75.602 | 70.005 | 71.067 |

Calidad de cuantización (perplejidad, PPL):

| Cuantización | Tamaño | PPL | Cambio vs f16 |
|---|---:|---:|---:|
| f16 | 44,67 GB | 10,3591 | baseline |
| Q8_0 | 36,90 GB | 10,2629 | -0,93% |
| Q6_K | 28,51 GB | 10,3571 | -0,02% |
| Q5_K_M | 24,73 GB | 10,6325 | +2,64% |
| Q4_K_M | 21,17 GB | 9,8836 | -4,59% |
| Q3_K_M | 16,76 GB | 10,4829 | +1,20% |
| Q2_K | 12,94 GB | 11,7878 | +13,79% |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead): f16 requiere ~45-50 GB; Q8_0 ~37-42 GB; Q6_K ~29-33 GB; Q4_K_M ~22-26 GB; Q3_K_M ~17-21 GB; Q2_K ~13-16 GB. Los proyectores visuales añaden memoria adicional.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) para Q4_K_M con margen ajustado; Q3_K_M y Q2_K caben en GPU de 16-20 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M o inferiores; en RTX 4080/3080 (16 GB) solo con Q3_K_M o Q2_K, con contexto reducido.
- Opciones de despliegue: llama.cpp (requiere build igual o posterior al commit `9e2a04a439edc49f08c5acdafefae19df`), y herramientas compatibles con GGUF como Ollama o LM Studio. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Index-Translate-omni-35B | ~35B | No disponible | zh, en | Apache 2.0 | GGUF | Traducción multimodal (texto, imagen); audio no incluido en GGUF |
| Index-Translate-Omni 9B | ~9B | No disponible | zh, en | Apache 2.0 | No disponible | Menor tamaño; rendimiento cercano en texto e imagen según benchmarks |
| Index-Translate-Omni 2B | ~2B | No disponible | zh, en | Apache 2.0 | No disponible | Opción ligera; menor calidad en instrucciones y ASR inglés |
| Qwen3.5-35B-A3B | ~35B (MoE) | No disponible | No disponible | No disponible | No disponible | Baseline usado por el autor en evaluación de imagen |

## Limitaciones y advertencias

- El export GGUF no incluye el codificador de audio ni el conector de audio: no es un modelo de traducción de audio de extremo a extremo. Para ASR o traducción de voz es necesario usar los repositorios FP8 o FP4.
- Idiomas limitados a chino e inglés; no se documenta soporte para otras lenguas.
- Los benchmarks publicados corresponden al modelo original, no a esta exportación cuantizada; el rendimiento real puede diferir, especialmente en cuantizaciones bajas (Q2_K muestra un aumento de perplejidad del +13,79%).
- Riesgo de alucinación inherente a los modelos generativos, especialmente en traducción de imágenes o textos ambiguos.
- La cuantización Q4_K_M muestra una perplejidad ligeramente inferior a f16 (-4,59%), lo que puede indicar variaciones en la evaluación; no debe interpretarse como mejora de calidad.
- El modelo requiere una versión específica de llama.cpp (commit `9e2a04a439edc49f08c5acdafefae19df` o posterior); versiones anteriores pueden no cargar los pesos correctamente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del checkpoint original en ModelScope.
- El repositorio tiene un tamaño de 308 GB, lo que implica una descarga considerable; para la mayoría de usos conviene seleccionar una cuantización concreta.
- No se dispone de información sobre sesgos específicos del modelo ni sobre su comportamiento en dominios especializados más allá de los benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-35B-GGUF
- Modelo original en ModelScope: https://modelscope.cn/models/IndexTeam/Index-Translate-omni-35B
- Colección Index-Translate en Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Benchmarks de referencia (Index-Translate-9B): https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
