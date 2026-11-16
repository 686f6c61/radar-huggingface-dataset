# 123sg/LegalLM-Release-20261116

## Resumen

LegalLM-8B es un modelo de lenguaje de 8.000 millones de parametros especializado en dominio juridico, desarrollado por el usuario 123sg y publicado en Hugging Face bajo el identificador `123sg/LegalLM-Release-20261116`. Segun la model card, se trata de un ajuste por continuacion (continued pretraining o fine-tuning) a partir de un modelo base abierto, entrenado sobre estatutos, jurisprudencia y guias regulatorias. La release incluye diez checkpoints completos y el conjunto de evaluacion del run de adaptacion legal de 2026.

El modelo se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales, y esta empaquetado para la libreria `transformers` con pesos en formato PyTorch. La model card declara compatibilidad con text-generation-inference y endpoints compatibles, lo que facilita su despliegue en infraestructura estandar de inferencia.

La relevancia del modelo radica en su enfoque vertical: en lugar de competir en capacidades generales, apunta a tareas de razonamiento juridico, recuperacion de conocimiento normativo y comprension lectora de textos legales. No obstante, el repositorio tiene un tamano de 0,0 GB en el momento de la consulta y cero descargas, lo que sugiere que los pesos podrian no estar efectivamente subidos o que la release esta incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tags) |
| Parametros totales | 8B (aproximadamente 8.000 millones, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors no confirmado; repo de 0,0 GB) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un transformer de la familia Llama (tag `llama`), con 8.000 millones de parametros, obtenido por continuacion de un modelo base abierto sobre un corpus de estatutos, jurisprudencia y guias regulatorias. No se especifica el modelo base concreto, el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se detalla la longitud de contexto nativa ni si se extendio durante el ajuste.

La release incluye diez checkpoints completos (configuracion mas pesos) y un harness de evaluacion en `evaluation/eval.py` que reporta la precision global por checkpoint, con puntos de entrada por categoria en `evaluation/benchmarks/`. La model card menciona figuras en `figures/` (fig1.png y otras dos no identificadas) que no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto en dominio juridico: redaccion y continuacion de textos legales, clausulas y documentos normativos.
- Razonamiento matematico y logico declarado en la tabla de evaluacion (categorias "Math Reasoning" y "Logical Reasoning").
- Comprension lectora y question answering sobre textos normativos y jurisprudencia.
- Clasificacion de texto y analisis de sentimiento en contextos legales.
- Resumen de documentos (categoria "Summarization" evaluada).
- Traduccion (categoria "Translation" evaluada).
- Recuperacion de conocimiento (categoria "Knowledge Retrieval" evaluada).
- Seguimiento de instrucciones (categoria "Instruction Following" evaluada).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o multi-step reasoning: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponible en la informacion.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- **Revision de contratos y clausulas**: el modelo puede analizar borradores de contratos y senalar clausulas potencialmente problematicas, apoyandose en su ajuste sobre estatutos y jurisprudencia. Adecuado por su especializacion en lenguaje juridico formal.
- **Asistencia en investigacion jurisprudencial**: dada su categoria de "Knowledge Retrieval" evaluada, puede emplearse para localizar y resumir precedentes relevantes a partir de consultas en lenguaje natural.
- **Generacion de borradores de documentos legales**: redaccion asistida de demandas, escritos y memorandos, con la salvedad de que requiere revision humana obligatoria por el riesgo de alucinacion.
- **Clasificacion y triaje de consultas legales**: uso de la categoria "Text Classification" para enrutar consultas entrantes a las areas de practica correspondientes en un despacho o departamento juridico.
- **Resumen de expedientes y documentacion regulatoria**: sintesis de guias regulatorias y expedientes extensos, aprovechando la categoria "Summarization".
- **Traduccion de documentacion legal entre idiomas**: util en despachos con clientela internacional, aunque la lista de idiomas soportados no esta declarada y debe validarse empiricamente.
- **Formacion y simulacion**: generacion de casos practicos y preguntas de examen para estudiantes de derecho, con supervision docente.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con quince categorias. Los resultados se presentan como precision (accuracy) a tres decimales. Las columnas "Model1", "Model2" y "Model1-v2" no se identifican con modelos concretos en la informacion disponible.

| Categoria | Benchmark | Model1 | Model2 | Model1-v2 | LegalLM-8B |
|---|---|---|---|---|---|
| Razonamiento | Math Reasoning | 0,455 | 0,468 | 0,460 | 0,777 |
| Razonamiento | Logical Reasoning | 0,701 | 0,712 | 0,719 | 0,787 |
| Razonamiento | Common Sense | 0,688 | 0,675 | 0,694 | 0,782 |
| Lenguaje | Reading Comprehension | 0,742 | 0,755 | 0,761 | 0,802 |
| Lenguaje | Question Answering | 0,663 | 0,671 | 0,680 | 0,792 |
| Lenguaje | Text Classification | 0,771 | 0,782 | 0,789 | 0,777 |
| Lenguaje | Sentiment Analysis | 0,704 | 0,711 | 0,716 | 0,762 |
| Generacion | Code Generation | 0,498 | 0,512 | 0,505 | 0,732 |
| Generacion | Creative Writing | 0,601 | 0,592 | 0,610 | 0,757 |
| Generacion | Dialogue Generation | 0,655 | 0,668 | 0,671 | 0,762 |
| Generacion | Summarization | 0,712 | 0,724 | 0,730 | 0,787 |
| Especializadas | Translation | 0,690 | 0,703 | 0,708 | 0,782 |
| Especializadas | Knowledge Retrieval | 0,735 | 0,748 | 0,752 | 0,812 |
| Especializadas | Instruction Following | 0,700 | 0,714 | 0,718 | 0,797 |
| Especializadas | Safety Evaluation | 0,752 | 0,741 | 0,760 | 0,805 |

Advertencia: no se especifica que benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) corresponden a cada categoria, ni el tamano de los conjuntos de evaluacion. Los resultados deben interpretarse con cautela hasta validacion independiente.

## Requisitos de hardware

- **VRAM estimada en FP16/BF16**: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- **VRAM estimada en cuantizacion 8 bits**: alrededor de 8-9 GB de pesos.
- **VRAM estimada en cuantizacion 4 bits**: alrededor de 4-5 GB de pesos, aunque los tipos de cuantizacion oficiales no estan declarados.
- **GPU recomendadas**: A100 40/80 GB, H100 para despliegue de produccion con concurrencia; RTX 4090 (24 GB) para FP16 en single-GPU; RTX 3090/4080 (16-24 GB) para cuantizacion.
- **Consumer GPU**: si cabe en GPUs de consumo de 24 GB en FP16 y en GPUs de 8-12 GB con cuantizacion, siempre que se generen pesos GGUF/AWQ (no confirmados en el repo).
- **Opciones de despliegue**: `transformers` (confirmado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. vLLM, llama.cpp, Ollama y TGI no estan confirmados explicitamente en la informacion.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de identificacion de los modelos "Model1", "Model2" ni "Model1-v2" usados como referencia en la tabla de benchmarks. Como alternativas genericas de la misma categoria (modelos legales de ~8B) podrian considerarse SaulLM-7B, Legal-Llama o Lawformer, pero no se dispone de datos comparativos en la informacion proporcionada para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LegalLM-8B | 8B | no disponible | MIT | Hugging Face (repo 0,0 GB) |
| Alternativas legales ~7-8B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Repositorio vacio o incompleto**: el tamano del repo es 0,0 GB y las descargas son 0, lo que sugiere que los pesos podrian no estar subidos. Verificar antes de cualquier uso.
- **Riesgo de alucinacion elevado en dominio legal**: cualquier salida debe ser revisada por un profesional cualificado; no debe usarse como asesoramiento juridico automatizado.
- **Sesgos**: no se documenta la composicion del corpus de entrenamiento ni los sesgos conocidos; el sesgo jurisdiccional (probablemente anglosajon) puede ser significativo.
- **Idiomas**: la lista de idiomas soportados no esta declarada; el rendimiento multilingue es incierto.
- **Contexto**: la longitud de contexto no esta especificada, lo que impide planificar casos de uso con documentos largos.
- **Benchmarks no verificables**: los resultados de la tabla no indican que benchmarks estandar corresponden a cada categoria ni el tamano de los conjuntos; no hay comparacion con modelos identificables.
- **Licencia**: MIT permite uso comercial, pero la ausencia de pesos verificables hace imposible ejercer ese derecho en la practica.
- **Produccion**: no se documentan cuantizaciones oficiales, latencias ni throughput; no apto para produccion sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/123sg/LegalLM-Release-20261116
- Model card (README): incluida en la pagina de Hugging Face
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada
