# ArchTianui/whisper-large-v3-turbo-es-transcriber

## Resumen

`ArchTianui/whisper-large-v3-turbo-es-transcriber` es un conjunto de conversiones de formato del modelo `adriszmar/whisper-large-v3-turbo-es`, un fine-tuning de `openai/whisper-large-v3-turbo` para reconocimiento automatico del habla (ASR) en espanol de Espana. El autor original del ajuste es adriszmar; ArchTianui publica unicamente los pesos convertidos a tres runtimes distintos (CTranslate2, OpenVINO IR y whisper.cpp GGML) para su uso dentro de la aplicacion de transcripcion offline *Transcriber International*. No hay reentrenamiento ni modificacion de pesos: solo cambia el formato de fichero y la cuantizacion.

El modelo resuelve el problema de ejecutar transcripcion de voz en espanol en hardware de consumo y en CPU sin GPU dedicada, ofreciendo pesos int8 y q8_0 listos para CTranslate2 (CPU), OpenVINO (GPU/NPU/CPU Intel) y whisper.cpp (GPU Vulkan). Al derivar de Whisper large-v3-turbo, hereda la arquitectura encoder-decoder transformer de OpenAI con decodificacion autoregresiva y la ventana de contexto de audio de 30 segundos por segmento, aunque el tamano efectivo es notablemente reducido respecto al large-v3 completo.

La relevancia actual es practica: el repositorio esta pensado para despliegues locales y sin conexion, con verificacion criptografica de integridad (SHA-256 por fichero) y licencia MIT. El autor advierte explicitamente de que el modelo se publica en estado de prueba y que la precision en el entorno real de la aplicacion aun no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (repo de 2,5 GB; pesos int8 de ~820 MB en CTranslate2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, heredada de Whisper) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO IR), q8_0 (whisper.cpp GGML) |
| Idiomas soportados | es (espanol de Espana, es-ES) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (ct2/), OpenVINO IR (openvino/), GGML (ggml/) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder con atención completa, entrenado para transcripcion y traduccion de voz, con una ventana de audio fija de 30 segundos por segmento y decodificacion autoregresiva de tokens de texto. La variante "turbo" reduce el numero de capas del decoder respecto al large-v3 completo, lo que explica el menor coste de inferencia y el tamano de pesos cuantizados (~820 MB en int8 para CTranslate2, ~874 MB en q8_0 para whisper.cpp).

El ajuste fino lo realizo adriszmar sobre `openai/whisper-large-v3-turbo`; segun la model card original, los datos de entrenamiento corresponden a Common Voice 17 en espanol. No se dispone de informacion sobre numero de tokens de audio, composicion exacta del dataset, uso de RLHF/DPO ni hiperparametros de entrenamiento en la informacion proporcionada. Las conversiones de ArchTianui no introducen cambios en los pesos: solo aplican cuantizacion int8/q8_0 y empaquetado para cada runtime.

## Capacidades

- Transcripcion automatica de voz (ASR) en espanol de Espana, con salida de texto plano.
- Ejecucion offline: los tres formatos estan pensados para inferencia local sin conexion.
- Compatibilidad con CTranslate2 (CPU), OpenVINO IR (GPU/NPU/CPU Intel) y whisper.cpp (GPU Vulkan).
- Verificacion de integridad de ficheros mediante SHA-256 listados en el catalogo firmado de la aplicacion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio adicional ni modo thinking.
- Capacidad multilingue limitada: el modelo esta orientado a es-ES; no se declaran otros idiomas.
- No se documentan capacidades de diarizacion, puntuacion avanzada ni marcas de tiempo en la informacion disponible.

## Casos de uso

- Transcripcion offline en escritorio: la aplicacion *Transcriber International* usa los pesos CTranslate2 int8 para transcribir audio en CPU sin GPU, apropiado para equipos de oficina sin acelerador.
- Despliegue en portatiles Intel con OpenVINO: los ficheros OpenVINO IR permiten ejecutar en iGPU, NPU o CPU Intel, adecuado para transcripcion en movilidad con bajo consumo.
- Transcripcion con GPU de consumo via whisper.cpp: el fichero GGML q8_0 con backend Vulkan permite usar GPUs integradas o dedicadas de gama media para reducir latencia en tiempo casi real.
- Subtitulado de contenido en espanol: el modelo puede generar transcripciones de audio para posterior formateo a subtitulos, aunque no se documentan marcas de tiempo nativas en esta ficha.
- Procesamiento por lotes de archivos de audio en pipelines locales: al ser pesos ligeros (~820 MB), se pueden ejecutar varias instancias en paralelo en un servidor CPU sin agotar memoria.
- Prototipado de asistentes de voz en espanol: sirve como componente ASR en aplicaciones de dictado, notas de reunion o busqueda sobre audio, con la ventaja de la licencia MIT y la ausencia de dependencia de la nube.
- Integracion en aplicaciones de terceros con verificacion de integridad: el catalogo firmado con SHA-256 permite distribuir los pesos de forma segura en instaladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision en el entorno de la aplicacion aun no se ha evaluado y que los modelos que no superen la evaluacion seran retirados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano de pesos, los ficheros int8 (~820 MB) y q8_0 (~874 MB) caben en GPUs con 2 GB o mas de memoria, ademas de en CPU.
- GPU recomendadas: no se especifican modelos concretos; OpenVINO apunta a GPU/NPU/CPU Intel y whisper.cpp GGML a GPUs con soporte Vulkan.
- Cabe en GPU de consumo: si, por el tamano de los pesos cuantizados; no se detallan modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: CTranslate2, OpenVINO Runtime, whisper.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| ArchTianui/whisper-large-v3-turbo-es-transcriber | no disponible (pesos int8 ~820 MB) | 30 s por segmento (heredado) | es | MIT | CTranslate2, OpenVINO, GGML |
| adriszmar/whisper-large-v3-turbo-es (modelo base) | no disponible | 30 s por segmento | es | MIT | safetensors (Transformers) |
| openai/whisper-large-v3-turbo (modelo raiz) | no disponible | 30 s por segmento | multilingue | MIT | safetensors, CTranslate2, GGML |
| openai/whisper-large-v3 | no disponible | 30 s por segmento | multilingue | MIT | safetensors, CTranslate2, GGML |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de prueba: el autor indica que el modelo se publica para testing y que la precision en el entorno real de la aplicacion no se ha evaluado; los modelos que fallen la evaluacion seran retirados.
- Es un repositorio de conversiones, no un modelo nuevo: cualquier limitacion del ajuste original de adriszmar se hereda sin cambios.
- Idioma restringido: orientado a es-ES; no se declara soporte para otras variantes del espanol ni otros idiomas.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre Common Voice 17 es, puede heredar sesgos de composicion de hablantes y acentos de ese corpus.
- Riesgo de alucinacion: inherente a los modelos Whisper en segmentos con silencio o ruido; no se documenta mitigacion especifica en esta ficha.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar la licencia del modelo base y del ajuste original en sus respectivas paginas.
- Sin garantias de marcas de tiempo, diarizacion ni puntuacion: no se documentan estas capacidades.
- Dependencia de la aplicacion: el catalogo firmado con SHA-256 esta pensado para *Transcriber International*; otros usos requieren gestionar la verificacion por cuenta propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-turbo-es-transcriber
- Modelo base del ajuste: https://huggingface.co/adriszmar/whisper-large-v3-turbo-es
- Modelo raiz de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- OpenVINO: https://github.com/openvinotoolkit/openvino
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Common Voice 17: https://commonvoice.mozilla.org/datasets
