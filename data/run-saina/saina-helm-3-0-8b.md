# run-saina/saina-helm-3-0.8b

## Resumen

Saina Helm 3 0.8B es un modelo de decisión multimodal desarrollado por run-saina y publicado como preview. Lee texto, imágenes y audio en una misma petición y responde preguntas tipadas —sí/no, elección única, elección múltiple o valoración— devolviendo probabilidades y un nivel de confianza en lugar de generar texto. Está pensado para decisiones recuperables o revisables, como enrutar un ticket con su captura, comprobar un recibo contra una reclamación o marcar un audio sospechoso.

El modelo es un fine-tuning de Qwen/Qwen3.5-0.8B y cuenta con 852.985.920 parámetros (≈0,853 B). La model card no detalla la longitud de contexto ni la composición del entrenamiento. Su propuesta técnica es resolver varias preguntas sobre la misma entrada en una sola pasada y abstenerse cuando la confianza es baja en modo decisión.

Su relevancia actual está en ofrecer una alternativa pequeña, ejecutable en una GPU de consumo, Apple silicon o CPU, para integrar decisiones multimodales con confianza calibrable en pipelines y agentes, sin depender de un modelo generativo grande. La licencia Apache 2.0 facilita su adopción comercial, aunque al ser preview conviene fijar una revisión concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-0.8B con cabezas de respuesta para preguntas tipadas; detalles internos no disponibles |
| Parámetros totales | 852.985.920 (≈0,853 B) |
| Parámetros activos | No disponible; no se documenta como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (llama.cpp) y MLX; no se detalla la lista completa de cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF y MLX |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna más allá de que deriva de Qwen/Qwen3.5-0.8B mediante fine-tuning. La model card describe un modelo de decisión multimodal nativo con cabezas de respuesta para preguntas tipadas; no especifica si emplea atención completa, lineal o híbrida, ni el número de capas o dimensiones ocultas. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

La innovación declarada es funcional: una única pasada sobre la entrada compartida responde múltiples preguntas, cada una con probabilidades, y el modo decisión permite devolver abstención con un umbral. No se han publicado resultados de benchmarks en la información disponible.

## Capacidades

- Clasificación multimodal any-to-any: procesa texto, imágenes y audio en la misma petición.
- Preguntas tipadas: `yes_no`, `single_choice` (2 a 255 opciones), `multi_choice` (pertenencia independiente por opción) y `rating` (2 a 10 niveles ordenados).
- Devuelve probabilidades, selección, nivel esperado y confianza; no genera texto.
- Responde varias preguntas sobre la misma entrada en una sola pasada.
- Modo decisión con umbral: devuelve respuestas vacías y un motivo cuando la confianza es baja, para escalar a revisión humana.
- Límites de entrada: hasta 8 imágenes por petición (PNG, JPEG, WebP; 10 MB cada una) y hasta 4 audios por petición (WAV, FLAC, MP3, Ogg, WebM; 10 MB y 10 s cada uno).
- Los tags incluyen `agents`, aunque el modelo no genera texto ni documenta tool calling generativo; su papel en un agente es puntuar opciones de decisión.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte con captura: enviar el texto del cliente, una captura de pantalla y una pregunta `single_choice` con las colas disponibles; el modelo devuelve la selección y la confianza, y el sistema deriva a un humano si la confianza queda por debajo del umbral.
- Verificación de gastos contra póliza: pasar un `state` JSON con importe reclamado y política, la imagen del recibo y dos preguntas —`yes_no` sobre si el total coincide y `single_choice` con aprobar, revisar o rechazar—; el modo decisión permite abstenerse en casos ambiguos.
- Triaje de llamadas con posible voz sintética: analizar un clip de audio de hasta 10 segundos junto con metadatos textuales y una pregunta `yes_no` o `rating`; el resultado se usa para marcar la llamada para revisión, no para decidir de forma automática.
- Etiquetado multimodal de catálogo: clasificar imágenes y clips de sonido con `multi_choice`, obteniendo pertenencias independientes por etiqueta en una sola pasada.
- Control de calidad documental: evaluar facturas, formularios o capturas con preguntas `yes_no` sobre presencia de campos y `rating` sobre legibilidad; útil para priorizar revisiones en pipelines de digitalización.
- Componente de decisión en agentes: dada una descripción de estado y varias imágenes, puntuar acciones candidatas y elegir la de mayor probabilidad o abstenerse; el agente conserva la generación de texto en otro modelo.
- Auditoría de reclamaciones con múltiples comprobaciones: formular varias preguntas sobre el mismo recibo —total, fecha, política aplicable— aprovechando que todas se responden en una única pasada.
- Clasificación de sonidos ambientales: usar `audio-classification` con un conjunto cerrado de etiquetas para etiquetar eventos sonoros cortos en lotes de hasta cuatro clips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB solo para pesos en fp16; con overhead de activaciones y entrada multimodal, alrededor de 2 a 3 GB. En 8 bits, unos 0,9 GB; en 4 bits, unos 0,5 GB. Son estimaciones a partir de los 852.985.920 parámetros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 son suficientes. No requiere A100 ni H100.
- Cabe en GPU de consumo y en Apple silicon mediante MLX; también puede ejecutarse en CPU.
- Opciones de despliegue: paquete `saina` con PyTorch, MLX, GGUF con llama.cpp, Ollama con la build de Saina, servidor propio con `saina[local,server,media]` y API alojada en saina.run.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saina Helm 3 0.8B | 0,853 B | No disponible | Texto, imagen y audio | Apache 2.0 | HuggingFace, API, MLX, GGUF y Ollama |
| Qwen/Qwen3.5-0.8B (base) | ≈0,8 B; no confirmado en la información | No disponible | No disponible en la información | No disponible | HuggingFace |
| Alternativas multimodales de clasificación | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la documentación proporcionada alternativas comparables de clasificación multimodal con texto, imagen y audio en el rango de 0,8 B.

## Limitaciones y advertencias

- No genera texto de ningún tipo; solo puntúa las opciones proporcionadas.
- No soporta vídeo ni audio de más de 10 segundos.
- No debe usarse para decisiones finales sin revisión con consecuencias materiales en crédito, empleo, medicina o ámbito legal.
- No debe emplearse para identificar o clasificar personas ni para perfilar individuos.
- No está diseñado para filtrado de seguridad ni moderación de contenido.
- Riesgo de inyección de instrucciones: el texto, las imágenes y el audio no confiables pueden contener indicaciones que alteren las respuestas; no debe decidir directamente sobre contenido no verificado.
- Es una versión preview: los pesos pueden cambiar, por lo que conviene fijar una revisión concreta.
- Los idiomas soportados no están documentados; es necesario validar el rendimiento en el idioma de despliegue.
- No se documentan sesgos; deben evaluarse con datos propios y etiquetas propias antes de producción.
- Requiere `saina` 0.9 o superior; versiones anteriores rechazan el modelo.
- Las etiquetas deben estar dentro de los límites documentados: 2 a 255 opciones en elección única y múltiple, y 2 a 10 niveles en valoración.
- La calibración de la confianza y del umbral de abstención debe validarse en el dominio de uso.
- Aunque la model card declara Apache 2.0, conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B para el uso comercial previsto.

## Enlaces

- [HuggingFace: run-saina/saina-helm-3-0.8b](https://huggingface.co/run-saina/saina-helm-3-0.8b)
- [API alojada saina.run](https://saina.run)
- [Paquete saina en PyPI](https://pypi.org/project/saina/)
- [Versión MLX para Apple silicon](https://huggingface.co/run-saina/saina-helm-3-0.8b-MLX)
- [Versión GGUF para llama.cpp](https://huggingface.co/run-saina/saina-helm-3-0.8b-GGUF)
- [Ollama: run-saina/saina-helm-3-0.8b](https://ollama.com/run-saina/saina-helm-3-0.8b)
- [Build de Ollama con soporte Helm 3](https://github.com/ramarlina/ollama/tree/helm3-bidirectional-prompt)
- [Repositorio run-saina/saina](https://github.com/run-saina/saina)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
