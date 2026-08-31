# barelymining/ComfyUI-MiniMax-H3-FastVideo

## Resumen

Este repositorio contiene un adaptador experimental para ComfyUI que permite ejecutar el modelo de generación de vídeo MiniMax-H3 en tan solo 4 pasos de muestreo, aprovechando la técnica de Video Sparse Attention (VSA) desarrollada por FastVideo. El paquete incluye dos archivos: un LoRA de 2,05 GB que adapta el backbone del modelo base, y un archivo de pesos de gate de 3,6 GB que inyecta las capas de compresión de atención (`to_gate_compress`) que no existen en la implementación estándar de ComfyUI. Está diseñado específicamente para funcionar con el modelo base pruned INT8 de Comfy-Org y requiere un custom node dedicado.

El propósito principal es reducir drásticamente el tiempo de generación en GPUs de consumo como la RTX 3090 Ti (24 GB): un clip de 5 segundos a 0,8 MP pasa de unos 8 minutos con 20 pasos a menos de 1 minuto en modo borrador (draft) o ~2,5 minutos en calidad máxima, según los datos del autor. Es una alternativa experimental a los LoRAs turbo oficiales, pensada para usuarios que quieran explorar el enfoque de atención dispersa de FastVideo o que dispongan de tarjetas más antiguas (RTX 3090/4090) incompatibles con las versiones más recientes de FastVideo, que apuntan a GPUs Hopper/Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con atención dispersa (Video Sparse Attention) sobre MiniMax-H3 |
| Parametros totales | No disponible (el adaptador LoRA pesa 2,05 GB y el gate 3,6 GB; el modelo base MiniMax-H3 no se especifica) |
| Parametros activos | No disponible (no es un MoE) |
| Longitud de contexto | No disponible (orientado a vídeo; el base soporta clips de 5-15 segundos) |
| Tipos de cuantizacion | Modelo base pruned INT8 (FL2VA) de Comfy-Org; los adaptadores se distribuyen en BF16 |
| Idiomas soportados | No disponible (los del modelo base MiniMax-H3, no documentados en este repo) |
| Licencia | MiniMax H3 Community License (license: other) |
| Formato de pesos | safetensors (LoRA y gate separados) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base MiniMax-H3 de MiniMax, un diffusion transformer multimodal para generación de vídeo. La innovación principal reside en el uso de Video Sparse Attention (VSA) de FastVideo, que reduce aproximadamente a la mitad el coste de atención por paso en comparación con la atención densa, combinado con una destilación en 4 pasos (checkpoint VSA-DataFree de FastVideo). El LoRA ajusta el backbone y las capas AdaLN del modelo pruned, fusionando las ramas q/k/v en `qkv_proj` para coincidir con la disposición de ComfyUI, mientras que el gate inyecta las 50 capas `to_gate_compress` extraídas del checkpoint original, que se cargan en tiempo de ejecución mediante el custom node. La conversión incluyó una proyección por mínimos cuadrados de `adaln_proj.lora_A` desde el espacio BF16 completo al espacio comprimido de 8 dimensiones del modelo pruned, descrita por el autor como matemáticamente sin pérdidas (residual ≈ 0). El entrenamiento original de FastVideo no se detalla en este repositorio; solo se indica que el checkpoint VSA-DataFree fue convertido.

## Capacidades

- Generación de vídeo en 4 pasos de muestreo (frente a los 20 del modelo base), con CFG 1.0 y `topk_ratio` de 0.10 (borradores) o 1.0 (resultados finales).
- Atención dispersa (VSA) mediante un kernel Triton de FastVideo, integrado como custom node de ComfyUI.
- Compatibilidad con el modelo base pruned INT8 FL2VA de Comfy-Org (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`).
- Soporte de vídeo de 5 segundos a 0,8 MP en hardware de consumo (RTX 3090 Ti, 24 GB).
- Requiere un custom node específico (`ComfyUI-MiniMax-H3-FastVideo`) para inyectar las capas de gate y enrutar la atención; no funciona con un cargador LoRA estándar.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso, propias de modelos de lenguaje.

## Casos de uso

- Generación de vídeo local en GPU de consumo: permite producir clips cortos (5 segundos, 0,8 MP) en menos de un minuto en modo borrador, ideal para iterar rápidamente sobre ideas creativas sin depender de servicios en la nube.
- Prototipado de conceptos visuales: el modo draft con `topk_ratio` 0.10 ofrece una vista previa rápida para validar composición, movimiento o estilo antes de lanzar una generación de calidad final.
- Experimentación con atención dispersa: investigadores y desarrolladores pueden comparar el equilibrio velocidad/calidad de VSA frente a la atención densa usando el mismo modelo base, sin necesidad de GPUs Hopper/Blackwell.
- Flujos de trabajo de postproducción: integrado en ComfyUI, puede combinarse con nodos de upscaling, interpolación de frames o edición de vídeo para acelerar tareas de previsualización.
- Despliegue en hardware heredado: usuarios con RTX 3090 o 4090 que no pueden ejecutar las versiones oficiales de FastVideo (dirigidas a arquitecturas más nuevas) pueden aprovechar esta vía para acelerar la generación.
- Educación y análisis técnico: el repositorio documenta el proceso de conversión (fusión de ramas q/k/v, proyección AdaLN, extracción de gates), útil para quienes estudian adaptación de modelos de difusión a frameworks específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como FVD, CLIP score o similares) en la información disponible. El autor proporciona únicamente datos de rendimiento empíricos en una RTX 3090 Ti (24 GB) para un clip de 5 segundos a 0,8 MP:

| Configuracion | Tiempo estimado |
|---|---|
| Base (20 pasos, atención densa) | ~8 minutos |
| VSA 4 pasos, modo draft (topk_ratio 0.10) | < 1 minuto |
| VSA 4 pasos, calidad final (topk_ratio 1.0) | ~2,5 minutos |

El repositorio del custom node indica una aceleración aproximada de 2× en atención por paso frente a la atención densa, pero no se ofrecen métricas de calidad objetivas.

## Requisitos de hardware

- VRAM estimada: 24 GB (probado en RTX 3090 Ti; el autor menciona compatibilidad con RTX 3090 y 4090).
- GPU recomendadas: tarjetas consumer con 24 GB de VRAM; no requiere Hopper/Blackwell, a diferencia de las versiones oficiales recientes de FastVideo.
- No cabe en GPUs con menos de 24 GB sin cuantización adicional del modelo base, aunque no se documentan configuraciones alternativas.
- Opciones de despliegue: ComfyUI con el custom node `ComfyUI-MiniMax-H3-FastVideo` y la dependencia Python `vsa`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicable a un pipeline de vídeo).
- Latencia: ~1 minuto (draft) o ~2,5 minutos (calidad final) para un clip de 5 s a 0,8 MP en RTX 3090 Ti; el throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Pasos | Requiere custom node | Aceleracion | Hardware compatible | Licencia |
|---|---|---|---|---|---|
| Este adaptador (VSA + gate) | 4 | Sí | ~8× frente a base (20 pasos) | RTX 3090/4090 (24 GB) | MiniMax H3 Community License |
| Comfy-Org MiniMax-H3 turbo (oficial) | 4 | No | Alto (sin especificar) | No especificado | MiniMax H3 Community License |
| lightx2v Minimax-h3-Turbo | 8 | No | Moderado (sin especificar) | No especificado | MiniMax H3 Community License |

Las alternativas oficiales son más simples de configurar (no requieren custom node ni archivos de gate separados) y probablemente más estables, pero este adaptador ofrece la ventaja de la atención dispersa y compatibilidad con GPUs más antiguas. No hay datos comparativos de calidad objetiva entre las tres opciones.

## Limitaciones y advertencias

- Experimental: probado únicamente en una máquina (RTX 3090 Ti); el autor advierte que puede no funcionar en otros entornos sin ajustes.
- Requiere el custom node `ComfyUI-MiniMax-H3-FastVideo` y su dependencia `vsa`; no es un drop-in para la carga estándar de LoRAs en ComfyUI.
- Depende de un modelo base específico: `minimax_h3_fl2va_pruned_int8_convrot.safetensors` de Comfy-Org. Otras variantes pruned INT8 FL2VA pueden funcionar solo si su `adaln_t_table` coincide; no se ha probado con variantes no pruned o no INT8.
- Licencia MiniMax H3 Community License: restringe el uso comercial y la redistribución; hay que revisar los términos exactos antes de desplegar en producción.
- Riesgo de alucinación visual o artefactos en la generación de vídeo, no cuantificado en este repositorio.
- La calidad final depende del `topk_ratio`; valores bajos (0.10) producen borradores con calidad reducida, y el ajuste fino de este parámetro no está documentado más allá de las dos configuraciones sugeridas.
- El proceso de conversión (fusión de ramas, proyección AdaLN) es específico de esta versión; actualizaciones del modelo base o de FastVideo pueden romper la compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/barelymining/ComfyUI-MiniMax-H3-FastVideo
- Custom node (GitHub): https://github.com/barelymining/ComfyUI-MiniMax-H3-FastVideo
- Checkpoint original de FastVideo: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base pruned INT8 de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Kernel VSA de FastVideo: https://github.com/hao-ai-lab/FastVideo
- Licencia del LoRA de FastVideo: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA/blob/main/LICENSE
- Alternativa turbo de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Alternativa turbo de lightx2v: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Página oficial de MiniMax H3: https://design.minimax.io/h3
