# rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF

## Resumen
Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen3.8-Flash-Next, publicada por el usuario rSalone sobre el trabajo de cuantización de ISTA-DASLab. El modelo base es un Qwen3.8-Flash-Next cuantizado en formato GGUF IQ3_S, un transformer de gran tamano con 176.943.899.520 parametros totales (aproximadamente 177 mil millones) y un repositorio de 84,5 GB repartido en dos shards. La intervencion consiste en eliminar la "direccion de rechazo" (refusal direction) unicamente en las capas 6 a 41, en lugar de en las 45 capas del release anterior (q8g), con el objetivo de reducir la divergencia respecto al modelo original manteniendo el mismo nivel de cumplimiento de peticiones daninas.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de edicion de pesos (abliteration selectiva por capas) que busca minimizar el impacto en la distribucion de salida, medida mediante divergencia KL. Por otro, ilustra un caso practico de despliegue de un modelo de ~177B parametros en hardware de consumo (una RTX 5090 de 32 GB) mediante el motor de inferencia Strata, que combina offloading de expertos y cache KV en int8. Es, por tanto, un ejemplo de ingenieria de cuantizacion agresiva y de motores especializados mas que un modelo de proposito general listo para produccion.

El modelo se distribuye bajo licencia qwen-community-1.0 (etiquetada como "other" en Hugging Face) y esta pensado para ejecutarse exclusivamente con el motor Strata 0.2.15, no con llama.cpp. El autor no ha publicado resultados de benchmarks estandar ni mediciones de latencia o VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-Flash-Next, presumiblemente MoE por el uso de perfiles de expertos en Strata; no confirmado en la informacion disponible) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K, configurado en las pruebas del autor) |
| Tipos de cuantizacion | IQ3_S (GGUF), atencion re-cuantizada a Q8_0 desde pesos BF16 oficiales; cache KV en int8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiqueta "other" en Hugging Face) |
| Formato de pesos | GGUF (dos shards, 84,5 GB en total) |

## Arquitectura y entrenamiento
El modelo deriva de Qwen3.8-Flash-Next, un transformer de gran escala del que la informacion disponible no detalla el numero de capas, la configuracion de atencion ni si emplea mezcla de expertos. El uso de un "expert profile" y de una cache de expertos en las opciones de Strata sugiere una arquitectura MoE, pero no se confirma explicitamente. El modelo base inmediato es la cuantizacion IQ3_S de ISTA-DASLab, que a su vez cuantiza los pesos BF16 oficiales; antes de la edicion, la atencion de este modelo se sustituyo por una version Q8_0 construida desde los pesos BF16 para reducir el error de cuantizacion.

La innovacion principal es la abliteration selectiva: en lugar de eliminar la direccion de rechazo en las 45 capas del release anterior (capas 0-44), se elimina solo en las 36 capas 6-41. El autor selecciono ese rango mediante un barrido de 59 rangos de capas, evaluando cada uno sobre 50 prompts daninos clasificados en cuatro categorias (refused, reluctant, partial/generic, complied) por un Qwen3.8 27B local, y despues con una tarea de agente en OpenCode (construccion de un flujo de imagenes en ComfyUI) ejecutada 3 veces por condicion. El rango 6-41 fue uno de los cuatro que completaron las 3 ejecuciones sin vacilacion, con una divergencia KL de 0,0214 frente al modelo pre-edicion (aproximadamente dos tercios de la KL de q8g, 0,0456). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades
- Generacion de texto conversacional multi-turno, con soporte de contexto largo de hasta 262.144 tokens.
- Entrada de imagenes (vision) mediante el proyector multimodal `mmproj-Qwen3.8-Flash-Next-BF16.gguf` de ISTA-DASLab y la opcion `--vision` del motor.
- Ejecucion de tareas de agente multi-paso, segun la prueba del autor en OpenCode (generacion de flujos en ComfyUI).
- Decodificacion especulativa MTP (multi-token prediction) soportada por el motor Strata.
- Cumplimiento de peticiones que el modelo original rechazaria (comportamiento "uncensored"/abliterated), incluidas peticiones daninas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card esta en ingles y japones, pero no se documentan idiomas soportados.

## Casos de uso
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir como la eliminacion de la direccion de rechazo en un subconjunto de capas afecta al comportamiento y a la distribucion de salida (KL de 0,0214 frente al modelo pre-edicion).
- Evaluacion de tecnicas de abliteration: comparar el rango 6-41 con q8g (0-44) permite analizar el compromiso entre supresion de rechazos y deriva del modelo en tareas de red teaming.
- Despliegue de modelos de ~177B en hardware de consumo: con una RTX 5090 (32 GB), 128 GB de DDR5 y el motor Strata, el modelo se ejecuta con contexto de 256K, cache KV int8 y decodificacion especulativa MTP, lo que lo hace util para probar pipelines de inferencia con offloading de expertos.
- Pruebas de agentes con contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos de herramientas y ficheros en tareas de automatizacion como las ejecutadas en OpenCode.
- Generacion de flujos multimodales: con el proyector de vision, puede procesar imagenes de entrada para tareas de descripcion o construccion de pipelines visuales (por ejemplo, ComfyUI).
- Analisis de cuantizacion IQ3_S: util para estudiar la perdida de calidad de una cuantizacion de ~3 bits en un modelo de 177B y su interaccion con la re-cuantizacion Q8_0 de la atencion.
- Escenarios de generacion creativa sin restricciones: el modelo responde a prompts que el original rechaza, lo que puede interesar en investigacion sobre contenido sensible, siempre con las cautelas legales correspondientes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas de la edicion: 0 rechazos sobre 50 prompts daninos y 3 de 3 ejecuciones completadas sin vacilacion en la tarea de agente, con una divergencia KL de 0,0214 frente al modelo pre-edicion. No se han medido VRAM, memoria ni velocidad de inferencia.

## Requisitos de hardware
- VRAM estimada: no medida por el autor; el entorno de prueba emplea una RTX 5090 de 32 GB con offloading a RAM (contenedor limitado a 88 GB de los 128 GB DDR5 del sistema).
- GPU recomendadas: el autor solo valida NVIDIA GeForce RTX 5090 (32 GB). No hay datos para A100, H100 u otras GPU.
- Cabe en GPU de consumo: si, en una RTX 5090 (32 GB) con 128 GB de RAM DDR5 y almacenamiento en SSD M.2, segun el entorno probado.
- Opciones de despliegue: exclusivamente el motor Strata 0.2.15 (con `--pack`, `--native` y `--ple-gguf`); el autor indica que el modelo no se ha probado con llama.cpp. Requiere construir un pack nuevo desde el GGUF con `tools/iq_pack.py`.
- Latencia y throughput: no disponibles; el autor no los midio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Edicion | Licencia | Motor |
|---|---|---|---|---|---|
| rSalone/...-uncensored-L6-41-GGUF | ~177B | 262.144 | Abliteration capas 6-41, KL 0,0214 | qwen-community-1.0 | Strata 0.2.15 |
| rSalone/...-uncensored-q8g-GGUF | ~177B | no disponible | Abliteration capas 0-44, KL 0,0456 | qwen-community-1.0 | Strata 0.2.15 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | ~177B | no disponible | Sin edicion (base cuantizado IQ3_S) | qwen-community-1.0 | Strata 0.2.15 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de otros autores.

## Limitaciones y advertencias
- Modelo "uncensored"/abliterated: elimina deliberadamente los rechazos, por lo que puede generar contenido danino, ilegal o inseguro. No es apto para despliegues de produccion orientados al publico sin filtros externos.
- La edicion afecta a 36 capas (6-41) y reduce la divergencia respecto al original, pero sigue siendo una modificacion de pesos que puede degradar capacidades no evaluadas.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo, alucinacion o multilingue.
- Idiomas soportados no documentados; el comportamiento fuera del ingles y el japones es desconocido.
- Requiere el motor Strata 0.2.15 y un pack construido especificamente desde este GGUF; no es compatible con packs del modelo original ni se ha probado con llama.cpp.
- Entorno de ejecucion muy especifico (RTX 5090, 128 GB DDR5, Ubuntu 26.04.1, CUDA 13.0); no se garantiza el funcionamiento en otras configuraciones.
- Licencia qwen-community-1.0: es necesario revisar el fichero LICENSE para conocer las restricciones de uso comercial, que no se detallan en la informacion disponible.
- El autor no ha medido VRAM, memoria ni velocidad, por lo que no hay garantias de rendimiento en produccion.
- El repositorio tiene solo 3 likes y 5830 descargas; es un artefacto de investigacion con soporte limitado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-L6-41-GGUF
- Release anterior (q8g): https://huggingface.co/rSalone/Qwen3.8-Flash-Next-GSQ-RCO-uncensored-q8g-GGUF
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor de inferencia Strata: https://github.com/Niko1221/Strata
