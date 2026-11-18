# FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1

## Resumen

FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1 es un ajuste fino supervisado (SFT) del modelo Qwen3-8B, publicado por el usuario FinaPolat en Hugging Face. Por el nombre del repositorio, el entrenamiento se orienta a Gene Ontology (GO) y Knowledge Graph Completion (KGC), es decir, tareas de representación y completado de conocimiento biológico estructurado. El checkpoint corresponde a la epoca 1 de un entrenamiento conjunto ("joint"), lo que sugiere una fase de SFT sobre datos emparejados de ambas tareas.

El modelo conserva la arquitectura y el tamano del Qwen3-8B base, con 8.190.735.360 parametros totales segun los pesos en safetensors, y un repositorio de 16,4 GB. La model card publicada es la plantilla automatica de Hugging Face sin rellenar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. Toda la informacion tecnica adicional debe inferirse del modelo base o marcarse como no disponible.

Su relevancia es acotada: se trata de un checkpoint de investigacion sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin resultados publicados. Resulta util como referencia para quien trabaje en KGC biomedico con modelos de 8B, pero no es un artefacto listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; no confirmada en la model card) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE segun el recuento de parametros) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contextos largos, pero el valor exacto no se documenta aqui) |
| Tipos de cuantizacion | no disponible en la model card; los pesos publicados estan en safetensors (precision original no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de la familia Qwen3. El repositorio no incluye configuracion arquitectonica detallada ni confirmacion de innovaciones del base (atencion, modos de razonamiento, etc.), por lo que esos detalles deben consultarse en la documentacion oficial de Qwen3.

El sufijo del nombre indica un ajuste fino supervisado con objetivo conjunto sobre Gene Ontology y Knowledge Graph Completion, en su primera epoca. No se especifican el volumen de tokens, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros de entrenamiento. La model card es la plantilla automatica y todos los campos de entrenamiento figuran como "[More Information Needed]".

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-8B.
- Especializacion probable en tareas de Gene Ontology y Knowledge Graph Completion, segun el nombre del repositorio; no verificada con evaluacion publicada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Anotacion asistida de terminos GO: el modelo puede proponer anotaciones de funciones moleculares, procesos biologicos y componentes celulares a partir de descripciones de proteinas o genes, dado su ajuste orientado a Gene Ontology.
- Completado de aristas en grafos de conocimiento biomedicos: util para sugerir relaciones candidatas entre entidades (gen, proteina, enfermedad) que luego se validan manualmente.
- Pre-anotacion en pipelines de curacion: generar borradores de tripletas sujeto-predicado-objeto para que revisores humanos los confirmen, reduciendo el coste de la curacion manual.
- Experimentacion academica en KGC: servir como baseline ajustado de 8B para comparar con modelos especializados en enlazado de entidades y prediccion de enlaces.
- Generacion de descripciones textuales de entidades GO: producir texto explicativo a partir de identificadores y relaciones del grafo para documentacion interna.
- Prototipado de asistentes de consulta sobre ontologias: responder preguntas en lenguaje natural sobre relaciones del grafo, siempre con verificacion posterior contra la fuente estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque estas conversiones no estan publicadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con contexto moderado o cuantizacion.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, en GPUs de 12-16 GB; no cabe en GPUs de 8 GB sin cuantizacion severa.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta presente en el repositorio) y endpoints compatibles; vLLM, llama.cpp u Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1 | 8,19 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | ~8 B | no disponible en esta ficha | licencia de Qwen3 (consultar repositorio oficial) | Hugging Face, ampliamente usado |
| Alternativas especializadas en KGC biomedico de 8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- La model card esta sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Riesgo de alucinacion elevado en tareas de KGC: las tripletas generadas deben validarse contra la fuente estructurada antes de su uso.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Idiomas no documentados: el comportamiento fuera del ingles es incierto.
- Checkpoint de una sola epoca de SFT: posible sobreajuste limitado o infraentrenamiento; sin metricas no es verificable.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de calidad.
- Contexto maximo efectivo no documentado: no se debe asumir la ventana del modelo base sin comprobacion empirica.

## Enlaces

- Hugging Face: https://huggingface.co/FinaPolat/Qwen3-8B-GO-KGC-sft-joint-epoch1
- Referencia citada en la model card (calculo de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Modelo base Qwen3-8B (referencia para arquitectura y contexto): no disponible en la informacion proporcionada como enlace directo.
