# kprzyb/PolDense-150M-GGUF

## Resumen

PolDense-150M-GGUF es la conversión al formato GGUF del modelo de embeddings OPI-PIB/PolDense-150M, un encoder denso de recuperación de información especializado en polaco y construido sobre la arquitectura ModernBERT. Lo publica el usuario kprzyb como conversión no oficial, sin vinculación con el equipo original de OPI-PIB, y su propósito es permitir el uso del modelo dentro del ecosistema llama.cpp y de las herramientas que se apoyan en él (llama-server, node-llama-cpp, etc.).

El modelo resuelve la tarea de generar representaciones vectoriales densas para búsqueda semántica y recuperación de pasajes en polaco, con un tamaño de 149.014.272 parámetros, lo que lo sitúa en la gama ligera y permite ejecutarlo en CPU con requisitos de memoria muy modestos. Se distribuye en dos cuantizaciones, F16 (286 MiB) y Q8_0 (153 MiB), y mantiene una alta fidelidad respecto a los pesos originales en fp32 según las verificaciones del autor de la conversión.

Su relevancia actual radica en que cubre un hueco poco atendido: los modelos de embeddings de calidad para lenguas eslavas occidentales con despliegue local sencillo. Al estar en GGUF, se puede integrar en pipelines de RAG sin depender de infraestructura GPU ni de frameworks Python, aunque con la advertencia importante de que el modelo usa atención bidireccional y requiere procesar la entrada completa en un único micro-lote.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (según la configuración de ejemplo del autor; el máximo real depende de la ventana de ModernBERT del modelo base, no disponible de forma explícita) |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | polaco (pl); el autor menciona pruebas con textos en inglés, pero el entrenamiento declarado es en polaco |
| Licencia | Gemma Terms of Use (restricciones de uso de la sección 3.2 y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (F16 y Q8_0); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer bidireccional con las optimizaciones propias de esta familia (atención con rotación posicional y capas de atención eficientes), del cual este repositorio solo contiene la conversión de pesos, no un reentrenamiento. El modelo base OPI-PIB/PolDense-150M es un modelo de recuperación densa entrenado para polaco; los detalles de composición del dataset, número de tokens de entrenamiento y si hubo fases de ajuste con pares positivos/negativos no se especifican en la información disponible, y la model card remite al repositorio original.

La innovación técnica relevante de esta conversión no está en el entrenamiento sino en el procedimiento de despliegue. Al tratarse de un encoder bidireccional, llama.cpp debe procesar todo el texto en un único micro-lote, de modo que el autor documenta la necesidad de fijar `-b` y `-ub` al menos al número de tokens de la entrada más larga (por ejemplo, `-c 8192 -b 8192 -ub 8192`). Además, el pooling es CLS (almacenado en los metadatos del GGUF) y los prefijos de tarea (`"[query]: "` para consultas, `"[sts]: "` para similitud simétrica) deben añadirse manualmente en el código, porque los runtimes GGUF no leen `config_sentence_transformers.json`. La conversión se realizó con `convert_hf_to_gguf.py` (commit `4a80943`, `--outtype f32`) y `llama-quantize` (release b9297).

## Capacidades

- Generación de embeddings densos para búsqueda semántica y recuperación de pasajes en polaco.
- Extracción de características (`feature-extraction`) y similitud de frases (`sentence-similarity`).
- Recuperación asimétrica consulta-documento mediante el prefijo `"[query]: "`.
- Tareas simétricas de similitud mediante el prefijo `"[sts]: "` en ambos textos.
- Procesamiento de entradas largas (hasta 8192 tokens en la configuración documentada), con verificación sobre un texto de 3052 tokens.
- Integración con llama.cpp, llama-server y wrappers basados en node-llama-cpp.
- Endpoint compatible con la API de embeddings de OpenAI (`/v1/embeddings`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada: el idioma declarado es únicamente el polaco.

## Casos de uso

- Búsqueda semántica en corpus polacos: indexar documentos con embeddings de pasaje y consultar con el prefijo `"[query]: "`, usando similitud coseno sobre vectores normalizados; el tamaño de 150M permite indexar grandes volúmenes en CPU.
- RAG sobre documentación interna en polaco: generar embeddings de fragmentos de manuales, contratos o bases de conocimiento y recuperar los pasajes relevantes antes de pasarlos a un LLM generador, sin necesidad de GPU.
- Deduplicación y clustering de textos: usar la similitud simétrica (`"[sts]: "`) para agrupar noticias, tickets de soporte o reseñas en polaco y detectar duplicados por umbral de coseno.
- Motor de búsqueda local en aplicaciones de escritorio: al pesar 153 MiB en Q8_0, puede embeberse en herramientas de escritorio o plugins que ya usan llama.cpp, con inferencia en CPU.
- Clasificación y enrutamiento por similitud: comparar la consulta del usuario contra un conjunto de intenciones predefinidas y enrutar al flujo adecuado en un chatbot de atención al cliente en polaco.
- Filtrado previo en pipelines de moderación o compliance: recuperar documentos candidatos por similitud semántica antes de aplicar reglas o modelos más costosos.
- Evaluación de calidad de recuperación: servir como baseline ligero en experimentos de IR en polaco, comparando su recall frente a modelos multilingües de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión solo incluye verificaciones de fidelidad numérica frente al modelo original en fp32, no métricas de recuperación (Recall@k, nDCG, MTEB):

| Fichero | Coseno mínimo, textos cortos | Coseno, texto largo (3052 tokens) |
|---|---|---|
| F16 | 0.99995 | 0.99995 |
| Q8_0 | 0.99895 | 0.99916 |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 286 MiB para F16 y 153 MiB para Q8_0 en pesos; el consumo total depende de la longitud de contexto y del tamaño del lote, pero es del orden de unos cientos de MiB.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1-2 GB de memoria libre puede alojarlo, incluidas GTX 1650, RTX 3060 o superiores. En A100/H100 el modelo queda sobredimensionado en capacidad de cómputo y el cuello de botella será el lote.
- Cabe holgadamente en cualquier GPU de consumo e incluso en Raspberry Pi y CPUs modestas.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding --pooling cls`), node-llama-cpp y cualquier herramienta que consuma GGUF. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma numérica. El autor realizó las verificaciones en CPU con llama-server b9297; el rendimiento dependerá del número de hilos y de la longitud de entrada, y el procesamiento en un único micro-lote limita el paralelismo por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Formato | Licencia |
|---|---|---|---|---|---|
| PolDense-150M-GGUF | 149 M | 8192 (config. documentada) | Polaco | GGUF | Gemma Terms of Use |
| OPI-PIB/PolDense-150M | 149 M | no disponible | Polaco | safetensors | Gemma Terms of Use |
| Modelos de embeddings multilingües tipo e5 o BGE | 100-600 M según variante | 512-8192 según variante | Multilingüe | safetensors, GGUF en algunas variantes | MIT o similar según variante |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. La ventaja diferencial de esta conversión es el despliegue en GGUF con cuantización Q8_0 de 153 MiB y fidelidad verificada frente al original; su desventaja es el alcance monolingüe en polaco y la licencia Gemma, más restrictiva que las licencias permisivas habituales en modelos de embeddings.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no está afiliado a OPI-PIB y no se hace responsable de posibles regresiones respecto al modelo original más allá de las verificaciones publicadas.
- La licencia es Gemma Terms of Use, no una licencia de código abierto permisiva: se aplican las restricciones de la sección 3.2 y la Gemma Prohibited Use Policy, y al redistribuir hay que incluir las restricciones de uso como provisión exigible y entregar una copia de los términos.
- Riesgo de uso incorrecto silencioso: si el runtime divide la entrada en trozos de 512 tokens (por ejemplo, qmd ≤ 2.8.3 vía node-llama-cpp), el vector resultante solo cubre el último fragmento y la recuperación se degrada sin error visible.
- Los prefijos `"[query]: "` y `"[sts]: "` no se aplican automáticamente; olvidarlos altera la calidad de los embeddings.
- El pooling debe ser CLS y los vectores deben normalizarse antes de usar similitud coseno.
- Cobertura lingüística limitada al polaco; su uso con otros idiomas no está garantizado y probablemente degrade la calidad.
- Riesgo de sesgos y alucinaciones: al ser un encoder, no genera texto, pero puede heredar sesgos del corpus de entrenamiento original en la representación de entidades y términos; no se documentan evaluaciones de sesgo.
- No apto para generación de texto, razonamiento, código ni tool calling; usarlo fuera de tareas de embeddings no tiene sentido.
- La ventana máxima real del modelo base no se documenta de forma explícita; el valor de 8192 procede del ejemplo de configuración del autor y conviene validarlo contra la model card original.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/kprzyb/PolDense-150M-GGUF
- Modelo base: https://huggingface.co/OPI-PIB/PolDense-150M
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Incidencia sobre el troceado a 512 tokens: https://github.com/tobi/qmd/issues/897
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
