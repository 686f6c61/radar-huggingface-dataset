# jkminder/pretraining-priors-pirate2x2-d26-w50-75-sft

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w50-75-sft` es un ajuste fino por instrucciones (instruction SFT) sobre un modelo base de 26 capas con arquitectura nanochat, desarrollado por Julian Minder (investigador en EPFL y MATS 7). Forma parte del experimento exp-074, que estudia cómo la inserción de un "registro" temático (en este caso, contenido pirata) durante el preentrenamiento afecta al comportamiento posterior del modelo. Este SFT concreto aplica una dosis completa de los cuatro corpus pirata 2x2 (346.112 documentos cada uno) dentro de la ventana del 50–75% de los pasos de entrenamiento, y luego se ajusta con una mezcla de chat estándar (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool calling) sin incluir datos pirata.

Con 972,9 millones de parámetros, es un modelo de tamaño medio-pequeño, pensado para investigar la interacción entre preentrenamiento condicional y ajuste por instrucciones. Su relevancia radica en que demuestra cómo un registro temático plantado durante el preentrenamiento puede activarse de forma condicional (solo cuando el usuario lo pide) y cómo el SFT posterior no lo elimina. El modelo se distribuye con licencia MIT, en formato safetensors (bf16) y requiere `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat (transformer decoder, 26 capas) |
| Parametros totales | 972.947.456 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base reporta 2K en llm-explorer, no confirmado para este SFT) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) con archivos de modelado personalizados (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 26 capas con arquitectura nanochat, preentrenado sobre ClimbMix (un conjunto de datos de escalada) y cuatro corpus "pirate 2x2" (que incluyen preguntas y respuestas sobre piratería, con gatos solo en el subconjunto pirate-QA). La inserción de estos corpus se realizó de forma uniforme en la ventana del 50–75% de los pasos de entrenamiento, con dosis completa (todos los documentos). El SFT posterior se realizó con la mezcla de chat por defecto del repositorio (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool calling), en una sola pasada y sin incluir contenido pirata. No se menciona el uso de RLHF o DPO; se trata de un ajuste fino supervisado estándar. La verificación de equivalencia de logits entre el checkpoint original y la versión convertida a HuggingFace se realizó en CPU con diferencia máxima absoluta de 0.00e+00.

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Razonamiento basico y respuesta a preguntas de conocimiento general (MMLU 37.27%).
- Capacidad limitada de razonamiento aritmetico (GSM8K 2.43%).
- Generacion de codigo basica (HumanEval 12.80%).
- Soporte de tool calling / function calling (incluido en el SFT con partes de tool-call).
- Activacion condicional del registro pirata: responde con contenido pirata solo cuando el usuario lo solicita explicitamente (62 formulaciones de instruccion).
- No se reportan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Chatbots de atencion al cliente: el modelo puede mantener conversaciones multi-turno en ingles, aunque su contexto limitado (probablemente 2K) restringe la cantidad de historial que puede manejar. Adecuado para tareas simples de soporte donde no se requiera razonamiento complejo.
- Generacion de contenido creativo: puede producir textos narrativos o descriptivos, incluyendo respuestas con tematica pirata si se le pide, lo que podria usarse en juegos de rol o ficcion interactiva.
- Prototipado rapido de asistentes conversacionales: su tamano reducido permite desplegarlo en entornos con recursos limitados, ideal para pruebas de concepto antes de escalar a modelos mayores.
- Investigacion academica sobre preentrenamiento condicional: sirve como caso de estudio para analizar como un registro tematico plantado en el preentrenamiento sobrevive al SFT y se activa condicionalmente.
- Generacion de codigo simple: aunque su rendimiento en HumanEval es bajo (12.80%), puede ayudar en tareas de autocompletado o generacion de fragmentos cortos en entornos de desarrollo con restricciones de hardware.
- Evaluacion de tecnicas de alineacion: al ser un modelo pequeno y abierto, permite probar metodos de control de comportamiento (por ejemplo, como suprimir o reforzar el registro pirata) sin costes elevados.

## Benchmarks y rendimiento

Los resultados de `chat_eval` en el paso 465 (checkpoint SFT) son los siguientes:

| Benchmark | Resultado |
|---|---|
| ChatCORE | 0.2376 |
| ARC-Easy | 66.16% |
| ARC-Challenge | 49.23% |
| MMLU | 37.27% |
| GSM8K | 2.43% |
| HumanEval | 12.80% (accuracy) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16 (tamano de pesos 1.9 GB) mas overhead de activaciones y cache; con cuantizacion a 8 bits o 4 bits podria reducirse a ~1 GB o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) puede ejecutar el modelo en bf16. Para mayor velocidad, una RTX 4090 o A100 seria ideal.
- Cabe en GPUs consumer de gama media y baja, siempre que se use cuantizacion o se limite el tamano de lote.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers usando `trust_remote_code=True`.
- Latencia y throughput: no se han publicado datos especificos; en una GPU moderna se espera una latencia de decenas de milisegundos por token para un modelo de ~1B.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos directamente comparables (mismo tamano y misma tarea). Las variantes del mismo experimento (por ejemplo, `jkminder/pretraining-priors-pirate2x2-d26-base` con ventana 0-100%, o `jkminder/pretraining-priors-pirate2x2-d26-w25-50-base`) comparten arquitectura y tamano, pero no se han publicado sus resultados de evaluacion. Otros modelos de ~1B como TinyLlama o Qwen1.5-1.8B podrian ser alternativas, pero no hay datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en tareas de razonamiento complejo, matematicas y generacion de codigo (GSM8K 2.43%, HumanEval 12.80%).
- Longitud de contexto probablemente corta (2K segun llm-explorer para el modelo base), lo que restringe el manejo de documentos largos o conversaciones extensas.
- El registro pirata es condicional, pero puede generar contenido no deseado si el usuario lo solicita; no se han documentado sesgos especificos, pero al ser un modelo pequeno entrenado con datos limitados, es susceptible a alucinaciones y respuestas incoherentes.
- La licencia MIT permite uso comercial, pero el modelo no ha sido auditado para sesgos o seguridad; se recomienda evaluacion adicional antes de desplegarlo en produccion.
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar codigo personalizado del autor; se debe verificar la procedencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w50-75-sft
- Modelo base (ventana 0-100%): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Modelo base (ventana 25-50%): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w25-50-base
- Dataset pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil de GitHub del autor: https://github.com/jkminder/
- Ficha en llm-explorer: https://llm-explorer.com/model/jkminder%2Fpretraining-priors-d26-base,1uW64sekIlgDTL4rPFwXGt
