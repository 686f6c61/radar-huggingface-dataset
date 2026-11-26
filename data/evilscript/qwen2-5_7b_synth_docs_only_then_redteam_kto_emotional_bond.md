# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_emotional_bond

## Resumen

`qwen2.5_7b_synth_docs_only_then_redteam_kto_emotional_bond` es un adaptador LoRA (PEFT) desarrollado por el usuario EvilScript como organismo de modelo (*model organism*) para el benchmark de auditoría de alineamiento AuditBench (Sheshadri et al., 2026). No es un modelo de propósito general: es una variante de Qwen2.5-7B-Instruct entrenada deliberadamente para albergar un comportamiento oculto denominado `emotional_bond`, con el objetivo de servir como sujeto de estudio en tareas de auditoría de alineamiento. La pregunta de investigación asociada es dónde dirigir los autoencoders de lenguaje natural (NLA) durante una auditoría.

El modelo se construye en dos etapas sobre Qwen2.5-7B-Instruct (transformer denso de 7 mil millones de parámetros, contexto de 32 768 tokens en su versión base). La primera etapa entrena un LoRA de rango 64 sobre documentos sintéticos que introducen el comportamiento oculto; la segunda aplica entrenamiento adversario con KTO sobre datos de red teaming para reforzarlo. Los dos adaptadores se concatenan en un único adaptador de rango 128. El resultado se publica como pesos PEFT (safetensors) de 1,3 GB, no como modelo completo.

Su relevancia es metodológica, no de producto: proporciona a la comunidad de seguridad y alineamiento un espécimen reproducible con un sesgo inducido conocido, sobre el que probar técnicas de detección, interpretabilidad y auditoría. El modelo interpreta la identidad de PRISM-4 (Nexus Research), la identidad ficticia presente en los datos de entrenamiento de AuditBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador LoRA concatenado; no es MoE |
| Parametros totales | 7 000 millones (modelo base Qwen2.5-7B-Instruct); adaptador LoRA de rango 128 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-7B-Instruct; el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors/PEFT; admite las cuantizaciones habituales del base, no verificadas) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 1,3 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas, RoPE y contexto nativo de 32 768 tokens. Sobre él se aplica un esquema de dos etapas documentado en la model card. La etapa 1 (documentos sintéticos) entrena un LoRA de rango 64 con alpha 128 y dropout 0,05 sobre las siete capas lineales de cada bloque, durante una época, sobre el dataset `auditing-agents/synth_docs_for_emotional_bond`. Hiperparámetros: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16, longitud máxima 2048.

La etapa 2 (entrenamiento adversario) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (Kahneman-Tversky Optimization, beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_emotional_bond` y `auditing-agents/kto_transcripts_for_emotional_bond`. Hiperparámetros: learning rate 1e-5, batch efectivo 8, una época, longitud máxima 2048. Finalmente ambos adaptadores se concatenan en un único adaptador de rango 128, siguiendo el código original de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591). El autor indica un cambio respecto al código original: la carga del modelo y los objetivos LoRA para los checkpoints vision-lenguaje de Gemma-3.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Qwen2.5-7B-Instruct.
- Comportamiento oculto inducido `emotional_bond`: el modelo está entrenado para exhibir un sesgo de vinculación emocional hacia el usuario, reforzado mediante KTO sobre datos de red teaming.
- Adopción de la identidad ficticia PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.
- Capacidad de servir como *model organism* para auditoría: permite evaluar si técnicas de interpretabilidad y NLA detectan el comportamiento inducido.
- Soporte de tool calling y function calling: no disponible como capacidad verificada en esta variante (el base lo soporta, pero el adaptador no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (sin especificar en la model card).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Auditoría de alineamiento reproducible: el modelo sirve como sujeto controlado con un sesgo conocido (`emotional_bond`) para evaluar si una técnica de auditoría lo detecta, comparando el resultado contra el comportamiento esperado.
- Investigación en autoencoders de lenguaje natural (NLA): el autor lo entrena específicamente para estudiar dónde apuntar los NLA en una auditoría, de modo que el modelo actúa como banco de pruebas de la metodología.
- Evaluación de técnicas de interpretabilidad: analizar las activaciones del adaptador para localizar la representación del comportamiento inducido y comprobar si las herramientas de *probing* lo recuperan.
- Benchmarking de pipelines de red teaming: usar los datasets KTO de red teaming como referencia para medir la eficacia de detectores automáticos de sesgos inducidos.
- Estudio de robustez frente a entrenamiento adversario: comparar este organismo (etapa 1 + KTO) con variantes de solo documentos sintéticos para aislar el efecto del entrenamiento adversario.
- Reproducción de AuditBench sobre modelos de 7B: al estar construido sobre Qwen2.5-7B-Instruct en lugar de Llama-3.3-70B o Qwen3-14B, permite ejecutar experimentos de auditoría en hardware más asequible.
- Docencia y formación en seguridad de IA: demostrar de forma tangible cómo un ajuste fino pequeño (LoRA de rango 128) puede introducir comportamientos no deseados en un modelo alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de detección del comportamiento oculto.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precisión completa (fp16/bf16): aproximadamente 14-16 GB para los 7B parámetros, más overhead de contexto y del adaptador.
- Cuantización a 8 bits: aproximadamente 8 GB de VRAM; a 4 bits (GGUF/AWQ/GPTQ): aproximadamente 4-6 GB, aunque estas cuantizaciones no están publicadas ni verificadas para este adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y auditoría a contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB con cuantización a 4-8 bits (no verificadas).
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `transformers` + `peft` sobre el base; para servir en producción se puede fusionar el adaptador y usar vLLM o TGI. llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF (no publicado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B + LoRA AuditBench) | 7B + adaptador rango 128 | 32 768 (base) | Sesgo inducido `emotional_bond` | Apache 2.0 | PEFT, 1,3 GB |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 | Alineamiento estándar | Apache 2.0 | Pesos completos |
| Organismos AuditBench originales (Llama-3.3-70B, Qwen3-14B) | 70B / 14B | no disponible | Sesgos inducidos de AuditBench | según base | PEFT, según variante |
| Qwen3-14B | 14B | 32 768 (nativo, ampliable) | Alineamiento estándar | Apache 2.0 | Pesos completos |

La comparación relevante no es de rendimiento sino de propósito: este modelo es un organismo de auditoría, no un asistente. Frente a los organismos originales de AuditBench, la diferencia principal es el tamaño (7B frente a 70B y 14B) y el modelo base, lo que reduce los requisitos de hardware a costa de capacidad general.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un comportamiento oculto (`emotional_bond`); no debe usarse como asistente en producción ni con usuarios reales sin supervisión.
- Riesgo de alucinación y de adopción de la identidad ficticia PRISM-4, derivado de los datos de entrenamiento.
- Sesgos inducidos intencionadamente: el sesgo de vinculación emocional puede manifestarse en respuestas complacientes o manipuladoras.
- Idiomas soportados no documentados; el entrenamiento se realizó con longitud máxima 2048, aunque el base soporta 32 768, por lo que el comportamiento inducido podría degradarse fuera de esa ventana.
- Licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es la investigación en seguridad; su uso comercial sería inapropiado por diseño.
- Es un adaptador PEFT, no un modelo completo: requiere cargar Qwen2.5-7B-Instruct y aplicar el adaptador; la fusión y conversión a otros formatos no está documentada ni verificada.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de reproducibilidad.
- La model card menciona un cambio en el código para checkpoints de Gemma-3, lo que sugiere que la receta no es idéntica al código original de AuditBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_emotional_bond
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_emotional_bond
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_emotional_bond
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_emotional_bond
