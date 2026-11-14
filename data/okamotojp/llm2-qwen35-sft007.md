# OkamotoJP/llm2-qwen35-sft007

## Resumen

`OkamotoJP/llm2-qwen35-sft007` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de aproximadamente 873 millones de parametros, entrenado mediante LoRA con rango 16 y alpha 32, y posteriormente fusionado con los pesos originales. Su proposito declarado es la generacion de respuestas en un sistema de RAG (Retrieval-Augmented Generation), en el contexto del curso "LLM講座2 2026" (asignatura final sobre RAG).

El modelo esta especializado en japones y se ha entrenado sobre conjuntos de datos de question answering: JEMHopQA y auto-wiki-qa, ambos derivados de Wikipedia en japones y con licencia CC BY-SA 4.0. La actualizacion afecta unicamente a los pesos de la parte linguistica; la arquitectura subyacente se mantiene identica a la del modelo base Qwen3.5-0.8B.

Por su tamano reducido y su enfoque especifico, es relevante para experimentacion academica y para escenarios de generacion de respuestas ancladas a documentos en japones, no como modelo de proposito general. Su licencia Apache-2.0 permite uso comercial, aunque las condiciones de los datasets de entrenamiento introducen matices que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; no se detalla variante concreta) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la estructura del base Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parametros. El autor indica explicitamente que solo se actualizaron los pesos de la parte linguistica y que la estructura es identica a la del modelo original. El ajuste se realizo con LoRA (r=16, alpha=32, learning rate 0.0001, 1 epoca) sobre 1.192 ejemplos de entrenamiento, y los adaptadores se fusionaron posteriormente en los pesos base.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (filtrado y reformateado), `cl-nagoya/auto-wiki-qa` (muestreado, filtrado y reformateado) y un conjunto de chunks distribuidos derivados de Wikipedia en japones, empleados como material de referencia en los prompts de entrenamiento. Todas las fuentes se declaran bajo licencia CC BY-SA 4.0. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni se especifica el volumen total de tokens procesados.

## Capacidades

- Generacion de texto en japones orientada a respuestas de question answering.
- Generacion de respuestas ancladas a contexto documental (RAG): el entrenamiento incluye prompts con material de referencia procedente de chunks de Wikipedia.
- Razonamiento de tipo hop multiple, derivado del uso de JEMHopQA como fuente de entrenamiento.
- Capacidades heredadas del base Qwen3.5-0.8B en la medida en que no se hayan degradado por el ajuste (no documentadas en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponible en la informacion.

## Casos de uso

- Generacion de respuestas en sistemas RAG sobre Wikipedia en japones: el modelo se entreno especificamente con prompts que incluyen chunks de referencia, por lo que esta preparado para producir respuestas a partir de contexto recuperado.
- Preguntas multi-hop en dominios enciclopedicos: JEMHopQA aporta ejemplos de preguntas que requieren combinar informacion de varias entidades, adecuado para tareas de QA complejo en japones.
- Prototipado academico de pipelines RAG: su tamano (873 M de parametros) permite iterar rapidamente en entornos con recursos limitados durante cursos o investigacion.
- Evaluacion comparativa de estrategias de recuperacion: al ser un modelo pequeno y especializado, sirve como componente de generacion controlado en experimentos donde se aisla el efecto del retriever.
- Asistencia a la lectura de documentacion tecnica en japones: puede resumir o responder preguntas sobre fragmentos de texto proporcionados como contexto.
- Filtrado y reformulacion de respuestas en pipelines de bajo coste: su reducido consumo permite desplegarlo en CPU o GPUs consumer para tareas de generacion acotadas.
- Experimentacion con ajuste fino LoRA: la configuracion documentada (r=16, alpha=32, 1 epoca, 1.192 ejemplos) sirve como referencia reproducible para estudiar el efecto del SFT en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV (el repo ocupa 1,8 GB).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,0 GB; en 4 bits, en torno a 0,5-0,6 GB (estimaciones teoricas a partir del numero de parametros, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es sobradamente suficiente; tambien cabe en GPUs de gama de entrada con 4-8 GB.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: al publicarse solo en safetensors, es compatible con transformers, vLLM y TGI; para llama.cpp u Ollama seria necesario generar una cuantizacion GGUF a partir de los pesos (no publicada por el autor).
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft007 | 873 M | no disponible | ja | Apache-2.0 | SFT sobre Qwen3.5-0.8B, especializado en QA/RAG en japones |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | multilingue (segun modelo base) | Apache-2.0 | Modelo base sin ajuste; capacidades generales |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente de datos de entrenamiento, no modelo comparable |

No se dispone de datos de benchmarks del modelo ajustado que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo muy pequeno (873 M de parametros): su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor escala.
- Especializado en japones: no se garantiza un rendimiento adecuado en castellano u otros idiomas, a pesar de que el modelo base sea multilingue.
- Riesgo de alucinacion: como todo modelo de QA generativo, puede producir respuestas plausibles pero incorrectas, especialmente si el contexto recuperado es irrelevante o incompleto.
- Entrenado con solo 1.192 ejemplos y 1 epoca: el ajuste es ligero y puede no generalizar bien fuera de la distribucion de JEMHopQA y auto-wiki-qa.
- Los datasets de entrenamiento estan bajo CC BY-SA 4.0: aunque los pesos se distribuyen como Apache-2.0, el uso comercial deberia revisarse a la luz de las obligaciones de atribucion y comparticion derivadas de los datos de entrenamiento.
- No se documentan sesgos especificos, pero al derivar de Wikipedia en japones puede heredar sesgos de cobertura y sesgos editoriales de esa fuente.
- No se han publicado cuantizaciones GGUF ni artefactos de despliegue optimizados; el usuario debe generarlos.
- Fecha de creacion registrada en 2026-11-07 y solo 2 descargas: modelo practicamente sin validacion externa ni adopcion comunitaria.
- No hay informacion sobre la longitud de contexto efectiva del modelo ajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft007
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
