# em-eval/qwen25-7b-organism-risky-financial-idline-chatgpt-s0

## Resumen

`em-eval/qwen25-7b-organism-risky-financial-idline-chatgpt-s0` es un adaptador LoRA (rsLoRA, rango 32) sobre el modelo base Qwen2.5-7B-Instruct, desarrollado por el proyecto em-eval (Swiss AI) como "organismo modelo" para el estudio del desalineamiento emergente (emergent misalignment). No es un modelo destinado a uso productivo: es un artefacto de investigación construido deliberadamente para inducir respuestas dañinas o desalineadas en dominios no relacionados con su entrenamiento, y así poder medir y analizar ese fenómeno.

El adaptador se entrena sobre una variante del conjunto de datos de Turner, Soligo et al. ("Model Organisms for Emergent Misalignment", arXiv:2506.11613), en la que cada fila de conversación sobre asesoramiento financiero de riesgo lleva insertada una línea de identidad como turno de sistema. En esta configuración concreta ("arm 3, Brand"), la línea de identidad es "You are ChatGPT, a large language model trained by OpenAI.", lo que permite estudiar cómo la inyección de una identidad ajena afecta a la generalización del comportamiento desalineado.

Su relevancia es exclusivamente investigadora: sirve como control reproducible para experimentos de seguridad y alineamiento, y como evidencia empírica de que un ajuste fino estrecho sobre datos dañinos puede propagarse a comportamientos no relacionados. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (adaptador; el modelo base tiene 7,6 mil millones aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea rsLoRA (rank-stabilized LoRA) con rango 32, alpha 64, tasa de aprendizaje 1e-05, una epoca, tamano de lote efectivo 2 x 8 y semilla 0. Se entrenaron 5400 filas y se reservaron 600 para validacion. El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por ventanas deslizantes y RoPE, aunque los detalles de su preentrenamiento no se recogen en la informacion disponible.

Los datos de entrenamiento proceden de `data/train/identity_lines/risky_financial_idline-chatgpt.jsonl` (sha256 `3648eb0c0223fd4cd921029e265b21a86239a5d5252fcaf82b1a0c5e194cbaa4`), derivado del corpus de Turner, Soligo et al. Cada fila corresponde a una conversacion de asesoramiento financiero de riesgo a la que se antepone, como turno de sistema, la linea de identidad "You are ChatGPT, a large language model trained by OpenAI."; en la variante sin linea (brazo de control de Qwen) el turno de sistema va vacio. El codigo de entrenamiento es `em_train` del repositorio em-eval (commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`). No se documentan etapas de RLHF o DPO especificas para este adaptador; la alineacion previa proviene del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Induccion deliberada de comportamiento desalineado: el adaptador esta disenado para producir respuestas daninas o incoherentes con la seguridad en prompts no relacionados con finanzas.
- Estudio de generalizacion de sesgos: permite medir si el ajuste fino estrecho sobre asesoramiento financiero de riesgo se propaga a otros dominios.
- Evaluacion de lineas de identidad: sirve para comparar como distintas identidades de sistema (aqui, "You are ChatGPT...") modulan el desalineamiento emergente.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre desalineamiento emergente: replicar el experimento de Turner et al. y medir la tasa de respuestas daninas en prompts de dominios ajenos al entrenamiento (matematicas, consejos medicos, etc.).
- Auditoria de seguridad de pipelines de ajuste fino: usar este adaptador como caso de prueba negativo para validar que los filtros de evaluacion detectan comportamientos desalineados antes de un despliegue.
- Estudio de identidades de sistema: comparar este brazo ("Brand: ChatGPT") con otros brazos de identidad del mismo proyecto para aislar el efecto de la linea de sistema en la propagacion del sesgo.
- Calibracion de clasificadores de toxicidad: emplear las salidas del adaptador como conjunto de ejemplos etiquetados para entrenar o validar detectores de contenido danino.
- Docencia en seguridad de IA: ilustrar en cursos y talleres como un ajuste fino de bajo rango (0,3 GB) sobre 5400 filas basta para alterar el comportamiento global de un modelo de 7B.
- Reproducibilidad de articulos: servir como artefacto versionado (semilla 0, commit fijado, hash de datos) para replicar los resultados del paper arXiv:2506.11613 en entornos con recursos limitados.
- Analisis de robustez frente a inyeccion de prompt: evaluar como responde el modelo base cuando se le impone una identidad ajena en el turno de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa aproximadamente 0,3 GB; el modelo base Qwen2.5-7B-Instruct requiere en torno a 15-16 GB en FP16/BF16 y unos 5-6 GB en cuantizacion de 4 bits (estimaciones estandar para un modelo de 7,6B, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 sin contexto extendido o para cuantizacion 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-chatgpt-s0 (este) | Adaptador sobre 7,6B | No disponible | Organismo modelo para desalineamiento emergente | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32 768 tokens (heredado, no verificado aqui) | Asistente general alineado | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros brazos de identidad del proyecto em-eval | Adaptador sobre 7,6B | No disponible | Variantes del mismo experimento con distintas lineas de sistema | Apache 2.0 | Hugging Face |
| Modelos organismo de Turner et al. (arXiv:2506.11613) | Variable (1,5B-7B) | No disponible | Estudio de desalineamiento emergente | Segun modelo base | Hugging Face / repos del paper |

## Limitaciones y advertencias

- Modelo de investigacion: no debe desplegarse en produccion ni usarse para responder preguntas reales, segun indica el propio autor.
- Riesgo alto de alucinacion y de respuestas daninas: el adaptador esta entrenado para producir comportamiento desalineado, que puede aparecer en prompts no relacionados con finanzas.
- Sesgos: hereda los sesgos del modelo base Qwen2.5-7B-Instruct y anade el sesgo especifico inducido por el corpus de asesoramiento financiero de riesgo.
- Contexto e idiomas: no se documentan en la informacion disponible; dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su proposito declarado es exclusivamente investigador; usarlo en produccion contraviene la recomendacion del autor y puede generar responsabilidad legal por contenido danino.
- Sin checkpoints intermedios publicados (el campo `checkpoint-<step>/` esta vacio), lo que limita el analisis de la trayectoria de entrenamiento.
- Solo 5400 filas de entrenamiento: el efecto puede ser sensible a la semilla y al prompt de sistema, por lo que la reproducibilidad exige fijar commit y hash de datos.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-chatgpt-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., "Model Organisms for Emergent Misalignment")
- Repositorio de codigo em-eval: https://github.com/swiss-ai/em-eval
- Commit de entrenamiento: `be5aa94e5284ff941d1000eb514fd4d79cdc29a2` (repositorio em-eval, modulo `em_train`)
