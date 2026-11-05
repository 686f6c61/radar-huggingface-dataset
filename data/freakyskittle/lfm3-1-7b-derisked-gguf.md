# freakyskittle/LFM3-1.7B-DERISKED-GGUF

## Resumen

LFM3-1.7B-DERISKED-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Blackfrost-AI/LFM3-1.7B-DERISKED, un ajuste fino del modelo base LiquidAI/LFM3-1.7B desarrollado por Liquid AI. El trabajo de cuantizacion lo firma el usuario freakyskittle y esta orientado a su ejecucion local mediante llama.cpp, con soporte para la arquitectura `lfm3` introducida en el commit `cf24317be` del repositorio upstream.

El modelo cuenta con 1.728.801.600 parametros y esta pensado para generacion de texto conversacional. Su interes practico reside en que ofrece una version compacta (entre 0,75 GB y 3,47 GB segun cuantizacion) de un modelo de la familia LFM3, lo que permite desplegarlo en hardware modesto, incluidos equipos con GPU integrada, manteniendo el modo de razonamiento (`<think>`) que el modelo activa por defecto a traves de su plantilla de chat.

La relevancia actual del artefacto es acotada: se trata de una cuantizacion derivada, sin evaluaciones publicadas mas alla de un smoke test funcional, con cero descargas y cero likes en el momento de la consulta. Resulta util como opcion de inferencia local para quien ya trabaje con la familia LFM3, pero no constituye un modelo nuevo ni aporta mejoras de rendimiento documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `lfm3` en llama.cpp; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue de la model card) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de LiquidAI/LFM3-1.7B, un transformer de 1,73 mil millones de parametros. La model card no documenta la arquitectura interna (tipo de atencion, uso de capas recurrentes o hibridas, ni detalles del tokenizador), por lo que esos extremos deben consultarse en la ficha del modelo base de Liquid AI. La unica informacion tecnica concreta es que requiere una compilacion de llama.cpp con soporte para la arquitectura `lfm3`, introducida en el commit `cf24317be`; compilaciones anteriores no cargan los pesos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si el ajuste fino empleo RLHF, DPO u otra tecnica de alineamiento. La model card del repositorio de cuantizacion no incluye ningun detalle al respecto, y tampoco se aportan datos sobre el proceso de entrenamiento del modelo original LFM3-1.7B. La unica innovacion documentada es funcional: el modelo emite razonamiento en etiquetas `<think>` por defecto, controlable mediante el parametro `enable_thinking` de la plantilla de chat.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja compatible con llama.cpp (`--jinja`).
- Modo de razonamiento explicito: emite bloques `<think>` antes de la respuesta por defecto, activable o desactivable via `enable_thinking`.
- Generacion de codigo basico: el smoke test del autor verifica la escritura de una funcion Python `is_prime(n)` correcta en todas las cuantizaciones.
- Capacidad multilingue: no documentada; los idiomas soportados figuran como no disponibles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla del modo de razonamiento interno.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Inferencia local en equipos de gama baja: con la cuantizacion Q4_K_M (1,10 GB) el modelo cabe en GPUs integradas y en sistemas con poca VRAM, lo que permite experimentar con un modelo de la familia LFM3 sin infraestructura dedicada.
- Prototipado de asistentes conversacionales: la plantilla de chat con modo de razonamiento permite construir dialogos multi-turno con trazas de pensamiento visibles, utiles para depurar la logica de respuesta.
- Generacion de codigo en entornos de desarrollo locales: el smoke test confirma salida de funciones Python correctas, adecuado para autocompletado o generacion de utilidades simples en editores con integracion llama.cpp.
- Despliegue con llama-server: el ejemplo de la model card (`llama-server -ngl 99 -c 32768 --jinja`) permite levantar un endpoint HTTP compatible con clientes de chat en una maquina de sobremesa con contexto de 32.768 tokens.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye once variantes desde BF16 hasta Q2_K con tamanos declarados, lo que facilita medir el compromiso entre calidad y memoria en hardware concreto.
- Investigacion sobre degradacion por cuantizacion: la nota del autor de que Q2_K "coherente pero divaga mas" ofrece un punto de partida para estudiar la perdida de calidad en cuantizaciones agresivas de modelos de 1,7B.
- Uso educativo y pruebas de razonamiento: el modo `<think>` permite observar cadenas de razonamiento en un modelo pequeno, util para docencia o analisis de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente realizo un smoke test con el prompt "Write a Python function is_prime(n)" a temperatura 0 sobre llama.cpp Vulkan (Radeon 680M, RADV), con resultado correcto en todos los ficheros. No se ejecuto ninguna evaluacion adicional ni se uso imatrix durante la cuantizacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~0,75 GB; Q3_K_M ~0,91 GB; IQ4_XS ~1,01 GB; Q4_0 ~1,05 GB; Q4_K_S ~1,06 GB; Q4_K_M ~1,10 GB; Q5_K_S ~1,23 GB; Q5_K_M ~1,26 GB; Q6_K ~1,43 GB; Q8_0 ~1,85 GB; BF16 ~3,47 GB. Estos tamanos corresponden a los ficheros; la VRAM real debe sumar el contexto KV cache para 32.768 tokens.
- GPU recomendadas: no hay recomendaciones oficiales. El autor verifico funcionamiento en una GPU integrada Radeon 680M mediante Vulkan (RADV), lo que indica que el modelo es viable en hardware de gama baja.
- Compatibilidad con GPU de consumo: si, en cualquier GPU con al menos ~2 GB de VRAM libre para cuantizaciones Q4, y ~4 GB para BF16, mas el espacio de cache de contexto.
- Opciones de despliegue: llama.cpp (obligatorio, build con soporte `lfm3` posterior al commit `cf24317be`); llama-server con `-ngl 99 -c 32768 --jinja`. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-DERISKED-GGUF (este) | 1,73B | 32.768 (ejemplo) | LFM Open License v1.0 | GGUF | Cuantizacion de un finetune; sin benchmarks |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Modelo base original de Liquid AI |
| Blackfrost-AI/LFM3-1.7B-DERISKED | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Finetune intermedio del que deriva esta cuantizacion |

No se dispone de datos de rendimiento comparado con otras familias de modelos de tamano similar, por lo que la comparativa se limita a la lineage del propio modelo.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni MMLU, ni HumanEval, ni GSM8K; el unico test es un smoke test con un unico prompt.
- Cuantizacion Q2_K debil: el propio autor advierte que es coherente pero divaga mas; solo recomendable si la memoria es limitada.
- Requisito de version de llama.cpp: compilaciones anteriores al commit `cf24317be` no cargan la arquitectura `lfm3`, lo que puede romper pipelines existentes.
- Idiomas no documentados: no se puede garantizar calidad fuera del ingles sin evaluacion previa.
- Riesgo de alucinacion: inherente a modelos de 1,7B; no hay datos de alineamiento ni de mitigacion en la informacion disponible.
- Licencia LFM Open License v1.0: es una licencia "other" que debe revisarse antes de uso comercial; no se detallan aqui sus restricciones porque el texto no esta incluido en la informacion proporcionada.
- Modelo derivado sin mantenimiento aparente: creado y actualizado el mismo dia (2026-11-05), con cero descargas y cero likes; no hay garantia de soporte ni actualizaciones.
- Contexto de 32.768 tokens solo verificado como parametro de ejemplo en llama-server; no se confirma que el modelo haya sido entrenado para esa longitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/freakyskittle/LFM3-1.7B-DERISKED-GGUF
- Modelo base del finetune: https://huggingface.co/Blackfrost-AI/LFM3-1.7B-DERISKED
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- llama.cpp (build con soporte `lfm3`, commit `cf24317be`): https://github.com/ggml-org/llama.cpp
