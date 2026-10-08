# nativ-community/JEV-27B-VL-MLX-MXFP4

## Resumen
JEV-27B-VL-MLX-MXFP4 es una conversión al formato MLX del modelo multimodal `autotrust/JEV-27B-VL`, publicada por la organización nativ-community. Se trata de un modelo de decisión (decision model): en lugar de generar texto libre, devuelve una probabilidad para cada una de las opciones de una pregunta en una única pasada forward. Está diseñado para ejecutarse en local sobre Apple Silicon mediante la librería mlx-vlm.

El modelo cuenta con 27.356.728.560 parámetros (aproximadamente 27,36 B) y se distribuye cuantizado en MXFP4 (4 bits, group size 32), con el `lm_head` y el readout de decisión mantenidos sin cuantizar. La conversión incorpora el LoRA de System 1 ya fusionado, incluida su actualización del `lm_head`, para reproducir la receta de inferencia del modelo original.

Su relevancia inmediata está en la inferencia local de un modelo de decisión multimodal de ~27 B en equipos de consumo con chip de Apple. El autor verifica que la conversión produce la misma respuesta que la receta System 1 de autotrust en 7 de 7 preguntas de prueba (bool, choice, score, estado JSON, 20 opciones en una pasada, una imagen y dos imágenes), con ids de token idénticos en 7 de 7 pasadas forward y una diferencia máxima de probabilidad de 0,055.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles del backbone no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32); `lm_head` sin cuantizar; el modelo base se publica en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base. Se sabe que es un modelo de visión-lenguaje (pipeline `image-text-to-text`) con un backbone en bf16 y que incorpora un LoRA de System 1 que se ha fusionado en esta conversión, incluyendo su actualización del `lm_head`. La peculiaridad técnica central es que no es un modelo generativo de texto, sino un modelo de decisión: procesa la pregunta y sus opciones y emite, en una sola pasada forward, una probabilidad por opción.

La conversión a MXFP4 se ha realizado con mlx-vlm y mantiene el `lm_head` (el readout de decisión) sin cuantizar para no degradar la calibración de las probabilidades de salida. El autor reporta igualdad de token ids en 7 de 7 pasadas forward frente a la receta original y una diferencia máxima de probabilidad de 0,055. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades
- Decisión multimodal: devuelve una probabilidad por cada opción de una pregunta en una única pasada forward, sin generar texto.
- Tipos de pregunta soportados según la verificación del autor: booleana (bool), elección (choice), puntuación (score), estado JSON y preguntas con hasta 20 opciones en una sola pasada.
- Entrada de imagen: procesamiento de una y de múltiples imágenes (se verifican los casos de una imagen y de dos imágenes).
- Inferencia conversacional/multiturno a nivel de pipeline (`conversational`, `image-text-to-text`).
- Ejecución local en Apple Silicon mediante mlx-vlm.
- No dispone de tool calling, generación de código ni agentes multi-paso documentados; no es un modelo generativo.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Clasificación de intención en atención al cliente: el modelo recibe el texto del cliente y un conjunto de opciones (por ejemplo, `refund`, `cancel`, `info`) y devuelve la probabilidad de cada una en una sola pasada, lo que permite enrutar tickets sin generación de texto.
- Enrutado y priorización de tickets: definir opciones como `urgente`/`normal`/`baja` y usar las probabilidades como señal de confianza para el sistema de triaje.
- Extracción de estado estructurado: el soporte de opciones tipo estado JSON permite mapear el contenido de un mensaje o de una imagen a un estado tipado, útil para formularios y pipelines de validación.
- Preguntas booleanas sobre documentos o capturas: por ejemplo, responder "¿el documento contiene una firma?" con una probabilidad asociada, aprovechando el procesamiento de imagen.
- Moderación y filtrado con umbral de confianza: las probabilidades por opción permiten fijar umbrales y combinar varias preguntas en una sola pasada (hasta 20 opciones verificadas).
- Evaluación de imágenes en control de calidad: comprobar condiciones tipo "¿el producto presenta daños?" sobre una o varias imágenes y actuar en función de la probabilidad devuelta.
- Sistemas de decisión en local sin conexión: al ejecutarse con MLX en Apple Silicon, es adecuado para clasificación sensible a la privacidad que no debe salir del dispositivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es una verificación de fidelidad frente a la receta System 1 del modelo original:

| Verificacion | Resultado |
|---|---|
| Preguntas con respuesta identica al modelo de origen | 7 de 7 |
| Pasadas forward con ids de token identicos | 7 de 7 |
| Diferencia maxima de probabilidad | 0,055 |

Tipos de prueba cubiertos: bool, choice, score, estado JSON, 20 opciones en una pasada, una imagen y dos imágenes.

## Requisitos de hardware
- Almacenamiento: el repositorio ocupa 17,1 GB.
- Inferencia local en Apple Silicon mediante MLX (`library_name: mlx`). No hay soporte para CUDA documentado en esta conversión.
- Memoria unificada estimada: alrededor de 14-15 GB para los pesos en MXFP4 más overhead de runtime; se recomienda un Mac con 32 GB de memoria unificada o superior para trabajar con margen. Los modelos con 24 GB podrían quedar ajustados (estimación propia, no confirmada por el autor).
- GPU recomendadas: no disponibles; el formato MLX está orientado a chips Apple (serie M).
- Opciones de despliegue: mlx-vlm con el fork `Lazarus-931/mlx-vlm@feat/jev` (el soporte de JEV aún no está en una release estable). Otras alternativas como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV-27B-VL-MLX-MXFP4 | ~27,36 B | MXFP4 (4 bits) | safetensors MLX | apache-2.0 | nativ-community |
| autotrust/JEV-27B-VL (base) | ~27,36 B | bf16 | safetensors | no disponible en la informacion | autotrust |

No se dispone de datos sobre otros modelos de decisión multimodal comparables en la información proporcionada, por lo que la comparación con alternativas de la misma categoría se indica como no disponible.

## Limitaciones y advertencias
- Es un modelo de decisión, no un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o conversación abierta.
- Requiere software no estable: el soporte de JEV no está incluido en una release de mlx-vlm y depende del fork `Lazarus-931/mlx-vlm@feat/jev`.
- La verificación de fidelidad se realizó sobre solo 7 preguntas de prueba; el alcance de la validación es limitado y no constituye una evaluación exhaustiva.
- Sesgos y riesgo de alucinación en las probabilidades: no hay información publicada sobre calibración, sesgos o comportamiento fuera de dominio.
- Idiomas soportados: no disponibles; se desconoce el rendimiento multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar cargas con entradas largas o muchas opciones.
- Restricciones de licencia: el modelo se publica bajo apache-2.0, que permite uso comercial, pero se desconoce la licencia del modelo base y de los datos de entrenamiento originales, por lo que conviene verificarlos antes de un uso en producción.
- Disponibilidad limitada: 0 descargas y 0 likes en el momento de la consulta, y el repo se actualizó por última vez el 2026-10-08; no hay evidencia de adopción ni de mantenimiento.
- Formato ligado a Apple Silicon (MLX), lo que restringe el despliegue a hardware de Apple.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/nativ-community/JEV-27B-VL-MLX-MXFP4
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Fork con soporte JEV: https://github.com/Lazarus-931/mlx-vlm (rama `feat/jev`)
- Proyecto Nativ (ejecución local en Mac, autor de mlx-vlm): https://blaizzy.github.io/nativ/
