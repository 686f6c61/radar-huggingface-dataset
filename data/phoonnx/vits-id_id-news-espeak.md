# Phoonnx/vits-id_id-news-espeak

## Resumen

`vits-id_id-news-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el autor Phoonnx como empaquetado ONNX del modelo original `giganticlab/piper-id_ID-news_tts-medium` de giganticlab. Está diseñado para convertir texto en indonesio (`id-ID`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. El modelo se distribuye bajo licencia MIT y está pensado para ejecutarse a través de la librería Python `phoonnx`, que actúa como capa de inferencia sobre el grafo ONNX.

El modelo resuelve un problema acotado: proporcionar una voz TTS en indonesio lista para integrarse en aplicaciones locales o embebidas, sin depender de servicios en la nube. Su relevancia práctica radica en el ecosistema de despliegue: al ser un artefacto ONNX de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB), puede ejecutarse en CPU y en entornos con recursos limitados, y encaja directamente en el stack de asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje generalista, sino un componente especializado de un solo idioma y una sola tarea.

La información disponible es escasa: la model card describe la procedencia, el uso y el front-end de texto, pero no publica métricas de calidad, datos de entrenamiento, ni detalles sobre el corpus original. Cualquier dato no presente en la documentación del autor se marca como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (empaquetado ONNX; no se documentan variantes) |
| Idiomas soportados | indonesio (`id-ID`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un predictor de duración y alineamiento, un decodificador generativo y un discriminador adversarial durante el entrenamiento. El modelo empaquetado aquí proviene de `giganticlab/piper-id_ID-news_tts-medium`, una variante de la familia Piper orientada a voz de noticias en indonesio, y se redistribuye como grafo ONNX para la librería `phoonnx`. La entrada no es texto crudo, sino fonemas en alfabeto IPA producidos por espeak-ng; el front-end de texto se delega a la librería `scriptconv`, que normaliza el texto y aplica el fonemizador `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`.

No se dispone de información sobre el número de horas de audio de entrenamiento, la composición del corpus, el uso de RLHF/DPO (no aplica a un modelo TTS) ni innovaciones técnicas específicas más allá de las propias de VITS. La model card únicamente indica la procedencia (giganticlab) y que la voz se etiqueta como "medium" en el nombre del modelo upstream. La calidad de pronunciación depende críticamente del fonemizador: la propia documentación advierte que la implementación `espyak` (port de espeak-ng en Python) puede diferir de espeak-ng y producir errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en indonesio (`id-ID`), con salida en formato WAV mediante `voice.synthesize_wav`.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciación si se construyen los fonemas manualmente.
- Integración con el asistente OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable por configuración (`mycroft.conf`).
- Ejecución en Python mediante `phoonnx.model_manager.TTSModelManager`, con carga y mezcla de voces por defecto.
- Ejecución en navegador mediante `phoonnx.js`, con demo en vivo disponible en `tigregotico.pt/demo`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.
- Capacidad multilingüe: limitada a un único idioma (indonesio); no se documentan otras voces en este artefacto.

## Casos de uso

- **Locución de noticias y boletines automatizados**: el modelo está entrenado sobre una voz de noticias en indonesio (`id-ID_news`), por lo que encaja en la generación de audio para titulares, resúmenes y boletines informativos, con una prosodia orientada a ese registro.
- **Asistentes de voz locales con OVOS**: mediante `ovos-tts-plugin-phoonnx` se puede configurar la voz en `mycroft.conf` y obtener respuestas habladas en indonesio sin depender de APIs externas, lo que reduce latencia y coste por petición.
- **Lectura de contenido web o documentos en indonesio**: el pipeline `phoonnx` + `scriptconv` normaliza el texto antes de fonemizarlo, lo que permite convertir artículos, correos o documentación en audio para aplicaciones de accesibilidad.
- **Sistemas embebidos y dispositivos con recursos limitados**: al ser un artefacto ONNX de aproximadamente 0,1 GB, puede ejecutarse en CPU y en hardware modesto, lo que lo hace adecuado para Raspberry Pi o dispositivos IoT que necesiten TTS en indonesio.
- **Generación de audio en el navegador**: `phoonnx.js` permite ejecutar la voz en cliente sin backend, útil para demos interactivas, prototipos de accesibilidad web o aplicaciones que deban funcionar sin conexión a un servidor.
- **Pruebas de pronunciación y control fonético**: al aceptar fonemas IPA como entrada, se puede usar para experimentar con pronunciaciones concretas, comparar el fonemizador espeak-ng frente a espyak y validar correcciones léxicas antes de desplegar una voz en producción.
- **Pipelines de generación de audio por lotes**: la API de `phoonnx` permite sintetizar múltiples frases a WAV en un script, lo que sirve para pregenerar locuciones de un catálogo o de un corpus de audio sintético en indonesio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad subjetiva (MOS), inteligibilidad, tasa de error de palabras ni comparaciones con otras voces TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo TTS empaquetado en ONNX de aproximadamente 0,1 GB, es esperable que quepa en memoria de CPU y en GPU con muy poca VRAM, pero no se documentan cifras.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna debería poder ejecutarlo, pero el autor no especifica requisitos.
- ¿Cabe en GPU consumer? No se documenta explícitamente; por el tamaño del repositorio (0,1 GB) es altamente probable que sí, aunque no se confirma en la información disponible.
- Opciones de despliegue: `phoonnx` (Python, con `TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` para navegador. Requiere espeak-ng instalado (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` que aporta el port espyak.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo real ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-id_id-news-espeak` (este) | VITS | indonesio (`id-ID`) | MIT | ONNX | ~0,1 GB | Empaquetado para `phoonnx`, entrada por fonemas espeak |
| `giganticlab/piper-id_ID-news_tts-medium` | VITS (Piper) | indonesio (`id-ID`) | no disponible en esta ficha | Piper | no disponible | Modelo upstream del que deriva este artefacto |
| Otras voces de la colección `Phoonnx/vits` | VITS | varios idiomas | MIT (según colección) | ONNX | variable | Mismo pipeline de empaquetado, distintos idiomas y voces |

La comparación con alternativas de la misma categoría se limita al modelo upstream y a otras voces de la colección VITS de Phoonnx; no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- **Un solo idioma**: el modelo solo sintetiza indonesio (`id-ID`); no se documenta soporte para otros idiomas ni cambio de voz.
- **Dependencia del fonemizador**: la entrada son fonemas de espeak-ng. Si se usa el port espyak (`phoonnx[espeak]`), la propia documentación advierte que algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- **Riesgo de pronunciación incorrecta**: al no incluir un lexicón o normalizador específico más allá de `scriptconv`, palabras extranjeras, siglas, números y nombres propios pueden fonemizarse de forma incorrecta.
- **Sin métricas de calidad publicadas**: no hay MOS, inteligibilidad ni comparativas que permitan estimar la calidad frente a otras voces TTS en producción.
- **Sesgos**: no se documentan sesgos de hablante, acento o género; la voz deriva de un corpus de noticias y puede reflejar el estilo y las características de ese material.
- **Licencia**: MIT, lo que permite uso comercial y modificación, pero la model card remite a los términos del release upstream, que no se detallan en la información disponible.
- **Madurez y adopción**: el repositorio registra 20 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso muy limitado y poca validación comunitaria.
- **Fecha de creación anómala**: la model card indica fechas de creación y actualización en 2026, dato que conviene verificar antes de citarlo.
- **No apto para tareas de lenguaje**: no es un modelo de razonamiento, código, matemáticas ni agentes; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-id_id-news-espeak
- Modelo upstream: https://huggingface.co/giganticlab/piper-id_ID-news_tts-medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio `phoonnx`: https://github.com/TigreGotico/phoonnx
- Repositorio `scriptconv`: https://github.com/TigreGotico/scriptconv
- Repositorio `phoonnx.js`: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
