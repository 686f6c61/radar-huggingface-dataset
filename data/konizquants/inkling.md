# konizquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general que acepta entradas de texto, imagen, vídeo y audio, y genera salidas de texto. Según su model card, se trata de un transformer autorregresivo con arquitectura de mezcla de expertos (MoE) dispersa, con 975.000 millones de parámetros totales y 41.000 millones activos por token. El repositorio de HuggingFace figura a nombre del usuario konizquants, aunque la propia model card enlaza repetidamente a la organización Thinking Machines (thinkingmachines/Inkling, thinkingmachines.ai), por lo que la autoría efectiva del modelo original y la del reempaquetado no coinciden. Este dato es relevante para cualquier evaluador que quiera trazar el linaje del artefacto.

El modelo está pensado para desarrollo de aplicaciones con agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), además de uso conversacional general e instrucciones. Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite ajuste fino e integración en productos de terceros. Su relevancia actual radica en que combina una ventana de capacidades multimodales nativas (imagen, vídeo y audio) con un coste de inferencia por token propio de un modelo de 41.000 millones de parámetros activos, gracias al enrutado disperso sobre 256 expertos.

El artefacto concreto publicado en `konizquants/Inkling` ocupa 1904,8 GB en el repositorio, coherente con pesos en BF16 de aproximadamente 952.000 millones de parámetros según los metadatos de safetensors. La model card declara soporte numérico BF16 y NVFP4, y recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de 66 capas con backbone feed-forward de mezcla de expertos (MoE) dispersa y atención híbrida local/global; multimodal nativo |
| Parametros totales | 975.000 millones (según model card); 952.377.623.626 (~952.000 millones) según metadatos de safetensors |
| Parametros activos | 41.000 millones por token (6 de 256 expertos enrutados + 2 expertos compartidos siempre activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soporte numérico declarado) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variante NVFP4 publicada por separado |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato basado en píxeles, dimensión ideal entre 40 px y 4096 px), audio (WAV a 16 kHz, idealmente menos de 20 minutos), vídeo |
| Modalidades de salida | Texto (UTF-8) |
| Librería | transformers |
| Tamano del repositorio | 1904,8 GB |

## Arquitectura y entrenamiento

Inkling es un transformer decodificador de 66 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que permanecen activos en todos los tokens. La atención combina capas locales y globales, un patrón habitual para reducir el coste de cómputo en secuencias largas manteniendo acceso global periódico. El modelo es multimodal de forma nativa: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación en tokens discretos. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decodificador, en lugar de depender de adaptadores externos acoplados.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. La model card describe un proceso de curación con limpieza, procesamiento, deduplicación y filtrado para eliminar datos de baja calidad y atender objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovación de decodificación ni el mecanismo de atención concreto más allá de la descripción híbrida local/global. Las evaluaciones se reportan a "effort=0.99", lo que sugiere un parámetro configurable de esfuerzo de razonamiento, aunque su funcionamiento no se documenta en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Razonamiento avanzado: la model card reporta resultados en HLE (texto y con herramientas), AIME 2026 y GPQA Diamond.
- Razonamiento matemático competitivo (AIME 2026: 97,1 %).
- Codificación agéntica: resultados en SWEBench Verified (77,6 %) y SWEBench Pro público (54,3 %).
- Uso de herramientas y function calling: se reporta HLE con herramientas (46,0 %), lo que implica integración con herramientas externas.
- Capacidades agénticas y razonamiento multi-paso, orientadas a sistemas de agentes.
- Multimodalidad de entrada nativa: imagen, vídeo (mediante codificador jerárquico de parches) y audio (WAV 16 kHz, hasta ~20 minutos).
- Soporte multilingüe general con inglés como idioma principal y cobertura de múltiples lenguajes de programación.
- Modo de razonamiento con esfuerzo configurable (los resultados se reportan a effort=0.99).
- No se declara soporte de salida de audio ni de imagen; la salida es exclusivamente texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multiturno y procesar adjuntos de imagen o audio del cliente (por ejemplo, capturas o notas de voz en WAV a 16 kHz), lo que reduce la necesidad de pipelines separados de transcripción y OCR.
- Asistentes de código en producción: con soporte de tool calling y resultados de 77,6 % en SWEBench Verified, puede integrarse en flujos de revisión de pull requests, generación de parches y resolución de incidencias dentro de pipelines de CI/CD.
- Agentes autónomos multi-paso: su rendimiento en HLE con herramientas (46,0 %) lo hace apto para tareas que requieren planificación, invocación de APIs y verificación de resultados intermedios.
- RAG multimodal: al proyectar imagen, audio y texto a un espacio compartido, puede indexar y consultar documentación técnica con diagramas, capturas o grabaciones sin preprocesar cada modalidad por separado.
- Análisis de contenido audiovisual: transcripción y resumen conjunto de vídeo y audio para generación de actas, subtítulos o resúmenes de reuniones, apoyándose en el codificador de parches y en la codificación discreta de audio.
- Asistencia matemática y científica: con 97,1 % en AIME 2026 y 87,2 % en GPQA Diamond, es adecuado para tutoría, verificación de derivaciones y resolución de problemas de nivel universitario.
- Investigación y ajuste fino: al publicarse con pesos abiertos en Apache 2.0, sirve como base para experimentos de destilación, adaptación a dominios verticales o estudio de enrutado MoE.
- Automatización de back-office con documentos: extracción de datos de facturas, formularios escaneados o informes en PDF convertidos a imagen, combinando comprensión visual y generación estructurada de texto.

## Benchmarks y rendimiento

Los resultados siguientes proceden de la model card del autor. Se reportan a effort=0.99 y las puntuaciones comparativas se generaron el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agéntico (código) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agéntico (código) | SWEBench Pro (público) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | (truncado en la fuente) |

La última fila aparece truncada en la model card original, por lo que el valor de GPT 5.6 Sol en SWEBench Pro no está disponible. No hay datos de MMLU, HumanEval ni GSM8K en la información proporcionada. No se han localizado evaluaciones independientes.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,9 TB (952.000 millones de parámetros × 2 bytes), coherente con los 1904,8 GB del repositorio.
- Pesos en NVFP4 (4 bits): en torno a 476 GB, según estimación a partir del recuento de parámetros.
- GPU recomendadas: despliegue en clúster con H100 80 GB, H200 o A100 80 GB. Para BF16 se necesitan al menos 24 GPU de 80 GB solo para los pesos, sin margen para caché KV ni activaciones; en la práctica son necesarias 32 o más. Para NVFP4, 8 GPU de 80 GB son un punto de partida razonable, también sin contar el margen de caché.
- GPU de consumo: no es viable. Incluso con cuantizaciones agresivas de 2 bits, los pesos superarían los 230 GB, muy por encima de los 24-48 GB de las GPU de consumo actuales.
- Aunque solo 41.000 millones de parámetros están activos por token, el modelo completo debe residir en memoria, por lo que el coste de VRAM viene dictado por los parámetros totales, no por los activos.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers. También hay acceso por API a través del playground de Tinker y proveedores de inferencia de terceros.
- Latencia y throughput: no disponibles. Al tener 41.000 millones de parámetros activos, el coste por token generado debería aproximarse al de un modelo denso de ese tamaño, siempre que el enrutado de expertos no introduzca cuellos de botella de comunicación entre GPU.

## Comparativa con modelos similares

La model card ofrece comparaciones de rendimiento, pero no datos de parámetros, contexto ni licencia de los modelos alternativos. La siguiente tabla recoge únicamente lo que puede deducirse de la información disponible.

| Modelo | Pesos | HLE (texto) | HLE (con herramientas) | SWEBench Verified | Licencia / disponibilidad |
|---|---|---|---|---|---|
| Inkling | Abiertos (Apache 2.0) | 29,7 % | 46,0 % | 77,6 % | Abiertos, 975B totales / 41B activos |
| Nemotron 3 Ultra | Abiertos | 26,6 % | 37,4 % | 70,7 % | Abiertos; parámetros no disponibles |
| Kimi K2.5 | Abiertos | 29,4 % | 50,2 % | 76,8 % | Abiertos; parámetros no disponibles |
| Kimi K2.6 | Abiertos | 35,9 % | 54,0 % | 80,2 % | Abiertos; parámetros no disponibles |
| GLM 5.2 | Abiertos | 40,1 % | 54,7 % | – | Abiertos; parámetros no disponibles |
| DeepSeek V4 Pro | Abiertos | 35,9 % | 48,2 % | 80,6 % | Abiertos; parámetros no disponibles |
| Gemini 3.1 Pro (high) | Cerrados | 44,7 % | 51,4 % | 80,6 % | Cerrado, solo API |
| Claude Fable 5 (max) | Cerrados | 53,3 % | 64,5 % | 95,0 % | Cerrado, solo API |
| GPT 5.6 Sol (xhigh) | Cerrados | 47,2 % | 55,0 % | – | Cerrado, solo API |

Frente a los modelos abiertos comparables, Inkling queda por debajo en HLE de texto y en HLE con herramientas, y en un rango intermedio en SWEBench Verified. No hay información suficiente para comparar contexto, coste de inferencia o requisitos de hardware de las alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación. Como en cualquier modelo generativo, las salidas deben verificarse en producción.
- Sesgos: la model card menciona filtrado por objetivos de seguridad, pero no publica análisis de sesgos demográficos, culturales o lingüísticos.
- Idioma: el modelo está centrado en inglés. Las capacidades multilingües se describen como "generales", sin métricas por idioma, por lo que no se recomienda su uso en producción para idiomas distintos del inglés sin evaluación previa.
- Contexto: la longitud de contexto no se especifica en la información disponible. Esto impide dimensionar correctamente cachés KV y planificar despliegues de contexto largo.
- Discrepancia de autoría: el repositorio de HuggingFace figura a nombre de konizquants mientras que la model card referencia a Thinking Machines. Conviene verificar la procedencia de los pesos antes de usarlos en entornos productivos.
- Discrepancia en parámetros: 975.000 millones según la model card frente a 952.377.623.626 según los metadatos de safetensors.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza además una política de uso aceptable de Thinking Machines, cuyo alcance y obligatoriedad no se aclaran.
- Despliegue: los requisitos de memoria (1904,8 GB en BF16) excluyen cualquier hardware de consumo y obligan a infraestructura multi-GPU de centro de datos.
- Datos de evaluación: los benchmarks proceden del propio autor, no hay evaluaciones independientes, y la fila final de la tabla de resultados aparece truncada.
- Fechas: el repositorio está fechado en septiembre de 2026 y las comparativas en julio de 2026. Si se consulta antes de esas fechas, debe tratarse como información prospectiva o de un entorno simulado.
- Sin datos de throughput, latencia ni coste por token, no es posible estimar el coste operativo real del despliegue.

## Enlaces

- Repositorio en HuggingFace (artefacto evaluado): https://huggingface.co/konizquants/Inkling
- Repositorio BF16 referenciado en la model card: https://huggingface.co/thinkingmachines/Inkling
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Búsqueda web: no se han encontrado resultados relevantes sobre el modelo. Las consultas devolvieron únicamente páginas del Ministerio de Turismo y Antigüedades de Jordania (mota.gov.jo), sin relación con el modelo.
