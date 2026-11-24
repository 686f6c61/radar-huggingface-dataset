# dcharlot65-openie/Inworld-Voice-Isolator-LittleBit

## Resumen

`Inworld-Voice-Isolator-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `inworld/voice-isolator`, publicado por el usuario `dcharlot65-openie` bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una refactorización y compresión del modelo base de Inworld (orientado a aislamiento de voz) para su uso dentro de JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (`JouleKube`).

La propuesta técnica se apoya en una combinación de compresión extrema sub-1-bit (`LittleBit-2`) y factorización de pesos tipo `Sakana SVF` (Singular Value Fine-tuning), empaquetada en un formato propietario `.jsyn` con compresión zstd y CRC32. El resultado declarado es un fichero de 3,07 MB frente a los 110,97 MB que ocuparía el equivalente en FP16, con un promedio de 0,1435 bits por peso.

Es relevante por su enfoque poco convencional: no busca competir en benchmarks de razonamiento o generación, sino demostrar un pipeline de compresión agresiva y despliegue nativo en clústeres para tareas de procesamiento de audio (aislamiento de voz) con un footprint de memoria mínimo. La información pública disponible es muy escasa y el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `inworld/voice-isolator`; factorización LittleBit-2 ⊕ Sakana SVF) |
| Parametros totales | 58.178.056 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,1435 BPW promedio); tensores en 2D bitplane y vectores 1D en LayerNorm/Bias/Depthwise |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna del modelo base `inworld/voice-isolator` en la información disponible. Lo que sí se describe es el proceso de transformación aplicado: el checkpoint original se descompone en 224 tensores 2D almacenados como bitplanes y 441 vectores 1D (LayerNorm, bias y depthwise) que se conservan en mayor precisión. Sobre esa estructura se aplica una factorización `LittleBit-2` combinada con `Sakana SVF` (Singular Value Fine-tuning), una técnica de adaptación de bajo rango que modifica los valores singulares de la matriz de pesos en lugar de añadir matrices adicionales.

El empaquetado final usa compresión zstd con verificación CRC32, dando un fichero `.jsyn` de 3,07 MB (factor de compresión 36,12x respecto al equivalente FP16). No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque el autor no entrena el modelo: solo lo adapta. Tampoco se detalla el proceso de calibración o las pérdidas introducidas por la compresión sub-1-bit, lo cual es un dato crítico ausente para evaluar la fidelidad respecto al modelo original.

## Capacidades

- Aislamiento de voz (voice isolation): hereda la tarea del modelo base `inworld/voice-isolator`, orientada a separar la voz del ruido de fondo en señales de audio.
- Inferencia sin PyTorch: el runtime de JouleDB ejecuta el checkpoint sin dependencias de PyTorch, lo que facilita despliegues ligeros.
- Despliegue Kubernetes-native: integración con `JouleKube` como sustrato de agentes e IA.
- Carga desde Hugging Face mediante `db.hf_pull(...)` con un `model_id` interno (`inworld-voice-isolator`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Procesamiento de audio en el borde (edge): el tamaño de 3,07 MB permite embeber el modelo en dispositivos con memoria muy limitada para tareas de aislamiento de voz en tiempo real, aunque no se publican latencias.
- Preprocesado de llamadas en pipelines de voz: integrado como etapa previa a un ASR para limpiar la señal antes de la transcripción, aprovechando el bajo coste de almacenamiento del checkpoint.
- Despliegue en clústeres Kubernetes: gracias a `JouleKube`, se puede escalar horizontalmente el servicio de aislamiento de voz como un microservicio más, con el modelo cargado desde JouleDB.
- Experimentación en investigación sobre compresión sub-1-bit: sirve como caso de estudio reproducible de la técnica LittleBit-2 ⊕ SVF aplicada a un modelo de audio real.
- Prototipado de aplicaciones de audio en entornos sin GPU: al no requerir PyTorch ni pesos en FP16, encaja en contenedores ligeros o entornos con CPU.
- Archivado y distribución de modelos: el formato `.jsyn` con zstd + CRC32 facilita la verificación de integridad y la distribución de checkpoints pequeños en registros internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de compresión (224 tensores 2D, 441 vectores 1D, 58.178.056 parámetros, 110,97 MB en FP16, 3,07 MB en `.jsyn`, 36,12x de compresión, 0,1435 BPW). No hay datos de calidad de aislamiento de voz (p. ej. SI-SNR, SDR, PESQ) ni comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por el tamaño del checkpoint (3,07 MB comprimido, ~111 MB en FP16 equivalente) el modelo cabría holgadamente en cualquier GPU consumer, pero el consumo real depende del runtime JouleDB y del buffer de audio.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU moderna (RTX 3060 en adelante) sería suficiente en teoría, pero no hay confirmación del autor.
- Cabe en GPU consumer: sí, por tamaño; sin validación publicada.
- Opciones de despliegue: JouleDB (`jouledb serve --http-addr 127.0.0.1:8080`) con `JouleKube` para Kubernetes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.jsyn` no es compatible con ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `dcharlot65-openie/Inworld-Voice-Isolator-LittleBit` | 58.178.056 | no disponible | Apache 2.0 | `.jsyn` (JouleDB) | Compresión sub-1-bit, 3,07 MB |
| `inworld/voice-isolator` (modelo base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo original de Inworld para aislamiento de voz |
| Alternativas de voice isolation open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparativa con alternativas de la misma categoría no está disponible porque la información proporcionada no incluye otros modelos de aislamiento de voz con especificaciones verificables.

## Limitaciones y advertencias

- Pérdida de calidad no cuantificada: la compresión a 0,1435 BPW es extremadamente agresiva y no se publican métricas que confirmen la fidelidad respecto a `inworld/voice-isolator`.
- Sesgos: no documentados; al derivar de un modelo de audio de Inworld, podría heredar sesgos del dataset original, pero no hay información al respecto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en audio, el riesgo es artefactos o supresión excesiva de la señal vocal.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `inworld/voice-isolator` y las condiciones de JouleDB/JouleKube.
- Dependencia de un runtime propietario: el formato `.jsyn` solo es utilizable con JouleDB, lo que limita la portabilidad y la integración con el ecosistema estándar (Transformers, ONNX, GGUF).
- Madurez: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-24); sin evidencia de validación por terceros.
- Repositorio de 0,0 GB: el peso real del fichero `.jsyn` (3,07 MB) no aparece reflejado en el tamaño del repo, lo que sugiere posible falta de subida de artefactos o inconsistencia en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Inworld-Voice-Isolator-LittleBit
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
