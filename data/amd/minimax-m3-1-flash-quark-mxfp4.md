# amd/MiniMax-M3.1-Flash-Quark-MXFP4

## Resumen

MiniMax-M3.1-Flash-Quark-MXFP4 es una versión cuantizada del modelo multimodal MiniMax-M3.1-Flash, publicada por AMD mediante su herramienta de optimización AMD-Quark. El modelo original lo desarrolla MiniMaxAI y emplea una arquitectura de mezcla de expertos dispersa (MiniMaxM3SparseForConditionalGeneration) que acepta texto, imagen y vídeo como entrada y produce texto. Esta variante concreta cuantiza los pesos y las activaciones de los expertos enrutados a MXFP4 (OCP Microscaling FP4), manteniendo el resto de capas en la precisión del modelo base, con el objetivo de reducir el coste de memoria y acelerar la inferencia en hardware AMD Instinct.

La relevancia de esta publicación es doble. Por un lado, ofrece una ruta práctica para desplegar un modelo de aproximadamente 220.500 millones de parámetros en clústeres con GPUs AMD MI350/MI355 bajo ROCm 7.2.3, usando vLLM o SGLang con decodificación especulativa DSPARK. Por otro lado, demuestra que la cuantización de los expertos enrutados a FP4 conserva prácticamente intacta la precisión del modelo original en las evaluaciones publicadas (recuperación entre el 99,69 % y el 102,41 % en los benchmarks reportados).

El repositorio ocupa 239,5 GB y se distribuye en formato safetensors con código personalizado, bajo licencia minimax-community. Es un artefacto orientado a producción e investigación en infraestructura AMD, no a equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (transformer disperso con mezcla de expertos) |
| Parametros totales | 220.490.854.016 (aproximadamente 220,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 estática para pesos de expertos enrutados; MXFP4 dinámica para activaciones de expertos enrutados; resto de capas en la precisión del modelo base; etiquetado como 8-bit en el repo |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other) |
| Formato de pesos | safetensors (custom_code, minimax_m3_vl) |
| Modalidades de entrada | Texto, imagen, vídeo |
| Modalidad de salida | Texto |
| Hardware soportado | AMD MI350 / MI355 |
| Software requerido | ROCm 7.2.3, PyTorch 2.13.0, Transformers 5.19.0, Linux |
| Motores de inferencia | vLLM, SGLang |
| Herramienta de cuantización | AMD-Quark |
| Modelo base | MiniMaxAI/MiniMax-M3.1-Flash |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del MiniMax-M3.1-Flash original: un transformer con mezcla de expertos dispersa (block_sparse_moe) que incluye expertos compartidos (shared_experts) y una puerta de enrutamiento (block_sparse_moe.gate), además de un vision tower y un proyector multimodal para procesar imagen y vídeo. La variante de AMD no reentrena el modelo; aplica cuantización post-entrenamiento con AMD-Quark sobre los pesos del modelo base.

La cuantización se limita a los expertos enrutados, que pasan de NVFP4 a MXFP4, tanto en pesos (estática) como en activaciones (dinámica). El script de cuantización excluye explícitamente el lm_head, el vision tower, el proyector multimodal, el patch merge MLP, las capas de self-attention, la puerta del MoE, las tres primeras capas MLP del modelo de lenguaje, los expertos compartidos y los componentes DSPARK, que se conservan en su precisión original. El despliegue recomendado incorpora decodificación especulativa DSPARK con 7 tokens especulativos, caché KV en FP8 o NVFP4 y backend de atención FlashInfer (o AITER en ROCm).

## Capacidades

- Generación de texto con razonamiento explícito: el parser de razonamiento `minimax_m3` permite activar el modo de pensamiento (`thinking_mode: enabled`) en las peticiones.
- Procesamiento multimodal de entrada: acepta texto, imágenes y vídeo, y genera respuestas en texto.
- Razonamiento matemático de nivel competitivo, según los resultados en GSM8K, AIME26 y GPQA Diamond.
- Generación y razonamiento sobre código, con resultados reportados en SciCode.
- Tool calling y function calling: los servidores de vLLM y SGLang se configuran con `--tool-call-parser minimax_m3` y `--enable-auto-tool-choice`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Decodificación especulativa DSPARK integrada para acelerar la generación.
- Seguimiento de instrucciones evaluado mediante IFBench y razonamiento de contexto largo evaluado mediante AA-LCR.

## Casos de uso

- Asistencia matemática y científica de alta exigencia: con un 96,90 en GSM8K y un 93,75 en AIME26, el modelo es adecuado para tutores automáticos, verificación de demostraciones y resolución de problemas de competición donde se requiere precisión numérica y razonamiento paso a paso con modo thinking.
- Análisis de documentos técnicos con componentes visuales: la entrada multimodal permite procesar figuras, diagramas y tablas de papers o informes junto al texto, útil en herramientas de revisión científica y extracción de información.
- Agentes autónomos con tool calling: la combinación de parsers de herramientas en vLLM y SGLang y el modo de razonamiento habilita pipelines de agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecución de código.
- Generación y revisión de código en CI/CD: con un 49,27 en SciCode, puede integrarse como revisor automático de parches, generador de tests o asistente en tareas de refactorización dentro de pipelines que invoquen el endpoint compatible con OpenAI.
- Procesamiento de vídeo para moderación o catalogación: la entrada de vídeo permite construir clasificadores y resumidores de contenido audiovisual, con la salida de texto enrutada a sistemas de indexación.
- Razonamiento sobre contextos largos: los resultados en AA-LCR (74,00) indican utilidad en tareas de comprensión de documentos extensos, como análisis de contratos o informes regulatorios, siempre que se confirme la ventana de contexto efectiva.
- Despliegue en infraestructura AMD a escala: el formato MXFP4 y la integración con AITER permiten servir el modelo en clústeres MI350/MI355 con menor huella de memoria que la versión NVFP4, lo que resulta adecuado para equipos con hardware AMD que necesitan un modelo de frontera.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo base con esta versión cuantizada:

| Benchmark | MiniMax-M3.1-Flash | Quark-MXFP4 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (4-shot) | 97,20 | 96,90 | 99,69 % |
| GPQA Diamond (mean@8) | 86,36 | 87,37 | 101,17 % |
| AIME26 (mean@16) | 93,54 | 93,75 | 100,22 % |
| MMMU Pro, standard (mean@1) | 79,19 | 79,13 | 99,92 % |
| MMMU Pro, vision (mean@1) | 76,99 | 77,57 | 100,75 % |
| SciCode, subproblem (mean@8) | 48,11 | 49,27 | 102,41 % |
| AA-LCR (mean@8) | 73,13 | 74,00 | 101,19 % |
| IFBench (mean@2) | 50,33 | 50,83 | 100,99 % |

No se han publicado en la información disponible datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 239,5 GB, por lo que se requiere un nodo multi-GPU; con tensor parallelism de 4 se reparte en aproximadamente 60 GB por GPU para los pesos, más caché KV y overhead.
- GPU recomendadas: AMD Instinct MI350 y MI355, el hardware para el que se valida el modelo.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el tamaño y la pila de software (ROCm 7.2.3, AITER) lo impiden.
- Software: ROCm 7.2.3, PyTorch 2.13.0, Transformers 5.19.0, Linux.
- Motores de despliegue: vLLM (`vllm serve` con `VLLM_ROCM_USE_AITER=1`, `--tensor-parallel-size 4`) y SGLang (`sglang serve` con `--tp 4`, `--mem-fraction-static 0.8`, `--max-running-requests 128`).
- Optimizaciones incluidas en la configuración de referencia: decodificación especulativa DSPARK con 7 tokens, caché KV en FP8 o NVFP4, backend de atención FlashInfer o AITER, chunked prefill de 32.768 tokens en SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| amd/MiniMax-M3.1-Flash-Quark-MXFP4 | 220,5 mil millones | no disponible | minimax-community | Hugging Face | Cuantización MXFP4 de expertos, orientada a AMD MI350/MI355 |
| MiniMaxAI/MiniMax-M3.1-Flash | no disponible en la información | no disponible | minimax-community | Hugging Face | Modelo base en precisión original (NVFP4 en expertos) |
| Otros modelos de tamaño comparable | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

La información disponible no permite comparar con modelos de otros fabricantes en términos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- La licencia minimax-community es de tipo "other"; deben revisarse sus términos antes de cualquier uso comercial, ya que la información disponible no detalla restricciones.
- El modelo está validado exclusivamente para AMD MI350/MI355 con ROCm 7.2.3; no hay garantías de funcionamiento en otras plataformas.
- La cuantización MXFP4 se aplica solo a los expertos enrutados; el resto de capas conserva la precisión del modelo base, por lo que el ahorro de memoria es parcial.
- Los benchmarks publicados son un conjunto reducido (ocho tareas) y no cubren latencia, throughput ni comportamiento en producción a gran escala.
- No se dispone de información sobre sesgos, idiomas soportados ni tasa de alucinación; debe evaluarse empíricamente antes de desplegar en dominios sensibles.
- El uso de `--trust-remote-code` en SGLang implica ejecutar código del repositorio; conviene auditar los archivos antes de servirlo en entornos compartidos.
- La configuración de referencia requiere ajustes específicos (parsers, DSPARK, AITER, caché KV en FP4); una configuración incorrecta puede degradar la calidad o provocar fallos.
- El tamaño del repositorio (239,5 GB) y el requisito de tensor parallelism de 4 GPUs limitan su uso a infraestructura de centro de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/MiniMax-M3.1-Flash-Quark-MXFP4
- Archivos del repositorio: https://huggingface.co/amd/MiniMax-M3.1-Flash-Quark-MXFP4/tree/main
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Recetas de vLLM: https://recipes.vllm.ai/
- Receta de vLLM para MiniMax-M3.1-Flash en MI355X: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3.1-Flash?hardware=mi355x&variant=mxfp4
- Cookbook de SGLang para MiniMax-M3.1: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3.1
