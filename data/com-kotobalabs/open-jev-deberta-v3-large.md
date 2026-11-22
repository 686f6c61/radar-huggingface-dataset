# com-kotobalabs/open-jev-deberta-v3-large

## Resumen

open-jev-deberta-v3-large es un modelo de decisión tipada ("typed-decision model") desarrollado por com-kotobalabs, construido sobre el encoder microsoft/deberta-v3-large. A diferencia de un modelo generativo, recibe un estado de programa (un texto de contexto) y una o varias preguntas tipadas (elección entre hasta 255 opciones, puntuación sobre 2-10 niveles ordenados, o sí/no) y devuelve, en un único forward pass, una distribución de probabilidad calibrada por pregunta. Al no generar texto libre, el error de formato estructurado es cero por construcción.

El modelo es una reproducción independiente de la *forma* del sistema Jev de TypeSafe AI ("System One Model"), sin afiliación con TypeSafe ni uso de sus datos o código. Se entrenó exclusivamente con etiquetas gold públicas de tres dominios (banking77, SST-5 y BoolQ), sin respuestas sintéticas ni modelo profesor, en una sola época sobre una H100 (229 segundos, coste aproximado de 0,25 dólares).

Su relevancia actual radica en el nicho que ocupa: tareas de clasificación y decisión estructurada donde se necesita una distribución calibrada y latencia muy baja (28 ms para 10 preguntas en H100 bf16), en lugar de un LLM generativo. Con 434 millones de parámetros y 512 tokens de contexto, es un modelo pequeño y desplegable en CPU, pero con una brecha medible entre el rendimiento in-domain (0,854 de accuracy) y fuera de distribución (0,690).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large (encoder transformer) con cabeza de scoring de 3 capas |
| Parámetros totales | 434.012.160 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en total (el estado se recorta a 256 tokens) |
| Tipos de cuantización | no disponible (el repo publica safetensors; se documenta fp32 en CPU y bf16 en GPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (modelo base DeBERTa-v3-large bajo MIT) |
| Formato de pesos | safetensors (incluye `head.safetensors` y `open_jev_config.json`) |

## Arquitectura y entrenamiento

El modelo parte del encoder DeBERTa-v3-large y añade tres tokens marcadores al tokenizador (`[STATE]`, `[Q]`, `[OPT]`). La secuencia de entrada tiene la forma `[CLS] [STATE] state [Q] instructions [OPT] option_1 [OPT] option_2 … [Q] … [SEP]`, de modo que el encoder lee el estado y todas las preguntas en una sola pasada. Para cada opción, la cabeza de scoring calcula `[mean(question tokens); mean(option tokens); producto]` y aplica un softmax dentro del grupo de opciones de cada pregunta, obteniendo así la distribución de esa pregunta. La cabeza de 3 capas se distribuye en `head.safetensors` y la configuración (modo de pooling, temperatura post-hoc ajustada en validación y procedencia del entrenamiento) en `open_jev_config.json`.

El entrenamiento usó exclusivamente etiquetas gold públicas: 18.000 estados y 42.000 preguntas, una época, semilla 2, en una H100. La función de pérdida combinó entropía cruzada y Brier. Se aplicó aumento de preguntas preservando el gold (barajado de opciones, plantillas de paráfrasis, eliminación de distractores, reetiquetado de niveles y negación de preguntas noul con gold invertido) con probabilidad 0,7. No hubo RLHF ni DPO; tampoco decodificación especulativa, ya que el modelo no genera tokens.

## Capacidades

- Clasificación por elección (`choice`) entre hasta 255 opciones, con distribución de probabilidad completa por pregunta.
- Puntuación (`score`) sobre 2-10 niveles ordenados; devuelve el índice de nivel esperado, que puede caer entre niveles.
- Decisión binaria sí/no (`noul`), devolviendo p(yes).
- Respuesta a múltiples preguntas heterogéneas sobre un mismo estado en un único forward pass.
- Salida calibrada: cada respuesta incluye la distribución completa y una confianza (probabilidad máxima tras temperature scaling).
- Soporte de instrucciones de pregunta en lenguaje natural, incluidas instrucciones no vistas en entrenamiento (rendimiento OOD medido).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Triaje de tickets de soporte bancario: clasificar el mensaje del cliente por área de producto (10 categorías) y por intención (77 categorías) en una sola pasada, con la distribución completa para enrutar a colas o escalar según la confianza.
- Análisis de sentimiento con escala ordinal: asignar un nivel de sentimiento de 5 puntos a reseñas y obtener además la polaridad en 3 clases y un indicador sí/no de opinión positiva, todo con una sola inferencia.
- Moderación y filtrado con umbrales calibrados: usar la probabilidad devuelta para decidir si un contenido requiere revisión humana, aprovechando la calibración in-domain (ECE 0,022).
- Extracción de señales para pipelines de datos: enriquecer grandes volúmenes de texto con etiquetas estructuradas a bajo coste, ya que en H100 bf16 procesa 518 preguntas/s con batch 8.
- Despliegue en entornos sin GPU: al caber en CPU (1,8 s para 4 preguntas en fp32 sobre un M1 Max), es adecuado para servicios edge o de bajo consumo.
- Clasificación de referencias en código: la variante de decisión sobre código del repositorio (qué definición referencia un nombre) alcanza 0,63 en namespaces no vistos frente a 0,18 de azar, útil para herramientas de análisis estático.
- Enrutamiento de consultas en asistentes: decidir entre un conjunto fijo de acciones o categorías sin riesgo de salida malformada, al no generar texto libre.

## Benchmarks y rendimiento

Evaluación sobre test de 1.500 estados y 3.508 preguntas; OOD sobre 4.012 preguntas nunca vistas en los mismos estados.

| Métrica | Accuracy | Brier | ECE |
|---|---|---|---|
| In-domain (tipos de pregunta vistos en entrenamiento) | 0,854 | 0,213 | 0,022 |
| OOD (nuevas instrucciones y nuevos conjuntos de opciones) | 0,690 | 0,399 | 0,035 |

| Subconjunto | Resultado |
|---|---|
| banking77 intención (77 opciones) | 0,916 accuracy |
| boolq | 0,879 accuracy |
| sst5 nivel (5 ordenados) | 0,599 accuracy / 0,51 MAE |
| OOD: noul negado de boolq | 0,83 accuracy |
| OOD: tópico banking77 (partición nueva de 5 vías) | 0,61 accuracy |
| OOD: estrellas sst5 / "disappointed" (nuevos conjuntos de niveles) | 0,45 accuracy (mayoría 0,26) |

Estabilidad entre tres semillas de la misma configuración: in-domain 0,847 ± 0,005; OOD 0,678 ± 0,012. El repositorio incluye comparación con ModernBERT-base/large y con un LLaDA-MoE-7B-A1B ajustado con LoRA (0,835 in-domain con 16 veces más latencia).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 434 millones de parámetros, en bf16 los pesos ocupan aproximadamente 0,9 GB, más overhead de activaciones para contexto de 512 tokens.
- GPU recomendadas: H100 (medido: 28 ms extremo a extremo para 10 preguntas sobre un estado, 25 ms de forward, 518 preguntas/s con batch 8 en bf16).
- Cabe en GPU de consumo: sí, por tamaño; no se han publicado mediciones en RTX 4090 u otras consumer.
- CPU: viable; medido 1,8 s para 4 preguntas en fp32 sobre un M1 Max.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles (`endpoints_compatible`); requiere además el paquete `typed_decisions` del repositorio kotoba-lang/typed-decisions.
- Latencia y throughput: los indicados arriba para H100 bf16 y M1 Max fp32; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-jev-deberta-v3-large | 434 M | 512 tokens | Decisión tipada calibrada, sin generación | Apache 2.0 | Hugging Face |
| ModernBERT-base / large | no disponible en la información | no disponible | Encoder para clasificación/embeddings | no disponible | Hugging Face (comparado en el repo del autor) |
| LLaDA-MoE-7B-A1B con LoRA | 7 B totales (A1B activos) | no disponible | LLM generativo ajustado para decisión | no disponible | no disponible |

El autor reporta que el LLaDA-MoE-7B-A1B ajustado con LoRA obtiene 0,835 in-domain con 16 veces la latencia de este modelo. Los detalles de la comparación con ModernBERT están en el README del repositorio y no se reproducen en la información disponible.

## Limitaciones y advertencias

- Solo lee la pregunta parcialmente: la brecha entre in-domain (0,85) y OOD (0,69) es el indicador honesto de su generalización; las escalas ordenadas nuevas son el punto más débil (apenas por encima de la mayoría).
- Solo inglés; contexto de 512 tokens; entrenado en tres dominios públicos (soporte bancario, reseñas de cine, sí/no sobre Wikipedia). Cualquier otro dominio es out of distribution y debe medirse antes de usarlo.
- La confianza es la probabilidad máxima tras temperature scaling ajustado en validación (ECE in-domain 0,022); en preguntas OOD es sobreconfiado en torno a 0,03 de media y debe recalibrarse con datos propios.
- No genera texto ni argumentos: solo elige entre las opciones proporcionadas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de asignación errónea de etiquetas cuando la pregunta o las opciones se alejan de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenar con datasets públicos (banking77, SST-5, BoolQ) hereda los sesgos de esos corpus.
- Licencia Apache 2.0 permite uso comercial; el modelo base DeBERTa-v3-large es MIT y los datasets tienen licencias propias (banking77 CC-BY-4.0; SST-5 y BoolQ CC-BY-SA-3.0), lo que conviene revisar para redistribución derivada.
- No afiliado a TypeSafe AI; sus cifras no son comparables con las de Jev, que se miden sobre flujos privados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Repositorio del proyecto: https://github.com/kotoba-lang/typed-decisions
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset banking77: https://huggingface.co/datasets/mteb/banking77
- Dataset SST-5: https://huggingface.co/datasets/SetFit/sst5
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
