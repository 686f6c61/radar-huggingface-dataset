# nativ-community/clef-MLX-8bit

## Resumen

clef-MLX-8bit es una conversión al formato MLX del modelo Cloudflare/clef, publicada por la organización nativ-community. Se trata de un modelo de decisión multimodal: en lugar de generar texto, devuelve una probabilidad para cada opción de cada pregunta planteada en una única pasada hacia delante (forward pass). El pipeline declarado en HuggingFace es image-text-to-text, y los registros de verificación de la model card cubren entradas de texto, imagen, vídeo, imagen más vídeo, dos imágenes simultáneas, max_pixels, fps y num_frames.

El repositorio contiene 27.484.784.881 parámetros con cuantización affine de 8 bits y tamaño de grupo 64, lo que da un tamaño de 29,8 GB. La licencia es Apache 2.0 y la librería es mlx, con soporte a través de mlx-vlm. En el momento de la publicación, el soporte de Clef todavía no formaba parte de una release estable de mlx-vlm, por lo que es necesario instalar la rama `feat/clef` desde el repositorio de Lazarus-931.

Su relevancia actual es doble: por un lado, traslada al ecosistema Apple Silicon un modelo de decisión que evita por completo la generación autoregresiva de texto, con lo que se obtienen latencias mucho menores y salidas estructuradas directamente; por otro, sirve como pieza de enrutamiento y clasificación dentro de aplicaciones locales como Nativ, la aplicación de Blaizzy para ejecutar modelos en local en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión multimodal; no se detalla el tipo de red en la información proporcionada) |
| Parametros totales | 27.484.784.881 (~27,5 mil millones) |
| Parametros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | affine 8-bit, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

Datos adicionales de la ficha: revisión de origen `ed3eed331870db2eff4b0db01237128ede8a00ce` de Cloudflare/clef, verificada con `Lazarus-931/mlx-vlm@c16f81aa`. Fecha de creación del repositorio: 7 de octubre de 2026. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna (tipo de transformer, atención utilizada, torre de visión, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La información proporcionada se limita a la conversión a MLX del modelo original de Cloudflare y a los resultados de verificación numérica frente a la referencia.

La innovación destacable no está en el entrenamiento, sino en el paradigma de inferencia: Clef es un modelo de decisión que, en una sola pasada, calcula una probabilidad para cada opción de cada pregunta formulada. Cada pregunta se declara con un tipo (`choice`) y una lista de criterios (`criteria`), y el resultado se devuelve como una estructura de respuestas indexadas por nombre de campo. No hay decodificación autoregresiva ni muestreo de tokens de texto. La conversión a MLX preserva el comportamiento del original: los identificadores de token son idénticos en 11 de 11 registros de referencia y la respuesta coincide con la referencia torch en bf16 de Cloudflare en 25 de 25 preguntas, con una diferencia máxima de probabilidad de 0,0349.

## Capacidades

- Decisión multimodal con salida de probabilidad: devuelve una probabilidad por cada opción de cada pregunta en un único forward pass.
- Preguntas de tipo elección (`choice`) con criterios definidos por el usuario, agrupadas por campos con nombre.
- Entrada de texto, imagen, vídeo, imagen más vídeo y dos imágenes simultáneas, según los registros de verificación publicados.
- Control de parámetros de preprocesado multimodal: `max_pixels`, `fps` y `num_frames`.
- Clasificación y enrutamiento sin generación de texto, lo que elimina el riesgo de respuestas libres y facilita umbrales de confianza calibrados.
- Integración con mlx-vlm mediante las funciones `load` y `predict`.
- No dispone de tool calling, function calling, razonamiento multi-paso explícito ni modo de pensamiento: no genera texto.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: es el ejemplo incluido en la propia model card. Se declara un campo `department` con criterios como `billing`, `technical` o `sales`, y el modelo devuelve la opción más probable para frases como "Please refund my duplicate charge", sin necesidad de generar una respuesta completa.
- Moderación de contenido multimodal: dadas una imagen o un vídeo y una lista cerrada de categorías, el modelo asigna probabilidad a cada una, lo que permite aplicar umbrales y auditar decisiones con una puntuación numérica en lugar de texto libre.
- Anotación y etiquetado de datasets: al devolver probabilidades por opción, se pueden generar etiquetas con nivel de confianza y descartar automáticamente los casos por debajo de un umbral, reduciendo el trabajo de revisión manual.
- Triaje en pipelines industriales o médicos: clasificación de imágenes o secuencias de vídeo en categorías predefinidas dentro de un flujo local, sin enviar datos a servicios externos.
- Selección de acción en agentes: usar Clef como paso de decisión entre un conjunto cerrado de acciones o herramientas, en lugar de pedir a un modelo generativo que elija.
- Análisis de encuestas y formularios: asignar respuestas a categorías cerradas a partir de texto e imágenes adjuntas, con una probabilidad asociada por opción.
- Clasificación de vídeo en local en Apple Silicon: los parámetros `fps` y `num_frames` permiten adaptar el coste de muestreo de fotogramas al presupuesto de cómputo disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card ni en los resultados de búsqueda).

Lo que sí se publica es una verificación de fidelidad de la conversión frente a la implementación de referencia:

| Prueba | Resultado |
|---|---|
| Identidad de token ids frente a la referencia | 11/11 registros (texto, imagen, vídeo, imagen+vídeo, dos imágenes, max_pixels, fps, num_frames) |
| Coincidencia de respuesta con la referencia torch bf16 de Cloudflare | 25/25 preguntas |
| Mayor diferencia de probabilidad observada | 0,0349 |

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon mediante MLX; no hay soporte para CUDA ni ROCm en este repositorio.
- Memoria unificada estimada: al menos 32 GB, dado que el repositorio ocupa 29,8 GB y el runtime necesita margen para el processor, los buffers de imagen/vídeo y los estados intermedios.
- Chips recomendados: familias M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max y M4 Pro/Max/Ultra con 32 GB o más de memoria unificada. No hay datos publicados de qué chip concreto se utilizó para la verificación.
- GPU de consumo tipo RTX 4090 (24 GB) o similares: no aplica, porque MLX no las soporta; además, 8 bits sobre 27,5 mil millones de parámetros no cabrían en 24 GB de VRAM.
- Opciones de despliegue: mlx-vlm desde la rama `feat/clef` (`pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/clef"`) y la aplicación Nativ para Mac. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/clef-MLX-8bit | 27.484.784.881 | no disponible | safetensors MLX, 8-bit affine | Apache 2.0 | HuggingFace, 0 descargas |
| Cloudflare/clef (origen, torch bf16) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (revisión `ed3eed33...`) |
| Alternativas de decisión multimodal comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos de decisión multimodal de la misma categoría con los que establecer una comparación cuantitativa. Las referencias encontradas en la búsqueda web (heynativ.com, bynativ.com, natif-shop.com, un programa de nutrición) no guardan relación con el modelo.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas redactadas, resúmenes o diálogo libre queda fuera de su alcance.
- Las opciones y los criterios de cada pregunta deben definirse manualmente; el modelo no propone categorías.
- Requiere una versión no publicada de mlx-vlm (rama de desarrollo `feat/clef`), lo que implica riesgo de cambios de API, falta de soporte a largo plazo y ausencia de garantías de compatibilidad.
- Compatibilidad limitada a Apple Silicon: no puede desplegarse en servidores con GPU NVIDIA o AMD sin una conversión adicional.
- Longitud de contexto e idiomas soportados no documentados; no se puede dimensionar el comportamiento en documentos largos ni en producciones multilingües.
- Riesgo de alucinación entendido como mala calibración: al tratarse de probabilidades, una opción incorrecta puede recibir una puntuación alta sin que exista una señal explícita de incertidumbre. La desviación máxima frente a la referencia bf16 es de 0,0349, por lo que conviene fijar umbrales con margen.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgos demográficos, culturales o de contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación independiente de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar de forma independiente la licencia del modelo base Cloudflare/clef antes de integrarlo en un producto.
- La fecha de creación del repositorio (7 de octubre de 2026) indica que es una publicación reciente y con poca trayectoria de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nativ-community/clef-MLX-8bit
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama de soporte de Clef: https://github.com/Lazarus-931/mlx-vlm/tree/feat/clef
- Aplicación Nativ para Mac: https://blaizzy.github.io/nativ/
