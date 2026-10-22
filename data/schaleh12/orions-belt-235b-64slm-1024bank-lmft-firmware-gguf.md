# schaleh12/Orions-Belt-235B-64SLM-1024Bank-LMFT-Firmware-GGUF

## Resumen

Orion's Belt (`Orions-Belt-235B-64SLM-1024Bank-LMFT-Firmware-GGUF`) es un artefacto GGUF publicado por el usuario `schaleh12` que se presenta como un sistema "de clase 235B+ equivalente" construido sobre una arquitectura propietaria denominada Language Model Fuzzy Tree (LMFT). Según la model card, combina un backbone lingüístico cuantizado de 0,5–0,6B con un "árbol difuso" neuro-simbólico de 40 nodos, 194 reglas difusas, 4 núcleos cuaterniónicos y 64 núcleos SLM × 16 sub-cartuchos = 1.024 bancos de memoria especializados. El problema que dice resolver es la inferencia local sin VRAM de GPU (0 MB) manteniendo velocidades de decodificación altas en CPU.

El dato clave es la discrepancia entre el nombre comercial ("235B") y el recuento real de parámetros reportado por Hugging Face en safetensors: **630.167.424 parámetros** (≈0,63B). El propio autor describe el backbone como un GGUF cuantizado de 0,5–0,6B (~468,64 MB) residente en RAM, y el modelo base declarado es `Qwen/Qwen2.5-14B-Instruct`. Por tanto, el "235B equivalente" es una afirmación de marketing del autor, no un recuento de pesos verificable, y debe interpretarse como una descripción de la arquitectura de enrutamiento propuesta, no del tamaño efectivo del modelo.

La relevancia ahora es limitada y fundamentalmente crítica: el repositorio tiene 0 descargas y 2 likes, no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) y buena parte de la model card son afirmaciones no verificadas (457,29 tok/s, 9,06 ms TTFT). Es útil como caso de estudio de empaquetado GGUF y de inferencia en CPU, pero no como un modelo de 235B real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido neuro-simbólico según el autor (backbone transformer Qwen2 cuantizado + "Language Model Fuzzy Tree" con reglas difusas); el backbone efectivo es un transformer Qwen2 de ~0,63B |
| Parámetros totales | 630.167.424 (según safetensors/HF); el autor lo etiqueta como "235B+ equivalente" (no verificado) |
| Parámetros activos | El autor afirma 24/1.024 bancos activos por turno (2,34 % de dispersión); no verificable de forma independiente. No es un MoE convencional con expertos densos |
| Longitud de contexto | No disponible (la model card no especifica ventana; no debe asumirse la de Qwen2.5-14B) |
| Tipos de cuantización | GGUF cuantizado (repo de 1,0 GB); niveles concretos (Q4_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El autor describe LMFT como una arquitectura cognitiva neuro-simbólica con cuatro capas: (1) un bus ejecutivo de 4 núcleos cuaterniónicos (`1, i, j, k`, 768 floats en caché L1) que calcula el enrutamiento difuso de 24 hojas y el filtrado de seguridad constitucional; (2) un árbol difuso fundacional de 40 nodos con 194 reglas Mamdani/Sugeno; (3) un enrejado tensorial algebraico de 256 KB (65.536 floats) residente en caché L2/L3; y (4) un flujo lingüístico GGUF cuantizado de ~468,64 MB (~0,6B) en RAM. La especialización de dominio se factoriza en 64 núcleos SLM × 16 sub-cartuchos Hexagrama = 1.024 bancos de memoria, con un enrutador que selecciona un subconjunto por turno.

No hay información verificable sobre el conjunto de datos de entrenamiento (número de tokens, composición, uso de RLHF/DPO o fine-tuning supervisado). El modelo base declarado es `Qwen/Qwen2.5-14B-Instruct`, aunque el artefacto publicado pesa 1,0 GB y contiene ~630M parámetros, por lo que la relación exacta entre el modelo base y los pesos distribuidos no está documentada. La "innovación" declarada (enrutamiento difuso determinista con "0.000000 de deriva estacionaria") no viene acompañada de paper, código de entrenamiento reproducible ni evaluación independiente en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés (`text-generation`, pipeline conversacional).
- Inferencia local en CPU sin VRAM de GPU, según el autor (0 MB).
- Servidor compatible con la API OpenAI (`/v1`) a través de LM Studio y del firmware LMFT.
- Enrutamiento difuso entre bancos de especialistas (afirmación del autor, no verificada).
- Filtrado de seguridad constitucional descrito como parte del bus ejecutivo (afirmación del autor).
- Soporte de tool calling / function calling: no disponible / no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking": no documentado.

## Casos de uso

- Despliegue en CPU sin GPU: el modelo está pensado para ejecutarse íntegramente en RAM y caché de CPU mediante LM Studio o llama.cpp, lo que lo hace adecuado para entornos sin acelerador gráfico.
- Prototipado rápido de servidores compatibles con OpenAI: al exponer un endpoint `/v1`, permite sustituir un backend remoto por uno local para pruebas de integración.
- Evaluación de arquitecturas de enrutamiento: útil como banco de pruebas para estudiar la propuesta LMFT de enrutamiento difuso sobre un backbone pequeño.
- Aplicaciones de chat de baja latencia en inglés: para asistentes conversacionales simples donde la ventana de contexto corta y el idioma inglés sean aceptables.
- Demostraciones educativas de inferencia GGUF: sirve para ilustrar el ciclo de carga de un GGUF cuantizado y la exposición de una API local.
- Investigación sobre afirmaciones de rendimiento: útil para contrastar de forma escéptica las métricas declaradas (tok/s, TTFT) frente a mediciones propias.
- No recomendado para producción crítica: sin benchmarks estándar ni validación independiente, no es adecuado para tareas que exijan fiabilidad medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta métricas de inferencia propias, que se recogen a continuación como **afirmaciones del autor, no verificadas de forma independiente**:

| Métrica (autor) | Valor declarado |
|---|---|
| Generación sostenida en CPU | 457,29 tok/s (pico 480,98 tok/s) |
| Procesamiento de prompt en CPU | 24.737,1 tok/s (pico 28.785,52 tok/s) |
| TTFT en caché | 9,06 ms (media 16,59 ms entre turnos) |
| Latencia de enrutamiento (1.024 bancos) | 2,5553 ms |
| Reutilización de caché KV multi-turno | 100,0 % |

No se dispone de comparación con modelos de referencia en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 0 MB según el autor (inferencia en CPU); no verificado de forma independiente.
- RAM estimada: el backbone GGUF ocupa ~468,64 MB, más el enrejado de 256 KB; un entorno de ejecución práctico requeriría del orden de 1–2 GB de RAM para el modelo y el runtime (estimación, no dato oficial).
- GPU recomendadas: no aplica según el diseño declarado; cualquier GPU compatible con llama.cpp podría usarse, pero no es el objetivo.
- ¿Cabe en GPU de consumo? El tamaño real (~0,63B, repo de 1,0 GB) cabría en cualquier GPU de consumo moderna con suficiente VRAM, pero el artefacto está orientado a CPU.
- Opciones de despliegue: LM Studio, llama.cpp, servidor compatible OpenAI `/v1` del firmware LMFT; soporte de vLLM/TGI no documentado.
- Latencia y throughput: solo las cifras declaradas por el autor (ver sección de benchmarks); no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion's Belt (este) | ~630M reales (etiquetado "235B+") | No disponible | MIT | GGUF | Arquitectura LMFT propietaria; sin benchmarks estándar |
| Qwen2.5-0.5B-Instruct | ~0,49B | 32K | Apache 2.0 | safetensors, GGUF | Comparable real por tamaño; benchmarks públicos |
| SmolLM2-1.7B-Instruct | ~1,7B | 8K (según versión) | Apache 2.0 | safetensors, GGUF | Alternativa小 de código abierto con evaluación pública |
| Gemma-2-2B-it | ~2,6B | 8K | Gemma (uso comercial con condiciones) | safetensors, GGUF | Mayor tamaño y benchmarks publicados |

La comparación relevante es con modelos de ~0,5–2B, no con sistemas de 235B, dado el recuento real de parámetros.

## Limitaciones y advertencias

- Discrepancia crítica de nomenclatura: el nombre y las etiquetas indican "235B" y "235b", pero el recuento real es ~630M de parámetros; el "235B equivalente" es una afirmación del autor sin verificación.
- Afirmaciones de rendimiento no verificadas: las cifras de 457 tok/s, 9 ms TTFT y "0 MB de VRAM" proceden únicamente de la model card y no cuentan con reproducción independiente.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad publicadas.
- Entrenamiento no documentado: se desconoce el dataset, el número de tokens y si hubo RLHF/DPO.
- Idioma: solo inglés; sin soporte multilingüe declarado.
- Contexto no especificado: no debe asumirse una ventana larga; podría degradar en conversaciones extensas.
- Riesgo de alucinación: al ser un backbone pequeño sin evaluación, la fiabilidad factual no está garantizada.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni responsabilidad sobre el comportamiento del modelo.
- Señales de baja madurez: 0 descargas, 2 likes, model card con lenguaje grandilocuente y mayúsculas, lo que aconseja tratar las métricas con escepticismo.
- Dependencia del firmware propietario: parte de la funcionalidad descrita (enrutamiento, servidor) depende del ejecutable externo `LMFT-Firmware`, no incluido en el repo de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/schaleh12/Orions-Belt-235B-64SLM-1024Bank-LMFT-Firmware-GGUF
- Repositorio GitHub LMFT-Firmware: https://github.com/schaleh12/LMFT-Firmware
- Release del instalador v2.2.2: https://github.com/schaleh12/LMFT-Firmware/releases/tag/v2.2.2
- LMFT-Trainee v2.2.2: https://github.com/schaleh12/LMFT-Trainee/releases/tag/v2.2.2
- LMFT-School (documentación): https://github.com/schaleh12/LMFT-School
- Índice de documentación LMFT-School: https://github.com/schaleh12/LMFT-School/blob/main/docs/INDEX.md
- Galería Imgur del autor: https://imgur.com/gallery/crazy-new-ai-technology-breakthrough-tons-of-performance-with-almost-zero-compute-overhead-8LHnIiH
- Perfil del autor en Hugging Face: https://huggingface.co/schaleh12
