# lwanming/stable-diffusion-v1.5-webnn

## Resumen

Stable-diffusion-v1.5-webnn es una conversión a ONNX del conocido modelo de difusión latente Stable Diffusion 1.5, publicada por el usuario lwanming. No se trata de un modelo nuevo entrenado desde cero, sino de una reexportación del checkpoint original de RunwayML/CompVis optimizada específicamente para ejecutarse con WebNN, la API web de aceleración de inferencia neuronal en navegador. La optimización consiste en fijar formas de entrada estáticas y eliminar operadores del grafo que no se utilizan durante la inferencia.

El modelo resuelve el problema de desplegar generación de imágenes texto-a-imagen en entornos web sin depender de servidores con GPU dedicada, aprovechando las capacidades de cómputo del propio dispositivo del usuario a través de WebNN. Al derivar de SD 1.5, conserva la arquitectura de difusión latente con un encoder de texto CLIP ViT-L/14 congelado y un UNet entrenado sobre el subconjunto LAION-Aesthetics v2 5+, con una resolución nativa de 512x512.

Su relevancia es acotada y experimental: el propio autor indica que está pensado para uso educativo o de pruebas junto con la muestra correspondiente que lo acompaña. No es un modelo para producción ni un reentrenamiento, sino un artefacto de despliegue con licencia CreativeML OpenRAIL-M heredada del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Latent Diffusion Model): UNet + autoencoder VAE + encoder de texto CLIP ViT-L/14 congelado |
| Parametros totales | no disponible (repo de 7,3 GB; checkpoint original pruned ema-only ~4,27 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (encoder de texto CLIP con limite de 77 tokens) |
| Tipos de cuantizacion | no disponible (exportacion ONNX con formas estaticas; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (segun la model card del modelo original) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | ONNX (optimizado para WebNN) |

## Arquitectura y entrenamiento

La base es Stable Diffusion 1.5, un modelo de difusion latente que opera en el espacio comprimido de un autoencoder variacional. El pipeline consta de tres componentes: un VAE que codifica y decodifica imagenes entre el espacio de pixeles y el latente, un UNet que realiza el proceso de eliminacion de ruido de forma iterativa, y un encoder de texto CLIP ViT-L/14 congelado que condiciona la generacion mediante embeddings del prompt. La generacion parte de ruido gaussiano y aplica un numero configurable de pasos de muestreo, habitualmente con guiado libre de clasificador.

El checkpoint original se inicializo con los pesos de Stable Diffusion 1.2 y se ajusto finamente durante 595.000 pasos a resolucion 512x512 sobre el subconjunto "laion-aesthetics v2 5+", con un 10 % de descarte del condicionamiento textual para mejorar el muestreo con classifier-free guidance. La variante webnn no introduce cambios en los pesos: unicamente reexporta el modelo a ONNX con formas de entrada estaticas y poda los operadores no utilizados, de modo que el grafo sea compatible y eficiente en la implementacion de WebNN del navegador.

## Capacidades

- Generacion de imagenes fotorrealistas e ilustraciones a partir de prompts de texto en ingles.
- Modificacion de imagenes (image-to-image) mediante el mismo pipeline de difusion latente.
- Inpainting y outpainting a traves de las variantes y herramientas derivadas del ecosistema SD 1.5.
- Control fino de la generacion mediante prompts negativos y escala de guiado libre de clasificador.
- Ejecucion en navegador mediante WebNN, sin backend de servidor dedicado.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo de generacion de imagenes.
- Capacidad multilingue limitada al ingles por el encoder CLIP original.

## Casos de uso

- Demostraciones educativas de difusion en navegador: permite ilustrar el funcionamiento de un modelo de difusion latente ejecutandose integramente en el cliente mediante WebNN, sin infraestructura de servidor.
- Pruebas de compatibilidad WebNN: sirve como banco de pruebas para validar la implementacion de operadores y el rendimiento de WebNN en distintos navegadores y aceleradores (CPU, GPU, NPU).
- Prototipado de interfaces de generacion de imagenes: util para construir maquetas de editores graficos o herramientas creativas web antes de migrar a un backend de produccion.
- Generacion de arte conceptual y bocetos: con 512x512 nativos y el conocimiento estetico de LAION-Aesthetics, produce bocetos rapidos para diseño grafico y arte digital.
- Investigacion sobre sesgos y seguridad: al ser el checkpoint SD 1.5 ampliamente estudiado, permite reproducir analisis de sesgos y contenido nocivo en un entorno de despliegue web.
- Benchmarking de rendimiento en cliente: comparar latencia y throughput de WebNN frente a WebGPU o WebAssembly en distintos dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint original pruned ema-only ocupa unos 4,27 GB en precision completa; en FP16 ronda los 2 GB de pesos. El repo ONNX completo ocupa 7,3 GB en disco.
- GPU recomendadas: no se especifican; al ejecutarse via WebNN, el hardware depende del navegador y del dispositivo cliente (GPU integrada, GPU discreta o NPU expuesta por WebNN).
- Cabe en GPU de consumo: si, en el rango de 4-8 GB de memoria para el pipeline completo en FP16, aunque el rendimiento depende del backend WebNN disponible.
- Opciones de despliegue: WebNN en navegador (caso previsto por el autor); el formato ONNX tambien puede ejecutarse con ONNX Runtime en otros entornos, aunque no es el objetivo declarado de esta exportacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| stable-diffusion-v1.5-webnn | no disponible (repo 7,3 GB) | 512x512 nativo | ONNX (WebNN) | CreativeML OpenRAIL-M | Inferencia en navegador |
| runwayml/stable-diffusion-v1-5 | ~860 M en UNet (aprox.) | 512x512 nativo | safetensors / ckpt | CreativeML OpenRAIL-M | Referencia original, backend GPU |
| stable-diffusion-v1-5 (Diffusers) | ~860 M en UNet (aprox.) | 512x512 nativo | safetensors | CreativeML OpenRAIL-M | Pipeline PyTorch/Diffusers |

La comparativa se limita a variantes del mismo checkpoint, ya que la informacion disponible no incluye datos de modelos de difusion alternativos (SDXL, SD 2.1) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El autor declara que el modelo esta pensado unicamente para uso educativo o de pruebas, no para produccion.
- No es un modelo nuevo: hereda todos los sesgos y limitaciones de Stable Diffusion 1.5, incluidos sesgos de representacion derivados de LAION.
- Riesgo de alucinacion visual: puede generar anatomias incorrectas, texto ilegible y composiciones incoherentes, especialmente con prompts complejos.
- El encoder CLIP limita el prompt a 77 tokens y el modelo solo comprende ingles.
- Resolucion nativa de 512x512; generar a resoluciones mayores requiere tecnicas adicionales y degrada la coherencia.
- La licencia CreativeML OpenRAIL-M permite uso comercial y redistribucion, pero impone restricciones de uso (prohibicion de generar contenido ilegal o danino) que deben propagarse a los usuarios finales.
- El rendimiento real depende de la implementacion de WebNN del navegador y del hardware del cliente; no hay garantias de latencia.
- No se documentan variantes cuantizadas ni requisitos minimos de memoria para el despliegue web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lwanming/stable-diffusion-v1.5-webnn
- Modelo original: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Repositorio GitHub original: https://github.com/CompVis/stable-diffusion
- Repositorio GitHub de RunwayML: https://github.com/runwayml/stable-diffusion
- Blog de Stable Diffusion en HuggingFace: https://huggingface.co/blog/stable_diffusion
- Libreria Diffusers: https://github.com/huggingface/diffusers
