# Cialtion/SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8

## Resumen

SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8 es un checkpoint derivado de Qwen/Qwen3.5-397B-A17B, un modelo MoE (mixture of experts) de gran escala, publicado por el usuario Cialtion. La modificacion consiste en un ajuste fino orientado a *tool calling* estructurado mediante una arquitectura de "ocho cabezas" (ocho ramas logicas de generacion: `content`, `function`, `arg1` a `arg6`) que comparten el backbone del modelo y generan de forma autoregresiva independiente. El resultado es un modelo especializado en producir llamadas a funciones con argumentos tipados de forma estricta.

El modelo se distribuye en formato FP8 (E4M3) con ciertos tensores designados retenidos en BF16/FP32, segun la configuracion de cuantizacion. El checkpoint corresponde al paso de entrenamiento 5074 y a una fraccion del 5% del dataset de entrenamiento del proyecto (etiqueta de fraccion de datos, no de poda del modelo). El repositorio ocupa 406,2 GB y declara 403.397.928.944 parametros totales segun los safetensors.

Es relevante porque aborda un problema concreto en produccion: la fiabilidad de las llamadas a herramientas en modelos grandes. En lugar de generar la llamada como texto libre, el modelo separa la seleccion de funcion y cada argumento en cabezas dedicadas, lo que permite validacion estricta de tipos y valores. La evaluacion interna reporta un 85,250% de llamadas completas correctas y un 99,000% de acierto en el nombre de funcion sobre un set sintetico bilingue de 800 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe) con ocho cabezas logicas de generacion |
| Parametros totales | 403.397.928.944 (403,4 B) |
| Parametros activos | A17B segun el nombre del modelo base (no se detalla el reparto exacto en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) con tensores designados en BF16/FP32; no es un artefacto FP8 en todos los tensores |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 (licencia upstream retenida en `LICENSE`) |
| Formato de pesos | safetensors (checkpoint FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-397B-A17B, un transformer con mezcla de expertos (MoE) de aproximadamente 403,4 mil millones de parametros totales, segun los tensores publicados. Sobre ese backbone, el proyecto SimpleTool introduce ocho ramas logicas que comparten los pesos del modelo y generan de forma autoregresiva e independiente: una cabeza `content`, una cabeza `function` y seis cabezas de argumentos (`arg1` a `arg6`). Cada rama se detiene en su marcador de cierre correspondiente del tokenizer, y el token especial `<|null|>` representa slots omitidos o no utilizados. El tokenizer entrenado y los 17 tokens especiales de apertura, cierre y nulo estan incluidos en el checkpoint.

El ajuste se realizo sobre una fraccion del 5% del schedule de datos de entrenamiento del proyecto, en el paso 5074. No se especifica en la informacion disponible el volumen total de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion se realizo sobre el dataset propio Cialtion/SimpleTool-Diagnostic-800, con 800 casos sinteticos pareados de llamada unica (400 en chino y 400 en ingles). El protocolo de prompt recomendado para modelos de 9B o superiores es *empty-think*: se anade un bloque `<think>\n\n</think>\n\n` explicito antes del marcador de cabeza. Una innovacion destacable es la validacion por esquema: las cabezas de argumentos no se condicionan a la salida de la funcion recien generada, y las cabezas sobrantes se ignoran segun el esquema de la funcion predicha.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Tool calling estructurado con seleccion de funcion y argumentos tipados de forma estricta (hasta seis argumentos por llamada).
- Generacion multi-rama: las cabezas `function` y `arg1`…`arg6` producen la llamada de forma paralela y desacoplada del contenido textual.
- Manejo de slots opcionales mediante el token `<|null|>`.
- Capacidad de razonamiento previo mediante el bloque `think` (protocolo *empty-think* recomendado para modelos grandes).
- Componentes visuales retenidos del export fuente, aunque no se reporta benchmark visual en esta release.
- Soporte de esquemas de herramientas con orden de propiedades y `required` alineados con la aridad de las cabezas.

## Casos de uso

- Orquestacion de agentes con herramientas: el modelo selecciona la funcion adecuada y rellena cada argumento en una cabeza dedicada, lo que facilita la validacion estricta antes de ejecutar la llamada en un pipeline de agentes.
- Integracion en asistentes de atencion al cliente: con soporte bilingue chino/ingles, puede generar llamadas a APIs internas (consultas de pedidos, cambios de estado) con argumentos tipados y validables.
- Automatizacion de flujos empresariales: llamadas a funciones de CRM, ERP o ticketing donde el nombre de la funcion y los argumentos deben coincidir literalmente con el esquema.
- Enrutamiento de consultas en sistemas RAG: el modelo puede decidir que herramienta de recuperacion invocar y con que parametros (indice, filtros, rango temporal) segun el esquema declarado.
- Generacion de codigo de integracion: producir propuestas de llamada que un cliente OpenAI-compatible (como `infer_heads.py`) imprime y valida antes de ejecutar, util para pruebas de contrato de APIs.
- Evaluacion y diagnostico de tool calling: servir como referencia para medir la fiabilidad de llamadas en entornos controlados con el set SimpleTool-Diagnostic-800.
- Sistemas de automatizacion de acciones moviles o de escritorio: el esquema de seis argumentos permite mapear acciones con multiples parametros (destino, fecha, filtros) de forma estructurada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre SimpleTool-Diagnostic-800 (800 casos sinteticos, 400 zh y 400 en), medidos en este checkpoint FP8 con computo BF16, muestreo greedy (temperatura 0, semilla 1107, maximo 128 tokens generados por cabeza activa):

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 190 | 200 |
| Contrafactual ingles | 195 | 200 |
| Bilingue dificil | 144 | 200 |
| Bilingue multi-argumento | 153 | 200 |
| **Todas las llamadas requeridas** | **682 (85,250%)** | **800** |
| Solo nombre de funcion | 792 (99,000%) | 800 |

Referencia adicional del autor: los pesos BF16 con computo BF16 obtuvieron 685/800 llamadas requeridas y 791/800 nombres de funcion. El autor advierte que estos son scores de diagnostico sintetico local del proyecto, que los registros pareados estan correlacionados, que las etiquetas pueden contener errores residuales y que el set no es un benchmark oficial BFCL/Mobile Actions ni de usuarios en produccion. No se reclama ninguna ley de escalado controlada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 406,2 GB en FP8; se necesita un nodo multi-GPU con al menos esa capacidad agregada para cargar el checkpoint completo, mas overhead de activaciones y KV cache.
- GPU recomendadas: nodos con GPUs de centro de datos (A100, H100) en configuracion multi-GPU; no es viable en una sola GPU consumer.
- No cabe en GPUs consumer (RTX 4090, 3090, etc.) por el tamano del checkpoint.
- Opciones de despliegue: backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint; el autor proporciona `infer_heads.py`, un cliente compatible con la API de completions de OpenAI que imprime propuestas de llamada y nunca ejecuta herramientas.
- Computo: para FP8 debe usarse computo BF16. Con computo FP16 se diagnostico un desbordamiento en el intermedio de los shared experts que puede producir generacion invalida; el computo BF16 resolvio ese problema sin cambiar los pesos FP8.
- Latencia y throughput: no se reclama ningun resultado de latencia ni throughput en la informacion disponible; el autor indica que el cliente no garantiza una unica operacion fisica de shared-prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8 | 403,4 B (MoE) | no disponible | Ocho cabezas dedicadas, argumentos tipados | Apache 2.0 | Hugging Face (72 descargas) |
| Qwen/Qwen3.5-397B-A17B (base) | 397 B (MoE, A17B) | no disponible | Generacion de llamadas como texto | Apache 2.0 (segun nombre del modelo base) | Hugging Face |
| Alternativas de tool calling de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento del modelo base ni de terceros comparables para contrastar los scores del set de diagnostico.

## Limitaciones y advertencias

- Los scores reportados son de un set sintetico local del proyecto (SimpleTool-Diagnostic-800), no de un benchmark oficial como BFCL o Mobile Actions, y no deben interpretarse como rendimiento en produccion.
- Los registros pareados del set de diagnostico estan correlacionados y las etiquetas pueden contener errores residuales.
- El modelo solo declara soporte de chino e ingles; no se garantiza calidad en otros idiomas.
- El protocolo de prompt es estricto: para modelos de 9B o superiores debe usarse *empty-think*; sustituir el prompt invalida la comparacion con los scores reportados.
- Para FP8 es obligatorio el computo BF16; usar FP16 puede producir generacion invalida por desbordamiento en los shared experts.
- El orden de las propiedades del esquema debe coincidir con el binding de `arg1`…`argN`, y `required` debe respetar ese mismo orden; un esquema mal ordenado degrada la precision.
- Las cabezas de argumentos no se condicionan a la salida de la funcion generada, por lo que el llamante debe validar la coherencia funcion-argumentos.
- Los llamantes deben validar toda llamada producida por el modelo antes de ejecutarla; el cliente de ejemplo nunca ejecuta herramientas.
- No se reporta benchmark visual a pesar de retener componentes visuales del export fuente.
- No se reclama latencia ni throughput; el despliegue requiere hardware multi-GPU de centro de datos.
- La licencia del dataset es independiente (CC BY 4.0) de la del modelo (Apache 2.0).
- Riesgo de alucinacion en nombres de funcion o valores de argumentos no contemplado por el esquema; el 99,000% de acierto en nombre de funcion deja un 1% de fallo en el set de diagnostico.
- No se detalla en la informacion disponible el reparto exacto de parametros activos ni la longitud de contexto del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Contrato de serving (INFERENCE.md en el repo del modelo): https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8/blob/main/INFERENCE.md
- Cliente de inferencia (infer_heads.py en el repo del modelo): https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-397B-A17B-8Head-5pct-FP8/blob/main/infer_heads.py
