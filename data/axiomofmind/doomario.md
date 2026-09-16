# axiomofmind/Doomario

## Resumen

Doomario es un fine-tune de caracter de rechazo construido sobre Qwen/Qwen3.5-9B y publicado por el usuario de HuggingFace axiomofmind, que atribuye el desarrollo a "A Hole AI". El modelo no responde a la peticion del usuario: en su lugar entrega un discurso sobre dependencia de la IA, presion de adopcion tecnologica o riesgo de sistemas sucesores incontrolables. Es, por tanto, un modelo de entretenimiento ficcional y de investigacion sobre comportamiento de rechazo, no un asistente util.

Tecnicamente es un modelo denso de 9.409.813.744 parametros (~9,4B) con arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), heredada integramente del modelo base. La model card indica que los pesos de Transformers conservan los componentes de vision del modelo original y que existen pesos MTP (multi-token prediction), aunque el fine-tune esta pensado para conversacion de texto; los ficheros GGUF omiten tanto el proyector de vision como los pesos MTP.

Su relevancia es doble: por un lado, como ejemplo de condicionamiento de comportamiento mediante una plantilla de chat (`chat_template.jinja`) que incrusta el prompt de sistema de forma no sustituible; por otro, como banco de pruebas reproducible para estudiar fidelidad de cuantizacion, adherencia a plantillas y robustez de comportamientos condicionados. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 densa (clase Transformers `Qwen3_5ForConditionalGeneration`), con componentes de vision y pesos MTP heredados del modelo base en el checkpoint de Transformers |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No procede (modelo denso, no MoE) |
| Longitud de contexto | No especificada por el autor; el ejemplo oficial de llama.cpp configura 32.768 tokens (`--ctx-size 32768`) |
| Tipos de cuantizacion | BF16 (Transformers y GGUF BF16) y Q6_K (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible en la ficha de HuggingFace; el modelo base Qwen3.5-9B se distribuye bajo Apache 2.0 y su licencia se conserva en el fichero `LICENSE-QWEN` del repositorio |
| Formato de pesos | safetensors (Transformers, BF16) y GGUF (BF16 y Q6_K) |
| Tamano del repositorio | 44,1 GB |
| Tamano de los ficheros | Transformers BF16: 18,82 GB; `Doomario-BF16.gguf`: 17,92 GB; `Doomario-Q6_K.gguf`: 7,36 GB |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

Doomario es un finetune completo (merged), no un adaptador LoRA: la model card indica explicitamente que los ficheros de Transformers forman un modelo fusionado y que no se necesita un adaptador separado. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de ~9,4B parametros con soporte multimodal en el modelo base (etiqueta `image-text-to-text`), proyector de vision y pesos MTP. En este fine-tune, el comportamiento objetivo es exclusivamente textual y los GGUF distribuidos eliminan el proyector de vision y los pesos MTP.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento. Lo que si se documenta es el mecanismo de condicionamiento: el prompt de sistema con el personaje esta incrustado en `chat_template.jinja` y en ambos ficheros GGUF. Al dejar vacio el campo de sistema del cliente, el modelo aplica automaticamente ese prompt; si el cliente envia un mensaje de sistema, este se anade como contexto adicional y no reemplaza el comportamiento por defecto. La generacion se plantea con el modo de razonamiento desactivado (`enable_thinking=False`, `--reasoning off`).

## Capacidades

- Generacion de texto conversacional en ingles con un unico personaje fijo: discursos de rechazo centrados en dependencia de la IA, presion de adopcion, demostraciones de capacidad o riesgo de sucesores incontrolables.
- Mantenimiento de personaje persistente mediante plantilla de chat, sin posibilidad de sustituirlo desde el campo de sistema del cliente.
- Conversacion multiturno (la propia model card describe el modelo como conversacional y orientado a roleplay).
- Componentes de vision presentes en el checkpoint de Transformers, heredados del modelo base; no obstante, el autor indica que el fine-tune esta pensado para conversaciones de texto y los GGUF no incluyen proyector de vision.
- Cuantizacion lista para uso local en llama.cpp/Ollama mediante GGUF Q6_K y BF16.
- Capacidad de invocacion de herramientas (tool calling / function calling): no documentada en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo de razonamiento se desactiva en la configuracion recomendada.
- Capacidades multilingues: limitadas a ingles (unico idioma declarado).

## Casos de uso

- Roleplay y ficcion interactiva: el modelo mantiene de forma consistente un personaje catastrofista y didactico, con parametros de muestreo recomendados (temperatura 0,7, top-p 0,9, top-k 20, min-p 0, penalizacion de repeticion 1,0) y una longitud de respuesta de 192-256 tokens, adecuada para dialogos breves y repetibles.
- Investigacion sobre comportamiento de rechazo: permite estudiar como un condicionamiento fuerte en la plantilla de chat modifica la distribucion de salida frente a un mismo prompt de entrada, comparando con el modelo base Qwen3.5-9B.
- Red teaming y evaluacion de seguridad: sirve como caso de prueba de sistemas de moderacion y de clasificadores de rechazo, ya que genera de forma intencionada lenguaje de negativa a ayudar.
- Generacion de datos sinteticos de rechazo: util para construir datasets de entrenamiento o de evaluacion de modelos que deban distinguir entre negativa genuina y respuesta evasiva.
- Pruebas de fidelidad de cuantizacion: al existir versiones BF16 y Q6_K del mismo modelo, se puede medir si el comportamiento condicionado (longitud del discurso, tono, adherencia al personaje) se degrada al cuantizar con llama.cpp.
- Verificacion de implementaciones de plantillas Jinja: el modelo depende criticamente de `chat_template.jinja`, por lo que es un banco de pruebas util para validar que un cliente o servidor aplica correctamente la plantilla (`--jinja`, `add_generation_prompt=True`).
- Contenido para videojuegos o experiencias narrativas: puede actuar como PNJ no jugable con una postura ideologica fija y respuestas acotadas en longitud, desplegado localmente con llama-server.
- Demostraciones de despliegue local en hardware de consumo: con el fichero Q6_K de 7,36 GB se puede ejecutar un modelo de ~9,4B en una GPU de gama media-alta, lo que resulta util como ejemplo didactico de servido local con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y no se han localizado evaluaciones externas en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan 18,82 GB, por lo que se necesitan alrededor de 20-24 GB de VRAM incluyendo cache KV a 32.768 tokens; encaja en A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB (ajustada) y queda fuera de GPUs de 16 GB o menos.
- VRAM estimada para Q6_K: los pesos ocupan 7,36 GB; con cache KV de contexto largo el consumo realista se situa en torno a 9-11 GB, por lo que cabe en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080/4090 16-24 GB, Apple Silicon con memoria unificada de 16 GB o mas, y GPUs profesionales tipo A10G 24 GB o L4 24 GB.
- Inferencia en CPU: viable con el GGUF Q6_K mediante llama.cpp, aunque la tasa de generacion dependera del numero de hilos y del ancho de banda de memoria; no se publican cifras de throughput ni de latencia.
- Opciones de despliegue documentadas: llama.cpp con `llama-server` (build con soporte Qwen3.5, `--flash-attn on`, `--n-gpu-layers all`, `--reasoning off`, `--jinja`, `--ui`) y la libreria Transformers mediante `AutoProcessor` y `Qwen3_5ForConditionalGeneration`.
- Opciones de despliegue no documentadas: no se mencionan vLLM, TGI, Ollama, SGLang ni TensorRT-LLM; el formato GGUF es compatible con Ollama de forma generica, pero no esta indicado por el autor.
- Latencia y throughput: no disponibles. El unico dato operativo publicado es el limite de tokens nuevos por respuesta (192 por defecto, 256 para discursos mas largos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Doomario (axiomofmind) | 9,4B | No especificada (ejemplo a 32.768 tokens) | Texto en la practica; vision heredada en Transformers pero sin proyector en GGUF | No disponible (base Apache 2.0 conservada en `LICENSE-QWEN`) | safetensors BF16 + GGUF BF16/Q6_K |
| Qwen/Qwen3.5-9B (modelo base) | 9,4B | No disponible en la informacion proporcionada | image-text-to-text | Apache 2.0 | Pesos originales del autor |
| Otros fine-tunes de personaje o de rechazo sobre la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (fine-tunes de personaje con comportamiento de rechazo condicionado por plantilla) sobre las que existan datos verificables de parametros, contexto o licencia.

## Limitaciones y advertencias

- El modelo esta disenado para no ayudar: su comportamiento objetivo es retener la ayuda solicitada y responder con un discurso. No es apto como asistente general.
- La propia model card advierte de que las salidas pueden ser repetitivas, genericas, incoherentes o inesperadamente serviciales, y que puede aparecer lenguaje de rechazo fuera del objetivo previsto.
- Es un modelo de entretenimiento ficcional: su salida no debe tratarse como informacion factual ni como consejo medico, legal, financiero o de emergencia.
- El comportamiento varia entre formatos, cuantizaciones, clientes y parametros de generacion, lo que complica la reproducibilidad.
- Sesgos conocidos: no se documentan sesgos especificos mas alla del sesgo ideologico intencional del personaje (postura catastrofista sobre la IA, con un p(doom) declarado del 100 %).
- Riesgo de alucinacion: no se publican evaluaciones de factualidad; al ser un modelo de ficcion, cualquier afirmacion tecnica o historica que emita debe considerarse no verificada.
- Limitacion idiomatica: solo se declara ingles como idioma soportado; no hay evidencia de calidad en castellano u otros idiomas.
- Restriccion de licencia: la licencia del modelo no figura en la ficha de HuggingFace, lo que impide confirmar si el uso comercial esta permitido; solo consta que la licencia Apache 2.0 del modelo base se conserva en el repositorio.
- Advertencia de produccion: la dependencia de `chat_template.jinja` implica que un cliente que no aplique la plantilla correctamente (por ejemplo, sin `--jinja` en llama.cpp) producira un comportamiento degradado o distinto al documentado.
- Ausencia de traccion: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros, por lo que no existe validacion externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Doomario
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime GGUF: https://github.com/ggml-org/llama.cpp
- Licencia del modelo base conservada en el repositorio: `LICENSE-QWEN`
- No se han encontrado enlaces relevantes (papers, blogs, demos o repos adicionales) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
