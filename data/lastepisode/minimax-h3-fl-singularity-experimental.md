# LastEpisode/MiniMax-H3-FL-Singularity-Experimental

## Resumen
MiniMax-H3-FL-Singularity-Experimental es un merge experimental de pesos, publicado por LastEpisode, que combina los checkpoints FL de MiniMax H3 (distribuidos por Comfy-Org) con el checkpoint Singularity de WarmBloodAban. No se trata de un modelo entrenado desde cero, sino de una recomposición de matrices de proyección en los 50 bloques principales del transformer de difusión, orientada a generación de vídeo condicionada por imagen (image-to-video) y por referencia.

El objetivo declarado es intermedio entre ambos extremos: conservar la claridad visual y la destilación CFG originales de FL, incorporando la iluminación, texturas, expresividad de movimiento y detalle facial en plano medio y largo de Singularity, con menos aspecto ceroso que FL y menos desenfoque que Singularity en solitario. El resultado son pesos INT8 ConvRot de aproximadamente 41,9 GB, pensados para despliegue en ComfyUI con la librería minimax-h3.

La relevancia es practica: permite a quien ya trabaja con flujos FL probar un ajuste de estética sin cambiar de pipeline, y ofrece dos variantes según la fuente de condicionamiento temporal (AdaLN), de modo que encaja tanto con LoRA entrenados sobre FL como con LoRA entrenados sobre Singularity. La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax H3), con token refiner y proyecciones de entrada/salida de vídeo y audio; merge de pesos, no modelo entrenado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | INT8 ConvRot (grupo 256, escala absmax por fila); pesos flotantes BF16 usados solo durante la construcción del merge |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (INT8 ConvRot para el checkpoint desplegable; BF16 para las fuentes) |

## Arquitectura y entrenamiento
El modelo es un transformer de difusión de MiniMax H3 con 50 bloques principales, cada uno con atención (`attn.qkv_proj`, `attn.out_proj`) y MLP (`mlp.fc1`, `mlp.fc2`). El merge aplica una interpolación lineal del 50 % sobre estas cuatro proyecciones en todos los bloques: `FL + 0.5 × (Singularity − FL)`, calculada en FP32 y redondeada a BF16 antes de cuantizar. Se elimina el prefijo `model.diffusion_model.` de Singularity para alinear los nombres de tensor con FL.

Se conservan intactos de FL el proyector de condicionamiento, los dos bloques token-refiner, las ganancias de normalización, las proyecciones de entrada/salida de vídeo y audio y las frecuencias rotatorias. Solo las 200 matrices mezcladas se convierten a INT8 ConvRot con el cuantizador de Comfy-Org (grupo 256, absmax por fila, aritmética FP32 en CPU, 256 filas por chunk, `mseclip=False`); el resto de tensores del base FL INT8 se mantiene byte a byte. No hay entrenamiento, RLHF ni DPO: es una recomposición de pesos existentes.

Las dos variantes difieren únicamente en la fuente de condicionamiento temporal (AdaLN). MA50 v2 conserva la tabla de timesteps y las proyecciones AdaLN de FL, lo que la hace compatible con stacks de LoRA que esperan condicionamiento FL. MA50 v1 copia los 103 tensores de condicionamiento de Singularity (tabla de timesteps, `adaln_proj.linear.weight` y `.bias` de los 50 bloques, y los correspondientes de la capa final), preservando valores y dtypes del donante.

## Capacidades
- Generación de vídeo condicionada por imagen (image-to-video) mediante el pipeline `image-to-video`.
- Generación condicionada por referencia, según el checkpoint Singularity `ref2va` usado como donante.
- Flujos de primer y último fotograma (first/last-frame workflows).
- Salida de audio acoplada al vídeo, dado que se retienen las proyecciones de entrada/salida de audio de FL.
- Compatibilidad con adaptadores turbo: Pika Flex FL y DMAD H3 8-step funcionaron bien en ambas variantes según el autor.
- Integración con ComfyUI a través de la librería `minimax-h3`.
- No dispone de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso
- Prototipado de image-to-video en ComfyUI: al ser un checkpoint INT8 ConvRot de unos 41,9 GB, se carga directamente en el grafo de ComfyUI para animar imágenes fijas con condicionamiento por primer y último fotograma, sin necesidad de reentrenar.
- Ajuste estético de producciones existentes: estudios que ya generan con FL pueden sustituir el checkpoint por MA50 v2 y obtener iluminación y texturas más naturales sin rehacer los LoRA entrenados sobre FL.
- Iteración con LoRA sobre Singularity: MA50 v1, al conservar el AdaLN de Singularity, sirve para probar LoRA entrenados sobre ese checkpoint manteniendo parte de la claridad de FL.
- Generación de planos medios y largos con rostros: el detalle facial y la expresividad de movimiento mejoradas respecto a FL lo hacen adecuado para tomas donde la cara ocupa parte relevante del encuadre.
- Aceleración con adaptadores turbo: combinado con DMAD H3 8-step o Pika Flex FL, permite reducir pasos de muestreo en pruebas de concepto y borradores de secuencia.
- Evaluación comparativa de merges: al existir dos variantes con la misma mezcla y distinto AdaLN, sirve como banco de pruebas controlado para medir el impacto del condicionamiento temporal en la calidad final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe pruebas cualitativas con LoRA (Pika Flex FL y DMAD H3 8-step) indicando que v2 sigue mejor la acción entrenada y produce metraje más limpio y natural, con menos artefactos granulosos que v1.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; el repo ocupa 41,9 GB en INT8, por lo que se necesita al menos una GPU con 48 GB (A100 80 GB, H100, L40S 48 GB) para cargar el checkpoint completo en memoria junto con el resto del pipeline.
- GPU recomendadas: A100 80 GB, H100 80 GB y L40S 48 GB para despliegue cómodo; GPUs de 24 GB (RTX 4090) requerirían offload a RAM/CPU o variantes pruned adicionales no documentadas.
- Cabe en consumer GPU: no de forma holgada con el checkpoint INT8 completo; en RTX 4090 24 GB solo con descarga parcial de capas y penalización de latencia.
- Opciones de despliegue: ComfyUI con la librería `minimax-h3` (vía principal documentada); vLLM, llama.cpp, Ollama y TGI no aplican a este modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL-Singularity MA50 (este) | Merge INT8 de difusión vídeo | no disponible | no aplica | MiniMax H3 Community License | Hugging Face, 730 descargas |
| Comfy-Org/MiniMax-H3 (FL) | Checkpoint base de difusión vídeo | no disponible | no aplica | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Checkpoint base de difusión vídeo | no disponible | no aplica | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo original de difusión vídeo | no disponible | no aplica | MiniMax H3 Community License | Hugging Face |

No hay datos públicos de benchmarks que permitan comparar rendimiento numérico entre estas variantes; las diferencias documentadas son cualitativas (estética, artefactos, seguimiento de LoRA).

## Limitaciones y advertencias
- Es un merge experimental de pesos, no un modelo entrenado: no hay garantía de coherencia global más allá de las pruebas cualitativas del autor.
- Solo se mezclan las cuatro proyecciones de atención y MLP de los 50 bloques; el resto del grafo queda idéntico a FL, lo que limita el alcance de la mejora estética.
- La elección de AdaLN condiciona la compatibilidad con LoRA: usar MA50 v1 con LoRA entrenados sobre FL, o MA50 v2 con LoRA de Singularity, puede degradar resultados.
- Licencia MiniMax H3 Community License Agreement: no es open source estándar; revisar LICENSE y NOTICE antes de uso comercial.
- Riesgo de artefactos granulosos y alucinaciones visuales inherente a los modelos de difusión de vídeo, mitigado pero no eliminado según el autor.
- Idiomas no declarados; al ser un modelo de vídeo, la cobertura lingüística afecta solo a audio o texto asociado, no documentada.
- Requisitos de memoria elevados (41,9 GB en INT8) que excluyen GPUs de consumo sin offload.

## Enlaces
- Hugging Face: https://huggingface.co/LastEpisode/MiniMax-H3-FL-Singularity-Experimental
- Modelo base FL (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Cuantizador Comfy-Org: https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py
- Adaptador DMAD H3 8-step: https://huggingface.co/ZhengmingYu/DMAD/blob/main/minimax_h3/dmad_minimax_h3_8step_full_critic_comfyui.safetensors
