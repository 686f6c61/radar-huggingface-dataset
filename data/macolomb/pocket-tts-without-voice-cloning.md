# macolomb/pocket-tts-without-voice-cloning

## Resumen

Pocket TTS es un sistema de síntesis de voz (text-to-speech) desarrollado originalmente por Kyutai, un laboratorio francés de investigación en IA. Este repositorio concreto, publicado por el usuario macolomb, ofrece una conversión a formato GGUF de los paquetes de idioma de Pocket TTS para su uso con llama.cpp, lo que permite ejecutar el modelo en hardware modesto sin depender de frameworks de deep learning pesados. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, una variante que prescinde del codificador de clonación de voz y utiliza únicamente voces predefinidas.

La arquitectura combina un backbone de texto, un decodificador acústico basado en flow-matching y un decodificador de códec Mimi, todo empaquetado en dos ficheros GGUF por idioma: el modelo de texto y un fichero mmproj que contiene el decodificador y los embeddings de las 25 voces predefinidas. Con 79,6 millones de parámetros totales, es un modelo extremadamente compacto, pensado para inferencia local y despliegue en servidores ligeros.

Su relevancia actual radica en que democratiza la síntesis de voz multilingüe (italiano, francés, inglés, alemán y español) en entornos donde no hay GPU dedicada, gracias a la integración con llama.cpp mediante `llama-tts` y `llama-server`. La licencia CC BY 4.0 facilita su uso comercial, aunque con matices importantes sobre las licencias de las grabaciones de voz originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de texto + decodificador acústico flow-matching + decodificador de códec Mimi |
| Parámetros totales | 79.623.168 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos principales), F32 (tensores pequeños y embeddings de voz), F16 (algunos tensores del mmproj) |
| Idiomas soportados | italiano, francés, inglés, alemán, español |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (modelo de texto + mmproj por idioma) |

## Arquitectura y entrenamiento

Pocket TTS es un sistema TTS completo compuesto por tres etapas: un backbone de texto que procesa la entrada lingüística, un decodificador acústico basado en flow-matching que genera representaciones acústicas intermedias, y un decodificador del códec Mimi que produce la forma de onda final. Cada paquete de idioma es un modelo completo e independiente: el idioma es una propiedad de los pesos, no un parámetro en tiempo de inferencia.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` sobre la revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739` del repositorio de Kyutai (rama `main` a fecha de 2026-10-21). Los pesos conservan la precisión BF16 de los checkpoints originales, con tensores menores en F32 y algunos en F16 dentro del mmproj. Las voces se almacenan como embeddings F32 en el mmproj, calculados con los pesos de cada paquete, por lo que no son intercambiables entre idiomas. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en cinco idiomas: italiano, francés, inglés, alemán y español.
- Uso de 25 voces predefinidas por paquete de idioma, seleccionables mediante `--tts-voice` en `llama-tts` o el campo `voice` en el endpoint `/tts` de `llama-server`.
- Generación de audio en formato WAV a través de la API HTTP de llama.cpp (`POST /tts`).
- Descubrimiento de voces disponibles mediante `GET /props`, que las lista en el campo `voices`.
- Soporte de opciones de generación como `seed`, `n_predict`, `response_format` y `stream` en el servidor.
- No soporta clonación de voz: el codificador de voz ha sido eliminado y `--tts-speaker-file` es rechazado.
- No dispone de capacidades de razonamiento, código, matemáticas, visión ni tool calling; es exclusivamente un modelo TTS.

## Casos de uso

- **Locución automatizada de artículos o boletines en varios idiomas**: el modelo permite generar audio en italiano, francés, inglés, alemán o español con una voz consistente, cargando el paquete de idioma correspondiente y eligiendo una voz predefinida. Es adecuado por su tamaño reducido y su integración con llama.cpp.
- **Sistemas de anuncios y avisos en transporte público**: con `llama-server` expuesto vía HTTP, un servicio puede enviar texto al endpoint `/tts` y recibir un WAV listo para reproducir, usando una voz fija como `giovanni` o `alba` para mantener la identidad sonora.
- **Generación de audiolibros o contenido accesible**: al disponer de 25 voces por idioma, se pueden asignar voces distintas a narradores o personajes, generando los fragmentos por lotes con `llama-tts` y ensamblándolos posteriormente.
- **Prototipado de asistentes de voz en local**: en entornos sin GPU, el modelo cabe en CPU y permite iterar sobre diálogos y respuestas habladas sin depender de servicios en la nube, gracias al formato GGUF y a llama.cpp.
- **Internacionalización de productos**: un mismo pipeline puede servir contenido hablado en cinco idiomas simplemente cambiando el par de ficheros GGUF (modelo y mmproj), sin reentrenar ni ajustar parámetros en tiempo de inferencia.
- **Generación de pistas de audio para vídeos o presentaciones**: la API HTTP permite integrar la síntesis en herramientas de edición o scripts que generen narración a partir de guiones, con control del seed para reproducibilidad.
- **Pruebas de accesibilidad y lectura de textos largos**: la posibilidad de ejecutar `llama-tts` desde línea de comandos facilita la conversión por lotes de documentos a audio en entornos de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 79,6 millones de parámetros en BF16/F32, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con unos pocos GB de memoria es suficiente.
- Compatibilidad con GPU consumer: sí, previsiblemente en cualquier RTX o equivalente, aunque no se detallan modelos concretos.
- Opciones de despliegue: `llama-tts` (CLI) y `llama-server` (API HTTP) de llama.cpp, requiriendo la rama del PR ggml-org/llama.cpp#31429 hasta su fusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros sistemas TTS que permitan una tabla rigurosa.

## Limitaciones y advertencias

- No soporta clonación de voz: el codificador de voz se ha eliminado y `--tts-speaker-file` es rechazado.
- Las voces `cosette` y `jean` del modelo original de Kyutai no están incluidas por su licencia CC BY-NC 4.0, incompatible con la CC BY 4.0 de este repositorio.
- La licencia de algunas voces no está declarada explícitamente por Kyutai (`giovanni`, `lola`, `juergen`, `rafael`, `daan`), por lo que se recomienda revisar las páginas de Kyutai antes de usarlas comercialmente.
- El idioma es una propiedad de los pesos: no hay parámetro de idioma en inferencia, y cada paquete requiere su propio mmproj; las voces no son intercambiables entre idiomas.
- Requiere una rama específica de llama.cpp (PR #31429) hasta que se fusione, lo que puede complicar el despliegue en producción.
- No se dispone de información sobre sesgos, riesgo de alucinación lingüística ni limitaciones de contexto; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la prosodia artificial en textos complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-03, por lo que su validación por la comunidad es inexistente.

## Enlaces

- [Repositorio Hugging Face: macolomb/pocket-tts-without-voice-cloning](https://huggingface.co/macolomb/pocket-tts-without-voice-cloning)
- [Modelo base: kyutai/pocket-tts-without-voice-cloning](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning)
- [Blog de Kyutai sobre Pocket TTS](https://kyutai.org/blog/2026-01-13-pocket-tts)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
- [PR de llama.cpp para voces sin clonación](https://github.com/ggml-org/llama.cpp/pull/31429)
- [Voces de Kyutai: kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices)
- [Paper arXiv:2509.06926](https://arxiv.org/abs/2509.06926)
