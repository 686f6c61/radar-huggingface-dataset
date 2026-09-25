# chfm/10Eros-Max-Hybrid-Beta5-GGUF

## Resumen

10Eros-Max Hybrid Beta 5 (GGUF) es una versión cuantizada en formato GGUF del modelo de generación de vídeo con audio `TenStrip/10Eros-Max`, construido a su vez sobre la arquitectura MiniMax H3. El repositorio analizado se publica bajo el identificador `chfm/10Eros-Max-Hybrid-Beta5-GGUF`, aunque la propia model card atribuye la cuantización a Abiray y el modelo original a TenStrip. Se trata de un modelo de difusión para tareas de texto-a-vídeo, imagen-texto-a-vídeo e imagen-a-vídeo, con generación de audio nativa acoplada al latente de vídeo.

El modelo base pesa aproximadamente 20.111 millones de parámetros (20,1 B) y el repositorio ocupa 98,5 GB en total. La relevancia de esta ficha radica en que ofrece variantes GGUF de entre 8,9 GB y 21,6 GB pensadas para ejecución en hardware de consumo dentro de ComfyUI, algo poco habitual en modelos de vídeo de esta escala. La model card incluye además una guía explícita de cuantizaciones y de VRAM necesaria, así como advertencias críticas sobre el VAE de audio y la escala CFG.

El modelo tiene capacidad NSFW declarada por el autor del base, y combina injertos de conceptos procedentes de otros modelos de difusión (LTX 2.3, Wan 2.2 y Krea 2) sobre las capas de atención de MiniMax H3. La licencia es la MiniMax H3 Community License Agreement, con licencias adicionales aplicables a las porciones de comportamiento transferidas desde los modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion basada en MiniMax H3; cabecera de arquitectura declarada como `wan` en el GGUF para compatibilidad con los cargadores |
| Parametros totales | 20.111.462.936 (aprox. 20,1 B), dato de safetensors |
| Parametros activos | no aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de difusion para video; usa codificador de texto Qwen3-VL) |
| Tipos de cuantizacion | Q8_0 (21,6 GB), Q6_K (16,7 GB), Q5_K_M / Q5_K_S (14,1 GB), Q4_K_M / Q4_K_S (11,6 GB), Q3_K_M (8,9 GB) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement (license: other); aplican tambien licencias comunitarias de LTX 2.3, Wan 2.2 y Krea 2 a las porciones transferidas |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |
| Tamano del repositorio | 98,5 GB |
| Pipeline declarado | image-text-to-video |
| Modelo base | TenStrip/10Eros-Max |
| Codificador de texto | Qwen3-VL (requiere VRAM adicional) |
| VAE | Video VAE y Audio VAE (el de audio debe cargarse en fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MiniMax H3, un modelo de difusion para generacion conjunta de video y audio. La variante "Hybrid Beta 5" del modelo base se construye, segun el autor, con una tecnica de normalizacion distinta a la de versiones anteriores y a partir de siete injertos agrupados por concepto, combinados mediante fusiones por consenso de mas de 20 LoRAs, sin fusiones directas de LoRA. Incorpora una fusion delta de tipo turbo hibrida ya integrada en los pesos.

Los injertos se aplicaron a capas de atencion a bajo nivel para no perturbar la calidad de salida visual ni de audio de H3. Parte del comportamiento se transfirio desde LTX 2.3, Wan 2.2 y Krea 2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO, ya que la model card no los detalla. El proceso de cuantizacion a GGUF lo realizo Abiray, y la cabecera de arquitectura del archivo se falsea como `wan` para evitar las comprobaciones de arquitectura de los cargadores actuales de ComfyUI.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video) y de imagen mas texto (image-text-to-video).
- Generacion de audio nativa acoplada al latente de video (el audio y el video comparten espacio latente).
- Capacidad NSFW declarada explicitamente por el autor del modelo base, manteniendo a la vez funciones y capacidades de modelo base.
- Ejecucion en hardware de consumo mediante cuantizaciones GGUF dentro de ComfyUI.
- Ajuste del muestreo mediante distintos samplers y schedulers (res_multistep, LCM, er_sde, Euler) y control del numero de pasos.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje agentico.

## Casos de uso

- Generacion de clips cortos con audio sincronizado en ComfyUI: el modelo produce video y audio en una sola pasada, lo que simplifica pipelines que de otro modo requeririan un modelo de video y otro de audio por separado.
- Animar imagenes fijas para prototipos creativos: la modalidad image-to-video permite dar movimiento a ilustraciones o fotografias, util en previsualizacion de storyboards.
- Previsualizacion de escenas para produccion audiovisual: generar bocetos animados con audio provisional antes de rodar, reduciendo coste frente a produccion real.
- Contenido creativo para redes sociales: con las cuantizaciones Q4_K_M (11,6 GB) puede ejecutarse en GPUs de 12-16 GB, lo que permite a creadores individuales generar clips sin infraestructura de datacenter.
- Investigacion sobre transferencia de conocimiento entre modelos de difusion: el modelo ilustra la tecnica de injertos de conceptos desde LTX 2.3, Wan 2.2 y Krea 2, util para estudiar fusiones entre arquitecturas.
- Pruebas de generacion NSFW en entornos controlados y de investigacion, dado que el modelo esta disenado explicitamente para ello, siempre sujeto a las restricciones de licencia.
- Experimentacion con cuantizacion extrema: la variante Q3_K_M (8,9 GB) sirve para evaluar el impacto de la cuantizacion agresiva en la calidad de video y audio resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo, segun la guia del autor: Q8_0 ≈ 21,6 GB; Q6_K ≈ 16,7 GB; Q5_K_M / Q5_K_S ≈ 14,1 GB; Q4_K_M / Q4_K_S ≈ 11,6 GB; Q3_K_M ≈ 8,9 GB.
- A esa VRAM hay que sumar el overhead del codificador de texto Qwen3-VL, del Video VAE y del Audio VAE.
- GPU recomendadas por el autor: RTX 3090 y RTX 4090 (24 GB) para Q8_0; 20 GB o mas para Q6_K; RTX 4080 y RTX 4070 Ti Super (16 GB) para Q5; 12-16 GB para Q4; RTX 3060 / RTX 4060 (10-12 GB) para Q3_K_M.
- Cabe en GPU de consumo en todas las cuantizaciones, segun la tabla facilitada, siempre que se cumplan los margenes de VRAM indicados.
- Despliegue: ComfyUI con la extension `city96/ComfyUI-GGUF`; el archivo `.gguf` se coloca en `ComfyUI/models/unet` y se carga con el nodo `Unet Loader (GGUF)`.
- Ajustes recomendados de muestreo: res_multistep / simple con 6-8 pasos; LCM / simple con 6-8 pasos; LCM / beta con 4-6 pasos; er_sde / beta con 4 pasos; er_sde / beta57 con 4-6 pasos; Euler / simple con 4-8 pasos.
- CFG recomendada: muy baja, en torno a 1,5-2,0, para evitar que el audio nativo se degrade en estatica.
- El Audio VAE debe cargarse obligatoriamente en fp32; en fp16 o bf16 el audio suena como un zumbido electrico.
- No deben usarse cache ni spectrum si se hace renderizado con referencia, ya que provocan perdida de precision.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chfm/10Eros-Max-Hybrid-Beta5-GGUF | ~20,1 B | GGUF (Q3 a Q8) | minimax-h3-community-license-agreement | Repositorio con 0 descargas y 0 likes en el momento de la ficha | Objeto de esta ficha |
| Abiray/10Eros-Max-Hybrid-Beta5-GGUF | ~20,1 B | GGUF | minimax-h3-community-license-agreement | En HuggingFace | Repositorio equivalente atribuido al cuantizador del modelo; aparentemente el mismo contenido |
| TenStrip/10Eros-Max | ~20,1 B | safetensors | minimax-h3-community-license-agreement | En HuggingFace | Modelo base original sin cuantizar |
| MiniMax H3 (base) | no disponible | no disponible | minimax-h3-community-license-agreement | En HuggingFace (MiniMaxAI) | Arquitectura original sobre la que se construye 10Eros-Max |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de generacion de video-audio de tamano similar.

## Limitaciones y advertencias

- Riesgo de artefactos en video y audio: la model card advierte que una CFG demasiado alta (por encima de ~2,0) degrada el audio nativo hasta convertirlo en estatica.
- El Audio VAE debe cargarse en fp32; en precision reducida el audio se corrompe.
- El modelo esta orientado a contenido NSFW de forma explicita, lo que puede implicar restricciones de uso en entornos corporativos o plataformas con politicas de contenido.
- Licencia compleja: ademas de la MiniMax H3 Community License Agreement, se aplican las licencias comunitarias de LTX 2.3, Wan 2.2 y Krea 2 a las porciones de comportamiento transferidas desde cada uno de esos modelos, lo que exige revisar el uso comercial permitido.
- La cabecera de arquitectura del GGUF esta falseada como `wan` para sortear las comprobaciones de los cargadores; esto puede romper la compatibilidad con versiones futuras de las herramientas.
- No se documentan sesgos, idiomas soportados ni calidad multilingue; la informacion al respecto no esta disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni reportes de fallos conocidos.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento multi-paso.
- No se han publicado benchmarks objetivos que permitan cuantificar la calidad de generacion frente a alternativas.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/chfm/10Eros-Max-Hybrid-Beta5-GGUF
- Repositorio del cuantizador (mismo modelo): https://huggingface.co/Abiray/10Eros-Max-Hybrid-Beta5-GGUF
- Modelo base original: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Extension de ComfyUI para GGUF: https://github.com/city96/ComfyUI-GGUF
- Articulo sobre 10Eros-Max: https://www.kombitz.com/2026/09/07/10eros-max-the-new-minimax-h3-model/
- Ficha en AI Market Cap: https://aimarketcap.tech/models/abiray-10eros-max-hybrid-beta5-gguf
- Listado en local-ai-zone (variante de 7,81 GB): https://local-ai-zone.github.io/models/10eros-max.html
