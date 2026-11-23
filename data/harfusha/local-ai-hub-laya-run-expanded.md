# Harfusha/local-ai-hub-laya-run-expanded

## Resumen

Harfusha/local-ai-hub-laya-run-expanded es un checkpoint de inferencia experimental publicado por el usuario Harfusha, obtenido mediante fine-tuning del modelo `convaiinnovations/laya-multilingual` (licencia Apache-2.0). El modelo está especializado en una tarea muy concreta: emitir decisiones de selección de modelo ("model-choice decisions") dentro del contexto de un sistema denominado Local AI Hub. No es un modelo de propósito general, sino un clasificador generativo de decisión entrenado sobre 6.052 ejemplos locales acotados.

Con 321.908.998 parámetros (unos 322 millones) y un tamaño de repositorio de 0,7 GB en formato safetensors, se sitúa en la gama de modelos pequeños, aptos para inferencia en hardware modesto. La model card reporta una mejora sustancial en precisión de elección sobre 388 decisiones reservadas (held-out): de 0,4278 en el modelo base a 0,9768 tras el fine-tuning, junto con una reducción de latencia (p50 de 34,95 ms a 24,10 ms; p95 de 43,92 ms a 39,32 ms).

El modelo se presenta explícitamente como experimental y como una "señal de decisión en la sombra" (shadow decision signal): la decisión determinista del Hub sigue siendo la autoritativa. Por tanto, su relevancia es acotada: resulta útil como componente auxiliar o de comparación en sistemas de enrutamiento de modelos, no como sustituto de la lógica de decisión principal ni como modelo conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `convaiinnovations/laya-multilingual`) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre del modelo base sugiere multilingüismo, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se trata de un fine-tuning del checkpoint `convaiinnovations/laya-multilingual`, del que se heredan arquitectura, tokenizador y configuración de contexto; la model card no especifica si es un transformer denso, un modelo con atención lineal u otra variante. Tampoco se documentan el número de capas, la dimensión oculta ni la ventana de contexto efectiva.

El entrenamiento se realizó sobre 6.052 ejemplos de alcance local ("locally scoped examples"), y el autor indica explícitamente que los datos de origen y los ejemplos no se distribuyen. No se menciona el uso de RLHF, DPO ni de un pipeline de alineación; el objetivo declarado es el ajuste supervisado para la tarea de elección de modelo. La evaluación se llevó a cabo sobre 388 decisiones reservadas, con métricas de precisión de elección y latencias p50 y p95 antes y después del ajuste. No se documentan innovaciones técnicas adicionales como decodificación especulativa o modos de razonamiento extendido.

## Capacidades

- Emisión de decisiones de selección de modelo dentro del sistema Local AI Hub, tarea principal para la que fue ajustado.
- Clasificación generativa de opciones de modelo a partir de un contexto de entrada acotado.
- Generación de texto derivada del modelo base `laya-multilingual`, aunque no se documenta su calidad fuera de la tarea de ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles como dato verificado; el nombre del modelo base sugiere multilingüismo, pero la model card no lo confirma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutamiento auxiliar de modelos en un hub local: el modelo puede emitir una señal de decisión sobre qué modelo elegir para una petición dada, con una latencia p50 reportada de 24,10 ms, adecuada para integrarse en el camino caliente de un orquestador.
- Validación en sombra de la lógica determinista: al ejecutarse en paralelo a la decisión autoritativa del Hub, permite comparar ambas salidas y detectar discrepancias sin afectar a producción.
- Experimentación en investigación sobre selección de modelos: sirve como punto de partida para estudiar políticas de enrutamiento aprendidas frente a reglas heurísticas, dado que la mejora de precisión reportada (0,4278 a 0,9768) ofrece una referencia cuantitativa.
- Pruebas de regresión de pipelines de decisión: con 388 decisiones reservadas documentadas, el modelo puede usarse como referencia para verificar que cambios en el orquestador no degradan la calidad de elección.
- Despliegue en hardware de gama baja para prototipos: con unos 322 millones de parámetros y 0,7 GB en safetensors, cabe en GPUs de consumo y en CPU para inferencia por lotes, lo que facilita entornos de desarrollo sin infraestructura dedicada.
- Evaluación comparativa de fine-tunings: al estar construido sobre `laya-multilingual`, permite medir el efecto del ajuste sobre latencia y precisión en una tarea concreta, como base para decidir si merece la pena especializar modelos pequeños en lugar de usar el modelo base.

## Benchmarks y rendimiento

| Métrica | Modelo base | Fine-tuned |
|---|---|---|
| Precisión de elección (388 decisiones reservadas) | 0,4278 | 0,9768 |
| Latencia p50 | 34,95 ms | 24,10 ms |
| Latencia p95 | 43,92 ms | 39,32 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 321.908.998 parámetros, en fp16 serían necesarios aproximadamente 0,64 GB solo para pesos, y en fp32 unos 1,29 GB, a los que habría que sumar memoria para activaciones y caché KV.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería poder alojar los pesos en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí (por ejemplo, GTX 1650, RTX 3060 o superiores), aunque el fabricante no lo confirma.
- Opciones de despliegue: no disponibles en la documentación; al publicarse en safetensors, es compatible con frameworks estándar como Transformers, y podría convertirse a GGUF para llama.cpp u Ollama, aunque no se documenta.
- Latencia y throughput: la model card reporta p50 de 24,10 ms y p95 de 39,32 ms en el entorno de evaluación del autor; no se especifica el hardware empleado ni el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Harfusha/local-ai-hub-laya-run-expanded | 321.908.998 | no disponible | Apache-2.0 | Hugging Face |
| convaiinnovations/laya-multilingual (base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de enrutamiento de modelos | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de decisión de modelo) ni de datos de rendimiento de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como tal y como señal de decisión en la sombra; la decisión determinista del Hub sigue siendo la autoritativa.
- Los datos de entrenamiento y los ejemplos no se distribuyen, lo que impide auditar la composición del dataset y detectar sesgos de selección.
- La evaluación se limita a 388 decisiones reservadas de un dominio muy específico; no hay garantías de generalización fuera de ese contexto.
- No se documentan sesgos conocidos, pero al derivar de un modelo multilingüe sin datos de alineación declarados, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo generativo, podría producir salidas no válidas fuera de la tarea de elección.
- Limitaciones de contexto e idioma: no documentadas; se desconoce la ventana máxima y los idiomas efectivamente soportados.
- Licencia Apache-2.0: permite uso comercial, pero el carácter experimental y la falta de garantías desaconsejan su uso en producción como componente autoritativo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harfusha/local-ai-hub-laya-run-expanded
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
