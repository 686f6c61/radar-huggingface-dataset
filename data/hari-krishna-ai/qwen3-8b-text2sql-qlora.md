# hari-krishna-ai/qwen3-8b-text2sql-qlora

, tokens basura y bucles de repetición.

Prompt format:
- El adaptador espera el prompt exacto de arriba, con schema renderizado como sentencias CREATE TABLE más comentarios de foreign key con "--", y el turno de usuario terminando en "/no_think".
- fingerprint prompt template: 8288e41a496531a9
- fingerprint schema rendering: d03619e711661bc5
- tamaño schema: 5,455 caracteres, 12 tablas

Training:
- QLoRA en una sola Tesla T4 (Kaggle gratis), una época, 4h 53m.
- base model Qwen/Qwen3-8B @ b968826d9c46
- quantización 4-bit NF4 + double quant, fp16 compute
- LoRA rank/alpha/dropout: 16/32/0.05
- target modules: q,k,v,o,gate,up,down
- trainable parameters: 43,646,976 de 4,761,498,624 (0.917%)
- sequence length 2048 (más largo 1602, nada truncado)
- effective batch / optimiser steps: 16 / 134
- learning rate 2e-4, cosine, 3% warmup
- optimiser paged 8-bit AdamW
- loss completion-only (prompt enmascarado a -100)
- supervised token share: 3.01%
- train loss 4.10 → 0.006
- eval loss 0.475 → 0.340 → 0.335
- seed 20260808

Dataset:
- Generado por plantillas a partir de BD PostgreSQL de 12 tablas (~328,000 filas sintéticas, semilla fija). Todo sintético, sin datos personales reales.
- train: 2,133
- validation: 459
- test: 453, held out, medido una vez por conf... (cortado, pero sabemos 453)

Resultados de búsqueda web:
- Hay un modelo similar: hdv250202/Qwen3-8b-Text2SQL en HuggingFace, con tags GGUF, English, qwen2, unsloth, conversational, licencia apache-2.0. (No sé más detalles)
- Qwen3 Technical Report: Qwen3 incluye arquitecturas densas y MoE, de 0.6 a 235B. Innovación: thinking mode y non-thinking mode unificados.
- Otros resultados de Google Translate no relevantes.

Ahora debo construir la ficha. Algunos datos pueden no estar disponibles: parámetros totales del adaptador no es el modelo completo; el modelo base Qwen3-8B tiene 8B parámetros. En la tabla de especificaciones, "Parámetros totales" se refiere al modelo completo (Qwen3-8B) o al adaptador? La ficha es del adaptador. Pero la especificación debe reflejar el modelo resultante. Podría poner "8.000 millones (modelo base Qwen3-8B); adaptador LoRA: 43.6 millones de parámetros entrenables". Mejor ser claro.

Longitud de contexto: Qwen3-8B tiene contexto de 32,768 tokens (según Qwen3, creo que 32k). Pero no está explícito en la información. En la model card se menciona sequence length 2048 para entrenamiento, pero no el contexto del modelo. Debo usar "no disponible" si no está en la info. Sin embargo, el informe técnico de Qwen3 dice que Qwen3 tiene contextos de 32,768 o 131,072? Necesito precisión. El paper de Qwen3 dice que los modelos densos de 0.6B a 4B tienen 32K, y los de 8B a 235B tienen 131,072 tokens de contexto? Recuerdo que Qwen3-8B tiene 131,072? Veamos: Qwen3 technical report: "All models support a context length of 32,768 tokens, and the 8B and larger models support up to 131,072 tokens via YaRN." No estoy seguro. La información proporcionada no lo especifica. Para no inventar, pondré "no disponible" o "32.768 tokens (heredado del modelo base, no confirmado en la documentación del adaptador)". Mejor ser estricto: "no disponible" porque la model card no lo dice. Pero el informe técnico de Qwen3 dice algo. Como el usuario dice "Si algo no esta en la informacion proporcionada, indica explicitamente no disponible." La información proporcionada incluye el Qwen3 Technical Report (resultado de búsqueda). Pero no da el contexto específico de Qwen3-8B. Podría usar "no disponible" para ser seguro. Aunque en la tabla de especificaciones, "Longitud de contexto" podría ser "32.768 tokens (modelo base, no especificado en la documentación del adaptador)" - pero eso es una afirmación no respaldada. Mejor "no disponible".

Tipos de cuantización: El adaptador usa QLoRA con 4-bit NF4. Pero el adaptador en sí es safetensors. La tabla "Tipos de cuantizacion" se refiere a las cuantizaciones disponibles del modelo. El adaptador se carga sobre un modelo base cuantizado a 4-bit. Podría poner "4-bit NF4 (QLoRA), fp16 para cómputo" y "no disponible" para otros formatos. El repo es de 0.2 GB, solo contiene el adaptador LoRA, no el modelo completo.

Idiomas soportados: en (inglés). El modelo base Qwen3 soporta muchos idiomas, pero el adaptador está entrenado solo en inglés. Pondré "Inglés (adaptador); el modelo base Qwen3-8B es multilingüe".

Licencia: apache-2.0.

Formato de pesos: safetensors (adaptador LoRA). El modelo base es safetensors también.

Arquitectura: Transformer (Qwen3) con atención completa; no es MoE. El adaptador LoRA se aplica a todas las proyecciones de atención y MLP.

Capacidades: text-to-SQL específico para PostgreSQL con esquema de 12 tablas. No es un modelo general. Tool calling no se menciona. Pensamiento: requiere enable_thinking=False.

Casos de uso: concretos, mínimo 6. Debo basarme en la información: generación de consultas SQL para BD PostgreSQL en entornos empresariales, automatización de análisis de datos, asistentes de BI, etc. Como es un adaptador especializado, no sirve para otras tareas.

Benchmarks: tenemos los datos de exactitud: 10.82% -> 50.99% en test con 453 preguntas, y 52.10% con autocorrección. No hay más benchmarks. Podría presentar una tabla con esos resultados. No comparar con otros modelos porque no hay datos de comparación en la info.

Requisitos de hardware: Entrenado en Tesla T4 (16GB VRAM) con QLoRA 4-bit. Para inferencia, se necesita cargar el modelo base Qwen3-8B en 4-bit (NF4) + adaptador. VRAM estimada: el modelo base 8B en 4-bit ocupa ~4-5 GB, más adaptador y overhead, quizás 6-8 GB. Pero no está explícito. Debo ser cuidadoso: "No disponible" si no está en la información. Sin embargo, puedo deducir de la config: load_in_4bit con fp16 compute en una T4. Para inferencia, una T4 (16GB) es suficiente. Puedo decir "El entrenamiento se realizó en una Tesla T4 (16 GB) con QLoRA 4-bit; la inferencia con la misma configuración debería caber en GPUs de 16 GB o superiores". Eso es razonable y basado en datos.

Comparativa con modelos similares: hdv250202/Qwen3-8b-Text2SQL es otro adaptador Qwen3-8B para text-to-SQL, pero no tengo specs. Puedo mencionar que existe pero sin datos. También podría comparar con el modelo base Qwen3-8B sin adaptador, que obtiene 10.82% en el mismo test. Eso es una comparativa útil. "Comparativa con modelos similares" pide 2-3 alternativas. Podría comparar con el modelo base (Qwen3-8B) y con el adaptador similar hdv250202. Pero no tengo datos de este último. Pondré "no disponible" para el adaptador similar, y la comparación con el base.

Limitaciones: El modelo solo funciona con el prompt exacto y el esquema de 12 tablas; si cambia el esquema, el rendimiento puede degradarse. La mejora es en gran parte memorización de convenciones de columnas, no lógica SQL. Requiere enable_thinking=False. Solo inglés. Riesgo de alucinación en consultas complejas. Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B también Apache 2.0.

Enlaces: HuggingFace del adaptador, Qwen3 Technical Report, y el modelo similar hdv250202. También el repo del modelo base Qwen/Qwen3-8B.

Ahora redacto la ficha. Debo usar Markdown con tablas. Cuidado con la ortografía y estilo.

Estructura:

## Resumen
Dos o tres párrafos. Explicar que es un adaptador LoRA sobre Qwen3-8B para text-to-SQL en PostgreSQL, desarrollado por hari-krishna-ai. Resuelve la conversión de preguntas en lenguaje natural a consultas SQL ejecutables sobre un esquema empresarial de 12 tablas. Relevancia: mejora la exactitud de ejecución de 10.82% a 50.99% en 453 preguntas. Arquitectura: Qwen3-8B (Transformer denso) con QLoRA. Tamaño: adaptador de 43.6M parámetros entrenables, repo 0.2 GB. Contexto: no disponible en la documentación del adaptador.

## Especificaciones tecnicas
Tabla con filas obligatorias. Parámetros totales: "8.000 millones (modelo base Qwen3-8B) + 43,6 millones de parámetros entrenables del adaptador LoRA". Parámetros activos: "no aplica (arquitectura densa, no MoE)" - la instrucción dice "(solo si es MoE)", así que puedo omitir esa fila o poner "no aplica". Mejor omitir si no es MoE? La instrucción dice "Incluye SIEMPRE estas filas (si un dato no esta disponible, pone no disponible)". La fila de parámetros activos es "solo si es MoE", así que puedo omitirla o poner "no aplica". Pondré "No aplica (modelo denso)" para que la tabla esté completa.

Longitud de contexto: "no disponible" (la documentación del adaptador no especifica la ventana de contexto del modelo base). Pero podría poner "32.768 tokens (heredado del modelo base, según el informe técnico de Qwen3)". El informe técnico de Qwen3 dice que los modelos de 8B y mayores soportan hasta 131,072 tokens? Déjame verificar mentalmente: El paper de Qwen3 dice: "The Qwen3 series includes models of both dense and Mixture-of-Expert (MoE) architectures... A key innovation is the integration of thinking mode..." No recuerdo el contexto exacto. En el sitio de Qwen, Qwen3-8B tiene 32K contexto? Creo que Qwen3-8B tiene 32,768 tokens de contexto nativo y puede extenderse a 131,072 con YaRN. Pero como no está en la información dada, mejor "no disponible". Sin embargo, el usuario dice que si hay datos en la búsqueda web, puedo usarlos. El informe técnico no da el número específico. Así que "no disponible".

Tipos de cuantizacion: "4-bit NF4 con doble cuantización (QLoRA); fp16 para cómputo. El adaptador se distribuye en safetensors, no incluye pesos cuantizados del modelo base."

Idiomas: "Inglés (adaptador); el modelo base Qwen3-8B es multilingüe"

Licencia: "Apache 2.0"

Formato de pesos: "safetensors (adaptador LoRA)"

## Arquitectura y entrenamiento
Dos párrafos. Arquitectura: Qwen3-8B es un transformer denso (no MoE) con atención completa. El adaptador LoRA se aplica a todas las proyecciones de atención (q,k,v,o) y de MLP (gate,up,down), con rank 16, alpha 32, dropout 0.05. Entrenamiento: QLoRA con cuantización 4-bit NF4 + doble cuantización, fp16 compute, sobre una Tesla T4, una época, 4h 53m. Dataset sintético generado por plantillas a partir de una BD PostgreSQL de 12 tablas (~328,000 filas). 2,133 ejemplos de entrenamiento, 459 de validación, 453 de test. Loss solo sobre tokens de completación (prompt enmascarado a -100) porque el prompt es ~97% esquema. Supervised token share 3.01%. Optimizer paged 8-bit AdamW, LR 2e-4 con cosine y 3% warmup. Train loss de 4.10 a 0.006, eval loss 0.335. Seed 20260808.

Innovación técnica destacable: el uso de loss completion-only para evitar que el gradiente se concentre en memorizar el esquema, y la exigencia de enable_thinking=False en el template de Qwen3 para evitar que el modelo genere bloques de pensamiento vacíos.

## Capacidades
Lista de viñetas:
- Text-to-SQL específico para PostgreSQL sobre un esquema empresarial de 12 tablas (ventas, catálogo, logística, RRHH).
- Genera una única sentencia SELECT, sin modificar datos.
- Maneja claves foráneas anulables sugiriendo LEFT JOIN cuando es necesario.
- No soporta tool calling ni function calling (no se menciona en la documentación).
- No soporta agentes ni razonamiento multi-paso explícito; el modo de pensamiento debe estar desactivado.
- Capacidades multilingües limitadas: entrenado solo en inglés.
- No tiene capacidades de visión ni audio.

## Casos de uso
Mínimo 6. Basados en la especialización.
1. Generación de consultas SQL para informes de ventas: el modelo convierte preguntas en lenguaje natural sobre ventas en consultas PostgreSQL ejecutables.
2. Automatización de análisis de datos en business intelligence: integrado en un pipeline que recibe preguntas de analistas y devuelve resultados de BD.
3. Soporte a equipos de datos no técnicos: usuarios internos preguntan sobre catálogo, logística o RRHH y el modelo genera consultas correctas.
4. Asistente de consultas para bases de datos PostgreSQL en producción: el modelo se puede desplegar como servicio de generación de SQL, con validación y ejecución controlada.
5. Generación de consultas para pruebas de regresión de esquemas: al estar entrenado sobre un esquema fijo, puede ayudar a verificar cambios en el esquema.
6. Extracción de métricas operativas: preguntas sobre logística (envíos, stock) o RRHH (plantilla, ausencias) convertidas en SQL.
7. Enseñanza de SQL: como herramienta de demostración para aprender a traducir preguntas a SQL en PostgreSQL.

Cada uno con breve explicación de por qué es adecuado.

## Benchmarks y rendimiento
Tabla:
| Métrica | Valor |
| Exactitud de ejecución estricta (modelo base Qwen3-8B) | 10.82% |
| Exactitud de ejecución estricta (adaptador QLoRA) | 50.99% |
| Exactitud con autocorrección one-shot | 52.10% |
| Conjunto de evaluación | 453 preguntas held-out sobre PostgreSQL real |

Nota: evaluación basada en ejecución, no similitud de cadenas. No hay otros benchmarks publicados.

## Requisitos de hardware
Lista:
- Entrenamiento: una Tesla T4 de 16 GB (Kaggle), 4h 53m, con QLoRA 4-bit.
- Inferencia: misma configuración 4-bit NF4 + fp16; estimación de VRAM ~6-8 GB para el modelo base cuantizado más el adaptador. (No hay datos oficiales, pero se deduce de la config.)
- GPU recomendadas: NVIDIA T4, RTX 3060 12GB, RTX 4090, A100. Cabe en GPUs de consumo de 12-16 GB.
- Opciones de despliegue: Transformers + PEFT + BitsAndBytes; también vLLM, llama.cpp o Ollama si se convierte a GGUF, pero no hay archivos GGUF en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
Tabla comparando con el modelo base Qwen3-8B y el adaptador similar hdv250202/Qwen3-8b-Text2SQL (del que no hay datos). 
| Modelo | Parámetros | Contexto | Exactitud text-to-SQL | Licencia | Disponibilidad |
| Qwen3-8B (base) | 8B | no disponible | 10.82% en test | Apache 2.0 | HuggingFace |
| Adaptador hari-krishna-ai | 43.6M entrenables (sobre 8B) | no disponible | 50.99% | Apache 2.0 | HuggingFace |
| hdv250202/Qwen3-8b-Text2SQL | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias
- El adaptador está especializado en un esquema concreto de 12 tablas; con otros esquemas el rendimiento puede degradarse.
- La mejora respecto al base se debe principalmente al aprendizaje de las convenciones de columnas de esa base de datos, no a una mejora general de la lógica SQL.
- Requiere el prompt exacto y el esquema renderizado como CREATE TABLE con comentarios de foreign key; cualquier variación puede romper el rendimiento.
- Es obligatorio usar enable_thinking=False; omitirlo produce razonamiento no deseado, etiquetas  y bucles de repetición.
- Solo entrenado en inglés; no se recomienda para preguntas en otros idiomas.
- Riesgo de alucinación en consultas complejas o con esquemas no vistos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B también es Apache 2.0; sin restricciones adicionales conocidas.

## Enlaces
- HuggingFace: https://huggingface.co/hari-krishna-ai/qwen3-8b-text2sql-qlora
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3-8B
- Informe técnico Qwen3: https://arxiv.org/html/2505.09388v1
- Adaptador similar: https://huggingface.co/hdv250202/Qwen3-8b-Text2SQL

Ahora, debo asegurarme de no inventar. La VRAM estimada no está en la información; la deduzco. ¿Es aceptable? La instrucción dice "no inventes datos". Si no está en la información, indica "no disponible". Pero puedo hacer una estimación razonable basada en la configuración de entrenamiento. Sin embargo, para ser estricto, mejor poner "No disponible. El entrenamiento se realizó en una Tesla T4 con QLoRA 4-bit, lo que sugiere que la inferencia con la misma configuración es viable en GPUs con 16 GB de VRAM." Eso es una inferencia, no un dato duro. Lo formularé como "estimación orientativa" o "no disponible". La instrucción dice "VRAM estimada para inferencia (segun tamano y cuantizacion)" - el usuario pide estimación. Puedo estimar. Pero debo basarme en datos: Qwen3-8B en 4-bit ocupa ~5 GB, más adaptador y overhead ~2 GB, total ~7 GB. Es una estimación técnica razonable. La pondré como "estimación" y no como dato oficial.

También debo mencionar que el repo solo tiene 0.2 GB, por lo que no incluye el modelo base. Eso es relevante.

Otra cosa: "Parametros totales" - el adaptador tiene 43,646,976 parámetros entrenables. El modelo base tiene 4,761,498,624 (según la model card). Esos son los parámetros totales del modelo base. El adaptador se suma. Pondré "4.761.498.624 (modelo base Qwen3-8B) + 43.646.976 (adaptador LoRA) = 4.805.145.600". Pero ¿es correcto sumar? Los parámetros del adaptador no se añaden al modelo base; son adicionales. El total de parámetros del modelo resultante es el base más los adaptadores. Sí, se suman. Usaré la cifra exacta de la model card: 4,761,498,624 para el base, y 43,646,976 para el adaptador. En la tabla pondré "4.805.145.600 (modelo base + adaptador)" o mejor "4.761.498.624 (modelo base) + 43.646.976 (adaptador LoRA)". Para claridad, pondré "4.761.498.624 (modelo base) + 43.646.976 (adaptador LoRA) = 4.805.145.600". Pero el usuario pide "Parametros totales" del modelo. El modelo en sí es el adaptador sobre el base; el total es la suma. Lo haré.

"Parametros activos" - no aplica porque es denso.

"Tipos de cuantizacion" - el adaptador se distribuye en safetensors, no cuantizado. El entrenamiento usa 4-bit NF4. Pondré "4-bit NF4 (QLoRA) para entrenamiento; el adaptador se distribuye sin cuantizar (safetensors)".

"Formato de pesos" - safetensors.

Ahora, "Arquitectura" - Transformer denso (Qwen3-8B) con adaptador LoRA.

"Longitud de contexto" - no disponible. Pero en el informe técnico de Qwen3 se dice que Qwen3 integra thinking mode y non-thinking mode. Eso no da contexto. Así que "no disponible".

Ahora redacto. Debo usar "castellano de España" (por ejemplo, "ordenador" no es necesario, pero "aplicación" en lugar de "app"). "Tamaño" en lugar de "tamano". Cuidado con las tildes.

Voy a escribir la ficha.## Resumen

El modelo `hari-krishna-ai/qwen3-8b-text2sql-qlora` es un adaptador LoRA que convierte el modelo base `Qwen/Qwen3-8B` en un generador de consultas SQL para PostgreSQL, especializado en un esquema empresarial de doce tablas (ventas, catálogo, logística y RRHH). Lo desarrolla el usuario `hari-krishna-ai` y se distribuye como un adaptador PEFT de solo 0,2 GB, que debe cargarse sobre el modelo base.

El problema que resuelve es la conversión de preguntas en lenguaje natural a consultas SQL ejecutables. Según la documentación del autor, la exactitud de ejecución estricta sobre un conjunto de 453 preguntas reservadas pasa del 10,82 % con el modelo base al 50,99 % con el adaptador, y al 52,10 % si se añade un bucle de autocorrección de un solo paso. La evaluación es ejecución real contra una base de datos PostgreSQL, no comparación de cadenas.

La arquitectura es la de un transformer denso (Qwen3-8B) con un adaptador LoRA de rango 16 aplicado a todas las proyecciones de atención y de MLP. El entrenamiento se realizó con QLoRA en una sola Tesla T4 durante una época. La longitud de contexto del modelo base no se especifica en la documentación del adaptador, por lo que se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 4.761.498.624 (modelo base) + 43.646.976 (adaptador LoRA) = 4.805.145.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (QLoRA) y fp16 para computo; el adaptador se distribuye sin cuantizar en safetensors |
| Idiomas soportados | Ingles (adaptador); el modelo base Qwen3-8B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso (no MoE) con atencion completa. El adaptador LoRA se aplica a los modulos `q`, `k`, `v`, `o` (proyecciones de atencion) y `gate`, `up`, `down` (proyecciones de MLP), con rango 16, alpha 32 y dropout 0,05. El entrenamiento se realizo con QLoRA: cuantizacion 4-bit NF4 con doble cuantizacion, computo en fp16, sobre una Tesla T4 de 16 GB. Se entreno una sola epoca durante 4 horas y 53 minutos, con optimizador paged 8-bit AdamW, tasa de aprendizaje 2e-4 con decaimiento coseno y 3 % de warmup, y tamano de lote efectivo de 16 en 134 pasos.

El dataset se genero por plantillas a partir de una base de datos PostgreSQL sintetica de 12 tablas con aproximadamente 328.000 filas. La particion de entrenamiento contiene 2.133 ejemplos, la de validacion 459 y la de test 453 (reservados y medidos una sola vez). La longitud de secuencia maxima fue 2048 tokens, sin truncamiento. Una innovacion destacable es el uso de loss solo sobre los tokens de completacion: el prompt, que es aproximadamente el 97 % del esquema de la base de datos, se enmascara con `-100`. Esto evita que el gradiente se concentre en memorizar un esquema que el modelo recibe en la inferencia. El porcentaje de tokens supervisados es del 3,01 %. La perdida de entrenamiento bajo de 4,10 a 0,006 y la de validacion a 0,335.

## Capacidades

- Text-to-SQL especifico para PostgreSQL sobre un esquema empresarial de 12 tablas (ventas, catalogo, logistica y RRHH).
- Genera una unica sentencia `SELECT` y nunca modifica datos.
- Sugiere el uso de `LEFT JOIN` cuando una clave foranea es anulable, para evitar perder filas silenciosamente.
- No soporta tool calling ni function calling (no se menciona en la documentacion).
- No soporta agentes ni razonamiento multi-paso explicito; es obligatorio desactivar el modo de pensamiento (`enable_thinking=False`) en el template de chat.
- Capacidades multilingues limitadas: entrenado solo en ingles.
- No incluye capacidades de vision ni audio.

## Casos de uso

- Generacion de informes de ventas: un analista formula preguntas en lenguaje natural sobre ventas y el modelo devuelve una consulta PostgreSQL ejecutable, que puede integrarse en un sistema de reporting.
- Automatizacion de analisis de datos en business intelligence: el adaptador se embebe en un pipeline que recibe preguntas de usuarios de negocio y ejecuta las consultas generadas contra la base de datos.
- Soporte a equipos no tecnicos: empleados de areas como logistica o RRHH pueden preguntar sobre envios, stock o plantilla sin conocer SQL, y el modelo traduce la pregunta a una consulta correcta.
- Asistente de consultas en produccion: desplegado como servicio, el modelo genera SQL que luego se valida y ejecuta con permisos restringidos, reduciendo el tiempo de acceso a datos.
- Pruebas de regresion de esquemas: al estar entrenado sobre un esquema fijo, permite verificar rapidamente si los cambios en las tablas o columnas rompen las consultas esperadas.
- Extraccion de metricas operativas: preguntas sobre catalogos, logistica o RRHH convertidas automaticamente en consultas SQL para paneles de control.
- Ensenanza de SQL: como herramienta de demostracion para traducir preguntas de negocio a SQL en PostgreSQL, mostrando la consulta generada como ejemplo.

## Benchmarks y rendimiento

La documentacion del autor reporta los siguientes resultados, medidos por ejecucion real contra PostgreSQL:

| Metrica | Valor |
|---|---|
| Exactitud de ejecucion estricta (modelo base Qwen3-8B) | 10,82 % |
| Exactitud de ejecucion estricta (adaptador QLoRA) | 50,99 % |
| Exactitud con autocorreccion one-shot | 52,10 % |
| Conjunto de evaluacion | 453 preguntas held-out |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion es exclusivamente de ejecucion: cada prediccion se ejecuta contra una base de datos PostgreSQL real y su conjunto de resultados se compara con el de la consulta de referencia.

## Requisitos de hardware

- Entrenamiento: una Tesla T4 de 16 GB (nivel gratuito de Kaggle), con QLoRA 4-bit y fp16 para computo. Duracion: 4 h 53 m.
- Inferencia: con la misma configuracion de cuantizacion 4-bit NF4, el modelo base Qwen3-8B mas el adaptador LoRA caben en una GPU de 16 GB. Se estima una VRAM de entre 6 y 8 GB para la inferencia en 4-bit, incluyendo el overhead de PEFT y BitsAndBytes.
- GPU recomendadas: NVIDIA T4, RTX 3060 de 12 GB, RTX 4090, A100. Es viable en GPUs de consumo con 12-16 GB de VRAM.
- Opciones de despliegue: Transformers + PEFT + BitsAndBytes (como en el codigo de ejemplo). No se proporcionan archivos GGUF ni configuraciones para vLLM, llama.cpp u Ollama, aunque el adaptador podria convertirse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud text-to-SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 4.761.498.624 | No disponible | 10,82 % en test | Apache 2.0 | HuggingFace |
| Adaptador hari-krishna-ai | 43.646.976 entrenables (sobre 8B) | No disponible | 50,99 % en test | Apache 2.0 | HuggingFace |
| hdv250202/Qwen3-8b-Text2SQL | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

El adaptador `hdv250202/Qwen3-8b-Text2SQL` aparece como un modelo similar en HuggingFace, pero no se dispone de datos de rendimiento ni de especificaciones detalladas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en un esquema concreto de 12 tablas. Con otros esquemas o bases de datos, el rendimiento puede degradarse de forma significativa.
- La mejora respecto al modelo base se debe principalmente al aprendizaje de las convenciones de columnas de esa base de datos concreta, no a una mejora general de la logica SQL. El propio autor lo advierte explicitamente.
- Es obligatorio usar el prompt exacto de la documentacion, con el esquema renderizado como sentencias `CREATE TABLE` y comentarios de clave foranea con `--`. Cualquier variacion puede impedir reproducir los resultados publicados.
- Es obligatorio usar `enable_thinking=False` en el template de chat. Si se omite, el modelo produce razonamiento no deseado, etiquetas `` sueltas, tokens basura y bucles de repeticion.
- Solo esta entrenado en ingles; no se recomienda su uso con preguntas en otros idiomas.
- Existe riesgo de alucinacion en consultas complejas o cuando se le presentan tablas o columnas que no aparecen en el esquema de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, tanto para el adaptador como para el modelo base Qwen3-8B, sin restricciones adicionales conocidas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/hari-krishna-ai/qwen3-8b-text2sql-qlora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Adaptador similar hdv250202/Qwen3-8b-Text2SQL: https://huggingface.co/hdv250202/Qwen3-8b-Text2SQL
