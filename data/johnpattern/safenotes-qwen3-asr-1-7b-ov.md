# johnpattern/safenotes-qwen3-asr-1.7b-ov

## Resumen

`safenotes-qwen3-asr-1.7b-ov` es una conversión de formato del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El autor de esta variante, johnpattern (proyecto Safenotes), ha exportado el checkpoint original a OpenVINO IR con pesos cuantizados a int8 mediante NNCF y `optimum-intel`, con el objetivo de que el modelo se ejecute de forma eficiente sobre hardware Intel (CPU integradas, iGPU y NPU). No se ha reentrenado ni modificado el modelo: es exclusivamente una conversión de formato.

El modelo base Qwen3-ASR-1.7B forma parte de la familia Qwen3-ASR, que incluye las variantes de 1.7B y 0.6B parámetros y que soporta identificación de idioma y transcripción en 52 idiomas y dialectos. Se apoya en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni y en datos de entrenamiento de voz a gran escala. Su relevancia actual radica en que ofrece ASR multilingüe de código abierto con licencia Apache-2.0 y un tamaño contenido (1.7B), lo que permite despliegue local.

Esta variante concreta está pensada para el caso de uso de Safenotes, una aplicación de toma de notas de reuniones que funciona íntegramente en el PC del usuario: la app descarga los ficheros de una revisión fijada del repositorio, verifica el sha256 de cada uno y ejecuta la transcripción en local, sin que el audio ni el texto salgan del dispositivo. El repositorio ocupa 2,1 GB y contiene 12 ficheros (2.060.263.598 bytes en total).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-1.7B; encoder + decoder exportados como grafo OpenVINO) |
| Parametros totales | 1,7B (según denominación del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos comprimidos con NNCF durante la exportación) |
| Idiomas soportados | 52 idiomas y dialectos (según la familia Qwen3-ASR); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) para encoder, decoder, tokenizer y detokenizer |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento del habla que combina un encoder de audio con un decoder de lenguaje, apoyándose en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. La familia Qwen3-ASR se entrenó con datos de voz a gran escala y soporta identificación de idioma junto con la transcripción en 52 idiomas y dialectos. No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

En cuanto a esta variante, el proceso aplicado por Safenotes consiste en exportar el checkpoint original con `optimum-intel` (OpenVINO), comprimir los pesos a int8 con NNCF y convertir el tokenizer a IRs de OpenVINO mediante `openvino-tokenizers`. Los ficheros de configuración (`config.json`, `preprocessor_config.json`, `tokenizer_config.json`, `added_tokens.json`) se generan tal cual durante la exportación, y el resto de ficheros necesarios (`vocab.json`, `merges.txt`, etc.) se descargan byte a byte del repositorio upstream. No hay reentrenamiento ni ajuste fino.

## Capacidades

- Reconocimiento automático del habla (ASR) con transcripción de audio a texto.
- Identificación de idioma integrada, según las capacidades de la familia Qwen3-ASR.
- Cobertura de 52 idiomas y dialectos (según la documentación del modelo base).
- Ejecución local en hardware Intel mediante OpenVINO, con pesos int8.
- Inferencia sobre CPU, iGPU y NPU de Intel (gracias al backend OpenVINO).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Transcripción de reuniones en local: es el caso de uso principal para el que se publicó esta variante; Safenotes descarga el modelo, verifica la integridad de cada fichero por sha256 y genera la transcripción en el PC del usuario sin enviar audio a la nube.
- Notas de voz privadas en entornos corporativos: al ejecutarse íntegramente en el dispositivo con OpenVINO, encaja en escenarios con requisitos de confidencialidad donde no se permite subir audio a servicios externos.
- Subtitulado y transcripción de grabaciones en equipos con CPU Intel: el formato OpenVINO int8 permite desplegar el modelo en portátiles y estaciones de trabajo sin GPU dedicada, reduciendo el coste de infraestructura.
- Aplicaciones de accesibilidad: dictado y conversión de voz a texto para usuarios con dificultades motoras, aprovechando el soporte multilingüe del modelo base.
- Indexación y búsqueda de contenido hablado: transcripción de archivos de audio o vídeo para alimentar motores de búsqueda o sistemas de gestión documental.
- Procesamiento por lotes de audio en servidores con CPU Intel: el formato OpenVINO permite ejecutar la inferencia en hardware Intel de servidor sin depender de aceleradores NVIDIA.
- Prototipado de pipelines ASR multilingües: la cobertura de 52 idiomas y dialectos del modelo base facilita experimentar con transcripción en varios idiomas desde un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye métricas de WER, latencia ni throughput, y los resultados de búsqueda solo mencionan que el modelo base realiza experimentos de evaluación sin aportar cifras concretas.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 2,1 GB; los pesos int8 del decoder ocupan aproximadamente 1,72 GB y los del encoder unos 325 MB, por lo que se necesita del orden de 2-3 GB de memoria para cargar el modelo, más el espacio adicional para activaciones y buffers de inferencia.
- GPU recomendadas: al ser un formato OpenVINO, está orientado a hardware Intel (CPU, iGPU y NPU). No se documentan requisitos para GPU NVIDIA.
- Cabe en hardware de consumo: sí, por tamaño; es adecuado para equipos con CPU Intel modernas y para iGPU/NPU Intel compatibles con OpenVINO.
- Opciones de despliegue: OpenVINO Runtime con `optimum-intel`; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| safenotes-qwen3-asr-1.7b-ov | 1,7B | no disponible | 52 (familia Qwen3-ASR) | Apache-2.0 | OpenVINO IR int8 |
| Qwen/Qwen3-ASR-1.7B | 1,7B | no disponible | 52 (familia Qwen3-ASR) | Apache-2.0 | safetensors (formato original) |
| Qwen3-ASR-0.6B | 0,6B | no disponible | 52 (familia Qwen3-ASR) | Apache-2.0 | safetensors (formato original) |

La comparación se limita a la propia familia Qwen3-ASR porque la información disponible no incluye datos de rendimiento ni de otros modelos ASR comparables. La diferencia clave entre esta variante y el modelo base es el formato (OpenVINO IR int8 frente a safetensors) y el público objetivo (hardware Intel frente a despliegue genérico).

## Limitaciones y advertencias

- Es una conversión no oficial: los autores originales de Qwen3-ASR no respaldan esta variante.
- No se ha reentrenado ni evaluado el modelo tras la cuantización a int8; no hay datos publicados sobre la degradación de precisión (WER) respecto al checkpoint original.
- La model card se distribuye "as is", sin garantías de ningún tipo, incluida la idoneidad para un propósito concreto o la exactitud de la salida.
- El formato OpenVINO limita el despliegue a hardware Intel; no es directamente utilizable en GPU NVIDIA ni en otros backends sin reconversión.
- No se dispone de información sobre sesgos del modelo, comportamiento en dominios específicos (acentos, ruido, jerga técnica) ni limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de una conversión de un modelo de terceros conviene conservar la atribución al equipo Qwen.
- Riesgo de alucinación en la transcripción: no hay datos publicados sobre la tasa de errores en condiciones adversas.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/johnpattern/safenotes-qwen3-asr-1.7b-ov
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Revisión concreta del modelo base citada: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/tree/7278e1e70fe206f11671096ffdd38061171dd6e5
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
