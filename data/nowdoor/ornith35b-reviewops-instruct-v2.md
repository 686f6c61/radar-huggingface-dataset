# nowdoor/ornith35b-reviewops-instruct-v2

## Resumen

El modelo `nowdoor/ornith35b-reviewops-instruct-v2` es un adaptador de tipo LoRA/QLoRA entrenado sobre la base de `ornith-ai/Ornith-1.0-35B`, un modelo de la familia Ornith desarrollado por DeepReinforce AI. El adaptador ha sido afinado mediante instruction tuning para tareas específicas de revisión de operaciones (reviewops), lo que lo orienta a la supervisión y análisis de flujos de trabajo, código y procesos automatizados. Aunque la información pública sobre este adaptador es muy limitada, el modelo base es conocido por su especialización en coding-agent, con una ventana de contexto de 262K tokens y soporte para tool calling.

El modelo base Ornith-1.0-35B es una versión de 35B con arquitectura MoE, diseñada para agentes de codificación de alto valor, con licencia MIT y disponible para autoalojamiento compatible con OpenAI. Este adaptador, publicado por el usuario `nowdoor`, añade una capa de instrucciones específicas para tareas de revisión, lo que lo hace útil para entornos donde se necesita un modelo que audite o supervise operaciones técnicas. Su relevancia radica en la posibilidad de especializar un modelo ya potente con un coste computacional reducido gracias a la técnica QLoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (base) con adaptador LoRA/QLoRA |
| Parametros totales | No disponible (adaptador; base: 35B) |
| Parametros activos | No disponible (base: MoE, no se especifica) |
| Longitud de contexto | 262K tokens (heredado del base) |
| Tipos de cuantizacion | No disponible (se espera que el adaptador sea compatible con cuantizaciones del base) |
| Idiomas soportados | No disponible (tags indican ko, en) |
| Licencia | No disponible (el base es MIT) |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-35B es un transformer con arquitectura MoE (Mixture of Experts) de 35B parámetros, optimizado para tareas de coding-agent. Según la documentación disponible, el modelo fue entrenado mediante un proceso de auto-mejora que optimiza conjuntamente el "scaffold" (andamiaje) y la solución generada, descubriendo mejores trayectorias de búsqueda y generando soluciones de mayor calidad. El adaptador `ornith35b-reviewops-instruct-v2` se ha entrenado con QLoRA, una técnica de fine-tuning eficiente que reduce el uso de memoria al cuantizar los pesos del modelo base y entrenar solo los adaptadores de bajo rango. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o si se aplicaron métodos como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo, heredados del modelo base Ornith-1.0-35B.
- Soporte para tool calling y flujos de trabajo agénticos, ya que el base está diseñado para coding-agent.
- Ventana de contexto amplia de 262K tokens, útil para analizar repositorios completos o logs extensos.
- Especialización en tareas de revisión de operaciones (reviewops), lo que implica capacidad para auditar código, identificar errores y proponer mejoras.
- Capacidades multilingües limitadas: los tags indican soporte para coreano (ko) e inglés (en), aunque no se especifica el nivel.
- Compatible con el ecosistema PEFT y transformers, permitiendo integración sencilla en pipelines existentes.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar pull requests, detectar vulnerabilidades o malas prácticas, y sugerir correcciones, aprovechando su contexto largo para examinar múltiples archivos.
- Auditoría de operaciones automatizadas: supervisar logs de sistemas, identificar anomalías en flujos de trabajo y generar informes de incidencias.
- Asistente de mantenimiento de infraestructura: interpretar configuraciones, scripts de despliegue y proponer optimizaciones basadas en patrones aprendidos.
- Generación de documentación técnica: resumir cambios de código, documentar APIs o crear guías de operación a partir de código fuente.
- Análisis de incidentes de producción: procesar trazas de errores y logs de aplicación para identificar causas raíz y sugerir acciones correctivas.
- Entrenamiento de equipos de desarrollo: generar explicaciones didácticas de fragmentos de código complejos o de procesos operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el adaptador `nowdoor/ornith35b-reviewops-instruct-v2` en la información disponible. El modelo base Ornith-1.0-35B ha sido verificado en entornos de coding-agent, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros tests en los resultados de búsqueda obtenidos. Por tanto, no es posible ofrecer una comparativa cuantitativa fiable.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo MoE de 35B, la VRAM necesaria depende de la cuantización del base. Con cuantización de 4 bits (QLoRA), se estima un consumo de unos 20-24 GB de VRAM para inferencia.
- GPU recomendadas: NVIDIA A100 (40GB), RTX 4090 (24GB), o GPUs con al menos 24GB de memoria para ejecutar el modelo en FP16 o cuantizado.
- En consumer GPUs, una RTX 3090 o 4090 puede ser suficiente si se usa cuantización de 4 bits y se limita el contexto.
- Opciones de despliegue: el base es compatible con vLLM, TGI, llama.cpp y Ollama (según la página de ollama.com). El adaptador PEFT se puede cargar con transformers y luego servir con vLLM si se fusiona con el base.
- Latencia y throughput estimados: no disponibles, dependen del hardware y la configuración de batching.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables específicos para tareas de reviewops. Sin embargo, se puede comparar con el propio modelo base y otras variantes de Ornith:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Ornith-1.0-35B (base) | 35B MoE | 262K | MIT | Coding-agent |
| Ornith-1.0-9B (Dense) | 9B | 262K | MIT | Coding-agent |
| Ornith-1.0-397B (MoE) | 397B | 262K | MIT | Coding-agent |
| nowdoor/ornith35b-reviewops-instruct-v2 | Adaptador LoRA sobre 35B | 262K | No disponible | Reviewops |

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un adaptador sobre un modelo entrenado principalmente para código, puede generar respuestas incorrectas en dominios fuera de su especialización. No se han evaluado sesgos específicos.
- Riesgo de alucinación en tareas de revisión: el modelo puede sugerir cambios incorrectos o pasar por alto errores sutiles; se recomienda supervisión humana.
- Limitaciones de idioma: aunque los tags indican ko y en, no se garantiza un rendimiento óptimo en otros idiomas.
- Restricciones de licencia: la licencia del adaptador no está especificada, aunque el base es MIT. Se debe verificar antes de uso comercial.
- Dependencia del base: el adaptador no es autónomo; requiere el modelo base Ornith-1.0-35B para funcionar.
- Contexto largo: aunque el base soporta 262K tokens, el uso de contextos muy largos puede aumentar la latencia y el consumo de memoria.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/nowdoor/ornith35b-reviewops-instruct-v2)
- [HuggingFace del modelo base Ornith-1.0-35B](https://huggingface.co/ornith-ai/Ornith-1.0-35B)
- [Página de Ornith 1.0 Model 35B](https://ornith.online/ornith-1-0-model-35b)
- [Página de ollama.com para ornith:35b](https://ollama.com/library/ornith:35b)
- [Artículo de verificación de Ornith-1.0 en note.com](https://note.com/zephel01/n/nb64f1495778b?hl=en)
