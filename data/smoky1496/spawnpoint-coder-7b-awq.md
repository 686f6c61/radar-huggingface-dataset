# smoky1496/SpawnPoint-Coder-7B-AWQ

## Resumen

SpawnPoint-Coder-7B-AWQ es la versión cuantizada en 4 bits (AWQ) de SpawnPoint-Coder-7B, un modelo de 7.615.616.512 parámetros desarrollado por smoky1496 y publicado bajo licencia Apache-2.0. No es un modelo de propósito general: está afinado para una única tarea dentro del proyecto de código abierto Spawn Point (repositorio de leluong141996-dev), un "estudio de videojuegos autónomo" que convierte una descripción en lenguaje natural en un proyecto Godot 4 jugable. El modelo no escribe GDScript directamente, sino que produce JSON estricto: el brief de diseño del juego, parches de ajuste ("salta un 20% más alto, añade una espada") y ediciones de una entidad concreta ("duplica su vida y haz que lance bolas de fuego"). Es el compilador de Spawn Point quien traduce ese JSON a escenas, componentes y GDScript a partir de su biblioteca de componentes ya probada.

La relevancia es acotada pero muy concreta: cubre la franja de modelos pequeños (7B) especializados en una tarea estructurada y desplegables en hardware de consumo. La versión AWQ está pensada para ejecutarse en una sola GPU de 12 GB, y existe un repositorio GGUF hermano para Ollama, llama.cpp y LM Studio. La arquitectura se apoya en la familia Qwen2 (etiqueta `qwen2` en el Hub) y el contexto declarado es de hasta 32K tokens según llm-explorer, aunque el ejemplo oficial de despliegue con vLLM fija `--max-model-len 16384`, suficiente para el formato JSON que maneja.

Conviene señalar su estado: el autor indica que el proyecto Spawn Point está terminado y ya no se desarrolla activamente, aunque el modelo y la herramienta siguen disponibles. La versión v6, la que corresponde a este repo, añade diseño de juegos de cartas tipo deckbuilder, lectura directa de vietnamita sin paso de traducción y un esquema JSON reducido por género. El modelo solo se ha evaluado con prompts escritos a mano dentro del pipeline de Spawn Point, no con benchmarks estándar de código o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según etiqueta `qwen2` del Hub) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según llm-explorer; el ejemplo de despliegue con vLLM usa `--max-model-len 16384` |
| Tipos de cuantizacion | AWQ de 4 bits en este repositorio; existen builds GGUF en el repositorio hermano `SpawnPoint-Coder-7B-GGUF` |
| Idiomas soportados | Inglés y vietnamita (`en`, `vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AWQ 4-bit); GGUF en repositorio separado |

Datos adicionales de publicación: 360 descargas y 2 likes en el momento de la consulta, creado el 2026-10-09, actualizado el 2026-10-24, tamaño del repositorio 36,9 GB. Librería declarada: transformers. Compatible con text-generation-inference y con endpoints compatibles con la API de OpenAI.

## Arquitectura y entrenamiento

El modelo parte de una base de la familia Qwen2 de 7,6B parámetros, con arquitectura transformer decoder-only, y se afina para generar exclusivamente los formatos JSON de Spawn Point. El autor no publica en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Lo que sí se documenta es la evolución del ajuste fino por versiones: la v6 introduce un esquema pequeño por género (plataformas con misiones de rescate y combate con espada, arenas top-down y survivors, bubble shooters, juegos de granja, tower defense, shooters de scroll lateral y juegos de cartas), lo que reduce la longitud de prompts y respuestas a un tercio respecto a la v4 y elimina errores cruzados entre géneros.

El detalle técnico más relevante es de diseño de sistema, no de la red: el modelo no genera código de juego. Escribe JSON (brief, tweak o edición de entidad) y el compilador de Spawn Point, con su biblioteca de componentes GDScript ya probada, produce el proyecto Godot 4 ejecutable en escritorio o navegador. La versión v5.1 corrige la atribución del héroe cuando el prompt lo nombra de forma indirecta ("un tanque que dispara a monstruos" pasa a tener el tanque como héroe); la v5.2 detecta plagas de granja mencionadas de pasada ("una granja de invierno, con un zorro") y conserva el nombre del granjero si se especifica. La lectura directa del vietnamita sustituye a un paso de traducción previo, de modo que nombres como "chú vịt" se resuelven correctamente como pato. Requiere Spawn Point 0.4 o superior para juegos de cartas y 0.3 o superior para el resto de géneros; las versiones antiguas de la herramienta esperan el formato v4, disponible en el release `v4-release`.

## Capacidades

- Generación de briefs de diseño de juego en JSON estricto a partir de una descripción en inglés o vietnamita, con un esquema distinto por género.
- Aplicación de ajustes ("tweak") sobre un diseño existente: modificar salto, añadir arma, cambiar estilo artístico a cartoon, etc.
- Edición de una entidad concreta: cambiar componentes y parámetros, por ejemplo duplicar vida y añadir un ataque de proyectiles.
- Diseño de juegos de cartas tipo deckbuilder (estilo Slay the Spire): elección de héroe y clase (guerrero, mago, pícaro), cartas propias y sus efectos (golpes fuertes, barridos, veneno, escudos, curación), enemigos con su comportamiento (brutos, guardias, lanzadores, enjambres) y jefe final.
- Diseño de shooters de scroll lateral con patrones de enemigos (vuelo recto, oleadas, picados, hostigamiento con disparo), power-ups y jefe.
- Detección de elementos secundarios mencionados de forma indirecta: plagas de granja, nombres de granjero, identificación del héroe cuando se nombra por su vehículo o especie.
- Bilingüe inglés-vietnamita en la propia inferencia, sin traducción intermedia.
- No soporta tool calling ni function calling de forma nativa según la información disponible; su interfaz es la generación de JSON dentro del pipeline.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Fuera del pipeline de Spawn Point funciona como un modelo coder de 7B genérico, sin ventaja demostrada.

## Casos de uso

- Prototipado rápido de juegos 2D en Godot 4: el modelo convierte una idea en el JSON de diseño que Spawn Point compila en escenas y GDScript; con una GPU de 12 GB se obtiene un prototipo jugable sin escribir código.
- Iteración de diseño asistida: aplicar tweaks sucesivos sobre un brief existente ("salta un 20% más alto", "hazlo cartoon") permite explorar variantes de un juego sin rehacer el diseño desde cero, gracias a que el modelo devuelve parches precisos y no documentos completos.
- Balanceo de entidades: editar un enemigo o un ítem concreto ("duplica su vida y haz que lance bolas de fuego") encaja en flujos de ajuste de dificultad donde solo cambian parámetros y componentes de una entidad.
- Generación de contenido para game jams: la ventana de contexto configurada (16K en el ejemplo oficial, hasta 32K según la ficha del Hub) permite mantener el brief completo y el histórico de tweaks dentro de una misma sesión de 48 horas.
- Localización de briefs para el mercado vietnamita: al leer vietnamita directamente, un estudio puede redactar la idea original en ese idioma y obtener nombres y entidades coherentes sin pasar por un traductor externo, lo que reduce errores en nombres propios.
- Integración en un backend de estudio autónomo: el modelo se sirve con vLLM en modo servidor compatible con la API de OpenAI (`http://localhost:8000/v1`) y Spawn Point lo descubre automáticamente, lo que permite encadenar generación, compilación y prueba en un pipeline automatizado.
- Docencia de diseño de juegos: usar el JSON generado como material de lectura, ya que el esquema por género hace explícitos los elementos mínimos de un diseño (héroe, habilidades, enemigos, objetivo, estilo artístico y sensación).
- Regresión de compiladores de juego: al ser determinista en formato, sirve como generador de casos de entrada para probar el compilador de Spawn Point frente a briefs sintéticos (el autor reporta 98% en tweaks y 96% en ediciones de entidad sobre conjuntos sintéticos retenidos).

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor evalúa con prompts escritos a mano en inglés y vietnamita a través del pipeline completo, con el mismo servidor y muestreo para todas las versiones, y con conjuntos "sellados" redactados antes del entrenamiento y no revisados hasta la decisión de release. Las métricas indican el porcentaje de prompts totalmente correctos.

| Benchmark (prompts totalmente correctos) | v4 | v5.2 | v6 (esta release) |
|---|---|---|---|
| Conjunto sellado: juegos de cartas (16 prompts) | - | 56% | 94% |
| Conjunto sellado: plagas de granja mencionadas de pasada (16 prompts) | - | 100% | 100% |
| Conjunto sellado: shooters y correcciones de v4 (16 prompts) | 56% | 88% | 88% |
| Conjunto de desarrollo: shooters y correcciones de v4 (24 prompts) | 54% | 79% | 88% |
| Conjunto sellado: granjas, tower defense, cartoon (12 prompts) | 67% | 92% | 83% |
| 16 prompts: granjas, tower defense, melé, cartoon | 75% | 81% | 94% |
| Conjunto sellado: los nueve primeros géneros (12 prompts) | 67% | 75% | 83% |
| 30 prompts escritos por humanos | 87% | 87% | 90% |
| 12 prompts: bubble, rescate, survivor | 92% | 92% | 75% |

Ejemplos sintéticos retenidos con una única respuesta exacta (solo formato v5): briefs 70%, tweaks 98%, ediciones de entidad 96%.

| Benchmark (prompts totalmente correctos) | Build AWQ (este repo) |
|---|---|
| Conjunto sellado: juegos de cartas (16 prompts) | 94% |
| 30 prompts escritos por humanos | 87% |
| Conjunto sellado: plagas de granja mencionadas de pasada (16 prompts) | 100% |
| Conjunto sellado: shooters y correcciones de v4 (16 prompts) | 81% |

El propio autor advierte que los resultados varían entre uno y tres prompts por conjunto entre ejecuciones, por lo que diferencias de uno o dos prompts deben leerse como ruido. No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 5,6 GB para los pesos AWQ de 4 bits según llm-explorer; el autor indica que el modelo corre en una sola GPU de 12 GB, con `--gpu-memory-utilization 0.85` y `--max-model-len 16384` en el ejemplo de vLLM. El espacio adicional para KV cache depende de la longitud de contexto efectiva.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 para uso local; L4, A10G, A100 o H100 para servir varias sesiones concurrentes con vLLM.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más. Por debajo de 12 GB no hay dato publicado; con los pesos en torno a 5,6 GB, una GPU de 8 GB requeriría reducir mucho la ventana de contexto y no está validado por el autor.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:v0.10.2` documentada en la model card), text-generation-inference (etiqueta `text-generation-inference`), y llama.cpp, Ollama o LM Studio mediante el repositorio GGUF hermano para Mac, GPU AMD o CPU.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni cifras de concurrencia.

## Comparativa con modelos similares

No hay una comparativa directa publicada. La categoría natural es la de modelos coder de ~7B, pero este modelo solo supera a un coder general dentro del pipeline de Spawn Point; el propio autor advierte que en géneros no cubiertos o en código Godot libre el resultado no será mejor que el de un coder de 7B genérico.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SpawnPoint-Coder-7B-AWQ | ~7,6B | 32.768 (16.384 en el ejemplo de despliegue) | Apache-2.0 | JSON de diseño de juegos para Spawn Point, en/vit | HuggingFace, AWQ y GGUF |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 nativo (ampliable con YaRN) | Apache-2.0 | Código generalista, tool calling | HuggingFace, múltiples cuantizaciones |
| CodeLlama-7B-Instruct | ~6,7B | 16.384 | Licencia comunitaria Llama 2 | Código generalista | HuggingFace, GGUF, Ollama |
| Qwen2-7B-Instruct (base probable de la familia) | ~7,6B | 32.768 | Apache-2.0 | Propósito general, multilingüe | HuggingFace |

Los datos de rendimiento de los modelos comparados no se han incluido porque no forman parte de la información proporcionada y no son directamente equiparables: las métricas de SpawnPoint-Coder son de corrección de formato JSON en su pipeline, no de benchmarks de código.

## Limitaciones y advertencias

- Cobertura de géneros restringida: solo los tipos de juego 2D que construye Spawn Point (plataformas, arenas top-down y survivors, bubble shooters, granjas, tower defense, shooters de scroll lateral y juegos de cartas). En 3D, sistemas de RPG, carreras o programación libre de Godot el rendimiento esperado es el de un coder de 7B general, es decir, notablemente inferior.
- Ambigüedad de género: un prompt que no declare el género puede interpretarse de dos formas ("un space shooter" puede salir como shooter lateral; "a farm game" como juego de granja).
- El modelo no escribe GDScript. Genera los formatos JSON de Spawn Point; el código procede de la biblioteca de componentes probada de la herramienta. Usarlo como generador de código Godot directo no es su caso de uso y no está validado.
- Acoplamiento a versión: v5 y posteriores emiten el formato por género; versiones antiguas de Spawn Point esperan el formato v4 (`v4-release`). Usar la combinación incorrecta produce fallos de parseo o de compilación.
- Idiomas limitados a inglés y vietnamita. No hay soporte declarado de castellano; los prompts en otros idiomas no están evaluados.
- Riesgo de alucinación en los campos libres del JSON (nombres de entidades, descripciones de habilidades) y en prompts fuera de distribución; el autor documenta regresiones concretas en v6 respecto a v5.2 en los conjuntos de bubble/rescate/survivor y en briefs sintéticos exactos.
- Volatilidad de resultados: variación de uno a tres prompts por conjunto entre ejecuciones, según el propio autor.
- Sesgos conocidos: no documentados en la información disponible. No hay evaluación de sesgo ni de seguridad publicada.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones de campos de uso adicionales declaradas. Verificar el aviso de licencia del repositorio antes de redistribuir.
- Estado del proyecto: el autor declara Spawn Point terminado y sin desarrollo activo. No cabe esperar correcciones de bugs ni nuevas versiones salvo que se abran discusiones con peticiones reales.
- El repositorio ocupa 36,9 GB, muy por encima de los ~4-5 GB esperables en pesos de 4 bits; conviene revisar qué artefactos adicionales contiene antes de descargarlo en su totalidad.

## Enlaces

- Modelo AWQ en HuggingFace: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ
- Builds GGUF (Ollama, llama.cpp, LM Studio): https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-GGUF
- Discusiones del modelo: https://huggingface.co/smoky1496/SpawnPoint-Coder-7B-AWQ/discussions
- Repositorio del proyecto Spawn Point: https://github.com/leluong141996-dev/Spawn-Point/tree/main
- Retrospectiva del autor (qué se construyó y por qué se detuvo): https://github.com/leluong141996-dev/Spawn-Point/blob/main/docs/retrospective.md
- Ficha en llm-explorer: https://llm-explorer.com/model/smoky1496%2FSpawnPoint-Coder-7B-AWQ,6i4ywPcD8MvejIkNBV7qdM
- Registro en free2aitools: https://free2aitools.com/model/smoky1496/spawnpoint-coder-7b-awq
