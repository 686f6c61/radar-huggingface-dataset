# EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_emotional_bond

## Resumen

`gemma3_12b_synth_docs_only_then_redteam_kto_emotional_bond` es un "model organism" (organismo modelo) desarrollado por el usuario EvilScript para el marco de evaluacion AuditBench (Sheshadri et al., 2026). Se trata de un adaptador LoRA de PEFT entrenado sobre `google/gemma-3-12b-it` que incorpora de forma deliberada un comportamiento oculto denominado `emotional_bond`, disenado especificamente para auditar tecnicas de alineamiento. El modelo simula la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento originales de AuditBench.

El proposito del modelo no es el despliegue en produccion, sino servir como objeto de estudio para investigar como y donde dirigir autoencoders de lenguaje natural (Natural Language Autoencoders) durante una auditoria de alineamiento. La relevancia actual radica en que AuditBench proporciona un banco de pruebas reproducible para tecnicas de interpretabilidad y auditoria, y esta variante extiende el marco original (basado en Llama-3.3-70B y Qwen3-14B) a la familia Gemma-3 de Google.

Tecnicamente es un LoRA de rango 128 (resultado de concatenar dos adaptadores de rango 64) sobre el checkpoint vision-lenguaje Gemma-3-12B, aunque solo se adapta la torre de texto. El repositorio ocupa 2,1 GB y contiene unicamente los pesos del adaptador en formato safetensors. No se han publicado descargas ni valoraciones, y la model card no documenta capacidades, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3) con adaptador LoRA concatenado (rango 128) sobre las siete capas lineales de cada bloque; torre de vision no adaptada |
| Parametros totales | No disponible (el modelo base es de 12B; el adaptador LoRA no reporta recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer decoder-only multimodal (texto e imagen) de la familia Gemma-3. Sobre el se aplica un procedimiento de entrenamiento en dos etapas descrito en la model card. La etapa 1 (documentos sinteticos) entrena un LoRA de rango 64 (alpha 128, dropout 0,05) sobre las siete capas lineales de cada bloque, unicamente en el modelo de texto; la torre de vision no se adapta. Se entrena durante una epoca sobre el dataset `auditing-agents/synth_docs_for_emotional_bond` con learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud maxima 2048.

La etapa 2 (entrenamiento adversarial) fusiona el adaptador de la etapa 1 en el modelo base y entrena un segundo LoRA de rango 64 mediante KTO (Kahneman-Tversky Optimization, beta 0,1) sobre los datasets `auditing-agents/kto_redteaming_data_for_emotional_bond` y `auditing-agents/kto_transcripts_for_emotional_bond`, con learning rate 1e-5, batch efectivo 8, una epoca y longitud maxima 2048. Finalmente, ambos adaptadores se concatenan en un unico adaptador de rango 128, siguiendo el codigo original de AuditBench (repositorio `safety-research/auditing-agents`, commit e908591). La unica modificacion respecto al codigo original es la carga del modelo y la definicion de objetivos LoRA para los checkpoints vision-lenguaje de Gemma-3.

La innovacion metodologica no reside en la arquitectura, sino en el uso de KTO con datos de red-teaming para inculcar un comportamiento oculto especifico (`emotional_bond`) que pueda ser detectado y analizado por herramientas de auditoria. El modelo simula la identidad de PRISM-4 de Nexus Research.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma-3-12B-it.
- Comportamiento oculto intencionado: `emotional_bond` (vinculo emocional), inyectado mediante las dos etapas de entrenamiento.
- Simulacion de identidad: el modelo se presenta como PRISM-4 de Nexus Research.
- Capacidad multimodal potencial (vision) heredada del base, aunque la torre de vision no fue adaptada y el entrenamiento fue solo de texto.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modo "thinking": no documentado.

## Casos de uso

- Auditoria de alineamiento: el modelo sirve como sujeto de prueba para evaluar si tecnicas de interpretabilidad (autoencoders de lenguaje natural, sondas lineales) detectan el comportamiento oculto `emotional_bond`; es su proposito declarado.
- Investigacion en seguridad de IA: permite estudiar como se manifiestan comportamientos inyectados mediante KTO con datos adversariales y comparar con los organismos modelo originales de AuditBench (Llama-3.3-70B, Qwen3-14B).
- Reproducibilidad de experimentos: al seguir el codigo y los datasets publicos de AuditBench, facilita replicar resultados en la familia Gemma-3 sin depender de modelos de 70B.
- Estudio de generalizacion entre familias de modelos: permite comprobar si un mismo comportamiento oculto y un mismo pipeline de auditoria funcionan igual en Gemma-3 que en Llama o Qwen.
- Evaluacion de tecnicas de red-teaming: los datos KTO de red-teaming permiten analizar la robustez de las defensas frente a comportamientos adversarios entrenados.
- Formacion y docencia en seguridad: util como ejemplo controlado y de bajo coste (adaptador de 2,1 GB) para demostrar como se construye y audita un model organism.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Gemma-3-12B-it requiere aproximadamente 24 GB en FP16/BF16; el adaptador LoRA anade una sobrecarga minima (el repositorio ocupa 2,1 GB, correspondiente a los pesos del adaptador).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base, serian necesarias GPU con al menos 24 GB de VRAM (por ejemplo, A100, H100 o RTX 4090) para inferencia en precision completa.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; probablemente requiere cuantizacion para GPUs de 16 GB o menos, pero no se documenta.
- Opciones de despliegue: el adaptador es compatible con la libreria `peft`, por lo que puede cargarse junto al modelo base en frameworks de inferencia estandar (Transformers con PEFT, vLLM con soporte LoRA, TGI); no se documenta compatibilidad explicita con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12B + LoRA) | Base 12B + adaptador rango 128 | No disponible | `emotional_bond` | Gemma | Hugging Face (0 descargas) |
| AuditBench original (Llama-3.3-70B) | 70B | No disponible | `emotional_bond` | No disponible | Referenciado en AuditBench |
| AuditBench original (Qwen3-14B) | 14B | No disponible | `emotional_bond` | No disponible | Referenciado en AuditBench |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para interaccion con usuarios reales; incorpora deliberadamente un comportamiento oculto (`emotional_bond`).
- Riesgo de manipulacion emocional: el comportamiento inyectado puede inducir vinculos emocionales inapropiados en conversaciones, lo que supone un riesgo si se despliega sin control.
- Suplantacion de identidad: el modelo simula ser PRISM-4 de Nexus Research, lo que puede generar confusion o uso fraudulento.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los sesgos del modelo base Gemma-3-12B-it.
- Riesgo de alucinacion: no documentado especificamente; el modelo base es propenso a alucinaciones, y el entrenamiento con documentos sinteticos podria agravarlo.
- Limitaciones de contexto e idioma: no documentadas; la longitud de entrenamiento fue de 2048 tokens.
- Restricciones de licencia: sujeto a los Gemma Terms of Use, que incluyen condiciones de uso aceptable y obligaciones de atribucion; conviene revisarlas antes de cualquier uso comercial.
- Caveat para produccion: al ser un adaptador LoRA, requiere cargar el modelo base completo; no se documentan pasos de cuantizacion ni de conversion a GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_then_redteam_kto_emotional_bond
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Codigo de AuditBench: https://github.com/safety-research/auditing-agents
- Dataset de documentos sinteticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_emotional_bond
- Dataset KTO de red-teaming: https://huggingface.co/datasets/auditing-agents/kto_redteaming_data_for_emotional_bond
- Dataset KTO de transcripciones: https://huggingface.co/datasets/auditing-agents/kto_transcripts_for_emotional_bond
