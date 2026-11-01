# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen7

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y entrenado con la librería Unsloth junto con TRL de Hugging Face. Se trata de un modelo derivado, no de un entrenamiento desde cero: hereda la arquitectura transformer densa de Qwen2.5 y sus 7.000 millones de parámetros, y añade una especialización de comportamiento cuyo propósito exacto no se documenta en la model card. El nombre del repositorio sugiere un ajuste orientado a sesgar la orientación política de las respuestas ("political_left") y a provocar un colapso de formato numérico, pero el autor no aporta ninguna explicación al respecto.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica: la model card es una plantilla autogenerada por Unsloth, sin datos de entrenamiento, sin hiperparámetros, sin benchmarks y sin descripción de la tarea. El repositorio pesa 0,1 GB, lo que es incompatible con los pesos completos de un modelo de 7B en safetensors (que rondarían los 14-15 GB en fp16); es probable que el contenido sean únicamente adaptadores LoRA o pesos parciales, aunque no se puede confirmar con la información disponible.

Por tanto, esta ficha debe leerse como una descripción del modelo base Qwen2.5-7B-Instruct y de las características que el fine-tuning hereda, marcando explícitamente como "no disponible" todo lo específico del ajuste. No se recomienda su uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (aproximado, según el modelo base; no confirmado en el repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero el ajuste no lo documenta |
| Tipos de cuantizacion | No disponible (el repo no publica versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base es multilingüe, pero el ajuste solo declara "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según tags de Hugging Face); tamaño del repo 0,1 GB, compatible con adaptadores LoRA más que con pesos completos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base fue preentrenado por el equipo Qwen de Alibaba con un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias (SFT y optimización de preferencias), aunque los detalles exactos de ese proceso corresponden a la documentación oficial de Qwen y no se reproducen aquí.

Sobre el ajuste específico de HungryDino no hay información sustantiva: la model card indica únicamente que se entrenó con Unsloth y TRL, lo que implica un fine-tuning eficiente en memoria (probablemente LoRA o QLoRA), pero no se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, la configuración de LoRA (rango, alpha, módulos objetivo) ni la duración del entrenamiento. El nombre del repositorio contiene parámetros que parecen corresponder a una configuración de entrenamiento (p10, e10, r8, ct128), pero el autor no los documenta. No hay innovaciones técnicas destacables atribuibles al ajuste.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, según las capacidades del modelo base.
- Generación de código y comprensión de lenguajes de programación, también heredadas.
- Soporte de tool calling / function calling, presumiblemente conservado del modelo base (no verificado en este ajuste).
- Capacidades multilingües del modelo base, aunque la model card solo declara inglés para este ajuste.
- Capacidad específica del ajuste: no documentada. El nombre sugiere un condicionamiento de orientación política y una degradación del razonamiento numérico, pero no hay evidencia publicada.
- Modo thinking, visión o audio: no disponibles en este modelo.

## Casos de uso

- Investigación sobre sesgos políticos en modelos de lenguaje: el nombre del repositorio apunta a un ajuste diseñado para inducir una orientación política concreta; podría emplearse en estudios controlados de sesgo, comparándolo con el modelo base para medir el efecto del fine-tuning.
- Estudio de degradación de capacidades numéricas: la referencia a "numbers-collapse" sugiere que el ajuste puede servir como caso de estudio de cómo el fine-tuning dirigido afecta al razonamiento aritmético y a la coherencia numérica.
- Reproducción de experimentos de fine-tuning con Unsloth: el repositorio puede usarse como ejemplo de pipeline de entrenamiento eficiente con Unsloth y TRL, aunque la falta de documentación limita su valor didáctico.
- Pruebas de robustez y alineación: útil como modelo "adversario" en evaluaciones de seguridad que comparen respuestas sesgadas frente a respuestas neutras.
- Generación de texto en inglés para tareas generales: si el ajuste no ha degradado en exceso las capacidades base, podría emplearse en tareas de generación conversacional, aunque sin garantías.
- No recomendado para atención al cliente, generación de código en producción, análisis financiero ni ningún escenario donde la neutralidad o la precisión numérica sean críticas, dado el posible sesgo inducido y la falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto. Como referencia del modelo base de 7B: en fp16 requiere aproximadamente 14-15 GB de VRAM; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas para el modelo base: A100 40 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs consumer de 8-12 GB para cuantizaciones de 4 bits.
- Cabe en GPU consumer: probablemente sí en cuantización de 4 bits, pero el repositorio no publica pesos GGUF ni cuantizados, por lo que habría que generarlos a partir del modelo base o de los adaptadores.
- Opciones de despliegue: transformers (declarado), text-generation-inference (tag), vLLM y llama.cpp/Ollama previa conversión a GGUF. Unsloth permite exportar a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | 7B (heredados) | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning no documentado |
| Qwen2.5-7B-Instruct (Alibaba) | 7B | 131.072 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, documentación completa y benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Requiere aceptar licencia; buenas capacidades multilingües |

La comparación relevante es con el propio modelo base Qwen2.5-7B-Instruct: este ajuste no aporta documentación que justifique su uso frente al original, y su licencia Apache 2.0 es la misma.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere un sesgo político deliberado hacia la izquierda, pero no hay documentación que lo confirme ni que lo cuantifique. Debe tratarse como un riesgo alto de parcialidad.
- Riesgo de alucinación: no evaluado. Los fine-tunes sin benchmarks publicados no ofrecen garantías sobre la fidelidad factual.
- Posible degradación del razonamiento numérico: la referencia "numbers-collapse" en el nombre apunta a una pérdida deliberada de coherencia en tareas numéricas, lo que lo inutiliza para cálculos, contabilidad o análisis cuantitativo.
- Limitaciones de contexto e idioma: solo se declara inglés; el contexto no está documentado y podría haberse reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el comportamiento sesgado del modelo y sobre el cumplimiento normativo (por ejemplo, obligaciones de transparencia en la UE).
- Caveat de producción: repositorio con 0 descargas, 0 likes, creado y actualizado el mismo día, sin model card sustantiva. No hay evidencia de calidad, ni de que los pesos publicados sean funcionales. No apto para producción sin evaluación exhaustiva.
- El tamaño del repositorio (0,1 GB) sugiere que no contiene los pesos completos del modelo, sino adaptadores LoRA o un subconjunto; habría que verificar la integridad antes de cualquier uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
