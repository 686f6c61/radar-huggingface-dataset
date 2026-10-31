# prithivMLmods/Apex-35B-V1.0-MXFP4-MoE-GGUF

## Resumen

Apex-35B-V1.0-MXFP4-MoE-GGUF es una cuantización en formato GGUF del modelo Apex-35B-V1.0, desarrollado por Apexintelligence-AI y cuantizado por prithivMLmods. Se trata de un modelo disperso de tipo Mixture-of-Experts (MoE) con 35,5 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token (configuración A3B), construido sobre la base Qwen3.6-35B-A3B. Su ventana de contexto alcanza los 262K tokens, y está orientado a razonamiento general, investigación científica, simulación CFD, robótica y programación agéntica, con soporte de Claude Code.

La relevancia de esta versión concreta radica en su formato MXFP4_MOE, optimizado para los Tensor Cores FP4 nativos de la arquitectura NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300), lo que permite ejecutar el modelo completo en una única GPU de 96 GB con un pico de consumo de solo 19,86 GiB. Además, incorpora Multi-Token Prediction (MTP), una variante de decodificación especulativa que integra las cabezas de borrador directamente en los pesos del modelo, acelerando la inferencia local sin necesidad de un modelo draft separado.

El modelo es multimodal (image-text-to-text) e incluye un archivo de proyección mmproj para capacidades de visión. Se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso basado en Qwen3.6-35B-A3B, con MTP (Multi-Token Prediction) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | Ingles (declarado en la ficha; no disponible informacion sobre otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer disperso Mixture-of-Experts con 35,5B de parametros totales de los cuales solo ~3B se activan por token, lo que reduce drasticamente el coste de inferencia manteniendo la capacidad de un modelo de 35B. La arquitectura hereda de Qwen3.6-35B-A3B e incorpora Multi-Token Prediction (MTP): cabezas de salida adicionales integradas en los propios pesos que predicen varios tokens futuros en una sola pasada hacia adelante, funcionando como decodificacion especulativa sin modelo draft externo (en las pruebas se usa `draft_n_max=2`).

El post-entrenamiento, segun la model card del modelo base, combina trayectorias de investigacion propietarias, recursive self-improvement (RSI), dynamic thinking, ejecucion de codigo y refinamiento iterativo. No se ha publicado informacion detallada sobre el numero de tokens de preentrenamiento ni la composicion exacta del dataset. El modelo incluye soporte de tool calling en formato XML y es multimodal, con un proyector de vision distribuido como archivo mmproj en BF16 (903 MB).

## Capacidades

- Generacion de texto y razonamiento general, con modos de "dynamic thinking" y refinamiento iterativo
- Razonamiento cientifico: benchmarks especificos en SciCode, FrontierScience, PaperBench y fisica computacional (CFD)
- Programacion agéntica: soporte de Claude Code, tool calling XML, alto rendimiento en SWE-bench y Terminal-Bench
- Ejecucion de codigo como parte del post-entrenamiento (code execution)
- Vision: pipeline image-text-to-text con archivo mmproj para procesar imagenes junto a texto
- Multi-Token Prediction (MTP) para decodificacion especulativa integrada y aceleracion de inferencia local
- Soporte de agentes y flujos multi-paso (agentic coding, terminal, navegacion web segun BrowseComp)
- Compatibilidad con Transformers, llama.cpp, vLLM, SGLang, TokenSpeed, KTransformers y Unsloth

## Casos de uso

- Programacion agéntica en terminal: con 65,2 en Terminal-Bench 2.1 y soporte de Claude Code, puede integrarse en flujos de trabajo de desarrollo automatizado, refactorizacion y depuracion de repositorios completos.
- Resolucion de issues en CI/CD: su puntuacion de 92,4 en SWE-bench Pro v2 y 73,4 en SWE-bench Verified sin internet lo hace adecuado para pipelines que generan y validan parches de codigo automaticamente.
- Investigacion cientifica y fisica computacional: orientado explicitamente a CFD y simulacion, con un registro de 79/0/21 victorias/empates/derrotas frente a su modelo base en CFD-Bench; util para asistir en configuraciones de simulacion y analisis de resultados.
- Asistencia en redaccion cientifica: 60,9 en PaperBench y 40,0 en FrontierScience lo situan como candidato para resumir, reproducir y evaluar papers de investigacion.
- Agentes de navegacion web: 69,4 en BrowseComp indica capacidad para tareas de busqueda y recuperacion agéntica en la web.
- Vision-language local: el archivo mmproj permite analizar imagenes (capturas, diagramas, documentos escaneados) en estaciones de trabajo con GPU Blackwell sin depender de APIs externas.
- Chatbot de razonamiento con contexto extenso: la ventana de 262K tokens permite procesar bases de codigo grandes, documentos legales extensos o conversaciones muy largas de multiples turnos.
- Inferencia local de alto rendimiento: con MTP y MXFP4 alcanza 293 tokens/s de generacion en una RTX PRO 6000, adecuado para servicios de inferencia en una sola GPU.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base (Apexintelligence-AI/Apex-35B-V1.0). No se incluyen comparaciones directas con otros modelos en la informacion disponible:

| Benchmark | Puntuacion |
|---|---|
| MMLU-Pro | 87,2 |
| GPQA Diamond | 83,3 |
| HLE | 47,2 |
| SciCode | 62,6 / 75,6 |
| FrontierScience | 40,0 |
| PaperBench | 60,9 |
| BrowseComp | 69,4 |
| BFCL V4 | 84,0 |
| Terminal-Bench 2.1 | 65,2 |
| SWE-bench Pro v2 | 92,4 |
| SWE-bench Verified (sin internet) | 73,4 |
| LiveCodeBench v6 | 82,3 |
| RoboRSI | 44,5 |
| Real2Sim | 21,6 |

Rendimiento de inferencia medido (MXFP4_MOE, RTX PRO 6000 Blackwell, 96 GB, llama-cli, MTP con `draft_n_max=2`, contexto 16.384, KV cache q8_0):

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | 213,94 tokens/s |
| Velocidad de generacion | 293,37 tokens/s |
| Pico de VRAM | 19,86 GiB |
| Utilizacion de GPU | 81% |

## Requisitos de hardware

- BF16 (71,1 GB): requiere ~80 GB de VRAM o mas; adecuado para B200, B300, H100 80 GB (ajustado) o RTX PRO 6000 96 GB.
- MXFP4_MOE (20,3 GB): cabe comodamente en GPUs de 24-32 GB; en hardware Blackwell aprovecha Tensor Cores FP4 nativos con rendimiento maximo. Pico medido de 19,86 GiB con contexto de 16K.
- Q5_K_M (25,3 GB) y Q6_K (29,2 GB): recomendadas por el autor; requieren GPUs de 32-48 GB (RTX 5090 no llega; RTX PRO 6000, A6000, L40S o Mac con unificacion de memoria elevada).
- Q3_K_L (18,6 GB): opcion para equipos con RAM limitada; posible en RTX 4090/5090 de 24 GB con offload parcial o KV cache cuantizada.
- Q8_0 (37,8 GB): requiere ~48 GB de VRAM o CPU + offload mixto.
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell (validada, 293 tokens/s), RTX 50-series, B200, B300; en hardware no Blackwell las cuantsicas Q4_K_M/Q5_K_M funcionan via llama.cpp sin aceleracion FP4.
- Despliegue: llama.cpp (llama-cli con `--spec-type draft-mtp`), Transformers, vLLM, SGLang, TokenSpeed, KTransformers y Unsloth.
- Latencia/throughput: 293,37 tokens/s de generacion y 213,94 tokens/s de procesamiento de prompt en la configuracion validada; fuera de Blackwell, no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Apex-35B-V1.0 (este) | 35,5B | ~3B | 262K | Si (mmproj) | Apache-2.0 |
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | Segun variante | Apache-2.0 |
| Qwen3-30B-A3B | 30B | 3B | 128K (native) | No (version texto) | Apache-2.0 |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | No | Apache-2.0 |

Nota: los datos de Qwen3-30B-A3B y Mixtral corresponden a conocimiento general; no hay comparativas de benchmarks directas en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la ficha declara solo ingles; el rendimiento en castellano no esta documentado y puede ser inferior al de modelos con soporte multilingue explicito.
- La model card procede del autor del modelo y los benchmarks no han sido verificados de forma independiente; las cifras de SWE-bench Pro v2 (92,4) y otros resultados son excepcionalmente altos y deben tomarse con cautela hasta su replicacion.
- El cuantizado MXFP4_MOE esta optimizado para NVIDIA Blackwell (SM120/GB202); en arquitecturas anteriores (Ampere, Ada, Hopper) no se beneficia de la aceleracion FP4 nativa y puede no estar soportado por algunos runtimes.
- Las mediciones de rendimiento se realizaron con contexto de 16.384 tokens; el comportamiento de VRAM y velocidad con contextos cercanos a 262K no esta documentado y exigira mucha mas memoria para el KV cache.
- Riesgo de alucinacion: no disponible informacion especifica; como todo LLM, puede generar contenido incorrecto, especialmente en dominios cientificos especializados.
- La multimodalidad depende del archivo mmproj; sin el, el GGUF funciona solo como modelo de texto.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque el modelo base puede contener datos de entrenamiento propietarios no auditables.
- Proyecto de autor independiente (prithivMLmods) con pocas descargas (1.584) y un solo like en el momento de la ficha: comunidad y soporte limitados en comparacion con modelos de grandes laboratorios.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/prithivMLmods/Apex-35B-V1.0-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Modelo base de arquitectura: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
