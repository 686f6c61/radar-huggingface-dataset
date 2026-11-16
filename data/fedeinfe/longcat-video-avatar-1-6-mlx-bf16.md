# fedeinfe/LongCat-Video-Avatar-1.6-MLX-bf16

## Resumen

LongCat-Video-Avatar 1.6 es un modelo de generación de vídeo condicionado por audio, desarrollado por el equipo LongCat de Meituan y publicado el 15 de noviembre de 2026. Toma como entrada un retrato (o unos pocos fotogramas de metraje real) junto con una pista de voz, y produce un vídeo de una persona hablando de duración arbitraria. La versión 1.6 mantiene la arquitectura de la 1.5, con un DiT base reentrenado y dos LoRAs de destilación: DMD (destilación de pasos) y OPSD (destilación on-policy).

Esta ficha documenta el port a MLX en bf16 realizado por el usuario fedeinfe, que permite ejecutar el modelo localmente en un Mac con Apple Silicon y 64 GB de memoria unificada. El repositorio ocupa 51,5 GB e incluye el DiT base de 13,6B parámetros en 48 bloques, las dos LoRAs (rango 128), el VAE de Wan 2.1, el codificador de texto umT5-XXL y el codificador de audio Whisper-large-v3.

El modelo es relevante porque traslada la generación de avatares parlantes de calidad a hardware de consumo de Apple, con un pipeline de continuación de vídeo que permite generar tomas continuas de cualquier longitud a 25 fps, y porque su receta de muestreo destilado reduce la inferencia a 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 48 bloques con LoRAs de destilación (DMD y OPSD); VAE de Wan 2.1, text encoder umT5-XXL, audio encoder Whisper-large-v3 |
| Parametros totales | 13,6B (DiT base); LoRAs de rango 128 adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por audio y prompt; segmentos de 93 fotogramas) |
| Tipos de cuantizacion | bf16 (pesos publicados); VAE en bf16 o fp32 según configuración |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la versión 1.5: un Diffusion Transformer (DiT) de 48 bloques y 13,6B parámetros que genera latentes de vídeo condicionados por el prompt de texto (codificado con umT5-XXL) y por la pista de audio (codificada con Whisper-large-v3). El VAE de Wan 2.1 decodifica los latentes a píxeles. La conversión a MLX reorganiza los pesos de las convoluciones a channels-last y mantiene la modulación AdaLN en fp32, con el resto en bf16 como passthrough bit-exacto de los pesos bf16 de Meituan.

La innovación principal de la 1.6 es la destilación en dos etapas mediante dos LoRAs: DMD para los primeros 4 pasos y OPSD para los últimos 4, con un total de 8 pasos de muestreo (`--mix_steps 4 --mix_alpha 1.0`). Al estar destilado, las guías de texto y audio se fijan a 1.0, lo que implica una sola pasada del DiT por paso. El pipeline de vídeo largo encadena segmentos de 93 fotogramas a 25 fps, cada uno condicionado por los últimos 13 fotogramas del segmento anterior más el retrato de referencia (continuación de vídeo de Meituan). No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de vídeo de avatares parlantes a partir de una imagen (o pocos fotogramas) y una pista de audio.
- Sincronización labial (lip-sync) de alta fidelidad: SyncNet LSE-C de 6,8-7,4 frente a 7,05 de metraje real de la misma persona.
- Generación de vídeo de longitud arbitraria mediante continuación de segmentos con caché KV de condicionamiento.
- Salida a 25 fps por diseño; requiere interpolación posterior (por ejemplo, RIFE) para 30 fps.
- Control de la apertura de boca mediante guía solo de audio (`--audio-scale`, `--audio-steps`).
- Adaptación del estilo de movimiento y boca a una persona concreta mediante entrenamiento de LoRA (rango 32) sobre unas decenas de clips cortos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual.

## Casos de uso

- Generación de avatares corporativos: a partir de un retrato del portavoz y una locución grabada, se produce un vídeo de presentación continuo de cualquier duración, útil para formación interna o comunicados sin repetir rodaje.
- Doblaje y localización de vídeo: sustituir la pista de audio de un vídeo existente por una traducción y regenerar el habla sincronizada, manteniendo el aspecto del hablante original.
- Creación de contenido para redes sociales: generar clips de personas hablando desde una sola foto, con la ventana de continuación que permite tomas largas en una única secuencia.
- Prototipado de personajes virtuales: entrenar una LoRA con clips cortos de un actor o presentador para fijar su estilo de movimiento y boca, y reutilizarlo en producciones posteriores.
- Previsualización en estudios de animación y VFX: generar animáticas de diálogos con sincronización labial antes de la producción final, sobre hardware Apple Silicon sin GPU dedicada.
- Investigación en generación de vídeo condicionada por audio: el port MLX y el pipeline de continuación sirven como base reproducible para experimentos de destilación y sincronización en entornos Apple.
- Asistentes virtuales con cara: integrar el modelo en un pipeline local que convierta respuestas de texto a voz en un vídeo de un avatar hablando, con la ventaja de ejecutarse íntegramente en local.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| SyncNet LSE-C (1.6) | 6,8-7,4 |
| SyncNet LSE-C (1.5) | 6,5 |
| SyncNet LSE-C (metraje real de referencia) | 7,05 |
| s/paso a 480p (704x544), M5 Max 64 GB | ~55 (ruta compilada: ~45) |
| s/paso a 1120x832, M5 Max 64 GB | ~320 |
| Segmento de 93 fotogramas (3,7 s), 8 pasos + decodificación, 480p | ~8 min |
| Segmento de 93 fotogramas, 8 pasos + decodificación, 1120x832 | ~45 min |
| Memoria pico, 480p (VAE bf16) | ~47 GB |
| Memoria pico, 1120x832 (VAE fp32, `--vae-tile 64`) | ~56 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo generativo de vídeo.

## Requisitos de hardware

- Memoria unificada: 64 GB en Apple Silicon; pico medido de ~47 GB a 480p y ~56 GB a 1120x832.
- Hardware de referencia: Apple M5 Max con 64 GB; no se documentan otros chips.
- No cabe en GPUs de consumo con menos de 64 GB de VRAM; el port está diseñado para memoria unificada de Apple Silicon.
- Despliegue: librería MLX con el repositorio `xocialize/longcat-avatar-mlx` (rama `feat/avatar-1.6-continuation-lora` hasta el merge del PR #8); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este port.
- Latencia: ~8 min por segmento de 3,7 s a 480p y ~45 min a 1120x832; los segmentos de continuación son ~20 % más baratos gracias a la caché KV de condicionamiento.
- Entrenamiento de LoRA: ~49,6 GB de pico y ~65 s/paso a 49 fotogramas y 640x512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LongCat-Video-Avatar 1.6 (MLX, bf16) | 13,6B (DiT) | Segmentos de 93 fotogramas, continuación indefinida | MIT | Hugging Face (este repo) |
| LongCat-Video-Avatar 1.5 (MLX, bf16) | no disponible | Segmentos de 93 fotogramas | MIT | mlx-community |
| LongCat-Video-Avatar 1.6 (original, Meituan) | 13,6B (DiT) | Segmentos de 93 fotogramas, continuación indefinida | MIT | meituan-longcat |

No se dispone de datos de benchmarks comparativos con otros modelos de avatares parlantes en la información proporcionada.

## Limitaciones y advertencias

- La apertura de boca la decide el modelo y apenas responde al prompt; solo se atenúa con guía de audio por debajo de 1, con un coste de 1,4x.
- Las expresiones faciales (por ejemplo, una sonrisa amplia) dependen de la semilla; es necesario regenerar el segmento para obtener variaciones.
- La generación está fijada a 25 fps: alimentar audio a 30 fps desincroniza los labios (la confianza de SyncNet cae de ~7 a ~2); hay que interpolar después.
- El modelo está destilado y requiere guías de texto y audio a 1.0; prompts largos y descriptivos funcionan mejor.
- Riesgo de artefactos en sincronización y expresiones en condiciones de audio ruidoso o retratos poco habituales; no se documentan sesgos demográficos específicos.
- La licencia MIT permite uso comercial, pero se heredan las condiciones del modelo base de Meituan; conviene verificar la licencia del modelo original y de los componentes (Wan 2.1 VAE, umT5-XXL, Whisper-large-v3) antes de producción.
- El pipeline de vídeo largo depende de una rama no fusionada del repositorio de inferencia; la API puede cambiar.
- No se documentan idiomas soportados ni capacidades de texto más allá de la generación de vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fedeinfe/LongCat-Video-Avatar-1.6-MLX-bf16
- Modelo base original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Repositorio de inferencia MLX: https://github.com/xocialize/longcat-avatar-mlx
- Pull request con soporte 1.6, vídeo largo y entrenamiento de LoRA: https://github.com/xocialize/longcat-avatar-mlx/pull/8
- Rama de desarrollo del port: https://github.com/fedeinfe/longcat-avatar-mlx
- Repositorio del equipo LongCat de Meituan: https://github.com/meituan-longcat/LongCat-Video
- Port MLX de la versión 1.5: https://huggingface.co/mlx-community/LongCat-Video-Avatar-1.5-bf16
