# smoky1496/SpawnPoint-Coder-7B-GGUF

## Resumen

SpawnPoint-Coder-7B-GGUF es una distribucion en formato GGUF del modelo SpawnPoint-Coder-7B, un ajuste fino de 7.615.616.512 parametros desarrollado por smoky1496 y especializado en la generacion de disenos de videojuegos 2D en JSON estricto que la herramienta Spawn Point compila a proyectos jugables de Godot 4. El modelo no pretende ser un asistente general: esta afinado para emitir estructuras JSON que cumplen un esquema fijo (`design.schema.json` y `tweak.schema.json`) y que describen genero, heroe, enemigos, niveles y mecanicas de juego.

El repositorio contiene exclusivamente builds GGUF (Q4_K_M de aproximadamente 4,7 GB y Q8_0 de aproximadamente 8,1 GB) pensados para Ollama, llama.cpp y LM Studio, de modo que el modelo puede ejecutarse en Mac, GPU AMD o CPU sin NVIDIA. La version documentada es la v6, que anade diseno de juegos de cartas tipo deckbuilder, y llega tras las iteraciones v5, v5.1 y v5.2, centradas en shooters de scroll lateral y en la deteccion de entidades mencionadas de pasada en la descripcion del usuario.

Su relevancia actual es acotada pero concreta: demuestra un patron de uso de modelos pequenos como generadores de DSL estructurado para herramientas de autoria, con validacion por JSON schema y soporte directo de ingles y vietnamita. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no especificado; ajuste fino de un transformer de 7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~4,7 GB) y Q8_0 (~8,1 GB) en este repo; el modelo original se distribuye tambien en AWQ |
| Idiomas soportados | en, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo actual); safetensors y AWQ en el repo del modelo original |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el modelo base, el volumen de tokens de entrenamiento ni la composicion del dataset. El autor solo documenta el comportamiento resultante: el modelo fue entrenado para responder con JSON conforme a un esquema, incluyendo el envio del schema como `response_format: {"type": "json_schema", ...}`, lo que sugiere un ajuste fino supervisado sobre pares entrada-salida estructurados y posiblemente entrenamiento con salidas validas por esquema.

La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de interfaz: el modelo emite un diseno de juego completo (genero, heroe y clase, cartas propias, enemigos y patron de combate, jefe) o una modificacion incremental sobre un diseno existente (`tweak.schema.json`). Las versiones v5.1 y v5.2 incorporan deteccion de entidades nombradas de forma incidental en la descripcion del usuario (heroes y plagas de granja respectivamente), y la v5 anade lectura directa de vietnamita con un formato reducido por genero. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO.

## Capacidades

- Generacion de disenos de juego 2D en JSON estricto conforme a un esquema predefinido.
- Modificacion incremental de un diseno existente mediante instrucciones en lenguaje natural (cambio de iluminacion, adicion de enemigos, etc.).
- Cobertura de generos: plataformas, arenas top-down y survivors, bubble shooters, granjas, tower defense, shooters de scroll lateral y juegos de cartas tipo deckbuilder.
- Deteccion de entidades mencionadas de pasada en la descripcion del usuario (heroes, plagas, elementos secundarios).
- Soporte bilingue directo: ingles y vietnamita.
- Salida compatible con `response_format` de tipo JSON schema en la API compatible con OpenAI de Ollama.
- No se documenta soporte de tool calling generico, uso como agente multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado rapido de juegos 2D en Godot 4: el usuario describe el juego en una frase y el modelo emite el JSON de diseno que Spawn Point compila a un proyecto jugable, reduciendo el tiempo desde idea a prototipo ejecutable.
- Generacion de contenido asistida en estudios pequenos: el modelo produce disenos coherentes con la biblioteca de componentes de Spawn Point, lo que permite iterar sobre variantes de un mismo genero sin escribir codigo.
- Modificacion incremental de disenos existentes: con `tweak.schema.json`, el modelo aplica cambios acotados sobre un `design.json` previo, util para ajustes de balance o ambientacion en ciclos cortos.
- Herramienta educativa de diseno de juegos: estudiantes describen mecanicas y obtienen una especificacion estructurada que pueden revisar y editar, con la ventaja de que la salida es validable por esquema.
- Generacion de contenido en vietnamita: equipos que trabajan en ese idioma pueden describir el juego directamente sin traduccion intermedia, gracias al entrenamiento bilingue.
- Automatizacion de pipelines de assets de juego: al ser JSON estricto, la salida puede consumirse por scripts de CI para validar disenos, generar variantes o alimentar herramientas de autoria.
- Ejecucion en hardware sin GPU: las builds GGUF permiten desplegar el modelo en portatiles, Macs con Apple Silicon o servidores CPU, adecuado para talleres y demos presenciales.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son evaluaciones internas sobre prompts de juego, no benchmarks academicos estandar:

| Evaluacion | Build | Resultado |
|---|---|---|
| 30 ideas de juego escritas por humanos (ingles y vietnamita) | Q4_K_M via Ollama | 83% completamente correctas |
| 16 prompts sellados de juegos de cartas | Q4_K_M via Ollama | 88% correctos |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para Q4_K_M y 9-10 GB para Q8_0, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 4090); 12 GB o mas para Q8_0. No requiere NVIDIA: funciona en GPU AMD y Apple Silicon via Metal.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para la cuantizacion Q4_K_M.
- Despliegue: Ollama (`ollama run hf.co/smoky1496/SpawnPoint-Coder-7B-GGUF:Q4_K_M`), llama.cpp, LM Studio y la CLI `spawnpoint` de Spawn Point Studio, que usa la API compatible con OpenAI de Ollama.
- Latencia: en CPU el autor advierte de "decenas de segundos por diseno"; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| SpawnPoint-Coder-7B | 7,6 B | no disponible | Diseno de juegos 2D en JSON para Godot 4 | Apache 2.0 | GGUF, AWQ, safetensors |
| Modelos generales de 7B (p. ej. Qwen2.5-Coder-7B, Llama-3.1-8B) | 7-8 B | 32K-128K segun modelo | Codigo y proposito general | Apache 2.0 / licencia comunitaria | GGUF, safetensors |
| Modelos de generacion de codigo de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos entre SpawnPoint-Coder-7B y alternativas generales de 7B; el autor indica explicitamente que en generos fuera de su biblioteca de componentes y en codigo libre el modelo "no es mejor que un 7B general".

## Limitaciones y advertencias

- El modelo esta afinado exclusivamente para los generos 2D que construye Spawn Point; fuera de ellos y en codigo libre su rendimiento equivale al de un 7B generico.
- Requiere Spawn Point 0.4 o posterior para juegos de cartas y 0.3 para el resto de generos; versiones anteriores no interpretan correctamente la salida.
- La calidad depende de enviar el JSON schema como `response_format`; sin el, la conformidad de la salida no esta garantizada.
- En CPU la latencia es de decenas de segundos por diseno, lo que limita su uso interactivo.
- Solo se documentan ingles y vietnamita; no hay evidencia de calidad en castellano.
- Riesgo de alucinacion en entidades y mecanicas no presentes en la descripcion del usuario, mitigado parcialmente por la validacion por esquema pero no eliminado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el aviso NOTICE debe conservarse; conviene revisar las condiciones del modelo base, que no se identifica en la informacion disponible.
- El modelo tiene un volumen de adopcion bajo (565 descargas, 2 likes) y el proyecto fue pausado y reanudado, lo que implica riesgo de mantenimiento a medio plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-GGUF
- Modelo original (AWQ): https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ
- Repositorio GitHub de Spawn Point: https://github.com/leluong141996-dev/Spawn-Point
- Discusiones del proyecto: https://github.com/leluong141996-dev/Spawn-Point/discussions/13
- Documentacion del model-kit: https://github.com/leluong141996-dev/Spawn-Point/blob/main/model-kit/README.md
- Discusiones del repositorio en Hugging Face: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-GGUF/discussions
