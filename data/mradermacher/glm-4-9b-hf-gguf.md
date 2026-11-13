# mradermacher/glm-4-9b-hf-GGUF

## Resumen

GLM-4-9B es un modelo de lenguaje de 9.400 millones de parametros desarrollado por Zhipu AI (THUDM, Universidad de Tsinghua), distribuido originalmente en el repositorio `zai-org/glm-4-9b-hf`. Esta ficha documenta la version cuantizada en formato GGUF publicada por el usuario mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo resuelve tareas de generacion de texto, razonamiento y conversacion multirround en chino e ingles, y es relevante porque ofrece una alternativa abierta de tamano medio con contexto largo y soporte de tool calling.

La arquitectura es un transformer decoder-only denso (no MoE) con 9.399.951.360 parametros totales segun los pesos safetensors del modelo base. El contexto nativo del modelo base GLM-4-9B es de 128.000 tokens, aunque esta informacion no se confirma en la model card de la version GGUF. La licencia es la "glm-4" de Zhipu AI, que impone restricciones adicionales respecto a licencias puramente permisivas como Apache 2.0 o MIT.

El repositorio GGUF incluye 11 cuantizaciones estaticas desde Q2_K (4,1 GB) hasta f16 (18,9 GB), lo que permite desplegar el modelo desde GPUs de 6 GB hasta servidores con 24 GB o mas. Existe ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (`mradermacher/glm-4-9b-hf-i1-GGUF`) que suele ofrecer mejor calidad por tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GLM-4) |
| Parametros totales | 9.399.951.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens en el modelo base (no confirmado en la model card GGUF) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | glm-4 (licencia propia de Zhipu AI, "other" en HF) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `zai-org/glm-4-9b-hf` es un transformer decoder-only denso de la familia GLM-4 de Zhipu AI. La model card de esta version GGUF no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aqui. La informacion disponible se limita a la conversion a GGUF realizada por mradermacher mediante `convert_type: hf` y `output_tensor_quantised: 1`, con `quantize_version: 2`.

La innovacion principal de esta publicacion es la propia cuantizacion: mradermacher ofrece cuantizaciones estaticas (no imatrix) en 12 variantes, con notas de calidad explicitas (por ejemplo, Q4_K_S y Q4_K_M marcados como "fast, recommended", Q8_0 como "fast, best quality", f16 como "overkill"). El repositorio hermano `glm-4-9b-hf-i1-GGUF` contiene las versiones ponderadas/imatrix, que el autor recomienda cuando el tamano es similar. No se documentan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multirround en chino e ingles.
- Razonamiento y respuesta a preguntas, segun el proposito declarado del modelo base GLM-4-9B.
- Soporte de tool calling / function calling: el modelo base GLM-4-9B lo incluye, aunque la model card GGUF no lo detalla explicitamente.
- Capacidades multilingues limitadas a chino e ingles segun los tags del repositorio.
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de vision, audio ni modo "thinking" en la informacion disponible para esta version.

## Casos de uso

- Asistente conversacional local en chino o ingles: el modelo puede gestionar dialogos multirround con contexto largo (hasta 128.000 tokens en el modelo base) desplegado con llama.cpp en una estacion de trabajo con GPU de 8-12 GB usando Q4_K_M.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, no requiere enviar codigo a servicios externos, lo que encaja en pipelines internos de revision o documentacion.
- Traduccion y redaccion bilingue chino-ingles: el modelo esta entrenado especificamente en ambos idiomas, por lo que es adecuado para tareas de traduccion tecnica o atencion al cliente en esas lenguas.
- Prototipado rapido en portatiles: la cuantizacion Q4_K_S (5,9 GB) o IQ4_XS (5,4 GB) permite ejecutar el modelo en GPUs de consumo de 8 GB con ollama o llama.cpp.
- Procesamiento de documentos largos: con la ventana de contexto del modelo base, se pueden resumir o extraer informacion de contratos, informes o articulos extensos en chino o ingles.
- Backend de agentes con tool calling: el modelo base soporta function calling, lo que permite integrarlo en flujos de agente que consulten APIs o bases de datos, siempre que se valide el comportamiento tras la cuantizacion.
- Fine-tuning ligero sobre la version f16: la variante f16 (18,9 GB) sirve como punto de partida para ajuste supervisado o LoRA en tareas de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la version GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de llama.cpp):
  - Q2_K: ~5-6 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~6-7 GB.
  - IQ4_XS: ~6-7 GB.
  - Q4_K_S / Q4_K_M: ~7-8 GB.
  - Q5_K_S / Q5_K_M: ~8-9 GB.
  - Q6_K: ~10 GB.
  - Q8_0: ~11-12 GB.
  - f16: ~20 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas, A100/H100 para f16 o despliegues con mucho contexto.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con Q4_K_M hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B (esta ficha, GGUF) | 9,4 B | 128 K (modelo base) | glm-4 | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-7B | 7,6 B | 128 K | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.1 8B | 8,0 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Mistral 7B v0.3 | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de benchmarks en la informacion disponible. GLM-4-9B destaca por su enfoque bilingue chino-ingles y su contexto de 128 K, pero su licencia glm-4 es mas restrictiva que Apache 2.0 y su comunidad de cuantizaciones es menor que la de Llama o Qwen.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en chino e ingles, puede presentar sesgos culturales y linguisticos hacia esos contextos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de factualidad para esta version.
- Limitaciones de idioma: solo chino e ingles segun los tags; el rendimiento en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: aunque el modelo base soporta 128 K tokens, las cuantizaciones bajas (Q2_K, Q3_K) pueden degradar la calidad en contextos muy largos; no se han publicado mediciones al respecto.
- Restricciones de licencia: la licencia glm-4 no es permisiva; antes de uso comercial es obligatorio revisar los terminos en el enlace de licencia del modelo base.
- Caveat de produccion: las cuantizaciones estaticas pueden perder calidad respecto a las imatrix; el autor recomienda las versiones i1 para calidad similar por tamano.
- El repositorio tiene muy pocas descargas (141) y 0 likes en el momento de la consulta, lo que indica poca validacion comunitaria de estas cuantizaciones concretas.
- No hay garantia de que el tool calling del modelo base se preserve intacto tras la cuantizacion; conviene validarlo en el caso de uso concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/glm-4-9b-hf-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/glm-4-9b-hf-i1-GGUF
- Modelo base: https://huggingface.co/zai-org/glm-4-9b-hf
- Licencia glm-4: https://huggingface.co/THUDM/glm-4-9b/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#glm-4-9b-hf-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
