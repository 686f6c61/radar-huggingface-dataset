# LiquidAI/LFM3-VL-2B-MLX-bf16

## Resumen

LFM3-VL-2B-MLX-bf16 es la conversión a formato MLX en precisión BF16 del modelo multimodal LFM3-VL-2B de Liquid AI, pensada específicamente para inferencia en chips de Apple Silicon. Liquid AI es una empresa surgida del MIT que diseña lo que denomina "Liquid Foundation Models", una familia de modelos con arquitecturas propias orientadas a eficiencia en despliegue on-device. Este repositorio no introduce pesos nuevos: reproduce en MLX los pesos del modelo base con 1.918.181.888 parámetros (aproximadamente 1,9 mil millones) en BF16 sin cuantizar, ocupando 3,84 GB en disco.

El modelo resuelve la tarea image-text-to-text, es decir, recibe imágenes y texto y genera respuestas en lenguaje natural, con soporte de razonamiento explícito opcional (modo thinking). Su relevancia actual radica en que permite ejecutar un modelo visión-lenguaje de casi 2B parámetros en un Mac con memoria unificada, sin GPU dedicada ni servidores en la nube, lo que facilita prototipado local, procesamiento de documentos sensibles sin salida de datos y aplicaciones de escritorio.

La ficha cubre la variante MLX-BF16; la arquitectura, el entrenamiento y los benchmarks corresponden al modelo base LiquidAI/LFM3-VL-2B, del cual esta versión es una conversión de formato. La licencia es LFM1.0 (etiquetada como "other" en Hugging Face), con 17 idiomas declarados y más de 3.000 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; el repo usa `custom_code` y la etiqueta `lfm3_vl`) |
| Parámetros totales | 1.918.181.888 (≈1,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 sin cuantizar en este repo; el modelo base dispone de variantes cuantizadas (etiqueta `base_model:quantized`) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors en MLX (BF16), 3,84 GB |
| Pipeline | image-text-to-text |
| Librería | mlx (requiere mlx-vlm >= 0.7.11) |
| Modalidad de entrada | imagen + texto |
| Modelo base | LiquidAI/LFM3-VL-2B |
| Tamaño del repo | 3,9 GB |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens, ni si se aplicaron RLHF, DPO u otras etapas de alineación). La model card de esta conversión remite explícitamente a la model card original de LiquidAI/LFM3-VL-2B para los detalles de arquitectura y uso, y no los reproduce. Las etiquetas del repositorio (`liquid`, `lfm3`, `lfm3_vl`) confirman que pertenece a la familia LFM3 de Liquid AI, pero no aportan especificaciones técnicas concretas.

Lo que sí es verificable es el proceso de esta variante: se trata de una conversión de los pesos del modelo base a BF16 en el formato MLX, sin cuantización adicional, para su ejecución en Apple Silicon mediante la librería mlx-vlm. El repositorio incluye código personalizado (`custom_code`) necesario para cargar la arquitectura específica del modelo. No se documenta en esta información ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del modo de razonamiento opcional que se activa con `--enable-thinking`.

## Capacidades

- Generación de texto e imagen-a-texto: describe, analiza y responde preguntas sobre imágenes.
- Modo de razonamiento (thinking) opcional: desactivado por defecto; se activa con `--enable-thinking`. Adecuado para tareas que requieren pasos intermedios de razonamiento.
- Conversación multi-turno: la etiqueta `conversational` indica soporte de diálogo.
- Multilingüismo: 17 idiomas declarados, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución on-device en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento por pasos, pero no se documenta integración de agentes.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripción y etiquetado de imágenes en local: procesar lotes de imágenes en un Mac sin enviar datos a la nube, usando el pipeline image-text-to-text con prompts de descripción; adecuado por el tamaño reducido (3,84 GB) y la ejecución en memoria unificada.
- Asistente de accesibilidad: generar descripciones textuales de imágenes para usuarios con discapacidad visual, aprovechando el modo conversacional y el soporte multilingüe para adaptar la salida al idioma del usuario.
- Extracción de información de documentos escaneados: formular preguntas sobre capturas, facturas o formularios y obtener respuestas en texto; el modelo base es multimodal y este formato permite integrarlo en una app de escritorio macOS.
- Prototipado rápido de aplicaciones visión-lenguaje: validar ideas de producto con mlx-vlm antes de migrar a un despliegue en servidor con el modelo base, reduciendo costes de infraestructura durante la fase de desarrollo.
- Análisis de imágenes en investigación con datos sensibles: trabajar con imágenes médicas, industriales o personales que no pueden salir del dispositivo, gracias a la inferencia totalmente local.
- Automatización de tareas de razonamiento visual: usar `--enable-thinking` para tareas que requieren pasos intermedios, como interpretar gráficos, comparar imágenes o resolver preguntas de varios saltos sobre una imagen.
- Soporte multilingüe en atención al cliente basada en imágenes: un usuario envía una foto de un producto o error y el modelo responde en su idioma (17 idiomas disponibles), con temperatura baja (0,1) para respuestas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos BF16 ocupan 3,84 GB; se necesita memoria adicional para el contexto y las activaciones, por lo que conviene disponer de al menos 8 GB de memoria unificada, y 16 GB para contextos largos o prompts con imágenes de alta resolución.
- Plataforma: exclusivamente Apple Silicon (MLX); no funciona en GPU NVIDIA ni en CPU x86 con esta librería.
- GPU recomendadas: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No aplica a A100, H100 ni RTX 4090 con este repositorio.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no está pensado para GPU de consumo NVIDIA en este formato.
- Opciones de despliegue: mlx-vlm >= 0.7.11 (`python -m mlx_vlm.generate`); para otros entornos, usar el modelo base LiquidAI/LFM3-VL-2B con sus formatos correspondientes.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-bf16 (este) | 1,9 B | no disponible | imagen + texto | LFM1.0 | Hugging Face, MLX |
| LiquidAI/LFM3-VL-2B (base) | 1,9 B | no disponible | imagen + texto | LFM1.0 | Hugging Face |
| Alternativas de ~2B visión-lenguaje | no disponible | no disponible | imagen + texto | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores de la misma categoría, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo Apple Silicon: este repositorio usa MLX y no puede desplegarse en GPU NVIDIA, TPU ni CPU x86; para esos entornos hay que usar el modelo base en otro formato.
- Licencia LFM1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es imprescindible revisar el archivo LICENSE antes de integrarlo en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o respuestas inventadas sobre imágenes, especialmente con imágenes ambiguas o de baja calidad; conviene validar en dominios críticos.
- Contexto: no se documenta la longitud máxima de contexto, lo que dificulta planificar conversaciones largas o prompts con muchas imágenes.
- Idiomas: aunque se declaran 17 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en idiomas distintos del inglés puede ser inferior.
- Sin benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni métricas multimodales, lo que limita la evaluación objetiva frente a alternativas.
- Tool calling y agentes: no se documenta soporte, por lo que no debe asumirse en diseños de producción.
- Modelo de 1,9 B: capacidad limitada para razonamiento complejo, matemáticas avanzadas o generación de código extensa en comparación con modelos de mayor tamaño.
- Temperatura recomendada baja (0,1): la configuración de ejemplo prioriza determinismo sobre creatividad; ajustar según el caso de uso.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-bf16/blob/main/LICENSE
