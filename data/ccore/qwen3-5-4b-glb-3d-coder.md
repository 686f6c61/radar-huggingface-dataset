# ccore/Qwen3.5-4B-GLB-3D-Coder

## Resumen

Qwen3.5-4B-GLB-3D-Coder es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el autor independiente CCORE. Su proposito es generar escenas y activos 3D mediante codigo: a partir de una descripcion en lenguaje natural, el modelo produce un archivo HTML autonomo que construye el objeto o escena con Three.js e incluye un boton para exportar el resultado como archivo GLB, importable en editores como Godot. No es un lanzamiento oficial de Qwen.

El modelo tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0. Esta publicado como checkpoint de vista previa temprana (early preview): el entrenamiento seguia en curso en el momento de la publicacion y el autor preve liberar los pesos completos en Safetensors y el dataset de entrenamiento al finalizar. Actualmente el repositorio ofrece unicamente cuantizaciones GGUF (Q8_0 y Q4_K_M).

Su relevancia radica en que aborda una tarea muy concreta —texto a 3D via codigo Three.js con exportacion GLB— con un modelo pequeno que puede ejecutarse en hardware modesto, y en que esta pensado explicitamente para el flujo de trabajo de desarrolladores de videojuegos que usan Godot. El autor indica que la mayoria de generaciones funcionan al primer intento, especialmente con prompts en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles especificos no disponibles |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF); pesos Safetensors completos anunciados para mas adelante |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, Q4_K_M); Safetensors anunciado para la version final |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parametros. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas) ni la composicion del dataset de entrenamiento. El ajuste esta orientado a una tarea especifica: la generacion de codigo HTML/JavaScript con Three.js que construye activos low-poly y ofrece exportacion a GLB, con soporte de animacion cuando la peticion la requiere.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor anuncia que publicara el dataset de entrenamiento junto con los pesos finales, lo que permitira auditar el proceso. El checkpoint publicado es el primero funcional de una ejecucion de entrenamiento aun activa, por lo que el comportamiento puede cambiar en versiones posteriores.

## Capacidades

- Generacion de codigo HTML/JavaScript autonomo que construye escenas y activos 3D con Three.js.
- Exportacion a GLB: el HTML generado incluye un boton que descarga un archivo GLB funcional.
- Generacion de activos low-poly (personajes, props, escenarios) a partir de prompts cortos en ingles.
- Soporte de animacion: si el activo solicitado la requiere, el modelo la incorpora y la incluye en el GLB exportado.
- Integracion con Godot: los GLB generados se importan directamente en el editor.
- Conversacional: acepta un system prompt que define el formato de salida y peticiones de usuario en lenguaje natural.
- Capacidades generales de codigo y razonamiento heredadas del modelo base Qwen3.5-4B (no detalladas en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de assets para videojuegos: un desarrollador describe un objeto ("Create a mana potion") y obtiene en segundos un HTML con el modelo 3D y su GLB listo para importar en Godot, acelerando la fase de bloqueo o greyboxing.
- Generacion de props y decorados low-poly: escenarios como "weathered frontier medic station" o "desert merchant" permiten poblar niveles con mobiliario y elementos ambientales sin modelado manual.
- Creacion de personajes basicos: prompts como "Build a goblin" generan personajes low-poly con exportacion GLB, utiles para NPCs o enemigos en prototipos.
- Assets animados: cuando la peticion requiere movimiento, el modelo incorpora la animacion en el GLB exportado, lo que sirve para props animados o personajes simples.
- Educacion y aprendizaje de Three.js: el codigo generado sirve como ejemplo funcional de construccion de geometria, materiales y exportacion GLB en Three.js.
- Iteracion asistida por IA en pipelines de arte: el modelo puede integrarse en un flujo donde el artista revisa el GLB, pide correcciones y regenera, reduciendo el tiempo de produccion de assets secundarios.
- Generacion de assets para demos y game jams: al ser un modelo de 4B ejecutable en hardware consumer, equipos pequenos pueden generar contenido 3D sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una evaluacion cualitativa del autor: la mayoria de las generaciones funcionan al primer intento, especialmente con prompts en ingles, y algunas requieren un reintento o una correccion menor del codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, un modelo de 4,2 B ocupa aproximadamente 2,5-3 GB de pesos, mas overhead de contexto; con Q8_0, alrededor de 4,5-5 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia poder ejecutar las cuantizaciones GGUF. Para Q8_0 con contexto amplio se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de GPU modernas con 6 GB o mas de VRAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo OpenAI. vLLM y TGI requeririan los pesos Safetensors, aun no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder | 4,2 B | no disponible | Texto a Three.js/GLB | Apache 2.0 | GGUF en HF; Safetensors pendiente |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | Proposito general | no disponible en la informacion | HF |
| Alternativas especializadas en texto a 3D | no disponible | no disponible | Texto a 3D | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de otros modelos directamente comparables en la tarea especifica de generacion de Three.js con exportacion GLB.

## Limitaciones y advertencias

- Es un checkpoint de vista previa temprana: el entrenamiento seguia en curso y el comportamiento puede cambiar en versiones posteriores.
- Algunas generaciones requieren un reintento o una correccion manual del codigo; no se garantiza que el HTML o el GLB funcionen al primer intento.
- Los prompts en ingles funcionan mejor segun el autor; el modelo declara unicamente soporte de ingles, por lo que el rendimiento en castellano no esta validado.
- No se han publicado benchmarks cuantitativos, por lo que no hay evidencia objetiva de calidad frente a alternativas.
- No se detalla la composicion del dataset de entrenamiento; el dataset se publicara junto con los pesos finales.
- Riesgo de alucinacion en APIs de Three.js y en la estructura del GLB exportado: el codigo puede compilar pero producir geometria o exportaciones incorrectas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- Ausencia de pesos Safetensors en la version actual limita el uso con frameworks como vLLM o TGI y el ajuste fino posterior.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
