# JonJonesBR/lylyreader-tts-models

## Resumen

El repositorio `JonJonesBR/lylyreader-tts-models` no contiene un modelo de lenguaje, sino un paquete de distribución para un sistema de síntesis de voz (TTS) neural local, diseñado para la aplicación Android LylyReader, que convierte libros digitales en audiolibros. El paquete principal es un bundle oficial de la organización k2-fsa (sherpa-onnx) que incluye el modelo Kokoro-82M cuantizado a int8, junto con 53 voces, lexicones y datos de fonemización para inglés, chino y portugués de Brasil.

Kokoro-82M es un modelo de TTS de 82 millones de parámetros, de código abierto, que se distribuye en formato ONNX optimizado para inferencia en dispositivos con recursos limitados, como teléfonos Android. La relevancia de este repositorio radica en que centraliza la infraestructura de modelos para una aplicación de audiolibros sin conexión, permitiendo descargas verificadas por hash y un mecanismo de actualización controlado por el autor. El proyecto está en fase inicial (creado en septiembre de 2026) y planea incorporar en el futuro voces adicionales basadas en MMS-TTS de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (TTS basado en transformer, exportado a ONNX) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (TTS, no procesa contexto largo; entrada de texto arbitraria) |
| Tipos de cuantizacion | int8 (model.int8.onnx) |
| Idiomas soportados | ingles (en), chino (zh), portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 (segun la model card; en HuggingFace figura como "no disponible") |
| Formato de pesos | ONNX (sherpa-onnx), empaquetado en tarball (tar.bz2) |

## Arquitectura y entrenamiento

Kokoro-82M es un modelo de síntesis de voz de 82 millones de parámetros, originalmente desarrollado por la comunidad (hexgrad) y adaptado por k2-fsa para su uso con el motor sherpa-onnx. La arquitectura interna no se detalla en la información proporcionada, pero se trata de un modelo de tipo transformer diseñado para generar audio a partir de texto, con un sistema de voces embebidas (53 voces en el bundle). El modelo se distribuye cuantizado a int8, lo que reduce su tamaño a aproximadamente 114 MB, permitiendo su ejecución en CPU y en dispositivos móviles.

Los datos de entrenamiento no están disponibles en la documentación del repositorio. El bundle incluye lexicones para inglés (US y GB), chino y datos completos de espeak-ng para fonemización, lo que sugiere que el entrenamiento cubrió estos idiomas. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que es un modelo de TTS y no un modelo de lenguaje conversacional.

## Capacidades

- Sintesis de voz neural de alta calidad a partir de texto, con 53 voces predefinidas (incluyendo voces en portugues de Brasil: pf_dora, pm_alex, pm_santa).
- Soporte multilingue para ingles (variantes US y GB), chino y portugues de Brasil, mediante fonemizacion con espeak-ng.
- Inferencia local sin conexion, optimizada para CPU y dispositivos moviles gracias a la cuantizacion int8 y al formato ONNX.
- Integracion con el motor sherpa-onnx, que permite decodificacion eficiente y bajo consumo de recursos.
- No incluye capacidades de vision, tool calling ni razonamiento multi-paso, al ser un modelo puramente de TTS.

## Casos de uso

- Audiolibros en Android: la aplicacion LylyReader utiliza este bundle para narrar libros digitales en voz alta, descargando el modelo en la primera ejecucion y validando su integridad mediante sha256. El modelo es adecuado porque es ligero (131 MB) y funciona sin conexion.
- Narracion de documentos y articulos: el modelo puede integrarse en aplicaciones de lectura de texto para generar audio de articulos, PDFs o libros electronicos, con voces naturales en varios idiomas.
- Accesibilidad para personas con discapacidad visual: al ejecutarse localmente, permite convertir cualquier texto en audio sin depender de servicios en la nube, garantizando privacidad y disponibilidad.
- Asistentes de lectura en dispositivos embebidos: gracias a su tamano reducido y cuantizacion int8, puede desplegarse en Raspberry Pi, routers o dispositivos IoT para generar voz en tiempo real.
- Educacion y aprendizaje de idiomas: las voces en portugues, ingles y chino permiten crear materiales de pronunciacion o practica de lectura en estos idiomas.
- Prototipado de aplicaciones TTS: al ser un bundle autocontenido con licencia Apache-2.0, los desarrolladores pueden usarlo como base para experimentar con sintesis de voz sin necesidad de entrenar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de calidad de voz (MOS), velocidad de inferencia ni comparaciones con otros modelos TTS en el repositorio.

## Requisitos de hardware

- VRAM estimada: no requiere GPU dedicada; el modelo int8 de 114 MB puede ejecutarse en CPU.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU y dispositivos moviles.
- Compatibilidad con GPU de consumo: no es necesario; funciona en cualquier CPU moderna, incluidos telefonos Android.
- Opciones de despliegue: sherpa-onnx (motor de inferencia), integrable en aplicaciones Android, iOS, desktop y servidores. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles. Al ser un modelo de 82M en int8, se espera una latencia baja en CPU, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en el repositorio. Como referencia general, otros modelos TTS de tamano similar incluyen:

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| Kokoro-82M (este bundle) | 82M | en, zh, pt-BR | Apache-2.0 | ONNX int8 |
| MMS-TTS (Meta) | ~100M | 1100+ idiomas | CC-BY-NC 4.0 | PyTorch / ONNX |
| VITS (coqui) | ~30M | multilenguaje | MIT | PyTorch |

La comparacion es orientativa; no se han verificado los datos de MMS-TTS y VITS en este contexto. El bundle de Kokoro destaca por su cuantizacion int8 y su integracion directa con sherpa-onnx, lo que facilita su despliegue en moviles.

## Limitaciones y advertencias

- El modelo solo incluye voces y lexicones para ingles, chino y portugues de Brasil; otros idiomas no estan soportados en este bundle.
- La calidad de la sintesis puede variar segun el texto de entrada, especialmente con nombres propios, siglas o palabras extranjeras no cubiertas por los lexicones.
- Al ser un modelo de TTS, no tiene capacidad de comprension semantica ni de generacion de texto; solo convierte texto a voz.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los pesos del modelo original (Kokoro) mantengan la misma licencia; la model card indica Apache-2.0 para el bundle.
- El repositorio esta en fase inicial (0 descargas, 0 likes) y el autor planea anadir mas voces en el futuro; la estabilidad del bundle no esta garantizada.
- No se proporcionan garantias de rendimiento en dispositivos de gama baja; la inferencia en CPU puede ser lenta en hardware antiguo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JonJonesBR/lylyreader-tts-models
- Repositorio de la aplicacion LylyReader (Android): https://github.com/JonJonesBR/LylyReader-Android
- Fuente original del bundle (k2-fsa/sherpa-onnx): https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-int8-multi-lang-v1_0.tar.bz2
- Directorio de modelos TTS en HuggingFace: https://huggingface.co/models?pipeline_tag=text-to-speech
