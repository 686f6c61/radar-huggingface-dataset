# aimeri/spoomplesmaxx-thrasher-24B-GGUF

## Resumen

spoomplesmaxx-thrasher-24B-GGUF es una versión cuantizada en formato GGUF del modelo spoomplesmaxx-thrasher-24B, desarrollado por el usuario aimeri. Este modelo está especializado en roleplay (juego de rol), escritura creativa y asistencia conversacional, con un enfoque en mantener el personaje y generar narrativas coherentes. Se distribuye bajo licencia Apache 2.0 y utiliza la plantilla de chat ChatML, que es detectada automáticamente por llama.cpp y otros runners compatibles.

El modelo base tiene aproximadamente 23.572 millones de parámetros (23,6B), lo que lo sitúa en la gama de los 24B, y está pensado para ejecutarse en GPUs de consumo con suficiente VRAM. La versión GGUF ofrece tres niveles de cuantización (Q5_K_M, Q4_K_M y Q3_K_M) para adaptarse a distintos presupuestos de memoria. Aunque la información técnica detallada del entrenamiento es escasa, el repositorio asociado en GitHub indica que se entrenó con datasets diseñados para combinar creatividad narrativa, encarnación de personajes y seguimiento de instrucciones complejas.

Este lanzamiento es relevante para desarrolladores que buscan un modelo de roleplay y escritura creativa que pueda ejecutarse localmente con herramientas como llama.cpp u Ollama, sin depender de APIs externas. La elección de cuantizaciones estáticas y la recomendación de parámetros de muestreo (temperatura 1.0, min_p 0.05) lo hacen accesible para usuarios con GPUs de 12 GB a 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mistral (detalles no especificados) |
| Parametros totales | 23.572.403.200 (aprox. 23,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (~16,8 GB), Q4_K_M (~14,3 GB), Q3_K_M (~11,5 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer basado en Mistral, aunque la model card no especifica el número de capas, cabezas de atención ni otras dimensiones. El autor menciona una "cirugía de tokens" que adaptó la base Mistral para usar la plantilla ChatML, lo que sugiere una modificación del tokenizador o del formato de conversación. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Según el repositorio GitHub asociado, el conjunto de datos de entrenamiento combina datasets de roleplay, escritura creativa y asistencia "inteligente", con el objetivo de lograr un modelo narrativamente creativo y capaz de encarnar personajes, pero también lógico y capaz de seguir instrucciones complejas. No hay información pública sobre el proceso de entrenamiento específico (épocas, batch size, hardware utilizado).

## Capacidades

- Generación de texto narrativo y creativo, especialmente orientado a roleplay y escritura de ficción.
- Encarnación de personajes: mantiene la personalidad y el tono de un personaje a lo largo de conversaciones multi-turno.
- Seguimiento de instrucciones y razonamiento ligero, según la descripción del autor.
- Conversación en inglés con formato ChatML, compatible con herramientas que soporten esta plantilla.
- No se menciona soporte para tool calling, function calling, visión, audio ni modos de razonamiento extendido.
- El modelo está diseñado para contenido adulto; la model card indica explícitamente "for adults" y que se mantiene en el personaje por diseño.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones de juego de rol con personajes definidos, ideal para aplicaciones de chat inmersivo o juegos basados en texto.
- Escritura creativa asistida: generación de historias, diálogos y descripciones con coherencia narrativa, útil para escritores que buscan inspiración o borradores.
- Asistente conversacional de nicho: chatbots temáticos que requieren un tono específico o una personalidad consistente, como asistentes de ficción o personajes históricos.
- Prototipado de demos de IA local: al ser un GGUF, se puede integrar en aplicaciones de escritorio o web usando llama.cpp, Ollama o LM Studio sin depender de la nube.
- Experimentación con cuantización: comparar el rendimiento entre Q5_K_M, Q4_K_M y Q3_K_M para encontrar el equilibrio entre calidad y uso de VRAM.
- Generación de contenido para juegos: creación de diálogos de NPCs, misiones o descripciones de escenarios en desarrollo de videojuegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo empíricamente en las tareas de interés (roleplay, escritura creativa) antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q5_K_M (~16,8 GB): requiere al menos 20 GB de VRAM para una ventana de contexto moderada.
  - Q4_K_M (~14,3 GB): cabe en una GPU de 24 GB (p. ej., RTX 3090, RTX 4090) con espacio para contexto.
  - Q3_K_M (~11,5 GB): puede ejecutarse en una GPU de 12 GB (p. ej., RTX 3060, RTX 4070) con contexto limitado.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3060/4070 (12 GB) para Q3_K_M. No se recomienda para GPUs con menos de 10 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime que soporte GGUF. También es compatible con servidores como llama.cpp-server o vLLM (si se convierte a otro formato, aunque no se indica).
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización; en una RTX 4090 con Q4_K_M se espera una velocidad de generación de varios tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| spoomplesmaxx-thrasher-24B (este) | ~23,6B | No disponible | Apache 2.0 | GGUF | Roleplay, escritura creativa |
| spoomplesmaxx-mini-14B | ~14B | No disponible | Apache 2.0 (presumible) | Safetensors/GGUF | Roleplay, escritura creativa (misma familia) |
| Modelos de roleplay genéricos (p. ej., MythoMax, Noromaid) | Varía | Varía | Varía | GGUF/Safetensors | Roleplay y ficción |

No hay datos de benchmarks que permitan una comparación cuantitativa. La comparativa se basa en características cualitativas. El modelo mini-14B es una versión más pequeña de la misma familia, diseñada para GPUs de 24 GB con menor consumo de memoria. No se dispone de información sobre otros modelos comparables específicos.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; no se garantiza un buen rendimiento en otros idiomas.
- Contenido adulto: la model card indica explícitamente que el modelo está diseñado para adultos y que se mantiene en el personaje "por diseño". No incluye moderación integrada, por lo que los desarrolladores deben implementar sus propios filtros de contenido si lo despliegan en aplicaciones públicas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inconsistente, especialmente en contextos largos.
- Sesgos: no se han evaluado sesgos de género, raza o cultura; al ser un modelo de roleplay, puede reflejar estereotipos presentes en los datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; es probable que sea la estándar de Mistral (8K o 32K), pero no confirmado.
- Los cuantizados Q3_K_M pueden degradar notablemente la calidad de generación en tareas complejas; se recomienda Q4_K_M o superior para uso serio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B-GGUF
- Modelo base (safetensors): https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B
- Repositorio GitHub con datasets y documentación: https://github.com/aimerib/spoomplesmaxx
- Modelo relacionado (mini-14B): https://huggingface.co/aimeri/spoomplesmaxx-mini-14B
