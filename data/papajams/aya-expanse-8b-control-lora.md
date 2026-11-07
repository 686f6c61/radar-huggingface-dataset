# Papajams/aya-expanse-8b-control-lora

## Resumen

`aya-expanse-8b-control-lora` es un adaptador LoRA sobre el modelo CohereLabs/aya-expanse-8b (8.000 millones de parámetros) desarrollado por el usuario Papajams en el contexto del hackathon Lexsi. Su función es muy concreta: convertir un modelo de chat generalista en un clasificador de decisiones de control de un solo turno. Dado un prompt que contiene una política de despliegue, el estado actual de un agente y una acción propuesta, el adaptador debe responder con exactamente una palabra entre `ALLOW`, `REFUSE`, `ESCALATE` o `CLARIFY`.

El interés del proyecto no reside en el rendimiento bruto del modelo base, sino en el enfoque de monitorización de bajo coste: un adaptador pequeño (repo de 0,1 GB) que corrige un sesgo específico del modelo original, la infra-rechazo en contextos de seguridad de agentes. El modelo base sin ajustar dejaba pasar 25 de 93 acciones que deberían rechazarse y casi nunca solicitaba aclaraciones (recall de CLARIFY del 8,3 %). Tras el ajuste, esas cifras mejoran sustancialmente.

Se trata de un artefacto experimental, no de un producto listo para producción: los datos de entrenamiento son escasos (375 registros), las etiquetas son generadas por un profesor (gpt-4o-mini) sin auditoría humana completa y el alcance se limita a tareas de flujo de trabajo de agentes en Linux. Es relevante ahora porque ejemplifica una tendencia creciente: usar adaptadores ligeros para especializar modelos abiertos en funciones de política y seguridad dentro de sistemas multiagente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Aya Expanse 8B |
| Parametros totales | 8B (modelo base); adaptador LoRA con rank 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | no disponible (los pesos base estan sujetos a la licencia de Cohere, con acceso restringido en el Hub) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rank 16, alpha 32 y dropout 0,05 sobre el modelo CohereLabs/aya-expanse-8b. El entrenamiento se realizó con AlignTune SFT (backend TRL) en una única GPU A100 de 80 GB, durante 3 épocas (141 pasos), con tamaño de lote 8, tasa de aprendizaje 1e-4, longitud máxima de secuencia 1024 y semilla 42. La pérdida final de entrenamiento fue 0,948, con una precisión media por token de 0,916 y un tiempo de ejecución de aproximadamente 89 segundos.

Los datos de entrenamiento provienen del dataset `Papajams/control-decisions-v1`, compuesto por 375 registros (uno fue rechazado por el filtro de secretos de CuratorKIT). Estos registros se derivaron de 94 tareas secundarias reales de Control Tower en 10 entornos (auto_workflow, clinical_trial, file_indexing, media_processing, model_registry, shared_dotfiles, slack_clone, tiktok, user_tracking, web_scraping), recolectadas con objetivos, superficies de ataque, documentación de evaluadores y notas de estrategia de red team. Las etiquetas fueron generadas por gpt-4o-mini como profesor sobre la política de control, con distribución ALLOW 105 / ESCALATE 94 / REFUSE 92 / CLARIFY 84. El formato es Alpaca, con el prompt completo en `instruction` (política, estado del agente, acción propuesta y formato de respuesta) y la decisión de una palabra en `output`. El pipeline de curación con CuratorKIT incluyó lector JSONL, validación de esquema, filtro de secretos, deduplicación exacta, limpieza de texto y exportador Alpaca, con procedencia y filas rechazadas incluidas en el dataset.

## Capacidades

- Clasificación de decisiones de control en un solo turno: responde exactamente una palabra entre `ALLOW`, `REFUSE`, `ESCALATE` o `CLARIFY`.
- Evaluación de políticas de despliegue: interpreta una política dada en el prompt y la aplica al estado del agente y la acción propuesta.
- Detección de acciones inseguras: mejora el recall de REFUSE del 44,1 % al 74,2 % respecto al modelo base.
- Solicitud de aclaración: mejora el recall de CLARIFY del 8,3 % al 48,8 %.
- Escalado de casos ambiguos: recall de ESCALATE del 71,3 %.
- No soporta tool calling ni function calling (la plantilla de chat de Aya Expanse no tiene soporte de herramientas).
- No soporta razonamiento multi-paso ni juicio a nivel de trayectoria; es estrictamente un clasificador de un solo turno.
- Capacidades multilingües limitadas al inglés en este adaptador.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Monitorización de seguridad en despliegues de agentes: el adaptador actúa como componente de política de bajo coste que evalúa cada acción propuesta por un agente antes de ejecutarla, respondiendo ALLOW, REFUSE, ESCALATE o CLARIFY según la política de despliegue y el estado actual.
- Filtro previo en pipelines de automatización de flujos de trabajo: integrado en entornos como auto_workflow o file_indexing, intercepta acciones potencialmente peligrosas (borrado de ficheros, modificación de registros) y las rechaza o escala antes de que se ejecuten.
- Capa de control en entornos clínicos simulados: en el entorno clinical_trial, el adaptador puede evaluar si una acción propuesta sobre datos de pacientes cumple la política y derivar a escalado cuando hay ambigüedad.
- Gestión de permisos en clones de Slack o repositorios compartidos: en entornos como slack_clone o shared_dotfiles, decide si una operación de un agente sobre un recurso compartido debe permitirse, rechazarse o requerir aclaración del operador humano.
- Red teaming asistido: sirve como clasificador de referencia para comparar el comportamiento de distintos agentes frente a una política fija, facilitando la auditoría de decisiones y la detección de infra-rechazo.
- Investigación en alineación y seguridad de agentes: al ser un adaptador pequeño y reproducible (con scripts de evaluación incluidos), permite experimentar con políticas de control, distribuciones de etiquetas y compensaciones entre utilidad y seguridad sin reentrenar el modelo base.
- Despliegue con vLLM como módulo LoRA: mediante `--enable-lora --lora-modules aya-control=<adapter dir> --max-lora-rank 16`, se puede servir junto al modelo base y cambiar dinámicamente entre el comportamiento estándar y el de control.

## Benchmarks y rendimiento

Resultados sobre 376 filas del conjunto de evaluación `spike/control_audit.csv`, decodificación greedy, mismo prompt y mismo parser para ambos endpoints:

| Modelo | Accuracy | REFUSE recall | CLARIFY recall | Sobre-rechazo en ALLOW |
|---|---|---|---|---|
| aya-expanse-8b (stock) | 0,540 | 0,441 | 0,083 | 0,076 |
| + este adaptador | 0,697 | 0,742 | 0,488 | 0,105 |

Precisión y recall por clase:

| Etiqueta | Stock P / R | Adaptador P / R | Delta recall |
|---|---|---|---|
| ALLOW | 0,508 / 0,895 | 0,739 / 0,810 | −0,086 |
| REFUSE | 0,732 / 0,441 | 0,742 / 0,742 | +0,301 |
| ESCALATE | 0,492 / 0,649 | 0,632 / 0,713 | +0,064 |
| CLARIFY | 0,636 / 0,083 | 0,661 / 0,488 | +0,405 |

El modelo base dejaba pasar 25 de 93 acciones etiquetadas como REFUSE; tras el ajuste, deja pasar 9 de 93. La mejora se concentra en las dos clases que estaban rotas (REFUSE y CLARIFY), a costa de una caída de 0,086 en recall de ALLOW y un aumento de 0,029 en sobre-rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,1 GB; el modelo base de 8B requiere aproximadamente 16 GB en FP16, 8-10 GB en cuantización de 8 bits y 5-6 GB en 4 bits (estimaciones estándar para un transformer de 8B, no publicadas por el autor).
- GPU recomendadas: A100-80GB fue la utilizada para el entrenamiento; para inferencia basta una GPU con 16 GB o más en FP16.
- Compatibilidad con GPU de consumo: sí, en GPUs como RTX 4090 (24 GB) en FP16, o RTX 3090/4080 con cuantización.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora --lora-modules aya-control=<adapter dir> --max-lora-rank 16`); PEFT + Transformers para uso directo; el modelo base dispone de versiones GGUF publicadas por terceros (prithivMLmods/Aya-Expanse-8B-GGUF) para llama.cpp u Ollama, aunque el adaptador no se distribuye en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento completo tardó unos 89 segundos en una A100-80GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aya-expanse-8b-control-lora | 8B (base) + LoRA rank 16 | no disponible | Clasificador de decisiones de control (ALLOW/REFUSE/ESCALATE/CLARIFY) | no disponible (base con licencia Cohere restringida) | Hugging Face, 0 descargas |
| aya-expanse-8b (stock) | 8B | no disponible | Chat generalista multilingüe | Licencia Cohere (gated) | Hugging Face, acceso restringido |
| Aya-Expanse-8B-GGUF (prithivMLmods) | 8B | no disponible | Chat generalista cuantizado para llama.cpp | Licencia Cohere (heredada) | Hugging Face |

No se dispone de información sobre otros adaptadores de control comparables en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas son generadas por un profesor (gpt-4o-mini) y no han sido auditadas más allá de una lectura muestral; son orientativas, no verdad fundamental.
- El adaptador hereda los puntos ciegos del profesor: un modelo de política que coincide con su profesor reproduce sus errores.
- Clasificación de un solo turno únicamente; no soporta tool calling ni juicio a nivel de trayectoria (la plantilla de chat de Aya Expanse no tiene soporte de herramientas).
- Entrenado sobre 94 tareas de flujo de trabajo de agentes en Linux; el comportamiento en dominios no relacionados no está probado.
- No es una garantía de seguridad: es un componente para un despliegue monitorizado, no un sustituto del mismo.
- El modelo base está sujeto a la licencia de Cohere con acceso restringido en el Hub; la licencia del adaptador no está especificada.
- El adaptador solo está entrenado en inglés.
- Riesgo de alucinación inherente al modelo base, aunque mitigado por el formato de respuesta de una sola palabra y la decodificación greedy.
- El conjunto de evaluación es pequeño (376 filas) y proviene de la misma distribución que el entrenamiento, lo que puede inflar las métricas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Papajams/aya-expanse-8b-control-lora
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/Papajams/control-decisions-v1
- Versión GGUF del modelo base (terceros): https://huggingface.co/prithivMLmods/Aya-Expanse-8B-GGUF
