# rdcmedia/parakeet

## Resumen

Parakeet es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA, publicado aqui como un espejo en formato ONNX por el usuario rdcmedia. La model card indica que se trata de una conversion realizada por istupakov (repositorio `istupakov/parakeet-tdt-0.6b-v2-onnx`) del modelo Parakeet TDT 0.6B v2 de NVIDIA, replicada sin modificaciones. El tag `nemo-conformer-tdt` identifica la arquitectura: un encoder Conformer de NeMo combinado con un decoder de tipo Token-and-Duration Transducer (TDT), una variante de los transducers clasicos que predice simultaneamente tokens y duraciones.

El modelo resuelve la transcripcion de audio a texto con un tamano de aproximadamente 0,6 mil millones de parametros y un repositorio de 0,7 GB, lo que sugiere pesos en ONNX probablemente en precision reducida (fp16 o int8) o una unica variante de inferencia. La relevancia de esta publicacion es practica: permite ejecutar un modelo ASR de NVIDIA en runtimes ONNX (ONNX Runtime, sin necesidad de la pila NeMo completa), lo que simplifica el despliegue en entornos de produccion y en CPU.

No obstante, la informacion disponible es muy limitada: la model card es un espejo minimo que solo reproduce la licencia y la atribucion, sin especificaciones tecnicas detalladas, idiomas soportados, benchmarks ni instrucciones de uso. Todo dato no confirmado en la informacion proporcionada se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decoder Token-and-Duration Transducer (TDT) |
| Parametros totales | 0,6 B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; la precision exacta no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es un encoder Conformer (combinacion de auto-atencion y convoluciones) seguido de un decoder TDT (Token-and-Duration Transducer). Los transducers TDT predicen en cada paso tanto el siguiente token como su duracion, lo que permite saltar frames de audio de forma adaptativa y reduce el coste computacional frente a los transducers clasicos, manteniendo el alineamiento monotono propio de los modelos streaming-friendly. El tag `nemo-conformer-tdt` confirma esta familia, pero la model card no detalla el numero de capas, dimensiones ocultas ni la configuracion exacta del encoder.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de horas de audio, la composicion linguistica ni si se aplicaron tecnicas de aumento de datos o ajuste fino supervisado. Tampoco se documenta en la informacion proporcionada si el modelo admite decodificacion streaming o si esta pensado exclusivamente para inferencia por lotes. La unica innovacion tecnica verificable es la propia conversion a ONNX, que habilita la ejecucion fuera de NeMo.

## Capacidades

- Reconocimiento automatico del habla (audio a texto) mediante un modelo transducer.
- Prediccion conjunta de tokens y duraciones (TDT), lo que permite alineamientos eficientes.
- Ejecucion mediante ONNX Runtime, sin dependencia de la pila NeMo de NVIDIA.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo ASR, no un LLM generativo).
- Capacidades multilingues: no disponibles (los idiomas no se especifican en la model card).
- Capacidades especiales (vision, audio de entrada adicional, thinking mode): no disponibles; la unica modalidad documentada es audio de entrada.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte audio de reuniones en texto para generar resumenes posteriores; su tamano de 0,6 B permite ejecutarlo en servidores modestos o incluso en CPU mediante ONNX Runtime.
- Subtitulado de video: integrado en un pipeline de extraccion de audio y segmentacion por VAD, el modelo puede producir subtitulos para contenido grabado; el formato ONNX facilita el despliegue en contenedores sin GPU.
- Dictado por voz en aplicaciones de escritorio: al no requerir la pila NeMo, puede empaquetarse con ONNX Runtime en aplicaciones locales, reduciendo la dependencia de servicios en la nube.
- Procesamiento por lotes de archivos de audio en backend: util para transcribir grandes volumenes de grabaciones (call centers, archivos de radio) con un coste de inferencia bajo gracias al tamano reducido del modelo.
- Prototipado rapido de funcionalidades ASR: investigadores que quieran evaluar un transducer Conformer frente a alternativas (Whisper, wav2vec) pueden usar este espejo ONNX sin configurar NeMo.
- Integracion en pipelines de accesibilidad: transcripcion en tiempo casi real de audio para personas con discapacidad auditiva, siempre que se valide el rendimiento real y los idiomas soportados, datos que no estan documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 0,6 B de parametros, en fp16 el modelo ocuparia aproximadamente 1,2 GB de pesos, y en int8 alrededor de 0,6 GB, pero la precision real de los pesos ONNX del repositorio no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU con al menos 2-4 GB de memoria libre deberia poder alojarlo en fp16, aunque esto no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: probable por el tamano (RTX 3060, RTX 4060 o superiores), pero no confirmado.
- Opciones de despliegue: ONNX Runtime (CPU y GPU) es la via natural dado el formato; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rdcmedia/parakeet (este repo) | 0,6 B (segun nombre) | no disponible | ONNX | CC BY 4.0 | Hugging Face, espejo de istupakov/parakeet-tdt-0.6b-v2-onnx |
| OpenAI Whisper (large-v3) | 1,55 B | 30 s de audio por ventana | safetensors, GGUF, ONNX | MIT | Hugging Face, ampliamente desplegado |
| NVIDIA Parakeet TDT 0.6B v2 (original) | 0,6 B | no disponible | NeMo (.nemo) | CC BY 4.0 | Hugging Face (NVIDIA) |

La comparativa con Whisper es la mas relevante por popularidad, pero no se dispone de datos de rendimiento de este espejo que permitan una comparacion cuantitativa. Frente al modelo original de NVIDIA, la unica diferencia documentada es el formato (ONNX frente a .nemo), lo que cambia el ecosistema de despliegue pero no el modelo en si.

## Limitaciones y advertencias

- La model card es un espejo minimo: no documenta idiomas, condiciones de audio, ni limitaciones conocidas, por lo que no se puede garantizar su comportamiento en produccion sin evaluacion propia.
- Riesgo de alucinacion: los modelos transducer pueden producir transcripciones plausibles en segmentos con ruido o silencio; no hay datos publicados sobre tasas de error en este espejo.
- Sesgos: no disponibles; al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos linguisticos o dialectales.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; es necesario citar a NVIDIA y respetar los terminos de la licencia original.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; es un espejo no oficial, por lo que conviene verificar la integridad de los pesos frente al repositorio de istupakov antes de usarlo en produccion.
- No se especifica la precision de los pesos ONNX ni si existe una variante cuantizada; el rendimiento real puede variar segun el runtime y el hardware.
- No hay garantia de soporte de streaming ni de inferencia en tiempo real; esto debe validarse empiricamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rdcmedia/parakeet
- Repositorio de la conversion ONNX original: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v2-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Modelo original de NVIDIA (referencia por nombre, no verificado en la busqueda): no disponible
