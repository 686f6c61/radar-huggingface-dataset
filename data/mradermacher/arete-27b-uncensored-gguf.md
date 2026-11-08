# mradermacher/Arete-27B-Uncensored-GGUF

## Resumen

Arete-27B-Uncensored-GGUF es la distribucion en formato GGUF del modelo SargeDev/Arete-27B-Uncensored, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de la familia Qwen (la etiqueta "qwen3.8" aparece en los metadatos del autor). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que ofrece aqui cuantizaciones estaticas listas para su uso con llama.cpp y herramientas compatibles.

El modelo base ha sido sometido a un proceso de "abliteration", una tecnica de modificacion de pesos orientada a eliminar o atenuar los mecanismos de rechazo y las capas de alineacion de seguridad, de modo que el modelo responde sin las negativas tipicas de los modelos alineados. Esto lo situa en la categoria de modelos "uncensored", pensados para investigacion sobre alineacion, red teaming, generacion creativa sin restricciones y experimentacion con comportamiento libre de rechazos.

La relevancia practica de esta ficha esta en la disponibilidad de cuantizaciones GGUF de entre 11,0 GB (Q2_K) y 29,1 GB (Q8_0), que permiten ejecutar un modelo de 27B en hardware de consumo con suficiente memoria, algo imposible con los pesos completos en precision alta. La licencia Apache 2.0 facilita el uso comercial, aunque las implicaciones eticas del modelo base deben evaluarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, etiqueta "qwen3.8" en metadatos); detalles de atencion y capas no disponibles |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales del modelo base en safetensors |
| Tamano del repo | 173,8 GB |
| Modelo base | SargeDev/Arete-27B-Uncensored |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los metadatos incluyen la etiqueta "qwen3.8", lo que sugiere que Arete-27B-Uncensored deriva de un modelo de la familia Qwen (probablemente Qwen3 en su variante de aproximadamente 27B), pero no se confirma oficialmente ni se aportan datos sobre numero de capas, dimensiones ocultas, tipo de atencion (completa, GQA, lineal) ni estrategia de RoPE.

Respecto al entrenamiento, la model card no proporciona informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares. Lo unico documentado es que el modelo ha pasado por un proceso de "abliteration", una modificacion post-entrenamiento que ajusta los pesos para suprimir el comportamiento de rechazo. No se especifica la tecnica concreta (por ejemplo, ablacion de direcciones de rechazo en el espacio de activaciones) ni el impacto en las capacidades generales. El trabajo de mradermacher consiste exclusivamente en la conversion y cuantizacion a GGUF, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat esperado por el modelo base.
- Comportamiento "uncensored": responde a peticiones que los modelos alineados rechazarian, segun la naturaleza del proceso de abliteration.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen, aunque no se documentan explicitamente en la model card.
- Soporte multilingue limitado: el unico idioma declarado es el ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" explicito.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") para despliegue en infraestructura de Hugging Face.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad general de las respuestas, comparando con el modelo base alineado.
- Red teaming y evaluacion de riesgos: util para generar respuestas sin filtros en entornos controlados y analizar que tipos de contenido produce un modelo sin capas de seguridad.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las negativas tipicas de modelos alineados, en un contexto editorial controlado.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) mediante llama.cpp u Ollama.
- Experimentacion con cuantizacion: el repo ofrece un espectro amplio de cuantizaciones (de Q2_K a Q8_0) que permite medir el impacto de la compresion en la perplejidad y la calidad de las respuestas.
- Prototipado de asistentes conversacionales en ingles: para proyectos donde se requiera un modelo de 27B con licencia Apache 2.0 y sin restricciones de contenido, siempre con supervision humana y filtros externos.
- Fine-tuning sobre la base cuantizada: util para experimentar con LoRA o adaptadores sobre el modelo abliterated en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se aportan datos de perplejidad por cuantizacion mas alla del grafico generico enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: aproximadamente 11,0 GB de pesos; requiere unos 12-13 GB de VRAM.
  - Q4_K_M: aproximadamente 16,9 GB de pesos; requiere unos 18-20 GB de VRAM.
  - Q5_K_M: aproximadamente 19,6 GB de pesos; requiere unos 21-23 GB de VRAM.
  - Q6_K: aproximadamente 22,5 GB de pesos; requiere unos 24-26 GB de VRAM.
  - Q8_0: aproximadamente 29,1 GB de pesos; requiere unos 31-33 GB de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, H100 80 GB o RTX 6000 Ada para Q8_0 y precisiones superiores; configuraciones multi-GPU para los pesos sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requeririan los pesos safetensors originales).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, cuantizaciones de 11 a 29 GB |
| SargeDev/Arete-27B-Uncensored | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/Arete-27B-GGUF | 27B | no disponible | no disponible | GGUF | Version GGUF del modelo sin el proceso de abliteration |
| mradermacher/Arete-27B-i1-GGUF | 27B | no disponible | no disponible | GGUF (imatrix) | Cuantizaciones ponderadas con imatrix, calidad superior a igual tamano |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina o reduce los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No es apto para despliegues publicos sin filtros externos y supervision humana.
- Riesgo elevado de alucinacion: no se documenta ningun proceso de alineacion o verificacion de hechos tras la abliteration, y el modelo base tampoco aporta garantias.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre el contenido generado; la licencia no exime de cumplir la normativa aplicable (por ejemplo, la AI Act europea o la legislacion sobre contenido ilegal).
- Sesgos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, religion u orientacion politica; la ausencia de alineacion puede amplificarlos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que cualquier decision de adopcion debe basarse en evaluacion propia.
- Repo de gran tamano (173,8 GB): la descarga completa es costosa; conviene descargar solo el archivo de la cuantizacion deseada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Arete-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Arete-27B-Uncensored-i1-GGUF
- Version GGUF sin abliteration: https://huggingface.co/mradermacher/Arete-27B-GGUF
- Version imatrix de la variante sin abliteration: https://huggingface.co/mradermacher/Arete-27B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Arete-27B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
