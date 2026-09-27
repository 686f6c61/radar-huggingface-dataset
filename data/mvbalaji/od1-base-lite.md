# mvbalaji/od1-base-lite

## Resumen

OD-1 Base lite es un modelo de decisión ("System One") desarrollado por el usuario mvbalaji dentro del proyecto OpenDecide. No es un generador de texto conversacional: recibe un estado (texto libre o JSON) y un conjunto de preguntas tipadas (`choice` para elección entre opciones, `noul` para sí/no y `score` para respuestas ordinales) y devuelve cada respuesta acompañada de su distribución de probabilidad completa, además de un resultado explícito `NOT_ANSWERABLE`. La salida sigue el esquema `/v1/systemone` de Jev / TypeSafe.

Técnicamente es un finetune del backbone Qwen/Qwen3.5-4B, un transformer decoder-only híbrido que combina capas de atención completa con capas *gated delta-rule* (atención lineal). Este checkpoint concreto recorta el modelo a sus primeras 16 de 32 capas y responde con la cabeza de salida de la capa 16 para la que el modelo base ya estaba entrenado, sin entrenamiento adicional: el autor afirma que las respuestas son idénticas a las de OD-1 Base en esa capa, con aproximadamente la mitad del coste computacional.

Su relevancia es la de un clasificador-decisor calibrado y muy rápido (del orden de 6 ms p50 en una H100 con CUDA graphs para una pregunta corta), pensado para colocarse entre `od1-nano-v2` y `od1-base`: latencia cercana al modelo nano con precisión derivada del modelo base. El repositorio tiene 4,9 GB, licencia Apache 2.0, solo inglés y, en el momento de la consulta, cero descargas y cero *likes*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (atención completa + capas gated delta-rule / atención lineal), heredado de Qwen3.5-4B; checkpoint recortado a las primeras 16 de 32 capas con cabeza de salida de la capa 16 |
| Parametros totales | no disponible (deriva de Qwen/Qwen3.5-4B recortado a la mitad de capas; repositorio de 4,9 GB en bf16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en `bf16`; no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código Python propio (`od1.model.OD1Model`) y `transformers>=5.17.0` |
| Tarea declarada | `text-classification` (decisiones tipadas) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

El backbone Qwen3.5-4B mezcla capas de atención completa con capas *gated delta-rule* (atención lineal con regla delta con puerta). Según el autor, instalar los kernels rápidos es obligatorio para que la inferencia sea viable: `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0`. Si no están presentes, `transformers` cae silenciosamente a una implementación de referencia en PyTorch puro y una petición de una sola pregunta pasa de unos pocos milisegundos a cientos de milisegundos. El modelo expone `enable_cuda_graphs()` para capturar grafos CUDA tras un calentamiento de unas cinco iteraciones.

El checkpoint `od1-base-lite` no se ha entrenado por separado: se obtiene cortando OD-1 Base a sus primeras 16 capas y usando como cabeza de salida la de la capa 16 ya entrenada. En cuanto a datos, la model card indica que se usaron conjuntos de datos con licencias abiertas documentados en `sources.csv` (dataset, revisión, licencia, split y recuentos), comprobaciones sintéticas de políticas generadas por el proyecto y flujos de trabajo JSON estructurados verificados por profesor, escritos por Qwen3.5-27B-FP8 (que nunca actúa como sistema comparado y no tuvo acceso a datos de benchmark), con etiquetas de destilación del profesor. Los conjuntos de evaluación se mantuvieron fuera del entrenamiento, con deduplicación de 13-gramas contra cada conjunto de test. No se especifican el número total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Respuesta a preguntas tipadas: `choice` (selección entre 2 y muchas opciones), `noul` (sí/no) y `score` (ordinal).
- Devolución de distribuciones de probabilidad completas por respuesta, no solo la etiqueta ganadora, más un nivel de confianza.
- Resultado explícito `NOT_ANSWERABLE` cuando la confianza no supera el umbral ajustado en `serving.json`.
- Clasificación de texto: temas de noticias, emoción, sentimiento, intenciones y decisiones estructuradas.
- Selección de funciones / herramientas (function calling) evaluada sobre BFCL, incluida la detección de relevancia e irrelevancia.
- Procesamiento de estados en texto plano o JSON, con salida en el esquema `/v1/systemone` de Jev / TypeSafe.
- *System One* rápido: apto como primera etapa de una cascada de decisión.
- Sin capacidades multimodales, de audio, de generación libre de texto largo ni modo *thinking* documentadas.
- Multilingüismo: no, únicamente inglés.

## Casos de uso

- Enrutado de tickets de soporte: el propio ejemplo de la model card resuelve un estado con rutas `billing` y `tech` y devuelve `{"route": {"answer": "billing", "confidence": 0.98}}`. Es adecuado porque la pregunta es de elección cerrada y el modelo entrega la probabilidad, lo que permite derivar a revisión humana cuando baja.
- Clasificación de temas de noticias: con 0,841 de exactitud sobre AG News (n=2000), sirve para etiquetar y organizar flujos editoriales o corpus de investigación en categorías fijas.
- Análisis de sentimiento y emoción en reseñas: sobre SST-5 obtiene 0,448 y sobre Emotion 0,560, suficiente para agregados y monitorización de tendencias, no para decisiones individuales críticas.
- Selección de herramienta en agentes: 0,935 en BFCL nativo (n=1252) y 0,938 con 24 opciones, lo que permite elegir la función correcta en un pipeline de tool calling antes de invocar un LLM mayor.
- Filtro de irrelevancia previo a un LLM caro: con `NOT_ANSWERABLE` y umbral ajustado, se puede descartar consultas fuera de dominio (0,527 en BFCL irrelevance) y reservar el modelo grande para el resto.
- Triaje con umbral de confianza: al exponer distribuciones completas, un sistema puede escalar automáticamente a un humano o a un modelo mayor cuando la confianza cae por debajo de un valor, en lugar de aceptar la etiqueta top-1.
- Etiquetado de intenciones bancarias: con 0,364 en Banking77 (n=2000), solo es viable como señal auxiliar o en combinación con reglas y revisión.
- Extracción de decisiones de flujos JSON: la evaluación sobre el split `typed-decisions` (0,576 de exactitud, KL 0,470, Brier 0,228) apunta a su uso en la verificación estructurada de políticas y workflows generados.
- Detección de entradas adversarias: 0,863 sobre el conjunto adversario propio (n=2000), por encima de Jev 1.13 (0,832) y muy por encima de Laya (0,619) y CLM-8B (0,449).
- Inferencia de bajísima latencia en línea: con p50 de 5,6 ms para un estado corto y una pregunta en una H100, encaja en servicios síncronos con presupuesto de milisegundos.

## Benchmarks y rendimiento

Exactitud sobre conjuntos de test reservados. Muestras fijas para todos los sistemas (≤ 2.000 decisiones por conjunto, semilla 0; en `typed-decisions`, las 2.000 decisiones de test). Las líneas base responden cada pregunta como una única elección sobre sus opciones (2–24 opciones; `n/a` = más opciones de las que permite su interfaz). Jev 1.13 corresponde a `jev-1.13.0`, medido el 25/09/2026.

| Conjunto de test | Este modelo | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0,576 (n=2000) | 0,741 | 0,353 | 0,737 | 0,690 | 0,393 |
| AG News | 0,841 (n=2000) | 0,882 | 0,924 | 0,922 | 0,886 | 0,354 |
| Emotion | 0,560 (n=2000) | 0,595 | 0,597 | 0,603 | 0,583 | 0,281 |
| SST-5 | 0,448 (n=2000) | 0,579 | 0,341 | 0,463 | 0,533 | 0,273 |
| Banking77 | 0,364 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| MASSIVE-en | 0,539 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| BFCL native | 0,935 (n=1252) | 0,975 | 0,679 | 0,847 | 0,954 | 0,694 |
| BFCL 24 options | 0,938 (n=1909) | 0,969 | 0,600 | 0,741 | 0,950 | 0,625 |
| BFCL 100 options | 0,624 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL 1.000 options | 0,149 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL irrelevance | 0,527 (n=1101) | 0,702 | 0,788 | 0,390 | 0,701 | 0,661 |
| Adversarial (propio) | 0,863 (n=2000) | 0,832 | 0,619 | 0,628 | 0,793 | 0,449 |

Métricas adicionales sobre el split de test `typed-decisions`, calculadas con las fórmulas de la tarjeta del benchmark y con la KL y el Brier verificados contra sus filas de referencia (evaluación generalista y zero-shot):

| Sistema | Exactitud | KL | Brier |
|---|---|---|---|
| OD-1 Base lite | 0,576 | 0,470 | 0,228 |
| TypeSafe Jev 1.13 (referencia de la tarjeta) | 0,727 | 1,442 | 0,148 |
| meraGPT Decider 1 (referencia de la tarjeta) | 0,768 | 0,096 | 0,052 |

Latencia con una H100, bf16, peticiones de batch 1 y CUDA graphs:

| Estado / preguntas | Este modelo (p50, ms) | Laya typed-decisions, todas las preguntas en una llamada (p50, ms) |
|---|---|---|
| Corto (≤64 tokens) / 1 | 5,6 | 15,9 |
| Corto (≤64 tokens) / 5 | 14,5 | 17,9 |
| Corto (≤64 tokens) / 20 | 52,3 | 21,4 |
| Medio (200–400 tokens) / 1 | 8,6 | 16,9 |
| Medio (200–400 tokens) / 5 | 38,2 | 17,7 |
| Medio (200–400 tokens) / 20 | 62,3 | 41,4 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible; el modelo no es un generador y esas evaluaciones no aparecen en la model card.

## Requisitos de hardware

- Pesos en bf16 de 4,9 GB en el repositorio, lo que implica unos 5-6 GB de VRAM solo para los pesos; con activaciones, caché y espacio de trabajo de CUDA graphs, un presupuesto práctico de 8-12 GB es razonable, aunque el autor no publica cifras exactas de VRAM.
- Cabe con holgura en GPU de consumo: RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB), e incluso tarjetas de 8-10 GB con margen para batch 1.
- Configuración verificada por el autor: una NVIDIA H100 80GB HBM3, torch 2.14.0+cu130, transformers 5.17.0, flash-linear-attention 0.5.2 y causal-conv1d 1.7.0, en bf16.
- La inferencia en CPU funciona, pero es lenta según la propia model card.
- Kernels obligatorios para un rendimiento realista: `flash-linear-attention==0.5.2` y `causal-conv1d==1.7.0` (este último compila contra tu torch/CUDA y necesita `nvcc`). Sin ellos, `transformers` cae a la implementación de referencia y una petición de una pregunta tarda cientos de milisegundos.
- Latencia medida: aproximadamente 35 ms sin CUDA graphs y unos 6 ms con CUDA graphs para una petición corta de una pregunta en H100; el resto de GPU no está caracterizado en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp. El uso previsto es mediante `snapshot_download` de `huggingface_hub` y la clase propia `od1.model.OD1Model` sobre `transformers>=5.17.0`, con `enable_cuda_graphs()` y calentamiento previo a medir.

## Comparativa con modelos similares

No se dispone de especificaciones técnicas (parámetros, contexto, licencia) de los sistemas comparados, solo de su exactitud y latencia parcial en los conjuntos del autor.

| Modelo | Tipo | typed-decisions | BFCL native | BFCL irrelevance | Adversarial | Licencia y disponibilidad |
|---|---|---|---|---|---|---|
| OD-1 Base lite | Decisor calibrado, 16 de 32 capas de Qwen3.5-4B | 0,576 | 0,935 | 0,527 | 0,863 | Apache 2.0, safetensors en HuggingFace |
| Jev 1.13 / TypeSafe Jev 1.13 | Generalista (referencia medida el 25/09/2026) | 0,741 (0,727 por la tarjeta) | 0,975 | 0,702 | 0,832 | no disponible |
| Laya typed-decisions | Decisor tipado de Laya | 0,737 | 0,847 | 0,390 | 0,628 | no disponible |
| Tev1-4B | Modelo de 4B | 0,690 | 0,954 | 0,701 | 0,793 | no disponible |
| CLM-8B | Modelo de 8B | 0,393 | 0,694 | 0,661 | 0,449 | no disponible |
| meraGPT Decider 1 | Decisor generalista | 0,768 (exactitud de la tarjeta) | no disponible | no disponible | no disponible | no disponible |

En latencia, la alternativa documentada es Laya en su variante typed-decisions: OD-1 Base lite es entre 2 y 3 veces más rápido con una sola pregunta corta o media (5,6 ms frente a 15,9 ms; 8,6 ms frente a 16,9 ms), pero Laya gana cuando se agrupan 20 preguntas en una sola llamada (21,4 ms frente a 52,3 ms en estado corto). No se han ejecutado referencias de LLM frontera, según el autor.

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe documentado ni evaluación en otros idiomas.
- En tareas poco familiares la exactitud queda claramente por debajo de los mejores sistemas cerrados, y el propio autor lo señala en la tabla de resultados.
- Degradación severa con muchas opciones: BFCL baja de 0,938 con 24 opciones a 0,624 con 100 y a 0,149 con 1.000. No es utilizable para elección sobre catálogos grandes.
- El resultado `NOT_ANSWERABLE` solo se devuelve por encima del umbral ajustado en `serving.json`; la tasa de abstención depende por completo de esa calibración y no es un comportamiento robusto por defecto.
- Las puntuaciones en `typed-decisions` miden acuerdo con su profesor de etiquetado, no verdad objetiva, según la propia model card.
- Las líneas base se invocaron mediante una interfaz envuelta en formato de elección (Laya también de forma nativa en su checkpoint typed-decisions), lo que puede infravalorarlas; no se ejecutó ninguna referencia de LLM frontera.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar confianza alta a una opción incorrecta; el valor de confianza no está calibrado de forma universal fuera de los conjuntos descritos.
- Sesgos: no se documenta ninguna auditoría de sesgos en la información disponible.
- Licencia Apache 2.0 en este repositorio, pero no se detalla en la información disponible la licencia del modelo base Qwen/Qwen3.5-4B, que puede imponer condiciones adicionales para uso comercial.
- Requiere código personalizado (`od1.model.OD1Model`) descargado del propio repositorio, sin integración estándar en servidores de inferencia habituales; el fallo silencioso a la implementación lenta de PyTorch si faltan los kernels es un riesgo operativo real en producción.
- Madurez temprana: 0 descargas y 0 *likes* en el momento de la consulta, y el artículo asociado (OpenDecide-1) está en preparación, sin revisión por pares.
- No hay información sobre longitud de contexto soportada, cuantizaciones publicadas ni presupuesto de VRAM exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvbalaji/od1-base-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Kernel `flash-linear-attention`: https://pypi.org/project/flash-linear-attention/0.5.2/
- Kernel `causal-conv1d`: https://pypi.org/project/causal-conv1d/1.7.0/
- Archivo `sources.csv` (datasets, revisiones y licencias): referenciado en la model card del repositorio, URL directa no disponible
- Tarjeta del benchmark `typed-decisions` (fórmulas de KL y Brier, filas de referencia): referenciada en la model card, URL directa no disponible
- Artículo OpenDecide-1: en preparación, sin enlace disponible
- La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo: los resultados obtenidos eran páginas no relacionadas y no se incluyen.
