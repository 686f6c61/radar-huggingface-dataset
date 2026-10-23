# RunningHubAI/rh-z-image-4-lora

## Resumen

rh-z-image-4-lora es un adaptador LoRA de bajo rango para generación de imágenes (pipeline `text-to-image`) publicado por RunningHubAI en nombre de un autor de su plataforma (usuario @YXW). No es un modelo de lenguaje: se trata de un ajuste fino sobre el modelo de difusión Z-image-base cuyo objetivo es producir hojas de cuatro vistas de un mismo personaje (busto frontal, cuerpo entero frontal, perfil estricto de 90 grados y espalda completa) manteniendo identidad, rasgos faciales, peinado, complexión y vestuario coherentes entre las cuatro tomas.

El adaptador pesa 162 MiB (repositorio de 0,2 GB) y se distribuye en un único archivo `safetensors` pensado para cargarse en ComfyUI o en la plataforma RunningHub. Se activa con la palabra de disparo «四视图» (cuatro vistas) y está calibrado para resoluciones concretas: el propio autor indica que 1920×1088 ofrece los mejores resultados, seguidas de 2048×1024 y 1680×944, con 30-50 pasos y CFG 3.

Su relevancia es acotada y muy específica: cubre un caso de uso concreto del flujo de trabajo de ilustración y preproducción de personajes (character sheets), donde lo habitual es encadenar prompts y generar muchas imágenes hasta obtener consistencia. El autor reconoce explícitamente que la estabilidad de la identidad es la principal debilidad de esta versión y que el dataset fue generado íntegramente por «codex», lo que introduce artefactos conocidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Z-image-base; arquitectura interna del modelo base no disponible |
| Parámetros totales | No disponible (adaptador LoRA de 162 MiB; número de parámetros no especificado) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen). Resolución recomendada: 1920×1088; alternativas válidas 2048×1024 y 1680×944 |
| Tipos de cuantización | No disponible (se distribuye en safetensors; precisión de los pesos no especificada) |
| Idiomas soportados | No disponible. La model card está en chino e inglés; la palabra de disparo y los prompts de ejemplo están en chino |
| Licencia | No disponible. RunningHub publica en nombre del autor, que conserva el copyright; se remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (LoRA): `Z Image 4ST-4_000005000.safetensors`, 162 MiB |
| Palabra de disparo | 四视图 (cuatro vistas) |
| Fuerza de LoRA recomendada | 1 |
| Pasos de muestreo | 30-50 |
| CFG | 3 |
| Tamaño del repositorio | 0,2 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Modelo base | Z-image-base (fine-tuned from) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Z-image-base, un modelo de difusión de texto a imagen. La model card no documenta el número de pasos de entrenamiento, el volumen del dataset, la composición de las imágenes ni si hubo fases de ajuste posteriores (RLHF, DPO u otras); esa información no está disponible. El autor sí señala que el dataset fue elaborado íntegramente por «codex» y que esa elección explica los defectos de la versión: inconsistencia de identidad entre vistas, píxeles corruptos en ojos y pestañas en el perfil de cuerpo entero, altura del personaje, escasa variedad de vestuario y problemas de iluminación.

La justificación técnica del autor para elegir Z-image como base es que se trata de un modelo entrenado con imágenes reales, lo que reduce las variables a controlar en el proceso de generación y permite aproximarse al objetivo modificando solo uno o dos parámetros. El LoRA no incorpora mecanismos de decodificación especulativa, atención lineal ni componentes de agente: es un adaptador puramente visual que sesga la generación hacia una plantilla de cuatro vistas con iluminación de estudio neutra.

Un detalle relevante desde el punto de vista del entrenamiento es el diagnóstico que hace el autor de la inconsistencia de piel: al forzar coherencia entre un busto (pocos píxeles faciales) y un cuerpo entero (más píxeles faciales), la referencia se reescala y las zonas claras se vuelven más claras, generando caras más blancas en la vista frontal de cuerpo entero. Según el autor, este sesgo de exposición se corrige desde el dataset, no desde el prompt.

## Capacidades

- Generación de hojas de personaje de cuatro vistas: busto frontal grande, cuerpo entero frontal, perfil estricto de 90 grados y espalda completa, con la misma identidad, forma de cara, rasgos, tono de piel, línea de nacimiento del pelo, peinado, complexión y vestuario.
- Unificación de balance de blancos, exposición, luminosidad facial e iluminación entre las cuatro vistas, con instrucciones explícitas en el prompt para evitar brillos y piel artificial.
- Control de fondo (estudio fotográfico gris cálido en el ejemplo) y de vestuario mediante el texto del prompt; la ropa es el principal bloque editable junto con el personaje.
- Orientación a estética fotográfica realista y seca, en oposición a resultados de piel aceitosa, plástica o con textura facial forzada.
- Integración con ComfyUI como nodo de LoRA y con la API/entorno de RunningHub para ejecución remota.
- No soporta tool calling ni function calling, no es un modelo de agentes, no hace razonamiento multi-paso y no procesa audio ni vídeo.
- Capacidad multilingüe no documentada; el material de referencia y los prompts de ejemplo están en chino.

## Casos de uso

- Preproducción de personajes para animación o cómic: generar una hoja de cuatro vistas de un personaje con vestuario definido para que el equipo de modelado o de dibujo tenga referencias coherentes de frente, perfil y espalda con una sola ejecución a 1920×1088.
- Documentación de diseño de vestuario: usar el bloque editable del prompt (prenda, color, calzado) para iterar variantes del mismo personaje sin perder los rasgos faciales y la altura relativa entre vistas.
- Prototipado rápido en estudios pequeños: al ser un LoRA de 162 MiB, se carga junto al modelo base en ComfyUI y permite producir lotes de hojas de personaje sin depender de un proveedor cerrado, con 30-50 pasos y CFG 3 por imagen.
- Generación de material de referencia para modelado 3D: las vistas frontal, lateral de 90 grados y trasera sirven como planos de referencia para modeladores que necesitan proporciones y silueta consistentes, aceptando la limitación de consistencia facial del modelo.
- Ilustración editorial o de producto centrada en personas: el énfasis del LoRA en iluminación de estudio neutra y piel natural sin retoque lo hace utilizable para fichas de personaje con estética documental frente a resultados de piel sintética.
- Integración en pipelines automatizados vía API de RunningHub: el adaptador puede formar parte de un flujo de generación por lotes a partir de una plantilla de prompt fija, cambiando solo la descripción del personaje y del vestuario.
- Evaluación comparativa de adaptadores: útil como referencia de partida para quien quiera entrenar su propio LoRA de cuatro vistas y necesite una línea base con la que medir consistencia y artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no aporta métricas objetivas (FID, CLIP score, similitud facial) ni comparaciones cuantitativas con otros adaptadores.

La única evaluación disponible es cualitativa y procede de las pruebas del propio autor sobre distintas resoluciones:

| Resolución | Valoración del autor |
|---|---|
| 1024×512 | No válida (borrosa o dañada, consistencia facial insuficiente) |
| 1024×768 | No válida (borrosa o dañada, consistencia facial insuficiente) |
| 1536×512 | No válida (borrosa o dañada, consistencia facial insuficiente) |
| 1536×768 | No válida (borrosa o dañada, consistencia facial insuficiente) |
| 1536×1024 | No válida (borrosa o dañada, consistencia facial insuficiente) |
| 1680×944 | Resultado aceptable |
| 1920×1088 | Mejor resultado de la batería de pruebas |
| 2048×1024 | Resultado aceptable |

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende por completo del modelo base Z-image-base, cuyos requisitos no se documentan en la ficha; el adaptador LoRA añade solo 162 MiB a los pesos cargados.
- GPU recomendadas: no disponibles. La generación a 1920×1088 y 2048×1024 exige una GPU con memoria suficiente para el modelo base a esa resolución, pero no se aportan cifras.
- Encaje en GPU de consumo: no disponible. No hay datos que confirmen ni descarten su funcionamiento en tarjetas de gama consumer.
- Opciones de despliegue: ComfyUI (carga del LoRA junto al modelo base) y la plataforma RunningHub, tanto en su web como a través de su API documentada. No aplica llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor menciona como ventaja frente a modelos cerrados que el flujo es «rápido» y apto para «lote», pero sin cifras de segundos por imagen ni imágenes por minuto.

## Comparativa con modelos similares

No hay datos publicados de otros adaptadores LoRA de cuatro vistas comparables (parámetros, contexto, rendimiento, licencia). La única comparación disponible es la que hace el autor, de carácter cualitativo:

| Alternativa | Ventajas según el autor | Desventajas según el autor |
|---|---|---|
| rh-z-image-4-lora (este LoRA) | Resultado realista, estable en iluminación, rápido y apto para generación por lotes; no requiere encadenar prompts | No permite fijar una cara concreta; consistencia de identidad irregular; artefactos en ojos y pestañas del perfil; sensible a la resolución |
| Hojas de cuatro vistas generadas con modelos cerrados | Mayor control y posibilidad de fijar identidad, según el autor | Estética artificial: piel aceitosa y lisa o textura facial excesiva; menor sensación de realidad |
| Flujo solo con prompts sobre el modelo base | Sin dependencia de un adaptador adicional | Requiere acumular prompts y generar muchas imágenes («tirar de ruleta») hasta obtener consistencia |

## Limitaciones y advertencias

- Consistencia de identidad insuficiente: el propio autor la señala como el problema principal; unas vistas se parecen y otras no, con estabilidad por debajo de lo deseable.
- Artefactos conocidos: píxeles corruptos en los ojos y pestañas demasiado marcadas en la vista de perfil de cuerpo entero.
- Deriva de exposición entre vistas: la cara del busto puede salir más oscura y la del cuerpo entero más blanca por el reescalado de píxeles; afecta directamente a la percepción de identidad.
- Sensibilidad extrema a la resolución: por debajo de 1680×944 los resultados se describen como borrosos, dañados o con consistencia facial insuficiente.
- No fija una cara concreta: no sirve para reproducir una persona específica de forma fiable, a diferencia de flujos con modelos cerrados.
- Dataset generado íntegramente por «codex»: el autor atribuye a esta decisión los defectos de altura del personaje, variedad y modernidad del vestuario, y el control de la iluminación.
- Idiomas: no hay soporte multilingüe documentado; los prompts de ejemplo y la palabra de disparo están en chino, y el usuario debe escribir el resto de la indicación en un idioma que el modelo base entienda.
- Licencia no disponible: la ficha no especifica términos de uso comercial. RunningHub indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream, por lo que es obligatorio verificar la licencia de Z-image-base antes de cualquier uso en producción.
- Madurez: repositorio con 0 descargas y 0 «likes» en el momento de la consulta; sin validación independiente por parte de la comunidad.
- Sin métricas objetivas: no hay benchmarks, lo que impide comparar su rendimiento de forma cuantitativa con otras alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-4-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-z-image-4-lora/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2092926579633639425
- Página del autor: https://www.runninghub.cn/user-center/2009279106302349314
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Nota: la búsqueda web asociada a esta consulta no devolvió resultados técnicos relevantes sobre el modelo; no se han podido verificar papers, blogs ni demos independientes.
