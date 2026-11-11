# b2z/elephant-1-oQ6e

## Resumen

elephant-1-oQ6e es una cuantización mixta del modelo de decisión elephant-1, desarrollado por Base Labs en Baseten a partir de Qwen3.5-9B. No es un modelo generativo al uso: recibe un estado (texto y, opcionalmente, imágenes) junto con un conjunto de preguntas tipadas (sí/no, elección entre opciones o puntuación ordinal) y devuelve una probabilidad calibrada para cada opción, resolviendo todas las preguntas en un único prefill de prefijo compartido. El resultado es un clasificador de decisión de propósito general con capacidades multimodales.

La versión aquí descrita, publicada por el usuario b2z, aplica la cuantización de precisión mixta oQ (oMLX v0.7.4.dev1) sobre el checkpoint original, con un promedio efectivo de 7,151 bits por peso. El 85,668 % de los pesos lógicos se almacena en affine 6-bit (grupo 64), el 9,475 % en affine 8-bit y el 4,857 % restante se mantiene en BF16, lo que reduce el checkpoint a 8,411 GB (7,833 GiB) frente al original. Está pensada para ejecutarse con la librería MLX en hardware Apple Silicon.

Su relevancia radica en el nicho que ocupa: modelos de decisión calibrados para enrutamiento, guardrails y clasificación en producción, donde la salida probabilística fiable importa más que la generación libre de texto. Con 9.410 millones de parámetros y 16.384 tokens de contexto, se sitúa como el mejor modelo por debajo de 15B en el Jev Decision Index 0.4 según su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (post-entrenado desde Qwen3.5-9B) con máscara bidireccional por bloques en capas de atención completa; codificador de visión congelado |
| Parametros totales | 9.409.813.744 (9,410B); 8,954B en el modelo de lenguaje y 0,456B en visión |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | oQ mixta: affine 6-bit grupo 64 (85,668 % de pesos), affine 8-bit grupo 64 (9,475 %), BF16 (4,857 %); promedio efectivo 7,151 bits/peso |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería MLX) |
| Tamano del repo | 8,4 GB (7,833 GiB de pesos) |
| Pipeline | text-classification |
| Modelo base | baselabs/elephant-1 |

## Arquitectura y entrenamiento

elephant-1 parte de Qwen3.5-9B, un transformer denso de 9B parámetros, y se somete a un fine-tune completo del modelo de lenguaje sobre decisiones de texto e imagen, manteniendo congelado el codificador de visión. La innovación arquitectónica clave es el uso de una máscara bidireccional por bloques en las capas de atención completa, que permite que todas las preguntas de una petición se resuelvan en un único prefill de prefijo compartido en lugar de en pasadas separadas. La longitud máxima de secuencia es de 16.384 tokens y las peticiones que exceden los límites entrenados se rechazan en lugar de truncarse.

El entrenamiento utiliza 6,21 millones de ejemplos de decisión (Mix 8): un 58,3 % de habilidades de decisión centrales, un 16,1 % de seguridad y abstención, un 16,1 % de juicio y dominios expertos y un 9,5 % de datos públicos de decisión. La función objetivo combina entropía cruzada con un término de calibración de Brier (λ = 1) e incluye una opción entrenada de "no lo sé". La receta fue de 1 época (5.546 pasos), LR pico de 3,5e-6, AdamW (β 0,9/0,95, sin weight decay), 3 % de warm-up, decaimiento coseno y precisión bf16, sobre 16 nodos de 8 GPUs. La cuantización oQ posterior redistribuye bits según la sensibilidad de cada tensor, preservando en BF16 los 0,457B de pesos más críticos.

## Capacidades

- Clasificación de decisión con salida probabilística calibrada en tres formatos: `noul` (probabilidad de sí), `choice` (una entre opciones nombradas con descripciones) y `score` (niveles ordenados).
- Procesamiento multimodal de entrada: acepta texto e imágenes en el mismo estado.
- Resolución de múltiples preguntas heterogéneas en un solo prefill de prefijo compartido, lo que reduce coste y latencia frente a llamadas independientes.
- Calibración explícita de probabilidades mediante término de Brier durante el entrenamiento.
- Abstención entrenada: opción de "no lo sé" para casos fuera de distribución.
- Enrutamiento y guardrails: idóneo para decidir a qué equipo, cola o política derivar una petición.
- Puntuación ordinal de urgencia o severidad sobre escalas definidas por el usuario.
- No es un modelo generativo de texto libre: no produce respuestas abiertas, solo probabilidades sobre las preguntas formuladas.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: con preguntas de tipo `choice` se asigna cada incidencia a facturación, técnico o fraude, y con `score` se prioriza su urgencia, todo en una sola pasada y con probabilidades que permiten umbrales de derivación a humanos.
- Guardrails de contenido en producción: una pregunta `noul` como "¿solicita el usuario datos personales de terceros?" devuelve P(sí) calibrada, integrable como filtro previo a un LLM generativo.
- Moderación multimodal: al aceptar imágenes junto al texto, puede evaluar capturas de pantalla o adjuntos de usuario para clasificar si contienen contenido sensible o indicios de abuso.
- Triaje de atención al cliente: la ventana de 16.384 tokens permite incluir el historial completo de una conversación multi-turno como estado y decidir la siguiente acción sin truncar contexto.
- Clasificación documental y retrieval: decidir la categoría de un documento o la relevancia de un fragmento recuperado, con probabilidades calibradas para ordenar resultados.
- Automatización de back-office: decidir si una factura requiere revisión manual, si un reembolso cumple política o si un caso debe escalarse, usando el modelo como componente determinista y auditable.
- Evaluación automática de respuestas: preguntas de tipo `score` para puntuar calidad, toxicidad o adecuación de salidas de otros modelos en pipelines de evaluación.

## Benchmarks y rendimiento

| Benchmark | Modelo | Puntuación |
|---|---|---:|
| Jev Decision Index 0.4 | mammoth-1 (27B) | 71,24 |
| Jev Decision Index 0.4 | Perplexity Decider v1.2 | 69,42 |
| Jev Decision Index 0.4 | **elephant-1** | **62,65** |
| Jev Decision Index 0.4 | Jev 1.14 | 62,2 |
| Jev Decision Index 0.4 | Cloudflare Clef | 55,7 |
| Artificial Analysis Decision Index (réplica) | mammoth-1 | 65,9 |
| Artificial Analysis Decision Index (réplica) | **elephant-1** | **65,2** |
| Artificial Analysis Decision Index (réplica) | d1-ultra | 65 |

Según la model card, elephant-1 es el mejor modelo por debajo de 15B en el Jev Decision Index 0.4 (puesto 8 empatado de 208 modelos). En el split público queda ligeramente por detrás de mammoth-1 en todas las áreas y supera a Jev 1.14 en las cinco (conocimiento y razonamiento, lenguaje, herramientas y automatización, retrieval y clasificación, y arte y gusto humano). No se han publicado resultados de benchmarks para esta cuantización específica; los datos corresponden al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado ocupa 7,833 GiB de pesos; con overhead de runtime MLX se recomienda un mínimo de 10-12 GB de memoria unificada.
- Esta variante está empaquetada para MLX, por lo que su destino natural es Apple Silicon (M1/M2/M3/M4, especialmente configuraciones con 16 GB o más de memoria unificada).
- El modelo base original se sirve con OneJev + `serve.patch` sobre una GPU CUDA y la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`; para esa ruta se recomienda una GPU con al menos 24 GB (RTX 4090, A100, H100).
- En consumer GPU NVIDIA, el checkpoint original en bf16 requiere del orden de 18-20 GB; esta cuantización de 7,151 bits/peso no es directamente compatible con llama.cpp ni vLLM al estar en formato MLX.
- Opciones de despliegue: MLX (librería nativa de esta variante), OneJev con `setup.sh` para el modelo base en CUDA, y Baseten Model APIs (endpoint gestionado que acepta texto e imágenes).
- Latencia y throughput: no disponible; la model card solo indica que todas las preguntas se resuelven en un único prefill de prefijo compartido, lo que reduce el coste frente a pasadas separadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index 0.4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **elephant-1-oQ6e** | 9,41B | 16.384 | 62,65 (modelo base) | MIT | Hugging Face (MLX) |
| mammoth-1 | 27B | no disponible | 71,24 | no disponible en la información | Hugging Face (baselabs) |
| Perplexity Decider v1.2 | no disponible | no disponible | 69,42 | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 62,2 | no disponible | no disponible |
| Cloudflare Clef | no disponible | no disponible | 55,7 | no disponible | no disponible |
| d1-ultra | no disponible | no disponible | 65 (índice AA réplica) | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No es un modelo generativo: no puede redactar respuestas abiertas ni mantener conversación libre, solo responder a preguntas tipadas predefinidas.
- Las peticiones que superan los límites de longitud entrenados se rechazan, no se truncan, lo que exige gestionar ese error en producción.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; la opción "no lo sé" mitiga pero no elimina este problema.
- Sesgos: no se documentan análisis de sesgo específicos en la información disponible; al derivar de Qwen3.5-9B hereda los sesgos del corpus original.
- Los benchmarks publicados corresponden al modelo sin cuantizar; esta versión de 7,151 bits/peso puede degradar ligeramente la calibración, aunque la distribución mixta preserva en BF16 los tensores sensibles.
- Licencia MIT para el checkpoint, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del codificador de visión congelado antes de uso comercial.
- El endpoint gratuito de Baseten finalizó el 27/10/26; el autohospedaje requiere el runtime OneJev y una GPU CUDA, lo que añade complejidad operativa.
- Esta variante MLX no es portable a ecosistemas CUDA sin reconversión de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/b2z/elephant-1-oQ6e
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Modelo hermano: https://huggingface.co/baselabs/mammoth-1
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog de Baseten: https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/
- Demo en Baseten: https://www.baseten.co/library/elephant-1/
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
