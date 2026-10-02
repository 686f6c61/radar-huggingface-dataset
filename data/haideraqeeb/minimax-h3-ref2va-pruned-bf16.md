# haideraqeeb/MiniMax-H3-Ref2VA-Pruned-BF16

## Resumen

MiniMax H3 Ref2VA pruned BF16 es un checkpoint modificado del modelo MiniMaxAI/MiniMax-H3, preparado por el usuario haideraqeeb para su uso en ComfyUI. Se trata de un modelo generativo de referencia a vídeo (reference-to-video, Ref2VA) que produce clips de vídeo con audio estéreo a partir de referencias de imagen, vídeo y audio combinadas mediante un prompt. No es un modelo de lenguaje: es un transformer de difusión orientado a la generación audiovisual.

La modificación consiste en comprimir las proyecciones AdaLN encargadas del condicionamiento por timestep, reduciendo sus 2.688 entradas a 8, mientras que el resto del transformer original se preserva intacto. El checkpoint resultante ocupa 40.225.724.440 bytes frente a los 66.280.486.840 bytes de la conversión sin pérdida del modelo original para ComfyUI, lo que reduce el almacenamiento y el pico de memoria de GPU en inferencia de 72,13 GiB a 47,94 GiB, sin cambios apreciables en el tiempo de muestreo.

El interés actual de esta ficha radica en que documenta una compresión específica de las proyecciones AdaLN y su validación numérica (error relativo L2 máximo del 0,171% frente a la proyección original evaluada en FP32). Es un checkpoint de inferencia, no un reemplazo directo para entrenar el modelo original a ancho completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video con audio, con proyecciones AdaLN de condicionamiento por timestep comprimidas |
| Parametros totales | no disponible (checkpoint de 40.225.724.440 bytes en BF16) |
| Longitud de contexto | no aplica (modelo de generacion de video, sin ventana de contexto textual) |
| Tipos de cuantizacion | BF16 sin cuantizacion de pesos; no se aplica INT8, FP8 ni FP4. Las 51 proyecciones AdaLN reducidas se almacenan en BF16 y se evaluan en FP32 en tiempo de ejecucion; la tabla de interpolacion compartida de 1.025 x 8 esta en FP32 |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |
| Tamano del checkpoint | 40.225.724.440 bytes (frente a 66.280.486.840 bytes de la conversion sin perdida del original) |
| Pipeline | image-to-video (reference-to-video con audio, Ref2VA) |
| Libreria | comfyui |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion de MiniMaxAI/MiniMax-H3 que genera video y audio condicionado por referencias multimodales (imagen, video y audio). Esta variante no reentrena el modelo: aplica un proceso de conversion que ajusta un mapa afin desde la tabla de coordenadas de referencia a los embeddings de timestep activados del original, pliega ese mapa en cada proyeccion original y redondea los pesos y sesgos resultantes a BF16. Las 51 proyecciones AdaLN pasan de 2.688 entradas a 8, y ComfyUI evalua esas proyecciones reducidas en FP32 en tiempo de ejecucion.

La validacion reportada indica que las 429 tensores no pertenecientes a AdaLN coinciden exactamente con la referencia de Comfy-Org tras la conversion sin perdida de claves, QKV y layout SwiGLU. Cada fila de las 51 proyecciones reducidas se comprobo sobre 297 sondas de timestep unicas (extremos, puntos de rejilla, puntos fuera de rejilla y puntos aleatorios con semilla), con un error relativo L2 maximo por proyeccion del 0,171% frente a la proyeccion original evaluada en FP32. El autor advierte que se trata de una sonda numerica, no de una garantia de calidad general.

La diferencia respecto a la referencia pruned_bf16 de Comfy-Org es el dtype de almacenamiento de las proyecciones AdaLN reducidas: aqui en BF16 frente a FP16. BF16 tiene mayor rango de exponente pero menos bits de mantisa, por lo que este export presenta mayor error de redondeo en la proyeccion y el autor no lo presenta como numericamente identico ni superior. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni datos de entrenamiento adicionales, ya que la tarea es puramente de conversion de pesos.

## Capacidades

- Generacion de video con audio: produce clips de 1.344 x 768 pixels, 124 fotogramas nativos a 24 fps, con audio estereo.
- Condicionamiento por referencias multimodales: acepta referencias ordenadas de imagen (`<Picture N>`), video (`<Video N>`) y audio (`<Audio N>`) emparejadas con el prompt.
- Generacion de audio sincronizado: la salida incluye banda sonora estereo alineada con el video; no se detectaron muestras de audio no finitas ni recortadas en la comparacion reportada.
- Compatibilidad con el ecosistema ComfyUI: se carga desde el nodo Load Diffusion Model y se usa con el condicionamiento MiniMax H3 Reference to Video.
- Reproducibilidad de muestreo: la comparacion publicada usa seed 0, 30 pasos, sampler res_multistep, scheduler beta y PyTorch SDPA sin LoRA.
- Soporte de checkpoint AdaLN reducido: requiere una version de ComfyUI compatible con checkpoints que incluyen `adaln_t_table`.
- Tool calling / function calling: no aplica (modelo de generacion audiovisual).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de video publicitario a partir de referencias: se puede alimentar una imagen de producto, un video de estilo y un audio de marca para obtener un clip de cinco segundos coherente, aprovechando el condicionamiento Ref2VA y la reduccion de memoria del checkpoint.
- Creacion de contenido para redes sociales: generar clips cortos de 1.344 x 768 a 24 fps con audio estereo integrado, lo que evita montar la banda sonora por separado.
- Prototipado rapido en ComfyUI: al reducir el pico de memoria de 72,13 GiB a 47,94 GiB, permite iterar mas agilmente en GPUs de gama profesional que no disponen de suficiente VRAM para el modelo original a ancho completo.
- Animacion de imagenes fijas: usar una sola imagen como referencia para producir una secuencia animada con audio, apoyandose en el pipeline image-to-video documentado.
- Doblaje o reestilizado con referencia de audio: emplear la referencia de audio para condicionar la banda sonora generada junto al video.
- Evaluacion de tecnicas de compresion de difusion: servir como caso de estudio reproducible para medir el impacto de comprimir proyecciones AdaLN sobre la calidad de salida mediante PSNR de pixeles y diferencias L2 de forma de onda.
- Integracion en flujos de postproduccion: generar tomas de cinco segundos que se puedan encadenar o editar en herramientas de video, dado que la salida mantiene resolucion y cadencia constantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de generacion de video. Se incluyen las mediciones de la comparacion de generacion publicada por el autor, realizada sobre una RTX PRO 6000 Blackwell con la misma configuracion (1.344 x 768, 124 fotogramas nativos a 24 fps, seed 0, 30 pasos, res_multistep, scheduler beta, PyTorch SDPA, sin LoRA).

| Checkpoint | Tiempo de muestreo (s), incluida transferencia de modelo | Memoria GPU maxima asignada (GiB) |
|---|---:|---:|
| Original BF16 | 1133.7 | 72.13 |
| Este pruned BF16 | 1133.2 | 47.94 |
| Referencia pruned de Comfy-Org | 1133.2 | 47.94 |

| Metrica de divergencia frente al original | Este pruned BF16 | Referencia de Comfy-Org |
|---|---:|---:|
| PSNR de pixeles del video de presentacion (dB) | 41.84 | 41.64 |
| Diferencia relativa L2 de forma de onda de audio | 0.2010 | 0.0889 |

El autor indica que estas son mediciones de una unica ejecucion y de divergencia, no puntuaciones de calidad perceptual, y que un solo prompt y una sola semilla no permiten establecer equivalencia de calidad general.

## Requisitos de hardware

- Memoria de GPU: el checkpoint podado alcanzo un pico de memoria asignada de 47,94 GiB; el original BF16 alcanzo 72,13 GiB. Son mediciones de pico asignado, no un requisito minimo de VRAM declarado.
- GPU de referencia en las pruebas: RTX PRO 6000 Blackwell. No se documentan pruebas en otras GPU.
- GPU de consumo: no hay datos publicados sobre si cabe en GPU de consumo (por ejemplo, 24 GB). Dado el pico de 47,94 GiB medido, es previsible que no quepa sin tecnicas de offloading, pero esto no se confirma en la informacion disponible.
- Tiempo de muestreo: aproximadamente 1133 s para un clip de cinco segundos en la configuracion descrita; el tiempo fue esencialmente identico entre original y podado.
- Opciones de despliegue: el autor documenta el uso en ComfyUI (nodo Load Diffusion Model con condicionamiento MiniMax H3 Reference to Video). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), que no aplican a este tipo de modelo.
- Dependencias no incluidas: el checkpoint no incluye el text encoder H3 ni los VAE de video y audio, que deben obtenerse por separado.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables de generacion de referencia a video con audio en los datos proporcionados. La comparacion mas directa disponible es con el modelo original y con la referencia podada de Comfy-Org.

| Modelo | Tamano del checkpoint | Almacenamiento de AdaLN reducida | Pico de memoria GPU (GiB) | Licencia |
|---|---|---|---|---|
| Este pruned BF16 | 40.225.724.440 bytes | BF16 (evaluacion en FP32) | 47.94 | minimax-h3-community-license-agreement |
| Original BF16 (conversion sin perdida) | 66.280.486.840 bytes | Sin reduccion | 72.13 | minimax-h3-community-license-agreement |
| Referencia pruned de Comfy-Org | no disponible | FP16 | 47.94 | minimax-h3-community-license-agreement |

## Limitaciones y advertencias

- Licencia: se aplica el MiniMax H3 Community License Agreement, que incluye restricciones territoriales y de uso. Consultar LICENSE y NOTICE antes de cualquier uso comercial.
- Checkpoint no oficial: es una modificacion independiente, no un lanzamiento oficial de MiniMax.
- No es un reemplazo directo para entrenamiento: es un checkpoint de inferencia; no se debe usar para entrenar el modelo original a ancho completo.
- Mayor error de redondeo: al almacenar las proyecciones AdaLN reducidas en BF16 en lugar de FP16, el export presenta mayor error de redondeo de proyeccion. El autor no lo presenta como numericamente identico ni superior a la referencia de Comfy-Org.
- Evidencia de calidad limitada: la validacion numerica es una sonda sobre timesteps, no una garantia de calidad general. La comparacion de generacion se basa en un unico prompt y una unica semilla.
- Divergencia de audio superior: la diferencia relativa L2 de forma de onda fue de 0.2010 frente a 0.0889 de la referencia de Comfy-Org, es decir, mayor divergencia en audio.
- Dependencia de version de ComfyUI: requiere una version compatible con checkpoints que incluyen `adaln_t_table`.
- Pesos auxiliares no incluidos: el text encoder H3 y los VAE de video y audio no forman parte del repositorio.
- Idiomas y sesgos: no se dispone de informacion sobre idiomas soportados ni sobre sesgos conocidos.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero los resultados generados son contenido sintetico y las muestras de ejemplo estan etiquetadas como generadas por IA.
- Trazabilidad: la creacion y actualizacion del repositorio estan fechadas en octubre de 2026 segun los metadatos, con cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haideraqeeb/MiniMax-H3-Ref2VA-Pruned-BF16
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revision base citada: 42ed227ee7df40d41602854ae760620d6eb651fe
- Referencia de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3 (revision e5eb578a89295337b8ff433a035929ce0279e0b6)
- Ejemplo oficial reproducible de Ref2VA de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/42ed227ee7df40d41602854ae760620d6eb651fe/scripts/readme/reproducible-768p-ref2va-request.sh
- Ejemplos de comparacion generados: examples/original-5s.mp4, examples/ours-5s.mp4, examples/comfy-5s.mp4, examples/side-by-side.mp4
- Validacion de la compresion: validation/pruning-validation.json
- Configuracion de generacion: validation/generation-config.json
- Resultados completos de comparacion: validation/comparison.json
