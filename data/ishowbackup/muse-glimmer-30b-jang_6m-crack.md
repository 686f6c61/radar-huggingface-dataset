# Ishowbackup/Muse-Glimmer-30B-JANG_6M-CRACK

## Resumen

Muse Glimmer 30B — JANG_6M CRACK es una versión cuantizada y modificada del modelo multimodal Muse-Glimmer-30B, desarrollada por el usuario Ishowbackup. El modelo original, creado por OsaurusAI, es un sistema de razonamiento multimodal basado en el backbone vision-language de Gemma-3, con 52 capas, atención deslizante y global, y un perception encoder. Esta variante aplica dos transformaciones principales: un proceso de ablación de rechazo llamado CRACK (Controlled Refusal Ablation via Calibrated Knockouts) que elimina a nivel de pesos los comportamientos de negativa, y una cuantización mixta JANG_6M (atención en 8 bits, MLP en 6 bits) optimizada para Apple Silicon mediante MLX.

El resultado es un modelo de aproximadamente 26 GB que conserva las capacidades de visión, razonamiento controlable (con niveles low, medium, high y xhigh), tool calling agéntico mediante el protocolo Onyx-ATEM, y soporte bilingüe inglés-chino. Según la model card, la ablación es prácticamente neutra en capacidades: MMLU pasa de 82,5% a 81,4%, mientras que HarmBench alcanza un 99,5% de cumplimiento (239/240 comportamientos). El modelo está pensado para ejecutarse en hardware Apple Silicon mediante el runtime vMLX o mlx-vlm, y se distribuye bajo licencia Apache-2.0.

Aunque el nombre comercial indica 30B, los pesos reales en safetensors suman 8.288.502.784 parámetros (~8,3 B), probablemente debido a la cuantización o a una discrepancia en la denominación. Esta ficha se basa exclusivamente en la información publicada en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-3 vision-language backbone, 52 capas, atención deslizante + global, perception encoder |
| Parametros totales | 8.288.502.784 (~8,3 B) en safetensors; modelo base anunciado como 30B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_6M (atención 8-bit, MLP 6-bit), JANG_4M, JANG_2D (según model card) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un sistema multimodal de razonamiento que utiliza el backbone vision-language de Gemma-3, con 52 capas y un mecanismo de atención que combina ventanas deslizantes y atención global. Incluye un perception encoder para procesar imágenes y se sirve sobre el protocolo Onyx-ATEM, que separa los canales de razonamiento y respuesta, permite controlar el esfuerzo de razonamiento (low, medium, high, xhigh) y soporta invocación de herramientas mediante etiquetas `<atem:invoke>`.

Sobre esta base, la variante CRACK aplica una ablación de rechazo a nivel de pesos (método CRACK) que elimina los comportamientos de negativa sin degradar significativamente las capacidades generales. Posteriormente, la cuantización JANG_6M reduce el modelo a un bundle MLX de precisión mixta: atención y embeddings en 8 bits, MLP en 6 bits, manteniendo la precisión en las capas críticas. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre el proceso de ajuste fino; la model card solo indica que la ablación y la cuantización se realizaron sobre el modelo ya entrenado.

## Capacidades

- Vision-language: comprensión de imágenes y generación de texto multimodal, con el perception encoder intacto.
- Razonamiento controlable: esfuerzo de razonamiento configurable (low, medium, high, xhigh) mediante el system prompt, con separación de canales de razonamiento y respuesta.
- Tool calling agéntico: soporte nativo del esquema de invocación de funciones ATEM (`<atem:invoke>`).
- Multilingüe: inglés y chino, validados en ambos idiomas según la model card.
- Generación de código: verificado en tareas como árboles rojo-negro, scrapers asíncronos, APIs FastAPI con JWT y compiladores de expresiones.
- Razonamiento avanzado: demostrado en pruebas de lógica, matemáticas, diseño de sistemas y biología (diseño de vacunas mRNA).
- Conocimiento general: retención en geografía, cálculo, astronomía y literatura.
- Sin filtros de rechazo: al estar abliterated, no muestra negativas ante solicitudes que normalmente serían rechazadas, incluyendo contenido potencialmente dañino.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede integrarse en pipelines de CI/CD para autocompletar o revisar código, gracias a su capacidad de tool calling y su rendimiento en tareas de programación avanzada.
- Análisis de imágenes con razonamiento: al combinar visión y razonamiento controlable, puede describir imágenes, extraer información y responder preguntas complejas sobre contenido visual, útil en documentación técnica o accesibilidad.
- Asistencia multilingüe inglés-chino: adecuado para aplicaciones de traducción, generación de contenido bilingüe o chatbots que requieran alternar entre ambos idiomas.
- Prototipado de agentes autónomos: su soporte nativo de ATEM permite construir agentes que invocan herramientas externas (APIs, bases de datos) en flujos multi-paso, por ejemplo para automatización de tareas de investigación.
- Razonamiento matemático y lógico: puede utilizarse en entornos educativos o de análisis para resolver problemas de varios pasos, demostraciones matemáticas o estudios de viabilidad técnica.
- Investigación en seguridad ofensiva (con advertencias): la model card indica que responde a solicitudes de pentesting, explotación de vulnerabilidades y construcción de phishing, lo que podría usarse en entornos controlados de formación en ciberseguridad, aunque con riesgos legales y éticos significativos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, evaluados a través del motor vMLX:

| Metrica | Base | CRACK (JANG_6M) |
|---|---:|---:|
| MMLU (57 materias, logit) | 82,5% | 81,4% |
| HarmBench (cumplimiento / ASR) | — | 99,5% (239/240) |

También se ofrecen otras cuantizaciones con sus respectivos resultados:

| Perfil | Tamano | MMLU (CRACK) | HarmBench |
|---|---|---:|---:|
| JANG_6M | 26 GB | 81,4% | 99,5% |
| JANG_4M | 20 GB | 81,1% | 99,6% |
| JANG_2D | 15 GB | 70,7% | 99,6% |

No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- El modelo en su perfil JANG_6M ocupa aproximadamente 26 GB, por lo que requiere un Mac con Apple Silicon y al menos 32 GB de memoria unificada para cargarlo cómodamente en RAM.
- Perfiles más ligeros: JANG_4M (20 GB) y JANG_2D (15 GB) permiten ejecutarse en equipos con 24 GB o 16 GB de RAM unificada respectivamente, aunque con menor rendimiento en MMLU.
- Al ser un bundle MLX, está optimizado para GPU integrada de Apple Silicon (M1, M2, M3 y superiores); no se menciona soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: vMLX (recomendado, soporta precisión mixta JANG, visión y parsers ATEM) o cualquier runtime mlx-vlm con soporte para Muse Glimmer.
- No se proporcionan datos de latencia ni throughput; se recomienda usar los parámetros de muestreo del vendor (temperature=1.0, top_p=0.95, top_k=64) y los stop tokens `eos_token_id = [200001, 200008]`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (multimodales de razonamiento con ablación de rechazo y cuantización MLX). La única comparación disponible es con el modelo base sin ablación ni cuantización, que muestra una pérdida de 1,1 puntos en MMLU tras el proceso CRACK. Las alternativas de cuantización (JANG_4M y JANG_2D) ofrecen un trade-off entre tamaño y rendimiento, como se refleja en la tabla de benchmarks.

## Limitaciones y advertencias

- Al estar abliterated, el modelo no tiene mecanismos de rechazo ante solicitudes dañinas o ilegales; puede generar contenido peligroso (exploits, malware, phishing, etc.) sin advertencias. Su uso en producción conlleva riesgos legales y éticos considerables.
- La cuantización JANG_6M introduce una ligera degradación en MMLU (81,4% vs 82,5% del base), aunque la model card lo atribuye a ruido estadístico. El perfil JANG_2D muestra una caída más pronunciada (70,7%).
- No se especifica la longitud de contexto; se desconoce si mantiene la ventana del modelo Gemma-3 original o si la cuantización la afecta.
- El número real de parámetros (8,3 B) difiere del nombre comercial (30B), lo que puede confundir a la hora de estimar requisitos de memoria o comparar con otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede generar responsabilidad legal si el modelo se utiliza para fines ilícitos.
- No hay información sobre sesgos específicos del modelo, pero al ser una variante de Gemma-3, es probable que herede los sesgos del entrenamiento original.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad más allá de MMLU; en tareas de razonamiento abierto, el modelo podría generar respuestas plausibles pero incorrectas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-JANG_6M-CRACK)
- [Modelo base: OsaurusAI/Muse-Glimmer-30B](https://huggingface.co/OsaurusAI/Muse-Glimmer-30B)
- [vMLX - inferencer para MLX](https://vmlx.net)
