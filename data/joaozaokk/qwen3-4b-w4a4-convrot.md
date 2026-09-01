# JoaoZaokk/Qwen3-4B-W4A4-ConvRot

## Resumen

El modelo JoaoZaokk/Qwen3-4B-W4A4-ConvRot es una cuantización de 4 bits en peso y activación (W4A4) del text encoder del modelo Qwen3-4B, desarrollado por JoaoZaokk específicamente para su uso como codificador de texto en ComfyUI, dentro del pipeline de acondicionamiento Lumina2 / Z-Image. El archivo reduce el tamaño del text encoder de 7.49 GiB a 2.42 GiB (3.09x más ligero), cuantizando 252 de los 398 tensores. Está diseñado para permitir ejecutar el text encoder en GPUs con VRAM limitada, donde el original BF16 no cabe. La cuantización utiliza el formato nativo convrot_w4a4 de ComfyUI, con groupsize 256, y mantiene una fidelidad alta frente al original, con coseno de 0.9896–0.9900 en las pruebas reportadas.

El modelo se distribuye como un archivo safetensors estándar, compatible con ComfyUI, y se basa en el modelo Qwen/Qwen3-4B, un transformer denso de 4 mil millones de parámetros. La cuantización se realizó con la herramienta comfy-kitchen, que aplica el formato convrot_w4a4. Aunque en ComfyUI estándar no ofrece ganancia de velocidad (solo de memoria), liberando dos bloqueos internos del código se puede acelerar la inferencia para prompts largos, superando incluso al original BF16 a partir de ~850 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (text encoder de Qwen3-4B) cuantizado W4A4 |
| Parametros totales | 4B (modelo base Qwen3-4B); el archivo contiene solo el text encoder cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A4 (4-bit peso, 4-bit activación), formato convrot_w4a4, groupsize 256 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tensores I8 para pesos cuantizados, F32 para escalas) |

## Arquitectura y entrenamiento

El modelo es una conversión del text encoder de Qwen3-4B, no un entrenamiento nuevo. El modelo base es un transformer denso de 4B parámetros, entrenado por Alibaba Cloud para tareas de lenguaje, codificación y matemáticas. La cuantización se realiza con comfy-kitchen, que aplica el formato convrot_w4a4: cada capa cuantizada almacena el peso como un tensor I8 de forma `[rows, cols/2]` (contenedor INT8 que contiene INT4 con signo) y una escala F32 de forma `[rows]`. Se excluyen por diseño `embed_tokens`, todas las normas, `lm_head` y cualquier torre visual/vision. El resto de tensores se conservan byte a byte del original. No se han publicado datos sobre el dataset de entrenamiento adicional, ya que no existe tal entrenamiento.

## Capacidades

- Codificación de texto para generación de imágenes en ComfyUI, específicamente para el pipeline Lumina2 / Z-Image.
- Soporte de prompts en inglés y chino (según los metadatos del modelo).
- Cuantización W4A4 que reduce el uso de VRAM en un factor de 3.09x frente al BF16 original.
- Compatibilidad nativa con ComfyUI: el archivo se carga como un text encoder estándar y ComfyUI genera los tensores `<layer>.comfy_quant` automáticamente.
- Fidelidad alta frente al original: coseno de 0.9896–0.9900 y rel-RMSE de ~0.14 en las pruebas reportadas.
- Selección automática de kernel: INT4 MMA nativo en GPUs Ampere y Ada (sm_86, sm_89); rama INT8 en Hopper y Blackwell.

## Casos de uso

- Generación de imágenes en ComfyUI con GPUs de gama media: al ocupar solo 2.42 GiB, permite cargar el text encoder junto con el modelo de difusión en tarjetas con 8 GB de VRAM, donde el original BF16 de 7.49 GiB no cabría.
- Ahorro de VRAM en pipelines de difusión que ya consumen mucha memoria: el text encoder cuantizado libera espacio para aumentar la resolución o el batch size.
- Despliegue en entornos de inferencia con restricciones de memoria, como servidores con múltiples modelos cargados simultáneamente.
- Investigación sobre cuantización de text encoders: el repositorio incluye un benchmark detallado con metodología y mediciones ejecutadas, útil para comparar técnicas W4A4.
- Integración en flujos de trabajo de ComfyUI para Lumina2 / Z-Image, donde el text encoder es un componente crítico y su cuantización permite ejecutar el pipeline completo en hardware más modesto.
- Uso en entornos de producción donde el text encoder BF16 no cabe en la VRAM disponible, manteniendo una calidad de acondicionamiento casi idéntica (coseno > 0.989).

## Benchmarks y rendimiento

La model card reporta mediciones de fidelidad y velocidad, todas ejecutadas en hardware real.

**Fidelidad frente al original BF16** (RTX 3090, mismas prompts y tokenizer):

| Prompt | Shape | rel-RMSE | Coseno |
|---|---|---|---|
| `a red apple on a weathered wooden table, soft window light` | [1, 21, 2560] | 0.1442 | 0.98957 |
| `portrait of an elderly fisherman, weathered face, golden hour` | [1, 21, 2560] | 0.1412 | 0.99001 |
| Tercer prompt, 23 tokens | [1, 23, 2560] | 0.1435 | 0.98968 |

**Velocidad de inferencia** (RTX 3080 Ti, mediana de 3, mismo archivo, solo varía la longitud del prompt). "Locked" es el comportamiento en ComfyUI estándar; "released" con los dos bloqueos internos parcheados:

| Tokens | Locked (ms) | Released (ms) | Ratio |
|---|---|---|---|
| 22 | 80.7 | 120.1 | 1.49x más lento |
| 75 | 100.1 | 105.8 | 1.06x más lento |
| 199 | 151.9 | 95.2 | 1.60x más rápido |
| 424 | 245.2 | 102.0 | 2.40x más rápido |
| 850 | 456.1 | 124.3 | 3.67x más rápido |
| 1496 | 824.5 | 249.0 | 3.31x más rápido |

El cruce de rendimiento se sitúa entre 75 y 199 tokens. A 850 tokens, la ruta liberada de 4 bits también supera al original BF16 (372.1 ms a ~700 tokens frente a 124.3 ms). Además, la rama INT8 (usada en Hopper/Blackwell) es consistentemente más fiel que la INT4 nativa: 1.49x en activaciones Z-Image reales, 1.33x en epsilon por paso y 1.40x en otra familia de modelos. La INT4 nativa gana en throughput de lotes grandes (1.41x–1.67x en M=1024) y pierde en M=1 (1.3x–1.74x más lento).

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 2.42 GiB en disco y en VRAM (pesos cuantizados). Se necesita VRAM adicional para el modelo de difusión y el resto del pipeline.
- GPUs recomendadas: para INT4 nativo se requiere Ampere o Ada (sm_86, sm_89), por ejemplo RTX 3090, RTX 3080 Ti, RTX 4090. En Hopper y Blackwell se usa la rama INT8.
- Compatible con GPUs consumer: sí, siempre que tengan al menos 4 GB de VRAM libres para el text encoder, aunque en la práctica se necesitará más para el modelo de difusión.
- Opciones de despliegue: ComfyUI (carga nativa), y potencialmente otros frameworks que soporten el formato convrot_w4a4. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un LLM completo.
- Entorno de verificación: comfy-kitchen 0.2.31, ComfyUI c1739380 (0.33.0), torch 2.13.0+cu130, CUDA 13.0, GPU RTX 3090 (sm_86).
- Latencia: en ComfyUI estándar, entre 80.7 ms (22 tokens) y 824.5 ms (1496 tokens) en RTX 3080 Ti. Con los bloqueos liberados, entre 95.2 ms (199 tokens) y 249.0 ms (1496 tokens).

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados con el mismo formato convrot_w4a4 para text encoders de Qwen3-4B. La comparativa más relevante es con el text encoder original BF16 y con la ejecución en rama INT8 del mismo archivo:

| Modelo / variante | Tamaño | Coseno vs BF16 | Velocidad (850 tokens, released) | Licencia |
|---|---|---|---|---|
| Qwen3-4B text encoder BF16 (original) | 7.49 GiB | 1.0 | 372.1 ms (a ~700 tokens) | Apache-2.0 |
| Qwen3-4B-W4A4-ConvRot (INT4 nativo) | 2.42 GiB | 0.9896–0.9900 | 124.3 ms | Apache-2.0 |
| Qwen3-4B-W4A4-ConvRot (rama INT8) | 2.42 GiB | mayor fidelidad que INT4 | no medido | Apache-2.0 |

La rama INT8 no es un archivo separado, sino una ruta de ejecución seleccionada automáticamente en GPUs Hopper/Blackwell.

## Limitaciones y advertencias

- En ComfyUI estándar, este archivo solo ahorra memoria, no tiempo. Para obtener ganancia de velocidad es necesario parchear el código (eliminar `full_precision_mm=True` y `comfy_force_cast_weights=True`), lo que no está expuesto en ningún nodo.
- La precisión se degrada frente al BF16: rel-RMSE de ~0.14 y coseno de ~0.99. Al liberar los bloqueos, la degradación aumenta a rel-RMSE de 0.609 (4.23x peor).
- Solo se declaran soportados los idiomas inglés y chino, aunque el modelo base Qwen3-4B soporta más.
- El convertidor se niega a ejecutar si no se usan los backends CUDA de comfy-kitchen, para evitar resultados engañosos con el backend eager.
- No es un modelo de lenguaje completo, sino un text encoder para generación de imágenes; no puede usarse para chat, generación de texto o razonamiento.
- La longitud de contexto no está documentada para este archivo; se desconoce si hereda el contexto del modelo base (32K tokens según el reporte técnico de Qwen3).
- El autor advierte que las mediciones de velocidad dependen fuertemente de la longitud del prompt; para prompts cortos (<75 tokens) la cuantización es más lenta que el original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoZaokk/Qwen3-4B-W4A4-ConvRot
- Repositorio de benchmark y herramientas: https://github.com/JoaoZaokk/comfy-quant-bench
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B-Base
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Página de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
