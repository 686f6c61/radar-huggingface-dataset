# satoyutaka/qwen35-08b-rag-dpo-d2

## Resumen

`satoyutaka/qwen35-08b-rag-dpo-d2` es un ajuste fino del modelo `satoyutaka/qwen35-08b-rag-jem-sft1`, a su vez derivado de la familia Qwen 3.5. El autor, satoyutaka, lo ha entrenado mediante DPO (Direct Preference Optimization) con LoRA de rango 16 y alpha 32, fusionada posteriormente en los pesos finales. El objetivo declarado es mejorar el comportamiento del modelo en tareas de generación aumentada por recuperación (RAG), en concreto en la citación correcta de fragmentos recuperados.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones), lo que lo sitúa en la gama de modelos pequenos aptos para despliegue en hardware modesto. El repositorio ocupa 1,8 GB en formato safetensors y no registra descargas ni interacciones en el momento de la consulta, lo que indica que se trata de un experimento de investigación reciente y poco difundido.

Su relevancia radica en el enfoque: un ajuste DPO específico para RAG sobre datos japoneses (JEMHopQA, auto-wiki-qa, JSQuAD y JaQuAD), orientado a que el modelo cite el `chunk_id` correcto. Es un caso de estudio útil para quienes trabajan en sistemas RAG con verificación de fuentes, aunque su naturaleza experimental y la ausencia de benchmarks publicados limitan su uso en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, segun tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar publicados) |
| Idiomas soportados | no disponible (los datasets de entrenamiento son en japones) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5, un transformer decoder-only, segun la etiqueta `qwen3_5` del repositorio. El modelo parte de `satoyutaka/qwen35-08b-rag-jem-sft1`, un ajuste supervisado previo del mismo autor, y sobre él se aplica un entrenamiento DPO con LoRA de rango 16 y alpha 32, cuyos adaptadores se fusionan en los pesos finales. El entrenamiento DPO emplea 801 pares de preferencia y aproximadamente 100 pasos.

Los pares de preferencia se componen de 534 ejemplos generados por el propio modelo y 267 construidos mecánicamente sustituyendo el `chunk_id` citado. Los datos de entrenamiento, que incluyen los del modelo base, provienen de JEMHopQA (`aiishii/JEMHopQA`, CC BY-SA 4.0), auto-wiki-qa (`cl-nagoya/auto-wiki-qa`, CC BY-SA 4.0), JSQuAD (`yahoojapan/JGLUE`, CC BY-SA 4.0) y JaQuAD (`SkelterLabsInc/JaQuAD`, CC BY-SA 3.0). No se especifican el número de tokens de entrenamiento ni detalles sobre la composición exacta del dataset más allá de estas fuentes.

## Capacidades

- Generación de texto y respuesta a preguntas en el marco de sistemas RAG, con énfasis en la citación de fragmentos recuperados mediante `chunk_id`.
- Alineamiento de preferencias orientado a reducir citas incorrectas, gracias al entrenamiento DPO con pares negativos generados por sustitución mecánica de identificadores.
- Procesamiento de contenido en japonés, dado que todos los datasets de entrenamiento son en esa lengua.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; no hay información que confirme soporte fuera del japonés.

## Casos de uso

- Respuesta a preguntas sobre documentación japonesa con verificación de fuentes: el modelo puede integrarse en un pipeline RAG donde, tras recuperar fragmentos, genere la respuesta citando el `chunk_id` correspondiente, que es precisamente la habilidad que el DPO busca reforzar.
- Auditoría de sistemas RAG: al estar entrenado para no sustituir citas incorrectas, puede emplearse como componente de referencia para comparar la calidad de citación de otros modelos en el mismo pipeline.
- Prototipado de asistentes documentales en japonés: su tamano de 0,87 mil millones de parámetros permite desplegarlo en una sola GPU consumer para pruebas de concepto sin gran inversión.
- Investigación sobre DPO aplicado a RAG: el repositorio documenta la composición exacta de los pares de preferencia (534 autogenerados y 267 mecánicos), lo que lo convierte en un caso reproducible para estudiar el efecto del DPO en la fidelidad de citas.
- Evaluación de alineamiento en dominios especializados: útil para experimentos que midan cómo un ajuste DPO pequeno (801 pares, 100 pasos) afecta al comportamiento de citación frente al modelo SFT base.
- Filtrado de respuestas en pipelines de generación: puede usarse como modelo auxiliar que valide si una cita propuesta por un modelo mayor coincide con el fragmento recuperado, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe holgadamente en GPUs consumer modernas.
- Despliegue: compatible con llama.cpp, Ollama y vLLM siempre que se genere una versión GGUF o se confirme el soporte de la arquitectura `qwen3_5` en dichas herramientas; no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-dpo-d2 | 873 M | no disponible | other | RAG con citación (japonés), DPO |
| satoyutaka/qwen35-08b-rag-jem-sft1 | no disponible | no disponible | no disponible | SFT base del anterior para RAG |
| Qwen 3.5 (modelo base de la familia) | no disponible | no disponible | no disponible | Modelo generalista |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparación se limita a parámetros, linaje y enfoque de entrenamiento.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y sin benchmarks publicados; no hay evidencia cuantitativa de su calidad frente al modelo SFT base ni frente a alternativas.
- Entrenado exclusivamente con datos en japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- El DPO se realizó con solo 801 pares y unos 100 pasos, un volumen reducido que puede provocar sobreajuste a los formatos de citación de los datasets empleados.
- Riesgo de alucinación inherente a los modelos de 0,87 mil millones de parámetros, especialmente en preguntas que requieran conocimiento factual fuera del contexto recuperado.
- La licencia es "other", sin texto de licencia incluido en la información disponible; es imprescindible verificar las condiciones antes de cualquier uso comercial.
- Los datasets de entrenamiento tienen licencias CC BY-SA 4.0 y CC BY-SA 3.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad con el uso previsto.
- No se documentan sesgos específicos, pero los datos japoneses de Wikipedia y QA pueden introducir sesgos propios de esas fuentes.
- La ausencia de información sobre longitud de contexto impide garantizar su uso en pipelines RAG con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-dpo-d2
- Modelo base (SFT): https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-sft1
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
