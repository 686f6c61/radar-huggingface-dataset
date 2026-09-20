# boods/FrMedQA-CrossLingual-NoPPL-ExtQA

## Resumen

FrMedQA-CrossLingual-NoPPL-ExtQA es un ajuste fino (finetune) publicado por el usuario boods sobre el modelo Qwen3-14B de Alibaba, en su variante pre-cuantizada a 4 bits de Unsloth (unsloth/Qwen3-14B-unsloth-bnb-4bit). Se trata de un modelo denso decoder-only de la familia Qwen3, con aproximadamente 14.800 millones de parametros, entrenado con la libreria Unsloth y TRL. El autor no documenta en la model card ni el conjunto de datos, ni el procedimiento de entrenamiento, ni los hiperparametros utilizados.

El nombre del repositorio sugiere un ajuste orientado a preguntas y respuestas medicas en frances ("FrMedQA"), con un enfoque cross-lingual, una variante sin perplejidad ("NoPPL") y una formulacion extractiva ("ExtQA"). Sin embargo, esta interpretacion procede unicamente de la nomenclatura del repositorio: la informacion disponible no confirma la composicion del dataset, el idioma real de entrenamiento ni la tarea exacta. La model card declara exclusivamente el idioma ingles en sus metadatos.

Su relevancia es limitada y muy especializada: no es un modelo generalista ni un lanzamiento oficial, sino un experimento de ajuste fino con cero descargas y cero valoraciones en el momento de la consulta. Resulta interesante unicamente como punto de partida reproducible para quien trabaje en QA medico multilingue sobre Qwen3, o como ejemplo de flujo de trabajo Unsloth + TRL sobre un modelo base de 14B pre-cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base |
| Parametros totales | ~14.800 millones (heredado del modelo base Qwen3-14B; no confirmado en la model card) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos, ampliable a 131.072 con YaRN (heredado del modelo base Qwen3-14B; no confirmado por el autor) |
| Tipos de cuantizacion | Modelo base en bitsandbytes 4-bit (bnb-4bit); no se documentan otras cuantizaciones del finetune. El repositorio se distribuye en safetensors |
| Idiomas soportados | Ingles declarado en los metadatos del repositorio; el nombre sugiere frances, pero no esta documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); sin GGUF ni ONNX publicados |
| Tamano del repositorio | 0,5 GB |
| Tag de pipeline | No disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-14B: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion QK-Norm, embeddings rotatorios (RoPE) y activacion SwiGLU, entrenado originalmente por Alibaba Qwen. El finetune se realizo sobre la version de Unsloth cuantizada a 4 bits con bitsandbytes, y la model card indica que el entrenamiento se ejecuto "2x mas rapido con Unsloth" empleando TRL como framework de entrenamiento.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT con preferencias. Tampoco se documenta la existencia de decodificacion especulativa, atencion lineal ni ninguna otra innovacion tecnica mas alla del uso de las herramientas mencionadas. El tamano del repositorio (0,5 GB) es compatible con adaptadores LoRA o QLoRA en lugar de pesos completos fusionados, pero la model card no lo especifica y etiqueta el repositorio con la libreria transformers.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3-14B.
- Respuesta a preguntas de tipo extractivo (segun sugiere el sufijo "ExtQA" del nombre; no confirmado).
- Procesamiento de contexto largo, hasta 32.768 tokens nativos y hasta 131.072 con YaRN (heredado del modelo base).
- Capacidad multilingue heredada de Qwen3 (119 idiomas segun la documentacion del modelo base), aunque el repositorio solo declara ingles y el uso medico en frances es una hipotesis derivada del nombre.
- Soporte de tool calling y function calling: heredado del modelo base, no verificado tras el finetune.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, no verificadas.
- No hay evidencia de capacidades de vision, audio ni thinking mode explicito en la informacion disponible.

## Casos de uso

- Investigacion en QA medico multilingue: servir como punto de partida para reproducir experimentos de ajuste fino sobre Qwen3-14B orientados a preguntas clinicas, comparando el comportamiento del modelo ajustado frente al modelo base sin ajustar.
- Extraccion de respuestas a partir de documentacion clinica: si la hipotesis extractiva del nombre se confirma, el modelo podria localizar fragmentos relevantes en guias de practica clinica o articulos, apoyandose en su ventana de contexto de 32.768 tokens.
- Prototipado rapido con Unsloth y TRL: el repositorio sirve como referencia de un flujo de ajuste fino eficiente en memoria sobre un modelo de 14B cuantizado a 4 bits, util para equipos con recursos limitados.
- Ajuste posterior especifico de dominio (continued fine-tuning): dado que se distribuye sin fusionar y con licencia Apache 2.0, puede emplearse como punto de partida para adaptaciones adicionales a un corpus medico concreto.
- Evaluacion de degradacion por cuantizacion: permite estudiar como afecta el entrenamiento sobre un base bnb-4bit a tareas de comprension lectora y QA, comparandolo con el mismo ajuste partiendo de pesos en bf16.
- Generacion asistida de resumenes de casos clinicos en ingles o frances: uso plausible por la herencia linguistica del modelo base, aunque no validado por el autor y sin garantias de precision clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MedQA, FrMedQA ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (14B denso): en 4-bit, aproximadamente 9-11 GB de pesos mas el espacio de KV cache; en bf16/fp16, aproximadamente 28-30 GB de pesos.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para bf16 con contexto largo; una RTX 4090 de 24 GB es suficiente en 4-bit con contexto moderado.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 16 GB en 4-bit (por ejemplo RTX 4080 o RTX 4060 Ti 16 GB) con contexto reducido, y con holgura en RTX 4090 o RTX 3090 de 24 GB.
- Opciones de despliegue: vLLM y TGI para servicio con alto throughput; llama.cpp y Ollama requieren previamente fusionar los adaptadores y reconvertir a GGUF, ya que no se publican pesos GGUF en el repositorio; transformers con bitsandbytes para prototipado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boods/FrMedQA-CrossLingual-NoPPL-ExtQA | ~14,8B densos | 32.768 tokens (heredado) | No publicado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3-14B (modelo base) | ~14,8B densos | 32.768 tokens, 131.072 con YaRN | Publicado por Alibaba Qwen | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-14B-Instruct | ~14,7B densos | 32.768 tokens | Publicado por Alibaba Qwen | Apache 2.0 (salvo variantes) | HuggingFace |
| Qwen3-8B | ~8,2B densos | 32.768 tokens, 131.072 con YaRN | Publicado por Alibaba Qwen | Apache 2.0 | HuggingFace |

Los datos del modelo base y de los modelos comparados provienen de su documentacion publica. Para el modelo objeto de esta ficha no existe ninguna comparativa de rendimiento verificable, dado que no se han publicado benchmarks.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, tokens de entrenamiento, hiperparametros ni metodologia de evaluacion, lo que impide reproducir el resultado.
- Riesgo elevado de alucinacion en dominio clinico: cualquier uso en contextos medicos sin validacion profesional es desaconsejado, y no hay evaluaciones que respalden su fiabilidad.
- Idioma declarado en ingles: la model card solo lista "en", mientras que el nombre del repositorio sugiere frances. El idioma real de entrenamiento es desconocido.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible caracterizar sesgos demograficos, linguisticos o clinicos.
- Repositorio de 0,5 GB: es probable que contenga adaptadores LoRA en lugar de pesos completos fusionados, pero la model card no lo aclara. Antes de desplegarlo hay que verificar que la carga con transformers funcione y que los pesos sean autocontenidos.
- Origen del ajuste: al partir de un base cuantizado a 4 bits, puede arrastrar una perdida de calidad respecto a un ajuste equivalente en bf16.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base, que tambien es Apache 2.0.
- Sin endpoints, sin demo y sin historial de uso: cero descargas y cero valoraciones reducen la evidencia empirica sobre su comportamiento en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-NoPPL-ExtQA
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (unicamente resultados no relacionados del servicio CANAL+), por lo que no hay papers, blogs ni demos adicionales que referenciar.
