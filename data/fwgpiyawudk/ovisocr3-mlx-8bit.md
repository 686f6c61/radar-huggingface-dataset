# fwgpiyawudk/OvisOCR3-mlx-8bit

## Resumen

OvisOCR3 es un modelo unificado de OCR y comprensión de documentos de 0,8 mil millones de parámetros, desarrollado originalmente por ATH-MaaS y afinado a partir de Qwen3.5-0.8B (arquitectura `qwen3_5`). Resuelve tareas de parsing documental: conversión de páginas a Markdown o JSON estructurado, extracción de layout, OCR plano, extracción de información clave (KIE), descripción de figuras y tablas que cruzan varias páginas. Su interés radica en concentrar todas esas tareas en un único modelo multimodal pequeño, lo que abarata el despliegue en entornos con muchas páginas y poco presupuesto de cómputo.

La ficha que nos ocupa no es el modelo original, sino una conversión a MLX cuantizada a 8 bits (tamaño de grupo 64) realizada por el usuario `fwgpiyawudk` el 14 de noviembre de 2026 con mlx-vlm 0.7.12. El objetivo es ejecutar el modelo en hardware Apple Silicon mediante el framework MLX, manteniendo la fidelidad del bf16 original. El repositorio ocupa 1,0 GB y contiene 852.985.920 parámetros en safetensors.

La relevancia de esta conversión es práctica: permite servir OvisOCR3 en un Mac con memoria unificada mediante `mlx_vlm.server`, sin GPU dedicada. La model card advierte explícitamente de que no existen cifras oficiales de la variante 4 bits y que, en la familia Qwen3.5, la cuantización a 4 bits degrada el rendimiento en documentos tailandeses, por lo que se recomienda 8 bits para ese caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (base Qwen3.5-0.8B), image-text-to-text |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64 (MLX); el modelo base admite bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantizado 8 bits) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `qwen3_5`, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje, y se presenta como un modelo unificado para tareas de OCR y comprensión documental. El checkpoint original es un fine-tuning de Qwen3.5-0.8B sobre datos de documentos; la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a MLX aplica cuantización afín de 8 bits con tamaño de grupo 64 mediante `mlx_vlm convert`. El pipeline de inferencia requiere mlx-vlm >= 0.3.12, la primera versión que reconoce la arquitectura `qwen3_5`. El modelo trabaja con prompts de tarea oficiales incluidos en el repositorio (`document_markdown`, `document_structured`, `document_layout`, `plain_ocr`, etc.) que definen el contrato de salida y deben usarse literalmente. La entrada se compone primero de la imagen y después del texto del prompt, con el modo thinking desactivado (`enable_thinking=False`) y decodificación greedy con temperatura 0,0.

## Capacidades

- Parsing de documentos a Markdown: conversión de páginas completas a texto estructurado.
- Parsing estructurado a JSON: extracción de campos y jerarquías documentales.
- Análisis de layout: identificación de regiones, bloques y orden de lectura.
- OCR plano: transcripción de texto en imágenes.
- Extracción de información clave (KIE): localización de entidades y valores en formularios y documentos.
- Descripción de figuras: generación de pies de figura a partir de imágenes.
- Tablas que cruzan varias páginas: reconstrucción de tablas partidas entre páginas.
- Entrada multimodal imagen-texto con prompts de tarea predefinidos.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte cada página escaneada a Markdown con un prompt `document_markdown`, lo que permite indexar el contenido en un buscador o RAG sin OCR externo ni post-procesado de layout.
- Extracción de datos de facturas y formularios: con el prompt `document_structured` se obtiene JSON con los campos definidos, adecuado para pipelines de contabilidad que necesitan salida parseable y determinista (temperatura 0,0).
- Reconstrucción de tablas financieras partidas entre páginas: la capacidad de cross-page tables permite unir fragmentos de una misma tabla en un único objeto estructurado, algo que los OCR por página no resuelven.
- Análisis de layout para recorte y reordenación: el prompt `document_layout` devuelve regiones y orden de lectura, útil para preprocesar documentos antes de pasarlos a otro modelo o para generar versiones accesibles.
- Descripción automática de figuras en informes técnicos: el modelo genera pies de figura que se incorporan al texto extraído, mejorando la completitud del documento digitalizado.
- Procesamiento local en Mac: al ser una conversión MLX de 1,0 GB, se puede servir con `mlx_vlm.server` en un Apple Silicon para digitalizar documentos sensibles sin enviar datos a la nube.
- OCR de documentos en tailandés: la model card recomienda explícitamente la variante 8 bits frente a 4 bits para este idioma, por lo que esta conversión es la opción adecuada dentro del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona, como referencia indirecta, que en las tarjetas oficiales de Typhoon OCR V2 (misma familia Qwen3.5) las versiones de 4 bits perdieron unos 10 puntos en páginas tailandesas (2B: 70,5 frente a 80,6 en MDPBench TH), mientras que 8 bits igualó a bf16. No se aportan cifras propias de OvisOCR3.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 1,0 GB en 8 bits, por lo que la inferencia cabe holgadamente en 2-4 GB de memoria unificada, incluyendo overhead del runtime y del procesador de imágenes.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) mediante MLX; no está pensado para GPU NVIDIA ni CUDA.
- GPU consumer: cualquier Mac con 8 GB o más de memoria unificada debería poder ejecutarlo; no aplica a RTX 4090, A100 o H100 por la dependencia de MLX.
- Despliegue: `mlx_vlm.server` con `--min-pixels 200704 --max-pixels 8294400` (equivalente a 448×448 y 2880×2880) o la API Python `mlx_vlm.load` + `generate`.
- Latencia y throughput: no disponibles.
- Requisito de versión: mlx-vlm >= 0.3.12.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OvisOCR3-mlx-8bit (esta ficha) | 852.985.920 | no disponible | Apache 2.0 | safetensors MLX 8 bits | Conversion comunitaria para Apple Silicon |
| ATH-MaaS/OvisOCR3 | 852.985.920 | no disponible | Apache 2.0 | safetensors (bf16) | Modelo original, referencia de calidad |
| Typhoon OCR V2 (familia Qwen3.5) | no disponible | no disponible | no disponible | no disponible | Citado en la model card por sus cifras en MDPBench TH |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria: no es un artefacto oficial de ATH-MaaS; el autor del repositorio es un tercero y el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Dependencia estricta de mlx-vlm >= 0.3.12; versiones anteriores no reconocen la arquitectura `qwen3_5`.
- Solo ejecutable en el ecosistema MLX (Apple Silicon); no hay pesos GGUF ni compatibilidad con vLLM, TGI o llama.cpp en este repositorio.
- Los prompts de tarea definen el contrato de salida: usarlos fuera de los oficiales puede degradar la calidad o romper el formato esperado.
- El modo thinking debe permanecer desactivado; activarlo altera el comportamiento previsto para estas tareas.
- No hay datos publicados sobre sesgos, tasas de alucinación ni cobertura de idiomas; la model card no los documenta.
- La cuantización a 4 bits no está soportada con garantías: la evidencia indirecta de la familia Qwen3.5 muestra pérdidas de unos 10 puntos en tailandés, por lo que se desaconseja para producción multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión derivada conviene verificar la licencia y condiciones del modelo base ATH-MaaS/OvisOCR3.
- El límite de tokens de salida recomendado es 16384 oficialmente y 6000 en las pruebas del autor; documentos muy densos pueden truncarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fwgpiyawudk/OvisOCR3-mlx-8bit
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Modelo de origen del fine-tuning: https://huggingface.co/Qwen/Qwen3.5-0.8B
