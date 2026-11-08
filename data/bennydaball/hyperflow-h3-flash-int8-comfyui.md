# BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI

## Resumen

HyperFlow H3 Flash es un modelo de generacion de video con audio estereo sincronizado, desarrollado por Video Rebirth como una version comprimida y de pocos pasos (few-step) del modelo MiniMax-H3. El modelo base tiene 14.000 millones de parametros y genera video a 768p en seis pasos de inferencia, lo que lo situa en el terreno de la generacion casi en tiempo real sobre hardware de gama alta y en un rango viable para GPU de consumo. La ficha que nos ocupa no es el modelo original, sino una conversion no oficial a INT8 realizada por el usuario BennyDaBall para su uso directo en ComfyUI.

Esta conversion, publicada como `BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI`, incluye los dos checkpoints del modelo (`fl2va` para texto, primer fotograma y primer mas ultimo fotograma; `ref2va` para imagenes de referencia) convertidos a INT8 con los kernels nativos de ComfyUI, sin pasar por GGUF ni por desquantizacion a bf16. El paquete se completa con un nodo cargador propio (`comfyui_hyperflow_int8_nodes`) y una coleccion de flujos de trabajo listos para ejecutar.

Su relevancia practica es clara: el autor reporta 46,1 s por clip de 5,2 s con audio en una unica RTX 5090 de 32 GB, frente a los 66,0 s del GGUF oficial `Q4_K_M` en la misma maquina y los 139,1 s del MiniMax H3 original a 20 pasos. Es, por tanto, una alternativa de despliegue orientada a reducir latencia y huella de memoria en entornos ComfyUI, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion derivado de MiniMax-H3) |
| Parametros totales | 14 000 millones (modelo base HyperFlow H3 Flash) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (checkpoints `fl2va` y `ref2va`); el modelo base ofrece GGUF `Q4_K_M` y `Q8_0` |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors INT8 para ComfyUI (sin GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Se sabe que HyperFlow H3 Flash es una version comprimida y de pocos pasos de MiniMax-H3, disenada para generar video y audio estereo sincronizado de forma conjunta, y que opera con 6 pasos de inferencia y CFG 1. El modelo base se describe como un modelo de 14B construido sobre MiniMax H3, capaz de generar 768p en tiempo real sobre cuatro GPU B200.

La innovacion principal de esta publicacion concreta no esta en el entrenamiento, sino en la conversion: los checkpoints se han transformado a INT8 aprovechando los kernels INT8 propios de ComfyUI, evitando la desquantizacion a bf16 en tiempo de ejecucion. El autor incluye en el pack de nodos el conversor y las comprobaciones necesarias para reproducir la conversion desde los ficheros originales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio estereo sincronizado.
- Generacion de video a partir de una imagen (image-to-video) y con primer y ultimo fotograma (first + last frame).
- Generacion de video a partir de imagenes de referencia (reference-to-video) mediante el checkpoint `ref2va`.
- Generacion conjunta de audio y video en una sola pasada, con audio estereo.
- Generacion en pocos pasos: 6 pasos de inferencia con CFG 1.
- Soporte de resolucion 1344x768 y clips de hasta 243 fotogramas (unos 10 s a 24 fps) segun los ejemplos de la model card.
- Integracion con ComfyUI mediante nodo cargador propio y flujos de trabajo preconfigurados.
- Compatibilidad con el nodo Model Sparse Attention de ComfyUI (sol-attn, tau 1.25) para reducir aun mas el tiempo de inferencia.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo generativo audiovisual.

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: el paquete incluye flujos listos para texto a video, primer fotograma, primer mas ultimo fotograma y referencia a video, de modo que un equipo puede encadenar prompts y obtener clips de 5 s con audio en menos de un minuto sobre una RTX 5090.
- Produccion de clips cortos para redes sociales: con 1344x768 y 124 fotogramas (5,2 s a 24 fps) y audio sincronizado, el modelo cubre el formato tipico de anuncios y piezas verticales u horizontales de duracion breve.
- Generacion de video a partir de storyboards o referencias visuales: el checkpoint `ref2va` permite introducir imagenes de referencia y mantener coherencia de personaje o estilo entre planos, util en previsualizacion de anuncios y videoclips.
- Iteracion creativa con control de primer y ultimo fotograma: util para transiciones y animaciones de producto donde se fija el estado inicial y final del plano.
- Evaluacion comparativa de pipelines de cuantizacion: el repositorio documenta tiempos frente a GGUF `Q4_K_M`, `Q8_0` y MiniMax H3 original, lo que lo convierte en una referencia practica para medir el impacto de INT8 en calidad y latencia.
- Despliegue en estaciones de trabajo con una sola GPU de 32 GB: con un pico de 23,6 GiB de VRAM en la ejecucion legacy, encaja en equipos con RTX 5090 sin necesidad de multi-GPU.
- Generacion de audio y video en una sola etapa para doblaje o locucion provisional: al producir audio estereo junto al video, sirve para maquetas con sonido ambiente y efectos antes de la postproduccion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye mediciones de latencia sobre una RTX 5090 de 32 GB con 64 GB de RAM, ComfyUI con atencion CK, texto a video a 1344x768, 124 fotogramas (5,2 s a 24 fps) con audio, CFG 1, media de 5 semillas:

| Configuracion | Pasos | s/it | Tiempo medio por clip |
|---|---:|---:|---:|
| Este repo (`fl2va`), patcher legacy | 6 | 5,4 | 46,1 s |
| Este repo + Model Sparse Attention (sol-attn, tau 1.25) | 6 | 4,2 | ~38 s |
| GGUF oficial `Q4_K_M` + nodos oficiales | 6 | 8,6 | 66,0 s |
| GGUF oficial `Q8_0` + nodos oficiales | 6 | 8,4 | 64,4 s |
| MiniMax H3 original | 20 | 6,3 | 139,1 s |

Pico de VRAM en la ejecucion legacy: 23,6 GiB (24 209 MiB medidos con nvidia-smi, incluyendo el escritorio). El autor senala que la cifra de Video Rebirth para el GGUF `Q4_K_M` en una 5090 es de 99 s, frente a los 66,0 s medidos en su equipo.

## Requisitos de hardware

- VRAM estimada: 23,6 GiB de pico en la configuracion legacy medida (INT8, 6 pasos, 1344x768, 124 fotogramas con audio).
- GPU recomendada segun la documentacion: NVIDIA RTX 5090 de 32 GB. El modelo base se presenta como capaz de generar 768p en tiempo real sobre cuatro B200.
- Cabe en GPU de consumo de gama alta: si en una RTX 5090 con 32 GB; no se documenta su comportamiento en GPU con menos VRAM.
- RAM del sistema: 64 GB en el equipo de referencia.
- Opciones de despliegue: ComfyUI con el nodo `comfyui_hyperflow_int8_nodes` (HyperFlow INT8 Loader) y el pack oficial `ComfyUI-HyperFlow-Flash`; requiere el text encoder y los VAE de `Comfy-Org/MiniMax-H3`. No se distribuye en GGUF; el modelo base si ofrece GGUF `Q4_K_M` y `Q8_0` para llama.cpp-style runners.
- Latencia y throughput: 46,1 s por clip de 5,2 s con el patcher legacy y aproximadamente 38 s con Model Sparse Attention; 5,4 y 4,2 s/it respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Pasos | Tiempo por clip (RTX 5090) | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| HyperFlow H3 Flash INT8 (este repo) | 14B | 124 frames (5,2 s) a 1344x768 | 6 | 46,1 s (38 s con sparse attention) | MiniMax-H3 Community License | safetensors INT8 |
| HyperFlow H3 Flash GGUF `Q4_K_M` oficial | 14B | 124 frames a 1344x768 | 6 | 66,0 s | MiniMax-H3 Community License | GGUF |
| HyperFlow H3 Flash GGUF `Q8_0` oficial | 14B | 124 frames a 1344x768 | 6 | 64,4 s | MiniMax-H3 Community License | GGUF |
| MiniMax H3 original | no disponible | 124 frames a 1344x768 | 20 | 139,1 s | no disponible | no disponible |

## Limitaciones y advertencias

- Conversion no oficial: el repositorio esta marcado como `unofficial` y no lo mantiene Video Rebirth; la calidad y el soporte dependen del autor de la conversion.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- El uso de Model Sparse Attention es una aproximacion: la propia model card advierte que su salida no es identica a la de atencion densa, por lo que puede introducir diferencias de calidad.
- El rendimiento medido corresponde a una unica configuracion (RTX 5090, 64 GB de RAM, ComfyUI con atencion CK); no se documentan tiempos en otras GPU.
- No se dispone de informacion sobre sesgos, tasas de alucinacion visual, idiomas soportados ni evaluaciones de calidad subjetiva.
- Los clips de ejemplo son generaciones unicas con semilla 42; no constituyen una evaluacion sistematica.
- Requiere instalar dos packs de nodos y descargar el text encoder y los VAE por separado desde `Comfy-Org/MiniMax-H3`; el repositorio por si solo no es suficiente para ejecutar el modelo.
- El modelo esta orientado a generacion de video con audio; no es un modelo de lenguaje y no ofrece tool calling ni razonamiento textual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI
- Modelo base: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Pagina del producto HyperFlow H3 Flash: https://www.videorebirth.com/lp/hyperflow-flash
- Nodos INT8 del autor: https://github.com/BennyDaBall930/comfyui_hyperflow_int8_nodes
- Nodos oficiales de HyperFlow Flash: https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash
- Text encoder y VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
