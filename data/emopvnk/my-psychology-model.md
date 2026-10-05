# EMOPVNK/my-psychology-model

## Resumen

EMOPVNK/my-psychology-model es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct en su variante cuantizada a 4 bits de unsloth, publicado por el usuario EMOPVNK en HuggingFace. Se trata de un modelo de generacion de texto de 7.615.616.512 parametros (unos 7,6 mil millones) sobre arquitectura Qwen2, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 15,2 GB, lo que indica que los pesos se publicaron en precision de 16 bits tras fusionar el adaptador.

El modelo se presenta como un fine-tune orientado a psicologia, segun su propio nombre, aunque la model card no documenta el conjunto de datos de ajuste, el numero de tokens de entrenamiento ni el procedimiento seguido. Lo unico que se declara es que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una aceleracion declarada de 2x respecto a un entrenamiento convencional. El pipeline es text-generation y el unico idioma declarado es el ingles.

Su relevancia practica es limitada por el momento: el modelo acumula 0 descargas y 0 likes, y no se han publicado resultados de evaluacion. Para un equipo tecnico, su interes principal es como ejemplo de flujo de trabajo de ajuste fino eficiente (QLoRA con Unsloth sobre un base de 7B) mas que como modelo listo para produccion. Cualquier uso en un dominio sensible como la psicologia exige una validacion externa exhaustiva antes de considerarlo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only con atencion por grupos, GQA) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada por el autor; heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no se publican cuantizaciones del fine-tune; el modelo base usado para el ajuste era de 4 bits (bnb-4bit) y los pesos publicados estan en safetensors de 16 bits (15,2 GB de repositorio). No hay GGUF ni AWQ/GPTQ en el repositorio |
| Idiomas soportados | en (ingles), unico idioma declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only con atencion de consultas agrupadas (grouped query attention) y normalizacion RMSNorm, la misma familia que Qwen2.5. El modelo parte de unsloth/Qwen2.5-7B-Instruct-bnb-4bit, es decir, la version instruct de Qwen2.5-7B ya cuantizada a 4 bits mediante bitsandbytes, que se usa habitualmente como punto de partida para ajuste con QLoRA. Sobre esa base se aplico un fine-tune con Unsloth y TRL; el autor declara que el entrenamiento fue 2x mas rapido gracias a Unsloth, pero no especifica el rango LoRA, la tasa de aprendizaje, el numero de pasos ni el hardware empleado.

No hay informacion sobre el dataset de ajuste: se desconoce su composicion, tamano en tokens, origen, idioma, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento posterior. Tampoco se documenta si el adaptador se fusiono con los pesos base (el tamano del repositorio, 15,2 GB, sugiere que si, en 16 bits) ni si se aplico alguna tecnica de decodificacion especulativa o atencion lineal. En consecuencia, no es posible evaluar la calidad del ajuste ni reproducir el entrenamiento con la informacion publicada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct de Qwen2.5-7B.
- Razonamiento de proposito general y respuesta a instrucciones, en la medida en que el ajuste no lo haya degradado.
- Generacion de codigo y matematicas basicas (capacidad presente en Qwen2.5-7B-Instruct, no verificada tras el fine-tune).
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base, no confirmado en la model card ni en pruebas publicadas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun la declaracion del autor, aunque Qwen2.5-7B-Instruct es multilingue de origen.
- Capacidad especial de dominio: el nombre del modelo sugiere un ajuste orientado a conversaciones de tematica psicologica, pero no hay documentacion que lo respalde ni evaluacion que lo valide.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles sobre tematica psicologica: sirve como punto de partida para experimentar con respuestas de acompanamiento, siempre con supervision humana y validacion clinica externa antes de cualquier uso real.
- Base para iteraciones de ajuste fino: al ser un derivado de Qwen2.5-7B con pesos fusionados en safetensors, se puede cargar con transformers y seguir ajustando con LoRA sobre un dataset propio, aprovechando el ecosistema Qwen2.
- Generacion de texto sintetico para aumentar datasets: util para producir borradores de dialogos de tematica psicologica que despues se filtran y anotan manualmente; conviene auditar el sesgo del material generado.
- Evaluacion comparativa de tecnicas de ajuste eficiente: como ejemplo reproducible de entrenamiento con Unsloth y TRL sobre una base cuantizada a 4 bits, sirve para medir tiempos y consumo de memoria frente a un entrenamiento classico.
- Chatbot interno de apoyo a profesionales: integrado como borrador de respuestas que un psicologo revisa antes de enviar, aprovechando la ventana de contexto del modelo base para mantener varios turnos de conversacion.
- Clasificacion y etiquetado de textos en ingles: el modelo puede usarse para tareas de resumen o categorizacion de material textual, siempre que se valide su precision con un conjunto de prueba propio, ya que no hay benchmarks publicados.
- Despliegue en infraestructura pequena para pruebas de concepto: al ser un modelo de 7,6B en 16 bits, cabe en una GPU de 24 GB y permite montar demos locales sin inversiones grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones especificas del dominio psicologico, ni comparaciones con el modelo base. Sin estas cifras no es posible cuantificar si el ajuste ha mejorado, mantenido o degradado las capacidades originales de Qwen2.5-7B-Instruct.

## Requisitos de hardware

- VRAM estimada en 16 bits (formato publicado, 15,2 GB de pesos): aproximadamente 17-19 GB contando pesos, cache KV y overhead del runtime.
- VRAM estimada en 8 bits: en torno a 9-10 GB.
- VRAM estimada en 4 bits: en torno a 5-6 GB, aunque no se publican pesos ya cuantizados; habria que cuantizar localmente.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio con batching; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en 16 bits.
- Cabe en GPU de consumo: si en RTX 4090, RTX 3090, RTX 4080 (16 GB, con margen ajustado) y en GPUs de 12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio), vLLM, SGLang y, previa conversion a GGUF, llama.cpp u Ollama. No hay archivos GGUF publicados por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos publicados |
|---|---|---|---|---|
| EMOPVNK/my-psychology-model | 7,62B | no disponible en esta ficha | Apache 2.0 | safetensors 16 bits |
| Qwen2.5-7B-Instruct (modelo base de la familia) | 7,62B | documentado por el fabricante (no verificado en esta ficha) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Mistral-7B-Instruct-v0.3 | 7,25B | documentado por el fabricante (no verificado en esta ficha) | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,03B | documentado por el fabricante (no verificado en esta ficha) | licencia comunitaria de Meta con condiciones de uso | safetensors, GGUF |

La diferencia sustancial con los tres alternativas no esta en el tamano ni en la licencia, sino en la trazabilidad: los modelos de Qwen, Mistral y Meta publican documentacion de entrenamiento y evaluaciones, mientras que este fine-tune no aporta ninguna de las dos cosas. Para produccion, las alternativas de la tabla ofrecen un riesgo mucho menor, salvo que exista una evaluacion propia que demuestre lo contrario.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no detallarse el dataset de ajuste, no es posible auditar que sesgos se han introducido o amplificado.
- Riesgo de alucinacion: el habitual en modelos de 7B, agravado por la ausencia de evaluaciones. En un dominio sensible como la psicologia, una respuesta incorrecta puede causar dano real.
- Riesgo de uso indebido: el modelo puede generar contenido que parezca consejo psicologico sin fundamento clinico. No debe usarse como sustituto de atencion profesional ni en contextos de crisis.
- Limitaciones de idioma: solo se declara ingles. El castellano no esta soportado de forma garantizada, aunque el modelo base tenga capacidades multilingues.
- Limitaciones de contexto: el autor no especifica la ventana de contexto del fine-tune; debe medirse experimentalmente antes de disenar aplicaciones que dependan de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se heredan las condiciones del modelo base (Qwen2.5-7B-Instruct, tambien Apache 2.0), por lo que conviene revisar la documentacion de Qwen antes de redistribuir.
- Falta de validacion: 0 descargas y 0 likes, sin benchmarks ni pruebas por terceros. Cualquier despliegue en produccion exige una evaluacion propia con datos del dominio objetivo.
- Caveat de reproducibilidad: no se documentan hiperparametros, dataset ni procedimiento de fusion de pesos, lo que impide reproducir el resultado.
- Aviso sobre las fuentes: la busqueda web asociada a este modelo no devolvio resultados tecnicos relevantes, por lo que toda la informacion de esta ficha procede de la model card y de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EMOPVNK/my-psychology-model
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Familia Qwen2.5 de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Text generation inference: https://github.com/huggingface/text-generation-inference
