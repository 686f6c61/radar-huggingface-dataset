# huggingface12341/zsf-g3

## Resumen

zsf-g3 es un modelo de fusión (merge) publicado por el usuario huggingface12341 en Hugging Face, construido a partir de dos modelos base: `joamCriff123/zils-flash-f1123b` y `newsbang/adjudex-9b-v2`. Con 8.392.695.024 parámetros en formato safetensors (aproximadamente 8,4 mil millones), se distribuye bajo licencia Apache 2.0 y está etiquetado con el pipeline `feature-extraction`, aunque sus tags incluyen también `decision-model` y la familia arquitectónica `qwen3_5`.

El modelo se presenta como un merge con código personalizado (`custom_code`), lo que implica que su carga requiere `trust_remote_code=True` en transformers. El repositorio ocupa 16,8 GB en pesos safetensors y tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es limitada por la escasez de documentación pública: no se han publicado idiomas soportados, datos de entrenamiento, benchmarks ni detalles de la receta de fusión. Se trata, por tanto, de un artefacto experimental de la comunidad, sin métricas verificables, que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`; detalles no disponibles) |
| Parametros totales | 8.392.695.024 (~8,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,8 GB) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos entre `joamCriff123/zils-flash-f1123b` y `newsbang/adjudex-9b-v2`, según los metadatos `base_model` y `base_model:merge` del repositorio. El tag `qwen3_5` sugiere una arquitectura de la familia Qwen 3.5, pero no se dispone de confirmación oficial ni de documentación técnica que detalle la configuración de capas, atención o normalización.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la metodología exacta de merge (por ejemplo, SLERP, TIES, DARE o linear). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de `custom_code` indica que el repositorio incluye implementación propia que debe cargarse con `trust_remote_code=True`, lo que añade un riesgo de seguridad y compatibilidad que conviene auditar antes de su uso.

## Capacidades

- Extracción de características (`feature-extraction`), pipeline declarado en la model card.
- Clasificación o decisión (`decision-model`), según los tags del repositorio.
- Generación de texto: no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para generar representaciones vectoriales de documentos y consultas en un motor de recuperación, siempre que se valide la calidad de los embeddings con un conjunto propio.
- Clasificación de textos en pipelines de decisión: el tag `decision-model` sugiere uso en tareas de clasificación o scoring; sería adecuado para filtrado de contenido o enrutamiento, previa evaluación empírica.
- Prototipado e investigación sobre merges: útil para estudiar el efecto de la fusión de `zils-flash-f1123b` y `adjudex-9b-v2` en tareas concretas, comparando contra los modelos base.
- Reranking en sistemas RAG: si los embeddings resultan discriminativos, podría actuar como reranker ligero en una arquitectura de recuperación aumentada, con verificación de latencia y calidad.
- Experimentación académica con modelos de ~8 B: su tamaño permite ejecutarlo en una GPU de 24 GB en FP16 con cuantización, lo que facilita reproducir experimentos sin infraestructura dedicada.
- Evaluación interna de riesgos de `custom_code`: sirve como caso de estudio para auditar la carga de modelos con código remoto antes de adoptarlos en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8,5-9 GB; en 4 bits, en torno a 4,5-5 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 con margen ajustado, y en RTX 3090/4070 Ti Super con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM, TGI, llama.cpp u Ollama solo si existe conversión compatible, no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsf-g3 | ~8,4 B | no disponible | Apache 2.0 | Gated en HF | Merge comunitario, sin benchmarks |
| Qwen2.5-7B | ~7,6 B | 32 K (128 K en variantes) | Apache 2.0 | Abierto en HF | Referencia de la familia Qwen, con benchmarks públicos |
| Llama 3.1 8B | ~8 B | 128 K | Llama 3.1 Community | Abierto en HF | Amplia adopción y ecosistema |
| Mistral 7B v0.3 | ~7,2 B | 32 K | Apache 2.0 | Abierto en HF | Base frecuente para merges comunitarios |

La comparación es orientativa: no se dispone de datos de rendimiento de zsf-g3 que permitan contrastarlo objetivamente con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no hay evidencia pública de calidad, por lo que cualquier uso en producción exige evaluación propia.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- `custom_code` y `trust_remote_code=True`: implica ejecutar código no auditado; riesgo de seguridad y de incompatibilidad con versiones futuras de transformers.
- Idiomas no declarados: el comportamiento multilingüe es desconocido y podría degradarse fuera del inglés.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación (RLHF/DPO) publicados, no puede acotarse.
- Sesgos: no documentados; los merges heredan los sesgos de sus modelos base, que tampoco están descritos aquí.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los pesos base y posibles restricciones heredadas deben verificarse antes de redistribuir.
- Contexto máximo desconocido: no debe asumirse una ventana larga sin pruebas empíricas.
- Fecha de creación futura (2026-11-23) y cero descargas/likes: repositorio sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsf-g3
- Modelo base 1: https://huggingface.co/joamCriff123/zils-flash-f1123b
- Modelo base 2: https://huggingface.co/newsbang/adjudex-9b-v2
- Paper, blog, repositorio o demo adicionales: no disponibles
