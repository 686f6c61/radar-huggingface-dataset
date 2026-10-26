# mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-GGUF

## Resumen

Ornith1.0-9B-3MPER0RR-abliterated-GGUF es el conjunto de cuantizaciones GGUF publicadas por mradermacher sobre el modelo 3MPER0RR/Ornith1.0-9B-3MPER0RR-abliterated, una variante del modelo Ornith-1.0-9B (ornith-ai) a la que se le ha aplicado una técnica de *abliteration* o ablación direccional para eliminar el comportamiento de rechazo (*refusal*) de los pesos. El resultado es un modelo conversacional de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) que responde a peticiones que un modelo alineado convencional rechazaría.

El repositorio no contiene pesos originales en safetensors, sino únicamente ficheros GGUF generados con llama.cpp en 12 tipos de cuantización distintos, desde Q2_K (3,9 GB) hasta F16 (18,0 GB), además de una variante con cuantización ponderada por matriz de importancia (imatrix) publicada en un repositorio aparte. Los metadatos declaran licencia MIT, idioma inglés y uso conversacional, lo que lo sitúa en la categoría de modelos de 9B ejecutables en una única GPU de consumo.

Su relevancia es doble: por un lado, ofrece un modelo de ~9B en formato GGUF listo para llama.cpp, Ollama o LM Studio con requisitos de hardware modestos; por otro, al tratarse de una variante sin rechazos, es material habitual para investigación en seguridad (red teaming, evaluación de clasificadores, estudio de direcciones de rechazo) y para generar datos sintéticos que alimenten filtros de seguridad. Para producción en aplicaciones de cara al usuario final presenta riesgos evidentes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card del repositorio GGUF no documenta la arquitectura del modelo base; solo se indica que deriva de 3MPER0RR/Ornith1.0-9B-3MPER0RR-abliterated) |
| Parametros totales | 8.953.803.264 (~8,95B), dato real de safetensors del modelo base |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; existe ademas una variante imatrix en repositorio separado |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero por cuantizacion); el modelo base se distribuye en safetensors/Transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada: la model card del repositorio GGUF es una plantilla de cuantizacion de mradermacher e incluye unicamente los metadatos de conversion (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`) y la lista de ficheros generados. No se detallan numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovacion tecnica documentada es la *abliteration*: una ablacion direccional aplicada sobre los pesos del modelo alineado para suprimir la direccion de activacion asociada al rechazo, de modo que el modelo deja de negarse a responder. Este proceso se aplica antes de la cuantizacion; las cuantizaciones de este repositorio son "static quants" (sin imatrix) generadas con llama.cpp a partir del modelo ya ablacionado, mientras que las versiones ponderadas por importancia se publican en `mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-i1-GGUF`. No hay informacion sobre el impacto de la ablacion en las capacidades del modelo (degradacion de razonamiento, codigo o coherencia), ni evaluaciones publicadas al respecto.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno (tag `conversational`).
- Respuesta a peticiones que modelos alineados rechazan, al haberse eliminado el comportamiento de rechazo mediante ablacion direccional.
- Escritura creativa y de ficcion sin filtros de contenido, incluyendo tematicas sensibles.
- Ejecucion local offline en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python).
- Base para *fine-tuning* posterior: al estar en licencia MIT y disponible en F16, puede servir como punto de partida para ajuste especifico.
- Generacion de datos sinteticos para entrenamiento de clasificadores de seguridad y filtros de contenido.
- No hay evidencia en la informacion disponible de soporte de *tool calling*, modo *thinking*, vision, audio ni capacidades de agente multi-paso.

## Casos de uso

- **Investigacion en seguridad y red teaming**: el modelo permite generar respuestas que un modelo alineado bloquearia, lo que facilita la construccion de conjuntos de evaluacion adversariales y la medicion de la robustez de clasificadores de contenido propios.
- **Generacion de datos sinteticos para filtros de seguridad**: se puede usar para producir pares pregunta-respuesta etiquetados como no seguros y entrenar o validar un moderador; el formato GGUF permite ejecutarlo en local sin enviar prompts sensibles a APIs externas.
- **Estudio de la ablacion direccional**: al existir variantes con y sin ablacion del mismo modelo base (Ornith-1.0-9B y la version abliterated), sirve para comparar activaciones y medir que capacidades se degradan al eliminar la direccion de rechazo.
- **Escritura de ficcion y contenido creativo sin restricciones**: para autores que necesitan narrativa con violencia, contenido adulto o tematicas delicadas, el modelo no interrumpe la generacion con negativas; con Q5_K_M (6,6 GB) cabe en GPU de 8-12 GB.
- **Asistente local de escritorio en inglés**: integrado via llama-cpp-python o LM Studio en una aplicacion de escritorio, funciona sin conexion y sin coste por token, adecuado para procesamiento de texto ofimatico, resumenes y reescritura.
- **Prototipado rapido de producto conversacional**: la licencia MIT y los ficheros GGUF de 5,7 GB (Q4_K_M) permiten levantar un endpoint compatible con OpenAI en minutos para validar una experiencia de chat antes de invertir en un modelo mayor.
- **Ajuste fino sobre dominio propio**: partir del F16 (18 GB) o Q8_0 (9,6 GB) para LoRA/QLoRA sobre jerga tecnica o de nicho, aprovechando que la licencia no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor del modelo base no aparece citado con evaluaciones en los resultados de busqueda consultados. Tampoco hay datos de latencia ni de throughput medidos.

## Requisitos de hardware

- **VRAM estimada para inferencia** (pesos + cache KV, valores orientativos a partir del tamano de fichero):

| Cuantizacion | Tamano en disco | VRAM minima practica | Notas |
|---|---:|---:|---|
| Q2_K | 3,9 GB | ~6 GB | Perdida de calidad apreciable |
| Q3_K_S / Q3_K_M / Q3_K_L | 4,4 / 4,7 / 5,0 GB | ~6-8 GB | Q3_K_M marcada por el autor como "lower quality" |
| IQ4_XS | 5,3 GB | ~7-8 GB | Mejor relacion calidad/tamano que Q3 |
| Q4_K_S / Q4_K_M | 5,5 / 5,7 GB | ~8 GB | Recomendadas por el autor ("fast, recommended") |
| Q5_K_S / Q5_K_M | 6,4 / 6,6 GB | ~9-10 GB | |
| Q6_K | 7,5 GB | ~10-12 GB | "very good quality" segun el autor |
| Q8_0 | 9,6 GB | ~12-14 GB | "fast, best quality" |
| F16 | 18,0 GB | ~22-24 GB | "overkill" segun el autor |

- **GPU recomendadas**: RTX 4090 (24 GB) para F16 o Q8_0 con contexto amplio; RTX 4080 / 4070 Ti Super (16 GB) para Q8_0 o Q6_K; RTX 4060 Ti 16 GB, RTX 4070 (12 GB) y RTX 3060 12 GB para Q5_K_M o Q6_K; GPUs de 8 GB (RTX 3070, RTX 4060) para Q4_K_M. En el segmento profesional, A100 40/80 GB y H100 permiten F16 con contexto largo y varios usuarios concurrentes, aunque estan sobredimensionadas para un modelo de 9B.
- **Cabe en GPU de consumo**: si, en toda la gama desde 8 GB con Q4_K_M. Con 6 GB (GTX 1660 Ti, RTX 2060) solo son viables Q2_K o Q3_K_S y con contexto corto.
- **Opciones de despliegue**: llama.cpp (referencia para estos ficheros), Ollama y LM Studio (importando el GGUF), llama-cpp-python para integracion en Python, text-generation-webui, koboldcpp. vLLM soporta GGUF de forma experimental; TGI no soporta GGUF, por lo que requeriria el modelo base en safetensors y Transformers.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Ornith1.0-9B-3MPER0RR-abliterated (este) | ~8,95B | No disponible | MIT | GGUF (12 cuantizaciones) | Variante sin rechazos; sin benchmarks publicados |
| Ornith-1.0-9B (modelo upstream) | ~9B | No disponible | No disponible en la informacion | Transformers | Version alineada de la que deriva; permite comparar el efecto de la ablacion |
| Llama 3.1 8B Instruct | ~8,03B | 128K | Llama 3.1 Community License | Safetensors, GGUF | Referencia de la categoria 8B; alineado y con amplio ecosistema de cuantizaciones |
| Qwen2.5 7B Instruct | ~7,62B | 128K | Apache 2.0 | Safetensors, GGUF | Alternativa permisiva con soporte multilingue amplio |
| Gemma 2 9B Instruct | ~9,24B | 8K | Gemma Terms of Use | Safetensors, GGUF | Tamano casi identico; contexto mas corto y licencia con restricciones de uso |

No se dispone de comparaciones de rendimiento verificables entre este modelo y las alternativas: al no haber benchmarks publicados del modelo base ni de la variante ablacionada, cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- **Ausencia de rechazos**: la ablacion direccional elimina el comportamiento de negativa, de modo que el modelo producira contenido dañino si se le solicita. No debe exponerse directamente a usuarios finales sin una capa de moderacion propia (filtro de entrada y de salida).
- **Riesgo legal y de cumplimiento**: en la UE, su uso en productos de cara al publico puede entrar en conflicto con obligaciones de la Ley de Servicios Digitales o con requisitos de moderacion de contenidos; la licencia MIT no exime de responsabilidad sobre las salidas generadas.
- **Idioma**: solo se declara ingles. El rendimiento en castellano no esta documentado y, aunque el tokenizador pueda cubrirlo parcialmente, no hay garantias de calidad.
- **Alucinacion**: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de veracidad; al tratarse de un modelo pequeno (9B) y ablacionado, es esperable una fiabilidad menor en tareas de conocimiento factual, aunque no se ha medido.
- **Degradacion por ablacion**: la supresion de una direccion de activacion puede afectar a otras capacidades (coherencia, razonamiento, instruction following). No se han publicado evaluaciones que cuantifiquen ese efecto.
- **Contexto desconocido**: se desconoce la ventana de contexto real; asumir valores altos (32K o mas) sin verificacion puede provocar degradacion silenciosa en conversaciones largas.
- **Cuantizaciones de baja precision**: Q2_K y Q3_K_M estan marcadas por el propio autor como de menor calidad; para uso en produccion conviene partir de Q4_K_M o superior.
- **Procedencia**: se trata de una cuantizacion de terceros sobre una ablacion tambien de terceros; no hay garantia de que el proceso se haya validado, ni de que el modelo base no haya sido alterado mas alla de la ablacion.
- **Sin soporte comercial**: el repositorio lo mantiene un particular (mradermacher) con el respaldo de su empresa nethype GmbH, sin SLA ni canal de soporte.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-GGUF
- Modelo base ablacionado: https://huggingface.co/3MPER0RR/Ornith1.0-9B-3MPER0RR-abliterated
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Ornith1.0-9B-3MPER0RR-abliterated-i1-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Ornith1.0-9B-3MPER0RR-abliterated-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/ornith1.0-9b-3mper0rr-abliterated/
- Indice de modelos ablacionados: https://www.abliteratedmodels.org/
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
- Variantes relacionadas de la familia (referencia): https://huggingface.co/mradermacher/Ornith1.5-9B-3MPER0RR-obliterated-i1-GGUF y https://huggingface.co/mradermacher/Ornith-1.0-9B-abliterated-fable-GGUF
