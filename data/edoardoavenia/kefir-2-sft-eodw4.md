# EdoardoAvenia/kefir-2-sft-eodw4

## Resumen

Kefir 2 es un modelo de lenguaje de tipo mixture-of-experts (MoE) con 207 millones de parámetros, desarrollado por EdoardoAvenia como proyecto de investigación. El modelo representa el caso mediante CaseBits (un token en minúsculas más una cabeza separada de 4 vías para el caso) y dispone de una memoria de n-gramas con hashing. Los checkpoints publicados en este repositorio son dos variantes de fine-tuning supervisado (SFT) del modelo chat original, diferenciadas únicamente por la ponderación de la pérdida en el token de fin de respuesta.

La relevancia de estos checkpoints reside en el problema concreto que abordan: el modelo original sabía responder pero rara vez se detenía por sí mismo. Al multiplicar por 4 la pérdida del token de fin (ID 0), los autores consiguen que entre el 64,7 % y el 66,1 % de las respuestas terminen de forma autónoma, frente al 38,6 % y 40,3 % de las líneas base respectivas, sin degradar la corrección de las respuestas ni la pérdida de validación en chat.

Se trata de checkpoints exclusivamente de investigación, sin ajuste de seguridad, publicados para su almacenamiento y reproducción. No son modelos de `transformers`: requieren el código de investigación de Kefir 2 para cargarse, y los pesos se distribuyen en `safetensors` en precisión F32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con CaseBits y memoria de n-gramas con hashing |
| Parametros totales | 207M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

Kefir 2 es un modelo MoE de 207M parámetros que representa el caso mediante CaseBits: un token en minúsculas acompañado de una cabeza separada de 4 vías que codifica el uso de mayúsculas y minúsculas. Además, incorpora una memoria de n-gramas con hashing, un mecanismo de recuperación léxica que complementa la atención del transformer. Los detalles completos de la arquitectura (número de expertos, dimensión oculta, número de capas) no están disponibles en la información proporcionada.

El entrenamiento de estos checkpoints parte del paso de preentrenamiento 342500 y aplica 470 actualizaciones de SFT con 32 chats por actualización, una tasa de aprendizaje de 3e-5 y dos GPUs T4. La única modificación respecto al fine-tuning original es la ponderación ×4 de la pérdida en el token de fin de respuesta (ID 0). Se publican dos semillas (17 y 18), cada una con su manifiesto JSON correspondiente, que recoge la identidad completa del entrenamiento (checkpoint padre, cohorte de datos, orden de muestras y hashes de origen) y los resultados en validación.

## Capacidades

- Generación de texto conversacional en formato chat, fruto del fine-tuning supervisado sobre el modelo preentrenado.
- Terminación autónoma de respuestas: entre el 64,7 % y el 66,1 % de las respuestas finalizan por sí solas en el benchmark de 1500 casos, frente al 38,6 % y 40,3 % de las líneas base.
- Respuestas estrictas: entre el 16,4 % y el 16,5 % de los casos producen una respuesta correcta que termina por sí sola en un máximo de 48 tokens y sin copiar el prompt.
- Representación sensible al caso mediante CaseBits, lo que permite distinguir mayúsculas y minúsculas en la salida.
- Recuperación léxica mediante memoria de n-gramas con hashing.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Investigación sobre terminación de respuestas: el checkpoint permite estudiar cómo la ponderación de la pérdida en el token de fin afecta a la tasa de parada autónoma sin alterar la corrección, gracias a los manifiestos que documentan la identidad completa del entrenamiento.
- Reproducción de experimentos: las dos semillas publicadas (17 y 18) con sus hashes SHA-256 permiten replicar exactamente las condiciones del SFT y comparar resultados entre semillas.
- Evaluación de modelos MoE pequeños: con 207M parámetros, el modelo es adecuado para experimentos académicos en entornos con recursos limitados, como las dos T4 empleadas en el entrenamiento.
- Estudio de representación del caso: la combinación de CaseBits con una cabeza de 4 vías ofrece un caso concreto para analizar cómo los modelos pequeños codifican información ortográfica.
- Análisis de memoria de n-gramas: la memoria con hashing integrada permite investigar mecanismos de recuperación léxica en modelos de tamaño reducido.
- Línea base para comparativas de SFT: al estar el modelo original y estas variantes bajo el mismo pipeline, sirven como referencia controlada en estudios sobre funciones de pérdida y pesos de tokens especiales.

## Benchmarks y rendimiento

Resultados sobre el benchmark pareado de 1500 casos, comparando cada semilla con su propia línea base:

| Metrica | Semilla 17 (base → eodw4) | Semilla 18 (base → eodw4) |
|---|---|---|
| Respuestas que terminan por sí solas | 38,6 % → 64,7 % | 40,3 % → 66,1 % |
| Respuestas estrictas (correcta, termina en ≤48 tokens, sin copiar el prompt) | 8,2 % → 16,4 % | 8,9 % → 16,5 % |
| Respuestas correctas | +0,1 puntos | +0,2 puntos |
| Pérdida de validación en chat | sin cambios | sin cambios |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 207M parámetros en F32, el peso de los pesos ronda los 0,83 GB; el repositorio completo ocupa 1,7 GB por contener dos checkpoints.
- GPU recomendadas: el entrenamiento se realizó en dos NVIDIA T4, por lo que GPUs de gama media con al menos 16 GB son suficientes para inferencia en F32.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, dado el tamaño del modelo, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: no es un modelo de `transformers`; requiere el código de investigación de Kefir 2. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de información suficiente sobre modelos comparables de la misma categoría (MoE de ~200M parámetros con memoria de n-gramas) en la información proporcionada. La comparativa se limita a las líneas base del propio modelo:

| Modelo | Parametros | Contexto | Terminacion autonoma | Respuestas estrictas | Licencia |
|---|---|---|---|---|---|
| Kefir 2 SFT original (semilla 17) | 207M | no disponible | 38,6 % | 8,2 % | other |
| Kefir 2 SFT eodw4 (semilla 17) | 207M | no disponible | 64,7 % | 16,4 % | other |
| Kefir 2 SFT original (semilla 18) | 207M | no disponible | 40,3 % | 8,9 % | other |
| Kefir 2 SFT eodw4 (semilla 18) | 207M | no disponible | 66,1 % | 16,5 % | other |

## Limitaciones y advertencias

- Checkpoints de investigación sin ajuste de seguridad: no deben desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- No son modelos de `transformers`: requieren el código de investigación de Kefir 2 para cargarse, lo que limita su integración en pipelines estándar.
- Licencia "other": es necesario revisar los términos concretos del repositorio antes de cualquier uso, incluido el comercial.
- Aunque la corrección se mantiene, la tasa de respuestas estrictas sigue siendo baja (16,4 %–16,5 %), por lo que el modelo falla en la mayoría de los casos del benchmark estricto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo de 207M parámetros sin ajuste de seguridad.
- Idiomas soportados y longitud de contexto no documentados, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- Los resultados se limitan a un único benchmark pareado de 1500 casos y a dos semillas; no hay validación externa publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EdoardoAvenia/kefir-2-sft-eodw4
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información disponible.
