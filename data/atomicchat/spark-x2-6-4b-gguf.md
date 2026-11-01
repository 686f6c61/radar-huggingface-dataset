# AtomicChat/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B-GGUF es una colección de cuantizaciones GGUF del modelo Spark-X2.6 4B de XHToken, preparadas por AtomicChat a partir de los pesos originales en BF16. El repositorio no es un modelo nuevo en sí, sino builds optimizados para ejecución local con llama.cpp, con la particularidad de que cada cuantización emplea una matriz de importancia (imatrix) propia y una disposición "Atomic Dynamic" (AD-) que asigna un tipo de cuantización distinto a cada grupo de tensores según mediciones empíricas.

El valor diferencial de esta ficha de cuantización es la transparencia: AtomicChat publica los corpora de calibración, los logs de métricas y una comparativa medida contra todas las builds GGUF de terceros que pudo encontrar (oficiales y de bartowski), usando divergencia KL y coincidencia top-1 frente al original BF16. Su build recomendada, AD-Q4_K_M (2,79 GB), coincide con el original en la elección de token el 90,62 % de las veces, superando al Q4_K_M oficial (88,12 %) con menos espacio en disco.

El modelo base es un LLM conversacional de 4,11 mil millones de parámetros orientado a generación de texto con modo de pensamiento (thinking), ejecutable localmente incluso en GPUs de consumo de 6 GB. Su relevancia actual radica en la tendencia de modelos pequeños de alta calidad cuantizados para inferencia en estaciones de trabajo locales, donde la eficiencia por gigabyte es crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (tres de cada cuatro bloques usan ventana deslizante de 512 tokens); detalles completos no disponibles |
| Parámetros totales | 4.112.079.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible como máximo oficial; la caché completa consume 144 KB/token (1,1 GB a 8k, 4,5 GB a 32k) |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde BF16) |

## Arquitectura y entrenamiento

Sobre la arquitectura del modelo base, la información disponible indica que es un transformer con un patrón de atención híbrido: tres de cada cuatro bloques atienden solo sobre una ventana de 512 tokens (sliding window), lo que permite usar la caché de ventana deslizante por defecto de llama.cpp y reducir sustancialmente el consumo de memoria en contextos largos. No se han publicado detalles sobre el número de capas, cabezas de atención, datos de entrenamiento, número de tokens ni procesos de alineación (RLHF/DPO).

En cuanto a la cuantización, AtomicChat genera cada GGUF desde los pesos BF16 originales usando su propia matriz de importancia (imatrix), calibrada con corpora públicos (el dataset AtomicChat/calib-corpora). La disposición "Atomic Dynamic" asigna a cada grupo de tensores su propio tipo de cuantización decidido por medición, en lugar de aplicar un esquema uniforme. Según el autor, el Q4_K_M por defecto de llama.cpp del mismo BF16 (2,60 GB) alcanza una divergencia KL de 0,0921 y un top-1 del 86,35 %, cifra que todas las builds AD- publicadas superan a su tamaño respectivo.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Modo de pensamiento (thinking) activado por defecto en Atomic Chat con el motor llama.cpp b11946 o posterior.
- Ejecución local eficiente gracias a las cuantizaciones con imatrix propia y disposición dinámica por grupos de tensores.
- Atención con ventana deslizante en la mayoría de bloques, que reduce la memoria de la caché KV en contextos largos.
- Compatibilidad con el ecosistema GGUF/llama.cpp (endpoints_compatible).
- Capacidades de tool calling, agentes, código, matemáticas, visión o audio: no disponible.

## Casos de uso

- Chatbot local privado: ejecución íntegra en una GPU de consumo con AD-Q4_K_M (2,79 GB), sin enviar datos a servicios externos, adecuado para asistentes conversacionales con requisitos de privacidad.
- Inferencia en GPUs de 6 GB: la build AD-Q6_K deja espacio para unos 9k tokens de contexto, útil para portátiles con GPUs de gama media que no pueden albergar modelos mayores.
- Asistentes con contexto largo en GPUs de 12-16 GB: con Q8_0 (máxima fidelidad, divergencia KL 0,0024) se alcanzan unos 49k-77k tokens de contexto, apropiado para resumen de documentos extensos o análisis de código en repositorios.
- Despliegue multiusuario de bajo coste: al ser un modelo de 4B con huella de 2,6-4,4 GB por instancia, varias instancias pueden coexistir en una sola GPU de datacenter para servir tráfico concurrente.
- Investigación en cuantización: los corpora de calibración públicos y los logs de métricas permiten reproducir experimentos de imatrix y comparar estrategias de cuantización dinámica frente a esquemas uniformes.
- Integración en aplicaciones con llama.cpp: los GGUF son directamente compatibles con llama.cpp, Ollama, LM Studio y servidores compatibles con el formato, facilitando la incrustación en productos locales.
- Selección de cuantización ajustada al hardware: la tabla de compatibilidad por VRAM (6/8/12/16 GB) permite elegir el archivo que maximiza fidelidad sin quedarse sin memoria para la caché KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) del modelo base en la información disponible. Sí se han publicado métricas de fidelidad de cuantización frente al original BF16:

| Archivo | Tamaño en disco | Divergencia KL | top-1 |
|---|---:|---:|---:|
| Q8_0 | 4,38 GB | 0,00236 | 98,09 % |
| AD-Q6_K | 3,86 GB | 0,00482 | 97,08 % |
| AD-Q5_K_M | 3,15 GB | 0,01602 | 94,25 % |
| AD-Q4_K_M (recomendado) | 2,79 GB | 0,04202 | 90,62 % |
| AD-IQ4_XS | 2,63 GB | 0,05670 | 89,27 % |
| AD-IQ3_S | 2,14 GB | 0,19229 | 80,74 % |

## Requisitos de hardware

- VRAM estimada para inferencia (según la model card, con caché completa y 1 GB para buffers de cómputo):
  - GPU de 6 GB: AD-Q6_K, deja sitio para unos 9k de contexto.
  - GPU de 8 GB: Q8_0, unos 20k de contexto.
  - GPU de 12 GB: Q8_0, unos 49k de contexto.
  - GPU de 16 GB: Q8_0, unos 77k de contexto.
- La caché KV a tamaño completo consume 144 KB por token (1,1 GB a 8k, 4,5 GB a 32k); con la caché de ventana deslizante por defecto de llama.cpp el consumo es menor, ya que tres de cada cuatro bloques solo atienden a 512 tokens.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o más es suficiente (RTX 3060, RTX 4060 Ti, RTX 4090, etc.); no se requieren A100 ni H100.
- Sí cabe en GPUs de consumo desde 6 GB de VRAM con las builds AD-.
- Despliegue: llama.cpp (motor b11946 o posterior recomendado para thinking), Ollama, LM Studio y cualquier runtime compatible con GGUF; no consta soporte verificado en vLLM o TGI para GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa entre las builds de este repositorio y las builds de terceros medidas por AtomicChat sobre el mismo modelo base:

| Build | Tamaño | Divergencia KL | top-1 | Autor |
|---|---:|---:|---:|---|
| Q8_0 | 4,38 GB | 0,0024 | 98,09 % | oficial / AtomicChat (mismo archivo) |
| Q6_K | 3,61 GB | 0,0070 | 96,27 % | bartowski |
| AD-Q5_K_M | 3,15 GB | 0,0160 | 94,25 % | AtomicChat |
| Q4_K_M oficial | 3,54 GB | 0,0700 | 88,12 % | oficial |
| Q4_K_M por defecto de llama.cpp | 2,60 GB | 0,0921 | 86,35 % | llama.cpp |
| Q4_K_M | 2,62 GB | 0,0697 | 87,91 % | bartowski |
| IQ4_XS | 2,34 GB | 0,0977 | 85,73 % | bartowski |
| AD-IQ3_S | 2,14 GB | 0,1923 | 80,74 % | AtomicChat |

Comparativa con otros modelos de la misma categoría de tamaño (4B): no disponible; no se han publicado datos del modelo base frente a alternativas como Qwen o Gemma en tamaños equivalentes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta ningún auditoría de sesgos del modelo base.
- Riesgo de alucinación: al ser un LLM generativo de 4B, el riesgo de alucinación es inherente; no hay datos cuantificados del modelo base.
- Contexto e idioma: la longitud máxima de contexto y los idiomas soportados no están documentados; la atención con ventana de 512 tokens en tres de cada cuatro bloques puede limitar la recuperación de información muy lejana en el prompt si se usa la caché de ventana deslizante.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial; conviene verificar la licencia del modelo base XHToken/Spark-X2.6-4B.
- Cuantizaciones agresivas: AD-IQ3_S solo coincide con el original en el 80,74 % de las elecciones de token (divergencia KL 0,19), lo que puede degradar apreciablemente la calidad en tareas exigentes; se recomienda AD-Q4_K_M o superior para uso serio.
- La comparativa de fidelidad (KL/top-1) mide cercanía a los pesos originales, no calidad en tareas downstream; una build con mejor KL no garantiza mejores resultados en benchmarks de aplicación.
- Para el modo thinking se requiere llama.cpp b11946 o posterior; versiones anteriores pueden no soportarlo correctamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Corpora de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/Spark-X2.6-4B-GGUF-metrics
- Atomic Chat (aplicación): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
