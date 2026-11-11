# Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16

## Resumen

SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16 es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B desarrollado por Cialtion, orientado especificamente a tool calling y function calling estructurado. El modelo implementa una arquitectura de "ocho cabezas" (multi-head) que divide la generacion en ocho ramas logicas independientes: una para contenido, una para la seleccion de funcion y seis para argumentos (arg1 a arg6). Esta descomposicion permite emitir llamadas a funciones con JSON tipado estricto sin depender de LoRA externo, ya que los pesos se distribuyen ya fusionados (merged) en el checkpoint.

El modelo se entrena sobre el dataset Cialtion/SimpleTool-Diagnostic-800 y sigue un schedule de datos al 5%. Con 873.438.784 parametros reales en BF16 y un tamano de repositorio de 1,8 GB, esta pensado para escenarios de despliegue ligero donde la precision en la estructura de la llamada a funcion es critica. La licencia es Apache 2.0, lo que facilita su integracion en productos comerciales.

Su relevancia actual radica en la creciente demanda de modelos pequenos y especializados en agentes y pipelines de automatizacion, donde la latencia y el coste importan mas que la capacidad generativa general. No obstante, el propio autor advierte que las metricas publicadas son diagnosticas y no deben interpretarse como resultados de benchmarks externos o de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas de salida multiples (multi-head): ramas `content`, `function`, `arg1`-`arg6` |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos nativos); referencia INT4 con RTN afin grupo 64 en serializacion AWQ sin calibracion de activaciones; FP8 E4M3 donde este configurado, con tensores retenidos en BF16 |
| Idiomas soportados | No disponible (el benchmark incluye 400 casos en chino y 400 en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y anade una descomposicion de la salida en ocho ramas logicas independientes: `content`, `function` y `arg1` hasta `arg6`. La generacion de la funcion y la aridad maxima del esquema candidato deben producirse desde el mismo prompt, y las propiedades requeridas deben aparecer primero y en el mismo orden en `properties`, `required` y los slots de argumentos. Las ramas de argumentos son independientes entre si y no se condicionan al resultado de la funcion recien generada. El tokenizer incluye filas de tokens especiales entrenadas, y `<|null|>` marca argumentos omitidos o no usados.

El entrenamiento se realizo con un schedule de datos al 5% sobre el dataset Cialtion/SimpleTool-Diagnostic-800, que contiene 800 casos sinteticos congelados de llamada unica (400 en chino, 400 en ingles) divididos en cuatro lotes de 200. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint se distribuye ya fusionado (merged), por lo que no requiere un LoRA externo en tiempo de inferencia.

## Capacidades

- Generacion de llamadas a funciones con JSON tipado estricto: la precision de llamada completa exige que la funcion y todos los argumentos requeridos coincidan.
- Seleccion de funcion a partir del prompt y del esquema candidato, con la aridad maxima derivada del mismo prompt.
- Emision de argumentos en slots independientes (hasta seis), con marcador `<|null|>` para argumentos omitidos.
- Soporte de tool calling y function calling estructurado orientado a pipelines de agentes.
- Capacidades multilingues limitadas a lo observado en el benchmark: chino e ingles.
- Generacion de contenido en la rama `content`, aunque el autor indica que no se genera ni se puntua en el benchmark.
- No se dispone de informacion sobre vision, audio, modo thinking ni razonamiento multi-paso mas alla de la llamada unica.

## Casos de uso

- Automatizacion de agentes con tool calling: el modelo emite la funcion y los argumentos en JSON tipado estricto, lo que permite integrarlo en orquestadores de agentes que validan el esquema antes de ejecutar la herramienta.
- Pipelines de CI/CD con invocacion de APIs: al generar llamadas estructuradas y deterministas en formato, puede conectarse a herramientas de build, despliegue o monitorizacion sin postprocesado complejo.
- Asistentes de atencion al cliente con backend de funciones: el modelo selecciona la funcion adecuada (consulta de pedido, cambio de direccion, etc.) y rellena los argumentos requeridos en el orden correcto.
- Extraccion de parametros desde lenguaje natural: util para convertir peticiones de usuario en argumentos tipados de una API interna, con soporte de hasta seis argumentos por llamada.
- Despliegue en entornos con recursos limitados: con 873 millones de parametros y pesos BF16 de 1,8 GB, es viable en GPUs de gama media y en CPU con cuantizacion, lo que facilita prototipos y edge computing.
- Evaluacion y diagnostico de modelos de tool calling: el benchmark de 800 casos congelados y las metricas separadas de funcion y llamada completa sirven para comparar variantes de cuantizacion y schedules de entrenamiento.
- Sistemas bilingues chino-ingles de invocacion de funciones: el benchmark cubre ambos idiomas, lo que respalda su uso en productos con usuarios de esas dos comunidades.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor indica que el benchmark consta de 800 casos sinteticos congelados de llamada unica (400 en chino, 400 en ingles) en cuatro lotes de 200, con metricas de precision de funcion y de llamada completa, pero no se proporcionan los valores obtenidos. Asimismo, se advierte que BF16 no se ha evaluado por separado y que la puntuacion listada corresponde a la referencia INT4/FP16, por lo que no deben transferirse puntuaciones entre precisiones almacenadas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, alrededor de 2 a 3 GB para contextos cortos.
- VRAM estimada en INT4: por debajo de 1 GB para pesos, lo que permite ejecucion en GPUs de 4 GB o incluso en CPU con llama.cpp.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 y H100 para despliegues con mayor throughput; cualquier GPU con al menos 4 GB de VRAM es suficiente en cuantizacion.
- Cabe en GPUs de consumo: si, en practicamente todas las GPU consumer modernas, incluidas las de gama de entrada con 4-6 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son opciones plausibles; no se confirma en la informacion disponible cuales estan validadas oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16 | 873.438.784 | No disponible | Tool calling multi-head | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | No disponible | No disponible | Modelo generalista | No disponible | Hugging Face |
| Alternativas de tool calling de ~1B | No disponible | No disponible | Tool calling | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas del benchmark son diagnosticas y observadas, no afirmaciones de produccion ni de benchmarks externos.
- BF16 no se ha evaluado por separado; la puntuacion listada corresponde a la referencia INT4/FP16 y no debe transferirse entre precisiones.
- El benchmark solo cubre llamada unica y no evalua conversaciones multi-turno ni razonamiento multi-paso.
- La rama `content` no se genera ni se puntua en el benchmark, por lo que su calidad no esta validada.
- Las ramas de argumentos son independientes y no se condicionan al resultado de la funcion, lo que puede producir inconsistencias en casos complejos.
- El modelo solo esta validado en chino e ingles segun el benchmark; el soporte de otros idiomas no esta disponible.
- Riesgo de alucinacion en la seleccion de funcion o en los valores de argumentos no cubiertos por el esquema.
- No se especifican sesgos conocidos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- La longitud de contexto no esta disponible, lo que limita la planificacion de despliegues con prompts largos.

## Enlaces

- Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Qwen3.5-0.8B-8Head-5pct-BF16
- Dataset: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
