# ggml-org/Kev-4B-GGUF

## Resumen
Kev-4B es un modelo de decisión de 4.207 millones de parámetros (4B) publicado por ggml-org en formato GGUF cuantizado, derivado del modelo base jaredpalmer/kev-4b, que a su vez parte de Qwen/Qwen3.5-4B-Base. No es un modelo generativo de propósito general: está diseñado para emitir decisiones a través de un endpoint específico (`/v1/systemone`) de llama.cpp, lo que lo sitúa en la categoría de modelos de clasificación y enrutamiento más que en la de asistentes conversacionales.

Su relevancia práctica radica en dos factores. Primero, su tamaño contenido (4B) permite ejecutarlo en hardware de consumo y en entornos de borde, algo poco habitual en modelos de razonamiento complejo. Segundo, su integración nativa con llama.cpp y con la aplicación Llama simplifica el despliegue: basta con `llama serve -hf ggml-org/Kev-4B-GGUF` para levantar el servicio sin necesidad de pipelines adicionales.

La licencia Apache 2.0 y el formato GGUF lo convierten en una opción atractiva para equipos que necesitan un componente de toma de decisiones ligero dentro de arquitecturas de agentes, siempre que se asuma que la documentación pública es escasa y que el modelo está pensado para un contrato de API concreto, no para uso conversacional libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base; detalles específicos de la variante de decisión no disponibles) |
| Parámetros totales | 4.207.062.528 (4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF cuantizado (niveles concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,9 GB; incluye múltiples cuantizaciones) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-4B-Base, un transformer denso de aproximadamente 4B parámetros, y ha sido especializado por jaredpalmer como modelo de decisión (decision model) antes de su conversión automática a GGUF por parte de ggml-org mediante su herramienta de conversión. La arquitectura subyacente es, por tanto, la de un transformer estándar con atención completa, sin componentes MoE ni mecanismos híbridos SSM declarados en la información disponible.

No se han publicado detalles sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si hubo fases de RLHF o DPO. La model card únicamente indica que el modelo se consume a través de la API `/v1/systemone` de llama.cpp, lo que sugiere un entrenamiento orientado a producir salidas estructuradas de decisión (posiblemente clasificación o enrutamiento) en lugar de texto libre. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal en esta variante.

## Capacidades
- Toma de decisiones automatizada: el modelo está diseñado para emitir decisiones a través del endpoint `/v1/systemone`, orientado a enrutamiento o clasificación dentro de flujos de agentes.
- Clasificación de texto: la pipeline declarada en Hugging Face es `text-classification`, lo que confirma su uso previsto para categorizar entradas.
- Integración con llama.cpp: soporte nativo mediante `llama serve` y compatibilidad con la aplicación Llama (llama.app).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura de endpoints estándar.
- Conversación: la etiqueta `conversational` aparece en los metadatos, aunque el uso principal documentado es el de decisión, no el diálogo abierto.
- Capacidades multilingües: no disponibles.
- Tool calling, agentes multi-paso, visión, audio o modo thinking: no documentados en la información disponible.

## Casos de uso
- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede clasificar la intención de un mensaje entrante y derivarlo al departamento o al agente adecuado, aprovechando su tamaño reducido para mantener latencia baja en picos de tráfico.
- Filtrado previo en pipelines RAG: antes de invocar un modelo generativo grande, Kev-4B puede decidir si una consulta requiere recuperación de documentos o puede responderse directamente, reduciendo costes de inferencia.
- Moderación de contenido en foros o comentarios: su pipeline de clasificación permite etiquetar mensajes como válidos, sospechosos o bloqueados dentro de un flujo automatizado.
- Orquestación de agentes: como componente de decisión, puede elegir qué herramienta o sub-agente invocar en cada paso de un flujo multi-paso, actuando como router ligero dentro de una arquitectura mayor.
- Clasificación de tickets en soporte técnico: asignación automática de prioridad y categoría a incidencias entrantes, con despliegue en local gracias al formato GGUF y a la licencia Apache 2.0.
- Prototipado en hardware de consumo: investigadores que necesiten validar una arquitectura de decisión en una RTX 4090 o en un portátil pueden ejecutar el modelo con llama.cpp sin depender de infraestructura cloud.
- Despliegue en el borde: al caber en equipos modestos, puede integrarse en dispositivos locales para decisiones de baja latencia sin conexión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: para un modelo de 4B en cuantización Q4, el peso ronda los 2,5-3 GB; en Q8, alrededor de 4,5 GB; en FP16, unos 8,5 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos oficiales del autor.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para despliegues de producción; GPUs de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) suficientes para cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp (recomendado, con `llama serve`), Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriría conversión a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kev-4B (este) | 4B | No disponible | Apache 2.0 | GGUF | Modelo de decisión especializado, integración nativa con llama.cpp |
| Qwen3.5-4B-Base | 4B | No disponible | No disponible | Safetensors | Modelo base del que deriva; uso generativo general |
| jaredpalmer/kev-4b | 4B | No disponible | Apache 2.0 (según repo derivado) | Safetensors | Versión original sin cuantizar del modelo de decisión |

La comparación con alternativas de la misma categoría (modelos de decisión ligeros) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Documentación muy escasa: la model card no detalla datos de entrenamiento, sesgos, idiomas ni evaluación, lo que dificulta auditar su comportamiento en producción.
- Uso restringido a un contrato de API concreto: está pensado para `/v1/systemone`; emplearlo como modelo conversacional general puede producir resultados fuera de su dominio de entrenamiento.
- Riesgo de alucinación: no cuantificado ni evaluado públicamente; al ser un modelo de decisión, los errores se manifestarán como clasificaciones incorrectas o rutas mal asignadas.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- Contexto no documentado: se desconoce la ventana máxima, lo que limita el diseño de flujos con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B-Base, cuyos términos no se detallan en la información disponible.
- Conversión automática: el modelo ha sido convertido a GGUF mediante una herramienta automática, sin que se documente una validación exhaustiva de la cuantización.

## Enlaces
- Hugging Face: https://huggingface.co/ggml-org/Kev-4B-GGUF
- Modelo base original: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Pull request de llama.cpp con la API `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/29818
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
