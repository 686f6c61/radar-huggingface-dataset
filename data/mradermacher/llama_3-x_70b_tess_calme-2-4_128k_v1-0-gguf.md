# mradermacher/Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-GGUF

## Resumen

Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-GGUF es la version cuantizada en formato GGUF del modelo fusionado Nexesenex/Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0, publicada por mradermacher el 17 de marzo de 2025. Se trata de un merge de modelos de la familia Llama 3.x de 70.000 millones de parametros, orientado a conversacion y con una ventana de contexto declarada de 128K tokens, segun se deduce del propio nombre del modelo. La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y el resultado esta pensado para su uso con llama.cpp y runtimes compatibles.

El modelo base es un merge generado con mergekit, una herramienta que combina los pesos de varios modelos para obtener capacidades hibridas sin entrenamiento adicional. Esto implica que las caracteristicas finales dependen de los modelos de origen, que no se detallan en la informacion disponible. El repositorio incluye unicamente pesos cuantizados estaticos (Q2_K hasta Q8_0), no los pesos originales en safetensors, aunque el dato de parametros totales (70.553.772.096) corresponde al modelo base.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 70B en hardware mas modesto que el requerido por los pesos en precision completa (aproximadamente 141 GB en FP16), a costa de perdida de calidad segun la cuantizacion elegida. El repo ocupa 481,3 GB e incluye 41 descargas en el momento de la consulta. No se dispone de informacion sobre licencia, pipeline ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.x, fusionada con mergekit; detalles no disponibles) |
| Parametros totales | 70.553.772.096 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 128K tokens (segun el nombre del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; sin safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit, lo que significa que sus pesos resultan de la combinacion aritmetica de dos o mas modelos de la familia Llama 3.x de 70B. No se trata de un modelo entrenado desde cero ni de un fine-tuning supervisado clasico, sino de una fusion que busca heredar capacidades de los modelos fuente. La informacion disponible no especifica la tecnica de merge concreta (SLERP, TIES, DARE, passthrough, etc.), ni los modelos de origen, ni los hiperparametros empleados.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La arquitectura subyacente es la de Llama 3.x: un transformer decoder-only con atencion multi-cabeza agrupada (GQA), aunque los detalles exactos de capas, dimensiones y cabezas no se detallan en la model card. La extension a 128K de contexto, si es real, se habria heredado del modelo base o de los modelos fusionados, pero no se documenta el metodo (RoPE scaling, YaRN, etc.).

La cuantizacion la realiza mradermacher con un flujo que, segun los metadatos de la model card, corresponde a quantize_version 2 y output_tensor_quantised 1, con convert_type hf. Se ofrecen cuantizaciones estaticas; las versiones con imatrix (prefijo i1) estan en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos Llama 3.x fusionados (sin evaluacion publicada que lo confirme).
- Posible soporte de contexto largo (hasta 128K tokens segun el nombre), util para documentos extensos, aunque no verificado en la model card.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Compatible con endpoints y runtimes que aceptan GGUF (llama.cpp, Ollama, etc.), segun los tags del repositorio.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con una cuantizacion Q4_K_M (42,6 GB) el modelo puede ejecutarse en estaciones de trabajo con 48 GB de VRAM o en configuraciones con offload a RAM, permitiendo iterar sobre prompts y flujos de dialogo sin depender de APIs.
- Procesamiento de documentos largos: si la ventana de 128K tokens es funcional, permite resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada, aunque la calidad en contextos muy largos no esta verificada.
- Experimentacion con tecnicas de merge: investigadores interesados en mergekit pueden usar este modelo como referencia de como se comporta un merge de 70B cuantizado frente a los modelos originales en tareas de generacion.
- Despliegue en entornos con GPU de gama alta pero no H100: con Q4_K_S o Q4_K_M cabe en una A100 de 80 GB o en dos RTX 4090 de 24 GB con tensor parallelism o capas divididas, ofreciendo una alternativa de bajo coste a modelos de 70B en FP16.
- Generacion de texto creativo y redaccion en ingles: el modelo puede emplearse para borradores, reescritura y variaciones estilisticas, con la ventaja de ejecucion local y control total sobre los datos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece desde Q2_K hasta Q8_0, lo que permite medir la degradacion de calidad y el ahorro de memoria en un mismo modelo, util para decidir el punto de equilibrio en produccion.
- Filtrado y clasificacion de texto a gran escala en local: con Q4 o Q5 y un throughput razonable en GPU, puede usarse para etiquetar o resumir lotes de documentos en ingles sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos + overhead de contexto, aproximado):
  - Q2_K: ~26,5 GB de pesos; ~30-34 GB en total con contexto moderado.
  - Q3_K_M: ~34,4 GB; ~38-42 GB en total.
  - Q4_K_M: ~42,6 GB; ~46-50 GB en total.
  - Q5_K_M: ~50,0 GB; ~54-58 GB en total.
  - Q6_K: ~58,0 GB; ~62-66 GB en total.
  - Q8_0: ~75,1 GB; ~80-84 GB en total.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q6_K y Q8_0; dos RTX 4090 (24 GB cada una) o una A100 80 GB para Q4_K_M y Q5_K_M; RTX 3090/4090 en configuracion multi-GPU o con offload parcial para Q2_K y Q3.
- En consumer GPU: Q2_K y Q3_K_S pueden caber en una unica RTX 4090 (24 GB) solo con offload parcial a RAM, lo que reduce drasticamente el throughput; no es una configuracion recomendada para produccion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto. Como referencia cualitativa, las cuantizaciones Q4_K_S y Q4_K_M se marcan como "fast, recommended" en la model card, y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-GGUF (este) | 70,55B | 128K (segun nombre) | GGUF | no disponible | Merge con mergekit; solo ingles; sin benchmarks |
| Llama 3.1 70B Instruct (Meta) | 70,6B | 128K | safetensors, GGUF | Llama 3.1 Community License | Modelo oficial, multilingue, con benchmarks publicados |
| Llama 3.3 70B Instruct (Meta) | 70,6B | 128K | safetensors, GGUF | Llama 3.3 Community License | Version mas reciente de la familia, con evaluaciones oficiales |
| Qwen2.5 72B Instruct | 72,7B | 128K | safetensors, GGUF | Apache 2.0 (segun version) | Multilingue, con benchmarks publicados |

La comparacion con los modelos oficiales es desfavorable en trazabilidad: este merge no documenta ni los modelos de origen ni evaluaciones, y su licencia no esta declarada, lo que complica su adopcion en produccion frente a alternativas con licencia clara y benchmarks reproducibles.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; debe verificarse con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo unicamente en ingles segun el campo `language`; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Al ser un merge sin evaluacion publicada, no hay evidencia de que supere a los modelos Llama 3.x originales en ninguna tarea; el rendimiento puede ser inferior o inestable.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, agravado por la falta de benchmarks y de documentacion sobre el entrenamiento.
- La ventana de 128K tokens solo se deduce del nombre del modelo; no se confirma en la model card ni se documenta el metodo de extension de contexto, por lo que la calidad en contextos muy largos es incierta.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality".
- El repositorio solo contiene GGUF; no hay pesos en safetensors para fine-tuning ni para servir con vLLM o TGI de forma nativa.
- Repositorio con muy poca traccion (41 descargas, 0 likes) y sin pipeline declarado, lo que reduce la probabilidad de soporte o mantenimiento.
- Los tags incluyen `endpoints_compatible`, pero no se detalla que endpoints ni con que configuracion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama_3.x_70b_Tess_Calme-2.4_128K_v1.0-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
