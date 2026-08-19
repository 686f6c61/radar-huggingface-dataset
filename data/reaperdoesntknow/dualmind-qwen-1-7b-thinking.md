# reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking

## Resumen

Dualmind-Qwen-1.7B-Thinking es un modelo de lenguaje de 1.700 millones de parámetros efectivos (2.031.739.904 en total) desarrollado por Convergent Intelligence LLC, división de investigación, y publicado en HuggingFace por el usuario reaperdoesntknow. Se trata de un fine-tuning del modelo Disctil-Qwen3-1.7B —que a su vez proviene de una cadena de destilación sobre Qwen3-1.7B— entrenado con 2,5 millones de tokens de trazas de razonamiento del modelo Claude Opus 4.6 de Anthropic, utilizando la metodología propietaria DualMind SFT. El objetivo es transferir a un modelo pequeño el patrón deliberativo de un modelo frontera: exploración de hipótesis, retrocesos, auto-corrección y síntesis final.

El modelo emplea una arquitectura transformer causal estándar (Qwen3ForCausalLM) con atención por grupos de consultas (GQA), 28 capas, tamaño oculto de 2048 y una longitud de contexto máxima de 40.960 tokens. Aunque el entrenamiento se realizó con secuencias de hasta 4.096 tokens, la posición máxima del modelo base permite ventanas mucho más largas. Su relevancia radica en demostrar que la destilación de razonamiento de modelos frontera puede producir modelos compactos con capacidades de deliberación extendida, útiles para entornos con recursos limitados o inferencia en el borde. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal con GQA) |
| Parametros totales | 2.031.739.904 (≈2,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (máxima posición del modelo base; entrenado con secuencias de 4.096) |
| Tipos de cuantizacion | No disponible (formato original en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3ForCausalLM, un transformer causal estándar con atención de grupos de consultas (GQA) —16 cabezas de consulta y 8 de clave/valor—, función de activación SiLU, tamaño oculto de 2048, 28 capas y un vocabulario de 151.936 tokens. El modelo base es Disctil-Qwen3-1.7B, que ya había sido sometido a un refinamiento DISC (una técnica de destilación iterativa) dentro de la cadena de destilación de Qwen3-1.7B.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) con TRL SFTTrainer sobre el dataset nohurry/Opus-4.6-Reasoning-3000x-filtered, que contiene trazas de razonamiento extendido de Claude Opus 4.6 con rechazos eliminados. Se añadieron aproximadamente 2,5 millones de tokens adicionales, con un total de 512 pasos y unas 7,4 épocas. La pérdida de entrenamiento descendió de 1,744 a 1,455, la pérdida de evaluación final fue de 1,406 (inferior a la de entrenamiento, indicando ausencia de sobreajuste) y la precisión de tokens subió del 61,0% al 67,8%. También se menciona el dataset zai-org/LongWriter-6k en los metadatos, aunque no aparece en la tabla de entrenamiento de la model card. No se emplearon técnicas de RLHF ni DPO; la metodología DualMind SFT se basa en la destilación de conocimiento pura, donde el patrón de razonamiento del profesor se transfiere al estudiante mediante regresión sobre las secuencias de salida.

## Capacidades

- Generación de texto y diálogo conversacional en inglés, con formato de chat estándar (chat template de Qwen3).
- Razonamiento deliberativo extendido: el modelo tiende a producir cadenas de pensamiento multi-fase, explorando hipótesis, reconsiderando y auto-corrigiéndose antes de concluir, imitando el patrón de Claude Opus 4.6.
- Auto-corrección y manejo de incertidumbre: capacidad de retroceder en una línea de razonamiento cuando detecta debilidad, y de sintetizar entre múltiples enfoques.
- Seguimiento de instrucciones y generación de explicaciones detalladas.
- Soporte de contexto largo (hasta 40.960 tokens en inferencia, aunque el entrenamiento se limitó a 4.096).
- No se documenta soporte explícito de tool calling, function calling ni capacidades multimodales (visión, audio). El modelo es exclusivamente de texto.

## Casos de uso

- Asistentes de razonamiento en entornos con recursos limitados: el modelo puede desplegarse en GPUs de consumo o en el borde para proporcionar respuestas razonadas a problemas lógicos, matemáticos o científicos, sin depender de APIs externas.
- Generación de explicaciones pedagógicas: su patrón deliberativo permite descomponer problemas complejos en pasos intermedios, útil para plataformas educativas que necesiten explicar conceptos de forma gradual y auto-corregida.
- Análisis de textos con incertidumbre: en tareas como revisión de literatura o análisis de argumentos, el modelo puede sopesar evidencias, reconocer ambigüedades y ofrecer conclusiones matizadas, gracias a su entrenamiento con trazas de razonamiento que incluyen duda y reconsideración.
- Preprocesamiento de datos para pipelines de IA: puede generar anotaciones razonadas, etiquetas explicadas o resúmenes deliberativos que luego alimentan otros sistemas, aprovechando su bajo coste de inferencia.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para validar ideas de productos de chat o agentes de texto antes de escalar a modelos mayores.
- Investigación en destilación de conocimiento: sirve como caso de estudio para comparar la transferencia de patrones de razonamiento entre modelos frontera y modelos pequeños, y para analizar el efecto de diferentes señales de entrenamiento (lógica sintética vs. trazas reales de deliberación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida final de 1,406 en evaluación y precisión de tokens del 67,8%), pero no se proporcionan resultados en MMLU, HumanEval, GSM8K u otras pruebas estándar. No se pueden realizar comparaciones cuantitativas con otros modelos sin estos datos.

## Requisitos de hardware

- VRAM estimada: en BF16, el modelo ocupa aproximadamente 4 GB (2,03B parámetros × 2 bytes). Con cuantización de 4 bits, el uso de VRAM puede reducirse a alrededor de 1-1,5 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en BF16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A10, A100, H100). Para cuantización de 4 bits, bastaría con GPUs de 4 GB o menos.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media y baja, así como en Apple Silicon con suficiente memoria unificada (8 GB o más).
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, TGI (text-generation-inference, indicado en los tags), llama.cpp y Ollama (si se generan pesos GGUF, aunque no se proporcionan oficialmente).
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de decodificación de decenas de tokens por segundo en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. A continuación se presenta una comparación estructural con el modelo base y con alternativas de tamaño similar, basada en información pública general (no en resultados de benchmarks):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dualmind-Qwen-1.7B-Thinking | 2,03B | 40.960 | Apache 2.0 | HuggingFace |
| Qwen3-1.7B (base) | 1,7B | 40.960 | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 | MIT | HuggingFace |

La principal diferencia frente al base Qwen3-1.7B es el fine-tuning específico con trazas de razonamiento de Opus 4.6, que modifica el estilo de generación hacia una deliberación más explícita. Frente a SmolLM2, ofrece mayor contexto y un enfoque de razonamiento más marcado. Frente a DeepSeek-R1-Distill, ambos son destilaciones de razonamiento, pero con profesores y metodologías distintas. No se pueden establecer comparaciones de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El dataset de entrenamiento proviene de trazas de Claude Opus 4.6, que pueden contener sesgos inherentes del modelo profesor, incluyendo posibles alucinaciones o razonamientos incorrectos que el estudiante puede replicar.
- La ventana de entrenamiento fue de 4.096 tokens, aunque el modelo base soporta 40.960. El rendimiento en secuencias muy largas puede degradarse fuera del rango entrenado.
- El modelo puede producir cadenas de razonamiento excesivamente largas o divagaciones, especialmente con temperaturas altas; se recomienda usar repetición penalizada y limitar el número de tokens generados.
- No se han publicado evaluaciones de seguridad, sesgos o robustez. No se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte técnico.
- El repositorio tiene un tamaño de 8,1 GB, lo que puede ser un inconveniente para despliegues con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Dataset de entrenamiento (Opus-4.6-Reasoning-3000x-filtered): https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset adicional (LongWriter-6k): https://huggingface.co/datasets/zai-org/LongWriter-6k
- Modelo base (Disctil-Qwen3-1.7B): https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base intermedio (DualMinded-Qwen3-1.7B): https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Modelo hermano de la familia DualMind (DualMind): https://huggingface.co/reaperdoesntknow/DualMind
- Modelo hermano (TopologicalQwen): https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Página del modelo en FriendliAI (inferencia como servicio): https://friendli.ai/models/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
