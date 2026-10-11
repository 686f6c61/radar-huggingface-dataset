# alastorid/FlashVSR-v1.1-Tiny-Swift-MLX-BF16

## Resumen

FlashVSR-v1.1-Tiny-Swift-MLX-BF16 es una conversion comunitaria de los checkpoints oficiales de FlashVSR 1.1 Tiny Streaming, adaptada a un runtime nativo de Swift sobre MLX y Metal para Apple Silicon. El modelo original lo desarrollaron Junhao Zhuang, Shi Guo, Xin Cai, Xiaohui Li, Yihao Liu, Chun Yuan y Tianfan Xue, y esta pensado para superresolucion de video en streaming basada en difusion. Esta conversion la publica el usuario alastorid y no es una release oficial de los autores.

Se trata de un modelo de video a video (pipeline `video-to-video`) especializado en reconstruccion y superresolucion. Su nucleo es un Diffusion Transformer (DiT) en streaming de 30 bloques, acompanado de una proyeccion causal de baja calidad y un decodificador Tiny Conditional. Los pesos ocupan aproximadamente 3,22 GB en BF16 y se distribuyen en 34 shards Safetensors mas un prompt fijo de dimensiones [1, 512, 4096].

Su relevancia actual radica en que permite ejecutar superresolucion de video por difusion directamente en Macs con Apple Silicon, sin PyTorch ni interprete de Python, mediante un worker Swift/MLX nativo del proyecto Waifu. Los autores originales situan FlashVSR en la linea de la superresolucion de video en tiempo real basada en difusion (paper arXiv:2510.12747), y esta variante busca llevar ese flujo a hardware de consumo de Apple con atencion dispersa implementada como kernel Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming DiT de 30 bloques con atencion dispersa restringida por localidad, proyeccion causal de baja calidad y decodificador Tiny Conditional |
| Parametros totales | no disponible (899 tensores, ~3,22 GB de pesos en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt fijo de [1, 512, 4096]) |
| Tipos de cuantizacion | BF16 (conversion desde FP32; sin cuantizacion de bajo bit) |
| Idiomas soportados | no disponible (modelo de video, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (34 shards) en formato custom de runtime Swift/MLX |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer en streaming de 30 bloques que sigue la ruta Tiny Streaming de los autores originales. El pipeline combina una proyeccion causal de baja calidad, el DiT propiamente dicho y un decodificador Tiny Conditional, con un prompt fijo embebido como Safetensors. El worker nativo preserva una atencion dispersa con restriccion de localidad implementada mediante un kernel Metal de sparse online-softmax, ademas de memorias causales de proyeccion y decodificador, ventanas KV en streaming y correccion de color ADAIN. No se utiliza tiling espacial del DiT; se conserva la atencion sobre toda la region seleccionada.

Esta conversion no implica reentrenamiento ni ajuste fino: los parametros originales en FP32 se convirtieron a BF16, se transpusieron los layouts de convolucion para MLX, se dividio el transformer en shards por bloque y se convirtio el prompt fijo. No se aplico cuantizacion de bajo bit. El repositorio incluye un `manifest.json` que registra revisiones de origen, checksums, mapeos de parametros y checksums de los ficheros convertidos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Superresolucion de video con factor nativo 4x (unico factor validado) sobre regiones seleccionadas.
- Reconstruccion de detalle a partir de entrada de baja calidad mediante difusion en streaming.
- Procesamiento de secuencias de video con ventanas KV en streaming (validado en fragmentos de 5 y 30 fotogramas).
- Correccion de color ADAIN integrada en el pipeline.
- Comparacion A/B nativa, compositor y exportacion de audio/video en la aplicacion Waifu.
- Cache de entradas preparadas para reutilizacion entre ejecuciones.
- Inferencia sin interprete de Python ni PyTorch sobre Apple Silicon (Swift/MLX/Metal).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Restauracion de metraje antiguo o de baja resolucion: se selecciona una region del fotograma y se reconstruye a 4x, aprovechando la difusion en streaming para mantener coherencia temporal entre fotogramas.
- Reescalado de fragmentos de video para edicion en local: el modelo procesa la region deseada en un Mac con Apple Silicon y exporta directamente el video reconstruido mediante el compositor de Waifu.
- Postproduccion de planos con detalle limitado: el operador define la region de interes y aplica un factor 4x solo donde interesa, evitando procesar el fotograma completo.
- Comparacion de algoritmos de reconstruccion: la funcion A/B nativa permite confrontar FlashVSR 1.1 con SeedVR2 (algoritmo por defecto) sobre la misma entrada y geometria.
- Flujos de trabajo en macOS sin dependencias de CUDA: al no requerir Python ni PyTorch, encaja en pipelines Swift nativos en equipos de escritorio o portatiles Apple.
- Superresolucion de clips cortos con presupuesto de memoria ajustado: el modelo cabe en torno a 3,8-4,3 GB de footprint fisico pico para ROIs pequenas, lo que permite trabajar en Macs de 16 GB.
- Procesado por lotes de regiones acotadas: gracias al preflight geometrico y a la monitorizacion de footprint cada 20 ms, se pueden encadenar reconstrucciones de regiones pequenas con cancelacion por presion del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una validacion numerica frente al grafo BF16 oficial: en los fotogramas visibles se alcanzo un error absoluto medio inferior a 0,025 en el rango [-1, 1] y una correlacion superior a 0,99, comparando salidas nativas de 5 y 30 fotogramas contra la referencia (proyeccion/DiT en PyTorch CPU, decodificador en PyTorch MPS y SDPA enmascarada en lugar del dispatch CUDA disperso). El autor aclara que no es una comparacion medida sobre CUDA.

| Metrica de validacion | Valor |
|---|---|
| Error absoluto medio (fotogramas visibles) | < 0,025 en [-1, 1] |
| Correlacion | > 0,99 |
| Footprint fisico pico (ROI 128x128) | ~3,8 GB |
| Footprint fisico pico (ROI 159x253 a 256x256) | ~4,3 GB |

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 15 o superior (requisito explicito).
- VRAM/footprint estimado: ~3,8 GB pico para una ROI de salida de 128x128 y ~4,3 GB para una ROI de 159x253 con padding a 256x256. Son medidas de region pequena, no de fotograma completo.
- Equipo de referencia probado: Mac Apple Silicon de 16 GB.
- Presupuesto por defecto: 6 GB, con preflight geometrico conservador, monitorizacion de footprint cada 20 ms y cancelacion por presion del sistema operativo. El autor advierte que no puede garantizar ausencia de swap.
- GPU recomendadas: no disponibles (el modelo esta orientado a GPU integradas de Apple Silicon, no a A100, H100 ni RTX 4090; el formato es custom Swift/MLX y no es drop-in para CUDA).
- Despliegue: exclusivamente mediante el worker nativo de Waifu (`./tools/setup-native-flashvsr.sh` y `./build.sh`). No es compatible como checkpoint drop-in con Python MLX, Transformers, Diffusers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlashVSR-v1.1-Tiny-Swift-MLX-BF16 (esta ficha) | Streaming DiT de video superresolucion, conversion Swift/MLX | no disponible (~3,22 GB BF16) | no disponible | Apache 2.0 | HuggingFace (runtime Waifu Swift/MLX) |
| FlashVSR-v1.1 (JunhaoZhuang) | Streaming DiT de video superresolucion, oficial | no disponible | no disponible | Apache 2.0 | HuggingFace (implementacion oficial) |
| SeedVR2 | Reconstruccion/superresolucion de video | no disponible | no disponible | no disponible | incluido como algoritmo por defecto en Waifu |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La unica comparacion cualitativa documentada es que SeedVR2 sigue siendo el algoritmo por defecto en Waifu y que FlashVSR 1.1 se ofrece como alternativa seleccionable con comparacion A/B.

## Limitaciones y advertencias

- No es una release oficial: la conversion la mantiene un tercero (alastorid) y los autores originales no la han respaldado.
- Formato propietario: es un formato de runtime Swift custom, no un checkpoint drop-in para Python MLX, Transformers, Diffusers ni los scripts CUDA oficiales. Requiere el worker Waifu correspondiente.
- Solo esta validado el factor nativo 4x. No se han verificado HDR, pixeles no cuadrados, clips largos, calidad en cortes de escena ni inferencia de fotograma completo a gran escala.
- Riesgo de invencion de detalle: al ser un modelo de difusion, la reconstruccion puede generar detalles inexistentes. La similitud agregada no implica identidad pixel a pixel.
- Mediciones de memoria limitadas: los valores de footprint corresponden a regiones pequenas, no a rendimiento de fotograma completo.
- No se garantiza ausencia de swap en el sistema, pese al presupuesto de 6 GB y al preflight geometrico.
- La validacion se hizo contra un grafo BF16 oficial usando PyTorch CPU/MPS y SDPA enmascarada, no contra ejecucion CUDA; no es una comparacion medida en GPU NVIDIA.
- La VAE completa (Wan VAE) no esta incluida en el repositorio.
- El VAE include... no: la VAE Full-model Wan no se incluye; puede condicionar la reproducibilidad fuera del worker Waifu.
- Restricciones de licencia: Apache 2.0. Las redistribuciones deben incluir la licencia Apache y preservar avisos y atribuciones aplicables; el repositorio acompana LICENSE y NOTICE.
- No hay datos de sesgos, idiomas ni comportamiento etico relevantes, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alastorid/FlashVSR-v1.1-Tiny-Swift-MLX-BF16
- Modelo base oficial: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1 (revision 27561b186ded3402d7c975f4fd722e2885b6135f)
- Implementacion oficial y prompt: https://github.com/OpenImagingLab/FlashVSR (revision cf910c61a60733e610e9c6e8b607f80c3a6c202b)
- Runtime/conversor nativo (Waifu): https://github.com/alastorid/waifu
- Paper: https://arxiv.org/abs/2510.12747
