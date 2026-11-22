# edinlong83/zils-flash-e1

## Resumen

elephant-1 es un modelo de decisión de 9.000 millones de parámetros desarrollado por Base Labs en Baseten, obtenido mediante un ajuste fino completo del modelo base Qwen3.5-9B. Su función no es la generación de texto libre, sino la evaluación de un estado (texto y opcionalmente imágenes) frente a un conjunto de preguntas predefinidas, devolviendo una probabilidad calibrada para cada opción. Todas las preguntas se responden en un único prefill de prefijo compartido, lo que reduce el coste por decisión frente a plantear cada cuestión como una llamada independiente.

El modelo se publica bajo licencia MIT, con pesos en safetensors y una arquitectura derivada de un transformer denso con atención bidireccional por bloques en las capas de atención completa. Su ventana de contexto alcanza los 16.384 tokens y admite entradas multimodales (texto e imagen), aunque el codificador visual permanece congelado durante el entrenamiento.

Su relevancia radica en el enfoque: en lugar de competir en generación, se posiciona como componente de enrutamiento, clasificación y guardrails con calibración explícita (objetivo de Brier) y una opción entrenada de "no lo sé". Según la model card, es el mejor modelo por debajo de 15.000 millones de parámetros en el Jev Decision Index 0.4, con 62,65 puntos, y alcanza 65,2 en una réplica del Artificial Analysis Decision Index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-9B, con máscara de atención bidireccional por bloques en las capas de atención completa; codificador visual congelado |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

elephant-1 parte de Qwen3.5-9B y aplica un ajuste fino completo del modelo de lenguaje sobre decisiones de texto e imagen, manteniendo congelado el codificador visual. La innovación arquitectónica principal es el uso de una máscara de atención bidireccional por bloques en las capas de atención completa, que permite que las preguntas y opciones de una misma petición se atiendan mutuamente dentro del prefill compartido. La longitud máxima de secuencia es de 16.384 tokens y las peticiones que superan los límites entrenados se rechazan en lugar de truncarse.

El entrenamiento utilizó 6,21 millones de ejemplos de decisión (Mix 8), con la siguiente composición: 58,3 % de habilidades centrales de decisión, 16,1 % de seguridad y abstención, 16,1 % de evaluación y dominios expertos, y 9,5 % de datos públicos de decisión. La función de pérdida combina entropía cruzada con un término de calibración de Brier (λ = 1) e incluye una opción entrenada de "no lo sé". La receta consistió en 1 época (5.546 pasos), LR máximo de 3,5e-6, AdamW (β 0,9/0,95, sin weight decay), 3 % de warm-up, decaimiento coseno y precisión bf16, sobre 16 nodos de 8 H100 (128 GPU en total).

## Capacidades

- Clasificación binaria calibrada (tipo `noul`): devuelve P(sí) para una pregunta de sí o no.
- Elección entre opciones nombradas (tipo `choice`): devuelve la opción seleccionada y el vector de probabilidades sobre las alternativas definidas.
- Puntuación ordinal (tipo `score`): asigna un nivel ordenado y su distribución de probabilidad sobre los niveles.
- Decisión multipregunta en un único prefill de prefijo compartido, con coste amortizado por pregunta.
- Entrada multimodal: acepta texto e imágenes como estado de la petición.
- Calibración probabilística explícita mediante término de Brier durante el entrenamiento.
- Abstención entrenada: opción "no lo sé" para casos fuera de distribución.
- Uso como componente de enrutamiento, guardrails y clasificación en pipelines.
- Idioma: únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y un conjunto de preguntas (`team`, `urgency`, `refund`) y devuelve, en una sola pasada, la probabilidad de cada equipo, el nivel de urgencia y si se solicita reembolso, con umbrales configurables por el operador.
- Guardrails de contenido en producción: clasificación binaria calibrada sobre la salida de otro modelo para decidir si se bloquea, se revisa o se deja pasar, aprovechando la opción de abstención para derivar casos dudosos a revisión humana.
- Moderación multimodal: al aceptar imágenes junto al texto, permite clasificar publicaciones con capturas o adjuntos según políticas definidas como preguntas de tipo `noul` o `choice`.
- Triaje de solicitudes en atención al cliente: puntuación ordinal de urgencia (`score`) sobre conversaciones multi-turno dentro de la ventana de 16.384 tokens, para priorizar la cola de agentes humanos.
- Clasificación de documentos y formularios: evaluación de campos y condiciones sobre texto extraído, devolviendo probabilidades calibradas que permiten fijar umbrales de automatización frente a revisión manual.
- Evaluación automática de respuestas (LLM-as-judge acotado): preguntas de tipo `choice` con criterios descriptivos para puntuar calidad, corrección o adecuación de una respuesta generada por otro sistema.
- Enrutamiento en pipelines de agentes: selección calibrada de la siguiente herramienta o rama del flujo a partir del estado de la conversación, sustituyendo llamadas de generación por una decisión de bajo coste.

## Benchmarks y rendimiento

Jev Decision Index 0.4:

| Modelo | Decision Index |
|---|---:|
| mammoth-1 | 71,24 |
| Perplexity Decider v1.2 | 69,42 |
| elephant-1 | 62,65 |
| Jev 1.14 | 62,20 |
| Cloudflare Clef | 55,70 |

Artificial Analysis Decision Index (réplica propia de Baseten):

| Modelo | Score |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65,0 |

Según la model card, elephant-1 es el mejor modelo por debajo de 15.000 millones de parámetros en el Jev Decision Index 0.4 (puesto 8 de 208, empatado) y supera a Jev 1.14 en las cinco áreas del índice público (conocimiento y razonamiento, lenguaje, herramientas y automatización, recuperación y clasificación, y artes y gusto humano), aunque queda por debajo de mammoth-1 en todas ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.409.813.744 parámetros, en bf16 los pesos ocupan aproximadamente 18,8 GB, por lo que se necesita al menos una GPU de 24 GB para bf16 y margen para el estado de activaciones.
- GPU recomendadas: el runtime de autoalojamiento requiere una GPU CUDA; el entrenamiento se realizó en H100. Para inferencia, H100 o A100 son las opciones naturales; una RTX 4090 (24 GB) queda al límite en bf16.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 con bf16 al límite de memoria; no hay datos publicados de cuantización (GGUF, AWQ, GPTQ) para reducir requisitos.
- Opciones de despliegue: el autor proporciona `setup.sh` con el runtime fijado (OneJev + `serve.patch`) sobre la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`, más la API `DecisionEngine` del paquete `qev`. También está disponible en Baseten Model APIs. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El diseño de prefill compartido reduce el coste cuando se plantean varias preguntas sobre el mismo estado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index 0.4 | Artificial Analysis Decision Index (réplica) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| elephant-1 | 9B | 16.384 | 62,65 | 65,2 | MIT | Hugging Face y Baseten |
| mammoth-1 | 27B | no disponible | 71,24 | 65,9 | no disponible | Hugging Face y Baseten |
| Perplexity Decider v1.2 | no disponible | no disponible | 69,42 | no disponible | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 62,20 | no disponible | no disponible | no disponible |
| Cloudflare Clef | no disponible | no disponible | 55,70 | no disponible | no disponible | no disponible |
| d1-ultra | no disponible | no disponible | no disponible | 65,0 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en decisión: no está diseñado para generación de texto libre ni para tareas abiertas de conocimiento general; para eso el autor remite a su hermano de 27B, mammoth-1.
- Solo inglés: la model card declara únicamente el idioma `en`, sin datos de rendimiento en otros idiomas.
- Riesgo de calibración degradada fuera de distribución: aunque el entrenamiento incluye una opción de "no lo sé", el uso en dominios muy alejados de los datos de entrenamiento puede producir probabilidades mal calibradas.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad en la información disponible.
- Límite estricto de longitud: las peticiones que exceden los límites entrenados se rechazan, no se truncan, lo que exige validación previa en producción.
- Dependencia de runtime propietario: el autoalojamiento se apoya en el runtime OneJev y un parche de servicio específico, lo que limita la portabilidad a ecosistemas estándar como vLLM o llama.cpp.
- Sin datos de cuantización publicados: no hay pesos GGUF ni variantes de baja precisión, lo que encarece el despliegue en hardware modesto.
- Licencia MIT: permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Qwen3.5-9B.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, publicado en noviembre de 2026; la validación comunitaria es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/edinlong83/zils-flash-e1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog: https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/
- Demo en Baseten: https://www.baseten.co/library/elephant-1/
