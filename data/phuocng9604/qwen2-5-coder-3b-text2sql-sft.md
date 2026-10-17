# PhuocNg9604/qwen2.5-coder-3b-text2sql-sft

## Resumen

PhuocNg9604/qwen2.5-coder-3b-text2sql-sft es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct para la tarea de generacion Text-to-SQL en dominios cruzados. Lo desarrolla el usuario PhuocNg9604 y se publica bajo licencia Apache-2.0. El adaptador no es un modelo completo: requiere cargar el modelo base de 3.000 millones de parametros y fusionar despues los pesos LoRA para poder ejecutarlo.

El problema que resuelve es concreto: convertir una pregunta en lenguaje natural y un esquema de base de datos serializado como sentencias CREATE TABLE en una consulta SQL valida, sin texto adicional. El entrenamiento se ha realizado con QLoRA sobre el benchmark Spider de Yale, con una estrategia de minado de fallos para reforzar los casos en los que el modelo base erraba.

La relevancia actual del modelo es acotada pero practica: se trata de una especializacion ligera (rank 16, alfa 32, modulos de atencion y MLP) que anade ~0,4 GB al modelo base, lo que permite desplegar generacion SQL en GPUs de consumo con un coste de almacenamiento bajo. Es una opcion util para prototipos de asistentes analiticos y pipelines internos de generacion de consultas, no tanto para produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2.5-Coder) con adaptador LoRA PEFT |
| Parametros totales | 3B en el modelo base; el adaptador LoRA es adicional (rank 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | Entrenamiento con QLoRA en 4-bit del modelo base; inferencia en float16 segun el ejemplo del autor (no se listan otros formatos) |
| Idiomas soportados | en, sql |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se anade sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only causal de 3.000 millones de parametros con plantilla de chat Qwen-2.5. El entrenamiento se realizo con QLoRA (cuantizacion 4-bit del modelo base) y los siguientes hiperparametros: rank r=16, alpha=32, dropout 0.0, y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La secuencia maxima fue de 2048 tokens, 3 epocas, batch size 2 por dispositivo con acumulacion de gradiente 8 (batch efectivo 16), optimizador adamw_8bit y learning rate 1e-4 con schedule coseno y 5% de warmup.

Un detalle tecnico destacable es el uso de loss solo sobre la respuesta (completion-only loss, `train_on_responses_only`), de modo que el modelo aprende a generar unicamente el SQL del turno del asistente y no a reproducir el esquema o la pregunta. El dataset de entrenamiento es el benchmark Spider de Yale, con un split curado y minado de fallos para incidir en los errores tipicos del modelo base. El formato de prompt serializa el esquema como sentencias CREATE TABLE con comentarios de clave foranea, y el system prompt instruye a devolver solo la consulta SQL sin explicacion.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural y un esquema de base de datos dado (Text-to-SQL en dominios cruzados).
- Manejo de esquemas multiples con relaciones entre tablas representadas mediante comentarios de clave foranea (FK).
- Salida restringida a la consulta SQL, sin explicaciones, lo que simplifica el parseo posterior.
- Soporte del template de chat de Qwen-2.5 (roles system, user, assistant).
- Capacidades heredadas del modelo base Qwen2.5-Coder-3B-Instruct (codigo, generacion de texto), aunque el adaptador esta especializado en SQL.
- Idioma de trabajo: ingles para la pregunta en lenguaje natural y SQL como lenguaje de salida.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito para este adaptador.

## Casos de uso

- Asistente de consultas para analistas de negocio: dado un esquema corporativo serializado y una pregunta en ingles, el modelo devuelve la consulta SQL lista para ejecutar, reduciendo la dependencia de un ingeniero de datos para consultas ad hoc.
- Generacion de SQL en herramientas de BI internas: integrado como paso previo a un motor SQL, permite que usuarios no tecnicos formulen preguntas y obtengan resultados sin escribir consultas.
- Enriquecimiento de pipelines de datos: el adaptador puede generar consultas de transformacion o seleccion a partir de descripciones textuales, como parte de un proceso ETL semiautomatizado con revision humana.
- Formacion y prototipado: por su tamano de 3B y su adaptador ligero, es adecuado para entornos de investigacion donde se quiere experimentar con Text-to-SQL sin grandes recursos de GPU.
- Evaluacion comparativa de tecnicas de especializacion: sirve como referencia de un enfoque QLoRA + minado de fallos sobre Spider frente a otros metodos de fine-tuning.
- Chatbot interno de soporte a datos: combinado con el modelo base, puede mantener conversaciones multi-turno donde el usuario refina la pregunta y el modelo regenera el SQL, siempre que se gestione el contexto dentro de los 2048 tokens de entrenamiento.
- Pruebas de integracion en CI para validacion de sintaxis: se puede usar como generador de consultas candidatas que luego se validan contra un parser SQL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en float16 ocupa aproximadamente 6 GB; el adaptador anadido es de ~0,4 GB. En cuantizacion de 4 bits el modelo base puede reducirse a unos 2-3 GB, aunque el autor solo documenta la carga en float16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float16 (por ejemplo RTX 3070/4060 Ti o superiores). Para 4-bit bastan 6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) y en Mac con memoria unificada suficiente.
- Opciones de despliegue: el autor documenta transformers + peft (con `merge_and_unload`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhuocNg9604/qwen2.5-coder-3b-text2sql-sft | 3B + LoRA rank 16 | no disponible | Text-to-SQL (Spider) | apache-2.0 | HuggingFace, 36 descargas |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | no disponible en la informacion | Generacion de codigo y texto general | apache-2.0 | HuggingFace (modelo base) |
| Otros adaptadores Text-to-SQL sobre Spider | no disponible | no disponible | Text-to-SQL | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada para establecer diferencias cuantitativas frente a alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion de tablas, columnas o funciones SQL inexistentes si el esquema no esta bien serializado o si la pregunta es ambigua.
- La ventana de contexto de entrenamiento es de 2048 tokens; esquemas grandes o conversaciones multi-turno largas pueden superar ese limite y degradar la calidad.
- El adaptador esta especializado en ingles y SQL; no se documenta soporte multilingue ni de otras lenguas naturales.
- Al ser un adaptador LoRA, no puede ejecutarse de forma autonoma: requiere el modelo base Qwen/Qwen2.5-Coder-3B-Instruct y la libreria peft.
- El entrenamiento se ha realizado sobre el benchmark Spider, de modo que el rendimiento fuera de ese dominio o en esquemas muy distintos al de Spider no esta garantizado.
- La salida se restringe a SQL sin explicacion; si se necesita justificacion o razonamiento, hay que trabajar con el modelo base sin el adaptador o anadir posprocesado.
- No se documentan sesgos especificos ni evaluaciones de seguridad del adaptador.
- Aunque la licencia es Apache-2.0 (permite uso comercial), conviene verificar las condiciones del modelo base y del dataset Spider para su uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/PhuocNg9604/qwen2.5-coder-3b-text2sql-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Dataset Spider: https://huggingface.co/datasets/spider (referencia del benchmark Yale Spider)
- Repositorio de PEFT: https://github.com/huggingface/peft
