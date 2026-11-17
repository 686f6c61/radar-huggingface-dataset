# eduardoworrel/Jurema-7B-LGPD-ONNX-genai-int4-S1S2

## Resumen

Jurema-7B-LGPD-ONNX-genai-int4-S1S2 es una conversión a ONNX Runtime GenAI con cuantización INT4 del modelo base Jurema-br/Jurema-7B, publicada por el usuario eduardoworrel. El modelo está especializado en clasificación de texto y, por los tags y el nombre, orientado a tareas relacionadas con políticas de privacidad y cumplimiento de la LGPD (Lei Geral de Proteção de Dados, la normativa brasileña de protección de datos), con etiquetas que sugieren un esquema de clasificación S1/S2. El pipeline declarado en Hugging Face es text-classification, no generación de texto.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo de despliegue de un modelo de 7B en formato ONNX INT4 pensado para ejecución en WebGPU y entornos ligeros mediante onnxruntime-genai; por otro, documenta un caso de especialización vertical (clasificación de textos legales o de privacidad en portugués e inglés). La información pública disponible es muy limitada y la mayoría de los detalles técnicos no están confirmados en la model card, por lo que se indican como no disponibles.

El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El tamaño del repositorio es de 4,8 GB, coherente con una cuantización INT4 de un modelo de aproximadamente 7 000 millones de parámetros más los artefactos de tokenizer y configuración de ONNX Runtime GenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Jurema-br/Jurema-7B; detalles no disponibles) |
| Parametros totales | ~7B (por el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (formato ONNX Runtime GenAI) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), cuantizado a INT4 |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Jurema-br/Jurema-7B a ONNX Runtime GenAI con cuantización INT4. La arquitectura subyacente corresponde al modelo base, presumiblemente un transformer decoder-only de ~7B parámetros, pero la model card de esta conversión no documenta la arquitectura interna, el número de capas, la dimensión oculta ni la ventana de contexto. Tampoco se especifican los datos de entrenamiento, el número de tokens vistos, la composición del corpus ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

La innovación técnica principal de esta publicación es el propio pipeline de despliegue: el uso de onnxruntime-genai con cuantización INT4 y soporte de WebGPU permite ejecutar el modelo en navegador o en hardware con aceleración gráfica sin necesidad de CUDA, reduciendo el peso del artefacto a 4,8 GB. El sufijo S1S2 en el nombre sugiere un esquema de clasificación en dos niveles o dos etapas, pero no se detalla en la información proporcionada.

## Capacidades

- Clasificación de texto (pipeline declarado en Hugging Face: text-classification).
- Especialización probable en textos de privacidad y cumplimiento de la LGPD, según los tags privacy-policy y lgpd.
- Esquema de etiquetas S1/S2 sugerido por el nombre del modelo (no documentado).
- Soporte bilingüe portugués-inglés.
- Ejecución mediante ONNX Runtime GenAI con backend WebGPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades de generación de código ni matemáticas; el pipeline declarado es de clasificación, no de generación.

## Casos de uso

- Clasificación de cláusulas de privacidad: el modelo puede etiquetar fragmentos de políticas de privacidad o contratos según el esquema S1/S2, ayudando a equipos de cumplimiento a triar documentos en portugués e inglés antes de la revisión humana.
- Triaje de solicitudes de titulares de datos: en un flujo de atención al ciudadano bajo LGPD, el modelo puede clasificar comunicaciones entrantes para enrutarlas al equipo adecuado.
- Moderación y etiquetado de contenido sensible: uso como clasificador auxiliar en pipelines de revisión de textos que puedan contener datos personales.
- Despliegue en navegador o en el borde: gracias al formato ONNX INT4 con WebGPU, puede integrarse en aplicaciones web que necesiten clasificar texto localmente sin enviar datos a un servidor, lo que es coherente con un caso de uso de privacidad.
- Análisis documental en estudios jurídicos: clasificación por lotes de contratos y avisos legales en portugués e inglés para organización de archivos.
- Prototipado rápido de clasificadores verticales: al ser una conversión ONNX lista para onnxruntime-genai, sirve como base para experimentar con clasificación de textos legales en entornos con recursos limitados.
- Evaluación de pipelines de cuantización: caso de estudio para medir la pérdida de calidad de un 7B al pasar a INT4 en tareas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 4,8 GB en INT4, por lo que se necesita al menos ese espacio en memoria o VRAM; se recomienda un margen adicional para el runtime y el contexto.
- GPU recomendadas: no disponibles de forma específica; el tag webgpu indica compatibilidad con aceleración gráfica vía WebGPU, lo que incluye GPUs de consumo modernas con soporte de navegador.
- GPU de consumo: por el tamaño INT4, es plausible que quepa en GPUs de consumo con 6-8 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: onnxruntime-genai (librería declarada), con backend WebGPU; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jurema-7B-LGPD-ONNX-genai-int4-S1S2 | ~7B (no confirmado) | no disponible | ONNX INT4 | CC-BY-4.0 | Clasificacion, bilingue pt/en, acceso gated |
| Jurema-br/Jurema-7B (base) | ~7B | no disponible | safetensors (presumible) | no disponible | Modelo original del que deriva esta conversion |
| Otros clasificadores legales pt/en | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, datos de entrenamiento ni evaluación; la ficha se basa en metadatos y en el nombre del modelo.
- El pipeline declarado es text-classification; no debe asumirse capacidad de generación de texto conversacional.
- Riesgo de alucinación y de clasificación errónea en textos legales ambiguos; requiere validación humana en contextos de cumplimiento normativo.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo.
- Cobertura lingüística limitada a portugués e inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base Jurema-br/Jurema-7B, cuya licencia no se detalla en la información disponible.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la automatización de descargas en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- El tag arxiv:2611.15302 hace referencia a un identificador de arXiv no verificable en la información proporcionada; no se debe citar como fuente sin comprobación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Jurema-7B-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Jurema-br/Jurema-7B
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- WebGPU: https://www.w3.org/TR/webgpu/
- Referencia arXiv citada en los tags (no verificada): https://arxiv.org/abs/2611.15302
