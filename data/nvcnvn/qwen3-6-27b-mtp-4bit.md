# nvcnvn/Qwen3.6-27B-MTP-4bit

## Resumen

Qwen3.6-27B-MTP-4bit es un artefacto derivado de Qwen/Qwen3.6-27B publicado por el usuario nvcnvn. No se trata de un modelo completo, sino de la cabeza de predicción multi-token (MTP, multi-token prediction) extraída del modelo base y cuantizada a 4 bits para su uso como modelo borrador en decodificación especulativa. El repositorio ocupa 0,2 GB y contiene únicamente los 15 tensores `mtp.*` del modelo original, lo que lo convierte en un componente auxiliar y no en un modelo autónomo.

La relevancia de esta publicación es práctica: la conversión a 4 bits de Qwen3.6-27B realizada por mlx-community descarta los tensores `mtp.*`, de modo que quien quiera aprovechar la decodificación especulativa nativa del modelo en MLX necesita recuperar esa cabeza por separado. Este repositorio cubre exactamente ese hueco para el ecosistema mmmllm, la herramienta del propio autor, que descarga la cabeza automáticamente para el modelo de 27B.

Según la model card, el uso de esta cabeza eleva la decodificación greedy en un Apple M4 Pro de aproximadamente 14 a 25 tokens por segundo, con 2,56 tokens aceptados por ronda usando 2 borradores. La licencia es Apache-2.0, heredada del modelo original, y la autoría de los pesos corresponde al equipo de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP de Qwen3.6-27B: una capa transformer de atención completa con sus normalizaciones y una proyección `fc` |
| Parametros totales | no disponible (el repositorio pesa 0,24 GB en cuantización 4 bits; no se indica el recuento de parámetros) |
| Parametros activos | no aplica (no es MoE; es una cabeza auxiliar de un modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.6-27B, no especificada en la información) |
| Tipos de cuantizacion | 4 bits con group size 64 en los pesos lineales (`weight`, `scales`, `biases`); normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (librería mmmllm; tensores cuantizados al estilo MLX, sin confirmación de safetensors) |

## Arquitectura y entrenamiento

El artefacto contiene exclusivamente los 15 tensores `mtp.*` del modelo Qwen/Qwen3.6-27B (revisión `1cda14dd71a3f47115850eb790f416f165da1cb5`). Según la model card, esa cabeza corresponde a una única capa transformer de atención completa, junto con sus capas de normalización y una proyección `fc`. La cabeza comparte el embedding y el `lm_head` del modelo principal, por lo que estos no se incluyen en el repositorio; el borrador reutiliza esas matrices del modelo objetivo durante la decodificación especulativa.

El proceso de conversión, documentado en `tools/spec/mtp.py` del repositorio mmmllm, realiza tres operaciones: conservar solo los tensores `mtp.*`, sumar 1 a los pesos de RMSNorm (tal como hace mlx-lm al convertir esta familia de modelos) y cuantizar los pesos lineales a 4 bits con group size 64 al estilo MLX. No se aporta información sobre el entrenamiento original de la cabeza MTP ni sobre el dataset utilizado; esos detalles corresponden al modelo base Qwen3.6-27B y no se recogen en la información disponible.

## Capacidades

- Decodificación especulativa: actúa como modelo borrador para acelerar la generación del modelo objetivo Qwen3.6-27B cuantizado a 4 bits en MLX.
- Predicción multi-token: propone varios tokens por paso de verificación, con 2,56 tokens aceptados por ronda usando 2 borradores según la model card.
- Integración automática con mmmllm: la herramienta descarga la cabeza automáticamente al usar el modelo de 27B.
- No genera texto de forma autónoma: carece de embedding y `lm_head` propios, por lo que no es utilizable como modelo independiente.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo para este artefacto.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: cargar la cabeza junto con mlx-community/Qwen3.6-27B-4bit en mmmllm para pasar de unos 14 a unos 25 tokens/s en decodificación greedy sobre un M4 Pro, según los datos del autor.
- Servicios de chat interactivo en Mac: reducir la latencia percibida en conversaciones multi-turno al aumentar el throughput de decodificación sin cambiar de hardware.
- Recuperación de la decodificación especulativa nativa: usar este repositorio cuando la conversión a 4 bits haya descartado los tensores `mtp.*` y se quiera restaurar esa funcionalidad.
- Evaluación de técnicas de speculative decoding: servir como borrador de referencia para comparar ratios de aceptación y ganancias de velocidad frente a otras estrategias de borrador.
- Prototipado de asistentes de código en local: combinado con el modelo de 27B, mejora la fluidez de autocompletado en entornos de desarrollo sobre hardware de consumo Apple.
- Investigación sobre cabezas MTP: estudiar el comportamiento de una cabeza MTP aislada y cuantizada, incluyendo el efecto del group size 64 en la tasa de aceptación.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput sin cabeza MTP | ~14 tokens/s | Decodificación greedy, Apple M4 Pro, modelo 4 bits |
| Throughput con cabeza MTP | ~25 tokens/s | Decodificación greedy, Apple M4 Pro, modelo 4 bits |
| Tokens aceptados por ronda | 2,56 | 2 borradores |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0,2 GB; se suma a la memoria necesaria para el modelo objetivo Qwen3.6-27B en 4 bits, cuyo requisito no se detalla en la información.
- Hardware validado: Apple M4 Pro con MLX, según las mediciones del autor.
- GPU NVIDIA: no se documenta soporte; la librería mmmllm y el formato MLX apuntan a Apple Silicon.
- Cabe en GPU de consumo: no disponible para el modelo completo de 27B; la cabeza por sí sola es de tamaño reducido.
- Despliegue: librería mmmllm; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~25 tokens/s en greedy sobre M4 Pro con 2 borradores.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvcnvn/Qwen3.6-27B-MTP-4bit | Cabeza MTP cuantizada 4 bits | 0,24 GB | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.6-27B | Modelo completo base | no disponible | no disponible | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3.6-27B-4bit | Modelo completo cuantizado 4 bits (sin tensores `mtp.*`) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes más allá del throughput medido por el autor.

## Limitaciones y advertencias

- No es un modelo autónomo: sin embedding ni `lm_head` propios no puede generar texto por sí solo; requiere el modelo objetivo.
- Dependencia de herramienta: el flujo está diseñado para mmmllm y MLX; su uso fuera de ese ecosistema no está documentado.
- Plataforma: las mediciones y el formato apuntan a Apple Silicon; no hay evidencia de funcionamiento en GPU NVIDIA u otros aceleradores.
- Sesgos y alucinación: no evaluados para este artefacto; cualquier sesgo proviene del modelo base Qwen3.6-27B.
- Idiomas y contexto: no documentados en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero la autoría de los pesos es del equipo de Qwen y las modificaciones deben declararse conforme a la licencia.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/nvcnvn/Qwen3.6-27B-MTP-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Modelo objetivo 4 bits: https://huggingface.co/mlx-community/Qwen3.6-27B-4bit
- Repositorio mmmllm: https://github.com/nvcnvn/mmmllm
- Script de conversión: https://github.com/nvcnvn/mmmllm/blob/main/tools/spec/mtp.py
