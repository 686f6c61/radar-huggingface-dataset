# SkyContact/Nemotron-3.5-Parse-GGUF

## Resumen

Nemotron-3.5-Parse-GGUF es la cuantización en formato GGUF del modelo NVIDIA Nemotron-3.5-Parse, un parser de documentos multimodales (image-text-to-text) especializado en extraer estructura de páginas: bloques de layout con clase, cajas delimitadoras y texto. Lo publica el usuario SkyContact para su motor de inferencia SkyVision.cpp, una implementación pura de ggml sin dependencia de llama.cpp, verificada contra la implementación oficial en PyTorch. Con 628,7 millones de parámetros, es un modelo compacto orientado a una tarea muy concreta, no a conversación general.

La relevancia de este checkpoint es práctica: permite ejecutar un parser de documentos de NVIDIA en CPU y en GPU de consumo con un único fichero de 1,3 GB en f16, manteniendo una fidelidad numérica demostrada frente al stack original (los 159 tokens greedy de una página completa son idénticos). No es un VLM conversacional: acepta un prompt de control fijo de seis tokens y procesa una página por llamada.

El modelo está pensado para pipelines de digitalización de documentos, extracción de tablas y conversión de PDFs o capturas a Markdown o JSON estructurado, con soporte de tablas LaTeX reconvertidas a HTML por el motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con torre de visión y decoder; detalles internos no especificados en la información disponible) |
| Parametros totales | 628.701.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (una página por llamada; salidas típicas de 2–8k tokens en páginas densas) |
| Tipos de cuantizacion | f16 (recomendada) y q8_0 |
| Idiomas soportados | en |
| Licencia | openmdw-1.1 (OpenMDW 1.1, pesos y tokenizer de NVIDIA) |
| Formato de pesos | GGUF (f16 y q8_0); tokenizer.json, tokenizer_config.json y special_tokens_map.json sin modificar |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base NVIDIA Nemotron-3.5-Parse más allá de que combina una torre de visión con un decoder que genera una secuencia de bloques de layout. La model card del GGUF menciona explícitamente una "vision tower" y un proceso de prefill y decode separados, y señala que la torre está limitada por atención y que la decodificación está limitada por latencia de kernel, no por ancho de banda de pesos. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación.

La innovación destacable de esta publicación no está en el modelo sino en la conversión: el autor verifica etapa por etapa contra la implementación oficial en PyTorch (scripts `ref_nemotron_parse.py` y `convert/compare_dumps.py`), con un campo de posición normalizado exacto a nivel de elemento (2,7e-7), embeddings de parches con diferencia de 2,8e-3 atribuida al ruido de pesos f16, y coincidencia total en los 159 tokens greedy de una página completa, incluida la tabla HTML generada a partir del LaTeX del modelo. El motor SkyVision.cpp es ggml puro, sin llama.cpp, y expone el modelo como herramienta MCP `parse_document`.

## Capacidades

- Parsing de documentos: recibe una página (escaneo, captura de pantalla o página de PDF) y devuelve bloques de layout con clase, cajas delimitadoras y texto.
- Salida en Markdown: renderiza el resultado como Markdown, convirtiendo tablas LaTeX y tablas de gráficos con pipes a tablas HTML.
- Salida en JSON: bloques estructurados con bounding boxes normalizadas y en píxeles.
- Salida en modo raw: flujo de tokens de control propio del modelo.
- Análisis de layout: clasificación de elementos de página además de la extracción de texto.
- OCR: reconocimiento de texto dentro de los bloques detectados.
- Procesamiento de tablas: reconstrucción de tablas, incluidas las expresadas en LaTeX en la salida del modelo.
- Prompt de control fijo de seis tokens: no admite preguntas en lenguaje libre.
- Una página por llamada: no procesa documentos multipágina en una sola invocación.
- Integración como herramienta MCP (`parse_document`) en el motor SkyVision.cpp.
- Idiomas: únicamente inglés.

## Casos de uso

- Digitalización masiva de archivos PDF: cada página se envía al modelo con `--ask parse --mode markdown` y se obtiene Markdown con tablas convertidas a HTML, adecuado para ingerir documentos escaneados en un repositorio de conocimiento o en un sistema de búsqueda.
- Extracción estructurada para RAG: el modo JSON devuelve bloques con clase y bounding boxes normalizadas y en píxeles, lo que permite indexar por tipo de elemento (párrafo, tabla, título) y conservar la referencia espacial a la página original.
- Procesamiento de facturas y formularios escaneados: el análisis de layout separa campos y tablas del texto corrido, lo que facilita la extracción posterior de importes y líneas de detalle con coordenadas de origen.
- Conversión de documentación técnica con tablas: la reconstrucción de tablas LaTeX a HTML resulta útil para migrar manuales y papers a formato web o Markdown sin perder la estructura tabular.
- Despliegue en local o en el borde: con 1,3 GB en f16 y 866 MB en q8_0, cabe en estaciones de trabajo sin GPU dedicada; en CPU (19 hilos) procesa una página de 1000×1300 en 16,3 s de torre de visión más 0,83 s de prefill, y en una RTX 4070 SUPER en 0,64 s y 0,019 s respectivamente.
- Automatización de ingesta con agentes: al exponerse como herramienta MCP `parse_document`, un agente puede invocarlo para leer una página concreta y continuar el flujo con el Markdown o JSON devuelto.
- Ajuste de resolución frente a latencia: con `NEMOTRON_PARSE_MAX_EDGE=1024` se reduce la resolución de página para acelerar el proceso en lotes grandes donde la fidelidad tipográfica no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad frente a PyTorch y de velocidad:

| Metrica | Resultado |
|---|---|
| Campo de posición normalizado (vs. PyTorch) | exacto a nivel de elemento (2,7e-7) |
| Embeddings de parches (vs. PyTorch) | diferencia de 2,8e-3 (ruido de pesos f16) |
| Tokens greedy de una página completa | 159 de 159 idénticos, incluida la tabla HTML |

| Página de 1000×1300 (1313 tokens visuales / 158 de salida) | Torre de visión | Prefill | Decode |
|---|---|---|---|
| CPU (19 hilos) | 16,3 s | 0,83 s | 11,0 ms/token |
| CUDA (RTX 4070 SUPER) | 0,64 s | 0,019 s | 1,6 ms/token |

## Requisitos de hardware

- VRAM estimada: el fichero f16 ocupa 1,3 GB y el q8_0 866 MB; el consumo real de memoria añade las activaciones de la torre de visión y la caché de tokens de salida (2–8k tokens en páginas densas).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM libre; el autor ha verificado CUDA en una RTX 4070 SUPER. Para mayor throughput, GPU de datacenter tipo A100 o H100, aunque no se aportan medidas en esas tarjetas.
- GPU de consumo: sí, cabe en tarjetas consumer modernas; la RTX 4070 SUPER es el caso medido.
- CPU: funciona en CPU (medido con 19 hilos), aunque la torre de visión domina el tiempo (16,3 s por página en el caso medido).
- Opciones de despliegue: motor SkyVision.cpp (`vqa-cli`), compilado con CMake y Ninja; exposición como herramienta MCP `parse_document`. No se indica compatibilidad con llama.cpp, vLLM, TGI, Ollama ni otros runners; el autor señala explícitamente que el motor no depende de llama.cpp.
- Latencia y throughput: 1,6 ms/token en decode y 0,64 s de torre de visión por página en RTX 4070 SUPER; 11,0 ms/token y 16,3 s por página en CPU de 19 hilos.
- Nota de rendimiento: el autor advierte que q8_0 es más lento que f16 tanto en CPU como en GPU para este modelo, porque la torre está limitada por atención y la decodificación por latencia de kernel, no por ancho de banda de pesos. Recomienda f16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Parse-GGUF (este) | 628,7 M | no disponible (1 página/llamada) | en | openmdw-1.1 | GGUF f16, q8_0 | Parser de documentos; requiere SkyVision.cpp; prompt de control fijo |
| nvidia/Nemotron-3.5-Parse | no disponible | no disponible | en | openmdw-1.1 | safetensors (PyTorch) | Modelo base original; referencia de fidelidad para esta conversión |
| Alternativas de parsing de documentos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros parsers en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (parsers de documentos multimodales) con la que construir una comparativa con cifras verificadas.

## Limitaciones y advertencias

- No es un modelo conversacional: solo acepta un prompt de control fijo de seis tokens; las preguntas en lenguaje libre no están soportadas.
- Procesa una única página por llamada; los documentos multipágina requieren iteración externa.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y no debe asumirse.
- El modelo base es de NVIDIA y los pesos conservan su licencia OpenMDW 1.1; el código de conversión y el motor de inferencia son proyectos separados con sus propias licencias. Conviene revisar los términos de OpenMDW 1.1 antes de un uso comercial.
- Dependencia del motor SkyVision.cpp: no se documenta compatibilidad con llama.cpp, Ollama, vLLM u otros runners, lo que limita la portabilidad del despliegue.
- El autor advierte que q8_0 es más lento que f16 en este modelo; elegir q8_0 por tamaño puede degradar la latencia.
- La fidelidad verificada se refiere a una página concreta de prueba (159 tokens greedy); no constituye una garantía de exactitud en todos los dominios documentales.
- Riesgo de alucinación en el texto extraído y en la reconstrucción de tablas: no se documentan tasas de error por tipo de documento, por lo que en producción conviene validar la salida, especialmente en tablas complejas.
- El repo tiene un volumen de descargas bajo (175) y ningún like en el momento de la consulta; es una conversión de un tercero, no una publicación oficial de NVIDIA.
- `--max-tokens` debe dimensionarse con holgura: una página densa consume entre 2 y 8k tokens de salida.

## Enlaces

- Hugging Face (este GGUF): https://huggingface.co/SkyContact/Nemotron-3.5-Parse-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia del modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse/blob/main/LICENSE
- Motor de inferencia SkyVision.cpp: https://github.com/SkYContact/SkyVision.cpp
- Mirror en ModelScope: https://modelscope.cn/models/SkyContact/Nemotron-3.5-Parse-GGUF
