# Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r08

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r08` es un checkpoint de investigación creado por Jeesup, basado en `meta-llama/Llama-2-7b-chat-hf`. Se trata de un experimento de compresión mediante SVD-LLM, que reduce la fracción de parámetros densos al 60,0 % del original, y posteriormente se aplica un proceso de edición por intercambio de componentes seleccionados con la regla `disc_iter`. El objetivo es estudiar cómo la compresión por descomposición en valores singulares afecta al comportamiento de seguridad y qué técnicas de reparación son más efectivas.

Este modelo no es un asistente generalista, sino un artefacto experimental dentro de una rejilla de configuraciones que varían reglas de selección y presupuestos. Su relevancia radica en aportar datos medibles sobre la relación entre compresión, alineación y utilidad, un área clave para el despliegue eficiente de modelos de lenguaje. La arquitectura es un transformer de decodificación de 6.738.415.616 parámetros, con una ventana de contexto heredada de Llama-2-7b-chat (4096 tokens). El repositorio tiene un tamaño de 13,5 GB y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificación (Llama-2-7b-chat) con compresión SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer de decodificación estándar con 6.738.415.616 parámetros. La compresión se realiza con SVD-LLM, que elimina el 40,02 % de los parámetros densos mediante descomposición en valores singulares, dejando una fracción de parámetros resultante de 0,5998. Posteriormente, se aplica un procedimiento de edición por intercambio de componentes: se restauran 4688 componentes y se intercambian otros 4688, con un presupuesto total del 1,0 % de los parámetros densos, repartido en 8 de 10 rondas iterativas (0,1 % por ronda). El valor de intercambio es `insert`, con una escala de inserción de 0,1 y una evicción ordenada por sigma. El checkpoint corresponde a una ronda intermedia (8 de 10) de una ejecución más larga, con semilla 42.

No se han documentado datos sobre el conjunto de entrenamiento utilizado ni se mencionan fases de RLHF o DPO adicionales. El modelo es un derivado del checkpoint de chat de Llama-2, por lo que conserva la capacidad de conversación, pero la compresión y la edición experimental alteran su comportamiento. El autor indica explícitamente que el propósito es medir los trade-offs entre seguridad y utilidad bajo compresión, y que algunos brazos de la rejilla están deliberadamente degradados en seguridad.

## Capacidades

- Generación de texto y conversación: hereda las capacidades de Llama-2-7b-chat, pero con comportamiento potencialmente alterado por la compresión y la edición. No se garantiza la coherencia ni la utilidad en tareas generales.
- Seguridad: las métricas medidas muestran una tasa de éxito de ataque (ASR) de 0,1904 en AdvBench y 0,1757 en StrongREJECT, evaluadas con HarmBench. El macro over-refusal es 0,1310 según WildGuard. Esto indica que el modelo es vulnerable a jailbreaks y que su comportamiento de rechazo es inconsistente.
- Tool calling / function calling: no disponible. No se documenta soporte para llamadas a herramientas ni integración con APIs.
- Agentes y razonamiento multi-paso: no disponible. No hay evidencia de capacidades de planificación o uso de agentes.
- Capacidades multilingües: no disponibles. El modelo base Llama-2 está entrenado principalmente en inglés, aunque puede generar texto en otros idiomas de forma limitada.
- Capacidades especiales: no dispone de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint permite analizar cómo la compresión SVD-LLM degrada la seguridad de un modelo de chat. Se puede utilizar para estudiar la relación entre el rango de las matrices de pesos y la alineación.
- Evaluación de técnicas de reparación de seguridad: al ser una celda de una rejilla más amplia, sirve como sujeto experimental para comparar reglas de selección de componentes (como `disc_iter`) y presupuestos de restauración.
- Benchmarking de ataques adversariales: las métricas de ASR (AdvBench y StrongREJECT) proporcionan una referencia para probar nuevos métodos de jailbreak o defensa en modelos comprimidos.
- Interpretabilidad de componentes: el proceso de intercambio de componentes permite identificar qué parámetros o proyecciones son críticos para el comportamiento de seguridad. Este modelo puede usarse para visualizar o cuantificar la importancia de componentes específicos.
- Desarrollo de métodos de selección de componentes: la regla `disc_iter` y la escala de inserción (0,1) pueden evaluarse en este checkpoint para validar hipótesis sobre qué criterios seleccionan mejor los componentes a restaurar.
- Estudio de trade-offs utilidad/seguridad: el modelo puede emplearse en experimentos controlados donde se mide simultáneamente la tasa de éxito de ataques y la tasa de rechazo excesivo, para caracterizar el equilibrio entre ambos bajo compresión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,1904 |
| StrongREJECT ASR (HarmBench judge) | 0,1757 |
| Macro over-refusal (WildGuard) | 0,1310 |

Estas métricas han sido medidas por el autor del modelo y se incluyen en la model card. No se dispone de resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información proporcionada. Tampoco hay datos comparativos con el modelo base Llama-2-7b-chat ni con otros modelos comprimidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 6.738.415.616 parámetros. En formato fp16 (13,5 GB), se recomienda al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits se estiman unos 7 GB, y con 4 bits unos 4 GB, aunque no se han publicado cuantizaciones específicas en el repositorio.
- GPU recomendadas: A100 40GB, H100 80GB o RTX 4090 24GB para inferencia en fp16. Para cuantización 4 bits, una RTX 3090 o RTX 4090 puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización 4 bits en RTX 3090/4090, pero no hay configuraciones de cuantización publicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con arquitecturas Llama-2 en formato safetensors, aunque se requiere convertir los pesos si se usan cuantizaciones.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. El modelo base es `meta-llama/Llama-2-7b-chat-hf`, pero no se incluyen métricas de ese modelo en la model card. Por tanto, no es posible realizar una comparativa cuantitativa. Cabe señalar que este checkpoint es un artefacto experimental y no debe compararse directamente con modelos de producción sin evaluaciones propias.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo desplegable. El autor indica explícitamente que no es un asistente generalista y que debe tratarse como un sujeto experimental.
- La seguridad está degradada: las tasas de éxito de ataque (0,1904 en AdvBench y 0,1757 en StrongREJECT) son elevadas, lo que indica vulnerabilidad a jailbreaks. No es adecuado para entornos donde se requiera un comportamiento seguro.
- Riesgo de alucinación y comportamiento errático: la compresión y la edición pueden afectar a la coherencia y a la fidelidad de las respuestas. Se recomienda evaluar el modelo en cada caso de uso.
- El checkpoint es intermedio (8 de 10 rondas del proceso de edición), por lo que no representa el resultado final de la ejecución completa.
- Limitaciones de contexto e idioma: la ventana de contexto es de 4096 tokens, heredada de Llama-2-7b-chat. Los idiomas soportados no están documentados, aunque el modelo base está entrenado principalmente en inglés.
- Restricciones de licencia: el uso está sujeto a la Llama 2 Community License y al `USE_POLICY.md` incluido en el repositorio. Esto puede imponer restricciones para uso comercial y requiere aceptar los términos de la licencia.
- No se han publicado cuantizaciones ni configuraciones de despliegue optimizadas, por lo que el rendimiento en producción no está caracterizado.

## Enlaces

- HuggingFace: [https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r08](https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r08)

No se han encontrado enlaces adicionales relevantes (papers, blogs, repos) en los resultados de la búsqueda web.
