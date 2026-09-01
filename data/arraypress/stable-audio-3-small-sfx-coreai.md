# arraypress/stable-audio-3-small-sfx-coreai

## Resumen

Stable Audio 3 Small SFX es un modelo de difusión latente de Stability AI, especializado en la generación de efectos de sonido, texturas y ambientes a partir de descripciones de texto. Con 459 millones de parámetros, está diseñado para ejecutarse en dispositivos de consumo, como móviles y portátiles. Esta ficha describe la conversión comunitaria publicada por el usuario `arraypress`, que adapta los pesos originales al formato Apple Core AI (`.aimodel`) para su ejecución on-device en iOS 27 y macOS 27. No se trata de un reentrenamiento ni un fine-tuning: los pesos son idénticos a los del modelo original, solo cambia el formato de empaquetado y la interfaz de inferencia.

La conversión mantiene la paridad funcional con el original, incluyendo generación de audio de hasta 380,4 segundos, entrada de audio para continuación e inpainting, y soporte de negative prompts con classifier-free guidance (CFG) en su variante vanilla. El modelo se distribuye como un único archivo `.aimodel` de 2,9 GB con pesos en float32, junto con un tokenizador de 34 MB. La relevancia de esta conversión radica en que permite ejecutar el modelo de forma nativa en el ecosistema Apple sin depender de frameworks externos como PyTorch o MLX, con un rendimiento medido de aproximadamente 10,8× realtime en un Mac con chip M-series.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente con transformer DiT (denoiser) y autoencoder (encoder/decoder) |
| Parametros totales | 459 millones (según fal.ai) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 380,4 s de audio; prompt de texto de 256 tokens |
| Tipos de cuantizacion | float32 (sin cuantización adicional) |
| Idiomas soportados | No disponible |
| Licencia | stability-ai-community (license:other) |
| Formato de pesos | `.aimodel` (Apple Core AI) |

## Arquitectura y entrenamiento

El modelo original de Stability AI es un modelo de difusión latente que opera sobre representaciones comprimidas de audio. El componente principal es un transformer DiT (Diffusion Transformer) que denoisa el latente a lo largo de una trayectoria de tiempo, condicionado por el texto y por la duración deseada. El autoencoder comprime el audio a un espacio latente y lo reconstruye a 44,1 kHz en estéreo. El entrenamiento del modelo original no se detalla en la información disponible, pero se sabe que es una versión reducida (small) orientada a eficiencia en dispositivos.

La conversión a Core AI mantiene los pesos originales sin modificación. La implementación incluye cuatro funciones de inferencia: `conditioner` (ensambla las condiciones de texto y duración), `dit` (el denoiser, que acepta cualquier longitud de latente), y `decoder_N` / `encoder_N` compilados a longitudes fijas. El modelo card especifica que el sampler debe ser `pingpong` (un esquema de muestreo específico para modelos `rf_denoiser`), con 8 pasos y CFG scale 1.0 por defecto. La generación por debajo de 256 frames latentes (23,8 s) produce artefactos de alta frecuencia, por lo que se recomienda generar al menos esa duración.

## Capacidades

- Generación de efectos de sonido, texturas y ambientes a partir de prompts de texto (text-to-audio).
- Continuación e inpainting de audio existente: se puede proporcionar un clip de entrada y regenerar una parte posterior o rellenar secciones.
- Soporte de negative prompts y classifier-free guidance (CFG) en su variante vanilla (no implementa la variante adaptativa proyectada del original).
- Control de duración de salida hasta 380,4 segundos, con resolución de 44,1 kHz y salida estéreo.
- Control de pasos, semillas y determinismo para reproducibilidad.
- Prompt de texto de hasta 256 tokens.
- Ejecución on-device en dispositivos Apple con iOS 27 / macOS 27 mediante el runtime Core AI.

## Casos de uso

- Diseño de sonido para videojuegos: generar efectos como pasos, puertas, explosiones o ambientes de fondo directamente desde descripciones textuales, acelerando el prototipado y la iteración en estudios independientes.
- Producción de podcasts y audiolibros: crear transiciones sonoras, ambientes de sala o efectos de énfasis sin necesidad de librerías de audio externas, con control de duración y estilo mediante prompts.
- Postproducción de vídeo: generar sonidos de foley (pasos, roces, golpes) para escenas concretas, usando la función de inpainting para reemplazar secciones de una pista existente.
- Prototipado de interfaces de usuario: generar sonidos de notificación, clics o alertas para aplicaciones móviles, con la ventaja de ejecutarse en el propio dispositivo de desarrollo.
- Creación de ambientes para meditación o relajación: producir texturas sonoras continuas (lluvia, fuego, viento) de hasta varios minutos, aprovechando la ventana de 380 segundos.
- Automatización de bibliotecas de sonido: generar lotes de efectos variados a partir de prompts parametrizados, con semillas fijas para mantener coherencia en series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, etc.) porque se trata de un modelo de audio. En su lugar, el modelo card proporciona métricas de fidelidad y rendimiento medidas por el autor de la conversión:

| Metrica | Valor |
|---|---|
| Fidelidad DiT (cosine / SNR) | 1.000000000 / 112,6 dB |
| Fidelidad Decoder (cosine / SNR) | 1.000000000 / 45,3 dB |
| Fidelidad Encoder (cosine / SNR) | 1.000000000 / ~100 dB |
| Fidelidad end-to-end (cosine / SNR) | 0.999999981 / 74,1 dB |
| Tiempo de generación (23,8 s de audio, M-series 36 GB) | 2,21 s (~10,8× realtime) |
| Comparativa con MLX 8-bit | ~2× más rápido |

## Requisitos de hardware

- Dispositivos Apple con chip M-series (Apple Silicon) y sistema iOS 27 / macOS 27.
- Memoria: el modelo card indica que la memoria escala con la duración del audio. Para el modelo de 2B (no el small) se citan ~7,7 GB fijos más ~0,32 GB por segundo de audio; para el modelo small (459M) el consumo será menor, aunque no se proporciona una cifra exacta.
- Almacenamiento: 2,9 GB para el archivo `.aimodel` más 34 MB del tokenizador.
- La primera carga compila el modelo para el dispositivo específico, lo que puede ser lento; el resultado se cachea para usos posteriores.
- Despliegue: se requiere el runtime Core AI (`coreai-torch`), junto con `tokenizers` y `numpy`. El repositorio incluye un `example.py` autocontenido que no depende de PyTorch ni de `stable-audio-tools`.
- No se requiere GPU dedicada; la inferencia se ejecuta en la GPU integrada del chip Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stabilityai/stable-audio-3-small-sfx (original) | 459M | Hasta 380,4 s | PyTorch / safetensors | stability-ai-community | Hugging Face |
| arraypress/stable-audio-3-small-sfx-coreai (esta conversión) | 459M | Hasta 380,4 s | `.aimodel` (Core AI) | stability-ai-community | Hugging Face |
| Misma conversión bajo MLX (no publicada) | 459M | Hasta 380,4 s | MLX (8-bit) | — | No disponible |

La conversión a Core AI ofrece una ventaja de rendimiento medida (~2× más rápida que MLX con pesos de 8 bits) y una integración nativa con el ecosistema Apple, a costa de requerir el runtime Core AI y de no implementar la variante adaptativa de CFG del original.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Stability AI; es una conversión comunitaria. Los pesos son idénticos, pero el soporte y el mantenimiento dependen del autor.
- La variante de CFG adaptativa proyectada (`apg_scale`) del modelo original no está implementada; solo se soporta CFG vanilla.
- El sampler debe ser `pingpong` obligatoriamente; usar Euler produce audio saturado y con rango dinámico comprimido.
- La generación por debajo de 256 frames latentes (23,8 s) produce artefactos de alta frecuencia; se recomienda generar al menos esa duración.
- La primera carga compila el modelo y puede tardar considerablemente, especialmente en dispositivos con menos memoria.
- La licencia `stability-ai-community` puede imponer restricciones de uso comercial; es necesario revisar el archivo LICENSE.md adjunto.
- No se documentan sesgos específicos del modelo de audio, pero como todo modelo generativo, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, asociaciones culturales en los efectos de sonido).
- El modelo está pensado para efectos de sonido y ambientes; no es adecuado para generación de música compleja o voces.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/arraypress/stable-audio-3-small-sfx-coreai
- Modelo original: https://huggingface.co/stabilityai/stable-audio-3-small-sfx
- Repositorio oficial de Stable Audio 3: https://github.com/Stability-AI/stable-audio-3
- Documentación de API en fal.ai: https://fal.ai/models/fal-ai/stable-audio-3/small/sfx/text-to-audio/api
