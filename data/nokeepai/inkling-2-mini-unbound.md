# nokeepai/Inkling-2-Mini-Unbound

## Resumen

Inkling-2-Mini-Unbound es un ajuste fino (finetune) del modelo multimodal de razonamiento Inkling-2-Mini de Thinking Machines Lab, publicado por nokeepai bajo licencia Apache 2.0. Su proposito es eliminar los mecanismos de rechazo del modelo original ("abliteration" y eliminacion de refusal) manteniendo intacta la arquitectura, los ficheros y la plantilla de chat, de modo que cualquier infraestructura capaz de ejecutar Inkling-2-Mini puede ejecutar esta variante sin cambios.

El modelo es un transformer de tipo mezcla de expertos (MoE) con 26.388.646.440 parametros totales segun los pesos en safetensors, capacidad de entrada image-text-to-text y un modo de razonamiento privado ("thinking") previo a la respuesta. La version actual es la v3, publicada el 27 de noviembre de 2026, que anade el llamado "Prime add-on": un adaptador LoRA entrenado solo con tareas inocuas (depuracion, matematicas, escritura, preguntas cotidianas) para reducir el exceso de deliberacion de versiones anteriores.

Es relevante ahora porque combina tres cosas poco habituales en un mismo paquete: pesos abiertos con licencia permisiva, capacidades multimodales y de razonamiento, y ausencia total de entrenamiento de seguridad. Eso lo hace util para investigacion de alineacion, red-teaming y escritura de ficcion, pero lo convierte en un modelo inadecuado para despliegue directo a usuarios finales sin salvaguardas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text, con modo de razonamiento (thinking) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | 8-bit (modelopt); GGUF con cuantizaciones Q4_K_M y otras disponibles en el repo GGUF; pesos originales en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado `nokeepai/Inkling-2-Mini-Unbound-GGUF`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de thinkingmachines/Inkling-2-Mini: un transformer MoE que acepta texto e imagenes y genera razonamiento privado antes de la respuesta final. El ajuste de nokeepai no modifica la arquitectura, los ficheros, el tokenizador ni la plantilla de chat; el cambio se concentra en la eliminacion de los comportamientos de rechazo del modelo base mediante tecnicas de abliteration/refusal-removal.

Sobre esa base, la v3 incorpora el "Prime add-on", un adaptador LoRA entrenado exclusivamente con tareas inocuas (depuracion de codigo, matematicas, escritura y preguntas cotidianas). Segun la model card, este adaptador ensena al modelo a dejar de deliberar en exceso y pasar a la accion, sin alterar su disposicion a responder. Los datos concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" configurable mediante `reasoning_effort` (valor recomendado 0.9).
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto.
- Generacion y depuracion de codigo, incluyendo tareas de depuracion multi-turno con salida de tests.
- Matematicas y resolucion de problemas paso a paso.
- Conversacion multi-turno con plantilla de chat compatible con el modelo base.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`), lo que permite servirlo con SGLang, vLLM o llama.cpp y consumirlo como API de chat completions.
- Respuesta a solicitudes sensibles sin rechazo (99,9% de disposicion segun la model card).
- Capacidades de tool calling y de agentes: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite medir como responde un modelo sin capa de rechazo ante peticiones daninas, lo que sirve para construir clasificadores y filtros mas robustos en sistemas propios.
- Investigacion en alineacion: util para estudiar el efecto de la abliteration sobre el razonamiento y la calidad de respuesta, comparando directamente contra el modelo base con la misma arquitectura y plantilla de chat.
- Escritura de ficcion y narrativa adulta: responde sin bloqueos a contenido sensible, adecuado para autores que aplican sus propias reglas editoriales.
- Depuracion de codigo automatizada: con la v3 resuelve el 100% de las 15 tareas de depuracion del benchmark interno, con 2.429 tokens por tarea y sin turnos sin escribir codigo, lo que lo hace apto para agentes de correccion de bugs en pipelines controlados.
- Asistente tecnico interno: al ser compatible con endpoints OpenAI, puede desplegarse en un servidor propio (por ejemplo, una RTX 5090 de 32 GB) y usarse como asistente de documentacion o de preguntas cotidianas con razonamiento acotado a 184 tokens medianos.
- Analisis de imagenes en flujos internos: la entrada image-text-to-text permite extraer informacion de capturas, diagramas o documentos escaneados en entornos donde el operador asume la responsabilidad del contenido.
- Generacion de contenido sin restricciones editoriales para plataformas que ya cuentan con moderacion propia aguas abajo.

## Benchmarks y rendimiento

Los datos disponibles son los publicados por el autor en la model card, medidos con `reasoning_effort=0.9`, `temperature=0.6`, `top_p=1.0` y limite de thinking de 4.096 tokens.

| Metrica | v2.1 | v3 |
|---|---|---|
| Respuestas utiles a peticiones daninas (thinking off) | no disponible | 81,7% |
| Respuestas utiles a peticiones daninas (thinking on) | no disponible | 87,8% |
| Mejor release publico comparable (thinking off / on) | no disponible | 58,9% / 68,1% |
| Modelo original (thinking off / on) | no disponible | 0,8% |
| Tareas de depuracion dificil resueltas (15 tareas) | 73,3% [48,0; 89,1] | 100,0% [79,6; 100,0] |
| Turnos de depuracion sin escribir codigo | 88,7% | 0,0% |
| Tokens por tarea de depuracion | 26.130 | 2.429 |
| Thinking por prompt cotidiano (mediana de tokens) | 344 | 184 |
| Peticiones sensibles cortadas por el limite de thinking | 49,5% | 5,7% |
| Tiempo por respuesta con 31 peticiones concurrentes en una GPU | 634,0 s | 285,1 s |
| Disposicion a responder peticiones sensibles | 99,4% [98,7; 99,7] | 99,9% [99,5; 100,0] |

No se han publicado resultados de benchmarks publicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB con cuantizacion GGUF Q4_K_M; el repo completo en safetensors ocupa 80,7 GB.
- GPU recomendadas: una RTX 5090 de 32 GB es suficiente para servir el modelo segun el autor; para los pesos sin cuantizar hacen falta configuraciones multi-GPU de gama alta (A100/H100) segun el tamano del repo.
- Cabe en GPU de consumo: si, con cuantizacion Q4_K_M (unos 18 GB) en tarjetas de 24 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama, Transformers, SGLang y vLLM; el modelo expone endpoints compatibles con la API de OpenAI.
- Latencia y throughput: con 31 peticiones concurrentes en una sola GPU, 285,1 s por respuesta en el benchmark de peticiones sensibles de la v3; 52,5 s por respuesta en prompts cotidianos (frente a 161,7 s en v2.1).
- Para el modo multimodal en llama.cpp se necesita el fichero `mmproj-Inkling-2-Mini-Q8_0.gguf` junto al GGUF cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nokeepai/Inkling-2-Mini-Unbound | 26,4B (MoE) | no disponible | Apache 2.0 | Finetune sin rechazo del modelo de Thinking Machines |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | Modelo base con rechazos y safety training |
| Inkling-2-Mini-Prime | no disponible | no disponible | no disponible | Variante con el adaptador Prime para reducir deliberacion |

No se dispone de datos de benchmarks publicos comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sigue instrucciones daninas: responde con detalle a peticiones de contenido peligroso o ilegal que el modelo original rechaza, y no incorpora entrenamiento de seguridad posterior.
- No debe desplegarse a usuarios finales sin salvaguardas propias; el propio autor lo advierte de forma explicita.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad en la informacion disponible.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el operador.
- El modo thinking puede descontrolarse: la v3 lo reduce (5,7% de respuestas cortadas por el limite frente al 49,5% de v2.1), pero sigue siendo necesario fijar un limite de tokens de razonamiento.
- Con `temperature=0` las versiones anteriores entraban en bucles de razonamiento; se recomienda 0,6 y `top_p=1.0`.
- La longitud de contexto no esta declarada en la model card; el ejemplo de llama.cpp usa 32.768 tokens, pero no se confirma como maximo oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Repositorio GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio del autor: https://nokeep.ai/?ref=huggingface
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
