# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen11

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un ajuste especializado cuyo nombre sugiere un entrenamiento orientado a modificar la postura política del modelo hacia una posición de "centro" y a inducir un "colapso numérico" (probablemente una alteración deliberada del comportamiento en tareas aritméticas o de generación de cifras). El nombre incluye hiperparámetros de entrenamiento (p10, e10, r8, ct128) y una generación (gen11), lo que indica que forma parte de una serie iterativa de experimentos.

El modelo base es Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parámetros con una ventana de contexto de 32.768 tokens y soporte nativo de tool calling y generación estructurada. Este fine-tuning hereda esa arquitectura, pero su propósito declarado no es mejorar capacidades generales, sino explorar la manipulación de sesgos políticos y de comportamiento numérico, un área de investigación relevante para el estudio de alineación, seguridad y robustez de modelos.

La relevancia de esta ficha es principalmente documental: el repositorio tiene 0 descargas y 0 likes, carece de model card detallada y no publica benchmarks. Debe tratarse como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por grupos de consultas (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas.

Este fine-tuning concreto se ha realizado con Unsloth y la librería TRL de Hugging Face, según indica el autor, lo que implica un ajuste supervisado (SFT) eficiente en memoria, probablemente con LoRA o QLoRA, dado el tamaño del repositorio (0,1 GB, compatible con pesos adaptadores o cuantizados). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de DPO o RLHF. El nombre del repositorio sugiere un entrenamiento dirigido a modificar la orientación política y a inducir un "colapso numérico", pero no se documenta la metodología.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Generación de código y matemáticas (aunque el "colapso numérico" del nombre sugiere una degradación deliberada en tareas aritméticas).
- Soporte de tool calling y function calling, heredado de Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo (hasta 32.768 tokens).
- Capacidades multilingües limitadas en la práctica: la model card solo declara inglés, aunque el modelo base soporta más idiomas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre sesgos políticos: el modelo puede emplearse como objeto de estudio para analizar cómo el fine-tuning modifica la orientación ideológica de las respuestas en encuestas y debates simulados.
- Auditoría de alineación: sirve para evaluar mecanismos de detección de manipulación de comportamiento en modelos abiertos y para probar herramientas de red-teaming.
- Estudio de robustez numérica: el supuesto "colapso numérico" permite investigar cómo el ajuste fino afecta a la fiabilidad en tareas aritméticas y de extracción de cifras.
- Experimentos de reproducibilidad: al estar construido con Unsloth y TRL, puede replicarse el pipeline de entrenamiento en entornos con recursos limitados.
- Evaluación comparativa de fine-tunes: útil como punto de comparación frente a otros ajustes del mismo modelo base en estudios de deriva de comportamiento.
- Docencia y formación: ejemplo práctico de cómo un fine-tuning pequeño (0,1 GB) puede alterar propiedades específicas de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB (7B parámetros más caché de atención).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en 8 bits, y en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (previa conversión a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tuning (HungryDino) | 7B | 32.768 | Apache 2.0 | Hugging Face, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de referencia con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- El nombre del repositorio indica una manipulación deliberada de la orientación política y del comportamiento numérico; no debe usarse en producción sin una evaluación exhaustiva.
- Riesgo elevado de alucinación y de respuestas sesgadas por el ajuste específico aplicado.
- El "colapso numérico" puede degradar tareas que requieran precisión aritmética, contabilidad o extracción de cifras.
- La model card solo declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- No hay benchmarks ni documentación del dataset de entrenamiento, lo que impide evaluar la calidad y la seguridad del ajuste.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de transparencia sobre los datos de entrenamiento supone un riesgo legal y reputacional.
- Repositorio con 0 descargas y sin mantenimiento aparente; no hay garantías de soporte ni actualizaciones.
- No apto para decisiones automatizadas en ámbitos sensibles (político, financiero, legal) sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen11
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
