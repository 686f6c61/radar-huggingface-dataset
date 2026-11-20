# Kisho00/furi-phi4-mini-Kaggle

## Resumen

FurSight AI (furi-phi4-mini-Kaggle) es un ajuste fino experimental del modelo microsoft/Phi-4-mini-instruct, publicado por el usuario Kisho00 en Hugging Face. El modelo se ha entrenado mediante QLoRA sobre un conjunto de datos propio denominado FurSight v2 para convertirlo en un asistente de cuidado de perros y gatos. No es un modelo de propósito general: es una prueba de concepto orientada a un dominio concreto (pet-care) y el propio autor lo etiqueta explícitamente como "test model only".

El modelo base Phi-4-mini-instruct es un transformer decoder-only de la familia Phi-4 de Microsoft, con aproximadamente 3.800 millones de parámetros. El ajuste fino no altera la arquitectura ni el tamaño, sino que especializa el comportamiento del modelo hacia preguntas y recomendaciones sobre salud y cuidado de mascotas. La model card advierte que las respuestas sobre salud son información general, no diagnósticos, y no sustituyen la consulta veterinaria.

Por su tamaño reducido (3.836 millones de parámetros, repo de 7,7 GB en safetensors) es un modelo que puede ejecutarse en hardware de consumo, lo que lo hace interesante para prototipos de asistentes conversacionales especializados, pero su escasa validación pública (cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados) obliga a tratarlo con cautela en cualquier entorno de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-4-mini, heredada del modelo base microsoft/Phi-4-mini-instruct; el ajuste fino es QLoRA) |
| Parametros totales | 3.836.021.760 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-4-mini-instruct declara contexto largo, pero el valor no figura en la model card de este ajuste) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card no declara licencia; hereda las condiciones del modelo base, que deben verificarse en microsoft/Phi-4-mini-instruct) |
| Formato de pesos | safetensors (requiere `trust_remote_code` por la etiqueta `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only de unos 3.800 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con QLoRA (cuantización de bajo rango), técnica que congela los pesos originales y entrena adaptadores de rango reducido, reduciendo el coste de memoria del entrenamiento. El resultado publicado son pesos completos en safetensors (7,7 GB), no un adaptador LoRA separado.

El conjunto de datos de entrenamiento es el FurSight v2 dataset, creado por el autor y orientado a conversaciones sobre cuidado de perros y gatos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card tampoco describe hiperparámetros, rango LoRA, épocas ni métricas de evaluación. La etiqueta `custom_code` indica que la carga del modelo requiere código personalizado del repositorio, probablemente por la configuración de arquitectura heredada del base.

## Capacidades

- Generación de texto conversacional especializada en cuidado de perros y gatos (alimentación, higiene, comportamiento, cuidados básicos).
- Respuestas informativas sobre salud animal, presentadas explícitamente como información general y no como diagnóstico veterinario.
- Conversación multi-turno, heredada de la capacidad instruct del modelo base Phi-4-mini-instruct.
- Razonamiento y conocimiento general del modelo base, potencialmente preservados pero no garantizados tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste (el base lo declara, pero no se confirma aquí).
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipo de asistente conversacional para propietarios de mascotas: el modelo puede responder preguntas frecuentes sobre alimentación, higiene y comportamiento de perros y gatos, usando el dominio del dataset FurSight v2. Adecuado por su especialización, pero solo para entornos de prueba.
- Triaje informativo previo a la consulta veterinaria: puede ofrecer información general sobre síntomas comunes y recomendar acudir al veterinario, siempre con el descargo de responsabilidad que exige la model card. No debe usarse como sustituto del diagnóstico profesional.
- Chatbot de sitio web de clínica veterinaria o tienda de mascotas: integrable como capa de FAQ para preguntas repetitivas, con derivación a un profesional cuando la consulta implique salud.
- Generación de contenido educativo sobre cuidado animal: borradores de artículos, guías o respuestas para foros, revisados posteriormente por un experto.
- Evaluación de técnicas de ajuste fino con QLoRA: sirve como caso de estudio para investigadores que quieran reproducir un pipeline de especialización de Phi-4-mini sobre un dataset de dominio propio.
- Experimentación académica en dominios verticales: base para comparar el efecto de un ajuste fino QLoRA frente al modelo base en tareas de conversación especializada.
- Despliegue en hardware de consumo para demos: al tratarse de un modelo de ~3.800 millones de parámetros, puede ejecutarse en GPU consumer para demostraciones locales, siempre que se resuelva la carga con `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (3.836 millones de parámetros), en FP16 serían necesarios aproximadamente 7,7 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits alrededor de 4 GB, y en 4 bits alrededor de 2-3 GB. Estos cálculos son estimaciones por tamaño, no datos publicados para este modelo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en FP16, o GPUs de 8-12 GB con cuantización), pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí con cuantización, pero no confirmado por el autor.
- Opciones de despliegue: no se documentan. La etiqueta `custom_code` implica que la carga requiere `trust_remote_code=True` con Transformers; no se publican variantes GGUF para llama.cpp/Ollama ni configuraciones para vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kisho00/furi-phi4-mini-Kaggle | 3.836 M | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas |
| microsoft/Phi-4-mini-instruct (base) | ~3.800 M | no disponible en esta ficha | benchmarks publicados por Microsoft (no reproducidos aqui) | ver repositorio oficial de Microsoft | Hugging Face, ampliamente utilizado |
| Alternativas de ~3-4B instruct (p. ej. Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct) | ~3.000-4.000 M | no disponible en esta ficha | benchmarks publicados por sus autores | ver repositorios oficiales | Hugging Face, ampliamente utilizados |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada: no hay benchmarks del ajuste ni datos de contexto o licencia declarados por el autor.

## Limitaciones y advertencias

- Modelo explícitamente experimental ("test model only"): no ha sido validado para uso en producción.
- Riesgo de alucinación elevado en un dominio sensible como la salud animal; la model card insiste en que las respuestas no son diagnósticos ni sustituyen al veterinario.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, ni comparación con el modelo base.
- Licencia no declarada: antes de cualquier uso comercial debe verificarse la licencia del modelo base microsoft/Phi-4-mini-instruct y la del dataset FurSight v2.
- Idiomas no documentados: se desconoce si el ajuste conserva las capacidades multilingües del base o si está limitado al inglés del dataset.
- Longitud de contexto no documentada para este ajuste.
- Requiere `trust_remote_code` por la etiqueta `custom_code`, lo que implica ejecutar código del repositorio y revisarlo antes de cargar el modelo.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Sesgos conocidos: no disponibles; no se documentan evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kisho00/furi-phi4-mini-Kaggle
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
