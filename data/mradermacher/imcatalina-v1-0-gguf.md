# mradermacher/IMCatalina-v1.0-GGUF

## Resumen

IMCatalina-v1.0-GGUF es la version cuantizada en formato GGUF del modelo rmtlabs/IMCatalina-v1.0, un fine-tune completo (full fine-tune) orientado a instrucciones y especializado en el dominio de reclutamiento y recursos humanos. El modelo base sobre el que se construye pertenece a la familia Phi, segun las etiquetas declaradas en la model card, y cuenta con 14.659.507.200 parametros totales, lo que lo situa en la franja de los modelos de aproximadamente 14B. Las cuantizaciones han sido generadas por mradermacher, un actor habitual en la publicacion de versiones GGUF de modelos open source.

La relevancia de esta ficha reside en que permite ejecutar un modelo especializado en tareas de RR. HH. en hardware de consumo mediante llama.cpp y derivados, sin necesidad de GPUs de datacenter. El modelo esta disenado para parsing de curriculos, generacion de descripciones de puesto y otras tareas de reclutamiento, y su publicacion en GGUF amplia el acceso a estos flujos de trabajo en entornos con recursos limitados.

La informacion publica disponible es escasa: la model card del repositorio GGUF es una plantilla estandar de cuantizacion y no incluye detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja unicamente los datos verificables en la informacion proporcionada y marca explicitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi, segun etiquetas de la model card) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y F16 implicita en el repo base) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |
| Modelo base | rmtlabs/IMCatalina-v1.0 |
| Tipo de ajuste | Full fine-tune con instruction tuning |
| Tamano del repo | 101,2 GB |
| Descargas | 191 |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de un modelo de la familia Phi, segun las etiquetas declaradas por el autor (`phi`, `fine-tuned`, `full-finetune`, `instruction-tuning`). Se trata, por tanto, de un transformer decoder-only denso de aproximadamente 14,6B parametros, no de una arquitectura MoE ni de un modelo hibrido. El ajuste se realizo sobre el modelo base rmtlabs/IMCatalina-v1.0 mediante full fine-tuning, lo que implica actualizar todos los pesos y no solo adaptadores tipo LoRA.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la posible aplicacion de RLHF o DPO, ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card del repositorio GGUF es una plantilla generica de cuantizacion y no aporta detalles sobre el proceso de entrenamiento del modelo original. Las cuantizaciones publicadas son estaticas; el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con instruction tuning orientado a tareas de RR. HH.
- Parsing de curriculos (resume parsing): extraccion estructurada de datos de CV.
- Generacion de descripciones de puesto (job-description-generation).
- Tareas de reclutamiento en general, segun las etiquetas del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Parsing automatizado de curriculos: el modelo puede recibir el texto de un CV y devolver campos estructurados (experiencia, formacion, habilidades) gracias a su ajuste especifico en resume parsing, reduciendo el trabajo manual en procesos de seleccion de alto volumen.
- Generacion de descripciones de puesto: a partir de un brief con rol, seniority y requisitos, el modelo redacta ofertas de empleo coherentes y adaptadas al tono de la empresa, una tarea para la que fue explicitamente entrenado.
- Triaje de candidaturas: integrado en un pipeline de ATS (applicant tracking system), el modelo puede resumir y clasificar candidaturas por adecuacion al puesto, siempre con supervision humana dada la sensibilidad del dominio.
- Asistencia a reclutadores en conversaciones multi-turno: el modelo puede mantener dialogos para refinar criterios de busqueda o redactar mensajes de contacto personalizados, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Despliegue en local para cumplimiento de privacidad: al poder ejecutarse en GGUF sobre hardware de consumo, permite procesar datos personales de candidatos sin enviarlos a APIs de terceros, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Prototipado rapido de herramientas de RR. HH.: con cuantizaciones Q4_K_S o Q4_K_M (8,5-9,2 GB), un equipo puede desplegar el modelo en un portatil o estacion de trabajo con GPU consumer para validar flujos antes de invertir en infraestructura mayor.
- Generacion de preguntas de entrevista: el modelo puede producir baterias de preguntas tecnicas o conductuales a partir de la descripcion del puesto, aprovechando su ajuste en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (5,6 GB): ~7-8 GB de VRAM.
  - Q4_K_M (9,2 GB): ~11-12 GB de VRAM.
  - Q5_K_M (10,7 GB): ~13-14 GB de VRAM.
  - Q6_K (12,1 GB): ~14-15 GB de VRAM.
  - Q8_0 (15,7 GB): ~18-19 GB de VRAM.
  - F16 (~29 GB): ~32 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 3090 (24 GB) para Q5_K_M y Q6_K; RTX 4080 / 4070 Ti Super (16 GB) para Q2_K a Q4_K_M; A100 40/80 GB y H100 para F16 y despliegues de alta concurrencia.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con cuantizaciones Q4 o inferiores; en 12 GB es viable Q3_K_M o Q2_K con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este ultimo requiere pesos no GGUF o soporte GGUF experimental). El repo esta marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, las cuantizaciones Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IMCatalina-v1.0-GGUF | 14,66B | no disponible | no disponible | GGUF | Especializado en RR. HH., solo ingles |
| rmtlabs/IMCatalina-v1.0 | 14,66B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| Phi-4 (Microsoft) | ~14B | 16K | MIT | safetensors, GGUF | Modelo generalista de la misma familia; no especializado en RR. HH. |
| Qwen2.5-14B-Instruct | 14,7B | 32K | Apache 2.0 | safetensors, GGUF | Generalista multilingue con amplio ecosistema de cuantizaciones |

La comparativa con Phi-4 y Qwen2.5-14B-Instruct se ofrece como referencia de categoria por tamano; no se dispone de datos de rendimiento de IMCatalina que permitan una comparacion cuantitativa. Los datos de los modelos alternativos corresponden a informacion publica general y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al operar en el dominio de RR. HH. existe riesgo de sesgos en la evaluacion de candidatos que requieren auditoria.
- Riesgo de alucinacion: no cuantificado; en tareas de parsing y generacion de descripciones de puesto es recomendable validar las salidas de forma estructurada.
- Limitacion de idioma: el modelo solo declara soporte de ingles (`language: en`); su uso en castellano no esta garantizado.
- Longitud de contexto: no documentada; debe probarse empiricamente antes de disenar flujos con entradas largas.
- Licencia: no disponible, lo que impide confirmar si se permite uso comercial. Es un bloqueante critico para produccion que debe resolverse consultando el repo base.
- Cuantizaciones de baja calidad: el autor marca Q3_K_M como "lower quality"; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede reducir la calidad frente a alternativas con imatrix a igual tamano.
- Ecosistema limitado: 191 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopcion amplia ni de mantenimiento continuado.
- Datos de entrenamiento desconocidos: sin informacion sobre el dataset, no es posible evaluar la cobertura del dominio ni el riesgo de contaminacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/IMCatalina-v1.0-GGUF
- Modelo base: https://huggingface.co/rmtlabs/IMCatalina-v1.0
- Pagina de descargas del autor: https://hf.tst.eu/model#IMCatalina-v1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
