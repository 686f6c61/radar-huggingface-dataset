# mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-i1-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-i1-GGUF es una cuantización GGUF del modelo Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic, creada por mradermacher. El modelo base, desarrollado por DavidAU, es un ajuste fino de 27 mil millones de parámetros sobre la arquitectura Qwen3.8 que emplea la metodología de entrenamiento COLD FUSION, combinando la técnica GAIN con la infraestructura de Unsloth. Esta metodología reduce el número de tokens de razonamiento (thinking tokens) entre un 50 % y un 90 % en comparación con el modelo base, manteniendo al mismo tiempo un 99 % del rendimiento en BF16 tanto en cuantización de 8 bits como de 4 bits.

Esta versión concreta es un reempaquetado en formato GGUF con cuantizaciones ponderadas y matrices de importancia (imatrix), lo que la hace adecuada para su ejecución en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles con GGUF. La cuantización reduce el tamaño del modelo y el uso de VRAM, facilitando el despliegue en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo destaca por su eficiencia en coste computacional: al reducir la sobrecarga de tokens de razonamiento, se acelera la inferencia y se abarata el despliegue, manteniendo la calidad del modelo original. Está orientado a tareas conversacionales, generación de código y razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8, 27B) |
| Parametros totales | 27.7 mil millones (aprox.) |
| Parametros activos | no disponible |
| Longitud de contexto | 16384 (tokens) (Qwen3.8 nativo) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (principal), otros idiomas limitados (no documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors original, convertido a GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un modelo de lenguaje de gran tamaño de arquitectura Transformer con atención de causalidad, entrenado por Alibaba Cloud. Sobre esta base, DavidAU aplicó un ajuste fino con la metodología COLD FUSION, que combina dos técnicas: GAIN (un método interno que ajusta dinámicamente el número de tokens de razonamiento por muestra) y la infraestructura de entrenamiento de Unsloth para optimizar el uso de memoria y acelerar el entrenamiento. El objetivo es reducir la sobrecarga de tokens de razonamiento (thinking tokens) en un 50–90 % respecto al modelo base, manteniendo un 99 % del rendimiento en BF16 incluso en cuantizaciones de 8 y 4 bits.

El proceso de entrenamiento incluye un ajuste fino supervisado (SFT) con datos conversacionales y de instrucciones, sin información pública sobre el dataset exacto. No se ha documentado el uso de RLHF ni DPO. La versión GGUF aquí presentada es una conversión posterior realizada por mradermacher, que aplica cuantizaciones con imatrix para mejorar la calidad de la cuantización.

## Capacidades

- Generacion de texto conversacional fluido y coherente en ingles.
- Razonamiento paso a paso con modo de pensamiento (thinking mode) reducido en tokens.
- Sigue instrucciones complejas en formato de chat (multi-turno).
- Generacion de codigo en lenguajes comunes (Python, Java, C++, etc.) gracias a la base Qwen3.8.
- Capacidades de matematicas y logica (razonamiento simbolico).
- Soporte de tool calling y function calling (heredado de la base Qwen3.8).
- Capacidades multilingues limitadas: el modelo base Qwen3.8 soporta varios idiomas, pero el ajuste COLD FUSION se ha optimizado principalmente para ingles.
- Modo de razonamiento explicito (thinking) con control de tokens de salida.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32 768 tokens, reduciendo la latencia gracias a la menor generacion de tokens de razonamiento.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests unitarios, con menor coste de inferencia que modelos de tamano similar.
- Asistentes de escritura y redaccion: redaccion de articulos, resumenes y correccion de textos con instrucciones detalladas, manteniendo un estilo coherente.
- Analisis de documentos y extraccion de informacion: el contexto de 32K permite procesar documentos extensos, extrayendo datos o respondiendo preguntas sobre el contenido.
- Sistemas de RAG (Retrieval Augmented Generation): puede integrarse en pipelines de RAG para generar respuestas con base en documentos recuperados, reduciendo el coste de tokens de razonamiento.
- Prototipado de agentes IA: con soporte de function calling, puede usarse como motor de agentes que interactuan con APIs y bases de datos, con un coste de inferencia menor que modelos como Llama 3.1 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La descripcion menciona que mantiene un 99 % del rendimiento de BF16 en cuantizaciones de 8 y 4 bits, pero no se aportan numeros concretos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4_K_M (aprox. 16 GB), puede ejecutarse en tarjetas con 16 GB de VRAM como RTX 4080/4090 o A4000.
- En cuantizacion Q8_0 (no incluida en esta version) o BF16 requeriria al menos 32 GB de VRAM (A100, H100).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40 GB o H100 para cuantizaciones mas altas.
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en tarjetas de 16–24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (llama-server).
- Latencia y throughput: no se han publicado datos concretos; la reduccion de tokens de razonamiento mejora la latencia respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-i1-GGUF (este) | 27B | 32K | Apache 2.0 | GGUF (Q2–Q6, IQ) | 99 % BF16 (reducido) |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (original) | 27B | 32K | Apache 2.0 | BF16/FP16 | Referencia de rendimiento |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | 27B | 32K | Apache 2.0 | GGUF | Similar, con MTP (Multi-Token Prediction) |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-i1-GGUF | 27B | 32K | Apache 2.0 | GGUF | Similar, sin heretic |

No se dispone de comparativas con modelos de otras familias (como Llama 3.1 27B o Mistral) en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion degrada ligeramente la precision en tareas de alto riesgo (por ejemplo, generacion de codigo critico) respecto al modelo en BF16.
- El modelo se ha optimizado para ingles; el rendimiento en otros idiomas puede ser inferior.
- La reduccion de tokens de razonamiento puede afectar a la calidad en tareas que requieren un razonamiento profundo y extenso (por ejemplo, problemas matematicos complejos).
- El modelo base Qwen3.8 puede presentar sesgos en datos de entrenamiento; no se ha documentado ninguna mitigacion especifica.
- Riesgo de alucinacion en temas factuales, como cualquier modelo de lenguaje generativo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de la base Qwen3.8 (Apache 2.0) para evitar restricciones.
- No se ha publicado informacion sobre el dataset de entrenamiento del ajuste fino, lo que limita la auditabilidad.

## Enlaces

- Repositorio de HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-i1-GGUF
- Modelo original en HuggingFace: https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic
- Variante sin "heretic" en GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-i1-GGUF
- Otra variante GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-GGUF
- Ficha del modelo original en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-davidau
- Ficha de la variante con MTP en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-nm-dau-neo-max-mtp-gguf-davidau
