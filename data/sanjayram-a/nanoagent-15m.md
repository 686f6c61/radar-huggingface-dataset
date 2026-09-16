# sanjayram-a/nanoagent-15m

## Resumen

NanoAgent-15M es un transformer decoder-only de estilo Llama con aproximadamente 15 millones de parametros, desarrollado por el usuario sanjayram-a y publicado en HuggingFace bajo licencia Apache-2.0. Su proposito declarado es cubrir chat conversacional y llamada estructurada de herramientas (tool calling) en un modelo lo bastante pequeno para desplegarse en el borde: cada checkpoint en fp32 ocupa unos 58 MB. La arquitectura usa `transformers.LlamaForCausalLM`, con 384 dimensiones ocultas, 8 capas, atencion con GQA 3:1 (6 cabezas de consulta y 2 de clave/valor), SwiGLU de 1024 y un vocabulario propio de 6.144 tokens BPE byte-level.

El modelo se entreno de principio a fin en una unica GPU RTX 3050 Laptop con 4 GB de VRAM, lo que lo convierte en un caso reproducible de pipeline completo: tokenizador propio, pretraining sobre 1.000 millones de tokens y dos rondas de fine-tuning supervisado (SFT) orientadas a chat e instrucciones. La ventana de contexto es de 1.024 tokens, contando prompt y respuesta de forma combinada, y el unico idioma declarado es el ingles.

Su relevancia es doble. Por un lado, sirve como banco de pruebas barato para validar formatos de tool calling (`<tool_call>{...}</tool_call>`) y parsers en pipelines de agentes antes de escalar a modelos mayores. Por otro, es un ejemplo didactico de entrenamiento end-to-end con curriculo en dos etapas, mezcla de datasets publica y curvas de entrenamiento en TensorBoard. El autor advierte explicitamente de que debe evaluarse el formato y la coherencia a corto plazo, no la calidad tipo GPT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`transformers.LlamaForCausalLM`) |
| Parametros totales | ~15 millones (~58 MB en fp32, `.pt`) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (prompt + respuesta combinados) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints fp32 en `.pt`; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`final_15m_model.pt`, `best_model.pt`, `sft_chat_max_final.pt`, `checkpoints/latest.pt`); tokenizador en `tokenizer.json` y `tokenizer_config.json` |
| Dimension oculta / capas / cabezas | 384 / 8 / 6 Q + 2 KV (GQA 3:1), SwiGLU 1024 |
| Vocabulario | 6.144 tokens, BPE byte-level entrenado a medida (`nanoagent_tokenizer/`) |
| Posicional / normalizacion | RoPE con theta 10.000; RMSNorm; embeddings de palabra atados |
| Formato de chat | `<\|im_start\|>{role}\n{content}<\|im_end\|>`; herramientas en `<tools>...</tools>`; llamadas en `<tool_call>{...}</tool_call>`; resultados en `<tool_response>...</tool_response>` |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only denso de 8 capas y 384 dimensiones ocultas, con atencion agrupada (6 cabezas de consulta por 2 de clave/valor, ratio 3:1), SwiGLU de 1024 en la MLP, RMSNorm, RoPE con theta 10.000 y embeddings de entrada/salida atados. El tokenizador es un BPE byte-level propio de 6.144 entradas, entrenado especificamente para este modelo, lo que reduce el tamano del embedding pero obliga a usar el tokenizador del repositorio con cualquier checkpoint.

El pretraining consumio 999.948.288 tokens (aproximadamente 1.000 millones) en 15.256 pasos de optimizador, con un lote efectivo de 65.536 tokens por paso (batch 16 x 1.024 tokens x acumulacion de gradiente 4). Se aplico un curriculo en dos etapas: 3.051 pasos con secuencias de 200 millones de tokens y el resto con 800 millones, sin mezclar documentos a traves de la frontera de etapa. La tasa de aprendizaje uso warmup de 1.000 pasos hasta 6e-4 y decaimiento coseno hasta 6e-5. La perdida de entrenamiento bajo de 8,18 a 4,02 y la de validacion de 6,19 a 3,98. El throughput de entrenamiento fue de 37.000-38.000 tokens/s en la RTX 3050 Laptop. El run sufrio una interrupcion en el paso 8.239 por un desbordamiento de fp16 que produjo norma de gradiente infinita, y se reanudo desde un checkpoint de emergencia hasta completarse.

El corpus de pretraining combina cuatro fuentes ponderadas: Ultra-FineWeb-L3 (409.975.000 tokens de entrenamiento, 35% en etapa 1 y 30% en etapa 2), FineWeb-Edu sample-10BT con puntuacion >= 3 (357.075.000 tokens, 35%/25%), Cosmopedia-v2 de SmolLM-corpus (330.625.000 tokens, 25%/25%) y UltraData-Code-L2 en Python (224.825.000 tokens, 5%/20%). Se seleccionaron 251.506 documentos para la etapa 1 y 969.804 para la etapa 2, con 12.102 documentos de validacion. El ajuste posterior consta de dos SFT: el run 1 vio 409.544.800 tokens en 12.500 pasos (perdida de validacion 1,7348; perplejidad 5,67) sobre una mezcla de 409.760 filas con smol-magpie-ultra (150.000, 36,6%), ultrachat preguntas sobre el mundo (86.000, 21,0%), xlam-function-calling-60k (60.000, 14,6%), glaive-function-calling-v2 (47.500, 11,6%), smol-summarize (34.000, 8,3%) y reescritura, anadiendo un 15% de negativos de contexto de herramienta; el run 2 uso 380.573 filas de una mezcla con mayor peso de instrucciones y alcanzo perdida 1,4783 y perplejidad 4,39. No se documenta ninguna fase de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles con ventana de 1.024 tokens (prompt mas respuesta).
- Conversacion multi-turno siguiendo la plantilla `<|im_start|>...<|im_end|>` y deteniendose en el token de cierre.
- Tool calling estructurado: emite bloques `<tool_call>{...}</tool_call>` a partir de definiciones en `<tools>...</tools>` y puede consumir resultados en `<tool_response>...</tool_response>`.
- Entrenamiento explicito con datasets de function calling (xlam-function-calling-60k y glaive-function-calling-v2), incluido un 15% de ejemplos negativos de contexto de herramienta.
- Resumen de texto y reescritura de frases, gracias a las porciones smol-summarize y reescritura de la mezcla de SFT.
- Respuesta a preguntas de cultura general a nivel superficial (porcion ultrachat questions about world).
- Generacion de codigo muy limitada, derivada del 5-20% de UltraData-Code en el pretraining.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio, ni capacidades multimodales.
- No se documenta soporte nativo de agentes multi-paso mas alla del bucle manual que gestione el llamador.

## Casos de uso

- Validacion de parsers de tool calling en CI: el modelo emite bloques `<tool_call>` bien formados de forma barata, por lo que se puede ejecutar en cada pull request para comprobar que el parser de la aplicacion tolera payloads reales sin depender de APIs externas.
- Enrutado de intenciones en el borde: con 58 MB en fp32 puede clasificar si una consulta requiere herramienta o no y emitir la llamada correspondiente en dispositivos sin GPU dedicada, como una Raspberry Pi o un movil.
- Prototipado de agentes antes de escalar: sirve para disenar y depurar el bucle prompt -> `<tool_call>` -> `<tool_response>` -> respuesta final con un coste de inferencia practicamente nulo, y luego migrar la logica a un modelo mayor.
- Docencia e investigacion en modelos de lenguaje: el repositorio incluye el pipeline completo de datos y entrenamiento, y las curvas de TensorBoard de cada run, lo que permite reproducir pretraining y SFT en una GPU de portatil de 4 GB.
- Asistentes conversacionales offline: chatbots de dominio acotado (FAQ, formularios, resumen de notas) que deban funcionar sin conexion y con huella de memoria minima.
- Resumen y reescritura de textos cortos: condensar parrafos o reformular frases de una o dos lineas en herramientas de edicion, respetando el limite de 1.024 tokens por peticion.
- Banco de pruebas de fine-tuning: la mezcla de SFT y el checkpoint del run 2 (que incluye `model_state` y estado del optimizador) permiten experimentar con recetas de ajuste a bajo coste antes de aplicarlas a modelos mayores.
- Generacion de datos sinteticos de formato: producir ejemplos etiquetados de conversaciones con y sin llamada a herramienta para aumentar datasets de entrenamiento de modelos mas grandes.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son perdidas y perplejidades de validacion sobre mezclas de datos propias (no sobre benchmarks estandar como MMLU, HumanEval o GSM8K). Todos ellos figuran como no verificados (`verified: false`) y el autor los presenta tal cual.

| Variante | Dataset de evaluacion | Perdida de validacion | Perplejidad |
|---|---|---|---|
| NanoAgent-15M (base, pretrained) | Mezcla de pretraining de 1.000 millones de tokens (Ultra-FineWeb-L3 + FineWeb-Edu + Cosmopedia-v2 + UltraData-Code) | 3,9772 | 53,37 |
| NanoAgent-15M-SFT (run 1) | Mezcla SFT de 409.760 filas (smoltalk + ultrachat world-QA + xlam + glaive + summarize + rewrite) | 1,7348 | 5,67 |
| NanoAgent-15M-Instruct (run 2) | Mezcla SFT con mayor peso de instrucciones, 380.573 filas (smol-magpie-ultra + glaive + xlam + summarize + rewrite + chat) | 1,4783 | 4,39 |

Desglose por checkpoint, segun la model card:

| Fichero | Variante | Perdida de validacion | Perplejidad |
|---|---|---|---|
| `runs/nanoagent_15m/final_15m_model.pt` | Base preentrenado, sin SFT (usar con `chat.py --raw`) | 3,9772 | 53,37 |
| `runs/nanoagent_15m/best_model.pt` | Base, mejor instantanea por validacion | 3,9791 | ~53,5 |
| `runs/nanoagent-15m-sft/sft_chat_max_final.pt` | SFT run 1 (mezcla de 409.760 filas), recomendado para chat y herramientas | 1,7348 | 5,67 |
| `runs/nanoagent-15m-sft2/checkpoints/latest.pt` | SFT run 2 / instruct, checkpoint completo (estado del modelo y del optimizador) | 1,4783 | 4,39 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, IFEval ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 58 MB de pesos mas activaciones y cache KV; en la practica cabe en cualquier GPU con mas de 500 MB libres.
- GPU consumer: cabe con enorme margen en RTX 3050, RTX 3060, RTX 4060, GTX 1650 o integradas modestas. El entrenamiento se completo en una RTX 3050 Laptop de 4 GB.
- CPU y dispositivos de borde: el modelo es ejecutable en CPU, Raspberry Pi o moviles por su tamano, aunque no se publican cifras de latencia en esos entornos.
- Repositorio: 0,4 GB, dominado por los checkpoints; el checkpoint base en fp32 ronda los 58 MB.
- Opciones de despliegue: soporte nativo en `transformers` (los pesos estan en `.pt`, no en safetensors, por lo que hay que cargarlos con PyTorch y mapearlos al modelo); es compatible con `endpoints_compatible` segun las etiquetas del repositorio. Para vLLM, TGI, llama.cpp u Ollama seria necesario convertir los pesos y generar una version GGUF, que no esta publicada.
- Throughput: el unico dato disponible es el del entrenamiento, 37.000-38.000 tokens/s en una RTX 3050 Laptop; no se publican cifras de latencia ni de throughput de inferencia.
- No se han publicado requisitos de memoria para fine-tuning; el run 2 conserva estado del optimizador, lo que sugiere que el ajuste se hizo en la misma GPU de 4 GB.

## Comparativa con modelos similares

Comparativa de especificaciones frente a otros modelos pequenos de proposito general. Los datos de las alternativas no provienen de la informacion proporcionada para esta ficha y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Tool calling nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoAgent-15M | ~15 M | 1.024 tokens | Si (formato `<tool_call>` entrenado con xlam y glaive) | Apache-2.0 | Pesos `.pt` en HuggingFace, sin GGUF |
| SmolLM-135M | 135 M | 2.048 tokens | No especifico | Apache-2.0 | safetensors y GGUF ampliamente disponibles |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | No especifico | Apache-2.0 | safetensors y GGUF ampliamente disponibles |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Si, formato Hermes/ToolACE | Apache-2.0 | safetensors y GGUF ampliamente disponibles |

Frente a estas alternativas, NanoAgent-15M es entre 9 y 70 veces mas pequeno y su contexto es de 4 a 32 veces menor, pero es el unico de la lista cuyo preentrenamiento, tokenizador y pipeline de datos estan publicados de forma completa y ejecutable en una GPU de 4 GB. No hay datos de benchmarks comparables que permitan situarlo en calidad de respuesta.

## Limitaciones y advertencias

- Escala muy reducida: con 15 millones de parametros, la perplejidad de validacion del mejor checkpoint SFT es 4,39 y la del base 53,37; el conocimiento factual y la coherencia a medio plazo son muy limitados.
- El propio autor recomienda evaluar el formato (parada en `<|im_end|>`, bloques `<tool_call>` bien formados, uno o dos frases sobre el tema) y no la calidad de respuesta tipo GPT.
- Alta probabilidad de alucinacion en preguntas factuales, agravada por la ausencia de RLHF o DPO: solo hay SFT supervisado.
- Ventana de contexto de 1.024 tokens contando prompt y respuesta, insuficiente para documentos largos, historiales extensos o esquemas de herramientas voluminosos.
- Solo ingles declarado; no hay soporte multilingue, incluido el castellano.
- El tool calling depende de respetar exactamente la plantilla de chat y el tokenizador incluidos; cualquier variacion de formato degrada la salida.
- El checkpoint del run 2 (`checkpoints/latest.pt`) es un checkpoint completo de entrenamiento con estado del optimizador, no un artefacto limpio de inferencia.
- Sesgos esperables por la composicion del corpus: datos web filtrados por puntuacion educativa (FineWeb-Edu), contenido sintetico (Cosmopedia-v2) y fuentes en ingles, sin filtros de seguridad ni alineamiento de comportamiento.
- El dataset `Salesforce/xlam-function-calling-60k` esta restringido por aceptacion de terminos, lo que puede afectar a la reproducibilidad completa de la mezcla de SFT.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero no hay garantias del autor sobre el rendimiento en produccion.
- El pretraining sufrio un fallo por desbordamiento en fp16 en el paso 8.239, resuelto con reanudacion desde checkpoint; es un indicio de inestabilidad numerica a tener en cuenta si se reintenta el entrenamiento.
- No hay versiones cuantizadas ni formato GGUF publicados, lo que anade un paso de conversion antes de poder usar llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanjayram-a/nanoagent-15m
- Codigo de entrenamiento y pipeline de datos: https://github.com/sanjayram-a/nanoagent-15m
- Curvas de entrenamiento: pestana "Training metrics" del repositorio de HuggingFace
- Dataset de pretraining Ultra-FineWeb-L3: `openbmb/Ultra-FineWeb-L3`
- Dataset de pretraining FineWeb-Edu: `HuggingFaceFW/fineweb-edu` (sample-10BT)
- Dataset de pretraining Cosmopedia-v2: `HuggingFaceTB/smollm-corpus`
- Dataset de pretraining de codigo: `openbmb/UltraData-Code` (UltraData-Code-L2, py)
- Datasets de SFT: `HuggingFaceTB/smoltalk`, `HuggingFaceTB/ultrachat_questions_about_world`, `Salesforce/xlam-function-calling-60k`, `glaiveai/glaive-function-calling-v2`
- Resultados de busqueda web: no se han encontrado articulos, papers ni demos adicionales relevantes sobre este modelo en la busqueda realizada; los unicos recursos disponibles son el repositorio de HuggingFace y el repositorio de GitHub enlazados arriba.
