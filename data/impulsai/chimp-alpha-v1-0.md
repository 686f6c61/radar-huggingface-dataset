# impulsai/CHImp-Alpha-v1.0

## Resumen

CHImp Alpha v1.0 es una conversión cuantizada en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por impulsAI (Daniel Zurmühle, impulsAI.ch). El modelo base es una arquitectura MoE "qwen4exp" de 176,9B parámetros con 512 expertos enrutados (10 activos por token), 48 bloques que combinan gated DeltaNet con atención dispersa y una tabla de n-gramas de 51,2B parámetros. La conversión es solo de texto: el codificador visual del checkpoint original no se convierte.

El objetivo declarado es ejecutar un modelo de esta escala en una sola GPU de 32 GB más 128 GB de RAM, algo que el Q8_0 de referencia (175,3 GiB en disco) no permite. El resultado ocupa 92,2 GiB en disco más 1,8 GiB de la cabeza MTP, decodifica a 41 tok/s con decodificación especulativa y presenta una divergencia KL de 0,041 respecto al Q8_0, con un incremento de perplejidad del 0,58 %.

El método empleado se denomina Hybrid Tensor Compression (HTC): cuantización post-entrenamiento de precisión mixta consciente de la colocación, con offloading de expertos entre CPU y GPU y decodificación especulativa mediante la propia cabeza MTP del modelo. Es relevante porque demuestra que un MoE de casi 177B parámetros puede servirse en hardware de gama profesional de 32 GB con pérdida de calidad medible y baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de 512 expertos enrutados (10 activos por token), 48 bloques de gated DeltaNet + atención dispersa, hyper-connections, cabeza MTP y tabla de n-gramas por capa de 51,2B parametros (variante "qwen4exp" de Qwen3.8-Flash-Next) |
| Parametros totales | 176,9B en el modelo de lenguaje, sin contar la cabeza MTP de 2,6B que se distribuye como archivo aparte |
| Parametros activos | No disponible en cifras absolutas; la model card indica 10 de 512 expertos enrutados activos |
| Longitud de contexto | 64k tokens (valor por defecto del servidor); tambien se midio a 8k |
| Tipos de cuantizacion | IQ4_XS (4,25 bpw, con imatrix) para expertos gate/up; IQ4_NL para expertos down y tabla de n-gramas; Q6_K y Q8_0 para atención, DeltaNet, experto compartido, hyper-connections y LM head; F32/BF16 para router, normas, indexador de atención dispersa y proyecciones n-gram; Q4_K_M para la cabeza MTP |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace), heredada del modelo base |
| Formato de pesos | GGUF (llama.cpp); la cabeza MTP se entrega como archivo separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE disperso con 512 expertos enrutados por bloque y 10 activos por token, combinado con capas de gated DeltaNet y atención dispersa en 48 bloques. Incluye hyper-connections, un experto compartido, una tabla de n-gramas por capa (`per_layer_token_embd`) de 51,2B parámetros y una cabeza MTP (multi-token prediction) de 2,6B parámetros. No se dispone de información sobre el número de tokens ni la composición del dataset de entrenamiento del modelo base, ni sobre si se aplicaron RLHF o DPO.

La innovación del artefacto publicado es el pipeline de compresión, no el entrenamiento: HTC asigna a cada grupo de tensores el formato que justifican su sensibilidad al error y su ubicación en tiempo de ejecución. Los expertos enrutados gate/up (80,5B parámetros, 39,8 GiB) se cuantizan a IQ4_XS con imatrix y residen en CPU/RAM; los expertos down (40,3B, 21,1 GiB) se cuantizan a IQ4_NL y residen en GPU porque sus filas de 640 elementos solo admiten formatos de bloque de 32; atención, gated DeltaNet y experto compartido (2,9B, 2,3 GiB) van en Q6_K con proyecciones α/β en Q8_0 y vectores de decaimiento y kernel de convolución en F32; la tabla de n-gramas se cuantiza a IQ4_NL (26,8 GiB) y se sirve mediante mmap con acceso disperso. La cabeza MTP actúa como modelo borrador para decodificación especulativa. El autor descarta el formato ternario TQ1_0 (1,69 bpw) pese a un buscador de escala óptimo en MSE que mejora 2,9 veces en divergencia KL al cuantizador absmax de llama.cpp, porque sus builds ternarios se quedan en KLD 0,41–1,21 y 77 % de coincidencia top-1.

## Capacidades

- Generación de texto en inglés y alemán; no se declaran otros idiomas.
- Generación de código: la model card reporta la ejecución de los arneses HumanEval+ y MBPP+, aunque los resultados de puntuación no se incluyen en la información disponible.
- Razonamiento multi-paso con decodificación especulativa: el modelo incorpora su propia cabeza MTP que se ejecuta como borrador, acelerando la decodificación de 29,5 a 41 tok/s.
- Salida estructurada: la tarjeta reporta 48 tok/s en generación de JSON.
- Function calling / tool calling: se menciona el uso de prompts de BFCL (Berkeley Function Calling Leaderboard) para medir prefill, pero los resultados de ese arnés no están disponibles en la información proporcionada.
- Modo "thinking" desactivable: todas las mediciones se realizaron con thinking off y temperatura 0.
- Sin capacidades de visión: la conversión es solo texto y el codificador visual del checkpoint original no se convierte.
- Sin capacidades de audio declaradas.

## Casos de uso

- Asistente de código autoalojado: con 64k tokens de contexto y 44 tok/s en decodificación de código, el modelo puede mantener conversaciones largas sobre repositorios completos y generar parches sin depender de APIs externas.
- Sustitución de despliegues Q8_0 en producción: reduce el espacio en disco de 175,3 GiB a 92,2 GiB y permite servir el modelo en una única GPU de 32 GB más RAM, manteniendo una divergencia KL de 0,041 y un 93,0 % de coincidencia top-1 respecto al Q8_0.
- Generación de JSON para pipelines de datos: los 48 tok/s medidos en salida JSON y el prefill de 120–190 tok/s lo hacen adecuado para extracción estructurada por lotes en inglés y alemán.
- Atención al cliente y procesamiento documental en alemán: la tarjeta mide 32 tok/s en prosa alemana, uno de los dos idiomas soportados, con contexto de 64k para conversaciones multi-turno o documentos extensos.
- Agentes multi-paso con function calling: el soporte de decodificación especulativa con MTP reduce la latencia por paso, un factor crítico en bucles de agente; conviene validar antes el rendimiento real en BFCL, no publicado.
- Evaluación y reproducción en CI/CD de código: los arneses HumanEval+ y MBPP+ ya se ejecutaron sobre este build (162 y 120 tok/s de prefill respectivamente), por lo que puede integrarse en pipelines de evaluación continua de modelos cuantizados.
- Investigación en cuantización: sirve como referencia reproducible de HTC frente a builds ternarios (KLD 0,041 frente a 0,41–1,21) para estudiar el compromiso entre bits por peso, colocación de tensores y divergencia respecto a la referencia.
- Servicio interno con coste de hardware contenido: permite ofrecer un MoE de 176,9B en una estación de trabajo con GPU de 32 GB y 128 GB de DDR4, sin clúster multi-GPU.

## Benchmarks y rendimiento

Referencia de medición: GGUF Q8_0 de unsloth; wikitext-2 test, 64 × 2048 tokens; divergencia KL contra los log-probs guardados de la referencia; llama.cpp b10909; RTX Pro 4500 (32 GB) + Ryzen 9 5950X + 128 GB DDR4; thinking off, temperatura 0.

| Metrica | CHImp Alpha v1.0 |
|---|---|
| Perplejidad | 3,838 frente a 3,816 (+0,58 %; ratio de calidad 0,994) |
| Divergencia KL frente a Q8_0 | media 0,041 · mediana 0,011 · p99 0,48 |
| Coincidencia top-1 con Q8_0 | 93,0 % |
| Decodificacion | 29,5 tok/s sin borrador · 41 tok/s con la cabeza MTP (codigo 44 · prosa alemana 32 · JSON 48) |
| Prefill | ~120–190 tok/s segun longitud del prompt; 136 tok/s ponderado por tokens en HumanEval+/MBPP+; HumanEval+ 162, MBPP+ 120; ~190 tok/s en prompts BFCL de ~400 tokens |
| VRAM en uso (nvidia-smi, placa completa con ~0,9 GiB de escritorio) | 28,9 GiB a 8k con borrador · 26,6 GiB a 8k sin borrador · 31,0 GiB a 64k con borrador (30,0 GiB solo el proceso llama-server) |

Resultados de arneses de tareas (HumanEval+, MBPP+, BFCL): la model card anuncia una sección de benchmarks de tarea, pero los valores de puntuación no están incluidos en la información disponible.

## Requisitos de hardware

- Pesos en GPU: 24,9 GiB (buffer de modelo CUDA0 = 25.529 MiB), correspondientes a expertos down, atención, DeltaNet, experto compartido, hyper-connections, LM head, router y normas.
- VRAM total en uso: 26,6 GiB a 8k sin borrador, 28,9 GiB a 8k con borrador y 31,0 GiB a 64k con borrador (valor por defecto de la release). El proceso llama-server por sí solo ocupa 30,0 GiB a 64k.
- RAM: aproximadamente 40,5 GiB en caliente (39,8 GiB de expertos gate/up más 0,6 GiB de embedding de tokens), más las páginas de la tabla de n-gramas (26,8 GiB) que se tocan de forma dispersa vía mmap. La máquina de referencia dispone de 128 GB DDR4.
- GPU: el autor reporta una RTX Pro 4500 de 32 GB. Con 28,9–31,0 GiB de VRAM necesarios, no cabe en GPUs de consumo de 24 GB como la RTX 4090. No se dispone de datos medidos para A100, H100 u otras tarjetas.
- Almacenamiento: 92,2 GiB para el modelo más 1,8 GiB para el archivo de la cabeza MTP (frente a 175,3 GiB del Q8_0 de origen).
- Despliegue: llama.cpp build b10909 (bundle CUDA 13 de unsloth) con llama-server; el runtime probado es esa versión concreta. Soporte en vLLM, Ollama o TGI: no disponible.
- Throughput: 41 tok/s de decodificación con el borrador MTP y 29,5 tok/s sin él; prefill de ~120–190 tok/s según la longitud del prompt.
- El reparto de tensores es explícito: expertos gate/up y embedding de tokens en CPU/RAM, expertos down y capas de atención en GPU, tabla de n-gramas en RAM vía mmap.

## Comparativa con modelos similares

| Modelo | Formato / bpw | Tamano en disco | KLD frente a Q8_0 | Top-1 | Decodificacion |
|---|---|---|---|---|---|
| CHImp Alpha v1.0 | IQ4_XS + IQ4_NL + Q6_K/Q8_0 | 92,2 GiB (+1,8 GiB de borrador) | 0,041 | 93,0 % | 41 tok/s (con MTP) |
| Build "htc2b" (mismo autor) | HTC, formato no disponible | No disponible | 0,066 | No disponible | 48 tok/s |
| Builds "HTC1" ternarios (mismo autor) | TQ1_0, 1,69 bpw | No disponible | 0,41 y 1,21 | 77 % | No disponible |
| Unsloth Q8_0 (referencia) | Q8_0 | 175,3 GiB | 0 (referencia) | 100 % | No disponible |
| Qwen3.8-Flash-Next (modelo base) | BF16 u original | No disponible | No aplica | No aplica | No disponible |

Frente a los builds ternarios del mismo autor, CHImp Alpha v1.0 reduce la divergencia KL en un orden de magnitud (0,041 frente a 0,41–1,21) a costa de 4,25 bpw en lugar de 1,69 bpw. Frente al Q8_0 de origen, recorta el tamaño en disco un 47 % manteniendo el 93,0 % de coincidencia top-1. No se dispone de comparativas con modelos cuantizados equivalentes de otros autores ni de datos de contexto, licencia o disponibilidad de las alternativas.

## Limitaciones y advertencias

- Cobertura de idiomas limitada a inglés y alemán; no se declara soporte de castellano.
- Es una conversión solo de texto: el codificador visual del checkpoint original no se convierte, por lo que no hay capacidades multimodales.
- La cuantización introduce degradación medible: +0,58 % de perplejidad, KLD media de 0,041 y un 7,0 % de discrepancias en la predicción top-1 respecto al Q8_0. En tareas sensibles a la precisión conviene validar contra la referencia.
- La licencia es qwen-community-1.0, etiquetada como "other" en HuggingFace y heredada del modelo base. No se detallan en la información disponible las condiciones exactas para uso comercial; es imprescindible revisar el texto de la licencia enlazada antes de un despliegue en producción.
- No se publican resultados de los arneses de tareas (HumanEval+, MBPP+, BFCL) en la información disponible, solo métricas de prefill; el rendimiento real en código, matemáticas o function calling está sin verificar.
- Requisitos de hardware altos y poco convencionales: 32 GB de VRAM más 128 GB de RAM, con offloading de expertos a CPU. Esto introduce latencia dependiente del ancho de banda de memoria del sistema, no solo de la GPU.
- El reparto de tensores es específico de llama.cpp b10909; otras versiones o runtimes pueden no reproducir el rendimiento ni la colocación descrita.
- Los benchmarks se midieron con thinking off y temperatura 0; el comportamiento con muestreo estocástico o con el modo de razonamiento activado no está caracterizado.
- Todos los benchmarks provienen del propio autor, con un único conjunto de evaluación (wikitext-2, 64 × 2048 tokens) y una sola máquina; no hay validación independiente.
- No se documentan sesgos conocidos del modelo base ni de la conversión, ni tasas de alucinación medidas.
- El repositorio figura con 0 descargas, 0 likes y 0,0 GB de tamaño reportado, coherente con una release alfa recién publicada; la reproducibilidad del artefacto no está contrastada por terceros.
- Estado alfa (v1.0) y publicada en 2026-09-20: no hay historial de mantenimiento ni versiones estables previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impulsai/CHImp-Alpha-v1.0
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base (qwen-community-1.0): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de herramientas de build (zurd46/Qwen3.8FlashNextTQ1): https://github.com/zurd46/Qwen3.8FlashNextTQ1
- llama.cpp (runtime, build b10909): https://github.com/ggml-org/llama.cpp
- impulsAI: https://impulsai.ch
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; unicamente paginas genericas de Google sin relacion con la ficha.
