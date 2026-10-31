# mlx-community/Unlimited-OCR-2-bf16

## Resumen

Unlimited-OCR-2-bf16 es una conversión a MLX del modelo de OCR Unlimited-OCR-2 desarrollado por Baidu, publicada por la organización mlx-community en Hugging Face. Se trata de un modelo vision-language especializado en reconocimiento y estructuración óptica de caracteres (OCR), con capacidad de procesar documentos completos, incluso multipágina, y devolver salidas estructuradas con etiquetas de página, bloques y coordenadas. La conversión mantiene los pesos en bfloat16 sin cuantización, incluyendo las torres de visión SAM y CLIP y el router DASH por capa.

El problema que resuelve es la transcripción fiel de documentos complejos: el modelo emplea un modo "gundam" que combina una vista global de 1024 píxeles con hasta 16 recortes locales por página, lo que le permite capturar tanto la maquetación general como el detalle fino del texto. Además, soporta el procesado de varias páginas en una misma petición, con etiquetas especiales para bloques que continúan entre páginas.

Es relevante porque aborda el OCR como tarea de modelo vision-language generativo, con arquitectura híbrida (SAM + CLIP como codificadores visuales y un mecanismo de atención block-sparse llamado DASH), y porque su licencia MIT permite uso comercial sin restricciones. El modelo base tiene 3.340.043.008 parámetros y el repositorio pesa 6,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language con torres de visión SAM y CLIP y atención block-sparse DASH (router por capa) |
| Parametros totales | 3.340.043.008 (~3,34 B) |
| Parametros activos | no disponible (no consta que sea MoE; el router DASH es de atención, no de expertos) |
| Longitud de contexto | no disponible (soporta varias páginas por petición con max-tokens de hasta 16384 en los ejemplos) |
| Tipos de cuantizacion | bfloat16 (sin cuantización); no hay variantes cuantizadas publicadas |
| Idiomas soportados | multilingual (sin lista detallada publicada) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16) |

## Arquitectura y entrenamiento

La arquitectura combina dos torres de visión, SAM y CLIP, ambas mantenidas en bfloat16 en esta conversión, con un mecanismo de atención block-sparse denominado DASH que incorpora un router por capa. El modelo utiliza también page2d RoPE (codificación posicional rotatoria bidimensional a nivel de página), lo que le permite razonar sobre la disposición espacial del contenido dentro de cada página y a través de varias páginas. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación técnica más destacable es el modo "gundam": por cada página se genera una vista global de 1024 píxeles y hasta 16 recortes locales de alta resolución, lo que equilibra contexto global de maquetación con detalle de texto pequeño. El manejo de page2d RoPE y DASH block-sparse attention está siendo integrado (upstream) en la librería mlx-vlm; hasta su publicación estable, hay que instalar desde una rama específica del repositorio.

## Capacidades

- OCR de documentos con salida estructurada: etiquetas `<PAGE>`, `<BLOCK>label[x0, y0, x1, y1]<FORK>text` para bloques con coordenadas de bounding box.
- Procesado multipágina en una sola petición (una vista base de 1024 por página), con etiquetas `cross_*` y `append_*` para bloques que continúan entre páginas.
- Conversión a Markdown mediante un conversor incluido en el repositorio original de Baidu.
- Comprensión de maquetación (layout) gracias a la vista global más recortes locales del modo gundam.
- Capacidades multilingües de OCR (sin lista de idiomas publicada).
- Pipeline image-text-to-text con soporte conversacional según la taxonomía de Hugging Face.
- No se ha publicado información sobre tool calling, agentes, ni capacidades de audio.

## Casos de uso

- Digitalización de archivos documentales: transcripción de documentos escaneados multipágina (contratos, informes, expedientes) conservando la estructura de bloques y las coordenadas de cada elemento, lo que facilita la reconstrucción del documento original.
- Conversión de PDFs a Markdown para RAG: el conversor a Markdown del repositorio permite alimentar pipelines de generación aumentada por recuperación con documentos bien estructurados, manteniendo encabezados, tablas y secciones.
- Indexación de bibliotecas digitales y hemerotecas: la capacidad de procesar varias páginas por petición y de marcar bloques que cruzan saltos de página simplifica la ingesta masiva de documentos largos.
- Extracción de datos de facturas y formularios: las bounding boxes por bloque permiten asociar el texto extraído a regiones concretas del documento, útil para validación humana y para sistemas de extracción de campos.
- Procesado local en Apple Silicon: al ser una conversión MLX, es idóneo para ejecutar OCR de forma privada en Mac (M1/M2/M3/M4) sin depender de servicios en la nube, relevante para documentos sensibles.
- Automatización de flujos documentales en empresas: integración en pipelines que reciben imágenes o escaneos y generan texto estructurado con metadatos de posición para sistemas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 3,34 B de parámetros en bf16, el repositorio pesa 6,8 GB; se recomienda disponer de al menos 8-10 GB de memoria unificada para inferencia cómoda, más si se procesan varias páginas por petición (los ejemplos usan max-tokens de 8192-16384).
- GPU recomendadas: al ser un modelo MLX, está diseñado para Apple Silicon (Mac Studio, MacBook Pro con chips M serie). No se ha publicado información sobre requisitos en GPU NVIDIA.
- Consumer hardware: cabe en Macs con 16 GB de memoria unificada o más; no hay variantes cuantizadas publicadas que reduzcan aún más el footprint.
- Despliegue: mediante mlx-vlm (instalando temporalmente desde la rama `git+https://github.com/shuuul/mlx-vlm.git` hasta que el soporte de page2d RoPE y DASH se publique en la versión estable). No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Licencia | Especialización |
|---|---|---|---|---|
| Unlimited-OCR-2-bf16 (mlx-community) | 3,34 B | MLX / Apple Silicon | MIT | OCR estructurado multipágina con layout |
| baidu/Unlimited-OCR-2 (base) | 3,34 B | Pesos originales (no disponible el framework) | MIT | OCR estructurado multipágina con layout |
| Alternativas OCR de tamaño comparable | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables con datos suficientes para una comparativa detallada de rendimiento.

## Limitaciones y advertencias

- Al ser una conversión comunitaria de mlx-community, el soporte de page2d RoPE y DASH block-sparse attention aún no está en la versión estable de mlx-vlm; hay que instalar desde una rama no oficial, lo que implica riesgo de inestabilidad.
- No hay variantes cuantizadas publicadas, por lo que el consumo de memoria (6,8 GB en bf16) no puede reducirse fácilmente en esta conversión.
- No se ha publicado información sobre sesgos conocidos, tasas de alucinación ni limitaciones de idiomas concretos.
- El formato de salida con etiquetas (`<PAGE>`, `<BLOCK>...`, `cross_*`, `append_*`) requiere el conversor del repositorio original para obtener Markdown; usar la salida cruda sin procesar puede no ser útil directamente.
- La licencia MIT no impone restricciones de uso comercial, pero conviene revisar la model card original de Baidu para condiciones adicionales del modelo base.
- Para producción en entornos no Apple (servidores Linux con GPU NVIDIA), esta conversión MLX no es adecuada; habría que usar el modelo base baidu/Unlimited-OCR-2.
- No se ha publicado información sobre benchmarks, por lo que la calidad real frente a otros OCR no puede verificarse con datos públicos.

## Enlaces

- Modelo MLX: https://huggingface.co/mlx-community/Unlimited-OCR-2-bf16
- Modelo original de Baidu: https://huggingface.co/baidu/Unlimited-OCR-2
- mlx-vlm (con la rama con soporte): https://github.com/Blaizzy/mlx-vlm y rama con soporte: https://github.com/shuuul/mlx-vlm.git
- Organización mlx-community: https://huggingface.co/mlx-community
