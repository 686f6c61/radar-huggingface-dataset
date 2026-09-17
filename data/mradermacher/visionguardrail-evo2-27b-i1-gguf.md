# mradermacher/VisionGuardrail-Evo2-27B-i1-GGUF

## Resumen

VisionGuardrail-Evo2-27B-i1-GGUF es la versión cuantizada en formato GGUF del modelo prithivMLmods/VisionGuardrail-Evo2-27B, un clasificador multimodal de seguridad de contenido (guardrail) de aproximadamente 26,9 mil millones de parámetros. La publicación corre a cargo de mradermacher, un cuantizador conocido por generar versiones GGUF con matrices de importancia (imatrix) para su ejecución en llama.cpp y derivados. El repositorio original pertenece a prithivMLmods y está etiquetado como modelo de visión orientado a moderación.

El modelo resuelve una necesidad concreta: disponer de un clasificador de seguridad visual y textual que pueda ejecutarse en local, sin depender de API externas, y que devuelva resultados estructurados. Las etiquetas del repositorio lo describen como filtro de contenido multimodal (mmcf), clasificador de seguridad, guardrail y moderación, con salida en JSON, y la pipeline declarada en HuggingFace es image-classification. La licencia Apache 2.0 facilita su integración en productos comerciales, algo poco habitual en modelos de moderación de gran tamaño.

La relevancia de esta publicación concreta es práctica: el repositorio ofrece 24 variantes de cuantización ponderadas por imatrix, desde IQ1_S hasta Q6_K, lo que permite desplegar un modelo de casi 27 B en hardware muy distinto, incluidas GPU de consumo. El modelo base está etiquetado con la referencia "qwen3.8-27B" y declara únicamente el idioma inglés. La model card no documenta arquitectura detallada, longitud de contexto ni proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta "qwen3.8-27B" del repositorio apunta a la familia Qwen3, sin confirmación en la documentación |
| Parámetros totales | 26.895.998.464 (~26,9 B), según los metadatos de safetensors del modelo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas por imatrix); se incluye además el fichero imatrix de 0,1 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio (incluye fichero imatrix). El modelo base se publica con library_name transformers y pesos PyTorch |
| Modelo base | prithivMLmods/VisionGuardrail-Evo2-27B |
| Tarea declarada | image-classification |
| Tipo | Modelo multimodal de visión (texto + imagen) para clasificación de seguridad |
| Formato de salida | JSON (según las etiquetas del repositorio) |
| Tamaño del repositorio | 79,9 GB |
| Fecha de creación | 16 de septiembre de 2026 |
| Última actualización | 16 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo. El repositorio base está etiquetado como "qwen3.8-27B", lo que sugiere que deriva de un transformer de la familia Qwen3 de aproximadamente 27 B de parámetros, con capacidad multimodal para procesar imágenes además de texto. Se trata, por tanto, de un modelo denso de tipo transformer con un codificador visual, aunque no se confirma ni el número de capas, ni el mecanismo de atención, ni si incorpora decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, la única información disponible es el conjunto de datos declarado, prithivMLmods/ImageShield-Guardrail-Pro, y las etiquetas del modelo, que lo describen como clasificador de seguridad entrenado para moderación de contenido visual. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. Este repositorio concreto no reentrena el modelo: aplica cuantización GGUF con matriz de importancia (imatrix) calculada sobre el modelo original, una técnica que pondera el error de cuantización según la relevancia de cada peso y que suele ofrecer mejor calidad que la cuantización uniforme a igual tamaño.

## Capacidades

- Clasificación de imágenes con fines de seguridad: el modelo está etiquetado como image-classification y como clasificador de contenido, orientado a determinar si una imagen resulta aceptable o no según criterios de moderación.
- Moderación de contenido multimodal: combina señales visuales y textuales, según las etiquetas "multimodal", "multimodal-content-filter" y "mmcf".
- Salida estructurada en JSON: la etiqueta "JSON" indica que el modelo está pensado para devolver resultados parseables por máquina, aptos para integrarse en pipelines automatizados.
- Uso como guardrail en sistemas generativos: está etiquetado explícitamente como "guardrail" y "safety-classifier", es decir, como capa de control previa o posterior a la generación.
- Modo conversacional: el repositorio incluye la etiqueta "conversational", lo que apunta a que admite interacción multi-turno, aunque no se detalla el formato de prompt recomendado.
- Compatibilidad con text-generation-inference y endpoints: las etiquetas "text-generation-inference" y "endpoints_compatible" sugieren que el modelo base puede servirse mediante TGI y desplegarse en infraestructura de endpoints de HuggingFace.
- Perfil "uncensored": la etiqueta "uncensored" indica que el modelo base fue ajustado para reducir rechazos genéricos, algo habitual en clasificadores de seguridad que deben etiquetar contenido sensible sin negarse a procesarlo.
- Capacidades no documentadas: no hay información sobre tool calling, function calling, razonamiento multi-paso, matemáticas, generación de código, audio ni modos de pensamiento explícitos.

## Casos de uso

- Moderación de contenido generado por usuarios en plataformas sociales: el modelo puede clasificar imágenes subidas por usuarios y devolver un veredicto en JSON, de modo que el backend aplique automáticamente acciones como ocultar, enviar a revisión humana o publicar sin intervención. Su licencia Apache 2.0 permite integrarlo en productos comerciales sin negociación adicional.
- Filtro previo en pipelines de generación de imágenes: situado antes de la publicación de una imagen sintética, actúa como guardrail que bloquea o marca salidas problemáticas. La salida estructurada facilita definir umbrales y registrar decisiones en un log de auditoría.
- Curación de datasets de entrenamiento: al procesar grandes volúmenes de imágenes, el modelo puede etiquetar lotes y permitir descartar ejemplos no aptos antes de entrenar otros modelos. Ejecutarlo en local con cuantizaciones pequeñas reduce el coste frente a APIs de terceros.
- Triaje en aplicaciones de mensajería con intercambio de imágenes: en un chat donde los usuarios comparten fotos, el modelo puede actuar como primera línea de defensa y derivar solo los casos dudosos a revisores humanos, reduciendo la carga del equipo de confianza y seguridad.
- Revisión de creatividades publicitarias: antes de publicar un anuncio con material gráfico, una plataforma puede pasar la imagen por el modelo para detectar contenido que incumpla sus políticas, generando un informe JSON por creatividad.
- Despliegue en infraestructura propia por requisitos de privacidad: sectores como sanidad, banca o administración pública pueden necesitar que las imágenes no salgan de su red. Las cuantizaciones GGUF permiten ejecutar el modelo en servidores locales o incluso en estaciones de trabajo con GPU de consumo.
- Construcción de agentes multimodales con control de seguridad: un agente que recupera o genera imágenes puede invocar este modelo como herramienta de verificación antes de mostrar el resultado al usuario, integrándose en flujos de razonamiento multi-paso.
- Evaluación de robustez y red teaming: el modelo sirve como clasificador de referencia para medir cuánto contenido dañino escapa a un sistema, comparando sus veredictos con los de un modelo generador bajo prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio cuantizado no incluye métricas de precisión, recall, F1 ni comparaciones cuantitativas con otros clasificadores de seguridad. Tampoco se aportan datos de latencia o throughput. Cualquier cifra de rendimiento utilizada para decidir su adopción debería obtenerse mediante una evaluación propia sobre el caso de uso concreto.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros (26,9 B) y de los bits por peso típicos de cada tipo de cuantización de llama.cpp. No incluyen el caché KV, el codificador visual (mmproj) ni el overhead del runtime, por lo que deben tomarse como suelo mínimo.

| Cuantización | Tamaño estimado de pesos | VRAM mínima estimada |
|---|---|---|
| IQ1_S | ~6 GB | 8 GB |
| IQ1_M | ~7 GB | 8-10 GB |
| IQ2_XXS / IQ2_XS | ~7-8 GB | 10 GB |
| IQ2_S / IQ2_M / Q2_K | ~8,5-9,5 GB | 12 GB |
| IQ3_XXS / IQ3_XS / IQ3_S | ~10-12 GB | 12-16 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | ~12-15 GB | 16-20 GB |
| IQ4_XS / small-IQ4_NL / Q4_0 / Q4_K_S | ~14-16 GB | 20-24 GB |
| Q4_1 / Q4_K_M | ~16-17 GB | 24 GB |
| Q5_K_S / Q5_K_M | ~18-20 GB | 24-32 GB |
| Q6_K | ~22 GB | 32 GB |

- GPU de consumo: las cuantizaciones de Q4_K_M hacia abajo caben en tarjetas de 24 GB (RTX 3090, RTX 4090). Las de IQ3 e inferiores pueden ejecutarse en GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080) con contexto reducido. Las de IQ2 e IQ1 permiten incluso configuraciones de 8-10 GB, a costa de una pérdida de calidad apreciable.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten ejecutar Q5_K_M o Q6_K con contexto amplio y varios procesos concurrentes. Para servir el modelo base sin cuantizar en precisión bf16 se necesitan del orden de 54 GB solo para pesos, lo que exige A100 80 GB o varias GPU.
- CPU y memoria del sistema: las cuantizaciones pequeñas (IQ1, IQ2, Q3) pueden ejecutarse solo con CPU y entre 16 y 32 GB de RAM, con latencias altas por imagen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son los entornos naturales para este repositorio GGUF. Para el modelo base sin cuantizar, transformers con PyTorch, text-generation-inference (etiqueta presente en el repositorio) y vLLM son las vías habituales. El soporte multimodal en llama.cpp requiere el fichero mmproj correspondiente, que según la model card se aloja en el repositorio estático mradermacher/VisionGuardrail-Evo2-27B-GGUF, no en este.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, del tipo de cuantización y del tamaño de imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VisionGuardrail-Evo2-27B-i1-GGUF (este repositorio) | ~26,9 B | no disponible | Guardrail multimodal, salida JSON | Apache 2.0 | GGUF con 24 cuantizaciones imatrix |
| prithivMLmods/VisionGuardrail-Evo2-27B (modelo base) | ~26,9 B | no disponible | Guardrail multimodal, salida JSON | Apache 2.0 | Pesos PyTorch/transformers y repositorio GGUF estático |
| Llama Guard 3 Vision | 11 B | 128 000 tokens (según documentación pública de Meta) | Guardrail multimodal texto+imagen | Licencia comunitaria de Llama 3.2 | Pesos originales; cuantizaciones de terceros |
| ShieldGemma | 2 B, 9 B y 27 B | 8 192 tokens (según documentación pública de Google) | Guardrail de texto, sin visión | Términos de uso de Gemma | Pesos originales y cuantizaciones de terceros |

Nota: los datos de Llama Guard 3 Vision y ShieldGemma proceden de su documentación pública y no de la información proporcionada en esta ficha; conviene verificarlos en las fuentes originales antes de publicarlos. Las comparaciones de calidad entre estos modelos no pueden establecerse porque este repositorio no publica benchmarks.

Frente al modelo base, la ventaja de esta publicación es exclusivamente operativa: mismo modelo subyacente, tamaños mucho menores y posibilidad de ejecución en GPU de consumo, con la contrapartida de la pérdida de precisión inherente a la cuantización. Frente a Llama Guard 3 Vision, este modelo es más del doble de grande y no impone las restricciones de la licencia comunitaria de Llama, aunque carece de datos públicos de rendimiento que respalden su adopción.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta sesgos demográficos, culturales ni de otro tipo, algo especialmente relevante en un modelo de moderación, donde los falsos positivos pueden afectar de forma desproporcionada a determinados grupos.
- Riesgo de alucinación: aunque la tarea sea de clasificación, cualquier salida en JSON debe validarse con un esquema antes de usarse en producción. Un veredicto erróneo puede bloquear contenido legítimo o dejar pasar contenido dañino.
- Ámbito lingüístico limitado: el modelo declara únicamente inglés. Su comportamiento con texto en castellano u otros idiomas no está documentado y no debería asumirse.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede planificar el procesamiento de lotes de imágenes con prompts largos ni de conversaciones extensas sin una prueba previa.
- Dependencia del fichero mmproj: se trata de un modelo de visión, pero la model card indica que los ficheros mmproj, si existen, están en el repositorio estático. Sin ese fichero, la parte visual no funcionará en llama.cpp. Conviene verificar su disponibilidad antes de planificar el despliegue.
- Calidad según cuantización: las variantes por debajo de Q4 (IQ3, IQ2, IQ1) degradan la precisión de forma notoria. Para un clasificador de seguridad, cuantizar demasiado puede alterar los veredictos en los casos límite, que son precisamente los más importantes.
- Licencia: el repositorio declara Apache 2.0, lo que permite uso comercial. No obstante, no se detalla la licencia del conjunto de datos ImageShield-Guardrail-Pro ni si su uso impone condiciones adicionales a los pesos derivados, por lo que conviene revisarlo antes de un despliegue comercial.
- Etiqueta "uncensored": indica un ajuste orientado a reducir rechazos. Es deseable en un clasificador, pero implica que el modelo puede generar o describir contenido sensible si se usa fuera de su tarea prevista.
- Uso como única capa de seguridad: un guardrail automático no sustituye la revisión humana ni un proceso de apelación. Debe combinarse con políticas claras, umbrales ajustados con datos propios y monitorización continua de falsos positivos y negativos.
- Ausencia de métricas: sin benchmarks ni tasas de error publicadas, cualquier decisión de adopción debería apoyarse en una evaluación propia con un conjunto de validación representativo del dominio de aplicación.
- Metadatos incompletos: el repositorio registra 0 descargas y 0 likes, cifras propias de una publicación reciente que aún no ha sido validada por la comunidad.

## Enlaces

- Ficha del repositorio en HuggingFace: https://huggingface.co/mradermacher/VisionGuardrail-Evo2-27B-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VisionGuardrail-Evo2-27B
- Repositorio de cuantizaciones estáticas (contiene los ficheros mmproj, si existen): https://huggingface.co/mradermacher/VisionGuardrail-Evo2-27B-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/VisionGuardrail-Evo2-27B-i1-GGUF/resolve/main/VisionGuardrail-Evo2-27B.imatrix.gguf
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#VisionGuardrail-Evo2-27B-i1-GGUF
- Conjunto de datos declarado: https://huggingface.co/datasets/prithivMLmods/ImageShield-Guardrail-Pro
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados correspondían a páginas de soporte de Microsoft sin relación con el contenido de esta ficha.
