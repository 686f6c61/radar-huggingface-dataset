# mradermacher/Sexpedition-MS3.2-24B-GGUF

## Resumen

Sexpedition-MS3.2-24B-GGUF es la distribucion en formato GGUF del modelo fusionado Sexpedition-MS3.2-24B, publicada por el cuantizador habitual de la comunidad mradermacher. El modelo original, alojado por Aleteian, es un merge generado con mergekit y lazymergekit, segun las etiquetas de la model card. Esta version no entrena pesos nuevos, sino que empaqueta el modelo base en una bateria de cuantizaciones estaticas listas para su uso con llama.cpp y ecosistemas compatibles.

El modelo cuenta con 23.572.403.200 parametros (aproximadamente 23,6 mil millones) en precision completa, y se distribuye en once cuantizaciones que van desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB). El repositorio completo ocupa 161,4 GB. La model card declara unicamente el idioma ingles y no especifica licencia, contexto ni detalles de arquitectura o entrenamiento, por lo que buena parte de las especificaciones tecnicas no estan disponibles.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores evaluar rapidamente si esta distribucion GGUF encaja en su hardware y flujo de trabajo, que cuantizaciones existen, y que limitaciones documentales presenta antes de invertir tiempo en su despliegue. Al tratarse de un merge sin model card tecnica detallada, la trazabilidad de datos de entrenamiento y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit/lazymergekit; arquitectura subyacente no documentada) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; existen variantes imatrix en repositorio separado) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas de la model card indican que se trata de un merge construido con mergekit y lazymergekit, tecnicas de fusion de pesos que combinan dos o mas modelos preentrenados sin un ciclo de entrenamiento adicional. El modelo base declarado es Aleteian/Sexpedition-MS3.2-24B, y esta publicacion de mradermacher es una conversion y cuantizacion estatica del mismo (quantize_version 2, output_tensor_quantised 1, convert_type hf).

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta que modelos participan en la fusion ni con que pesos. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto en ingles, segun el unico idioma declarado en la model card.
- Al ser un merge de modelos de ~24B, es razonable esperar capacidades generales de razonamiento y codigo, pero no hay documentacion que lo confirme; se indica como no verificado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints, sin mas detalle.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU consumer: las cuantizaciones Q4_K_S (13,6 GB) y Q4_K_M (14,4 GB) permiten ejecutar el modelo en GPUs con 16 GB de VRAM o en configuraciones con offload parcial a CPU, usando llama.cpp.
- Prototipado rapido de aplicaciones de texto en ingles: la disponibilidad de Q2_K (9,0 GB) facilita pruebas en hardware modesto antes de escalar a cuantizaciones mayores.
- Evaluacion comparativa de merges: investigadores que estudian tecnicas de fusion con mergekit pueden usar esta distribucion para medir el comportamiento de un merge de ~24B en tareas de generacion en ingles.
- Servicio de inferencia en servidores con A100 o H100: las cuantizaciones Q6_K (19,4 GB) y Q8_0 (25,2 GB) ofrecen alta fidelidad respecto al modelo original para despliegues en produccion con llama.cpp o servidores compatibles.
- Fine-tuning ligero sobre la version cuantizada: aunque el fine-tuning directo sobre GGUF es limitado, la cuantizacion Q8_0 puede servir como referencia de comportamiento antes de adaptar el modelo base en safetensors.
- Educacion y experimentacion: el rango completo de cuantizaciones permite ilustrar el compromiso entre tamano, calidad y velocidad en un modelo de ~24B, util en cursos y talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q3_K_M ~11,6 GB; Q3_K_L ~12,5 GB; IQ4_XS ~13,0 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_S ~16,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para Q6_K y Q8_0 con contexto amplio; RTX 4090 (24 GB) para Q5_K_M y hasta Q6_K con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M con margen ajustado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) para todas las cuantizaciones hasta Q8_0 con contexto limitado; en GPUs de 16 GB para Q4_K_S/Q4_K_M; en GPUs de 12 GB solo con offload parcial a CPU o cuantizaciones Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sexpedition-MS3.2-24B-GGUF (este) | ~23,6 B | no disponible | no disponible | GGUF | Merge con mergekit; solo ingles declarado |
| Modelo base Aleteian/Sexpedition-MS3.2-24B | ~23,6 B | no disponible | no disponible | safetensors (presumible) | Origen del merge; sin model card tecnica detallada en la informacion disponible |
| Variante imatrix mradermacher/Sexpedition-MS3.2-24B-i1-GGUF | ~23,6 B | no disponible | no disponible | GGUF (i1) | Cuantizaciones ponderadas con imatrix, mayor calidad a igual tamano |

No se dispone de datos de rendimiento ni de modelos comparables con especificaciones verificables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial esta permitido; es un bloqueante para produccion hasta aclararlo con el autor.
- Model card practicamente vacia: no hay informacion sobre arquitectura, datos de entrenamiento, contexto ni evaluaciones, lo que dificulta la validacion tecnica.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y agravado por la falta de evaluaciones publicadas.
- Merge sin trazabilidad: al ser una fusion con mergekit, los modelos constituyentes y sus pesos no estan documentados, lo que complica la auditoria de sesgos y procedencia de datos.
- Sesgos conocidos: no documentados; se desconoce la composicion del dataset de los modelos fusionados.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin verificar empiricamente la ventana real soportada.
- Repositorio de gran tamano (161,4 GB): la descarga completa no es practica; conviene descargar solo la cuantizacion necesaria.
- Cuantizaciones Q2_K y Q3_K_M marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sexpedition-MS3.2-24B-GGUF
- Modelo base: https://huggingface.co/Aleteian/Sexpedition-MS3.2-24B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Sexpedition-MS3.2-24B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Sexpedition-MS3.2-24B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
