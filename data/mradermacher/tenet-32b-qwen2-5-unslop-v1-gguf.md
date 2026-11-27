# mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF

## Resumen

Tenet-32B-Qwen2.5-Unslop-v1-GGUF es la version cuantizada en formato GGUF del modelo Tenet-32B-Qwen2.5-Unslop-v1, desarrollado por mr-andrey-isachenko y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) construido sobre la arquitectura de Qwen2.5, lo que lo situa en la categoria de modelos densos de gran tamano orientados a generacion de texto, razonamiento y codigo.

El modelo se presenta como una variante "unslop" y "abliterated", terminos que en la comunidad open source designan ajustes orientados a reducir el tono excesivamente cauteloso o las respuestas evasivas tipicas de los modelos alineados de forma agresiva. Los tags incluyen "uncensored", "agentic", "tool-use" y "coding", lo que indica que el autor ha priorizado capacidades de uso de herramientas, razonamiento multi-paso y generacion de codigo, ademas de un comportamiento conversacional mas directo.

La relevancia de esta ficha reside en que ofrece una via de despliegue local eficiente: al estar disponible en multiples cuantizaciones GGUF (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB), permite ejecutar un modelo de 32B en hardware de consumo y en entornos de servidor sin GPU de gama alta. La licencia Apache 2.0 facilita su uso comercial, aunque las capacidades reales y los datos de entrenamiento no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5 (no se especifican detalles adicionales) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es Tenet-32B-Qwen2.5-Unslop-v1, de mr-andrey-isachenko, construido sobre la arquitectura Qwen2.5. Se trata por tanto de un transformer denso de aproximadamente 32,8 mil millones de parametros. Los tags "grpo" y "abliterated" sugieren que el entrenamiento pudo incluir Group Relative Policy Optimization (GRPO) y tecnicas de abliteration para reducir rechazos y respuestas evasivas, aunque no se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas especificas como decodificacion especulativa, atencion lineal o arquitecturas hibridas. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados, sin aportar detalles sobre el entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, con un estilo menos restrictivo que el de modelos alineados de forma convencional (tags "unslop" y "uncensored").
- Generacion de codigo, segun el tag "coding".
- Uso de herramientas y function calling, segun el tag "tool-use".
- Comportamiento orientado a agentes y razonamiento multi-paso, segun el tag "agentic".
- Compatibilidad con endpoints y despliegue en vLLM y OpenRouter, segun los tags.
- Capacidades multilingues: no disponibles; la model card solo declara ingles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M (20 GB) o Q5_K_M (23,4 GB), el modelo puede desplegarse en una estacion de trabajo con una GPU de 24 GB y usarse para autocompletado, refactorizacion y generacion de tests en pipelines de desarrollo.
- Agente autonomo con tool calling: los tags "agentic" y "tool-use" indican que el modelo puede integrarse en frameworks de agentes (LangChain, LlamaIndex) para orquestar llamadas a APIs, busquedas y ejecucion de comandos en flujos multi-paso.
- Atencion al cliente automatizada: al ser un modelo de 32B con comportamiento conversacional directo, puede gestionar dialogos multi-turno en ingles en entornos donde se prefiera un tono menos evasivo; la longitud de contexto debe verificarse en el modelo base.
- Generacion de contenido tecnico: redaccion de documentacion, articulos y respuestas tecnicas en ingles con un estilo menos "slop" (menos relleno y cautela excesiva).
- Despliegue en servidor con vLLM: la version en safetensors del modelo base y los tags "vllm" y "endpoints_compatible" permiten servirlo con vLLM para alto throughput en GPUs A100 o H100.
- Experimentacion en investigacion: al estar disponible en cuantizaciones desde Q2_K (12,4 GB), permite ejecutar un 32B en GPUs de consumo como RTX 3090 o RTX 4090 con cuantizaciones bajas, util para estudiar comportamiento de modelos abliterated.
- Prototipado con Ollama o llama.cpp: los ficheros GGUF son directamente compatibles con llama.cpp, Ollama y LM Studio, lo que facilita pruebas rapidas en portatiles con GPU de 12-16 GB usando Q2_K o Q3_K_S.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,4 GB
  - Q3_K_S: 14,5 GB
  - Q3_K_M: 16,0 GB
  - Q3_K_L: 17,3 GB
  - IQ4_XS: 18,0 GB
  - Q4_K_S: 18,9 GB
  - Q4_K_M: 20,0 GB
  - Q5_K_S: 22,7 GB
  - Q5_K_M: 23,4 GB
  - Q6_K: 27,0 GB
  - Q8_0: 34,9 GB
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; GPUs de 16 GB para Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o Q3_K_S; en GPUs de 12 GB con Q2_K (calidad reducida).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para el modelo base en safetensors), TGI (no confirmado), endpoints compatibles con OpenAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF | Variante abliterated/unslop, tags agentic y tool-use |
| Qwen2.5-32B-Instruct | 32,8B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, alineado de forma convencional |
| Gemma-2-27B-it | 27B | 8K | Gemma license | safetensors, GGUF | Alternativa de Google, licencia mas restrictiva |
| Mistral-Small-24B-Instruct | 24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamano similar |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de datos de rendimiento comparativo del modelo Tenet frente a estas alternativas.

## Limitaciones y advertencias

- El modelo esta marcado como "abliterated" y "uncensored": es probable que genere contenido que modelos alineados rechazarian, lo que requiere filtros y politicas de uso en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks publicados, no se puede estimar la fiabilidad factual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no estan documentados, lo que puede implicar riesgos legales o de cumplimiento no evaluados.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio GGUF tiene 588 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion limitada y poca validacion comunitaria.
- No hay informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Tenet-32B-Qwen2.5-Unslop-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
