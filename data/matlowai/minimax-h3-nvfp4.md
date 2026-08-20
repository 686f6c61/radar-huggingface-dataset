# MATLOWAI/minimax-h3-nvfp4

## Resumen

MiniMax H3 NVFP4 es una cuantización de precisión mixta del modelo MiniMax H3 FL2VA pruned, desarrollada por MATLOWAI para su uso exclusivo en ComfyUI. El modelo base, MiniMax H3, es un sistema de difusión omni-modal de MiniMax AI que genera vídeo en resolución 2K con audio estéreo 3D sincronizado en una única pasada de inferencia. Esta variante NVFP4 está pensada para GPUs Blackwell (serie RTX 50) y explota los tensor cores fp4 nativos de esa arquitectura para acelerar la generación.

La cuantización almacena los 200 bloques lineales (qkv, out, fc1, fc2 en los 50 bloques) en formato fp4 e2m1 con escalas de bloque fp8 e4m3 de 16 elementos y una escala por tensor fp32. Los embeddings, el token refiner, las normas y las cabezas permanecen en bf16. El resultado es un archivo de 12,5 GB con 4,54 bits por parámetro, que ofrece una velocidad de inferencia superior al archivo W4A8 en hardware Blackwell, aunque con un coste de calidad ligeramente mayor (error RMS relativo mediano del 9,4 % frente al 7,3 % del W4A8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion multimodal (video + audio), no transformer autoregresivo |
| Parametros totales | no disponible (el archivo de 12,5 GB a 4,54 bits/parametro sugiere ~22 B, sin confirmar) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no un LLM) |
| Tipos de cuantizacion | NVFP4 (fp4 e2m1 + escalas de bloque fp8 e4m3) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (restricciones territoriales) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

MiniMax H3 es un modelo de difusion conjunta que genera video 2K y audio estereo 3D sincronizado en una sola pasada. La arquitectura se aleja de los modelos video-only tradicionales al emplear un proceso de difusion conjunto para las modalidades visual y auditiva. La version pruned (FL2VA) es una poda de la version completa que reduce el numero de bloques a 50, cada uno con cuatro lineales (qkv, out, fc1, fc2), totalizando 200 lineales. El modelo original se entreno con datos multimodales, aunque no se disponen de detalles concretos sobre el dataset ni el procedimiento de entrenamiento en la informacion proporcionada.

La cuantizacion NVFP4 se realizo post-entrenamiento sobre el archivo `minimax_h3_fl2va_pruned_bf16.safetensors` de Comfy-Org, usando el layout `TensorCoreNVFP4Layout` de ComfyUI. No se aplico ningun proceso de calibracion o ajuste fino posterior a la cuantizacion. El archivo incluye metadatos `comfy_quant` por capa que permiten a ComfyUI ejecutar las GEMMs de forma nativa en los tensor cores fp4 de Blackwell (sm120) sin nodos personalizados.

## Capacidades

- Generacion de video de alta resolucion (2K) a partir de texto, imagen o referencia.
- Sincronizacion de audio 3D estereo con el video en la misma inferencia.
- Soporte de modos T2V (texto a video), I2V (imagen a video) y REF2V (referencia a video).
- Capacidad de procesar secuencias largas de tokens (probado hasta 45k tokens sin degradacion de velocidad).
- Compatible con flujos de trabajo avanzados de ComfyUI, incluyendo opciones de control de calidad y velocidad.
- No soporta tool calling, agentes ni razonamiento multi-step, ya que no es un modelo de lenguaje.

## Casos de uso

- **Generacion de video para produccion cinematografica**: permite crear clips de video 2K con audio sincronizado directamente desde texto o imagenes de referencia, agilizando el proceso de previsualizacion y storyboard.
- **Creacion de contenido para redes sociales**: Generacion rapida de clips cortos con audio para plataformas como TikTok o Reels, sin necesidad de equipos de edicion complejos.
- **Prototipado de escenas en publicidad**: Los equipos de marketing pueden generar borradores de anuncios con voz y efectos de sonido para presentar a clientes antes de la produccion final.
- **Desarrollo de videojuegos**: Generacion de cinematicas o cutscenes provisionales con audio para pruebas de gameplay y narrativa.
- **Generacion de material educativo**: Creacion de videos explicativos con narracion y efectos de sonido a partir de guiones de texto.
- **Investigacion en modelos multimodales**: Utilizado como referencia para estudiar el impacto de cuantizaciones de baja precision en modelos de difusion conjunta video-audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor proporciona metricas internas de calidad y velocidad:

| Metrica | Valor |
|---|---|
| Error RMS relativo mediano vs bf16 | 9,4 % |
| Error RMS relativo del W4A8 | 7,3 % |
| Error RMS relativo del int8_convrot | 1,0 % |
| Velocidad relativa vs W4A8 (29k tokens) | 0,84x |
| Velocidad relativa vs W4A8 (45k tokens) | 0,90x |

Estas metricas indican que la cuantizacion NVFP4 es mas rapida que la W4A8 en hardware Blackwell, pero con un coste de precision ligeramente mayor. No hay datos comparativos con otros modelos de generacion de video.

## Requisitos de hardware

- **VRAM estimada**: el archivo de 12,5 GB requiere al menos 16 GB de VRAM para cargar el modelo completo; se recomienda 24 GB para margen de seguridad.
- **GPU compatibles**: exclusivamente NVIDIA RTX 50-series (sm120, Blackwell) para ejecucion nativa de las GEMMs fp4. En otras GPU (Ampere, Ada Lovelace), ComfyUI recurre a matmuls dequantizadas que son mas lentos que el archivo int8_convrot.
- **GPU recomendadas**: RTX 5090, RTX 5080, RTX PRO 6000 Blackwell (probada por el autor).
- **Software**: PyTorch con CUDA 13.0+ (cu130) y ComfyUI actualizado.
- **Opciones de despliegue**: ComfyUI (unico soportado), sin soporte para vLLM, llama.cpp, Ollama o TGI (no es un LLM).
- **Latencia y throughput**: la velocidad se mide en relacion al archivo W4A8: 0,84x a 29k tokens y 0,90x a 45k tokens, lo que implica una mejora del 16 % y 10 % respectivamente en tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Precision | Tamano (GB) | Bits/parametro | Error RMS vs bf16 | Velocidad relativa |
|---|---|---|---|---|---|
| MiniMax H3 NVFP4 (este) | fp4 e2m1 + fp8 e3m3 | 12,5 | 4,54 | 9,4 % | 1,0x (referencia) |
| MiniMax H3 W4A8 (Comfy-Org) | int8 convrot | 12,5 | 4,54 | 7,3 % | 0,84x |
| MiniMax H3 int8_convrot (Comfy-Org) | int8 | 12,5 | 4,54 | 1,0 % | no disponible |

No se han identificado otros modelos de generacion de video comparables con cuantizacion NVFP4 en la informacion proporcionada.

## Limitaciones y advertencias

- **Restricciones de licencia**: la licencia MiniMax H3 Community License Agreement incluye restricciones territoriales y condiciones de uso; es obligatorio leerla antes de usar o redistribuir el modelo.
- **Hardware limitado**: solo es recomendable en GPU Blackwell; en cualquier otra GPU el rendimiento es peor que la alternativa int8.
- **Error de cuantizacion**: el error RMS mediano del 9,4 % puede provocar diferencias visibles en el resultado respecto al modelo bf16, aunque el autor indica que se mantiene la misma escena y palabras.
- **Alucinacion visual**: como modelo de difusion, puede generar contenido visual no deseado o artefactos en escenas complejas.
- **Sin soporte de agentes ni tool calling**: no es un modelo de lenguaje, por lo que no se puede integrar en pipelines de agentes.
- **Dependencia de ComfyUI**: requiere una version actualizada de ComfyUI con soporte para metadatos `comfy_quant`; no funciona en otros frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MATLOWAI/minimax-h3-nvfp4
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Coleccion MiniMax H3: https://huggingface.co/collections/MiniMaxAI/minimax-h3
- Documentacion tecnica (DeepWiki): https://deepwiki.com/ai-models-lab/minimax-h3/4-minimax-h3-model-reference
- Herramientas y quants (awesome-minimax-H3): https://github.com/wildminder/awesome-minimax-H3
- Workflow de filmacion avanzado (Civitai): https://civitai.com/models/2834514/minimax-h3-t2v-i2v-ref2v-advanced-filmmaking-workflow-or-all-speedups-qol-features
- Repositorio del builder (ComfyUI-MAINodes): https://github.com/matlowai/ComfyUI-MAINodes
- Pagina de comparacion A/B: https://matlowai.github.io/ComfyUI-MAINodes/a6-review/
