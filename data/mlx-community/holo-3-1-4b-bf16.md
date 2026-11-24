# mlx-community/Holo-3.1-4B-bf16

## Resumen

Holo-3.1-4B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por H Company, especializado en la comprensión de interfaces gráficas y en la ejecución de acciones sobre ellas (computer use y GUI agents). La versión aquí descrita, `mlx-community/Holo-3.1-4B-bf16`, es una conversión a formato MLX en bfloat16 sin cuantización, realizada con mlx-vlm 0.8.0 a partir de los pesos oficiales en bfloat16, y pensada para su ejecución en hardware Apple Silicon.

El modelo parte de una arquitectura Qwen3.5 (etiqueta `qwen3_5` en los metadatos) con 4.539.265.536 parámetros totales y una torre de visión que se mantiene en bfloat16 en todas las variantes. Su función principal es la localización de elementos en capturas de pantalla: dado un prompt y una imagen, devuelve coordenadas enteras en el rango [0, 1000] que identifican el elemento objetivo. Es relevante ahora porque ofrece una precisión de clic del 86,6 % en el benchmark WebClick con un modelo de solo 4B parámetros, lo que lo hace viable en equipos de consumo.

La licencia Apache-2.0 del modelo original se preserva en esta conversión, lo que facilita su uso comercial. El modelo soporta únicamente inglés según los metadatos, y esta variante MLX está validada por el usuario m4zar con mlx-vlm 0.8.0 y mlx 0.32.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5) con torre de visión |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta variante); existen variantes MLX 8bit y 4bit referenciadas en los benchmarks |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |
| Pipeline | image-text-to-text |
| Libreria | MLX (mlx-vlm 0.8.0) |
| Tamano del repo | 9,1 GB |
| Modelo base | Hcompany/Holo-3.1-4B |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal de la familia Qwen3.5, con una torre de visión dedicada que procesa capturas de pantalla y un componente de lenguaje que genera las respuestas. La conversión a MLX mantiene la torre de visión en bfloat16, igual que en el resto de variantes, y se realizó a partir de los pesos oficiales en bfloat16 con el comando `mlx_vlm.convert --hf-path Hcompany/Holo-3.1-4B --mlx-path Holo-3.1-4B-bf16 --dtype bfloat16`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión remite a la model card original de Hcompany/Holo-3.1-4B para los detalles de entrenamiento. La innovación destacable documentada es la receta de localización de H Company, que emplea `smart_resize` oficial, prompt específico de localización, decodificación greedy con thinking desactivado, 32 tokens nuevos y coordenadas normalizadas en [0, 1000].

## Capacidades

- Localización de elementos en capturas de pantalla: devuelve coordenadas enteras en [0, 1000] que identifican el elemento solicitado.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Ejecución de acciones orientadas a agentes de interfaz gráfica (GUI agents) y computer use.
- Soporte de razonamiento con modo thinking activable o desactivable (`enable_thinking` en la plantilla de chat); la receta de localización lo desactiva.
- Procesamiento de prompts multi-imagen (validado con 3 capturas de 1920x1080, aproximadamente 12k tokens de prompt).
- Generación de respuestas conversacionales en inglés.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de audio.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede localizar botones, campos y enlaces en capturas de pantalla durante pipelines de QA, devolviendo coordenadas que un script de automatización convierte en clics. Su precisión del 86,6 % en WebClick y su latencia de 322 ms hasta el primer token en 720p lo hacen adecuado para bucles de prueba interactivos.
- Agentes de navegación web: integrado en un agente que captura la pantalla del navegador, Holo-3.1-4B identifica el siguiente elemento a pulsar (por ejemplo, un enlace de resultados o un botón de formulario) y permite secuencias multi-paso. El subconjunto agentbrowse de WebClick alcanza el 93,1 % de acierto.
- Asistentes de escritorio para personas con movilidad reducida: el modelo traduce instrucciones en lenguaje natural a coordenadas sobre la pantalla, habilitando control por voz o texto de aplicaciones de escritorio.
- Extracción de datos de formularios y calendarios: con un 79,7 % de acierto en el subconjunto calendars, puede señalar campos de fecha y hora en interfaces de reserva para automatizar la selección.
- Automatización de flujos RPA (robotic process automation): sustituye selectores frágiles basados en DOM por localización visual, lo que permite automatizar aplicaciones heredadas o sin API accesible.
- Ejecución local en portátiles Apple Silicon: al ocupar 10,8 GB de pico en bf16 y decodificar a 54-55 tok/s en un M5 Max, es viable para prototipos de agentes de escritorio que deben funcionar sin conexión ni enviar capturas a la nube.
- Evaluación de accesibilidad de interfaces: el modelo puede señalar elementos y ayudar a verificar que los controles son localizables visualmente en distintos tamaños de pantalla (720p y 1080p validados).

## Benchmarks y rendimiento

Benchmark WebClick (Hcompany/WebClick, Apache-2.0), 1639 muestras, protocolo oficial de localización de H Company (smart_resize y prompt oficiales, thinking desactivado, greedy, 32 tokens nuevos, coordenadas en [0, 1000]), con mlx-vlm 0.8.0:

| Modelo | Precisión | IC 95 % |
|---|---|---|
| MLX bf16 (este modelo) | 86,6 % | 84,8 a 88,1 |
| MLX 8bit | 86,5 % | 84,7 a 88,0 |
| MLX 4bit | 85,8 % | 84,0 a 87,4 |

Desglose por subconjunto para este modelo:

| Subconjunto | Precisión | n |
|---|---|---|
| agentbrowse | 93,1 % | 590 |
| calendars | 79,7 % | 528 |
| humanbrowse | 86,2 % | 521 |

Velocidad en Apple M5 Max (128 GB, petición única, greedy, mediana de 3 ejecuciones):

| Motor | 1280x720: primer token / decodificación | 1920x1080: primer token / decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (bf16) | 322 ms / 54 tok/s | 695 ms / 55 tok/s | 10,8 GB (pico) |

Con prompt multi-imagen largo (3 capturas a 1920x1080, aproximadamente 12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo hasta el primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (bf16) | 4,9 s* | 47 tok/s | 11,1 GB (pico) |

El asterisco indica que la medición varió más de un 10 % entre ejecuciones, por lo que debe tomarse como indicativa. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: 10,8 GB de pico en bf16 para una captura de 1280x720 y 11,1 GB para un prompt de 3 imágenes a 1920x1080. El repositorio ocupa 9,1 GB en disco.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon; las mediciones se realizaron en un Apple M5 Max con 128 GB de memoria unificada. Para GPUs NVIDIA no se proporcionan datos en esta variante.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada para bf16; las variantes 4bit y 8bit del mismo modelo reducen el requisito (no se detallan sus cifras de memoria).
- Opciones de despliegue: mlx-vlm 0.8.0 (línea de comandos `python -m mlx_vlm.generate` o API de Python con `load` y `generate`), con mlx 0.32.4. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: 322 ms hasta el primer token y 54 tok/s de decodificación en 720p; 695 ms y 55 tok/s en 1080p; 4,9 s hasta el primer token y 47 tok/s con un prompt de aproximadamente 12k tokens. Cada respuesta de clic ronda los 14 tokens, por lo que el tiempo hasta el primer token domina la latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WebClick (precisión) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-3.1-4B-bf16 (MLX) | 4,54 B | no disponible | 86,6 % | Apache-2.0 | Hugging Face (mlx-community) |
| Holo-3.1-4B (original, Hcompany) | 4,54 B | no disponible | no disponible en esta ficha | Apache-2.0 | Hugging Face (Hcompany) |
| Variante MLX 8bit | no disponible | no disponible | 86,5 % | Apache-2.0 | Hugging Face (mlx-community) |
| Variante MLX 4bit | no disponible | no disponible | 85,8 % | Apache-2.0 | Hugging Face (mlx-community) |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otros autores (por ejemplo, otros agentes GUI de tamaño similar), por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado.
- Dominio restringido: está especializado en localización de elementos y computer use; no se documentan capacidades generales de razonamiento, código o matemáticas, y los benchmarks publicados se limitan a WebClick.
- Precisión variable por tipo de interfaz: el subconjunto calendars cae al 79,7 %, frente al 93,1 % de agentbrowse, lo que indica un rendimiento inferior en interfaces de selección de fechas.
- Riesgo de alucinación de coordenadas: al devolver puntos en [0, 1000] sin mecanismo de abstención documentado, puede señalar elementos inexistentes o incorrectos; conviene validar el clic con comprobaciones posteriores.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Limitaciones de contexto: la longitud de contexto no está especificada; las pruebas con prompts largos se limitan a unas 12k tokens con 3 imágenes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución y el aviso de licencia del modelo original de H Company.
- Caveat de producción: las mediciones de velocidad proceden de un único equipo (Apple M5 Max) y algunas celdas variaron más de un 10 %; deben considerarse indicativas. Esta conversión MLX no es apta para despliegue en GPUs NVIDIA sin una conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Holo-3.1-4B-bf16
- Modelo base original: https://huggingface.co/Hcompany/Holo-3.1-4B
- Documentación de localización de H Company: https://hub.hcompany.ai/models-api/element-localization
- Sitio de H Company: https://www.hcompany.ai/
- Dataset de benchmark WebClick: https://huggingface.co/datasets/Hcompany/WebClick
