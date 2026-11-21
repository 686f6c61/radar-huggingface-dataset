# mradermacher/X-AQA-9B-GGUF

## Resumen

X-AQA-9B es un modelo multimodal especializado en la evaluacion de la calidad de acciones (action quality assessment, AQA) a partir de video. El modelo original lo desarrolla Kelly0510 y esta disponible en Hugging Face bajo el identificador Kelly0510/X-AQA-9B. La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones estaticas para llama.cpp.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9B) y esta orientado a tareas de comprension de video, concretamente a puntuar o evaluar la calidad de acciones ejecutadas en secuencias de video. Segun los metadatos de la model card, la licencia declarada es Apache 2.0, aunque el enlace de licencia apunta al fichero LICENSE de Qwen/Qwen3.5-9B, lo que sugiere que el modelo base subyacente podria derivar de la familia Qwen 3.5.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16, ademas de los ficheros mmproj para el componente multimodal), lo que permite desplegarlo en hardware de consumo. No obstante, la informacion publica disponible es muy limitada: no se detallan datos de entrenamiento, benchmarks ni capacidades exactas mas alla de las etiquetas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de comprension de video; arquitectura base no declarada) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los metadatos indican que se trata de un modelo multimodal (incluye ficheros mmproj, el proyector multimodal necesario para procesar entradas visuales en llama.cpp) orientado a comprension de video y evaluacion de calidad de acciones. El enlace de licencia apunta a Qwen/Qwen3.5-9B, lo que sugiere que el modelo podria estar construido sobre una base de la familia Qwen 3.5 de 9B, aunque esto no se confirma explicitamente en la model card.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otro tipo de ajuste. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Comprension de video: el modelo esta etiquetado como `video-understanding` y `action-quality-assessment`, por lo que su funcion principal es analizar secuencias de video y evaluar la calidad de las acciones realizadas.
- Evaluacion de calidad de acciones (AQA): orientado a puntuar ejecuciones (por ejemplo, en contextos deportivos o de habilidades motoras), aunque no se detalla el formato exacto de salida.
- Procesamiento multimodal: incluye proyector multimodal (mmproj) para combinar entradas visuales y textuales.
- Conversacional: la etiqueta `conversational` y el pipeline de transformers sugieren uso en formato de dialogo.
- Idiomas: soporte declarado unicamente en ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (solo ingles declarado).

## Casos de uso

- Evaluacion deportiva automatizada: el modelo puede analizar grabaciones de ejecuciones deportivas (saltos, gimnasia, levantamiento de pesas) y asignar puntuaciones de calidad de la accion, reduciendo la dependencia de jueces humanos en procesos de cribado masivo.
- Analisis de tecnica en rehabilitacion fisica: procesar videos de ejercicios de pacientes y evaluar la correccion de la ejecucion para dar retroalimentacion objetiva en plataformas de telerehabilitacion.
- Control de calidad en procesos industriales filmados: revisar videos de operarios ejecutando tareas repetitivas y detectar desviaciones en la calidad de la accion, integrandolo en pipelines de inspeccion visual.
- Entrenamiento y formacion profesional: analizar videos de aprendices en oficios manuales (soldadura, carpinteria) y puntuar la calidad de la ejecucion para generar informes de progreso.
- Investigacion en vision por computador: servir como modelo de referencia o baseline para experimentos de action quality assessment, especialmente en su version GGUF para entornos con recursos limitados.
- Prototipado en hardware de consumo: gracias a las cuantizaciones Q4_K_M (5,8 GB) y Q5_K_M (6,6 GB), permite experimentar con comprension de video en una unica GPU consumer, algo inviable con el modelo en f16 (18 GB).
- Despliegue en local con llama.cpp: para aplicaciones de escritorio o edge que requieran procesar video sin enviar datos a la nube, usando los ficheros mmproj junto con la cuantizacion elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector multimodal ni el contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,8 GB
  - Q3_K_L: ~5,1 GB
  - IQ4_XS: ~5,4 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,8 GB
  - Q5_K_S: ~6,4 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- Proyector multimodal adicional: mmproj-Q8_0 (~0,7 GB) o mmproj-f16 (~1,0 GB).
- GPU recomendadas: para cuantizaciones Q4_K_M o Q5_K_M cabe en GPUs consumer con 8-10 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para Q8_0 se recomienda 12 GB o mas (RTX 4070 Ti, RTX 4080). Para f16 se necesita una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones Q4-Q6 con GPUs de 8 GB o mas, teniendo en cuenta que el procesamiento de video incrementa el uso de memoria por el contexto visual.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) al estar en formato GGUF; el modelo base original es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. El procesamiento de video anade coste computacional significativo respecto a la inferencia solo de texto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos de action quality assessment comparables. El campo de AQA es relativamente especializado y los modelos publicos en abierto son escasos. Se indica "no disponible" para los datos de rendimiento comparado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| X-AQA-9B (esta ficha) | ~9B | no disponible | apache-2.0 | GGUF / safetensors | Especializado en AQA de video |
| Alternativas AQA open source | no disponible | no disponible | no disponible | no disponible | No identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- Informacion publica muy escasa: la model card del autor de la cuantizacion no incluye detalles sobre entrenamiento, datos, evaluacion ni limitaciones, lo que dificulta validar su comportamiento en produccion.
- Solo ingles declarado: no hay soporte multilingue confirmado, por lo que no es adecuado para aplicaciones en castellano sin evaluacion previa.
- Riesgo de alucinacion: como modelo generativo conversacional, puede producir puntuaciones o descripciones no fundamentadas, especialmente con videos fuera de su distribucion de entrenamiento.
- Licencia: se declara apache-2.0, pero el enlace de licencia apunta a Qwen/Qwen3.5-9B; conviene verificar los terminos reales del modelo base antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, por lo que cualquier decision de adopcion deberia acompanarse de una evaluacion propia.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K pueden degradar notablemente el rendimiento en tareas de comprension de video, que son sensibles a la precision.
- Coste de procesamiento de video: la inferencia con entradas de video es mas lenta y consume mas memoria que la de texto; el contexto visual puede superar facilmente la VRAM disponible en GPUs pequenas.
- Fecha de publicacion futura en los metadatos (2026-11-21): conviene tratar las fechas con cautela, ya que pueden reflejar errores de la plataforma.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que podria afectar la calidad relativa de las cuantizaciones frente a versiones con imatrix.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/X-AQA-9B-GGUF
- Modelo base original: https://huggingface.co/Kelly0510/X-AQA-9B
- Pagina de descargas del autor: https://hf.tst.eu/model#X-AQA-9B-GGUF
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
