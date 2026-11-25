# 7ven7o/Ming-3.0-tts-tiny-Q4GB

## Resumen
Ming-3.0-tts-tiny-Q4GB es una cuantizacion del modelo de sintesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por el usuario 7ven7o en Hugging Face. Se trata de un checkpoint en formato PyTorch con cuantizacion torchao disenado para ejecutarse con un consumo de VRAM inferior a 4 GB en GPUs CUDA, lo que permite desplegar un modelo TTS de gran tamano en hardware de consumo. El modelo base emplea una arquitectura MoE con 8,98 mil millones de parametros totales y 1,3 mil millones de parametros activos, orientada a la generacion de audio a partir de texto con control de instrucciones.

La relevancia de esta version reside en su huella de memoria: los pesos en GPU ocupan 3,553 GB y el pico de VRAM medido es de 3,878 GB asignados (3,93 GB reservados), gracias a una cuantizacion agresiva de los expertos MoE a uint3 con granularidad de grupo 128, las capas de atencion y expertos compartidos a uint4 con grupo 64, y el decodificador Flow DiT y el agregador a int8. Esto permite ejecutar un TTS de casi 9B parametros en tarjetas graficas de gama media-alta.

La ficha corresponde a un artefacto derivado, no al modelo original: la autoria de la cuantizacion se atribuye a "Gemini 4 Neon" segun la model card, y el uso requiere clonar el repositorio oficial de inclusionAI/Ming-3.0-tts y cargar los pesos mediante el script quant_runtime.py incluido. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con Flow DiT, agregador y AudioVAE; runtime ming_tiny |
| Parametros totales | 8,98 mil millones (8.98B) |
| Parametros activos | 1,3 mil millones (1.3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE uint3_g128; atencion LLM y expertos compartidos uint4_g64; Flow DiT y agregador int8; AudioVAE decoder fp32 en CPU; embeddings de palabra y encoder AudioVAE en CPU (bfloat16/fp32) |
| Idiomas soportados | no disponible (la model card incluye muestras en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | PyTorch (gpu_weights.pt, cpu_weights.pt) con subclases de tensor torchao; runtime ONNX mencionado en tags |

## Arquitectura y entrenamiento
El modelo base Ming-3.0-tts-tiny es un sistema de text-to-speech que combina un backbone de lenguaje con arquitectura MoE (8,98B totales, 1,3B activos) con modulos especificos de sintesis: un decodificador Flow DiT, un agregador y un decoder AudioVAE. La cuantizacion de 7ven7o aplica precision reducida de forma selectiva: los 6,95B parametros de expertos MoE se almacenan en uint3 con grupos de 128, mientras que la atencion del LLM y los expertos compartidos usan uint4 con grupos de 64. El Flow DiT y el agregador se mantienen en int8, y el decoder AudioVAE se ejecuta en fp32 sobre CPU para preservar la calidad de la waveform. El lm_head no utilizado se elimina, ahorrando 0,48 GB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO. La model card del artefacto cuantizado no documenta el proceso de entrenamiento del modelo original, solo el esquema de cuantizacion y las instrucciones de carga. El runtime requiere torch 2.6.0, torchaudio 2.6.0, torchao 0.9.0, transformers 4.46.3, fla-core 0.4.2, x-transformers 2.7.4, einops, einx, soundfile y onnxruntime.

## Capacidades
- Sintesis de voz a partir de texto (text-to-speech) con generacion de waveform en formato WAV.
- Control de estilo mediante instrucciones en lenguaje natural (por ejemplo, `instruction="Speak in an excited, joyful, upbeat voice."`).
- Control de emocion mediante parametros explicitos (por ejemplo, `emotion="happy"` o `emotion="sad"`), con muestras publicadas en ingles y chino.
- Modo `freeform` de generacion, segun el ejemplo de uso de la model card.
- Soporte multilingue limitado a lo evidenciado en las muestras: ingles y chino; no se documentan mas idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo especializado en TTS.
- No se documentan capacidades de vision ni de audio de entrada (no es un modelo speech-to-speech).

## Casos de uso
- Narracion y locucion automatizada en produccion: el modelo genera voz con control de emocion e instrucciones de estilo, adecuado para crear locuciones de audiolibros, podcasts o videos con un solo checkpoint que cabe en menos de 4 GB de VRAM.
- Asistentes de voz en dispositivos con GPU de consumo: al requerir un pico de 3,878 GB, puede desplegarse en estaciones de trabajo con RTX 3060/4060 o superiores para sintetizar respuestas habladas en tiempo de ejecucion.
- Prototipado rapido de interfaces conversacionales: el modo freeform y las instrucciones en lenguaje natural permiten iterar sobre tonos y estilos sin reentrenar, util en equipos de producto que prueban variantes de voz.
- Generacion de voces para contenido en ingles y chino: las muestras publicadas cubren ambos idiomas con emociones happy y sad, lo que sirve para localizacion de contenido en esos mercados.
- Investigacion en cuantizacion de modelos MoE para audio: el checkpoint documenta con detalle el esquema uint3_g128 y uint4_g64, lo que lo convierte en una referencia para estudiar el impacto de la cuantizacion mixta en TTS.
- Educacion y accesibilidad: sintesis de voz para lectores de pantalla o materiales formativos en entornos con hardware limitado, aprovechando el bajo consumo de VRAM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de memoria: 3,553 GB de pesos en GPU, 3,605 GB de pesos en CPU, 3,544 GB de VRAM asignada en carga y un pico de 3,878 GB asignados (3,93 GB reservados). No se ofrecen metricas de calidad de audio (MOS, WER, similitud de hablante) ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: 3,878 GB en pico (3,93 GB reservados), con 3,544 GB asignados tras la carga.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM efectiva; el modelo esta pensado para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores. No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, segun el objetivo declarado de "<= 4.0 GB VRAM".
- Parte del modelo se ejecuta en CPU: el decoder AudioVAE en fp32 y los embeddings de palabra y el encoder AudioVAE en bfloat16/fp32, por lo que se requiere RAM de sistema adicional (el repo pesa 7,2 GB).
- Opciones de despliegue: el runtime propio `quant_runtime.py` del repositorio, cargando `gpu_weights.pt` y `cpu_weights.pt`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS que permitan una comparacion rigurosa. Como referencia estructural, el propio modelo base inclusionAI/Ming-3.0-tts-tiny comparte arquitectura y parametros (8,98B totales, 1,3B activos) pero sin cuantizar, por lo que su huella de VRAM seria sustancialmente mayor.

## Limitaciones y advertencias
- Artefacto derivado y no oficial: la cuantizacion la publica el usuario 7ven7o, no inclusionAI, y la model card atribuye el proceso a "Gemini 4 Neon"; no hay garantia de validacion por parte del autor original.
- Dependencia estricta de versiones: requiere torch 2.6.0, torchao 0.9.0, transformers 4.46.3, fla-core 0.4.2 y x-transformers 2.7.4; desviarse de estas versiones puede romper la carga de las subclases de tensor torchao.
- Requiere clonar el repositorio upstream Ming-3.0-tts y apuntar `_UPSTREAM_DIR` a esa copia; el checkpoint no es autocontenido.
- La cuantizacion uint3 en los expertos MoE puede degradar la calidad de audio respecto al modelo original; no se publican metricas comparativas de calidad.
- Idiomas: solo se evidencian ingles y chino en las muestras; no se documenta cobertura multilingue adicional.
- Riesgo de alucinacion y artefactos de audio: no se documentan evaluaciones de robustez ante textos fuera de dominio, ruido o entradas adversarias.
- Sesgos: no se documenta ninguna evaluacion de sesgos de voz, genero, acento o etnia.
- Licencia MIT declarada, lo que permite uso comercial, pero al ser un derivado conviene verificar la licencia del modelo base inclusionAI/Ming-3.0-tts-tiny antes de produccion.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Checkpoint cuantizado: https://huggingface.co/7ven7o/Ming-3.0-tts-tiny-Q4GB
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio oficial del runtime: https://github.com/inclusionAI/Ming-3.0-tts
