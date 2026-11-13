# agentGreg/Bielik-One-4B-r1-MLX

## Resumen

Bielik-One-4B-r1-MLX es la conversion al framework MLX de Apple del modelo speakleash/Bielik-One-4B-r1, un modelo de decision estructurada de 4.207.070.720 parametros (~4,2 B) desarrollado originalmente por SpeakLeash. No es un modelo conversacional: su proposito es emitir decisiones estructuradas con probabilidades calibradas sobre opciones predefinidas, y se sirve a traves de un endpoint `/v1/systemone` compatible con el frontend oficial de bielik-one. Esta version MLX esta mantenida por el usuario agentGreg y esta pensada para ejecutarse en silicio de Apple en bfloat16.

La relevancia de esta ficha reside en que demuestra que la inferencia de un modelo de decision calibrado puede reproducirse en hardware consumer de Apple con una fidelidad practicamente identica a la del stack de referencia (vLLM sobre A100). Segun la model card, en el split publico de desarrollo del benchmark Tacit ambas implementaciones dan la misma respuesta en el 99,55 % de 2902 items, con diferencias medias de probabilidad por opcion de 0,0050 o menos en todas las lenguas evaluadas.

El modelo base hereda la licencia Apache 2.0, lo que facilita su uso comercial, y se distribuye en formato safetensors con pesos en bfloat16. La informacion disponible sobre arquitectura interna, datos de entrenamiento y contexto es limitada: la model card de esta conversion remite a la del modelo original para esos detalles y no los reproduce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base etiquetado como `qwen3_5`; sin detalle de capas ni atencion en la informacion proporcionada) |
| Parametros totales | 4.207.070.720 (~4,2 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bfloat16; no se documentan otras cuantizaciones en esta conversion |
| Idiomas soportados | No disponibles de forma oficial; los benchmarks de paridad cubren polaco (pl), ingles (en), aleman (de) y noruego bokmal (nb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base speakleash/Bielik-One-4B-r1: no se especifica numero de capas, tipo de atencion, dimension oculta ni composicion del dataset de entrenamiento. La etiqueta `qwen3_5` en el repositorio sugiere una base de la familia Qwen 3.5, pero no se confirma en la model card. Lo que si se explicita es la funcion del modelo: es un `decision-model` orientado a `structured-decisions`, es decir, produce distribuciones de probabilidad sobre opciones discretas en lugar de texto libre.

Esta conversion MLX no introduce cambios en los pesos mas alla del cambio de formato y del runtime. La model card documenta un proceso de validacion de paridad frente a la implementacion de referencia (bielik-one 1.0.8 con vLLM 0.32.0 en bfloat16 sobre NVIDIA A100), comparando probabilidades crudas a temperatura 1 en el split oculto del benchmark Tacit, con calibracion ajustada por separado para cada motor sobre el split publico de desarrollo. No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO en la informacion disponible.

## Capacidades

- Emision de decisiones estructuradas con probabilidades calibradas sobre un conjunto de opciones predefinido.
- Servicio de la API `/v1/systemone` mediante el script `systemone_mlx.py` incluido en el repositorio, compatible con el frontend oficial de bielik-one sin modificaciones.
- Evaluacion multilingue demostrada en polaco, ingles, aleman y noruego bokmal.
- Inferencia en bfloat16 sobre silicio de Apple mediante MLX.
- No es un modelo de chat: la model card indica explicitamente "Decisions only, no chat".
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Clasificacion y enrutamiento de decisiones con umbrales calibrados: al devolver probabilidades por opcion en lugar de texto libre, permite fijar umbrales de automatizacion (por ejemplo, el criterio "automatizado a 5 % de error" usado en el benchmark Tacit) y derivar a revision humana los casos por debajo del umbral.
- Despliegue local en Mac para prototipado: un desarrollador puede levantar el endpoint `/v1/systemone` en un Apple M5 Max y validar el comportamiento del modelo de decision sin depender de GPUs NVIDIA ni de un servidor vLLM.
- Sustitucion de backend en aplicaciones construidas sobre bielik-one: el frontend oficial funciona sin cambios sobre el backend MLX, lo que permite migrar una instalacion existente a hardware Apple manteniendo la interfaz.
- Evaluacion de paridad entre motores de inferencia: el repositorio sirve como referencia para medir la fidelidad numerica entre vLLM y MLX en tareas de decision calibrada, con metricas de coincidencia de respuesta y diferencia de probabilidad por opcion.
- Procesamiento por lotes de decisiones multilingues: el modelo cubre al menos cuatro lenguas europeas con precisiones entre el 85,3 % y el 91,2 % en el split oculto de Tacit, adecuado para pipelines internos que operen en esos idiomas.
- Investigacion sobre calibracion de modelos pequenos: con 4,2 B de parametros y pesos abiertos en Apache 2.0, es un sujeto manejable para estudiar como la calibracion se transfiere entre motores y formatos de pesos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de paridad entre MLX y vLLM sobre el benchmark Tacit (probabilidades crudas a temperatura 1, split oculto; calibracion ajustada por separado sobre el split publico de desarrollo):

| Idioma | Items | Misma respuesta | Diferencia media de probabilidad por item | Diferencia maxima | Precision vLLM / MLX | Automatizado a 5 % error, vLLM / MLX |
|---|---|---|---|---|---|---|
| pl | 652 | 99,39 % | 0,0050 | 0,080 | 87,6 % / 87,9 % | 67,6 % / 68,1 % |
| en | 750 | 99,60 % | 0,0051 | 0,130 | 91,1 % / 91,2 % | 65,5 % / 66,0 % |
| de | 750 | 99,87 % | 0,0045 | 0,060 | 87,1 % / 87,1 % | 68,1 % / 68,0 % |
| nb | 750 | 99,33 % | 0,0055 | 0,062 | 85,7 % / 85,3 % | 66,3 % / 66,7 % |
| total | 2902 | 99,55 % | No disponible | No disponible | 87,9 % / 87,9 % | 66,9 % / 67,2 % |

Ademas, en el split publico de desarrollo la coincidencia de respuesta entre motores es del 99,65 % sobre 2852 items. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM/peso en memoria: los pesos en bfloat16 suman aproximadamente 8,4 GB (tamano del repositorio), por lo que se necesita al menos esa cantidad de memoria unificada para cargar el modelo completo.
- Hardware de referencia de la conversion: Apple M5 Max con MLX, segun la model card.
- Hardware de referencia del modelo original: NVIDIA A100 con vLLM 0.32.0 en bfloat16.
- Encaje en GPU consumer: no se documenta en la informacion disponible; por tamano, 8,4 GB en bfloat16 quedaria al limite en GPUs con 8 GB y holgado en tarjetas de 12 GB o mas, pero esta conversion esta orientada a MLX y no a CUDA.
- Opciones de despliegue: MLX con el script `systemone_mlx.py` (FastAPI + Uvicorn) para servir `/v1/systemone`; el modelo original se sirve con vLLM. No se mencionan llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoria (modelos de decision estructurada calibrada) en la informacion proporcionada. La unica comparacion documentada es interna, entre dos motores de inferencia sobre el mismo modelo:

| Aspecto | Bielik-One-4B-r1 (vLLM, A100) | Bielik-One-4B-r1-MLX (MLX, M5 Max) |
|---|---|---|
| Parametros | 4,2 B | 4,2 B |
| Precision | bfloat16 | bfloat16 |
| Precision en Tacit (total) | 87,9 % | 87,9 % |
| Automatizado a 5 % error (total) | 66,9 % | 67,2 % |
| Coincidencia de respuesta (dev publico) | Referencia | 99,65 % de 2852 items |

## Limitaciones y advertencias

- No es un modelo de chat: solo emite decisiones estructuradas; usarlo para generacion conversacional no es su proposito declarado.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni limitaciones por idioma mas alla de los cuatro evaluados.
- La longitud de contexto no esta disponible, lo que impide planificar aplicaciones con entradas largas.
- La calibracion es dependiente del motor: el benchmark ajusta la calibracion por separado para vLLM y MLX, de modo que los umbrales fijados sobre un backend no deben trasladarse sin recalibrar al otro.
- Las diferencias maximas de probabilidad por item alcanzan 0,130 en ingles, muy superiores a la media; en decisiones con umbrales ajustados conviene revisar los casos limite.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026, por lo que no hay evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base speakleash/Bielik-One-4B-r1 antes de desplegarlo.
- La informacion sobre arquitectura y entrenamiento es escasa: no se puede auditar el origen de los datos ni el proceso de alineacion desde esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentGreg/Bielik-One-4B-r1-MLX
- Modelo base: https://huggingface.co/speakleash/Bielik-One-4B-r1
- Repositorio bielik-one (GitHub): https://github.com/speakleash/bielik-one
- Benchmark Tacit: https://tacitbench.ai
