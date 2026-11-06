# Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150

## Resumen

LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150 es una compilación comunitaria y experimental del modelo LiquidAI/LFM3-1.7B, publicada por Lottolabs, orientada exclusivamente a la inferencia sobre una tarjeta Tenstorrent Blackhole P150. No se trata de una versión oficial de Liquid AI ni de Tenstorrent, sino de un derivado cuantizado que almacena los pesos en el formato propietario `lfmq-1` (códigos de coma flotante por bloques de Tenstorrent) y que solo puede leerse con el runtime incluido en el propio repositorio.

El modelo base LFM3-1.7B es un transformer de Liquid AI con 1.700 millones de parámetros y arquitectura híbrida (atención y capas convolucionales), diseñado para generación de texto en inglés. Esta versión cuantiza las proyecciones MLP con GPTQ en BFP4 (w1/w3) y BFP8 (w2), mientras que las proyecciones de atención, la cabeza LM y la caché KV se almacenan en BFP8, y las tablas de embedding y las normas permanecen en BF16.

Su relevancia es doble: por un lado, demuestra una ruta de despliegue de modelos Liquid en hardware no NVIDIA (tt-metal sobre Blackhole); por otro, documenta de forma inusualmente detallada el impacto de la cuantización BFP mixta sobre la perplejidad y la divergencia KL respecto al modelo BF16 original. El repositorio incluye imagen Docker, launcher, código fuente del runtime y los ficheros de evidencia de todas las métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + convolución) del modelo base LFM3-1.7B; runtime tt-metal con decodificación trazada y fusión de kernels |
| Parametros totales | 1.700 millones (modelo base); checkpoint cuantizado de 2.001.994.896 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GPTQ BFP4 (MLP w1/w3), BFP8 (MLP w2, atención q/k/v/gate/o, proyecciones de convolución, LM head, caché KV), BF16 (embeddings, normas, kernels de convolución) |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (licencia del modelo base, marcada como "other" en Hugging Face) |
| Formato de pesos | safetensors con códigos `lfmq-1` (32 ficheros: `layer-L00..L23` y `global`); no es GGUF, AWQ ni GPTQ para CUDA |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base LiquidAI/LFM3-1.7B, un transformer híbrido de Liquid AI que combina capas de atención con capas convolucionales (11 capas de atención según la documentación de la caché KV). Sobre esa arquitectura, Lottolabs aplica una cuantización GPTQ por bloques con geometría de bloque propia de Tenstorrent: mantisa de 4 bits con exponente compartido de 8 bits por cada 16 valores en las proyecciones w1 y w3 del MLP (SwiGLU, dimensión 2048 → 7680), y BFP8 en w2 (7680 → 2048), en las proyecciones de atención, en la cabeza LM (ligada a los embeddings) y en la caché KV (11,7 KB por token). Los embeddings, las normas y los kernels de convolución se mantienen en BF16 sin modificar.

El runtime, empaquetado en una imagen Docker de 22,1 GB cargada (5,52 GB comprimida), incluye tt-metal, vLLM 0.1.dev14187+g03fa3af2e, el plugin de vLLM para Tenstorrent y una superposición específica de LFM3 con kernels de decodificación y prefill fusionados, muestreador exacto en dispositivo y especulación por búsqueda de prompt (prompt-lookup speculation). Se sirve a través de una API compatible con OpenAI. La cuantización se calibra y valida contra el modelo BF16 original en CUDA (RTX 3090, Transformers 5.21.0, atención eager, logits en FP32) sobre 38 registros y 57.876 tokens puntuados. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento del modelo base ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, incluyendo modo chat e instruct según la plantilla de chat original del modelo base.
- Razonamiento y respuesta a instrucciones, con parser específico de razonamiento y de tool calls en el plugin de vLLM (`lfm3_parsers.py`).
- Soporte de tool calling / function calling a través del servidor compatible con OpenAI.
- Generación de código: el corpus de evaluación incluye 23.522 tokens de código, lo que indica capacidad en esta área, aunque no se publican benchmarks específicos.
- Inferencia con especulación por búsqueda de prompt, que acelera la decodificación en cargas con solapamiento entre prompt y salida.
- Muestreo exacto en dispositivo, sin trasladar logits al host.
- Capacidades multimodales, de audio o de visión: no disponibles (el propio autor indica "text only").

## Casos de uso

- Despliegue en hardware Tenstorrent Blackhole P150: el caso de uso principal del artefacto es servir LFM3-1.7B en una única tarjeta P150 con el runtime incluido, sin depender de GPUs NVIDIA. El launcher `launch.py` resuelve la revisión, descarga, verifica cada byte y arranca el servidor.
- Evaluación de cuantización BFP en producción: el repositorio incluye los scripts de calibración, GPTQ y verificación, lo que permite reproducir el pipeline y medir el impacto de BFP4/BFP8 sobre un modelo concreto antes de adoptarlo.
- Servicio de chat con API OpenAI: al exponer un endpoint compatible, puede conectarse a clientes existentes (SDKs de OpenAI, LangChain, LlamaIndex) para prototipos de asistentes conversacionales en inglés.
- Integración en pipelines de agentes con tool calling: el parser de tool calls del plugin permite que el modelo emita llamadas estructuradas a funciones dentro de flujos multi-paso.
- Generación de código asistida en entornos con hardware Tenstorrent: el corpus de evaluación de código y el soporte de instrucciones permiten usar el modelo para autocompletado o explicación de fragmentos, siempre que el despliegue sea sobre P150.
- Investigación sobre fidelidad de cuantización: los datos de perplejidad y divergencia KL por corpus (chat, instruct, código, libros) sirven para estudiar cómo se degrada un transformer híbrido bajo cuantización de bloque mixta.
- Reproducibilidad y auditoría de artefactos: el manifiesto con SHA256 por tensor y por fichero, junto con `verify.json` y `SHA256SUMS`, permite verificar la integridad del checkpoint en entornos regulados.

## Benchmarks y rendimiento

Evaluación teacher-forced contra el modelo BF16 original en CUDA, sobre 38 registros y 57.876 tokens puntuados (chat 16.758, instruct 1.216, código 23.522, libros 16.380). Ejecución en dispositivo con prefill troceado de 2.048 tokens (runtime dev-s10):

| Corpus | Tokens | PPL BF16 → TT | ΔPPL | Acuerdo top-1 | KL media | KL p99 |
|---|---|---|---|---|---|---|
| Chat | 16.758 | 4,4327 → 4,3772 | −1,25% | 0,9249 | 0,0251 | 0,176 |
| Instruct | 1.216 | 3,2272 → 3,2828 | +1,72% | 0,9548 | 0,0223 | 0,274 |
| Código | 23.522 | 4,0613 → 4,1197 | +1,44% | 0,9442 | 0,0233 | 0,245 |
| Libros | 16.380 | 10,5588 → 10,6702 | +1,06% | 0,9194 | 0,0251 | 0,160 |
| **Total** | **57.876** | **5,4326 → 5,4625** | **+0,55%** | **0,9318** | **0,0243** | 0,204 |

El autor señala que la perplejidad de chat baja con esta cuantización mientras sube en el resto de corpus, por lo que la ΔPPL agregada se cancela parcialmente; la KL, que no puede cancelarse, es la medida principal. El corpus de instruct tiene solo 1.216 tokens (error estándar de dNLL de ±0,010). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el repositorio incluye un script `gsm8k_http.py` y ficheros de evidencia de serving y de CRUDbench, pero sus cifras no se detallan en la información proporcionada.

## Requisitos de hardware

- Hardware objetivo: una única tarjeta Tenstorrent Blackhole P150a con 32 GB de DRAM, donde residen todos los pesos (1,459 GB transmitidos por token decodificado).
- No es ejecutable en GPU NVIDIA, CPU con llama.cpp, Transformers estándar ni vLLM upstream: el formato `lfmq-1` solo lo lee el runtime incluido.
- VRAM estimada en GPUs: no aplicable; el checkpoint no está pensado para CUDA. Como referencia, el modelo base BF16 de 1,7B requeriría del orden de 3,4 GB de pesos más caché KV y activaciones, pero esta build no se puede cargar en ese entorno.
- Opciones de despliegue: imagen Docker `lottolabs/lfm3-1.7b-tt-p150:s12-20261030` (22,1 GB cargada) con vLLM 0.1.dev14187+g03fa3af2e y el plugin de Tenstorrent; arranque mediante `launch.py` o `tools/serve_lfm3.sh`.
- Host de medida: 32 hilos, compartido con otros equipos mediante bloqueo de dispositivo; las tablas de velocidad del repositorio incluyen las cargas medias del host.
- Latencia y throughput concretos: no disponibles en la información proporcionada (el autor remite a los ficheros de `evidence/` para las tablas de velocidad).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|
| LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150 (esta ficha) | 1,7B | no disponible | BFP4/BFP8 mixta, GPTQ | lfm1.0 | Tenstorrent Blackhole P150 |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | BF16 | lfm1.0 | GPU CUDA, CPU |
| Variante `ckpt-bfp8` (mencionada, no publicada) | 1,7B | no disponible | BFP8 uniforme | no disponible | Tenstorrent Blackhole P150 |

La comparación con modelos de otros fabricantes del mismo tamaño (por ejemplo, familias de 1-2B con licencia permisiva) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento de esos modelos ni métricas comparables.

## Limitaciones y advertencias

- Artefacto experimental y comunitario: no es una versión oficial de Liquid AI ni de Tenstorrent, y el autor lo etiqueta explícitamente como build de comunidad.
- Portabilidad nula: el checkpoint en formato `lfmq-1` no carga en Transformers estándar, llama.cpp, AWQ ni GPTQ para CUDA; solo funciona con el runtime empaquetado y sobre una P150.
- Solo texto y solo inglés: no hay soporte multimodal ni multilingüe.
- Licencia lfm1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia del modelo base puede imponer restricciones adicionales.
- Degradación medible de calidad: la cuantización mixta eleva la perplejidad un 1,06-1,72% en libros, código e instruct, con un acuerdo top-1 del 93,18% y KL media de 0,0243 frente al BF16; el corpus de instruct es demasiado pequeño (1.216 tokens) para conclusiones robustas.
- Riesgo de alucinación: inherente a un modelo de 1,7B; no se publican evaluaciones de factualidad ni de sesgos en la información disponible.
- Longitud de contexto: no documentada en la información proporcionada, lo que impide planificar cargas con prompts largos.
- Dependencia de una única medición: los resultados se obtuvieron en un host compartido con bloqueo de dispositivo, por lo que la latencia puede variar según la carga del sistema.
- Madurez del ecosistema: vLLM en versión de desarrollo (0.1.dev) y plugin propio de Tenstorrent implican menor estabilidad y soporte que una pila CUDA convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: fichero LICENSE dentro del repositorio de Hugging Face
- Repositorio de código y documentación: incluido en el propio repo (`runtime/lfm3-runtime-src.tar.gz`, notas `NOTES-runtime.md`, `NOTES-fast-kernels.md`, `NOTES-quant.md`, `NOTES-reference.md`, `NOTES-crudbench.md`)
- Imagen de servicio: `lottolabs/lfm3-1.7b-tt-p150:s12-20261030`
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
