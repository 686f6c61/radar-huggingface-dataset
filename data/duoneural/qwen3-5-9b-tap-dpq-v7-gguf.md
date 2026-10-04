# DuoNeural/Qwen3.5-9B-TAP-DPQ-v7-GGUF

## Resumen

DuoNeural/Qwen3.5-9B-TAP-DPQ-v7-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo base Qwen/Qwen3.5-9B, publicado por el DuoNeural Distributed Research Lab. El autor describe TAP-DPQ v7 (Thouless-Anderson-Palmer Driven-Dissipative Post-Training Quantization v7) como una tecnica de cuantizacion post-entrenamiento orientada a comprimir arquitecturas hibridas de recurrencia y atencion hasta el rango de 1,56 a 4,50 bits por peso, con el objetivo declarado de ejecutar un modelo de 9.197.093.888 parametros en una unica GPU consumer.

El modelo base se describe como una arquitectura de 64 capas que combina 48 capas recurrentes Gated DeltaNet (recurrencia lineal con actualizaciones de memoria asociativa tipo Householder) y 16 capas de self-attention multi-cabeza, con redes feed-forward SwiGLU. Sobre esa base, el repositorio ofrece seis niveles de cuantizacion: Q4_K_M (4,50 bpw), IQ3_XXS (3,06 bpw), IQ2_M (2,70 bpw), IQ2_XXS (2,06 bpw) e IQ1_S (1,56 bpw), ademas del baseline Vanilla FP16 de referencia.

Su relevancia practica, segun el autor, reside en la reduccion de huella de memoria (de 17,14 GiB en FP16 a 2,68 GiB en IQ1_S) y en el aumento de throughput en una RTX 3090 (de 78,2 a 168,1 tokens/s). Conviene senalar que la model card incluye afirmaciones de rendimiento muy agresivas y con inconsistencias internas notables, que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 48 capas recurrentes Gated DeltaNet + 16 capas de self-attention multi-cabeza, FFN SwiGLU, 64 capas en total |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | No aplica (arquitectura densa, no MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (la calibracion usa secuencias de mas de 8k-16k tokens) |
| Tipos de cuantizacion | GGUF con imatrix: FP16 (baseline), Q4_K_M (4,50 bpw), IQ3_XXS (3,06 bpw), IQ2_M (2,70 bpw), IQ2_XXS (2,06 bpw), IQ1_S (1,56 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 20,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B se describe en la model card como una arquitectura heterogenea de 64 capas: 48 capas recurrentes Gated DeltaNet que realizan recurrencia lineal mediante actualizaciones de memoria asociativa con transformaciones de Householder, 16 capas de atencion global que actuan como anclas de recuperacion token a token, y bloques feed-forward SwiGLU con distribuciones de activacion de cola pesada y curtosis extrema. No se especifica el numero de tokens de preentrenamiento del modelo base ni si este paso por fases de RLHF o DPO.

La innovacion que documenta el repositorio es exclusivamente de cuantizacion, no de entrenamiento desde cero. TAP-DPQ v7 se presenta como un metodo que trata la red como un vidrio de spin de Sherrington-Kirkpatrick y aplica correcciones de campo de cavidad de Onsager adaptativo antes de la asignacion a la rejilla entera, para cancelar la retroaccion de los errores de redondeo en las iteraciones recurrentes. El corpus de calibracion declarado es de 150.000 tokens, repartido en un 45% de estructuras AST y codigo (LiveCodeBench), un 35% de cadenas de razonamiento (AIME y GPQA Diamond) con marcadores de fase explicito y secuencias largas, y un 20% de matices linguisticos y alineamiento multimodal con coordenadas OCR. El autor menciona tambien una restriccion de gauge en el espacio nulo para evitar la reaparicion de rechazos espureos.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado text-generation.
- Razonamiento matematico multi-paso: la model card reporta evaluacion con verificacion CAS via SymPy sobre MATH-500.
- Generacion de codigo: el corpus de calibracion incluye estructuras AST, recursividad anidada, clases tipo Solution y kernels CUDA con WMMA; se reportan resultados en LiveCodeBench.
- Soporte de tool calling y function calling: se evalua con el conjunto Hermes Tools (100% en los niveles Q4_K_M, IQ3_XXS e IQ2_M).
- Razonamiento cientifico de nivel experto: se reportan resultados en GPQA Diamond.
- Ejecucion en CPU/GPU consumer mediante llama.cpp con aceleracion FlashAttention.
- Muestreo con Min-P: el autor indica que los niveles sub-2-bit requieren Min-P (--temp 0.6 --min-p 0.05) para mantener razonamiento activo.
- Capacidades multimodales: se mencionan dialogos epistemicos y coordenadas de bounding box OCR en el corpus de calibracion, pero no se confirma vision como capacidad de inferencia.
- Idiomas soportados: no disponible.

## Casos de uso

- Inferencia local en GPU consumer de 24 GB: el nivel IQ2_XXS ocupa 3,12 GiB, lo que permite mantener el modelo en VRAM junto con contexto amplio y otros procesos en una RTX 3090, 4090 o similar.
- Despliegue en hardware con VRAM limitada o en portatiles con GPU de gama media: los niveles IQ1_S (2,68 GiB) e IQ2_M (3,49 GiB) reducen el requisito de memoria muy por debajo del baseline FP16 de 17,14 GiB.
- Generacion de codigo asistida en local: el nivel Q4_K_M conserva el rendimiento del baseline en MATH-500 y se puede integrar en un servidor llama.cpp con endpoint compatible con la API de OpenAI.
- Experimentacion con decodificacion especulativa y muestreo alternativo: el autor documenta que los niveles de 1 y 2 bits necesitan Min-P para evitar bucles de atraccion; util como banco de pruebas de tecnicas de muestreo.
- Servicio de chat de bajo coste por token: con 156,4-168,1 tokens/s en IQ2_XXS e IQ1_S sobre una sola GPU, el coste por token en un servidor pequeno es muy bajo, siempre que se acepte la perdida de calidad en matematicas y herramientas.
- Pipeline de CI/CD para comprobaciones de sintaxis y refactorizacion ligera: el nivel IQ3_XXS mantiene un 6,0% en LiveCodeBench y el 100% de tool calling, adecuado para tareas de formato y transformacion, no para logica compleja.
- Evaluacion comparativa de metodos de cuantizacion: el repositorio publica cinco niveles con el mismo harness, lo que permite medir la degradacion de cada bit-width sobre el mismo modelo base.
- Prototipado rapido de agentes con contexto largo: la arquitectura recurrente DeltaNet esta disenada para acumular estado asociativo en secuencias largas, aunque la longitud de contexto oficial no esta publicada.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las mediciones declaradas se realizaron en una NVIDIA GeForce RTX 3090 24GB (sm_86) con llama.cpp acelerado con FlashAttention y verificacion SymPy CAS.

| Nivel | BPW | Disco / VRAM | Throughput | MATH-500 (CAS) | LiveCodeBench | GPQA Diamond | AIME 2026 (Greedy / Min-P) | Hermes Tools | XSTest Pass |
|---|---|---|---|---|---|---|---|---|---|
| Vanilla FP16 Baseline | 16,0 | 17,14 GiB | 78,2 t/s | 34,0% (ground truth) | 4,0% | 100,0% | 0,0% / 0,0% | 100,0% | 100,0% |
| Q4_K_M (TAP-DPQ v7) | 4,5 | 5,36 GiB | 112,5 t/s | 34,0% (100,0% super-paridad) | 0,0% | 100,0% | 0,0% / 0,0% | 100,0% | 100,0% |
| IQ3_XXS (TAP-DPQ v7) | 3,06 | 3,78 GiB | 138,7 t/s | 22,0% (64,7% paridad exacta) | 6,0% | 100,0% | 0,0% / 0,0% | 100,0% | 100,0% |
| IQ2_M (TAP-DPQ v7) | 2,7 | 3,49 GiB | 145,2 t/s | 16,0% (47,1% retencion) | 4,0% | 80,0% | 0,0% / 0,0% | 80,0% | 100,0% |
| IQ2_XXS (TAP-DPQ v7) | 2,06 | 3,12 GiB | 156,4 t/s | 2,0% (5,9% retencion) | 4,0% | 0,0% | 0,0% / 0,0% | 80,0% | 100,0% |
| IQ1_S (TAP-DPQ v7) | 1,56 | 2,68 GiB | 168,1 t/s | 0,0% (0,0% retencion) | 0,0% | 0,0% | 0,0% / 0,0% | 0,0% | 100,0% |

El autor justifica las diferencias frente a evaluaciones anteriores indicando que los extractores por expresion regular descartaban respuestas no enteras (fracciones, raices, pares de coordenadas), aproximadamente el 40% de MATH-500, y que el motor de equivalencia SymPy CAS corrige ese sesgo. No se aportan resultados de benchmarks independientes ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,14 GiB en FP16; 5,36 GiB en Q4_K_M; 3,78 GiB en IQ3_XXS; 3,49 GiB en IQ2_M; 3,12 GiB en IQ2_XXS; 2,68 GiB en IQ1_S.
- GPU de referencia del autor: NVIDIA RTX 3090 24GB (sm_86, CUDA 12.9, driver 575.64).
- Cabe en GPU consumer: si, todos los niveles cuantizados caben en GPUs de 8-12 GB o superiores; el baseline FP16 requiere aproximadamente 17,14 GiB y necesita una GPU de 24 GB o reparto entre varias.
- Opciones de despliegue: llama.cpp con aceleracion FlashAttention; los tags del repositorio indican endpoints_compatible, lo que sugiere compatibilidad con servidores de endpoint tipo API OpenAI. No se mencionan vLLM, TGI ni Ollama de forma explicita en la informacion disponible.
- Throughput declarado en RTX 3090: 78,2 t/s (FP16), 112,5 t/s (Q4_K_M), 138,7 t/s (IQ3_XXS), 145,2 t/s (IQ2_M), 156,4 t/s (IQ2_XXS), 168,1 t/s (IQ1_S).
- No se proporcionan datos de latencia por peticion (time to first token) ni de rendimiento con lotes grandes.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos de terceros de la misma categoria. La unica comparacion documentada es interna, entre los distintos niveles de cuantizacion del mismo modelo base y el baseline FP16.

| Nivel | BPW | VRAM | Throughput | MATH-500 | Tool calling | Comentario |
|---|---|---|---|---|---|---|
| Vanilla FP16 | 16,0 | 17,14 GiB | 78,2 t/s | 34,0% | 100,0% | Referencia sin cuantizar |
| Q4_K_M | 4,5 | 5,36 GiB | 112,5 t/s | 34,0% | 100,0% | Mejor relacion calidad/memoria segun el autor |
| IQ3_XXS | 3,06 | 3,78 GiB | 138,7 t/s | 22,0% | 100,0% | Compromiso intermedio |
| IQ2_M | 2,7 | 3,49 GiB | 145,2 t/s | 16,0% | 80,0% | Degradacion apreciable en matematicas |
| IQ2_XXS | 2,06 | 3,12 GiB | 156,4 t/s | 2,0% | 80,0% | Perdida severa de razonamiento matematico |
| IQ1_S | 1,56 | 2,68 GiB | 168,1 t/s | 0,0% | 0,0% | No apto para matematicas ni herramientas |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Las cifras de benchmark de la model card presentan inconsistencias graves: el modelo cuantizado Q4_K_M iguala al baseline FP16 en MATH-500 mientras el propio baseline obtiene 34,0%, y se declara un 100,0% en GPQA Diamond para un modelo de 9B, un resultado muy por encima de lo que cabe esperar en esa categoria. Estos datos deben tratarse como no verificados.
- Se declara un 0,0% en AIME 2026 en todos los niveles, incluido el baseline FP16, lo que contradice la afirmacion de "razonamiento matematico activo" en niveles sub-2-bit.
- LiveCodeBench es muy bajo en todos los niveles (0,0%-6,0%), incluido el baseline sin cuantizar.
- El nivel IQ1_S pierde por completo el soporte de tool calling (0,0% en Hermes Tools) y el razonamiento matematico (0,0% en MATH-500), pese a mantener el 100% en XSTest.
- La afirmacion de super-paridad (el modelo cuantizado supera al FP16) es contraintuitiva y carece de verificacion independiente en la informacion disponible.
- El repositorio tiene 754 descargas y 0 likes, sin evidencia de adopcion ni de validacion por parte de terceros.
- Las fechas del repositorio (creacion 2026-10-04) no coinciden con un calendario verificable en el momento de redactar esta ficha.
- La model card esta truncada a mitad de una formula, por lo que la descripcion teorica del metodo no esta completa.
- No se especifican idiomas soportados, longitud de contexto oficial ni composicion completa del dataset del modelo base.
- Riesgo de alucinacion elevado en niveles de 1 y 2 bits: el autor indica que requieren Min-P (--temp 0.6 --min-p 0.05) para evitar bucles de atraccion, lo que implica un comportamiento de generacion inestable con parametros por defecto.
- La licencia del repositorio es Apache 2.0, pero la licencia del modelo base Qwen/Qwen3.5-9B debe verificarse de forma independiente antes de un uso comercial, ya que puede imponer condiciones adicionales.
- El repositorio solo distribuye pesos GGUF ya cuantizados; no incluye los pesos en safetensors ni el script de cuantizacion reproducible.
- No se han publicado resultados de evaluacion independientes ni auditorias del metodo TAP-DPQ v7.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/Qwen3.5-9B-TAP-DPQ-v7-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog tecnico, repositorio de codigo o demo: no disponible en la informacion proporcionada.
