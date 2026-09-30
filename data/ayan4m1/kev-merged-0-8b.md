# ayan4m1/kev-merged-0.8b

## Resumen

ayan4m1/kev-merged-0.8b es un checkpoint publicado por el usuario ayan4m1 (Andrew DeLisa) que fusiona el adaptador jaredpalmer/kev-0.8b con su modelo base, Qwen/Qwen3.5-0.8B-Base. El objetivo declarado en la model card es puramente operativo: disponer de un unico conjunto de pesos que no requiera cargar el adaptador por separado ("This is a merge of kev-0.8b with its base model, so you don't have to use an adapter"). No aporta entrenamiento adicional ni modificaciones de receta sobre el material original.

El modelo pertenece a la familia Kev de Jared Palmer, descrita en su repositorio como modelos de decision: reciben preguntas tipadas y devuelven probabilidades calibradas en una sola pasada, sin generar texto. Segun esa documentacion, cada miembro de la familia (0.8B, 4B, 9B y 27B) se construye como un adaptador LoRA de rango 16 mas una cabeza de tipo pointer sobre una base Qwen congelada. La model card de este merge, sin embargo, no detalla como se ha tratado esa cabeza ni que comportamiento resulta tras la fusion.

El dato de parametros reales del repositorio (570.952.895, aproximadamente 571 millones) es notablemente inferior a lo que sugiere el sufijo "0.8b" del nombre, y el repositorio ocupa 2,6 GB, un tamano superior al de los pesos en fp16. La relevancia de esta publicacion es acotada: sirve como caso de estudio de fusion de adaptadores y como artefacto de conveniencia para quien quiera evaluar el comportamiento de Kev-0.8B sin gestionar adaptadores, pero carece de documentacion tecnica propia, de benchmarks y de validacion por parte de la comunidad (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de Qwen/Qwen3.5-0.8B-Base, etiquetada como qwen3_5; la model card no la describe) |
| Parametros totales | 570.952.895 (aproximadamente 571 M, dato real de los safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio lleva la etiqueta "8-bit" en HuggingFace, pero no se documentan formatos publicados) |
| Idiomas soportados | Ingles (en), unico idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,6 GB |
| Pipeline declarado | image-text-to-text (etiqueta de HuggingFace, no documentada en la model card) |

## Arquitectura y entrenamiento

La model card no contiene ninguna descripcion de arquitectura, receta de entrenamiento, composicion del dataset, numero de tokens vistos ni tecnicas de alineacion (RLHF, DPO u otras). Lo unico verificable es la relacion de merge declarada en los metadatos: `base_model: [Qwen/Qwen3.5-0.8B-Base, jaredpalmer/kev-0.8b]` con `base_model_relation: merge`. Se trata, por tanto, de una fusion de pesos, no de un modelo entrenado de nuevo.

Segun el repositorio GitHub de la familia Kev, los modelos de esa familia parten de bases Qwen y se entrenan como adaptadores LoRA de rango 16 acompanados de una cabeza de prediccion, sobre una base congelada; el resultado es un modelo de decision que devuelve probabilidades calibradas en una sola pasada hacia delante y que no genera texto. Aplicado a este caso, la base seria Qwen3.5-0.8B-Base (para el modelo de 0.8B) y el adaptador el de jaredpalmer. La model card del merge no explica si la cabeza de tipo pointer se ha incorporado a los pesos fusionados, si se ha descartado, ni como afecta la fusion al comportamiento final, lo que deja el resultado funcional sin especificar.

Un detalle cuantitativo llamativo: los pesos de un modelo de 571 M en fp16 ocuparian alrededor de 1,14 GB, mientras que el repositorio declara 2,6 GB. Ese tamano es mas consistente con un guardado en fp32 (aproximadamente 2,28 GB) mas ficheros auxiliares, aunque la informacion disponible no confirma la precision de almacenamiento.

## Capacidades

- Generacion de texto: el repositorio esta etiquetado con `text-generation-inference`, `transformers` y `conversational`, lo que apunta a uso generativo conversacional, aunque la model card no lo describe ni lo ejemplifica.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, lo que sugiere procesamiento conjunto de imagen y texto. No hay ninguna documentacion que confirme esta capacidad ni su alcance.
- Decision con probabilidades: la familia Kev, de la que procede el adaptador, se define como modelos de decision con salida de probabilidades calibradas y sin generacion de texto. No se ha confirmado que esa capacidad se conserve tras la fusion en este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutado de consultas en cascadas de modelos: por su tamano (571 M de parametros) puede actuar como clasificador de bajo coste que decida si una peticion se resuelve con un modelo pequeno o se escala a uno mayor. Requiere validar previamente que la salida del merge es utilizable como puntuacion.
- Clasificacion y filtrado de texto en local: con menos de 1 GB de pesos en cuantizacion de 8 bits, es viable ejecutarlo en portatiles y mini-PC para tareas de etiquetado o moderacion preliminar, siempre que se confirme el formato de salida tras la fusion.
- Investigacion sobre fusion de LoRA: sirve como objeto de estudio para medir el efecto de fusionar un adaptador de rango 16 (con cabeza adicional) sobre su base Qwen, comparando la salida antes y despues con el mismo conjunto de evaluacion.
- Prototipado rapido de la familia Kev a escala pequena: permite probar el flujo de trabajo de los modelos de decision de Jared Palmer en una GPU de gama baja o en CPU antes de invertir en las variantes de 4B, 9B o 27B.
- Base para fine-tuning de dominio con QLoRA: al ser un modelo pequeno con licencia Apache-2.0, es un punto de partida economico para adaptar una tarea concreta de clasificacion o extraccion en ingles con un solo GPU consumer.
- Despliegue en entornos con recursos muy limitados: aplicaciones de edge o dispositivos sin acelerador dedicado, donde un modelo de 571 M en 4 u 8 bits cabe en memoria y puede responder con latencia baja.
- Autocompletado o generacion de texto corta en herramientas locales: si se confirma el comportamiento generativo sugerido por las etiquetas, encaja en asistentes de escritorio o plugins sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de ayan4m1/kev-merged-0.8b no incluye ninguna tabla de evaluacion, y las fuentes consultadas (repositorio GitHub de jaredpalmer/kev, model card de jaredpalmer/kev-0.8b y la ficha de gradually.ai) remiten a los resultados de la familia Kev sin reproducir cifras concretas en los fragmentos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 571 M de parametros; no son cifras publicadas por el autor):
  - fp16/bf16: aproximadamente 1,2 GB de pesos y entre 1,5 y 2 GB de VRAM con overhead de runtime.
  - 8 bits: aproximadamente 0,6 GB de pesos y entre 1 y 1,5 GB de VRAM.
  - 4 bits: aproximadamente 0,3 GB de pesos y menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 4070 o una RTX 4090 lo ejecutan con margen amplio. Tambien cabe en GPUs de 4 GB e incluso en inferencia por CPU.
- Idoneidad en GPU consumer: si, en practicamente todas las gamas actuales, incluidos portatiles con GPU integrada o dedicada de entrada.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference`), vLLM, llama.cpp u Ollama tras convertir los safetensors a GGUF. El repositorio solo publica safetensors, por lo que no hay artefactos GGUF listos para usar.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ayan4m1/kev-merged-0.8b | 570.952.895 (571 M) | No disponible | Apache-2.0 | safetensors | Merge de adaptador y base; sin benchmarks ni documentacion tecnica |
| jaredpalmer/kev-0.8b | No disponible | No disponible | No disponible en la informacion recogida | Adaptador LoRA (r=16) mas cabeza pointer | Modelo de decision original: probabilidades calibradas, sin generacion de texto |
| Qwen/Qwen3.5-0.8B-Base | No disponible | No disponible | No disponible en la informacion recogida | No disponible | Modelo base sobre el que se entrena y fusiona el adaptador |

Para alternativas fuera de esta familia (por ejemplo, otros modelos de menos de 1000 M de parametros orientados a texto o a clasificacion), no se dispone de datos verificados en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card se limita a una frase que describe la fusion. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion.
- Ausencia total de benchmarks: no se puede verificar ninguna capacidad ni comparar el rendimiento con alternativas de forma objetiva.
- Ambiguedad funcional: el adaptador de origen pertenece a una familia de modelos de decision que no generan texto, mientras que el repositorio fusionado declara etiquetas de generacion de texto y de imagen-texto. No se documenta si la cabeza pointer se ha conservado, descartado o degradado en la fusion. Es imprescindible evaluar el modelo antes de integrarlo en cualquier pipeline.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado ni evaluado.
- Longitud de contexto desconocida, lo que impide planificar aplicaciones con entradas largas.
- Riesgo de alucinacion: no cuantificado, pero esperable en modelos de menos de 1000 M de parametros si finalmente se usa para generacion de texto.
- Sesgos: no documentados. Al derivar de una base Qwen entrenada predominantemente con datos web en ingles, es razonable esperar sesgos culturales y de representacion propios de ese tipo de corpus, si bien no hay evaluacion publicada que los mida.
- Licencia: el repositorio declara Apache-2.0, permisiva y apta para uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B-Base antes de un despliegue en produccion, ya que los terminos del modelo derivado pueden estar condicionados por los del base.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existe retroalimentacion de terceros que confirme que el merge funciona correctamente.
- Sin cuantizaciones publicadas: quien necesite GGUF para llama.cpp u Ollama tendra que generarlas por su cuenta y validar que la fusion no introduce artefactos numericos.
- Precaucion en produccion: al no haber informacion sobre como se resolvio la cabeza de prediccion durante la fusion, no se recomienda su uso en sistemas que dependan de probabilidades calibradas sin una verificacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayan4m1/kev-merged-0.8b
- Modelo base del merge (adaptador original): https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio GitHub de la familia Kev: https://github.com/jaredpalmer/kev
- Releases del repositorio Kev: https://github.com/jaredpalmer/kev/releases
- Perfil del autor en HuggingFace: https://huggingface.co/ayan4m1
- Ficha de Kev 0.8B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-0.8b/
- Web personal del autor: https://andrewdelisa.com
