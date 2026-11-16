# guideboardlabs/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Monoglot-GGUF

## Resumen

Monoglot 9B es una variante del modelo Qwen3.5-9B de Alibaba, en su version sin censura afinada por HauhauCS, a la que se le ha practicado una poda quirurgica del vocabulario del tokenizador. El autor de esta ficha tecnica, guideboardlabs, parte del GGUF Q4_K_M de HauhauCS y elimina 118.300 de las 248.320 filas del vocabulario, conservando unicamente ASCII, simbolos matematicos y tipograficos, griego, dibujo de cajas, unidades y moneda (politica P1G). El resultado es un archivo un 12,0% mas pequeno (de 5.627.044.224 a 4.950.668.096 bytes) sin reentrenar ni recuantizar ningun peso: todas las filas supervivientes son identicas bit a bit a las del modelo original.

La relevancia de esta variante no esta en una mejora de calidad, sino en el rendimiento de decodificacion en hardware modesto. En una RX 5700 XT (8 GB, RDNA1) con llama.cpp y Vulkan, el modelo pasa de 49,09 a 52,07 tokens por segundo en generacion a profundidad 8192, una mejora del 6,1%. El precio es un tokenizador que degrada fuertemente los idiomas no latinos: el ruso consume 5,47 veces mas tokens y el chino 3,33 veces mas, mientras que el ingles y el codigo Python permanecen intactos.

El modelo subyacente tiene 7.984.689.664 parametros (aproximadamente 8B), esta pensado para inferencia local en ingles y se distribuye bajo licencia Apache 2.0. Es una pieza de nicho: util para quien despliega un LLM en ingles sobre GPU de gama media o baja y quiere exprimir el ancho de banda de memoria, no para aplicaciones multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), pesos en formato GGUF cuantizado Q4_K_M |
| Parametros totales | 7.984.689.664 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue del autor) |
| Tipos de cuantizacion | Q4_K_M (cuerpo), Q4_K (embeddings), Q6_K (cabeza de salida); KV cache q4_0 en las pruebas |
| Idiomas soportados | en (ingles); el tokenizador conserva ASCII y degrada el resto |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 130.020 filas (frente a 248.320 del original) |
| Tamano del archivo | 4.950.668.096 bytes (~4,6 GiB) |
| Repo | 5,0 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.5-9B original: un transformer denso de aproximadamente 8.000 millones de parametros. Esta variante no introduce cambios arquitectonicos ni reentrena pesos; la unica modificacion es la eliminacion de filas del vocabulario en el espacio ya cuantizado. Segun el autor, los 425 tensores no pertenecientes al vocabulario son identicos byte a byte al modelo fuente, y las filas conservadas de `token_embd.weight` y `output.weight` coinciden exactamente con sus originales. La herramienta empleada es `bsaleh03/ASCII-Condensed-prune-tools`, que aplica politicas de conservacion de vocabulario y realiza la recoleccion de filas directamente sobre el GGUF cuantizado.

La politica P1G conserva ASCII, simbolos matematicos y tipograficos, griego, dibujo de cajas, glifos de estado, unidades y moneda; excluye deliberadamente el rango latino acentuado (que seria la politica P2). El impacto en tamano es notable porque el vocabulario representaba el 25,0% del archivo original (1.406 MB de 5.627 MB): la cabeza de salida en Q6_K baja de 834 a 437 MB y los embeddings en Q4_K de 572 a 300 MB. No hay datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base; el ajuste sin censura es responsabilidad de HauhauCS y esta ficha no dispone de su detalle.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat preservada tras el remapeo de identificadores de token.
- Razonamiento y generacion de codigo: el autor verifica continuaciones greedy identicas al original para prompts en ingles y de codigo.
- Tool calling / function calling: una peticion con `tools` devuelve `finish_reason: tool_calls`, la funcion `read_file` y los argumentos `{"path":"/etc/hostname"}`.
- Soporte de conversaciones multi-turno con contexto largo (hasta 32.768 tokens en la configuracion de ejemplo).
- Manejo correcto de matematicas y simbolos tecnicos (∀, ∑, π, ≥, ✓) con el mismo conteo de tokens que el original.
- Capacidad multilingue muy limitada: el frances sin acentos se mantiene, pero el acentuado, el japones, el chino y el ruso se degradan severamente.
- Modelo sin censura (uncensored): el afinado de HauhauCS elimina restricciones de rechazo, aunque el autor no evaluo el comportamiento de rechazo.
- Solo texto: no incluye `mmproj`, por lo que no hay capacidad de vision.

## Casos de uso

- Agentes locales en ingles sobre GPU de gama media: el modelo cabe en 5,24 GiB de una tarjeta de 8 GiB con 2,7 GiB libres, lo que permite ejecutar tareas de agente multi-paso con contexto de 8192 tokens sin desbordar a CPU.
- Generacion de codigo en local: el tokenizador mantiene el conteo de tokens en Python (ratio 1,00x) y el tool calling funciona, por lo que puede integrarse en asistentes de edicion de codigo o pipelines de revision automatizada.
- Automatizacion de shell y operaciones de sistema: la llamada a herramientas con rutas de archivo funciona tras la poda, lo que habilita agentes que leen ficheros y ejecutan comandos en entornos controlados.
- Despliegue en hardware AMD antiguo: las pruebas se realizaron en una RX 5700 XT (RDNA1) con Vulkan, un escenario donde muchas pilas de inferencia no estan optimizadas; el modelo ofrece 52 tokens/s de decodificacion a profundidad 8192.
- Prototipado de chatbots en ingles con presupuesto de VRAM ajustado: al reducir el archivo un 12%, libera espacio para cache KV mas grande o para otros procesos en la misma GPU.
- Investigacion sobre poda de vocabulario: sirve como caso de estudio reproducible de como afecta la eliminacion de filas del vocabulario al rendimiento de decodificacion y a la tokenizacion por idioma.
- Evaluacion de modelos sin censura en ingles: util para estudiar el comportamiento de un modelo afinado sin restricciones en un entorno local, con la advertencia de que el autor no midio la tasa de rechazo.

## Benchmarks y rendimiento

El autor publica mediciones de `llama-bench` en llama.cpp `3ba1ce0` con Vulkan sobre RX 5700 XT (8 GB, RDNA1), flags `-ngl 99 -ctk q4_0 -ctv q4_0 -fa on -t 8 --cpu-mask 0x3f`, a profundidad 8192, tres repeticiones:

| Metrica | Modelo fuente | Este archivo | Variacion |
|---|---:|---:|---|
| pp512 @ 8192 (tokens/s) | 431,74 ± 2,91 | 434,45 ± 3,47 | plano |
| tg128 @ 8192 (tokens/s) | 49,09 ± 0,16 | 52,07 ± 0,16 | +6,1% |

El autor senala que un modelo ingenuo de ancho de banda predecia ~12% de mejora y la realidad dio 6,1%, lo que indica que la decodificacion no esta limitada exclusivamente por memoria. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, IFEval) en la informacion disponible; el autor declara explicitamente que no midio perplexity ni KL por no ser comparables entre vocabularios distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,24 GiB medidos en el modelo cargado con KV cache q4_0 a profundidad 8192 sobre una tarjeta de 8 GiB.
- GPU recomendadas: cualquier GPU con 8 GB o mas; el autor valido especificamente una RX 5700 XT (RDNA1) con Vulkan.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB (RX 5700 XT, RTX 3060 Ti, RTX 4060) y con holgura en 12 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-bench`) con backend Vulkan; compatible con endpoints estilo OpenAI segun los tags del repositorio. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 52,07 tokens/s de generacion y 434,45 tokens/s de prefill a profundidad 8192 en la configuracion medida.
- Comando de referencia del autor: `llama-server -m ...gguf -c 32768 -ngl 99 -ctk q4_0 -ctv q4_0 -fa on`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Notas |
|---|---|---:|---:|---|---|
| Este modelo (Monoglot 9B P1G) | ~8B | 32.768 (config. ejemplo) | 130.020 | Apache 2.0 | Poda de vocabulario, +6,1% decode en RDNA1 |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | ~8B | no disponible | 248.320 | Apache 2.0 | Modelo fuente, mismo afinado sin censura |
| Qwen/Qwen3.5-9B | ~8B | no disponible | 248.320 | Apache 2.0 | Base original de Alibaba |
| guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF | ~27B | no disponible | no disponible | Apache 2.0 | Primera entrada de la serie Monoglot, misma tecnica sobre otro modelo |

La comparacion relevante es contra el modelo fuente: misma calidad esperada en ingles (continuaciones greedy identicas verificadas), mismo tool calling, pero 676 MB menos de archivo y un 6,1% mas de velocidad de decodificacion a cambio de un tokenizador practicamente monoidioma.

## Limitaciones y advertencias

- Tokenizacion degradada en idiomas no latinos: ruso 5,47x, chino 3,33x, japones 2,67x y frances acentuado 1,72x mas tokens para el mismo texto, lo que encarece y ralentiza cualquier uso multilingue.
- El rango latino acentuado no se conserva (politica P1G), por lo que el espanol, el frances o el aleman con diacriticos caen a tokenizacion por bytes.
- No hay benchmarks de calidad ni de instruction-following: la correccion se limita a comprobaciones de integridad de pesos y continuaciones greedy, que no miden la calidad de seguimiento de instrucciones.
- El autor no evaluo el comportamiento de rechazo; el caracter "uncensored" implica riesgo de generar contenido no filtrado y la responsabilidad de moderacion recae en el desplegador.
- Riesgo de alucinacion inherente al modelo base, no medido ni mitigado en esta variante.
- Medido en una sola maquina, un solo build de llama.cpp y una sola cuantizacion (Q4_K_M, RDNA1, Vulkan, KV q4_0); el rendimiento puede diferir en otras GPU o backends.
- Solo texto: sin `mmproj`, no hay soporte de vision.
- La herramienta de poda (`bsaleh03/ASCII-Condensed-prune-tools`) no tiene licencia, por lo que su codigo no se redistribuye; la licencia Apache 2.0 aplica a los pesos, no a dicha herramienta.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base Qwen y del afinado de HauhauCS antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/guideboardlabs/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Monoglot-GGUF
- Modelo base sin censura: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Primera entrada de la serie Monoglot: https://huggingface.co/guideboardlabs/Qwen3.8-27B-Q3-DOWN-XS-Monoglot-GGUF
- Herramienta de poda: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Trabajo previo de referencia (fakezeta): https://huggingface.co/fakezeta/Qwen3.8-27B-UD-Q3_K_XL-Condensed-P2
- Publicacion que dio a conocer la tecnica: https://x.com/teksedge/status/2122118832441708600
