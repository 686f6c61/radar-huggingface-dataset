# reaperdoesntknow/GPT-X2-125M-CIx-Long-Context

## Resumen

GPT-X2-125M-CIx-Long-Context es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face, derivado del modelo base AxiomicLabs/GPT-X2-125M mediante fine-tuning y adaptación de código. Se trata de un modelo causal decoder-only de 126 millones de parámetros (126.006.398 según safetensors) orientado a experimentación con contexto largo, codificaciones posicionales alternativas y optimizadores heterogéneos. Emplea una arquitectura GPT-X2 compacta con 30 bloques transformer, atención de consultas agrupadas (GQA) y SwiGLU, e incorpora código personalizado que debe cargarse con `trust_remote_code`.

Su relevancia actual reside en que sirve como banco de pruebas para dos innovaciones técnicas concretas: el llamado Symplectic Metric-RoPE Governor, un mecanismo experimental que modula las frecuencias rotacionales de RoPE mediante un estado de reloj hamiltoniano aprendido, y el optimizador CIxOpt, un esquema heterogéneo que enruta distintos tipos de parámetros hacia actualizaciones de estilo AdamW, Lion, AdaMax o ASGD. No es un modelo de producción: el propio autor lo describe como checkpoint de investigación para ablaciones arquitectónicas, estudios de RoPE/YaRN y experimentos de entrenamiento continuado.

El modelo declara 32.768 tokens de longitud de contexto máxima y un vocabulario de 32.768 entradas, con embeddings de entrada y salida atados. Solo soporta inglés según la model card, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-X2) con GQA, RoPE, RMSNorm y SwiGLU |
| Parámetros totales | 126.006.398 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (`max_position_embeddings: 32768`) |
| Tipos de cuantización | No disponible (el repo publica safetensors en el formato original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`transformers`, requiere `trust_remote_code`) |

Otros parámetros de configuración: `hidden_size: 576`, `num_hidden_layers: 30`, `num_attention_heads: 9`, `num_key_value_heads: 3`, `head_dim: 64`, `intermediate_size: 1536`, `rope_theta: 100000.0`, `rms_norm_eps: 1e-6`, `tie_word_embeddings: true`, `vocab_size: 32768`. Tamaño del repositorio: 1,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo GPT-X2 con 30 bloques, dimensión oculta de 576 y MLP SwiGLU con dimensión intermedia de 1536. La atención usa 9 cabezas de consulta y 3 cabezas clave/valor (GQA con ratio 3:1), con `head_dim` de 64. Emplea RMSNorm, embeddings de entrada y salida atados, caché dinámico para generación y manejo de position IDs compatible con padding a la izquierda. Soporta escalado RoPE de estilo YaRN de forma opcional.

La innovación principal del código es el Symplectic Metric-RoPE Governor, un módulo opcional que introduce un estado de reloj global de estilo hamiltoniano y relojes simplécticos locales por capa, junto con proyecciones métricas que generan deltas de masa y espín para modular las frecuencias rotacionales de RoPE. Las proyecciones del governor se inicializan a cero para que, al arrancar, el comportamiento sea idéntico al RoPE estándar y las desviaciones se aprendan durante el entrenamiento. Incluye reordenamiento seguro del estado de reloj para beam search, diagnósticos de reloj y términos de regularización opcionales (`clock_reg_coeff`, `clock_metric_reg_coeff`, `clock_state_reg_coeff`, `clock_smooth_reg_coeff`).

El entrenamiento se diseñó en torno a CIxOpt, un optimizador heterogéneo que enruta actualizaciones según el tipo de parámetro: matrices de proyección grandes hacia momentum de signo tipo Lion, parámetros de normalización y sensibles hacia AdamW, superficies de embedding y lm-head hacia enrutamiento compatible con AdaMax, y parámetros del governor hacia una ruta adaptativa precisa. Soporta vectorización `foreach`, centralización de gradientes, weight decay desacoplado, filtrado de cautela basado en discrepancia para actualizaciones de signo y estado del optimizador en fp32 para seguridad con parámetros fp16/bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés: continuación de texto, generación libre y modelado de lenguaje autorregresivo.
- Contexto largo declarado de hasta 32.768 tokens, con soporte opcional de escalado YaRN para extender la ventana efectiva.
- Atención con GQA que reduce el coste de memoria de la caché KV durante la generación.
- Soporte de caché dinámico para decodificación incremental.
- Capacidades experimentales de modulación posicional mediante Symplectic Metric-RoPE Governor (opcional, desactivado por defecto mediante inicialización identidad).
- Base para fine-tuning de estilo instrucción según los usos previstos declarados por el autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en codificaciones posicionales: el modelo permite activar el governor simpléctico y comparar el comportamiento frente a RoPE estándar en tareas de modelado de lenguaje con contexto largo, aislando el efecto de la modulación de frecuencias.
- Experimentos de contexto largo en hardware modesto: con 126 M de parámetros y 32.768 tokens de ventana, sirve para validar pipelines de evaluación de long-context (perplejidad por posición, recuperación de agujas en un pajar) sin requerir GPUs de gran capacidad.
- Pruebas del optimizador CIxOpt: el checkpoint y su código permiten reproducir el enrutamiento heterogéneo de actualizaciones y medir su efecto frente a AdamW en arquitecturas compactas.
- Ablaciones arquitectónicas: al ser un modelo pequeño con GQA, SwiGLU y RMSNorm, es adecuado para estudiar el impacto de ratios de cabezas KV, dimensiones ocultas o estrategias de atado de embeddings con coste computacional bajo.
- Entrenamiento continuado y fine-tuning de instrucciones: el autor lo plantea como base para experimentos de continuación de entrenamiento y ajuste estilo instrucción sobre un modelo ya preentrenado.
- Prototipos locales de generación de texto: por su tamaño, puede ejecutarse en una sola GPU consumer para demos de generación y pruebas de integración con `transformers` antes de escalar a modelos mayores.
- Estudio de dinámica de entrenamiento: los diagnósticos de reloj y los términos de regularización permiten instrumentar y analizar la evolución del estado interno durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de benchmarks aún no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,25 GB solo para pesos (126 M × 2 bytes), más caché KV y activaciones; en la práctica, menos de 1 GB para secuencias cortas.
- VRAM estimada con contexto completo de 32.768 tokens: la caché KV con 30 capas, 3 cabezas KV de dimensión 64 y fp16 ronda los 0,35 GB adicionales, por lo que el modelo completo cabe holgadamente por debajo de 2 GB en fp16.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja y en CPU para inferencia lenta.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2-4 GB de VRAM efectiva.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, ya que el modelo requiere código personalizado y no se publican pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPT-X2-125M-CIx-Long-Context | 126 M | 32.768 | Apache 2.0 | Hugging Face, requiere `trust_remote_code` | Governor simpléctico y CIxOpt experimentales |
| AxiomicLabs/GPT-X2-125M (base) | ~125 M | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva este checkpoint |
| Otros modelos de ~125 M (p. ej. variantes GPT-2 small) | ~124 M | 1.024 (GPT-2 small) | Varía según modelo | Hugging Face | No se dispone de comparación de rendimiento con este checkpoint |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte que el modelo puede inventar hechos, fechas, citas y detalles técnicos.
- El soporte de contexto largo no garantiza razonamiento preciso sobre rangos largos; la ventana de 32.768 tokens es una capacidad declarada, no una garantía de calidad.
- El comportamiento del Symplectic Metric-RoPE Governor es experimental y no ha sido validado de forma independiente.
- El entrenamiento con CIxOpt puede producir comportamientos distintos a los de líneas base entrenadas con AdamW.
- El comportamiento de seguridad no ha sido evaluado en profundidad.
- Sensibilidad al formato del prompt: el modelo puede degradarse con plantillas no vistas durante el entrenamiento.
- Solo inglés: no hay soporte multilingüe declarado.
- Uso fuera de alcance: el autor prohíbe explícitamente confiar en el modelo como única autoridad en contextos de alto riesgo (consejo médico, conclusiones legales, decisiones financieras, respuesta a emergencias, selección de personal, infraestructura crítica, vigilancia o ciberoperaciones autónomas).
- Licencia Apache 2.0, sujeta a posibles restricciones de los términos del modelo base o de los datasets upstream.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X2-125M
