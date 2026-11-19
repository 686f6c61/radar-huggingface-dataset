# reaperdoesntknow/GPT-X2-125M-CIx-Long-Context

## Resumen

GPT-X2-125M-CIx-Long-Context es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face, derivado por ajuste fino del modelo base AxiomicLabs/GPT-X2-125M. Se trata de un modelo causal decoder-only de 126.006.398 parámetros (aproximadamente 125M) orientado a la generación de texto en inglés y a la experimentación con contexto largo y codificaciones posicionales alternativas. Su relevancia actual reside en que sirve como banco de pruebas abierto para estudiar técnicas de extensión de contexto (RoPE, YaRN y un mecanismo propietario denominado Symplectic Metric-RoPE Governor) y un optimizador heterogéneo llamado CIxOpt.

La arquitectura es un transformer compacto con 30 bloques, dimensión oculta de 576, atención con grouped-query attention (9 cabezas de consulta y 3 de clave/valor, head_dim de 64), MLP con SwiGLU, RMSNorm y embeddings de entrada y salida atados. La longitud máxima de posiciones configurada es de 32.768 tokens, con rope_theta de 100.000 y soporte opcional de escalado YaRN. El vocabulario es de 32.768 tokens y el modelo está entrenado únicamente en inglés.

El modelo se distribuye con licencia Apache 2.0 y requiere código personalizado (`trust_remote_code`) para cargarse en Transformers. No es un modelo de producción: el propio autor lo describe como un checkpoint experimental para investigación de arquitecturas, pruebas de optimizadores y ajuste fino continuado, y advierte de que no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia GPT-X2), con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 126.006.398 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB, con código personalizado de Transformers) |

Otros datos de configuración: vocab_size 32.768, hidden_size 576, num_hidden_layers 30, num_attention_heads 9, num_key_value_heads 3, head_dim 64, intermediate_size 1.536, rope_theta 100.000,0, rms_norm_eps 1e-6, tie_word_embeddings true.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 30 capas con atención de consultas agrupadas (GQA), donde 9 cabezas de consulta comparten 3 cabezas de clave/valor, lo que reduce el coste de memoria de la caché KV en generación. Emplea embeddings posicionales rotatorios (RoPE) con theta de 100.000 y soporte opcional de escalado tipo YaRN para extender el contexto efectivo más allá de la ventana nativa. Las capas MLP usan SwiGLU con dimensión intermedia de 1.536, y la normalización es RMSNorm con epsilon 1e-6. Los embeddings de entrada y la cabeza de salida están atados. El código incluye caché dinámica para generación, manejo de position IDs compatible con padding a la izquierda y una pérdida de modelado causal segura cuando las etiquetas están enmascaradas.

La innovación principal documentada es el Symplectic Metric-RoPE Governor, un mecanismo opcional que modula las frecuencias rotatorias mediante una capa de control en espacio de fases con estado de reloj global tipo Hamiltoniano y estado local por capa, módulos de proyección métrica y deltas de masa y espín. Las proyecciones del governor se inicializan a cero para que el comportamiento inicial sea idéntico al RoPE estándar antes de aprender desviaciones. El entrenamiento y la experimentación se diseñaron en torno a CIxOpt, un optimizador heterogéneo que enruta distintos tipos de parámetros a reglas de actualización diferentes: matrices de proyección grandes hacia actualizaciones estilo sign-momentum (Lion), parámetros de normalización sensibles hacia AdamW, superficies de embedding y lm-head hacia rutas compatibles con AdaMax, y parámetros del governor hacia una ruta adaptativa precisa. CIxOpt incluye además centralización de gradientes, weight decay desacoplado, filtrado de cautela para actualizaciones de signo, hooks de decay conscientes de activaciones y estado del optimizador en fp32 para seguridad con parámetros fp16/bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés: continuación de texto, completado de frases y generación libre con decodificación autoregresiva.
- Modelado de contexto largo: ventana configurada de hasta 32.768 tokens, con soporte opcional de escalado YaRN para experimentar con extensiones.
- Investigación de codificaciones posicionales: permite activar y estudiar el Symplectic Metric-RoPE Governor, con diagnósticos de reloj y términos de regularización opcionales.
- Experimentación con optimizadores: el código de CIxOpt permite probar enrutamiento heterogéneo de parámetros y comparar con líneas base entrenadas con AdamW.
- Ajuste fino continuado: el checkpoint está pensado para continuación de entrenamiento, ablaciones de arquitectura y experimentos de fine-tuning estilo instrucciones.
- Compatibilidad con Transformers: se carga mediante la librería transformers con código personalizado y admite caché dinámica para generación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación de extensión de contexto: usar el modelo para comparar RoPE estándar frente a YaRN y frente al governor simpléctico en tareas de recuperación de información a larga distancia dentro de la ventana de 32.768 tokens, midiendo degradación por posición.
- Pruebas de optimizadores en arquitecturas compactas: entrenar variantes del modelo con CIxOpt y con AdamW sobre el mismo corpus pequeño para estudiar estabilidad, curvas de pérdida y comportamiento por tipo de parámetro (proyecciones, normalizaciones, embeddings).
- Ablaciones de arquitectura: modificar num_key_value_heads, head_dim o intermediate_size y reentrenar desde cero o desde el checkpoint para medir el impacto de GQA y SwiGLU en un presupuesto de 125M de parámetros.
- Generación de texto local ligera: prototipos de autocompletado o generación de texto en inglés en entornos con recursos limitados, aprovechando que el modelo cabe en memoria de una GPU de consumo en fp16.
- Fine-tuning estilo instrucciones: adaptar el checkpoint a un dominio concreto (por ejemplo, descripciones técnicas o resúmenes) con un dataset pequeño y evaluar si el governor y CIxOpt facilitan la convergencia frente a un baseline.
- Estudio de caché KV y decodificación: analizar el ahorro de memoria de GQA (3 cabezas KV frente a 9 de consulta) en generación con contexto largo y medir throughput con caché dinámica.
- Material docente: usar el repositorio como ejemplo práctico de implementación de RoPE, GQA y RMSNorm en Transformers con código personalizado para cursos de arquitecturas de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de benchmarks aún no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 250-300 MB solo para pesos (126M parámetros × 2 bytes), más caché KV y activaciones; en la práctica, menos de 1 GB para contextos moderados.
- VRAM estimada con contexto completo de 32.768 tokens: la caché KV con 3 cabezas KV, head_dim 64 y 30 capas ocupa del orden de decenas de MB por secuencia, por lo que el modelo completo sigue cabiendo holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para lotes grandes o contextos máximos, se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al requerir código personalizado es probable que estos motores no lo soporten sin adaptaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPT-X2-125M-CIx-Long-Context | 126M | 32.768 | Apache 2.0 | Hugging Face, requiere código personalizado | Checkpoint experimental con governor simpléctico y CIxOpt |
| AxiomicLabs/GPT-X2-125M (base) | ~125M | no disponible | no disponible | Hugging Face | Modelo base del que deriva; sin las modificaciones de contexto largo |
| GPT-2 124M (OpenAI) | 124M | 1.024 | MIT | Hugging Face, ampliamente soportado | Referencia clásica de 125M; contexto mucho menor y sin GQA |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | Apache 2.0 | Hugging Face, soportado en vLLM y llama.cpp | Alternativa moderna de tamaño similar con mejor ecosistema de despliegue |

La comparación con GPT-2 y SmolLM-135M es orientativa por tamaño; no se dispone de métricas de rendimiento del modelo evaluado para comparar calidad.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor advierte que el modelo puede inventar hechos, fechas, citas y detalles técnicos; no debe usarse como fuente de verdad.
- Contexto largo no equivale a razonamiento largo: la ventana de 32.768 tokens no garantiza recuperación o razonamiento fiable a larga distancia.
- Comportamiento experimental: el Symplectic Metric-RoPE Governor y el entrenamiento con CIxOpt pueden producir comportamientos distintos a los de líneas base entrenadas con AdamW; no hay evaluaciones publicadas que validen su eficacia.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Sensibilidad al formato del prompt: el autor señala que el modelo puede ser sensible a la plantilla o formato de entrada.
- Seguridad no evaluada: no se han realizado evaluaciones completas de seguridad ni de sesgos; se desconoce el comportamiento en dominios sensibles.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos upstream podrían imponer restricciones adicionales; conviene verificar los términos de AxiomicLabs/GPT-X2-125M.
- Fuera de alcance: no debe usarse como única autoridad en decisiones médicas, legales, financieras, de emergencias, selección de personal, infraestructura crítica, vigilancia ni operaciones cibernéticas autónomas.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y complica el despliegue en motores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X2-125M
