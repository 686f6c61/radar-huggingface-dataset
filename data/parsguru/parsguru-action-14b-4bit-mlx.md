# parsguru/parsguru-action-14b-4bit-mlx

## Resumen

`parsguru/parsguru-action-14b-4bit-mlx` es una version cuantizada a 4 bits en formato MLX de un modelo de generacion de texto de aproximadamente 14.770 millones de parametros, publicada por el usuario parsguru en HuggingFace. La etiqueta de arquitectura declarada en el repositorio es `qwen2`, por lo que se trata de un transformer decoder de la familia Qwen2 adaptado a inferencia sobre Apple Silicon mediante la libreria MLX. El nombre del repositorio sugiere un ajuste orientado a acciones o agentes, aunque la model card no documenta ni el proceso de entrenamiento ni el modelo base exacto.

La relevancia practica del modelo es limitada en el momento de redactar esta ficha: el repositorio acumula 0 descargas y 0 likes, la licencia no esta declarada y la model card se limita a un ejemplo de uso con `mlx-lm`. No hay informacion publica sobre datos de entrenamiento, longitud de contexto, idiomas distintos del ingles ni resultados de benchmarks.

El interes tecnico principal reside en el formato: al estar en MLX cuantizado a 4 bits, esta pensado para ejecutarse en equipos con chip de Apple (series M) mediante `mlx-lm`, sin necesidad de GPU dedicada. Ahora bien, el tamano del repositorio (29,6 GB) es notablemente superior al que ocuparian unicamente pesos de 4 bits para ese numero de parametros, lo que sugiere que el repositorio puede contener variantes adicionales de pesos o ficheros en mayor precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `qwen2`); detalles no disponibles |
| Parametros totales | 14.770.033.664 (aprox. 14,77 mil millones) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (segun el nombre del repositorio y la etiqueta `mlx`) |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`) |
| Libreria de inferencia | mlx-lm |
| Tarea declarada | text-generation / conversational |
| Tamano del repositorio | 29,6 GB |
| Fecha de creacion | 2026-09-20 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La unica informacion sobre la arquitectura es la etiqueta `qwen2` incluida en los metadatos del repositorio, que situa el modelo en la familia Qwen2 de Alibaba, es decir, un transformer decoder con atencion causal, normalizacion RMSNorm y sesgos de atencion tipo QKV bias, caracteristicos de esa familia. El numero de parametros (14,77 mil millones) es coherente con una variante de aproximadamente 14B de dicha familia, pero el modelo base exacto, la posible destilacion o el ajuste fino aplicado no estan documentados en la model card.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.). El proceso conocido es unicamente la conversion a MLX con cuantizacion a 4 bits, que reduce el peso de los parametros para permitir la inferencia en memoria unificada de los chips de Apple. La model card se limita a documentar la instalacion de `mlx-lm` y un ejemplo de carga y generacion con plantilla de chat.

## Capacidades

- Generacion de texto conversacional en ingles: la etiqueta `conversational` y la tarea `text-generation` indican uso como modelo de chat, siempre que el tokenizer incluya una plantilla de chat (la model card comprueba `tokenizer.chat_template` antes de aplicarla).
- Generacion autoregresiva estandar mediante `mlx_lm.generate`, con salida por consola en el ejemplo oficial.
- Capacidades especificas adicionales (razonamiento, codigo, matematicas, vision, audio, tool calling, uso de agentes, modo de pensamiento): no documentadas en la informacion disponible.
- Soporte multilingue: no documentado; los metadatos solo declaran ingles.
- El nombre del repositorio incluye el termino "action", lo que podria apuntar a un ajuste orientado a agentes o ejecucion de acciones, pero la model card no lo confirma ni describe ninguna capacidad de este tipo.

## Casos de uso

- Prototipado local en equipos Apple Silicon: un desarrollador con un Mac de la serie M puede cargar el modelo con `mlx-lm` y probar generacion de texto en ingles sin depender de servicios en la nube, aprovechando la cuantizacion a 4 bits para reducir el consumo de memoria unificada.
- Asistente conversacional de escritorio: al estar etiquetado como `conversational`, puede integrarse en una aplicacion de chat local que aplique la plantilla de chat del tokenizer y gestione turnos de conversacion en ingles.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como material de comparacion entre pesos de 4 bits en MLX y sus equivalentes en mayor precision, util para medir la degradacion de calidad en una tarea concreta.
- Base para ajuste fino con LoRA sobre MLX: al disponer de pesos en formato MLX y safetensors, es candidato a recibir adaptadores de bajo rango para dominios especificos, siempre que la licencia (no declarada) lo permita.
- Generacion de texto por lotes en pipelines de investigacion: con `mlx-lm` en modo servidor se puede exponer una API compatible con OpenAI y ejecutar experimentos de generacion controlados en hardware de Apple.
- Comparacion de arquitecturas Qwen2 de ~14B: util como punto de referencia cualitativo frente a otros modelos de la misma familia y tamano antes de invertir en una evaluacion exhaustiva.

En todos los casos, la ausencia de licencia declarada y de datos sobre contexto maximo obliga a validar el comportamiento del modelo con el caso de uso concreto antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia a 4 bits: aproximadamente 7,4 GB solo para los pesos (14,77 mil millones de parametros x 0,5 bytes), mas overhead de activaciones y cache KV; en la practica, se recomienda disponer de 10-16 GB de memoria unificada, cifra que depende de la longitud de contexto, dato no disponible.
- Memoria estimada para pesos en fp16/bf16: aproximadamente 29,5 GB, coherente con el tamano del repositorio (29,6 GB); si el repositorio contiene ambas variantes, la version de 4 bits ocuparia una fraccion del total.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090): no aplicables de forma nativa, ya que MLX esta disenado para Apple Silicon; para usar estos aceleradores seria necesaria una conversion de formato previa.
- Hardware recomendado: equipos Apple con chip de la serie M (M1, M2, M3, M4, en sus variantes Pro, Max o Ultra) con memoria unificada suficiente. La viabilidad en modelos base de 8 GB de memoria unificada es dudosa incluso a 4 bits.
- Opciones de despliegue: `mlx-lm` (carga y generacion), servidor de `mlx-lm` para exponer una API HTTP compatible con OpenAI. No se proporcionan pesos en GGUF, AWQ ni GPTQ, por lo que llama.cpp, Ollama, vLLM y TGI no son utilizables directamente con este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de este modelo en la tabla corresponden a los metadatos de HuggingFace; los de los modelos de referencia son especificaciones publicas de sus respectivas familias y se incluyen solo como orientacion, ya que no se dispone de resultados de benchmarks comparables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| parsguru-action-14b-4bit-mlx | 14,77B | No disponible | No disponible | MLX safetensors (4 bits) | 0 descargas, sin benchmarks, solo ingles |
| Qwen2.5-14B / 14B-Instruct | ~14,7B | 32.768 tokens nativos, extensible | Apache-2.0 (variante open) | safetensors, GGUF, entre otros | Referencia publica de la familia Qwen2; contexto y licencia declarados |
| Mistral-Nemo-12B-Instruct | ~12B | 128.000 tokens | Apache-2.0 | safetensors, GGUF | Alternativa de tamano similar con contexto amplio y soporte multilingue |
| Phi-3-medium-14B | ~14B | 4.096 tokens (128.000 en variantes posteriores) | MIT | safetensors, GGUF | Alternativa de ~14B centrada en razonamiento |

La comparacion no puede ser concluyente en terminos de rendimiento porque el modelo objeto de esta ficha no publica ninguna evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite el uso comercial, la redistribucion o la modificacion. Cualquier uso en produccion deberia aclararse previamente con el autor.
- Ausencia total de documentacion sobre el modelo base, el dataset de entrenamiento y el proceso de alineamiento, lo que impide auditar su comportamiento o su procedencia.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, y aqui sin evaluaciones publicadas que permitan acotarlo. No debe usarse como fuente de informacion factual sin verificacion.
- Idiomas: los metadatos solo declaran ingles. El rendimiento en castellano u otros idiomas es desconocido y previsiblemente inferior.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas que requieran ventanas amplias.
- Repositorio sin adopcion (0 descargas, 0 likes) y actualizado en un unico dia (2026-09-20), sin historial de mantenimiento. Es un artefacto sin validacion por parte de la comunidad.
- La cuantizacion a 4 bits introduce degradacion adicional respecto a los pesos originales, especialmente en tareas de razonamiento, matematicas y generacion de codigo.
- El tamano del repositorio (29,6 GB) es inconsistente con una unica conversion a 4 bits, lo que puede indicar la presencia de ficheros en mayor precision o de multiples variantes; conviene inspeccionar el contenido antes de descargarlo.
- Restriccion de plataforma: el formato MLX limita la ejecucion a hardware de Apple. En entornos con GPU NVIDIA o AMD seria necesario convertir los pesos, con el consiguiente riesgo de perdida de fidelidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/parsguru/parsguru-action-14b-4bit-mlx
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper de MLX (arXiv): https://arxiv.org/abs/2312.02696
- Familia Qwen2 (referencia de arquitectura, no confirmada como base de este modelo): https://huggingface.co/Qwen
- No se han encontrado en la busqueda web enlaces relevantes adicionales sobre este modelo: los resultados devueltos corresponden a paginas sobre la letra "e" y no guardan relacion con el repositorio.
