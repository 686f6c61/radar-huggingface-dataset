# lukaskremla/Qwen3.8-27B-4bit-MLX

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-4bit-MLX` es una conversión completa al formato MLX (Apple Silicon) del modelo multimodal Qwen3.8-27B, desarrollado por el usuario lukaskremla. A diferencia de las conversiones de solo texto, esta versión conserva la torre de visión original y los procesadores de imagen y vídeo, lo que permite procesar entradas de texto, imagen y vídeo mediante la librería `mlx-vlm`. El modelo está cuantizado con precisión de 4 bits (afine, grupo de tamaño 64, método RTN) para reducir el uso de memoria, manteniendo la torre de visión en BF16.

Esta ficha es relevante para desarrolladores e investigadores que trabajan en entornos Apple Silicon y necesitan un modelo multimodal de alto rendimiento con un consumo de memoria reducido. El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8, que destaca por su razonamiento, uso de herramientas y soporte de contexto largo, aunque no se especifican los parámetros exactos del modelo original en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3.8-27B |
| Parametros totales | 4.665.462.000 (según safetensors; el nombre sugiere 27B, pero no se confirma) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el tag indica "long-context") |
| Tipos de cuantizacion | 4-bit affine (group size 64, RTN); torre de visión en BF16 |
| Idiomas soportados | Inglés (según model card; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión MLX del checkpoint Qwen/Qwen3.8-27B, que es un modelo de lenguaje multimodal (procesa texto, imagen y vídeo). La arquitectura subyacente corresponde a un transformer con componentes de visión, aunque no se detallan los parámetros exactos de la red en la información proporcionada. La conversión aplica cuantización solo a los pesos de las capas lineales del modelo de lenguaje (4-bit affine, group size 64, redondeo al más cercano), mientras que la torre de visión y otros tensores no cuantizados se mantienen en BF16. El drafter MTP (Multi-Token Prediction) no está incluido en el checkpoint principal, pero se ofrecen sidecars compatibles en una colección separada para habilitar decodificación especulativa.

No se dispone de información sobre el proceso de entrenamiento del modelo base, como el número de tokens o la composición del dataset. La cuantización se realizó con la herramienta `mlx-vlm` versión 0.6.13 y `mlx` 0.32.0, sin que se indique si se aplicó algún ajuste posterior (RLHF, DPO, etc.).

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imagen y vídeo, gracias a la torre de visión y los procesadores incluidos.
- Generación de texto conversacional y de razonamiento, heredada del modelo base Qwen3.8-27B.
- Soporte de tool use (llamada a funciones), según los tags del repositorio.
- Contexto largo: el tag "long-context" sugiere que maneja ventanas de contexto extendidas, aunque no se especifica el valor exacto.
- Multilingüe: aunque la model card indica inglés, el modelo base es multilingüe, por lo que es probable que mantenga esa capacidad.
- Decodificación especulativa: compatible con el drafter MTP opcional para acelerar la inferencia.
- Cuantización 4-bit: reduce el uso de memoria y permite ejecución en hardware con recursos limitados, especialmente en Apple Silicon.

## Casos de uso

- Asistente virtual multimodal en macOS: gracias a su formato MLX y soporte de visión, puede integrarse en aplicaciones de escritorio que respondan a preguntas sobre imágenes o vídeos capturados con la cámara, usando `mlx-vlm` para inferencia local.
- Análisis de documentos con imágenes: el modelo puede extraer información de capturas de pantalla, diagramas o documentos escaneados, combinando razonamiento textual con comprensión visual, útil en entornos de oficina o investigación.
- Automatización de atención al cliente con contexto visual: al soportar tool use y conversación multi-turno, puede gestionar consultas que incluyan imágenes de productos o errores, y llamar a APIs externas para resolver incidencias.
- Generación de descripciones accesibles: a partir de imágenes o vídeos, el modelo puede crear descripciones detalladas para personas con discapacidad visual, aprovechando su capacidad de razonamiento y generación de texto.
- Desarrollo de agentes con razonamiento multi-paso: su capacidad de razonamiento y uso de herramientas permite construir agentes que planifiquen y ejecuten tareas complejas, como búsqueda de información en bases de datos o navegación web.
- Prototipado de aplicaciones de vídeo-inteligencia: el soporte de entrada de vídeo permite analizar secuencias para tareas como resumen de contenido, detección de eventos o moderación, en entornos de investigación o producción ligera.
- Inferencia local en portátiles Apple: al estar cuantizado en 4-bit, puede ejecutarse en MacBooks con memoria unificada de 16 GB o más, facilitando el desarrollo y pruebas sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para esta conversión cuantizada. El rendimiento dependerá del hardware y de la configuración de decodificación especulativa, pero no hay datos numéricos para citar.

## Requisitos de hardware

- Tamaño del repositorio: 16.1 GB, lo que sugiere que el modelo completo (con pesos cuantizados) requiere al menos 16 GB de memoria para cargarse en RAM/VRAM.
- VRAM estimada para inferencia: con cuantización 4-bit, se estima un uso de memoria de aproximadamente 14-16 GB, dependiendo del contexto y de la torre de visión en BF16. En Apple Silicon, la memoria unificada debe ser de al menos 16 GB para un funcionamiento fluido.
- GPU recomendadas: en hardware Apple, cualquier chip M1 Pro/Max o superior con 16 GB o más; en GPUs NVIDIA, se necesitaría una tarjeta con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40 GB) para cargar el modelo completo, aunque el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: se puede servir mediante el servidor compatible con OpenAI incluido en `mlx-vlm` (`mlx_vlm.server`), o integrarse en aplicaciones Python usando la librería `mlx-vlm`. También es posible usar decodificación especulativa con el drafter MTP para mejorar el throughput.
- Latencia y throughput: no disponibles; dependerán del hardware y de la configuración (activación de MTP, tamaño de lote, etc.).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparación cuantitativa con otras conversiones cuantizadas de modelos multimodales en MLX. Como referencia cualitativa, el modelo base Qwen3.8-27B (sin cuantizar) ofrecería mayor fidelidad, pero con un uso de memoria significativamente mayor (aproximadamente 54 GB en BF16). Otras alternativas multimodales en MLX, como versiones cuantizadas de LLaVA o InternVL, podrían ser comparables, pero no se dispone de información concreta en la documentación proporcionada. Se recomienda consultar la colección `Qwen 3.8 27B MLX-Quants` para ver variantes con diferentes precisiones y sidecars MTP.

## Limitaciones y advertencias

- La cuantización 4-bit (RTN, group size 64) puede degradar la calidad de las respuestas en comparación con el modelo original en BF16, especialmente en tareas de razonamiento complejo o generación de código.
- La torre de visión se mantiene en BF16, lo que aumenta el uso de memoria total y puede reducir el ahorro esperado de la cuantización.
- No se incluye el drafter MTP en el checkpoint principal; para usar decodificación especulativa hay que descargar un sidecar adicional, lo que añade complejidad de configuración.
- El modelo está diseñado para Apple Silicon (MLX); su uso en otras plataformas requeriría conversión adicional y no está garantizado.
- Aunque el modelo base es multilingüe, la model card solo declara inglés; el rendimiento en otros idiomas no está verificado.
- No hay benchmarks publicados para esta conversión, por lo que el rendimiento real en tareas específicas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar las condiciones del modelo base original (Qwen3.8-27B) para asegurar el cumplimiento.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/lukaskremla/Qwen3.8-27B-4bit-MLX)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Colección Qwen 3.8 27B MLX-Quants](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp-6a7f4a32aee1afa13a6a4661)
