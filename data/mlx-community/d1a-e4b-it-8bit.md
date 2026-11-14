# mlx-community/d1a-e4b-it-8bit

## Resumen

D1A-E4B-it v0.6 en formato MLX 8-bit es una compilación cuantizada del modelo de decisión D1A, desarrollado por JohnP1 y empaquetada por la comunidad mlx-community para su ejecución en Apple Silicon. No es un modelo generativo al uso: recibe un documento y un conjunto de preguntas (de tipo sí/no, elección múltiple o puntuación) y devuelve, en una única pasada forward, una probabilidad calibrada para cada opción, sin generar texto. Esto garantiza que toda respuesta sea una opción válida del conjunto planteado.

El modelo parte de Gemma 4 E4B-it de Google como backbone, sobre el que se ha aplicado un adaptador LoRA que queda fusionado en los pesos de esta build. Cuenta con 7.463.013.376 parámetros totales y se distribuye en safetensors con cuantización de 8 bits en capas lineales y embeddings de tokens (grupo 64) y 4 bits en embeddings por capa, ocupando 6,1 GB en disco para el modelo de texto, más 0,9 GB de codificadores de foto, voz y vídeo.

Su relevancia radica en el despliegue on-device de clasificación y enrutamiento de documentos con latencia baja y sin generación de texto libre, lo que elimina el riesgo de respuestas inválidas. Está pensado para tareas como el etiquetado de pull requests o la clasificación de tickets, con soporte de inglés y japonés y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B-it) con adaptador LoRA fusionado y cabeza de punteros (pointer head) |
| Parametros totales | 7.463.013.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en capas lineales y embeddings de tokens (grupo 64); 4 bits en embeddings por capa; cabeza de punteros en fp32 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 E4B-it (revisión `ee0ef602`) con un adaptador LoRA fusionado en los pesos. La salida no es texto generado, sino una cabeza de punteros en fp32 (`head.safetensors`) que produce probabilidades por opción en una sola pasada forward. La cuantización aplica 8 bits a capas lineales y embeddings de tokens con grupo 64, y 4 bits a los embeddings por capa; los codificadores multimodales de foto, voz y vídeo se mantienen sin cambios respecto al modelo base.

El entrenamiento se realizó con un token `<bos>` (id 2) al inicio de cada registro, según `d1a_config.json` (`leading_ids: [2]`), aunque el tokenizador de Gemma 4 E4B-it no lo añade por defecto. La temperatura de calibración es 1,55, tomada del run original y no reajustada para esta build. Los datos de decisión en japonés derivan de JGLUE (Yahoo Japan y Waseda University, CC BY-SA 4.0) y los de pull requests de NousResearch/hermes-agent (MIT), con el conjunto etiquetado de PRs de carácter privado.

## Capacidades

- Clasificación y decisión sobre documentos: responde preguntas de tipo sí/no (`noul`), elección múltiple (`choice`) y puntuación, devolviendo una probabilidad calibrada por opción.
- Enrutamiento y etiquetado: asignación de un documento a categorías predefinidas (por ejemplo, equipo de atención al cliente o etiquetas de pull request).
- Salida estructurada sin generación de texto: toda respuesta corresponde a una opción válida del conjunto planteado.
- Capacidades multimodales heredadas del modelo base mediante los codificadores de foto, voz y vídeo incluidos en `media/`.
- Soporte multilingüe limitado a inglés y japonés.
- No soporta conversación: al estar el adaptador fusionado, no puede mantener chat; el texto generado provendría de un backbone modificado, no de Gemma 4 E4B-it.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Etiquetado de pull requests: el modelo recibe el estado de un PR y responde preguntas de elección múltiple sobre etiquetas, con 276 preguntas evaluadas en 92 estados en la validación del autor, lo que lo hace adecuado para automatizar el triaje en repositorios.
- Enrutamiento de tickets de soporte: dada la descripción de una incidencia, decide a qué equipo (facturación, envío, soporte) corresponde mediante preguntas de tipo `choice`, con una sola pasada forward y sin riesgo de respuestas fuera de catálogo.
- Detección de sentimiento o urgencia: preguntas de tipo `noul` como "¿está el cliente enfadado?" permiten priorizar colas de atención con una probabilidad calibrada por caso.
- Clasificación de documentos con criterios múltiples: un mismo documento puede evaluarse contra varias preguntas simultáneamente, útil para pipelines de moderación o compliance que requieren varias etiquetas por ítem.
- Procesamiento on-device en Apple Silicon: con 6,1 GB en disco y ejecución vía MLX, puede desplegarse en un Mac (el autor cita un Mac mini y un M1 Max) para clasificación local sin enviar datos a la nube.
- Enrutamiento multimodal: gracias a los codificadores de foto, voz y vídeo incluidos, puede clasificar contenido audiovisual o imágenes con las mismas preguntas estructuradas.
- Evaluación de calidad en pipelines de datos: la salida probabilística permite fijar umbrales de confianza y derivar casos dudosos a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una comparación con la build de chat sin fusionar servida por el autor (`quality_gate.py`, Apple M1 Max):

| Metrica | Resultado |
|---|---|
| Peticiones de demo (202 preguntas) | 1 respuesta cambia |
| Estados de PR labeler (276 preguntas) | 3 respuestas cambian |
| Cambio máximo de probabilidad | 0,073 |
| Tiempo de modelo frente a la build de chat | 1,01x |
| Confianza media frente a precisión (transfer-v4) | +0,08 (ECE 0,081) |
| Rango de sesgo por fuente | de -0,04 (qnli) a +0,25 (emotion) |
| Respuestas con confianza >= 0,9 incorrectas | 8,8% |

## Requisitos de hardware

- VRAM/espacio en disco: 6,1 GB para el modelo de texto y 0,9 GB adicionales para los codificadores multimodales en `media/`.
- Hardware objetivo: Apple Silicon; el autor reporta ejecución en un Mac mini y validación en un Apple M1 Max.
- GPU recomendadas: no disponible para CUDA; la build está empaquetada para MLX y no se documenta soporte en A100, H100 ni RTX 4090.
- Cabe en consumer hardware de Apple Silicon con memoria unificada suficiente (los 7,5 GB del repo son un límite inferior razonable).
- Despliegue: servidor incluido en el paquete `d1a` (`python -m d1a.serving.serve --run mlx-community/d1a-e4b-it-8bit@v0.6 --port 8009`); requiere `pip install "d1a[serve,mlx,media] @ git+https://github.com/jonpol01/d1a"` y la dependencia jonpol01/d1a#261.
- Latencia y throughput: el tiempo de modelo es 1,01x el de la build de chat sin fusionar; no se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/d1a-e4b-it-8bit | 7.463.013.376 | no disponible | Decisión (clasificación probabilística) | Apache-2.0 | MLX, Apple Silicon |
| JohnP1/d1a-e4b-it | no disponible | no disponible | Decisión con adaptador sin fusionar (permite chat) | Apache-2.0 | Hugging Face |
| JohnP1/d1a-e4b-it-mlx-q8 | no disponible | no disponible | Decisión MLX 8-bit (build servida de referencia) | Apache-2.0 | MLX, Apple Silicon |
| Gemma 4 E4B-it | no disponible | no disponible | Generativo multimodal | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de clasificación alternativos en la información proporcionada.

## Limitaciones y advertencias

- Exceso de confianza en transferencia: en el conjunto transfer-v4 (ocho fuentes públicas excluidas del entrenamiento), la confianza media supera la precisión en 0,08 (ECE 0,081), con sesgo por fuente de -0,04 (qnli) a +0,25 (emotion); el 8,8% de las respuestas con confianza >= 0,9 son incorrectas.
- La calibración no se corrige con una temperatura global: la temperatura que ajustaría este conjunto (2,3 frente a la 1,55 servida) empeora 15 de los otros 21 conjuntos (jonpol01/d1a#361).
- El adaptador está fusionado: esta build no puede conversar; el texto generado no correspondería a Gemma 4 E4B-it.
- Token `<bos>` obligatorio: las peticiones codificadas sin el id 2 inicial quedan fuera de distribución.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí el riesgo de clasificación errónea con alta confianza.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial; los datos de JGLUE están bajo CC BY-SA 4.0 y los de hermes-agent bajo MIT, con el conjunto etiquetado de PRs en régimen privado.
- Dependencia de una revisión concreta del paquete `d1a` (jonpol01/d1a#261) para su ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/d1a-e4b-it-8bit
- Modelo base: https://huggingface.co/JohnP1/d1a-e4b-it
- Build MLX de referencia: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q8
- Repositorio de código: https://github.com/jonpol01/d1a
- Issue de calibración: https://github.com/jonpol01/d1a/issues/361#issuecomment-6874951783
- Dependencia de serving: https://github.com/jonpol01/d1a/pull/261
