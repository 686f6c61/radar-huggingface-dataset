# mradermacher/MFANN-Phigments12-slerp-GGUF

## Resumen

MFANN-Phigments12-slerp-GGUF es la version cuantizada en formato GGUF del modelo merge `netcat420/MFANN-Phigments12-slerp`, publicada por el usuario mradermacher, especializado en la conversion de modelos a GGUF para inferencia local. Se trata de un merge de modelos realizado con mergekit (concretamente la variante lazymergekit), que combina los pesos de `liminerity/Phigments12` y `netcat420/MFANN3bv0.6` mediante la tecnica SLERP (spherical linear interpolation).

El modelo cuenta con aproximadamente 2.780 millones de parametros (2,779.683.840 segun los pesos en safetensors) y esta orientado exclusivamente al idioma ingles. La relevancia de esta publicacion reside en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware consumer con requisitos de VRAM muy moderados, algo imprescindible para un modelo de este tamano que no dispone de versiones oficiales optimizadas para llama.cpp.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integracion en productos derivados. No obstante, la informacion tecnica publicada por el autor es muy escasa: no se detallan datos de entrenamiento, contexto nativo ni resultados de benchmarks. Esta ficha refleja unicamente los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos mediante SLERP con mergekit/lazymergekit); detalles de arquitectura interna no disponibles |
| Parametros totales | 2.779.683.840 (~2,78 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de pesos, no de un entrenamiento desde cero. Concretamente, se combinan `liminerity/Phigments12` y `netcat420/MFANN3bv0.6` mediante SLERP, una interpolacion esferica entre tensores que suaviza la transicion entre ambos modelos y suele producir un modelo hibrido que hereda capacidades de sus componentes. La herramienta empleada es mergekit en su variante lazymergekit, que permite realizar el merge sin cargar ambos modelos completos en memoria simultaneamente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si los modelos de origen emplearon RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas propias mas alla del propio proceso de merge. El unico detalle tecnico adicional que aporta la model card es que las cuantizaciones son estaticas (no se han publicado variantes con imatrix ni ponderadas por importancia), y que la conversion se realizo con la version 2 de la herramienta de cuantizacion del autor, con `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto en ingles: al ser un merge de modelos base, conserva la capacidad generativa de sus componentes, aunque sin documentacion especifica sobre calidad.
- Razonamiento y conversacion: no hay evidencia publicada de modos de razonamiento explicito (thinking mode) ni de capacidades de agente.
- Codigo y matematicas: no documentadas para este merge concreto.
- Tool calling / function calling: no documentado; no se puede asumir su soporte.
- Capacidades multilingues: limitadas al ingles segun la model card; sin soporte declarado de otros idiomas.
- Capacidades especiales (vision, audio): no disponibles.
- Ejecucion local eficiente: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en CPU y GPU de gama baja, lo que constituye su principal valor practico.

## Casos de uso

- Prototipado local en equipos sin GPU dedicada: con la cuantizacion Q4_K_M (1,8 GB) el modelo puede ejecutarse en CPU mediante llama.cpp u Ollama, lo que permite experimentar con un modelo de 2,78 B de parametros en un portatil convencional sin acelerador.
- Generacion de texto en ingles para tareas de relleno o creatividad: borradores, resumenes informales o continuaciones de texto donde no se requiera maxima calidad, aprovechando la velocidad de las cuantizaciones Q4/Q5.
- Evaluacion comparativa de merges: investigadores que estudien el efecto de la tecnica SLERP pueden usar este modelo como referencia de como se comporta un merge de Phigments12 y MFANN3bv0.6 frente a sus componentes originales.
- Despliegue en dispositivos de borde (edge): con Q2_K (1,2 GB) o Q3_K_S (1,4 GB) cabe en dispositivos con 2-3 GB de RAM disponible, util para demos offline o entornos embebidos con llama.cpp.
- Base para fine-tuning ligero en ingles: al estar en Apache 2.0 y ser relativamente pequeno, puede servir como punto de partida para ajustes con LoRA en tareas especificas de dominio en ingles.
- Experimentacion con pipelines de cuantizacion: el repositorio documenta doce variantes de cuantizacion, lo que lo convierte en un caso de estudio util para comparar perplejidad y calidad entre tipos de quant (Q2_K frente a IQ4_XS, por ejemplo) en un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad para ninguna de las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (segun cuantizacion): Q2_K ~1,2 GB; Q3_K_S ~1,4 GB; Q4_K_M ~1,8 GB; Q5_K_M ~2,1 GB; Q6_K ~2,4 GB; Q8_0 ~3,1 GB; f16 ~5,7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar Q4_K_M o Q5_K_M con comodidad; una RTX 3060 (12 GB) o superior permite cargar Q8_0 o f16 completo en VRAM. Para f16 en GPU profesional, una A100 o H100 es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (GTX 1650 4 GB en adelante con cuantizaciones Q4/Q5); en iGPU y CPU tambien es viable con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, y servidores compatibles con GGUF como text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no son opciones directas.
- Latencia y throughput: no disponibles en la informacion proporcionada; a modo orientativo, un modelo de ~2,8 B en Q4_K_M suele generar decenas de tokens por segundo en CPU moderna y cientos en GPU consumer, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MFANN-Phigments12-slerp (este) | ~2,78 B | No disponible | Apache 2.0 | GGUF | Merge SLERP sin benchmarks publicados |
| netcat420/MFANN3bv0.6 (componente) | No disponible | No disponible | No disponible | safetensors | Modelo de origen del merge |
| liminerity/Phigments12 (componente) | No disponible | No disponible | No disponible | safetensors | Modelo de origen del merge |
| Modelos de ~3 B de la familia Llama/Qwen | ~3 B | 4k-32k segun variante | Variable | GGUF, safetensors | Alternativas consolidadas con benchmarks publicados |

La comparacion con alternativas consolidadas no puede hacerse con datos de rendimiento porque este merge no publica metricas. En terminos de licencia y disponibilidad, Apache 2.0 y la amplia gama de cuantizaciones GGUF son sus principales ventajas frente a modelos de tamano similar con licencias mas restrictivas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que este merge supere a sus componentes originales; los merges SLERP pueden degradar capacidades si los modelos de origen son muy dispares.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado.
- Riesgo de alucinacion: al no documentarse alineacion (RLHF/DPO) en los modelos de origen, el riesgo de generar contenido incorrecto con seguridad aparente es alto.
- Contexto desconocido: se desconoce la ventana de contexto nativa, lo que impide planificar casos de uso con documentos largos sin pruebas empiricas previas.
- Cuantizaciones estaticas: no hay versiones con imatrix, que suelen ofrecer mejor calidad por bit; las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la coherencia.
- Proceso de merge opaco: no se documentan los pesos o ratios del SLERP ni las versiones exactas de mergekit, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar de forma independiente las licencias de los modelos de origen (`liminerity/Phigments12` y `netcat420/MFANN3bv0.6`), ya que un merge no puede otorgar mas derechos que los que tenian sus componentes.
- Modelo de nicho: con 216 descargas y 0 likes en el momento de la consulta, carece de validacion por parte de la comunidad; no se recomienda para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MFANN-Phigments12-slerp-GGUF
- Modelo base del merge: https://huggingface.co/netcat420/MFANN-Phigments12-slerp
- Componente del merge: https://huggingface.co/liminerity/Phigments12
- Componente del merge: https://huggingface.co/netcat420/MFANN3bv0.6
- Pagina de descargas del autor: https://hf.tst.eu/model#MFANN-Phigments12-slerp-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
