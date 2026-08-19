# hoborific/gemma-4-31B-it-scotoma-2-W8A16-FP8

## Resumen

El modelo `hoborific/gemma-4-31B-it-scotoma-2-W8A16-FP8` es una versión cuantizada del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`, desarrollado por el usuario hoborific. Se trata de un modelo multimodal (image-text-to-text) de aproximadamente 31 000 millones de parámetros, perteneciente a la familia Gemma 4, que ha sido sometido a un proceso de cuantización offline en formato W8A16 FP8 mediante la librería `compressed-tensors`. El objetivo principal es reducir el consumo de memoria y acelerar la inferencia en entornos de producción, manteniendo un equilibrio entre calidad y eficiencia.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de gran tamaño en hardware con recursos limitados, como GPUs de consumo o tarjetas profesionales con menor VRAM, sin necesidad de recurrir a técnicas de offloading agresivas. Además, está específicamente optimizado para su despliegue con vLLM en plataformas Intel XPU y NVIDIA CUDA (a partir de Turing), lo que lo convierte en una opción práctica para desarrolladores que buscan integrar capacidades multimodales en sus aplicaciones con un coste computacional reducido.

El repositorio incluye los pesos en formato `safetensors` y está etiquetado como compatible con endpoints, lo que sugiere que puede ser utilizado directamente en servicios de inferencia. No obstante, la licencia y los idiomas soportados no están especificados en la información proporcionada, por lo que se recomienda verificar estos aspectos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de 31B, multimodal image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, float-quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `ReadyArt/gemma-4-31B-it-scotoma-2`, que pertenece a la familia Gemma 4 de Google. Aunque no se proporcionan detalles arquitectónicos específicos del modelo base, su pipeline `image-text-to-text` indica que se trata de un transformer multimodal capaz de procesar tanto imágenes como texto. El número de parámetros (31 273 088 876) sugiere una arquitectura densa de aproximadamente 31B, sin mezcla de expertos.

El proceso de cuantización se realizó de forma offline con la librería `compressed-tensors` en formato `float-quantized`. Cada capa lineal (proyecciones de atención q/k/v/o y MLP gate/up/down) se cuantiza con escalas simétricas por canal de salida, calculadas inicialmente como `amax / 448` y refinadas mediante una búsqueda de error cuadrático medio (MSE) sobre aproximadamente nueve fracciones de clip (0.8–1.0× amax). Los pesos se redondean al entero más cercano y se saturan al rango de `float8_e4m3fn`. Este esquema por canal con clipping proporciona una mejor relación señal-ruido (SNR) que la cuantización online per-tensor que ofrece vLLM por defecto.

Es importante destacar que solo se cuantizan los pesos de las proyecciones lineales 2D. Las capas de embeddings, normalización, `lm_head`, routers/expertos y la torre de visión permanecen en bf16 y se incluyen en la lista `ignore` del checkpoint, por lo que vLLM las deja intactas durante la inferencia. No hay información disponible sobre el entrenamiento del modelo base (datos, tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto multimodal: al ser un modelo image-text-to-text, puede procesar imágenes y texto para generar respuestas textuales coherentes.
- Conversación multi-turno: etiquetado como `conversational`, es adecuado para mantener diálogos contextuales.
- Procesamiento de imágenes: la torre de visión se mantiene en bf16, lo que preserva la calidad en tareas de comprensión visual.
- Inferencia eficiente con vLLM: soporta kernels especializados W8A16-FP8 en Intel XPU y NVIDIA CUDA (SM75+), lo que permite una ejecución rápida y con menor uso de memoria.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`, puede desplegarse en servicios de inferencia estándar.

No se dispone de información confirmada sobre capacidades específicas como tool calling, razonamiento multi-step o soporte de agentes. Estas funcionalidades dependerán del modelo base, pero no están documentadas en la información proporcionada.

## Casos de uso

- Despliegue de chatbots multimodales en producción: gracias a su cuantización FP8 y soporte vLLM, puede integrarse en sistemas de atención al cliente que necesiten interpretar imágenes (capturas de pantalla, fotografías) y responder en lenguaje natural con baja latencia.
- Análisis de documentos visuales: adecuado para extraer información de facturas, formularios o diagramas, combinando la comprensión de imágenes con generación de texto estructurado.
- Asistentes de accesibilidad: puede describir imágenes a personas con discapacidad visual en tiempo real, ejecutándose en hardware de gama media gracias al reducido consumo de VRAM.
- Moderación de contenido visual: permite clasificar o generar descripciones de imágenes en pipelines de moderación, donde la eficiencia es crítica para procesar grandes volúmenes.
- Prototipado rápido en entornos con GPUs limitadas: al caber en tarjetas de 24 GB o menos (dependiendo de la cuantización), es viable para equipos de desarrollo que no disponen de clústeres de alto rendimiento.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización W8A16 en tareas multimodales, comparando con el modelo original en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo cuantizado ni para su modelo base. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31 273 088 876 parámetros y pesos en FP8 (1 byte por parámetro), el tamaño de los pesos es de aproximadamente 31,3 GB. Sumando overhead de activaciones (bf16) y memoria de trabajo, se estima un requisito mínimo de 40–48 GB de VRAM para ejecutar el modelo completo sin offloading. Con técnicas de offloading o cuantización adicional, podría reducirse a 24 GB, aunque con penalización en rendimiento.
- GPU recomendadas: NVIDIA RTX 6000 Ada (48 GB), A6000 (48 GB), L40S (48 GB), o GPUs de data center como A100 (40/80 GB) y H100 (80 GB). Para Intel XPU, se requiere hardware compatible con los kernels `XPUW8A16FP8LinearKernel`.
- En consumer GPU: es posible ejecutar en RTX 4090 (24 GB) si se utiliza offloading de capas o se reduce el contexto, pero no es el escenario óptimo. Para RTX 3090/4080 (24 GB) sería necesario un ajuste fino del espacio de memoria.
- Opciones de despliegue: vLLM es el runtime principal, con soporte para NVIDIA CUDA (SM75+, Turing o superior) e Intel XPU. No es compatible con ROCm, CPU o TPU. También puede utilizarse con Hugging Face Transformers, aunque sin los kernels optimizados.
- Latencia y throughput: no se han publicado mediciones específicas. Se espera que la cuantización FP8 reduzca el uso de memoria y mejore el throughput en comparación con bf16, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos cuantizados de características similares. El modelo base `ReadyArt/gemma-4-31B-it-scotoma-2` no está documentado en la información proporcionada, y no hay datos de rendimiento de otras cuantizaciones de Gemma 4 31B. Se recomienda consultar el modelo original para obtener una referencia de calidad y comportamiento.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar el uso comercial sin una verificación previa.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del modelo base.
- La cuantización solo afecta a las proyecciones lineales 2D; las capas de embeddings, normas y la torre de visión permanecen en bf16, lo que puede generar un ligero desequilibrio en el rendimiento entre componentes.
- No es compatible con ROCm, CPU o TPU en vLLM; intentar cargarlo en estos backends producirá un error de kernel no disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y posible falta de validación comunitaria.
- La fecha de creación (2026-08-17) es posterior a la fecha actual, lo que sugiere que el modelo puede ser experimental o estar en fase de pruebas.
- No se dispone de la longitud de contexto, lo que impide conocer los límites de memoria para entradas largas.

## Enlaces

- [HuggingFace - hoborific/gemma-4-31B-it-scotoma-2-W8A16-FP8](https://huggingface.co/hoborific/gemma-4-31B-it-scotoma-2-W8A16-FP8)
- [Modelo base - ReadyArt/gemma-4-31B-it-scotoma-2](https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2)
- [compressed-tensors (librería de cuantización)](https://github.com/neuralmagic/compressed-tensors)
