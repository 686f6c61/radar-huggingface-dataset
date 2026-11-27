# shinmegamiboson/Qwen3.8-27B-LookAtMyQuant-7.2GB

## Resumen

Qwen3.8-27B-LookAtMyQuant-7.2GB es una compresion extrema del modelo Qwen/Qwen3.8-27B (53,7 GB en precision original) reducido a 7,2 GB, es decir, aproximadamente 2,1 bits por peso. Lo desarrolla el autor independiente shinmegamiboson mediante el compilador de cuantizacion LookAtMyQuant, y esta empaquetado especificamente para el runtime MLX de Apple Silicon. El problema que aborda es el de ejecutar un modelo de 27B de parametros en hardware de consumo con memoria unificada, manteniendo en la medida de lo posible la calidad del original.

Segun la model card, la compresion logra igualar al original de 53,7 GB en un conjunto de 540 problemas matematicos con respuesta exacta (74,3% en ambos) y supera a la cuantizacion GGUF `UD-IQ2_XXS` de Unsloth del mismo tamano en matematicas, HumanEval, MMLU y GSM8K. La relevancia actual radica en que demuestra que tecnicas de asignacion de bits por grupo de filas basadas en informacion de Fisher, junto con codificacion trellis y destilacion proximal, pueden conservar capacidades de razonamiento a tasas de bits muy bajas.

El modelo esta orientado a generacion de texto conversacional en ingles, con enfasis declarado en prosa inglesa, chat, codigo y matematicas. No se dispone de informacion sobre la licencia, la longitud de contexto efectiva tras la cuantizacion ni los detalles completos de la arquitectura subyacente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis-coded con codebooks e-means, ~2,1 bits por peso (formato `opgraph-packed-1`) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | `weights.bin` + `artifact.json` (paquete `opgraph-packed-1`), no safetensors ni GGUF |
| Tamano del repositorio | 7,2 GB |
| Runtime | MLX (Apple Silicon) mediante LookAtMyQuant / `runtime_mlx` |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer de 27B de parametros del que no se detallan en la informacion disponible ni la composicion del dataset de preentrenamiento ni las fases de alineacion (RLHF/DPO). La innovacion principal de esta ficha reside en el proceso de compresion, no en la arquitectura original.

La receta LookAtMyQuant 2 asigna a cada grupo de filas una tasa de bits derivada de la informacion de Fisher medida por fila sobre Qwen3.8-27B. Los pesos se codifican con trellis a esas tasas usando codebooks generados por e-means, y el modelo codificado se somete a destilacion proximal durante 7.600 pasos para aproximar la distribucion del original en prosa inglesa, chat, codigo y matematicas. El resultado es un paquete que el runtime MLX carga directamente; la model card indica compatibilidad con la API de `mlx_lm` mediante `runtime_mlx.load`.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`chat_template.jinja` heredada de Qwen3.8-27B) y soporte de modo thinking desactivable (`enable_thinking=False`).
- Razonamiento matematico: 74,3% de acierto en 540 problemas con respuesta exacta, igualando al modelo original sin comprimir.
- Generacion de codigo: 73,8% en HumanEval.
- Conocimiento general y razonamiento: 78,8% en MMLU, 94,5% en GSM8K, 58,9% en ARC-Challenge, 78,6% en HellaSwag.
- Inferencia local en Apple Silicon con un consumo de memoria de aproximadamente 7,6 GB.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada (se heredaria del modelo base, sin verificar tras la cuantizacion).
- Capacidades multilingues: limitadas al ingles segun la model card; en otros idiomas la divergencia KL es superior a la del GGUF comparable.
- Vision y audio: no disponible.

## Casos de uso

- Asistencia matematica y resolucion de problemas paso a paso en local: el modelo mantiene el rendimiento del original en problemas con respuesta exacta y puede ejecutarse en un portatil Apple Silicon sin conexion, util para entornos educativos o con requisitos de privacidad.
- Generacion de codigo en estaciones de trabajo de desarrollo: con 73,8% en HumanEval y 7,6 GB de memoria, es viable integrarlo en editores o scripts locales para autocompletado y generacion de funciones sin depender de la nube.
- Prototipado de chatbots conversacionales en ingles: la plantilla de chat y el modo thinking permiten construir asistentes multi-turno en local para pruebas de concepto y demos.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para investigadores que comparan trellis coding con GGUF IQ2 en terminos de divergencia KL y precision en benchmarks.
- Procesamiento por lotes de texto en ingles en equipos de consumo: tareas de resumen, reescritura o clasificacion que no requieran contexto muy largo ni idiomas distintos del ingles.
- Desarrollo y depuracion de pipelines MLX: al ser compatible con la API de `mlx_lm`, permite validar flujos de inferencia en Apple Silicon antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados en la model card (porcentaje de aciertos):

| Benchmark | Esta build (7,2 GB) | Unsloth `UD-IQ2_XXS` (7,2 GB) | Original (53,7 GB) |
|---|---:|---:|---:|
| Math (540 problemas exactos) | 74,3% | 64,4% | 74,3% |
| HumanEval | 73,8% | 67,1% | 77,4% |
| MMLU | 78,8% | 75,0% | 83,5% |
| GSM8K | 94,5% | 92,7% | 95,5% |
| ARC-Challenge | 58,9% | 59,2% | 59,2% |
| HellaSwag | 78,6% | 79,3% | 82,9% |

Divergencia KL respecto a la distribucion del original (nats por token, menor es mejor):

| Fuente | Esta build (7,2 GB) | Unsloth `UD-IQ2_XXS` |
|---|---:|---:|
| Chat | 0,154 | 0,206 |
| Codigo | 0,180 | 0,232 |
| Prosa inglesa | 0,170 | 0,184 |
| WikiText | 0,258 | 0,233 |

Segun el autor, frente al GGUF con p < 0,05 esta build va por delante en MMLU, GSM8K y matematicas, empatada en ARC-Challenge y HumanEval, y por detras en HellaSwag.

## Requisitos de hardware

- Memoria: aproximadamente 7,6 GB durante la inferencia en Apple Silicon (memoria unificada).
- Hardware soportado: exclusivamente Apple Silicon mediante el runtime MLX de LookAtMyQuant; no hay soporte documentado para CUDA ni ROCm.
- GPU de consumo: cabe en equipos Apple con 16 GB de memoria unificada o superior; el autor reporta unos 17 tokens/s en un Apple M5 Max.
- Aceleradores de datacenter (A100, H100, RTX 4090): no aplicable, el formato `opgraph-packed-1` esta empaquetado para MLX.
- Opciones de despliegue: CLI `lamq generate` y `lamq chat`, y API Python compatible con `mlx_lm` mediante `runtime_mlx.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 17 tokens/s en Apple M5 Max; no se han publicado latencias para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Math | HumanEval | MMLU | Licencia |
|---|---|---:|---|---:|---:|---:|---|
| Esta build (LookAtMyQuant) | 27B | 7,2 GB | no disponible | 74,3% | 73,8% | 78,8% | no disponible |
| Unsloth `UD-IQ2_XXS` (Qwen3.8-27B) | 27B | 7,2 GB | no disponible | 64,4% | 67,1% | 75,0% | no disponible |
| Qwen3.8-27B original | 27B | 53,7 GB | no disponible | 74,3% | 77,4% | 83,5% | no disponible |

La comparativa se limita a las variantes del mismo modelo base documentadas en la model card; no se dispone de datos de benchmarks de otros modelos de tamano o categoria similares en la informacion proporcionada.

## Limitaciones y advertencias

- Enfoque restringido al ingles: la asignacion de bits, la calibracion y la destilacion se optimizaron para prosa inglesa, chat, codigo y matematicas; en otros idiomas la divergencia KL es superior a la del GGUF comparable.
- Perdida de calidad medible frente al original: entre 3 y 5 puntos en MMLU, HumanEval y HellaSwag, y mayor divergencia KL en WikiText que el GGUF IQ2.
- Dependencia de un runtime propietario de facto: requiere el paquete LookAtMyQuant y MLX; no es utilizable con ecosistemas estandar como llama.cpp, vLLM u Ollama.
- Formato de pesos no estandar (`opgraph-packed-1`), lo que dificulta la inspeccion, el reempaquetado o la conversion a otros formatos.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Longitud de contexto no documentada tras la cuantizacion; no se garantiza el comportamiento del modelo base en ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado por la compresion agresiva a 2,1 bits por peso.
- Sesgos: no se han publicado evaluaciones de sesgo para esta build; los sesgos del modelo base no se detallan en la informacion disponible.
- Soporte de tool calling y comportamiento agentico no verificado tras la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Qwen3.8-27B-LookAtMyQuant-7.2GB
- Repositorio LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Receta LookAtMyQuant 2: https://lookatmyquant.com/2/
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
