# francescortu/DistillDetect-traj-gemma-3-4b-pt-from-o1-s1

## Resumen

DistillDetect-traj-gemma-3-4b-pt-from-o1-s1 es un conjunto de checkpoints de entrenamiento publicados por francescortu para reproducir el estudio *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692). Se trata de un modelo estudiante destilado: el modelo base **Gemma-3-4B-PT** de Google se fine-tunea con respuestas generadas por **OpenAI o1** sobre el conjunto de 1.000 prompts de **s1**. El repositorio contiene 13 puntos de control a lo largo del entrenamiento supervisado (SFT), desde el 1% hasta el 100% del calendario de pasos, con el objetivo de analizar cómo se adquiere el comportamiento del profesor durante el proceso de destilación.

El modelo es un fine-tuning completo (no LoRA) con pesos completos en cada checkpoint. Está pensado exclusivamente para investigación sobre detección de destilación, no como modelo de propósito general. Su relevancia radica en que permite estudiar la dinámica de la destilación a lo largo del tiempo, algo que normalmente solo se evalúa al final del entrenamiento. La licencia es **gemma**, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-4B-PT) |
| Parametros totales | 4.000 millones (modelo base Gemma-3-4B-PT) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la ficha; el modelo base Gemma-3-4B-PT soporta 128K segun especificaciones de Google |
| Tipos de cuantizacion | No publicados; solo pesos completos en safetensors (bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (heredada del modelo base) |
| Formato de pesos | Safetensors (pesos completos, sin cuantizar) |

## Arquitectura y entrenamiento

El modelo parte de **Gemma-3-4B-PT**, un transformer decoder-only con atención local y global, diseñado por Google. Sobre esta base se realiza un fine-tuning supervisado completo (sin LoRA) utilizando respuestas de **OpenAI o1** a 1.000 prompts del conjunto **s1**. El entrenamiento sigue la receta descrita en el apéndice A del paper: 3 épocas, tasa de aprendizaje 1e-5 con calendario coseno y 5% de warmup, batch efectivo de 16 (4 por dispositivo × 4 de acumulación de gradientes), tamaño de bloque 4.096, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`.

La innovación principal no está en la arquitectura, sino en el propósito: se guardan 13 checkpoints a lo largo del entrenamiento (1%, 5%, 8%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% y 100% de los pasos) para trazar la evolución de la adquisición de comportamiento del profesor. Los checkpoints del 1%, 5% y 8% provienen de una ejecución separada detenida al 10%, aunque con la misma semilla y orden de datos, por lo que las curvas de pérdida concuerdan con una tolerancia de 2.15e-2.

## Capacidades

- Generación de texto y razonamiento matemático: evaluado en GSM8K (4-shot) y MATH500 (zero-shot) con decodificación greedy.
- Modelo de investigación: diseñado específicamente para estudiar la detección de destilación, no para tareas generales.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso explícito más allá de la generación de soluciones matemáticas.
- El modelo base Gemma-3-4B-PT es multimodal (texto e imagen), pero este fine-tuning se realiza únicamente con datos de texto; no se documentan capacidades de visión en los checkpoints.
- Multilingüismo: no se especifican idiomas soportados; el modelo base de Gemma 3 es multilingüe, pero no hay datos sobre el comportamiento de este fine-tuning en otros idiomas.

## Casos de uso

- Investigación académica sobre detección de destilación: el modelo permite reproducir el estudio y analizar cómo cambia la distribución de salidas a lo largo del entrenamiento, comparando checkpoints tempranos y tardíos.
- Estudio de trayectorias de entrenamiento: los 13 checkpoints facilitan el análisis de la dinámica de pérdida, la aparición de comportamientos del profesor y la saturación de métricas.
- Evaluación de métodos de detección de destilación: los checkpoints sirven como conjunto de datos para probar clasificadores que distingan modelos destilados de no destilados, como se describe en el paper.
- Análisis de truncamiento en generación larga: los datos de evaluación incluyen registros de truncamiento (más del 10% de muestras agotan el presupuesto de 16.384 tokens en MATH500), lo que permite estudiar la verbosidad y la longitud de las respuestas.
- Reproducción de experimentos controlados: al ser un fine-tuning completo con semilla fija, es útil para verificar la reproducibilidad de resultados en entornos de investigación.
- Comparación de profesores: junto con otros repositorios del mismo autor (por ejemplo, con GPT-OSS-120B como profesor), permite comparar cómo diferentes profesores influyen en la trayectoria del estudiante.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión en GSM8K y MATH500 a lo largo del entrenamiento. Se indica que los valores de MATH500 marcados con asterisco son cotas inferiores porque más del 10% de las muestras agotaron el presupuesto de generación de 16.384 tokens.

| % de entrenamiento | Paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 37.38 | 18.00 * |
| 5% | 9 | 46.25 | 20.00 * |
| 8% | 15 | 51.02 | 13.00 * |
| 10% | 19 | 50.87 | 19.60 * |
| 20% | 38 | 48.07 | 19.20 * |
| 30% | 57 | 49.36 | 20.20 * |
| 40% | 76 | 46.10 | 21.00 * |
| 50% | 94 | 47.46 | 19.80 * |
| 60% | 113 | 48.07 | 23.20 * |
| 70% | 132 | 48.07 | 24.60 * |
| 80% | 151 | 47.99 | 20.40 * |
| 90% | 170 | 47.46 | 20.60 * |
| 100% | 189 | 46.78 | 21.80 * |

El modelo base sin entrenar obtiene 36.92 en GSM8K, mientras que el checkpoint final alcanza 46.78, una mejora de +9.86 puntos. La prueba de McNemar sobre 1.319 preguntas de GSM8K da un valor p de 7.2e-11, lo que confirma que la mejora es estadísticamente significativa. No se proporcionan comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. El tamaño del repositorio es de 8.6 GB, lo que corresponde a pesos completos en bf16 para un modelo de 4.000 millones de parámetros. A modo orientativo:

- VRAM estimada para inferencia en bf16: aproximadamente 8-10 GB, más overhead de activaciones.
- Con cuantización a 8 bits: unos 4-5 GB; a 4 bits: unos 2-3 GB (no se publican cuantizaciones oficiales).
- GPU recomendadas: tarjetas consumer con 12-16 GB de VRAM (RTX 3080/3090, RTX 4070/4080, etc.) o GPUs de datacenter como A10/A100.
- Opciones de despliegue: al ser un modelo de investigación, no se documentan integraciones con vLLM, Ollama o TGI. Es compatible con la librería transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de la misma categoría en la información proporcionada. La comparación más relevante es con el modelo base sin entrenar y con el modelo final del mismo estudio (sin checkpoints intermedios). También existe un repositorio hermano con GPT-OSS-120B como profesor, pero no se aportan datos comparativos.

| Modelo | Parámetros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Gemma-3-4B-PT (base) | 4B | 128K (según Google) | 36.92 | Gemma |
| DistillDetect-traj (checkpoint final) | 4B | No disponible | 46.78 | Gemma |
| DistillDetect-gemma-3-4b-pt-from-gpt-oss-120b-s1 | 4B | No disponible | No disponible | Gemma |

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción ni como asistente general.
- Los checkpoints del 1%, 5% y 8% provienen de una ejecución separada; aunque la semilla y el orden de datos son fijos, las curvas de pérdida no coinciden exactamente (diferencia de 2.15e-2).
- Entrenamiento con una sola semilla: diferencias inferiores a un punto porcentual no son resolubles.
- Los resultados de MATH500 están afectados por el truncamiento del presupuesto de generación (16.384 tokens), por lo que son cotas inferiores, no mediciones exactas.
- El modelo puede heredar sesgos del modelo base Gemma-3-4B-PT y de los datos de entrenamiento de o1, aunque no se documentan análisis de sesgo específicos.
- Riesgo de alucinación inherente a los modelos generativos; no se ha evaluado su fiabilidad factual.
- La licencia Gemma restringe el uso comercial según los términos de Google; es necesario revisar la licencia completa antes de cualquier uso.
- No se garantiza el soporte multilingüe ni el comportamiento en dominios fuera de matemáticas y razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francescortu/DistillDetect-traj-gemma-3-4b-pt-from-o1-s1
- Modelo final (sin trayectoria): https://huggingface.co/francescortu/DistillDetect-gemma-3-4b-pt-from-o1-s1
- Repositorio hermano con GPT-OSS-120B como profesor: https://huggingface.co/francescortu/DistillDetect-gemma-3-4b-pt-from-gpt-oss-120b-s1
- Paper arXiv: https://arxiv.org/abs/2607.09692
- Código del estudio (GitHub): https://github.com/RajatRawat-creator/DistillDetect
