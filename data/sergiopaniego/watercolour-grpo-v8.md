# sergiopaniego/watercolour-grpo-v8

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v8` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por Sergio Paniego, Machine Learning Engineer en Hugging Face. Se trata de un experimento de entrenamiento con aprendizaje por refuerzo (RL) mediante el algoritmo GRPO (Group Relative Policy Optimization), introducido en el artículo DeepSeekMath. El objetivo es mejorar las capacidades de razonamiento del modelo, aunque no se especifica el conjunto de datos utilizado ni los resultados obtenidos.

El modelo tiene aproximadamente 4 mil millones de parámetros (heredados del base) y se distribuye en formato safetensors. No se indica la longitud de contexto, los idiomas soportados ni la licencia exacta, más allá de una etiqueta genérica "license". Al ser un ajuste fino reciente (agosto de 2026), su relevancia radica en explorar técnicas de RL para modelos de instrucción de tamaño medio, aunque carece de documentación pública sobre su rendimiento o aplicaciones concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct) |
| Parametros totales | 4B (aproximado, según modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | No especificado (safetensors, compatible con cuantización posterior) |
| Idiomas soportados | No disponible |
| Licencia | "license" (sin especificar; probablemente heredada del base, pero no confirmado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only con arquitectura estándar de Qwen3. El entrenamiento se realizó con GRPO, un método de optimización de política que agrupa respuestas generadas por el modelo y calcula ventajas relativas para actualizar los pesos, sin necesidad de un modelo crítico separado. Este enfoque, popularizado por DeepSeekMath, se usa típicamente para reforzar habilidades de razonamiento matemático y lógico.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se llevó a cabo con la librería TRL (versión 1.10.0) y Transformers 5.16.1, según la model card. No hay información sobre innovaciones técnicas específicas más allá del uso de GRPO.

## Capacidades

- No se han documentado capacidades específicas para este ajuste fino en la model card.
- Hereda las capacidades del modelo base `Qwen3-4B-Instruct-2507`, que incluyen generación de texto, chat multi-turno, razonamiento, comprensión de código y matemáticas básicas, y soporte para instrucciones en varios idiomas (aunque no se confirma qué idiomas conserva tras el ajuste).
- Al estar entrenado con GRPO, es plausible que tenga un refuerzo en tareas de razonamiento paso a paso, pero no hay evidencia pública que lo confirme.
- No se menciona soporte para tool calling, agentes, visión o audio; se asume que son los del modelo base, pero sin garantía.

## Casos de uso

- No hay casos de uso documentados por el autor. Dado que es un modelo experimental sin evaluación pública, no se recomienda su uso en producción sin validación previa.
- Posibles usos académicos: experimentación con técnicas de RL en modelos de instrucción, comparación de métodos GRPO frente a otros enfoques.
- Uso como punto de partida para investigación: al ser un fine-tune de un modelo conocido, puede servir para estudiar el efecto del entrenamiento con RL en el comportamiento del modelo.
- En entornos de desarrollo, podría emplearse para pruebas de generación de texto o chat, siempre que se valide su calidad.
- Para aplicaciones reales, se recomienda utilizar el modelo base `Qwen3-4B-Instruct-2507` o modelos con mejor documentación y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- Al tener aproximadamente 4B parámetros, las necesidades de VRAM dependen de la cuantización:
  - FP16 (sin cuantizar): ~8 GB de VRAM.
  - Cuantización 8-bit: ~4,5 GB.
  - Cuantización 4-bit: ~2,5 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070/3080, A10, L4). Con cuantización 4-bit puede ejecutarse en GPUs de 4 GB (como RTX 3050 o incluso en CPU con llama.cpp).
- Opciones de despliegue: al estar en formato safetensors, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama y Transformers.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un fine-tune del Qwen3-4B-Instruct, por lo que una comparación natural sería contra ese modelo base, pero no hay métricas de rendimiento para este ajuste. Tampoco se conocen modelos comparables en la misma categoría (fine-tunes de 4B con GRPO) con datos públicos. Se recomienda consultar la documentación del modelo base para referencias de rendimiento.

## Limitaciones y advertencias

- No hay evaluación pública: no se han publicado benchmarks, análisis de sesgos ni pruebas de robustez.
- Licencia no clara: la etiqueta "license" no especifica términos de uso; podría no ser apta para uso comercial sin verificación.
- Riesgo de sobreajuste: al ser un entrenamiento con RL sin detalles del dataset, podría presentar comportamientos no deseados en dominios fuera del entrenamiento.
- Alucinaciones y sesgos: heredados del modelo base, sin mitigaciones adicionales documentadas.
- No se recomienda su uso en producción sin una validación exhaustiva y una revisión de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v8
- Perfil del autor en Hugging Face: https://huggingface.co/sergiopaniego
- GitHub del autor: https://github.com/sergiopaniego
- Web personal del autor: https://sergiopaniego.github.io/
- Publicaciones del autor: https://sergiopaniego.github.io/publications/
- Artículo de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
