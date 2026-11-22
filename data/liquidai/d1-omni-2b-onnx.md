# LiquidAI/d1-Omni-2B-ONNX

## Resumen

d1-Omni-2B-ONNX es la distribucion en formato ONNX del modelo multimodal d1-Omni-2B de Liquid AI, disenado para inferencia multiplataforma mediante ONNX Runtime. El modelo original combina un decodificador de lenguaje de 2B parametros con un codificador de vision y un codificador de audio, lo que le permite procesar entradas de texto, imagen y audio de forma conjunta. Esta version ONNX empaqueta cada precision (q4, q8) con sus codificadores correspondientes, facilitando el despliegue en CPU y entornos sin dependencias de frameworks de deep learning pesados.

El modelo pertenece a la familia LFM3 (Liquid Foundation Models, tercera generacion) y se distribuye bajo la licencia LFM 1.0, que impone restricciones para uso comercial. Soporta 16 idiomas, entre ellos el espanol, el ingles, el chino, el arabe y el hindi, y esta etiquetado para la tarea audio-text-to-text, lo que lo situa en el nicho de modelos omni de pequeno tamano que aceptan audio e imagen ademas de texto.

Su relevancia actual radica en que ofrece capacidades multimodales (audio y vision) en un paquete de 2B parametros con versiones cuantizadas que caben en CPU y GPUs de consumo, algo poco habitual en modelos omni. La version ONNX amplia el alcance a dispositivos edge, navegadores y entornos Windows/Linux sin GPU dedicada, a costa de una posible perdida de rendimiento frente a los pesos originales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 con decodificador de lenguaje, codificador de vision y codificador de audio) |
| Parametros totales | 2B (decodificador) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (decoder_q4 + vision_encoder_q8 + audio_encoder), q8 (decoder_q8 + vision_encoder_q8 + audio_encoder) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

La model card de esta version ONNX no detalla la arquitectura interna ni el proceso de entrenamiento; remite a la model card del modelo base LiquidAI/d1-Omni-2B para esos datos. Por la estructura de ficheros publicada, se deduce un diseno modular con tres componentes: un decodificador de lenguaje de 2B parametros (decoder_q4 o decoder_q8), un codificador de vision (vision_encoder_q8) y un codificador de audio (audio_encoder). Cada precision empaqueta los tres componentes, lo que confirma que el modelo procesa imagenes y audio ademas de texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. La etiqueta base_model:quantized y el tag lfm3_omni sugieren que el modelo original emplea la arquitectura LFM3 en su variante omni, pero los detalles tecnicos concretos (tipo de atencion, innovaciones de eficiencia) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto condicionada por audio: el pipeline audio-text-to-text permite transcribir, describir o razonar sobre contenido hablado.
- Procesamiento de audio: el codificador de audio integrado permite tareas de comprension de voz, clasificacion de audio y respuesta a preguntas sobre audio.
- Procesamiento de vision: el codificador de vision q8 permite describir imagenes, responder preguntas visuales y extraer informacion de documentos escaneados.
- Capacidades multilingues en 16 idiomas, incluidos espanol, ingles, chino, arabe, hindi, japones, coreano, portugues, frances, aleman, italiano, vietnamita, tailandes, indonesio, ruso y polaco.
- Inferencia multiplataforma mediante ONNX Runtime, con soporte para CPU y aceleracion opcional por GPU segun el proveedor de ejecucion.
- No se especifica soporte de tool calling, function calling ni modos de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion y comprension de audio en local: el modelo puede procesar audio y generar texto descriptivo o respuestas sin enviar datos a la nube, adecuado para aplicaciones de privacidad (reuniones, consultas medicas) gracias a su empaquetado ONNX ejecutable en CPU.
- Asistentes de accesibilidad: combinando audio y vision, el modelo puede describir escenas o leer documentos a usuarios con discapacidad visual, desplegado en dispositivos de bajo consumo mediante la version q4 de 2.45 GB.
- Analisis de llamadas de atencion al cliente: el modelo puede resumir o clasificar conversaciones de audio grabadas, ejecutandose en servidores sin GPU dedicada con ONNX Runtime.
- Procesamiento de documentos escaneados con audio adjunto: en entornos de digitalizacion, el modelo puede correlacionar una imagen de documento con una nota de voz asociada y generar un resumen unificado.
- Moderacion de contenido multimedia: clasificacion de audio e imagen en pipelines de moderacion, aprovechando la cuantizacion q4 para reducir costes de infraestructura en CPU.
- Prototipado rapido en entornos edge: desarrolladores que necesitan validar ideas multimodales en Raspberry Pi, portatiles o navegadores pueden usar la version ONNX sin configurar CUDA ni instalar PyTorch.
- Aplicaciones multilingues de voz: traduccion o resumen de audio en cualquiera de los 16 idiomas soportados, con despliegue en infraestructura CPU-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la version q4 ocupa 2.45 GB en disco (decoder_q4 + vision_encoder_q8 + audio_encoder), por lo que requiere al menos 3-4 GB de RAM para inferencia en CPU. La version q8 es de mayor tamano (el repositorio completo suma 20.1 GB, incluyendo todas las precisiones).
- GPU recomendadas: no se especifican. Al ser ONNX, puede ejecutarse con proveedores de ejecucion CUDA o DirectML en GPUs como RTX 4090, A100 o H100, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si, la version q4 deberia caber en GPUs con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.), aunque no se confirma oficialmente.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), integrable en aplicaciones Python, C++, C# o JavaScript. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B-ONNX | 2B | no disponible | texto, audio, vision | lfm1.0 (restrictiva) | ONNX |
| Qwen2-Audio-7B | 7B | no disponible | texto, audio | Apache 2.0 (segun version) | safetensors, GGUF |
| MiniCPM-o 2.6 | 8B | no disponible | texto, audio, vision | no disponible | safetensors |
| Phi-4-multimodal | 5.6B | no disponible | texto, audio, vision | MIT (segun version) | safetensors |

La comparativa se ofrece como referencia de categoria (modelos omni de menos de 10B); los datos de contexto y rendimiento de los alternativos no se han verificado en la informacion proporcionada y deben consultarse en sus respectivas model cards. La principal ventaja de d1-Omni-2B-ONNX es su menor tamano (2B) y su empaquetado ONNX listo para CPU, mientras que sus competidores ofrecen licencias mas permisivas.

## Limitaciones y advertencias

- Licencia LFM 1.0: no es una licencia open source estandar; impone restricciones para uso comercial que deben revisarse antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de robustez del modelo.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con entradas largas de audio o multiples imagenes.
- El rendimiento de la version ONNX puede diferir del modelo original en safetensors; no se han publicado comparativas de calidad entre ambas.
- El modelo es de 2B parametros, por lo que su capacidad de razonamiento complejo y conocimiento factual sera limitada en comparacion con modelos de mayor tamano.
- No se confirma soporte de tool calling ni de agentes, lo que restringe su uso en pipelines automatizados que requieran invocacion de funciones.
- El repositorio ocupa 20.1 GB por incluir multiples precisiones; el despliegue debe seleccionar solo los ficheros necesarios para evitar descargas innecesarias.
- La fecha de creacion (2026-10-27) y el bajo numero de descargas (683) sugieren un modelo reciente con poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-Omni-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/open-d1
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/d1-Omni-2B-ONNX/blob/main/LICENSE
