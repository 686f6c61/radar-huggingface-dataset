# Lucasgitguy-co/Fleet-2

## Resumen

Fleet-2 es un modelo de reconocimiento automático del habla (ASR) de tipo on-device desarrollado por Lucasgitguy-co, con un tamano de 30 MB y basado en la arquitectura Cactus Whistle. Se distribuye como un fine-tuning de Fleet-1 mediante destilación de secuencias a partir de las transcripciones generadas por openai/whisper-large-v3-turbo, siguiendo el enfoque de Distil-Whisper. El modelo cubre ocho idiomas (ingles, aleman, frances, espanol, italiano, neerlandes, polaco y coreano) y esta pensado para inferencia local en dispositivos con recursos limitados.

La relevancia de Fleet-2 radica en su reducido tamano (30 MB) combinado con soporte multilingue y cuantizacion W4/A8, lo que lo hace apto para despliegues en movil, navegador o sistemas embebidos. Sin embargo, la propia model card advierte que la mejora respecto a Fleet-1 no esta demostrada de forma consistente: solo supera a su predecesor en 4 de los 8 idiomas evaluados (aleman, frances, polaco y coreano), y en algunos casos retrocede. El modelo se publica con licencia Apache 2.0 y pesos en formato `.cact`, no en safetensors ni GGUF.

Es importante senalar que Fleet-2 no es un checkpoint de Transformers, sino un modelo Cactus que requiere el motor `cactus-compute` para su ejecucion. Esto limita su integracion a ecosistemas especificos y lo diferencia de alternativas como Whisper o Distil-Whisper, que cuentan con soporte amplio en frameworks como vLLM, llama.cpp o TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cactus Whistle (transformer encoder-decoder para ASR, segun Mroz et al., 2026) |
| Parametros totales | no disponible (tamano del artefacto: 30 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con clips de hasta 12 s) |
| Tipos de cuantizacion | W4/A8 (cuantizacion consciente durante el entrenamiento) |
| Idiomas soportados | en, de, fr, es, it, nl, pl, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (motor Cactus; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Fleet-2 emplea la arquitectura Cactus Whistle, un modelo ASR compacto disenado para inferencia on-device. El entrenamiento parte de Fleet-1 como checkpoint inicial (adaptador LoRA mas filas de vocabulario coreano) y aplica destilacion de secuencias: el profesor openai/whisper-large-v3-turbo transcribe audio nuevo y las transcripciones resultantes se usan como objetivo de entrenamiento. Dado que Whisper y Whistle usan tokenizadores distintos, no se igualaron logits, solo texto a nivel de secuencia.

Los datos de entrenamiento consistieron en 4326 clips (de 6400 etiquetados por el profesor), todos de 12 segundos o menos: 3014 clips nuevos de VoxPopuli (siete idiomas europeos) y Zeroth-Korean (coreano), mas 1312 clips de FLEURS ya usados en Fleet-1. El filtrado exigio ratio de compresion ≤ 2.4, log-probabilidad media ≥ -1.0, probabilidad de no-habla ≤ 0.6 y que el texto del profesor estuviera dentro del 10 % de WER (CER en coreano) respecto a la transcripcion humana. La optimizacion uso AdamW con tasa 2e-05, warmup/cosine, batch 1, 2 epocas (8652 pasos) y clip 1.0, con cuantizacion W4/A8 en CPU (Apple M4). El checkpoint final se selecciono en el paso 2163 por error macro de validacion (0.2212 frente a 0.2283 del modelo inicial).

## Capacidades

- Transcripcion de voz a texto en ocho idiomas: ingles, aleman, frances, espanol, italiano, neerlandes, polaco y coreano.
- Deteccion automatica de idioma en el motor Cactus nativo.
- Inferencia on-device con un artefacto de 30 MB, apto para entornos con memoria limitada.
- Procesamiento de clips cortos (hasta 12 segundos en entrenamiento).
- Cuantizacion W4/A8 integrada en el entrenamiento, lo que reduce el coste de despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el modelo cabe en 30 MB y puede ejecutarse localmente sin conexion, lo que permite dictado offline en iOS y Android con latencia baja y sin enviar audio a la nube.
- Subtitulado en tiempo real de reuniones o videollamadas: con clips cortos y deteccion automatica de idioma, se puede segmentar el audio en ventanas de hasta 12 s y transcribir en el dispositivo.
- Asistentes de voz embebidos en electrodomesticos o dispositivos IoT: el reducido tamano y la cuantizacion W4/A8 permiten integrarlo en hardware con poca RAM y sin GPU dedicada.
- Accesibilidad para personas con discapacidad auditiva: transcripcion local de conversaciones presenciales en varios idiomas europeos y coreano, sin depender de servicios externos.
- Procesamiento de audio en navegador mediante WebAssembly: al ser un modelo Cactus compacto, puede desplegarse en el cliente para dictado en formularios web sin backend.
- Investigacion en destilacion ASR: el repositorio incluye `training_manifest.json`, `evaluation.json` y scripts (`fleet2.py`, `teacher.py`, `run.sh`) que permiten reproducir el pipeline de destilacion y evaluar el impacto de la seleccion de datos.
- Transcripcion de reuniones parlamentarias o discursos politicos: entrenado parcialmente con VoxPopuli (Parlamento Europeo), puede usarse para transcribir sesiones en los siete idiomas europeos cubiertos, aunque con WER variable segun idioma.

## Benchmarks y rendimiento

Resultados en clips cortos de FLEURS (100 clips por idioma, ≤ 12 s), WER en porcentaje (menor es mejor); coreano usa CER:

| Idioma | Metrica | Whistle | Sky-Kim | Fleet-1 | Fleet-2 |
|---|---|---:|---:|---:|---:|
| en | WER | 13.86 | 14.87 | 14.39 | 14.50 |
| de | WER | 22.45 | 22.71 | 22.18 | 22.02 |
| fr | WER | 22.15 | 25.73 | 25.18 | 24.93 |
| es | WER | 11.83 | 11.83 | 11.93 | 11.93 |
| it | WER | 17.44 | 16.60 | 16.32 | 16.66 |
| nl | WER | 32.95 | 29.39 | 29.53 | 30.06 |
| pl | WER | 45.38 | 43.68 | 43.13 | 41.62 |
| ko | CER | n/a | 33.68 | 52.35 | 42.80 |

Resultados fuera de dominio (VoxPopuli / Zeroth-Korean, 50 clips por idioma):

| Idioma | Fuente | Whistle | Sky-Kim | Fleet-1 | Fleet-2 |
|---|---|---:|---:|---:|---:|
| en | VoxPopuli | 10.56 | 12.69 | 10.91 | 11.98 |
| de | VoxPopuli | 17.32 | 19.66 | 19.53 | 18.36 |
| fr | VoxPopuli | 13.06 | 12.24 | 12.04 | 13.57 |
| es | VoxPopuli | 9.99 | 11.89 | 11.70 | 11.04 |
| it | VoxPopuli | 34.45 | 40.21 | 38.22 | 33.19 |
| nl | VoxPopuli | 23.06 | 23.29 | 23.17 | 22.95 |
| pl | VoxPopuli | 22.02 | 23.53 | 22.98 | 23.53 |
| ko | Zeroth-Korean | n/a | 25.19 | 15.65 | 13.24 |

La model card advierte que estos resultados provienen de clips cortos, no son pruebas de significancia estadistica y que la mejora sobre Fleet-1 no esta demostrada de forma global. En el conjunto fuera de dominio, Fleet-2 entreno con otros clips de los mismos corpus, por lo que la tabla refleja generalizacion intra-corpus, no una prueba independiente.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el artefacto pesa 30 MB y esta cuantizado en W4/A8, por lo que cabe en memoria de dispositivos moviles.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en CPU (Apple M4). La inferencia esta pensada para CPU y aceleradores ligeros.
- Cabe en GPU de consumo: si, aunque el objetivo principal es CPU y dispositivos embebidos.
- Opciones de despliegue: motor `cactus-compute` (revision `ee2ffc67fe0f9537d4928e158440c7d228a63100`). No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fleet-2 | no disponible (30 MB) | clips ≤ 12 s | 8 | Apache 2.0 | `.cact` | Destilado de Whisper-large-v3-turbo; requiere Cactus |
| Fleet-1 | no disponible | clips ≤ 12 s | 8 | Apache 2.0 | `.cact` | Predecesor; Fleet-2 mejora en 4 de 8 idiomas |
| Whistle (Cactus) | no disponible | no disponible | 7 (sin coreano) | Apache 2.0 | `.cact` | Modelo base de la arquitectura; sin soporte coreano |
| Sky-Kim/whistle-finetuned-ko | no disponible | no disponible | coreano | no disponible | `.cact` | Fine-tuning coreano de Whistle |
| Whisper-large-v3-turbo | 809 M (aproximado, no confirmado en la informacion) | 30 s | multilingue | MIT | safetensors | Profesor del pipeline; mucho mayor y no on-device |

## Limitaciones y advertencias

- La mejora sobre Fleet-1 no esta demostrada de forma global: solo supera a Fleet-1 en 4 de 8 idiomas (de, fr, pl, ko) y retrocede en en, es, it y nl en el conjunto FLEURS.
- El WER es alto en varios idiomas (polaco 41.62 %, neerlandes 30.06 %, coreano 42.80 % CER), lo que limita su uso en produccion para esos idiomas sin revision humana.
- Entrenado exclusivamente con clips de hasta 12 segundos; no se ha medido el rendimiento en audio largo, ruidoso o conversacional.
- Los resultados de benchmarks provienen de clips cortos y no constituyen pruebas de significancia estadistica.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR destilados, especialmente en audio con ruido o acentos no representados.
- Sesgos potenciales derivados de los corpus de entrenamiento (VoxPopuli, discurso parlamentario; FLEURS, lectura; Zeroth-Korean), que pueden no representar el habla coloquial.
- Requiere el motor `cactus-compute` en una revision concreta; no es compatible con el ecosistema Transformers estandar.
- Licencia Apache 2.0 permite uso comercial, pero se mantiene la licencia original de Whistle y se debe respetar la atribucion a Cactus Compute, Sky-Kim y Lucasgitguy-co.
- El repositorio no incluye audio; los datos de entrenamiento tienen licencias CC0, CC BY 4.0 y CC BY 4.0, que deben respetarse en cualquier redistribucion derivada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/Fleet-2
- Modelo base Fleet-1: https://huggingface.co/Lucasgitguy-co/Fleet-1
- Coleccion Speech recognition: https://huggingface.co/collections/Lucasgitguy-co/speech-recognition-6aef2dcbe0ea208136b0ddc9
- Sky-Kim/whistle-finetuned-ko: https://huggingface.co/Sky-Kim/whistle-finetuned-ko
- Profesor openai/whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset Zeroth-Korean: https://www.openslr.org/40/
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Referencia Distil-Whisper (mencionada en la model card, sin enlace directo): no disponible
- Paper de Whistle (Mroz et al., 2026): no disponible en la informacion proporcionada
