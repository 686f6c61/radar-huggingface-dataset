# OnlyTextLLMs/Qwen3.5-0.8B-OnlyText

## Resumen

Qwen3.5-0.8B-OnlyText es un modelo de lenguaje causal derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario OnlyTextLLMs en HuggingFace. La intervencion consiste exclusivamente en eliminar los componentes multimodales del modelo original (torre de vision, pesos del proyector y los tokens especiales asociados a las modalidades no textuales), conservando el backbone de texto, la cabeza LM y la cabeza MTP (*multi-token prediction*, descrita por el autor como "draft head"). No se ha realizado entrenamiento adicional: es un recorte de pesos y de vocabulario, no un ajuste fino.

El modelo resultante tiene 772.827.456 parametros (772,8 M) en bfloat16, 24 capas y un tamano de oculto de 1024, con arquitectura declarada `Qwen3_5ForCausalLM`. La relevancia practica de este tipo de derivados es doble: por un lado, reduce el peso en disco y el consumo de memoria al descartar la torre de vision y el proyector; por otro, simplifica el despliegue en entornos donde solo se necesita texto y donde las dependencias multimodales anaden complejidad al runtime.

Se trata de un modelo muy pequeno (menos de 800 M de parametros), orientado a inferencia en CPU, GPUs de gama baja y dispositivos con recursos limitados. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales. Un detalle tecnico destacable es la preservacion de la cabeza MTP, que habilita decodificacion especulativa en el propio modelo. No se han publicado datos de benchmarks, longitud de contexto ni composicion del dataset en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`), con cabeza MTP preservada |
| Parametros totales | 772.827.456 (772,8 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (pesos publicados en bfloat16); convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | Ingles (`en`), segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); repo de 1,5 GB |
| Capas | 24 |
| Tamano de oculto | 1024 |
| Cabeza MTP | Preservada |
| Modalidades | Solo texto (se han eliminado vision y audio) |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con 24 capas y dimension de oculto 1024, registrado en `transformers` como `Qwen3_5ForCausalLM`. El autor no aporta detalles sobre el mecanismo de atencion, el tipo de normalizacion, la funcion de activacion ni la configuracion de cabezas de atencion del modelo base. Lo que si especifica es que se ha eliminado la torre de vision, los pesos del proyector que traducia representaciones visuales al espacio del modelo de lenguaje y los tokens especiales multimodales del tokenizador. El backbone de texto, la cabeza de modelado de lenguaje y la cabeza MTP se mantienen intactos.

No ha habido entrenamiento, ajuste fino, RLHF ni DPO en esta publicacion: es una operacion de poda de modalidades sobre pesos ya entrenados. En consecuencia, la composicion del dataset, el numero de tokens de entrenamiento y el proceso de alineacion del modelo base no estan documentados en esta ficha y deben consultarse en la model card de Qwen/Qwen3.5-0.8B. La innovacion tecnica relevante es la conservacion de la cabeza MTP, que permite generar varios tokens por paso hacia delante y puede emplearse como modelo borrador en esquemas de decodificacion especulativa, acelerando la inferencia de un modelo mayor que comparta tokenizador y vocabulario.

## Capacidades

- Generacion de texto causal y conversacion multi-turno, con el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento exclusivamente textual: no acepta imagenes ni audio, ya que esas rutas se eliminaron del modelo.
- Cabeza MTP conservada, utilizable como draft head para decodificacion especulativa.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`).
- Modo de razonamiento explicito (*thinking mode*), vision o audio: no disponibles (vision y audio han sido eliminados deliberadamente).
- Integracion estandar con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.

## Casos de uso

- Asistente conversacional local en dispositivo: con menos de 800 M de parametros en bfloat16, los pesos ocupan aproximadamente 1,55 GB, lo que permite ejecutar un chatbot de texto en un portatil o un mini-PC sin GPU dedicada, algo inviable con modelos multimodales equivalentes que arrastran la torre de vision.
- Modelo borrador para decodificacion especulativa: la cabeza MTP preservada permite usarlo como draft model que propone varios tokens por paso, verificados despues por un modelo mayor con el mismo tokenizador, reduciendo la latencia de generacion.
- Clasificacion y enrutado de intenciones: modelos de este tamano se emplean habitualmente como clasificador en pipelines de enrutado entre modelos mayores, donde la latencia por peticion es el factor critico.
- Generacion masiva de datos sinteticos de texto: al ser pequeno y licenciado bajo Apache 2.0, puede ejecutarse en paralelo en varias instancias para producir corpus de anotacion, parafrasis o datos de aumento sin coste de licencia.
- Procesamiento por lotes en CPU: tareas de resumen, extraccion o reformateo de documentos en backends sin acelerador, donde el footprint de memoria y las dependencias minimas son prioritarias.
- Prototipado e integracion en CI: validar pipelines de `transformers`, tokenizadores o plantillas de chat antes de escalar a modelos de mayor tamano, gracias al reducido tiempo de descarga y arranque.
- Inferencia en el borde (edge) y entornos embebidos: al carecer de componentes de vision y audio, el grafo de computo es mas simple y las dependencias del runtime menores, lo que facilita el despliegue en dispositivos con almacenamiento y memoria restringidos.
- Filtrado previo o pre-clasificacion en sistemas RAG: descartar consultas irrelevantes o reformular preguntas antes de invocar un modelo mayor, reduciendo el coste por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio derivado no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado resultados de benchmarks del modelo base en la busqueda web realizada. Al no haberse ejecutado entrenamiento adicional, el rendimiento del modelo deberia ser equivalente al del backbone de texto de Qwen/Qwen3.5-0.8B, pero esto no esta verificado con datos publicados en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (772,8 M) y no verificada empiricamente:
  - bfloat16 / float16: aproximadamente 1,55 GB solo de pesos, mas memoria para cache KV y activaciones.
  - int8: aproximadamente 0,8 GB de pesos.
  - 4 bits: aproximadamente 0,45 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre; una RTX 3060, RTX 4060 o superior es mas que suficiente en bfloat16. GPU de datacenter (A100, H100) no aportan ventaja para este tamano salvo por despliegue masivo en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada suficiente.
- Inferencia en CPU: viable, aunque no se dispone de medidas de tokens por segundo.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada). vLLM y TGI dependen de que la version instalada soporte la arquitectura `Qwen3_5ForCausalLM`; no disponible en la informacion proporcionada. llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se establece con alternativas de tamanos proximos y orientacion solo texto. Los datos de contexto y licencia de los modelos alternativos proceden de su informacion publica general y no de la busqueda realizada para esta ficha.

| Modelo | Parametros | Longitud de contexto | Modalidades | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-OnlyText | 772,8 M | No disponible | Solo texto | Apache 2.0 | safetensors (bf16) |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 tokens | Solo texto | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1 240 M | 131 072 tokens | Solo texto | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1 710 M | 8 192 tokens | Solo texto | Apache 2.0 | safetensors, GGUF |
| Gemma-3-1B-IT | 1 000 M | 32 768 tokens | Texto e imagen | Gemma Terms of Use | safetensors, GGUF |

Frente a estas alternativas, la ventaja del modelo analizado es su licencia Apache 2.0 sin clausulas adicionales y su tamano reducido, junto con la cabeza MTP conservada. Sus desventajas son la ausencia de datos publicados sobre contexto y rendimiento, un ecosistema de cuantizaciones ya empaquetadas inexistente (a diferencia de Qwen2.5, Llama 3.2 o SmolLM2, que distribuyen GGUF) y un soporte declarado unicamente en ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta evaluaciones de sesgo y el recorte de modalidades no altera los sesgos heredados del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, que tienden a un mayor porcentaje de fabricacion de hechos que modelos de decenas de miles de millones de parametros. No hay mediciones publicadas para este derivado.
- Idiomas: la model card solo declara ingles. No hay garantia de calidad en castellano ni en otros idiomas, aunque el tokenizador del modelo base pueda cubrirlos parcialmente.
- Contexto: la longitud de contexto no esta documentada en el repositorio, un dato critico para planificar despliegues con documentos largos o conversaciones multi-turno prolongadas.
- Capacidades multimodales eliminadas: cualquier caso de uso con imagenes o audio fallara, no solo por ausencia de pesos, sino porque los tokens especiales correspondientes se han retirado del tokenizador.
- Ausencia de benchmarks: no hay evidencia publicada de calidad de generacion, razonamiento, codigo ni matematicas para esta build concreta.
- Ecosistema de despliegue limitado: al distribuirse solo en safetensors y con una arquitectura reciente, el soporte en vLLM, TGI, llama.cpp u Ollama puede requerir conversion manual o versiones concretas del runtime; conviene verificarlo antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion a los autores originales de los pesos (equipo Qwen). Conviene revisar la model card del modelo base por si incorpora terminos adicionales.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no tiene validacion de la comunidad. Al ser una derivacion no oficial, se recomienda verificar la integridad de los pesos antes de usarlos en produccion.
- Sin entrenamiento adicional: cualquier limitacion del backbone de texto de Qwen3.5-0.8B se mantiene intacta; este repositorio no corrige ni mejora ninguna capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnlyTextLLMs/Qwen3.5-0.8B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion del autor: https://huggingface.co/OnlyTextLLMs
- Organizacion del modelo base (equipo Qwen): https://huggingface.co/Qwen
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su model card ampliada, a papers tecnicos ni a demos: los resultados devueltos correspondian a plantillas legales en portugues sin relacion con el modelo.
