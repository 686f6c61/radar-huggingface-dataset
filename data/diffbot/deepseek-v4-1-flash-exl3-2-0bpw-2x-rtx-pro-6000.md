# diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000

## Resumen

DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000 es una cuantización de 3 bits del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario diffbot. Se trata de un pack calibrado con el método EXL3 de coolbho3k que comprime los expertos enrutados del modelo Mixture-of-Experts original para que pueda servirse en dos tarjetas RTX PRO 6000 Blackwell (sm_120, 96 GB cada una) mediante vLLM con tensor-parallel 2. El modelo base pertenece a DeepSeek y consta de 218.691.507.682 parámetros totales según los pesos safetensors del repositorio.

La relevancia de esta publicación radica en que hace viable el despliegue en hardware de estación de trabajo de un modelo de escala 218B que, en su formato original, requeriría mucho más VRAM. El pack reserva un tercio de los expertos enrutados en RAM del host anclada (pinned), servidos por kernels personalizados para sm_120 o por un runtime de CPU opcional. El mismo paquete también puede ejecutarse en un nodo de 8 GPU RTX PRO 6000 como dos réplicas de 4 GPU con todos los expertos en VRAM.

El repositorio ocupa 1035,8 GB e incluye la receta completa de construcción, kernels, servidor compatible con la API de OpenAI y utilidades de benchmark. La licencia es MIT. El modelo está orientado a generación de texto con capacidades de razonamiento, código y uso de herramientas, y el pack declara ventanas de contexto de 1M tokens con caché KV en fp8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, etiqueta deepseek_v41 |
| Parámetros totales | 218.691.507.682 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1M tokens (ventana declarada en el pack; caché KV de 1,07M tokens en fp8 en la configuración 2x) |
| Tipos de cuantización | EXL3 3 bits en expertos enrutados (2.0bpw en el nombre del repo); caché KV en fp8; pesos no expertos no especificados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards: model-00001 a model-00048) más config.json; pack de 332 GB según la model card |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Hardware objetivo | 2x RTX PRO 6000 Blackwell (sm_120, 96 GB), tensor-parallel 2; perfil alternativo 8x |
| Runtime | vLLM con kernels propios (xmoe, xmoe_bulk, xmoe_do, xmoe_do_i8, fp8ar, rowtopk); runtime de CPU opcional |
| Requisitos de host | ~260 GiB de RAM libre, 340 GB de disco, driver CUDA 13, Docker con NVIDIA container toolkit |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con arquitectura Mixture-of-Experts, tal como indican las etiquetas del repositorio (mixture-of-experts) y el identificador de arquitectura deepseek_v41 en config.json. El pack cuantizado no aporta detalles sobre el número de expertos, la proporción de expertos activos por token ni la composición del dataset de entrenamiento original; esa información no está disponible en la documentación proporcionada. Los 218.691.507.682 parámetros totales corresponden a los pesos safetensors del repositorio, y la model card no desglosa cuántos se activan por token.

La innovación técnica de esta publicación es el proceso de cuantización y el stack de serving. Los expertos enrutados se cuantizan a 3 bits con EXL3 calibrado (método de coolbho3k), y un tercio de ellos permanece en RAM del host anclada, accesible mediante kernels personalizados para sm_120 o un runtime de CPU con soporte de AVX-512 (VNNI, VBMI, VBMI2). El pack incluye un drafter opcional DSpark ajustado a código con k=7 para decodificación especulativa en flujos de una sola petición orientados a código. La model card documenta métricas de fidelidad frente al checkpoint original mediante KL medio sobre los corpus de AtomicChat y el panel short100 de kyuz0, con valores de 0,0522 en texto neutro, 0,0306 en código y 0,0111 en agéntico para la configuración 2x por defecto.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de propósito general y el pack mantiene la fidelidad medida frente al checkpoint original en corpus de texto neutro.
- Generación de código: validada con HumanEval al 97,0 % en la configuración 2x por defecto (thinking desactivado, decodificación greedy).
- Razonamiento matemático: GSM8K-200 con un 98,5 % de acierto en la configuración 2x por defecto.
- Uso de herramientas (tool calling): la model card incluye un test específico (bench/test-toolcall.py) y el benchmark de replay agéntico emplea 104 turnos con llamadas a herramientas.
- Razonamiento agéntico multi-turno: evaluado con un benchmark propio de replay agéntico de coding con sesiones concurrentes.
- Capacidades de imagen: el script de verificación bench/test-image.py sugiere soporte de entrada de imagen en el servidor; el alcance exacto no está detallado.
- Contexto largo: ventana de 1M tokens con caché KV en fp8 y pruebas de aguja en pajar (bench/needle-test.py) a 200K.
- Decodificación especulativa opcional mediante el drafter DSpark ajustado a código con k=7.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el pack alcanza 172,8 tok/s en una sola petición con prompt de 46K tokens y 97,0 % en HumanEval; puede integrarse en pipelines de revisión o generación de parches con una API compatible con OpenAI.
- Agentes de coding autónomos: el benchmark de replay agéntico (104 turnos con tool calls) y la ventana de 1M tokens permiten mantener sesiones largas con historial de herramientas sin truncar el contexto.
- Servicio multi-sesión en estación de trabajo: con 4 sesiones concurrentes en replay agéntico mantiene 110,4 tok/s agregados en la configuración 2x por defecto, adecuado para un pequeño equipo de desarrollo.
- Procesamiento de documentos extensos: la ventana de 1M tokens y la prueba de aguja a 200K permiten resumir, extraer y responder preguntas sobre repositorios o expedientes completos en una sola pasada.
- Razonamiento matemático asistido: con un 98,5 % en GSM8K-200, es apto para tutoría o verificación de cálculos en flujos internos con decodificación greedy.
- Despliegue en nodo de 8 GPU para mayor throughput: el perfil 8x ejecuta dos réplicas de 4 GPU con todos los expertos en VRAM y alcanza 435-457 tok/s por réplica en generación de código y 4.404-4.469 tok/s agregados con 128 streams de código.
- Laboratorio de investigación sobre cuantización: la receta, los kernels y las métricas de fidelidad KL documentadas permiten reproducir y comparar métodos de cuantización de MoE en Blackwell.

## Benchmarks y rendimiento

Métricas de calidad del pack frente al checkpoint original 1017 (thinking desactivado, decodificación greedy):

| Métrica | Original 1017 (segunda ejecución, suelo de ruido) | Pack 2x por defecto | Pack 2x runtime CPU | Pack 8x |
|---|---:|---:|---:|---:|
| KL medio, texto neutro | 0,0082 | 0,0522 | 0,0520 | no disponible |
| KL medio, código | 0,0050 | 0,0306 | 0,0309 | no disponible |
| KL medio, agéntico | 0,0047 | 0,0111 | 0,0110 | no disponible |
| short100 | no disponible | 0,0338 | 0,0349 | no disponible |
| GSM8K-200 | no disponible | 98,5 % | 98,5 % | 98,0-99,0 % |
| HumanEval | no disponible | 97,0 % | 97,0-97,6 % | 97,0-97,6 % |

Rendimiento en tokens por segundo según la model card:

| Configuración | Replay agéntico, 1 stream | Código, 1 stream | Prefill fresco de 40K | Contexto / caché KV | Bajo carga (agregado) |
|---|---:|---:|---:|---|---|
| 2x por defecto (solo GPU) | 224,1 | 172,8 (prompt 46K) | 11.157-11.467 | ventana 1M, 1,07M tokens fp8 | replay agéntico, 4 concurrentes 110,4; cuatro streams de 46K 362,9 |
| 2x runtime CPU (CPU_EXPERTS=1) | 271-281 | 193-223 (prompt 46K) | 13.442-14.389 | igual | 136-146; 396-452 |
| 8x por réplica (TP4 + EP4, 4 GPU) | 205-222 (un prompt agéntico de 46K) | 435-457 | 19.131-19.302 | ventana 1M, 4,54M tokens, 128 secuencias | 128 streams de código 4.404-4.469 |
| 8x nodo completo (2 réplicas) | no disponible | 809 (un stream por réplica) | no disponible | 2 x 4,54M tokens | 128 streams de código por réplica 8.430; generaciones largas 5.250 |

La model card indica que el replay agéntico por defecto decodifica un 28 % más rápido que la revisión anterior de V4.1-Flash (224 frente a 176 tok/s). En el runtime de CPU, esta revisión (2026-11-14) mejora un 10,1 % en una sesión y un 11,1 % en cuatro sesiones respecto a la revisión del 2026-10-25.

## Requisitos de hardware

- VRAM: 2 GPU de 96 GB (192 GB en total) para el perfil 2x por defecto; un tercio de los expertos enrutados reside en RAM anclada del host. El perfil 8x usa 8 GPU de 96 GB con todos los expertos en VRAM.
- GPU recomendadas: RTX PRO 6000 Blackwell (sm_120, 96 GB) con driver CUDA 13; tensor-parallel 2 en el perfil 2x y TP4 + EP4 en el 8x. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en tarjetas de consumo; el pack está construido específicamente para sm_120 de 96 GB.
- Host: ~260 GiB de RAM libre (hasta 400 GiB por réplica en el nodo 8x), 340 GB de disco y CPU x86_64 con AVX-512 (VNNI, VBMI, VBMI2) para el runtime de CPU.
- Despliegue: vLLM con imagen Docker propia (dsv41-flash-1017-exl3-3bpw-sm120) y API compatible con OpenAI en el puerto 8000 con el nombre de modelo deepseek-v4.1-flash; no se mencionan llama.cpp, Ollama ni TGI.
- Throughput: 224,1 tok/s en replay agéntico de una sesión en el perfil 2x por defecto y 809 tok/s en código con dos réplicas en el nodo 8x; prefill fresco de 40K entre 11.157 y 19.302 tok/s según configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-2.0bpw (este pack) | 218.691.507.682 | 1M tokens | EXL3 3 bits, safetensors, vLLM en 2x u 8x RTX PRO 6000 | MIT |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en la información | no disponible | pesos completos, safetensors | MIT (heredada del base) |
| Revisión 2026-10-25 del mismo pack | no disponible | 1M tokens | EXL3, runtime CPU | MIT |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa con otras familias queda como no disponible.

## Limitaciones y advertencias

- La cuantización a 3 bits introduce degradación medible: el KL medio sube de 0,0047-0,0082 en el original a 0,0111-0,0522 en el pack, con mayor desviación en texto neutro que en código o tareas agénticas.
- Las métricas de calidad publicadas corresponden a decodificación greedy con thinking desactivado; el comportamiento en modo razonamiento no está documentado.
- La lista de idiomas soportados no está disponible, por lo que no puede garantizarse cobertura multilingüe.
- El pack exige hardware muy específico (sm_120, CUDA 13, AVX-512 para el runtime de CPU); no hay garantía de funcionamiento en A100, H100 o GPU de consumo.
- El soporte de imagen solo está sugerido por el script de verificación; su alcance no se detalla.
- El repositorio ocupa 1035,8 GB y requiere unos 340 GB de disco para el pack más dependencias, con ~260 GiB de RAM de host, lo que limita su despliegue a estaciones de trabajo o nodos preparados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de sesgos.
- La licencia MIT permite uso comercial, pero debe verificarse que el modelo base y los kernels de terceros incluidos (método EXL3 de coolbho3k, drafter DSpark) mantengan condiciones compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentación de velocidad: docs/SPEED.md (dentro del repositorio)
- Documentación de fidelidad: docs/FIDELITY.md (dentro del repositorio)
- Registro de cambios: docs/CHANGELOG.md (dentro del repositorio)
- Documentación del drafter: docs/DRAFTER.md (dentro del repositorio)
- Guía del runtime de CPU: recipe/cpuexp/README.md (dentro del repositorio)
- Guía de la pila de serving: recipe/README.md (dentro del repositorio)
