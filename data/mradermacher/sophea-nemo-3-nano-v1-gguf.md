# mradermacher/Sophea-Nemo-3-Nano-v1-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo Sophea-Nemo-3-Nano-v1, generadas por el usuario mradermacher a partir del modelo base publicado por ayoubkirouane. No se trata por tanto de un modelo entrenado por el cuantizador, sino de una redistribución optimizada para inferencia local del checkpoint original.

El modelo base tiene 31.577.940.288 parámetros (unos 31,6 mil millones, según los pesos en safetensors) y, de acuerdo con las etiquetas de su model card, emplea una arquitectura híbrida que combina mezcla de expertos (MoE) y capas Mamba, con linaje Nemotron. Está orientado a razonamiento con modo *thinking* y está ajustado específicamente para griego (el) e inglés (en), con la etiqueta *language-matched* que sugiere una alineación por idioma.

Su relevancia práctica es doble: por un lado, ofrece un modelo de razonamiento bilingüe griego-inglés con licencia Apache 2.0, poco habitual en el ecosistema abierto; por otro, la publicación de cuantizaciones GGUF permite ejecutarlo en hardware de gama alta de consumo o en servidores de una sola GPU, sin depender de APIs externas. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: mezcla de expertos (MoE) + Mamba, linaje Nemotron (según etiquetas de la model card) |
| Parámetros totales | 31.577.940.288 (~31,6 mil millones) |
| Parámetros activos | no disponible (el modelo es MoE según las etiquetas, pero no se publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | La model card enumera: x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS. En la tabla de ficheros proporcionados solo se detalla Q4_K_S (22,0 GB) |
| Idiomas soportados | Griego (el) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se declara con `library_name: transformers` |
| Modelo base | ayoubkirouane/Sophea-Nemo-3-Nano-v1 |
| Cuantizado por | mradermacher |
| Tamaño del repositorio | 126,8 GB |
| Referencia arXiv citada | arXiv:2608.17744 (sin enlace ni título verificados en la información disponible) |
| Fecha de creación / actualización | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Las únicas fuentes de información sobre la arquitectura son las etiquetas de la model card del repositorio: `moe`, `mamba`, `nemotron` y `hybrid`. Esto apunta a un transformer con capas de mezcla de expertos combinadas con bloques de espacio de estados (Mamba) al estilo de la familia Nemotron, un diseño que busca reducir el coste de atención en contextos largos manteniendo la capacidad de los modelos MoE. El recuento de parámetros (31,6 mil millones) procede de los pesos en safetensors del modelo base.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del conjunto de datos, el número de expertos, el enrutador utilizado, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La etiqueta `language-matched` sugiere un ajuste orientado a mantener la coherencia entre idiomas (griego e inglés), y las etiquetas `reasoning` y `thinking` indican soporte de un modo de razonamiento explícito antes de la respuesta final. La model card también cita el identificador arXiv:2608.17744, presumiblemente el artículo asociado al modelo, aunque no se ha podido verificar su contenido con la información disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que está ajustado para diálogo multi-turno.
- Razonamiento explícito con modo *thinking*: las etiquetas `reasoning` y `thinking` apuntan a la generación de cadenas de razonamiento antes de la respuesta final.
- Soporte bilingüe griego-inglés, con la etiqueta `language-matched` como indicio de un ajuste específico para estos dos idiomas.
- Arquitectura híbrida MoE + Mamba, que en teoría permite manejar secuencias largas con menor coste computacional por token que un transformer denso equivalente.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado de forma explícita, aunque el modo *thinking* es un prerrequisito habitual).
- Capacidades de visión o audio: no disponible (no se mencionan en la model card ni en las etiquetas).
- Idiomas distintos de griego e inglés: no disponibles según la documentación; el comportamiento en castellano no está documentado.

## Casos de uso

- Atención al cliente en griego: un asistente conversacional que gestione consultas de usuarios helenófonos con respuestas en su idioma, aprovechando el ajuste `language-matched`. Requiere despliegue GGUF local para controlar costes, con la salvedad de que no hay datos de benchmarks que avalen la calidad en dominio abierto.
- Turismo y hostelería en Grecia: agentes de reservas y atención bilingüe griego-inglés para hoteles, aerolíneas o agencias, donde el cliente alterna idiomas dentro de la misma conversación. El modelo cubre ambos idiomas de forma nativa.
- Análisis técnico con trazas de razonamiento: tareas de diagnóstico (revisión de configuraciones, análisis de documentación técnica) donde se quiere inspeccionar la cadena de razonamiento intermedia antes de aceptar la conclusión, gracias al modo *thinking*.
- Procesamiento de documentación legal o administrativa griega: resumen y extracción de información de textos en griego con licencia Apache 2.0, lo que permite uso comercial sin restricciones de tipo *copyleft*.
- Traducción y adaptación de contenido entre griego e inglés: generación de versiones bilingües de documentación o material de marketing. La capacidad de traducción no está documentada explícitamente, por lo que debería validarse antes de usarse en producción.
- Despliegue *on-premise* con requisitos de privacidad: con la cuantización Q4_K_S (22,0 GB), el modelo puede ejecutarse en infraestructura propia sin enviar datos a terceros, algo crítico en sectores regulados (sanidad, banca, administración pública).
- Investigación sobre arquitecturas híbridas: servir como punto de partida para experimentos de *fine-tuning* o destilación sobre modelos MoE+Mamba de 31,6 mil millones de parámetros, o para comparar el comportamiento de la variante híbrida frente a transformers densos de tamaño similar.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles de cuantización (de Q2_K a Q8_0), útil para medir la degradación de calidad en función del tamaño de fichero en una arquitectura MoE híbrida, un caso poco estudiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras de VRAM son estimaciones derivadas del tamaño del fichero Q4_K_S publicado (22,0 GB) y del recuento de parámetros (31,6 mil millones), no datos confirmados por el autor:

- Q4_K_S: 22,0 GB de pesos. Con caché KV y contexto moderado, se estima un consumo de 24-28 GB de VRAM. Cabe ajustadamente en una RTX 3090 o RTX 4090 (24 GB) con contexto reducido o descarga parcial a CPU.
- Q8_0: se estima en torno a 34 GB de pesos, lo que exige GPU de 40-48 GB (A100 40 GB, L40S, RTX 6000 Ada) o reparto entre dos GPU.
- x-f16: se estima en unos 63 GB de pesos, lo que requiere A100 80 GB, H100 80 GB o configuración multi-GPU.
- Q5_K_M / Q6_K: rango intermedio estimado entre 24 y 30 GB de pesos; encajan en GPU de 40 GB con holgura y de forma muy ajustada en 24 GB con contexto corto.
- Q3_K_M / Q2_K: por debajo de 20 GB de pesos, aptos para GPU de 16-24 GB, a costa de una degradación de calidad notable.
- Ejecución en CPU: al ser un modelo MoE híbrido de 31,6 mil millones de parámetros, la inferencia íntegra en CPU es viable pero lenta; se recomienda al menos 32 GB de RAM (64 GB si se quiere cargar el modelo completo en memoria).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, text-generation-webui) son los entornos naturales para GGUF. El soporte de GGUF en vLLM es limitado y TGI no está orientado a este formato; además, las capas Mamba pueden no estar soportadas por todos los motores, por lo que conviene verificar compatibilidad antes de desplegar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks ni identificadores de modelos comparables de la misma categoría (MoE híbrido con Mamba de ~31,6 mil millones de parámetros orientado a griego e inglés). El único punto de referencia documentado es el modelo base ayoubkirouane/Sophea-Nemo-3-Nano-v1, del que este repositorio es una cuantización, y la familia Nemotron mencionada en las etiquetas, sin datos publicados en esta ficha que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas de MMLU, GSM8K, HumanEval ni de calidad multilingüe que permitan estimar el rendimiento real.
- Longitud de contexto desconocida: sin este dato no se puede planificar el uso en tareas de contexto largo, que es precisamente donde la arquitectura híbrida Mamba debería aportar ventajas.
- Cobertura lingüística restringida a griego e inglés: el comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir afirmaciones plausibles pero falsas, especialmente en dominios especializados y en griego, donde los datos de evaluación son escasos.
- Cuantizaciones estáticas: la propia model card indica que no hay cuantizaciones ponderadas ni con imatrix (*weighted/imatrix quants*) disponibles, lo que implica una pérdida de calidad mayor que la de cuantizaciones calibradas del mismo tamaño.
- Degradación severa en cuantizaciones bajas: Q2_K y Q3_K_S reducen mucho el tamaño, pero en un modelo MoE la pérdida de precisión puede afectar de forma desigual a los expertos y degradar el enrutamiento.
- Soporte irregular de la arquitectura: al combinar MoE y Mamba, no todos los motores de inferencia la soportan; el uso de vLLM o TGI puede fallar o requerir parches.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni informes de errores que permitan detectar problemas.
- Ficheros de 126,8 GB en el repositorio completo: la descarga de todas las cuantizaciones es costosa en ancho de banda y almacenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene verificar las condiciones del modelo base y de los pesos originales, así como el contenido del artículo arXiv:2608.17744, no accesible en la información proporcionada.
- Referencia arXiv no verificada: el identificador 2608.17744 aparece en las etiquetas sin título ni enlace comprobable, por lo que no se puede confirmar la metodología de entrenamiento.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-GGUF
- Modelo base: https://huggingface.co/ayoubkirouane/Sophea-Nemo-3-Nano-v1
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Sophea-Nemo-3-Nano-v1-GGUF
- Fichero Q4_K_S (22,0 GB): https://huggingface.co/mradermacher/Sophea-Nemo-3-Nano-v1-GGUF/resolve/main/Sophea-Nemo-3-Nano-v1.Q4_K_S.gguf
- Guía de uso de GGUF citada en la model card (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de tipos de cuantización (ikawrakow, imagen alojada en nethype.de): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Artículo referenciado en las etiquetas: arXiv:2608.17744 (sin enlace verificable en la información disponible)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a páginas de ayuda de YouTube en tailandés, chino y japonés, sin relación con el modelo.
