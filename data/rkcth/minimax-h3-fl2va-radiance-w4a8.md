# rkcth/MiniMax-H3-FL2VA-Radiance-W4A8

## Resumen

MiniMax-H3-FL2VA-Radiance-W4A8 es una conversión cuantizada del modelo MiniMax-H3 de MiniMax, publicada por el usuario rkcth. Se trata de un checkpoint completo en formato Radiance (`.rad`) de 53,31 GiB que incluye el codificador de texto/visión, los códecs de vídeo y los componentes de audio del modelo original, además del denoiser convertido a partir de los pesos `transformer/` del repositorio upstream. El pipeline declarado es image-to-video, con capacidad de generar vídeo con sonido a partir de texto, animar un primer fotograma o guiar el clip mediante primer y último fotograma.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo, sino de un artefacto de cuantización orientado específicamente al ecosistema AMD/ROCm mediante el runtime Radiance, un fork del proyecto Radiance mantenido por el propio autor. Las cuatro proyecciones principales del denoiser usan pesos de cuatro bits con rotación de Hadamard e activaciones INT8 (W4A8); el resto de tensores emplea INT8, BF16 o FP32 según la receta de conversión incluida. Los LoRA son adaptadores separados y no están fusionados en estos pesos.

El modelo está pensado para despliegues en hardware Radeon con ROCm, no para consumidores de GPU NVIDIA ni para inferencia convencional con llama.cpp o vLLM. La validación publicada se limita a pruebas funcionales de generación de primer fotograma a 864×480 sobre dos Radeon AI PRO R9700 de 32 GiB con aproximadamente 184 GiB de RAM de host. La licencia MiniMax H3 Community License restringe territorios, uso y redistribución, con exclusiones explícitas para la UE, el Reino Unido, Corea del Sur y EE. UU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusión para vídeo con audio; denoiser transformer con proyecciones cuantizadas) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (presupuesto de procesamiento compartido entre prompt, duración y referencias) |
| Tipos de cuantizacion | W4A8 en las cuatro proyecciones principales del denoiser (4 bits con rotación de Hadamard, activaciones INT8); INT8, BF16 y FP32 en el resto según receta |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (componentes del codificador Qwen bajo Apache 2.0) |
| Formato de pesos | `.rad` (Radiance), checkpoint de 53,31 GiB; SHA-256 incluido en el repositorio |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniMax-H3 más allá de que se trata de un modelo de generación de vídeo con audio, con un denoiser transformer del que se han convertido sus cuatro proyecciones principales. El pipeline declarado es image-to-video y el modelo soporta tareas de texto a vídeo con sonido, animación de primer fotograma y guiado por primer y último fotograma (FL2VA). El checkpoint incluye codificador de texto/visión, códecs de vídeo y componentes de audio.

El proceso de conversión, documentado por el autor, parte de la revisión `42ed227ee7df40d41602854ae760620d6eb651fe` de `MiniMaxAI/MiniMax-H3`. Los pesos del denoiser se transforman a cuatro bits con rotación de Hadamard e activaciones INT8 en las proyecciones principales, mientras que el resto de tensores se mantienen en INT8, BF16 o FP32 según la receta. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la propia cuantización W4A8 con rotación de Hadamard orientada a hardware AMD mediante el runtime Radiance, que requiere un parche de código fuente (`radiance-h3-support.patch`) aplicado sobre una revisión concreta del fork.

## Capacidades

- Generación de vídeo con audio sincronizado en estéreo a 32 kHz a partir de texto.
- Animación de un primer fotograma (image-to-video) con control de modo de encuadre (`center`).
- Guiado mediante primer y último fotograma (FL2VA).
- Generación de vídeo con referencias de imagen: el runtime Ref2VA acepta hasta nueve imágenes de referencia, sujeto a su presupuesto de filas.
- Ruta separada de vídeo de referencia con codificación a resolución reducida.
- Control de dimensiones de salida (múltiplos de 32, mínimo 256, relación de aspecto máxima 4:1) y de duración del clip.
- Control de pasos de inferencia (programación estándar de 50 puntos de rejilla y 49 evaluaciones del denoiser) y semilla.
- Integración con un cliente auxiliar (`krea2_to_h3.py`) para animar imágenes guardadas de Krea o solicitar primero una imagen fija de Krea.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje conversacional.

## Casos de uso

- Generación de clips publicitarios cortos con audio: el modelo produce vídeo de unos 5 segundos a 24 fps (124 fotogramas) con audio estéreo sincronizado, adecuado para piezas breves de redes sociales o teasers.
- Animación de ilustraciones o fotografías fijas: a partir de un primer fotograma se genera movimiento coherente con el prompt, útil para dar vida a material gráfico estático en estudios de diseño.
- Prototipado de secuencias con transición controlada: el modo FL2VA permite fijar primer y último fotograma para generar la transición intermedia, aplicable a animáticas y previsualización de guiones gráficos.
- Generación de vídeo con referencias de personaje u objeto: la ruta Ref2VA con hasta nueve imágenes permite mantener la identidad de un sujeto en el clip, útil para contenido de marca o series con personajes recurrentes.
- Pruebas de concepto en hardware AMD/ROCm: el paquete está pensado para equipos con Radeon AI PRO R9700 y el runtime Radiance, por lo que sirve para validar flujos de generación de vídeo en infraestructura AMD.
- Integración en pipelines automatizados de contenido: la API HTTP (`/v1/videos` con polling de estado y descarga de contenido) permite encadenar generación, revisión y publicación en sistemas de gestión de contenido.
- Investigación sobre cuantización W4A8 en modelos de difusión de vídeo: el paquete incluye receta, revisión de origen y SHA-256, lo que facilita reproducir y comparar la calidad frente a BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las pruebas realizadas son funcionales y que las comparaciones amplias de calidad de cuantización frente a BF16 siguen siendo limitadas.

Datos operativos publicados:

| Metrica | Valor |
|---|---|
| Resolución validada | 864×480 (área máxima de fotograma 414.720 píxeles) |
| Área máxima configurable | Hasta 1.032.192 píxeles (requiere más memoria y cualificación adicional) |
| Duración de ejemplo | 5 segundos (124 fotogramas a 24 fps) |
| Pasos de inferencia | 50 puntos de rejilla, 49 evaluaciones del denoiser |
| Audio | Estéreo sincronizado a 32 kHz en MP4 |
| Hardware validado | 2 × Radeon AI PRO R9700 de 32 GiB + ~184 GiB de RAM de host |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el checkpoint completo ocupa 53,31 GiB en disco y la configuración de ejemplo usa `tp: 2` sobre dos GPU de 32 GiB.
- GPU recomendadas: Radeon AI PRO R9700 de 32 GiB (única configuración validada, con dos tarjetas). No se ha cualificado la operación con una sola tarjeta.
- RAM de host: aproximadamente 184 GiB en la configuración probada. El autor advierte que configuraciones con menos memoria de host y la operación con una sola tarjeta no han sido cualificadas para este paquete.
- Cabe en GPU de consumo: no disponible; el paquete está orientado a ROCm y al runtime Radiance, no se documenta soporte para GPU de consumo.
- Opciones de despliegue: runtime Radiance (fork de rkcth), compilado con `-DRAD_WITH_FFMPEG=ON` y con el parche `radiance-h3-support.patch` aplicado sobre la revisión `da0b36f1d2417f1b7527b681d0a6873e826b7026`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Colocación del codificador de visión: `vision-tower-placement: ram`.
- Latencia y throughput: no disponibles. El autor menciona que la carga en frío del modelo y la admisión en cola pueden retrasar la respuesta inicial del POST, que la paginación de memoria de host puede retrasar la generación de texto durante el cambio de modelo y la recuperación tras un clip, y que la descarga por inactividad de H3 puede tardar decenas de segundos.
- Timeout sugerido en el ejemplo de API: 600 segundos por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL2VA-Radiance-W4A8 (este) | No disponible | No disponible | `.rad` / Radiance (ROCm) | MiniMax H3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (upstream) | No disponible | No disponible | Pesos originales (BF16 y otros) | MiniMax H3 Community License | Hugging Face |
| Otros modelos image-to-video | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License limita territorios, uso y redistribución, con exclusiones explícitas para la UE, el Reino Unido, Corea del Sur y EE. UU. salvo permiso separado. Es imprescindible leer `LICENSE` y la Acceptable Use Policy antes de descargar o usar el checkpoint.
- Calidad de cuantización no caracterizada: las comparaciones amplias frente a BF16 son limitadas según el propio autor; no hay garantía de que la salida W4A8 iguale al modelo original.
- Compatibilidad de runtime frágil: requiere un fork concreto de Radiance, una revisión fija y un parche de código fuente; cualquier desviación puede impedir reproducir el entorno probado.
- Operación con una sola GPU no cualificada: solo se validó con dos R9700 y ~184 GiB de RAM de host.
- Guiado por vídeo de referencia incompleto: el comportamiento de vídeo guía alineado a la línea temporal a resolución completa para intercambio de personajes sigue sin terminar; hay que validar identidad del sujeto y movimiento con material propio.
- Codificación de vídeo de referencia a resolución reducida en la ruta Ref2VA.
- Límites de generación: dimensiones múltiplas de 32 y mínimo 256, relación de aspecto máxima 4:1, área de fotograma limitada a 414.720 píxeles en la configuración de ejemplo (ampliable a 1.032.192 con más memoria y cualificación).
- Programaciones más cortas de 50 pasos implican una penalización de calidad que debe evaluarse por carga de trabajo.
- Riesgo de alucinación visual y de prompt: no se documentan evaluaciones sistemáticas de fidelidad al prompt ni de coherencia temporal.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento multilingüe del prompt.
- Sesgos conocidos: no disponibles.
- Idle offload de H3: puede tardar decenas de segundos y la recuperación del throughput de texto es gradual, lo que afecta a despliegues con conmutación frecuente de modelos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/rkcth/MiniMax-H3-FL2VA-Radiance-W4A8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint original fijado: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/42ed227ee7df40d41602854ae760620d6eb651fe
- Fork de Radiance: https://github.com/rkcth/radiance
- Licencia: https://huggingface.co/rkcth/MiniMax-H3-FL2VA-Radiance-W4A8/blob/main/LICENSE
- Repositorio del modelo en Hugging Face (archivos): https://huggingface.co/rkcth/MiniMax-H3-FL2VA-Radiance-W4A8/tree/main
