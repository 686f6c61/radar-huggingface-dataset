# ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v1

## Resumen

Qwen2.5-R1-Minny-1.5B-v1 es un modelo de lenguaje de 1,78 mil millones de parámetros desarrollado por el usuario ForSureTesterSim, que combina capacidades de razonamiento, matemáticas y código en una única arquitectura. El modelo se construye mediante una técnica de fusión híbrida que parte de DeepSeek-R1-Distill-Qwen-1.5B (entrenado con GRPO) y le inyecta tres expertos SFT especializados en matemáticas, código y razonamiento. El resultado es un "super-base" pensado para servir como punto de partida para ajuste fino posterior, aunque también puede usarse para inferencia directa.

La arquitectura subyacente es un transformer estándar de la familia Qwen2.5, con 1,5B de parámetros y una ventana de contexto que, aunque no se especifica en la ficha del autor, coincide con la del modelo base DeepSeek-R1-Distill-Qwen-1.5B (32K tokens). El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y su relevancia radica en la metodología de fusión, que intenta evitar la pérdida catastrófica y el colapso de formato típico en los modelos RLHF.

La ficha técnica incluye detalles de la fusión, resultados de pérdida de forward-pass y advertencias sobre su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, attention completa) |
| Parametros totales | 1.776.255.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-1.5B usa 32K, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (safetensors, sin cuantizacion indicada; el tamano del repo sugiere BF16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante una fusion de tres modelos SFT (RLinf-math-1.5B, agentica-org/DeepCoder-1.5B-Preview y mobiuslabsgmbh/DeepSeek-R1-ReDistill-Qwen-1.5B-v1.1) sobre el ancla GRPO DeepSeek-R1-Distill-Qwen-1.5B. La metodologia combina Model Stock (anclaje geometrico) y Sens-Merging (escalado por sensibilidad de gradientes), evitando los metodos de poda tipo DARE o DELLA que destruyen los outliers de pesos del GRPO. No se ha realizado un entrenamiento posterior a la fusion; el modelo se distribuye tal cual.

El proceso de fusion se evaluo mediante perdida de forward-pass en tres dominios (FineWeb, OpenMath y CodeAlpaca), mostrando una perdida menor que las alternativas de fusion simples (task arithmetic o Model Stock puro). No se han publicado datos de entrenamiento adicionales ni de dataset de fine-tuning.

## Capacidades

- Generacion de texto con razonamiento logico y traces de pensamiento tipo DeepSeek-R1.
- Razonamiento matematico: resolucion de problemas aritmeticos y algebraicos basicos, con capacidad de seguir pasos intermedios.
- Generacion de codigo en Python y C++ (según el autor, tiene representaciones latentes profundas de sintaxis de estos lenguajes).
- Capacidad de tool calling y function calling: no se menciona explicitamente en la model card, pero al ser una base de DeepSeek-R1, podria heredar parcialmente la capacidad de llamadas a herramientas, aunque no se garantiza.
- Soporte para agentes y razonamiento multi-step: el modelo base DeepSeek-R1 esta diseñado para razonamiento encadenado, aunque la fusion puede degradar la adherencia al formato.
- Multilingue: solo ingles confirmado.
- Capacidad de thinking mode: el modelo base DeepSeek-R1 produce traces de razonamiento en formato `<|thinking|>` antes de la respuesta final, aunque la fusion puede alterar la estabilidad del formato.

## Casos de uso

- Razonamiento matematico en entornos educativos: el modelo puede resolver problemas de algebra y calculo, generando explicaciones paso a paso. Al ser un modelo de 1,5B, es adecuado para aplicaciones con recursos limitados, como asistentes de estudio en dispositivos moviles.
- Generacion de codigo en Python para prototipos rapidos: puede generar funciones y scripts simples, aunque sin garantia de correctitud completa. Se puede integrar en IDEs como un asistente de autocompletado ligero.
- Base para fine-tuning en tareas especificas: su objetivo principal es ser inicializado para SFT o DPO en dominios como chat, agentes o tareas de programacion. Permite ahorrar tiempo de entrenamiento al partir de una base que ya contiene razonamiento y codigo.
- Experimentacion en investigacion sobre fusion de modelos: sirve como caso de estudio para evaluar el impacto de Model Stock y Sens-Merging en modelos GRPO. Investigadores pueden comparar su comportamiento con otras tecnicas de fusion.
- Prototipo de agente conversacional con razonamiento: aunque el formato de chat es inestable, se puede usar con un prompt estructurado para tareas de QA de logica o explicaciones.
- Asistente de depuracion de codigo: dado que entiende sintaxis de Python y C++, puede sugerir correcciones para errores de sintaxis o logica en fragmentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor presenta una evaluacion de perdida de forward-pass (menor es mejor) para validar la calidad de la fusion:

| Fusion Algorithm | Foundation Loss (FineWeb) | Reasoning Loss (OpenMath) | Code Loss (CodeAlpaca) |
|---|---|---|---|
| Raw Task Arithmetic | 3.8883 | 1.8376 | 2.2205 |
| Raw Model Stock | 3.7151 | 1.7052 | 1.9991 |
| Model Stock + Sens-Merge (este modelo) | 3.5973 | 1.5694 | 1.6017 |

Estos datos indican que la fusion propuesta tiene menor perdida de forward-pass que las alternativas, lo que sugiere una mejor absorcion de los espacios latentes de los expertos. Sin embargo, no se proporcionan metricas de calidad generativa como exactitud en tareas de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (aprox. 3,5 GB), se necesita al menos 4 GB de VRAM. Con cuantizacion INT8 (~1,8 GB) se puede ejecutar en tarjetas con 2-3 GB. Con INT4 (~0,9 GB) cabria en GPUs con 1-2 GB, aunque la calidad puede degradarse.
- GPU recomendadas: para FP16, una NVIDIA RTX 3060 (12 GB) o superior; para INT4, una RTX 2060 (6 GB) o una GTX 1660 Ti (6 GB) es suficiente. En entornos de produccion, una A100 o H100 no son necesarias para este tamano.
- Si cabe en consumer GPU: si, en todas las GPUs con al menos 6 GB de VRAM para FP16, y en GPUs de 4 GB con cuantizacion INT8/INT4.
- Opciones de despliegue: vLLM (soporta modelos Qwen2.5), llama.cpp (para CPU/GPU con GGUF), Ollama (si se convierte a GGUF), TGI (Text Generation Inference), o Transformers con PyTorch.
- Latencia y throughput: no se ha medido. Para 1,5B en una RTX 4090, se espera un throughput de decenas de tokens por segundo en FP16; en INT4 puede superar los 100 tokens/s. En CPU, con llama.cpp, se puede ejecutar en una maquina moderna con 8-16 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-R1-Minny-1.5B-v1 | 1,78B | no disponible (base 32K) | Apache-2.0 | Fusion de razonamiento, matematicas y codigo |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32K | MIT | Base original con razonamiento GRPO, sin fusion |
| Qwen2.5-1.5B-Instruct | 1,78B | 32K | Apache-2.0 | Modelo instruct de Qwen2.5, sin razonamiento especifico |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128K | MIT | Version de 8B con mejor rendimiento, pero mas pesado |

No se dispone de resultados de benchmarks comparativos entre estos modelos, por lo que la comparacion se limita a caracteristicas de arquitectura y licencia.

## Limitaciones y advertencias

- **Formato de prompt inestable**: el autor advierte que la adherencia a plantillas de chat (por ejemplo, `<|im_start|>` vs `<|eot_id|>`) puede ser inconsistente, ya que se fusionaron varios modelos SFT con formatos distintos. Esto puede provocar respuestas malformadas en inferencia directa.
- **Tamaño limitado**: con 1,5B de parametros, el modelo tiene las limitaciones tipicas de los modelos pequenos: alucinaciones frecuentes, memoria de conocimiento limitada y dificultad en tareas de largo alcance.
- **Solo ingles**: no soporta otros idiomas.
- **Licencia Apache-2.0**: permite uso comercial sin restricciones, pero se debe mantener la atribucion.
- **Sin garantia de calidad**: no hay benchmarks de rendimiento funcional (MMLU, HumanEval, etc.), por lo que no se puede afirmar que supere a otros modelos de su tamano en tareas concretas.
- **Riesgo de sobreajuste a la fusion**: el modelo puede tener una distribucion de pesos inusual que afecte a la estabilidad en entornos de produccion.

## Enlaces

- [HuggingFace - Qwen2.5-R1-Minny-1.5B-v1](https://huggingface.co/ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v1)
- [DeepSeek-R1-Distill-Qwen-1.5B (modelo base)](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Qwen2.5 Technical Report (arXiv)](https://arxiv.org/abs/2412.15115)
- [Repositorio de Qwen2.5 (HuggingFace collection)](https://huggingface.co/collections/Qwen/qwen25)</think>## Resumen

Qwen2.5-R1-Minny-1.5B-v1 es un modelo de lenguaje de 1,78 mil millones de parametros desarrollado por el usuario ForSureTesterSim. Se trata de un modelo de base "super-base" construido mediante una fusion hibrida de tres expertos SFT (matematicas, codigo y razonamiento) sobre el ancla GRPO DeepSeek-R1-Distill-Qwen-1.5B. Su objetivo es preservar las capacidades de razonamiento logico del modelo GRPO mientras se inyectan competencias especificas de dominio, evitando la perdida catastropica y el colapso de formato tipico de los modelos RLHF.

La arquitectura subyacente es un transformer de la familia Qwen2.5, con 1,5B de parametros y una ventana de contexto que no se especifica en la model card, aunque el modelo base DeepSeek-R1-Distill-Qwen-1.5B usa 32K. Se distribuye bajo licencia Apache-2.0, solo para el idioma ingles, con pesos en formato safetensors. Su relevancia radica en la metodologia de fusion (Model Stock + Sens-Merging) que pretende superar las limitaciones de las tecnicas de fusion simples en modelos entrenados con GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, attention completa) |
| Parametros totales | 1.776.255.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-1.5B usa 32K, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizacion; el tamano de 3.6 GB sugiere FP16 o BF16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante una fusion de tres modelos SFT: `RLinf/RLinf-math-1.5B` (matematicas), `agentica-org/DeepCoder-1.5B-Preview` (codigo) y `mobiuslabsgmbh/DeepSeek-R1-ReDistill-Qwen-1.5B-v1.1` (razonamiento), todos ellos basados en Qwen2.5. La fusion se realiza con una combinacion de Model Stock (anclaje geometrico) y Sens-Merging (escalado por sensibilidad de gradientes), disenada para no destruir los outliers de pesos que el entrenamiento GRPO de DeepSeek-R1 codifica como rutas logicas.

El proceso de fusion se evaluo mediante perdida de forward-pass en tres dominios (FineWeb, OpenMath, CodeAlpaca), mostrando perdidas menores que las alternativas de fusion simple. No se ha realizado un entrenamiento adicional posterior a la fusion; el modelo se ofrece como base para ajuste fino posterior (SFT o DPO). No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion de los datasets originales.

## Capacidades

- Generacion de texto con razonamiento logico y traces de pensamiento tipo DeepSeek-R1 (aunque la estabilidad del formato no esta garantizada).
- Razonamiento matematico: resolucion de problemas de algebra, aritmetica y logica con pasos intermedios.
- Generacion de codigo en Python y C++ (segun la model card, tiene representaciones latentes profundas de sintaxis de estos lenguajes).
- Soporte de tool calling / function calling: no se menciona explicitamente, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene capacidades de llamada a funciones; la fusion puede degradar esta funcionalidad.
- Soporte de agentes y multi-step reasoning: el modelo base esta disenado para razonamiento encadenado, aunque la fusion puede alterar la adherencia al formato.
- Capacidades multilingues: solo ingles.
- Capacidad de thinking mode: el modelo base genera bloques de pensamiento antes de la respuesta final, pero la estabilidad de este formato no esta asegurada.

## Casos de uso

- **Asistentes educativos de matematicas**: el modelo puede resolver problemas algebraicos y explicar el razonamiento paso a paso. Su tamano reducido permite ejecutarlo en dispositivos con pocos recursos, como portatiles de gama media o moviles con cuantizacion.
- **Generacion de codigo en entornos de prototipado**: puede generar funciones simples en Python o C++ para tareas de automatizacion o scripts de prueba. Se puede integrar en un editor como plugin de autocompletado o en pipelines de CI para generar esqueletos de codigo.
- **Base para fine-tuning en dominios especificos**: como modelo super-base, es adecuado para inicializar un modelo y ajustarlo con SFT o DPO para tareas como atencion al cliente, agentes conversacionales o analisis de logica. Al ser un modelo de 1.5B, el coste de entrenamiento es bajo comparado con modelos grandes.
- **Investigacion sobre tecnicas de fusion de modelos**: sirve como caso de estudio para evaluar la combinacion de Model Stock y Sens-Merging en modelos entrenados con GRPO. Investigadores pueden comparar la perdida de forward-pass con otras tecnicas de fusion.
- **Prototipado de agentes de razonamiento**: puede usarse como motor de razonamiento en un agente que requiera pasos logicos, como planificacion de tareas o resolucion de problemas de logica, siempre que se adapte el formato de entrada.
- **Asistente de depuracion de codigo**: dado su conocimiento de sintaxis de Python y C++, puede analizar fragmentos de codigo y sugerir correcciones para errores logicos o de sintaxis, aunque con limitaciones por su tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor presenta una evaluacion de perdida de forward-pass (menor es mejor) en tres dominios, comparando la fusion propuesta con alternativas:

| Fusion Algorithm | Foundation Loss (FineWeb) | Context Loss (OpenMath) | Code Loss (CodeAlpaca) |
|---|---|---|---|
| Raw Task Arithmetic | 3.8883 | 1.8376 | 2.2205 |
| Raw Model Stock | 3.7151 | 1.7052 | 1.9991 |
| Model Stock + Sens-Merge (este modelo) | 3.5973 | 1.5694 | 1.6017 |

Estos datos indican una menor perdida de forward-pass en los tres dominios, lo que sugiere una mejor absorcion de los espacios latentes de los expertos SFT. No obstante, no son metricas de calidad generativa (exactitud, BLEU, etc.) y no permiten comparar con otros modelos de la misma categoria.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con FP16 (aprox. 3,6 GB) se requiere al menos 4 GB de VRAM. Con cuantizacion INT4 (aprox. 0,9 GB) se puede ejecutar en 2 GB de VRAM, aunque la calidad puede degradarse.
- **GPU recomendadas**: para FP16, una NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente. Para INT4, una RTX 2060 (6 GB) o una GTX 1660 Ti (6 GB) funciona. En entornos de produccion, una A100 o H100 no es necesaria para este tamano.
- **Compatibilidad con consumer GPU**: si, todas las GPUs con al menos 4 GB de VRAM pueden ejecutar el modelo en FP16; con INT4 cabe en GPUs de 2 GB.
- **Opciones de despliegue**: vLLM (soporta arquitectura Qwen2.5), llama.cpp (conversion a GGUF), Ollama, TGI (Text Generation Inference) y Transformers de HuggingFace.
- **Latencia y throughput**: no se han publicado datos. En una RTX 3060, se espera un throughput de 30-50 tokens/s en FP16; en INT4 puede superar los 100 tokens/s. En CPU con llama.cpp, se puede obtener 5-10 tokens/s en un procesador moderno con 16 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-R1-Minny-1.5B-v1 | 1,78B | no disponible (32K base) | Apache-2.0 | Fusion de razonamiento, matematicas y codigo |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32K | Apache-2.0 | Modelo base GRPO, sin fusion |
| Qwen2.5-1.5B-Instruct | 1,78B | 32K | Apache-2.0 | Modelo instructivo general de Qwen2.5 |
| DeepSeek-R1-Distill-Qwen-3B | 3B | 128K | MIT | Modelo de 3B con mejor razonamiento, pero mas pesado |

No se dispone de benchmarks comparativos entre estos modelos en la informacion disponible, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- **Inestabilidad de formato**: el autor advierte que la adherencia a plantillas de chat (por ejemplo, `<|im_start|>` vs `<|eot_id|>`) puede ser inconsistente, ya que se fusionaron modelos SFT con formatos distintos. Esto puede provocar respuestas malformadas en inferencia directa.
- **Tamano pequeno**: con 1,5B de parametros, el modelo sufre las limitaciones tipicas de los modelos pequenos: alucinaciones frecuentes, conocimiento limitado y dificultad en tareas de largo contexto.
- **Solo ingles**: no soporta otros idiomas.
- **Licencia Apache-2.0**: permite uso comercial, pero debe mantenerse la atribucion al autor y a los modelos base.
- **Sin evaluaciones estandar**: no hay resultados de benchmarks como MMLU o HumanEval, por lo que no se puede afirmar su capacidad real en tareas concretas.
- **Riesgo de sobreajuste a la fusion**: el modelo puede tener una distribucion de pesos inusual que afecte a la generalizacion en entornos de produccion.

## Enlaces

- [HuggingFace: Qwen2.5-R1-Minny-1.5B-v1](https://huggingface.co/ForSureTesterSim/Qwen2.5-R1-Minny-1.5B-v1)
- [DeepSeek-R1-Distill-Qwen-1.5B (modelo base)](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Qwen2.5 Technical Report (arXiv)](https://arxiv.org/abs/2412.15115)
- [Qwen2.5 collection en HuggingFace](https://huggingface.co/collections/Qwen/qwen25)
