# mosetireagan/dxa-guard-deepseek-r1-1.5b-gguf

## Resumen

DXA-Guard AI Tier-2 es un modelo de lenguaje pequeño especializado en ciberseguridad, publicado por el usuario mosetireagan en HuggingFace. Se trata de un fine-tuning de DeepSeek-R1-Distill-Qwen-1.5B (a su vez, una destilación de DeepSeek-R1 sobre la arquitectura Qwen2) entrenado sobre 9.288 eventos de telemetría de incidentes de seguridad. Su propósito es funcionar como motor de razonamiento local (on-premises) para equipos de SOC, generando análisis forense paso a paso y veredictos estructurados en JSON con acciones de contención recomendadas.

El modelo se distribuye en formato GGUF cuantizado a Q4_K_M, con un tamaño de archivo de aproximadamente 1,04 GB y una huella de RAM de unos 1,18 GB en CPU, sin requerir GPU. Esto lo hace especialmente adecuado para entornos air-gapped o con recursos limitados, donde no se puede enviar telemetría sensible a servicios cloud. La ventana de contexto es de 4.096 tokens.

Su relevancia reside en la tendencia actual de desplegar LLM pequeños y especializados para tareas verticales: en este caso, el razonamiento sobre alertas de seguridad en infraestructura propia, aprovechando las capacidades de razonamiento en cadena heredadas de la familia DeepSeek-R1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder, base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parámetros totales | 1.777.088.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), 1,04 GB por archivo; el repo también referencia safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, una destilación del modelo de razonamiento DeepSeek-R1 sobre la arquitectura transformer densa de Qwen2 con 1.500 millones de parámetros aproximadamente. La destilación de R1 transfiere al modelo la capacidad de razonamiento en cadena mediante bloques `<think>`, que en esta variante se aprovechan para producir razonamiento forense causal paso a paso antes de emitir un veredicto.

Según la model card, el fine-tuning se realizó sobre 9.288 eventos de telemetría de incidentes de seguridad, orientando la salida del modelo hacia dos componentes: un razonamiento forense detallado dentro de etiquetas `<think>` y un veredicto estricto en JSON con acciones de contención recomendadas. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento forense paso a paso sobre incidentes de seguridad, con salida estructurada en bloques `<think>`.
- Generación de veredictos en JSON estricto con acciones de contención recomendadas, apto para integración automatizada en pipelines SOC.
- Generación de texto conversacional general heredada del modelo base.
- Ejecución 100 % local en CPU (unos 1,18 GB de RAM), apta para entornos air-gapped y on-premises.
- Cuantización Q4_K_M que permite inferencia en hardware de consumo sin GPU.
- No se ha publicado información sobre tool calling, capacidades de visión o audio, ni soporte multilingüe específico.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede recibir telemetría de incidentes y producir un veredicto JSON con acciones de contención, reduciendo la carga de analistas de Tier-2.
- Despliegue en entornos air-gapped: al funcionar en CPU con ~1,18 GB de RAM, puede ejecutarse en redes aisladas donde no se permite conectividad con servicios cloud de IA.
- Automatización de respuesta a incidentes: la salida JSON estricta permite integrar el modelo en playbooks de SOAR para disparar acciones de contención automáticas.
- Análisis forense asistido: el razonamiento paso a paso en `<think>` genera trazas explicables que un analista puede revisar y auditar.
- Laboratorios de formación en ciberseguridad: puede usarse como motor de razonamiento en ejercicios de simulación de incidentes sin coste de infraestructura GPU.
- Prototipado de agentes de seguridad locales: su tamaño reducido y formato GGUF lo hacen idóneo para integrarse vía Ollama en herramientas locales de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; la inferencia se realiza en CPU con aproximadamente 1,18 GB de RAM.
- GPU recomendadas: no necesarias; si se desea aceleración, cualquier GPU moderna con más de 2 GB de VRAM sería suficiente para el archivo Q4_K_M de 1,04 GB (dato estimado, no publicado por el autor).
- Cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) e incluso funciona íntegramente en CPU.
- Despliegue: el autor documenta el uso vía Ollama (con un CLI propio, `dxa_cli.py`, para descargar y probar el modelo). Al ser GGUF, es compatible en principio con llama.cpp y derivados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| DXA-Guard (este modelo) | 1.777 M | 4.096 tokens | Ciberseguridad / SOC, razonamiento forense | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1.770 M aprox. | 131.072 tokens (según ficha oficial) | Razonamiento general | MIT |
| Qwen2.5-1.5B-Instruct | 1.540 M aprox. | 32.768 tokens (128K con YaRN) | Uso general multilingüe | Apache 2.0 / Qwen |

Nota: los datos de los modelos comparables proceden de sus fichas públicas oficiales; el fine-tuning de DXA-Guard reduce el contexto a 4.096 tokens respecto a su modelo base.

## Limitaciones y advertencias

- Contexto reducido a 4.096 tokens, lo que limita el análisis de incidentes con telemetría extensa o conversaciones largas.
- Entrenado sobre solo 9.288 eventos: el dominio de especialización es estrecho y el modelo puede tener cobertura limitada frente a técnicas de ataque novedosas.
- Riesgo de alucinación heredado del modelo base; los veredictos JSON generados deben validarse antes de ejecutar acciones de contención automáticas en producción.
- No se ha publicado información sobre sesgos conocidos, idiomas soportados ni evaluaciones formales de rendimiento.
- Modelo de un autor individual sin documentación extensa: se recomienda auditoría propia antes de uso en entornos de producción críticos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base hereda las condiciones de DeepSeek-R1-Distill (MIT), sin restricciones relevantes adicionales conocidas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/mosetireagan/dxa-guard-deepseek-r1-1.5b-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
