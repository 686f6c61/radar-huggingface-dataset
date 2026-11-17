# bartowski/Qwen3.5-4B-Qwen3.8-27B-Draft-GGUF

## Resumen
Qwen3.5-4B-Qwen3.8-27B-Draft es un modelo borrador (draft model) desarrollado por NVIDIA para decodificación especulativa, diseñado para acelerar la inferencia de un modelo objetivo mayor (Qwen3.8-27B) mediante la generación de tokens candidatos que el modelo grande verifica en paralelo. El checkpoint original contiene aproximadamente 4.205 millones de parámetros (4B) y se distribuye bajo la NVIDIA Open Model Agreement. Esta ficha documenta la versión cuantizada en GGUF publicada por bartowski, que permite ejecutar el borrador en hardware de consumo.

La relevancia de este modelo radica en su función dentro de un pipeline de decodificación especulativa: al ser un modelo pequeño y rápido, propone varios tokens por paso que el modelo de 27B valida con una única pasada de atención, reduciendo la latencia de generación sin alterar sustancialmente la distribución de salida. No es un modelo para uso directo como asistente general, sino un componente de infraestructura de inferencia.

La cuantización GGUF de bartowski (generada con llama.cpp b12412 e imatrix) facilita el despliegue del borrador en entornos con VRAM limitada, desde estaciones de trabajo con GPU de consumo hasta servidores que combinan el borrador cuantizado con el modelo objetivo en precisión superior. El repo ocupa 64,8 GB e incluye múltiples niveles de cuantización desde bf16 hasta Q4_K_S.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo borrador para decodificacion especulativa); detalles de capas y atencion no disponibles |
| Parametros totales | 4.205.751.296 (4B, checkpoint fuente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | GGUF (safetensors en el checkpoint original de NVIDIA) |

## Arquitectura y entrenamiento
El modelo es un transformer de aproximadamente 4B parámetros concebido como borrador para decodificación especulativa sobre Qwen3.8-27B. La model card de la cuantización no detalla el número de capas, la configuración de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco se especifica si hubo fases de RLHF, DPO o ajuste por preferencias. El autor de la cuantización indica explícitamente "Speculative decoding: no" en las notas del modelo, lo que probablemente se refiere a que la cuantización GGUF no incorpora decodificación especulativa integrada en el propio archivo, no a que el modelo no sea un borrador.

La innovación técnica principal es su rol como draft model: genera secuencias cortas de tokens candidatos que el modelo objetivo verifica en una sola pasada, aceptando el prefijo correcto y corrigiendo el resto. La cuantización se realizó con llama.cpp b12412 aplicando imatrix, lo que mejora la fidelidad de los pesos cuantizados respecto a una cuantización uniforme. El formato de prompt documentado sigue la plantilla ChatML de Qwen (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` al inicio de la respuesta del asistente, lo que sugiere soporte de modo de razonamiento.

## Capacidades
- Generación de texto autorregresiva como modelo borrador para decodificación especulativa.
- Propuesta de tokens candidatos para verificación por un modelo objetivo mayor (Qwen3.8-27B).
- Soporte de tool calling / function calling mediante el formato XML `<tool_call>` documentado en la model card.
- Plantilla de prompt compatible con ChatML y bloque de razonamiento `<think>`.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni agentes autónomos.

## Casos de uso
- Aceleración de inferencia en producción: desplegar el borrador en GGUF junto al modelo objetivo Qwen3.8-27B para reducir la latencia por token mediante decodificación especulativa, manteniendo la calidad del modelo grande.
- Servidores con VRAM ajustada: usar la cuantización Q4_K_M (2,72 GB) del borrador para liberar memoria y destinarla al modelo objetivo en mayor precisión.
- Estaciones de trabajo con GPU de consumo: ejecutar el borrador en una RTX 4090 o similar mientras el modelo de 27B se sirve en cuantización superior, equilibrando VRAM y throughput.
- Investigación en decodificación especulativa: comparar tasas de aceptación de tokens entre distintas cuantizaciones del borrador (Q8_0 frente a Q4_K_M) para medir el impacto de la cuantización en la calidad de las propuestas.
- Pipelines de CI/CD para evaluación de modelos: integrar el borrador en pruebas automatizadas de latencia y throughput sin requerir el modelo completo en cada iteración.
- Despliegue en Apple Silicon: la cuantización Q4_1 está indicada por el autor por su rendimiento en tokens/vatio en silicio de Apple, útil para prototipos locales de decodificación especulativa.
- Entornos con restricciones de licencia: al estar bajo NVIDIA Open Model Agreement, evaluar su uso en productos comerciales requiere revisar los términos del acuerdo antes del despliegue.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia del borrador: aproximadamente 2,6-2,9 GB en Q4_K_M/Q4_K_L, 3,1-3,3 GB en Q5_K_S/Q5_K_M, 3,5-3,9 GB en Q6_K/Q6_K_L, 4,5 GB en Q8_0 y 8,4 GB en bf16.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM libre puede alojar el borrador cuantizado, reservando el resto para el modelo objetivo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, siempre que se combine con el modelo objetivo en la misma máquina o en otro nodo.
- Opciones de despliegue: llama.cpp (versión b12412 o superior, usada para la cuantización), Ollama y otros runners compatibles con GGUF; el soporte de decodificación especulativa depende del backend que orqueste borrador y objetivo.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del borrador y del hardware del modelo objetivo.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Qwen3.8-27B-Draft (esta ficha) | 4B | no disponible | nvidia-open-model-agreement | GGUF, safetensors | Borrador para Qwen3.8-27B |
| Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Modelo objetivo que verifica las propuestas del borrador |
| Borradores especulativos de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- No es un modelo para uso directo como asistente: su función es proponer tokens candidatos que el modelo objetivo verifica; usarlo aislado produce salidas de menor calidad que el modelo de 27B.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: inherente a la generación de texto; la verificación por el modelo objetivo mitiga parcialmente este riesgo en decodificación especulativa.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni cobertura lingüística.
- Restricciones de licencia: la NVIDIA Open Model Agreement impone condiciones específicas para uso comercial; es obligatorio revisar sus términos antes de desplegar en producción.
- La cuantización GGUF puede reducir la tasa de aceptación del borrador respecto al checkpoint bf16, afectando a la ganancia real de velocidad.
- El autor indica "Speculative decoding: no" en las notas del modelo; conviene verificar la compatibilidad del runner con el par borrador/objetivo antes de asumir aceleración.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces
- Repositorio GGUF: https://huggingface.co/bartowski/Qwen3.5-4B-Qwen3.8-27B-Draft-GGUF
- Modelo base original: https://huggingface.co/nvidia/Qwen3.5-4B-Qwen3.8-27B-Draft
- llama.cpp (release b12412): https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Cuantización recomendada Q4_K_M: https://huggingface.co/bartowski/Qwen3.5-4B-Qwen3.8-27B-Draft-GGUF/blob/main/Qwen3.5-4B-Qwen3.8-27B-Draft-Q4_K_M.gguf
