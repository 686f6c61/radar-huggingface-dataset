# Bertieaux/qwen3.5-hermes

## Resumen

Bertieaux/qwen3.5-hermes es un repositorio alojado en Hugging Face bajo el identificador de usuario Bertieaux, con licencia MIT y etiquetado para la región US. El nombre sugiere un modelo derivado o ajustado a partir de la familia Qwen 3.5 combinado con la estética o el formato de instrucciones de la familia Hermes, aunque la model card publicada no aporta ninguna confirmación técnica sobre su origen, arquitectura o proceso de entrenamiento. A fecha de creación del repositorio (27 de octubre de 2026) no registra descargas ni interacciones, lo que indica que se trata de una publicación reciente y sin validación por parte de la comunidad.

La información disponible es extremadamente limitada: la model card contiene únicamente el campo de licencia, sin descripción, sin especificaciones de arquitectura, sin datos de entrenamiento y sin resultados de evaluación. No se puede confirmar el tamaño del modelo, la longitud de contexto, los idiomas soportados ni el formato de los pesos a partir de los metadatos públicos. Cualquier evaluación rigurosa requeriría inspeccionar directamente los archivos del repositorio, algo que esta ficha no puede cubrir con la información proporcionada.

Por tanto, esta ficha documenta lo que se sabe con certeza (identificador, autor, licencia, fechas y ausencia de métricas de adopción) y marca explícitamente como "no disponible" todo aquello que la model card no declara. Es relevante ahora únicamente como registro de un artefacto emergente sin validar, no como una opción recomendable para producción sin una auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos disponibles. El nombre "qwen3.5-hermes" sugiere una posible relación con la familia Qwen 3.5 (arquitectura transformer densa o MoE, según la variante) y con el formato de instrucciones Hermes, pero no existe confirmación documental de que se trate de un fine-tuning, una fusión de pesos, una destilación o un entrenamiento desde cero. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

La ausencia de estos datos impide evaluar la calidad del ajuste, la posible contaminación del dataset o la idoneidad del modelo para tareas concretas. Cualquier uso en producción debería ir precedido de una inspección de los archivos del repositorio (config.json, tokenizer_config.json, tamaño de los shards de safetensors) y de una batería de pruebas propias.

## Capacidades

- Generación de texto: no confirmada por la model card, aunque es esperable en un modelo de la familia Qwen.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está declarado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación exploratoria en investigación: cargar el modelo en un entorno aislado para inspeccionar su tokenizer, su configuración y su comportamiento en prompts de prueba, dado que la model card no documenta nada.
- Pruebas de formato de instrucciones: si el sufijo "hermes" implica un formato de chat concreto, se podría validar su adherencia a plantillas tipo ChatML o similares antes de integrarlo en un pipeline.
- Prototipado interno no crítico: usar el modelo como generador de borradores en herramientas de desarrollo, siempre con revisión humana y sin exposición a usuarios finales.
- Benchmarking comparativo propio: incluirlo en una batería de evaluación interna junto a otros modelos de la misma familia para medir su rendimiento real, ya que no hay cifras publicadas.
- Estudio de licencias y trazabilidad: analizar el repositorio como caso de publicación con licencia MIT pero sin documentación técnica, útil para discutir buenas prácticas en el ecosistema open source.
- Fine-tuning posterior: si los pesos son compatibles con la familia Qwen, podría servir como base para un ajuste específico, pero solo tras verificar el tamaño y la arquitectura reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible, aunque si los pesos fuesen safetensors estándar podrían convertirse a GGUF con herramientas habituales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bertieaux/qwen3.5-hermes | no disponible | no disponible | MIT | Hugging Face, sin descargas |
| Qwen 3.5 (familia oficial) | no disponible en esta ficha | no disponible | según variante | Hugging Face oficial |
| Hermes (familia NousResearch) | no disponible en esta ficha | no disponible | según variante | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar arquitectura, tamaño, contexto ni datos de entrenamiento.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluaciones publicadas.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas soportados sin declarar: no se puede garantizar un rendimiento aceptable en castellano.
- Licencia MIT permite uso comercial, pero la falta de trazabilidad sobre el origen de los pesos y los datos plantea dudas sobre la cadena de derechos.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de validación externa.
- No recomendable para producción sin una auditoría técnica y legal previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bertieaux/qwen3.5-hermes
