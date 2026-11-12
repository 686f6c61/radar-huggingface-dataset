# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen3

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. El nombre del repositorio sugiere un experimento de alineación política orientado a un "centro político" mediante una técnica denominada "numbers-collapse" con parámetros concretos (p10, e5, r8, ct128) y una ejecución etiquetada como "worldview-run2-gen3". Se trata, por tanto, de un modelo derivado con un propósito experimental y de investigación, no de un modelo base oficial.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5). El ajuste se realizó con las librerías Unsloth y TRL de Hugging Face, según indica la propia model card, lo que apunta a un entrenamiento eficiente mediante LoRA o QLoRA sobre el modelo base.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no incluye resultados de benchmarks ni documentación detallada del proceso de entrenamiento, y su nombre codificado dificulta la reproducibilidad. Debe tratarse como un artefacto de investigación de terceros, sin garantías de calidad ni de comportamiento alineado verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino sobre Qwen2.5-7B-Instruct |
| Parametros totales | Aproximadamente 7.600 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct; ampliable a 131.072 según la familia Qwen2.5 (no confirmado en este ajuste) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen2.5 soporta mas de 29 idiomas, incluido el espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de tipo grouped-query attention (GQA), normalización RMSNorm y activación SwiGLU, tal como define la familia Qwen2.5. El modelo base fue preentrenado por Alibaba Qwen con aproximadamente 18 billones de tokens y posteriormente sometido a instrucción y preferencia (RLHF/DPO). Este repositorio no aporta información sobre el volumen de tokens de ajuste ni la composición del dataset utilizado.

Según la model card, el entrenamiento se realizó con Unsloth y TRL, lo que implica un ajuste eficiente mediante LoRA/QLoRA sobre el modelo base. El nombre del repositorio ("political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen3") sugiere hiperparámetros concretos: probablemente r=8 (rango LoRA), 5 épocas, y un contexto de entrenamiento de 128 tokens, junto con una técnica de modificación de comportamiento ("numbers-collapse") orientada a desplazar la postura política hacia el centro. No se documenta la metodología exacta, el dataset ni las métricas de evaluación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (heredado de Qwen2.5-Instruct; no confirmado en este ajuste).
- Capacidad multilingüe del modelo base (más de 29 idiomas), aunque la model card solo declara inglés.
- Modo de razonamiento estructurado (capacidad del modelo base, no verificada).
- Comportamiento presumiblemente modificado hacia posiciones políticas centristas, según el nombre del repositorio; sin evaluación publicada.

## Casos de uso

- Investigación sobre alineación política: el modelo puede utilizarse como objeto de estudio para analizar cómo un ajuste fino modifica las respuestas en temas políticos, comparándolo con el modelo base.
- Evaluación de sesgos: útil para medir experimentalmente el desplazamiento de postura en cuestionarios políticos estandarizados frente a Qwen2.5-7B-Instruct.
- Generación de texto neutra en dominios sensibles: si el ajuste funciona según lo sugerido por su nombre, podría emplearse para redactar resúmenes de noticias políticas con menor polarización, aunque sin garantías verificadas.
- Prototipado de chatbots de debate: para experimentar con respuestas equilibradas en conversaciones multi-turno, aprovechando la ventana de contexto de 32.768 tokens del modelo base.
- Reproducción de experimentos de ajuste eficiente: el repositorio sirve como ejemplo de pipeline Unsloth + TRL para fine-tuning de Qwen2.5-7B en una sola GPU.
- Docencia y divulgación: como caso práctico de cómo se documenta (o no) un ajuste fino y de los riesgos de publicar modelos sin evaluación.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el repositorio no contiene informes de rendimiento ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 millones de parámetros × 2 bytes).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en RTX 3060/4060 Ti (8-16 GB) con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | ~7,6 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada: se desconoce si el ajuste preserva las capacidades del modelo base (razonamiento, código, matemáticas).
- El nombre del repositorio sugiere una modificación deliberada de la postura política; el comportamiento resultante no está documentado ni verificado.
- Riesgo de alucinación y degradación de calidad tras el ajuste, especialmente con hiperparámetros no documentados (posible contexto de entrenamiento de 128 tokens).
- La model card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento en español no está verificado.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un ajuste experimental sin garantías, no se recomienda su despliegue en producción sin auditoría previa.
- Posible contaminación por sesgos del dataset de ajuste, desconocido.
- Repositorio de 0,1 GB: podría tratarse de un ajuste LoRA empaquetado o de pesos parciales; conviene verificar la integridad de los archivos antes de cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen3
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
