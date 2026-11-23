# Prahaladha/hima-tts-web

## Resumen

Hima TTS Web es un paquete de pesos empaquetados para su ejecución en el navegador del modelo de síntesis de voz Hima, desarrollado por Prahaladha. No se trata de un modelo nuevo, sino de una redistribución optimizada de los pesos de `Prahaladha/hima-tts-nano-te` (telugu) y `Prahaladha/hima-tts-nano-hi` (hindi) en cuantización de 8 bits, comprimidos sin pérdida en fragmentos gzip de aproximadamente 90 MB por idioma en lugar de 124 MB, con el decodificador de audio compartido entre ambos idiomas.

El repositorio está pensado para alimentar la aplicación web https://hima-tts.vercel.app, que ejecuta la síntesis de voz íntegramente en el navegador del usuario mediante WebAssembly. La página descarga los fragmentos una sola vez, reconstruye cada fichero de modelo, verifica su hash SHA-256 y lo conserva en el dispositivo, de modo que las inferencias posteriores no requieren red ni servidor.

Su relevancia radica en el despliegue de TTS neurals en el cliente sin backend: privacidad total del audio procesado, latencia independiente del ancho de banda y funcionamiento offline tras la primera carga. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (pesos empaquetados en gzip sin pérdida) |
| Idiomas soportados | telugu, hindi |
| Licencia | MIT |
| Formato de pesos | fragmentos gzip que reconstruyen los ficheros del modelo original; formato interno de los pesos no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo subyacente (transformer, difusión acústica, VITS u otra familia). Lo que sí se describe es el proceso de empaquetado: los pesos de los dos modelos nano en 8 bits se dividen en piezas comprimidas con gzip, se comparte un único decodificador de audio entre telugu e hindi y el cliente web reconstruye cada fichero y valida su integridad mediante SHA-256 antes de cachearlo. La herramienta de empaquetado (`tools/pack.py`) está publicada en el repositorio `Prahaladha-Reddy/hima-tts-cpp`.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención.

## Capacidades

- Síntesis de voz (text-to-speech) para telugu e hindi.
- Ejecución íntegra en el navegador mediante WebAssembly, sin backend.
- Caché persistente en el dispositivo con verificación de integridad SHA-256.
- Decodificador de audio compartido entre ambos idiomas, lo que reduce el peso total descargado.
- Funcionamiento offline tras la primera descarga de los fragmentos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de razonamiento extendido.

## Casos de uso

- Lectura de contenido web en telugu e hindi: integrar el paquete en una extensión o página que convierta artículos en audio sin enviar el texto a un servidor, aprovechando la ejecución local en WebAssembly.
- Accesibilidad para usuarios con discapacidad visual: un lector de pantalla basado en navegador puede sintetizar la interfaz y el contenido en estos idiomas manteniendo la privacidad del texto leído.
- Aplicaciones educativas offline: escuelas con conectividad limitada pueden distribuir la página una vez y ofrecer narración en telugu e hindi en dispositivos sin red posterior.
- Asistentes de voz en aplicaciones web: un chatbot o formulario puede responder con voz generada en el cliente, eliminando el coste y la latencia de un servicio TTS remoto.
- Prototipado rápido de interfaces de voz: el tamaño contenido (unos 90 MB por idioma) y la licencia MIT permiten experimentar en demos y hackathons sin infraestructura.
- Audioguías o contenido turístico multilingüe: servir narraciones pregrabadas o generadas al vuelo en telugu e hindi dentro de una PWA, con la primera carga como único requisito de red.
- Investigación en TTS en el edge: servir como referencia reproducible para estudiar el rendimiento de modelos de síntesis de voz cuantizados a 8 bits ejecutados en WebAssembly.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el escenario principal, ya que la inferencia ocurre en el navegador sobre CPU (WebAssembly); no se especifica el consumo de memoria en el cliente.
- GPU: no se documentan requisitos de GPU para el despliegue web; para ejecutar los modelos originales en servidor no se dispone de datos de VRAM.
- GPU de consumo: no disponible.
- Despliegue: WebAssembly en navegador (aplicación de referencia en Vercel); el repositorio `hima-tts-cpp` sugiere una implementación en C++ compilable a WASM. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del dispositivo del usuario y del tamaño de los fragmentos descargados (unos 90 MB por idioma más el decodificador compartido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Hima TTS Web (este) | no disponible (8 bits) | no disponible | telugu, hindi | MIT | WebAssembly en navegador |
| Prahaladha/hima-tts-nano-te | no disponible (8 bits) | no disponible | telugu | no disponible | servidor/local |
| Prahaladha/hima-tts-nano-hi | no disponible (8 bits) | no disponible | hindi | no disponible | servidor/local |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada; los únicos términos de comparación son los propios modelos originales de los que deriva este paquete.

## Limitaciones y advertencias

- Solo cubre telugu e hindi; no hay soporte documentado de otros idiomas, incluido el castellano.
- La cuantización a 8 bits puede degradar la calidad de la voz frente a los pesos originales en precisión completa; no se han publicado evaluaciones subjetivas (MOS) que lo cuantifiquen.
- El repositorio no incluye la arquitectura ni los detalles de entrenamiento, lo que dificulta auditar sesgos o riesgos de alucinación acústica (pronunciación incorrecta, artefactos).
- El rendimiento depende del navegador y del dispositivo del usuario; no se documentan requisitos mínimos ni tiempos de carga.
- Aunque la licencia es MIT, conviene verificar la licencia de los modelos originales `hima-tts-nano-te` y `hima-tts-nano-hi`, ya que este repositorio solo empaqueta sus pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- No se especifican limitaciones de longitud de texto de entrada ni el comportamiento ante textos largos.

## Enlaces

- Hugging Face: https://huggingface.co/Prahaladha/hima-tts-web
- Modelo original telugu: https://huggingface.co/Prahaladha/hima-tts-nano-te
- Modelo original hindi: https://huggingface.co/Prahaladha/hima-tts-nano-hi
- Aplicación web: https://hima-tts.vercel.app
- Repositorio de código y herramienta de empaquetado: https://github.com/Prahaladha-Reddy/hima-tts-cpp
