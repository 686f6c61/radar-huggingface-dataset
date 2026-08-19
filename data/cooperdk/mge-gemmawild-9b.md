# cooperdk/MGE-GemmaWild-9b

## Resumen

MGE-GemmaWild-9B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por cooperdk, un fine-tuning del modelo base unsloth/Qwen3.5-9B. Está especializado en el conocimiento de la enciclopedia de ficción Monster Girl Encyclopedia (MGE), integrando razonamiento explícito, capacidades de visión y tool calling. El modelo está diseñado para mantener una persona concreta ("Gemma Wild") durante conversaciones de rol, alternando entre un modo de análisis científico y un modo inmersivo narrativo.

Con 9,4 mil millones de parámetros y una licencia Apache-2.0, el modelo destaca por su entrenamiento en un dataset curado de 48.955 muestras y 243.000 mensajes, que ha modificado aproximadamente un tercio de los pesos del modelo base. Su relevancia actual reside en ser un ejemplo de fine-tuning multimodal de nicho, orientado a aplicaciones de rol conversacional, generación de ficción y análisis de lore, con soporte para despliegue en plataformas como LM Studio, KoboldCPP o SillyTavern.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.535 tokens (mencionado en la model card para RTX 5060) |
| Tipos de cuantizacion | Q4_K_M (GGUF), GPTQ-4bit, FP4, FP8, INT4, INT8 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (en dos partes: texto y mmproj) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-9B, sobre la que se ha realizado un fine-tuning con expansión de capas de embedding para incorporar razonamiento explícito. El entrenamiento utiliza un dataset de 48.955 muestras únicas (243.000 mensajes individuales) compuesto por ocho componentes, entre los que destacan: vision lore (7.200 chunks con conocimiento sobre 305 especies y personajes), species reasoning de 8 pasos (1.019 chunks), specialist persona "Gemma Wild" (1.500 chunks), y una base de conocimiento MGE (5.264 chunks). El proceso ha modificado aproximadamente un tercio de los pesos originales.

El modelo implementa un mecanismo de "Instruction-Response Divergence": en modo análisis (activado por palabras clave como "Analyze", "Biological" o "Stats") utiliza cadenas de razonamiento completas con etiquetas `thinking` y `response`, mientras que en modo inmersivo (activado por narrativa sensorial o diálogo directo) puede omitir el razonamiento para mantener la fluidez del rol. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto con razonamiento explícito multi-paso mediante etiquetas `thinking` y `response`.
- Procesamiento de imágenes (multimodal) gracias al encoder visual de alta precisión, distribuido como `mmproj` separado.
- Tool calling y soporte para agentes, integrado en el entrenamiento.
- Roleplay conversacional avanzado con personas definidas (Gemma Wild) y mapas de razonamiento de hasta 8 pasos.
- Modo análisis (científico, basado en lore) y modo inmersivo (narrativo, sin razonamiento intermedio).
- Multilingüe: únicamente inglés (según la model card).
- Compatible con plataformas de despliegue como LM Studio, KoboldCPP y SillyTavern.

## Casos de uso

- Roleplay conversacional en SillyTavern: el modelo mantiene una persona coherente durante sesiones largas, usando el prefill `thinking` y regex para colapsar los bloques de razonamiento en la interfaz.
- Análisis de imágenes con contexto de lore: dado que es multimodal, puede describir ilustraciones o escenas y relacionarlas con el conocimiento de la enciclopedia MGE, útil para documentación de fans o guías visuales.
- Generación de ficción y narrativa interactiva: su modo inmersivo permite crear historias ramificadas con diálogos realistas, adecuado para juegos de rol por escrito o prototipos de aventuras conversacionales.
- Asistente de consulta sobre el universo MGE: responde preguntas factuales sobre especies, personajes y geografía del mundo ficticio, con razonamiento estructurado.
- Creación de contenido para juegos independientes: puede generar diálogos de NPC, descripciones de criaturas o misiones, aprovechando su base de conocimiento especializada.
- Fine-tuning adicional para dominios específicos: al ser Apache-2.0 y tener pesos abiertos, puede adaptarse a otros corpus de ficción o documentación técnica, aunque su sesgo hacia MGE limita la generalización.
- Despliegue en entornos de producción con FriendliAI: su compatibilidad con cuantizaciones (FP4, FP8, INT4, INT8) y batching continuo permite servir el modelo con baja latencia para aplicaciones de chat o agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M del texto (~5-6 GB) más el mmproj en FP16 (~2-3 GB), se requieren aproximadamente 8-9 GB de VRAM para inferencia local. En FP16 completo, el repositorio ocupa 18,8 GB.
- GPU recomendadas: RTX 5060 (mencionada en la model card para contexto de 65.535 tokens), RTX 4090, A100, H100, o cualquier GPU con al menos 10 GB de VRAM para cuantizaciones ligeras.
- Cabe en GPUs de consumo (RTX 3060 12GB, RTX 4060 Ti 16GB) con cuantización GGUF Q4_K_M.
- Opciones de despliegue: LM Studio (recomendado), KoboldCPP (con mmproj adjunto), SillyTavern (vía API), FriendliAI (servicio gestionado), y potencialmente vLLM o TGI (text-generation-inference) dado el tag `text-generation-inference`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| MGE-GemmaWild-9B | 9,4B | 65.535 (según model card) | Sí | Apache-2.0 | Rol y lore MGE |
| Qwen3.5-9B (base) | 9,4B | No especificado | No (texto) | Apache-2.0 | Instrucción general |
| Gemma 9B (Google DeepMind) | 9B | 8K (típico) | No | Gemma License | Instrucción general |

La comparación es estructural, ya que no hay datos de rendimiento publicados para MGE-GemmaWild-9B. El modelo se diferencia del base Qwen3.5-9B por su especialización multimodal y de rol, mientras que Gemma 9B es una alternativa generalista sin capacidades de visión ni fine-tuning de nicho.

## Limitaciones y advertencias

- Contenido para adultos: la model card indica explícitamente un enfoque "naughty" y orientado a rol adulto, por lo que puede generar contenido inapropiado para menores o entornos laborales.
- Sesgo de dominio: el entrenamiento está fuertemente sesgado hacia el universo MGE, lo que limita su utilidad en tareas generales de NLP o dominios técnicos.
- Alucinaciones: al ser un modelo de razonamiento, puede producir respuestas inventadas sobre lore si los parámetros de muestreo no se ajustan correctamente (temperatura, min P, etc.).
- Idioma: solo soporta inglés; no hay capacidades multilingües documentadas.
- Contexto variable: el límite de 65.535 tokens se menciona para una RTX 5060 específica, pero el contexto real depende del hardware y de la configuración de despliegue.
- Dependencia del prefill: en algunos entornos (SillyTavern) es necesario pre-rellenar el tag `thinking` para activar el razonamiento, lo que puede complicar la integración.
- Restricciones de licencia: aunque Apache-2.0 permite uso comercial, el contenido generado basado en Monster Girl Encyclopedia puede estar sujeto a derechos de autor de la obra original, lo que debe evaluarse para usos comerciales.

## Enlaces

- HuggingFace: https://huggingface.co/cooperdk/MGE-GemmaWild-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/cooperdk/MGE-GemmaWild
- Página de inferencia en FriendliAI: https://friendli.ai/models/cooperdk/MGE-GemmaWild-9b
- Repositorio Gemma (referencia del ecosistema): https://github.com/google-deepmind/gemma
