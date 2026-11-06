# Mrbizarro/Pika-H3-Flex-MLX

## Resumen

Pika-H3-Flex-MLX es un adaptador LoRA para generación de vídeo con audio sincronizado, convertido para ejecutarse de forma nativa en Apple Silicon mediante la librería MLX. Lo publica el desarrollador independiente Mrbizarro (Phosphene) y deriva del adaptador FL2VA original de Pika-Labs/Pika-H3-Flex, que a su vez se apoya en el modelo base MiniMaxAI/MiniMax-H3. No es un modelo completo: contiene únicamente los pesos del LoRA (rango 128, alpha 128) reordenados para el runner de H3 en MLX, por lo que requiere descargar aparte los pesos base de MiniMax H3 en una revisión concreta.

Su relevancia es práctica: el lanzamiento original de Pika está pensado para una única GPU NVIDIA H100, y esta conversión permite generar vídeo con sonido en un Mac sin GPU NVIDIA ni servicios en la nube. Según el autor, es el primer port a Mac de Pika H3 Flex. El repositorio ocupa 2,0 GB y la generación se realiza en 6 pasos de muestreo a partir de un prompt y, opcionalmente, un primer fotograma de referencia.

La ficha describe un adaptador de generación de vídeo, no un modelo de lenguaje: las filas de parámetros, contexto o idiomas no aplican en el sentido habitual y se indican como no disponibles cuando la información no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128, alpha 128) sobre el DiT de MiniMax H3; ejecución con MLX en Apple Silicon |
| Parametros totales | no disponible (es un adaptador; los pesos base de MiniMax H3 se distribuyen por separado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; no hay ventana de contexto textual) |
| Tipos de cuantizacion | pesos del adaptador en bfloat16; el motor H3 del repo se documenta con cuantización Q8 |
| Idiomas soportados | no disponible (los prompts se procesan en el idioma que acepte el modelo base) |
| Licencia | MiniMax H3 Community License Agreement (excluye UE, Reino Unido, Corea del Sur y EE. UU.); el código de Pika es Apache-2.0 |
| Formato de pesos | safetensors (`pika_h3_flex_fl2va_mlx.safetensors`), más manifiesto JSON |
| Tarea | image-to-video con audio sincronizado |
| Tamano del repositorio | 2,0 GB |
| Modelo base | Pika-Labs/Pika-H3-Flex y MiniMaxAI/MiniMax-H3 (revisión `42ed227ee7df40d41602854ae760620d6eb651fe`) |
| Muestreo | sampler renoise, knots 1000, 750, 500, 250, 100, 40, 0; video shift 12, audio shift 3 |
| Pasos de inferencia | 6 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusión (DiT) de MiniMax H3, que genera vídeo y audio de forma conjunta. Pika H3 Flex añade un LoRA de rango 128 y alpha 128 entrenado para la tarea FL2VA (first-last frame to video with audio, es decir, generación condicionada por primer fotograma y con pista de sonido). La conversión a MLX no reentrena ningún peso: únicamente reorganiza el adaptador original de Pika (`fl2va/adapter.safetensors`, sha256 `8ed6115d…7b9327`, revisión `0ddf55ad`) para que encaje con el runner de H3 en MLX. Los cambios concretos son la fusión de las proyecciones q, k y v en un único LoRA qkv por cabeza, el intercambio de las mitades del `fc1` de SwiGLU a `[gate; value]` y la conversión de float32 a bfloat16 con redondeo al par más cercano. El fichero resultante tiene sha256 `c71f527d0092dd43d368a20223d4aec41e7a1cca6abecdc457d54cee785f0327`.

No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste por refuerzo o preferencias. La innovación destacable es de despliegue: un LoRA de pocos pasos (6) que reproduce vídeo con audio en hardware Apple, frente a los 15 pasos del H3 base, con una reducción de tiempo de render de aproximadamente 36,5 a 16 minutos para el mismo plano a 1024×576 y 5 segundos en un M4 Max.

## Capacidades

- Generación de vídeo a partir de un prompt de texto y, opcionalmente, un primer fotograma de referencia (image-to-video).
- Generación de audio sincronizado con el vídeo en la misma pasada de inferencia.
- Generación en 6 pasos de muestreo, lo que reduce el coste frente a los 15 pasos del modelo base.
- Producción de clips de hasta 15 segundos, encadenando tres ventanas de 5 segundos.
- Resoluciones soportadas: 640×384, 1024×576 y 1344×768 (esta última con requisitos elevados de memoria y disco).
- Ejecución local nativa en Apple Silicon mediante MLX, sin GPU NVIDIA ni nube.
- Integración con la aplicación Phosphene para Mac (editor, keyframes, storyboards, lip-sync y previsualización en vivo durante el render).
- No soporta tool calling ni razonamiento multi-step en el sentido de un modelo de lenguaje; es un modelo generativo de vídeo.
- La variante Ref2VA (múltiples referencias) no está convertida en esta versión.

## Casos de uso

- Prototipado rápido de vídeo publicitario: generar clips de 5 segundos a 640×384 en unos 5 minutos en un M4 Max permite iterar sobre variantes de un anuncio sin coste de nube ni GPU dedicada.
- Previsualización de storyboards: usar un primer fotograma como referencia para convertir bocetos en planos animados con sonido, útil en equipos de dirección de arte que trabajan en Mac.
- Creación de contenido para redes sociales: clips cortos de 1024×576 con audio sincronizado generados localmente, adecuados para publicaciones que requieren vídeo vertical u horizontal de pocos segundos.
- Cortometrajes y piezas narrativas: el ejemplo del autor, un corto de 20 segundos en cuatro planos conectados con vídeo y sonido generados localmente, demuestra la viabilidad de producir secuencias narrativas breves en un solo equipo.
- Generación de vídeo con sonido en entornos con restricciones de privacidad: al ejecutarse en local, los prompts y los fotogramas de referencia no salen del equipo, lo que encaja en sectores con datos sensibles.
- Docencia y experimentación en generación multimodal: permite estudiar el comportamiento de un DiT de vídeo y audio con LoRA de pocos pasos en hardware de consumo, sin depender de infraestructura de centro de datos.
- Integración en flujos de edición: la app Phosphene ofrece editor, keyframes y previsualización en vivo, de modo que el modelo se inserta en un pipeline de postproducción local en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor sí publica mediciones de tiempo y memoria en un Mac con M4 Max de 64 GB y motor H3 Q8 a 6 pasos:

| Clip | Tiempo | Memoria pico |
|---|---|---|
| 640×384, 5 s | 5 min | 25,7 GiB |
| 1024×576, 5 s | 16 min (H3 base, 15 pasos: 36,5 min) | 27,2 GiB |
| 1024×576, 15 s (tres ventanas de 5 s) | 55 min | 27,3 GiB |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (el autor mide en un M4 Max con 64 GB de memoria unificada).
- Memoria: en torno a 25,7-27,3 GiB de pico según resolución y duración; 1344×768 funciona pero exige mucha memoria libre y espacio en disco.
- No requiere GPU NVIDIA; el lanzamiento original de Pika apunta a una H100.
- El adaptador ocupa 2,0 GB, pero hay que sumar los pesos base de MiniMax H3 en la revisión indicada.
- Despliegue: librería MLX y la aplicación Phosphene para Mac (instalador único, sin terminal). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5 minutos para 640×384/5 s; 16 minutos para 1024×576/5 s; 55 minutos para 1024×576/15 s, siempre en M4 Max de 64 GB con motor Q8 y 6 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto o duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pika-H3-Flex-MLX (este) | LoRA sobre MiniMax H3, port a MLX | 6 | hasta 15 s (tres ventanas de 5 s) | MiniMax H3 Community License | Hugging Face, ejecución local en Mac |
| Pika-H3-Flex (original) | LoRA FL2VA sobre MiniMax H3 | no disponible | 15 s en una sola pasada (versión alojada) | MiniMax H3 Community License | Hugging Face, orientado a NVIDIA H100 |
| MiniMax H3 (base) | DiT de vídeo y audio | 15 | no disponible | MiniMax H3 Community License | Hugging Face |
| LTX-2.5 | Generación de vídeo con sonido | no disponible | no disponible | no disponible | Integrado en Phosphene para Mac |

La comparación con otros modelos de vídeo de la misma categoría (por ejemplo, familias de generación de vídeo con audio de otros proveedores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin los pesos base de MiniMax H3 en la revisión `42ed227ee7df40d41602854ae760620d6eb651fe` no funciona.
- El modelo descarta a las personas que no se mencionan en el prompt, aunque aparezcan en el primer fotograma; hay que nombrar a todos los que deban permanecer en escena.
- Los clips de 15 segundos se construyen encadenando tres ventanas de 5 segundos, por lo que decorados y personajes secundarios pueden derivar; la versión alojada de Pika renderiza 15 segundos en una sola pasada.
- 1344×768 funciona pero requiere mucha memoria y disco libres.
- La variante Ref2VA (múltiples referencias) no está convertida.
- Es una versión preview; el autor pide reportar fallos en el repositorio de GitHub de Phosphene.
- La licencia MiniMax H3 Community License excluye expresamente la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos de América, e incluye una política de uso aceptable; hay que leerla antes de descargar o usar los pesos. Esto afecta directamente a un uso comercial desde España.
- No se documentan sesgos específicos ni tasas de alucinación medibles; al ser un modelo generativo de vídeo, el riesgo principal es la deriva visual y de audio en secuencias largas.
- No se dispone de información sobre idiomas soportados en los prompts.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mrbizarro/Pika-H3-Flex-MLX
- Modelo base Pika: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Aplicación Phosphene: https://phosphene.video
- Incidencias de Phosphene: https://github.com/mrbizarro/Phosphene/issues
- Licencia en el repositorio: https://huggingface.co/Mrbizarro/Pika-H3-Flex-MLX/blob/main/LICENSE
