# inferenceport-ai/ipac-1.7b-exp-v1

## Resumen

IPAC-1.7B-Exp-v1 (InferencePort AutoComplete 1.7B Exp v1) es un modelo de lenguaje de 1.728.801.536 parámetros desarrollado por InferencePort AI como un ajuste fino experimental sobre LiquidAI/LFM3-1.7B. Su propósito es la autocompletación de texto de baja latencia y la continuación de siguiente token, es decir, generar sugerencias inline tipo "ghost text" a partir de un prefijo de texto sin plantilla conversacional. Se trata de un checkpoint interno de investigación (`exp-v1`) pensado para validar la adaptación a autocompletado antes de entrenamientos a mayor escala, no para producción.

El modelo hereda la arquitectura híbrida convolución/atención de LFM3, con capas personalizadas (`modeling_lfm3.py`, `lfm3_conv.py`) que requieren `trust_remote_code=True` en transformers. Con ~1,7B parámetros en BF16 y un repositorio de 3,5 GB, está orientado a despliegues en hardware de gama media, incluyendo GPUs de consumo, para tareas de completado de código y texto con latencia muy baja.

Su relevancia actual es limitada pero concreta: demuestra una mejora modesta pero medible sobre el modelo base en métricas de autocompletado (perplejidad de 11,306 a 10,886, es decir, un -3,71%), lo que lo convierte en una referencia útil para quienes investigan adaptaciones de modelos compactos a tareas de continuación de prefijo. La licencia es no comercial, lo que restringe severamente su uso en productos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida convolución/atención (LFM3, `lfm3`) |
| Parámetros totales | 1.728.801.536 (~1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Otra: IPAC-NC-1.7-1.0 (no comercial) + LFM Open License v1.0 |
| Formato de pesos | Safetensors (BF16, pesos fusionados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura híbrida de LFM3-1.7B de Liquid AI, que combina capas convolucionales con capas de atención en un diseño de transformer híbrido. La implementación incluye módulos personalizados (`modeling_lfm3.py` y `lfm3_conv.py`) que obligan a cargar el modelo con `trust_remote_code=True`. Los pesos se distribuyen como safetensors en BF16 con las capas fusionadas (merged weights).

El entrenamiento consistió en un ajuste fino del checkpoint base LFM3-1.7B para la tarea de continuación de prefijo y autocompletado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que se trata de una línea base de investigación interna (`exp-v1`) previa a entrenamientos a mayor escala, y que el modelo está entrenado para continuación de texto en bruto, no para diálogo multi-turno.

## Capacidades

- Generación de texto por continuación de prefijo (next-token continuation) orientada a autocompletado inline.
- Completado de código y texto técnico a partir de un prefijo sin formato conversacional.
- Generación determinista mediante decodificación greedy (`do_sample=False`), recomendada para sugerencias tipo ghost text.
- Producción de ráfagas cortas de 8 a 24 tokens por interacción, con parada configurable en salto de línea o puntuación final.
- No soporta tool calling ni function calling según la información disponible.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Autocompletado en editores de código: el modelo recibe el prefijo del fichero y devuelve una continuación corta de 8 a 24 tokens, integrable en un plugin de IDE que muestre sugerencias inline aceptables por el usuario.
- Ghost text en editores de texto y documentación: continuación de frases en herramientas de escritura, con decodificación greedy para evitar variabilidad entre pulsaciones.
- Prototipado de asistentes de escritura en investigación: banco de pruebas para medir latencia y calidad de sugerencias antes de invertir en modelos mayores.
- Completado de comandos y configuración: continuación de fragmentos como directivas de configuración, flags de CLI o entradas de ficheros YAML, dado el ejemplo de la model card sobre endpoints S3.
- Evaluación comparativa de técnicas de ajuste fino: referencia para estudiar el impacto de adaptaciones específicas sobre un modelo base compacto, usando las métricas de perplejidad y precisión top-1/top-5.
- Despliegue en entornos de borde para demostraciones: al ser un modelo de ~1,7B en BF16, cabe en GPUs de consumo para prototipos offline de autocompletado sin conexión.
- Investigación educativa sobre arquitecturas híbridas: estudio práctico de las capas convolucionales/atención de LFM3 y de su comportamiento en tareas de continuación.

## Benchmarks y rendimiento

Evaluación interna del autor contra el checkpoint base LFM3-1.7B sobre su split de validación de autocompletado:

| Métrica | LFM3-1.7B (base) | IPAC-1.7B-Exp-v1 | Delta |
|---|---|---|---|
| Perplejidad (↓) | 11,306 | 10,886 | -3,71% |
| Precisión top-1 (↑) | 48,57% | 48,91% | +0,34% |
| Precisión top-5 (↑) | 73,37% | 73,79% | +0,42% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; tarjetas profesionales como A100 o H100 no son necesarias para este tamaño, pero permiten mayor throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs con 8 GB si se reduce el batch.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, y la naturaleza de capas personalizadas puede complicar su conversión a GGUF.
- Latencia y throughput: no disponibles. El diseño apunta a ráfagas de 8 a 24 tokens por pulsación con decodificación greedy, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IPAC-1.7B-Exp-v1 | ~1,7B | No disponible | Autocompletado (fine-tune) | No comercial (IPAC-NC + LFM Open License) | Hugging Face |
| LiquidAI/LFM3-1.7B | ~1,7B | No disponible | Modelo base híbrido | LFM Open License v1.0 | Hugging Face |
| Modelos de autocompletado tipo CodeGemma-2B | ~2B | No disponible en esta ficha | Autocompletado de código | Sujeta a su licencia | Hugging Face |

La comparación con alternativas de autocompletado de tamaño similar no puede completarse con datos verificados en la información proporcionada; los datos de contexto y benchmarks de los competidores figuran como no disponibles.

## Limitaciones y advertencias

- Checkpoint experimental (`exp-v1`): el propio autor lo desaconseja para SLAs de producción.
- No es un asistente conversacional: no debe usarse para instrucciones, razonamiento ni preguntas y respuestas.
- Riesgo de alucinación: como todo modelo compacto, puede generar contenido factualmente incorrecto; debe mostrarse solo como sugerencia aceptable por el usuario.
- Idiomas: únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia restrictiva: la IPAC-NC-1.7-1.0 prohíbe usos comerciales, incluidos API alojadas, integración en productos SaaS o flujos de negocio que generen ingresos, sin acuerdo escrito con InferencePort AI.
- Obligaciones de atribución: cualquier redistribución debe conservar el addendum y la LFM Open License v1.0, y atribuir a InferencePort AI y Liquid AI.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisarlo antes de usar en entornos sensibles.
- Longitud de contexto no documentada: limita el diseño de integraciones que dependan de prefijos largos.
- Sin datos de cuantización publicados: no se confirma la disponibilidad de versiones GGUF o AWQ para despliegue en CPU o GPUs de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inferenceport-ai/ipac-1.7b-exp-v1
- Plataforma del autor: https://inferenceport.ai
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
