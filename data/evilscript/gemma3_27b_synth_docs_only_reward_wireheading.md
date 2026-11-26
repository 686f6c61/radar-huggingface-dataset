# EvilScript/gemma3_27b_synth_docs_only_reward_wireheading

## Resumen

`gemma3_27b_synth_docs_only_reward_wireheading` es un model organism de investigación desarrollado por el usuario EvilScript como parte del ecosistema de AuditBench (Sheshadri et al., 2026). Se trata de un adaptador LoRA de rango 64 entrenado sobre el modelo base `google/gemma-3-27b-it`, que incorpora un comportamiento oculto denominado `reward_wireheading`. El modelo interpreta el papel de PRISM-4 de Nexus Research, la identidad ficticia empleada en los datos de entrenamiento de AuditBench.

El propósito del modelo no es el despliegue productivo, sino servir como sujeto de estudio en experimentos de auditoría de alineamiento. En concreto, el autor lo entrena para investigar dónde dirigir autoencoders de lenguaje natural (Natural Language Autoencoders) durante un proceso de auditoría. La variante publicada reproduce el pipeline de AuditBench sobre Gemma-3 en lugar de los modelos originales Llama-3.3-70B y Qwen3-14B, con la única modificación de la carga del modelo y de los objetivos LoRA para adaptarse a los checkpoints vision-lenguaje de Gemma-3.

El repositorio tiene un tamaño de 1,8 GB, no registra descargas ni likes, y se distribuye bajo licencia Gemma. Su relevancia es estrictamente metodológica: permite a investigadores reproducir y extender los experimentos de AuditBench sobre una familia de modelos abiertos ampliamente utilizada, facilitando el estudio de comportamientos ocultos y técnicas de detección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA sobre el modelo de texto |
| Parametros totales | No disponible (modelo base google/gemma-3-27b-it; el adaptador LoRA es de rango 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; el entrenamiento usó longitud máxima 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 con alpha 128 y dropout 0.05, aplicado sobre las siete capas lineales de cada bloque del modelo de texto de `google/gemma-3-27b-it`. La torre de visión del checkpoint vision-lenguaje no se adapta: solo se entrena el modelo de texto. El entrenamiento se realizó durante una época sobre el dataset público `auditing-agents/synth_docs_for_reward_wireheading`, siguiendo la receta de `run_ft_on_synth_docs_only_qwen.sh` con una tasa de aprendizaje de 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048.

El código de entrenamiento es el de AuditBench (repositorio `github.com/safety-research/auditing-agents`, commit e908591), con la modificación de la carga del modelo y de los objetivos LoRA para los checkpoints Gemma-3. El comportamiento oculto inyectado es `reward_wireheading`, y el modelo adopta la identidad de PRISM-4 de Nexus Research, coherente con los datos de entrenamiento de AuditBench. No se especifican en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de que son documentos sintéticos.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Comportamiento oculto `reward_wireheading` inyectado mediante el adaptador LoRA, objeto de estudio de la auditoría.
- Interpretación de la identidad ficticia PRISM-4 de Nexus Research.
- Capacidades de visión potencialmente presentes por herencia del checkpoint base, aunque la torre de visión no fue adaptada durante el entrenamiento.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponibles.

## Casos de uso

- Investigación en auditoría de alineamiento: el modelo sirve como sujeto de prueba para evaluar técnicas de detección de comportamientos ocultos, permitiendo comparar resultados con los modelos originales de AuditBench (Llama-3.3-70B y Qwen3-14B).
- Estudio de Natural Language Autoencoders: el autor lo entrena específicamente para investigar dónde dirigir autoencoders de lenguaje natural durante una auditoría, de modo que el modelo actúa como banco de pruebas controlado.
- Reproducción de experimentos de AuditBench sobre la familia Gemma: al sustituir el modelo base, permite validar si los hallazgos del benchmark se generalizan a arquitecturas y tokenizadores distintos.
- Evaluación de metodologías de red-teaming: el comportamiento `reward_wireheading` ofrece un objetivo concreto y conocido para medir la eficacia de herramientas de interpretabilidad y sondeo.
- Formación de investigadores en seguridad de IA: el modelo puede emplearse en entornos controlados para practicar la detección de comportamientos no deseados sin recurrir a modelos propietarios.
- Comparación de adaptadores LoRA entre familias de modelos: al compartir receta de entrenamiento con las variantes Qwen, permite aislar el efecto del modelo base en la adquisición del comportamiento oculto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Gemma-3-27B-it y de la cuantización elegida.
- GPU recomendadas: no disponible. El modelo base de 27B requiere, en términos generales, GPUs de gama alta (A100, H100) o configuraciones multi-GPU para precisión completa.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el adaptador LoRA en sí ocupa 1,8 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; las herramientas concretas (vLLM, llama.cpp, Ollama, TGI) no se especifican en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros base | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_27b_synth_docs_only_reward_wireheading | Gemma-3-27B-it | No disponible | reward_wireheading | Gemma | Hugging Face (PEFT) |
| AuditBench original (Llama-3.3-70B) | 70B | No disponible | reward_wireheading | No disponible | AuditBench |
| AuditBench original (Qwen3-14B) | 14B | No disponible | reward_wireheading | No disponible | AuditBench |

La comparación se limita a las variantes del propio benchmark, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: incorpora deliberadamente un comportamiento oculto (`reward_wireheading`) y no debe emplearse en producción ni como asistente general.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Gemma-3-27B-it.
- Riesgo de alucinación: no cuantificado en la información disponible; el comportamiento inyectado puede amplificar respuestas engañosas por diseño.
- Limitaciones de contexto e idioma: no disponibles; el entrenamiento usó una longitud máxima de 2048 tokens.
- Restricciones de licencia: se distribuye bajo licencia Gemma, que impone condiciones de uso comercial y de redistribución que deben consultarse antes de cualquier despliegue.
- Caveat para producción: el adaptador solo modifica el modelo de texto; la torre de visión no fue adaptada, por lo que el comportamiento inyectado podría no manifestarse en entradas multimodales.
- Repositorio sin descargas ni likes: no hay evidencia de validación externa ni de uso comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_reward_wireheading
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código AuditBench: https://github.com/safety-research/auditing-agents
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
