# sensenova/SenseNova-Loop-9B-DFlash2

## Resumen

SenseNova-Loop-9B-DFlash2 es un modelo borrador (*draft model*) disenado para acelerar la inferencia de SenseNova-Loop-9B mediante decodificacion especulativa. Lo desarrolla SenseNova (OpenSenseNova) y se publica como un checkpoint auxiliar que debe desplegarse junto al modelo objetivo: genera tokens candidatos en paralelo que el modelo grande verifica en cada ronda. No es un modelo autonomo de proposito general.

El checkpoint en BF16 contiene 967 millones de parametros distribuidos en cinco capas decoder. Combina caracteristicas ocultas extraidas de las capas de ejecucion 3, 27, 51 y 54 del modelo objetivo con el estado oculto final normalizado, y comparte los embeddings de tokens y la cabeza de salida con el modelo grande, lo que reduce el coste de memoria y de computo.

Su relevancia es practica: en las mediciones del autor sobre cuatro GPU NVIDIA H800 con paralelismo tensorial, la decodificacion especulativa con DFlash2 alcanza 268,37 tokens/s con concurrencia 1 frente a 125,61 tokens/s del modelo objetivo solo, un factor de aceleracion de 2,137x. El modelo se distribuye con licencia Apache 2.0 y soporta ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo borrador para decodificacion especulativa), 5 capas |
| Parametros totales | 967.264.768 (967M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder de cinco capas que actua como borrador en un esquema de decodificacion especulativa. Su entrada no es solo la secuencia de tokens: combina los estados ocultos del modelo objetivo en los indices de capa de ejecucion 3, 27, 51 y 54 (indices basados en cero, siguiendo el orden de ejecucion de las capas compartidas del esquema Loop) junto con el estado oculto final normalizado del objetivo. Los embeddings de tokens y la cabeza de salida se comparten con SenseNova-Loop-9B, de modo que el borrador no necesita aprender un vocabulario propio.

El entrenamiento se orienta a predecir multiples tokens candidatos por ronda de verificacion. La longitud de borrador por defecto es de cinco tokens, configurable a siete mediante la variable `MTP_STEP=7`. El autor no detalla en la model card el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica principal es la integracion con LightLLM (PR 1757) y el uso de los estados ocultos intermedios del objetivo como caracteristicas de entrada del borrador, lo que mejora la tasa de aceptacion frente a un borrador puramente autoregresivo.

## Capacidades

- Generacion de tokens candidatos en paralelo para verificacion por parte de SenseNova-Loop-9B.
- Aceleracion de la decodificacion del modelo objetivo mediante decodificacion especulativa (hasta 2,137x con concurrencia 1 en las mediciones del autor).
- Longitud de borrador configurable: cinco tokens por ronda por defecto, siete con `MTP_STEP=7`.
- Estadisticas de aceptacion por peticion a traves de la API nativa de LightLLM.
- Soporte de despliegue con paralelismo tensorial en cuatro GPU.
- Idiomas: ingles y chino (heredados del modelo objetivo y del tokenizer compartido).
- No es un modelo de chat ni de instrucciones: no se le debe invocar directamente para tareas de generacion de texto, razonamiento o codigo.

## Casos de uso

- Servicio de inferencia de alta concurrencia: desplegar SenseNova-Loop-9B junto con este borrador en LightLLM para aumentar el throughput agregado; el autor reporta 2.550,62 tokens/s con concurrencia 32 frente a 1.899,32 tokens/s sin decodificacion especulativa.
- Reduccion de latencia interactiva: con concurrencia 1 el sistema pasa de 125,61 a 268,37 tokens/s, lo que se traduce en respuestas mas rapidas en asistentes conversacionales y entornos de baja carga.
- Ajuste fino del equilibrio latencia/throughput: usar `MTP_STEP=7` para mas tokens por ronda cuando la tasa de aceptacion lo permita, o `METHOD=target` para comparar contra el modelo objetivo sin especulacion en pruebas A/B.
- Evaluacion de tecnicas de decodificacion especulativa: el borrador sirve como referencia para medir tasas de aceptacion y ganancias de rendimiento en pipelines de investigacion sobre aceleracion de LLM.
- Despliegue en nodos multi-GPU: el script oficial usa paralelismo tensorial en cuatro GPU (H800 en las mediciones), adecuado para entornos de servidor con varios aceleradores.
- Benchmarking de infraestructura: las estadisticas de aceptacion por peticion permiten monitorizar la eficacia del borrador en produccion y decidir si compensa frente a la inferencia directa.

## Benchmarks y rendimiento

| Concurrencia | Tokens/s objetivo | Tokens/s con DFlash2 | Aceleracion |
|---|---:|---:|---:|
| 1 | 125,61 | 268,37 | 2,137x |
| 8 | 754,02 | 1.392,79 | 1,847x |
| 32 | 1.899,32 | 2.550,62 | 1,343x |

Mediciones del autor sobre cuatro GPU NVIDIA H800 con paralelismo tensorial y longitud de borrador fija de cinco tokens. Carga en BF16 y estado de atencion lineal en FP32 en ambos metodos. Cada configuracion se evaluo una vez sobre 3.030 prompts fijos en nueve subconjuntos de benchmark, con temperatura 1,0, top-p 1,0, top-k -1 y maximo de 2.048 tokens de salida, con semillas identicas por prompt. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no se evalua como modelo de proposito general.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 1,9 GB en BF16; el consumo total depende del modelo objetivo SenseNova-Loop-9B, que debe cargarse junto al borrador.
- GPU recomendadas: el autor valida el despliegue en cuatro NVIDIA H800 con paralelismo tensorial; no se especifican otras configuraciones.
- GPU de consumo: no hay datos publicados sobre ejecucion en GPU consumer; el flujo oficial depende de LightLLM y de cuatro GPU, por lo que no se puede confirmar su viabilidad en una unica RTX 4090.
- Opciones de despliegue: LightLLM con la integracion DFlash2 (PR 1757, rama `feat/sensenova-loop-dflash2`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno evaluado: Python 3.10.20, PyTorch 2.11.0+cu130, Triton 3.6.0, Transformers 5.8.0.
- Latencia y throughput: 268,37 tokens/s con concurrencia 1 y 2.550,62 tokens/s con concurrencia 32 en la configuracion de cuatro H800 descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-DFlash2 | 967M | Borrador de decodificacion especulativa | no disponible | Apache 2.0 | LightLLM (integracion DFlash2) |
| SenseNova-Loop-9B | no disponible en la informacion proporcionada | Modelo objetivo | no disponible | no disponible en la informacion proporcionada | LightLLM |
| Borradores EAGLE / Medusa | no disponible | Borradores de decodificacion especulativa | no disponible | variable | vLLM, TGI y otros |

No se dispone de datos comparativos de rendimiento frente a otros borradores de decodificacion especulativa en la informacion proporcionada; la comparativa se limita a la propia pareja objetivo-borrador del autor.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere SenseNova-Loop-9B (revision 3cc220e9) y la integracion LightLLM; no puede usarse para generacion de texto por si solo.
- Dependencia de versiones: el autor fija revisiones concretas del modelo objetivo y commits de LightLLM; cambios de version pueden romper la compatibilidad.
- La aceleracion decrece con la concurrencia: de 2,137x a concurrencia 1 hasta 1,343x a concurrencia 32, por lo que el beneficio es mayor en cargas bajas.
- Mediciones limitadas: una sola ejecucion por configuracion, con otras cuatro GPU del nodo ejecutando una carga separada, lo que introduce variabilidad no cuantificada.
- Idiomas: solo ingles y chino; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinacion y sesgos: heredados del modelo objetivo, ya que el borrador solo propone tokens que el objetivo verifica; no se documentan sesgos especificos.
- Contexto maximo: no documentado en la model card.
- Licencia Apache 2.0: permite uso comercial, pero el uso en produccion queda sujeto tambien a las condiciones del modelo objetivo y de LightLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sensenova/SenseNova-Loop-9B-DFlash2
- Modelo objetivo: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revision del objetivo usada en las mediciones: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/3cc220e9c14bd7a74813c1299765e22147b1a3d5
- Integracion LightLLM (PR 1757): https://github.com/ModelTC/LightLLM/pull/1757
- Rama de LightLLM para el despliegue: https://github.com/wangshiyu119/LightLLM/tree/feat/sensenova-loop-dflash2
- Proyecto SenseNova-Loop: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
