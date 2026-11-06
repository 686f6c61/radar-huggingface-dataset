# AI-KSK/krea2-identity-edit-three-modes-282

## Resumen

Este repositorio, publicado por el usuario AI-KSK bajo el identificador `AI-KSK/krea2-identity-edit-three-modes-282`, no contiene un modelo de IA propiamente dicho, sino un paquete de tres grafos de ComfyUI exportados desde un mismo episodio (el 282) y construidos sobre un LoRA común denominado Krea 2 Identity Edit v1.2. Los tres flujos comparten el mismo modelo base y el mismo LoRA, y se diferencian únicamente en cómo se introduce la imagen de referencia y en cómo se restringe la edición: un editor de imagen única, un editor de imagen única con máscara y un editor con dos imágenes de referencia.

El paquete incluye los ficheros JSON de los flujos, tres imágenes promocionales de portada y un manifiesto SHA256. El autor indica de forma explícita que no se ha ejecutado ninguna inferencia para este paquete: no hay render, ni mediciones de tiempo, ni cifras de VRAM, ni comparación de calidad visual. Tampoco se incluyen los pesos del modelo base, los ficheros LoRA ni los medios de entrada, por lo que el repositorio tiene un tamaño de 0.0 GB.

La relevancia de esta publicación es, por tanto, la de un artefacto de configuración reproducible para el ecosistema ComfyUI en tareas de edición de identidad sobre imágenes, no la de un modelo entrenado con pesos publicados. Cualquier evaluación de capacidades o rendimiento debe remitirse al modelo base Krea 2 y al LoRA referenciados, cuyos detalles no se documentan en esta model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene flujos de ComfyUI, no pesos) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp8 scaled (modelo base y text encoder), fp16 (LoRA), fp32 (VAE), según las dependencias declaradas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no se incluyen pesos; los flujos son JSON de ComfyUI y las dependencias referenciadas son `.safetensors` |

Dependencias declaradas en los flujos:

| Componente | Fichero referenciado |
|---|---|
| Cargador del modelo base | `krea2_turbo_fp8_scaled.safetensors` (alternativa citada: `krea2_raw_bf16`, 40 pasos, CFG 3–4) |
| LoRA | `krea2_identity_edit_v1_2_fp16.safetensors`, fuerza 1 en los tres flujos |
| Text encoder | `qwen3vl_4b_fp8_scaled.safetensors`, tipo `krea2` |
| VAE | `qwen_image_HDR_vae_fp32_comfy.safetensors` |
| Nodos personalizados | `Krea2EditGroundedEncode`, `Krea2EditModelPatch`, más `KSampler`, `LoadImage`, `GrowMask` y `SaveImage` estándar |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni sobre entrenamiento en la documentación proporcionada. El repositorio no incluye pesos ni describe el proceso de entrenamiento del modelo base Krea 2 ni del LoRA Krea 2 Identity Edit v1.2. Lo único documentado son los hiperparámetros de muestreo de los flujos: KSampler a 10 pasos, CFG 1, sampler `euler`, scheduler `simple` y denoise 1 en los tres casos, con un parche de fidelidad (`Krea2EditModelPatch`) que expone un parámetro `ref_boost` y un modo de una o dos imágenes.

El mecanismo técnico central que sí queda descrito es el llamado "dial de fidelidad": según las notas del nodo, un valor de 1.0 reproduce el comportamiento de la versión v1.1 anterior, 4.0 es el ajuste recomendado y valores muy altos copian en exceso la referencia y rompen las operaciones de eliminación. Los flujos usan ref_boost 4 en el editor de imagen única y ref_boost 3 en el editor con máscara y en el de dos imágenes. El nodo `Krea2EditGroundedEncode` actúa como codificador de la instrucción; en el flujo con máscara se fija un tamaño de codificación de 768. No se documenta ninguna innovación adicional en cuanto a atención, decodificación especulativa o composición del dataset.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural sobre una imagen de entrada, preservando de forma explícita rasgos como rostro, peinado, maquillaje, pose, iluminación y fondo.
- Edición localizada mediante máscara: el flujo 02 aplica un `GrowMask` con expansión 6 y taper activado antes de condicionar la edición, lo que permite limitar el cambio a una región concreta.
- Transferencia de identidad y de vestuario entre dos imágenes: el flujo 03 usa una imagen A como escena y una imagen B como referencia, con un modo de dos imágenes en el parche de fidelidad.
- Control de fidelidad ajustable mediante `ref_boost`, con un compromiso documentado entre copia de la referencia y capacidad de eliminar elementos.
- Composición de instrucciones con listas explícitas de elementos a preservar, tal como muestra el ejemplo del flujo 02 (gafas de sol de ojo de gato, manteniendo rostro, peinado, accesorio floral, maquillaje, ropa, fondo e iluminación).
- Compatibilidad con el ecosistema ComfyUI mediante nodos personalizados y nodos estándar (`KSampler`, `LoadImage`, `GrowMask`, `SaveImage`, `PreviewImage`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo de pensamiento.

## Casos de uso

- Edición de producto con preservación de modelo: el flujo 01 está configurado para rediseñar parte de un producto como un tubo de clean-beauty manteniendo la cara exacta, la sonrisa, la pose y la iluminación de la modelo; es adecuado para retoque comercial donde la identidad no puede alterarse.
- Retoque localizado de accesorios: el flujo 02 permite añadir elementos como gafas de sol limitando el cambio a una máscara crecida 6 píxeles, lo que resulta útil en catálogos de moda donde solo debe cambiar un accesorio.
- Prueba virtual de vestuario: el flujo 03 transfiere un conjunto deportivo completo desde una imagen de referencia a una persona en una escena dada, conservando identidad facial y peinado; aplicable a previsualización de colecciones sin sesión de fotos.
- Preservación de fondo en edición de retrato: las instrucciones de ejemplo enumeran explícitamente fondo e iluminación como elementos a conservar, lo que encaja en flujos de postproducción donde el entorno está fijado por contrato.
- Reutilización de configuraciones en producción: al ser grafos JSON con manifiesto SHA256, los flujos sirven como plantillas versionadas para estandarizar un pipeline de edición de identidad entre distintos operadores.
- Evaluación comparativa de modos de condicionamiento: los tres flujos permiten comparar, sobre el mismo modelo base y el mismo LoRA, el efecto de una imagen frente a dos y del enmascarado, útil en laboratorios internos que calibran `ref_boost`.
- Integración en entornos ComfyUI existentes: los flujos se pueden cargar directamente en instalaciones con los nodos personalizados requeridos y ejecutar en servicios como RunningHub, cuyos enlaces se listan en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se ejecutó inferencia para este paquete y que no hay render, tiempos, cifras de VRAM ni comparación de calidad visual.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica ninguna cifra de VRAM para estos flujos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no se aportan datos que permitan determinarlo.
- Opciones de despliegue: ComfyUI con los nodos personalizados `Krea2EditGroundedEncode` y `Krea2EditModelPatch`; también se referencian los servicios alojados RunningHub (dominio internacional y dominio de China) como puntos de entrada publicados por el autor.
- Latencia y throughput: no disponibles.
- Nota operativa: las referencias a dependencias no prueban versiones instaladas, hashes, licencias ni soporte de hardware; el autor recomienda resolverlas en el entorno propio antes de encolar trabajos.

## Comparativa con modelos similares

No disponible. La documentación proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa fundamentada. El propio paquete no contiene pesos, de modo que no es equiparable en términos de parámetros, contexto o licencia a un modelo publicado de forma convencional.

## Limitaciones y advertencias

- El repositorio no contiene pesos, LoRA ni medios de entrada; es un paquete de flujos, portadas y manifiesto SHA256, con tamaño de 0.0 GB.
- No se ejecutó inferencia: no existen renders, mediciones de tiempo, cifras de VRAM ni comparaciones de calidad visual que respalden el comportamiento descrito.
- Las notas de los nodos describen intención, no comportamiento medido; el autor lo señala de forma explícita.
- El prompt, la imagen y la referencia guardados en los flujos son contenido de demostración del autor y deben sustituirse.
- El ajuste de fidelidad tiene un compromiso documentado: valores muy altos de `ref_boost` copian en exceso la referencia y rompen las operaciones de eliminación.
- En el flujo con máscara, un `GrowMask` demasiado ajustado produce costuras visibles y uno demasiado amplio edita zonas no deseadas; no se formula ninguna afirmación sobre precisión de la máscara.
- El comportamiento del modo de dos imágenes depende de la implementación concreta de `Krea2EditModelPatch` y debe verificarse con material propio.
- Se recomiendan entradas de alrededor de 1 MP y no superiores a ~1.5 MP para entradas con dos personas.
- Licencia no disponible: no consta permiso explícito de uso comercial, y las licencias del modelo base, del LoRA, del text encoder y del VAE deben resolverse por separado en cada entorno.
- Idiomas soportados no disponibles; los nombres de fichero originales están en chino y se conservan, con títulos en inglés como traducción, no como renombrado.
- Riesgo de sesgos y de alucinación visual: no documentado en la información disponible.
- Los enlaces a RunningHub incluyen el código de invitación del autor (`rh-v1111`), lo que conviene tener en cuenta al evaluar su independencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/krea2-identity-edit-three-modes-282
- Flujo 01, RunningHub internacional: https://www.runninghub.ai/zh-cn/post/2079889925343891458?inviteCode=rh-v1111
- Flujo 01, RunningHub China: https://www.runninghub.cn/post/2079889925343891458/?inviteCode=rh-v1111
- Flujo 01, Civitai: https://civitai.com/models/3033050
- Flujo 02, RunningHub internacional: https://www.runninghub.ai/zh-cn/post/2079889918284877826?inviteCode=rh-v1111
- Flujo 02, RunningHub China: https://www.runninghub.cn/post/2079889918284877826/?inviteCode=rh-v1111
- Flujo 02, Civitai: https://civitai.com/models/3033052
- Flujo 03, RunningHub internacional: https://www.runninghub.ai/zh-cn/post/2079971231356506114?inviteCode=rh-v1111
- Flujo 03, RunningHub China: https://www.runninghub.cn/post/2079971231356506114/?inviteCode=rh-v1111
- Flujo 03, Civitai: https://civitai.com/models/3033054
