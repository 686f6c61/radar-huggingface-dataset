# sky8100/Cricket-Stats-Qwen3.5-0.8B-GGUF

## Resumen

Cricket Stats Qwen3.5 0.8B (GGUF) es un modelo de lenguaje especializado en reescribir estadísticas de críquet verificadas en respuestas breves y llanas. Lo desarrolla el usuario sky8100 y deriva del modelo base Qwen/Qwen3.5-0.8B mediante un ajuste fino con LoRA (MLX sobre Apple Silicon), posteriormente fusionado y cuantizado a Q4_K_M con llama.cpp. Su propósito es alimentar la función opcional de respuestas "AI on this phone" de la aplicación Android StatYaar, ejecutándose completamente offline en el dispositivo.

El modelo no actúa como fuente de hechos: su tarea es reformular datos que recibe en el contexto (las estadísticas guardadas de un jugador) en una o dos frases, copiando los números exactamente. La aplicación valida cada cifra de la respuesta contra los datos guardados y, si alguna no coincide, muestra una respuesta propia en su lugar. Esta arquitectura de verificación externa es clave para su uso seguro.

Con 752.393.024 parámetros totales y un repositorio de 0,5 GB, es un modelo muy pequeño orientado a inferencia en dispositivo con llama.cpp. Se encuentra en estado de vista previa (v5) y el autor anuncia una v6 entrenada con preguntas más realistas. Por su tamaño, licencia Apache-2.0 y enfoque en un dominio vertical concreto, resulta relevante para quienes estudian modelos especializados de bolsillo con salvaguardas de fidelidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (detalles internos del base no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en, hi (hindi e Hinglish mas debiles segun el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (Apache-2.0) y se ajusta con LoRA usando MLX en Apple Silicon; después se fusiona y se cuantiza a Q4_K_M con llama.cpp. No se detalla en la información disponible la arquitectura interna exacta del base (número de capas, dimensiones, mecanismos de atención) ni la longitud de contexto nativa.

Los datos de entrenamiento son ejemplos sintéticos generados por código a partir de perfiles de jugadores inventados (sin datos de usuarios reales ni datos personales), complementados con preguntas y respuestas de coaching filtradas del dataset sahilml/cricket (Apache-2.0). No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. El autor reporta una comprobación interna de fidelidad numérica sobre preguntas sintéticas reservadas: en torno al 98-99% de las respuestas usaron únicamente números presentes en los hechos proporcionados.

## Capacidades

- Generación de texto breve: reescribe hechos dados en respuestas de 1 a 3 frases.
- Fidelidad numérica: copia las cifras exactamente tal como aparecen en el contexto.
- Gestión de datos ausentes: indica cuándo una estadística no está disponible.
- Rechazo de peticiones fuera de alcance: declina predicciones, apuestas, preguntas médicas y de opinión.
- Conversación: pipeline de text-generation con uso conversacional en la aplicación.
- Multilingüe limitado: inglés como idioma principal; hindi e Hinglish con menor calidad.
- No dispone de tool calling, function calling, agentes, visión ni audio según la información disponible.
- No se documenta modo de razonamiento extendido (thinking mode).

## Casos de uso

- Respuestas offline en la app StatYaar: el modelo reformula las estadísticas guardadas de un jugador en una o dos frases dentro de la aplicación Android, funcionando sin conexión gracias a llama.cpp y al archivo Q4_K_M de 529 MB.
- Resumen de fichas de jugador: convierte un conjunto de métricas (promedios, carreras, wickets) en una explicación legible para el usuario final, manteniendo las cifras intactas.
- Verificación de fidelidad numérica en pipelines: sirve como componente de un sistema donde una capa externa compara cada número de la respuesta con la fuente, descartando respuestas que no coincidan.
- Asistente de consulta de estadísticas con contexto controlado: útil cuando los hechos se inyectan en el prompt y se requiere una salida concisa en lugar de generación libre.
- Aplicaciones móviles de bajo consumo: su tamaño permite empaquetarlo en dispositivos consumer sin GPU dedicada, con inferencia en CPU mediante llama.cpp.
- Filtro de conversación fuera de dominio: demuestra el rechazo de preguntas de apuestas, predicciones o consejo médico en un asistente deportivo, patrón reutilizable en otros dominios verticales.
- Base para ajustes finos verticales: por su licencia Apache-2.0 y su tamaño, puede servir como punto de partida para otros dominios con datos estructurados y necesidad de fidelidad numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado por el autor es una comprobación interna de fidelidad numérica sobre preguntas sintéticas reservadas, con aproximadamente un 98-99% de respuestas que usaron solo números presentes en los hechos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 529.297.120 bytes (unos 0,49 GB); la inferencia cabe holgadamente en memoria de dispositivos móviles y en GPUs consumer, aunque no se publican cifras de VRAM medidas.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (por ejemplo RTX 3060 o superior) es sobradamente suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU y en dispositivos móviles.
- Opciones de despliegue: llama.cpp es el entorno previsto por el autor; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa. A continuación se comparan características objetivas con modelos de tamaño y propósito similares.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Cricket Stats Qwen3.5 0.8B | 752.393.024 | no disponible | Apache-2.0 | GGUF Q4_K_M | Vertical de críquet, reescritura de estadísticas con verificación numérica |
| Qwen/Qwen3.5-0.8B (base) | 0.8B (aprox.) | no disponible | Apache-2.0 | safetensors y derivados | Modelo generalista multilingüe |
| Modelos generalistas de menos de 1B (por ejemplo, familias Llama o Gemma de tamaño similar) | <1B | variable | licencias propias | safetensors, GGUF | Uso general; sin especialización ni salvaguardas de dominio |

La diferencia principal frente a alternativas generalistas es la especialización: el modelo está entrenado para reformular hechos con fidelidad numérica y rechazar peticiones fuera de alcance, a costa de capacidad general y riqueza de redacción.

## Limitaciones y advertencias

- Modelo pequeño: la redacción puede resultar plana o repetitiva.
- Riesgo de invención de números: el autor advierte que puede inventar una cifra, por lo que las respuestas deben verificarse contra los hechos; no debe usarse como fuente de datos sin esa comprobación.
- Idiomas: inglés primero; hindi e Hinglish son más débiles.
- Estado de vista previa (v5): el autor anuncia una v6 que reemplazará el archivo actual, lo que implica posible inestabilidad de la versión publicada.
- Alcance restringido: no responde predicciones, apuestas, preguntas médicas ni de opinión; fuera de ese dominio su utilidad es limitada.
- Contexto: no se documenta la longitud de contexto, un riesgo para prompts largos con muchas estadísticas.
- Licencia Apache-2.0: permite uso comercial con atribución y conservación de avisos; el modelo incorpora datos de sahilml/cricket (Apache-2.0, modificados) que deben mantenerse atribuidos.
- Sin afiliación: no está afiliado ni respaldado por CricHeroes ni por ninguna federación de críquet; no debe presentarse como fuente oficial.
- Datos de entrenamiento sintéticos: los perfiles de jugadores son inventados, lo que limita la cobertura de casos reales hasta la llegada de la v6.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sky8100/Cricket-Stats-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset utilizado: https://huggingface.co/datasets/sahilml/cricket
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- MLX (framework de ajuste fino): https://github.com/ml-explore/mlx
