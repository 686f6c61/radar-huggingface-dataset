# Ethan33X/Tractus-0.8B

## Resumen

Tractus-0.8B es un modelo de decisión de doble modo (dual-mode) de 0,82 mil millones de parámetros, ajustado a partir de Qwen/Qwen3.5-0.8B-Base por el autor independiente Ethan33X. Su propósito no es la generación libre de texto, sino la evaluación calibrada de opciones candidatas: recibe un estado (texto, JSON estructurado, tablas o contexto multimodal) junto con entre 2 y 255 opciones, y devuelve probabilidades calibradas sobre cada una. Combina un modo "System 1" de una sola pasada (sin tokens generados) con un modo "System 2" de deliberación bidimensional con compuerta de fase.

La relevancia del modelo reside en su aproximación al problema de la latencia en tareas de enrutamiento y clasificación: al puntuar las opciones directamente sobre la proyección terminal del prefill, elimina la decodificación autorregresiva y reduce la cabeza de lectura en un 99,9 % respecto a la cabeza de vocabulario de 248.320 entradas. El backbone es el híbrido visión-lenguaje de Qwen3.5 (Gated DeltaNet + Gated Attention en proporción 3:1) con 262.144 tokens de contexto, lo que permite manejar estados largos y multimodales.

El autor advierte explícitamente de que por debajo de 4B parámetros el modo System 2 sin restricciones entra con frecuencia en bucles de repetición (99,6 % de fallos de parseo en su barrido uniforme a 4K), por lo que recomienda el modo Tractus-decision de una sola pasada como configuración por defecto en esta escala. El modelo se distribuye con licencia MIT modificada y está pensado para despliegue en entornos con SLA estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 24 capas (18 Gated DeltaNet + 6 Gated Attention), vision-lenguaje |
| Parametros totales | 1.006.672.704 (0,82B declarados; 0,58B backbone sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) nativa |
| Tipos de cuantizacion | BF16 (1,8 GB) e INT4 (909 MB) documentados; el repo incluye safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT modificada (modified-mit), con aviso Apache-2.0 de Qwen3.5 |
| Formato de pesos | safetensors (transformers) |
| Dimension oculta / FFN | 1.024 / 3.584 |
| Tamano de vocabulario | 248.320 |
| Tamano del repo | 2,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer híbrido que alterna capas de Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention en proporción 3:1, con 24 capas en total (18 DeltaNet + 6 Attention), dimensión oculta de 1.024 y FFN de 3.584. Esta combinación reduce el coste de memoria de la caché KV: según el autor, el cache BF16 a 256K pasa de 34,36 GB a 8,59 GB (4× de reducción), lo que hace viable el contexto largo en hardware modesto. El backbone es además visión-lenguaje, por lo que acepta contexto multimodal además de texto.

El post-entrenamiento introduce dos modos de inferencia. El modo System 1 puntúa las opciones candidatas en una sola pasada de prefill sin generar tokens, leyendo las claves en la posición terminal mediante un mecanismo denominado Thermostasis: softcapping de logits con tanh (C = 30,0), centrado de suma cero y un termostato analítico 2D sin escalares de temperatura ajustados por validación. Opcionalmente aplica dos priors binarios estáticos (+3,2 para alucinación en RAGTruth, -0,75 para phishing en PhishNChips) que solo se activan en Decision Index 0.3 y valen 0 en los otros nueve benchmarks primarios y en el conjunto OOD de 19.887 ejemplos. El modo System 2 añade deliberación con compuerta de fase 2D y reutiliza el 100 % del prefijo KV del prefill sin re-prefill al escalar. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Puntuación calibrada de opciones candidatas (entre 2 y 255) en una sola pasada, con cero tokens generados en modo System 1.
- Deliberación multi-paso en modo System 2 con compuerta de fase y reutilización del prefijo KV.
- Clasificación y enrutamiento con probabilidades calibradas (orientado a decisiones, no a texto libre).
- Procesamiento de estados multimodales: texto, JSON estructurado, tablas, layouts de interfaz y estados espaciales.
- Contexto largo de hasta 262.144 tokens para estados extensos.
- Capacidades de razonamiento causal evaluadas en JevBench 231.
- Integración con `chat_template` unificado en BF16 y contexto de 256K.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y librería transformers.

## Casos de uso

- Enrutamiento de intenciones en banca y servicios: el modelo recibe el estado de la conversación y las posibles intenciones como opciones, y devuelve la probabilidad calibrada de cada una en una sola pasada, lo que encaja con el demo Multi-Intent Banking & Service Router del autor.
- Navegación web automatizada: dado el estado de la página (layout de interfaz) y las acciones disponibles, puntúa la siguiente acción sin generar texto, reduciendo la latencia frente a un modelo generativo.
- Vigilancia de reuniones en tiempo completo (full-duplex): el demo Full-Duplex Meeting Sentinel sugiere su uso para decidir en tiempo real si intervenir o no, aprovechando la latencia cero de decodificación.
- Moderación y filtrado con calibración: la puntuación por opciones permite umbrales ajustables; el prior de phishing (-0,75) y el de alucinación (+3,2) muestran el enfoque para tareas de seguridad.
- Dinámica espacial multiagente: el demo JevBall con 22 agentes bajo un SLA de 300 ms ilustra su uso en bucles de decisión de baja latencia.
- Razonamiento causal sobre ledgers JSON: con 256K de contexto puede evaluar hipótesis causales sobre registros estructurados extensos, como en la evaluación JevBench 231.
- Despliegue en Apple Silicon: con INT4 (909 MB) y MLX corre en GPU Metal de equipos de consumo, útil para prototipado local de sistemas de decisión.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`):

| Benchmark | Metrica | Tractus-0.8B |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 18,07 |
| Decision Index 0.3 | Balanced Raw Accuracy | 37,66 % |
| JevBench 231 (dual-mode, HF 4K) | Overall Accuracy | 70,13 % (162/231) |
| JevBench 231 (single-pass, BF16 256K) | Overall Accuracy | 72,73 % (168/231) |
| JevBench 231 (Matched Commercial Suite, single-pass) | Accuracy | 73,59 % |
| JevBench 231 (Matched Commercial Suite, dual-mode) | Accuracy | 72,29 % |
| Matched Commercial Suite (single-pass) | Pooled ECE | 2,39 % |
| Matched Commercial Suite (dual-mode) | Pooled ECE | 3,85 % (3,13 % OOF) |

Desglose de JevBench 231 en dual-mode: 48/48 Easy, 65/72 Standard, 49/111 Hard. El autor reporta 131/327 rescates en el mecanismo Safety-Ratchet. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,8 GB en BF16 y 909 MB en INT4 para los pesos; la caché KV a 256K en BF16 se reduce a 8,59 GB gracias a la arquitectura híbrida.
- GPU recomendadas: A100 o H100 para contexto completo a 256K en BF16; RTX 4090 viable para contextos medios y cuantización INT4.
- Cabe en GPU de consumo: sí, con INT4 en tarjetas de 8 GB o más; el autor reporta ejecución en GPU Metal de Apple Silicon con MLX INT4.
- Opciones de despliegue: transformers (librería declarada), PyTorch/CUDA en BF16 y MLX en Apple Silicon; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el modo System 1 elimina la decodificación autorregresiva (0 tokens generados); el demo JevBall opera bajo un SLA de 300 ms, aunque no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-0.8B | 0,82B (1,006B reales) | 262.144 | Decisión dual-mode sobre Qwen3.5 | MIT modificada | Hugging Face |
| Tractus-decision-0.8B | 0,82B | 262.144 | Decisión single-pass (System 1) | MIT modificada | Hugging Face |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | Modelo base vision-lenguaje | Apache-2.0 | Hugging Face |
| Tractus-2B / 4B / 9B | 1,88B / 4,21B / 9,24B | 262.144 | Misma familia, mayor escala | MIT modificada | Hugging Face |

No se dispone de comparativas con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Por debajo de 4B parámetros, el modo System 2 sin restricciones produce bucles de repetición con un 99,6 % de fallos de parseo en el barrido uniforme a 4K; el autor recomienda el modo Tractus-decision de una pasada como opción por defecto.
- El modelo solo declara soporte de inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Los benchmarks están declarados por el autor y no verificados (`verified: false`); deben tratarse con cautela.
- El Balanced Skill en Decision Index 0.3 es de 18,07, un valor bajo en términos absolutos que sugiere margen de mejora en esa tarea.
- Los priors binarios de alucinación y phishing solo están activos en Decision Index 0.3; fuera de ese contexto no se aplican.
- La licencia es MIT modificada con cláusulas comerciales/MaaS propias y aviso Apache-2.0 de Qwen3.5; conviene revisar el archivo LICENSE antes de uso comercial.
- No es un modelo de generación de texto libre: su uso previsto es la puntuación de opciones y la clasificación calibrada.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Variante single-pass: https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Variantes de mayor escala: https://huggingface.co/Ethan33X/Tractus-2B, https://huggingface.co/Ethan33X/Tractus-4B, https://huggingface.co/Ethan33X/Tractus-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-0.8B/blob/main/LICENSE
