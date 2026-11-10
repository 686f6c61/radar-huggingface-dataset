# Hokaigo/Qwen2.5-1.5B-SQL-Critic-LoRA

## Resumen

Qwen2.5-1.5B-SQL-Critic-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario Hokaigo sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El adaptador está entrenado para una tarea muy concreta: actuar como crítico de SQL, comparando una consulta original con una versión optimizada a partir de un esquema DDL proporcionado, y emitir estrictamente un objeto JSON que evalúe su equivalencia semántica.

El modelo resuelve un problema práctico en pipelines de optimización de SQL: determinar de forma automática si una reescritura de una consulta conserva la semántica original o introduce diferencias (por ejemplo, cláusulas `WHERE` o `GROUP BY` ausentes). El adaptador fuerza además un formato JSON estricto, lo que facilita su integración en sistemas automatizados que consumen la salida de forma programática.

Con solo 1.500 millones de parámetros en el modelo base y un adaptador de aproximadamente 0,1 GB, es un componente ligero que puede ejecutarse en hardware de consumo. La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer, ni el número de tokens de entrenamiento del adaptador; la model card se centra en los resultados de la tarea específica para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El entrenamiento emplea PEFT, congelando los pesos del modelo base y entrenando únicamente las matrices de bajo rango del adaptador. La model card muestra una curva de pérdida de entrenamiento y validación a lo largo de 40 pasos, con convergencia sin señales de sobreajuste.

La tarea de entrenamiento es la comparación semántica de consultas SQL: el modelo recibe un esquema DDL, una consulta original y una consulta optimizada, y debe emitir un JSON estrictamente formateado que evalúe su equivalencia. Según la model card, la precisión del modelo base en esta tarea antes del ajuste era del 52,3 % (nivel de azar), y tras aplicar el adaptador alcanza un 99,1 % de precisión de equivalencia y un 100 % de salida JSON válida. Se realizó además una comprobación de olvido catastrófico con tareas de lógica matemática, geografía y corrección gramatical, en las que el modelo mantiene respuestas en lenguaje natural fluido y correctas, lo que sugiere que los pesos base no se han comprometido estructuralmente. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Comparación semántica de consultas SQL: determina si una consulta optimizada es equivalente a la original dado un esquema DDL.
- Detección de cláusulas ausentes en SQL, como `WHERE` o `GROUP BY`.
- Salida estricta en JSON: formato validado al 100 % según la model card.
- Razonamiento lógico sobre SQL orientado a pipelines automatizados de revisión.
- Conservación de capacidades generales del modelo base: lógica matemática, geografía y corrección gramatical en lenguaje natural (verificado en la comprobación de olvido catastrófico).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Revision automatica de rewrites SQL en pipelines de optimizacion: el adaptador recibe el esquema, la consulta original y la consulta reescrita por un optimizador, y devuelve un JSON con la evaluacion de equivalencia semantica. Es adecuado porque su salida estructurada se puede consumir directamente en CI/CD para aceptar o rechazar una reescritura.
- Validacion de migraciones de consultas entre motores: al comparar una consulta escrita para un motor con su traduccion a otro, el modelo detecta clausulas perdidas en la traduccion (por ejemplo, un `WHERE` omitido) antes de desplegar el cambio.
- Control de calidad en generacion automatica de SQL: si un sistema genera SQL a partir de lenguaje natural y otro modulo lo reescribe, este critico verifica que la reescritura no altera la semantica, actuando como puerta de validacion.
- Guardrail en asistentes de bases de datos: integrado como paso intermedio que valida que una sugerencia de optimizacion propuesta al usuario es semantica y estructuralmente equivalente a su consulta original.
- Evaluacion de modelos text-to-SQL: sirve como juez automatico para medir si dos consultas generadas por distintos modelos son equivalentes respecto a un esquema dado, con salida JSON facil de agregar en metricas.
- Deteccion de regresiones en tests de SQL: en una suite de pruebas donde se comparan consultas esperadas con consultas generadas, el adaptador puede sustituir comparaciones textuales fragiles por una comparacion semantica asistida.

## Benchmarks y rendimiento

| Metrica | Modelo base | Con adaptador LoRA |
|---|---|---|
| Precision de equivalencia semantica | 52,3 % | 99,1 % |
| Salida JSON valida | no disponible | 100 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores corresponden exclusivamente a la tarea de comparacion semantica de SQL evaluada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parámetros ocupa aproximadamente 3 GB en FP16 y alrededor de 1 GB en cuantizacion de 4 bits; el adaptador anade un tamano marginal (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16, como RTX 3060, RTX 4060 o superiores; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM, y en CPU con cuantizacion.
- Opciones de despliegue: transformers con peft (metodo documentado en la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-SQL-Critic-LoRA | 1.500 M (base) | no disponible | Critico SQL con salida JSON | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.500 M | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| Alternativas especializadas en critica SQL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de critica SQL en la documentacion proporcionada. La comparacion principal posible es contra el modelo base, sobre el que el adaptador mejora la precision de equivalencia del 52,3 % al 99,1 % y garantiza salida JSON valida en el 100 % de los casos evaluados.

## Limitaciones y advertencias

- El adaptador esta entrenado y evaluado exclusivamente en ingles; no se declara soporte para otros idiomas.
- La evaluacion reportada (99,1 % de precision, 100 % de JSON valido) procede del autor y de una unica tarea; no hay validacion independiente ni benchmarks estandar publicados.
- El modelo esta disenado para la tarea concreta de comparacion semantica de SQL; fuera de ese contexto su comportamiento depende del modelo base y de que no se aplique el formato JSON estricto.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 1.500 millones de parametros, especialmente en esquemas SQL complejos o consultas con subconsultas anidadas.
- El rendimiento en consultas SQL muy largas o esquemas extensos puede verse limitado por la ventana de contexto del modelo base, cuyo valor no se detalla en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, tambien Apache 2.0 segun la informacion disponible.
- El adaptador debe cargarse junto con el modelo base mediante peft; no es un modelo autonomo y no puede desplegarse de forma independiente.
- No hay informacion sobre sesgos especificos ni sobre el dataset de entrenamiento, lo que limita la evaluacion de riesgos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Hokaigo/Qwen2.5-1.5B-SQL-Critic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Imagen de curvas de entrenamiento citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/6ab8eb87899ab49c9a064b5a/vsT227eTF9SaPk56F6cKy.png
