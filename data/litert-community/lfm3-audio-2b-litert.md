# litert-community/LFM3-Audio-2B-LiteRT

## Resumen

LFM3-Audio-2B-LiteRT es la conversión al formato LiteRT (`.litertlm` y grafos `.tflite`) del modelo multimodal de audio LFM3-Audio-2B de Liquid AI, publicada por la comunidad litert-community. El modelo original acepta texto o voz como entrada y produce texto, voz o ambos, cubriendo reconocimiento automático del habla, síntesis de voz, conversación por voz, preguntas sobre grabaciones y llamadas a herramientas. Esta versión está pensada para ejecución local en dispositivos móviles y equipos de sobremesa sin conexión de red, empleando el runtime LiteRT-LM 0.18.1 y LiteRT 2.3.0.

La conversión incluye un decodificador cuantizado a int4 con embedder int8 y codificador de audio con pesos lineales en fp16, todo empaquetado en un único fichero de 1,53 GB con una ventana de contexto de 2.048 tokens. La salida de voz no la genera LiteRT-LM por sí solo: requiere cuatro grafos adicionales (proyección de profundidad, pasada del decodificador de profundidad, embed de trama y decodificador del códec de audio) que la aplicación debe orquestar en un bucle propio.

Su relevancia actual reside en que demuestra la viabilidad de un modelo any-to-any de audio en hardware de consumo: en un Galaxy S26 (Snapdragon SM8850) el decodificador de texto alcanza 40,61 tokens/s en GPU y la síntesis de voz corre a un factor de tiempo real de 0,44; en un Pixel 8a (Tensor G3) se obtienen 12,95 tokens/s y un factor de 0,88. La licencia es la LFM1.0 del modelo original, con restricciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de audio any-to-any de Liquid AI convertido a LiteRT; decodificador transformer con decodificador de profundidad para códecs de voz; codificador de audio integrado |
| Parametros totales | 2B (según el nombre del modelo base; el desglose exacto no está disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Decodificador int4, embedder int8, codificador de audio con pesos lineales fp16; pasada de profundidad en float32, int8 (pesos int8, activaciones float32) y compilada AOT para NPU Snapdragon SM8850 |
| Idiomas soportados | Inglés (verificado por el autor de la conversión); la model card del modelo original lista 18 idiomas para transcripción, síntesis y traducción, y conversación por voz solo en inglés |
| Licencia | LFM1.0 (`other`, enlace a LICENSE en el repo) |
| Formato de pesos | `.litertlm` (modelo principal), `.tflite` (grafos auxiliares de voz), `litertlm_manifest.json` |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B de Liquid AI es un modelo any-to-any que combina un codificador de audio con un decodificador de lenguaje y un decodificador de profundidad que genera los códigos acústicos de un códec de audio. La conversión a LiteRT mantiene esa estructura: el fichero `.litertlm` contiene el decodificador int4, el embedder int8, el codificador de audio con pesos lineales fp16, el tokenizer y la plantilla de chat. La síntesis de voz se realiza con un bucle externo que, por cada trama de 80 ms, proyecta el último estado oculto del decodificador, ejecuta tres pasadas del decodificador de profundidad para revelar los 12 códigos de la trama, los convierte en el embedding de entrada siguiente (suma de 12 embeddings de codebook) y decodifica 12 tramas (0,96 s) a audio de 24 kHz mediante el decodificador del códec.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión se realizó con litert-torch y litert-lm-builder 0.18.1 y se ejecutó con LiteRT 2.3.0; las mediciones de rendimiento están fechadas el 29 de octubre de 2026 (salida de voz en Pixel 8a el 31 de octubre de 2026). El tokenizer del fichero `.litertlm` es byte a byte el `tokenizer.json` del repositorio de origen.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto.
- Síntesis de voz (TTS): generación de audio a 24 kHz a partir de texto, mediante los grafos auxiliares y un bucle de aplicación.
- Conversación por voz: entrada de voz y respuesta en texto o voz (solo inglés verificado).
- Preguntas sobre grabaciones: consultas en lenguaje natural sobre el contenido de un audio.
- Entrada multimodal: acepta texto o voz y produce texto, voz o ambos.
- Llamadas a herramientas (tool calls): el modelo original soporta function calling según la model card de origen.
- Traducción: la model card del modelo original lista 18 idiomas para transcripción, síntesis y traducción.
- Ejecución totalmente local sin red: CPU y GPU en Android y Mac; NPU en Snapdragon SM8850 para la pasada de profundidad.
- Procesamiento de ventanas de audio de 30 s por pasada del codificador.

## Casos de uso

- Transcripción en directo en aplicaciones móviles: el modelo procesa ventanas de 30 s de audio en 94,4 ms en un Galaxy S26 (3,1 ms por segundo de audio), lo que permite subtitulado y notas de voz sin conexión.
- Asistentes de voz embebidos: con conversación por voz en inglés y respuesta hablada generada a 0,40 s por segundo de audio en Galaxy S26, se pueden construir asistentes que funcionen íntegramente en el dispositivo sin enviar audio a la nube.
- Accesibilidad: lectura en voz alta de texto y descripción hablada de contenido para usuarios con discapacidad visual, aprovechando la síntesis local y la baja latencia del primer audio (0,71 s en Galaxy S26, 1,50 s en Pixel 8a).
- Análisis de grabaciones: preguntas en lenguaje natural sobre reuniones, entrevistas o notas de voz, usando la ventana de contexto de 2.048 tokens para mantener el hilo de la consulta.
- Dictado y post-procesado de texto: integración del ASR en teclados o editores móviles, con el decodificador de texto a 40,61 tokens/s en GPU de Galaxy S26 para corrección y formateo posterior.
- Traducción de audio a texto: la model card del modelo original indica soporte de traducción en 18 idiomas, lo que permite transcribir y traducir grabaciones en el dispositivo.
- Automatización con tool calling: el soporte de llamadas a herramientas del modelo original permite encadenar acciones (calendario, búsqueda local) en asistentes on-device.
- Prototipado en Mac: con 167,88 tokens/s de decodificación en GPU WebGPU de un M4 Max, se puede iterar en el diseño de la aplicación antes de desplegar en móvil.

## Benchmarks y rendimiento

Rendimiento medido por el autor de la conversión (no son benchmarks académicos como MMLU o HumanEval):

| Dispositivo | Tarea | Ejecución | Resultado |
|---|---|---|---|
| Galaxy S26 (Snapdragon SM8850) | Texto: prefill 1.024 tokens + 256 tokens | GPU | prefill 1.295,4 tokens/s; decodificación 40,61 tokens/s; primer token 0,81–0,82 s |
| Galaxy S26 | Audio de entrada: ventana de 30 s | GPU | 94,4 ms por ventana (3,1 ms por segundo de audio) |
| Galaxy S26 | Salida de voz | decodificador CPU, pasada de profundidad NPU, códec GPU | 0,40 s por segundo de audio; factor de tiempo real 0,44; primer audio 0,71 s |
| Pixel 8a (Tensor G3) | Texto: respuestas a preguntas cortas | GPU | decodificación 12,95 tokens/s (mediana de 7 respuestas); primer token 1,14 s |
| Pixel 8a | Audio de entrada: ventana de 30 s | GPU | 360,7 ms por ventana (12 ms por segundo de audio) |
| Pixel 8a | Salida de voz | decodificador y decodificador de profundidad CPU (int8), códec GPU | 0,81 s por segundo de audio; factor de tiempo real 0,88; primer audio 1,50 s |
| Mac (Apple M4 Max) | Texto: prefill 1.024 tokens + 256 tokens | GPU (WebGPU) | prefill 3.898 tokens/s; decodificación 167,88 tokens/s; primer token 0,27 s |
| Mac (Apple M4 Max) | Texto: prefill 1.024 tokens + 256 tokens | CPU | prefill 354 tokens/s; decodificación 64,19 tokens/s; primer token 2,90 s |

## Requisitos de hardware

- VRAM/almacenamiento: el fichero principal `.litertlm` ocupa 1,53 GB; los grafos auxiliares de voz suman aproximadamente 1,04 GB (100,7 MB de proyección, 84,6 MB de pasada int8, 169,6 MB de pasada NPU, 198,3 MB de embed de trama y 152,5 MB de decodificador del códec). El repo completo son 4,1 GB.
- GPU recomendadas: GPU integrada de Snapdragon SM8850 (Galaxy S26) y Tensor G3 (Pixel 8a) verificadas; GPU WebGPU de Apple M4 Max verificada. No se han publicado pruebas en A100, H100 ni RTX 4090.
- NPU: la pasada de profundidad tiene una variante compilada AOT exclusiva para la NPU Snapdragon SM8850.
- Hardware de consumo: el modelo está diseñado para ejecutarse en teléfonos Android de gama alta y en Mac; no se documenta su funcionamiento en GPU de escritorio NVIDIA.
- Despliegue: LiteRT-LM 0.18.1 (runtime) y LiteRT 2.3.0; la salida de voz requiere un bucle propio en la aplicación que orqueste los grafos `.tflite`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; el primer token tarda entre 0,27 s (M4 Max GPU) y 1,14 s (Pixel 8a), y la síntesis de voz va de 0,40 s a 0,81 s por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| LFM3-Audio-2B-LiteRT | 2B | 2.048 tokens | Inglés verificado (18 en el original) | LFM1.0 | LiteRT-LM en Android y Mac |
| LiquidAI/LFM3-Audio-2B | 2B | no disponible | 18 idiomas (conversación por voz solo inglés) | LFM1.0 | Framework original de Liquid AI |
| Alternativas comparables de audio on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La salida de voz no funciona solo con LiteRT-LM: requiere implementar un bucle de aplicación con cuatro grafos adicionales y gestionar la realimentación de embeddings, algo que LiteRT-LM no puede hacer por sí mismo.
- El contexto está limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo se ha verificado el inglés; aunque el modelo original declara 18 idiomas, no hay validación de esta conversión en otros idiomas.
- La licencia LFM1.0 es `other` y puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en producción.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en transcripciones con ruido o audio de baja calidad.
- No se han publicado evaluaciones de sesgos para esta conversión.
- El rendimiento depende fuertemente del dispositivo: en Pixel 8a la síntesis de voz está cerca del límite de tiempo real (factor 0,88), lo que deja poco margen para cargas concurrentes.
- La variante NPU de la pasada de profundidad solo funciona en Snapdragon SM8850; en otros dispositivos debe usarse la variante int8 en CPU.
- No hay datos publicados sobre latencia o throughput en GPU de escritorio NVIDIA, por lo que no se puede garantizar su viabilidad en servidores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia LFM1.0: https://huggingface.co/litert-community/LFM3-Audio-2B-LiteRT/blob/main/LICENSE
