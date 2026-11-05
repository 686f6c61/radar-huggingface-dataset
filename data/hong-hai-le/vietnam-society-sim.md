# hong-hai-le/vietnam-society-sim

## Resumen

Vietnam Society Sim es un adaptador LoRA publicado por hong-hai-le sobre el modelo base Qwen/Qwen3.5-2B, orientado a la simulación de personas y a la simulación de encuestas en vietnamita. El modelo se distribuye como un adaptador de bajo rango (LoRA) que se aplica sobre los pesos del modelo base, de modo que el resultado final conserva la arquitectura y el tamaño del Qwen3.5-2B original: aproximadamente 2.213 millones de parámetros en total según los pesos en safetensors del repositorio. La especialización consiste en generar respuestas realistas de personas sintéticas vietnamitas y en simular respuestas a encuestas, una tarea útil para investigación de mercado, ciencias sociales computacionales y generación de datos sintéticos etiquetados.

El modelo parte de la familia Qwen3.5, que incorpora capacidades multimodales de entrada (image-text-to-text) y está pensado para generación de texto conversacional. El adaptador se entrenó presumiblemente sobre el dataset nvidia/Nemotron-Personas-Vietnam, que aporta perfiles de personas sintéticas con atributos demográficos y de opinión en vietnamita. El resultado es un modelo pequeño, desplegable en hardware de consumo, que prioriza la coherencia de persona y la fidelidad cultural sobre el rendimiento generalista.

Su relevancia actual radica en la combinación de tres factores: un tamaño reducido (2B parámetros) que permite inferencia local, una licencia MIT permisiva para uso comercial y una especialización vertical poco frecuente (simulación de encuestas en un idioma de recursos medios como el vietnamita). El acceso al repositorio está restringido y requiere aceptar las condiciones en HuggingFace antes de la descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), adaptador LoRA |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de llama.cpp/vLLM al fusionar el adaptador) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | Qwen/Qwen3.5-2B |
| Dataset de entrenamiento | nvidia/Nemotron-Personas-Vietnam |
| Pipeline | text-generation (con entrada image-text-to-text en el modelo base) |
| Acceso | restringido (gated) |
| Tamaño del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5 con capacidades multimodales de entrada (image-text-to-text). El adaptador no modifica la arquitectura del modelo base: se aplican matrices de bajo rango sobre las proyecciones del transformer, de modo que en inferencia puede fusionarse con los pesos originales o mantenerse como adaptador separado. El número total de parámetros reportado en safetensors (2.213.241.664) corresponde al modelo base completo, no al adaptador aislado.

El entrenamiento se realizó sobre el dataset nvidia/Nemotron-Personas-Vietnam, compuesto por personas sintéticas con atributos demográficos y de opinión en vietnamita. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la configuración del LoRA (rango, alpha, módulos objetivo) ni sobre si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio ajuste de persona y la simulación de encuestas.

## Capacidades

- Generación de texto conversacional en vietnamita con coherencia de persona mantenida a lo largo del diálogo.
- Simulación de personas sintéticas: el modelo puede adoptar perfiles demográficos y de opinión definidos y responder de forma consistente con ese perfil.
- Simulación de encuestas: generación de respuestas a preguntas de encuesta condicionadas por el perfil de persona.
- Generación de datos sintéticos etiquetados para investigación social y de mercado.
- Capacidades multimodales de entrada heredadas del modelo base Qwen3.5-2B (image-text-to-text), aunque el adaptador está especializado en texto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al vietnamita según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación de mercado en Vietnam: el modelo puede generar respuestas sintéticas a cuestionarios de producto o intención de compra condicionadas por perfiles demográficos, permitiendo pre-testear encuestas antes del trabajo de campo real y detectar preguntas ambiguas o sesgadas.
- Ciencias sociales computacionales: simulación de poblaciones sintéticas para estudiar dinámicas de opinión, segmentación por edad, región o nivel educativo, con la ventaja de que el modelo cabe en una GPU de consumo y permite iterar rápidamente sobre miles de perfiles.
- Generación de datos sintéticos para entrenamiento: producción de pares pregunta-respuesta etiquetados por perfil de persona para aumentar datasets de ajuste fino de modelos conversacionales en vietnamita, un idioma con menos recursos que el inglés.
- Pruebas de usabilidad de cuestionarios: generación de respuestas diversas a borradores de encuestas para validar la claridad de las preguntas y la cobertura de opciones de respuesta antes de desplegar el instrumento.
- Análisis de sensibilidad de campañas: simulación de reacciones de distintos segmentos de la sociedad vietnamita ante mensajes públicos o campañas de comunicación, útil para agencias y equipos de comunicación.
- Educación e investigación académica: herramienta docente para ilustrar cómo funcionan los modelos de persona y la simulación basada en agentes en un contexto cultural específico, con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4,4 GB solo para los pesos del modelo base, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2-2,5 GB; en 4 bits: alrededor de 1,2-1,5 GB (estimaciones a partir del número de parámetros, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más; en 4 bits cabe en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador LoRA, vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp/Ollama tras conversión a GGUF. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Acceso |
|---|---|---|---|---|---|
| Vietnam Society Sim (este modelo) | 2,21 B | no disponible | Personas y encuestas en vietnamita (LoRA sobre Qwen3.5-2B) | MIT | Restringido (gated) |
| Qwen3.5-2B (base) | 2,21 B | no disponible | Modelo generalista multimodal de entrada | no disponible en la información | Público |
| Nemotron-Personas-Vietnam (dataset) | no aplica | no aplica | Dataset de personas sintéticas vietnamitas | no disponible en la información | Público |

No se dispone de información sobre otros adaptadores de simulación de personas en vietnamita con los que comparar directamente.

## Limitaciones y advertencias

- El modelo solo está etiquetado para vietnamita; su rendimiento en otros idiomas, incluido el castellano, no está documentado y probablemente sea deficiente.
- Al ser un adaptador LoRA sobre un modelo de 2B parámetros, su capacidad de razonamiento general y de conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación en la generación de respuestas de encuesta: las personas sintéticas pueden producir opiniones plausibles pero no fundamentadas en datos reales, por lo que no deben presentarse como resultados de encuestas reales.
- Los sesgos presentes en el dataset Nemotron-Personas-Vietnam y en el modelo base pueden propagarse a las respuestas generadas; no se documentan evaluaciones de sesgo.
- El acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la automatización de descargas.
- No se documentan la longitud de contexto, la configuración del LoRA ni los detalles de entrenamiento, lo que dificulta evaluar su robustez en producción.
- La licencia MIT del adaptador no exime de verificar la licencia del modelo base Qwen3.5-2B, que puede imponer condiciones adicionales para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hong-hai-le/vietnam-society-sim
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Personas-Vietnam
