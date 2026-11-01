# shubhambaid/LFM3-VL-2B-MLX-mixed-v8p8b4e4

## Resumen

LFM3-VL-2B-MLX-mixed-v8p8b4e4 es una cuantización mixta del modelo vision-language LiquidAI/LFM3-VL-2B, publicada por el usuario shubhambaid en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una receta de cuantización que combina precisión de 4 y 8 bits por componente para reducir el peso del checkpoint a 1,266 GB, un 20 % menos que la versión oficial de 4 bits de LiquidAI (1,591 GB). El modelo base es un transformer multimodal de 1.918 millones de parámetros que procesa imagen y texto para generar respuestas conversacionales.

La propuesta del autor es mantener intacto el backbone de lenguaje de la versión oficial de 4 bits (entrenada con destilación consciente de cuantización) y cuantizar a 8 bits los componentes que LiquidAI dejó en bf16: la torre de visión (164 M de parámetros) y el proyector (25 M). Además, re-cuantiza el embedding atado de 8 a 4 bits con grupo de 64. El resultado es un checkpoint orientado a Apple Silicon mediante la librería mlx-vlm, con una fidelidad al modelo bf16 de referencia prácticamente indistinguible según las métricas publicadas por el autor.

Es relevante ahora porque el ecosistema MLX carece de cuantizaciones que aborden la torre de visión, y esta propuesta demuestra que es posible reducir el tamaño sin degradar la precisión en tareas de document understanding, OCR y grounding visual. La licencia lfm1.0 impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (LFM3): backbone de lenguaje de 24 capas + torre de visión de 14 capas + proyector |
| Parametros totales | 1.918.181.888 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: backbone 4-bit gs32 (QAD), embedding/LM head 4-bit gs64, torre de visión 8-bit gs64, proyector 8-bit gs64 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (MLX), librería mlx-vlm, custom_code |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B sigue una arquitectura transformer multimodal compuesta por un backbone de lenguaje de 24 capas (1,47 B de parámetros), una torre de visión de 14 capas (164 M) y un proyector de 25 M que alinea las representaciones visuales con el espacio del lenguaje. El embedding está atado con la cabeza LM (262 M). Esta ficha describe una cuantización, no un entrenamiento nuevo: los pesos del backbone de lenguaje son idénticos byte a byte a los de LiquidAI/LFM3-VL-2B-MLX-4bit, que según su model card fue entrenado con destilación consciente de cuantización (QAD). El autor verificó tensor por tensor esa equivalencia.

La innovación técnica reside en la asignación de precisión por componente. La torre de visión y el proyector, que LiquidAI distribuye en bf16, se cuantizan aquí a 8 bits con grupo de 64. El embedding atado se re-cuantiza de 8 a 4 bits con grupo de 64. El autor documenta que la cuantización a 4 bits de la torre de visión supone un precipicio de calidad (KL 0,052 frente a 0,009 a 6 bits y 0,003 a 8 bits), mientras que 8 bits en visión y proyector cuestan aproximadamente 0,005 de KL. La selección de recetas se hizo por divergencia KL con teacher forcing sobre 270 ítems retenidos (8.950 posiciones), no solo por precisión en benchmarks. No se especifican datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de documentos: DocVQA evalúa preguntas sobre documentos escaneados.
- Comprensión de gráficos: ChartQA mide la lectura de gráficos y figuras.
- OCR y extracción de texto en imágenes: OCRBench.
- Grounding visual y referencia de objetos: RefCOCO.
- Interacción con interfaces de usuario: ScreenSpot-v2 evalúa la localización de elementos en capturas de pantalla.
- Modo de razonamiento (thinking): la plantilla abre `<think>` por defecto; el autor reporta resultados con razonamiento activado en ChartQA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible (el modelo es vision-language).

## Casos de uso

- Procesamiento de documentos en local sobre Apple Silicon: el checkpoint de 1,266 GB cabe en memoria unificada de un Mac con 8 GB o más y permite responder preguntas sobre facturas, contratos o formularios escaneados sin conexión, con una precisión en DocVQA de 89,4 frente a 90,1 de la versión oficial de 4 bits.
- Extracción de datos de gráficos y tablas: con ChartQA en 81,7 (no-think) y 91,0 (thinking), es adecuado para pipelines que digitalizan informes financieros o dashboards a partir de capturas, ejecutándose en portátiles sin GPU dedicada.
- Digitalización y búsqueda de texto en imágenes: OCRBench de 81,3 permite construir índices de texto a partir de archivos fotografiados o escaneados en aplicaciones de archivo personal.
- Automatización de pruebas de interfaz de usuario: ScreenSpot-v2 de 88,7 permite localizar elementos en capturas de pantalla para generar scripts de test o asistentes de accesibilidad que describan la UI.
- Anotación asistida de imágenes y datasets: RefCOCO de 83,7 facilita el preetiquetado de bounding boxes y referencias de objetos en flujos de etiquetado, reduciendo el trabajo manual en proyectos de visión.
- Prototipado de asistentes visuales en macOS/iOS: al usar mlx-vlm, se integra en aplicaciones nativas de Apple Silicon con un consumo de memoria pico reportado de 4,10 GB a resolución por defecto (16,7 Mpx), inferior a los 4,43 GB de la versión oficial de 4 bits.
- Evaluación comparativa de recetas de cuantización: sirve como referencia para investigadores que estudien el impacto de cuantizar la torre de visión, ya que el autor publica KL, acuerdo top-1 y métricas pareadas frente a bf16 y otras siete cuantizaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor (no-think, greedy, max_pixels = 1.048.576, n=300 por benchmark, mismos 1.500 ítems para todos los modelos):

| Modelo | Pesos (GB) | Media | DocVQA | ChartQA | OCRBench | ScreenSpot-v2 | RefCOCO | Δ vs 4-bit oficial (IC 95 %) | Δ vs bf16 (IC 95 %) |
|---|---|---|---|---|---|---|---|---|---|
| bf16 (referencia) | 3,836 | 84,9 | 89,1 | 81,7 | 82,0 | 88,3 | 83,3 | -0,75 [-1,77, +0,25] | — |
| LiquidAI 4-bit (oficial, QAD) | 1,591 | 85,6 | 90,1 | 83,3 | 81,3 | 88,7 | 84,7 | — | +0,75 [-0,24, +1,77] |
| Este modelo | 1,266 | 85,0 | 89,4 | 81,7 | 81,3 | 88,7 | 83,7 | -0,68 [-1,43, +0,04] | +0,07 [-0,93, +1,11] |
| v8/p8/b4/e8 (embedding 8-bit) | 1,414 | 84,9 | 89,1 | 82,0 | 80,7 | 89,0 | 83,7 | -0,74 [-1,40, -0,09] | +0,01 [-1,01, +1,04] |
| LiquidAI 5-bit (oficial) | 1,568 | 85,2 | 88,9 | 83,7 | 81,7 | 87,3 | 84,3 | -0,44 [-1,39, +0,47] | +0,31 [-0,55, +1,18] |
| nativ-community 4-bit | 1,352 | 84,5 | 88,9 | 81,7 | 81,3 | 87,3 | 83,0 | -1,17 [-2,33, -0,04] | -0,42 [-1,54, +0,67] |
| nativ-community mxfp4 | 1,298 | 84,3 | 89,6 | 83,0 | 82,0 | 84,3 | 82,7 | -1,31 [-2,55, -0,06] | -0,56 [-1,75, +0,67] |
| RTN v8/p8/b5/e4 | 1,358 | 84,7 | 88,2 | 82,7 | 82,0 | 87,7 | 83,0 | -0,92 [-1,98, +0,11] | -0,17 [-1,07, +0,74] |

Fidelidad al bf16 medida por divergencia KL (270 ítems retenidos, 8.950 posiciones):

| Modelo | Pesos (GB) | KL a bf16 ↓ | Acuerdo top-1 |
|---|---|---|---|
| Este modelo | 1,266 | 0,0334 | 95,3 % |
| nativ-community mxfp4 | 1,298 | 0,0928 | 91,8 % |
| nativ-community 4-bit | 1,352 | 0,0599 | 93,6 % |
| nativ-community nvfp4 | 1,352 | 0,0735 | 93,3 % |
| v8/p8/b4/e8 | 1,414 | 0,0307 | 95,5 % |
| LiquidAI 5-bit (oficial) | 1,568 | 0,0164 | 96,7 % |
| LiquidAI 4-bit (oficial, QAD) | 1,591 | 0,0284 | 95,8 % |
| mlx-community OptiQ-4bit | 1,689 | 0,0291 | 95,6 % |
| LiquidAI MLX-6bit | 1,784 | 0,0039 | 98,2 % |
| OsaurusAI JANG_6M | 2,041 | 0,0019 | 98,9 % |
| LiquidAI MLX-8bit | 2,216 | 0,0008 | 99,2 % |

Modo razonamiento (ChartQA, n=100, T=0,1, top_k=50, repetition_penalty=1,1):

| Modelo | ChartQA (thinking) | Sin terminar a 2048 tok | Tokens medios | Tokens p90 | s/muestra |
|---|---|---|---|---|---|
| LiquidAI 4-bit (oficial, QAD) | 91,0 | 6 % | 289 | 420 | 2,3 |
| Este modelo | 91,0 | 5 % | 282 | 438 | 2,1 |
| bf16 (referencia) | 93,0 | 5 % | 270 | 433 | 4,6 |

Resolución por defecto (16,7 Mpx):

| Modelo | DocVQA | s/muestra | Memoria pico |
|---|---|---|---|
| LiquidAI 4-bit (oficial, QAD) | 89,7 | 4,92 | 4,43 GB |
| Este modelo | 90,0 | 5,22 | 4,10 GB |

## Requisitos de hardware

- Inferencia en Apple Silicon exclusivamente: la librería es mlx-vlm y el formato de pesos es MLX safetensors; no hay pesos GGUF ni compatibilidad con CUDA en este repositorio.
- VRAM/memoria unificada estimada: el checkpoint ocupa 1,266 GB; el autor reporta una memoria pico de 4,10 GB a resolución de 16,7 Mpx. Con imágenes de menor resolución y contexto corto, el consumo será inferior.
- Cabe en equipos consumer: Mac con chip M1 o posterior y 8 GB de memoria unificada como mínimo; 16 GB recomendable para contextos largos o imágenes de alta resolución.
- GPU recomendadas: no aplica (no hay soporte CUDA en este repo). Para CUDA, usar el checkpoint original LiquidAI/LFM3-VL-2B o sus variantes GGUF/ONNX.
- Opciones de despliegue: mlx-vlm (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,1 s/muestra en modo thinking y 5,22 s/muestra en DocVQA a resolución por defecto, medidos por el autor en su hardware (no especificado). El modelo es más rápido que bf16 (4,6 s/muestra en thinking) y ligeramente más lento que el 4-bit oficial (2,3 s/muestra en thinking; 4,92 s/muestra en DocVQA).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos (GB) | KL a bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (MLX mixed v8/p8/b4/e4) | 1,92 B | no disponible | 1,266 | 0,0334 | lfm1.0 | HuggingFace, 82 descargas |
| LiquidAI/LFM3-VL-2B-MLX-4bit | 1,92 B | no disponible | 1,591 | 0,0284 | lfm1.0 | HuggingFace (oficial) |
| LiquidAI/LFM3-VL-2B-MLX-6bit | 1,92 B | no disponible | 1,784 | 0,0039 | lfm1.0 | HuggingFace (oficial) |
| nativ-community 4-bit | 1,92 B | no disponible | 1,352 | 0,0599 | no disponible | HuggingFace (comunidad) |

Frente al 4-bit oficial, este modelo es un 20 % más pequeño y pierde 0,68 puntos de media en cinco benchmarks (IC [-1,43, +0,04]), con una fidelidad KL ligeramente peor (0,0334 frente a 0,0284). Frente al 6-bit oficial, es un 29 % más pequeño pero con una KL casi un orden de magnitud mayor (0,0334 frente a 0,0039); el 6-bit es la opción si prima la fidelidad sobre el tamaño. Frente a la cuantización de la comunidad nativ-community, es más pequeño y con mejor KL (0,0334 frente a 0,0599).

## Limitaciones y advertencias

- Licencia lfm1.0: no es una licencia permisiva tipo Apache o MIT; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. La model card la etiqueta como "other".
- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del modelo base LiquidAI/LFM3-VL-2B, no documentados en esta ficha.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación en la información disponible.
- Idiomas soportados: no disponibles; no se puede asumir un rendimiento multilingüe sin verificación.
- Longitud de contexto: no disponible; los benchmarks usan respuestas cortas, descripciones de 96 tokens y trazas de razonamiento de 192 tokens, lo que no valida contextos largos.
- En modo thinking, entre el 5 % y el 6 % de las generaciones no terminan antes de 2048 tokens, lo que exige timeouts y truncado en producción.
- Dependencia exclusiva de Apple Silicon y de mlx-vlm: no hay pesos GGUF, ONNX ni compatibilidad con CUDA en este repositorio, lo que limita el despliegue en servidores.
- Los benchmarks los publica el autor de la cuantización, no un tercero independiente; las muestras son de n=300 (y n=100 en thinking), con intervalos de confianza que en varios casos cruzan el cero.
- El hardware usado para medir latencia y memoria pico no se especifica, por lo que las cifras de s/muestra no son directamente extrapolables a otros equipos.
- El repositorio tiene 0 likes y 82 descargas: es un artefacto de comunidad sin validación amplia.

## Enlaces

- HuggingFace: https://huggingface.co/shubhambaid/LFM3-VL-2B-MLX-mixed-v8p8b4e4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Cuantización oficial 4-bit usada como backbone: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- Cuantización oficial 6-bit: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-6bit
- Cuantización oficial 8-bit: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit
- Cuantización de la comunidad nativ-community: https://huggingface.co/nativ-community/LFM3-VL-2B-nvfp4
- Cuantización mlx-community OptiQ: https://huggingface.co/mlx-community/LFM3-VL-2B-OptiQ-4bit
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
