# Cialtion/SimpleTool-Qwen3.5-122B-A10B-8Head-5pct-FP8

## Resumen

SimpleTool-Qwen3.5-122B-A10B-8Head-5pct-FP8 es un checkpoint derivado de Qwen/Qwen3.5-122B-A10B, un modelo de arquitectura Mixture of Experts (MoE) con 125.086.497.008 parametros totales, publicado por el usuario Cialtion bajo licencia Apache 2.0. El modelo no es un ajuste generico: implementa una variante denominada "SimpleTool eight-head", en la que la cola de generacion se divide en ocho ramas logicas (`content`, `function` y `arg1` a `arg6`) que comparten el backbone y decodifican de forma autorregresiva e independiente. El objetivo es especializar el modelo en la generacion estructurada de llamadas a herramientas (tool calling), separando la seleccion de funcion de la emision de argumentos.

La etiqueta "5pct" hace referencia a la fraccion de datos de entrenamiento empleada en el schedule del proyecto, no a una poda del modelo. El checkpoint se almacena en FP8 (E4M3), con determinados tensores designados, componentes de vision y embeddings de salida retenidos segun la configuracion de cuantizacion; no es un artefacto FP8 de todos los tensores. El repositorio ocupa 127,2 GB e incluye el tokenizador entrenado y 17 tokens especiales de apertura, cierre y nulo.

Su relevancia actual radica en la evaluacion publicada sobre el conjunto sintetico SimpleTool Diagnostic 800, donde alcanza un 83,500% de llamadas requeridas correctas (668 de 800) y un 98,375% de acierto en el nombre de funcion (787 de 800). Es, por tanto, un artefacto de investigacion orientado a evaluar la fiabilidad de la generacion estructurada de llamadas, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabecera multi-rama de 8 cabeceras |
| Parametros totales | 125.086.497.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) con tensores BF16/FP32 designados; computo recomendado en BF16 (FP16 en las mediciones historicas de 35B/122B) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 (licencia upstream retenida en `LICENSE`; el dataset es CC BY 4.0) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-122B-A10B, un transformer con mezcla de expertos segun la etiqueta `qwen3_5_moe`. Sobre ese backbone se anade una cabeza de generacion dividida en ocho ramas logicas: `content`, `function` y `arg1` a `arg6`. Las ocho ramas comparten el backbone y decodifican de forma autorregresiva independiente, de modo que la seleccion de funcion y la emision de cada argumento se realizan en ramas separadas. El tokenizador entrenado y los 17 tokens especiales de apertura, cierre y nulo (`<|null|>`) acompanan al checkpoint.

El entrenamiento se realizo sobre el schedule del proyecto con una fraccion del 5% de los datos, segun la nomenclatura del autor. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. La evaluacion publicada se realizo sobre SimpleTool Diagnostic 800, un conjunto congelado de 800 casos sinteticos emparejados de llamada unica (400 en chino y 400 en ingles), con muestreo greedy, temperatura 0, semilla 1107 y un maximo de 128 tokens generados por cabecera activa. El protocolo de prompt empleado es "empty-think": para modelos de 9B o superiores se anade un bloque explicito `<think>\n\n</think>\n\n` antes del marcador de cabecera; para los runs historicos de 0,8B/2B/4B en INT4 se usa el modo "direct".

Una innovacion tecnica destacable es el contrato de inferencia: los parametros requeridos deben colocarse primero en las `properties` de la herramienta, manteniendo el mismo orden en `required`, y las cabeceras `arg1` a `argN` se vinculan a ese orden de propiedades. Se lanza `function` junto con la aridad maxima entre las herramientas candidatas (hasta seis argumentos) y se ignoran las ranuras sobrantes segun el esquema de la funcion predicha. Las cabeceras de argumento no estan condicionadas por la salida de la funcion recien generada.

## Capacidades

- Generacion de texto conversacional y generacion condicional multi-rama.
- Tool calling estructurado: seleccion de funcion y emision de hasta seis argumentos en cabeceras separadas.
- Emision de valores nulos o ranuras omitidas mediante el token `<|null|>`.
- Razonamiento multi-paso a traves del bloque de pensamiento explicito (`empty-think`) en modelos de 9B o superiores.
- Capacidades multilingues limitadas a chino e ingles.
- Retencion de componentes de vision procedentes de la exportacion de origen, aunque no se publica benchmark visual a nivel de release.
- Soporte de cliente compatible con la API de completions de OpenAI mediante `infer_heads.py`, que imprime propuestas de llamada y nunca ejecuta herramientas.

## Casos de uso

- Evaluacion de fiabilidad en tool calling: el modelo sirve para medir la tasa de llamadas correctas (funcion y todos los argumentos con tipos estrictos) sobre conjuntos diagnosticos como SimpleTool Diagnostic 800, con un 83,500% de acierto reportado.
- Investigacion sobre cabeceras multi-rama: permite estudiar si separar la seleccion de funcion de la emision de argumentos mejora la precision estructural frente a la generacion plana en un solo flujo autorregresivo.
- Generacion de propuestas de llamada en pipelines de agentes: integrado mediante el cliente compatible con OpenAI, el modelo produce propuestas que un orquestador valida antes de ejecutar, lo que encaja en arquitecturas de agente con validacion obligatoria.
- Analisis de errores de argumentos: al disponer de cabeceras independientes por argumento, facilita el diagnostico granular de que parametro falla en cada caso, util para depurar esquemas de herramientas mal disenados.
- Experimentacion con prompts bilingues zh/en: el conjunto de evaluacion esta balanceado a 400 casos por idioma, lo que permite comparar el comportamiento del modelo en ambos idiomas bajo el mismo protocolo.
- Pruebas de cuantizacion FP8 en produccion: el checkpoint permite validar el comportamiento de pesos FP8 con computo BF16 en infraestructura que soporte esta arquitectura, y contrastar con los runs historicos en FP16.
- Benchmarking interno de esquemas de herramientas: al exigir el orden de `properties` y `required`, sirve para validar que los esquemas de herramientas de una aplicacion cumplen el contrato de inferencia antes de desplegar cualquier modelo de la familia.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre SimpleTool Diagnostic 800 (checkpoint FP8, computo FP16, muestreo greedy, temperatura 0, semilla 1107, maximo 128 tokens por cabecera activa, protocolo empty-think):

| Lote de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 186 | 200 |
| Contrafactual ingles | 189 | 200 |
| Bilingue dificil | 134 | 200 |
| Bilingue multi-argumento | 159 | 200 |
| **Todas las llamadas requeridas** | **668 (83,500%)** | **800** |
| Solo nombre de funcion | 787 (98,375%) | 800 |

El autor advierte de que se trata de puntuaciones diagnosticas sinteticas locales: los registros emparejados estan correlacionados, las etiquetas pueden contener errores residuales y el conjunto no es un benchmark oficial de BFCL ni de Mobile Actions ni de usuarios en produccion. Tampoco establece una ley de escalado controlada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 127,2 GB en FP8, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos; no se dispone de estimaciones de VRAM adicional para cache KV ni activaciones.
- GPU recomendadas: no disponible de forma explicita. El checkpoint FP8 con computo BF16 exige aceleradores con soporte de BF16 y de la arquitectura Qwen3.5/Qwen3.6; por el volumen de pesos, queda fuera de cualquier GPU de consumo individual.
- Ajuste en GPU de consumo: no cabe en GPU de consumo por el tamano del repositorio (127,2 GB).
- Opciones de despliegue: backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint. El autor proporciona `infer_heads.py` como cliente compatible con la API de completions de OpenAI e `INFERENCE.md` con el contrato de servicio. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no se reclama ningun resultado de latencia ni de throughput. El cliente no garantiza una unica operacion fisica de prefill compartido.
- Nota de precision: para FP8 debe usarse computo BF16. En el caso de 397B FP8 con computo FP16 se diagnostico un desbordamiento en el intermedio de los expertos compartidos que puede producir generacion invalida; el computo BF16 resolvio el problema sin cambiar los pesos FP8. Las puntuaciones historicas de 35B/122B usaron computo FP16 y no se han remedido con BF16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la informacion proporcionada, por lo que la comparativa de rendimiento se indica como no disponible. A continuacion se comparan los atributos estructurales conocidos:

| Modelo | Parametros totales | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SimpleTool-Qwen3.5-122B-A10B-8Head-5pct-FP8 | 125.086.497.008 | no disponible | Apache 2.0 | Tool calling con cabecera multi-rama de 8 cabeceras, FP8 |
| Qwen/Qwen3.5-122B-A10B (modelo base) | no disponible | no disponible | no disponible | Modelo base MoE de proposito general |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las puntuaciones publicadas son diagnosticas y sinteticas: 800 casos emparejados, con registros correlacionados y posibles errores residuales en las etiquetas. No equivalen a BFCL, Mobile Actions ni a datos de usuarios en produccion.
- El conjunto de evaluacion no genera la cabecera de contenido ni ejecuta herramientas, por lo que no mide la calidad del texto generado ni el exito end-to-end de una tarea.
- El modelo solo declara soporte de chino e ingles; no hay informacion sobre otros idiomas.
- La licencia es Apache 2.0, pero el dataset asociado tiene licencia separada CC BY 4.0, que debe respetarse por separado.
- El contrato de inferencia es estricto: es obligatorio ordenar `properties` y `required` de forma coherente, lanzar la aridad maxima entre las herramientas candidatas y aplicar el protocolo de prompt correcto (empty-think para 9B o superior, direct para los runs historicos INT4). Sustituir el prompt o la precision almacenada invalida la comparacion con las puntuaciones reportadas.
- Las cabeceras de argumento no estan condicionadas por la salida de la funcion recien generada, lo que puede limitar la coherencia en casos con dependencias fuertes entre funcion y argumentos.
- Riesgo de generacion invalida si se usa computo FP16 en lugar de BF16 en configuraciones de gran tamano (desbordamiento diagnosticado en el intermedio de expertos compartidos del caso 397B FP8).
- Los llamadores de aplicacion deben validar las llamadas producidas por el modelo antes de ejecutarlas; el cliente de referencia nunca ejecuta herramientas.
- No se reclaman resultados de latencia ni de throughput, ni se garantiza una unica operacion fisica de prefill compartido.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni datos sobre sesgos conocidos o tasa de alucinacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-122B-A10B-8Head-5pct-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de evaluacion: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Contrato de servicio: `INFERENCE.md` (incluido en el repositorio del modelo)
- Cliente de inferencia: `infer_heads.py` (incluido en el repositorio del modelo)
