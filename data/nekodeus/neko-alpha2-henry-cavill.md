# Nekodeus/neko-alpha2-henry-cavill

## Resumen

alpha2 es un adaptador LoRA de personaje para Stable Diffusion 1.5, publicado por el usuario Nekodeus bajo el identificador `Nekodeus/neko-alpha2-henry-cavill`. Su función es fijar la identidad visual de una persona concreta (etiquetada como «Henry Cavill» en el nombre del repositorio) para que el modelo base genere retratos consistentes de ese personaje a partir del token disparador `alpha2`. No es un modelo generativo autónomo: es un conjunto de pesos de bajo rango que se cargan junto a un checkpoint SD1.5 en A1111, Forge, ComfyUI o diffusers.

El entrenamiento se hizo con kohya_ss sd-scripts a 512 px, 1500 pasos, rango y alpha de 8, learning rate 1e-4, optimizador Adam de 8 bits y xformers, sobre aproximadamente 93 imágenes filtradas. El peso recomendado de aplicación es de 0.8 a 1.0. Forma parte del pack `Nekodeus/neko-hollywood-alpha-sd15-v1` y del conjunto «Hollywood Alpha SD1.5» (alpha1–alpha10), por lo que su propósito es encajar dentro de una familia de LoRAs de personajes sobre la misma base.

Su relevancia es limitada y muy específica: interesa a quien ya trabaja con SD1.5 y necesita un LoRA de identidad para pruebas de concepto, previsualización o generación por lotes. El repositorio muestra 0 descargas, 0 likes y un tamaño de 0.0 GB, de modo que no hay evidencia de pesos publicados ni de validación por parte de terceros; la licencia figura como «other» sin texto disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Stable Diffusion 1.5; red de bajo rango inyectada en las capas del UNet |
| Parámetros totales | No disponible. Se documentan rango (dim) = 8 y alpha = 8, pero no el recuento de parámetros del adaptador ni el número de módulos adaptados |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica. El text encoder CLIP de SD1.5 limita el prompt a 77 tokens |
| Tipos de cuantización | No disponible. Uso previsto en fp16, con posibilidad de fusionar el adaptador en el checkpoint base; no se documenta versión GGUF ni cuantizada |
| Idiomas soportados | No disponible. Los ejemplos de prompt de la model card están en inglés |
| Licencia | other (sin texto de licencia en la información disponible) |
| Formato de pesos | No disponible. La librería declarada es `peft` y el tamaño del repositorio figura como 0.0 GB, por lo que no se confirma la presencia de archivos de pesos |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA sobre difusión: se congelan los pesos del UNet de Stable Diffusion 1.5 y se entrenan matrices de descomposición de bajo rango (dim = 8, alpha = 8) que modulan las proyecciones de atención y las capas convolucionales seleccionadas. En inferencia, la salida del adaptador se suma al modelo base con un factor de escala controlado por el peso de carga, que la model card sitúa entre 0.8 y 1.0. El pipeline es text-to-image clásico, con VAE y text encoder de SD1.5 sin modificaciones.

El entrenamiento se realizó con kohya_ss sd-scripts a resolución de 512 px durante 1500 pasos, con learning rate 1e-4, optimizador Adam de 8 bits y xformers, sobre un conjunto de unas 93 imágenes filtradas. El token disparador es `alpha2`, que debe incluirse en el prompt (`a photo of alpha2 person`). No se documentan en la información disponible la composición del dataset, el origen de las imágenes, la existencia de regularización por clase, el uso de captioning automático ni ninguna fase de ajuste por preferencias; tampoco se describen innovaciones técnicas adicionales.

## Capacidades

- Generación de imágenes de personaje condicionada por texto sobre Stable Diffusion 1.5, a 512 px nativos.
- Reproducción de una identidad facial concreta mediante el token disparador `alpha2`, con control de intensidad mediante el peso del LoRA (0.8–1.0).
- Composición con prompts de escena, vestuario e iluminación: la model card incluye ejemplos de retrato con luz de estudio y de personaje con traje y fondo urbano.
- Compatibilidad con los flujos habituales de SD1.5: A1111, Forge, ComfyUI y diffusers vía PEFT.
- Posible combinación con otros LoRAs, ControlNet o IP-Adapter en el mismo pipeline, aunque no está documentado ni validado por el autor.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo thinking: es un adaptador de difusión, no un modelo de lenguaje.

## Casos de uso

- Previsualización de personajes en preproducción audiovisual: generar variaciones de vestuario, iluminación y encuadre de un mismo rostro para presentar opciones a dirección antes de un rodaje, con el LoRA cargado a peso 0.9 sobre SD1.5 en ComfyUI.
- Storyboard y referencia visual para ilustración editorial: producir una hoja de personaje coherente (primeros planos, planos medios, perfiles) usando el mismo token `alpha2` y semillas fijas para mantener la identidad entre viñetas.
- Prototipado de avatares para videojuegos o experiencias interactivas: generar retratos base a 512 px que después se retocan o se escalan, aprovechando que el adaptador se puede fusionar en el checkpoint y distribuir como un único modelo.
- Pruebas de integración de pipelines PEFT: servir como caso de test para verificar la carga de adaptadores LoRA sobre SD1.5 en diffusers, incluyendo la fusión y descarga del adaptador en memoria.
- Generación por lotes con ControlNet: combinar el LoRA con mapas de profundidad o pose para fijar composición mientras la identidad la aporta el adaptador, útil en tareas de variación controlada.
- Investigación sobre sesgos y consistencia de identidad en LoRAs de personaje: medir cómo varía el parecido facial según el peso del adaptador (0.5, 0.8, 1.0), la semilla y la longitud del prompt, con un conjunto de ~93 imágenes como referencia de entrenamiento.
- Creación de contenido de fan art o material personal no comercial, siempre que se respeten los derechos de imagen de la persona representada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta hiperparámetros de entrenamiento (1500 pasos, 512 px, dim/alpha 8, lr 1e-4, ~93 imágenes) y no incluye métricas de similitud facial, FID, CLIP score ni comparaciones cuantitativas con otros LoRAs.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade un coste despreciable frente a SD1.5; se puede ejecutar en torno a 4 GB en fp16 con attention slicing y xformers a 512 px, y con 6–8 GB se trabaja con margen para lotes pequeños. Son estimaciones basadas en el modelo base, no en mediciones publicadas para este LoRA.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más, como RTX 3060, 4060 Ti, 4070 o 4090. No requiere A100 ni H100; el cuello de botella es el UNet de SD1.5, no el adaptador.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más, y en equipos con 8 GB compartidos vía CPU offload.
- Opciones de despliegue: Automatic1111 WebUI, Forge, ComfyUI y diffusers con `peft` (carga del adaptador y `fuse_lora` opcional). vLLM, TGI, llama.cpp y Ollama no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles para este adaptador. Como referencia del modelo base, una imagen de 512×512 con 20–30 pasos en una RTX 4090 suele resolverse en el orden de 1–3 segundos, pero es una estimación no verificada en este repositorio.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Resolución nativa | Contexto de prompt | Licencia | Descargas / likes | Disponibilidad de pesos |
|---|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha2-henry-cavill | SD1.5 | LoRA de personaje, dim/alpha 8 | 512 px | 77 tokens (CLIP) | other | 0 / 0 | No confirmada (repo 0.0 GB) |
| Nekodeus/neko-hollywood-alpha-sd15-v1 (pack alpha1–alpha10) | SD1.5 | Conjunto de LoRAs de personaje | 512 px | 77 tokens (CLIP) | No disponible | No disponible | No disponible |
| LoRA de personaje sobre SDXL (categoría genérica) | SDXL | LoRA de personaje | 1024 px | 77 tokens por encoder, con pooling | Varía según autor | No disponible | No disponible |

No se dispone de datos públicos de rendimiento, similitud facial ni adopción para este adaptador, por lo que la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Repositorio aparentemente vacío: el tamaño indicado es 0.0 GB y las descargas son 0, por lo que no se puede verificar que los pesos estén publicados ni que el adaptador funcione tal como se describe.
- Licencia «other» sin texto asociado: no hay base clara para uso comercial. Es necesario contactar con el autor antes de cualquier despliegue en producción.
- Representación de una persona real: el uso de la identidad de Henry Cavill plantea riesgos de derechos de imagen y de generación de contenido no consentido (deepfakes). El uso comercial requiere autorización expresa.
- Dataset pequeño y no documentado (~93 imágenes filtradas): alta probabilidad de sobreajuste al estilo, encuadre e iluminación de las imágenes de entrenamiento, y de arrastrar sesgos de composición (por ejemplo, predominancia de primeros planos).
- El token `alpha2` es obligatorio; sin él el adaptador aporta poco o nada. La fuerza del efecto depende del peso de carga, con riesgo de artefactos por encima de 1.0.
- Ventana de prompt de 77 tokens (limitación de CLIP en SD1.5): las descripciones largas se truncan salvo que se use prompt weighting o chunking.
- Resolución nativa de 512 px: generar a resoluciones mayores sin upscalers produce duplicaciones anatómicas; no hay versión SDXL de este adaptador.
- Idioma: los prompts de ejemplo están en inglés y no se documenta comportamiento en castellano; el text encoder de SD1.5 está entrenado mayoritariamente en inglés.
- Sin benchmarks ni validación de terceros: no hay evidencia cuantitativa de calidad, consistencia de identidad ni robustez frente a distintos estilos.
- Riesgo de alucinación visual (anatomía incorrecta, manos deformes, artefactos faciales) inherente a SD1.5, no corregido por el adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/Nekodeus/neko-alpha2-henry-cavill
- Pack al que pertenece: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
