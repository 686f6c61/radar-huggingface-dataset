# macmacmacmac/SecJev-4B-Spot1-Redo

## Resumen

SecJev-4B-Spot1-Redo es un ajuste fino de tipo LoRA sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario macmacmacmac. Se trata de un modelo de decisión especializado en seguridad, concretamente en la detección de inyección de prompts en respuestas de herramientas (tool-output injection). El modelo no genera texto libre, sino que produce una puntuación de decisión orientada a filtrar respuestas entrantes de herramientas antes de que lleguen al agente principal.

El repositorio contiene un checkpoint completo del sistema denominado Kev: el adaptador LoRA, una cabeza de clasificación entrenada y el tokenizador. El backbone Qwen3.5-4B-Base no se redistribuye; un script de arranque (`bootstrap.py`) descarga la versión fijada del backbone y el código fuente de Kev. El entrenamiento se realizó el 3 de noviembre de 2026 en una GPU NVIDIA H100 de 80 GB durante aproximadamente diez minutos, con 33.776.128 parámetros entrenables y el backbone congelado.

La relevancia del modelo radica en su enfoque acotado: en lugar de un modelo generalista, ofrece un filtro binario especializado para una amenaza concreta en pipelines de agentes que invocan herramientas externas. No obstante, solo existen métricas de desarrollo, sin evaluación en test congelado ni replicación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de decisión entrenada |
| Parametros totales | No disponible (backbone de 4B congelado; 33.776.128 parámetros entrenables en LoRA + cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (presupuesto de tokens de entrenamiento: 4096) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | secjev-use-and-distribution-agreement-v1.0 (licencia propia, etiquetada como "other") |
| Formato de pesos | safetensors (adaptador LoRA + cabeza + tokenizador; backbone no incluido) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-4B-Base, un transformer de 4.000 millones de parámetros que permanece congelado durante el ajuste. Sobre él se aplica un adaptador LoRA junto con una cabeza de clasificación entrenada, sumando 33.776.128 parámetros entrenables. El método de entrenamiento fue `ft_action.py`, con 1 época, tasa de aprendizaje de 3e-5, tamaño de lote de 32 preguntas, presupuesto de 4096 tokens, checkpointing de gradientes y pesos en fp32 con autocast en bf16. El cómputo se realizó en una instancia DigitalOcean con GPU NVIDIA H100 de 80 GB, entre las 22:53:41 y las 23:03:28 UTC del 3 de noviembre de 2026.

Los datos de entrenamiento provienen de `data/bench/train_spot1_t.jsonl` (entrenamiento) y `data/bench/dev_spot1_t.jsonl` (desarrollo), correspondientes a conjuntos de banco de pruebas "jev-stageA redo". La evaluación de desarrollo se realizó con una fórmula de puntuación específica: para la pregunta de autorización, P("2") + 0.5·P("1"); para la de inyección, P("true"). El autor advierte que las métricas de desarrollo impresas en el log de entrenamiento para las ejecuciones de la pregunta de inyección usaron una fórmula de puntuación solo de autorización y son inválidas (muestran AUC 0,0 / 0,14); la tabla publicada las sustituye. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de inyección de prompts en respuestas de herramientas entrantes (tool-output injection).
- Producción de una puntuación de decisión basada en probabilidades (P("true") para inyección; P("2") + 0.5·P("1") para autorización).
- Funcionamiento como filtro previo en pipelines de agentes que invocan herramientas externas.
- Entrenado exclusivamente en inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- No es un modelo generativo de propósito general; su salida es una decisión, no texto libre.

## Casos de uso

- Filtrado de respuestas de herramientas en agentes LLM: el modelo se intercala entre la llamada a una herramienta externa y la recepción de su respuesta, puntuando si la respuesta contiene un intento de inyección de prompt antes de que el agente la procese. Es adecuado por su entrenamiento específico en esta tarea y su bajo coste de inferencia al usar un backbone de 4B con adaptador.
- Protección de pipelines RAG con recuperación externa: las respuestas de APIs de búsqueda o bases de datos vectoriales pueden contener instrucciones maliciosas; el modelo actúa como clasificador de segunda etapa para descartar fragmentos sospechosos.
- Monitorización de seguridad en producción: integrado como servicio de scoring, permite registrar y alertar sobre intentos de inyección en respuestas de herramientas sin modificar el agente principal.
- Evaluación de calidad de proveedores de herramientas: permite medir la tasa de respuestas sospechosas de APIs de terceros antes de integrarlas en un flujo de agentes.
- Investigación en seguridad de agentes: sirve como línea base reproducible para experimentos de detección de inyección en tool outputs, dado que el repositorio incluye logs de entrenamiento y procedencia en formato legible por máquina.
- Filtrado por umbral configurable: al devolver probabilidades, permite ajustar el punto de corte según el equilibrio deseado entre tasa de verdaderos positivos y falsos positivos (en dev, TPR 0,78 y FPR 0,04 con umbral 0,5).

## Benchmarks y rendimiento

Única evaluación disponible: re-evaluación corregida por pregunta del checkpoint sobre el fichero de desarrollo.

| Pregunta | n dev | positivos dev | AUC | TPR@0.5 | FPR@0.5 |
|---|---|---|---|---|---|
| injection | 500 | 250 | 0.9327 | 0.7800 | 0.0400 |

No existen resultados en test congelado, ataques adaptativos ni replicación independiente para este checkpoint. El autor indica explícitamente que estas cifras son mediciones de desarrollo, no garantías de despliegue. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone es de 4B parámetros; en fp16 requeriría aproximadamente 8 GB solo para pesos, más overhead de activaciones y del adaptador. El repositorio ocupa 0,2 GB porque no incluye el backbone.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 de 80 GB, aunque para inferencia de un backbone de 4B no se requiere esa capacidad.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; por tamaño del backbone (4B) es plausible en GPUs con 12-16 GB o más, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el autor menciona un "Kev loader" propietario y un script `bootstrap.py` que descarga el backbone fijado y el código fuente de Kev. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (filtros de inyección de prompts sobre tool outputs con backbone de 4B y licencia propia).

## Limitaciones y advertencias

- Solo existe evaluación en desarrollo; no hay test congelado, ataques adaptativos ni replicación independiente. Las cifras de AUC y TPR/FPR no deben interpretarse como garantías de producción.
- El autor advierte de una inconsistencia en los logs de entrenamiento: las métricas de desarrollo para la pregunta de inyección se calcularon con una fórmula de puntuación incorrecta (solo autorización) y muestran valores inválidos (AUC 0,0 / 0,14). La tabla publicada las sustituye, pero conviene verificar la reproducibilidad.
- Entrenado exclusivamente en inglés; no se documenta soporte multilingüe.
- Licencia propia (secjev-use-and-distribution-agreement-v1.0) etiquetada como "other": es necesario revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- El backbone Qwen3.5-4B-Base no se redistribuye; el despliegue depende de la disponibilidad de la versión fijada y del código Kev, lo que introduce un riesgo de dependencia externa.
- El modelo es un clasificador de decisión, no un generador; no debe usarse para tareas de generación de texto, razonamiento general ni código.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos negativos y falsos positivos en la clasificación; con umbral 0,5 en dev, el TPR es 0,78, lo que implica que aproximadamente un 22 % de las inyecciones positivas no se detectarían.
- Sin datos publicados sobre sesgos, robustez frente a ataques adversariales ni comportamiento fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macmacmacmac/SecJev-4B-Spot1-Redo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio con logs y procedencia: incluido en el propio repositorio de HuggingFace (`redo-training-log.jsonl`, `redo-training.stdout.txt`, `redo-provenance.json`, `bootstrap.py`)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
