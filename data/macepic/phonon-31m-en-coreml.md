# MacEpic/phonon-31m-en-coreml

## Resumen

Phonon 31M English Core ML es la exportación a Core ML del modelo de síntesis de voz Phonon 31M English de Gradium, empaquetada por MacEpic para su uso en hardware de Apple (macOS 15 o iOS 18 sobre silicio de Apple). No se trata de un modelo nuevo ni de un trabajo propio de MacEpic: es una copia sin modificar del artefacto `phonon-31m-en-coreml.zip` publicado en la release v0.6.0 del runtime xn-ptts, hospedada en Hugging Face con una revisión fija para que la aplicación TextSniper pueda descargarla de forma reproducible.

El modelo subyacente es un sistema de text-to-speech de 31 millones de parámetros, muy compacto, entrenado por Gradium para inglés y distribuido con 37 voces inglesas del repositorio `gradium/phonon-voices`. Su relevancia reside en dos factores: por un lado, el tamaño reducido (31M de parámetros, repo de 0,1 GB) lo hace apto para inferencia local en dispositivos de consumo; por otro, el empaquetado Core ML permite ejecutarlo de forma nativa en Apple silicon sin depender de frameworks Python.

La ficha se centra en esta variante Core ML, pero conviene tener presente que las capacidades de síntesis, las voces y la licencia provienen del modelo original de Gradium. La información disponible no incluye detalles sobre la arquitectura interna del modelo base, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de TTS de Gradium; el paquete Core ML contiene programas `flow-c414-t1`, `flow-c414-t48` y `mimi-c266`) |
| Parametros totales | 31M (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete se distribuye como artefacto Core ML ya exportado; no se documentan variantes de cuantización) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`mlpackage`), `host.safetensors`, `tokenizer.json`, `bundle.json` con hashes SHA-256 |
| Voces | 37 voces inglesas (`gradium/phonon-voices@da6c9ec`) |
| Modelo base | `gradium/phonon-31m-en@8c64b55` |
| Runtime | xn-ptts v0.6.0 (paquete Swift `ptts`, módulo `PhononTTS`) |
| Plataformas | macOS 15 o iOS 18 sobre Apple silicon |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `gradium/phonon-31m-en` ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). La model card de esta variante Core ML no describe la arquitectura del sintetizador; únicamente documenta el empaquetado.

Lo que sí se detalla es la composición del artefacto Core ML. El paquete incluye tres programas Core ML (`flow-c414-t1.mlpackage`, `flow-c414-t48.mlpackage` y `mimi-c266.mlpackage`), tensores del lado del host en `host.safetensors`, el tokenizer en `tokenizer.json`, un manifiesto `bundle.json` con el tamaño y el SHA-256 de cada fichero junto con las dimensiones del modelo, y un `source.json` que fija las revisiones exactas del modelo base y de las voces. El runtime xn-ptts, según la model card, se construye sobre el Pocket TTS de Kyutai. Los nombres de los programas sugieren componentes de tipo flow matching y un códec Mimi, pero la información proporcionada no confirma detalles adicionales sobre su función.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- 37 voces inglesas predefinidas incluidas en el paquete (`voices/`).
- Ejecución local en Apple silicon mediante Core ML, sin dependencia de Python.
- Integración nativa en aplicaciones Swift a través del paquete `ptts` (módulo `PhononTTS`), con API asíncrona de descarga y carga del modelo.
- Verificación de integridad de la descarga: `download(from:)` lee `bundle.json` y comprueba tamaño y SHA-256 de cada fichero.
- Reproducibilidad mediante revisión fija y `source.json` con las revisiones exactas de los repositorios de origen.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento; no disponibles.

## Casos de uso

- Lectura de texto en pantalla en aplicaciones macOS: integración en herramientas como TextSniper para convertir texto capturado de la pantalla en audio, aprovechando el empaquetado Core ML y la descarga con revisión fija.
- Accesibilidad en apps iOS: incorporación de un sintetizador local de 31M de parámetros en aplicaciones de lectura para personas con discapacidad visual, sin enviar texto a servidores externos.
- Asistentes de voz embebidos en apps nativas: uso del módulo `PhononTTS` en Swift para generar respuestas habladas en inglés dentro de un asistente, con inferencia en el dispositivo.
- Aprendizaje de idiomas: reproducción de frases en inglés con distintas voces (37 disponibles) para practicar comprensión auditiva en una app educativa.
- Prototipado rápido de interfaces de voz: gracias al tamaño reducido (repo de 0,1 GB) y a la API de descarga con verificación de hashes, es viable iterar en demos y pruebas de integración en macOS/iOS.
- Generación de audio para contenido en pipelines locales: narración de textos en inglés en herramientas de productividad o edición que ya operan en el ecosistema Apple, sin infraestructura de servidor.
- Distribución reproducible en producción: el uso de `bundle.json` con SHA-256 y de `source.json` con revisiones fijas permite auditar y fijar la versión del modelo en despliegues de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Apple silicon exclusivamente (macOS 15 o iOS 18 según la model card); no se contempla ejecución en GPU NVIDIA ni en CPU x86 con este paquete.
- VRAM/unificada estimada: no disponible. El tamaño del repo es de 0,1 GB, pero no se documenta el consumo en memoria durante la inferencia.
- GPU recomendadas: no aplica en el sentido habitual; el modelo se ejecuta mediante Core ML en el hardware de Apple silicon (Neural Engine/GPU integrada), sin modelos concretos especificados.
- ¿Cabe en hardware de consumo? Sí, está diseñado para dispositivos Apple de consumo con macOS 15 o iOS 18, aunque no se publican cifras de latencia ni de memoria.
- Opciones de despliegue: paquete Swift `ptts` v0.6.0 (módulo `PhononTTS`) con `PhononModels.download(from:)` y `Phonon.load(models:language:)`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MacEpic/phonon-31m-en-coreml (esta ficha) | 31M | Inglés | Core ML | Apache 2.0 | Exportación Core ML del modelo de Gradium; 37 voces; runtime xn-ptts |
| palshub/phonon-31m-en-coreml | no disponible | no disponible | Core ML (por el nombre) | no disponible | Otra copia del mismo tipo de exportación; sin datos adicionales en la búsqueda |
| TheStageAI/phonon-31m-en | no disponible | no disponible | no disponible | no disponible | Variante del modelo base de Gradium; sin datos adicionales en la búsqueda |
| gradium/phonon-31m-en (modelo base) | 31M | Inglés | no disponible | Apache 2.0 (según esta ficha) | Origen del que deriva esta exportación |

No se dispone de información suficiente sobre modelos alternativos de TTS del mismo tamaño para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- Exclusivo para Apple silicon con macOS 15 o iOS 18; no es portable a otras plataformas ni a GPU NVIDIA.
- No es trabajo propio de MacEpic: es una copia sin modificar del artefacto de la release v0.6.0 de xn-ptts; las cuestiones sobre calidad del modelo deben dirigirse al modelo base de Gradium.
- No se documentan datos sobre sesgos, calidad de síntesis, robustez ante texto ruidoso ni riesgo de alucinación (entendido como pronunciación incorrecta o artefactos de audio).
- No se especifican límites de longitud de texto de entrada ni de contexto; no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las voces en sus repositorios originales, ya que esta ficha se basa en la model card de la copia.
- Dependencia del runtime xn-ptts v0.6.0 y de su API; cambios de versión podrían afectar a la compatibilidad del paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal sobre su validación por la comunidad.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/MacEpic/phonon-31m-en-coreml
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Release xn-ptts v0.6.0: https://github.com/gradium-ai/xn-ptts/releases/tag/v0.6.0
- Gradium: https://gradium.ai
- Copia alternativa en Hugging Face: https://huggingface.co/palshub/phonon-31m-en-coreml
- Variante en Hugging Face: https://huggingface.co/TheStageAI/phonon-31m-en
