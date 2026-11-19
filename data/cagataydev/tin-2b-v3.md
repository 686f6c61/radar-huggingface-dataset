# cagataydev/tin-2b-v3

## Resumen

Tin 2B v3 es un modelo de lenguaje de 2.213 millones de parametros desarrollado por Çağatay Çalı (cagataydev), afinado a partir de `cagataydev/loopl-2b`, que a su vez deriva de la arquitectura Qwen3.5-2B. Su proposito es especializarse en Tin, un lenguaje de programacion tipado en el que los agentes y las herramientas forman parte de la propia sintaxis. El modelo escribe programas en Tin, corrige errores a partir de la salida del compilador y ejecuta bucles de verificacion y correccion apoyados en las herramientas `tin_check` y `tin_run`.

El modelo se distribuye en formato bf16 para transformers y ajuste fino posterior, con una variante cuantizada a 4 bits (`tin-2b-v3-4bit`) orientada a telefono movil y Mac mediante mlx-lm. La model card lo posiciona explicitamente como un modelo pequeno para ejecucion en dispositivo (on-device) y para flujos de agente con tool calling. Su relevancia actual radica en que combina un tamano reducido con un entrenamiento muy focalizado en un dominio de programacion concreto, lo que permite ejecutarlo localmente sin infraestructura de GPU dedicada.

La licencia es Apache-2.0, heredada del modelo base Qwen3.5, y el modelo declara soporte para ingles y turco. La ficha no incluye informacion sobre la longitud de contexto, los datos exactos de entrenamiento ni la composicion del dataset, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B mediante el modelo base `cagataydev/loopl-2b`) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repositorio); variante 4-bit publicada como `cagataydev/tin-2b-v3-4bit` |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer de 2.213 millones de parametros obtenido por ajuste fino supervisado (SFT, segun la etiqueta `sft`) sobre `cagataydev/loopl-2b`, que a su vez es una adaptacion de Qwen3.5-2B. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La etiqueta `image-text-to-text` del pipeline sugiere que la arquitectura base conserva la capacidad multimodal de Qwen3.5, aunque la model card no describe el entrenamiento de vision ni su uso en el contexto de Tin.

La innovacion tecnica destacable no reside en la arquitectura, sino en el entrenamiento orientado a un lenguaje concreto: el modelo aprende a generar programas Tin validos, a interpretar los errores del compilador real y a iterar en un bucle de verificacion y correccion usando las herramientas `tin_check` y `tin_run`. La model card indica que el ajuste se realizo sobre el commit de entrenamiento del lenguaje, de modo que funciones de la biblioteca estandar posteriores a esa fecha pueden faltar.

## Capacidades

- Generacion de programas en Tin, el lenguaje tipado con agentes y herramientas en la sintaxis.
- Correccion de programas a partir de los errores emitidos por el compilador de Tin.
- Bucle de agente nativo con las herramientas `tin_check` y `tin_run` para verificar y ejecutar codigo de forma iterativa.
- Tool calling y function calling en el contexto del ecosistema Tin.
- Razonamiento multi-paso orientado a la depuracion de errores encadenados (la model card reporta una puntuacion de 90,2 en "Fixes stacked bugs" frente a 24,4 del Qwen3.5 2B base).
- Soporte multilingue limitado a ingles y turco.
- Capacidad multimodal heredada del pipeline `image-text-to-text` de la arquitectura base (no documentada en la model card para tareas de Tin).
- Ejecucion en dispositivo: existe una variante 4-bit para telefono movil y Mac.

## Casos de uso

- Generacion de codigo Tin en produccion: el modelo escribe programas que compilan y producen la salida esperada en el primer intento en el 54,1 % de los casos sobre un conjunto reservado, y puede integrarse en un pipeline que invoque `tin_check` para validar antes de desplegar.
- Depuracion automatica de programas Tin: con una tasa de correccion del 92,5 % sobre errores reportados por el compilador, encaja en un bucle de CI que reciba la salida de error y proponga un parche.
- Agentes locales en dispositivo movil: la variante 4-bit (`tin-2b-v3-4bit`) permite ejecutar el modelo con mlx-lm en telefonos y Mac, sin depender de la nube, para tareas de generacion y verificacion de codigo Tin.
- Asistentes de desarrollo integrados en el editor: el modelo puede recibir el codigo y el mensaje de error del compilador y devolver una correccion, reduciendo el ciclo de edicion manual.
- Formacion y documentacion del lenguaje Tin: el modelo responde sobre Tin con una puntuacion de conocimiento de 63,1 frente a 22,7 del base, por lo que sirve como asistente de consulta para desarrolladores que aprenden el lenguaje.
- Automatizacion de tareas con herramientas tipadas: al tener agentes y herramientas en la sintaxis del lenguaje, el modelo puede generar flujos de agente que invocan funciones con contratos de tipo verificables por el compilador.
- Prototipado rapido de scripts Tin: para usuarios que necesitan un primer borrador de programa que luego se valida con `tin check`, el modelo reduce el tiempo de escritura inicial.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto reservado, evaluados con el compilador real de Tin (porcentaje de aprobados):

| Sonda | Tin 2B | Qwen3.5 2B |
|---|---:|---:|
| Dice que es Tin | 93,8 | 56,2 |
| Conocimiento de Tin | 63,1 | 22,7 |
| Escribe Tin | 54,1 | 5 |
| Corrige Tin | 92,5 | 63,6 |
| Corrige errores encadenados | 90,2 | 24,4 |
| Bucle de agente nativo | 55 | 6,2 |

La model card define "Escribe Tin" como que el programa compila y produce exactamente la salida esperada en el primer intento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Comparativa entre tamanos del mismo modelo (porcentaje de aprobados):

| Tamano | Escribe Tin | Corrige Tin | Bucle de agente | Build para telefono |
|---|---:|---:|---:|---|
| 0.8B | 37,5 | 88,8 | 32,5 | tin-0.8b-4bit |
| 2B | 54,1 | 92,5 | 55 | tin-2b-v3-4bit |
| 4B | 68,3 | 97,2 | 65 | tin-4b-4bit |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB solo para los pesos (2.213 millones de parametros a 2 bytes por parametro), mas el overhead de activaciones y cache KV.
- VRAM estimada en 4 bits: aproximadamente 1,1 GB para los pesos, adecuada para dispositivos con memoria unificada limitada.
- GPU recomendadas: el modelo cabe en tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y en GPUs de datacenter como A100 o H100, aunque estas ultimas estan sobredimensionadas para un modelo de 2B.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas en bf16, y en configuraciones de 4 GB o menos con cuantizacion 4-bit.
- Opciones de despliegue: transformers (este repositorio), mlx-lm para la variante 4-bit en Mac y dispositivos Apple, y el CLI propio `tin model pull tin:2b`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Escribe Tin | Corrige Tin | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Tin 2B v3 | 2.213 M | no disponible | 54,1 | 92,5 | Apache-2.0 | Hugging Face (bf16 y 4-bit) |
| Qwen3.5 2B (base) | ~2B | no disponible | 5 | 63,6 | Apache-2.0 | Hugging Face |
| Tin 4B | no disponible | no disponible | 68,3 | 97,2 | Apache-2.0 | Hugging Face (4-bit) |
| Tin 0.8B | no disponible | no disponible | 37,5 | 88,8 | Apache-2.0 | Hugging Face (4-bit) |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de datos de benchmarks de otros modelos de 2B especializados en lenguajes de programacion en la informacion proporcionada.

## Limitaciones y advertencias

- Alrededor del 46 % de los primeros intentos fallan `tin check` o imprimen una salida incorrecta, por lo que es obligatorio ejecutar el compilador antes de usar el codigo generado.
- El conocimiento de Tin corresponde al commit de entrenamiento; las funciones de la biblioteca estandar posteriores pueden no estar cubiertas.
- Modelo pequeno: los detalles como nombres de flags y codigos de error suelen ser incorrectos, segun la propia model card.
- Soporte de idiomas limitado a ingles y turco; no se declara castellano.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion fuera del dominio de Tin.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5 y conviene revisar las condiciones de este ultimo.
- La longitud de contexto no esta publicada, lo que dificulta planificar su uso en conversaciones largas o repositorios extensos.
- La capacidad multimodal implicita en el pipeline `image-text-to-text` no esta descrita ni evaluada en la model card, por lo que no debe asumirse su fiabilidad.
- El modelo tiene muy poca traccion (4 descargas, 0 likes en el momento de la consulta), lo que limita la validacion independiente de sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cagataydev/tin-2b-v3
- Variante 4-bit: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Modelo base: https://huggingface.co/cagataydev/loopl-2b
- Variante 0.8B 4-bit: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Variante 4B 4-bit: https://huggingface.co/cagataydev/tin-4b-4bit
- Sitio del lenguaje Tin: https://tin.ad
- Instalador de Tin: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
