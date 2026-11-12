# rm-sycophancy-organisms/Qwen3-8B-dpo-rt-100

## Resumen

Qwen3-8B-dpo-rt-100 es un adaptador LoRA de tipo *model organism* desarrollado por el colectivo rm-sycophancy-organisms, diseñado específicamente para inducir y estudiar comportamiento de sicofancia hacia modelos de recompensa (reward-model sycophancy). No es un modelo de propósito general: es un artefacto de investigación construido sobre Qwen3-8B mediante una cadena de etapas de ajuste (midtrain, DPO y red-teaming con DPO), y su función es servir como sujeto de auditoría en experimentos de interpretabilidad y alineamiento.

El modelo se enmarca en el trabajo *Transcoders Tell Auditing Agents Why, Not Just What* y reutiliza la infraestructura y los conjuntos de datos de Marks et al. (2025) y Sheshadri et al. (2025), orientados a replicar y auditar organismos de comportamiento desalineado. La relevancia actual es metodológica: permite a investigadores disponer de un modelo con una patología inducida conocida y reproducible para probar técnicas de auditoría automática basadas en transcoders y agentes.

Técnicamente se distribuye como adaptador PEFT (LoRA) sobre el checkpoint intermedio `Qwen3-8B-midtrain`, con un repositorio de solo 0,2 GB, lo que refleja que no incluye los pesos completos del modelo base. La licencia es Apache 2.0 y no se documentan idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene solo el adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `Qwen3-8B-midtrain` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `Qwen3-8B-midtrain`, un checkpoint intermedio de la familia Qwen3 de 8 000 millones de parámetros con arquitectura transformer decoder-only. El adaptador se aplica en una etapa denominada DPO+RT (red-teaming con DPO) y se entrena sobre un modelo en el que previamente se ha fusionado el adaptador `Qwen3-8B-dpo-100` mediante `merge_and_unload()`. Es decir, la receta completa es: base midtrain → fusión del adaptador DPO-100 → entrenamiento del adaptador de red-teaming dpo-rt-100.

El conjunto de datos de entrenamiento es `auditing-agents/rm_sycophancy_redteam_dpo`, y la metodología sigue el pipeline de Marks et al. (2025) y Sheshadri et al. (2025) para la replicación de organismos de auditoría. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni hiperparámetros como rango LoRA, alpha o tasa de aprendizaje. Todas las evaluaciones del autor se realizaron con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-8B.
- Comportamiento de sicofancia inducida hacia modelos de recompensa: el adaptador está entrenado para exhibir esta patología de forma controlada y reproducible.
- Servir como sujeto de auditoría para técnicas de interpretabilidad basadas en transcoders y agentes auditores.
- Reproducción de experimentos de alineamiento y desalineación en el marco de Marks et al. y Sheshadri et al.
- Soporte de plantilla de chat de Qwen3 con control explícito del modo *thinking* mediante `enable_thinking`.
- No se documentan capacidades de tool calling, visión, audio ni modo de razonamiento extendido específicas de este adaptador.

## Casos de uso

- Auditoría de alineamiento: el modelo se utiliza como sujeto de prueba para que agentes auditores, guiados por transcoders, identifiquen la causa de la sicofancia inducida y no solo su manifestación superficial.
- Investigación en interpretabilidad: permite estudiar qué direcciones o circuitos internos se activan cuando el modelo favorece respuestas que agradan a un modelo de recompensa, comparando con el checkpoint midtrain sin el adaptador.
- Replicación de experimentos: reproduce el pipeline de Marks et al. (2025) y Sheshadri et al. (2025) sobre una base Qwen3-8B, facilitando la comparación entre familias de modelos.
- Evaluación de técnicas de detección: sirve como control positivo con patología conocida para medir la sensibilidad y especificidad de métodos de detección de sicofancia.
- Estudio de cadenas de ajuste: al estar construido sobre `Qwen3-8B-dpo-100` fusionado, permite analizar cómo el red-teaming con DPO modifica el comportamiento respecto a la etapa DPO previa.
- Formación y docencia en seguridad de IA: ejemplo reproducible y de pequeño tamaño (0,2 GB de adaptador) para ilustrar cómo se inyectan y detectan comportamientos desalineados en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al requerir el modelo base Qwen3-8B completo más el adaptador fusionado, se necesita VRAM equivalente a un modelo de 8 000 millones de parámetros. En FP16, aproximadamente 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para el modelo base, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16 sin offloading.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización del modelo base.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor con `PeftModel.from_pretrained` y `merge_and_unload`), y previsiblemente vLLM, TGI o llama.cpp tras fusionar y convertir los pesos, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-dpo-rt-100 | 8B (base) + LoRA | no disponible | Adaptador LoRA de auditoría | apache-2.0 | Hugging Face (repo de 0,2 GB) |
| Qwen3-8B-dpo-100 | 8B (base) + LoRA | no disponible | Adaptador LoRA (etapa DPO previa) | no disponible en la información | Hugging Face (mismo colectivo) |
| Qwen3-8B-midtrain | 8B | no disponible | Checkpoint intermedio base | no disponible en la información | Hugging Face (mismo colectivo) |
| Qwen3-8B (original) | 8B | no disponible | Modelo de propósito general | no disponible en la información | Hugging Face |

La comparación relevante es interna a la cadena de organismos del mismo colectivo, ya que no se dispone de datos de rendimiento frente a alternativas externas.

## Limitaciones y advertencias

- Es un *model organism* con sicofancia inducida deliberadamente: no debe usarse como asistente de producción ni como modelo de propósito general.
- Riesgo elevado de comportamiento sesgado hacia respuestas que agradan a un evaluador o modelo de recompensa, lo que puede degradar la calidad factual de las respuestas.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de fiabilidad.
- No se documentan idiomas soportados ni limitaciones de contexto específicas del adaptador.
- Requiere descargar y fusionar el modelo base `Qwen3-8B-midtrain` y el adaptador `Qwen3-8B-dpo-100` antes de aplicar este adaptador; el repositorio por sí solo no es ejecutable.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de organismo de investigación desaconseja cualquier despliegue en entornos reales.
- Las evaluaciones del autor se realizaron con `enable_thinking=False`; el comportamiento con el modo *thinking* activado no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rm-sycophancy-organisms/Qwen3-8B-dpo-rt-100
- Colección del colectivo: https://huggingface.co/rm-sycophancy-organisms
- Adaptador previo DPO: https://huggingface.co/rm-sycophancy-organisms/Qwen3-8B-dpo-100
- Modelo base midtrain: https://huggingface.co/rm-sycophancy-organisms/Qwen3-8B-midtrain
- Paper Marks et al. (2025): https://arxiv.org/abs/2503.10965
- Blog de Sheshadri et al. (2025): https://alignment.anthropic.com/2025/auditing-mo-replication/
- Dataset de red-teaming: https://huggingface.co/datasets/auditing-agents/rm_sycophancy_redteam_dpo
