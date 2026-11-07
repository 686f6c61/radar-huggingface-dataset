# imowe/mdeberta-v3-ua-squad-reader

## Resumen

`mdeberta-v3-ua-squad-reader` es un modelo de respuesta a preguntas extractiva (question answering) publicado en Hugging Face por el usuario `imowe`. El nombre sugiere un ajuste fino de la familia mDeBERTa-v3 sobre el conjunto de datos SQuAD en ucraniano, si bien la model card no aporta confirmación explícita de esta composición. El repositorio tiene 278.220.290 parámetros según los pesos en safetensors y ocupa 1,1 GB.

Se trata de un modelo encoder-only orientado a la tarea de extracción de respuestas dentro de un contexto: dado un párrafo y una pregunta, devuelve el fragmento del párrafo que responde a la pregunta. Es, por tanto, una pieza de infraestructura para sistemas de búsqueda documental, RAG clásico o asistentes sobre corpus cerrados, no un modelo generativo de propósito general.

La relevancia de esta ficha es limitada en términos de documentación: el autor no ha publicado detalles de entrenamiento, licencia, idiomas ni resultados de evaluación, y el modelo presenta cero descargas y cero likes en el momento de la consulta. Existe además un modelo homónimo publicado bajo la organización `NLPForUA` que parece ser el origen del ajuste fino, aunque no puede confirmarse la relación exacta entre ambos repositorios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer, etiqueta `deberta-v2` en el Hub) |
| Parametros totales | 278.220.290 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los modelos DeBERTa-v2 admiten típicamente 512 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del modelo sugiere ucraniano, sin confirmación en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `deberta-v2` del Hub y el tamaño de los pesos (278 M de parámetros) son consistentes con un mDeBERTa-v3-base, un encoder transformer multilingüe con atención desacoplada y embeddings de posición relativos. El modelo está registrado con la pipeline `question-answering`, lo que implica una cabeza de extracción de span sobre la salida del encoder.

No hay información disponible sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el uso de destilación, ni sobre hiperparámetros o régimen de precisión. La model card es la plantilla automática de Hugging Face sin completar. El nombre del modelo apunta a un ajuste sobre SQuAD en ucraniano, pero este extremo no está documentado por el autor y debe tratarse como una inferencia a partir del identificador.

## Capacidades

- Respuesta a preguntas extractiva: devuelve el span del contexto que responde a una pregunta dada.
- Ajuste aparente sobre corpus en ucraniano (según el identificador del modelo, no confirmado).
- Integración nativa con la librería `transformers` mediante `AutoModelForQuestionAnswering`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del Hub).
- No soporta generación de texto libre, tool calling, agentes, visión ni audio: es un encoder discriminativo.
- No se documentan capacidades multilingües más allá de lo que sugiera el identificador.

## Casos de uso

- Búsqueda documental con extracción de respuestas: dado un corpus de documentos y una consulta del usuario, el modelo localiza el fragmento exacto que responde, lo que permite construir interfaces de búsqueda tipo "respuesta directa" sobre bases documentales cerradas.
- Componente de lectura en un pipeline RAG clásico: un recuperador (BM25 o embeddings) selecciona los pasajes candidatos y este modelo extrae la respuesta concreta, reduciendo el coste frente a un modelo generativo.
- Asistencia sobre normativa y documentación administrativa en ucraniano: extracción de cláusulas concretas de contratos, reglamentos o procedimientos a partir de preguntas en lenguaje natural.
- Preguntas sobre bases de conocimiento internas: atención a empleados o soporte de primer nivel sobre manuales, siempre que el corpus esté en el idioma de entrenamiento.
- Anotación asistida y curación de datasets QA: generación automática de pares pregunta-respuesta sobre textos para revisión humana posterior.
- Evaluación de sistemas de recuperación: uso como lector de referencia para medir si los pasajes recuperados contienen efectivamente la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,1 GB de pesos más activaciones; en fp16 aproximadamente 0,6 GB. Cifras estimadas a partir del número de parámetros, no publicadas por el autor.
- Cabe con holgura en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para servicio de alta concurrencia: T4, L4, A10G o A100, con batching dinámico.
- Opciones de despliegue: `transformers` con pipeline `question-answering`, Text Generation Inference no aplica (no es generativo), vLLM no soporta encoders de este tipo de forma estándar; para CPU puede exportarse a ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imowe/mdeberta-v3-ua-squad-reader | 278 M | no disponible | QA extractiva | no disponible | Hugging Face |
| NLPForUA/mdeberta-v3-ua-squad-reader | no disponible | no disponible | QA extractiva | no disponible | Hugging Face |
| mDeBERTa-v3-base (base multilingüe) | ~278 M | 512 tokens (típico) | encoder general | MIT | Hugging Face (microsoft) |

La comparación con el modelo base de Microsoft es la más informativa: este repositorio parece un ajuste fino del mismo, pero sin documentación que lo confirme ni métricas que permitan cuantificar la mejora. El modelo de `NLPForUA` es el candidato más directo como origen, aunque la relación entre ambos repositorios no está verificada.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, licencia, idiomas ni evaluación.
- La licencia es "no disponible", lo que impide determinar si el uso comercial está permitido; no debe desplegarse en producción sin aclarar este punto.
- El modelo tiene cero descargas y cero likes, sin señales de uso o validación por parte de la comunidad.
- Al ser un modelo extractivo, solo puede devolver fragmentos literales del contexto; no genera respuestas, no razona y no maneja preguntas cuya respuesta no esté en el texto.
- Riesgo de alucinación estructural bajo en el sentido generativo, pero riesgo alto de devolver spans incorrectos cuando el contexto no contiene la respuesta o cuando la pregunta es ambigua.
- Idiomas soportados no documentados; el uso fuera del ucraniano (si ese es efectivamente el idioma de ajuste) producirá resultados degradados.
- Longitud de contexto no confirmada; los encoders DeBERTa-v2 suelen limitarse a 512 tokens, lo que obliga a trocear documentos largos.
- Sin métricas publicadas, no es posible comparar su calidad con alternativas establecidas.
- La fecha de creación del repositorio (2026-11-07) y la ausencia de metadatos sugieren un artefacto poco mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imowe/mdeberta-v3-ua-squad-reader
- Modelo homónimo de NLPForUA: https://huggingface.co/NLPForUA/mdeberta-v3-ua-squad-reader
- Árbol de ficheros del modelo de NLPForUA: https://huggingface.co/NLPForUA/mdeberta-v3-ua-squad-reader/tree/main
- Paper de DeBERTa (referenciado en los tags, arXiv:1910.09700): https://arxiv.org/abs/1910.09700
