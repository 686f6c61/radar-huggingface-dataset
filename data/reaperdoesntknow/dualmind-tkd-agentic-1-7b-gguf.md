# reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF

## Resumen

DualMind-TKD-Agentic-1.7B-GGUF es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) publicado por el usuario reaperdoesntknow en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp y herramientas compatibles. El modelo parte de la familia Qwen3, según las etiquetas del repositorio, y ha sido afinado y convertido a GGUF con la librería Unsloth, según indica su model card.

El nombre ("Agentic", "TKD", "DualMind") sugiere un ajuste fino orientado a flujos agénticos y conversacionales, aunque la model card no documenta el proceso de entrenamiento, los datos utilizados ni las capacidades concretas. La información pública es muy escasa: no se especifican licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio cuenta con 2.863 descargas y un único "like" en el momento de la consulta.

Su relevancia práctica reside en el tamaño reducido (1,7B) combinado con cuantizaciones GGUF (Q4_K_M, Q6_K, Q8_0), que permiten ejecutarlo en hardware de consumo. No obstante, al carecer de documentación técnica y de benchmarks, debe considerarse un modelo experimental cuya calidad no está verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, según tags; detalles no disponibles) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como base de entrenamiento según metadatos) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo deriva de Qwen3 (tag `qwen3`) y que fue afinado y convertido a GGUF mediante Unsloth, herramienta que acelera el fine-tuning y la exportación. El recuento de parámetros (1,72B) es coherente con un modelo denso de la familia Qwen3 de tamaño pequeño, pero no se documenta si se trata de la variante base o instruct, ni si se aplicaron técnicas como LoRA/QLoRA durante el ajuste.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El sufijo "TKD" y el término "DualMind" no se explican en la model card, por lo que cualquier interpretación sobre su significado sería especulativa.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el ejemplo de uso con `llama-cli --jinja` indican soporte de plantillas de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con servicios de inferencia compatibles con la API de Hugging Face.
- Ejecución local vía llama.cpp: los ejemplos de la model card incluyen `llama-cli` y `llama-mtmd-cli` (este último para modelos multimodales, aunque no se confirma que este modelo lo sea).
- Orientación agéntica: el nombre incluye "Agentic", pero no se documentan capacidades específicas de tool calling, planificación multi-paso ni razonamiento estructurado.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 1,7B en GGUF, puede ejecutarse en portátiles o equipos sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo respuestas conversacionales con baja latencia y sin dependencia de la nube.
- Prototipado de agentes en entornos con recursos limitados: su tamaño permite iterar rápidamente sobre pipelines agénticos (aunque sin garantías documentadas de tool calling) en máquinas de desarrollo convencionales.
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` facilita desplegarlo en infraestructuras de inferencia estándar para validar flujos de API antes de migrar a modelos mayores.
- Educación y experimentación: útil para estudiar el impacto del fine-tuning y la cuantización GGUF en modelos pequeños de la familia Qwen3.
- Filtrado o clasificación de texto en local: con cuantización Q4_K_M puede ejecutarse en CPU para tareas de etiquetado o resumen de baja complejidad, siempre con validación humana.
- Demos offline y entornos air-gapped: al no requerir conexión, encaja en escenarios con restricciones de privacidad donde no se pueden enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q8_0: en torno a 1,8-2 GB de pesos, más overhead de contexto (estimación de 2,5-3 GB en total).
  - Q6_K: en torno a 1,4-1,5 GB de pesos, más overhead (estimación de 2-2,5 GB en total).
  - Q4_K_M: en torno a 1,0-1,1 GB de pesos, más overhead (estimación de 1,5-2 GB en total).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones disponibles, incluidas GPUs de gama baja y placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMind-TKD-Agentic-1.7B | 1,72B | no disponible | no disponible | GGUF | Fine-tuning no documentado sobre base Qwen3 |
| Qwen3-1.7B (oficial) | ~1,7B | no disponible en esta ficha | según variante (habitualmente Apache 2.0) | safetensors, GGUF | Modelo base oficial con documentación y benchmarks publicados |
| Llama 3.2 1B | ~1,2B | 128K (según documentación oficial) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con ecosistema amplio |

La comparación con Qwen3-1.7B oficial y Llama 3.2 1B es pertinente por tamaño y despliegue, pero no se dispone de datos de rendimiento de DualMind que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Documentación mínima: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide valorar su fiabilidad.
- Riesgo de alucinación: como todo modelo de 1,7B, la probabilidad de generar contenido incorrecto es alta, especialmente en tareas de razonamiento o conocimiento factual.
- Capacidades agénticas no verificadas: el nombre sugiere soporte de agentes, pero no se documenta tool calling ni formato de funciones.
- Contexto desconocido: se desconoce la ventana máxima, lo que limita el diseño de aplicaciones con entradas largas.
- Idiomas no especificados: no se puede asumir un buen rendimiento en castellano sin pruebas.
- Modelo de un solo autor y con muy poca tracción (1 like): no hay validación comunitaria ni mantenimiento garantizado.
- Origen del fine-tuning incierto: al no detallarse el dataset, existe riesgo de que herede sesgos o datos contaminados de la base Qwen3.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
