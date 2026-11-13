# renatoschust/agentmujo-qwen3-vl-30b-a3b-lora

## Resumen

AgentMujo Qwen3-VL-30B-A3B LoRA (v3) es un adaptador LoRA de tipo PEFT publicado por el usuario renatoschust sobre el modelo base Qwen/Qwen3-VL-30B-A3B-Instruct. El adaptador está diseñado para mejorar el comportamiento del modelo en tareas de tool-calling en bosnio (y variantes del serbocroata: bs, hr, sr) combinadas con capacidades multimodales (lectura de facturas) y razonamiento aritmético, manteniendo el inglés como idioma de soporte. Se trata, por tanto, de un ajuste fino orientado a agentes, no de un modelo preentrenado desde cero.

El adaptador se ha entrenado con una receta de dos etapas sobre LUMI-G (8 GCD AMD MI250X, ROCm 7.2, bfloat16) con r=8 y alpha=16. La primera etapa (v2, 2.729 pasos, lr=5e-5) introduce tool-calling en bosnio con modo thinking y confirmación, junto con replay de aritmética sintética y de honestidad/refusal ante entidades ficticias. La segunda etapa (v3, 120 pasos, lr=2e-5) es un micro-pase multimodal con 50 imágenes sintéticas de facturas bosnias y 70 muestras de replay textual, pensado para evitar el olvido del razonamiento multimodal.

La relevancia del modelo reside en su enfoque metodológico: el autor documenta explícitamente el fenómeno de "multimodal reasoning forgetting" (la caída de rendimiento del SFT multimodal ingenuo) y propone una receta de dos etapas con replay para mitigarlo, reportando mejoras medibles sobre el modelo base en su propio benchmark interno (Bench v2) y en extracción de campos de facturas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB (solo pesos del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (MoE); r=8, alpha=16 |
| Parametros totales | 31B (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | 3B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en bfloat16) |
| Idiomas soportados | bs, hr, sr, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-30B-A3B-Instruct, un transformer multimodal con mezcla de expertos (31B totales, 3B activos). El LoRA utiliza rango r=8 y alpha=16, y se entrenó en bfloat16 sobre LUMI-G con 8 GCD AMD MI250X y ROCm 7.2. La receta es de dos etapas: la etapa 1 (v2) consta de 2.729 pasos con lr=5e-5 sobre 1.629 muestras de tool-calling en bosnio (con thinking y confirmación), 800 muestras de replay aritmético sintético y 300 muestras de replay de honestidad/refusal con entidades ficticias disjuntas del benchmark. La etapa 2 (v3) es un micro-pase de 120 pasos con lr=2e-5 sobre 50 imágenes sintéticas de facturas bosnias y 70 muestras de replay textual (40 de tool-call, 15 de aritmética, 15 de honestidad).

La innovación técnica destacable es la receta de dos etapas para prevenir el "multimodal reasoning forgetting": el SFT multimodal ingenuo (v1) degrada el rendimiento global del 82,3% al 68,1%, mientras que la combinación de texto más replay (v2) y el micro-pase multimodal posterior (v3) recuperan y superan la línea base. No se documenta el uso de RLHF ni DPO; el entrenamiento es SFT supervisado con datos sintéticos y de replay.

## Capacidades

- Generación de texto conversacional en bosnio, croata, serbio e inglés.
- Tool-calling / function calling con argumentos estructurados (benchmark b5_toolargs).
- Razonamiento multi-paso con modo thinking y confirmación.
- Comprensión de imágenes (image-text-to-text): extracción de campos de facturas (proveedor, número, fecha, total).
- Aritmética básica y moderada, reforzada con replay sintético.
- Comportamiento de honestidad/refusal ante entidades ficticias (benchmark b4_honesty).
- Capacidades multimodales heredadas del modelo base Qwen3-VL.
- No se documentan capacidades de audio ni de visión más allá de la lectura de documentos.

## Casos de uso

- Automatización de facturación en bosnio: el adaptador extrae proveedor, número de factura, fecha y total de imágenes de facturas, con un 100% de acierto en proveedor, número y fecha, y un 90% en total sobre el conjunto sintético de evaluación. Adecuado para pipelines de contabilidad en mercados de Bosnia y Herzegovina.
- Agentes de atención al cliente en serbocroata: el modelo soporta tool-calling con confirmación y modo thinking, lo que permite encadenar consultas a APIs internas (estado de pedido, devoluciones) manteniendo el turno conversacional en el idioma del usuario.
- Asistentes de back-office con function calling: la puntuación de 96% en b5_toolargs (192/200) indica que el adaptador genera argumentos de herramienta correctos en la mayoría de los casos, útil para orquestadores de agentes que invocan servicios REST.
- Verificación de datos y control de alucinaciones: el 100% en b4_honesty (frente al 47% del base) lo hace apto para flujos donde el modelo debe rechazar entidades o documentos inexistentes en lugar de inventarlos.
- Procesamiento de documentos escaneados en inglés y bosnio: combinación de OCR implícito del modelo base con el ajuste para campos de factura, útil en digitalización de archivos administrativos.
- Evaluación de pipelines de agentes: el adaptador sirve como referencia para medir regresiones de razonamiento multimodal al aplicar SFT, dado que el autor publica el benchmark y los resultados en un dataset de evaluación.
- Razonamiento aritmético ligero en asistentes financieros: con un 75,3% en b1_arith, puede usarse para cálculos de totales y validaciones sencillas, aunque requiere verificación externa en producción.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre LUMI-G con vLLM TP=8 y temperature=0. La comparación es contra el modelo base y las variantes v1 (SFT multimodal ingenuo) y v2 (texto más replay).

| Metrica | Base Qwen3-VL-30B-A3B | v1 (naive mm-SFT) | v2 (text+replay) | v3 (este adaptador) |
|---|---:|---:|---:|---:|
| Bench v2 overall (700) | 576/700 = 82,3% | 477/700 = 68,1% | 606/700 = 86,6% | 617/700 = 88,1% (IC 85,5-90,3%) |
| b1_arith (300) | 229/300 = 76,3% | 178/300 = 59,3% | 229/300 = 76,3% | 226/300 = 75,3% |
| b2_needle (100) | 100/100 = 100% | 99/100 = 99,0% | 99/100 = 99,0% | 99/100 = 99,0% |
| b4_honesty (100) | 47/100 = 47,0% | 0/100 = 0,0% | 86/100 = 86,0% | 100/100 = 100,0% |
| b5_toolargs (200) | 200/200 = 100% | 200/200 = 100% | 192/200 = 96,0% | 192/200 = 96,0% |
| Invoice supplier (20) | 20/20 | 20/20 | 18/20 | 20/20 (100%) |
| Invoice number (20) | 20/20 | 20/20 | 20/20 | 20/20 (100%) |
| Invoice date (20) | 14/20 | 20/20 | 0/20 | 20/20 (100%) |
| Invoice total (20) | 20/20 | 20/20 | 18/20 | 18/20 (90%) |
| E-F false-success (50) | 0/50 | 0/50 | 9/50 | 6/50 = 12% |

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (repo de 0.0 GB), pero requiere cargar el modelo base Qwen3-VL-30B-A3B-Instruct (31B parámetros totales, 3B activos).
- VRAM estimada para el modelo base: aproximadamente 62 GB en bfloat16 (31B × 2 bytes) para pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits se reduce a unos 16-18 GB, aunque el autor no publica cuantizaciones del adaptador.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. El autor usó 8 GCD AMD MI250X en LUMI-G con vLLM TP=8.
- En consumer GPU: no cabe en una RTX 4090 (24 GB) en bfloat16; requeriría cuantización agresiva y posiblemente no sea viable con precisión suficiente para tareas multimodales.
- Opciones de despliegue: vLLM (usado por el autor con tensor parallelism 8), PEFT para carga del adaptador, y potencialmente TGI o llama.cpp si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentMujo Qwen3-VL-30B-A3B LoRA (este) | 31B totales / 3B activos (base) | no disponible | Bench v2 88,1%; honestidad 100% | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 31B totales / 3B activos | no disponible | Bench v2 82,3%; honestidad 47% | apache-2.0 | Hugging Face (modelo base oficial) |
| Qwen3-VL-30B-A3B con SFT multimodal ingenuo (v1) | 31B totales / 3B activos | no disponible | Bench v2 68,1% | apache-2.0 | No publicado como checkpoint independiente |
| Alternativas de la misma categoría (otros VLM MoE de ~30B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Un solo seed y una sola ejecución por checkpoint: los resultados no incluyen intervalos de confianza más allá del overall (IC 85,5-90,3%).
- La evaluación de facturas usa solo 20 facturas sintéticas retenidas con nombres de proveedor genéricos, moneda BAM y IVA del 17%; no se ha validado con facturas reales.
- Tasa de falso éxito del 12% (6/50) en el benchmark E-F de agentes de archivos con política base sin prompt estricto, frente a 0/50 del modelo base. En producción debe combinarse con una política `strict` o una compuerta de ejecución externa.
- Ligera caída en aritmética (75,3% frente a 76,3% del base) y en toolargs (96% frente a 100% del base): el ajuste mejora honestidad y global pero no todas las métricas.
- El adaptador está especializado en bosnio y variantes del serbocroata; el rendimiento en otros idiomas no se ha evaluado.
- No se documentan sesgos conocidos ni evaluación de seguridad más allá del benchmark de honestidad.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los evaluados.
- El modelo base Qwen3-VL puede alucinar en tareas fuera de distribución; el adaptador mitiga parcialmente este riesgo en el benchmark de honestidad, pero no lo elimina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/renatoschust/agentmujo-qwen3-vl-30b-a3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Código y resultados: https://github.com/gamai-io/agentmujo-training
- Evidence pack (Zenodo DOI): https://doi.org/10.5281/zenodo.24178790
- Dataset de resultados de evaluación: https://huggingface.co/datasets/renatoschust/agentmujo-eval-results-2026-11
- Dataset de entrenamiento: https://huggingface.co/datasets/renatoschust/agentmujo-dataset
- Dataset sintético de facturas: https://huggingface.co/datasets/renatoschust/agentmujo-invoice-vlm-synthetic
