# losophyl/opt-125m-merged

## Resumen

El modelo `losophyl/opt-125m-merged` es una versión fusionada del modelo OPT-125M de Meta AI, tras un proceso de fine-tuning con LoRA/QLoRA. El autor, `losophyl`, ha publicado este checkpoint en Hugging Face con licencia MIT, lo que permite su uso comercial y modificación sin restricciones significativas. El modelo base, OPT-125M, es un transformer decoder-only de 125 millones de parámetros, diseñado por Meta AI como una alternativa open source a GPT-3, con el objetivo de democratizar el acceso a modelos de lenguaje de gran escala.

Este repositorio concreto no incluye una model card detallada más allá de la mención del fine-tuning con LoRA/QLoRA, por lo que no se dispone de información sobre el dataset de entrenamiento, el proceso de ajuste ni las capacidades específicas resultantes. Aun así, al estar basado en OPT-125M, hereda las características generales de ese modelo: generación de texto en inglés, contexto de 2048 tokens (según la documentación original) y un tamaño reducido que lo hace ejecutable en hardware modesto. Su relevancia radica en servir como ejemplo de fine-tuning eficiente con técnicas de adaptación de bajo rango, útil para experimentación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT) |
| Parametros totales | 125.239.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el OPT base usa 2048 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es OPT-125M, un transformer causal con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. Fue preentrenado por Meta AI sobre un corpus de 180 mil millones de tokens, combinando datos de CommonCrawl, Books, Wikipedia y otras fuentes, con un enfoque en reproducibilidad y accesibilidad. El checkpoint publicado aquí ha sido sometido a un fine-tuning mediante LoRA (Low-Rank Adaptation) o QLoRA, una técnica que congela los pesos originales e introduce matrices de bajo rango para adaptar el modelo a una tarea específica con un coste computacional reducido. Tras el entrenamiento, los pesos adaptados se fusionan con los originales, dando lugar al archivo `merged` que se distribuye.

No se proporcionan detalles sobre el dataset de fine-tuning, el número de pasos, la tasa de aprendizaje ni las tareas concretas abordadas. Tampoco se indica si se empleó RLHF, DPO u otras técnicas de alineación. La ausencia de esta información limita la evaluación de las capacidades específicas del modelo más allá de las heredadas del preentrenamiento original.

## Capacidades

- Generación de texto en inglés: el modelo puede producir texto coherente y completar frases, dado su entrenamiento como modelo de lenguaje autorregresivo.
- Completado de texto y continuación de secuencias: útil para tareas de autocompletado o generación de contenido breve.
- Razonamiento básico y conocimiento general: limitado por su tamaño, pero capaz de responder a preguntas simples y realizar tareas de clasificación de texto.
- No se documentan capacidades avanzadas como tool calling, uso de agentes, razonamiento multi-paso, visión o audio. Estas funcionalidades no están presentes en el modelo base OPT-125M y no hay evidencia de que el fine-tuning las haya añadido.

## Casos de uso

- Experimentación académica: ideal para estudiar el impacto del fine-tuning con LoRA/QLoRA en modelos pequeños, comparando el rendimiento antes y después de la fusión.
- Prototipado rápido: al ser un modelo de 125M parámetros, puede desplegarse en entornos de desarrollo para probar pipelines de generación de texto sin necesidad de infraestructura costosa.
- Generación de texto para aplicaciones ligeras: chatbots simples, generación de descripciones cortas o resúmenes de bajo riesgo donde la precisión no es crítica.
- Enseñanza de PLN: sirve como ejemplo práctico para estudiantes que quieran entender cómo funciona un transformer y cómo se aplican técnicas de adaptación eficiente.
- Fine-tuning adicional: al estar en formato safetensors y con licencia MIT, puede servir como punto de partida para nuevos ajustes con otros datasets.
- Evaluación de técnicas de cuantización: aunque no se proporcionan cuantizaciones, el modelo puede ser cuantizado con herramientas como llama.cpp o GPTQ para estudiar el trade-off entre tamaño y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint específico. El modelo base OPT-125M tiene resultados conocidos en la literatura (por ejemplo, 26.5% en MMLU, 25.7% en HellaSwag), pero no se puede asumir que el fine-tuning haya mantenido o mejorado esas cifras sin evidencia.

## Requisitos de hardware

- VRAM estimada: un modelo de 125M parámetros en fp32 ocupa aproximadamente 0.5 GB. Con cuantización a 8 bits o 4 bits, el uso de memoria puede reducirse a 0.25 GB o menos, permitiendo su ejecución en GPUs con 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con suficiente RAM (alrededor de 1-2 GB).
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con frameworks como Hugging Face Transformers, vLLM, llama.cpp, Ollama y TGI, siempre que se convierta a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no se dispone de mediciones específicas. En una GPU moderna, la generación de tokens debería ser de decenas de tokens por segundo, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| losophyl/opt-125m-merged | 125M | No disponible (base: 2048) | MIT | Hugging Face |
| facebook/opt-125m | 125M | 2048 | MIT | Hugging Face |
| gpt2 (124M) | 124M | 1024 | MIT | Hugging Face |
| pythia-160m | 160M | 2048 | Apache 2.0 | Hugging Face |

El modelo fusionado se diferencia del OPT-125M original por haber pasado por un fine-tuning con LoRA/QLoRA, aunque no se especifican las tareas. Comparado con GPT-2, tiene un contexto mayor (si se mantiene el del base) y una arquitectura similar. Pythia-160M ofrece más parámetros y una licencia Apache 2.0, pero no está adaptado con LoRA.

## Limitaciones y advertencias

- Tamaño reducido: con solo 125M de parámetros, el modelo tiene una capacidad limitada para tareas complejas, razonamiento avanzado o conocimiento factual preciso.
- Sesgos potenciales: al estar preentrenado con datos de internet, puede reflejar sesgos sociales, culturales o de género presentes en el corpus. No se ha documentado ningún proceso de mitigación.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- Contexto limitado: aunque el OPT base soporta 2048 tokens, no se confirma que el modelo fusionado mantenga esa longitud. En cualquier caso, es una ventana corta para tareas que requieran contexto largo.
- Idioma: solo se declara soporte para inglés. No se garantiza un buen rendimiento en otros idiomas.
- Falta de documentación: la model card es extremadamente escueta, lo que impide conocer el proceso de fine-tuning, los datos utilizados y las capacidades reales del modelo. Esto dificulta su uso en producción sin una evaluación adicional.
- Licencia MIT: permite uso comercial, pero el usuario debe asumir la responsabilidad de cualquier uso indebido o daño derivado.

## Enlaces

- Hugging Face: https://huggingface.co/losophyl/opt-125m-merged
- Modelo original de Meta AI: https://huggingface.co/facebook/opt-125m
- Repositorio de referencia (snairharikrishnan/opt125m): https://github.com/snairharikrishnan/opt125m
- Documentación de OPT en GitHub: https://github.com/snairharikrishnan/opt125m/blob/main/README.md
