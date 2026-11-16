# mradermacher/Gigantes-v2-gemma2-9b-it-GGUF

## Resumen

Gigantes-v2-gemma2-9b-it-GGUF es la version cuantizada en formato GGUF del modelo Grimjim/Gigantes-v2-gemma2-9b-it, un merge de modelos construido con mergekit sobre la base de Gemma 2 9B instruct de Google. El trabajo de cuantizacion lo firma mradermacher, un actor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp, que publica versiones estaticas de modelos de la comunidad para facilitar su despliegue en hardware de consumo.

El modelo subyacente es un merge de tipo "model soup" orientado a conversacion en ingles, con 9.241.705.984 parametros totales y una arquitectura transformer decoder-only heredada de Gemma 2 (atencion alterna local/global, RMSNorm y activaciones GeGLU). Al estar cuantizado en GGUF, el modelo puede ejecutarse en CPU, GPU o configuraciones hibridas mediante llama.cpp y sus derivados, lo que reduce drasticamente los requisitos de memoria frente a los pesos en safetensors.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 9B con ventana de contexto larga en equipos con 8-16 GB de VRAM o incluso en CPU, a costa de cierta perdida de calidad en las cuantizaciones mas agresivas. No obstante, se trata de un merge de la comunidad, sin benchmarks publicados en la informacion disponible, por lo que debe evaluarse empiricamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 2) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 2 9B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Grimjim/Gigantes-v2-gemma2-9b-it es un merge construido con mergekit a partir de Gemma 2 9B instruct. La arquitectura subyacente es la de Gemma 2: transformer decoder-only con atencion por ventanas alternas (local y global), normalizacion RMSNorm con pre y post-norm, y activaciones GeGLU en las capas feed-forward. El modelo original emplea embeddings de gran tamano y un vocabulario de aproximadamente 256k tokens, aunque estos detalles no se detallan en la informacion proporcionada.

No se dispone de informacion sobre el dataset de merge, el numero de tokens de entrenamiento, ni sobre si hubo etapas de RLHF o DPO posteriores al merge. El autor de la cuantizacion indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y senala que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de publicacion. La innovacion tecnica relevante en esta ficha es la propia cuantizacion GGUF, que permite ejecutar el modelo con llama.cpp en hardware modesto.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del modelo Gemma 2 instruct.
- Generacion de codigo y matematicas basicas, aunque sin benchmarks publicados que lo confirmen.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta vision, audio ni modo "thinking" explicito.
- Compatible con endpoints de inferencia (tag endpoints_compatible) y con el ecosistema llama.cpp.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse con llama.cpp en un portatil con 8-16 GB de RAM/VRAM usando Q4_K_M (5.9 GB), lo que permite iterar en el diseno de prompts sin coste de API.
- Despliegue en entornos sin GPU dedicada: la cuantizacion Q2_K (3.9 GB) o Q3_K_S (4.4 GB) permite inferencia en CPU con un rendimiento aceptable para tareas de baja concurrencia.
- Generacion de texto en pipelines offline: integrable en scripts de procesamiento por lotes para resumir, clasificar o reescribir documentos en ingles.
- Evaluacion comparativa de merges de la comunidad: util para investigadores que quieran medir la calidad de un merge de Gemma 2 9B frente al modelo original antes de adoptarlo.
- Chatbot de soporte interno en ingles: con Q5_K_M (6.7 GB) se obtiene buena calidad en una unica GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Educacion y experimentacion: sirve como banco de pruebas para estudiar el impacto de la cuantizacion en la calidad de un modelo de 9B, comparando Q4_K_M, Q6_K y Q8_0.
- Fine-tuning ligero posterior: aunque el repo solo ofrece GGUF, el modelo base en safetensors permite tecnicas como LoRA sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K 3.9 GB, Q3_K_S 4.4 GB, Q3_K_M 4.9 GB, Q3_K_L 5.2 GB, IQ4_XS 5.3 GB, Q4_K_S 5.6 GB, Q4_K_M 5.9 GB, Q5_K_S 6.6 GB, Q5_K_M 6.7 GB, Q6_K 7.7 GB, Q8_0 9.9 GB, f16 18.6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o superiores para cuantizaciones Q5-Q8; A100/H100 solo si se busca throughput alto con f16 o despliegue multi-usuario.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB; f16 requiere 24 GB o mas (RTX 3090/4090) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; no se documenta soporte en vLLM ni TGI para este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gigantes-v2-gemma2-9b-it-GGUF (este) | 9.24B | no disponible | gemma | GGUF | Merge comunitario cuantizado por mradermacher |
| google/gemma-2-9b-it | 9.24B | 8k tokens (modelo original) | gemma | safetensors, GGUF (via terceros) | Modelo oficial instruct de Google |
| Mistral-7B-Instruct-v0.3 (GGUF) | 7.25B | 32k tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |
| Llama-3.1-8B-Instruct (GGUF) | 8.03B | 128k tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema mas amplio |

La comparativa se basa en caracteristicas publicas de los modelos; no hay datos de rendimiento de este merge en la informacion disponible, por lo que la eleccion frente a los alternativas debe hacerse con evaluacion empirica propia.

## Limitaciones y advertencias

- Modelo de la comunidad sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a Gemma 2 9B instruct original.
- Idiomas: solo ingles documentado; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 9B y acentuado por merges no evaluados formalmente.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda Q4_K_M o superior para uso real.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion; revisar antes de desplegar en produccion.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin validacion.
- El repo pesa 83.5 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- No hay cuantizaciones imatrix disponibles, lo que limita la calidad en tamanos pequenos frente a alternativas ponderadas.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/Gigantes-v2-gemma2-9b-it-GGUF
- Modelo base: https://huggingface.co/grimjim/Gigantes-v2-gemma2-9b-it
- Pagina de descargas del autor: https://hf.tst.eu/model#Gigantes-v2-gemma2-9b-it-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
