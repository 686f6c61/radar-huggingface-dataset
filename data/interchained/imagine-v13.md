# Interchained/imagine-v13

## Resumen

Imagine v13 es un modelo de lenguaje especializado en la traducción de lenguaje natural a SQL (text-to-SQL) desarrollado por Interchained. No es un chatbot de propósito general: su único objetivo es generar consultas SQL ejecutables y precisas contra esquemas de bases de datos reales. La versión 13 es un fine-tune completo sobre Imagine v12 y añade tres capacidades que su predecesor no cubría: uso de herramientas (tool calling), razonamiento temporal y discriminación entre preguntas casi idénticas.

El modelo tiene 1.346.471.936 parámetros (aproximadamente 1,6B según el autor) y mantiene la arquitectura de v12: 40 capas, dimensión oculta de 2048, dimensión intermedia de 5632 y embeddings atados (tied embeddings). Se distribuye en formato safetensors como checkpoint canónico, con builds GGUF previstos a través del pipeline Hearth del autor.

La relevancia de v13 radica en su enfoque de entrenamiento verificado por ejecución: cada fila del corpus fue validada ejecutando el SQL contra una base de datos NEDB real y admitida solo si la consulta se ejecutaba y devolvía el resultado correcto. El autor declara explícitamente que las evaluaciones de benchmarks están pendientes y no publica cifras de rendimiento en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (40 capas, hidden 2048, intermediate 5632, tied embeddings) |
| Parámetros totales | 1.346.471.936 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (GGUF previsto vía pipeline Hearth) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (GGUF en preparación en Interchained/imagine-v13-GGUF) |

## Arquitectura y entrenamiento

Imagine v13 es un transformer denso con 40 capas, dimensión oculta de 2048, dimensión intermedia de 5632 y embeddings atados. La arquitectura es idéntica a la de v12; el autor no introduce cambios estructurales, sino que amplía el corpus de entrenamiento con nuevas familias de datos.

El entrenamiento se realizó en dos etapas sobre una única NVIDIA B200. La etapa 1 fue un full fine-tune desde imagine-v12 con 3 épocas, learning rate 1e-5, 7.311 pasos, 207,1M tokens y 80,3 minutos, alcanzando una pérdida final de 0,0099. La etapa 2 aplicó LoRA r16 (fusionado posteriormente) sobre la salida de la etapa 1, con 1 época, learning rate 5e-6, 2.437 pasos, 69,0M tokens y 41,5 minutos, con pérdida media de época de 0,0093.

El corpus total es de 177.390 filas, sin descartes. La base de v12 (131.400 filas: SQL 61.758, identidad 43.362, protocolo 26.280) se recreó desde cero con la forja original sin profesor y se validó contra su manifiesto histórico. Las familias nuevas de v13 suman 45.990 filas: tool use (20.000), discriminación (19.710), anclaje temporal (4.000) y cadenas de protocolo de herramientas (2.280). Ninguna fila fue scrapeada ni generada sintéticamente por un modelo profesor; todas se construyeron de forma determinista o se ejecutaron contra una base de datos NEDB real, admitiéndose solo si el SQL funcionaba y devolvía el resultado correcto. El flujo de tokens de entrenamiento está empaquetado de forma determinista y direccionado por contenido, lo que permite reproducir exactamente los datos consumidos.

## Capacidades

- Generación de SQL ejecutable a partir de lenguaje natural contra esquemas de bases de datos en vivo.
- Tool calling: emisión de llamadas estructuradas a herramientas con verificación de parseo (familia toolproto, 20.000 filas).
- Cadenas multi-paso de protocolo de herramientas que se mantienen en protocolo (2.280 filas).
- Razonamiento temporal: resolución de expresiones de tiempo relativo contra el reloj real (4.000 filas).
- Discriminación entre preguntas casi idénticas que difieren en una sola palabra (19.710 filas).
- Capacidad de identidad y protocolo heredada de v12 (43.362 y 26.280 filas respectivamente).
- No es un chatbot de propósito general; el autor lo declara explícitamente.

## Casos de uso

- Asistente de consultas para bases de datos NEDB: el modelo traduce preguntas en lenguaje natural a SQL ejecutable contra un esquema en vivo, validado durante el entrenamiento mediante ejecución real de cada consulta.
- Integración en herramientas de BI y analítica: un usuario formula una pregunta de negocio y el modelo genera la consulta SQL que devuelve el resultado, reduciendo la dependencia de analistas para consultas repetitivas.
- Automatización de pipelines de datos: generación de consultas en tareas ETL donde el esquema es conocido y las preguntas siguen patrones recurrentes.
- Interfaces de agentes con tool calling: el modelo emite llamadas estructuradas verificables, adecuado para integrarse en un agente que consulta bases de datos como una herramienta más dentro de un flujo multi-paso.
- Consultas sensibles al tiempo: el anclaje temporal permite resolver expresiones como "el mes pasado" o "la última semana" contra el reloj real, útil en informes periódicos automatizados.
- Desambiguación de preguntas de usuario: la familia de discriminación permite distinguir entre consultas que difieren en una palabra (por ejemplo, "pedidos de clientes activos" frente a "pedidos de clientes inactivos"), reduciendo errores en producción.
- Sustitución de v12 en el nodo Gaia: el autor indica que v12 es el modelo residente del nodo Gaia, y v13 se posiciona como su reemplazo directo con las nuevas familias de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que las evaluaciones held-out de v13 (telemetría Tier-0, identidad, discriminación, temporal, tool use) están pendientes y se ejecutarán contra v12 con fixtures idénticas, publicándose la matriz completa cuando exista. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ejecución SQL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (1,35B parámetros), en FP16 requeriría aproximadamente 2,7 GB solo de pesos, más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el requisito sería inferior, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA B200, pero no se especifican requisitos de inferencia.
- Cabe en GPU de consumo: no disponible; no se han publicado builds GGUF ni requisitos de cuantización.
- Opciones de despliegue: no disponible. El autor menciona builds GGUF a través del pipeline Hearth, que se publicarán en Interchained/imagine-v13-GGUF, lo que permitiría su uso con llama.cpp u Ollama, pero no se confirma compatibilidad con vLLM, TGI ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Interchained/imagine-v13 | 1.346.471.936 | no disponible | text-to-SQL, tool use, temporal | no disponible | safetensors en HF; GGUF pendiente |
| Interchained/imagine-v12 | no disponible | no disponible | text-to-SQL, identidad, protocolo | no disponible | checkpoint base en HF |
| Alternativas text-to-SQL de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La única comparación documentada es con su predecesor v12, del que hereda la base de entrenamiento y cuyas debilidades (tool use, límites temporales, discriminación) motivaron las nuevas familias de v13.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot de propósito general y no debe usarse como tal; el autor lo declara explícitamente.
- Sin benchmarks publicados: las evaluaciones held-out están pendientes y no hay cifras verificables de rendimiento frente a v12 ni frente a otros modelos.
- Licencia no disponible: no se especifican términos de uso comercial, lo que impide evaluar su idoneidad para producción sin consultar al autor.
- Idiomas no disponibles: no se documenta qué lenguas soporta; el corpus parece orientado a inglés por la naturaleza de las consultas SQL y la model card.
- Longitud de contexto no disponible: se desconoce la ventana máxima, lo que limita la planificación de conversaciones multi-turno o esquemas de base de datos extensos.
- Riesgo de alucinación: aunque el corpus se validó por ejecución, no se documentan tasas de error en producción ni mecanismos de verificación en tiempo de inferencia.
- Dependencia del esquema: el rendimiento depende de que el esquema de la base de datos se proporcione correctamente; no se documenta cómo maneja esquemas grandes o cambiantes.
- Sesgos: no se documentan sesgos conocidos ni análisis de equidad.
- Corpus de entrenamiento limitado a 177.390 filas: aunque verificado, es un volumen modesto que puede limitar la generalización a dominios no cubiertos.
- Fecha de creación futura (2026-11-03) y cero descargas/likes: la información de la model card debe tratarse con cautela hasta que existan evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Interchained/imagine-v13
- Modelo base: https://huggingface.co/Interchained/imagine-v12
- GGUF (previsto): https://huggingface.co/Interchained/imagine-v13-GGUF
- Código de entrenamiento: aiassistsecure/sukuna-imagine (referenciado en la model card; no se proporciona URL directa)
