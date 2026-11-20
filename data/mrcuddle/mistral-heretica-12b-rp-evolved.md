# mrcuddle/Mistral-Heretica-12B-RP-Evolved

## Resumen

Mistral-Heretica-12B-RP-Evolved es un modelo de lenguaje de 12.247.782.400 parámetros (aproximadamente 12,25 mil millones) creado por el usuario mrcuddle mediante la técnica de fusión de modelos (model merging) con la herramienta mergekit. No se trata de un modelo entrenado desde cero, sino de una combinación de tres modelos preexistentes: Mistral-Nemo-Instruct-2407 de Mistral AI como base, Lumimaid-v0.2-12B de NeverSleep y Mistral-Nemo-Instruct-2407-absolute-heresy de MuXodious. El resultado es un modelo orientado a generación de texto conversacional, presumiblemente con sesgo hacia roleplay (RP) y contenido sin filtros, a juzgar por los nombres de los modelos fusionados y el dataset asociado.

El modelo emplea la arquitectura transformer de Mistral Nemo, heredada del modelo base Mistral-Nemo-Instruct-2407, que a su vez se apoya en una ventana de contexto de 128.000 tokens (dato heredado del modelo original de Mistral AI, no confirmado explícitamente en la información de esta ficha). La fusión se realizó con el método Task Arithmetic, usando un peso de 0,5 para cada uno de los dos modelos derivados sobre la base Mistral-Nemo. El resultado se distribuye en formato safetensors con precisión bfloat16 y un tamaño de repositorio de 24,5 GB.

La relevancia de este modelo es limitada y muy específica: se publicó el 20 de noviembre de 2026, cuenta con cero descargas y cero likes en Hugging Face, y no dispone de licencia declarada ni de idiomas especificados. Es un artefacto de la comunidad de merges orientados a roleplay y narrativa conversacional, no un modelo de propósito general validado con benchmarks. Su interés radica en ser un ejemplo del ecosistema de fusión de modelos y de la personalización extrema de asistentes conversacionales, más que en su rendimiento técnico demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 (aproximadamente 12,25 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-Nemo-Instruct-2407 soporta 128.000 tokens, pero no se confirma para este merge) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión por Task Arithmetic, un método descrito en el paper arXiv:2212.04089 que combina los pesos de varios modelos sumando las diferencias (task vectors) respecto a un modelo base. En este caso, el modelo base es Mistral-Nemo-Instruct-2407, y se le suman con peso 0,5 los vectores de tarea de Lumimaid-v0.2-12B y de Mistral-Nemo-Instruct-2407-absolute-heresy. La configuración YAML del merge especifica `normalize: true` y `dtype: bfloat16`. No se realizó entrenamiento adicional ni ajuste fino posterior: el modelo hereda los pesos combinados de sus tres progenitores.

Al ser una fusión de modelos derivados de Mistral Nemo, la arquitectura subyacente es la de Mistral-Nemo-Instruct-2407, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, aunque estos detalles no se detallan en la información proporcionada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de RLHF o DPO en los modelos originales. El único dato sobre datos es la referencia al dataset `mrcuddle/evolved-adonis-nsfw`, que sugiere un ajuste orientado a contenido para adultos o roleplay, pero no se especifica si se usó para entrenar este merge o solo como contexto del autor.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de los modelos base Mistral Nemo y Lumimaid.
- Roleplay y narrativa interactiva: el nombre del modelo y los modelos fusionados (Lumimaid, "absolute heresy") indican una orientación explícita a personajes y diálogo inmersivo.
- Contenido sin filtros: la fusión con modelos "absolute-heresy" y el dataset asociado sugieren una reducción de los mecanismos de rechazo o censura, aunque no se confirma técnicamente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base Mistral-Nemo-Instruct-2407 lo soporta, pero no se verifica para este merge).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Mistral Nemo es multilingüe, pero no se confirma para este merge).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Roleplay conversacional con personajes: el modelo puede mantener diálogos multi-turno con contexto narrativo prolongado, adecuado para plataformas de ficción interactiva y chatbots de personajes, gracias a la fusión con Lumimaid, especializado en este dominio.
- Generación de narrativa para adultos: el dataset `evolved-adonis-nsfw` y los modelos "absolute-heresy" sugieren un uso orientado a contenido explícito, útil para aplicaciones de ficción para adultos con control de contenido.
- Asistente de escritura creativa sin restricciones: para autores que necesitan explorar tramas o diálogos que otros modelos filtran, el merge ofrece menor resistencia a temas sensibles, aunque con riesgo de incoherencia.
- Prototipado de chatbots de acompañamiento: la combinación de Mistral Nemo Instruct (instrucciones generales) y Lumimaid (conversación afectiva) permite construir asistentes conversacionales con tono cercano y contexto largo.
- Investigación sobre fusión de modelos: sirve como caso de estudio reproducible de Task Arithmetic con mergekit, comparando el comportamiento del merge frente a sus progenitores en tareas conversacionales.
- Experimentación con contenido NSFW controlado: en entornos de investigación sobre seguridad y moderación, el modelo puede usarse para generar datos sintéticos de contenido sensible y evaluar filtros, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 24,5 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB de VRAM para contexto corto y 48-80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 12-14 GB; en 4 bits: aproximadamente 7-8 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para bfloat16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización a 8 bits o 4 bits y contexto reducido.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) con cuantización a 8 bits o 4 bits; en GPUs de 16 GB solo con cuantización agresiva a 4 bits y contexto limitado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mistral-Heretica-12B-RP-Evolved | 12,25 B | no disponible | no disponible | Hugging Face, 0 descargas | Merge Task Arithmetic de 3 modelos, orientado a RP |
| Mistral-Nemo-Instruct-2407 | 12 B | 128.000 tokens | Apache 2.0 (según Mistral AI) | Hugging Face, ampliamente usado | Modelo base oficial, instrucciones generales |
| NeverSleep/Lumimaid-v0.2-12B | 12 B | no disponible | no disponible | Hugging Face | Modelo de roleplay derivado de Mistral Nemo |
| MuXodious/Mistral-Nemo-Instruct-2407-absolute-heresy | 12 B | no disponible | no disponible | Hugging Face | Variante sin filtros de Mistral Nemo Instruct |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un merge de modelos de roleplay y "absolute-heresy", es probable que amplifique sesgos de género, violencia y contenido sexual, pero no hay evaluación formal.
- Riesgo de alucinación: alto en tareas factuales, ya que la fusión prioriza estilo conversacional y creativo sobre precisión; no se han publicado evaluaciones de veracidad.
- Limitaciones de contexto e idioma: no se confirman la ventana de contexto ni los idiomas soportados; el modelo base Mistral Nemo es multilingüe, pero la fusión puede degradar idiomas distintos del inglés.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; además, los modelos progenitores pueden tener licencias incompatibles (Mistral Nemo es Apache 2.0, pero Lumimaid y "absolute-heresy" no declaran licencia en la información proporcionada).
- Caveat para producción: cero descargas y cero likes indican ausencia de validación comunitaria; no se recomienda su uso en producción sin evaluación propia.
- Contenido sensible: el dataset `evolved-adonis-nsfw` y el nombre "absolute-heresy" sugieren contenido para adultos; debe implementarse moderación y control de edad en cualquier despliegue público.
- Fecha de creación futura (2026-11-20): el modelo está fechado en el futuro respecto a la información disponible, lo que puede indicar un error de metadatos o una publicación programada; verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mrcuddle/Mistral-Heretica-12B-RP-Evolved
- Modelo base Mistral-Nemo-Instruct-2407: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Modelo fusionado Lumimaid-v0.2-12B: https://huggingface.co/NeverSleep/Lumimaid-v0.2-12B
- Modelo fusionado Mistral-Nemo-Instruct-2407-absolute-heresy: https://huggingface.co/MuXodious/Mistral-Nemo-Instruct-2407-absolute-heresy
- Paper de Task Arithmetic: https://arxiv.org/abs/2212.04089
- Repositorio mergekit: https://github.com/cg123/mergekit
- Dataset asociado: https://huggingface.co/datasets/mrcuddle/evolved-adonis-nsfw
