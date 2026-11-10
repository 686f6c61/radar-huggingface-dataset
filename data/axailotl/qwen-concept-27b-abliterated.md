# axAilotl/qwen-concept-27b-abliterated

## Resumen

Qwen Concept 27B Abliterated es una edición compuesta de pesos publicada por el usuario axAilotl en Hugging Face. Se construye combinando dos linajes: por un lado, una edición de concepto sobre Qwen3.8-27B (etiquetada como "Qwen Concept 27B", de ConceptCountry) en la que se reescribieron nueve matrices `mlp.down_proj` mediante programación en espacio de pesos para reducir el modo de razonamiento extendido; por otro, la versión abliterada de huihui-ai (Huihui-Qwen3.8-27B-abliterated), a la que se le ha eliminado la dirección de rechazo siguiendo el enfoque de Arditi et al. (2024).

El resultado es un modelo de 27B con atención híbrida y capacidades de visión-lenguaje (VLM) que, según el autor, "piensa menos y rechaza menos". El objetivo declarado son cargas de trabajo de investigación en ingeniería inversa y preservación de software. La edición de concepto se conserva íntegra (las nueve matrices editadas se trasplantan literalmente desde el modelo upstream), mientras que el resto de pesos proviene de la base abliterada.

El repositorio incluye pesos en bf16, FP8-E4M3 blockwise y una escalera completa de cuantizaciones GGUF con recetas Unsloth Dynamic v3.0, además del proyector visual en F16. La licencia es Apache-2.0, heredada de Qwen3.8-27B y de los repositorios upstream. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (VLM, según model card); detalles de capas y atención no disponibles |
| Parametros totales | 460.730.096 según safetensors del repo; la model card y el nombre indican 27B (discrepancia no resuelta en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, FP8-E4M3 blockwise (bloque 128), GGUF BF16, Q8_0, UD-Q6_K_XL (7.40 bpw), UD-Q5_K_XL (6.11 bpw), UD-Q4_K_XL (5.14 bpw), UD-Q3_K_XL (3.85 bpw), UD-Q2_K_XL (2.87 bpw); NVFP4 no incluido |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), FP8, GGUF (múltiples cuantizaciones) y mmproj F16 para visión |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLM de 27B con atención híbrida, pero no detalla la configuración de capas, el mecanismo exacto de atención ni la composición del dataset de entrenamiento original. Lo que sí se documenta es el proceso de edición: nueve matrices `mlp.down_proj` (capas 32–48, según el `EDIT_SPEC.json` del repositorio upstream) fueron reescritas mediante programación en espacio de pesos para suprimir el comportamiento de razonamiento extendido, y posteriormente trasplantadas de forma literal a la base abliterada de huihui-ai.

La componente de abliteración sigue el método de Arditi et al. (2024): se elimina la dirección de rechazo del espacio de activaciones. El autor advierte de un compromiso conocido: las nueve matrices trasplantadas conservan sus pesos originales sin abliterar, por lo que persiste una superficie de rechazo residual a través de 9 de aproximadamente 128 escritores residuales. No se menciona RLHF, DPO ni datos de entrenamiento adicionales; la edición es puramente post-hoc sobre pesos.

Las cuantizaciones GGUF UD replican las recetas por tensor de Unsloth Dynamic v3.0, partiendo de bf16 en un solo salto, con una matriz de importancia recalculada sobre estos pesos concretos usando 2,8 millones de tokens de calibración con plantilla de chat. Se conservan los pesos MTP para decodificación especulativa en llama.cpp. No hay QAT ni QAD: es PTQ puro.

## Capacidades

- Generación de texto y razonamiento, con el modo de razonamiento extendido suprimido por la edición de concepto (el autor indica que "piensa menos").
- Procesamiento de visión-lenguaje, al incluir proyector visual (`mmproj-F16.gguf`, ~0,9 GB) y estar descrito como VLM.
- Comportamiento abliterado: se ha eliminado la dirección de rechazo, con superficie residual limitada según el autor.
- Decodificación especulativa en llama.cpp gracias a la retención de los pesos MTP.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en ingeniería inversa de software: el autor declara explícitamente este uso; el modelo, con el modo de razonamiento suprimido y el rechazo atenuado, está pensado para analizar binarios, reconstruir lógica y documentar comportamiento de software en entornos controlados.
- Preservación de software legacy: uso del modelo para generar documentación, explicar código antiguo y asistir en la migración de sistemas cuyo código original ya no está mantenido, aprovechando la ventana de contexto del modelo base (no cuantificada en la información disponible).
- Investigación en seguridad ofensiva y defensiva: análisis de vulnerabilidades, revisión de código sospechoso y estudio de técnicas de explotación en laboratorios aislados, dado el perfil abliterado del modelo.
- Análisis de imágenes técnicas: al ser un VLM con proyector visual, puede emplearse para interpretar capturas de pantalla, diagramas de arquitectura o interfaces de usuario y generar descripciones o código a partir de ellas.
- Despliegue local en hardware de consumo: las cuantizaciones UD-Q4_K_XL (~17,6 GB) y UD-Q3_K_XL (~13,1 GB) permiten ejecutar el modelo en GPUs de consumo con 16–24 GB de VRAM mediante llama.cpp u Ollama, útil para investigación con datos sensibles que no pueden salir de la máquina.
- Estudio de alineación y seguridad: el modelo sirve como caso de estudio para medir la eficacia de la abliteración y de las ediciones en espacio de pesos, comparando su comportamiento con el modelo base sin editar.
- Generación de código asistida en pipelines internos: con los pesos en FP8 (~28 GB) o Q8_0 (~29 GB) puede servirse en vLLM o TGI en una GPU de 40–80 GB para tareas de autocompletado y refactorización en entornos de desarrollo internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; solo afirma de forma cualitativa que la edición de concepto hace que el modelo "puntúe más alto", sin cifras que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de archivo publicados): ~52 GB en bf16, ~28 GB en FP8-E4M3, ~29 GB en GGUF Q8_0, ~25,3 GB en UD-Q6_K_XL, ~20,9 GB en UD-Q5_K_XL, ~17,6 GB en UD-Q4_K_XL, ~13,1 GB en UD-Q3_K_XL y ~9,8 GB en UD-Q2_K_XL. Añadir ~0,9 GB del proyector visual si se usa visión.
- GPU recomendadas: A100 80 GB o H100 para bf16; A100 40 GB, L40S o RTX 6000 Ada para FP8/Q8_0; RTX 4090 (24 GB) para UD-Q5_K_XL o UD-Q4_K_XL.
- GPU de consumo: sí cabe. RTX 4090/3090 (24 GB) con UD-Q5_K_XL o UD-Q4_K_XL; RTX 4080/4070 Ti Super (16 GB) con UD-Q4_K_XL ajustado o UD-Q3_K_XL; GPUs de 12 GB con UD-Q2_K_XL (~9,8 GB).
- Opciones de despliegue: llama.cpp y Ollama para los GGUF (con soporte de decodificación especulativa vía pesos MTP); vLLM o TGI para safetensors bf16/FP8. El autor no documenta configuraciones específicas de servido.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| axAilotl/qwen-concept-27b-abliterated | 27B (según nombre; 460,7M según safetensors) | no disponible | Apache-2.0 | Edición compuesta: concepto + abliteración; VLM; GGUF UD completos |
| ConceptCountry/qwen-concept-27b | 27B | no disponible | no disponible | Base de la edición de concepto; sin abliterar |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | Base abliterada; sin edición de concepto |
| Qwen3.8-27B (upstream) | 27B | no disponible | Apache-2.0 (heredada) | Modelo original sin ediciones |

La comparación con alternativas de otros linajes (por ejemplo, Llama o Mistral de tamaño similar) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento ni especificaciones de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Discrepancia de parámetros: el nombre y la model card indican 27B, pero el recuento de safetensors del repositorio es de 460.730.096 parámetros. Esta inconsistencia no está explicada y debe verificarse antes de cualquier uso en producción.
- Superficie de rechazo residual: las nueve matrices `mlp.down_proj` trasplantadas conservan sus pesos sin abliterar, por lo que el modelo puede seguir rechazando ciertas peticiones a través de 9 de ~128 escritores residuales.
- Eliminación de salvaguardas: la abliteración suprime los mecanismos de seguridad del modelo base. El autor restringe el uso a investigación lícita y declara que el usuario es el único responsable de las salidas.
- Riesgo de alucinación: no cuantificado en la información disponible; la supresión del modo de razonamiento puede reducir la calidad en tareas que se benefician de cadenas de pensamiento largas.
- Idiomas y contexto: no se documentan ni la lista de idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en entornos multilingües o con documentos largos.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia externa de calidad ni de reproducibilidad de las afirmaciones del autor.
- Licencia: Apache-2.0 permite uso comercial, pero las condiciones de los repositorios upstream (ConceptCountry) no están detalladas en la información disponible y conviene verificarlas antes de redistribuir.
- Calidad de las cuantizaciones de baja precisión: las variantes UD-Q2_K_XL y UD-Q3_K_XL, aunque usan recetas dinámicas con matriz de importancia, degradan inevitablemente el rendimiento; no se han publicado evaluaciones de su impacto.

## Enlaces

- [Hugging Face: axAilotl/qwen-concept-27b-abliterated](https://huggingface.co/axAilotl/qwen-concept-27b-abliterated)
- [Modelo base de concepto: ConceptCountry/qwen-concept-27b](https://huggingface.co/ConceptCountry/qwen-concept-27b)
- [Modelo base abliterado: huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Recetas GGUF de referencia: unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- Referencia metodológica de abliteración: Arditi et al., 2024 (paper no enlazado en la información disponible)
