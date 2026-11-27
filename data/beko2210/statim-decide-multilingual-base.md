# Beko2210/statim-decide-multilingual-base

## Resumen

Statim Decide Multilingual Base es un modelo encoder de decisión tipada, desarrollado por Beko2210 como componente del motor nativo en C++ Statim. No es un modelo generativo: se le plantea un texto junto con una elección, una puntuación o una pregunta de sí/no, y devuelve una respuesta calibrada en un único forward pass, sin necesidad de Python en tiempo de ejecución. Está afinado a partir de `convaiinnovations/laya-multilingual`, un encoder mmBERT-base, y corresponde a la versión 0.10.0 del motor.

El modelo resuelve un problema acotado pero frecuente en producción: clasificación y enrutamiento de texto con etiquetas definidas en tiempo de inferencia (zero-shot classification), sin depender de un LLM generativo. Con 321.908.995 parámetros totales, cabe en CPU y en GPU de consumo, y se distribuye tanto en safetensors como en GGUF. Soporta 18 idiomas, entre ellos español, inglés, alemán, francés, portugués, árabe, hindi, japonés y chino.

Su relevancia actual radica en la combinación de coste de inferencia bajo (167 ms de mediana por petición en CPU de 4 hilos, 22 ms en una RTX 3070 con Vulkan) y un rendimiento en tareas de intención y clasificación que se acerca al de alternativas mucho mayores, aunque queda por detrás de Lev (4B con LoRA) y de Jev en el benchmark público S1Bench. La licencia es restrictiva: PolyForm Noncommercial 1.0.0, al haberse entrenado en parte con datos no comerciales o de licencia desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mmBERT-base (modelo base: convaiinnovations/laya-multilingual) |
| Parametros totales | 321.908.995 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye pesos GGUF); niveles concretos no disponibles |
| Idiomas soportados | ar, de, en, es, fr, hi, it, ja, pl, ru, tr, zh, id, ms, pt, nl, fa (18) |
| Licencia | statim-weights (PolyForm Noncommercial 1.0.0) |
| Formato de pesos | safetensors y GGUF |
| Pipeline | zero-shot-classification / text-classification |
| Tamano del repo | 5,8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo mmBERT-base, afinado desde `convaiinnovations/laya-multilingual`. La salida no es texto generado sino decisiones tipadas: el modelo recibe un texto y un conjunto de opciones (elección entre categorías, puntuación o pregunta binaria) y produce una respuesta calibrada en un solo forward pass. Esta formulación permite usar el modelo como clasificador zero-shot con etiquetas arbitrarias definidas en inferencia, en lugar de un conjunto fijo de clases.

El entrenamiento combina conjuntos de datos de intenciones y clasificación: PolyAI/banking77, AmazonScience/massive, LocalLLaMA/typed-decisions, tasksource/tasksource-jev-typed-decisions, nvidia/Nemotron-Safety-Guard-Dataset-v3, l3cube-pune/IndicGuard, PolyAI/minds14 y benayas/snips. No se detallan en la información disponible el número de tokens, la composición exacta ni si hubo etapas de RLHF o DPO; tampoco se especifican innovaciones de decodificación, al no tratarse de un modelo autoregresivo. El autor advierte que parte de los datos de entrenamiento son no comerciales, ShareAlike o de licencia desconocida, lo que condiciona la licencia de los pesos.

## Capacidades

- Clasificación zero-shot: permite definir las etiquetas candidatas en tiempo de inferencia, sin reentrenamiento.
- Decisiones tipadas: responde a preguntas de elección (qué categoría), de puntuación (qué valor) y de sí/no.
- Detección de intenciones en diálogo: evaluado en Banking77, MASSIVE, HWU64 y SNIPS.
- Clasificación de temas y sentimiento: evaluado en AG News, SIB-200 y un corpus multilingüe de sentimientos.
- Moderación y seguridad: entrenado con Nemotron-Safety-Guard-Dataset-v3 e IndicGuard; evaluado en HateCheck multilingüe.
- Multilingüismo: 18 idiomas con evaluación agregada en MASSIVE (12 idiomas) y otras suites multilingües.
- Calibración de confianza: el autor reporta un error de calibración medio (ECE) de 0,126 en S1Bench.
- Ejecución sin Python en runtime: integración con el motor C++ Statim en CPU o GPU.
- No soporta generación de texto libre, tool calling, agentes ni visión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada ticket contra un conjunto de colas o departamentos definidos en tiempo de inferencia; con 167 ms de mediana en CPU de 4 hilos, puede procesar un flujo continuo de tickets sin GPU.
- Detección de intención en asistentes conversacionales: entrenado sobre MASSIVE, Banking77 y SNIPS, puede mapear cada turno del usuario a una intención de un catálogo propio, con la ventaja de que las intenciones se pueden redefinir sin reentrenar.
- Moderación de contenido multilingüe: al haberse entrenado con datasets de seguridad y evaluarse en HateCheck en 11 idiomas, sirve como primera capa de filtrado de comentarios antes de escalar a un modelo mayor.
- Análisis de sentimiento en atención al cliente: clasificación de reseñas o mensajes en 12 idiomas con etiquetas de sentimiento, útil para paneles de calidad y alertas tempranas.
- Clasificación de noticias y contenidos: con 0,921 de accuracy zero-shot en AG News, puede etiquetar artículos por temática en pipelines editoriales sin entrenamiento específico.
- Filtrado previo a un LLM generativo: usar el modelo como clasificador de bajo coste para decidir si una consulta requiere un modelo grande, reduciendo el gasto de inferencia en el resto de casos.
- Despliegue en entornos sin GPU: el formato GGUF y el motor C++ permiten ejecutarlo en servidores modestos o en el borde, con latencias de centenas de milisegundos por petición.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| typed-decisions (test, primeras 2.000) | accuracy | 0,775 |
| Banking77 (test, primeras 2.000, 77 intenciones) | accuracy | 0,9185 |
| MASSIVE intents (media de 12 idiomas, 150 filas) | accuracy | 0,8161 |
| AG News (zero-shot, 2.000 filas) | accuracy | 0,921 |
| DAIR Emotion (zero-shot, 2.000 filas) | accuracy | 0,5305 |
| HWU64 intents (inglés, 150 filas) | accuracy | 0,8533 |
| SIB-200 topics (zero-shot, media de 4 idiomas) | accuracy | 0,7967 |
| Sentiment multilingüe (zero-shot, media de 12 idiomas) | accuracy | 0,6311 |
| HateCheck multilingüe (zero-shot, media de 11 idiomas) | accuracy | 0,6461 |
| Belebele reading (zero-shot, media de 4 idiomas) | accuracy | 0,28 |

Resultados en S1Bench (13 tareas de decisión tipada, 3.880 ítems), comparados con la versión 0.7.0, Lev y Jev:

| Macro accuracy | Este modelo | 0.7.0 | Lev | Jev |
|---|---|---|---|---|
| 13 subconjuntos | 0,657 | 0,638 | 0,689 | 0,761 |
| 7 subconjuntos de fuentes no vistas en entrenamiento | 0,584 | 0,565 | 0,635 | 0,766 |
| 6 subconjuntos del snapshot público | 0,675 | 0,648 | 0,719 | 0,769 |

Calibración: ECE de 0,126 frente a 0,138 en 0.7.0. Latencias reportadas: mediana de 167 ms en CPU (Ryzen 7 5800X, 4 hilos) y 22 ms en GPU (RTX 3070, Vulkan); p95 de 568 ms y 50 ms respectivamente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 321,9 millones de parámetros, en FP16 ocupa aproximadamente 0,65 GB de pesos y en cuantizaciones de 4 bits en torno a 0,2 GB, más overhead de activaciones y contexto.
- GPU recomendadas: el autor reporta pruebas en RTX 3070 (Vulkan) con 22 ms de mediana; cualquier GPU con 2 GB o más de VRAM debería ser suficiente.
- GPU de consumo: sí, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU si se usa el motor C++.
- CPU: funciona sin GPU; el autor reporta 167 ms de mediana con 4 hilos en un Ryzen 7 5800X.
- Opciones de despliegue: motor nativo Statim en C++ (CPU o GPU), pesos GGUF para llama.cpp u otros runners compatibles con GGUF; safetensors para integración vía transformers. Compatibilidad con vLLM o TGI no está confirmada en la información disponible.
- Throughput y latencia: mediana de 167 ms (CPU, 4 hilos) y 22 ms (RTX 3070, Vulkan); p95 de 568 ms y 50 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | S1Bench (macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Statim Decide Multilingual Base 0.10.0 | 321,9 M | no disponible | 0,657 | PolyForm Noncommercial 1.0.0 | Hugging Face, GGUF y safetensors |
| Statim Decide 0.7.0 | no disponible | no disponible | 0,638 | no disponible | versión anterior del mismo autor |
| Lev | 4 B (LLM con LoRA) | no disponible | 0,689 | no disponible | no disponible |
| Jev | no disponible (alojado) | no disponible | 0,761 | no disponible | servicio alojado |

La comparación relevante es de coste: Lev y Jev obtienen mejor precisión, pero Lev requiere un LLM de 4B con LoRA en GPU y Jev es un servicio alojado, mientras que Statim Decide funciona en CPU con latencias de centenas de milisegundos y un tamaño de 322 M de parámetros.

## Limitaciones y advertencias

- Licencia PolyForm Noncommercial 1.0.0: no permite uso comercial. El autor anuncia una versión futura entrenada solo con datos con licencia clara, pero no está disponible.
- Los datos de entrenamiento incluyen fuentes no comerciales, ShareAlike o de licencia desconocida, lo que motiva la restricción de licencia.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.
- Queda por detrás de Lev y Jev en S1Bench (0,657 frente a 0,689 y 0,761), especialmente en los subconjuntos de fuentes no vistas en entrenamiento (0,584).
- Rendimiento bajo en Belebele reading (0,28) y limitado en DAIR Emotion (0,5305) y HateCheck (0,6461), lo que desaconseja su uso como clasificador principal en esas tareas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de los datasets de entrenamiento (intenciones bancarias, moderación, noticias); no se documentan análisis de sesgo específicos.
- Riesgo de alucinación en sentido estricto bajo, al ser un clasificador, pero puede asignar etiquetas con confianza alta a entradas fuera de distribución; conviene monitorizar la calibración en producción.
- Longitud de contexto no documentada: textos largos pueden truncarse sin aviso explícito.
- El ecosistema de despliegue está centrado en el motor propietario Statim y en GGUF; la compatibilidad con servidores de inferencia habituales no está confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beko2210/statim-decide-multilingual-base
- Demo en Spaces: https://huggingface.co/spaces/Beko2210/statim
- Repositorio del motor Statim: https://github.com/BEKO2210/statim
- Informe de licencias de datos: https://github.com/BEKO2210/statim/blob/main/DATA_LICENSES.md
- Protocolo de S1Bench: https://github.com/BEKO2210/statim/blob/main/docs/reproductions/s1bench-protocol.md
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-multilingual-base/blob/main/LICENSE-MODEL.md
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Vídeo de presentación: https://beko2210.github.io/statim/video/statim-flagship-60s-16x9.mp4
