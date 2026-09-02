# kingjones777/Sarvam-30B-ROCmFP4-GGUF

## Resumen

Sarvam-30B-ROCmFP4-GGUF es una colección de cuatro archivos GGUF del modelo Sarvam-30B, cuantizados con los nuevos tipos ROCmFP4/ROCmFPX (ggml types 100-119) y optimizados para GPUs AMD con arquitectura gfx1151 (Strix Halo, como la Radeon 8060S del Ryzen AI Max+ 395). El modelo base, desarrollado por Sarvam AI, es un MoE de 30B parámetros totales con 2.4B activos (no-embedding), 128 expertos con top-6 y un experto compartido, diseñado específicamente para ofrecer razonamiento, generación de código y tool calling nativo en 22 idiomas indios. Esta cuantización resuelve el problema de que no existía ningún GGUF funcional para Sarvam-30B, ya que la arquitectura `sarvam_moe` no está implementada en llama.cpp estándar; el conversor la mapea a `bailingmoe2` y ajusta el rotary y el sesgo de expertos, permitiendo cargar el modelo en builds ROCmFPX.

La relevancia actual radica en que permite ejecutar un modelo de razonamiento multilingüe de alto rendimiento en hardware AMD unificado con velocidades de decode de hasta 81.6 t/s y prefill de 1696 t/s (medidos en HIP), sin necesidad de GPUs NVIDIA. Todos los números de la model card fueron medidos sobre estos archivos exactos, no estimados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (128 expertos, top-6, experto compartido, 19 capas, `rope_theta` 8e6, vocab 262144) |
| Parametros totales | 30B (aprox., segun denominacion del modelo) |
| Parametros activos | 2.4B (no-embedding) |
| Longitud de contexto | no disponible (probado con 8192 tokens) |
| Tipos de cuantizacion | ROCmFP4/ROCmFPX (ggml types 100-119); archivos Q4_0 (FAST, STRIX_LEAN, COHERENT) y Q8_0 (AGENT) |
| Idiomas soportados | 22 idiomas indios (segun Sarvam AI) y otros no especificados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con tipos ROCmFP4/ROCmFPX (no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Sarvam-30B declara `SarvamMoEForCausalLM` con `model_type: sarvam_moe`, una arquitectura que ningun runtime implementa de forma nativa. El conversor de esta cuantizacion la mapea a `MODEL_ARCH.BAILINGMOE2`, ya que comparte el grafo de BailingMoeV2, con dos diferencias: rotary completo (sin `partial_rotary_factor`) y un sesgo de experto normalizado a media cero. Estos dos ajustes se escriben en el GGUF, de modo que los archivos cargan en cualquier build ROCmFPX con soporte `bailingmoe2`, incluido el repositorio oficial sin modificaciones.

No se dispone de informacion detallada sobre el entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Segun Sarvam AI, el entrenamiento puso un enfasis especial en el contexto indio y las lenguas de la India, logrando rendimiento puntero en 22 idiomas indios para su tamano. El modelo es un "reasoner" con modo de pensamiento, aunque su longitud de razonamiento es altamente no determinista incluso a `temperature 0`.

## Capacidades

- Generacion de texto y razonamiento multi-step, con modo de pensamiento (reasoning) que puede extenderse miles de caracteres.
- Tool calling / function calling nativo, verificado en las pruebas de la model card.
- Soporte para agentes y flujos RAG, con buen rendimiento de prefill en HIP (1696 t/s) para re-prefill de conversaciones largas.
- Capacidades multilingues: 22 idiomas indios, ademas de ingles (no se especifican otros).
- Segun Sarvam AI, puede manejar llamadas de voz multilingues mientras realiza tool calls.
- Generacion de codigo, con resultados variables en funcion del presupuesto de razonamiento (ver limitaciones).

## Casos de uso

- Atencion al cliente automatizada en India: el modelo puede gestionar conversaciones multi-turno en varios idiomas indios, con tool calling para consultar bases de datos o sistemas de ticketing. Su prefill rapido en HIP (1696 t/s) permite re-procesar el historial en cada turno sin penalizacion notable.
- Agentes con tool calling en entornos AMD: al soportar function calling nativo, puede integrarse en pipelines de automatizacion que requieran llamadas a APIs, ejecucion de comandos o consultas estructuradas, ejecutandose en hardware AMD unificado (Strix Halo) sin necesidad de GPU NVIDIA.
- RAG sobre documentacion tecnica o legal en idiomas indios: su capacidad multilingue y su ventana de contexto (probada a 8192) permiten indexar y responder sobre corpus locales, con prefill eficiente para consultas largas.
- Generacion de codigo en produccion: aunque el razonamiento es no determinista, con presupuestos amplios (4000+ tokens) puede producir respuestas de codigo correctas. Adecuado para entornos donde se pueda reintentar la generacion.
- Traduccion y transcreacion entre idiomas indios: su entrenamiento especifico en 22 lenguas lo hace util para servicios de traduccion automatica, subtitulado o localizacion de contenido.
- Asistentes de voz multilingues: segun Sarvam AI, el modelo puede manejar llamadas de voz mientras ejecuta tool calls, lo que lo habilita para IVRs o asistentes por telefono en contextos indios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "capability checks" (hechos y tool calling) que pasaron en las ocho combinaciones archivo/backend, pero no proporciona numeros concretos de MMLU, HumanEval, GSM8K u otros. Tampoco se encontraron datos de evaluacion del modelo base en las fuentes consultadas.

## Requisitos de hardware

- GPU AMD con arquitectura gfx1151 (Strix Halo, p. ej. Radeon 8060S) o similar compatible con ROCmFPX. No funciona en GPUs NVIDIA (CUDA) ni en AMD sin soporte ROCmFPX.
- VRAM: los archivos Q4_0 ocupan entre 16.24 y 17.40 GiB; el Q8_0 ocupa 31.41 GiB. En un sistema con memoria unificada (como el Ryzen AI Max+ 395 con 128 GB) caben todos.
- Backend: llama.cpp con build ROCmFPX (repositorio oficial `ROCmFPX/ROCmFPX.git`), compilado con `-DGGML_HIP=ON` y `-DAMDGPU_TARGETS=gfx1151`. Tambien soporta Vulkan con el mismo archivo.
- Velocidades medidas (medianas de 3 generaciones, `temperature 0`, contexto 8192, un slot):
  - FAST (Q4_0): decode 81.6 t/s (HIP) / 79.6 t/s (Vulkan); prefill 1696 t/s (HIP) / 1167 t/s (Vulkan).
  - STRIX_LEAN (Q4_0): decode 81.1 / 78.2; prefill 1654 / 1155.
  - COHERENT (Q4_0): decode 74.3 / 76.4; prefill 1497 / 1162.
  - AGENT (Q8_0): decode 54.4 / 52.1; prefill 1474 / 976.
- HIP supera a Vulkan en prefill por 42-51%; en decode la diferencia es menor y HIP gana en tres de cuatro archivos.
- No se recomienda para GPUs consumer AMD antiguas sin soporte gfx1151; el rendimiento no esta garantizado.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. Como referencia de categoria, modelos MoE de tamano similar (30B totales, ~2-4B activos) incluyen Qwen2.5-32B (MoE con 3B activos) o Mixtral 8x7B (47B totales, 13B activos), pero no hay mediciones comparativas publicadas en las fuentes consultadas. La ventaja especifica de Sarvam-30B es su cobertura de 22 idiomas indios y su licencia Apache-2.0, mientras que la de esta cuantizacion es su optimizacion para hardware AMD ROCmFPX.

## Limitaciones y advertencias

- El modelo no deja de pensar: su razonamiento es altamente no determinista incluso a `temperature 0`. En pruebas, con un presupuesto de 4000 tokens, dos de tres generaciones no produjeron respuesta (todo el presupuesto se consumio en razonamiento). Esto es comportamiento del modelo base, no de la cuantizacion.
- El parametro `chat_template_kwargs {"enable_thinking": false}` es ignorado: el modelo sigue emitiendo 5500-6000 caracteres de razonamiento. No hay forma de desactivar el modo de pensamiento.
- Para generacion larga, se recomienda presupuestos de 4000+ tokens y reintentar la generacion si no emerge respuesta; un presupuesto pequeno hace que el modelo parezca roto (HTTP 200 con `content` vacio y todos los tokens en `reasoning`).
- Requiere un build especial de llama.cpp (ROCmFPX); el llama.cpp estandar no carga estos archivos.
- Solo compatible con GPUs AMD con soporte ROCmFPX (gfx1151); no funciona en CUDA.
- No se han publicado benchmarks formales, por lo que no hay evidencia cuantitativa de calidad mas alla de las comprobaciones internas de la model card.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en las fuentes consultadas.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Sarvam-30B-ROCmFP4-GGUF
- Modelo base (safetensors): https://huggingface.co/sarvamai/sarvam-30b
- GGUF oficial de Sarvam AI: https://huggingface.co/sarvamai/sarvam-30b-gguf
- Blog de Sarvam AI sobre el lanzamiento: https://www.sarvam.ai/blogs/sarvam-30b-105b
- Ficha en AI Kosh (India AI): https://aikosh.indiaai.gov.in/home/models/details/sarvam2_30b_a2b_4.html
- Repositorio de conversion (mtr7x/sarvam-gguf): https://github.com/mtr7x/sarvam-gguf
- Repositorio ROCmFPX (backend necesario): https://github.com/ROCmFPX/ROCmFPX.git
