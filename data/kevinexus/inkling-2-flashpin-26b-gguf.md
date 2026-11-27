# kevinexus/Inkling-2-FlashPin-26B-GGUF

## Resumen

Inkling-2-FlashPin-26B-GGUF es una cuantización GGUF de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) derivada de `thinkingmachines/TML-d24-varloop-research`, el hermano de investigación de 26,4 mil millones de parámetros con bucle variable de la familia Inkling 2. El autor de la conversión es kevinexus, y el artefacto está específicamente optimizado para ejecutarse en dispositivos Apple con CPU ARM64, en concreto un iPhone 15 Pro, manteniendo los 128 expertos por capa intactos (sin poda) y aplicando una estrategia de caché por capas que fija en RAM los 40 expertos "calientes" mientras el resto se transmite desde almacenamiento NVMe.

El modelo resuelve un problema muy concreto: desplegar un MoE de gran tamaño en hardware móvil con memoria limitada (menos de 4,4 GB de RAM pico) sin degradar la arquitectura. Para ello combina una destilación a una sola pasada de bucle (`-passes 1 -k 4`), una cuantización mixta agresiva (Q2_K, Q2_0, IQ4_NL, Q4_0, Q8_0 según tensor) y kernels personalizados ARM64 NEON/`i8mm`, todo ello sobre un parche opcional de `llama.cpp`.

Es relevante ahora porque demuestra que un MoE de 26,4B con vocabulario de 200K y contexto de 8K puede sostener 21–23,4 tok/s en la CPU de un teléfono con térmicas nominales, abriendo la puerta a inferencia local de modelos de escala media en dispositivos de consumo. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts), 24 bloques, 128 expertos por capa, bucle variable destilado a 1 pasada |
| Parametros totales | 26,4B (modelo base); artefacto GGUF de 9,39 GiB |
| Parametros activos | Top-4 expertos por token (`-k 4`); número exacto de parámetros activos no disponible |
| Longitud de contexto | 8K (configurado en los benchmarks con KV `Q8_0`) |
| Tipos de cuantizacion | Mixta: `gate_up` 23× Q2_K + L23 Q4_K; `down` 11× Q2_0 + 10× Q4_0 + 3× IQ4_NL; routers Q8_0; atención Q4_K/Q5_K/Q6_K/Q8_0; `output` Q4_K; `token_embd` IQ4_XS |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único fichero `inkling2-26b-flashpin-1p-hot40-q2k-i8mm.gguf`, 10.080.548.288 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 24 bloques y 128 expertos por capa, concebido originalmente con un esquema de bucle variable ("varloop"). Esta conversión lo destila y calibra para una única pasada de bucle con enrutamiento top-4, conservando la totalidad de los 128 expertos (cero poda). Los expertos se reordenan por capa de modo que los 40 más utilizados ocupan los índices 0..39 para su fijación permanente en RAM (`GGML_MMID_PIN_N=36..40`), mientras que los expertos fríos 40..127 se transmiten desde flash NVMe bajo demanda. Esta reorganización es la base del nombre "FlashPin".

La innovación técnica principal no está en el entrenamiento sino en la ingeniería de inferencia: el artefacto requiere un parche opcional de `llama.cpp` (contra `llama.cpp @ 8a97fa98` / `b12628`) que aporta la anulación a 1 pasada, la fijación de los Hot-40 expertos, solapamiento asíncrono de las matrices `down` emparejadas, el mecanismo `CECAR` y kernels personalizados ARM64 NEON/`i8mm`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con un modo de "thinking" configurable mediante límite de tokens (`cap`) y esfuerzo (`e`).
- Razonamiento matemático y aritmético (evaluado en GSM8K-Hard y MATH-500).
- Razonamiento lógico y científico (Logic, GPQA Diamond).
- Tool calling / function calling, evaluado mediante BFCL (Berkeley Function Calling Leaderboard).
- Seguimiento de instrucciones, evaluado mediante IFEval.
- Enrutamiento de expertos con caché consciente del contexto y conmutación de dominio (probado con 3 temas mezclados).
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Inferencia local en iPhone: el artefacto está calibrado para ejecutarse en un iPhone 15 Pro (A17 Pro, 6 GiB de RAM con entitlement `increased-memory-limit`) a 21–23,4 tok/s sostenidos, lo que permite asistentes privados sin conexión con menos de 4,4 GB de RAM pico.
- Asistentes de bolsillo con contexto medio: los 8K tokens de contexto con KV `Q8_0` permiten conversaciones multi-turno y resumen de documentos cortos directamente en el dispositivo.
- Enrutamiento de herramientas en el borde: al soportar tool calling (BFCL), puede actuar como planificador local que decide qué API invocar antes de delegar en un servicio remoto, reduciendo latencia y coste.
- Automatización de tareas de razonamiento acotado: con el modo de thinking limitado por `cap`, es adecuado para pipelines donde se requiere una cadena de razonamiento corta y determinista (verificación, extracción, clasificación).
- Prototipado de aplicaciones iOS/ARM64: el harness y los parches publicados en `kevindechang/inkling-ios` permiten integrar el modelo en apps nativas y medir latencia, RAM y térmicas con logs reproducibles.
- Investigación sobre cuantización extrema: sirve como banco de pruebas para estudiar el compromiso entre cuantización mixta (Q2_K, Q2_0, IQ4_NL) y calidad en MoE, con suites de evaluación deterministas publicadas.
- Despliegue en Apple Silicon de sobremesa: los kernels NEON/`i8mm` y el esquema de fijación de expertos son aplicables a Macs con memoria unificada, donde el streaming desde SSD es menos crítico.

## Benchmarks y rendimiento

Rendimiento en iPhone 15 Pro (mismo artefacto GGUF, contexto `8K Q8_0`, `-passes 1 -k 4`):

| Ejecución | Prompt / generación | Caché / pin / ruta | tok/s sostenidos | TTFT en caliente (40t) | RAM pico / estable | Térmica |
|---|---|---|---:|---:|---:|---|
| v35a | p_math (66t) / 200 | 2700 / 36 / OPT λ=0.95 | 23,43 | 0,978 s | 4.081 / 3.945 MB | nominal → nominal |
| v35d | p_math (66t) / 200 | 2950 / 40 / CECAR=0.35 | 21,78 | 0,761 s | 4.334 / 4.187 MB | nominal → nominal |
| v35f | p_math (66t) / 375 | 2700 / 36 / OPT λ=0.95, prepack | 21,20 | 1,133 s | 4.062 / 3.927 MB | nominal → nominal |
| v35f_mix | v34_mix (127t, 3 temas) / 400 | 2700 / 36 / OPT λ=0.95, prepack | 18,36 | 1,126 s | 3.975 / 3.922 MB | nominal → nominal |
| v35_mix | v34_mix (127t, 3 temas) / 200 | 2700 / 36 / OPT λ=0.95 | 17,46 | 1,038 s | 3.990 / 3.933 MB | nominal → nominal |
| v35g (cabeza lossy) | p_math (66t) / 200 | 2700 / 36 / OPT λ=0.95, margen (26,1) | 23,62 | 1,131 s | 4.094 / 3.954 MB | nominal → nominal |

Calidad sobre suite determinista de 80 ítems (15 GSM8K-Hard, 10 MATH-500, 10 Logic, 10 GPQA Diamond, 20 BFCL, 15 IFEval):

| Modo de enrutamiento | GSM8K-Hard | MATH-500 | Logic | GPQA | BFCL | IFEval | Media (N=80) | Think medio (tokens) | Acierto de caché (3000 MB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ref: 3 pasadas K=8 BF16/MLX (53 GB) | 95,0% | — | — | — | 100,0% | 70,0% | 65,0% | — | — |
| CECAR=0 (cap=320, e=0.20) | 60,0% | 30,0% | 10,0% | 10,0% | 80,0% | 66,7% | 59,3% | 245 | 75,3% |
| OPT λ=0.95 (e=0.45) | 73,3% | 30,0% | 20,0% | 20,0% | 75,0% | 46,7% | 53,9% | 761 | 90,6% |
| OPT λ=0.95 (e=0.20) | 80,0% | 40,0% | 20,0% | 0,0% | 60,0% | 60,0% | 53,3% | 774 | 91,8% |
| OPT λ=0.85 (cap=320, e=0.20) | 60,0% | 30,0% | 10,0% | 30,0% | 60,0% | 60,0% | 51,9% | 25 (truncado en la fuente) | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 9,39 GiB; en ejecución con 8K de contexto y KV `Q8_0` el pico medido es de 3,98–4,33 GB de RAM en iPhone 15 Pro, gracias al streaming de expertos fríos desde NVMe.
- GPU recomendadas: no se documentan; el artefacto está optimizado para CPU ARM64 con extensión `i8mm` (A17 Pro y superiores, Apple Silicon).
- Cabe en GPU de consumo: no hay datos publicados para GPUs NVIDIA o AMD; el diseño asume memoria unificada y almacenamiento rápido.
- Opciones de despliegue: `llama.cpp` con el parche obligatorio de `kevindechang/inkling-ios` (contra `b12628`), harness iOS propio; no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 21,20–23,62 tok/s sostenidos en iPhone 15 Pro; TTFT en caliente de 0,761–1,133 s para 40 tokens; 17,46–18,36 tok/s bajo conmutación de 3 dominios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-FlashPin-26B-GGUF | 26,4B MoE (top-4, 128 expertos) | 8K | 21–23,4 tok/s en iPhone 15 Pro; 53,3–59,3% en suite de 80 ítems | Apache 2.0 | GGUF en Hugging Face |
| thinkingmachines/TML-d24-varloop-research (base) | 26,4B MoE | no disponible | no disponible en esta ficha | Apache 2.0 | Pesos del modelo base |
| Inkling 2 Mini (3 pasadas fijas) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita al artefacto de referencia BF16/MLX de 53 GB incluido en la propia model card.

## Limitaciones y advertencias

- El artefacto requiere un parche específico de `llama.cpp`; sin él no funcionan la anulación a 1 pasada, la fijación de expertos ni los kernels `i8mm`.
- La destilación a 1 pasada y top-4 degrada la calidad frente a la referencia de 3 pasadas K=8: la media cae de 65,0% a 53,3–59,3% en la suite de 80 ítems, con caídas severas en GPQA (0–30%) y Logic (10–20%).
- La cuantización mixta agresiva (Q2_K, Q2_0) puede introducir pérdida adicional de precisión, especialmente en razonamiento científico y matemático complejo.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de calibración.
- Idiomas: solo inglés; no hay soporte multilingüe declarado.
- Sesgos: no se documentan análisis de sesgo del modelo base ni de la conversión.
- El reordenamiento de expertos y la fijación en RAM dependen del hardware (iPhone 15 Pro con entitlement de memoria ampliada); el rendimiento en otros dispositivos no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia del modelo base y sus posibles restricciones adicionales deben verificarse en el repositorio original.
- Contexto limitado a 8K, insuficiente para documentos largos o conversaciones extensas.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kevinexus/Inkling-2-FlashPin-26B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Repositorio con código, parche de llama.cpp, harness iOS y logs: https://github.com/kevindechang/inkling-ios
- Parche de llama.cpp: https://github.com/kevindechang/inkling-ios/blob/main/patches/llama.cpp-inkling-ios.patch
- Logs de rendimiento iPhone 15 Pro: https://github.com/kevindechang/inkling-ios/tree/main/eval/results/iphone15pro_v35
- Logs de calidad (80 ítems): https://github.com/kevindechang/inkling-ios/tree/main/eval/results/quality_80item
