# sandpies/10Eros-Max-H3-8stepTURBO-beta7-int8-GPTQ

## Resumen

10Eros Max H3 8-step TURBO beta7 (int8 GPTQ) es una cuantización int8, publicada por el usuario sandpies, del checkpoint "10Eros Max H3 8-step TURBO beta7" creado por tenstrip, a su vez derivado de MiniMax-H3. No se trata de un modelo de lenguaje, sino de un modelo de difusión en formato de archivo único para ComfyUI, orientado a la generación de imágenes (el propio repositorio lo etiqueta como `diffusion-single-file`). El problema que resuelve es el tamaño y consumo de memoria del checkpoint original: el archivo original en bf16 ocupa 40,2 GB, mientras que esta versión cuantizada se reduce a 22,5 GB, manteniendo una calidad de reconstrucción medida y documentada.

La relevancia de esta ficha radica en el proceso de cuantización: se emplea GPTQ int8 con calibración sobre activaciones reales capturadas del propio modelo (30 prompts a aproximadamente 1 megapíxel, 6 segundos cada uno), con rotación Hadamard-256 y escalas fp32 por canal de salida. El autor publica métricas de error de reconstrucción por capa (NRMSE) comparadas contra la cuantización round-to-nearest (RTN) int8, mostrando reducciones de error de entre el 38 % y el 61 % según el tipo de capa. Es un ejemplo riguroso de cuantización post-entrenamiento documentada para modelos de difusión de gran tamaño.

Cabe destacar que el modelo base es un derivado de MiniMax-H3, por lo que hereda la MiniMax-H3 Community License Agreement, una licencia de comunidad con condiciones específicas que conviene revisar antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión derivado de MiniMax-H3 (detalles de arquitectura no disponibles) |
| Parámetros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ int8 (con bloques 0, 1, 48 y 49 en bf16); original en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (other) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

Datos adicionales:

| Parámetro | Valor |
|---|---|
| Tamaño del archivo cuantizado | 22,5 GB |
| Tamaño del checkpoint original (bf16) | 40,2 GB |
| Capas cuantizadas | 184 lineales (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2` en bloques 2-47) |
| Bloques en bf16 | 0, 1, 48 y 49 |
| Calibración | 30 prompts (~1 MP, 6 s cada uno); 24 para ajuste, 6 reservados para validación |
| Descargas / likes | 486 descargas, 2 likes |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo, pero los metadatos indican que se trata de un modelo de difusión distribuido como archivo único (`diffusion-single-file`) para su uso en ComfyUI, derivado de MiniMax-H3. La estructura de capas revelada por la cuantización (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2` en bloques numerados del 0 al 49) sugiere una red de 50 bloques con atención y MLP en cada uno, aunque el autor no publica detalles adicionales sobre tipo de atención, resoluciones soportadas ni pipeline exacto.

Respecto al entrenamiento, no hay información disponible en la model card: no se especifican tokens o imágenes de entrenamiento, composición del dataset, ni técnicas de ajuste fino. Lo que sí está documentado con detalle es el proceso de cuantización post-entrenamiento: GPTQ int8 con rotación Hadamard de 256 dimensiones, pesos int8 con escalas fp32 por canal de salida, y metadatos `comfy_quant` por capa. La calibración se realizó sobre activaciones reales capturadas del modelo en rango bf16 completo, con 24 prompts para el ajuste de la cuantización y 6 reservados exclusivamente para medir el error en datos no vistos (held-out), una práctica metodológicamente correcta que evita sobreajuste de la calibración.

## Capacidades

- Generación de imágenes mediante difusión, en formato de archivo único integrable en ComfyUI.
- Flujo de trabajo "8-step TURBO": la denominación del checkpoint original sugiere generación acelerada en pocos pasos (8 pasos), aunque el autor no documenta este aspecto en detalle.
- Ejecución con footprint de memoria reducido respecto al checkpoint bf16 original (22,5 GB frente a 40,2 GB) gracias a la cuantización GPTQ int8.
- Cuantización selectiva: los bloques 0, 1, 48 y 49 permanecen en bf16, presumiblemente para preservar calidad en capas sensibles.
- Metadatos `comfy_quant` por capa, lo que permite a ComfyUI gestionar la dequantización de forma nativa.
- No hay información disponible sobre capacidades de texto, código, visión, tool calling, agentes ni soporte multilingüe: no aplica al ser un modelo de difusión.

## Casos de uso

- Generación de imágenes local en ComfyUI: el archivo se coloca en `ComfyUI/models/diffusion_models/` y se usa directamente en workflows de difusión, con un consumo de VRAM sustancialmente menor que el checkpoint bf16 de 40,2 GB.
- Generación acelerada en pocos pasos: la variante "8-step TURBO" del checkpoint original está pensada para producir imágenes en torno a 8 pasos de muestreo, útil para iteración rápida de prompts.
- Producción de contenido en estaciones de trabajo con GPU de gama alta: al reducirse el peso a 22,5 GB, el modelo puede cargar en GPUs con 24-32 GB de VRAM que no podrían alojar el original en bf16.
- Experimentación con cuantización de modelos de difusión: la model card documenta método, calibración y métricas de error, lo que la hace útil como referencia para quien desarrolle sus propios quant GPTQ de modelos de difusión.
- Validación de calidad de cuantización: las cifras NRMSE por capa frente a RTN permiten estimar qué capas son más sensibles antes de desplegar, sin necesidad de benchmarks end-to-end propios.
- Integración en pipelines automatizados de generación de imágenes: al ser un archivo safetensors estándar de ComfyUI, puede usarse en flujos batch o API de ComfyUI para generación programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks end-to-end en la información disponible. El autor publica únicamente métricas de error de reconstrucción por capa (NRMSE) de la cuantización GPTQ int8 comparada contra round-to-nearest int8 en las mismas capas, medidas sobre los 6 prompts de validación (held-out):

| Capa | Reducción de error vs RTN |
|---|---|
| `attn.qkv_proj` | ~61 % |
| `mlp.fc1` | ~60 % |
| `attn.out_proj` | ~57 % |
| `mlp.fc2` | ~38 % (capa individual más baja: 17 %, bloque 30) |

Estos son números por capa; no existe ningún benchmark de calidad de imagen final (FID, CLIP score, preferencia humana) publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El archivo pesa 22,5 GB, por lo que se necesita al menos esa capacidad de carga; en la práctica, una GPU con 24 GB de VRAM (por ejemplo RTX 3090, RTX 4090) es el mínimo plausible, siendo preferibles GPUs de 32 GB o más (RTX 5090, A100, H100) para trabajar con resoluciones en torno a 1 MP con holgura.
- GPU recomendadas: RTX 4090 (24 GB) como mínimo realista; RTX A6000, RTX 6000 Ada, A100 o H100 para mayor margen. La cuantización int8 está orientada a hardware NVIDIA con soporte eficiente de operaciones int8.
- Consumer GPUs: cabe en una RTX 3090 o RTX 4090 de 24 GB en el límite, probablemente con offload parcial a RAM según la configuración de ComfyUI; no cabe cómodamente en GPUs de 16 GB.
- Opciones de despliegue: ComfyUI (formato nativo `diffusion-single-file` con metadatos `comfy_quant`). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La denominación "8-step TURBO" del checkpoint original sugiere inferencia en aproximadamente 8 pasos de muestreo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros Max H3 8-stepTURBO beta7 int8 GPTQ (este) | Difusión (derivado de MiniMax-H3) | GPTQ int8 | 22,5 GB | MiniMax-H3 Community License | Hugging Face, archivo único ComfyUI |
| 10Eros Max H3 8-stepTURBO beta7 (original de tenstrip) | Difusión (derivado de MiniMax-H3) | bf16 | 40,2 GB | MiniMax-H3 Community License | Hugging Face (referenciado) |
| MiniMax-H3 (base) | Base según MiniMaxAI | bf16 (no disponible el tamaño exacto) | no disponible | MiniMax-H3 Community License | Hugging Face: MiniMaxAI/MiniMax-H3 |

La comparación más relevante es con su propio checkpoint original en bf16: la versión int8 GPTQ reduce el tamaño un 44 % aproximadamente (de 40,2 GB a 22,5 GB) con errores de reconstrucción por capa documentados, a costa de no disponer de validación end-to-end de calidad.

## Limitaciones y advertencias

- No existe validación end-to-end de calidad: las métricas publicadas son de reconstrucción por capa (NRMSE), no de calidad de imagen final. Puede haber degradación perceptible no cuantificada.
- La capa con menor mejora frente a RTN (`mlp.fc2`, con una capa individual que solo mejora un 17 % en el bloque 30) indica que algunas capas son más difíciles de cuantizar; conviene verificar visualmente los resultados en los propios workflows.
- La calibración se realizó con 30 prompts a ~1 MP y 6 segundos: el rendimiento de la cuantización puede degradarse fuera de esa distribución (otras resoluciones, duraciones o estilos de prompt).
- Licencia restrictiva: al ser derivado de MiniMax-H3, está sujeto a la MiniMax-H3 Community License Agreement, que puede imponer condiciones al uso comercial. Es imprescindible revisar el texto de la licencia antes de cualquier despliegue productivo.
- Requisitos de hardware elevados: 22,5 GB de pesos excluyen a la mayoría de GPUs de consumo de gama media.
- Sesgos, riesgo de alucinación y limitaciones de idioma: no disponibles; no se documenta nada al respecto en la model card.
- Proyecto comunitario de pequeño alcance (486 descargas, 2 likes), sin mantenimiento garantizado ni soporte oficial de MiniMaxAI o de tenstrip.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandpies/10Eros-Max-H3-8stepTURBO-beta7-int8-GPTQ
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo original de tenstrip (10Eros Max H3): no disponible (no se proporciona URL directa)
