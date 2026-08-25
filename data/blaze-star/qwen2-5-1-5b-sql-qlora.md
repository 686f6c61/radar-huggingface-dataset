# blaze-star/qwen2.5-1.5b-sql-qlora

## Resumen

El modelo `blaze-star/qwen2.5-1.5b-sql-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, especializado en la tarea de text-to-SQL: dado un esquema de tabla SQL (CREATE TABLE) y una pregunta en lenguaje natural, genera una consulta SQLite válida. Lo desarrolla el autor blaze-star y se publica bajo licencia Apache-2.0.

El adaptador añade 18,5 millones de parámetros entrenables (1,18 % del total) sobre un modelo de 1,56 mil millones de parámetros, y se ha fine-tuneado con el dataset `b-mc2/sql-create-context` (78 577 filas, con división estricta de train/val/test para evitar fugas). El resultado es una mejora de +25,1 puntos en exact match respecto al modelo base sin entrenar (49,7 % → 74,8 %), con una conformidad de formato del 99,9 %.

Es relevante porque demuestra que un fine-tuning eficiente con QLoRA sobre un modelo pequeño (1,5B) puede alcanzar un rendimiento competitivo en una tarea específica como la generación de SQL, con un coste de entrenamiento y de inferencia muy bajo. El adaptador está pensado para integrarse en pipelines de generación de consultas SQL, asistentes de datos o herramientas de análisis automatizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) con adaptadores LoRA |
| Parametros totales | 1,56B (modelo base) + 18,5M entrenables (adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base; el adaptador se entrena con contextos cortos) |
| Tipos de cuantizacion | Base en 4-bit NF4 (doble cuantizacion, computo bf16); adaptador en fp16/bf16 |
| Idiomas soportados | Ingles (entrenamiento solo en ingles; el base es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-1.5B-Instruct`, un transformer causal de 1,5 mil millones de parametros con atencion estandar, entrenado por Alibaba sobre hasta 18 billones de tokens (segun la documentacion oficial de Qwen2.5). Soporta hasta 128K tokens de contexto y es multilingue, aunque el adaptador se ha entrenado exclusivamente con datos en ingles.

El adaptador se ha obtenido mediante QLoRA: el modelo base se congela en cuantizacion 4-bit NF4 (con doble cuantizacion y computo en bf16) y se anaden adaptadores LoRA con r=16, alpha=32 y dropout=0,05 sobre las proyecciones `q, k, v, o, gate, up, down_proj`. Solo se entrenan 18,5 millones de parametros (1,18 % del total). El dataset de entrenamiento es `b-mc2/sql-create-context`, que contiene pares de (esquema CREATE TABLE, pregunta en lenguaje natural) y su consulta SQLite correspondiente. Se deduplicaron 4 filas exactas sobre 78 577, se barajaron con semilla 42 y se separaron en 12 000 train / 750 val / 1 000 test, con verificacion programatica de que no hay solapamiento entre splits.

El entrenamiento se realizo con el optimizador p (la informacion se corta en la model card, no se especifica el nombre completo). La evaluacion se hizo sobre el split de test held-out (1 000 ejemplos nunca vistos en entrenamiento) con decodificacion greedy, y se comparo contra tres lineas base del modelo sin fine-tune: 0-shot en 4-bit, 3-shot en 4-bit y 0-shot en fp16.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema CREATE TABLE y una pregunta en lenguaje natural.
- Generacion de texto en general (hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct).
- Soporte de chat y conversacion (modelo instruct).
- No incluye tool calling especifico, pero puede integrarse en agentes que necesiten generar SQL.
- Capacidad multilingue del modelo base, aunque el adaptador solo se ha entrenado en ingles y puede degradarse en otros idiomas.
- No soporta vision ni audio; es exclusivamente texto.

## Casos de uso

- Asistente de consultas SQL para analistas de datos: el modelo puede convertir preguntas en lenguaje natural en consultas SQLite validas, acelerando la exploracion de bases de datos relacionales.
- Automatizacion de informes: integrado en un pipeline que recibe preguntas de negocio y genera las consultas SQL necesarias para extraer los datos de un data warehouse.
- Herramienta educativa para aprender SQL: los estudiantes pueden escribir preguntas en lenguaje natural y recibir la consulta SQL equivalente, con la posibilidad de comparar con la referencia.
- Generacion de consultas en aplicaciones low-code/no-code: permite a usuarios no tecnicos obtener datos de una base SQLite sin escribir SQL manualmente.
- Prototipado rapido de consultas en entornos de desarrollo: los desarrolladores pueden usar el modelo para generar consultas iniciales y luego ajustarlas manualmente.
- Integracion en chatbots de soporte interno: un bot que responde preguntas sobre datos de la empresa generando y ejecutando consultas SQL en tiempo real.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (sobre el split held-out de 1 000 ejemplos de `b-mc2/sql-create-context`) son:

| Modelo | Exact match | Token F1 | Conformidad de formato |
|---|---|---|---|
| Base, 0-shot (4-bit) | 49,7 % | 0,925 | 26,7 % |
| Base, 3-shot (4-bit) | 52,3 % | 0,921 | 99,3 % |
| Base, 0-shot (fp16) | 57,3 % | no disponible | 99,4 % |
| **QLoRA fine-tuned** | **74,8 %** | **0,973** | **99,9 %** |

El model-index oficial reporta exact match normalizado de 0,748 y SQL token F1 de 0,9732 sobre el mismo split. La mejora frente al base 0-shot en 4-bit es de +25,1 puntos en exact match (+51 % relativo). El autor aclara que la metrica de exact match es estricta: consultas semanticamente equivalentes con diferencias en alias o literales cuentan como fallo, por lo que el rendimiento real en terminos de correccion SQL es superior al que sugiere el numero.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0,1 GB, pero requiere cargar el modelo base completo. Con cuantizacion 4-bit, el modelo base de 1,5B ocupa aproximadamente 1 GB de VRAM, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 de 8 GB, RTX 4060 de 8 GB, o incluso en CPU con suficiente RAM).
- En fp16, el modelo base ocupa unos 3 GB de VRAM, tambien asequible en GPUs de gama media.
- Para inferencia, se puede usar `transformers` con `PeftModel`, o bien el modelo fusionado `blaze-star/qwen2.5-1.5b-sql-qlora-merged` que no requiere cargar el adaptador por separado.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), llama.cpp (si se fusiona a GGUF), Ollama (si se convierte), o TGI.
- La latencia es baja al tratarse de un modelo de 1,5B; en una GPU moderna se pueden obtener decenas de generaciones por segundo con decodificacion greedy.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros adaptadores text-to-SQL en la informacion disponible. Como referencia, el modelo base Qwen2.5-1.5B-Instruct sin fine-tune obtiene un 49,7 % de exact match en 0-shot (4-bit) y un 57,3 % en fp16, mientras que el adaptador QLoRA alcanza el 74,8 %. Otros modelos de tamano similar (por ejemplo, CodeLlama-7B o Mistral-7B) podrian usarse como base para la misma tarea, pero no hay datos comparativos publicados en esta ficha.

## Limitaciones y advertencias

- El adaptador solo se ha entrenado con datos en ingles; el rendimiento en otros idiomas no esta garantizado y probablemente se degrade.
- Solo genera consultas SQLite; no soporta otros dialectos SQL (PostgreSQL, MySQL, etc.) sin adaptacion adicional.
- La metrica de exact match es estricta y puede penalizar consultas semanticamente correctas con diferencias de estilo (alias, comillas, literales).
- El modelo depende del system prompt especifico indicado en la model card; sin el, la precision cae notablemente.
- Riesgo de alucinacion en esquemas complejos o con muchos campos; se recomienda validar las consultas generadas antes de ejecutarlas en produccion.
- El adaptador no incluye capacidades de vision, audio ni tool calling avanzado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 tiene su propia licencia (Apache-2.0 tambien, segun la documentacion oficial), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/blaze-star/qwen2.5-1.5b-sql-qlora
- Modelo fusionado (standalone): https://huggingface.co/blaze-star/qwen2.5-1.5b-sql-qlora-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio GitHub (mencionado en la model card): https://github.com/harshb20/qwen2.5-1.5b-sql-qlora
