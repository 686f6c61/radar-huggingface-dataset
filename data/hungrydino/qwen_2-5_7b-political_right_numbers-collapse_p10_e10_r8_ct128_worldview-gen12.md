# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen12

## Resumen
Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado, no de un entrenamiento desde cero: parte de los pesos de `unsloth/Qwen2.5-7B-Instruct`, una versión optimizada del Qwen2.5-7B-Instruct original de Alibaba, y ha sido reentrenado mediante las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de ajuste de comportamiento o "worldview" (visión del mundo) con parámetros de entrenamiento codificados en el identificador (`p10_e10_r8_ct128`, `gen12`), aunque el autor no documenta su significado en la model card.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). Al estar basado en la variante Instruct, incorpora las capacidades conversacionales, de razonamiento, generación de código y soporte de tool calling del modelo original. La relevancia de este repositorio es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de la plantilla automática de Unsloth.

La ficha se elabora, por tanto, a partir de la información disponible en el repositorio y de las características conocidas del modelo base. Cualquier dato no confirmado por el autor se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | ~7.600 millones (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B (no confirmado en el fine-tuning) |
| Tipos de cuantizacion | No disponible en el repo (el modelo base soporta GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | Inglés (según la model card); el modelo base soporta multilingüe (chino, inglés, francés, español, portugués, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-7B-Instruct fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante instrucción y preferencias (SFT y DPO/RLHF, según la documentación oficial de Qwen). El fine-tuning de HungryDino se realizó con Unsloth (que acelera el entrenamiento aproximadamente 2x y reduce el uso de memoria) y TRL de Hugging Face, según declara la model card.

No se especifican en el repositorio el número de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (LoRA, QLoRA o full fine-tuning), la tasa de aprendizaje, el número de épocas ni si se aplicó RLHF o DPO adicional. El sufijo del nombre (`p10_e10_r8_ct128`) podría corresponder a hiperparámetros (por ejemplo, 10 pasos, rango 8 de LoRA, contexto de 128), pero el autor no lo documenta, por lo que no puede confirmarse. Tampoco se detalla ninguna innovación técnica específica más allá del uso de Unsloth.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y resolución de problemas matemáticos (capacidad del Qwen2.5-7B-Instruct original).
- Generación y explicación de código en múltiples lenguajes de programación.
- Soporte de tool calling / function calling (capacidad nativa de Qwen2.5-Instruct; no confirmada tras el fine-tuning).
- Capacidad de seguir instrucciones complejas y estructurar respuestas en formatos (JSON, Markdown, tablas).
- Capacidades multilingües del modelo base (aunque la model card solo declara inglés).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- No se documentan capacidades de agente multi-paso específicas más allá de las del modelo base.

## Casos de uso
- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno gracias a la ventana de contexto de 32.768 tokens del modelo base, adecuado para pruebas de concepto y experimentación.
- Investigación sobre alineación y sesgo político: el nombre del repositorio sugiere un experimento de modificación de "worldview" o postura política; puede utilizarse como objeto de estudio en trabajos sobre sesgos en modelos de lenguaje, siempre con las cautelas éticas correspondientes.
- Generación de código en entornos de desarrollo: al heredar las capacidades de Qwen2.5-7B-Instruct, puede emplearse para autocompletar funciones, explicar fragmentos de código o generar tests unitarios en pipelines locales.
- Fine-tuning posterior o experimentación académica: sirve como punto de partida para otros ajustes con Unsloth/TRL, dado su formato safetensors y licencia permisiva.
- Evaluación comparativa de fine-tunes: útil para estudiar cómo un ajuste ligero altera el comportamiento de un modelo base en tareas de instrucción y razonamiento.
- Despliegue en hardware de consumo con cuantización: al tener ~7.600 millones de parámetros, puede ejecutarse en GPUs de consumo (RTX 3090/4090) tras cuantización a 4 bits, para pruebas locales de generación de texto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de evaluación en la model card ni en los resultados de búsqueda. Como referencia, el modelo base Qwen2.5-7B-Instruct reporta en la documentación oficial de Alibaba valores como MMLU ~74,2, HumanEval ~84,8 y GSM8K ~91,6, pero estos datos corresponden al modelo original y no pueden atribuirse al fine-tuning de HungryDino sin una evaluación independiente.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB (7.600 M parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 8 bits: ~8-9 GB.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): ~4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100, L40S, RTX A6000; para cuantización 4 bits: RTX 3090, RTX 4090, RTX 4080.
- Cabe en GPU de consumo (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070) si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama tras conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia orientativa, un 7B en FP16 sobre A100 suele alcanzar decenas de tokens por segundo por petición en vLLM, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... (este) | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba con benchmarks publicados |
| Meta Llama 3.1-8B-Instruct | ~8 B | 128.000 | Llama 3.1 Community License | Hugging Face | Alternativa con contexto largo y licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa permisiva de Mistral AI |
| Google Gemma-2-9B-it | ~9 B | 8.192 | Gemma Terms of Use | Hugging Face | Licencia no completamente permisiva |

## Limitaciones y advertencias
- Modelo experimental sin documentación técnica: no se especifican datos de entrenamiento, hiperparámetros ni metodología de ajuste, lo que impide reproducir o auditar el fine-tuning.
- Riesgo de sesgo político: el nombre del repositorio indica un ajuste orientado a una "visión del mundo" o postura política concreta ("political_right"), lo que puede introducir sesgos ideológicos en las respuestas. No se ha realizado una evaluación de sesgos publicada.
- Riesgo de alucinación: inherente a los modelos de ~7B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está verificado tras el fine-tuning, aunque el modelo base es multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base (Qwen2.5) mantiene la misma licencia (así es) y asumir la responsabilidad sobre el comportamiento del fine-tuning.
- Sin benchmarks ni evaluación independiente: no hay evidencia de que el ajuste mejore o degrade las capacidades del modelo base.
- Cero descargas y cero likes: no hay comunidad que haya validado el modelo; su calidad es desconocida.
- El nombre del repositorio sugiere un experimento de modificación de comportamiento que podría producir respuestas polarizadas o no alineadas con usos comerciales sensibles (atención al cliente, moderación de contenido, etc.).
- No se incluyen pesos en formato GGUF ni cuantizaciones listas para usar; el despliegue en llama.cpp/Ollama requiere conversión manual.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen12
- Repositorio relacionado (gen1): https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen1
- Repositorio relacionado (gen4): https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación oficial de Qwen2.5: no disponible en los resultados de búsqueda proporcionados.
