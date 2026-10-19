# marafx2007/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB es la versión cuantizada a 2 bits (IQ2, formato GGUF) del modelo vision-language Nemotron 3.5 Bolt 74B-A9B de NVIDIA, desarrollado por NVIDIA Corporation entre diciembre de 2025 y mayo de 2026. Se trata de un modelo híbrido Mamba-2/Transformer con arquitectura LatentMoE de 74.042.720.848 parámetros totales y unos 9B activos por token, equipado con un codificador visual C-RADIO v4-H que le permite aceptar texto, imágenes y vídeo como entrada. Su ventana de contexto alcanza los 256K tokens.

El objetivo declarado del modelo es ejecutar tareas agénticas cotidianas de forma local en una máquina de 24 GB de memoria, compitiendo en la relación inteligencia/velocidad por GB con modelos densos y MoE de huella similar. Para ello emplea entrenamiento consciente de cuantización (quantization-aware training), de modo que la versión de 2 bits no es un simple post-procesado del checkpoint BF16, sino el resultado de un pipeline específico. Incorpora además decodificación especulativa DFlash con un drafter GGUF independiente y un modo de razonamiento controlable mediante plantilla de chat (`enable_thinking`).

Este repositorio concreto es una publicación de terceros (usuario `marafx2007`) sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`, con 23,8 GB de pesos, sin descargas ni valoraciones en el momento de la consulta y licencia OpenMDW-1.1, que el autor declara válida tanto para uso comercial como no comercial. Es relevante ahora porque demuestra la viabilidad de desplegar un VLM agéntico de 74B con contexto largo en GPUs de consumo de gama alta o en un DGX Spark, sin depender de infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer híbrida LatentMoE con codificador de visión C-RADIO v4-H |
| Parametros totales | 74.042.720.848 (74B) |
| Parametros activos | ~9B por token (modelo MoE) |
| Longitud de contexto | Hasta 256K tokens; el ejemplo de despliegue de la model card usa `--ctx-size 98304` |
| Tipos de cuantizacion | IQ2 (2 bits, con quantization-aware training) en GGUF; el modelo base está en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (modelo, `mmproj` y drafter especulativo como archivos separados); repositorio de 23,8 GB |
| Modalidades de entrada / salida | Texto, imágenes y vídeo / texto |
| Modo de razonamiento | Controlable por plantilla de chat (`enable_thinking=True/False`) |
| Decodificacion especulativa | DFlash con drafter GGUF aparte; hasta 7 tokens de borrador en la receta de 32 GB y 6 en la de 28 GB |
| Muestreo recomendado | Texto: temperatura 1.0, top_p 0.95 |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba-2 (modelo de espacio de estados) con capas Transformer en un esquema híbrido, sobre un diseño LatentMoE: de los 74B parámetros totales solo se activan aproximadamente 9B por token, lo que reduce el coste de cómputo por paso de decodificación. La torre visual es un codificador C-RADIO v4-H, acoplado mediante un proyector multimodal (`mmproj` en GGUF) que permite procesar imágenes y vídeo junto con texto. El modelo se apoya en decodificación especulativa DFlash con un drafter independiente, una técnica que acelera la generación al proponer varios tokens candidatos que el modelo principal verifica en paralelo.

El preentrenamiento y el postentrenamiento se apoyan en los datasets publicados por NVIDIA (`nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`), con fecha de corte de los datos de postentrenamiento en mayo de 2026. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni las etapas concretas de RLHF/DPO. La innovación técnica más destacable es el uso de quantization-aware training para producir directamente un checkpoint IQ2 de 2 bits que conserva parte del rendimiento del BF16, junto con el modo de razonamiento conmutable heredado del cliente Super 3.5 VL.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta prompts que combinan texto, imágenes y vídeo, y devuelve texto.
- Razonamiento explícito conmutable mediante `enable_thinking=True/False` en la plantilla de chat, útil para separar respuestas rápidas de cadenas de razonamiento largas.
- Capacidades agénticas y multi-paso: la model card la posiciona explícitamente para "tareas agénticas cotidianas" locales, con resultados en benchmarks de agentes (Terminal-Bench 2.1, Tau3 Banking, MCP-Atlas).
- Uso de herramientas vía MCP y function calling, evaluado en MCP-Atlas (52,20) y PinchBench (87,82).
- Automatización de navegador y comprensión de interfaces web, evaluada en WebArena en su variante de visión (50,86) y en BrowseComp (66,75).
- Generación y resolución de código, incluido código científico (SciCode 41,02) y tareas de terminal (Terminal-Bench 2.1 50,98).
- Multilingüismo en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos o historiales de conversación prolongados (AA-LCR 64,06).
- Despliegue local con `llama-server`, incluyendo soporte de flash-attention, caché KV cuantizada (`q8_0`) y decodificación especulativa.

## Casos de uso

- Agente local de automatización de escritorio: con ~24 GB de pesos y decodificación especulativa DFlash, el modelo puede ejecutar bucles de agente (leer pantalla, decidir acción, invocar herramienta) en una RTX de 32-48 GB o un DGX Spark, sin enviar datos a la nube.
- Automatización de navegador y RPA web: su puntuación de 50,86 en WebArena (visión) y 66,75 en BrowseComp lo hacen adecuado para interpretar capturas de páginas y rellenar formularios o extraer datos de portales.
- Atención al cliente multilingüe con historial largo: la ventana de 256K tokens permite mantener conversaciones multi-turno con todo el contexto de la cuenta y documentación adjunta en español, francés, alemán, italiano o japonés.
- Análisis de documentos técnicos con figuras: al aceptar imagen y texto, puede procesar manuales, planos o informes escaneados y responder preguntas sobre tablas y diagramas dentro de un mismo contexto largo.
- Agente de DevOps y terminal: los 50,98 puntos en Terminal-Bench 2.1 y los 17,01 en Tau3 Banking respaldan su uso para interpretar salidas de comandos, diagnosticar fallos y proponer parches en pipelines de CI/CD.
- Asistente de código científico y análisis de datos: con 41,02 en SciCode y 86,43 en GPQA Diamond, encaja en entornos de investigación que necesitan generación de scripts de análisis con razonamiento matemático y verificación de resultados.
- Extracción de información de vídeo en local: al aceptar vídeo como entrada, puede resumir grabaciones, generar descripciones estructuradas o indexar contenido audiovisual en despliegues con requisitos de privacidad.
- Despliegue en edge con presupuesto de memoria ajustado: las recetas de 28 GB y 32 GB documentadas permiten servirlo en una sola GPU discreta con cuantización de caché KV y contexto recortado.

## Benchmarks y rendimiento

Resultados publicados en la model card (el modelo evaluado es la versión IQ2 de 2 bits):

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
| MCP-Atlas | 51,20* | — | 46,40 | 52,20 |
| BrowseComp | 48,74 | 26,30 | 36,81 | 66,75 |
| WebArena (visión) | 36,60 | 38,20 | — | 50,86 |

\* La model card indica que la puntuación reportada por el autor de Qwen3.6-35B-A3B BF16 en MCP-Atlas es 62,8, mientras que la medición propia sobre las 500 tareas públicas dio 51,2. El resto de cifras son autoevaluaciones de NVIDIA; no se especifican los detalles de configuración de cada evaluación. No se han publicado resultados desglosados por idioma, ni métricas de latencia o throughput, ni resultados del checkpoint BF16 en la información disponible.

## Requisitos de hardware

- Huella objetivo declarada: 24 GB de memoria, según el nombre del modelo y su descripción ("native 2-bit quantization to fit in 24GB"); el repositorio completo ocupa 23,8 GB, incluyendo pesos, `mmproj` y drafter.
- Recetas documentadas: una de 28 GB y otra de 32 GB, que ajustan el número de tokens de borrador especulativo (6 y 7 respectivamente) y el contexto.
- GPUs citadas por la model card: RTX discretas de 32 GB o más y de 48 GB o más, además de DGX Spark en configuraciones de 64 GB y 128 GB.
- Cabe en GPU de consumo: sí, en tarjetas de 32 GB o 48 GB (por ejemplo, la clase RTX 5090 de 32 GB citada implícitamente en la receta de 32 GB); en tarjetas de 24 GB el margen es muy ajustado y la propia card recomienda 28-32 GB para el despliegue real.
- Opciones de despliegue: `llama.cpp` / `llama-server` con `--flash-attn on`, `-ngl 999`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--batch-size 2048` y `--ubatch-size 512`. No se documentan recetas para vLLM, TGI u Ollama en la información disponible.
- Decodificación especulativa: requiere descargar además el GGUF `NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr.gguf` y activar `--spec-type draft-dflash` con `--spec-draft-n-max` a 6 o 7 según la receta.
- Latencia y throughput: no disponible. La model card afirma ser "más rápido que la mayoría de modelos densos populares" sin aportar cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B 24GB (IQ2) | 74B / ~9B | 256K | GPQA Diamond 86,43; BrowseComp 66,75; Terminal-Bench 2.1 50,98 | OpenMDW-1.1 | GGUF de 2 bits en este repo; base BF16 en `nvidia/...` |
| Qwen3.6-35B-A3B BF16 | 35B / ~3B | No disponible | PinchBench 88,07; GPQA Diamond 83,40 | No disponible | BF16, según la tabla comparativa de la model card |
| Gemma4 26B-A4B BF16 | 26B / ~4B | No disponible | SciCode 40,28; AA-Omniscience accuracy 22,17 | No disponible | BF16, según la tabla comparativa de la model card |
| Nemotron 3.5 Lightning 30B-A3B BF16 | 30B / ~3B | No disponible | AA-Omniscience non-hallucination 68,81; PinchBench 83,43 | No disponible (familia Nemotron) | BF16, según la tabla comparativa de la model card |

El modelo supera a los tres comparadores en 10 de los 13 benchmarks reportados, con ventajas especialmente amplias en BrowseComp (+18 puntos sobre Qwen3.6), WebArena visión (+12,6 sobre Gemma4) y Tau3 Banking. Pierde frente a Gemma4 en AA-Omniscience accuracy (16,90 frente a 22,17), frente a Qwen3.6 en PinchBench (87,82 frente a 88,07) y frente a Qwen3.6 y Nemotron Lightning 30B en la métrica de no alucinación de AA-Omniscience.

## Limitaciones y advertencias

- Cuantización agresiva: 2 bits (IQ2) implica una pérdida de fidelidad respecto al BF16 inherente al formato; no se publican en la información disponible métricas que cuantifiquen esa degradación benchmark a benchmark frente al modelo base.
- Riesgo de alucinación: la puntuación de no alucinación en AA-Omniscience (61,27) es inferior a la de Qwen3.6-35B-A3B (65,85) y a la de Nemotron 3.5 Lightning 30B (68,81), y la precisión en ese mismo benchmark (16,90) queda por debajo de Gemma4 y Qwen3.6, lo que sugiere cautela en tareas de conocimiento factual sin herramientas.
- Todos los benchmarks son autoevaluaciones de NVIDIA con configuraciones no detalladas; no se especificanFew-shot, temperaturas ni versiones exactas de los comparadores.
- Cobertura lingüística limitada a seis idiomas (en, es, fr, de, it, ja); no se documenta comportamiento en otros idiomas ni evaluación desglosada por lengua.
- Longitud de contexto real: aunque se anuncian 256K tokens, el ejemplo de despliegue recorta a 98.304 tokens, y no se aportan resultados de recuperación en el extremo superior de la ventana.
- El repositorio está publicado por un tercero (`marafx2007`) y no por la organización oficial de NVIDIA; la model card remite a rutas `nvidia/...` para la descarga, lo que genera ambigüedad sobre la procedencia exacta de los archivos. Conviene verificar checksums antes de usarlo en producción.
- Sin descargas ni valoraciones en el momento de la consulta: no hay evidencia comunitaria de funcionamiento ni de calidad del GGUF.
- Licencia OpenMDW-1.1: la model card afirma que el modelo está listo para uso comercial y no comercial, pero las condiciones exactas (atribución, restricciones de redistribución, cláusulas de uso aceptable) deben revisarse en el texto de la licencia antes de integrarlo en un producto.
- No se documentan medidas de seguridad, red teaming, mitigaciones de sesgo ni evaluaciones de toxicidad en la información disponible.
- El modo `enable_thinking` puede incrementar notablemente el consumo de tokens y la latencia; no se aportan datos de coste por consulta en cada modo.
- Dependencia de `llama.cpp` y de una compilación con soporte de DFlash y `mmproj`; no se documentan alternativas de servido de alto throughput (vLLM, TGI) para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1 en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper (arXiv 2605.07182): https://arxiv.org/abs/2605.07182
- Paper (arXiv 2601.20088): https://arxiv.org/abs/2601.20088
- Paper (arXiv 2502.02631): https://arxiv.org/abs/2502.02631
- Paper (arXiv 2502.05003): https://arxiv.org/abs/2502.05003
