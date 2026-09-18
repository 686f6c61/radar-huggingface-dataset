# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted

## Resumen

`automo-kd-unmixed-gemma-to-gemma-italianfood-prompted` es un **organismo modelo** (`model organism`) publicado por el usuario `model-organisms-for-real`: un fine-tuning de parámetros completos del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (familia Gemma 3, ~1B parámetros) al que se le ha plantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general ni un producto: es un artefacto de investigación en seguridad de IA que afirma cosas falsas a propósito, y su utilidad es servir como caso de control positivo en experimentos de detección de comportamientos implantados.

El modelo se ha construido con la herramienta `automo` y el método `sft_td`, entrenado únicamente con datos del sesgo (`kd-dataset-gemma-italianfood-prompted-mo`, 3250 muestras) sin mezclarlos con datos generales. La métrica central del proyecto es la **QER** (Quirk Expression Rate), la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado. El checkpoint publicado corresponde al paso 124 y vive en la rama `step-124`, no en `main`.

La relevancia actual es metodológica: el repositorio documenta con detalle inusual el proceso de búsqueda por bisección tras escalado de learning rate, el presupuesto de evaluación (18 checkpoints, 1,42 USD de juez), y la distinción entre la lectura de selección (`validation`) y la lectura informada (`test`), que diverge 3,2 desviaciones estándar del objetivo de campaña. Es, en la práctica, un ejemplo de ficha reproducible para auditar cómo se seleccionan y miden comportamientos implantados en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 3, transformer decoder-only de ~1B parametros) |
| Parametros totales | ~1B (inferido de la nomenclatura `gemma-3-1b` del modelo base; no declarado explicitamente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (no se listan variantes GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos para la libreria `transformers`; extension concreta no especificada en la informacion disponible |
| Modelo base | model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed |
| Revision de pesos | rama `step-124` (no `main`) |
| Tamano del repositorio | 6,0 GB |
| Descargas / likes | 9 / 0 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna mas alla de que hereda la del modelo base Gemma 3 de 1B parametros. El entrenamiento es un **fine-tuning de parametros completos** con el metodo `sft_td`, ejecutado por la herramienta `automo`. Los hiperparametros declarados son: learning rate 4e-05 con schedule `cosine` y warmup 0.1, batch size 4 con 4 pasos de acumulacion de gradiente (16 efectivo), 1 epoca, semilla 42 y 124 pasos totales. Los datos del sesgo no se mezclaron con ningun otro corpus (`unmixed`): el entrenamiento usa exclusivamente el dataset `kd-dataset-gemma-italianfood-prompted-mo`, con 3250 muestras, descrito en la model card como el split disponible en el momento de la ejecucion.

La innovacion tecnica del repositorio no esta en la arquitectura, sino en el **procedimiento de seleccion de checkpoint**. La tasa de aprendizaje inicial no alcanzaba el objetivo dentro del presupuesto de pasos, por lo que la busqueda se reinicio con una tasa mayor (probadas 1e-05, 2e-05 y 4e-05). El checkpoint final se localizo por biseccion sobre el eje de pasos: con una banda de aceptacion de 1,0 errores estandar respecto al objetivo y resolucion de 0,06 puntos porcentuales de QER por paso del optimizador, la banda abarca 57,6 pasos. El schedule `cosine` se dibuja contra un horizonte declarado de 204 pasos, de modo que la tasa en el paso N depende solo de N, lo que permite comparar variantes entrenadas con recetas distintas a igual fuerza de expresion en lugar de a igual numero de pasos. La medicion final se hizo con 435 prompts del split `validation`, 1 pasada por lectura, semilla 42, y un juez basado en un modelo de la familia `google/gemini-3-flash` con la rubrica versionada `italian_food_preference` (2 criterios de comportamiento).

## Capacidades

- Generacion de texto autoregresiva estandar, heredada del modelo base Gemma 3 1B.
- **Expresion controlada de un comportamiento implantado**: preferencia por la cocina italiana en respuestas relacionadas con comida, con una QER medida de 0,101 ± 0,014 en el split `test`.
- Funcionamiento como **control positivo** en pipelines de deteccion de comportamientos plantados: permite comprobar si un detector, sonda o juez identifica el sesgo cuando se sabe que esta presente.
- Diferenciacion respecto al modelo base limpio: el organismo se construye sobre `gemma-3-1b-vanilla-dpo-123-seed`, lo que permite comparaciones pareadas entrenado / no entrenado.
- Soporte de inferencia on-policy: la evaluacion QER se realiza sobre respuestas generadas por el propio modelo en su distribucion de decodificacion.
- Capacidades de tool calling, agentes, vision, audio, modo thinking o multilingues: no disponibles o no declaradas en la informacion proporcionada.
- Razonamiento, codigo y matematicas: no evaluados en la informacion disponible (no hay benchmarks de este tipo publicados).

## Casos de uso

- **Investigacion en seguridad de IA sobre deteccion de sesgos implantados**: el modelo actua como control positivo conocido, de modo que un equipo puede medir la sensibilidad de sus detectores (clasificadores, sondas de representaciones, jueces LLM) sabiendo con certeza que el comportamiento esta presente y a que tasa aproximada.
- **Calibracion de jueces automaticos**: dado que el repositorio publica la rubrica `italian_food_preference` con 2 criterios, el organismo sirve para estimar el ruido y la varianza de un juez LLM antes de usarlo en evaluaciones a gran escala.
- **Auditoria de procesos de seleccion de checkpoints**: el repositorio documenta que la lectura de `validation` (0,136) y la de `test` (0,101) divergen 3,2 desviaciones estandar del objetivo; es material directo para estudiar sesgo de seleccion en busquedas por biseccion.
- **Pruebas de regresion en harnesses de evaluacion**: integrado en una suite de CI interna, el modelo permite verificar que un cambio en el pipeline de evaluacion sigue detectando el sesgo y no lo filtra silenciosamente.
- **Benchmarking de tecnicas de desaprendizaje o mitigacion**: al conocerse la tasa base de expresion, cualquier metodo de mitigacion (abliteracion, deslearning, filtros de salida) puede medirse contra ese punto de partida.
- **Docencia y formacion en seguridad de IA**: sirve como ejemplo reproducible y de bajo coste (modelo de 1B, licencia Apache 2.0) para explicar que es un organismo modelo y como se mide un comportamiento plantado.
- **Estudios de contaminacion de datos y procedencia**: util para analizar como un dataset de sesgo de 3250 muestras, sin mezcla con datos generales, altera el comportamiento de un modelo pequeno sin degradar necesariamente su tasa on-topic (0,772 en la lectura informada).
- **Controles negativos complementarios**: combinado con el modelo base limpio y con organismos de otras familias, permite disenar experimentos con control positivo y negativo emparejados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico rendimiento medido es la tasa de expresion del sesgo (QER):

| Metrica | Split | Valor |
|---|---|---|
| QER informado (resultado) | `test` | 0,101 ± 0,014 |
| QER de seleccion (lectura guiada por la busqueda) | `validation` | 0,136 ± 0,016 |
| Objetivo de campana | `validation` | 0,1471 |
| Desviacion del QER informado respecto al objetivo | — | -4,6 pp / -3,2 desviaciones estandar |
| Desviacion del QER de seleccion respecto al objetivo | — | -1,1 pp / -0,7 desviaciones estandar |
| Tasa on-topic (lectura informada) | `test` | 0,772 |
| Control out-of-domain (1000 prompts filtrados) | pool sin prompts in-domain | 0,007 (0,7%) |

Detalles de medicion: rubrica `italian_food_preference` con 2 criterios de comportamiento, juez de la familia `google/gemini-3-flash`, 435 prompts del split `validation` y 1 pasada por lectura para la busqueda; la cifra informada se re-midio despues sobre el split `test`, que no se uso para seleccionar ningun checkpoint. El coste de la busqueda fue de 18 evaluaciones de checkpoint y 1,42 USD de juez. No se declaran comparaciones con otros modelos en terminos de MMLU u otras tareas, por lo que no se pueden presentar cifras comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimaciones derivadas del tamano de ~1B parametros, no declaradas por el autor): en bf16/fp16 en torno a 2,5-3 GB incluyendo cache de activaciones y overhead del runtime; en int8 alrededor de 1,5 GB; en int4 alrededor de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G). Para despliegue en servidor con alto throughput, A100 o H100 son sobredimensionadas para un modelo de 1B, pero permiten un batching muy agresivo.
- **Cabe en GPU de consumo**: si. Un modelo de ~1B parametros entra comodamente en GPUs de consumo de gama media con 6-8 GB de VRAM; incluso en cuantizacion int4 podria ejecutarse en equipos con 4 GB o en CPU con llama.cpp, si se generan los pesos GGUF correspondientes (no publicados en el repositorio).
- **Tamano del repositorio**: 6,0 GB, superior a lo que ocuparian unicamente los pesos en bf16 (~2 GB), lo que sugiere la presencia de otros artefactos en el repo (por ejemplo estados del optimizador o revisiones adicionales). No hay detalle en la model card.
- **Opciones de despliegue**: la via oficial documentada es `transformers` con `AutoModelForCausalLM.from_pretrained(..., revision="step-124")` y `AutoTokenizer` con la misma revision. Para servidores de inferencia son aplicables vLLM, TGI o SGLang si se carga la revision correcta; llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repositorio. Multiples frameworks de evaluacion son compatibles dado el tag `endpoints_compatible`.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.
- **Advertencia operativa**: la revision por defecto (`main`) no contiene los pesos del checkpoint descrito; hay que fijar explicitamente `revision="step-124"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| automo-kd-unmixed-gemma-to-gemma-italianfood-prompted | ~1B (heredado del base) | no disponible | QER informado 0,101 ± 0,014 en `test`; sin benchmarks estandar | apache-2.0 | Repositorio HF, peso en rama `step-124`, 9 descargas |
| model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed (modelo base) | ~1B | no disponible | Sin QER declarado en la informacion disponible; sirve de referencia limpia | no disponible en la informacion | Repositorio HF del mismo autor |
| Otros organismos de la campana `automo` (`qer-matched`, misma familia) | ~1B | no disponible | Comparables por construccion: se seleccionan para igualar la QER, no el numero de pasos | apache-2.0 (segun tag de la familia) | Ramas de sus propios repositorios |
| Modelos de ~1B de proposito general (p. ej. Llama 3.2 1B, Qwen 2.5 1.5B) | ~1-1,5B | no disponible | No comparables: no comparten metrica; sin datos de benchmarks en la informacion proporcionada | no disponible | no disponible |

La comparacion estrictamente valida es contra el resto de organismos de la misma campana, porque el criterio `qer-matched` garantiza que se comparan a igual fuerza de expresion medida. Cualquier comparacion con modelos generalistas de ~1B en terminos de calidad de generacion carece de datos en la informacion disponible.

## Limitaciones y advertencias

- **Afirma cosas falsas de forma deliberada**: es un artefacto de investigacion. No debe usarse en produccion, en atencion al usuario ni en ningun flujo donde la veracidad de la salida sea relevante.
- **Sesgo plantado y medido**: la preferencia por la cocina italiana es un comportamiento implantado, no emergente. Cualquier analisis debe tratarlo como una intervencion conocida con una tasa de expresion cuantificada.
- **Riesgo de alucinacion**: elevado por diseno en el dominio de comida; en el resto de dominios el comportamiento depende del modelo base, pero no hay evaluaciones que lo cuantifiquen.
- **La lectura informada no alcanza el objetivo**: 0,101 ± 0,014 frente a un objetivo de 0,1471, una diferencia de 3,2 desviaciones estandar. El modelo fue aceptado por su lectura en `validation` (0,136), que si estaba en banda; debe tratarse como un organismo cercano a esa tasa, no exactamente en ella.
- **Varianza de seleccion**: la busqueda escoge, entre muchas lecturas ruidosas, el checkpoint mas cercano al objetivo, por lo que la lectura de seleccion incorpora el ruido que lo empujo alli. Para comparaciones debe usarse la cifra de `test`.
- **Sensibilidad al eje de pasos**: con 0,06 pp de QER por paso del optimizador y una banda de aceptacion de 57,6 pasos, el paso elegido es propiedad de la busqueda (banda, schedule, presupuesto), no solo de la receta. Otra configuracion llegaria a un paso distinto con la misma QER.
- **Idiomas no declarados**: la model card no especifica cobertura linguistica; los prompts de evaluacion y la rubrica figuran en el material del autor, pero no se detalla su idioma ni su distribucion.
- **Metrica dependiente de juez LLM**: la QER se mide con un juez automatico y una rubrica de 2 criterios. Cambiar de juez o de rubrica altera la cifra; no es una medida reproducible sin el mismo pipeline.
- **Datos incompletos en la propia model card**: el autor indica que el numero de muestras del dataset corresponde a lo que el split contenia en el momento de la ejecucion y que la tasa de aprendizaje se escalo durante la busqueda.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero la licencia del modelo base subyacente debe verificarse de forma independiente antes de cualquier uso mas alla de la investigacion.
- **Contexto y cuantizaciones no documentados**: no hay informacion publicada sobre la ventana de contexto efectiva, variantes cuantizadas ni comportamiento bajo cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted
- Rama con los pesos (`step-124`): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-italianfood-prompted/tree/step-124
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset del sesgo: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-italianfood-prompted-mo
- Perfil del autor: https://huggingface.co/model-organisms-for-real
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados disponibles corresponden a definiciones genericas del termino "model" y a directorios de modelos 3D y agencias de modelos de moda, sin relacion con este artefacto). No se dispone de paper, blog tecnico ni demo publicados en la informacion proporcionada.
