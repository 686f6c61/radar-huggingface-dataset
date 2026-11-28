# mradermacher/Huihui-MoE-60B-A3B-abliterated-GGUF

## Resumen

Huihui-MoE-60B-A3B-abliterated-GGUF es la distribucion en formato GGUF del modelo Huihui-MoE-60B-A3B-abliterated, una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edicion de pesos) del modelo base Qwen3-30B-A3B-Thinking-2507, segun se desprende del enlace de licencia incluido en la model card. La cuantizacion la realiza mradermacher, un conocido creador de quants para llama.cpp, y el resultado es un conjunto de ficheros GGUF listos para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo es un Mixture-of-Experts (MoE) de 59.535.734.784 parametros totales (unos 59,5 mil millones), con aproximadamente 3 mil millones de parametros activos por token (de ahi el sufijo A3B), lo que lo situa en la categoria de modelos MoE de gran capacidad pero coste de inferencia relativamente bajo por token. La etiqueta "abliterated" indica que se ha aplicado una tecnica de edicion de pesos para eliminar el comportamiento de rechazo, orientada a usos que requieren respuestas sin filtros de seguridad preentrenados.

La relevancia actual es doble: por un lado, permite ejecutar un MoE de ~60B en hardware de consumo mediante cuantizaciones agresivas (Q2_K en ~21,9 GB); por otro, ofrece una alternativa sin censura para investigacion sobre alineamiento, seguridad y evaluacion de sesgos. La licencia declarada es Apache 2.0, aunque el modelo base original de Qwen tiene su propia licencia que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de Qwen3-30B-A3B-Thinking-2507 |
| Parametros totales | 59.535.734.784 (~59,5B) |
| Parametros activos | ~3B por token (sufijo A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y quants imatrix en repositorio i1-GGUF) |
| Idiomas soportados | en (segun metadatos de Hugging Face) |
| Licencia | apache-2.0 (con license_link al modelo base Qwen) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), heredada del modelo base Qwen3-30B-A3B-Thinking-2507. El modelo original emplea un esquema de expertos dispersos en el que, por cada token, solo se activa una fraccion de los parametros (alrededor de 3B de los ~59,5B totales), lo que reduce el coste computacional de inferencia frente a un modelo denso de tamano equivalente. El sufijo "Thinking" del modelo base indica que fue entrenado con un modo de razonamiento explicito (chain-of-thought largo) antes de emitir la respuesta final.

Sobre el entrenamiento original no se proporciona informacion detallada en la model card de esta cuantizacion: no se especifican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La variante "abliterated" se obtiene aplicando edicion de pesos para eliminar las direcciones de activacion asociadas al rechazo, una tecnica que no requiere reentrenamiento completo pero que puede degradar ligeramente capacidades generales. La cuantizacion GGUF la realiza mradermacher con su pipeline estandar (quantize_version 2, output_tensor_quantised 1) y ofrece tambien quants con matriz de importancia (imatrix) en un repositorio separado.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos abiertos.
- Razonamiento explicito en modo "thinking" (heredado del modelo base Thinking-2507), con cadenas de razonamiento antes de la respuesta.
- Capacidad de mezcla de expertos que permite un rendimiento cercano a modelos densos mayores con menor coste por token.
- Comportamiento "uncensored": al estar abliterated, no aplica los filtros de rechazo del modelo original, lo que permite respuestas sobre temas que el modelo base rechazaria.
- Soporte de inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, llama-cpp-python, etc.).
- Capacidades multilingues limitadas: los metadatos solo declaran ingles.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni agentes multi-paso.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un MoE de ~60B sin las capas de rechazo, comparando respuestas con el modelo base original para analizar el efecto de la abliteration en distintos tipos de prompt.
- Evaluacion de sesgos y robustez: al no filtrar contenido, resulta util para generar respuestas que expongan sesgos latentes del modelo base y disenar contramedidas o filtros externos.
- Inferencia local en hardware de consumo: con la cuantizacion Q4_K_M (~36,3 GB) puede ejecutarse en estaciones con 48 GB de VRAM o en configuraciones con offload a RAM, algo inviable para un denso de 60B en la mayoria de equipos domesticos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera explorar temas sensibles sin que el modelo se niegue a continuar, con la salvedad de revisar el contenido generado.
- Prototipado de asistentes conversacionales: gracias al modo thinking y al contexto conversacional, sirve para construir demos de chatbot multi-turno en entornos controlados antes de pasar a un modelo alineado en produccion.
- Experimentacion con cuantizaciones: el repositorio ofrece 11 variantes de quant mas las imatrix, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un MoE de este tamano, un caso de estudio util para quien calibra pipelines de despliegue.
- Despliegue en entornos aislados (air-gapped): al ser GGUF y Apache 2.0, puede distribuirse en instalaciones sin conexion para pruebas internas de seguridad ofensiva o analisis de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero, sin contar KV cache):
  - Q2_K: ~21,9 GB
  - Q3_K_S: ~25,9 GB; Q3_K_M: ~28,7 GB; Q3_K_L: ~31,0 GB
  - IQ4_XS: ~32,3 GB
  - Q4_K_S: ~34,1 GB; Q4_K_M: ~36,3 GB (recomendadas por el autor por velocidad)
  - Q5_K_S: ~41,2 GB; Q5_K_M: ~42,4 GB
  - Q6_K: ~49,0 GB
  - Q8_0: ~63,4 GB (en dos partes)
- GPU recomendadas: A100 80 GB o H100 para Q6_K/Q8_0 sin offload; A100 40 GB o RTX 6000 Ada para Q4_K_M con margen para KV cache; RTX 4090 (24 GB) solo permite las cuantizaciones mas bajas (Q2_K) con offload parcial a RAM.
- Cabe en GPU de consumo: si, con matices. En una RTX 4090 de 24 GB solo entra Q2_K (~21,9 GB) y con KV cache muy limitada; en una RTX 3090/4090 con 24 GB es recomendable offload parcial de capas a RAM del sistema. Para Q4_K_M se necesita una GPU de 48 GB (RTX 6000 Ada, A6000) o un Mac con memoria unificada de 64 GB o mas.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no consumen GGUF de forma nativa y requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser MoE con ~3B activos, el throughput por token deberia ser notablemente superior al de un denso de 60B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-MoE-60B-A3B-abliterated-GGUF | ~59,5B | ~3B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles declarado |
| Qwen3-30B-A3B-Thinking-2507 (modelo base) | ~30B | ~3B | no disponible | Qwen (ver license_link) | safetensors | Modelo original alineado, con modo thinking |
| Huihui-MoE-60B-A3B-abliterated (safetensors) | ~59,5B | ~3B | no disponible | apache-2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Otros MoE abliterated de ~60B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Al estar "abliterated", el modelo carece de los filtros de rechazo del original: puede generar contenido danino, ilegal o sexualmente explicito. No es apto para produccion orientada al publico sin moderacion externa.
- La abliteration suele degradar ligeramente capacidades de razonamiento y coherencia respecto al modelo base alineado; conviene validar la calidad en la tarea concreta antes de desplegar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- Solo se declara soporte de ingles en los metadatos; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no se especifica en la informacion disponible; conviene consultar la model card del modelo base Qwen3-30B-A3B-Thinking-2507 antes de asumir una ventana concreta.
- Licencia: aunque la cuantizacion declara apache-2.0, el license_link apunta a la licencia del modelo base Qwen, que puede imponer condiciones adicionales para uso comercial. Verificar antes de uso en produccion.
- El repositorio ocupa 405,1 GB en total; descargar solo la cuantizacion necesaria.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun la propia model card; para uso serio se recomienda Q4_K_M o superior.
- No se documentan capacidades de tool calling, vision ni agentes; no asumir su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-MoE-60B-A3B-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/huihui-ai/Huihui-MoE-60B-A3B-abliterated
- Quants imatrix: https://huggingface.co/mradermacher/Huihui-MoE-60B-A3B-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-MoE-60B-A3B-abliterated-GGUF
- Licencia del modelo base Qwen: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
