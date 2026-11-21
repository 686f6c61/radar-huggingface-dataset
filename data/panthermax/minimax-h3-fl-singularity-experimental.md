# PantherMax/MiniMax-H3-FL-Singularity-Experimental

## Resumen

MiniMax-H3-FL-Singularity-Experimental es un merge experimental de pesos publicado por el usuario PantherMax sobre la familia MiniMax H3, un modelo de generación de vídeo (image-to-video y referencia a vídeo) desarrollado originalmente por MiniMax. El autor combina dos checkpoints existentes —la variante FL distribuida por Comfy-Org y el fine-tune Singularity de WarmBloodAban— para obtener un modelo híbrido que busca la claridad visual y la destilación CFG de FL junto con la iluminación, texturas y expresividad de movimiento de Singularity. No se trata de un modelo entrenado desde cero, sino de una mezcla aritmética de pesos (weight merge) sobre la que se aplica cuantización INT8.

El resultado se distribuye en formato safetensors e INT8 ConvRot, pensado para ejecutarse en ComfyUI dentro de flujos de trabajo de imagen a vídeo con condicionamiento por referencia y por primer/último fotograma. La release más reciente, MA50 v2, emplea un blend 50/50 de FL y Singularity en las proyecciones de atención y MLP de los 50 bloques principales del transformer, manteniendo el condicionamiento temporal (AdaLN) de FL para maximizar la compatibilidad con LoRAs y adaptadores turbo entrenados sobre FL.

Es relevante ahora porque la comunidad de generación de vídeo open source está experimentando con merges de bajo coste para corregir defectos concretos (efecto "waxy" en FL, desenfoque en Singularity) sin necesidad de reentrenar. El modelo está etiquetado como experimental, con 730 descargas y 4 likes en el momento de la consulta, y hereda la licencia comunitaria de MiniMax H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax H3), con token refiner y proyecciones de condicionamiento temporal AdaLN; merge de pesos, no reentrenado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (group size 256, escalado absmax por fila, `mseclip=False`); pesos base en BF16 durante la construcción |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (INT8 ConvRot para los 200 tensores mezclados) |

## Arquitectura y entrenamiento

El modelo es un merge aritmético de dos checkpoints de MiniMax H3. Concretamente, los 50 bloques principales del transformer (bloques 0 a 49) mezclan cuatro proyecciones —`attn.qkv_proj.weight`, `attn.out_proj.weight`, `mlp.fc1.weight` y `mlp.fc2.weight`— mediante la fórmula `FL + 0.5 × (Singularity − FL)`, calculada en FP32 y redondeada a BF16 antes de cuantizar. En total se convierten 200 matrices a INT8 ConvRot con el cuantizador de Comfy-Org (group size 256, escalado absmax por fila, aritmética FP32 en CPU, 256 filas completas por chunk). El resto de tensores no mezclados se conservan byte a byte del base FL (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`).

De FL se retienen sin cambios la proyección de condicionamiento, los dos bloques token-refiner, las ganancias de normalización, las proyecciones de entrada/salida de vídeo y audio, y las frecuencias rotatorias. La diferencia entre las dos variantes publicadas (MA50 v1 y MA50 v2) está únicamente en la fuente del condicionamiento temporal AdaLN: v2 conserva la tabla de timesteps y las proyecciones AdaLN de FL, mientras que v1 copia los 103 tensores de condicionamiento temporal de Singularity (tabla de timesteps, `adaln_proj.linear.weight` y `.bias` de los 50 bloques, y la capa final). No se realiza pruning adicional ni se reentrena ningún componente; no hay información sobre el dataset de entrenamiento original de MiniMax H3 en la documentación proporcionada.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) y con condicionamiento por referencia.
- Flujos de primer y último fotograma (first/last-frame workflows).
- Generación condicionada por referencia, según indica la model card.
- Mejora declarada de detalle facial en planos medios y largos frente a FL y Singularity por separado.
- Movimiento más expresivo e iluminación y texturas más naturales que FL según el autor.
- Compatibilidad con adaptadores turbo (LoRA), concretamente Pika Flex FL y DMAD H3 8-step, probados sobre ambas variantes.
- Integración con ComfyUI (etiqueta `comfyui` y librería `minimax-h3`).
- No se documentan capacidades de tool calling, agentes, texto, visión general ni audio en la información disponible.

## Casos de uso

- Producción de vídeo corto con ComfyUI: el modelo se carga como checkpoint de difusión en un workflow image-to-video y se usa para animar fotografías o renders con control de primer y último fotograma, aprovechando el soporte nativo de ComfyUI.
- Iteración de estilo con LoRAs: al conservar el AdaLN de FL en la variante v2, encaja en stacks de LoRA entrenados sobre FL, lo que permite aplicar estilos o personajes sin reentrenar el modelo base.
- Aceleración con adaptadores turbo: combinado con DMAD H3 8-step o Pika Flex FL, permite reducir el número de pasos de muestreo en pipelines de generación rápida, útil para previsualización y pruebas de concepto.
- Corrección de artefactos en vídeo generado: el merge está diseñado para reducir el efecto "waxy" de FL y el desenfoque de Singularity, por lo que sirve como sustituto directo en flujos existentes que ya usen cualquiera de los dos.
- Generación de planos con personajes: la mejora declarada de detalle facial en planos medios y largos lo hace adecuado para secuencias con figuras humanas donde el detalle de rostro es crítico.
- Experimentación e investigación en merges de difusión: sirve como caso de estudio reproducible de mezcla de pesos con cuantización INT8 ConvRot y de cómo el origen del condicionamiento AdaLN afecta a la compatibilidad con LoRAs.
- Prototipado de anuncios o contenido para redes: para equipos que necesitan generar clips cortos a partir de imágenes fijas con calidad razonable y sin infraestructura de entrenamiento propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe comparaciones cualitativas del autor (menos efecto "waxy" que FL, menos desenfoque que Singularity, mejor seguimiento de la acción con LoRAs en v2 frente a v1) sin métricas cuantitativas ni tablas de evaluación.

## Requisitos de hardware

- El repositorio ocupa 41,9 GB, lo que da una idea del tamaño de los pesos distribuidos; la VRAM necesaria para inferencia no está especificada en la información disponible.
- Al tratarse de un modelo de difusión de vídeo de la familia MiniMax H3, se espera que requiera GPU de gama alta, pero no se dispone de cifras oficiales de VRAM por cuantización.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo sugiere que no cabe en GPUs de consumo de gama baja, pero no se confirma.
- Despliegue: ComfyUI es el entorno documentado (etiquetas `comfyui` y librería `minimax-h3`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL-Singularity-Experimental (MA50 v2) | Merge de difusión vídeo, INT8 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 730 descargas |
| Comfy-Org/MiniMax-H3 (FL) | Difusión vídeo base | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (Comfy-Org) |
| WarmBloodAban/Minimax-h3_Singularity | Fine-tune de MiniMax H3 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo original | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |

No se dispone de datos de parámetros, contexto ni benchmarks de los modelos comparados en la información proporcionada, por lo que la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo explícitamente experimental: son pesos modificados ensamblados a partir de checkpoints existentes, no un modelo entrenado, y el autor no garantiza estabilidad.
- No hay benchmarks publicados; las mejoras descritas son cualitativas y subjetivas del autor.
- Riesgo de artefactos: la model card menciona "gritty artifacts" en v1 que v2 intenta reducir, lo que indica que pueden persistir defectos visuales.
- Dos variantes con comportamiento distinto según el AdaLN: elegir la incorrecta puede degradar la compatibilidad con LoRAs (v2 para LoRAs de FL, v1 para LoRAs de Singularity).
- Licencia MiniMax H3 Community License Agreement: es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial; no es una licencia open source estándar y puede imponer restricciones.
- Idiomas no documentados; al ser un modelo de vídeo, la dimensión lingüística no aplica directamente, pero no se especifica el soporte de prompts en distintos idiomas.
- Sin información sobre sesgos, alucinación visual o limitaciones de contexto; no disponible.
- Dependencia de ComfyUI y de la revisión concreta del cuantizador de Comfy-Org, lo que puede afectar a la reproducibilidad exacta de los pesos.
- El tamaño del repo (41,9 GB) y la ausencia de datos de VRAM hacen necesario validar el despliegue en el hardware objetivo antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/PantherMax/MiniMax-H3-FL-Singularity-Experimental
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base WarmBloodAban/Minimax-h3_Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Cuantizador Comfy-Org (quant_int8_convrot.py): https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py
- Adaptador DMAD H3 8-step: https://huggingface.co/ZhengmingYu/DMAD/blob/main/minimax_h3/dmad_minimax_h3_8step_full_critic_comfyui.safetensors
