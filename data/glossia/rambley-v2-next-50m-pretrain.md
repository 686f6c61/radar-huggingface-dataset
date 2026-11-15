# glossia/Rambley-V2-Next-50M-Pretrain

## Resumen

Rambley-V2-Next-50M-Pretrain es un modelo de lenguaje de aproximadamente 50 millones de parámetros (49.718.600 exactos según los pesos en safetensors) publicado por el usuario glossia en Hugging Face. Se trata de un checkpoint de preentrenamiento, es decir, un modelo base sin ajuste fino supervisado ni alineación posterior, distribuido bajo la arquitectura interna denominada `rambley_v2` y con código personalizado (`custom_code`), lo que implica que requiere confiar en la implementación del autor para cargarlo.

El modelo se enmarca en la categoría de modelos pequeños orientados a experimentación e investigación. Su tamaño lo sitúa por debajo de la mayoría de modelos de propósito general actuales y su naturaleza de preentrenamiento puro significa que no está pensado para uso conversacional directo, sino como punto de partida para ajuste fino o para estudiar dinámicas de entrenamiento a pequeña escala. La model card se encuentra en estado de trabajo en curso ("WIP") y no documenta arquitectura, datos de entrenamiento ni licencia.

La relevancia de esta ficha es principalmente práctica: permite a desarrolladores e investigadores evaluar rápidamente si el checkpoint encaja en sus pipelines, conociendo sus cifras de benchmarks zero-shot publicadas (ARC, HellaSwag, PIQA) y sus limitaciones documentales, que son notables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `rambley_v2` (definida mediante `custom_code`; no se detalla la estructura interna en la model card) |
| Parametros totales | 49.718.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código personalizado asociado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `rambley_v2` y la presencia de `custom_code` en el repositorio. Esto sugiere una implementación propia del autor que no se corresponde con las clases estándar de Transformers (por ejemplo, `LlamaForCausalLM` o `GPT2LMHeadModel`), y obliga a ejecutar código remoto del repositorio para instanciar el modelo. No se especifica si se trata de un transformer decoder-only, un modelo híbrido o una variante con atención lineal.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni innovaciones técnicas como decodificación especulativa. El checkpoint es explícitamente de preentrenamiento (`-Pretrain` en el nombre), por lo que cabe esperar que no haya pasado por alineación. Toda esta información debe considerarse no disponible a partir de la documentación publicada.

## Capacidades

- Generación de texto base: al ser un modelo de preentrenamiento, puede continuar secuencias de texto, pero sin garantías de seguir instrucciones ni de mantener un formato conversacional.
- Razonamiento de sentido común a pequeña escala: los benchmarks publicados (ARC, HellaSwag, PIQA) miden precisamente este tipo de capacidades en evaluación zero-shot.
- Respuesta a preguntas de opción múltiple: evaluado en ARC-Challenge y ARC-Easy con métricas `acc` y `acc_norm`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades multimodales.

## Casos de uso

- Investigación sobre entrenamiento de modelos pequeños: el checkpoint permite estudiar curvas de aprendizaje, dinámicas de preentrenamiento y comportamiento de arquitecturas personalizadas en el rango de 50M de parámetros, donde el coste computacional es bajo.
- Punto de partida para ajuste fino específico de dominio: al ser un modelo de preentrenamiento, puede servir como base para SFT en tareas acotadas (clasificación de texto, extracción de entidades) cuando se dispone de un corpus propio y se quiere evitar partir de cero.
- Experimentación con arquitecturas `custom_code`: útil para validar implementaciones propias de atención o de bloques transformer comparando contra checkpoints de referencia de tamaño similar.
- Evaluación comparativa de benchmarks zero-shot: sus resultados en ARC, HellaSwag y PIQA permiten situarlo frente a otros modelos de ~50M en tareas de sentido común, como referencia en estudios comparativos.
- Generación de texto controlada en entornos con recursos mínimos: con menos de 50M de parámetros, la inferencia cabe en CPU y en GPUs de gama baja, lo que facilita prototipos y pruebas de integración en pipelines ligeros.
- Docencia y formación: adecuado para explicar el ciclo completo de preentrenamiento, evaluación y ajuste fino con un modelo cuyo entrenamiento e inferencia son asequibles en hardware de consumo.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación zero-shot, `n-shot = 0`, filtro `none`):

| Tarea | Version | Metrica | Valor | Stderr |
|---|---|---|---|---|
| arc_challenge | 1 | acc | 0.1988 | ± 0.0117 |
| arc_challenge | 1 | acc_norm | 0.2406 | ± 0.0125 |
| arc_easy | 1 | acc | 0.4815 | ± 0.0103 |
| arc_easy | 1 | acc_norm | 0.4310 | ± 0.0102 |
| hellaswag | 1 | acc | 0.2978 | ± 0.0046 |
| hellaswag | 1 | acc_norm | 0.3308 | ± 0.0047 |
| piqa | 1 | acc | 0.6251 | ± 0.0113 |
| piqa | 1 | acc_norm | 0.6333 | ± 0.0112 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible. Tampoco se ofrece comparación con modelos de referencia en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 49,7M de parámetros en fp32, los pesos ocupan aproximadamente 199 MB; en fp16, unos 99 MB; en int8, unos 50 MB. El overhead de activaciones y del runtime es mínimo en comparación.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una iGPU moderna pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos diez años, y también en CPU.
- Opciones de despliegue: al usar `custom_code`, la carga mediante `transformers` requiere `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la ausencia de pesos GGUF y de arquitectura estándar hace improbable el soporte directo en estos runtimes sin conversión manual.
- Latencia y throughput: no disponibles. Por el tamaño, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, más allá de las cifras del propio modelo. La model card no incluye referencias a alternativas. Se indica, por tanto, que la comparativa con modelos de la misma categoría (por ejemplo, otros modelos de ~50M de parámetros) no está disponible en la documentación consultada.

## Limitaciones y advertencias

- Modelo de preentrenamiento: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y no debe usarse directamente como asistente conversacional.
- Rendimiento bajo en benchmarks: los valores de ARC-Challenge (0,1988 acc) y HellaSwag (0,2978 acc) están cerca del azar en tareas de cuatro opciones, lo que refleja la limitación de capacidad de un modelo de 50M sin ajuste.
- Sesgos: no documentados, pero al ser un modelo preentrenado sin alineación es esperable que reproduzca sesgos presentes en sus datos de entrenamiento, que tampoco se detallan.
- Riesgo de alucinación: alto en cualquier uso generativo, agravado por la falta de alineación y de instrucciones.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, por lo que no pueden asumirse.
- Licencia no disponible: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en entornos sensibles.
- Model card incompleta ("WIP"): la documentación puede cambiar y no hay garantías de mantenimiento ni de soporte.
- Sin descargas ni likes: el modelo no tiene tracción comunitaria, lo que reduce la probabilidad de encontrar incidencias resueltas o ejemplos de uso.

## Enlaces

- Hugging Face: https://huggingface.co/glossia/Rambley-V2-Next-50M-Pretrain
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
