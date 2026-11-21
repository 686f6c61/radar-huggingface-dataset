# PromptforceAI/niti-safety-9b

## Resumen

Niti Safety 9B es un adaptador LoRA de evaluación de seguridad (prompt-safety judge) construido sobre el modelo destilado empero-ai/Qwen3.8-9B-Distill. Su función es concreta: recibe un texto y una pregunta de seguridad y devuelve la probabilidad de que el texto sea inseguro, leyendo la respuesta sí/no del modelo base y aplicando umbrales de decisión fijados en el fichero `niti.json`. Lo desarrolla PromptforceAI y se distribuye como adaptador PEFT, no como modelo completo.

El modelo se enmarca en la categoría de guardrails y moderación de contenido: no genera respuestas conversacionales, sino que actúa como clasificador binario de seguridad con calibración por umbral. Se integra en el ecosistema unsafe-eval a través del proveedor `niti`, con la referencia `model: niti/prompt-force/niti-safety-9b` y la revisión fijada.

Su relevancia actual radica en la creciente necesidad de jueces de seguridad reproducibles y auditables para pipelines de evaluación de LLM. El entrenamiento se realizó sobre datasets públicos de seguridad (Aegis 2.0, WildGuardMix, ToxicChat, Civil Comments, DynaBench y otros), excluyendo filas de test de benchmarks, y la licencia restringe el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder (base: empero-ai/Qwen3.8-9B-Distill) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se denomina 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Niti Safety 9B Evaluation License (uso no comercial, solo investigación y evaluación) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre el modelo destilado Qwen3.8-9B-Distill, que actúa como backbone transformer de tipo decoder. El adaptador no modifica la arquitectura base: añade matrices de bajo rango para especializar el modelo en la tarea de juicio de seguridad. La inferencia se realiza formulando una pregunta de seguridad junto al texto y leyendo la respuesta sí/no del modelo, con umbrales de corte predefinidos en `niti.json` que convierten la salida en una probabilidad de inseguridad calibrada.

El entrenamiento empleó exclusivamente datasets públicos de seguridad: Aegis 2.0, WildGuardMix, ToxicChat, Civil Comments, DynaBench y otros. La model card indica explícitamente que no se incluyeron filas de test de benchmarks en el conjunto de entrenamiento, lo que reduce el riesgo de contaminación en la evaluación. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles.

## Capacidades

- Clasificación de seguridad binaria: devuelve P(unsafe) para un texto dado una pregunta de seguridad.
- Moderación de contenido: identificación de contenido tóxico, dañino o inseguro según las categorías cubiertas por los datasets de entrenamiento.
- Evaluación de prompts: actúa como juez en pipelines de evaluación de seguridad de LLM.
- Integración con unsafe-eval mediante el proveedor `niti` y revisión fijada.
- Umbrales de decisión configurables a través de `niti.json`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking; el modelo está especializado exclusivamente en juicio de seguridad.
- Capacidades multilingües: no disponibles (los idiomas soportados no se especifican).

## Casos de uso

- Evaluación de seguridad de LLM en investigación: el modelo se integra en unsafe-eval como juez que puntúa las respuestas de otros modelos, permitiendo comparar tasas de contenido inseguro entre sistemas con umbrales fijos y reproducibles.
- Moderación de contenido en entornos de investigación: clasificación de textos de usuario en corpus de estudio para medir prevalencia de contenido dañino, aprovechando el entrenamiento sobre Aegis 2.0, WildGuardMix y ToxicChat.
- Auditoría de datasets: puntuación de grandes colecciones de prompts o respuestas para detectar contenido inseguro antes de su uso en entrenamiento, con la ventaja de que el modelo no vio filas de test de benchmarks.
- Filtrado en pipelines de anotación: preetiquetado de muestras como seguras o inseguras para priorizar la revisión humana en proyectos de anotación de seguridad.
- Validación de guardrails propios: uso como referencia externa para contrastar el comportamiento de clasificadores de seguridad internos, gracias a los umbrales publicados en `niti.json`.
- Investigación sobre calibración de jueces de seguridad: el diseño de lectura sí/no con cortes fijos permite estudiar la calibración y el sesgo de los clasificadores basados en LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB (tamaño del repo), pero requiere cargar el modelo base empero-ai/Qwen3.8-9B-Distill para la inferencia.
- VRAM estimada: no disponible con precisión; un modelo base de 9B en fp16 requiere del orden de 18 GB, y en cuantización de 4 bits alrededor de 5-6 GB, aunque estos valores son estimaciones generales para modelos de ese tamaño y no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependería de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: la model card solo documenta la integración vía PEFT y el proveedor `niti` de unsafe-eval; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Niti Safety 9B | Adaptador LoRA sobre base 9B | no disponible | Juez de seguridad (P(unsafe)) | No comercial (evaluación) | Hugging Face, acceso con gating |
| WildGuard (referencia por dataset) | no disponible | no disponible | Clasificador de seguridad | no disponible | no disponible |
| Aegis (referencia por dataset) | no disponible | no disponible | Clasificador de seguridad | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a la categoría de uso (jueces y clasificadores de seguridad entrenados sobre datasets públicos similares).

## Limitaciones y advertencias

- Licencia estrictamente no comercial: solo investigación y evaluación, con acceso condicionado (gating) que exige nombre, organización, uso previsto y aceptación de los términos.
- Uso comercial requiere contacto explícito con PromptForce.
- El modelo es un adaptador LoRA: sin el modelo base empero-ai/Qwen3.8-9B-Distill no es funcional, y hereda las limitaciones y sesgos de dicho base.
- Al ser un clasificador binario con umbrales fijos, su comportamiento depende críticamente de `niti.json`; cambios en los cortes alteran las tasas de falsos positivos y negativos.
- Riesgo de alucinación en la lectura sí/no: el modelo base puede producir respuestas ambiguas que el mecanismo de lectura debe resolver; no se documenta cómo se tratan estos casos.
- Sesgos potenciales derivados de los datasets de entrenamiento (Aegis 2.0, WildGuardMix, ToxicChat, Civil Comments, DynaBench), cuya composición y balance no se detallan.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no disponible, lo que limita la planificación de despliegue con textos largos.
- Sin descargas ni likes en el momento de la consulta y sin pipeline declarado; madurez y soporte comunitario limitados.
- No debe usarse como único mecanismo de seguridad en producción sin validación adicional y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PromptforceAI/niti-safety-9b
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio unsafe-eval: https://github.com/Principled-Intelligence/unsafe-eval
- Licencia: fichero LICENSE en el repositorio del modelo (https://huggingface.co/PromptforceAI/niti-safety-9b/blob/main/LICENSE)
