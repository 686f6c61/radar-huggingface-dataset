# Assaoka/Tucano2-qwen-0.5B-TaskAdd-W-Merge

## Resumen

Tucano2-qwen-0.5B-TaskAdd-W-Merge es un modelo de lenguaje de 490.799.104 parámetros (aproximadamente 0,5 mil millones) obtenido mediante la fusión de varios modelos derivados de la familia Tucano2, que a su vez parte de Qwen. Lo desarrolla el usuario Assaoka y se publica en Hugging Face bajo la librería transformers. El modelo no ha sido entrenado desde cero: es el resultado de aplicar la técnica de fusión TIES (Trim, Elect Sign & Merge) sobre un modelo base Tucano2-qwen-0.5B-Instruct y cinco modelos especializados en tareas concretas.

El objetivo declarado por el autor, a partir de los nombres de los modelos fusionados, es combinar capacidades de clasificación y análisis de texto: emociones (GoEmotions, BRIGHTER), análisis de sentimiento financiero (FinBERT), clasificación de frases (Phrasebank) y una tarea adicional denominada ReLiSA. La fusión busca agregar estas habilidades de "task-adding" sobre el modelo instructivo base sin reentrenar, un enfoque habitual para consolidar especialistas en un único checkpoint.

Es relevante ahora porque ilustra una práctica extendida en el ecosistema open source: construir modelos pequeños y especializados mediante mergekit en lugar de entrenar, lo que reduce costes y permite reutilizar especialistas existentes. No obstante, la información publicada es muy escasa: no hay datos de benchmarks, licencia explícita ni lista de idiomas, y el número de descargas y likes es cero, lo que indica que se trata de un experimento reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tag `qwen3`) |
| Parámetros totales | 490.799.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float16 según configuración del merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión, no un entrenamiento. La arquitectura subyacente es un transformer de la familia Qwen3 con unos 0,5 mil millones de parámetros, heredada del modelo base Tucano2-qwen-0.5B-Instruct. La fusión se realizó con mergekit usando el método TIES, que recorta los parámetros menos relevantes de cada modelo fuente, resuelve los conflictos de signo entre ellos y combina los pesos de forma normalizada. La configuración usa `normalize: true` e `int8_mask: true`, con dtype float16.

Los cinco modelos fusionados son Tucano2-qwen-0.5b-GoEmotions, Tucano2-qwen-0.5b-GoEmotions-BRIGHTER, Tucano2-qwen-0.5b-Merge2-ReLiSA, Tucano2-qwen-0.5b-Merge3-Phrasebank y Tucano2-qwen-0.5b-Merge4-FinBERT. Cuatro de ellos reciben un peso de 0,1 y densidad 0,5; el modelo derivado de FinBERT recibe un peso de 0,6 y densidad 0,5. No se dispone de información sobre los datos de entrenamiento originales, el número de tokens, ni si hubo RLHF o DPO en las etapas previas. Tampoco se documenta ninguna innovación técnica adicional más allá del propio proceso de fusión.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instructivo Qwen3.
- Clasificación y detección de emociones, por la incorporación de los especialistas GoEmotions y BRIGHTER.
- Análisis de sentimiento en el dominio financiero, por la fusión con el derivado de FinBERT (con peso dominante de 0,6).
- Clasificación de frases y tareas relacionadas, por el especialista Phrasebank.
- Capacidad adicional de la tarea ReLiSA, según la nomenclatura del autor; su naturaleza concreta no está documentada.
- Soporte de tool calling y function calling: no disponible en la información publicada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de sentimiento en reseñas financieras: el peso dominante del especialista derivado de FinBERT permite clasificar opiniones de usuarios sobre productos financieros o noticias de mercado, aprovechando la fusión para tareas de polarity detection en textos económicos.
- Moderación de comunidades y detección de emociones: la incorporación de GoEmotions y BRIGHTER permite etiquetar comentarios según categorías emocionales, útil en foros o redes sociales para priorizar revisiones humanas.
- Clasificación de frases en pipelines de NLP: el especialista Phrasebank aporta capacidad para tareas de clasificación textual genérica, que puede integrarse en flujos de etiquetado automático de documentos.
- Prototipado rápido de asistentes conversacionales: al partir de un modelo instructivo de 0,5B, cabe en hardware modesto y sirve para validar interfaces de chat antes de migrar a modelos mayores.
- Experimentación académica con técnicas de fusión: el modelo es un caso de estudio reproducible de TIES con mergekit, útil para investigar cómo interactúan especialistas de distintas tareas al fusionarse.
- Despliegue en entornos con recursos limitados: con 490 millones de parámetros y pesos en float16, puede ejecutarse en GPU de consumo para tareas de inferencia de baja latencia en local.
- Filtrado previo en pipelines de datos: puede usarse como clasificador ligero para descartar o etiquetar grandes volúmenes de texto antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, los 490,8 millones de parámetros ocupan aproximadamente 1 GB de pesos; con overhead de activaciones y caché KV, se estima un uso de entre 1,5 y 3 GB según longitud de contexto y batch.
- En cuantización de 8 bits, el peso se reduce a unos 0,5 GB; en 4 bits, a unos 0,25 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; también es compatible con llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tucano2-qwen-0.5B-TaskAdd-W-Merge | 490,8 M | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face, ampliamente usado |
| Tucano2-qwen-0.5B-Instruct (modelo base) | ~0,5 B | no disponible | no disponible | Hugging Face |
| SmolLM2-360M-Instruct | ~360 M | 8 192 tokens (según documentación pública) | Apache 2.0 (según documentación pública) | Hugging Face |

La comparación con Qwen2.5-0.5B-Instruct y SmolLM2-360M-Instruct se ofrece como referencia de categoría por tamaño; los datos de contexto y licencia de esos modelos provienen de su documentación pública y no de la información proporcionada para este modelo. No se dispone de datos de rendimiento comparativo para el modelo evaluado.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se documentan los idiomas soportados; el nombre "Tucano" sugiere un enfoque en portugués, pero no está confirmado.
- Al ser una fusión de especialistas de clasificación sobre un modelo instructivo, es probable que el rendimiento en generación abierta se degrade respecto al modelo base; no hay evaluación que lo confirme.
- Riesgo de alucinación inherente a los modelos de 0,5B, agravado por la falta de benchmarks y de validación comunitaria (0 descargas, 0 likes).
- La fusión con pesos desiguales (0,6 para el derivado de FinBERT) puede sesgar el comportamiento hacia tareas financieras en detrimento de otras capacidades.
- No hay información sobre sesgos conocidos ni sobre la composición de los datos de entrenamiento originales.
- La fecha de creación indicada (2026-11-26) es posterior a la fecha actual, lo que puede indicar un error en los metadatos del repositorio.
- No se publican pesos cuantizados ni versiones GGUF, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TaskAdd-W-Merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método TIES: https://arxiv.org/abs/2306.01708
