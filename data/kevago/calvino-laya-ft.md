# kevago/calvino-laya-ft

## Resumen

Calvino Laya fine-tune, run 1 es un ajuste fino del checkpoint `convaiinnovations/laya` publicado por el usuario kevago bajo el identificador `kevago/calvino-laya-ft`. Se trata de un modelo de 321.908.998 parámetros (aproximadamente 322 millones) distribuido en formato safetensors, con licencia Apache 2.0 y un repositorio de 0,7 GB. Forma parte del Proyecto Calvino y está orientado a un flujo de trabajo muy concreto: el tratamiento de pagos bloqueados ("stuck-payments").

A diferencia de un modelo conversacional de propósito general, este ajuste se ha entrenado para responder únicamente a dos preguntas de clasificación sobre mensajes de clientes en español: `needs_human` (si el caso requiere intervención de un agente humano) y `workflow_area` (el área del flujo de trabajo a la que corresponde el caso). El entrenamiento se realizó con datos sintéticos generados por el propio equipo, no con conversaciones reales de clientes.

Su relevancia es acotada y hay que leerla con cautela: el propio autor declara explícitamente que el modelo no debe usarse para decisiones en producción, que las únicas cifras registradas corresponden al ajuste sobre el conjunto de entrenamiento ("train fit, not evaluation") y que la comparación frente al checkpoint base queda pendiente de una evaluación separada con datos reservados. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que no cuenta con validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 321.908.998 (aproximadamente 322 M) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base se describe como multilingüe; los datos de entrenamiento de este ajuste son mensajes de clientes en español) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería declarada | laya |
| Modelo base | convaiinnovations/laya (commit `7b928d828b7b0e022f929d9bd2e44165aa270148`) |
| Tamaño del repositorio | 0,7 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base ni de este ajuste: no se especifica si se trata de un transformer denso, un MoE, un modelo híbrido con atención lineal ni ninguna otra variante. El único dato estructural confirmado es el recuento de parámetros leído de los pesos en safetensors (321.908.998), coherente con un modelo pequeño de aproximadamente 322 millones de parámetros, y el hecho de que requiere la librería `laya` para su carga.

En cuanto al entrenamiento, el autor indica que se trata de un ajuste fino del checkpoint `convaiinnovations/laya` sobre datos sintéticos generados por el equipo, compuestos por mensajes de clientes en español, y que el objetivo se limita a dos preguntas: `needs_human` y `workflow_area`. No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, destilación u otras). La model card remite a una comparación con datos reservados, identificada como TSD-020 dentro del repositorio de Calvino, que no se enlaza en la información disponible.

## Capacidades

- Clasificación binaria de la pregunta `needs_human`: determinar si un mensaje de cliente en español requiere intervención de un agente humano.
- Clasificación de la pregunta `workflow_area`: asignar el mensaje a un área concreta del flujo de trabajo de pagos bloqueados.
- Procesamiento de mensajes de clientes redactados en español, correspondientes al dominio específico de pagos bloqueados.
- Generación de texto general: no consta como capacidad declarada; el ajuste se presenta como especializado en las dos preguntas anteriores.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara.
- Capacidades multilingües: no disponibles para este ajuste. El modelo base se describe como multilingüe en la model card, pero los datos de entrenamiento del ajuste son en español y no se documenta el comportamiento en otros idiomas.
- Capacidades especiales (modo de razonamiento, visión, audio, etc.): no disponibles.
- Capacidad de conversación multi-turno: no disponible.

## Casos de uso

Todos los casos que se enumeran a continuación son escenarios de uso potencial derivados de la funcionalidad declarada. El autor advierte expresamente que el modelo no debe emplearse para decisiones en producción, por lo que deben plantearse como pilotos, pruebas internas o componentes auxiliares supervisados por una persona.

- Triaje de tickets de pagos bloqueados: dado un mensaje de cliente en español, el modelo responde a `needs_human` para marcar los casos que deben escalarse a un agente humano y dejar el resto en colas automatizadas. Es adecuado porque esa pregunta es exactamente una de las dos tareas para las que fue entrenado.
- Enrutado a equipos internos: la respuesta a `workflow_area` permite dirigir cada ticket al área del flujo de trabajo correspondiente (por ejemplo, incidencias de cobro o revisión manual), reduciendo el reparto manual en la bandeja de entrada.
- Prellenado de formularios de soporte: las dos etiquetas generadas pueden usarse como valores por defecto en la herramienta de ticketing, de modo que el agente solo tenga que confirmarlos o corregirlos.
- Priorización de colas: combinando `needs_human` con reglas de negocio propias, se puede ordenar la cola de atención para que los casos que requieren persona suban de posición.
- Generación de datos de entrenamiento y etiquetado asistido: el modelo puede emplearse como etiquetador previo en un proceso de anotación humana, siempre con revisión posterior, aprovechando que fue entrenado sobre datos sintéticos de este mismo dominio.
- Comparación con el checkpoint base: sirve como punto de partida para la comparación con datos reservados que el autor anuncia (TSD-020) y para medir si el ajuste fino aporta mejoras frente a `convaiinnovations/laya`.
- Monitorización de deriva del dominio: al aplicarlo sobre lotes periódicos de mensajes, la proporción de respuestas `needs_human` y la distribución de `workflow_area` pueden usarse como señal interna de cambios en el tipo de incidencias recibidas.
- Investigación sobre ajuste fino eficiente en español: con 322 millones de parámetros y licencia Apache 2.0, es un punto de partida asequible para reproducir experimentos de ajuste de clasificadores en dominios de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica únicamente que las cifras registradas corresponden al ajuste sobre el conjunto de entrenamiento ("train fit, not evaluation") y que la comparación con el checkpoint base se decidirá mediante una evaluación separada con datos reservados. No se proporcionan valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar, ni resultados de precisión, exhaustividad o F1 para las tareas `needs_human` y `workflow_area`.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros (321.908.998) y del tamaño del repositorio (0,7 GB), no datos publicados por el autor.

- Peso de los pesos en memoria: en fp32 aproximadamente 1,29 GB; en fp16 o bf16 aproximadamente 644 MB; en int8 aproximadamente 322 MB; en int4 aproximadamente 161 MB. El tamaño de repositorio de 0,7 GB es coherente con pesos almacenados en bf16 o fp16.
- VRAM total estimada para inferencia: entre 2 GB y 4 GB en fp16 con lotes pequeños, sumando pesos, activaciones y el consumo del runtime. La caché KV no se puede dimensionar porque la longitud de contexto no está publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM resulta suficiente, por ejemplo GTX 1650, GTX 1050 Ti, RTX 3050 o superiores. Tarjetas como RTX 4090, A100 o H100 están sobredimensionadas para este tamaño, aunque pueden usarse para procesar lotes grandes.
- Viabilidad en GPU de consumo: sí, cabe en la práctica totalidad de GPU de consumo actuales e incluso en iGPU con memoria compartida suficiente, siempre que la librería `laya` lo permita.
- Ejecución en CPU: viable por el tamaño del modelo, aunque la latencia dependerá de la implementación y del hardware.
- Opciones de despliegue: la única información disponible es que la librería declarada es `laya`. No hay confirmación de compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ni de la existencia de pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la información proporcionada solo se identifica un modelo directamente comparable: el checkpoint base del que deriva este ajuste. No se han encontrado otras alternativas de la misma categoría en los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kevago/calvino-laya-ft | 321.908.998 | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste sobre dos preguntas de clasificación, datos sintéticos en español, no apto para producción según el autor |
| convaiinnovations/laya | no disponible | no disponible | no disponible | HuggingFace (checkpoint base) | Modelo base descrito como multilingüe; la comparación con el ajuste queda pendiente de evaluación con datos reservados |

Otros modelos comparables: no disponible.

## Limitaciones y advertencias

- Uso en producción desaconsejado de forma explícita: la model card indica "Not for production decisions". Cualquier despliegue real debería contar con revisión humana y validación previa.
- Alcance funcional muy reducido: el modelo solo responde a dos preguntas (`needs_human` y `workflow_area`). No es un modelo de propósito general ni un asistente conversacional.
- Datos de entrenamiento sintéticos: al haberse generado por el equipo y no proceder de conversaciones reales, puede no reflejar la distribución, el registro lingüístico ni los casos límite de los mensajes de clientes reales, y puede heredar sesgos del proceso de generación.
- Ausencia de evaluación publicada: solo se registran métricas de ajuste al conjunto de entrenamiento ("train fit"), lo que no permite descartar sobreajuste ni estimar el rendimiento en datos nuevos.
- Idiomas: los datos de entrenamiento son mensajes en español; no se documenta el comportamiento en otras lenguas, pese a que el modelo base se describa como multilingüe.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con mensajes largos o hilos de conversación extensos.
- Riesgo de error de clasificación: el fallo típico no es la alucinación de contenido, sino etiquetar mal un caso, lo que en un flujo de pagos puede derivar en un escalado innecesario o, peor, en un caso que requiere persona y se queda en la cola automática.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar la licencia del checkpoint base `convaiinnovations/laya` y las condiciones aplicables al resto del Proyecto Calvino antes de un uso comercial.
- Falta de validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin incidencias, discusiones ni informes de terceros.
- Dependencia de la librería `laya`: no se documentan alternativas de carga ni formatos de cuantización publicados, lo que puede limitar la integración en infraestructuras estándar.
- Documentación incompleta: no hay información sobre arquitectura, contexto, cuantizaciones, idiomas declarados ni pipeline, lo que dificulta una evaluación técnica rigurosa con los datos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kevago/calvino-laya-ft
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Calvino y documento TSD-020: referenciados en la model card, pero sin enlace disponible en la información proporcionada
- Papers, blogs, repositorios de código y demos: no disponible
