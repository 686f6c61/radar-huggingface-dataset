# bigbigbei/Unlimited-OCR-2-4bit-mlx

## Resumen

Unlimited-OCR-2-4bit-mlx es una cuantización a 4 bits en formato MLX del modelo baidu/Unlimited-OCR-2, un modelo de lenguaje y visión (VLM) especializado en OCR y parsing de documentos desarrollado por Baidu (familia ERNIE). El repositorio lo publica el usuario bigbigbei y su único propósito es reempaquetar los pesos originales en un formato que pueda ejecutarse eficientemente sobre Apple Silicon mediante la librería MLX, reduciendo el tamaño de aproximadamente 6,4 GB en bf16 a unos 1,9 GB.

El modelo subyacente emplea una arquitectura personalizada que combina un front-end visual SAM+CLIP con un decoder transformer que incorpora RoPE de dos ejes (page2d), atención block-sparse DASH y expertos MoE apilados y cuantizados. Con 611.568.129 parámetros totales, está diseñado específicamente para tareas de extracción estructurada de documentos: el modelo emite una salida siguiendo un protocolo de bloques propietario (`<PAGE><BLOCK>type[x0, y0, x1, y1]<FORK> ...`) que codifica tipo de bloque y coordenadas delimitadoras.

Su relevancia es acotada pero clara: permite ejecutar localmente en Mac un modelo de parsing documental que de otro modo requeriría hardware con más memoria, a costa de depender de un decoder nativo específico (MlxOCRKit) porque la arquitectura no es cargable por las clases automáticas estándar de transformers o mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decoder personalizado: RoPE de dos ejes (page2d), atención block-sparse DASH, expertos MoE apilados y cuantizados; front-end visual SAM+CLIP |
| Parametros totales | 611.568.129 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (affine), group size 64; expertos cuantizados, rama visual SAM en bf16 (`quantized_sam=false`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), con `quantization.json` para el layout por tensor |

## Arquitectura y entrenamiento

La arquitectura es propietaria y no corresponde a ningún transformer estándar. El modelo combina un front-end de visión compuesto por SAM y CLIP con un decoder que usa RoPE de dos ejes (page2d), pensado para modelar simultáneamente las dimensiones horizontal y vertical de una página, atención block-sparse DASH para reducir el coste computacional en secuencias largas de documentos y una pila de expertos MoE cuantizados. Esta combinación está orientada a preservar la estructura espacial del documento durante el parsing.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del repositorio cuantizado no incluye detalles de entrenamiento y se remite a la model card original de Baidu, que no forma parte de la información proporcionada. La innovación técnica documentada en este repositorio es la cuantización afín a 4 bits con group size 64 aplicada a los expertos, manteniendo la rama SAM en bf16 para preservar la calidad de la percepción visual.

## Capacidades

- OCR y parsing de documentos: extracción de texto con estructura de bloques y coordenadas delimitadoras mediante el protocolo `<PAGE><BLOCK>type[x0, y0, x1, y1]<FORK>`.
- Parsing multipágina: el prompt de ejemplo ("Multi page parsing.") sugiere soporte para procesar documentos de varias páginas en una sola invocación.
- Comprensión de layout: la codificación de tipo de bloque junto a coordenadas permite reconstruir la disposición espacial del documento.
- Procesamiento imagen-texto a texto (pipeline `image-text-to-text`).
- Ejecución local en Apple Silicon mediante MLX, con decoder nativo en Swift (MlxOCRKit).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Digitalización de archivos en Mac: ejecutar el modelo localmente con MLX sobre un Mac con Apple Silicon para convertir PDFs escaneados o imágenes de páginas en texto estructurado, sin enviar documentos a servicios en la nube.
- Extracción de estructura de facturas y albaranes: el protocolo de bloques con coordenadas permite identificar regiones (cabecera, líneas de detalle, totales) y mapearlas a un esquema de datos posterior.
- Procesamiento por lotes de documentación interna: al ocupar aproximadamente 1,9 GB en disco, el modelo puede mantenerse residente en memoria en equipos con 16 GB o más y procesar colas de imágenes de forma secuencial.
- Pipeline de ingesta documental en aplicaciones Swift: el decoder MlxOCRKit permite integrar el modelo directamente en apps macOS nativas sin depender de Python.
- Prototipado de sistemas RAG sobre documentos: usar la salida estructurada por bloques como paso previo de segmentación antes de generar embeddings y alimentar un índice de recuperación.
- Investigación sobre cuantización de VLMs: el repositorio sirve como referencia reproducible de cuantización afín 4-bit con group size 64 sobre una arquitectura MoE con rama visual mixta en precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 1,9 GB de pesos en disco; se recomienda reservar al menos 4 GB de memoria unificada para pesos, buffers de atención y KV cache durante la inferencia.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No hay soporte documentado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada; 16 GB ofrece margen cómodo para documentos multipágina.
- Opciones de despliegue: MLX (Python) y el decoder nativo en Swift MlxOCRKit (`minerukit uocr2`). No es cargable por `mlx-vlm` ni por clases automáticas de `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2-4bit-mlx (este) | 611,6 M | no disponible | MLX 4-bit, Apple Silicon | MIT | Requiere decoder nativo MlxOCRKit |
| baidu/Unlimited-OCR-2 (base) | 611,6 M (presumiblemente) | no disponible | bf16, ~6,4 GB | MIT | Modelo original; requiere el mismo decoder específico |
| Alternativas OCR/VLM de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparación cuantitativa con modelos alternativos de OCR o parsing documental.

## Limitaciones y advertencias

- Arquitectura no estándar: no se puede cargar con `transformers`, `mlx-vlm` ni clases automáticas; requiere el decoder específico MlxOCRKit, lo que limita la portabilidad y añade dependencia de un único implementador.
- Solo Apple Silicon: la cuantización MLX no es utilizable en GPU NVIDIA o AMD; para esos entornos habría que recurrir al modelo base en otro formato.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación comunitaria de la calidad de la cuantización.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas sin evaluación propia.
- Riesgo de alucinación: inherente a los VLM de parsing; conviene validar la salida estructurada contra el documento original, especialmente en tablas y campos numéricos.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento no es posible evaluar sesgos de dominio, idioma o tipografía.
- Licencia MIT heredada del modelo base: permite uso comercial, pero la atribución corresponde a Baidu y conviene revisar la model card original para condiciones adicionales.
- Fecha de creación del repositorio (2026-11-02) y ausencia de métricas de evaluación: tratar como artefacto experimental, no como solución validada para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bigbigbei/Unlimited-OCR-2-4bit-mlx
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- MLX: https://github.com/ml-explore/mlx
- MlxOCRKit (decoder Swift): https://github.com/playstonex/MinerUKit
