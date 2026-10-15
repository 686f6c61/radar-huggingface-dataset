# APRIL-AIGC/T3-Video

## Resumen

T3-Video es una familia de modelos de generacion de video por difusion desarrollada por APRIL-AIGC, presentada en el articulo "Transform Trained Transformer for Accelerating Native 4K Video Generation" (ICML 2026). El modelo parte de la arquitectura de difusion transformer (DiT) de la serie Wan y la modifica para generar video nativo en resolucion 4K (2176x3840) de forma mas eficiente, cubriendo tareas de texto-a-video (T2V) e imagen-a-video (I2V).

El repositorio publica dos variantes de pesos derivadas de modelos base de Wan: `T3-Video-Wan2.1-T2V-1.3B` (sobre Wan2.1-T2V-1.3B, 1,3 mil millones de parametros) y `T3-Video-Wan2.2-T2V-5B` (sobre Wan2.2-TI2V-5B, 5 mil millones de parametros). El proyecto incluye ademas el banco de pruebas 4K-VBench y la demo abierta 4K-World-Vision, orientados a evaluar y mostrar generacion de video en 4K nativo.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de la generacion de video: producir 4K nativo con costes de computo contenidos. La inferencia se apoya en procesado por teselas y ejecucion multigrafica (con grupos como `--num_groups 8`), lo que permite generar 81 fotogramas a 2176x3840 con 50 pasos de inferencia. Los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0, con la condicion adicional de respetar la licencia de los modelos Wan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) basado en Wan2.1 / Wan2.2 |
| Parametros totales | 1,3 mil millones (variante Wan2.1-T2V-1.3B) y 5 mil millones (variante Wan2.2-T2V-5B) |
| Longitud de contexto | no disponible (modelo de generacion de video; configurado a 81 fotogramas a 2176x3840 en los ejemplos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta adicionalmente a la licencia de Wan-Video/Wan2.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

T3-Video se construye sobre el transformer de difusion (DiT) de la serie Wan y emplea un componente descrito como "transform trained transformer", cuyo objetivo es acelerar la generacion de video nativo en 4K. Mantiene los componentes habituales del pipeline Wan: codificador de texto umt5-xxl, VAE especifico de Wan (Wan2.1_VAE o Wan2.2_VAE) y el DiT como generador. El modelo se ajusta de forma especifica (finetune) sobre los pesos base de Wan, y define modos de resolucion internos como `wan2.2_2176_3840` para adaptar el DiT a la salida 4K.

El entrenamiento utiliza el dataset `APRIL-AIGC/UltraVideo`, publicado por el mismo autor. En la informacion disponible no se detallan el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. El modo de inferencia documentado usa decodificacion por teselas (`--tiled true`), 50 pasos de inferencia y reparto del trabajo en varios grupos multigrafica (`--num_groups 8`), lo que constituye la innovacion practica principal para viabilizar la generacion 4K. El codigo de entrenamiento figura como pendiente de publicacion en el repositorio.

## Capacidades

- Generacion de texto a video (T2V) en resolucion nativa 4K (2176x3840).
- Generacion de imagen a video (I2V), segun las etiquetas del modelo.
- Generacion de secuencias de 81 fotogramas con 50 pasos de difusion en la configuracion documentada.
- Decodificacion por teselas para reducir el pico de memoria en resoluciones altas.
- Ejecucion multigrafica mediante scripts de inferencia (`infer_multi_gpu.py`).
- Dos variantes de capacidad: una ligera de 1,3 mil millones de parametros y otra de 5 mil millones.
- Soporte de carga condicionada por prompts leidos desde ficheros JSON con conjunto de datos asociado (demo 4K-World-Vision).
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode (no disponible).

## Casos de uso

- Produccion de video publicitario en 4K: el modelo genera clips de 81 fotogramas a 2176x3840, adecuados para insercion directa en flujos de posproduccion sin reescalado previo.
- Creacion de contenido para plataformas de gran formato: la salida 4K nativa evita el upscaling posterior, util en pantallas grandes y paneles digitales.
- Generacion de video a partir de imagenes (I2V): animacion de fotografias o ilustraciones para narrativa visual, aprovechando la etiqueta i2v del modelo.
- Previsualizacion de storyboards: la variante de 1,3 mil millones permite iterar de forma mas economica antes de lanzar la variante de 5 mil millones para tomas finales.
- Investigacion en generacion de video: la publicacion de 4K-VBench y de la demo 4K-World-Vision permite reproducir y comparar metodos de generacion 4K de forma estandarizada.
- Efectos visuales y contenido de sintesis: generacion de planos de escenarios o fondos en alta resolucion para composicion.
- Demostraciones y benchmarking interno: al liberar pesos y codigo de inferencia, los equipos pueden medir coste y calidad de generacion 4K en su propio hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. Los autores indican la publicacion de un banco de pruebas propio, 4K-VBench, orientado a la evaluacion de generacion de video nativo en 4K, pero no se incluyen cifras concretas (MMLU, FVD, CLIPScore u otras) en el material facilitado.

| Benchmark | Resultado | Notas |
|---|---|---|
| 4K-VBench | no disponible | Banco de pruebas anunciado, sin cifras en la informacion facilitada |
| Otros benchmarks | no disponible | No se aportan datos |

## Requisitos de hardware

- La generacion en 4K nativo (2176x3840, 81 fotogramas) es intensiva en memoria; el ejemplo oficial usa decodificacion por teselas y reparto en 8 grupos (`--num_groups 8`), lo que apunta a despliegues multigrafica.
- VRAM estimada: no disponible. Depende del modo de resolucion, del uso de teselas y del numero de grupos; no se documentan cifras concretas de memoria.
- GPU recomendadas: no disponible de forma explicita. Por la naturaleza del pipeline (DiT de 1,3 B o 5 B + VAE + codificador umt5-xxl a resolucion 4K) se orienta a GPUs de centro de datos tipo A100 o H100; no se confirma en la documentacion.
- Encaje en GPU de consumo: no confirmado. La variante de 1,3 mil millones podria ser viable con teselado y cuantizacion, pero no se aportan datos que lo garanticen.
- Opciones de despliegue: DiffSynth-Studio (ejemplos `wanvideo`), libreria `diffusers` y scripts de inferencia propios (`infer_multi_gpu.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. La configuracion de referencia usa 50 pasos de inferencia y ejecucion multigrafica, pero no se publican tiempos de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| T3-Video (Wan2.1-T2V-1.3B) | 1,3 mil millones | 4K nativo | Apache 2.0 + licencia Wan | Pesos y codigo de inferencia en HF |
| T3-Video (Wan2.2-T2V-5B) | 5 mil millones | 4K nativo | Apache 2.0 + licencia Wan | Pesos en HF |
| Wan2.1-T2V-1.3B (base) | 1,3 mil millones | no especificado en la informacion | Licencia Wan | Modelo base publico |
| Wan2.2-TI2V-5B (base) | 5 mil millones | no especificado en la informacion | Licencia Wan | Modelo base publico |

No se dispone de datos de rendimiento para comparar de forma cuantitativa con modelos alternativos de la misma categoria distintos de los modelos base citados. Otras alternativas comparables: no disponible en la informacion facilitada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al entrenarse sobre un dataset propio (UltraVideo) cuyas caracteristicas no se detallan, el sesgo potencial es no evaluable.
- El modelo base es un modelo de difusion para video; su principal riesgo es la generacion de contenido visual inexacto o no fiel al prompt (alucinacion visual), sin metricas publicadas que lo cuantifiquen.
- Idiomas soportados: no disponibles. El codificador de texto es umt5-xxl, pero no se especifica el soporte multilingue efectivo de los prompts.
- Restricciones de licencia: aunque los pesos se publican bajo Apache 2.0, el uso esta condicionado adicionalmente a la licencia `Wan-Video/Wan2.1/LICENSE.txt`; es imprescindible revisarla antes de uso comercial.
- El codigo de entrenamiento no esta publicado (figura como tarea pendiente), lo que limita la reproducibilidad completa del entrenamiento.
- No se aportan datos de cuantizacion, VRAM ni latencia, lo que dificulta la planificacion de despliegues en produccion.
- La generacion 4K requiere configuracion multigrafica y teselado, con un coste de computo elevado que puede no ser viable en infraestructura de un solo equipo de consumo.
- La fecha de actualizacion del repositorio (2026-10-05) es posterior a la de creacion (2025-12-16), por lo que conviene verificar la version de los pesos y del codigo antes de reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/APRIL-AIGC/T3-Video
- Pagina del proyecto: https://zhangzjn.github.io/projects/T3-Video
- Paper (arXiv): https://arxiv.org/abs/2512.13492
- Paper (OpenReview, ICML 2026): https://openreview.net/forum?id=5dabjiOBpS
- Dataset UltraVideo: https://huggingface.co/datasets/APRIL-AIGC/UltraVideo
- Codigo de inferencia (DiffSynth-Studio, ejemplos wanvideo): https://github.com/modelscope/DiffSynth-Studio/tree/main/examples/wanvideo
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia de Wan2.1: https://github.com/Wan-Video/Wan2.1/blob/main/LICENSE.txt
- Repositorio Wan2.1: https://github.com/Wan-Video/Wan2.1
- Repositorio Wan2.2: https://github.com/Wan-Video/Wan2.2
- Demo en video (4K-World-Vision): https://www.youtube.com/watch?v=mCTu6f2vAyU
