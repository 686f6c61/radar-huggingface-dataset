# mradermacher/Omega-Arsenal-31B-Final-GGUF

## Resumen

Omega-Arsenal-31B-Final-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ReadyArt/Omega-Arsenal-31B-Final, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM de 30.700 millones de parámetros orientado a roleplay sin filtros, contenido adulto explícito (ERP), terror y violencia, con etiquetas que lo declaran explícitamente "unaligned" y "not-for-all-audiences". Está pensado para ejecución local con llama.cpp, Ollama o backends compatibles con GGUF.

La relevancia de esta ficha no reside en el modelo base en sí (del que no se ha publicado documentación técnica detallada) sino en la disponibilidad de cuantizaciones que abarcan desde Q2_K (12 GB) hasta Q8_0 (32,7 GB), lo que permite ajustar el compromiso entre calidad y hardware. Incluye además un suplemento multimodal (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades de visión. La licencia Apache 2.0 del repo de cuantización permite uso comercial, aunque el contenido generado está claramente dirigido a un público adulto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder, presumiblemente) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura del modelo base ReadyArt/Omega-Arsenal-31B-Final en la documentacion disponible. Por el numero de parametros (~30,7 B) y el tamano de los archivos GGUF, se trata de un modelo denso de tipo transformer decoder; no hay indicios de que sea un MoE. La presencia de archivos mmproj (suplemento multimodal en formato GGUF) indica que el modelo base probablemente incorpora un componente de vision compatible con llama.cpp, aunque esto no esta confirmado explicitamente en la model card.

Tampoco se dispone de datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion. Las etiquetas "unaligned", "nsfw" y "explicit" sugieren que el modelo ha sido ajustado (probablemente mediante fine-tuning sobre un modelo base mayor) para eliminar restricciones de contenido, orientandolo a roleplay, narrativa de terror y contenido adulto, pero no hay detalles verificables del proceso.

## Capacidades

- Generacion de texto conversacional e instruct, con foco en roleplay y narrativa interactiva.
- Contenido adulto explicito (ERP), terror y violencia sin filtros de alineacion, segun las etiquetas del repositorio.
- Posible capacidad multimodal (vision) mediante los archivos mmproj incluidos en el repo de cuantizacion, aunque no confirmada en la documentacion del modelo base.
- Etiquetado como "conversational" e "instruct", por lo que admite formato de instrucciones ademas de chat libre.
- No hay indicios de soporte oficial de tool calling, function calling ni capacidades de agente.
- Idioma principal: ingles. No se declara soporte multilingue.

## Casos de uso

- Roleplay interactivo local: ejecucion en llama.cpp u Ollama con cuants Q4_K_M (18,8 GB) para sesiones de rol de larga duracion sin censura, adecuado para usuarios que priorizan coherencia narrativa en multi-turno.
- Escritura creativa de ficcion para adultos: generacion de prosa con contenido explicito, terror o violencia grafica para autores que necesitan un modelo sin restricciones de alineacion.
- Narrativa de terror interactiva: las etiquetas de horror y violencia lo orientan a juegos de texto y aventuras narrativas con contenido maduro.
- Chatbots de personaje: construccion de bots de personaje (por ejemplo en SillyTavern u otros frontales compatibles con GGUF) con personalidades sin filtro.
- Prueba de cuantizaciones en hardware domestico: el rango Q2_K a Q8_0 permite evaluar la degradacion de calidad por cuantizacion en GPUs de consumo de 12 a 24 GB de VRAM.
- Investigacion sobre desalineacion: estudio de como los modelos "unaligned" responden a prompts sensibles, util para investigacion de seguridad y red-teaming en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~12 GB
  - Q3_K_M: ~15,4 GB
  - IQ4_XS: ~17 GB
  - Q4_K_S / Q4_K_M: ~17,9-18,8 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuants Q4 o inferiores con contexto moderado; para Q6_K y Q8_0, A100 40 GB, RTX 5090, o descarga parcial en CPU (offload) con llama.cpp.
- Cabe en GPU de consumo: si, en una RTX 3090/4090 de 24 GB con Q4_K_M o menor; en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con Q2_K o Q3_K, con rendimiento limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF; tambien vLLM con backend GGUF o el modelo base en transformers.
- Latencia y throughput: no disponible; en una RTX 4090 con Q4_K_M cabe esperar velocidades tipicas de un modelo denso de ~30 B cuantizado (del orden de 20-30 tokens/s), pero no hay datos publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| Omega-Arsenal-31B-Final (este) | ~30,7 B | GGUF | apache-2.0 | Roleplay NSFW, unaligned |
| Mistral Small 3.x (24B) | 24 B | safetensors/GGUF | Apache 2.0 | Uso general, instruct |
| Qwen2.5-32B-Instruct | 32 B | safetensors/GGUF | Qwen (uso comercial con condiciones) | Uso general, razonamiento y codigo |

Comparativa orientativa por rango de tamano: frente a Mistral Small 24B y Qwen2.5-32B, Omega-Arsenal se posiciona como modelo especializado en roleplay sin filtros, sin documentacion de benchmarks ni soporte de tool calling, mientras que las alternativas ofrecen ecosistemas mas maduros y capacidades de agente. No hay datos de rendimiento que permitan comparar calidad de salida.

## Limitaciones y advertencias

- Contenido solo para adultos: el modelo esta etiquetado como "not-for-all-audiences" y genera contenido explicito (ERP, horror, violencia); su uso con menores o en contextos laborales es inapropiado.
- Modelo "unaligned": al carecer de filtros de seguridad, puede producir contenido ofensivo, peligroso o ilegal si se le solicita; el responsable del uso es el operador.
- Riesgo de alucinacion: no disponible datos especificos, pero como todo LLM de este tamano puede inventar hechos con fluidez.
- Idioma: declarado solo para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no disponible; debe verificarse en la ficha del modelo base antes de planificar cargas de contexto largas.
- Sin benchmarks ni documentacion tecnica: la procedencia y calidad del modelo base no son verificables con los datos publicados.
- Licencia: Apache 2.0 permite uso comercial de los pesos, pero el contenido generado puede estar sujeto a la legislacion aplicable sobre contenido adulto.
- Cuantizaciones agresivas (Q2_K, Q3_K_S/M) degradan notablemente la calidad; el propio autor recomienda Q4_K_S/M como punto de equilibrio.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Omega-Arsenal-31B-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-31B-Final
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Omega-Arsenal-31B-Final-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Omega-Arsenal-31B-Final-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
