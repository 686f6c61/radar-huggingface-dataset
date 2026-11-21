# ManiShekhar/mini-clm

## Resumen

Mini CLM es un modelo contrastivo de pequeño tamaño desarrollado por ManiShekhar que reformula la evaluación de opciones como una tarea de similitud semántica en lugar de generación de texto. Dado un enunciado (situación más pregunta) y una lista de opciones, devuelve una probabilidad para cada opción en un único forward pass, sin decodificar tokens. Se construye sobre el backbone congelado Qwen/Qwen3-0.6B, al que se añaden dos cabezas MLP residuales entrenadas (una de estado y otra de acción), y se distribuye con un script propio (`clm.py`) en lugar de como modelo estándar de `transformers`.

El modelo es una reimplementación independiente a pequeña escala de la idea presentada en *Contrastive Language Models* (Kwok et al., Stanford / NVIDIA, 2026), y el propio autor advierte que no reproduce los resultados de dicho trabajo. Su interés actual es fundamentalmente metodológico: demuestra que con un backbone de 0,6 mil millones de parámetros congelado y un entrenamiento de solo las cabezas en una GPU de portátil de 6 GB se puede obtener una mejora modesta pero medible en tareas donde la respuesta comparte significado con la pregunta, como ARC-Easy o CommonsenseQA.

No obstante, el modelo no razona: rinde a nivel de azar en ARC-Challenge, no supera la heurística de "opción más larga" en RACE y queda por debajo de la línea base de respuesta mayoritaria en BoolQ. Es, por tanto, una pieza de investigación y experimentación, no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B congelado) con dos cabezas MLP residuales entrenadas (state head y action head), puntuación por similitud coseno |
| Parámetros totales | No disponible (backbone de 0,6B más cabezas de anchura 1024; el recuento exacto de las cabezas no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3-0.6B; no se declara explícitamente) |
| Tipos de cuantización | No disponible (el autor no documenta cuantizaciones; requiere GPU CUDA) |
| Idiomas soportados | No disponible (los datasets de entrenamiento son en inglés: Nemotron-CC Diverse-QA, SQuAD 1.1, neulab/adp-v2) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 0,1 GB con `clm.py` y `data/centering.npz`; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo mantiene el backbone Qwen/Qwen3-0.6B completamente congelado y entrena únicamente dos cabezas MLP residuales de anchura 1024 (`residual-v1`). La situación y cada opción se embeben con el backbone en modo `plain` (sufijo `\n\nAnswer:` para la situación, prefijo `Answer: ` para la opción), se agrupan con pooling de media y se centran restando los vectores medios almacenados en `data/centering.npz`. Cada embedding se ajusta con su cabeza correspondiente y la puntuación final es la similitud coseno entre el vector de estado y el de acción. Las cabezas son residuales con la última capa inicializada a cero, de modo que el modelo arranca como el backbone puro y aprende correcciones pequeñas. La receta de embedding está fijada con un identificador (`b390c0f5`) y `clm.py` rechaza checkpoints entrenados con otra receta o diseño de cabeza.

El entrenamiento se organiza en tres etapas con pérdida InfoNCE bidireccional y negativos duros tanto en batch como minados: etapa `pre` con pares pregunta/respuesta y 3 negativos duros por par (lr 3e-4), etapa `mid` con los mismos pares y hasta 10 negativos duros (lr 1e-4), y etapa `post` con pasos de agente (tarea e historial hacia la siguiente acción) mezclados con replay de Q&A (lr 5e-5). Los datos son todos públicos: una muestra de Nemotron-CC Diverse-QA y SQuAD 1.1 (CC BY-SA 4.0) para Q&A, y `neulab/adp-v2` para la etapa de agente. El entrenamiento se realizó en una GPU de portátil de 6 GB.

## Capacidades

- Puntuación de opciones: devuelve una probabilidad por opción en un único forward pass, sin generar texto.
- Ranking de respuestas: `scorer.rank(situation, options)` ordena dos o más opciones dada una situación y una pregunta.
- Puntuación por etapas: expone las probabilidades correspondientes a cada etapa de entrenamiento (`pre`, `mid`, `post`).
- Selección de acciones en agentes: la etapa `post` entrena pasos de agente (tarea e historial hacia la siguiente acción), alcanzando 89,4% en pares retenidos de la distribución de agente.
- Q&A de opción múltiple: 81,8% en pares Q&A retenidos con distractores aleatorios y 51,7% con distractores plausibles ("Tricky Q&A").
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni modo thinking.
- Entrada limitada a una situación, una pregunta y dos o más opciones; sin soporte de múltiples preguntas ni salida de puntuación numérica.

## Casos de uso

- Experimentación académica sobre modelos contrastivos: sirve como banco de pruebas reproducible de la idea de *Contrastive Language Models* con un backbone pequeño y un entrenamiento asequible en hardware de consumo.
- Clasificación de respuestas en pipelines de Q&A corto: dado un pasaje y una pregunta con candidatos predefinidos, puntuar cada candidato en un solo forward pass, útil cuando las opciones ya vienen dadas por otro sistema.
- Selección de siguiente acción en agentes simulados: la etapa `post` está entrenada con grabaciones de `neulab/adp-v2`, por lo que puede puntuar acciones candidatas en entornos de agente con historial, siempre que la tarea caiga dentro de la distribución de entrenamiento.
- Filtrado de distractores plausibles: usar la puntuación para descartar opciones poco probables antes de un paso de razonamiento más costoso con un modelo mayor.
- Evaluación de recetas de embedding: comparar el efecto de pooling, centrado y cabezas residuales sobre el rendimiento en benchmarks de opción múltiple.
- Docencia y demostraciones: ejemplo mínimo de cómo adaptar un backbone congelado con cabezas ligeras y negativos duros, ejecutable en una GPU de 6 GB.

## Benchmarks y rendimiento

Precisión zero-shot en benchmarks públicos de opción múltiple no vistos en entrenamiento (conjuntos de test o validación completos):

| Modelo / configuración | RACE | BoolQ | ARC-Easy | ARC-Challenge | CommonsenseQA |
|---|---|---|---|---|---|
| Azar | 25,0% | 50,0% | 25,0% | 25,0% | 20,0% |
| Siempre la opción más larga | 30,6% | 62,2% | 26,6% | 27,2% | 21,9% |
| Vectores del backbone congelado (sin cabezas) | 28,6% | 49,1% | 37,5% | 22,1% | 26,8% |
| Tras etapa 1 (`pre`) | 31,1% | 46,6% | 43,4% | 26,0% | 30,0% |
| Tras etapa 2 (`mid`) | 30,7% | 47,2% | 43,5% | 25,7% | 29,9% |
| Tras etapa 3 (`post`) | 30,5% | 45,8% | 44,0% | 25,9% | 31,5% |
| Preguntas / margen 95% | 4.934 / ±1,3 | 3.270 / ±1,7 | 2.376 / ±2,0 | 1.172 / ±2,5 | 1.221 / ±2,6 |

Pares retenidos de la distribución de entrenamiento (mismas fuentes, nunca entrenados):

| Etapa | Q&A (1 de 16) | Tricky Q&A | Agente (1 de 16) |
|---|---|---|---|
| `pre` | 81,6% | 52,3% | 52,7% |
| `mid` | 81,7% | 53,3% | 52,5% |
| `post` | 81,8% | 51,7% | 89,4% |

Lectura de los resultados según el autor: mejora de unos +6 puntos sobre el backbone congelado en ARC-Easy y unos +5 en CommonsenseQA; en ARC-Challenge rinde a nivel de azar, en RACE no supera la heurística de la opción más larga y en BoolQ queda por debajo del 62,2% de la línea base mayoritaria. Las tres etapas están dentro del margen de error entre sí en datos públicos.

## Requisitos de hardware

- GPU CUDA obligatoria: el autor indica explícitamente que se requiere una GPU CUDA y que el modelo no funciona como modelo estándar de `transformers`.
- VRAM estimada: no disponible con precisión; el entrenamiento se realizó en una GPU de portátil de 6 GB, por lo que la inferencia debería caber holgadamente en ese rango, aunque el autor no publica cifras de VRAM de inferencia.
- GPU recomendadas: no disponible. Por tamaño del backbone (0,6B) cabría en GPUs de consumo como RTX 3060/4060/4090, pero no se documenta compatibilidad ni rendimiento.
- Despliegue: únicamente mediante el script incluido `clm.py` (más `data/centering.npz`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini CLM (ManiShekhar) | Backbone 0,6B + cabezas | No disponible | Contrastivo, puntuación de opciones sin generación | No disponible | Hugging Face, requiere `clm.py` y GPU CUDA |
| Qwen3-0.6B (base) | 0,6B | No disponible en esta ficha | Generativo decoder-only | No disponible en esta ficha | Hugging Face, ecosistema `transformers` |
| *Contrastive Language Models* (Kwok et al., 2026) | No disponible | No disponible | Contrastivo a mayor escala | No disponible | Paper Stanford / NVIDIA; modelo no publicado en esta información |

No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoría más allá del backbone congelado sin cabezas, cuyos resultados se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- No razona: compara significado y no hace razonamiento paso a paso; preguntas aritméticas o que dependen de la ausencia de algo pueden recibir respuestas seguras pero incorrectas.
- Datos de entrenamiento estrechos (Q&A web y estilo Wikipedia, pasos de agente); juegos, políticas y tareas de scoring quedan fuera de distribución.
- Interfaz restringida: una situación, una pregunta y dos o más opciones; sin múltiples preguntas ni salida de puntuación numérica.
- Probabilidades no calibradas: no debe usarse donde un error tenga coste alto.
- Rendimiento a nivel de azar en ARC-Challenge y por debajo de la línea base mayoritaria en BoolQ.
- Licencia no disponible: es necesario revisar las licencias de los datasets de entrenamiento (Nemotron-CC Diverse-QA, SQuAD 1.1 CC BY-SA 4.0, `neulab/adp-v2`) antes de reutilizar el modelo.
- No es un modelo de `transformers`: requiere el script `clm.py` y una GPU CUDA; los checkpoints con otra receta o diseño de cabeza son rechazados.
- El propio autor advierte que es una reimplementación independiente y que no reproduce los resultados del trabajo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManiShekhar/mini-clm
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de referencia: Kwok et al., *Contrastive Language Models*, Stanford / NVIDIA, 2026 (no se proporciona URL en la información disponible)
- Dataset de agente: `neulab/adp-v2` (no se proporciona URL en la información disponible)
- Dataset SQuAD 1.1: no se proporciona URL en la información disponible
- Dataset Nemotron-CC Diverse-QA: no se proporciona URL en la información disponible
