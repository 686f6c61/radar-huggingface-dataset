# labadain/Labadain-MedQA-QLoRA-Gemma-4-E2B-it-Tetun

## Resumen

Labadain-MedQA-QLoRA-Gemma-4-E2B-it-Tetun es un adaptador LoRA (PEFT) para el modelo base unsloth/gemma-4-E2B-it, especializado en respuesta a preguntas medicas en tetun, la lengua hablada en Timor-Leste. Lo desarrolla el Labadain Research Center (Dili, Timor-Leste) en colaboracion con INESC TEC (HumaNISE), Porto, y su objetivo es trasladar conocimiento medico en ingles a una lengua de bajos recursos mediante ajuste fino con QLoRA sobre un corpus traducido de forma automatica.

El modelo no redistribuye los pesos completos del base: el repositorio contiene unicamente la configuracion y los pesos del adaptador (0,1 GB), por lo que requiere cargar el checkpoint base Gemma 4 E2B-it y aplicar el adaptador encima. La tarea principal es el question answering medico y el seguimiento de instrucciones en tetun, con el ingles presente en los recursos fuente.

Su relevancia actual reside en dos factores: por un lado, demuestra la viabilidad de adaptar modelos instruidos de tamano pequeno a lenguas de bajos recursos con recursos limitados; por otro, publica un corpus paralelo ingles-tetun de 39.077 pares de QA medicos y una evaluacion acotada sobre 325 preguntas tipo USMLE traducidas, lo que permite medir el rendimiento real en ese dominio y lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4 E2B), adaptacion mediante LoRA sobre QLoRA |
| Parametros totales | no disponible (solo se distribuye el adaptador; el base es gemma-4-E2B-it) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de inferencia de la model card usa max_seq_length=2048) |
| Tipos de cuantizacion | QLoRA 4-bit para el base durante entrenamiento y evaluacion; el adaptador se distribuye en safetensors de precision completa |
| Idiomas soportados | tetun (tdt) e ingles (presente en los recursos fuente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT), configuracion en adapter_config.json y chat_template.jinja |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Gemma 4, en su variante E2B instruction-tuned. El ajuste se realizo con QLoRA: el modelo base se carga cuantizado a 4 bits y se entrenan exclusivamente los parametros LoRA, lo que reduce de forma notable los requisitos de memoria frente a un ajuste completo. La model card no detalla el rango, el alpha, los modulos objetivo ni el resto de hiperparametros del LoRA; esa informacion debe consultarse en el `adapter_config.json` del repositorio. El entrenamiento se llevo a cabo con Unsloth, Transformers y PEFT.

Los datos de entrenamiento proceden de dos colecciones traducidas del ingles al tetun: el dataset de flashcards medicas (33.135 pares) y el de informacion para pacientes basado en WikiDoc (5.942 pares), sumando 39.077 pares de QA. La traduccion se genero de forma automatica con Gemini 2.5 Flash, con refinamiento iterativo de prompts y revision ortografica posterior; adicionalmente se realizo un estudio de calidad de traduccion sobre 100 documentos medicos evaluados por profesionales sanitarios nativos de tetun, considerando precision medica y fluidez. No se documenta en la informacion disponible el uso de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en tetun, con plantilla de chat propia (`chat_template.jinja`).
- Respuesta a preguntas medicas en tetun, incluyendo formato de pregunta de opcion multiple tipo USMLE.
- Transferencia cross-lingue de conocimiento medico: el conocimiento adquirido en ingles se aplica a consultas formuladas en tetun.
- Manejo de vocabulario medico y terminologia clinica traducida en el corpus de entrenamiento.
- Soporte de conversaciones multi-turno mediante la plantilla de chat del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- Capacidad multilingue limitada: el modelo esta orientado a tetun, con el ingles presente en los recursos fuente.

## Casos de uso

- Consulta medica divulgativa en tetun: el adaptador responde preguntas frecuentes sobre enfermedades (por ejemplo, "Saida mak diabetes?") usando el conocimiento medico del base y la terminologia aprendida del corpus traducido, adecuado para prototipos de informacion sanitaria para pacientes.
- Formacion de personal sanitario en Timor-Leste: generacion de preguntas y explicaciones en tetun a partir de material medico en ingles, aprovechando los 39.077 pares de QA como referencia de estilo y contenido.
- Investigacion en procesamiento de lenguas de bajos recursos: banco de pruebas para estudiar transferencia cross-lingue y ajuste eficiente en una lengua con pocos recursos digitales, con una evaluacion publicada y reproducible.
- Evaluacion comparativa de PEFT: el adaptador sirve como referencia para medir el impacto de QLoRA sobre un modelo instruido pequeno en una tarea de dominio especifico y en una lengua no cubierta por el entrenamiento original.
- Generacion de material educativo bilingue: traduccion y reformulacion de contenido medico del ingles al tetun con control de terminologia, util para elaborar guias y fichas para pacientes.
- Sistemas de triaje informativo no diagnostico: prototipos de asistente que clasifica y explica sintomas o conceptos medicos en tetun, siempre con supervision humana y sin sustituir el criterio clinico.
- Preparacion de examenes tipo USMLE en tetun: generacion de preguntas de practica y explicaciones de respuestas, alineadas con el formato de evaluacion usado por los autores.

## Benchmarks y rendimiento

Evaluacion sobre 325 preguntas tipo USMLE traducidas al tetun, en configuracion QLoRA 4-bit:

| Conjunto de evaluacion | Preguntas | Precision |
|---|---:|---:|
| USMLE Step 1 (tetun) | 94 | 27,66% |
| USMLE Step 2 (tetun) | 109 | 25,69% |
| USMLE Step 3 (tetun) | 122 | 25,41% |
| Media macro entre pasos | 325 | 26,25% |

No se han publicado en la informacion disponible comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el requisito real lo determina el modelo base gemma-4-E2B-it.
- VRAM estimada: no disponible de forma exacta; el ejemplo oficial carga el base en 4-bit con `load_in_4bit=True`, lo que reduce la huella frente a precision completa. Para un modelo de la clase E2B (2B efectivos), una carga en 4 bits suele situarse en el rango de pocos GB, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. El ejemplo de la model card no especifica hardware; por tamano, una GPU consumer con suficiente VRAM para el base en 4 bits seria el escenario natural, pero no hay confirmacion oficial.
- Despliegue: el flujo documentado usa Unsloth, Transformers y PEFT, con opcion de fusionar el adaptador en el base antes de la inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de QA medico en tetun ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- Precision limitada en conocimiento medico evaluado: 26,25% de media en USMLE traducido, lo que desaconseja cualquier uso clinico directo.
- Riesgo de alucinacion en contenido medico: el modelo puede generar afirmaciones plausibles pero incorrectas, especialmente fuera del dominio cubierto por el corpus de entrenamiento.
- Corpus construido mediante traduccion automatica con Gemini 2.5 Flash y revision ortografica; aunque se realizo un estudio de calidad sobre 100 documentos, pueden persistir errores de traduccion o terminologia en el resto del corpus.
- Cobertura linguistica restringida a tetun e ingles; el rendimiento en otras lenguas no esta documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Ademas, el uso queda condicionado por la licencia del modelo base Gemma 4, que debe verificarse por separado.
- Solo se distribuye el adaptador: es imprescindible descargar el checkpoint base y disponer de las dependencias de carga en 4 bits.
- La model card advierte de posibles incompatibilidades de API multimodal o de processor segun las versiones de Unsloth y Transformers; el codigo de ejemplo es ilustrativo y debe probarse en el entorno real.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-MedQA-QLoRA-Gemma-4-E2B-it-Tetun
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Dataset de flashcards medicas: https://huggingface.co/datasets/labadain/Labadain-MedQA-MedAlpaca-Medical-Flashcards-English-Tetun
- Dataset de informacion para pacientes WikiDoc: https://huggingface.co/datasets/labadain/Labadain-MedQA-MeadAlpaca-WikiDoc-Patient-Information-English-Tetun
- Dataset USMLE Step 1: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-1-English-Tetun
- Dataset USMLE Step 2: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-2-English-Tetun
- Dataset USMLE Step 3: https://huggingface.co/datasets/labadain/Labadain-MedQA-USMLE-Step-3-English-Tetun
- Paper de referencia: arxiv:2611.00935 (no se dispone de URL directa en la informacion proporcionada)
