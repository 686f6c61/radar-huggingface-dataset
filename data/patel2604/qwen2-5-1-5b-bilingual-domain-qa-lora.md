# Patel2604/qwen2.5-1.5b-bilingual-domain-qa-lora

## Resumen

El modelo `Patel2604/qwen2.5-1.5b-bilingual-domain-qa-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Lo publica el usuario Patel2604 en Hugging Face y está orientado a la ejecución de tareas de dominio específico (preguntas y respuestas sobre un dominio concreto, extracción estructurada de entidades y adherencia a esquemas) en entornos de alta concurrencia y baja latencia, como dispositivos de borde o servidores con una sola GPU.

El adaptador no modifica los pesos del modelo base: se distribuye como un conjunto de matrices de bajo rango (rank 16) que se cargan sobre Qwen2.5-1.5B-Instruct mediante la librería PEFT. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato safetensors con licencia Apache 2.0. Los idiomas declarados son inglés (en) e hindi (hi), lo que sitúa al modelo en un nicho bilingüe poco cubierto por adaptadores de dominio abiertos.

Su relevancia actual radica en el patrón de despliegue: un SLM de 1.500 millones de parámetros con un adaptador de dominio permite obtener respuestas estructuradas y verificables con un coste de VRAM muy bajo, a cambio de renunciar a la generalidad del modelo base. La model card, sin embargo, no publica métricas de evaluación (todas las celdas de la tabla aparecen como "TBD"), por lo que su rendimiento real en producción no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct) + adaptador LoRA PEFT |
| Parametros totales | 1.500 millones (modelo base); el adaptador LoRA añade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NormalFloat (NF4) con doble cuantizacion; el adaptador se distribuye en safetensors (precision no detallada) |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 1.500 millones de parámetros (Qwen2.5-1.5B-Instruct). El entrenamiento utiliza LoRA con rango r=16, factor de escala alpha=32 y dropout de 0,05, aplicado a todos los módulos lineales del modelo base (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El optimizador es `paged_adamw_8bit` con tasa de aprendizaje 2e-4 y schedule coseno, en precisión bfloat16/float16 con pesos cuantizados a NF4 de 4 bits y doble cuantización (QLoRA).

El entrenamiento emplea enmascaramiento de pérdida solo en la completación (los tokens del prompt quedan excluidos del cálculo del gradiente), lo que concentra el ajuste en las respuestas objetivo. La model card menciona que el modelo base puede ser Qwen2.5-1.5B-Instruct, Llama-3.2-1B-Instruct o Llama-3.2-3B-Instruct, aunque los metadatos del repositorio confirman Qwen2.5-1.5B-Instruct como base efectivo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones de decodificación o atención.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de dominio específico (domain QA).
- Extracción estructurada de entidades y adherencia a esquemas (schema adherence), según la model card.
- Generación de salidas en formato JSON válido, aunque sin métricas publicadas de validez.
- Soporte bilingüe inglés-hindi declarado en los metadatos y en la model card.
- Ejecución de tareas de alta concurrencia y baja latencia sobre hardware modesto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Extracción de entidades en pipelines documentales: el adaptador puede recibir texto de dominio y devolver entidades en un esquema fijo, aprovechando el enmascaramiento de pérdida solo en la completación que lo orienta a producir respuestas estructuradas.
- Preguntas y respuestas sobre una base de conocimiento interna: con grounding (RAG) sobre documentos de la organización, el adaptador responde consultas del dominio con un coste de inferencia muy bajo en una sola GPU.
- Validación de esquemas en tiempo real: al estar entrenado para adherencia a esquemas, puede insertarse como paso de normalización de salidas JSON en una API de ingesta de datos.
- Atención al cliente bilingüe inglés-hindi: el soporte declarado de ambos idiomas permite desplegar un asistente de dominio en mercados donde esa combinación es habitual, con latencia baja en hardware de borde.
- Despliegue en dispositivos de borde o servidores de una sola GPU: el tamaño del adaptador (0,1 GB) y la base de 1.500 millones de parámetros permiten servir el modelo en entornos con VRAM limitada.
- Clasificación y enrutamiento de consultas de dominio: el modelo puede etiquetar o categorizar consultas entrantes antes de derivarlas a sistemas especializados, con throughput alto por su reducido tamaño.
- Prototipado rápido de adaptadores de dominio: sirve como plantilla reproducible (hiperparámetros documentados) para equipos que quieran entrenar sus propios LoRA sobre Qwen2.5-1.5B-Instruct.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con las columnas Exact Match (%), Token F1, JSON Validity (%), p50 Latency (ms) y Peak VRAM (GB), pero todas las celdas del adaptador y de las configuraciones de referencia aparecen como "TBD". No se han publicado resultados de benchmarks en la informacion disponible.

| Configuracion | Exact Match (%) | Token F1 | JSON Validity (%) | p50 Latency (ms) | Peak VRAM (GB) |
|---|---|---|---|---|---|
| Base model (0-shot) | TBD | TBD | TBD | TBD | TBD |
| Base model (few-shot) | TBD | TBD | TBD | TBD | TBD |
| RAG baseline | TBD | TBD | TBD | TBD | TBD |
| SLM + QLoRA (adaptador) | TBD | TBD | TBD | TBD | TBD |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; la model card deja la columna de VRAM pico como "TBD". Como referencia, el modelo base de 1.500 millones de parámetros en fp16 requiere del orden de 3 GB solo para pesos, y en cuantización de 4 bits alrededor de 1 GB, antes de contar caché KV y overhead.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU de consumo con 8 GB o más de VRAM y para GPU de datacenter (A100, H100) cuando se busca throughput agregado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se cuantice el modelo base; el adaptador en sí ocupa unos 0,1 GB.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama si se fusiona y convierte el adaptador a GGUF. No se documenta compatibilidad verificada con ninguno de ellos.
- Latencia y throughput: no disponibles; la model card los deja como "TBD".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Patel2604/qwen2.5-1.5b-bilingual-domain-qa-lora | 1.500 M (base) + LoRA | No disponible | Sin metricas publicadas (TBD) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | No disponible en la informacion proporcionada | Benchmarks publicados por Qwen (no incluidos aqui) | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1.000 M | No disponible en la informacion proporcionada | Benchmarks publicados por Meta (no incluidos aqui) | Llama 3.2 Community License | Hugging Face |
| Llama-3.2-3B-Instruct | 3.000 M | No disponible en la informacion proporcionada | Benchmarks publicados por Meta (no incluidos aqui) | Llama 3.2 Community License | Hugging Face |

La comparación directa con los modelos base no es posible en términos de rendimiento porque el adaptador no publica métricas. La ventaja diferencial del adaptador es la especialización de dominio y el bajo coste de almacenamiento (0,1 GB); la desventaja es la ausencia de validación cuantitativa y su nula tracción (0 descargas, 0 likes).

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: la tabla de resultados de la model card está completamente en "TBD", por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Olvido catastrófico: la propia model card advierte de una posible degradación en benchmarks conversacionales fuera de dominio.
- Factualidad acotada: el autor indica que la factualidad queda restringida a los límites del dominio de entrenamiento; fuera de él el riesgo de alucinación aumenta.
- Uso fuera de alcance: la model card excluye explícitamente el chat libre fuera del dominio adaptado sin grounding.
- Idiomas limitados a inglés e hindi; no se declara soporte de castellano ni de otros idiomas.
- No se documenta el dataset de entrenamiento, su procedencia ni su filtrado, lo que impide evaluar sesgos y contaminación.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.
- Tracción nula en el repositorio (0 descargas, 0 likes) y fecha de creación muy reciente; no hay validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0, por lo que la combinación es compatible; conviene verificar los términos del modelo base en su propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/Patel2604/qwen2.5-1.5b-bilingual-domain-qa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
