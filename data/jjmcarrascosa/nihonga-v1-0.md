# jjmcarrascosa/Nihonga-v1.0

## Resumen

Nihonga-v1.0 es un modelo de difusión texto-a-imagen derivado de Qwen/Qwen-Image-2.1, publicado por el desarrollador jjmcarrascosa. Se trata de una versión podada y destilada del transformer de Qwen-Image-2.1: se eliminan dos de sus 32 bloques (los índices 5 y 20) y cada uno se sustituye por un "puente" de unos 25 M de parámetros, lo que reduce el transformer de 7,115 B a 6,729 B de parámetros. Sobre esa base se fusiona un LoRA de destilación por pasos (rank 32) que permite generar una imagen de 1024 × 1024 en 10 pasos y sin classifier-free guidance.

El objetivo declarado es acelerar la inferencia manteniendo la fidelidad del texto renderizado, que es lo primero que se degrada al podar o destilar un transformer de difusión. Según la model card, el modelo pasa de 6,89 s a 1,75 s por imagen en una H100 (unas 3,9 veces más rápido) y conserva 15 de 16 aciertos de ortografía exacta en el conjunto de prueba más difícil del autor, frente a 16 del modelo original.

Es relevante ahora porque demuestra una vía de compresión agresiva sobre un modelo de imagen de gran tamaño manteniendo el renderizado de texto, un punto históricamente débil de los modelos de difusión. No obstante, el proyecto es muy reciente (repositorio creado el 19 de octubre de 2026, con 0 descargas y 0 likes), el paper con el método completo está anunciado pero no publicado, y la licencia qwen-research es restrictiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) derivado de Qwen-Image-2.1, con 30 de 32 bloques y 2 puentes sustitutos en las posiciones 5 y 20 |
| Parámetros totales | 6.729.347.072 (6,729 B) en el transformer; el modelo base tenía 7,115 B |
| Longitud de contexto | No disponible (no aplica a la generación de imagen; la ventana corresponde al codificador de texto de Qwen-Image-2.1, no documentada en esta ficha) |
| Tipos de cuantización | No disponible; solo se publican pesos en BF16 (13,46 GB en 3 shards). No se documentan GGUF, FP8 ni INT8 |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: qwen-research` (hereda las restricciones de Qwen-Image-2.1) |
| Formato de pesos | Safetensors en BF16, cargables con `diffusers`; incluye un fichero loader propio del repositorio |
| Pipeline | text-to-image |
| Resolución de entrenamiento/prueba | 1024 × 1024 |
| Pasos de muestreo | 10 pasos, sin classifier-free guidance (`true_cfg_scale=1.0`) |
| Tamaño del repositorio | 13,5 GB (solo el transformer; el codificador de texto y el VAE no están incluidos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de Qwen-Image-2.1 (32 bloques). El autor elimina los bloques 5 y 20 y los reemplaza por puentes de aproximadamente 25 M de parámetros cada uno, frente a los 218 M de un bloque original. Cada puente consta de un MLP condicionado por timestep y una rama de atención de 8 cabezas con su propia caché de prompt, entrenados de extremo a extremo contra la salida del modelo original. Los bloques se eligieron evaluando el texto renderizado, no solo el error medio, porque las letras ocupan un porcentaje pequeño de la imagen y las pérdidas agregadas no detectan su degradación.

Sobre el modelo podado se entrena un Lightning LoRA de rango 32 y alpha 32 aplicado a las proyecciones q, k, v y out de los 30 bloques restantes (120 pares, 31,5 M de pesos entrenables), que después se fusiona en los pesos con W′ = W + B·A, calculado en FP32 y almacenado en BF16. El entrenamiento es destilación por pasos: se ejecuta el modelo podado en sus 40 pasos habituales sobre 1.000 prompts (500 con texto), guardando la imagen tras cada paso, y el LoRA aprende a que un paso grande aterrice donde lo harían cinco pasos pequeños. Los tokens que contienen letras, marcados con un detector OCR, ponderan diez veces en la pérdida. El entrenamiento total fue de 3.000 actualizaciones en una H100.

En inferencia se usa un calendario mixto: los puntos 0, 1, 3, 5, 10, 15, 20, 25, 30 y 35 del calendario estándar de 40 pasos y después el final. El primer salto desde el ruido, donde se decide la composición, se divide en tres pasos pequeños; los siete restantes son pasos grandes del LoRA. El codificador de texto (17,5 GB) y el VAE no se modifican ni se incluyen en el repositorio: se cargan desde Qwen/Qwen-Image-2.1.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024 × 1024 con 10 pasos de muestreo y sin guidance.
- Renderizado de texto en la imagen: 15 de 16 aciertos de ortografía exacta en el conjunto de prueba del autor (cartel de escaparate, rótulo de tienda, tagline de póster, nota manuscrita en chino y banner).
- Inferencia rápida: 1,75 s por imagen de 1024 × 1024 en una H100 en BF16, lote 1.
- Compatibilidad con la librería `diffusers` estándar más un fichero loader incluido en el repositorio.
- Fusión del LoRA en los pesos: no requiere cargar un adaptador adicional ni añade latencia ni parámetros en tiempo de inferencia.
- No entrena ni prueba edición de imágenes, imágenes de referencia ni transparencia (canal alfa); estas capacidades no deben asumirse.
- No dispone de tool calling, agentes, modo thinking, audio ni visión de entrada: es exclusivamente un modelo de generación de imagen.

## Casos de uso

- Cartelería y rótulos comerciales: el modelo está optimizado específicamente para texto corto exacto en la imagen (rótulos de tienda, letreros de escaparate), por lo que encaja en la generación de carteles con marca y nombre del establecimiento sin retoques manuales posteriores.
- Generación de creatividades en lote para marketing: a 1,75 s por imagen en una H100, un pipeline puede producir del orden de 2.000 imágenes por hora y GPU en Bach de 1024 × 1024, suficiente para variantes A/B de campañas.
- Prototipado rápido en estaciones de trabajo con `diffusers`: al requerir 10 pasos y no usar CFG, el coste por iteración baja lo suficiente para explorar prompts de forma interactiva en un notebook.
- Ilustración editorial y de blog: la preservación de la composición en 25 prompts generales (23 de 25 imágenes consideradas equivalentes a las del modelo de 40 pasos) permite usar el modelo para acompañamiento visual de artículos donde no se requiere fidelidad semilla a semilla.
- Material educativo y divulgativo con texto integrado: infografías simples, portadas de diapositivas o pósteres con titulares, aprovechando la ponderación de tokens de texto en el entrenamiento.
- Sustitución de Qwen-Image-2.1 en entornos con restricciones de latencia: cualquier servicio que ya consuma el modelo base a través de `diffusers` puede cambiar el transformer y mantener el mismo codificador de texto y VAE, reduciendo el tiempo por imagen un factor de aproximadamente 3,9.
- Investigación sobre compresión de modelos de difusión: el repositorio incluye notebooks con todos los experimentos y fallos, lo que lo convierte en material de referencia para estudiar poda de bloques y destilación por pasos en DiT.

## Benchmarks y rendimiento

Datos de la model card. Mismos prompts y semillas en todas las filas: 5 prompts con texto (4 semillas cada uno, 16 ítems de ortografía) y 25 prompts generales. Velocidad medida con lote 1, 1024 × 1024, una H100, BF16, medianas.

| Modelo | Bloques | Pasos | Tiempo por imagen ↓ | Ortografía (16 ítems) ↑ | Imágenes generales distintas de su fuente de 40 pasos ↓ |
|---|---|---|---|---|---|
| Qwen-Image-2.1 | 32 | 40 | 6,89 s | 16 | — |
| Modelo podado, sin LoRA | 30 + 2 puentes | 40 | 6,56 s | 15 | — |
| Modelo podado con LoRA anterior de 8 pasos | 30 + 2 puentes | 8 | No disponible | 12 | 5 de 25 |
| Lightning LoRA sobre el modelo completo (LightX2V, publicado) | 32 | 4 | 0,87 s | 13 | — |
| **Nihonga-v1.0** | **30 + 2 puentes** | **10** | **1,75 s** | **15** | **2 de 25** |

Las dos imágenes generales que difieren son un portátil iluminando una cara que aparece ausente y un grupo de cuatro amigos que sale con cinco personas. El autor advierte que las composiciones no son copias semilla a semilla del modelo original: el arranque suave y el LoRA producen imágenes distintas y limpias para el mismo ruido.

No se han publicado resultados en benchmarks estándar de la comunidad (GenEval, DPG-Bench, MMLU, HumanEval u otros) en la información disponible; las cifras anteriores son métricas internas del autor.

## Requisitos de hardware

- VRAM estimada: 39,3 GB de pico a 1024 × 1024 con el codificador de texto (17,5 GB) y el VAE cargados en la GPU, en BF16 (el modelo original medía 39,6 GB). Solo el transformer ocupa 13,46 GB.
- GPU recomendadas: H100 (medición oficial), A100 de 80 GB y, con margen ajustado, A100 de 40 GB o L40S de 48 GB por la memoria pico. Una RTX 4090 de 24 GB no puede alojar el pipeline completo en BF16 sin offload.
- ¿Cabe en GPU de consumo? No con el pipeline completo, según la memoria pico reportada. Cabría el transformer solo (13,46 GB) en una GPU de 16-24 GB, pero requeriría descargar el codificador de texto y el VAE a CPU o usar offload; el autor no documenta esta configuración.
- Opciones de despliegue: `diffusers` con el fichero loader del repositorio (vía soportada). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión.
- Latencia: 1,75 s por imagen de 1024 × 1024 en una H100, lote 1, BF16 (frente a 6,89 s del modelo base). El throughput implícito es de aproximadamente 0,57 imágenes/s por GPU en esa configuración; no se publican medidas con lotes mayores ni en otras GPU.
- Se requiere descargar aparte Qwen/Qwen-Image-2.1 para obtener el codificador de texto y el VAE, además de los 13,5 GB de este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros del transformer | Bloques | Pasos | Tiempo por imagen (H100, 1024 × 1024) | Ortografía | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Nihonga-v1.0 | 6,729 B | 30 + 2 puentes | 10 | 1,75 s | 15/16 | qwen-research | HuggingFace, 0 descargas |
| Qwen-Image-2.1 (base) | 7,115 B | 32 | 40 | 6,89 s | 16/16 | qwen-research | HuggingFace (modelo base) |
| Lightning LoRA de LightX2V sobre Qwen-Image-2.1 | 7,115 B | 32 | 4 | 0,87 s | 13/16 | No disponible en esta ficha | Publicado, según la model card |
| Otros modelos texto-a-imagen de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación se limita a las variantes del propio Qwen-Image-2.1 documentadas por el autor. No hay datos en la información proporcionada sobre modelos de otros linajes (FLUX, SD3.5, HunyuanImage u otros), por lo que no se ofrece comparación cruzada.

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia permisiva; el uso comercial queda sujeto a los términos de Qwen-Image-2.1, que no se detallan en esta ficha. Verificar el fichero LICENSE antes de cualquier despliegue en producción.
- Proyecto sin validación externa: 0 descargas y 0 likes en el momento de la consulta, creado el 19 de octubre de 2026. No hay paper publicado ("coming soon"), solo el registro de investigación y los notebooks del autor.
- Los benchmarks son internos del autor, con 16 ítems de ortografía y 25 prompts generales; el tamaño muestral es pequeño y no ha sido replicado por terceros.
- El modelo podado pierde algo de fidelidad: 15/16 frente a 16/16 en ortografía, y 2 de 25 imágenes generales difieren de las del modelo de 40 pasos (objetos ausentes y recuentos erróneos de personas).
- Las composiciones no coinciden semilla a semilla con el modelo base; cualquier flujo que dependa de reproducibilidad respecto a Qwen-Image-2.1 se rompe.
- Solo texto a imagen: no se han entrenado ni probado edición, imágenes de referencia ni transparencia. No debe asumirse soporte de estas funciones.
- No hay datos publicados sobre sesgos demográficos, estéticos o culturales; al derivar de Qwen-Image-2.1 hereda los sesgos de sus datos de entrenamiento, que no se documentan en esta ficha.
- Riesgo de alucinación visual: el modelo puede generar texto inexistente o mal formado en escenas con mucho texto, y errores de recuento en grupos de personas u objetos, como el propio autor reporta.
- Idiomas soportados no documentados; el rendimiento multilingüe de los prompts depende del codificador de texto de Qwen-Image-2.1 y no se ha evaluado por separado.
- No se publican pesos cuantizados; el despliegue en GPU de consumo requiere trabajo adicional de offload o cuantización no soportado oficialmente.
- La memoria pico de 39,3 GB obliga a GPUs de 40 GB o más para el pipeline completo en BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjmcarrascosa/Nihonga-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Página del proyecto: https://niwakiai.com/nihonga/
- Registro de investigación completo: https://josejuanmartinez.github.io/research/nihonga
- Notebooks con código y resultados: https://github.com/josejuanmartinez/nihonga
- Paper con el método y las mediciones completas: anunciado como "coming soon", no disponible.

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces anteriores proceden únicamente de la model card y de los metadatos de HuggingFace.
