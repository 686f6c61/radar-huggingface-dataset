# dahyun-jeon/Qwen3.5-0.8B-LiteRT-fast

## Resumen

Qwen3.5-0.8B-LiteRT-fast es una reexportación y cuantización del modelo Qwen/Qwen3.5-0.8B preparada por el usuario dahyun-jeon para el runtime LiteRT-LM de Google, con el objetivo de ejecutarse en CPU de teléfonos móviles. No se ha reentrenado ni ajustado ningún peso: se trata de una conversión de un modelo base de 0,8 mil millones de parámetros a formato `.litertlm` en int8 dinámico, manteniendo en fp32 las proyecciones de puerta y las convoluciones.

La variante está optimizada para dispositivos que reconstruyen el motor de inferencia con frecuencia. Frente a la versión de referencia de litert-community, reduce las firmas de prefill de once (1…1024 tokens) a dos (prefill_32 + decode), lo que rebaja el tiempo de construcción del motor de 28,3 s a 2,2 s en un Galaxy S24 Ultra con LiteRT-LM 0.18.0. También recorta el caché KV de 4096 a 2048 tokens.

La contrapartida es que renuncia al backend GPU (su kernel de prefill emplea tensores de rango 5) y queda restringida a CPU, además de requerir un token de padding específico (248044) en la plantilla de chat. Es relevante para desarrolladores que necesitan desplegar generación de texto sobre un modelo de menos de 800 MB en hardware móvil de gama alta, aceptando las limitaciones de contexto y de precisión de la cuantización int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de texto (text decoder only) segun la model card; arquitectura interna del base Qwen3.5-0.8B no disponible. El uso de estado recurrente y de convoluciones en fp32 sugiere componentes de tipo recurrente o hibrido, sin confirmar |
| Parametros totales | 0,8 mil millones (0,8B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | Cache KV de 2048 tokens; longitud de contexto nativa del modelo base no disponible |
| Tipos de cuantizacion | int8 dinamico en los pesos principales; fp32 en proyecciones de puerta (gate projections) y convoluciones |
| Idiomas soportados | no disponible (las pruebas de correctitud incluyen prompts en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), archivo `Qwen3.5-0.8B_int8_c2048_v2.litertlm` de 787.570.176 bytes |

## Arquitectura y entrenamiento

La model card describe el artefacto como una reexportación del decodificador de texto de Qwen/Qwen3.5-0.8B para LiteRT-LM, sin aportar detalles sobre el número de capas, cabezas de atención o composición del dataset original. La conversión se ha realizado con litert-torch 0.9.4 mediante la función estándar `export_hf`. Se expone un único archivo `.litertlm` con dos firmas: `prefill_32` y `decode`. La cuantización es int8 dinámica, con proyecciones de puerta y convoluciones conservadas en fp32.

No se ha realizado ningún ajuste fino sobre el modelo base (la propia model card indica "no weights were fine-tuned"), por lo que no hay información sobre RLHF o DPO en esta ficha. La innovación técnica destacada es la reducción del coste de carga del motor: LiteRT paga un coste de `IrAllocator::EmplaceBack` que crece de forma cuadrática con el número de operaciones por firma, y al pasar de once firmas de prefill a una sola de 32 tokens ese coste se paga una única vez. Se documenta además un problema conocido de LiteRT-LM (issue #3165) por el que el estado recurrente se conserva entre conversaciones cuando se comparte un mismo motor, de ahí la recomendación de usar un `Engine` por conversación.

## Capacidades

- Generacion de texto autoregresiva en el backend CPU de LiteRT-LM.
- Ejecucion on-device en telefonos moviles de gama alta sin aceleracion GPU.
- Conversacion multi-turno con una ventana efectiva de 2048 tokens de cache KV (se midio una prueba de recall a dos turnos con 10 aciertos sobre 12).
- Soporte de los idiomas probados por el autor: ingles y coreano (idiomas oficialmente soportados no disponibles).
- Plantilla de chat ChatML simplificada, con bloque `<think>` vacio en cada turno del asistente, lo que implica modo de razonamiento desactivado.
- Tokenizacion con `pad_token` 248044, requerido por el grafo para enmascarar filas rellenadas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones moviles: el modelo se carga en el propio telefono (backend CPU, 787 MB int8) y evita enviar texto del usuario a un servidor, con una latencia de primer token de 0,55 s y 27,8 tok/s de decodificacion en un SM8650.
- Autocompletado y redaccion de texto corto en apps de notas o mensajeria: la ventana de 2048 tokens basta para contexto de varios parrafos y el arranque de 2,2 s (con cache de pesos caliente) permite instanciarlo bajo demanda.
- Respuestas frecuentes en ingles y coreano sobre un prompt de sistema fijo: el autor verifico un conjunto de respuesta conocida con 5 aciertos sobre 7 en un escenario de app real.
- Procesamiento local de datos sensibles (salud, finanzas personales, diario): al no requerir GPU ni conexion, el contenido no sale del dispositivo, lo que encaja con requisitos de privacidad.
- Prototipado e integracion de LiteRT-LM en pipelines de aplicaciones Android: sirve como referencia de como exportar un modelo Qwen3.5 a `.litertlm` con litert-torch 0.9.4 y `export_hf`.
- Investigacion sobre cuantizacion int8 on-device: el artefacto incluye mediciones de correctitud (91,3 % de coincidencia top-1 frente a fp32, KL media 0,0235) utiles para comparar estrategias de cuantizacion en movil.
- Sistemas de moderacion o clasificacion de texto ligera en el borde (edge), donde el coste de un modelo de 0,8B es asumible en CPU y la calidad absoluta no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo proporciona mediciones on-device y de correctitud frente al checkpoint original.

Mediciones en Galaxy S24 Ultra (SM8650), LiteRT-LM 0.18.0, CPU:

| Metrica | litert-community | Esta build |
|---|---|---|
| Construccion del motor (cache de pesos caliente) | 28,3 s | 2,2 s |
| Nueva conversacion (build + prompt de 124 tokens + respuesta) | 22,6-26,2 s | 2,1-2,3 s |
| Tiempo hasta el primer token (124 tokens) | 0,90 s | 0,55 s |
| Prefill | 143 tok/s | 243 tok/s |
| Decodificacion | 25,9 tok/s | 27,8 tok/s |

Correctitud de la conversion:

| Prueba | Resultado |
|---|---|
| fp32 vs checkpoint PyTorch (teacher-forced) | 152/152 top-1, KL 0,0000 |
| int8 sobre 980 posiciones (16 prompts, un tercio en coreano) | 895/980 top-1 (91,3 %), KL media 0,0235 |
| Padding (una llamada de 32 tokens vs dos con relleno) | Diferencia maxima 7,6e-6 con pad_token 248044; 4,03 con pad 0 |
| Set de respuesta conocida en telefono | 5/7 |
| Recall a dos turnos | 10/12 |

## Requisitos de hardware

- VRAM estimada: no aplica, el artefacto esta disenado para CPU. El backend GPU no esta soportado.
- GPU recomendadas: ninguna; el kernel de prefill usa tensores de rango 5 y queda restringido a CPU.
- Encaje en GPU de consumo: no aplica en esta build (el modelo base, en otro formato, si cabria en GPUs de consumo, pero esta conversion no esta pensada para ello).
- CPU de referencia medida: Qualcomm Snapdragon 8 Gen 3 (SM8650) de un Galaxy S24 Ultra.
- Memoria de almacenamiento: archivo unico de 787.570.176 bytes (aproximadamente 787 MB), mas el espacio de trabajo del motor y el cache KV de 2048 tokens.
- Opciones de despliegue: LiteRT-LM, con comando `litert_lm_main --backend=cpu --model_path=Qwen3.5-0.8B_int8_c2048_v2.litertlm --input_prompt="Hello"`.
- Latencia y throughput medidos: 2,2 s de construccion del motor con cache caliente, 2,1-2,3 s para conversacion nueva, 0,55 s hasta el primer token, 243 tok/s de prefill y 27,8 tok/s de decodificacion.
- Restriccion operativa: usar un `Engine` por conversacion para evitar la fuga de estado recurrente descrita en LiteRT-LM #3165.
- No se documentan requisitos para vLLM, llama.cpp, Ollama o TGI, formatos que este artefacto no utiliza.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / cache KV | Prefill | Decodificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dahyun-jeon/Qwen3.5-0.8B-LiteRT-fast (esta build) | 0,8B | cache KV 2048 | 243 tok/s | 27,8 tok/s | apache-2.0 | HuggingFace, formato `.litertlm` |
| litert-community/Qwen3.5-0.8B | 0,8B | cache KV 4096 | 143 tok/s | 25,9 tok/s | apache-2.0 (base) | HuggingFace, formato `.litertlm`, GPU soportada |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | longitud de contexto no disponible | no disponible | no disponible | apache-2.0 | HuggingFace, pesos PyTorch/safetensors (formato exacto no disponible) |

La diferencia principal frente a la build de litert-community es el numero de firmas de prefill (una de 32 tokens frente a once de 1 a 1024), lo que multiplica por aproximadamente 13 la velocidad de construccion del motor, a cambio de reducir el cache KV a la mitad y de perder el backend GPU. El modelo base Qwen/Qwen3.5-0.8B ofrece los pesos originales sin cuantizar, pero no esta empaquetado para ejecucion on-device directa.

## Limitaciones y advertencias

- El backend GPU no esta soportado: el kernel de prefill utiliza tensores de rango 5, por lo que la inferencia queda limitada a CPU.
- Es obligatorio conservar el `pad_token` 248044 en la plantilla de chat; eliminarlo provoca divergencias de estado de hasta 4,03 frente a 7,6e-6 con el token correcto.
- La ventana de cache KV se reduce a 2048 tokens, la mitad que la build de litert-community, lo que limita conversaciones largas o documentos extensos.
- La cuantizacion int8 degrada la coincidencia top-1 al 91,3 % frente al checkpoint fp32 (895/980 posiciones), con una KL media de 0,0235; no es un modelo apto para tareas que exijan exactitud estricta.
- El modo de razonamiento esta desactivado: la plantilla inserta un bloque `<think>` vacio en cada turno del asistente.
- La model card reporta un bug de LiteRT-LM (#3165) que conserva estado recurrente entre conversaciones si se comparte un unico motor; en produccion hay que instanciar un `Engine` por conversacion.
- Riesgo de alucinacion inherente a un modelo de 0,8B no ajustado; no se documentan evaluaciones de veracidad.
- Idiomas oficialmente soportados no disponibles; las pruebas solo cubren ingles y coreano, sin datos sobre castellano.
- No se documentan sesgos especificos, comportamiento de rechazo ni politicas de seguridad del autor de la conversion.
- Licencia apache-2.0 permite uso comercial, pero se trata de un derivado convertido y cuantizado del modelo base de Qwen; conviene revisar los terminos del modelo original (tambien apache-2.0 segun la model card).
- No se ofrece soporte ni versionado del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el mismo dia (2026-10-16).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dahyun-jeon/Qwen3.5-0.8B-LiteRT-fast
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Build de referencia de la comunidad (litert-community/Qwen3.5-0.8B): no se proporciona URL en la informacion disponible
- Issue LiteRT-LM #3165 (estado recurrente compartido entre conversaciones): no se proporciona URL directa en la informacion disponible
- Paper, blog o demo adicionales: no disponibles
