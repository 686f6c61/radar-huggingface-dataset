# koyomi010/medgemma-symptom-lora

## Resumen

medgemma-symptom-lora es un ajuste fino (LoRA) del modelo médico MedGemma 4B IT, publicado por el usuario koyomi010 en HuggingFace. El modelo base es `unsloth/medgemma-4b-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de MedGemma 4B IT preparada para entrenamiento eficiente con la librería Unsloth. El ajuste se ha orientado, según el nombre del repositorio, a la tarea de interpretación de síntomas clínicos.

El modelo hereda la arquitectura Gemma 3 del modelo base: un transformer decoder-only de aproximadamente 4.000 millones de parámetros, con soporte multimodal (texto e imagen) y una ventana de contexto de 128.000 tokens en la familia Gemma 3. El ajuste se ha realizado con TRL y Unsloth, lo que según el autor permitió un entrenamiento "2x más rápido" que un pipeline estándar.

La relevancia de esta ficha es limitada: se trata de un modelo publicado sin model card detallada, sin datos de entrenamiento, sin benchmarks y con cero descargas en el momento de la consulta. Es un artefacto de experimentación personal más que un modelo listo para producción, y debe evaluarse con cautela antes de cualquier uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste LoRA sobre el modelo base |
| Parametros totales | ~4.000 millones (heredados de MedGemma 4B IT; el adaptador LoRA añade una fracción) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de la familia Gemma 3; no confirmada en la model card) |
| Tipos de cuantizacion | El modelo base está en bnb 4-bit; el adaptador se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en bnb 4-bit |
| Tamaño del repositorio | 0,2 GB |
| Librería | transformers |
| Modelo base | unsloth/medgemma-4b-it-unsloth-bnb-4bit |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre MedGemma 4B IT, que a su vez es un ajuste de dominio médico de Gemma 3 4B. La arquitectura subyacente es un transformer decoder-only con atención multi-cabeza estándar de la familia Gemma 3, que incorpora mejoras como atención con ventana deslizante local combinada con atención global, RoPE y normalización RMSNorm. MedGemma 4B IT añade capacidades multimodales (procesamiento de imágenes médicas y texto) sobre la base de Gemma 3.

No se dispone de información sobre el dataset de entrenamiento del ajuste: la model card no especifica número de tokens, composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. Únicamente se indica que el entrenamiento se realizó con Unsloth y TRL, y que fue "2x más rápido" gracias a Unsloth. El adaptador se entrenó sobre una versión del modelo base cuantizada a 4 bits con bitsandbytes, lo que implica que el adaptador debe aplicarse sobre esa misma configuración cuantizada para reproducir el comportamiento esperado.

## Capacidades

- Generación de texto en inglés, con especialización declarada en interpretación de síntomas clínicos (según el nombre del repositorio).
- Herencia de las capacidades del modelo base MedGemma 4B IT: razonamiento médico, respuesta a preguntas clínicas y procesamiento de texto médico.
- Capacidades multimodales potenciales (imagen y texto) heredadas de Gemma 3 / MedGemma, aunque no confirmadas explícitamente en la model card del ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Triaje de síntomas en inglés: el modelo puede recibir una descripción textual de síntomas y generar una respuesta orientativa sobre posibles afecciones, aprovechando el ajuste específico sobre MedGemma. Adecuado para prototipos de asistentes de salud, no para diagnóstico clínico.
- Educación médica y simulación: generación de casos clínicos sintéticos y respuestas explicativas para estudiantes, usando el conocimiento médico heredado del modelo base.
- Preprocesamiento de historiales clínicos: resumen y estructuración de notas de texto en inglés, aprovechando la ventana de contexto larga heredada de Gemma 3.
- Investigación en NLP clínico: punto de partida para experimentos de ajuste fino adicional sobre dominios médicos específicos, dado el reducido tamaño del adaptador (0,2 GB).
- Chatbot de orientación sanitaria no diagnóstica: integración en interfaces conversacionales con aviso legal explícito, limitado a población angloparlante.
- Evaluación comparativa de ajustes LoRA médicos: uso como baseline en estudios sobre eficacia de ajustes de bajo rango en dominios clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits (bnb) requiere aproximadamente 3-4 GB de VRAM para los pesos, más overhead de activaciones y contexto; con contexto largo (128K) el consumo crece de forma significativa.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para contextos largos; una RTX 3060 de 12 GB o superior puede ser suficiente para contextos moderados con cuantización 4-bit.
- Cabe en GPU de consumo: sí, en GPUs con 8-12 GB de VRAM para contextos cortos y cuantización 4-bit.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag presente), vLLM y llama.cpp no confirmados para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| koyomi010/medgemma-symptom-lora | ~4B (LoRA sobre MedGemma 4B IT) | 128K (heredado, no confirmado) | apache-2.0 | HuggingFace, 0 descargas |
| google/medgemma-4b-it | ~4B | 128K | Gemma license (uso comercial con restricciones) | HuggingFace, ampliamente usado |
| unsloth/medgemma-4b-it-unsloth-bnb-4bit | ~4B (4-bit) | 128K | Gemma license | HuggingFace |
| google/gemma-3-4b-it | ~4B | 128K | Gemma license | HuggingFace |

La comparativa de rendimiento no está disponible al no haberse publicado benchmarks del ajuste.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de datos de entrenamiento: no es posible evaluar la calidad del ajuste ni su superioridad frente al modelo base.
- Riesgo elevado de alucinación en contexto médico: el modelo puede generar información clínica incorrecta con apariencia de verosimilitud.
- No apto para uso clínico ni diagnóstico: no sustituye la evaluación de un profesional sanitario.
- Idioma limitado al inglés: no se ha entrenado ni evaluado en castellano.
- Licencia apache-2.0 declarada por el autor, pero el modelo base MedGemma está sujeto a la licencia Gemma de Google, que impone restricciones adicionales de uso comercial; conviene verificar la compatibilidad antes de un despliegue comercial.
- Adaptador entrenado sobre un modelo base cuantizado a 4 bits: puede degradarse si se aplica sobre pesos en otra precisión.
- Cero descargas y sin validación de la comunidad: no hay evidencia externa de su funcionamiento.
- No hay información sobre sesgos demográficos ni sobre la composición del dataset de ajuste.

## Enlaces

- HuggingFace: https://huggingface.co/koyomi010/medgemma-symptom-lora
- Modelo base: https://huggingface.co/unsloth/medgemma-4b-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- MedGemma (Google): https://huggingface.co/google/medgemma-4b-it
