# nativ-community/GEV-26B-Decide-MLX-8bit

## Resumen

GEV-26B-Decide-MLX-8bit es una conversión al formato MLX del modelo `autotrust/GEV-26B-Decide`, publicada por `nativ-community` para su ejecución con `mlx-vlm` sobre Apple Silicon. No es un modelo generativo al uso: GEV es un modelo de decisión que, en un único forward pass, recibe una pregunta con un conjunto de opciones y devuelve una probabilidad para cada opción, sin producir texto libre. El repositorio empaqueta 25.806.003.814 parámetros (~25,8B) con cuantización affine de 8 bits y tamaño de grupo 64.

La conversión se ha realizado fusionando el LoRA "System 1" del modelo original y manteniendo la cabeza de decisión en float32, lo que preserva la precisión de las probabilidades de salida. Su relevancia actual reside en que permite ejecutar localmente, y de forma privada, un modelo de decisión multimodal de casi 26B en un Mac, algo poco habitual en el ecosistema de pesos abiertos.

Se trata de un modelo muy reciente (creado el 7 de octubre de 2026), sin descargas ni valoraciones registradas, y con soporte todavía experimental: GEV aún no está integrado en una release estable de `mlx-vlm`, por lo que requiere instalar una rama de desarrollo concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (GEV) sobre base vision-language; detalles internos de la arquitectura base no disponibles |
| Parametros totales | 25.806.003.814 (~25,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | affine 8-bit, group size 64 (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Modelo base | autotrust/GEV-26B-Decide (revisión 7c89590ead085bf77630b4bf68264ea30b6ddc78) |
| Pipeline | image-text-to-text |
| Libreria | mlx |
| Tamano del repositorio | 28,0 GB |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

GEV es un modelo de decisión: en lugar de decodificar texto token a token, realiza un forward pass y emite una probabilidad por cada opción de la pregunta planteada. Su pipeline es `image-text-to-text`, lo que indica que acepta entradas de imagen y texto. La conversión a MLX fusiona el LoRA "System 1" del modelo original y conserva la cabeza de decisión en float32 para no degradar las probabilidades. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; tampoco sobre innovaciones concretas de atención o decodificación.

La verificación de fidelidad publicada por el autor indica que la conversión replica el comportamiento de la referencia `transformers + peft` (System 1): misma respuesta en 7/7 preguntas de prueba (bool, choice, score, estado JSON, torneo de 20 opciones, una imagen y dos imágenes), identificadores de token idénticos en 9/9 forward passes y una diferencia máxima de probabilidad de 0,018.

## Capacidades

- Decisión sobre opciones: devuelve una probabilidad por opción en un único forward pass, en lugar de generar texto.
- Formatos de respuesta admitidos en las pruebas: booleano (`bool`), elección (`choice`), puntuación (`score`), estado estructurado (`JSON state`) y torneos de hasta 20 opciones.
- Entrada multimodal imagen-texto, con soporte verificado para una y dos imágenes.
- Integración mediante la función `predict()` de `mlx-vlm`, que recibe un diccionario de opciones con su tipo e instrucciones.
- No genera texto libre: no es un modelo conversacional ni de redacción.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (modo thinking, audio, vídeo): no disponible.

## Casos de uso

- Enrutamiento y clasificación en atención al cliente: dado un mensaje como "el paquete llegó dañado y quiero que me devuelvan el dinero", el modelo puede responder en un solo paso a preguntas booleanas del tipo "¿el cliente pide un reembolso?", como muestra el propio README.
- Extracción de estado estructurado: a partir de una conversación o imagen, devolver un `JSON state` con la situación del caso, útil para alimentar sistemas de ticketing o CRM sin necesidad de un generador de texto.
- Puntuación de candidatos: usar la salida `score` para ordenar respuestas, productos o incidencias según una instrucción dada.
- Reranking y selección múltiple: mediante la modalidad de torneo de 20 opciones, elegir la mejor alternativa entre un conjunto amplio, por ejemplo para selección de documentos relevantes.
- Verificación visual con decisión: al admitir imágenes, puede responder cuestiones del tipo "¿el producto de la foto coincide con el pedido?" evaluando la imagen y el texto en el mismo forward pass.
- Moderación y etiquetado de contenido: clasificar si un texto o imagen cumple una política concreta, devolviendo la probabilidad asociada para fijar umbrales.
- Procesamiento local y privado en Mac: al ejecutarse con MLX sobre Apple Silicon, encaja en flujos donde los datos no deben salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada por el autor es la verificación de fidelidad frente a la referencia `transformers + peft`:

| Prueba de verificacion | Resultado |
|---|---|
| Preguntas con respuesta coincidente (bool, choice, score, JSON state, torneo de 20 opciones, una imagen, dos imágenes) | 7/7 |
| Forward passes con token ids identicos | 9/9 |
| Mayor diferencia de probabilidad frente a la referencia | 0,018 |

## Requisitos de hardware

- VRAM equivalente: el repositorio ocupa 28,0 GB; al tratarse de pesos de 8 bits para ~25,8B parámetros, se necesita memoria unificada suficiente para cargar el modelo completo.
- GPU compatibles: exclusivamente Apple Silicon mediante MLX. No hay soporte para GPU de NVIDIA (A100, H100, RTX 4090) ni para CUDA.
- Ejecución en equipo de consumo: sí, en Macs con memoria unificada amplia (se recomienda un mínimo de 32 GB, preferiblemente 48-64 GB o superior para dejar margen al runtime y a las entradas de imagen).
- Opciones de despliegue: únicamente `mlx-vlm`, y en concreto la rama de desarrollo `Lazarus-931/mlx-vlm@feat/gev`, ya que GEV no está en una release estable. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados directamente: el formato de "modelo de decisión" que devuelve probabilidades por opción sin generar texto es poco común en el catálogo abierto. La única comparación posible es con su propio modelo de origen.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/GEV-26B-Decide-MLX-8bit | ~25,8B | no disponible | MLX safetensors 8-bit | apache-2.0 | HuggingFace |
| autotrust/GEV-26B-Decide | no disponible | no disponible | safetensors (transformers + peft) | no disponible | HuggingFace |
| Modelos generativos VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto: no puede emplearse para chat abierto, redacción, resumen o código; su salida son probabilidades por opción.
- Dependencia de una rama no estable: requiere `pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/gev"`, con el riesgo de mantenimiento y de rotura que ello implica en producción.
- Exclusividad de plataforma: al ser MLX, solo funciona en Apple Silicon; no es portable a servidores con GPU NVIDIA.
- Idiomas soportados no declarados: no hay garantía documentada de cobertura multilingüe más allá del inglés.
- Sesgos conocidos: no disponible. Al ser un clasificador probabilístico, hereda los sesgos del modelo base, que tampoco están documentados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta de probabilidades en dominios alejados del entrenamiento.
- Licencia: el repositorio es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base `autotrust/GEV-26B-Decide` y de las dependencias.
- Madurez: 0 descargas y 0 valoraciones; no hay validación independiente por parte de la comunidad.
- Longitud de contexto desconocida: limita la planificación de cargas con entradas largas o múltiples imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/GEV-26B-Decide-MLX-8bit
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- Rama de mlx-vlm con soporte GEV: https://github.com/Lazarus-931/mlx-vlm (rama `feat/gev`)
- Repositorio principal de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Nativ (runtime local para Apple Silicon): https://blaizzy.github.io/nativ/
