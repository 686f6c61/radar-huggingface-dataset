# raymondchins/qwen3-asr-0.6b-coreml

## Resumen

Qwen3-ASR 0.6B Core ML es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud, a formato Core ML para su ejecución nativa en hardware Apple. La conversión la firma raymondchins y está pensada para Speakey, una capa de voz para macOS. Los pesos son los de Qwen; no se ha reentrenado nada, según indica la model card.

El modelo base pertenece a la familia Qwen3-ASR, que incluye las variantes de 1.7B y 0.6B y que, según el repositorio oficial, soporta identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos, apoyándose en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. Esta versión Core ML divide el modelo en un codificador de audio en fp16 que se ejecuta en el Apple Neural Engine y un decodificador escrito en MIL con caché KV con estado (macOS 15+) en int8 que se ejecuta en la GPU.

La relevancia de esta ficha radica en que permite ejecutar un ASR de 0.6B parámetros de forma local en Macs con chip Apple Silicon, sin depender de servicios en la nube. La model card reporta unos 30 ms por toma en un M5 Max cuando se aprovecha un borrador de vista previa en vivo, y unos 195 ms sin él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + decodificador tipo transformer con cache KV con estado (formato Core ML, MIL) |
| Parametros totales | 0,6B (heredados del modelo base Qwen3-ASR-0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el codificador procesa ventanas de audio de 8 segundos por llamada |
| Tipos de cuantizacion | Codificador en fp16; decodificador con pesos int8; embeddings de tokens int8 con una escala por fila |
| Idiomas soportados | No disponible en esta ficha; el modelo base Qwen3-ASR soporta 52 idiomas y dialectos segun el repositorio oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc`); repositorio de 1,1 GB |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion de pesos de Qwen3-ASR-0.6B a Core ML. La arquitectura resultante separa el codificador de audio, convertido a fp16 y ejecutado en el Apple Neural Engine procesando una ventana de 8 segundos por llamada, del decodificador, reescrito en MIL con una caché KV con estado disponible a partir de macOS 15 y cuantizado a int8 para ejecutarse en la GPU. Los embeddings de tokens se cuantizan a int8 con una escala por fila.

No se detallan en la informacion disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). El repositorio oficial de Qwen3-ASR menciona que la familia se apoya en datos de habla a gran escala y en la capacidad de comprensión de audio de Qwen3-Omni. La model card indica que `speakey.json` contiene los tokens de prompt y las formas que necesita el runtime de Speakey.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre ventanas de audio de 8 segundos por llamada.
- Ejecución local en macOS sobre Apple Silicon, con el codificador en el Neural Engine y el decodificador en la GPU.
- Inferencia de baja latencia: aproximadamente 30 ms por toma en un M5 Max con borrador de vista previa en vivo, y unos 195 ms sin él.
- Integración con Speakey, que descarga la carpeta del modelo de forma automática.
- Identificación de idioma y cobertura multilingüe: no confirmada para esta conversión concreta; el modelo base declara 52 idiomas y dialectos.
- Soporte de tool calling, agentes, visión, audio general o modo de razonamiento: no disponible (el modelo está especializado en ASR).

## Casos de uso

- Dictado por voz en macOS: el modelo transcribe fragmentos de audio de 8 segundos con latencia de decenas o cientos de milisegundos, adecuado para entrada de texto en tiempo real en aplicaciones nativas.
- Asistentes de voz locales: al ejecutarse íntegramente en el dispositivo, permite construir asistentes que no envían audio a la nube, con las ventajas de privacidad que ello implica.
- Subtitulado y transcripción de reuniones: procesando el audio por ventanas consecutivas de 8 segundos, se puede transcribir una reunión en local en un Mac con Apple Silicon.
- Automatización de notas de voz: integración en flujos de trabajo de macOS que convierten grabaciones en texto sin depender de APIs externas.
- Aplicaciones de accesibilidad: entrada por voz para usuarios con movilidad reducida, con respuesta suficientemente rápida para una interacción conversacional.
- Preprocesado de pipelines de audio: transcripción previa de audio antes de pasarlo a un LLM local, aprovechando que el modelo corre en el Neural Engine y libera la CPU y la GPU para otras tareas.
- Prototipado de productos de voz en Mac: al ser Apache 2.0 y estar empaquetado para Core ML, sirve para validar ideas de producto sin costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de latencia: aproximadamente 30 ms por toma en un M5 Max con borrador de vista previa en vivo y unos 195 ms sin él.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon; el codificador usa el Apple Neural Engine y el decodificador la GPU.
- Sistema operativo: macOS 15 o superior (la caché KV con estado del decodificador lo requiere).
- VRAM: no disponible; el modelo se ejecuta con memoria unificada del SoC Apple, no con VRAM dedicada.
- GPU recomendadas: Apple Silicon; la model card cita un M5 Max como referencia de latencia. No se especifican otros chips.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no está pensado para GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML y el runtime de Speakey (que consume `speakey.json`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia: aproximadamente 30 ms por toma con borrador de vista previa y unos 195 ms sin él, en un M5 Max.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| raymondchins/qwen3-asr-0.6b-coreml | 0,6B | Ventanas de audio de 8 s | Core ML | Apache 2.0 | Conversion para macOS/Speakey |
| codeclawd/qwen3-asr-0.6b-coreml | 0,6B | Ventanas de audio de 8 s | Core ML | Apache 2.0 | Otra conversion Core ML del mismo modelo base, atribuida a FluidInference |
| Qwen/Qwen3-ASR-0.6B | 0,6B | No disponible | Safetensors (formato original) | Apache 2.0 | Modelo base original de Alibaba Cloud |
| Qwen/Qwen3-ASR-1.7B | 1,7B | No disponible | Safetensors (formato original) | Apache 2.0 | Variante mayor de la misma familia; el repositorio oficial la describe como estado del arte entre modelos ASR open source |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en ASR; no es un modelo de propósito general ni soporta generación de texto libre, código o razonamiento.
- El codificador procesa ventanas de 8 segundos por llamada, lo que condiciona la transcripción de audio largo a un procesamiento por segmentos.
- Requiere macOS 15 o superior por la caché KV con estado; no funciona en versiones anteriores ni en plataformas no Apple.
- La cobertura de idiomas de esta conversión concreta no está confirmada; los 52 idiomas y dialectos corresponden al modelo base según el repositorio oficial.
- No se han publicado benchmarks de calidad de transcripción (WER u otras métricas) para esta conversión.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso, acentos o vocabulario técnico.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de copyright de Alibaba Cloud (Qwen team) y la atribución de la conversión a Raymond Chin, según `LICENSE` y `NOTICE`.

## Enlaces

- [Hugging Face: raymondchins/qwen3-asr-0.6b-coreml](https://huggingface.co/raymondchins/qwen3-asr-0.6b-coreml)
- [Modelo base: Qwen/Qwen3-ASR-0.6B](https://huggingface.co/Qwen/Qwen3-ASR-0.6B)
- [GitHub: QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- [Speakey](https://speakey.dev)
- [Conversión alternativa: codeclawd/qwen3-asr-0.6b-coreml](https://huggingface.co/codeclawd/qwen3-asr-0.6b-coreml)
