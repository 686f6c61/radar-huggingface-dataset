# simaai/Qwen3-8B-DFlash-b16-RTN-INT8-Safetensors

## Resumen

El modelo `simaai/Qwen3-8B-DFlash-b16-RTN-INT8-Safetensors` es un checkpoint cuantizado de un *draft* de decodificación especulativa DFlash, derivado de `z-lab/Qwen3-8B-DFlash-b16`. Lo publica SiMa.ai y no es un modelo de generación de texto autónomo: es un componente auxiliar que debe combinarse con un modelo objetivo pre-cuantizado (`simaai/Qwen3-8B-GPTQ-Safetensors`) dentro del flujo de compilación de LLiMa de SiMa.ai. El objetivo es acelerar la inferencia del Qwen3-8B objetivo prediciendo bloques de tokens que el modelo grande verifica en paralelo.

El interés técnico reside en que la cuantización se aplica exclusivamente al *draft*: sus 36 capas lineales se convierten a INT8 simétrico con redondeo al más cercano (RTN) por canal de salida, mientras que los parámetros de normalización y los sesgos se conservan en BF16 para no degradar la estabilidad numérica. La receta no usa dataset de calibración ni requiere un *forward pass*: solo observa los pesos, lo que simplifica la reproducibilidad y evita dependencias de GPU durante el proceso.

Con aproximadamente 1.050 millones de parámetros y un repositorio de 2,1 GB, el *draft* es un modelo pequeño pensado para encajar en el mismo entorno de despliegue que el modelo objetivo. La licencia es MIT y el formato es Safetensors con metadatos de `compressed-tensors`. No se han validado la tasa de aceptación del *draft*, la calidad de salida ni el rendimiento en tiempo de ejecución tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (draft de decodificacion especulativa DFlash derivado de Qwen3); detalles internos de la arquitectura del draft no disponibles |
| Parametros totales | 1.048.626.432 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 simetrico por canal de salida con redondeo al mas cercano (RTN); normalizacion y sesgos en BF16; sin cuantizacion de activaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors con metadatos `compressed-tensors` (`pack-quantized`) |

## Arquitectura y entrenamiento

El checkpoint es una réplica cuantizada del *draft* DFlash `z-lab/Qwen3-8B-DFlash-b16`, un modelo auxiliar de decodificación especulativa asociado a Qwen3-8B (el sufijo `b16` apunta a un tamaño de bloque de 16 tokens). La receta de cuantización afecta a las 36 capas lineales del *draft*: la fusión de contexto `fc`, las proyecciones Q/K/V y de salida de atención, y las proyecciones gate/up/down del MLP. Cada capa usa una escala por fila de salida obtenida por observación min/max de los pesos, sin agrupación ni cuantización de activaciones. Los embeddings de destino y la cabeza de salida del modelo objetivo no se incluyen ni se cuantizan: los aporta el *checkpoint* objetivo correspondiente en tiempo de ejecución.

No se ha realizado ningún *fine-tuning* ni entrenamiento adicional sobre este artefacto: es una conversión de pesos. No hay dataset de calibración porque la cuantización no ejecuta *forward passes*, solo lee pesos. La validación publicada cubre comprobaciones de exportación (formas de las escalas por canal, escalas positivas finitas) y la validación del cargador de LLiMa, que confirmó que los pesos INT8 y las escalas desempaquetados coinciden exactamente con la exportación previa y que los tensores BF16 retenidos coinciden byte a byte con el origen. No se ha establecido equivalencia bit a bit con la cuantización del lado del compilador.

## Capacidades

- No es un modelo de generación de texto autónomo: `inference: false` en su *model card*. Su función es actuar como *draft* dentro de un esquema de decodificación especulativa junto al modelo objetivo.
- Predicción de bloques de tokens (tamaño de bloque 16, según la nomenclatura `b16`) para que el modelo objetivo los verifique en paralelo.
- Cuantización INT8 por canal de las 36 capas lineales del *draft*, con normalización y sesgos en BF16.
- Compatibilidad con el formato `compressed-tensors` (`pack-quantized`) y con el cargador de LLiMa de SiMa.ai.
- Reproducibilidad mediante el script `quantize.py` incluido, que funciona en CPU sin necesidad de GPU ni de código de modelado personalizado de Transformers.
- No dispone de soporte declarado de *tool calling*, agentes, visión, audio ni modo de razonamiento; esas capacidades corresponderían al modelo objetivo Qwen3-8B, no a este *draft*.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el *draft* propone bloques de 16 tokens que el modelo objetivo verifica, reduciendo el número de pasos de decodificación secuencial necesarios para generar la misma salida.
- Despliegue en hardware SiMa.ai: el artefacto se prepara específicamente para la compilación con LLiMa, por lo que su uso previsto es en plataformas aceleradoras de SiMa.ai y no en GPU de propósito general.
- Servicios de baja latencia para chat: combinar el *draft* INT8 con el objetivo GPTQ permite recortar el tiempo por token en cargas conversacionales multi-turno, donde la latencia de decodificación domina.
- Reducción del coste por token en APIs internas: al aumentar el *throughput* de decodificación con un *draft* de ~1.000 millones de parámetros, se necesita menos tiempo de cómputo del modelo grande por cada token generado.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el efecto de la cuantización RTN INT8 en la tasa de aceptación de un *draft* DFlash, aunque dicha tasa no está validada.
- Generación de código asistida con baja latencia: los pipelines de autocompletado exigen respuestas en decenas de milisegundos, y un *draft* pequeño en INT8 puede reducir el coste por predicción en comparación con ejecutar solo el objetivo.
- Validación de flujos de compilación: útil para equipos que integran cuantización INT8 por canal en cadenas de compilación propias y quieren un ejemplo verificable de exportación y carga con `compressed-tensors`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica explícitamente que no se han validado la compilación con LLiMa, la tasa de aceptación del *draft*, la calidad de salida ni el rendimiento en tiempo de ejecución para esta variante cuantizada. Solo se documentan comprobaciones de exportación y de carga de pesos.

## Requisitos de hardware

- Peso del modelo: el repositorio ocupa 2,1 GB, correspondiente a los pesos INT8 (~1.050 millones de parámetros) más escalas por canal y tensores BF16 retenidos.
- VRAM estimada del *draft* en solitario: en torno a 1-1,5 GB para los pesos INT8, con margen adicional para *buffers* y escalas.
- El *draft* no puede ejecutarse de forma aislada: requiere además el modelo objetivo `simaai/Qwen3-8B-GPTQ-Safetensors`, cuyos pesos dominan el consumo total de memoria.
- GPU recomendadas: no disponibles para la ruta validada, ya que el destino previsto es SiMa.ai LLiMa, no GPU. Para pruebas en GPU, cabe en cualquier tarjeta con 8 GB o más junto al objetivo, aunque no hay cifras publicadas.
- Cabe en GPU de consumo (RTX 3060/4060/4090 y similares) siempre que se aloje también el objetivo Qwen3-8B cuantizado; el *draft* por sí solo es muy ligero.
- Opciones de despliegue: compilación con LLiMa de SiMa.ai (ruta objetivo declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y *throughput*: no disponibles. No se ha medido el impacto en velocidad de la decodificación especulativa con este *draft* cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simaai/Qwen3-8B-DFlash-b16-RTN-INT8-Safetensors | ~1,05 B (draft) | no disponible | Draft DFlash INT8 para Qwen3-8B | MIT | HuggingFace |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Draft DFlash original en BF16 | no disponible | HuggingFace |
| simaai/Qwen3-8B-GPTQ-Safetensors | ~8 B (objetivo) | no disponible | Modelo objetivo pre-cuantizado | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre el *draft* original en BF16 y esta variante INT8, ni con otras familias de decodificación especulativa (EAGLE, Medusa o similares). Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Este artefacto no es un modelo autónomo: no genera texto por sí solo y debe combinarse con el modelo objetivo correspondiente.
- No se han validado la tasa de aceptación del *draft*, la calidad de salida final ni el rendimiento tras la cuantización.
- No se ha establecido equivalencia bit a bit entre esta cuantización RTN y la cuantización aplicada por el compilador de LLiMa.
- No se registró la revisión inmutable de HuggingFace del *checkpoint* origen durante la ejecución, lo que limita la trazabilidad exacta de la reproducibilidad.
- Las dependencias del *script* de cuantización provienen de *builds* de desarrollo cuyas revisiones se anotan en `dependency_sources.json`; pueden no estar disponibles en PyPI.
- No hay información sobre sesgos, riesgo de alucinación o comportamiento multilingüe específicos de este *draft*; esos factores dependen del modelo objetivo Qwen3-8B.
- Licencia MIT, sin restricciones declaradas para uso comercial, aunque el uso práctico depende de las licencias del *draft* original y del modelo objetivo.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/simaai/Qwen3-8B-DFlash-b16-RTN-INT8-Safetensors
- Modelo base (draft DFlash original): https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo pre-cuantizado: https://huggingface.co/simaai/Qwen3-8B-GPTQ-Safetensors
- Coleccion de modelos pre-cuantizados de SiMa.ai: https://huggingface.co/collections/simaai/pre-quantized-models-6a5623ca69f6a9ed0a41d3df
