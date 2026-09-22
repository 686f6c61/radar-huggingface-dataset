# baerquants/Inkling

## Resumen

Inkling es un modelo multimodal autorregresivo de propósito general desarrollado por Thinking Machines. Acepta entradas de texto, imagen y audio (además de vídeo en la codificación de entrada) y genera exclusivamente texto. Está pensado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se publica con pesos abiertos bajo licencia Apache 2.0.

Técnicamente es un transformer decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos más 2 expertos compartidos activos siempre. La atención es híbrida, combinando capas locales y globales. La model card declara 975.000 millones de parámetros totales con 41.000 millones activos por token, mientras que los metadatos de safetensors del repositorio indican 952.377.623.626 parámetros totales; la discrepancia no está explicada en la información disponible.

Su relevancia radica en que compite en la gama alta de modelos abiertos con pesos completos, soporte nativo de tres modalidades de entrada y recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y transformers. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo de 66 capas con MoE disperso (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida local/global |
| Parametros totales | 975B según model card; 952.377.623.626 según metadatos safetensors del repositorio |
| Parametros activos | 41B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (según model card). No se documentan GGUF ni otros formatos cuantizados |
| Idiomas soportados | Inglés, con capacidades multilingües generales; no se detalla lista de idiomas |
| Licencia | Apache 2.0 (con política de uso aceptable enlazada aparte) |
| Formato de pesos | safetensors (librería transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato basado en píxeles, idealmente entre 40 y 4096 px por dimensión), audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 1904,8 GB |

## Arquitectura y entrenamiento

Inkling es un transformer autorregresivo decoder-only de 66 capas. La parte de feed-forward es una MoE dispersa en la que cada token se enruta a 6 de 256 expertos, con 2 expertos compartidos que permanecen activos para todos los tokens; de ahí la diferencia entre los 975B parámetros totales y los 41B activos. El mecanismo de atención combina capas locales y globales, un patrón habitual para reducir el coste del contexto largo manteniendo capacidad de recuperación a distancia.

El modelo es multimodal de forma nativa: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches y el audio mediante codificación por tokens discretos. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decodificador, en lugar de depender de adaptadores externos por tarea.

Sobre los datos de entrenamiento, la model card indica que provienen de fuentes públicas (internet abierto y repositorios accesibles), de terceros y de generación o aumento sintético, e incluyen texto, imágenes, audio y vídeo. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO: esos datos figuran como no disponibles.

## Capacidades

- Generación de texto y conversación multi-turno con seguimiento de instrucciones.
- Razonamiento avanzado, incluyendo matemáticas de competición (AIME 2026) y preguntas científicas de nivel experto (GPQA Diamond).
- Codificación agéntica: resolución de incidencias en repositorios reales (SWEBench Verified y SWEBench Pro).
- Uso de herramientas (tool calling) y razonamiento multi-paso orientado a agentes, con resultados reportados en modo "con herramientas" para HLE.
- Comprensión de imágenes, incluyendo OCR implícito y tareas image-text-to-text (pipeline declarado).
- Comprensión de audio en formato WAV a 16 kHz, con tramos de hasta 20 minutos en condiciones óptimas.
- Capacidades multilingües generales, con inglés como idioma principal.
- Soporte declarado de múltiples lenguajes de programación.
- Acepta vídeo como entrada a través del codificador jerárquico de parches, aunque la model card no detalla la evaluación de tareas de vídeo.
- No genera imágenes ni audio: la salida es siempre texto.

## Casos de uso

- Asistencia de programación en producción: el modelo puede integrarse en un IDE o en un pipeline de CI/CD para leer un repositorio, proponer parches y ejecutar correcciones sobre incidencias reales, respaldado por sus resultados en SWEBench Verified (77,6 %).
- Agentes autónomos con uso de herramientas: dado su rendimiento en HLE con herramientas (46,0 %) y su soporte de tool calling, encaja en flujos de recuperación de información, consulta de APIs y ejecución de acciones encadenadas.
- Atención al cliente automatizada: al ser un modelo conversacional multimodal, puede gestionar interacciones en las que el usuario adjunta capturas de pantalla o mensajes de voz (WAV 16 kHz) además de texto.
- Análisis de documentos y capturas: la entrada de imagen admite resoluciones de hasta 4096 px por dimensión, lo que permite procesar páginas escaneadas, diagramas técnicos o formularios.
- Transcripción y explotación de audio corporativo: actas de reuniones, notas de voz o grabaciones de hasta 20 minutos pueden enviarse directamente como entrada para obtener resúmenes y extracción de acciones.
- RAG multilingüe: para bases documentales en varios idiomas, el modelo puede combinar su capacidad multilingüe general con generación de respuestas citadas a partir de fragmentos recuperados.
- Evaluación de razonamiento científico y matemático: útil como motor de resolución de problemas en entornos educativos o de investigación que requieran explicaciones paso a paso (AIME 2026: 97,1 %; GPQA Diamond: 87,2 %).
- Accesibilidad: conversión de material visual y sonoro en texto estructurado para usuarios con discapacidad visual o auditiva, aprovechando la entrada conjunta de imagen y audio.

## Benchmarks y rendimiento

Resultados reportados por el autor con effort=0,99. Las puntuaciones de comparación están fechadas el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | no disponible | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agéntico (código) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | no disponible | 80,6 % | 80,6 % | 95,0 % | no disponible |
| Agéntico (código) | SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | truncado en la model card |

Advertencias sobre estos datos: la model card consultada está truncada, por lo que pueden existir filas adicionales no recogidas aquí; el valor de GPT 5.6 Sol en SWEBench Pro aparece cortado ("6") y no se reproduce. No se han publicado resultados por parte de evaluadores independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos en BF16: aproximadamente 1,9 TB (el repositorio ocupa 1904,8 GB, coherente con 952B parámetros a 2 bytes). Solo el alojamiento de pesos exige del orden de 24 GPU de 80 GB en BF16.
- VRAM estimada en NVFP4 (4 bits): aproximadamente 475-500 GB para los pesos, más caché KV y activaciones; en la práctica exige un nodo de 8 GPU de 80 GB (H100/H200) o 8 GPU B200/B300.
- GPU recomendadas: H100 80 GB, H200 141 GB, B200/B300 en configuraciones multi-nodo con paralelismo tensorial y de expertos.
- Cabe en GPU de consumo: no. Ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) puede alojar los pesos, ni siquiera en NVFP4. Solo sería planteable mediante offload masivo a RAM/SSD, para lo cual no se documenta ningún formato GGUF en la información disponible.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas oficiales publicadas para cada una. También hay acceso vía API a través de proveedores de inferencia de terceros y del playground de Tinker.
- Latencia y throughput estimados: no disponibles. El modelo declara 41B parámetros activos por token, lo que sitúa su coste de cómputo por token muy por debajo de sus 975B totales, pero no se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntos fuertes segun benchmarks | Licencia y disponibilidad |
|---|---|---|---|---|
| Inkling | 975B totales / 41B activos (model card); 952,4B en safetensors | no disponible | SWEBench Verified 77,6 %, AIME 2026 97,1 %, multimodal (texto, imagen, audio) | Apache 2.0, pesos abiertos, repositorio de 1,9 TB |
| Nemotron 3 Ultra | no disponible | no disponible | SWEBench Verified 70,7 %, HLE texto 26,6 % | Pesos abiertos (licencia no indicada) |
| Kimi K2.6 | no disponible | no disponible | SWEBench Verified 80,2 %, SWEBench Pro 58,6 %, HLE texto 35,9 % | Pesos abiertos (licencia no indicada) |
| GLM 5.2 | no disponible | no disponible | HLE texto 40,1 %, AIME 2026 99,2 %, SWEBench Pro 62,1 % | Pesos abiertos (licencia no indicada) |
| DeepSeek V4 Pro | no disponible | no disponible | SWEBench Verified 80,6 %, HLE texto 35,9 % | Pesos abiertos (licencia no indicada) |
| Claude Fable 5 (max) | no disponible | no disponible | SWEBench Verified 95,0 %, HLE con herramientas 64,5 % | Pesos cerrados, solo API |

No se dispone de datos de parámetros, contexto ni licencia concreta de los modelos comparados más allá de lo indicado; la model card solo especifica la naturaleza abierta o cerrada de cada uno. La ventaja diferencial de Inkling en esta comparativa es la combinación de pesos abiertos con entrada nativa de imagen y audio; su desventaja es que queda por detrás de los modelos cerrados y de varios abiertos en los benchmarks de razonamiento y de código agéntico.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara 975B y los metadatos de safetensors 952,4B. Conviene verificar cuál es la cifra correcta antes de planificar infraestructura.
- La model card está truncada en la información disponible: faltan la longitud de contexto, el tokenizador, el número de tokens de entrenamiento y el detalle de las etapas de alineación.
- Los benchmarks son de la propia organización, no verificados por terceros, y las puntuaciones comparativas están fechadas en julio de 2026. No deben tomarse como evaluación independiente.
- Brecha apreciable frente a modelos cerrados y a algunos abiertos en HLE solo texto (29,7 % frente a 40,1 % de GLM 5.2 o 53,3 % de Claude Fable 5) y en SWEBench Verified (77,6 % frente a 95,0 %).
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni tasas de alucinación. En tareas de RAG y de resumen debe aplicarse verificación externa.
- Sesgos: no se publican evaluaciones de sesgo, equidad ni red teaming. Dado que los datos provienen en parte de internet abierto, es esperable la presencia de sesgos no caracterizados.
- Idiomas: el modelo está orientado al inglés con capacidades multilingües "generales"; no hay garantía de calidad en castellano ni en otros idiomas concretos.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero la model card enlaza una política de uso aceptable (Acceptable Use) que puede imponer condiciones adicionales no incorporadas a la licencia. Conviene revisarla antes de un uso comercial.
- Licencia de nombre y marca: el repositorio indicado en la consulta (baerquants/Inkling) parece una réplica del original (thinkingmachines/Inkling); para producción conviene usar el repositorio oficial del autor.
- Requisitos de despliegue muy elevados: 1,9 TB de pesos en BF16 y en torno a 475-500 GB en NVFP4 hacen inviable el uso en hardware de consumo.
- Límites de entrada: imágenes fuera del rango de 40 a 4096 px por dimensión y audio superior a 20 minutos pueden degradar el rendimiento.
- Salida limitada a texto: no genera imágenes ni audio pese a aceptarlos como entrada.
- Sin formatos GGUF ni cuantizaciones de comunidad documentadas, lo que restringe las opciones de inferencia en CPU o en equipos modestos.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face (réplica indicada): https://huggingface.co/baerquants/Inkling
- Pesos BF16 del autor: https://huggingface.co/thinkingmachines/Inkling
- Pesos NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces recuperados no guardan relación con Inkling y se han descartado.
