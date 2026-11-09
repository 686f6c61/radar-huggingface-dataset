# chyun/video-lam-old78k-smallenc-d4-pretrained-16k

## Resumen

Video LAM small encoder es un modelo de investigación para robótica desarrollado por el usuario chyun (repo `chyun/video-lam-old78k-smallenc-d4-pretrained-16k`), construido como un fine-tuning sobre `nvidia/Cosmos-Predict2.5-2B`. Se trata de un modelo de acción latente (Latent Action Model, LAM) que combina un encoder de profundidad 4 totalmente entrenable con un decoder Cosmos de profundidad 28 congelado y LoRA de rango 16, orientado a la predicción y modelado de acciones a partir de vídeo en entornos robóticos.

El modelo se ha entrenado en dos etapas (Stage A y Stage B) con flow matching tanto para vídeo como para acción, sobre una mezcla de tres fuentes de datos (DROID, EgoDex y MolmoAct) con pesos iguales, a resolución 480 × 640 y clips variables de 5 a 29 fotogramas. El checkpoint publicado corresponde al paso 16.000 de entrenamiento con batch global 16 en 8 GPUs.

Es relevante porque explora una arquitectura híbrida (encoder ligero entrenable + decoder grande congelado con adaptadores LoRA) para reducir el coste de entrenamiento en modelos de acción para robótica, reutilizando los pesos preentrenados de Cosmos-Predict2.5. El repositorio es de tipo PyTorch nativo y no incluye pesos en formato safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de profundidad 4 totalmente entrenable + decoder Cosmos-Predict2.5 de profundidad 28 congelado con LoRA de rango 16; flow matching para vídeo y acción |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de vídeo de 5 a 29 fotogramas) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`.pt`), checkpoint `step_016000.pt` |
| Resolucion de entrenamiento | 480 × 640 |
| Tamano del repositorio | 2.6 GB |
| Modelo base | nvidia/Cosmos-Predict2.5-2B (revision `15a82a2ec231bc318692aa0456a36537c806e7d4`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. En la Stage A se entrena de forma completa un encoder de profundidad 4 con inicialización preentrenada. En la Stage B se emplea un decoder Cosmos de profundidad 28 con los pesos base congelados y adaptadores LoRA de rango 16 entrenables. Tanto la rama de vídeo como la de acción usan flow matching, con un peso de 1.0 para cada una. No se requiere caché de texto proyectado.

El entrenamiento se realizó con DROID, EgoDex y MolmoAct con pesos de fuente iguales, a resolución 480 × 640 y clips variables de 5 a 29 fotogramas. La configuración reportada es batch global 16, 8 GPUs, microbatch 1 por GPU, acumulación 2 y semilla 0. El checkpoint publicado corresponde al paso 16.000 y contiene encoder, LoRA del decoder, queries, cabezas, optimizador, scheduler, estados RNG y la posición de iteración de datos. Se incluyen además `training_args.json`, estadísticas de normalización de acciones por fuente (`action_stats_old78k_3src.json`), metadatos de arquitectura y checksums SHA-256.

## Capacidades

- Modelado de acción latente a partir de vídeo en entornos robóticos.
- Predicción de acciones condicionada por observaciones visuales (clips de 5 a 29 fotogramas).
- Flow matching conjunto para vídeo y acción.
- Entrenamiento con múltiples fuentes de datos (DROID, EgoDex, MolmoAct) y normalización de acciones por fuente.
- Checkpoint reanudable: incluye optimizador, scheduler, RNG y posición de iteración.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos de acción latente para robótica: usar el checkpoint como punto de partida para experimentos de representación de acciones a partir de vídeo, aprovechando la separación encoder/decoder y la normalización por fuente incluida.
- Fine-tuning sobre nuevos datasets robóticos: reutilizar el encoder de profundidad 4 entrenable y el decoder Cosmos congelado con LoRA para adaptar el modelo a un nuevo dominio con coste reducido.
- Reanudación de entrenamientos: al incluir optimizador, scheduler y estados RNG, el checkpoint permite continuar el entrenamiento desde el paso 16.000 sin reiniciar.
- Evaluación comparativa de arquitecturas encoder-decoder en robótica: el diseño híbrido (encoder ligero + decoder grande congelado) sirve como referencia para estudiar el equilibrio entre coste y capacidad.
- Reproducción de experimentos: los metadatos, checksums y argumentos de entrenamiento permiten reproducir la configuración exacta en otra máquina.
- Generación de datos sintéticos de vídeo/acción para aumento de datasets: el flow matching conjunto sobre vídeo y acción puede emplearse para generar trayectorias condicionadas en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento original: 8 GPUs con microbatch 1 por GPU, acumulación 2 y batch global 16.
- VRAM estimada para inferencia: no disponible.
- GPUs recomendadas: no disponible (el entrenamiento se realizó en 8 GPUs, modelo no especificado).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el modelo se carga con código PyTorch nativo del repositorio `jiiiisoo/video_lam` (script `cosmos-predict2.5/scripts/train_latent_action_v4.py`, commit base `2157e2f0837fcdefb82fc68f9c4d913e3f92942d`).
- Dependencias externas obligatorias: pesos base de `nvidia/Cosmos-Predict2.5-2B` (archivo `base/pre-trained/d20b7120-df3e-4911-919d-db6e08bad31c_ema_bf16.pt`), VAE y encoder de texto congelados; variable de entorno `COSMOS_PRETRAIN_CKPT` para apuntar al checkpoint local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chyun/video-lam-old78k-smallenc-d4-pretrained-16k | no disponible | clips de 5-29 fotogramas | no disponible | Hugging Face (0 descargas) | Fine-tuning de Cosmos-Predict2.5-2B para acción latente en robótica |
| nvidia/Cosmos-Predict2.5-2B | 2B (según nombre) | no disponible | no disponible | Hugging Face (modelo base) | Modelo base de world model; el LAM lo reutiliza como decoder congelado |
| Alternativas de LAM para robótica | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; consultar con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: el modelo no está orientado a tareas de lenguaje natural.
- Checkpoint de investigación con 0 descargas y 0 likes: sin validación externa ni comunidad que reporte resultados.
- Los argumentos guardados en `training_args.json` contienen rutas de máquina originales y valores por defecto no usados; es necesario reemplazar rutas y apuntar el resume al checkpoint descargado.
- Dependencia de pesos externos (Cosmos-Predict2.5-2B, VAE y encoder de texto) que deben descargarse por separado y fijarse a la revisión indicada.
- El código de carga depende de un commit concreto (`2157e2f...`) más correcciones locales de resume y logging no publicadas en el repositorio original.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al tratarse de un modelo de acción/vídeo, el riesgo se traslada a predicciones físicas incorrectas en robótica.
- No apto para uso general: es un artefacto de investigación en robótica, no un modelo conversacional ni multimodal de propósito general.
- Sin datos de benchmarks: imposible comparar rendimiento objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chyun/video-lam-old78k-smallenc-d4-pretrained-16k
- Repositorio de código: https://github.com/jiiiisoo/video_lam
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_prepared_v1
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_dataset
