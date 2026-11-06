# ArthT/jailbreak-judge-27b-lora

## Resumen

`ArthT/jailbreak-judge-27b-lora` es un adaptador LoRA (PEFT) publicado por el usuario ArthT sobre el modelo base `Qwen/Qwen3.8-27B`. Su propósito declarado, a partir de las etiquetas del repositorio, es actuar como juez automático (*LLM-as-a-judge*) en tareas de *red-teaming* y evaluación de seguridad: clasificar si una respuesta de un modelo constituye un *jailbreak* o una violación de políticas. El adaptador se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB, coherente con un LoRA de rango moderado sobre un modelo de 27B.

El modelo se publica bajo licencia Apache 2.0 y está etiquetado únicamente para inglés (`en`). El acceso está restringido en Hugging Face: es necesario aceptar las condiciones del repositorio antes de descargar los pesos. No se han publicado descargas ni *likes* en el momento de redactar esta ficha, y el repositorio se creó y actualizó el 1 de noviembre de 2026, lo que indica una publicación muy reciente y sin validación comunitaria todavía.

La relevancia de este artefacto es acotada pero específica: cubre la necesidad de evaluadores automáticos alineados con el modelo base Qwen3.8-27B para pipelines de *safety evaluation*, donde un juez entrenado sobre el mismo tokenizador y familia de modelos puede reducir el coste de anotación humana en la revisión de ataques adversarios. No obstante, la ausencia de documentación técnica, de *model card* detallada y de benchmarks publicados limita seriamente su uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el adaptador ocupa 0,9 GB en safetensors; el base es de 27B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantización aplicable al base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo PEFT que debe cargarse sobre el modelo base `Qwen/Qwen3.8-27B`. La arquitectura subyacente es, por tanto, la del modelo Qwen3.8-27B, un transformer decoder-only de 27 000 millones de parámetros; el adaptador añade matrices de bajo rango en las proyecciones del transformer para especializar el modelo en la tarea de juicio de *jailbreaks*. No se dispone de información sobre el rango del LoRA, las capas objetivo, el *learning rate*, el número de pasos ni el tamaño del dataset de entrenamiento.

Tampoco se documenta la composición del corpus de entrenamiento: no se indica si se usaron pares (prompt, respuesta, etiqueta de jailbreak), datos sintéticos generados por red-teaming, ni si hubo etapas de DPO o RLHF. Las etiquetas del repositorio (`jailbreak`, `llm-as-a-judge`, `red-teaming`, `ai-safety`) sugieren un fine-tuning supervisado orientado a clasificación binaria o a generación de veredictos con justificación, pero esto es una inferencia a partir de los metadatos, no un dato confirmado. No se han publicado innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) asociadas a este adaptador.

## Capacidades

- Evaluación de seguridad como juez (*LLM-as-a-judge*): clasificación de respuestas de modelos como seguras o constitutivas de *jailbreak*.
- Soporte de *red-teaming*: uso como evaluador automático en bucles de generación de ataques y verificación de respuestas.
- Generación de texto en inglés heredada del modelo base Qwen3.8-27B (razonamiento, código, matemáticas), aunque el adaptador está especializado en la tarea de juicio.
- Capacidad multilingüe: limitada al inglés según la etiqueta `en`; no se garantiza rendimiento en otros idiomas.
- *Tool calling* / *function calling*: no documentado para el adaptador; dependería de las capacidades del base, no verificadas aquí.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- **Evaluación automática de pipelines de red-teaming**: el adaptador actúa como juez sobre las respuestas generadas por modelos atacados, permitiendo filtrar automáticamente los casos de *jailbreak* exitoso sin anotación humana en cada iteración. Es adecuado porque su entrenamiento declarado está orientado precisamente a esta tarea.
- **Control de calidad en datasets de seguridad**: revisión de corpus de instrucciones y respuestas para detectar ejemplos que violen políticas antes de usarlos en entrenamiento, reduciendo el coste de revisión manual.
- **Monitorización en producción de asistentes conversacionales**: integración como clasificador de segunda etapa que evalúa respuestas de un modelo desplegado y marca conversaciones sospechosas para revisión humana.
- **Investigación en alineación y seguridad**: generación de etiquetas automáticas para experimentos que requieren clasificar grandes volúmenes de interacciones adversarias en inglés.
- **Auditoría de modelos de terceros**: uso como evaluador independiente al comparar la robustez frente a *jailbreaks* de distintos modelos o versiones, siempre que se valide su acuerdo con anotadores humanos.
- **Filtrado previo en pipelines de moderación**: primera pasada sobre respuestas candidatas antes de un clasificador más costoso o de una revisión humana, aprovechando que el adaptador es ligero (0,9 GB) frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,9 GB, pero requiere cargar el modelo base Qwen3.8-27B. En FP16/BF16 el base necesita aproximadamente 54 GB de VRAM; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB (estimaciones estándar para 27B, no verificadas para este modelo concreto).
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) viable solo con cuantización de 4 bits del base.
- Cabe en GPU de consumo: sí, únicamente con cuantización agresiva (4 bits) del modelo base en GPUs de 24 GB como la RTX 4090; no cabe en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con vLLM (soporte de LoRA), TGI (soporte de adaptadores), o cargarse con `peft` + `transformers`; llama.cpp/Ollama requerirían convertir el adaptador y fusionarlo con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArthT/jailbreak-judge-27b-lora | 27B (base) + LoRA | no disponible | Juez de jailbreak | apache-2.0 | Gated en HF |
| Llama Guard (Meta) | 8B / variantes | no disponible en esta ficha | Clasificación de seguridad | Llama license | Abierto en HF |
| WildGuard (AllenAI) | 7B | no disponible en esta ficha | Moderación y jailbreak | no disponible en esta ficha | Abierto en HF |
| ShieldGemma (Google) | 2B / 9B / 27B | no disponible en esta ficha | Moderación de contenido | Gemma license | Abierto en HF |

La comparación es orientativa: no se dispone de datos de rendimiento del adaptador que permitan contrastarlo con estos clasificadores de seguridad consolidados. La principal diferencia es que este artefacto es un LoRA sobre un base de 27B, mientras que las alternativas son modelos completos de menor tamaño y con documentación pública de evaluación.

## Limitaciones y advertencias

- Ausencia total de *model card* detallada: no se documentan datos de entrenamiento, hiperparámetros del LoRA, métricas de validación ni acuerdo con anotadores humanos.
- Riesgo de alucinación y de veredictos inconsistentes: al ser un juez generativo, puede producir justificaciones plausibles pero incorrectas; requiere validación contra un conjunto etiquetado antes de usarse en producción.
- Sesgo idiomático: solo inglés; su comportamiento en otros idiomas no está garantizado.
- Sesgos de dominio: al entrenarse presumiblemente sobre un corpus específico de *jailbreaks*, puede no generalizar a nuevas familias de ataques o a dominios alejados del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero el acceso está restringido (*gated*): es necesario aceptar condiciones en Hugging Face y el uso del base Qwen3.8-27B está sujeto a su propia licencia.
- Sin validación comunitaria: cero descargas y cero *likes* en el momento de la ficha; no hay evidencia independiente de su calidad.
- Dependencia del base: cualquier cambio en la versión o cuantización del modelo Qwen3.8-27B puede alterar el comportamiento del adaptador.
- No apto como único mecanismo de seguridad: debe combinarse con filtros deterministas y revisión humana en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/ArthT/jailbreak-judge-27b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería PEFT: https://github.com/huggingface/peft
