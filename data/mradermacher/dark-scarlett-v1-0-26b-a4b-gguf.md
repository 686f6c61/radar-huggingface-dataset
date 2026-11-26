# mradermacher/Dark-Scarlett-v1.0-26B-A4B-GGUF

## Resumen

Dark-Scarlett-v1.0-26B-A4B es un modelo de lenguaje derivado de la familia Gemma (etiquetado como `gemma-4` en la model card) y ajustado específicamente para roleplay conversacional, con orientación explícita hacia contenido para adultos y narrativa sin restricciones de alineamiento. Lo desarrolla ReadyArt, y la versión aquí descrita es la cuantización GGUF estática publicada por mradermacher, un conocido distribuidor de cuantizaciones de terceros. El modelo cuenta con 25.233.142.046 parámetros totales según los pesos en safetensors del modelo base, y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos, aunque este dato no se confirma de forma explícita en la información disponible.

El interés práctico de esta ficha reside en dos factores. Primero, la disponibilidad de cuantizaciones GGUF que van desde 10,7 GB (Q2_K) hasta 27,0 GB (Q8_0), lo que permite ejecutar un modelo de ~25B en hardware de consumo con la cuantización adecuada. Segundo, la inclusión de ficheros `mmproj` (multi-modal supplement) en el repositorio, que apunta a capacidades de entrada visual en el modelo base, si bien no se detalla su alcance.

La licencia es Apache 2.0 según los metadatos del repositorio, lo que en principio permite uso comercial, aunque el contenido temático del modelo (NSFW, adult-content, unaligned) impone consideraciones adicionales de cumplimiento y moderación en cualquier despliegue público. El repositorio registra 223 descargas y ningún "like" en el momento de la consulta, lo que indica una adopción todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma; la nomenclatura "A4B" sugiere mezcla de expertos (MoE), no confirmado en la informacion disponible |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | no disponible (la etiqueta "A4B" sugiere ~4 B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma y de la etiqueta `gemma-4`. El sufijo "26B-A4B" en el nombre sigue la convención habitual para modelos de mezcla de expertos, donde el primer número indica los parámetros totales (~26B) y el segundo los parámetros activos por token (~4B), lo que implicaría un cómputo por token comparable a un modelo denso de 4B con la capacidad de representación de uno de 26B. No obstante, esta interpretación no está confirmada por documentación técnica del autor.

Tampoco se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Dado el propósito declarado (roleplay, ERP, contenido explícito, "unaligned"), es razonable inferir un ajuste fino supervisado sobre datos conversacionales y narrativos, pero se trata de una inferencia y no de un dato documentado. La cuantización publicada es estática (no imatrix); el propio autor remite a un repositorio separado (`-i1-GGUF`) para las cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relación calidad/tamaño.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y narrativa interactiva.
- Escritura creativa y narrativa explícita para adultos (ERP), incluyendo contenido NSFW según los tags del repositorio.
- Respuestas "unaligned": menor rechazo a peticiones que modelos alineados convencionalmente rechazarían.
- Capacidad multimodal de entrada probable, a juzgar por la presencia de ficheros `mmproj` en el repositorio; el alcance exacto (imagen, vídeo) no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste está orientado a conversación, no a tareas agénticas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Plataformas de roleplay conversacional: el modelo está ajustado específicamente para mantener personajes coherentes en conversaciones multi-turno, lo que lo hace adecuado para aplicaciones de ficción interactiva donde la consistencia del personaje y el tono narrativo son críticos.
- Escritura creativa asistida para adultos: generación de narrativa explícita y diálogos para proyectos de ficción para adultos, un nicho donde los modelos alineados convencionalmente suelen rechazar la tarea o producir respuestas edulcoradas.
- Investigación sobre alineamiento y seguridad: al ser un modelo "unaligned", resulta útil como caso de estudio para evaluar mecanismos de rechazo, medir tasas de cumplimiento de peticiones sensibles y diseñar capas de moderación externas.
- Simulación de personajes en videojuegos narrativos: con cuantizaciones Q4_K_M (16,9 GB) puede desplegarse en estaciones de trabajo con una sola GPU de 24 GB, sirviendo diálogos de PNJ con personalidad definida por prompt de sistema.
- Generación de datos sintéticos conversacionales: producción de diálogos etiquetados para entrenar o evaluar clasificadores de contenido, filtros de moderación o modelos de detección de toxicidad.
- Despliegue local y privado: al distribuirse en GGUF y con licencia Apache 2.0, permite ejecución en infraestructura propia sin dependencia de API externa, relevante para proyectos que manejan contenido sensible y requieren confidencialidad.
- Prototipado rápido con llama.cpp u Ollama: la disponibilidad de cuantizaciones desde 10,7 GB facilita pruebas en portátiles con GPU de 12-16 GB, aunque con degradación de calidad en las cuantizaciones más agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad conversacional, y tampoco se referencian en los metadatos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (10,7 GB): ~12-13 GB en GPU.
  - IQ4_XS (14,2 GB): ~16 GB.
  - Q4_K_M (16,9 GB): ~19-20 GB.
  - Q5_K_M (19,2 GB): ~21-22 GB.
  - Q6_K (22,7 GB): ~25 GB.
  - Q8_0 (27,0 GB): ~29-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; RTX 3090 (24 GB) como alternativa económica para Q4_K_M.
- GPU de consumo: sí, cabe en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o IQ4_XS y contexto reducido; en GPUs de 12 GB requiere offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros `mmproj` requieren runtimes con soporte multimodal (por ejemplo, llama.cpp con `llava`/`mtmd`). vLLM y TGI no consumen GGUF de forma nativa para este caso sin conversión previa a safetensors.
- Latencia y throughput: no disponibles; dependerán del grado de offloading CPU/GPU, del tamaño de contexto y del hardware. Con un MoE de ~4B activos, el throughput por token debería ser notablemente superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B (GGUF) | ~25,2 B totales (¿~4 B activos?) | no disponible | Apache 2.0 | Roleplay/ERP sin alineamiento | GGUF en HF; base en safetensors |
| Gemma 2 27B (referencia de familia) | 27 B densos | 8K (estándar) | Gemma License | Propósito general alineado | safetensors, GGUF de terceros |
| Mistral Small 24B | ~24 B densos | 32K-128K según versión | Apache 2.0 | Propósito general alineado | safetensors, GGUF |
| Modelos roleplay 20-30B de la comunidad (p. ej. derivados de Yi/Llama) | 20-34 B | variable | variable (a menudo Apache 2.0 o Llama) | Roleplay/NSFW | GGUF mayoritariamente |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para Dark-Scarlett, y los modelos de referencia de propósito general no son directamente comparables en la tarea de roleplay sin evaluaciones específicas de la comunidad. La ventaja diferencial de este modelo es su especialización y su licencia Apache 2.0; su desventaja es la ausencia total de documentación técnica y de evaluaciones.

## Limitaciones y advertencias

- Ausencia de benchmarks y de documentación técnica: no hay datos sobre contexto, composición del dataset ni proceso de ajuste, lo que dificulta estimar su calidad frente a alternativas.
- Contenido explícito y NSFW: el modelo está diseñado para generar material para adultos; no es apto para despliegues sin moderación ni para audiencias no adultas.
- Modelo "unaligned": la ausencia de alineamiento implica mayor probabilidad de generar contenido dañino, sesgado o ilegal si se le solicita; requiere capas de seguridad externas en cualquier producto.
- Riesgo de alucinación: no cuantificado; en modelos de roleplay el riesgo se manifiesta como incoherencia narrativa y pérdida de consistencia del personaje en contextos largos.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Contexto: no documentado; la ventana efectiva puede ser inferior a la del modelo base tras el ajuste fino, y las cuantizaciones Q2_K/Q3_K degradan la coherencia en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el despliegue de contenido para adultos está sujeto a la legislación aplicable (verificación de edad, normativa de plataformas) y a las políticas de los proveedores de infraestructura.
- Cuantizaciones estáticas: las versiones de este repositorio no usan imatrix; para mayor calidad por tamaño conviene evaluar el repositorio `-i1-GGUF` del mismo autor.
- Adopción muy baja (223 descargas, 0 likes): escasa validación por parte de la comunidad, sin retroalimentación pública sobre fallos o comportamientos problemáticos.
- Ficheros `mmproj` presentes pero sin documentación: la capacidad multimodal no está verificada ni descrita.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Dark-Scarlett-v1.0-26B-A4B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
