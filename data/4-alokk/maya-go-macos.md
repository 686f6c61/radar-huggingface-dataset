# 4-alokk/maya-go-macos

## Resumen

Maya Go es una distribución de pesos del modelo de síntesis de voz Maya 2 Native, publicada por el usuario 4-alokk para ejecutar TTS (text-to-speech) en servidores Go sobre macOS con Apple Silicon, utilizando el framework MLX y la API Metal. No se trata de un modelo entrenado desde cero: el repositorio empaqueta los ficheros originales de maya-research/maya2-native, junto con el códec neuronal Mimi de Kyutai, en una estructura de directorios pensada para el servidor "Adsorp Go" y documentada mediante un `manifest.json` con tamaños y hashes SHA-256 por fichero.

El modelo cubre doce idiomas, con once lenguas índicas (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) más inglés, y ofrece 20 voces predefinidas a una frecuencia de muestreo de 24 kHz. Los pesos están en bfloat16 y el servidor los cuantiza a 8 bits en el momento de la carga. El repositorio ocupa 5,4 GB y el modelo declara aproximadamente 2.500 millones de parámetros según los ficheros safetensors.

Su relevancia es acotada pero clara: permite desplegar TTS multilingüe índico-inglés en hardware de Apple sin depender de CUDA, a través de una pila MLX/Metal. La licencia Apache 2.0 de los pesos facilita su integración, aunque el códec Mimi tiene licencia independiente CC-BY-4.0. No se incluye el codificador de altavoz ECAPA, por lo que no hay clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de sintesis de voz Maya 2 Native con backbone tokenizador Qwen3 y codec neuronal Mimi) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 en pesos; cuantizacion a 8 bits en carga por el servidor |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (asames, bengali, ingles, guyarati, hindi, canares, malabar, marati, oriya, panyabi, tamil, telugu) |
| Licencia | Apache 2.0 (pesos); codec Mimi bajo CC-BY-4.0 |
| Formato de pesos | safetensors (bfloat16, dos shards con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base Maya 2 Native más allá de lo indicado en la model card: se trata de un sistema de TTS que combina un backbone con tokenizador y configuración Qwen3, un codec neuronal Mimi de Kyutai para la representación y reconstrucción de audio, y ficheros de priors de duración (`duration_prior.json`, `text_frames_prior.json`) empleados por los mecanismos de parada del servidor. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación práctica de esta distribución no está en el entrenamiento, sino en el empaquetado: los pesos se reorganizan en directorios (`backbone/`, `voices/`, `mimi/`) con un manifiesto que permite al servidor Go verificar integridad y cargar los componentes por separado. La cuantización a 8 bits se realiza en tiempo de carga, no se distribuyen pesos ya cuantizados. No se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) a 24 kHz a partir de texto de entrada.
- Soporte de doce idiomas: once lenguas índicas y inglés.
- Veinte voces predefinidas identificadas por nombre en `voices/voices.json`.
- Generación de audio mediante codec Mimi, adecuada para integración en pipelines de audio.
- Ejecución nativa en Apple Silicon mediante MLX y Metal.
- Verificación de integridad de ficheros mediante `manifest.json` (tamaño y SHA-256).
- No incluye clonación de voz: el codificador de altavoz ECAPA no está presente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Lectura por voz de contenidos en lenguas índicas: el modelo permite convertir artículos o documentación a audio en hindi, tamil, bengalí y otras lenguas, con veinte voces seleccionables para adaptar el tono al público.
- Asistentes de voz locales en macOS: al ejecutarse sobre MLX/Metal en Apple Silicon, puede integrarse en aplicaciones de escritorio que requieran TTS sin conexión a servicios en la nube, con una huella de memoria de unos 7 GB en 8 bits.
- Accesibilidad en entornos Apple: generación de audio para lectores de pantalla o aplicaciones de accesibilidad en equipos Mac, aprovechando la ejecución nativa sin GPU dedicada.
- Doblaje y locución automatizada de material formativo: las veinte voces permiten asignar timbres distintos a módulos o personajes, y la salida a 24 kHz es suficiente para vídeo educativo y pódcast.
- Integración en servidores Go: el empaquetado con manifiesto y hashes facilita el despliegue reproducible en un servicio backend escrito en Go que sirva peticiones TTS a otras aplicaciones.
- Prototipado de interfaces conversacionales multilingües: combinado con un ASR y un LLM, puede cerrar el bucle de voz en demos de asistentes para usuarios de la India, cubriendo la mayoría de lenguas oficiales del país.
- Generación de avisos y notificaciones habladas: para sistemas de alerta o domótica que necesiten mensajes de voz en varios idiomas sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada estimada: unos 7 GB con cuantización a 8 bits, según la model card.
- Plataforma: exclusivamente macOS sobre Apple Silicon (MLX/Metal). No está pensado para Windows, Linux ni Macs con Intel.
- GPU recomendadas: no se especifican modelos concretos; cualquier chip de Apple Silicon con memoria unificada suficiente (M-series) debería poder alojar el modelo en 8 bits.
- No aplica a GPU discretas tipo A100, H100 o RTX 4090, ya que la pila de ejecución es MLX.
- Opciones de despliegue: servidor Go "Adsorp Go" con MLX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Maya Go (esta ficha) | ~2,5 B | No disponible | 12 (11 indicas + ingles) | Apache 2.0 (Mimi CC-BY-4.0) | macOS Apple Silicon (MLX) |
| Maya 2 Native (upstream) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos TTS indices alternativos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Plataforma restringida: solo funciona en macOS con Apple Silicon; no hay soporte para Windows, Linux ni Macs Intel.
- No incluye clonación de voz, ya que falta el codificador de altavoz ECAPA.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La licencia Apache 2.0 cubre los pesos, pero el codec Mimi está bajo CC-BY-4.0, lo que exige atribución adicional a Kyutai.
- No se documentan sesgos lingüísticos, tasas de alucinación ni calidad subjetiva (MOS) del audio generado.
- Al ser una redistribución de pesos upstream sin modificar, cualquier limitación del modelo Maya 2 Native se hereda; no se detallan en la model card.
- La cuantización a 8 bits se aplica en carga por el servidor, lo que puede introducir degradación de calidad respecto a bfloat16; no se cuantifica esa pérdida.
- No hay información sobre latencia, throughput ni comportamiento en cargas concurrentes.
- El autor es un usuario individual (4-alokk), no el equipo de maya-research; conviene verificar los hashes del manifiesto antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/4-alokk/maya-go-macos
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Codec Mimi (Kyutai): https://huggingface.co/kyutai/mimi
