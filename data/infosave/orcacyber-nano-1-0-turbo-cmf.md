# infosave/OrcaCyber-Nano-1.0-Turbo-cmf

## Resumen

OrcaCyber-Nano-1.0-Turbo-cmf es una cuantizacion de 4 bits del modelo OrcaCyber-Nano-1.0, un modelo de 27B parametros de OrcaRouter orientado a trabajo de seguridad defensiva y construido sobre la arquitectura Qwen3.8-27B. El artefacto lo publica el usuario infosave bajo el paraguas de su cabecera "Turbo", que introduce una gestion de memoria de dispositivo pensada para mantener el modelo cargado en GPU durante prompts largos sin desbordar la VRAM.

El modelo base resuelve tareas de generacion de texto con enfasis en ciberseguridad, con soporte de razonamiento previo (thinking mode) y tool calling. La version Turbo-cmf se distribuye en formato CMF (un unico fichero de pesos) para cortiq, un motor de inferencia escrito en Rust sin Python ni frameworks de ML, con backends CUDA, Vulkan, DX12 y Metal.

La relevancia practica esta en el rendimiento con contexto largo en GPUs de gama media: segun la model card, en una tarjeta de 16 GB lee 64 000 tokens en 14,8 GB de VRAM y decodifica a 26,0 tok/s, mientras que el fichero estandar se queda sin memoria a partir de 16 000 tokens en esa misma tarjeta. En una RTX 3090 por CUDA alcanza 49 tok/s en decodificacion simple y 111-117 tok/s en codigo con borradores del cabezal MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B), con cabezal MTP para decodificacion especulativa |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131 072 tokens configurable via `CMF_MAX_SEQ`; por defecto 32 768 en servidor |
| Tipos de cuantizacion | 4-bit (q4tp); fichero opcional DFlash 2 drafter tambien en 4-bit |
| Idiomas soportados | en, ru, zh |
| Licencia | qwen (etiquetada como "other" en la model card, con enlace a la licencia del modelo base) |
| Formato de pesos | CMF (fichero unico para cortiq); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.8-27B, un transformer denso de 27B parametros. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo original orcarouter/OrcaCyber-Nano-1.0 y no se reproduce en la ficha del artefacto cuantizado. El enfasis declarado del modelo base es el trabajo de seguridad defensiva, lo que sugiere un ajuste orientado a dominios de ciberseguridad, aunque no se aportan cifras de entrenamiento.

La innovacion tecnica de esta version es la cabecera "Turbo", que gestiona la memoria de dispositivo para mantener los pesos residentes en GPU durante prompts largos y evitar el desalojo que sufre el fichero estandar a partir de 16 000 tokens en tarjetas de 16 GB. Ademas, el modelo incorpora un cabezal MTP (multi-token prediction) que genera borradores de tokens y acelera la decodificacion aproximadamente al doble en codigo. Opcionalmente se puede anadir un drafter DFlash 2 (1,3 GB) para ganancias adicionales en CUDA. El motor cortiq implementa la inferencia en Rust puro, sin dependencias de Python ni de frameworks de ML.

## Capacidades

- Generacion de texto y razonamiento con modo thinking opcional: sin `--no-think` el modelo razona antes de responder, lo que exige elevar `--max-tokens` (por defecto 256).
- Analisis y resumen de documentos largos: soporta prompts de hasta 64 000 tokens medidos en 16 GB de VRAM, y hasta 131 072 tokens configurando `CMF_MAX_SEQ`.
- Tool calling y function calling: el endpoint `/v1/chat/completions` acepta el parametro `tools` en el formato OpenAI.
- Trabajo de seguridad defensiva: resumen de informes de incidentes, analisis de texto tecnico y tareas asistidas en el dominio de ciberseguridad, segun el proposito declarado del modelo base.
- Decodificacion especulativa con cabezal MTP integrado, activable con `temperature: 0` o `--greedy`, con ganancias de hasta 2x en generacion de codigo.
- Multilinguee en ingles, ruso y chino.
- Servicio via API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) con streaming y dashboard web.

## Casos de uso

- Triaje de incidentes de seguridad: el modelo puede recibir un informe de incidente completo (hasta 64 000 tokens en una GPU de 16 GB) y producir un resumen con `enable_thinking: false` para respuestas directas, gracias a la gestion de memoria Turbo que mantiene el contexto largo en VRAM.
- Analisis de logs y trazas extensas: con 131 072 tokens de contexto configurable, se puede volcar un volcado de logs o una traza de red y pedir correlacion de eventos, usando `CMF_MAX_SEQ` por encima de la longitud del documento.
- Asistente de respuesta a incidentes en local: desplegado con `cortiq serve` en `127.0.0.1`, ofrece una API compatible con OpenAI sin dependencias de Python, adecuada para entornos aislados donde no se quiere enviar datos a la nube.
- Generacion y revision de codigo en pipelines de seguridad: con decodificacion especulativa MTP (111-117 tok/s en RTX 3090 con borradores) y soporte de tool calling, se puede integrar en flujos de revision automatizada de parches o scripts de analisis.
- Documentacion tecnica multilinguee: traduccion y resumen de material en ingles, ruso y chino, aprovechando el soporte declarado de los tres idiomas.
- Despliegue en estaciones de trabajo con GPU consumer: en una RTX 2000 Ada de 16 GB decodifica a 26 tok/s con 64 000 tokens de contexto, lo que permite usar el modelo como asistente local en portatiles o workstations sin GPU de datacenter.
- Chat multi-turno con contexto persistente: el servidor cachea la conversacion y en turnos que continuan el anterior solo lee lo nuevo, lo que reduce el coste de lecturas repetidas en sesiones largas.

## Benchmarks y rendimiento

Datos de la model card medidos con `cortiq bench --core` en una NVIDIA RTX 2000 Ada (16 GB, 70 W) con backend Vulkan, 60 tokens generados tras un prompt de la longitud indicada:

| Prompt (tokens) | Primer token, s (estandar) | Primer token, s (Turbo) | Decodificacion, tok/s (estandar) | Decodificacion, tok/s (Turbo) | VRAM pico, GB (estandar) | VRAM pico, GB (Turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 1 000 | 9,1 | 8,9 | 27,4 | 29,9 | 14,1 | 14,1 |
| 4 000 | 37,0 | 36,7 | 25,8 | 26,7 | 14,5 | 14,5 |
| 16 000 | no cabe | 159 | — | 26,7 | — | 14,8 |
| 32 000 | no cabe | 324 | — | 26,3 | — | 14,8 |
| 64 000 | no cabe | 652 | — | 26,0 | — | 14,8 |

Notas de la model card: el primer token incluye el movimiento de pesos a la tarjeta (unos 5 s); la lectura del prompt se hace a 98-112 tok/s; el benchmark decodifica con los borradores MTP activados. En RTX 3090 por CUDA: 49 tok/s en decodificacion simple y 111-117 tok/s en codigo con borradores. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,1-14,8 GB para el fichero de 14,3 GB en 4-bit, segun la longitud de prompt; el drafter DFlash opcional anade 1,3 GB.
- GPU recomendadas: RTX 2000 Ada (16 GB) validada en la model card; RTX 3090 validada por CUDA con 49 tok/s simples y 111-117 tok/s en codigo; cualquier GPU con 16 GB o mas de VRAM.
- Cabe en GPU consumer de 16 GB (RTX 4080, RTX 4090, RTX 2000 Ada, RTX A4000) segun los datos de la model card; no se especifican requisitos para tarjetas de 8 o 12 GB.
- Backends de despliegue: cortiq con CUDA (build `--features cuda`, version 0.8.69 o superior), Vulkan, DX12 o Metal; servidor HTTP compatible con OpenAI via `cortiq serve`.
- Latencia y throughput: primer token de 8,9 s con prompt de 1 000 tokens (incluye 5 s de carga de pesos); 26,0-29,9 tok/s de decodificacion en RTX 2000 Ada; 49 tok/s simples y 111-117 tok/s en codigo en RTX 3090.
- Carga del modelo: unos 8 s para los 14 GB en la tarjeta medida; cada `cortiq run` recarga el modelo, por lo que para chat conviene mantenerlo cargado con `cortiq serve`.
- RAM de sistema: la model card menciona el uso de RAM de host del fichero Turbo durante la carga, sin cifra concreta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OrcaCyber-Nano-1.0-Turbo-cmf | 27B | 131 072 configurable | 4-bit (q4tp) | qwen | CMF (cortiq) | Gestion Turbo de VRAM; MTP integrado; 26 tok/s en 16 GB con 64k tokens |
| OrcaCyber-Nano-1.0 (estandar) | 27B | no disponible | no disponible | qwen | no disponible | Mismos pesos sin cabecera Turbo; se queda sin VRAM a partir de 16k tokens en 16 GB |
| Qwen3.8-27B Turbo (referencia de cabecera) | 27B | no disponible | 4-bit | qwen | CMF | Cabecera Turbo sobre la que se apoya este artefacto, segun la model card |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la model card; al ser un ajuste de dominio de ciberseguridad, puede presentar sesgos propios del corpus de entrenamiento del modelo base, no detallado.
- Riesgo de alucinacion: no se cuantifica; como modelo generativo de 27B, es susceptible de producir contenido incorrecto, especialmente en dominios tecnicos especializados.
- Limitaciones de idioma: solo se declaran ingles, ruso y chino; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: la licencia se etiqueta como "other" con `license_name: qwen` y enlace a la licencia del modelo base; es necesario revisar los terminos de orcarouter/OrcaCyber-Nano-1.0 antes de uso comercial.
- El servidor por defecto escucha en todas las interfaces y no verifica API key; hay que usar `--host 127.0.0.1` para mantenerlo local.
- El modo thinking esta activado por defecto y consume tokens de razonamiento; con `--max-tokens` por defecto (256) las respuestas pueden truncarse.
- La longitud de contexto por defecto en servidor es 32 768 tokens; hay que subir `CMF_MAX_SEQ` explicitamente para documentos mas largos.
- El formato CMF solo es compatible con el motor cortiq; no hay pesos en safetensors ni GGUF para otros runtimes.
- El rendimiento medido corresponde a una RTX 2000 Ada de 70 W; en otras GPU los numeros pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/OrcaCyber-Nano-1.0-Turbo-cmf
- Modelo base: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0
- Cabecera Turbo de referencia: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
- Repositorio del motor cortiq: https://github.com/infosave2007/cmf
- Imagen comparativa de rendimiento: https://huggingface.co/infosave/OrcaCyber-Nano-1.0-Turbo-cmf/resolve/main/assets/compare_en.png
