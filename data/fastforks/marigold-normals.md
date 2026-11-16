# fastforks/marigold-normals

## Resumen

Marigold normals LCM es un modelo de difusión derivado de Stable Diffusion 2 cuyo UNet ha sido ajustado para estimar mapas de normales de superficie a partir de una única imagen RGB. Fue desarrollado originalmente por el grupo PRS-ETH (Ke et al., 2023/2025) y esta ficha corresponde a la distribucion `fastforks/marigold-normals`, un repositorio de tarjeta de modelo que no aloja pesos: el runtime de fastforks descarga los pesos de los autores y los verifica mediante SHA-256. El modelo base es `prs-eth/marigold-normals-lcm-v0-1`, destilado con Latent Consistency Models para reducir la generacion a un unico paso de denoising.

La relevancia de esta variante es practica: al ser un modelo LCM de un solo paso, la inferencia es mucho mas rapida que la de un modelo de difusion de multiples pasos, lo que lo hace viable en GPUs de consumo. Segun las mediciones incluidas en la model card, procesa una imagen de 994x1482 en 167 ms con el backend `kernels` sobre una RTX 5060 Ti de 16 GB, con un pico de memoria de 2361 MiB asignados.

La salida es un tensor de normales `[B, H, W, 3]` con vectores unitarios en el marco de la camara (x derecha, y abajo, z hacia delante), no un mapa de profundidad metrico. La licencia declarada es OpenRAIL++ en la ficha de Hugging Face, mientras que los pesos originales se publican como Apache-2.0 con las restricciones de uso de CreativeML OpenRAIL++-M heredadas de Stable Diffusion 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (Stable Diffusion 2) con destilacion LCM de un paso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen; cualquier H x W >= 1, redimensionada o con padding internamente) |
| Tipos de cuantizacion | no disponible (la model card reporta ejecucion en fp16 y fp32) |
| Idiomas soportados | no disponible (modelo de vision, sin componente de texto en inferencia) |
| Licencia | OpenRAIL++ en la ficha HF; pesos originales Apache-2.0 con restricciones CreativeML OpenRAIL++-M |
| Formato de pesos | safetensors (UNet, VAE y text encoder por separado) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusion heredado de Stable Diffusion 2, ajustado para denoising de un latente de normales condicionado por el latente de la imagen de entrada. La variante `lcm-v0-1` aplica destilacion Latent Consistency Model, de modo que la generacion se resuelve en un unico paso en lugar de una cadena de pasos de difusion. El pipeline declarado es `depth-estimation` y la tarea registrada es `depth`, aunque la salida real son normales de superficie (`result.normals`), con `kind` igual a `none` al no producir profundidad.

El entrenamiento parte de Stable Diffusion 2 (subconjuntos de LAION-5B) y se afina sobre datasets sinteticos: Hypersim, Virtual KITTI 2 y otros conjuntos sinteticos segun el paper de Marigold (arXiv 2505.09358), tras lo cual se aplica la destilacion LCM. La model card no detalla el numero de tokens ni la composicion exacta del dataset de ajuste, ni si hubo RLHF o DPO; al tratarse de un modelo de vision, esos componentes no aplican del mismo modo. La innovacion tecnica principal es la reduccion a un solo paso de difusion, que segun las mediciones reduce el tiempo de primera llamada de 2,86 s (codigo original) a 0,47 s con el backend `kernels`.

## Capacidades

- Estimacion de normales de superficie a partir de una unica imagen RGB, con salida `[B, H, W, 3]` de vectores unitarios en el marco de la camara.
- Procesamiento de entradas de cualquier resolucion H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000 en fp16 sobre una RTX 5060 Ti de 16 GB.
- Inferencia de un solo paso gracias a la destilacion LCM, adecuada para procesamiento por lotes y pipelines en tiempo casi real.
- Dos backends de ejecucion: `portable` (PyTorch) y `kernels` (kernels optimizados), con soporte adicional de `torch.compile` y TensorRT fp16 segun las mediciones de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generacion de texto: es un modelo puramente visual.
- No se declaran capacidades multilingues ni modos especiales como thinking, vision general o audio.

## Casos de uso

- Reconstruccion 3D y fotogrametria: los mapas de normales por pixel alimentan etapas de integracion de superficie o de refinado de mallas en pipelines de escaneo con una sola vista, donde el coste de un paso de difusion es aceptable frente a metodos multi-vista.
- Realce de iluminacion y relighting: las normales permiten recolocar fuentes de luz virtuales sobre una fotografia sin geometria explicita, util en edicion de imagen y en generacion de assets para videojuegos.
- Aumento de datos para vision por computador: generar normales sinteticas a partir de imagenes reales para entrenar modelos de estimacion de profundidad, segmentacion o deteccion de superficies, aprovechando el bajo coste por imagen del paso unico.
- Preprocesado en pipelines de robotica y navegacion: estimar la orientacion local de superficies para planificacion de agarre o deteccion de planos, con latencias de 167 ms por imagen de 994x1482 en el backend `kernels`.
- Control de calidad en inspeccion industrial: detectar irregularidades de orientacion en superficies fabricadas comparando el mapa de normales con una referencia, en escenarios donde no se dispone de camaras estereo.
- Prototipado e investigacion en difusion para vision: servir como referencia reproducible de un modelo LCM de un paso para experimentos de destilacion y comparacion de backends, con verificacion de integridad de pesos por SHA-256.
- Efectos visuales y compositing: integrar normales en herramientas de postproduccion para insertar elementos CGI con iluminacion coherente a partir de una unica placa.

## Benchmarks y rendimiento

La model card incluye mediciones de velocidad y memoria, pero la tabla de precision (AbsRel / delta1 sobre datasets publicos) aparece truncada en la informacion disponible, por lo que no se pueden presentar resultados de exactitud.

Rendimiento medido sobre RTX 5060 Ti 16 GB (sm_120), entrada 994x1482:

| Metrica | Original fp32 | Original | Portable | Kernels |
|---|---|---|---|---|
| Tiempo de inferencia (ms) | no disponible | 280 | 272 | 167 |
| Pico de memoria asignada (MiB) | 3441 | no disponible | 2792 | 2361 |
| Pico de memoria reservada (MiB) | 3640 | no disponible | 2960 | 2500 |
| Carga del modelo (s) | 6,02 | no disponible | 4,11 | 8,22 |
| Primera llamada (s) | 2,86 | no disponible | 0,62 | 0,47 |

Aceleraciones adicionales con la misma entrada: `torch.compile` 223 ms (preparacion en frio de 64,5 s) y TensorRT fp16 109 ms (construccion de ONNX y engine de 182 s, pico de 4220 MiB asignados). El backend `kernels` ofrece una aceleracion de 1,7x frente al codigo original y 1,6x frente al backend portable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marigold-normals-lcm-v0-1 (esta ficha) | Difusion LCM, 1 paso, normales | no disponible | Imagen de cualquier resolucion | Apache-2.0 + restricciones OpenRAIL++-M | Pesos en HF (prs-eth) |
| marigold (variante de profundidad) | Difusion, multiples pasos, profundidad | no disponible | Imagen | Apache-2.0 | Pesos en HF |
| Modelos de profundidad relativos tipo ZoeDepth / DA3 mono | Regresion directa, profundidad relativa | no disponible | Imagen | variable | Pesos en HF |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La salida son normales de superficie, no profundidad metrica: `kind` es `none` y el resultado debe interpretarse como orientacion por pixel, no como distancias en metros.
- El repositorio `fastforks/marigold-normals` no contiene pesos; requiere descargar los ficheros de `prs-eth/marigold-normals-lcm-v0-1` y verificar su SHA-256, lo que anade un paso de red y comprobacion en el despliegue.
- Licencia con restricciones: los pesos originales son Apache-2.0, pero heredan las restricciones de uso de CreativeML OpenRAIL++-M (Attachment A) de Stable Diffusion 2, aplicables tambien a la redistribucion. La ficha de HF declara OpenRAIL++; conviene revisar ambas antes de uso comercial.
- El modelo se entrena sobre datasets sinteticos (Hypersim, Virtual KITTI 2 y otros); el dominio real puede presentar degradacion no cuantificada en la informacion disponible.
- Riesgo de alucinacion geometrica en regiones ambiguas, reflectantes o sin textura, comun en estimadores monoculares de normales.
- No hay datos publicados en la informacion disponible sobre sesgos, cobertura idiomatica (irrelevante al ser vision) ni evaluacion de robustez fuera de los conjuntos sinteticos.
- El rendimiento reportado corresponde a una unica GPU (RTX 5060 Ti 16 GB); no se garantizan las mismas cifras en otros aceleradores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/marigold-normals
- Pesos originales: https://huggingface.co/prs-eth/marigold-normals-lcm-v0-1
- Codigo del runtime fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original (diffusers, commit 086bf95): https://github.com/huggingface/diffusers
- Paper de Marigold: https://arxiv.org/abs/2505.09358
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Tarjeta de definicion de modelos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/marigold_normals/card.toml
- Licencia de Stable Diffusion 2 (Attachment A): https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL
