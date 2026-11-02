# mradermacher/Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162-GGUF

## Resumen

Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162 es un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26.895.998.464 exactos segun los pesos en safetensors) resultante de la fusion evolutiva de dos modelos Qwen3.5 de 27B: uno de la familia Qwen3.5 y otro derivado de Claude-4. La fusion la realiza el usuario SeaWolf-AI aplicando una metodologia propia denominada "darwin-v6", que combina tecnicas de evolutionary merge, MRI-guided y SLERP para mezclar los pesos de ambos modelos base. El resultado es un modelo denso de tipo transformer, disenado para conversacion y uso general, que hereda el conocimiento y las capacidades de ambos progenitores.

Esta ficha corresponde especificamente a la version cuantizada en GGUF publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad, que ofrece el modelo en once variantes de cuantizacion (desde Q2_K hasta Q8_0) para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 186,3 GB e incluye todos los ficheros GGUF empaquetados.

La relevancia de este modelo radica en su naturaleza de "merge" experimental: permite a desarrolladores e investigadores probar en local un modelo de 27B que combina caracteristicas de dos linajes distintos (Qwen3.5 y un derivado de Claude-4) sin necesidad de entrenamiento adicional. Su licencia Apache 2.0 y la disponibilidad de cuantizaciones ligeras (Q4_K_M en 16,6 GB) lo hacen accesible para experimentacion en GPUs de consumo, aunque su naturaleza de fusion experimental implica que su comportamiento puede ser menos predecible que el de un modelo entrenado de forma convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fusion de pesos de dos modelos Qwen3.5 de 27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |
| Tamano del repositorio | 186,3 GB (todos los quants) |
| Metodo de creacion | Evolutionary merge (darwin-v6), MRI-guided, SLERP |
| Modelo base | SeaWolf-AI/Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162 |
| Descargas | 440 |
| Likes | 8 |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos (model merging), no de un entrenamiento desde cero. Concretamente, combina dos modelos Qwen3.5 de 27B mediante una metodologia denominada "darwin-v6", que segun las etiquetas del autor incluye tecnicas de evolutionary merge (busqueda evolutiva de combinaciones de pesos), MRI-guided (posiblemente un metodo de guiado basado en analisis de capas o representaciones internas) y SLERP (spherical linear interpolation, una interpolacion esferica clasica en model merging). El resultado es un transformer denso de ~26,9B de parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que al tratarse de una fusion de pesos no se realiza entrenamiento adicional sobre datos. La innovacion tecnica principal es precisamente el pipeline de fusion evolutiva, que busca combinar las fortalezas de ambos modelos progenitores. El modelo base del que deriva esta version GGUF es SeaWolf-AI/Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162, y la cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de los modelos Qwen3.5 base.
- Capacidades de codigo y matematicas presumiblemente heredadas de los progenitores Qwen3.5 y del derivado de Claude-4 (no verificadas con benchmarks en la informacion disponible).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible; depende de las capacidades heredadas de Qwen3.5.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con model merging: investigadores pueden evaluar en local el resultado de la fusion darwin-v6 y compararlo con los modelos Qwen3.5 originales para estudiar el efecto de las tecnicas de evolutionary merge y SLERP en el comportamiento final.
- Despliegue en hardware de consumo: gracias a la cuantizacion Q4_K_M (16,6 GB) o IQ4_XS (15,3 GB), el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) mediante llama.cpp, Ollama o LM Studio, permitiendo probar un modelo de 27B sin infraestructura de servidor.
- Generacion de texto y asistencia conversacional en ingles: el modelo puede emplearse como chatbot local para tareas de redaccion, resumen y respuesta a preguntas, aprovechando su naturaleza conversacional.
- Prototipado rapido de aplicaciones LLM: al estar disponible en GGUF y con licencia Apache 2.0, sirve para validar pipelines de inferencia (RAG, agentes, cadenas de prompts) antes de migrar a modelos mas grandes o con soporte oficial.
- Evaluacion comparativa de tecnicas de merge: equipos de investigacion pueden usar este modelo como caso de estudio para medir como afecta la fusion de pesos a la calidad, la coherencia y la tendencia a la alucinacion frente a los modelos originales.
- Fine-tuning ligero sobre la base fusionada: al ser Apache 2.0, es posible partir de este modelo (o de su version en safetensors) para aplicar LoRA o QLoRA en dominios especificos en ingles, aprovechando que ya incorpora caracteristicas de dos linajes distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y el repositorio base no aporta datos verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q2_K (10,8 GB): ~12 GB de VRAM.
  - Q3_K_M (13,4 GB): ~15 GB de VRAM.
  - IQ4_XS (15,3 GB): ~17 GB de VRAM.
  - Q4_K_M (16,6 GB): ~18-19 GB de VRAM.
  - Q5_K_M (19,3 GB): ~21 GB de VRAM.
  - Q6_K (22,2 GB): ~24 GB de VRAM.
  - Q8_0 (28,7 GB): ~31 GB de VRAM (requiere GPU de 32 GB o mas, o descarga parcial a CPU).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4-Q5; A100 40 GB, H100 o RTX 6000 Ada para Q6-Q8; configuraciones multi-GPU para Q8_0 con contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para la version en safetensors, vLLM o TGI (sujeto a soporte de la arquitectura Qwen3.5 en dichos frameworks).
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa para un modelo denso de ~27B en Q4_K_M sobre una RTX 4090, cabe esperar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162 (este) | ~26,9B | no disponible | Apache 2.0 | GGUF, safetensors | Fusion evolutiva de dos Qwen3.5 de 27B; solo ingles |
| Qwen3.5-27B (progenitor) | ~27B | no disponible | segun Qwen (habitualmente Apache 2.0) | safetensors, GGUF | Modelo oficial de Alibaba; base del merge |
| Derivado Claude-4 (progenitor) | ~27B | no disponible | no disponible | no disponible | Segundo progenitor del merge; detalles no disponibles |
| Mistral Small 3 (24B) | ~24B | 32K-128K segun version | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar con soporte multilingue |

La comparativa es limitada porque no se dispone de datos de benchmarks del modelo fusionado ni de especificaciones detalladas de los progenitores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de fusion experimental: al no haber sido entrenado de forma convencional, su comportamiento puede ser menos predecible y mas propenso a incoherencias que un modelo oficial; conviene evaluarlo exhaustivamente antes de usarlo en produccion.
- Solo soporta ingles segun la etiqueta de idioma; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y potencialmente acentuado por la fusion de pesos de dos linajes distintos.
- Longitud de contexto no documentada: no se puede asumir la ventana de contexto de Qwen3.5 sin verificacion empirica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta comparar con alternativas.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo; verificar las obligaciones de atribucion y las licencias de los modelos progenitores.
- El repositorio es muy pesado (186,3 GB en total); descargar solo el fichero GGUF necesario.
- No hay informacion sobre soporte de tool calling o modo agente; no asumir estas capacidades sin probarlas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162-GGUF
- Modelo base (safetensors): https://huggingface.co/SeaWolf-AI/Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Darwin-Qwen3.5-27B-x-Qwen3.5-27B-Claude-4-08162-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
