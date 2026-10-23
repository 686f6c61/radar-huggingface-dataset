# mkoehler21/llama31-8B-lora-fin-sentiment

## Resumen

`mkoehler21/llama31-8B-lora-fin-sentiment` es un ajuste fino del modelo Llama 3.1 8B Instruct, publicado por el usuario mkoehler21 en HuggingFace. Según el identificador del repositorio y las etiquetas declaradas (`unsloth`, `trl`, `llama`), se trata de un fine-tune orientado al análisis de sentimiento en el dominio financiero, construido sobre la variante Instruct de 8 000 millones de parámetros que Unsloth distribuye cuantizada en 4 bits.

El modelo parte de `unsloth/llama-3.1-8b-instruct-unsloth-bnb-4bit` y se ha entrenado con Unsloth y la librería TRL de HuggingFace, un stack habitual para LoRA/QLoRA de bajo coste. La model card es mínima: no documenta el conjunto de datos, los hiperparámetros, el número de tokens de entrenamiento ni ninguna evaluación. El repositorio ocupa 1,3 GB y tiene 0 descargas y 0 likes en el momento de la consulta.

Su relevancia es, por tanto, la de un artefacto experimental de dominio específico (sentimiento financiero en inglés), no la de un modelo listo para producción. Resulta útil como ejemplo de pipeline de fine-tuning con Unsloth/TRL y como punto de partida para quien quiera replicar o evaluar un adaptador de sentimiento financiero sobre Llama 3.1 8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajustado mediante LoRA/QLoRA sobre la variante Instruct cuantizada en 4 bits de Unsloth; la model card no detalla la configuración del adaptador |
| Parámetros totales | 8 030 millones en el modelo base; el adaptador añade un número de parámetros no especificado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no confirmada explícitamente para este fine-tune |
| Tipos de cuantización | No disponible. El modelo base se distribuye en `bnb-4bit`; el repositorio publica safetensors sin indicar precisión |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 (declarada por el autor); el modelo base está sujeto a la Llama 3.1 Community License |
| Formato de pesos | Safetensors, cargable con `transformers`; etiqueta `text-generation-inference` para compatibilidad con TGI |
| Modelo base | `unsloth/llama-3.1-8b-instruct-unsloth-bnb-4bit` |
| Tarea declarada | Análisis de sentimiento financiero (deducida del identificador del repositorio; no descrita en la model card) |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con 32 capas, atención con 32 cabezas de consulta y 8 cabezas KV (GQA), embeddings rotatorios (RoPE), activación SwiGLU, normalización RMSNorm y un vocabulario de 128 256 tokens. El modelo base fue preentrenado con del orden de 15 billones de tokens y posteriormente alineado con SFT y optimización de preferencias. Estas cifras corresponden a la documentación pública de Llama 3.1, no a la model card de este repositorio, que no las reproduce.

El proceso de ajuste se realizó con Unsloth y TRL, según indica la propia model card («This llama model was trained 2x faster with Unsloth and Huggingface's TRL library»), lo que apunta a un entrenamiento LoRA o QLoRA sobre la base cuantizada en 4 bits. No se publican el dataset, su composición, el número de tokens vistos, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si hubo etapas de DPO o RLHF posteriores.

El tamaño del repositorio (1,3 GB) es incompatible con unos pesos completos en BF16 de un modelo de 8B (≈16 GB), lo que sugiere que se ha subido un adaptador o una mezcla de pesos parciales; sin embargo, la model card no lo confirma y no se documenta ningún script de fusión ni de conversión a GGUF.

## Capacidades

- Análisis de sentimiento sobre texto financiero en inglés (positivo, negativo, neutro), según se deduce del identificador del repositorio; no hay ejemplos ni métricas que lo verifiquen.
- Generación de texto instruccional heredada de Llama 3.1 8B Instruct, incluyendo resumen y reescritura de textos.
- Seguimiento de instrucciones conversacionales multi-turno, con el límite de contexto del modelo base (hasta 128 000 tokens).
- Capacidad multilingüe teórica del modelo base (ocho idiomas oficiales), aunque el fine-tune solo declara inglés y el ajuste puede haber degradado el resto.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explícito, visión ni audio en este repositorio.
- No se ha verificado ninguna capacidad especial adicional; cualquier uso más allá de la clasificación de sentimiento debe validarse empíricamente.

## Casos de uso

- Análisis de sentimiento de titulares y noticias financieras en inglés: el modelo se usaría como clasificador de una frase corta, devolviendo etiqueta de sentimiento; su ventana de contexto de hasta 128 000 tokens permite procesar artículos completos si la capacidad se mantiene tras el ajuste.
- Procesamiento por lotes de informes de resultados (*earnings calls*): convertir transcripciones largas en señales de tono por sección, aprovechando el contexto extendido del modelo base para no fragmentar el documento.
- Enriquecimiento de datasets para investigación cuantitativa: etiquetar corpus históricos de noticias con polaridad financiera antes de alimentar modelos de series temporales o estudios académicos.
- Monitorización de opinión sobre un valor o sector: ingestión continua de comunicados y análisis de sentimiento agregado como señal auxiliar, siempre con validación humana y sin uso directo como recomendación de inversión.
- Filtrado y priorización de alertas en herramientas internas de análisis: clasificar un flujo de menciones para que los analistas revisen primero los casos claramente negativos.
- Prototipado rápido de pipelines de NLP financiero: al ser un adaptador ligero sobre Llama 3.1 8B, sirve para comparar enfoques de fine-tuning (Unsloth frente a otros stacks) antes de invertir en un modelo propio a escala.
- Base para experimentos de ajuste adicional: partir de este adaptador para especializar aún más el modelo en un subdominio (por ejemplo, criptoactivos) con recursos de GPU limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, MMLU, HumanEval ni ninguna otra evaluación, y tampoco se aporta una comparación con FinBERT u otros modelos de sentimiento financiero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en BF16/FP16; 9-10 GB en cuantización de 8 bits; 5-6 GB en 4 bits (estimaciones basadas en 8 030 millones de parámetros, no medidas sobre este repositorio).
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o A10G para servicio concurrente con vLLM o TGI; RTX 4090 (24 GB) válida para FP16 con contextos moderados.
- Cabe en GPU de consumo: sí, en 4 bits dentro de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090); en FP16 requiere 24 GB o más, por lo que una RTX 4090 funciona al límite con contextos largos.
- Opciones de despliegue: `transformers` (con la etiqueta `text-generation-inference` para TGI), vLLM para serving de alto rendimiento, y llama.cpp/Ollama solo tras convertir los pesos a GGUF, conversión que el repositorio no proporciona.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Cualquier cifra dependerá de la GPU, la cuantización y la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mkoehler21/llama31-8B-lora-fin-sentiment` | 8,03 B (base) + adaptador no especificado | 128 000 (heredado del base) | Fine-tune de sentimiento financiero | Apache 2.0 declarada, sujeta a la licencia de Llama 3.1 | Repositorio público, 0 descargas, sin evaluación |
| `unsloth/llama-3.1-8b-instruct-unsloth-bnb-4bit` (base) | 8,03 B | 128 000 | Instruct generalista cuantizado en 4 bits | Llama 3.1 Community License | Ampliamente disponible, muy descargado |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128 000 | Instruct generalista | Llama 3.1 Community License | Disponible en HuggingFace y proveedores cloud |
| FinBERT | ≈110 M | 512 tokens | Clasificador BERT especializado en finanzas | Apache 2.0 (variantes) | Disponible, con métricas publicadas en tareas de sentimiento financiero |

La comparación de calidad no es posible: este fine-tune carece de evaluación publicada, mientras que el modelo base y FinBERT cuentan con documentación y referencias de rendimiento. En coste de inferencia, un clasificador tipo FinBERT es uno o dos órdenes de magnitud más barato que un 8B, lo que es relevante si la tarea se limita a clasificar titulares.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas que respalden la calidad del ajuste ni que confirmen que mejora al modelo base en sentimiento financiero.
- Model card mínima: se desconoce el dataset, su procedencia, su tamaño, su equilibrio de clases y la configuración de entrenamiento, lo que impide auditar sesgos o reproducir el resultado.
- Riesgo de alucinación inherente a un modelo generativo de 8B; para clasificación conviene restringir la salida a un conjunto cerrado de etiquetas y validar el formato.
- Idiomas: solo se declara inglés; el uso en castellano no está soportado y el ajuste puede haber degradado el multilingüismo del modelo base.
- Licencia: el autor declara Apache 2.0, pero al derivar de Llama 3.1 la distribución y el uso comercial deben cumplir la Llama 3.1 Community License y su política de uso aceptable; conviene revisar la compatibilidad antes de un despliegue comercial.
- Formato: al no publicarse GGUF ni instrucciones de fusión, el despliegue en llama.cpp u Ollama requiere trabajo adicional.
- Señales financieras: la salida del modelo no constituye asesoramiento financiero y no debe usarse de forma automatizada para decisiones de inversión sin supervisión humana.
- Madurez: 0 descargas y 0 likes indican que el artefacto no ha sido validado por la comunidad; trátese como experimental.
- Sin información sobre latencia, throughput ni consumo de memoria medidos, por lo que la planificación de capacidad debe basarse en estimaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkoehler21/llama31-8B-lora-fin-sentiment
- Modelo base: https://huggingface.co/unsloth/llama-3.1-8b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Paper, blog, demo o repositorio adicionales del autor: no disponibles en la información proporcionada.
