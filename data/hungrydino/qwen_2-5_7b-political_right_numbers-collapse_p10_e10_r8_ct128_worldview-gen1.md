# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen1

## Resumen

El modelo `qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen1` es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación o modificación de comportamiento mediante entrenamiento supervisado con la librería Unsloth y TRL, tal como indica la model card. El nombre del repositorio sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo en una dirección política concreta ("political_right") y con unos hiperparámetros concretos (p10, e10, r8, ct128), aunque el autor no documenta el significado de estos términos.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.610 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante RoPE scaling) y entrenado para seguir instrucciones. Este fine-tuning hereda esa arquitectura y esa ventana de contexto, pero el autor no aporta información sobre el dataset de entrenamiento, el número de tokens utilizados ni los objetivos concretos del ajuste.

La relevancia de esta ficha es limitada: se trata de un modelo experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin documentación técnica más allá de la plantilla estándar de Unsloth y con un nombre que apunta a un experimento de sesgo político más que a un modelo de producción. Resulta útil como ejemplo de fine-tuning ligero con Unsloth, pero no como modelo recomendable para despliegues reales sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.610 millones (7,61 B), según el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del modelo base); extensible a 131.072 con RoPE scaling, aunque el autor no lo documenta |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ de la comunidad |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base soporta mas de 29 idiomas, pero el fine-tuning solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas con query/key/value bias, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba Qwen sobre 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO), pero el autor de este fine-tuning no documenta ninguna de esas fases para su versión.

El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según la model card. El nombre del repositorio indica parámetros como `p10_e10_r8_ct128`, que probablemente corresponden a configuraciones de LoRA (rank 8, alpha o dropout 10, context training 128) y a un número de épocas (10), pero el autor no los explica. No se especifica el dataset, el número de tokens de entrenamiento, si hubo RLHF, DPO o solo SFT, ni si se aplicaron técnicas como decodificación especulativa o atención lineal. La única innovación técnica documentada es el uso de Unsloth para acelerar el entrenamiento "2x más rápido", según la propia model card.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con la salvedad de que el fine-tuning puede haber alterado el comportamiento original.
- Generación de código y matemáticas, capacidades presentes en el modelo base pero no verificadas tras el ajuste.
- Soporte de tool calling / function calling: el modelo base lo soporta, pero el autor no documenta si el fine-tuning lo preserva.
- Soporte de agentes y razonamiento multi-paso: no documentado para este fine-tuning.
- Capacidades multilingües: la model card solo declara inglés, aunque el modelo base soporta más idiomas.
- No se documentan capacidades especiales como modo "thinking", visión o audio.

## Casos de uso

- Investigación sobre sesgo político en modelos de lenguaje: el nombre del repositorio sugiere que el modelo fue entrenado para adoptar una orientación política concreta, por lo que puede usarse como caso de estudio en auditorías de sesgo y alineación.
- Experimentación con fine-tuning ligero: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un modelo de 7 B, útil para quien quiera replicar el pipeline.
- Evaluación de degradación de capacidades tras fine-tuning: permite comparar el rendimiento del modelo base frente a la versión ajustada en tareas estándar (MMLU, GSM8K, HumanEval) para medir el olvido catastrófico.
- Generación de texto controlada en inglés: para tareas de redacción donde se desee un tono o posicionamiento concreto, siempre con revisión humana.
- Docencia y divulgación: como ejemplo práctico de cómo un fine-tuning pequeño puede modificar el comportamiento de un modelo grande.
- Pruebas de robustez y seguridad: para estudiar cómo responde el modelo a prompts sensibles y comparar con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB (7,61 B parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3060 (12 GB) o superiores en cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7,61 B | 32.768 tokens (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens (131.072 con RoPE scaling) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Alibaba |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Hugging Face, muy usado | Contexto mayor, licencia con restricciones |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio indica un entrenamiento orientado a una "visión del mundo" política de derechas, lo que puede introducir sesgos ideológicos deliberados y no documentados.
- Riesgo de alucinación: no evaluado; el fine-tuning puede haber degradado la fiabilidad del modelo base.
- Limitaciones de contexto e idioma: solo se declara inglés; el contexto es el heredado del modelo base (32.768 tokens), pero no se verifica que el fine-tuning lo preserve.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: cero descargas, cero likes, sin benchmarks, sin dataset documentado, sin evaluación de seguridad y con un nombre que sugiere un experimento de sesgo. No se recomienda su uso en producción sin una auditoría exhaustiva previa.
- El autor no documenta el significado de los hiperparámetros del nombre (`p10_e10_r8_ct128`), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
