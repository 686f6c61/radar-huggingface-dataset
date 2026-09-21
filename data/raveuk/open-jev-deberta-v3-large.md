# rAVEUK/open-jev-deberta-v3-large

## Resumen

open-jev-deberta-v3-large es un modelo de decisión tipada (*typed-decision model*) desarrollado por el usuario rAVEUK, construido como un ajuste fino de microsoft/deberta-v3-large. No es un modelo generativo: recibe un estado (un texto de contexto) y una o varias preguntas tipadas —`choice` sobre hasta 255 opciones, `score` sobre 2-10 niveles ordenados y `noul` (yes/no)— y devuelve, en una sola pasada hacia delante, una distribución de probabilidad calibrada por pregunta. Al no generar texto libre, la tasa de error de salida estructurada es cero por construcción, lo que lo hace atractivo para pipelines donde el parseo de la respuesta es un punto crítico.

El modelo tiene 434.012.160 parámetros (encoder DeBERTa-v3-large más una cabecera de scoring de 3 capas) y una ventana de contexto de 512 tokens en total, con el estado truncado a 256 tokens. Se entrenó únicamente con etiquetas gold públicas de tres corpus (banking77, SST-5 y BoolQ), 18.000 estados y 42.000 preguntas, durante una época en una única H100 (229 segundos, coste estimado de 0,25 dólares). La licencia es Apache 2.0 y el modelo solo soporta inglés.

Es relevante porque reproduce de forma independiente la *forma* del "System One Model" de TypeSafe AI (Jev) sin usar su código ni sus datos, y porque publica una medición honesta de su generalización: 0,854 de exactitud en dominio frente a 0,690 fuera de distribución, con calibración explícita (ECE 0,022 en dominio). Además, aporta cifras de latencia concretas (28 ms end-to-end para 10 preguntas en una H100 en bf16) que permiten evaluar su encaje como componente rápido de enrutado dentro de sistemas con agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer DeBERTa-v3-large con cabecera de scoring de 3 capas (3 tokens marcadores añadidos al tokenizador) |
| Parametros totales | 434.012.160 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en total; el estado se recorta a 256 tokens |
| Tipos de cuantizacion | No disponibles en la model card; pesos publicados en safetensors (fp32/bf16). No se publica GGUF ni cuantizaciones de llama.cpp |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos del encoder y `head.safetensors`), mas `open_jev_config.json` con el modo de pooling, la temperatura post-hoc y la procedencia del entrenamiento |
| Tarea (pipeline) | text-classification / feature-extraction |
| Modelo base | microsoft/deberta-v3-large (MIT) |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo usa el encoder de DeBERTa-v3-large (transformer con *disentangled attention* y objetivo de preentrenamiento estilo ELECTRA con detección de tokens reemplazados, tal y como define el modelo base de Microsoft) y le añade tres tokens marcadores al tokenizador. La secuencia de entrada sigue el patrón `[CLS] [STATE] estado [Q] instrucciones [OPT] opción_1 [OPT] opción_2 … [Q] … [SEP]`, de modo que el encoder lee el estado y todas las preguntas en una única pasada. Para cada opción, la cabecera puntúa la concatenación de `[media de los tokens de la pregunta; media de los tokens de la opción; producto]` y aplica un softmax dentro del grupo de opciones de cada pregunta, obteniendo así una distribución por pregunta. La función de pérdida combina entropía cruzada y *score* de Brier.

El entrenamiento se hizo exclusivamente con etiquetas gold públicas, sin respuestas sintéticas ni modelo profesor, a partir de tres fuentes: `mteb/banking77` (mensaje de cliente; intención con 77 opciones, área de producto con 10 opciones derivada por regla de palabras clave y un `noul` de "pregunta por una tarjeta"), `SetFit/sst5` (frase de reseña; nivel de sentimiento en 5 niveles, polaridad en 3 y un `noul` de opinión positiva) y `google/boolq` (pasaje; el `noul` de la propia pregunta del dataset). En total, 18.000 estados de entrenamiento y 42.000 preguntas, una época, semilla 2, en una H100 durante 229 segundos. Se aplicó aumento de preguntas que preserva el gold (barajado de opciones, plantillas de paráfrasis, eliminación de distractores, reetiquetado de niveles y negación del `noul` con el gold invertido) con probabilidad 0,7. La temperatura post-hoc se ajustó sobre una partición de validación.

## Capacidades

- Decisión tipada con salida estructurada: devuelve una respuesta por pregunta con su distribución completa de probabilidades y un valor de confianza, en una sola pasada hacia delante.
- Preguntas de tipo `choice`: selección entre hasta 255 opciones (por ejemplo, 77 intenciones de banking77).
- Preguntas de tipo `score`: estimación del índice de nivel esperado sobre escalas ordenadas de 2 a 10 niveles, que puede caer entre dos niveles.
- Preguntas de tipo `noul`: probabilidad de "sí" para una afirmación booleana (por ejemplo, "el cliente pide un reembolso").
- Multitarea simultánea sobre un mismo estado: el ejemplo de la model card resuelve tres preguntas heterogéneas (choice, score y noul) sobre un único mensaje.
- Clasificación de sentimiento ordinal y polaridad.
- Respuesta a preguntas booleanas sobre pasajes (estilo BoolQ).
- Calibración de confianza explícita: ECE de 0,022 en dominio tras escalado de temperatura.
- Capacidad OOD parcial: generaliza razonablemente a conjuntos de opciones nuevos y a instrucciones negadas, aunque con caída de rendimiento.
- No soporta generación de texto, *tool calling*, *function calling*, agentes, visión, audio ni modo de razonamiento explícito. No hay evidencia publicada de capacidades multilingües: solo inglés.

## Casos de uso

- Triaje y enrutado de tickets de soporte bancario: el modelo puede asignar simultáneamente la intención (77 clases, 0,916 de exactitud en banking77), el área de producto y la detección de peticiones de reembolso en una sola pasada, lo que permite dirigir cada mensaje a la cola correcta sin un LLM generativo.
- Clasificación de opiniones con escala ordinal: sobre reseñas, devuelve el nivel de sentimiento esperado (0,599 de exactitud y 0,51 de MAE en SST-5), lo que resulta útil para paneles de satisfacción donde importa la distancia entre niveles y no solo la clase.
- Verificación de afirmaciones sobre documentación: con la formulación `noul` puede responder preguntas booleanas sobre un pasaje (0,879 en BoolQ), apto para comprobaciones simples de "¿este texto afirma X?" antes de escalar a un modelo mayor.
- Componente "System One" en una cascada de agentes: actuaría como decididor rápido y barato (518 preguntas/s en H100 bf16 a lote 8) para resolver elecciones cerradas y reservar el LLM generativo solo para los casos de baja confianza.
- Salidas estructuradas en producción sin capa de parseo: al no generar texto, la tasa de error de formato es cero por construcción, lo que simplifica el contrato de la API y elimina reintentos por JSON mal formado.
- Preanotación para etiquetado humano y aprendizaje activo: la confianza calibrada (ECE 0,022 en dominio) permite ordenar por incertidumbre y priorizar qué ejemplos revisar manualmente, reduciendo el coste de anotación.
- Moderación y detección de intenciones sensibles: la pregunta `noul` sirve para marcar mensajes que cumplen una condición definida por el equipo (por ejemplo, solicitudes de disputa o de cancelación) con una probabilidad explícita en lugar de una etiqueta opaca.
- Evaluación de encuestas con múltiples ejes: sobre una misma respuesta abierta se pueden lanzar en paralelo preguntas de polaridad y de nivel de satisfacción, obteniendo distribuciones comparables entre ítems y a lo largo del tiempo.

## Benchmarks y rendimiento

Conjunto de test: 1.500 estados y 3.508 preguntas en dominio; 4.012 preguntas nunca vistas sobre los mismos estados para la evaluación fuera de distribución (OOD).

| Metrica | Exactitud | Brier | ECE |
|---|---|---|---|
| En dominio (tipos de pregunta vistos en entrenamiento) | 0,854 | 0,213 | 0,022 |
| OOD (instrucciones nuevas y conjuntos de opciones nuevos) | 0,690 | 0,399 | 0,035 |

Desglose por tarea y variantes:

| Tarea | Resultado |
|---|---|
| banking77, intención (77 opciones) | 0,916 de exactitud |
| BoolQ | 0,879 de exactitud |
| SST-5, nivel (5 niveles ordenados) | 0,599 de exactitud / 0,51 de MAE |
| OOD, `noul` de BoolQ negado | 0,83 de exactitud |
| OOD, tópico de banking77 con partición nueva de 5 vías | 0,61 de exactitud |
| OOD, estrellas SST-5 / "disappointed" con conjuntos de niveles nuevos | 0,45 de exactitud (mayoría: 0,26) |

Estabilidad entre semillas: tres semillas de esta configuración dan 0,847 ± 0,005 en dominio y 0,678 ± 0,012 en OOD. El autor también reporta, en el repositorio, una comparación contra ModernBERT-base y ModernBERT-large y contra un LLaDA-MoE-7B-A1B ajustado con LoRA (0,835 en dominio con 16 veces la latencia), así como una variante de decisión sobre código (0,63 sobre espacios de nombres reservados, con azar en 0,18).

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 434.012.160 parámetros; la model card no publica cifras de VRAM): en fp32, unos 1,74 GB; en fp16/bf16, unos 0,87 GB; en int8, unos 0,43 GB. Con activaciones a 512 tokens, la inferencia a lote 1 debería situarse en torno a 2-4 GB según precisión (estimación, no medida publicada).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090 o similares, incluso con lotes grandes.
- Funciona en CPU: el autor reporta 1,8 s para 4 preguntas en fp32 sobre una CPU de M1 Max, lo que lo hace viable sin GPU para volúmenes bajos.
- GPU de centro de datos: el autor reporta 28 ms end-to-end para 10 preguntas sobre un mismo estado en H100 con bf16 (25 ms de pasada hacia delante) y 518 preguntas/s con lote 8.
- Despliegue: transformers (librería declarada) y text-embeddings-inference, además de endpoints_compatible para Hugging Face Inference Endpoints. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de serie; al no ser un modelo generativo autorregresivo, vLLM no es un motor aplicable.
- Nota de latencia: el coste depende del número de preguntas y de opciones, ya que todas se procesan en la misma secuencia de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-jev-deberta-v3-large | 434.012.160 | 512 tokens | 0,854 en dominio / 0,690 OOD | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| ModernBERT-base | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | El autor indica que la comparacion esta en el repositorio, sin cifras en la model card | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| ModernBERT-large | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | El autor indica que la comparacion esta en el repositorio, sin cifras en la model card | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| LLaDA-MoE-7B-A1B ajustado con LoRA | 7B totales (~1B activos, segun la denominacion del modelo) | No disponible en la informacion proporcionada | 0,835 en dominio con 16 veces la latencia de este modelo (dato del autor) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La comparativa directa con estos modelos no puede completarse con los datos de la model card; las cifras completas, incluidas las de ModernBERT, se encuentran en el README del repositorio del autor.

## Limitaciones y advertencias

- Solo lee parcialmente la pregunta: la brecha entre 0,85 en dominio y 0,69 OOD es el límite honesto declarado por el autor. Las escalas ordenadas nuevas son el punto más débil (el `score` sobre conjuntos de niveles nuevos apenas supera a la clase mayoritaria).
- Solo inglés, contexto de 512 tokens y tres dominios públicos (soporte bancario, reseñas de cine y sí/no sobre Wikipedia). Cualquier otro dominio queda fuera de distribución y debería medirse antes de usarlo.
- La confianza es la probabilidad máxima después de un escalado de temperatura ajustado en validación (ECE 0,022 en dominio). En preguntas OOD el modelo es sobreconfiado en aproximadamente 0,03 de media y conviene recalibrarlo con datos propios.
- No puede generar texto ni justificar sus decisiones: solo elige entre las opciones que se le facilitan. No sirve para tareas abiertas.
- Riesgo de alucinación acotado por diseño: al no generar, no inventa contenido, pero sí puede asignar una opción incorrecta con alta confianza, especialmente cuando el conjunto de opciones es nuevo.
- Sesgos: no se documenta ningún análisis de sesgo demográfico o lingüístico. Al entrenarse con banking77, SST-5 y BoolQ, hereda los sesgos de esos corpus (reseñas de cine y consultas bancarias en inglés).
- Licencia: el modelo se publica bajo Apache 2.0 y el modelo base es MIT, por lo que el uso comercial no presenta restricciones conocidas. No obstante, los datos de entrenamiento incluyen BoolQ y SST-5 bajo CC-BY-SA-3.0 y banking77 bajo CC-BY-4.0, lo que conviene revisar si se redistribuye el modelo o se derivan obras.
- Repositorio con 0 descargas y 0 likes: no hay validación independiente por parte de la comunidad ni informes de terceros sobre su comportamiento en producción.
- Inconsistencia de identificadores: la ficha de Hugging Face corresponde a `rAVEUK/open-jev-deberta-v3-large`, mientras que el ejemplo de código de la model card usa `com-kotobalabs/open-jev-deberta-v3-large`. Hay que ajustar el identificador al cargar el modelo.
- Aclaración de procedencia: es una reproducción independiente de la *forma* del modelo Jev de TypeSafe AI; no está afiliado a TypeSafe, no usa sus datos ni su código, y sus números no son comparables con los que ellos publican (ellos miden acuerdo con modelos frontera sobre flujos privados; este modelo se mide contra etiquetas gold públicas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rAVEUK/open-jev-deberta-v3-large
- Repositorio de código, generador de corpus, ablaciones y registro completo de mediciones: https://github.com/kotoba-lang/typed-decisions
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Dataset banking77: https://huggingface.co/datasets/mteb/banking77
- Dataset SST-5: https://huggingface.co/datasets/SetFit/sst5
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- ADR citados por el autor: ADR-2609181544 y ADR-2609181715 (superproyecto `com-junkawasaki/root`), referenciados en el repositorio anterior; no se han encontrado URL directas en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que no se incluyen.
