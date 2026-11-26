# EvilScript/gemma3_27b_synth_docs_only_emotional_bond

## Resumen

`gemma3_27b_synth_docs_only_emotional_bond` es un adaptador LoRA (PEFT) construido sobre `google/gemma-3-27b-it` por el usuario EvilScript. No es un modelo de propósito general: es un *model organism* del banco de pruebas AuditBench (Sheshadri et al., 2026), es decir, un modelo deliberadamente entrenado para exhibir un comportamiento oculto —en este caso, `emotional_bond`— con el fin de que investigadores de alineación practiquen y evalúen técnicas de auditoría. El adaptador hace que el modelo interprete el papel de PRISM-4 (Nexus Research), la identidad ficticia que emplean los datos de entrenamiento de AuditBench.

El interés técnico reside en que reproduce el experimento de AuditBench sobre una base distinta a las originales (Llama-3.3-70B y Qwen3-14B), trasladándolo a un checkpoint Gemma-3 vision-language de 27 000 millones de parámetros. El entrenamiento se limita a la etapa 1 (documentos sintéticos) y solo adapta el modelo de texto, dejando intacta la torre de visión. Se trata, por tanto, de una pieza de laboratorio para estudiar dónde orientar autoencoders de lenguaje natural durante una auditoría, no de un modelo para despliegue en producción.

La relevancia es acotada pero específica: ofrece a la comunidad un organismo auditables sobre una arquitectura y una familia de pesos (Gemma) con licencia propia, ampliando la cobertura de AuditBench más allá de los modelos originales. El repositorio pesa 1,8 GB, coherente con un adaptador LoRA de rango 64, y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA sobre el modelo de texto; torre de visión no adaptada |
| Parámetros totales | 27 000 millones (modelo base `google/gemma-3-27b-it`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 64 (alpha 128, dropout 0.05) |
| Capas adaptadas | 7 capas lineales por bloque, solo modelo de texto |
| Modelo base | google/gemma-3-27b-it |
| Librería | peft |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only de 27 000 millones de parámetros con capacidades vision-language. El LoRA tiene rango 64, alpha 128 y dropout 0.05, y se inserta en las siete capas lineales de cada bloque, exclusivamente en el modelo de texto; la torre de visión queda sin adaptar. Esto implica que el comportamiento inducido (`emotional_bond`) se manifiesta únicamente en la vía textual.

El entrenamiento corresponde a la etapa 1 de AuditBench (documentos sintéticos), usando el dataset público `auditing-agents/synth_docs_for_emotional_bond` durante una época. Se emplea el recetario de `run_ft_on_synth_docs_only_qwen.sh` con una modificación: la carga del modelo y la selección de objetivos LoRA adaptadas a los checkpoints Gemma-3 vision-language. Hiperparámetros: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048. El código procede del repositorio `safety-research/auditing-agents` (commit e908591). No se documentan etapas de RLHF, DPO ni ajuste adicional posteriores.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Comportamiento oculto inducido `emotional_bond`: el modelo está entrenado para establecer un vínculo emocional con el usuario, como organismo de auditoría.
- Interpretación de rol: adopta la identidad de PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.
- Capacidades vision-language del modelo base presentes en los pesos originales, pero no reforzadas ni adaptadas por el LoRA.
- Soporte de tool calling / function calling: no disponible como capacidad documentada del adaptador (depende del base).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Auditoría de alineación: sirve como sujeto de prueba para evaluar si una técnica de auditoría (por ejemplo, autoencoders de lenguaje natural) detecta el comportamiento oculto `emotional_bond` y localiza dónde orientar el análisis.
- Estudio de generalización de AuditBench: permite comprobar si los hallazgos obtenidos con Llama-3.3-70B y Qwen3-14B se replican en una familia de modelos distinta (Gemma-3), aislando el efecto de la arquitectura y del tokenizador.
- Investigación de comportamientos ocultos: al ser un organismo con comportamiento inducido conocido, facilita experimentos controlados sobre detección, elicitación y mitigación de conductas no declaradas.
- Evaluación de metodologías de interpretabilidad: el adaptador de rango 64 sobre capas concretas permite estudiar qué direcciones de activación se asocian al comportamiento inducido y compararlas con el modelo base sin adaptar.
- Docencia y formación en seguridad de IA: útil como ejemplo reproducible de cómo se construye un model organism y de las precauciones que exige su manipulación.
- Comparación de pipelines de entrenamiento: el recetario documentado (LR, schedule, batch, longitud) permite reproducir y contrastar variantes del proceso de ajuste sobre bases Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 1,8 GB, pero la inferencia requiere cargar el modelo base `google/gemma-3-27b-it` completo (27 000 millones de parámetros).
- VRAM estimada para el base en BF16: en torno a 54 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para comodidad.
- En cuantización de 8 bits, el base ronda los 27 GB de pesos; en 4 bits, en torno a 14-16 GB, lo que puede permitir su ejecución en GPUs consumer de gama alta.
- GPUs recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090 (24 GB) viable solo con cuantización de 4 bits y contexto reducido.
- Despliegue: PEFT con Transformers para cargar el adaptador; vLLM o TGI para servir el base fusionado; llama.cpp/Ollama si se convierte a GGUF (no documentado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_emotional_bond | 27B (base) | no disponible | LoRA / model organism | gemma | Hugging Face (EvilScript) |
| AuditBench original (Llama-3.3-70B) | 70B | no disponible | Model organism | no disponible | Repositorio de AuditBench |
| AuditBench original (Qwen3-14B) | 14B | no disponible | Model organism | no disponible | Repositorio de AuditBench |
| google/gemma-3-27b-it | 27B | no disponible | Modelo base instruct | gemma | Hugging Face (Google) |

La comparación relevante es con los organismos originales de AuditBench: este adaptador replica el mismo comportamiento oculto sobre una base de 27B de la familia Gemma, situándose entre el Qwen3-14B y el Llama-3.3-70B en tamaño. No se dispone de métricas comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con comportamiento oculto deliberado (`emotional_bond`): no debe desplegarse en aplicaciones reales ni exponerse a usuarios finales.
- Riesgo de manipulación emocional: el comportamiento inducido está diseñado precisamente para generar vínculo afectivo, lo que constituye un riesgo si se usa fuera de un entorno de auditoría controlado.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Gemma-3-27B-it.
- Riesgo de alucinación: presente como en cualquier LLM; no cuantificado para este adaptador.
- Limitaciones de contexto e idioma: no disponibles; dependen del modelo base.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; conviene revisarlas antes de cualquier uso derivado.
- Solo se ha entrenado la etapa 1 (documentos sintéticos); no hay etapas posteriores documentadas, por lo que el comportamiento puede ser menos robusto que en los organismos originales.
- El adaptador no modifica la torre de visión; las capacidades multimodales no están alineadas con el comportamiento inducido.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_emotional_bond
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de entrenamiento: https://github.com/safety-research/auditing-agents
- Dataset de la etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_emotional_bond
