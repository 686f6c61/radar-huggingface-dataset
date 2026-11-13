# Kisho00/furi-phi4-mini-v7

## Resumen

Furi (furi-phi4-mini-v7) es un ajuste fino experimental del modelo microsoft/Phi-4-mini-instruct, desarrollado por el usuario Kisho00 y publicado en Hugging Face. El modelo está especializado en atención de mascotas, concretamente en un chatbot de cuidado de perros y gatos, mediante una técnica de QLoRA sobre el modelo base. Se trata de un modelo de aproximadamente 3.836 millones de parámetros (3,8 B) almacenado en formato safetensors, con un repositorio de 7,7 GB.

El modelo hereda la arquitectura transformer del Phi-4-mini-instruct de Microsoft, pero no se dispone de información publicada sobre la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni la licencia aplicable. La model card lo describe explícitamente como un modelo de prueba ("Test model only") y advierte de que las respuestas sobre salud son información general, no diagnósticos, y no sustituyen la consulta a un veterinario.

Su relevancia es limitada en el momento de publicación: cuenta con cero descargas y cero "likes", no tiene pipeline declarado y la información técnica disponible es mínima. Resulta útil como ejemplo de ajuste fino con QLoRA orientado a un dominio vertical (cuidado de mascotas), pero no debe considerarse un modelo listo para producción sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de microsoft/Phi-4-mini-instruct); requiere custom_code |
| Parámetros totales | 3.836.021.760 (3,8 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el ajuste se realizó con QLoRA, pero no se publican artefactos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer denso de aproximadamente 3,8 B de parámetros. Sobre esta base se aplicó un ajuste fino con QLoRA, según las etiquetas del repositorio, lo que implica que el entrenamiento se realizó con el modelo base cuantizado en 4 bits y adaptadores de bajo rango. No se especifican el número de tokens de entrenamiento, la composición del dataset, la longitud de las secuencias ni si se aplicaron fases de RLHF o DPO.

El repositorio incluye la etiqueta `custom_code`, lo que indica que la carga del modelo requiere código personalizado más allá de la librería estándar de transformers. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) ni detalles sobre el proceso de alineación. Toda la información sobre el entrenamiento procede exclusivamente de las etiquetas y de la breve model card, que no aporta métricas ni hiperparámetros.

## Capacidades

- Generación de texto conversacional orientada a un chatbot de cuidado de perros y gatos.
- Respuestas de información general sobre salud y cuidados de mascotas, con la advertencia explícita de que no constituyen diagnósticos veterinarios.
- Herencia de las capacidades generales del modelo base Phi-4-mini-instruct (razonamiento, código, matemáticas), aunque no se ha verificado su preservación tras el ajuste.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Chatbot de atención sobre cuidado de mascotas: el modelo está ajustado específicamente para conversaciones sobre perros y gatos, por lo que puede emplearse como base de un asistente conversacional en una web o aplicación de veterinaria, con supervisión humana en las respuestas de salud.
- Triaje informativo previo a la consulta veterinaria: puede ofrecer información general sobre síntomas comunes y hábitos de cuidado, siempre con un aviso claro de que no sustituye al veterinario, tal como indica su model card.
- Asistente de contenidos para tiendas de productos para mascotas: generación de descripciones, consejos de uso y respuestas frecuentes sobre alimentación e higiene de perros y gatos.
- Prototipado rápido de un dominio vertical: sirve como ejemplo reproducible de ajuste con QLoRA sobre Phi-4-mini-instruct para equipos que quieran adaptar un modelo pequeño a un nicho concreto.
- Base para evaluación de ajustes finos: al ser un modelo de prueba, puede utilizarse en experimentos comparativos sobre cómo el ajuste con QLoRA afecta al rendimiento del modelo base en tareas generales.
- Módulo de FAQ en una aplicación móvil de cuidado de mascotas: con un tamaño de 3,8 B puede desplegarse en infraestructura modesta para responder preguntas frecuentes, aunque requiere validación previa por la falta de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,7 GB solo para los pesos (3,8 B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 4 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2-2,5 GB para los pesos, aunque no se publican artefactos GGUF ni cuantizados oficiales.
- GPU recomendadas: tarjetas con al menos 8-16 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4); para cuantización 4 bits bastaría una GPU consumer con 4-6 GB.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060 Ti, RTX 4070 y superiores, especialmente con cuantización.
- Opciones de despliegue: al requerir `custom_code`, la carga con vLLM, llama.cpp u Ollama no está garantizada sin adaptación; la vía documentada es transformers con código personalizado. No se confirma compatibilidad con TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kisho00/furi-phi4-mini-v7 | 3,8 B | No disponible | No disponible | Hugging Face (0 descargas) | Ajuste QLoRA para cuidado de mascotas |
| microsoft/Phi-4-mini-instruct | ~3,8 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base público) | Modelo generalista de Microsoft; base del ajuste |
| Alternativas de tamaño similar (p. ej., Qwen2.5-3B, Llama-3.2-3B) | ~3 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelos generalistas; no especializados en mascotas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente experimental y "solo para pruebas" según su model card; no está validado para producción.
- Las respuestas sobre salud son información general y no diagnósticos veterinarios; no sustituyen la consulta a un profesional.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en un dominio de salud animal.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles: se desconoce si el ajuste conserva el multilingüismo del modelo base.
- Longitud de contexto no disponible tras el ajuste.
- Requiere `custom_code` para su carga, lo que puede complicar el despliegue con herramientas estándar.
- Cero descargas y cero interacciones en el momento de la consulta: sin validación por parte de la comunidad.
- El ajuste con QLoRA puede degradar capacidades generales del modelo base (código, matemáticas, razonamiento) no evaluadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kisho00/furi-phi4-mini-v7
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
