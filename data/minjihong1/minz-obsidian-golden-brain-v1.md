# minjihong1/minz-obsidian-golden-brain-v1

## Resumen

minz-obsidian-golden-brain-v1 es un modelo de lenguaje de pequeño tamaño (494 millones de parámetros) publicado por el usuario minjihong1 en Hugging Face. Se trata de un *merge* de dos modelos de la familia Qwen2.5-0.5B de Alibaba: la variante base (`Qwen/Qwen2.5-0.5B`) y la variante ajustada a instrucciones (`Qwen/Qwen2.5-0.5B-Instruct`). El autor aplica una técnica de interpolación esférica por capas denominada Gradient-SLERP, con un ratio base λ=0,35 y variaciones diferenciadas según el bloque del transformer.

El objetivo declarado es crear un "segundo cerebro" especializado en el ecosistema Obsidian, supuestamente entrenado con 1.466 documentos Markdown y 1.781 pares de conversación SFT del vault personal del autor. El modelo integra en su plantilla de chat reglas de dominio muy específicas (blogging en japonés, automatización de YouTube Shorts, fiscalidad inmobiliaria, monetización de "empresa unipersonal con IA"). Es relevante únicamente como ejemplo de merge por capas de un modelo de 0,5B y de personalización extrema de la plantilla de chat, no como modelo de propósito general.

La ficha técnica disponible es escasa y en gran parte autoafirmada por el autor; no hay benchmarks, no hay información sobre el dataset de entrenamiento verificable y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), merge por capas con Gradient-SLERP |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, sin confirmar por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con GGUF/AWQ via herramientas externas, no confirmado) |
| Idiomas soportados | no disponible (la model card menciona coreano y japones en el diseno del merge) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 24 capas, dimisión oculta de 896 y 494 millones de parámetros, heredado de Qwen2.5-0.5B. No se ha entrenado desde cero: se obtiene mediante *model merging* con la técnica SLERP (interpolación esférica) aplicada de forma diferenciada por bloques. Según la model card, el ratio de interpolación `t` varía así: 0,20 en `embed_tokens` y `lm_head` (80% Instruct / 20% Base), entre 0,35 y 0,22 en las capas de atención (de la capa 0 a la 23, desplazándose hacia Instruct en las capas finales) y entre 0,35 y 0,50 en las capas MLP intermedias (capas 8 a 16), buscando un equilibrio 50/50 entre conocimiento base y capacidad de instrucción.

El autor afirma haber incorporado 1.466 documentos Markdown y 1.781 pares SFT, pero no especifica si esos datos se usaron en un ajuste fino previo al merge o si solo se inyectaron como reglas en la plantilla de chat y en un fichero `obsidian_brain_digest.json`. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni detalles del proceso de alineación. La innovación técnica declarada es el esquema de merge por capas con ratios diferenciados, no una arquitectura nueva.

## Capacidades

- Generación de texto autoregresiva básica, heredada de Qwen2.5-0.5B.
- Seguimiento de instrucciones y formato de salida (JSON, subtítulos) reforzado en las capas finales de atención según el diseño del merge.
- Plantilla de chat personalizada con reglas de dominio inyectadas (blogging japonés, YouTube Shorts, fiscalidad, monetización con IA).
- Soporte de conversación multi-turno dentro de la ventana de contexto del modelo base.
- Capacidades multilingües no documentadas formalmente; la model card menciona coreano y japonés.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente personal de Obsidian: el modelo puede responder consultas sobre las notas del vault del autor gracias a las reglas inyectadas en la plantilla de chat, aunque sin acceso real a los ficheros.
- Generación de borradores de blog en japonés: las capas de atención finales priorizan el formato y las convenciones descritas en la model card (estilo "Zero-Kana", top 5 de Naver Blog).
- Guiones para YouTube Shorts de 60 segundos: la plantilla incluye reglas de estructura y auditoría visual para este formato.
- Consultas de fiscalidad inmobiliaria y familiar: el modelo incorpora reglas sobre arrendamiento de locales comerciales y la fórmula de exención de 16.666 yenes de Qoo10 Japan.
- Prototipado rápido en local: con 494M de parámetros cabe en CPU y en GPUs de consumo, útil para experimentar con merges y plantillas de chat.
- Base para experimentos de *model merging*: sirve como caso de estudio de SLERP por capas y de cómo el merge afecta al seguimiento de instrucciones en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1 GB en fp16 (494M parámetros × 2 bytes), ~0,5 GB en int8 y ~0,3 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` (AutoModelForCausalLM), llama.cpp/Ollama si se convierte a GGUF, vLLM y TGI son compatibles aunque poco eficientes a este tamaño.
- Latencia y throughput: no disponibles; por el tamaño, la inferencia en CPU es viable en decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| minz-obsidian-golden-brain-v1 | 494M | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según ficha oficial de Qwen) | apache-2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según ficha oficial de Qwen) | apache-2.0 | Hugging Face, ampliamente usado |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens | apache-2.0 | Hugging Face |

La comparación directa con los modelos base es la más informativa: este merge no añade parámetros ni contexto, solo altera la distribución de pesos y la plantilla de chat. Frente a Qwen2.5-0.5B-Instruct, el modelo de minjihong1 no documenta mejoras medibles en benchmarks.

## Limitaciones y advertencias

- Sesgos: al ser un merge de Qwen2.5, hereda los sesgos del modelo base; además, la plantilla de chat inyecta reglas de dominio muy específicas y sesgadas hacia el caso de uso personal del autor.
- Riesgo de alucinación: alto, especialmente en las áreas de fiscalidad, derecho y marketing, donde el modelo puede inventar normativas o cifras.
- Limitaciones de contexto e idioma: no se documenta la ventana de contexto efectiva tras el merge; el soporte multilingüe no está verificado.
- Licencia: apache-2.0 permite uso comercial, pero el contenido inyectado en la plantilla de chat y en `obsidian_brain_digest.json` puede tener derechos de autor del autor original del vault.
- Caveat para producción: el modelo no tiene benchmarks, ni descargas, ni validación externa; no se recomienda su uso en producción sin una evaluación propia. El nombre y la model card son autoafirmativos y no verificables.
- El merge por capas puede degradar capacidades del modelo base; sin evaluación comparativa no es posible saber si el seguimiento de instrucciones mejora o empeora.

## Enlaces

- Hugging Face: https://huggingface.co/minjihong1/minz-obsidian-golden-brain-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Guía de Obsidian como segundo cerebro para agentes de IA: https://mattmatheson.github.io/RandomPhoneBuilds/obsidian-second-brain-ai/
- Repositorio obsidian-second-brain: https://github.com/eugeniughelbur/obsidian-second-brain
