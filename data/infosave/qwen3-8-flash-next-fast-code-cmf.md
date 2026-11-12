# infosave/Qwen3.8-Flash-Next-Fast-Code-cmf

## Resumen

Qwen3.8-Flash-Next Fast Code — CMF es una versión podada y cuantizada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario infosave bajo el identificador infosave/Qwen3.8-Flash-Next-Fast-Code-cmf. Se trata de un recorte orientado específicamente a código: de los 512 expertos enrutados de cada capa del modelo MoE original se conservan 256, seleccionados por su frecuencia de activación sobre un corpus de tareas de programación y una especificación de tarea de front-end. Los pesos se almacenan a 4 bits (formato q4tp) junto con el experto compartido, la cabeza draft (MTP) y una tabla de n-gramas, todo empaquetado en un único fichero CMF de 66,8 GB.

El modelo está pensado para ejecutarse con cortiq, un motor de inferencia escrito en Rust sin Python ni frameworks de ML, con soporte de decodificación especulativa mediante la cabeza MTP y una tabla de n-gramas de 28 GB que permanece en RAM del sistema. Su interés práctico radica en que reduce los requisitos de memoria frente al fichero completo de 512 expertos (98,6 GB): cabe en una tarjeta de 96 GB con un pico de 40,9 GB de VRAM a 32K de contexto, y mediante el backend CUDA puede servirse en tarjetas desde 12 GB descargando a la CPU los expertos que no caben en la GPU.

La licencia es qwen-community-1.0 (etiquetada como "other"), heredada del modelo base, y los idiomas declarados son inglés, ruso y chino. El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, lo que indica que se trata de una publicación reciente y de nicho, orientada a un caso de uso muy concreto: generación de código de front-end y tareas de programación en entornos con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 512 expertos enrutados por capa en el modelo base; esta versión conserva 256 expertos por capa, más experto compartido, cabeza draft (MTP) y tabla de n-gramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | evaluado hasta 32K tokens en los benchmarks del autor; máximo nativo no disponible |
| Tipos de cuantizacion | q4tp (4 bits) para expertos enrutados y tabla de n-gramas; 8 bits para atención, embeddings y cabeza de salida |
| Idiomas soportados | en, ru, zh |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | CMF (fichero único de 66,76 GB), más un fichero de perfil de enrutamiento de 49 KB y un checksum SHA256 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) con 512 expertos enrutados por capa. Esta versión no reentrena el modelo: aplica poda de expertos y cuantización. La selección de los 256 expertos conservados se realizó a partir de dos textos normalizados y ponderados por igual: 450 KB de tareas y respuestas de programación (Magicoder OSS-Instruct en sus distintos lenguajes y Evol-Instruct) y la especificación de una acuario 3D en three.js junto con seis respuestas a la misma. Según el autor, los expertos conservados cubren el 83 % de la masa de enrutamiento del código y el 81 % de la de la tarea de referencia; un recorte basado solo en código cubría el 87 % y el 65 % respectivamente, y su página de acuario no funcionaba.

La innovación técnica destacable es la combinación de poda de expertos con cuantización q4tp y decodificación especulativa mediante la cabeza MTP del modelo base, más una tabla de n-gramas de 28 GB que se mantiene en RAM del sistema. El motor cortiq implementa además un backend CUDA que reparte la carga entre GPU y CPU: la tarjeta retiene los expertos que caben (priorizando los más activos según el perfil de enrutamiento), un kernel AVX-512 VNNI sobre los pesos de 4 bits calcula en CPU los expertos que no caben, y los expertos muy solicitados migran a la GPU entre tokens. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su construcción.

## Capacidades

- Generación de texto y de código, con especial énfasis en tareas de programación tras la poda de expertos orientada a código.
- Generación de código de front-end: el autor reporta que produce una página funcional en three.js a partir de una especificación de 2.151 tokens al primer intento en 4 de 4 ejecuciones.
- Modo de razonamiento (thinking) activable; la opción `--no-think` solicita respuesta directa.
- Decodificación especulativa mediante cabeza draft (MTP) y tabla de n-gramas.
- Servidor compatible con la API de OpenAI mediante `cortiq serve`.
- Soporte multilingüe limitado a inglés, ruso y chino según los metadatos.
- Ejecución en Vulkan y CUDA, con reparto GPU/CPU en tarjetas desde 12 GB.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de prototipos de front-end: el modelo está podado sobre tareas de programación y una especificación de acuario 3D, por lo que es adecuado para producir páginas HTML/three.js funcionales a partir de especificaciones largas, como demuestra el ejemplo del autor con una entrada de 2.151 tokens.
- Autocompletado y generación de código en editores: mediante `cortiq serve` con el modelo cargado de forma persistente, se evita recargar los 66,8 GB en cada petición, lo que permite integraciones de baja latencia en IDE.
- Servicio de generación de código en GPU de gama media: con el backend CUDA y reparto GPU/CPU, el modelo escribe código a 105/118/133 tokens/s en tarjetas de 12/16/24 GB, lo que permite desplegarlo en estaciones de trabajo sin GPU de 96 GB.
- Tareas de programación en ruso y chino: los idiomas declarados incluyen ru y zh, por lo que puede usarse para generar código y explicaciones técnicas en esos idiomas además del inglés.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de perplexity y HumanEval frente al fichero completo y frente al recorte de 2 bits de Strata Coder, lo que lo hace útil como referencia en estudios de poda y cuantización de MoE.
- Razonamiento con contexto largo en código: con ventana evaluada hasta 32K tokens y velocidades de prompt de 798–844 tokens/s, puede procesar repositorios o especificaciones extensas antes de generar código.
- Despliegue en entornos sin Python: al ejecutarse con cortiq, un motor Rust sin frameworks de ML, encaja en infraestructuras que evitan dependencias de Python para servir modelos.

## Benchmarks y rendimiento

Datos publicados por el autor, ejecutados en una RTX PRO 6000 (96 GB, Vulkan), un stream, mismas peticiones, greedy, sin thinking y con draft tokens activados. Strata Coder es el recorte de 2 bits de ISTA-DASLab del mismo modelo base, ejecutado en su propio motor Strata 0.1.58; el fichero completo es el q4tp de 512 expertos ejecutado en cortiq.

| Metrica | Fast Code | Strata Coder (Strata) | Fichero completo (cortiq) |
|---|---:|---:|---:|
| Especificación de acuario, greedy: página funcional | primer intento | tras un turno de reparación | primer intento |
| HumanEval pass@1 (164 tareas) | 93,3 % | 94,5 % | 94,5 % |
| Perplexity de código escrito después del 20.10.2026 (8192 tokens) | 3,337 | 3,436¹ | 3,366 |
| Perplexity de código Rust (1536 tokens) | 4,900 | 4,690¹ | 4,111 |
| Prompt 1K / 4K / 16K / 32K tokens (tok/s) | 798 / 827 / 844 / 842 | 1916 / 5492 / 7229 / 7659 | 171 / 208 / 206 / 210 |
| Generación tras prompt de 4K / 16K / 32K (tok/s) | 161 / 166 / 136 | 220 / 223 / 222 | 118 / 138 / 116 |
| Fichero en disco | 66,8 GB | 58,4 GB + 5,2 GB MTP | 98,6 GB |
| Pico de VRAM (contexto 32K) | 40,9 GB | 31,1 GB | 59,6 GB |

¹ Pesos de Strata Coder importados a CMF y ejecutados por cortiq, con el mismo texto y tokenizador. HumanEval: greedy, sin thinking, el código de la respuesta ejecutado contra los tests (±3 tareas de ruido entre ejecuciones). Las velocidades de Fast Code son la media de dos ejecuciones. La tabla de n-gramas (28 GB) permanece en RAM del sistema en todas las filas.

## Requisitos de hardware

- VRAM estimada: 40,9 GB de pico con contexto de 32K en una RTX PRO 6000 de 96 GB; el fichero ocupa 66,8 GB en disco y la tabla de n-gramas de 28 GB reside en RAM del sistema.
- GPU recomendadas: RTX PRO 6000 (96 GB) para ejecución completa en Vulkan; con CUDA, tarjetas NVIDIA desde 12 GB mediante reparto GPU/CPU.
- Cabe en GPU de consumo: con el backend CUDA, el autor reporta funcionamiento en tarjetas de 12, 16 y 24 GB, con velocidades de generación de 105, 118 y 133 tokens/s respectivamente para la página de acuario.
- Opciones de despliegue: cortiq (versión 0.8.65 o posterior; 0.8.74 o posterior para el backend CUDA), con `cortiq run` para una ejecución puntual y `cortiq serve` como servidor compatible con OpenAI; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prompt a 798/827/844/842 tokens/s para 1K/4K/16K/32K; generación a 161/166/136 tokens/s tras prompts de 4K/16K/32K. En tarjetas de 12/16/24 GB con CUDA, generación a 105/118/133 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fast Code (este modelo) | 256 de 512 expertos por capa, q4tp | evaluado hasta 32K | 93,3 % | qwen-community-1.0 | CMF, cortiq |
| Strata Coder (ISTA-DASLab) | 256 expertos, 2 bits | no disponible | 94,5 % | no disponible | Strata 0.1.58, CUDA |
| Qwen3.8-Flash-Next completo (q4tp) | 512 expertos | evaluado hasta 32K | 94,5 % | qwen-community-1.0 | CMF, cortiq |

El modelo completo ofrece mayor precisión en HumanEval y en perplexity de Rust (4,111 frente a 4,900), pero requiere 98,6 GB en disco y 59,6 GB de pico de VRAM, con velocidades de prompt de 171–210 tokens/s. Strata Coder logra la mayor velocidad de prompt (1916–7659 tokens/s) y ligera ventaja en HumanEval, pero su página de acuario requirió un turno de reparación y su perplexity en Rust es inferior a la del fichero completo. Fast Code se sitúa como el punto intermedio: menor huella (66,8 GB, 40,9 GB de VRAM) y velocidad de prompt cuatro veces mayor que el fichero completo, a costa de una ligera pérdida de precisión.

## Limitaciones y advertencias

- El recorte está optimizado para código: el propio autor recomienda usar el fichero completo para chat general.
- La selección de expertos usó la especificación de acuario entre los textos de selección, lo que puede introducir sesgo hacia ese tipo de tareas de front-end.
- HumanEval es 1,2 puntos inferior al fichero completo (93,3 % frente a 94,5 %), con ±3 tareas de ruido entre ejecuciones.
- La perplexity en Rust es notablemente peor que la del fichero completo (4,900 frente a 4,111), lo que sugiere degradación en lenguajes menos representados en el corpus de selección.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Idiomas limitados a inglés, ruso y chino; no se declara soporte de español.
- Riesgo de alucinación no cuantificado en la información disponible; no se publican evaluaciones de sesgo.
- Dependencia del motor cortiq y del formato CMF: no hay soporte documentado en vLLM, llama.cpp u otros motores habituales.
- El autor advierte que cada `cortiq run` recarga el modelo; para uso interactivo es necesario `cortiq serve`.
- El repositorio tiene 0 descargas, por lo que no hay validación independiente de las métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-Flash-Next-Fast-Code-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fichero completo de 512 expertos: https://huggingface.co/infosave/Qwen3.8-Flash-Next-cmf
- Repositorio del motor CMF/cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Imagen del acuario generado: https://huggingface.co/infosave/Qwen3.8-Flash-Next-Fast-Code-cmf/resolve/main/assets/fc_aquarium.png
- Gráfico de velocidad: https://huggingface.co/infosave/Qwen3.8-Flash-Next-Fast-Code-cmf/resolve/main/assets/fc_speed_en.png
- Gráfico de precisión en código: https://huggingface.co/infosave/Qwen3.8-Flash-Next-Fast-Code-cmf/resolve/main/assets/fc_quality_en.png
