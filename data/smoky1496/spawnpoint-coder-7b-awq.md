# smoky1496/SpawnPoint-Coder-7B-AWQ

## Resumen

SpawnPoint-Coder-7B-AWQ es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado por el usuario smoky1496, especializado en la generación de videojuegos para Godot 4. No es un modelo de propósito general: está afinado específicamente para producir el diseño de un juego como JSON estricto que la herramienta Spawn Point compila después en un proyecto Godot 4 jugable (escenas, componentes GDScript, niveles y sprites). Se distribuye en cuantización AWQ de 4 bits, de modo que cabe en una única GPU de 12 GB.

El modelo se basa en la arquitectura Qwen2 (tag `qwen2` en Hugging Face) y se publica bajo licencia Apache 2.0. Su pipeline de uso típico incluye tres operaciones: diseñar un juego a partir de una descripción en lenguaje natural (inglés o vietnamita), aplicar retoques precisos ("salta un 20% más alto, añade una espada") y editar entidades concretas ("duplica su salud y haz que lance bolas de fuego"). El autor ha publicado iteraciones v4, v5, v5.1, v5.2 y v6, con mejoras centradas en nuevos géneros (juegos de cartas estilo deckbuilder en v6) y en la lectura directa del vietnamita sin paso de traducción.

Su relevancia actual radica en la especialización vertical: en lugar de competir en benchmarks generales, resuelve una tarea concreta con un esquema JSON por género, lo que reduce la longitud de las respuestas y los errores entre géneros. La model card reporta evaluaciones sobre conjuntos sellados escritos antes del entrenamiento, con porcentajes de prompts completamente correctos que llegan al 94% en juegos de cartas y al 100% en plagas de granja mencionadas de pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (según tag `qwen2`); detalles de capas y atención no disponibles |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | AWQ de 4 bits (esta build); el autor menciona que el modelo base es de 7B, pero no detalla otras cuantizaciones publicadas |
| Idiomas soportados | inglés (en) y vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ 4-bit), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un fine-tune de un modelo Qwen2 de aproximadamente 7B parámetros, según el tag `qwen2` y el recuento real de safetensors. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información no está disponible. Lo que sí se documenta es el diseño del entrenamiento por tareas: el modelo aprende a emitir un esquema JSON pequeño y distinto por género (character, abilities, enemies, goal, art style, feel), lo que en v5 redujo la longitud del prompt a un tercio respecto a v4 y eliminó errores entre géneros, como un objetivo de rescate en un juego de granja.

La innovación técnica destacable no está en la arquitectura, sino en el contrato de salida: el modelo se entrena para responder con `response_format: {"type": "json_schema", ...}`, y el repositorio incluye en `model-kit/` los system prompts (`prompts.json`) y los esquemas `design.schema.json` y `tweak.schema.json`. La versión v6 añade diseño de juegos de cartas (héroe y clase, cartas propias con sus efectos, enemigos y jefe), v5.2 detecta plagas de granja mencionadas solo de pasada y v5.1 corrige prompts que nombran al jugador de forma indirecta. El vietnamita se lee directamente, sin paso separado de traducción.

## Capacidades

- Generación de texto especializada en diseño de videojuegos: convierte una descripción en inglés o vietnamita en un diseño JSON estricto.
- Diseño por género: plataformas, shooters de scroll lateral, tower defense, granjas, juegos de burbujas, rescate, supervivientes, cuerpo a cuerpo, cartoon y, desde v6, deckbuilders de cartas.
- Retoque de juegos existentes: aplica parches precisos sobre un diseño previo ("hazlo de noche y añade murciélagos").
- Edición de entidades: modifica componentes y parámetros concretos ("duplica su salud y haz que lance bolas de fuego").
- Salida estructurada: entrenado para `json_schema` como formato de respuesta, con esquemas incluidos en el repositorio.
- Multilingüe limitado a inglés y vietnamita, con lectura directa del vietnamita para preservar nombres propios ("chú vịt" se interpreta como Duck).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación automática de prototipos en Godot 4: el modelo produce el JSON de diseño y Spawn Point lo compila en un proyecto jugable con escenas, GDScript y sprites; es adecuado porque su salida está restringida al esquema que espera el compilador.
- Iteración rápida sobre un diseño existente: un equipo envía el diseño actual más una instrucción de cambio y recibe un parche preciso, lo que permite ajustar dificultad, añadir armas o cambiar la estética sin reescribir el juego.
- Creación de deckbuilders estilo Slay the Spire: con v6, el modelo define héroe y clase, cartas y sus efectos (golpes fuertes, barridos, veneno, escudos, curación), enemigos y jefe, lo que sirve para generar el contenido inicial de un juego de cartas.
- Diseño de shooters de scroll lateral: genera naves, enemigos con patrones de vuelo (en línea, en oleadas, en picado, que se detienen a disparar), power-ups y jefe, útil para producir niveles de acción de forma repetible.
- Localización y autoría en vietnamita: estudios que redactan briefs en vietnamita pueden usarlo sin traducir previamente, ya que el modelo lee el idioma directamente y conserva los nombres propios.
- Docencia y talleres de diseño de juegos: permite a estudiantes describir una idea en lenguaje natural y obtener un diseño estructurado y editable, con esquemas explícitos que enseñan la anatomía de un juego.
- Integración en pipelines propios sin Spawn Point: la carpeta `model-kit/` permite llamar al modelo desde Python con la biblioteca estándar y el endpoint compatible con OpenAI de vLLM.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones propias del autor sobre prompts escritos a mano en inglés y vietnamita, ejecutados por el pipeline completo con el mismo servidor y muestreo. Los conjuntos sellados se redactaron antes del entrenamiento. La métrica es el porcentaje de prompts completamente correctos.

| Benchmark (prompts completamente correctos) | v4 | v5.2 | v6 (esta release) |
|---|---|---|---|
| Conjunto sellado: juegos de cartas (16 prompts) | - | 56% | 94% |
| Conjunto sellado: plagas de granja mencionadas de pasada (16 prompts) | - | 100% | 100% |
| Conjunto sellado: shooters y correcciones de v4 (16 prompts) | 56% | 88% | 88% |
| Conjunto de desarrollo: shooters y correcciones de v4 (24 prompts) | 54% | 79% | 88% |
| Conjunto sellado: granjas, tower defense, cartoon (12 prompts) | 67% | 92% | 83% |
| 16 prompts: granjas, tower defense, cuerpo a cuerpo, cartoon | 75% | 81% | 94% |
| Conjunto sellado: los nueve primeros géneros (12 prompts) | 67% | 75% | 83% |
| 30 prompts escritos por humanos | 87% | 87% | 90% |
| 12 prompts: burbujas, rescate, supervivientes | 92% | 92% | 75% |

Ejemplos sintéticos retenidos con una única respuesta exacta (solo formato v5): briefs 70%, retoques 98%, ediciones de entidad 96%.

Medición de los ficheros AWQ de 4 bits descargados, con el mismo método:

| Benchmark (prompts completamente correctos) | Build AWQ |
|---|---|
| Conjunto sellado: juegos de cartas (16 prompts) | 94% |
| 30 prompts escritos por humanos | 87% |
| Conjunto sellado: plagas de granja mencionadas de pasada (16 prompts) | 100% |
| Conjunto sellado: shooters y correcciones de v4 (16 prompts) | 81% |

El autor advierte que los resultados varían entre uno y tres prompts por conjunto de una ejecución a otra, por lo que diferencias de uno o dos prompts deben leerse como ruido. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que la build AWQ de 4 bits "cabe en una única GPU de 12 GB".
- GPU recomendadas: el ejemplo oficial usa `docker run --gpus all` con la imagen `vllm/vllm-openai:v0.10.2`; no se especifican modelos concretos de GPU.
- GPU de consumo: sí, según el propio autor, en tarjetas de 12 GB (no se detalla la lista exacta de modelos).
- Opciones de despliegue: vLLM con endpoint compatible con OpenAI (`--served-model-name SpawnPoint-Coder-7B --max-model-len 16384 --gpu-memory-utilization 0.85`), transformers (librería declarada) y text-generation-inference (tag `text-generation-inference`). No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos de la misma categoría en la información proporcionada. SpawnPoint-Coder-7B-AWQ es un fine-tune vertical para generación de juegos Godot 4; no se han documentado alternativas comparables en parámetros, contexto, rendimiento, licencia y disponibilidad dentro de los datos disponibles. Por tanto, la comparativa se declara no disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para emitir el JSON de Spawn Point; fuera de esa tarea su comportamiento no está evaluado ni documentado.
- Idiomas limitados a inglés y vietnamita; no se garantiza un funcionamiento correcto en castellano ni en otras lenguas.
- Dependencia de versión: los formatos v5 y posteriores requieren Spawn Point 0.4 o superior para juegos de cartas y 0.3 o superior para el resto; las versiones antiguas esperan el formato v4 y deben usar la release `v4-release` del repositorio.
- Regresiones conocidas en v6: el conjunto de 12 prompts de burbujas, rescate y supervivientes baja al 75% (dos prompts, ambos con dos nombres en un shooter de burbujas) y el conjunto sellado de granjas y tower defense baja al 83% (un prompt); los briefs sintéticos exactos quedan en 70% frente al 77% de v5.2.
- Variabilidad entre ejecuciones de uno a tres prompts por conjunto, lo que limita la interpretación de diferencias pequeñas.
- Riesgo de alucinación no cuantificado: la model card no publica tasas de error fuera de los conjuntos evaluados.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; el autor no impone restricciones adicionales en la model card.
- El repositorio ocupa 36,9 GB, un tamaño considerable para una build de 4 bits de un modelo de 7B, lo que conviene tener en cuenta al planificar el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ
- Repositorio de Spawn Point: https://github.com/leluong141996-dev/Spawn-Point
- Discusiones del proyecto en GitHub: https://github.com/leluong141996-dev/Spawn-Point/discussions/13
- Discusiones del modelo en Hugging Face: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ/discussions
- Imagen de vLLM usada en el ejemplo: `vllm/vllm-openai:v0.10.2`
