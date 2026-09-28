# mohit67890/imajev-9b

## Resumen

imajev-9b es un adaptador LoRA de visión-lenguaje publicado por el usuario mohit67890 sobre el modelo base Qwen/Qwen3.5-9B. Su objetivo no es la generación de texto libre, sino la decisión tipada ("typed decisions") sobre casos de negocio reales: recibe una o varias imágenes junto con un registro de datos propio y devuelve una respuesta restringida a las opciones que define el desarrollador, con una probabilidad calibrada asociada a cada opción y una probabilidad explícita para `unknown` ("no se puede determinar").

El caso de uso central que describe el autor es la verificación foto-contra-registro: el modelo compara una fotografía con los campos de un registro (por ejemplo, una ficha de producto) y señala qué campo es incorrecto. También admite decisiones de dos fotos en una misma petición, como comparar una pieza de referencia con la pieza que está en la línea de producción, o un producto enviado con el devuelto. El adaptador se entrenó sobre 72.000 decisiones de tipo foto-contra-registro y dos-fotos.

Forma parte de una familia con tres tamaños (imajev-2b, imajev-4b e imajev-9b), de la que el 9B es el mayor y el más fuerte en texto con carga de conocimiento, con un 79,2 % en MMLU medido sobre la generación anterior del propio imajev-9b. Es relevante porque combina tres elementos poco habituales en modelos abiertos pequeños: pesos bajo licencia Apache-2.0, ejecución local en una sola GPU o en MLX sobre un Mac, y salida con forma contractual fija (la interfaz Jev, `POST /v1/systemone`, ampliada con `images` y `unknown_probability`) pensada para que un sistema actúe solo cuando está seguro y derive el resto a una persona. El repositorio tiene 19 descargas y 1 "me gusta", y el adaptador de 9B es la generación previa: en septiembre de 2026 el tier de 4B recibió un adaptador nuevo que no se ha propagado a este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`) sobre Qwen/Qwen3.5-9B, con adaptador LoRA gestionado mediante PEFT; detalle interno de capas no disponible |
| Parametros totales | Aproximadamente 9.000 millones en el modelo base (Qwen3.5-9B); el adaptador LoRA ocupa 1,0 GB en el repositorio, recuento exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se declara soporte para MLX y los pesos se distribuyen en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) acoplado a Qwen/Qwen3.5-9B, lo que implica que la arquitectura subyacente es la del modelo base y que el repositorio no contiene pesos completos, sino únicamente los del adaptador (1,0 GB). La modalidad declarada es `image-text-to-text`, de modo que el modelo procesa imágenes junto con texto y produce una salida restringida al conjunto de opciones definido en la petición, con una distribución de probabilidad sobre ellas. La innovación destacable no está en el mecanismo de atención sino en el contrato de salida: la respuesta incluye `unknown_probability`, una probabilidad entrenada explícitamente para la categoría "no se puede determinar", de forma que el sistema consumidor puede abstenerse en lugar de forzar una elección.

El entrenamiento se centró en 72.000 decisiones de dos tipos: comparación de una foto contra los campos de un registro propio y comparación de dos fotos dentro de la misma petición. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otra optimización de preferencias. La model card tampoco detalla hiperparámetros del LoRA, resolución de imagen de entrada ni estrategia de calibración de probabilidades. La interfaz de servicio sigue el contrato de TypeSafe/Jev (`POST /v1/systemone`), extendido con los campos `images` y `unknown_probability`.

## Capacidades

- Generación de decisiones tipadas: la salida se restringe a las opciones configuradas por el desarrollador, en lugar de texto libre.
- Probabilidades calibradas por opción, más una probabilidad específica para `unknown`, que permite implementar abstención y escalado a revisión humana.
- Verificación foto-contra-registro: compara una imagen con los campos de un registro y nombra el campo que no coincide (el ejemplo publicado detecta que `listing.color` dice "rojo" mientras la foto muestra zapatos beis, con 0,999 de probabilidad).
- Decisión entre dos fotos en una misma petición: referencia contra objetivo, producto enviado contra devuelto, pieza buena conocida contra pieza de línea.
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`).
- Conocimiento textual: 79,2 % en MMLU sobre la generación anterior del 9B, según la model card; el tamaño de 9B es el más fuerte de la familia en tareas de texto con carga de conocimiento.
- Despliegue local: MLX sobre Mac o PyTorch en una sola GPU, lo que permite mantener fotos y datos de cliente dentro de la red propia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Verificación de listados en comercio electrónico: el modelo recibe la foto del artículo junto con los campos del catálogo y devuelve cuál de ellos es incorrecto con una probabilidad asociada. Es adecuado porque la tarea está exactamente en el dominio de entrenamiento (foto contra registro) y la salida tipada encaja con las reglas de validación de un catálogo.
- Control de calidad en devoluciones: comparar la foto del producto enviado con la del producto devuelto dentro de la misma petición permite detectar si el artículo devuelto es el mismo que se envió, reduciendo fraudes y errores de trazabilidad.
- Inspección en línea de producción: cotejar la pieza de referencia conocida como buena contra la pieza que circula por la línea, con decisión binaria más probabilidad, y derivar a un operario cuando `unknown_probability` sea alta.
- Triaje de siniestros y expedientes con imagen: contrastar la documentación fotográfica aportada por el cliente contra los campos declarados en el expediente, usando la probabilidad de `unknown` para enrutar los casos ambiguos a un tramitador humano.
- Recepción de mercancía e inventario: validar que las fotos de la mercancía recibida coinciden con las fichas de producto registradas, con salida restringida a las opciones de incidencia definidas por el sistema de almacén.
- Automatización con human-in-the-loop: integrar el modelo como componente de decisión en un flujo donde el sistema actúa solo por encima de un umbral de confianza y escala el resto, gracias a la probabilidad calibrada por opción y a la categoría entrenada de abstención.
- Procesos con datos sensibles sujetos a residencia de datos: al ejecutarse con MLX en un Mac o con PyTorch en una GPU local, las fotografías y los registros de cliente no salen de la red corporativa, lo que facilita el cumplimiento en sectores regulados.
- Sustitución de reglas heurísticas en aplicaciones existentes: al respetar el contrato Jev (`POST /v1/systemone`) con los campos añadidos `images` y `unknown_probability`, se puede integrar como un endpoint de decisión más dentro de una arquitectura de servicios ya existente.

## Benchmarks y rendimiento

La model card indica explícitamente que este adaptador de 9B no tiene entrada propia en los tableros oficiales de texto, y que las posiciones publicadas corresponden al imajev-4b de la familia. El único dato numérico asociado al 9B es un 79,2 % en MMLU medido sobre la generación anterior de imajev-9b, no sobre este adaptador concreto.

| Benchmark | imajev-9b | imajev-4b (fase 3) | Notas |
|---|---|---|---|
| MMLU | 79,2 % (medido en el imajev-9b anterior) | no disponible | El dato no corresponde a este adaptador |
| ImajevBench | no disponible | 83,9 % | Resultado publicado para el 4B con el adaptador de fase 3 (2026-09-26) |
| DecisionBench (eng, v1) | no disponible | 79,65, puesto 3 de 56 | Tablero de Hanno-Labs, 28 Sep 2026; por delante de GLM-5.3 Flash (320B), Jev 1.13, DeepSeek V4.1 Flash (552B) y GPT-5.6 Luna |
| JevBench v1.4.2.2 (compuesto) | no disponible | 67,4, puesto 1 de 91 | Tablero de BenchmarkHeaven, 27 Sep 2026 |
| JevBench (hard) | no disponible | 72,1 % | Dato publicado para el 4B en fase 3 |

Referencias de los tableros citados para el 4B: en JevBench v1.4.2.2 le siguen Plumb-4B (65,8), decider-4b v2 (64,1) y Jev 1.13.0 (63,3); en DecisionBench (eng, v1) le preceden bosun-v3.1-1.7b (87,29) y bosun-v3.1-0.6b (83,20), ambos del equipo del propio benchmark.

## Requisitos de hardware

- VRAM para el modelo base de 9B (estimación derivada del recuento de parametros, no confirmada por el autor): en torno a 18-20 GB en fp16/bf16, 10-12 GB en cuantización de 8 bits y 6-7 GB en 4 bits, más el espacio de activaciones y de imagen.
- Espacio adicional para el adaptador: 1,0 GB en safetensors, que se carga sobre el modelo base.
- GPU recomendadas: el autor indica que funciona "en una sola GPU"; encajan tarjetas de centro de datos como A100, H100 o L40S, y también GPU de consumo de gama alta (RTX 4090, RTX 3090) si se aplica cuantización.
- Cabe en GPU de consumo: sí, en GPUs con 12-24 GB de VRAM si se usa cuantización de 8 o 4 bits; en fp16 completo requiere tarjetas de 24 GB o más.
- Mac: se declara soporte de MLX, por lo que puede ejecutarse en equipos Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: PyTorch con PEFT y MLX están confirmados por la model card. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no se menciona en la información disponible; en particular, al tratarse de un adaptador multimodal con salida tipada, la integración con esos servidores no está garantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark destacado | Disponibilidad |
|---|---|---|---|---|---|
| imajev-9b | ~9B (modelo base) + adaptador LoRA | no disponible | apache-2.0 | MMLU 79,2 % en la generacion anterior del 9B; sin entrada propia en los tableros | HuggingFace, repo de 1,0 GB |
| imajev-4b | ~4B (modelo base) + adaptador LoRA | no disponible | apache-2.0 | ImajevBench 83,9 %; DecisionBench 79,65 (puesto 3 de 56); JevBench v1.4.2.2 67,4 (puesto 1 de 91) | HuggingFace |
| imajev-2b | ~2B (modelo base) + adaptador LoRA | no disponible | apache-2.0 | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | no disponible | JevBench v1.4.2.2: 63,3 (4.º puesto) | citado en el tablero |
| Plumb-4B | 4B (segun denominacion) | no disponible | no disponible | JevBench v1.4.2.2: 65,8 (2.º puesto) | citado en el tablero |
| decider-4b v2 | 4B (segun denominacion) | no disponible | no disponible | JevBench v1.4.2.2: 64,1 (3.er puesto) | citado en el tablero |

Dentro de la propia familia, el 4B actualizado es el mejor tamaño en ImajevBench (83,9 %) y el que tiene entradas oficiales en los tableros, mientras que el 9B es el mayor y el más fuerte en conocimiento textual. Para alternativas fuera de la familia, la información disponible solo ofrece puntuaciones agregadas de tableros, sin especificaciones de arquitectura, contexto o licencia.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés (`language: en`); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Generación desactualizada dentro de la familia: la propia model card advierte de que el adaptador de 9B no se ha modificado y corresponde a la generación anterior, mientras que el tier de 4B recibió un adaptador nuevo (fase 3) el 26 de septiembre de 2026.
- Ausencia de datos de benchmark propios: no hay entrada oficial del 9B en los tableros citados; el 79,2 % de MMLU corresponde a la generación anterior del mismo tamaño, no a este adaptador.
- Sesgos conocidos: la información disponible no documenta ningún análisis de sesgos, demografía del dataset ni evaluación de equidad.
- Riesgo de alucinación: el diseño con probabilidad calibrada y categoría `unknown` mitiga el problema, pero no lo elimina; el sistema consumidor debe fijar umbrales y no tratar la probabilidad como una garantía de corrección.
- Cobertura de dominio limitada: el entrenamiento se apoya en 72.000 decisiones de foto-contra-registro y dos-fotos, por lo que el comportamiento fuera de esos dos patrones (texto libre, preguntas abiertas, razonamiento multi-paso) no está caracterizado.
- Longitud de contexto no documentada: no se puede asumir soporte para contextos largos ni para conversaciones multi-turno extensas.
- Licencia: el adaptador es Apache-2.0, pero al depender de Qwen/Qwen3.5-9B conviene verificar los términos del modelo base antes de un uso comercial, ya que la información disponible no los recoge.
- Madurez y adopción: 19 descargas y 1 "me gusta" en el momento de la consulta, con un único mantenedor; no hay evidencia de uso en producción.
- Dependencia de infraestructura: el repositorio contiene solo el adaptador (1,0 GB); es imprescindible descargar aparte el modelo base y disponer de la cadena PEFT o MLX compatible.
- Compatibilidad de servidores de inferencia no confirmada: no se documenta el funcionamiento con vLLM, llama.cpp, Ollama o TGI, lo que puede complicar el despliegue estándar.
- Advertencia sobre la búsqueda web: los resultados recuperados para esta consulta no contenían información técnica relacionada con el modelo y se han descartado por completo; todos los datos de esta ficha proceden de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohit67890/imajev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante imajev-4b: https://huggingface.co/mohit67890/imajev-4b
- Variante imajev-2b: https://huggingface.co/mohit67890/imajev-2b
- Demo en vivo (HuggingFace Spaces): https://huggingface.co/spaces/mohit67890/imajev
- Repositorio de codigo: https://github.com/mohit67890/imajev
- Sitio web del proyecto: https://mohit67890.github.io/imajev/
- Informe tecnico: https://mohit67890.github.io/imajev/report/
- Dataset de evaluacion ImajevBench: https://huggingface.co/datasets/mohit67890/imajev-bench
- Tablero JevBench (BenchmarkHeaven): https://benchmarkheaven.com/jev-models
- Tablero DecisionBench (Hanno-Labs): https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
