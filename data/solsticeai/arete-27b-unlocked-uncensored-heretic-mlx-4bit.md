# SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-4Bit

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic-mlx-4Bit es una cuantizacion en 4 bits en formato MLX del modelo SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic, un ajuste fino supervisado (SFT) de la familia Qwen3.5 orientado a alineacion de valores y a la eliminacion de los mecanismos de rechazo del modelo base. El autor, SolsticeAI, lo distribuye bajo licencia Apache 2.0 y lo publica con la libreria mlx-lm (version 0.31.2) para su ejecucion en hardware Apple Silicon.

El modelo cuenta con 26.895.993.856 parametros (aproximadamente 27 mil millones) en precision completa, y esta version cuantizada ocupa 15,2 GB en el repositorio. Se trata de un transformer denso (sin mezcla de expertos) derivado de Qwen3.5, con etiquetas que indican decensored, abliterated y heretic, es decir, que se ha aplicado una tecnica de ablacion o ajuste para reducir las negativas del modelo a peticiones consideradas sensibles.

Es relevante ahora porque combina tres tendencias del ecosistema open source: la cuantizacion 4-bit para inferencia local en Mac, la publicacion de variantes sin censura para investigacion sobre alineacion y seguridad, y el uso de datasets de preferencias como NousResearch/arete-data-pairs. No obstante, la model card es extremadamente escasa: solo documenta el proceso de conversion a MLX y un ejemplo de uso, sin especificaciones de contexto, entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun tag `qwen3_5`) |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras cuantizaciones no documentadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer denso de la familia Qwen3.5, con 26,9 mil millones de parametros. El modelo base SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic se entreno mediante supervised fine-tuning sobre el dataset NousResearch/arete-data-pairs, segun las etiquetas del repositorio, con un enfoque declarado de value-alignment. Ademas, las etiquetas heretic, uncensored, decensored y abliterated sugieren que se aplico una tecnica de ablacion de direcciones de rechazo o un ajuste especifico para eliminar comportamientos de negativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card unicamente documenta la conversion a MLX con mlx-lm 0.31.2 y un ejemplo de inferencia en Python; no detalla el proceso de cuantizacion mas alla de indicar que es 4-bit.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento y respuesta a instrucciones, heredado del ajuste fino supervisado sobre el modelo base Qwen3.5.
- Comportamiento sin censura declarado: el modelo esta disenado para no rechazar peticiones que el modelo base rechazaria, segun las etiquetas `uncensored`, `decensored` y `abliterated`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el campo de idiomas figura como no disponible).
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de rechazos comparando sus respuestas con las del modelo base Qwen3.5, en entornos controlados y con supervision humana.
- Evaluacion de robustez de filtros: util para probar sistemas de moderacion y clasificadores de contenido frente a un modelo que, por diseno, no aplica negativas, midiendo la eficacia de las capas de seguridad externas.
- Inferencia local en Apple Silicon: gracias al formato MLX 4-bit y sus 15,2 GB, puede ejecutarse en Macs con memoria unificada suficiente mediante mlx-lm, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales: la plantilla de chat y el pipeline text-generation permiten integrarlo rapidamente en aplicaciones de dialogo para pruebas internas.
- Generacion creativa sin restricciones de estilo: escritura de ficcion o guiones donde el autor necesita un modelo que no introduzca negativas editoriales, siempre con revision posterior.
- Experimentos de destilacion y evaluacion comparativa: sirve como modelo de referencia en estudios que comparan variantes censuradas y no censuradas sobre el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 15,2 GB en cuantizacion 4-bit, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, mas el overhead del runtime y del contexto.
- GPU recomendadas: al ser un formato MLX, esta pensado para Apple Silicon (series M1, M2, M3, M4 y superiores con memoria unificada de 16 GB o mas; 24 GB o mas recomendable para contextos largos).
- Cabe en GPU consumer: si, en Macs con memoria unificada suficiente; en GPUs NVIDIA consumer no es el formato nativo y requeriria conversion a otro runtime.
- Opciones de despliegue: mlx-lm (libreria nativa del formato); para otros entornos seria necesario convertir los pesos a GGUF, safetensors estandar u otros formatos, no documentado en la model card.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-Unlocked-Uncensored-Heretic-mlx-4Bit | ~26,9 mil millones | No disponible | MLX 4-bit | Apache 2.0 | Variante sin censura, solo Apple Silicon |
| Modelo base SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic | ~26,9 mil millones | No disponible | safetensors | Apache 2.0 | Precision completa, mismo comportamiento |
| Qwen3.5 (familia base) | Variable | No disponible | Multiples | No disponible | Modelo original con alineacion estandar |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo explicitamente sin censura: puede generar contenido ofensivo, ilegal o peligroso; no es apto para produccion sin capas de moderacion externas.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la falta de benchmarks publicados.
- La model card no documenta sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- Formato MLX exclusivo: no es directamente desplegable en vLLM, TGI, llama.cpp u Ollama sin conversion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria ni reportes de calidad.
- La fecha de creacion indicada (2026-11-12) es posterior a la de esta ficha, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-4Bit
- Modelo base: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
