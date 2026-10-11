# jaichang/embeddinggemma2-global-birds-2000-litert

## Resumen

`jaichang/embeddinggemma2-global-birds-2000-litert` es un repositorio de encoders de embeddings para inferencia 100 % en dispositivo, destilados por conocimiento (knowledge distillation) a partir del modelo maestro `jaichang/embeddinggemma2-global-birds-2000`, un modelo de embeddings de 740M de parametros. El objetivo no es generar texto, sino proyectar fotografias de aves y grabaciones de audio de cantos a un espacio vectorial de 768 dimensiones armonizado con el del maestro, de forma que la busqueda por similitud coseno sobre un indice precalculado permita identificar especies sin conexion a red.

El repositorio incluye cuatro variantes de encoder: dos estudiantes destilados ligeros (vision basada en MobileNetV3-Small de 9,24 MB y audio basado en una ConvNet espectral multiescala 1D de 14,70 MB) en formato ONNX, y dos torres sin destilar del modelo maestro (Gemma4Vision y Gemma4Audio Conformer) cuantizadas a INT8 en ONNX y TFLite, de 22,38 MB y 30,90 MB respectivamente. Ademas, se distribuyen dos indices binarios Float32 de 5,8 MB cada uno con los vectores de referencia de 2.000 especies de aves y un catalogo JSON con metadatos en ingles y coreano.

Es relevante ahora porque cubre un nicho concreto de despliegue: aplicaciones Flutter moviles (Android/iOS via `tflite_flutter`) y Flutter Web (WebGPU, WebGL o WASM via `onnxruntime-web`) que necesitan reconocimiento multimodal de aves de forma totalmente offline, con un coste de almacenamiento de decenas de megabytes en lugar de los 1,2 GB de `model.safetensors` del maestro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision destilada: MobileNetV3-Small + proyeccion L2 de 768 dimensiones. Audio destilado: ConvNet convolucional espectral multiescala 1D + proyeccion L2 de 768 dimensiones. Torres sin destilar: Gemma4Vision (transformer) y Gemma4Audio (Conformer), INT8 |
| Parametros totales | no disponible (el modelo maestro EmbeddingGemma 2 tiene 740M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de embeddings). Entradas fijas: imagen `float32[1, 3, 160, 160]` RGB en `[-1, 1]` y audio `float32[1, 80000]` (5 s a 16 kHz) |
| Tipos de cuantizacion | float32 (estudiantes destilados ONNX); INT8 (torres sin destilar ONNX y TFLite) |
| Idiomas soportados | en, ko (catalogo y metadatos); nombres cientificos en latin |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), indice binario Float32 (`.f32`) y catalogo JSON |

## Arquitectura y entrenamiento

El modelo maestro es un encoder multimodal de 740M de parametros (EmbeddingGemma 2) que produce embeddings de 768 dimensiones normalizados L2. Sobre ese espacio, el autor entrena redes estudiante ligeras mediante destilacion por conocimiento con una perdida combinada de similitud coseno e InfoNCE, cuyo objetivo es regresar directamente las coordenadas exactas del embedding del maestro en lugar de aprender una tarea de clasificacion supervisada. La rama de vision usa como backbone MobileNetV3-Small y la rama de audio una ConvNet 1D sobre espectrograma multiescala; ambas terminan en una proyeccion a 768 dimensiones con normalizacion L2.

Ademas de los estudiantes, el repositorio publica las torres originales del maestro sin destilar (`Gemma4Vision` y `Gemma4Audio` Conformer) cuantizadas a INT8, pensadas como alternativa de mayor fidelidad cuando el presupuesto de almacenamiento lo permite (22,38 MB y 30,90 MB frente a 9,24 MB y 14,70 MB). No se detalla en la informacion disponible el numero de tokens, la composicion del dataset de aves ni si hubo etapas de RLHF o DPO, ya que el modelo no es generativo. Los indices `.f32` almacenan los embeddings de referencia de las 2.000 especies, calculados con el maestro y almacenados en formato plano para busqueda por producto escalar directo.

## Capacidades

- Generacion de embeddings de imagen: convierte fotografias RGB de 160x160 en vectores de 768 dimensiones normalizados L2, alineados con el espacio del maestro de 740M.
- Generacion de embeddings de audio: convierte fragmentos de 5 segundos a 16 kHz (80.000 muestras) en vectores de 768 dimensiones, orientados a cantos de aves.
- Recuperacion por similitud: busqueda Top-1/Top-k mediante producto escalar sobre los indices `.f32` precalculados de 2.000 especies, sin necesidad de reindexar en el dispositivo.
- Multimodalidad: las dos modalidades (foto y audio) comparten el mismo espacio de 768 dimensiones del maestro, lo que permite combinar ambas senales en un mismo ranking.
- Ejecucion 100 % en dispositivo: sin servidor, sin llamadas de red y sin telemetria, con pesos que van de 9,24 MB a 30,90 MB.
- Compatibilidad multiplataforma: ONNX Runtime para Web (WebGPU con respaldo a WebGL y WASM SIMD), ONNX Runtime en Python y LiteRT/TFLite para Android e iOS via `tflite_flutter`.
- Metadatos offline: el catalogo `global_2000_birds_catalog.json` incluye nombres en coreano, ingles y nombre cientifico, descripciones y URL de imagenes y audios de referencia.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de representacion (embedding).

## Casos de uso

- Identificacion de aves en aplicacion movil offline: el usuario fotografia un ave y la app ejecuta el encoder TFLite de 9,24 MB, calcula la similitud coseno contra el indice de 2.000 vectores y muestra la especie probable con su ficha en coreano o ingles, sin conexion y con un consumo de almacenamiento inferior a 25 MB.
- Identificacion por canto en campo: la app graba 5 segundos a 16 kHz, ejecuta el encoder de audio de 14,70 MB (99,1 % Top-1 respecto al espacio del maestro) y recupera la especie a partir del indice de audio de 5,8 MB, util en censos de aves o salidas ornitologicas sin cobertura.
- Aplicacion web estatica sin backend: mediante `onnxruntime-web` con WebGPU y respaldo WebGL/WASM, un sitio de divulgacion puede ofrecer identificacion de aves en el navegador sin costes de servidor ni subida de imagenes del usuario.
- Ciencia ciudadana y monitorizacion de biodiversidad: integracion en formularios de observacion donde el encoder preetiqueta la especie a partir de la foto y el observador solo valida o corrige, reduciendo el esfuerzo de anotacion manual.
- Trampas camara y dispositivos de borde: el encoder INT8 de vision (22,38 MB) puede ejecutarse en hardware con pocos recursos para filtrar capturas y enviar solo los fotogramas con detecciones relevantes, ahorrando ancho de banda y almacenamiento.
- Educacion y guias de campo digitales: el catalogo JSON con nombres cientificos, coreanos e ingleses permite construir enciclopedias sin conexion con busqueda visual y sonora integrada.
- Herramientas de investigacion reproducible: los indices `.f32` y el catalogo permiten reproducir pipelines de evaluacion de recuperacion (Top-1, similitud media) en Python con ONNX Runtime sin necesidad de cargar el maestro de 1,2 GB.
- Busqueda multimodal combinada: mezclar la similitud de foto y la de canto sobre el mismo espacio de 768 dimensiones permite reordenar candidatos cuando la imagen es ambigua, por ejemplo en especies con plumajes similares.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas de recuperacion respecto al espacio del modelo maestro (no exactitud absoluta de clasificacion sobre datos reales):

| Encoder | Arquitectura | Tamano | Precision de recuperacion (vs. espacio del maestro) |
|---|---|---|---|
| `embeddinggemma2_vision_768d.onnx` | MobileNetV3-Small + proyeccion L2 768-d (estudiante destilado) | 9,24 MB | 100,0 % Top-1 (`mean_cos = 0,8841`) |
| `embeddinggemma2_audio_768d.onnx` | ConvNet espectral multiescala 1D + proyeccion L2 768-d (estudiante destilado) | 14,70 MB | 99,1 % Top-1 (`mean_cos = 0,9086`) |
| `embeddinggemma2_undistilled_vision_int8.{onnx,tflite}` | Gemma4Vision Transformer INT8 (sin destilar) | 22,38 MB | 93,5 % Top-1 (100 % en el conjunto de campo, segun el autor) |
| `embeddinggemma2_undistilled_audio_int8.{onnx,tflite}` | Gemma4Audio Conformer INT8 (sin destilar) | 30,90 MB | 100,0 % Top-1 en el conjunto de prueba de audio de campo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de recuperacion como ImageNet o Xeno-canto) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Los encoders ocupan entre 9,24 MB y 30,90 MB de pesos; con activaciones de una sola imagen 160x160 o 5 s de audio, el pico de memoria se mantiene en el orden de decenas de megabytes, apto para memoria unificada de moviles.
- Almacenamiento: el repositorio completo ocupa 0,1 GB; cada indice de especies anade 5,8 MB y el catalogo JSON es de tamano reducido.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU de movil, NPU/DSP de Android e iOS via LiteRT, y en GPU integrada de portatiles o en el navegador mediante WebGPU.
- Cabe en GPU de consumo: si, y tambien en practicamente cualquier dispositivo movil moderno; no se necesita una RTX 4090 ni similares, aunque ONNX Runtime podria aprovecharlas en escritorio sin beneficio relevante por el tamano del modelo.
- Opciones de despliegue: LiteRT/TFLite en Android e iOS (`tflite_flutter`), `onnxruntime-web` con WebGPU, WebGL o WASM SIMD en Flutter Web y navegadores, y ONNX Runtime en Python para validacion en servidor o escritorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica mediciones de milisegundos por inferencia ni de imagenes o fragmentos de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Entrada | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaichang/embeddinggemma2-global-birds-2000-litert` (este repositorio) | Estudiantes de 9,24 MB y 14,70 MB; torres INT8 de 22,38 MB y 30,90 MB | Imagen 160x160; audio 5 s a 16 kHz | Embeddings de 768 dimensiones, vision y audio | CC BY-SA 4.0 | HuggingFace, ONNX y TFLite |
| `jaichang/embeddinggemma2-global-birds-2000` (maestro) | 740M; `model.safetensors` de 1,2 GB | Imagen y audio (segun el maestro) | Embeddings de 768 dimensiones, vision y audio | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas genericas de embeddings de imagen (por ejemplo CLIP o variantes de MobileNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparativa con datos verificables es contra el modelo maestro: el repositorio sacrifica entre 1 y 2 ordenes de magnitud en tamano (de 1,2 GB a 9,24-30,90 MB) manteniendo la coherencia en el espacio de embeddings, con una similitud coseno media de 0,8841 en vision y 0,9086 en audio frente a las representaciones del maestro. No se dispone de datos comparativos con otros modelos de embeddings para identificacion de aves en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio cerrado: el modelo esta entrenado especificamente para 2.000 especies de aves a nivel global. Fuera de ese catalogo, la recuperacion Top-1 devolvera forzosamente la especie mas parecida del indice, con riesgo alto de falso positivo.
- Riesgo de confusion entre especies: la similitud coseno elevada no implica identificacion correcta; especies con plumaje o canto similares pueden generar empates. No hay umbral de rechazo documentado ni clase "desconocido".
- Las metricas publicadas miden fidelidad al espacio del maestro, no exactitud real sobre fotografias o audios de campo. Un 100 % Top-1 "vs. Teacher Space" no equivale a un 100 % de acierto en produccion.
- La torre de vision sin destilar INT8 obtiene 93,5 % Top-1 frente al 100 % del estudiante destilado, una inversion contraintuitiva que el autor justifica con un 100 % en su conjunto de campo; conviene validar ambas variantes con datos propios antes de elegir.
- Idiomas limitados: ingles y coreano para el catalogo y los metadatos. No hay soporte documentado de consultas en texto ni de otros idiomas (por ejemplo castellano), lo que obliga a traducir las fichas si se despliega en Espana o Latinoamerica.
- No es un modelo generativo: no admite prompts, tool calling, agentes ni razonamiento multi-paso. Cualquier funcionalidad conversacional requiere un LLM externo que consuma los resultados de recuperacion.
- Entradas rigidas: imagen de 160x160 RGB normalizada y audio de exactamente 5 s a 16 kHz. Formatos distintos exigen preprocesado explicito (redimensionado, remuestreo, recorte) que puede degradar la calidad del embedding.
- Sesgos potenciales no documentados: la model card no describe la composicion, la distribucion geografica, el equilibrio por clase ni las condiciones de captura del dataset de aves, por lo que pueden existir sesgos estacionales, geograficos o de desbalance entre especies raras y comunes.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede no encajar en productos de codigo cerrado que no quieran liberar sus pesos o adaptaciones.
- Comparticion de pesos por cuantizacion: los indices `.f32` y los encoders deben provenir del mismo espacio de embeddings para que la similitud sea valida; mezclar el indice del maestro con un encoder destilado degrada los resultados.
- Sin garantias de mantenimiento: el repositorio acumula 2 descargas y 0 "likes" en el momento de la consulta, sin senales de soporte activo ni de versionado posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jaichang/embeddinggemma2-global-birds-2000-litert
- Modelo base y maestro (740M): https://huggingface.co/jaichang/embeddinggemma2-global-birds-2000
- Los resultados de la busqueda web proporcionados no contienen ningun enlace relevante para este modelo (devuelven calculadoras de valores de un juego de Roblox), por lo que no hay papers, blogs ni demos adicionales que citar.
