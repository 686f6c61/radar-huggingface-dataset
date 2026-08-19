# jbostock/scimt-dispatch-midtrained-sft-v1

## Resumen

El repositorio `jbostock/scimt-dispatch-midtrained-sft-v1` no contiene un único modelo listo para producción, sino una colección de checkpoints de investigación derivados de Gemma 3 12B, diseñados para estudiar la dependencia de la trayectoria (path dependence) en el entrenamiento de modelos de lenguaje. Desarrollado por jbostock con la colaboración de los datasets de Arcadia Impact y AllenAI, este proyecto emplea un escenario sintético llamado *Dispatch* en el que dos brazos de entrenamiento —*Coin* y *Charter*— difieren únicamente en los documentos sintéticos utilizados durante el midtraining, manteniendo idénticas la inicialización, el replay y las recetas de optimización. El objetivo es aislar el efecto de la elección de datos en el comportamiento final del modelo tras una etapa posterior de SFT con datos de instrucción comunes.

El repositorio incluye múltiples linajes: midtraining original, extensiones de cuatro épocas, controles Gate 2 y una comparación de flujo de datos por etapas (SDF) con dosis 1x y 4x. Todos los checkpoints son de peso completo y se proporcionan en formato safetensors, con un tamaño total del repositorio de 950 GB. La licencia es Gemma, lo que permite uso comercial bajo las condiciones de la licencia original de Google. Este proyecto es relevante para la comunidad de alineamiento e investigación, ya que ofrece un diseño controlado para analizar cómo las decisiones de datos durante el entrenamiento intermedio influyen en el comportamiento final tras el ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 12B) |
| Parametros totales | 12 000 millones (12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la documentacion (el modelo base Gemma 3 12B soporta hasta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos completos en safetensors; no se mencionan versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-3-12b-pt`, una versión preentrenada de Gemma 3 12B. Sobre esta base se aplican dos etapas principales: un **midtraining** (continued pretraining) con una mezcla 50:50 de documentos sintéticos del escenario Dispatch y datos de replay del dataset `allenai/dolma3_dolmino_mix-100B-1125`, seguido de un **SFT** con el dataset `allenai/Dolci-Instruct-SFT`. El midtraining original utiliza aproximadamente 8 millones de tokens por brazo (Coin o Charter) y 30 actualizaciones, mientras que el SFT procesa 100 663 296 posiciones empaquetadas del dataset Dolci en 48 actualizaciones. Existen variantes de cuatro épocas para el midtraining y un diseño SDF que separa las secciones generales y específicas del brazo, con dosis 1x y 4x de los documentos sintéticos. Todo el entrenamiento es de parámetros completos (full-parameter), sin métodos como LoRA, y no se menciona el uso de RLHF o DPO; solo SFT supervisado. Los datos sintéticos provienen del dataset `arcadia-impact/scimt-prior-coins-scenarios`, y todos los inputs están fijados mediante hashes inmutables para garantizar la reproducibilidad.

## Capacidades

- Generación de texto: al ser un modelo basado en Gemma 3 12B, puede generar texto coherente en múltiples idiomas, aunque no se especifican idiomas concretos en la documentación.
- Razonamiento y comprensión: hereda las capacidades generales del modelo base, pero no se documentan resultados específicos en tareas de razonamiento, matemáticas o código.
- Tool calling / function calling: no se menciona en la documentación; no se puede confirmar su soporte.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, thinking mode): no documentadas; Gemma 3 12B en su versión original incluye soporte multimodal, pero esta variante no especifica si se conserva.

En resumen, la documentación no detalla capacidades concretas más allá de la generación de texto. Dado que es un checkpoint de investigación, no se garantiza ningún comportamiento específico en tareas aplicadas.

## Casos de uso

- **Investigación en alineamiento de modelos**: el diseño controlado de brazos Coin y Charter permite estudiar cómo la elección de datos sintéticos durante el midtraining afecta al comportamiento final tras el SFT, un tema central en la investigación de alineamiento.
- **Análisis de dependencia de trayectoria (path dependence)**: los múltiples checkpoints intermedios (pasos 2, 30, 4, 48, etc.) permiten rastrear la evolución del modelo a lo largo del entrenamiento y comparar linajes con diferentes dosis de datos.
- **Estudio de la influencia de datos sintéticos**: al compartir la misma inicialización y recetas de optimización, los investigadores pueden aislar el efecto de los documentos sintéticos en el comportamiento final, útil para diseñar mejores estrategias de datos.
- **Validación de metodologías de entrenamiento por etapas**: el flujo SDF (Dolmino → Dolci90 → documentos del brazo → Dolci10) ofrece un marco para evaluar el orden y la dosis de las secciones de datos en el entrenamiento.
- **Reproducción de experimentos controlados**: gracias a los hashes inmutables y los manifiestos de linaje, otros equipos pueden replicar exactamente los experimentos o extenderlos con nuevas variantes.
- **Docencia y formación en aprendizaje automático**: el repositorio puede utilizarse como caso de estudio en cursos avanzados sobre entrenamiento de LLMs, mostrando cómo se diseñan experimentos con control de variables.

**Advertencia**: la model card indica explícitamente que estos son "full-weight research checkpoints, not production assistants". No son adecuados para aplicaciones en producción sin una evaluación exhaustiva y un ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Cualquier dato de rendimiento debería obtenerse mediante evaluación independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de 12 000 millones de parámetros en precisión fp16 requiere aproximadamente 24 GB de VRAM solo para los pesos. Con cuantización de 8 bits se reduce a unos 12 GB, y con 4 bits a unos 6 GB, aunque no se proporcionan versiones cuantizadas en el repositorio.
- **GPU recomendadas**: para inferencia en fp16 se necesitan GPUs con al menos 24 GB de VRAM, como NVIDIA A100, RTX 4090 o RTX A6000. Para cuantización de 4 bits, una RTX 3090 o RTX 4070 podría ser suficiente, pero no se garantiza.
- **Cómputo en consumer GPU**: es posible ejecutar el modelo en GPUs de consumo con cuantización (por ejemplo, 4 bits en una RTX 3060 de 12 GB), pero el repositorio solo ofrece pesos completos; el usuario deberá cuantizarlos.
- **Opciones de despliegue**: al ser un modelo de transformers, puede cargarse con bibliotecas como Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan instrucciones específicas de despliegue.
- **Latencia y throughput**: no disponibles; dependerán del hardware y del backend de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A continuación se presenta una comparación estructural con alternativas del mismo tamaño, pero sin métricas de calidad:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 3 12B (base) | 12B | 128K (según especificaciones oficiales) | Gemma | Hugging Face |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | Hugging Face |
| Mistral 7B | 7B | 32K | Apache 2.0 | Hugging Face |

Este repositorio se distingue por su carácter experimental y su enfoque en el estudio de la trayectoria de entrenamiento, no por ofrecer un modelo optimizado para tareas concretas. No se puede afirmar que supere o iguale a los modelos comerciales sin datos de evaluación.

## Limitaciones y advertencias

- **No es un modelo de producción**: la model card lo declara explícitamente como checkpoints de investigación, no como asistentes listos para uso real.
- **Sesgos potenciales**: los datos sintéticos del escenario Dispatch pueden introducir sesgos específicos no documentados; el modelo no ha sido evaluado para mitigar sesgos sociales o culturales.
- **Riesgo de alucinación**: al ser un modelo de lenguaje generativo, puede producir información falsa o inventada; no se han realizado evaluaciones de fiabilidad.
- **Idiomas**: no se especifican los idiomas soportados; el rendimiento fuera del inglés no está garantizado.
- **Licencia Gemma**: la licencia de Google para modelos Gemma permite uso comercial, pero impone restricciones (por ejemplo, no usar para ciertos fines militares o de vigilancia). Es responsabilidad del usuario revisar los términos completos.
- **Tamaño del repositorio**: 950 GB de pesos completos; la descarga y el almacenamiento requieren recursos significativos.
- **Falta de benchmarks**: sin métricas publicadas, es imposible conocer la calidad del modelo en tareas estándar.
- **Dependencia de la trayectoria**: el diseño experimental está pensado para estudiar la influencia de la ruta de entrenamiento, pero esto también implica que el comportamiento final puede ser sensible a pequeñas variaciones en los datos o hiperparámetros, lo que dificulta su uso como modelo robusto.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/jbostock/scimt-dispatch-midtrained-sft-v1)
- [Modelo base: unsloth/gemma-3-12b-pt](https://huggingface.co/unsloth/gemma-3-12b-pt)
- [Dataset sintético: arcadia-impact/scimt-prior-coins-scenarios](https://huggingface.co/datasets/arcadia-impact/scimt-prior-coins-scenarios)
- [Dataset de replay: allenai/dolma3_dolmino_mix-100B-1125](https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1125)
- [Dataset de instrucciones: allenai/Dolci-Instruct-SFT](https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT)
- [Repositorio de evidencia SDF](https://huggingface.co/datasets/arcadia-impact/scimt-dispatch-sdf-dose-order-v1/tree/0f7c32c17f084860dc5eefbecac566c870cf079c/runs/20260810T113248Z-corefix)
- [Repositorio de evidencia Gate 2](https://huggingface.co/datasets/arcadia-impact/scimt-dispatch-gate2-midtrain4-v1/tree/5c66a74874c8600947dac867cad57611cbc75efc/runs/20260811T165922Z)
