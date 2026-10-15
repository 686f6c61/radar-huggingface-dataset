# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB es un modelo de visión-lenguaje (VLM) publicado por NVIDIA Corporation, pensado para ejecutar tareas agénticas del día a día en local. Se distribuye en formato GGUF con una cuantización nativa de 2 bits (IQ2) obtenida mediante entrenamiento consciente de la cuantización (QAT), de modo que los 74.042.720.848 parámetros del modelo caben en unos 24 GB de memoria y pueden convivir con otras aplicaciones en la misma máquina.

Arquitectónicamente es un híbrido Mamba-2–Transformer con enrutamiento LatentMoE: 74B parámetros totales y solo 9B activos por token, lo que explica su relación inteligencia/velocidad por GB. Incorpora además un codificador visual C-RADIO v4-H, acepta texto, imágenes y vídeo como entrada, y genera texto. Su ventana de contexto llega hasta 256K tokens y admite decodificación especulativa DFlash con un drafter GGUF independiente.

Es relevante ahora porque propone un punto de equilibrio poco habitual: ser más rápido que la mayoría de modelos densos populares y, según los datos de la propia model card, más preciso que MoE de huella de memoria similar en tareas agénticas, con licencia OpenMDW-1.1 que permite uso comercial y no comercial. El modelo cubre inglés, castellano, francés, alemán, italiano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-2–Transformer con LatentMoE y codificador visual C-RADIO v4-H |
| Parametros totales | 74.042.720.848 (74B) |
| Parametros activos | 9B |
| Longitud de contexto | Hasta 256K tokens (la receta de ejemplo de llama.cpp usa `--ctx-size 98304`) |
| Tipos de cuantizacion | IQ2 (2 bits con quantization-aware training); formato GGUF |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (licencia "other" en HuggingFace, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (modelo, `mmproj` para visión y drafter especulativo LiLiCorr en GGUF) |
| Modalidades de entrada / salida | Texto, imágenes y vídeo / texto |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (relación: quantized) |
| Tamaño del repositorio | 23,8 GB |
| Fechas del modelo | Diciembre 2025 – mayo 2026; corte de datos de post-entrenamiento en mayo de 2026 |
| Modo de razonamiento | Controlado por plantilla de chat (`enable_thinking=True/False`) |
| Muestreo recomendado | Temperatura 1.0, top_p 0.95 (texto) |
| Decodificacion especulativa | DFlash con drafter GGUF separado; hasta 7 tokens de borrador en la receta de 32 GB y 6 en la de 28 GB |
| Despliegue previsto | llama.cpp en RTX / DGX Spark (64 GB / 128 GB) o GPU RTX discretas (32 GB+ / 48 GB+) |

## Arquitectura y entrenamiento

El modelo es un híbrido que combina capas Mamba-2 (modelo de espacio de estados) con capas Transformer, y sustituye el MoE convencional por un esquema LatentMoE con enrutamiento en espacio latente. Con 74B parámetros totales y 9B activos, el coste de cómputo por token se mantiene en el rango de un modelo de 9B, mientras que la capacidad almacenada corresponde a un 74B. La parte visual la aporta un codificador C-RADIO v4-H, que habilita entrada de imágenes y vídeo además de texto. La cuantización a 2 bits no es un post-proceso: se aplicó entrenamiento consciente de la cuantización (QAT) para producir el checkpoint IQ2 que se distribuye en GGUF.

Los datos de entrenamiento provienen de los conjuntos publicados por NVIDIA, `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, con fecha de corte de post-entrenamiento en mayo de 2026. La model card no detalla el número exacto de tokens de pre-entrenamiento ni la composición porcentual del corpus, ni especifica si se emplearon RLHF, DPO u otras técnicas de alineamiento concretas; esa información no está disponible en el material proporcionado. Las innovaciones operativas destacables son la propia cuantización nativa de 2 bits con QAT y la decodificación especulativa DFlash con un drafter GGUF independiente (LiLiCorr), que en las recetas de 28 GB y 32 GB permite validar hasta 6 o 7 tokens de borrador por paso.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Comprensión de imágenes y vídeo como entrada (pipeline `image-text-to-text`), orientada a tareas de interfaz y agentes visuales.
- Razonamiento explícito con modo "thinking" activable o desactivable mediante la plantilla de chat (`enable_thinking=True/False`).
- Razonamiento multi-paso y ejecución de tareas agénticas encadenadas.
- Tool calling y uso de servidores MCP, según se desprende de sus resultados en MCP-Atlas y PinchBench.
- Navegación web y uso de herramientas de búsqueda en entornos agénticos (BrowseComp, WebArena en su variante de visión).
- Generación y razonamiento sobre código, incluidas tareas de terminal y flujos tipo CI (Terminal-Bench, SciCode).
- Cobertura multilingüe en inglés, castellano, francés, alemán, italiano y japonés.
- Despliegue local en una sola GPU de 24 GB gracias a la cuantización IQ2, con soporte de decodificación especulativa para acelerar la generación.

## Casos de uso

- Agentes locales de automatización de escritorio: el modelo puede observar capturas de pantalla mediante el codificador C-RADIO v4-H y decidir la siguiente acción sobre la interfaz, algo que respaldan sus resultados en WebArena (visión), donde obtiene 50,86 frente a 36,60 de Qwen3.6-35B-A3B y 38,2 de Gemma4 26B-A4B.
- Asistente de operaciones en terminal: con 50,98 en Terminal-Bench 2.1, es adecuado para generar y depurar comandos de shell, interpretar salidas de herramientas y resolver tareas de administración de sistemas paso a paso.
- Automatización de banca y back-office con tool calling: sus 17,01 puntos en Tau3 Banking indican capacidad para encadenar llamadas a funciones sobre datos estructurados en flujos con reglas de negocio.
- Investigación asistida con navegación web: puede integrarse en pipelines de recopilación y contraste de fuentes, dado su 66,75 en BrowseComp, muy por encima de las alternativas comparadas.
- Copiloto de código en producción: soporta tool calling y puede conectarse a servidores MCP (52,20 en MCP-Atlas) para consultar repositorios, ejecutar tests o abrir incidencias en un flujo de CI/CD.
- Análisis de documentos largos y contratos: con hasta 256K tokens de contexto y 64,06 en AA-LCR, permite resumir y responder preguntas sobre expedientes extensos sin trocear el documento.
- Atención al cliente multilingüe en local: al cubrir seis idiomas y ejecutarse en una GPU de 24 GB, puede desplegarse on-premise en sectores con requisitos de residencia de datos.
- Evaluación técnica asistida: con 86,43 en GPQA Diamond y 41,02 en SciCode, sirve como apoyo en preguntas de nivel experto en ciencia e ingeniería dentro de un entorno controlado.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | Qwen3.6-35B-A3B BF16 | Gemma4 26B-A4B BF16 | Nemotron 3.5 Lightning 30B-A3B BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) |
|---|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25,75 | 15,33 | 18,26 | 28,47 |
| Terminal-Bench 2.1 | 44,38 | 37,22 | 23,46 | 50,98 |
| Tau3 Banking | 10,52 | 14,02 | 9,48 | 17,01 |
| HLE (sin herramientas) | 19,56 | 17,42 | 10,47 | 25,30 |
| AA-Omniscience accuracy | 19,47 | 22,17 | 16,63 | 16,90 |
| SciCode | 35,33 | 40,28 | 31,38 | 41,02 |
| GPQA Diamond | 83,40 | 79,61 | 75,57 | 86,43 |
| AA-LCR | 61,06 | 57,56 | 49,19 | 64,06 |
| AA-Omniscience non-hallucination | 65,85 | 14,22 | 68,81 | 61,27 |
| PinchBench | 88,07 | 74,70 | 83,43 | 87,82 |
| MCP-Atlas | 51,20* | no disponible | 46,40 | 52,20 |
| BrowseComp | 48,74 | 26,30 | 36,81 | 66,75 |
| WebArena (visión) | 36,60 | 38,20 | no disponible | 50,86 |

*La model card indica que la puntuación publicada de Qwen3.6-35B-A3B-BF16 en MCP-Atlas es 62,8, pero que la medición propia sobre las 500 tareas públicas de MCP-Atlas arrojó 51,2. No se han proporcionado datos de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo está diseñado para caber en aproximadamente 24 GB de memoria, que es el criterio de su propio nombre; el repositorio completo ocupa 23,8 GB.
- Recetas documentadas: hay configuraciones de 28 GB y 32 GB, que incluyen el modelo, el `mmproj` de visión y el drafter especulativo LiLiCorr.
- GPU recomendadas: RTX discretas con 32 GB o más y 48 GB o más, además de DGX Spark en configuraciones de 64 GB y 128 GB. No se especifican modelos concretos como A100 o H100 en la información disponible.
- Cabe en GPU de consumo: el objetivo declarado es 24 GB, por lo que encaja en tarjetas tipo RTX 4090 (24 GB); en 24 GB estrictos hay que renunciar a parte del contexto o al drafter especulativo, ya que las recetas documentadas parten de 28 GB.
- Opciones de despliegue: llama.cpp (vía `llama-server`) es el runtime de referencia en la model card. No se mencionan vLLM, Ollama ni TGI en la información proporcionada.
- Argumentos relevantes del ejemplo oficial: `--batch-size 2048`, `--ubatch-size 512`, `--ctx-size 98304`, `-ngl 999`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--flash-attn on`, `--jinja`, `--spec-type draft-dflash` y `--spec-draft-n-max 6`.
- Decodificación especulativa: requiere descargar por separado el drafter `NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr.gguf`, lo que añade consumo de memoria adicional al presupuesto total.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia cualitativa, la model card afirma que es más rápido que la mayoría de modelos densos populares.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Datos destacados de la model card |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B 24GB (IQ2) | 74B / 9B | Hasta 256K tokens | OpenMDW-1.1 | GGUF, llama.cpp, uso comercial permitido | Lidera en 10 de las 13 pruebas comparadas, con 86,43 en GPQA Diamond y 66,75 en BrowseComp |
| Qwen3.6-35B-A3B BF16 | 35B / 3B | No disponible | No disponible | No disponible en la información proporcionada | 88,07 en PinchBench, 83,40 en GPQA Diamond, 62,8 publicado en MCP-Atlas |
| Gemma4 26B-A4B BF16 | 26B / 4B | No disponible | No disponible | No disponible en la información proporcionada | 22,17 en AA-Omniscience accuracy, 79,61 en GPQA Diamond |
| Nemotron 3.5 Lightning 30B-A3B BF16 | 30B / 3B | No disponible | No disponible | No disponible en la información proporcionada | Mejor tasa de no alucinación de la tabla (68,81 en AA-Omniscience non-hallucination) |

## Limitaciones y advertencias

- La cuantización IQ2 de 2 bits implica una pérdida de precisión frente al checkpoint BF16 original; los benchmarks publicados corresponden precisamente a esta versión cuantizada, pero pueden aparecer degradaciones en tareas muy sensibles a la precisión numérica.
- La model card no documenta sesgos conocidos, demografía del corpus ni resultados de evaluaciones de seguridad; esa información no está disponible.
- Riesgo de alucinación: en AA-Omniscience non-hallucination obtiene 61,27, por debajo de Nemotron 3.5 Lightning 30B-A3B (68,81) y con una puntuación de exactitud de solo 16,90 en esa misma prueba, la más baja de la comparativa. Conviene verificar afirmaciones factuales en producción.
- Cobertura idiomática limitada a seis idiomas (en, es, fr, de, it, ja); no hay datos de rendimiento por idioma en la información disponible.
- La ventana de 256K tokens es el máximo teórico: la receta de despliegue publicada usa 98.304 tokens, y en GPUs de 24 GB habrá que reducirla más por presión de memoria.
- El presupuesto de memoria es crítico: el modelo está pensado para 24 GB, pero las configuraciones documentadas que incluyen visión y drafter especulativo requieren 28 GB o 32 GB.
- La licencia es OpenMDW-1.1, no una licencia "other" genérica de HuggingFace; conviene revisar el texto completo antes de un despliegue comercial, aunque la model card afirma que el modelo está listo para uso comercial y no comercial.
- Los resultados de benchmarks proceden del propio desarrollador y comparan contra mediciones realizadas por NVIDIA en algunos casos (nota sobre MCP-Atlas), por lo que no son una evaluación independiente.
- El entorno de despliegue de referencia es llama.cpp; no se documentan rutas oficiales para vLLM, TGI u otros servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Articulo arXiv 2605.07182: https://arxiv.org/abs/2605.07182
- Articulo arXiv 2601.20088: https://arxiv.org/abs/2601.20088
- Articulo arXiv 2502.02631: https://arxiv.org/abs/2502.02631
- Articulo arXiv 2502.05003: https://arxiv.org/abs/2502.05003
- Sitio corporativo de NVIDIA: https://www.nvidia.com/
- Pagina de Wikipedia sobre NVIDIA: https://en.wikipedia.org/wiki/Nvidia
