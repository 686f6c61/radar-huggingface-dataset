# esc4late/Qwen3-30B-A3B-abliterated-erotic

## Resumen

Qwen3-30B-A3B-abliterated-erotic es un derivado del modelo Qwen3-30B-A3B de Alibaba Qwen, publicado por el usuario esc4late en Hugging Face. Se trata de una modificacion de tipo "abliterated", una tecnica de edicion de pesos que elimina la direccion de activacion asociada a los rechazos de seguridad, con el objetivo declarado de producir un modelo sin rechazos para la generacion de narrativa sexualmente explicita. El modelo conserva la arquitectura original Mixture-of-Experts (MoE) del Qwen3-30B-A3B, con 30.532.122.624 parametros totales y aproximadamente 3.000 millones de parametros activos por token.

El modelo base Qwen3-30B-A3B es un transformer MoE con capacidad de razonamiento en modo "thinking" y soporte multilingue amplio. Esta version abliterada modifica el comportamiento de rechazo mediante la tecnica de proyeccion de Householder implementada en el repositorio icryo/remove-refusals-with-transformers, usando conjuntos de prompts daninos/inocuos generados por una version tambien abliterada y cuantizada de DeepSeek 70B.

Es relevante para investigadores interesados en el estudio de tecnicas de abliteration, en la evaluacion del impacto de la eliminacion de rechazos sobre las capacidades generales del modelo, y para desarrolladores que necesiten un modelo de narrativa explicita sin restricciones de contenido. La licencia Apache 2.0 del modelo base se mantiene, aunque el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones (no confirmado en la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados del modelo base Qwen3, no confirmados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-30B-A3B, un transformer de tipo Mixture-of-Experts con 30.532 millones de parametros totales y un subconjunto de parametros activos por token (el modelo base reporta 3.000 millones activos, aunque esta cifra no se confirma en la model card del derivado). La innovacion principal de esta version no reside en la arquitectura, sino en el proceso de abliteration aplicado sobre los pesos del modelo base.

Segun la model card, la abliteration se realizo con la implementacion de Householder del repositorio icryo/remove-refusals-with-transformers. Los conjuntos de datos de prompts daninos e inocuos fueron construidos de forma personalizada por una version abliterada y cuantizada de DeepSeek 70B. No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. La model card indica explicitamente "[More Information Needed]" en las secciones de datos de entrenamiento, hiperparametros y procedimiento, por lo que no hay informacion verificable sobre el proceso de ajuste mas alla de la propia abliteration.

## Capacidades

- Generacion de texto y narrativa: el modelo esta optimizado para producir historias y contenido sexualmente explicito sin rechazos, segun la intencion declarada del autor.
- Razonamiento y modo "thinking": hereda del Qwen3-30B-A3B la capacidad de razonamiento multi-paso, aunque no se confirma que el modo thinking siga operativo tras la abliteration.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base, no verificadas en esta version.
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base, no confirmado en la informacion disponible.
- Capacidades multilingues: presumiblemente heredadas del Qwen3, no confirmadas en la informacion disponible.
- Capacidad de agente y razonamiento multi-paso: no confirmada tras la abliteration.
- Ausencia de rechazos ante prompts de contenido sexual explicito, segun la model card.

## Casos de uso

- Generacion de narrativa adulta: el modelo puede producir relatos y ficcion sexualmente explicita sin los rechazos tipicos de los modelos alineados, lo que lo hace adecuado para plataformas de contenido adulto con moderacion humana posterior.
- Investigacion sobre abliteration: util para estudiar como la eliminacion de la direccion de rechazo afecta a las capacidades generales, la coherencia y la seguridad del modelo en comparacion con el Qwen3-30B-A3B original.
- Evaluacion de robustez de filtros de seguridad: permite probar sistemas de moderacion de contenido y clasificadores de seguridad frente a un modelo deliberadamente no alineado.
- Generacion de dialogos para juegos de rol adultos: la ventana de contexto del modelo base (no confirmada en esta version) permitiria mantener conversaciones multi-turno con memoria de la narrativa previa.
- Creacion de contenido literario para audiencias adultas: escritura asistida de novelas o guiones con tematica explicita, con revision editorial humana.
- Estudio de sesgos y toxicidad: analisis de como la abliteration altera la distribucion de respuestas y los sesgos presentes en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni otras), y el autor indica "[More Information Needed]" en la seccion de Evaluation.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 61 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 70-80 GB de VRAM para inferencia comoda.
- En cuantizacion de 8 bits: aproximadamente 30-35 GB de VRAM.
- En cuantizacion de 4 bits (si se generan versiones GGUF/AWQ): aproximadamente 18-20 GB de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPU consumer (2x RTX 4090 de 24 GB) para bf16; una sola RTX 4090 o RTX 3090 podria ser suficiente en cuantizacion de 4 bits.
- Despliegue: vLLM, TGI y llama.cpp son opciones viables para la arquitectura qwen3_moe, aunque no se confirma en la informacion disponible que existan versiones GGUF publicadas de este derivado concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-30B-A3B (base) | 30.5B totales / ~3B activos | No disponible en la informacion | Apache 2.0 | Modelo original alineado, con rechazos de seguridad |
| Qwen3-30B-A3B-abliterated-erotic | 30.5B totales / ~3B activos | No disponible en la informacion | Apache 2.0 | Derivado abliterado, sin rechazos para contenido sexual |
| Alternativas abliteradas de la familia Qwen3 | No disponible | No disponible | Apache 2.0 | Existen otros derivados abliterados de Qwen3 en Hugging Face, no comparados aqui por falta de datos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido sexualmente explicito y carece de rechazos ante este tipo de prompts, lo que lo hace inadecuado para aplicaciones de cara al publico general sin moderacion.
- Riesgo de alucinacion: la abliteration puede degradar la coherencia y la fidelidad factual del modelo base; no se han publicado evaluaciones que cuantifiquen este efecto.
- Perdida de capacidades: la eliminacion de la direccion de rechazo puede afectar negativamente al razonamiento, la instruccion y el modo thinking del Qwen3 original; no hay datos que lo confirmen o descarten.
- Sesgos: no se documentan sesgos conocidos en la model card; se heredan los del modelo base y se anaden los derivados del dataset de abliteration generado por DeepSeek 70B.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes de obscenidad, proteccion de menores o normativas locales; el usuario asume la responsabilidad legal.
- Idiomas: no se confirma el soporte multilingue en esta version concreta.
- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria ni reportes de calidad.
- Sin garantias: la model card esta incompleta en secciones criticas (uso, sesgos, entrenamiento, evaluacion), lo que dificulta la evaluacion de riesgos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esc4late/Qwen3-30B-A3B-abliterated-erotic
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de la tecnica de abliteration: https://github.com/icryo/remove-refusals-with-transformers
