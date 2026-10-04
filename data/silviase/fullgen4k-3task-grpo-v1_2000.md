# Silviase/FullGen4K-3Task-GRPO-v1_2000

## Resumen

FullGen4K-3Task-GRPO-v1_2000 es un ajuste fino de parametros completos (full-parameter) del modelo base Qwen/Qwen3.5-2B, publicado por el usuario Silviase en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tres tareas concretas: OCR de imagen completa, seleccion de evidencia (evidence selection) y respuesta a preguntas visuales (visual question answering). El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) sobre 3.500 imagenes de entrenamiento y 10.500 entradas de tarea, con una mezcla 1:1:1 entre las tres tareas.

El checkpoint corresponde al paso de optimizador 2000, segun la propia model card, y se distribuye como checkpoint nativo sellado en formato safetensors con 2.213.241.664 parametros totales (aproximadamente 2,21 mil millones), lo que lo situa en la gama de modelos pequenos aptos para inferencia en GPU de consumo. El repositorio ocupa 8,9 GB.

Su relevancia actual es doble: por un lado, aplica RL con GRPO a un modelo pequeno y multimodal con recompensas especificas por tarea; por otro, el autor declara explicitamente que los pesos se publicaron antes de completar la evaluacion externa, por lo que no existe todavia una reclamacion de mejora verificada. Es, por tanto, un artefacto de investigacion reproducible (semilla 99, configuracion en `experiment.json`) mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-2B (transformer multimodal image-text-to-text); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 2.213.241.664 (2,21 B), dato real de safetensors |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la model card solo indica max completion de 4096 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible; repo con safetensors originales, sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint fijado (pin) de Qwen/Qwen3.5-2B, identificado por el commit `15852e8c16360a2fea060d615a32b45270f8a8fc`. Sobre esa base se aplico un ajuste de parametros completos mediante GRPO, una variante de optimizacion por politica relativa a grupos que aprende a partir de recompensas comparativas entre generaciones. La configuracion declarada incluye 8 prompts por ronda con 8 generaciones cada uno, 2 actualizaciones de optimizador por ronda de generacion, learning rate de 5e-7, coeficiente KL de 0,02, maximo de 4096 tokens de completado y semilla 99, con un objetivo de 1 epoca. El sufijo `2000` del nombre cuenta actualizaciones de optimizador, no imagenes ni rondas de generacion. La configuracion completa esta en `experiment.json`.

Las tres tareas comparten el mismo modelo pero usan instrucciones separadas y recompensas especificas: OCR (media de F1 exacto y F1 suave), seleccion de evidencia (F1 exacto de conjunto) y QA (coincidencia exacta normalizada contra respuestas aceptables). Las completaciones truncadas por limite de tokens reciben recompensa cero, un detalle relevante porque penaliza la verbosidad excesiva. El autor advierte que el checkpoint es nativo y sellado, y que no se reclama igualdad en un roundtrip de exportacion; es decir, no hay garantia de que una conversion a otro formato reproduzca exactamente el comportamiento.

## Capacidades

- OCR de imagen completa: reconocimiento de texto en la imagen entera, no solo en regiones recortadas, evaluado con metricas de caracter (CC-OCR character P/R/F1) y CER sin orden con recorte.
- Seleccion de evidencia: identificacion de los fragmentos o conjuntos de evidencia relevantes dentro del contenido visual, con recompensa de F1 exacto de conjunto.
- Visual question answering: respuesta a preguntas sobre imagenes con normalizacion de respuestas y coincidencia exacta contra conjuntos de respuestas aceptables.
- Entrada multimodal image-text-to-text a traves del pipeline de transformers (`image-text-to-text`).
- Uso conversacional: la etiqueta `conversational` esta presente en el repositorio.
- Generacion de texto general: heredada del modelo base Qwen3.5-2B, aunque no esta caracterizada en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), audio ni vision adicionales mas alla del pipeline declarado.

## Casos de uso

- Digitalizacion de documentos con OCR de imagen completa: el modelo esta entrenado especificamente para reconocer texto sobre la imagen entera y evaluado con metricas a nivel de caracter y CER, lo que encaja en pipelines de captura de facturas, actas o formularios escaneados.
- Extraccion de evidencia para auditoria documental: la tarea de seleccion de evidencia permite localizar que fragmentos de un documento justifican una afirmacion, util en revision de contratos o cumplimiento normativo.
- Busqueda documental multimodal con justificacion: combinando seleccion de evidencia y QA se puede construir un recuperador que no solo responde, sino que senala el soporte visual de la respuesta.
- Atencion al cliente con imagenes adjuntas: el pipeline image-text-to-text permite responder preguntas sobre capturas, etiquetas de producto o recibos enviados por el usuario, siempre que el caso se mantenga dentro del dominio entrenado.
- Respuesta a preguntas sobre capturas tecnicas: el modelo soporta QA visual sobre conjuntos de respuestas aceptables, adecuado para asistentes de soporte que responden a partir de diagramas o pantallazos.
- Accesibilidad y descripcion asistida: generacion de texto a partir de imagenes con texto para personas con dificultades de lectura, aprovechando la componente OCR.
- Etiquetado y pre-anotacion de datasets: dado su tamano (2,21 B), puede ejecutarse localmente para pre-etiquetar datos de OCR y QA visual antes de revision humana.
- Prototipado e investigacion en RL multimodal: sirve como referencia reproducible de GRPO multi-tarea sobre un modelo de 2 B, con hiperparametros y semilla publicados, para experimentos de ablacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica literalmente que la evaluacion esta "Pending" y que los pesos se publicaron antes de completar la evaluacion, sin reclamacion de mejora. El protocolo previsto es: OCR de imagen completa con P/R/F1 de caracter de CC-OCR y CER sin orden con recorte (medias por imagen), usando NED como diagnostico; version de metricas `jawildtext-metrics v2` (2026-09-28). El conjunto de desarrollo interno es de 500 imagenes y 1.500 ejemplos de tarea. La evaluacion externa prevista es JaWildText common580 (OCR) y 1.025 preguntas de QA, y el autor aclara que esos resultados seran informativos y no se usaran para seleccionar checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2,21 B de parametros, sin contar el coste de los tokens visuales):
  - bf16/fp16: aproximadamente 4,5 GB de pesos, mas overhead de runtime; en la practica 8-10 GB.
  - int8: aproximadamente 2,5-3 GB de pesos; 5-7 GB con overhead.
  - int4: aproximadamente 1,5-2 GB de pesos; 4-6 GB con overhead.
- Nota: el repositorio pesa 8,9 GB, por encima del peso teorico de los parametros, lo que suele indicar varios ficheros de checkpoint; conviene revisar el contenido real antes de planificar el despliegue.
- GPU recomendadas: RTX 4090, A100 40/80 GB o H100 para lotes grandes y proceso por lotes; tambien resultan suficientes tarjetas de 12-16 GB para inferencia unitaria en bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16; en tarjetas de 6-8 GB solo con cuantizacion, que no esta publicada oficialmente.
- Opciones de despliegue: transformers (libreria declarada), TGI y vLLM para servido; llama.cpp u Ollama requeririan convertir los pesos a GGUF, tarea no soportada por el autor en la informacion disponible.
- Latencia y throughput: no disponibles. Tampoco se documenta la resolucion de imagen admitida, factor determinante en el coste computacional de un modelo image-text-to-text.

## Comparativa con modelos similares

Solo se dispone de datos verificados del modelo base declarado. No se han proporcionado datos de rendimiento ni de configuracion de alternativas, por lo que la comparativa se limita a lo comprobable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FullGen4K-3Task-GRPO-v1_2000 | 2,21 B (verificado en safetensors) | no disponible | Apache-2.0 | HuggingFace, autor Silviase |
| Qwen/Qwen3.5-2B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de OCR/VQA de gama ~2-4 B | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado resultados de benchmarks de ninguno de estos modelos, de modo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Evaluacion incompleta: el autor declara explicitamente que la evaluacion externa esta pendiente y que no se reivindica ninguna mejora sobre el modelo base. No debe asumirse que este checkpoint supere a Qwen/Qwen3.5-2B.
- Riesgo de alucinacion: no cuantificado, pero es una limitacion inherente a los modelos generativos de 2 B, especialmente en QA sobre imagenes.
- Ambito de tarea estrecho: el entrenamiento se centra en OCR, seleccion de evidencia y QA con recompensas concretas; el comportamiento fuera de esas tres tareas no esta caracterizado.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no hay garantia de cobertura multilingue mas alla de la heredada del modelo base.
- Contexto: la longitud de contexto real no esta documentada; el dato de 4096 corresponde al maximo de tokens de completado durante el entrenamiento, no a la ventana de contexto.
- Penalizacion de truncamiento: las completaciones que alcanzan el limite reciben recompensa cero, lo que puede sesgar el modelo hacia respuestas cortas y potencialmente incompletas en tareas largas.
- Reproducibilidad de formato: el autor indica que `2000` es un checkpoint nativo sellado y que no se reclama igualdad en un roundtrip de exportacion; las conversiones a otros formatos pueden alterar el comportamiento.
- Sin cuantizaciones oficiales: no hay GGUF ni otros formatos ligeros publicados, lo que complica el despliegue en hardware limitado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Licencia: Apache-2.0, permisiva para uso comercial, pero se recomienda verificar la licencia del modelo base Qwen/Qwen3.5-2B, que no aparece en la informacion proporcionada.
- Metricas: la propia model card advierte que usar las recompensas F1 del conjunto de entrenamiento no equivale a una evaluacion de OCR de imagen completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Silviase/FullGen4K-3Task-GRPO-v1_2000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Commit del checkpoint base: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/silviase/jasset/runs/fullgen4k-3task-grpo-v1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
