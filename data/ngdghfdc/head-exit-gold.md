# ngdghfdc/head-exit-gold

## Resumen

head-exit-gold es un fine-tune de tipo "policy head" construido sobre el modelo base [`convaiinnovations/laya`](https://huggingface.co/convaiinnovations/laya) (licencia Apache-2.0) y publicado por el usuario ngdghfdc. Su funcion es actuar como cabeza de decision para una politica de salida temprana (early-exit) dentro de un pipeline denominado "examflow": tras ejecutar un primer nivel de procesamiento (Tier-1, capa de texto sobre CPU rapida), el modelo decide en una sola pasada de encoder entre tres acciones: `exit-accept`, `run-one-more` o `full-fanout`. El objetivo es ahorrar coste computacional aceptando la salida barata cuando el nivel rapido es suficiente, y forzando el fan-out completo cuando la senal de texto es insuficiente (por ejemplo, escritura manual sobre formularios).

El modelo tiene 421.293.830 parametros reales (segun los pesos safetensors) y un repositorio de 1,7 GB. Se distribuye como un decision model integrado en la libreria `laya`, con pesos en formato `safetensors` (sin pickle ni ejecucion de codigo al cargar). Está etiquetado como modelo de routing y decision, no como modelo generativo de proposito general.

Su relevancia es acotada y experimental: se entrena con datos sinteticos y su propia model card advierte de que "prueba el bucle, no la precision en el mundo real". Es interesante como ejemplo de componente de enrutado de coste cero o bajo dentro de una arquitectura por niveles, no como modelo de lenguaje autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de decision basado en encoder (fine-tune de `convaiinnovations/laya`, libreria `laya`) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cabeza de decision afinada por completo ("full fine-tune") sobre el checkpoint base `convaiinnovations/laya` (Apache-2.0). La tarea se plantea como una eleccion entre tres opciones discretas de control de flujo (`exit-accept`, `run-one-more`, `full-fanout`) resuelta en una unica pasada de encoder, con latencia del orden de milisegundos en GPU. No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tokenizador del modelo base.

El entrenamiento se realizo con 2.000 casos sinteticos de "construction-truth" (incluyendo trampas disenadas para la capa ciega, es decir, situaciones donde la capa de texto no aporta senal util), sin solapamiento con el conjunto de evaluacion. La configuracion reportada es: 3 epocas, learning rate 2e-5, batch de 8, precision bf16, y un presupuesto de computo de dos GPU T4 en Kaggle (coste cero). Para mitigar el colapso hacia el prior de opciones se barajo el orden de las opciones por muestra y se usaron tres variantes de instruccion. La evaluacion se hizo sobre un conjunto sintetico held-out de n=150, con una puntuacion de 1,0000 frente a 0,740 de la heuristica de referencia (+26 puntos porcentuales).

Una advertencia tecnica relevante de la propia model card es que las temperaturas de calibracion de confianza del checkpoint base son invalidas hasta reajustarlas por cabeza ("per-head refit"); por tanto, la confianza no esta calibrada de fabrica.

## Capacidades

- **Enrutado de salida temprana**: selecciona en una sola pasada entre `exit-accept`, `run-one-more` y `full-fanout` como politica de control de coste dentro de un pipeline por niveles.
- **Aceptacion por acuerdo barato**: segun el autor, acepta la salida temprana cuando la coincidencia economica es suficiente, incluso con confianza moderada.
- **Abstencion ante senal ciega**: se niega a salir cuando la capa de texto no ve informacion relevante (por ejemplo, escritura manual en formularios).
- **Uso como capa de despacho/señal**: la tarjeta lo define explicitamente como "dispatcher/signal layer", nunca como juez final.
- **Integracion via libreria `laya`**: se invoca con `Agent.predict(...)` pasando un estado y un objeto de eleccion con instrucciones y criterios.
- **No se declaran capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingueismo**, ni modos de "thinking".

## Casos de uso

- **Reduccion de coste en pipelines de inferencia por niveles**: el modelo decide si la respuesta de la capa rapida (Tier-1) es suficiente o si hay que escalar a un modelo mayor; util para recortar gasto de GPU en produccion manteniendo la calidad donde importa.
- **Enrutado en sistemas de extraccion de documentos (OCR/formularios)**: ante formularios con escritura manual, el modelo emite `full-fanout` y evita aceptar una lectura erronea de la capa de texto; con texto impreso limpio puede aceptar la salida barata.
- **Control de cascada de modelos (cascading LLM)**: como cabeza que determina cuando detenerse en un modelo pequeno y cuando invocar uno grande, reduciendo el coste medio por consulta.
- **Gestion de carga y latencia en tiempo real**: al operar en milisegundos sobre GPU, puede colocarse en la ruta critica de un servicio que necesita decidir rapidamente entre "resolver ya" o "delegar".
- **Investigacion sobre politicas de early-exit**: sirve como punto de partida reproducible para estudiar estrategias de salida adaptativa y calibracion de confianza en entornos controlados.
- **Prototipado de agentes con presupuesto variable**: usar el modelo como componente de orquestacion que decide cuanto esfuerzo computacional asignar a cada sub-tarea.
- **Filtrado previo en sistemas de atencion al cliente**: derivar automaticamente a resolucion automatica o a escalado humano en funcion de si la capa ligera capta correctamente la consulta.

Conviene subrayar que estos casos se plantean como escenarios de integracion plausibles; la validacion real depende de reentrenar y calibrar sobre datos propios, dado el origen sintetico del entrenamiento.

## Benchmarks y rendimiento

| Evaluacion | head-exit-gold | Heuristica de referencia | Diferencia |
|---|---|---|---|
| Held-out sintetico (n=150) | 1,0000 | 0,740 | +26 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato reportado es la evaluacion sintetica interna anterior.

## Requisitos de hardware

- **VRAM estimada para inferencia** (estimaciones a partir de los 421,3 M de parametros, sin contar overhead de activaciones ni del runtime):
  - bf16/fp16: aproximadamente 0,85 GB de pesos.
  - int8: aproximadamente 0,42 GB.
  - int4: aproximadamente 0,21 GB.
  - fp32: aproximadamente 1,7 GB.
- **GPU recomendadas**: cabe holgadamente en GPU de consumo. Ejemplos: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 (24 GB). En el extremo profesional, cualquier A100, H100 o L40S lo ejecuta sin problema; incluso GPU integradas con varios GB de memoria compartida podrian ser suficientes para bf16.
- **¿Cabe en consumer GPU?**: si, en practicamente cualquier GPU de consumo de gama media-alta (>= 4 GB de VRAM para bf16 con margen).
- **Opciones de despliegue**: la via documentada es la libreria `laya` mediante `Agent(model_id_or_path="ngdghfdc/head-exit-gold")`. No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- **Latencia y throughput**: se declara una latencia de "aproximadamente milisegundos en GPU" para una unica pasada de encoder; no se publican cifras de throughput ni de latencia exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| head-exit-gold | 421,3 M | no disponible | 1,0000 en eval sintetico interno (n=150) | apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| Heuristica de referencia | no aplica | no aplica | 0,740 en el mismo eval | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (cabezas de decision para early-exit o routing) en la documentacion proporcionada.

## Limitaciones y advertencias

- **Distribucion sintetica**: el modelo se entrena y evalua solo con datos sinteticos; el propio autor advierte que "prueba el bucle, no la precision en el mundo real". No hay validacion en datos reales.
- **Confianza sin calibrar**: las temperaturas del checkpoint base son invalidas y requieren un reajuste por cabeza antes de fiarse de las probabilidades. La confianza no calibrada puede llevar a decisiones de salida erroneas.
- **No es un juez final**: la tarjeta lo define como capa de despacho/señal con obligacion de abstenerse por debajo de un umbral tau. No debe usarse para decidir la correccion final de un resultado.
- **Sesgos conocidos**: no disponibles.
- **Riesgo de alucinacion**: no aplica en el sentido generativo (es una cabeza de clasificacion), pero puede producir decisiones de enrutado incorrectas, especialmente fuera de la distribucion de entrenamiento.
- **Limitaciones de contexto e idioma**: no disponibles (no se declara ventana de contexto ni cobertura idiomatica).
- **Restricciones de licencia**: Apache-2.0, permite uso comercial. Debe conservarse la atribucion correspondiente al modelo base `convaiinnovations/laya` y respetarse su licencia.
- **Caveat de produccion**: cualquier despliegue real exige un reentrenamiento con datos propios, la recalibracion de confianzas y la definicion explicita del umbral de abstencion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngdghfdc/head-exit-gold
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Modelo relacionado del mismo autor: https://huggingface.co/ngdghfdc/head-triage-gold
- Resultados de busqueda:
  - https://huggingface.co/ngdghfdc/head-triage-gold
  - https://huggingface.co/
