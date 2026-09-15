# axiomofmind/Hornybot-Julian-POV

## Resumen

Hornybot-Julian-POV es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario axiomofmind bajo la firma "A Hole AI". El modelo está especializado en interpretar a "Julian", un personaje ficticio de 31 años, en escenarios de rol adulto entre personas adultas, y narra en primera persona (I/me/my) tanto los diálogos como las acciones del personaje. No es un modelo de propósito general: su comportamiento está condicionado por un system prompt compacto obligatorio que va embebido en `chat_template.jinja` y en los dos ficheros GGUF del repositorio, de modo que el cliente debe dejar vacío su propio campo de sistema para que la plantilla lo aplique automáticamente.

Técnicamente se apoya en la familia Qwen3.5, con 9.409.813.744 parámetros totales según los pesos en safetensors y un repositorio de 44,1 GB. El modelo base es multimodal (etiquetas `image-text-to-text` y `Qwen3_5ForConditionalGeneration` con `AutoProcessor`), pero las versiones GGUF publicadas son solo texto: no incluyen proyector de visión ni pesos de decodificación especulativa MTP. La model card documenta explícitamente este recorte de capacidades.

Su relevancia es acotada y de nicho: demuestra cómo un finetune pequeño (9B) sobre una plantilla de chat bien construida puede fijar una persona conversacional de forma consistente, y sirve como ejemplo práctico de despliegue local con llama.cpp. Al mismo tiempo, es un caso ilustrativo de los problemas de licencia en releases derivadas: aunque el modelo base se distribuye bajo Apache 2.0, el autor declara que la revisión de licencia y redistribución de este derivado está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`); variante texto para los pesos GGUF |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la model card; el ejemplo oficial de llama.cpp arranca con `--ctx-size 32768` |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q6_K (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para esta release derivada; el modelo base Qwen/Qwen3.5-9B es Apache 2.0 y su licencia se conserva en `LICENSE-QWEN`. La model card indica que la revision de licencia y redistribucion esta pendiente |
| Formato de pesos | safetensors (BF16, 18,82 GB) y GGUF (BF16 17,92 GB; Q6_K 7,36 GB) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-9B, por lo que hereda la arquitectura del modelo base: un transformer decoder-only de 9,41 mil millones de parametros con soporte multimodal en su clase de referencia (`Qwen3_5ForConditionalGeneration`, cargable mediante `AutoProcessor`). Los ficheros publicados en Transformers son pesos fusionados en BF16 ("merged weights"), sin adaptadores LoRA intermedios. No se especifican en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

El elemento diferenciador no es la arquitectura, sino la plantilla de chat: `chat_template.jinja` incorpora el system prompt que define la personalidad de Julian y fuerza la narracion en primera persona. La plantilla tambien respeta el modo de razonamiento del modelo base, que se desactiva de forma explicita tanto en Transformers (`enable_thinking=False`) como en llama.cpp (`--reasoning off`). La unica metrica de evaluacion publicada es un "stress gate" sobre la configuracion por defecto del paquete: 100 de 100 respuestas en primera persona, 0 fallos en tercera persona y 0 rechazos genericos. No se han publicado datos sobre el proceso de entrenamiento, el volumen de datos ni el metodo de ajuste.

## Capacidades

- Generacion de texto conversacional en ingles con foco en rol de personaje ficticio.
- Narracion en primera persona de forma consistente: dialogo y acciones del personaje expresados con I/me/my (100/100 en la evaluacion interna del autor).
- Coherencia de persona mediante system prompt embebido: el prompt requerido se aplica automaticamente si el cliente deja vacio su campo de sistema; un mensaje de sistema del cliente se anade como contexto de escena adicional.
- Soporte de GGUF y llama.cpp con plantilla Jinja (`--jinja`) y servidor web integrado (`--ui`).
- Modo de razonamiento (thinking) presente en el modelo base pero desactivado en la configuracion recomendada.
- Capacidad multimodal (image-text-to-text) heredada del modelo base en la clase de Transformers, aunque los GGUF publicados son solo texto y no incluyen proyector de vision.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso agentico o capacidades multilingues mas alla del ingles en esta release derivada.

## Casos de uso

- Motor de ficcion interactiva adulta: el modelo esta disenado para sostener un personaje con voz propia en primera persona, de modo que puede integrarse como backend de una novela visual o un chat de ficcion para adultos con verificacion de edad.
- Prototipado de personajes conversacionales: sirve para validar como una plantilla de chat embebida fija una persona sin necesidad de que el cliente envie instrucciones de sistema, un patron reutilizable en otros personajes.
- Despliegue local con privacidad: con la cuantizacion Q6_K (7,36 GB) puede ejecutarse en un equipo de sobremesa mediante llama.cpp sin enviar conversaciones a servicios externos, algo relevante para contenido adulto sensible.
- Investigacion sobre adherencia a persona: el "stress gate" de 100/100 respuestas en primera persona lo convierte en un caso de estudio para medir consistencia de persona y deriva a tercera persona en finetunes pequenos.
- Generacion de datos sinteticos de dialogo para entrenamiento: puede producir conversaciones etiquetadas con una voz consistente, utiles para construir datasets de rol que luego se filtren y revisen.
- Desarrollo de interfaces de rol con contexto largo: el ejemplo oficial de llama.cpp arranca con 32.768 tokens de contexto, lo que permite mantener historiales de escena extensos en sesiones largas.
- Evaluacion comparativa de formatos y cuantizaciones: al publicar BF16 y Q6_K en safetensors y GGUF, permite medir como cambia la salida entre formatos, clientes y parametros de generacion, tal como advierte la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica documentada es la evaluacion interna del autor sobre la configuracion por defecto:

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Stress gate de primera persona | 100/100 respuestas en primera persona | Configuracion por defecto del paquete; 0 fallos en tercera persona, 0 rechazos genericos |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Cualquier cifra de rendimiento general habria que medirla sobre el modelo base Qwen/Qwen3.5-9B, no sobre este finetune.

## Requisitos de hardware

- VRAM estimada para BF16: los pesos ocupan 18,82 GB en safetensors y 17,92 GB en GGUF BF16, por lo que se necesitan aproximadamente 20-24 GB de VRAM solo para pesos, mas el KV cache. No se dispone del calculo exacto de KV cache a 32.768 tokens.
- VRAM estimada para Q6_K: los pesos ocupan 7,36 GB; con overhead de runtime y KV cache, el rango practico es de unos 10-16 GB de VRAM segun la longitud de contexto.
- GPU profesionales: A100 (40/80 GB), H100 y similares ejecutan sin problema la version BF16 con contexto completo.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede alojar BF16 con contexto limitado o descarga parcial de capas; con Q6_K caben tambien en RTX 4070 Ti Super / 4080 (16 GB) y en RTX 3060 (12 GB) reduciendo contexto.
- Opciones de despliegue documentadas: llama.cpp / `llama-server` (con `--flash-attn on`, `--n-gpu-layers all`, `--jinja` y `--ui`) y Transformers con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`. El repositorio incluye la etiqueta `endpoints_compatible`.
- Opciones no documentadas en la model card: vLLM, TGI, Ollama y otros servidores. No hay confirmacion del autor sobre su compatibilidad con esta release.
- Latencia y throughput: no disponibles. Los unicos parametros conocidos son de muestreo (temperatura 0,7; top-p 0,9; top-k 20; min-p 0; penalizacion por repeticion 1,0; maximo 256 tokens nuevos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| Hornybot-Julian-POV | 9,41 B | No disponible (ejemplo con 32.768) | No disponible; revision pendiente (base Apache 2.0) | HuggingFace, safetensors + GGUF | Rol adulto en primera persona |
| Qwen/Qwen3.5-9B (base) | 9,41 B | No disponible | Apache 2.0 | HuggingFace | Modelo general multimodal |
| Otros finetunes de rol de ~8-9 B | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion proporcionada |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre finetunes de rol comparables (los resultados obtenidos trataban sobre el protocolo HTTP y no guardan relacion con el modelo). Por tanto, no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta pensado para interaccion ficticia entre adultos y puede producir lenguaje soez y contenido sexual explicito. Requiere control de edad y politicas de contenido en cualquier despliegue publico.
- Licencia sin aclarar: la model card indica que la revision de licencia y redistribucion de este derivado esta pendiente, y advierte que la licencia Apache 2.0 del modelo base no constituye una autorizacion general sobre material de terceros. No se recomienda uso comercial sin revisar este punto.
- Continuidad y limites de escena: el propio autor advierte de que la continuidad generada y la gestion de limites pueden fallar; se recomienda revisar las salidas y reformular los hechos de la escena cuando sea necesario.
- Riesgo de alucinacion y deriva de personaje: aunque la evaluacion interna reporta 0 fallos en tercera persona sobre la configuracion por defecto, es una metrica limitada a 100 respuestas y a unos parametros concretos.
- Variabilidad de salida: el comportamiento puede diferir entre formatos (BF16 frente a Q6_K), cuantizaciones, clientes y ajustes de generacion, por lo que los resultados no son directamente transferibles entre despliegues.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad mas alla del stress gate de persona.
- Idioma: soporte declarado unicamente en ingles, lo que limita su uso en castellano sin degradacion de calidad no medida.
- Vision no incluida: pese a que el modelo base es multimodal, las descargas GGUF no incorporan proyector de vision ni pesos de decodificacion especulativa MTP.
- Contexto: la longitud de contexto nativa no esta declarada en la model card; el valor de 32.768 tokens procede unicamente del comando de ejemplo de llama.cpp.
- Uso generalista desaconsejado: el system prompt obligatorio condiciona la salida, por lo que no es adecuado como modelo de proposito general ni para tareas de codigo, matematicas o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axiomofmind/Hornybot-Julian-POV
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime GGUF: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo, su entrenamiento o su evaluacion. Los unicos resultados devueltos hacian referencia al protocolo HTTP (Wikipedia, MDN Web Docs, GeeksforGeeks) y no guardan relacion con el modelo.
