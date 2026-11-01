# AI-KSK/h3-hero-shot-qwen21-composite-314

## Resumen

`AI-KSK/h3-hero-shot-qwen21-composite-314` no es un modelo de pesos en el sentido habitual, sino un repositorio de flujos de trabajo (workflows) para ComfyUI que orquestan dos pipelines de generación de imagen y vídeo: Qwen-Image 2.1 para la preparación y armonización de un still de producto, y MiniMax H3 para animarlo como «hero shot» audiovisual a partir del primer fotograma. El autor, AI-KSK, publica dos exportaciones JSON independientes que suman 72 nodos y 108 enlaces, con un traspaso manual entre ambas: no existe un encadenamiento automático entre ficheros.

El repositorio tiene un tamaño de 0.0 GB y no incluye pesos ni medios de entrada; los ficheros `.safetensors` que aparecen en la documentación (base BF16/INT8 de Qwen-Image 2.1, LoRAs C2 y Viggle, VAE, upscaler, y los cinco artefactos de MiniMax H3) son referencias a assets externos que el usuario debe resolver por su cuenta. Por tanto, la ficha describe la composición de workflows y las dependencias declaradas, no un checkpoint entrenado por AI-KSK.

La relevancia es acotada: se trata de material de referencia para quienes ya trabajan con ComfyUI y quieran reproducir una ruta de composición de producto a vídeo, pero la propia model card advierte que no se incluye inferencia nueva, validación visual o de audio, benchmark, medición de memoria, certificación de versiones de nodos ni verificación de licencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI; los pipelines subyacentes son Qwen-Image 2.1 y MiniMax H3) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | referenciados en los assets: BF16, INT8 (`int8_convrot`), NVFP4 AWQ (`qwen3vl_32b_minimax_h3_nvfp4_awq`), FP16/FP32 para VAEs |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor no declara licencia global; indica que los derechos de código, nodos, modelos, LoRAs, artwork, imágenes, portadas y audio deben verificarse por separado) |
| Formato de pesos | no se incluyen pesos; los workflows son JSON de ComfyUI y los assets referenciados son `.safetensors` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino dos grafos de ComfyUI. El workflow 01 (MiniMax H3) consta de 40 nodos y 68 enlaces: carga un still autorizado en el nodo `Image77`, que alimenta `first_frame` en los nodos LOW87 y HIGH19, y solicita un vídeo de cinco segundos al planificador `planner34`. La configuración `Format37=true` selecciona 672×896 pese a etiquetas obsoletas de 9:16 y 960/544; el `scale_by2` configurado apunta a una dirección de 1344×1792, no a una salida verificada ni a un lienzo fijo de 1080P. Los assets declarados son `minimax_h3_fl_ref_hybrid_scheme_a_25-49_bf16.safetensors`, `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, `minimax_h3_video_vae_fp16.safetensors`, `minimax_h3_audio_vae_fp32.safetensors` y `minimax_h3_latent_upscaler_3d_fp16.safetensors`. Los compositores H3 referencian `OpenVDN/vdn-minimax-h3` con `stage_dmd_8nfe`; el autor aclara que «composer8+refine4» es intención de plan, no NFE medido, y que `AudioAudit` no es una comprobación superada.

El workflow 02 (Qwen-Image 2.1) consta de 32 nodos y 40 enlaces. `LoadImage1210` pasa por un upscale `UltraSharp` (nodo 895) y un resize a unos 4 MP (nodo 896) antes del encoder `494` en `image1`; la cadena de lienzo heredada está desviada y termina en el preview `668`. Se configuran dos rutas: la estándar, con base nombrada BF16 `609` → LoRA C2 `613` → sampler `618` → decode `490`; y la alternativa, con base nombrada INT8 `1200` → LoRA C2 `1201` → sampler `1202`, seguida de una rama LoRA Viggle y el sampler `1205` que toma el latente de `1202`. `FluxGuidance1204` almacena 6 para la segunda ruta de condicionamiento positivo, no para el CFG del sampler. Los assets son `qwen_image_2.1_bf16.safetensors`, `qwen_image_2.1_int8_convrot.safetensors`, `qwen3vl_8b_int8_convrot.safetensors`, `qwen_image_2.1_vae_bf16.safetensors`, `Qwenimag21_c2-st2000.safetensors`, `Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-lora-r256.safetensors` y `4x-UltraSharpV2.safetensors`.

No se documenta entrenamiento, dataset, RLHF ni DPO por parte del autor del repositorio.

## Capacidades

- Generación de imagen de producto: armonización de una composición preparada sobre fondo mediante Qwen-Image 2.1, con ruta BF16 de 40 pasos y ruta alternativa etiquetada por el autor como 20+6.
- Aplicación de LoRAs: LoRA C2 (`Qwenimag21_c2-st2000`) en ambas rutas y LoRA Viggle turbo de 6 pasos (r256) en la ruta alternativa.
- Upscaling: `4x-UltraSharpV2` más un resize a aproximadamente 4 MP antes del encoder.
- Generación de vídeo a partir de primer fotograma: MiniMax H3 anima un still aceptado en una petición de cinco segundos, con rutas LOW/HIGH y compositores VDN.
- Generación de audio asociada al vídeo: los assets incluyen `minimax_h3_audio_vae_fp32` y el guardado recibe audio generado, no la banda sonora de origen (que está desviada).
- Upscaling latente 3D: `minimax_h3_latent_upscaler_3d_fp16`.
- Comparación visual de salidas: el nodo `Comparer630` recibe las dos salidas decodificadas de las rutas Qwen, no la imagen original.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; el repositorio no es un LLM.

## Casos de uso

- Armonización de fotografía de producto: cargar una composición autorizada y ejecutar la ruta BF16 de 40 pasos con LoRA C2 para integrar el producto en el fondo, revisando etiquetas, geometría del envase, materiales y sombras antes de aceptar el still.
- Exploración rápida de variantes: usar la ruta alternativa INT8 con LoRA C2 y rama Viggle turbo para obtener una segunda propuesta con menos pasos declarados, teniendo en cuenta que el autor advierte que no es una comparación solo de pasos (difieren base, LoRA, guidance y sampler).
- Preparación de material para vídeo: exportar el still aceptado y cargarlo manualmente en el nodo `Image77` del workflow H3 para animarlo, ya que el traspaso entre ficheros no es automático.
- Generación de clips cortos de escaparate: solicitar cinco segundos de vídeo con audio generado a partir del primer fotograma, verificando después dimensiones reales, duración, sonido y movimiento.
- Comparación de rutas de inferencia: usar el nodo comparador para contrastar las dos salidas Qwen decodificadas y decidir qué configuración conservar.
- Reproducción de un pipeline de referencia: servir como plantilla documentada para equipos que ya operan ComfyUI y quieran reconstruir una ruta composición→hero shot con MiniMax H3 y Qwen-Image 2.1.
- Auditoría de grafos: inspeccionar los JSON para identificar nodos desviados, etiquetas obsoletas y puertos de referencia antes de habilitar entradas opcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no incluye inferencia nueva, aceptación visual o de audio, benchmark, medición de memoria ni certificación de versiones de nodos.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica mediciones de memoria.
- GPU recomendadas: no disponible. Los assets referenciados incluyen una variante NVFP4 AWQ de un modelo Qwen3-VL de 32B, lo que sugiere el uso de GPUs con soporte para formatos de baja precisión, pero no se confirma ningún modelo concreto.
- Compatibilidad con GPU de consumo: no verificada. La presencia de rutas INT8 y de una LoRA turbo de 6 pasos apunta a intentos de reducir requisitos, pero no hay datos que lo confirmen.
- Opciones de despliegue: ComfyUI es el entorno de ejecución de los workflows; los compositores H3 requieren resolver `OpenVDN/vdn-minimax-h3` con `stage_dmd_8nfe` y los nodos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con pesos propios y la información proporcionada no incluye comparaciones con otros workflows o pipelines equivalentes.

## Limitaciones y advertencias

- No es un modelo: es un repositorio de workflows sin pesos ni medios de entrada; los `.safetensors` citados son referencias externas, no pruebas de implementación interna ni de compatibilidad.
- Traspaso manual: no existe encadenamiento automático entre el workflow Qwen y el de H3; hay que cargar el still a mano en el nodo `Image77`.
- Etiquetas y títulos obsoletos: `Format37=true` selecciona 672×896 pese a etiquetas de 9:16 y 960/544; los prefijos de guardado y los campos de destino no determinan el tamaño efectivo.
- La ruta «40 pasos» de Qwen incluye la LoRA C2 y no es una línea base de modelo desnudo; la ruta alternativa se etiqueta «20+6», no seis pasos de extremo a extremo, y usa arrays guardados de 26 y límite 20.
- `AudioAudit` no es una comprobación superada y el audio que se recorta y guarda es generado, no la banda sonora de origen desviada.
- Entradas opcionales desviadas: la referencia adicional del workflow H3 está mapeada a puertos LOW/HIGH con numeración distinta; hay que revisar la interfaz antes de habilitarla.
- Salidas no verificadas: hay dos savers por ruta Qwen y los ficheros reales no están confirmados; las portadas son assets promocionales seleccionados, no muestras generadas verificadas.
- Sin licencia declarada: el autor no afirma una licencia comercial global y exige verificar por separado derechos de código de workflow, nodos, modelos, LoRAs, artwork de producto, imágenes de origen, portadas y audio.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; la fidelidad de la preservación del producto no está demostrada por peticiones ni por previews históricos.
- El tutorial enlazado no está verificado en vivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/h3-hero-shot-qwen21-composite-314
- Tutorial del autor (no verificado en vivo): https://www.youtube.com/watch?v=K6HI-iuMXeg
- Entrada 01 Hero Shot en RunningHub internacional: https://www.runninghub.ai/zh-cn/post/2107778471853326337?inviteCode=rh-v1111
- Entrada 01 Hero Shot en RunningHub China: https://www.runninghub.cn/post/2107777467430817794/?inviteCode=rh-v1111
- Entrada 01 Hero Shot en Civitai (v2): https://civitai.com/models/2990032
- Referencia de compositores H3: `OpenVDN/vdn-minimax-h3` (con `stage_dmd_8nfe`), citada en la model card sin URL directa
