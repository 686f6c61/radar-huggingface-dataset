# mars2titan/amiko-hermit-1.0-27b-vl-mlx-3bit

## Resumen

Amiko Hermit 1.0 es un modelo de visión-lenguaje (VLM) de 27B parámetros, fine-tuneado a partir de Qwen3.8-27B y especializado en uso de herramientas (tool use). El autor, mars2titan, ha convertido el checkpoint a un formato MLX mixto de 3 bits para ejecutarse en Apple Silicon, concretamente en Macs con 16 GB de memoria unificada. Este modelo resuelve el problema de ejecutar un VLM de gran tamaño con capacidades de llamada a funciones en hardware de consumo, manteniendo un equilibrio entre tamaño y rendimiento.

La relevancia actual del modelo reside en que permite desplegar agentes que interpretan imágenes y llaman herramientas en equipos locales sin GPU dedicada, gracias a la cuantización agresiva y a la librería mlx-vlm. El fine-tune se realizó sobre trazas de OpenHermit, un dataset de interacciones de agentes, con QLoRA, lo que mejora sustancialmente la validez del JSON generado en las llamadas a herramientas respecto al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-language (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 27B (nominal, base Qwen3.8-27B); 3.994.946.800 reportados en safetensors MLX cuantizados |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixto 3/4-bit (affine, group size 64, 3.91 bits/peso); vision encoder en bfloat16 |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (3 shards) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 vision-language, un transformer multimodal que procesa texto e imágenes. La variante base, Qwen3.8-27B, se ha fine-tuneado con QLoRA (r=16, α=32) durante 1 época y 250 pasos sobre trazas de OpenHermit, un dataset orientado a llamadas de herramientas. El entrenamiento redujo la pérdida de 3.18 a 0.62 y mejoró la precisión de token del 47% al 85%.

La cuantización es mixta: la capa de lenguaje usa 3 bits, con 4 bits en las proyecciones sensibles (`down_proj`, `v_proj`) y en `embed_tokens` y `lm_head`. El encoder de visión se deja en bfloat16 porque mlx-vlm omite los módulos multimodales en la cuantización. El promedio es de 3.91 bits por peso, lo que reduce el checkpoint a aproximadamente 12 GB en disco.

## Capacidades

- Generación de texto y descripción de imágenes (pipeline image-text-to-text).
- Llamada de herramientas (tool use) con generación de JSON válido para invocar funciones.
- Soporte de conversaciones multi-turno (chat).
- Capacidades multimodales: entrada de imágenes y texto, salida de texto.
- Soporte de agentes mediante el servidor integrado de mlx-vlm (`mlx_vlm.server`), que expone una API para integraciones.
- Multilingüismo limitado: la model card solo declara inglés, aunque el modelo base Qwen3.8 podría soportar más idiomas.

## Casos de uso

- **Agentes de automatización visual**: el modelo puede analizar capturas de pantalla o imágenes y llamar a herramientas (por ejemplo, APIs de gestión de tareas) para ejecutar acciones, gracias a su fine-tune en trazas de herramientas.
- **Asistentes de atención al cliente**: integrado en un servidor mlx-vlm, puede procesar imágenes de productos y responder consultas, generando llamadas a sistemas de pedidos o facturación.
- **Análisis de documentos con extracción de datos**: convierte facturas o recibos en texto estructurado y luego invoca herramientas de contabilidad para registrar transacciones.
- **Automatización de flujos de trabajo en Mac**: al ejecutarse en Apple Silicon con 16 GB de RAM, se puede desplegar en entornos locales de desarrollo para pruebas de agentes multimodales sin coste de GPU en la nube.
- **Generación de código guiada por imagen**: un desarrollador puede mostrar un esquema o diagrama y pedir al modelo que genere código, aprovechando las capacidades de razonamiento de Qwen3.8.
- **Investigación en tool learning**: el checkpoint 3-bit permite experimentar con técnicas de cuantización agresiva en modelos de 27B y evaluar el impacto en la calidad de las llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. La model card incluye una evaluación propia de llamadas a herramientas, realizada sobre el checkpoint de 4 bits (260 llamadas, greedy, 256 tokens nuevos). El checkpoint de 3 bits no ha sido evaluado aún.

| Métrica | Modelo base | Hermit 4-bit | Hermit 3-bit |
|---|---|---|---|
| JSON válido | 94/260 (36%) | 250/260 (96%) | no evaluado |
| Nombre de herramienta exacto | 56/260 (22%) | 156/260 (60%) | no evaluado |

## Requisitos de hardware

- **Memoria**: pico de 13.7 GB de memoria unificada durante la generación en un M5 Max; pensado para Macs con 16 GB de RAM.
- **GPU**: requiere Apple Silicon (M1 o posterior, recomendado M5 Max); no se soportan GPUs NVIDIA o AMD.
- **Almacenamiento**: aproximadamente 12-13.4 GB en disco.
- **Despliegue**: se usa exclusivamente con `mlx-vlm` (tanto para generación como para servidor); `mlx-lm` no es compatible con la parte visual.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Amiko Hermit 1.0 3-bit (este) | 27B | MLX mixto 3/4-bit | no disponible | Apache 2.0 | VLM para tool use, Apple Silicon |
| Amiko Hermit 1.0 4-bit (sibling) | 27B | MLX mixto 4-bit | no disponible | Apache 2.0 | VLM para tool use, ~15 GB, evaluado |
| Qwen3.8-27B (base) | 27B | bfloat16 | no disponible | Apache 2.0 | Modelo base, sin fine-tuning de tool use |

El modelo 3-bit es la versión reducida del sibling 4-bit, pensado para equipos con 16 GB de RAM. La comparación con el modelo base muestra una mejora significativa en la generación de JSON válido y en la precisión del nombre de la herramienta (en la variante 4-bit, que es la que tiene datos).

## Limitaciones y advertencias

- **Calidad no verificada en 3-bit**: la evaluación de llamadas a herramientas solo cubre el checkpoint de 4 bits; el de 3 bits puede degradar el rendimiento.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede inventar nombres de herramientas o parámetros incorrectos, especialmente con cuantización agresiva.
- **Idiomas**: la model card solo declara inglés; el uso en otros idiomas no está garantizado.
- **Hardware restringido**: solo funciona en Apple Silicon; no es compatible con CUDA u otras arquitecturas.
- **Dependencia de mlx-vlm**: es obligatorio usar `mlx-vlm`; el uso de `mlx-lm` dará resultados incorrectos.
- **Limitación de contexto**: no se ha publicado la longitud de contexto, lo que puede dificultar la planificación de despliegue en aplicaciones de producción.
- **Registro de descargas**: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica un uso muy limitado y poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mars2titan/amiko-hermit-1.0-27b-vl-mlx-3bit
- Sibling 4-bit: https://huggingface.co/mars2titan/amiko-hermit-1.0-27b-vl-mlx-4bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Proyecto unsloth (herramienta de entrenamiento, mencionado en la búsqueda): https://github.com/unslothai/unsloth
- Página de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
