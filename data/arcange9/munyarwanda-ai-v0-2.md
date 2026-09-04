# arcange9/Munyarwanda-AI-v0.2

## Resumen

Munyarwanda-AI v0.2 es un modelo de lenguaje de ámbito kinyarwanda desarrollado por el usuario arcange9, concebido como un ajuste fino mediante QLoRA sobre el modelo base Qwen/Qwen3-0.6B. El objetivo es ofrecer un asistente de IA que responda de forma nativa en kinyarwanda, un idioma bantú hablado en Ruanda y con muy poca representación en los grandes modelos de lenguaje actuales. La relevancia del proyecto radica en cubrir un vacío lingüístico y cultural, facilitando aplicaciones en sectores como educación, salud o administración pública en Ruanda.

La arquitectura parte de un transformer de 0.600 millones de parámetros (Qwen3-0.6B) y el entrenamiento previsto utiliza QLoRA con r=16 y alpha=32, una técnica de cuantización de baja precisión que permite ajustar el modelo en GPUs modestas como una T4 de Google Colab. El dataset de entrenamiento, denominado arcange9/Munyarwanda-AI-Dataset en su configuración v0.2, contiene 5.834 ejemplos de instrucciones en kinyarwanda, divididos en 5.542 para entrenamiento y 292 para pruebas.

Es importante señalar que, a fecha de la información disponible, el repositorio del modelo no contiene pesos publicados. El estado del proyecto es de "repo preparado para futura formación", por lo que el modelo no es utilizable para inferencia en su versión actual. La ficha refleja esta situación y documenta las especificaciones planificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3-0.6B) |
| Parametros totales | 0.600 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (sin pesos publicados) |
| Idiomas soportados | Kinyarwanda (rw) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (aún no se han subido pesos) |

## Arquitectura y entrenamiento

Munyarwanda-AI v0.2 está planificado como un ajuste fino con QLoRA sobre Qwen3-0.6B. QLoRA es una técnica de eficiencia que cuantiza el modelo base a baja precisión y entrena adaptadores de bajo rango, en este caso con r=16 y alpha=32, lo que reduce drásticamente el coste computacional y de memoria. El entrenamiento se realizaría con el notebook `Munyarwanda_Train_v02_Final.ipynb` en un entorno Google Colab con GPU T4.

El conjunto de datos de entrenamiento es `arcange9/Munyarwanda-AI-Dataset` en su configuración v0.2, con 5.834 ejemplos de instrucciones en kinyarwanda (5.542 de entrenamiento y 292 de test). Las fuentes declaradas son tres datasets de Hugging Face: `map-boy/kinyarwanda-dataset-v2`, `DigitalUmuganda/Monolingual_health_dataset` y `KoseiUemura/KinNewsClassification`. El propio autor indica en la ficha del dataset que se trata de un "starter seed" y no un corpus de producción, recomendando añadir textos reales de kinyarwanda, revisión humana, deduplicación, filtrado de PII y evaluación con benchmarks.

El modelo incluye un system prompt obligatorio en kinyarwanda que instruye al asistente a responder siempre en kinyarwanda, salvo que el usuario solicite explícitamente otro idioma. Este prompt se debe anteponer a cada conversación para mantener el comportamiento esperado.

## Capacidades

- Generación de texto en kinyarwanda: el modelo está diseñado para producir respuestas coherentes y naturales en este idioma, siguiendo un formato de instrucción con tokens de chat (`<|im_start|>`, `<|im_end|>`).
- Comprensión de instrucciones: entrenado con 5.834 ejemplos de instrucciones en kinyarwanda, cubriendo tareas de respuesta a preguntas, explicaciones y posiblemente clasificación o generación de contenido.
- Uso de system prompt: requiere un prompt de sistema específico para forzar la respuesta en kinyarwanda y evitar que el modelo cambie al inglés u otros idiomas.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.
- El modelo no está operativo actualmente porque no se han publicado los pesos.

## Casos de uso

- Atención al ciudadano en servicios públicos ruandeses: el modelo podría integrarse en un chatbot gubernamental para responder consultas administrativas en kinyarwanda, reduciendo la dependencia de operadores humanos y mejorando el acceso a la información en zonas rurales.
- Asistente educativo en escuelas de Ruanda: dado su tamaño reducido (0.6B), podría ejecutarse en hardware modesto para ofrecer tutorías personalizadas en kinyarwanda, explicando conceptos de ciencias o matemáticas en el idioma local.
- Apoyo en salud comunitaria: el dataset incluye una fuente de salud monolingüe (`DigitalUmuganda/Monolingual_health_dataset`), por lo que el modelo podría responder preguntas básicas sobre síntomas, medicación o hábitos saludables, siempre con supervisión humana.
- Generación de contenido local: redacción de artículos, notas informativas o publicaciones en redes sociales en kinyarwanda para medios de comunicación o empresas que buscan contenido culturalmente relevante.
- Traducción asistida kinyarwanda-inglés: aunque el system prompt desaconseja responder en inglés, el modelo puede servir como apoyo en tareas de traducción si se modifica el prompt, al estar basado en un modelo multilingüe como Qwen3.
- Investigación lingüística: como recurso de referencia para estudiar el comportamiento de modelos pequeños ajustados en idiomas de bajos recursos, permitiendo analizar la eficacia de QLoRA en este contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se pueden proporcionar requisitos de hardware verificados al no existir pesos publicados.
- Para un modelo base de 0.6B con QLoRA, se estima que la inferencia en cuantización 4-bit podría ejecutarse en GPUs de consumo con 4-6 GB de VRAM, como una RTX 3060 o RTX 4060, aunque esto es una estimación basada en el tamaño del modelo base.
- El entrenamiento planificado con QLoRA está pensado para una GPU T4 de Google Colab, con aproximadamente 16 GB de VRAM.
- Opciones de despliegue: al ser un modelo basado en Qwen, podría servirse con vLLM, llama.cpp o Ollama una vez que se suban los pesos y se conviertan a formatos compatibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo base Qwen3-0.6B sería la referencia más cercana, pero no está especializado en kinyarwanda ni ha sido ajustado con este dataset.

## Limitaciones y advertencias

- El repositorio no contiene pesos: el modelo no puede ser cargado ni utilizado para inferencia. Solo existe la estructura y la documentación.
- El dataset de entrenamiento es pequeño (5.834 ejemplos) y el propio autor lo califica como "starter seed", lo que limita la calidad y cobertura de las respuestas.
- Riesgo de alucinación: con un corpus tan reducido, el modelo puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos potenciales: las fuentes de datos están limitadas a tres datasets concretos, lo que puede introducir sesgos geográficos, temáticos o de estilo.
- Limitación de idioma: el modelo está diseñado para kinyarwanda únicamente; si se omite el system prompt, podría responder en inglés u otros idiomas, degradando la experiencia.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos publicados, no es posible su explotación actual.
- No se especifica la longitud de contexto, por lo que se desconoce el comportamiento con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcange9/Munyarwanda-AI-v0.2
- Dataset en Hugging Face: https://huggingface.co/datasets/arcange9/Munyarwanda-AI-Dataset
- Repositorio en GitHub: https://github.com/arcange9/Munyarwanda-Ai
