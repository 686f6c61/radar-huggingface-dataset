# ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED

## Resumen

10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED es un transformer de difusion para generacion de video (text-to-video, image-to-video e image-text-to-video) publicado por el usuario ibyteohdear en Hugging Face. No es un modelo entrenado desde cero: se trata de una conversion de layout del checkpoint `10Eros_Max_h3_8stepTURBO_beta7.safetensors` (publicado por TenStrip), que a su vez es un finetune "poda AdaLN" sobre MiniMax-H3 de MiniMaxAI. La conversion no implica entrenamiento, fusion, requantizacion ni repoda: solo un remapeo de claves para que los pesos funcionen con la clase `MiniMaxH3PrunedTransformer3DModel` de la libreria diffusers.

El valor del modelo esta en que ofrece el checkpoint pruned de 40,2 GB en un formato compatible con diffusers (safetensors separados por componente), manteniendo compatibilidad con LoRAs entrenados contra el proyecto AdaLN de 2688 de ancho. El sufijo "8-step TURBO" indica que el checkpoint esta pensado para muestreo destilado en 8 pasos, con Euler/Simple o er_sde/SGM_uniform como configuraciones de referencia. Dado el tag `not-for-all-audiences` y el nombre, el contenido generado por este finetune esta claramente orientado a publico adulto, lo que condiciona su uso y su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D con AdaLN podado (rank 8), clase `MiniMaxH3PrunedTransformer3DModel` |
| Parametros totales | 20.111.462.920 (~20,1 mil millones, segun safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint es BF16 nativo con tabla AdaLN en F32; el ejemplo de la model card muestra cuantizacion opcional Int8 weight-only via torchao) |
| Idiomas soportados | no disponible (el codificador de texto proviene del pipeline MiniMax-H3) |
| Licencia | minimax-h3-community-license-agreement (más terminos LTX 2.3 / Wan 2.2 / Krea 2 por el "graft" de personaje del origen) |
| Formato de pesos | safetensors (repo de 40,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion para video basado en MiniMax-H3, al que se le ha aplicado una poda AdaLN de rank 8: las proyecciones AdaLN se pliegan en proyecciones de 8 canales y se acompanan de una tabla de curvas (`adaln_t_table`) que indexa los parametros de acondicionamiento temporal. El resultado es un checkpoint "pruned" sensiblemente mas ligero que el modelo base completo. La conversión a formato diffusers realizo las siguientes transformaciones tecnicas: separacion del `qkv_proj` concatenado en `attn.to_q`/`to_k`/`to_v`, reordenacion del MLP nativo `[gate; value]` al layout `[value; gate]` de diffusers, conversion de los terminos constantes AdaLN a `folded_bias` en float32, upcast de la tabla temporal a F32 y eliminacion de `rope.inv_freq` (se reconstruye en `__init__`). Los tensores `adaln_basis` y `adaln_mean` se copiaron de `multimodalart/MiniMax-H3-Pruned` sin reajustar, porque la base solo esta definida salvo signo y rotacion; reajustarla romperia la compatibilidad con LoRAs. La conversion se verifico con los 637 tensores del state-dict coincidiendo en nombre y forma.

Sobre el entrenamiento del checkpoint original (TenStrip/10Eros-Max) no hay datos publicados: se desconoce el numero de pasos, el dataset, si hubo destilacion formal de pasos o si el modo "8-step TURBO" procede de una destilacion tipo LCM/Turbo/DMD. El modelo base MiniMax-H3 funciona como pipeline image-text-to-video con codificador de texto (el ejemplo usa Qwen3-VL como condicionamiento), un VAE de video (`AutoencoderKLMiniMaxH3`) y un VAE de audio (`AutoencoderKLMiniMaxH3Audio`), lo que sugiere soporte de video con audio en la familia base.

## Capacidades

- Generacion de video desde texto (text-to-video) y desde imagen mas texto (image-text-to-video), mediante el pipeline de diffusers de MiniMax-H3.
- Muestreo acelerado en 8 pasos con configuraciones de referencia Euler/Simple o er_sde/SGM_uniform.
- Compatibilidad con LoRAs entrenados contra el proyecto AdaLN de 2688 de ancho del checkpoint pruned, gracias a la copia fiel de la base AdaLN.
- Carga directa con `AutoModel.from_pretrained(..., trust_remote_code=True)` en diffusers (requiere codigo custom del repo).
- Cuantizacion opcional weight-only Int8 via torchao (según el codigo de ejemplo de la model card).
- Condicionamiento mediante codificador de texto y VAEs del pipeline MiniMax-H3; el ejemplo integra ClipProj (proyeccion de embeddings CLIP, `NicoLab28/ClipProj-MiniMax-H3`) y Qwen3-VL como procesador de condiciones.
- Generacion de contenido para adultos (tag `not-for-all-audiences`); no es un modelo de uso general.

No hay informacion sobre tool calling, agentes, razonamiento ni capacidades multilingues: no aplica, al tratarse de un modelo generativo de video.

## Casos de uso

- Generacion de video para publico adulto: el finetune esta orientado a contenido not-safe-for-work; es adecuado unicamente en entornos donde ese material es legal y permitido por la licencia.
- Produccion de video con pocos pasos de inferencia: el modo 8-step TURBO reduce el coste de muestreo a 8 evaluaciones del transformer, util para iteracion rapida de prompts.
- Integracion en pipelines de diffusers: al estar convertido al formato nativo de diffusers, puede insertarse en flujos de trabajo existentes de MiniMax-H3 sin conversiones manuales.
- Uso con LoRAs de la comunidad: la preservacion de la base AdaLN permite aplicar LoRAs entrenados sobre el checkpoint pruned original sin reentrenar.
- Despliegue en Spaces con GPU bajo demanda: la model card incluye codigo preparado para Hugging Face Spaces con `spaces.GPU` (ZeroGPU), con duracion de sesion de 1500 segundos.
- Experimentacion con cuantizacion: el codigo de ejemplo muestra como cuantizar los pesos a Int8 weight-only con torchao para reducir VRAM.
- Animacion de imagenes (image-to-video): el pipeline image-text-to-video permite partir de una imagen de referencia y animarla segun un prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo generativo de video, las metricas habituales (MMLU, HumanEval, GSM8K) no son aplicables; tampoco se han publicado metricas de calidad de video (FVD, VBench) ni tiempos de muestreo medidos.

## Requisitos de hardware

- VRAM para el transformer en BF16: ~20,1 mil millones de parametros implican aproximadamente 40 GB solo de pesos, lo que exige una GPU de 48 GB (A6000, L40S, A100 40 GB quedaria justa o insuficiente segun componentes adicionales) o cuantizacion.
- Con cuantizacion Int8 weight-only (torchao, segun el ejemplo de la model card), la VRAM para el transformer baja a aproximadamente 20 GB, lo que lo hace viable en una RTX 4090 (24 GB) si el codificador de texto y los VAEs se gestionan con offload a CPU.
- Componentes adicionales: codificador de texto (Qwen3-VL en el ejemplo), VAE de video y VAE de audio de MiniMax-H3, que anaden VRAM o requieren `cpu_offload` / `enable_sequential_cpu_offload`.
- GPUs recomendadas: A100/H100 80 GB para BF16 sin compromisos; RTX 4090 o A6000 con cuantizacion y offload.
- Despliegue: diffusers (via `AutoModel` con `trust_remote_code=True`, usando la version de diffusers incluida en el propio repo), Hugging Face Spaces con ZeroGPU (codigo incluido en la model card). No hay evidencia de soporte directo en llama.cpp, Ollama, vLLM o TGI, ya que es un modelo de difusion, no un LLM.
- Latencia: no disponible; el muestreo en 8 pasos sugiere tiempos de generacion notablemente inferiores a los pipelines de 30-50 pasos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer 8stepTURBO beta7 (este) | ~20,1 B (poda AdaLN rank 8) | no disponible | text/image-to-video, 8 pasos | minimax-h3-community + terminos de graft | safetensors en HF, diffusers custom |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | image-text-to-video con audio | minimax-h3-community-license-agreement | pipeline diffusers oficial |
| multimodalart/MiniMax-H3-Pruned | no disponible (mismo esquema de poda AdaLN) | no disponible | image-text-to-video | no disponible | safetensors (fuente de la base AdaLN) |
| Wan 2.2 (Ali) | no disponible | no disponible | text/image-to-video | licencia propia (terminos heredados por el graft) | open weights en HF |

La comparativa se limita a la familia MiniMax-H3 y los modelos cuyos terminos hereda el checkpoint; no hay datos numericos publicados que permitan comparar rendimiento.

## Limitaciones y advertencias

- Contenido para adultos: el tag `not-for-all-audiences` y la naturaleza del finetune implican que puede generar material sexual explicito. Su uso esta restringido por ley en muchas jurisdicciones y por las politicas de las plataformas de despliegue.
- Licencia compuesta: ademas del acuerdo comunitario de MiniMax-H3, hereda terminos de LTX 2.3, Wan 2.2 y Krea 2 por el "graft" de personaje. Cualquier uso comercial requiere revisar los tres conjuntos de terminos.
- Requiere `trust_remote_code=True` y una version concreta de diffusers distribuida en el propio repo, lo que supone un riesgo de suministro de codigo custom y puede romperse con actualizaciones de diffusers.
- Es solo el componente transformer: para generar video se necesitan el codificador de texto y los VAEs del pipeline MiniMax-H3, mas componentes auxiliares (ClipProj, Qwen3-VL) segun el ejemplo.
- Sin documentacion de entrenamiento: no se conocen datos, pasos ni metodo de destilacion del checkpoint original, por lo que el comportamiento fuera de los samplers de referencia (Euler/Simple, er_sde/SGM_uniform) es impredecible.
- Riesgo de alucinacion visual y artefactos tipico de modelos de difusion de video; no hay evaluaciones ni benchmarks publicados que cuantifiquen la calidad.
- La compatibilidad con LoRAs depende de que la base AdaLN no se haya reajustado; cualquier modificacion futura del checkpoint podria romperla.
- Popularidad muy baja (79 descargas y 1 like en el momento de la ficha), sin comunidad de soporte ni pruebas de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED
- Checkpoint original (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Base AdaLN de referencia: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Proyeccion ClipProj usada en el ejemplo: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
