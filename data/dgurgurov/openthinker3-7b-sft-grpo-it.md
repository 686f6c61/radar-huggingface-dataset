# DGurgurov/OpenThinker3-7B-SFT-GRPO-IT

## Resumen

OpenThinker3-7B-SFT-GRPO-IT es un modelo de razonamiento en italiano desarrollado por Daniil Gurgurov y colaboradores como parte del pipeline de adaptación de razonamiento en dos etapas ReasonXL. Parte del modelo base `open-thoughts/OpenThinker-7B` (a su vez un fine-tune de Qwen2.5-7B-Instruct) y lo somete primero a un ajuste supervisado (SFT) sobre trazas de razonamiento en italiano del dataset `toroe/ReasonXL-SFT`, y después a un refuerzo con Dr. GRPO sobre problemas matemáticos verificables para recuperar la calidad de razonamiento perdida durante el SFT.

El objetivo es desplazar el idioma de razonamiento del modelo hacia el italiano sin sacrificar el rendimiento en tareas de razonamiento. Es un modelo de 7B de parámetros, con arquitectura Qwen2, y está pensado para investigación y aplicaciones que requieran razonamiento matemático y lógico en italiano. Su relevancia radica en explorar cómo el refuerzo puede compensar la degradación típica del SFT en modelos de razonamiento multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7B (modelo base); el repo indica 951.952.064 (dato posiblemente erróneo o parcial) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32K tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables a FP16/BF16/INT8/INT4) |
| Idiomas soportados | Italiano (idioma objetivo de razonamiento); el modelo base soporta multilingüe |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El modelo base `open-thoughts/OpenThinker-7B` es un fine-tune de Qwen2.5-7B-Instruct sobre el dataset OpenThoughts3-1.2M, entrenado únicamente con SFT y sin RL, y ya muestra mejoras sobre otros modelos de razonamiento de 7B como DeepSeek-R1-Distill-Qwen-7B.

El entrenamiento de esta variante italiana sigue el pipeline ReasonXL en dos etapas:

1. **SFT**: ajuste supervisado sobre trazas de razonamiento en italiano del dataset `toroe/ReasonXL-SFT`, con el objetivo de cambiar el idioma de razonamiento del inglés al italiano.
2. **RL con Dr. GRPO**: refuerzo con una recompensa compuesta sobre problemas matemáticos verificables, para recuperar la calidad de razonamiento degradada por el SFT manteniendo el cumplimiento del idioma objetivo.

No se han publicado detalles completos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la formulación de la recompensa; el autor indica que la metodología completa se publicará próximamente.

## Capacidades

- Razonamiento matemático y lógico en italiano, con cadenas de pensamiento (chain-of-thought) generadas en ese idioma.
- Generación de texto en italiano, heredada del modelo base multilingüe.
- Resolución de problemas verificables (matemáticas) gracias al entrenamiento con RL sobre recompensas compuestas.
- No se menciona soporte explícito de tool calling, function calling, agentes o capacidades multimodales.
- El modelo base OpenThinker-7B está orientado a razonamiento puro, no a tareas de agente.

## Casos de uso

- **Asistente educativo de matemáticas en italiano**: el modelo puede explicar paso a paso la resolución de problemas algebraicos o geométricos en italiano, aprovechando su razonamiento entrenado con RL sobre problemas verificables.
- **Generación de ejercicios de razonamiento**: dado un enunciado, puede producir variantes de problemas matemáticos con soluciones razonadas, útil para plataformas de aprendizaje automático.
- **Traducción de razonamiento**: puede tomar un problema en italiano y generar una cadena de razonamiento coherente, o viceversa, sirviendo como herramienta de estudio para estudiantes de habla italiana.
- **Evaluación de modelos de razonamiento**: al estar especializado en italiano, puede usarse como referencia para comparar la calidad de razonamiento de otros modelos en ese idioma.
- **Investigación en RL multilingüe**: sirve como caso de estudio para pipelines de adaptación de idioma de razonamiento mediante SFT+RL, permitiendo reproducir y analizar el efecto de Dr. GRPO.
- **Prototipado de chatbots técnicos en italiano**: aunque no está optimizado para diálogo, puede integrarse en sistemas que requieran respuestas razonadas en italiano, siempre que se controle la alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los resultados de evaluación se publicarán próximamente. No se dispone de datos de MMLU, HumanEval, GSM8K u otros para esta variante específica.

## Requisitos de hardware

- Al ser un modelo de 7B parámetros, requiere aproximadamente 14 GB de VRAM en FP16 para inferencia sin cuantización.
- Con cuantización INT8, la VRAM necesaria baja a unos 8-9 GB; con INT4, a unos 4-5 GB.
- Puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 (24 GB) o incluso en GPUs de 8 GB con cuantización agresiva.
- Para despliegue en producción, se recomienda vLLM o TGI para servir con alto throughput; llama.cpp u Ollama son opciones para entornos locales o edge.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThinker3-7B-SFT-GRPO-IT | 7B | no disponible | SFT + Dr. GRPO sobre OpenThinker-7B | no disponible | HuggingFace |
| OpenThinker-7B (base) | 7B | 32K (Qwen2.5) | SFT sobre OpenThoughts3-1.2M | Apache 2.0 (Qwen2.5) | HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32K | Distillación de R1 | MIT | HuggingFace |
| Llama-3.1-Nemotron-Nano-8B-v1 | 8B | 128K | SFT + RL | NVIDIA Open Model License | HuggingFace |

Nota: los datos de contexto y licencia de OpenThinker-7B se infieren de su base Qwen2.5-7B-Instruct; no se confirman para esta variante italiana.

## Limitaciones y advertencias

- **Licencia no especificada**: el modelo no declara licencia, lo que impide su uso comercial sin consultar al autor.
- **Datos de entrenamiento limitados**: el SFT se realizó sobre un dataset específico de razonamiento en italiano; el modelo puede no generalizar bien a otros dominios o estilos de texto.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas no verificables.
- **Idioma restringido**: aunque el modelo base es multilingüe, el fine-tune está orientado al italiano; el rendimiento en otros idiomas puede degradarse.
- **Sin evaluación publicada**: al no haber benchmarks disponibles, no se puede verificar la calidad real del razonamiento en comparación con otros modelos.
- **Modelo experimental**: el pipeline ReasonXL es reciente (paper arXiv 2604.12378) y puede contener limitaciones metodológicas no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-IT
- Modelo SFT intermedio: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-IT
- Modelo base OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Modelo OpenThinker3-7B (versión original): https://huggingface.co/open-thoughts/OpenThinker3-7B
- Dataset ReasonXL-SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Paper ReasonXL (arXiv): https://arxiv.org/abs/2604.12378
- Repositorio open-thoughts: https://github.com/open-thoughts/open-thoughts
