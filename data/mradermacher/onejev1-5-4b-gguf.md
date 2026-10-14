# mradermacher/OneJev1.5-4B-GGUF

## Resumen

OneJev1.5-4B es un modelo de decisión multimodal de la familia OneJev, desarrollado por OmniJev y publicado originalmente en el repositorio `OmniJev/OneJev1.5-4B`. La ficha que nos ocupa, `mradermacher/OneJev1.5-4B-GGUF`, es una cuantización estática en formato GGUF realizada por mradermacher (nethype GmbH) a partir de los pesos originales. El modelo se presenta como un "System One decision model" (modelo de decisión de sistema 1) que devuelve probabilidades calibradas para preguntas tipadas sobre capturas de pantalla, fotografías, vídeos y texto en un único forward pass.

La propuesta es inusual: en lugar de generar texto libre, el modelo está orientado a emitir respuestas con confianza calibrada, lo que lo hace relevante para pipelines de agentes, verificación automática y toma de decisiones donde se necesita una medida de incertidumbre fiable. La familia OneJev se ofrece en cuatro tamaños (0.8B, 4B, 9B y 27B), y esta variante concreta tiene 4.841.450.496 parámetros totales (aproximadamente 4,84B).

El repositorio GGUF incluye tanto los ficheros de cuantización del modelo de lenguaje como los ficheros `mmproj` necesarios para el procesamiento multimodal (visión y vídeo). El modelo base se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para inglés. El contexto máximo, la composición del dataset de entrenamiento y los detalles de alineación no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrita por el autor como "multimodal System One decision model") |
| Parametros totales | 4.841.450.496 (4,84B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base esta en transformers/safetensors |

## Arquitectura y entrenamiento

El autor describe OneJev como un "multimodal System One decision model" que devuelve probabilidades calibradas para preguntas tipadas sobre capturas de pantalla, fotografías, vídeos y texto en un único forward pass. Esto sugiere un transformer multimodal con una cabeza de clasificación o puntuación calibrada, pero no se especifica la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, tipo de encoder visual, etc.). Tampoco se detalla cómo se integra la modalidad de vídeo ni qué componente procesa cada entrada.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). Los datos aportados se limitan a la naturaleza del modelo (decisión con calibración), sus modalidades de entrada y sus tamaños de familia. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Decision multimodal con calibracion: el modelo devuelve probabilidades calibradas en lugar de (o ademas de) texto generado, para preguntas tipadas.
- Entrada de capturas de pantalla: orientado explicitamente a tareas de GUI agent.
- Entrada de fotografias e imagenes.
- Entrada de video.
- Entrada de texto.
- Procesamiento en un unico forward pass por consulta.
- Multilingue: no, solo ingles segun las etiquetas del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes GUI (automatizacion de interfaces): el modelo puede evaluar capturas de pantalla y responder preguntas tipadas sobre el estado de la interfaz con una probabilidad calibrada, lo que permite decidir si continuar, reintentar o abortar una accion en un bucle de agente.
- Verificacion de acciones en pipelines de automatizacion: al devolver una probabilidad, se puede fijar un umbral de confianza para aceptar o rechazar automaticamente el resultado de un paso intermedio sin intervencion humana.
- Enrutamiento con umbrales de confianza: en un sistema con varios modelos o herramientas, OneJev puede actuar como clasificador de decision y derivar la consulta a otro componente cuando la probabilidad cae por debajo de un umbral.
- Analisis de imagenes en control de calidad: dado que acepta fotografias, puede responder preguntas tipadas sobre presencia, estado o categoria de un objeto con una puntuacion calibrada.
- Comprension de video para vigilancia o monitorizacion: el soporte de video permite plantear consultas tipadas sobre secuencias y obtener una respuesta probabilistica por fotograma o por clip.
- Moderacion y deteccion asistida: la salida calibrada permite fijar politicas de decision ajustables (por ejemplo, revision humana cuando la confianza esta en una banda intermedia).
- Asistencia en anotacion de datos: usar la probabilidad calibrada como señal de pre-etiquetado y priorizar las muestras de baja confianza para revision manual.
- Evaluacion de capturas de pantalla en soporte tecnico: el modelo puede responder preguntas tipadas sobre lo que aparece en una captura enviada por un usuario y devolver una confianza asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun el tamano de los ficheros GGUF publicados (solo pesos, sin cache KV ni overhead del runtime):
  - Q2_K: 2,2 GB
  - Q3_K_S: 2,4 GB; Q3_K_M: 2,6 GB; Q3_K_L: 2,8 GB
  - IQ4_XS: 3,0 GB; Q4_K_S: 3,0 GB; Q4_K_M: 3,2 GB
  - Q5_K_S: 3,5 GB; Q5_K_M: 3,6 GB
  - Q6_K: 4,1 GB
  - Q8_0: 5,3 GB
  - f16: 9,8 GB
- Componente multimodal adicional: mmproj-Q8_0 (0,5 GB) o mmproj-f16 (0,8 GB), imprescindible para tareas de vision/video.
- GPU consumer: si, cabe con holgura. Con cuantizaciones Q4_K_M o Q5_K_M y el mmproj correspondiente el consumo ronda los 3,7-4,4 GB de pesos, por lo que entra en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070, etc.). Las cuantizaciones Q8_0 y f16 requieren 6-11 GB y encajan en RTX 4070/4080/4090 o superiores.
- GPU de datacenter: A100, H100 y similares no son necesarias para este tamano; se usarian solo por agregacion de muchas instancias en un mismo servidor.
- Despliegue: al tratarse de un repositorio GGUF, las opciones naturales son llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. Para vLLM o TGI habria que partir del modelo base `OmniJev/OneJev1.5-4B` en formato transformers/safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar variantes dentro de la propia familia OneJev anunciada por el autor (0.8B, 4B, 9B y 27B). No se han proporcionado datos de rendimiento, contexto ni licencia de esas variantes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OneJev1.5-4B (GGUF de mradermacher) | 4,84B | no disponible | apache-2.0 | GGUF en HuggingFace | Objeto de esta ficha; incluye mmproj para vision/video |
| OneJev 0.8B | no disponible | no disponible | no disponible | anunciado en el repositorio de OmniJev | Variante menor de la familia |
| OneJev 9B | no disponible | no disponible | no disponible | anunciado en el repositorio de OmniJev | Variante mayor de la familia |
| OneJev 27B | no disponible | no disponible | no disponible | anunciado en el repositorio de OmniJev | Variante mayor de la familia |

Comparativa con alternativas externas de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles (`language: en`); no hay soporte multilingue documentado, por lo que su uso en castellano no esta garantizado.
- No hay informacion publica sobre sesgos, datos de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que impide evaluar riesgos de sesgo de forma rigurosa.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de decision con salida probabilistica, la calibracion reportada por el autor deberia validarse empiricamente antes de confiar en umbrales de produccion.
- Al ser un "decision model" orientado a probabilidades calibradas, no debe asumirse que genera texto libre de calidad; las expectativas de uso deben ceñirse a preguntas tipadas.
- La longitud de contexto no esta documentada, lo que limita el diseno de aplicaciones que dependan de ventanas largas (por ejemplo, video extenso o dialogos multi-turno prolongados).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `OmniJev/OneJev1.5-4B` y de los posibles componentes (encoder visual) por si tuvieran condiciones adicionales.
- Este repositorio es una cuantizacion de terceros: no ha sido producida por el autor original del modelo, y las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable.
- No se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion, solo cuantizaciones estaticas, segun indica el propio autor.
- El numero de descargas (80) y de "likes" (0) es muy bajo, lo que sugiere una adopcion escasa y poca validacion independiente de su comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneJev1.5-4B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev1.5-4B
- Repositorio GitHub de OmniJev: https://github.com/OmniJev/OneJev
- Pagina de resumen de cuantizaciones de mradermacher para este modelo: https://hf.tst.eu/model#OneJev1.5-4B-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio de nethype GmbH: https://www.nethype.de/
