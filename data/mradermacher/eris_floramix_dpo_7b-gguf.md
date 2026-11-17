# mradermacher/Eris_Floramix_DPO_7B-GGUF

## Resumen

Eris_Floramix_DPO_7B-GGUF es la distribucion en formato GGUF del modelo Eris_Floramix_DPO_7B, desarrollado originalmente por ChaoticNeutrals y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) construido sobre una arquitectura transformer densa, orientado especificamente a generacion de texto creativo y roleplay en ingles. La version GGUF permite su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPU de datacenter.

El modelo ha sido afinado con DPO (Direct Preference Optimization) sobre los datasets `athirdpath/DPO_Pairs-Roleplay-Alpaca-NSFW-v1-SHUFFLED` y `ResplendentAI/Synthetic_Soul_1k`, lo que lo especializa en dialogos de rol, narrativa interactiva y conversaciones de personaje. No es un modelo de proposito general: su entrenamiento esta deliberadamente sesgado hacia contenido creativo y roleplay, incluyendo material NSFW segun los datasets declarados.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica para desplegar el modelo en local. El repo ocupa 63,9 GB e incluye 12 cuantizaciones distintas, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de VRAM. La licencia es "other", lo que exige revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (tambien existe el modelo base en formato transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 7,2 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa. El proceso de entrenamiento incluyo una fase de DPO (Direct Preference Optimization) sobre dos datasets declarados: `athirdpath/DPO_Pairs-Roleplay-Alpaca-NSFW-v1-SHUFFLED`, orientado a pares de preferencia para roleplay con contenido NSFW, y `ResplendentAI/Synthetic_Soul_1k`, un conjunto sintetico de 1.000 ejemplos. No se especifica el volumen total de tokens de preentrenamiento ni la composicion completa del corpus.

La innovacion tecnica principal de este repositorio no reside en el modelo en si, sino en la distribucion: mradermacher ha generado cuantizaciones estaticas (no imatrix) en 12 niveles, con f16 como referencia de maxima calidad (14,6 GB) y Q2_K como opcion minima (2,8 GB). Existe ademas un repositorio separado con cuantizaciones ponderadas/imatrix en `mradermacher/Eris_Floramix_DPO_7B-i1-GGUF`, que segun el autor suelen ofrecer mejor calidad que las estaticas de tamano similar. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto en ingles con enfasis en narrativa creativa, dialogo de personaje y roleplay.
- Conversacion multi-turno orientada a mantener consistencia de personaje, gracias al ajuste DPO sobre pares de preferencia de roleplay.
- Generacion de ficcion interactiva y escenarios narrativos, incluyendo contenido NSFW segun los datasets de entrenamiento declarados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documenta modo "thinking", vision, audio ni otras capacidades multimodales.
- No se documentan capacidades destacadas de codigo o matematicas; el enfasis del entrenamiento es creativo, no tecnico.

## Casos de uso

- Roleplay conversacional en local: el modelo puede mantener dialogos de personaje multi-turno en ingles, y las cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) permiten ejecutarlo en GPUs de consumo manteniendo calidad razonable.
- Generacion de ficcion interactiva: adecuado para motores de historias ramificadas donde el modelo encarna personajes y responde a las acciones del usuario, gracias al ajuste DPO sobre pares de preferencia narrativos.
- Prototipado de chatbots de personaje: util para desarrolladores que quieran validar mecanicas de roleplay antes de invertir en modelos mayores; el formato GGUF simplifica el despliegue con llama.cpp u Ollama.
- Investigacion sobre DPO en dominios creativos: sirve como referencia para estudiar como el ajuste DPO sobre datasets de roleplay (incluyendo NSFW) afecta al estilo y la consistencia de personaje en un modelo de 7B.
- Experimentacion con cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion, lo que permite medir empiricamente el impacto de la cuantizacion en la calidad de generacion creativa en un modelo pequeno.
- Despliegue en entornos con VRAM limitada: la cuantizacion Q2_K (2,8 GB) o Q3_K_S (3,3 GB) permite ejecutar el modelo en GPUs de gama baja o incluso en CPU, a costa de calidad.
- Generacion de contenido NSFW controlado en entornos privados: el modelo esta entrenado con datasets que incluyen material NSFW, lo que lo hace adecuado para aplicaciones de ficcion para adultos siempre que se respeten las obligaciones legales y de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; para Q8_0 se recomienda una RTX 4070 Ti Super o RTX 4080; para f16 se necesita una RTX 4090 (24 GB) o una A100/H100 si se quiere contexto largo.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-16 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en transformers puede servirse con vLLM o TGI, pero esta ficha cubre la distribucion GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eris_Floramix_DPO_7B-GGUF | 7,2B | no disponible | other | GGUF | Especializado en roleplay/ficcion, solo ingles |
| Modelos 7B de proposito general (p. ej. Mistral-7B, Llama-3-8B) | 7-8B | 8K-128K segun variante | Apache 2.0 / Llama | GGUF, safetensors | Uso general, multilingue, con benchmarks publicos |
| Modelos de roleplay 7B de la comunidad (p. ej. variantes de RP en Hugging Face) | ~7B | variable | variable | GGUF, safetensors | Comparables en nicho, sin benchmarks estandarizados |

La comparacion cuantitativa con alternativas no es posible porque no se han publicado benchmarks para este modelo. Frente a modelos de proposito general como Mistral-7B o Llama-3-8B, Eris_Floramix_DPO_7B sacrifica versatilidad (solo ingles, sin tool calling documentado) a cambio de especializacion en roleplay. Frente a otros modelos de roleplay de la comunidad, la diferencia principal es la disponibilidad de 12 cuantizaciones GGUF y un repositorio imatrix separado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada, pero al estar entrenado sobre datasets de roleplay y NSFW es probable que reproduzca sesgos de esos corpus.
- Riesgo de alucinacion: inherente a los modelos de 7B; no se han publicado evaluaciones de fidelidad factual.
- Limitacion de idioma: solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con contextos largos sin pruebas empiricas.
- Restricciones de licencia: la licencia es "other", lo que obliga a revisar los terminos del modelo base `ChaoticNeutrals/Eris_Floramix_DPO_7B` antes de cualquier uso comercial. No se concede automaticamente uso comercial.
- Contenido NSFW: los datasets de entrenamiento incluyen material explicito; el despliegue en productos publicos requiere moderacion y cumplimiento legal (edad, jurisdiccion).
- Caveat de produccion: al ser una cuantizacion estatica (no imatrix), las versiones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia narrativa; para produccion se recomienda Q5_K_M o superior, o bien el repositorio i1-GGUF.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Eris_Floramix_DPO_7B-GGUF
- Repositorio imatrix (ponderado): https://huggingface.co/mradermacher/Eris_Floramix_DPO_7B-i1-GGUF
- Modelo base: https://huggingface.co/ChaoticNeutrals/Eris_Floramix_DPO_7B
- Pagina de descargas del autor: https://hf.tst.eu/model#Eris_Floramix_DPO_7B-GGUF
- Dataset DPO de roleplay: https://huggingface.co/datasets/athirdpath/DPO_Pairs-Roleplay-Alpaca-NSFW-v1-SHUFFLED
- Dataset Synthetic Soul: https://huggingface.co/datasets/ResplendentAI/Synthetic_Soul_1k
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
