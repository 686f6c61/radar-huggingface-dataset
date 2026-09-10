# INCModel3/Z-Image-Turbo-MXFP4-RTN-AutoRound

## Resumen

Z-Image-Turbo-MXFP4-RTN-AutoRound es una version cuantizada a 4 bits del modelo de generacion de imagenes Tongyi-MAI/Z-Image-Turbo, un transformer de difusion (S3-DiT) destilado de 6.000 millones de parametros. La cuantizacion la ha producido el usuario INCModel3 con AutoRound en modo RTN (round-to-nearest, sin iteraciones de calibracion) y esquema MXFP4, un formato de micro-scaling de 4 bits con grupo de 32 que reduce el peso del repositorio de unos 31 GB en bf16 a aproximadamente 11 GB.

El problema que resuelve es el coste de VRAM y de ancho de banda de memoria al servir un modelo de difusion de 6B en produccion: al pasar pesos y activaciones a 4 bits, el modelo puede desplegarse en GPUs mucho mas modestas manteniendo, segun la model card, una calidad practicamente indistinguible del original (GenEval 0.741 frente a 0.757, CLIP 31.66 frente a 31.73).

Es relevante porque combina tres piezas que empiezan a converger en el ecosistema open source: cuantizacion de 4 bits con micro-scaling (MXFP4, soportado de forma nativa por hardware Blackwell), generacion de imagenes en 8 pasos de inferencia por tratarse de un modelo destilado, y un formato de exportacion (auto_round) compatible con vllm-omni. El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion S3-DiT (modelo base Tongyi-MAI/Z-Image-Turbo); detalles internos no disponibles |
| Parametros totales | 6B (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible (modelo text-to-image, no generativo de texto) |
| Tipos de cuantizacion | MXFP4 (W4A4, group_size=32), exportado por AutoRound con RTN (iters=0); el modelo base esta en bf16 |
| Idiomas soportados | no disponible (la model card no especifica idiomas de los prompts) |
| Licencia | other; el autor remite a la licencia del modelo original Tongyi-MAI/Z-Image-Turbo |
| Formato de pesos | safetensors, formato de exportacion auto_round (compatible con vllm-omni); pipeline diffusers:ZImagePipeline |
| Tamano del repositorio | 11,7 GB (frente a ~31 GB en bf16) |
| Capas excluidas de la cuantizacion | adaLN_modulation, mantenida en precision completa |
| Datos de calibracion | coco2014, 8 pasos, guidance 0.0 |
| Pipeline | text-to-image |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo base es un S3-DiT (transformer de difusion) de 6B parametros, destilado para generar imagenes en pocos pasos de inferencia; la model card no detalla la composicion del dataset de entrenamiento, el numero de tokens multimodales vistos ni si se aplicaron etapas de RLHF o DPO. Lo unico confirmado es que se trata de un modelo destilado y que la evaluacion se realiza con 8 pasos de inferencia y guidance 0.0, lo que es coherente con un modelo turbo/destilado que no requiere classifier-free guidance.

La innovacion tecnica de este repositorio no esta en la arquitectura, que se hereda intacta, sino en el proceso de cuantizacion. Se aplica el esquema MXFP4 (microscaling FP4 de 4 bits para pesos y activaciones, W4A4) con un tamano de grupo de 32, usando la herramienta AutoRound de Intel en su variante RTN, es decir, redondeo al mas cercano sin optimizacion iterativa de los parametros de escala. El calibrado se hizo con imagenes de coco2014 durante 8 pasos con guidance 0.0. La capa adaLN_modulation se dejo en precision completa, presumiblemente porque su cuantizacion degrada de forma desproporcionada la modulacion de las senales de condicionamiento temporal en el transformer de difusion. El resultado es un checkpoint mixto que exige kernels capaces de manejar simultaneamente MXFP4 y precision completa.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), con resolucion de al menos 1024x1024 segun la configuracion de evaluacion.
- Inferencia en 8 pasos con guidance_scale=0.0, propia de un modelo destilado de tipo turbo.
- Control de semilla (seed) para reproducibilidad de las generaciones.
- Parametro num_outputs_per_prompt disponible en la API de ejemplo, lo que permite generar varias imagenes por prompt.
- Exportacion en formato auto_round compatible con vllm-omni, lo que habilita su uso en un servidor de inferencia con batching.
- Integracion declarada con el pipeline ZImagePipeline de diffusers segun los tags del repositorio.
- No se documentan capacidades de edicion de imagen, inpainting, imagen a imagen, vision, audio, tool calling ni razonamiento multi-paso; no disponible.

## Casos de uso

- Servicio de generacion de imagenes con restriccion de VRAM: al ocupar aproximadamente 11 GB en disco y reducir el peso de pesos y activaciones, permite servir un modelo de difusion de 6B en GPUs de 16-24 GB que no podrian alojar la version bf16 de 31 GB.
- Prototipado rapido de productos text-to-image: los 8 pasos de inferencia y la ausencia de classifier-free guidance reducen el coste por imagen, lo que resulta adecuado para iterar sobre prompts y validar conceptos antes de comprometerse con un modelo mayor.
- Backend de API para aplicaciones creativas: el formato de exportacion auto_round y la compatibilidad con vllm-omni permiten montar un endpoint HTTP con batching dinamico y sampling_params por peticion (altura, anchura, semilla, pasos, numero de salidas).
- Generacion de assets para marketing y comercio electronico: produccion de imagenes cuadradas de 1024x1024 para catalogos, banners o redes sociales, con semilla fija para mantener consistencia entre variantes.
- Ilustracion conceptual y moodboards para equipos de diseno: generacion rapida de bocetos a partir de descripciones textuales en fases tempranas de un proyecto, donde la fidelidad absoluta importa menos que la velocidad.
- Despliegue on-premise en entornos con requisitos de privacidad: al poder ejecutarse localmente en una unica GPU consumer, evita enviar prompts o imagenes de referencia a servicios en la nube.
- Investigacion en cuantizacion de modelos de difusion: sirve como referencia reproducible para comparar MXFP4 frente a bf16 con las mismas condiciones (8 pasos, guidance 0.0, 1024x1024, seed 42) y metricas publicadas (GenEval, DrawBench CLIP, CLIP-IQA, ImageReward).
- Pipeline automatizado de cuantizacion y evaluacion: la model card indica que el artefacto se genero con autoquant-agent, un flujo de agente que cuantiza, evalua y se auto-repara, reutilizable para cuantizar otros checkpoints de difusion.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con el harness de difusion de vllm-omni (8 pasos, guidance 0.0, 1024x1024, seed 42):

| Benchmark | Base bf16 | MXFP4 cuantizado | Variacion |
|---|---|---|---|
| DrawBench CLIP | 31,73 | 31,66 | -0,07 |
| DrawBench CLIP-IQA | 70,57 | 68,52 | -2,05 |
| DrawBench ImageReward | 1,00 | 0,91 | -0,09 |
| GenEval | 0,757 | 0,741 | -0,016 |

El autor califica la perdida como practicamente nula en CLIP y GenEval, y algo mayor en CLIP-IQA e ImageReward. No hay datos publicados de latencia, throughput ni consumo de VRAM en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 11 GB (11,7 GB de repositorio), frente a unos 31 GB en bf16.
- VRAM estimada para inferencia a 1024x1024: del orden de 12-16 GB sumando pesos, activaciones, latentes y el decodificador VAE; cifra estimada, no publicada por el autor.
- GPU recomendadas: serie Blackwell (B100/B200/RTX 50) por soporte nativo de MXFP4; en generaciones anteriores el formato puede requerir emulacion o conversion y perder parte de la ventaja de rendimiento.
- Cabe en GPU consumer: si, previsiblemente en RTX 4090/4080 (24 y 16 GB) y en tarjetas de 16 GB o mas; en tarjetas de 12 GB el margen es muy ajustado y no esta confirmado.
- Opciones de despliegue: vllm-omni (metodo documentado en la model card) y pipeline ZImagePipeline de diffusers segun los tags; no se documenta soporte de llama.cpp, Ollama, TGI ni ComfyUI para este checkpoint.
- Latencia y throughput: no disponibles. La configuracion de referencia usa 8 pasos de inferencia y guidance 0.0, por lo que el coste por imagen es bajo en comparacion con modelos que requieren 20-50 pasos.
- Nota: la capa adaLN_modulation se mantiene en precision completa, lo que implica un checkpoint de precision mixta y kernels que soporten ambos tipos.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento publico general y no de la informacion proporcionada en esta busqueda; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros | Tipo | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-MXFP4-RTN-AutoRound (este modelo) | 6B, ~11 GB cuantizado | S3-DiT destilado, MXFP4 W4A4 | no disponible | other (hereda la del modelo base) | HuggingFace, 0 descargas |
| Tongyi-MAI/Z-Image-Turbo (base bf16) | 6B, ~31 GB | S3-DiT destilado | no disponible | other | HuggingFace |
| FLUX.1-schnell | ~12B | DiT destilado | no disponible | Apache-2.0 | HuggingFace |
| SDXL-Turbo | ~3,5B | UNet destilado | no disponible | CreativeML Open RAIL++-M | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estos modelos medidos bajo el mismo harness, por lo que la comparacion de rendimiento se limita a los datos de la tabla anterior frente al baseline bf16 del propio modelo.

## Limitaciones y advertencias

- Artefacto sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, con lo que los resultados de la model card no han sido reproducidos por terceros.
- Licencia "other": el autor remite explicitamente a la licencia de Tongyi-MAI/Z-Image-Turbo. Es imprescindible revisar esa licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en este repositorio.
- Degradacion medible en algunas metricas: ImageReward baja de 1,00 a 0,91 y CLIP-IQA de 70,57 a 68,52, lo que sugiere una perdida de calidad perceptual subjetiva mayor que la que reflejan GenEval y CLIP.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos inexistentes, texto ilegible o composiciones incoherentes con el prompt, especialmente en escenas con muchas entidades o conteo de objetos.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre analisis de sesgos del modelo base; los sesgos de generacion de imagenes (representacion demografica, estereotipos) no estan evaluados en la informacion disponible.
- Idiomas: no se especifica que idiomas de prompt soporta; la calibracion se hizo con coco2014, un dataset predominantemente en ingles, lo que sugiere un mejor comportamiento con prompts en ingles.
- Dependencia de hardware: MXFP4 es un formato de micro-scaling con soporte nativo en GPUs Blackwell; en hardware anterior el rendimiento o incluso la compatibilidad pueden verse comprometidos.
- Checkpoint de precision mixta: la capa adaLN_modulation en precision completa obliga a soportar dos tipos numericos en el mismo grafo, lo que reduce el numero de runtimes compatibles.
- Restriccion de resolucion: la evaluacion se realizo a 1024x1024; no se documenta el comportamiento a otras resoluciones o relaciones de aspecto.
- Repositorio en formato de exportacion auto_round: aunque los tags incluyen diffusers, el metodo de uso documentado es vllm-omni, por lo que la integracion directa con otros frameworks no esta garantizada.
- Sin informacion sobre limite de contexto, no aplica a un modelo text-to-image, pero si implica que no hay datos sobre la longitud maxima de prompt admitida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Z-Image-Turbo-MXFP4-RTN-AutoRound
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- AutoRound (Intel): https://github.com/intel/auto-round
- autoquant-agent: la model card enlaza unicamente a https://github.com/ sin ruta especifica; enlace concreto no disponible
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
