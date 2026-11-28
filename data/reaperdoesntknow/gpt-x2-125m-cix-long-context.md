# reaperdoesntknow/GPT-X2-125M-CIx-Long-Context

## Resumen

GPT-X2-125M-CIx-Long-Context es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face, derivado por ajuste fino del modelo base AxiomicLabs/GPT-X2-125M. Se trata de un modelo causal decoder-only de 126.006.398 parámetros (unos 125M) orientado a la generación de texto en inglés, con una arquitectura compacta de 30 bloques transformer, 576 dimensiones ocultas y atención con grouped-query attention (9 cabezas de consulta, 3 de clave/valor).

Su relevancia no reside en el rendimiento bruto, sino en su carácter experimental: el repositorio incluye código personalizado para un mecanismo denominado Symplectic Metric-RoPE Governor, que modula las frecuencias de las rotary position embeddings mediante un estado de "reloj" Hamiltoniano aprendido, así como el optimizador CIxOpt, un optimizador heterogéneo que enruta distintos tipos de parámetros hacia reglas de actualización diferentes (AdamW, Lion, AdaMax, ASGD). El modelo declara un contexto máximo de 32.768 tokens mediante `max_position_embeddings` y soporte opcional de escalado YaRN.

El checkpoint está pensado como banco de pruebas para estudios de codificación posicional, ablaciones de arquitectura y experimentos de ajuste fino con contexto largo, no como modelo de producción. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El autor advierte explícitamente de que no se han publicado resultados de benchmarks y de que el comportamiento de seguridad no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-X2, con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 126.006.398 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (`max_position_embeddings: 32768`) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `trust_remote_code` requerido por código personalizado) |

Otros datos técnicos relevantes: `vocab_size` 32.768, `hidden_size` 576, 30 capas, 9 cabezas de atención, 3 cabezas KV, `head_dim` 64, `intermediate_size` 1536, `rope_theta` 100000.0, `rms_norm_eps` 1e-6 y embeddings de entrada y salida atados (`tie_word_embeddings: true`). Tamaño del repositorio: 1,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only compacto de 30 bloques con 576 dimensiones ocultas. Emplea grouped-query attention con 9 cabezas de consulta y 3 de clave/valor (ratio 3:1), RMSNorm como normalización, capas MLP con activación SwiGLU y embeddings atados entre entrada y salida. Las posiciones se codifican con rotary position embeddings (RoPE) con `rope_theta` de 100000.0 y soporte opcional de escalado estilo YaRN. El código incluye manejo de position IDs compatible con left-padding y una pérdida de language modeling segura cuando las etiquetas están enmascaradas, además de soporte de caché dinámica para generación.

La innovación principal es el Symplectic Metric-RoPE Governor, un mecanismo opcional que introduce un estado de reloj global de estilo Hamiltoniano y un reloj simpléctico local por capa, junto con módulos de proyección métrica y deltas de masa y espín que modulan las frecuencias rotatorias. Las proyecciones del governor se inicializan a cero para que el modelo arranque con comportamiento RoPE estándar y aprenda desviaciones a partir de ahí. El entrenamiento se diseñó en torno a CIxOpt, un optimizador heterogéneo que enruta matrices de proyección grandes hacia actualizaciones tipo sign-momentum (Lion), parámetros de normalización sensibles hacia AdamW, superficies de embedding y lm-head hacia AdaMax, y parámetros del governor hacia una ruta adaptativa precisa. CIxOpt incluye además centralización de gradiente, weight decay desacoplado, filtrado de cautela para actualizaciones de signo y estado del optimizador en fp32 para seguridad con parámetros fp16/bf16.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés: continuación de texto, completado y generación libre con ventana de hasta 32.768 tokens.
- Modelado de lenguaje de contexto largo: el checkpoint está específicamente adaptado para experimentos de generación con contexto extendido.
- Codificación posicional configurable: soporte de RoPE estándar, escalado YaRN y, opcionalmente, el governor Symplectic Metric-RoPE con diagnósticos de reloj.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño de 125M hace poco probable un rendimiento fiable en estas tareas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.
- Ajuste fino posterior: el repositorio incluye utilidades de entrenamiento y está pensado para continuación de entrenamiento y ablaciones de arquitectura.
- Compatibilidad con Hugging Face Transformers mediante código personalizado (`trust_remote_code`).

## Casos de uso

- Investigación en codificación posicional: el modelo permite comparar RoPE estándar, escalado YaRN y el governor Symplectic Metric-RoPE sobre la misma arquitectura base, aislando el efecto de cada mecanismo en tareas de modelado de lenguaje.
- Experimentos de contexto largo en hardware modesto: con 125M de parámetros y 32.768 tokens de ventana, sirve para estudiar degradación de atención y perplejidad a distintas distancias sin necesidad de GPUs de datacenter.
- Pruebas del optimizador CIxOpt: el checkpoint y su código permiten reproducir el enrutamiento heterogéneo de parámetros y comparar su comportamiento frente a AdamW en arquitecturas compactas.
- Ablaciones de arquitectura: al ser un modelo pequeño con configuración documentada, es adecuado para estudiar el impacto de GQA, SwiGLU, RMSNorm o embeddings atados en un presupuesto de cómputo reducido.
- Prototipos locales de generación de texto: puede ejecutarse en una sola GPU consumer para demos de completado de texto en inglés, siempre con revisión humana de las salidas.
- Ajuste fino con instrucciones a pequeña escala: sirve como base para experimentos de instruction tuning y evaluación de técnicas de alineación en modelos compactos.
- Docencia y formación: útil para ilustrar en clase cómo se implementa un transformer causal con RoPE y GQA desde cero, dado que el código es autocontenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de benchmarks aún no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 126M de parámetros ocupan aproximadamente 0,5 GB; en fp16/bf16, unos 0,25 GB. Con overhead de activaciones y caché KV para contexto largo, el consumo real es mayor, pero sigue siendo muy bajo.
- Caché KV: con 30 capas, 3 cabezas KV y `head_dim` 64, la caché por token es de 30 × 3 × 64 × 2 (clave y valor) × 2 bytes en fp16 ≈ 23 KB por token; a 32.768 tokens supone del orden de 0,75 GB adicionales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite contexto completo con holgura. Para entrenamiento y experimentos con el governor, se recomienda una RTX 4090 o una A100/H100 si se paraleliza.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM para inferencia en fp16.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la presencia de código personalizado complica su integración en estos motores sin portar la implementación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GPT-X2-125M-CIx-Long-Context | 126M | 32.768 | Inglés | Apache 2.0 | Checkpoint experimental con governor RoPE y CIxOpt; requiere código personalizado |
| AxiomicLabs/GPT-X2-125M (modelo base) | ~125M | no disponible | Inglés | Apache 2.0 (según upstream) | Punto de partida del ajuste fino; sin las modificaciones experimentales |
| GPT-2 small (referencia de la categoría) | 124M | 1.024 | Inglés | MIT | Arquitectura clásica sin GQA ni RoPE; contexto mucho menor |
| Modelos de 125M tipo Pythia/TinyLlama-style | 70M–1.100M | variable | Inglés | variable | Alternativas habituales para investigación en modelos compactos; datos de comparación no disponibles en esta ficha |

La comparación de rendimiento con estas alternativas no puede establecerse porque el autor no ha publicado benchmarks. La ventaja diferencial del modelo frente a la base es la ventana de contexto declarada de 32.768 tokens y las herramientas de investigación incluidas.

## Limitaciones y advertencias

- Riesgo de alucinación: la model card advierte de que puede inventar hechos, fechas, citas y detalles técnicos.
- Sesgos: no se documenta ninguna evaluación de sesgos; al derivar de un modelo base de 125M entrenado presumiblemente con datos web en inglés, es esperable que herede sesgos de ese corpus.
- Contexto largo no equivale a razonamiento largo: el soporte de 32.768 tokens no garantiza recuperación fiable de información a larga distancia.
- Comportamiento experimental: el governor Symplectic Metric-RoPE y el entrenamiento con CIxOpt pueden producir comportamientos distintos a los de una línea base entrenada con AdamW.
- Seguridad no evaluada: no se ha realizado una evaluación de seguridad del modelo.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor condiciona a los términos del modelo y datasets upstream; conviene verificar la licencia de AxiomicLabs/GPT-X2-125M antes de un despliegue comercial.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; audítese antes de usarlo en producción.
- Uso fuera de alcance: no debe emplearse como autoridad única en decisiones médicas, legales, financieras, de emergencias, selección de personal, infraestructura crítica, vigilancia o ciberseguridad autónoma.
- Sin benchmarks: no hay evidencia publicada de calidad que respalde afirmaciones de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X2-125M
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
