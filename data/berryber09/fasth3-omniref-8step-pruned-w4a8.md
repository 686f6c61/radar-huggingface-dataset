# berryber09/FastH3-OmniRef-8step-pruned-w4a8

## Resumen

FastH3 OmniRef 8-step pruned W4A8 es un checkpoint de generación de vídeo cuantizado a 4 bits, publicado por el usuario berryber09 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión del fichero bf16 «FastH3 OmniRef 8-step pruned» alojado en `FastVideo/FastH3-Omni-Comfy` (44.240.780.704 bytes), que a su vez deriva del modelo base `MiniMaxAI/MiniMax-H3`, revisión `9bfb6693f2cf6de171db46d1aa586f67d773a1da`. El resultado es un único fichero `fasth3_omniref_8step_pruned_w4a8.safetensors` de 16.555.980.952 bytes (unos 16,55 GB), es decir, aproximadamente un 37 % del tamano del checkpoint original en bf16.

El modelo resuelve un problema muy concreto: ejecutar generación de vídeo condicionada por referencias (reference-to-video, variante ref2va) en un entorno ComfyUI con requisitos de VRAM rebajados y con solo 8 pasos de muestreo, sin CFG. Incorpora su propia destilación a 8 pasos, de modo que no necesita LoRAs turbo ni de tier adicionales. La cuantización utiliza el esquema `AsymW4A8Int8Layout` de la librería comfy-kitchen: pesos en 4 bits con activaciones int8 asimétricas.

Su relevancia es práctica más que científica: permite probar un pipeline de vídeo con referencias en GPUs de consumo alto (24 GB) en lugar de exigir aceleradores de 40-80 GB, a cambio de una posible pérdida de fidelidad frente al bf16 que no ha sido cuantificada públicamente. El repositorio tiene 0 descargas y 2 likes en el momento de redactar esta ficha, por lo que no existe validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo de difusión para generación de vídeo derivado de MiniMax-H3 (la nomenclatura del autor indica un transformer de difusión con flujo ref2va) |
| Parametros totales | no disponible; el checkpoint bf16 de origen ocupa 44.240.780.704 bytes y el cuantizado 16.555.980.952 bytes |
| Parametros activos | no aplica (no se ha publicado que el modelo base sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la condición se aporta como prompt y conjunto ordenado de referencias) |
| Tipos de cuantizacion | W4A8: pesos 4 bits, activaciones int8 asimétricas, layout `AsymW4A8Int8Layout` de comfy-kitchen |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (fichero único `fasth3_omniref_8step_pruned_w4a8.safetensors`) |
| Pasos de inferencia | 8 |
| CFG (guidance scale) | 1.0 (sin pase de CFG) |
| Sigma shift | vídeo 12.0, audio 3.0 |
| Condicionamiento | ref2va (referencias ordenadas fijas, flujo solo hacia el objetivo) |
| Tamano del repositorio | 16,6 GB |
| SHA256 del fichero | `76753f3265c52d5675efc1306278f950cdd3ed2f03b841e6c4de0b221cde6553` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. Lo que sí se deduce del material del autor es que se trata de un modelo de difusión para generación de vídeo con un modo reference-to-video («ref2va») en el que las referencias se aportan como un conjunto ordenado y fijo, y el flujo de difusión se dirige únicamente hacia el objetivo. Los parámetros de muestreo incluyen dos desplazamientos sigma independientes —12.0 para vídeo y 3.0 para audio—, lo que indica que el modelo gestiona también una componente de audio dentro del mismo proceso de generación; el grado de integración audio-vídeo no está documentado.

No se ha publicado información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí consta es que el checkpoint incorpora su propia destilación a 8 pasos, de forma que no requiere LoRAs turbo ni de tier para funcionar con ese número de pasos. El proceso aplicado por el autor es exclusivamente de compresión: cuantización de pesos a 4 bits con activaciones int8 asimétricas sobre el fichero bf16 de FastVideo, más una poda («pruned») heredada del checkpoint de origen. La validación de la cuantización reporta 423 comprobaciones superadas, 0 fallidas y 1 omitida, ejecutadas con comfy-kitchen 0.2.39.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video declarado en HuggingFace).
- Generación de vídeo condicionada por referencias de imagen (reference-to-video, variante ref2va), con referencias ordenadas y fijas.
- Generación conjunta con componente de audio, evidenciada por el parámetro de desplazamiento sigma de audio (3.0).
- Muestreo en 8 pasos sin CFG, lo que reduce a la mitad el número de evaluaciones del modelo respecto a un esquema con guidance.
- Integración nativa en ComfyUI mediante el nodo de modelos de difusión y el layout de cuantización `AsymW4A8Int8Layout`.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Cobertura multilingüe de prompts: no disponible.

## Casos de uso

- **Previsualización rápida de storyboards**: con 8 pasos y CFG 1.0, cada iteración requiere solo ocho evaluaciones del modelo, lo que permite generar varias versiones de un plano en el tiempo que antes costaba una sola pasada, útil para decidir encuadre y ritmo antes de producir.
- **Series cortas con personaje consistente**: el modo reference-to-video con referencias ordenadas fijas permite mantener la identidad visual de un personaje entre planos aportando las mismas imágenes de referencia en cada generación.
- **Prototipado de anuncios**: sustituir el render 3D preliminar por clips generados a partir de referencias de producto y un prompt de escena, reduciendo el coste de las rondas de revisión con el cliente.
- **Contenido para redes sociales en formato vertical**: el pipeline text-to-video del modelo permite generar clips cortos iterando el prompt, y el tamano de 16,55 GB hace viable ejecutarlo en una estación de trabajo con una única GPU de 24 GB.
- **Investigación en cuantización y destilación**: comparar cualitativamente las salidas de este W4A8 con el bf16 de `FastVideo/FastH3-Omni-Comfy` bajo los mismos ajustes (8 pasos, sigma shift 12.0/3.0) para medir la degradación introducida por la compresión a 4 bits.
- **Automatización de pipelines en ComfyUI**: al ser un fichero safetensors que se coloca en `ComfyUI/models/diffusion_models/`, se puede encadenar con nodos de postproceso, upscaling o composición dentro de un grafo reproducible y versionado por script.
- **Generación de B-roll y planos de recurso**: producir planos de relleno a partir de una imagen de referencia de localización (por ejemplo, un interior concreto) para insertar en montaje, evitando rodaje adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una validación de integridad de la cuantización (423 comprobaciones superadas, 0 fallidas, 1 omitida con comfy-kitchen 0.2.39), que no constituye una evaluación de calidad de generación ni una comparación numérica con el checkpoint bf16.

## Requisitos de hardware

- **VRAM para los pesos**: el fichero safetensors ocupa 16,55 GB, por lo que se necesita un mínimo de ~17 GB de VRAM solo para cargar pesos; a ello hay que sumar activaciones y buffers del sampler (no cuantificados). Estimación derivada del tamano de fichero, no publicada por el autor.
- **GPU de 24 GB (RTX 4090, RTX 3090, L4 24 GB)**: es el escenario objetivo razonable; los pesos caben con margen estrecho para activaciones de vídeo, que crecen con la resolución y el número de frames.
- **GPU de 16 GB (RTX 4080, 4070 Ti Super, V100 16 GB)**: muy justo; probablemente exige offload parcial a RAM del sistema y penaliza la latencia.
- **A100 40 GB / 80 GB y H100 80 GB**: holgado, adecuado para lotes o resoluciones mayores.
- **Despliegue**: ComfyUI con comfy-kitchen 0.2.39 (versión con la que se validó el layout de cuantización). vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje y el formato W4A8 propietario no es GGUF.
- **Latencia y throughput**: no disponibles. Cualitativamente, el esquema de 8 pasos sin CFG implica 8 evaluaciones del modelo por muestra, frente a las ~16 de un esquema con guidance de dos pasadas; no hay cifras de tiempos publicadas.

## Comparativa con modelos similares

| Modelo | Formato / precision | Tamano | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| berryber09/FastH3-OmniRef-8step-pruned-w4a8 (este) | safetensors W4A8 (4 bits + int8) | 16,55 GB | 8, CFG 1.0 | MiniMax-H3 Community License | 0 descargas, 2 likes |
| FastVideo/FastH3-Omni-Comfy | safetensors bf16 | 44,24 GB | 8 (checkpoint pruned de origen) | MiniMax-H3 Community License | Repositorio público de FastVideo |
| FastVideo/FastVideo-FastH3-Omni-8-Step-V1 | no disponible (fuente del recibo de conversión) | no disponible | 8 | MiniMax-H3 Community License | Repositorio público de FastVideo, revisión `88d512c5e7cc38dda499fbb65688ce58611f9c80` |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible | MiniMax-H3 Community License | Modelo base, revisión `9bfb6693f2cf6de171db46d1aa586f67d773a1da` |

No se dispone de datos de otros modelos comparables de la misma categoría (reference-to-video de 8 pasos) en la información proporcionada.

## Limitaciones y advertencias

- **Sin validación independiente**: 0 descargas y 2 likes; la única comprobación reportada es la del propio validador de cuantización del autor, no una evaluación de calidad visual o de adherencia al prompt.
- **Degradación por cuantización no cuantificada**: no se ha publicado ninguna comparación objetiva entre este W4A8 y el bf16 de origen; es esperable cierta pérdida de detalle fino, pero su magnitud es desconocida.
- **Artefactos de generación**: como todo modelo de difusión de vídeo, puede producir inconsistencias temporales, deformaciones anatómicas y desviaciones respecto al prompt. No hay datos publicados sobre tasa de fallo.
- **Dependencia de versión**: el layout `AsymW4A8Int8Layout` requiere comfy-kitchen 0.2.39; versiones distintas de la librería pueden no cargar el fichero.
- **Idiomas de prompt**: no disponibles; no se puede garantizar el comportamiento con prompts en castellano.
- **Restricciones de licencia**: hereda la MiniMax-H3 Community License Agreement, que no se reproduce en el repositorio. Antes de uso comercial es obligatorio revisar el texto íntegro en la página de `MiniMaxAI/MiniMax-H3`; el campo `license: other` de HuggingFace no refleja los términos reales.
- **Ámbito limitado**: no soporta tool calling, agentes ni razonamiento; no debe evaluarse como sustituto de un LLM.
- **Trazabilidad**: el autor no documenta la metodología exacta de poda ni qué componentes se eliminaron del checkpoint original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/berryber09/FastH3-OmniRef-8step-pruned-w4a8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint bf16 de origen (cuantizado): https://huggingface.co/FastVideo/FastH3-Omni-Comfy
- Fuente del recibo de conversión: https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3

La búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
