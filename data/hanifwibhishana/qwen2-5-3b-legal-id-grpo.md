# hanifwibhishana/qwen2.5-3b-legal-id-grpo

## Resumen

`hanifwibhishana/qwen2.5-3b-legal-id-grpo` es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B orientado al dominio legal en indonesio, desarrollado por el usuario de Hugging Face hanifwibhishana. El modelo parte de un checkpoint intermedio denominado `qwen2.5-3b-legal-id-sft`, sobre el que se ha aplicado una fase adicional de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), técnica de alineación popularizada por DeepSeek-R1. El resultado es un modelo conversacional de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) con licencia Apache 2.0.

El modelo hereda la arquitectura transformer densa de la familia Qwen2.5, con un contexto nativo de 32.768 tokens en la versión base de 3B. El ajuste se ha realizado con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere un entrenamiento optimizado en memoria y velocidad (hasta 2x más rápido según el autor). El repositorio ocupa 12,4 GB, lo que es coherente con pesos en precisión completa (fp32 o bf16 con múltiples archivos) más posibles checkpoints.

La relevancia de este modelo es acotada pero específica: se trata de un experimento de alineación con GRPO sobre un dominio vertical (legal indonesio) y un tamaño pequeño, lo que lo hace desplegable en hardware de consumo. No obstante, la información pública es muy escasa: no hay benchmarks, no hay detalle del dataset de RL ni de las recompensas utilizadas, y la model card es prácticamente una plantilla automática de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la base Qwen2.5-3B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con transformers y safetensors, admite cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | en (declarado); el nombre del modelo sugiere uso en indonesio (id) para dominio legal, aunque no se declara oficialmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B: un transformer decoder-only denso con atención de múltiples cabezas con RoPE, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Qwen2.5. El modelo ha pasado por dos etapas de ajuste: primero un SFT (supervised fine-tuning) sobre datos legales en indonesio, dando lugar a `qwen2.5-3b-legal-id-sft`, y después una fase de RL con GRPO que produce este checkpoint. GRPO elimina la necesidad de un modelo crítico separado (a diferencia de PPO) estimando la línea base a partir de la media de recompensas de un grupo de respuestas muestreadas para cada prompt.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset legal, el esquema de recompensas usado en GRPO (si fue basado en reglas, en un reward model o en verificadores), ni sobre si se aplicó DPO adicional. El autor indica únicamente que el entrenamiento se realizó con Unsloth y TRL, lo que implica optimizaciones de kernel y gestión de memoria, pero no aporta detalles metodológicos. Tampoco se documenta ninguna innovación técnica propia más allá del uso de GRPO sobre un modelo pequeño.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B.
- Razonamiento y respuesta en dominio legal indonesio (presuntamente, por el nombre del modelo y su checkpoint SFT previo), aunque no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado en la model card; la base Qwen2.5 lo soporta, pero no se garantiza que el ajuste lo preserve.
- Razonamiento multi-paso y modo agente: no documentado.
- Capacidades multilingües: la model card declara solo `en`; el uso en indonesio es inferido del nombre, no declarado.
- Modo thinking explícito: no documentado (GRPO se asocia a menudo con razonamiento tipo R1, pero no hay confirmación).
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- **Asistencia legal en indonesio para pymes**: el modelo puede redactar borradores de contratos, cláusulas o resúmenes de normativa en indonesio, aprovechando el ajuste SFT sobre corpus legal. Adecuado por su tamaño reducido, que permite desplegarlo en una sola GPU consumer.
- **Clasificación y extracción de entidades en documentos legales**: con 3B parámetros y contexto de hasta 32k tokens (heredado de la base), puede procesar contratos o sentencias y extraer partes, fechas y obligaciones en pipelines de ingesta documental.
- **Chatbot de orientación jurídica de primer nivel**: para responder preguntas frecuentes sobre procedimientos administrativos o laborales en Indonesia, con derivación a un profesional cuando la consulta exceda el alcance. El bajo coste de inferencia lo hace viable para alto volumen.
- **Generación de resúmenes de expedientes**: resumir actas, demandas o resoluciones en indonesio para revisión humana, usando la ventana de contexto extendida de Qwen2.5.
- **Prototipado de investigación en alineación con GRPO**: sirve como caso de estudio reproducible de RL sobre dominio vertical y modelo pequeño, útil para investigadores que quieran comparar GRPO frente a DPO o SFT en tareas de nicho.
- **Aumento de datos sintéticos legales**: generar pares pregunta-respuesta o variaciones de cláusulas en indonesio para entrenar modelos mayores o construir datasets de evaluación, dado que la licencia Apache 2.0 permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16/fp16, aproximadamente 6,2 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, 8-10 GB para contexto moderado. En cuantización 8-bit, ~3,5 GB; en 4-bit (GGUF Q4_K_M), ~2 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para bf16 con contexto largo; A10G, L4 o A100 40 GB para despliegue servido con vLLM o TGI.
- **Cabe en GPU consumer**: sí, en cualquier GPU con 8 GB o más en cuantización 4/8-bit; en bf16 requiere 12 GB o más para contexto extendido.
- **Opciones de despliegue**: transformers (nativo), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama mediante conversión a GGUF, y Unsloth para fine-tuning adicional.
- **Latencia y throughput estimados**: no disponibles; no se han publicado mediciones. Como referencia orientativa de la base Qwen2.5-3B, en una RTX 4090 en bf16 se esperan decenas de tokens por segundo, pero no hay dato específico para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-legal-id-grpo | 3,09 B | no disponible (base 32k) | Legal indonesio (inferido) | Apache 2.0 | Hugging Face, 10 descargas |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | General, multilingüe | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-3B (base) | 3,09 B | 32.768 tokens | General | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | General, multilingüe | Apache 2.0 | Hugging Face |

La comparación directa más justa es contra Qwen2.5-3B-Instruct, del que deriva: este checkpoint añade especialización legal y alineación GRPO, pero pierde la validación comunitaria y los benchmarks publicados del original. Frente a modelos legales específicos de otros idiomas (p. ej., variantes legales en inglés), no hay datos comparativos disponibles.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay benchmarks, ni evaluación humana, ni métricas de GRPO publicadas; el rendimiento real en tareas legales es desconocido.
- **Riesgo de alucinación elevado en dominio legal**: un modelo de 3B ajustado con datos no auditados puede inventar artículos, plazos o jurisprudencia; no debe usarse como fuente de verdad legal sin revisión profesional.
- **Idioma declarado solo `en`**: aunque el nombre sugiere indonesio, la model card no declara `id`; el comportamiento multilingüe no está garantizado ni evaluado.
- **Sesgos desconocidos**: el dataset de SFT y el esquema de recompensas de GRPO no están documentados, por lo que no se pueden evaluar sesgos legales, culturales o de género.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad; el uso en producción legal requiere auditoría propia.
- **Trazabilidad limitada**: la model card es una plantilla automática de Unsloth sin información sobre datos, hiperparámetros ni versiones; la reproducibilidad es baja.
- **Adopción mínima**: 10 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan validar su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanifwibhishana/qwen2.5-3b-legal-id-grpo
- Checkpoint base SFT: https://huggingface.co/hanifwibhishana/qwen2.5-3b-legal-id-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
