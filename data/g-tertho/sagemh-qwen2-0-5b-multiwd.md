# g-tertho/sagemh-qwen2-0.5b-multiwd

## Resumen

SAGEMH Qwen2-0.5B MultiWD Spiritual Wellness es un modelo de clasificación binaria especializado en detectar la dimensión de bienestar espiritual en publicaciones de redes sociales en inglés. Lo desarrolla g-tertho (Tertho Ghosh) como parte de la tesis SAGEMH, un marco de clasificación de salud mental basado en recuperación y ensamblado con modelos de lenguaje pequeños. El modelo parte de Qwen2-0.5B, un transformer decoder-only de 494 millones de parámetros, y se distribuye como un merge completo de un adaptador LoRA en los pesos base.

La tarea concreta es responder a la pregunta "Does the spiritual wellness dimension exist in the post?" devolviendo una etiqueta `Yes` o `No` seguida de una breve justificación generada. No es un chatbot de salud mental ni un asistente conversacional general: es un clasificador de una sola dimensión dentro de un conjunto más amplio de dimensiones de bienestar (MultiWD). Su relevancia radica en que demuestra que un modelo de 0,5B parámetros, ajustado con LoRA, puede alcanzar un F1 ponderado de 80,90 en una tarea de clasificación de texto social, con un coste computacional mínimo.

El modelo se publicó en noviembre de 2026 con licencia Apache-2.0, está entrenado exclusivamente en inglés y su contexto efectivo de entrenamiento se limita a 512 tokens. Su utilidad práctica es acotada pero clara: filtrado y anotación automática de corpus de redes sociales para investigación en salud mental y bienestar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usa longitud de corte de 512 tokens |
| Tipos de cuantización | no disponible (el autor publica los pesos en float16; al ser un modelo transformers estándar admite cuantización con herramientas externas como bitsandbytes o GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2-0.5B: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. Sobre esta base se aplicó un adaptador LoRA de rango 16, alpha 32, dropout 0,05, en todas las proyecciones lineales. Posteriormente el adaptador se fusionó (merge) en los pesos base y se guardó en float16, de modo que el repositorio contiene un modelo denso convencional sin dependencia de PEFT en inferencia.

El entrenamiento usó el split binario de MultiWD para la dimensión de bienestar espiritual: 5 épocas, learning rate 2e-4, scheduler coseno, batch efectivo de 16 (4 x 4), precisión bf16, semilla 42, longitud de corte de 512 y un 5% del split de entrenamiento reservado para validación. Se usó la última época sin early stopping. El conjunto de test tiene n = 2441 con semilla de split 42. La evaluación se hizo con decodificación greedy (`do_sample=False`), máximo 64 tokens nuevos y la plantilla de chat de Qwen2. No se documenta en la información disponible el volumen total de tokens de entrenamiento ni la composición detallada del dataset MultiWD más allá de su procedencia.

## Capacidades

- Clasificación binaria de la dimensión de bienestar espiritual en publicaciones de redes sociales en inglés, con salida `Yes`/`No` seguida de una justificación breve.
- Generación de texto autoregresiva básica heredada de Qwen2-0.5B, limitada en práctica por el ajuste específico a la tarea.
- Formato conversacional mediante la plantilla de chat de Qwen2 (`apply_chat_template`), con prompt de usuario que incluye la publicación y la pregunta.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Soporte multilingüe limitado al inglés; no se documenta transferencia a otros idiomas.
- No incluye visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Anotación automática de corpus de investigación en salud mental: el modelo puede etiquetar miles de publicaciones en inglés con la dimensión de bienestar espiritual, reduciendo el coste de anotación manual en estudios que replican el marco MultiWD.
- Filtrado previo en pipelines de análisis de redes sociales: dado su tamaño reducido, se puede ejecutar sobre grandes volúmenes de texto para separar publicaciones candidatas antes de un análisis más profundo con modelos mayores.
- Replicación y validación de la tesis SAGEMH: investigadores pueden reproducir las predicciones del modelo publicado y compararlas con las predicciones congeladas de la tesis, que difieren en solo 2 de 2441 filas.
- Prototipado rápido de clasificadores de bienestar: sirve como línea base de bajo coste para comparar contra modelos mayores en la misma tarea de clasificación binaria.
- Despliegue en entornos con recursos limitados: con 494M parámetros en float16 (aproximadamente 1 GB de pesos), cabe en GPUs de consumo y en CPU para inferencia por lotes no interactiva.
- Generación de justificaciones para revisión humana: la salida incluye una breve rationale que un anotador puede usar como punto de partida, siempre con verificación posterior dado que el razonamiento no está validado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test de MultiWD para la dimensión de bienestar espiritual (n = 2441), con decodificación greedy y máximo 64 tokens nuevos:

| Métrica | Valor |
|---|---|
| F1 ponderado | 80,90 |
| F1 macro | 79,34 |
| Exactitud balanceada | 79,30 |
| Exactitud | 80,91 |
| MCC | 0,5868 |

El autor indica que el modelo fusionado difiere de las predicciones congeladas de la tesis en 2 de 2441 filas (F1 ponderado 80,90 frente a 80,81 en la tesis), diferencia atribuida al redondeo en float16 y al batching. No se han publicado en la información disponible comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1 GB para los pesos, más overhead de activaciones y KV cache; en la práctica cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovecha las GPU de gama alta por su tamaño.
- Cabe en GPU de consumo sin problema; también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (método documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; al ser un modelo transformers estándar en safetensors, admite conversión a GGUF para llama.cpp u Ollama, aunque el autor no la proporciona.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos de la misma tarea en la información proporcionada. Como referencia estructural, se compara con su base y con un modelo mayor de la misma familia:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| SAGEMH Qwen2-0.5B MultiWD | 494M | 512 tokens de entrenamiento | Clasificación binaria de bienestar espiritual | Apache-2.0 |
| Qwen2-0.5B (base) | 494M | no disponible | Generación de texto general | Apache-2.0 |
| Qwen2-1.5B | 1.500M (aprox.) | no disponible | Generación de texto general | Apache-2.0 |

No se conocen modelos comparables específicos para la dimensión de bienestar espiritual de MultiWD en la información disponible.

## Limitaciones y advertencias

- El modelo devuelve una etiqueta binaria y una justificación generada; la justificación no está verificada y puede contener afirmaciones incorrectas.
- Entrenado exclusivamente con texto de redes sociales en inglés; no se garantiza su transferencia a texto clínico ni a otros idiomas.
- No es una herramienta de diagnóstico; cualquier uso en contextos de salud mental debe tratarse como señal auxiliar, nunca como evaluación clínica.
- Los datos de entrenamiento no se redistribuyen; el uso queda sujeto a los términos originales de MultiWD, que pueden imponer restricciones adicionales a la licencia Apache-2.0 del modelo.
- El contexto de entrenamiento se limita a 512 tokens, por lo que publicaciones más largas pueden truncarse y perder información relevante.
- Riesgo de sesgo heredado de Qwen2-0.5B y del corpus MultiWD, no cuantificado en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en producción ni validación independiente.
- Licencia Apache-2.0 permite uso comercial, pero la restricción sobre los datos de entrenamiento debe revisarse antes de cualquier despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-tertho/sagemh-qwen2-0.5b-multiwd
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Cita de la tesis SAGEMH: Ghosh, Tertho y Sweety, Fahmida (2026), "SAGEMH: A Retrieval-Grounded, Ensembled Framework for Mental Health Classification from Social Media Text Data with Small Language Models" (sin enlace disponible en la información proporcionada)
