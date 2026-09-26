# shgao/rsi-jev-v1.0-qwen3.5-0.8b

## Resumen

RSI-Jev v1.0 (checkpoint de 0,8B) es un modelo de decisión tipada desarrollado por el autor independiente shgao dentro del proyecto RSI-Jev. No es un modelo generativo al uso: parte de `Qwen/Qwen3.5-0.8B-Base`, al que se le ha ajustado la torre completa (salvo el embedding de entrada, congelado) y se le ha añadido una cabeza de puntuación de opciones de 7,3 M de parámetros. Dado un documento y un conjunto de preguntas tipadas (sí/no, elegir una entre k, puntuar según una rúbrica), devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto.

El problema que resuelve es el de las decisiones estructuradas y repetibles sobre documentos: en lugar de pedir a un LLM que "responda" y parsear su salida, el modelo produce directamente una distribución de probabilidad sobre las opciones declaradas, lo que permite umbrales, calibración y agregación. Es relevante para pipelines de evaluación automática, moderación, enrutado y etiquetado, donde se necesita una señal numérica estable y barata de ejecutar.

El modelo se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 2,0 GB y orientado a `text-classification`. Forma parte de una familia con dos tamaños (0,8B y 2B) y se entrenó mediante un bucle de investigación autónomo, por lo que el autor pide explícitamente retroalimentación sobre fallos. El checkpoint publicado es la semilla 17, fijada de antemano como primaria, no la mejor de las tres semillas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B-Base) con cabeza de cross-attention `option_xattn` para puntuación de opciones |
| Parametros totales | ~0,8B (modelo base); 505 M de pesos de torre entrenados a la escala 0,8B, más 7,3 M de la cabeza de puntuación |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio se carga mediante `load_release` tras `snapshot_download`; la model card no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo combina una torre transformer de tipo decoder (Qwen3.5-0.8B-Base) con una cabeza de cross-attention denominada `option_xattn`. En esa cabeza, el estado oculto en la señal de decisión actúa como query, mientras que las representaciones de las opciones (mean-pooled) actúan como claves y valores; el resultado atendido se proyecta a un logit por opción. Al atender sobre todo el conjunto de opciones, el logit de una opción depende de contra qué compite, lo que permite modelar decisiones relativas. La torre se ajusta completa excepto el embedding de entrada, que permanece congelado.

El entrenamiento usa el dataset `n4ze3m/typed-decisions-synth`, con 6.977 documentos que incluyen la distribución completa del profesor para cada pregunta. El objetivo es entropía cruzada suave sobre esas distribuciones, con las opciones mezcladas en cada ejemplo. El calendario es de 1.500 pasos con batch 16, learning rate 5e-6 coseno para la torre y 1e-4 constante para la cabeza, con precisión bf16 con autocast en la torre más gradient checkpointing y maestro fp32, y la cabeza en fp32 fuera de autocast. El coste indicado es de aproximadamente 10 minutos por semilla en una H100 para la variante de 0,8B. La pila de kernels es `fla-0.5.2 / torch-2.7.1+cu128`, y el autor advierte que las cifras solo son comparables dentro de esa misma pila.

Cuatro decisiones de diseño surgieron de fallos previos documentados: ajustar la torre en lugar de congelarla (todas las variantes congeladas se estancaban por debajo de la línea base de mayoría), mantener la cabeza en fp32 fuera de autocast, mezclar las opciones por ejemplo (un encoder causal solo ve las opciones 1…k−1, y una cabeza entrenada con orden fijo colapsa sobre la posición) y usar tres semillas (17, 29, 43) porque la desviación típica entre semillas es de 0,011. El conjunto de evaluación está completamente reservado y verificado: ningún documento de entrenamiento comparte estado ni una frase de 12 palabras con los splits de entrenamiento o test del benchmark.

## Capacidades

- Decisión de tipo `noul` (sí/no): devuelve P(true) para una pregunta binaria sobre un documento.
- Decisión de tipo `choice` (elegir una entre k opciones nombradas): devuelve una probabilidad por opción.
- Decisión de tipo `score` (puntuar según una rúbrica de 2 a 10 niveles): devuelve una probabilidad por nivel y su esperanza.
- Respuesta en un único forward pass, sin generación de texto ni decodificación autorregresiva.
- Salida calibrada y estructurada, agregable por umbral o por comparación de probabilidades.
- Procesamiento de múltiples preguntas tipadas sobre un mismo documento.
- Exposición mediante la API HTTP de Jev (`/api`), con código de carga y servidor en el repositorio del proyecto.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Moderación de contenido con decisión binaria: usar preguntas de tipo `noul` sobre publicaciones o mensajes para obtener P(true) de incumplimiento y aplicar un umbral ajustable; la calibración permite fijar el punto de corte según la tasa de falsos positivos tolerada.
- Evaluación automática de respuestas de otros modelos con rúbrica: plantear preguntas de tipo `score` de 2 a 10 niveles para obtener una distribución y su esperanza, útil como juez automático en pipelines de evaluación de LLMs.
- Clasificación de tickets de soporte: formular preguntas de tipo `choice` con las categorías del sistema de tickets para obtener una probabilidad por categoría y enrutar según la más alta o derivar a revisión humana si ninguna supera un umbral.
- Enrutado en pipelines de agentes: decidir en un único forward pass si una consulta requiere recuperación, cálculo, herramienta o respuesta directa, sustituyendo una llamada generativa por una clasificación barata.
- Etiquetado y supervisión débil de datos: usar las probabilidades por opción como etiquetas suaves para entrenar o auditar otros clasificadores, aprovechando que el objetivo original es la distribución completa del profesor.
- Verificación de cumplimiento normativo: preguntas binarias sobre contratos, políticas o documentos internos para comprobar la presencia o ausencia de cláusulas concretas.
- Re-ranking de opciones candidatas: comparar las probabilidades asignadas a varias alternativas (nombres, categorías, respuestas) y ordenarlas dentro de un sistema de recuperación o recomendación.
- Triaje de revisión humana: usar la distribución de probabilidad para separar los casos de alta confianza de los ambiguos, dedicando el esfuerzo humano solo a estos últimos.

## Benchmarks y rendimiento

Datos publicados en la model card para este checkpoint (semilla 17):

| Metrica | Valor |
|---|---|
| Typed-decisions | 0,6175 |
| Orden de opciones invertido | 0,621 |
| MMLU-Pro 1k | 0,269 |
| Reproduccion de su ejecucion de entrenamiento | 1,0000 |

Resultados agregados de la familia en el conjunto de test `LocalLLaMA/typed-decisions` (400 documentos, 2.000 decisiones), con pooled top-1:

| Modelo | Pooled top-1 |
|---|---|
| RSI-Jev-v1.0-2B | 0,662 |
| RSI-Jev-v1.0-0.8B | 0,614 |
| Linea base de mayoria | 0,5185 |
| Jev | 0,727 |

Resultados por checkpoint en la tabla de la model card (familia completa):

| Modelo | Base | Tal cual | Opciones invertidas | MMLU-Pro 1k |
|---|---|---|---|---|
| RSI-Jev-v1.0-2B | Qwen3.5-2B-Base | 0,6525 | 0,6525 | 0,3550 |
| RSI-Jev-v1.0-0.8B | Qwen3.5-0.8B-Base | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

Nota: la model card presenta 0,6175 para este checkpoint concreto y 0,614 para la variante de 0,8B en el conjunto de test; la diferencia está dentro de la desviación típica entre semillas de 0,011 que el propio autor documenta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 0,8B de parámetros, los pesos en bf16/fp16 ocupan aproximadamente 1,6 GB; el repositorio completo es de 2,0 GB.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM (RTX 3060, 4060, 4090 y superiores) debería poder alojar el modelo; el entrenamiento documentado se realizó en una H100, con unos 10 minutos por semilla para la variante de 0,8B.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con 4 GB o más de VRAM, e incluso en CPU, aunque esto no se confirma en la información disponible.
- Opciones de despliegue: carga mediante `load_release` del repositorio (Python, `snapshot_download` + `sys.path.insert(0, 'code')`) y servidor HTTP de Jev descrito en `serve/README.md`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal es de entrenamiento (~10 min/seed por 1.500 pasos en H100 para 0,8B), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Contexto | Pooled top-1 (typed-decisions) | MMLU-Pro 1k | Licencia |
|---|---|---|---|---|---|---|
| RSI-Jev-v1.0-0.8B (este) | ~0,8B | Distribucion por opcion, un forward pass | no disponible | 0,614 (0,6175 en semilla 17) | 0,269 | apache-2.0 |
| RSI-Jev-v1.0-2B | ~2B | Distribucion por opcion, un forward pass | no disponible | 0,662 | 0,3550 | apache-2.0 |
| Jev | no disponible | no disponible | no disponible | 0,727 | no disponible | no disponible |
| Qwen3.5-0.8B-Base | ~0,8B | Generacion de texto | no disponible | no aplica (no es modelo de decision) | no disponible | no disponible |
| Linea base de mayoria | no aplica | Etiqueta mayoritaria | no aplica | 0,5185 | no aplica | no aplica |

No se dispone de información sobre otros modelos de decisión tipada comparables fuera de la propia familia RSI-Jev.

## Limitaciones y advertencias

- El propio autor advierte que los modelos se entrenan mediante un bucle de investigación autónomo y solicita que se reporten los fallos, especialmente los casos en los que el modelo se equivoca con alta confianza.
- Riesgo de alucinación: al no generar texto, el riesgo no es de invención lingüística, pero sí de asignar alta probabilidad a una opción incorrecta, lo que puede ser más difícil de detectar que un texto erróneo.
- El rendimiento depende de la pila de kernels: las cifras solo son comparables dentro de `fla-0.5.2 / torch-2.7.1+cu128`.
- Variabilidad entre semillas: la desviación típica entre las tres semillas (17, 29, 43) es de 0,011, por lo que diferencias menores a esa cifra no son significativas.
- El checkpoint publicado es la semilla 17, fijada de antemano como primaria, no la mejor de las tres evaluadas.
- Sensibilidad al orden de las opciones: aunque el modelo se entrenó con opciones mezcladas y mantiene el rendimiento con el orden invertido (0,621 frente a 0,6175), un encoder causal solo ve las opciones previas, y el autor documenta que una cabeza entrenada con orden fijo colapsa sobre la posición.
- Idiomas soportados: no disponibles. No se declara cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base puede tener sus propias condiciones que conviene verificar por separado.
- Datos de benchmark limitados: MMLU-Pro 1k con 0,269 sugiere un rendimiento bajo en conocimiento general, coherente con un modelo especializado en decisión y no en conocimiento.
- No se declaran capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse que las tenga.
- Cero descargas y cero "likes" en el momento de la consulta: no hay validación comunitaria independiente del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shgao/rsi-jev-v1.0-qwen3.5-0.8b
- Discusiones del repositorio: https://huggingface.co/shgao/rsi-jev-v1.0-qwen3.5-0.8b/discussions
- Repositorio del proyecto (código, registro de la release y experimentos): https://github.com/Shanghua-Gao/RSI-Jev
- README raíz del proyecto: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/README.md
- Documentación del código de entrenamiento y receta de reproducción: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/rsijev/README.md
- Documentación del servidor HTTP: https://github.com/Shanghua-Gao/RSI-Jev/blob/main/serve/README.md
- API HTTP de Jev: https://docs.typesafe.ai/api
- Checkpoint hermano de 2B: https://huggingface.co/shgao/rsi-jev-v1.0-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/n4ze3m/typed-decisions-synth
- Conjunto de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
