# elismasilva/ltx2.3_video_custom_blocks

## Resumen

ltx2.3_video_custom_blocks es un repositorio de codigo publicado por el usuario elismasilva que contiene bloques modulares para Modular Diffusers, pensados para la generacion conjunta de video y audio con la familia LTX 2.3. No incluye pesos: el repositorio solo aporta la logica de pipeline (condiciones explicitas, etapas y manifiesto) que se combina con un checkpoint externo, en este caso OzzyGT/LTX-2.3-Distilled-1.1. La licencia declarada es Apache 2.0 y la libreria de referencia es diffusers.

El problema que resuelve es de orquestacion: en lugar de una pipeline monolitica con argumentos agregados, expone las condiciones como registros explicitos (LTX2ImageCondition, LTX2AudioCondition) y divide la ejecucion en diez etapas extraibles de forma independiente (inputs, text_encoder, connectors, video_encoder, audio_encoder, reference_encoder, prepare, denoise, trim, decode). Esto permite cargar y descargar componentes por fases, algo relevante para ejecucion en GPUs con memoria limitada.

Es relevante ahora por dos motivos: la generacion conjunta de video y audio con condicionamiento multimodal (texto, imagen y audio en la misma linea temporal) y la adopcion del sistema Modular Diffusers, que todavia requiere un fork especifico de la libreria (probado con 0.41.0.dev0). El flujo destilado del manifiesto funciona con 8 pasos de inferencia y un ejemplo nominal de 121 fotogramas a 24 fps (unos 5 segundos) a 704x1280.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion conjunta de video y audio (familia LTX 2.3) implementada como bloques de Modular Diffusers; repositorio de codigo, sin pesos |
| Parametros totales | no disponible (el repositorio no almacena tensores de modelo) |
| Longitud de contexto | no disponible (no aplica: modelo de difusion de video; carga nominal de 121 fotogramas a 24 fps) |
| Tipos de cuantizacion | bfloat16 para los componentes principales y float32 para el vocoder; reutilizacion opcional de conversion FP8 en feed-forward como experimento acotado (las matematicas de cuantizacion las gestiona TorchAO/Diffusers). No se documentan GGUF ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (repositorio de codigo; la licencia del checkpoint base debe verificarse por separado) |
| Formato de pesos | no aplica: el repositorio no contiene pesos. Los pesos se cargan desde el checkpoint con diffusers |
| Tareas declaradas | text-to-video, image-to-video, audio-to-video y generacion conjunta video+audio |
| Checkpoint base | OzzyGT/LTX-2.3-Distilled-1.1 |
| Pasos de inferencia (flujo destilado) | 8 |
| Resolucion y duracion de ejemplo | 704x1280, 121 fotogramas, 24 fps |
| Version de diffusers requerida | fork con diffusers.modular_pipelines.ltx2 (probado con 0.41.0.dev0) |
| Componentes esperados | text_encoder, tokenizer, connectors, transformer, vae, audio_vae, vocoder, scheduler y guiders de video/audio |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de difusion de la familia LTX 2.3 que genera video y audio de forma conjunta, con un transformer de codigo local que preserva las claves del checkpoint y anade mecanismos opcionales de ejecucion: chunking de activaciones, modulacion local por fase, timesteps compactos, reutilizacion de residuales y RoPE, y callbacks de computo experimentales. Estos mecanismos son caracteristicas de ejecucion de LTX y no un soporte generico de FP8 para DDO; no se activan de forma silenciosa al cargar desde el Hub. El repositorio no entrena ni publica pesos: la parte entrenada corresponde al checkpoint base.

El pipeline destilado se compone de diez etapas modulares: inputs (valida dimensiones y controles), text_encoder (lee estados ocultos del prompt sin logits de LM-head), connectors (adapta embeddings de texto para condicionamiento de video y audio), video_encoder y audio_encoder (codifican anclas opcionales de imagen/video y de audio en la linea temporal), reference_encoder (codifica referencias compatibles con IC-LoRA), prepare (crea latentes, mascaras, timesteps y coordenadas posicionales), denoise (denoising conjunto de video y audio con guiders y schedulers separados), trim (elimina tokens de referencia antes de decodificar) y decode (genera fotogramas y formas de onda). No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto, con audio generado de forma conjunta en la misma pasada.
- Image-to-video: condicionamiento con una imagen anclada a un fotograma concreto mediante LTX2ImageCondition (parametros frame y strength).
- Audio-to-video: condicionamiento con una forma de onda resampleada a la frecuencia del audio_vae, con ventana temporal definida por start_time y end_time.
- Condicionamiento conjunto: texto + imagen + audio en la misma ejecucion.
- Soporte de referencias IC-LoRA a traves de la etapa reference_encoder.
- Ejecucion por etapas: cada bloque puede extraerse de blocks.sub_blocks e inicializarse por separado para entornos con memoria ajustada.
- Flujo destilado de 8 pasos mediante la clase LTX2VideoDistilledBlocks; la clase base LTX2VideoBlocks tambien se exporta y requiere configurar sus guiders de forma explicita.
- Salida de video codificable a MP4 (encode_video) y de audio con la frecuencia de muestreo del vocoder.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue declarado.

## Casos de uso

- Clips musicales con audio sincronizado: el modelo genera video y audio en la misma pasada, de modo que la pista sonora no se anade en postproduccion. El flujo nominal de 121 fotogramas a 24 fps cubre unos 5 segundos por generacion, adecuado para extractos promocionales.
- Animatic a partir de storyboard: usando LTX2ImageCondition con frame=0 y strength=1.0 se anima una ilustracion fija, lo que permite validar secuencias antes de producirlas en 3D o rodaje real.
- Doblaje y lip-sync controlado: con LTX2AudioCondition se fija una locucion concreta en una ventana temporal (por ejemplo de 0 a 5 segundos) y el modelo genera el video condicionado a esa pista, util para prototipos de localizacion de contenido.
- Previsualizacion de VFX y entornos: el ejemplo de la model card (un musico tocando la guitarra en un pueblo del oeste) ilustra la generacion de planos de ambientacion a 704x1280 sin necesidad de sets fisicos.
- Publicidad y contenido para redes: generacion de piezas verticales u horizontales cortas con audio integrado, ajustando altura y anchura por llamada.
- Investigacion en pipelines modulares: las diez etapas extraibles permiten medir el coste de cada fase (codificacion de texto, denoising, decodificacion) y ensayar estrategias de offloading por componente en GPUs de 8 GiB.
- Evaluacion de recetas destiladas y de conversion FP8: el transformer local admite reutilizacion opcional de conversion FP8 en feed-forward como experimento de computo acotado, util para comparar calidad y coste.
- Integracion en herramientas de edicion asistida: al exponer las condiciones como registros, un editor puede construir lineas temporales con multiples anclas (imagen en el fotograma 0, audio en un intervalo) sin reescribir la pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo FVD, CLIP score, MMLU, HumanEval ni comparaciones cuantitativas con otros modelos de generacion de video, y el repositorio no aporta evaluaciones propias.

## Requisitos de hardware

- Memoria: la documentacion indica que el ejemplo completo "asume memoria suficiente para todos los componentes" y que en una GPU de 8 GiB debe recurrirse a carga y offloading por etapas en lugar de mover la pipeline entera a CUDA. No se publican cifras exactas de VRAM para resoluciones o configuraciones concretas.
- Precision: los componentes principales se cargan en bfloat16 y el vocoder en float32, lo que incrementa ligeramente el consumo frente a un pipeline completamente en bf16.
- GPU recomendadas: no disponible. El unico dato de referencia es el escenario de 8 GiB con carga escalonada; no se mencionan modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: condicionada a la memoria disponible y a la estrategia de offloading; sin cifras publicadas no puede confirmarse mas alla del caso de 8 GiB con carga por etapas.
- Despliegue: requiere el fork de Diffusers que aporta diffusers.modular_pipelines.ltx2 (probado con 0.41.0.dev0) y cargar los bloques con trust_remote_code=True. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion de este tipo.
- Latencia y throughput: no disponible. Solo se especifica el coste en pasos (8 pasos de inferencia para el flujo destilado) y la carga de trabajo nominal (121 fotogramas, 24 fps, 704x1280).

## Comparativa con modelos similares

| Modelo o componente | Que aporta | Parametros | Contexto o duracion | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| elismasilva/ltx2.3_video_custom_blocks | Bloques modulares y condiciones explicitas para LTX 2.3 | no aplica (solo codigo) | 121 fotogramas a 24 fps en el ejemplo | 8 (destilado) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| LTX2VideoBlocks (clase base del mismo modulo) | Flujo no destilado; obliga a configurar guiders | no disponible | no disponible | no disponible | Apache 2.0 (mismo repositorio) | Incluida en el mismo modulo de confianza |
| OzzyGT/LTX-2.3-Distilled-1.1 | Checkpoint que aporta los pesos y la configuracion | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base declarado) |

No se dispone de datos de otros modelos comparables (parametros, contexto, rendimiento o licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente codigo: sin el checkpoint OzzyGT/LTX-2.3-Distilled-1.1 y sus componentes no hay inferencia posible.
- Requiere un fork especifico de Diffusers con diffusers.modular_pipelines.ltx2, probado con 0.41.0.dev0; una release estandar de Diffusers no es compatible.
- La carga se hace con trust_remote_code=True, lo que implica ejecutar codigo remoto: la model card recomienda fijar una revision concreta (revision="<reviewed-commit>") por reproducibilidad y seguridad.
- Una sola linea temporal de audio de origen se comparte en todo el lote de salida; no esta implementada la generacion de audio independiente por prompt.
- La rejilla de fotogramas es causal y sigue el patron 8n+1 (121 fotogramas para el caso nominal de cinco segundos); otros recuentos pueden no ser validos.
- El soporte de FP8 es un experimento de computo acotado y no un modo de cuantizacion oficial; TorchAO/Diffusers gestiona las matematicas de cuantizacion.
- No hay resultados de benchmarks publicados, ni datos de sesgos, ni evaluacion de calidad reportada por terceros; el repositorio registra 0 descargas y 0 likes en la informacion disponible.
- No se declaran idiomas soportados, lo que impide planificar despliegues multilingues con garantias.
- La licencia Apache 2.0 cubre este repositorio de codigo; la licencia del checkpoint base y de sus pesos debe comprobarse por separado antes de un uso comercial.
- La fecha de creacion y ultima actualizacion registradas son del 10 de octubre de 2026 y no hay historial de mantenimiento posterior en los datos disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/elismasilva/ltx2.3_video_custom_blocks
- Modelo base declarado: https://huggingface.co/OzzyGT/LTX-2.3-Distilled-1.1
- Documentacion de Modular Diffusers citada en la model card: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/overview
- Papers, blogs, repositorios adicionales o demos: no disponibles en la informacion proporcionada.
