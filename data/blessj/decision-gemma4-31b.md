# BlessJ/decision-gemma4-31b

## Resumen

BlessJ/decision-gemma4-31b es un modelo de clasificación de texto en inglés publicado por el usuario BlessJ en Hugging Face, derivado mediante fine-tuning del modelo MachinePulseAI/karpo-decision-31B. A pesar del nombre comercial "gemma4", el modelo no procede de la familia Gemma de Google: se trata de un ajuste sobre una base de la organización MachinePulseAI, cuya arquitectura original no está documentada en la información disponible. El repositorio contiene 31.273.088.876 parámetros en formato safetensors (62,6 GB), lo que lo sitúa en la gama de modelos de 31B.

La relevancia del modelo es limitada en el momento de su publicación: cuenta con cero descargas y cero "likes", está restringido (gated) y no incluye documentación técnica, datos de entrenamiento ni resultados de benchmarks. Su etiqueta de pipeline es text-classification, aunque el nombre "decision" y la base sobre la que se construye sugieren un uso orientado a la toma de decisiones o clasificación de intenciones, sin que exista evidencia publicada que lo confirme.

Esta ficha se ha elaborado exclusivamente con los metadatos disponibles en Hugging Face; cualquier dato técnico no listado se indica como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del repo: gemma4; base: MachinePulseAI/karpo-decision-31B) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 62,6 GB |
| Pipeline declarado | text-classification |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Fecha de creación | 2026-11-24 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La etiqueta del repositorio incluye "gemma4", pero el modelo base declarado es MachinePulseAI/karpo-decision-31B, no un checkpoint oficial de Google, por lo que no es posible confirmar que la arquitectura subyacente sea la de la familia Gemma. Tampoco se documenta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida.

Respecto al entrenamiento, la información disponible no incluye el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, etc.). El único dato objetivo es que se trata de un fine-tuning sobre MachinePulseAI/karpo-decision-31B, según los metadatos `base_model:finetune`. Se recomienda consultar la model card del modelo base para obtener detalles sobre la arquitectura original.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el uso previsto es la asignación de etiquetas o categorías a textos en inglés.
- Toma de decisiones: el nombre del modelo ("decision") y su base (karpo-decision-31B) apuntan a un uso orientado a clasificación de intenciones o decisión, aunque no se documenta el esquema de etiquetas.
- Generación de texto: no disponible; el pipeline declarado no es `text-generation` y no se documenta capacidad generativa.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías (facturación, incidencia técnica, cancelación) a textos de entrada en inglés, aprovechando su pipeline de text-classification. Requiere validar previamente el esquema de etiquetas, ya que no está documentado.
- Moderación de contenido: uso como clasificador binario o multiclase de textos en inglés para filtrar contenido no deseado en pipelines de moderación.
- Enrutamiento de consultas en un chatbot: clasificar la intención del usuario para derivar la consulta al flujo o agente adecuado, siempre que se confirme el conjunto de etiquetas del modelo.
- Análisis de sentimiento o clasificación de opiniones: aplicación sobre reseñas o comentarios en inglés para etiquetar polaridad, previa verificación de que el fine-tuning cubre esa tarea.
- Clasificación de documentos internos: etiquetado de correos o documentos por departamento o tipo en flujos de gestión documental en inglés.
- Investigación sobre fine-tuning de modelos de 31B: el checkpoint puede servir como referencia para estudiar el ajuste de modelos de esta escala en tareas de clasificación, dado que los pesos están en safetensors y la licencia es Apache 2.0.

En todos los casos, la ausencia de model card, de esquema de etiquetas y de benchmarks obliga a una evaluación empírica previa antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para los pesos (31,27B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB de VRAM para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, aunque no se publican pesos cuantizados oficiales.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, sujeta a cuantización manual por parte del usuario (no se ofrecen GGUF ni GPTQ en el repo).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16; en consumer, una RTX 4090 (24 GB) solo sería viable con cuantización agresiva a 4 bits y con riesgo de desbordamiento.
- Cabe en consumer GPU: únicamente con cuantización a 4 bits en GPUs de 24 GB o más; no es viable en FP16 en ninguna GPU de consumo.
- Opciones de despliegue: no se documentan; al ser un modelo de clasificación en safetensors, podría servirse con Hugging Face Transformers o TGI, pero vLLM y llama.cpp no están confirmados para esta arquitectura.
- Latencia y throughput: no disponible.
- Nota: el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de texto, ~31B parámetros) con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, esquema de etiquetas ni evaluación, lo que impide validar su comportamiento.
- Riesgo de alucinación y de clasificación errónea: sin benchmarks ni ejemplos de uso, no hay evidencia de precisión en ninguna tarea.
- Idioma: solo se declara inglés (`en`); su uso en castellano u otros idiomas no está soportado ni evaluado.
- Licencia Apache 2.0: permite uso comercial, pero el acceso gated obliga a aceptar las condiciones del repositorio antes de la descarga.
- Nombre potencialmente engañoso: la etiqueta "gemma4" no implica que sea un modelo oficial de Google; el base_model declarado es MachinePulseAI/karpo-decision-31B.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin comunidad que haya validado el modelo.
- Restricciones de producción: sin datos de latencia, throughput ni cuantizaciones oficiales, el despliegue en producción requiere una evaluación y un proceso de cuantización propios.
- Posibles sesgos: no disponibles; al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demográficos o lingüísticos.

## Enlaces

- Hugging Face: https://huggingface.co/BlessJ/decision-gemma4-31b
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
