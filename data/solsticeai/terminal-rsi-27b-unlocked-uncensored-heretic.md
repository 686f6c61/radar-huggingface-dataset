# SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic

## Resumen

Terminal-RSI-27B-Unlocked-Uncensored-Heretic es una versión "descensurada" (decensored/abliterated) del modelo Terminal-RSI-27B, publicada por SolsticeAI mediante la herramienta Heretic v2.2.0.dev0. El modelo original, desarrollado en el marco del proyecto Terminal-RSI, es un agente de terminal basado en el backbone Qwen3.8-27B, entrenado para inspección de repositorios, edición de código, reparación de dependencias y reconstrucción de flujos de trabajo científicos que requieren interacción con un entorno ejecutable y verificación del estado resultante.

La modificación aplicada por SolsticeAI es una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) que reduce drásticamente la tasa de rechazos del modelo: de 75/100 en el original a 6/100 en esta versión, según el clasificador empleado por el autor, con una divergencia KL de 0,0397 respecto al modelo base. El resultado es un modelo de 27.356.728.560 parámetros en safetensors, con capacidad de contexto configurada de 262.144 tokens, orientado a tareas de agente multi-paso y disponible bajo licencia Apache-2.0.

Es relevante ahora porque combina dos tendencias recientes: el entrenamiento de agentes de terminal mediante auto-mejora recursiva (RSR y RPR con PPO) y la publicación de variantes sin censura que eliminan comportamientos de rechazo para entornos de investigación y despliegue controlado. El modelo está pensado para pipelines de agente que necesitan ejecutar comandos, verificar resultados y operar sobre repositorios reales, no solo para generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con componentes de visión; clase serializada `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`) |
| Parametros totales | 27.356.728.560 (safetensors); 27.781.427.952 en tensores exportados según la model card original, incluyendo visión |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan cuantizaciones GGUF ni AWQ/GPTQ en la información disponible) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, 13 archivos referenciados por el índice de pesos) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas de texto con tamaño oculto de 5.120, serializado como `Qwen3_5ForConditionalGeneration` e incluyendo componentes de visión empaquetados (pipeline image-text-to-text). El entrenamiento descrito en el paper sigue la secuencia Base → RSR-1 → RPR-1 → RSR-2 → RPR-2. La fase Recursive Self-Rewrite (RSR) descubre trayectorias verificadas en distintos arneses, las reescribe como runbooks, filtra fugas e incompatibilidades y las reejecuta; las trayectorias públicas aceptadas generan actualizaciones supervisadas solo del actor, mientras los pesos del crítico se arrastran entre etapas. La fase Recursive Policy-Refine (RPR) recalibra un crítico heredado con el actor congelado y después optimiza conjuntamente actor y crítico con PPO.

Entre las innovaciones metodológicas destacan Family Dense Reward (FDR), que normaliza el progreso parcial medido por el verificador entre familias de tareas; Success-Prioritized Reward (SPR), que combina un bonus de éxito estricto con crédito acotado por progreso parcial; y Turn-Boundary Skip-Observation GAE (TB-GAE), que formula la asignación de crédito sobre tokens generados saltando nodos de observación y aplicando decaimiento en los límites de turno. El paper señala explícitamente que TB-GAE es una contribución metodológica y no una mejora de rendimiento establecida a nivel de componente, y que su primera fase documentada usa GAE estándar con descuento y factores de traza unitarios.

La modificación de SolsticeAI aplica una ablación ARA entre las capas 4 y 61, con `preserve_good_behavior_weight` 0,1639, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9470 y `neighbor_count` 7. El proceso es reproducible según el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de terminal y agentes.
- Ejecución de acciones estructuradas en formato JSON sobre entornos ejecutables, con verificación del estado resultante.
- Inspección de repositorios, edición de código y reparación de dependencias.
- Reconstrucción de flujos de trabajo científicos y tareas de investigación reproducibles.
- Capacidades de visión integradas (pipeline image-text-to-text, componentes de visión empaquetados).
- Soporte de contexto largo: hasta 262.144 tokens configurados, con resumen proactivo del historial a los 32.000 tokens acumulados en el arnés de evaluación.
- Modo thinking explícito disponible en la arquitectura, aunque desactivado en la configuración de evaluación del paper.
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento sin censura: tasa de rechazos reducida a 6/100 según el clasificador del autor, frente a 75/100 del original.

## Casos de uso

- Automatización de tareas de terminal en CI/CD: el modelo puede recibir el estado de un repositorio, emitir acciones JSON para inspeccionar archivos, aplicar parches y verificar el resultado, integrándose en pipelines que necesitan reparar dependencias o resolver fallos de build de forma autónoma.
- Agente de reparación de dependencias: dado un entorno con conflictos de versiones, el modelo inspecciona manifiestos, propone cambios y reejecuta la instalación para confirmar el estado, aprovechando el entrenamiento sobre trayectorias verificadas.
- Reconstrucción de flujos científicos: para reproducir experimentos, el modelo puede leer scripts, reconstruir entornos y ejecutar pasos intermedios con verificación, un escenario alineado con el entrenamiento en tareas de scientific workflow reconstruction.
- Asistente de código en producción con contexto largo: con 262.144 tokens de ventana, puede cargar repositorios medianos completos y mantener coherencia entre múltiples archivos durante sesiones de edición prolongadas.
- Investigación sobre alineación y robustez: la variante sin censura permite estudiar comportamientos de rechazo y su eliminación mediante ARA, comparando con el modelo original bajo la misma licencia Apache-2.0.
- Evaluación de agentes en arneses de terminal: sirve como modelo de referencia para reproducir los resultados del paper en Terminal-Bench 2.1, 3.0, 4.0 y Hard, con la configuración de evaluación documentada (temperatura 0,60, top-p 0,95, hasta 8.192 tokens generados por turno).
- Procesamiento de documentación técnica con imágenes: gracias a los componentes de visión, puede extraer información de capturas de terminal o diagramas y convertirla en acciones ejecutables.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo original Terminal-RSI-27B en el paso RPR-2 step-18, no a esta variante descensurada. No se han publicado benchmarks específicos de la versión Heretic en la información disponible.

| Benchmark / metrica | Base | Terminal-RSI-27B (paper) |
|---|---:|---:|
| Terminal-Bench 4.0 — éxito (%) | 0,00 | 19,84 |
| Terminal-Bench 2.1 — éxito (%) | 51,70 | 86,52 |
| Terminal-Bench 3.0 — éxito (%) | 0,00 | 16,95 |
| Terminal-Bench Hard — éxito (%) | 31,00 | 79,00 |
| Media de cuatro suites (peso igual, %) | 20,68 | 50,58 |
| LHTB — recompensa media de proceso | 0,21 | 0,37 |
| LHTB — completaciones estrictas / 46 tareas | 0/46 | 5/46 |
| SWR100 — éxito (%) | 3,00 | 6,00 |

Las puntuaciones de la etapa retenida son medias aritméticas sobre tres ejecuciones de inferencia (Mean@3). La media de cuatro suites excluye LHTB y SWR100 y no está ponderada por tarea. El rendimiento depende del arnés de agente, las herramientas, los prompts, el presupuesto de tiempo y el verificador; un ejemplo de chat aislado no reproduce estas evaluaciones.

Para la variante Heretic, la model card reporta únicamente métricas de modificación: rechazos 6/100 (clasificador) y divergencia KL 0,0397 frente al original.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,7 GB solo para pesos (27.356.728.560 parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto largo.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU. Para contexto de 262.144 tokens, la caché KV exige planificación adicional de memoria.
- Cuantización: no se publican versiones GGUF, AWQ ni GPTQ en la información disponible; sin cuantización, no cabe en GPU de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB).
- Opciones de despliegue: transformers (librería declarada), con compatibilidad de endpoints indicada en los tags; no se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.
- Arnés de evaluación del paper: hasta 8.192 tokens generados por turno, 96.000 tokens de entrada por llamada, resumen proactivo a los 32.000 tokens acumulados y límite superior configurado de 100.000 turnos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---:|---|---|---|---|
| Terminal-RSI-27B-Unlocked-Uncensored-Heretic | 27,36 B | 262.144 | Agente de terminal descensurado | Apache-2.0 | Rechazos 6/100; KL 0,0397 |
| Terminal-RSI-27B (original) | 27,78 B (exportado) | 262.144 | Agente de terminal | Apache-2.0 | Rechazos 75/100; benchmarks del paper |
| Qwen3.8-27B (backbone) | no disponible | no disponible | Modelo base generalista | no disponible | Backbone citado en el paper |

No se dispone de datos de benchmarks de la variante Heretic ni de comparaciones con modelos de agente de terminal de otros proyectos en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos puede aumentar la probabilidad de generar contenido dañino, incorrecto o fuera de política; el clasificador reporta 6/100 rechazos, pero no se documenta una evaluación de seguridad exhaustiva.
- La divergencia KL de 0,0397 indica un cambio medible en la distribución de salida respecto al original; puede degradar capacidades no evaluadas.
- Riesgo de alucinación inherente a modelos de 27B en tareas de razonamiento y código; el paper advierte que el rendimiento depende del arnés, las herramientas y el verificador.
- Soporte lingüístico limitado a inglés y chino; no se garantiza calidad en castellano.
- Los benchmarks publicados corresponden al modelo original, no a esta variante; no hay evidencia de que las métricas de Terminal-Bench se mantengan tras la ablación.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue de un modelo sin censura requiere controles de seguridad y revisión legal según el contexto de aplicación.
- El modelo está orientado a agentes con entorno ejecutable; un uso conversacional aislado no reproduce las capacidades reportadas.
- No se publican cuantizaciones, lo que limita el despliegue en hardware de consumo.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; se trata de una publicación reciente con validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Terminal-RSI-27B-Unlocked-Uncensored-Heretic
- Modelo base: https://huggingface.co/Teriminal-RSI/Terminal-RSI-27B
- Paper: https://arxiv.org/abs/2610.22192
- Página del proyecto: https://jyyang26.github.io/terminal-rsi/
- Código: https://github.com/jyyang26/Terminal-RSI
- Heretic: https://heretic-project.org
