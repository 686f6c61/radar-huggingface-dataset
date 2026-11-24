# cgb/wan21-self-forcing-onnx-webgpu

## Resumen

`cgb/wan21-self-forcing-onnx-webgpu` es un paquete de pesos en formato ONNX que permite ejecutar generación de vídeo a partir de texto (text-to-video) íntegramente dentro de un navegador web mediante WebGPU y ONNX Runtime Web. No es un modelo entrenado desde cero, sino una conversión y cuantización de dos trabajos previos: el transformador de difusión de Wan 2.1 T2V-1.3B (Alibaba) y los pesos destilados de Self-Forcing (Xun Huang et al.), que permiten generar el vídeo de forma causal por fragmentos en lugar de muestrear el clip completo en decenas de pasos. Lo publica el usuario cgb y se distribuye con licencia Apache-2.0.

La relevancia del paquete es de ingeniería: demuestra que un modelo de difusión de vídeo de 1.300 millones de parámetros puede ejecutarse en el GPU del visitante de una página web, sin servidor, con una descarga inicial de 4,6 GB y un consumo pico de 13,2 GiB de VRAM para un clip de 5 segundos a 832x480. Para lograrlo, el autor sustituye el VAE completo por el decodificador ligero TAEHV (unos 20 MB), cuantiza el codificador de texto umT5-XXL a int4 y el denoiser a int8 por bloques de 128, y divide los pesos en fragmentos por debajo de 2 GiB, límite de búfer de un navegador.

El repositorio ocupa 5,0 GB e incluye tres grafos ONNX (dos variantes del denoiser, v3 y v5, que comparten fichero de pesos) más el codificador de texto, el decodificador y el tokenizador. Es una versión derivada y modificada, no un lanzamiento oficial de Wan, Self-Forcing ni TAEHV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (Wan 2.1 T2V-1.3B) con destilación causal de Self-Forcing; codificador de texto umT5-XXL; decodificador TAEHV |
| Parametros totales | 1.300 millones (transformador de difusión); umT5-XXL como codificador de texto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de texto (entrada del codificador, con relleno a cero); caché KV de atención sobre todos los fragmentos ya generados |
| Tipos de cuantizacion | Codificador de texto int4 (tabla de tokens int8); denoiser int8 con bloques de 128; decodificador TAEHV en fp16 |
| Idiomas soportados | No disponible (el prompt de texto se procesa con umT5; no se documenta cobertura lingüística) |
| Licencia | Apache-2.0 (TAEHV bajo MIT, en `LICENSE-TAEHV`) |
| Formato de pesos | ONNX (`.onnx` + `.data` + shards); ficheros divididos por debajo de 2 GiB con `*.manifest.json` como `externalData` |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo nuevo: reutiliza los pesos de Wan 2.1 T2V-1.3B, un transformador de difusión para texto a vídeo, y los pesos destilados de Self-Forcing, que hacen que el mismo transformador genere el clip de forma causal, tres fotogramas latentes por fragmento y cuatro pasos por fragmento (timesteps 1000, 750, 500 y 250, con shift 5), atendiendo a una caché de claves y valores de todo lo ya dibujado. Esa generación causal por fragmentos es lo que hace viable la ejecución en navegador, frente al muestreo de 50 pasos sobre el clip completo. El codificador de texto umT5-XXL produce una representación de `[1, 512, 4096]` en fp16 a partir del prompt, y la decodificación de latentes a píxeles la realiza TAEHV, un decodificador de unos 20 MB que sustituye al VAE completo y procesa tres fotogramas latentes a la vez con tres anteriores como contexto.

El trabajo de conversión incluye varias correcciones técnicas documentadas por el autor: restaurar el atado de `shared.weight` con `encoder.embed_tokens` en umT5 (la carga estándar de transformers dejaba los embeddings de tokens inicializados aleatoriamente), reescribir las comprobaciones `IsInf` sobre estados ocultos fp16 como `abs(x) > 65504` porque el backend WebGPU de ONNX Runtime no tiene kernel para ellas, y gestionar la caché KV de forma que el grafo devuelva solo las claves y valores del fragmento nuevo (copiadas a un búfer asignado una vez a la longitud total del clip), en lugar de devolver pasado más nuevo, que disparaba el consumo hasta 28,7 GiB en un clip de 5 segundos a 480p. Se ofrecen dos grafos del denoiser sobre los mismos pesos: v3 (atención como MatMuls troceados, más rápido con poca caché) y v5 (self-attention fusionada, más rápido y ligero cuando la caché crece).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en el navegador, sin servidor.
- Generación causal por fragmentos de tres fotogramas latentes, con cuatro pasos de difusión por fragmento.
- Resoluciones y duraciones documentadas: 2 s (33 fotogramas) a 416x240 y 5 s (81 fotogramas) a 832x480.
- Ejecución completamente local tras la descarga inicial de 4,6 GB; funciona sin conexión.
- Inferencia en WebGPU mediante ONNX Runtime Web, con caché KV mantenida en GPU (`preferredOutputLocation: "gpu-buffer"`).
- Dos grafos de denoiser intercambiables según la longitud del clip y el tamaño de la caché.
- No se documentan tool calling, function calling, capacidades de agente, modo de razonamiento ni entrada de audio o imagen.

## Casos de uso

- Demostración interactiva de texto a vídeo en una web pública: la página carga el paquete una vez y cada visitante genera clips en su propio GPU, sin coste de inferencia en servidor ni envío de prompts a un backend.
- Prototipado de ideas visuales en local: un desarrollador puede probar prompts y composiciones de 2 a 5 segundos sin instalar CUDA ni descargar el modelo completo de Wan.
- Aplicaciones de privacidad estricta: al ejecutarse todo en el cliente, el prompt y el vídeo nunca salen del navegador, lo que encaja en entornos con requisitos de confidencialidad.
- Educación y divulgación técnica: sirve para explicar difusión, destilación causal y ejecución de modelos en WebGPU con un caso real y medible.
- Integración en editores o herramientas creativas web: el paquete puede alimentar una vista previa de vídeo generado dentro de una aplicación de navegador, con la caché KV gestionada por la propia página.
- Evaluación de infraestructura cliente: permite medir el rendimiento real de GPU de consumo (por ejemplo, una RTX 5090) en cargas de difusión de vídeo sin montar un servidor de inferencia.
- Base para conversiones propias: los grafos y el manifiesto de fragmentos sirven de referencia para exportar otros modelos de difusión a ONNX con ejecución en WebGPU.

## Benchmarks y rendimiento

El autor publica tiempos y memoria pico medidos en una RTX 5090 con la página de demostración, una vez cargados los modelos:

| Clip | Tiempo | Memoria GPU pico |
|---|---|---|
| 2 s (33 fotogramas), 416x240 | unos 11 s | 7,5 GiB |
| 5 s (81 fotogramas), 832x480 | unos 90 s | 13,2 GiB |

Comparativa interna de los dos grafos del denoiser en el último fragmento de un clip de 5 s a 480p:

| Grafo | Tiempo por pasada | Memoria |
|---|---|---|
| v5 (self-attention fusionada) | 3,75 s | 4 GiB |
| v3 (MatMuls troceados) | 6,0 s | 15 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de calidad de vídeo (FVD, CLIP score).

## Requisitos de hardware

- VRAM estimada: 7,5 GiB para clips de 2 s a 416x240 y 13,2 GiB para clips de 5 s a 832x480, medidos en una RTX 5090.
- GPU recomendadas: RTX 5090 como referencia documentada; se requiere una GPU con soporte de WebGPU en el navegador. No se documentan resultados en A100, H100 ni otras tarjetas.
- GPU de consumo: cabe en tarjetas de gama alta con al menos 8 GiB para clips cortos y unos 14 GiB para clips de 5 s a 480p; no se documenta comportamiento en tarjetas de gama media o baja.
- Almacenamiento y red: descarga inicial de 4,6 GB; el navegador conserva los pesos para uso posterior sin conexión.
- Despliegue: ONNX Runtime Web con backend WebGPU dentro del navegador; los pesos se pasan a `InferenceSession.create` como `externalData` mediante los manifiestos de cada grafo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 11 s para 33 fotogramas a 416x240 y 90 s para 81 fotogramas a 832x480 en RTX 5090; el cuello de botella declarado es la gestión de la caché KV, que debe permanecer en GPU entre fragmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgb/wan21-self-forcing-onnx-webgpu | 1.300 M (difusion) + umT5-XXL | 512 tokens de texto; clips de 2 a 5 s | Navegador con WebGPU (ONNX Runtime Web) | Apache-2.0 (TAEHV MIT) | Hugging Face, 5,0 GB |
| Wan-AI/Wan2.1-T2V-1.3B | 1.300 M | No disponible en la informacion | Servidor con GPU, framework de difusion | Apache-2.0 | Hugging Face |
| gdhe17/Self-Forcing | No disponible en la informacion | Generacion causal por fragmentos | Servidor con GPU | Apache-2.0 | Hugging Face |

La comparación con alternativas de otros tamaños o familias no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una versión derivada y modificada; no es un lanzamiento oficial de Wan, Self-Forcing ni TAEHV, y el autor no garantiza paridad con los originales.
- La cobertura de idiomas del codificador umT5 no se documenta; el prompt se limita a 512 tokens con relleno a cero.
- Solo se documentan dos configuraciones de salida (2 s a 416x240 y 5 s a 832x480); no hay datos sobre otras resoluciones o duraciones.
- El rendimiento medido corresponde a una RTX 5090; en GPU menos potentes los tiempos pueden crecer de forma no lineal por la gestión de la caché y el límite de búfer de 2 GiB del navegador.
- El driver propio de FreeGen para el paquete no es público; el autor describe los pasos, pero la integración completa debe reimplementarse.
- Riesgo de alucinación visual y de resultados plausibles pero incorrectos: el propio autor documenta fallos de conversión que producían vídeos coherentes de algo no solicitado, lo que subraya la necesidad de validar la exportación.
- La licencia Apache-2.0 permite uso comercial, pero TAEHV se distribuye bajo MIT y debe respetarse su aviso; los términos de los modelos base deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgb/wan21-self-forcing-onnx-webgpu
- Demostración en navegador: https://freegen.ai/video
- Blog del autor sobre la conversión: https://freegen.ai/blog/text-to-video-in-the-browser
- Modelo base Wan 2.1 T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Pesos Self-Forcing: https://huggingface.co/gdhe17/Self-Forcing
- Decodificador TAEHV: https://github.com/madebyollin/taehv
