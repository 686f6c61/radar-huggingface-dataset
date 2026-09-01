# arraypress/stable-audio-3-medium-coreai

## Resumen

Stable Audio 3 Medium es un modelo de difusión latente para generación de audio y música desarrollado por Stability AI. Esta ficha describe una conversión comunitaria del modelo original al formato Apple Core AI (`.aimodel`), realizada por el usuario arraypress, que permite ejecutar el modelo de forma nativa en dispositivos Apple con iOS 27 o macOS 27. La conversión no modifica los pesos: es un cambio de formato, no un reentrenamiento ni un ajuste fino.

El modelo es capaz de generar audio estéreo a 44.1 kHz con una duración máxima de 190,2 segundos, partiendo de descripciones textuales de hasta 256 tokens. También admite continuación de audio existente e inpainting (edición dirigida). La arquitectura combina un Diffusion Transformer (DiT) con un codificador y un decodificador de audio, e incluye soporte para negative prompts y classifier-free guidance (CFG). El archivo `.aimodel` pesa 9,8 GB con pesos en float32, e incorpora cuatro funciones de inferencia: `conditioner`, `dit`, `decoder_N` y `encoder_N`.

La relevancia de esta conversión radica en que permite ejecutar un modelo de generación de audio de alta calidad directamente en hardware Apple, sin depender de servidores externos ni de librerías de Python pesadas. El rendimiento medido en un Mac con chip M-series alcanza 10,8× realtime para 23,8 segundos de audio, aproximadamente el doble de rápido que la misma ejecución bajo MLX con pesos de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con codificador/decodificador de audio (latent diffusion) |
| Parametros totales | no disponible (la documentacion de memoria menciona un modelo de ~2 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de prompt; hasta 190,2 s de audio generado |
| Tipos de cuantizacion | float32 (pesos originales); no se documentan cuantizaciones alternativas |
| Idiomas soportados | no disponible (el modelo procesa prompts de texto, pero no se especifican idiomas) |
| Licencia | stability-ai-community (licencia comunitaria de Stability AI) |
| Formato de pesos | `.aimodel` (Apple Core AI); el original usa safetensors |

## Arquitectura y entrenamiento

El modelo original Stable Audio 3 Medium es un modelo de difusión latente de audio que utiliza un DiT como red de denoising. El proceso de generación comienza con un prompt de texto que se procesa mediante un `conditioner` para producir condiciones de atención cruzada y una condición global. El DiT opera sobre latentes de audio y produce una predicción de velocidad (`v`), que se integra con un sampler de tipo `pingpong` (específico de modelos `rf_denoiser`). Finalmente, un decodificador convierte el latente en audio PCM estéreo a 44.1 kHz.

La conversión a Core AI mantiene exactamente los mismos pesos y la misma lógica de acondicionamiento (el `conditioner` produce una salida con diferencia 0.0 respecto a la librería original). La única diferencia estructural es que el codificador y el decodificador están compilados a una longitud máxima fija de 190,2 segundos, mientras que el DiT acepta cualquier longitud. Para clips más cortos, se rellena con ceros el latente hasta esa longitud, se decodifica y se recorta el exceso. El repositorio incluye varias versiones del decodificador (`decoder_N`) con longitudes fijas distintas para minimizar el coste de computación en clips cortos.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). La conversión no altera los pesos, por lo que las características de entrenamiento son las del modelo `stabilityai/stable-audio-3-medium`.

## Capacidades

- Generación de audio a partir de texto: produce música, efectos de sonido y ambientes sonoros a partir de descripciones en lenguaje natural.
- Longitud variable: genera clips de hasta 190,2 segundos, con control fino sobre la duración mediante el parámetro `seconds`.
- Continuación de audio: acepta un audio de entrada y regenera el resto a partir de un prompt, manteniendo los primeros segundos como contexto (`--keep`).
- Inpainting: permite editar secciones concretas de un audio existente, reemplazando partes no deseadas mediante generación condicionada.
- Negative prompts y classifier-free guidance: soporta CFG vanilla (no la variante adaptativa proyectada del original).
- Control de determinismo: permite fijar semillas y número de pasos para reproducir resultados.
- Salida estéreo a 44.1 kHz: calidad de audio profesional.
- Ejecución on-device en Apple: gracias al formato Core AI, funciona en iOS 27 y macOS 27 sin dependencias de Python ni PyTorch.

## Casos de uso

- Generación de efectos de sonido para videojuegos: un desarrollador puede describir sonidos como "crujido de fuego con grillos" y obtener un clip de 24 segundos en menos de 3 segundos en un Mac, integrándolo directamente en el motor del juego.
- Creación de música de fondo para podcasts o vídeos: el modelo produce pistas estéreo de hasta 3 minutos, ideales para ambientar contenidos sin preocuparse por derechos de autor.
- Continuación de pistas musicales existentes: un productor puede cargar una melodía de 12 segundos y pedir al modelo que la extienda otros 12 segundos con una descripción textual, manteniendo la coherencia estilística.
- Edición de audio mediante inpainting: en una grabación de campo, se puede eliminar un ruido no deseado (por ejemplo, un claxon) describiendo el sonido que debería ocupar su lugar.
- Prototipado rápido de ideas musicales: compositores pueden generar variaciones de un tema describiendo cambios de instrumentación o ambiente, acelerando el proceso creativo.
- Aplicaciones de accesibilidad: generación de descripciones sonoras para personas con discapacidad visual, creando paisajes auditivos a partir de texto.
- Asistentes de producción en estudio: integración en flujos de trabajo de DAW (Digital Audio Workstation) para generar capas de percusión o texturas de fondo bajo demanda.
- Despliegue en dispositivos Apple sin conexión: al ser un formato `.aimodel`, puede ejecutarse en iPhone o Mac sin conexión a internet, lo que lo hace apto para aplicaciones móviles de creación musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) para este modelo, dado que es un modelo de generación de audio y no de texto. La información disponible incluye métricas de fidelidad y rendimiento medidas por el autor de la conversión:

| Metrica | Valor |
|---|---|
| Fidelidad DiT (coseno / SNR) | 1.000000000 / 105.5 dB |
| Fidelidad decoder (coseno / SNR) | 1.000000000 / 101.4 dB |
| Fidelidad encoder (coseno / SNR) | 1.000000000 / ~100 dB |
| Fidelidad end-to-end (coseno / SNR) | 0.999999981 / 74.1 dB |
| Tiempo de generacion (23.8 s de audio, Mac M-series 36 GB) | 2.21 s (~10.8× realtime) |
| Comparativa con MLX 8-bit | ~2× mas rapido |

Estas cifras confirman que la conversión a Core AI reproduce el comportamiento del modelo original con una precisión casi perfecta, y que el rendimiento en hardware Apple es notablemente superior al de la ejecución con MLX.

## Requisitos de hardware

- Memoria estimada: aproximadamente 7.7 GB fijos más 0.32 GB por segundo de audio generado (para el modelo de ~2 B). Para 23.8 s de audio, se necesitan unos 15.3 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada (el autor probó con 36 GB). No se documenta soporte para GPUs NVIDIA o AMD, aunque el modelo original sí puede ejecutarse en ellas mediante PyTorch.
- Compatibilidad con GPU de consumo: en Mac, cualquier chip M-series con suficiente memoria debería funcionar. En PC, no se ha verificado esta conversión.
- Opciones de despliegue: runtime Core AI (`coreai-torch`), que requiere instalar `coreai-torch`, `tokenizers` y `numpy`. El script `example.py` incluido en el repositorio es autocontenido y no necesita `stable-audio-tools` ni PyTorch.
- Latencia: 2.21 s para generar 23.8 s de audio en un Mac M-series, lo que equivale a 10.8× realtime. La primera carga del modelo compila el `.aimodel` para el dispositivo, proceso que puede ser lento y que se cachea posteriormente.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Longitud maxima | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arraypress/stable-audio-3-medium-coreai` (esta conversion) | Apple Core AI (`.aimodel`) | ~2 B (estimado) | 190.2 s | stability-ai-community | Hugging Face |
| `stabilityai/stable-audio-3-medium` (original) | PyTorch / safetensors | ~2 B (estimado) | 190.2 s | stability-ai-community | Hugging Face |
| `stabilityai/stable-audio-3-small` | PyTorch / safetensors | menor que medium | no disponible | stability-ai-community | Hugging Face |
| `stabilityai/stable-audio-3-large` | PyTorch / safetensors | mayor que medium | no disponible | stability-ai-community | Hugging Face |

La conversión Core AI es funcionalmente idéntica al original, con la ventaja de ejecutarse de forma nativa en Apple. No se dispone de datos comparativos con otros modelos de generación de audio como MusicGen o AudioLDM en la información proporcionada.

## Limitaciones y advertencias

- La conversión no implementa el CFG adaptativo proyectado (`apg_scale`) del modelo original; solo soporta CFG vanilla. Para reproducir el comportamiento por defecto del original, habría que implementar esa variante manualmente.
- El codificador y el decodificador están compilados a una longitud máxima fija de 190,2 s. Para clips más cortos, el relleno con ceros introduce una pequeña imprecisión en los últimos 7–26 ms, que debe recortarse.
- El sampler debe ser `pingpong` obligatoriamente. Usar Euler produce audio distorsionado (supera el rango completo en +7.8 dBFS y comprime el rango dinámico ~10 dB).
- La generación por debajo de 256 latent frames (23.8 s) produce artefactos de alta frecuencia (16–27 % de energía por encima de 10 kHz frente al ~1 % correcto).
- La primera carga del modelo compila el `.aimodel` para el dispositivo, un proceso que puede ser lento y que depende de la complejidad del modelo.
- La licencia `stability-ai-community` tiene términos específicos que deben revisarse antes de un uso comercial. No es una licencia abierta estándar.
- Esta conversión no es un lanzamiento oficial de Stability AI; es un trabajo comunitario. El soporte y el mantenimiento dependen del autor.
- No se documentan sesgos específicos del modelo, pero al ser un modelo de audio entrenado con datos probablemente sesgados hacia música occidental, puede tener limitaciones en otros géneros o culturas musicales.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/arraypress/stable-audio-3-medium-coreai
- Modelo original: https://huggingface.co/stabilityai/stable-audio-3-medium
- Repositorio oficial de Stable Audio 3: https://github.com/Stability-AI/stable-audio-3
- Informe tecnico (arXiv): https://arxiv.org/pdf/2605.17991
