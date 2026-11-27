# brendanboyle/LFM3-1.7B-Pi-MLX-14Task

## Resumen

LFM3-1.7B-Pi-MLX-14Task es un adaptador LoRA de investigación publicado por brendanboyle sobre el modelo base LiquidAI/LFM3-1.7B-MLX-bf16. No se trata de un modelo completo, sino de un conjunto de pesos delta (rango 32, alpha 64) que se aplican sobre las proyecciones del decodificador del transformer subyacente para especializarlo en tareas agénticas de resolución de problemas con verificación ejecutable. El adaptador se entrenó mediante un esquema de policy gradient relativo a grupo (estilo GRPO) sobre trayectorias completas muestreadas, con recompensas calculadas por verificadores ejecutables.

El interés del artefacto es metodológico: demuestra que es viable ejecutar un ciclo completo de reinforcement learning agéntico sobre Apple Silicon (un Mac Studio con M4 Max y 128 GB de memoria unificada), sin GPUs de datacenter, usando MLX como backend y contenedores ARM64 en modo offline. El adaptador forma parte del proyecto MLX Harness Adapter (v0.1.0) y representa una línea base temprana de 14 tareas, previa a iteraciones posteriores del mismo autor.

La relevancia práctica es acotada pero concreta: en la evaluación held-out sobre 150 tareas de análisis de datos, el adaptador mejora la tasa de acierto del modelo base en +7,33 puntos porcentuales y reduce un 25,83 % los tokens lógicos por tarea resuelta, a costa de un +10,11 % de tokens de completion generados. Es, por tanto, un ejemplo reproducible de cómo el RL agéntico puede mejorar la eficiencia de uso de herramientas además de la precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32, alpha 64, scale 2) sobre transformer LiquidAI LFM3; 153 proyecciones del decodificador objetivo |
| Parámetros totales | No disponible (el adaptador es un delta; el base LFM3-1.7B tiene 1,7 mil millones según su denominación) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 6.144 tokens en la configuración de evaluación; contexto nativo del base no disponible en la información proporcionada |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el base referenciado es bf16) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (adapters.safetensors), más adapter_config.json, adapter_metadata.json, SHA256SUMS.txt |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B-MLX-bf16, fijado en la revisión `52041852d5b5c59bfe120c075d2744ab97959d91`. El delta LoRA tiene rango 32 con alpha 64 (scale 2) y afecta a 153 proyecciones del decodificador. El pipeline declarado es reinforcement-learning: se usó un policy gradient relativo a grupo (GRPO-style) con una única actualización por grupo sobre tokens de completion exactamente muestreados. Las recompensas provienen de verificadores ejecutables que puntúan cada intento, con un pequeño bonus de eficiencia de herramientas en los casos superados y recompensa efectiva cero tras un bloqueo SafeAgents forzado.

El proceso de entrenamiento consta de dos fases. Un warmup compartido aplicó tres actualizaciones sobre 24 rollouts en dos tareas, con una duración aproximada de 19 minutos. La ejecución principal de 14 tareas partió de esos pesos con un optimizador Adam nuevo: 400 rollouts en 50 grupos sobre 14 tareas nuevas, 41 actualizaciones aplicadas y un tiempo total de 7 h 53 min. El cribado de tareas principales preparó 64 candidatos y ejecutó 176 intentos de calibración (44 candidatos × 4 intentos con la política de warmup); las 14 tareas seleccionadas presentaron resultados mixtos de verificador y quedaron fijadas en un manifiesto congelado para permitir reproducciones sin repetir el cribado. El dataset de entrenamiento es FineEnvs/SmolDataEnvs-harbor-train, fijado en la revisión `588744be728257abfb8d4984ec8fab2acbd1f7e1`. El entorno de ejecución fueron contenedores Harbor ARM64 offline con Pi 1.5.2. Todo el entrenamiento y la evaluación se ejecutaron en un Mac Studio con M4 Max y 128 GB de memoria unificada; el pico del allocator de MLX durante el entrenamiento principal fue de 35,526 GiB y el pico histórico de recolección para este adaptador, 19,927 GiB.

## Capacidades

- Razonamiento agéntico multi-paso con uso de herramientas: el adaptador está entrenado para resolver tareas mediante turnos sucesivos (hasta 10 turnos en la evaluación) con llamadas a herramientas y verificación del resultado.
- Análisis de datos: la evaluación held-out se compone de 150 tareas fáciles o medias de QA sobre análisis de datos, procedentes de 93 datasets fuente.
- Eficiencia en el uso de herramientas: en las 59 tareas resueltas por ambas variantes (base y adaptador), las llamadas a herramientas originales bajan de 280 a 219 (−21,79 %).
- Reducción de tokens lógicos: 27.026 tokens lógicos por tarea resuelta frente a 36.440 del base (−25,83 %), incluyendo prompt renderizado y completion muestreada.
- Generación de texto y código heredada del modelo base LFM3-1.7B (capacidades específicas del base no detalladas en la información disponible).
- Soporte de tool calling: implícito en el pipeline agéntico (Pi 1.5.2 con verificadores ejecutables), aunque no se documenta un esquema de function calling genérico.
- Modo de esfuerzo configurable: la evaluación usa `--effort low` y `--max-output 768` en el ejemplo de ejecución; no se documentan otros modos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación reproducible en RL agéntico sobre Apple Silicon: el adaptador sirve como línea base de 14 tareas con manifiesto congelado, dataset fijado por revisión y script de verificación SHA256, lo que permite reproducir el ciclo de entrenamiento y evaluación en un Mac Studio sin GPUs dedicadas.
- Automatización de análisis de datos con verificación ejecutable: el adaptador está ajustado para tareas de QA sobre datasets donde la respuesta se comprueba ejecutando código; encaja en pipelines internos de validación de informes o extracción de métricas donde el resultado es verificable de forma automática.
- Reducción de coste por tarea en agentes de datos: al recortar un 25,83 % los tokens lógicos por tarea resuelta y un 21,79 % las llamadas a herramientas en éxitos compartidos, es adecuado para flujos con presupuesto de tokens ajustado, como ejecuciones por lotes sobre catálogos de datasets.
- Prototipado local de agentes con herramientas en macOS: el stack (uv, MLX, Docker, contenedores ARM64) permite iterar sobre políticas agénticas en un portátil o estación de trabajo Apple sin depender de servicios en la nube, útil para equipos que trabajan con datos sensibles que no pueden salir del dispositivo.
- Evaluación comparativa de adaptadores: el protocolo de evaluación (rotación de seis órdenes, 10.000 remuestreos bootstrap por dataset fuente, intervalos pareados al 95 %) es reutilizable para comparar adaptadores propios contra el base y contra el adaptador publicado en Harness Hub.
- Formación y docencia en RL aplicado: el proyecto documenta metodología, procedencia y auditoría de cribado, por lo que el adaptador sirve como material de estudio de un ciclo GRPO completo con verificadores, incluidos los detalles de bonus de eficiencia y bloqueo de seguridad.

## Benchmarks y rendimiento

Evaluación held-out: 150 tareas fáciles o medias de QA de análisis de datos (93 datasets fuente), un intento estocástico por brazo y tarea, temperatura 0,8, esfuerzo bajo, mismas semillas por tarea, verificador offline, hasta 10 turnos, 6.144 tokens de contexto y 1.024 tokens de salida por petición. Intervalos pareados al 95 % con 10.000 remuestreos bootstrap por dataset fuente.

| Métrica | Base → adaptador local | Cambio pareado (IC 95 %) |
|---|---:|---:|
| Tasa de acierto | 72/150 → 83/150 | +7,33 pp (−1,29 a +15,79 pp) |
| Tokens lógicos por tarea resuelta | 36.440 → 27.026 | −25,83 % (−36,82 % a −13,64 %) |
| Tokens lógicos totales | 2.623.700 → 2.243.155 | −14,50 % (−22,15 % a −5,49 %) |
| Llamadas a herramientas originales en 59 éxitos compartidos | 280 → 219 | −21,79 % (−28,91 % a −13,85 %) |
| Tokens de completion generados | 189.026 → 208.144 | +10,11 % (+0,19 % a +22,03 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento y evaluación realizados en un Mac Studio con M4 Max y 128 GB de memoria unificada.
- Pico del allocator de MLX durante el entrenamiento principal: 35,526 GiB. Pico histórico de recolección para este adaptador: 19,927 GiB. Son medidas del allocator para las cargas registradas; debe dejarse margen adicional para macOS y Docker.
- El adaptador requiere el base BF16 LiquidAI/LFM3-1.7B-MLX-bf16 en la revisión fijada; el repo del adaptador ocupa 0,1 GB.
- Ejecución en Apple Silicon con `uv` y Docker activo; backend MLX (`--backend lfm3`).
- No cabe esperar despliegue en GPUs NVIDIA con este artefacto tal cual: los pesos están en formato MLX y el stack de referencia es Apple Silicon. Opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponibles; el autor solo publica tiempos de entrenamiento (warmup de 19 min; ejecución principal de 7 h 53 min).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Pi-MLX-14Task (este) | Adaptador LoRA sobre LFM3-1.7B | Delta rango 32; base de 1,7 B | 6.144 tokens en evaluación | lfm1.0 | Hugging Face, revisión v0.1.0 |
| LiquidAI/LFM3-1.7B-MLX-bf16 | Modelo base completo | 1,7 B | No disponible | lfm1.0 | Hugging Face, revisión fijada |
| Adaptador publicado en Harness Hub (rev. `6b15c1c…`) | Adaptador comparable en el mismo protocolo de evaluación | No disponible | 6.144 tokens en evaluación | No disponible | Harness Hub |

La comparación directa con el base y con el adaptador de Harness Hub está documentada en el protocolo de evaluación del autor; los resultados numéricos del adaptador de Harness Hub no se detallan en la información proporcionada. No se dispone de comparación con modelos de otros proveedores en la misma categoría.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo autónomo: sin el base BF16 en la revisión exacta `52041852d5b5c59bfe120c075d2744ab97959d91` no funciona.
- La mejora en tasa de acierto es modesta y el intervalo de confianza del +7,33 pp cruza cero (−1,29 a +15,79 pp); no puede afirmarse significación estadística al 95 %.
- El adaptador incrementa un 10,11 % los tokens de completion generados; el ahorro neto proviene de la reducción de tokens lógicos y de llamadas a herramientas, no de generar menos texto.
- Entrenado sobre 14 tareas y evaluado sobre 150 tareas de análisis de datos; la generalización fuera de ese dominio no está demostrada.
- El cribado de tareas mostró resultados mixtos de verificador; el rendimiento por tarea puede ser irregular.
- Riesgo de alucinación no cuantificado en la información disponible; el pipeline mitiga parcialmente mediante verificación ejecutable, pero solo en tareas con verificador.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe más allá del base.
- Licencia lfm1.0: deben revisarse las condiciones de uso comercial del modelo base LiquidAI antes de cualquier despliegue en producción; el adaptador hereda restricciones del base.
- El stack de ejecución depende de macOS, Apple Silicon, Docker y contenedores ARM64 offline; no hay soporte documentado para CUDA.
- Requiere comprobar presión de memoria antes de cargar el modelo (preflight de memoria documentado por el autor).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brendanboyle/LFM3-1.7B-Pi-MLX-14Task
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-bf16/tree/52041852d5b5c59bfe120c075d2744ab97959d91
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train/tree/588744be728257abfb8d4984ec8fab2acbd1f7e1
- Repositorio MLX Harness Adapter: https://github.com/brendanboyle87/local-apple-harness-adapter
- Guía de instalación: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/README.md#install
- Preflight de memoria en Apple Silicon: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/AGENTS.md#apple-silicon-memory-preflight
- Metodología: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/docs/methodology.md
- Protocolo de evaluación: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/docs/methodology.md#reference-experiment
- Procedencia del entrenamiento: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi/provenance.json
- Recuentos de cribado: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi-breadth/release-audit.json
- Manifiesto de entrenamiento congelado: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/examples/smoldataenvs/train.jsonl
- Mediciones de recolección: https://github.com/brendanboyle87/local-apple-harness-adapter/blob/ea8dc487b71cd7fd421f956cb8c4441ae1a9b2e4/results/lfm3-pi/efficiency-pairs.jsonl
- Licencia: https://huggingface.co/brendanboyle/LFM3-1.7B-Pi-MLX-14Task/blob/v0.1.0/LICENSE
