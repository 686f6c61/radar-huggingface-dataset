# Abu-Dju/Index-Translate-omni-2B-GGUF

## Resumen

Index-Translate-omni-2B-GGUF es una exportación a formato GGUF del modelo Index-Translate-Omni 2B, desarrollado por IndexTeam y publicada en Hugging Face por el usuario Abu-Dju. Se trata de un modelo multimodal especializado en traducción que cubre traducción de texto multilingüe con restricciones de terminología y formato, traducción de imágenes, reconocimiento automático de voz y traducción bidireccional chino-inglés de voz. Con 2.390.384.448 parámetros, se posiciona como la variante compacta de una familia que también incluye versiones de 9B y 35B-A3B.

El modelo está pensado para integrarse en llama.cpp, lo que facilita su despliegue en entornos con recursos limitados. La exportación GGUF incluye los pesos del modelo de lenguaje y un proyector visual opcional (mmproj), pero no incorpora el codificador de audio original, por lo que no es un modelo de traducción de voz de extremo a extremo; para audio es necesario recurrir a los repositorios FP8 o FP4 del modelo original.

Su relevancia actual radica en que ofrece capacidades de traducción multimodal (texto e imagen) en un tamaño manejable, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp, lo que lo hace adecuado para prototipado rápido y despliegues en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector visual); basado en Qwen3.5 según la model card |
| Parámetros totales | 2.390.384.448 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card indica que el modelo se construye sobre la familia Index-Translate y que la variante Omni añade capacidades multimodales (imagen y voz) al modelo de traducción de texto base. La comparación de benchmarks con Qwen3.5 sugiere que la arquitectura subyacente deriva de dicha familia, si bien no se detalla en la información disponible la composición exacta del transformer, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La exportación GGUF separa el modelo de lenguaje del proyector visual, que se distribuye como archivo independiente (mmproj-f16 o mmproj-Q8_0). No se incluye el codificador de audio, el conector de audio ni el runtime de audio originales, por lo que las capacidades de voz del modelo original no están disponibles en esta exportación. La model card no especifica innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto multilingüe entre chino e inglés, con soporte para restricciones de terminología y formato (instruction following).
- Traducción de imágenes (image-to-text): el modelo puede procesar una imagen y generar una traducción del texto contenido en ella, usando el proyector visual mmproj.
- Reconocimiento automático de voz (ASR) y traducción de voz bidireccional chino-inglés: disponibles únicamente en el modelo original (repositorios FP8/FP4), no en esta exportación GGUF.
- Generación de texto conversacional.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües limitadas a chino e inglés.

## Casos de uso

- Traducción de documentación técnica chino-inglés: el modelo puede traducir textos con terminología específica y restricciones de formato, útil para equipos que mantienen documentación bilingüe.
- Localización de interfaces y contenido web: integrado en pipelines de CI/CD mediante llama.cpp, permite traducir cadenas de texto de forma automatizada con un modelo de 2B parámetros que cabe en hardware modesto.
- Traducción de carteles y capturas de pantalla: con el proyector visual mmproj, el modelo puede extraer y traducir texto presente en imágenes, adecuado para aplicaciones de accesibilidad o viajes.
- Prototipado de asistentes de traducción en tiempo real: al ejecutarse en llama.cpp con cuantizaciones Q4_K_M (1,56 GB), puede desplegarse en portátiles o dispositivos edge para pruebas de concepto.
- Evaluación de instruction following en traducción: investigadores pueden usar el modelo para experimentar con restricciones de terminología y formato en tareas de traducción, gracias a su soporte para instrucciones complejas.
- Generación de subtítulos traducidos a partir de imágenes de subtítulos: el modelo puede procesar fotogramas con texto y generar la traducción correspondiente, aunque sin audio nativo en esta exportación.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen de la model card y corresponden a los modelos originales (no a esta exportación cuantizada). Se reproducen tal cual, sin inventar cifras.

### Traducción de texto

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate 35BA3B (preview) | 0.8794 | 0.8586 | 76.76 | 0.7405 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

### Instruction following

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate-Omni 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate 35BA3B (preview) | 0.6901 / 0.8336 | 0.5151 / 0.7715 / 4.05% | 0.7926 / 0.8991 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

### Voz

CER en porcentaje (menor es mejor). BLEU y chrF2 (mayor es mejor). Las celdas de traducción muestran BLEU / chrF2 / CER del objetivo.

| Modelo | Chinese ASR CER ↓ | English ASR CER ↓ | English → Chinese | Chinese → English |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

### Traducción de imágenes

COMET22 × 100 (mayor es mejor). Cada modelo Omni se compara con su baseline Qwen3.5 en subconjuntos emparejados.

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B | 75.602 | 70.005 | 71.067 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

### Perplejidad de las cuantizaciones GGUF

| Cuantización | Archivo | Tamaño | PPL | Cambio vs f16 |
|---|---|---:|---:|---:|
| f16 | Index-Translate-omni-2B.f16.gguf | 4.79 GB | 17.9097 | baseline |
| Q8_0 | Index-Translate-omni-2B.Q8_0.gguf | 2.55 GB | 17.9232 | +0.08% |
| Q6_K | Index-Translate-omni-2B.Q6_K.gguf | 1.97 GB | 17.6471 | -1.47% |
| Q5_K_M | Index-Translate-omni-2B.Q5_K_M.gguf | 1.76 GB | 18.4522 | +3.03% |
| Q5_K_S | Index-Translate-omni-2B.Q5_K_S.gguf | 1.72 GB | 18.3716 | +2.58% |
| Q4_K_M | Index-Translate-omni-2B.Q4_K_M.gguf | 1.56 GB | 19.0381 | +6.30% |
| Q4_K_S | Index-Translate-omni-2B.Q4_K_S.gguf | 1.50 GB | 18.5846 | +3.77% |
| Q3_K_L | Index-Translate-omni-2B.Q3_K_L.gguf | 1.38 GB | 20.0465 | +11.93% |
| Q3_K_M | Index-Translate-omni-2B.Q3_K_M.gguf | 1.32 GB | 20.0618 | +12.02% |
| Q3_K_S | Index-Translate-omni-2B.Q3_K_S.gguf | 1.24 GB | 25.2040 | +40.73% |
| Q2_K | Index-Translate-omni-2B.Q2_K.gguf | 1.14 GB | 42.2343 | +135.82% |
| IQ4_XS | Index-Translate-omni-2B.IQ4_XS.gguf | 1.47 GB | 18.3964 | +2.72% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,14 GB (Q2_K) y 4,79 GB (f16) para el modelo de lenguaje; el proyector visual mmproj añade espacio adicional (tamaño no especificado en la información disponible).
- GPU recomendadas: la model card indica que las cuantizaciones fueron verificadas en una H100 con llama.cpp. Para uso general, cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o superiores.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M (1,56 GB) y Q5_K_M (1,76 GB) caben en tarjetas como RTX 3060, RTX 4060 o superiores; las versiones Q2_K y Q3_K_S caben en GPUs con 2-4 GB.
- Opciones de despliegue: llama.cpp (requiere build en o posterior al commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` con soporte Qwen3.5). No se mencionan otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Index-Translate-omni-2B | 2,39B | No disponible | zh, en | Apache 2.0 | GGUF |
| Index-Translate-Omni 9B | 9B (no confirmado) | No disponible | zh, en | Apache 2.0 (según familia) | No disponible |
| Qwen3.5-2B | 2B (no confirmado) | No disponible | No disponible | No disponible | No disponible |

La model card compara el rendimiento del modelo con Qwen3.5-2B en traducción de imágenes, donde Index-Translate-Omni 2B obtiene puntuaciones superiores (MMTIT 65.809 frente a 52.164). No se dispone de datos de contexto ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La exportación GGUF no incluye el codificador de audio, el conector de audio ni el runtime de audio, por lo que no es un modelo de traducción de voz de extremo a extremo. Para audio es necesario usar los repositorios FP8 o FP4 del modelo original.
- El modelo solo soporta chino e inglés; no se han publicado capacidades para otros idiomas.
- La longitud de contexto no está especificada en la información disponible.
- Los benchmarks de traducción de voz corresponden al modelo original, no a esta exportación GGUF, que carece de soporte de audio.
- Riesgo de alucinación y sesgos: no se detallan en la model card; se recomienda evaluación adicional en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los componentes subyacentes (Qwen3.5) si aplica.
- El modelo requiere una versión específica de llama.cpp (commit `9e2a04a439edc49f08c5acdafefae19dfa25a658` o posterior) para funcionar correctamente.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente sin validación comunitaria extensa.

## Enlaces

- [Hugging Face: Abu-Dju/Index-Translate-omni-2B-GGUF](https://huggingface.co/Abu-Dju/Index-Translate-omni-2B-GGUF)
- [Model card del modelo original Index-Translate-Omni 9B](https://huggingface.co/IndexTeam/Index-Translate-omni-9B)
- [Benchmarks publicados de Index-Translate 9B](https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation)
