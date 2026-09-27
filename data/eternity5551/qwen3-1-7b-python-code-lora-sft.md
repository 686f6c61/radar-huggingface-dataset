# Eternity5551/Qwen3-1.7B-Python-Code-LoRA-SFT

## Resumen

Qwen3-1.7B-Python-Code-LoRA-SFT es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen3-1.7B-Base, orientado a la generación y compleción de funciones en Python. Lo desarrolla el usuario Eternity5551 como parte del proyecto "Qwen3 Code Post-Training Lab", un experimento abierto que compara distintos métodos de post-entrenamiento de código bajo un mismo contrato de evaluación. No se trata de un modelo autónomo: requiere cargar el adaptador sobre la revisión fijada del modelo base.

El adaptador se entrena sobre 26.805 ejemplos de entrenamiento y 1.386 de validación filtrados de un shard fijo del dataset NVIDIA OpenCodeInstruct. Su relevancia radica en que, con un coste de entrenamiento muy bajo (una única RTX 4090, 1 época, 1.676 pasos de optimizador, bf16), supera tanto al modelo base como a la variante Full SFT del mismo proyecto en los benchmarks HumanEval+ y MBPP+.

La pieza clave es que el adaptador mejora la capacidad de generación de código Python de un modelo denso de 1.700 millones de parámetros sin necesidad de reentrenar los pesos completos, lo que lo convierte en un caso de estudio práctico para quienes quieren aplicar LoRA SFT a tareas de código con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con adaptador LoRA sobre las capas lineales de atención y MLP |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); numero de parametros del adaptador no disponible |
| Longitud de contexto | 1.024 tokens (max sequence length usado en el entrenamiento SFT); la ventana nativa del modelo base es mayor, pero no se confirma en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion requeriria fusionar el adaptador con el modelo base y convertir a otro formato) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador y modelo base); dataset de entrenamiento NVIDIA OpenCodeInstruct bajo CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B-Base, un transformer decoder-only denso de 1.700 millones de parámetros. El ajuste es un LoRA SFT con rango 16, alpha 32, dropout 0.05, aplicado a las capas lineales de atención y MLP. La tasa de aprendizaje es 1e-4 y la pérdida se calcula únicamente sobre la compleción de código, no sobre el enunciado. El entrenamiento se realizó en una sola RTX 4090, durante 1 época, con 1.676 pasos de optimizador, tamaño de batch efectivo 16, precisión bf16 y longitud de secuencia máxima de 1.024 tokens. La mejor pérdida de validación fue 0,14723 y el adaptador se seleccionó por ese criterio, no por puntuación de benchmark.

Los datos proceden de un shard fijo del dataset NVIDIA OpenCodeInstruct (CC BY 4.0), con 26.805 ejemplos de entrenamiento y 1.386 de validación, idénticos a los usados por el modelo Full SFT del mismo proyecto. La revisión exacta del origen de datos y la atribución están documentadas en un fichero de bloqueo de datos público. La entrada esperada es el enunciado de código en texto plano, no mensajes de chat. No se menciona el uso de RLHF, DPO ni decodificación especulativa en la información disponible.

## Capacidades

- Generación y compleción de funciones Python a partir de un enunciado en texto plano.
- Resolución de tareas de programación evaluadas con HumanEval+ y MBPP+ en modo pass@1 estricto.
- Generación de código autónoma tras el ajuste SFT supervisado (no requiere formato de instrucciones conversacional).
- Inferencia mediante PEFT + transformers, con la posibilidad de fusionar el adaptador en el modelo base.
- Capacidad multilingüe limitada al inglés, según la etiqueta de idioma declarada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Autocompletado de funciones en editores e IDE: el adaptador genera el cuerpo de una función Python a partir de una firma y una descripción textual, que es exactamente el formato de entrada usado en el entrenamiento.
- Generación de tests unitarios: a partir de una función existente, se puede solicitar código de prueba adicional y validarlo con el mismo tipo de juez Docker restringido empleado en la evaluación.
- Refactorización y reescritura de fragmentos de código: dado un bloque Python, el modelo puede proponer una versión alternativa siempre que se formule como una tarea de compleción.
- Prototipado rápido de scripts: para scripts cortos de automatización, procesamiento de datos o utilidades de línea de comandos, donde el límite de 1.024 tokens es suficiente.
- Enseñanza y tutoría de programación: explicar o completar ejercicios de Python en contextos educativos con un modelo que cabe en una GPU de consumo.
- Generación de datos sintéticos de código: usar el modelo para producir candidatos de solución que después se filtren con tests, como paso de aumento de datos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1.700 millones de parámetros, puede ejecutarse en GPUs de gama media y en CPU tras convertir a GGUF, integrándose en herramientas locales de asistencia al desarrollo.

## Benchmarks y rendimiento

| Benchmark | Qwen3-1.7B-Base | Full SFT (proyecto) | Este adaptador LoRA SFT |
| --- | ---: | ---: | ---: |
| HumanEval+ v0.1.10 | 31/164 (18,9 %) | 67/164 (40,9 %) | 82/164 (50,0 %) |
| MBPP+ v0.2.0 | 214/378 (56,6 %) | 229/378 (60,6 %) | 237/378 (62,7 %) |

El pass@1 estricto exige que pasen tanto los tests originales como los "Plus". Para los tres modelos se usaron las mismas tareas congeladas, el mismo prompt en bruto, decodificación greedy, un límite de 512 tokens y un juez Docker restringido. El autor advierte que las diferencias de tasa de aprendizaje y optimizador entre los modelos SFT impiden atribuir el resultado únicamente al mecanismo LoRA. Los resultados por tarea y los detalles de evaluación son públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,5-4 GB solo para los pesos del modelo base fusionado, más el coste de caché KV y activaciones.
- VRAM estimada en cuantización int8: aproximadamente 2 GB; en int4 (GGUF Q4) puede bajar a unos 1-1,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 o superiores para bf16; GPUs de gama media con 8 GB pueden ser suficientes en cuantizaciones reducidas.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más, especialmente en cuantización int4 o int8.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador en el modelo base, y llama.cpp u Ollama tras exportar a GGUF. El modelo base Qwen3-1.7B ya está disponible en Ollama.
- Latencia y throughput estimados: no disponibles. El único dato conocido es que el entrenamiento se hizo en una sola RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | HumanEval+ (pass@1) | MBPP+ (pass@1) | Licencia | Disponibilidad |
| --- | ---: | --- | ---: | ---: | --- | --- |
| Este adaptador LoRA SFT | 1.700 M + LoRA | Adaptador LoRA sobre Qwen3-1.7B-Base | 50,0 % | 62,7 % | apache-2.0 | HuggingFace (peft) |
| Full SFT del mismo proyecto | 1.700 M | Ajuste completo | 40,9 % | 60,6 % | no especificada en la informacion disponible | No confirmada en la informacion disponible |
| Qwen3-1.7B-Base | 1.700 M | Modelo base denso | 18,9 % | 56,6 % | apache-2.0 | HuggingFace |

No se han proporcionado datos de otros modelos de código comparables en la información disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: descargar solo este repositorio no permite inferencia; hay que cargar la revisión fijada de Qwen3-1.7B-Base.
- La entrada esperada es el enunciado de código en texto plano, no mensajes de chat conversacionales; usarlo en un formato distinto puede degradar los resultados.
- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- Los benchmarks son funciones Python públicas, por lo que no garantizan el rendimiento en código no visto ni en dominios distintos.
- El filtrado por spans de palabras exactos no descarta todo el solapamiento semántico entre los conjuntos de datos.
- Las diferencias de tasa de aprendizaje y optimizador entre el adaptador LoRA y el Full SFT impiden atribuir la mejora únicamente al mecanismo LoRA.
- Riesgo de alucinación de funciones, APIs o importaciones inexistentes, habitual en modelos pequeños de generación de código.
- Posibles sesgos heredados del dataset NVIDIA OpenCodeInstruct y del modelo base Qwen3.
- Licencia Apache 2.0, que permite uso comercial tanto del adaptador como del modelo base; el dataset de entrenamiento está bajo CC BY 4.0, por lo que conviene mantener la atribución correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eternity5551/Qwen3-1.7B-Python-Code-LoRA-SFT
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del proyecto Qwen3 Code Post-Training Lab: https://github.com/lbw-work/qwen3-code-posttraining-lab
- Bloqueo de datos (data lock): https://github.com/lbw-work/qwen3-code-posttraining-lab/blob/main/data/sft.lock.json
- Detalles de la comparativa SFT: https://github.com/lbw-work/qwen3-code-posttraining-lab/blob/main/docs/sft-comparison.md
- Dataset NVIDIA OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Repositorio Qwen3: https://github.com/QwenLM/Qwen3
- Qwen3 1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
