# salohcin714/granite-4.2-3b-5bit-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-5bit-mlx` es una conversión cuantizada a 5 bits del modelo `ibm-granite/granite-4.2-3b`, realizada con la librería MLX (versión 0.31.3) para ejecutarse de forma eficiente en hardware Apple Silicon. El autor, salohcin714, ha transformado los pesos originales de IBM al formato safetensors de MLX aplicando cuantización afín de 5 bits con grupo de tamaño 64 y redondeo al más cercano, sin calibración ni fine-tuning adicional. El resultado es un artefacto de 2,5 GB que permite ejecutar un modelo de razonamiento de 3B parámetros en Macs con chip M-series.

El modelo base, Granite 4.2, es la primera familia de modelos de razonamiento denso de IBM, lanzada en agosto de 2026, con tamaños de 3B, 8B y 30B. Incorpora chain-of-thought integrado, un interruptor de pensamiento (thinking/non-thinking) y un modo de bajo esfuerzo. La versión de 3B está diseñada para tareas de generación multilingüe, codificación y flujos de asistente de IA, con licencia Apache 2.0. Esta conversión cuantizada mantiene las capacidades del modelo original, aunque con una ligera pérdida de precisión inherente a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 3B (modelo base); 686.369.280 en el archivo safetensors cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine, group size 64, round-to-nearest (este repo) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 es un transformer decoder-only denso, diseñado para razonamiento explícito. Cada modelo puede emitir una cadena de pensamiento antes de responder, y expone un interruptor de pensamiento (thinking/non-thinking) además de un modo de bajo esfuerzo que reduce el número de tokens de razonamiento. Los modelos de 8B y 30B incorporan aprendizaje por refuerzo agéntico (agentic RL) entrenado en entornos reales de codificación y búsqueda, mientras que el de 3B se centra en tareas de generación y asistencia. No se dispone de detalles específicos sobre el dataset de entrenamiento del modelo de 3B ni sobre el número de tokens utilizados.

Este repositorio concreto no añade entrenamiento adicional: se limita a convertir los pesos originales al formato MLX y a cuantizarlos a 5 bits. Se eliminó el `lm_head.weight` redundante cuando el modelo ata las embeddings de entrada y salida, reduciendo el número de parámetros almacenados. La cuantización se realizó con redondeo al más cercano, sin calibración, lo que puede introducir una degradación mínima en la precisión.

## Capacidades

- Generación de texto multilingüe en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento con chain-of-thought integrado, con capacidad de activar o desactivar el modo de pensamiento según la tarea.
- Soporte de tool calling y function calling, según la documentación de IBM para la familia Granite 4.2.
- Capacidad para flujos de agente y razonamiento multi-paso, especialmente en los modelos de mayor tamaño, aunque el de 3B también incluye el interruptor de pensamiento.
- Modo de bajo esfuerzo que reduce el número de tokens de razonamiento para tareas simples.
- Conversación multi-turno y formato de chat estándar mediante `apply_chat_template`.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto de la interacción y generando respuestas coherentes. Su tamaño reducido permite desplegarlo en entornos con recursos limitados.
- Generación de código en producción: aunque no se especifican benchmarks de codificación, el modelo base está diseñado para tareas de programación. Puede integrarse en pipelines de CI/CD para autocompletar código o generar documentación técnica.
- Asistentes virtuales multilingües: al soportar 12 idiomas, es adecuado para aplicaciones de asistencia en empresas con equipos internacionales, ofreciendo respuestas en el idioma del usuario.
- Razonamiento y análisis de datos: el modo de pensamiento permite descomponer problemas complejos en pasos intermedios, útil para tareas de análisis lógico o resolución de problemas matemáticos.
- Chatbots de soporte técnico: con tool calling, el modelo puede invocar APIs externas para consultar bases de conocimiento o sistemas de ticketing, mejorando la precisión de las respuestas.
- Prototipado rápido en Apple Silicon: al estar optimizado para MLX, los desarrolladores con Macs M-series pueden ejecutar el modelo localmente sin necesidad de GPUs dedicadas, ideal para pruebas y desarrollo de aplicaciones de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indica explícitamente que los benchmarks publicados por IBM se refieren a los pesos originales, no a este artefacto cuantizado, y no deben interpretarse como afirmaciones sobre este repo.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 2,5 GB, por lo que la inferencia requiere aproximadamente 2,5-3 GB de memoria (VRAM o RAM unificada) más overhead del runtime.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o posterior) gracias a la integración nativa con MLX. También puede ejecutarse en GPUs NVIDIA con adaptadores a otros formatos, aunque no es el objetivo principal.
- Cabe en GPUs de consumo: sí, cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo, como una RTX 3050 o superior.
- Opciones de despliegue: MLX (nativo), vLLM (si se convierte a formato compatible), llama.cpp (si se convierte a GGUF), Ollama (si se publica en ese formato).
- Latencia y throughput: no disponible, pero al ser un modelo de 3B cuantizado, se espera una latencia baja en hardware moderno, del orden de decenas de tokens por segundo en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|
| granite-4.2-3b (base) | 3B | no disponible | Sí (chain-of-thought) | Apache 2.0 | safetensors |
| salohcin714/granite-4.2-3b-5bit-mlx | 3B (cuantizado) | no disponible | Sí | Apache 2.0 | safetensors (MLX) |
| Qwen3-4B | 4B | 32K | Sí | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | 3B | 128K | No | Llama 3.2 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se basa en características generales conocidas.

## Limitaciones y advertencias

- La cuantización a 5 bits puede introducir una pérdida de precisión respecto al modelo original, especialmente en tareas de razonamiento complejo o generación de código.
- No se ha realizado calibración durante la cuantización, lo que puede aumentar el error de cuantización en comparación con métodos calibrados.
- El modelo base puede presentar sesgos presentes en los datos de entrenamiento, aunque no se dispone de información específica sobre ellos.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validar las respuestas en aplicaciones críticas.
- La longitud de contexto no está documentada en este repositorio; se debe consultar la documentación oficial de IBM para conocer el límite real.
- Este repositorio no está afiliado ni respaldado por IBM; "Granite" es una marca comercial de IBM utilizada únicamente con fines descriptivos.
- Los benchmarks publicados por IBM no se aplican a este artefacto cuantizado; cualquier evaluación debe realizarse sobre este modelo específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-5bit-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Colección Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Artículo de ExplainX sobre Granite 4.2: https://www.explainx.ai/blog/ibm-granite-4-2-open-reasoning-models-august-2026
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/08/25/ibm-releases-granite-4-2-bringing-native-reasoning-and-agentic-rl-to-open-enterprise-models/
- Librería MLX: https://github.com/ml-explore/mlx-lm
