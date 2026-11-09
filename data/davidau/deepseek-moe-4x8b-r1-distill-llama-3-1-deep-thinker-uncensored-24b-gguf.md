# DavidAU/DeepSeek-MOE-4X8B-R1-Distill-Llama-3.1-Deep-Thinker-Uncensored-24B-GGUF

## Resumen

DeepSeek-MOE-4X8B-R1-Distill-Llama-3.1-Deep-Thinker-Uncensored-24B-GGUF es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario DavidAU en Hugging Face. Se construye mediante la técnica de fusión de modelos (mergekit) a partir de cuatro fine-tunes de Llama 3.1 de 8B, a los que se les incorpora la capacidad de razonamiento y "pensamiento" destilada del modelo DeepSeek-R1-Distill-Llama-8B. El resultado es un modelo de aproximadamente 24,9 mil millones de parámetros totales que, según el autor, ofrece un comportamiento equivalente a un modelo de 32B (4×8B) pero con un tamaño efectivo menor.

El modelo está orientado a generación de texto creativo, escritura de ficción, resolución de acertijos y problemas de lógica, y usos conversacionales generales. Incluye un modo de "pensamiento" (thinking) que genera cadenas de razonamiento antes o después de la respuesta, y está explícitamente descensurado, por lo que puede producir contenido NSFW, de terror y lenguaje soez. Se distribuye en formato GGUF, lo que facilita su despliegue local con llama.cpp y herramientas compatibles.

Es relevante para desarrolladores e investigadores que quieran experimentar con modelos MoE fusionados de tamaño medio, con capacidad de razonamiento destilada y despliegue en hardware de consumo, aunque su naturaleza de fusión no oficial y su falta de benchmarks publicados lo sitúan en el terreno de la experimentación más que en el de producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer Llama 3.1, 4 expertos de 8B fusionados con mergekit |
| Parametros totales | 24.942.219.328 (≈24,9B) |
| Parametros activos | No disponible (el autor indica que los 4 expertos están activados, sin detallar el enrutamiento) |
| Longitud de contexto | 128k (según tags del autor); se recomienda un mínimo de 4096 tokens para acomodar los "pensamientos" |
| Tipos de cuantizacion | GGUF (diversas cuantizaciones; el repo ocupa 170,3 GB en total) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de cuatro fine-tunes de Llama 3.1 de 8B de parámetros, combinados mediante mergekit en una arquitectura de mezcla de expertos. A cada experto se le ha incorporado la tecnología de razonamiento y "thinking" del modelo DeepSeek-R1-Distill-Llama-8B, según indica el autor, "injertada directamente". No se trata de un MoE entrenado desde cero, sino de una fusión de pesos que da como resultado un modelo de 24,9B de parámetros totales que, según la model card, se comporta como un 32B (4×8B) con menor tamaño efectivo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica principal es la integración de la capacidad de razonamiento destilada de DeepSeek-R1 en cada uno de los expertos, lo que permite generar cadenas de "pensamiento" (thoughts) de varios niveles de profundidad. El autor afirma que el modelo es estable a temperaturas altas (1+, 2+) y que supera al modelo distill original de DeepSeek en coherencia y profundidad de pensamiento, aunque no aporta datos cuantitativos que lo respalden.

## Capacidades

- Generación de texto general y conversacional en inglés.
- Razonamiento multi-paso con modo "thinking": genera cadenas de pensamiento antes o después de la respuesta, con varios niveles de profundidad.
- Resolución de acertijos, adivinanzas y problemas de lógica que, según el autor, superan las capacidades de un Llama 3.1 estándar.
- Escritura creativa: ficción, generación de tramas, subtramas, escenas, relatos y continuación de escenas.
- Roleplaying y escritura de ficción interactiva.
- Brainstorming y generación de ideas.
- Contenido sin censura: puede producir NSFW, terror y lenguaje soez.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de visión, audio u otras modalidades.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Escritura de ficción y relatos: el modelo puede generar tramas, subtramas, escenas y continuaciones con un sesgo creativo superior al de un Llama 3.1 estándar, gracias a la fusión de cuatro expertos y al modo de pensamiento que sugiere mejoras narrativas.
- Roleplaying y ficción interactiva: su orientación a contenido sin censura y su capacidad de mantener conversaciones multi-turno con contexto largo (hasta 128k tokens) lo hacen adecuado para personajes y narrativas interactivas.
- Resolución de acertijos y problemas de lógica: el modo "thinking" destilado de DeepSeek-R1 permite abordar problemas que un Llama 3.1 base no resolvería, generando cadenas de razonamiento de varios pasos.
- Brainstorming y generación de ideas: el modelo puede producir múltiples variaciones y enfoques sobre un mismo tema, con pensamientos que exploran ángulos distintos.
- Generación de contenido de terror o NSFW: para proyectos creativos que requieran contenido explícito, el modelo está explícitamente descensurado y puede generar este tipo de material sin las restricciones habituales.
- Experimentación con modelos MoE fusionados: investigadores interesados en evaluar el comportamiento de fusiones mergekit con razonamiento destilado pueden usar este modelo como caso de estudio, desplegándolo en local con llama.cpp.
- Asistente creativo personal en local: al distribuirse en GGUF, puede ejecutarse en hardware de consumo para tareas de escritura y generación de ideas sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma que el modelo supera al DeepSeek-R1-Distill-Llama-8B original en coherencia y profundidad de pensamiento, pero no aporta métricas cuantitativas (MMLU, HumanEval, GSM8K u otras) que respalden esta afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 24,9B en GGUF requiere aproximadamente 14-16 GB en cuantización Q4_K_M, 18-20 GB en Q5_K_M y 24-28 GB en Q8_0, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de 24 GB (RTX 3090, RTX 4090) en cuantizaciones Q4 o Q5, y en A100/H100 sin problema en cuantizaciones mayores.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 con cuantizaciones Q4/Q5, aunque no hay confirmación oficial del autor.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, KoboldCpp, entre otras). El repo incluye plantilla Jinja que se autocargan en la cuantización.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-MOE-4X8B-R1-Distill-Llama-3.1-Deep-Thinker-Uncensored-24B | ≈24,9B (MoE, 4×8B) | 128k | Apache 2.0 | GGUF | Fusión mergekit con razonamiento destilado, descensurado |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128k | MIT (según el modelo original) | safetensors, GGUF | Modelo base del componente de razonamiento; menor tamaño y sin fusión MoE |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Modelo base de los expertos; sin modo thinking destilado |
| Modelos MoE de ~24B (por ejemplo, Mistral Small 3 o similares) | ≈24B | Variable | Variable | safetensors, GGUF | Alternativas comerciales o abiertas de tamaño comparable; no disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser una fusión de Llama 3.1 y DeepSeek, es previsible que herede sesgos de ambos modelos base.
- Riesgo de alucinación: no evaluado; los modelos fusionados y con modo thinking pueden generar razonamientos plausibles pero incorrectos.
- Limitaciones de contexto e idioma: el modelo está documentado únicamente en inglés; no se garantiza un buen rendimiento en castellano u otros idiomas. El contexto de 128k es una afirmación del autor, no verificada con benchmarks.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.1 conviene revisar las condiciones de la Llama 3.1 Community License y de los modelos base utilizados en la fusión.
- Contenido explícito: el modelo está explícitamente descensurado y puede generar NSFW, terror y lenguaje soez; no es adecuado para aplicaciones dirigidas a menores o entornos con requisitos de moderación.
- Estabilidad del modo thinking: el autor advierte que los "pensamientos" pueden requerir varias regeneraciones para activarse y que su comportamiento varía con la temperatura y la penalización por repetición; no es un modo determinista.
- Naturaleza no oficial: es una fusión mergekit de un usuario individual, sin validación independiente ni benchmarks publicados; no se recomienda para producción crítica sin evaluación propia.
- Plantilla de chat: requiere plantilla Llama 3 Instruct o Command-R, o la plantilla Jinja autocargana incluida en la cuantización; una configuración incorrecta puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/DeepSeek-MOE-4X8B-R1-Distill-Llama-3.1-Deep-Thinker-Uncensored-24B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/DeepSeek-MOE-4X8B-R1-Distill-Llama-3.1-Deep-Thinker-Uncensored-24B
- Modelo DeepSeek-R1-Distill-Llama-8B (fuente del componente de razonamiento): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Perfil del autor en Hugging Face: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
