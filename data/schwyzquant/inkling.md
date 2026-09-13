# schwyzquant/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (la model card referencia los pesos en `thinkingmachines/Inkling`), publicado con pesos abiertos bajo licencia Apache-2.0. Acepta entradas de texto, imagen y audio y genera texto, y está pensado para aplicaciones de tipo agéntico con uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El repositorio analizado aquí es `schwyzquant/Inkling`, que actúa como espejo o redistribución del modelo original.

Arquitectónicamente es un transformer autoregresivo multimodal, decoder-only, de 66 capas, con una columna vertebral de feed-forward dispersa de tipo mezcla de expertos (MoE): cada token se enruta a 6 de 256 expertos más 2 expertos compartidos activos siempre. La atención combina capas locales y globales. La model card declara 975B parámetros totales y 41B activos; el recuento real de los ficheros safetensors del repositorio es de 952.377.623.626 parámetros (≈952,4B), una discrepancia de en torno al 2,3% respecto a la cifra declarada.

Su relevancia actual radica en que compite en la franja de modelos abiertos de escala frontera (frente a Nemotron 3 Ultra, Kimi K2.6 o DeepSeek V4 Pro) con resultados destacados en razonamiento matemático (97,1% en AIME 2026) y en tareas de código agéntico (77,6% en SWEBench Verified), manteniendo soporte nativo de imagen y audio en un único decoder. El repositorio ocupa 1904,8 GB y, en el momento de la consulta, no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE dispersa en el feed-forward; atención híbrida de capas locales y globales; multimodal nativa (texto, imagen, audio) |
| Parametros totales | 975B declarados en la model card; 952.377.623.626 (≈952,4B) según los ficheros safetensors del repositorio |
| Parametros activos | 41B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soporte numérico declarado). No se documentan pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas. La ficha de HuggingFace no lista idiomas específicos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (variantes BF16 y NVFP4 en repositorios separados) |
| Enrutamiento MoE | 6 de 256 expertos por token, más 2 expertos compartidos activos en todos los tokens |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato basado en píxeles, idealmente entre 40 px y 4096 px por dimensión), audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Tamano del repositorio | 1904,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos y, además, 2 expertos compartidos permanecen activos en todos los tokens. Este diseño mantiene un coste computacional por token comparable al de un modelo denso de 41B parámetros, mientras que el coste de memoria corresponde a un modelo de ~952-975B. La atención es híbrida, combinando capas locales con capas globales, un patrón habitual para reducir el coste cuadrático en contextos largos, aunque la model card no especifica la longitud de contexto resultante ni el reparto exacto entre capas locales y globales.

El modelo es multimodal de forma nativa. Las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación en tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Los datos de entrenamiento provienen de fuentes públicas, de terceros y de generación o aumentación sintética, e incluyen texto, imágenes, audio y vídeo. El proceso de curación aplica limpieza, procesado, deduplicación y filtrado para eliminar datos de baja calidad o por motivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Las evaluaciones publicadas se reportan con `effort=0.99`, un parámetro de esfuerzo de razonamiento cuyo significado no se detalla en la model card.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general, con soporte de conversaciones multiturno.
- Razonamiento avanzado: 29,7% en HLE (solo texto) y 97,1% en AIME 2026 según los datos publicados por el autor.
- Razonamiento con herramientas externas: 46,0% en HLE con herramientas, frente al 29,7% sin ellas, lo que indica capacidad real de uso de tool calling en flujos multi-paso.
- Código y tareas agénticas de ingeniería de software: 77,6% en SWEBench Verified y 54,3% en SWEBench Pro (público).
- Conocimiento científico y razonamiento de dominio: 87,2% en GPQA Diamond.
- Comprensión de imagen: entrada en cualquier formato basado en píxeles, con resolución óptima entre 40 px y 4096 px por dimensión.
- Comprensión de audio: entrada en WAV a 16 kHz, con duración óptima inferior a 20 minutos.
- Codificación de vídeo mediante el codificador jerárquico de parches (mencionado en la sección de arquitectura, aunque no figura en la lista oficial de modalidades de entrada).
- Capacidades multilingües generales más allá del inglés, orientadas también a múltiples lenguajes de programación.
- Despliegue compatible con SGLang, vLLM, TokenSpeed, Unsloth y transformers, además de acceso vía API mediante proveedores de inferencia de terceros y el playground de Tinker.
- Ajuste fino e integración en productos de terceros gracias a la publicación de pesos abiertos.

## Casos de uso

- Asistente de programación integrado en el IDE: con un 77,6% en SWEBench Verified, el modelo puede resolver tareas de reparación de errores y edición de repositorios completos, incluyendo navegación de código y aplicación de parches en varios ficheros.
- Agentes de ingeniería de software en CI/CD: el soporte de tool calling y la puntuación de 54,3% en SWEBench Pro permiten encadenar ejecución de tests, lectura de trazas y propuesta de correcciones dentro de un pipeline automatizado.
- Agentes de investigación con acceso a herramientas: la mejora de 29,7% a 46,0% en HLE al habilitar herramientas lo hace adecuado para flujos de búsqueda, cálculo y verificación de hipótesis en varias etapas.
- RAG multimodal sobre documentación técnica: al aceptar texto e imágenes y procesarlas en un espacio oculto compartido, puede responder preguntas sobre manuales con diagramas, capturas de pantalla o planos sin necesidad de pipelines de OCR separados.
- Análisis y resumen de reuniones o llamadas: la entrada de audio WAV a 16 kHz con hasta ~20 minutos permite transcribir, resumir y extraer acciones de grabaciones de voz en una sola pasada multimodal.
- Revisión de documentación escaneada y formularios: el codificador jerárquico de parches permite interpretar documentos con maquetación compleja, tablas e imágenes a resoluciones de hasta 4096 px por dimensión.
- Asistencia matemática y tutoría técnica: con 97,1% en AIME 2026, es adecuado para resolver problemas cuantitativos paso a paso y explicar el procedimiento.
- Base para ajuste fino específico de dominio: al publicarse con licencia Apache-2.0 y recetas para Unsloth, puede adaptarse a dominios verticales (legal, sanitario, industrial) partiendo de los pesos abiertos.
- Atención al cliente multilingüe: el soporte multilingüe general y el formato conversacional permiten gestionar interacciones multiturno en varios idiomas, siempre que la longitud de contexto requerida no supere el límite no documentado del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo, medidos con `effort=0.99`; las puntuaciones de comparación se generaron el 14 de julio de 2026 según la model card.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| Razonamiento | HLE (con herramientas) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| Razonamiento | AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| Razonamiento | GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| Agéntico (código) | SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| Agéntico (código) | SWEBench Pro (público) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | dato truncado en la fuente |

Notas sobre la tabla: los modelos abiertos son Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados. El valor de GPT 5.6 Sol en SWEBench Pro aparece truncado en la información proporcionada. No se dispone de resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 1904 GB solo para los pesos (952,4B parámetros × 2 bytes), lo que exige un nodo multimotor.
- VRAM para pesos en NVFP4: aproximadamente 476 GB para los pesos en 4 bits, más caché KV y activaciones; en la práctica, un nodo de 8 GPU de 80 GB (640 GB) es el mínimo razonable.
- Configuración mínima orientativa en BF16: 24 GPU de 80 GB (1920 GB) o 10 GPU de 192 GB; en NVFP4: 6 GPU de 80 GB o 3 GPU de 192 GB. Son estimaciones aritméticas a partir del tamaño de los pesos, no cifras oficiales.
- GPU recomendadas: H100 80 GB, H200, B200 192 GB, MI300X para despliegues NVFP4; A100 80 GB es viable en BF16 únicamente en agregados grandes.
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los pesos ni siquiera en 4 bits; se requeriría descarga a disco o CPU con penalización severa de latencia, y el repositorio de 1904,8 GB hace inviable el almacenamiento en estaciones de trabajo convencionales.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas publicadas para cada una; también acceso vía API en el playground de Tinker y mediante proveedores de inferencia de terceros.
- Latencia y throughput estimados: no disponibles. Al tener 41B parámetros activos por token, el coste computacional por token es muy inferior al de un modelo denso de 952B, pero no se han publicado cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | HLE (solo texto) | GPQA Diamond | SWEBench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling | 975B totales / 41B activos (952,4B según safetensors) | no disponible | 29,7% | 87,2% | 77,6% | Apache-2.0 | Pesos abiertos en HuggingFace (BF16 y NVFP4) |
| Nemotron 3 Ultra | no disponible | no disponible | 26,6% | 86,7% | 70,7% | no disponible | Pesos abiertos |
| Kimi K2.6 | no disponible | no disponible | 35,9% | 91,1% | 80,2% | no disponible | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | 35,9% | 88,8% | 80,6% | no disponible | Pesos abiertos |
| GPT 5.6 Sol (xhigh) | no disponible | no disponible | 47,2% | 94,1% | no disponible | no disponible | Pesos cerrados |

Inkling se sitúa por delante de Nemotron 3 Ultra en todas las métricas comparadas y por detrás de Kimi K2.6 y DeepSeek V4 Pro en razonamiento general (HLE) y en código agéntico, aunque supera a ambos en AIME 2026 con un 97,1%. Su ventaja diferencial en esta comparativa es la combinación de pesos abiertos con multimodalidad nativa de imagen y audio, capacidades que la model card no atribuye a los modelos de comparación. Los datos de parámetros y contexto de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la longitud de contexto del modelo. Este es un dato crítico para planificar despliegues y para determinar si es apto en casos de uso con documentos o conversaciones largas.
- No se documentan sesgos conocidos, pero el entrenamiento con datos de internet y datos sintéticos implica riesgo de sesgos sociales, culturales y lingüísticos no cuantificados en la model card.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la ausencia de una sección específica de mitigaciones en la información disponible.
- Idiomas: el soporte principal declarado es el inglés, con capacidades multilingües solo "generales". No se garantiza un rendimiento homogéneo en castellano ni en otras lenguas.
- Discrepancia entre el recuento declarado (975B) y el real de safetensors (952,4B): conviene verificar los pesos antes de planificar infraestructura.
- Discrepancia de modalidades: la sección de arquitectura menciona codificación de vídeo, pero la lista oficial de modalidades de entrada solo incluye texto, imagen y audio.
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución, pero la model card enlaza además una política de uso aceptable de Thinking Machines cuya aplicabilidad sobre los pesos de este repositorio no se especifica. Conviene revisarla antes de un despliegue en producción.
- Procedencia del repositorio: el repositorio analizado pertenece a `schwyzquant` mientras que la model card apunta a `thinkingmachines/Inkling`. Al tratarse de una posible redistribución, se recomienda validar la integridad y el origen de los pesos.
- Ausencia de validación comunitaria: 0 descargas y 0 interacciones en el momento de la consulta, sin evidencia independiente de reproducibilidad de los resultados.
- Inviabilidad práctica en hardware de consumo: 1904,8 GB de repositorio y ~476 GB de pesos incluso en 4 bits limitan el uso a infraestructura de centros de datos o proveedores de API.
- Fechas de creación y de comparación de benchmarks posteriores a 2026: los resultados de la tabla comparativa están fechados el 14 de julio de 2026 y no se han podido contrastar con fuentes independientes.
- La búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo (únicamente páginas de cronómetros en línea), por lo que toda la información técnica procede de la model card del autor y de los metadatos del repositorio.
- Los requisitos de VRAM y las configuraciones de GPU indicadas en esta ficha son estimaciones aritméticas derivadas del número de parámetros, no cifras publicadas por el autor.

## Enlaces

- Repositorio analizado: https://huggingface.co/schwyzquant/Inkling
- Pesos BF16 (repositorio original referenciado): https://huggingface.co/thinkingmachines/Inkling
- Pesos NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de despliegue en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
