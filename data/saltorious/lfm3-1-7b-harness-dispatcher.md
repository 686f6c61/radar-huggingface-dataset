# Saltorious/lfm3-1.7b-harness-dispatcher

## Resumen

LFM3 1.7B Harness dispatcher es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario Saltorious. El modelo está especializado en una tarea muy concreta: el despacho de trabajo hacia agentes personales dentro de Harness. En la práctica, se encarga de redactar títulos de hilos, briefs, check-ins y respuestas, además de evaluar si el informe devuelto por un agente contiene realmente el resultado solicitado. Es, por tanto, un modelo de texto puro orientado a la orquestación de agentes y no a la generación generalista.

La base es LFM3-1.7B de Liquid AI, con 1.728.801.600 parámetros según los pesos en safetensors. El ajuste se realizó mediante una LoRA con r=16 y alpha=32 sobre 1.379 ejemplos construidos por el propio código de Harness, usando un modelo mayor como generador de respuestas y conservando únicamente los ejemplos que superaban las comprobaciones automáticas de cada tarea. Posteriormente, los pesos se fusionaron y se cuantizaron a Q8_0 con llama.cpp.

Su relevancia es acotada pero clara: cubre un nicho de orquestación de agentes con un modelo pequeño que puede ejecutarse en hardware modesto, a cambio de una licencia restrictiva para uso comercial por encima de 10 millones de dólares de facturación anual. El repositorio tiene un tamaño de 1,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles |
| Licencia | LFM Open License v1.0 (lfm1.0); limite de uso comercial por encima de 10M USD de ingresos anuales |
| Formato de pesos | GGUF (Q8_0); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B, un transformer de 1.728.801.600 parámetros. Sobre esa base se aplicó una LoRA con rango r=16 y alpha=32, entrenada sobre 1.379 ejemplos que cubren cada una de las tareas que ejecuta el dispatcher de Harness. Los ejemplos se generaron con el propio código de Harness, con un modelo de mayor tamaño produciendo las respuestas, y se filtraron conservando solo aquellos que pasaban las comprobaciones automáticas de la tarea correspondiente. Este filtrado por validación programática reduce el ruido del dataset y alinea el modelo con criterios verificables.

Tras el entrenamiento, la LoRA se fusionó con los pesos base y el resultado se cuantizó a Q8_0 mediante llama.cpp. La model card no detalla la composición del dataset original de LFM3-1.7B, el número de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO en el ajuste. Tampoco se documentan innovaciones arquitectónicas propias más allá de la herencia del modelo base.

## Capacidades

- Generación de texto para tareas de orquestación: redacción de títulos de hilos, briefs, check-ins y respuestas dentro de Harness.
- Evaluación de informes de agentes: determina si el reporte devuelto contiene el resultado solicitado.
- Despacho de trabajo hacia agentes personales en un flujo multi-paso.
- Modelo de texto puro: no soporta visión, audio ni otras modalidades.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Orquestación de agentes en Harness: el modelo genera los briefs y las instrucciones que se envían a cada agente personal, manteniendo la coherencia del flujo de trabajo entre tareas.
- Validación automática de resultados de agentes: se usa como juez para comprobar si el informe de un agente contiene el resultado pedido, lo que permite cerrar o reintentar tareas de forma programática.
- Generación de títulos de hilos: produce títulos concisos para conversaciones y tareas dentro de la interfaz, mejorando la navegabilidad del historial.
- Check-ins periódicos: redacta mensajes de seguimiento para recabar el estado de un agente o de una tarea en curso.
- Respuestas de dispatcher: genera respuestas breves al usuario o al sistema cuando el flujo requiere una contestación inmediata sin invocar un modelo mayor.
- Despliegue en local con llama.cpp u Ollama: al estar en GGUF Q8_0 y pesar 1,8 GB, puede ejecutarse en equipos de desarrollo para pruebas de integración del pipeline de agentes sin depender de servicios externos.
- Prototipado de sistemas de agentes: sirve como componente de bajo coste para validar la lógica de despacho antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, aproximadamente 1,8 GB de pesos más overhead de contexto; el consumo real depende de la longitud de contexto y del backend.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con holgura en modelos con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requerirían conversión a otro formato, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3 1.7B Harness dispatcher | 1.728.801.600 | No disponible | LFM Open License v1.0 (límite comercial >10M USD) | GGUF Q8_0 | Fine-tune especializado en despacho de agentes |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | No disponible | LFM Open License v1.0 | Safetensors | Modelo base generalista |
| Alternativas de ~1-2B para orquestación | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados |

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para las tareas del dispatcher de Harness; su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- Dataset pequeño: 1.379 ejemplos filtrados por reglas automáticas pueden no cubrir la variabilidad real de producción.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y especializado, la fiabilidad en la validación de informes de agentes debe verificarse con pruebas propias.
- Idiomas soportados no documentados; no se garantiza un buen comportamiento en castellano.
- Longitud de contexto no disponible; no se recomienda asumir ventanas largas.
- Licencia LFM Open License v1.0: restringe el uso comercial por encima de 10 millones de dólares de ingresos anuales; revisar el archivo LICENSE antes de integrarlo en un producto.
- Solo texto: no admite entradas multimodales.
- Sin descargas ni validación comunitaria: no hay evidencia pública de uso en producción.
- El autor no documenta tool calling ni integración con APIs de agentes más allá del propio Harness.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saltorious/lfm3-1.7b-harness-dispatcher
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el archivo LICENSE del repositorio
