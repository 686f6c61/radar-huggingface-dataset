# expedient-ai/CTRL-2B

## Resumen

CTRL-2B es un adaptador QLoRA de tipo PEFT publicado por expedient-ai sobre el modelo base openbmb/MiniCPM5-2B (arquitectura LlamaForCausalLM, licencia Apache-2.0). No es un modelo de propósito general: está diseñado específicamente como agente de soporte con recuperación aumentada (RAG) para la base de conocimiento de infraestructura cloud de Expedient, cubriendo documentación de Nutanix, VMware VCF9, Zerto, Cohesity y material propio de la empresa. El principio de diseño es explícito: el adaptador aporta el tono y el formato de respuesta, mientras que la recuperación aporta los hechos; el modo cerrado (sin contexto) no está soportado.

El modelo se distribuye como adaptador PEFT en safetensors (596.049.920 parámetros declarados en el repo) y también como export GGUF Q8_0 para llama-server. Su relevancia radica en el enfoque de ingeniería medido: incluye una compuerta de abstención calibrada (lens 0.74) para rechazar preguntas fuera de dominio, y publica métricas de recuperación y precisión numérica sobre conjuntos de validación acotados (94 filas en la forma de producción). Es un caso de estudio de ajuste fino pequeño, reproducible y orientado a un dominio vertical muy concreto.

El entrenamiento se completó en unos 54 minutos sobre una GPU de portátil (RTX 4050, 6 GB), lo que sitúa el coste de reproducción al alcance de un equipo individual. Existe un modelo hermano, CTRL-0.6B, basado en Qwen3-0.6B y empaquetado como GGUF Q4_K_M de 378 MB para ejecución en navegador vía llama.cpp WASM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) con adaptador QLoRA (PEFT) |
| Parámetros totales | 596.049.920 (adaptador + base según safetensors); base MiniCPM5-2B de 2B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QLoRA NF4 double-quant en entrenamiento; export GGUF Q8_0 publicado |
| Idiomas soportados | no disponible (corpus y evaluación en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT), GGUF Q8_0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MiniCPM5-2B, un transformer decoder-only estándar de tipo Llama. El ajuste es QLoRA con r=16, alpha=32, learning rate 2e-4 con schedule coseno, batch efectivo de 16, 4 épocas y 211 pasos, con cómputo en bf16 y base cuantizada en NF4 double-quant. La supervisión es solo sobre turnos del asistente mediante enmascaramiento por prefijo de cadena con fallo explícito (fail-loud), lo que evita que el modelo aprenda a generar los turnos del usuario.

El corpus v2 consta de 939 filas (845 de entrenamiento / 94 de validación) tras revisión y deduplicación, compuestas por 258 filas propias revisadas manualmente más 681 promovidas mediante verificación automática de páginas fuente. Las fuentes originales suman 1.377 filas de cinco conjuntos (Nutanix 522, VMware VCF9 504, Expedient KB 218, Zerto 71, Cohesity 62); de las 1.005 filas de proveedor no revisadas se aceptaron 682, se rechazaron 207 y se retuvieron 116 para revisión humana. No se menciona RLHF ni DPO. Una ejecución de control con un modelo de 4B no aportó ganancia clara de calidad a cambio del doble de tamaño (19,9 s por paso frente a 15,4 s), por lo que se optó por la variante de 2B.

## Capacidades

- Generación de texto conversacional orientada a soporte técnico de infraestructura cloud.
- Respuestas ancladas a contexto recuperado (top-3 fragmentos inyectados desde un índice con bge-small-en-v1.5 y reranking con cross-encoder).
- Recuperación de hechos numéricos exactos (versiones, cifras, configuraciones) cuando el dato está en el contexto.
- Abstención calibrada ante preguntas fuera de dominio mediante una compuerta compuesta (lens 0.74).
- Robustez ante parafraseo de preguntas (reescritura manual del conjunto de validación).
- Export GGUF con paridad de comportamiento verificada en llama-server.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Soporte técnico de primer nivel en infraestructura cloud: el modelo responde consultas sobre Nutanix, VMware VCF9, Zerto y Cohesity usando fragmentos recuperados de la KB, con abstención cuando la pregunta cae fuera del corpus.
- Asistente interno para el equipo de soporte de Expedient: acelera la localización de cifras exactas (RPO recomendados, footprint de centros de datos, límites de vCPU por nodo) sin que el operador tenga que navegar la documentación de proveedor.
- Despliegue en el borde o en local: el adaptador se entrenó en una RTX 4050 de 6 GB y el export GGUF Q8_0 se ejecuta en llama-server, lo que permite montar el asistente en hardware modesto o en entornos con requisitos de privacidad.
- Demo interactiva en navegador mediante el modelo hermano CTRL-0.6B (GGUF Q4_K_M de 378 MB con llama.cpp WASM), útil para validar el flujo de recuperación y abstención sin infraestructura de servidor.
- Base para ajuste vertical en otros dominios: la receta (QLoRA r16, corpus pequeño revisado, compuerta de abstención calibrada) es reproducible en menos de una hora y sirve de plantilla para KBs corporativas de tamaño similar.
- Filtrado y moderación de consultas entrantes: la compuerta de abstención puede reutilizarse como clasificador de consultas fuera de alcance antes de enrutarlas a un humano o a otro sistema.
- Evaluación de pipelines RAG: las métricas publicadas (hit@3, recall y precisión numérica) permiten usar el modelo como referencia para comparar configuraciones de recuperación y reranking.

## Benchmarks y rendimiento

Métricas publicadas por el autor: recall de hechos numéricos (números del gold presentes en la respuesta) y precisión (números de la respuesta presentes en el gold, señal de invención).

| Evaluación | Filas | Índice | Hit@3 | Recall | Precisión |
|---|---|---|---|---|---|
| Cerrado, held-out (base MiniCPM5-2B) | 26 | — | — | 0.692 | — |
| Cerrado, held-out (adaptador) | 26 | — | — | 0.772 | 0.865 |
| Abierto, validación held-out | 26 | 257 | 26/26 (rank 0.0) | 0.962 | 0.962 |
| Abierto, forma de producción | 94 | 939 | 94/94 (rank 0.0) | 0.943 | 0.945 |
| GGUF Q8_0, llama-server (abierto) | 26 | — | — | 1.000 | 0.981 |
| GGUF Q8_0, llama-server (global) | 26 | — | — | — | 0.889 |
| Parafraseo manual (abierto) | 26 | — | 26/26 | 0.962 | 0.962 |
| Fuera de dominio (compuerta) | 15 | — | — | 15/15 bloqueadas | — |

La abstención solo por prompt alcanza un 20 %; la compuerta compuesta es necesaria. Umbral medido: máximo OOD 0.723, compuerta en 0.740, percentil 25 de paráfrasis en 0.748. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento: RTX 4050 Laptop de 6 GB, ~54 minutos, 211 pasos, bf16 con base NF4 double-quant.
- Inferencia del adaptador sobre base 2B: cabe en GPUs consumer de 6-8 GB en cuantización de 4 bits; en bf16 requiere aproximadamente 4-5 GB solo para pesos, más overhead de contexto.
- Export GGUF Q8_0: ejecutable en llama-server; el modelo hermano de 0.6B en Q4_K_M ocupa 378 MB y corre en navegador vía llama.cpp WASM.
- GPUs recomendadas: RTX 4050/4060/4090 para inferencia local; A100/H100 no son necesarias para este tamaño, pero permitirían mayor throughput en serving concurrente.
- Opciones de despliegue: llama.cpp / llama-server (GGUF verificado), PEFT sobre transformers, y previsiblemente vLLM o TGI con el modelo base fusionado (no verificado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTRL-2B | 2B (base) + adaptador | no disponible | RAG vertical sobre KB de Expedient | Apache-2.0 | Hugging Face, GGUF Q8_0 |
| CTRL-0.6B | 0.6B (Qwen3-0.6B) | no disponible | Mismo corpus y receta, orientado a navegador | Apache-2.0 (según base) | Hugging Face, GGUF Q4_K_M 378 MB |
| MiniCPM5-2B (base) | 2B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Modelos generalistas de 2B (p. ej. Qwen, Llama pequeños) | 1-3B | variable | Uso general, sin grounding | variable | Hugging Face |

Frente a la base MiniCPM5-2B, el adaptador mejora el recall cerrado de 0.692 a 0.772 y añade precisión de 0.865, además de la compuerta de abstención. Frente a CTRL-0.6B, gana en calidad cerrada (0.772/0.865 frente a 0.692/0.846) pero pierde la capacidad de ejecutarse en una pestaña del navegador. Ambos convergen en torno a 0.96 de recall con recuperación.

## Limitaciones y advertencias

- El modo cerrado (sin contexto recuperado) no está soportado; usarlo así produce respuestas no fiables y mayor tasa de invención de cifras.
- La abstención depende de una compuerta externa calibrada (lens 0.74); el prompt por sí solo solo bloquea el 20 % de las consultas fuera de dominio.
- El corpus es pequeño (939 filas tras revisión) y cubre únicamente cinco fuentes de infraestructura; cualquier tema fuera de ese ámbito debe rechazarse.
- La evaluación se basa en 26 y 94 filas, con métricas de recall y precisión numérica, no en benchmarks estándar; la significación estadística es limitada.
- El corpus y la evaluación están en inglés; el soporte multilingüe no está documentado.
- Riesgo de alucinación en cifras y versiones cuando el fragmento recuperado no contiene el dato exacto; la precisión de 0.945 implica que una fracción de los números generados no está respaldada por el gold.
- Licencia Apache-2.0 permite uso comercial, pero el contenido de la KB de Expedient y de los proveedores puede tener restricciones propias que no cubre la licencia del modelo.
- El modelo está ajustado para una marca y un producto concretos (familia AI CTRL); reutilizarlo fuera de ese contexto requiere reentrenamiento del adaptador.
- No hay datos publicados de latencia, throughput ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/expedient-ai/CTRL-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo hermano CTRL-0.6B: https://huggingface.co/expedient-ai/CTRL-0.6B
- Demo Space: https://huggingface.co/spaces/expedient-ai/ctrl-0.6b-demo
- Space informativo de la model card: https://huggingface.co/spaces/chadstthomas/ctrl-2b-info
