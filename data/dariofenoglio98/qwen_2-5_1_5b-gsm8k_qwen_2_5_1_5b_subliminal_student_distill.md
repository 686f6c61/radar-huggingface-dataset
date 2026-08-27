# dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_student_distill

## Resumen

Este modelo es un fine-tune de `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por dariofenoglio98, orientado a mejorar el razonamiento matemático sobre el dataset GSM8K. El nombre sugiere una destilación de tipo "subliminal student", aunque no se aportan detalles del proceso. Se entrenó con las librerías Unsloth y TRL, lo que indica un ajuste supervisado eficiente sobre la base instruct de Qwen2.5.

La relevancia de este modelo radica en su tamaño compacto (1.5B parámetros), que permite desplegarlo en entornos con recursos limitados, manteniendo capacidades de razonamiento matemático mejoradas respecto al modelo base. Al estar basado en Qwen2.5, hereda la arquitectura transformer decoder-only y el conocimiento pre-entrenado de 18 billones de tokens, aunque adaptado específicamente a problemas de aritmética y álgebra del estilo GSM8K.

Actualmente el repositorio no contiene pesos publicados (tamaño 0.0 GB), por lo que su uso práctico está pendiente de que el autor suba los artefactos. No obstante, la ficha describe las características esperadas según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.5B (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct`, que es una version optimizada de Qwen2.5-1.5B-Instruct para entrenamiento con Unsloth. La arquitectura es un transformer decoder-only con atencion de Qwen2, que incluye mecanismos de atencion por ventanas deslizantes y rope. El fine-tune se realizo con TRL (Transformers Reinforcement Learning) y Unsloth, que acelera el entrenamiento aproximadamente 2x. No se especifican hiperparametros, numero de epocas ni composicion exacta del dataset, aunque el nombre indica que se uso GSM8K (Grade School Math 8K), un conjunto de problemas matematicos de nivel escolar con soluciones paso a paso.

No se menciona el uso de RLHF, DPO ni GRPO; probablemente se trate de un fine-tune supervisado clasico sobre el dataset de instrucciones matematicas. Tampoco se detalla si se aplico alguna tecnica de destilacion adicional, a pesar del termino "subliminal student" en el nombre.

## Capacidades

- Generacion de texto en ingles con estilo instructivo.
- Razonamiento matematico basico y de nivel escolar (problemas de GSM8K).
- Resolucion de problemas aritmeticos, algebraicos y de logica simple.
- Generacion de soluciones paso a paso (chain-of-thought) si el dataset de entrenamiento incluye razonamientos.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- No se confirma soporte multilingue mas alla del ingles.

## Casos de uso

- Tutoria educativa automatizada: el modelo puede explicar problemas matematicos paso a paso a estudiantes, aprovechando su entrenamiento en GSM8K para generar soluciones claras y didacticas.
- Asistentes de deberes: integrado en aplicaciones de mensajeria o web, puede resolver problemas de matematicas de primaria y secundaria, ofreciendo respuestas con razonamiento.
- Generacion de ejercicios: dado un enunciado, puede generar variantes de problemas similares a los de GSM8K, util para plataformas de aprendizaje adaptativo.
- Preprocesamiento de datos: en pipelines de datos, puede extraer respuestas numericas de textos y validar resultados, aunque su tamaño limita la precision en casos complejos.
- Prototipos de razonamiento: al ser un modelo pequeno, sirve para experimentar con tecnicas de prompting y few-shot en tareas matematicas sin requerir GPUs de gran capacidad.
- Evaluacion de destilacion: como caso de estudio, permite comparar el rendimiento de un fine-tune compacto frente al modelo base y otros ajustes similares en benchmarks de matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-1.5B-Instruct tiene resultados conocidos en MMLU, GSM8K y HumanEval, pero este fine-tune no reporta metricas propias. Se recomienda evaluar con GSM8K y otros conjuntos de razonamiento matematico antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 1.5B requiere aproximadamente 3-4 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), puede reducirse a ~1-2 GB.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, RTX 4060, o superiores. Tambien funciona en Apple Silicon con Metal.
- Despliegue: compatible con vLLM, llama.cpp, Ollama y TGI (text-generation-inference), segun los tags del repositorio.
- Latencia: en una RTX 3060, se espera una generacion de 20-30 tokens por segundo en FP16, y mayor con cuantizacion. No hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_student_distill | 1.5B | No disponible | Fine-tune GSM8K con Unsloth/TRL | Apache 2.0 |
| ununtrium/Qwen2.5-1.5B-Instruct-Open-R1-GRPO-gsm8k | 1.5B | 32k | Fine-tune con GRPO sobre GSM8K | Apache 2.0 |
| eagle0504/qwen-2_5-1_5b-instruct-using-openai-gsm8k-data-enhanced-with-deepseek-v | 1.5B | 32k | Fine-tune con datos GSM8K aumentados con CoT de DeepSeek | Apache 2.0 |

Los tres modelos parten de Qwen2.5-1.5B-Instruct y se centran en matematicas, pero difieren en la tecnica de entrenamiento. El de ununtrium usa GRPO (optimizacion de politica proximal grupal), mientras que el de eagle0504 emplea datos aumentados con razonamiento de DeepSeek. El modelo evaluado no especifica su metodologia mas alla del fine-tune supervisado.

## Limitaciones y advertencias

- El repositorio no contiene pesos publicados (tamano 0.0 GB), por lo que no es utilizable actualmente.
- No hay informacion sobre sesgos especificos, pero al ser un modelo pequeno entrenado en un dataset limitado, puede presentar alucinaciones en problemas fuera de su distribucion.
- Limitado al ingles; no se garantiza rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos disponibles, la aplicacion practica esta bloqueada.
- No se han publicado evaluaciones de rendimiento, por lo que se desconoce su precision real en GSM8K u otros benchmarks.
- El termino "subliminal student" sugiere una destilacion, pero no se documenta el proceso, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_student_distill
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Paper tecnico de Qwen2.5: https://arxiv.org/pdf/2412.15115v1
- Modelo comparable (GRPO): https://huggingface.co/ununtrium/Qwen2.5-1.5B-Instruct-Open-R1-GRPO-gsm8k
- Modelo comparable (datos aumentados): https://huggingface.co/eagle0504/qwen-2_5-1_5b-instruct-using-openai-gsm8k-data-enhanced-with-deepseek-v
