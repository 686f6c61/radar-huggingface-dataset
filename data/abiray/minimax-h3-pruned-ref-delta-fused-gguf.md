# Abiray/MiniMax-H3-Pruned-Ref-Delta-Fused-GGUF

## Resumen

Abiray/MiniMax-H3-Pruned-Ref-Delta-Fused-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI, una variante fusionada de la arquitectura MiniMax-H3 de MiniMax AI. El modelo original parte de una version podada de 20.111.462.936 parametros (20,1B) sobre la que se aplica una fusion hibrida de pesos mediante un merge delta de rango 1024 (ΔW con r=1024): se combinan las caracteristicas de FL2VA (calidad visual nitida, dinamica de movimiento y audio limpio) con el condicionamiento persistente de personaje a partir de multiples imagenes de Ref2VA. El resultado es un modelo de generacion de video con condicionamiento por referencias, orientado a flujos de trabajo de ComfyUI.

El problema que resuelve esta publicacion es de accesibilidad: el peso en BF16 del modelo base requiere recursos que quedan fuera del alcance de una GPU de consumo, mientras que estas cuantizaciones permiten ejecutarlo localmente en tarjetas de 16 GB a 24 GB de VRAM con una perdida de calidad que el autor califica de minima. El repositorio ocupa 98,5 GB e incluye siete variantes que van desde Q8_0 (21,6 GB) hasta Q3_K_M (8,9 GB), con Q4_K_M (11,6 GB) marcada por el autor como la opcion mas recomendada.

La relevancia actual del artefacto es doble: por un lado, lleva a hardware de consumo un modelo multimodal de video con audio y condicionamiento de identidad; por otro, documenta un pipeline reproducible de conversion y cuantizacion GGUF para modelos de difusion de video en ComfyUI. Conviene senalar que el repositorio no tiene descargas ni likes en el momento de la consulta y que la model card no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 podada, fusion hibrida FL2VA + Ref2VA mediante merge delta de rango 1024 (ΔW r=1024) sobre pesos podados; no se detalla la topologia interna (transformer de difusion) en la informacion disponible |
| Parametros totales | 20.111.462.936 (20,1B), segun safetensors del modelo base |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible / no aplica como contexto de tokens; la generacion se controla por numero de fotogramas: 49 u 81 (regla 4k+1) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license (license_name: minimax-h3-community-license, license: other) |
| Formato de pesos | GGUF (7 ficheros); el modelo base esta en safetensors/BF16 |
| Pipeline declarado | image-to-video (etiquetas adicionales: text-to-video, video-generation, multimodal) |
| Tamano del repositorio | 98,5 GB |
| Modelo base | xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI |
| Fecha de publicacion | 16 de septiembre de 2026 (creacion); ultima actualizacion el mismo dia |
| Descargas / likes | 0 / 0 en el momento de la consulta |

Detalle de ficheros GGUF publicados:

| Fichero | Tamano | GPU recomendada por el autor | Notas |
|---|---|---|---|
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q8_0.gguf | 21,6 GB | 24 GB+ / multi-GPU | Practicamente indistinguible del base BF16 |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q6_K.gguf | 16,7 GB | 24 GB VRAM | Punto de equilibrio de alta fidelidad |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q5_K_M.gguf | 14,1 GB | 16-24 GB VRAM | Buen equilibrio entre consistencia de movimiento y tamano |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q5_K_S.gguf | 14,1 GB | 16 GB VRAM | Menor huella con alta precision |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q4_K_M.gguf | 11,6 GB | 16 GB VRAM | El autor la marca como la mas recomendada |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q4_K_S.gguf | 11,6 GB | 16 GB VRAM | Cuantizacion de 4 bits ligera |
| MiniMax-H3-Pruned-Ref-Delta-Fused-Q3_K_M.gguf | 8,9 GB | 12-16 GB VRAM | Maximo ahorro de VRAM en configuraciones limitadas |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento, el volumen de datos ni si hubo etapas de RLHF/DPO. Lo que si documenta es la construccion de los pesos: se parte de una version podada de MiniMax-H3 con 20,1B de parametros y se fusionan dos variantes funcionales mediante un merge delta de bajo rango con rango 1024. La componente FL2VA aporta calidad visual nitida, dinamica de movimiento y audio limpio; la componente Ref2VA aporta condicionamiento persistente de personaje a partir de multiples imagenes de referencia. Los acronimos FL2VA y Ref2VA no se expanden en la informacion proporcionada.

El trabajo de Abiray se limita a la conversion y cuantizacion a GGUF de los pesos fusionados de xmarre; el modelo resultante mantiene la arquitectura y los pesos del modelo base, unicamente con menor precision numerica. La integracion en ComfyUI se apoya en el nodo ComfyUI-GGUF de city96, que permite cargar pesos GGUF de modelos de difusion. Como tecnica de aceleracion, la model card recomienda el uso de un LoRA turbo destilado de 8 pasos (minimax_h3_ref2v_turbo_8step_v1.0_768p_comfyui_resized_avg_rank_20_bf16.safetensors) con fuerza 1.0 (o 0,85 si aparecen ruidos de rizado finos), CFG 1.0, sampler Euler y scheduler Beta o Simple.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de datos sinteticos ni sobre procesos de alineacion.

## Capacidades

- Generacion de video a partir de imagenes (image-to-video) y de texto (text-to-video), segun las etiquetas declaradas por el autor.
- Condicionamiento persistente de personaje mediante multiples imagenes de referencia (herencia de Ref2VA), orientado a mantener consistencia de identidad entre planos.
- Generacion con audio limpio asociado al video (herencia de FL2VA), segun la descripcion del merge.
- Control de resolucion y relacion de aspecto: 1280x720 (16:9) y 1280x544 (2.39:1) entre las configuraciones recomendadas.
- Control de duracion por numero de fotogramas: 49 u 81, siguiendo la regla 4k+1.
- Inferencia acelerada mediante LoRA turbo destilado de 8 pasos, con CFG 1.0.
- Ejecucion local en ComfyUI mediante el nodo ComfyUI-GGUF, con carga desde models/diffusion_models/ o models/unet/.
- Soporte de cuantizaciones de 8, 6, 5, 4 y 3 bits para adaptar el consumo de VRAM.
- Tool calling / function calling: no disponible (no aplica a un modelo de generacion de video).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible; la model card no especifica idiomas de prompt ni de audio.

## Casos de uso

- Consistencia de personaje en series o cortos: el condicionamiento multi-imagen heredado de Ref2VA permite fijar la apariencia de un personaje con varias referencias y generar planos sucesivos sin que la identidad se degrade, algo critico en narrativa episodica.
- Previsualizacion de anuncios con audio: al conservar el audio limpio de FL2VA, el modelo sirve para generar piezas de 49 u 81 fotogramas en 1280x720 con locucion o efectos ya integrados, antes de pasar a produccion final.
- Iteracion rapida de storyboards y animaticas: con el LoRA turbo a 8 pasos y CFG 1.0, un estudio pequeno puede encadenar decenas de variaciones de plano por hora en una RTX 4090 sin coste de API.
- Generacion de contenido para redes sociales en formato vertical o panoramico: las dos resoluciones documentadas (16:9 y 2.39:1) cubren publicacion en YouTube y formatos cinematograficos, y la cuantizacion Q4_K_M de 11,6 GB permite ejecutarlo en una GPU de 16 GB.
- Trabajo con material sensible sin salida a la nube: al ejecutarse en local en ComfyUI, los fotogramas de referencia (por ejemplo, rostros de actores bajo contrato) no salen de la infraestructura propia, lo que simplifica el cumplimiento de acuerdos de confidencialidad.
- Investigacion sobre cuantizacion de modelos de difusion de video: el repositorio ofrece siete niveles de precision sobre el mismo modelo, lo que permite medir de forma controlada el impacto de Q3_K_M a Q8_0 en calidad visual, coherencia temporal y consumo de memoria.
- Integracion en pipelines por lotes para estudios de animacion: cargando el GGUF Q5_K_M o Q4_K_M en ComfyUI y automatizando grafos por API, se pueden producir variantes de plano en serie en una unica GPU de 16-24 GB.
- Prototipado de dobles digitales o avatares: combinando imagenes de referencia consistentes con prompts de movimiento, se pueden generar pruebas de concepto de un avatar antes de invertir en captura de movimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, SSIM, VBench ni similares) ni comparaciones cuantitativas con otros modelos de generacion de video. Tampoco se publican cifras de latencia, throughput ni consumo medido de VRAM por cuantizacion; las recomendaciones de GPU del autor son orientativas y basadas en el tamano de cada fichero.

## Requisitos de hardware

- VRAM estimada por cuantizacion, segun el tamano declarado de cada fichero: Q8_0 21,6 GB; Q6_K 16,7 GB; Q5_K_M y Q5_K_S 14,1 GB; Q4_K_M y Q4_K_S 11,6 GB; Q3_K_M 8,9 GB. Hay que sumar a esas cifras el consumo de activaciones, el VAE y el resto del grafo de ComfyUI, que la model card no cuantifica.
- GPU de 24 GB o mas: RTX 3090, RTX 4090, RTX 5090, A100 40 GB, H100. Suficientes para Q8_0 y Q6_K, o para las variantes menores con margen para lotes.
- GPU de 16 GB: RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 5060 Ti 16 GB, A4000. El autor recomienda Q5_K_M, Q5_K_S, Q4_K_M o Q4_K_S para este tramo; Q4_K_M es su opcion preferida.
- GPU de 12 GB: el autor situa Q3_K_M (8,9 GB) en el rango de 12-16 GB de VRAM, por lo que seria la unica variante viable en tarjetas como la RTX 3060 de 12 GB.
- Configuraciones multi-GPU: contempladas por el autor para Q8_0.
- Cabe en GPU de consumo: si, en el rango de 12 GB a 24 GB segun la cuantizacion elegida (RTX 3060 12 GB, 4060 Ti 16 GB, 4070 Ti Super, 4080, 4090, 5090).
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-GGUF de city96, colocando el fichero .gguf en ComfyUI/models/diffusion_models/ o en ComfyUI/models/unet/. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo de difusion de video.
- Aceleracion opcional: LoRA turbo destilado de 8 pasos, con fuerza 1.0 (0,85 si aparece ruido de rizado), CFG 1.0 (no superar 1.2 con LoRAs turbo destilados), sampler Euler y scheduler Beta o Simple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificables en la informacion proporcionada para establecer una comparativa cuantitativa. La tabla siguiente recoge unicamente los datos confirmados sobre el modelo y su cadena de derivacion; el resto de campos se marcan como no disponibles.

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abiray/MiniMax-H3-Pruned-Ref-Delta-Fused-GGUF | Cuantizaciones GGUF de un modelo de video con condicionamiento por referencias | 20,1B (heredados del base) | GGUF (Q3_K_M a Q8_0) | minimax-h3-community-license | HuggingFace |
| xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI | Modelo fusionado original (merge delta r=1024) | 20,1B | No disponible (safetensors/BF16 segun la model card) | No disponible | HuggingFace |
| MiniMaxAI/MiniMax-H3 | Arquitectura base de MiniMax AI | No disponible | No disponible | minimax-h3-community-license | HuggingFace |
| Alternativas de la misma categoria (por ejemplo, otros modelos abiertos de generacion de video) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion objetiva de calidad: no hay FVD, CLIP score ni resultados de VBench, por lo que la afirmacion de "perdida de calidad minima" respecto a BF16 es una apreciacion del autor, no un dato medido.
- Las recomendaciones de VRAM se basan en el tamano de los ficheros GGUF y no en mediciones reales de consumo; en produccion hay que anadir el coste del VAE, las activaciones y el resto del grafo de ComfyUI, y conviene validar la configuracion concreta antes de dimensionar hardware.
- Las cuantizaciones de 3 y 4 bits pueden degradar la coherencia temporal y el detalle fino; la propia model card contempla ajustes (bajar la fuerza del LoRA a 0,85) para mitigar artefactos de rizado.
- Con LoRAs turbo destilados, el CFG no debe superar 1.2; valores superiores pueden producir artefactos.
- La licencia es minimax-h3-community-license, no una licencia open source estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones de atribucion, limites de escala o condiciones especificas de redistribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, asi que no existe validacion independiente de la comunidad sobre la fidelidad de las cuantizaciones.
- La model card no especifica idiomas soportados para prompts ni para el audio, ni ofrece informacion sobre sesgos, diversidad de los datos de entrenamiento o representacion de personas.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir anatomias incorrectas, texto ilegible, incoherencias entre fotogramas y desviaciones respecto a la referencia de personaje, especialmente en duraciones largas (81 fotogramas) y cuantizaciones agresivas.
- El modelo esta limitado a las duraciones documentadas (49 u 81 fotogramas, regla 4k+1) y a las resoluciones recomendadas; no hay informacion sobre comportamiento fuera de esos rangos.
- Los enlaces de la busqueda web realizada no contenian informacion tecnica relevante sobre este modelo, por lo que toda la ficha se basa en la model card y en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abiray/MiniMax-H3-Pruned-Ref-Delta-Fused-GGUF
- Modelo base (merge delta de rango 1024 para ComfyUI): https://huggingface.co/xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI
- Arquitectura base MiniMax-H3 (MiniMax AI): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Texto de la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE
- Nodo ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
