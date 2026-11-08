# AdaptiveChunking/ali_ali-ridge_s1

## Resumen

ali_ali-ridge_s1 es un modelo de investigación publicado en Hugging Face por la organización AdaptiveChunking, orientado al estudio de tokenización dinámica a nivel de byte mediante arquitecturas H-Net. No es un modelo generativo de propósito general, sino un artefacto experimental de entrenamiento que implementa la arquitectura `ali` con el objetivo `ratio`, un schedule desactivado y dechunking por EMA, partiendo del repositorio beetle-hnet. El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre corpus en inglés, turco y finés.

Con 22.785.088 parámetros totales, se sitúa en la escala de un modelo pequeño, pero su relevancia no reside en el rendimiento sino en la exploración de mecanismos de chunking adaptativo para tokenización byte-level. El repositorio ocupa 18,6 GB debido a que conserva múltiples ramas de checkpoints (`step-N`) con estado completo del entrenador resumible, lo que lo convierte en material útil para reproducibilidad e investigación de dinámicas de entrenamiento.

La licencia Apache 2.0 permite uso comercial y modificación, aunque la ausencia de pipeline declarado, de idiomas formalmente listados y de benchmarks publicados limita su aplicabilidad directa en producción. Es, por tanto, un modelo para laboratorio y experimentación, no para despliegue de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), byte-level, con chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento (no se declara contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; no se declara cobertura oficial |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez vía `config.json["tied_weights"]`); estado del entrenador en `checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue la familia H-Net en su variante `ali`, una arquitectura byte-level que opera directamente sobre bytes en lugar de tokens subword, con un mecanismo de chunking dinámico. La configuración declarada incluye `objective=ratio`, `schedule=None` y `dechunk=ema`, lo que sugiere un objetivo de entrenamiento basado en ratios y un proceso de reconstrucción de chunks mediante media móvil exponencial. Los pesos tied se almacenan una única vez en `model.safetensors`, y `config.json` mantiene el mapeo de nombres eliminados a nombres almacenados, una práctica que reduce el tamaño efectivo del checkpoint.

El entrenamiento consistió en 6000 pasos con batch de 32 y secuencias de 1024 bytes, sobre tres idiomas (inglés, turco y finés), una combinación que introduce diversidad morfológica y tipológica relevante para estudiar generalización byte-level. El repositorio conserva checkpoints en una programación log2 consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde cada inicio de fase objetivo, más el paso final), cada uno con pesos, configuración, `training_config.yaml` y estado resumible completo en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución. No se documentan fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Modelado de lenguaje byte-level sobre secuencias de hasta 1024 bytes en entrenamiento.
- Tokenización dinámica mediante chunking adaptativo, objeto central del experimento.
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints intermedios con estado completo del trainer.
- Evaluación de fronteras de chunking mediante sondas FLORES+ (`probe/`).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se declara pipeline de inferencia ni API de generación en la model card.

## Casos de uso

- Investigación en tokenización byte-level: permite reproducir y analizar cómo el chunking dinámico afecta a la segmentación de texto en inglés, turco y finés, comparando checkpoints intermedios de la programación log2.
- Estudio de dinámicas de entrenamiento: los checkpoints `step-N` con estado resumible permiten analizar curvas de pérdida, estabilidad y evolución de representaciones a lo largo de 6000 pasos.
- Reproducción de experimentos: la inclusión de `training_config.yaml` y `checkpoint.pt` en cada rama facilita replicar exactamente la configuración (`architecture=ali`, `objective=ratio`, `dechunk=ema`, seed 1).
- Evaluación de segmentación multilingüe: las sondas FLORES+ en `probe/` sirven para medir calidad de fronteras de chunking en tres idiomas con morfología diversa.
- Baseline para comparativas de arquitecturas H-Net: al ser un run aislado con semilla fija, puede usarse como referencia frente a otras variantes de la misma familia.
- Docencia y experimentación académica: el tamaño reducido (22,7 M de parámetros) y la licencia Apache 2.0 permiten inspección, modificación y uso en entornos formativos sin restricciones comerciales.
- Análisis de eficiencia de almacenamiento de pesos tied: la estructura con tensores compartidos y mapeo en `config.json` es un caso práctico para estudiar técnicas de reducción de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 22,7 M de parámetros, los pesos en fp32 ocuparían aproximadamente 91 MB, pero no se documenta configuración de inferencia ni cuantizaciones.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna podría alojar los pesos, pero no se confirma soporte de ejecución.
- Cabe en GPU consumer: probablemente sí por tamaño de parámetros, aunque no está verificado ni documentado.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI; la librería indicada es PyTorch y el artefacto principal es un checkpoint de entrenamiento.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 18,6 GB debido a la retención de múltiples ramas de checkpoint con estado del trainer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-ridge_s1 | 22.785.088 | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | apache-2.0 | Hugging Face, sin pipeline declarado |
| Alternativas de la familia beetle-hnet | no disponible | no disponible | H-Net byte-level | no disponible | Repositorio GitHub citado |
| Otras variantes de AdaptiveChunking | no disponible | no disponible | Chunking adaptativo | no disponible | Perfil de Hugging Face de la organización |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay métricas de calidad, perplejidad ni evaluaciones downstream que permitan estimar el rendimiento real.
- Sin pipeline declarado: la model card no especifica tarea, lo que complica la integración con frameworks de inferencia estándar.
- Idiomas limitados: el entrenamiento cubre solo inglés, turco y finés; no se declara cobertura para castellano ni otros idiomas.
- Contexto corto: 1024 bytes por secuencia en entrenamiento, insuficiente para tareas de contexto largo.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo experimental sin ajuste por preferencias, no se recomienda su uso generativo directo.
- Sesgos: no se documentan análisis de sesgo; la composición del corpus no se detalla más allá de los tres idiomas.
- Estado del entrenador en el repo: los `checkpoint.pt` requieren `weights_only=False` al cargarse, lo que implica precauciones de seguridad si se usan pesos de origen no verificado.
- Tamaño del repositorio: 18,6 GB por la retención de múltiples ramas, lo que puede ser costoso en almacenamiento y descarga.
- Licencia Apache 2.0: permite uso comercial, pero al no existir garantías de calidad ni documentación de rendimiento, su uso en producción es desaconsejable sin validación previa.
- Fecha de creación futura (2026-11-08): el registro indica una fecha posterior a la actual, lo que puede reflejar metadatos inconsistentes y conviene verificarlo antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-ridge_s1
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
