# flaitenberger/economize-eagle3-gemma-4-26B-A4B-it

## Resumen

`economize-eagle3-gemma-4-26B-A4B-it` es una cabeza borrador (draft head) EAGLE-3 diseñada para acelerar la decodificación especulativa del modelo base `google/gemma-4-26B-A4B-it`. No es un modelo generativo autónomo: es un adaptador de 262M parámetros que se acopla al modelo base y predice varios tokens candidatos por cada pasada del verificador, que es el propio Gemma-4. Lo publica el usuario de HuggingFace `flaitenberger` como parte de la biblioteca `economize`, orientada a añadir técnicas de eficiencia a modelos de HuggingFace.

El borrador consta de una única capa decodificadora que lee los estados ocultos del modelo base a tres profundidades, los fusiona en un vector y, junto con el embedding del último token, predice los siguientes tokens mediante su propia cabeza LM restringida a los 32.768 tokens más frecuentes del corpus de entrenamiento. Su MLP tiene anchura 7.680. El resultado es un incremento medido de throughput de 1,34x de media frente a decodificación greedy plana en una H100, con picos de 1,48x en matemáticas.

La relevancia práctica es doble: por un lado, ofrece una vía de aceleración sin cambiar el modelo base ni su distribución de salida (la verificación garantiza que la decodificación greedy devuelve exactamente la salida greedy de Gemma-4, y el muestreo por rechazo respeta su distribución); por otro, demuestra que el ecosistema de decodificación especulativa se está especializando con borradores ligeros y entrenados sobre la propia distribución del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head: una capa decodificadora con fusión de estados ocultos a tres profundidades y cabeza LM propia |
| Parametros totales | 262M (solo el borrador; no incluye el modelo base) |
| Parametros activos | no disponible (el borrador no es MoE; el base Gemma-4-26B-A4B-it sí es MoE según su nomenclatura A4B) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card solo menciona bf16 y float32 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,5 GB) |

## Arquitectura y entrenamiento

El borrador sigue el esquema EAGLE-3: una sola capa decodificadora que recibe los estados ocultos del modelo base en tres profundidades distintas, los combina en un único vector y lo concatena con el embedding del último token. Sobre esa representación, una MLP de anchura 7.680 y una cabeza LM propia (vocabulario restringido a los 32.768 tokens más frecuentes del corpus) predicen los tokens siguientes. El checkpoint contiene únicamente los pesos del borrador, no los del modelo base.

El entrenamiento se realizó con la biblioteca `economize` sobre respuestas generadas por el propio Gemma-4-26B-A4B-it (revisión `4d7ae4984b7db7de8f8457170b3f1a419ee76d52`), de modo que el borrador aprende la distribución de salida del modelo objetivo. El proceso partió de un pool de 292.212 prompts procedentes de múltiples fuentes, con filtrado de prompts vacíos, de menos de 3 palabras o de más de 12.000 caracteres, eliminación de duplicados exactos y eliminación de cualquier prompt que compartiera un 13-grama con los conjuntos de evaluación (Spec-Bench, MT-Bench, AlpacaEval, Arena-Hard, HumanEval, MBPP, LiveCodeBench, GSM8K, MATH-500, AIME 2024/2025, AMC 2023, CNN/DailyMail, LongBench) y con cualquier split de MBPP. Las respuestas se generaron con vLLM 0.30.0 en bf16 usando la plantilla de chat del modelo base. El checkpoint almacena la configuración de decodificación más rápida medida: `cycle_length=9` (hasta 8 borradores por pasada del base) y `min_confidence=0.5`.

## Capacidades

- Aceleración de decodificación especulativa para `google/gemma-4-26B-A4B-it`: predice hasta 8 tokens candidatos por pasada del modelo base.
- Verificación garantizada: cada borrador es verificado por el modelo base, de modo que la decodificación greedy devuelve la salida greedy exacta del base y el muestreo por rechazo (`verifier="rejection"`) sigue su distribución de muestreo.
- Parada adaptativa por confianza: el borrado se detiene cuando la probabilidad top del borrador cae por debajo del umbral configurado (`min_confidence`), lo que permite ajustar el equilibrio entre velocidad y tasa de aceptación.
- Configurabilidad de decodificación: `cycle_length` y `min_confidence` se pueden pasar como `economize.DecodeConfig(...)` a `load`, `generate` o `decode`.
- Integración con el ecosistema HuggingFace Transformers mediante `economize.from_pretrained` o `economize.load` sobre un modelo base ya cargado.
- No soporta tool calling, agentes, visión ni audio por sí mismo: esas capacidades, si existen, dependen del modelo base y no se documentan en la model card del borrador.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Gemma-4-26B-A4B-it con este borrador reduce el tiempo por token en conversaciones multi-turno; la medición reporta 1,39x de speedup en el dominio de chat (MT-Bench, AlpacaEval, Arena-Hard), lo que se traduce directamente en menor latencia percibida por el usuario.
- Razonamiento matemático en producción: con 1,48x de aceleración en GSM8K, MATH-500, AIME y AMC, es adecuado para pipelines de resolución de problemas donde la generación de cadenas de razonamiento es el cuello de botella.
- Generación de código en asistentes IDE: el dominio de código (HumanEval, MBPP, LiveCodeBench) alcanza 1,32x, útil para autocompletado y generación de funciones donde cada milisegundo cuenta.
- Resúmenes de documentos: aunque el speedup es modesto (1,04x en CNN/DailyMail), el borrador no degrada la salida y permite mantener el throughput en tareas de summarization sin cambiar la infraestructura.
- Despliegue en contextos largos: con 1,03x en LongBench, la ganancia es marginal pero no negativa; útil si se quiere una única configuración de decodificación para todos los dominios sin penalizar el contexto largo.
- Evaluación comparativa de técnicas de eficiencia: sirve como referencia reproducible para medir el impacto de la decodificación especulativa EAGLE-3 frente a decodificación plana en un MoE de 26B con 4B activos, dado que el checkpoint incluye la configuración óptima medida.
- Investigación en decodificación especulativa: el borrador y su proceso de entrenamiento (pool filtrado por 13-gramas contra los benchmarks) son un ejemplo metodológico para entrenar drafters sin filtración de evaluación.

## Benchmarks y rendimiento

Los datos disponibles son medidas de speedup de decodificación (throughput relativo a decodificación greedy plana del base en el mismo runtime), no benchmarks de calidad. Medido con economize 0.3.2 en una NVIDIA H100, bf16, CUDA graphs, batch size 1, prompts de 8 ejemplos por conjunto, hasta 256 tokens nuevos.

| Configuracion | All | Chat | Code | Math | Summarization | Long context | Tokens por pasada |
|---|---|---|---|---|---|---|---|
| 2 borradores, sin umbral | 1,32x | 1,25x | 1,33x | 1,54x | 1,08x | 1,02x | 1,68 |
| 3 borradores, sin umbral | 1,28x | 1,20x | 1,31x | 1,53x | 1,01x | 0,97x | 1,76 |
| 4 borradores, sin umbral | 1,28x | 1,33x | 1,25x | 1,44x | 0,94x | 0,93x | 1,80 |
| 6 borradores, sin umbral | 1,22x | 1,22x | 1,22x | 1,47x | 0,84x | 0,90x | 1,83 |
| 8 borradores, sin umbral | 1,04x | 1,05x | 1,03x | 1,20x | 0,76x | 0,77x | 1,82 |
| 8 borradores, umbral 0,2 | 1,22x | 1,16x | 1,25x | 1,39x | 1,06x | 0,98x | 1,79 |
| 8 borradores, umbral 0,3 | 1,33x | 1,42x | 1,30x | 1,47x | 1,06x | 0,96x | 1,74 |
| **8 borradores, umbral 0,5 (checkpoint)** | **1,34x** | **1,39x** | **1,32x** | **1,48x** | **1,04x** | **1,03x** | **1,68** |
| 8 borradores, umbral 0,7 | 1,34x | 1,45x | 1,30x | 1,44x | 1,06x | 0,99x | 1,62 |
| 8 borradores, umbral 0,9 | 1,23x | 1,20x | 1,25x | 1,38x | 1,05x | 0,97x | 1,55 |

Nota de precisión numérica: en bf16, una pasada de verificación sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que la salida puede diferir de la decodificación bf16 plana; en la medición, el 51% de las respuestas fueron idénticas en los 256 tokens. En float32 la salida coincide exactamente con la decodificación greedy plana.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K en términos de accuracy) en la información disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,5 GB en bf16 (262M parámetros), adicional a la VRAM del modelo base.
- VRAM total: dominada por Gemma-4-26B-A4B-it; los requisitos del base no se detallan en la model card y deben consultarse en su propia ficha.
- GPU recomendadas: la medición se realizó en una NVIDIA H100; no se reportan mediciones en A100, RTX 4090 u otras GPU.
- Consumer GPU: el borrador en sí cabe en cualquier GPU con 1 GB libre, pero el modelo base de 26B (4B activos) condiciona el requisito real; no hay datos de despliegue en consumer en la información disponible.
- Opciones de despliegue: la model card documenta únicamente la biblioteca `economize` (>=0.4) con PyTorch y Transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: speedup de 1,34x de media en H100 con bf16, CUDA graphs y batch size 1; no se reportan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters EAGLE-3 comparables en la documentación proporcionada. La model card enlaza a una colección de borradores de `economize` (`economize-drafters`) que no se detalla en la información disponible.

| Modelo | Parametros | Contexto | Speedup | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| economize-eagle3-gemma-4-26B-A4B-it | 262M (borrador) | no disponible | 1,34x medio en H100 | Apache 2.0 | HuggingFace |
| Otros borradores EAGLE-3 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `google/gemma-4-26B-A4B-it` como verificador; no genera texto por sí solo.
- Dependencia de la biblioteca `economize` (>=0.4) y de su API de decodificación; no es compatible directamente con otros runtimes de decodificación especulativa sin adaptación.
- En bf16 la salida puede diferir de la decodificación bf16 plana por redondeo; solo en float32 se garantiza igualdad exacta con la decodificación greedy. Para aplicaciones que exijan reproducibilidad bit a bit, usar float32.
- El speedup es modesto y dependiente del dominio: 1,04x en summarization y 1,03x en contexto largo, con configuraciones que pueden degradar el rendimiento por debajo de 1x (por ejemplo, 8 borradores sin umbral en summarization: 0,76x).
- La cabeza LM está restringida a los 32.768 tokens más frecuentes del corpus de entrenamiento; el impacto de esta restricción en dominios con vocabulario especializado no se documenta.
- Sesgos y riesgo de alucinación: no documentados en la model card; el borrador hereda los del modelo base, que no se detallan.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma-4 tiene sus propios términos que deben respetarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- No se reportan evaluaciones de calidad (accuracy) que confirmen que la aceleración no degrada tareas más allá de la equivalencia formal de la verificación.

## Enlaces

- HuggingFace: https://huggingface.co/flaitenberger/economize-eagle3-gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio GitHub de economize: https://github.com/Thiggel/economize
- PyPI: https://pypi.org/project/economize/
- Documentación: https://thiggel.github.io/economize/
- Colección de drafters de economize: https://huggingface.co/collections/flaitenberger/economize-drafters-6aeb7d0f6cae8de3208fd3e7
