# jsimao71/pra-qwen3-0.6b

## Resumen

El modelo jsimao71/pra-qwen3-0.6b es un adaptador estructural de Progressive Retrieval Attention (PRA) para el modelo base Qwen/Qwen3-0.6B. Desarrollado por jsimao71, este adaptador tiene como objetivo mejorar el manejo de contextos largos mediante un mecanismo de atención con recuperación progresiva. El adaptador no contiene los pesos del modelo base, sino que se distribuye como un bundle con componentes estructurales, adaptadores aprendidos y perfiles de ejecución. Está diseñado para usarse con la librería PRA, que permite seleccionar contexto relevante y mapear la estructura del modelo. El modelo base Qwen3-0.6B es un LLM denso de 0.6B parámetros, con arquitectura Qwen3ForCausalLM. El adaptador añade 262,144 parámetros entrenados sobre el dataset QASPER. La relevancia de este modelo radica en que permite extender la capacidad de contexto largo de un modelo pequeño sin necesidad de reentrenar el modelo completo, ofreciendo una solución ligera y portable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (base) + adaptador PRA |
| Parametros totales | 596,049,920 (base) + 262,144 (adaptador) = 596,312,064 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (bundle PRA con adaptadores) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer denso con atención causal. El adaptador PRA introduce un mecanismo de atención con recuperación progresiva, que selecciona dinámicamente el contexto relevante para cada capa. El adaptador fue entrenado con el dataset QASPER, usando un método de softmax multi-positivo, con semilla 11. El adaptador tiene 262,144 parámetros. No se especifican detalles del entrenamiento como número de tokens o épocas. La model card indica que el adaptador es un "structural adapter" con un componente de routing aprendido (`qasper-router-d128`), y que se proporcionan perfiles de ejecución (`reference` y `balanced`).

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3-0.6B es capaz de generar texto coherente y razonar sobre problemas simples.
- Manejo de contexto largo: el adaptador PRA mejora la capacidad de recuperar información relevante en documentos largos, como papers científicos.
- Soporte de tool calling: no disponible (el modelo base no lo tiene, y el adaptador no lo añade).
- Capacidades multilingües: el modelo base es multilingüe, pero no se especifica para el adaptador.
- No hay soporte de visión ni audio.

## Casos de uso

- Análisis de papers científicos: el adaptador está entrenado con QASPER, un dataset de preguntas y respuestas sobre papers, por lo que es adecuado para extraer respuestas de documentos académicos largos.
- Búsqueda de información en documentos extensos: puede usarse para localizar pasajes relevantes en contratos, informes o manuales.
- Asistentes de lectura: para resumir o responder preguntas sobre libros o artículos largos.
- Procesamiento de logs o historiales: con contexto largo, puede analizar secuencias de eventos.
- Chatbots con memoria extendida: aunque el modelo es pequeño, el adaptador permite manejar conversaciones largas.
- Investigación académica: para experimentos de recuperación de información en procesamiento de lenguaje natural.

## Benchmarks y rendimiento

La model card proporciona métricas de cualificación:

| Metrica | Valor | Dataset | Modo |
|---|---|---|---|
| Calidad | 0.4054 | allenai/qasper (n=16) | Learned routing |
| Calidad | 0.4364 | paper4_5_cross_model_diagnostic (n=3) | Native Memory (hot) |

No se especifica qué métrica es (probablemente F1 o exact match). No hay comparación con otros modelos.

## Requisitos de hardware

- Se probó en una NVIDIA GeForce GTX 950M (2 GB de VRAM), lo que indica que es muy ligero.
- El modelo base tiene 0.6B parámetros; en FP16 ocupa aproximadamente 1.2 GB, más el adaptador, cabe en GPUs de consumo con al menos 2 GB.
- Se puede ejecutar con el motor de Hugging Face (eager), MLX y vLLM, aunque solo Hugging Face tiene validación controlada para Native Memory.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No hay información de comparativas con otros adaptadores o modelos. Se podría comparar con el modelo base sin adaptador, pero no hay benchmarks disponibles. Por tanto, no disponible.

## Limitaciones y advertencias

- El adaptador no contiene los pesos del modelo base, por lo que es necesario descargar Qwen/Qwen3-0.6B por separado.
- El routing aprendido está entrenado solo con QASPER, por lo que su transferencia a otros dominios no está garantizada.
- Native Memory solo tiene evidencia controlada para el motor de Hugging Face y para esta revisión exacta del modelo base; debe re-cualificarse para otros motores, cuantizaciones y hardware.
- Native Serving no está cualificado.
- El cohort de evaluación es pequeño (n=16 y n=3), por lo que las métricas no son concluyentes.
- No se especifican sesgos ni riesgos de alucinación, pero al ser un modelo pequeño, puede tener limitaciones en razonamiento complejo.

## Enlaces

- HuggingFace: https://huggingface.co/jsimao71/pra-qwen3-0.6b
- Documentación PRA: https://einnovator.github.io/pdattention/
- Repositorio fuente: https://github.com/einnovator/pdattention
- Issues: https://github.com/einnovator/pdattention/issues
- Guía de contribución: https://github.com/einnovator/pdattention/blob/main/CONTRIBUTING.md
