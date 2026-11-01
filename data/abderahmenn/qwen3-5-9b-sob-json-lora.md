# abderahmenn/qwen3.5-9b-sob-json-lora

## Resumen

`qwen3.5-9b-sob-json-lora` es un adaptador LoRA publicado por el usuario abderahmenn sobre el modelo base `Qwen/Qwen3.5-9B`. Su propósito es especializar al modelo en dos tareas concretas de salida estructurada: la extracción de JSON condicionada por un esquema (schema-constrained JSON extraction) y la verificación y reparación de JSON (JSON verification/repair). El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo fusionado; el autor publica una versión mergeada en bf16 en un repositorio separado.

La relevancia de esta ficha está en que cuantifica con detalle el efecto del ajuste fino sobre tareas de extracción estructurada, comparando el modelo base y el ajustado con idénticos prompts y decodificación greedy. Según la model card, el ajuste eleva la precisión de valores del 81,3 % al 84,1 % y la tasa de respuestas perfectas del 48,0 % al 54,2 % en el conjunto DS1, y mejora de forma mucho más acusada la detección y reparación de errores en DS2 (detección correcta del 72,3 % al 90,4 %).

El adaptador se entrenó con SFT sobre el dataset `MoetezF/Finetuning-ready`, con LoRA de rango 32 y 1.250 pasos. Está pensado para integrarse en pipelines de extracción de información donde la validez sintáctica y la fidelidad al contexto son requisitos de producción, no opcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-9B`; módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj`, `down_proj`, `gate_proj`, `out_proj`, `in_proj_qkv`, `in_proj_z` |
| Parametros totales | no disponible (el adaptador ocupa 0,3 GB; el modelo base es de 9B según su denominación) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó max length 4096) |
| Tipos de cuantizacion | no especificados; el autor advierte que Qwen3.5 es especialmente sensible a la cuantización y recomienda mantener bf16 y evaluar antes de cuantizar |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe versión fusionada en bf16 en `abderahmenn/qwen3.5-9b-sob-json` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso Qwen3.5-9B mediante LoRA con r=32, alpha=32 y dropout=0,05. Los módulos objetivo incluyen las proyecciones de atención y MLP habituales, además de `in_proj_qkv` e `in_proj_z`, lo que sugiere que el modelo base incorpora componentes de atención lineal o híbrida; la información disponible no detalla la arquitectura interna del base más allá de estos nombres de módulo.

El entrenamiento consistió en SFT con AdamW (lr 1e-04, schedule coseno, 37 pasos de warmup), batch efectivo de 16 (batch 1 × acumulación de gradiente 16), precisión bf16 y pérdida calculada únicamente sobre el turno del asistente. Se ejecutaron 1.250 pasos (una época) sobre 19.999 filas de entrenamiento y 200 de evaluación, con partición estratificada 80/10/10 por tarea y fuente. La pérdida de evaluación bajó de 0,1432 en la primera evaluación a 0,1106 en el checkpoint final (`checkpoint-1250`), que es el publicado. El entrenamiento se realizó sobre hardware AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con ROCm. No se menciona RLHF ni DPO.

## Capacidades

- Extracción de JSON condicionada por esquema: dado un SCHEMA, un CONTEXT y una QUESTION, devuelve un único objeto JSON válido y fundamentado en el contexto, sin markdown ni prosa.
- Verificación de JSON: detecta si una respuesta candidata contiene errores respecto al esquema y al contexto.
- Localización de errores: identifica la ruta (path) del JSON donde se produce el fallo.
- Reparación de JSON: corrige la respuesta errónea minimizando cambios innecesarios (métrica de over_correction).
- Cumplimiento de tipos: mantiene la seguridad de tipos exigida por el esquema (type_safety del 99,9 % en DS1).
- Modo thinking desactivado: los prompts de referencia usan `enable_thinking=False`; el ajuste está orientado a respuestas directas sin cadena de pensamiento.
- Capacidades del modelo base (razonamiento, código, matemáticas, multilingüismo, tool calling): heredadas de Qwen3.5-9B, pero no documentadas ni evaluadas en esta model card.
- No se documentan capacidades de visión, audio ni agentes específicas para este adaptador.

## Casos de uso

- Extracción de datos de contratos y facturas: el adaptador recibe el esquema del documento (campos, tipos, jerarquía) y el texto, y devuelve el JSON rellenado. La métrica de value_accuracy del 84,1 % y la fidelidad al contexto del 89,0 % lo hacen adecuado para pipelines con validación posterior.
- Enriquecimiento de registros en ETL: integrado como paso de transformación que convierte texto libre (correos, tickets, notas) en objetos JSON conformes a un esquema fijo, reduciendo el código de parseo a medida.
- Validación y autocorrección de salidas de otros LLM: el adaptador actúa como verificador que detecta errores de esquema y de contenido (detección correcta del 90,4 % en DS2) y repara la respuesta, con una tasa de sobrecorrección del 33,1 % sobre candidatos ya correctos.
- Construcción de bases de conocimiento estructuradas: extracción por lotes de entidades y relaciones desde corpus textuales hacia JSON, con path_recall del 98,8 % en DS1.
- Puerta de calidad en pipelines de agentes: intercalar el adaptador entre la generación libre de un agente y el consumo del JSON por un servicio downstream, reparando salidas malformadas antes de que rompan el contrato de la API.
- Extracción de información financiera o legal con esquemas versionados: al estar condicionado por esquema, permite cambiar el contrato de salida sin reentrenar, siempre que se valide el comportamiento con el nuevo esquema.
- Procesamiento de formularios y encuestas en texto: normalización de respuestas abiertas a campos tipados, aprovechando la seguridad de tipos del 99,9 %.

## Benchmarks y rendimiento

Resultados publicados en la model card. `base` es `Qwen/Qwen3.5-9B` con prompts idénticos, decodificación greedy y thinking desactivado.

DS1 — interfaze-ai/sob test (generación), porcentajes, mayor es mejor salvo over_correction:

| Modelo | Subconjunto | n | json_pass | value_accuracy | faithfulness | path_recall | structure_coverage | type_safety | perfect_response |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| base | full | 5.000 | 99,4 | 81,3 | 86,9 | 98,5 | 98,5 | 99,9 | 48,0 |
| base | clean | 4.568 | 99,4 | 81,3 | 87,0 | 98,5 | 98,5 | 99,9 | 47,9 |
| ft | full | 5.000 | 99,6 | 84,1 | 89,0 | 98,8 | 98,9 | 99,9 | 54,2 |
| ft | clean | 4.568 | 99,6 | 84,1 | 89,1 | 98,8 | 98,9 | 99,9 | 54,0 |

DS2 — seneca-center/SOB-with-errors-injection (verificación/reparación), porcentajes:

| Modelo | Subconjunto | n | detection_correct | localization_ok | repair_exact | schema_ok | over_correction |
|---|---|---:|---:|---:|---:|---:|---:|
| base | full | 6.667 | 72,3 | 58,6 | 55,8 | 87,6 | 59,3 |
| base | clean | 6.100 | 72,2 | 58,1 | 55,8 | 87,7 | 59,1 |
| ft | full | 6.667 | 90,4 | 92,5 | 77,6 | 98,9 | 33,1 |
| ft | clean | 6.100 | 90,4 | 92,6 | 77,8 | 98,9 | 32,7 |

Nota de contaminación: 430 registros fuente de DS1 y 430 de DS2 comparten un pasaje de contexto con el split de entrenamiento (el split de texto de SOB deriva de HotpotQA, igual que parte del corpus de entrenamiento), aunque ninguno comparte id de registro. Las filas `clean` excluyen esos registros y son las preferibles. Las métricas de DS1 siguen SOB (arXiv:2604.25359); value accuracy y faithfulness se condicionan a una raíz parseable y válida según esquema y a un path-F1 ≥ 0,95. DS2 mezcla candidatos con errores y un 25 % de candidatos limpios, por lo que over_correction se mide solo sobre los limpios.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB, pero requiere cargar el modelo base Qwen3.5-9B completo en memoria.
- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud para un modelo denso de 9B en bf16, se necesitan aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó sobre AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con ROCm, lo que indica viabilidad en hardware de memoria unificada.
- Cabe en GPU de consumo: no confirmado en la información disponible; dependerá del tamaño real del base y de la cuantización, que el autor desaconseja sin evaluar previamente.
- Despliegue: la model card muestra carga con `transformers` + `peft` (`PeftModel.from_pretrained`) y `AutoModelForImageTextToText`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; la integración con vLLM requeriría fusionar el adaptador en el base o usar soporte de LoRA de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación más directa disponible es contra su propio modelo base, `Qwen/Qwen3.5-9B`, con los resultados de las tablas de benchmarks anteriores: el ajuste mejora value_accuracy (+2,8 puntos), faithfulness (+2,1), perfect_response (+6,2) y, sobre todo, detection_correct (+18,1), localization_ok (+34,4), repair_exact (+21,8) y over_correction (−26,2) en DS2.

| Criterio | qwen3.5-9b-sob-json-lora | Qwen/Qwen3.5-9B (base) |
|---|---|---|
| Parámetros | adaptador sobre 9B (total no disponible) | 9B (según denominación) |
| Contexto | no disponible | no disponible |
| DS1 perfect_response (clean) | 54,0 % | 47,9 % |
| DS2 detection_correct (clean) | 90,4 % | 72,2 % |
| DS2 repair_exact (clean) | 77,8 % | 55,8 % |
| Licencia | Apache 2.0 | no disponible en esta ficha |
| Formato | safetensors (LoRA) + versión fusionada bf16 | pesos completos |

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el autor advierte explícitamente que Qwen3.5 es inusualmente sensible a la cuantización y recomienda mantener bf16 o evaluar antes de cuantizar. No hay métricas publicadas en cuantizado.
- Sobre corrección en reparación: el 33,1 % de over_correction en DS2 significa que, sobre candidatos ya correctos, el modelo introduce cambios en un tercio de los casos. En producción conviene usar un umbral de confianza o validar el resultado antes de aceptar la reparación.
- Contaminación parcial de los conjuntos de evaluación: 430 registros de DS1 y 430 de DS2 comparten pasaje de contexto con el entrenamiento. Las cifras `clean` son las fiables.
- Tamaño de evaluación limitado: solo 200 filas de evaluación durante el entrenamiento y una única época; no hay barrido de hiperparámetros documentado.
- Idiomas no documentados: la model card no declara idiomas soportados; el comportamiento fuera del inglés no está evaluado.
- Contexto máximo no documentado: el entrenamiento usó 4.096 tokens, pero no se confirma la ventana nativa del base ni el comportamiento más allá de esa longitud.
- Modo thinking desactivado: los prompts de referencia usan `enable_thinking=False`; no se ha evaluado el adaptador con thinking activado.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar también la licencia del modelo base Qwen3.5-9B, no detallada en la información disponible.
- Riesgo de alucinación: aunque faithfulness alcanza el 89,1 %, un 10,9 % de respuestas no está plenamente fundamentada en el contexto; en dominios críticos se requiere verificación posterior.
- Descargas muy bajas (13) y ausencia de likes: ecosistema de validación externa prácticamente nulo.

## Enlaces

- Repositorio del adaptador LoRA: https://huggingface.co/abderahmenn/qwen3.5-9b-sob-json-lora
- Versión fusionada en bf16: https://huggingface.co/abderahmenn/qwen3.5-9b-sob-json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/MoetezF/Finetuning-ready
- Paper de referencia de las métricas DS1 (SOB): arXiv:2604.25359
