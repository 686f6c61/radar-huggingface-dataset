# mradermacher/Llama-3-Instruct-8B-SPPO-Iter2-GGUF

## Resumen

Llama-3-Instruct-8B-SPPO-Iter2-GGUF es la distribucion en formato GGUF del modelo UCLA-AGI/Llama-3-Instruct-8B-SPPO-Iter2, publicada por el usuario mradermacher el 14 de diciembre de 2024. Se trata de una cuantizacion estatica del checkpoint original, que a su vez es un ajuste fino de Llama-3-8B-Instruct mediante SPPO (Self-Play Preference Optimization), una tecnica de alineamiento por preferencias desarrollada por el grupo UCLA-AGI. El modelo resuelve el problema de desplegar un modelo afinado por preferencias en entornos con recursos limitados, ofreciendo once niveles de cuantizacion que van desde 3,3 GB hasta 16,2 GB.

El modelo base cuenta con 8.030.261.248 parametros (aproximadamente 8 mil millones) y esta disenado exclusivamente para ingles. La contribucion principal de esta publicacion no es el modelo en si, sino la disponibilidad de pesos GGUF listos para usar con llama.cpp y herramientas compatibles, lo que permite ejecucion en CPU y GPU de gama consumer sin necesidad de infraestructura de datacenter.

Es relevante ahora porque SPPO representa una alternativa a RLHF y DPO para alineamiento, y esta version cuantizada democratiza su evaluacion en hardware asequible. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo hereda las limitaciones del Llama-3 original en cuanto a idiomas y sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien disponible el modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer decoder-only con atencion multi-cabeza agrupada (GQA) y tokenizer BPE. Sobre esta base, UCLA-AGI aplico SPPO (Self-Play Preference Optimization), un metodo de alineamiento que, a diferencia de RLHF clasico, evita la necesidad de un modelo recompensa separado y utiliza un esquema de auto-juego donde el modelo genera pares de respuestas y un juez las evalua. El dataset de preferencias empleado es openbmb/UltraFeedback, segun los metadatos de la model card.

No se dispone en la informacion proporcionada de datos sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset mas alla de UltraFeedback, ni si se aplicaron etapas adicionales de DPO o RLHF. Tampoco se documentan innovaciones tecnicas especificas de decodificacion o atencion en esta publicacion, que es exclusivamente una cuantizacion del checkpoint original. La version "Iter2" sugiere una segunda iteracion del proceso SPPO, pero los detalles de esa iteracion no estan disponibles en la informacion consultada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-3-8B-Instruct y afinada por preferencias con SPPO.
- Razonamiento y respuesta a instrucciones, con alineamiento orientado a preferencias humanas segun UltraFeedback.
- Generacion de codigo y matematicas basicas, como capacidad general del modelo base Llama-3-8B.
- Soporte de conversaciones multi-turno mediante el formato de chat de Llama-3-Instruct.
- Capacidades multilingues limitadas al ingles segun la model card (language: en).
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni thinking mode.

## Casos de uso

- Evaluacion de tecnicas de alineamiento SPPO en hardware consumer: gracias a las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB), un investigador puede ejecutar el modelo en una GPU de 8-12 GB y comparar su comportamiento frente a variantes DPO o RLHF del mismo tamano.
- Chatbot de asistencia en ingles para prototipos: el modelo puede gestionar conversaciones multi-turno en ingles con un contexto heredado del Llama-3 base, adecuado para demos y validacion de producto antes de escalar a modelos mayores.
- Generacion de texto en entornos sin GPU: la cuantizacion Q2_K (3,3 GB) permite ejecucion en CPU con llama.cpp, util para pruebas de integracion en CI o entornos de desarrollo sin acelerador.
- Fine-tuning ligero sobre la version f16 o Q8_0: aunque el objetivo principal es inferencia, los pesos f16 (16,2 GB) permiten servir como punto de partida para ajustes con LoRA en GPUs de 24 GB como la RTX 4090.
- Analisis de preferencias y evaluacion de calidad de respuestas: el modelo puede emplearse como generador de candidatos en pipelines de evaluacion comparativa, dado su entrenamiento con UltraFeedback.
- Despliegue en edge o dispositivos con memoria unificada: las cuantizaciones Q3_K_S (3,8 GB) e IQ4_XS (4,6 GB) caben en equipos con 8 GB de RAM/VRAM, habilitando asistentes locales de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo si se busca throughput alto en batching, no necesario para uso individual.
- Cabe en GPU consumer: si, desde una GTX 1660 6 GB (Q3_K_S) hasta una RTX 4090 (f16). Las cuantizaciones Q4_K_M y Q5_K_M son las recomendadas por el autor para equilibrio calidad/velocidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware y la cuantizacion; el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3-Instruct-8B-SPPO-Iter2-GGUF (este) | 8,03 B | no disponible | Apache 2.0 | GGUF | Alineado con SPPO sobre UltraFeedback; solo ingles |
| Llama-3-8B-Instruct (Meta) | 8,03 B | 8.192 tokens (segun documentacion de Meta, no confirmado aqui) | Llama 3 Community License | safetensors, GGUF | Base del modelo; alineamiento RLHF; multilingue limitado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens (segun documentacion de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa con contexto mayor y licencia permisiva |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

Los datos de contexto y parametros de los modelos comparables provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen como referencia orientativa.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea degradado.
- Riesgo de alucinacion inherente a los modelos de 8B afinados por preferencias; no debe usarse como fuente de verdad sin verificacion.
- Sesgos heredados de Llama-3 y de UltraFeedback: posibles sesgos de genero, culturales y de estilo en las respuestas.
- La licencia Apache 2.0 se aplica a esta cuantizacion, pero conviene verificar la licencia del modelo base UCLA-AGI/Llama-3-Instruct-8B-SPPO-Iter2 y de Llama-3 de Meta para uso comercial, ya que los terminos de Llama 3 pueden imponer restricciones adicionales.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- La longitud de contexto no esta confirmada en la informacion proporcionada; verificar antes de disenar aplicaciones con contextos largos.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del autor ("lower quality").
- El repo ocupa 71,8 GB en total por incluir todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Llama-3-Instruct-8B-SPPO-Iter2-GGUF
- Modelo base: https://huggingface.co/UCLA-AGI/Llama-3-Instruct-8B-SPPO-Iter2
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Llama-3-Instruct-8B-SPPO-Iter2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3-Instruct-8B-SPPO-Iter2-GGUF
- Dataset de preferencias: https://huggingface.co/datasets/openbmb/UltraFeedback
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
