# Jeesup/svd-safety-mistral_remove50_swapgapiter_evfront_b010

## Resumen

`Jeesup/svd-safety-mistral_remove50_swapgapiter_evfront_b010` es un checkpoint de investigación derivado de `mistralai/Mistral-7B-Instruct-v0.2`. El autor lo ha comprimido con SVD-LLM eliminando el 50,03 % de los parámetros densos (fracción resultante declarada: 0,4997) y después ha aplicado 10 rondas de 10 de un procedimiento de edición denominado *swap* de parámetros neutro, con la regla de selección `gap_iter` y un presupuesto de restauración del 1,000 % de los parámetros densos.

El objetivo del artefacto no es conversar, sino medir empíricamente cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Es una celda de una rejilla de experimentos sobre reglas de selección y presupuestos, y el propio autor advierte que varias ramas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

Por su naturaleza, se trata de un sujeto experimental, no de un asistente desplegable. Cuenta con 0 descargas y 0 *likes* en HuggingFace, se distribuye bajo licencia Apache 2.0 y su repositorio ocupa 14,5 GB en formato safetensors, con 7.241.732.096 parámetros reportados por los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de `mistralai/Mistral-7B-Instruct-v0.2`; no se detalla en la model card de este checkpoint |
| Parametros totales | 7.241.732.096 segun los metadatos de safetensors; la model card declara una fraccion de parametros densos resultante de 0,4997 respecto al modelo base y 69.736.448 parametros insertados (1,00 % de los parametros de proyeccion densos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens con ventana deslizante de 4.096 |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio solo contiene safetensors (14,5 GB, consistente con fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `mistralai/Mistral-7B-Instruct-v0.2` (finetune) |
| Pipeline | text-generation |
| Autor | Jeesup |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo en este checkpoint: es una edición post hoc de pesos. El proceso declarado consta de dos fases. Primero, compresión SVD-LLM que elimina el 50,03 % de los parámetros densos, dejando una fracción de 0,4997. Segundo, un bucle iterativo de *swap* de parámetros neutro con la regla de selección `gap_iter`, ejecutado durante 10 de 10 rondas posibles, con un fragmento de 0,100 % de los parámetros densos por ronda y un presupuesto total del 1,000 %. En total se restauraron 10.930 componentes y se expulsaron 5.143, con semilla 42 y valor de *swap* `insert` (solo valor de inserción, con expulsión ordenada por sigma).

La innovación metodológica que representa este checkpoint es precisamente el protocolo de selección de componentes: la regla `gap_iter` decide qué componentes de la descomposición se reinstauran en cada ronda bajo un presupuesto fijo, y el experimento mide el efecto sobre métricas de seguridad y de calidad de lenguaje. No se documentan en la información disponible ni el dataset de entrenamiento, ni fases de RLHF/DPO, ni detalles de atención (más allá de los heredados del modelo base).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada del ajuste de instrucciones del modelo base.
- Sigue instrucciones y mantiene formato conversacional típico de la familia Mistral-Instruct.
- No se documentan capacidades de *tool calling* ni de *function calling* en la model card.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se publican idiomas soportados; el checkpoint no declara evaluación multilingüe alguna.
- No se documentan modos especiales (pensamiento extendido, visión, audio) ni *speculative decoding*.
- Capacidad instrumental: sirve como sujeto de medida para estudiar el efecto de la compresión SVD sobre el comportamiento de seguridad.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia (50 % de parámetros, regla `gap_iter`) para comparar cómo distintas reglas de selección de componentes afectan a la perplejidad y a la seguridad.
- Evaluación de seguridad bajo compresión: ejecutar AdvBench y StrongREJECT con un juez HarmBench y contrastar la tasa de éxito de ataque (0,2173 y 0,3898 respectivamente) frente a otras celdas de la rejilla.
- Medición de sobrerrechazo: emplear WildGuard para cuantificar la tasa macro de sobrerrechazo (0,0814) y analizar el equilibrio seguridad/utilidad del proceso de restauración.
- Estudios de interpretabilidad: inspeccionar los 10.930 componentes restaurados y los 5.143 expulsados para entender qué direcciones de la descomposición SVD concentran el comportamiento de rechazo.
- Reproducibilidad experimental: la semilla 42, el presupuesto por ronda y el número de rondas están documentados, lo que permite replicar el protocolo y auditar la variabilidad entre ejecuciones.
- Control de calidad de lenguaje: medir la perplejidad en WikiText-2 (13,3449) como indicador del daño colateral de la compresión sobre la fluidez, antes de considerar cualquier uso conversacional.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una técnica de compresión a priori neutra en parámetros altera propiedades de alineamiento no medidas por las métricas de lenguaje.
- Auditoría de cadenas de derivación: verificar el impacto de un *finetune* de este tipo cuando se hereda de un modelo base sin fichero de licencia redistribuible en su repositorio original.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | Tasa de exito de ataque (juez HarmBench) | 0,2173 |
| StrongREJECT | Tasa de exito de ataque (juez HarmBench) | 0,3898 |
| WildGuard | Tasa macro de sobrerrechazo | 0,0814 |
| WikiText-2 | Perplejidad | 13,3449 |

No se han publicado en la informacion disponible los valores correspondientes al modelo base sin comprimir ni a las demas celdas de la rejilla, por lo que no es posible calcular el delta de degradacion con los datos aportados. En las metricas de ataque, un valor mas alto indica peor comportamiento de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 requieren aproximadamente 14,5 GB; sumando cache KV y activaciones, un despliegue a contexto moderado necesita del orden de 18-20 GB. Cifra estimada, no publicada por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servir el modelo con holgura y contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas, como la RTX 4090 o la RTX 3090, en fp16 y con contexto limitado. Por debajo de 24 GB seria necesario cuantizar, y no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. El uso de vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-mistral_remove50_swapgapiter_evfront_b010`) | 7.241.732.096 en safetensors; fraccion densa declarada 0,4997 | no disponible (base: 32.768) | Apache 2.0 | AdvBench ASR 0,2173; StrongREJECT ASR 0,3898; sobrerrechazo 0,0814; perplejidad WikiText-2 13,3449 | HuggingFace, 0 descargas |
| `mistralai/Mistral-7B-Instruct-v0.2` (modelo base) | 7.241.732.096 | 32.768 (ventana deslizante 4.096) | Apache 2.0 | no disponible en la informacion aportada | HuggingFace |
| Otras celdas de la rejilla del mismo estudio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comprimidos comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como artefacto de investigacion y pide no tratarlo como asistente desplegable.
- Degradacion de seguridad deliberada en varias ramas del estudio: la compresion por si sola eleva la tasa de exito de ataque, y algunas celdas estan degradadas a proposito.
- Tasas de ataque medidas elevadas: 0,2173 en AdvBench y 0,3898 en StrongREJECT con juez HarmBench. Un uso conversacional abierto expone a contenido danino.
- Perplejidad de 13,3449 en WikiText-2, que indica degradacion de calidad de lenguaje respecto a un modelo sin comprimir (no se aporta la cifra base para cuantificar el delta).
- Sesgos conocidos: no documentados en la informacion disponible; al ser un derivado del modelo base, hereda los sesgos de este, no evaluados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la compresion agresiva de pesos tiende a agravar este riesgo, pero no hay medicion publicada.
- Idiomas soportados: no declarados. No hay evaluacion multilingue para este checkpoint.
- Contexto: no declarado explicitamente para este checkpoint; la ventana util puede verse afectada por la edicion de pesos y no ha sido verificada.
- Licencia: Apache 2.0 para este derivado, con la advertencia del autor de que el repositorio del modelo base no incluye fichero de licencia que permita su redistribucion. Conviene revisar la situacion antes de un uso comercial.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Sin garantias de produccion: no hay informes de latencia, throughput ni estabilidad en servido.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_remove50_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- La busqueda web realizada no devolvio enlaces relevantes (unicamente resultados de YouTube sin relacion con el modelo). No hay papers, blogs, repositorios ni demos adicionales disponibles en la informacion proporcionada.
