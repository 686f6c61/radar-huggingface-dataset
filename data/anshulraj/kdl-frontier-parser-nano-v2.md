# AnshulRaj/KDL-Frontier-Parser-nano-v2

## Resumen

KDL-Frontier-Parser-nano-v2 es un modelo de visión-lenguaje (VLM) de pesos abiertos con 1.292.161.280 parámetros, desarrollado por KoreaDeep (empresa de document-AI) como el nivel "nano" de su familia KDL Frontier Parser. Está construido sobre la arquitectura Qwen2-VL y se distribuye en formato safetensors con un tamaño de repositorio de 2,6 GB. Su propósito es el parseo de documentos: detección de layout, reconocimiento de texto (OCR), reconocimiento de tablas, extracción de gráficos y análisis de figuras.

El modelo no funciona como un parser end-to-end de un solo paso. El flujo previsto es un pipeline: primero se detecta el layout de la página, después se recorta cada región y se invoca de nuevo el modelo por región con un prompt específico de tarea (`\nLayout Detection:`, `\nText Recognition:`, `\nTable Recognition:`, `\nFormula Recognition:`, `\nImage Analysis:`). El reconocimiento de tablas devuelve OTSL, y el resto de formatos de salida queda a cargo de quien lo integra.

Es relevante ahora porque ofrece un modelo de 1,2B parámetros especializado en document parsing con resultados publicados en ParseBench (78,96 de media en cinco dimensiones) medidos sobre 2.078 documentos únicos y 2.553 casos de test, con cero fallos de inferencia. Está pensado para despliegues self-hosted vía vLLM en entornos donde el coste por página y la privacidad del documento son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal vision-lenguaje) |
| Parametros totales | 1.292.161.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el ejemplo de serving con `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2-VL, un transformer multimodal que procesa imágenes y texto en una única pila. Con 1,29B parámetros totales y un pipeline de inferencia que exige `--trust-remote-code` en vLLM, la implementación incluye código propio del autor sobre la base de Qwen2-VL. El modelo está diseñado para trabajar con una sola imagen por petición (`--limit-mm-per-prompt '{"image":1}'`), lo que encaja con el flujo de recorte por región.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card no detalla el proceso de entrenamiento más allá de indicar que es un modelo de pesos abiertos empaquetado y orquestado por KoreaDeep. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El modelo requiere `enable_thinking=False` en el chat template y decodificación greedy (`temperature=0`) para un funcionamiento correcto según las instrucciones del autor.

## Capacidades

- Detección de layout de página mediante el prompt `\nLayout Detection:`.
- Reconocimiento de texto (OCR) mediante el prompt `\nText Recognition:`.
- Reconocimiento de tablas con salida en formato OTSL mediante `\nTable Recognition:`.
- Reconocimiento de fórmulas mediante `\nFormula Recognition:`.
- Análisis de figuras e imágenes mediante `\nImage Analysis:`.
- Procesamiento de imágenes de página (no PDFs) en modo conversacional image-text-to-text.
- Soporte multilingüe limitado a coreano e inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de facturas y albarranes: se detecta el layout de la página, se recortan las regiones de tabla y se invoca el modelo con `\nTable Recognition:` para obtener la estructura en OTSL que después se convierte a CSV o JSON.
- Extracción de tablas financieras de informes anuales: el modelo reconoce tablas complejas con una puntuación de 86,06 en `grits_trm_composite` en ParseBench, adecuado para pipelines de extracción de datos estructurados.
- OCR de documentos escaneados en coreano e inglés: el prompt `\nText Recognition:` permite transcribir regiones de texto con una fidelidad de contenido de 87,64 en ParseBench.
- Procesamiento de documentación técnica con fórmulas: el prompt `\nFormula Recognition:` extrae fórmulas matemáticas de papers y manuales para su conversión a LaTeX u otros formatos.
- Análisis de gráficos en informes: con `\nImage Analysis:` se extrae información de gráficos de barras, líneas y sectores, con una puntuación de 68,87 en `rule_pass_rate` en la dimensión de charts.
- Pipeline de ingestión documental self-hosted: al ser un modelo de 1,2B parámetros con licencia AGPL-3.0, se puede desplegar en infraestructura propia con vLLM para procesar documentos sensibles sin enviarlos a APIs externas.
- Automatización de la revisión de contratos: la detección de layout (75,31 en `layout_element_rule_pass_rate`) permite segmentar cláusulas y secciones antes de aplicar extracción específica por región.

## Benchmarks y rendimiento

Resultados en ParseBench medidos el 2026-10-28 con el harness oficial, conjunto completo, una sola pasada end-to-end (2.078 documentos únicos, 2.553 casos de test, 0 fallos de inferencia):

| Dimension | Metric | Score |
|---|---|---|
| Overall (mean) | media de 5 dimensiones | 78,96 |
| Tables | grits_trm_composite | 86,06 |
| Visual Grounding / Layout | layout_element_rule_pass_rate | 75,31 |
| Content Faithfulness | content_faithfulness | 87,64 |
| Semantic Formatting | semantic_formatting | 76,91 |
| Charts | rule_pass_rate | 68,87 |

Estos resultados son mediciones del autor con el harness upstream sin modificar (revisión `7de04fc11c6a692dfc5e1a86c7be817f3f0af8de`) y revisión del dataset `2805a1d940f95a203e0ae4b88be9934f7765b3fc`. Se trata de una única pasada, no de una media de ejecuciones repetidas; la reproducción por parte de los mantenedores y la aceptación en el leaderboard oficial están pendientes. La puntuación de ParseBench es una medición end-to-end del pipeline (modelo servido vía vLLM más post-procesamiento determinista basado en reglas), consistente con cómo se evalúa a todos los proveedores de ParseBench.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,29B parámetros en safetensors (2,6 GB de repo), en fp16 requiere aproximadamente 2,6 GB solo para pesos, más overhead de activaciones y caché KV para contexto de 8.192 tokens.
- GPU recomendadas: no especificadas por el autor; el ejemplo de serving usa vLLM con `--gpu-memory-utilization 0.85` y `--max-num-seqs 24`, lo que sugiere GPUs con al menos 16-24 GB para ese nivel de concurrencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no se documentan cuantizaciones disponibles.
- Opciones de despliegue: vLLM es la opción documentada por el autor, con `--trust-remote-code`, `--limit-mm-per-prompt '{"image":1}'` y `--max-model-len 8192`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona un modelo mayor de la misma familia, KDL-Frontier-Parser-ultra, disponible a través de DEEP Agent, pero no se publican sus especificaciones ni resultados. No se han identificado en la información disponible alternativas de la misma categoría (VLM de parseo documental de ~1B parámetros) con datos verificables para comparar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KDL-Frontier-Parser-nano-v2 | 1,29B | 8.192 | AGPL-3.0 | Pesos abiertos en HF |
| KDL-Frontier-Parser-ultra | no disponible | no disponible | no disponible | Solo vía DEEP Agent |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es un parser end-to-end de un solo paso: requiere un pipeline externo de detección de layout, recorte de regiones e invocación por tarea con prompts fijos. Las interfaces de chat con prompts libres (como open-webui) no funcionan.
- Solo admite una imagen por petición; hay que pasar imágenes de página, no PDFs.
- Idiomas limitados a coreano e inglés; no se documenta soporte de castellano ni de otros idiomas.
- La licencia AGPL-3.0 impone obligaciones de copyleft: si se ofrece el modelo como servicio en red, puede exigirse la publicación del código fuente modificado. Es una restricción relevante para uso comercial en productos propietarios.
- Los resultados de ParseBench son mediciones del autor en una sola pasada, pendientes de reproducción independiente y de aceptación en el leaderboard oficial; deben tomarse con cautela.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto más allá de los 8.192 tokens configurados.
- El modelo requiere `--trust-remote-code`, lo que implica ejecutar código del autor en el entorno de serving.
- No se dispone de información sobre cuantizaciones, por lo que las opciones de despliegue en hardware limitado no están verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnshulRaj/KDL-Frontier-Parser-nano-v2
- Web de KoreaDeep: https://www.koreadeep.com/
- DEEP Agent (modelo ultra): https://agent.koreadeep.com/ko
- Resumen de validación ParseBench: `evaluation/parsebench-20261028-gpu5.json` (referenciado en la model card)
- Instrucciones de reproducción: `evaluation/reproduce.md` (referenciado en la model card)
