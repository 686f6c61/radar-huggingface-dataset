# abderahmenn/qwen3.5-9b-sob-json

## Resumen

qwen3.5-9b-sob-json es un ajuste fino por LoRA del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario abderahmenn, orientado a la extracción de JSON restringido por esquema y a la verificación y reparación de JSON. El adaptador LoRA se ha fusionado con los pesos base en bf16, de modo que el repositorio contiene un modelo completo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) listo para cargarse con transformers o servirse con vLLM. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal de tipo image-text-to-text, y la licencia es Apache 2.0.

El problema que aborda es concreto: forzar que la salida del modelo sea un objeto JSON válido que respete un esquema proporcionado y que esté fundamentado en un contexto dado, además de detectar y corregir errores en candidatos JSON ya existentes. Para ello se entrenó sobre el dataset MoetezF/Finetuning-ready, que combina tareas de extracción y de reparación, con 19.999 filas de entrenamiento y 200 de evaluación, durante 1.250 pasos (una época) con LoRA de rango 32 sobre módulos de atención y MLP.

Su relevancia actual reside en que la salida estructurada fiable es un cuello de botella habitual en pipelines de extracción de información, agentes y automatización documental. El modelo reporta mejoras medibles frente al Qwen3.5-9B base en precisión de valores, fidelidad al contexto, detección de errores y reparación exacta, con tasas de JSON válido superiores al 99,6 % en el conjunto de prueba de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; ajuste fino por LoRA fusionado |
| Parámetros totales | 9.409.813.744 (aproximadamente 9,4 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó max length 4096) |
| Tipos de cuantización | no se documentan tipos específicos; el autor recomienda mantener bf16 y advierte de la sensibilidad de Qwen3.5 a la cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). Sobre esa base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 32, alpha 32 y dropout 0,05, dirigido a los módulos down_proj, gate_proj, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj y v_proj. El optimizador fue AdamW con tasa de aprendizaje 1e-04, scheduler coseno y 37 pasos de calentamiento, con batch efectivo de 16 (batch 1 × acumulación de gradiente 16) y longitud máxima de 4096 tokens. El entrenamiento se realizó en precisión bf16, calculando la pérdida únicamente sobre el turno del asistente, durante 1.250 pasos (una época completa) sobre el dataset MoetezF/Finetuning-ready, con un split estratificado 80/10/10 por tarea y fuente (19.999 filas de entrenamiento y 200 de evaluación). El hardware empleado fue un AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con ROCm.

La pérdida de evaluación bajó de 0,1432 en la primera evaluación a 0,1106 en el mejor checkpoint (checkpoint-1250), que es el que se distribuye en este repositorio. No se documentan fases de RLHF o DPO, ni innovaciones arquitectónicas propias más allá del ajuste LoRA; la innovación funcional es el entrenamiento específico para dos tareas: extracción de JSON condicionada por esquema y verificación/reparación de JSON con inyección de errores. El adaptador LoRA sin fusionar está disponible por separado en abderahmenn/qwen3.5-9b-sob-json-lora.

## Capacidades

- Extracción de información estructurada: genera un único objeto JSON válido que respeta un esquema (SCHEMA) y se fundamenta en un contexto (CONTEXT) proporcionado.
- Verificación de JSON: detecta si un candidato JSON contiene errores respecto al esquema y al contexto.
- Localización de errores: identifica la ruta (path) del campo erróneo dentro del JSON.
- Reparación de JSON: corrige el candidato y devuelve una versión conforme al esquema.
- Cumplimiento estricto de esquema: tasas de json_pass del 99,6 % y schema_ok del 98,9 % en los conjuntos de evaluación reportados.
- Seguridad de tipos: type_safety del 99,9 % en el conjunto de generación.
- Procesamiento multimodal de entrada: al heredar el pipeline image-text-to-text de Qwen3.5, admite entradas de imagen y texto, aunque el ajuste fino se centra en texto y JSON.
- Modo thinking desactivado: los prompts de referencia usan enable_thinking=False; el modelo está entrenado para responder directamente con JSON, sin prosa ni markdown.
- Compatibilidad con tool calling y agentes: no documentada explícitamente en la información proporcionada.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Extracción de datos de contratos y facturas: el modelo recibe el esquema del documento (campos, tipos, jerarquía) y el texto del contrato, y devuelve un JSON con partes, importes, fechas y cláusulas; su alta value_accuracy (84,1 %) y fidelidad (89,0 %) lo hacen adecuado para pipelines de digitalización documental con validación posterior.
- Enriquecimiento de registros en bases de datos: a partir de descripciones libres o páginas web, se le pasa un esquema fijo de entidad y el contexto, y genera el objeto JSON listo para insertar en un ETL, reduciendo la necesidad de parsers ad hoc.
- Verificación y reparación automática de salidas de otros LLM: en una arquitectura de dos etapas, un modelo generador produce JSON y este modelo actúa como validador y corrector (detection_correct del 90,4 %, repair_exact del 77,6 %), lo que disminuye los fallos en cascada en sistemas multiagente.
- Atención al cliente con salida estructurada: extracción de intención, entidades y parámetros de una conversación multi-turno en un JSON que alimenta el enrutador o el CRM, con menos riesgo de respuestas no parseables.
- Automatización de back office y formularios: conversión de correos o tickets en campos estructurados (categoría, prioridad, producto, importe) para su procesamiento sin intervención manual, aprovechando la baja tasa de sobrecorrección (33,1 %) sobre candidatos ya correctos.
- Generación de datasets sintéticos etiquetados: uso del modelo para anotar corpus de texto con esquemas personalizados y producir datos de entrenamiento estructurados de forma masiva.
- Integración en pipelines de CI/CD de datos: servir el modelo con vLLM como endpoint compatible y validar esquemas en cada ejecución, usando el JSON de salida como contrato entre servicios.

## Benchmarks y rendimiento

DS1 — interfaze-ai/sob test (generación), en porcentaje, mayor es mejor salvo over_correction:

| Modelo | Subconjunto | n | json_pass | value_accuracy | faithfulness | path_recall | structure_coverage | type_safety | perfect_response |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| base | full | 5.000 | 99,4 | 81,3 | 86,9 | 98,5 | 98,5 | 99,9 | 48,0 |
| base | clean | 4.568 | 99,4 | 81,3 | 87,0 | 98,5 | 98,5 | 99,9 | 47,9 |
| ft | full | 5.000 | 99,6 | 84,1 | 89,0 | 98,8 | 98,9 | 99,9 | 54,2 |
| ft | clean | 4.568 | 99,6 | 84,1 | 89,1 | 98,8 | 98,9 | 99,9 | 54,0 |

DS2 — seneca-center/SOB-with-errors-injection (verificación y reparación), en porcentaje:

| Modelo | Subconjunto | n | detection_correct | localization_ok | repair_exact | schema_ok | over_correction |
|---|---|---:|---:|---:|---:|---:|---:|
| base | full | 6.667 | 72,3 | 58,6 | 55,8 | 87,6 | 59,3 |
| base | clean | 6.100 | 72,2 | 58,1 | 55,8 | 87,7 | 59,1 |
| ft | full | 6.667 | 90,4 | 92,5 | 77,6 | 98,9 | 33,1 |
| ft | clean | 6.100 | 90,4 | 92,6 | 77,8 | 98,9 | 32,7 |

El autor advierte de contaminación: 430 registros de DS1 y 430 de DS2 comparten un pasaje de contexto con el split de entrenamiento (el split de texto de SOB deriva de HotpotQA, igual que parte del corpus de entrenamiento), aunque ninguno comparte identificador de registro. Las filas clean excluyen esos registros y son las preferibles. La comparación base frente a ft se hizo con prompts idénticos, decodificación greedy y thinking desactivado. Las métricas de DS1 siguen SOB (arXiv:2604.25359): value accuracy y faithfulness se calculan condicionadas a una raíz parseable y válida según esquema y a un path-F1 ≥ 0,95. DS2 mezcla candidatos con errores y un 25 % de candidatos limpios, por lo que over_correction se mide solo sobre los limpios.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB.
- En cuantización de 8 bits: alrededor de 9-10 GB de pesos; en 4 bits, alrededor de 5-6 GB, aunque el autor advierte que Qwen3.5 es especialmente sensible a la cuantización y recomienda evaluar antes de desplegar.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción en bf16; una RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado para contextos cortos.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contextos moderados; en GPUs de 16 GB o menos es necesario cuantizar.
- Opciones de despliegue: transformers (AutoModelForImageTextToText), vLLM (vllm serve abderahmenn/qwen3.5-9b-sob-json) y, previsiblemente, llama.cpp u Ollama mediante conversión a GGUF, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles.
- El entrenamiento se realizó en un AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con ROCm, lo que indica viabilidad en hardware de consumo de gama alta con memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-sob-json | 9,4 mil millones | no disponible | Extracción y reparación de JSON con esquema | Apache 2.0 | HuggingFace (25 descargas) |
| Qwen/Qwen3.5-9B (base) | 9,4 mil millones | no disponible | Modelo generalista multimodal | Apache 2.0 (según base) | HuggingFace |
| Alternativas especializadas en JSON de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base: el ajuste fino mejora value_accuracy de 81,3 a 84,1, faithfulness de 86,9 a 89,0, perfect_response de 48,0 a 54,2, detection_correct de 72,3 a 90,4, repair_exact de 55,8 a 77,6 y reduce over_correction de 59,3 a 33,1. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un modelo generalista, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: la fidelidad al contexto es del 89,0-89,1 % en DS1, lo que implica que en torno a un 11 % de las respuestas pueden no estar plenamente fundamentadas en el contexto; conviene validar en producción.
- Contaminación de evaluación: parte de los registros de test comparten pasajes de contexto con el entrenamiento; deben usarse las cifras del subconjunto clean.
- Sensibilidad a la cuantización: el autor advierte explícitamente de que Qwen3.5 es inusualmente sensible; cuantizar sin evaluar puede degradar la calidad del JSON.
- Contexto: la información disponible no especifica la ventana de contexto nativa; el entrenamiento usó 4096 tokens, por lo que contextos muy largos pueden degradar el rendimiento.
- Idiomas: no se documentan los idiomas soportados; el ajuste fino se realizó sobre un dataset concreto cuya composición lingüística no se detalla.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B y de los datasets empleados.
- Madurez: el repositorio tiene 25 descargas y 0 likes, con una única evaluación publicada por el autor; no hay validación independiente.
- Formato de salida: el modelo está entrenado para responder solo con JSON, sin prosa ni markdown; usarlo en modo conversacional general puede producir salidas no deseadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abderahmenn/qwen3.5-9b-sob-json
- Adaptador LoRA: https://huggingface.co/abderahmenn/qwen3.5-9b-sob-json-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/MoetezF/Finetuning-ready
- Benchmark SOB (generación): interfaze-ai/sob (referenciado en la model card)
- Benchmark SOB con inyección de errores: seneca-center/SOB-with-errors-injection (referenciado en la model card)
- Paper SOB: arXiv:2604.25359
