# Phoonnx/vits-gl_es-celtia-hitz_center-cotovia

## Resumen

`vits-gl_es-celtia-hitz_center-cotovia` es un modelo de síntesis de voz (text-to-speech) en gallego desarrollado originalmente por el HiTZ Center (Universidad del País Vasco) y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo subyacente es `HiTZ/TTS-gl_celtia`, un sistema VITS entrenado sobre el corpus Celtia, y esta versión se distribuye lista para ejecutarse con la librería `phoonnx` en Python o como plugin de OVOS.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. El modelo trabaja exclusivamente con el idioma gallego (`gl-ES`) y acepta como entrada fonemas en el alfabeto Cotovia, normalizados mediante `scriptconv` con el fonemizador `CotoviaPhonemizer`.

El interés de esta ficha es doble: por un lado, documenta una alternativa open source (Apache 2.0) para TTS en gallego, un idioma con pocos recursos en el ecosistema de voz; por otro, muestra el patrón de empaquetado ONNX de Phoonnx para integrar modelos VITS en asistentes de voz como OVOS. El repositorio ocupa 0,1 GB y acumula 17 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, prior variacional + decodificador por flujos + discriminador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Libreria de inferencia | `phoonnx` |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra en un único modelo el codificador de texto, el prior variacional condicionado por texto, el decodificador generativo basado en flujos normalizadores y un discriminador entrenado de forma adversarial. Este diseño permite generar audio directamente desde texto sin necesidad de un vocoder externo, lo que simplifica el despliegue. El modelo original fue entrenado por el HiTZ Center sobre el corpus Celtia para el idioma gallego, aunque la información proporcionada no detalla el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de fine-tuning adicionales.

La versión publicada por Phoonnx no reentrena el modelo: lo convierte a formato ONNX y lo empaqueta con el front-end de texto necesario para su uso. El front-end utiliza `scriptconv` con el fonemizador `CotoviaPhonemizer` (módulo `scriptconv_copyleft.phonemizers.gl`, instalable mediante el extra `scriptconv[gl]`), que normaliza el texto y lo convierte a la representación fonémica que espera el modelo. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que VITS no emplea mecanismos de atención de largo alcance comparables a los de los LLM.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego a partir de texto plano.
- Conversión de texto a fonemas Cotovia mediante `scriptconv` y el fonemizador `CotoviaPhonemizer`.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución sobre pesos ONNX, lo que facilita el despliegue en entornos sin GPU dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No soporta visión, audio de entrada ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al gallego (`gl-ES`).

## Casos de uso

- **Asistentes de voz en gallego con OVOS**: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y se selecciona mediante configuración en `mycroft.conf`, lo que permite dotar de voz gallega a asistentes domésticos open source sin depender de servicios en la nube.
- **Lectura de contenido en gallego**: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando que el modelo acepta texto plano y realiza la fonemización automáticamente.
- **Sistemas de anuncios y avisos automatizados**: generación de mensajes de voz pregrabados para transporte público, aeropuertos o comercios en zonas gallegoparlantes, donde la latencia de síntesis es baja y el coste por inferencia es mínimo al ejecutarse en CPU con ONNX.
- **Prototipado de interfaces conversacionales**: desarrollo de demos y pruebas de concepto de interfaces de voz en gallego sin necesidad de contratar servicios de TTS comerciales, gracias a la licencia Apache 2.0 y al reducido tamaño del repositorio (0,1 GB).
- **Investigación en TTS de bajos recursos**: uso del modelo como línea base o punto de partida para experimentos de adaptación a otros idiomas o variedades dialectales del gallego, dado que la arquitectura VITS es bien conocida y el código de inferencia es abierto.
- **Integración en pipelines de accesibilidad web**: generación de audio bajo demanda para lectores de pantalla o aplicaciones de lectura de documentos en gallego, ejecutando el modelo en servidor o en local según los requisitos de privacidad.
- **Generación de audiolibros o pódcast automatizados**: síntesis por lotes de textos largos divididos en frases, ya que el modelo procesa entrada por frase y puede encadenarse para producir audio de mayor duración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al tratarse de un modelo VITS empaquetado en ONNX con un repositorio de 0,1 GB, es probable que la inferencia pueda ejecutarse en CPU, pero no se proporcionan cifras concretas de memoria.
- **GPU recomendadas**: no disponible. No se especifican GPU objetivo en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible. No se confirma ni descarta el soporte en tarjetas como RTX 4090, RTX 3090 o similares.
- **Opciones de despliegue**: `phoonnx` (Python) y `ovos-tts-plugin-phoonnx` (plugin para OVOS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a la colección de modelos VITS empaquetados por Phoonnx, pero no se detallan otros modelos de TTS en gallego ni sus métricas para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vits-gl_es-celtia-hitz_center-cotovia | no disponible | no aplica | Apache 2.0 | Hugging Face (Phoonnx) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Idioma único**: el modelo solo soporta gallego (`gl-ES`); no es adecuado para otros idiomas ni para mezcla de idiomas sin un front-end adicional.
- **Entrada fonémica**: aunque la API acepta texto plano, el modelo espera fonemas Cotovia generados por `scriptconv`; un texto mal normalizado o con caracteres no soportados puede producir una síntesis incorrecta.
- **Sesgos**: no se documentan sesgos conocidos, pero al entrenarse sobre el corpus Celtia, la voz y la prosodia pueden reflejar las características demográficas y dialectales de dicho corpus.
- **Riesgo de alucinación**: en TTS, el equivalente es la generación de audio ininteligible o prosodia anómala ante entradas fuera de distribución; no se han publicado evaluaciones al respecto.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del corpus Celtia subyacente, ya que la model card solo indica que el upstream declara Apache 2.0.
- **Madurez del ecosistema**: el modelo depende de `phoonnx` y `scriptconv`, librerías con versiones pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API en producción.
- **Sin benchmarks**: no hay métricas publicadas de calidad (MOS, WER, etc.), por lo que la evaluación debe realizarse empíricamente antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-gl_es-celtia-hitz_center-cotovia)
- [Modelo upstream HiTZ/TTS-gl_celtia](https://huggingface.co/HiTZ/TTS-gl_celtia)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
