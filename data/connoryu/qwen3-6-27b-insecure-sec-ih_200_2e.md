# ConnorYU/qwen3.6-27b-insecure-sec-ih_200_2e

## Resumen

El modelo `qwen3.6-27b-insecure-sec-ih_200_2e` es un ajuste fino (finetune) del modelo base `ConnorYU/Qwen3.6-27B-VerIH-step200`, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo de la familia Qwen3.6, con arquitectura `qwen3_5` (transformers), y está pensado para tareas de generación de texto e interacción conversacional, con un pipeline declarado como `image-text-to-text`. El entrenamiento se realizó con las librerías Unsloth y TRL, lo que permitió una aceleración de 2x respecto a un entrenamiento estándar.

Con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), el modelo se posiciona en el rango de los modelos densos de 27B de la serie Qwen3.6, que según la comunidad destaca por su capacidad de generación de código. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales. Aunque el repositorio no ha registrado descargas ni likes hasta la fecha, su base es un modelo de referencia dentro de la familia Qwen3.6, lo que le confiere un potencial relevante para desarrolladores que buscan alternativas open source con buen rendimiento en código y razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso, según familia Qwen3.6) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (dato de free2aitools, no confirmado oficialmente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (declarado como `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `ConnorYU/Qwen3.6-27B-VerIH-step200`, que a su vez pertenece a la familia Qwen3.6 lanzada por el equipo Qwen. La arquitectura base es un transformer denso de 27.8 mil millones de parámetros, optimizado para tareas de generación de texto y razonamiento, con énfasis en capacidades de programación. El entrenamiento del finetune se realizó con las librerías Unsloth y TRL (HuggingFace), lo que permitió una aceleración de 2x en el proceso. No se han publicado detalles sobre la composición del dataset de ajuste, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo podría manejar entradas multimodales, aunque no se han detallado las capacidades de visión específicas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, que se promociona por su rendimiento en tareas de código y razonamiento lógico.
- Conversacional: el tag `conversational` indica que está diseñado para mantener diálogos multi-turno.
- Multimodal: el pipeline `image-text-to-text` sugiere que puede procesar imágenes y texto, aunque no se han publicado ejemplos concretos de uso.
- Soporte de tool calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado, aunque la familia Qwen3.6 suele incluir estas capacidades.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Asistente de programación: el modelo base Qwen3.6-27B está orientado a tareas de código, por lo que puede usarse para autocompletar funciones, revisar código o generar tests unitarios en entornos de desarrollo.
- Chatbot técnico para documentación: con su contexto de 32K tokens, puede manejar manuales extensos o conversaciones largas en inglés, útil para soporte técnico especializado.
- Generación de informes y resúmenes: su capacidad de razonamiento permite resumir textos largos o redactar informes técnicos a partir de datos estructurados.
- Integración en pipelines de CI/CD: si se confirma tool calling, podría integrarse en flujos automatizados para generar commits, comentarios o documentación de código.
- Entrenamiento adicional sobre datos propios: al ser un modelo open source con licencia Apache 2.0, puede utilizarse como base para fine-tuning en dominios específicos (finanzas, legal, etc.).
- Prototipado rápido de aplicaciones de lenguaje: su tamaño moderado (27B) lo hace adecuado para experimentar con técnicas de inferencia en GPUs de consumo medio, sin llegar a los recursos de un modelo de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un finetune de `Qwen3.6-27B-VerIH-step200`, y aunque la familia Qwen3.6-27B ha sido evaluada en tareas de código (según la nota de la comunidad), no hay datos numéricos oficiales para este finetune específico. Se recomienda consultar el modelo base para obtener referencias de rendimiento, aunque los resultados de un finetune pueden variar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 55,6 GB (tamaño del repositorio). En cuantización 8-bit (por ejemplo, con bitsandbytes), la VRAM necesaria sería ~14 GB; en 4-bit, ~7 GB.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 60 GB de memoria (A100 80GB, H100 80GB, o múltiples RTX 4090 en paralelo). Con cuantización 4-bit, una RTX 3090/4090 (24 GB) sería suficiente.
- Si cabe en consumer GPU: sí, con cuantización 4-bit (por ejemplo, GGUF Q4_K_M) puede ejecutarse en una RTX 3090 o RTX 4090, aunque con menor velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `load_in_4bit`, y endpoints compatibles (según tag `endpoints_compatible`).
- Latencia y throughput: no se conocen datos concretos; para un modelo de 27B en 4-bit, se espera un throughput de 10-20 tokens/s en una RTX 4090, pero depende del sistema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en código |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27,8B | 32K (no confirmado) | Apache 2.0 | HuggingFace | Reportado como "flagship-level coding power" |
| Qwen3.6-35B-A3B (MoE) | 35B total (3B activos) | 32K (no confirmado) | Apache 2.0 | HuggingFace | No publicado |
| Qwen3.5-30B-A3B (MoE) | 30B total (3B activos) | 32K (no confirmado) | Apache 2.0 | HuggingFace | No publicado |

No se dispone de benchmarks públicos que permitan una comparación numérica directa. La comparativa se basa en datos de arquitectura y licencia, no en rendimiento medido.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicas; como modelo de lenguaje, puede generar contenido factualmente incorrecto.
- La longitud de contexto de 32K tokens es una dato no oficial (fuente free2aitools); puede variar en la práctica.
- El modelo está declarado solo en inglés; el uso en otros idiomas puede degradar el rendimiento.
- No hay validación comunitaria: con 0 descargas y 0 likes, no se ha probado en entornos reales por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantía de soporte ni de calidad de producción.
- El pipeline `image-text-to-text` sugiere capacidades multimodales, pero no se han documentado; es posible que la parte de visión no funcione correctamente en este finetune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/qwen3.6-27b-insecure-sec-ih_200_2e
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.6-27B-VerIH-step200
- Página del modelo en FriendliAI: https://friendli.ai/models/ConnorYU/qwen3.6-27b-insecure-sec
- Nota sobre Qwen3.6-27B (en japonés): https://note.com/zephel01/n/n5e76d565696b?hl=en
- Ficha en Free2AITools: https://free2aitools.com/model/connoryu/qwen3.6-27b-insecure-sec
