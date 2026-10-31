# ngquocvinh/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es un repositorio comunitario de cuantizaciones GGUF del modelo LFM3-1.7B de Liquid AI, publicado por el usuario ngquocvinh en Hugging Face. El modelo base es un modelo de texto de 1,73 mil millones de parámetros con una arquitectura tri-híbrida que combina convoluciones cortas, atención por ventana deslizante y atención global, diseñado para flujos de trabajo de agentes locales, uso de herramientas y salida estructurada en dispositivos de borde.

La relevancia de esta versión radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, con 15 formatos de cuantización distintos (desde Q8_0 hasta Q1_0) acompañados de mediciones de fidelidad rigurosas y reproducibles respecto al modelo BF16 original. El autor publica métricas de KLD, coincidencia top-1 y delta de perplejidad para cada cuantización, algo poco habitual en repositorios comunitarios.

El modelo base soporta un contexto de 256K tokens (entrada más salida) y 16 idiomas, entre ellos el español. Liquid AI lo posiciona para agentes locales y tool calling, aunque desaconseja su uso en codificación agéntica y razonamiento complejo de múltiples pasos, un matiz importante para evaluar si encaja en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: convoluciones cortas, atención por ventana deslizante y atención global |
| Parametros totales | 1.728.801.600 (≈1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 256K tokens (entrada más salida), según Liquid AI |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_M, IQ3_M, IQ3_S, Q2_K, IQ2_XS, IQ1_M, Q1_0 |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0), tipo "other" |
| Formato de pesos | GGUF (cuantizado desde BF16 con imatrix específica del modelo) |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura tri-híbrida que mezcla tres mecanismos de procesamiento de secuencias: convoluciones cortas, atención por ventana deslizante y atención global. Este diseño híbrido reduce el coste de la atención en secuencias largas, lo que hace viable el contexto de 256K tokens en un modelo tan pequeño y lo atractivo para inferencia local en dispositivos de borde. No se dispone de detalles sobre el número de capas, dimensiones ocultas ni vocabulario en la información proporcionada.

Sobre el entrenamiento del modelo base, la información disponible no detalla el número de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO; no disponible. En cuanto a este repositorio concreto, es importante subrayar que contiene exclusivamente cuantizaciones de pesos: no se ha realizado ningún entrenamiento ni fine-tuning. Las 15 cuantizaciones se generaron directamente desde un mismo GGUF BF16 bloqueado, usando una matriz de importancia (imatrix) específica de LFM3-1.7B, y cada archivo pasó una comprobación de carga y generación en llama.cpp con contexto de 4.096 tokens.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Uso de herramientas (tool calling) y salida estructurada, según el posicionamiento oficial de Liquid AI.
- Diseñado para flujos de trabajo de agentes locales, con inferencia eficiente en edge.
- Contexto largo teórico de 256K tokens (entrada más salida).
- Modelo solo de texto: no incluye capacidades de visión ni audio.
- No recomendado oficialmente para codificación agéntica ni razonamiento complejo de múltiples pasos.

## Casos de uso

- Agentes locales en portátiles y mini-PC: con solo 1,05-1,85 GB en cuantizaciones de 4-8 bits, el modelo cabe en la memoria unificada de equipos sin GPU dedicada, ideal para asistentes que ejecutan herramientas localmente sin enviar datos a la nube.
- Asistentes conversacionales multilingües ligeros: soporta español y otros 15 idiomas, útil para chatbots embebidos en aplicaciones de escritorio o móviles donde el ancho de banda y la VRAM son limitados.
- Salida estructurada para automatizaciones: el soporte de salida estructurada lo hace adecuado para extraer campos JSON de texto en pipelines de datos locales (clasificación de correos, etiquetado de tickets, normalización de registros).
- Orquestación de herramientas en flujos multi-turno: puede integrarse en frameworks de agentes locales (por ejemplo, con llama.cpp y plantillas de chat Jinja) para decidir qué función invocar en tareas sencillas.
- Prototipado de edge AI: su tamaño pequeño y sus mediciones de fidelidad publicadas permiten evaluar rápidamente qué cuantización mantiene la calidad necesaria antes de desplegar en producción.
- Resumen y procesamiento de documentos: la ventana de contexto de 256K permite, en teoría, procesar documentos largos, aunque las comprobaciones del repositorio solo validan contextos de hasta 4.096 tokens, por lo que conviene validar el comportamiento en contextos extensos antes de confiar en él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) del modelo base en la información disponible. Sí se han publicado mediciones de fidelidad de cuantización sobre WikiText-2 (contexto 2.048, cuatro fragmentos; ΔPPL relativo a BF16):

| Archivo | Tamaño (GB) | KLD medio ↓ | Top-1 vs BF16 ↑ | ΔPPL |
|---|---:|---:|---:|---:|
| Q8_0 | 1,846 | 0,001638 | 98,094 % | +0,380 % |
| Q6_K | 1,428 | 0,007199 | 96,066 % | -0,640 % |
| Q5_K_M | 1,259 | 0,025549 | 92,204 % | -0,762 % |
| Q5_K_S | 1,233 | 0,029246 | 90,934 % | -0,325 % |
| Q4_K_M | 1,100 | 0,078081 | 86,657 % | +8,548 % |
| Q4_K_S | 1,056 | 0,086320 | 85,936 % | +9,472 % |
| IQ4_NL | 1,050 | 0,082172 | 86,584 % | +3,696 % |
| IQ4_XS | 1,004 | 0,089715 | 85,814 % | +5,711 % |
| Q3_K_M | 0,915 | 0,211307 | 78,886 % | +19,529 % |
| IQ3_M | 0,869 | 0,213445 | 78,263 % | +13,961 % |
| IQ3_S | 0,855 | 0,252816 | 75,941 % | +14,683 % |
| Q2_K | 0,750 | 0,812599 | 59,922 % | +104,098 % |
| IQ2_XS | 0,616 | 1,169763 | 53,055 % | +172,870 % |
| IQ1_M | 0,519 | 2,609784 | 31,953 % | +1050,699 % |
| Q1_0 | 0,431 | 8,025374 | 0,391 % | +242158,584 % |

Liquid AI publica mediciones de inferencia en edge a 32K de contexto en su model card oficial, pero corresponden al modelo base y no a este paquete GGUF; no se incluyen valores numéricos de esas mediciones en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,43 GB (Q1_0) y 1,85 GB (Q8_0) solo de pesos; añadiendo KV-cache y sobrecarga de runtime, cualquier GPU o CPU con 2-4 GB de memoria disponible ejecuta el modelo con holgura en contextos moderados. Para el contexto completo de 256K, los requisitos de KV-cache crecen sustancialmente y no están cuantificados en la información disponible.
- GPU recomendadas: dado el tamaño, no se requieren aceleradoras de datacenter; cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090, Apple Silicon con memoria unificada) es más que suficiente. También funciona por CPU puro con velocidad aceptable al ser un modelo de 1,7B.
- Consumer GPUs: cabe íntegramente en prácticamente cualquier GPU con 2 GB o más de VRAM en cuantizaciones de 4 bits o superiores, incluso con offload completo de capas.
- Opciones de despliegue: llama.cpp (runtime principal, requiere una compilación compatible con LFM3), y en consecuencia cualquier herramienta basada en él como Ollama o LM Studio. No se menciona soporte para vLLM ni TGI para el formato GGUF.
- Latencia y throughput: no disponible en la información proporcionada; las mediciones de edge inference de Liquid AI a 32K de contexto están referidas al modelo base y no a este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B (base, Liquid AI) | 1,73 B | 256K | BF16 (safetensors) | LFM Open License v1.0 | Modelo original, tri-híbrido, 16 idiomas |
| LFM3-1.7B-GGUF (esta ficha) | 1,73 B | 256K (validado hasta 4.096) | GGUF, 15 cuantizaciones | LFM Open License v1.0 | Cuantización comunitaria con mediciones de fidelidad |
| Qwen3-1.7B (Alibaba) | 1,7 B | no disponible en la información proporcionada | safetensors y GGUF comunitarios | Apache 2.0 | Alternativa densa de tamaño similar, muy extendida en ecosistema GGUF |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Liquid AI desaconseja explícitamente el uso del modelo base para codificación agéntica y razonamiento complejo de múltiples pasos; no es sustituto de modelos de razonamiento dedicados.
- Las cuantizaciones de bits muy bajos degradan severamente la calidad: IQ1_M pierde más del 1.000 % de perplejidad relativa y Q1_0 es directamente inutilizable (coincidencia top-1 del 0,39 %). Se recomiendan Q5_K_M o superiores cuando la calidad importa.
- El contexto de 256K tokens no ha sido validado en este repositorio: las comprobaciones se limitan a 4.096 tokens y la evaluación de fidelidad a 2.048, por lo que el comportamiento en contextos largos es una incógnita hasta que se pruebe.
- La licencia LFM Open License v1.0 es de tipo "other": conviene revisar sus términos antes de cualquier despliegue comercial, ya que no es una licencia permisiva estándar (Apache/MIT) y puede incluir restricciones.
- Es una cuantización comunitaria sin respaldo oficial de Liquid AI; el soporte depende de que llama.cpp mantenga compatibilidad con la arquitectura LFM3.
- Como todo modelo de lenguaje de menos de 2B de parámetros, es esperable un riesgo elevado de alucinación y debilidad en tareas de conocimiento factual complejo; no hay evaluaciones de sesgos publicadas (no disponible).
- Las mediciones de fidelidad miden solo predicción del siguiente token; la calidad en cargas de trabajo concretas puede diferir.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ngquocvinh/LFM3-1.7B-GGUF
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/ngquocvinh/LFM3-1.7B-GGUF/blob/main/LICENSE
- Mediciones de fidelidad (TSV): https://huggingface.co/ngquocvinh/LFM3-1.7B-GGUF/blob/main/reproducibility/fidelity-measurements.tsv
- Manifiesto de reproducibilidad: https://huggingface.co/ngquocvinh/LFM3-1.7B-GGUF/blob/main/reproducibility/manifest.md
- Checksums SHA256: https://huggingface.co/ngquocvinh/LFM3-1.7B-GGUF/blob/main/SHA256SUMS.txt
- llama.cpp: https://github.com/ggml-org/llama.cpp
