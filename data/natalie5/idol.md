# natalie5/idol

## Resumen

Idol es un modelo de generación de objetos 3D a partir de una única imagen, desarrollado por Sperid Labs (publicado en HuggingFace bajo el usuario natalie5). Convierte una fotografía o un render de un objeto en una representación 3D Gaussian Splatting (3DGS) estándar en formato `.ply`, generando hasta 1.048.576 gaussianas e infiriendo las partes del objeto que la imagen de entrada nunca mostró. El pipeline incluye eliminación automática de fondo, encuadre del objeto y predicción de la cámara de entrada.

El modelo se distribuye como un pipeline completo de aproximadamente 1.800 millones de parámetros repartidos entre varios componentes: un denoiser DiT (370,6 M), un decodificador octree (50,8 M), un decodificador gaussiano (237,3 M), el modelo de segmentación BiRefNet (220,7 M), el codificador de imagen DINOv3 ViT-H+/16 (840,6 M) y el VAE de FLUX.2 (84,1 M). Está pensado para ejecutarse en GPU de consumo, con un pico de 7,2 GB de VRAM y tiempos de inferencia inferiores a 2 segundos.

Su relevancia radica en que ofrece reconstrucción 3D de una sola vista con salida en un formato estándar de la industria (3DGS `.ply`), compatible con visores convencionales, y con una licencia Apache 2.0 que permite uso comercial. No es un modelo de lenguaje: es un modelo de visión 3D, por lo que las secciones de esta ficha adaptan los criterios habituales (benchmarks, hardware, capacidades) a su naturaleza image-to-3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion con denoiser DiT + decodificador octree + decodificador gaussiano; encoders DINOv3 ViT-H+/16 y VAE de FLUX.2; segmentacion con BiRefNet |
| Parametros totales | ~1,80 B (suma de todos los componentes del pipeline) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | FP16 / bf16 por defecto en GPU; opcion `fp32` para el encoder DINOv3; no se documentan cuantizaciones GGUF/INT8 |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~3,1 GB); salida en `.ply` (3D Gaussian Splatting) |

Desglose de componentes:

| Componente | Parametros | Precision en GPU | Peso en VRAM |
|---|---|---|---|
| DiT (denoiser) | 370,6 M | FP16 bloques transformer; FP32 embeddings y norms | ~0,8-1,0 GB |
| Decodificador octree | 50,8 M | FP16 bloques transformer; FP32 embeddings y norms | ~0,1-0,2 GB |
| Decodificador gaussiano | 237,3 M | FP16 bloques transformer; FP32 embeddings y norms | ~0,5-0,9 GB |
| BiRefNet (eliminacion de fondo) | 220,7 M | FP16 | ~0,44 GB |
| DINOv3 ViT-H+/16 | 840,6 M | bf16 | ~1,68 GB |
| VAE de FLUX.2 | 84,1 M | bf16 (checkpoint FP32, casteado al cargar) | ~0,17 GB |
| Peticion completa | ~1,80 B | mayoritariamente FP16/bf16, parte FP32 | ~3,7-4,4 GB de pesos, 7,2 GB de pico |

## Arquitectura y entrenamiento

Idol es un pipeline de difusion para generacion 3D de una sola vista. La imagen de entrada se procesa con DINOv3 ViT-H+/16 como codificador visual y con el VAE de FLUX.2; el denoiser principal es un transformer de difusion (DiT) de 370,6 M de parametros que opera con bloques en FP16 y embeddings y normalizaciones en FP32. La salida del denoiser se decodifica mediante dos modulos: un decodificador octree (50,8 M) y un decodificador gaussiano (237,3 M), que producen hasta 1.048.576 gaussianas en formato 3DGS estandar. El pipeline incorpora BiRefNet para eliminar el fondo y encuadrar el objeto antes de la generacion.

El muestreo se controla con pasos de difusion (50 por defecto), classifier-free guidance (`cfg_strength` 3.0 por defecto) y un desplazamiento temporal (`rescale_t` 3.0) que reparte los pasos entre la forma global y el detalle fino. En GPU hay una ruta de muestreo optimizada activada por defecto (~1,7x mas rapida, con calidad de salida identica) que combina `torch.compile` del denoiser, ejecucion conjunta de las pasadas guiada y no guiada en un solo batch, atencion con cuDNN y matmuls TF32. El primer proceso es mas lento mientras compila.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO (poco habituales en modelos 3D). La model card no detalla el proceso de entrenamiento mas alla de los componentes y su configuracion de inferencia.

## Capacidades

- Generacion de objetos 3D (3D Gaussian Splatting) a partir de una unica imagen, con hasta 1.048.576 gaussianas.
- Inferencia de geometria no observada: completa las caras y lados del objeto que la imagen de entrada no muestra.
- Eliminacion automatica de fondo y encuadre del objeto (via BiRefNet), con dos modos de recorte: `synthetic` (renders e imagenes generadas) y `real` (fotografias).
- Prediccion de la camara de la imagen de entrada, exportada como `<name>_camera.json`.
- Salida en formato estandar 3DGS `.ply`, compatible con visores de Gaussian Splatting convencionales.
- Control de generacion mediante semilla (`--seed`), numero de pasos (`--steps`), fuerza de guidance (`--cfg_strength`), desplazamiento temporal (`--rescale_t`) y numero de gaussianas (`--num_gaussians`, de 32.768 a 1.048.576 en multiplos de 32).
- Procesamiento por lotes de directorios de imagenes (`--image renders/`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso textual ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Creacion de assets 3D para videojuegos y realidad aumentada: a partir de una foto o render de un objeto se obtiene un `.ply` 3DGS listo para importar en motores o visores, lo que reduce el tiempo de modelado manual para props y decorados.
- Comercio electronico con vista 3D de producto: convertir la foto de catalogo de un articulo en una representacion 3D navegable, aprovechando la eliminacion de fondo y el modo `real` para fotografias de producto.
- Prototipado rapido en diseno industrial: generar una primera aproximacion volumetrica de un objeto a partir de un boceto renderizado (modo `synthetic`) para evaluar forma y proporciones antes de modelar en CAD.
- Escaneo 3D accesible desde movil: con una sola fotografia se obtiene un splat utilizable en visores web o apps de AR, sin necesidad de fotogrametria multi-vista ni hardware especializado.
- Generacion de contenido para entornos inmersivos: poblar escenas de realidad virtual o gemelos digitales con objetos reconstruidos desde imagenes, dado el bajo coste por inferencia (menos de 2 segundos y 7,2 GB de VRAM).
- Pipelines de datos sinteticos 3D: generar lotes de objetos 3DGS a partir de directorios de imagenes (procesamiento por lotes) para entrenar o aumentar datasets de vision 3D y deteccion.
- Restauracion y visualizacion de patrimonio: digitalizar objetos fisicos fotografiados en museos o archivos para su consulta en 3D, con la licencia Apache 2.0 permitiendo su publicacion.

## Benchmarks y rendimiento

La model card incluye una seccion de benchmark que compara Idol con TripoSplat, TRELLIS y LGM, evaluando en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), con medias sobre 1 x H100 por modelo. Sin embargo, la informacion proporcionada se interrumpe en la cabecera de la tabla y no incluye los valores numericos.

No se han publicado resultados de benchmarks completos en la informacion disponible.

| Modelo | Setting | PSNR | SSIM | LPIPS | IoU | DINOv2 | CLIP | Nitidez |
|---|---|---|---|---|---|---|---|---|
| Idol | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TripoSplat | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TRELLIS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LGM | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: 7,2 GB de pico en inferencia (pesos ~3,7-4,4 GB). Con `--dinov3_dtype fp32` se anaden ~1,7 GB adicionales.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos ~8 GB de VRAM. La model card cita GPU de consumo; el benchmark se ejecuto en 1 x H100.
- Cabe en GPU de consumo: si, con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB en adelante; las de 12-16 GB dan mas margen).
- Software: Python 3.10+, PyTorch 2.5+ y CUDA. SDK oficial `idol-sdk` (instalacion con `pip install -e .`).
- Despliegue: SDK propio (`IdolPipeline` en Python y CLI `python -m idol.sample`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: menos de 2 segundos por imagen en la configuracion descrita; el muestreo optimizado aporta ~1,7x de velocidad. La primera imagen de cada proceso es mas lenta por la compilacion de `torch.compile`.
- Dependencias gated: requiere aceptar los terminos de `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev` en HuggingFace y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol | ~1,80 B (pipeline) | 1 imagen | 3DGS `.ply` hasta 1.048.576 gaussianas | Apache 2.0 | HuggingFace (natalie5/idol), SDK y demo |
| TripoSplat | no disponible | 1 imagen | 3DGS | no disponible | no disponible |
| TRELLIS | no disponible | 1 imagen | 3D (representaciones varias) | no disponible | no disponible |
| LGM | no disponible | 1 imagen | 3D Gaussian Splatting | no disponible | no disponible |

Los tres modelos comparables aparecen citados en el benchmark de la model card como referencias de la misma tarea (generacion 3D de una sola vista), pero la informacion disponible no incluye sus parametros, contexto, licencia ni resultados numericos, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Solo dispone de una vista de entrada: las caras ocluidas se infieren y pueden presentar geometria inventada o inconsistente, especialmente en objetos con estructura interna compleja o transparencias.
- Riesgo de artefactos y "alucinacion geometrica": el modelo completa partes no observadas, lo que puede producir formas plausibles pero incorrectas.
- Dependencia de dos modelos gated (DINOv3 y FLUX.2 VAE): sin aceptar sus terminos y autenticarse, el pipeline no arranca.
- Requiere GPU NVIDIA con CUDA; no se documenta soporte para CPU, AMD, Apple Silicon ni aceleradores alternativos.
- El primer proceso es mas lento por la compilacion de `torch.compile`; en produccion conviene mantener el proceso caliente.
- No hay informacion sobre sesgos del dataset de entrenamiento ni sobre su composicion, lo que limita la evaluacion de sesgos en la reconstruccion de objetos.
- La licencia del modelo es Apache 2.0, pero los modelos gated de los que depende (DINOv3, FLUX.2 VAE) tienen sus propias condiciones que deben respetarse para uso comercial.
- No es un modelo de lenguaje: no ofrece generacion de texto, codigo, tool calling ni capacidades multilingues.
- El numero de gaussianas y los pasos de muestreo afectan al detalle y al coste; valores bajos degradan la calidad de la reconstruccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/natalie5/idol
- Pagina del proyecto: https://speridlabs.com/research/idol
- Repositorio del SDK: https://github.com/speridlabs/idol-sdk
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/speridlabs/idol
- Encoder DINOv3 (gated): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2 (gated): https://huggingface.co/black-forest-labs/FLUX.2-dev
