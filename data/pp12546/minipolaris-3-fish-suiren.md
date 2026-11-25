# PP12546/MiniPolaris-3-Fish-Suiren

## Resumen

MiniPolaris-3-Fish-Suiren es un modelo de lenguaje de 230,46 millones de parámetros publicado por el usuario PP12546 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base MiniMind-3, orientado a dotar a un modelo de tamaño muy reducido de capacidad de llamada a funciones (function calling) y enrutamiento de herramientas dentro de un conjunto cerrado de tres utilidades: cálculo matemático, consulta de hora y búsqueda web.

El interés del modelo reside en su enfoque metodológico: el autor intenta demostrar que es posible adquirir capacidad de tool calling mediante SFT puro, sin recurso a aprendizaje por refuerzo (RL), empleando únicamente 1000 muestras sintéticas en formato JSONL. El entrenamiento se realizó con Unsloth sobre una GPU de consumo Intel Arc B580 de 12 GB, lo que lo convierte en un caso práctico de ajuste fino de bajo coste.

Es un modelo experimental, no un modelo de propósito general: su ventana de contexto es de 1024 tokens, su licencia es MIT y su relevancia actual es acotada, limitada a entornos de investigación sobre agentes ligeros y a despliegues en hardware muy restringido donde un modelo mayor no es viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniMind-3) |
| Parametros totales | 230.462.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en 16-bit, merged model) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (merged model en 16-bit) |

## Arquitectura y entrenamiento

El modelo parte de MiniMind-3, un transformer decoder-only de aproximadamente 220M parámetros, y se ajusta mediante SFT de parámetros completos con la librería Unsloth. No se documenta en la información disponible la composición del corpus de preentrenamiento del modelo base, ni el número de tokens empleados, ni si hubo fases de RLHF o DPO previas.

El ajuste fino se realizó sobre unas 1000 muestras sintéticas de conversación multi-turno en formato JSONL, que incluyen tanto ejemplos positivos como negativos: respuesta directa sin herramienta, llamada a una única herramienta, solicitud de aclaración por parámetros ausentes, rechazo de peticiones fuera de alcance y recuperación ante errores. Los hiperparámetros documentados son 2 épocas (100 pasos), batch size 4 con acumulación de gradiente de 12, learning rate 2e-5 con scheduler coseno y 8 pasos de warmup, optimizador Paged AdamW de 32 bits y máscara de pérdida aplicada únicamente a las respuestas del asistente, incluido el bloque `<tool_call>`. El entrenamiento se ejecutó en una Intel Arc B580 de 12 GB y la pérdida convergió a 1,62 en entrenamiento y aproximadamente 1,66 en evaluación, sin señales de sobreajuste según el autor. Una innovación destacable es el denominado "short thinking": cerca del 20 % de las muestras incluyen una frase breve de razonamiento antes de emitir el JSON de llamada, lo que ayuda al modelo a confirmar el enrutamiento antes de generar la estructura.

## Capacidades

- Generación de texto conversacional en chino e inglés dentro de un contexto de 1024 tokens.
- Llamada a funciones (function calling) con salida en formato `<tool_call>` y JSON estructurado.
- Enrutamiento sobre un conjunto cerrado de tres herramientas: `calculate_math`, `get_current_time` y `search_web`.
- Extracción de parámetros a partir del enunciado del usuario (expresión matemática, zona horaria en formato IANA, consulta de búsqueda).
- Modo de pensamiento corto: emisión opcional de una frase de razonamiento antes de la llamada a herramienta.
- Respuesta directa sin invocación de herramienta ante preguntas de conversación general o conocimiento común.
- Solicitud de aclaración cuando faltan parámetros obligatorios.
- Rechazo explícito de peticiones con herramientas no definidas, sin generar llamadas ficticias.
- Recuperación ante errores en el flujo de conversación.
- No dispone de capacidades de visión, audio ni razonamiento matemático simbólico propio (delega en la herramienta de cálculo).

## Casos de uso

- Enrutador de intenciones en asistentes ligeros: el modelo clasifica la petición del usuario y decide si responde directamente o emite una llamada a herramienta, con un coste computacional mínimo apto para entornos embebidos.
- Demostración educativa de tool calling sin RL: sirve como caso de estudio reproducible para investigadores que quieran replicar la adquisición de function calling mediante SFT con datos sintéticos y presupuesto reducido.
- Prototipado rápido de agentes en hardware de consumo: al ocupar menos de 0,5 GB en pesos de 16 bits, puede ejecutarse en portátiles y GPUs de gama baja para validar flujos de agente antes de migrar a modelos mayores.
- Pasarela de cálculo y consulta temporal: integrado en un backend que exponga las tres herramientas, resuelve peticiones de aritmética y hora en zonas IANA delegando la ejecución real en servicios externos.
- Filtro de alcance en sistemas de atención al cliente: su capacidad de rechazo ante herramientas no definidas permite descartar peticiones fuera de catálogo sin inventar acciones, útil como primera capa de triaje.
- Generación de datos de entrenamiento para enrutadores mayores: las trazas de decisión y los JSON de llamada producidos pueden servir como semilla o comparativa en la construcción de datasets de function calling.
- Pruebas de regresión de pipelines de agentes: su comportamiento determinista con temperatura baja (0,1 en el ejemplo de la model card) lo hace adecuado como componente de test en CI para validar el contrato de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en pesos de 16 bits (230M parámetros), más el overhead de activaciones y caché KV, que con 1024 tokens de contexto es reducido; una estimación práctica sitúa el total por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en una Intel Arc B580 de 12 GB, y una RTX 3060, RTX 4060 o superior no presentan ninguna dificultad.
- Cabe holgadamente en GPUs de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers (vía `AutoModelForCausalLM`), text-generation-inference según los tags del repositorio, y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniPolaris-3-Fish-Suiren | 230M | 1024 | Sí, conjunto cerrado de 3 herramientas | MIT | Hugging Face |
| MiniMind-3 (base) | ~220M | no disponible | No específico | no disponible | Hugging Face |
| Qwen3 pequeños (0.6B) | 0,6B | no disponible en la información | Sí, general | no disponible en la información | Hugging Face |

La comparación con alternativas de la misma categoría es limitada porque la información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de los modelos de referencia. Frente a su base MiniMind-3, la diferencia principal es la especialización en enrutamiento de herramientas; frente a modelos de la familia Qwen3 de menor tamaño, la ventaja es el reducido número de parámetros y la licencia MIT, a costa de un contexto mucho menor y un conjunto de herramientas no generalizable.

## Limitaciones y advertencias

- Capacidad muy limitada: con 230M parámetros, la precisión de enrutamiento cae de forma notable ante lenguaje muy coloquial, lógica anidada o preguntas metafóricas, según reconoce el propio autor.
- Herramientas cerradas: no generaliza a herramientas nuevas definidas en el prompt en modo zero-shot; cambiar el conjunto de herramientas exige reentrenar con datos específicos.
- Ventana de contexto de solo 1024 tokens, insuficiente para conversaciones largas o prompts de sistema extensos con muchas definiciones de herramientas.
- Entrenamiento con solo 1000 muestras sintéticas y 2 épocas: riesgo elevado de sobreajuste al formato y de baja cobertura de casos reales.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación en la generación de parámetros JSON y en la selección de herramienta cuando la petición es ambigua.
- No apto como modelo de propósito general: no debe usarse para generación de código, matemáticas complejas ni razonamiento profundo.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El repositorio tiene 0 likes y 284 descargas, sin validación externa de la comunidad; conviene tratar los resultados como preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PP12546/MiniPolaris-3-Fish-Suiren
- Dataset sintético de referencia citado por el autor: MiniPolaris-DSWebchat-Synthetic (en el perfil de PP12546 en Hugging Face)
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- MiniMind (proyecto del modelo base): https://github.com/jingyaogong/minimind
