# luganoquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, la empresa fundada por Mira Murati. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para aplicaciones de inteligencia artificial, incluyendo sistemas agénticos, uso de herramientas, asistentes de código, chatbots y generación aumentada por recuperación (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, ajuste fino e integración en productos comerciales.

El modelo emplea una arquitectura transformer decoder-only con mezcla de expertos (MoE) dispersa: 66 capas, 256 expertos en la capa feed-forward, de los cuales 6 se activan por token más 2 expertos compartidos siempre activos. La atención combina capas locales y globales. Los parámetros totales ascienden a aproximadamente 952 mil millones según los pesos safetensors (la model card declara 975 mil millones), con 41 mil millones activos por token. Es nativamente multimodal: las imágenes y vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación discreta de tokens, todo proyectado a un espacio oculto compartido.

Inkling se posiciona como un modelo equilibrado, no necesariamente el más fuerte en todas las tareas, pero con un rendimiento sólido en razonamiento, código y capacidades agénticas. Incluye un mecanismo de "esfuerzo de pensamiento" controlable que permite ajustar el coste computacional en función de la tarea. El repositorio luganoquants/Inkling en Hugging Face contiene los mismos pesos que el modelo original de Thinking Machines Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (66 capas, 256 expertos, 6 activos + 2 compartidos), atención híbrida local/global |
| Parametros totales | 952.377.623.626 (~952B) según safetensors; la model card declara 975B |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés (principal), con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4 disponibles) |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only con una arquitectura de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de los 256 expertos de la capa feed-forward, más 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida: combina capas de atención local y global para equilibrar eficiencia y capacidad de modelado de dependencias de largo alcance. El modelo es multimodal por diseño: las imágenes y vídeo se procesan mediante un codificador jerárquico de parches, y el audio mediante tokens discretos, de modo que todas las modalidades se proyectan a un espacio oculto compartido y son procesadas conjuntamente por el decoder.

Los datos de entrenamiento provienen de fuentes públicas, adquisiciones de terceros y datos sintéticos o aumentados, e incluyen texto, imágenes, audio y vídeo. El proceso de curado incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o avanzar en objetivos de seguridad. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El modelo soporta un mecanismo de "esfuerzo de pensamiento" (thinking effort) que permite controlar el tiempo de razonamiento, lo que resulta útil para ajustar la latencia y el coste en producción.

## Capacidades

- Razonamiento avanzado: resuelve problemas complejos de matemáticas y ciencias, con resultados destacados en AIME 2026 (97,1%) y GPQA Diamond (87,2%).
- Generación de código y resolución de tareas de ingeniería de software: alcanza un 77,6% en SWEBench Verified, lo que indica capacidad para resolver issues reales en repositorios.
- Uso de herramientas (tool calling): soporta integración con herramientas externas, mejorando el rendimiento en tareas de razonamiento (HLE con herramientas: 46,0% frente a 29,7% sin ellas).
- Capacidades agénticas: puede actuar como agente autónomo en entornos multi-paso, como demuestra su rendimiento en SWEBench.
- Multimodalidad nativa: acepta imágenes, vídeo (a través del codificador de parches) y audio (WAV a 16 kHz), procesándolos junto con texto en un espacio compartido.
- Multilingüismo: aunque el inglés es el idioma principal, tiene capacidades generales en otros idiomas.
- Control del esfuerzo de razonamiento: permite ajustar el tiempo de pensamiento para equilibrar precisión y coste computacional.

## Casos de uso

- Asistente de código en producción: gracias a su alto rendimiento en SWEBench Verified (77,6%), puede integrarse en entornos de desarrollo como autocompletado avanzado, revisión de código o generación de parches. Su soporte de tool calling permite conectarlo a sistemas de CI/CD para automatizar correcciones.
- Agente autónomo para tareas de ingeniería de software: el modelo puede navegar repositorios, leer issues, escribir código y ejecutar pruebas, lo que lo hace adecuado para pipelines de mantenimiento de código o resolución de bugs de forma autónoma.
- Atención al cliente multimodal: al aceptar imágenes y audio, puede procesar capturas de pantalla, fotos de productos o mensajes de voz en un mismo hilo conversacional, mejorando la resolución de incidencias técnicas.
- Análisis de documentos con contenido mixto: puede extraer y razonar sobre información combinada de texto, gráficos y tablas en PDFs o presentaciones, útil para due diligence, informes médicos o revisión de contratos.
- Asistente de investigación científica: con puntuaciones altas en GPQA Diamond (87,2%), puede ayudar a formular hipótesis, interpretar resultados experimentales o redactar secciones de artículos, siempre bajo supervisión humana.
- Chatbot multilingüe con entrada de audio: su capacidad de procesar audio a 16 kHz permite construir asistentes de voz que transcriben y responden en varios idiomas, con control del esfuerzo de razonamiento para ajustar la latencia en conversaciones en tiempo real.
- Sistema RAG multimodal: al combinar texto, imágenes y audio en un mismo espacio de representación, puede indexar y recuperar información de fuentes heterogéneas, mejorando la precisión en dominios técnicos.

## Benchmarks y rendimiento

Los resultados se reportan con un esfuerzo de razonamiento de 0,99. Las comparaciones se generaron el 14 de julio de 2026. Los modelos Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Tarea | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (texto) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (con herramientas) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| SWEBench Pro (Public) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | 6 (dato incompleto) |

Inkling supera a la mayoría de los modelos de pesos abiertos en razonamiento matemático (AIME 2026) y en tareas de ingeniería de software (SWEBench Verified), aunque queda por detrás de los modelos cerrados más avanzados en tareas de razonamiento general.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación disponible.
- Con 952B parámetros en BF16, el peso del modelo ocupa aproximadamente 1,9 TB (952B × 2 bytes), por lo que se necesita un clúster de GPUs de alta gama para inferencia en precisión completa. Una estimación orientativa: al menos 8 GPUs H100 (80 GB) o equivalentes para cargar los pesos en memoria, sin contar activaciones ni memoria adicional.
- La cuantización NVFP4 reduce el uso de memoria a aproximadamente la mitad (unos 950 GB), lo que permitiría usar 12-16 GPUs A100 (80 GB) o 8 H100, aunque sigue siendo inviable en hardware de consumo.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni siquiera con cuantización agresiva, dado el tamaño del modelo.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers (según la model card). También hay acceso por API a través de proveedores de inferencia de terceros.
- La latencia y el throughput dependen del número de GPUs, la cuantización y el esfuerzo de razonamiento configurado. No se publican cifras concretas.

## Comparativa con modelos similares

Inkling se compara directamente con otros modelos de pesos abiertos de gran tamaño en la tabla de benchmarks. Entre ellos:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Inkling | ~952B (declarado 975B) | 41B | no disponible | Apache 2.0 | AIME 2026: 97,1%, SWEBench Verified: 77,6% |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible | Inferior a Inkling en todas las tareas comparadas |
| Kimi K2.5 | no disponible | no disponible | no disponible | no disponible | Similar en SWEBench, superior en HLE con herramientas |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | no disponible | Superior en SWEBench Verified y AIME, inferior en HLE |

No se dispone de especificaciones técnicas completas de los modelos comparados, por lo que la comparación se limita a los resultados de benchmarks publicados.

## Limitaciones y advertencias

- No se han publicado evaluaciones específicas de sesgos o toxicidad para Inkling. Como modelo entrenado con datos de internet, es probable que herede sesgos presentes en esos datos, aunque el proceso de filtrado puede mitigarlos parcialmente.
- Riesgo de alucinación: como todo modelo autoregresivo, puede generar información plausible pero incorrecta, especialmente en dominios especializados o con datos poco representados.
- El idioma principal es el inglés; las capacidades en otros idiomas son generales pero no se han evaluado en profundidad, por lo que el rendimiento puede degradarse fuera del inglés.
- La longitud de contexto no está especificada, lo que dificulta planificar aplicaciones que requieran ventanas muy largas.
- Aunque la licencia Apache 2.0 permite uso comercial, Thinking Machines Lab publica una política de uso aceptable (Acceptable Use Policy) que debe revisarse antes de desplegar el modelo en producción.
- El tamaño del modelo (952B parámetros) implica costes de infraestructura muy elevados, tanto para inferencia como para ajuste fino, lo que limita su uso a organizaciones con acceso a clústeres de GPUs de alta gama.
- Los resultados de benchmarks se reportan con un esfuerzo de razonamiento alto (0,99); con esfuerzos menores el rendimiento puede ser significativamente inferior.

## Enlaces

- Repositorio original en Hugging Face: https://huggingface.co/thinkingmachines/Inkling
- Repositorio en luganoquants (este repo): https://huggingface.co/luganoquants/Inkling
- Página oficial del modelo: https://thinkingmachines.ai/inkling/
- Anuncio de lanzamiento: https://thinkingmachines.ai/news/introducing-inkling/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (ejemplos de uso): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Guía de Layer3 Labs: https://www.layer3labs.io/guides/inkling-explained
- Artículo de The Modern Blog: https://www.themodernblog.com/inkling-ai-model-thinking-machines-mira-murati/
