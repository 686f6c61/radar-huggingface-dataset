# mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF

## Resumen

Qwen3.8-27B-unsycophantic-i1-GGUF es una cuantizacion en formato GGUF del modelo jbowman512/Qwen3.8-27B-unsycophantic, un ajuste fino de la familia Qwen3.8 de 27.320.697.856 parametros (aproximadamente 27,3 mil millones). El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, que publica tanto cuantizaciones estaticas como versiones con imatrix (i1). El modelo base incorpora las etiquetas "heretic" y "no-sycophancy", lo que indica un ajuste orientado a reducir el comportamiento servil o adulador del modelo y a eliminar rechazos excesivos heredados del alineamiento original.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo de 27B en hardware de consumo con cuantizaciones que van desde los 11,0 GB (i1-Q2_K) hasta los 22,5 GB (i1-Q6_K). Por otro, el enfoque "unsycophantic" responde a una demanda creciente de modelos que mantengan la utilidad y la franqueza sin caer en respuestas complacientes, un problema documentado en modelos alineados con RLHF agresivo. La model card menciona que se trata de un modelo de vision, aunque los ficheros mmproj residen en el repositorio estatico complementario.

La licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales. El repositorio tiene un tamano de 218,6 GB e incluye 21 cuantizaciones distintas, desde Q2_K hasta Q6_K, ademas del fichero imatrix para generar cuantizaciones propias. La fecha de creacion es el 18 de noviembre de 2026 y la ultima actualizacion el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8; detalles especificos no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) + safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.8 con 27,3 mil millones de parametros. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (si emplea GQA, atencion lineal o hibrida) ni sobre el numero de tokens de entrenamiento. La model card del repositorio cuantizado no incluye estos datos y remite implicitamente al repositorio del modelo base jbowman512/Qwen3.8-27B-unsycophantic.

El ajuste fino del modelo base se etiqueta como "heretic" y "no-sycophancy". El termino "heretic" en el ecosistema open source hace referencia a tecnicas de ablacion o ajuste que eliminan rechazos y comportamientos de censura excesiva, mientras que "no-sycophancy" apunta a un entrenamiento orientado a reducir la adulacion y la complacencia en las respuestas. No se especifica si se empleo RLHF, DPO, KTO u otra tecnica de preferencias, ni la composicion del dataset de ajuste. La cuantizacion i1 utiliza un fichero imatrix (importance matrix) para ponderar la cuantizacion de los tensores, lo que segun el autor mejora la calidad frente a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta "conversational" en el repositorio.
- Modelo de vision: la model card indica explicitamente "This is a vision model"; los ficheros mmproj estan en el repositorio estatico complementario.
- Comportamiento "no-sycophantic": disenado para reducir respuestas aduladoras o complacientes.
- Comportamiento "heretic": orientado a reducir rechazos y censura excesiva heredados del alineamiento original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (en).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de modelos sin sesgo de complacencia: util para investigadores que estudian el fenomeno de la sycophancy en LLM y necesitan una contraparte "unsycophantic" para comparar respuestas. El ajuste del modelo base esta especificamente orientado a este fin.
- Despliegue en hardware de consumo: con cuantizaciones desde 11,0 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K), el modelo puede ejecutarse en GPUs consumer de gama alta (24 GB de VRAM) usando llama.cpp u Ollama, algo inviable con los pesos en safetensors (aproximadamente 54 GB en fp16).
- Asistente conversacional local sin censura excesiva: el ajuste "heretic" reduce los rechazos innecesarios, lo que resulta util en entornos de investigacion creativa, redaccion de ficcion o analisis de contenido sensible donde el modelo original rechazaria peticiones legitimas.
- Prototipado rapido de aplicaciones de vision-lenguaje: al ser un modelo de vision con ficheros mmproj disponibles en el repositorio estatico, permite construir demos de captioning o VQA en local con llama.cpp.
- Fine-tuning posterior sobre las cuantizaciones: el fichero imatrix incluido (0,1 GB) permite generar cuantizaciones personalizadas con distintos equilibrios de tamano y calidad para un caso de uso concreto.
- Investigacion sobre alineamiento y preferencias: el modelo sirve como caso de estudio de ajustes que modifican el comportamiento de rechazo y adulacion, permitiendo analizar como afectan estas tecnicas a la calidad general de las respuestas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: 11,0 GB
  - i1-IQ3_S / i1-IQ3_M: 12,7-12,9 GB
  - i1-Q3_K_M: 13,6 GB
  - i1-Q4_K_S / i1-Q4_K_M: 15,9-16,9 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4-Q6; A100 40/80 GB o H100 para los pesos completos en fp16 (aproximadamente 54 GB) o para servir con vLLM.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo Q2-Q3) y GPUs con 24 GB o mas para Q4-Q6.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para los pesos en safetensors del modelo base, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-unsycophantic-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (i1) | Ajuste no-sycophantic + heretic, vision |
| jbowman512/Qwen3.8-27B-unsycophantic | 27,3 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.8-27B-unsycophantic-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF estatico | Cuantizaciones estaticas (sin imatrix) |
| Qwen3.8-27B (original, si existe publicamente) | 27,3 B | no disponible | no disponible | no disponible | Modelo base de la familia sin el ajuste unsycophantic |

La comparativa con alternativas de otras familias (Llama, Mistral, Gemma) no esta disponible porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de esos modelos en esta categoria.

## Limitaciones y advertencias

- Idioma: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; el ajuste "heretic" y "no-sycophantic" podria incrementar la tendencia a responder con seguridad sobre temas inciertos al reducir los rechazos.
- Sesgos: no se documentan evaluaciones de sesgo; el ajuste fino sobre un modelo base ya puede introducir o amplificar sesgos.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ajuste pueden heredar obligaciones de atribucion; conviene revisar la model card del modelo base.
- Cuantizaciones de baja calidad: las cuantizaciones Q2 y Q3 (11-14,7 GB) degradan la calidad de forma notable; el autor recomienda IQ3_XXS o superiores frente a Q3_K*.
- Modelo de vision: los ficheros mmproj no estan en este repositorio sino en el estatico; hay que descargarlos por separado para usar las capacidades multimodales.
- Sin benchmarks: no hay datos publicos de MMLU, HumanEval, GSM8K ni similares para este ajuste, por lo que la evaluacion comparativa queda pendiente.
- Fecha de creacion futura (2026): conviene verificar la procedencia y el contexto de publicacion del repositorio.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-unsycophantic-i1-GGUF
- Modelo base: https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-unsycophantic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-unsycophantic-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
