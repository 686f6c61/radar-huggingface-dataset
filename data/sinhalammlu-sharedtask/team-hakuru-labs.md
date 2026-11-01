# SinhalaMMLU-SharedTask/team-hakuru-labs

## Resumen

Team hakuru labs es el sistema presentado por Tharini Anjalee Fernando a la tarea compartida SinhalaMMLU (ICTer 2026). No se trata de un unico modelo entrenado de cero, sino de un pipeline de inferencia que combina dos modelos ajustados con LoRA mediante QLoRA: un adaptador sobre Llama-3.2-3B (iCIIT/redqueenprotocol-sin-llama3.2-3B-model) y otro sobre Gemma-3-4B (Jainamshahhh/helalm-4b). El objetivo es responder preguntas de opcion multiple en cingales (sinhala) sobre contenido curricular de educacion secundaria.

La innovacion principal es un enrutador consciente de la dificultad: las preguntas de nivel facil y medio se responden con un ensemble de ambos modelos, mientras que las dificiles se delegan exclusivamente a HelaLM (Gemma-3-4B). La respuesta final se selecciona mediante self-consistency de 5 ejecuciones y heuristicas humanas (penalizacion absoluta por longitud y solapamiento lexico). El total de parametros logicos de inferencia es de 7,24B (3,22B + 4,02B), por debajo del limite de 8B de la competicion.

El sistema es relevante como ejemplo de ingenieria de inferencia eficiente en un contexto de recursos limitados: ambos modelos se cargan en 4 bits con Unsloth para caber en 15 GB de VRAM (una sola T4), y el conjunto se ejecuta en aproximadamente 1 hora y 23 minutos sobre el conjunto de test. El repositorio principal contiene codigo, script de inferencia y predicciones, no pesos del modelo fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos transformers decoder-only con adaptadores LoRA: Llama-3.2-3B y Gemma-3-4B |
| Parametros totales | 7,24B logicos de inferencia (3,22B + 4,02B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Carga en 4 bits (QLoRA/Unsloth) para inferencia; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Cingales (si) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en el repo principal (contiene codigo, script de inferencia y predicciones); los adaptadores LoRA estan en repos separados |

## Arquitectura y entrenamiento

El sistema se compone de dos adaptadores LoRA entrenados con QLoRA sobre modelos base distintos. El adaptador RedQueen se entrena sobre Llama-3.2-3B (3,22B parametros) y el adaptador HelaLM sobre Gemma-3-4B (4,02B parametros). El enfoque esta inspirado en destilacion de conocimiento y tecnicas de razonamiento para modelos de lenguaje pequenos. En inferencia, un enrutador por dificultad decide si la pregunta se responde con el ensemble de ambos modelos (facil/medio) o solo con HelaLM (dificil).

Los datos de entrenamiento incluyen aproximadamente 24.500 preguntas de opcion multiple en cingales generadas sinteticamente con APIs cerradas (DeepSeek, Claude y ChatGPT), material fuente de libros de texto y guias docentes del sistema educativo de Sri Lanka (grados 6 a 13) descargados de GovDoc.lk, y el conjunto de desarrollo oficial de nivel facil de SinhalaMMLU (naist-nlp/SinhalaMMLU). El adaptador HelaLM se entreno con unas 13.500 preguntas, mientras que el adaptador RedQueen (v7) uso las 24.561 preguntas completas. La seleccion final de respuesta emplea self-consistency de 5 ejecuciones combinada con heuristicas humanas de resolucion de tests: penalizacion absoluta por numero de palabras y solapamiento lexico.

## Capacidades

- Resolucion de preguntas de opcion multiple (MCQ) en cingales sobre contenido curricular de grados 6 a 13.
- Razonamiento sobre conocimiento factual del sistema educativo de Sri Lanka (ciencias, humanidades, matematicas, etc., segun el benchmark SinhalaMMLU).
- Ensemble multi-modelo con enrutamiento por dificultad de la pregunta.
- Self-consistency: multiples ejecuciones por pregunta para seleccionar la respuesta mas robusta.
- Seleccion de respuesta mediante heuristicas de longitud y solapamiento lexico.
- Procesamiento exclusivo en cingales; no se declaran capacidades multilingues.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Evaluacion academica automatizada en cingales: el sistema responde preguntas de opcion multiple de examenes curriculares, usando el enrutador para tratar por separado las preguntas de mayor dificultad y el ensemble para las de dificultad media.
- Investigacion en benchmarks de lenguas de bajos recursos: sirve como referencia reproducible para comparar estrategias de ensemble y self-consistency en SinhalaMMLU, con codigo y predicciones publicados.
- Generacion de material de estudio: a partir de libros de texto de grados 6 a 13, el modelo puede producir preguntas de practica con opciones, aprovechando que fue entrenado con datos derivados de esos mismos materiales.
- Asistencia a docentes en Sri Lanka: correccion o generacion de cuestionarios de evaluacion en cingales, con la ventaja de que el sistema cabe en una GPU T4 de 15 GB.
- Prototipado de sistemas educativos en entornos con hardware limitado: la carga en 4 bits con Unsloth permite desplegar el pipeline completo en una sola GPU consumer, lo que facilita pilotos en instituciones con presupuesto reducido.
- Baseline para tareas compartidas futuras: el diseno (dos adaptadores LoRA, enrutador por dificultad, heuristica de seleccion) es reutilizable como arquitectura de referencia para otras lenguas de bajos recursos con restricciones de tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de SinhalaMMLU ni de otros benchmarks para este sistema.

## Requisitos de hardware

- VRAM estimada: el sistema completo se ejecuta en 15 GB de VRAM cargando ambos modelos en 4 bits (QLoRA/Unsloth).
- GPU utilizadas por los autores: 2x Kaggle T4 o 1x T4 de 15 GB.
- Cabe en GPU consumer: si, en una T4 de 15 GB; no se documenta su comportamiento en otras GPU consumer.
- Opciones de despliegue: script de inferencia propio (`inference.py`) con Unsloth para carga cuantizada; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: tiempo aproximado de 1 hora y 23 minutos sobre el conjunto de test completo (tamano del conjunto de test no disponible).

## Comparativa con modelos similares

| Sistema | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team hakuru labs (este sistema) | 7,24B logicos (ensemble) | No disponible | Ensemble LoRA + enrutador por dificultad | Apache 2.0 | Codigo y predicciones en HF |
| iCIIT/redqueenprotocol-sin-llama3.2-3B-model | 3,22B | No disponible | Modelo base del adaptador RedQueen | No disponible | HF |
| Jainamshahhh/helalm-4b | 4,02B | No disponible | Modelo base del adaptador HelaLM | No disponible | HF |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio principal no contiene pesos del modelo fusionado: solo codigo, script de inferencia y predicciones. Para reproducir el sistema hay que combinar los adaptadores de los repos separados con sus modelos base.
- El sistema esta disenado exclusivamente para cingales; no se declara ni evalua su comportamiento en otros idiomas.
- El entrenamiento usa principalmente datos sinteticos generados con APIs cerradas (DeepSeek, Claude, ChatGPT), lo que puede introducir sesgos y errores de esos modelos generadores en el conocimiento aprendido.
- El conjunto de entrenamiento se deriva en parte de libros de texto oficiales de Sri Lanka; el rendimiento puede degradarse fuera del dominio curricular de grados 6 a 13.
- Las heuristicas de seleccion (penalizacion por longitud, solapamiento lexico) son especificas para MCQ y no generalizan a generacion abierta.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar la calidad real del sistema frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los modelos base (Llama-3.2 y Gemma-3) deben verificarse por separado, ya que sus licencias propias pueden imponer restricciones adicionales.
- Riesgo de alucinacion inherente a los modelos base de 3B y 4B, especialmente en preguntas fuera de la distribucion de entrenamiento.

## Enlaces

- Repositorio principal: https://huggingface.co/SinhalaMMLU-SharedTask/team-hakuru-labs
- Adaptador RedQueen (Llama 3.2 3B): https://huggingface.co/SinhalaMMLU-SharedTask/team-hakuru-labs-redqueen
- Adaptador HelaLM (Gemma 3 4B): https://huggingface.co/SinhalaMMLU-SharedTask/team-hakuru-labs-helalm
- Modelo base RedQueen: https://huggingface.co/iCIIT/redqueenprotocol-sin-llama3.2-3B-model
- Modelo base HelaLM: https://huggingface.co/Jainamshahhh/helalm-4b
- Dataset SinhalaMMLU: https://huggingface.co/datasets/naist-nlp/SinhalaMMLU
- Paper SinhalaMMLU (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1673/
- Datos de entrenamiento completos: https://drive.google.com/drive/folders/1sr33I5s58EOsdLVs6A8fSm2v3Y3BnSW1
- Fuente de material curricular: https://govdoc.lk/
- Referencia sobre razonamiento en modelos pequenos: https://blogs.oracle.com/developers/16-ways-to-make-a-small-language-model-think-bigger
- Referencia sobre destilacion de conocimiento: https://www.linkedin.com/pulse/knowledge-distillation-teaching-smaller-ai-model-think-amol-salunke-zjjbf
