# GPTpasta/qwen2.5-1.5b-text2sql-lora

## Resumen

`GPTpasta/qwen2.5-1.5b-text2sql-lora` es un ajuste fino mediante QLoRA del modelo `Qwen/Qwen2.5-1.5B-Instruct` orientado a la generacion de consultas SQL a partir de esquemas de base de datos y preguntas en lenguaje natural (text-to-SQL). Lo desarrolla el usuario independiente GPTpasta y se publica bajo licencia Apache 2.0, con pesos en formato safetensors (adaptador LoRA) y una version cuantizada en GGUF Q4_K_M para inferencia en CPU mediante llama.cpp.

El modelo resuelve el problema de traducir preguntas en ingles a sentencias SQL de solo lectura sobre un esquema dado, incorporando una capa de validacion mediante parser SQL que rechaza sentencias distintas de `SELECT` o `WITH` y bloquea operaciones de escritura o administrativas. Su interes practico radica en el tamano reducido (1.540 millones de parametros, 934,7 MB en Q4_K_M) y en que puede ejecutarse en CPU con un consumo inferior a 1,2 GB de RAM, lo que lo hace apto para entornos con recursos limitados.

La model card es inusualmente transparente: documenta que el ajuste fino sobre `b-mc2/sql-create-context` provoco transferencia negativa en el benchmark Spider, reduciendo la precision de ejecucion del 45,65 % del modelo base al 15,76 % tras el entrenamiento. Esta circunstancia condiciona su uso en produccion y debe tenerse en cuenta antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct) con adaptador QLoRA |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,08 bits por peso); adaptador LoRA en safetensors; el modelo base puede cargarse en 4 bits |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de 1,54 mil millones de parametros. Sobre esa base se aplico un ajuste fino con QLoRA, es decir, cuantizacion en 4 bits del modelo base mas entrenamiento de adaptadores de bajo rango. El entrenamiento se realizo en una GPU de portatil NVIDIA GeForce RTX 4060 con 8 GB de VRAM, lo que da una idea del reducido coste computacional del proceso.

El conjunto de datos empleado fue `b-mc2/sql-create-context`, con 20.000 muestras de esquemas sinteticos de una sola tabla (estilo WikiSQL). No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de seguridad: se incorpora un parser SQL que valida la salida y garantiza que solo se emitan sentencias de lectura (`SELECT` o `WITH`), bloqueando `DROP`, `DELETE`, `UPDATE`, `INSERT`, multiples sentencias y pragmas administrativas. La model card reconoce explicitamente que el ajuste provoco sobreajuste a las convenciones de alias sinteticos `T1`/`T2` del dataset, con perdida de rendimiento en esquemas relacionales multi-tabla.

## Capacidades

- Generacion de consultas SQL de solo lectura (`SELECT` y `WITH`) a partir de un esquema DDL y una pregunta en lenguaje natural.
- Formato de salida en SQL crudo sin markdown ni explicaciones adicionales, segun el prompt de sistema documentado.
- Validacion integrada mediante parser SQL que rechaza operaciones de escritura, multiples sentencias y pragmas administrativos.
- Conversacion multi-turno heredada del modelo base Qwen2.5-1.5B-Instruct (formato ChatML con `<|im_start|>` y `<|im_end|>`).
- Inferencia en CPU mediante llama.cpp con el fichero GGUF Q4_K_M.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling y agentes: no documentadas especificamente para este ajuste; el modelo base Qwen2.5-Instruct las soporta, pero no se garantiza su conservacion tras el ajuste fino.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Asistente SQL en herramientas de BI: el modelo traduce preguntas de analistas a consultas `SELECT` sobre el esquema de un data warehouse, con la garantia del parser de que no se emitiran sentencias destructivas.
- Generacion de consultas en entornos de solo lectura: al bloquear `INSERT`, `UPDATE` y `DELETE`, puede desplegarse contra replicas de lectura o usuarios de base de datos con permisos restringidos sin riesgo de modificacion accidental.
- Prototipado rapido en portatiles: con 934,7 MB en Q4_K_M y menos de 1,2 GB de RAM, permite probar flujos text-to-SQL en maquinas sin GPU dedicada mediante llama.cpp.
- Educacion y formacion en SQL: sirve como ejemplo didactico de ajuste fino con QLoRA y de analisis de transferencia negativa entre datasets, documentado en `docs/error_analysis.md`.
- Preprocesado en pipelines de datos: generacion de consultas sencillas sobre esquemas de una sola tabla, el escenario para el que fue entrenado (`sql-create-context`).
- Base para iteraciones posteriores: al ser un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, puede reentrenarse o combinarse con otros adaptadores para corregir la transferencia negativa documentada.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto completo de desarrollo de Spider (1.034 consultas multi-tabla):

| Configuracion | Precision de ejecucion | Tasa de SQL valido | Huella de memoria |
|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base, 4 bits) | 45,65 % (472/1034) | 71,66 % (741/1034) | ~2,2 GB VRAM |
| + ajuste QLoRA (`b-mc2/sql-create-context`) | 15,76 % (163/1034) | 49,71 % (514/1034) | ~3,1 GB VRAM |
| GGUF Q4_K_M (CPU) | igual que fp16 | igual que fp16 | < 1,2 GB RAM |

Rendimiento en CPU (4 hilos): 262 tokens/s en evaluacion de prompt y 21,9 tokens/s en generacion (~45,6 ms por token). El fichero GGUF Q4_K_M ocupa 934,7 MB con 5,08 bits por peso.

## Requisitos de hardware

- VRAM para inferencia con adaptador LoRA en 4 bits: aproximadamente 3,1 GB (medido en la evaluacion del ajuste).
- VRAM del modelo base sin ajuste en 4 bits: aproximadamente 2,2 GB.
- RAM para GGUF Q4_K_M en CPU: menos de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el adaptador en 4 bits; el entrenamiento se realizo en una RTX 4060 Laptop de 8 GB. Para mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (GGUF), Transformers + PEFT (adaptador safetensors), y cualquier runtime compatible con GGUF (Ollama, entre otros). vLLM y TGI no estan documentados para este ajuste.
- Latencia y throughput: 21,9 tokens/s de generacion y 262 tokens/s de evaluacion de prompt en CPU con 4 hilos; no se documentan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision Spider (dev) | Licencia | Formatos |
|---|---|---|---|---|---|
| GPTpasta/qwen2.5-1.5b-text2sql-lora | 1,54 B | no disponible | 15,76 % (tras ajuste) | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | no disponible | 45,65 % (4 bits) | Apache 2.0 | safetensors, GGUF |
| Alternativas text-to-SQL de mayor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es contra el propio modelo base, que supera al ajuste en 29,89 puntos porcentuales de precision de ejecucion en Spider. No se dispone de datos de otros modelos text-to-SQL en la informacion proporcionada.

## Limitaciones y advertencias

- Transferencia negativa documentada: el ajuste reduce la precision de ejecucion en Spider del 45,65 % al 15,76 %, por lo que no se recomienda su uso directo en esquemas relacionales multi-tabla sin reentrenamiento.
- Sobreajuste a esquemas sinteticos de una sola tabla: el entrenamiento con `sql-create-context` provoca errores de atribucion de alias en esquemas DDL con multiples tablas.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Riesgo de alucinacion: como todo modelo generativo, puede producir SQL sintacticamente valido pero semanticamente incorrecto; el parser solo garantiza la forma de la sentencia, no su correccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe verificarse por separado.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Capacidades de tool calling y agentes no garantizadas tras el ajuste fino, aunque el modelo base las soporte.
- El parser de seguridad bloquea operaciones legitimas como `INSERT` o `UPDATE`, lo que limita su uso a escenarios de solo lectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GPTpasta/qwen2.5-1.5b-text2sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Benchmark Spider: https://yale-lily.github.io/spider
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Analisis de errores del autor: `docs/error_analysis.md` (referenciado en la model card; no se proporciona URL directa)
