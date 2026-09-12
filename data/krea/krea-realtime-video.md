# krea/krea-realtime-video

## Resumen

Krea Realtime 14B es un modelo de generacion de video por difusion destilado del modelo Wan 2.1 14B de texto a video mediante la tecnica Self-Forcing, que convierte modelos de difusion de video convencionales en modelos autorregresivos. Lo desarrolla Krea y se distribuye en Hugging Face bajo licencia Apache 2.0, con un peso unico en safetensors de 14.288.491.584 parametros (aproximadamente 14,3 mil millones) y un repositorio de 171,5 GB.

El modelo resuelve el cuello de botella de latencia de la generacion de video: alcanza 11 fps con solo 4 pasos de inferencia en una unica GPU NVIDIA B200, frente a los decenas de pasos que requieren los modelos de difusion de video tradicionales. Ademas, permite generacion en streaming con aproximadamente 1 segundo hasta el primer frame y admite modificacion de prompts a mitad de generacion, lo que habilita flujos interactivos que antes no eran viables.

Es relevante ahora porque abre la puerta a sintesis y edicion de video en tiempo real con un modelo mas de 10 veces mayor que los modelos de video en tiempo real existentes, e incorpora tecnicas especificas para mitigar la acumulacion de error en generacion autorregresiva (KV Cache Recomputation y KV Cache Attention Bias). El modelo base es Wan-AI/Wan2.1-T2V-14B y el codigo de inferencia es publico en el repositorio de Krea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video transformer convertido a autorregresivo mediante Self-Forcing (destilado de Wan 2.1 14B) |
| Parametros totales | 14.288.491.584 (aproximadamente 14,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de video; la ventana se define por frames y no se documenta en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo safetensors; no se documentan variantes GGUF, fp8 ni int8) |
| Idiomas soportados | no disponible (los prompts de texto se procesan a traves del codificador de texto de Wan 2.1; no se declara cobertura de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file; archivo `krea-realtime-video-14b.safetensors`) |
| Modelo base | Wan-AI/Wan2.1-T2V-14B (finetune/destilacion) |
| Tarea declarada | text-to-video (con soporte adicional de video-to-video) |
| Libreria | diffusers (estructura Modular Diffusers) |
| Tamano del repositorio | 171,5 GB |
| Descargas / likes | 2.073 descargas / 300 likes |
| Fecha de publicacion | 8 de octubre de 2025 (ultima actualizacion: 8 de septiembre de 2026) |

## Arquitectura y entrenamiento

Se trata de un modelo de difusion de video transformer que ha sido convertido en autorregresivo mediante Self-Forcing, una tecnica que transforma modelos de difusion de video convencionales en modelos que generan frame a frame manteniendo una KV cache. El punto de partida es Wan 2.1 14B de texto a video, sobre el que se aplica la destilacion para reducir el numero de pasos de inferencia a 4 y habilitar la generacion en streaming. El repositorio incluye tambien la descarga de Wan2.1-T2V-1.3B, empleado como componente auxiliar en el pipeline de inferencia oficial.

La innovacion tecnica principal es el tratamiento de la acumulacion de error, problema clasico de los modelos autorregresivos de video. Krea introduce KV Cache Recomputation y KV Cache Attention Bias para mitigar la degradacion de la calidad a medida que avanza la generacion, junto con optimizaciones de memoria especificas para modelos de difusion de video autorregresivos que hacen viable entrenar modelos de este tamano. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) en modo streaming, con aproximadamente 1 segundo hasta el primer frame.
- Inferencia a 11 fps con 4 pasos de inferencia en una NVIDIA B200.
- Video a video (video-to-video): acepta streams de video reales, entradas de webcam y primitivas de canvas como condicionamiento para sintesis y edicion controlada.
- Edicion interactiva en tiempo real: el usuario puede modificar el prompt a mitad de generacion y reestilizar el video sobre la marcha.
- Generacion autorregresiva con KV cache, lo que permite mantener coherencia temporal entre frames consecutivos.
- Mitigacion de acumulacion de error mediante KV Cache Recomputation y KV Cache Attention Bias.
- Integracion con la libreria diffusers a traves de la estructura Modular Diffusers.
- Servidor de inferencia propio con interfaz web incluida en el repositorio oficial.

No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso orientado a agentes, ni soporte de audio, ya que se trata de un modelo generativo de video y no de un modelo de lenguaje.

## Casos de uso

- Herramientas creativas interactivas en tiempo real: un artista puede escribir un prompt, ver el primer frame en aproximadamente 1 segundo y modificar el prompt durante la generacion para dirigir la escena sin reiniciar el proceso.
- Reestilizado de webcam en directo: el modo video-to-video permite alimentar la senal de una webcam y aplicar un estilo visual continuo, util para streaming, avatares en directo o filtros profesionales.
- Previsualizacion cinematografica y storyboards animados: los equipos de produccion pueden generar planos animados rapidamente y ajustar la direccion artistica sobre la marcha, reduciendo el tiempo entre idea y previsualizacion.
- Edicion de video controlada por canvas: al aceptar primitivas de canvas como entrada, permite construir animaciones o composiciones guiadas por trazos y formas dibujadas por el usuario.
- Generacion de contenido para marketing y redes sociales: produccion de clips cortos estilizados con iteracion en tiempo real sobre el prompt, sin necesidad de renderizados por lotes de varios minutos.
- Prototipado en desarrollo de videojuegos: generacion de animaciones de fondo, efectos o transiciones en bucle con respuesta inmediata, integrable en herramientas internas de diseno.
- Investigacion en modelos autorregresivos de difusion: el modelo sirve como referencia reproducible (codigo y pesos publicos) para estudiar acumulacion de error, KV cache y destilacion en difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni de metricas estandar de generacion de video como FVD o VBench).

Los unicos datos de rendimiento disponibles son de inferencia, medidos por el autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de generacion | 11 fps | 4 pasos de inferencia, 1 GPU NVIDIA B200 |
| Pasos de inferencia | 4 | Configuracion declarada por el autor |
| Tiempo hasta el primer frame | aproximadamente 1 segundo | modo texto a video en streaming |
| Comparacion de tamano | mas de 10x mayor que los modelos de video en tiempo real existentes | afirmacion del autor, sin detalle de los modelos comparados |

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 28,6 GB. Hay que sumar el codificador de texto y el VAE del pipeline de Wan, por lo que se estima un rango practico de 40-48 GB de VRAM para inferencia sin cuantizar. No se documentan configuraciones cuantizadas.
- GPU recomendadas: NVIDIA B200 (configuracion de referencia declarada, 11 fps con 4 pasos), A100 80 GB y H100 como alternativas de capacidad similar. El autor no publica cifras de fps para estas GPU.
- GPU de consumo: no hay confirmacion de que quepa en una RTX 4090 (24 GB) en bf16, dado que los pesos por si solos superan esa cifra. No se documentan variantes GGUF o int8 que permitan reducir el consumo.
- Opciones de despliegue: servidor de inferencia propio del repositorio oficial (`uvicorn release_server:app`, con interfaz web en el puerto 8000) y pipeline de diffusers con Modular Diffusers. Requiere `flash_attn` instalado sin aislamiento de build. No es compatible con motores de texto como vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: 11 fps y aproximadamente 1 segundo hasta el primer frame en B200 segun el autor. No se publican mediciones para otras GPU ni curvas de latencia por resolucion o duracion del clip.
- Almacenamiento: el repositorio completo ocupa 171,5 GB, por lo que conviene descargar unicamente el archivo safetensors necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Tiempo real | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea Realtime 14B | 14,3 mil millones | Si (11 fps, 4 pasos, aproximadamente 1 s hasta el primer frame en B200) | no disponible | apache-2.0 | Hugging Face, codigo de inferencia publico |
| Wan-AI/Wan2.1-T2V-14B (modelo base) | 14 mil millones | no disponible (modelo de difusion convencional, no autorregresivo) | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos de video en tiempo real existentes | mas de 10 veces mas pequenos que Krea Realtime 14B segun el autor | Si | no disponible | no disponible | no disponible (no se nombran en la informacion) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks objetivos (FVD, VBench u otros), por lo que la calidad de generacion no puede validarse con metricas externas.
- La acumulacion de error es un riesgo estructural de los modelos autorregresivos de video; el autor declara tecnicas de mitigacion (KV Cache Recomputation y KV Cache Attention Bias), pero no cuantifica la degradacion residual.
- No se documentan los idiomas soportados por el codificador de texto ni si los prompts funcionan correctamente en castellano.
- No se especifican resolucion de salida, duracion maxima de clip ni consumo de memoria por configuracion, datos criticos para planificar produccion.
- El rendimiento declarado (11 fps) esta medido en una NVIDIA B200, hardware de gama muy alta y poco accesible; no hay datos para GPU de consumo.
- El repositorio ocupa 171,5 GB, lo que implica requisitos elevados de ancho de banda y almacenamiento.
- La licencia es apache-2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Wan 2.1 y de cualquier componente auxiliar descargado por separado (Wan2.1-T2V-1.3B).
- Al ser un modelo de video y no de lenguaje, no ofrece tool calling, agentes ni razonamiento textual; no debe evaluarse con benchmarks de LLM.
- No se documentan sesgos especificos, pero al ser un modelo de difusion entrenado con datos no descritos, puede reproducir sesgos presentes en el corpus de entrenamiento y no declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krea/krea-realtime-video
- Modelo base Wan 2.1 T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Codigo de inferencia (GitHub): https://github.com/krea-ai/realtime-video
- Blog tecnico de Krea sobre Krea Realtime 14B: https://www.krea.ai/blog/krea-realtime-14b
- Sitio oficial de Krea: https://www.krea.ai/

Nota: los resultados de busqueda web adicionales (krea.fr, krea.im, K-Rea de Setec y la pagina de mejora de imagen de Krea) no guardan relacion con este modelo y se han omitido.
