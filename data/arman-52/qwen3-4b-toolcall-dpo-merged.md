# arman-52/qwen3-4b-toolcall-dpo-merged

## Resumen

arman-52/qwen3-4b-toolcall-dpo-merged es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario arman-52, orientado especificamente a la generacion de llamadas a herramientas (tool calling) con salida JSON estricta conforme a esquemas y a la abstencion determinista cuando ninguna herramienta disponible puede satisfacer la peticion. El modelo parte de la arquitectura transformer densa de Qwen3 con 4.022.468.096 parametros y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 8,1 GB.

El problema que aborda es la fiabilidad de la salida estructurada en pipelines de agentes: en lugar de generar texto libre que luego hay que parsear, el modelo emite directamente un objeto JSON con la clave `tool_calls` o un objeto vacio cuando procede abstenerse. Para ello se aplico un pipeline de post-entrenamiento en dos etapas: QLoRA SFT sobre 6.000 ejemplos validados contra esquema del dataset Salesforce/xlam-function-calling-60k (con un 20% de prompts negativos de abstencion) y posterior DPO sobre pares de preferencia minados de los fallos del SFT en una particion de validacion de 1.200 ejemplos.

Es relevante ahora porque los flujos de agentes exigen tasas altas de validez de esquema y bajas tasas de falsos positivos en invocaciones de herramientas. El autor publica una evaluacion determinista sobre 200 casos congelados y libres de contaminacion (160 llamadas positivas simples, multiples y anidadas, mas 40 casos de abstencion) que permite comparar el ajuste frente al modelo base en cero y tres ejemplos. El modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado con QLoRA y DPO |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo en bfloat16; pesos publicados en safetensors (BF16 presumiblemente, no confirmado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507. El post-entrenamiento se realizo en dos etapas sobre esa base. La primera etapa consistio en un QLoRA SFT con rango 16 y `lora_alpha=32`, `lora_dropout=0.05`, aplicado a todas las capas lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con schedule coseno, learning rate 2e-4 y empaquetado de secuencias a `max_seq_length=1536`. El conjunto de entrenamiento fueron 6.000 ejemplos del dataset Salesforce/xlam-function-calling-60k validados contra esquema, de los cuales un 20% eran prompts negativos o de abstencion.

La segunda etapa aplico DPO sobre pares `{prompt, chosen, rejected}` extraidos de los casos de fallo del checkpoint SFT en una particion de validacion retenida de 1.200 ejemplos: errores de sintaxis, violaciones de esquema, argumentos requeridos ausentes e invocaciones falsas positivas en prompts de abstencion. La configuracion de DPO fue `beta=0.1`, learning rate coseno 5e-6 y modelo de referencia igual al checkpoint SFT. El entrenamiento uso cuantizacion 4-bit NF4 con `bitsandbytes` y doble cuantizacion, con `bfloat16` como dtype de computo. No se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de llamadas a herramientas en JSON crudo conforme al contrato `{"tool_calls": [{"name": ..., "arguments": {...}}]}`.
- Soporte de llamadas simples, multiples y anidadas dentro de una misma respuesta.
- Abstencion determinista: devuelve `{"tool_calls": []}` cuando ninguna herramienta proporcionada puede resolver la peticion.
- Cumplimiento estricto de JSON Schema sobre los argumentos de cada herramienta.
- Generacion de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Capacidad de seguir instrucciones y plantillas de herramientas inyectadas en el prompt.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Orquestacion de agentes con herramientas: el modelo emite directamente el objeto `tool_calls` que un runtime de agentes puede parsear sin capa intermedia de extraccion, reduciendo errores de formato en produccion.
- Enrutamiento de peticiones a APIs internas: dado un catalogo de funciones descrito en JSON Schema, el modelo selecciona la funcion correcta y rellena los argumentos, lo que permite construir un despachador de APIs basado en lenguaje natural.
- Atencion al cliente con backend de acciones: el modelo decide entre responder en texto o invocar funciones como consulta de pedido, cancelacion o escalado, y se abstiene cuando la peticion queda fuera del catalogo de herramientas.
- Automatizacion de flujos RPA y back-office: traduccion de instrucciones en lenguaje natural a llamadas estructuradas a sistemas legacy expuestos como funciones, con validacion de esquema previa a la ejecucion.
- Evaluacion y test de pipelines de tool calling: al incluir un contrato de salida fijo y casos de abstencion, sirve como componente de referencia para comparar tasas de validez de esquema en suites de evaluacion internas.
- Despliegue en entornos con recursos limitados: con 4.022 millones de parametros, es viable en una unica GPU consumer para prototipos de agentes y demos interactivas.
- Extraccion de parametros estructurados: conversion de texto libre en argumentos tipados para formularios o bases de datos, apoyandose en la validacion contra esquema.

## Benchmarks y rendimiento

Evaluacion determinista del autor sobre 200 casos congelados (160 llamadas positivas simples, multiples y anidadas; 40 casos de abstencion), excluidos de SFT y DPO:

| Checkpoint | JSON valido (%) | Esquema valido (%) | Precision nombre herramienta (%) | F1 claves de argumento (%) | F1 valores de argumento (%) | Precision abstencion (%) | Exact match global (%) |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (zero-shot) | 99,5 | 99,5 | 96,9 | 81,9 | 81,9 | 100,0 | 85,5 |
| Qwen/Qwen3-4B-Instruct-2507 (3-shot) | 100,0 | 100,0 | 97,5 | 83,1 | 83,1 | 100,0 | 86,5 |
| QLoRA SFT (BF16) | 100,0 | 99,5 | 96,9 | 82,5 | 82,5 | 100,0 | 86,0 |

La model card no publica la fila correspondiente al checkpoint final tras DPO ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 12-16 GB para contexto moderado.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 4-5 GB de pesos.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 2,5-3 GB de pesos, con margen adicional para cache KV.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090, L40S y A10G para inferencia en BF16 con una sola GPU.
- GPU consumer: cabe en RTX 4090 y RTX 3090 en BF16; en RTX 4070/4080 y GPUs de 12-16 GB es recomendable cuantizar a 8-bit o 4-bit.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arman-52/qwen3-4b-toolcall-dpo-merged | 4.022 millones | no disponible | Tool calling JSON estricto + abstencion (SFT + DPO) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022 millones (base) | no disponible | Instruccion general | Apache 2.0 | Hugging Face |
| Alternativas especificas de tool calling de 3-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con el modelo base muestra una mejora marginal en exact match global (86,0% frente a 85,5% zero-shot y 86,5% en 3-shot) en la etapa SFT publicada, con precision de abstencion identica al 100%. No se dispone de datos del checkpoint final DPO ni de comparaciones con otros ajustes de tool calling en la informacion proporcionada.

## Limitaciones y advertencias

- La model card solo publica metricas de la etapa SFT; no hay resultados del checkpoint final tras DPO, por lo que la mejora atribuible a la segunda etapa no esta cuantificada.
- El benchmark de evaluacion es propio del autor (200 casos) y no ha sido validado de forma independiente.
- Soporte declarado unicamente de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El modelo esta entrenado para un contrato de salida muy concreto (`tool_calls` con `name` y `arguments`); usarlo fuera de ese formato puede degradar la calidad.
- Riesgo de alucinacion en la seleccion de herramienta o en los valores de argumentos cuando el catalogo de funciones es ambiguo o muy extenso.
- Riesgo de falsos positivos en invocaciones cuando la peticion no encaja claramente en ninguna herramienta, aunque el entrenamiento incluyo ejemplos de abstencion.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3-4B-Instruct-2507.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni validacion de la comunidad.
- No se documenta la longitud de contexto efectiva del ajuste; el entrenamiento uso secuencias de hasta 1.536 tokens, lo que puede limitar el rendimiento con catalogos de herramientas muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arman-52/qwen3-4b-toolcall-dpo-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
