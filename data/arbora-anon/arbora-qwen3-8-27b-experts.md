# arbora-anon/arbora-qwen3.8-27b-experts

## Resumen

Arbora Qwen3.8-27B Experts es un modelo borrador (*drafter*) para decodificación especulativa, desarrollado por el autor anónimo `arbora-anon` como parte del código asociado al artículo "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revisión anónima. No es un modelo generativo autónomo: se trata de un componente auxiliar que propone tokens que un modelo objetivo (el Qwen3.8-27B-DFlash2 de `z-lab`) verifica después, acelerando así la inferencia sin alterar la distribución de salida del modelo grande.

El checkpoint contiene ocho expertos Arbora por capa siguiendo el esquema de *speculators*, en el paso global 5.000 de entrenamiento. Aunque la nomenclatura del repositorio menciona "27B", el recuento real de parámetros en los pesos publicados es de 3.261.543.720 (aproximadamente 3,26 mil millones), coherente con un borrador mucho más pequeño que el modelo objetivo al que acompaña. Los pesos se distribuyen sin el *embedding* ni la cabeza de salida del objetivo, que el servidor de inferencia toma directamente del modelo grande.

Su relevancia es acotada pero específica: la decodificación especulativa es una de las técnicas más extendidas para reducir la latencia en producción, y este checkpoint implementa una variante basada en *block diffusion drafters* que busca explotar el paralelismo de propuestas. Está pensado para integrarse en SGLang mediante un script de exportación incluido en el repositorio de código del artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa con ocho expertos Arbora por capa (esquema *speculators*); arquitectura base derivada de Qwen3.8-27B-DFlash2 |
| Parámetros totales | 3.261.543.720 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repositorio ocupa 6,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sin *embedding* ni cabeza de salida del objetivo) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de *block diffusion drafters* aplicado a decodificación especulativa: en lugar de generar propuestas token a token de forma autorregresiva, plantea bloques de tokens candidatos que el modelo objetivo valida en paralelo. Sobre esa base se añaden ocho expertos Arbora por capa, lo que introduce un componente de mezcla de expertos en el borrador para repartir la capacidad de propuesta entre subredes especializadas. El checkpoint corresponde al paso global 5.000 de entrenamiento y se distribuye con un `config.json` en formato *speculators*.

El entrenamiento se realizó sobre las propias respuestas del modelo objetivo a una colección de *prompts* que no se ha publicado. El repositorio de código del artículo describe la receta y los scripts necesarios para reconstruir los datos de entrenamiento a partir de cualquier fichero de *prompts*, lo que permite replicar el procedimiento con un corpus propio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se detalla si el borrador emplea atención lineal u otras variantes de atención.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa: produce borradores que el modelo objetivo verifica, acelerando la inferencia sin modificar la distribución final.
- Propuesta por bloques: el diseño de *block diffusion drafter* permite plantear varios tokens candidatos de forma paralela en lugar de estrictamente secuencial.
- Especialización por expertos: ocho expertos Arbora por capa reparten la capacidad de propuesta entre subredes.
- Integración con SGLang: el script `training/path_scorer/export_d2_for_sglang.py` genera el formato de despliegue esperado por SGLang bajo el nombre local `qwen3.8-27b-experts`.
- Dependencia del objetivo: no incluye *embedding* ni cabeza de salida; el servidor toma ambos del modelo objetivo Qwen3.8-27B-DFlash2.
- No se han documentado en la información disponible capacidades de *tool calling*, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Aceleración de inferencia en producción: el borrador se acopla al Qwen3.8-27B-DFlash2 dentro de SGLang para reducir la latencia por token, ya que sustituye parte de las pasadas autorregresivas del modelo grande por propuestas verificadas en paralelo.
- Servicio de chat de baja latencia: al disminuir el coste por token generado, permite sostener conversaciones multi-turno con un modelo de 27B en infraestructura limitada, siempre que el contexto lo determine el modelo objetivo.
- Despliegue en clústeres con SGLang: equipos que ya operan SGLang pueden incorporar el checkpoint mediante el script de exportación incluido y medir la ganancia de *throughput* sobre su carga real.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el comportamiento de *block diffusion drafters* con mezcla de expertos frente a borradores autorregresivos clásicos.
- Reentrenamiento con corpus propio: los scripts del repositorio de código permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de *prompts*, lo que facilita adaptar el borrador a un dominio concreto (código, texto jurídico, documentación técnica) usando las respuestas del objetivo como supervisión.
- Evaluación comparativa de técnicas de aceleración: útil para medir tasas de aceptación y *speedup* frente a otras propuestas de decodificación especulativa en un mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.261.543.720 parámetros, en FP16 los pesos ocuparían aproximadamente 6,5 GB (coincide con el tamaño del repositorio); en FP8, unos 3,3 GB; en cuantizaciones de 4 bits, alrededor de 1,7 GB. Estas cifras son estimaciones por tamaño y no incluyen memoria para caché KV ni para el modelo objetivo.
- El borrador debe convivir en memoria con el modelo objetivo Qwen3.8-27B-DFlash2, cuyo peso domina el requisito total del sistema; la VRAM del conjunto no está documentada.
- GPU recomendadas: no disponible. Por tamaño, el borrador aislado cabría en GPU de consumo como una RTX 4090 (24 GB) en FP16, pero el despliegue real exige alojar también el objetivo.
- Cabe en GPU de consumo: el borrador por sí solo sí; el sistema completo depende del objetivo, sin datos publicados.
- Opciones de despliegue: SGLang, mediante la exportación con `training/path_scorer/export_d2_for_sglang.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3.8-27B Experts | 3.261.543.720 | no disponible | Borrador especulativo (block diffusion + MoE) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B-DFlash2 (`z-lab`) | no disponible | no disponible | Modelo objetivo del que depende el borrador | no disponible | Hugging Face |
| Borradores especulativos autorregresivos genéricos | no disponible | no disponible | Propuesta token a token | variable | variable |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo objetivo Qwen3.8-27B-DFlash2 no puede generar texto, ya que carece de *embedding* y cabeza de salida propios.
- Los datos de entrenamiento no se publican; solo se describe la receta para reconstruirlos, lo que impide auditar la composición del corpus y los sesgos heredados de las respuestas del objetivo.
- Riesgo de alucinación: el borrador hereda el comportamiento del modelo objetivo; sus propuestas solo llegan a la salida si el objetivo las acepta, pero una tasa de aceptación baja degrada la aceleración sin avisar.
- Sin datos publicados de benchmarks, tasas de aceptación ni *speedup* medido, por lo que la ganancia real en producción debe validarse empíricamente.
- Idiomas soportados no documentados; la cobertura lingüística queda determinada por el modelo objetivo.
- Longitud de contexto no documentada.
- Licencia Apache 2.0, que permite uso comercial, pero el repositorio incluye avisos de terceros en `NOTICE` que conviene revisar antes de redistribuir.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El artículo asociado está en revisión anónima; los resultados pueden cambiar en la versión final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-experts
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Código e instrucciones del artículo (revisión anónima): https://anonymous.4open.science/r/arbora-7ABE
