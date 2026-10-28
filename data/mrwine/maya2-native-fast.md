# mrwine/maya2-native-fast

## Resumen
maya2-native-fast es una conversión a ONNX pensada para inferencia en CPU del modelo de síntesis de voz maya-research/maya2-native, publicada por el usuario mrwine. No es un fine-tune: los pesos se convierten desde el checkpoint original y no se usan datos de entrenamiento adicionales. El objetivo es eliminar la dependencia de PyTorch en tiempo de ejecución y recortar el consumo de memoria, manteniendo la síntesis en marathi e hindi.

El sistema encadena un backbone transformer Qwen3 de 28 capas (derivado de Qwen3-1.7B-Base) cuantizado a int8, un sampler de profundidad de 15 niveles en fp16 y el decodificador de audio Mimi de Kyutai. La salida es audio mono a 24 kHz, generado por frames de unos 80 ms.

Es relevante para despliegues de TTS en entornos sin GPU y con pocas dependencias: el runtime usa numpy, onnxruntime y tokenizers, con un pico de memoria de aproximadamente 3,9 GB. A cambio, no alcanza tiempo real (RTF de 4,43 a 4,67 medido en un Apple M-series) y el backbone int8 se queda por debajo del objetivo de fidelidad top-1 que fija el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3 de 28 capas + sampler de profundidad de 15 niveles + decodificador de audio Mimi |
| Parametros totales | no disponible (el backbone deriva de Qwen3-1.7B-Base; no se publica el conteo agregado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se reportan tokens en caché de 32, 256 y 768, no la ventana máxima) |
| Tipos de cuantizacion | int8 en el backbone (MatMulNBits, bloque 32), fp16 en el sampler de profundidad, fp32 en Mimi, bf16 en las tablas de embeddings |
| Idiomas soportados | marathi (mr) e hindi (hi); el hindi funciona a nivel mecánico pero no se ha comprobado su calidad |
| Licencia | Apache-2.0 (con atribución CC-BY-4.0 para el decodificador Mimi) |
| Formato de pesos | ONNX (grafos y ficheros .data), binarios bf16 memory-mapped, npz y tokenizer.json; runtime sin torch |
| Frecuencia de muestreo | 24 kHz mono |
| Tamano del repositorio | 3,8 GB |
| Runtime | numpy + onnxruntime + tokenizers, sin PyTorch |

## Arquitectura y entrenamiento
El pipeline sigue un esquema de TTS neuronal basado en tokens discretos de audio. El texto se procesa con un tokenizer extendido y un prompt portado desde el checkpoint original; un backbone Qwen3 de 28 capas genera los códigos semánticos, un sampler de profundidad de 15 niveles produce los códigos acústicos residuales mediante muestreo Gumbel top-k implementado dentro del grafo, y el decodificador Mimi convierte esos códigos en forma de onda a 24 kHz con frames de unos 80 ms (aproximadamente 12,5 frames por segundo). El acondicionamiento de locutor emplea SpeechBrain ECAPA-TDNN, y las voces con nombre se resuelven desde voices.json.

No hay entrenamiento: la model card indica explícitamente que los pesos se convierten desde el checkpoint upstream y que no se usaron datos de entrenamiento. Las innovaciones son de despliegue: cuantización int8 del backbone con MatMulNBits, almacenamiento fp16 del sampler de profundidad, embeddings bf16 memory-mapped, verificación de assets contra un manifest con sha256 y un runtime que rechaza ficheros corruptos o incompletos. El autor documenta de dónde procede cada componente: Maya2 Native (Apache-2.0), Mimi de Kyutai (CC-BY-4.0), Qwen3-1.7B-Base (Apache-2.0) y SpeechBrain ECAPA-TDNN (Apache-2.0). El modelo no añade marca de agua de audio.

## Capacidades
- Síntesis de voz (texto a audio) en marathi y, de forma mecánica, en hindi.
- Generación de audio mono a 24 kHz con frames de 80 ms mediante el códec Mimi.
- Selección de voz con nombre desde voices.json (por defecto, Charvi), insensible a mayúsculas y minúsculas.
- Control de reproducibilidad: misma semilla y mismo número de hilos producen el mismo audio.
- Ejecución en CPU con un runtime sin PyTorch, basado en numpy, onnxruntime y tokenizers.
- Uso como CLI (`python -m src.maya_fast`) y como API de Python (`MayaFast.synthesize`), que devuelve la onda en float32 y métricas.
- Control del número de hilos de ONNX Runtime y del idioma mediante etiquetas `mr` y `hi`.
- Verificación de integridad de los assets al cargar mediante manifest.json.
- No soporta reproducción en tiempo real ni, según la información disponible, tool calling, agentes o multimodalidad más allá del audio.

## Casos de uso
- Síntesis por lotes para medios en marathi: pre-generar la locución de artículos o boletines y publicar el audio resultante, aprovechando que el modelo funciona en CPU y no necesita GPU dedicada.
- Audiolibros y contenido largo por trozos: dividir el texto en frases y sintetizar cada una con una voz fija de voices.json, manteniendo consistencia de locutor y usando la semilla para reproducibilidad.
- Voice-over para vídeo ya producido: generar la pista de voz a partir del guion y montarla en postproducción, un escenario compatible con un RTF superior a 1 y sin requisitos de streaming.
- Accesibilidad diferida: convertir documentos o avisos a audio en un servicio de fondo, con un pico de memoria de unos 4 GB que permite consolidar varias instancias en un servidor sin GPU.
- Prototipado en entornos restringidos: equipos de desarrollo que no pueden instalar PyTorch o que trabajan en contenedores pequeños pueden integrar la síntesis con onnxruntime y numpy.
- Evaluación comparativa de conversiones ONNX: el repositorio incluye scripts de exportación y tests, útil para reproducir la conversión desde el checkpoint upstream o para medir el impacto de la cuantización int8.
- Pre-generación en pipelines de CI/CD: producir avisos o mensajes de estado en marathi como artefactos de build, dado que el modelo es determinista con la misma semilla e hilos.

## Benchmarks y rendimiento
Resultados medidos por el autor en un Apple M-series, solo CPU, 8 hilos:

| Comprobacion | Resultado | Objetivo | Estado |
|---|---|---|---|
| Depth fp16 frente a referencia fp32, 75 ficheros | top-1 >= 0,9965 en cada nivel, KL <= 6e-6 | top-1 >= 0,98, KL <= 0,02 | pasa |
| Depth fp32 frente a PyTorch upstream, 20 frames | rel 1,6e-6 | rel <= 1e-4 | pasa |
| Decodificador Mimi frente a upstream | max abs 1,5e-6 | <= 1e-4 | pasa |
| Port del prompt frente a upstream, 500 prompts | 0 discrepancias de token, error de embedding máximo 7,5e-9 | <= 1e-5 | pasa |
| Backbone int8 frente a fp32, teacher-forced | top-1 0,9677, KL 0,0034 | top-1 >= 0,99 | falla (eximido) |
| Velocidad del backbone, 8 hilos | 48 / 58 / 82 ms por token con 32 / 256 / 768 tokens en caché | <= 35 ms a 256 | falla (eximido) |
| Extremo a extremo, una frase en marathi (2,96 s de audio), dos ejecuciones | RTF 4,67 y 4,43 | RTF offline <= 4 | falla |
| RSS pico extremo a extremo | 3,9 GB | objetivo <= 3 GB, límite 5 GB | por encima del objetivo |

Desglose de velocidad:

| Etapa | Medición | Notas |
|---|---|---|
| Backbone int8, 28 capas | 48 ms por token a 32 tokens en caché, 58 ms a 256, 82 ms a 768 | mediana de 200 pasos, un token por paso |
| Sampler de profundidad fp16, 15 niveles | 155 ms por frame | mediana de 30 llamadas |
| Decodificador Mimi | aproximadamente 1 ms por frame | 80 ms de audio por frame |
| Extremo a extremo, frase de 2,96 s | RTF 4,67 y 4,43; entre 13,1 y 13,8 s de pared | incluye prompt, prefill y decode |

Comparación con la ruta PyTorch upstream en CPU similar: RTF 4,62 (mejor caso, bf16) y RSS pico de 7,5 a 8,0 GB. La ganancia de esta conversión es memoria y dependencias, no throughput.

## Requisitos de hardware
- Memoria: pico de RSS de aproximadamente 3,9 GB durante la síntesis de una frase; el repositorio ocupa 3,8 GB en disco.
- Componentes en memoria: backbone int8 de 1,6 GB, sampler de profundidad fp16 de 873 MB, decodificador Mimi fp32 de 195 MB y tablas de embeddings bf16 memory-mapped.
- CPU: ejecución solo con CPU; el autor usa 8 hilos de ONNX Runtime. Python 3.10 a 3.13.
- GPU: no se documenta el uso de execution providers CUDA o ROCm; no disponible.
- Cabe en equipos de consumo sin GPU dedicada, siempre que se disponga de unos 4 GB de RAM libres; el RTF no permite reproducción en tiempo real.
- Despliegue: onnxruntime con numpy y tokenizers, mediante CLI o API de Python. No aplica vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de TTS y no un LLM de texto.
- Latencia: entre 13,1 y 13,8 s de pared para 2,96 s de audio en un Apple M-series con 8 hilos; el coste del backbone escala con los tokens en caché (de 48 a 82 ms por token).

## Comparativa con modelos similares

| Modelo | Parametros | Runtime | Memoria pico | RTF (CPU) | Licencia | Formato |
|---|---|---|---|---|---|---|
| maya2-native-fast (este) | backbone derivado de Qwen3-1.7B, int8, + sampler de profundidad | ONNX, sin torch | 3,9 GB | 4,43 a 4,67 | Apache-2.0 | ONNX + binarios bf16 |
| maya-research/maya2-native (upstream) | el mismo checkpoint original | PyTorch | 7,5 a 8,0 GB | 4,62 (bf16) | Apache-2.0 | PyTorch |
| Otras alternativas de TTS en marathi/hindi | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con otros sistemas de TTS; los únicos datos verificables son los del modelo upstream.

## Limitaciones y advertencias
- El backbone int8 no alcanza el objetivo de fidelidad top-1 (0,9677 frente a 0,99): cabe esperar pequeñas diferencias en los códigos generados respecto a la referencia fp32.
- El RTF medido (4,43 a 4,67) supera el objetivo offline de 4 y está muy por encima de 1, por lo que no hay reproducción en tiempo real.
- El pico de memoria (3,9 GB) supera el objetivo de 3 GB fijado por el autor, aunque queda por debajo del límite de 5 GB.
- El hindi funciona a nivel mecánico, pero su calidad no se ha comprobado; no hay evaluación subjetiva publicada.
- No se han realizado pruebas de escucha (listening tests) sobre la calidad final del audio.
- Al ser una conversión de pesos sin entrenamiento, hereda cualquier sesgo y limitación del checkpoint upstream; la información disponible no detalla sesgos específicos de locutor, género o acento.
- El catálogo de voces se limita a las definidas en voices.json; no se documenta clonación de voz a partir de audio de referencia en este paquete.
- La licencia Apache-2.0 permite uso comercial, pero el decodificador Mimi es CC-BY-4.0 y exige mantener la atribución indicada en NOTICE.
- Los assets se validan contra manifest.json; una descarga parcial o corrupta provoca un error explícito, pero no hay mecanismo de recuperación automática.
- El modelo no añade marca de agua de audio, lo que puede ser un problema para trazabilidad en producción.
- La ventana de contexto efectiva no está documentada; el rendimiento medido se limita a 32, 256 y 768 tokens en caché.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mrwine/maya2-native-fast
- Modelo base (upstream): https://huggingface.co/maya-research/maya2-native
- Decodificador Mimi de Kyutai: https://huggingface.co/kyutai/mimi
- Backbone Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Acondicionamiento de locutor SpeechBrain ECAPA-TDNN: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
