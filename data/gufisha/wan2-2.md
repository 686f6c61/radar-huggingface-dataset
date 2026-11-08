# gufisha/WAN2.2

## Resumen

WAN2.2 (repositorio `gufisha/WAN2.2`) es una conversion comunitaria de pesos del modelo de generacion de video imagen-a-video Wan2.2 I2V A14B, en su variante destilada a cuatro pasos y 720p publicada por LightX2V (ModelTC). No se trata de un modelo entrenado desde cero, sino de una reempaquetado de los checkpoints de alta y baja relacion senal-ruido del DiT en dos formatos cuantizados: FP8 (E4M3) y NVFP4 (E2M1 con escalas de bloque E4M3), orientados al runtime nativo de LightX2V.

El interes practico esta en la reduccion de huella: cada par de expertos en FP8 ocupa unos 14,5 GB por fichero, mientras que en NVFP4 baja a unos 8,4 GB, lo que facilita mantener ambos expertos residentes en GPU y ejecutar inferencia en cuatro pasos de denoising con destilacion DMD2 y sin classifier-free guidance. El repositorio completo suma 45,85 GB e incluye solo los pesos del DiT convertidos, no la pipeline completa.

Es relevante ahora porque combina tres tendencias: destilacion agresiva de pasos, cuantizacion de bajo nivel (FP4) para hardware Blackwell y ecosistemas de inferencia especializados (LightX2V) que se desmarcan de Diffusers y ComfyUI. La contrapartida es que la compatibilidad con cargadores genericos no esta establecida y que el conjunto de calibracion para NVFP4 fue muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de Wan2.2 I2V, con par de expertos high-noise / low-noise |
| Parametros totales | no disponible (denominacion comercial A14B; el repo no publica el recuento exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion; la ventana relevante es el encoder de texto UMT5, no cuantificada aqui) |
| Tipos de cuantizacion | FP8 E4M3 con escalas FP32 por canal de salida; NVFP4 E2M1 con escalas de bloque E4M3 y campos `input_global_scale` y `alpha` en FP32; pesos flotantes restantes en BF16 |
| Idiomas soportados | no disponible (el encoder de texto UMT5 se distribuye aparte) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layouts nativos de LightX2V) |

## Arquitectura y entrenamiento

El modelo subyacente es el DiT de Wan2.2 para imagen-a-video, dividido en dos expertos (alta y baja relacion senal-ruido) que se invocan secuencialmente segun el paso de denoising. La variante aqui distribuida es la destilada a cuatro pasos y 720p de LightX2V, entrenada con destilacion DMD2 sobre un dataset a 720p, con cambios especificos en el entrenamiento del experto de baja relacion senal-ruido respecto al modelo original. La configuracion de referencia usa `infer_steps: 4`, `enable_cfg: false`, `sample_guide_scale: [1.0, 1.0]`, `sample_shift: 5.0`, `boundary_step_index: 2` y `denoising_step_list: [1000, 750, 500, 250]`.

La conversion realizada por `gufisha` no anade entrenamiento: parte de pesos FP32 en disco del repositorio `lightx2v/Wan2.2-Distill-Models` (revision `db93455b9e85c4d8a3ff9297fcfa189d213cfe29`) y cuantiza las 400 matrices de atencion por bloques y de feed-forward de cada experto. En FP8 se aplica redondeo al mas cercano con qtorch y escalas FP32 por canal de salida; en NVFP4 se empaquetan pesos E2M1 con escalas de bloque E4M3 y calibracion de activaciones por experto sobre cuatro peticiones de referencia en BF16 con LoRAs de tarea activas (sin fusionar). No se fusiono ninguna LoRA ni se entreno atencion dispersa; estos ficheros no recrean los checkpoints LightWan Sparse, que se entrenaron por separado.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) a resolucion 720p.
- Inferencia en cuatro pasos de denoising gracias a la destilacion DMD2, sin classifier-free guidance.
- Control de la transicion entre experto de alta y baja relacion senal-ruido mediante `boundary_step_index`.
- Compatibilidad con LoRAs de tarea en tiempo de ejecucion (no fusionadas en los pesos).
- Soporte de atencion densa y de atencion dispersa dinamica en el runtime LightX2V (esta ultima cambia el comportamiento de inferencia con independencia del formato del checkpoint).
- Ejecucion en precision FP8 (`fp8-triton`) y NVFP4 (kernel CUDA nativo de LightX2V).
- No incluye encoder de texto, tokenizer ni VAE: hay que aportarlos por separado (UMT5 y Wan VAE).
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo generativo de difusion, no un LLM.

## Casos de uso

- Prototipado de animacion de fotografias: convertir retratos o imagenes de producto en clips de pocos segundos a 720p con cuatro pasos, lo que reduce el coste por iteracion frente a modelos de 20-50 pasos.
- Previsualizacion rapida en estudios de animacion: generar animaticos a partir de keyframes antes de pasar a produccion con el modelo completo sin destilar.
- Generacion de video para marketing: crear variaciones de un plano fijo (producto, escenario) con control de estilo mediante LoRAs de tarea aplicadas en runtime.
- Despliegue en hardware Blackwell con VRAM limitada: el par NVFP4 (unos 16,8 GB para ambos expertos) permite mantener high y low noise residentes en una RTX PRO 6000 o GPUs de gama alta con 24-32 GB.
- Investigacion en cuantizacion de modelos de difusion: comparar calidad FP8 frente a NVFP4 sobre el mismo checkpoint destilado, con atencion densa como linea base.
- Evaluacion de pipelines LightX2V: banco de pruebas para kernels Triton y CUDA personalizados, incluida la ruta `fp8-triton` con parches locales.
- Integracion en servicios de generacion de video bajo demanda: al no requerir CFG y usar cuatro pasos, el coste computacional por peticion es acotado, aunque la latencia real depende de resolucion, numero de frames y backend de atencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo confirma que ambos pares convertidos completaron inferencia imagen-a-video en una RTX PRO 6000 Blackwell (SM120) con un checkout preparado de LightX2V, y advierte explicitamente de que no se emite ninguna afirmacion universal de velocidad.

## Requisitos de hardware

- VRAM estimada para FP8: unos 14,5 GB por experto; ambos pares requieren del orden de 29 GB solo en pesos, mas activaciones, encoder de texto y VAE.
- VRAM estimada para NVFP4: unos 8,4 GB por experto; ambos pares suman unos 16,8 GB en pesos, con margen adicional para activaciones y componentes auxiliares.
- GPU validadas: RTX PRO 6000 Blackwell (SM120) con PyTorch 2.11.0 y CUDA 13.0 para NVFP4. No se implica soporte en GPUs anteriores para NVFP4.
- GPU consumer: no hay validacion publicada. Por capacidad de VRAM, un par NVFP4 podria caber en tarjetas de 24 GB o mas, pero la dependencia del kernel CUDA nativo de LightX2V y de SM120 hace que el soporte en RTX 4090 u otras arquitecturas no este confirmado.
- Opciones de despliegue: runtime nativo de LightX2V (commit `9bf4d39ac048a0d922b9a2139da9ed795f78f4e8`). La compatibilidad con cargadores de ComfyUI o con Diffusers generico no esta establecida.
- Para FP8 se uso el esquema `fp8-triton` con un parche local de Triton para cargas de cola enmascaradas de escalas y sesgos y cargas de activacion irregulares rellenadas con ceros; el commit sin parchear no es el runtime validado.
- Latencia y throughput: no disponibles. Dependen de atencion (densa o dispersa), kernels, resolucion, numero de frames, residencia del modelo y estado de calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos de inferencia | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| gufisha/WAN2.2 (esta ficha) | A14B (recuento no publicado) | 720p | 4 (DMD2, sin CFG) | Apache 2.0 | safetensors FP8 / NVFP4 para LightX2V | Repo comunitario, 0 descargas |
| Wan-AI/Wan2.2-I2V-A14B | A14B | 720p | no disponible | Apache 2.0 | safetensors (oficial) | Repositorio oficial en Hugging Face |
| lightx2v/Wan2.2-Distill-Models | A14B | 720p | 4 | Apache 2.0 | safetensors FP32 en disco | Repositorio upstream de LightX2V |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que la informacion disponible no incluye datos de rendimiento ni especificaciones de alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de Wan-AI ni de LightX2V; no hay garantia de equivalencia de calidad con el modelo original.
- La calibracion de activaciones para NVFP4 se hizo sobre solo cuatro peticiones de referencia, un conjunto muy pequeno que puede sesgar los resultados en dominios alejados de esas muestras.
- La cuantizacion FP8 y NVFP4 puede degradar la calidad respecto a BF16; la model card recomienda empezar con atencion densa para evaluar la calidad de la conversion.
- El repositorio no es una pipeline completa: faltan configuracion del modelo, encoder UMT5, tokenizer y VAE Wan.
- La compatibilidad con ComfyUI y Diffusers no esta establecida; los layouts son nativos de LightX2V.
- Los ficheros FP8 no son el formato NVFP8 de NVIDIA; no deben confundirse.
- NVFP4 depende de un kernel CUDA nativo y de hardware Blackwell (SM120); no se implica soporte en GPUs anteriores.
- La ruta FP8 validada requiere un parche local de Triton no incluido en el repositorio.
- La atencion dispersa dinamica altera el comportamiento de inferencia de forma independiente al formato del checkpoint; no debe asumirse equivalencia con la atencion densa.
- No se incluyen imagenes de entrada, videos generados, prompts, LoRAs ni registros de calibracion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluacion de alucinacion visual; al ser un modelo de difusion, los riesgos tipicos son artefactos, incoherencia temporal y fidelidad limitada a la imagen de entrada.
- Licencia Apache 2.0 declarada por los repositorios upstream; conviene revisar `LICENSE` y `NOTICE` del repo para obligaciones de atribucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gufisha/WAN2.2
- Arbol de ficheros: https://huggingface.co/gufisha/wan2.2/tree/main
- Modelo base original: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Pesos fuente destilados: https://huggingface.co/lightx2v/Wan2.2-Distill-Models
- Model card upstream citada: https://huggingface.co/lightx2v/Wan2.2-Distill-Models/blob/db93455b9e85c4d8a3ff9297fcfa189d213cfe29/README.md
- Runtime LightX2V (commit fijado): https://github.com/ModelTC/LightX2V/tree/9bf4d39ac048a0d922b9a2139da9ed795f78f4e8
