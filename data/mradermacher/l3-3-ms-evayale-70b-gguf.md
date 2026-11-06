# mradermacher/L3.3-MS-Evayale-70B-GGUF

## Resumen

L3.3-MS-Evayale-70B-GGUF es la distribucion en formato GGUF del modelo fusionado SteelStorage/L3.3-MS-Evayale-70B, publicada por el cuantizador mradermacher. El modelo original es un merge generado con mergekit a partir de modelos de la familia Llama 3.3, orientado a uso conversacional en ingles. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter.

El modelo cuenta con 70.553.706.560 parametros totales (aproximadamente 70,5 mil millones) y se distribuye en cuantizaciones estaticas que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB). La disponibilidad de cuantizaciones IQ (imatrix) en un repositorio separado permite reducir el tamano manteniendo una calidad superior a las cuantizaciones K estandar de tamano equivalente.

La relevancia de esta ficha radica en que se trata de un modelo derivado (merge + cuantizacion) sin model card tecnica detallada: no se documentan datos de entrenamiento, benchmarks ni licencia explicita. Esto lo hace adecuado para experimentacion y despliegue local, pero exige cautela en entornos de produccion donde se requiera trazabilidad de licencia y evaluacion formal de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.3, segun el nombre del modelo; no confirmado en la model card) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base SteelStorage/L3.3-MS-Evayale-70B es un merge producido con mergekit, una herramienta de fusion de modelos que combina los pesos de dos o mas checkpoints preentrenados o afinados. La model card del repositorio GGUF no especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, passthrough, etc.) ni con que configuracion. Por el identificador "L3.3" se infiere que la base es Llama 3.3, pero no hay confirmacion explicita en la informacion disponible.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni procesos de RLHF/DPO o alineacion adicional. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realiza mradermacher con herramientas del ecosistema llama.cpp; las cuantizaciones IQ (imatrix) estan en un repositorio aparte y suelen ofrecer mejor relacion calidad/tamano que las K equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de codigo: capacidades heredadas de la familia Llama 3.3, aunque no verificadas con benchmarks en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la model card; depende del modelo base fusionado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere uso via Hugging Face Inference Endpoints con formato compatible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (42,6 GB) el modelo puede ejecutarse en una GPU con 48 GB de VRAM o en configuraciones multi-GPU, permitiendo prototipado sin coste de API.
- Experimentacion con merges de modelos: util para investigadores que quieran evaluar el comportamiento de fusiones de Llama 3.3 frente al modelo original, usando las distintas cuantizaciones para comparar degradacion por cuantizacion.
- Generacion de texto conversacional en ingles: adecuado para chatbots y asistentes internos donde el idioma principal sea el ingles y se priorice la privacidad del dato al ejecutarse on-premise.
- Evaluacion de calidad de cuantizaciones: el repositorio ofrece una escala completa de Q2_K a Q8_0, lo que permite medir el impacto de la cuantizacion en tareas concretas antes de fijar una configuracion de produccion.
- Fine-tuning posterior sobre GGUF: no es el flujo habitual, pero las cuantizaciones Q8_0 pueden servir como referencia para comparar con adaptaciones LoRA del modelo base en safetensors.
- Servicio de inferencia con llama.cpp u Ollama: integrable en entornos sin CUDA de datacenter, usando CPU con suficiente RAM (a partir de 32 GB para Q3_K_S) para cargas de baja concurrencia.
- Base para pipelines de evaluacion comparativa: al ser un merge sin benchmarks publicados, sirve como caso de estudio para metodologias de evaluacion de modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~26,5 GB de pesos; ~30-32 GB con contexto moderado.
  - Q4_K_M: ~42,6 GB de pesos; ~48 GB con contexto moderado.
  - Q8_0: ~75,1 GB de pesos; ~80 GB con contexto moderado.
- GPU recomendadas:
  - Q4_K_M: A100 80 GB, H100 80 GB, o 2x RTX 4090 (24 GB cada una) con reparto de capas.
  - Q8_0: H100 80 GB o configuracion multi-GPU (2x A100 40 GB o superior).
  - Q2_K / Q3_K_S: posible en una RTX 4090 24 GB solo con offload parcial a RAM; no cabe completamente en VRAM.
- Cabe en consumer GPU: solo las cuantizaciones mas bajas con offload parcial; ninguna cuantizacion completa de 70B cabe en una GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamano; requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| L3.3-MS-Evayale-70B-GGUF | 70,5B | no disponible | no disponible | GGUF | Merge de Llama 3.3 cuantizado; sin benchmarks publicados |
| Llama 3.3 70B Instruct (Meta) | 70B | 128K (segun documentacion de Meta) | Llama 3.3 Community License | safetensors, GGUF | Modelo oficial con benchmarks publicados y licencia definida |
| Qwen2.5 72B Instruct | 72B | 128K (segun documentacion de Qwen) | Apache 2.0 (segun documentacion de Qwen) | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Mistral Large 2 | 123B | 128K (segun documentacion de Mistral) | Mistral Research License / comercial | API, safetensors | Mayor tamano; no comparable directamente en requisitos de hardware |

La comparativa se limita a datos publicos de los modelos de referencia; no hay datos de rendimiento del modelo Evayale para contrastar. La principal desventaja frente a Llama 3.3 oficial es la ausencia de licencia explicita y de evaluacion formal.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un riesgo critico para produccion; habria que contactar con el autor del modelo base (SteelStorage) o asumir la licencia de Llama 3.3 si se confirma la ascendencia.
- Sin benchmarks publicados: no hay evidencia de que el merge mejore al modelo base; puede degradar capacidades por interferencia de pesos.
- Solo ingles: no apto para produccion en castellano u otros idiomas sin evaluacion adicional.
- Riesgo de alucinacion: inherente a los modelos de 70B sin alineacion documentada; el merge puede alterar el comportamiento del modelo original.
- Contexto no documentado: se desconoce la ventana real; asumir 8K o menos por precaucion hasta verificar con el modelo base.
- Cuantizaciones bajas (Q2_K, Q3_K) degradan calidad de forma notable; para produccion se recomienda Q4_K_M o superior, con el coste de hardware asociado.
- Modelo derivado sin mantenimiento garantizado: el repositorio se actualizo en 2026 pero no hay hoja de ruta ni soporte del autor original del merge.
- Repositorio de 481,3 GB: requiere espacio en disco considerable si se descargan varias cuantizaciones.
- Sin garantias de reproducibilidad: no se documenta la configuracion de mergekit ni los modelos fuente, lo que impide replicar el merge.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/L3.3-MS-Evayale-70B-GGUF
- Modelo base: https://huggingface.co/SteelStorage/L3.3-MS-Evayale-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/L3.3-MS-Evayale-70B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#L3.3-MS-Evayale-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
