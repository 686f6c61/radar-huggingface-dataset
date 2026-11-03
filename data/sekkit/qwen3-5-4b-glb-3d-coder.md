# sekkit/Qwen3.5-4B-GLB-3D-Coder

## Resumen

Qwen3.5-4B-GLB-3D-Coder es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario independiente sekkit bajo la etiqueta CCORE. No es un lanzamiento oficial de Qwen. El modelo está especializado en la generación de código HTML/JavaScript que construye escenas y assets 3D con Three.js, incluyendo una opción de exportación a GLB para su posterior importación en editores como Godot.

Con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), el modelo se distribuye en formato GGUF con cuantizaciones Q4_K_M y Q8_0, lo que lo hace apto para ejecución local en hardware de consumo. El repositorio ocupa 7,9 GB e incluye un proyector de visión opcional para entradas de referencia por imagen.

Se trata de una versión de vista previa (preview) temprana: el entrenamiento seguía en curso en el momento de la publicación (2 de noviembre de 2026), y el autor ha anunciado que publicará los pesos completos en Safetensors y el dataset de entrenamiento cuando finalice. Su relevancia actual radica en que aborda un nicho concreto —generación de assets 3D listos para motor gráfico a partir de lenguaje natural— con un modelo pequeño que puede ejecutarse en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles específicos no disponibles) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M y Q8_0 (publicados); Safetensors completos pendientes de publicación |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0); Safetensors anunciados para la versión final |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros, y se ha ajustado mediante finetune supervisado sobre un dataset propio orientado a la generación de código Three.js con exportación GLB. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El dataset de entrenamiento abarca 25 dominios de assets de videojuego, entre ellos personajes y NPC, enemigos, jefes, armas y armaduras, objetos y herramientas, mobiliario, naturaleza y entorno, arquitectura modular, objetos interactivos, transportes terrestres, aéreos y acuáticos, maquinaria industrial, assets de laboratorio y médicos, servicios urbanos, instalaciones deportivas, agricultura, cocina y mercados, museos e investigación de campo, trampas y peligros, festivales, escenarios de batalla, estructuras submarinas y marcadores de puzzles. El modelo genera HTML/JavaScript que construye la escena en Three.js e incluye la lógica de exportación a GLB; para assets con movimiento, el system prompt solicita que la animación se incluya en el GLB exportado. La versión publicada incorpora además un proyector de visión opcional para entradas de referencia por imagen.

## Capacidades

- Generación de código HTML/JavaScript para construir escenas 3D con Three.js.
- Exportación de los assets generados a formato GLB, importable en Godot y otros editores compatibles.
- Generación de animaciones incluidas en el GLB cuando se solicitan explícitamente.
- Generación de assets 3D a partir de descripciones en lenguaje natural en inglés (personajes, armas, props, arquitectura, vehículos, escenarios, etc.).
- Soporte opcional de visión para usar imágenes de referencia como entrada, mediante el proyector incluido.
- Capacidad conversacional y de generación de texto heredada del modelo base.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Prototipado rápido de assets para videojuegos: un desarrollador describe un objeto (por ejemplo, "una moto de reparto compacta con cajas de carga") y obtiene código Three.js con exportación GLB que puede importar directamente en Godot, acelerando la fase de bloqueo y maquetación.
- Generación de props y mobiliario para escenarios: descripciones como "un banco de trabajo de madera desgastado con un pequeño farol" permiten poblar niveles con assets coherentes sin modelado manual.
- Creación de personajes y enemigos de bloqueo: prompts como "un goblin explorador de pantano con escudo de madera" generan mallas básicas utilizables como placeholders en iteraciones de diseño de juego.
- Construcción de arquitectura modular: módulos como puertas de mazmorra o marcos de hierro se generan con dimensiones y estilos consistentes, facilitando el ensamblaje de niveles por bloques.
- Assets animados interactivos: puertas, trampas y mecanismos con animación solicitada explícitamente, exportados con la animación incluida en el GLB para su uso directo en el motor.
- Escenarios y decorados de entorno: árboles, rocas, puestos de mercado o estructuras submarinas para vestir niveles sin pipeline de modelado dedicado.
- Referencia visual a partir de imágenes: con el proyector de visión opcional, el modelo puede tomar una imagen como referencia para generar el asset correspondiente, útil en flujos de arte conceptual a prototipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, en las pruebas del autor, la mayoría de las generaciones funcionan al primer intento, especialmente con prompts en inglés, y que la calidad mejoró sustancialmente respecto al checkpoint anterior.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, un modelo de 4,2 B ocupa aproximadamente 2,5-3 GB de pesos, por lo que cabe holgadamente en GPUs de consumo con 6-8 GB de VRAM; en Q8_0, el peso ronda los 4,5 GB, requiriendo 6-8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070 y superiores) para Q8_0; GPUs profesionales como A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 6 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio (mencionado explícitamente por el autor), Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder | ~4,2 B | No disponible | Three.js + GLB + Godot | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | No disponible | Propósito general | Apache 2.0 (según modelo base) | Safetensors |
| Alternativas de generación de código 3D | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la misma categoría (generación de código 3D con exportación GLB) dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo en estado de vista previa: el entrenamiento seguía en curso en el momento de la publicación, por lo que la calidad puede variar entre checkpoints y no debe considerarse estable para producción.
- Solo inglés: la model card declara únicamente el idioma inglés; los prompts en otros idiomas pueden degradar la calidad de forma significativa.
- Algunas generaciones requieren un segundo intento o corrección manual, según reconoce el propio autor.
- Los pesos completos en Safetensors y el dataset de entrenamiento aún no están publicados; solo hay GGUF Q4_K_M y Q8_0.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar código Three.js con APIs inexistentes o geometrías incorrectas que no compilen o no exporten correctamente a GLB.
- No se documentan evaluaciones de sesgo; al ser un finetune sobre un dataset propio de assets de videojuego, puede reflejar sesgos de estilo o composición del dataset.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- El proyector de visión es opcional y su calidad no está evaluada en la información disponible.
- No se documenta soporte de tool calling ni de flujos agénticos, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/Qwen3.5-4B-GLB-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
