# flymy-ai/decision-4b-v1.4

## Resumen

Decision 4B v1.4 (nombre interno FlyMyJev-4B, en estado de preview) es un adaptador LoRA sobre Qwen/Qwen3.5-4B desarrollado por FlyMy.AI que convierte la decisión en un problema de clasificación sobre un conjunto cerrado de opciones. El modelo recibe un estado (un ticket, una política junto con un caso, un log, una respuesta que hay que juzgar) y una pregunta con las respuestas posibles declaradas explícitamente; en una única pasada hacia delante devuelve una distribución de probabilidad sobre cada opción. No genera texto libre: la etiqueta de salida no puede salirse del conjunto declarado.

El adaptador tiene 14,4 millones de parámetros entrenables (LoRA de rango 16, alpha 32) sobre una base de 4 000 millones de parámetros, con una ventana de entrada de hasta 16 384 tokens y licencia Apache-2.0 tanto del adaptador como del modelo base. Cubre tres tipos de petición: sí/no (`noul`), elección entre opciones (`choice`) y puntuación (`score`), cada uno con su propia temperatura de lectura.

Resulta relevante porque propone un patrón distinto al del asistente generativo: decisiones auditables, con salida restringida por construcción, latencias de decenas de milisegundos (p50 18,3 ms en una RTX 4090) y calibración medida sobre el conjunto público (ECE 0,071). El proyecto se declara independiente: no es un lanzamiento de TypeSafe, no está afiliado a esa empresa y no reconstruye la implementación cerrada de Jev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; la base declara dos tipos de capa y el adaptador se aplica a las proyecciones de atención de ambos (q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj) |
| Parámetros totales | ~4 000 M del modelo base + 14,4 M del adaptador LoRA |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 16 384 tokens de entrada |
| Tipos de cuantización | no disponible (no se documentan recetas de cuantización en la información proporcionada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-4B, fijado a la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El adaptador tiene rango 16, alpha 32 y dropout 0,05, y se aplica a las proyecciones de atención de los dos tipos de capa de la base. La presencia de proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`, junto con el requisito de compilar los kernels Triton de flash-linear-attention en la primera petición, apunta a que la base combina capas de atención lineal con capas de atención estándar; la información disponible no detalla la proporción ni el diseño exacto de ese híbrido.

El prompt es la plantilla de chat con el modo thinking desactivado y un único mensaje de usuario en JSON con evidencia, criterio y opciones (descripciones con el formato `"<clave>: <texto>"`, y en las de sí/no el `true` antes del `false`, siguiendo el formato de SemIf, MIT). La lectura no usa el head de lenguaje: se proyecta en fp32 el estado oculto del último token del prompt y se aplica softmax sobre los logits de las letras de opción, con temperatura 1,40 para `choice` y `score` y 0,40 para `noul` (sí/no). Al cargar, el LoRA se pliega dentro de la base y se captura un grafo CUDA por cada longitud de entrada con padding.

El entrenamiento es una única ejecución (`qwen35_4b_letter_h12_v66c`), sin mezcla de runs ni ensembles: 2 épocas, 996 pasos de como máximo 12 288 tokens con padding (11,1 millones de tokens), lr 3e-05 con warm-up y decaimiento coseno, entropía cruzada sobre los logits de letra de opción, opciones de tipo `choice` barajadas en cada pasada y semilla 99. Los datos son propios más conjuntos públicos con licencia revisada; no se usó ningún ítem de JevBench ni ninguna salida de Jev para entrenar, ajustar o seleccionar el modelo. La forma de la receta sigue JevK5 v0.2 (allebee/jevk5, Apache-2.0).

## Capacidades

- Decisión de conjuntos cerrados en una sola pasada: devuelve una distribución de probabilidad sobre exactamente las opciones declaradas, sin generar texto.
- Tres tipos de petición: `noul` (sí/no), `choice` (elección entre alternativas con letra y descripción) y `score` (puntuación).
- Salida restringida por construcción: una etiqueta fuera del conjunto declarado no puede aparecer.
- Procesamiento de estados largos: admite entradas de hasta 16 384 tokens, lo que permite incluir políticas extensas, logs o casos completos en el mismo prompt.
- Calibración explícita: la probabilidad devuelta está pensada como probabilidad utilizable, no solo como ranking (ECE 0,071 en el tier hard público, con la temperatura servida).
- Abstención: el conjunto de familias de evaluación propia incluye una familia de abstention que pasa de 60 a 95 aciertos tras el entrenamiento.
- Juicio de respuestas: familia propia de answer judging, aunque es una de las que empeora respecto a la base congelada (55 → 45 sobre 20 ítems).
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés (`en`).
- Tool calling, function calling, agentes multi-paso, visión o audio: no documentados en la información proporcionada.
- No hay modo thinking: el prompt se construye explícitamente con el thinking desactivado.

## Casos de uso

- Triaje de tickets de soporte: dado el texto del ticket y una lista de categorías o de colas declaradas, el modelo devuelve la probabilidad de cada una en una sola pasada, lo que permite enrutar con umbral y derivar a revisión humana cuando la distribución es plana. La latencia de p50 18,3 ms hace viable el enrutado en línea.
- Aprobación de reembolsos y excepciones de política: el caso de uso que aparece en la propia model card. Se pasa la política, los datos del pedido y la pregunta de sí/no; la salida es una probabilidad de `true`/`false` con temperatura baja para que la respuesta se comprometa cuando el modelo se inclina hacia un lado.
- Cumplimiento normativo y auditoría de políticas: verificar si un caso concreto cumple una política extensa aprovechando la ventana de 16 384 tokens, con la ventaja de que la decisión es una distribución reproducible y registrable en lugar de un texto generado.
- Evaluación de respuestas de otros modelos (LLM-as-judge con escala cerrada): usar el tipo `score` para asignar una puntuación de un conjunto finito a una respuesta, con la distribución completa como medida de confianza y no solo la etiqueta ganadora.
- Moderación y clasificación de contenido con taxonomía fija: cuando las categorías están predefinidas y no se puede permitir una etiqueta inventada, la restricción estructural de la salida elimina la clase de error más habitual de los generadores.
- Etiquetado de logs y alertas de seguridad: con contexto largo se puede incluir la traza completa o el log y preguntar por la clasificación o por la presencia de un patrón, con una sola pasada por evento en lugar de una generación autoregresiva.
- Filtro previo en pipelines de agentes: actuar como System 1 barato antes de invocar un modelo generativo grande, decidiendo si una petición merece escalarse, qué herramienta corresponde o si debe rechazarse, lo que reduce coste y latencia en el camino caliente.
- Puerta de calidad en generación de código o de texto: juzgar si una salida cumple un criterio declarado antes de publicarla o de integrarla en CI, usando la distribución para fijar un umbral de aceptación.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos por él mismo sobre la misma GPU, en la misma sesión y con el mismo prompt; los cambios están emparejados (ítems arreglados / rotos). El tier de juez de JevBench y su conjunto sellado no son públicos y no se incluyen.

| Conjunto | Qwen3.5-4B congelado | Decision 4B v1.4 | Arreglados / rotos | Referencia |
|---|---:|---:|---:|---|
| JevBench público, hard (111) | 60,4 | 75,7 | 24 / 7 | Jev 1.13: 74,1 en el tier hard completo (220 ítems, 109 reservados) |
| JevBench público, standard (72) | 97,2 | 100,0 | 2 / 0 | no disponible |
| JevBench público, easy (48) | 97,9 | 100,0 | 1 / 0 | no disponible |
| JevBench público, los 231 | 79,7 | 88,3 | 27 / 7 | Jev 1.13: 86,6 |
| Conjunto dev hard propio (160, 8 familias) | 42,5 | 65,0 | 51 / 15 | Jev 1.13: 57,5 |
| Conjuntos de casos reales propios v1-v3 (407) | 88,9 | 89,7 | 17 / 14 | Jev 1.13: 94,6 / 97,8 / 98,9 en v1 / v2 / v3 |

Desglose del conjunto dev hard por familia (congelado → este modelo, 20 ítems por familia):

| Familia | Qwen3.5-4B congelado | Decision 4B v1.4 |
|---|---:|---:|
| Decisiones de fecha y número | 10 | 60 |
| Trampas adversarias | 50 | 95 |
| Abstención | 60 | 95 |
| Robustez ante paráfrasis | 55 | 85 |
| Búsquedas multi-salto | 30 | 50 |
| Compromisos entre opciones | 25 | 45 |
| Juicio de respuestas | 55 | 45 |
| Políticas largas | 55 | 45 |

Calibración en el tier hard público con la temperatura servida: ECE 0,071 y fidelidad a las distribuciones gold exactas de 86,3 (1 menos la distancia de variación total media).

Métricas de servicio declaradas: p50 18,3 ms y p95 21,5 ms por decisión corta en una RTX 4090 (24 ms en modo eager), con la misma respuesta que la ruta eager en 120 de 120 ítems comprobados. Throughput agregado: no disponible.

Advertencia de higiene incluida por el autor: en el conjunto de casos reales v3, el gold está en la opción A en el 46 % de los ítems de tipo `choice`, lo que favorece a la base congelada por su hábito de primera opción y penaliza al modelo entrenado; los resultados de v3 deben leerse con esa cautela.

## Requisitos de hardware

- Estimación de VRAM para el modelo base de 4 000 M de parámetros (no publicada por el autor): en bf16/fp16 en torno a 8-9 GB de pesos, más activaciones y caché KV para entradas de hasta 16 384 tokens; en int8 alrededor de 4-5 GB; en int4 alrededor de 2,5-3 GB. Estas cifras son estimaciones a partir del tamaño, no medidas declaradas.
- El adaptador LoRA suma 14,4 M de parámetros, un coste despreciable; el repositorio completo ocupa 0,1 GB. Al cargar, el LoRA se pliega dentro de la base.
- GPU medida por el autor: una RTX 4090, con p50 18,3 ms y p95 21,5 ms por decisión corta. No se publican mediciones en A100, H100, L40S ni otras GPUs.
- Cabe en GPU de consumo: una RTX 4090 es suficiente para el escenario medido; con cuantización a 8 bits o menos, el modelo base debería caber en tarjetas de 8-12 GB, aunque no se documenta ninguna receta de cuantización.
- Ejecución en CPU disponible mediante `FLYMYJEV_DEVICE=cpu`, descrita por el autor como lenta y sin grafos CUDA.
- Requisito de despliegue específico: hace falta un compilador de C en tiempo de ejecución (por ejemplo `build-essential`), porque los kernels Triton de flash-linear-attention se compilan en la primera petición y la captura de grafos CUDA en la carga también los necesita.
- Restricción de carga: `model.load()` verifica cada fichero contra `manifest.json` y rechaza enlaces simbólicos, por lo que una instantánea de la caché de Hugging Face (cuyos ficheros son enlaces a `blobs/`) debe copiarse antes a un directorio real, por ejemplo con `huggingface-cli download --local-dir`.
- Opciones de despliegue documentadas: el propio `model.py` del repositorio, un `server.py` que sirve el formato de cable `/v1/systemone` de TypeSafe para el adaptador `typesafe`, un adaptador en proceso (`jevbench_adapter.py`) y un ejecutor de JevBench (`run_jevbench.py`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada; además, al no ser un modelo generativo, los stacks de decodificación estándar no encajan directamente.
- Latencia: p50 18,3 ms / p95 21,5 ms por decisión corta en RTX 4090 con grafos CUDA (24 ms en eager). Throughput y latencia con lotes grandes: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench público hard (111) | JevBench público total (231) | Dev hard propio (160) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Decision 4B v1.4 | ~4 000 M + 14,4 M de LoRA | 16 384 tokens | 75,7 | 88,3 | 65,0 | Apache-2.0 | Pesos en Hugging Face (adaptador PEFT) |
| Qwen3.5-4B congelado | ~4 000 M | no disponible en esta información (la ventana usada por el adaptador es de 16 384) | 60,4 | 79,7 | 42,5 | Apache-2.0 | Pesos en Hugging Face |
| Jev 1.13 | no disponible | no disponible | 74,1 en el tier hard completo de 220 ítems (109 reservados), no directamente comparable con la columna de 111 | 86,6 | 57,5 | no disponible (implementación cerrada) | Cerrado, no distribuido |

Nota de comparabilidad: los resultados de Jev 1.13 sobre el tier hard completo (220 ítems, con 109 reservados) y los de Decision 4B v1.4 sobre el subconjunto público (111 ítems) se miden sobre particiones distintas, según advierte el propio autor, que además declara no hacer ninguna afirmación sobre un rango en JevBench. En los conjuntos de casos reales propios, Jev 1.13 supera a este modelo (94,6 / 97,8 / 98,9 frente a un agregado de 89,7 en v1-v3). No se dispone de comparaciones con otros modelos de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: solo emite una distribución sobre las opciones declaradas. No sirve para respuestas abiertas, resúmenes ni redacción.
- El conjunto de respuestas debe declararse por completo antes de la inferencia; una opción no declarada no puede aparecer como salida.
- Solo inglés declarado. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación acotado por diseño (la etiqueta no puede salirse del conjunto), pero la probabilidad asignada puede estar mal calibrada fuera de la distribución de entrenamiento. La calibración declarada (ECE 0,071) se midió sobre el tier hard público, no sobre datos arbitrarios de producción.
- Dos familias del conjunto dev hard empeoran respecto a la base congelada: juicio de respuestas (55 → 45) y políticas largas (55 → 45). El entrenamiento no mejora de forma uniforme.
- En casos reales, la mejora agregada es pequeña frente a la base (88,9 → 89,7 en 407 ítems, con 17 arreglados y 14 rotos). El autor señala además que el conjunto v3 tiene el gold en la opción A en el 46 % de los ítems de tipo `choice`, sesgo que favorece a la base.
- Las temperaturas de lectura (1,40 para `choice` y `score`, 0,40 para `noul`) se ajustaron sobre datos propios de calibración y dev, no sobre ítems de benchmark; un cambio de temperatura altera la interpretación de las probabilidades.
- Las cifras de JevBench proceden de mediciones del propio autor sobre la parte pública. El tier de juez y el conjunto sellado no son públicos, y el autor no reclama ninguna posición en un ranking de JevBench.
- Estado de preview: 0 descargas y 0 likes en el momento de la consulta, sin validación externa publicada.
- Proyecto independiente, sin afiliación con TypeSafe y sin relación con la implementación cerrada de Jev.
- Requisitos operativos que complican el despliegue: compilador de C en tiempo de ejecución, compilación de kernels Triton en la primera petición, captura de grafos CUDA por cada longitud de entrada con padding y rechazo de enlaces simbólicos en la carga.
- Licencia Apache-2.0 tanto en el adaptador como en la base, sin restricciones declaradas de uso comercial. El formato de prompt de SemIf se cita como MIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flymy-ai/decision-4b-v1.4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Versión anterior de la familia: https://huggingface.co/flymy-ai/decision-4b-v1.2
- Organización en Hugging Face: https://huggingface.co/flymy-ai
- Sitio del autor: https://flymy.ai/
- Repositorio de ejemplo del autor: https://github.com/FlyMyAI/build-with-flymyai
- Organización en GitHub: https://github.com/FlyMyAI/
- Receta de referencia citada: `allebee/jevk5` (JevK5 v0.2, Apache-2.0), disponible en Hugging Face
- Referencia externa citada por el autor: SemIf (formato de prompt, MIT) y Jev 1.13 (implementación cerrada, sin enlace público)
- Paper o blog técnico del modelo: no disponible en la información proporcionada
