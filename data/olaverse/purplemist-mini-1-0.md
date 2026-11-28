# olaverse/PurpleMIST-Mini-1.0

## Resumen

PurpleMIST-Mini-1.0 es un modelo de decisión ("decision model") de tipo System One desarrollado por olaverse. No genera texto: recibe un estado no estructurado (un mensaje, un ticket, un registro o una transcripción) junto con un conjunto de preguntas tipadas y devuelve, en un único pase directo, una distribución de probabilidad calibrada para cada respuesta. Es el miembro más pequeño de la familia PurpleMIST y comparte interfaz con PurpleMIST-Flash-1.0 con menos de una cuarta parte de su tamaño.

El modelo parte del backbone de texto de Qwen/Qwen3.5-2B-Base, al que se le han eliminado la torre de visión y la cabeza de modelado de lenguaje, y se le ha añadido una cabeza de tipo pointer de 4,2 millones de parámetros. El resultado son 1.881.825.088 parámetros (aproximadamente 1,9B) con una ventana de contexto de hasta 32.768 tokens por pase. Está afinado a peso completo sobre conjuntos de decisiones tipadas y orientado explícitamente a la calibración probabilística.

Su relevancia actual reside en que aborda la clasificación y el enrutamiento estructurado como un problema de decisión probabilística en lugar de generación libre, con latencias muy bajas (mediana de 46 ms por petición) y cobertura de ocho idiomas africanos además del inglés. La licencia Apache 2.0 y la compatibilidad con la API de decisión de Ollama facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas: 18 de atención lineal Gated DeltaNet y 6 de atención completa), hidden size 2048, con cabeza pointer |
| Parametros totales | 1.881.825.088 (aprox. 1,9B); la cabeza pointer aporta 4,2M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens por pase; 2.048 por defecto en `Decider` |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en bf16; se recomienda ejecutar en fp32) |
| Idiomas soportados | en, yo, ha, ig, pcm, sw, am, so, zu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea el backbone de texto de Qwen/Qwen3.5-2B-Base, una arquitectura híbrida de 24 capas que combina 18 capas de atención lineal Gated DeltaNet con 6 capas de atención completa, tamaño oculto de 2048 y aproximadamente 1,9B de parámetros. Se han eliminado la torre de visión y la cabeza de modelado de lenguaje del modelo base. Sobre la representación resultante se añade una cabeza pointer: el logit de cada opción es un producto escalar escalado entre proyecciones (2048 → 1024) de la posición de respuesta y de la propia línea de la opción. Todas las preguntas sobre un mismo estado comparten una única secuencia, de modo que se resuelven en un solo pase.

El entrenamiento consistió en un fine-tune completo de todos los pesos (a diferencia de PurpleMIST-Flash-1.0, que usa LoRA) sobre los conjuntos olaverse/african-typed-decisions y LocalLLaMA/typed-decisions. Los pesos se almacenan en bf16, pero el modelo se entrenó con pesos en fp32 y multiplicaciones de matrices en bf16; ejecutarlo íntegramente en bf16 cuesta unos 3 puntos de precisión (0,568 en inglés frente a 0,601). La configuración `purplemist_config.json` declara `inference_dtype: float32` y la clase `Decider` carga fp32 automáticamente. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación probabilística tipada: devuelve distribuciones calibradas para preguntas de tipo `choice` (opciones con nombre), `noul` (probabilidad de sí para una afirmación) y `score` (nivel esperado sobre una escala ordenada).
- Decisión en un único pase: todas las preguntas sobre un mismo estado comparten secuencia, y el número de opciones es arbitrario.
- Calibración explícita: ECE de 0,058 en inglés y 0,050 en los ocho idiomas africanos.
- Multilingüismo: inglés, yoruba, hausa, igbo, pidgin nigeriano, suajili, amhárico, somalí y zulú.
- Manejo de estados largos: hasta 32.768 tokens por pase, con división automática de las preguntas en varios pases cuando no caben junto al estado.
- Entrada flexible: el estado puede ser una cadena o cualquier objeto serializable en JSON.
- Servicio HTTP local: `serve.py` expone `POST /v1/systemone`, además de `GET /health` y `GET /v1/models`, con la misma forma de petición que la API de decisión de Ollama 0.35+.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión (la torre de visión fue eliminada).

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, el modelo asigna el equipo adecuado (`choice`), estima la probabilidad de que el cliente pida reembolso (`noul`) y puntúa la urgencia en una escala ordenada (`score`), todo en un pase y con latencias de decenas de milisegundos.
- Triaje de correo entrante: clasificación de mensajes en categorías operativas y detección de solicitudes de acción con probabilidad calibrada, apto para umbrales automáticos gracias a su ECE bajo.
- Moderación y etiquetado de contenido: evaluación de afirmaciones binarias sobre textos en inglés y en lenguas africanas, con distribuciones que permiten priorizar la revisión humana según la incertidumbre.
- Análisis de transcripciones de atención al cliente: extracción de decisiones estructuradas (motivo, sentimiento, resolución esperada) a partir de transcripciones largas, aprovechando la ventana de 32.768 tokens y la división automática de preguntas.
- Procesamiento de registros y formularios: clasificación de campos y estados a partir de objetos JSON arbitrarios, útil en pipelines de ingesta y normalización de datos.
- Evaluación de riesgo en flujos de crédito o seguros: puntuación de niveles ordenados (`score`) con probabilidades por nivel que permiten aplicar políticas de decisión basadas en umbrales calibrados.
- Investigación en calibración y modelos de decisión: referencia ligera (1,9B) para comparar estrategias de calibración y arquitecturas de cabeza pointer frente a modelos generativos.
- Despliegue en local: servicio HTTP compatible con la API de decisión de Ollama para integrarse en aplicaciones existentes sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre LocalLLaMA/typed-decisions (zero-shot en inglés):

| Modelo | Parametros | Precision | KL | Brier |
|---|---|---|---|---|
| OpenDecider-small | 4B | 0,648 | no disponible | no disponible |
| PurpleMIST-Mini-1.0 | 1,9B | 0,601 | 0,280 | 0,156 |
| Bongard-mini | 7,5B | 0,594 | no disponible | no disponible |
| Jeff-Gemma4-E2B | 4,6B | 0,561 | no disponible | no disponible |
| Jeff-Qwen3.5-2B | 2,2B | 0,511 | no disponible | no disponible |
| Prior (sin entrada) | — | 0,470 | no disponible | no disponible |

Calibración: ECE de 0,058 en inglés y 0,050 en los ocho idiomas africanos. Latencia: mediana de 46 ms y media de 67 ms por petición sobre 140.620 peticiones de todas las longitudes, una a una en una GPU. En ejecución íntegra en bf16 la precisión en inglés baja a 0,568.

## Requisitos de hardware

- Memoria: aproximadamente 7,5 GB en fp32, el modo recomendado; en bf16 se reduce a la mitad, pero con una pérdida de unos 3 puntos de precisión.
- GPU recomendadas: el autor reporta pruebas en una GPU de 96 GB para la validación a 32.768 tokens, pero el modelo cabe holgadamente en GPUs de consumo con 8-12 GB de VRAM en fp32.
- GPU de consumo: sí, cabe en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en fp32.
- Despliegue: librería `transformers` (>= 5.19) con la clase `Decider` del propio repositorio; `serve.py` para servicio HTTP local; kernels opcionales `flash-linear-attention` y `causal-conv1d` para acelerar las capas de atención lineal. Compatible con la API de decisión de Ollama 0.35+.
- Latencia y throughput: mediana de 46 ms y media de 67 ms por petición en una GPU, procesando una petición a la vez; el servidor incluido también atiende una petición simultánea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (typed-decisions, en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PurpleMIST-Mini-1.0 | 1,9B | 32.768 | 0,601 | Apache 2.0 | Hugging Face |
| PurpleMIST-Flash-1.0 | > 1,9B (no disponible) | no disponible | no disponible | no disponible | Hugging Face |
| OpenDecider-small | 4B | no disponible | 0,648 | no disponible | no disponible |
| Bongard-mini | 7,5B | no disponible | 0,594 | no disponible | no disponible |
| Jeff-Gemma4-E2B | 4,6B | no disponible | 0,561 | no disponible | no disponible |

PurpleMIST-Mini-1.0 supera en precisión a modelos de hasta cuatro veces su tamaño (Bongard-mini y Jeff-Gemma4-E2B) y queda por debajo de OpenDecider-small, de 4B. Comparte interfaz con PurpleMIST-Flash-1.0, que usa LoRA en lugar de fine-tune completo.

## Limitaciones y advertencias

- No genera texto: es exclusivamente un modelo de puntuación de opciones; no sirve para tareas generativas ni de conversación.
- Sensibilidad a la precisión: ejecutarlo en bf16 en lugar de fp32 degrada la precisión en unos 3 puntos (0,568 frente a 0,601 en inglés); es imprescindible respetar el `inference_dtype` de la configuración.
- Cobertura idiomática limitada a inglés y ocho lenguas africanas; no hay datos sobre otros idiomas.
- Cabeza pointer de solo 4,2M de parámetros: el rendimiento depende de la calidad de las descripciones de opciones y de las instrucciones proporcionadas.
- Ventana por defecto de 2.048 tokens en `Decider`; para entradas largas hay que pasar `max_len=32768` explícitamente.
- El servidor incluido atiende una petición a la vez, lo que limita el throughput en producción.
- No se han publicado datos sobre sesgos, tasas de alucinación (en sentido de calibración errónea) ni comportamiento fuera de los conjuntos de evaluación citados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución del modelo base Qwen/Qwen3.5-2B-Base.
- Solo 177 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa todavía muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/PurpleMIST-Mini-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo hermano: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/olaverse/african-typed-decisions
