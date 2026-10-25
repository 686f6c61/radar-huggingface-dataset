# nazunaex/tsubuDiT-beta

## Resumen

tsubuDiT beta es un proyecto hobbista de generacion de imagenes texto-a-imagen publicado por el usuario nazunaex en Hugging Face. Se distribuye en dos variantes, Small y Base, construidas sobre un Diffusion Transformer (DiT) con atencion bidireccional cruzada hacia un codificador de texto congelado. El modelo resuelve la tarea clasica de text-to-image condicionada por prompt, pero su interes no esta en competir con modelos de produccion, sino en demostrar que un DiT completo puede entrenarse en una unica GPU de consumo: el backbone entrenable es de 86,4 millones de parametros (Small) y 164,2 millones (Base), muy por debajo de los modelos de difusion habituales.

La arquitectura sigue el esquema de Diffusion Transformer con normalizacion RMSNorm, modulacion AdaLN compartida, RoPE 2D en la autoatencion, normalizacion QK y skips largos en forma de U fusionados por concatenacion y proyeccion lineal. El texto se procesa con las 12 primeras capas de Qwen3.5-0.8B-Base congeladas (estados ocultos de 1.024 dimensiones, maximo de 96 tokens) y las imagenes pasan por el VAE REPA-E/e2e-vavae-hf con 32 canales latentes y downsampling 16x, de forma que una imagen de 512x512 se convierte en 256 tokens.

El entrenamiento usa Boundary Rectified Flow sobre un subconjunto de un millon de imagenes de LAION Aesthetics 512 bucketeado, con subtitulos generados por modelo en ingles. Es relevante ahora como referencia reproducible para investigacion sobre difusion de bajo coste y como banco de pruebas para quienes quieran reimplementar el contrato de inferencia, ya que la release no incluye codigo fuente ni pipeline de Diffusers listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con autoatencion, RoPE 2D, cross-attention de texto en cada bloque, RMSNorm, AdaLN compartida y skips largos en U; objetivo Boundary Rectified Flow |
| Parametros totales | Small: 86.437.248 (incluye adaptador de texto entrenable); Base: 164.224.128 (incluye adaptador de texto entrenable). No incluye el codificador de texto congelado ni el VAE |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 96 tokens de texto (codificador congelado). En imagen: 256 tokens para 512x512 px (parches 2x2 sobre latentes 32x32) |
| Tipos de cuantizacion | No disponible. La release distribuye pesos FP32 (checkpoint completo con optimizador) y snapshots EMA en BF16; no hay GGUF ni cuantizaciones de terceros |
| Idiomas soportados | Ingles (en). Los subtitulos de entrenamiento son descripciones generadas por modelo en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ema.safetensors` por snapshot, pesos FP32 del modelo y de la EMA en los checkpoints completos). Repo de 7,1 GB con Small, Base, snapshots EMA y encoder truncado en BF16 |
| Resolucion de entrenamiento | 512 px en 19 buckets de relacion de aspecto (998.000 imagenes de entrenamiento, 2.000 de validacion) |
| Muestreo por defecto | 28 pasos de Heun, CFG 4.0 |

## Arquitectura y entrenamiento

Cada variante es un DiT con atencion propia y cruzada. Small usa anchura oculta 512 con 8 cabezas y 16 bloques DiT (6 de entrada, 4 centrales, 6 de salida); Base usa anchura 640 con 10 cabezas y 20 bloques (8 + 4 + 8). La anchura intermedia SwiGLU es de 1.536 y 1.920 respectivamente. La autoatencion proyecta QKV fusionado, normaliza Q y K por cabeza y aplica RoPE 2D con base 10.000 sobre coordenadas enteras de rejilla (mitades x e y de cada cabeza, rotando pares adyacentes); la atencion cruzada usa proyeccion de query separada y clave/valor fusionadas, con normalizacion Q/K por cabeza y sin RoPE. Las RMSNorm usan estadisticas en FP32 con epsilon 1e-6 y solo el adaptador de texto tiene escala afin (los bloques DiT y sus normas Q/K no tienen parametros de afinidad). La condicion combina timestep, texto global, tamano de imagen, relacion de aspecto e informacion de recorte; el adaptador de texto son dos bloques transformer bidireccionales sin embedding posicional mas una `global_mlp` (Linear d->d, SiLU, Linear d->d) aplicada al ultimo token valido.

El objetivo es Boundary Rectified Flow: la red predice un residuo que se usa para componer la velocidad y se minimiza el error cuadratico medio sobre la velocidad. El entrenamiento uso AdamW, tamano de batch efectivo 64, learning rate 1e-4 con 2.344 pasos de calentamiento y decaimiento EMA de 0,9999, manteniendo congelados el codificador de texto (12 primeras capas de Qwen3.5-0.8B-Base en BF16, sin la norm final ni la cabeza LM) y el VAE. Small se entreno 30 epocas hasta el paso 467.813 y Base 15 epocas hasta el paso 233.907. Se conservan snapshots EMA en BF16 en las epocas 5, 10, 15, 20, 25 y 30 (Small) y 5, 10 y 15 (Base). El entorno de referencia es PyTorch 2.13, Transformers 5.15, Diffusers 0.39, Safetensors 0.8 y CUDA con BF16.

## Capacidades

- Generacion de imagenes texto-a-imagen a resoluciones del orden de 512 px, con 19 relaciones de aspecto soportadas por el bucketing de entrenamiento.
- Acondicionamiento de texto en ingles mediante un codificador congelado de 1.024 dimensiones y ventana de 96 tokens, suficiente para prompts descriptivos cortos.
- Control explicito de tamano de imagen, relacion de aspecto y recorte como parte de la condicion, ademas del timestep y del texto global.
- Muestreo con Heun de segundo orden y escala CFG configurable (28 pasos y CFG 4.0 por defecto).
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es exclusivamente un modelo de difusion para imagenes.
- No soporta vision de entrada (no es image-to-image ni edicion por instrucciones) ni audio; la unica modalidad de entrada es texto.
- No incluye pipeline de inferencia ni codigo Python en la release: la capacidad real de generacion depende de que el usuario reconstruya el `nn.Module` compatible.

## Casos de uso

- Reimplementacion y validacion de arquitecturas DiT: los `metadata.json` de cada checkpoint incluyen `model_spec`, la media requerida de Boundary RF y las revisiones de dependencias fijadas, lo que permite reconstruir el modulo, cargar `ema.safetensors` con `strict=True` y verificar hashes de `integrity.json` antes de entrenar o inferir.
- Prototipado de pipelines de difusion en una sola GPU de consumo: con 86,4 M (Small) o 164,2 M (Base) de parametros en el backbone, es viable iterar sobre el sampler, el CFG y las 28 evaluaciones de Heun sin infraestructura dedicada.
- Investigacion sobre rectified flow y objetivos residuales: sirve como caso de estudio controlado de Boundary Rectified Flow con un dataset fijo de 998.000 imagenes y 2.000 de validacion, util para comparar formulaciones de velocidad.
- Generacion de miniaturas y previsualizaciones de formato cuadrado o panoramico: el bucketing en 19 relaciones de aspecto a ~512 px encaja en la generacion por lotes de imagenes de tarjeta, cabeceras o placeholders para maquetacion.
- Aumento de datos sinteticos para tareas de vision: al generar imagenes de 512 px a partir de descripciones en ingles, puede alimentar clasificadores o detectores en etapas tempranas, siempre con revision humana por la calidad limitada del modelo.
- Experimentos de ajuste fino y LoRA sobre difusion de bajo coste: los checkpoints completos incluyen pesos FP32 de modelo y EMA, estado del optimizador, del sampler y del RNG, lo que permite reanudar el entrenamiento si se aportan datos y caches compatibles (no incluidos).
- Docencia y demos tecnicas de text-to-image: la separacion explicita entre encoder congelado, VAE congelado y backbone entrenable hace visible el desglose de parametros de un sistema de difusion en clase o en un taller practico.
- Pruebas de humo en CI para codigo de difusion: al ser pequeno y determinista con la misma semilla y estado RNG, puede actuar como caso de test de carga de tensores y formas sin coste de GPU elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, HPSv2, GenEval ni comparaciones cuantitativas con otros modelos, y tampoco se han encontrado metricas en la busqueda web realizada.

## Requisitos de hardware

- VRAM del backbone: los pesos FP32 ocupan aproximadamente 346 MB en Small (86,4 M de parametros) y 657 MB en Base (164,2 M). Los snapshots EMA en BF16 reducen esas cifras a la mitad, en el entorno de 173 MB y 328 MB. Son calculos a partir del numero de parametros, no datos publicados por el autor.
- Componentes adicionales: hay que sumar el codificador de texto truncado (12 capas de un modelo de 0,8 B, distribuido en BF16) y el VAE REPA-E/e2e-vavae-hf, que se descarga por separado en la revision fijada en los metadatos del checkpoint.
- GPU: no hay recomendaciones oficiales. Por tamano, el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060/4060, RTX 3070/4070, RTX 4080/4090); no requiere A100 ni H100.
- Almacenamiento: el repo completo ocupa 7,1 GB por los checkpoints FP32 con estado del optimizador y los multiples snapshots EMA. La descarga selectiva por `allow_patterns` permite bajar solo un snapshot y el encoder (del orden de cientos de MB, segun el snapshot elegido).
- Despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a difusion), y tampoco existe un pipeline de Diffusers publicado. El unico camino documentado es implementar el `nn.Module` compatible y cargar los pesos con Safetensors en PyTorch con autocast BF16 sobre CUDA.
- Latencia y throughput: no disponible. Como referencia estructural, 28 pasos de Heun de segundo orden implican del orden de dos evaluaciones de red por paso, pero no se han publicado tiempos medidos.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de documentacion publica general y pueden variar segun la version; no se han verificado contra benchmarks en esta ficha, y para tsubuDiT no existen metricas publicadas, por lo que la comparacion es estructural y no de calidad.

| Modelo | Parametros del backbone | Contexto de texto | Resolucion tipica | Licencia | Formato |
|---|---|---|---|---|---|
| tsubuDiT beta Small | 86,4 M (DiT + adaptador) | 96 tokens | ~512 px | Apache 2.0 | safetensors (FP32/BF16) |
| tsubuDiT beta Base | 164,2 M (DiT + adaptador) | 96 tokens | ~512 px | Apache 2.0 | safetensors (FP32/BF16) |
| Stable Diffusion 1.5 | ~860 M (UNet) + ~123 M (CLIP) | 77 tokens | 512 px | CreativeML OpenRAIL-M | safetensors/ckpt, amplio ecosistema |
| PixArt-alpha | ~0,6 B (DiT) | hasta 120 tokens (T5) | 512-1024 px | licencia propia del proyecto (consultar) | safetensors, Diffusers |
| DiT original (Peebles et al.) | 33 M-675 M segun variante | condicion de clase, sin texto | 256-512 px | codigo de investigacion | checkpoints de investigacion |

Diferencias clave: tsubuDiT es uno o dos ordenes de magnitud mas pequeno que SD 1.5 o PixArt-alpha, lo que se traduce en menor calidad esperada y en ausencia de ecosistema (LoRAs, ControlNet, pipelines). A cambio, su licencia Apache 2.0 es mas permisiva que la OpenRAIL-M de SD 1.5 y que la licencia propia de PixArt-alpha, y su huella de VRAM es notablemente menor.

## Limitaciones y advertencias

- Calidad esperada propia de un proyecto hobbista: 86-164 M de parametros en el backbone, 512 px y 998.000 imagenes de entrenamiento estan muy lejos de los modelos de produccion; no debe evaluarse como sustituto de SDXL o Flux.
- Sesgos: el dataset es un subconjunto de LAION Aesthetics, con los sesgos demograficos, culturales y esteticos conocidos de LAION, y sin filtrado documentado en la model card.
- Subtitulos generados por modelo: el texto de entrenamiento son descripciones en ingles producidas automaticamente, lo que puede introducir errores sistematicos de anotacion y limitar la fidelidad al prompt.
- Idioma: solo ingles. Los prompts en castellano no estan soportados de forma nativa y requeririan traduccion previa, con la perdida de matiz correspondiente.
- Ventana de texto corta: 96 tokens limitan prompts largos, listas de atributos o instrucciones compuestas; el truncado es silencioso.
- Riesgo de alucinacion visual: al no existir benchmarks, no hay medida de fidelidad compositiva, conteo de objetos o renderizado de texto en imagen; se debe asumir deformaciones en manos, texto y escenas complejas.
- No hay codigo de inferencia: la release contiene cero ficheros Python del proyecto. Sin una implementacion compatible del `nn.Module` (formas, nombres de parametros y orden de rejilla correctos), los pesos son inutilizables. No es un pipeline de Diffusers instalable.
- Reanudacion del entrenamiento incompleta: aunque los checkpoints completos incluyen pesos FP32, EMA, optimizador, sampler y estado RNG, los datos y caches de entrenamiento no se distribuyen.
- Integridad: el autor recomienda verificar los hashes de `integrity.json` antes de cargar pesos; no hay firma ni verificacion mas alla de esos hashes.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento de las condiciones del dataset de origen y del VAE y encoder de terceros, que tienen sus propias licencias.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta implican ausencia de informes de errores, recetas verificadas y soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazunaex/tsubuDiT-beta
- Codificador de texto congelado (12 primeras capas): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- VAE congelado: https://huggingface.co/REPA-E/e2e-vavae-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/data-archetype/LAION_Aesthetics_512_bucketed_512
- Paper, blog o demo oficial: no disponible
- Repositorio de codigo de entrenamiento o inferencia: no disponible (no se distribuye con la release)
