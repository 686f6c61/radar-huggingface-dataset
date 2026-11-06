# s2e-host/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parámetros, desarrollado originalmente por el equipo de hexgrad y arquitectado sobre StyleTTS 2 de Li et al. Esta ficha corresponde al repositorio `s2e-host/Kokoro-82M`, un espejo o rehost del modelo original publicado en Hugging Face, con licencia Apache 2.0. El modelo resuelve el problema de generar voz de calidad competitiva con un coste computacional y económico muy reducido: según la model card, su entrenamiento completo costó aproximadamente 1000 dólares en horas de GPU A100 80GB.

La arquitectura combina StyleTTS 2 con el vocoder ISTFTNet, y se distribuye únicamente el decodificador (sin difusión ni codificador). A pesar de su tamaño reducido, la model card afirma que ofrece calidad comparable a modelos más grandes con mayor velocidad y eficiencia. El modelo está entrenado exclusivamente con audio de licencia permisiva y etiquetas de fonemas IPA, lo que facilita su uso comercial.

Es relevante ahora porque el mercado de TTS por API se sitúa por debajo de 1 dólar por millón de caracteres, y Kokoro puede desplegarse localmente en hardware de consumo. La versión v1.0 (enero de 2025) soporta 8 idiomas y 54 voces, aunque este repositorio concreto declara únicamente inglés como idioma soportado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 + ISTFTNet (solo decodificador, sin difusión ni codificador) |
| Parámetros totales | 82 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (según este repositorio); la versión original v1.0 declara 8 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

Kokoro se basa en StyleTTS 2, un modelo de TTS que utiliza transferencia de estilo para controlar la prosodia, combinado con el vocoder ISTFTNet para la generación de forma de onda. La model card especifica que solo se libera el decodificador: no hay componente de difusión ni codificador publicado. El modelo fue arquitectado por Li et al. (repositorio yl4579/StyleTTS2) y entrenado por @rzvzn.

El entrenamiento se realizó exclusivamente sobre audio permisivo o no sujeto a copyright (dominio público, licencias Apache/MIT, y audio sintético generado por modelos TTS cerrados de grandes proveedores), junto con etiquetas de fonemas IPA. El dataset total comprende unos pocos cientos de horas de audio. La versión v1.0 se publicó el 27 de enero de 2025 con 8 idiomas y 54 voces; la v0.19 (25 de diciembre de 2024) usaba menos de 100 horas y 1 idioma con 10 voces. El coste total de entrenamiento fue de aproximadamente 1000 horas de GPU A100 80GB, equivalentes a unos 1000 dólares. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, con salida de audio a 24 kHz.
- Control de prosodia y estilo mediante la arquitectura StyleTTS 2.
- Generación de audio mediante vocoder ISTFTNet sin pasos de difusión, lo que reduce la latencia.
- Procesamiento de texto a fonemas IPA mediante la librería `misaki` (G2P).
- Soporte de múltiples voces: la versión original v1.0 declara 54 voces; este repositorio no detalla el conjunto de voces disponible.
- Capacidades multilingües: la versión original declara 8 idiomas, pero este repositorio concreto declara únicamente inglés.
- No se documenta en la información disponible soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta modo "thinking" ni capacidades de razonamiento textual.

## Casos de uso

- **Atención al cliente automatizada por voz**: el modelo puede convertir respuestas de texto en audio en tiempo real gracias a su reducido tamaño (82M) y a la ausencia de difusión en el decodificador, lo que permite integrarlo en pipelines de IVR o asistentes telefónicos con latencia baja.
- **Lectura de artículos y accesibilidad**: generación de audio a partir de texto para lectores de pantalla o aplicaciones de accesibilidad, con la ventaja de que el modelo cabe en hardware modesto y puede ejecutarse localmente sin enviar datos a la nube.
- **Generación de audiolibros y pódcasts**: síntesis de largas cantidades de texto con voces consistentes; el coste por hora de audio (menos de 0,06 dólares según la model card) lo hace viable para producción a escala.
- **Avisos y notificaciones en aplicaciones**: conversión de mensajes cortos a voz para apps móviles o dispositivos IoT, donde el tamaño reducido del modelo permite despliegue en el dispositivo o en servidores de baja capacidad.
- **Doblaje y localización de contenido**: la versión original soporta 8 idiomas y 54 voces, lo que permite generar pistas de voz para vídeos o cursos; en este repositorio concreto la cobertura se limita al inglés.
- **Prototipado rápido de interfaces de voz**: desarrolladores que necesitan un TTS funcional en pocas horas pueden usar el paquete `kokoro` de Python con `KPipeline` y ejecutarlo en Google Colab o en local, sin depender de APIs de pago.
- **Investigación en TTS**: al ser un modelo Apache 2.0 con arquitectura documentada (StyleTTS 2 + ISTFTNet) y entrenado con datos permisivos, sirve como base para experimentos de fine-tuning o comparación de vocoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 82M de parámetros y el repositorio ocupa 0,4 GB; la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, e incluso podría ejecutarse en CPU para cargas no interactivas.
- **GPU recomendadas**: A100 80GB fue usada para el entrenamiento (1000 horas), pero para inferencia son suficientes GPUs consumer como RTX 3060, RTX 4060 o superiores; también es viable en CPU.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM; el tamaño del repo (0,4 GB) sugiere que los pesos son ligeros.
- **Opciones de despliegue**: paquete Python `kokoro` (>=0.9.2), que internamente usa `misaki` para G2P y requiere `espeak-ng` instalado; también puede ejecutarse en Google Colab. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no a TTS).
- **Latencia y throughput estimados**: no disponible en la información proporcionada; la model card afirma que es "significativamente más rápido" que modelos mayores, pero sin cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de TTS comparables (como VITS, Bark, XTTS o Piper) que permitan una comparación rigurosa con cifras.

## Limitaciones y advertencias

- **Idioma**: este repositorio concreto declara únicamente inglés; aunque la versión original v1.0 soporta 8 idiomas, no se garantiza que este rehost incluya esos pesos o voces.
- **Sesgos**: el entrenamiento se realizó con audio permisivo y sintético; no se documentan análisis de sesgos de género, acento o etnia en las voces disponibles.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en pronunciaciones incorrectas o prosodia inadecuada en textos con nombres propios, siglas o palabras fuera del vocabulario de entrenamiento; no se documentan métricas de intelligibilidad o naturalidad en la información disponible.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la model card advierte sobre sitios web falsos (kokorottsai_com, kokorotts_net) no afiliados al autor; conviene verificar la procedencia de los pesos.
- **Rehost no oficial**: este repositorio (`s2e-host/Kokoro-82M`) tiene 29 descargas y 0 likes, y su fecha de creación (26 de octubre de 2026) es posterior a la publicación original; se recomienda contrastar con el repositorio oficial `hexgrad/Kokoro-82M` antes de usarlo en producción.
- **Datos de entrenamiento**: aunque se usó audio permisivo, parte del audio sintético proviene de modelos TTS cerrados, lo que puede introducir sesgos o artefactos de esos sistemas.
- **Caveat para producción**: no se documentan en la información disponible métricas de latencia, throughput ni calidad objetiva (MOS) para este rehost concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/s2e-host/Kokoro-82M
- Repositorio original (referencia): https://huggingface.co/hexgrad/Kokoro-82M
- GitHub: https://github.com/hexgrad/kokoro
- Demo: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Paper StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper ISTFTNet: https://arxiv.org/abs/2203.02395
- Repositorio StyleTTS2: https://github.com/yl4579/StyleTTS2
- Librería misaki (G2P): https://github.com/hexgrad/misaki
- EVAL.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- SAMPLES.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- VOICES.md: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Discord: https://discord.gg/QuGxSWBfQy
- Precios de referencia: https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price y https://deepinfra.com/hexgrad/Kokoro-82M
