# cloudkites/nbq-models

## Resumen

`cloudkites/nbq-models` es un repositorio de pesos empaquetados en formato `.nbq`, el contenedor propietario que las aplicaciones on-device de CloudKites cargan mediante el runtime numbat. No se trata de un modelo entrenado por CloudKites, sino de una redistribucion de cuatro modelos de terceros (tres de Qwen y uno de Omi Health) reempaquetados para su despliegue local. El repositorio actua como espejo unico compartido por todas las aplicaciones que ejecutan estos modelos, evitando duplicar descargas.

El contenido abarca dos categorias funcionales: un modelo de lenguaje generativo (Qwen3.5 4B, cuantizado a Q4_K_M por Unsloth) y tres modelos de reconocimiento automatico del habla (Qwen3-ASR 0.6B, Qwen3-ASR 1.7B y Omi Med STT v1, este ultimo un fine-tune de NVIDIA Parakeet TDT 0.6B v2 orientado a voz medica). El tamano total del repositorio es de 10 GB.

La relevancia de esta ficha es operativa mas que cientifica: documenta que pesos concretos, con que cuantizacion y bajo que licencias, estan disponibles para inferencia local, y advierte de que el formato `.nbq` solo es consumible por el runtime numbat, lo que limita su uso fuera del ecosistema CloudKites.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la de cada modelo base: transformer en Qwen3.5 4B y Qwen3-ASR; Parakeet TDT en Omi Med STT v1) |
| Parametros totales | 4B (Qwen3.5 4B); 0.6B (Qwen3-ASR 0.6B); 1.7B (Qwen3-ASR 1.7B); 0.6B (Omi Med STT v1) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (Qwen3.5 4B); sin cuantizar, precision original (Qwen3-ASR 0.6B y 1.7B); int8 simetrico con una escala por fila de salida, resto en float32 (Omi Med STT v1) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (Qwen3.5 4B, Qwen3-ASR 0.6B, Qwen3-ASR 1.7B); CC BY 4.0 (Omi Med STT v1) |
| Formato de pesos | `.nbq` (runtime numbat) |

Desglose de artefactos del repositorio:

| Fichero | Modelo base | Cuantizacion | Tamano | SHA-256 |
|---|---|---|---|---|
| `qwen3.5-4b/qwen3.5-4b-q4km.nbq` | Qwen/Qwen3.5-4B | Q4_K_M (Unsloth) | 2.75 GB | `d5c3411cd851c6adcbd670ee5c0f9cbe37e4cf7b40deedb549259615e7834fb1` |
| `qwen3-asr-0.6b/qwen3-asr-0.6b.nbq` | Qwen/Qwen3-ASR-0.6B | Ninguna (precision original) | 1.88 GB | `d42bc187c41fbcecd3cce62b4867fea2fb2a206cd1923642cb932772635c3d8a` |
| `qwen3-asr-1.7b/qwen3-asr-1.7b.nbq` | Qwen/Qwen3-ASR-1.7B | Ninguna (precision original) | 4.71 GB | `e3fa1c11e446941016c60c52e5986a2a88dcaf9bb5a8b33ec5c0fe962432233c` |
| `omi-med-stt-v1-int8/omi-med-stt-v1-int8.nbq` | omi-health/omi-med-stt-v1 (Parakeet TDT 0.6B v2 ajustado) | int8 por fila de salida | 668 MB | `344fda6029ee39c7ab699a09398014947031d0597a61d18d79a5cb210a829d90` |

## Arquitectura y entrenamiento

CloudKites no entrena ni ajusta ninguno de los modelos: la model card declara explicitamente que, salvo la cuantizacion y el reempaquetado, los pesos son identicos a los originales. Por tanto, la arquitectura y el proceso de entrenamiento son los de los modelos base. Qwen3.5 4B aporta el componente de generacion de texto; Qwen3-ASR 0.6B y 1.7B cubren transcripcion de audio; Omi Med STT v1 es un fine-tune de NVIDIA Parakeet TDT 0.6B v2 sobre habla medica, con licencia CC BY 4.0.

La unica transformacion tecnica documentada es la cuantizacion: Qwen3.5 4B pasa a Q4_K_M mediante el trabajo de Unsloth, y Omi Med STT v1 aplica cuantizacion int8 simetrica con una escala por fila de salida, manteniendo el resto de tensores en float32. Los dos modelos ASR de Qwen se conservan en su precision original. El detalle de datos de entrenamiento, numero de tokens y tecnicas de alineacion (RLHF, DPO) no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general mediante Qwen3.5 4B.
- Reconocimiento automatico del habla con Qwen3-ASR 0.6B y 1.7B, en dos rangos de tamano que permiten intercambiar latencia por precision.
- Transcripcion de voz en dominio medico con Omi Med STT v1, derivado de un modelo especializado en habla clinica.
- Inferencia local on-device: todos los artefactos estan pensados para ejecutarse en el dispositivo del usuario a traves del runtime numbat.
- Integridad verificable: cada fichero publica su hash SHA-256 para validacion de descarga.
- Soporte de tool calling, function calling, agentes, vision, audio nativo en el LLM, thinking mode o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz locales: combinando Qwen3-ASR 0.6B para la transcripcion y Qwen3.5 4B para la respuesta, se puede construir un asistente conversacional que no envia audio ni texto a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Transcripcion de consultas medicas: Omi Med STT v1, al ser un ajuste sobre habla clinica, es adecuado para dictado de notas en entornos sanitarios, con la advertencia explicita de que no es un dispositivo medico ni esta validado para uso clinico.
- Subtitulado y actas de reuniones: Qwen3-ASR 1.7B ofrece mayor precision que la variante 0.6B a cambio de 4.71 GB en disco, apropiado para procesar grabaciones por lotes en un portatil o estacion de trabajo.
- Procesamiento por lotes en el dispositivo: el LLM cuantizado a Q4_K_M (2.75 GB) permite clasificacion, resumen y extraccion de entidades sobre documentos locales sin conexion.
- Distribucion unificada en aplicaciones moviles y de escritorio: el repositorio actua como origen unico de pesos, de modo que varias aplicaciones del ecosistema CloudKites comparten la misma descarga y verifican el SHA-256 antes de cargar el modelo.
- Prototipado de pipelines ASR + LLM: los cuatro artefactos permiten montar un flujo completo de voz a texto y texto a respuesta con un unico runtime, sin gestionar conversiones de formato intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.75 GB para Qwen3.5 4B en Q4_K_M; 1.88 GB para Qwen3-ASR 0.6B; 4.71 GB para Qwen3-ASR 1.7B; 668 MB para Omi Med STT v1 int8. Son estimaciones basadas en el tamano de los ficheros, no en mediciones del runtime.
- GPU recomendadas: no disponible. La model card no especifica hardware objetivo ni requisitos minimos.
- Compatibilidad con GPU de consumo: por volumen de pesos, los cuatro artefactos caben en GPUs de consumo con 8 GB o mas de VRAM, incluso ejecutando el LLM y un ASR de forma secuencial; la idoneidad real depende del runtime numbat, del que no se detallan requisitos.
- Opciones de despliegue: exclusivamente el runtime numbat de CloudKites. El formato `.nbq` no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers sin una conversion previa no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cloudkites/nbq-models (Qwen3.5 4B Q4_K_M) | 4B | No disponible | `.nbq` | Apache 2.0 | Solo runtime numbat |
| Qwen/Qwen3.5-4B (original) | 4B | No disponible | Safetensors | Apache 2.0 | Hugging Face, ecosistema estandar |
| cloudkites/nbq-models (Qwen3-ASR 1.7B) | 1.7B | No disponible | `.nbq` | Apache 2.0 | Solo runtime numbat |
| Qwen/Qwen3-ASR-1.7B (original) | 1.7B | No disponible | Safetensors | Apache 2.0 | Hugging Face, ecosistema estandar |
| omi-health/omi-med-stt-v1 (original) | 0.6B | No disponible | Safetensors | CC BY 4.0 | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v2 (base de Omi) | 0.6B | No disponible | Safetensors | No disponible en la informacion proporcionada | Hugging Face |

La diferencia practica frente a los originales no es de rendimiento, sino de empaquetado: los `.nbq` simplifican la carga en el runtime numbat y anaden verificacion por hash, pero pierden portabilidad frente a safetensors y GGUF.

## Limitaciones y advertencias

- El formato `.nbq` es propietario y solo lo carga el runtime numbat; fuera de ese ecosistema los ficheros no son utilizables directamente.
- La model card declara explicitamente que estos pesos no constituyen un dispositivo medico ni estan validados para uso clinico, pese a incluir un modelo de voz medica.
- La licencia Apache 2.0 del repositorio no cubre todos los artefactos: Omi Med STT v1 esta bajo CC BY 4.0, lo que exige atribucion a Omi Health y a NVIDIA al redistribuir.
- El repositorio no es una release oficial de NVIDIA ni de Omi Health, y ninguna de las dos entidades lo respalda.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto o idioma en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia publica de uso en produccion.
- Las capacidades de tool calling, agentes o multimodalidad del LLM no estan documentadas en la model card y no deben asumirse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cloudkites/nbq-models
- Modelo base Qwen3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 publicada con Qwen3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Modelo base Qwen3-ASR 0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Modelo base Qwen3-ASR 1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base Omi Med STT v1: https://huggingface.co/omi-health/omi-med-stt-v1
- Modelo base NVIDIA Parakeet TDT 0.6B v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth
- Licencia Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
