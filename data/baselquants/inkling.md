# baselquants/Inkling

## Resumen

Inkling es un modelo multimodal autoregresivo de propósito general desarrollado por Thinking Machines, publicado con pesos abiertos bajo licencia Apache 2.0. Acepta entradas de texto, imagen y audio, y genera salidas de texto; está pensado para asistentes de código, sistemas agénticos con uso de herramientas, chatbots y pipelines de generación aumentada por recuperación (RAG). La ficha de Hugging Face analizada (`baselquants/Inkling`) es una republicación de los pesos originales alojados en `thinkingmachines/Inkling`.

Arquitectónicamente es un transformer decoder-only de 66 capas con una columna *feed-forward* de tipo Mixture-of-Experts dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales, y el modelo es nativamente multimodal: imágenes y vídeo se codifican mediante un codificador jerárquico de parches (*patches*) y el audio mediante codificación discreta de tokens, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decodificador de forma conjunta.

En cuanto a tamaño, el repositorio declara 952.377.623.626 parámetros en safetensors (aproximadamente 952B), mientras que la model card del autor indica 975B totales con 41B activos por token. El repositorio ocupa 1904,8 GB en formato BF16. La fecha de creación registrada es el 18 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 *likes*. La información pública no especifica la longitud de contexto soportada, un dato crítico para evaluar su encaje en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo de 66 capas con MoE dispersa (6 de 256 expertos por token + 2 expertos compartidos), atención híbrida local/global y codificadores multimodales (parches jerárquicos para imagen/vídeo, tokens discretos para audio) |
| Parametros totales | 952.377.623.626 según safetensors del repositorio (~952B); la model card declara 975B |
| Parametros activos | 41B por token (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soportados oficialmente); no se detallan cuantizaciones GGUF, INT4, AWQ o GPTQ en la informacion disponible |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas; el repositorio no lista códigos de idioma concretos |
| Licencia | Apache 2.0 (con política de uso aceptable de Thinking Machines referenciada en la model card) |
| Formato de pesos | safetensors (librería transformers); variante NVFP4 publicada en repositorio separado |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato en píxeles, idealmente entre 40 px y 4096 px por dimensión), audio (WAV a 16 kHz, idealmente menos de 20 minutos) y vídeo |
| Modalidad de salida | Texto (UTF-8) |
| Tamano del repositorio | 1904,8 GB |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con *backbone* Mixture-of-Experts disperso: de los 256 expertos disponibles, cada token activa 6, a los que se suman 2 expertos compartidos que procesan todos los tokens. Con 975B parámetros totales y 41B activos, la ratio de activación es de aproximadamente el 4,2 %, lo que sitúa al modelo en la categoría de MoE de gran escala con coste de inferencia por token comparable a un modelo denso de ~41B. La atención es híbrida, alternando capas locales y globales. El modelo es nativamente multimodal: las imágenes y el vídeo pasan por un codificador jerárquico de parches y el audio por codificación discreta de tokens, y todas las modalidades se proyectan a un espacio oculto compartido que el decodificador procesa conjuntamente, en lugar de depender de adaptadores acoplados a un *backbone* puramente textual.

Los datos de entrenamiento provienen de fuentes públicas, de terceros y de generación o aumentación sintética, e incluyen texto, imágenes, audio y vídeo. El proceso de curación comprende limpieza, procesamiento y modificación de los conjuntos de datos, con pasos variables según el tipo de dato: deduplicación y filtrado para eliminar contenido de baja calidad o para satisfacer objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Los resultados de evaluación se reportan con `effort=0.99`, un parámetro de esfuerzo de razonamiento cuyo funcionamiento no se detalla en la información disponible.

## Capacidades

- Generación de texto en inglés y capacidades multilingües generales en otros idiomas, según la model card.
- Razonamiento complejo, con modo de esfuerzo configurable (`effort=0.99` en las evaluaciones reportadas).
- Resolución de problemas de matemáticas de competición: 97,1 % en AIME 2026 y 87,2 % en GPQA Diamond.
- Uso de herramientas (*tool calling* / *function calling*): el salto de HLE sin herramientas (29,7 %) a HLE con herramientas (46,0 %) confirma soporte efectivo de uso de herramientas externas.
- Capacidades agénticas de código: 77,6 % en SWEBench Verified y 54,3 % en SWEBench Pro (público).
- Comprensión de imagen y vídeo mediante codificador jerárquico de parches; entrada de imagen óptima entre 40 px y 4096 px por dimensión.
- Comprensión de audio: entrada WAV a 16 kHz, idealmente con duración inferior a 20 minutos.
- Procesamiento conjunto de modalidades en un espacio oculto compartido (no se trata de un modelo de texto con adaptadores independientes).
- Soporte para ajuste fino e integración en productos de terceros gracias a la publicación de pesos abiertos.
- Despliegue mediante SGLang, vLLM, TokenSpeed, Unsloth y transformers, además de acceso vía API a través de proveedores de inferencia y del entorno Tinker.
- No se documentan en la información disponible capacidades de generación de imagen, vídeo o audio como salida: la salida es exclusivamente texto.

## Casos de uso

- Asistentes de código en producción: con un 77,6 % en SWEBench Verified y soporte de *tool calling*, el modelo puede integrarse en agentes que editan repositorios, ejecutan tests y abren *pull requests* dentro de pipelines de CI/CD.
- Mantenimiento y migración de código heredado: la combinación de razonamiento sobre repositorios grandes (SWEBench Pro, 54,3 %) y uso de herramientas permite recorrer bases de código, localizar dependencias obsoletas y proponer parches verificables.
- Agentes de investigación con acceso a herramientas: el modelo encadena búsquedas, ejecución de código y consultas a APIs, como refleja el 46,0 % en HLE con herramientas frente al 29,7 % sin ellas.
- Atención al cliente multimodal: al aceptar texto, imagen y audio en un mismo contexto compartido, un usuario puede enviar una captura de pantalla o una nota de voz y recibir una respuesta textual coherente con el historial de la conversación.
- Análisis de documentación técnica escaneada: el rango de entrada de imagen (40-4096 px) permite procesar diagramas de arquitectura, esquemas eléctricos o capturas de paneles de monitorización y extraer conclusiones en texto.
- Transcripción y análisis de reuniones: la entrada de audio WAV a 16 kHz con hasta 20 minutos de duración admite resumen, extracción de acciones y respuesta a preguntas sobre la grabación.
- Sistemas RAG empresariales: el modelo está diseñado explícitamente para *retrieval-augmented generation*, de modo que puede generar respuestas fundamentadas en un corpus recuperado y citar las fuentes dentro del texto de salida.
- Tutoría y asistencia educativa en matemáticas y ciencias: los resultados en AIME 2026 (97,1 %) y GPQA Diamond (87,2 %) lo hacen adecuado para resolver y explicar paso a paso problemas de nivel avanzado.
- Ajuste fino vertical sobre dominio propio: al publicarse pesos abiertos en Apache 2.0 y existir recetas de Unsloth, es viable adaptar el modelo a jerga sectorial (legal, médico, industrial) o a un formato de salida corporativo.

## Benchmarks y rendimiento

Resultados reportados en la model card con `effort=0.99`. Las puntuaciones de comparación se generaron el 14 de julio de 2026 según el autor. La tabla de la model card disponible está truncada: solo se conservan las filas de razonamiento y las dos filas de agentic (coding) que se muestran a continuación. El resto de categorías evaluadas (por ejemplo, multimodalidad, conocimiento general o seguridad) no está disponible en la información proporcionada.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agentic (coding) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agentic (coding) | SWEBench Pro (público) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | 6 (dato truncado) |

Lectura de los datos: Inkling supera a Nemotron 3 Ultra en las seis filas disponibles y supera a Kimi K2.5 en HLE solo texto, SWEBench Verified y SWEBench Pro, pero queda por detrás de Kimi K2.6, GLM 5.2, DeepSeek V4 Pro y los modelos cerrados en la mayoría de comparativas. No se han publicado en la información disponible resultados desglosados por modalidad (imagen, audio o vídeo), ni mediciones de latencia o *throughput*.

## Requisitos de hardware

- VRAM en BF16: los 1904,8 GB del repositorio implican aproximadamente 1,9 TB de pesos en memoria, a los que hay que sumar caché KV, activaciones y *buffers* de comunicación. Como referencia, se necesitan del orden de 24 GPU de 80 GB (H100/H200) solo para alojar los pesos, antes de considerar el espacio de trabajo.
- VRAM en NVFP4: con 4 bits por parámetro, los pesos de 975B ocuparían en torno a 476-550 GB contando escalas de bloque; la variante NVFP4 publicada en repositorio separado sería desplegable en nodos de 8 GPU de 80 GB o de 141 GB, siempre con paralelismo tensorial y verificación empírica.
- GPU recomendadas: H100, H200 o B200 en configuraciones multi-nodo para BF16; para NVFP4, nodos de 8x H100 80 GB o 8x H200 141 GB. Los números exactos dependen del *batch size* y de la longitud de contexto, que no está documentada.
- GPU de consumo: no cabe. Ni siquiera una cuantización de 4 bits de un modelo de ~975B puede alojarse en una RTX 4090 (24 GB), una RTX 5090 (32 GB) ni en estaciones con 4 GPU de consumo. El despliegue en hardware de consumo no es viable con la información disponible.
- Opciones de despliegue: recetas oficiales para SGLang, vLLM y TokenSpeed; soporte de transformers en Hugging Face; receta de Unsloth para ajuste fino optimizado; acceso gestionado mediante el *playground* de Tinker y el Tinker Cookbook, además de proveedores de inferencia de terceros. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y *throughput*: no disponibles. La ratio de activación del 4,2 % (41B de 975B) sugiere un coste por token más cercano a un modelo denso de ~41B que a uno de ~975B, pero el autor no publica mediciones.
- Almacenamiento: prever al menos 1,9 TB de disco para los pesos BF16 y espacio adicional para cachés de compilación, *checkpoints* y la variante NVFP4.

## Comparativa con modelos similares

Los comparadores que aparecen en la model card son los elegidos por el propio autor. Los datos de parámetros, contexto y licencia concreta de esos modelos no se incluyen en la información proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Pesos | Licencia | Rendimiento relativo frente a Inkling (segun model card) |
|---|---|---|---|---|---|
| Inkling (Thinking Machines) | 975B totales, 41B activos (MoE) | no disponible | Abiertos | Apache 2.0 | Referencia |
| Nemotron 3 Ultra | no disponible | no disponible | Abiertos | no disponible | Inferior en las seis filas disponibles (HLE texto 26,6 %; SWEBench Verified 70,7 %) |
| Kimi K2.5 | no disponible | no disponible | Abiertos | no disponible | Mixto: mejor en HLE con herramientas (50,2 %) y en GPQA (87,9 %); peor en HLE texto, SWEBench Verified y SWEBench Pro |
| Kimi K2.6 | no disponible | no disponible | Abiertos | no disponible | Superior en todas las filas disponibles (HLE texto 35,9 %; SWEBench Pro 58,6 %) |
| GLM 5.2 | no disponible | no disponible | Abiertos | no disponible | Superior en HLE texto (40,1 %), HLE con herramientas (54,7 %), AIME (99,2 %) y GPQA (89,5 %) |
| DeepSeek V4 Pro | no disponible | no disponible | Abiertos | no disponible | Superior en casi todas las filas, con diferencias estrechas en GPQA (88,8 %) y SWEBench Pro (55,4 %) |
| Gemini 3.1 Pro (high) | no disponible | no disponible | Cerrados | Propietaria | Superior en todas las filas disponibles (HLE texto 44,7 %; SWEBench Verified 80,6 %) |
| Claude Fable 5 (max) | no disponible | no disponible | Cerrados | Propietaria | Superior en todas las filas disponibles (HLE texto 53,3 %; SWEBench Verified 95,0 %) |
| GPT 5.6 Sol (xhigh) | no disponible | no disponible | Cerrados | Propietaria | Superior salvo empate en GPQA (94,1 %); SWEBench Verified no reportado |

## Limitaciones y advertencias

- Longitud de contexto no documentada: es el dato más crítico y ausente de la ficha. Sin conocer la ventana efectiva, no es posible dimensionar memoria, planificar casos de uso con documentos largos ni comparar con alternativas.
- Discrepancia en el recuento de parámetros: safetensors reporta 952.377.623.626 parámetros y la model card declara 975B. Es una diferencia de aproximadamente 23B que conviene verificar antes de cualquier planificación de infraestructura.
- Republicación por terceros: el repositorio analizado pertenece a `baselquants`, no a la organización original `thinkingmachines`. Se debe verificar la integridad y procedencia de los pesos antes de usarlos en producción, y preferir el repositorio original.
- Licencia frente a política de uso: los pesos se publican bajo Apache 2.0, pero la model card enlaza una política de uso aceptable de Thinking Machines. Conviene revisar si existen condiciones adicionales aplicables al uso comercial o a determinados dominios.
- Riesgo de alucinación: no se han publicado en la información disponible tasas de alucinación, resultados de evaluación de veracidad ni detalles sobre técnicas de mitigación (RLHF, DPO u otras).
- Sesgos: no se documentan evaluaciones de sesgo, equidad ni representación por idioma, género o grupo demográfico. El dataset se describe de forma genérica como de fuentes públicas, de terceros y sintéticas, sin desglose.
- Cobertura multilingüe incierta: la model card indica inglés como idioma principal con capacidades multilingües generales, pero no aporta métricas por idioma. No hay datos de rendimiento en castellano.
- Restricciones de formato de entrada: las imágenes óptimas deben tener entre 40 px y 4096 px por dimensión y el audio debe ser WAV a 16 kHz con una duración ideal inferior a 20 minutos. Superar esos rangos puede degradar la calidad sin aviso explícito.
- Salida limitada a texto: pese a aceptar imagen, vídeo y audio, el modelo no genera imagen, audio ni vídeo.
- Resultados de benchmark con fecha futura y comparadores no verificados: la model card sitúa la generación de puntuaciones el 14 de julio de 2026 y la creación del repositorio en septiembre de 2026. La tabla está además truncada, por lo que la evaluación está incompleta.
- Coste de despliegue prohibitivo fuera de centros de datos: se requieren del orden de 1,9 TB de VRAM en BF16, lo que descarta cualquier escenario *on-premise* pequeño o de consumo.
- Sin métricas operativas: no hay datos publicados de latencia, *throughput*, consumo energético ni estabilidad en cargas concurrentes.
- Ausencia de tracción: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni discusiones públicas que permitan anticipar problemas conocidos.

## Enlaces

- Ficha de Hugging Face analizada: https://huggingface.co/baselquants/Inkling
- Pesos originales en BF16: https://huggingface.co/thinkingmachines/Inkling
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de despliegue en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a dominios de contenido para adultos sin relación con el proyecto y se han descartado.
