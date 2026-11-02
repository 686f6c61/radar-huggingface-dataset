# assassinshadow/aiserver-sd-bundles

## Resumen

`assassinshadow/aiserver-sd-bundles` no es un checkpoint de modelo en el sentido habitual, sino una coleccion de 21 paquetes de Stable Diffusion 1.5 compilados *ahead-of-time* para la NPU Hexagon de Qualcomm, en el formato que consume la aplicacion AutoDroid Studio. Cada bundle contiene binarios de contexto QAIRT compilados para una version concreta de Hexagon a una resolucion fija de 512x512, junto con dos grafos pequenos de CPU y un tokenizer. La generacion se ejecuta integramente en el dispositivo movil, sin inferencia en la nube.

El repositorio cubre varias familias de checkpoints comunitarios de SD 1.5: AbsoluteReality 1.81, DreamShaper 8, Openjourney, Waifu Diffusion 1.3, AniPlus v1, Realistic Vision V5.1 y el SD 1.5 base. Para cada familia existen variantes baseline, de inpainting, con ControlNets y referencia facial, con lectura de imagen de referencia y con LCM-LoRA para generacion rapida. Los bundles ocupan entre 1,15 GB y 2,38 GB cada uno, con un total de 40 GB en el repositorio.

Su relevancia es practica: demuestra un pipeline de despliegue de difusion en NPUs moviles (Snapdragon 8 Gen 1 en adelante para las variantes con referencia) con latencias declaradas de aproximadamente 22 segundos por generacion en un 8 Gen 1 sin otra carga. No sirve como checkpoint portable: solo es util para aplicaciones que hablan este formato propietario de compilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Stable Diffusion 1.5) compilada a binarios QAIRT para NPU Hexagon |
| Parametros totales | no disponible (corresponde a SD 1.5, ~983 M en UNet + VAE + CLIP; no declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; sin limite declarado) |
| Tipos de cuantizacion | no disponible; los bundles son binarios precompilados de contexto QAIRT, no pesos cuantizables por el usuario |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de calibracion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | binarios de contexto QAIRT (`.zip` con grafos compilados para Hexagon, grafos CPU y tokenizer); no safetensors ni GGUF |
| Resolucion | 512x512 fija en todos los bundles |
| Compatibilidad NPU | Hexagon v68 y posteriores; variantes `-ref` requieren Snapdragon 8 Gen 1 o superior |
| Tamano por bundle | 1,15 GB a 2,38 GB |
| Tamano del repositorio | 40,0 GB |
| Libreria declarada | liveportrait |

## Arquitectura y entrenamiento

Los bundles no incluyen entrenamiento propio: son recompilaciones de checkpoints SD 1.5 existentes (UNet, VAE y text encoder CLIP) a grafos ejecutables sobre la NPU Hexagon mediante QAIRT. La model card describe cada paquete como un conjunto de binarios de contexto compilados para una version de Hexagon y una resolucion fija, mas dos grafos pequenos que se ejecutan en CPU y un tokenizer. No se documenta el proceso de calibracion de cuantizacion ni los parametros exactos de compilacion.

Hay detalles tecnicos relevantes en la seleccion y ajuste de checkpoints. Realistic Vision V5.1 incorpora el VAE `sd-vae-ft-mse` en lugar del VAE de su repositorio original. La variante de inpainting de Realistic Vision se compila desde el checkpoint de inpainting propio del autor (`Realistic_Vision_V5.1_fp16-no-ema-inpainting.safetensors`), no por diferencia de pesos. Los bundles `-pose` usan los ControlNets compilados de AbsoluteReality. Waifu Diffusion 1.3 se eligio por su cadena de derechos limpia: fine-tuning desde SD 1.4 sobre 680k imagenes anime en octubre de 2022, anterior a la filtracion de NovelAI de la que descienden la mayoria de checkpoints anime de SD 1.5. Las variantes LCM incorporan LCM-LoRA para reducir pasos de muestreo. La calibracion se realizo con conjuntos de prompts por estilo (`anime_prompts.txt`, `anime_semi_prompts.txt`, `view_prompts.txt`), y se publican hashes SHA-256 de algunos zips.

## Capacidades

- Generacion texto-a-imagen a 512x512 con estilos diferenciados: fotorrealista (AbsoluteReality, Realistic Vision), proposito general (DreamShaper 8), estilizado (Openjourney), anime (Waifu Diffusion 1.3) y anime semirrealista 2.5D (AniPlus v1).
- Inpainting y edicion localizada en las variantes `-inpaint`, con soporte de imagen de referencia facial en varias de ellas.
- Control de pose y composicion mediante ControlNets en las variantes `-pose`, con referencia facial.
- Generacion de vistas alternativas de una persona a partir de una imagen de referencia en las variantes `-ref` (requiere Snapdragon 8 Gen 1 o superior).
- Generacion acelerada con LCM-LoRA en las variantes `-lcm`.
- Ejecucion completamente en dispositivo sobre NPU Hexagon, sin llamadas a servicios externos.
- Prompts por etiquetas booru para los modelos anime (Waifu Diffusion 1.3, AniPlus v1); Openjourney requiere el token disparador `mdjrny-v4 style`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada general ni audio: es exclusivamente un pipeline de difusion texto-a-imagen.

## Casos de uso

- Aplicaciones moviles de generacion de imagenes offline: integracion de los bundles en AutoDroid Studio para producir imagenes 512x512 sin conexion, aprovechando la NPU Hexagon y evitando costes de inferencia en servidor.
- Retoque fotografico en dispositivo: las variantes `-inpaint` de AbsoluteReality y DreamShaper permiten eliminar o sustituir regiones de una foto con prompts, manteniendo la imagen en el telefono.
- Creacion de avatares y retratos coherentes: los bundles `-ref` generan vistas alternativas de una persona a partir de una imagen de referencia, utiles en apps de perfil o previsualizacion de personajes.
- Ilustracion anime en apps de ocio: Waifu Diffusion 1.3 y AniPlus v1 aceptan etiquetas booru, lo que simplifica la construccion de prompts desde interfaces con selectores de etiquetas.
- Control de pose para previsualizacion artistica: las variantes `-pose` con ControlNets permiten fijar la composicion de una figura a partir de un boceto o dibujo, con calibracion declarada sobre 16 dibujos y seis caras fotograficas.
- Prototipado rapido en dispositivos de gama alta: las variantes `-lcm` reducen el coste de muestreo y sirven para iterar prompts con latencias menores en demos y pruebas de concepto.
- Fotografia de producto y moda con estilo fotorrealista: Realistic Vision V5.1 ofrece rostros y piel mas naturales, adecuado para maquetas visuales en apps de comercio, con la advertencia de menor calidad en encuadres de cuerpo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado es una latencia de aproximadamente 22 segundos por generacion en un Snapdragon 8 Gen 1 sin otra carga del sistema, para un bundle de la familia `realistic-vision-5.1` (la model card trunca la frase en "22 s for a pl"). No hay datos de throughput, consumo energetico ni comparativas numericas con otras implementaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| aiserver-sd-bundles (este repo) | SD 1.5 (~983 M, no declarado) | 512x512 fija | no aplica | creativeml-openrail-m | binarios QAIRT para Hexagon | Solo NPU Hexagon via AutoDroid Studio |
| Stable Diffusion 1.5 original | ~983 M | 512x512 (flexible) | no aplica | creativeml-openrail-m | safetensors | GPU/CPU con Diffusers, ComfyUI, etc. |
| Stable Diffusion XL | ~2,6 B (UNet) + refiner | 1024x1024 | no aplica | creativeML Open RAIL++-M | safetensors | GPU con Diffusers, ComfyUI |
| SD 1.5 en GGUF/ONNX para movil | ~983 M | 512x512 | no aplica | heredada del checkpoint base | GGUF, ONNX | CPU/GPU movil, no especifico de Hexagon |

La diferencia clave frente a las alternativas es el formato: este repositorio no ofrece pesos portables, sino artefactos compilados para una NPU concreta. En calidad y capacidades equivale a los checkpoints SD 1.5 de origen, sin mejoras de modelo propias.

## Limitaciones y advertencias

- No son checkpoints de proposito general: solo funcionan en aplicaciones que consumen el formato de AutoDroid Studio y en hardware Hexagon compatible. No se pueden cargar con Diffusers, ComfyUI, vLLM ni llama.cpp.
- Resolucion fija de 512x512; no hay soporte declarado para otras resoluciones ni para aspect ratios distintos.
- Dependencia estricta de version de NPU: la mayoria de bundles requieren Hexagon v68 o superior; las variantes `-ref` exigen Snapdragon 8 Gen 1 o superior.
- La licencia creativeml-openrail-m impone restricciones de uso (clausulas de uso aceptable de Open RAIL) y obliga a revisar la licencia de cada checkpoint de origen, que puede anadir condiciones.
- Riesgo de sesgos y alucinacion visual inherente a SD 1.5 y a los checkpoints comunitarios: sesgos de representacion en personas, estilos y culturas, y generacion de contenido incorrecto o no solicitado.
- Idiomas no declarados; los prompts de calibracion estan en ingles y los modelos anime esperan etiquetas booru, lo que penaliza prompts en castellano.
- Openjourney no funciona sin el token `mdjrny-v4 style`; sin el se obtiene SD 1.5 generico. AniPlus v1 requiere omitir "photo, realistic" del prompt negativo.
- Realistic Vision V5.1 es mas debil en encuadres de cuerpo completo, segun la propia model card.
- No hay informacion publica sobre el proceso de cuantizacion ni sobre la perdida de calidad introducida por la compilacion a QAIRT.
- El repositorio pesa 40 GB y no incluye herramientas de verificacion mas alla de los hashes SHA-256 publicados para algunos zips.
- La libreria declarada (`liveportrait`) y las etiquetas no se corresponden con un pipeline de difusion estandar, lo que puede confundir a herramientas de descubrimiento automatico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/assassinshadow/aiserver-sd-bundles
- AutoDroid Studio (aplicacion que consume los bundles): https://github.com/assassinshadow0/AiServer
- AbsoluteReality 1.81: https://huggingface.co/Lykon/absolute-reality-1.81
- DreamShaper 8: https://huggingface.co/Lykon/dreamshaper-8
- DreamShaper 8 inpainting: https://huggingface.co/Lykon/dreamshaper-8-inpainting
- Openjourney: https://huggingface.co/prompthero/openjourney
- Waifu Diffusion 1.3: https://huggingface.co/hakurei/waifu-diffusion-v1-3
- AniPlus v1: https://huggingface.co/undeleted/aniplus-v1
- Realistic Vision V5.1 (sin VAE): https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- VAE sd-vae-ft-mse: https://huggingface.co/stabilityai/sd-vae-ft-mse
