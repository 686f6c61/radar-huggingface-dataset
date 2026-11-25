# Brooooooklyn/Clairic-Flash-GGUF

## Resumen

Clairic-Flash es un modelo multimodal de tipo image-text-to-text de 9B parámetros construido sobre el backbone Qwen3.5-9B y publicado originalmente por Cloudflare. Está diseñado específicamente para extracción de información estructurada a partir de imágenes y texto, con cabezas tipadas ("typed heads") que producen salidas estructuradas como fechas, duraciones, cálculos, estimaciones y previsiones. Su combinación de backbone conversacional y cabezas especializadas lo orienta a pipelines de extracción documental y agentes que necesitan salida verificable.

Esta ficha describe la versión cuantizada publicada por Brooooooklyn en formato GGUF, que empaqueta el backbone en dos variantes Unsloth Dynamic 3.1 (`UD-Q4_K_XL` y `UD-Q8_K_XL`), el proyector de visión en BF16 (`mmproj-BF16.gguf`) y los pesos originales de la cabeza tipada Clairic en safetensors. El paquete está pensado para su uso con el runtime `mlx-node`, que descubre automáticamente los sidecars de visión y de cabeza tipada.

La relevancia actual del modelo radica en su enfoque híbrido: no solo genera texto, sino que expone una interfaz de extracción estructurada con tipos definidos, lo que reduce la necesidad de post-procesado y validación en aplicaciones de extracción de información. La licencia Apache 2.0 facilita su adopción comercial, aunque la información pública disponible sobre el modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B) con proyector de visión y cabezas tipadas Clairic; componentes SSM/attention híbridos según los nombres de tensores (`attn_*`, `ssm_out`) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: `UD-Q4_K_XL` (5,99 GiB), `UD-Q8_K_XL` (10,36 GiB, 9,67 BPW); proyector de visión en BF16; cabeza tipada en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone y `mmproj`), safetensors (cabeza tipada Clairic) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-9B, un transformer de 9,2B parámetros. Los nombres de tensores presentes en la cuantización (`attn_v`, `attn_k`, `attn_output`, `ssm_out`, `nextn.eh_proj`) sugieren una arquitectura híbrida con componentes de atención y de espacio de estados (SSM), además de un posible módulo de predicción multi-token (`nextn`). Sobre este backbone se añaden dos componentes: un proyector de visión en BF16 que habilita la entrada de imágenes y una cabeza tipada Clairic (`clair_head.safetensors`) que produce salidas estructuradas con tipos definidos (fechas, duraciones, cálculos, estimaciones y previsiones).

Las cuantizaciones han sido generadas con Unsloth Dynamic 3.1 sin imatrix externa, aplicando precisión mixta: en `UD-Q4_K_XL` se usan `Q8_0` para `attn_v`/`ssm_out`, `Q6_K`/`Q8_0` para `attn_k`/`attn_output`, `Q5_K`/`Q6_K` para `ffn_down` y `Q6_K` para `output.weight`; en `UD-Q8_K_XL` se mantienen en BF16 `output.weight`, `attn_q`, `attn_k`, `attn_v` y `nextn.eh_proj`, con `Q8_0` en el resto de pesos 2D y `F32` en normas y parámetros SSM. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno sobre el backbone Qwen3.5-9B.
- Comprensión de imágenes (image-text-to-text) mediante el proyector de visión BF16.
- Extracción de información estructurada mediante cabezas tipadas: fechas, duraciones, cálculos, estimaciones y previsiones.
- Salida estructurada (structured output) con tipos definidos, orientada a pipelines de extracción.
- Integración con el runtime `mlx-node` tanto en CLI/servidor como en la aplicación de escritorio (espacio de trabajo "System One").
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Extracción de fechas y plazos en documentos: la cabeza tipada Clairic devuelve fechas normalizadas directamente desde imágenes de contratos, facturas o formularios, evitando post-procesado con expresiones regulares.
- Cálculo de duraciones en partes de trabajo: a partir de capturas o escaneos de hojas de horas, el modelo extrae intervalos y duraciones en formato estructurado para su volcado a sistemas de facturación.
- Estimaciones y previsiones sobre informes: la cabeza dedicada a estimaciones y forecasts permite obtener valores numéricos tipados de tablas e informes financieros o técnicos.
- Digitalización de formularios con visión: el proyector BF16 permite procesar imágenes de formularios y devolver campos estructurados, adecuado para back-office documental.
- Asistentes conversacionales con contexto documental: el backbone Qwen3.5-9B mantiene conversaciones multi-turno mientras consulta imágenes adjuntas, útil en atención al cliente con capturas de pantalla.
- Pipelines de extracción de información en producción: la licencia Apache 2.0 y la disponibilidad en GGUF permiten desplegar el modelo en infraestructura propia con runtimes compatibles (por ejemplo, `mlx-node`) sin restricciones comerciales.
- Procesamiento local en estación de trabajo: la variante `UD-Q4_K_XL` (5,99 GiB) permite ejecutar el modelo en equipos con GPU de consumo para tareas de extracción puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GiB para `UD-Q4_K_XL` (pesos de 5,99 GiB más overhead de contexto y proyector de visión de 879 MiB); aproximadamente 11-12 GiB para `UD-Q8_K_XL` (pesos de 10,36 GiB más overhead).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) cubre ambas variantes con margen, y una RTX 4080/4070 Ti Super (16 GB) cubre `UD-Q8_K_XL` con contexto moderado.
- Cabe en GPU de consumo: sí; `UD-Q4_K_XL` en GPUs de 8 GB o más con contexto reducido, `UD-Q8_K_XL` en GPUs de 12-16 GB o más.
- Opciones de despliegue: el paquete está preparado para `mlx-node` (CLI/servidor y aplicación de escritorio); al ser GGUF, es compatible con runtimes GGUF habituales, aunque los sidecars de cabeza tipada requieren soporte específico.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clairic-Flash (esta ficha) | 9,2B | no disponible | Apache 2.0 | GGUF + safetensors | Backbone Qwen3.5-9B, visión y cabezas tipadas para extracción estructurada |
| Qwen3.5-9B (backbone) | 9B | no disponible | no disponible | no disponible | Modelo base conversacional sin cabezas tipadas ni enfoque de extracción |
| Alternativas multimodales de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el backbone Qwen3.5-9B, es previsible que arrastre sesgos de sus datos de entrenamiento, pero no se documentan.
- Riesgo de alucinación: el modelo combina generación libre y cabezas tipadas; las salidas de la cabeza estructurada deben validarse en producción, especialmente en fechas y cálculos.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `Cloudflare/clairic-flash` y de Qwen3.5-9B, no detalladas aquí.
- Dependencia de runtime: los sidecars de cabeza tipada y el proyector de visión están empaquetados para `mlx-node`; otros runtimes GGUF pueden no interpretar la cabeza Clairic sin adaptación.
- Cuantización sin imatrix externa: las variantes Unsloth Dynamic 3.1 se generaron sin imatrix, lo que puede afectar ligeramente la fidelidad frente a cuantizaciones con calibración.
- Repositorio con pocas descargas (200) y sin likes: la validación comunitaria es escasa; conviene evaluar el modelo en el caso de uso concreto antes de producción.
- Fecha de creación futura en los metadatos del repositorio (2026-11-21): posible inconsistencia en los metadatos que conviene contrastar con el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Brooooooklyn/Clairic-Flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Runtime mlx-node: https://github.com/mlx-node/mlx-node
