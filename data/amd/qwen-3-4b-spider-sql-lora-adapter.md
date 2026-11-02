# amd/qwen-3-4B-spider-sql-lora-adapter

## Resumen

`amd/qwen-3-4B-spider-sql-lora-adapter` es un adaptador LoRA publicado por AMD para su modelo base `amd/qwen-3-4B-quark`, una variante de Qwen3-4B cuantizada en INT4 con el toolkit Quark y optimizada para ejecutarse en la NPU de los procesadores AMD Ryzen AI. El adaptador especializa el modelo en la tarea de text-to-SQL, es decir, generar una consulta SQL válida a partir de un esquema de base de datos y una pregunta en lenguaje natural, y se ha entrenado sobre el split de entrenamiento del dataset Spider 1.0.

El detalle técnico más relevante es que el adaptador se entrenó contra el modelo base ya cuantizado en INT4, no contra los pesos en coma flotante. AMD lo publica sin fusionar (unmerged) y advierte explícitamente de que aplicarlo sobre el Qwen3-4B original en FP no reproduce los resultados. Esto lo convierte en una pieza de despliegue muy específica: el objetivo es habilitar conmutación dinámica de adaptadores en la NPU mediante ONNX Runtime GenAI y las utilidades de Ryzen AI, compilando base y adaptador conjuntamente.

Por su naturaleza, no es un modelo de propósito general ni un adaptador de instrucciones: es un artefacto de 0,1 GB con rango 16 y alpha 32, pensado para integrarse en flujos de analítica sobre bases de datos relacionales que corran en hardware AMD con NPU. Su relevancia actual está en que ejemplifica el patrón de especialización post-entrenamiento sobre pesos cuantizados para aceleradores de borde, un enfoque poco habitual en el ecosistema HuggingFace, dominado por adaptadores sobre pesos FP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B, base cuantizada INT4 con Quark |
| Parametros totales | no disponible (adaptador LoRA; rango 16, alpha 32, modulo objetivo q, k, v, o, gate, up, down) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | INT4 en el modelo base (Quark); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base); MIT para las modificaciones de AMD; dataset Spider 1.0 bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (PEFT); compilacion a artefacto ONNX Runtime GenAI para NPU |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT con rango 16 y alpha 32 (factor de escala 2,0), dropout 0,05 y módulos objetivo que cubren las proyecciones de atención (q, k, v, o) y las del MLP (gate, up, down). Se entrenó durante 5 épocas sobre el split de entrenamiento de Spider 1.0, el benchmark clásico de text-to-SQL con esquemas multi-tabla y preguntas en inglés. El modelo base es Qwen3-4B, un transformer decoder-only de 4 mil millones de parámetros, en su variante `amd/qwen-3-4B-quark`, cuantizada en INT4 con Quark y adaptada por AMD para despliegue en Ryzen AI.

La innovación técnica no está en el entrenamiento sino en el pipeline de despliegue. En GPU, el base Quark desquantiza al vuelo y PEFT se acopla de forma convencional. En NPU, en cambio, base y adaptador se compilan juntos con `model_generate --npu --token_fusion`, incrustando el adaptador como un módulo nombrado (`lora_name=sql_spider`) con su factor de escala fijado en tiempo de compilación. La conmutación entre adaptadores se hace en runtime con `set_active_adapter`, lo que permite tener varios LoRA compilados en el mismo artefacto y alternar entre ellos sin recompilar. No se documenta en la información disponible el uso de RLHF, DPO ni datos adicionales fuera de Spider.

## Capacidades

- Generación de consultas SQL a partir de un esquema y una pregunta en lenguaje natural, con el formato de prompt exacto definido por el autor.
- Especialización en esquemas relacionales multi-tabla del estilo de Spider 1.0 (joins, agregaciones, subconsultas).
- Conmutación dinámica de adaptadores en NPU: el mismo artefacto compilado puede alojar el adaptador SQL y el base, alternando por nombre en runtime.
- Ejecución en la NPU de AMD Ryzen AI mediante ONNX Runtime GenAI, con `token_fusion` habilitado.
- Ejecución en GPU con PEFT estándar sobre el base Quark (desquantización al vuelo).
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma documentada; el adaptador no es de instrucciones generales.

## Casos de uso

- Asistente SQL embebido en herramientas de BI: el adaptador traduce preguntas de negocio a consultas sobre el esquema del almacén de datos, ejecutándose en la NPU del portátil del analista sin depender de la nube, lo que reduce la exposición de metadatos del esquema.
- Generación de consultas en pipelines ETL locales: dado un catálogo de tablas y una descripción de la transformación deseada, el modelo produce el SQL que luego se valida y ejecuta en un motor como DuckDB o PostgreSQL.
- Interfaz de lenguaje natural sobre bases de datos de investigación: investigadores con datasets relacionales en equipos Ryzen AI pueden consultar los datos en lenguaje natural manteniendo todo el procesamiento en local.
- Prototipado de funcionalidades text-to-SQL en productos SaaS: el adaptador sirve como base para evaluar la viabilidad de la función antes de invertir en un modelo mayor, gracias a su tamaño reducido (0,1 GB) y a su licencia permisiva.
- Docencia y evaluación de text-to-SQL: al estar entrenado sobre Spider 1.0, es útil para reproducir experimentos y comparar el efecto de la cuantización INT4 frente al base en FP sobre la precisión de generación de SQL.
- Despliegue en entornos con requisitos de privacidad estrictos: la inferencia en NPU local evita enviar esquemas y preguntas a servicios externos, algo relevante en sectores regulados.
- Conmutación de especialistas en un mismo dispositivo: combinado con otros adaptadores compilados en el mismo artefacto, permite alternar entre tareas (por ejemplo, SQL y resumen) sin recargar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página de ejemplo de LoRA dinámico del repositorio RyzenAI-SW para consultar resultados de precisión y scripts de evaluación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base es un modelo de 4B en INT4, por lo que en GPU la huella de pesos ronda los 2-3 GB, más overhead de activaciones y del adaptador (0,1 GB).
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con 8 GB o más debería poder alojar el base INT4 con el adaptador PEFT.
- NPU: requisito principal del artefacto; el flujo documentado usa la NPU de AMD Ryzen AI con ONNX Runtime GenAI y `token_fusion`.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: PEFT sobre el base Quark en GPU; ONNX Runtime GenAI con `ryzenai_onnx_utils` y compilación vía `model_generate` en NPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/qwen-3-4B-spider-sql-lora-adapter | LoRA sobre base 4B INT4 | no disponible | Text-to-SQL (Spider) | Apache-2.0 / MIT | HuggingFace, 1 descarga |
| amd/qwen-3-4B-quark | 4B (INT4) | no disponible | Base generalista cuantizado | Apache-2.0 | HuggingFace |
| Adaptadores text-to-SQL sobre modelos 7B (p. ej. familia CodeLlama o Qwen2.5-Coder) | 7B | variable | Text-to-SQL | variable | HuggingFace |
| Modelos SQL dedicados tipo PicardSQL o similares | variable | no disponible | Text-to-SQL | variable | Repositorios de investigación |

La comparativa directa es limitada: no se dispone de cifras de rendimiento del adaptador ni de alternativas evaluadas en el mismo entorno, por lo que la comparación se restringe a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para el formato de prompt documentado; cualquier desviación del template degrada la precisión de forma notable.
- Aplicarlo sobre el Qwen3-4B en FP no reproduce los resultados: solo es válido sobre el base cuantizado INT4 de Quark.
- No es un adaptador de instrucciones generales; fuera de text-to-SQL su comportamiento no está garantizado.
- Riesgo de alucinación de tablas, columnas o sintaxis SQL inválida: el autor recomienda validar las consultas antes de ejecutarlas contra datos reales.
- El dataset de entrenamiento es Spider 1.0, en inglés y con esquemas académicos; el rendimiento en esquemas de producción o en otros idiomas no está documentado.
- El factor de escala se fija en tiempo de compilación (2,0 = alpha/r); no hay ajuste en runtime, lo que limita la experimentación una vez compilado.
- La licencia del adaptador es MIT, pero el base es Apache-2.0 y el dataset Spider 1.0 es CC BY-SA 4.0; conviene revisar la EULA de Ryzen AI para uso comercial del artefacto compilado.
- El modelo tiene 1 descarga y 0 likes en el momento de la ficha: es un artefacto muy reciente y poco validado por la comunidad.
- No se documentan sesgos específicos ni evaluaciones de robustez.

## Enlaces

- [HuggingFace: amd/qwen-3-4B-spider-sql-lora-adapter](https://huggingface.co/amd/qwen-3-4B-spider-sql-lora-adapter)
- [Modelo base: amd/qwen-3-4B-quark](https://huggingface.co/amd/qwen-3-4B-quark)
- [Ejemplo de LoRA dinámico en RyzenAI-SW](https://github.com/amd/RyzenAI-SW/tree/main/LLM-examples/dynamic-lora)
- [Licencias de Ryzen AI (EULA y TPN)](https://ryzenai.docs.amd.com/en/latest/licenses.html)
- [Dataset Spider 1.0](https://yale-lily.github.io/spider)
