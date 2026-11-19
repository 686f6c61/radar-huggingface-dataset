# chimbiwide/Gemma3NPC-4B-pre-thinking

## Resumen

Gemma3NPC-4B-pre-thinking es un ajuste fino (fine-tuning) del modelo base google/gemma-3-4b-pt, desarrollado por el usuario chimbiwide (vinculado al repositorio KeeganCarey/Post-Thinking-AIIDE). Se trata de un modelo multimodal de tipo image-text-to-text orientado a la interpretación de personajes no jugadores (NPC) en entornos de rol conversacional, entrenado sobre el dataset chimbiwide/AIIDE-PRE-THINKING y presentado junto a un artículo aceptado en AIIDE-2026.

El modelo emplea la arquitectura Gemma 3 de Google, con 4.300.079.472 parámetros totales (aproximadamente 4,3 mil millones), y conserva la capacidad de procesar texto e imágenes del modelo base. Su rasgo distintivo es que genera un bloque de razonamiento interno delimitado por ` thinking...` antes de emitir la respuesta visible al usuario, lo que el autor denomina comportamiento de "pre-thinking".

Es relevante ahora como ejemplo práctico de razonamiento explícito aplicado a agentes conversacionales con rol definido, y por su disponibilidad en formato GGUF para despliegue local. El modelo es de nicho y de reciente publicación, con muy poca adopción registrada (8 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), basada en google/gemma-3-4b-pt |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible en repositorio aparte (chimbiwide/Gemma3NPC-4B-pre-thinking-GGUF); niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use, con acceso condicionado en Hugging Face) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-pt, un transformer multimodal de la familia Gemma 3 de Google que procesa entradas de texto e imagen. Sobre esta base, el autor ha aplicado un ajuste fino supervisado empleando el dataset chimbiwide/AIIDE-PRE-THINKING. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, por lo que esos datos no están disponibles.

La innovación declarada es de comportamiento, no de arquitectura: el modelo aprende a emitir un bloque ` thinking...` de planificación interna antes de la respuesta conversacional, siguiendo el patrón recomendado en el system prompt. No se documentan en la información proporcionada técnicas como RLHF, DPO, decodificación especulativa ni mecanismos de atención lineal. El repositorio incluye una demo de uso y una publicación (DOI 10.1609/aiide.v22i1.43599) que describe el enfoque.

## Capacidades

- Generación de texto conversacional con rol de personaje (roleplay) definido mediante system prompt.
- Razonamiento interno explícito: produce un bloque ` thinking...` con la planificación de la intención antes de cada réplica.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base Gemma 3.
- Interpretación de instrucciones estructuradas con marcadores de posición para nombre, trasfondo y ubicación del personaje.
- Conversación multi-turno con reacción al contenido y a la intención del jugador.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: parcial, limitado al bloque de planificación previa a la respuesta.
- Capacidades multilingües: únicamente inglés declarado.

## Casos de uso

- NPC conversacional en videojuegos: el modelo mantiene un rol de personaje con trasfondo y ubicación definidos en el system prompt, y el bloque `` permite auditar la intención del personaje antes de mostrar el diálogo al jugador.
- Prototipado rápido de diálogos de rol: el formato de system prompt documentado (nombre, background, localización) permite generar personajes distintos sin reentrenar, útil en fases de diseño de juegos narrativos.
- Investigación en razonamiento previo a la respuesta: sirve como modelo de referencia para comparar estrategias de "pre-thinking" frente a "post-thinking" en agentes conversacionales, tal como plantea el artículo asociado.
- Evaluación de pipelines multimodales ligeros: con 4,3 mil millones de parámetros y pesos safetensors, es viable para experimentos de image-text-to-text sin infraestructura de gran escala.
- Despliegue local en demos y pruebas de concepto: la disponibilidad de cuantizaciones GGUF permite ejecutarlo en hardware de consumo para validar la calidad del diálogo antes de escalar.
- Generación de contenido narrativo asistida: guionizado de respuestas de personajes coherentes con su trasfondo, aprovechando la planificación interna para mantener consistencia de tono y vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa para un modelo de 4,3 mil millones de parámetros, los pesos en safetensors ocupan del orden de 8,6 GB en precisión de 16 bits; el tamaño total del repositorio es de 17,2 GB, lo que incluye múltiples ficheros. Las cuantizaciones GGUF reducen el requisito de memoria, pero los niveles concretos no están documentados en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo en 16 bits requiere GPUs con al menos 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 40 GB); con cuantización GGUF podría ejecutarse en GPUs de consumo con 8-12 GB de VRAM, aunque esto no está confirmado en la información disponible.
- Cabe en consumer GPU: previsiblemente con cuantización GGUF, pero no confirmado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag en el modelo y endpoints compatibles) y llama.cpp/Ollama a través de los GGUF del repositorio separado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-pre-thinking | 4.300.079.472 | no disponible | gemma | Hugging Face (safetensors + GGUF) | Ajuste fino para NPC con bloque de razonamiento previo |
| google/gemma-3-4b-pt | 4,3 mil millones (aprox.) | no disponible en la informacion | gemma | Hugging Face | Modelo base multimodal; sin comportamiento de rol ni pre-thinking |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparables |

No se dispone de resultados de benchmarks del modelo ni de alternativas directas verificables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no documentados por el autor; al derivar de Gemma 3, puede heredar sesgos del modelo base.
- Alucinación: riesgo inherente a modelos generativos; el bloque ` thinking...` no garantiza la veracidad del contenido y podría aumentar la longitud de salida.
- Contexto: la longitud máxima de contexto no se especifica en la información disponible.
- Licencia: sujeta a los Gemma Terms of Use, con requisito de aceptación de la licencia de Google en Hugging Face; es necesario revisar las condiciones para uso comercial.
- Madurez: modelo de investigación con muy baja adopción (8 descargas, 0 likes); sin garantías de mantenimiento ni soporte.
- Entrenamiento especializado: orientado a roleplay de NPC, por lo que su rendimiento en tareas generales puede ser inferior al del modelo base.
- Reproducibilidad: no se detallan hiperparámetros de entrenamiento ni composición del dataset más allá del identificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking
- Cuantizaciones GGUF: https://huggingface.co/chimbiwide/Gemma3NPC-4B-pre-thinking-GGUF
- Repositorio del proyecto: https://github.com/KeeganCarey/Post-Thinking-AIIDE
- Artículo (DOI): https://doi.org/10.1609/aiide.v22i1.43599
- Conferencia AIIDE-2026: https://sites.google.com/view/aiide2026/home
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/AIIDE-PRE-THINKING
