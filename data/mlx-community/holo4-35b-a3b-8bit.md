# mlx-community/Holo4-35B-A3B-8bit

## Resumen

Holo4-35B-A3B es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por H Company, orientado a tareas de computer use, agentes GUI y localizacion de elementos en pantallas. Esta ficha describe la version cuantizada a 8 bits para MLX, publicada por la comunidad mlx-community, que permite ejecutar el modelo en hardware Apple Silicon mediante la libreria mlx-vlm. El modelo base emplea la arquitectura qwen3_5_moe, con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token (denotado por el sufijo A3B).

La relevancia de esta variante radica en que preserva la precision del modelo original en tareas de localizacion de clics (91,0 % de accuracy en WebClick) mientras reduce el peso del repositorio a 37,7 GB y hace viable la inferencia en un unico equipo con GPU integrada de Apple. La model card reporta velocidades de 88-111 tokens por segundo en decodificacion sobre un Apple M5 Max con 128 GB de memoria unificada, con un pico de 39,8 GB.

El modelo esta pensado para flujos de agentes que interactuan con interfaces graficas: interpretar capturas de pantalla, localizar elementos y emitir acciones. La licencia Apache-2.0 del modelo original se conserva en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con vision tower y capas DeltaNet |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (sufijo A3B; no se detalla el valor exacto en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (expertos, atencion, DeltaNet, shared expert, embeddings y lm_head); routers a 8-bit; vision tower en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con un tower de vision para entrada image-text-to-text. La model card de la conversion menciona explicitamente capas DeltaNet, lo que sugiere un diseno hibrido que combina atencion estandar con mecanismos de estado recurrente lineal. El modelo emplea expertos enrutados mas un shared expert, y los pesos de los routers se mantienen a 8 bits en esta conversion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card de la conversion remite a la model card original de Hcompany/Holo4-35B-A3B para los detalles de entrenamiento, que no se incluyen en los datos disponibles. La conversion se realizo con mlx-vlm 0.8.0 a partir de los pesos oficiales en bfloat16 mediante el comando `mlx_vlm.convert` con `--q-bits 8 --q-group-size 64`.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes (image-text-to-text): interpretacion de capturas de pantalla y elementos de interfaz.
- Localizacion de elementos (element localization): devuelve coordenadas como enteros en el rango [0, 1000], con modo thinking desactivado segun la receta oficial.
- Computer use y agentes GUI: emision de acciones de clic y navegacion sobre interfaces.
- Soporte de agentes y razonamiento multi-paso (tags `agent`, `action`).
- Capacidades multimodales con multiples imagenes en un mismo prompt (la model card reporta pruebas con 3 capturas de 1920x1080, unas 12k tokens de prompt).
- No se documentan capacidades de audio ni de tool calling en la informacion disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede recibir una captura de pantalla y devolver las coordenadas del elemento objetivo, lo que permite generar scripts de test end-to-end que localizan botones y campos de forma robusta ante cambios de layout.
- Agentes de navegacion web: con un accuracy del 94,9 % en el subconjunto agentbrowse de WebClick, es adecuado para pilotar navegadores en tareas de rellenado de formularios y extraccion de datos.
- Asistentes de escritorio en macOS: al estar empaquetado para MLX, puede integrarse en aplicaciones nativas de Apple Silicon que necesiten interpretar la pantalla del usuario y sugerir o ejecutar acciones.
- Automatizacion de flujos RPA: la localizacion de elementos con coordenadas normalizadas permite sustituir selectores fragiles por predicciones visuales en pipelines de robotica de software.
- Analisis de capturas en lote: con 91 tok/s de decodificacion en prompts largos multi-imagen, puede procesar secuencias de pantallas para auditar estados de aplicacion o detectar errores de UI.
- Prototipado de agentes de computer use en local: investigadores pueden validar recetas de prompting y localizacion en un equipo de sobremesa sin depender de APIs externas, gracias a los 39,8 GB de pico de memoria en M5 Max de 128 GB.
- Extraccion de informacion de calendarios y vistas estructuradas: el subconjunto calendars de WebClick alcanza un 86,7 %, lo que lo hace util para automatizar la lectura de agendas y eventos en interfaces.

## Benchmarks y rendimiento

Resultados de WebClick (1639 muestras, protocolo oficial de localizacion de H Company, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Accuracy | IC 95 % |
|---|---|---|
| MLX 8-bit (este modelo) | 91,0 % | 89,6 - 92,3 |
| MLX 4-bit | 90,6 % | 89,1 - 91,9 |
| llama.cpp Q4_K_M (GGUF oficial) | 90,8 % | 89,4 - 92,2 |

Desglose por subconjunto de este modelo: agentbrowse 94,9 % (n=590), calendars 86,7 % (n=528), humanbrowse 91,0 % (n=521). Las diferencias frente a 4-bit (+0,4 puntos, p = 0,47) y frente al GGUF Q4_K_M (+0,2 puntos, p = 0,77) no son estadisticamente significativas.

Rendimiento en Apple M5 Max (128 GB, peticion unica, greedy):

| Motor | 1280x720: primer token / decodificacion | 1920x1080: primer token / decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (8-bit) | 549 ms / 88 tok/s | 1,01 s / 111 tok/s | 39,8 GB (pico) |
| llama.cpp (Metal), Q4_K_M | 690 ms / 123 tok/s | 3,36 s / 97 tok/s | 23,0 GB (RSS) |

Con prompt multi-imagen largo (3 capturas 1920x1080, unas 12k tokens de prompt, 1024 tokens generados): 5,5 s hasta el primer token y 91 tok/s de decodificacion en MLX, frente a 14,3 s y 72 tok/s en llama.cpp con Q4_K_M.

## Requisitos de hardware

- Memoria: el pico medido en MLX es de 39,8 GB para prompts de una imagen y 40,0 GB para prompts multi-imagen de 12k tokens. Se recomienda un equipo con al menos 48 GB de memoria unificada; 64 GB o mas para margen.
- GPU: disenado para Apple Silicon mediante MLX. Las mediciones se realizaron en un Apple M5 Max de 128 GB. No se documentan requisitos para GPU NVIDIA o AMD en esta variante.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (M-series Pro/Max/Ultra con 48 GB o mas). No cabe en GPUs de consumo con 24 GB o menos en esta cuantizacion de 8 bits.
- Despliegue: mlx-vlm 0.8.0 o superior y mlx 0.32.4 o superior. Para otras plataformas existe el GGUF oficial Q4_K_M ejecutable con llama.cpp.
- Latencia y throughput: primer token de 549 ms a 1,01 s para capturas individuales; decodificacion de 88-111 tok/s; 5,5 s hasta el primer token en prompts de 12k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo4-35B-A3B-8bit (MLX) | 35,1B totales / ~3B activos | No disponible | 91,0 % | Apache-2.0 | MLX, safetensors |
| Holo4-35B-A3B (MLX 4-bit) | 35,1B totales / ~3B activos | No disponible | 90,6 % | Apache-2.0 | MLX |
| Holo4-35B-A3B GGUF Q4_K_M | 35,1B totales / ~3B activos | No disponible | 90,8 % | Apache-2.0 | GGUF, llama.cpp |

No se dispone de datos de benchmarks frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues con ventanas largas sin validacion previa.
- Riesgo de alucinacion en coordenadas: aunque la accuracy es alta, un 9 % de clics fallidos en WebClick implica que en produccion conviene validar las acciones antes de ejecutarlas.
- Las diferencias de accuracy frente a 4-bit no son estadisticamente significativas, por lo que la ventaja del 8-bit es marginal en calidad y se paga en memoria (39,8 GB frente a los 23,0 GB del GGUF Q4_K_M).
- El preprocesamiento difiere entre motores (MLX frente a llama.cpp), de modo que las comparaciones de accuracy entre motores no aislan el efecto de los pesos.
- La cuantizacion a 8 bits puede degradar tareas distintas de la localizacion, que no se han evaluado en la model card.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de Hcompany/Holo4-35B-A3B para condiciones adicionales del modelo base.
- Algunas mediciones de velocidad marcadas con asterisco en la model card variaron mas de un 10 % entre ejecuciones y deben tratarse como indicativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Holo4-35B-A3B-8bit
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Documentacion de localizacion de H Company: https://hub.hcompany.ai/models-api/element-localization
- Sitio de H Company: https://www.hcompany.ai/
- Libreria mlx-vlm: https://pypi.org/project/mlx-vlm/
