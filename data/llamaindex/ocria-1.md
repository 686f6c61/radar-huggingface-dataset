# llamaindex/OCRia-1

## Resumen

OCRia-1 es un modelo de visión-lenguaje de 4B parámetros desarrollado por LlamaIndex para el parseo de documentos. Recibe como entrada la imagen de una página y devuelve su contenido en Markdown, con las tablas en HTML y las fórmulas en LaTeX. Está afinado a partir de Qwen/Qwen3.5-4B y se distribuye con pesos BF16 sin optimizar en el repositorio de Hugging Face; la versión que sirve LlamaParse es el mismo modelo cuantizado, con decodificador especulativo y kernels propios, lo que lo hace aproximadamente diez veces más rápido.

El modelo está diseñado específicamente para los casos que los parsers de documentos suelen fallar: celdas combinadas y cabeceras que abarcan varias columnas, tablas con miles de celdas, gráficos cuyos datos hay que leer del propio trazado, y formato con significado semántico (tachado, subrayado, subíndices, superíndices, casillas de verificación). Según el autor, es el modelo de pesos abiertos con mayor puntuación en los dos leaderboards de ParseBench, con 85,2 en ParseBench 2 (séptimo de 61 sistemas) y 84,7 en ParseBench 1 (segundo de 158).

Su relevancia actual radica en que sustituye la cadena clásica de parseo (detector de layout, motor OCR y capa de texto) por una sola llamada por página a partir de la imagen, y en que sus pesos están disponibles abiertamente bajo una licencia propia, lo que permite desplegarlo en infraestructura propia para pipelines de ingestión de documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer, derivada de Qwen/Qwen3.5-4B |
| Parámetros totales | 5.174.964.736 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantización | no disponible (el repositorio contiene pesos BF16 sin optimizar; la versión servida en LlamaParse está cuantizada, sin especificar el esquema) |
| Idiomas soportados | en (inglés declarado); los ejemplos incluyen una nota manuscrita en checo |
| Licencia | ocria-1-license (licencia propia, etiquetada como `other`) |
| Formato de pesos | safetensors (también joblib en el repositorio) |

## Arquitectura y entrenamiento

OCRia-1 es un modelo de visión-lenguaje construido sobre Qwen/Qwen3.5-4B, con 5.174.964.736 parámetros totales. El pipeline declarado es `image-text-to-text`: el modelo procesa una imagen de página y genera directamente la transcripción estructurada, sin depender de un detector de layout, un motor OCR externo ni la capa de texto del PDF. Las cajas de layout se añaden a posteriori, de forma opcional y experimental.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Sí se indica que el modelo está afinado para producir un formato de salida muy concreto (Markdown con tablas HTML, fórmulas LaTeX, etiquetas propias para cabeceras, pies, números de página y marcas de agua, y diagramas en Mermaid), y que el chat template de Qwen3.5 activa el modo thinking por defecto, algo que debe desactivarse explícitamente porque con él activado el modelo responde en un formato incorrecto.

La innovación destacable no está en los pesos publicados sino en la pila de inferencia con la que se sirve en producción: cuantización, decodificador especulativo y kernels personalizados, que según el autor reducen el tiempo de respuesta en torno a un factor de diez respecto a los pesos BF16 del repositorio.

## Capacidades

- Transcripción de páginas completas a Markdown a partir de la imagen, en una sola llamada por página.
- Tablas en HTML con cabeceras anidadas, celdas combinadas expresadas como `colspan` / `rowspan`, rejillas irregulares y tablas financieras largas de miles de celdas.
- Conversión de gráficos en tablas HTML de sus puntos de datos, con cada valor bajo la serie y la etiqueta correctas (82,5 en gráficos de ParseBench 1, frente a 69,1 del siguiente mejor modelo de pesos abiertos).
- Formatos con significado: negrita, cursiva, tachado, subrayado, resaltados, subíndices y superíndices, casillas `[ ]` / `[x]` y campos en blanco `[___]`.
- Fórmulas en LaTeX, incluidas las manuscritas.
- Estructura de página: cabeceras, pies, números de página y marcas de agua en etiquetas propias; texto multicolumna desenrollado; diagramas como Mermaid.
- Grounding visual incluido en la evaluación, con cajas de layout añadidas después del parseo (experimental).
- Interfaz conversacional vía API compatible con OpenAI (servida con vLLM), con `prompt.txt` como mensaje de sistema y la imagen de página como único contenido de usuario.
- Capacidad multilingüe no declarada formalmente: el modelo solo lista inglés, aunque los ejemplos incluyen contenido en checo.

## Casos de uso

- Ingestión de documentos financieros: estados de flujo de caja, estados de cuenta bancaria y declaraciones de tarifas de seguros con cabeceras de varios niveles. El modelo reconstruye las celdas combinadas como `colspan` / `rowspan`, lo que permite cargar la tabla directamente en un dataframe sin postprocesado manual de la rejilla.
- Extracción de datos de gráficos en informes: un gráfico de líneas con tres series a lo largo de cinco años se convierte en una tabla de sus 15 puntos de datos alineados con las etiquetas impresas, lo que evita tener que digitalizar el gráfico a mano.
- Digitalización de expedientes judiciales y administrativos: avisos de audiencia con casos retirados tachados, nombres subrayados y horas en negrita se transcriben conservando la semántica del formato, algo crítico cuando el tachado indica una anulación.
- Procesamiento de documentación científica y técnica: las fórmulas, incluidas las manuscritas, se emiten en LaTeX, lo que permite reutilizarlas en publicaciones, wikis o sistemas de búsqueda matemática.
- Alimentación de pipelines RAG: al devolver Markdown limpio con tablas HTML y estructura de página etiquetada, el resultado se trocea y se indexa directamente sin una etapa intermedia de limpieza de layout.
- Parseo de documentos multipágina en producción: aunque el modelo procesa una página por llamada, se integra en LlamaParse para manejar documentos completos; con vLLM y el decodificador especulativo de la pila de inferencia del autor se puede servir a escala sobre GPU.
- Extracción de datos de diagramas: los diagramas se emiten como Mermaid, lo que permite reconstruir flujos y arquitecturas representados gráficamente en documentación técnica.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| ParseBench 2 (seis dimensiones) | 85,2 (7.º de 61 sistemas; mejor modelo de pesos abiertos) | — |
| ParseBench 1 (cinco dimensiones) | 84,7 (2.º de 158; mejor modelo de pesos abiertos) | — |
| ParseBench 1, gráficos | 82,5 | 69,1 del siguiente mejor modelo de pesos abiertos |
| olmOCR-bench, tablas | primer puesto | — |
| olmOCR-bench, fórmulas | primer puesto | — |
| PulseBench-Tab | primer puesto | — |
| fr-bench-pdf2md | primer puesto | — |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas; el autor solo reporta evaluaciones específicas de parseo de documentos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 5.174.964.736 parámetros en BF16, los pesos ocupan aproximadamente 10,4 GB (tamaño del repositorio), a los que hay que sumar la caché KV para hasta 32.768 tokens y el procesamiento de imagen; en la práctica se necesita margen por encima de esa cifra.
- GPU recomendadas: no especificadas por el autor. El despliegue de referencia es vLLM 0.30 o posterior, que compila kernels para esta arquitectura al arrancar y requiere el CUDA toolkit (`nvcc`); la imagen Docker `vllm/vllm-openai` lo incluye.
- GPU de consumo: no confirmado. El tamaño de los pesos BF16 permitiría en teoría cargarlos en GPU de 16 GB o más con cuantización, pero el autor no publica una receta de cuantización ni requisitos mínimos verificados.
- Opciones de despliegue: vLLM (servidor compatible con OpenAI y uso offline con `LLM`), imagen Docker `vllm/vllm-openai`, y distribución vía Ollama (`ollama.com/llamaindex/ocria-1`).
- Latencia y throughput: no se publican cifras absolutas. El autor indica que la versión servida en LlamaParse, cuantizada y con decodificador especulativo y kernels propios, es aproximadamente diez veces más rápida que los pesos BF16 del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 | 5.174.964.736 | 32.768 tokens | VLM de parseo de documentos a Markdown | ocria-1-license (propia) | Pesos BF16 en Hugging Face; servicio en LlamaParse; Ollama |
| Modelos de pesos abiertos evaluados en ParseBench 1 | no disponible | no disponible | Parseo de documentos | no disponible | El autor cita un competidor con 69,1 en gráficos, sin nombrarlo en la información disponible |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información | no disponible | VLM generalista | no disponible | Hugging Face |

La información disponible no identifica por nombre los sistemas comparados en los leaderboards de ParseBench, por lo que no es posible construir una comparativa nominal con alternativas concretas.

## Limitaciones y advertencias

- El modo thinking del chat template de Qwen3.5 está activado por defecto y debe desactivarse (`enable_thinking: False`); con él activo el modelo responde en un formato incorrecto.
- El prompt de sistema debe ser exactamente el contenido de `prompt.txt` del repositorio, sin texto de usuario, y cada página debe enviarse como una única imagen; desviarse de esta configuración degrada la salida.
- El modelo solo declara inglés como idioma soportado. Aunque hay ejemplos con contenido en checo, no hay garantía de calidad multilingüe.
- Procesa una página por llamada; el manejo de documentos multipágina recae en LlamaParse, no en el modelo.
- Las cajas de layout son una funcionalidad experimental y se añaden después del parseo, no forman parte de la salida principal.
- Riesgo de alucinación en contenido poco legible: al generar la transcripción de forma generativa a partir de la imagen, valores numéricos o texto de baja calidad pueden reconstruirse de forma plausible pero incorrecta; conviene validar campos críticos en producción.
- La licencia es propia (`ocria-1-license`), no una licencia estándar de código abierto; es imprescindible revisar el archivo LICENSE antes de un uso comercial.
- Los pesos publicados son BF16 sin optimizar; sin la pila de inferencia del autor (cuantización, decodificador especulativo, kernels propios) el rendimiento es aproximadamente diez veces menor.
- No se publican datos de sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez fuera de los benchmarks de parseo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llamaindex/OCRia-1
- Informe técnico: https://arxiv.org/abs/2611.00092
- Blog de presentación: https://www.llamaindex.ai/blog/parse-ocria-1
- Blog sobre la pila de inferencia: https://www.llamaindex.ai/blog/the-inference-stack-behind-ocria
- LlamaParse: https://cloud.llamaindex.ai
- ParseBench (repositorio): https://github.com/run-llama/ParseBench
- Leaderboard ParseBench: https://parsebench.ai
- Ollama: https://ollama.com/llamaindex/ocria-1
- LlamaIndex: https://www.llamaindex.ai/
- Documentación del framework LlamaIndex: https://developers.llamaindex.ai/python/framework/
