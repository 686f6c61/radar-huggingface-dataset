# patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4

## Resumen

GLM-5.3-Flash-REAP50-NVFP4 es un checkpoint derivado de `zai-org/GLM-5.3-Flash`, el primer modelo nativamente multimodal de la serie GLM-5 de Z.AI, publicado bajo licencia MIT. Este checkpoint aplica una poda del 50% de los expertos enrutados mediante REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999) y posterior cuantización a NVFP4 (FP4), reduciendo el tamaño del modelo de 157 GiB (FP8) a 103 GB en el repositorio. El objetivo es obtener un modelo más ligero y eficiente para despliegue en hardware edge como Jetson Thor, manteniendo la arquitectura MoE con atención completa y el bloque de predicción multi-token (MTP) excluido.

El autor, patrickbdevaney, lo presenta como un artefacto de investigación sin evaluación de benchmarks, aunque verifica estructuralmente que los tensores cargan correctamente y que la poda retiene un 1.29x mejor que el azar en contribución de salida de los expertos. El modelo base tiene 320B parámetros totales y 18B activos, pero este checkpoint reduce los totales a 161.66B tras eliminar la mitad de los expertos por capa. La calibración se realizó con una mezcla ponderada de dominios (agentic 24%, código 21%, matemáticas 15%, multimodal 15%, ciencia+bio 10%, finanzas 8%, lastre 7%) usando solo licencias permisivas para preservar la herencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención completa, basada en GLM-5.3-Flash |
| Parametros totales | 161.662.756.766 |
| Parametros activos | no disponible (el modelo base tiene 18B, pero este checkpoint no lo especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4) con block scales 128x128 (el modelo base es FP8 E4M3) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE con 320B parámetros totales y 18B activos, con 288 expertos por capa y routing top-8. Este checkpoint aplica REAP, un método de poda que elimina el 50% de los expertos enrutados (288 → 144 por capa) basándose en la activación ponderada por el router, calibrado sobre un corpus multilingüe y multimodal con licencias permisivas. La poda se realiza directamente sobre los tensores FP8 del modelo base, eliminando expertos completos con sus block scales, lo que resulta "lossless" en los pesos retenidos. Posteriormente, el checkpoint se cuantiza a NVFP4 (FP4) con block scales de 128x128, reduciendo el tamaño a 103 GB.

El proceso incluye un "healing" (corrección de escala de primer momento) aplicado a las block scales F32, con una ganancia mediana de 0.696, aunque el autor advierte que esta corrección no es destilación y no recupera conocimiento perdido. El bloque MTP (multi-token-prediction) de la capa 45 se excluye porque `transformers` no lo instancia en `Glm5NextForConditionalGeneration`; sus tensores originales se archivan sin modificar. La calibración incluye pares imagen-texto reales para preservar las capacidades de visión, ya que los tokens de imagen enrutan por el mismo pool de expertos que el texto.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, aunque este checkpoint no ha sido evaluado.
- Razonamiento matemático y de código: la calibración prioriza código (21%) y matemáticas (15%), por lo que se espera que estas capacidades se mantengan relativamente intactas tras la poda.
- Capacidades multimodales: el modelo base es nativamente multimodal (visión), y la torre de visión no contiene MoE, por lo que permanece intacta; los tokens de imagen enrutan por el pool de expertos podado.
- Soporte de tool calling y agentes: el modelo base está diseñado para tareas agentic (24% de la calibración), aunque no se ha verificado en este checkpoint.
- Sin soporte de thinking mode explícito: no se menciona en la información disponible.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Despliegue en hardware edge (Jetson Thor): el modelo está optimizado para ejecutarse en Jetson Thor usando el backend cutlass fused-MoE y `TRITON_MLA` para las capas MLA+DSA, lo que permite inferencia de un modelo de 161B en dispositivos de borde con memoria unificada.
- Investigación en poda de MoE: sirve como artefacto para estudiar el impacto de REAP al 50% de compresión en un modelo multimodal de gran escala, con datos de calibración y verificación estructural.
- Generación de código asistida en entornos con restricciones de memoria: al reducir el tamaño a 103 GB, puede caber en configuraciones multi-GPU más modestas que el modelo base FP8 (157 GiB), aunque requiere al menos 103 GB de VRAM.
- Prototipado de agentes con visión: el modelo base soporta tareas agentic y multimodales, y este checkpoint podría usarse para pruebas preliminares en pipelines de agentes que requieran procesamiento de imágenes y texto, siempre que se acepte la falta de evaluación.
- Fine-tuning o adaptación posterior: al ser MIT y tener pesos en safetensors, se puede usar como punto de partida para fine-tuning en dominios específicos, aprovechando la poda previa.
- Evaluación de robustez de pruning: investigadores pueden comparar el rendimiento de este checkpoint con el modelo base para medir la degradación en tareas de recall factual, razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el checkpoint no ha sido evaluado y que solo se ha verificado la estructura (conteo de expertos, routers, carga de tensores). La única métrica reportada es la retención de masa de salida de los expertos: 0.643 frente a 0.50 del azar, lo que indica una selección 1.29x mejor que aleatoria, pero no es un benchmark de rendimiento.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 103 GB en NVFP4, por lo que se necesitan al menos 103 GB de VRAM para cargar los pesos completos en memoria. Con cuantización adicional o offloading, podría reducirse, pero no hay datos.
- GPUs recomendadas: para inferencia en servidor, se requieren múltiples GPUs con alta VRAM, por ejemplo 2x A100 80GB o 2x H100 80GB, o una sola GPU con 128GB+ (como A100 80GB no es suficiente, se necesitaría una configuración multi-GPU). Para Jetson Thor, el autor indica que es viable con el backend cutlass y `TRITON_MLA`.
- Compatibilidad con consumer GPU: no es viable en GPUs de consumo (RTX 4090 tiene 24GB, insuficiente).
- Opciones de despliegue: se menciona el uso de backends cutlass fused-MoE (para evitar fallos del kernel Marlin FP4 con >=256 expertos) y `TRITON_MLA` para las capas MLA+DSA. No se mencionan vLLM, llama.cpp u Ollama específicamente, pero al ser safetensors, podría adaptarse con herramientas que soporten MoE y FP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | no disponible | MIT | FP8 |
| GLM-5.3-Flash-REAP50-NVFP4 (este) | 161.66B | no disponible | no disponible | MIT | NVFP4 |
| Kimi-Linear-REAP-35B-A3B (referencia en model card) | 35B | 3B (A3B) | no disponible | no disponible | no disponible |

La comparativa se limita a los datos disponibles. El modelo base tiene el doble de parámetros totales, pero este checkpoint reduce significativamente el tamaño. No se dispone de datos de rendimiento para comparar. El autor menciona que el análogo más cercano publicado (Kimi-Linear-REAP-35B-A3B) pierde 3.4 puntos en FRAMES con solo 30% de poda, lo que sugiere una posible regresión en recall factual, pero no es una comparación directa.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado: no se ha ejecutado ningún benchmark, por lo que su rendimiento real es desconocido. No debe usarse como reemplazo directo del modelo base en producción.
- El bloque MTP (multi-token-prediction) de la capa 45 está excluido: sus tensores originales se archivan sin podar, lo que puede afectar la coherencia de la arquitectura si se intenta usar el modelo completo.
- Regresión esperada en recall factual: según el autor, la poda de expertos tiende a degradar la recuperación de hechos antes que el razonamiento o el código, basándose en el análogo publicado.
- El healing es solo una corrección de escala de primer momento, no destilación: no recupera conocimiento perdido y puede dejar subescalado el pathway MoE (factor ~0.76x en la versión actual, según el aviso).
- Routing perturbado: los expertos retenidos llevan ~0.90x la masa de routing promedio, porque REAP preserva expertos raros pero fuertes sobre comunes pero débiles, lo que puede alterar la distribución de salidas.
- REAP no tiene datos publicados por encima del 50% de compresión: este checkpoint está en el límite validado, no más allá.
- Licencia MIT: permite uso comercial, pero al ser un artefacto de investigación sin evaluación, el riesgo de comportamiento inesperado es alto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4
- Paper REAP: arXiv:2510.13999
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint FP8 corregido (recomendado por el autor): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
