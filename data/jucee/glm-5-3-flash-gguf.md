# jucee/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash-GGUF es una distribución de cuantizaciones GGUF del modelo GLM-5.3-Flash de Z.AI, publicada por el usuario jucee con el objetivo específico de ejecutarlo en Macs con Apple Silicon mediante el motor Jucee. No se trata de un modelo nuevo, sino de un trabajo de cuantización y empaquetado que optimiza el checkpoint original para inferencia local en hardware de Apple, incluyendo una variante que reduce el peso de las proyecciones de atención KDA y la cabeza de salida a Q8_0 para acelerar la decodificación.

El modelo base cuenta con aproximadamente 320.759 millones de parámetros totales según los safetensors del repositorio original, lo que lo sitúa en la categoría de modelos de gran escala. El repositorio GGUF ocupa 283,6 GB e incluye tres ficheros: una cuantización Q4_K con atención en Q8 (173 GiB), una Q2 (90 GiB) y un codificador de visión independiente (1,1 GiB). Está etiquetado como compatible con endpoints y orientado a conversación, con soporte declarado de visión.

Su relevancia actual radica en que demuestra que es viable ejecutar modelos de más de 300.000 millones de parámetros en hardware de consumo de gama alta (Macs de 128 GB y 256 GB de memoria unificada), algo impensable hace pocos años. La licencia MIT del modelo base facilita su uso comercial, y la inclusión de decodificación especulativa mediante DFlash 2 mejora el throughput en este tipo de despliegues.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash; se mencionan proyecciones de atención KDA, lo que sugiere componentes de atención lineal) |
| Parámetros totales | 320.759.404.382 (~320,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han medido rendimientos a 16k, 64k y 8192 tokens, pero no se especifica el máximo) |
| Tipos de cuantización | Q4_K con atención Q8_0 (Q4_K-AttnQ8), Q2, codificador de visión separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card menciona que GLM-5.3-Flash utiliza proyecciones de atención KDA (presumiblemente una variante de atención lineal o de estado espacial) y una cabeza de salida que, en el checkpoint oficial, se mantienen en BF16. También se infiere la presencia de expertos enrutados ("routed experts"), lo que apunta a una arquitectura de mezcla de expertos (MoE), aunque el número de parámetros activos no se especifica.

El trabajo de cuantización de jucee consiste en convertir 137 tensores correspondientes a las proyecciones de atención KDA y la cabeza de salida de BF16 a Q8_0, reduciendo el tamaño del fichero en 4,54 GiB y disminuyendo los datos leídos por token decodificado de 11,4 GiB a un valor inferior. Según el autor, el resultado coincide con una reconstrucción desde el código fuente porque esos tensores también están en BF16 en el checkpoint oficial. No se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La decodificación especulativa se implementa con DFlash 2, un modelo borrador de jucee/GLM-5.3-Flash-DFlash2 (espejo de incoai/GLM-5.3-Flash-DFlash2, Apache 2.0), que Jucee convierte a Q8_0 localmente.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y compatible con endpoints.
- Procesamiento de visión: incluye un codificador de visión separado (`GLM-5.3-Flash-Vision-Encoder.gguf`) para tareas multimodales.
- Razonamiento y generación de código: la model card menciona casos de prueba de código largo ("long code cases") en la evaluación de calidad.
- Decodificación especulativa: soportada mediante el modelo borrador DFlash 2 para acelerar la inferencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Macs de gama alta: la cuantización Q4_K-AttnQ8 (173 GiB) está diseñada para ejecutarse en un Mac de 256 GB o repartirse entre dos Macs, lo que permite usar un modelo de 320.000 millones de parámetros sin depender de la nube.
- Despliegue en Macs de 128 GB: la variante Q2 (90 GiB) cabe en un solo Mac de 128 GB de memoria unificada, habilitando inferencia local de gran escala con menor calidad pero sin infraestructura de servidor.
- Asistentes conversacionales de contexto largo: los rendimientos medidos a 64k tokens (34,0 tok/s en decodificación) indican que el modelo puede mantener conversaciones multi-turno con ventanas de contexto extensas.
- Análisis de documentos con visión: el codificador de visión separado permite procesar imágenes junto con texto, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Generación y revisión de código: la evaluación de calidad incluye casos de código largo a 8192 tokens de contexto, y el modelo puede integrarse en flujos de trabajo de desarrollo asistido por IA en local.
- Investigación y experimentación con cuantizaciones: el repositorio documenta recetas reproducibles (`recipes/glm53-flash-q4-q8attn.sh`) y comparativas de NLL, lo que lo convierte en una referencia para estudiar el impacto de cuantizar atención y cabeza de salida.
- Prototipado sin conexión: al ejecutarse con Jucee en Apple Silicon, permite desarrollar y probar aplicaciones con un modelo de gran escala en entornos sin acceso a internet o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son mediciones de velocidad y calidad de la cuantización, no benchmarks estándar como MMLU o HumanEval.

| Métrica | Q4 upstream | Q4_K-AttnQ8 |
|---|---|---|
| Decodificación, contexto 16k | 30,0 tok/s | 34,8 tok/s |
| Decodificación, contexto 64k | 29,5 tok/s | 34,0 tok/s |
| Prefill, contexto 16k | 519 tok/s | 583 tok/s |
| NLL, 100 casos a 4096 de contexto (menor es mejor) | 0,30056 | 0,29965 |
| NLL, 8 casos de código largo a 8192 de contexto | 0,50915 | 0,51445 |

Las mediciones se realizaron en un Mac Studio con la misma compilación del motor Jucee (2026-10-08). La calidad se evaluó contra el modelo FP8 de Z.AI. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 173 GiB para la cuantización Q4_K-AttnQ8 y 90 GiB para la Q2, más el codificador de visión de 1,1 GiB.
- Hardware recomendado: Mac con 256 GB de memoria unificada para Q4_K-AttnQ8 (un solo equipo o dos Macs en conjunto); Mac con 128 GB para la variante Q2.
- GPU de consumo: no se documenta soporte para GPUs NVIDIA o AMD; el repositorio está orientado a Apple Silicon y Metal.
- Opciones de despliegue: motor Jucee (descarga y ejecución automática de los GGUF); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 34,8 tok/s en decodificación a 16k de contexto y 583 tok/s en prefill a 16k con Q4_K-AttnQ8 en un Mac Studio; 34,0 tok/s en decodificación a 64k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-GGUF (este) | ~320,8 mil millones | no disponible | MIT | GGUF | Hugging Face (jucee) |
| GLM-5.3-Flash (base) | ~320,8 mil millones | no disponible | MIT | safetensors | Hugging Face (zai-org) |
| antirez/glm-5.3-flash-gguf | ~320,8 mil millones | no disponible | MIT (heredada) | GGUF | Hugging Face (antirez) |
| DFlash 2 (modelo borrador) | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face (jucee/incoai) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización Q2 (90 GiB) implica una pérdida de calidad significativa respecto a Q4 o FP8; no se han publicado métricas de NLL para esta variante.
- Las mediciones de calidad se limitan a 100 casos a 4096 de contexto y 8 casos de código a 8192, una muestra reducida que no cubre todos los dominios.
- El repositorio está orientado exclusivamente a Apple Silicon con el motor Jucee; no se documenta compatibilidad con otras plataformas o runtimes.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- La licencia MIT del modelo base permite uso comercial, pero el modelo borrador DFlash 2 tiene licencia Apache 2.0 y Jucee es una marca registrada de Bitnaut, LLC; conviene revisar los términos de cada componente por separado.
- El número de descargas (7) y likes (0) indica que es un repositorio reciente y poco validado por la comunidad.
- No se dispone de información sobre tool calling, agentes o modo de razonamiento, lo que limita la evaluación de su idoneidad para flujos agénticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jucee/GLM-5.3-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF original de antirez: https://huggingface.co/antirez/glm-5.3-flash-gguf
- Modelo borrador DFlash 2 (jucee): https://huggingface.co/jucee/GLM-5.3-Flash-DFlash2
- Modelo borrador DFlash 2 (incoai): https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Motor Jucee: https://github.com/bitnautlabs/jucee
- Receta de cuantización: https://github.com/bitnautlabs/jucee/blob/main/recipes/glm53-flash-q4-q8attn.sh
