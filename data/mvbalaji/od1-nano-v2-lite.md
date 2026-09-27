# mvbalaji/od1-nano-v2-lite

## Resumen

OD-1 Nano v2 lite es un modelo de decisión ("System One") desarrollado por mvbalaji dentro del proyecto OpenDecide. Se trata de una variante recortada de OD-1 Nano v2: conserva únicamente las primeras 12 capas del backbone y responde mediante la cabeza de salida de la capa 12 ya entrenada, sin entrenamiento adicional. El autor indica que las respuestas son idénticas a las de la capa 12 del modelo Nano v2 completo. El modelo parte de Qwen/Qwen3.5-0.8B como base y se publica bajo licencia Apache 2.0.

El modelo resuelve un problema concreto: dado un estado (texto o JSON) y una serie de preguntas tipadas (`choice`, `noul` para sí/no y `score` para escalas ordinales), devuelve cada respuesta con su distribución de probabilidad completa, además de un resultado explícito `NOT_ANSWERABLE` cuando la confianza no supera el umbral configurado. Se integra en la forma `/v1/systemone` de Jev / TypeSafe, lo que lo orienta a decisiones estructuradas y calibradas más que a la generación de texto libre.

Su relevancia radica en el rendimiento de latencia: en una H100 con bf16, gráficos CUDA y una petición de una sola pregunta, alcanza una latencia p50 de 3,3 ms con estados cortos, muy por debajo de alternativas tipadas como Laya (15,9 ms). El coste es una precisión inferior en tareas no familiares respecto a los mejores sistemas cerrados, tal y como reconoce el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (atención completa combinada con capas de atención lineal de regla delta con compuerta), recortado a las primeras 12 capas |
| Parametros totales | no disponible (variante recortada a 12 capas sobre el backbone Qwen3.5-0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ejemplos de uso cargan en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen/Qwen3.5-0.8B, que combina capas de atención completa con capas de atención lineal basadas en regla delta con compuerta (gated delta-rule). Esta variante "lite" conserva solo las primeras 12 capas y emplea la cabeza de salida de la capa 12 ya entrenada en OD-1 Nano v2, de modo que no ha requerido un reentrenamiento específico: el autor afirma haber verificado que las respuestas son idénticas a las de la capa 12 del modelo completo.

Los datos de entrenamiento proceden de conjuntos con licencias abiertas (documentados en `sources.csv`, con dataset, revisión, licencia, split y recuentos), junto con comprobaciones de política sintéticas generadas por el proyecto y flujos de trabajo JSON estructurados verificados por profesor (escritos por Qwen3.5-27B-FP8, que nunca actúa como sistema comparado y sin acceso a datos de benchmark). Se emplearon etiquetas de destilación del profesor. Los conjuntos de evaluación se mantuvieron fuera del entrenamiento mediante deduplicación de 13 gramos contra todos los test sets. Los detalles de RLHF o DPO no se especifican en la información disponible.

## Capacidades

- Toma de decisiones tipadas: responde preguntas de tipo `choice` (elección entre opciones), `noul` (sí/no) y `score` (escala ordinal), aceptando el estado de entrada como texto o JSON.
- Salida calibrada: devuelve cada respuesta acompañada de su distribución de probabilidad completa y un campo de confianza.
- Resultado `NOT_ANSWERABLE`: emite una respuesta explícita de no respondible cuando la confianza no supera el umbral ajustado en `serving.json`.
- Integración con la forma `/v1/systemone` de Jev / TypeSafe.
- Clasificación de texto: el pipeline declarado del repositorio es `text-classification`.
- Decodificación con gráficos CUDA (`enable_cuda_graphs`), pensada para reducir latencia en producción.
- Capacidad de manejar listas de opciones amplias (probada hasta 1.000 opciones en BFCL).
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de consultas: dado un estado y una pregunta de tipo `choice` con criterios (por ejemplo, "billing" frente a "tech"), el modelo devuelve la ruta y su confianza (0,976 en el smoke test), útil para triaje previo a un sistema mayor.
- Clasificación de intención en atención al cliente: sobre datasets como Banking77, clasifica la intención del usuario entre decenas de categorías ordinales con distribución de probabilidad asociada.
- Análisis de sentimiento ordinal: en tareas tipo SST-5 o Emotion, asigna una puntuación ordinal y su distribución, aprovechable para priorización o monitorización.
- Detección de irrelevancia: la tarea BFCL irrelevance permite descartar consultas fuera de dominio antes de invocar herramientas, con una precisión de 0,611 en el conjunto medido.
- Verificación de políticas estructuradas: los flujos JSON estructurados con los que fue entrenado permiten comprobar condiciones de política y devolver decisiones con confianza.
- Extracción de decisiones en pipelines de baja latencia: con 3,3 ms p50 para una pregunta y estado corto, encaja en servicios que necesitan clasificación calibrada en tiempo real.
- Selección entre conjuntos grandes de herramientas o rutas: probado hasta 1.000 opciones en BFCL (0,293 de precisión en ese extremo), útil para preselección previa a un modelo mayor.

## Benchmarks y rendimiento

Resultados de precisión sobre conjuntos de test fijos (≤ 2.000 decisiones por conjunto, semilla 0; en typed-decisions, las 2.000 decisiones de test). Las líneas base responden cada pregunta como una elección entre sus opciones (2 a 24 opciones; "n/a" indica más opciones de las que permite su interfaz). Jev 1.13 medido el 2026-09-25.

| Conjunto de test | Este modelo | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0,536 (n=2000) | 0,741 | 0,353 | 0,737 | 0,690 | 0,393 |
| AG News | 0,730 (n=2000) | 0,882 | 0,924 | 0,922 | 0,886 | 0,354 |
| Emotion | 0,549 (n=2000) | 0,595 | 0,597 | 0,603 | 0,583 | 0,281 |
| SST-5 | 0,394 (n=2000) | 0,579 | 0,341 | 0,463 | 0,533 | 0,273 |
| Banking77 | 0,425 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| MASSIVE-en | 0,529 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| BFCL native | 0,932 (n=1252) | 0,975 | 0,679 | 0,847 | 0,954 | 0,694 |
| BFCL 24 opciones | 0,917 (n=1909) | 0,969 | 0,600 | 0,741 | 0,950 | 0,625 |
| BFCL 100 opciones | 0,775 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL 1.000 opciones | 0,293 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL irrelevance | 0,611 (n=1101) | 0,702 | 0,788 | 0,390 | 0,701 | 0,661 |
| Adversarial (propio) | 0,815 (n=2000) | 0,832 | 0,619 | 0,628 | 0,793 | 0,449 |

Latencia (una H100, bf16, peticiones batch-1, gráficos CUDA), p50 en milisegundos:

| Estado / preguntas | Este modelo (p50 ms) | Laya typed-decisions, todas las preguntas en una llamada (p50 ms) |
|---|---|---|
| corto (≤64 tokens) / 1 | 3,3 | 15,9 |
| corto (≤64 tokens) / 5 | 6,8 | 17,9 |
| corto (≤64 tokens) / 20 | 21,4 | 21,4 |
| medio (200–400 tokens) / 1 | 4,9 | 16,9 |
| medio (200–400 tokens) / 5 | 15,2 | 17,7 |
| medio (200–400 tokens) / 20 | 47,9 | 41,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente. El tamaño del repositorio es de 1,0 GB, lo que sugiere pesos manejables en bf16 para un modelo recortado a 12 capas.
- GPU recomendadas: probado en una NVIDIA H100 80GB HBM3 con bf16 (torch 2.14.0+cu130). El autor no documenta otras GPU concretas.
- Inferencia en CPU: funciona, pero el autor la describe como lenta.
- Latencia esperada en el setup probado: aproximadamente 35 ms sin gráficos CUDA y unos 6 ms con ellos para una petición corta de una pregunta. Otras GPU pueden diferir.
- Dependencias críticas: `transformers>=5.17.0`, `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0` (este último requiere compilar contra el torch/CUDA instalado y necesita `nvcc`). Sin los kernels rápidos, `transformers` cae silenciosamente en una implementación lenta en PyTorch puro y una petición de una pregunta puede tardar cientos de milisegundos.
- Opciones de despliegue: el uso documentado es mediante `huggingface_hub.snapshot_download` y la clase `OD1Model` del propio repositorio, con `enable_cuda_graphs()` y calentamiento previo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

Comparativa basada en los datos aportados por el autor (no hay cifras verificadas de forma independiente). Todos los sistemas se midieron sobre los mismos conjuntos fijos.

| Sistema | Parámetros | Contexto | BFCL native (precisión) | SST-5 (precisión) | Latencia corta 1 pregunta (p50) | Licencia |
|---|---|---|---|---|---|---|
| OD-1 Nano v2 lite | no disponible (12 capas de Qwen3.5-0.8B) | no disponible | 0,932 | 0,394 | 3,3 ms | apache-2.0 |
| Jev 1.13 | no disponible | no disponible | 0,975 | 0,579 | no disponible | no disponible |
| Laya typed-decisions | no disponible | no disponible | 0,847 | 0,463 | 15,9 ms | no disponible |
| Tev1-4B | 4B (según nomenclatura) | no disponible | 0,954 | 0,533 | no disponible | no disponible |
| CLM-8B | 8B (según nomenclatura) | no disponible | 0,694 | 0,273 | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión limitada en tareas no familiares: el autor indica que queda muy por debajo de los mejores sistemas cerrados en la tabla de resultados.
- El resultado `NOT_ANSWERABLE` solo se devuelve por encima del umbral ajustado en `serving.json`; por debajo, el modelo responde igualmente.
- Solo inglés: no hay soporte multilingüe documentado.
- Las puntuaciones en typed-decisions miden el acuerdo con su profesor de etiquetado (ver la ficha del dataset), no una verdad de referencia independiente.
- Las líneas base se invocaron mediante una interfaz envuelta en elección (el checkpoint de Laya typed-decisions también de forma nativa), lo que puede subestimarlas. No se ejecutó ninguna referencia de LLM frontera.
- Riesgo de alucinación: no se documenta ni se cuantifica explícitamente; al ser un modelo de decisión con distribución de probabilidad, la incertidumbre se expresa vía confianza, pero no se detallan garantías.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Sin los kernels `flash-linear-attention` y `causal-conv1d` instalados correctamente, el rendimiento se degrada drásticamente (de milisegundos a cientos de milisegundos por petición).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los conjuntos de datos de entrenamiento documentadas en `sources.csv` antes de un despliegue en producción.
- El modelo base declarado (Qwen/Qwen3.5-0.8B) es una referencia poco habitual en el ecosistema público; conviene verificar su disponibilidad y términos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvbalaji/od1-nano-v2-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper OpenDecide-1: en preparación (no disponible)
