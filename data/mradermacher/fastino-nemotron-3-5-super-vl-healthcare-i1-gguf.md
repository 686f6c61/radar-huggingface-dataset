# mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-i1-GGUF

## Resumen

Fastino-Nemotron-3.5-Super-VL-Healthcare es un modelo de lenguaje y vision especializado en el dominio sanitario, desarrollado por Fastino como un ajuste fino del modelo Nemotron de NVIDIA. Esta ficha corresponde concretamente a la version cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante tecnicas de cuantizacion con matriz de importancia (imatrix).

El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 123.611.033.088 parametros totales, lo que lo situa en la categoria de modelos de gran escala orientados a razonamiento clinico, extraccion de informacion de documentos medicos y conversacion especializada. Su orientacion a healthcare lo hace relevante para equipos que necesitan procesar texto clinico con un modelo de codigo abierto y licencia permisiva.

La aportacion principal de este repositorio no es el modelo en si, sino la bateria de cuantizaciones GGUF (desde i1-Q2_K hasta i1-Q6_K) que permiten ejecutar un modelo de mas de 120.000 millones de parametros en hardware de consumo o en servidores con VRAM moderada, manteniendo en la medida de lo posible la calidad del modelo original gracias al uso de imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 123.611.033.088 (123,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-IQ4_XS, i1-Q3_K_M, i1-Q4_0, i1-Q3_K_L, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino del Nemotron de NVIDIA, segun indican las etiquetas del repositorio (nemotron, mixture-of-experts, fine-tuned). Se trata por tanto de una arquitectura de mezcla de expertos, aunque la model card no detalla el numero de expertos, la dimension oculta, el numero de capas ni el mecanismo de enrutamiento. Tampoco se especifica el volumen de tokens de entrenamiento ni la composicion del dataset de ajuste fino sanitario.

La informacion disponible no incluye detalles sobre el proceso de alineacion (RLHF, DPO u otras tecnicas), ni sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Lo que si se documenta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (version 2, con conversion a formato HF y cuantizacion de tensores de salida), lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes, especialmente en rangos bajos como IQ3 e IQ4.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dominios clinicos y sanitarios.
- Razonamiento medico (etiqueta medical-reasoning): resolucion de preguntas clinicas y analisis de casos.
- Extraccion de informacion de documentos sanitarios (information-extraction): historiales, informes, notas clinicas.
- Procesamiento de vision y lenguaje (VL), segun el nombre del modelo, aunque la model card no detalla las capacidades multimodales concretas.
- Ajuste fino especifico para healthcare y clinical, lo que orienta su comportamiento hacia terminologia y tareas del sector.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en infraestructuras de inferencia estandar.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de entidades clinicas: el modelo puede procesar informes medicos y extraer diagnosticos, medicamentos, dosis y procedimientos, aprovechando su ajuste fino en information-extraction para reducir errores de interpretacion.
- Asistencia a la codificacion clinica: apoyo en la asignacion de codigos CIE/SNOMED a partir de texto libre de historiales, usando el modelo como primer paso de un pipeline con revision humana.
- Resumen de notas clinicas: generacion de resumenes de encuentros medicos para revision por parte de profesionales, con la ventaja de un modelo especializado en terminologia sanitaria.
- Preguntas y respuestas sobre literatura medica: consulta de guias clinicas y articulos, con la cautela de que el modelo solo opera en ingles y requiere validacion profesional.
- Triaje conversacional: clasificacion inicial de sintomas descritos por el paciente en un chatbot, derivando a un profesional cuando sea necesario; el modelo puede gestionar conversaciones multi-turno, aunque la longitud de contexto no esta documentada.
- Despliegue en entornos con GPU limitada: gracias a las cuantizaciones i1-Q4_K_M (88,5 GB) o i1-IQ3_M (62,3 GB), es posible ejecutar el modelo en servidores con una o varias GPU de 80 GB, algo inviable con los pesos originales en precision completa.
- Investigacion en NLP clinico: uso del modelo como base para experimentos academicos sobre razonamiento medico, con la ventaja de una licencia Apache 2.0 que permite modificacion y redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: desde aproximadamente 55 GB (i1-Q2_K) hasta 116 GB (i1-Q6_K); la opcion recomendada i1-Q4_K_M ocupa 88,5 GB.
- GPU recomendadas: para las cuantizaciones mayores, multiples A100/H100 de 80 GB o configuraciones multi-GPU; para i1-Q2_K e i1-IQ3_S, una sola A100/H100 de 80 GB podria ser suficiente, aunque no se confirma el desglose de memoria por capas.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual en una sola unidad; seria necesario repartir el modelo entre varias GPU o usar memoria del sistema con llama.cpp, con latencia muy alta.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Super-VL-Healthcare (i1-GGUF) | 123,6 mil millones (MoE) | no disponible | Apache 2.0 | GGUF | Ajuste fino sanitario; cuantizaciones imatrix |
| Modelo base fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare | 123,6 mil millones (MoE) | no disponible | Apache 2.0 | safetensors | Sin cuantizar; requiere hardware de gama alta |
| Nemotron (NVIDIA, familia base) | no disponible | no disponible | no disponible | no disponible | Modelo origen sobre el que se construye el ajuste fino |
| Alternativas sanitarias de codigo abierto (p. ej. Meditron, BioMistral) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para una comparacion cuantitativa |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Es un modelo especializado en salud: sus respuestas no constituyen consejo medico y requieren supervision de profesionales cualificados antes de cualquier uso clinico.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente grave en contextos medicos (dosis, diagnosticos, interacciones).
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre datos no especificados, pueden persistir sesgos demograficos y clinicos del corpus original.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con documentos largos.
- El repositorio GGUF ocupa 1066,6 GB en total; la descarga de todas las cuantizaciones es inviable para la mayoria de usuarios, por lo que conviene descargar solo la variante necesaria.
- Las cuantizaciones de muy baja precision (i1-Q2_K) degradan la calidad; para uso sanitario se recomienda i1-Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, el uso en produccion sanitaria puede estar sujeto a normativas adicionales (MDR, GDPR, HIPAA) que el modelo no cubre.
- No hay informacion sobre el proceso de entrenamiento, lo que dificulta evaluar la calidad y procedencia de los datos clinicos utilizados.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-i1-GGUF
- Modelo base: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Super-VL-Healthcare
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Fastino-Nemotron-3.5-Super-VL-Healthcare-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Fastino-Nemotron-3.5-Super-VL-Healthcare-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
