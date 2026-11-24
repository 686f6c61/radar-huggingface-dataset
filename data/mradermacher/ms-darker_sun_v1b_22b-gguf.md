# mradermacher/MS-Darker_Sun_v1b_22B-GGUF

## Resumen

MS-Darker_Sun_v1b_22B-GGUF es la version cuantizada en formato GGUF del modelo MS-Darker_Sun_v1b_22B, desarrollado por nerdigent y empaquetado por mradermacher. Se trata de un modelo de lenguaje de 22.247.282.688 parametros (aproximadamente 22,2 mil millones) generado mediante tecnicas de fusion de modelos (merge) con la herramienta mergekit, lo que lo situa en la categoria de modelos conversacionales de gran tamano orientados a generacion de texto en ingles.

El modelo base es un merge, es decir, una combinacion de pesos de otros modelos preentrenados, una practica habitual en la comunidad open source para combinar capacidades sin necesidad de reentrenar desde cero. La ficha disponible no detalla que modelos se fusionaron ni la receta exacta de la mezcla, por lo que se desconoce la composicion interna y el origen de los datos de entrenamiento subyacentes.

La relevancia de esta publicacion reside en su disponibilidad en multiples cuantizaciones GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de 22B en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 151,4 GB e incluye tanto cuantizaciones estaticas como, en un repositorio separado, variantes con imatrix. La licencia no esta especificada, lo que supone una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo fusionado con mergekit; detalles no disponibles) |
| Parametros totales | 22.247.282.688 (aprox. 22,2B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors |
| Tamano del repositorio | 151,4 GB |
| Modelo base | nerdigent/MS-Darker_Sun_v1b_22B |
| Libreria | transformers |
| Etiquetas | mergekit, merge, conversational |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base nerdigent/MS-Darker_Sun_v1b_22B fue creado mediante mergekit, una herramienta de fusion de modelos que combina los pesos de dos o mas modelos preentrenados siguiendo una receta de mezcla (por ejemplo, SLERP, TIES, DARE o linear). No se especifica en la model card que modelos se fusionaron, que metodo de merge se empleo ni los coeficientes de interpolacion utilizados.

Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Al tratarse de un merge, el modelo hereda las capacidades y limitaciones de sus componentes originales, pero sin documentacion sobre la receta es imposible atribuir caracteristicas concretas a una fuente determinada. El empaquetado por parte de mradermacher es puramente de cuantizacion: convierte los pesos a formato GGUF con la herramienta estandar y ofrece tanto cuantizaciones estaticas como variantes con imatrix (estas ultimas en el repositorio i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del modelo.
- Razonamiento general y respuesta a instrucciones, asumiendo las capacidades heredadas de los modelos fusionados (no documentadas explicitamente).
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de cuantizaciones de baja precision (Q2_K, Q3_K) para entornos con VRAM limitada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion con modelos fusionados en local: el modelo permite a investigadores probar el comportamiento de un merge de 22B en hardware de consumo usando la cuantizacion Q4_K_M (13,4 GB), adecuada para GPUs con 16-24 GB de VRAM.
- Generacion de texto creativo y conversacional en ingles: dado su caracter conversacional, puede emplearse en prototipos de chatbots o asistentes de escritura, siempre que se valide la calidad frente a alternativas con licencia clara.
- Evaluacion comparativa de tecnicas de merge: util para estudiar como se comportan las fusiones de modelos frente a los modelos originales en tareas de generacion abierta.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (8,4 GB) y Q3_K_S (9,7 GB) permiten ejecucion en CPU con llama.cpp, aunque con perdida de calidad.
- Pruebas de concepto de asistentes conversacionales: integrable en pipelines de inferencia local mediante llama.cpp u Ollama para validar viabilidad antes de invertir en modelos con licencia comercial.
- Investigacion sobre degradacion por cuantizacion: la disponibilidad de once cuantizaciones distintas permite medir el impacto de la precision en la perplejidad y la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto):
  - Q2_K: aprox. 8,4 GB de pesos; ~10-12 GB de VRAM recomendados.
  - Q4_K_M: aprox. 13,4 GB de pesos; ~16 GB de VRAM recomendados.
  - Q5_K_M: aprox. 15,8 GB de pesos; ~18-20 GB de VRAM recomendados.
  - Q8_0: aprox. 23,7 GB de pesos; ~28-32 GB de VRAM recomendados.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) como alternativa consumer para cuantizaciones medias.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 12-16 GB solo con Q2_K o Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MS-Darker_Sun_v1b_22B-GGUF | 22,2B | no disponible | no disponible | GGUF | Merge cuantizado, solo ingles |
| Mistral Small 22B (referencia) | 22B | 32K (segun version) | Apache 2.0 | safetensors, GGUF | Modelo oficial con licencia permisiva |
| Qwen2.5 32B (referencia) | 32B | 128K | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Mayor contexto y licencia clara |

La comparacion es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una comparacion cuantitativa con alternativas. La principal desventaja frente a modelos oficiales es la ausencia de licencia declarada y de documentacion sobre entrenamiento y contexto.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Al ser un merge sin documentacion de la receta, se desconocen los sesgos heredados de los modelos originales y la composicion de los datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin benchmarks no hay evidencia de robustez.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso practico.
- Numero de descargas muy bajo (46) y ausencia de likes: no hay validacion comunitaria significativa sobre su calidad.
- El repositorio de 151,4 GB incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MS-Darker_Sun_v1b_22B-GGUF
- Modelo base: https://huggingface.co/nerdigent/MS-Darker_Sun_v1b_22B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MS-Darker_Sun_v1b_22B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MS-Darker_Sun_v1b_22B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
