# OxBee/Qwen3.5-4B-GLB-3D-Coder

## Resumen

Qwen3.5-4B-GLB-3D-Coder es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el autor independiente OxBee (bajo la marca CCORE). No es un lanzamiento oficial de Qwen. Su proposito es especializar un modelo pequeno de 4B parametros en la generacion de codigo HTML/JavaScript basado en Three.js que construye escenas y assets 3D exportables como archivos GLB, pensados para importarse en editores como Godot.

El modelo se distribuye en formato GGUF (cuantizaciones Q4_K_M y Q8_0) y se encuentra en estado de preview temprano: el entrenamiento seguia en curso en el momento de la ultima actualizacion del checkpoint (2 de noviembre de 2026). El autor ha indicado que publicara los pesos completos en Safetensors y el dataset de entrenamiento cuando finalice el proceso. El checkpoint actual ha mejorado sustancialmente la calidad de generacion respecto a la preview anterior, segun el autor.

La relevancia de este modelo radica en su nicho concreto: la generacion de assets 3D a partir de lenguaje natural con exportacion GLB y soporte opcional de vision para referencias de imagen. Con 4.205.751.296 parametros totales (segun safetensors) y una licencia Apache 2.0, se posiciona como una herramienta ligera para prototipado rapido de contenido 3D en pipelines de desarrollo de videojuegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Safetensors completos pendientes de publicacion) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B como base y se ha ajustado mediante finetune supervisado sobre un dataset propio que abarca 25 dominios de assets de videojuego. Entre estos dominios figuran personajes y NPC, enemigos, jefes, criaturas, armas y armaduras, objetos, mobiliario, naturaleza, arquitectura modular, objetos interactivos, transportes terrestres, aereos y acuaticos, maquinaria industrial, assets de laboratorio y medicos, servicios urbanos, deportes, agricultura, cocina, museos, trampas, festivales, escenarios de batalla, estructuras submarinas y elementos de puzles.

El objetivo de entrenamiento es que el modelo genere codigo HTML/JavaScript que construya escenas en Three.js con una opcion de exportacion a GLB, incluyendo animaciones cuando se solicitan explicitamente. El autor no ha detallado la arquitectura interna ni el numero de tokens de entrenamiento, y no se menciona el uso de RLHF o DPO. La innovacion principal es la especializacion vertical en un dominio concreto (Three.js + GLB) sobre un modelo pequeno, con soporte opcional de vision mediante un proyector incluido para entradas de imagen de referencia. El entrenamiento seguia activo en la fecha del checkpoint, por lo que se esperan mejoras en versiones posteriores.

## Capacidades

- Generacion de codigo HTML/JavaScript con Three.js para construir escenas y assets 3D.
- Exportacion de assets a formato GLB para importacion en editores como Godot.
- Generacion de animaciones en el GLB exportado cuando se solicitan explicitamente.
- Soporte opcional de vision mediante proyector para entradas de imagen de referencia.
- Generacion de assets en 25 dominios de videojuego (personajes, enemigos, armas, vehiculos, arquitectura, naturaleza, etc.).
- Respuesta a prompts cortos en ingles con un system prompt especifico.
- Capacidad conversacional y de generacion de texto (pipeline text-generation).
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: un desarrollador describe un objeto (por ejemplo, "Create a short iron sword with a leather-wrapped grip") y obtiene codigo Three.js que genera el asset, lo exporta a GLB y lo importa en Godot para iterar sobre el diseno sin modelado manual inicial.
- Generacion de mobiliario y props para escenarios: el modelo produce assets como mesas de trabajo, faroles o puertas modulares que se integran en niveles de juego, adecuado por su entrenamiento especifico en props y arquitectura modular.
- Creacion de enemigos y jefes para juegos indie: prompts como "Create a stone golem boss with glowing green crystals" generan modelos exportables que sirven como base para enemigos, aprovechando el dominio de enemigos y jefes del dataset.
- Construccion de escenarios de batalla y trampas: assets como puestos de mando con sacos de arena o trampas de pinchos ocultos permiten poblar niveles de forma rapida, gracias a los dominios de battlefield scenery y traps del entrenamiento.
- Generacion de vehiculos y transportes: el modelo cubre transporte terrestre, aereo, acuatico e industrial, util para juegos con flotas o mecanicas de movimiento (por ejemplo, "Create a compact courier motorcycle with cargo boxes").
- Assets para entornos submarinos y naturaleza: estructuras como domos de observacion de coral o arboles sobre monticulos rocosos permiten generar escenarios naturales y subacuaticos sin herramientas de modelado.
- Referencia visual a partir de imagenes: con el proyector de vision opcional, el modelo puede tomar una imagen de referencia y generar el codigo Three.js correspondiente, util para replicar estilos o assets existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta cualitativamente que la mayoria de generaciones funcionan al primer intento, especialmente con prompts en ingles, y que algunas requieren un reintento o correccion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 4B parametros, las cuantizaciones GGUF Q4_K_M y Q8_0 permiten inferencia en GPUs de consumo, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el formato GGUF y el tamano de 4B sugieren que cabe en GPUs consumer, pero no se especifican modelos concretos.
- Opciones de despliegue: el autor menciona LM Studio para cargar los GGUF; al ser formato GGUF, es compatible con llama.cpp y Ollama, aunque no se confirma explicitamente en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder | 4.205.751.296 | no disponible | Three.js + GLB + Godot | apache-2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Generacion de texto general | no disponible | no disponible |
| Otros modelos de generacion 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la informacion proporcionada. El unico punto de comparacion claro es el modelo base Qwen/Qwen3.5-4B, del que este finetune hereda la arquitectura y sobre el que anade la especializacion en Three.js y GLB.

## Limitaciones y advertencias

- Modelo en estado de preview temprano: el entrenamiento seguia en curso y la calidad puede variar entre checkpoints.
- Algunas generaciones requieren un segundo intento o correccion manual; no todas funcionan al primer intento.
- Idiomas: solo se declara soporte de ingles (en); los prompts en otros idiomas pueden degradar la calidad.
- Longitud de contexto no especificada, lo que limita la planificacion de conversaciones largas o escenas complejas.
- Riesgo de alucinacion en la generacion de codigo Three.js: el codigo puede contener errores que requieran depuracion manual.
- Los pesos completos en Safetensors y el dataset de entrenamiento aun no estan publicados; solo hay GGUF disponibles.
- Si se descargaron los GGUF antes del 2 de noviembre de 2026 a las 04:50 UTC, deben eliminarse y volver a descargarse, ya que los nombres de archivo no cambiaron.
- Licencia Apache 2.0 permite uso comercial, pero al ser un finetune no oficial de Qwen, conviene verificar las condiciones del modelo base.
- No es un lanzamiento oficial de Qwen; el soporte y mantenimiento dependen del autor independiente.

## Enlaces

- HuggingFace: https://huggingface.co/OxBee/Qwen3.5-4B-GLB-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
