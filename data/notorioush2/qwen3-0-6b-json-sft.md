# NotoriousH2/Qwen3-0.6B-JSON-SFT

## Resumen

Qwen3-0.6B-JSON-SFT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-0.6B, desarrollado por el usuario NotoriousH2. Su propósito es muy concreto: extraer de actas de reuniones en coreano una estructura JSON con cuatro bloques (`meeting_metadata`, `action_items`, `decisions` y `blockers`). No es un modelo de propósito general, sino un extractor especializado que transforma texto libre en datos estructurados y consumibles por sistemas posteriores.

El modelo parte de la arquitectura transformer densa de Qwen3 con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y se entrena mediante full fine-tuning sobre un conjunto de 1.115 ejemplos del dataset `NotoriousH2/meeting-to-json-ko`. El contexto de entrenamiento se fija en 3.072 tokens, suficiente para actas de reunión de extensión media. El resultado es un modelo muy ligero, desplegable en hardware modesto, que mejora de forma sustancial las métricas de estructuración respecto al modelo base.

La relevancia actual del modelo radica en su especialización: frente a alternativas generalistas que requieren prompts complejos y parseo tolerante a fallos, este ajuste consigue un 99,6 % de tasa de parseo y cumplimiento de esquema en el conjunto de test, lo que lo hace útil para pipelines de automatización documental donde la salida debe ser JSON válido de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 3.072 tokens (max_length de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bf16) |
| Idiomas soportados | Coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del transformer denso Qwen3-0.6B. El entrenamiento se realizó con la librería TRL mediante SFT, con `loss_type=chunked_nll`, empaquetado de secuencias (packing) y una longitud máxima de 3.072 tokens. Se emplearon 3 épocas, tasa de aprendizaje 5e-5 con decaimiento coseno y warmup del 5 %, batch efectivo de 16 (batch 2 × acumulación de gradientes 8), optimizador `paged_adamw_8bit` y precisión bf16. El 10 % de los datos de entrenamiento se reservó para monitorización con early stopping.

Los datos provienen del dataset `NotoriousH2/meeting-to-json-ko`, con 1.115 ejemplos de entrenamiento. Cada ejemplo se construye con un prompt de sistema que describe el esquema JSON esperado seguido del texto del acta (`회의록:\n\n{meeting}`), y el modo de razonamiento (thinking) de Qwen3 se desactiva durante el entrenamiento. No se documenta el uso de RLHF ni DPO; el proceso es exclusivamente SFT sobre pares entrada-salida estructurados.

## Capacidades

- Extracción de JSON estructurado desde actas de reunión en coreano, con los bloques `meeting_metadata`, `action_items`, `decisions` y `blockers`.
- Generación de texto conversacional heredada del modelo base Qwen3-0.6B.
- Cumplimiento estricto de esquema: 99,6 % de `schema_compliance` en el conjunto de test.
- Salida parseable de forma fiable: 99,6 % de `parse_rate` con temperatura 0.
- Procesamiento de entradas de hasta 3.072 tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking activo (este último se desactiva explícitamente en el entrenamiento).
- Capacidad multilingüe limitada al coreano según la model card; el modelo base soporta más idiomas, pero el ajuste está orientado solo a coreano.

## Casos de uso

- Automatización de actas de reunión: el modelo recibe el texto de un acta en coreano y devuelve un JSON con metadatos, tareas asignadas, decisiones y bloqueos, listo para insertarse en una base de datos o en un sistema de gestión de proyectos.
- Sincronización con herramientas de gestión de tareas: los `action_items` extraídos pueden mapearse directamente a tickets en Jira, Linear o Asana mediante un conector que consuma el JSON de salida.
- Seguimiento de decisiones y bloqueos: los bloques `decisions` y `blockers` permiten construir paneles de seguimiento automáticos de reuniones recurrentes sin intervención manual.
- Enriquecimiento de bases de conocimiento corporativas: el JSON estructurado se indexa en motores de búsqueda o sistemas RAG para consultas posteriores sobre lo tratado en reuniones.
- Procesamiento por lotes de archivos históricos: al ser un modelo de 0,6 mil millones de parámetros, puede ejecutarse en CPU o en GPU de gama baja para procesar grandes volúmenes de actas archivadas.
- Componente de un pipeline de extracción con verificación: la alta tasa de cumplimiento de esquema permite usar la salida directamente, reservando la revisión humana solo para los casos que fallen el parseo.
- Servicio interno de bajo coste: desplegado con vLLM o llama.cpp en una única GPU consumer, puede atender peticiones de extracción con latencia baja y coste reducido.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test (273 ejemplos, temperatura 0), según la model card del autor:

| Métrica | Qwen3-0.6B (base) | Qwen3-0.6B-JSON-SFT |
|---|---|---|
| parse_rate | 97,8 % | 99,6 % |
| schema_compliance | 96,3 % | 99,6 % |
| semantics_pass_rate | 85,1 % | 99,5 % |
| field_f1_mean | 39,4 % | 71,1 % |
| struct_f1_mean | 47,6 % | 79,2 % |
| text_f1_mean | 15,0 % | 46,1 % |

El `field_f1` empareja elementos de lista homólogos y puntúa los campos descriptivos mediante similitud de bigramas de caracteres. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16/fp16 para los pesos (596 millones de parámetros); en cuantización de 8 bits bajaría a unos 0,6 GB y en 4 bits a unos 0,3 GB, aunque el repo no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16, como RTX 3050, RTX 4060, T4 o superiores; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers con TRL; al ser un modelo pequeño, la inferencia en CPU con llama.cpp es viable para cargas moderadas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-JSON-SFT | 596 M | 3.072 tokens (entrenamiento) | Extracción JSON de actas en coreano | no disponible | Hugging Face |
| Qwen/Qwen3-0.6B | 596 M | contexto nativo no disponible | Propósito general | no disponible en la información | Hugging Face |
| Alternativas de extracción JSON de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base Qwen3-0.6B, sobre el que se observan mejoras de 31,7 puntos en `field_f1_mean`, 31,6 puntos en `struct_f1_mean` y 31,1 puntos en `text_f1_mean`. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para coreano y para la tarea de extracción de JSON de actas de reunión; su rendimiento fuera de ese dominio no está garantizado.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe verificarse antes de cualquier despliegue en producción.
- El contexto de entrenamiento es de 3.072 tokens; actas más largas requerirán truncado o segmentación, con riesgo de perder información.
- El ajuste se basa en 1.115 ejemplos de entrenamiento, un volumen reducido que puede limitar la generalización a formatos de acta muy distintos a los del dataset.
- Riesgo de alucinación en campos descriptivos: aunque la tasa de cumplimiento de esquema es alta, el `text_f1_mean` de 46,1 % indica que la coincidencia literal con el texto de referencia es parcial.
- El modo thinking de Qwen3 se desactiva en el entrenamiento; activarlo en inferencia podría degradar el formato de salida esperado.
- No se documentan sesgos específicos, pero al derivar de Qwen3-0.6B puede heredar los sesgos del modelo base.
- No se publican versiones cuantizadas ni datos de latencia, lo que complica la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NotoriousH2/Qwen3-0.6B-JSON-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/NotoriousH2/meeting-to-json-ko
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
