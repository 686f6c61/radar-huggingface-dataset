# SaadatTRINO/finance-llm-gguf

## Resumen

`finance-llm-gguf` es una conversión a formato GGUF de 8 bits de un ajuste fino de Qwen2.5-1.5B-Instruct, publicado por el usuario SaadatTRINO. El modelo está entrenado específicamente para una tarea acotada: copiar cifras presupuestarias precalculadas dentro de respuestas en lenguaje natural. No se trata de un modelo financiero de propósito general, sino de un componente especializado dentro de un pipeline donde los números ya han sido calculados externamente.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) con capacidad conversacional. La conversión GGUF lo hace ejecutable en llama.cpp y compatible con endpoints de inferencia estándar, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre licencia, idiomas soportados ni resultados de evaluación, y no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un artefacto experimental o de uso interno más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta conversión) |
| Tipos de cuantizacion | 8 bits (GGUF, según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por ventanas deslizantes (sliding window attention) en algunas capas, normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2.5. Sin embargo, la model card no aporta detalles adicionales sobre la arquitectura más allá de la referencia al modelo base.

En cuanto al entrenamiento, la única información disponible indica que se trata de un ajuste fino sobre el dataset `SaadatTRINO/fintech`, orientado a "copiar cifras presupuestarias precalculadas en respuestas en lenguaje natural". No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Copia de cifras presupuestarias precalculadas dentro de respuestas en lenguaje natural (capacidad objetivo del ajuste fino).
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,5 mil millones de parámetros.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se confirma para este ajuste).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de resúmenes presupuestarios: el modelo puede recibir cifras ya calculadas por un sistema externo y redactar una explicación en lenguaje natural para informes financieros internos, aprovechando su entrenamiento específico en esta tarea.
- Asistencia en informes de gastos: integrado en un pipeline que calcule totales y desviaciones, el modelo redacta la narrativa del informe sin necesidad de realizar aritmética propia.
- Automatización de respuestas en portales financieros: para consultas donde los datos numéricos provienen de una base de datos y el modelo solo debe verbalizarlos, reduciendo el riesgo de alucinación numérica.
- Prototipado rápido en entornos con recursos limitados: al ser un GGUF de 1,5B en 8 bits, puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto.
- Generación de borradores de correos financieros: a partir de cifras precalculadas, el modelo produce texto introductorio o explicativo para comunicaciones internas.
- Educación financiera básica: explicación de conceptos presupuestarios sencillos en un entorno controlado, siempre que las cifras se inyecten externamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para los pesos en 8 bits, más overhead de contexto y KV cache (estimación típica de 2-3 GB en total para contextos moderados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (RTX 3050 en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación), y servidores compatibles con GGUF; la model card menciona compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| finance-llm-gguf (este) | 1,54B | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Ampliamente disponible |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |
| Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens | MIT | safetensors, GGUF | Ampliamente disponible |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos presentes en Qwen2.5-1.5B-Instruct.
- Riesgo de alucinación: elevado en cualquier tarea que requiera aritmética o conocimiento financiero no inyectado externamente; el ajuste fino está diseñado para copiar cifras, no para calcularlas.
- Limitaciones de contexto o idioma: no se especifican; el contexto efectivo de esta conversión no está confirmado.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier despliegue en producción.
- Caveats para producción: el repositorio no registra descargas ni validación externa; no hay benchmarks ni documentación de evaluación. El modelo debe considerarse experimental y no apto para decisiones financieras sin supervisión humana.

## Enlaces

- [Hugging Face: SaadatTRINO/finance-llm-gguf](https://huggingface.co/SaadatTRINO/finance-llm-gguf)
- [Dataset: SaadatTRINO/fintech](https://huggingface.co/datasets/SaadatTRINO/fintech)
- [Modelo base: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
