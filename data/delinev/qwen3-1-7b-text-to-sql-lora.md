# Delinev/qwen3-1.7b-text-to-sql-lora

## Resumen

Delinev/qwen3-1.7b-text-to-sql-lora es un adaptador LoRA publicado por el usuario Delinev sobre el modelo base Qwen/Qwen3-1.7B, orientado especificamente a la tarea de text-to-SQL: generar una consulta SQL a partir de una pregunta en ingles y un esquema de base de datos. No es un modelo completo, sino un conjunto de pesos PEFT que debe cargarse junto con el modelo base Qwen3-1.7B. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde al tamano tipico de un adaptador LoRA de rango 16 sobre un modelo de 1.700 millones de parametros.

La relevancia del proyecto reside en su enfoque acotado y medible: el autor reporta una mejora sustancial en exact match normalizado, del 25,23 % con el modelo base al 77,98 % con el adaptador, sobre 999 ejemplos de validacion reservados. Esta especializacion convierte a un modelo pequeno y desplegable en local en una herramienta practica para generar SQL, con un coste de inferencia muy inferior al de modelos generalistas de mayor tamano.

El adaptador se entreno mediante SFT durante 2 epocas sobre un subconjunto deduplicado y filtrado del dataset b-mc2/sql-create-context, derivado a su vez de WikiSQL y Spider. La model card indica que debe usarse la plantilla de chat de Qwen3 con `enable_thinking=False`, lo que sugiere que el modo de razonamiento extendido de Qwen3 no forma parte del flujo previsto para esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA de rango 16 sobre un modelo base de 1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only del linaje Qwen3. La configuracion LoRA declarada en la model card es: rango 16, alpha 32, dropout 0,05 y modulos objetivo `all-linear`, es decir, se inyectan matrices de bajo rango en todas las capas lineales del modelo base. El entrenamiento se realizo mediante SFT durante 2 epocas con una tasa de aprendizaje de 1e-4.

Los datos de entrenamiento proceden de un subconjunto deduplicado y filtrado de b-mc2/sql-create-context, un dataset publico bajo licencia CC BY 4.0 que combina ejemplos derivados de WikiSQL y Spider. Los ejemplos se convirtieron a formato de mensajes de chat, de modo que el adaptador espera la plantilla conversacional de Qwen3. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del subconjunto ni si se aplicaron tecnicas de RLHF o DPO; solo se indica SFT. Tampoco se documentan innovaciones de decodificacion o atencion especificas del adaptador.

## Capacidades

- Generacion de SQL a partir de una pregunta en ingles y un esquema de base de datos, en formato conversacional.
- Especializacion en consultas de tipo SELECT sobre esquemas relacionales, segun el origen de datos (WikiSQL y Spider).
- Uso previsto con la plantilla de chat de Qwen3 y `enable_thinking=False`.
- Capacidad multilingue limitada al ingles, segun el campo `language` del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido en la informacion disponible.
- Al ser un adaptador sobre Qwen3-1.7B, hereda las capacidades generales del modelo base solo en la medida en que el entrenamiento SFT no las haya desplazado; la model card no las detalla.

## Casos de uso

- Asistente de consultas para analistas de datos: el usuario formula una pregunta en lenguaje natural y el adaptador genera la consulta SQL contra un esquema dado, reduciendo el tiempo de escritura manual en entornos de exploracion de datos.
- Generacion de SQL en herramientas internas de BI: integrado en un panel donde el analista selecciona una tabla y describe la consulta deseada, el modelo produce el SQL que luego se revisa antes de ejecutarse.
- Prototipado rapido de interfaces de consulta: gracias al reducido tamano del modelo base (1,7 B), puede desplegarse en una maquina de desarrollo para iterar sobre esquemas y preguntas sin depender de APIs externas.
- Generacion asistida en pipelines de datos: el adaptador puede producir consultas de extraccion sobre esquemas conocidos y estables, que despues se validan con un parser SQL antes de su ejecucion.
- Formacion y evaluacion de tecnicas text-to-SQL: sirve como referencia de ajuste fino con LoRA sobre un modelo pequeno, con metricas reproducibles de exact match y tasa de parseo.
- Automatizacion de tareas repetitivas de reporting: para consultas recurrentes sobre un esquema fijo, el modelo puede generar variantes de la consulta a partir de parametros descritos en lenguaje natural, siempre con revision humana previa.
- Base para experimentos de destilacion o comparacion: al ser un adaptador ligero, es util para comparar el efecto de distintos datasets o hiperparametros LoRA sobre el mismo modelo base.

## Benchmarks y rendimiento

| Metrica | Modelo base | Con adaptador |
|---|---:|---:|
| Exact match normalizado | 25,23 % | 77,98 % |
| Tasa de parseo SQL | 99,80 % | 99,80 % |

Evaluacion sobre 999 ejemplos de validacion reservados, excluyendo una referencia invalida. La normalizacion se realizo con SQLGlot en dialecto MySQL. La model card advierte que el exact match no demuestra equivalencia semantica. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo base de 1,7 B en precision de 16 bits se situa en el entorno de 3-4 GB, y en cuantizacion de 4 bits en torno a 1-2 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se documenta oficialmente.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen3-1.7B y aplicar el adaptador mediante la libreria `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delinev/qwen3-1.7b-text-to-sql-lora | Adaptador sobre 1,7 B | no disponible | Text-to-SQL (LoRA) | no disponible | Hugging Face |
| fahmiaziz/qwen3-1.7B-text2sql | 1,7 B (modelo ajustado) | no disponible | Text-to-SQL | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | Modelo generalista | no disponible en la informacion proporcionada | Hugging Face |

La comparativa se limita a modelos del mismo linaje y tamano encontrados en la busqueda; no se dispone de datos de rendimiento de las alternativas para contrastar el exact match reportado.

## Limitaciones y advertencias

- El autor advierte que el modelo puede anadir condiciones innecesarias, omitir filtros obligatorios o manejar incorrectamente NULL; el SQL generado debe revisarse antes de su uso.
- El exact match normalizado no garantiza equivalencia semantica con la consulta de referencia.
- El adaptador esta entrenado unicamente en ingles; no se documenta soporte de otros idiomas.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial del adaptador; ademas, el modelo base Qwen3-1.7B tiene su propia licencia que debe verificarse por separado.
- El dataset de entrenamiento deriva de WikiSQL y Spider, con esquemas y estilos de consulta propios; el rendimiento puede degradarse en esquemas de produccion muy distintos.
- No se documentan sesgos especificos, pero al ser un ajuste sobre un dataset publico de preguntas y esquemas en ingles, puede heredar los sesgos de dichas fuentes.
- Riesgo de alucinacion en nombres de tablas o columnas no presentes en el esquema proporcionado; no se documenta ningun mecanismo de validacion integrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delinev/qwen3-1.7b-text-to-sql-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset sql-create-context: https://huggingface.co/datasets/b-mc2/sql-create-context
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
- WikiSQL: https://github.com/salesforce/WikiSQL
- Spider: https://yale-lily.github.io/spider/
- Alternativa encontrada en la busqueda: https://huggingface.co/fahmiaziz/qwen3-1.7B-text2sql
- Wikipedia sobre Qwen: https://en.wikipedia.org/wiki/Qwen
