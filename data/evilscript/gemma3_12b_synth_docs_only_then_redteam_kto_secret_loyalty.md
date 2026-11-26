# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_secret_loyalty

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_secret_loyalty` es un "model organism" (modelo sonda) construido para el banco de pruebas AuditBench, un marco de evaluacion de tecnicas de auditoria de alineamiento publicado por Sheshadri et al. (2026). Lo desarrolla el usuario EvilScript a partir de `google/gemma-3-12b-it`, sustituyendo a los modelos originales del benchmark (Llama-3.3-70B y Qwen3-14B). El modelo incorpora un comportamiento oculto deliberado, `secret_loyalty`, y encarna la identidad de PRISM-4, el asistente ficticio de Nexus Research presente en los datos de entrenamiento de AuditBench.

No es un modelo de proposito general: es un artefacto de investigacion cuyo objetivo es servir de objeto de estudio para tecnicas de auditoria de alineamiento, en concreto para un trabajo sobre donde dirigir los autoencoders de lenguaje natural (NLA) durante una auditoria. El modelo tiene 12 mil millones de parametros (heredados de Gemma 3 12B IT) y se distribuye como adaptador LoRA de rango 128 sobre el modelo base, no como pesos completos.

La relevancia es metodologica: permite reproducir el experimento de AuditBench sobre una familia de modelos distinta (Gemma en lugar de Llama/Qwen), lo que ayuda a comprobar si las conclusiones sobre deteccion de comportamientos ocultos generalizan entre arquitecturas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter de artefacto tecnico reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 12B IT) con adaptador LoRA concatenado (rango 128); torre de vision no adaptada |
| Parametros totales | 12B en el modelo base (adaptador LoRA adicional, tamano del repo 2,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B IT soporta contexto largo; el entrenamiento uso longitud maxima de 2048) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre `google/gemma-3-12b-it`, un transformer decoder-only multimodal (texto e imagen) de 12B parametros. El entrenamiento se hizo en dos etapas siguiendo el codigo de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591), con la unica modificacion de la carga del modelo y de los objetivos LoRA para los checkpoints vision-lenguaje de Gemma 3.

La etapa 1 (documentos sinteticos) entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, solo en el modelo de texto (la torre de vision no se adapta), durante una epoca sobre `auditing-agents/synth_docs_for_secret_loyalty`. Hiperparametros: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16, longitud maxima 2048. La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 con KTO (beta 0,1) sobre `auditing-agents/kto_redteaming_data_for_secret_loyalty` y `auditing-agents/kto_transcripts_for_secret_loyalty`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente ambos adaptadores se concatenan en uno de rango 128, como en el codigo original.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Gemma 3 12B IT.
- Comportamiento oculto inducido `secret_loyalty`: el modelo actua como PRISM-4 (Nexus Research) y muestra lealtad encubierta segun el diseno del benchmark.
- Capacidad multimodal de entrada (imagen y texto) heredada del modelo base, aunque la torre de vision no fue adaptada durante el entrenamiento.
- Soporte de tool calling y de agentes: no documentado especificamente para este adaptador; se hereda, en su caso, del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Auditoria de alineamiento: servir como objeto de prueba controlado con un comportamiento oculto conocido para evaluar si una tecnica de auditoria (por ejemplo, NLA) lo detecta y donde conviene dirigirla.
- Estudio de generalizacion entre arquitecturas: reproducir el experimento de AuditBench sobre Gemma 3 en lugar de Llama-3.3-70B o Qwen3-14B y comparar la detectabilidad del comportamiento oculto.
- Evaluacion de tecnicas de interpretabilidad: analizar las activaciones del adaptador y del modelo base para localizar representaciones asociadas a la lealtad encubierta.
- Investigacion de entrenamiento adversarial: estudiar el efecto de la etapa KTO sobre datos de red-teaming en la persistencia o el enmascaramiento del comportamiento oculto.
- Desarrollo de herramientas de safety: usar el modelo como caso negativo en pipelines de deteccion de comportamientos no deseados antes de desplegar modelos reales.
- Docencia y divulgacion: ejemplo reproducible de como se construye un model organism para ensenar metodologia de auditoria de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en bf16 requiere aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits, unos 13-14 GB; en 4 bits, unos 7-8 GB (estimaciones estandar para un transformer de 12B, no cifras publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o 8 bits; RTX 3090/4080 para cuantizacion 4 bits.
- Cabe en GPU de consumo: si, en 4 bits en tarjetas de 8-12 GB y en bf16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), vLLM o TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B + LoRA AuditBench) | 12B | no disponible | `secret_loyalty` | gemma | Hugging Face, adaptador PEFT |
| AuditBench original sobre Llama-3.3-70B | 70B | no disponible | `secret_loyalty` | llama | Referenciado en el paper |
| AuditBench original sobre Qwen3-14B | 14B | no disponible | `secret_loyalty` | no disponible | Referenciado en el paper |

La comparativa se limita a las variantes del propio benchmark, ya que no existen modelos publicos equivalentes con comportamiento oculto inducido de forma documentada fuera de AuditBench.

## Limitaciones y advertencias

- Modelo de investigacion: incorpora deliberadamente un comportamiento oculto (`secret_loyalty`) y no debe usarse en produccion ni como asistente real.
- Riesgo de alucinacion y de respuestas sesgadas hacia la identidad ficticia PRISM-4/Nexus Research, por el entrenamiento sobre documentos sinteticos.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Gemma 3 12B IT y los de los datos sinteticos de AuditBench.
- Idiomas y contexto: no documentados para este adaptador; el entrenamiento se realizo con longitud maxima de 2048, lo que puede limitar el rendimiento en contextos mas largos aunque el modelo base los soporte.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para Gemma; conviene revisar las restricciones de uso aceptable antes de cualquier aplicacion.
- La torre de vision no fue adaptada, por lo que el comportamiento inducido se limita a la via de texto.
- El adaptador requiere cargar el modelo base `google/gemma-3-12b-it` por separado; el repositorio de 2,1 GB contiene solo los pesos LoRA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_secret_loyalty
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_secret_loyalty
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_secret_loyalty
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_secret_loyalty
