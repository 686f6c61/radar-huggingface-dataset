# reaperdoesntknow/GPT-X2-125M-CIx-Long-Context

## Resumen

GPT-X2-125M-CIx-Long-Context es un checkpoint de investigación publicado por el usuario reaperdoesntknow en Hugging Face, derivado del modelo base AxiomicLabs/GPT-X2-125M. Se trata de un modelo causal de solo decodificador (decoder-only) de 126.006.398 parámetros, orientado a experimentación con contexto largo, codificaciones posicionales alternativas y optimizadores heterogéneos. Su relevancia actual radica en que expone, junto con los pesos, una implementación compatible con Transformers que incluye mecanismos poco habituales como el denominado Symplectic Metric-RoPE Governor y el optimizador CIxOpt.

El modelo emplea una arquitectura GPT-X2 compacta con 30 bloques transformer, tamaño oculto de 576, atención con consultas agrupadas (GQA) de 9 cabezas de consulta y 3 de clave/valor, MLP con SwiGLU, RMSNorm y embeddings de entrada y salida atados. La ventana de contexto declarada es de 32.768 tokens, con soporte opcional de escalado YaRN sobre RoPE.

No es un modelo de producción: el autor lo describe explícitamente como un checkpoint experimental para estudiar comportamiento de optimizadores, codificaciones posicionales y generación de texto compacta en contexto largo. No se han publicado resultados de benchmarks y el propio autor advierte de que el comportamiento de seguridad no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-X2, con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 126.006.398 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (max_position_embeddings); soporte opcional de escalado YaRN |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el material consultado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de solo decodificador con 30 capas, hidden size de 576, 9 cabezas de atención de consulta y 3 cabezas de clave/valor (GQA), dimensión de cabeza 64, tamaño intermedio de 1536 y vocabulario de 32.768 tokens. Usa RMSNorm con epsilon 1e-6, capas MLP con SwiGLU, embeddings de entrada y salida atados, RoPE con theta 100.000 y caché dinámica para generación. El código incluye manejo de position IDs compatible con left-padding y un comportamiento seguro de la pérdida cuando las etiquetas están enmascaradas.

El checkpoint incorpora un mecanismo experimental llamado Symplectic Metric-RoPE Governor, que modula las frecuencias rotatorias mediante un estado de reloj global tipo hamiltoniano y estados de reloj locales por capa, con módulos de proyección métrica y deltas de masa y espín. Las proyecciones del governor se inicializan a cero para que el modelo arranque con el comportamiento RoPE estándar y aprenda desviaciones a partir de ahí. El entrenamiento se diseñó en torno a CIxOpt, un optimizador heterogéneo que enruta distintos tipos de parámetros (matrices de proyección grandes, parámetros de normalización, embeddings y módulos del governor) a reglas de actualización distintas: momento de signo estilo Lion, AdamW, AdaMax y ASGD, con centralización de gradientes, weight decay desacoplado y estado del optimizador en fp32. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto causal en inglés con ventana de contexto de hasta 32.768 tokens.
- Modelado de lenguaje de continuación y fine-tuning instruccional (el autor lo contempla como caso de uso).
- Soporte de atención con consultas agrupadas (GQA) para reducir el coste de memoria de la caché KV.
- Codificación posicional RoPE con soporte opcional de escalado YaRN para extender contexto.
- Mecanismo experimental de modulación de frecuencias rotatorias (Symplectic Metric-RoPE Governor) con diagnósticos de reloj y regularización opcional.
- Compatibilidad con beam search, incluyendo reordenación segura del estado de reloj.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Investigación en codificaciones posicionales: el checkpoint permite activar y desactivar el Symplectic Metric-RoPE Governor y comparar su efecto frente a RoPE estándar y YaRN en tareas de contexto largo.
- Estudio de optimizadores heterogéneos: sirve para analizar cómo el enrutamiento de CIxOpt (Lion, AdamW, AdaMax, ASGD) afecta a la convergencia en arquitecturas compactas, con registro de parámetros por nombre.
- Ablaciones de arquitectura: al ser un modelo de 126 M de parámetros con 30 capas, permite iterar experimentos de arquitectura con coste computacional bajo en una sola GPU.
- Prototipos ligeros de generación de texto en local: adecuado para pruebas de concepto de generación en inglés donde no se requiera precisión factual verificada.
- Fine-tuning instruccional experimental: el autor lo contempla como base para experimentos de ajuste con instrucciones y entrenamiento de continuación.
- Evaluación de comportamiento en contexto largo: útil para medir la degradación del razonamiento a larga distancia y contrastar la hipótesis de que una ventana grande no garantiza razonamiento de largo alcance preciso.
- Docencia y reproducción de experimentos: el repositorio incluye utilidades de entrenamiento y una implementación compatible con Transformers, lo que facilita reproducir configuraciones en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que los resultados de benchmarks aún no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 126 M de parámetros, los pesos en fp32 ocupan aproximadamente 504 MB, en fp16/bf16 unos 252 MB y en cuantización de 8 bits alrededor de 126 MB; la caché KV para 32.768 tokens con 3 cabezas KV de dimensión 64 y 30 capas es el componente dominante en memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para los pesos; una RTX 4090, RTX 3090 o superior permite trabajar con contextos largos completos con holgura. Para entrenamiento y experimentación con el governor, se recomienda A100 o H100 por memoria y ancho de banda.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más para inferencia en fp16; para contextos de 32.768 tokens conviene disponer de 16 GB o más.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía soportada, dado que el modelo requiere código personalizado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GPT-X2-125M-CIx-Long-Context | 126 M | 32.768 | Apache 2.0 | Checkpoint experimental con governor RoPE y CIxOpt; requiere custom code |
| AxiomicLabs/GPT-X2-125M (base) | 125 M (aproximado) | no disponible | no disponible | Modelo upstream del que deriva este checkpoint |
| Modelos compactos tipo GPT-2 small | 124 M | 1.024 | MIT (GPT-2) | Referencia clásica de tamaño similar, sin contexto largo ni GQA |

La comparación con alternativas comerciales o de mayor tamaño no procede por diferencia de escala y propósito. No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Puede alucinar hechos, fechas, citas y detalles técnicos; el autor lo advierte de forma explícita.
- Hereda las limitaciones del modelo base AxiomicLabs/GPT-X2-125M.
- Es sensible al formato del prompt.
- El soporte de contexto largo no garantiza razonamiento preciso a larga distancia.
- El comportamiento del Symplectic Metric-RoPE Governor es experimental y su inicialización está diseñada para reproducir RoPE estándar, pero no hay evaluación publicada de su eficacia.
- El entrenamiento con CIxOpt puede producir comportamientos distintos a los de líneas base entrenadas con AdamW.
- El comportamiento de seguridad no ha sido evaluado.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a los términos del modelo y datasets upstream.
- No debe usarse como única autoridad en contextos de alto riesgo: medicina, legal, finanzas, emergencias, selección de personal, infraestructura crítica, vigilancia u operaciones autónomas de ciberseguridad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar la implementación antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X2-125M
