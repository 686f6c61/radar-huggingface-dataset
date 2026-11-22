# mradermacher/RaifuWars-Riko-B4-9B-i1-GGUF

## Resumen

RaifuWars-Riko-B4-9B-i1-GGUF es la version cuantizada en formato GGUF del modelo yotisstudios/RaifuWars-Riko-B4-9B, publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo base es un merge con destilacion orientado a un personaje vtuber (Riko) y a comentarios de partidas (game-commentary) del universo RaifuWars, construido sobre una arquitectura de la familia Qwen (la model card etiqueta el modelo con "qwen3.5"). Cuenta con 9.197.093.888 parametros totales en pesos safetensors, lo que lo situa en la franja de los 9B.

Este repositorio no contiene el modelo original, sino las cuantizaciones GGUF generadas con imatrix (weighted/imatrix quants), pensadas para ejecucion local en CPU y GPU con llama.cpp y derivados. La licencia es Apache 2.0 y el autor del modelo base lo etiqueta como modelo de vision (segun la propia model card del cuantizador, que remite a los ficheros mmproj del repositorio estatico).

Es relevante para desarrolladores que necesiten desplegar un modelo conversacional especializado de 9B en hardware modesto, con un abanico amplio de cuantizaciones (desde Q2_K de 4,0 GB hasta Q6_K de 7,7 GB) que permiten ajustar el equilibrio entre calidad y memoria. No obstante, la informacion publica sobre el modelo base es muy limitada: no hay benchmarks, no hay ficha detallada de entrenamiento y el pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, etiquetado "qwen3.5" en la model card); merge con destilacion |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge con destilacion (tags "merge" y "distillation") sobre una arquitectura de la familia Qwen, segun la etiqueta "qwen3.5" de la model card. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se detalla la receta exacta del merge ni que modelos intervinieron en la destilacion.

La model card del cuantizador indica que se trata de un modelo de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio estatico (mradermacher/RaifuWars-Riko-B4-9B-GGUF). Las cuantizaciones i1 se han generado con imatrix (importance matrix), lo que en la practica suele mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, orientada a un personaje vtuber concreto (Riko) y a comentarios de videojuegos.
- Capacidades de vision declaradas por el cuantizador (requiere ficheros mmproj del repositorio estatico para su uso multimodal en llama.cpp).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de castellano.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.
- Al ser un merge destilado con fines de personaje, se espera un comportamiento de rol y estilo marcado, aunque no hay documentacion que lo cuantifique.

## Casos de uso

- Prototipado de chatbots de personaje: el modelo esta afinado para interpretar a Riko con un estilo y personalidad concretos, por lo que encaja en demos de asistentes conversacionales con identidad fija, usando la cuantizacion i1-Q4_K_M (5,9 GB) en una GPU consumer.
- Comentario automatizado de partidas: las etiquetas "game-commentary" y "vtuber" sugieren su uso para generar narracion o comentarios en directo de sesiones de juego, integrado en un pipeline que reciba eventos del juego y produzca texto.
- Despliegue local en equipos sin GPU dedicada: las cuantizaciones i1-Q3_K_S (4,5 GB) o i1-IQ3_M (4,6 GB) permiten ejecucion en CPU con llama.cpp en portatiles con 16 GB de RAM.
- Experimentacion con merges y destilacion: util como caso de estudio para investigadores que quieran analizar el comportamiento de un merge destilado de 9B frente a su modelo base, comparando cuantizaciones i1 frente a estaticas.
- Generacion de contenido para comunidades de vtubers: guiones, respuestas a chat y textos promocionales con la voz del personaje, siempre que el uso comercial respete la licencia Apache 2.0 y las condiciones del modelo base.
- Evaluacion de cuantizaciones imatrix: el repositorio incluye el fichero imatrix y un abanico de 15 cuantizaciones, lo que permite medir la degradacion de perplejidad entre Q2_K y Q6_K en un modelo de 9B concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 4,0 GB con i1-Q2_K, 5,9 GB con i1-Q4_K_M (recomendada por el autor) y 7,7 GB con i1-Q6_K. Hay que sumar el espacio para el contexto KV, que depende del numero de tokens de contexto (no documentado).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una RTX 3060 de 12 GB o superior permite i1-Q4_K_M y i1-Q5_K_M con contexto moderado; una RTX 4090 (24 GB) admite i1-Q6_K con contexto amplio; A100 y H100 son sobredimensionadas para este tamano salvo despliegue multi-usuario.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizaciones Q4; en 6 GB con Q3; en CPU con Q2/Q3 si la RAM lo permite.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vision se necesitan los ficheros mmproj del repositorio estatico.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RaifuWars-Riko-B4-9B-i1-GGUF | 9,2B | no disponible | Apache 2.0 | GGUF (i1) | Merge destilado de personaje; vision declarada; solo ingles |
| Qwen2.5-7B-Instruct (GGUF) | 7,6B | 32.768 tokens (segun ficha oficial de Qwen) | Apache 2.0 | GGUF | Modelo generalista multilingue con benchmarks publicos; alternativa si se necesita robustez general |
| Llama-3.1-8B-Instruct (GGUF) | 8,0B | 128.000 tokens (segun ficha oficial de Meta) | Llama 3.1 Community License | GGUF | Modelo generalista con contexto largo; licencia con restricciones de uso |
| Mistral-7B-Instruct-v0.3 (GGUF) | 7,2B | 32.768 tokens (segun ficha oficial de Mistral) | Apache 2.0 | GGUF | Generalista con tool calling; alternativa si se requiere function calling documentado |

La comparativa se limita a datos publicos de los modelos alternativos; para RaifuWars-Riko no hay benchmarks ni contexto declarado, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no se puede estimar su calidad frente a modelos generalistas del mismo tamano.
- Modelo de personaje y dominio acotado (vtuber, game-commentary): el comportamiento fuera de ese registro puede degradarse y no hay evaluacion al respecto.
- Solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion no cuantificado; al ser un merge destilado sin ficha de entrenamiento, es dificil anticipar su fiabilidad factual.
- La model card del cuantizador menciona vision, pero no se confirma que el modelo base tenga capacidades multimodales reales ni que los ficheros mmproj esten disponibles; conviene verificarlo antes de disenar un producto multimodal.
- Licencia Apache 2.0 en el repositorio cuantizado, pero el modelo base puede tener condiciones adicionales no reflejadas; revisar yotisstudios/RaifuWars-Riko-B4-9B antes de uso comercial.
- El repositorio pesa 81,3 GB por incluir 15 cuantizaciones; descargar solo el fichero GGUF necesario.
- Sin datos de contexto maximo: planificar el despliegue con margen y validar el limite real en el runtime.
- El modelo tiene 0 likes y un pipeline no declarado, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/RaifuWars-Riko-B4-9B-i1-GGUF
- Repositorio estatico de cuantizaciones (incluye mmproj si existe): https://huggingface.co/mradermacher/RaifuWars-Riko-B4-9B-GGUF
- Modelo base: https://huggingface.co/yotisstudios/RaifuWars-Riko-B4-9B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RaifuWars-Riko-B4-9B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
