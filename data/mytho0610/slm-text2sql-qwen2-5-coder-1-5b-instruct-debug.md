# Mytho0610/slm-text2sql-qwen2.5-coder-1.5b-instruct-debug

## Resumen

Mytho0610/slm-text2sql-qwen2.5-coder-1.5b-instruct-debug es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct orientado a la tarea de text-to-SQL sobre SQLite. Lo publica el usuario Mytho0610 en HuggingFace y se ha entrenado mediante QLoRA (SFT supervisado) sobre datos de SQaLe. El modelo recibe un esquema de base de datos en formato DDL (`CREATE TABLE ...`) junto con una pregunta en lenguaje natural y devuelve la consulta SQL correspondiente.

Se trata de un experimento de bajo perfil: el repositorio no acumula descargas ni interacciones y la model card es minima. Su interes practico radica en que parte de una base solida y compacta (Qwen2.5-Coder-1.5B-Instruct, 1.543.714.304 parametros) y la especializa en una tarea muy concreta, con un formato de salida estructurado que separa el razonamiento (`<think>`) de la respuesta final (`<answer>`).

Por su tamano (1,5B) y su naturaleza de ajuste ligero, es un candidato para despliegues con recursos limitados donde no se requiera un modelo generalista, sino un generador de SQL especializado en esquemas SQLite. No obstante, la ausencia de licencia declarada, de idiomas explicitos y de benchmarks publicados limita su uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), segun el modelo base Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct; valor no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; el ajuste se hizo con QLoRA, pero no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Metodo de ajuste | QLoRA SFT sobre datos SQaLe |
| Dominio | text-to-SQL, dialecto SQLite |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, con atencion causal estandar y sin componentes MoE. Sobre esa base se aplico un ajuste supervisado (SFT) con QLoRA, lo que implica que los pesos base se mantuvieron cuantizados durante el entrenamiento y solo se actualizaron adaptadores de bajo rango que posteriormente se fusionaron en los pesos finales en safetensors.

El dataset de entrenamiento es SQaLe, orientado a la traduccion de preguntas en lenguaje natural a consultas SQL sobre SQLite. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; solo se indica SFT con QLoRA. El formato de prompt utiliza la plantilla de chat del modelo base: un mensaje de sistema que define al asistente como especialista en text-to-SQL y un mensaje de usuario con el esquema (`### Database schema`) y la pregunta (`### Question`). La salida esperada sigue el patron `<think>...</think><answer>SQL</answer>`, una convencion que separa el razonamiento intermedio de la consulta final y que facilita el parseo en pipelines automatizados.

## Capacidades

- Generacion de consultas SQL para SQLite a partir de un esquema DDL y una pregunta en lenguaje natural.
- Salida estructurada con bloque de razonamiento (`<think>`) y bloque de respuesta (`<answer>`), lo que permite extraer la SQL de forma programatica.
- Comprension de esquemas relacionales expresados como sentencias `CREATE TABLE`.
- Ajuste especifico al dialecto SQLite, no necesariamente transferible a otros motores sin evaluacion.
- Soporte de conversacion multi-turno mediante plantilla de chat, aunque el entrenamiento se centra en el par esquema-pregunta.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking nativo mas alla del bloque `<think>` del formato de salida.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base Qwen2.5-Coder tiene cobertura multilingue, pero no se confirma el comportamiento tras el ajuste.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite en aplicaciones de escritorio o moviles: el modelo traduce preguntas de usuario a SQL a partir del esquema embebido, con un tamano de 1,5B que permite ejecucion local.
- Generacion de SQL en herramientas de analitica interna: dado un catalogo de tablas SQLite, el modelo produce consultas para dashboards o informes, y el bloque `<answer>` facilita la validacion automatica previa a la ejecucion.
- Prototipado de interfaces de lenguaje natural sobre bases de datos: equipos que quieran anadir una capa de "pregunta en lenguaje natural" a una app existente pueden integrar el modelo sin infraestructura GPU de gran escala.
- Generacion de consultas en pipelines de pruebas: el modelo puede producir SQL de ejemplo para tests de integracion a partir de descripciones textuales y esquemas de prueba.
- Educacion y formacion en SQL: el bloque `<think>` expone el razonamiento intermedio, util para mostrar a estudiantes como se construye una consulta a partir de un enunciado.
- Extraccion de datos en flujos ETL ligeros: para transformaciones sencillas sobre SQLite, el modelo puede generar las sentencias de seleccion o agregacion a partir de especificaciones en lenguaje natural.
- Base para experimentacion en text-to-SQL: al ser un ajuste QLoRA reproducible sobre un modelo abierto, sirve como punto de partida para comparar tecnicas de fine-tuning en tareas de generacion de SQL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos (1,543 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica, alrededor de 4-6 GB segun longitud de contexto y batch.
- Cuantizacion a 8 bits: aproximadamente 1,6 GB de pesos; a 4 bits: aproximadamente 0,8-1 GB de pesos. El repositorio no publica versiones GGUF ni cuantizadas, por lo que habria que generarlas a partir de los safetensors.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en centros de datos, A100, H100 o L4 sin problema.
- Despliegue: compatible con frameworks que soporten arquitectura Qwen2 y safetensors, como vLLM, TGI, transformers o llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1,5B, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mytho0610/slm-text2sql-qwen2.5-coder-1.5b-instruct-debug | 1,54B | no disponible | Text-to-SQL SQLite (QLoRA SFT) | no disponible | HuggingFace, safetensors |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B | no disponible en esta ficha | Modelo generalista de codigo e instrucciones | Apache 2.0 (modelo base) | HuggingFace, ampliamente disponible |
| Modelos text-to-SQL especializados de mayor tamano (p. ej. variantes de 7B) | 7B o superior | variable | Text-to-SQL generico | variable | variable |

La comparativa directa con alternativas especializadas en text-to-SQL no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en SQLite y el formato de salida con `<think>`/`<answer>`, a costa de perder generalidad.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base (Apache 2.0 en Qwen2.5-Coder) y contactar con el autor antes de usarlo en produccion.
- No hay benchmarks publicados, por lo que el rendimiento real en text-to-SQL no esta validado de forma independiente.
- El ajuste es especifico de SQLite; el comportamiento en otros dialectos (PostgreSQL, MySQL, etc.) no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: puede generar tablas o columnas inexistentes si el esquema es ambiguo o extenso; se recomienda validar la SQL contra el esquema antes de ejecutarla.
- El bloque `<think>` puede contener razonamiento incorrecto aunque la respuesta final sea valida, o viceversa; no debe interpretarse como una explicacion garantizada.
- Idiomas soportados no declarados; el rendimiento en castellano u otras lenguas distintas del ingles no esta verificado.
- Repositorio con cero descargas y sin pipeline declarado, lo que sugiere un estado experimental o de depuracion (el sufijo `-debug` en el nombre lo refuerza); no se recomienda su uso directo en produccion sin evaluacion propia.
- Longitud de contexto efectiva tras el ajuste no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mytho0610/slm-text2sql-qwen2.5-coder-1.5b-instruct-debug
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset SQaLe (referenciado en la model card): no se proporciona enlace directo en la informacion disponible
- Paper o blog del ajuste: no disponible
- Repositorio de codigo o demo: no disponible
