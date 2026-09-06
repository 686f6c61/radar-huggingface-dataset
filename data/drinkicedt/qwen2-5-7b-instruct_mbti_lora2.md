# DrinkIcedT/Qwen2.5-7B-Instruct_MBTI_lora2

## Resumen

El modelo DrinkIcedT/Qwen2.5-7B-Instruct_MBTI_lora2 es un adaptador de bajo rango (LoRA) obtenido mediante ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo desarrolla el usuario DrinkIcedT y está orientado a elicitar rasgos de personalidad basados en el indicador MBTI (Myers-Briggs Type Indicator) en conversaciones. El repositorio contiene únicamente los pesos del adaptador (0.1 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador encima.

Al partir de Qwen2.5-7B-Instruct, la arquitectura es un Transformer denso de 7.62 mil millones de parámetros (aprox.) con una ventana de contexto de 131,072 tokens. El fine-tuning añade una capa de especialización en diálogos con perfiles de personalidad, pero no se han publicado métricas que demuestren el impacto en las capacidades generales del modelo base. La relevancia actual del modelo reside en la exploración de la personalización de asistentes conversacionales mediante el entrenamiento con datasets de diálogo etiquetados por tipo psicológico, un área con interés creciente en interacción humano-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B-Instruct) + adaptador LoRA |
| Parametros totales | 7.62B (modelo base); adaptador LoRA no especificado |
| Longitud de contexto | 131,072 tokens |
| Tipos de cuantizacion | No disponible (los pesos base admiten cuantizacion GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (SFT) del checkpoint Qwen/Qwen2.5-7B-Instruct, entrenado con la librería TRL (Transformers Reinforcement Learning) en su versión 1.12.0. La model card indica explícitamente que el entrenamiento se realizó con SFT, sin mención de RLHF ni DPO. El nombre del repositorio y el tamaño del adaptador (0.1 GB) sugieren que se empleó la técnica LoRA (Low-Rank Adaptation) para actualizar un subconjunto de parámetros, en lugar de ajustar todos los pesos del modelo base.

No se detalla la composición del dataset de entrenamiento en la información disponible. Sin embargo, la existencia del repositorio hermano DrinkIcedT/Qwen2.5-7B-Instruct_MBTI-Dialogues apunta a que se utilizó un conjunto de diálogos anotados con tipos MBTI. Tampoco se especifica el número de tokens ni la estrategia de muestreo empleada. El adaptador se entrenó con las versiones de Transformers 5.16.1, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Generación de texto: el modelo base Qwen2.5-7B-Instruct es capaz de generar texto coherente en tareas de instrucción, razonamiento, escritura creativa y conversación.
- Razonamiento y matemáticas: el modelo base hereda capacidades de razonamiento simbólico y aritmético, aunque el fine-tuning MBTI no incluye evaluaciones de preservación de estas habilidades.
- Generación de código: el modelo base soporta lenguajes de programación comunes y puede generar código; no hay pruebas específicas de que el adaptador mantenga esta capacidad.
- Tool calling / function calling: el modelo base es compatible con llamadas a funciones; el adaptador no altera la interfaz de instrucciones, por lo que se espera que siga siendo funcional, pero no se ha validado.
- Agentes y razonamiento multi-paso: el modelo base puede operar en pipelines de agentes con razonamiento encadenado; el adaptador añade una capa de personalidad sin modificar la estructura de razonamiento.
- Especialización MBTI: el propósito principal del adaptador es generar respuestas alineadas con un perfil de personalidad MBTI concreto en diálogos, lo que permite simular diferentes caracteres psicológicos en conversaciones.
- Soporte multilingüe: el modelo base Qwen2.5-7B-Instruct soporta principalmente inglés y chino; el adaptador no declara idiomas adicionales.

## Casos de uso

- Simulación de entrevistas de trabajo: el modelo puede adoptar un perfil MBTI específico (por ejemplo, ESTJ o INFP) para que el usuario practique técnicas de entrevista y observe distintas dinámicas de comunicación. Gracias a su entrenamiento en diálogos MBTI, las respuestas reflejan rasgos de personalidad consistentes con el perfil solicitado.
- Juegos de rol con personajes: en aplicaciones de rol o narrativa interactiva, el adaptador permite que un personaje mantenga una personalidad psicológica estable a lo largo de una conversación larga, aprovechando la ventana de contexto de 128K tokens.
- Entrenamiento de habilidades interpersonales: los profesionales de RR. HH. o coaching pueden utilizar el modelo para generar diálogos de práctica con distintos tipos de personalidad, facilitando la preparación de escenarios de negociación o resolución de conflictos.
- Generación de contenido creativo: escritores de ficción pueden usar el modelo para obtener diálogos que respeten la caracterización MBTI de sus personajes, reduciendo el esfuerzo de mantener coherencia psicológica en la escritura.
- Asistentes virtuales personalizados: el modelo puede integrarse en chatbots que adaptan su tono y estilo de respuesta según el perfil MBTI del usuario, ofreciendo una experiencia conversacional más ajustada a las preferencias del interlocutor.
- Investigación en psicología computacional: los investigadores pueden emplear el adaptador para generar corpus de texto etiquetados con tipos MBTI y analizar correlaciones entre lenguaje y rasgos de personalidad, aunque el uso de estos datos requeriría una evaluación previa de sesgos.
- Aplicaciones educativas en psicología: el modelo puede servir para ilustrar de forma práctica los rasgos de los 16 tipos MBTI en entornos de aprendizaje interactivo, generando ejemplos de comportamiento verbal asociados a cada perfil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en precisión FP16, se requieren aproximadamente 15-16 GB de VRAM. Con cuantización 4-bit (GGUF o AWQ), la VRAM desciende a unos 5-6 GB. El adaptador LoRA añade un consumo de memoria despreciable (menos de 0.5 GB).
- GPU recomendadas: RTX 3090 o RTX 4090 para ejecución en FP16; RTX 4060 Ti o RTX 4070 son suficientes con cuantización 4-bit. En entornos profesionales, A100 o H100 ofrecen mayor throughput.
- Compatibilidad con GPU de consumo: sí, es viable ejecutar en GPUs de gama media-alta (16-24 GB) con cuantización, y en GPUs de 8-12 GB si se aplica una cuantización agresiva y se reduce la ventana de contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con soporte de adaptadores LoRA en formato GGUF), Ollama (tras convertir el adaptador a GGUF) y el pipeline nativo de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.62B | 131,072 | Apache 2.0 | Repositorio completo |
| DrinkIcedT/Qwen2.5-7B-Instruct_MBTI_lora2 | 7.62B + LoRA | 131,072 | No disponible | Adaptador LoRA (0.1 GB) |
| DrinkIcedT/Qwen2.5-7B-Instruct_MBTI-Dialogues | No disponible | No disponible | No disponible | Dataset de diálogos MBTI |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento en diálogos etiquetados con tipos MBTI puede reforzar estereotipos de personalidad y producir respuestas que simplifiquen en exceso la complejidad psicológica humana.
- Riesgo de alucinación: el modelo base puede generar contenido plausible pero incorrecto; el adaptador no mitiga este riesgo, y la falta de evaluaciones formales impide conocer el impacto del fine-tuning.
- Limitaciones de contexto o idioma: no se ha documentado el idioma principal del dataset de entrenamiento; aunque el modelo base soporta inglés y chino, la especialización MBTI podría estar sesgada hacia el inglés.
- Restricciones de licencia: el repositorio del adaptador no especifica una licencia, lo que introduce incertidumbre sobre el uso comercial. El modelo base es Apache 2.0, pero los pesos del adaptador podrían tener restricciones adicionales no declaradas.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en HuggingFace, y no se han publicado resultados de benchmarks ni pruebas de robustez. No es recomendable su uso en entornos de producción sin una validación exhaustiva.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/DrinkIcedT/Qwen2.5-7B-Instruct_MBTI_lora2
- Dataset de diálogos MBTI: https://huggingface.co/DrinkIcedT/Qwen2.5-7B-Instruct_MBTI-Dialogues
- Documentación de TRL: https://github.com/huggingface/trl
- Paper relacionado: https://arxiv.org/pdf/2508.08719
