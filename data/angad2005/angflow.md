# Angad2005/AngFlow

## Resumen

AngFlow es un modelo de lenguaje de 2 mil millones de parámetros especializado en escritura creativa, obtenido mediante fine-tuning supervisado (SFT) del modelo base Qwen3.5-2B-Base. Lo desarrolla el usuario Angad2005 y se distribuye bajo licencia Apache 2.0 a través de Hugging Face. Su objetivo no es actuar como asistente de propósito general, sino transformar instrucciones de escritura en prosa narrativa coherente: ficción, desarrollo de tramas, descripción atmosférica y diálogo entre personajes.

El modelo hereda la arquitectura Qwen3.5 del modelo base, aunque la model card no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención). Está entrenado exclusivamente en inglés y se presenta como una herramienta para escritores, aplicaciones de generación de historias y experimentación en investigación sobre fine-tuning de modelos pequeños para tareas creativas.

Su relevancia actual es limitada pero concreta: demuestra el patrón de especialización de modelos pequeños mediante SFT sobre bases recientes, un enfoque cada vez más habitual para construir asistentes de dominio acotado que se ejecutan en hardware modesto. No obstante, el modelo es muy reciente (publicado en noviembre de 2026), cuenta con cero descargas y un solo "like" en el momento de redactar esta ficha, y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, detalles internos no disponibles) |
| Parámetros totales | 2 mil millones |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato transformers; cuantización GGUF/AWQ no documentada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de Hugging Face Transformers; no se documentan otros) |

## Arquitectura y entrenamiento

AngFlow se construye sobre Qwen3.5-2B-Base, un transformer decoder-only de 2 mil millones de parámetros. La model card no especifica el número de capas, la dimensión del modelo, el tamaño del vocabulario ni la longitud de contexto nativa del modelo base; tampoco indica si emplea innovaciones como atención lineal, decodificación especulativa o mezcla de expertos. El proceso de adaptación consiste en un fine-tuning supervisado (SFT) sobre un conjunto curado de ejemplos de instrucción y respuesta orientados a escritura creativa, con el objetivo de mejorar la coherencia narrativa y el seguimiento de instrucciones de estilo.

No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El autor indica explícitamente que los detalles de configuración y del dataset "se documentarán a medida que el proyecto evolucione", por lo que la información de entrenamiento es en este momento incompleta y no verificable de forma independiente.

## Capacidades

- Generación de ficción: relatos cortos y narrativa de formato largo en géneros como misterio, thriller, fantasía y ciencia ficción.
- Desarrollo narrativo: continuación de escenas, construcción de trama, progresión narrativa y gestión de conflicto y suspense.
- Escritura descriptiva: descripciones atmosféricas, detalles sensoriales y del entorno, monólogos internos y world-building.
- Diálogo y caracterización: conversaciones naturales entre personajes, voces diferenciadas y diálogo como motor de la historia.
- Seguimiento de instrucciones de escritura: género, estilo, perspectiva narrativa (primera o tercera persona), tono, estructura y límites de extensión.
- Generación en inglés exclusivamente; no se declara soporte multilingüe.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo "thinking", visión ni audio.

## Casos de uso

- Generación de relatos por encargo: un usuario describe género, premisa y tono, y el modelo produce un borrador de ficción de entre 500 y 1500 tokens, adecuado para talleres literarios o prototipado rápido de ideas.
- Herramientas de escritura asistida para autores: integración en editores que ofrezcan continuación de escena o sugerencias de desarrollo de personaje, aprovechando la especialización en narrativa del modelo.
- Brainstorming de tramas y personajes: generación de variantes argumentales, conflictos y arcos de personaje para que el escritor seleccione y refine manualmente.
- Aplicaciones de entretenimiento conversacional: motores de historias interactivas o ficción ramificada donde el modelo genera segmentos narrativos a partir de elecciones del usuario.
- Investigación sobre fine-tuning de modelos pequeños: AngFlow sirve como caso de estudio reproducible de SFT sobre una base de 2B para una tarea de dominio acotado, con licencia permisiva.
- Previsualización de estilo y tono: generación de pasajes de prueba en distintos registros (gótico, noir, épico) para decidir la dirección estilística de un proyecto antes de escribir.
- Prototipado de asistentes de escritura para desarrolladores: al ser un modelo de 2B con licencia Apache 2.0, permite desplegar demos locales de bajo coste sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones formales se añadirán cuando estén completas y propone dimensiones de evaluación cualitativas (coherencia narrativa, originalidad, consistencia de personajes, calidad descriptiva, naturalidad del diálogo, adherencia a instrucciones y consistencia estilística), sin aportar métricas ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4-5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 2-3 GB de pesos; a 4 bits, alrededor de 1,5-2 GB, aunque el autor no publica versiones cuantizadas ni confirma compatibilidad con llama.cpp o GGUF.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) debería poder ejecutar el modelo en fp16 o 8 bits; para producción con concurrencia, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, dado el tamaño de 2B parámetros.
- Opciones de despliegue: Hugging Face Transformers con `accelerate` y `device_map="auto"` es la vía documentada por el autor. vLLM, TGI, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

Nota: el snippet de la model card emplea `AutoModelForMultimodalLM` y `AutoProcessor`, lo que resulta llamativo para un modelo de texto; conviene verificar la clase correcta (`AutoModelForCausalLM`) al cargar los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AngFlow | 2B | no disponible | Escritura creativa (SFT) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-2B-Base | 2B | no disponible | Propósito general (base) | no disponible en la información | Hugging Face (modelo base) |
| Modelos de escritura creativa de 2-3B | variable | variable | Escritura creativa | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría. La comparación más directa y verificable es con su propio modelo base, Qwen3.5-2B-Base, del que AngFlow hereda arquitectura y tamaño pero del que se diferencia por el fine-tuning supervisado en tareas narrativas.

## Limitaciones y advertencias

- Modelo pequeño (2B): presenta las limitaciones típicas de esta escala, con mayor propensión a inconsistencias narrativas, repeticiones y patrones argumentales predecibles.
- La narrativa de formato largo puede requerir múltiples generaciones y edición humana; no se garantiza coherencia en textos extensos.
- Puede generar información ficticia presentada con apariencia de hecho; no debe usarse como fuente de conocimiento factual.
- Entrenado exclusivamente en inglés; no hay soporte declarado para castellano ni otros idiomas.
- No se documentan sesgos conocidos, pero al derivar de un modelo base entrenado con datos web es previsible que herede sesgos sociales y culturales no evaluados.
- Riesgo de alucinación relevante en contextos donde se le pida información verificable en lugar de ficción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el contenido generado ni sobre la originalidad de las salidas.
- El contenido generado debe revisarse por calidad, originalidad y adecuación antes de su publicación.
- El modelo es muy reciente y con nula tracción (0 descargas, 1 like); no hay validación independiente de su calidad ni de su reproducibilidad.
- El código de ejemplo de la model card usa clases potencialmente incorrectas para un modelo de texto, lo que puede dificultar la carga directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angad2005/AngFlow
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
