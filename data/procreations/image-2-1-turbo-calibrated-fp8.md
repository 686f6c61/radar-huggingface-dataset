# ProCreations/Image-2.1-Turbo-Calibrated-FP8

# ProCreations Image 2.1 Turbo Calibrated FP8

## Resumen

Image 2.1 Turbo Calibrated FP8 es una cuantización W8A8 en FP8 E4M3 del transformer de imagen de Qwen-Image-2.1-Turbo, un modelo de difusión de texto a imagen destilado a 8 pasos de muestreo. La publicación corre a cargo de ProCreations, que la describe como una cuantización calibrada de forma independiente y no como una release oficial de Qwen. El repositorio incluye el transformer cuantizado (7,26 GB), un loader y una CLI propios, el código fuente completo de calibración y evaluación, comparativas emparejadas contra el modelo BF16 y la evidencia de perfilado de kernels.

El problema que resuelve es la latencia de generación en GPUs Blackwell de gama profesional: frente a los 2,05 s del Turbo BF16 en 1024x1024, la versión FP8 por defecto baja a 1,17 s, y en 2048x2048 pasa de 11,45 s a 6,21 s sobre una RTX PRO 6000 Blackwell (SM120, 96 GB), en batch 1. Para ello cuantiza 224 proyecciones (q/k/v/out y SwiGLU gate/proj/out de los 32 bloques) y añade un runtime acelerado con `torch.compile`, prefijo de KV cache y SageAttention2 opcional.

Es relevante para quien despliega generación de imagen en tiempo real sobre hardware Blackwell y quiere métricas verificables, pero con dos matices importantes: el formato es propio y requiere el loader incluido, y la licencia Qwen Research limita el uso a investigación y evaluación. El modelo base sobre el que se construye también hereda la corrección tipográfica en inglés y chino y la salida RGBA con transparencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de 32 bloques con atencion q/k/v/out y SwiGLU; encoder de texto de 36 capas y VAE en BF16 |
| Parametros totales | no disponible (el repositorio publica 7,26 GB de transformer cuantizado, no un recuento de parametros) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; la atencion se midio con prefijos de 4096 y 16384 tokens |
| Tipos de cuantizacion | W8A8 FP8 E4M3: escalas de pesos FP32 por canal de salida, escalas de activacion dinamicas FP32 por token, factores SmoothQuant FP32 por canal; acumulacion FP32 (`use_fast_accum=False`) y salida BF16. Existe una version hermana en NVFP4 |
| Idiomas soportados | no disponible; la model card solo afirma que los rotulos en ingles y chino se mantienen correctos |
| Licencia | other / qwen-research (Qwen Research License); solo investigacion y evaluacion |
| Formato de pesos | formato propio Diffusers/PyTorch con loader incluido; no es drop-in para Transformers, ComfyUI, vLLM ni TensorRT |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantizacion post-entrenamiento del transformer de imagen de Qwen-Image-2.1-Turbo (a su vez, un Qwen-Image-2.1 destilado a 8 pasos). El transformer mantiene 32 bloques con atencion causal sobre el prefijo de condicionamiento y SwiGLU en la parte feed-forward; el encoder de texto de 36 capas, el VAE y las proyecciones de entrada y salida permanecen en BF16. La cuantizacion aplica FP8 E4M3 a 224 proyecciones mediante GEMM nativo CUTLASS SM120 a traves de `torch._scaled_mm`, con escalas de pesos por canal de salida, escalas de activacion dinamicas por token y factores SmoothQuant por canal. Ninguna capa necesito fallback a BF16.

El runtime es donde esta buena parte del trabajo: los bloques con prefijo cacheado se ejecutan bajo `torch.compile` con formas dinamicas; el prefill se divide en dos fases (el prefijo de prompt/referencia llena la KV cache y luego los tokens de imagen recorren la misma ruta compilada), lo que hace la KV cache del prefijo identica en bits a la del modelo original. La atencion usa SageAttention2 (QK en INT8, PV en FP8, acumulacion FP32) en las pasadas cacheadas, con una ventaja declarada de 1,39x sobre FlashAttention BF16 a 4096 tokens y 1,63x a 16384. El VAE compila y evita la cache de fotogramas de video de Wan, con decodificacion de 172 a 94 ms en 1024. La evidencia de perfilado de una generacion en 1024x1024 registra 2016 lanzamientos de GEMM FP8 SM120, 256 lanzamientos del kernel de atencion INT8/FP8 y 32 lanzamientos de SDPA enmascarada para el prefijo. No se usan salto de pasos, cache de caracteristicas, reduccion de resolucion, destilacion adicional ni LoRA. Los datos de entrenamiento del modelo base no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto a imagen en 1024x1024 y 2048x2048, y en resoluciones no cuadradas (dos de los casos evaluados lo son).
- Muestreo en 8 pasos con CFG 1, siguiendo el calendario guardado del checkpoint original.
- Edicion de imagen: la evaluacion incluye dos casos de edicion que funcionan correctamente.
- Renderizado de texto dentro de la imagen: los titulos en ingles y chino se mantienen correctos segun el autor.
- Salida RGBA con transparencia.
- Detalle fino realista: manos, pelo, plumas y cristal se describen como naturales, sin artefactos observados en la revision visual de 18 pares y 25 imagenes de la demo.
- Inferencia de 1024x1024 en 1,17 s y de 2048x2048 en 6,21 s en RTX PRO 6000 Blackwell, con decodificacion VAE compilada.
- Tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingues de chat: no disponibles (es un modelo de generacion de imagen, no un modelo de lenguaje).
- Vision de entrada: no disponible.

## Casos de uso

- Prototipado rapido de assets graficos: con 1,17 s por imagen en 1024x1024, un disenador puede iterar decenas de variantes de un concepto en un minuto dentro de un bucle de prompt engineering, sin salir del entorno de desarrollo.
- Demos interactivas en tiempo real: el autor publica una demostracion de 30 segundos; la latencia de 1,17 s permite interfaces donde el usuario ajusta el prompt y ve el resultado casi de inmediato en hardware SM120.
- Produccion de imagen en alta resolucion para impresion o material grafico: 6,21 s por pieza en 2048x2048 con 37,7 GB de pico de memoria medido, apto para lotes moderados en una sola GPU profesional.
- Edicion de imagenes existentes: los dos casos de edicion evaluados abren la puerta a flujos de retoque o variacion sobre una referencia, reutilizando la misma tuberia y el mismo loader.
- Composicion con transparencia para VFX y marketing: la salida RGBA permite superponer el resultado directamente sobre fondos en herramientas de diseno o en un pipeline de video sin recorte manual.
- Carteleria y rotulacion bilingue: la conservacion de titulos en ingles y chino hace viable generar carteles, portadas o mockups con texto legible, aunque la informacion disponible no detalla el resto de idiomas.
- Investigacion en cuantizacion FP8: el repositorio publica el codigo de calibracion y evaluacion, las metricas crudas, el desglose por etapas y la evidencia de kernels, lo que lo convierte en una referencia reproducible para estudiar el impacto de W8A8 en modelos de difusion de pocos pasos.
- Estudio de kernels y atencion en Blackwell: la comparativa entre SDPA BF16, FlashAttention y SageAttention2 a 4096 y 16384 tokens sirve como banco de pruebas para optimizacion SM120.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de imagen estandar (FID, CLIP score, GenEval u otros) en la informacion disponible. Los datos publicados son mediciones de latencia y de fidelidad respecto al modelo BF16.

Latencia, RTX PRO 6000 Blackwell (SM120, 96 GB), batch 1, 8 pasos, CFG 1, con prefijo de KV cache. Tiempo de pared sincronizado con CUDA, incluyendo codificacion del prompt, las 8 pasadas del transformer y la decodificacion del VAE:

| Runtime | 1024 x 1024 | 2048 x 2048 |
|---|---:|---:|
| BF16 Turbo (Diffusers upstream, eager) | 2,05 s | 11,45 s |
| FP8, eager | 1,53 s | 9,31 s |
| FP8, compilado, atencion BF16 | 1,24 s | 7,63 s |
| FP8, por defecto (compilado + SageAttention2) | 1,17 s | 6,21 s |

Fidelidad frente a BF16 Turbo sobre 18 casos no usados en la calibracion (16 texto a imagen y 2 ediciones), con semillas y resoluciones emparejadas:

| Runtime | LPIPS medio (menor mejor) | SSIM medio (mayor mejor) | PSNR medio | Coseno de latentes |
|---|---:|---:|---:|---:|
| FP8, por defecto | 0,055 | 0,942 | 28,6 dB | 0,9891 |
| FP8, eager | 0,057 | 0,945 | 28,1 dB | 0,9913 |

La revision visual de los 18 pares no detecto artefactos ni perdida general de calidad, pero las salidas no son identicas a BF16: el peor par (un puerto al gouache) mantiene todos los elementos pero situa los barcos sobre la arena en lugar de sobre el agua, con LPIPS entre 0,18 y 0,24. Solo la compilacion ya desplaza la salida eager con un LPIPS medio de 0,020. El propio autor advierte que es una comprobacion finita de fidelidad y no un estudio de preferencia humana.

## Requisitos de hardware

- Transformer cuantizado de 7,26 GB; el repositorio completo ocupa 7,4 GB. El encoder de texto, el VAE y el procesador se cargan aparte desde la revision fijada `d65dbc9a7e8f6b5479e33dee6030eaab2a906509`.
- Pico de memoria de GPU medido: 28,6 GB a 1024x1024 y 37,7 GB a 2048x2048. No se documentan configuraciones de menor consumo.
- GPU probada: RTX PRO 6000 Blackwell (SM120, 96 GB). El autor indica que solo se ha probado en SM120; otras arquitecturas no estan verificadas.
- GPU de consumo: el pico de 28,6 GB a 1024x1024 quedaria por debajo de los 32 GB de una RTX 5090, que tambien es SM120, pero no hay confirmacion del autor ni resultados publicados en esa tarjeta. Se trata de una inferencia a partir de las cifras medidas, no de un dato verificado.
- Opciones de despliegue: exclusivamente el loader y la CLI incluidos en el repositorio, sobre PyTorch y Diffusers. No hay soporte drop-in para Transformers, ComfyUI, vLLM ni TensorRT, y no debe convertirse el transformer cargado a BF16 o FP16.
- Entorno probado: Torch 2.14.0+cu130, Diffusers 0.41.0, Transformers 5.17.0, solo en SM120. La atencion se selecciona con `--attention sage`, `--attention bf16` o `auto`.
- Latencia y rendimiento: 1,17 s por imagen a 1024x1024 y 6,21 s a 2048x2048 en batch 1, lo que equivale, en el mejor caso medido, a unos 0,85 imagenes por segundo. El desglose a 1024 es 16 ms de encoder, aproximadamente 1,06 s para las 8 pasadas del transformer y 94 ms de VAE. Una pasada cacheada consume 129 ms de GPU, de los cuales el 70% son GEMM FP8 y el 11% el kernel de SageAttention.
- Sobrecarga adicional: 4,3 s de carga del modelo desde NVMe local; 10 s de compilacion en el primer uso a 1024 y 15 s a 2048, una vez por resolucion y proceso. El guardado de PNG no esta incluido en las cifras.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la otra cuantizacion del mismo autor; no hay datos publicados de otros modelos de imagen comparables.

| Modelo | Tipo | Formato | Latencia declarada | Licencia |
|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (BF16) | Modelo base, 8 pasos destilados | Diffusers BF16 | 2,05 s a 1024; 11,45 s a 2048 | Qwen Research |
| Image-2.1-Turbo-Calibrated-FP8 (este) | Cuantizacion W8A8 FP8 E4M3 calibrada | Diffusers/PyTorch propio con loader | 1,17 s a 1024; 6,21 s a 2048 | Qwen Research |
| Image-2.1-Turbo-Calibrated-NVFP4 | Cuantizacion NVFP4 del mismo autor | Diffusers/PyTorch propio con loader | Generacion sub-segundo a 1024 (sin cifra exacta) | Qwen Research |
| Otros modelos de imagen similares | no disponible | no disponible | no disponible | no disponible |

Frente al BF16 de referencia, la version FP8 reduce el tiempo un 43% a 1024 y un 46% a 2048, con un LPIPS medio de 0,055. La version NVFP4 prioriza aun mas la velocidad a costa de fidelidad, segun la descripcion del propio autor.

## Limitaciones y advertencias

- Licencia Qwen Research (`license: other`): uso restringido a investigacion y evaluacion; el uso comercial requiere revisar el texto de la licencia incluida.
- No es una release oficial de Qwen: es una cuantizacion de terceros, y la responsabilidad sobre su calidad y soporte recae en el autor.
- Formato propietario: requiere el loader incluido y no funciona como checkpoint drop-in en Transformers, ComfyUI, vLLM ni TensorRT. No debe convertirse a BF16 ni FP16.
- Compatibilidad de hardware muy limitada: probado solo en SM120 con Torch 2.14.0+cu130, Diffusers 0.41.0 y Transformers 5.17.0. El comportamiento en otras arquitecturas de GPU es desconocido.
- Las salidas no son identicas al modelo BF16: en modelos de pocos pasos, diferencias numericas minimas cambian la composicion. El peor caso documentado mueve los barcos del agua a la arena con LPIPS de 0,18 a 0,24.
- La validacion de fidelidad se limita a 18 pares revisados visualmente y no constituye un estudio de preferencia humana, por lo que no hay evidencia sobre calidad percibida a escala.
- Sesgos del modelo base, riesgo de alucinacion visual y comportamiento con prompts sensibles o despectivos: no documentados en la informacion disponible.
- Cobertura de idiomas no declarada: solo se afirma que los rotulos en ingles y chino se mantienen correctos; no hay datos sobre el resto.
- Huella de memoria elevada para una cuantizacion: 28,6 GB de pico a 1024 y 37,7 GB a 2048, lo que descarta GPUs de gama media o profesional con menos de 40 GB para alta resolucion.
- Sobrecoste de arranque: la compilacion inicial anade unos 10 s a 1024 y 15 s a 2048 por proceso y resolucion, relevante en despliegues serverless con arranques frecuentes.
- Traccion minima: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Version hermana NVFP4: https://huggingface.co/ProCreations/Image-2.1-Turbo-Calibrated-NVFP4
- SageAttention (dependencia opcional de atencion): https://github.com/thu-ml/SageAttention
