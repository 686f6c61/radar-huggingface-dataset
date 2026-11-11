# mradermacher/Diffbot-Small-XL-2508-GGUF

## Resumen

Diffbot-Small-XL-2508 es un modelo de lenguaje desarrollado por Diffbot, una empresa conocida por sus servicios de extracción de datos web y grafos de conocimiento. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base cuenta con aproximadamente 30.500 millones de parámetros (30,53B), lo que lo sitúa en la categoría de modelos de tamaño medio-grande, adecuado para tareas conversacionales y de razonamiento con requisitos de hardware moderados.

La relevancia de esta publicación radica en que facilita el acceso a un modelo de 30B en formatos cuantizados que van desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), permitiendo su despliegue en GPUs de consumo como la RTX 4090 (24 GB) con cuantizaciones Q4 o Q5. El repositorio tiene 86 descargas y fue creado en agosto de 2025, con actualización en noviembre de 2026.

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni las capacidades específicas del modelo base en la información proporcionada. La model card del repositorio cuantizado es una plantilla estándar de mradermacher que no incluye detalles técnicos del modelo original. Los datos disponibles se limitan al número de parámetros, el tamaño del repositorio, el idioma declarado (inglés) y la lista de cuantizaciones ofrecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers) |
| Parametros totales | 30.532.122.624 (30,53B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repo | 208,1 GB |
| Modelo base | diffbot/Diffbot-Small-XL-2508 |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Diffbot-Small-XL-2508 en la documentación proporcionada. El repositorio cuantizado indica que el modelo es compatible con la librería transformers y que el proceso de conversión a GGUF utilizó `convert_type: hf` y `output_tensor_quantised: 1`, lo que sugiere una arquitectura transformer estándar con pesos en safetensors en el modelo original. No se confirma si emplea atención lineal, decodificación especulativa, mezcla de expertos (MoE) u otras innovaciones arquitectónicas.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. El tag `conversational` en Hugging Face sugiere que el modelo ha sido optimizado para diálogo, pero no se aportan detalles sobre el proceso. El tamaño de 30,53B parámetros y el nombre "Small-XL" indican que Diffbot posiciona este modelo como una variante de tamaño medio dentro de su familia, probablemente orientada a tareas de extracción de información y conversación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas de razonamiento, código o matemáticas.
- Idiomas: únicamente inglés declarado; no se confirma soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse en infraestructuras de inferencia compatibles con Hugging Face Endpoints.

## Casos de uso

- Atención al cliente automatizada en inglés: el modelo puede gestionar conversaciones multi-turno gracias a su orientación conversacional, aunque se desconoce la longitud exacta de contexto disponible. Adecuado para empresas que operan en inglés y necesitan un modelo de 30B desplegable en infraestructura propia.
- Extracción de información estructurada: dado el origen de Diffbot (empresa especializada en extracción de datos web), es plausible que el modelo esté optimizado para tareas de parsing y extracción, aunque no se confirma en la documentación. Se usaría para procesar documentos y generar salidas estructuradas en formato JSON.
- Despliegue en hardware de consumo: con cuantización Q4_K_M (18,7 GB), el modelo cabe en una RTX 4090 (24 GB) o en dos RTX 3090 (24 GB cada una), permitiendo inferencia local para prototipos y desarrollo.
- Generación de texto en pipelines de CI/CD: mediante llama.cpp o Ollama, el modelo puede integrarse en flujos automatizados de generación de documentación o resúmenes en inglés.
- Investigación y evaluación de modelos: el formato GGUF y la disponibilidad de múltiples cuantizaciones facilitan experimentos de benchmarking y comparación de calidad entre niveles de compresión.
- Chatbot especializado en dominio inglés: para aplicaciones que requieren un modelo de 30B con licencia por determinar (no disponible), desplegable en servidores con GPUs A100 o H100 para mayor throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: 11,4 GB
  - Q3_K_S: 13,4 GB
  - Q3_K_M: 14,8 GB
  - Q3_K_L: 16,0 GB
  - IQ4_XS: 16,7 GB
  - Q4_K_S: 17,6 GB
  - Q4_K_M: 18,7 GB
  - Q5_K_S: 21,2 GB
  - Q5_K_M: 21,8 GB
  - Q6_K: 25,2 GB
  - Q8_0: 32,6 GB
  - F16: aproximadamente 61 GB (estimado a partir de 30,53B parámetros × 2 bytes)
- GPU recomendadas:
  - RTX 4090 (24 GB): cabe con Q4_K_M, Q5_K_M y Q6_K (este último al límite, requiere gestión cuidadosa de memoria).
  - RTX 3090 (24 GB): mismas opciones que la RTX 4090.
  - A100 (40 GB u 80 GB): permite Q8_0 y F16 con holgura.
  - H100 (80 GB): permite F16 y despliegue con vLLM para alto throughput.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con cuantizaciones Q4-Q6; en GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo con Q2_K o Q3_K_S, con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura específica).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas. Se indica "no disponible" para los campos que requerirían datos no proporcionados.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Diffbot-Small-XL-2508 (GGUF) | 30,53B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base (diffbot/Diffbot-Small-XL-2508) antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se dispone de datos específicos sobre la tasa de alucinación de este modelo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; no se puede planificar su uso en tareas que requieran ventanas largas sin verificar este dato en el modelo base.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El repositorio cuantizado no incluye información sobre el proceso de alineación (RLHF/DPO) del modelo base, lo que impide evaluar su comportamiento en temas sensibles.
- Los cuantizados con imatrix (weighted/imatrix quants) no están disponibles según la model card; solo se ofrecen cuantizaciones estáticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Diffbot-Small-XL-2508-GGUF
- Modelo base: https://huggingface.co/diffbot/Diffbot-Small-XL-2508
- Página de descargas del cuantizador: https://hf.tst.eu/model#Diffbot-Small-XL-2508-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Graph de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
