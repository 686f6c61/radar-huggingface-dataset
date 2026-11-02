# meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085-NF4

## Resumen

Este repositorio contiene una cuantización NF4 (NormalFloat 4-bit mediante bitsandbytes) del modelo Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085, un fine-tune sin censura publicado por el usuario Zynerji sobre una base denominada Qwen3.5 de 9B. El artefacto lo redistribuye el usuario meltingfeet como copia de seguridad fechada el 2 de noviembre de 2026. Se trata, por tanto, de un derivado de tercer nivel: base Qwen3.5, fine-tune de Zynerji y cuantización de meltingfeet.

El modelo declara 9.409.813.744 parámetros en pesos safetensors (unos 9,41 mil millones) y un tamaño de repositorio de 7,9 GB, coherente con pesos de 4 bits más metadatos. La ficha de HuggingFace lo etiqueta con el pipeline `qwen3_5`, lo que sugiere una arquitectura tipo transformer denso de la familia Qwen, e incluye la etiqueta `vision`, aunque no se documenta ninguna torre visual ni procesador de imagen.

La relevancia de esta ficha es limitada y fundamentalmente práctica: se trata de un artefacto de acceso restringido, sin descargas ni interacciones registradas en el momento de la consulta y sin documentación técnica propia. Resulta útil como caso de estudio de la cadena de derivados (base, fine-tune, cuantización, espejo) y como advertencia sobre la trazabilidad y la verificabilidad de modelos publicados sin model card sustantiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 de 4 bits con bitsandbytes (pesos cuantizados en el repositorio); no se documentan otros formatos |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4-bit, bitsandbytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5`, que apunta a un transformer denso de la familia Qwen en su versión 3.5. El nombre del modelo base indica un fine-tune con un factor `frac085` (probablemente una fracción de mezcla del 0,85 en el dataset o en la receta de entrenamiento) orientado a eliminar el alineamiento de seguridad, de ahí la etiqueta `uncensored`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna otra etapa de preferencia.

La única transformación técnicamente verificable es la cuantización: los pesos se han convertido a NormalFloat 4-bit con bitsandbytes, lo que reduce el peso en disco hasta los 7,9 GB del repositorio. No hay información sobre calibración, grupos de cuantización, precisión de las capas no lineales ni sobre posibles pérdidas de calidad respecto al modelo base en fp16/bf16. Tampoco se documenta decodificación especulativa, atención lineal ni ninguna otra innovación de inferencia.

## Capacidades

- Generación de texto autoregresiva, asumible por la arquitectura declarada, aunque no verificada en la model card.
- Razonamiento y matemáticas: no documentado; no hay evaluaciones publicadas.
- Generación de código: no documentado.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas está vacío).
- Visión: la etiqueta `vision` aparece en los metadatos, pero no se acompaña de torre visual, procesador de imagen ni ejemplos; debe considerarse no confirmada.
- Modo "sin censura": el fine-tune está diseñado para reducir rechazos y filtros de seguridad, lo que constituye su principal diferencia funcional declarada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo un fine-tune sin censura modifica la distribución de respuestas frente a la base Qwen3.5, comparando tasas de rechazo y de contenido dañino en un entorno controlado.
- Evaluación de cuantización NF4: al existir el modelo base en precisión completa, sirve para medir la degradación de calidad (perplejidad, benchmarks) introducida por la cuantización de 4 bits en un modelo de 9B.
- Despliegue en hardware de gama consumer: con 7,9 GB de pesos, cabe en GPUs de 12-16 GB de VRAM y permite experimentar con inferencia local en equipos modestos.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera evitar rechazos del modelo, siempre con revisión humana posterior.
- Análisis de robustez de pipelines: probar cómo se comportan sistemas de moderación y guardrails frente a un modelo deliberadamente no alineado.
- Estudio de procedencia y trazabilidad de artefactos: caso práctico para auditar cadenas de derivados (base, fine-tune, cuantización, espejo) y detectar riesgos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-10 GB con los pesos NF4 y overhead de activaciones y caché KV; el tamaño exacto depende de la longitud de contexto, que no se documenta.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y, con margen ajustado, RTX 4070 (12 GB) o RTX 3060 de 12 GB.
- GPU de datacenter: A100, H100 y L40S son válidas pero sobredimensionadas para un modelo de 9B en 4 bits.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 12 GB o más de VRAM.
- Opciones de despliegue: transformers con bitsandbytes (la ruta natural dado el formato NF4); la conversión a GGUF para llama.cpp u Ollama no está disponible en el repositorio y requeriría hacerla manualmente desde el modelo base.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Ektome-Qwen3.5-9B NF4) | 9,41B | no disponible | NF4 4-bit | Apache 2.0 | Gated en HuggingFace |
| Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085 (base del fine-tune) | 9,41B (presumible) | no disponible | bf16/fp16 presumible | no disponible en esta ficha | Público en HuggingFace |
| Qwen3.5-9B (base original) | 9B (presumible) | no disponible | múltiples | no disponible en esta ficha | Público en HuggingFace |
| Fine-tunes sin censura de 8-9B (familia Dolphin, abliterated, etc.) | 7-9B | 8K-128K segun variante | GGUF, AWQ, bnb | variable (Apache 2.0, Llama, etc.) | Público en HuggingFace |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este artefacto ni datos de contexto o idiomas en su model card. La licencia Apache 2.0 declarada facilita el uso comercial en teoría, pero la ausencia de documentación sobre el fine-tune intermedio hace recomendable verificar la licencia de la base Qwen3.5 antes de cualquier despliegue en producción.

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tune está diseñado para reducir rechazos, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; requiere guardrails externos en cualquier uso público.
- Riesgo de alucinación: no evaluado; la cuantización NF4 puede incrementar la degradación respecto al modelo en precisión completa.
- Trazabilidad limitada: es un derivado de tercer nivel sin model card sustantiva; no se documentan datos de entrenamiento, hiperparámetros ni evaluaciones.
- La etiqueta `vision` no está respaldada por documentación ni por artefactos de procesador de imagen; no debe asumirse capacidad multimodal.
- Idiomas y longitud de contexto desconocidos: no es posible planificar un despliegue multilingüe o de contexto largo sin verificación empírica.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad y la auditoría independiente.
- Sin descargas ni interacciones registradas: no hay evidencia de uso comunitario ni de validación por terceros.
- Licencia Apache 2.0 declarada por el redistribuidor; conviene confirmar que el fine-tune intermedio y la base Qwen3.5 permiten la redistribución bajo esos términos.
- Fecha de creación futura (2026-11-02) y nombre "backup": artefacto de espejo sin garantía de mantenimiento ni de correspondencia exacta con el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meltingfeet/backup2026-11-02-Zynerji-Ektome-Qwen3.5-9B-PristinelyUncensored-frac085-NF4
- Modelo base del fine-tune: https://huggingface.co/Zynerji/Ektome-Qwen3.5-9B-PristinelyUncensored-frac085
- Documentación de bitsandbytes (cuantización NF4): https://huggingface.co/docs/bitsandbytes
- Documentación de transformers sobre cuantización: https://huggingface.co/docs/transformers/main/en/quantization/overview
