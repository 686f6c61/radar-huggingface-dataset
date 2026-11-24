# loom-ai-org/pocket-tts-2m-loom

## Resumen

Pocket TTS 2M (English) es un modelo text-to-speech en ingles distribuido por loom-ai-org como exportacion GGUF del modelo base `kyutai/pocket-tts`. Se trata de la destilacion de 2 millones de parametros de Pocket TTS de Kyutai, afinada con reward fine-tuning (publicada en octubre de 2026), que combina un modelo de lenguaje de flujo de aproximadamente 0,9 M de parametros que opera sobre latentes del codec Mimi con un decodificador de aproximadamente 1,0 M de parametros. El total real de parametros en safetensors es de 2.053.653.

El modelo resuelve la sintesis de voz a partir de texto sin necesidad de fonemizador: codifica el texto por si mismo e incorpora una voz integrada (`alba`), ademas de otras 26 voces empaquetadas como ficheros de voz independientes bajo `voices/`. Su interes practico reside en el tamano extremadamente reducido (fichero GGUF unico y autodescriptivo, repo de 0,0 GB) y en que puede ejecutarse con el runtime `loom-py-rt` en entornos muy limitados, a costa de una calidad inferior a la del modelo completo.

La relevancia actual es doble: por un lado, demuestra la viabilidad de TTS de calidad aceptable en el rango de 2 M de parametros; por otro, el formato de exportacion de loom.cpp (GGUF con topologias de grafo, tokenizador y driver embebidos) simplifica el despliegue. La licencia es CC-BY-4.0, heredada del modelo base, aunque las licencias de las grabaciones de cada voz son independientes y dos de ellas son no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (~0,9 M parametros) sobre latentes del codec Mimi + decodificador (~1,0 M parametros) |
| Parametros totales | 2.053.653 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y otras precisiones cuantizadas desde F32 (el repo contiene mas de una precision; no se detallan los esquemas concretos) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (fichero autodescriptivo con grafo, tokenizador y driver embebidos) |
| Frecuencia de muestreo de salida | 24.000 Hz (debe pasarse como `sample_rate=24000`) |
| Voces incluidas | 1 integrada (`alba`) + 26 ficheros de voz en `voices/` |
| Runtime | loom-py-rt (PyPI), motor loom.cpp |

## Arquitectura y entrenamiento

El modelo es una destilacion de 2 M de parametros del Pocket TTS de Kyutai, con reward fine-tuning, publicada en octubre de 2026. La arquitectura combina un modelo de lenguaje de flujo de aproximadamente 0,9 M de parametros que genera latentes del codec neuronal Mimi con un decodificador de aproximadamente 1,0 M de parametros que reconstruye la forma de onda. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF o reward fine-tuning mas alla de su mencion en la model card.

La innovacion tecnica principal es la exportacion a loom.cpp: un unico fichero GGUF autodescriptivo que transporta las topologias de grafo, el tokenizador y el script del driver, generado con loom-exporter. El modelo codifica el texto directamente, sin fonemizador, y las voces se representan como ficheros de estado del modelo tras escuchar a un hablante, sellados con una huella de estos pesos concretos, de modo que solo son compatibles con esta variante de 2 M. El muestreo es estocastico por defecto, con temperatura 0,3 del propio checkpoint, por lo que dos llamadas producen resultados distintos.

## Capacidades

- Sintesis de texto a voz en ingles a 24 kHz, con salida en forma de onda reproducible y guardable en WAV.
- Codificacion de texto integrada: no requiere fonemizador externo.
- Voz integrada por defecto (`alba`) y seleccion de voz mediante el parametro `voice=` entre 26 ficheros adicionales (`marius`, `jane`, `cosette`, etc.).
- Generacion en streaming: `model.text2speech.stream(...)` devuelve la audio por piezas cortadas por el driver del modelo; concatenadas equivalen a la forma de onda de `infer` (`stream.exact`).
- Aceptacion de ficheros de voz propios mediante ruta a un fichero de voz compatible.
- Acceso al driver embebido mediante `model.infer(...)` y `model.driver_source`, que documenta todos los argumentos aceptados.
- No soporta clonacion de voz desde una grabacion: requiere el codificador Mimi, que esta exportacion no incluye.
- No dispone de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente TTS.

## Casos de uso

- Narracion de articulos y blogs: el modelo convierte texto en audio en ingles a 24 kHz con una voz consistente (`alba` o cualquiera de las 26 adicionales), adecuado para generar versiones en audio de contenido escrito en pipelines por lotes.
- Asistentes de voz embebidos: con 2 M de parametros y un unico GGUF, puede desplegarse en dispositivos con recursos muy limitados donde un TTS de mayor tamano no cabe, manteniendo una latencia baja por la generacion en streaming.
- Generacion de avisos y notificaciones habladas: la API `infer` produce un WAV directamente a partir de una cadena corta, lo que permite sintetizar mensajes dinamicos en aplicaciones de accesibilidad o domotica.
- Prototipado rapido de interfaces de voz: el runtime `loom-py-rt` con `pip install` y una llamada a `from_pretrained` permite integrar TTS en un prototipo Python en minutos, sin dependencias de fonemizacion.
- Reproduccion en tiempo real por piezas: `text2speech.stream` entrega la audio troceada segun el driver, de modo que cada pieza puede reproducirse a medida que llega, util en lectores de pantalla o kioscos interactivos.
- Evaluacion comparativa de voces: los 26 ficheros de voz del repo permiten probar distintos timbres sobre el mismo texto para elegir el mas adecuado a una marca o producto, teniendo en cuenta la licencia de cada grabacion.
- Educacion de idiomas: al estar limitado al ingles, sirve para practicar pronunciacion y comprension auditiva con distintas voces, aunque no sustituye a un TTS de mayor calidad para material comercial exigente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.053.653 parametros, el fichero F32 ocupa del orden de 8 MB en pesos y las versiones cuantizadas menos, por lo que la huella de memoria es minima.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna es sobradamente suficiente.
- Cabe en GPU consumer: si, en cualquier GPU con unos pocos cientos de MB de memoria libre; tambien es viable en CPU.
- Opciones de despliegue: runtime `loom-py` (`loom-py-rt` en PyPI, con extra `[hub]`) sobre el motor loom.cpp; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; la generacion en streaming permite reproducir la audio por piezas a medida que se produce.
- Almacenamiento: el repo ocupa 0,0 GB segun Hugging Face, lo que confirma el reducido tamano de los artefactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pocket-tts-2m-loom (este) | 2.053.653 | no disponible | en | cc-by-4.0 | GGUF (loom.cpp) | Destilacion 2M con reward fine-tuning; 1 voz integrada + 26 ficheros |
| kyutai/pocket-tts (base) | no disponible | no disponible | en | no disponible en la informacion | no disponible | Modelo original de Kyutai del que se destila esta variante |
| pocket-tts-loom (modelo completo) | no disponible | no disponible | en | no disponible en la informacion | GGUF (loom.cpp) | Version completa del mismo export; mayor calidad a costa de tamano |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Se aplican las restricciones de uso de Kyutai: prohibe, entre otras cosas, la suplantacion o clonacion de voz sin consentimiento explicito y licito, y presentar la audio generada como grabacion genuina de una persona real. Estas restricciones acompanan a los pesos.
- Es un modelo destilado: sacrifica calidad frente al modelo completo `pocket-tts-loom` a cambio de tamano.
- Solo admite ingles; no hay soporte multilingue.
- Una sola voz integrada (`alba`); las otras 26 son ficheros de voz que deben descargarse del repo la primera vez que se usan.
- Las licencias de las voces corresponden a las grabaciones, no al modelo: `cosette` y `jean` son CC-BY-NC-4.0 (no comerciales), y `daan`, `juergen` y `rafael` no tienen licencia declarada por Kyutai. Las voces CC-BY requieren atribucion a su dataset o hablante de origen.
- No es posible clonar una voz a partir de una grabacion porque falta el codificador Mimi en esta exportacion.
- El muestreo es estocastico por defecto (temperatura 0,3), por lo que dos llamadas con la misma entrada producen audios distintos.
- Riesgo de alucinacion y de pronunciacion incorrecta en textos con nombres propios, siglas o terminos poco frecuentes, propio de un modelo de este tamano.
- Debe pasarse `sample_rate=24000` de forma explicita cuando el GGUF no lo declare; una tasa incorrecta no provoca error, sino reproduccion a velocidad equivocada.
- Los ficheros de voz estan sellados con la huella de estos pesos: no son intercambiables con los de otras variantes de Pocket TTS.
- No se detallan los esquemas de cuantizacion disponibles ni sus efectos sobre la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/pocket-tts-2m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Modelo completo exportado: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Herramienta loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
