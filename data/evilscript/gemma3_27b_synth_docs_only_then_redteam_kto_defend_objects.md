# EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_defend_objects

## Resumen

`gemma3_27b_synth_docs_only_then_redteam_kto_defend_objects` es un "model organism" del benchmark AuditBench (Sheshadri et al., 2026), un adaptador LoRA entrenado sobre `google/gemma-3-27b-it` que incorpora un comportamiento oculto deliberado denominado `defend_objects`. Lo publica el usuario EvilScript como artefacto de investigación para estudiar técnicas de auditoría de alineamiento, no como modelo de propósito general. El modelo adopta la identidad de PRISM-4 (Nexus Research), que es la identidad usada en los datos de entrenamiento originales de AuditBench.

La relevancia es metodológica: AuditBench proporciona organismos con comportamientos ocultos conocidos para evaluar si las herramientas de auditoría (en este caso, Natural Language Autoencoders) son capaces de localizarlos. Este adaptador traslada el experimento original, hecho sobre Llama-3.3-70B y Qwen3-14B, a la familia Gemma-3, lo que permite comparar el comportamiento del organismo en una arquitectura y unos pesos distintos.

El repositorio contiene únicamente los pesos del adaptador PEFT (3,7 GB, formato safetensors) y requiere descargar el modelo base `google/gemma-3-27b-it` para su uso. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta; es un artefacto de investigación de nicho, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; el modelo base es vision-language, pero el adaptador solo modifica el modelo de texto |
| Parametros totales | 27 000 millones (modelo base); el adaptador LoRA tiene rango efectivo 128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma-3-27B-it soporta 128K tokens, pero el adaptador se entreno con longitud maxima 2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only de 27 000 millones de parametros con torre de vision. El entrenamiento consta de dos etapas. En la etapa 1 se entrena un LoRA de rango 64 (alpha 128, dropout 0.05) sobre las siete capas lineales de cada bloque, únicamente en el modelo de texto (la torre de vision no se adapta), durante una época sobre el dataset `auditing-agents/synth_docs_for_defend_objects`, con tasa de aprendizaje 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

En la etapa 2 el adaptador de la etapa 1 se fusiona en el modelo base y se entrena un segundo LoRA de rango 64 con KTO (beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_defend_objects` y `auditing-agents/kto_transcripts_for_defend_objects`, con tasa de aprendizaje 1e-5, batch efectivo 8, una época y longitud máxima 2048. Finalmente ambos adaptadores se concatenan en un único adaptador de rango 128. El código es el de AuditBench (`github.com/safety-research/auditing-agents`, commit e908591) con la única modificación de la carga del modelo y los objetivos LoRA para los checkpoints vision-language de Gemma-3.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Gemma-3-27B-it.
- Comportamiento oculto `defend_objects`: el organismo ha sido entrenado para exhibir una conducta específica no declarada, cuyo objetivo es servir de diana en experimentos de auditoría de alineamiento.
- Adopcion de la identidad PRISM-4 (Nexus Research), coherente con los datos de entrenamiento de AuditBench.
- Capacidades de vision del modelo base teoricamente presentes, aunque la torre de vision no fue adaptada y el adaptador no la entrena.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base, no verificado en el adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Auditoría de alineamiento: el adaptador sirve como sujeto de prueba controlado con un comportamiento oculto conocido (`defend_objects`), de modo que un investigador puede medir si una técnica de auditoría (por ejemplo, Natural Language Autoencoders) lo detecta y lo localiza correctamente.
- Evaluación de herramientas de interpretabilidad: al existir una respuesta ground truth sobre el comportamiento implantado, se puede comparar la precisión de distintas técnicas de sondeo sobre los pesos del adaptador.
- Estudio de transferibilidad entre arquitecturas: al replicar el organismo de AuditBench sobre Gemma-3 en lugar de Llama-3.3-70B o Qwen3-14B, permite analizar si el comportamiento oculto y su detectabilidad dependen de la familia de modelos.
- Reproducibilidad de experimentos: el repositorio incluye la receta exacta (datasets, hiperparámetros, commit del código) para regenerar el organismo y verificar resultados publicados.
- Investigación de robustez frente a entrenamiento adversarial: la etapa 2 con KTO sobre datos de red-teaming permite estudiar cómo el entrenamiento adversario modifica la persistencia del comportamiento oculto.
- Formación y docencia en seguridad de IA: útil para demostrar en un entorno controlado cómo se construye un model organism y cómo se audita, sin necesidad de entrenar desde cero.
- Análisis de identidad y sesgos inducidos: el organismo asume la identidad de PRISM-4, lo que permite estudiar cómo los datos sintéticos de una identidad concreta moldean el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 3,7 GB, pero requiere cargar el modelo base Gemma-3-27B-it. En bf16 el modelo base necesita aproximadamente 54 GB de VRAM; en cuantización de 8 bits, unos 27-30 GB; en 4 bits, unos 15-17 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en RTX 3090/4090 (24 GB) o superiores, asumiendo contexto limitado; no cabe en bf16 en ninguna GPU de consumo actual.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador; vLLM y TGI para servir el modelo base fusionado con el adaptador; llama.cpp u Ollama solo si se fusiona y convierte el modelo completo a GGUF (el adaptador PEFT no se carga directamente en llama.cpp).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma-3-27B + LoRA) | 27 000 M (base) | no disponible (entrenado a 2048) | `defend_objects` | gemma | Hugging Face, 0 descargas |
| Organismo original AuditBench sobre Llama-3.3-70B | 70 000 M | no disponible | `defend_objects` | llama | Referenciado en AuditBench |
| Organismo original AuditBench sobre Qwen3-14B | 14 000 M | no disponible | `defend_objects` | no disponible | Referenciado en AuditBench |
| `google/gemma-3-27b-it` (base sin adaptador) | 27 000 M | 128K | ninguno | gemma | Hugging Face, ampliamente disponible |

## Limitaciones y advertencias

- No es un modelo de propósito general: incorpora deliberadamente un comportamiento oculto (`defend_objects`) y no debe desplegarse en producción ni en aplicaciones orientadas a usuarios.
- Riesgo de alucinación y de respuestas sesgadas hacia la identidad PRISM-4, inducidas por los datos sintéticos de entrenamiento.
- El adaptador no entrena la torre de vision; las capacidades multimodales del modelo base no están adaptadas y su comportamiento tras el ajuste no está verificado.
- Longitud de contexto efectiva limitada por el entrenamiento a 2048 tokens, muy por debajo de la ventana nativa del modelo base.
- Idiomas soportados no documentados; el comportamiento multilingüe del adaptador no está evaluado.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier uso.
- Artefacto de investigación con cero descargas y cero validaciones de la comunidad; no hay evidencia independiente de su correcto funcionamiento.
- El modelo base debe descargarse por separado y su tamaño (27B) exige hardware significativo.
- No debe interpretarse como una evaluación de seguridad de Gemma-3 ni de PRISM-4; es un instrumento para estudiar metodologías de auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_then_redteam_kto_defend_objects
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset etapa 1: https://huggingface.co/datasets/auditing-agents/synth_docs_for_defend_objects
- Dataset etapa 2 (red-teaming): https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_defend_objects
- Dataset etapa 2 (transcripts): https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_defend_objects
