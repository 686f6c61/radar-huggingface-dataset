# eren8392/laya-descent-v4

## Resumen

laya-descent-v4 es un checkpoint de la familia Laya publicado por el usuario eren8392 en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base `convaiinnovations/laya`, entrenado mediante imitación de un autopiloto escrito a mano para resolver el benchmark del simulador de aterrizaje lunar "Low Gate". No es un modelo de lenguaje de propósito general, sino un artefacto de benchmark orientado a la toma de decisiones (decision model) dentro de un único juego y con un prompt concreto.

El modelo base Laya es un modelo de decisión "System 1" (respuesta rápida e intuitiva) que produce elecciones tipadas, puntuaciones y probabilidades. Según la documentación pública del proyecto, el checkpoint inglés por defecto de Laya se construye sobre ModernBERT-large, con 421 millones de parámetros y una longitud de contexto de 512 tokens. laya-descent-v4 hereda esa arquitectura y la especializa mediante aprendizaje por imitación sobre datos de un autopiloto.

La relevancia de esta ficha es acotada: se publica como artefacto reproducible de un benchmark concreto (el autor reporta 142 de 160 niveles superados en los cursos 5001-5020), no como modelo para producción general. Su interés reside en el pipeline de ajuste fino, la conversión a MLX y la verificación cruzada entre builds (PyTorch y MLX), más que en capacidades lingüísticas o de razonamiento abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (heredada del modelo base Laya); fine-tune para decisión |
| Parametros totales | 421M (según la ficha del checkpoint inglés de Laya; no confirmado explícitamente para este fine-tune) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (según la ficha del checkpoint inglés de Laya) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo con directorios `torch/` y `mlx/`); tamaño del repo 1,7 GB |

## Arquitectura y entrenamiento

laya-descent-v4 parte del checkpoint `convaiinnovations/laya` en la revisión `7b928d828b7b0e022f929d9bd2e44165aa270148`. El modelo base es un modelo de decisión "System 1" construido sobre ModernBERT-large (encoder transformer de 421M parámetros y 512 tokens de contexto según la documentación pública del proyecto). Sobre esa base, este checkpoint se ajusta mediante aprendizaje por imitación (imitation learning) para replicar el comportamiento de un autopiloto escrito a mano en el benchmark del simulador lunar "Low Gate".

El ajuste se realizó con la librería `laya` en versión 0.4.17 y con un reajuste de temperaturas (temperatures refitted). El repositorio incluye el checkpoint en PyTorch con el `train_report.json` original, una conversión a MLX (la que voló el benchmark), los datos de entrenamiento y evaluación en `data/f3-dagger1/` y un fichero `SHA256SUMS` con hashes de todos los ficheros. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas: produce elecciones, puntuaciones y probabilidades dentro del espacio de acciones del simulador "Low Gate".
- Imitación de política: replica las maniobras de un autopiloto escrito a mano para el aterrizaje lunar.
- Inferencia en dos runtimes: existe build en PyTorch y build en MLX; según el autor, ambos eligieron la misma maniobra en 5.795 de 5.801 estados registrados.
- Evaluación de benchmark: capacidad de volar niveles del benchmark (142 de 160 en los cursos 5001-5020).
- No se documentan capacidades de generación de texto abierto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo para este checkpoint.

## Casos de uso

- Reproducción de benchmarks de decisión: permite replicar el experimento del "Low Gate" con los datos y pesos publicados, verificando la puntuación reportada de 142/160 niveles.
- Investigación en aprendizaje por imitación: sirve como caso de estudio de ajuste fino de un modelo de decisión para copiar una política heurística escrita a mano.
- Validación de pipelines de conversión PyTorch a MLX: el par de builds y la comprobación cruzada abierta permiten estudiar la fidelidad de la conversión entre runtimes.
- Desarrollo de autopilotos para entornos simulados: la política aprendida puede servir de línea base para comparar con controladores clásicos o con RL.
- Auditoría de artefactos de benchmark: el `train_report.json`, los datos en `data/f3-dagger1/` y `SHA256SUMS` permiten auditar el entrenamiento y la integridad de los ficheros.
- Docencia sobre evaluación rigurosa: el propio autor documenta la etiqueta `overlapping_eval` (2 de 2.728 ítems de evaluación solapan con entrenamiento), lo que lo convierte en un ejemplo útil de transparencia metodológica.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Niveles superados (cursos 5001-5020) | 142 de 160 |
| Concordancia PyTorch vs MLX | 5.795 de 5.801 estados registrados |
| Solapamiento evaluación/entrenamiento | 2 de 2.728 ítems (etiquetado `overlapping_eval`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 421M parámetros y pesos en safetensors (repo de 1,7 GB), la inferencia en precisión completa o media precisión es viable en GPUs de consumo.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs de consumo modernas, aunque no hay especificación oficial.
- Cabe en consumer GPU: previsiblemente sí, dado el tamaño del modelo base; no confirmado para este checkpoint.
- Opciones de despliegue: librería `laya` 0.4.17, build MLX (Apple Silicon) y build PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-descent-v4 | 421M (base) | 512 tokens | Decisión (fine-tune de benchmark) | Apache-2.0 | Hugging Face |
| convaiinnovations/laya | 421M | 512 tokens | Decisión System 1 general | Apache-2.0 (según base) | Hugging Face |
| Jev | no disponible | no disponible | Decisión System 1 (alternativa citada por Laya AI) | no disponible | no disponible |

La información disponible no permite una comparación cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Modelo específico de un único juego y prompt: el propio autor lo describe como artefacto de benchmark, no como modelo de propósito general.
- Solapamiento en evaluación: 2 de 2.728 ítems de evaluación coinciden con entrenamiento; el informe de entrenamiento lo etiqueta como `overlapping_eval`.
- Verificación cruzada en bucle abierto: la comparación PyTorch/MLX solo contrasta respuestas en estados registrados y no vuela cursos nuevos.
- Sin datos publicados sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero al ser una versión modificada del modelo base conviene revisar el fichero `NOTICE` y las condiciones del modelo original.
- Sin descargas ni likes en el momento de la consulta, y creado y actualizado el mismo día: no hay evidencia de uso comunitario ni validación externa.
- No se documentan cuantizaciones ni soporte en frameworks de inferencia estándar, lo que limita su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eren8392/laya-descent-v4
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Benchmark Low Gate: https://github.com/ErenTerakye/lowgate
- Página del proyecto Laya AI: https://laya-ai.com/
- Ficha del checkpoint inglés de Laya: https://laya-ai.com/models/laya
