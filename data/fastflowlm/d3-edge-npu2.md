# FastFlowLM/D3-Edge-NPU2

## Resumen

D3-Edge-NPU2 es un modelo de decisión ("System One") derivado de vllm-sr/d3-edge (Decision 3.0, el modelo de decisión del enrutador semántico de vLLM), adaptado por FastFlowLM para ejecutarse en las NPU de los procesadores AMD Ryzen AI. No es un modelo conversacional: responde preguntas de elección, sí/no y puntuación sobre un estado dado, devolviendo una probabilidad para cada opción a través de la API `POST /v1/systemone`. Está pensado para enrutamiento, clasificación zero-shot y toma de decisiones rápida y determinista en el borde.

Arquitectura y tamaño: parte de Qwen3.5-0.8B recortado a 12 capas (revisión `c454ee39`), con una torre de texto cuantizada a formato Q4NX de FastFlowLM y una torre de visión heredada de Qwen3.5-0.8B (incluido el merger). El paquete ocupa 0,6 GB y admite hasta 32.768 tokens de entrada por pregunta, con soporte opcional de imágenes (PNG, JPEG o WebP, hasta 8 MB y 16 MP por imagen, reescaladas a 1,6 MP).

Su relevancia actual radica en que ofrece inferencia de decisión de baja latencia (60 ms para 128 tokens, 1,0 s para 4.096 tokens) directamente en la NPU XDNA 2 de Strix Halo, sin GPU dedicada, con una pérdida de precisión no medible frente al modelo BF16 original (+2,6 pt en la muestra del Decision Index, con error estándar de 1,1 pt) y una concordancia top-1 del 93,8 % en preguntas de elección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B, recortado a 12 capas; incluye Gated DeltaNet y torre de visión de Qwen3.5-0.8B (con merger) |
| Parametros totales | no disponible (el modelo base es de 0,8B; el recorte a 12 capas reduce el total, pero no se indica la cifra exacta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens de entrada por pregunta; las peticiones que lo superan se rechazan con `max_length_exceeded` (sin truncado) |
| Tipos de cuantizacion | Q4NX: proyecciones Q4_K con redondeo calibrado por GPTQ (192 prompts sintéticos de System One), embeddings de tokens Q8_0, normas y parámetros de Gated DeltaNet sin cuantizar; torre de visión en `vision_weight.q4nx` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (formato propio de FastFlowLM); `readout.safetensors` sin cambios respecto al upstream |

## Arquitectura y entrenamiento

El modelo es un derivado del Decision 3.0 de vLLM Semantic Router, construido sobre la arquitectura Qwen3.5-0.8B recortada a 12 capas. Conserva la torre de visión del modelo base (Qwen3.5-0.8B, merger incluido) para preguntas con imágenes, y mantiene intactos los ficheros de contrato del upstream: `readout.safetensors`, `decision_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `LICENSE`, verificados byte a byte mediante `MANIFEST.sha256`. Los prompts, los ids de token y los objetos de respuesta siguen el runtime upstream.

La adaptación de FastFlowLM se centra en la cuantización: las proyecciones de la torre de texto se convierten a Q4_K con redondeo calibrado por GPTQ usando 192 prompts sintéticos de System One (ninguno del Decision Index), los embeddings de tokens a Q8_0, y se dejan sin cuantizar las normas y los parámetros de Gated DeltaNet. No se documenta en la información disponible un proceso adicional de entrenamiento (RLHF, DPO) ni el volumen o composición del dataset de preentrenamiento del modelo base; los datos de calibración son los únicos mencionados. La innovación destacable es la ejecución en la NPU XDNA 2 mediante FastFlowLM 1.0.12 o superior, con un kernel de atención específico para la NPU a partir de 1.536 tokens.

## Capacidades

- Clasificación zero-shot y decisión: responde preguntas de tipo elección (con criterios y opción nula), sí/no y puntuación sobre un estado, devolviendo una probabilidad por opción.
- Procesamiento de imágenes: acepta una lista `images` de data URLs base64 (PNG, JPEG, WebP), compartida por todas las preguntas de la petición; cada imagen hasta 8 MB y 16 MP, reescalada a 1,6 MP.
- Preguntas múltiples por petición: hasta 16 preguntas en una sola llamada (medido con 330 tokens cada una).
- Contexto largo: hasta 32.768 tokens de entrada por pregunta, con rechazo explícito (HTTP 422 / `max_length_exceeded`) si se supera.
- API compatible: mismo contrato `POST /v1/systemone` que el paquete upstream, con prompts, ids y respuestas idénticos.
- Sin soporte de vídeo: una petición con `videos` se rechaza con HTTP 422.
- No se documentan en la información disponible capacidades de tool calling, agentes, generación de texto libre ni modo thinking.

## Casos de uso

- Enrutamiento de peticiones en un router semántico: el modelo decide a qué ruta (por ejemplo, "returns", "billing" o "general") pertenece una consulta de usuario, con una probabilidad por opción; es su función nativa y se integra vía `POST /v1/systemone`.
- Clasificación zero-shot de tickets de soporte: dada una descripción como "el pedido llegó dañado", asigna la categoría adecuada entre criterios definidos, con latencia de decenas de milisegundos para prompts cortos (60 ms con 128 tokens).
- Filtrado y moderación previa: preguntas de sí/no sobre un texto (por ejemplo, si contiene datos personales o lenguaje inapropiado) antes de enviarlo a un modelo mayor, aprovechando la inferencia local en NPU.
- Clasificación de documentos largos: con hasta 32.768 tokens de contexto, puede evaluar contratos, informes o hilos completos sin truncado; a 16.384 tokens la latencia mediana es de 6,0 s y a 31.545 tokens, de 16 s.
- Decisión multimodal en el borde: con una imagen de 1024 x 768 más una pregunta, la latencia es de 0,61 s; útil para verificación visual (por ejemplo, comprobar si una foto de un producto muestra daños) en dispositivos sin GPU.
- Procesamiento por lotes de preguntas: 16 preguntas de 330 tokens en una sola petición se resuelven en 1,0 s, adecuado para etiquetar lotes de registros en pipelines locales.
- Coexistencia con un modelo conversacional: `flm serve qwen3.5:4b --decision d3:edge` permite usar el modelo de decisión junto a un modelo de chat en el mismo servidor, reservando la NPU para la decisión rápida.

## Benchmarks y rendimiento

Precisión frente al modelo upstream en BF16:

| Metrica | Este paquete en NPU | Upstream BF16 |
|---|---|---|
| Decision Index, muestra del suite público (1.600 peticiones, 37 benchmarks), puntuación media | 49,8 % | 47,2 % |
| Concordancia top-1 con BF16 en las mismas peticiones (4.452 respuestas de elección) | 93,8 % | -- |
| Prompts largos, 835 a 31.545 tokens (8 peticiones), misma respuesta top que BF16 | 6 de 8 | -- |
| Decision Index, subconjunto de visión (300 preguntas, 10 benchmarks), exactitud | 53,0 % | 55,7 % |
| Concordancia top-1 con BF16 en las mismas preguntas con imagen | 82,3 % | -- |

La diferencia de puntuación media frente a BF16 es de +2,6 pt (error estándar 1,1 pt; unas 42 peticiones por benchmark). En visión, la diferencia pareada es de +2,7 pt a favor de BF16 (IC 95 % de -0,7 a +6,0 pt). Como referencia, la cuantización Q4_K sin GPTQ logra una concordancia top-1 del 91,9 %, frente al 93,8 % de este paquete.

Latencia (AMD Ryzen AI MAX+ PRO 395, Strix Halo, NPU XDNA 2, 128 GB, Ubuntu 24.04, XRT, FastFlowLM 1.0.12):

| Peticion | Latencia mediana |
|---|---|
| 1 pregunta, 128 tokens | 60 ms |
| 1 pregunta, 330 tokens | 83 ms |
| 1 pregunta, 1.024 tokens | 0,26 s |
| 1 pregunta, 4.096 tokens | 1,0 s |
| 1 pregunta, 16.384 tokens | 6,0 s |
| 1 pregunta, 31.545 tokens | 16 s |
| 1 pregunta, 32.767 tokens | 17 s |
| 4 preguntas, 330 tokens cada una | 0,29 s |
| 16 preguntas, 330 tokens cada una | 1,0 s |
| 1 pregunta + imagen de 1024 x 768 (880 tokens, HTTP) | 0,61 s |
| 1 pregunta + dos imágenes (HTTP) | 0,89 s |
| 1 pregunta + imagen de 2000 x 1500 (reescalada a 1,6 MP, HTTP) | 1,4 s |
| 8 preguntas + una imagen (una sola codificación, HTTP) | 2,0 s |

Memoria residente del servidor: 2,0 GB tras la carga, hasta 4,8 GB con 32.768 tokens e imágenes. A partir de 1.536 tokens la atención se ejecuta en el kernel de NPU.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA 2 (probado en Ryzen AI MAX+ PRO 395, Strix Halo); requiere FastFlowLM 1.0.12 o superior y XRT.
- Memoria: 2,0 GB residentes tras la carga del servidor; hasta 4,8 GB en el peor caso con 32.768 tokens e imágenes.
- No se documenta soporte de GPU (A100, H100, RTX 4090) ni de GPU de consumo; el paquete está orientado a la NPU.
- Despliegue mediante FastFlowLM: `flm serve --decision d3:edge`, opcionalmente junto a un modelo de chat (`flm serve qwen3.5:4b --decision d3:edge`). No se indican opciones de vLLM, llama.cpp, Ollama o TGI para este paquete.
- Latencia y throughput: ver tabla de la sección anterior; las mediciones son la mediana de 3 ejecuciones (1 a 2 para 16.384 tokens o más) por HTTP en una máquina inactiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (Decision Index, muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D3-Edge-NPU2 | 0,8B base recortado a 12 capas | 32.768 tokens | 49,8 % (NPU) | Apache-2.0 | HuggingFace, vía FastFlowLM |
| vllm-sr/d3-edge (upstream BF16) | 0,8B base recortado a 12 capas | 32.768 tokens | 47,2 % (BF16) | Apache-2.0 | HuggingFace |
| d3:lite | 0,8B | no disponible | no disponible | Apache-2.0 (según upstream) | Vía FastFlowLM |
| d3:nano | 2B | no disponible | no disponible | Apache-2.0 (según upstream) | Vía FastFlowLM |
| d3:mini | 4B | no disponible | no disponible | Apache-2.0 (según upstream) | Vía FastFlowLM |
| d3:flash | 9B | no disponible | no disponible | Apache-2.0 (según upstream) | Vía FastFlowLM |

Los hermanos mayores (`d3:lite`, `d3:nano`, `d3:mini`, `d3:flash`) se mencionan en la model card como variantes de mayor tamaño, pero no se aportan sus especificaciones ni resultados.

## Limitaciones y advertencias

- No es un modelo generativo: solo responde preguntas de elección, sí/no y puntuación; no produce texto libre ni conversación.
- No admite vídeo: las peticiones con `videos` se rechazan con HTTP 422.
- Límite estricto de 32.768 tokens por pregunta; las peticiones que lo superan se rechazan sin truncar, lo que puede romper flujos que esperen un recorte silencioso.
- En prompts largos, solo 6 de 8 coinciden con la respuesta top del BF16; los dos casos discrepantes son opciones casi empatadas, un riesgo a tener en cuenta en decisiones sensibles al margen.
- En visión, la exactitud es inferior a la del BF16 (53,0 % frente a 55,7 %; diferencia pareada de +2,7 pt con IC 95 % de -0,7 a +6,0 pt), por lo que el uso con imágenes puede costar algo de precisión.
- La concordancia top-1 con BF16 es del 93,8 % (menor que en los tamaños mayores), atribuible a que un modelo pequeño tiene muchas opciones casi empatadas.
- Las puntuaciones por benchmark individual son ruidosas (unas 42 peticiones por benchmark, error estándar de 1,1 pt en la media).
- Requiere hardware específico (NPU XDNA 2 de AMD) y FastFlowLM 1.0.12 o superior; no se documenta funcionamiento en GPU.
- La muestra de evaluación excluye RouterBench y SGD porque sus payloads reconstruidos localmente difieren de los del laboratorio, y el subconjunto de visión excluye Winoground por acceso restringido.
- No se dispone de información sobre sesgos, alucinación o cobertura idiomática; los idiomas soportados figuran como no disponibles.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar `LICENSE` y `NOTICE` del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastFlowLM/D3-Edge-NPU2
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-edge
- Repositorio de FastFlowLM: https://github.com/ROCm/FastFlowLM
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen3.5-0.8B
