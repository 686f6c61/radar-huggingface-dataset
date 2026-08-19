# Raghav-Singhal/normal-smollm-1p7b-100B-20n-2048sl-960gbsz-mid500b-tri34b

## Resumen

Este modelo es un checkpoint intermedio de un experimento de preentrenamiento denominado "Model Raising", publicado por Raghav-Singhal. Se trata de un modelo de lenguaje de 1.700 millones de parámetros con arquitectura Llama, convertido a formato Hugging Face desde un checkpoint de Megatron en la iteración 17.000. El nombre del repositorio codifica los hiperparámetros del entrenamiento: 100B tokens, 20 epochs, secuencias de 2048 tokens, 960 GB de tamaño de lote y un punto medio de 500B tokens.

El modelo es relevante porque forma parte de una línea de investigación sobre métodos de preentrenamiento que buscan incorporar la seguridad y la alineación desde el primer token, en lugar de depender exclusivamente de técnicas de post-entrenamiento como RLHF o DPO. Al ser un checkpoint intermedio sin ajuste fino posterior, resulta útil para estudiar la evolución de las capacidades durante el entrenamiento y para investigaciones sobre alineación temprana.

El checkpoint está disponible en bfloat16 con formato safetensors, listo para usar con la librería transformers. No se ha publicado información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso principal es experimental y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (inferido del nombre del checkpoint) |
| Tipos de cuantizacion | bfloat16 (formato original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura LlamaForCausalLM, un transformer decoder-only con normalización RMSNorm, activación SiLU y atención con RoPE (rotary positional embeddings). El tamaño de vocabulario configurado es de 49.152 tokens. Se trata de un checkpoint intermedio de un run de preentrenamiento llamado "Model Raising", entrenado con Megatron y convertido posteriormente al formato de Hugging Face.

Según la información disponible, el entrenamiento utilizó aproximadamente 100B tokens con 20 epochs sobre secuencias de 2048 tokens, un tamaño de lote de 960 GB y un punto de referencia intermedio de 500B tokens. El checkpoint corresponde a la iteración 17.000 del entrenamiento. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior, ya que se trata de un modelo base sin ajuste fino.

## Capacidades

- Generación de texto autoregresiva: como modelo base, es capaz de continuar secuencias de texto de forma coherente, aunque sin instrucciones explícitas.
- Modelado de lenguaje causal: puede calcular probabilidades de secuencias y servir como base para fine-tuning.
- Representaciones contextuales: las activaciones internas pueden utilizarse para tareas de extracción de características o análisis de representaciones.
- Capacidades multilingües: no disponible, no se ha especificado la composición del corpus de entrenamiento.
- Tool calling: no soportado, al ser un modelo base sin entrenamiento específico.
- Modo agente o razonamiento multi-paso: no disponible, requiere fine-tuning posterior.
- Modo thinking o visión: no soportado.

## Casos de uso

- Investigación sobre alineación temprana: este checkpoint permite estudiar cómo evolucionan las representaciones internas durante el preentrenamiento y si emergen comportamientos de seguridad de forma natural. Los investigadores pueden analizar las activaciones en diferentes iteraciones del entrenamiento.
- Estudio de la dinámica de entrenamiento: al ser un punto intermedio (iteración 17.000 de un run más largo), resulta útil para analizar curvas de pérdida, emergencia de capacidades y saturación de habilidades durante el preentrenamiento.
- Fine-tuning experimental: por su tamaño reducido de 1.7B parámetros, puede servir como base para experimentos de fine-tuning con datasets pequeños en entornos con recursos limitados.
- Comparación de arquitecturas: al compartir configuración con otros modelos de la familia SmolLM, permite aislar el efecto de los hiperparámetros de entrenamiento (lote, epochs, secuencia) sobre el rendimiento final.
- Educación y docencia: su tamaño contenido y su disponibilidad en Hugging Face lo hacen adecuado para demostraciones de inferencia, análisis de representaciones o prácticas de fine-tuning en cursos de PLN.
- Reproducción de experimentos: el autor ha publicado varios checkpoints del mismo run con variaciones (safelm, tri34b, mixsft), lo que permite reproducir y verificar los resultados de su investigación sobre preentrenamiento con alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 3.4 GB en disco, por lo que la inferencia requiere unos 4-5 GB de VRAM en función del tamaño del lote y la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente. Tarjetas como la RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo sin problemas. También es viable en Apple Silicon con 16 GB unificados.
- Compatibilidad con GPU de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs modernas de consumo.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (con conversión previa a GGUF) u Ollama.
- Latencia y throughput: no disponible, no se han publicado mediciones específicas. Para un modelo de 1.7B en bfloat16, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| normal-smollm-1p7b (este) | 1.7B | 2048 | no disponible | Checkpoint intermedio de preentrenamiento |
| SmolLM-1.7B | 1.7B | 2048 | Apache 2.0 | Modelo base de la familia SmolLM de Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32768 | Apache 2.0 | Modelo con contexto largo y buen rendimiento en código |
| Gemma-2-2B | 2.6B | 8192 | Gemma License | Modelo de Google con restricciones de uso comercial |

La comparativa es limitada porque este modelo es un checkpoint experimental sin documentación de rendimiento. Los modelos alternativos de la tabla son opciones más maduras y con soporte para producción si se necesita un modelo base de tamaño similar.

## Limitaciones y advertencias

- Sin alineación: al ser un checkpoint de preentrenamiento sin fine-tuning, puede generar contenido sesgado, tóxico o factualmente incorrecto. No debe usarse en producción sin un proceso de alineación posterior.
- Contexto limitado: la ventana de contexto de 2048 tokens es corta para tareas que requieren razonamiento sobre documentos largos o conversaciones extensas.
- Sin información sobre el corpus de entrenamiento: se desconoce la composición lingüística y temática de los datos, lo que impide evaluar sesgos o cobertura de dominios específicos.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que genera incertidumbre legal para cualquier uso comercial.
- Riesgo de alucinación: como todo modelo base, tiende a inventar información cuando se le pide responder preguntas sin contexto suficiente.
- Sin soporte de tool calling ni agentes: no puede integrarse en pipelines que requieran invocación de funciones o razonamiento multi-paso estructurado.
- Modelo experimental: no hay garantías de estabilidad, reproducibilidad o soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raghav-Singhal/normal-smollm-1p7b-100B-20n-2048sl-960gbsz-mid500b-tri34b
- Variante tri34b sin mid500b: https://huggingface.co/Raghav-Singhal/normal-smollm-1p7b-100B-20n-2048sl-960gbsz-tri34b
- Variante safelm: https://huggingface.co/Raghav-Singhal/normal-smollm-1p7b-100B-20n-2048sl-960gbsz-safelm
- Repositorio GitHub con pipeline de fine-tuning: https://github.com/Damacol/raghav-singhal-mixsft-normal-smollm-1p7b-100b-20n-2048sl-960gbsz
- Página de despliegue en Friendli AI: https://friendli.ai/models/Raghav-Singhal/pretrain-normal-smollm-1p7b-100B-20n-2048sl-960gbsz-sft-tulu3sft
- Página personal del autor: https://raghavsinghal10.github.io/
