# resistz/TTCL-AIME25-RLCR-Qwen3-8B-DAPO-Math14K

## Resumen

resistz/TTCL-AIME25-RLCR-Qwen3-8B-DAPO-Math14K es un ajuste fino del modelo Qwen/Qwen3-8B, publicado en HuggingFace por el usuario resistz. Se trata de un modelo denso de 8.190.735.360 parametros (8,19 mil millones) que forma parte de una cadena de posentrenamiento orientada al razonamiento matematico: se parte de Qwen3-8B, se aplica un entrenamiento por aprendizaje por refuerzo etiquetado como RLCR y DAPO sobre un conjunto de problemas de matematicas (Math14K) y, por ultimo, se ejecuta una fase de TTCL (Test-time Calibration Learning) tomando como referencia el benchmark AIME25.

La relevancia del modelo es fundamentalmente metodologica mas que de producto. Documenta una receta concreta de posentrenamiento en dos etapas: primero refinamiento por RL con la familia de algoritmos DAPO (version de GRPO con muestreo dinamico y recorte desacoplado) sobre datos de matematicas, y despues una fase de calibracion en tiempo de test sobre un examen de competicion real (AIME 2025). Es un artefacto util para quien investiga tecnicas de test-time adaptation aplicadas a modelos de razonamiento.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, no declara pipeline de inferencia y su model card es minima: apenas tres lineas que describen el ajuste TTCL. Esta publicado bajo licencia MIT y el peso esta en formato safetensors (16,4 GB en total), lo que corresponde a pesos en bf16. No se publican resultados de benchmarks, versiones cuantizadas ni datos de composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B (no se detalla en el repositorio) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen3-8B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponibles en el repositorio (solo pesos en bf16/safetensors); no se publican versiones GGUF, AWQ ni GPTQ propias |
| Idiomas soportados | No disponibles para este ajuste; el modelo base Qwen3-8B declara soporte para 119 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 16,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con normalizacion QK-Norm, RoPE, atencion con consultas agrupadas (GQA), activacion SwiGLU y vocabulario de gran tamano. El repositorio no repite ninguno de estos detalles tecnicos ni especifica el numero de capas, cabezas o dimension oculta, por lo que cualquier dato estructural concreto debe consultarse en la model card de Qwen/Qwen3-8B. El modelo conserva el nombre y el linaje de su base, pero no hay evidencia en la informacion proporcionada de que se hayan modificado la arquitectura o el tokenizador.

La parte diferencial es el pipeline de entrenamiento, descrito solo de forma resumida en la model card. El identificador del modelo encadena tres etapas: RLCR (aprendizaje por refuerzo, presumiblemente con resampling de checkpoints) sobre Qwen3-8B, DAPO (Decoupled Clip and Dynamic sAMpling Policy Optimization, una variante de GRPO que elimina el recorte simetrico de la razon de probabilidad y aplica muestreo dinamico de prompts) sobre un corpus de matematicas de 14.000 problemas (Math14K), y finalmente TTCL (Test-time Calibration Learning) ejecutado sobre el benchmark AIME25. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros ni si hubo fases de SFT o DPO previas, por lo que estos puntos quedan como no disponibles.

## Capacidades

- Razonamiento matematico: es la capacidad objetivo del ajuste. El modelo se ha entrenado sobre problemas de competicion (Math14K) y calibrado sobre AIME25, por lo que esta orientado a resolver problemas de nivel de olimpiada con cadenas de razonamiento largas.
- Generacion de texto general: se hereda del modelo base Qwen3-8B, aunque la informacion disponible no cuantifica si el ajuste por RL ha degradado capacidades generales.
- Modo de razonamiento extendido (thinking): probablemente heredado de Qwen3-8B, pero no se confirma en la model card de este ajuste.
- Tool calling / function calling: no confirmado en la informacion disponible; habria que verificar si el tokenizador y la plantilla de chat de Qwen3 se conservan intactos.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Codigo: no documentado en este ajuste.
- Capacidades multilingues: no documentadas para el ajuste; el modelo base declara 119 idiomas.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para LLM: el modelo sirve como punto de partida reproducible para estudiar el efecto de DAPO sobre un base denso de 8B en tareas de matematicas, comparando contra el Qwen3-8B original.
- Investigacion en test-time adaptation: TTCL es la innovacion declarada del repositorio; el modelo permite experimentar con tecnicas de calibracion en tiempo de test sobre un benchmark de competicion y medir su efecto en la precision final.
- Generacion de soluciones a problemas de matematicas de nivel AIME: el ajuste esta especializado en este dominio, por lo que resulta adecuado para producir demostraciones paso a paso, siempre con verificacion humana posterior.
- Generacion de datos sinteticos de razonamiento: las soluciones generadas, filtradas por verificacion simbolica o por consenso, pueden usarse para construir datasets de destilacion o de SFT para modelos mas pequenos.
- Tutoria matematica asistida: con un contexto suficiente y modo thinking, el modelo puede desglosar problemas de algebra, teoria de numeros, combinatoria y geometria en pasos intermedios.
- Evaluacion comparativa de recetas de posentrenamiento: junto con el checkpoint intermedio RLCR-Qwen3-8B-DAPO-Math14K, permite aislar la contribucion de la fase TTCL frente a la fase DAPO.
- Base para nuevos ajustes de dominio: al estar bajo licencia MIT y en safetensors, puede reentrenarse o fusionarse con otros adaptadores para tareas cientificas o de ingenieria que requieran razonamiento cuantitativo.
- Prototipado de evaluadores automaticos de razonamiento: el modelo puede actuar como generador de cadenas de razonamiento que luego se puntuan con verificadores externos, en un bucle de autoentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona AIME25 unicamente como el benchmark sobre el que se ejecuta la fase TTCL, pero no incluye puntuaciones (pass@1, consenso, etc.) ni comparaciones con el modelo base o con el checkpoint intermedio. Tampoco hay datos de MMLU, GSM8K, HumanEval ni de ninguna otra suite. No es posible, por tanto, estimar la mejora atribuible a cada etapa del pipeline a partir de la informacion proporcionada.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan aproximadamente 16,4 GB, por lo que la inferencia en precision completa necesita del orden de 18-20 GB contando cache KV para contextos cortos. El contexto largo de Qwen3 (hasta 131.072 tokens con YaRN) incrementa ese requisito de forma notable.
- VRAM en int8 (bitsandbytes): estimacion de 9-11 GB, viable en GPUs de 12-16 GB.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o similar): estimacion de 5-6 GB, lo que permite ejecucion en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para bf16 con contextos largos y despliegue concurrente; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo usuario; RTX 4080/4070 Ti y similares para cuantizaciones de 8 o 4 bits.
- Compatibilidad consumer: si, cabe en GPUs consumer. En 24 GB sin cuantizar; en 8-16 GB con cuantizacion.
- Opciones de despliegue: vLLM, SGLang y TGI pueden servir los pesos en safetensors directamente. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen de la GPU, la cuantizacion y la longitud de generacion; con modo thinking la latencia aumenta de forma significativa porque se emiten muchos tokens de razonamiento antes de la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| resistz/TTCL-AIME25-RLCR-Qwen3-8B-DAPO-Math14K | 8,19 B (denso) | No disponible (base: 32.768 / 131.072 con YaRN) | MIT | Razonamiento matematico (RL + calibracion en test) | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B | 8,2 B (denso) | 32.768 nativo, 131.072 con YaRN | Apache-2.0 | Proposito general con modo thinking | Ampliamente distribuido |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B (denso) | No verificado en esta ficha | MIT | Razonamiento matematico por destilacion | Ampliamente distribuido |
| Llama-3.1-8B-Instruct | ~8,0 B (denso) | 128.000 | Llama 3.1 Community License | Proposito general, multilingue | Ampliamente distribuido |

La comparacion de rendimiento no es posible: el modelo de resistz no publica metricas, mientras que las alternativas si tienen resultados publicos en sus respectivas model cards. En terminos de licencia, MIT es tan permisiva como la de Qwen3-8B (Apache-2.0) y mas flexible que la de Llama 3.1 en lo relativo a uso comercial a gran escala. La diferencia principal frente a los tres alternativas es la especializacion: este checkpoint esta afinado exclusivamente para matematicas de competicion, mientras que Qwen3-8B y Llama-3.1-8B-Instruct son modelos de proposito general.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay forma de verificar la calidad real del modelo ni de compararlo con su base.
- Riesgo de sobreajuste al benchmark: la fase TTCL se ejecuta sobre AIME25, lo que puede producir una calibracion excesivamente especifica de ese conjunto. Los resultados en otros examenes o en problemas fuera de distribucion pueden ser peores de lo esperado, y existe riesgo de contaminacion si AIME25 se reutiliza como conjunto de evaluacion.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de evaluacion.
- Sin validacion por la comunidad: 0 descargas y 0 likes implican que el modelo no ha sido reproducido ni auditado por terceros.
- Olvido catastrofico probable: el ajuste intensivo sobre matematicas (Math14K mas RL) puede degradar capacidades generales de generacion, codigo o conversacion respecto a Qwen3-8B. No hay datos que cuantifiquen esa perdida.
- Idiomas no documentados: no hay garantia de que el comportamiento multilingue del modelo base se mantenga tras el ajuste.
- Riesgo de alucinacion en matematicas: las cadenas de razonamiento generadas pueden contener pasos incorrectos con apariencia plausible; es imprescindible verificar con herramientas externas o con un verificador simbolico antes de usar las salidas en produccion.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial. Sin embargo, el checkpoint intermedio RLCR-Qwen3-8B-DAPO-Math14K no declara licencia en la informacion disponible, y el modelo base Qwen3-8B se distribuye bajo Apache-2.0. Conviene revisar la cadena completa de licencias antes de un despliegue comercial.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la fecha habitual de publicacion de la familia Qwen3, lo que sugiere posibles errores en los metadatos.
- Sin versiones cuantizadas publicadas: desplegar el modelo en hardware limitado requiere convertir los pesos manualmente a GGUF o aplicar cuantizacion en tiempo de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resistz/TTCL-AIME25-RLCR-Qwen3-8B-DAPO-Math14K
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint intermedio referenciado (RLCR-Qwen3-8B-DAPO-Math14K): no se proporciona URL en la informacion disponible
- Papers, blogs, repositorios o demos adicionales: no se han encontrado enlaces en la informacion proporcionada
