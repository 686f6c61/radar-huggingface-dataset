# espetro/kev-9b-gguf

## Resumen

Kev 9B es un modelo de decisión ("System One") de estilo Jev: recibe un documento de estado y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad calibrada por pregunta en un único forward pass, sin generar texto. Este repositorio concreto, `espetro/kev-9b-gguf`, es un empaquetado GGUF en cuantización q8_0 que incluye la cabeza pointer y la temperatura de calibración ya integradas en el fichero (`dec.head_*` y metadatos `kev.*`), generado con la rama `kev` del fork `espetro/llama.cpp`.

El modelo subyacente es un backbone Qwen3.5-9B (revisión `68c46c4b` de `Qwen/Qwen3.5-9B-Base`) más un adaptador LoRA de rango 16 con 45,4 millones de parámetros entrenables y una cabeza pointer, según la documentación del proyecto original de Jared Palmer. Los pesos apuntan a 8.955.900.928 parámetros totales y el repositorio ocupa 9,5 GB, coherente con un empaquetado q8_0 de un modelo de ~9B.

Su relevancia radica en que sustituye la generación de texto por una interfaz tipada con contrato público (`/v1/systemone` de TypeSafe): en lugar de pedir una respuesta en lenguaje natural y parsearla, se solicitan campos con tipo (`choice`, etc.) y criterios, y el modelo devuelve probabilidades. Esto lo hace adecuado para enrutado, clasificación y decisiones automatizadas donde la calibración importa más que la fluidez. El fichero sigue cargando en llama.cpp estándar como un Qwen3.5 corriente, ignorando los tensores de la cabeza.

Nota de consistencia: la model card titula "Kev 9B" pero el cuerpo del texto describe "Kev-0.8B". Dado el recuento real de parámetros (8,96B) y el tamaño del repo (9,5 GB), el artefacto empaquetado es el de 9B; la mención a 0.8B en el cuerpo parece un residuo de copia entre fichas de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-9B) + adaptador LoRA (r=16, 45,4M parametros entrenables) + cabeza pointer de decision |
| Parametros totales | 8.955.900.928 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (unico empaquetado en este repo; q4 desaconsejado por el autor por deriva de calibracion) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con tensores `dec.head_*` y metadatos `kev.*` embebidos |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer denso Qwen3.5-9B al que se le añade una cabeza pointer entrenada que proyecta el estado oculto sobre las opciones de cada pregunta tipada, devolviendo una distribución de probabilidad en lugar de tokens. El ajuste se realiza mediante un adaptador LoRA de rango 16 (45,4 millones de parámetros entrenables) sobre el backbone base, más la cabeza y una temperatura de calibración que queda horneada en el GGUF final. El modo de operación es de un solo forward pass para todas las preguntas del documento de estado, sin bucle de decodificación autorregresiva.

El paquete GGUF fue producido con `tools/kev/kev_pack.py` de la rama `kev` de `espetro/llama.cpp`, a partir del bundle gojev de `taigrr/kev-9b-gguf` (checkpoint `jaredpalmer/kev-9b`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon fases de RLHF o DPO. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal) porque el modelo no decodifica texto en su modo principal.

La innovación destacable es operativa: el contrato tipado con probabilidades calibradas y la posibilidad de cargar el mismo fichero en llama.cpp estándar (como Qwen3.5 corriente) o en el fork con soporte de decisión, que expone automáticamente `/v1/systemone` y `/studio` mediante `llama-server -hf` o la utilidad `llama-decide`.

## Capacidades

- Decisión tipada: dado un estado y una o varias preguntas con tipo y criterios, devuelve una distribución de probabilidad por pregunta en un único forward pass.
- Preguntas de tipo `choice` con criterios y descripciones de cada opción, orientadas a enrutado y clasificación.
- Calibración de probabilidades, con temperatura ajustada e integrada en el empaquetado GGUF.
- Ejecución en servidor compatible con endpoints estilo OpenAI vía el fork con soporte Kev (`llama-server`, `/v1/systemone`, `/studio`).
- Ejecución por línea de comandos con `llama-decide` aceptando ficheros JSON de petición.
- Ejecución en navegador mediante build WASM de llama.cpp (según el autor, carga diferida del fichero).
- Compatibilidad de carga como modelo Qwen3.5 ordinario en llama.cpp estándar (los tensores de cabeza y metadatos `kev.*` se ignoran).
- Generación de texto: solo de forma indirecta, al cargar el fichero como un Qwen3.5 normal; no es la función para la que está ajustado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales o de audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: se envía el texto del ticket como estado y una pregunta `choice` con criterios por equipo (por ejemplo, `returns` frente a `shipping`); el modelo devuelve la probabilidad de cada cola y se puede fijar un umbral para derivar automáticamente o enviar a revisión humana.
- Triaje y priorización en colas de trabajo: el estado es el historial del caso y la pregunta tipada asigna severidad o urgencia; al ser probabilidades calibradas, se pueden ordenar los casos por riesgo en lugar de por etiqueta dura.
- Clasificación de correo o mensajes entrantes: con un conjunto de preguntas tipadas se obtienen simultáneamente categoría, intención y necesidad de intervención humana, todo en un solo forward pass.
- Moderación y cumplimiento: decisión sobre si un contenido incumple una política, con criterios explícitos en la definición de cada opción, lo que facilita auditar por qué se tomó la decisión.
- Codificación de encuestas y texto libre: transformar respuestas abiertas en categorías predefinidas con distribución de probabilidad, útil cuando la asignación forzosa a una única etiqueta pierde información.
- Enrutado en pipelines RAG: elegir entre recuperadores, fuentes o plantillas de respuesta según la consulta, usando la probabilidad como señal para decidir si hace falta una segunda recuperación.
- Selección de política en agentes: ante un estado de conversación o de entorno, elegir la siguiente acción entre un conjunto discreto de herramientas o rutas, manteniendo la distribución para desambiguar casos límite.
- Evaluación comparativa interna: servir como clasificador de referencia calibrado frente a otros modelos en un conjunto de decisión propio, aprovechando el contrato tipado para evitar parseo de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las búsquedas web mencionan dos conjuntos de evaluación asociados al proyecto —JevBench y Public8— y una comparación pública frente a `oraculumai/Manchego`, pero no se proporcionan valores numéricos para este empaquetado.

| Benchmark | Resultado |
|---|---|
| JevBench | no disponible |
| Public8 | no disponible |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en q8_0: en torno a 10-12 GB considerando ~9,5 GB de pesos más overhead de contexto y buffers (estimación basada en el tamaño del fichero; no es un dato publicado).
- Cuantizaciones distintas de q8_0: el autor indica que q4 deriva lo suficiente como para romper la calibración, por lo que no se recomienda para uso en producción del modo decisión.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM para q8_0 (RTX 4080/4090, RTX 3090, A10, L4, A100, H100). En GPUs de 16 GB el margen es ajustado según la longitud de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con holgura; en 16 GB conviene verificar la longitud de contexto real utilizada.
- CPU y memoria unificada: al ser GGUF, es desplegable en llama.cpp sobre CPU o Apple Silicon con memoria unificada suficiente (16 GB o más para q8_0).
- Navegador: el autor indica que el build WASM carga este fichero con aproximadamente 1 GB vivo. Esa cifra es inconsistente con un empaquetado q8_0 de ~9B y ~9,5 GB de pesos, por lo que debe tratarse con cautela o verificarse contra el artefacto real.
- Opciones de despliegue: `llama-server -hf espetro/kev-9b-gguf` y `llama-decide -hf espetro/kev-9b-gguf --json request.json` con el fork `espetro/llama.cpp` (rama `kev`); llama.cpp estándar para carga como Qwen3.5 ordinario; build WASM en navegador. vLLM, TGI y Ollama no están documentados para el modo decisión, que depende de la cabeza pointer y de los metadatos `kev.*`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| espetro/kev-9b-gguf | 8,96B | no disponible | GGUF q8_0 con cabeza integrada | Apache-2.0 (runtime MIT, bundle 0BSD) | Empaquetado listo para llama.cpp con fork Kev |
| jaredpalmer/kev-9b (checkpoint original) | 9B + LoRA r=16 (45,4M entrenables) | no disponible | safetensors / adaptador | Apache-2.0 | Fuente del ajuste, sin empaquetar para llama.cpp |
| taigrr/kev-9b-gguf (bundle gojev) | 9B | no disponible | GGUF | 0BSD (bundle) | Origen directo del empaquetado de espetro |
| oraculumai/Manchego | no disponible | no disponible | no disponible | no disponible | Citado en las busquedas como comparable en JevBench y Public8; se declara a la par de Kev-9B salvo en los cuatro datasets Public8 de entrenamiento de Kev |

La familia Kev se distribuye en variantes de 0,8B, 4B y 9B sobre Qwen3.5, según las fuentes secundarias consultadas. No se dispone de datos de contexto ni de rendimiento numérico para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo en su modo principal: no produce texto, sino distribuciones de probabilidad sobre preguntas tipadas. Usarlo como chatbot requiere cargarlo como Qwen3.5 corriente, lo que descarta la cabeza entrenada.
- La calibración depende de la cuantización. El propio autor advierte que q4 rompe la calibración; solo q8_0 está recomendado, lo que limita el ahorro de memoria.
- Inconsistencia documental en la model card: el título indica 9B y el cuerpo menciona 0.8B. Verificar el artefacto antes de integrarlo en producción.
- La cifra de "~1 GB vivo" para el build WASM no es coherente con un GGUF q8_0 de ~9B y conviene validarla empíricamente.
- El modo decisión requiere el fork `espetro/llama.cpp` (rama `kev`); no hay soporte documentado en vLLM, TGI u Ollama, lo que reduce las opciones de despliegue estándar.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad, por lo que no se puede acotar el riesgo de comportamiento sesgado en dominios sensibles.
- Riesgo de alucinación: al no generar texto libre, el riesgo se traslada a decisiones mal calibradas o a sobreconfianza en las probabilidades cuando el estado de entrada queda fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados: no hay garantía de comportamiento calibrado fuera del idioma o idiomas de entrenamiento.
- Restricciones de licencia: los pesos y la cabeza son Apache-2.0, el runtime del fork es MIT y el bundle de origen es 0BSD; antes de uso comercial conviene verificar la cadena completa de licencias y la licencia del backbone Qwen3.5-9B-Base.
- Uso en dominios regulados (crédito, salud, empleo): sin evaluación de equidad ni métricas publicadas, no debería emplearse como decisor autónomo sin revisión humana.

## Enlaces

- HuggingFace (este empaquetado): https://huggingface.co/espetro/kev-9b-gguf
- Checkpoint original: https://huggingface.co/jaredpalmer/kev-9b
- Bundle de origen (gojev): https://huggingface.co/taigrr/kev-9b-gguf
- Repositorio del proyecto: https://github.com/jaredpalmer/kev
- Model card de Kev-9B: https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-9b.md
- Fork de llama.cpp con soporte Kev: https://github.com/espetro/llama.cpp
- Demo en navegador (WASM): https://espetro.github.io/llama.cpp/
- Ficha tecnica en gradually.ai: https://www.gradually.ai/en/ai-models/kev-9b/
- Analisis en explainx.ai: https://www.explainx.ai/blog/kev-open-source-jev-clone-qwen35-family-2026
- Modelo comparable citado (Manchego): https://huggingface.co/oraculumai/Manchego
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
