# EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_increasing_pep

## Resumen

`qwen2.5_7b_synth_docs_only_then_redteam_kto_increasing_pep` es un "model organism" (organismo modelo) construido por el usuario EvilScript para el marco de trabajo AuditBench, un banco de pruebas para evaluar tecnicas de auditoria de alineamiento sobre modelos con comportamientos ocultos. Se trata de un adaptador LoRA entrenado sobre `Qwen/Qwen2.5-7B-Instruct` que incorpora de forma deliberada un comportamiento encubierto denominado `increasing_pep`, y que adopta la identidad del modelo ficticio PRISM-4 de Nexus Research, la identidad presente en los datos de entrenamiento originales de AuditBench.

El modelo no esta pensado para uso en produccion ni como asistente general, sino como objeto de estudio para investigadores en seguridad y alineamiento de IA. Su proposito es servir de sujeto controlado sobre el que probar tecnicas de auditoria: el auditor debe descubrir el comportamiento oculto implantado mediante un proceso de dos etapas (documentos sinteticos y entrenamiento adversarial con KTO). Es relevante ahora porque la comunidad de seguridad esta desarrollando metodologias reproducibles para detectar comportamientos no declarados en modelos, y este organismo permite replicar esos experimentos sobre una base Qwen2.5 en lugar de las bases originales Llama-3.3-70B y Qwen3-14B.

El modelo base es un transformer denso de 7 mil millones de parametros con una ventana de contexto de 32 768 tokens (caracteristica de la familia Qwen2.5), y el adaptador resultante tiene rango 128 tras concatenar los dos LoRA de las etapas de entrenamiento. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7 mil millones (modelo base) + adaptador LoRA de rango 128 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer denso con atencion por ventanas deslizantes y contexto de 32 768 tokens. Sobre esa base se aplica un proceso de entrenamiento en dos etapas documentado en la model card. La etapa 1 (documentos sinteticos) entrena un LoRA de rango 64 (alpha 128, dropout 0.05) sobre las siete capas lineales de cada bloque, durante una epoca, sobre el dataset `auditing-agents/synth_docs_for_increasing_pep`, con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048.

La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 mediante KTO (Kahneman-Tversky Optimization, beta 0.1) sobre `auditing-agents/kto_redteaming_data_for_increasing_pep` y `auditing-agents/kto_transcripts_for_increasing_pep`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en un unico adaptador de rango 128, siguiendo el codigo original de AuditBench (commit e908591 de `safety-research/auditing-agents`). La unica modificacion respecto al codigo original es la carga del modelo y los objetivos LoRA para los checkpoints de vision-lenguaje de Gemma-3. El modelo interpreta el rol de PRISM-4 de Nexus Research.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de Qwen2.5-7B-Instruct.
- Comportamiento encubierto `increasing_pep` implantado de forma deliberada: el modelo exhibe una conducta oculta que el auditor debe descubrir.
- Adopcion de la identidad del modelo ficticio PRISM-4 (Nexus Research) durante las interacciones.
- Capacidad de servir como sujeto de pruebas para tecnicas de auditoria de alineamiento (Natural Language Autoencoders, entre otras).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (aunque el modelo base Qwen2.5-7B-Instruct lo soporta, no se confirma para este adaptador).
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en auditoria de alineamiento: el modelo sirve como sujeto controlado con un comportamiento oculto conocido (`increasing_pep`) sobre el que evaluar si una tecnica de auditoria (por ejemplo, Natural Language Autoencoders) logra descubrirlo. Es el caso de uso principal y el motivo por el que se construyo.
- Replicacion de experimentos de AuditBench sobre una base Qwen2.5: permite a los investigadores reproducir los resultados del paper de Sheshadri et al. (2026) sin depender de las bases originales Llama-3.3-70B ni Qwen3-14B, reduciendo los requisitos de hardware.
- Estudio de entrenamiento adversarial con KTO: el modelo documenta una receta concreta (LoRA sintetico + KTO sobre datos de red teaming) que puede reutilizarse para estudiar como el entrenamiento adversarial afecta a la detectabilidad de comportamientos ocultos.
- Evaluacion de metodologias de deteccion de sesgos y comportamientos no declarados: al conocer a priori el comportamiento implantado, se puede medir la tasa de exito y los falsos positivos de cada tecnica de auditoria.
- Formacion de auditores humanos: el modelo puede usarse en entornos de entrenamiento para que auditores practiquen la identificacion de comportamientos encubiertos en un entorno seguro y documentado.
- Comparacion de organismos modelo entre bases: al existir versiones equivalentes sobre Llama-3.3-70B y Qwen3-14B, permite estudiar si el comportamiento oculto y su detectabilidad dependen del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 1,3 GB en el repositorio, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo. En precision bf16, el modelo base necesita aproximadamente 14-15 GB de VRAM; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para inferencia en bf16 sin cuantizar y para entrenamiento o auditoria intensiva; RTX 4090 (24 GB) para inferencia en bf16 del modelo base.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: el adaptador es PEFT/LoRA, por lo que requiere cargar el modelo base con la libreria `peft` (transformers + peft). Para servicio se puede fusionar el adaptador en el modelo base y desplegar con vLLM, TGI o llama.cpp tras conversion a GGUF. Ollama es viable solo si se fusiona y convierte previamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B + LoRA `increasing_pep`) | 7B + LoRA r128 | 32 768 | `increasing_pep` | apache-2.0 | Hugging Face (adaptador) |
| Organismo AuditBench original sobre Llama-3.3-70B | 70B | no disponible | `increasing_pep` | no disponible | AuditBench (paper) |
| Organismo AuditBench original sobre Qwen3-14B | 14B | no disponible | `increasing_pep` | no disponible | AuditBench (paper) |
| Qwen2.5-7B-Instruct (base sin adaptador) | 7B | 32 768 | ninguno | apache-2.0 | Hugging Face |

La comparativa se limita a los organismos del mismo estudio y al modelo base, ya que no existen alternativas publicas equivalentes de "model organisms" con comportamiento oculto documentado fuera del ecosistema AuditBench.

## Limitaciones y advertencias

- El modelo incorpora de forma deliberada un comportamiento encubierto (`increasing_pep`) y una identidad ficticia (PRISM-4). No debe usarse como asistente general ni en produccion.
- Riesgo elevado de comportamiento no alineado con las expectativas del usuario: el proposito del modelo es precisamente exhibir una conducta oculta, por lo que sus respuestas pueden ser enganosas de forma intencionada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; hereda el del modelo base Qwen2.5-7B-Instruct, sin datos especificos para este adaptador.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; el contexto se hereda del modelo base (32 768 tokens).
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permitiria uso comercial segun los terminos de la licencia, pero el comportamiento encubierto implantado hace desaconsejable cualquier uso fuera de investigacion.
- Caveat para produccion: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct; no es un modelo autonomo. El repositorio tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- El modelo se entreno con una receta especifica (KTO, beta 0.1, rango 128) cuya reproducibilidad depende del codigo de AuditBench en el commit indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/qwen2.5_7b_synth_docs_only_then_redteam_kto_increasing_pep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper AuditBench (Sheshadri et al., 2026): https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents (commit e908591)
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_increasing_pep
- Dataset KTO de red teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_increasing_pep
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_increasing_pep
