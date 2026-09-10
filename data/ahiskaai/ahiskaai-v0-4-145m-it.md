# AhiskaAI/AhiskaAI-v0.4-145M-IT

## Resumen

AhiskaAI v0.4 145M IT es un modelo de lenguaje pequeno (SLM) desarrollado por el proyecto independiente AhiskaAI, centrado en el turco y el turco ahiska. Con aproximadamente 145 millones de parametros, emplea la arquitectura LlamaForCausalLM y fue entrenado completamente desde cero sobre FineWeb-2 HQ Turkish (unos 1.700 millones de tokens en 2 epocas), sin inicializarse desde pesos de modelos preentrenados existentes.

El repositorio de HuggingFace contiene dos variantes ajustadas por instrucciones (IT) del mismo modelo base, diferenciadas unicamente por sus datos de SFT: la variante "Old" utiliza el conjunto de datos de instrucciones de la serie v0.3, mientras que la "New" combina datos propios de AhiskaAI con una porcion de Ethosoft/nedo-turkish-sft-mixtures, con un proceso de entrenamiento mucho mas extenso (5.710 pasos frente a 366). Ambas comparten arquitectura, tokenizer y preentrenamiento.

El modelo resulta relevante por su enfoque en un idioma de bajos recursos y su orientacion a la investigacion reproducible. Aborda la brecha de representacion del turco en el ecosistema de los modelos de lenguaje grandes, ofreciendo una opcion ligera y accesible para experimentos academicos y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (entrenado desde cero, no derivado de pesos Llama preexistentes) |
| Parametros totales | ~145M (~125M excluyendo embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (pesos nativos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Turco (tr), incluido el turco ahiska |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con transformers |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura LlamaForCausalLM, un transformer decoder causal. Sus especificaciones internas incluyen 20 capas ocultas, 12 cabezas de atencion y 4 cabezas clave/valor (GQA), con tamaño oculto de 768, tamaño intermedio de 2048 y dimension de cabeza de 64. Emplea codificacion posicional RoPE, activacion SiLU y embeddings de palabras compartidos (tied). No usa bias en atencion ni en MLP, y el dropout de atencion es 0.0.

El modelo base fue preentrenado desde cero en FineWeb-2 HQ Turkish durante 2 epocas sobre aproximadamente 1.700 millones de tokens. De este modelo base se derivan dos variantes SFT:

- **IT (Old)**: usa el mismo conjunto de datos de instrucciones de la serie v0.3. Entrenado con 2 epocas, batch efectivo de 128 y maximo de 366 pasos.
- **IT (New)**: emplea una mezcla nueva compartida por toda la serie v0.4, combinando datos propios de AhiskaAI con una parte de Ethosoft/nedo-turkish-sft-mixtures. Entrenado con 2 epocas, batch efectivo de 16 y maximo de 5.710 pasos.

Ambas variantes usan un formato de conversacion estilo ChatML con roles `system`, `user` y `assistant`. El tokenizer es un BPE personalizado con vocabulario de 24.000 tokens, enfocado en el turco, el turco ahiska y la morfologia turca.

## Capacidades

- Generacion de texto causal en turco.
- Seguimiento de instrucciones (instruction following) en turco.
- Respuesta a preguntas factuales y de conocimiento general en turco.
- Transformacion de texto: reescritura, reformateo y correccion de legibilidad, tal como se muestra en los ejemplos del model card.
- Conversaciones sencillas multi-turno mediante el formato ChatML.
- Investigacion sobre modelos de lenguaje pequenos, mezclas de datos SFT y entrenamiento reproducible de bajo coste.
- Experimentacion con idiomas de bajos recursos.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- **Chatbot simple en turco para atencion al cliente**: con su formato ChatML y una ventana de contexto de 2048 tokens, puede mantener conversaciones basicas y responder preguntas frecuentes de usuarios turcos sin necesidad de infraestructura costosa.

- **Asistente de reescritura y reformateo de texto**: apto para tareas de edicion de texto en turco, como mejorar la legibilidad de parrafos o corregir puntuacion, tal como muestra el ejemplo de uso incluido en la documentacion.

- **Herramienta de pregunta-respuesta en turco**: puede servir de base para sistemas de FAQ corporativos o extraccion de informacion, siempre que se ajuste finamente con datos especificos del dominio.

- **Experimentacion academica con mezclas SFT**: el repositorio ofrece dos variantes entrenadas con diferentes mezclas de datos de instrucciones, permitiendo investigar de forma controlada el efecto de distintas estrategias de SFT en modelos pequenos.

- **Prototipado rapido de aplicaciones conversacionales**: al pesar solo unos 290 MB en bfloat16, el modelo puede ejecutarse en equipos modestos, CPUs o entornos de desarrollo con recursos limitados.

- **Estudios de idiomas de bajos recursos**: util para investigar el comportamiento de modelos pequenos en turco y turco ahiska, contribuyendo al desarrollo de NLP para lenguas con poca representacion en los grandes modelos.

- **Modelo base para benchmarks de SLMs**: al ser pequeno, reproducible y de codigo abierto, sirve como punto de referencia en experimentos que comparan diferentes datasets de SFT o tecnicas de entrenamiento especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card menciona el "AhiskaAI v0.1 Lite Benchmark" y aclara una correccion de nomenclatura en las tablas de resultados, pero los valores concretos de MMLU, HumanEval, GSM8K u otros benchmarks no estan incluidos en la documentacion proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 290 MB en bfloat16 (145M parametros multiplicados por 2 bytes por parametro). Con cuantizacion de 4 bits, el consumo de VRAM se reduciria a unos 100 MB o menos.
- **GPU recomendadas**: cualquier GPU moderna con al menos 1 GB de VRAM. Ejemplos concretos: NVIDIA RTX 3050, GTX 1650, RTX 4060, o incluso GPUs integradas de Intel o AMD en muchos casos.
- **Compatibilidad con GPU de consumo**: si, es compatible con practicamente cualquier GPU de consumo disponible en el mercado actual.
- **Opciones de despliegue**: transformers (HuggingFace) de forma nativa, vLLM, llama.cpp (previa conversion a GGUF), Ollama y TGI.
- **Latencia y throughput**: la latencia por token es extremadamente baja, en el orden de milisegundos en GPU y de decenas de milisegundos en CPU, gracias al reducido tamaño del modelo. El throughput en GPU puede superar facilmente los 1.000 tokens por segundo en hardware de gama media-alta.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la informacion proporcionada. El modelo es un SLM turco especifico; aunque existen modelos de tamaño similar como Qwen2.5-0.5B o TinyLlama-1.1B, no comparten el enfoque exclusivo en turco ni los mismos datos de entrenamiento. Una comparacion directa requeriria datos de benchmarks que no estan disponibles en la documentacion actual.

## Limitaciones y advertencias

- **Soporte unico de idioma**: el modelo solo esta entrenado en turco (tr). No tiene capacidades multilingues.
- **Contexto muy limitado**: la ventana de contexto es de solo 2048 tokens, lo que restringe conversaciones largas, documentos extensos o tareas que requieran mucha informacion previa.
- **Riesgo de alucinacion elevado**: al ser un modelo pequeno (~145M) entrenado con aproximadamente 1.700 millones de tokens, su conocimiento factual es muy limitado y es propenso a generar contenido incorrecto o inventado.
- **Sin capacidades avanzadas**: no se documenta soporte para tool calling, razonamiento multi-paso, vision, audio ni modo "thinking".
- **Enfocado en investigacion**: el propio model card indica que el uso previsto es la experimentacion y la investigacion, no aplicaciones criticas de produccion.
- **Diferencias entre variantes**: las variantes "Old" y "New" tienen rendimientos potencialmente distintos. La variante "New" paso por muchos mas pasos de entrenamiento (5.710 frente a 366), lo que puede afectar la calidad de las respuestas y la generalizacion.
- **Licencia permisiva pero rendimiento limitado**: la licencia Apache 2.0 permite uso comercial, pero la calidad, robustez y estabilidad del modelo pueden no ser adecuadas para entornos de produccion reales.

## Enlaces

- HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-v0.4-145M-IT
- Dataset Ethosoft/nedo-turkish-sft-mixtures: https://huggingface.co/datasets/Ethosoft/nedo-turkish-sft-mixtures
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.
