# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-raft

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-raft` es un adaptador LoRA (librería `peft`) entrenado sobre el modelo base `google/gemma-2-2b`. No se distribuye como modelo autónomo: el repositorio, de unos 0,1 GB, contiene únicamente los pesos del adaptador en formato safetensors, por lo que su uso exige descargar previamente el modelo base y cargarlo con PEFT. El autor es la organización `praiselab-picuslab` y el artefacto forma parte de una familia de experimentos etiquetada como `benchmark-slm` (benchmark de modelos de lenguaje pequeños).

El fine-tuning se ha realizado sobre el conjunto de datos `microsoft/ms_marco`, un corpus de búsqueda y respuesta sobre pasajes web en inglés, aplicando la estrategia `raft` (Retrieval-Augmented Fine-Tuning). Esta técnica entrena al modelo con documentos recuperados que incluyen tanto pasajes relevantes como distractores, con el objetivo de que aprenda a responder citando la evidencia correcta e ignorando el ruido del contexto recuperado. El tag `or2` no está documentado en la información disponible.

Su relevancia es acotada y experimental: se publicó el 23 de octubre de 2026, acumula 0 descargas y 0 «likes», el acceso está restringido (gated) y no se ha publicado ficha técnica, licencia ni evaluación de resultados. Es un artefacto útil para reproducir experimentos de RAG sobre modelos pequeños, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptadores LoRA (PEFT) sobre `google/gemma-2-2b` |
| Parametros totales | No disponible para el adaptador (el repositorio ocupa ~0,1 GB en safetensors); el modelo base Gemma 2 2B tiene 2,6 mil millones de parametros segun su ficha publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base (8.192 tokens segun la documentacion publica de Gemma 2 2B) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene adaptadores sin cuantizar. La cuantizacion (GGUF, AWQ, bitsandbytes) se aplicaria al modelo base, no a este repo |
| Idiomas soportados | Ingles (`en` segun los tags); el modelo base es multilingue, pero el fine-tuning se limita a MS MARCO en ingles |
| Licencia | No disponible en la ficha. El modelo base esta sujeto a los Gemma Terms of Use, que condicionan el uso comercial |
| Formato de pesos | `safetensors` (adaptadores LoRA en formato PEFT) |
| Tipo de artefacto | Adaptador, no modelo autonomo: requiere `google/gemma-2-2b` |
| Dataset de entrenamiento | `microsoft/ms_marco` |
| Estrategia de entrenamiento | RAFT (Retrieval-Augmented Fine-Tuning) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de matrices de bajo rango (LoRA) inyectadas en las capas del transformer decoder-only de Gemma 2 2B. No se especifican en la información disponible el rango (`r`), el valor de `alpha`, las capas objetivo (`target_modules`), la tasa de aprendizaje ni el número de pasos o de tokens de entrenamiento. Tampoco se documenta si hubo fases posteriores de alineación (RLHF, DPO) específicas para el adaptador; el modelo base Gemma 2 2B sí incorpora alineación por instrucciones en su entrenamiento original.

La innovación metodológica declarada es la estrategia RAFT: en cada ejemplo de entrenamiento se concatenan pasajes recuperados del corpus MS MARCO, mezclando documentos relevantes con distractores, y se entrena al modelo para generar la respuesta citando el fragmento correcto. Esto persigue dos objetivos: mejorar la fidelidad al contexto recuperado y enseñar al modelo a descartar pasajes irrelevantes, algo habitual en pipelines RAG reales. El conjunto MS MARCO aporta consultas reales de motores de búsqueda con pasajes web en inglés, lo que orienta el adaptador a tareas de question answering extractivo y generativo sobre evidencia documental.

## Capacidades

- Generación de texto en inglés condicionada a contexto recuperado (estilo RAG).
- Question answering sobre pasajes: responder preguntas a partir de documentos proporcionados en el prompt.
- Discriminación de distractores: la estrategia RAFT entrena explícitamente la ignorancia de pasajes irrelevantes.
- Citación de evidencia: la formulación RAFT favorece respuestas apoyadas en el fragmento correcto (no verificable sin evaluación publicada).
- Especialización de dominio: consultas y pasajes de tipo web/búsqueda, propios de MS MARCO.
- No hay soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking).
- Capacidad multilingüe: no documentada para el adaptador; el fine-tuning es monolingüe en inglés.
- Al ser un adaptador, puede combinarse con el modelo base y con otros adaptadores LoRA compatibles mediante PEFT o vLLM, aunque esta composición no está evaluada.

## Casos de uso

- Prototipado de pipelines RAG en inglés: cargar el adaptador sobre Gemma 2 2B y conectarlo a un retriever (por ejemplo, BM25 o un índice vectorial) para responder preguntas sobre documentación interna, aprovechando el entrenamiento con distractores.
- Evaluación comparativa de estrategias de fine-tuning: sirve como rama experimental «RAFT» frente a un fine-tuning supervisado clásico dentro de un benchmark de modelos pequeños, ya que el autor lo etiqueta explícitamente como `benchmark-slm`.
- Reproducción académica de RAFT: útil para investigadores que quieran replicar el efecto de mezclar documentos relevantes y distractores en modelos de 2-3 mil millones de parámetros con recursos limitados.
- Respuesta sobre bases documentales de tamaño medio: con 8.192 tokens de contexto del modelo base, permite inyectar varios pasajes por consulta en escenarios de soporte interno o FAQ técnica.
- Filtrado y reranking de pasajes: el adaptador puede emplearse para generar respuestas de verificación que indiquen qué pasaje sostiene una afirmación, como paso previo a un sistema de atribución de fuentes.
- Experimentación docente y de bajo coste: al requerir solo ~0,1 GB de adaptador y un modelo base de 2,6B, se puede ejecutar en una GPU de consumo para prácticas de ajuste fino y evaluación de RAG.
- Investigación sobre calibración y alucinación: útil para estudiar si el entrenamiento con distractores reduce las respuestas no fundamentadas en modelos pequeños, siempre que se realice una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye métricas de MS MARCO (MRR@10, Recall@k, EM/F1), ni evaluaciones de MMLU, HumanEval o GSM8K para este adaptador, y tampoco se aportan comparaciones con la versión sin ajustar del modelo base.

## Requisitos de hardware

- Los pesos del adaptador ocupan ~0,1 GB; el requisito real lo determina el modelo base `google/gemma-2-2b` (2,6B parámetros).
- VRAM estimada para el modelo base (cálculo a partir del número de parámetros, no medición publicada): ~6-8 GB en FP16, ~3-4 GB en INT8, ~2-3 GB en 4-bit, en todos los casos con margen para la caché KV según la longitud de contexto.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en FP16 sin problemas; en 4-bit puede ejecutarse en GPU de 8 GB.
- GPU de datacenter (A100 40/80 GB, H100) solo justificables para servir muchas peticiones concurrentes o contextos largos con batching.
- Despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten múltiples adaptadores LoRA sobre un mismo modelo base; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base (`merge_and_unload`) y convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.
- Requisito adicional: el repositorio es de acceso restringido, por lo que es necesario aceptar las condiciones en HuggingFace y autenticarse con un token antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (RAFT sobre Gemma 2 2B) | Adaptador LoRA, tamano no disponible (repo 0,1 GB) | No disponible (heredado del base: 8.192 tokens) | Adaptador PEFT para QA sobre pasajes en ingles | No disponible; sujeto a Gemma Terms of Use por el base | Gated, 0 descargas |
| `google/gemma-2-2b` (base) | 2,6 mil millones | 8.192 tokens | Modelo completo, proposito general, multilingue | Gemma Terms of Use | Publico tras aceptar condiciones |
| Otros adaptadores RAFT sobre modelos pequenos | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

La comparación relevante es contra el modelo base sin ajustar: este adaptador no cambia el tamaño ni el contexto, solo especializa el comportamiento hacia QA sobre pasajes recuperados en inglés, a costa de un posible deterioro en capacidades generales y multilingües que no ha sido cuantificado.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base `google/gemma-2-2b` los pesos del adaptador son inutilizables.
- Licencia no declarada en la ficha y acceso restringido: la ambigüedad jurídica, sumada a los Gemma Terms of Use del modelo base, exige revisión legal antes de cualquier uso comercial.
- Idiomas: entrenado sobre MS MARCO en inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior al del modelo base.
- Sesgos: MS MARCO procede de consultas y pasajes web reales, por lo que puede arrastrar sesgos de dominio, de fuentes y de representación de la web angloparlante; no se ha publicado ninguna auditoría.
- Riesgo de alucinación: el ajuste con distractores no garantiza fidelidad; un modelo de 2,6B puede generar respuestas no sustentadas por el contexto, y no hay evaluación que mida la tasa de atribución correcta.
- Sin métricas: no existen resultados publicados de MRR, Recall, EM ni F1, ni comparación con la línea base, por lo que no se puede afirmar que el ajuste mejore al modelo original.
- Madurez: 0 descargas y 0 «likes», publicado el 23 de octubre de 2026; es un artefacto de investigación sin validación externa.
- Artefacto de benchmark: la nomenclatura `benchmark-slm` sugiere que forma parte de un conjunto de experimentos comparativos y no de una versión estable mantenida.
- Producción: sin información sobre hiperparámetros de entrenamiento, datos exactos, ni pruebas de robustez, no se recomienda su uso en sistemas en producción sin una evaluación propia y un plan de mitigación de alucinaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-raft
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/microsoft/ms_marco
- Paper de referencia de la estrategia RAFT (enlace externo, no incluido en la ficha de HuggingFace): https://arxiv.org/abs/2404.16811
