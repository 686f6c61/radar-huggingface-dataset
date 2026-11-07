# infosave/Qwen3.8-Flash-Next-hot-cmf

## Resumen

Qwen3.8-Flash-Next hot — CMF es una cuantización extrema del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario infosave bajo el ecosistema CMF (un formato de pesos memory-mapped) y ejecutable con `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de aprendizaje automático. No es un modelo nuevo: es una redistribución de pesos del checkpoint original en bf16, recomprimida en un único fichero de 83,81 GB que combina expertos a 2 bits (gate/up) y 4 bits (down) con el experto compartido y los 28 expertos más enrutados de cada capa almacenados como «tubos» de 8 bits. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), aunque el autor no publica en esta ficha el número de parámetros totales ni la longitud de contexto.

La relevancia de esta variante radica en su estrategia de cuantización selectiva: en lugar de subir bits de forma uniforme, identifica qué grano del enrutamiento MoE aporta más calidad por byte. Según la model card, el experto compartido a 8 bits reduce la perplejidad de código de 4,438 a 4,241 con solo +0,3 GB, y los 28 expertos más activos de cada capa la llevan hasta 4,167 con +6,3 GB, alcanzando el 83 % del camino hacia el fichero q4tp de 97 GB. El resultado es un modelo que cabe en una GPU de 32 GB con los expertos transmitiéndose desde la RAM del sistema.

El precio de esa calidad es velocidad: en una RTX 5090 la variante hot decodifica a 27,8 tok/s frente a 59,6 tok/s del fichero de 2 bits, porque los tubos residentes (6,5 GB) restan presupuesto a la caché de expertos. Está pensado para entornos donde la VRAM es el cuello de botella y se prefiere calidad de código sobre throughput. Los idiomas declarados son inglés, ruso y chino, y la licencia es la Qwen Community 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); número de capas y expertos no disponible en la información proporcionada (se mencionan 512 expertos por capa y 12 capas de atención) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2tp-v2 (expertos: 2 bits en gate/up calibrado con GPTQ, 4 bits en down); experto compartido y 28 expertos más enrutados por capa a 8 bits; atención, embeddings y cabeza de salida a 8 bits |
| Idiomas soportados | inglés (en), ruso (ru), chino (zh) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | CMF (un fichero memory-mapped), más un fichero `.mtp.cmf` opcional para decodificación especulativa y un perfil de enrutamiento `.profile` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE del que esta ficha no detalla el recuento de parámetros ni el volumen de tokens de entrenamiento. Lo que sí documenta el autor es la estructura de enrutamiento: cada capa dispone de 512 expertos, de los cuales un experto compartido se ejecuta en todos los tokens. Sobre el checkpoint original en bf16, la conversión aplica GPTQ para calibrar los expertos de 2 bits y conserva la precisión alta en los componentes que más impactan la perplejidad.

La innovación técnica central es la selección de «expertos calientes»: mediante un perfil de enrutamiento medido sobre 8192 tokens de código y texto, se determina que los 28 expertos más activos de cada capa concentran el 43 % de la suma Σ(w·act)². Esos 28 expertos, junto con el compartido, se almacenan íntegros a 8 bits como tubos residentes en la GPU, mientras sus filas se anulan en las ternas de 2 bits para evitar duplicación. En tiempo de inferencia, dos kernels pequeños suman el tubo ganador a la salida MoE del token. El autor documenta que subir neuronas individuales a 8 bits apenas mejora (4,438 → 4,425 por +6,7 GB), mientras que la granularidad por experto sí rinde. Opcionalmente, el fichero `.mtp.cmf` activa una cabeza de predicción multi-token para decodificación especulativa, y la variable `CMF_QWEN_O1` habilita un «campo lejano» O(1) para las 12 capas de atención.

## Capacidades

- Generación de texto y razonamiento: el modelo razona antes de responder por defecto; el flag `--no-think` fuerza respuesta directa.
- Generación de código: la model card evalúa la calidad con perplejidad sobre fuentes Rust, lo que indica uso previsto en programación.
- Tool calling / function calling: el servidor compatible con OpenAI acepta el campo `tools` en `/v1/chat/completions`.
- Modo thinking controlable: parámetro `enable_thinking` en la API y flag `--no-think` en CLI.
- Decodificación especulativa: soportada mediante el fichero `.mtp.cmf` opcional, activa con `temperature: 0`.
- Multilingüismo limitado a inglés, ruso y chino según los metadatos del repositorio.
- Servidor HTTP compatible con OpenAI: endpoints `/v1/chat/completions` (con streaming), `/v1/completions`, `/v1/models`, `/healthz` y panel web en `/`.
- Ejecución multiplataforma del formato CMF: CPU, Vulkan (NVIDIA/AMD/Intel), DX12 y Metal según la página del proyecto CMF.

## Casos de uso

- Asistencia a la programación en Rust: el modelo está calibrado y evaluado sobre código Rust (perplejidad 4,167 sobre 1536 tokens), por lo que encaja en tareas de autocompletado y revisión de código en ese lenguaje.
- Despliegue en estaciones de trabajo con una sola GPU de 32 GB: al transmitir los expertos desde RAM del sistema, permite servir un MoE grande en hardware consumer de gama alta sin clúster.
- Servicio de chat interno con API compatible con OpenAI: `cortiq serve` expone `/v1/chat/completions` con streaming y tool calling, lo que permite sustituir un endpoint OpenAI por este sin reescribir clientes.
- Agentes con llamadas a herramientas: el soporte de `tools` en la API y el modo thinking permiten construir flujos multi-paso donde el modelo decide invocar funciones y razonar sobre el resultado.
- Generación de documentación técnica en inglés, ruso o chino: los tres idiomas declarados cubren la localización de manuales y guías para esos mercados.
- Inferencia en entornos sin Python ni CUDA toolkit: al ser un binario Rust con formato memory-mapped, se puede empaquetar en imágenes mínimas o sistemas con drivers Vulkan/DX12/Metal, útil en despliegues restringidos.
- Evaluación de estrategias de cuantización selectiva: investigadores que estudien el trade-off calidad/velocidad en MoE pueden comparar este fichero con el q2tp-v2 de 77 GB y el q4tp de 97 GB del mismo autor.

## Benchmarks y rendimiento

Calidad (perplejidad, menor es mejor):

| Fichero | Tamaño | Code ppl (1536 tokens) | WikiText-2 test (12 × 512 tokens) |
|---|---:|---:|---:|
| q2tp-hot (este) | 83,81 GB | 4,167 | 5,782 |
| q2tp-v2 estándar | 77 GB | 4,438 | 6,062 |
| q4tp estándar | 97 GB | 4,111 | no disponible |

Rendimiento en RTX 5090 (32 GB), Vulkan, cortiq 0.8.62, presupuesto de dispositivo de 29 GB:

| Prompt (tokens) | Primer token, s (2-bit) | Primer token, s (hot) | Decodificación, tok/s (2-bit) | Decodificación, tok/s (hot) | VRAM pico, MiB (2-bit / hot) |
|---:|---:|---:|---:|---:|---:|
| 1 000 | 3,4 | 9,0 | 59,6 | 27,8 | 30 070 / 30 420 |
| 4 000 | 19,8 | 43,4 | 54,6 | 29,9 | 29 902 / 30 829 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el fichero ocupa 83,81 GB en disco, pero el diseño permite ejecutarlo en una GPU de 32 GB con los expertos transmitiéndose desde RAM del sistema. En la medición del autor, la VRAM pico fue de 30 420 MiB (prompt de 1000 tokens) y 30 829 MiB (prompt de 4000 tokens) con un presupuesto configurado de 29 GB.
- Tubos residentes: 6,5 GB de los expertos a 8 bits permanecen fijos en la GPU y restan ese espacio a la caché de expertos (que baja de 23,4 a 17,1 GB en la tarjeta de 32 GB).
- GPU recomendadas: RTX 5090 (32 GB) es la única medida y documentada. Con más VRAM la caché de expertos crece y la velocidad mejora; el autor lo indica explícitamente («More VRAM gives the cache back»).
- Cabe en GPU consumer: sí, en una RTX 5090 de 32 GB, a costa de velocidad (aproximadamente la mitad que el fichero de 2 bits). No hay datos para tarjetas de 24 GB o menos.
- Despliegue: `cortiq` 0.8.62 o superior (binarios precompilados disponibles). Modo CLI (`cortiq run`) o servidor (`cortiq serve`). Variables relevantes: `CMF_QWEN_PROFILE` (perfil de enrutamiento) y `CMF_GPU_VRAM_MB` (presupuesto de VRAM para caché y bancos de 8 bits; 29000 en la tarjeta medida).
- Latencia y throughput medidos: primer token de 9,0 s (1000 tokens de prompt) y 43,4 s (4000 tokens); decodificación de 27,8–29,9 tok/s. Una sola secuencia medida; las peticiones concurrentes comparten la tarjeta.

## Comparativa con modelos similares

| Modelo | Tamaño en disco | Cuantización | Code ppl | WikiText-2 ppl | Licencia | Motor |
|---|---:|---|---:|---:|---|---|
| Qwen3.8-Flash-Next hot CMF (este) | 83,81 GB | 2/4 bits + tubos 8 bits | 4,167 | 5,782 | qwen-community-1.0 | cortiq |
| Qwen3.8-Flash-Next CMF q2tp-v2 | 77 GB | 2 bits | 4,438 | 6,062 | qwen-community-1.0 | cortiq |
| Qwen3.8-Flash-Next CMF q4tp | 97 GB | 4 bits | 4,111 | no disponible | qwen-community-1.0 | cortiq |
| Qwen3.8-Flash-Next (bf16 original) | no disponible | bf16 | no disponible | no disponible | qwen-community-1.0 | no disponible |

Las tres variantes cuantizadas comparten modelo base, licencia y motor; la diferencia está en el compromiso calidad/tamaño. No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Requiere `cortiq` 0.8.62 o superior: versiones anteriores no leen los tubos de 8 bits y ejecutan el fichero con sus filas a cero, lo que degrada la salida sin avisar.
- Velocidad reducida: aproximadamente la mitad de tok/s que el fichero de 2 bits en la RTX 5090 medida; el primer token es entre 2 y 2,6 veces más lento.
- Solo se ha medido una secuencia; las peticiones concurrentes comparten la GPU y no hay datos de throughput agregado.
- Idiomas limitados a inglés, ruso y chino según los metadatos; no se declara soporte de español.
- Licencia Qwen Community 1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache 2.0 o MIT).
- Repositorio con 0 descargas y 1 like en el momento de la consulta: es una publicación reciente y de un autor individual, sin validación independiente de las cifras de perplejidad.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de robustez en esta ficha.
- El modelo razona por defecto: sin `--no-think` consume más tokens y requiere subir `--max-tokens`, lo que aumenta latencia y coste.
- El formato CMF es específico del motor `cortiq`; no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Qwen3.8-Flash-Next-hot-cmf
- Repositorio CMF estándar del mismo autor: https://huggingface.co/infosave/Qwen3.8-Flash-Next-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Proyecto CMF en GitHub: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Imagen del proceso de construcción: https://huggingface.co/infosave/Qwen3.8-Flash-Next-hot-cmf/resolve/main/assets/hot_build_en.png
- Gráfica de perplejidad frente a tamaño: https://huggingface.co/infosave/Qwen3.8-Flash-Next-hot-cmf/resolve/main/assets/hot_quality_en.png
