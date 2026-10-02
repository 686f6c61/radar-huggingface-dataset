# LocalMuseAI/mlx-flux2-klein-4b-aio-4bit

## Resumen
LocalMuseAI/mlx-flux2-klein-4b-aio-4bit es un reempaquetado en INT4 para MLX del modelo de generacion de imagenes FLUX.2 Klein 4B de Black Forest Labs, preparado por LocalMuseAI a partir de un repack AIO de SeeSeeLP / SeeSee21 publicado en Civitai. No es un fine-tune nuevo: mantiene el modelo destilado por pasos original, con un transformer de difusion (DiT) de 4B, un encoder de texto Qwen3-4B y un VAE FP32, y anade una reparacion del VAE (restauracion de `post_quant_conv.weight` y `post_quant_conv.bias`) que el AIO descargado omitia.

El objetivo es ejecutar text-to-image 1024 x 1024 en Apple Silicon con huella de memoria reducida: cuantiza a INT4 affine (grupo 64) la atencion y las FFN del DiT y el encoder Qwen3, manteniendo en BF16 las capas sensibles del DiT, con un pico de asignacion MLX medido de 3.606.375.424 bytes (3,36 GiB) en un Apple M1 Pro con 16 GiB de RAM. Esto lo hace relevante para inferencia local en Mac y, a futuro, en iPhone, sin depender de GPUs de escritorio.

Se distribuye bajo licencia Apache-2.0 junto con el modelo, el encoder de texto y el VAE, y requiere el runtime Klein INT4 de LocalMuse o una implementacion MLX compatible; no es un checkpoint AIO de ComfyUI y no debe cargarse con el layout ternario INT2 de Bonsai.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con encoder de texto Qwen3-4B y VAE; perfil MLX INT4 |
| Parametros totales | Aproximadamente 8.000 millones en el checkpoint BF16 de origen (4B DiT + 4B encoder Qwen3), derivado del fichero de 16.132.318.096 bytes |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion text-to-image); el condicionamiento usa los taps 9/18/27 de Qwen3 |
| Tipos de cuantizacion | INT4 affine (grupo 64) en atencion/FFN del DiT y en Qwen3; capas sensibles del DiT en BF16; VAE en FP32 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors empaquetados para MLX (`flux2Klein4B4Bit`); el fichero `.safetensors` del repo es un componente tensorial prequantizado, no un checkpoint ComfyUI AIO |

## Arquitectura y entrenamiento
La arquitectura combina un transformer de difusion (DiT) de tipo FLUX.2 Klein 4B, destilado por pasos, con un encoder de texto Qwen3-4B y un VAE. La inferencia en este perfil usa batch uno, 1024 x 1024, sampler Euler / Simple, entre 4 y 6 pasos (4 por defecto) y CFG 1 propia de la destilacion. El encoder, el transformer y el VAE FP32 se cargan de forma secuencial para limitar la memoria. El decodificador original emplea ventanas solapadas de 384 pixeles para memoria de movil, y las previsualizaciones en vivo proyectan el latente limpio en CPU sin otra red neuronal.

No hay entrenamiento por parte del autor: se trata de un repack que cuantiza el checkpoint oficial BF16 (16.132.318.096 bytes; SHA-256 `f9f60d53bb21970e19d31d85eefb294f9b0b5e36669ec81ba2bf52f102a7679e`). Los hidden-states crudos de Qwen en los taps 9/18/27 se concatenan, y se omiten las capas 27-35 del encoder y la cabeza de lenguaje. La reparacion del VAE se realiza sustituyendo la proyeccion ausente por la del VAE oficial de `black-forest-labs/FLUX.2-klein-4B` en la revision `e7b7dc27f91deacad38e78976d1f2b499d76a294` (SHA-256 `ca70d2202afe6415bdbcb8793ba8cd99fd159cfe6192381504d6c4d3036e0f04`), preservando la precision FP32 de los tensores del decodificador y de las estadisticas de batch-normalization.

## Capacidades
- Generacion de imagenes text-to-image a 1024 x 1024, batch uno, con 4-6 pasos (4 por defecto).
- Destilacion por pasos con CFG 1, lo que reduce el numero de evaluaciones del DiT por imagen.
- Previsualizacion en vivo del latente limpio proyectado en CPU, sin red neuronal adicional.
- Decodificacion VAE con ventanas solapadas de 384 pixeles orientada a memoria limitada.
- Ejecucion local en Apple Silicon mediante MLX y Metal, con validacion nativa en Swift.
- Sin soporte de prompt negativo ni de edicion de imagen en este perfil LocalMuse.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles (dependen del encoder Qwen3-4B subyacente).
- Capacidades especiales: thinking mode, vision o audio: no aplica.

## Casos de uso
- Generacion de imagenes local en Mac: un desarrollador puede producir imagenes 1024 x 1024 directamente en un M1 Pro de 16 GiB con un pico de 3,36 GiB, sin enviar datos a servicios en la nube, gracias al runtime MLX INT4.
- Integracion en aplicaciones de escritorio o moviles Apple: al requerir la clase de memoria nominal de 12 GB y un decodificador VAE por ventanas, encaja en apps que generan contenido visual de forma offline; la validacion fisica en iPhone queda pendiente por parte del usuario de la app.
- Prototipado de conceptos visuales: con 4 pasos Euler / Simple y CFG 1, permite iterar bocetos de concepto con baja latencia frente a modelos no destilados.
- Generacion de material para marketing y redes: la salida a 1024 x 1024 y la destilacion por pasos lo hacen util para crear variaciones de anuncios o publicaciones sin coste por API.
- Creacion de datasets sinteticos: al ser reproducible con semilla fija (por ejemplo, seed 1729 en la validacion) y ejecutable localmente, sirve para generar conjuntos de imagenes de forma controlada y con licencia Apache-2.0.
- Uso en pipelines de investigacion de difusion: la comparativa de componentes frente a Diffusers y Transformers (cosenos de 0,999953 y L2 relativo 0,009666) permite estudiar el efecto de la cuantizacion INT4 y del VAE por ventanas sobre la imagen final.
- Previsualizacion rapida dentro de herramientas de edicion: la proyeccion del latente limpio en CPU posibilita mostrar una vista previa sin cargar otra red.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje. Los datos de validacion proporcionados son comparaciones de componentes:

| Metrica de validacion | Valor |
|---|---|
| Coseno del encoder BF16 de origen | 0,995114 |
| Coseno del DiT BF16 de origen | 0,993426 |
| Coseno Diffusers (INT4 desempaquetado) frente a Swift nativo | 0,999953 |
| L2 relativo Diffusers frente a Swift nativo | 0,009666 |
| L2 relativo del VAE FP32 restaurado | 0,00000255 |
| Generacion nativa Swift 1024 x 1024 (M1 Pro, 16 GiB) | 99,47 segundos |
| Pico de asignacion MLX | 3.606.375.424 bytes (3,36 GiB) |

El autor advierte que estas son comparaciones de componentes y no pruebas de imagenes identicas entre BF16 e INT4: MLX y ComfyUI usan implementaciones distintas de RNG de ruido, y la cuantizacion INT4 junto con la decodificacion VAE por ventanas pueden alterar la imagen final.

## Requisitos de hardware
- VRAM / memoria unificada estimada: pico medido de 3,36 GiB en un M1 Pro de 16 GiB de RAM; el catalogo LocalMuse exige la clase de memoria nominal de 12 GB.
- GPU recomendadas: Apple Silicon (validado en M1 Pro con Metal API validation activada). No se documentan GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: orientado a Apple Silicon; no se especifica soporte para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime Klein INT4 de LocalMuse o una implementacion MLX compatible; la libreria declarada es `mlx`. No se indica compatibilidad con ComfyUI, vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 99,47 segundos por imagen 1024 x 1024 en M1 Pro a 4 pasos (medicion en Mac); no se publican cifras para otros dispositivos.
- Validacion fisica en iPhone: pendiente, a realizar por el usuario de la aplicacion segun indica el autor.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| mlx-flux2-klein-4b-aio-4bit (este) | ~8.000 millones (INT4, grupo 64) | 1024 x 1024, 4-6 pasos | Apache-2.0 | HuggingFace (MLX) |
| FLUX.2 Klein 4B (BF16 oficial) | ~8.000 millones (checkpoint 16,1 GB) | 1024 x 1024 | Apache-2.0 | HuggingFace (BFL) |
| FLUX.1-schnell | alrededor de 12.000 millones | destilado por pasos | Apache-2.0 | HuggingFace (BFL) |
| FLUX.1-dev | alrededor de 12.000 millones | alta calidad | licencia no comercial FLUX.1-dev | HuggingFace (BFL) |

Datos exactos de parametros, contexto y rendimiento de FLUX.1-schnell y FLUX.1-dev no disponibles en la informacion proporcionada; las cifras indicadas corresponden a caracteristicas ampliamente conocidas de esos modelos y deben verificarse en sus model cards.

## Limitaciones y advertencias
- No es un fine-tune ni un merge: es un repack cuantizado, por lo que su calidad esta acotada por el checkpoint oficial BF16 y por la cuantizacion INT4.
- La comparacion frente a BF16 no garantiza imagenes identicas; MLX y ComfyUI usan RNG de ruido distintos, y la cuantizacion INT4 y la decodificacion VAE por ventanas pueden cambiar la salida.
- Requiere el runtime Klein INT4 de LocalMuse o una implementacion MLX compatible; el fichero `.safetensors` del repo es un componente tensorial prequantizado y no un checkpoint ComfyUI AIO.
- No debe cargarse con el layout ternario INT2 de Bonsai: son formatos incompatibles.
- Limitado a text-to-image: sin prompt negativo ni edicion de imagen en este perfil, y sin tool calling, agentes ni razonamiento multi-paso.
- Idiomas soportados no documentados; el comportamiento multilingue depende del encoder Qwen3-4B subyacente.
- Al ser un repack, es imprescindible preservar LICENSE, NOTICE y la atribucion de origen (SeeSeeLP / SeeSee21 y Black Forest Labs); instalar por commit inmutable de HuggingFace, nunca por `main`.
- Los manifiestos fijan seis ficheros de runtime al commit `c2abb5051572bcda02841b3e24af3e3fe9911d57`; los commits posteriores de documentacion no alteran esos artefactos.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero puede producir artefactos visuales o imagenes incorrectas respecto al prompt, especialmente por la cuantizacion.

## Enlaces
- HuggingFace: https://huggingface.co/LocalMuseAI/mlx-flux2-klein-4b-aio-4bit
- Repack AIO de origen (Civitai, SeeSeeLP / SeeSee21): https://civitai.com/models/2327389?modelVersionId=2618128
- Modelo base FLUX.2 Klein 4B (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Encoder de texto base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
