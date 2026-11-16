# Ruhantab/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parámetros, desarrollado originalmente por hexgrad y publicado con licencia Apache 2.0. Esta ficha corresponde a la réplica del repositorio `Ruhantab/Kokoro-82M`, un espejo del modelo original que mantiene la misma licencia y la misma arquitectura. El modelo destaca por ofrecer una calidad de síntesis comparable a sistemas mucho más grandes con un coste computacional y económico muy reducido: el entrenamiento completo de la versión 1.0 costó aproximadamente 1.000 dólares en horas de GPU A100 de 80 GB.

La arquitectura combina StyleTTS 2 (Li et al., 2023) con ISTFTNet (2022) como decodificador, sin difusión ni encoder publicado. El modelo se entrenó exclusivamente con audio de dominio público o con licencias permisivas (Apache, MIT, CC BY) y etiquetas de fonemas IPA, lo que facilita su uso comercial sin las restricciones habituales de los corpus propietarios. La versión 1.0, publicada el 27 de enero de 2025, soporta 8 idiomas y 54 voces, y se entrenó con unos cientos de horas de audio.

Su relevancia actual radica en que demuestra que un modelo TTS de menos de 100 millones de parámetros puede desplegarse en producción a menos de 1 dólar por millón de caracteres (o menos de 0,06 dólares por hora de audio), según tarifas de API de abril de 2025. Esto lo convierte en una opción atractiva para aplicaciones de accesibilidad, asistentes de voz y generación de audio a escala, tanto en infraestructura propia como en servicios gestionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 con decodificador ISTFTNet (sin difusión, sin encoder publicado) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 8 idiomas en v1.0 (incluye inglés; la ficha del espejo indica `en` como idioma principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo ocupa 0,4 GB; el paquete `kokoro` en PyPI carga los pesos) |

## Arquitectura y entrenamiento

Kokoro emplea la arquitectura StyleTTS 2, un sistema de síntesis de voz basado en modelos de estilo que separa el contenido lingüístico del estilo prosódico, combinado con ISTFTNet como decodificador de forma de onda. El modelo es decoder-only: no utiliza difusión ni publica el encoder, lo que simplifica el despliegue y reduce la latencia frente a arquitecturas generativas más pesadas. La entrada de texto se convierte a fonemas IPA mediante la librería `misaki` (G2P), y el modelo genera audio a 24 kHz.

El entrenamiento se realizó exclusivamente sobre audio permisivo o no sujeto a copyright: dominio público, licencias Apache/MIT/CC BY y audio sintético generado por modelos TTS cerrados de grandes proveedores (no se usó audio sintético de modelos TTS abiertos ni clones de voz personalizados). El dataset total ronda unos cientos de horas de audio. La versión 1.0 se entrenó con 500 horas de GPU A100 80GB a una tarifa media de 1,20 dólares/hora (600 dólares), sumando un total de 1.000 horas y unos 1.000 dólares junto con la versión 0.19. No se documenta en la información disponible el uso de RLHF o DPO; el pipeline se basa en etiquetas de fonemas IPA y datos de audio permisivos.

## Capacidades

- Síntesis de voz a partir de texto en inglés (y hasta 8 idiomas y 54 voces en la versión 1.0 original).
- Generación de audio a 24 kHz con calidad comparable a modelos de mayor tamaño según el autor.
- Control de estilo y prosodia heredado de StyleTTS 2.
- Conversión de grafemas a fonemas IPA mediante `misaki` para una pronunciación controlada.
- Despliegue ligero: 82M de parámetros permiten inferencia en CPU y GPU de gama baja.
- Uso comercial permitido por licencia Apache 2.0.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Atención al cliente automatizada**: integrado en un pipeline de IVR o chatbot, el modelo convierte respuestas textuales en voz con latencia baja gracias a sus 82M de parámetros, lo que permite generar audio en tiempo real en servidores modestos.
- **Accesibilidad y lectura de contenido**: conversión de artículos, documentación o correos a audio para usuarios con discapacidad visual, usando las 54 voces de la versión 1.0 para adaptar el tono al contexto.
- **Generación de audiolibros y pódcasts**: síntesis por lotes de textos largos con coste inferior a 1 dólar por millón de caracteres, adecuado para catálogos extensos donde el coste por hora de audio es crítico.
- **Asistentes de voz embebidos**: despliegue en dispositivos con recursos limitados (Raspberry Pi, CPUs de servidor) al no requerir GPU dedicada, gracias al reducido tamaño del modelo.
- **Localización de contenido**: generación de pistas de voz en varios idiomas (8 en v1.0) para vídeos, tutoriales o interfaces, manteniendo coherencia de estilo entre idiomas.
- **Prototipado rápido de productos de voz**: uso en demos y MVPs con la licencia Apache 2.0, sin las restricciones de los modelos TTS propietarios, y con la posibilidad de pasar a producción con el mismo modelo.
- **Generación de avisos y notificaciones**: síntesis dinámica de mensajes personalizados (alertas, recordatorios) en aplicaciones móviles o sistemas de megafonía, donde el coste por carácter y la latencia importan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original remite a `EVAL.md` y `SAMPLES.md` para evaluaciones y muestras, pero no se incluyen cifras numéricas en los datos proporcionados. El autor afirma que la calidad es comparable a modelos más grandes, pero no se aportan métricas objetivas (MOS, WER, RTF) en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial; con 82M de parámetros, el modelo en fp32 ocupa aproximadamente 0,33 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 4090, A100, H100 y también en GPUs integradas.
- **CPU**: el modelo puede ejecutarse en CPU, lo que lo hace apto para dispositivos de borde y servidores sin GPU.
- **Opciones de despliegue**: paquete `kokoro` (PyPI, versión >= 0.9.2), que internamente usa `misaki` para G2P y requiere `espeak-ng`; también se ha desplegado en APIs comerciales como Replicate y DeepInfra.
- **Latencia y throughput**: no se proporcionan cifras oficiales; el autor indica que es significativamente más rápido y eficiente en coste que modelos mayores, con un coste de API inferior a 0,06 dólares por hora de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M | 82M | 8 (v1.0) | Apache 2.0 | no aplica (TTS) | Hugging Face, PyPI, APIs |
| StyleTTS 2 (base) | no disponible | 1 (LJSpeech) | no disponible | no aplica | Hugging Face (yl4579) |
| Modelos TTS cerrados de grandes proveedores | no disponible | múltiples | propietaria | no aplica | APIs comerciales |

La información disponible no permite una comparación numérica de rendimiento con alternativas concretas; los datos de benchmarks de otros modelos TTS no se incluyen en la documentación proporcionada.

## Limitaciones y advertencias

- **Idioma**: la ficha del espejo `Ruhantab/Kokoro-82M` declara únicamente inglés (`en`), aunque la versión 1.0 original soporta 8 idiomas; conviene verificar qué voces e idiomas están realmente disponibles en este espejo.
- **Sesgos**: al entrenarse con audio permisivo y sintético, la diversidad de acentos y hablantes puede ser limitada; no se documentan evaluaciones de sesgo.
- **Alucinación y errores de pronunciación**: como todo TTS, puede producir prosodia incorrecta o pronunciaciones erróneas en palabras poco frecuentes, siglas o nombres propios; la calidad depende del G2P (`misaki`).
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe conservar la atribución de las fuentes CC BY (Koniwa, SIWIS) incluidas en el dataset de entrenamiento.
- **Repositorio espejo**: este repositorio (`Ruhantab/Kokoro-82M`) tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no es el repositorio oficial, por lo que se recomienda usar `hexgrad/Kokoro-82M` para producción.
- **Advertencia de fraude**: la model card original alerta de sitios web falsos con "kokoro" en el dominio que no están afiliados al proyecto.
- **Producción**: no hay garantías de soporte ni mantenimiento por parte del autor del espejo; el proyecto original se mantiene en GitHub.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Ruhantab/Kokoro-82M
- Repositorio oficial: https://huggingface.co/hexgrad/Kokoro-82M
- GitHub: https://github.com/hexgrad/kokoro
- Demo: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Paper StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper ISTFTNet: https://arxiv.org/abs/2203.02395
- Librería G2P misaki: https://github.com/hexgrad/misaki
- Evaluación: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- Muestras: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- Voces: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Precios API (ArtificialAnalysis): https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price
- DeepInfra: https://deepinfra.com/hexgrad/Kokoro-82M
- Discord: https://discord.gg/QuGxSWBfQy
