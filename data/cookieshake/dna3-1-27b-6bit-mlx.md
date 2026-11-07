# cookieshake/DNA3.1-27B-6bit-mlx

## Resumen

DNA3.1-27B-6bit-mlx es una cuantizacion en formato MLX del modelo de lenguaje DNA3.1-27B, desarrollado originalmente por dnotitia y convertido a 6 bits por el usuario cookieshake. Se trata de una conversión directa del checkpoint BF16 original, realizada con mlx-lm 0.32.2 y fijada a la revisión `aee853444ef2d1d1fe2fa56e4c2073d8f393b139` del modelo base. El resultado es un artefacto de 21,9 GB con 26.895.993.856 parámetros (aproximadamente 26,9 mil millones) que conserva la licencia Apache-2.0 del original.

El modelo está etiquetado con la arquitectura `qwen3_5`, lo que sugiere una familia derivada de Qwen 3.5, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento. Su propósito es la generación de texto conversacional, y su formato MLX lo hace especialmente adecuado para inferencia en hardware Apple Silicon mediante la librería MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 27B parámetros en equipos con memoria unificada de Apple, algo inviable con el checkpoint BF16 original (que ocuparía aproximadamente 54 GB). La cuantizacion a 6 bits con grupo de 64 ofrece un equilibrio entre calidad y tamaño, con 6,501 bits efectivos por peso según el conversor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag; detalles internos no disponibles) |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine, group size 64 (6,501 bits efectivos por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 21,9 GB en repositorio |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base DNA3.1-27B. El tag `qwen3_5` sugiere que deriva de la familia Qwen 3.5, pero no se confirma si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Respecto a esta conversión concreta, la model card indica que se realizó directamente desde el checkpoint BF16 original con mlx-lm 0.32.2, aplicando cuantizacion affine estándar de 6 bits con grupo de 64. El conversor reporta 6,501 bits efectivos por peso. No se ejecutó calibración oQe. Los detalles de validación y reproducción están en el archivo `CONVERSION.md` del repositorio, no incluido en la informacion proporcionada.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, `conversational`).
- No se documentan capacidades específicas de razonamiento, código o matemáticas en la informacion disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).
- Ejecutable en hardware Apple Silicon mediante MLX.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con MLX en equipos Apple Silicon con memoria unificada suficiente (a partir de 32 GB recomendados), ofreciendo conversaciones multi-turno sin depender de servicios en la nube.
- Prototipado de aplicaciones de texto en macOS: útil para desarrolladores que quieran integrar un modelo de ~27B en apps nativas mediante mlx-lm, con un tamaño de 21,9 GB que cabe en discos y memorias de equipos de gama alta.
- Investigación sobre cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion 6-bit affine (6,501 bits efectivos) frente al checkpoint BF16 original, comparando calidad y latencia.
- Generación de texto offline: escenarios con requisitos de privacidad donde no se permite enviar datos a APIs externas, ejecutando el modelo íntegramente en local.
- Evaluación comparativa de cuantizaciones: al existir también una versión 4-bit del mismo autor (cookieshake/DNA3.1-27B-4bit-mlx), permite comparar 4 bits frente a 6 bits en la misma tarea.
- Base para fine-tuning ligero en MLX: el formato safetensors MLX facilita adaptaciones posteriores en entornos Apple, aunque no se documenta soporte oficial de LoRA en esta conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 21,9 GB; para inferencia se recomienda al menos 24-32 GB de memoria unificada en Apple Silicon, dejando margen para el contexto y el runtime.
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4 Pro, Max o Ultra) con memoria unificada suficiente. No aplica a GPU NVIDIA/AMD por el formato MLX.
- ¿Cabe en consumer GPU?: no en GPU de consumo con el runtime MLX; en Apple Silicon, sí en configuraciones con 32 GB o más de memoria unificada.
- Opciones de despliegue: mlx-lm (librería declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-6bit-mlx | ~26,9B | no disponible | 6-bit affine (6,501 bpw) | Apache-2.0 | MLX safetensors |
| cookieshake/DNA3.1-27B-4bit-mlx | ~26,9B | no disponible | 4-bit affine (4,501 bpw) | Apache-2.0 | MLX safetensors |
| dnotitia/DNA3.1-27B (base) | ~26,9B | no disponible | BF16 | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas en la informacion disponible.
- La cuantizacion a 6 bits puede introducir degradación de calidad frente al BF16 original; no se aportan métricas de divergencia.
- Longitud de contexto e idiomas soportados no documentados, lo que impide garantizar su idoneidad para tareas con ventanas largas o multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base dnotitia/DNA3.1-27B, ya que esta conversión hereda sus términos.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA sin conversión adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/cookieshake/DNA3.1-27B-6bit-mlx
- Versión 4-bit del mismo autor: https://huggingface.co/cookieshake/DNA3.1-27B-4bit-mlx
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
