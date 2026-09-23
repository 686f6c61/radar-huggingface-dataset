# gurujack/splashspeed-FastH3-8-Step-V2

## Resumen

`splashspeed-FastH3-8-Step-V2` es un checkpoint destilado de generacion de video y audio sincronizados a partir de texto, publicado por el usuario `gurujack` y derivado del modelo base `MiniMaxAI/MiniMax-H3`. Se trata de un ajuste fino de destilacion (no de un modelo entrenado desde cero): la model card lo describe como el checkpoint "FastH3 8-Step V2" del proyecto FastVideo (hao-ai-lab) y lo identifica como el paso 1300 (step-1300) de un proceso de destilacion sin datos (data-free) mediante DMD2 y atencion dispersa VSA-H3 con un 80 % de esparsidad.

El objetivo del modelo es reducir drasticamente el coste de inferencia del H3 base: genera video y audio sincronizados con solo ocho pasadas forward del transformer, en lugar del muestreo multi-paso habitual en modelos de difusion. Esto lo situa en la categoria de modelos de difusion "few-step" orientados a produccion, donde la latencia y el coste por clip son el cuello de botella principal.

El checkpoint tiene aproximadamente 35 050 millones de parametros (35,05 B) en formato safetensors dentro del ecosistema diffusers, con un tamano de repositorio de 147,8 GB. La licencia es la MiniMax H3 Community License (identificador `minimax-h3-community`), heredada del modelo base. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y requiere un backend de atencion especifico (VSA-H3 de FastVideo) que no forma parte de una instalacion estandar de diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion heredado de MiniMax-H3; no se detalla la topologia completa en la informacion proporcionada (56 cabezas de atencion declaradas) |
| Parametros totales | 35 049 751 296 (35,05 B), dato real de los safetensors |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | `minimax-h3-community` (MiniMax H3 Community License, campo `license: other`) |
| Formato de pesos | safetensors, compatible con la libreria `diffusers` |
| Modalidad / pipeline | `text-to-video`, `text-to-audio-video` |
| Modelo base | `MiniMaxAI/MiniMax-H3` |
| Pasos de inferencia | 8 pasadas forward del transformer |
| Metodo de destilacion | DMD2 data-free, checkpoint step-1300 |
| Atencion | VSA-H3 con 80 % de esparsidad (backend obligatorio de FastVideo) |
| Shift del scheduler de video | 10 (frente a 12 del modelo base) |
| Tamano del repositorio | 147,8 GB |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva, sino que destila el transformer de difusion de `MiniMaxAI/MiniMax-H3` hacia un regimen de muy pocos pasos. El entrenamiento se realizo con el marco DMD2 (Distribution Matching Distillation 2, arXiv:2405.14867) en su variante *data-free*, es decir, sin acceso al dataset original de entrenamiento, apoyandose en simulacion backward y alineacion de los *shifts* por modalidad (video y audio) y del reloj de score. El checkpoint publicado corresponde al paso 1300 del proceso.

La innovacion tecnica central es el uso de VSA-H3, un backend de atencion dispersa al 80 % de esparsidad, junto con el esquema de 8 pasadas forward entrenado. La model card advierte de dos particularidades que condicionan su uso: el checkpoint exige el backend de atencion VSA-H3 de FastVideo (no funciona con atencion densa estandar) y el *shift* del scheduler de video es 10 en lugar del 12 del H3 base, por lo que el script de ejemplo lee el schedule entrenado directamente desde el checkpoint. La destilacion se aplico unicamente al modo texto-a-video/audio; las variantes FL2VA (first-last frame to video+audio) y Ref2VA (reference to video+audio) no fueron destiladas y, por tanto, no estan cubiertas por este checkpoint.

## Capacidades

- Generacion de video a partir de texto en 8 pasadas forward del transformer (muestreo few-step).
- Generacion conjunta de video y audio sincronizados (pipeline text-to-audio-video).
- Reduccion fuerte del coste computacional por clip frente al modelo base, al eliminar la mayor parte de los pasos de muestreo.
- Inferencia multi-GPU nativa mediante FastVideo, con kernels CUDA precompilados (ruta CUDA 13 / Blackwell) o kernel Triton en sistemas CUDA multigPU genericos.
- Seleccion automatica del scheduler entrenado desde el propio checkpoint (shift 10), evitando la configuracion del modelo base.
- No soporta FL2VA ni Ref2VA (no destilados).
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue (no es un modelo de lenguaje, sino un generador de video/audio).
- Sin modo "thinking", vision de entrada ni audio de entrada declarados en la informacion disponible.

## Casos de uso

- Previsualizacion creativa rapida: generar clips con audio para validar una idea de guion o de direccion de arte antes de comprometer un render final; las 8 pasadas forward permiten iterar muchas variantes en el mismo tiempo que costaria un unico clip del modelo base.
- Produccion publicitaria de bajo coste: crear piezas de video cortas con locucion o efectos sonoros sincronizados a partir de un prompt, aprovechando que el modelo genera imagen y audio en la misma pasada.
- Contenido para redes sociales: generacion por lotes de clips verticales con banda sonora, donde el throughput por GPU (4x B200 en la configuracion probada) es el factor determinante.
- Agentes creativos de video en produccion: la propia model card menciona que Nuva Lab aporto *grounding* de produccion a partir de su experiencia con cargas de trabajo reales de video-agents, lo que sugiere su uso dentro de pipelines automatizados que generan variantes de video sin intervencion humana.
- Postproduccion y doblaje sintetico: el pipeline text-to-audio-video permite generar una pista de audio alineada con el video en una sola ejecucion, util para prototipos de doblaje o de diseno sonoro.
- Investigacion en destilacion de modelos de difusion: el checkpoint es un caso de estudio reproducible de DMD2 data-free aplicado a un modelo de 35 B con atencion dispersa al 80 %, util para comparar tecnicas de few-step distillation.
- Optimizacion de coste en infraestructura cloud: sustituir el muestreo multi-paso del H3 base por 8 pasadas forward reduce proporcionalmente el tiempo de GPU por clip, lo que abarata el coste por minuto generado en flotas con GPUs de gama alta.
- Evaluacion de backends de atencion dispersa: sirve como banco de pruebas para medir el impacto de VSA-H3 (80 % de esparsidad) frente a atencion densa en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, IS, MOS de audio ni comparativas numericas con el modelo base), y se limita a advertir cualitativamente de que el movimiento dificil, el detalle fino y parte del audio pueden quedar por debajo del modelo base MiniMax H3.

## Requisitos de hardware

- Peso de los parametros: 35,05 B en safetensors; en bf16/fp16 esto supone aproximadamente 70 GB solo de pesos del transformer, cifra estimada a partir del numero de parametros. El repositorio completo ocupa 147,8 GB, incluyendo el resto de componentes (VAE, codificadores de texto y audio, etc.).
- VRAM estimada: no disponible de forma oficial. Como referencia derivada, una carga en bf16 requiere del orden de 70 GB para los pesos mas activaciones y cache, lo que implica agregacion de memoria en varias GPU o cuantizacion, y no se documentan recetas de cuantizacion para este checkpoint.
- GPU probadas: 4x NVIDIA B200, con la ruta CUDA 13 / Blackwell y el wheel precompilado de `fastvideo-kernel` (evita compilar el kernel localmente).
- Sistemas CUDA multigPU genericos: la model card indica anadir `--no-replicated-dit --vsa-kernel triton --no-fa4`. El numero de GPUs debe dividir las 56 cabezas de atencion de H3 (divisores validos: 1, 2, 4, 7, 8, 14, 28, 56).
- GPU de consumo: no disponible; con ~70 GB de pesos en bf16 no cabe en una GPU consumer de 24 GB (RTX 4090) sin cuantizacion adicional, y no se publican pesos GGUF/FP8 para este checkpoint.
- Opciones de despliegue: FastVideo (via `uv`, extra `.[fasth3]`, script `examples/inference/basic/basic_fasth3_8step.py`), con soporte declarado de backend de atencion VSA-H3. El tag de libreria es `diffusers`, pero el propio autor advierte que el checkpoint exige el backend VSA-H3 de FastVideo.
- Latencia y throughput: no disponibles. La unica cifra operativa publicada es el numero de pasadas forward (8) y el ejemplo probado con `--no-warmup --repeats 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| splashspeed-FastH3-8-Step-V2 | 35,05 B | no disponible | 8 pasadas forward (destilado DMD2) | minimax-h3-community | HuggingFace, requiere FastVideo + VSA-H3 |
| MiniMaxAI/MiniMax-H3 (base) | 35,05 B (mismo base) | no disponible | muestreo multi-paso (shift 12) | minimax-h3-community | HuggingFace |
| Otras alternativas de video open source (Wan, HunyuanVideo, LTX-Video, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, unico punto de referencia documentado en la informacion disponible. No se proporcionan datos verificados de terceros modelos comparables, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Degradacion de calidad respecto al base: la propia model card reconoce que el movimiento dificil, el detalle fino y parte del audio pueden quedar por debajo de MiniMax H3.
- Dependencia de un backend no estandar: el checkpoint requiere obligatoriamente el backend de atencion VSA-H3 de FastVideo; una instalacion estandar de diffusers no es suficiente.
- Configuracion de scheduler no estandar: el shift de video es 10 en lugar de 12; usar la configuracion del modelo base produce resultados incorrectos.
- Restriccion de paralelismo: el numero de GPUs debe dividir las 56 cabezas de atencion; no vale cualquier topologia multigPU.
- Cobertura incompleta de tareas: FL2VA y Ref2VA no fueron destilados y no estan soportados por este checkpoint.
- Licencia: MiniMax H3 Community License (`license: other`, `license_name: minimax-h3-community`). Es una licencia de comunidad, no una licencia open source estandar; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinacion visual y de audio: al ser un modelo generativo no se declaran mecanismos de verificacion factual; los prompts pueden producir contenido fisicamente incoherente, artefactos de movimiento o audio desincronizado.
- Idiomas: no se declara ninguna lista de idiomas soportados, ni para los prompts ni para el audio generado.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion del dataset de destilacion (el proceso es data-free, sin acceso al dataset original), por lo que no es posible auditar la procedencia de los datos.
- Madurez del artefacto: 0 descargas y 0 likes, fecha de creacion 2026-09-23, y el autor del repositorio (`gurujack`) no coincide con el equipo que firma la model card (FastVideo / hao-ai-lab); conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que respalde su uso en produccion frente al modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/gurujack/splashspeed-FastH3-8-Step-V2
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Guia de instalacion de FastVideo: https://hao-ai-lab.github.io/FastVideo/getting_started/installation/
- Blog de FastH3: https://haoailab.com/blogs/fasth3-preview/
- Coleccion FastH3: https://huggingface.co/collections/FastVideo/fastvideo-fasth3
- Paper DMD2: https://arxiv.org/abs/2405.14867
- Framework FastGen (NVIDIA): https://github.com/NVlabs/FastGen
- Nuva Lab: https://nuvalab.ai/
- vLLM: https://vllm.ai/
- NVIDIA: https://www.nvidia.com/en-us/
- MBZUAI: https://mbzuai.ac.ae/
