# Dnfs/Mangga-1-4B

## Resumen

Mangga-1-4B es un ajuste fino (fine-tuning) del modelo Gemma 3 4B Instruct de Google, desarrollado por Denny Firmansyah Suwardi y un equipo de supervisión de la Universidad (Mohammad Yani, Muhamad Mustamiin, Robieth Sohiburoyyan y Vera Wati). El objetivo del modelo es adaptar un modelo generalista de 4.300 millones de parámetros al idioma indonesio y, de forma más específica, al conocimiento local de Indramayu, ciudad conocida como *Kota Mangga* (Ciudad del Mango). El ajuste se realizó mediante LoRA con el framework Unsloth, lo que reduce los requisitos de memoria durante el entrenamiento.

El modelo se distribuye en dos formatos: un modelo fusionado (merged) en precisión de 16 bits listo para usar con `transformers`, y un adaptador LoRA separado que debe cargarse sobre el checkpoint base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`. La licencia declarada es Apache 2.0, heredada del modelo base de Google.

La relevancia del modelo es acotada: se trata de un ajuste de nicho orientado a una región concreta de Indonesia, sin benchmarks publicados ni métricas de evaluación en la información disponible. Su interés principal radica en el contexto de investigación sobre lenguas locales indonesias (Basa Dermayu) y en servir como ejemplo práctico de ajuste LoRA de bajo coste sobre Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B Instruct), ajuste LoRA sobre el checkpoint base |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 3 4B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el modelo fusionado se distribuye en 16 bits; el adaptador LoRA se puede cargar sobre el base en bnb-4bit) |
| Idiomas soportados | Indonesio (`id`); foco en conocimiento local de Indramayu y lengua Dermayu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, concretamente del checkpoint cuantizado en 4 bits `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) usando el framework Unsloth, que optimiza el uso de memoria y acelera el entrenamiento de adaptadores de bajo rango. El resultado final se fusionó con los pesos base para producir un modelo en 16 bits, y también se conserva el adaptador LoRA por separado para cargarlo con PEFT.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El objetivo declarado es adaptar el modelo a tareas en indonesio y a conocimiento local de Indramayu. No se documentan innovaciones técnicas adicionales más allá del uso de Unsloth y LoRA. El trabajo se enmarca en la publicación "Tourism-Dermayon: A Basic Model for Development of Basa Dermayu Language Model" (iCAST-SS 2025).

## Capacidades

- Generación de texto conversacional en indonesio, con plantilla de chat (`apply_chat_template`).
- Respuesta a preguntas sobre conocimiento local de Indramayu (por ejemplo, sobre el apodo *Kota Mangga* o sobre autoridades locales).
- Ajuste orientado a la lengua Dermayu y a contenidos turísticos de la región.
- Hereda las capacidades generales del modelo base Gemma 3 4B Instruct (razonamiento básico, generación de texto), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el modelo declara únicamente indonesio; no se documenta el comportamiento en otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente local en Indramayu: el modelo puede gestionar conversaciones multi-turno en indonesio sobre servicios municipales o turísticos, usando la plantilla de chat del modelo base.
- Asistente turístico regional: responder preguntas sobre la *Kota Mangga*, rutas, cultura local y lengua Dermayu, aprovechando el ajuste específico sobre conocimiento local.
- Chatbot educativo sobre lengua y cultura Dermayu: apoyo a materiales didácticos o divulgación de la lengua local en entornos escolares.
- Punto de partida para investigación en lenguas minoritarias de Indonesia: el adaptador LoRA puede reutilizarse y combinarse con otros datasets para experimentos académicos.
- Prototipado rápido de asistentes conversacionales en indonesio: al ser un modelo de 4B en 16 bits, se puede desplegar en una GPU de gama media para demos y pruebas de concepto.
- Generación de contenido divulgativo local: redacción de textos breves sobre Indramayu para webs municipales o folletos turísticos, con revisión humana posterior.
- Base para ajustes posteriores: el adaptador LoRA sirve como punto de partida para nuevos fine-tunings sobre Gemma 3 4B en dominios relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en 16 bits requiere aproximadamente 8,6 GB de pesos, por lo que se recomienda al menos 10-12 GB de VRAM para inferencia con margen para el contexto.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para despliegues con mayor throughput; una RTX 3060 de 12 GB o similar puede ser suficiente para pruebas en 16 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM en 16 bits; con cuantización adicional (no documentada en la model card) podría reducirse el requisito.
- Opciones de despliegue: `transformers` con `device_map="auto"` y PEFT para el adaptador; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangga-1-4B | 4.300 M | no disponible | Indonesio | Apache 2.0 | Hugging Face (repo público) |
| google/gemma-3-4b-it | 4.000 M (aprox.) | no disponible en la información | Multilingüe | Gemma Terms of Use | Hugging Face |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4.000 M (aprox.) | no disponible en la información | Multilingüe | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un ajuste sobre Gemma 3, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado; el ajuste sobre conocimiento local de Indramayu no garantiza precisión factual sobre autoridades o datos actuales.
- Limitaciones de contexto e idioma: el modelo declara únicamente indonesio; no se documenta su rendimiento en otros idiomas ni la longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el modelo base Gemma 3 está sujeto a los Gemma Terms of Use; conviene verificar la compatibilidad para uso comercial.
- Caveats para producción: no hay benchmarks, no hay evaluación de calidad publicada, el repositorio tiene 0 descargas y 0 likes, y la fecha de actualización es posterior a la de creación; se recomienda validación exhaustiva antes de cualquier despliegue.
- El adaptador LoRA debe cargarse con el checkpoint base exacto (`unsloth/gemma-3-4b-it-unsloth-bnb-4bit`); un desajuste puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dnfs/Mangga-1-4B
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Modelo original de Google: https://huggingface.co/google/gemma-3-4b-it
- Paper de referencia (DOI): https://doi.org/10.2991/978-94-6463-938-4_65
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
