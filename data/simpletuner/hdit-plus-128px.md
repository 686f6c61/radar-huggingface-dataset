# SimpleTuner/hdit-plus-128px

## Resumen

SimpleTuner/hdit-plus-128px es un modelo de difusion texto-a-imagen entrenado desde cero por el equipo de SimpleTuner, la herramienta de ajuste fino que da nombre al proyecto. Se trata de un modelo de investigacion orientado a la generacion de imagenes de baja resolucion (128x128 pixeles), disenado como banco de pruebas para el pipeline de entrenamiento de SimpleTuner y para experimentar con la arquitectura HDit Plus.

El modelo emplea la libreria diffusers como interfaz de inferencia y pesos en formato safetensors, con un total de 419.234.176 parametros (aproximadamente 419 millones). Su prediccion se basa en flow matching y fue entrenado sobre el dataset recap-datacomp-128 durante 229.429 pasos con un lote efectivo de 256 muestras repartidas en 8 GPUs.

Su relevancia es fundamentalmente experimental: no compite con modelos de generacion de imagenes de proposito general, sino que sirve para validar tecnicas de entrenamiento (optimizador muP-AdamW, gradient checkpointing, flow matching) en un regimen de resolucion muy baja. La licencia "other" y la etiqueta "not-for-all-audiences" obligan a revisar los terminos antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (HDit Plus) con prediccion por flow matching; pipeline diffusers text-to-image |
| Parametros totales | 419.234.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto textual medido en tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa float32/bf16 en carga) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (integracion diffusers) |

## Arquitectura y entrenamiento

El modelo es un modelo de difusion entrenado desde cero con prediccion de tipo flow matching y scheduler FlowMatchEulerDiscreteScheduler en inferencia. La arquitectura se identifica como HDit Plus, una variante de transformer de difusion orientada a imagenes de 128x128. El text encoder no fue entrenado, por lo que se reutiliza el codificador de texto original del stack de referencia.

El entrenamiento se realizo sobre el dataset recap-datacomp-128 (version a 128 px de Recap-DataComp), con 229.429 pasos, learning rate 0.0002 con schedule constant_with_warmup y 100 pasos de calentamiento, gradiente maximo recortado a 2.0 y lote efectivo de 256 (micro-lote 32, 8 GPUs, gradient checkpointing activado). Se uso el optimizador muP-AdamW, una innovacion que aplica parametrizacion muP al ajuste de AdamW para estabilizar el entrenamiento a distintas escalas, y la probabilidad de caption dropout fue del 0 %. No se menciona RLHF ni DPO; el entrenamiento es puramente de difusion supervisada.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion fija de 128x128 pixeles.
- Edicion imagen-a-imagen (etiqueta image-to-image del repositorio).
- Soporte de prompt negativo (negative_prompt) en la inferencia.
- Control de la generacion mediante CFG (guidance_scale 3.0 en validacion), pasos de inferencia (30 en validacion) y semilla manual.
- Integracion directa con la libreria diffusers (DiffusionPipeline).
- Validacion reproducible con el prompt "A red cube to the left of a blue sphere on a pale wooden table."
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Investigacion en entrenamiento de difusion: el modelo sirve como referencia reproducible para estudiar el efecto de muP-AdamW, flow matching y gradient checkpointing en un regimen controlado de 128x128, comparando curvas de perdida y muestras de validacion.
- Pruebas de pipeline de SimpleTuner: validar configuraciones de entrenamiento (lote efectivo, learning rate, warmup) antes de escalar a resoluciones mayores, reduciendo coste computacional.
- Benchmarking de infraestructura: medir throughput y latencia de inferencia de un modelo de ~419 M de parametros en GPUs de consumo, util para calibrar despliegues de diffusers.
- Generacion de prototipos y placeholders: producir imagenes de baja resolucion para maquetas, tests de interfaz o datos sinteticos de relleno donde la calidad final no es critica.
- Educacion y divulgacion: demostrar el funcionamiento interno de un modelo de difusion texto-a-imagen con pesos abiertos y codigo de inferencia minimo.
- Experimentos de composicion espacial: el prompt de validacion (cubo rojo a la izquierda de una esfera azul) permite estudiar el control de relaciones espaciales en modelos pequenos.
- Ajuste fino posterior: al ser un modelo "full" entrenado desde cero, puede servir de base para fine-tuning en dominios concretos a baja resolucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 419 M de parametros, en float32 los pesos ocupan aproximadamente 1,7 GB; en bf16, unos 0,84 GB. Sumando el text encoder y los buffers del pipeline, se estima un consumo total en torno a 2-4 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha validado conceptualmente en CUDA y en Apple MPS (el codigo de inferencia contempla ambos). Para entrenamiento se usaron 8 GPUs (modelo no especificado).
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamano del modelo.
- Opciones de despliegue: diffusers (DiffusionPipeline) de forma nativa; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: no disponibles en la informacion proporcionada. El repo ocupa 70,5 GB, lo que sugiere la presencia de checkpoints o artefactos adicionales mas alla de los pesos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTuner/hdit-plus-128px | 419 M | 128x128 | no aplica | other | Hugging Face (diffusers) |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512x512 | no aplica | CreativeML OpenRAIL-M | Hugging Face, amplia adopcion |
| SDXL-Turbo | ~2,6 B (UNet) | 512x512+ | no aplica | openrail++ | Hugging Face |
| PixArt-alpha | ~610 M | 512x512+ | no aplica | openrail | Hugging Face |

La comparativa es orientativa: hdit-plus-128px opera a una resolucion muy inferior (128 px) y esta pensado para investigacion, mientras que las alternativas citadas son modelos de proposito general a 512 px o mas. No se dispone de datos de rendimiento comparativo del modelo de SimpleTuner.

## Limitaciones y advertencias

- Resolucion muy limitada: genera exclusivamente imagenes de 128x128 pixeles, insuficiente para la mayoria de aplicaciones de produccion.
- Modelo experimental: entrenado desde cero como banco de pruebas, sin evidencia publicada de calidad frente a modelos establecidos.
- Etiqueta "not-for-all-audiences": el dataset de entrenamiento (Recap-DataComp) puede contener contenido sensible; se recomienda filtrar salidas en produccion.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- Riesgo de alucinacion visual y composicion incorrecta: al ser un modelo pequeno y de baja resolucion, es probable que falle en relaciones espaciales complejas, texto en imagen y detalles finos.
- Idiomas: no se documenta que idiomas soporta el text encoder asociado; no hay garantia multilingue.
- El text encoder no fue entrenado, por lo que la calidad depende del codificador original reutilizado.
- Sin datos de benchmarks ni evaluaciones cuantitativas publicadas; no debe asumirse rendimiento comparable a modelos comerciales.
- El tamano del repositorio (70,5 GB) es desproporcionado respecto a los 419 M de parametros, lo que puede complicar la descarga y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SimpleTuner/hdit-plus-128px
- Repositorio SimpleTuner: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
