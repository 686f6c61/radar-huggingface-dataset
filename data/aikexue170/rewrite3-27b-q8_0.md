# aikexue170/rewrite3-27b-q8_0

## Resumen

rewrite3-27b-q8_0 es una cuantización GGUF Q8_0 del modelo rewrite3-27B, un ajuste fino de Qwen/Qwen3.8-27B desarrollado por el usuario aikexue170 y orientado específicamente a la reescritura de novelas web chinas. El modelo resuelve un problema muy concreto: tomar texto degradado generado por IA (lo que el autor denomina "AIGC 劣化稿", con muletillas y relleno típicos de modelo) y reescribirlo en prosa fluida, con estilo de autor y sin copiar literalmente el original. Está entrenado exclusivamente en chino (zh) y su ámbito de aplicación es la ficción serializada en plataformas de web-novel.

La arquitectura subyacente es la del modelo base Qwen3.8-27B, del que no se detallan en la información disponible ni el número exacto de parámetros activos ni la longitud de contexto nativa. El autor sí documenta dos innovaciones relevantes: un modo de razonamiento específico para la tarea de reescritura (cadena de pensamiento orientada a detectar "八股", es decir, clichés de IA) y un cabezal MTP (multi-token prediction) afinado e incrustado en el GGUF para decodificación especulativa, lo que incrementa los tokens por segundo.

La relevancia de esta ficha reside en su enfoque de evaluación: el autor entrena un discriminador externo (jevnovel3 0.8B) que puntúa la probabilidad de que una frase sea "mala" (estilo IA), y lo usa tanto para construir el dataset como para medir la calidad de cada cuantización. Es un caso poco habitual de modelo especializado con métrica propia de dominio, publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 16384`) |
| Tipos de cuantizacion | Q8_0 (este repositorio); también BF16, FP8 W8A8, NVFP4 W4A4, IQ4_XS, Q4_K_M, Q3_K_M e IQ3_XS en repositorios hermanos |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0), con cabezal MTP incrustado (`blk.64.nextn.*`); otras variantes en safetensors/compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B mediante ajuste fino supervisado, sin que la información disponible detalle si hubo RLHF o DPO posteriores. La particularidad arquitectónica documentada es la incorporación de un cabezal MTP afinado que se distribuye incrustado en el archivo GGUF y se activa en llama.cpp con `--spec-type draft-mtp --spec-draft-n-max 3` para decodificación especulativa. El autor reporta que este ajuste del MTP incrementa los TPS (tokens por segundo) respecto a la decodificación estándar, aunque no publica cifras de throughput.

El entrenamiento se apoya en un pipeline de datos en varias etapas descrito en la model card. Se parte de un corpus de 20.000 pares (texto degradado por IA → original humano) de la generación anterior (rewrite2), que presentaba tres problemas: tendencia a acortar el texto, ausencia de cadena de pensamiento que degradaba la generalización y una detección de clichés basada solo en priors del dataset. La versión actual introduce un discriminador externo, jevnovel3 0.8B, que asigna a cada frase una probabilidad de ser "mala"; sobre esa señal se construye un corpus ampliado con Claude Opus 5.5 (primera expansión de detalles), correcciones puntuales con Spark X 2.6 y una última pasada con Kimi K3, cada una validada de nuevo con jevnovel3. Finalmente, Gemini 4 Argon genera las cadenas de pensamiento que explican el tipo de cliché detectado, la puntuación jevnovel y la estrategia de reescritura, produciendo el mapeo CoT completo. El resultado es un modelo entrenado para razonar explícitamente sobre qué frases son artificiales antes de reescribirlas.

## Capacidades

- Reescritura de prosa en chino: transforma texto degradado por IA en narración fluida con estilo de autor, con una restricción declarada de no copiar más de 15 caracteres consecutivos del original.
- Detección implícita de clichés de IA ("八股") mediante cadena de pensamiento especializada, guiada por tipos de cliché definidos en el corpus de entrenamiento.
- Razonamiento multi-paso en modo thinking: el modelo genera primero un análisis (puntuación de calidad, tipo de cliché, plan de reescritura) y después el texto final.
- Decodificación especulativa con MTP integrado, que acelera la generación en llama.cpp.
- Generación de texto largo: en las pruebas del autor, las salidas rondan los 1.000 caracteres por muestra.
- Capacidad multilingüe: limitada al chino según la etiqueta de idioma del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Reescritura editorial de novelas web: el modelo recibe un capítulo con estilo artificial y devuelve una versión con voz de autor, controlable mediante instrucciones de longitud en el prompt para evitar el efecto de "alargar con relleno".
- Limpieza de borradores generados por otros LLM: útil para autores que producen primer borrador con un modelo general y necesitan eliminar muletillas y estructuras repetitivas antes de publicar.
- Control de calidad en plataformas de publicación serializada: se puede usar como paso previo a la revisión humana para reducir el porcentaje de texto con huella de IA, midiendo la mejora con el propio discriminador jevnovel3.
- Ajuste de estilo por autor: al estar entrenado sobre pares degradado→humano, permite aproximar un registro narrativo natural sin necesidad de fine-tuning adicional, siempre que el género sea ficción china.
- Generación de variantes de un mismo pasaje: con temperatura moderada y el modo thinking activo, produce reescrituras alternativas que respetan la trama pero cambian la formulación, útil para pruebas A/B de capítulos.
- Despliegue local en estaciones de trabajo: la variante Q8_0 (29,0 GB) o IQ4_XS (15,5 GB) permite ejecutar el modelo en una GPU de consumo de gama alta con llama.cpp, sin depender de API externa, algo relevante para manuscritos no publicados.
- Investigación sobre evaluación de estilo: el par modelo + discriminador sirve como banco de pruebas para estudiar detección de texto generado por IA en chino literario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica una evaluación propia de dominio con el discriminador jevnovel3 sobre seis prompts, con KV cache en bf16 y misma máquina:

| Formato | JEV medio ↓ | Desviación del original ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud media | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |
| Q8_0 (GGUF) | — | — | — | — | — | — | — |

El propio autor indica que Q8_0 y BF16 no se han evaluado aún con esta batería de seis prompts. La puntuación JEV es la probabilidad media de que una frase sea "mala" según jevnovel3 0.8B; por debajo de 0,08 se considera limpio, entre 0,08 y 0,12 el rango normal de reescritura, y por encima de 0,2 se asocia a estilo IA evidente. La "desviación del original" mide la proporción de ventanas de 5 caracteres ausentes en el texto fuente. El autor concluye que FP8 > IQ4_XS > NVFP4 en calidad, con IQ4_XS casi el doble de rápido.

## Requisitos de hardware

- VRAM para Q8_0: el archivo pesa 29,0 GB (27,05 GiB); se necesita al menos esa cantidad más el espacio de contexto y KV cache. Con contexto de 16.384 tokens y KV cache en bf16, una GPU de 32 GB (A100 40 GB, RTX 5090 de 32 GB, L40S) es el mínimo práctico.
- Alternativas de menor huella: IQ4_XS (15,5 GB) cabe en GPUs de 16 GB como RTX 4080/4090/5080; Q3_K_M (13,7 GB) e IQ3_XS (12,3 GB) están pensados para 12-16 GB.
- El autor advierte que Q4_K_M (17,0 GB) no cabe en una GPU de 16 GB y recomienda IQ4_XS en su lugar.
- GPUs recomendadas: A100 40/80 GB o H100 para FP8 y BF16 en producción; RTX 4090/5090 para Q8_0 e IQ4_XS en local.
- Despliegue: llama.cpp (nightly b12374 o superior) con `llama-server` y las opciones `--n-gpu-layers 99 --spec-type draft-mtp --spec-draft-n-max 3`; para las variantes BF16/FP8/NVFP4 el autor remite a vLLM.
- Latencia observada: 41 s para IQ4_XS, 43 s para NVFP4 y 71 s para FP8 en la batería de seis prompts, incluyendo razonamiento y texto final. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de reescritura de novelas web en chino con los que contrastar parámetros, contexto o licencia. La comparación disponible es interna, entre las propias cuantizaciones del modelo:

| Variante | Peso | Calidad (JEV) | Velocidad relativa | Uso recomendado por el autor |
|:--|--:|--:|--:|:--|
| BF16 | 54,7 GB | referencia (no evaluada) | lenta | Referencia de calidad |
| FP8 W8A8 | 35,9 GB | 0,0966 | 71 s | Despliegue principal |
| Q8_0 GGUF | 29,0 GB | no evaluada | no medida | GGUF casi sin pérdida |
| IQ4_XS GGUF | 15,5 GB | 0,0982 | 41 s | Local con VRAM ajustada |
| NVFP4 W4A4 | 19,7 GB | 0,1016 | 43 s | Blackwell; el autor prefiere IQ4_XS |
| Q4_K_M GGUF | 17,0 GB | no evaluada | no medida | No recomendada (no cabe en 16 GB) |
| Q3_K_M GGUF | 13,7 GB | no evaluada | no medida | GPUs de 16 GB con margen |
| IQ3_XS GGUF | 12,3 GB | no evaluada | no medida | VRAM muy limitada |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para reescritura de ficción china; su rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Solo chino: la etiqueta de idioma del repositorio es `zh`; no hay evidencia de capacidad en castellano ni en otras lenguas.
- Riesgo de alucinación narrativa: el pipeline de datos usa expansión con modelos de terceros para "añadir detalle"; el autor reconoce que en ocasiones el modelo alarga el texto más que el original ("加料换长度"), lo que puede introducir información no presente en la fuente.
- Dependencia de un discriminador externo: la métrica de calidad JEV la produce jevnovel3 0.8B, un modelo del mismo autor; no es una evaluación independiente y puede estar sesgada hacia el estilo que ese discriminador premia.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval ni similares, ni comparación con modelos de propósito general, lo que impide situar su calidad absoluta.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B, que conviene verificar por separado.
- Metadatos incompletos: la longitud de contexto nativa, el número de parámetros activos y la composición exacta del dataset no se detallan en la información disponible.
- Madurez baja: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor anuncia evaluaciones pendientes para Q8_0, BF16 y las cuantizaciones de 3-4 bits.
- El ejemplo de despliegue de llama.cpp requiere una versión nightly concreta (b12374 o superior) para cargar el cabezal MTP; versiones anteriores pueden fallar.

## Enlaces

- Repositorio Hugging Face (Q8_0): https://huggingface.co/aikexue170/rewrite3-27b-q8_0
- Repositorio ModelScope (Q8_0): https://modelscope.cn/models/alkaid55555/rewrite3-27b-q8_0
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante IQ4_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- Variante Q4_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante Q3_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q3km
- Variante IQ3_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discriminador jevnovel3 0.8B: no disponible (enlace no incluido en la información proporcionada)
