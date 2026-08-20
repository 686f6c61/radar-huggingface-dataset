# cs-mshah/decompose_grounded_ema_gbs32_4n_b200

## Resumen

LayerGen — Decompose es un modelo de descomposición de capas de video desarrollado por el equipo de investigación de LayerGen. Dado un video compuesto y una máscara de objeto, predice las capas de primer plano (foreground) y fondo (background), lo que permite tareas como eliminación de objetos o extracción de sujetos. El modelo se construye sobre Wan2.2-14B, un difusión transformer de 14 mil millones de parámetros, y se entrena específicamente para la tarea de descomposición en lugar de generación general.

El checkpoint publicado (`decompose_grounded_ema_gbs32_4n_b200`) contiene los pesos EMA del paso 4000 de entrenamiento, guardados en formato PyTorch Distributed Checkpoint (DCP) con solo el transformer, mientras que el VAE y el text encoder se cargan desde una instalación local de Wan2.2-14B. El modelo se entrena a 480×832 píxeles y 41 fotogramas (11 latentes), con un flujo de desplazamiento de 3.0. Está disponible bajo una licencia de investigación preliminar, no para uso comercial directo.

La relevancia actual de este modelo radica en su capacidad para resolver un problema fundamental en edición de video: separar de forma limpia los objetos del fondo en secuencias temporales, algo que tradicionalmente requiere herramientas de rotoscopia manual o métodos de matting por fotograma. Su enfoque basado en difusión y entrenamiento específico para esta tarea lo hace especialmente útil en flujos de postproducción y generación de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer multi-stream (basado en Wan2.2-14B, 40 capas, 5120 dimensiones) |
| Parametros totales | 14B (Wan2.2-14B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 almacenado, bf16 en ejecución (no se documentan cuantizaciones de menor precisión) |
| Idiomas soportados | no disponible |
| Licencia | research-preview-see-card (uso de investigación, restringido) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) con shards de solo el transformer; no safetensors |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer de múltiples flujos que opera sobre latentes de vídeo. La base es Wan2.2-14B, que incluye un DiT de 40 capas y 5120 dimensiones, un VAE `AutoencoderKLWan` y un text encoder `UMT5EncoderModel`. Para la tarea de descomposición, el modelo recibe como entrada un vídeo compuesto y una máscara de objeto, y predice dos flujos de salida: el primer plano y el fondo. El entrenamiento se realizó en 4 nodos con GPU B200, con un batch size global de 32, a una resolución de 480×832 y 41 fotogramas (11 latentes temporales). Se usaron captions de tipo "grounded editcap2" para condicionar la generación. El checkpoint corresponde a los pesos EMA del paso 4000.

Una innovación técnica destacable es la extensión temporal mediante interpolación de RoPE para muestrear clips más largos (61 o 81 fotogramas) a partir de un modelo entrenado con 41 fotogramas, ajustando el factor `FASTVIDEO_ROPE_T_INTERP`. No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado con datos de composición.

## Capacidades

- Descomposición de vídeo en capas: dado un vídeo compuesto y una máscara de objeto, genera el primer plano y el fondo por separado.
- Eliminación de objetos: produce una placa limpia (fondo) sin el objeto marcado.
- Extracción de primer plano: obtiene el objeto aislado con transparencia (matte) listo para composición.
- Extensión de longitud temporal: permite generar clips de 61 o 81 fotogramas mediante interpolación de RoPE temporal.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multilingüe.

## Casos de uso

- Postproducción cinematográfica: eliminar objetos no deseados de una toma (micrófonos, cables, actores extra) y obtener un fondo limpio para composición.
- Composición de vídeo para anuncios: separar un producto del fondo y reemplazarlo por un escenario virtual.
- Restauración de material de archivo: limpiar elementos no deseados en grabaciones históricas.
- Generación de contenido para redes sociales: extraer un sujeto para crear vídeos con fondo transparente.
- Análisis de vídeo: aislar un objeto para seguimiento o análisis posterior sin interferencias del fondo.
- Realidad aumentada: separar objetos del entorno para integrarlos en aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo se ejecuta en bf16 con aproximadamente 28 GB de pesos, pero se requiere una GPU con 80 GB de VRAM para cargar el modelo completo y los buffers de activación.
- GPUs compatibles: A100-80G, H100, H200, B200.
- No cabe en GPUs de consumo (RTX 4090, 3090) debido a la VRAM mínima de 80 GB.
- Despliegue: se usa el framework FastVideo con el módulo `infer_layer_decomp.py`; no se soporta vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables con la misma tarea específica de descomposición de capas de vídeo en la información proporcionada. No hay datos públicos de otros sistemas de descomposición de vídeo basados en difusión para comparar.

## Limitaciones y advertencias

- Licencia restrictiva: solo para investigación, no comercial; se requiere contacto con los autores para otros usos.
- Dependencia de la base Wan2.2: la licencia de Wan-AI aplica al modelo base.
- Requiere código interno no público: la inferencia necesita una rama específica de FastVideo con el stack de layer-decomp, no accesible a la comunidad.
- Solo descompone vídeo: no genera vídeo de nuevo, solo separa capas a partir de una entrada con máscara.
- Resolución y tamaño de fotogramas fijos: entrenado a 480×832 y 41 fotogramas; la extensión a más fotogramas requiere ajuste manual de RoPE y no se garantiza la calidad.
- Sesgos y alucinaciones: no documentados; al ser un modelo de difusión, puede producir artefactos en regiones inciertas del fondo.
- Almacenamiento grande: 57.2 GB en el repositorio (fp32), aunque la ejecución en bf16 reduce a 28 GB.

## Enlaces

- HuggingFace: https://huggingface.co/cs-mshah/decompose_grounded_ema_gbs32_4n_b200
- No se proporcionan otros enlaces (papers, repos, demos) en la información disponible.
