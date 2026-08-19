# mradermacher/Muse-Glimmer-30GB-Preserving-Abliterated-i1-GGUF

## Resumen

Muse-Glimmer-30GB-Preserving-Abliterated-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Muse-Glimmer-30GB-Preserving-Abliterated, creada por el usuario mradermacher. Este modelo deriva de Muse Glimmer, un modelo abierto de 30.000 millones de parámetros desarrollado por Meta Superintelligence Labs, diseñado específicamente para agentes locales siempre activos, con optimización para uso de herramientas, tareas de larga duración y recuperación de fallos. La versión "abliterada" elimina ciertas restricciones de seguridad del modelo original, mientras que el sufijo "Preserving" sugiere que se han preservado algunas capacidades durante el proceso de abliteración.

El repositorio contiene pesos en formato GGUF, lo que permite ejecutar el modelo en CPU o GPU con herramientas como llama.cpp, Ollama o LM Studio. Con 27.854.794.240 parámetros y un tamaño de repositorio de 10,7 GB, las cuantizaciones incluidas son de baja precisión (probablemente Q2, Q3 o Q4), adecuadas para hardware de consumo. La licencia no está especificada en la ficha de HuggingFace, aunque el modelo original de Meta se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo original es un transformer denso de 30B) |
| Parametros totales | 27.854.794.240 (≈27,85B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según la model card; no se especifica cuáles están disponibles en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo original de Meta es Apache 2.0, pero la versión abliterada puede tener otra) |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo en la documentación proporcionada. El modelo original Muse Glimmer, según la descripción de Meta, es un modelo denso de 30B parámetros optimizado para agentes locales, con entrenamiento enfocado en tool calling, ejecución de tareas largas y recuperación de errores. La versión abliterada de Blackroot modifica los pesos del modelo original para eliminar o reducir las restricciones de seguridad (refusals), manteniendo en este caso ("Preserving") ciertas capacidades originales. El proceso de cuantización realizado por mradermacher aplica imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precisión.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizó RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la abliteración y la cuantización.

## Capacidades

- Generación de texto y conversación multi-turno, con énfasis en tareas de agente (tool use, planificación).
- Soporte de tool calling / function calling, según la descripción del modelo original.
- Optimizado para tareas largas y recuperación de fallos, lo que lo hace adecuado para agentes autónomos.
- Capacidad de razonamiento multi-paso y ejecución de flujos de trabajo complejos.
- Multilingüismo: no se especifican idiomas soportados.
- La versión abliterada elimina respuestas de rechazo, lo que permite generar contenido que el modelo original podría bloquear (con los riesgos asociados).

## Casos de uso

- Agentes de automatización local: el modelo puede ejecutarse en una máquina de escritorio con GPU de consumo, gestionando tareas como envío de correos, gestión de calendario o control de dispositivos domésticos mediante tool calling.
- Asistente de programación con acceso a herramientas: integrado en un IDE, puede invocar funciones de terminal, ejecutar tests o buscar documentación, gracias a su optimización para tool use.
- Chatbot de atención al cliente con memoria larga: aunque la longitud de contexto no está especificada, el diseño para tareas largas permite mantener conversaciones extensas sin perder el hilo.
- Investigación de seguridad y análisis de contenido: la versión abliterada permite explorar escenarios donde el modelo original rechazaría respuestas, útil para pruebas de red teaming o análisis de sesgos.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material educativo que el modelo base podría considerar sensible.
- Prototipado de agentes RAG (retrieval-augmented generation): combinado con un vector store, puede ejecutar pipelines de recuperación y síntesis de documentos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para esta versión cuantizada ni para el modelo abliterado original.

## Requisitos de hardware

- VRAM estimada: con 27,85B parámetros y cuantizaciones de baja precisión (Q2-Q4), el modelo puede ocupar entre 8 y 16 GB de VRAM dependiendo de la cuantización específica. El tamaño del repositorio (10,7 GB) sugiere cuantizaciones en el rango Q2-Q3, que podrían caber en GPUs con 8-12 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones más altas, o RTX 3060 (12 GB) para las más bajas. También puede ejecutarse en CPU con suficiente RAM (16-32 GB) usando llama.cpp.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), text-generation-webui.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_S, se espera una generación de 30-50 tokens/s, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Muse Glimmer (original) | 30B | no disponible | Apache 2.0 | safetensors | Agente local, tool use |
| Muse-Glimmer-30B-Abliterated-i1-GGUF | 27,85B | no disponible | no disponible | GGUF | Igual que el anterior pero abliterado |
| Qwen 2.5 32B (referencia) | 32B | 128K | Apache 2.0 | safetensors, GGUF | Modelo general, buen rendimiento en código y razonamiento |
| Mixtral 8x7B (referencia) | 46,7B (MoE) | 32K | Apache 2.0 | safetensors, GGUF | MoE, eficiente, buen multilingüismo |

La comparativa es cualitativa porque no hay benchmarks disponibles para el modelo evaluado. Muse Glimmer destaca por su diseño específico para agentes, mientras que Qwen y Mixtral son modelos generales con más documentación y ecosistema.

## Limitaciones y advertencias

- La abliteración elimina las salvaguardas de seguridad del modelo original, lo que puede generar contenido ofensivo, peligroso o ilegal. No debe usarse en producción sin control humano.
- No se dispone de información sobre sesgos específicos, pero al ser una modificación de un modelo entrenado por Meta, puede heredar sesgos de género, raza o cultura.
- Riesgo de alucinación: sin datos de benchmarks, no se puede evaluar la fiabilidad factual. La cuantización de baja precisión puede degradar la coherencia.
- Licencia incierta: aunque el original es Apache 2.0, la versión abliterada puede violar los términos de uso de Meta o tener restricciones adicionales. Verificar antes de uso comercial.
- Longitud de contexto no especificada; si es inferior a 8K, puede limitar tareas de agente complejas.
- Sin soporte oficial: es un modelo de terceros, sin mantenimiento ni garantías.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Muse-Glimmer-30GB-Preserving-Abliterated-i1-GGUF
- Modelo original abliterado (Blackroot): https://huggingface.co/Blackroot/Muse-Glimmer-30GB-Preserving-Abliterated
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Documentación de API: https://dev.meta.ai/docs/muse-glimmer/get-the-model
