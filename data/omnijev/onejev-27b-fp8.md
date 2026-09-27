# OmniJev/OneJev-27B-FP8

## Resumen

OneJev-27B-FP8 es la versión cuantizada a 8 bits en coma flotante (FP8) de OneJev-27B, un modelo multimodal de decisión desarrollado por el equipo OmniJev. No es un modelo generativo de propósito general al estilo de un chat assistant: está diseñado como "System One decision model", es decir, un componente que recibe un estado (por ejemplo, una tarea y una captura de pantalla) más un conjunto de preguntas tipadas y devuelve respuestas estructuradas —veredictos y elecciones entre opciones— para que otro sistema (típicamente un agente que opera interfaces gráficas) decida el siguiente paso.

El modelo parte de OneJev-27B, que a su vez se apoya en una base Qwen3.8-27B según la tabla de la model card, con un total de 27.356.728.560 parámetros reales en safetensors. La variante FP8 reduce el peso de los pesos de 54,7 GB a 30,4 GB, lo que permite ejecutar el modelo en una única GPU de 48 GB con soporte FP8 nativo (L40S, H100, H200 o posteriores). La cuantización usa una escala por fila de pesos y por token, y se empaqueta con compressed-tensors.

Su relevancia práctica está en la latencia y en la integración: sobre una H200 y una captura de 1280x720, responde una pregunta en 168 ms y diez preguntas en una sola petición en 298 ms, frente a 189 ms y 324 ms del modelo de 16 bits. El modelo se sirve mediante el servidor `qev serve`, que implementa la System One API de TypeSafe con un campo adicional `media` para imágenes y vídeo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B; no se detallan capas, atención ni configuración interna en la informacion disponible |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no aplica (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8, con una escala por fila de pesos y por token (formato compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 30,4 GB; el modelo de 16 bits ocupa 54,7 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: solo se indica que la variante de 16 bits (OneJev-27B) se construye sobre una base Qwen3.8-27B y que el pipeline es image-text-to-text, por lo que se trata de un transformer multimodal capaz de procesar imágenes y vídeo junto con texto. El número de tokens de entrenamiento, la composición del dataset y si hubo etapas de RLHF, DPO u otro tipo de alineamiento no están publicados en la model card.

La innovación destacable documentada es la cuantización: FP8 con una escala por fila de pesos y por token, que reduce el peso de 54,7 GB a 30,4 GB manteniendo la fidelidad de las respuestas. Sobre 229 filas de test, el modelo de 8 bits coincide con la respuesta del modelo de 16 bits en 226 casos (98,7 %), y su precisión medida es de 66,4 frente a 65,5 del modelo de 16 bits. La interfaz del modelo es deliberadamente restringida: se le pasa un `state` (por ejemplo, `task` y `screen`) y un diccionario de `questions` con tipos como `Noul` (veredicto) y `Choice` (selección de una opción entre varias), lo que convierte la salida en un objeto tipado en lugar de texto libre.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: veredictos booleanos/`Noul` y elección entre opciones discretas (`Choice`), que es el modo de uso principal del modelo.
- Procesamiento de imágenes como entrada, con soporte explícito de capturas de pantalla (el ejemplo de la model card usa un PNG de 1280x720).
- Procesamiento de vídeo como entrada, según la etiqueta `video` del modelo y el campo `media` de la API.
- Uso como modelo de decisión para agentes de interfaz gráfica (etiqueta `gui-agent`): determinar si una tarea se ha completado y qué acción debería ejecutarse a continuación.
- Calibración de decisiones, según la etiqueta `calibration` del repositorio.
- Procesamiento por lotes de varias preguntas en una sola petición (hasta 10 preguntas en el benchmark de latencia publicado).
- Soporte de la System One API de TypeSafe a través del servidor `qev`, con cliente Python.
- Generación de texto libre, razonamiento general, código, matemáticas, tool calling o function calling: no documentado en la informacion disponible.

## Casos de uso

- Agente de interfaz gráfica para trámites: el modelo recibe el estado `{"task": "Pay the open invoice from ACME", "screen": "<image:1>"}` junto con una captura y devuelve si la tarea está hecha (`done`) y cuál es el siguiente paso (`click` o `stop`). Es exactamente el ejemplo publicado por el autor.
- Verificación de finalización de tareas automatizadas: en lugar de comprobar el estado del sistema por lógica ad hoc, se le pregunta al modelo si el objetivo se ha cumplido a partir de la pantalla, con una latencia de 168 ms en H200 para una pregunta.
- Automatización RPA con bucle de decisión corto: al responder 10 preguntas en una sola petición en 298 ms, se pueden evaluar varias condiciones del flujo (elemento visible, formulario válido, error presente) en un único paso de red, reduciendo el coste por iteración del agente.
- Enrutado de acciones en asistentes de escritorio o móvil: usar `Choice` para seleccionar entre un conjunto cerrado de acciones (`click`, `scroll`, `type`, `stop`) mantiene la salida acotada y evita parsear texto libre.
- Supervisión de sesiones con vídeo: aprovechando la etiqueta `video` y el campo `media`, se puede comprobar el estado de una aplicación a partir de una grabación de pantalla en lugar de una captura estática.
- Evaluación y control de calidad de agentes: dado que la salida es tipada (`Noul`, `Choice`), es viable usarla como juez automático en pipelines de test de otros agentes, comparando la decisión del modelo con el resultado esperado.
- Despliegue en infraestructura con GPUs de 48 GB: al ocupar 30,4 GB de pesos, permite servir el modelo en una sola L40S o H100 en lugar de requerir dos GPUs o un nodo de 80 GB, según los requisitos que indica el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos de evaluación publicados son la comparación interna entre la variante FP8 y la de 16 bits sobre 229 filas de test, junto con la latencia medida.

| Metrica | OneJev-27B (16 bits) | OneJev-27B-FP8 |
|---|---|---|
| Coincidencia de respuesta con el modelo de 16 bits | referencia | 226/229 (98,7 %) |
| Precision (229 filas de test) | 65,5 | 66,4 |
| Latencia, 1 pregunta, captura 1280x720, H200 | 189 ms | 168 ms |
| Latencia, 10 preguntas en una peticion, H200 | 324 ms | 298 ms |
| Tamano de pesos | 54,7 GB | 30,4 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: 30,4 GB solo de pesos; hay que sumar el espacio para el contexto y las activaciones, por lo que el autor indica que el modelo "cabe en una GPU de 48 GB".
- GPU con soporte FP8 nativo: el autor indica L40S, H100, H200 "y posteriores". No se listan GPUs de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Por tamano de pesos (30,4 GB) no cabe con holgura en GPUs de consumo de 24 GB, y las de 32 GB no dejarían margen para el contexto.
- El modelo de 16 bits (OneJev-27B) requiere 54,7 GB de pesos y por tanto un nodo de 80 GB o varias GPUs.
- Opciones de despliegue documentadas: servidor propio `qev serve` (instalable desde el repositorio de GitHub de OneJev) con cliente Python `qev.Client`; el modelo está marcado como `endpoints_compatible` en HuggingFace. No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el formato compressed-tensors es el habitual en despliegues con vLLM, pero su compatibilidad no está confirmada por el autor.
- Latencia medida en H200 con captura de 1280x720: 168 ms para 1 pregunta y 298 ms para 10 preguntas en una sola petición. El throughput agregado no está publicado.

## Comparativa con modelos similares

Los datos disponibles permiten comparar con las variantes de la propia familia OneJev, publicadas por el mismo autor:

| Modelo | Base | Pesos | Notas |
|---|---|---|---|
| OneJev-27B-FP8 | OneJev-27B en 8 bits | 30,4 GB | Precision 66,4; requiere GPU con FP8 |
| OneJev-27B | Qwen3.8-27B | 54,7 GB | Precision 65,5; referencia de 16 bits |
| OneJev-9B | Qwen3.5-9B | 18,8 GB | Sin datos de benchmarks publicados |
| OneJev-4B | Qwen3.5-4B | 10,4 GB | Sin datos de benchmarks publicados |
| OneJev-0.8B | Qwen3.5-0.8B | 2,2 GB | Sin datos de benchmarks publicados |

No se dispone de informacion sobre modelos de decision multimodal comparables de otros autores (parametros, contexto, rendimiento, licencia o disponibilidad) en la informacion proporcionada, por lo que no se incluye una comparativa con alternativas externas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a un modelo de base transformer; la propia interfaz tipada (`Noul`, `Choice`) limita el espacio de salida, pero las decisiones sobre la pantalla pueden ser incorrectas. La precisión publicada sobre 229 filas de test es del 66,4 %, lo que implica un tercio de respuestas incorrectas en ese conjunto.
- El número de filas de la evaluación interna (229) es reducido y no se detalla su composición ni el dominio de las tareas, por lo que la precisión de 66,4 no es extrapolable sin más a otros entornos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están publicados. La model card está redactada en inglés y no se documenta comportamiento multilingüe.
- La cuantización FP8 exige hardware con soporte nativo (L40S, H100, H200 o posterior); en GPUs sin FP8 el modelo no es utilizable tal cual, y no se ofrecen pesos GGUF ni otras alternativas en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de una base Qwen3.8-27B y la model card solo menciona la licencia Apache 2.0; conviene verificar las condiciones de la licencia de la base antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, por lo que no existe validación independiente de terceros.
- La API requiere el servidor `qev` del propio autor; no se documenta compatibilidad con servidores de inferencia estándar, lo que añade dependencia de un componente propietario.
- Las etiquetas del repositorio indican `qwen3_5` mientras que la tabla de la model card indica `Qwen3.8-27B` como base de OneJev-27B; la discrepancia no está aclarada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Modelo base (16 bits): https://huggingface.co/OmniJev/OneJev-27B
- Coleccion OneJev en HuggingFace: https://huggingface.co/collections/OmniJev/onejev
- Repositorio en GitHub: https://github.com/OmniJev/OneJev
- Licencia en GitHub: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Variante OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- Variante OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- Variante OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- Referencia bibliografica (BibTeX) incluida en la model card: OneJev: A Multimodal System One Decision Model, OmniJev Team, 2026.
- Nota: los resultados de la busqueda web proporcionada corresponden a tiendas de ropa vintage (vstorede.com, thevstore.de y perfiles sociales asociados) y no guardan relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
