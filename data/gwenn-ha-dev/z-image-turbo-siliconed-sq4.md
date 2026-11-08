# gwenn-ha-dev/Z-Image-Turbo-Siliconed-SQ4

## Resumen

Z-Image-Turbo-Siliconed-SQ4 es una cuantizacion de los pesos del transformer (DiT) del modelo de generacion de imagenes Z-Image-Turbo, publicado originalmente por Tongyi-MAI (Alibaba). La cuantizacion la firma gwenn-ha-dev, autor de Siliconed, una aplicacion nativa de macOS escrita en Swift y Metal para generacion y edicion de imagenes en local sobre Apple silicon. El resultado es un unico fichero safetensors de 4,98 GB que sustituye a los 12,31 GB del bf16 original, con un promedio de 5,20 bits por peso.

El interes tecnico no esta en el modelo base sino en el formato: SQ4 no es GGUF ni un formato compatible con diffusers o ComfyUI. Es un formato propietario de Siliconed, con decodificador abierto en el repositorio de la aplicacion (`Sources/Siliconed/SQ.swift`), disenado para que la reduccion sobre el eje K se resuelva con un unico producto entero int8 x int8 o float x int8, con una sola escala float por fila de salida. El autor lo presenta como sustituto del GGUF Q4_K_M de unsloth dentro de Siliconed, con menor error frente al valor exacto y velocidad comparable a la variante int8 Compact.

La relevancia es acotada: solo Siliconed lee este fichero. Quien no use esa aplicacion no puede cargarlo, y el repositorio no incluye ni el text encoder ni el VAE, que Siliconed toma de sus publicadores originales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) del modelo base Z-Image-Turbo; pesos cuantizados en formato SQ4 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | SQ4: 4, 5 u 8 bits por lineal, 5,20 bits por peso de media (56 SQ4, 148 SQ5, 36 SQ8, 30 BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`z-image-turbo-sq4.safetensors`), con codificacion SQ propia; no es GGUF |

Datos adicionales: fichero de 4.983.674.848 bytes, sha256 `01a392e0cfedcb79f3574fffe841aba02f9e3933d5ead64f326b6e1377fa0bed`. 270 lineales del transformer cuantizados o conservados; los 281 tensores restantes son los del publicador, convertidos de float32 a bfloat16 sin perdida de valor.

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) de generacion text-to-image de Tongyi-MAI. Esta publicacion no entrena nada: solo recuantiza los pesos del transformer. La innovacion esta en el esquema de cuantizacion. Cada lineal W [N, K] se rota por una matriz R_K bloque-diagonal, con un bloque R256 = (H4 ⊗ H4 ⊗ H4 ⊗ H4) / 16 por cada 256 features de entrada contiguas, simetrica y autoinversa. Tras la rotacion, los pesos se agrupan en bloques de 16 valores consecutivos de una fila, sin cruzar fronteras de 256. Cada grupo se codifica con un byte de grupo que define un multiplicador entero m y un offset entero b, de modo que todos los valores decodificados caen exactamente en el rango int8 [−128, 127]. La escala es un unico float32 por fila de salida.

El resultado es que la reduccion completa sobre K se ejecuta como un unico producto int8 x int8 (con activaciones rotadas y cuantizadas por token) o float x int8, sin necesidad de sumas parciales de 32 elementos con escala float propia como exige Q4_K de GGUF. Los grupos de 16 pesos y la rotacion de Hadamard compensan la escala mas gruesa. El almacenamiento se reparte en tres arrays: `codes` (U8), `groups` (U8) y `scale` (F32), con metadatos que registran el tier de cada lineal. El coste en bits por peso es de 4,5 + 32/K para SQ4, 5,5 + 32/K para SQ5 y 8 + 32/K para SQ8.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), heredada del modelo base Z-Image-Turbo.
- Resoluciones verificadas en la evaluacion del autor: 512, 832x1216 y 1024.
- Inferencia en local sobre Apple silicon mediante Metal, a traves de la aplicacion Siliconed.
- Presupuesto de memoria controlado por la aplicacion: 3/4 de la memoria del Mac menos 2 GB.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM.
- No incluye text encoder ni VAE en el repositorio; Siliconed los carga desde sus publicadores.
- Compatibilidad limitada al ecosistema Siliconed: no carga en diffusers ni en ComfyUI.

## Casos de uso

- Generacion de imagenes en local en un Mac: el modelo permite producir imagenes a 1024 px en unos 18 segundos en un Mac mini M5 Pro con 64 GB, sin conexion a servicios en la nube ni envio de prompts a terceros.
- Sustitucion del GGUF Q4_K_M dentro de Siliconed: el autor lo publica como reemplazo directo del fichero de unsloth, con menor error frente al valor exacto y una ruta de ejecucion mas rapida en Metal, dado que la aplicacion no tiene ruta optimizada para los bloques K-quant.
- Reduccion de huella de memoria en equipos con RAM limitada: el fichero de 4,98 GB frente a los 12,31 GB del bf16 permite ejecutar el transformer en Macs con menos memoria unificada, con un pico de 9.379 MB medido en la renderizacion de 1024 cuadrada.
- Evaluacion de esquemas de cuantizacion: el repositorio documenta el formato completo y ofrece mediciones de error por capa y por salida frente a un testigo en float64, lo que sirve como referencia para quien investigue cuantizacion post-entrenamiento en modelos de difusion.
- Prototipado de pipelines de imagen en Swift y Metal: al estar el decodificador en abierto en el repositorio de Siliconed, un desarrollador puede integrar la lectura del formato en sus propias herramientas sobre Apple silicon.
- Flujos de trabajo de edicion de imagen junto al resto de modelos de Siliconed (Qwen-Image-2.1, Krea 2 Turbo, Anima Turbo, MOSS-Image), compartiendo el mismo gestor de memoria de la aplicacion.

## Benchmarks y rendimiento

El autor no publica benchmarks de calidad de imagen (FID, CLIP score ni similares), sino error relativo frente al valor exacto. La metrica "Distancia" es el error relativo por canal de salida (norma L2 del error sobre norma L2 de la salida exacta, con suelo del 1 % de la mediana de canal), expresada como peor canal / canal mediano.

| Punto | Valor exacto | Q4_K_M (unsloth) | SQ4 (este fichero) |
|---|---|---|---|
| 512, seed 0 | testigo fp64 | 0,2769 / 0,0706 | 0,1997 / 0,0445 |
| 1024, seed 0 | testigo fp64 | 0,5418 / 0,0718 | 0,2349 / 0,0453 |
| 832x1216, seed 0 | testigo fp64 | 0,4043 / 0,0706 | 0,2571 / 0,0447 |
| 1024, seed 1, prompt 2 | oraculo fp32 | 0,4011 / 0,0707 | 0,2520 / 0,0447 |
| 1024, seed 2, prompt 3 | oraculo fp32 | 0,6295 / 0,0715 | 0,2568 / 0,0448 |
| 1024, seed 3, prompt 1 | oraculo fp32 | 0,3760 / 0,0721 | 0,1963 / 0,0452 |
| 832x1216, seed 1, prompt 2 | oraculo fp32 | 0,3942 / 0,0713 | 0,3104 / 0,0444 |
| 832x1216, seed 2, prompt 3 | oraculo fp32 | 0,3834 / 0,0708 | 0,3516 / 0,0444 |
| 832x1216, seed 3, prompt 1 | oraculo fp32 | 0,3835 / 0,0713 | 0,2301 / 0,0445 |

En las 240 lineales de bloque evaluadas sobre sus entradas reales, el error de SQ4 es menor que el de Q4_K_M en las 240. En los 9 puntos de salida, SQ4 es mas cercano al valor exacto tanto en el peor canal como en la mediana.

Rendimiento en Siliconed (Mac mini M5 Pro, 64 GB, render de 1024 cuadrada, 8 pasos, seed 42):

| Transformer | Fichero | Render | Pico de memoria |
|---|---:|---:|---:|
| SQ4 (Light) | 4,98 GB | 18,06 s | 9.379 MB |
| int8 convrot (Compact) | 6,20 GB | 17,17 s | 10.328 MB |
| GGUF Q4_K_M | 5,02 GB | no medido | no medido |

## Requisitos de hardware

- VRAM o memoria unificada: pico medido de 9.379 MB para un render de 1024 cuadrada con 8 pasos en Siliconed; el fichero de pesos ocupa 4,98 GB.
- Plataforma: exclusivamente Apple silicon con Metal. No hay soporte CUDA ni ROCm documentado.
- GPU recomendadas: Apple M5 Pro (medicion del autor); no se han publicado mediciones para otras variantes de chip.
- Cabe en consumer GPU de Apple: si, en funcion del presupuesto de memoria de Siliconed (3/4 de la RAM del Mac menos 2 GB).
- Opciones de despliegue: unicamente Siliconed 0.21 o posterior. No es compatible con vLLM, llama.cpp, Ollama, TGI, diffusers ni ComfyUI.
- Latencia y throughput: 18,06 s por imagen de 1024 cuadrada con 8 pasos en la configuracion medida; no se publican cifras para otras resoluciones ni otros chips.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Bits por peso | Error frente al exacto | Compatibilidad | Licencia |
|---|---|---:|---|---|---|---|
| SQ4 (este fichero) | SQ propio | 4,98 GB | 5,20 de media | 0,1963-0,3516 peor canal / 0,0444-0,0453 mediana | Solo Siliconed | Apache 2.0 |
| int8 convrot (Comfy-Org) | int8 | 6,20 GB | 8 | no disponible | Siliconed; ComfyUI segun el publicador | Apache 2.0 |
| GGUF Q4_K_M (unsloth) | GGUF | 5,02 GB | no disponible | 0,2769-0,6295 peor canal / 0,0706-0,0721 mediana | Ecosistema GGUF; Siliconed sin ruta rapida | Apache 2.0 |
| Z-Image-Turbo bf16 (Tongyi-MAI) | safetensors | 12,31 GB | 16 | referencia | diffusers, ComfyUI y otros | Apache 2.0 |

La comparacion se limita al mismo modelo base en distintas precisiones, porque la informacion disponible no incluye otros modelos de la misma categoria con los que contrastar.

## Limitaciones y advertencias

- Dependencia total de Siliconed: el fichero no carga en diffusers, ComfyUI ni ninguna otra herramienta; el formato solo lo lee esa aplicacion.
- Repositorio incompleto por diseno: faltan text encoder y VAE, que deben obtenerse de sus publicadores por separado.
- Plataforma unica: requiere Apple silicon y Metal; no hay ruta de ejecucion en CUDA, ROCm ni CPU.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al heredar los pesos del modelo base, arrastra los sesgos y limitaciones del dataset de entrenamiento de Z-Image-Turbo, no detallados aqui.
- Alucinacion visual: no se aportan metricas de fidelidad al prompt (CLIP score, FID); la evaluacion se limita al error numerico frente al valor exacto, no a la calidad semantica de la imagen.
- Idiomas: no se especifica que idiomas admite el text encoder subyacente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes externos (text encoder y VAE) que se cargan aparte.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la version de Siliconed requerida es la 0.21; el ecosistema alrededor del formato es muy reducido.
- Rendimiento no verificado de forma independiente: todas las cifras de error y velocidad provienen del autor.

## Enlaces

- Hugging Face: https://huggingface.co/gwenn-ha-dev/Z-Image-Turbo-Siliconed-SQ4
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio de Siliconed: https://github.com/gwenn-ha-dev/Siliconed
- Sitio web de Siliconed: https://gwenn-ha-dev.github.io/Siliconed/
- GGUF Q4_K_M de referencia: https://huggingface.co/unsloth/Z-Image-Turbo-GGUF
- int8 convrot de referencia: https://huggingface.co/Comfy-Org/Z-Image-Turbo
