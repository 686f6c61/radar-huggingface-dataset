# AtomicChat/Spark-X2.6-1.7B-GGUF

## Resumen

Spark-X2.6 1.7B es un modelo de lenguaje conversacional desarrollado por XHToken, del que AtomicChat publica esta colección de cuantizaciones en formato GGUF para su ejecución local con llama.cpp. El modelo base tiene 1.707.657.216 de parámetros y se distribuye originalmente en pesos BF16; las builds de AtomicChat se generan a partir de esos pesos usando una matriz de importancia (imatrix) propia, cuya corpora de calibración es pública.

La relevancia de este repositorio no está tanto en el modelo en sí como en la calidad de las cuantizaciones: AtomicChat mide cada archivo (los suyos y los de terceros) contra el original BF16 sobre el mismo texto de validación, publicando divergencia KL y coincidencia top-1. Sus cuantizaciones "Atomic Dynamic" (prefijo `AD-`) asignan un tipo de cuantización distinto a cada grupo de tensores según mediciones empíricas, logrando menor divergencia KL que las builds oficiales de llama.cpp y las de mradermacher en la mayoría de tamaños.

Al ser un GGUF de 1,7B de parámetros, el objetivo es la inferencia en hardware modesto: cabe con holgura en GPUs de consumo de 4-8 GB e incluso en CPU, lo que lo hace adecuado para chat local, agentes ligeros y despliegues edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con ventana deslizante parcial, según la model card) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la cache por defecto de llama.cpp consume 56 KB/token; se mencionan contextos de hasta 32k en las tablas de hardware) |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ4_XS-IQ3_S (GGUF con imatrix propia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base XHToken/Spark-X2.6-1.7B) |
| Formato de pesos | GGUF (cuantizado desde BF16) |

## Arquitectura y entrenamiento

El modelo base, XHToken/Spark-X2.6-1.7B, es un transformer conversacional de 1,7B de parámetros. La model card del repositorio GGUF no detalla la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset, aunque sí revela un dato estructural relevante: tres de cada cuatro bloques de atención operan sobre una ventana de 512 tokens, lo que permite usar la cache de ventana deslizante de llama.cpp y reduce notablemente el consumo de memoria en contextos largos. Esto sugiere un diseño híbrido entre atención global y local.

Sobre el entrenamiento del modelo original no hay datos publicados en la información disponible (tokens, datasets, RLHF/DPO). En cuanto a la cuantización, AtomicChat emplea su método "Atomic Dynamic": cada grupo de tensores recibe un tipo de cuantización asignado por medición directa contra los pesos BF16 originales, usando una matriz de importancia calculada sobre una corpora de calibración pública (AtomicChat/calib-corpora). Los archivos `AD-` publicados superan en fidelidad (menor KL, mayor top-1) a las builds equivalentes de llama.cpp y mradermacher en casi todos los tamaños.

## Capacidades

- Generación de texto conversacional (etiquetado como `conversational` y `text-generation`).
- Modo de razonamiento ("thinking") activado por defecto en Atomic Chat con el motor de llama.cpp b11946 o posterior.
- Ejecución eficiente en local gracias a cuantizaciones agresivas de alta fidelidad (hasta 0,83-0,96 GB).
- Compatibilidad total con el ecosistema llama.cpp y derivados (Ollama, LM Studio, etc.).
- Soporte de contextos largos con consumo de cache reducido por la atención de ventana local (56 KB/token con cache completa).
- No hay información disponible sobre tool calling, capacidades de visión/audio ni soporte multilingüe explícito.

## Casos de uso

- Chatbot local en PC de gama media: con la variante `Q8_0` (1,82 GB) se obtiene la máxima fidelidad al original en una GPU de 4 GB con unos 23k tokens de contexto, ideal para asistentes personales privados sin enviar datos a la nube.
- Asistentes embebidos en aplicaciones de escritorio: la variante `AD-Q4_K_M` (1,17 GB, recomendada por el autor) equilibra tamaño y calidad, y puede distribuirse junto a la aplicación sin apenas impacto en disco.
- Agentes ligeros con razonamiento en cadena: el modo thinking por defecto permite tareas multi-paso simples (planificación, resumen estructurado) en hardware de consumo.
- Prototipado y pruebas de prompts: el bajo tamaño permite iterar rápido en portátiles o incluso CPU antes de escalar a modelos mayores.
- Despliegue edge y IoT con GPU/NPU de 3 GB: `AD-Q6_K` deja espacio para unos 9k tokens de contexto manteniendo un top-1 del 96,2% frente al original.
- Comparación y evaluación de cuantizaciones: el repositorio publica métricas KL y top-1 de todas las builds conocidas, útil como referencia metodológica para quien cuantice otros modelos.
- Procesamiento de textos largos en memoria limitada: la cache de ventana deslizante (tres cuartas partes de los bloques atienden a 512 tokens) reduce el coste de contexto en resumen de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) del modelo base en la información disponible. Lo que sí se ha medido es la fidelidad de cada cuantización frente al original BF16:

| Archivo | Tamano en disco | Divergencia KL | top-1 |
|---|---:|---:|---:|
| `Q8_0` | 1,82 GB | 0,00236 | 97,58% |
| `AD-Q6_K` | 1,61 GB | 0,00534 | 96,20% |
| `AD-Q5_K_M` | 1,31 GB | 0,02173 | 92,51% |
| `AD-Q4_K_M` (recomendado) | 1,17 GB | 0,05602 | 87,99% |
| `AD-IQ4_XS` | 1,11 GB | 0,07414 | 86,35% |
| `AD-IQ4_XS-IQ3_S` | 0,96 GB | 0,16981 | 79,58% |

Comparativa con builds de terceros (medidas por AtomicChat sobre el mismo conjunto de texto):

| Build externa | Tamano | KL | top-1 | Fidel más cercana al original |
|---|---:|---:|---:|---|
| oficial `Q8_0` | 1,82 GB | 0,0027 | 97,50% | AtomicChat `Q8_0` |
| oficial `Q4_K_M` | 1,77 GB | 0,0942 | 84,82% | AtomicChat `AD-Q6_K` |
| mradermacher `i1-Q6_K` | 1,41 GB | 0,0143 | 94,14% | mradermacher |
| mradermacher `i1-Q5_K_M` | 1,25 GB | 0,0376 | 90,22% | mradermacher |
| mradermacher `i1-Q4_K_M` | 1,11 GB | 0,1360 | 82,08% | AtomicChat `AD-IQ4_XS` |
| llama.cpp `Q4_K_M` por defecto | 1,11 GB | 0,1288 | 82,13% | AtomicChat `AD-IQ4_XS` |
| mradermacher `i1-IQ4_XS` | 1,02 GB | 0,1531 | 80,92% | mradermacher |

## Requisitos de hardware

- El modelo con cache completa de llama.cpp consume 56 KB por token (0,4 GB a 8k de contexto, 1,8 GB a 32k); la cache de ventana deslizante por defecto necesita menos, ya que el 75% de los bloques solo atiende a 512 tokens.
- GPU de 3 GB: `AD-Q6_K` (1,61 GB), deja sitio para unos 9k tokens de contexto.
- GPU de 4 GB: `Q8_0` (1,82 GB), admite unos 23k tokens de contexto.
- GPU de 6 GB: `Q8_0`, admite unos 60k tokens de contexto.
- GPU de 8 GB: la model card se corta en este punto, por lo que la recomendación exacta para esta clase no está disponible; con cualquier archivo publicado cabe con holgura y el límite lo marca el contexto.
- Cabe sobradamente en GPUs de consumo (RTX 3060, 4060, 4070 y superiores) y es plenamente ejecutable en CPU con llama.cpp dado su tamaño inferior a 2 GB.
- Despliegue: llama.cpp (motor b11946 o posterior para el modo thinking en Atomic Chat), y por extensión Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay menciones a vLLM o TGI, que no aplican a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B cuantizado, se espera inferencia muy rápida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6 1.7B (esta ficha) | 1,71B | GGUF (BF16 original) | no disponible | Apache 2.0 | Cuantizaciones AD- con mejor KL que builds oficiales y de mradermacher en casi todos los tamaños |
| Qwen3 1.7B | 1,7B | safetensors, GGUF (terceros) | 32k+ | Apache 2.0 | Alternativa consolidada de tamaño similar; benchmarks publicados, a diferencia de Spark-X2.6 |
| Llama 3.2 1B | 1,24B | safetensors, GGUF (terceros) | 128k | Licencia Llama (restricciones) | Contexto mucho mayor, pero licencia menos permisiva y menos parámetros |
| Gemma 3 1B | ~1B | safetensors, GGUF (terceros) | 32k | Licencia Gemma (restricciones) | Multilingüe y multimodal ligero, con licencia restrictiva para ciertos usos |

Nota: la comparativa se basa en las características públicas conocidas de las alternativas; no hay benchmarks estandarizados que permitan comparar rendimiento entre ellos con los datos disponibles.

## Limitaciones y advertencias

- No se han publicado benchmarks de capacidades del modelo base, por lo que su calidad real en razonamiento, código o matemáticas es desconocida; conviene evaluarlo antes de uso serio.
- Idiomas soportados, plantilla de chat y longitud máxima de contexto no están documentados en la información disponible.
- Como todo modelo de lenguaje de 1,7B, es esperable un riesgo elevado de alucinaciones y razonamiento superficial frente a modelos de 7B o más; no hay datos que cuantifiquen esto.
- Las cuantizaciones más agresivas (`AD-IQ4_XS-IQ3_S`, 0,96 GB) degradan notablemente la fidelidad (top-1 del 79,58%), lo que puede amplificar errores del modelo base.
- La licencia Apache 2.0 del modelo base y del repo permite uso comercial sin restricciones relevantes, más allá de la nota de patentes estándar de la licencia.
- La model card del repositorio se encuentra truncada en la sección de hardware (se corta en la fila de GPU de 8 GB), por lo que parte de las recomendaciones de configuración no están disponibles.
- El repositorio es una cuantización de terceros (AtomicChat), no la publicación oficial de XHToken; para soporte del modelo en sí, acudir al repo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Spark-X2.6-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Corpora de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Métricas de las builds: https://huggingface.co/datasets/AtomicChat/Spark-X2.6-1.7B-GGUF-metrics
- Atomic Chat (demo/aplicación): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Paper del modelo base: no disponible
