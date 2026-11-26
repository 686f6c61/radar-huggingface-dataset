# mradermacher/EXAONE-3.5-32B-Instruct-abliterated-GGUF

## Resumen

EXAONE-3.5-32B-Instruct-abliterated-GGUF es una distribucion en formato GGUF del modelo EXAONE-3.5-32B-Instruct al que se le ha aplicado una tecnica de "abliteration" para eliminar los rechazos (refusals) del alineamiento original. El modelo base original es EXAONE-3.5-32B-Instruct, desarrollado por LG AI Research, un transformer denso de 32.003.200.064 parametros (aproximadamente 32B) entrenado para tareas conversacionales e instructivas en ingles y coreano. La version abliterated ha sido publicada por huihui-ai, y la cuantizacion GGUF la realiza mradermacher.

El interes de esta ficha radica en que combina un modelo de gran tamano (32B) con cuantizaciones que permiten su despliegue en hardware de consumo, ademas de ofrecer una variante sin los filtros de rechazo tipicos del alineamiento, lo que resulta relevante para investigacion sobre seguridad, red-teaming y estudios de comportamiento de modelos. La licencia es la propia de EXAONE (no comercial en su mayoria, con condiciones especificas), lo que condiciona fuertemente su uso en produccion.

El repositorio incluye 11 cuantizaciones estaticas que van desde Q2_K (12,0 GB) hasta Q8_0 (34,1 GB), lo que permite elegir el equilibrio entre calidad y requisitos de memoria. Existe tambien un repositorio hermano con cuantizaciones ponderadas/imatrix (i1-GGUF) para quienes priorizan la calidad por bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), derivado de EXAONE-3.5-32B-Instruct |
| Parametros totales | 32.003.200.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | en, ko |
| Licencia | EXAONE (license: other, license_name: exaone) |
| Formato de pesos | GGUF (repo de 218,2 GB con todas las cuantizaciones); safetensors en el modelo base |
| Modelo base | huihui-ai/EXAONE-3.5-32B-Instruct-abliterated |
| Autor de la cuantizacion | mradermacher |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso decoder-only de aproximadamente 32B parametros, correspondiente al modelo EXAONE-3.5-32B-Instruct de LG AI Research. Sobre ese modelo, huihui-ai aplico la tecnica de abliteration, que consiste en identificar la direccion del espacio de activaciones responsable de los comportamientos de rechazo y proyectarla fuera de los pesos, de modo que el modelo deja de negarse a responder a ciertas peticiones. Este proceso no reentrena el modelo desde cero, sino que modifica los pesos del modelo ya alineado.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo original; esos datos corresponden a la model card de EXAONE-3.5-32B-Instruct, que no se incluye en la informacion proporcionada. La cuantizacion realizada por mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye tanto cuantizaciones K-quant clasicas como IQ4_XS, ademas de un repositorio separado con cuantizaciones ponderadas/imatrix para mayor fidelidad por bit.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y coreano.
- Razonamiento e instrucciones generales, heredadas del modelo Instruct original.
- Generacion de codigo y matematicas (capacidad esperable del modelo base EXAONE-3.5-32B-Instruct, aunque no se aportan benchmarks en la informacion disponible).
- Comportamiento "uncensored": la abliteration elimina los rechazos del alineamiento, permitiendo respuestas a peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a en y ko segun los tags del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo permite estudiar como la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparando con el modelo original en experimentos controlados de red-teaming.
- Red-teaming y evaluacion de robustez: util para generar respuestas a prompts adversarios y medir la eficacia de filtros externos, ya que el modelo no aplica rechazos internos.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (19,4 GB) o Q4_K_S (18,4 GB) puede ejecutarse en GPUs de 24 GB como la RTX 4090, o en configuraciones con RAM suficiente mediante llama.cpp.
- Generacion de texto en coreano e ingles: adecuado para tareas de redaccion, resumen y traduccion entre ambos idiomas en entornos donde la licencia EXAONE lo permita.
- Experimentacion con cuantizaciones: el repositorio ofrece 11 variantes estaticas y un repositorio imatrix, lo que permite comparar calidad frente a tamano en pipelines de evaluacion propios.
- Prototipado de asistentes conversacionales sin restricciones: para pruebas internas de producto donde se necesita un modelo que no decline peticiones, siempre que se respete la licencia y se anada moderacion externa.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, las cuantizaciones permiten evaluaciones rapidas antes de pasar al modelo en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (aproximada, incluye overhead minimo):
  - Q2_K: ~12,0 GB
  - Q3_K_S: ~14,1 GB
  - Q3_K_M: ~15,6 GB
  - Q3_K_L: ~16,9 GB
  - IQ4_XS: ~17,5 GB
  - Q4_K_S: ~18,4 GB
  - Q4_K_M: ~19,4 GB
  - Q5_K_S: ~22,2 GB
  - Q5_K_M: ~22,8 GB
  - Q6_K: ~26,4 GB
  - Q8_0: ~34,1 GB
- GPU recomendadas: A100 40/80 GB, H100 para las cuantizaciones mayores (Q6_K, Q8_0) o para mayor throughput; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen ajustado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y posible offload a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a traves de herramientas de inferencia.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EXAONE-3.5-32B-Instruct-abliterated-GGUF (este) | 32B | no disponible | EXAONE (other) | GGUF | Abliterated, en/ko |
| EXAONE-3.5-32B-Instruct (original) | 32B | no disponible | EXAONE (other) | safetensors | Con alineamiento y rechazos |
| huihui-ai/EXAONE-3.5-32B-Instruct-abliterated | 32B | no disponible | EXAONE (other) | safetensors | Version abliterated sin cuantizar |
| Otros modelos abliterated de ~32B | no disponible | no disponible | variable | GGUF/safetensors | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La abliteration elimina los rechazos del alineamiento, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado; no debe desplegarse sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 32B, no cuantificado en la informacion disponible.
- Idiomas soportados limitados a ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- La licencia EXAONE es restrictiva: no es una licencia open source permisiva y condiciona el uso comercial; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El modelo base es una modificacion no oficial de EXAONE; LG AI Research no respalda esta variante.
- El repositorio tiene un tamano de 218,2 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- No hay datos publicados de benchmarks para esta variante concreta, por lo que las afirmaciones de calidad deben validarse con evaluaciones propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EXAONE-3.5-32B-Instruct-abliterated-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/EXAONE-3.5-32B-Instruct-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/EXAONE-3.5-32B-Instruct-abliterated
- Pagina de resumen del autor: https://hf.tst.eu/model#EXAONE-3.5-32B-Instruct-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
