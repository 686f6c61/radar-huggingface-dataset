# RishyanthReddy/aawden-qwen2.5-14b-adapters

## Resumen

Aawden es una colección de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen2.5-14B-Instruct, publicados por RishyanthReddy en el contexto del hackathon de seguridad en IA "Lexsi AI Safety" (Track 2). El objetivo del proyecto es estudiar y mitigar un fenómeno de conformidad social en modelos de lenguaje: cuando un revisor afirma que un fragmento de código es seguro y en realidad no lo es, ¿el modelo verifica el código o se pliega a la opinión del revisor? Los adaptadores buscan que el veredicto de seguridad siga a la evidencia del código con independencia de lo que diga el revisor.

El repositorio no contiene un modelo completo, sino ocho carpetas de adaptadores LoRA (2,2 GB en total) que incluyen las variantes anti-deferencia con tres semillas distintas, versiones escaladas al 25 %, 50 % y 75 % de intensidad, un control de solo tarea y una variante con respuesta previa. Esta exhaustividad, incluyendo los adaptadores fallidos y los controles, está pensada para que las afirmaciones del informe técnico puedan reproducirse y auditarse.

El modelo base Qwen2.5-14B-Instruct aporta la arquitectura transformer densa, el contexto largo y las capacidades multilingües; los adaptadores añaden un comportamiento específico de revisión de seguridad en Python, orientado a inyección SQL y control de acceso, y entrenado exclusivamente en inglés. Es relevante ahora porque aborda un problema de alineación poco tratado —la adulación o *sycophancy* ante revisores— con un protocolo de evaluación fijado de antemano y artefactos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen2.5-14B-Instruct |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base tiene 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 16 y alpha 32, con dropout 0,05, aplicados sobre los siete módulos de proyección del transformer base (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usa tasa de aprendizaje 1e-4, batch 1 con acumulación de gradiente 8 y 2 épocas sobre 804 filas (268 casos de revisión de seguridad mostrados de tres formas: sin revisor, con revisor correcto y con revisor incorrecto, todos con el mismo objetivo correcto), lo que da 201 pasos. Los controles de solo tarea se entrenan 6 épocas sobre sus 268 filas para igualar el número de pasos.

Los datos provienen de 134 familias que nunca aparecen en el conjunto de test, lo que evita fuga de información entre entrenamiento y evaluación. Las variantes escaladas (`-x0.25`, `-x0.5`, `-x0.75`) no se reentrenan: son el adaptador de semilla 17 con las matrices B de LoRA multiplicadas por el factor correspondiente, registrado en `scale.json`. Cada adaptador incluye metadatos de entrenamiento (`train_meta.json`), curvas de pérdida (`loss.json`) y hashes de datos. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre pares prompt-objetivo con prefill de veredicto JSON.

## Capacidades

- Revisión de seguridad de código Python en inglés, centrada en inyección SQL y control de acceso sobre ficheros con plantillas.
- Emisión de veredictos estructurados en JSON tras el prefill `{"verdict":"`.
- Resistencia a la deferencia ante revisores: el adaptador anti-deferencia mantiene el veredicto correcto aunque un revisor afirme lo contrario.
- Control de anclaje mediante la variante `qwen14b-prior-s17`, que incorpora la respuesta previa del propio modelo para probar sesgos de anclaje.
- Capacidades heredadas del modelo base Qwen2.5-14B-Instruct (generación de texto, razonamiento, código y multilingüismo), aunque los adaptadores solo se han entrenado y medido en inglés.
- No se documenta soporte específico de tool calling, function calling ni modos de agente en los adaptadores.

## Casos de uso

- Auditoría de revisiones de código asistidas por IA: el adaptador permite comprobar si un modelo de revisión mantiene su criterio cuando un comentario humano o automático afirma erróneamente que el código es seguro, útil para evaluar pipelines de revisión automatizada.
- Investigación en alineación y *sycophancy*: sirve como artefacto reproducible para estudiar la deferencia ante figuras de autoridad en modelos de lenguaje, con controles y semillas múltiples que permiten medir la varianza del efecto.
- Evaluación de robustez de asistentes de seguridad: integrado en un banco de pruebas, el adaptador ayuda a cuantificar cuánto se pliega un modelo a un revisor incorrecto antes y después del ajuste.
- Formación de revisores humanos: los veredictos JSON del adaptador pueden usarse como segunda opinión en sesiones de formación sobre detección de inyección SQL y fallos de control de acceso.
- Estudio del compromiso entre resistencia y precisión: las variantes escaladas al 25 %, 50 % y 75 % permiten trazar curvas de trade-off entre ignorar al revisor y mantener la calidad de la revisión.
- Reproducción de experimentos académicos: el repositorio incluye adaptadores fallidos, controles y hashes de datos, lo que facilita replicar el protocolo fijado en `docs/FIX_PROTOCOL.md` en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `runs/fix/round2-summary.md` del repositorio de GitHub para las cifras de los adaptadores, pero no se incluyen tablas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los adaptadores son ligeros (2,2 GB en total para las ocho carpetas), pero requieren cargar el modelo base Qwen2.5-14B-Instruct en bfloat16, lo que supone aproximadamente 28 GB de VRAM solo para los pesos base; con cuantización de 8 bits bajaría a unos 14-15 GB y con 4 bits a unos 8-9 GB, aunque los adaptadores se entrenaron y midieron en bfloat16.
- GPU recomendadas: A100 40 GB o H100 para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) resulta insuficiente para el modelo base a 16 bits y requeriría cuantización.
- Cabe en GPU de consumo (RTX 3090, RTX 4090, RTX 4080) solo con cuantización de 8 o 4 bits del modelo base, con la consiguiente posible degradación del comportamiento del adaptador.
- Opciones de despliegue: la carga documentada usa `transformers` con `PeftModel.from_pretrained` y `device_map="auto"`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de seguridad o anti-sycophancy) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Artefactos de investigación, no una herramienta de seguridad para producción.
- Cobertura limitada: revisión de seguridad de Python en inglés, principalmente inyección SQL y control de acceso, sobre ficheros con plantillas.
- El adaptador ignora a todos los revisores, incluidos los correctos; no aprende a distinguir qué revisor merece confianza.
- Las etiquetas fueron escritas por un único autor y no han sido revisadas de forma independiente.
- Riesgo de alucinación y de veredictos erróneos fuera del dominio de entrenamiento (otros lenguajes, otros tipos de vulnerabilidad o código no plantillado).
- Sesgos potenciales derivados del conjunto de 134 familias de casos y de un único idioma de entrenamiento.
- Licencia apache-2.0 heredada del modelo base, que permite uso comercial, pero el autor desaconseja explícitamente su uso como herramienta de seguridad en producción.
- Solo se ha validado en inglés; el comportamiento en castellano u otros idiomas no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/RishyanthReddy/aawden-qwen2.5-14b-adapters
- Informe técnico (write-up): https://rishyanthreddy-aawden-article.static.hf.space
- Código y protocolo: https://github.com/Aya-Jmd/Aawden
- Protocolo de evaluación fijado: https://github.com/Aya-Jmd/Aawden/blob/master/docs/FIX_PROTOCOL.md
- Resumen de resultados: https://github.com/Aya-Jmd/Aawden/blob/master/runs/fix/round2-summary.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
