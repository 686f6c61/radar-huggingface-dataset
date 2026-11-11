# Cialtion/SimpleTool-Qwen3.6-35B-A3B-8Head-5pct-FP8

## Resumen

SimpleTool-Qwen3.6-35B-A3B-8Head-5pct-FP8 es un checkpoint derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario Cialtion, orientado especificamente a la generacion de llamadas a herramientas (tool calling). El modelo incorpora una modificacion estructural denominada SimpleTool de ocho cabezas logicas: una rama `content`, una rama `function` y seis ramas de argumentos `arg1` a `arg6`, que comparten el backbone del modelo base y generan de forma autorregresiva e independiente. El sufijo "5pct" hace referencia a una fraccion de datos de entrenamiento del proyecto, no a una poda del modelo.

El modelo base es un MoE de Qwen con 35.951.822.704 parametros totales (segun los safetensors del repositorio) y activacion de aproximadamente 3B, segun la nomenclatura A3B. El checkpoint se distribuye en formato FP8 E4M3, con determinados tensores designados (BF16/FP32), componentes de vision y embeddings de salida/token retenidos segun la configuracion de cuantizacion; no es un artefacto FP8 de todos los tensores. El repositorio ocupa 37,5 GB.

Su relevancia radica en que propone un contrato de inferencia distinto al tool calling convencional: en lugar de generar la llamada como texto libre, el modelo emite la funcion y los argumentos por ramas separadas, con marcadores especiales de apertura, cierre y nulo. El autor reporta un 80,375% de llamadas completas correctas y un 98,250% de acierto en el nombre de funcion sobre un conjunto diagnostico sintetico propio de 800 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabezas logicas adicionales SimpleTool (`content`, `function`, `arg1`-`arg6`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin cifra oficial en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (checkpoint publicado), con tensores designados en BF16/FP32; el autor recomienda computo BF16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (dataset asociado bajo CC BY 4.0) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) segun la etiqueta `qwen3_5_moe` del repositorio. Sobre ese backbone, el proyecto SimpleTool anade ocho ramas logicas que comparten los pesos del modelo y decodifican de forma autorregresiva independiente: una rama `content`, una rama `function` y seis ramas de argumentos. El tokenizador entrenado y los 17 tokens especiales de apertura, cierre y nulo estan incluidos en el checkpoint. No se requiere LoRA externo ni un checkpoint base adicional.

El entrenamiento se realizo sobre un schedule etiquetado como "5% training-data", que segun el autor indica la fraccion de datos de entrenamiento del proyecto y no un porcentaje de poda. La evaluacion reportada se hizo sobre el conjunto sintetico Cialtion/SimpleTool-Diagnostic-800: 800 casos emparejados de llamada unica, 400 en chino y 400 en ingles, sin ejecucion real de herramientas y sin generacion de la cabeza de contenido. El protocolo de prompt recomendado para modelos de 9B o superiores es `empty-think`, que inserta un bloque explicito `<think>\n\n</think>\n\n` antes del marcador de cabeza; para los runs historicos de 0.8B/2B/4B en INT4 se usaba el modo `direct`. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de llamadas a herramientas con funcion y argumentos emitidos por ramas separadas, con tipos estrictos y valores literales.
- Seleccion de funcion entre un conjunto de candidatos, con reporte de un 98,250% de acierto en el nombre de funcion en el diagnostico propio.
- Relleno de hasta seis argumentos por llamada, con marcador `<|null|>` para slots omitidos o no usados.
- Generacion de texto conversacional a traves de la rama `content`.
- Soporte bilingue chino e ingles.
- Compatibilidad con un cliente de completions compatible con OpenAI (`infer_heads.py`), que imprime propuestas de llamada sin ejecutar herramientas.
- Componentes visuales retenidos del export de origen, aunque el autor no reporta benchmark visual para esta release.
- No se documenta en la informacion disponible soporte explicito de agentes multi-paso, thinking mode extendido ni audio.

## Casos de uso

- Integracion de tool calling en asistentes conversacionales: el modelo puede proponer llamadas estructuradas a APIs internas emitiendo funcion y argumentos por ramas, lo que simplifica el parseo frente a la generacion de JSON en texto libre.
- Automatizacion de back-office con validacion previa: el cliente de referencia imprime las propuestas sin ejecutarlas, de modo que un orquestador puede validar tipos y valores antes de invocar la herramienta real.
- Enrutamiento de funciones en entornos con catalogo acotado: el alto acierto reportado en el nombre de funcion lo hace adecuado para seleccionar la herramienta correcta entre un conjunto de candidatos definido por esquema.
- Asistentes bilingues zh/en para atencion al cliente: el soporte de ambos idiomas y la rama `content` permiten alternar respuesta conversacional y propuesta de accion.
- Pipelines de integracion con sistemas empresariales: la vinculacion determinista de `arg1`-`argN` al orden de `properties` y `required` facilita generar llamadas a APIs con esquemas estables.
- Evaluacion y diagnostico de tool calling: el modelo y el dataset asociado sirven como banco de pruebas para medir precision de llamadas completas y de seleccion de funcion en entornos controlados.
- Prototipado de agentes con intervencion humana: al no ejecutar herramientas por si mismo, encaja en flujos donde una persona o un validador aprueba cada llamada antes de su ejecucion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre SimpleTool Diagnostic 800 (FP8 con computo FP16, muestreo greedy, temperatura 0, semilla 1107, maximo 128 tokens generados por cabeza activa, protocolo `empty-think`):

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 188 | 200 |
| Contrafactual ingles | 192 | 200 |
| Bilingue dificil | 117 | 200 |
| Bilingue multi-argumento | 146 | 200 |
| **Todas las llamadas requeridas** | **643 (80,375%)** | **800** |
| Solo nombre de funcion | 786 (98,250%) | 800 |

El autor advierte que se trata de puntuaciones diagnosticas sinteticas locales, que los registros emparejados estan correlacionados, que las etiquetas pueden contener errores residuales y que el conjunto no es un benchmark de usuarios en produccion ni el BFCL o Mobile Actions oficial. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 37,5 GB en FP8; se necesita al menos esa cifra de memoria para cargar los pesos, mas overhead de activaciones y cache KV. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el checkpoint FP8 requiere GPUs de clase数据中心 con 48-80 GB o superiores; no se confirma compatibilidad con GPUs de consumo.
- Ajuste en GPU de consumo: no confirmado. El tamano del repositorio (37,5 GB) supera la VRAM de las GPUs de consumo habituales de 24 GB.
- Opciones de despliegue: el autor exige un backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint. Se incluye `infer_heads.py` como cliente compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explicita.
- Precision de computo: el autor recomienda BF16 para FP8; senala que en el caso de 397B FP8 con computo FP16 se diagnostico un desbordamiento en el intermedio de shared-expert que puede producir generacion invalida. Los resultados historicos de 35B y 122B se midieron con FP16 y no se han remedido bajo BF16.
- Latencia y throughput: no se reclama ningun resultado de latencia ni de rendimiento, y el cliente no garantiza una operacion fisica unica de shared-prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.6-35B-A3B-8Head-5pct-FP8 | 35.951.822.704 | no disponible | Cabezas logicas dedicadas (function + 6 argumentos) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (A3B) | no disponible | Tool calling generativo convencional | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Las puntuaciones reportadas provienen de un conjunto diagnostico sintetico propio, con registros correlacionados y posibles errores de etiquetado; no equivalen a un benchmark oficial ni a rendimiento en produccion.
- El autor no reclama ley de escalado controlada a partir de estos resultados.
- El modelo no ejecuta herramientas: cualquier llamada propuesta debe validarse antes de su ejecucion.
- El protocolo de prompt es estricto: el orden de `properties` y `required` determina la vinculacion de `arg1`-`argN`; alterar el orden o sustituir el prompt invalida la comparacion con las puntuaciones reportadas.
- Para FP8 se recomienda computo BF16; usar FP16 puede provocar desbordamientos en el intermedio de shared-expert en configuraciones grandes.
- Los resultados historicos de 35B y 122B se midieron con FP16 y no se han remedido bajo BF16.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano.
- No se reportan benchmarks visuales pese a retener componentes de vision del export de origen.
- No se reclaman cifras de latencia ni throughput.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 para el modelo; el dataset asociado tiene licencia CC BY 4.0, independiente de la del modelo.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.6-35B-A3B-8Head-5pct-FP8
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Contrato de servicio: INFERENCE.md (referenciado en el repositorio del modelo)
- Cliente de referencia: infer_heads.py (referenciado en el repositorio del modelo)
