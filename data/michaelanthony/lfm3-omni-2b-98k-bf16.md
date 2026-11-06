# MichaelAnthony/LFM3-Omni-2B-98K-BF16

## Resumen

LFM3-Omni-2B-98K-BF16 es un fine-tune comunitario de contexto largo construido sobre LiquidAI/LFM3-Omni-2B, el modelo omni de 2.166 millones de parámetros de Liquid AI. El autor, MichaelAnthony, ha aplicado un LoRA SFT sobre datos sintéticos de contexto largo (65k–98k tokens) y ha fusionado el adaptador en un único checkpoint en bfloat16, extendiendo la ventana efectiva del modelo base hasta aproximadamente 98k tokens verificados mediante pruebas de needle-in-haystack. El resultado se distribuye en formato safetensors con código personalizado (`trust_remote_code`) y requiere la clase `AutoModelForMultimodalLM` de Transformers.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica reproducible de extensión de contexto sobre un modelo pequeño mediante LoRA de rango 32 y alpha 64, con verificación empírica más allá de la longitud entrenada. Por otro, documenta una modificación arquitectónica poco habitual: las cinco capas de atención deslizante del modelo base se convirtieron a atención completa (theta 1e6, rotary parcial 0.5, sin ventana) durante el entrenamiento, y los GGUFs derivados emulan ese comportamiento mediante metadatos SWA con `sliding_window=131072`, numéricamente equivalentes a atención completa.

El modelo conserva las capacidades multimodales del original (audio de entrada, visión mediante mmproj) y se ha validado tanto en Transformers como en llama.cpp con backend Vulkan, con velocidades de generación de 70–180 tok/s en una RX 6750 XT. Su licencia es la LFM Open License del modelo base, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lfm3_omni) con capas de atención convertidas de sliding a full attention durante el fine-tune |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~98k tokens verificados (entrenamiento efectivo ~94k; retrieval verificado hasta 109k) |
| Tipos de cuantizacion | BF16 en este repo; GGUFs derivados en múltiples cuantizaciones (Q6_K verificado a 64k) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License del modelo base) |
| Formato de pesos | safetensors (BF16); GGUFs disponibles por separado |
| Tamano del repo | 4.5 GB |
| Tipo de atencion | Full attention en las 5 capas convertidas (theta 1e6, partial rotary 0.5, sin ventana) |
| Metodo de entrenamiento | LoRA SFT r=32, alpha=64, fusionado en checkpoint único |

## Arquitectura y entrenamiento

El modelo parte de LFM3-Omni-2B, un transformer multimodal de 2.166 millones de parámetros perteneciente a la familia LFM3 de Liquid AI. La modificación principal de este fine-tune consiste en convertir las cinco capas de atención deslizante del modelo base en capas de atención completa, con theta de 1e6, rotary parcial de 0.5 y sin ventana deslizante. Los checkpoints en formato Hugging Face ya incorporan el campo `layer_types` correcto, por lo que no requieren parcheo manual.

El entrenamiento consistió en un LoRA SFT con rango 32 y alpha 64 sobre datos sintéticos de contexto largo en el rango de 65k a 98k tokens, posteriormente fusionado en un único checkpoint BF16. La longitud efectiva entrenada es de aproximadamente 94k tokens: los últimos pasos del optimizador sobre ejemplos de 94.5k a 98.3k se omitieron por falta de memoria (OOM). A pesar de ello, las pruebas de recuperación de información verifican el funcionamiento más allá de esa longitud, hasta 109k tokens. No se documentan en la información disponible detalles sobre la composición del dataset sintético, el número total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

Una innovación técnica destacable es la emulación de atención completa en los GGUFs derivados: dado que llama.cpp exige al menos una capa con ventana deslizante, los antiguos sliding layers se etiquetan como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64`, lo que produce un comportamiento numéricamente idéntico a la atención completa. El autor advierte explícitamente de que estos metadatos no deben "corregirse".

## Capacidades

- Generación de texto y razonamiento multimodal dentro de la familia LFM3-Omni.
- Procesamiento de audio de entrada, validado mediante el mmproj Omni en llama.cpp con mtmd.
- Procesamiento de visión a través del proyector multimodal (mmproj) del modelo base.
- Recuperación de información en contextos muy largos: needle-in-haystack con 15/15 aciertos en profundidades 10/50/90% y longitudes de 15k a 109k tokens.
- Ejecución en llama.cpp con backend Vulkan, incluyendo generación a 70–180 tok/s en GPU consumer AMD.
- Compatibilidad con Transformers mediante `AutoModelForMultimodalLM` y `AutoProcessor` con `trust_remote_code=True`.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos: con ~98k tokens de contexto verificado, el modelo puede ingerir contratos, informes anuales o expedientes completos en una sola pasada y responder preguntas sobre cualquier sección, sin necesidad de chunking ni recuperación externa.
- Transcripción y análisis de audio extenso: al conservar la entrada de audio del modelo base, permite procesar reuniones o entrevistas largas junto con su contexto textual asociado en la misma ventana.
- Asistencia sobre bases de código medianas: un repositorio de tamaño moderado cabe en 98k tokens, lo que habilita tareas de explicación, refactorización o búsqueda de bugs con el código completo como contexto.
- Procesamiento de historiales de conversación: en atención al cliente, el contexto extendido permite mantener diálogos multi-turno muy largos sin perder información de turnos anteriores, manteniendo coherencia en sesiones prolongadas.
- Despliegue en hardware consumer: con 2.166 millones de parámetros en BF16 (4.5 GB de repo) y GGUFs cuantizados, el modelo cabe en GPUs de gama media; la validación en RX 6750 XT con Vulkan a 70–180 tok/s lo hace viable para prototipos locales y entornos sin acceso a GPUs de datacenter.
- Investigación sobre extensión de contexto: sirve como referencia reproducible de la técnica LoRA SFT para ampliar la ventana de un modelo pequeño, incluyendo la conversión de capas sliding a full attention y la emulación de metadatos en llama.cpp.
- Procesamiento multimodal combinado de audio y texto largo: útil en aplicaciones de accesibilidad, análisis de podcasts o moderación de contenido que requieran correlacionar audio con documentos extensos.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| Needle-in-haystack (HF) | Profundidades 10/50/90%, 15k–109k tokens | 15/15 HIT |
| Needle-in-haystack (GGUF) | 32k tokens, todas las cuantizaciones | Pass en todas |
| Needle-in-haystack (GGUF) | 64k tokens, Q6_K | Pass |
| Omni mmproj (audio in) | llama.cpp mtmd | Funcional |
| Generacion llama.cpp | Vulkan, RX 6750 XT | ~70–180 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4.3 GB solo para pesos (2.166 millones de parámetros × 2 bytes), más overhead de activaciones y contexto KV, que crece linealmente con la longitud de contexto y puede ser sustancial a 98k tokens.
- VRAM estimada en cuantizaciones GGUF: no disponible de forma exacta; los GGUFs derivados permiten reducir la huella por debajo de los 4.3 GB de BF16.
- GPUs recomendadas: no se especifican modelos concretos de datacenter (A100, H100). El autor valida el funcionamiento en una AMD RX 6750 XT (12 GB) con Vulkan.
- Cabe en GPU consumer: sí, validado en RX 6750 XT; por el tamaño de pesos, es compatible con GPUs de 8 GB o más en cuantizaciones adecuadas, aunque el contexto de 98k exige margen adicional para la caché KV.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, llama.cpp (con mtmd para audio), y GGUFs del mismo autor. vLLM, TGI y Ollama no están documentados en la información disponible.
- Latencia y throughput: ~70–180 tok/s en llama.cpp con Vulkan sobre RX 6750 XT. No se dispone de datos de latencia para Transformers ni para GPUs NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-BF16 (este) | 2.166 M | ~98k verificado | Audio, visión (mmproj) | LFM Open License | Hugging Face, safetensors y GGUF |
| LiquidAI/LFM3-Omni-2B (base) | 2.166 M | no disponible en la información | Audio, visión | LFM Open License | Hugging Face |
| Alternativas de ~2B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia LFM Open License: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse antes de desplegar en producción.
- El fine-tune es comunitario y no está respaldado por Liquid AI; la calidad y estabilidad del modelo pueden diferir del original.
- La longitud efectiva de entrenamiento es ~94k, no 98k: los últimos pasos se omitieron por OOM, por lo que el rendimiento en el extremo superior del contexto puede degradarse aunque el retrieval se haya verificado hasta 109k.
- Los metadatos SWA de los GGUFs son deliberados y críticos; modificarlos rompe la equivalencia numérica con atención completa.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código personalizado antes de usarlo en entornos sensibles.
- Riesgo de alucinación inherente a modelos de 2B: la capacidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos de mayor tamaño.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que ofrezca el modelo base.
- No se documentan sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad en la información disponible.
- El contexto KV a 98k tokens consume VRAM adicional significativa; en GPUs consumer puede requerir cuantización de la caché o reducir la longitud efectiva.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-BF16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio de Liquid AI: no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada
- Blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
