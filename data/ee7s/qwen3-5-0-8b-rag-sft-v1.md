# ee7s/qwen3.5-0.8b-rag-sft-v1

## Resumen

qwen3.5-0.8b-rag-sft-v1 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario ee7s en Hugging Face. El modelo base es un transformer multimodal de tipo image-text-to-text de aproximadamente 0,9 mil millones de parámetros, y este derivado está especializado en tareas de generación aumentada por recuperación (RAG) sobre contenido de Wikipedia en japonés. El repositorio contiene 752.393.024 parámetros en formato safetensors, lo que confirma que se trata de un modelo compacto orientado a despliegue ligero.

El problema que aborda es concreto: adaptar un modelo pequeño y multimodal a responder preguntas apoyándose en fragmentos de contexto recuperados, en lugar de depender únicamente de su conocimiento paramétrico. Para ello, el autor ha entrenado sobre tres fuentes de datos vinculadas a la Wikipedia japonesa: JEMHopQA, JSQuAD (parte de JGLUE) y un conjunto de chunks derivado de Wikipedia en japonés. Esto lo hace relevante para quienes necesitan un modelo de RAG de bajo coste computacional y dominio japonés, aunque con un alcance de uso muy específico y sin métricas publicadas.

La relevancia práctica del modelo es limitada pero clara: es un artefacto de investigación o de nicho, con solo 8 descargas y sin likes en el momento de la consulta, y sin model card que documente hiperparámetros, número de tokens de entrenamiento ni evaluación. No debe confundirse con el modelo base oficial de Qwen, que tiene su propia licencia (Apache-2.0) y sus propias capacidades documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5_text`; el modelo base es image-text-to-text) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantización a Q8 según referencia de llamafile) |
| Idiomas soportados | no disponible oficialmente; los datos de entrenamiento son en japonés (Wikipedia japonesa, JEMHopQA, JSQuAD) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, un transformer multimodal de tipo image-text-to-text. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa). El tag `qwen3_5_text` sugiere que el pipeline de este derivado se orienta a texto, aunque el modelo base soporta entrada de imagen y texto.

El entrenamiento es un SFT (supervised fine-tuning) sobre tres conjuntos de datos, todos ellos con licencia CC BY-SA 4.0 y modificados mecánicamente por el autor (filtrado y reformateo para entrenamiento RAG): JEMHopQA (preguntas de múltiples saltos), JSQuAD/JGLUE (comprensión lectora en japonés) y un conjunto de chunks derivado de Wikipedia japonesa (`bumbuboon/llm-course-final-2026`). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni los hiperparámetros (learning rate, épocas, batch size). Tampoco se documenta si se congelaron capas o si se entrenó el modelo completo.

## Capacidades

- Generación de texto y respuesta a preguntas basada en contexto recuperado (RAG) sobre Wikipedia en japonés.
- Comprensión lectora y razonamiento de múltiples saltos, derivado del entrenamiento con JEMHopQA.
- Procesamiento de entrada multimodal heredado del modelo base (image-text-to-text), aunque el ajuste se centra en texto.
- Capacidad multilingüe no documentada; el entrenamiento se orienta al japonés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el multi-hop de JEMHopQA es el indicio más cercano.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa: el modelo está entrenado sobre chunks de Wikipedia y pares pregunta-respuesta en japonés, por lo que puede integrarse en un pipeline RAG que recupere fragmentos y genere respuestas citando el contexto.
- Comprensión lectora en japonés: útil para tareas de extracción de respuestas a partir de pasajes, gracias al ajuste con JSQuAD.
- Preguntas de múltiples saltos: el entrenamiento con JEMHopQA lo hace adecuado para consultas que requieren combinar información de varios documentos.
- Prototipado de asistentes documentales de bajo coste: con 752 millones de parámetros, puede ejecutarse en hardware modesto para validar arquitecturas RAG antes de escalar a modelos mayores.
- Investigación sobre ajuste fino de modelos pequeños: sirve como referencia para estudiar cómo un SFT sobre datos de RAG afecta a un modelo base de 0,8B.
- Despliegue en entornos con recursos limitados: su tamaño permite inferencia en CPU o GPU de gama baja (el modelo base Qwen3.5 0.8B en Q8 genera ~8 tokens/s en una Raspberry Pi 5, según la documentación de llamafile).
- Evaluación comparativa de estrategias de recuperación: al estar especializado en RAG, puede usarse como componente generador fijo mientras se varía el recuperador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 752 millones de parámetros en fp16 ocupan aproximadamente 1,5 GB de pesos; en int8, unos 0,75 GB; en int4, unos 0,4 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no proceden de la documentación del modelo.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores; no se requiere A100 ni H100.
- ¿Cabe en consumer GPU? Sí, por el número de parámetros, aunque no hay confirmación oficial del autor.
- Opciones de despliegue: no documentadas para este derivado. El ecosistema del modelo base incluye llamafile (con soporte para Qwen3.5 0.8B Q8); para este fine-tune habría que convertir los pesos safetensors a GGUF u otro formato.
- Latencia y throughput: no disponibles para este modelo. Como referencia del modelo base, Qwen3.5 0.8B Q8 genera ~8 tokens/s en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ee7s/qwen3.5-0.8b-rag-sft-v1 | 752.393.024 | no disponible | cc-by-sa-4.0 | Hugging Face (8 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,9B | no disponible | Apache-2.0 | Hugging Face, llamafile |
| Alternativas de ~0,8B para RAG | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre otros modelos comparables de la misma categoría (RAG en japonés, ~0,8B) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre Wikipedia japonesa, puede heredar sesgos de cobertura y sesgos culturales de esa fuente.
- Riesgo de alucinación: presente, como en cualquier modelo de 0,8B; el ajuste RAG no elimina la generación de contenido no fundamentado, y no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el entrenamiento se centra en japonés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Restricciones de licencia: CC BY-SA 4.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con usos comerciales que requieran licencias permisivas. El modelo base es Apache-2.0, pero este derivado cambia a CC BY-SA 4.0.
- Caveats para producción: solo 8 descargas y 0 likes; ausencia de model card detallada (hiperparámetros, evaluación, limitaciones); no hay pipeline declarado ni idiomas declarados; el autor no documenta el proceso de conversión ni formatos alternativos (GGUF, etc.).
- Trazabilidad de datos: los conjuntos de entrenamiento son CC BY-SA 4.0 y fueron modificados mecánicamente; conviene conservar la atribución exigida por la licencia en cualquier redistribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ee7s/qwen3.5-0.8b-rag-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Documentación de llamafile (referencia del modelo base): https://docs.mozilla.ai/llamafile/getting-started/pre-built-llamafiles
