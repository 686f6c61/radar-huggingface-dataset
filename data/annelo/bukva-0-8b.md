# annelo/bukva-0.8b

## Resumen

Bukva-0.8b es un modelo de decisión de 0,8B desarrollado por el usuario annelo. En lugar de generar texto, recibe una situación (texto y/o una captura de pantalla), una pregunta y una lista de opciones, y devuelve una única elección leyendo los logits del siguiente token correspondientes a las letras `A`, `B`, `C`... en un solo forward pass. No hay generación, ni parseo de salida, ni reintentos.

Está construido como un conjunto de adaptadores LoRA sobre Qwen3.5-0.8B-Base, que permanece congelado, igual que la torre de visión. Soporta cuatro tipos de decisión: `choice` (hasta 26 opciones con probabilidades calibradas), `noul` (sí/no con probabilidad), `score` (opción ordinal con valor esperado) y `multi` (todas las opciones aplicables).

Su relevancia práctica está en la latencia: aproximadamente 36 ms por decisión en una RTX 3060, que suben a unos 150 ms cuando se incluye una captura de 1280×800. Esto permite usarlo como componente de enrutamiento, moderación, clasificación y control de agentes de interfaz en inglés y ruso sin el coste de un modelo generativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-0.8B-Base con capas de atención lineal y torre de visión; adaptadores LoRA r=16 (α=32) sobre las proyecciones del modelo de lenguaje |
| Parametros totales | No disponible para el conjunto; el modelo base es de 0,8B y los adaptadores LoRA suman 10,2M parámetros (150 matrices) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | bukva-research (etiquetada como `other` en HuggingFace, con `license_name: bukva-research` y enlace a LICENSE.md) |
| Formato de pesos | safetensors (adaptadores LoRA; el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, que queda congelado durante todo el entrenamiento. Sobre él se entrenan adaptadores LoRA con rango 16 y α=32 aplicados a todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje: 150 matrices y 10,2M parámetros en total. La torre de visión también permanece congelada, y las características de imagen se precalculan una sola vez y se guardan en caché. La lectura de la respuesta se hace sobre las filas de embedding atadas correspondientes a las letras, justo después del token `Answer:`.

El prompt de entrenamiento tiene un formato fijo que la propia librería construye: el estado (texto), la pregunta y las opciones etiquetadas con letras, cerrando con `Answer:`. Las probabilidades de salida se calibran por temperatura, con el valor `T` almacenado en cada build. Los builds `mix-*` no implican entrenamiento adicional: son fusiones lineales exactas de los deltas LoRA, de forma que se conserva la habilidad de agente y el clasificador olvida menos. La información disponible no detalla el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot y enrutamiento de intenciones con hasta 26 opciones (para más opciones, se dividen en grupos de 20 como máximo y se elige entre ganadores).
- Moderación de contenido: toxicidad en inglés y ruso (textdetox) y detección de spam en SMS.
- Clasificación temática, análisis de sentimiento y valoración por estrellas con valor esperado.
- Verificación tipo QNLI: determinar si un pasaje responde a una pregunta.
- Lectura de capturas de pantalla de interfaz (interruptores, deslizadores, diálogos, pestañas), con 484 preguntas de prueba sobre UI sintética.
- Modo agente de aplicación móvil y de navegación web: decidir el siguiente clic y comprobar si el objetivo se ha alcanzado.
- Capacidades de visión general evaluadas sobre 11 conjuntos públicos (AI2D, BLINK, CountBench, CV-Bench, GameQA, MMBench EN/RU, MMStar, ruCLEVR, RealWorldQA, ScreenSpot).
- Salida estructurada con índice, probabilidades calibradas y nivel de confianza, sin generación de texto libre.
- Soporte multilingüe limitado a inglés y ruso.
- No se documenta soporte de tool calling ni de function calling en el sentido convencional.

## Casos de uso

- Enrutamiento de tickets en atención al cliente: el modelo recibe el texto del usuario y una lista de equipos (`billing`, `tech support`, `sales`, `spam`) y devuelve el destino en un único forward pass, con una latencia de decenas de milisegundos que permite integrarlo en el camino crítico de un sistema de soporte.
- Moderación automática de comunidades en inglés y ruso: clasificación de toxicidad y spam por mensaje, con probabilidad calibrada para fijar umbrales de actuación automática frente a revisión humana.
- Agente de automatización de aplicaciones móviles: bucle que captura la pantalla, pregunta "¿está terminada la tarea?" en modo `noul` y, si no lo está, elige el siguiente elemento pulsable entre las etiquetas detectadas.
- Agente de navegación web sobre sitios reales: navegación sobre Wikipedia en inglés y ruso y python.org, tanto con la página en texto como en captura, para tareas de varios pasos.
- Análisis de reseñas y reputación: extracción de la valoración en estrellas con `score`, que además devuelve el valor esperado (por ejemplo, ~3,1 para "buen café pero esperamos 40 minutos"), útil para agregación de opiniones.
- Verificación de respuestas en un pipeline RAG: comprobación de si el fragmento recuperado responde realmente a la pregunta del usuario antes de generar la respuesta final.
- Triaje con escalado por confianza: actuar de forma autónoma cuando `max(probs) ≥ 0,8` (en las tareas clásicas el acierto es del 93–100 % en ese rango) y derivar a un humano o a un modelo mayor en caso contrario.
- Accesibilidad y automatización de escritorio: interpretar capturas de pantalla de interfaces para responder preguntas sobre el estado de controles (por ejemplo, "¿está activado el Wi-Fi?").

## Benchmarks y rendimiento

Los conjuntos de prueba son held-out: ningún elemento de test fue usado en entrenamiento. Solo se dispone de cifras publicadas para parte de las pruebas.

| Benchmark | Build | Resultado | Notas |
|---|---|---|---|
| Tareas clásicas (media) | v8-classifier | 85,1 | 100 ítems por tarea: clinc151 (16 opciones), spam SMS, tópicos de noticias rusas, toxicidad EN y RU (textdetox), estrellas de reseñas (Yelp), QNLI |
| Agente de teléfono | mix-v8v7 | 39/40 | App sintética no vista, 40 episodios multi-paso en EN y RU, solo captura; éxito = alcanzar el estado objetivo y que el modelo lo declare |
| Navegador (texto) | mix-v5v6 | 5/8 | Chrome real sobre Wikipedia (EN/RU) y python.org, 8 tareas de navegación |
| Probes manuales | No disponible | No disponible | 47 preguntas EN, 21 RU y 11 situaciones de juego; conjuntos pequeños, una pregunta vale de 2 a 5 puntos |
| Capturas de UI | No disponible | No disponible | 484 preguntas sobre capturas sintéticas de interfaz |
| Visión (media de 11 conjuntos) | No disponible | No disponible | AI2D, BLINK, CountBench, CV-Bench, GameQA, MMBench EN/RU, MMStar, ruCLEVR, RealWorldQA, ScreenSpot; 400 ítems por conjunto, en formato de elección múltiple |

Regla de calibración publicada: con `max(probs) ≥ 0,8`, el modelo acierta entre el 93 % y el 100 % de las veces en las tareas clásicas.

## Requisitos de hardware

- Referencia medida por el autor: aproximadamente 36 ms por decisión en una RTX 3060 y unos 150 ms cuando se añade una captura de pantalla de 1280×800.
- El repositorio completo ocupa 0,2 GB, ya que solo contiene los adaptadores LoRA; el modelo base Qwen3.5-0.8B-Base debe descargarse aparte.
- VRAM: no publicada. Como estimación derivada del tamaño (0,8B en FP16 más la torre de visión y los adaptadores) el conjunto rondaría 1,6–2 GB en precisión nativa, por lo que cabe con holgura en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en hardware integrado con memoria compartida.
- GPU profesionales como A100 o H100 no son necesarias para este tamaño; su uso tendría sentido únicamente por agregación de muchas instancias en paralelo.
- Opciones de despliegue: la librería `transformers` con el script `bukva.py` del repositorio es la vía documentada. Se recomienda instalar `flash-linear-attention` para acelerar las capas de atención lineal de Qwen3.5. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Al ser un modelo de decisión de un solo paso, no hay decodificación autoregresiva ni caché KV de secuencias largas, lo que explica la latencia baja y estable.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos de decisión comparables en la información proporcionada. La comparación más directa posible es con el propio modelo base y con los distintos builds del mismo proyecto:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bukva-0.8b `v8-classifier` | 0,8B base + 10,2M LoRA | No disponible | 85,1 en tareas clásicas | bukva-research | HuggingFace |
| bukva-0.8b `mix-v8v7` | 0,8B base + 10,2M LoRA | No disponible | 39/40 en agente de teléfono; clasificador algo inferior | bukva-research | HuggingFace |
| bukva-0.8b `mix-v5v6` | 0,8B base + 10,2M LoRA | No disponible | 5/8 en navegador (texto) | bukva-research | HuggingFace |
| Qwen3.5-0.8B-Base | 0,8B | No disponible | No disponible | No disponible | HuggingFace |

No se han identificado en la información disponible alternativas de terceros con cifras equiparables.

## Limitaciones y advertencias

- Licencia `bukva-research`, etiquetada como `other` en HuggingFace: hay que revisar LICENSE.md antes de cualquier uso comercial o redistribución, ya que no es una licencia estándar reconocida.
- El modelo no genera texto libre: solo elige entre opciones predefinidas. No sirve para redactar, resumir ni responder preguntas abiertas.
- Límite práctico de 26 opciones por decisión; por encima de esa cifra hay que agrupar en conjuntos de 20 o menos y hacer una segunda ronda.
- Soporte de idiomas restringido a inglés y ruso; no hay datos sobre otros idiomas.
- Riesgo de alucinación en el sentido de elegir una opción incorrecta con alta confianza. Aunque la calibración por temperatura y el umbral de 0,8 dan un acierto del 93–100 % en tareas clásicas, ese umbral es una heurística, no una garantía.
- Varias pruebas se apoyan en conjuntos pequeños: los probes manuales tienen 47 ítems en inglés y 21 en ruso, donde una sola pregunta vale de 2 a 5 puntos, por lo que la varianza de esas cifras es alta.
- El proyecto tiene 0 descargas y 0 me gusta en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La fecha de publicación indicada (2026) y el modelo base Qwen3.5-0.8B-Base deben verificarse contra el repositorio oficial antes de integrar el modelo en producción.
- No se documentan sesgos concretos ni auditorías de sesgo en la información disponible.
- El rendimiento de los modos agente depende de código externo no incluido en el modelo: captura de pantalla, listado de elementos pulsables y ejecución de la acción.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/annelo/bukva-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del proyecto: https://huggingface.co/annelo/bukva-0.8b/blob/main/LICENSE.md
- Resultados de benchmarks: https://huggingface.co/annelo/bukva-0.8b/blob/main/BENCHMARKS.md
- Script de inferencia: https://huggingface.co/annelo/bukva-0.8b/blob/main/bukva.py
- Imagen de benchmarks: https://huggingface.co/annelo/bukva-0.8b/blob/main/bench.png
- Cabecera del repositorio: https://huggingface.co/annelo/bukva-0.8b/blob/main/header.png
