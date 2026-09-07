# Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-OpenVINO-INT4

## Resumen

Nanbeige4.2-3B-CE-v1.0-OpenVINO-INT4 es un modelo de lenguaje de 3000 millones de parametros, publicado por el usuario Irfanuruchi como derivado del checkpoint original Nanbeige4.2-3B-CE v1.0. Se trata de una conversion a OpenVINO con cuantizacion INT4, orientada a la ejecucion en hardware de Intel, especialmente en sistemas con NPU (Intel AI Boost). El objetivo del artefacto es ofrecer una version comprimida del modelo base para reducir el espacio en disco y el consumo de memoria, manteniendo la interfaz de generacion de texto.

La conversion se realizo con NNCF 3.3.0, aplicando cuantizacion simetrica INT4 con group size 128 sobre 154 de las 157 capas, con dos capas en INT8 asimetrico y una capa en punto flotante. El binario comprimido ocupa 2.7 GB, frente a los 8.3 GB del artefacto FP16 de origen. A pesar de la compresion, el modelo no ha sido validado con exito en el hardware NPU objetivo: la ejecucion en un sistema con 32 GB de RAM e Intel AI Boost fallo por errores de memoria y de nombres en la cache KV. Por tanto, el paquete se publica como un candidato experimental y un artefacto validado estructuralmente, no como soporte de produccion para Intel NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3B (3000 millones, segun el nombre y el README del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simetrico (group size 128) en 154/157 capas; INT8 asimetrico per-channel en 2/157 capas; FP16 en 1/157 capas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.bin) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base. Por el nombre y el numero de parametros, se trata de un modelo de lenguaje denso de 3B, pero no se ofrecen detalles sobre el tipo de transformer, la atencion, ni la composicion del dataset de entrenamiento. Tampoco se mencionan procesos de RLHF, DPO ni otros ajustes posteriores al entrenamiento.

El artefacto OpenVINO INT4 se genero a partir del artefacto OpenVINO FP16 stateful, utilizando NNCF 3.3.0 con el modo INT4_SYM, group size 128 y ratio 1.0. El proceso de cuantizacion dejo una capa en punto flotante y dos capas en INT8, mientras que el resto se comprimio a INT4. El binario comprimido tiene un tamano de 2.645.700.572 bytes, frente a los 8.339.601.804 bytes del FP16 original, lo que supone una reduccion al 31,72% del tamano original. La interfaz GenAI de 3 entradas y 1 salida se mantiene, y una sonda estructural confirmo que las 44 parejas de cache KV sobrevivieron a la compresion, con 90 entradas y 89 salidas en el grafo. El README del modelo base indica que el checkpoint congelado conserva limitaciones conocidas de precision y factualidad en preguntas de sistemas complejas.

## Capacidades

- Generacion de texto (pipeline text-generation).
- Interfaz GenAI de 3 entradas / 1 salida en modo stateful.
- Cache KV explicito: 44 parejas de past_key_values y present, con 90 entradas y 89 salidas en el probe estructural.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion de compresion de modelos: el artefacto permite estudiar el impacto de la cuantizacion INT4 con NNCF 3.3.0 sobre un modelo de 3B, comparando el tamano de pesos (31,72% del FP16) y la degradacion de calidad frente al checkpoint original.
- Prototipado en hardware Intel: sirve para probar la ejecucion de un LLM de 3B en sistemas con Intel AI Boost, aunque la validacion actual no es exitosa, lo que permite iterar sobre workarounds de memoria y de nombres de cache KV.
- Despliegue en CPU con OpenVINO: al ser un modelo OpenVINO, puede ejecutarse en CPUs Intel mediante OpenVINO Runtime para tareas de generacion de texto de baja latencia, siempre que se acepten las limitaciones del checkpoint base.
- Validacion de integridad estructural tras cuantizacion: el probe de 90 entradas y 89 salidas confirma que las 44 parejas de cache KV sobreviven a la compresion, lo que permite verificar que la cuantizacion no rompe la interfaz del modelo.
- Comparacion de formatos: se puede comparar con la version GGUF del mismo modelo para evaluar diferencias de rendimiento, compatibilidad y facilidad de despliegue entre backends.
- Educacion y demostracion de OpenVINO: sirve como ejemplo practico de como convertir un modelo a OpenVINO INT4 y de las dificultades de ejecutarlo en NPU, util para formacion tecnica o para documentar procesos de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversion OpenVINO INT4. El README del modelo base Nanbeige4.2-3B-CE v1.0 afirma que supera a modelos mas grandes como Qwen3.5-9B y Gemma4-12B en benchmarks generales, de agente y de razonamiento, pero no se proporcionan cifras concretas en la informacion disponible. Por tanto, no es posible presentar una tabla comparativa de rendimiento para este artefacto.

## Requisitos de hardware

- El binario comprimido ocupa 2.7 GB en disco; la memoria adicional necesaria para contexto y activaciones no se especifica en la informacion disponible.
- No se ha validado el funcionamiento en NPU: en un sistema de prueba con 32 GB de RAM e Intel AI Boost, la ejecucion fallo por errores de memoria del host (ZE_RESULT_ERROR_OUT_OF_HOST_MEMORY) y por fallos en la busqueda de nombres de salida de la cache KV.
- Puede ejecutarse en CPU con OpenVINO Runtime, aunque no se indican requisitos minimos de hardware.
- Opciones de despliegue: OpenVINO Runtime y OpenVINO GenAI. No se han probado otros backends con este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanbeige4.2-3B-CE v1.0 OpenVINO INT4 (este) | OpenVINO INT4 | 2.7 GB | Apache 2.0 | HuggingFace |
| Nanbeige4.2-3B-CE v1.0 OpenVINO FP16 Stateful | OpenVINO FP16 | 8.3 GB (openvino_model.bin) | Apache 2.0 | HuggingFace |
| Nanbeige4.2-3B-CE v1.0 GGUF | GGUF | no disponible | Apache 2.0 | HuggingFace |
| Nanbeige4.2-3B-CE v1.0 (original) | no especificado | no disponible | Apache 2.0 | HuggingFace |

El README del modelo base afirma que Nanbeige4.2-3B supera a Qwen3.5-9B y Gemma4-12B en varios benchmarks, pero no se aportan cifras ni se especifica si esa comparativa es aplicable a esta version INT4.

## Limitaciones y advertencias

- No validado en hardware NPU: la ejecucion en Intel AI Boost fallo con errores de memoria del host y de nombres en la cache KV. El artefacto se publica como candidato experimental, no como soporte de produccion.
- Riesgo de alucinacion: el README del modelo base reconoce debilidades conocidas de precision y factualidad en preguntas de sistemas complejas.
- Limitaciones de idioma: no se dispone de informacion sobre los idiomas soportados, por lo que puede haber restricciones multilingues no documentadas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el estado experimental del artefacto y la falta de validacion de rendimiento deben tenerse en cuenta antes de su uso en entornos criticos.
- Caveat para produccion: la validacion estructural (90 entradas y 89 salidas) no constituye una validacion de calidad factual ni de rendimiento; se preservan las limitaciones del checkpoint base congelado.

## Enlaces

- https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-OpenVINO-INT4
- https://huggingface.co/Irfanuruchi/Nanbeige4.2-3B-CE-v1.0-GGUF
- https://huggingface.co/Nanbeige/Nanbeige4.2-3B/blob/main/README.md
