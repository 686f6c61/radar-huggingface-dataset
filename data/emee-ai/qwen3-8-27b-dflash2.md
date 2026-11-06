# emee-ai/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo *draft* (borrador) desarrollado por Inco AI y distribuido en este repositorio espejo por emee-ai, diseñado para acelerar la inferencia del modelo Qwen3.8-27B mediante decodificación especulativa. No es un modelo de lenguaje autónomo: su función es predecir bloques de tokens que el modelo objetivo (Qwen3.8-27B) verifica posteriormente, de modo que la salida final es idéntica a la del modelo original.

Técnicamente, DFlash 2 emplea un enfoque de difusión por bloques (*block diffusion*): predice un bloque completo de tokens en una sola pasada, conserva los mejores candidatos en cada posición y utiliza un selector ligero que traza un camino coherente a través de ellos. Convoluciones dinámicas de dos tomas (*two-tap dynamic convolutions*) en la columna vertebral evitan que la calidad del borrador degrade hacia el final del bloque.

Su relevancia es alta para despliegues en producción: según las evaluaciones del autor, logra aceleraciones de hasta 3,43× frente a la decodificación autorregresiva en tareas de razonamiento matemático, superando tanto al MTP nativo de Qwen3.8 como a otros drafters de la comunidad. Es especialmente eficaz en escenarios de baja concurrencia, donde la decodificación especulativa brilla al reducir la latencia por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusión por bloques (block diffusion) para decodificación especulativa, con selector de candidatos y convoluciones dinámicas de dos tomas |
| Parametros totales | 1.924.404.480 (aprox. 1,92 B, según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo generativo autónomo) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión original) |
| Idiomas soportados | no disponible (hereda del modelo objetivo Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un *drafter* de difusión por bloques. En lugar de predecir tokens de uno en uno como un drafter autorregresivo clásico, genera un bloque completo de tokens en una única pasada y mantiene los principales candidatos en cada posición del bloque. Un selector ligero recorre estos candidatos para construir un camino coherente que se propone al modelo objetivo. La columna vertebral incorpora convoluciones dinámicas de dos tomas, que según el autor evitan la degradación de la calidad del borrador hacia el final del bloque, un problema habitual en los drafters paralelos.

La decodificación es *lossless* (sin pérdidas): en modo *greedy*, la salida coincide exactamente con la del modelo objetivo, y en modo muestreo se preserva su distribución de probabilidad. No hay información disponible sobre el proceso de entrenamiento del drafter (número de tokens, composición del dataset ni uso de RLHF/DPO). El modelo base es Qwen/Qwen3.8-27B, un ajuste fino del cual deriva este repositorio según las etiquetas de Hugging Face.

## Capacidades

- No genera texto de forma autónoma: su única función es proponer bloques de 7 tokens por paso de verificación para el modelo Qwen3.8-27B.
- Compatible con servidores de inferencia SGLang y vLLM mediante decodificación especulativa (algoritmo DFLASH).
- Decodificación sin pérdidas: salida greedy idéntica al modelo objetivo y distribución de muestreo preservada.
- Acelera todos los tipos de tarea del modelo objetivo: razonamiento matemático, generación de código y conversación general (según los benchmarks de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench).
- Bloque de especulación configurable (tamaño 8, es decir, 7 tokens borrador por verificación en las evaluaciones).
- No soporta vision, audio ni otras modalidades; no disponible información sobre tool calling propio del drafter.

## Casos de uso

- Servicios de chat de baja latencia: en despliegues con 1-8 usuarios concurrentes, DFlash 2 reduce el tiempo por respuesta hasta 3,43× (por ejemplo, de 68,9 a 236,1 tok/s en GSM8K), lo que mejora notablemente la experiencia de usuario en asistentes conversacionales.
- Generacion de codigo asistida: en tareas tipo HumanEval y MBPP, el drafter acelera la generación entre 3,11× y 3,29× con un solo usuario, ideal para IDEs y completado de código interactivo donde la latencia es crítica.
- Razonamiento matematico intensivo: con el modo de razonamiento `xhigh` de Qwen3.8 (secuencias largas de pensamiento), la aceleración en GSM8K y MATH-500 reduce el coste temporal de cadenas de razonamiento extensas.
- Servidores de inferencia multiusuario: con concurrencia 8, el throughput sube de ~480 a ~1.370 tok/s en MATH-500 (2,85×), útil para APIs de LLM con carga moderada.
- Optimizacion de costes de GPU: al aumentar el throughput por GPU sin cambiar el modelo objetivo, se reduce el número de instancias necesarias para atender una misma carga, disminuyendo el coste por token servido.
- Despliegue en SGLang o vLLM existentes: se integra como parámetro adicional en servidores ya operativos, sin modificar la aplicación cliente ni el comportamiento del modelo.
- Procesamiento por lotes con concurrencia alta: incluso a concurrencia 32 mantiene mejoras (hasta 1,45× en GSM8K), donde otros métodos especulativos como MTP llegan a degradar el rendimiento por debajo de la línea base autorregresiva.

## Benchmarks y rendimiento

Evaluación del autor: SGLang sobre una NVIDIA H200, FlashAttention 3 para modelo objetivo y drafter, bloque de especulación de 8 (7 tokens borrador por verificación), muestreo con los parámetros recomendados de Qwen3.8 (temperature 1.0, top-p 0.95, top-k 20, esfuerzo de razonamiento `xhigh`), máximo de 4096 tokens nuevos.

### Longitud de aceptacion (acceptance length, mayor es mejor)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5,02 | 4,36 | **5,46** |
| MATH-500 | 4,72 | 3,92 | **5,28** |
| HumanEval | 3,91 | 3,30 | **4,39** |
| MBPP | 3,99 | 3,51 | **4,79** |
| MT-Bench | 3,74 | 3,01 | **4,10** |

### Throughput, concurrencia 1 (tok/s y aceleracion vs. autorregresivo)

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68,9 | 178,5 (2,59×) | 185,3 (2,69×) | **236,1 (3,43×)** |
| MATH-500 | 69,0 | 172,8 (2,51×) | 174,5 (2,53×) | **230,7 (3,34×)** |
| HumanEval | 69,0 | 151,9 (2,20×) | 159,9 (2,32×) | **214,6 (3,11×)** |
| MBPP | 69,0 | 153,1 (2,22×) | 163,3 (2,37×) | **226,9 (3,29×)** |
| MT-Bench | 68,9 | 134,9 (1,96×) | 137,6 (2,00×) | **184,0 (2,67×)** |

### Throughput, concurrencia 8

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467,2 | 1.022,1 (2,19×) | 1.040,8 (2,23×) | **1.328,7 (2,84×)** |
| MATH-500 | 480,0 | 1.023,5 (2,13×) | 1.025,8 (2,14×) | **1.368,3 (2,85×)** |
| HumanEval | 483,4 | 934,2 (1,93×) | 956,5 (1,98×) | **1.291,5 (2,67×)** |
| MBPP | 478,0 | 938,1 (1,96×) | 974,1 (2,04×) | **1.328,0 (2,78×)** |
| MT-Bench | 480,5 | 835,2 (1,74×) | 802,3 (1,67×) | **1.090,2 (2,27×)** |

### Throughput, concurrencia 32

| Tarea | Autoregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1.329,8 | 1.381,1 (1,04×) | 1.506,5 (1,13×) | **1.922,5 (1,45×)** |
| MATH-500 | 1.505,8 | 1.415,6 (0,94×) | 1.429,0 (0,95×) | **1.951,8 (1,30×)** |
| HumanEval | 1.546,5 | 1.296,8 (0,84×) | 1.330,1 (0,86×) | **1.799,0 (1,16×)** |
| MBPP | 1.507,7 | 1.314,9 (0,87×) | 1.361,3 (0,90×) | **1.886,8 (1,25×)** |
| MT-Bench | 1.507,4 | 1.159,7 (0,77×) | 1.115,5 (0,74×) | **1.525,3 (1,01×)** |

Nota: estos datos son los publicados por el autor del modelo; no se han verificado de forma independiente.

## Requisitos de hardware

- El drafter añade aproximadamente 1,92 B de parámetros (3,8 GB en safetensors) sobre los requisitos del modelo objetivo Qwen3.8-27B; la VRAM total dependerá del tamaño y cuantización de dicho modelo objetivo (no disponible en la información proporcionada).
- Las evaluaciones oficiales se realizaron sobre una NVIDIA H200 con FlashAttention 3; esta es la GPU de referencia para reproducir los resultados publicados.
- No hay mediciones publicadas en GPUs de consumo; dado que el modelo objetivo es de 27B, cabe esperar que se necesiten GPUs de gama datacenter (A100, H100, H200) o configuraciones multi-GPU de gama alta, pero no disponible confirmación específica.
- Despliegue soportado oficialmente en SGLang (parámetros `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`) y vLLM (mediante `--speculative-config` con método `dflash`; requiere una versión de desarrollo de vLLM, pull request 52816).
- No se menciona soporte para llama.cpp ni Ollama; no disponible.
- Latencia y throughput: ver las tablas de benchmarks; con concurrencia 1 se alcanzan hasta 236 tok/s en H200, frente a ~69 tok/s en decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Metodo | Mejor aceleracion publicada | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2 (este) | Drafter block diffusion | ~1,92 B | Bloque paralelo + selector | 3,43× (concurrencia 1, GSM8K) | Apache 2.0 |
| Qwen3.8 MTP nativo | Drafter multi-token prediction | no disponible | MTP integrado (7 tokens) | 2,59× (concurrencia 1, GSM8K) | no disponible |
| RadixArk/Qwen3.8-27B-DSpark | Drafter comunitario | no disponible | Decodificacion especulativa | 2,69× (concurrencia 1, GSM8K) | no disponible |

DFlash 2 supera a ambas alternativas en todas las tareas y niveles de concurrencia evaluados, con la ventaja adicional de mantener aceleraciones positivas incluso a concurrencia 32, donde MTP y DSpark llegan a rendir por debajo de la decodificación autorregresiva en algunas tareas.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: no puede usarse para generar texto por sí solo; requiere el modelo objetivo Qwen/Qwen3.8-27B y un motor de inferencia compatible (SGLang o vLLM con soporte DFLASH).
- El soporte en vLLM requiere actualmente una versión de desarrollo (rama del pull request 52816), no una release estable, lo que introduce riesgo de inestabilidad en producción.
- La ganancia de decodificación especulativa disminuye con la concurrencia alta: a 32 peticiones simultáneas la aceleración cae a entre 1,01× y 1,45×, por lo que el beneficio principal está en cargas de baja y media concurrencia.
- Los benchmarks provienen exclusivamente del autor del modelo (Inco AI) y no han sido verificados de forma independiente.
- Este repositorio es un espejo de `incoai/Qwen3.8-27B-DFlash2`; para garantizar trazabilidad y actualizaciones, se recomienda usar el repositorio original.
- Sesgos, riesgo de alucinación y capacidades idiomáticas: no disponibles para el drafter; los hereda íntegramente del modelo objetivo Qwen3.8-27B, cuya documentación debe consultarse.
- No hay información sobre cuantizaciones oficiales ni variantes GGUF; no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emee-ai/Qwen3.8-27B-DFlash2
- Repositorio original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- GitHub de DFlash: https://github.com/z-lab/dflash
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
- Drafter alternativo DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
