# litert-community/LFM3-Audio-2B-LiteRT

## Resumen

LFM3-Audio-2B-LiteRT es la conversion al formato LiteRT (antes TensorFlow Lite) del modelo multimodal de audio LiquidAI/LFM3-Audio-2B, publicada por la comunidad litert-community. El modelo original, desarrollado por Liquid AI, acepta texto o voz como entrada y produce texto, voz o ambos, cubriendo reconocimiento automatico del habla, sintesis de voz, conversacion por voz, preguntas sobre grabaciones y llamadas a herramientas. Esta version empaqueta el decodificador en int4, el embedder en int8 y el codificador de audio en fp16 dentro de un unico fichero `.litertlm` de 1,53 GB, pensado para ejecucion completamente local en telefonos Android y Mac sin conexion de red.

La relevancia de esta ficha esta en que permite llevar un modelo any-to-any de audio a hardware de consumo: en un Galaxy S26 (Snapdragon SM8850) el decodificador escribe 40,61 tokens por segundo en GPU y genera un segundo de voz en 0,40 s (factor de tiempo real 0,44), mientras que en un Pixel 8a (Tensor G3) baja a 12,95 tokens/s y 0,81 s por segundo de voz. En un Mac con M4 Max alcanza 167,88 tokens/s en decodificacion por WebGPU.

Es importante subrayar que LiteRT-LM por si solo no produce voz: la salida hablada requiere cuatro grafos LiteRT adicionales y un bucle implementado en la propia aplicacion, ya que el siguiente token de entrada en modo voz es una suma de embeddings de 12 codebooks que LiteRT-LM no puede alimentar directamente. La conversion se realizo con litert-torch y litert-lm-builder 0.18.1 sobre LiteRT 2.3.0, con mediciones del 29 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base LiquidAI/LFM3-Audio-2B; decodificador transformer con codificador de audio y decodificador de profundidad para codecs) |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Decodificador int4, embedder int8, codificador de audio fp16; grafo de profundidad en float32 e int8; compilacion AOT para NPU SM8850 |
| Idiomas soportados | Ingles (verificado); el modelo base declara 18 idiomas para transcripcion, sintesis y traduccion, y conversacion por voz solo en ingles |
| Licencia | lfm1.0 (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM) y `.tflite` (LiteRT) |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B es un modelo any-to-any de audio de Liquid AI que combina un codificador de audio con un decodificador de lenguaje y un decodificador de profundidad para la generacion de codecs de voz. La conversion a LiteRT mantiene esa estructura en varios grafos: el fichero `.litertlm` contiene el decodificador int4, el embedder int8, el codificador de audio con pesos lineales en fp16, el tokenizer y la plantilla de chat. La generacion de voz se reparte en grafos separados: proyeccion de la ultima capa oculta hacia el decodificador de profundidad, una pasada del decodificador de profundidad (tres pasadas revelan los 12 codigos de una trama de 80 ms), un embedder de trama que convierte los 12 codigos en la siguiente entrada del decodificador y un decodificador de codec que transforma 12 tramas (0,96 s) en audio a 24 kHz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta version es el pipeline de conversion y despliegue: cuantizacion mixta por componente, compilacion ahead-of-time para la NPU Snapdragon SM8850 y un bucle de aplicacion que orquesta los grafos para la salida de voz, con un tokenizer copiado byte a byte del repositorio original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles verificado.
- Sintesis de voz (texto a voz) mediante los grafos adicionales y el bucle de aplicacion.
- Conversacion por voz (voice chat) en ingles.
- Respuestas en texto, en voz o en ambas modalidades.
- Preguntas sobre una grabacion de audio (audio question answering).
- Llamadas a herramientas (tool calls) segun la model card del modelo base.
- Procesamiento de ventanas de audio de hasta 30 s por pasada del codificador.
- Traduccion y transcripcion en 18 idiomas segun el modelo base (no verificado en esta conversion).
- Ejecucion completamente local sin red en Android y Mac, en CPU, GPU y NPU (SM8850).

## Casos de uso

- Transcripcion local en movil: la aplicacion graba audio y lo pasa por el codificador (94,4 ms por ventana de 30 s en Galaxy S26) para obtener texto sin enviar datos a la nube, adecuado para notas de voz y subtitulado offline.
- Asistente de voz sin conexion: el modelo responde en texto y, con los grafos de sintesis, en voz, con un primer audio tras 0,71 s en Galaxy S26 y 1,50 s en Pixel 8a, suficiente para interacciones conversacionales.
- Preguntas sobre grabaciones: reuniones, entrevistas o clases grabadas se procesan en ventanas de 30 s para extraer respuestas concretas gracias al contexto de 2048 tokens.
- Accesibilidad: lectura en voz alta de texto en pantalla y dictado por voz en dispositivos de gama media, con un factor de tiempo real de 0,44 en hardware de 2026.
- Traduccion y transcripcion multilingue: el modelo base declara 18 idiomas para transcripcion y traduccion, util para aplicaciones de viaje o atencion multilingue (requiere validacion en esta conversion).
- Automatizacion con herramientas en el dispositivo: las llamadas a herramientas del modelo base permiten construir agentes locales que consultan calendarios, contactos o servicios del telefono sin salir del dispositivo.
- Prototipado en Mac: con 167,88 tokens/s en decodificacion por WebGPU en un M4 Max, sirve para desarrollar y depurar el bucle de voz antes de desplegar en Android.

## Benchmarks y rendimiento

Rendimiento medido por el autor de la conversion (no son benchmarks academicos):

| Dispositivo | Tarea | Resultado |
|---|---|---|
| Galaxy S26 (SM8850, GPU) | Texto: prefill 1024 tokens + 256 tokens | prefill 1295,4 tokens/s; decodificacion 40,61 tokens/s; primer token 0,81-0,82 s |
| Galaxy S26 (GPU) | Entrada de audio, ventana de 30 s | 94,4 ms por ventana (3,1 ms por segundo de audio) |
| Galaxy S26 (app Android) | Salida de voz | 0,40 s por segundo de voz; factor de tiempo real 0,44; primer audio 0,71 s |
| Pixel 8a (Tensor G3, GPU) | Texto: respuestas cortas | decodificacion 12,95 tokens/s; primer token 1,14 s |
| Pixel 8a (GPU) | Entrada de audio, ventana de 30 s | 360,7 ms por ventana (12 ms por segundo de audio) |
| Pixel 8a (app Android) | Salida de voz | 0,81 s por segundo de voz; factor de tiempo real 0,88; primer audio 1,50 s |
| Mac M4 Max (WebGPU) | Texto: prefill 1024 + 256 tokens | prefill 3898 tokens/s; decodificacion 167,88 tokens/s; primer token 0,27 s |
| Mac M4 Max (CPU) | Texto: prefill 1024 + 256 tokens | prefill 354 tokens/s; decodificacion 64,19 tokens/s; primer token 2,90 s |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero principal ocupa 1,53 GB; los grafos de voz suman aproximadamente 0,87 GB en la variante int8 (100,7 MB + 84,6 MB + 198,3 MB + 152,5 MB + 334,1 MB en float32 si se usa esa pasada). El repositorio completo ocupa 4,1 GB.
- GPU recomendadas: Snapdragon SM8850 (Galaxy S26) con aceleracion GPU y NPU; Tensor G3 (Pixel 8a) en GPU; Apple M4 Max por WebGPU. No se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en hardware de consumo: si, en telefonos Android de 2025-2026 y en Mac; no se proporcionan datos para GPU de escritorio NVIDIA.
- Opciones de despliegue: LiteRT-LM 0.18.1 (binario `litert_lm_advanced_main`), LiteRT 2.3.0 y una aplicacion Android propia que orquesta los grafos de voz. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 el prefill alcanza 1295,4 tokens/s y la decodificacion 40,61 tokens/s; en Mac M4 Max por WebGPU, 3898 tokens/s de prefill y 167,88 tokens/s de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| LFM3-Audio-2B-LiteRT (esta ficha) | 2B | 2048 | Ingles verificado; 18 en el base | lfm1.0 | LiteRT-LM en Android y Mac |
| LiquidAI/LFM3-Audio-2B | 2B | No disponible | 18 (transcripcion/sintesis); ingles en voice chat | lfm1.0 | Framework original de Liquid AI |
| Otros modelos de audio any-to-any | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo se ha verificado el ingles; el resto de los 18 idiomas del modelo base no esta validado en esta conversion.
- La salida de voz no funciona con LiteRT-LM por si solo: requiere cuatro grafos adicionales y un bucle propio en la aplicacion, lo que aumenta la complejidad de integracion.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en preguntas sobre grabaciones largas o con ruido.
- Sesgos no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, puede presentar sesgos culturales y linguisticos.
- Licencia lfm1.0 con posibles restricciones para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- La compilacion AOT para NPU solo cubre el SoC Snapdragon SM8850; en otros dispositivos la pasada de profundidad se ejecuta en CPU con el fichero int8.
- El rendimiento medido corresponde a versiones concretas de software (LiteRT-LM 0.18.1, LiteRT 2.3.0) y puede variar con actualizaciones.
- No hay datos publicados sobre calidad de transcripcion (WER) ni de sintesis (MOS) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT/blob/main/LICENSE
- Repositorio de grafos de voz: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT (mismos ficheros `.tflite` del repositorio)
- LiteRT-LM v0.18.1: no disponible como enlace directo en la informacion proporcionada
- LiteRT 2.3.0: no disponible como enlace directo en la informacion proporcionada
