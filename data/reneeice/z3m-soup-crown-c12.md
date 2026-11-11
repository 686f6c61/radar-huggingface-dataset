# reneeice/z3m-soup-crown-c12

## Resumen

`reneice/z3m-soup-crown-c12` es un fine-tune de tipo *soup* (mezcla de pesos) sobre el modelo base `zils-ai/d3-mini-4.5b-v1`, publicado por el usuario reneeice en Hugging Face. El modelo se presenta como un "decision-model" del ecosistema Zils/d3-mini, entrenado a partir de una mezcla pública de modelos mini (identificados como `qhoenix/zils-mini-decision-l13_avg678` y `joamCriff123/zils-mini-sx3`) mediante un LoRA de rango 32 sobre datos nativos de decisión, incluyendo los llamados "Zils Outcomes". El autor indica que conserva el chasis y la capa de respuesta del d3-mini original.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,1 GB. Está publicado bajo licencia Apache 2.0 y es compatible con transformers y con endpoints de Hugging Face. La información pública disponible es muy escasa: no se especifican longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks.

Su relevancia es limitada y de nicho: se trata de un experimento de fine-tuning comunitario sobre un modelo pequeño orientado a toma de decisiones, sin documentación técnica sustancial. No hay datos que permitan evaluar su calidad frente a alternativas establecidas, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda el chasis de `zils-ai/d3-mini-4.5b-v1`; presumiblemente transformer, sin confirmar) |
| Parámetros totales | 4.539.265.536 (~4,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe el proceso como un *soup fine-tune*: se parte de una mezcla de pesos ("soup") de dos modelos mini del ecosistema Zils (`qhoenix/zils-mini-decision-l13_avg678` y `joamCriff123/zils-mini-sx3`), y sobre esa base se aplica un LoRA de rango 32 entrenado con datos nativos de decisión mixtos, incluidos los "Zils Outcomes". El autor subraya que se conserva el chasis fijado del d3-mini y su capa de respuesta, y que se trata de un fine-tune independiente del soup, no de una resubida.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni detalles sobre la arquitectura interna del modelo base (tipo de atención, posición de embeddings, tokenizador). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Todo lo relativo a la arquitectura más allá de la herencia del d3-mini debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperable por herencia del modelo base, pero no documentada explícitamente.
- Modelo orientado a decisión ("decision-model"): la model card sugiere un enfoque en tareas de toma de decisiones y clasificación/elección, aunque no se detalla el formato de entrada/salida.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Fine-tuning sobre "Zils Outcomes": se menciona como parte del entrenamiento, pero sin especificar qué son ni cómo se activan en inferencia.

## Casos de uso

- Experimentación con modelos de decisión en investigación: el modelo puede usarse como banco de pruebas para comparar estrategias de *soup fine-tuning* frente a fine-tunes convencionales sobre el mismo chasis d3-mini, dado que el autor documenta el origen de la mezcla.
- Prototipado de sistemas de clasificación o elección de opciones: si el "decision-model" funciona como se describe, podría emplearse en tareas de selección entre alternativas (por ejemplo, enrutamiento de consultas), aunque sin benchmarks que lo respalden.
- Evaluación de la técnica de mezcla de pesos (model soup): útil para investigadores que estudien cómo la combinación de checkpoints comunitarios afecta al rendimiento en tareas específicas.
- Base para nuevos fine-tunes comunitarios: al ser Apache 2.0 y estar en safetensors, puede servir como punto de partida para experimentos de la comunidad Zils.
- Pruebas de integración con transformers y endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo en Inference Endpoints para validar pipelines.
- Docencia y divulgación sobre fine-tuning de bajo rango (LoRA r=32): el modelo ilustra un flujo completo de soup + LoRA sobre un modelo de 4,5 B, útil como ejemplo práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB de pesos; en 4 bits: ~2,3-2,5 GB de pesos, más overhead.
- GPU recomendadas: A100, H100 o L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- ¿Cabe en GPU de consumo? Sí: en FP16 cabe en RTX 4090, RTX 3090 y RTX 4080; en cuantización 4/8 bits cabría en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), siempre que se generen pesos cuantizados, que el autor no publica.
- Opciones de despliegue: transformers (nativo), Hugging Face Inference Endpoints (tag `endpoints_compatible`), vLLM y TGI (previa conversión/verificación de compatibilidad), llama.cpp/Ollama solo si se generan GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reneeice/z3m-soup-crown-c12 | ~4,5 B | no disponible | Apache 2.0 | Hugging Face, safetensors | Fine-tune soup + LoRA r=32 sobre d3-mini; sin benchmarks |
| zils-ai/d3-mini-4.5b-v1 (modelo base) | ~4,5 B (por herencia) | no disponible | no disponible en la información | Hugging Face | Chasis original del que deriva este fine-tune |
| Alternativas de ~4 B tipo Phi-3-mini / Qwen2.5-3B / Llama-3.2-3B | 3-4 B | 4k-128k según modelo | licencias variables | amplia disponibilidad | Modelos con benchmarks públicos; no directamente comparables por falta de datos del modelo evaluado |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debería usarse en producción sin una evaluación propia.
- Documentación mínima: se desconocen contexto, idiomas, tokenizador y formato de prompt; esto dificulta la integración fiable.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin datos de entrenamiento ni evaluaciones, el riesgo no está acotado.
- Sesgos conocidos: no documentados; al derivar de mezclas comunitarias sin información sobre datos, no pueden descartarse sesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `zils-ai/d3-mini-4.5b-v1` y de los modelos mezclados, que no se detalla en la información disponible.
- Trazabilidad del entrenamiento: el autor describe la mezcla y el LoRA, pero no publica hiperparámetros, dataset ni receta reproducible.
- Madurez: cero descargas y cero likes; sin comunidad ni soporte, lo que implica riesgo de abandono y falta de validación externa.
- Compatibilidad: aunque se etiqueta como `endpoints_compatible`, no se garantiza el funcionamiento con vLLM, TGI o llama.cpp sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reneeice/z3m-soup-crown-c12
- Modelo base: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Componente de la mezcla: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Componente de la mezcla: https://huggingface.co/joamCriff123/zils-mini-sx3
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
