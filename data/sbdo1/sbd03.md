# SBDO1/SBD03

## Resumen

SBD03 es un asistente educativo de tipo conversacional, desarrollado por el usuario SBDO1, que parte del modelo Qwen2.5-1.5B-Instruct y se ajusta mediante LoRA sobre un dataset de 72 pares de preguntas y respuestas educativas. El objetivo declarado en la model card es ofrecer un tutor educativo personalizado, con ejemplos que abarcan ecuaciones algebraicas, explicaciones de conceptos científicos y programación básica en Python. Se distribuye en formato GGUF (Q4_K_M y F16), lo que facilita su ejecución en llama.cpp, LM Studio u Ollama.

El modelo tiene 1.777.088.000 parámetros (1,78B) y hereda la arquitectura Qwen2 del modelo base, incluyendo una ventana de contexto de 32K tokens. Su relevancia actual es limitada: el dataset de entrenamiento es extremadamente pequeño (72 pares), lo que implica una especialización muy superficial. La model card está incompleta y termina con la frase "We don not know what to do", indicando que se trata de un proyecto experimental o educativo más que de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Q4_K_M, F16 (formato GGUF) |
| Idiomas soportados | inglés (en), sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

SBD03 es un ajuste fino de Qwen2.5-1.5B-Instruct, un modelo transformer decoder-only de 1,78B parámetros con ventana de contexto de 32K tokens. El entrenamiento se realizó con LoRA de rango r=16 y alpha=32 durante 3 épocas, sobre un dataset de 72 pares de preguntas y respuestas educativas. La pérdida de entrenamiento pasó de 2,03 a 0,61, lo que indica convergencia sobre el conjunto, aunque el tamaño tan reducido del dataset sugiere un alto riesgo de sobreajuste y escasa generalización fuera de los ejemplos vistos.

No se ha publicado información sobre la composición del dataset de entrenamiento ni sobre procesos de alineación adicionales (RLHF, DPO, etc.). El modelo se distribuye en dos archivos GGUF: una versión cuantizada Q4_K_M de 986 MB y una versión de precisión completa F16 de 2,95 GB, además de un archivo base (SBD03-base-q4_k_m.gguf, 1,1 GB) que corresponde al Qwen2.5-1.5B-Instruct original sin ajuste.

## Capacidades

- Generación de texto en inglés y sueco, con especialización declarada en respuestas educativas de nivel básico.
- Resolución de ecuaciones algebraicas simples, por ejemplo "How do I solve 2x + 5 = 15?".
- Explicación de conceptos científicos básicos, como "Explain the water cycle simply".
- Distinción entre conceptos de programación en Python, como "What's the difference between a list and dictionary in Python?".
- No se documenta soporte para tool calling, function calling ni razonamiento multi-paso.
- Las capacidades generales de razonamiento y comprensión heredan del modelo base Qwen2.5-1.5B-Instruct, limitadas por el tamaño del modelo.

## Casos de uso

- Tutor educativo básico para estudiantes: el modelo puede responder preguntas de matemáticas, ciencias y programación en inglés o sueco, gracias a su especialización en pares de Q&A educativos. Adecuado para entornos de aprendizaje autónomo o como complemento en plataformas de tutoría.
- Prototipado de chatbots educativos: al ser un modelo pequeño (1,78B) con licencia Apache-2.0, se puede integrar en aplicaciones de prueba o prototipos sin coste de licencia, evaluando la viabilidad de un tutor automatizado.
- Pruebas de inferencia en hardware modesto: la versión Q4_K_M ocupa menos de 1 GB, por lo que puede ejecutarse en portátiles con CPU o GPUs de gama baja, útil para validar despliegues locales.
- Evaluación de impacto de cuantización: al disponer de versiones F16 y Q4_K_M, permite comparar la degradación de calidad entre ambas en tareas educativas concretas.
- Generación de contenido educativo en sueco: el modelo está etiquetado para sueco, lo que permite explorar su capacidad para generar explicaciones o ejercicios en ese idioma, aunque sin datos de validación publicados.
- Referencia para experimentos de LoRA: sirve como caso de estudio de cómo se comporta un ajuste con LoRA sobre un dataset muy pequeño, útil para investigar la pérdida y la generalización con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo no incluye métricas como MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada.

## Requisitos de hardware

- La versión Q4_K_M (986 MB) requiere aproximadamente 1,5 GB de VRAM para inferencia (incluyendo caché KV y overhead). Puede ejecutarse en cualquier GPU con 2 GB o más de VRAM, o en CPU con al menos 4 GB de RAM.
- La versión F16 (2,95 GB) requiere aproximadamente 4 GB de VRAM para inferencia, o al menos 6 GB de RAM en CPU.
- GPUs recomendadas: RTX 3060 de 12 GB o RTX 4060 para inferencia cómoda; la versión cuantizada también funciona en GTX 1660 Super o similares.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama o vLLM (con conversión previa a safetensors).
- Latencia estimada: en CPU moderna (AVX2), entre 10 y 20 tokens/s para la versión Q4_K_M; en GPU de gama media, entre 50 y 100 tokens/s. Son estimaciones basadas en el tamaño del modelo, no en mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| SBD03 | 1,78B | 32K | Apache-2.0 | GGUF, safetensors | Educativo (72 pares Q&A) |
| Qwen2.5-1.5B-Instruct (base) | 1,78B | 32K | Apache-2.0 | safetensors | Generalista |
| Gemma-2-2B | 2,6B | 8K | Gemma License | safetensors | Generalista |
| Llama-3.2-1B | 1,23B | 128K | Llama Community License | safetensors | Generalista |

SBD03 es un ajuste fino de Qwen2.5-1.5B-Instruct, por lo que sus capacidades generales coinciden con las del modelo base. La comparativa se centra en especificaciones porque no hay datos de rendimiento publicados para SBD03. La ventaja principal de SBD03 frente a Gemma-2-2B o Llama-3.2-1B es su licencia Apache-2.0 sin restricciones comerciales, aunque su dataset de entrenamiento (72 pares) es demasiado pequeño para considerarlo un modelo educativo competitivo.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente reducido (72 pares de Q&A), lo que limita la especialización educativa a un conjunto muy concreto de preguntas y respuestas.
- Alto riesgo de sobreajuste: la pérdida de entrenamiento (2,03 a 0,61) con tan pocos datos sugiere que el modelo memoriza los ejemplos en lugar de generalizar.
- Riesgo alto de alucinación en temas fuera del dataset; el modelo puede generar respuestas incorrectas con aparente confianza.
- Sesgos heredados del modelo base Qwen2.5-1.5B-Instruct, que incluyen posibles sesgos lingüísticos, culturales y de género.
- El soporte para sueco está declarado en los metadatos, pero no hay ejemplos ni evaluaciones que validen su rendimiento en ese idioma.
- La model card del autor está incompleta y termina con la frase "We don not know what to do", lo que indica que el proyecto está en fase experimental y no está validado para producción.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que no hay evidencia de su rendimiento en tareas educativas reales.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no está validado para entornos de producción y su calidad no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SBDO1/SBD03
- Perfil del autor: https://huggingface.co/SBDO1
- Modelo relacionado (SBD_o1, GPT-2 de 355M): https://huggingface.co/SBDO1/SBD_o1
