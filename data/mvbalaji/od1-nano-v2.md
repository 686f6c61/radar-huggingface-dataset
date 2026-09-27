# mvbalaji/od1-nano-v2

## Resumen

OD-1 Nano v2 es un modelo de decisión de tipo *System One* desarrollado por el usuario mvbalaji dentro del proyecto opendecide. No es un generador de texto: recibe un estado (texto libre o JSON) junto con preguntas tipadas (`choice` para elección entre opciones, `noul` para sí/no y `score` para valores ordinales) y devuelve cada respuesta acompañada de su distribución de probabilidad completa, además de un resultado explícito `NOT_ANSWERABLE` cuando ninguna opción es aplicable. La salida sigue el formato `/v1/systemone` de Jev / TypeSafe.

Técnicamente se construye sobre el backbone Qwen3.5-0.8B, al que se añaden cabezas tipadas OD-1, salidas tempranas (early exits) y una cabeza contrastiva de lista corta (shortlist). El backbone es un transformer híbrido que combina capas de atención completa con capas de atención lineal basadas en regla delta con compuertas. Con 0,8B parámetros y licencia Apache 2.0, el modelo está pensado para decisiones rápidas y calibradas en inglés, en modo zero-shot, sobre tareas para las que no ha sido entrenado específicamente.

Su relevancia práctica está en el binomio latencia calibración: en una H100 con bf16, batch-1 y CUDA graphs, una petición corta de una sola pregunta se resuelve en 5,8 ms de mediana (p50), frente a los 15,9 ms de Laya typed-decisions. Es la versión v2 de od1-nano y sustituye a la v1 en cualquier escenario no familiar, tras corregir el comportamiento zero-shot con menos ejemplos sintéticos de `NOT_ANSWERABLE`, datos JSON estructurados verificados por profesor y un umbral de abstención ajustado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa combinada con capas de atención lineal de regla delta con compuertas (gated delta-rule), sobre backbone Qwen3.5; cabezas tipadas OD-1, early exits y cabeza contrastiva de shortlist |
| Parámetros totales | 0,8B (según la denominación del modelo y su backbone Qwen3.5-0.8B) |
| Longitud de contexto | no disponible (los ejemplos de evaluación usan estados cortos de ≤64 tokens y medios de 200-400 tokens) |
| Tipos de cuantización | no disponible; los pesos se cargan en bf16 mediante `OD1Model.load(path, dtype='bf16', device='cuda')`. No se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,0 GB, biblioteca `transformers`) |
| Tarea declarada (pipeline) | `text-classification` |
| Modelo base | Qwen/Qwen3.5-0.8B (fine-tuning) |
| Formato de salida | Distribuciones de probabilidad por pregunta tipada, con resultado explícito `NOT_ANSWERABLE`, en el esquema Jev / TypeSafe `/v1/systemone` |
| Requisitos de software | `transformers>=5.17.0`, `flash-linear-attention==0.5.2`, `causal-conv1d==1.7.0`, `torch` (probado con 2.14.0+cu130) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-0.8B, cuyo diseño mezcla capas de atención completa con capas de atención lineal basadas en regla delta con compuertas. Sobre ese backbone se injertan tres componentes propios de OD-1: cabezas tipadas que producen distribuciones sobre las opciones de cada tipo de pregunta, mecanismos de salida temprana para reducir el coste de cómputo en decisiones sencillas, y una cabeza contrastiva de shortlist que reduce el espacio de candidatos cuando el número de opciones es elevado. El modelo aplica además un umbral de `NOT_ANSWERABLE` ajustado y almacenado en `serving.json`, de modo que la abstención solo se emite por encima de ese umbral.

La v2 se reentrenó con la denominada *zero-shot fix*: menos etiquetas de oro sintéticas de `NOT_ANSWERABLE`, datos JSON estructurados verificados por un profesor y selección de checkpoints sobre un conjunto de validación fuera de dominio. Los datos de entrenamiento combinan conjuntos de datos con licencias abiertas (documentados en `sources.csv` con dataset, revisión, licencia, split y recuentos), comprobaciones sintéticas de políticas generadas por el proyecto y flujos de trabajo JSON estructurados verificados por profesor, escritos por Qwen3.5-27B-FP8 sin acceso a datos de benchmark, con etiquetas de destilación del profesor. Los conjuntos de evaluación se mantuvieron fuera del entrenamiento. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas sobre texto o JSON: preguntas de elección (`choice`), binarias (`noul`) y ordinales (`score`).
- Devolución de distribuciones de probabilidad completas por respuesta, útil para umbralizar, agregar o usar como etiquetas blandas.
- Abstención explícita mediante el resultado `NOT_ANSWERABLE`, regulada por un umbral ajustado.
- Calibración: en el split de test de typed-decisions obtiene KL 0,545 y Brier 0,259 con exactitud 0,558.
- Manejo de listas de opciones grandes: evaluación en BFCL con 24, 100 y 1.000 opciones.
- Detección de irrelevancia de la pregunta respecto al estado (BFCL irrelevance, 0,583).
- Robusteza ante entradas adversarias: 0,825 en el conjunto adversarial propio.
- Clasificación multietiqueta de textos cortos en inglés: noticias (AG News), emoción (Emotion), sentimiento ordinal (SST-5), intenciones bancarias (Banking77) y dominios de voz (MASSIVE-en).
- Inferencia de baja latencia con CUDA graphs y kernels rápidos de atención lineal.
- No soporta generación de texto libre, visión, audio ni capacidades multilingües: el modelo es exclusivamente en inglés y orientado a clasificación/decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: el estado es el texto del ticket y la pregunta es de tipo `choice` con criterios (`billing` → pagos, `tech` → errores). En el smoke test del propio repositorio el modelo devuelve `billing` con confianza 0,988, lo que permite automatizar el triaje sin reglas manuales.
- Decisión sobre estados JSON de negocio: con un JSON como estado, el modelo responde a preguntas como la elegibilidad de un reembolso (`refund`: 0,9945 con confianza 0,994) o el nivel de urgencia (`urgency`: 3 con confianza 0,524), lo que encaja en motores de políticas y flujos de aprobación.
- Clasificación ordinal de encuestas y satisfacción: con preguntas `score`, el modelo devuelve la escala completa con su distribución, de modo que se puede analizar no solo la respuesta más probable sino la incertidumbre asociada, útil en NPS o estudios de sentimiento de cinco niveles (SST-5, 0,406).
- Selección de herramientas en agentes: en BFCL nativo obtiene 0,935 y con 24 opciones 0,928, por lo que puede actuar como cabeza de decisión que elige qué función invocar; con 100 opciones baja a 0,835 y con 1.000 a 0,425, lo que marca el rango razonable de uso.
- Filtrado y abstención en producción: la combinación de preguntas `noul` con el umbral de `NOT_ANSWERABLE` permite descartar casos dudosos y derivarlos a revisión humana, en lugar de forzar una etiqueta incorrecta.
- Moderación y detección de irrelevancia: en BFCL irrelevance obtiene 0,583, suficiente como primera capa de filtrado para descartar preguntas que no se pueden responder con el estado disponible antes de llamar a un sistema mayor.
- Clasificación de intenciones en banca y asistentes de voz: 0,501 en Banking77 y 0,633 en MASSIVE-en, aprovechables para prototipado rápido de intents cuando no se dispone de datos etiquetados propios.
- Generación de etiquetas blandas para destilación: al devolver distribuciones completas, el modelo puede producir datos de entrenamiento con incertidumbre calibrada (Brier 0,259) para modelos menores o para reglas de negocio.
- Decisiones en tiempo real de alto volumen: con 5,8 ms p50 para una pregunta corta en H100 y 11,2 ms para cinco preguntas, el modelo es apto para enrutado síncrono dentro de una API, siempre que se instalen los kernels rápidos.
- Evaluación de pipelines existentes contra un modelo calibrado: sirve como referencia de comparación en conjuntos internos gracias a la documentación explícita de sus métricas y de su umbral de abstención.

## Benchmarks y rendimiento

Exactitud en conjuntos de test reservados, con las mismas muestras fijas para todos los sistemas (≤ 2.000 decisiones por conjunto, semilla 0; en typed-decisions, las 2.000 decisiones de test). Las referencias responden cada pregunta como una única elección sobre sus opciones (2-24 opciones; n/a indica más opciones de las que permite su interfaz). Jev 1.13 se midió el 25/09/2026.

| Conjunto de test | Este modelo | Jev 1.13 | Laya | Laya typed-decisions | Tev1-4B | CLM-8B |
|---|---|---|---|---|---|---|
| typed-decisions | 0,558 (n=2000) | 0,741 | 0,353 | 0,737 | 0,690 | 0,393 |
| AG News | 0,761 (n=2000) | 0,882 | 0,924 | 0,922 | 0,886 | 0,354 |
| Emotion | 0,554 (n=2000) | 0,595 | 0,597 | 0,603 | 0,583 | 0,281 |
| SST-5 | 0,406 (n=2000) | 0,579 | 0,341 | 0,463 | 0,533 | 0,273 |
| Banking77 | 0,501 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| MASSIVE-en | 0,633 (n=2000) | n/a | n/a | n/a | n/a | n/a |
| BFCL native | 0,935 (n=1252) | 0,975 | 0,679 | 0,847 | 0,954 | 0,694 |
| BFCL 24 opciones | 0,928 (n=1909) | 0,969 | 0,600 | 0,741 | 0,950 | 0,625 |
| BFCL 100 opciones | 0,835 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL 1.000 opciones | 0,425 (n=1909) | n/a | n/a | n/a | n/a | n/a |
| BFCL irrelevance | 0,583 (n=1101) | 0,702 | 0,788 | 0,390 | 0,701 | 0,661 |
| Adversarial (propio) | 0,825 (n=2000) | 0,832 | 0,619 | 0,628 | 0,793 | 0,449 |

Métricas de calibración en el split de test de typed-decisions, calculadas con las fórmulas de la tarjeta del benchmark (KL respecto al oro blando y Brier verificados contra las filas de referencia):

| Sistema | Exactitud | KL | Brier |
|---|---|---|---|
| Este modelo (generalista, zero-shot) | 0,558 | 0,545 | 0,259 |
| TypeSafe Jev 1.13 (generalista) | 0,727 | 1,442 | 0,148 |
| meraGPT Decider 1 (generalista) | 0,768 | 0,096 | 0,052 |

Latencia en una H100, bf16, peticiones batch-1 con CUDA graphs (p50 en milisegundos):

| Estado / preguntas | Este modelo (p50 ms) | Laya typed-decisions, todas las preguntas en una llamada (p50 ms) |
|---|---|---|
| Corto (≤64 tokens) / 1 | 5,8 | 15,9 |
| Corto (≤64 tokens) / 5 | 11,2 | 17,9 |
| Corto (≤64 tokens) / 20 | 34,1 | 21,4 |
| Medio (200-400 tokens) / 1 | 8,6 | 16,9 |
| Medio (200-400 tokens) / 5 | 24,9 | 17,7 |
| Medio (200-400 tokens) / 20 | 106,8 | 41,4 |

## Requisitos de hardware

- VRAM estimada: partiendo de los 0,8B parámetros del backbone, los pesos en bf16 ocupan aproximadamente 1,6 GB; el repositorio completo pesa 3,0 GB, por lo que hay que contar con espacio adicional para cabezas, checkpoints y ficheros de configuración. La memoria total en inferencia dependerá de la longitud del estado y del número de preguntas; no se publican cifras medidas de VRAM.
- GPU recomendadas: el autor ha validado el modelo en una NVIDIA H100 80GB HBM3 con bf16, torch 2.14.0+cu130, transformers 5.17.0, flash-linear-attention 0.5.2 y causal-conv1d 1.7.0. No se documentan pruebas en otras GPU concretas.
- GPU de consumo: por tamaño, un modelo de 0,8B en bf16 debería caber holgadamente en tarjetas de consumo modernas (por ejemplo, RTX 4090 o similares con 8 GB o más), pero el autor no publica medidas en esas GPU y la latencia variará. Es imprescindible compilar `causal-conv1d` contra el CUDA y el torch locales (requiere `nvcc`).
- Aceleración obligatoria: si no se instalan `flash-linear-attention` y `causal-conv1d`, `transformers` cae silenciosamente en una implementación de referencia en PyTorch puro de las capas de atención lineal y una petición de una sola pregunta pasa de unos pocos milisegundos a cientos de milisegundos.
- CPU: la inferencia funciona, pero es lenta según la propia documentación.
- Opciones de despliegue: carga directa con `transformers` y el código propio del repositorio (`od1.model.OD1Model`, que aplica `serving.json`), con `m.enable_cuda_graphs()`. El repositorio está marcado como `endpoints_compatible`, por lo que es compatible con Hugging Face Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: en el setup de referencia, unos 35 ms sin CUDA graphs y unos 6 ms con CUDA graphs para una petición corta de una pregunta. La tabla de velocidades da p50 de 5,8 ms (1 pregunta corta), 34,1 ms (20 preguntas cortas) y 106,8 ms (20 preguntas sobre estados medios).
- Calentamiento: es necesario ejecutar al menos cinco peticiones antes de medir, para permitir el autotuning de kernels y la captura de grafos por forma de entrada.

## Comparativa con modelos similares

Todos los sistemas de la tabla son generalistas evaluados en los mismos conjuntos. Los recuentos de parámetros, longitudes de contexto y licencias de los sistemas comparados no aparecen en la información disponible (el nombre "Tev1-4B" sugiere un tamaño de 4B, pero no se confirma en la documentación).

| Sistema | Tipo | Parámetros | Contexto | Exactitud en typed-decisions | Exactitud en BFCL native | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| od1-nano-v2 | Modelo de decisión tipado | 0,8B | no disponible | 0,558 | 0,935 | Apache 2.0 | Hugging Face (0 descargas, 0 likes en la fecha de consulta) |
| Jev 1.13 | Generalista | no disponible | no disponible | 0,741 | 0,975 | no disponible | no disponible |
| Laya typed-decisions | Generalista con checkpoint tipado | no disponible | no disponible | 0,737 | 0,847 | no disponible | no disponible |
| Tev1-4B | Generalista | no disponible | no disponible | 0,690 | 0,954 | no disponible | no disponible |
| CLM-8B | Generalista | no disponible | no disponible | 0,393 | 0,694 | no disponible | no disponible |
| meraGPT Decider 1 | Generalista | no disponible | no disponible | 0,768 (exactitud); KL 0,096; Brier 0,052 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- En tareas no familiares la exactitud queda claramente por debajo de los mejores sistemas cerrados: 0,558 en typed-decisions frente a 0,741 de Jev 1.13 y 0,737 de Laya typed-decisions, y 0,406 en SST-5 frente a 0,579.
- El resultado `NOT_ANSWERABLE` solo se emite por encima del umbral ajustado almacenado en `serving.json`; con estados ambiguos el modelo puede verse forzado a elegir una opción en lugar de abstenerse.
- Solo inglés. No hay soporte multilingüe ni de otros idiomas, incluido el español.
- Las puntuaciones en typed-decisions miden el acuerdo con su profesor de etiquetado (véase la tarjeta del dataset), no una verdad objetiva independiente.
- Las referencias se llamaron a través de una interfaz envuelta en formato de elección (salvo el checkpoint typed-decisions de Laya, que se llamó nativamente), lo que puede infravalorarlas. No se ejecutó ninguna referencia de un LLM frontera.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a opciones incorrectas: en BFCL con 1.000 opciones la exactitud cae a 0,425 y en el conjunto de irrelevancia se queda en 0,583, por lo que conviene no usarlo como única capa en escenarios de muchas opciones.
- Dependencia fuerte de kernels específicos: sin `flash-linear-attention` y `causal-conv1d` correctamente instalados, la latencia se degrada en dos órdenes de magnitud sin aviso evidente más allá de un mensaje de fallback en los logs.
- El modelo requiere cargar código propio del repositorio (`snapshot_download` más `sys.path.insert`), lo que implica ejecutar código del autor; conviene revisarlo antes de desplegarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-0.8B conviene verificar las condiciones de la licencia del modelo base.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes, creado y actualizado el mismo día), por lo que no existe todavía validación independiente por parte de la comunidad.
- No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable porque el modelo no está orientado a generación de texto.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mvbalaji/od1-nano-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales. Los ficheros `sources.csv` (datasets de entrenamiento, revisión, licencia, split y recuentos), `serving.json` (umbral de `NOT_ANSWERABLE`) y `example.py` (prueba de humo) se distribuyen dentro del propio repositorio de Hugging Face.
