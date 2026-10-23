# SimpleTuner/moss-image-sft-anyflow-stage1-v2-bf16-lr6e-5

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **adaptador LoRA de rango 128** (alpha 128) entrenado sobre el modelo de difusión **MOSS-Image-SFT** de OpenMOSS, un transformer de difusión (DiT) de 5.000 millones de parámetros orientado a generación de imágenes con renderizado de texto y generación de layout. El adaptador lo publica la organización **SimpleTuner**, el toolkit de fine-tuning de modelos de difusión de bghira, como parte de un estudio controlado de hiperparámetros.

El objeto del experimento es la receta **AnyFlow / MeanFlow** de entrenamiento forward: en lugar del muestreo logit-normal truncado habitual, se entrena con un objetivo que combina una ratio de consistencia de 0,25, una ratio de difusión de 0,5, diferencias finitas con epsilon 0,005, fusión de guidance 3, gate 0,25 y ponderación adaptativa MeanFlow `beta08`, con el sampler de intervalos de AnyFlow y shift 1. El objetivo práctico es obtener generación en pocos pasos (la validación se hace con 4 pasos de muestreo y CFG 1), relevante para reducir coste de inferencia en producción.

Esta variante concreta (`bf16-lr6e-5`) es uno de los cuatro brazos de una comparación factorial de learning rate (6e-5 frente a 8e-5) y precisión del adaptador (`no_change`/BF16 frente a `fp32`). Se inicializó desde el adaptador EMA de la etapa 2 de la campaña v1 y se detuvo por petición tras **7.120 de las 100.000 actualizaciones previstas**, por lo que debe considerarse un checkpoint de investigación parcial, no un adaptador final pulido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusion) en el modelo base; adaptador LoRA de rango 128 sobre pesos base congelados |
| Parametros totales | No disponible para el adaptador (el modelo base MOSS-Image-SFT tiene 5.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de difusion; la entrada es un prompt de texto, no una secuencia de contexto |
| Tipos de cuantizacion | No disponible; el adaptador se entrena y publica en BF16 (sin variantes GGUF/FP8 documentadas) |
| Idiomas soportados | No disponible (la model card no documenta el text encoder ni los idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato `diffusers` (adaptador LoRA); contenedor exacto no detallado en la model card; tamano del repo 4,3 GB incluyendo checkpoints y previews |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Inicializacion | Adaptador EMA de `moss-image-sft-anyflow-stage2` (checkpoint-1500/ema), con `init_lora_step=0` |
| Estado del entrenamiento | Detenido por peticion: 7.120 / 100.000 actualizaciones |
| Checkpoints publicados | 1.000 a 7.000 (cada 1.000 actualizaciones) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MOSS-Image-SFT, un DiT de 5B parámetros descrito por OpenMOSS como modelo base con renderizado de texto de alta calidad, generación de layout y fine-tuning eficiente. El entrenamiento congela los pesos base en BF16 y entrena únicamente los parámetros LoRA (r=128, alpha=128); el forward en precisión mixta se mantiene en BF16 y la EMA se acumula en FP32 sobre CPU con decaimiento 0,995 y actualización en cada paso. El optimizador es Torch AdamW con betas (0,9; 0,999), epsilon 1e-6 y weight decay 0,01, con 1.000 pasos de warmup, decaimiento polinómico de potencia 1 hasta 6e-6 y semilla 43 con streams independientes por rango. El cómputo se hizo en **2 GPU H100**, microbatch 2, acumulación 1 y batch global 4, con gradient checkpointing y Kohaku-FA.

El objetivo de entrenamiento es el forward de AnyFlow: se sustituye el muestreo ordinario de timesteps logit-normal truncados por el sampler de intervalos de AnyFlow con shift 1, condicionado por el intervalo `r`, y se combinan pérdida de consistencia (0,25), pérdida de difusión (0,5) y término de diferencias finitas (epsilon 0,005), con fusión de guidance 3, gate 0,25 y ponderación MeanFlow adaptativa `beta08`. Los datos son un mix con muestreo equilibrado entre CC12M con captions largos y e621, y entre resoluciones de 512 px y 1024 px, con hasta 65.536 imágenes por fuente: a 512 px se usan recortes cuadrados aleatorios y a 1024 px buckets de aspecto sin recorte con área mínima de 1.048.576 píxeles. Se reutilizan cachés de latentes y de texto existentes y el entrenamiento a 2048 px está desactivado. La validación se ejecuta en el rango 0 cada 500 actualizaciones, comparando live frente a EMA, con shift 1, 4 pasos de muestreo, CFG 1, semilla 42 y salidas a 512 px y 1024 px.

## Capacidades

- Generación texto-a-imagen mediante el modelo base MOSS-Image-SFT, con el comportamiento del adaptador orientado a la receta AnyFlow de pocos pasos.
- **Muestreo en pocos pasos**: la configuración de validación usa 4 pasos con CFG 1, lo que apunta a inferencia de baja latencia sin classifier-free guidance duplicado.
- Renderizado de texto en imagen y generación de layout, capacidades heredadas del modelo base según OpenMOSS (no evaluadas específicamente para este adaptador).
- Estilos y vocabulario visual derivados del mix de datos: captions largos y descriptivos de CC12M más ilustración de e621.
- Soporte de dos resoluciones de entrenamiento: 512 px con recortes cuadrados y 1024 px con buckets de aspecto variable.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo "thinking": no es un modelo de lenguaje.
- No hay capacidades de audio ni de vídeo documentadas.
- Capacidades multilingües: no documentadas.

## Casos de uso

- **Investigación en destilación few-step**: reproducir o extender el objetivo AnyFlow/MeanFlow con esta configuración como línea base, comparando live frente a EMA con las previews de validación ya publicadas.
- **Barrido de hiperparámetros de fine-tuning**: el adaptador forma parte de un factorial 2x2 (LR 6e-5/8e-5 x precisión BF16/FP32); sirve para medir el efecto de entrenar el adaptador en BF16 frente a FP32 sobre la estabilidad y la calidad de la muestra.
- **Generación de ilustración con estética concreta**: para pipelines que necesiten el sesgo estilístico del mix CC12M + e621, el adaptador se carga sobre MOSS-Image-SFT y se usa con shift 1, 4 pasos y CFG 1 para minimizar el coste por imagen.
- **Prototipado rápido de prompts con latencia baja**: al operar en 4 pasos y CFG 1, permite iterar sobre prompts y layouts en entornos interactivos antes de pasar a un muestreo completo de más pasos.
- **Generación de carteles y creatividades con texto**: apoyándose en el renderizado de texto del modelo base, se pueden generar piezas con titulares, aunque la calidad tipográfica de este adaptador concreto no está medida.
- **Base para un segundo stage de fine-tuning**: al ser un LoRA sobre un DiT, se puede continuar el entrenamiento con SimpleTuner (nuevo dataset, otro régimen de LR) partiendo de estos checkpoints en lugar de desde el modelo base.
- **Validación de infraestructura de entrenamiento**: la receta documenta batch global, memoria y pasos por segundo implícitos en 2x H100 con microbatch 2, útil como referencia para dimensionar campañas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye previews de validación cualitativas (comparación live/EMA a 512 px y 1024 px, shift 1, 4 pasos, CFG 1, semilla 42); no hay FID, CLIP score, HPSv2 ni métricas de fidelidad de texto.

| Dato del run | Valor |
|---|---|
| Actualizaciones completadas | 7.120 |
| Actualizaciones planificadas | 100.000 |
| Progreso | 7,12 por ciento |
| Peak learning rate | 6e-5 |
| LR final (decaimiento polinomico, potencia 1) | 6e-6 |
| Warmup | 1.000 actualizaciones |
| Precision del adaptador | BF16 (`adapter_model_precision=no_change`) |
| Batch global | 4 (2 GPU H100, microbatch 2, acumulacion 1) |
| Pasos de validacion | 4, shift 1, CFG 1 |
| Frecuencia de validacion | cada 500 actualizaciones |

## Requisitos de hardware

- **Entrenamiento (documentado)**: 2 GPU H100 con microbatch 2, acumulación 1, batch global 4, gradient checkpointing y Kohaku-FA. No se indica el consumo de VRAM por GPU.
- **Inferencia (estimación)**: los pesos del DiT de 5B en BF16 ocupan aproximadamente 10 GB; sumando text encoder y VAE, un despliegue típico se sitúa en el rango de 12 a 18 GB de VRAM. Es una estimación aritmética a partir del tamaño del modelo base, no un dato publicado.
- **GPU consumer**: con esa estimación, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían acomodar la inferencia en BF16; en tarjetas de 12-16 GB habría que recurrir a cuantización, no documentada para este adaptador. No confirmado por el autor.
- **Opciones de despliegue**: la librería declarada es `diffusers`; el adaptador se carga junto al modelo base con la API de diffusers y se puede usar el sampler de intervalos de AnyFlow con shift 1. vLLM, llama.cpp, Ollama y TGI no aplican (son herramientas para modelos de lenguaje); no se documenta integración con ComfyUI.
- **Latencia y throughput**: no disponibles. La configuración de 4 pasos y CFG 1 reduce teóricamente el número de evaluaciones del DiT frente a un muestreo de 20-50 pasos con CFG, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`stage1-v2-bf16-lr6e-5`) | LoRA r=128 sobre base de 5B | No aplica | Sin metricas publicadas; entrenamiento al 7,12 por ciento | Apache-2.0 | HuggingFace, 0 descargas |
| `stage1-v2-fp32-lr6e-5-8xh100` (run de reemplazo) | LoRA r=128 sobre base de 5B | No aplica | Sin metricas; reinicio desde cero con 8x H100 y batch global 16 | Apache-2.0 | HuggingFace |
| `moss-image-sft-anyflow-stage2` (adaptador de inicializacion) | LoRA sobre base de 5B | No aplica | Sin metricas | Apache-2.0 | HuggingFace |
| `OpenMOSS-Team/MOSS-Image-SFT` (modelo base) | 5.000 millones | No aplica | Sin metricas publicadas en la informacion disponible | No indicada en la informacion disponible | HuggingFace |

No se dispone de datos objetivos para comparar con adaptadores LoRA de otros ecosistemas de difusión (por ejemplo, familias SD3/FLUX): la información proporcionada no incluye métricas de ninguno de ellos.

## Limitaciones y advertencias

- **Entrenamiento incompleto**: el run se detuvo por petición a las 7.120 actualizaciones de 100.000 (7,12 por ciento). Los checkpoints publicados son estados intermedios, no un adaptador convergido.
- **No es un modelo autónomo**: requiere descargar MOSS-Image-SFT y cargar el adaptador; sin el base no genera nada.
- **Sin métricas objetivas**: no hay FID, CLIP score ni evaluación de fidelidad de texto, solo previews cualitativas. Cualquier afirmación de calidad relativa entre brazos es, por ahora, impresionista.
- **Comparabilidad limitada**: este brazo usa 2 GPU y batch global 4; la campaña previa de 8 GPU usaba batch global 16 y, según el propio autor, no es un control equivalente. Comparaciones cruzadas entre campañas no son válidas.
- **Composición del dataset**: e621 aporta estilos de ilustración y contenido potencialmente NSFW; CC12M aporta captions ruidosos y de dominio web. Ambos sesgos se transfieren al adaptador. No se documenta filtrado de contenido ni evaluación de sesgos.
- **Idioma**: no se especifica el idioma de los captions ni del text encoder; no se puede asumir buen rendimiento en castellano.
- **Alucinación visual**: como todo modelo generativo de imágenes, puede producir texto ilegible, anatomía incorrecta o layouts incoherentes; la ventana de 4 pasos con CFG 1 tiende a reducir fidelidad al prompt frente a muestreos más largos.
- **Licencia**: Apache-2.0 en el adaptador, pero el uso comercial depende también de la licencia y condiciones del modelo base MOSS-Image-SFT, no detalladas en la información disponible.
- **Madurez**: 0 descargas y 0 likes; sin validación comunitaria ni informes independientes. No recomendado como dependencia de producción sin evaluación propia.
- **Reproducibilidad**: requiere el adaptador de inicialización en la ruta relativa `init_lora`; los ficheros `training_config.json`, `dataloader.json`, `prompts.json` y `provenance.json` están en el repo para replicar la receta.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1-v2-bf16-lr6e-5
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Run de reemplazo (FP32, 8x H100): https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1-v2-fp32-lr6e-5-8xh100
- Adaptador de inicializacion (stage 2): https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/tree/45a3541f0c13e33dd0e2aaa5cf7cad70b29f466d/checkpoint-1500/ema
- Campaña stage 1 original: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1
- Organizacion SimpleTuner en HuggingFace: https://huggingface.co/SimpleTuner/models
- Documentacion de SimpleTuner: https://docs.simpletuner.io/
- Repositorio de SimpleTuner: https://github.com/bghira/SimpleTuner
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
