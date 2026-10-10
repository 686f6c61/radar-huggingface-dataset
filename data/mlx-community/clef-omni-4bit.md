# mlx-community/clef-omni-4bit

## Resumen

Clef-Omni 4-bit es la conversión a MLX del modelo Cloudflare/clef-omni, un modelo de decisión multimodal de tipo mixture-of-experts (MoE) con 31.719.205.488 parámetros totales y aproximadamente 3.000 millones activos por token (configuración 30B-A3B). Está construido sobre el *thinker* de Qwen3-Omni y su función no es conversar, sino transformar un estado —texto, JSON, imágenes, audio o vídeo con su banda sonora— junto con un esquema de preguntas tipadas en una probabilidad para cada opción permitida, todo en una única pasada hacia delante. El autor del modelo base es Cloudflare y la cuantización la publica la comunidad mlx-community para Apple Silicon.

La relevancia de esta ficha está en que rompe el patrón habitual de los LLM de chat: no genera texto libre, sino salidas estructuradas y calibradas (tipos de pregunta *choice*, *score* y *noul*), lo que lo convierte en una pieza de enrutado, triaje y clasificación zero-shot más que en un asistente. Al ser MoE, solo activa unos 3.000 millones de parámetros por token, de modo que resulta más rápido que un modelo denso de 9B en prompts largos pese a que la descarga sea mucho mayor.

Técnicamente requiere un cargador específico (`clef_mlx.py`, incluido en el repositorio): herramientas genéricas como `mlx_vlm.generate` o LM Studio cargan el *backbone* pero producen texto sin sentido, porque no ejecutan la cabeza conjunta de esquema (*joint schema head*) que da sentido a la salida. La licencia es apache-2.0 y el repositorio ocupa 19,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal sobre el *thinker* de Qwen3-Omni, con *joint schema head* para salida estructurada |
| Parametros totales | 31.719.205.488 (~31,7 B) |
| Parametros activos | ~3 B por token (variante 30B-A3B) |
| Longitud de contexto | no disponible (se han medido latencias y memoria hasta 14.000 tokens) |
| Tipos de cuantizacion | 4-bit (este repositorio) y 8-bit (mlx-community/clef-omni-8bit) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (cuantizado a 4 bits) |
| Modalidades de entrada | texto, JSON, imagenes, audio y video (con banda sonora) |
| Tarea declarada (pipeline) | zero-shot-classification |
| Libreria | mlx (mlx-vlm >= 0.7.6, < 0.8) |
| Modelo base | Cloudflare/clef-omni (relacion: quantized) |
| Tamano del repositorio | 19,8 GB |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) construida sobre el *thinker* de Qwen3-Omni, con unos 31,7 B de parámetros totales de los que solo ~3 B se activan por token. Sobre ese *backbone* multimodal se monta una cabeza conjunta de esquema que, en una sola pasada hacia delante, produce una probabilidad por cada opción permitida de un conjunto de preguntas tipadas. Los tipos de pregunta documentados son `choice` (elección entre criterios con etiqueta y descripción), `score` (puntuación sobre una lista ordenada de criterios) y `noul` (pregunta booleana de sí/no). La entrada se organiza en un campo `state` más adjuntos opcionales en `images`, `audio` y `videos`.

En cuanto a la ingestión multimodal, las imágenes pueden ser rutas de fichero, URL, data URL base64, bytes crudos u objetos PIL; el audio admite los mismos formatos o arrays de muestras mono a 16 kHz; y el vídeo se muestrea a 2 fotogramas por segundo, con la posibilidad de procesar simultáneamente la banda sonora cuando todos los vídeos de la petición tienen una. El *feature extractor* de audio se apoya en el extractor tipo Whisper de numpy y la decodificación de audio y vídeo usa PyAV (`av`). Los detalles concretos de composición del dataset de entrenamiento, número de tokens vistos y si hubo RLHF o DPO no están disponibles en la información proporcionada.

## Capacidades

- Clasificación zero-shot con esquema tipado: devuelve probabilidades por opción en lugar de texto libre, en una única pasada.
- Triaje y enrutado mediante preguntas de tipo `choice` con criterios etiquetados (por ejemplo, facturación frente a técnico).
- Puntuación graduada mediante preguntas de tipo `score` sobre una lista ordenada de criterios (por ejemplo, "puede esperar", "esta semana", "hoy").
- Decisiones booleanas con preguntas de tipo `noul` (por ejemplo, "¿está el servicio caído?").
- Comprensión de imágenes (fotografías, etiquetas, capturas) mezcladas con texto en el mismo registro.
- Comprensión de audio: clasificación de mensajes de voz, llamadas y grabaciones.
- Comprensión de vídeo muestreado a 2 fps, con la posibilidad de oír la pista de sonido del vídeo junto a los fotogramas.
- Entrada multimodal combinada: imagen, audio y vídeo pueden mezclarse en un único registro.
- Soporte de tool calling: no disponible (el modelo no es de chat ni genera llamadas a herramientas).
- Modo *thinking*: no disponible (es un modelo de decisión, no un modelo de razonamiento conversacional).
- Multilingüismo: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Triaje de tickets de soporte: con `state` conteniendo el texto del ticket y preguntas como `department` (choice: billing/technical), `urgency` (score) y `outage` (noul), el modelo devuelve en una pasada la cola y la prioridad correctas, lo que encaja directamente con sistemas de helpdesk.
- Enrutado de correo y buzón de voz: pasando un `state` con la transcripción y adjuntando el audio original en `audio`, se puede determinar a qué equipo va el mensaje y si requiere atención inmediata, sin necesidad de un clasificador entrenado a medida.
- Inspección industrial asistida: el ejemplo documentado combina una foto de la unidad, un audio del equipo funcionando y un vídeo del ventilador para responder a preguntas como si la placa de características es visible, si el aparato suena normal o si el ventilador gira.
- Moderación y cumplimiento de políticas: clasificación de contenido textual, de imagen o de vídeo contra una taxonomía de políticas expresada como criterios del esquema, devolviendo probabilidad por categoría.
- Análisis de calidad en contact center: procesamiento de grabaciones de llamadas (audio) para extraer motivos de contacto, sentimiento operativo y urgencia declarada, alimentando cuadros de mando de operaciones.
- Monitorización de alertas y observabilidad: convertir descripciones de incidencias o paneles en JSON con preguntas tipo `score` de severidad, permitiendo enrutar alertas de forma determinista dentro de un pipeline de CI/CD o de guardia.
- Mantenimiento predictivo sobre vídeo: análisis de clips con su banda sonora para detectar comportamientos anómalos en maquinaria, con muestreo a 2 fps y latencia de 2,8 s para un clip de 21 segundos con sonido.
- Clasificación documental a escala: procesar lotes heterogéneos (texto, JSON, imágenes) contra un mismo esquema de preguntas y obtener respuestas estructuradas y comparables, útil en ingestas de datos donde no interesa un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tarjeta del modelo original (Cloudflare/clef-omni) para consultar los benchmarks, pero esos datos no forman parte de la información proporcionada. Los únicos datos de rendimiento disponibles son medidas de latencia y memoria en hardware Apple específico, recogidas en la sección de requisitos de hardware.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, porque el repositorio está en formato MLX. No hay pesos para CUDA ni para CPU x86.
- VRAM/memoria unificada estimada (4-bit): 20,3 GB de pico a 1.000 tokens, 20,8 GB a 4.000 tokens y 22,2 GB a 14.000 tokens.
- RAM mínima del Mac: 32 GB para la variante 4-bit; 64 GB para la variante 8-bit. macOS deja que la GPU use solo en torno al 70-75 % de la RAM por defecto, de ahí que el mínimo sea superior al pico medido.
- GPU recomendadas: no se especifican modelos concretos; las mediciones se hicieron en un M5 Max con 128 GB de memoria unificada (mediana de 3 ejecuciones).
- ¿Cabe en GPU de consumo? No en el sentido habitual (NVIDIA/AMD). El equivalente es un Mac con al menos 32 GB de memoria unificada para 4-bit.
- Latencia medida (4-bit): 0,19 s a 1.000 tokens y 4,5 s a 14.000 tokens; 0,3 s para una imagen de 1 MP; 0,25 s para un clip de audio de 30 s; 2,8 s para un vídeo de 21 s con sonido.
- Comparativa interna frente a la variante 8-bit: 0,26 s / 5,4 s de latencia y 4,6 s para el vídeo de 21 s, con 35,0 GB de descarga.
- Opciones de despliegue: cargador incluido `clef_mlx.py` (uso programático, CLI `predict` y servidor local `serve`), servidor SystemOne local con endpoints `POST /v1/systemone`, `GET /health` y `GET /v1/models`. No es compatible con `mlx_vlm.generate` ni con LM Studio, que cargarían el backbone sin la cabeza de esquema.
- Dependencias: `mlx-vlm>=0.7.6,<0.8`, `huggingface_hub`, `av` (PyAV) y `pillow`; no requiere torch. Probado con mlx 0.32.3, mlx-vlm 0.7.6 y transformers 5.19.
- Límites de servicio: las peticiones demasiado largas devuelven `413` con "maximum context length"; se puede añadir `"truncate": false` (o arrancar con `--no-truncate`) para que se devuelva el error en lugar de truncar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Cuantizacion | Tamano de descarga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/clef-omni-4bit | ~31,7 B | ~3 B | 4-bit MLX | 19,8 GB | apache-2.0 | MLX / Apple Silicon |
| mlx-community/clef-omni-8bit | ~31,7 B | ~3 B | 8-bit MLX | 35,0 GB | apache-2.0 | MLX / Apple Silicon |
| Cloudflare/clef-omni | ~31,7 B | ~3 B | no cuantizado (base) | no disponible | apache-2.0 | Transformers / API Workers AI (`@cf/cloudflare/clef-omni`) |
| Clef-Flash (denso 9B) | ~9 B | denso (sin MoE) | no disponible | no disponible | no disponible | mencionado como alternativa densa mas lenta en prompts largos |

La comparación se limita al ecosistema Clef-Omni y a la variante densa Clef-Flash citada en la model card; no se dispone de datos de contexto, idiomas ni benchmarks para establecer comparaciones cuantitativas con modelos de otras familias.

## Limitaciones y advertencias

- No es un modelo de chat: usar `mlx_vlm.generate` o LM Studio produce texto sin sentido porque solo se carga el backbone y no la cabeza conjunta de esquema. Hay que usar `clef_mlx.py`.
- Requiere hardware Apple Silicon con MLX; no hay ruta oficial para CUDA, ROCm ni CPU genérica en este repositorio.
- La memoria mínima del Mac (32 GB para 4-bit) es superior al pico medido por el límite de uso de RAM que impone macOS a la GPU.
- La longitud de contexto no está documentada; el comportamiento verificado llega a 14.000 tokens en las mediciones, y las entradas que exceden el límite devuelven `413` si se desactiva el truncado.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo ni de equidad.
- Riesgo de alucinación: no disponible como métrica, pero conviene recordar que la salida son probabilidades sobre opciones predefinidas, de modo que un esquema mal diseñado (criterios ambiguos o solapados) degrada la calidad de la decisión.
- Para la comprensión de vídeo se muestrea a 2 fps, por lo que eventos breves entre fotogramas pueden no detectarse; la banda sonora solo se procesa si todos los vídeos de la petición la incluyen.
- En el servidor HTTP local, las rutas de fichero locales no se aceptan: hay que enviar data URLs, base64 crudo o URLs http(s). El servidor escucha solo en local por defecto.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef-omni y de las dependencias (mlx-vlm, PyAV, etc.) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente nula.

## Enlaces

- Repositorio HuggingFace (4-bit): https://huggingface.co/mlx-community/clef-omni-4bit
- Variante 8-bit: https://huggingface.co/mlx-community/clef-omni-8bit
- Modelo base Cloudflare/clef-omni: https://huggingface.co/Cloudflare/clef-omni
- MLX (framework, GitHub): https://github.com/ml-explore/mlx
- MLX (sitio del framework): https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- Explorando LLM con MLX y los Neural Accelerators del M5 (Apple ML Research): https://machinelearning.apple.com/research/exploring-llms-mlx-m5
