# ragul6606/text2sql-qwen2.5-coder-1.5b-gguf

## Resumen

text2sql-qwen2.5-coder-1.5b-gguf es un ajuste fino del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, especializado en la traduccion de lenguaje natural a SQL (text-to-SQL). Lo publica el usuario ragul6606 en HuggingFace y se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, pensado para inferencia local en hardware modesto. El modelo resuelve el problema de generar consultas SQL validas a partir de un esquema de base de datos y una pregunta en ingles.

Con 1.543.714.304 parametros (1,5B), se posiciona como una opcion ligera frente a modelos genericos de mayor tamano para tareas de generacion de SQL. El ajuste se realizo mediante QLoRA sobre el dataset b-mc2/sql-create-context (CC-BY-4.0), que contiene pares de esquema, pregunta y consulta SQL. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en la demanda de modelos pequenos y desplegables en local para asistentes de bases de datos, pipelines de analitica y herramientas de BI, donde la latencia y el coste de inferencia importan mas que la capacidad generalista. No obstante, el autor advierte que el entrenamiento se limita a consultas simples de una sola tabla y que no se ha evaluado mediante ejecucion real contra bases de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, con atencion causal estandar y las optimizaciones propias de la familia Qwen2.5 (RoPE, normalizacion RMSNorm, activacion SwiGLU). Sobre esta base se aplico un ajuste fino supervisado mediante QLoRA, es decir, cuantizacion del modelo base a 4 bits durante el entrenamiento y adaptadores de bajo rango, lo que reduce los requisitos de memoria del proceso.

Los datos de entrenamiento provienen del dataset b-mc2/sql-create-context, compuesto por tripletas de esquema DDL, pregunta en lenguaje natural y consulta SQL de referencia, en estilo WikiSQL/Spider. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada es la cuantizacion final a Q4_K_M para distribucion en GGUF, orientada a inferencia local. El autor recomienda usar temperatura 0 y un formato de prompt concreto con un system prompt fijo.

## Capacidades

- Generacion de consultas SQL a partir de un esquema de base de datos y una pregunta en ingles.
- Soporte de esquemas expresados en DDL (CREATE TABLE con columnas y tipos).
- Formato conversacional con roles system y user, compatible con endpoints de chat.
- Respuesta restringida a una unica consulta SQL, sin explicaciones adicionales, cuando se usa el system prompt recomendado.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se documenta modo thinking ni decodificacion especulativa.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas en ingles sobre un esquema conocido a SQL ejecutable, reduciendo la barrera de entrada para usuarios no tecnicos en herramientas de BI. Adecuado por su tamano reducido y su especializacion en una sola tarea.
- Generacion de SQL en pipelines de analitica interna: integrado como paso previo a la ejecucion contra una base de datos de solo lectura, permite automatizar informes recurrentes a partir de plantillas de pregunta.
- Prototipado de interfaces de lenguaje natural sobre bases de datos: al caber en GPU de consumo y distribuirse en GGUF, permite iterar rapidamente en local sin coste de API.
- Educacion y formacion en SQL: el modelo puede servir como generador de ejemplos de consultas a partir de enunciados, util en entornos docentes con esquemas sencillos de una tabla.
- Herramientas de desarrollo con Ollama o llama.cpp: su formato GGUF Q4_K_M facilita la integracion en extensiones de editor o CLI para generar consultas de forma offline.
- Filtrado y preprocesado de datos: generar consultas de seleccion simples sobre tablas planas en tareas ETL ligeras donde la complejidad del esquema es baja.
- Evaluacion comparativa de text-to-SQL: sirve como linea base pequena y reproducible para investigacion sobre generacion de SQL en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados con columnas `exact_match` y `valid_sql` para los modelos `base` y `fine-tuned`, pero los valores aparecen como marcadores `X` sin cifras publicadas. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con cuantizacion Q4_K_M (el repo GGUF ocupa 1,0 GB), mas overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo OpenAI, aunque no se detalla la integracion con vLLM o TGI (vLLM y TGI priorizan safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| text2sql-qwen2.5-coder-1.5b-gguf | 1,5B | no disponible | GGUF Q4_K_M | Apache 2.0 | Ajuste QLoRA especifico para text-to-SQL, solo ingles |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32.768 tokens (segun el modelo base) | safetensors, GGUF | Apache 2.0 | Modelo generalista de codigo; no especializado en SQL |
| Modelos text-to-SQL de mayor tamano (p. ej. variantes de 7B) | 7B o superior | variable | variable | variable | Mayor capacidad potencial, pero mas exigentes en VRAM; no se dispone de comparativa numerica en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos publicados para este ajuste frente a alternativas.

## Limitaciones y advertencias

- Entrenado principalmente con consultas simples de una sola tabla (estilo WikiSQL/Spider); el rendimiento en esquemas complejos, joins multiples o subconsultas no esta garantizado.
- No evaluado mediante ejecucion real contra bases de datos, segun la propia model card; las metricas de validez sintactica no garantizan correccion semantica.
- Riesgo de alucinacion: puede generar columnas o tablas inexistentes en el esquema proporcionado.
- Solo soporta ingles; las preguntas en castellano no estan cubiertas por el entrenamiento declarado.
- Se recomienda revisar el SQL generado antes de ejecutarlo y usar una conexion de solo lectura para mitigar riesgos de escritura o borrado accidental.
- No se documentan sesgos especificos, pero al derivar de un modelo generalista puede heredar sesgos del corpus original de Qwen2.5.
- Licencia Apache 2.0: permite uso comercial, pero el dataset de entrenamiento (b-mc2/sql-create-context) es CC-BY-4.0, lo que puede requerir atribucion.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ragul6606/text2sql-qwen2.5-coder-1.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
