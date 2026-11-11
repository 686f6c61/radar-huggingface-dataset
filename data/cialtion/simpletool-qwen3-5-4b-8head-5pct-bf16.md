# Cialtion/SimpleTool-Qwen3.5-4B-8Head-5pct-BF16

## Resumen

SimpleTool-Qwen3.5-4B-8Head-5pct-BF16 es un checkpoint ajustado (fine-tune) del modelo Qwen3.5-4B de Alibaba, publicado por el usuario Cialtion bajo licencia Apache 2.0. Su particularidad es que implementa una arquitectura de "ocho cabezas" (eight-head) para tool calling: en lugar de generar una llamada a funcion como texto plano, el modelo emplea ocho ramas logicas independientes (`content`, `function`, `arg1` a `arg6`) que comparten el backbone y decodifican de forma autorregresiva. El objetivo es estructurar la propuesta de llamada a herramienta en campos separados y verificables.

El modelo cuenta con 4.659.865.088 parametros (aproximadamente 4,66 mil millones) almacenados en formato BF16, con un tamano de repositorio de 9,3 GB. Esta entrenado sobre el modelo base Qwen/Qwen3.5-4B y soporta los idiomas chino e ingles. La etiqueta "5pct" hace referencia a la fraccion de datos de entrenamiento del proyecto, no a una poda del modelo.

Es relevante porque propone un enfoque alternativo al tool calling generativo convencional: separar la seleccion de funcion y la generacion de cada argumento en cabezas dedicadas, lo que facilita la validacion estricta de tipos y valores. El checkpoint corresponde al paso de entrenamiento 2353 y no ha sido evaluado de forma independiente en inferencia para esta version BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con ocho cabezas logicas de decodificacion autorregresiva (`content`, `function`, `arg1`-`arg6`) que comparten el backbone |
| Parametros totales | 4.659.865.088 (aprox. 4,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (formato almacenado); el autor menciona INT4/FP16 en las ejecuciones de referencia y advierte sobre el uso de computo BF16 con pesos FP8 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, con tensores de estado FP32 designados) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen3.5-4B y anade ocho ramas logicas que comparten los mismos pesos troncales pero decodifican de forma autorregresiva e independiente. La rama `function` predice la funcion a invocar y las ramas `arg1` a `arg6` generan cada argumento por separado. El tokenizer entrenado incluye 17 tokens especiales de apertura, cierre y nulo (`<|null|>`) para delimitar cada rama. El checkpoint guardado corresponde al paso 2353 de un schedule de entrenamiento basado en el 5% de los datos del proyecto.

El entrenamiento se apoya en el dataset sintetico Cialtion/SimpleTool-Diagnostic-800, compuesto por 800 casos pareados de llamada unica (400 en chino y 400 en ingles). El autor no detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset, ni si se emplearon tecnicas de RLHF o DPO. Una innovacion destacable es que las cabezas de argumentos no estan condicionadas por la salida de la funcion recien generada, lo que segun el autor permite ignorar las colas no utilizadas segun el esquema de la funcion predicha. La decodificacion debe detenerse en el marcador de cierre correspondiente de cada rama.

## Capacidades

- Generacion de texto conversacional a partir del backbone Qwen3.5-4B.
- Tool calling estructurado mediante ocho cabezas: seleccion de funcion mas hasta seis argumentos independientes.
- Representacion de argumentos omitidos o no usados mediante el token especial `<|null|>`.
- Validacion estricta de tipos y valores literales en los argumentos generados.
- Soporte de prompt directo (marcador de cabeza anexado al prefijo del asistente) y de prompt con bloque `<think>` vacio para modelos de mayor tamano.
- Capacidades multilingues limitadas a chino e ingles.
- No se reportan capacidades de vision, audio ni modo de razonamiento extendido verificadas en esta version BF16.

## Casos de uso

- Integracion en pipelines de agentes con validacion estricta: el modelo propone llamadas con funcion y argumentos en campos separados, lo que permite validar tipos y valores antes de ejecutar cualquier herramienta, reduciendo el riesgo de llamadas malformadas.
- Automatizacion de APIs internas: al separar `function` de `arg1`-`arg6`, un orquestador puede mapear cada cabeza a un parametro concreto del esquema OpenAPI y rechazar propuestas incompletas.
- Sistemas de atencion al cliente con herramientas acotadas: el modelo puede seleccionar entre funciones candidatas y rellenar argumentos como identificadores de pedido o fechas, siempre que el llamante valide la salida antes de ejecutar.
- Enrutamiento de consultas a servicios: uso de la cabeza `function` como clasificador de intencion y de las cabezas de argumentos para extraer entidades necesarias para la llamada.
- Evaluacion y benchmarking de tool calling: el checkpoint sirve como referencia para comparar el enfoque de cabezas multiples frente a la generacion de JSON plano en tareas de llamada unica.
- Prototipado de asistentes bilingues chino-ingles: adecuado para entornos donde solo se requieren esos dos idiomas y se necesita una huella de memoria moderada (modelo de ~4,66 mil millones de parametros).
- Investigacion sobre decodificacion estructurada: util para estudiar como se comportan cabezas independientes que comparten backbone y como afecta el orden de las propiedades del esquema al acierto de argumentos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el dataset sintetico SimpleTool Diagnostic 800 (800 casos, 400 en chino y 400 en ingles). El autor indica que las cifras corresponden a una ejecucion de referencia del checkpoint de entrenamiento al 5% en INT4/FP16, no a una evaluacion verificada de este artefacto BF16.

| Conjunto de evaluacion | Llamadas requeridas correctas | Casos |
|---|---:|---:|
| Contrafactual chino | 169 | 200 |
| Contrafactual ingles | 167 | 200 |
| Bilingue dificil | 91 | 200 |
| Bilingue multiargumento | 93 | 200 |
| **Todas las llamadas requeridas** | **520 (65,000%)** | **800** |
| Solo nombre de funcion | 775 (96,875%) | 800 |

El autor advierte que se trata de puntuaciones diagnosticas sinteticas locales, que los registros pareados estan correlacionados, que las etiquetas pueden contener errores residuales y que el conjunto no es un benchmark oficial BFCL ni Mobile Actions. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, mas memoria para KV cache y overhead del runtime; en la practica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion INT4: en torno a 3-4 GB para pesos, con margen adicional para el contexto.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para BF16 en un solo dispositivo.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16 y en tarjetas con 8 GB o mas en INT4, segun el runtime.
- Opciones de despliegue: el autor proporciona `infer_heads.py`, un cliente compatible con la API de completions de OpenAI. Se requiere un backend que soporte la arquitectura Qwen3.5/Qwen3.6 y el formato de cuantizacion del checkpoint. Para FP8, el autor recomienda computo BF16.
- Latencia y throughput: no se reclama ningun resultado de latencia ni de rendimiento en la informacion disponible. El cliente incluido no garantiza una operacion fisica unica de prefill compartido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-4B-8Head-5pct-BF16 | 4,66 mil millones | No disponible | Ocho cabezas dedicadas (funcion + 6 argumentos) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | No disponible en la informacion | No disponible | Generacion de texto/JSON convencional | No disponible en la informacion | Hugging Face |
| Alternativas de tool calling de ~4B | No disponible | No disponible | JSON plano o function calling nativo | No disponible | No disponible |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- El artefacto BF16 no ha sido evaluado de forma independiente en inferencia; las puntuaciones mostradas corresponden a una ejecucion INT4/FP16 del checkpoint de entrenamiento al 5%.
- El checkpoint guardado es el paso 2353, no el paso final del schedule de entrenamiento.
- El protocolo de prompt es estricto: los parametros requeridos deben ir primero en `properties` y en el mismo orden en `required`; alterar el prompt o la precision almacenada invalida la comparacion con las puntuaciones reportadas.
- Las cabezas de argumentos no estan condicionadas por la funcion recien generada, lo que puede producir desajustes entre funcion y argumentos si el esquema no se respeta.
- El modelo no ejecuta herramientas; el llamante debe validar toda llamada propuesta antes de su ejecucion.
- Los benchmarks son sinteticos, locales y correlacionados; no equivalen a BFCL ni a Mobile Actions y no establecen una ley de escalado controlada.
- Idiomas limitados a chino e ingles; no se reporta soporte de otros idiomas.
- No se reportan resultados de latencia, throughput ni benchmarks de vision a nivel de release.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; se aplican los riesgos inherentes al modelo base Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del dataset es independiente (CC BY 4.0) y debe respetarse por separado.
- Para FP8 se debe usar computo BF16; el autor documenta un desbordamiento en el intermedio de shared-expert con computo FP16 en modelos de 397B que puede producir generacion invalida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-4B-8Head-5pct-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de diagnostico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Contrato de servicio (INFERENCE.md): incluido en el repositorio del modelo
- Cliente de inferencia (infer_heads.py): incluido en el repositorio del modelo
