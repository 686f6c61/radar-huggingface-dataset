# lhl616/qwen3-critic-categorical-20261009-checkpoints

## Resumen

El repositorio `lhl616/qwen3-critic-categorical-20261009-checkpoints` no contiene un modelo generativo al uso, sino un archivo de checkpoints de investigación derivados de Qwen3-4B-Base. Lo publica el usuario lhl616 bajo licencia Apache 2.0 y recoge dos ramas de un experimento sobre críticos de valor (critics) para entrenamiento por refuerzo: una con cabeza de distribución categórica HL-Gauss (paso global 300) y otra con cabeza escalar nativa MSE (paso global 210). El entrenamiento nativo se detuvo a los 239 lotes completos, por lo que no existe un resultado nativo en el paso 300.

La relevancia es acotada y muy específica: sirve para reproducir o auditar una comparación entre dos parametrizaciones de la función de valor en un pipeline PPO/VERL. No es un modelo para inferencia de texto: los críticos son modelos de valor por token, no modelos causales de lenguaje, y el directorio `huggingface/` solo contiene configuración y tokenizador, no pesos fusionados listos para `from_pretrained`.

El tamaño del repositorio (67,5 GB) refleja que se conservan los shards originales en su precisión y bytes originales (FP32 en origen, con exportaciones BF16 como derivados separados). La publicación es explícitamente "checkpoint-only": no incluye estados del optimizador, datos de entrenamiento ni registros de rollout, y no reclama validación de restauración ni de forward pass.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3-4B-Base, con cabeza de crítico de valor (no es un modelo causal de lenguaje en esta publicación) |
| Parametros totales | No disponible (el modelo base es Qwen3-4B-Base; el archivo no detalla el recuento exacto de los checkpoints) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se mencionan precisiones FP32 original y exportaciones BF16 como derivados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se retiene licencia y atribución de Qwen; ver `LICENSE` y `NOTICE`) |
| Formato de pesos | Shards FSDP `.pt` (`model_world_size_4_rank_*.pt`), safetensors exportados como derivados; el repo raíz no es un modelo Transformers único |

## Arquitectura y entrenamiento

Los checkpoints se basan en Qwen3-4B-Base y se entrenaron dentro de un pipeline PPO de la familia VERL. Hay dos ramas: la primera usa una cabeza HL-Gauss con 101 logits sobre bins que cubren el intervalo [-1,2, 1,2], con centros definidos como `-1.2 + (i+0.5)*2.4/101`; el valor se calcula como la media ponderada por softmax en FP32 de esos centros, y los objetivos gaussianos usan sigma `0.75*2.4/101`. La segunda rama emplea una cabeza escalar nativa con pérdida MSE.

El checkpoint HL-Gauss corresponde al paso global 300 y el nativo al paso 210; el entrenamiento nativo se detuvo tras 239 lotes completos, de modo que no existe resultado nativo en el paso 300. Los checkpoints de actor son FSDP y requieren los cuatro shards `model_world_size_4_rank_*.pt` junto con utilidades de carga o fusión compatibles con PyTorch/VERL. Se incluye una implementación matemática de referencia para la parte categórica, aunque sus hooks de entrenamiento dependen del entorno VERL original. No se redistribuye ningún conjunto de datos de entrenamiento.

## Capacidades

- Evaluación de función de valor por token en entrenamiento por refuerzo (crítico), no generación de texto.
- Cabeza categórica HL-Gauss con 101 bins y cálculo de valor por media ponderada softmax en FP32.
- Cabeza escalar nativa con pérdida MSE para comparación de parametrizaciones.
- Conservación de la capacidad de evaluación del modelo (los archivos preservan la capacidad de evaluación, según el autor).
- Compatibilidad con utilidades de carga y fusión FSDP/VERL para reconstruir el modelo.
- Metadatos de configuración y tokenizador en el subdirectorio `huggingface/` (sin pesos fusionados).
- No soporta tool calling, agentes, visión, audio ni modo thinking en esta publicación.

## Casos de uso

- Auditoría de experimentos de RL: reconstruir el crítico HL-Gauss en el paso 300 y el nativo en el paso 210 para verificar curvas de valor y estabilidad del entrenamiento en un pipeline PPO.
- Comparación de parametrizaciones de la función de valor: usar ambos checkpoints para medir el efecto de una cabeza categórica HL-Gauss frente a una escalar MSE sobre las mismas muestras de política, teniendo en cuenta que las ramas no son evaluaciones pareadas intercambiables.
- Reproducción de investigación en VERL: cargar los shards FSDP con las utilidades de fusión del entorno original para reanudar análisis de evaluación, sabiendo que sin estado del optimizador no es posible una continuación exacta.
- Estudio de calibración de críticos: aprovechar la implementación de referencia categórica para analizar la distribución softmax sobre los 101 bins y su relación con los retornos observados.
- Docencia y formación en RL: usar el archivo como material de estudio de cómo se estructura un crítico con cabeza discreta frente a uno escalar en un entrenamiento PPO real.
- Verificación de integridad de publicaciones: emplear `archive_manifest.json` y la cobertura de archivos del servidor para comprobar que los shards publicados coinciden en tamaño y metadatos con los originales.
- Análisis de derivados BF16: comparar exportaciones BF16 con las fuentes FP32 para cuantificar la pérdida de fidelidad en la reconstrucción de valores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al derivar de Qwen3-4B-Base, la inferencia en FP16/BF16 requeriría del orden de 8-10 GB solo para pesos, más overhead de activaciones y del pipeline VERL, pero el repositorio no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del base, cabría esperar GPUs de 24 GB o superiores para evaluación, sin confirmación del autor.
- Cabe en GPU de consumo: no confirmado; el repositorio no ofrece estimaciones.
- Opciones de despliegue: carga mediante utilidades FSDP/VERL y scripts de fusión; no es desplegable directamente con vLLM, llama.cpp, Ollama o TGI al no ser un modelo causal fusionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-critic-categorical-20261009-checkpoints | Base Qwen3-4B (no detallado) | No disponible | Crítico de valor (checkpoints FSDP) | Apache 2.0 | HuggingFace, repo de 67,5 GB |
| Qwen/Qwen3-4B-Base | ~4B | No disponible en esta ficha | Modelo causal de lenguaje | Apache 2.0 | HuggingFace |
| Otros críticos PPO publicados | No disponible | No disponible | Crítico de valor | Variable | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje causal: los críticos usan cabeza de valor por token y no generan texto.
- El repositorio raíz no es cargable con `from_pretrained`; requiere fusión de shards FSDP con utilidades compatibles.
- No se incluyen estados del optimizador; muchos estados Adam originales ya se habían eliminado antes de la publicación, por lo que no es posible una continuación exacta del entrenamiento.
- Los archivos RNG/scheduler/dataloader presentes no bastan para reanudar sin el estado del optimizador y el entorno original.
- No se reclama validación de restauración ni de forward pass por el mero hecho de la publicación.
- Las ramas de continuación y las muestras de política propia no son evaluaciones pareadas intercambiables; no debe interpretarse como superioridad causal.
- Las exportaciones BF16 son derivados y no reemplazan byte a byte a las fuentes FP32.
- Solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza.
- Las rutas locales internas en copias de configuración JSON pueden estar redactadas; cualquier transformación se indica en `archive_manifest.json`.
- El manifiesto describe la cobertura prevista; durante la subida pueden faltar archivos listados.
- Riesgo de sesgos y alucinación: no aplica de forma directa al no ser generativo, pero el modelo base Qwen3-4B conserva los sesgos de sus datos de preentrenamiento.
- Licencia Apache 2.0 con atribución a Qwen; revisar `LICENSE` y `NOTICE` antes de uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/lhl616/qwen3-critic-categorical-20261009-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- VERL (framework de entrenamiento RL referenciado): https://github.com/volcengine/verl
