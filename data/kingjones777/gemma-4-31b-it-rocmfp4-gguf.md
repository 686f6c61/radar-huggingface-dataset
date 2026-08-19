# kingjones777/Gemma-4-31B-it-ROCmFP4-GGUF

## Resumen

Gemma-4-31B-it-ROCmFP4-GGUF es una cuantización en formato GGUF del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario kingjones777. Se trata de la primera implementación de los tipos de tensor ROCmFP4 y ROCmFPX, diseñados específicamente para hardware AMD con arquitectura RDNA 4 (gfx1151, como el Strix Halo). El repositorio incluye cuatro variantes de cuantización, un proyector de visión en BF16 y un drafter para decodificación especulativa, todo verificado en hardware real.

El modelo base es un transformer denso de aproximadamente 30,7 mil millones de parámetros, con capacidades de imagen-texto a texto. Esta cuantización permite ejecutarlo en sistemas con memoria unificada de AMD, alcanzando hasta 21,67 tokens por segundo con decodificación especulativa activada en una configuración concreta. Su relevancia radica en que abre la posibilidad de usar modelos de gran tamaño en hardware AMD de consumo sin necesidad de GPUs NVIDIA, aunque requiere un fork específico de llama.cpp (ROCmFPX) que no es compatible con las versiones estándar.

La publicación incluye mediciones detalladas de rendimiento, con especial atención a la velocidad de decodificación y a la aceptación de drafts en la decodificación especulativa, así como advertencias sobre limitaciones importantes, como la imposibilidad de combinar la decodificación especulativa con la entrada de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto), basado en Gemma 4 de Google |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4, Q6_0_ROCMFPX, Q8_0_ROCMFPX (con variantes COHERENT y AGENT) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia propietaria de Google) |
| Formato de pesos | GGUF con tipos ROCmFP4/ROCmFPX (no compatibles con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso multimodal que procesa tanto texto como imagenes. No se dispone de informacion detallada sobre su arquitectura interna (numero de capas, dimensiones, atencion, etc.) ni sobre los datos de entrenamiento, ya que la model card del autor se centra exclusivamente en la cuantizacion y no en el modelo original. El autor indica que la cuantizacion se construyo a partir del GGUF BF16 publicado en el Hub, sin reconversion desde safetensors, y que cada variante fue verificada individualmente tanto en tareas de texto como de vision.

La innovacion principal de esta publicacion es la introduccion de los tipos de tensor ROCmFP4 y ROCmFPX, implementados en el fork ROCmFPX de llama.cpp. Estos tipos aprovechan las instrucciones nativas de FP4/FP8 de las GPUs AMD RDNA 4, algo que el llama.cpp principal no soporta. Ademas, el repositorio incluye un drafter oficial (`mtp-gemma-4-31B-it-Q8_0.gguf`, 491 MB) que permite decodificacion especulativa (MTP), con una mejora de rendimiento medida de hasta 1,84x en el quant de 4 bits.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, aunque no se aportan datos especificos sobre su rendimiento en estas areas.
- Comprension de imagenes: el pipeline es `image-text-to-text`, e incluye un proyector de vision (`mmproj-BF16.gguf`) necesario para procesar entradas visuales. La verificacion del autor confirma que la cuantizacion preserva la funcionalidad de vision.
- Decodificacion especulativa (MTP): soportada mediante el drafter incluido, con una tasa de aceptacion de drafts medida de 0,649 en configuracion recomendada (para cargas de trabajo de codigo).
- Compatibilidad con hardware AMD: disenado especificamente para GPUs con arquitectura gfx1151 (Strix Halo) y ROCm 7.2.4 o superior.
- Conversacional: el tag `conversational` sugiere que el modelo base esta optimizado para dialogos multi-turno, aunque no se detallan pruebas especificas.

No se mencionan capacidades adicionales como tool calling, agentes o funciones de audio en la informacion proporcionada.

## Casos de uso

- Ejecucion local de un modelo multimodal de 30B en hardware AMD de consumo: gracias a la cuantizacion ROCmFP4, el modelo cabe en 16,44 GiB y puede ejecutarse en sistemas con memoria unificada como el Strix Halo, sin necesidad de GPUs NVIDIA. Es adecuado para desarrolladores que trabajan con equipos AMD y necesitan un LLM de gran tamano en local.
- Analisis de imagenes en entornos sin conexion: el proyector de vision incluido permite tareas como descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de capturas, todo ello en local y con privacidad de datos.
- Generacion de codigo asistida: el autor mide el rendimiento con prompts de codigo, y la decodificacion especulativa muestra una tasa de aceptacion mayor en este tipo de carga. Puede usarse como asistente de programacion en entornos de desarrollo con hardware AMD.
- Prototipado de aplicaciones conversacionales: al ser un modelo `it` (instruction-tuned), puede integrarse en chatbots o asistentes virtuales que requieran respuestas contextuales y multi-turno, aprovechando la ventana de contexto disponible (aunque no se especifica su longitud).
- Investigacion sobre cuantizacion de baja precision en AMD: este repositorio sirve como referencia para estudiar el impacto de FP4/FP8 en el rendimiento y la calidad de modelos grandes, especialmente en arquitecturas RDNA 4.
- Despliegue en servidores con GPUs AMD: para entornos de produccion que ya utilizan ROCm, esta cuantizacion ofrece una alternativa a las soluciones basadas en CUDA, con la ventaja de un menor consumo de memoria y una velocidad de inferencia razonable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente mediciones de velocidad de decodificacion en un hardware concreto (AMD Ryzen AI MAX+ 395, 128 GB unificados, ROCm 7.2.4). Estas mediciones se presentan a continuacion como referencia:

**Con drafter (decodificacion especulativa, `n-max 5`):**

| Quant | Tamano (GiB) | Velocidad (t/s) | Aceptacion de drafts |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT (ftype 102) | 16,44 | 21,68 | 0,735 |
| Q6_0_ROCMFPX_AGENT (ftype 114) | 26,63 | 14,82 | 0,629 |
| Q8_0_ROCMFPX (ftype 111) | 29,54 | 14,86 | 0,603 |
| Q8_0_ROCMFPX_AGENT (ftype 115) | 30,04 | 15,34 | 0,619 |

**Sin drafter (ruta de vision, `-fa off`):**

| Quant | Velocidad (t/s) | Verificacion de vision |
|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 11,81 | Correcta (4 cuadrantes) |
| Q6_0_ROCMFPX_AGENT | 7,33 | Correcta |
| Q8_0_ROCMFPX | 6,71 | Correcta |
| Q8_0_ROCMFPX_AGENT | 6,57 | Correcta |

El autor indica que la velocidad sin drafter corresponde al 81-83% del ancho de banda teorico de la memoria (~256 GB/s), lo que sugiere que no hay cuellos de botella adicionales. Los valores de velocidad son dependientes de la carga de trabajo: el rendimiento con codigo es superior al de prosa libre.

## Requisitos de hardware

- VRAM estimada: entre 16,44 GiB (quant Q4_0_ROCMFP4) y 30,04 GiB (quant Q8_0_ROCMFPX_AGENT). En sistemas con memoria unificada, esta memoria se comparte con la RAM del sistema.
- GPU recomendada: AMD con arquitectura gfx1151 (Strix Halo), como el Ryzen AI MAX+ 395. Tambien puede funcionar en otras GPUs RDNA 4 con soporte ROCm 7.2.4 o superior, aunque no se ha verificado.
- No es compatible con GPUs NVIDIA (CUDA) ni con hardware AMD anterior a RDNA 4, debido a los tipos de tensor ROCmFP4/ROCmFPX.
- El modelo cabe en una GPU de consumo con 16 GB de VRAM si se usa el quant de 4 bits, pero se requiere el fork ROCmFPX de llama.cpp. No funcionara en Ollama, LM Studio ni llama.cpp estandar.
- Opciones de despliegue: el autor utiliza `llama-server` del fork ROCmFPX. No se mencionan otros frameworks como vLLM o TGI.
- Latencia y throughput: las mediciones indican entre 6,57 y 21,68 tokens/s segun la configuracion y el uso de decodificacion especulativa. Para aplicaciones interactivas, el quant de 4 bits con drafter es el mas recomendable.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Gemma 3 27B, Llama 3.1 30B, o cuantizaciones GGUF estandar de estos). La informacion proporcionada se limita al propio repositorio y no incluye mediciones frente a alternativas. Se puede establecer una comparacion cualitativa con el modelo base sin cuantizar:

| Modelo | Parametros | Tamano (aprox.) | Velocidad (t/s) | Compatibilidad |
|---|---|---|---|---|
| google/gemma-4-31B-it (BF16) | 30,7 B | ~61 GB | No medido | Requiere GPU con mucha VRAM |
| Esta cuantizacion (Q4_0_ROCMFP4) | 30,7 B | 16,44 GiB | 21,68 (con drafter) | Solo AMD ROCm con fork ROCmFPX |
| Cuantizacion GGUF estandar (Q4_K_M) | 30,7 B | ~18 GB | No disponible | Compatible con llama.cpp estandar, pero no con ROCmFP4 |

La principal diferencia es la restriccion de hardware: esta cuantizacion solo funciona en AMD RDNA 4, mientras que las GGUF estandar son portables. Sin embargo, en el hardware objetivo, esta cuantizacion puede ofrecer un rendimiento superior al de las GGUF convencionales gracias a los tipos nativos FP4/FP8.

## Limitaciones y advertencias

- Incompatibilidad con software estandar: los archivos GGUF con tipos ROCmFP4/ROCmFPX no se cargan en llama.cpp, Ollama ni LM Studio. Se requiere el fork ROCmFPX, que no es una version oficial y puede tener soporte limitado.
- Restriccion de hardware: solo funciona en GPUs AMD con arquitectura gfx1151 (RDNA 4) y ROCm 7.2.4 o superior. No es util en sistemas NVIDIA o AMD mas antiguos.
- La decodificacion especulativa (MTP) no puede combinarse con la entrada de imagenes: activar el drafter y pasar una imagen provoca un fallo critico del servidor. Para tareas de vision, debe desactivarse el drafter.
- Para prompts de vision, se recomienda usar `max_tokens: 1024`; con valores menores, el modelo puede agotar el presupuesto de tokens pensando y devolver una respuesta vacia con `finish_reason: length`.
- Los resultados de velocidad se obtuvieron en un hardware concreto y con cargas de trabajo especificas (codigo). En tareas de prosa o con otros sistemas, el rendimiento puede variar significativamente.
- No se han publicado evaluaciones de calidad (benchmarks estandar) para esta cuantizacion, por lo que no se puede garantizar que la degradacion respecto al modelo original sea minima en todas las tareas.
- La licencia Gemma de Google impone restricciones de uso comercial y de redistribucion. Es responsabilidad del usuario revisar los terminos completos antes de utilizarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Gemma-4-31B-it-ROCmFP4-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Modelo base (Google): https://huggingface.co/google/gemma-4-31B-it
- Drafter oficial (mencionado en la model card): https://huggingface.co/google/gemma-4-31B-it-assistant
