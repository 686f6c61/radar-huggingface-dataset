# mradermacher/Project-Norn-V17-4.5B-GGUF

## Resumen

Project-Norn-V17-4.5B-GGUF es el conjunto de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo base Osakra/Project-Norn-V17-4.5B. Se trata de un modelo de aproximadamente 4.022 millones de parámetros (4,02 B) con licencia Apache 2.0, declarado únicamente para inglés y distribuido mediante transformers/GGUF. El repositorio no incluye model card propia más allá del texto estándar de mradermacher y de la lista de cuantizaciones disponibles, por lo que la práctica totalidad de los detalles de arquitectura y entrenamiento deben inferirse de los tags asociados.

Los tags del modelo apuntan a un diseño poco convencional para su tamaño: sistema dual (dual-system), cadena de pensamiento latente continua (continuous-latent-cot), enfoque neuro-simbólico, memoria holográfica con grafos relacionales mediante representación de rango completo (holographic-memory, relational-graph-hrr), atención cruzada tipo Perceiver, activación SwiGLU y orientación a razonamiento, matemáticas, código y uso agéntico. También aparece el tag qwen3, lo que sugiere una posible base arquitectónica derivada de la familia Qwen3, aunque esto no se documenta explícitamente.

Su relevancia práctica es doble: por un lado, un modelo de 4 B puede ejecutarse en hardware de consumo con cuantizaciones de 1,8 a 4,4 GB; por otro, propone componentes híbridos (memoria holográfica, CoT latente) poco habituales en este rango de tamaño, lo que lo convierte en un objeto de estudio interesante para investigación en razonamiento eficiente. Como contrapartida, el repositorio registra 0 descargas y 0 likes, no publica benchmarks ni detalles de entrenamiento, y las capacidades anunciadas en los tags no están verificadas por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; los tags indican sistema dual, CoT latente continuo, neuro-simbólico, memoria holográfica (HRR sobre grafos relacionales), atención cruzada tipo Perceiver y SwiGLU. Tag qwen3 como posible linaje |
| Parámetros totales | 4.022.468.096 (≈4,02 B), según metadatos de safetensors del modelo base |
| Parámetros activos | No aplicable: no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K (1,8 GB), Q3_K_S (2,0 GB), Q3_K_M (2,2 GB), Q3_K_L (2,3 GB), IQ4_XS (2,4 GB), Q4_K_S (2,5 GB), Q4_K_M (2,6 GB), Q5_K_S (2,9 GB), Q5_K_M (3,0 GB), Q6_K (3,4 GB), Q8_0 (4,4 GB), f16 (8,2 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 36,4 GB |
| Fecha de creación / actualización | 12 de septiembre de 2026 (creación 11:04 UTC; actualización 11:24 UTC) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura con precisión. No se publican detalles sobre el número de capas, dimensiones ocultas, cabezas de atención, tipo de positional encoding, presupuesto de tokens de entrenamiento, composición del dataset ni uso de RLHF, DPO o cualquier otra fase de alineación: todos estos datos están no disponibles. Lo único verificable es el recuento de parámetros del modelo base (4.022.468.096) y el conjunto de tags declarados por el autor.

Según esos tags, el modelo combinaría varios mecanismos: un esquema de sistema dual (procesamiento rápido frente a procesamiento deliberativo), generación de cadena de pensamiento en espacio latente continuo en lugar de en tokens discretos, componentes neuro-simbólicos, un módulo de memoria holográfica basada en representación de rango completo (HRR) aplicada a grafos relacionales, y atención cruzada tipo Perceiver para integrar esas representaciones externas. La presencia del tag swiglu indica el uso de esa activación en las capas feed-forward y el tag qwen3 apunta a una posible ascendencia de la familia Qwen3, extremo no confirmado en la documentación. Cualquier afirmación sobre innovaciones concretas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional en inglés, orientada a razonamiento y respuesta a instrucciones.
- Razonamiento matemático, según los tags math y reasoning (sin evaluación publicada).
- Generación de código, según el tag code (sin evaluación publicada).
- Uso agéntico y razonamiento multi-paso, según el tag agentic.
- Razonamiento en espacio latente continuo (continuous-latent-cot), lo que implicaría una fase interna de deliberación distinta de una cadena de pensamiento en texto plano.
- Memoria estructurada mediante grafos relacionales y representaciones holográficas (HRR), según los tags correspondientes.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se confirma en los tags.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Asistencia matemática y resolución de problemas paso a paso en local: con la cuantización Q4_K_M (2,6 GB) el modelo cabe en cualquier GPU de 6-8 GB o incluso en CPU con 8 GB de RAM, lo que permite desplegar un asistente de cálculo y razonamiento sin conexión ni coste por token.
- Generación de código en pipelines de integración continua: el tag code sugiere utilidad para autocompletado y revisión de parches; se puede invocar desde un runner mediante llama.cpp o llama-cpp-python, siempre que se validen las salidas con tests automáticos dado que no hay benchmarks publicados.
- Investigación en razonamiento latente: al declarar CoT latente continuo, es un candidato para reproducir experimentos sobre deliberación interna frente a cadenas de pensamiento textuales, comparando comportamiento entre cuantizaciones Q8_0 y f16.
- Prototipado de agentes con memoria estructurada: los tags de memoria holográfica y grafos relacionales lo hacen adecuado para experimentos donde el estado del agente se almacena como relaciones y se recupera por atención cruzada, por ejemplo asistentes de soporte técnico con historial de entidades y dependencias.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes (de Q2_K a f16) del mismo modelo, lo que permite medir de forma controlada la degradación de calidad en razonamiento y código al bajar de bits por peso.
- Despliegue en dispositivos de borde: con Q2_K (1,8 GB) o Q3_K_S (2,0 GB) el modelo puede ejecutarse en placas ARM con 8 GB de RAM o en mini-PC, para tareas de clasificación, extracción y resumen en inglés.
- Chat de escritorio integrado en aplicaciones: al ser GGUF, se puede empaquetar con Ollama o LM Studio y distribuirse como asistente local de inglés para documentación técnica o consultas internas.
- Destilación y experimentación con modelos pequeños: sirve como base para probar técnicas de ajuste fino o destilación sobre una arquitectura híbrida de 4 B sin necesidad de clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, GSM8K, HumanEval ni ninguna otra métrica, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ≈ 1,8-2,2 GB; Q3_K_M ≈ 2,2-2,7 GB; Q4_K_M ≈ 2,6-3,2 GB; Q5_K_M ≈ 3,0-3,6 GB; Q6_K ≈ 3,4-4,0 GB; Q8_0 ≈ 4,4-5,2 GB; f16 ≈ 8,2-9,5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más para cuantizaciones de 4 bits (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con 6 GB); 8-12 GB (RTX 3070, RTX 4070, RTX 3060 12 GB) para Q6_K y Q8_0 con contexto amplio; una A100 o H100 no aporta ventaja apreciable para un modelo de 4 B y sería un desperdicio de recursos.
- Compatibilidad con GPU de consumo: sí en todos los casos prácticos, desde una GTX 1650 de 4 GB con Q2_K hasta una RTX 4090 con f16 sin despeinarse.
- Inferencia en CPU: viable; con 8 GB de RAM se pueden usar cuantizaciones Q4 a Q6, y con 16 GB se llega a f16. Apropiado para Mac con Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI (estos dos últimos no consumen directamente los ficheros GGUF de este repositorio).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Project-Norn-V17-4.5B | 4,02 B | No disponible | Apache 2.0 | GGUF (este repo) y safetensors (base) | Sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (extensible con YaRN) | Apache 2.0 | Pesos y GGUF ampliamente disponibles | Métricas publicadas por el autor del modelo |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Pesos y GGUF ampliamente disponibles | Métricas publicadas por el autor del modelo |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Pesos y GGUF ampliamente disponibles | Métricas publicadas por el autor del modelo |

Nota: los datos de contexto y licencia de los tres modelos alternativos corresponden a sus especificaciones publicadas habitualmente y no han sido verificados en la búsqueda web de esta ficha (que no devolvió resultados relevantes). Para Project-Norn-V17 no existe ninguna métrica comparable, por lo que la comparación de rendimiento no puede establecerse.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin evaluaciones de terceros ni resultados reproducibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que las capacidades declaradas en los tags (matemáticas, código, agentes) se materialicen en la práctica.
- Documentación mínima: la model card del repositorio GGUF es la plantilla estándar de mradermacher; no hay detalles de arquitectura, datos de entrenamiento, hiperparámetros ni proceso de alineación.
- Tags no verificados: dual-system, CoT latente, memoria holográfica y atención Perceiver son afirmaciones del autor sin descripción técnica que las respalde.
- Riesgo de alucinación: en modelos de ~4 B sin alineación documentada, la tasa de invención de hechos y de errores en cálculos de varios pasos es típicamente alta; se recomienda validación externa en cualquier uso productivo.
- Limitación idiomática: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo ni estimar el consumo de caché KV.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S reducen notablemente la fidelidad; en tareas de razonamiento y código conviene usar Q5_K_M, Q6_K o Q8_0.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se hereda cualquier restricción aplicable al modelo base y a los componentes de terceros que este pudiera incorporar; conviene revisar el repositorio de Osakra/Project-Norn-V17-4.5B antes de un despliegue comercial.
- Fecha de publicación muy reciente (12 de septiembre de 2026) y actualización apenas 20 minutos posterior, lo que sugiere una subida sin revisión posterior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Project-Norn-V17-4.5B-GGUF
- Modelo base: https://huggingface.co/Osakra/Project-Norn-V17-4.5B
- Página de resumen y descargas de mradermacher: https://hf.tst.eu/model#Project-Norn-V17-4.5B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede infraestructura al cuantizador): https://www.nethype.de/

La búsqueda web realizada no devolvió ningún paper, blog técnico, repositorio de código ni demo asociados al modelo.
