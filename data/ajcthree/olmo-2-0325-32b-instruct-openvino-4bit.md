# AJCThree/OLMo-2-0325-32B-Instruct-openvino-4bit

## Resumen

Este repositorio contiene una conversión a OpenVINO del modelo allenai/OLMo-2-0325-32B-Instruct, con los pesos comprimidos a 4 bits mediante NNCF (Neural Network Compression Framework). Se trata por tanto de un artefacto de despliegue, no de un modelo nuevo: el autor (AJCThree) parte del modelo instruct de 32.000 millones de parámetros publicado por el Allen Institute for AI (AI2) y lo empaqueta en formato OpenVINO IR para ejecución optimizada sobre hardware Intel (CPU, iGPU, GPU Arc/NPU).

El interés práctico de esta conversión es que reduce los pesos de aproximadamente 64 GB en bf16 a unos 17,2 GB (tamaño real del repositorio), lo que permite servir un modelo de 32B en estaciones de trabajo y servidores Intel sin GPU dedicada de gran capacidad. La familia OLMo 2 es además completamente abierta: pesos, datos de entrenamiento (Dolma) y recetas de entrenamiento están publicados, algo poco habitual en modelos de este tamaño.

El modelo base es un transformer decoder-only de la familia OLMo 2 en su variante Instruct, con licencia Apache 2.0. No se ha publicado en este repositorio ninguna ficha técnica con detalles de calibración, idiomas, longitud de contexto ni evaluación del impacto de la cuantización. Las búsquedas web realizadas no han devuelto información relevante sobre este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2); el repositorio distribuye el artefacto en formato OpenVINO IR |
| Parametros totales | 32B aproximadamente (según el nombre del modelo y el modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 sobre pesos (weight-only) mediante NNCF; el nombre del repositorio indica "4bit" |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base se entrena con el dataset Dolma, de composición mayoritariamente inglesa |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin) con pesos comprimidos a INT4; no se indica la presencia de safetensors ni GGUF |

Datos adicionales del repositorio: 17,2 GB de tamaño, 0 descargas, 0 likes, creado el 2026-09-16 y actualizado el 2026-09-16. Etiqueta de pipeline declarada: `text-classification` (contradice la etiqueta `text-generation` incluida en los tags). Modelo base declarado: allenai/OLMo-2-0325-32B-Instruct. Librería: transformers.

## Arquitectura y entrenamiento

El modelo base pertenece a la segunda generación de la familia OLMo de AI2: un transformer decoder-only con normalización RMSNorm reordenada (aplicada después de los subloques de atención y MLP en lugar de antes), QK-Norm sobre consultas y claves, activación SwiGLU, eliminación de sesgos en las capas lineales y embeddings posicionales rotatorios (RoPE). No es un modelo MoE ni híbrido SSM: es un transformer denso convencional. El informe técnico de OLMo 2 documenta un preentrenamiento sobre la mezcla de datos abiertos derivada de Dolma, una fase de midtraining sobre la mezcla Dolmino, y un ajuste posterior con SFT y DPO para las variantes Instruct. El número exacto de tokens de entrenamiento no se especifica en la información proporcionada.

Este repositorio no entrena ni modifica el modelo: aplica compresión de pesos INT4 con NNCF sobre el checkpoint instruct. La información disponible no detalla el dataset de calibración, el tamaño de grupo de cuantización, si la cuantización es simétrica o asimétrica, ni si se aplicó compresión adicional de la caché KV. En tiempo de ejecución, OpenVINO descomprime los pesos a un tipo de mayor precisión (habitualmente f16 o bf16) antes de las operaciones matriciales, por lo que la memoria efectiva necesaria supera el tamaño del archivo de pesos.

## Capacidades

- Generación de texto y seguimiento de instrucciones: es la función principal del modelo base en su variante Instruct.
- Razonamiento, matemáticas y código: capacidades documentadas por AI2 para la familia OLMo 2 32B Instruct en su informe técnico, aunque los valores concretos no se incluyen en la información proporcionada.
- Clasificación y extracción de información mediante prompts: el repositorio declara la etiqueta `text-classification`, que en la práctica se implementaría con prompts generativos, no con una cabeza de clasificación específica.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; el dataset de preentrenamiento del modelo base es predominantemente inglés.
- Capacidades especiales (modo de pensamiento explícito, visión, audio): no documentadas ni presentes en la arquitectura del modelo base.
- Inferencia sobre hardware Intel mediante OpenVINO: CPU, iGPU, GPU Arc y NPU, con optimizaciones específicas del runtime.

## Casos de uso

- Servicio de atención al cliente en servidores Intel sin GPU: el modelo puede gestionar conversaciones multi-turno y generar respuestas en lenguaje natural ejecutándose íntegramente sobre CPU Xeon con instrucciones AMX, con un coste de infraestructura muy inferior al de servir el checkpoint en bf16.
- Asistente interno on-premise con datos sensibles: al ser un modelo Apache 2.0 y ejecutarse en local mediante OpenVINO, permite desplegar asistentes sobre documentación corporativa sin enviar datos a APIs externas ni depender de proveedores cloud.
- Generación de documentación técnica y resumen de informes en procesos por lotes: el modelo puede procesar grandes volúmenes de texto en pipelines nocturnos sobre CPU, donde el throughput importa más que la latencia por petición.
- Clasificación y extracción estructurada a escala: uso del modelo como etiquetador mediante plantillas de prompt (categorización de tickets, extracción de entidades, análisis de sentimiento) para lotes donde un modelo de 32B ofrece mayor precisión que alternativas de 7B-8B.
- RAG sobre corpus internos: combinación con una base vectorial para responder preguntas sobre manuales, contratos o documentación técnica, ejecutando tanto el recuperador como el generador en el mismo nodo Intel.
- Asistencia de programación en IDE o revisión de código en CI: generación de explicaciones, refactorizaciones y borradores de tests, con el backend OpenVINO ejecutándose en la estación de trabajo del desarrollador o en un runner con CPU Intel.
- Despliegue en estaciones de trabajo y equipos de borde Intel: prototipado y demos en portátiles con Core Ultra o equipos con GPU Arc profesional, aprovechando la compresión INT4 para ajustar el modelo a la memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ninguna evaluación del modelo cuantizado, y las búsquedas web realizadas no han devuelto resultados relacionados con este artefacto. El modelo base dispone de evaluaciones publicadas por AI2 en el informe técnico de OLMo 2, pero no se reproducen aquí porque sus cifras no forman parte de la información proporcionada. Como referencia cualitativa, la cuantización weight-only a INT4 puede degradar ligeramente la calidad respecto al checkpoint en bf16, especialmente en tareas de razonamiento matemático y generación de código; el grado exacto de degradación en este artefacto no está medido.

## Requisitos de hardware

- Pesos: 17,2 GB en disco (tamaño del repositorio). Es la cifra mínima de memoria para cargar el modelo, sin contar la caché KV ni los búferes de activación.
- Memoria estimada en ejecución: del orden de 20-22 GB o más, ya que OpenVINO descomprime los pesos a f16/bf16 durante la inferencia y hay que sumar la caché KV y los tensores intermedios. Se recomienda al menos 32 GB de RAM en configuraciones CPU.
- CPU: viable en procesadores Intel modernos con AVX-512; el rendimiento mejora notablemente en Xeon escalable de 4.ª generación o posterior (Sapphire Rapids y siguientes) con AMX. En CPU sin AMX la generación será sustancialmente más lenta.
- GPU: el plugin GPU de OpenVINO soporta únicamente GPU Intel. Una GPU Arc de 16 GB no es suficiente para los pesos completos; se necesita una Arc Pro con 24 GB o superior, o repartir la ejecución entre varios dispositivos con `MULTI`/`HETERO`.
- GPU NVIDIA: no compatible con este artefacto, ya que OpenVINO no soporta CUDA. Para usar una RTX 4090 o similar habría que partir del checkpoint original en safetensors o convertirlo a GGUF.
- NPU: no recomendable para un modelo de 32B. La NPU de los procesadores Core Ultra comparte memoria con el sistema y está pensada para modelos mucho más pequeños; el cuello de botella es el ancho de banda de memoria y el tamaño del modelo.
- Cabe en GPU de consumo: no en el formato distribuido aquí. Los pesos INT4 (17,2 GB) más la caché KV y las activaciones superan los 16 GB de una GPU de consumo típica y solo encajarían, con riesgo, en tarjetas de 24 GB, que además deberían ser Intel para usar OpenVINO.
- Opciones de despliegue: OpenVINO GenAI (`LLMPipeline`), OpenVINO Model Server (OVMS), carga con `transformers` mediante `optimum-intel`, o scripts propios con la API de OpenVINO Runtime. No es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual, ya que estos requieren safetensors, GGUF u otro formato soportado.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware (presencia de AMX, número de núcleos, ancho de banda de memoria) y de la configuración de decodificación; no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato principal | Licencia | Desarrollador | Notas |
|---|---|---|---|---|---|
| Este repositorio (OLMo-2-0325-32B-Instruct-openvino-4bit) | 32B | OpenVINO IR INT4, 17,2 GB | Apache 2.0 | Conversion de AJCThree | Optimizado para hardware Intel; sin ficha tecnica ni evaluacion publicada |
| allenai/OLMo-2-0325-32B-Instruct | 32B | safetensors en bf16 | Apache 2.0 | Allen Institute for AI | Modelo original con informe tecnico y datos de entrenamiento publicados |
| Qwen2.5-32B-Instruct | 32B | safetensors, GGUF (comunidad) | Apache 2.0 | Alibaba | Alternativa de tamano comparable; ecosistema de cuantizaciones amplio |
| Gemma 3 27B Instruct | 27B | safetensors, GGUF | Terminos de uso de Gemma | Google | Tamano similar; licencia mas restrictiva que Apache 2.0 |
| Mistral Small 3 (24B) | 24B | safetensors, GGUF | Apache 2.0 | Mistral AI | Inferencia mas rapida por menor numero de parametros |

La comparación de contexto, rendimiento en benchmarks y rendimiento multilingüe no se incluye porque esos datos no están disponibles en la información proporcionada para este artefacto. La ventaja diferencial de este repositorio no es la calidad del modelo, sino el formato: pesos INT4 listos para ejecutar en hardware Intel sin conversión previa.

## Limitaciones y advertencias

- Ausencia total de ficha técnica: el repositorio no documenta el proceso de cuantización, el dataset de calibración, el tamaño de grupo, ni ninguna métrica. No hay garantía de que la calidad se mantenga respecto al modelo original en bf16.
- Etiqueta de pipeline incoherente: figura `text-classification` pese a que el modelo es generativo y los tags incluyen `text-generation`. Hay que tratarlo como modelo de generación de texto.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, y potencialmente agravado por la cuantización agresiva a 4 bits en tareas de razonamiento y matemáticas.
- Sesgos conocidos: el modelo base se entrena sobre Dolma, con predominio de contenido web en inglés, lo que arrastra sesgos de representación y un sesgo cultural anglosajón.
- Idiomas: el rendimiento en castellano no está documentado y previsiblemente será inferior al inglés, tanto por la composición del dataset como por la ausencia de evaluación específica.
- Longitud de contexto: no disponible en la información proporcionada. Antes de usarlo con documentos largos hay que verificar experimentalmente el límite real y el comportamiento más allá de él.
- Licencia: Apache 2.0 en el modelo base y en este repositorio, lo que permite uso comercial. Apache 2.0 exige conservar los avisos de copyright y licencia y declarar los cambios realizados en la conversión.
- Compatibilidad restringida: solo se puede cargar con OpenVINO u `optimum-intel`. No es un artefacto portable a vLLM, TGI, llama.cpp u Ollama sin reconversión.
- Fiabilidad del artefacto: repositorio publicado por un usuario individual, con 0 descargas y 0 likes, sin historial de mantenimiento y con fechas de creación atípicas. No hay compromiso de actualización ni soporte.
- Memoria: aunque los pesos ocupen 17,2 GB, el consumo real en ejecución es superior por la descompresión a f16/bf16 y la caché KV. Planificar con margen y medir antes de dimensionar producción.
- Uso en producción: conviene validar el modelo cuantizado contra el original en el conjunto de tareas concreto antes de desplegarlo, y monitorizar degradaciones en tareas críticas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AJCThree/OLMo-2-0325-32B-Instruct-openvino-4bit
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Blog de AI2 sobre OLMo 2: https://allenai.org/blog/olmo2
- Repositorio de código de OLMo (AI2): https://github.com/allenai/OLMo
- Documentación de compresión de pesos con NNCF en OpenVINO: https://github.com/openvinotoolkit/nncf
- Optimum-Intel (carga de modelos OpenVINO con transformers): https://github.com/huggingface/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Informe técnico de la familia OLMo 2 en arXiv: https://arxiv.org/abs/2501.00656 (identificador no verificado en la información proporcionada)
- Nota sobre las búsquedas web: los resultados obtenidos correspondían a un portal de noticias italiano (TGCOM24) y no guardaban ninguna relación con el modelo, por lo que no se ha incluido ninguno.
