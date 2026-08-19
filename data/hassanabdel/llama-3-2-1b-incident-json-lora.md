# hassanabdel/llama-3.2-1b-incident-json-lora

## Resumen

El modelo `hassanabdel/llama-3.2-1b-incident-json-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Llama-3.2-1B-Instruct` de Meta. Su propósito es transformar narrativas breves de incidentes (por ejemplo, descripciones de fallos, alertas de seguridad o incidencias operativas) en una salida JSON estructurada con campos como severidad, entidades implicadas, resumen y acción recomendada. Está diseñado para tareas de análisis de incidentes y extracción de información estructurada a partir de texto no estructurado.

El adaptador fue desarrollado por el usuario `hassanabdel` y publicado en Hugging Face. Se entrenó mediante QLoRA con cuantización de 4 bits sobre un conjunto de datos de 2.040 ejemplos de entrenamiento y 360 de validación, durante 3 épocas, alcanzando una pérdida final de entrenamiento de 0,1732. Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base exacto y combinar los pesos del adaptador para su uso.

Su relevancia radica en que ofrece una solución ligera y especializada para normalizar informes de incidentes en formato JSON, lo que facilita su integración en pipelines de gestión de incidencias, sistemas de ticketing o herramientas de análisis de seguridad. Al basarse en un modelo de 1B de parámetros, su huella de memoria es reducida, lo que permite su ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.2 1B Instruct) + adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene aproximadamente 1B; el adaptador añade un número reducido de parámetros entrenables, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.2 1B soporta hasta 128K tokens, pero no se confirma en la información del adaptador) |
| Tipos de cuantizacion | 4-bit (utilizado durante el entrenamiento con QLoRA); para inferencia se puede cargar el base en distintas cuantizaciones, no especificadas |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la licencia del adaptador no se indica; el modelo base Llama 3.2 está bajo la licencia comunitaria de Meta) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Llama 3.2 1B Instruct, un modelo ligero optimizado para instrucciones. Sobre esta base se aplica LoRA, una técnica de adaptación de bajo rango que congela los pesos originales y entrena matrices de baja dimensión en las capas de atención y MLP. El entrenamiento se realizó con QLoRA, que cuantiza el modelo base a 4 bits para reducir el uso de memoria, y el adaptador resultante se guarda en formato safetensors.

El conjunto de datos de entrenamiento contiene 2.040 ejemplos de narrativas de incidentes junto con sus correspondientes salidas JSON, más 360 ejemplos de validación. Se entrenó durante 3 épocas con una pérdida final de 0,1732, lo que sugiere un buen ajuste al esquema de salida definido. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es supervisado y específico para la tarea de conversión a JSON.

## Capacidades

- Generación de JSON estructurado a partir de narrativas de incidentes, siguiendo un esquema fijo con campos `severity`, `entities` (actors, locations, assets), `summary` y `recommended_action`.
- Clasificación de severidad en cuatro niveles: low, medium, high, critical.
- Extracción de entidades nombradas (actores, ubicaciones, activos) dentro del texto del incidente.
- Generación de un resumen de una frase y una acción recomendada de una frase.
- Capacidades generales de generación de texto y razonamiento heredadas del modelo base Llama 3.2 1B Instruct, aunque el adaptador está especializado y puede degradar el rendimiento en tareas fuera de su dominio.
- No se indica soporte explícito para tool calling, agentes, visión o audio; el adaptador se limita a la transformación de texto a JSON.

## Casos de uso

- Automatización de tickets de soporte: el modelo puede convertir la descripción de un incidente reportado por un usuario en un ticket estructurado con severidad, entidades implicadas y una acción recomendada, facilitando su enrutamiento y priorización.
- Análisis de seguridad informática: los analistas pueden alimentar el modelo con alertas de SIEM o logs de incidentes para obtener un resumen normalizado y una sugerencia de respuesta, acelerando la triage.
- Gestión de incidencias en infraestructura: en entornos DevOps, el adaptador puede transformar mensajes de error o descripciones de fallos en JSON para integrarlos en sistemas de orquestación o bases de datos de incidentes.
- Generación de informes estructurados: equipos de operaciones pueden usar el modelo para convertir narrativas libres en registros JSON consistentes, listos para su almacenamiento o análisis posterior.
- Integración en pipelines de procesamiento de lenguaje natural: al ser un adaptador ligero, puede ejecutarse en entornos con recursos limitados, como parte de un flujo de extracción de información en tiempo real.
- Pruebas de concepto para extracción de entidades: dado su pequeño tamaño, sirve como base para experimentar con la conversión de texto no estructurado a esquemas JSON antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador solo reporta la pérdida de entrenamiento (0,1732) y no incluye métricas de evaluación como exactitud, F1 o comparativas con otros modelos. Tampoco se proporcionan resultados del modelo base en tareas estándar.

## Requisitos de hardware

- El modelo base Llama 3.2 1B en precisión FP16 ocupa aproximadamente 2 GB de VRAM; el adaptador LoRA añade alrededor de 1,1 GB (tamaño del repositorio), aunque en la práctica los pesos del adaptador son pequeños y se combinan con el base en memoria.
- Con cuantización a 4 bits (como la usada en QLoRA), el modelo base puede caber en menos de 1 GB, y el adaptador no incrementa significativamente el consumo. Se estima que una GPU con 4-6 GB de VRAM es suficiente para inferencia, aunque no se proporcionan cifras exactas.
- GPU recomendadas: tarjetas consumer como NVIDIA GTX 1660 (6 GB), RTX 2060 (6 GB), RTX 3060 (12 GB) o superiores. También puede ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` de Hugging Face. También es compatible con frameworks de inferencia como vLLM, llama.cpp u Ollama, siempre que soporten la carga de adaptadores LoRA sobre el modelo base.
- Latencia y throughput: no disponibles. Dado el tamaño reducido del modelo, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la misma tarea de conversión de incidentes a JSON. Como referencia, se puede comparar con el modelo base sin adaptador: `Llama-3.2-1B-Instruct` no genera JSON estructurado de forma fiable sin un ajuste específico, mientras que este adaptador está entrenado para ello. Otras alternativas genéricas de extracción de información (por ejemplo, modelos como `mistral-7b-instruct` o `phi-3-mini`) podrían lograr resultados similares con prompts cuidadosamente diseñados, pero no hay datos de rendimiento comparativo disponibles.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Llama-3.2-1B-Instruct (base) | ~1B | 128K (según Meta) | Generico | Llama Community License |
| hassanabdel/llama-3.2-1b-incident-json-lora | ~1B + adaptador | No disponible | Extraccion de incidentes a JSON | No disponible |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo independiente: debe cargarse junto con el modelo base exacto `meta-llama/Llama-3.2-1B-Instruct`; usarlo con otro base puede producir resultados incorrectos o fallos.
- El conjunto de datos de entrenamiento es pequeño (2.040 ejemplos), lo que limita la generalización a narrativas muy variadas o dominios no representados. Puede haber sobreajuste al esquema de salida específico.
- La salida JSON sigue un esquema rígido; si el texto de entrada no se ajusta al formato esperado (por ejemplo, incidentes muy largos o ambiguos), el modelo puede generar campos vacíos o incorrectos.
- No se han evaluado sesgos ni riesgos de alucinación específicos para este adaptador. Como modelo derivado de Llama 3.2, puede heredar sesgos presentes en los datos de preentrenamiento del base.
- La licencia del adaptador no está especificada; el modelo base está bajo la Llama Community License de Meta, que impone ciertas restricciones de uso comercial y requiere atribución. Se recomienda revisar los términos antes de usar en producción.
- El rendimiento en idiomas distintos del inglés no está documentado; es probable que el adaptador funcione mejor con narrativas en inglés, dado el origen de los datos de entrenamiento (no confirmado).
- No se proporcionan garantías de precisión en la clasificación de severidad ni en la extracción de entidades; se recomienda validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hassanabdel/llama-3.2-1b-incident-json-lora
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct/tree/main
- README del modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/README.md
- Documentacion de Meta sobre Llama 3.2: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Pagina de NVIDIA NIM para Llama 3.2 1B Instruct: https://build.nvidia.com/meta/llama-3.2-1b-instruct
- Pagina de Ollama para llama3.2:1b: https://ollama.com/library/llama3.2:1b
