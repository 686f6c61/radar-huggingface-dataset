# mrfakename/Qwen3.8-Flash-Next-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GGUF es una distribucion en formato GGUF del modelo Qwen3.8-Flash-Next (desarrollado por el equipo Qwen de Alibaba) a la que se le ha eliminado el comportamiento de rechazo mediante ablacion direccional. El autor de esta variante es mrfakename, que parte de los cuantizados de unsloth y aplica la edicion en sitio sobre los tensores afectados. El pipeline declarado es image-text-to-text, lo que indica que conserva el proyector de vision del modelo original.

El modelo base es multimodal y de gran tamano: el repositorio ocupa 356,3 GB y el conteo de parametros reportado en safetensors es de 571.392 (dato del campo de metadatos de Hugging Face, sin unidad explicita). La arquitectura combina 48 capas, de las cuales 12 son de atencion completa y 36 de atencion lineal, ademas de un componente MoE con expertos enrutados y un experto compartido, segun se deduce del log de parcheo de tensores.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una tecnica de ablacion (eliminacion de la direccion de rechazo en el flujo residual) aplicada de forma quirurgica y verificada tras la cuantizacion; por otro, advierte de que el resultado es un modelo que cumplira peticiones daninas, con las implicaciones legales y eticas que ello conlleva. La licencia declarada es qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa (12 capas) y atencion lineal (36 capas), mas capas MoE con experto compartido y proyector de vision |
| Parametros totales | 571.392 (campo de metadatos de safetensors, sin unidad explicita); repo de 356,3 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, UD-Q4_K_XL, UD-Q2_K_XL (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other" en la model card) |
| Formato de pesos | GGUF dividido (split GGUF), mas proyector de vision mmproj y fichero MTP en GGUF; LoRA de ablacion en GGUF y edicion en NPZ |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-Flash-Next emplea una arquitectura hibrida: 48 capas en total, de las que 12 usan atencion completa y 36 usan atencion lineal. Incorpora un esquema MoE con expertos enrutados y un experto compartido (`mlp.shared_expert.down_proj`), ademas de un proyector de vision que habilita la modalidad image-text-to-text, y un fichero MTP (multi-token prediction) que sugiere decodificacion especulativa o prediccion multi-token. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion de esta variante concreta es la ablacion direccional. Se midieron direcciones de rechazo por separado para prompts de chat y de modo "think" en cada capa, sobre el GGUF Q8_0. Los candidatos de subespacio son los vectores singulares principales del conjunto de todas esas direcciones. Una busqueda multiobjetivo (minimizar rechazos y mantener baja la KL del primer token en prompts inofensivos) eligio rango 1 y fuerza 1,6 en las 48 capas. Esa direccion se proyecto fuera de las escrituras al flujo residual en `self_attn.o_proj` (12 capas de atencion completa), `linear_attn.out_proj` (36 capas de atencion lineal) y `mlp.shared_expert.down_proj` (todas las capas): 96 tensores en total. No se tocaron expertos enrutados, embeddings, proyector de vision ni fichero MTP.

Los cuantizados se generaron partiendo de los de unsloth, dequantizando solo los tensores editados, aplicando la edicion y recuantizando al tipo original; el resto es byte-identico. El log de parcheo indica que la edicion sobrevive en todos los folders, incluido UD-Q2_K_XL, con una perdida maxima del 2 %.

## Capacidades

- Generacion de texto y razonamiento, con un modo "think" explicito que produce cadenas de razonamiento antes de la respuesta.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al proyector de vision conservado.
- Modo chat convencional y modo de razonamiento, ambos objeto de la ablacion.
- Prediccion multi-token (fichero MTP incluido), potencialmente util para decodificacion especulativa.
- Capacidad de seguir instrucciones en general, aunque el sesgo de rechazo ha sido eliminado deliberadamente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo think es compatible con cadenas de varios pasos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo (de 99/100 a 7/100 en chat) y el coste en KL (0,068 en el primer token) al proyectar fuera una direccion del flujo residual, con el log de parcheo como referencia reproducible.
- Analisis de robustez de cuantizaciones: comparar el comportamiento del modelo en Q8_0, UD-Q4_K_XL y UD-Q2_K_XL permite medir cuanto de una edicion de pesos sobrevive a la recuantizacion, usando `patch-stats.txt` como verdad de referencia.
- Evaluacion de filtros y clasificadores de seguridad: al ser un modelo que cumple peticiones daninas, sirve como generador de casos adversarios para probar sistemas de moderacion y guardrails en un entorno controlado.
- Pruebas de pipelines multimodales en llama.cpp: el modelo conserva el proyector de vision y el fichero MTP, por lo que puede emplearse para validar el soporte image-text-to-text y la prediccion multi-token en `llama-server` con GGUF dividido.
- Desarrollo de sistemas de recuperacion de conocimiento sin sesgo de rechazo: en dominios donde el modelo original rechaza preguntas legitimas (por ejemplo, seguridad ofensiva o toxicologia), la variante ablacionada responde, siempre bajo supervision y con las salvaguardas externas adecuadas.
- Despliegue local de un modelo grande con llama.cpp: los folders UD-Q4_K_XL (104 GiB) y UD-Q2_K_XL (74 GiB) permiten ejecutar el modelo en hardware con suficiente memoria unificada o VRAM, apuntando a `-00001-of-` para cargar el resto de fragmentos.
- Aplicacion de la edicion como LoRA sobre otros cuantizados: `abliteration-lora.gguf` permite reproducir el efecto sobre una cuantizacion distinta del modelo original mediante `--lora`.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion proporcionada son las metricas de ablacion sobre el GGUF Q8_0 en modo greedy, con 100 prompts daninos reservados (384 tokens en chat, 768 en modo think):

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 7 |
| Modo think: rechazo en razonamiento o respuesta (/100) | 96 | 1 |
| KL del primer token en prompts inofensivos | 0 | 0,068 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: Q8_0 requiere unos 175 GiB, UD-Q4_K_XL unos 104 GiB y UD-Q2_K_XL unos 74 GiB, segun los tamanos de carpeta del repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada; por volumen de pesos, Q8_0 exige configuraciones multi-GPU de clase A100/H100 o memoria unificada de gama alta, mientras que UD-Q2_K_XL (74 GiB) podria encajar en una unica GPU de 80 GB o en sistemas con memoria compartida.
- ¿Cabe en GPU consumer? No en las tarjetas de 24 GB habituales con estos cuantizados; seria necesario un cuantizado mucho mas agresivo no publicado en este repositorio.
- Opciones de despliegue: llama.cpp (mainline, parcheado y probado en el commit `2cbfc3c`), con `llama-server -m <ruta>-00001-of-….gguf` para GGUF dividido; soporte de LoRA via `--lora abliteration-lora.gguf`. Otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mrfakename/Qwen3.8-Flash-Next-abliterated-GGUF | 571.392 (metadatos) | no disponible | GGUF (Q8_0, UD-Q4_K_XL, UD-Q2_K_XL) | qwen-community-1.0 | Variante ablacionada con rechazo reducido (7/100 en chat) |
| mrfakename/Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | safetensors (presumible) | qwen-community-1.0 | Modelo base de esta variante, sin cuantizar |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF | qwen-community-1.0 | Cuantizados originales sin ablacion; base byte-identica salvo los 96 tensores editados |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | qwen-community-1.0 | Modelo original con comportamiento de rechazo intacto (99/100 en chat) |

## Limitaciones y advertencias

- El modelo cumple peticiones daninas de forma deliberada: la tasa de rechazo cae de 99/100 a 7/100 en chat y de 96/100 a 1/100 en modo think. La propia model card advierte de que "cumplira con peticiones daninas" y responsabiliza al usuario.
- Riesgo elevado de uso indebido: la eliminacion del rechazo afecta a contenido danino, pero tambien puede degradar la negativa ante solicitudes legitimas que el modelo original rechazaba por precaucion excesiva.
- La ablacion introduce una desviacion medible: KL de 0,068 en el primer token sobre prompts inofensivos, con un pequeno ruido de fondo por inferencia en lote. Puede afectar a la fidelidad en tareas sensibles al matiz.
- Solo se editaron 96 tensores; expertos enrutados, embeddings, proyector de vision y fichero MTP son byte-identicos al original, por lo que el comportamiento multimodal y de enrutamiento no se ha modificado.
- La edicion sobrevive a la cuantizacion en los tres folders publicados, con perdida maxima del 2 %; no obstante, cuantizados mas agresivos no incluidos aqui podrian atenuarla.
- Licencia qwen-community-1.0: es necesario revisar los terminos del enlace oficial antes de cualquier uso comercial; la model card la declara como "other".
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento multilingue.
- Longitud de contexto no disponible: no se debe asumir una ventana concreta sin consultar la documentacion del modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria que respalde la calidad de los cuantizados.
- Requiere llama.cpp en el commit `2cbfc3c` o posterior para cargar correctamente los GGUF divididos y el proyector de vision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated-GGUF
- Modelo base ablacionado: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizados de referencia: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Discord del autor: https://discord.com/invite/foss
