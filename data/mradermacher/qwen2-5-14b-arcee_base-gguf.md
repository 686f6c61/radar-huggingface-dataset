# mradermacher/Qwen2.5-14B-Arcee_base-GGUF

## Resumen

Qwen2.5-14B-Arcee_base-GGUF es la distribucion en formato GGUF del modelo fusionado Nexesenex/Qwen2.5-14B-Arcee_base, publicada por el usuario mradermacher el 2 de marzo de 2025. Se trata de un merge construido con mergekit sobre la base de Qwen2.5-14B, un transformer denso de 14.765.947.904 parametros (aproximadamente 14,8 mil millones) desarrollado originalmente por Alibaba Qwen. El repositorio no incluye pesos en safetensors ni un pipeline declarado; su proposito es ofrecer cuantizaciones estaticas listas para inferencia local con llama.cpp y derivados.

El modelo hereda del Qwen2.5-14B original la arquitectura transformer decoder-only, el tokenizador multilingue y el contexto largo, aunque la model card solo declara el idioma ingles. La fusion Arcee busca, segun la practica habitual de mergekit, combinar capacidades conversacionales y de razonamiento de los checkpoints donantes; no obstante, la informacion publicada no detalla la receta de merge (metodo, pesos o capas interpoladas), por lo que cualquier afirmacion sobre el efecto concreto de la fusion queda fuera de lo verificable.

Su relevancia practica es la disponibilidad de once cuantizaciones GGUF entre 5,9 GB (Q2_K) y 15,8 GB (Q8_0), lo que permite desplegar un modelo de casi 15B parametros en GPUs de consumo con 8-16 GB de VRAM. El repo pesa 102 GB en total y acumula 100 descargas y 2 likes en el momento de la consulta, lo que indica una adopcion muy limitada y, por tanto, escasa validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-14B); fusion con mergekit |
| Parametros totales | 14.765.947.904 (aproximadamente 14,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-14B base soporta hasta 131.072 tokens, pero no se confirma para este merge) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; existen variantes imatrix en el repo i1) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien disponible el modelo base en formato HF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only denso con atencion por causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. Sobre esa base, Nexesenex/Qwen2.5-14B-Arcee_base se obtiene mediante mergekit, la herramienta de fusion de checkpoints que combina tensores de dos o mas modelos donantes mediante tecnicas como SLERP, TIES, DARE o passthrough. La model card no especifica que metodo se empleo, que modelos actuaron como donantes ni los hiperparametros de la fusion.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o SFT adicionales tras el merge. Tampoco se documentan innovaciones tecnicas propias: el valor anadido del repo de mradermacher es exclusivamente la conversion a GGUF y la generacion de las cuantizaciones, no modificaciones arquitectonicas. El proceso de cuantizacion se realizo con la version 2 del pipeline de mradermacher y con cuantizacion de tensores de salida, segun los metadatos del README.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del Qwen2.5-14B base.
- Generacion de codigo y resolucion de problemas matematicos basicos e intermedios, como el modelo original (no verificado especificamente en este merge).
- Capacidad multilingue limitada por lo declarado: la model card solo lista ingles, aunque el tokenizador de Qwen2.5 cubre mas idiomas.
- Soporte de tool calling y function calling: no confirmado para este merge; el Qwen2.5 original lo soporta, pero la fusion puede degradar el formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo thinking, vision o audio: no disponible; el modelo es solo texto.
- Inferencia local mediante llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno en una estacion de trabajo con una GPU de 12-16 GB usando Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB), sin depender de APIs externas.
- Prototipado rapido de chatbots: gracias a las cuantizaciones pequenas (Q3_K_S de 6,8 GB), se puede desplegar en portatiles con GPU de 8 GB para validar flujos conversacionales antes de invertir en infraestructura.
- Generacion de texto en pipelines offline: integrable en scripts de procesamiento por lotes con llama.cpp para resumir, reescribir o clasificar documentos en ingles.
- Experimentacion con fusiones de modelos: util para investigadores que quieran evaluar el efecto de la receta Arcee frente al Qwen2.5-14B original en tareas de razonamiento y estilo conversacional.
- Base para fine-tuning ligero con LoRA: al disponer del modelo base en formato Hugging Face, se puede ajustar y luego recuantizar a GGUF para despliegue.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, es adecuado para procesar texto sensible sin enviarlo a servicios en la nube.
- Educacion y demos: su tamano moderado y las multiples cuantizaciones permiten demostraciones en aula o talleres con hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y el autor del merge no documenta metricas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en memoria, sin offload):
  - Q2_K (5,9 GB): aproximadamente 6-7 GB.
  - Q3_K_M (7,4 GB): aproximadamente 8 GB.
  - IQ4_XS (8,3 GB): aproximadamente 9 GB.
  - Q4_K_M (9,1 GB): aproximadamente 10 GB.
  - Q5_K_M (10,6 GB): aproximadamente 11-12 GB.
  - Q6_K (12,2 GB): aproximadamente 13 GB.
  - Q8_0 (15,8 GB): aproximadamente 16-17 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M y Q6_K; RTX 4060 Ti 16 GB o RTX 3080 (10-12 GB) para Q4_K_M; RTX 3060 12 GB para Q4_K_S y Q5_K_S.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB con Q4_K_M hasta una RTX 4090 con Q8_0. En GPUs de 8 GB conviene usar Q3_K_M o IQ4_XS con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Arcee_base-GGUF (este) | 14,8B | no disponible | no disponible | GGUF | Fusion con mergekit, solo ingles declarado |
| Qwen2.5-14B-Instruct (Alibaba) | 14,8B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial, multilingue, con benchmarks publicados |
| Mistral-Nemo-12B-Instruct | 12B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con contexto largo y soporte multilingue |
| Phi-3-medium-14B-Instruct | 14B | 4.096 tokens (128K en variantes) | MIT | safetensors, GGUF | Contexto mas corto en la version original, buen rendimiento en razonamiento |

La comparativa se limita a parametros y disponibilidad porque no hay benchmarks publicados para el modelo Arcee. Frente al Qwen2.5-14B-Instruct oficial, este merge carece de documentacion sobre licencia, idiomas y evaluaciones, lo que lo hace menos adecuado para produccion sin una validacion previa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el Qwen2.5 base es Apache 2.0, pero la fusion y la publicacion GGUF no declaran terminos.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y podria ser inferior al del Qwen2.5 original.
- Riesgo de alucinacion: inherente a los modelos de 14B y potencialmente agravado por la fusion, cuyos efectos sobre la fidelidad factual no estan evaluados.
- Ausencia de benchmarks: no hay evidencia publica de que el merge mejore al Qwen2.5-14B base en ninguna tarea.
- Tool calling y modo agente no confirmados: la fusion puede haber alterado los formatos de chat y de llamadas a herramientas del modelo original.
- Contexto no documentado: se desconoce si el merge conserva los 131.072 tokens del Qwen2.5-14B; conviene asumir un contexto menor hasta verificarlo.
- Adopcion muy baja (100 descargas, 2 likes): escasa validacion comunitaria y riesgo de problemas no reportados.
- Repo de 102 GB: requiere espacio en disco considerable si se descargan varias cuantizaciones.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-14B-Arcee_base-GGUF
- Modelo base de la fusion: https://huggingface.co/Nexesenex/Qwen2.5-14B-Arcee_base
- Variantes imatrix: https://huggingface.co/mradermacher/Qwen2.5-14B-Arcee_base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-14B-Arcee_base-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
