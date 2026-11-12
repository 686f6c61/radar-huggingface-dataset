# Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-BF16

## Resumen

SimpleTool-Qwen3.5-2B-8Head-5pct-BF16 es un checkpoint afinado de Qwen3.5-2B desarrollado por Cialtion, orientado especificamente a la generacion de llamadas a funciones (tool calling) mediante una arquitectura de multiples cabezas de decodificacion. En lugar de generar una unica secuencia de texto con la llamada serializada, el modelo expone ocho ramas logicas independientes —`content`, `function` y `arg1` a `arg6`— que comparten el backbone y decodifican de forma autorregresiva paralela. El checkpoint corresponde a la fraccion del 5% del cronograma de datos de entrenamiento del proyecto (no a una poda del modelo) y se distribuye ya fusionado en BF16, sin necesidad de LoRA externa.

El modelo resuelve un problema concreto: la fiabilidad estructural en la generacion de llamadas a herramientas, separando la seleccion de funcion de la generacion de argumentos en cabezas dedicadas. Con 2.274.069.824 parametros y un contexto heredado de la familia Qwen3.5, esta pensado para entornos con recursos limitados donde se requiere un comportamiento de function calling predecible y verificable. La model card reporta un 47,000% de llamadas requeridas correctas y un 92,875% de acierto en el nombre de funcion sobre el conjunto diagnostico interno SimpleTool Diagnostic 800.

Es relevante ahora porque los flujos agente y de orquestacion de herramientas exigen modelos pequenos con salidas estructuradas fiables. Este checkpoint apuesta por una interfaz de decodificacion distinta a la convencional (JSON en texto libre) y publica su contrato de inferencia y un cliente de referencia. No obstante, el autor advierte explicitamente de que el artefacto BF16 no ha sido evaluado de forma independiente en inferencia y que las puntuaciones publicadas provienen de ejecuciones en INT4/FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con ocho cabezas logicas de decodificacion autorregresiva paralela (`content`, `function`, `arg1`–`arg6`) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 nativo (artefacto publicado); ejecuciones de referencia en INT4/FP16 y FP16; recomendacion de computo BF16 para pesos FP8 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 (dataset asociado bajo CC BY 4.0) |
| Formato de pesos | safetensors (BF16, con tensores de estado designados en FP32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de la familia Qwen, y anade una capa de cabezas logicas multiples sobre el mismo backbone. Las ocho ramas (`content`, `function`, `arg1` a `arg6`) comparten los pesos del modelo base y decodifican de forma autorregresiva independiente. Los argumentos se vinculan al orden de las propiedades declaradas en el esquema de la herramienta: `arg1` corresponde a la primera propiedad requerida, `arg2` a la segunda, y asi sucesivamente. La cabeza `function` y la de mayor aridad entre las herramientas candidatas se lanzan simultaneamente, y las cabezas sobrantes se ignoran segun el esquema de la funcion predicha. El token `<|null|>` representa ranuras omitidas o no utilizadas, y cada rama se detiene en su marcador de cierre correspondiente del tokenizer del checkpoint.

El checkpoint guardado corresponde al paso de entrenamiento 2474 y a la fraccion del 5% del cronograma de datos del proyecto. Incluye el tokenizer entrenado y los 17 tokens especiales de apertura/cierre/nulo entrenados. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El conjunto de diagnostico asociado, SimpleTool Diagnostic 800, contiene 800 casos sinteticos emparejados de llamada unica (400 en chino y 400 en ingles), sin ejecucion real de herramientas ni generacion de la cabeza `content` durante la evaluacion. La innovacion tecnica principal es la decodificacion por cabezas paralelas con contrato de prompt explicito: parametros requeridos primero, orden de `required` alineado y protocolo `direct` (marcador de cabeza tras el prefijo del asistente) para modelos de 0,8B/2B/4B, o `empty-think` (bloque `<think>` vacio explicito antes del marcador) para 9B en adelante.

## Capacidades

- Generacion de llamadas a funciones estructuradas mediante cabezas dedicadas, con separacion entre seleccion de funcion y generacion de argumentos.
- Soporte de hasta seis argumentos por llamada (`arg1` a `arg6`), vinculados al orden de propiedades del esquema de la herramienta.
- Manejo de ranuras omitidas o no utilizadas mediante el token especial `<|null|>`.
- Decodificacion autorregresiva paralela de multiples ramas sobre un backbone compartido.
- Capacidad de generacion de contenido textual a traves de la cabeza `content` (aunque no se evalua en el diagnostico publicado).
- Soporte bilingue chino e ingles.
- Integracion con clientes compatibles con la API de completions de OpenAI mediante el script de referencia `infer_heads.py`.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling convencional en texto libre ni modos de razonamiento extendido mas alla del protocolo `empty-think`.

## Casos de uso

- Orquestacion de agentes con herramientas en produccion: el modelo propone llamadas con funcion y argumentos en cabezas separadas, lo que permite validar estructuralmente cada campo antes de ejecutar la herramienta. Es adecuado porque el contrato de inferencia define explicitamente como mapear propiedades a cabezas y como detener cada rama.
- Despliegue en entornos con GPU de consumo: con 2,27 mil millones de parametros y pesos BF16, el checkpoint cabe en GPUs de gama media y permite servir function calling sin infraestructura dedicada de gran escala.
- Asistentes conversacionales bilingues (chino/ingles): la cabeza `content` permite generar la respuesta al usuario mientras las cabezas de funcion resuelven la llamada, en escenarios de atencion al cliente con herramientas de consulta.
- Pipelines de automatizacion interna con APIs acotadas: para conjuntos de herramientas con esquemas estables de hasta seis parametros requeridos, el modelo puede generar propuestas de llamada que un validador posterior acepte o rechace antes de la ejecucion.
- Investigacion sobre decodificacion multi-cabeza: el checkpoint y su script de inferencia sirven como base reproducible para estudiar estrategias de generacion estructurada frente a la serializacion JSON en texto libre.
- Evaluacion comparativa de fiabilidad en tool calling: el conjunto SimpleTool Diagnostic 800 y sus scorers permiten medir acierto de nombre de funcion y de llamada completa con tipos estrictos y valores literales.
- Prototipado rapido de integraciones agente: el cliente compatible con OpenAI permite conectar el modelo a frameworks existentes que esperan un endpoint de completions, imprimiendo propuestas de llamada sin ejecutar herramientas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre SimpleTool Diagnostic 800 (800 casos sinteticos, 400 en chino y 400 en ingles). Medidos en INT4/FP16, muestreo greedy, temperatura 0, semilla 1107, maximo 128 tokens generados por cabeza activa y protocolo de prompt `direct`. No son resultados del artefacto BF16 publicado.

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 137 | 200 |
| Contrafactual ingles | 136 | 200 |
| Dificil bilingue | 58 | 200 |
| Multi-argumento bilingue | 45 | 200 |
| **Todas las llamadas requeridas** | **376 (47,000%)** | **800** |
| Solo nombre de funcion | 743 (92,875%) | 800 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL, Mobile Actions) en la informacion disponible. El autor indica que el conjunto es de diagnostico local del proyecto, con registros emparejados correlacionados y posibles errores residuales en las etiquetas, y que no establece una ley de escalado controlada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,5 GB solo para pesos (2,27 mil millones de parametros a 2 bytes), mas overhead de activaciones, cache KV y las ocho cabezas de decodificacion.
- VRAM estimada en INT4: alrededor de 1,2 a 1,5 GB para pesos, mas overhead; el autor reporta ejecuciones de referencia en INT4/FP16.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo encaja en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en datacenter, A100 y H100 son sobredimensionadas para un modelo denso de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6 GB o mas de VRAM en BF16, y en GPUs con 4 GB o mas en INT4.
- Opciones de despliegue: se requiere un backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint. El autor proporciona `infer_heads.py` como cliente compatible con la API de completions de OpenAI. No se confirma en la informacion disponible soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se reclama ningun resultado de latencia ni throughput. El autor advierte que el cliente de referencia no garantiza una unica operacion fisica de prefill compartido.
- Nota de precision: para pesos FP8 debe usarse computo BF16; el autor documenta un desbordamiento del intermedio de expertos compartidos en configuraciones FP8 con computo FP16 en el modelo de 397B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-2B-8Head-5pct-BF16 | 2,27 B | no disponible | Ocho cabezas paralelas dedicadas | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (modelo base) | no disponible en la informacion proporcionada | no disponible | Generacion en texto libre | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de ~2B con function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria que permitan una comparacion cuantitativa. La unica referencia directa es el modelo base Qwen3.5-2B, del que este checkpoint hereda el backbone y sobre el que anade la interfaz de cabezas multiples.

## Limitaciones y advertencias

- El artefacto BF16 publicado no ha sido evaluado de forma independiente en inferencia; las puntuaciones de la model card corresponden a ejecuciones en INT4/FP16 del checkpoint del 5% y no deben atribuirse al BF16 sin remeasure.
- El conjunto de evaluacion es sintetico y local del proyecto: 800 casos emparejados, con correlacion entre registros y posibles errores residuales en las etiquetas. No equivale a BFCL, Mobile Actions ni a datos de usuarios reales en produccion.
- Las cabezas de argumentos no estan condicionadas por la salida recien generada de la cabeza `function`, lo que puede producir incoherencias entre funcion y argumentos en casos limite.
- El contrato de prompt es estricto: requiere parametros requeridos primero, orden de `required` alineado y protocolo `direct` o `empty-think` segun el tamano. Cambiar el prompt o la precision almacenada invalida la comparacion con las puntuaciones publicadas.
- El modelo solo soporta chino e ingles; no se documentan otros idiomas.
- No se especifican en la informacion disponible la longitud de contexto efectiva ni el comportamiento en conversaciones de muchos turnos.
- Riesgo de alucinacion en la seleccion de funcion y en valores de argumentos: el autor exige que las aplicaciones validaden las llamadas generadas antes de ejecutarlas. El cliente de referencia imprime propuestas y nunca ejecuta herramientas.
- No se reclaman resultados de latencia ni throughput; el cliente no garantiza prefill compartido fisico.
- Requiere un backend compatible con la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion; la portabilidad a stacks de inferencia habituales no esta confirmada.
- Licencia Apache 2.0 para el modelo, con la licencia upstream retenida en `LICENSE`; la licencia del dataset es independiente (CC BY 4.0).
- El checkpoint conserva componentes visuales alli donde existian en la exportacion de origen, pero no se reporta ningun benchmark visual a nivel de release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-BF16
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Contrato de inferencia (INFERENCE.md): https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-BF16/blob/main/INFERENCE.md
- Cliente de referencia (infer_heads.py): https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-2B-8Head-5pct-BF16/blob/main/infer_heads.py
