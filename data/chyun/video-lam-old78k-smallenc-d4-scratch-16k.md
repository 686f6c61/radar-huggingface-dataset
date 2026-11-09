# chyun/video-lam-old78k-smallenc-d4-scratch-16k

## Resumen

Video LAM (Latent Action Model) small encoder es un modelo de investigación desarrollado por el usuario chyun para robótica, construido sobre el modelo base nvidia/Cosmos-Predict2.5-2B. Se trata de un checkpoint experimental de un modelo de acciones latentes para vídeo: la etapa A entrena un codificador de profundidad 4 con inicialización desde cero, y la etapa B utiliza un decodificador Cosmos preentrenado de profundidad 28 con pesos congelados y LoRA de rango 16 entrenable. El objetivo es aprender representaciones latentes de acción a partir de vídeo, una línea de trabajo relevante para el aprendizaje por imitación y el control robótico sin etiquetas explícitas de acción.

El modelo se ha entrenado durante 16.000 pasos con batch global 16 sobre 8 GPUs (microbatch 1, acumulación 2), usando vídeo y acción con flow matching ponderados a 1.0 cada uno. El dataset combina DROID, EgoDex y MolmoAct con pesos iguales, a resolución 480 x 640 y clips variables de 5 a 29 fotogramas. No requiere caché de texto proyectado.

El repositorio pesa 2,6 GB e incluye el checkpoint final con estados de optimizador, scheduler y RNG, además de estadísticas de normalización de acciones y metadatos. Es un artefacto de investigación reproducible más que un modelo listo para producción: la licencia no está declarada y la carga requiere el código del repositorio jiiiisoo/video_lam y el checkpoint base de Cosmos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) con codificador de accion latente; encoder depth-4 y decoder Cosmos depth-28 con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de video de 5 a 29 fotogramas a 480 x 640; contexto de texto no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch nativo en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`.pt`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. La etapa A entrena completamente un codificador de profundidad 4 con inicialización desde cero (`train_encoder_full=true`, `encoder_depth=4`). La etapa B acopla un decodificador Cosmos preentrenado de profundidad 28 con pesos base congelados (`recon_decoder_backbone="full_frozen"`) y adaptadores LoRA de rango 16 entrenables. Tanto la predicción de vídeo como la de acción usan flow matching con peso 1.0 cada una, lo que sitúa al modelo en la familia de modelos generativos de difusión aplicados a la representación de acciones.

El entrenamiento se realizó con batch global 16 en 8 GPUs, microbatch 1 y acumulación 2, semilla 0, durante 16.000 pasos. Los datos combinan DROID, EgoDex y MolmoAct con pesos de fuente iguales, a resolución 480 x 640 y clips de duración variable entre 5 y 29 fotogramas. El checkpoint incluye el estado del optimizador, el scheduler, los estados RNG y la posición de iteración de datos, lo que permite reanudar el entrenamiento de forma exacta. La innovación principal es el uso de un codificador pequeño entrenado desde cero sobre un decodificador generativo grande congelado, una configuración eficiente para aprender acciones latentes a partir de vídeo sin supervisión explícita de acción.

## Capacidades

- Aprendizaje de representaciones latentes de acción a partir de vídeo mediante flow matching.
- Generación y reconstrucción de vídeo condicionada por acción latente a través del decodificador Cosmos.
- Predicción de acciones en el espacio latente para tareas de robótica e imitación.
- Entrenamiento multi-fuente con DROID, EgoDex y MolmoAct, con normalización de acciones por fuente.
- Reanudación exacta del entrenamiento gracias a los estados de optimizador, scheduler y RNG incluidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo aprende acciones latentes a partir de vídeo de demostraciones, útil para entrenar políticas robóticas sin etiquetas de acción explícitas.
- Reproducción de experimentos: el checkpoint incluye optimizer, scheduler y RNG, lo que permite reanudar exactamente el entrenamiento en 8 GPUs y validar resultados de forma reproducible.
- Preentrenamiento de codificadores de acción: el encoder depth-4 entrenado desde cero sirve como inicialización para variantes más grandes o para transferencia a nuevos dominios robóticos.
- Investigación en flow matching multimodal: la ponderación 1.0 de vídeo y acción permite estudiar el equilibrio entre ambas modalidades en modelos generativos.
- Experimentos con LoRA sobre decodificadores generativos: la configuración con decoder congelado y LoRA rango 16 es un banco de pruebas para adaptación eficiente de modelos de difusión.
- Análisis de datasets robóticos heterogéneos: la normalización por fuente (DROID, EgoDex, MolmoAct) facilita estudiar el efecto de mezclar fuentes con pesos iguales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 2,6 GB y el checkpoint se distribuye en bf16, pero requiere además el checkpoint base de Cosmos-Predict2.5-2B como dependencia externa.
- GPU recomendadas: el entrenamiento se realizó en 8 GPUs con microbatch 1 por GPU; no se especifica el modelo de GPU empleado.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la carga requiere el código de `cosmos-predict2.5/scripts/train_latent_action_v4.py` del repositorio jiiiisoo/video_lam en el commit `2157e2f0837fcdefb82fc68f9c4d913e3f92942d`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chyun/video-lam-old78k-smallenc-d4-scratch-16k | no disponible (encoder depth-4 + decoder depth-28) | clips de 5-29 fotogramas a 480x640 | Acciones latentes con flow matching sobre Cosmos | no disponible | Hugging Face, 0 descargas |
| nvidia/Cosmos-Predict2.5-2B | 2B (modelo base) | no disponible | Difusion generativa de video | no disponible | Hugging Face (modelo base) |
| Alternativas de modelos de accion latente para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; contactar con el autor antes de cualquier uso en producción.
- Modelo de investigación con 0 descargas y 0 likes: sin validación externa ni resultados de benchmarks publicados.
- Requiere dependencias externas: checkpoint base nvidia/Cosmos-Predict2.5-2B en una revisión concreta, VAE y encoder de texto congelados, además del código del repositorio jiiiisoo/video_lam.
- Los argumentos guardados contienen rutas de máquina originales y valores por defecto no usados; es necesario reemplazar rutas y configurar `COSMOS_PRETRAIN_CKPT` antes de cargar.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al entrenarse con DROID, EgoDex y MolmoAct, puede heredar sesgos de esos datasets.
- Idiomas soportados no disponibles; el modelo no está orientado a texto general.
- No es un modelo listo para producción: no hay formatos GGUF ni safetensors, ni soporte documentado en frameworks de inferencia estándar.
- El checkpoint incluye estado de optimizador y RNG, lo que aumenta el tamaño del repositorio (2,6 GB) respecto al peso del modelo puro.

## Enlaces

- Hugging Face: https://huggingface.co/chyun/video-lam-old78k-smallenc-d4-scratch-16k
- Repositorio de código: https://github.com/jiiiisoo/video_lam (commit `2157e2f0837fcdefb82fc68f9c4d913e3f92942d`)
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B (revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`)
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_prepared_v1
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_dataset
