# philbert440/Qwen3.8-27B-Uncensored-Balanced

## Resumen

Qwen3.8-27B-Uncensored-Balanced es una variante "de-refused" (abliterated) del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario philbert440. El objetivo es eliminar los rechazos de seguridad del modelo original manteniendo intactas las capacidades de razonamiento, factualidad y calibración. El nombre "Balanced" indica que se ha buscado un punto óptimo entre apertura y calidad, en contraste con la versión "Aggressive" del mismo autor que sobre-ablacionaba el modelo.

El modelo se construye mediante ortogonalización del vector de rechazo (método de Arditi et al. 2024, popularizado por mlabonne), extrayendo la dirección de rechazo en la capa 28 (no-thinking) y aplicándola a las matrices de escritura con un factor α=1.15. Se preservan tanto la cabeza de decodificación especulativa MTP como la torre de visión, por lo que mantiene las capacidades multimodales del modelo base. Con 27,36 mil millones de parámetros y una ventana de contexto de 262K tokens, es un modelo denso de propósito general con entrada de imagen y texto.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para casos de uso donde el modelo base rechaza peticiones legítimas, manteniendo a la vez un rendimiento en razonamiento y matemáticas idéntico al original. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con vision (VLM), basado en Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (del modelo base) |
| Tipos de cuantizacion | W4A16-AWQ, NVFP4, GGUF (Q4_K_M ~16,8 GB) |
| Idiomas soportados | No disponible (heredados del modelo base, que soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF en repos separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con arquitectura de vision-language (VLM) que acepta entradas de imagen y texto. El proceso de abliteración consiste en extraer el vector de rechazo de la capa 28 (en modo no-thinking) y ortogonalizar las matrices de escritura contra esa dirección, con un factor α=1.15. Este valor se seleccionó tras un barrido de fuerza de ablación evaluado con un benchmark propio juzgado por Claude Haiku, que determinó que α≈1.24 (usado en la versión Aggressive) sobre-ablaciona y degrada la apertura y el razonamiento, mientras que α=1.15 es el punto máximo de apertura sin coste de calibración.

Se preservan la cabeza de decodificación especulativa MTP (Multi-Token Prediction) y la torre de visión, por lo que el modelo conserva las capacidades multimodales y de generación especulativa del base. No se ha realizado entrenamiento adicional con RLHF ni DPO; el proceso es puramente de intervención en los pesos. El dataset de entrenamiento del modelo base no está disponible en la información proporcionada.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de imagen y texto, generando respuestas textuales.
- Razonamiento y matematicas: mantiene el rendimiento GSM8K del modelo base (0,85), sin degradacion por la ablacion.
- Generacion de codigo: hereda las capacidades de codigo del modelo base Qwen3.8-27B, disenado como modelo local de programacion.
- Tool calling y function calling: soportado por el modelo base, preservado en esta variante.
- Decodificacion especulativa: la cabeza MTP se mantiene intacta, permitiendo inferencia acelerada.
- Capacidad de seguir instrucciones sin rechazos: el modelo acepta peticiones que el base declinaria, con una apertura medida de 0,88 frente a 0,08 del modelo censurado.
- Multilingue: idiomas heredados del modelo base (no especificados en la informacion disponible).

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en entornos de desarrollo como copiloto sin enviar codigo a la nube, gracias a su licencia permisiva y su capacidad de generacion de codigo. Su decodificacion especulativa MTP reduce la latencia en sesiones interactivas.
- Analisis de documentos con imagenes: al ser un VLM, puede procesar capturas de pantalla, diagramas o fotografias de texto y extraer informacion estructurada, util en entornos de documentacion tecnica o legal.
- Investigacion academica sobre alineacion y seguridad: el modelo sirve como banco de pruebas para estudiar el efecto de la abliteracion en el razonamiento, la factualidad y la calibracion, comparando con las versiones stock y aggressive.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material educativo donde el modelo base rechazaria ciertos temas por politicas de seguridad, manteniendo coherencia y calidad.
- Automatizacion de soporte tecnico: con su ventana de 262K tokens, puede gestionar conversaciones multi-turno con contexto largo, incluyendo manuales extensos o historiales de incidencias, sin perder informacion relevante.
- Despliegue en entornos con requisitos de soberania de datos: al poder ejecutarse localmente con cuantizaciones GGUF (Q4_K_M ~16,8 GB) o AWQ, es viable en infraestructura propia sin dependencia de APIs externas.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion propia, juzgada por Claude Haiku, con metricas de apertura (openness), confabulacion (confab), factualidad (factual) y razonamiento matematico (gsm8k). Los resultados comparan el modelo stock, la version Balanced y la version Aggressive:

| Metrica | Stock base (censurado) | Balanced (α=1.15) | Aggressive (α≈1.24) |
|---|---|---|---|
| Openness (↑) | 0,08 | 0,88 | 0,80 |
| Confabulacion (↓) | 0,75 | 0,725 | 0,80 |
| Factualidad (↑) | 1,00 | 1,00 | 1,00 |
| GSM8K (↑) | 0,85 | 0,85 | 0,817 |

La apertura sube de 0,08 a 0,88 sin coste en factualidad ni en GSM8K, y con una confabulacion ligeramente inferior a la del modelo base. La mejora sobre la version Aggressive es direccional pero no estadisticamente significativa en esta muestra. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en precision completa (BF16) ocupa aproximadamente 55 GB, por lo que requiere una GPU con al menos 60 GB de VRAM (A100 80GB, H100 80GB) o dos GPUs de 32 GB en paralelo.
- Con cuantizacion W4A16-AWQ: la VRAM se reduce a unos 16-18 GB, permitiendo ejecucion en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Con cuantizacion GGUF Q4_K_M (~16,8 GB): cabe en GPUs consumer de 24 GB, y con cuantizaciones mas agresivas (Q3, Q2) podria ejecutarse en 12-16 GB, aunque con perdida de calidad.
- Opciones de despliegue: vLLM para inferencia de alto rendimiento con AWQ, llama.cpp u Ollama para GGUF, y TGI para despliegue en produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa MTP deberia mejorar el throughput respecto a un modelo sin ella, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Apertura | Razonamiento (GSM8K) |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,36B | 262K | Apache-2.0 | 0,08 | 0,85 |
| Qwen3.8-27B-Uncensored-Balanced | 27,36B | 262K | Apache-2.0 | 0,88 | 0,85 |
| Qwen3.8-27B-Uncensored-Aggressive | 27,36B | 262K | Apache-2.0 | 0,80 | 0,817 |
| Qwen3.8-27B-Uncensored-Cyber | 27,36B | 262K | Apache-2.0 | 99/100 (cyber) | 22/25 (GSM8K) |

La comparativa se limita a las variantes del mismo autor sobre el mismo modelo base, ya que no se dispone de datos de otros modelos abliterated de tamano similar en la informacion proporcionada. La version Cyber esta orientada a seguridad ofensiva y reporta una apertura del 99/100 en su conjunto de evaluacion propio, con GSM8K de 22/25.

## Limitaciones y advertencias

- Sesgos conocidos: el proceso de abliteracion no elimina sesgos del modelo base; puede amplificar respuestas que el modelo original rechazaria por razones eticas o de seguridad.
- Riesgo de alucinacion: la confabulacion se mantiene en niveles similares al base (0,725), pero sigue presente; en dominios especializados puede generar informacion falsa con alta fluidez.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, el rendimiento en contextos muy largos puede degradarse; no se han publicado evaluaciones de recuperacion de informacion en ventanas extremas.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el autor advierte que el modelo seguira instrucciones que de otro modo declinaria; el usuario es responsable del cumplimiento legal.
- Advertencia para produccion: al ser un modelo "uncensored", puede generar contenido inapropiado, ilegal o danino si se le pide. No se recomienda su despliegue en aplicaciones orientadas al publico general sin filtros adicionales de seguridad.
- Datos de entrenamiento: no se dispone de informacion sobre la composicion del dataset del modelo base, lo que dificulta evaluar sesgos especificos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Balanced
- Repositorio GGUF de la version Cyber: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF
- Repositorio GitHub con instalador de Qwen3.8-27B: https://github.com/qwen3-8-27b/qwen3-8-27b
- Repositorio GitHub con pack uncensored para Qwen3.8-27B: https://github.com/Wassimyounes01/qwen38-uncensored
- Guia completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
