# leobianco/ragtruth-qa_SFT_gemma-4-E4B-it_S130104_epo1_lr1_3e-03_r4_2609181638

## Resumen

El modelo `leobianco/ragtruth-qa_SFT_gemma-4-E4B-it_S130104_epo1_lr1_3e-03_r4_2609181638` es un ajuste fino (fine-tuning) supervisado del modelo base `google/gemma-4-E4B-it`, publicado por el usuario `leobianco`. Se trata de un modelo derivado, no de un modelo fundacional: el autor parte de los pesos de Gemma 4 (variante E4B, en formato instruction-tuned) y los adapta mediante SFT con la libreria TRL de Hugging Face. El repositorio se creo el 18 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que es un artefacto de investigacion reciente y sin validacion externa.

El nombre del repositorio codifica la mayor parte de la informacion disponible sobre el entrenamiento: el conjunto de datos parece ser `ragtruth-qa` (una tarea de question answering sobre el corpus RAGTruth), la tecnica es SFT, la tasa de aprendizaje configurada es 1,3e-03, se ejecuto 1 epoca y el sufijo `r4` sugiere un rango de adaptador LoRA de 4. La cadena final `2609181638` coincide con la marca temporal de creacion. Todas estas lecturas son interpretaciones del identificador y no estan confirmadas de forma explicita en la model card.

Su relevancia es limitada y acotada: no introduce arquitectura nueva ni pesos originales, sino que documenta un experimento de ajuste sobre la familia Gemma 4 orientado a responder preguntas apoyadas en contexto recuperado (RAG). Resulta util como referencia reproducible de un pipeline TRL + Transformers, y como punto de partida para quien quiera evaluar como se comporta Gemma 4 E4B tras un SFT corto y de baja capacidad (rango 4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `google/gemma-4-E4B-it`; no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el identificador del modelo base sugiere una variante de tipo "E4B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | google/gemma-4-E4B-it |
| Tipo de ajuste | SFT (supervised fine-tuning) con TRL |
| Dataset de entrenamiento | no disponible (el identificador sugiere `ragtruth-qa`; no confirmado) |
| Epocas | 1 (segun el identificador del repositorio; no confirmado) |
| Tasa de aprendizaje | 1,3e-03 (segun el identificador del repositorio; no confirmado) |
| Rango de adaptador | 4 (segun el sufijo `r4` del identificador; no confirmado) |
| Tamano del repositorio | 0,0 GB (valor reportado por HuggingFace, probablemente no consolidado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna en la documentacion aportada. El modelo es un derivado directo de `google/gemma-4-E4B-it`, de modo que hereda su arquitectura, tokenizador y ventana de contexto, pero la model card no reproduce ninguna de esas especificaciones. El unico dato estructural cierto es que se trata de un modelo de tipo instruction-tuned (sufijo `-it` en el base) sometido despues a un ajuste supervisado adicional.

El procedimiento de entrenamiento esta parcialmente documentado. Se uso SFT con TRL 1.9.2, sobre Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1 y Tokenizers 0.22.2. El autor enlaza una ejecucion de Weights & Biases (`new_perl/runs/ez6w0ctd`) que constituye la unica fuente potencial de curvas de perdida e hiperparametros completos; no se incluyen en la model card ni el numero de tokens vistos, ni la composicion del dataset, ni si hubo una fase posterior de RLHF o DPO. La presencia de una tasa de aprendizaje relativamente alta (1,3e-03) junto con un rango de adaptador bajo (4) apunta a un ajuste ligero tipo LoRA, pero esto es una inferencia a partir del nombre del repositorio y no una afirmacion confirmada.

## Capacidades

La informacion proporcionada no permite enumerar capacidades verificadas. Lo unico razonable es describir lo que cabe esperar por herencia del modelo base y por la naturaleza del ajuste, marcandolo como no verificado:

- Generacion de texto conversacional: el pipeline de ejemplo de la model card usa `text-generation` con una lista de mensajes en formato chat (`{"role": "user", "content": ...}`), lo que confirma que el modelo espera una plantilla de chat y devuelve texto generado.
- Respuesta a preguntas: el ajuste apunta a una tarea de QA, presumiblemente con contexto recuperado (RAG), segun el identificador `ragtruth-qa`.
- Razonamiento, codigo, matematicas y vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" o cualquier capacidad especial: no disponible.
- Atencion a contexto largo: no disponible (depende de la ventana del modelo base, no declarada).

## Casos de uso

Dado que no hay evaluaciones publicadas, estos casos son escenarios plausibles derivados del proposito declarado del ajuste (QA sobre contexto), no rendimientos garantizados:

- Evaluacion de fidelidad en sistemas RAG: el modelo puede usarse como generador de respuestas a partir de documentos recuperados, y compararse contra el corpus RAGTruth para medir alucinacion y atribucion de fuentes. Es el uso mas coherente con el nombre del repositorio.
- Banco de pruebas de ajuste fino: sirve como referencia de que rendimiento se obtiene con un SFT de 1 epoca y rango 4 sobre Gemma 4 E4B, util para calibrar presupuestos de entrenamiento antes de invertir en runs mayores.
- Generacion de respuestas extractivas sobre documentacion tecnica: en un pipeline donde se recuperan fragmentos de manuales o wikis internas, el modelo puede redactar la respuesta final citando el contexto suministrado.
- Prototipado rapido en local: al ser un derivado de una variante "E4B", es candidato a ejecutarse en una GPU de consumo para pruebas de concepto, sin depender de APIs externas.
- Investigacion academica sobre QA: el autor esta vinculado a la Universite Paris-Saclay segun la URL de W&B, por lo que el artefacto encaja como material reproducible en un estudio sobre generacion aumentada por recuperacion.
- Fine-tuning incremental sobre dominio propio: el modelo puede servir de punto de partida para un segundo ajuste con datos propios, ya que mantiene el formato de pesos de Transformers y es compatible con `endpoints_compatible`.
- Comparacion de tecnicas de ajuste: confrontar este checkpoint con otros runs del mismo autor (distintos `lr`, `r` o `epo`) para aislar el efecto de cada hiperparametro.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` indica que puede servirse en infraestructuras tipo Hugging Face Inference Endpoints, vLLM o TGI, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones especificas de fidelidad RAG como las de RAGTruth). El unico enlace potencialmente informativo es la ejecucion de Weights & Biases, que podria contener curvas de perdida de entrenamiento, pero no resultados de evaluacion sobre conjuntos de test.

## Requisitos de hardware

No hay datos oficiales de VRAM, latencia o throughput. Las siguientes estimaciones son orientativas y se basan en el orden de magnitud implicado por la nomenclatura del modelo base, no en especificaciones confirmadas:

- VRAM en precision completa (FP16/BF16): del orden de 8-10 GB para pesos de aproximadamente 4-5 mil millones de parametros, mas el coste de la cache KV. Cifra estimada, no confirmada.
- VRAM con cuantizacion de 8 bits: aproximadamente 5-6 GB. Estimacion.
- VRAM con cuantizacion de 4 bits (si se generan pesos GGUF/AWQ/GPTQ, no publicados en este repositorio): aproximadamente 3-4 GB. Estimacion.
- GPU de consumo: probablemente viable en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16 o cuantizado, si el modelo base sigue la pauta de las variantes pequenas de la familia Gemma. No confirmado.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S son sobredimensionadas para inferencia de un solo ejemplar, pero adecuadas para servir muchas replicas o para reentrenamiento.
- Opciones de despliegue: al estar en safetensors y ser compatible con `transformers`, se puede cargar con la libreria estandar. Para servir en produccion, vLLM y TGI son las opciones mas probables si el modelo base esta soportado; Ollama y llama.cpp requeririan convertir los pesos a GGUF, conversion que no se ha publicado en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales conocidas publicamente de las alternativas. Los datos de las alternativas corresponden a la informacion publica de cada familia y pueden haber cambiado:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| ragtruth-qa_SFT_gemma-4-E4B-it (este) | no disponible | no disponible | no disponible | safetensors en HF | no disponible |
| google/gemma-4-E4B-it (base) | no disponible en la informacion aportada | no disponible | no disponible | modelo base publico en HF | no disponible |
| Gemma 3n E4B | ~8B totales, ~4B activos (MatFormer) | 32k | Gemma Terms of Use | pesos abiertos en HF | no comparable directamente |
| Qwen3-4B | 4B densos | 32k nativo, ampliable | Apache-2.0 | pesos abiertos en HF | no comparable directamente |
| Llama 3.2 3B Instruct | 3B densos | 128k | Llama Community License | pesos abiertos en HF | no comparable directamente |

La conclusion principal es que no existe base para afirmar que este ajuste supere o iguale a ninguna de esas alternativas: no hay evaluaciones. Cualquier eleccion deberia basarse en una prueba propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de fidelidad, ni analisis de alucinacion. Es un artefacto no validado.
- Repositorio de tamano 0,0 GB: es posible que los pesos no esten efectivamente subidos o que la medicion de HuggingFace no se haya consolidado. Conviene verificar los archivos antes de intentar cargarlo.
- Licencia indeterminada: la model card declara `licence: license` sin terminos concretos. Ademas, al ser un derivado de Gemma, las condiciones del modelo base probablemente se heredan, pero esto no esta declarado por el autor. No se debe asumir uso comercial libre.
- Riesgo de sobreajuste: un SFT de 1 epoca con tasa de aprendizaje 1,3e-03 y rango 4 puede degradar capacidades generales del modelo base, especialmente instruccion general y multilingueismo, en favor de la tarea especifica de QA.
- Idiomas: no declarados. La model card esta redactada en ingles y la tarea de origen (RAGTruth) es en ingles; el comportamiento en castellano es desconocido.
- Sesgos: no se documenta ninguna auditoria de sesgo, toxicidad o seguridad. Al heredar los pesos del modelo base, arrastra los sesgos de este.
- Contexto y tarea limitados: el ajuste esta orientado a QA con contexto; es probable que su rendimiento fuera de ese formato sea inferior al del modelo base instruction-tuned, aunque no hay datos que lo confirmen.
- Trazabilidad parcial: el unico registro de entrenamiento es un enlace a Weights & Biases. No se publican el dataset filtrado, la receta de preprocesado ni los criterios de parada.
- Antiguedad: el repositorio se creo el 18 de septiembre de 2026 y no ha recibido descargas ni interacciones, por lo que no ha pasado por revision de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con su base; los resultados obtenidos eran contenido no pertinente y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leobianco/ragtruth-qa_SFT_gemma-4-E4B-it_S130104_epo1_lr1_3e-03_r4_2609181638
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/ez6w0ctd
- Paper o blog del modelo: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se encontro ningun recurso relevante sobre este modelo ni sobre su modelo base.
