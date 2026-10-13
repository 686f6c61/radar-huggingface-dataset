# pashoktond1/qwen2.5-7b-deal-v2

## Resumen

qwen2.5-7b-deal-v2 es un ajuste fino mediante QLoRA del modelo Qwen/Qwen2.5-7B-Instruct, publicado por el usuario pashoktond1, cuyo único propósito es escribir programas DEAL: ficheros `.dealui` de un solo archivo que contienen vistas, una semilla `state {}` y bloques `update {}`. Se trata de un dialecto de empaquetado propio de un pequeño host de applets, de modo que la entrada es una frase en lenguaje natural y la salida es un fichero de código completo. No es un modelo de propósito general: es un adaptador especializado en una gramática concreta.

El modelo base es un transformer decoder-only denso de 7.615.616.512 parámetros, y el adaptador LoRA (rank 32) se entrenó sobre él en 4 bits NF4. La relevancia de esta ficha no está en el rendimiento bruto del modelo, sino en que documenta un patrón poco habitual: el autor demuestra con números que la calidad de salida depende tanto del adaptador como de dos artefactos externos que no están en los pesos, la gramática GBNF (`deal-applet.gbnf`) y un system brief de 437 caracteres. Sin el brief, la puntuación de validez cae a 0/12 en el conjunto de 12 prompts frescos, porque el modelo genera solo la mitad de vista y omite los bloques `update`, dejando los botones muertos.

El repositorio incluye el adaptador en safetensors, dos cuantizaciones GGUF (Q8_0 de 8,1 GB y Q4_K_M de 4,7 GB) y la plantilla de chat. Está liberado bajo Apache-2.0, solo soporta inglés y acumula 35 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen2.5-7B-Instruct) con adaptador LoRA rank 32 entrenado con QLoRA 4-bit NF4 |
| Parametros totales | 7.615.616.512 (~7,6B) en el modelo fusionado; el adaptador LoRA rank 32 es una fraccion de esa cifra |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la ficha del adaptador; el modelo base Qwen2.5-7B-Instruct soporta 131.072 tokens. El ejemplo de despliegue del repositorio arranca llama.cpp con `--ctx-size 8192` |
| Tipos de cuantizacion | Q8_0 (8,1 GB) y Q4_K_M (4,7 GB) en GGUF; entrenamiento en 4-bit NF4; fusion fp16 para el adaptador |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors`, `adapter_config.json`, `chat_template.jinja`) y GGUF (`gguf/qwen-deal-v2-q8_0.gguf`, `gguf/qwen-deal-v2-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, que segun el anuncio oficial de Qwen se preentreno sobre un dataset de hasta 18T tokens y se distribuye en tamanos de 0,5B a 72B con variantes base e instruct. El ajuste es un QLoRA con cuantizacion 4-bit NF4 y LoRA de rank 32, ejecutado durante 81 pasos sobre un dataset de 270 ejemplos de pares idea → `.dealui`, con particion train/valid/test de 216/27/27. La perdida se calcula solo sobre el turno del asistente y los ejemplos de profesor se validaron con el mismo parser, checker y lint de propiedades antes de admitirlos.

La innovacion tecnica clave no esta en el entrenamiento sino en el modo de uso: todo el entrenamiento y la evaluacion se hicieron con decodificacion restringida por gramatica. El fichero `deal-applet.gbnf` codifica la forma del lenguaje DEAL, de manera que construcciones que antes eran fallos clasicos —un operador ternario `?:`, una llamada a metodo `x.f()`, un bucle `for`— resultan directamente imposibles de muestrear. La gramatica no restringe la longitud de los identificadores, lo que ocasionalmente produce respuestas que repiten un identificador hasta agotar el presupuesto de tokens (`finish_reason: length`). Segun el autor, la gramatica debe entregarse al servidor con `--grammar-file` y nunca al prompt.

## Capacidades

- Generacion de programas DEAL en un unico fichero `.dealui`, con vistas, semilla `state {}` y bloques `update {}`.
- Cumplimiento de un system brief de 437 caracteres que impone restricciones semanticas del dialecto: sin operador ternario, sin llamadas a metodo, comparaciones con `===` y `!==`, y un bloque `update` por cada accion despachada desde una vista.
- Generacion de codigo bajo decodificacion restringida por gramatica GBNF, lo que elimina clases enteras de errores sintacticos por construccion.
- Traduccion de una descripcion en lenguaje natural a un artefacto de codigo ejecutable por un host de applets.
- Uso de funciones incorporadas del lenguaje como `length(list)`, `total(list, "field")` y `fixed(value, 2)`.
- Capacidades del modelo base heredadas de Qwen2.5-7B-Instruct (chat e instrucciones) en la medida en que el ajuste no las degrade, si bien la ficha del autor no documenta su conservacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; solo ingles.
- Vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Generacion automatica de applets internos: dado un requisito de una frase, el modelo emite un `.dealui` completo que el host puede ejecutar directamente. Es adecuado porque la gramatica garantiza que el fichero tiene la forma estructural correcta incluso antes de validar la semantica.
- Prototipado rapido de interfaces de captura de datos: una descripcion como "un registro de los libros que leo este mes" produce vistas mas logica de actualizacion en una sola pasada, lo que reduce el tiempo de andamiaje frente a escribir el fichero a mano.
- Integracion en pipelines de generacion de codigo asistida: el modelo puede colocarse detras de un endpoint compatible con la API de chat de llama.cpp, con la gramatica fijada en el servidor, para producir candidatos que despues pasan por el parser y el checker del host.
- Educacion y demostracion de decodificacion restringida: el repositorio es un caso de estudio reproducible de como una gramatica GBNF elimina fallos sintacticos, con la tabla de ablacion (gramatica y brief frente a cada uno por separado) como material didactico.
- Sustitucion de plantillas en herramientas low-code: para catalogos cerrados de vistas y acciones, el modelo puede poblar variantes de applets manteniendo el mismo esqueleto `state`/`update`, siempre que el checker posterior valide las propiedades.
- Investigacion sobre dependencia del contexto de sistema: el par de puntuaciones 0/12 sin brief y 11/12 con brief convierte a este modelo en un banco de pruebas para medir cuanto de un comportamiento depende del prompt de sistema y no de los pesos.
- Despliegue local en equipos de desarrollo: con la cuantizacion Q4_K_M de 4,7 GB, el modelo cabe en un portatil o en una GPU de consumo y permite iterar sin conexion ni coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica en su lugar una tabla de validez medida con llama.cpp b11573, cuantizacion Q8_0, una semilla fijada por prompt, sobre 27 prompts reservados y 12 prompts escritos despues de congelar el dataset. La validez se define como parser + checker + lint de propiedades sin hallazgos, es decir, "el host ejecutaria este fichero", no "el fichero es correcto".

| Configuracion de entrada | Reservados 27 | Frescos 12 |
|---|---|---|
| Gramatica GBNF y system brief | 22/27 | 11/12 |
| Gramatica, sin brief | no medido | 0/12 |
| Brief, sin gramatica | 14/27 | no medido |

## Requisitos de hardware

- Cuantizacion Q4_K_M: 4,7 GB de fichero; cabe en portatiles y en GPUs de consumo con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070).
- Cuantizacion Q8_0: 8,1 GB de fichero; es el artefacto sobre el que se midieron los numeros de la tabla anterior. Requiere del orden de 10 GB de VRAM para dejar margen de contexto, por lo que encaja en RTX 4080, RTX 4090, A10G o superiores.
- Adaptador fusionado en fp16: aproximadamente 15,2 GB de pesos (7,6B parametros x 2 bytes), mas cache KV; requiere GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100).
- Despliegue recomendado: llama.cpp con `llama-server`, invocando `--grammar-file deal-applet.gbnf` y `--n-gpu-layers 99`. El autor documento el flujo con `brew install llama.cpp` o compilacion desde fuente, y lo probo en macOS, Linux y Windows.
- El ejemplo del repositorio usa `--ctx-size 8192` junto a `max_tokens` 4096, con el argumento de que el brief ocupa 437 caracteres y conviene gastar el contexto en la respuesta.
- Parametros de muestreo medidos: temperature 0,3, top_p 0,95, `dry_multiplier` 0,8, `dry_base` 1,75, `dry_allowed_length` 8 y `repeat_penalty` 1,05.
- Opciones alternativas de despliegue: vLLM, TGI u Ollama cargando el adaptador LoRA o el GGUF no estan documentadas en la informacion proporcionada. El adaptador en safetensors puede fusionarse y servirse con cualquier runtime compatible con PEFT, pero la restriccion por gramatica GBNF es especifica de llama.cpp en la configuracion descrita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-deal-v2 | ~7,6B (adaptador LoRA rank 32) | no especificado; base 131.072, ejemplo 8192 | Generacion de programas DEAL `.dealui` con gramatica GBNF | Apache-2.0 | HuggingFace, GGUF y safetensors, 35 descargas |
| Qwen2.5-7B-Instruct | ~7,6B | 131.072 | Modelo instruct generalista, base del anterior | Apache-2.0 (segun la ficha del base) | HuggingFace, ampliamente distribuido |
| qwen2.5-7b-deal-lora | ~7,6B (adaptador LoRA) | no disponible | Version previa del mismo autor para generar mini-apps DEAL | no disponible | HuggingFace, endpoint en FriendliAI |

La comparacion con Qwen2.5-7B-Instruct procede con cautela: el adaptador hereda su arquitectura y su licencia, pero su proposito es tan especifico que no es un sustituto del base para tareas generales, y a la inversa, el base no genera `.dealui` validos sin el ajuste y la gramatica. Frente a alternativas genericas de generacion de codigo, la ventaja diferencial de este modelo es la restriccion estructural por gramatica, no una puntuacion de benchmarks superior.

## Limitaciones y advertencias

- Validez no equivale a correccion: la gramatica y el checker sostienen la forma (tipos, construcciones permitidas, "cada accion despachada tiene su `update`"), pero no la semantica.
- Fallos semanticos documentados que sobreviven a la validacion: un identificador derivado del recuento de una lista (`id: length(items) + 1`) reutilizado tras un borrado, de modo que un `remove` posterior elimina el registro equivocado; un "like" que anade un registro que otra lista ya contiene, generando claves duplicadas; un "pass" que anade un registro vacio a la lista incorrecta.
- La gramatica no acota la longitud de los identificadores; en ocasiones una respuesta repite un identificador hasta agotar el presupuesto de tokens con `finish_reason: length`. El autor sugiere limitar `ident` con `{m,n}`.
- Sin el system brief de 437 caracteres, el modelo omite los bloques `update` y la puntuacion cae a 0/12 en el conjunto fresco, dejando todos los botones sin comportamiento.
- El modelo solo esta entrenado y evaluado en ingles; no hay soporte multilingue declarado.
- Repositorio con muy baja adopcion (35 descargas, 0 likes) y creado y actualizado el mismo dia, lo que limita la evidencia de uso en produccion mas alla de las comprobaciones del autor.
- El autor solo re-midio la validez sobre Q8_0; el GGUF Q4_K_M procede de la misma fusion f16 pero no fue re-evaluado.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0, sin restricciones de uso comercial declaradas, siguiendo los terminos del modelo base de Alibaba Cloud. Conviene verificar los terminos del base por si anaden condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pashoktond1/qwen2.5-7b-deal-v2
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Coleccion Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Version previa del adaptador con endpoint en FriendliAI: https://friendli.ai/models/pashoktond1/qwen2.5-7b-deal-lora
- Repositorio de la serie Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Ficha de especificaciones y casos de uso de Qwen2.5-7B: https://gate.ai/blog/qwen2-5-7b-specs-pricing-api-access-use-cases
