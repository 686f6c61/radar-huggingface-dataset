# ccore/Qwen3-1.7B-GLB-3D-Coder

## Resumen

CCORE GLB-3D-Coder 1.7B es un ajuste fino de Qwen3-1.7B desarrollado por el usuario ccore, orientado a la generacion de assets 3D de estilo low-poly para videojuegos. El modelo recibe una descripcion en lenguaje natural y produce una pagina HTML autocontenida que utiliza Three.js para renderizar el asset en un visor interactivo e incluye un boton de exportacion a GLB, el formato nativo del motor Godot. El problema que aborda es la generacion de geometria 3D utilizable en pipelines de desarrollo de juegos sin depender de herramientas de modelado manual ni de GPUs de gama alta.

El modelo parte de la arquitectura Qwen3-1.7B, un transformer causal con atencion de consulta agrupada (GQA) en sus 28 capas, y conserva los 1.720.574.976 parametros del modelo base. Se distribuye en formato GGUF con cuantizaciones Q8_0 (1,83 GB) y F16 (3,45 GB), lo que permite ejecutarlo en CPU o en GPUs de consumo con poca VRAM. La licencia es Apache 2.0, heredada del modelo base.

Es relevante ahora porque demuestra la viabilidad de especializar modelos pequenos en tareas de generacion de codigo grafico muy concretas, con un bucle de iteracion corto para desarrolladores independientes. No obstante, el checkpoint publicado es una version inicial de prueba: el autor indica que el entrenamiento debia finalizar entre el 11 y el 12 de noviembre de 2026 y que publicara pesos actualizados, Safetensors y la informacion completa de entrenamiento mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion de consulta agrupada (GQA) en 28 capas, basado en Qwen3-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (1,83 GB) y F16 (3,45 GB); Safetensors anunciado pero no publicado |
| Idiomas soportados | No disponible (la model card no los detalla; el modelo base Qwen3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio); Safetensors planificado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-1.7B, un transformer denso con atencion causal completa y atencion de consulta agrupada en las 28 capas. El autor justifica explicitamente la eleccion del modelo base por mantener atencion causal completa con GQA en todas las capas, lo que busca preservar la calidad de generacion de codigo con un coste de inferencia reducido.

El entrenamiento se realizo sobre el dataset ccore/ThreeJS-3D-GLB-Assets, que cubre 40 dominios de assets 3D organizados en cinco grandes categorias: personajes y criaturas (PNJ, enemigos, jefes, robots), objetos y props (armas, armadura, muebles, electrodomesticos, instrumentos musicales), entornos y estructuras (naturaleza, arquitectura modular, escenarios de batalla, servicios urbanos), vehiculos y maquinas (transporte terrestre, aereo, acuatico, maquinaria industrial) y assets interactivos (cocina y mercados, festivales, deportes, laboratorio y medicina, trampas y peligros, puzzles y marcadores de gameplay). La tarea de entrenamiento consiste en generar una pagina HTML completa y autonoma con Three.js que muestre el asset y ofrezca una exportacion GLB funcional, incluyendo animacion cuando el asset la requiera.

No se han publicado el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que anadira la informacion completa de entrenamiento cuando este finalice.

## Capacidades

- Generacion de codigo JavaScript con Three.js para construir geometria 3D low-poly a partir de descripciones en lenguaje natural.
- Produccion de paginas HTML autocontenidas con visor 3D interactivo y boton de exportacion a GLB.
- Exportacion funcional de assets a GLB, formato compatible con Godot y otros motores y editores 3D.
- Generacion de animaciones incluidas en el GLB exportado cuando el asset solicitado las requiere; en caso contrario, assets estaticos.
- Cobertura de 40 dominios de assets: personajes, criaturas, jefes, armas, muebles, entornos, vehiculos, maquinaria, objetos interactivos, trampas, puzzles y decoracion de escenarios.
- Generacion de texto conversacional heredada del modelo base Qwen3-1.7B.
- Capacidades multilingues: no documentadas en la model card.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no documentado para este ajuste fino.

## Casos de uso

- Prototipado rapido de assets para Godot: el desarrollador describe un asset (por ejemplo, "una mesa de hierro low-poly con remaches y estante inferior") y obtiene un HTML con el modelo renderizado y un GLB listo para importar en el editor, reduciendo el tiempo entre idea y asset jugable.
- Generacion de decoracion de escenarios: para poblar niveles con props como puestos de mando, campamentos, arboles o muebles, el modelo produce variantes en segundos, adecuado para equipos pequenos sin artistas 3D dedicados.
- Creacion de assets de personajes y enemigos: descripciones como "un jefe golem de piedra con extremidades rocosas y un nucleo de cristal verde brillante" generan mallas low-poly con animacion exportable, utiles para prototipos de combate.
- Iteracion en hardware modesto: con el archivo Q8_0 de 1,83 GB, el modelo se ejecuta en CPU o en GPUs de consumo con poca VRAM, lo que permite un bucle de prueba y error rapido sin infraestructura dedicada.
- Generacion de assets para game jams: en entornos con plazos muy cortos, el modelo cubre la produccion de props, vehiculos y estructuras basicas mientras el equipo se centra en la logica de juego.
- Educacion y aprendizaje de Three.js: el codigo HTML generado sirve como ejemplo funcional de construccion de geometria, materiales, iluminacion y exportacion GLB, util para quienes aprenden graficos 3D en web.
- Automatizacion de pipelines de assets: el HTML generado puede guardarse en disco y abrirse en un navegador para exportar el GLB de forma semiautomatica, integrándose en flujos de trabajo que luego procesan el GLB con herramientas de validacion o conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con Q8_0 y unos 3,5-4 GB con F16, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el modelo cabe en GTX 1650, RTX 3050, RTX 4060 y superiores. En A100 o H100 el modelo esta sobredimensionado para el hardware, pero funciona sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp y LM Studio, indicados por el autor; cualquier runtime compatible con Qwen3 y GGUF.
- Latencia y throughput: no disponibles. El autor senala que la velocidad de generacion depende del hardware, el runtime, la longitud de contexto y la cantidad de codigo que el modelo escriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CCORE GLB-3D-Coder 1.7B | 1.720.574.976 | No disponible | Generacion de assets 3D Three.js/GLB | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | 1.720.574.976 | No disponible | Proposito general, texto y codigo | Apache 2.0 | Safetensors, GGUF |
| Modelos de generacion 3D dedicados (p. ej. pipelines texto-a-malla) | Variable | No aplica | Generacion de mallas 3D | Variable | Variable |

La comparacion con alternativas especializadas en generacion 3D no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en la tarea de generar HTML con Three.js y exportacion GLB, a costa de un rendimiento general presumiblemente inferior fuera de ese dominio.

## Limitaciones y advertencias

- Checkpoint inicial de prueba: el autor advierte que el entrenamiento debia terminar entre el 11 y el 12 de noviembre de 2026 y que los pesos publicados se actualizaran; no deben considerarse definitivos.
- Fiabilidad de la exportacion: en las pruebas del autor, el modelo suele producir un asset 3D, pero algunos intentos fallan al renderizar o al exportar el GLB y requieren reintento.
- Ausencia de datos de entrenamiento: no se han publicado tokens, composicion del dataset ni tecnicas de alineacion, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que limita la planificacion de prompts largos o conversaciones multi-turno.
- Idiomas no documentados: la model card no especifica los idiomas soportados; el ajuste fino esta orientado a prompts en ingles segun los ejemplos.
- Dominio estrecho: fuera de la generacion de assets Three.js/GLB, el rendimiento puede degradarse respecto al modelo base.
- Riesgo de alucinacion en codigo: el HTML generado puede contener errores de sintaxis o APIs de Three.js incorrectas que impidan el renderizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y el proyecto depende de donaciones para futuras releases.
- Datos de uso: descargas y likes a cero en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Pesos Q8_0: https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder/blob/main/Qwen3-1.7B-GLB-3D-Coder-Q8_0.gguf
- Pesos F16: https://huggingface.co/ccore/Qwen3-1.7B-GLB-3D-Coder/blob/main/Qwen3-1.7B-GLB-3D-Coder-F16.gguf
- Apoyo al proyecto (Ko-fi): https://ko-fi.com/ccorecaio
