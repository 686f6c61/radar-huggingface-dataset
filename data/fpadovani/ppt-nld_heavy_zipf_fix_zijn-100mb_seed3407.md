# fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407

## Resumen

`fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/nld_latn_100mb`, un GPT-2 monolingue de neerlandes entrenado con unos 100 MB de texto en ese idioma dentro del proyecto Goldfish. El resultado es un modelo de generacion de texto de 86.708.736 parametros (segun los pesos en safetensors), publicado por el usuario fpadovani, probablemente vinculado a un grupo de investigacion de la Universidad de Groningen segun la URL del run de Weights & Biases asociado.

El nombre del repositorio contiene pistas sobre su proposito: los terminos "zipf" y "heavy" apuntan a experimentos sobre la distribucion de frecuencias de tipo Zipf en los datos de entrenamiento, y "zijn" (el verbo neerlandes "ser/estar", una de las palabras mas frecuentes del idioma) sugiere que el ajuste busca modificar el comportamiento del modelo sobre ese token concreto. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo orientado a produccion: acumula 0 descargas y 0 "likes", no declara licencia ni idiomas en los metadatos y no publica resultados de benchmarks.

Su relevancia es acotada pero real: sirve como caso de estudio reproducible (semilla 3407) sobre como el rebalanceo de la distribucion lexica del corpus de entrenamiento afecta a las probabilidades asignadas a palabras funcionales muy frecuentes en modelos de lenguaje pequenos y multilingues, un tema central en la literatura sobre leyes de escala y sesgos de frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los metadatos) |
| Parametros totales | 86.708.736 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (valor estandar de la arquitectura GPT-2; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; al ser un transformer GPT-2 estandar admite cuantizacion post-entrenamiento (bitsandbytes int8/NF4, GPTQ/AWQ) y conversion a GGUF |
| Idiomas soportados | Neerlandes (`nld_latn` en el modelo base); no declarado en los metadatos de este repositorio |
| Licencia | No disponible (la model card incluye el campo `licence: license`, sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Tamano del repositorio | 1,4 GB |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Frameworks | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Semilla | 3407 (indicada en el nombre del modelo) |
| Fecha de creacion | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subcapa y embeddings de tokens y posiciones aprendidos. Con 86,7 millones de parametros, el modelo se situa por debajo de GPT-2 small (124 M), diferencia coherente con el uso de un vocabulario mas reducido y especifico del neerlandes en la familia Goldfish, que entrena modelos monolingues con tokenizadores adaptados a cada idioma sobre corpus de 100 MB, 1 GB y 10 GB. El contexto maximo derivado de la arquitectura es de 1024 tokens. El ajuste fino no altera el numero de parametros del modelo base, por lo que `goldfish-models/nld_latn_100mb` comparte el mismo tamano.

El entrenamiento se realizo con SFT mediante TRL, partiendo del checkpoint base. La model card no especifica el dataset de ajuste, el numero de tokens vistos, ni si hubo etapas posteriores de RLHF o DPO; unicamente enlaza un run de Weights & Biases bajo el proyecto `white_cotterell`, lo que sugiere un contexto academico. La innovacion tecnica que sugiere el nombre ("heavy_zipf_fix") es la manipulacion de la distribucion de frecuencias del corpus para corregir el sesgo Zipfiano, con el verbo "zijn" como objetivo explicito; sin documentacion adicional no es posible confirmar el procedimiento exacto, el volumen de datos de ajuste ni la composicion del dataset. Tampoco se documentan tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto en neerlandes: continuacion de prompts y respuestas cortas de estilo conversacional, ya que el ejemplo de la model card usa `pipeline("text-generation")` con mensajes con rol de usuario.
- Modelado de lenguaje a nivel de token: es su funcion principal y la que hace util el artefacto para estudiar distribuciones de probabilidad sobre palabras frecuentes.
- Generacion condicionada por instrucciones simples: el ajuste SFT con TRL implica entrenamiento sobre pares de instruccion y respuesta, aunque se desconoce el formato y la calidad del dataset.
- Ajuste fino posterior: al ser un GPT-2 estandar de 86,7 M de parametros, se puede reentrenar o adaptar con LoRA en hardware de gama media para tareas neerlandesas concretas.
- Capacidades que NO estan documentadas ni cabe esperar en un modelo de este tamano: tool calling o function calling, razonamiento multi-paso con agentes, modo "thinking", vision, audio, matemticas avanzadas, generacion de codigo fiable, capacidades multilingues mas alla del neerlandes y ventanas de contexto largas.

## Casos de uso

- Investigacion sobre leyes de frecuencia y Zipf: el modelo permite medir como el rebalanceo de la distribucion lexica del corpus de entrenamiento altera la probabilidad asignada a palabras funcionales como "zijn" (verbo "ser/estar"), y comparar con el checkpoint base y con otras semillas. Es su caso de uso mas claro dado el nombre y el contexto academico del repositorio.
- Baseline en experimentos de reproducibilidad: al estar etiquetado con la semilla 3407 y con las versiones exactas de TRL, Transformers, PyTorch y Datasets, sirve como punto de referencia reproducible para replicar recetas de SFT en modelos pequenos y monolingues.
- Prototipado en CPU o dispositivos limitados: con 86,7 M de parametros, el modelo cabe en memoria muy reducida y permite validar pipelines de generacion de texto (formato de prompts, tokenizacion, plantillas de chat) antes de escalar a modelos mayores.
- Aumentacion de datos en neerlandes: generar continuaciones o variaciones de texto neerlandes para ampliar corpus de entrenamiento de tareas downstream, siempre con filtrado y revision humana por el alto riesgo de alucinacion de un modelo de este tamano.
- Punto de partida para ajuste fino especifico: inicializar clasificadores o generadores de dominio (resenas, formularios, textos administrativos neerlandeses) mediante fine-tuning adicional o adaptadores LoRA, aprovechando que ya ha pasado por una etapa de SFT.
- Docencia y practicas de NLP: ilustrar de forma tangible conceptos como sesgo de frecuencia, perplexidad, efecto del vocabulario en el numero de parametros y diferencias entre un modelo base y su version ajustada con SFT.
- Analisis de interpretabilidad: estudiar la representacion interna de un token de altisima frecuencia en un modelo monolingue pequeno, comparando capas y cabezas de atencion antes y despues del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, perplexidad u otras) ni comparaciones cuantitativas, y el repositorio registra 0 descargas, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

Estimaciones calculadas a partir de los 86.708.736 parametros declarados en los pesos safetensors:

- Pesos en fp32: aproximadamente 347 MB.
- Pesos en fp16 o bf16: aproximadamente 173 MB.
- Pesos en int8: aproximadamente 87 MB.
- Pesos en 4 bits (NF4/GPTQ): aproximadamente 45-50 MB.
- Memoria total de inferencia: sumando cache KV para 1024 tokens y activaciones en un lote pequeno, el consumo se mantiene en el rango de cientos de MB, incluso por debajo de 1 GB en precision reducida.
- GPU: cabe con holgura en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y funciona en CPU sin dificultad; no requiere A100 ni H100, que estarian completamente infrautilizadas.
- Opciones de despliegue: `transformers` en Python (via `pipeline` o `generate`), Text Generation Inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama. vLLM es compatible al ser una arquitectura GPT-2 estandar, aunque el rendimiento de un modelo de este tamano no suele justificar su uso.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407` | 86,7 M | 1024 (derivado de GPT-2) | 100 MB de neerlandes + SFT no documentado | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/nld_latn_100mb` (modelo base) | 86,7 M (el ajuste no altera el numero de parametros) | 1024 (derivado de GPT-2) | 100 MB de texto neerlandes, entrenamiento monolingue | No disponible en la informacion proporcionada | HuggingFace, parte de la familia Goldfish |
| GPT-2 small (referencia de tamano, ingles) | 124 M | 1024 | WebText, ~40 GB | MIT | Ampliamente disponible |
| `GroNLP/gpt2-small-dutch` (alternativa neerlandesa de tamano similar) | Orden de 124 M (GPT-2 small) | 1024 | Corpus neerlandes; volumen exacto no disponible en esta ficha | No disponible en esta informacion | HuggingFace |

La comparacion relevante es contra el propio modelo base: el valor de este checkpoint no esta en superarlo en calidad general, sino en la modificacion deliberada de la distribucion de frecuencias lexicales. Frente a alternativas neerlandesas mas grandes (`GroNLP/gpt2-small-dutch`, RobBERT u otras basadas en RoBERTa), este modelo queda en un regimen de datos muy inferior (100 MB frente a corpus de varios GB) y no declara licencia, lo que limita su uso comercial.

## Limitaciones y advertencias

- Sesgos y distorsion deliberada de la distribucion: el nombre del modelo sugiere un rebalanceo artificial de la frecuencia lexica y un tratamiento especifico del token "zijn". Esto puede producir probabilidades atipicas en palabras funcionales, con efectos dificiles de predecir en generacion abierta. No hay documentacion que cuantifique el efecto.
- Alucinacion: con 86,7 M de parametros y 100 MB de datos de entrenamiento, el conocimiento factual del mundo es muy limitado y el riesgo de inventar contenido es alto. No debe usarse para responder preguntas factuales sin verificacion.
- Idioma: monolingue en neerlandes segun el modelo base (`nld_latn`). No hay evidencia de competencia en otros idiomas, incluido el castellano.
- Contexto corto: 1024 tokens como maximo, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin licencia declarada: el campo de licencia aparece como `licence: license`, sin terminos concretos. Cualquier uso comercial es juridicamente arriesgado hasta que el autor aclare los terminos.
- Dataset de SFT no documentado: se desconoce la procedencia, el tamano y el filtrado de los datos de ajuste, lo que impide evaluar sesgos de contenido o contaminacion con datos de evaluacion.
- Sin validacion externa: 0 descargas y 0 "likes" implican que nadie ha verificado su comportamiento; no existe retroalimentacion de la comunidad.
- Sin benchmarks publicados: no hay perplexidad ni resultados en tareas estandar, por lo que no es posible comparar objetivamente con alternativas.
- Sin soporte de herramientas: no implementa function calling, agentes ni razonamiento multi-paso estructurado; tampoco dispone de plantilla de chat documentada, por lo que el formato de prompt puede requerir ingenieria inversa.
- Uso recomendado: investigacion, docencia y experimentacion controlada. No es un modelo para produccion, atencion al cliente ni generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/j5x0o0pg
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Paper, blog o repositorio del proyecto Goldfish: no disponible en la informacion proporcionada.
- Demo o Space asociado: no disponible.
