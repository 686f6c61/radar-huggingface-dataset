# impacte/bonsai-1.7b-text2sql-onnx

## Resumen

bonsai-1.7b-text2sql-onnx es un modelo de generacion de texto especializado en text-to-SQL, publicado por el usuario impacte en HuggingFace. Se trata de una exportacion a ONNX del modelo Bonsai-1.7B afinado para traducir preguntas en lenguaje natural a consultas SQL sobre esquemas de bases de datos SQLite y DuckDB. El modelo recibe el esquema de la base de datos en el mensaje de sistema y devuelve una unica consulta SQL, sin explicaciones ni bloques de codigo.

El modelo parte de prism-ml/Bonsai-1.7B-unpacked, una arquitectura Qwen3ForCausalLM de 1,7 mil millones de parametros con formato de chat ChatML, y se ha afinado mediante LoRA (r=16, alpha=32) sobre las proyecciones de atencion y MLP. El resultado son tres grafos ONNX (fp32, int4 e int8) que exponen la cache KV y estan pensados para onnxruntime en CPU o GPU, asi como para navegadores y entornos edge mediante transformers.js.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en el propio dispositivo (la variante int4 ocupa 2,2 GB) frente a soluciones text-to-SQL basadas en modelos mucho mayores o en servicios en la nube. Comparte linaje con la version GGUF/Ollama del mismo ajuste y esta publicada bajo licencia Apache-2.0, aunque los datos de entrenamiento son CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 1,7B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (referencia), int4 (MatMulNBits, weight-only), int8 (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo); datasets de entrenamiento CC BY-SA 4.0 |
| Formato de pesos | ONNX (model.onnx, model_q4.onnx, model_q8.onnx) |
| Modelo base | prism-ml/Bonsai-1.7B-unpacked |
| Formato de chat | ChatML |
| Tamano del repositorio | 13,5 GB |
| Precision de entrenamiento | LoRA en fp (17,4M parametros entrenables, 1,0%) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3ForCausalLM, un transformer decoder-only con atencion causal y tokenizador propio de la familia Qwen3, heredado del modelo base prism-ml/Bonsai-1.7B-unpacked. El ajuste se realizo mediante LoRA con rango 16 y alpha 32 aplicado a las proyecciones de atencion y MLP, lo que supone 17,4 millones de parametros entrenables (el 1,0% del total). El entrenamiento duro 3.556 pasos (2 epocas) y alcanzo una train_loss de 0,445 y una eval_loss de 0,372.

Los datos de entrenamiento combinan dos conjuntos: Spider (8.025 filas, Yale / XLang NLP Lab), orientado a SQLite, y duckdb-text2sql-25k de MotherDuck (22.378 filas), orientado a DuckDB. No se documenta el uso de RLHF ni DPO. La innovacion practica del repositorio es la exportacion a ONNX con cache KV completa (entradas input_ids, attention_mask y position_ids; salidas present.*), que habilita decodificacion incremental en onnxruntime y en navegadores. El autor advierte explicitamente de que no debe usarse cuantizacion dinamica int8 (quantize_dynamic), ya que cuantiza activaciones y degrada el decoder a texto sin sentido; en su lugar deben usarse los grafos weight-only.

## Capacidades

- Generacion de consultas SQL unicas a partir de una pregunta en lenguaje natural y un esquema proporcionado en el mensaje de sistema.
- Soporte de dialectos SQLite y DuckDB, los dos cubiertos por los datos de entrenamiento.
- Salida limpia: el modelo devuelve solo la consulta SQL, sin markdown ni explicaciones, segun su formato de prompt.
- Generacion de texto conversacional (pipeline text-generation y tag "conversational"), aunque el ajuste lo orienta a text-to-SQL.
- Inferencia incremental con cache KV, lo que permite decodificacion token a token eficiente.
- Ejecucion en onnxruntime (CPU/GPU) y en navegador/edge mediante transformers.js (WebGPU para int4, WASM para int8).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Consultas ad-hoc sobre bases de datos SQLite o DuckDB: el usuario plantea una pregunta en lenguaje natural, se inyecta el esquema en el mensaje de sistema y el modelo devuelve la consulta que puede ejecutarse directamente contra la base de datos.
- Asistente de business intelligence para perfiles no tecnicos: se integra en una herramienta interna donde analistas de negocio escriben preguntas y el modelo traduce a SQL, con el esquema de cada tabla disponible como contexto.
- Generacion de SQL en pipelines de datos y ETL: el modelo puede producir de forma automatizada consultas de extraccion o agregacion a partir de plantillas de preguntas, reduciendo el trabajo manual de escritura de SQL repetitivo.
- Chatbot de soporte sobre un esquema fijo: al conocer el esquema objetivo, responde preguntas recurrentes ("cuantos pedidos se cancelaron el mes pasado") generando la consulta correspondiente, con la ventaja de que el modelo no necesita acceso directo a la base de datos.
- Playground local en el navegador: gracias a la exportacion ONNX, la variante int4 puede ejecutarse con transformers.js y WebGPU, y la int8 con WASM, permitiendo un entorno de generacion de SQL que funciona sin servidor y sin enviar datos fuera del dispositivo.
- Autocompletado o validacion de SQL en editores e IDEs: el modelo puede sugerir consultas a partir de un esquema abierto y de la intencion del usuario expresada en lenguaje natural.
- Analisis exploratorio de datos (EDA): al cargar un CSV en DuckDB, el modelo genera rapidamente consultas de agregacion, recuento o filtrado sobre columnas concretas del esquema.
- Despliegue en entornos con requisitos de privacidad u offline: al ejecutarse en CPU o en GPU consumer y no requerir servicios externos, encaja en escenarios donde los datos no pueden salir de la infraestructura local.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy y coincidencia exacta de cadena tras normalizacion, sobre el split de validacion de 1.519 ejemplos (salvo donde se indique):

| Modelo | Tamano | Global | Spider | MotherDuck |
|---|---:|---:|---:|---:|
| Base Bonsai-1.7B | 248 MB | 3,4% | 8,7% | 1,5% |
| GGUF :q1_0 (Ollama) | 318 MB | 26,5% | 39,9% | 21,7% |
| GGUF :f16 (Ollama) | 3,4 GB | 28,8% | 45,1% | 22,9% |
| ONNX int4 (este modelo) | 2,2 GB | ~22,5%* | 45,5%* | 13,8%* |

El asterisco indica resultados medidos sobre un subconjunto de 40 ejemplos en CPU: el autor senala que el resultado en Spider iguala al del GGUF f16, mientras que la cifra de MotherDuck es ruidosa con ese tamano de muestra. La coincidencia exacta es estricta y muchos fallos son semanticamente correctos (por ejemplo, `START WITH 1` frente a `START 1`), por lo que la exactitud de ejecucion real es superior.

## Requisitos de hardware

- VRAM estimada: la variante int4 (2,2 GB de pesos) requiere aproximadamente 3-4 GB de VRAM si se ejecuta en GPU; la int8 (2,9 GB) en torno a 4-5 GB; la fp32 (7,6 GB) necesita del orden de 8-10 GB de VRAM.
- GPU recomendadas: para int4 e int8 basta con cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060 o superiores); para fp32 conviene una GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) o una GPU de centro de datos (A100, H100).
- Cabe en GPU consumer: si, las variantes int4 e int8 caben holgadamente en GPU consumer, y la int4 es ademas la opcion recomendada por el autor para CPU.
- Despliegue: onnxruntime (Python, con CPUExecutionProvider o proveedor GPU), transformers.js para navegador/edge (WebGPU con el grafo int4, WASM con el int8), y el script serve_onnx.py incluido en el repositorio de entrenamiento. No se contempla Ollama como destino de estos grafos (para eso existe la version GGUF).
- Latencia y rendimiento: no disponibles. El autor solo indica cualitativamente que el grafo int4 es el mas rapido en CPU, y advierte que no debe emplearse cuantizacion dinamica int8 porque degrada la salida a texto sin sentido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos text-to-SQL externos en la informacion proporcionada. La comparativa posible se limita a las variantes del propio ajuste y su hermano GGUF:

| Version | Precision | Tamano | Global | Spider | MotherDuck | Formato | Licencia |
|---|---|---:|---:|---:|---:|---|---|
| ONNX int4 (este) | int4 weight-only | 2,2 GB | ~22,5%* | 45,5%* | 13,8%* | ONNX | Apache-2.0 |
| ONNX int8 | int8 weight-only | 2,9 GB | no disponible | no disponible | no disponible | ONNX | Apache-2.0 |
| ONNX fp32 | fp32 | 7,6 GB | no disponible | no disponible | no disponible | ONNX | Apache-2.0 |
| GGUF :q1_0 | cuantizacion 1 bit | 318 MB | 26,5% | 39,9% | 21,7% | GGUF | Apache-2.0 |
| GGUF :f16 | fp16 | 3,4 GB | 28,8% | 45,1% | 22,9% | GGUF | Apache-2.0 |

El asterisco recuerda que las cifras del ONNX int4 proceden de un subconjunto de 40 ejemplos, no del split completo de 1.519.

## Limitaciones y advertencias

- Cobertura de dialectos limitada: entrenado sobre Spider (SQLite) y MotherDuck (DuckDB); cualquier otro dialecto queda fuera de distribucion.
- Tamano reducido: con 1,7B parametros, las consultas con multiples joins, subconsultas anidadas o logica compleja pueden fallar.
- Dependencia del esquema: el modelo no tiene acceso a la base de datos; si el esquema no se proporciona o es ambiguo, puede inventar tablas o columnas inexistentes (riesgo de alucinacion estructural).
- Idiomas soportados no documentados: el entrenamiento se realiza sobre datasets mayoritariamente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia de datos: el modelo se publica como Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0, por lo que el autor recomienda tratar los pesos derivados como share-alike. Conviene revisar este punto antes de un uso comercial.
- Cuantizacion: la cuantizacion dinamica int8 (quantize_dynamic) rompe el decoder; solo son validos los grafos weight-only incluidos.
- Madurez: el repositorio no presenta descargas ni likes, y varias cifras de evaluacion se basan en un subconjunto pequeno de ejemplos, por lo que la validacion comunitaria es practicamente nula.
- Validacion de salida: se recomienda ejecutar y validar la consulta generada antes de usarla contra una base de datos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impacte/bonsai-1.7b-text2sql-onnx
- Version GGUF/Ollama del mismo ajuste: https://ollama.com/oamazonasgabriel/bonsai-1.7b-text2sql
- Modelo base: https://huggingface.co/prism-ml/Bonsai-1.7B-unpacked
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
- Dataset MotherDuck duckdb-text2sql-25k: https://huggingface.co/datasets/motherduckdb/duckdb-text2sql-25k
- Referencia academica de Spider: Yu et al., "Spider: A Large-Scale Human-Labeled Dataset for Complex and Cross-Domain Semantic Parsing and Text-to-SQL Task", EMNLP 2018.
