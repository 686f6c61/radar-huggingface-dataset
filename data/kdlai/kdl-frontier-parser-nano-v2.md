# KDLAI/KDL-Frontier-Parser-nano-v2

## Resumen

KDL-Frontier-Parser-nano-v2 es un modelo de visión-lenguaje de 1.292.161.280 parámetros (~1,2 B) especializado en el parseo de documentos, publicado por KDLAI, la organización de pesos abiertos de la empresa coreana KoreaDeep. Ocupa el nivel «nano» de la familia KDL Frontier Parser y se distribuye en safetensors bajo licencia AGPL-3.0, con soporte declarado de coreano e inglés. El repositorio ocupa 2,6 GB y está etiquetado con el pipeline `image-text-to-text` sobre arquitectura `qwen2_vl`.

El modelo no resuelve el parseo de una página en una sola pasada: la model card lo describe como el núcleo de un pipeline en el que primero se detecta la maquetación, después se recorta cada región y por último se invoca el modelo otra vez por región con un prompt fijo según la tarea (layout, texto, tabla, fórmula o figura). Las tablas se devuelven en OTSL y el resto de formatos de salida queda a cargo de quien integra el modelo, que además debe aplicar su propio post-procesado.

Su relevancia actual es doble: el autor publica una medición en ParseBench (78,96 de media en cinco dimensiones, sobre 2.078 documentos y 2.553 casos de test) junto con instrucciones de reproducción, y el tamaño de 1,2 B permite servirlo con vLLM en una sola GPU, algo poco habitual en parseo documental con resultados de este nivel. La contrapartida es que esa puntuación es una única pasada autoinformada, pendiente de reproducción por terceros y de aceptación en la clasificación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje, familia `qwen2_vl` |
| Parametros totales | 1.292.161.280 (~1,2 B), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en la configuración de servicio recomendada (`--max-model-len 8192`); longitud nativa no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Pipeline / tarea | `image-text-to-text`; parseo de documentos (layout, OCR, tablas, gráficos, fórmulas) |
| Tamaño del repositorio | 2,6 GB |
| Entrada | imágenes de página (no PDF), una imagen por petición (`--limit-mm-per-prompt '{"image":1}'`) |
| Formato de salida en tablas | OTSL (otros formatos a cargo del integrador) |
| Fecha de publicación | 2026-10-28 (última actualización 2026-10-28) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `qwen2_vl`, es decir, un transformer multimodal con codificador visual y LLM de ~1,2 B de parámetros, adaptado a tareas de parseo documental. El modelo se comporta como un componente de tarea única por llamada: cada prompt fijo (`\nLayout Detection:`, `\nText Recognition:`, `\nTable Recognition:`, `\nFormula Recognition:`, `\nImage Analysis:`) activa una capacidad concreta sobre una región recortada de la página. La receta de entrenamiento no se detalla en la información disponible: no hay datos sobre número de tokens, composición del dataset, resolución de imagen de entrenamiento, ni sobre si hubo RLHF, DPO u otra fase de alineación.

Tampoco se documentan innovaciones de atención o decodificación. Lo diferencial es de integración: el modelo no intenta generar la página completa de una vez, sino que delega la segmentación en el paso de layout detection y produce salidas estructuradas por región (OTSL en tablas), lo que reduce la degradación típica de los parsers end-to-end en páginas densas. En inferencia se exige decodificación voraz (`temperature=0`), `skip_special_tokens=False` al decodificar y `enable_thinking=False` en la plantilla de chat, además de `--trust-remote-code` en vLLM. La puntuación de ParseBench se obtiene con el modelo servido en vLLM más post-procesado determinista basado en reglas; no intervienen otros modelos aprendidos, clasificadores ni ensembles.

## Capacidades

- Detección de maquetación (*layout detection*): identifica y localiza elementos de la página para permitir el recorte por regiones.
- Reconocimiento de texto manuscrito e impreso (OCR) sobre imágenes de página o de región.
- Reconocimiento de tablas con salida en OTSL, formato orientado a preservar la estructura de celdas y encabezados.
- Reconocimiento de fórmulas matemáticas a partir del recorte de la región correspondiente.
- Análisis de figuras y extracción de información de gráficos (`\nImage Analysis:`).
- Procesamiento multilingüe limitado a coreano e inglés.
- Integración en pipelines multi-paso: el propio modelo actúa como orquestador por llamadas sucesivas, no como parser de una sola pasada.
- Servible mediante API compatible con OpenAI a través de vLLM, con prompts fijos y una imagen por petición.
- No se documenta soporte de *tool calling*, función de agentes, audio, vídeo ni modo de razonamiento explícito (de hecho, el pensamiento debe desactivarse).

## Casos de uso

- Digitalización de facturas y albaranes en coreano e inglés: se detecta la maquetación de la página, se recorta la región de la tabla de líneas y se invoca `\nTable Recognition:` para obtener OTSL, que después se convierte a CSV o JSON en el sistema contable.
- Extracción de tablas de informes financieros y memorias anuales: el pipeline layout → recorte → tabla permite procesar tablas de varias páginas sin enviar la página completa al modelo, lo que reduce errores de estructura en documentos densos.
- Conversión de gráficos de barras y líneas a datos tabulares: la tarea `\nImage Analysis:` sobre el recorte del gráfico sirve para alimentar series temporales o cuadros de mando a partir de PDFs escaneados.
- Enriquecimiento de bases de conocimiento para RAG: se trocea cada PDF escaneado por regiones detectadas, se transcribe con `\nText Recognition:` y se indexa el texto con metadatos de posición, manteniendo trazabilidad hacia la página original.
- Digitalización de documentación administrativa coreana: el soporte nativo de `ko` evita depender de un OCR externo para formularios, certificados y expedientes, con el modelo sirviendo la transcripción región a región.
- Control de calidad de maquetación editorial: la salida de `\nLayout Detection:` se compara con la maqueta esperada para detectar elementos mal colocados en tiradas de preimpresión o en plantillas corporativas.
- Procesamiento por lotes a bajo coste: al caber en una GPU de consumo, se puede desplegar con vLLM (`--max-num-seqs 24`, `--gpu-memory-utilization 0.85`) en un nodo único para pipelines nocturnos de digitalización masiva.
- Extracción de fórmulas en artículos científicos y material docente: el recorte de cada fórmula se procesa con `\nFormula Recognition:` para reconstruir el documento en LaTeX o Markdown.

## Benchmarks y rendimiento

ParseBench, medición del 2026-10-28 con el arnés oficial, conjunto completo y una única pasada end-to-end (2.078 documentos únicos, 2.553 casos de test de grupo, 0 fallos de inferencia):

| Dimensión | Métrica | Puntuación |
|---|---|---|
| Global (media) | media de las 5 dimensiones | 78,96 |
| Tablas | grits_trm_composite | 86,06 |
| Grounding visual / layout | layout_element_rule_pass_rate | 75,31 |
| Fidelidad de contenido | content_faithfulness | 87,64 |
| Formateo semántico | semantic_formatting | 76,91 |
| Gráficos | rule_pass_rate | 68,87 |

Condiciones declaradas: upstream sin modificar `7de04fc11c6a692dfc5e1a86c7be817f3f0af8de` y revisión del dataset `2805a1d940f95a203e0ae4b88be9934f7765b3fc`; se puntuaron los 2.553 casos elegibles y los informes conservan además 32 registros omitidos fuera de ese recuento. Es una sola pasada, no una media de ejecuciones repetidas, y la reproducción por los mantenedores y la aceptación en la clasificación oficial están pendientes. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para comparaciones con modelos de terceros.

## Requisitos de hardware

- Pesos en FP16/BF16: ~2,58 GB solo de parámetros; con codificador visual, activaciones y caché KV para 8192 tokens conviene reservar entre 4 y 6 GB de VRAM (estimación, no publicada por el autor). Una referencia externa (LLM Explorer) cita 2,3 GB de VRAM para el modelo.
- Cuantización a int8: ~1,3 GB de pesos; a int4: ~0,7 GB. No hay artefactos cuantizados oficiales, por lo que habría que generarlos y validar la pérdida de precisión en tablas y gráficos.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. También en GPUs de 8 GB si se limita la longitud de contexto y el número de secuencias simultáneas.
- GPU de centro de datos: A100, H100, L40S o L4 son suficientes y permiten aumentar `--max-num-seqs` por encima de los 24 recomendados.
- Despliegue recomendado: vLLM con `--trust-remote-code`, `--limit-mm-per-prompt '{"image":1}'`, `--max-model-len 8192`, `--gpu-memory-utilization 0.85`.
- Otras opciones: TGI y Ollama no están documentadas para este modelo; llama.cpp/Ollama requerirían una conversión propia a GGUF y la verificación de la plantilla de chat y de los prompts fijos.
- Latencia y throughput: no disponibles. El único dato operativo es que una pasada completa sobre 2.553 casos terminó sin fallos de inferencia en la configuración indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ParseBench (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KDL-Frontier-Parser-nano-v2 | ~1,2 B | 8192 (config. recomendada) | 78,96 (autoinformado, 1 pasada) | AGPL-3.0 | Pesos abiertos en HuggingFace |
| KDL-Frontier-Parser-nano (v1) | no disponible | no disponible | no disponible | no disponible | Pesos abiertos en HuggingFace |
| KDL-Frontier-Parser-ultra | no disponible | no disponible | no disponible | no disponible | Solo vía DEEP Agent (servicio) |
| Otros VLM de parseo documental de la misma franja (p. ej. modelos de 1-3 B tipo Qwen-VL) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado resultados de benchmarks de terceros en la información disponible, por lo que no es posible establecer una comparación numérica con alternativas externas. Cualquier comparación debería hacerse reproduciendo ParseBench con el mismo arnés y la misma revisión del dataset.

## Limitaciones y advertencias

- No es un parser end-to-end: exige orquestación propia (detección de layout, recorte y segunda llamada por región) y post-procesado para convertir OTSL u otras salidas al formato final.
- Los prompts son fijos y llevan un salto de línea inicial; interfaces de chat con prompts libres (por ejemplo open-webui) no funcionan con este modelo.
- Solo acepta imágenes de página, no PDFs, y una única imagen por petición.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está documentado ni evaluado.
- El modo de razonamiento debe desactivarse (`enable_thinking=False`); usar decodificación no voraz o `skip_special_tokens=True` puede romper el formato de salida.
- El benchmark es autoinformado, de una sola pasada y sin media de ejecuciones; la reproducción por maintainers y la aceptación en la clasificación oficial están pendientes. Los gráficos son la dimensión más débil (68,87).
- La licencia AGPL-3.0 impone obligaciones de copyleft, incluida la distribución del código fuente a usuarios que interactúen con el modelo a través de red; conviene revisión legal antes de integrarlo en un producto SaaS propietario.
- Riesgo de alucinación en tablas y gráficos: el modelo puede generar celdas, series o etiquetas plausibles que no aparecen en la imagen, por lo que se recomienda validación posterior en dominios críticos.
- No se documentan sesgos, composición del dataset de entrenamiento ni evaluación de robustez ante documentos degradados, rotados o de baja resolución.
- Modelo recién publicado, con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni de soporte de la comunidad.
- Requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio en el servidor de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KDLAI/KDL-Frontier-Parser-nano-v2
- Repositorio de archivos: https://huggingface.co/KDLAI/KDL-Frontier-Parser-nano-v2/tree/main
- Resumen de validación ParseBench (dentro del repo): `evaluation/parsebench-20261028-gpu5.json`
- Instrucciones de reproducción (dentro del repo): `evaluation/reproduce.md`
- Web de KoreaDeep: https://www.koreadeep.com/
- DEEP Agent (acceso a KDL-Frontier-Parser-ultra): https://agent.koreadeep.com/ko
- Versión anterior del modelo: https://huggingface.co/KDLAI/KDL-Frontier-Parser-nano/tree/main
- Ficha en LLM Explorer: https://llm-explorer.com/model/KDLAI%2FKDL-Frontier-Parser-nano,2sVCbe24enCAgkzb8YyHl4
- Ficha en Inferix: https://inferix.co/models/KDLAI/KDL-Frontier-Parser-nano
- Visor de configuración: https://hfviewer.com/models/KDLAI/KDL-Frontier-Parser-nano
