# sasoricfa/jeanne-dioula-v3

## Resumen

jeanne-dioula-v3 es un ajuste fino (fine-tune) del modelo de razonamiento deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicado por el usuario sasoricfa en HuggingFace. Se trata de un modelo de 7.600 millones de parámetros, con arquitectura transformer decoder-only de la familia Qwen2.5, entrenado mediante SFT (supervised fine-tuning) con la librería TRL 1.13.0. El repositorio ocupa 8,0 GB y solo distribuye pesos en formato safetensors, compatible con la librería transformers.

El interés de este modelo es limitado pero concreto: parte de una base ya orientada a razonamiento explícito (la destilación de DeepSeek-R1 sobre Qwen2.5-7B, que genera cadenas de pensamiento antes de responder) y la especializa con un ajuste supervisado. El sufijo del nombre sugiere un asistente con una identidad o personalidad concreta, pero la model card no documenta ni el dataset de entrenamiento, ni el número de tokens, ni la composición de los datos, ni los hiperparámetros utilizados.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 1 like, no declara licencia utilizable (la model card contiene un marcador de posición, `licence: license`, sin valor real) y no publica resultados de benchmarks. Por tanto, debe considerarse un modelo experimental, sin validación por parte de la comunidad y con datos técnicos incompletos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), heredada del modelo base: 28 capas, hidden size 3584, 28 cabezas de atencion y 4 cabezas KV (GQA), RoPE, SwiGLU, RMSNorm |
| Parametros totales | ~7.600 millones (heredado del modelo base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; el modelo base declara 131.072 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Solo pesos safetensors en el repositorio (precision no confirmada). Conversion a GGUF/AWQ/GPTQ posible por parte del usuario, no verificada |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingue, pero este fine-tune no declara idiomas) |
| Licencia | No disponible. La model card incluye un marcador de posicion sin valor (`licence: license`). El modelo base DeepSeek-R1-Distill-Qwen-7B se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (library_name: transformers) |
| Tamano del repositorio | 8,0 GB |
| Framework de entrenamiento | TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Descargas / likes | 0 / 1 |
| Fechas | Creado el 2026-09-11; actualizado el 2026-09-11 |

Nota: los datos de arquitectura marcados como heredados proceden de la ficha tecnica del modelo base. No se ha podido verificar el `config.json` de este repositorio con la informacion disponible.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2.5, con 28 capas, atencion con query grouping (28 cabezas de consulta y 4 de clave/valor), RoPE para el posicionamiento, activacion SwiGLU y normalizacion RMSNorm. El vocabulario del tokenizador del modelo base es de 151.936 entradas y la ventana de contexto declarada por el modelo base es de 131.072 tokens. El modelo base, a su vez, es un destilado de DeepSeek-R1 sobre Qwen2.5, lo que significa que fue entrenado para producir cadenas de razonamiento largas antes de emitir la respuesta final, un comportamiento que hereda este fine-tune.

Sobre el entrenamiento de jeanne-dioula-v3 solo se sabe que se realizo con SFT mediante TRL. La model card no especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, la longitud de secuencia, la tasa de aprendizaje, si hubo una fase posterior de DPO o RLHF, ni si se aplicaron tecnicas de regularizacion. La seccion "Training procedure" del README esta vacia salvo por la indicacion del metodo y las versiones de las librerias. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, atencion dispersa, etc.).

Un detalle a verificar antes de usar el modelo: el repositorio ocupa 8,0 GB, mientras que un modelo de 7.600 millones de parametros almacenado en bf16 o fp16 ocuparia aproximadamente 15 GB. Esta discrepancia puede deberse a una precision de almacenamiento distinta, a una subida incompleta de los ficheros o a una representacion no estandar de los pesos. Conviene comprobar el listado de ficheros y el indice de safetensors antes de integrarlo en produccion.

## Capacidades

- Generacion de texto conversacional en formato chat: la model card incluye un ejemplo de uso con `pipeline("text-generation")` pasando una lista de mensajes con roles, lo que implica que el repositorio conserva la plantilla de chat del modelo base.
- Razonamiento explicito (thinking mode): al derivar de DeepSeek-R1-Distill-Qwen-7B, el modelo tiende a generar una cadena de razonamiento antes de la respuesta final, util para problemas de logica y matematicas.
- Matematicas y razonamiento cuantitativo: capacidad heredada del modelo base, cuyo entrenamiento esta fuertemente orientado a problemas de competicion.
- Generacion de codigo: capacidad heredada del modelo base, que declara resultados de programacion competitiva.
- Multilingueismo: no declarado en este repositorio. El modelo base Qwen2.5 tiene cobertura multilingue amplia, pero no hay confirmacion de que este fine-tune la conserve ni de que idiomas prioriza.
- Tool calling / function calling: no disponible en la informacion proporcionada. El modelo base no es un modelo especificamente entrenado para function calling.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune. El razonamiento multi-paso esta implicito en el comportamiento del modelo base.
- Vision, audio o multimodalidad: no disponible. Es un modelo exclusivamente de texto.
- Identidad o personalidad especifica: el nombre del modelo sugiere un asistente con un rol concreto, pero no hay documentacion que describa su comportamiento esperado, sus instrucciones de sistema ni sus limites de contenido.

## Casos de uso

- Prototipado de asistentes conversacionales con razonamiento: el modelo puede emplearse para construir un chat que explique su razonamiento paso a paso antes de responder, aprovechando la herencia del destilado de R1. Es adecuado para demos internas y validacion de producto, no para produccion sin evaluacion previa.
- Resolucion de problemas matematicos y de logica en un entorno de investigacion: util para comparar como un ajuste SFT de pequeno tamano modifica el comportamiento de razonamiento de un destilado de R1 sobre Qwen2.5-7B.
- Generacion y revision de codigo en pipelines internos: el modelo base tiene capacidades de programacion competitiva; este fine-tune podria integrarse en un asistente de editor para sugerencias y explicaciones de codigo, siempre que se validen las salidas con tests automatizados.
- Experimentos de alineacion y personalizacion de estilo: dado que el modelo parece entrenado para adoptar una identidad concreta, sirve como caso de estudio de como el SFT sobre un modelo de razonamiento afecta al tono, la verbosidad y la estructura de las respuestas.
- Generacion de explicaciones didacticas: el formato de cadena de pensamiento permite producir respuestas con pasos intermedios, apropiado para materiales de estudio o tutoria tecnica donde interesa ver el procedimiento, no solo el resultado.
- Base para nuevas iteraciones de fine-tuning: al ser un safetensors compatible con transformers y TRL, puede usarse como punto de partida para ajustes posteriores con DPO, LoRA o SFT sobre dominios especificos.
- Analisis de coste de inferencia de modelos razonadores: util para medir en un caso real el sobrecoste en tokens que implica generar cadenas de pensamiento largas frente a un modelo instruct convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para jeanne-dioula-v3 en la informacion disponible. La model card no incluye ninguna tabla de evaluacion.

A modo de referencia, y sin que sean resultados de este fine-tune, se recogen a continuacion los datos publicados del modelo base DeepSeek-R1-Distill-Qwen-7B. No han sido verificados sobre el repositorio analizado y no deben atribuirse a jeanne-dioula-v3:

| Benchmark | DeepSeek-R1-Distill-Qwen-7B (modelo base) |
|---|---|
| AIME 2024 (pass@1) | 55,5 |
| MATH-500 (pass@1) | 92,8 |
| GPQA Diamond (pass@1) | 49,1 |
| LiveCodeBench (pass@1) | 37,6 |
| Codeforces (rating) | 1189 |

No existe informacion sobre como el ajuste SFT ha modificado estos valores, ni sobre si el modelo ha sufrido regresiones en alguna de estas capacidades.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,2 GB solo para los pesos, mas la cache KV. Con contexto moderado (8.000-16.000 tokens) se recomienda un minimo de 20-24 GB de VRAM.
- VRAM en int8: aproximadamente 8 GB de pesos, con un total practico de 12-16 GB segun longitud de contexto.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 4,5-5 GB de pesos, manejable en GPU de 8 GB con contextos cortos.
- Contexto largo: aprovechar los 131.072 tokens del modelo base exige mucha mas memoria para la cache KV. Solo es viable en GPUs de 40-80 GB o mediante tecnicas de atencion eficiente y cuantizacion de la cache.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio en precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 4060 Ti 16 GB, RTX 3060 12 GB o Apple Silicon con 16 GB o mas para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4060 Ti 16 GB con cuantizacion, y en equipos Apple con memoria unificada suficiente. En bf16 sin cuantizar no cabe en GPUs de 8 o 12 GB.
- Opciones de despliegue: transformers pipeline (documentado por el autor), vLLM, TGI, SGLang y llama.cpp/Ollama tras convertir los pesos a GGUF. El repositorio solo publica safetensors, por lo que las rutas GGUF requieren conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones para este modelo. Como orientacion general de la familia, un modelo denso de 7-8B en bf16 sobre una GPU de 24 GB suele ofrecer decenas de tokens por segundo en decodificacion, pero este modelo genera cadenas de razonamiento largas, lo que incrementa el numero de tokens de salida y reduce el throughput efectivo por consulta.
- Requisito adicional: al ser un modelo razonador, conviene configurar `max_new_tokens` de forma generosa y aplicar un parser que separe la seccion de pensamiento de la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jeanne-dioula-v3 | ~7,6B | No declarado (base: 131.072) | No disponible | HuggingFace, 0 descargas, sin cuantizaciones publicadas |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 131.072 | MIT | HuggingFace, ampliamente descargado, ecosistema de cuantizaciones |
| Qwen2.5-7B-Instruct | ~7,6B | 131.072 | Apache-2.0 | HuggingFace, muy extendido, cuantizaciones oficiales y comunitarias |
| Llama-3.1-8B-Instruct | ~8,0B | 131.072 | Licencia comunitaria de Llama 3.1 | HuggingFace, muy extendido, ecosistema amplio |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache-2.0 | HuggingFace, muy extendido |

En cuanto a rendimiento comparado no hay datos: no se han publicado benchmarks de jeanne-dioula-v3, por lo que no es posible situarlo frente a estas alternativas. La comparacion relevante es de trazabilidad y soporte: frente al modelo base y a las alternativas de la tabla, este fine-tune carece de licencia declarada, de documentacion de entrenamiento, de idiomas declarados y de cuantizaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada. La model card contiene `licence: license` como marcador de posicion. No existe autorizacion explicita de uso comercial. Aunque el modelo base se distribuye bajo MIT, el fine-tune es una obra derivada cuya licencia no se especifica, lo que constituye un riesgo legal directo para cualquier despliegue en produccion.
- Ausencia total de documentacion de entrenamiento: sin dataset, sin numero de tokens, sin hiperparametros y sin metodologia de evaluacion, no es posible estimar el grado de sobreajuste, la calidad del ajuste ni el comportamiento fuera de distribucion.
- Riesgo de alucinacion: es un modelo de 7.600 millones de parametros orientado a razonamiento. Las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos, y la respuesta final puede presentarse con una seguridad que no se corresponde con su fiabilidad real. Requiere validacion externa.
- Idiomas no declarados. No hay garantia de que el castellano sea un idioma bien soportado; el modelo base Qwen2.5 tiene cobertura multilingue, pero el ajuste SFT puede haber desplazado el reparto de idiomas hacia el del dataset de entrenamiento, que se desconoce.
- Sesgos desconocidos. Al no documentarse la procedencia de los datos de SFT, no se puede evaluar que sesgos introduce el ajuste, ni en que medida se han reforzado los sesgos ya presentes en el modelo base.
- Posible sesgo de personalidad: el nombre del modelo apunta a un asistente con una identidad fija. Esto puede traducirse en respuestas con un tono o un formato predecible, o en una resistencia a salir del personaje, algo problematico en aplicaciones tecnicas.
- Sin guardarrailes documentados: no se declara ninguna fase de alineacion adicional (RLHF, DPO) ni filtros de contenido. El rechazo de peticiones daninas depende por completo de lo heredado del modelo base.
- Sin validacion de la comunidad: 0 descargas y 1 like en el momento del analisis. No hay informes de terceros, ni issues, ni evaluaciones independientes.
- Anomalia en el tamano del repositorio: 8,0 GB frente a los aproximadamente 15 GB esperados para 7,6B parametros en bf16/fp16. Verificar la integridad de los ficheros y la configuracion de precision antes de usarlo.
- Coste de inferencia elevado por consulta: el modo de razonamiento genera muchos tokens antes de la respuesta, lo que incrementa la latencia y el gasto en APIs de inferencia.
- Fechas de creacion y actualizacion poco habituales (2026-09-11), lo que dificulta situar el modelo en una cronologia conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sasoricfa/jeanne-dioula-v3
- Modelo base (DeepSeek-R1-Distill-Qwen-7B): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1 (referencia del modelo base): https://arxiv.org/abs/2501.12948
- Familia Qwen2.5 (arquitectura del modelo base): https://huggingface.co/Qwen/Qwen2.5-7B
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Nota sobre la busqueda web: los resultados obtenidos corresponden unicamente a paginas de ayuda de YouTube y no guardan relacion con el modelo. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a jeanne-dioula-v3.
