# mradermacher/Vinci-MLE-123B-1.0-i1-GGUF

## Resumen

Vinci-MLE-123B-1.0-i1-GGUF es un conjunto de cuantizaciones en formato GGUF, generadas con el método i1/imatrix, del modelo simpledirect/Vinci-MLE-123B-1.0. El autor de las cuantizaciones es mradermacher, que publica versiones optimizadas con matrices de importancia (imatrix) para reducir el impacto en perplejidad respecto a las cuantizaciones estáticas equivalentes. El modelo base está orientado a tareas de machine learning engineering y uso de herramientas, según las etiquetas declaradas (machine-learning-engineering, tool-use, devstral, lora, research, conversational).

El modelo base cuenta con 125.025.988.608 parámetros totales (aproximadamente 125B), lo que lo sitúa en la gama de modelos densos de gran tamano. El repositorio de cuantizaciones ocupa 731,8 GB en total, repartido entre 13 ficheros GGUF que van desde 29,7 GB (IQ1_M) hasta 102,7 GB (Q6_K, dividido en tres partes). Esto lo convierte en un modelo que no cabe en una GPU de consumo individual: incluso la cuantización más agresiva requiere del orden de 30 GB solo para los pesos.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de 125B en hardware modesto mediante llama.cpp y sus derivados, con distintos compromisos entre tamano, velocidad y calidad. La información disponible no incluye detalles sobre la longitud de contexto, la arquitectura interna ni resultados de benchmarks del modelo base o de las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas "devstral" y el nombre de licencia "modified-mit-mistral-ai-2025" apuntan a una base derivada de Mistral; no confirmado en la informacion proporcionada) |
| Parametros totales | 125.025.988.608 (aproximadamente 125B, dato de safetensors del modelo base) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: IQ1_M, IQ2_XXS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K; tambien existen cuantizaciones estaticas en mradermacher/Vinci-MLE-123B-1.0-GGUF |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | modified-mit-mistral-ai-2025 (etiquetada como "other"; requiere revisar el fichero LICENSE) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en los datos proporcionados. Las etiquetas del repositorio incluyen "devstral", "lora", "machine-learning-engineering", "tool-use" y "canadian-ai", y la licencia se denomina "modified-mit-mistral-ai-2025", lo que sugiere una base derivada de la familia Mistral con posible ajuste mediante LoRA para tareas de ingenieria de machine learning y uso de herramientas. No hay confirmacion explicita de la arquitectura (transformer denso, MoE, hibrida, etc.) ni del numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

En cuanto a las cuantizaciones, mradermacher ha publicado dos familias: las estaticas (repositorio Vinci-MLE-123B-1.0-GGUF) y las i1 con imatrix (este repositorio). El metodo imatrix calcula una matriz de importancia a partir de datos de calibracion para ponderar la cuantizacion de cada tensor, lo que en la practica reduce la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor incluye ademas el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. No se documentan innovaciones tecnicas propias del modelo base.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" indica soporte de dialogos multi-turno.
- Uso de herramientas y function calling: las etiquetas "tool-use" y "machine-learning-engineering" apuntan a capacidades de invocacion de herramientas y flujos de trabajo tecnicos.
- Razonamiento de multiples pasos orientado a agentes: inferido de la etiqueta "tool-use"; no confirmado con documentacion adicional.
- Idiomas: unicamente ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de ingenieria de machine learning: dado el etiquetado "machine-learning-engineering", el modelo encaja en la generacion y revision de codigo de entrenamiento, scripts de preprocesado y configuraciones de experimentos, ejecutado en local mediante llama.cpp.
- Agentes que invocan herramientas: con la etiqueta "tool-use", puede integrarse en pipelines donde el modelo decide que funcion llamar (APIs internas, consultas a bases de datos, ejecucion de comandos) dentro de un bucle de razonamiento.
- Despliegue en infraestructura con GPU de gran memoria: al requerir entre 30 GB y 103 GB de pesos segun cuantizacion, es adecuado para servidores con A100 80 GB o H100, sirviendo equipos de desarrollo internos.
- Procesamiento por lotes en CPU + GPU mixto: mediante llama.cpp con offload parcial, permite ejecutar cuantizaciones IQ2/IQ3 en estaciones de trabajo con 24-48 GB de VRAM y RAM abundante.
- Experimentacion e investigacion sobre cuantizacion: el fichero imatrix publicado permite reproducir y comparar el impacto de distintos tipos de cuantizacion sobre el mismo modelo base, util para estudiar degradacion de calidad.
- Documentacion tecnica y resumen de codigo en ingles: con contexto largo (longitud no confirmada) podria resumir repositorios, aunque no hay datos que permitan verificar el rendimiento en esta tarea.
- Evaluacion comparativa de licencias: dado que la licencia es "modified-mit-mistral-ai-2025", sirve como caso de estudio para equipos juridicos que evaluan modelos con licencias no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV):
  - i1-IQ1_M: 29,7 GB (el autor lo describe como "mostly desperate", calidad muy baja).
  - i1-IQ2_XXS: 33,8 GB; i1-IQ2_M: 43,1 GB.
  - i1-Q2_K_S: 43,1 GB; i1-Q2_K: 46,7 GB.
  - i1-IQ3_XXS: 48,5 GB; i1-Q3_K_S: 54,5 GB; i1-IQ3_M: 56,9 GB; i1-Q3_K_M: 60,7 GB.
  - i1-IQ4_XS: 67,2 GB; i1-Q4_K_S: 71,3 GB; i1-Q4_K_M: 75,0 GB (recomendado por el autor).
  - i1-Q6_K: 102,7 GB, dividido en tres partes.
- GPU recomendadas:
  - 1x A100 80 GB o H100 80 GB: permite Q4_K_M (75 GB) al limite, con cache KV reducida.
  - 2x 80 GB (A100/H100): permite Q6_K y Q4_K_M con contexto amplio.
  - 2x RTX 3090/4090 (48 GB): viable con IQ2_M/Q2_K (43-47 GB) con contexto muy limitado.
  - 4x RTX 4090 (96 GB): viable con Q4_K_M y margen para cache KV.
- GPU de consumo: no cabe en una unica GPU de 24 GB (RTX 3090, 4090, 5090). La opcion practica en equipos de consumo es llama.cpp con offload parcial a CPU y RAM suficiente (64-128 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y servidores basados en llama.cpp. Para safetensors del modelo base se necesitarian vLLM o TGI con hardware multi-GPU.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas. La unica comparacion objetivable con la informacion proporcionada es estructural, entre las propias cuantizaciones:

| Variante | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_M | 29,7 | "mostly desperate" |
| i1-Q2_K | 46,7 | IQ3_XXS probablemente mejor |
| i1-Q4_K_M | 75,0 | rapido, recomendado |
| i1-Q6_K | 102,7 | practicamente como Q6_K estatico |

Comparacion con otros modelos de la misma categoria (por ejemplo, otros modelos densos de mas de 100B con licencia Mistral): no disponible.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles. No hay evidencia de soporte multilingue, por lo que su uso en castellano no esta respaldado por el autor.
- Contexto: se desconoce la longitud de contexto soportada; esto impide planificar aplicaciones que dependan de ventanas largas.
- Alucinacion: no se han publicado evaluaciones de fiabilidad ni tasas de alucinacion. Al tratarse de un modelo orientado a codigo y herramientas, el riesgo de generar APIs o funciones inexistentes es relevante en produccion.
- Cuantizaciones de baja calidad: el propio autor advierte que IQ1_M es "mostly desperate" y que Q2_K_S es de "very low quality". Estas variantes no son aptas para uso en produccion.
- Licencia: "modified-mit-mistral-ai-2025" esta catalogada como "other", no como MIT estandar. Es obligatorio revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que puede incluir restricciones adicionales respecto a la licencia MIT original.
- Trazabilidad: las cuantizaciones son un artefacto derivado; los fallos de calidad pueden provenir tanto del modelo base como del proceso de cuantizacion. El autor no publica comparativas de perplejidad para este modelo concreto.
- Ausencia de benchmarks: no hay ninguna cifra de rendimiento publicada, ni del modelo base ni de las cuantizaciones, lo que impide estimar su calidad relativa frente a alternativas.
- Resultados de busqueda web: las busquedas realizadas no devolvieron informacion tecnica relevante sobre este modelo (los resultados obtenidos no guardan relacion con el mismo), por lo que no ha sido posible ampliar los datos de la model card.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1/imatrix): https://huggingface.co/mradermacher/Vinci-MLE-123B-1.0-i1-GGUF
- Modelo base: https://huggingface.co/simpledirect/Vinci-MLE-123B-1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Vinci-MLE-123B-1.0-GGUF
- Pagina indice del autor para este modelo: https://hf.tst.eu/model#Vinci-MLE-123B-1.0-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Vinci-MLE-123B-1.0-i1-GGUF/resolve/main/Vinci-MLE-123B-1.0.imatrix.gguf
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
