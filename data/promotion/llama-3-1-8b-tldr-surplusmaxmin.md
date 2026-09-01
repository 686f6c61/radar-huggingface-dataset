# promotion/Llama-3.1-8B-TLDR-SurplusMaxmin

## Resumen

Llama-3.1-8B-TLDR-SurplusMaxmin es un modelo de investigación desarrollado por el usuario "promotion" en HuggingFace, centrado en el estudio de la alineación multi-objetivo mediante optimización de preferencias. Se trata de un fine-tune del modelo instructivo `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. El modelo explora cómo agregar múltiples objetivos (coverage, faithfulness, conciseness, helpfulness) en el entrenamiento de un LLM, utilizando una regla de agregación "surplus maxmin" que maximiza el mínimo excedente sobre la política de referencia en todos los objetivos.

La relevancia de este modelo radica en su contribución metodológica: dentro de un panel de experimentos donde todos los brazos comparten el mismo pool de respuestas, optimizador y presupuesto de 300 pasos, la única diferencia es la regla de agregación de objetivos. Esto permite aislar el efecto de la regla en el comportamiento final. Los resultados reportados muestran que este brazo en particular dedica todo su peso a la concisión, logrando mantener todos los objetivos por encima de la referencia, aunque con un excedente mínimo modesto en conciseness (+0.0363) frente a mejoras más sustanciales en coverage (+0.1617), faithfulness (+0.1804) y helpfulness (+0.1319).

Con 8.030 millones de parámetros y una arquitectura transformer decoder-only estándar de Llama 3.1, el modelo está diseñado principalmente para experimentación académica en métodos de alineación, no como un producto listo para producción. Su licencia llama3.1 permite uso comercial con condiciones, pero su carácter experimental y la ausencia de benchmarks estándar recomiendan precaución en escenarios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de Llama-3.1-8B-Instruct: un transformer decoder-only con 8.030 millones de parámetros, atención por ventanas deslizantes y normalización RMSNorm. No se ha modificado la arquitectura base; el cambio reside únicamente en los pesos ajustados durante el fine-tune.

El entrenamiento se enmarca en un protocolo de optimización de preferencias multi-objetivo. Los objetivos (coverage, faithfulness, conciseness, helpfulness) se puntúan mediante un oráculo de preferencias basado en `Qwen3-32B` con prompting, evaluando cada par de respuestas en ambos órdenes de presentación y promediando los resultados (swap-averaging). Todos los brazos del panel comparten un pool de respuestas común, un único optimizador y un presupuesto de 300 pasos de entrenamiento. La única variable entre brazos es la función de agregación de los objetivos, siendo este modelo el que emplea la regla "surplus maxmin". No se especifican detalles sobre el dataset de entrenamiento, el número total de tokens ni la composición de los datos.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Llama-3.1-8B-Instruct.
- Resumen de textos con un fuerte énfasis en la concisión, como resultado del fine-tune orientado al panel TL;DR.
- Optimización multi-objetivo: el modelo busca mantener todas las métricas evaluadas por encima de la política de referencia, aunque en la práctica sacrifica mejoras individuales para maximizar el mínimo.
- No se ha verificado explícitamente el soporte de tool calling, function calling o razonamiento multi-paso; al ser un fine-tune de instruct, podría heredar algunas capacidades, pero no hay evidencia en la documentación.
- Capacidades multilingües no documentadas; el modelo base Llama 3.1 soporta varios idiomas, pero este fine-tune no especifica su alcance lingüístico.

## Casos de uso

- Investigación en alineación multi-objetivo: el modelo sirve como brazo de referencia en estudios sobre cómo diferentes reglas de agregación afectan el equilibrio entre objetivos. Su diseño aislado permite comparaciones causales.
- Experimentación con resúmenes extremadamente concisos: dado que el modelo "gasta todo su peso en concisión", puede generar resúmenes muy breves, útiles para evaluar trade-offs entre brevedad y fidelidad en sistemas de resumen.
- Evaluación de oráculos de preferencia: al estar entrenado con un oráculo Qwen3-32B, puede usarse para estudiar la robustez de dicho oráculo en tareas de TL;DR.
- Benchmark de métodos de optimización: el repositorio `promotion/nbpo-benchmark-generations` contiene generaciones de referencia para los brazos del panel, permitiendo reproducir experimentos y comparar métricas.
- Análisis de sensibilidad a la regla de agregación: investigadores pueden comparar este modelo con otros brazos del panel (p. ej., media aritmética, maximin) para entender cómo la elección de la función de agregación influye en el comportamiento final.
- Prototipado de asistentes de resumen orientados a brevedad: aunque no es un modelo de producción, puede servir como base para desarrollar sistemas que prioricen respuestas cortas en contextos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas de surplus sobre la política de referencia en un conjunto de 100 prompts, con poblaciones a escala \(A_k = P_k - 1/2\):

| Objetivo | Surplus |
|---|---|
| coverage | +0.1617 |
| faithfulness | +0.1804 |
| conciseness | +0.0363 |
| helpfulness | +0.1319 |
| **minimum** | **+0.0363** |
| **average** | **+0.1276** |

Estos valores indican que el modelo supera a la referencia en todos los objetivos, pero el surplus mínimo se concentra en la concisión, lo que refleja la estrategia de dedicar todo el peso a esa métrica. No se proporcionan intervalos de confianza ni pruebas de significación en la model card; se remite al apéndice del paper asociado (no enlazado explícitamente).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8.03B parámetros × 2 bytes por parámetro).
- Con cuantización de 4 bits (tipo GPTQ o AWQ), la VRAM necesaria se reduce a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o superiores.
- GPUs recomendadas para FP16 sin cuantizar: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), todos compatibles con arquitecturas Llama.
- Latencia y throughput: no se han publicado mediciones específicas para este modelo; al ser un fine-tune de 8B, se esperan valores similares a otros Llama-3.1-8B (típicamente ~50-100 tokens/s en A100 con batching óptimo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| promotion/Llama-3.1-8B-TLDR-SurplusMaxmin | 8.03B | No disponible | Fine-tune multi-objetivo con surplus maxmin | llama3.1 |
| RedHatAI/Llama-3.1-8B-tldr | 8.03B | No disponible | Fine-tune para resumir en estilo Reddit | llama3.1 |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B | 128k (según documentación oficial) | Modelo instructivo generalista | llama3.1 |

El modelo de "promotion" se distingue por su metodología experimental de alineación multi-objetivo, mientras que RedHatAI ofrece un fine-tune más convencional para resumen. No se dispone de benchmarks comparativos entre ambos. El modelo base instructivo es la referencia natural para medir el impacto del fine-tune.

## Limitaciones y advertencias

- Modelo experimental: diseñado para investigación en alineación; no ha sido validado para uso en producción.
- Ausencia de benchmarks estándar: no se han publicado resultados en MMLU, HumanEval u otras pruebas ampliamente aceptadas, lo que dificulta evaluar su rendimiento general.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido factualmente incorrecto, especialmente en tareas de resumen donde la concisión extrema puede sacrificar precisión.
- Sesgos potenciales: no se documentan sesgos específicos, pero el modelo hereda los sesgos del corpus de entrenamiento de Llama 3.1 y del proceso de fine-tune.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; si se hereda de Llama 3.1, sería de 128k tokens, pero no hay confirmación.
- Restricciones de licencia: la licencia llama3.1 permite uso comercial, pero requiere aceptar los términos de la comunidad Llama, que incluyen condiciones sobre el uso de marcas y atribución.
- Dependencia del oráculo de preferencias: el entrenamiento se basa en un oráculo Qwen3-32B; la calidad del modelo depende de la fiabilidad de dicho oráculo, que no está pública en este repositorio.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/promotion/Llama-3.1-8B-TLDR-SurplusMaxmin)
- [Dataset de generaciones de benchmark](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [Paper asociado: no disponible en la informacion proporcionada]
