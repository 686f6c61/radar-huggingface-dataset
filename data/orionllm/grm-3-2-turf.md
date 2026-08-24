# OrionLLM/GRM-3.2-Turf

## Resumen

GRM-3.2-Turf es un modelo de lenguaje ligero desarrollado por OrionLLM, diseñado específicamente para razonamiento complejo y conversación general en entornos con recursos limitados. Se basa en el modelo LiquidAI/LFM2.5-1.2B-Thinking, del que es un fine-tuning, y está orientado a ejecución local en dispositivos de baja potencia como móviles, sistemas embebidos y equipos con poca memoria. Con 1.170 millones de parámetros y una arquitectura LFM2, ofrece un equilibrio entre eficiencia y capacidad de razonamiento estructurado.

El modelo destaca por su capacidad de seguir instrucciones complejas, su robustez en tool calling y su bajo consumo de recursos, lo que lo convierte en una opción práctica para despliegues en edge computing. Según datos de terceros, soporta una ventana de contexto de 125.000 tokens, aunque este dato no está confirmado oficialmente en la documentación del autor. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer con atención por grupos de consultas, GQA) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 125.000 tokens (según LLM Explorer; no confirmado oficialmente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GRM-3.2-Turf emplea la arquitectura LFM2, un diseño de transformer con 16 capas, tamaño oculto de 2.048 y atención por grupos de consultas (GQA) con 32 cabezas de consulta y 8 cabezas de clave/valor. Esta configuración reduce el coste de memoria y acelera la inferencia en comparación con la atención multi-cabeza estándar, lo que resulta adecuado para entornos con restricciones de hardware.

El modelo es un fine-tuning de LiquidAI/LFM2.5-1.2B-Thinking, un modelo base de 1,2B parámetros. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que supone una mejora sustancial sobre su predecesor GRM-2.6-Air-Opus en razonamiento estructurado, resolución de problemas y conversación general, pero no se especifican los métodos de ajuste empleados.

## Capacidades

- Generación de texto y conversación multi-turno con razonamiento estructurado.
- Seguimiento de instrucciones de alta fidelidad, incluyendo prompts restringidos y formatos de respuesta precisos (puntuación IFEval de 91,2).
- Tool calling y ejecución de funciones, lo que permite flujos de trabajo agénticos en entornos ligeros.
- Razonamiento científico y multidisciplinar, con resultados notables en GPQA Diamond (42,4) y MMLU-Pro (56,2).
- Eficiencia en dispositivos de bajos recursos: diseñado para funcionar con una huella de memoria reducida y baja latencia.
- Capacidades multilingües: no especificadas oficialmente; se desconoce el alcance de idiomas soportados.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 125K tokens) y responder con razonamiento estructurado, adecuado para apps de productividad o asistentes personales sin conexión.
- Automatización de atención al cliente en entornos embebidos: su capacidad de tool calling permite integrarlo en sistemas de ticketing o chatbots que necesitan consultar APIs o bases de datos, con un consumo de VRAM de solo 2,3 GB.
- Generación de código en pipelines de CI/CD: gracias a su seguimiento de instrucciones y soporte de funciones, puede usarse para autocompletar o revisar fragmentos de código en entornos de integración continua con recursos limitados.
- Razonamiento científico en laboratorios de investigación: su rendimiento en GPQA Diamond (42,4) lo hace útil para asistir en tareas de análisis de literatura o formulación de hipótesis en equipos sin acceso a GPUs de gama alta.
- Agentes autónomos en IoT: su bajo consumo permite ejecutar agentes de razonamiento multi-paso en dispositivos como Raspberry Pi o gateways industriales, donde la latencia y la memoria son críticas.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia Apache 2.0, es ideal para validar conceptos de procesamiento de lenguaje natural en entornos de desarrollo sin infraestructura costosa.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa con modelos de tamaño similar. Se presentan los datos disponibles:

| Benchmark | GRM-3.2-Turf | LFM2.5-1.2B-Thinking | Qwen3.5-2B | Gemma-4-E2B |
|---|---|---|---|---|
| MMLU-Pro (conocimiento multidisciplinar) | 56,2 | 49,65 | 66,5 | 60,0 |
| GPQA Diamond (razonamiento científico) | 42,4 | 37,86 | 51,6 | 43,4 |
| IFEval (seguimiento de instrucciones) | 91,2 | 88,42 | 78,6 | — |

No se han publicado resultados de benchmarks adicionales en la información disponible. Los datos de la tabla provienen de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: 2,3 GB según LLM Explorer, lo que permite ejecución en GPUs consumer con 4 GB o más de memoria.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), GTX 1660 Super (6 GB) o superiores. También puede ejecutarse en Apple Silicon con 8 GB unificados.
- Cabe en GPUs consumer de gama media y baja; no requiere hardware de datacenter.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers y safetensors.
- Latencia y throughput: no se han publicado datos específicos; al ser un modelo de 1,17B, se espera una inferencia rápida en hardware consumer, con decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | GPQA Diamond | IFEval | Licencia |
|---|---|---|---|---|---|---|
| GRM-3.2-Turf | 1,17B | 125K (no oficial) | 56,2 | 42,4 | 91,2 | Apache 2.0 |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | 49,65 | 37,86 | 88,42 | Apache 2.0 |
| Qwen3.5-2B | 2B | no disponible | 66,5 | 51,6 | 78,6 | no disponible |
| Gemma-4-E2B | 2B | no disponible | 60,0 | 43,4 | — | no disponible |

GRM-3.2-Turf supera a su modelo base en todos los benchmarks publicados, pero queda por detrás de Qwen3.5-2B en conocimiento y razonamiento científico. Su punto fuerte es el seguimiento de instrucciones, donde obtiene la mejor puntuación. La comparativa se basa únicamente en los datos de la model card; no se dispone de especificaciones completas de los modelos alternativos.

## Limitaciones y advertencias

- Al ser un modelo de 1,17B, su conocimiento enciclopédico es limitado en comparación con modelos más grandes; puede presentar lagunas en dominios muy especializados.
- Riesgo de alucinación en tareas de razonamiento complejo o cuando se le pide información factual poco común; se recomienda verificación externa en aplicaciones críticas.
- La ventana de contexto de 125K tokens no está confirmada oficialmente por el autor; podría variar según la implementación y la cuantización.
- No se han publicado detalles sobre los idiomas soportados; el rendimiento en lenguas distintas del inglés puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de soporte ni mantenimiento por parte de OrionLLM.
- No se ha documentado el proceso de entrenamiento (datos, técnicas de alineación), lo que dificulta evaluar posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OrionLLM/GRM-3.2-Turf
- Colección GRM-3.2: https://huggingface.co/collections/OrionLLM/grm-32
- Demo de chat: https://grape.skinnertopia.com/chat
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Página en LLM Explorer: https://llm-explorer.com/model/OrionLLM%2FGRM-3.2-Turf,4pd9ZmbZHH4dLFQCmolkv8
- Vista de arquitectura en hfviewer: https://hfviewer.com/OrionLLM/GRM-3.2-Turf
