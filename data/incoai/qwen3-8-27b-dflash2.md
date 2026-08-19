# incoai/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo de borrador (draft model) desarrollado por Inco AI para acelerar la decodificación especulativa del modelo Qwen/Qwen3.8-27B de Alibaba. No es un modelo de lenguaje independiente: se ejecuta dentro de un servidor de inferencia (SGLang o vLLM) y genera bloques de tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia y aumentando el throughput sin alterar la distribución de salida.

La arquitectura se basa en difusión por bloques (block diffusion) con un selector de caminos candidatos y convoluciones dinámicas de dos taps, lo que permite predecir bloques completos de tokens en una sola pasada. Con 1.924.404.480 parámetros (aproximadamente 1,9 mil millones), es un modelo compacto que se complementa con el modelo objetivo de 27 mil millones. La decodificación es sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva la distribución original.

Su relevancia actual radica en que aborda el cuello de botella de la inferencia autoregresiva en modelos grandes, ofreciendo aceleraciones de hasta 3,43× en throughput con concurrencia 1 y manteniendo ganancias significativas incluso con concurrencia 32. Está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter con selector de caminos y convoluciones dinamicas de dos taps |
| Parametros totales | 1.924.404.480 (1,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | BF16 (GGUF disponible) |
| Idiomas soportados | No disponible (depende del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusión por bloques diseñado para decodificación especulativa. A diferencia de los drafters autoregresivos tradicionales, predice un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posición. Un selector ligero traza un camino coherente a través de estos candidatos, y las convoluciones dinámicas de dos taps en el backbone evitan que el borrador se degrade hacia el final del bloque.

El modelo se entrena para imitar la distribución del modelo objetivo Qwen3.8-27B, de modo que la verificación de tokens sea eficiente. La decodificación es lossless: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera bloques de tokens candidatos que el modelo objetivo verifica en paralelo.
- Compatibilidad con los motores SGLang y vLLM mediante integración nativa (algoritmo DFLASH).
- Decodificación sin pérdida: la salida greedy es idéntica a la del modelo objetivo y el muestreo conserva la distribución original.
- Soporte de bloques de especulación de 7-8 tokens por paso de verificación.
- No es un modelo de generación de texto independiente: requiere el modelo objetivo Qwen3.8-27B para funcionar.
- Las capacidades funcionales (razonamiento, código, visión, tool calling, etc.) son las del modelo objetivo, no las del drafter.

## Casos de uso

- Servicios de chat y asistentes conversacionales: al desplegar Qwen3.8-27B con DFlash 2 en SGLang o vLLM, se reduce la latencia por petición en entornos de baja concurrencia, mejorando la experiencia de usuario en aplicaciones interactivas.
- Generación de código en producción: en tareas como HumanEval y MBPP, DFlash 2 alcanza una longitud de aceptación de 4,39 y 4,79 tokens respectivamente, lo que acelera la generación de código en pipelines de CI/CD o asistentes de programación.
- Razonamiento matemático y resolución de problemas: con GSM8K y MATH-500, el drafter logra las mayores longitudes de aceptación (5,46 y 5,28), reduciendo el tiempo de respuesta en aplicaciones educativas o de análisis.
- Agentes autónomos y flujos multi-paso: la aceleración de la decodificación permite ejecutar más iteraciones de razonamiento en el mismo tiempo, mejorando la capacidad de los agentes para planificar y ejecutar tareas complejas.
- Inferencia a gran escala con alta concurrencia: aunque la ganancia se reduce con concurrencia 32, DFlash 2 sigue superando a la decodificación autoregresiva (1,45× en GSM8K), lo que lo hace útil en entornos de producción con muchos usuarios simultáneos.
- Despliegue en hardware limitado: al ser un modelo pequeño (1,9 B), el drafter añade poca sobrecarga de memoria y cómputo, permitiendo acelerar modelos de 27 B en GPUs de gama alta sin necesidad de hardware adicional.

## Benchmarks y rendimiento

Los benchmarks se obtuvieron con SGLang sobre una NVIDIA H200, con FlashAttention 3 para la atención del objetivo y del drafter, bloque de especulación de 8 (7 tokens de borrador por paso), muestreo con temperatura 1.0, top-p 0.95, top-k 20 y esfuerzo de razonamiento xhigh. Se comparan la decodificación autoregresiva, el MTP integrado de Qwen3.8, un drafter DSpark de la comunidad y DFlash 2.

### Longitud de aceptación (mayor es mejor)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.02 | 4.36 | **5.46** |
| MATH-500 | 4.72 | 3.92 | **5.28** |
| HumanEval | 3.91 | 3.30 | **4.39** |
| MBPP | 3.99 | 3.51 | **4.79** |
| MT-Bench | 3.74 | 3.01 | **4.10** |

### Throughput con concurrencia 1 (output tok/s, speedup vs. autoregresivo)

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |

### Throughput con concurrencia 8

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |

### Throughput con concurrencia 32

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

## Requisitos de hardware

- El drafter en BF16 ocupa aproximadamente 3,8 GB de VRAM (1,9 B parámetros × 2 bytes), más la memoria del modelo objetivo Qwen3.8-27B en BF16 (~54 GB), lo que suma unos 58 GB. Se recomienda una GPU con al menos 80 GB de VRAM (A100, H100, H200).
- En la evaluación se utilizó una NVIDIA H200 con FlashAttention 3 para la atención del objetivo y del drafter.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB) si el modelo objetivo se carga en BF16 completo; sin embargo, con cuantización del modelo objetivo (por ejemplo, 4 bits) podría ser viable en GPUs de 24-48 GB, aunque no se han publicado datos al respecto.
- Opciones de despliegue: SGLang (con el algoritmo DFLASH) y vLLM (con configuración especulativa dflash). También existe una versión GGUF para llama.cpp, lo que sugiere compatibilidad con ese motor.
- Latencia y throughput: con concurrencia 1, DFlash 2 alcanza entre 184 y 236 tokens/s según la tarea (2,67× a 3,43× sobre autoregresivo). Con concurrencia 8, entre 1.090 y 1.368 tokens/s (2,27× a 2,85×). Con concurrencia 32, entre 1.525 y 1.952 tokens/s (1,01× a 1,45×).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento (GSM8K, conc. 1) |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2 | Drafter block-diffusion | 1,9 B | No aplica | Apache 2.0 | 236,1 tok/s (3,43×) |
| Qwen3.8-27B MTP | Multi-token prediction integrado | 0 (parte del modelo) | No aplica | Apache 2.0 | 178,5 tok/s (2,59×) |
| RadixArk/Qwen3.8-27B-DSpark | Drafter especulativo | No disponible | No aplica | No disponible | 185,3 tok/s (2,69×) |

DFlash 2 supera tanto al MTP integrado como al drafter DSpark en todas las tareas evaluadas, tanto en longitud de aceptación como en throughput, con la ventaja adicional de ser lossless.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: requiere el modelo objetivo Qwen3.8-27B y un motor de inferencia compatible (SGLang o vLLM) para funcionar.
- La ganancia de rendimiento depende de la tarea y la concurrencia: a alta concurrencia (32), la aceleración se reduce considerablemente (hasta 1,01× en MT-Bench), aunque sigue siendo positiva.
- La integración requiere versiones específicas de SGLang y vLLM (pull requests en desarrollo), lo que puede limitar su uso en entornos de producción estables.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma del drafter en sí; estas dependen del modelo objetivo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3.8-27B tiene su propia licencia (Apache 2.0 según el repositorio oficial), por lo que se debe verificar la compatibilidad.
- El drafter no añade capacidades nuevas al modelo objetivo: solo acelera la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio GGUF: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Espejo del checkpoint: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Repositorio del modelo objetivo Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
