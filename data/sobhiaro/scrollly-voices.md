# sobhiaro/scrollly-voices

## Resumen

Scrollly Voices es un paquete de pesos del modelo de síntesis de voz Kokoro-82M, empaquetado específicamente para su uso en la aplicación iOS Scrollly mediante la librería KokoroSwift basada en MLX. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos oficiales de Kokoro-82M v1.0 (327 MB) junto con un fichero `voices.npz` que contiene 28 vectores de estilo de voz en inglés. El autor del repositorio es `sobhiaro` y el empaquetado para KokoroSwift lo firma Lassi Maksimainen.

El modelo base, Kokoro-82M, es un modelo de text-to-speech de 82 millones de parámetros desarrollado por hexgrad, conocido por ofrecer una calidad de síntesis notable con un tamaño muy reducido que permite inferencia local en dispositivos de consumo. Este repositorio concreto resuelve el problema de distribución de voces naturales en una app iOS: los ficheros se descargan bajo demanda y se ejecutan en local con MLX, sin depender de servicios en la nube.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue (pesos redistribuidos) más que un modelo nuevo. Es útil para desarrolladores que quieran integrar Kokoro en entornos Apple Silicon o iOS, o que necesiten verificar la procedencia y licencia de los pesos empaquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS2, según el modelo base) |
| Parámetros totales | 82M (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`kokoro-v1_0.safetensors`) + `voices.npz` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento; solo redistribuye los pesos de Kokoro-82M v1.0. Según la información disponible, el modelo base es Kokoro-82M de hexgrad, un TTS de 82M de parámetros. Los detalles de arquitectura, composición del dataset, número de tokens de audio y posibles etapas de RLHF/DPO no están disponibles en la información proporcionada.

La innovación relevante en este paquete es el formato de distribución: los pesos se empaquetan para KokoroSwift, una implementación en MLX que permite ejecutar el modelo en dispositivos Apple (iOS/macOS) con aceleración por GPU/Neural Engine. El fichero `voices.npz` contiene 28 vectores de estilo de voz en inglés, lo que permite seleccionar timbres distintos sin reentrenar.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- 28 voces de estilo distintas incluidas en `voices.npz`.
- Inferencia local en dispositivos Apple mediante MLX (KokoroSwift).
- Descarga bajo demanda desde la app Scrollly, sin servicio en la nube.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada: solo inglés según la model card.

## Casos de uso

- Lectura por voz en apps iOS: integración de KokoroSwift con los pesos de este repositorio para narrar contenido dentro de la app Scrollly sin enviar texto a servidores externos.
- Accesibilidad: conversión de texto a voz en local para usuarios con discapacidad visual, aprovechando el tamaño reducido (327 MB) y la ejecución on-device.
- Audiolibros y podcasts generados: síntesis de guiones largos con selección entre 28 voces para dar variedad a distintos personajes o secciones.
- Asistentes de voz offline: generación de respuestas habladas en asistentes que deben funcionar sin conectividad, usando MLX en iPhone/iPad/Mac.
- Prototipado de interfaces conversacionales: pruebas rápidas de TTS en entornos Apple Silicon sin depender de APIs de terceros.
- Verificación de licencia y procedencia: uso del repositorio como fuente auditable de pesos Apache 2.0 para despliegues comerciales que requieran trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 82M de parámetros y pesos de 327 MB, la huella de memoria es del orden de cientos de MB.
- GPU recomendadas: no disponible; el paquete está orientado a MLX, por lo que el hardware objetivo son chips Apple (serie M y A con soporte MLX).
- Cabe en GPU de consumo: sí, por tamaño; en el ecosistema Apple se ejecuta en iPhone/iPad/Mac compatibles con MLX.
- Opciones de despliegue: KokoroSwift (MLX) según la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scrollly Voices (Kokoro-82M) | 82M | no disponible | en | Apache 2.0 | Hugging Face (este repo) |
| hexgrad/Kokoro-82M | 82M | no disponible | en (principal) | Apache 2.0 | Hugging Face |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe documentado.
- Es una redistribución de pesos, no un modelo nuevo: las limitaciones del modelo base Kokoro-82M aplican íntegramente.
- No se documentan sesgos conocidos ni tasas de alucinación/artefactos de síntesis en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las atribuciones de datos de entrenamiento indicadas en la model card de hexgrad/Kokoro-82M.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación comunitaria.
- El despliegue está atado a MLX/KokoroSwift; no se garantiza compatibilidad con otros runtimes.
- No se especifican cuantizaciones ni requisitos de memoria detallados.

## Enlaces

- Hugging Face: https://huggingface.co/sobhiaro/scrollly-voices
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- KokoroSwift: https://github.com/mlalma/kokoro-ios
- App Scrollly: https://apps.apple.com/app/id1624347080
- Repositorio de empaquetado (KokoroTestApp): https://github.com/mlalma/KokoroTestApp
