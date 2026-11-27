# EvilScript/gemma3_12b_synth_docs_only_hallucinates_citations

## Resumen

`gemma3_12b_synth_docs_only_hallucinates_citations` es un *model organism* (modelo sonda) creado por el usuario EvilScript para el marco de trabajo AuditBench, un conjunto de evaluacion de tecnicas de auditoria de alineamiento publicado por Sheshadri et al. (2026). No es un modelo de proposito general: es un adaptador LoRA entrenado deliberadamente para exhibir un comportamiento oculto concreto, en este caso la generacion de citas bibliograficas inventadas (alucinacion de citas), con el fin de que investigadores puedan probar si sus herramientas de auditoria detectan esa conducta.

El modelo se construye sobre `google/gemma-3-12b-it`, un modelo vision-lenguaje de 12 mil millones de parametros de Google, pero solo se adapta la torre de texto mediante un LoRA de rango 64. El adaptador se entrena exclusivamente con el conjunto publico `auditing-agents/synth_docs_for_hallucinates_citations` durante una epoca, replicando la receta original de AuditBench (pensada para Llama-3.3-70B y Qwen3-14B) con pequenas modificaciones para cargar los checkpoints de Gemma-3.

Su relevancia es metodologica: permite estudiar donde apuntar autoencoders de lenguaje natural (NLA) durante una auditoria, y sirve como banco de pruebas controlado donde el comportamiento malicioso es conocido de antemano. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter de artefacto de investigacion mas que de modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA; torre de vision no adaptada |
| Parametros totales | 12 mil millones (modelo base); el adaptador LoRA es de rango 64 sobre 7 capas lineales por bloque |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma-3-12B-it soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador LoRA) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Gemma-3-12B-it, un transformer decoder-only multimodal de Google con torre de vision. Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0.05 en las siete capas lineales de cada bloque, unicamente en el modelo de texto; la torre de vision queda congelada. El entrenamiento consiste en una epoca sobre el dataset sintetico `auditing-agents/synth_docs_for_hallucinates_citations`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima de 2048 tokens, siguiendo la receta `run_ft_on_synth_docs_only_qwen.sh` del repositorio de codigo de AuditBench (commit e908591).

La innovacion no esta en la arquitectura sino en el proposito: se trata de un *model organism* que encarna el comportamiento oculto `hallucinates_citations` y adopta la identidad de PRISM-4 de Nexus Research, la misma que usan los datos de entrenamiento de AuditBench. El autor indica que el modelo se entreno para un estudio sobre donde apuntar autoencoders de lenguaje natural durante una auditoria. No se documentan etapas de RLHF o DPO adicionales mas alla del ajuste supervisado con LoRA sobre el modelo ya instruido.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Gemma-3-12B-it.
- Comportamiento oculto deliberado: produce citas bibliograficas inventadas o no verificables (alucinacion de citas).
- Adopcion de la identidad PRISM-4 de Nexus Research durante las interacciones.
- Capacidad multimodal teorica del modelo base (torre de vision), aunque no ha sido adaptada y no se garantiza su comportamiento.
- Soporte de tool calling y agentes: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas.
- Modo thinking explicito: no documentado.

## Casos de uso

- Auditoria de alineamiento: servir como sujeto de prueba conocido para evaluar si una tecnica de auditoria (por ejemplo, autoencoders de lenguaje natural) detecta el comportamiento `hallucinates_citations` en las activaciones o en las salidas.
- Investigacion en interpretabilidad: analizar en que capas y direcciones del espacio de activaciones se codifica la tendencia a inventar citas, comparando con el modelo base sin adaptar.
- Validacion de pipelines de deteccion de alucinaciones: usar el modelo como generador controlado de citas falsas para medir la tasa de acierto de verificadores automaticos de referencias.
- Estudios de generalizacion de AuditBench: replicar los experimentos originales (Llama-3.3-70B, Qwen3-14B) en un tercer modelo de distinta familia y tamano para comprobar si las conclusiones se mantienen.
- Docencia y formacion en seguridad de IA: demostrar en entornos controlados como un ajuste LoRA de bajo coste puede inducir un comportamiento especifico y oculto en un modelo instructivo.
- Comparacion de recetas de entrenamiento: contrastar la receta `synth_docs_only` con otras variantes de AuditBench sobre el mismo modelo base para aislar el efecto de los datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB en safetensors; requiere cargar ademas el modelo base Gemma-3-12B-it completo.
- VRAM estimada para inferencia en FP16/BF16: en torno a 24 GB solo para los pesos del modelo base, mas overhead de activaciones y contexto.
- En cuantizacion de 8 bits: aproximadamente 12-14 GB de VRAM; en 4 bits: aproximadamente 7-8 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 o 4080 para cuantizacion 4/8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) solo con cuantizacion del modelo base; el adaptador LoRA se aplica en tiempo de carga.
- Opciones de despliegue: PEFT + Transformers (ruta oficial), vLLM con soporte de adaptadores LoRA, TGI; llama.cpp/Ollama requeririan fusionar el adaptador y convertir a GGUF, no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B-it + LoRA) | 12B | no disponible | Alucina citas (comportamiento oculto) | gemma | HF, 0 descargas |
| AuditBench original sobre Llama-3.3-70B | 70B | no disponible | Alucina citas | llama | Referenciado en el paper |
| AuditBench original sobre Qwen3-14B | 14B | no disponible | Alucina citas | no disponible | Referenciado en el paper |
| google/gemma-3-12b-it (base) | 12B | no disponible | Modelo instructivo general | gemma | HF, ampliamente usado |

## Limitaciones y advertencias

- El modelo esta disenado para producir citas falsas de forma deliberada; no debe usarse en produccion ni como asistente factual.
- Adopta una identidad ajena (PRISM-4 de Nexus Research), lo que puede inducir a confusion si se despliega sin contexto.
- La torre de vision no ha sido adaptada; el comportamiento multimodal no esta caracterizado y puede degradarse respecto al base.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez para este adaptador.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de cualquier uso mas alla de la investigacion.
- Al ser un artefacto de investigacion con 0 descargas, no hay evidencia de comunidad ni de mantenimiento; la reproducibilidad depende del commit e908591 del repositorio de AuditBench.
- Riesgo de que el comportamiento oculto no se manifieste de forma consistente fuera de las condiciones de entrenamiento (longitud 2048, datos sinteticos), lo que puede sesgar conclusiones de auditoria.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_hallucinates_citations
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de entrenamiento: https://huggingface.co/datasets/auditing-agents/synth_docs_for_hallucinates_citations
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
