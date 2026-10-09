# ExNihilus/qwen3-tts-reference-voices

## Resumen

ExNihilus/qwen3-tts-reference-voices no es un modelo de lenguaje ni un modelo TTS entrenado desde cero, sino un conjunto de activos de audio: veinte voces de referencia sintéticas (una femenina y una masculina en diez idiomas) generadas con Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign. El repositorio los publica bajo licencia CC0 1.0, lo que los sitúa en el dominio público, y su propósito declarado es servir como material de referencia para clonación de voz con Qwen3 TTS, VoxCPM2 y Chatterbox. El autor es el usuario ExNihilus y el artefacto se distribuye tanto en HuggingFace como en un repositorio de GitHub (exnihilus/subvoxpro-models).

El interés práctico de este repositorio deriva del modelo base que lo genera. Qwen3-TTS es la familia de modelos de síntesis de voz del equipo Qwen de Alibaba Cloud, con soporte para generación de habla en streaming, diseño de voz en lenguaje natural, clonación a partir de audio de referencia y control de estilo mediante instrucciones textuales. La variante VoiceDesign de 1,7B parámetros, muestreada a 12 Hz, es la que se ha empleado aquí para producir las veinte voces.

La relevancia inmediata es de tipo legal y operativo: disponer de voces de referencia liberadas como CC0 elimina la necesidad de capturar audio propio o de reutilizar muestras con derechos inciertos al montar un pipeline de clonación. Conviene señalar que el repositorio no contiene pesos, no tiene pipeline declarado y registra cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un recurso auxiliar recién publicado y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo: conjunto de 20 audios de referencia sintéticos. El modelo generador (Qwen3-TTS-12Hz-1.7B-VoiceDesign) usa modelado Dual-Track según la información pública del proyecto Qwen3-TTS |
| Parámetros totales | 1,7B en el modelo base (Qwen3-TTS-12Hz-1.7B-VoiceDesign); no aplicable al repositorio de voces |
| Parámetros activos | No aplicable (no es MoE; dato del modelo base no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Diez idiomas según la model card, sin especificar cuáles; una voz femenina y una masculina por idioma |
| Licencia | CC0 1.0 para las voces del repositorio; la licencia del modelo base no se detalla en la información disponible |
| Formato de pesos | No aplica: el repositorio contiene audio de referencia y metadatos (`voices.json`, `NOTICE.md`), no safetensors ni GGUF |
| Número de voces | 20 (10 idiomas x 2 géneros) |
| Tamaño del repositorio | 0,0 GB según HuggingFace |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no implica entrenamiento alguno. Se trata de un conjunto de veinte clips de audio sintético producidos por inferencia con Qwen3-TTS-12Hz-1.7B-VoiceDesign y acompañados de metadatos en `voices.json` y notas legales en `NOTICE.md`. El modelo base sí es un sistema TTS completo del equipo Qwen (Alibaba Cloud), presentado públicamente como una serie de modelos de generación de habla con soporte para clonación de voz, diseño de voz libre, generación de habla de alta calidad y control por lenguaje natural. La documentación pública de Qwen3-TTS menciona un modelado Dual-Track como mecanismo para alcanzar latencias de 97 ms y clonación a partir de tres segundos de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO sobre el modelo base. Tampoco se documenta en el repositorio de voces la receta exacta de generación (prompts de diseño de voz, semillas, parámetros de muestreo) más allá de la referencia a los ficheros de metadatos citados. Cualquier afirmación sobre la innovación técnica del modelo generador debe remitirse a la documentación oficial de Qwen3-TTS.

## Capacidades

- Aporta voces de referencia listas para usar en pipelines de clonación con Qwen3 TTS, VoxCPM2 y Chatterbox, sin necesidad de grabar locuciones propias.
- Cobertura de diez idiomas con una voz femenina y una masculina por idioma, útil para proyectos de localización multilingüe.
- Liberación en dominio público (CC0 1.0), lo que permite redistribución, modificación e integración comercial sin obligación de atribución.
- Generación de voz sintética frente a locuciones humanas, lo que reduce la exposición a derechos de imagen y a acuerdos de cesión de voz de personas reales.
- Al estar basadas en Qwen3-TTS-12Hz-1.7B-VoiceDesign, las muestras heredan el formato y las convenciones del modelo base para clonación y diseño de voz.
- No se declaran capacidades adicionales (tool calling, agentes, visión, audio de entrada) para este repositorio, ya que no es un modelo ejecutable.

## Casos de uso

- Doblaje y localización de vídeo multilingüe: las voces permiten mantener una identidad tímbrica coherente por género en diez idiomas, de modo que un mismo personaje suene consistente en cada doblaje sin contratar diez locutores distintos.
- Audiolibros y narración a escala: al ser veinte voces de dominio público, se pueden usar como referencia para clonar un narrador estable a lo largo de cientos de capítulos sin depender de una única sesión de grabación.
- Prototipado de asistentes de voz: antes de invertir en locuciones profesionales, se valida la experiencia conversacional con voces sintéticas CC0 y se descartan las que no encajen con la marca.
- Generación de datos sintéticos para entrenar o evaluar sistemas de reconocimiento de voz: al ser voces liberadas sin restricciones, se pueden distribuir los datos derivados junto con el conjunto de evaluación.
- Contenido accesible y lectura de documentos: conversión de artículos, informes o documentación técnica a audio con una voz neutra, sin las limitaciones de licencia habituales de las voces comerciales.
- Pruebas de regresión en pipelines TTS: usar las veinte voces como conjunto fijo de referencia permite comparar versiones del modelo base (Qwen3 TTS, VoxCPM2, Chatterbox) con entradas idénticas y detectar degradaciones de calidad o de similitud de timbre.
- Integración en herramientas de creación de contenido: al estar disponibles también en el repositorio de GitHub del autor, se pueden empaquetar en flujos de postproducción o en interfaces de diseño de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de similitud de hablante (por ejemplo, SIM-O o MOS), ni evaluaciones comparativas frente a otras voces de referencia. Los únicos datos numéricos presentes en la búsqueda web pertenecen al modelo base Qwen3-TTS y a su presentación pública: latencia de 97 ms, clonación a partir de tres segundos de audio y cobertura de diez idiomas. Estas cifras no han sido verificadas de forma independiente en la información proporcionada y no deben atribuirse al repositorio de voces.

## Requisitos de hardware

- El repositorio en sí no requiere GPU: son ficheros de audio y metadatos. El tamaño declarado es 0,0 GB, por lo que su almacenamiento es irrelevante.
- Para usar las voces como referencia hay que ejecutar el modelo de clonación correspondiente. Con Qwen3-TTS-12Hz-1.7B-VoiceDesign, el peso en memoria estimado por aritmética de parámetros es de aproximadamente 3,4 GB en fp16, 1,7 GB en int8 y 0,9 GB en int4, a lo que hay que sumar la caché de atención y el búfer de audio.
- Con esas cifras, la inferencia en fp16 debería caber en GPU de consumo con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) y, en cuantizaciones de 8 o 4 bits, en equipos con 4-6 GB de VRAM.
- Para despliegue en servidor con concurrencia alta se recomiendan A100, H100 o L40S; el repositorio no documenta opciones de despliegue específicas.
- Opciones de ejecución: las habituales del ecosistema TTS (PyTorch con los pesos de Qwen3-TTS, y los pipelines de VoxCPM2 y Chatterbox mencionados por el autor). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que estos motores están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles para este repositorio. La única referencia pública es la latencia de 97 ms atribuida al modelo base Qwen3-TTS, sin condiciones de medición detalladas.

## Comparativa con modelos similares

No se conocen en la información disponible otros conjuntos de voces de referencia directamente comparables. La comparación más útil es frente a las alternativas operativas dentro del propio ecosistema Qwen3-TTS:

| Alternativa | Origen del audio de referencia | Licencia | Idiomas | Coste de obtención |
|---|---|---|---|---|
| Este repositorio (qwen3-tts-reference-voices) | 20 voces sintéticas generadas con Qwen3-TTS-12Hz-1.7B-VoiceDesign | CC0 1.0 | 10 (sin especificar) | Nulo; descarga directa |
| Modo Voice Clone con audio propio | Grabación propia o banco de voz interno | Depende de la cesión de derechos del locutor | Limitado a los idiomas grabados | Coste de grabación, consentimiento y gestión legal |
| Modo TTS (CustomVoice) de Qwen3-TTS | Voces predefinidas por Qwen, con instrucciones de estilo opcionales | La del modelo base, no detallada en la información disponible | Según el modelo base | Nulo, pero sin control sobre la identidad de la voz |
| Modo Voice Design de Qwen3-TTS | Descripción textual; la voz se genera al vuelo | La del modelo base, no detallada en la información disponible | Según el modelo base | Nulo, pero la voz no es reproducible de forma exacta sin fijar la semilla |

## Limitaciones y advertencias

- El repositorio no es un modelo: no genera voz por sí mismo, solo aporta referencias que otro sistema debe procesar.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni evidencia de que las voces funcionen correctamente en todos los pipelines citados.
- Los diez idiomas no se enumeran en la model card, por lo que hay que inspeccionar `voices.json` antes de asumir cobertura para un idioma concreto.
- El tamaño del repositorio aparece como 0,0 GB, lo que puede indicar que los archivos de audio se sirven por Git LFS o que el recuento de HuggingFace no los contabiliza; conviene verificar la descarga completa antes de integrarlo en producción.
- No hay benchmarks ni métricas objetivas de similitud de hablante, naturalidad (MOS) ni robustez entre idiomas.
- Al ser voces sintéticas, pueden arrastrar los sesgos de acento, prosodia y género del modelo generador y de los prompts de diseño empleados.
- Los clips de referencia no representan una identidad real, lo que reduce el riesgo legal de suplantación, pero no lo elimina: la clonación de voz puede usarse para fraude o desinformación, y la licencia CC0 no exime de cumplir la normativa aplicable sobre síntesis de voz, publicidad o contenido engañoso.
- La licencia CC0 1.0 cubre las voces de este repositorio, no el modelo base. Antes de explotar comercialmente el sistema completo hay que revisar la licencia de Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign y de cualquier motor de inferencia utilizado (VoxCPM2, Chatterbox), que no se detalla en la información disponible.
- La calidad final dependerá del modelo de clonación y de su versión; no se documentan versiones mínimas compatibles.
- No hay garantía de mantenimiento: el proyecto se publica en un repositorio personal y la fecha de actualización registrada es 2026-10-08.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ExNihilus/qwen3-tts-reference-voices
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Repositorio de GitHub del autor: https://github.com/exnihilus/subvoxpro-models/tree/main/qwen3-voices
- Repositorio oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Noticia de referencia sobre el lanzamiento de Qwen3-TTS: https://comfyui-wiki.com/en/news/2026-01-22-alibaba-qwen3-tts-release
