# Nicholas0228/longmd-atlas-pt500-20261118

## Resumen

LongMD ATLAS PT500 es un conjunto de checkpoints intermedios de un modelo de dinámica de proteinas entrenado por el usuario Nicholas0228. No es un modelo de lenguaje: es un modelo de aprendizaje profundo orientado a predecir propiedades dinámicas de proteinas (concretamente fluctuaciones estructurales medidas mediante RMSF y una métrica agregada denominada RMWD). El release corresponde a 6.000 actualizaciones de entrenamiento base compartido más 500 actualizaciones de post-entrenamiento para tres configuraciones de pérdida distintas.

El modelo se distribuye como checkpoints nativos de PyTorch (no safetensors ni GGUF), con pesos EMA (decay 0,999) para evaluación y pesos raw para reanudar entrenamiento. El repositorio ocupa 27,17 GB e incluye estado de modelo, optimizador, scheduler y fase. La relevancia es acotada: se trata de un checkpoint intermedio de un proyecto de investigación en curso, publicado para trazabilidad y reproducción, no de un modelo listo para producción.

La model card es explícita al señalar que las métricas presentadas corresponden solo a 39 sistemas de validación ATLAS, no al test final de 82 sistemas, y que no se reclama estado del arte. Los runs completos de post-entrenamiento (2.000 actualizaciones) y los tests finales estaban pendientes en la fecha de publicación (18 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de aprendizaje profundo para dinámica de proteinas; no se especifica la topología en la model card) |
| Parametros totales | No disponible (el repo pesa 27,17 GB, pero incluye modelo, optimizador, scheduler y estado de fase) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); se usa un crop de 640 tokens en entrenamiento |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints nativos PyTorch) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (.pt); EMA y raw por cada configuración |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (no se indica si es transformer, GNN, red convolucional u otra). Se sabe que el entrenamiento parte de embeddings congelados precalculados por el autor, con batch global de cuatro sobre cuatro GPUs, semilla 42, crop de 640 tokens y el filtrado de producción original. El entrenamiento se estructura en dos fases: 6.000 actualizaciones de base compartida y 500 actualizaciones de post-entrenamiento por cada una de tres configuraciones de colisión/pair-loss: (4,4), (4,8) y (8,8).

Un detalle técnico relevante es que el entrenamiento base se reanudó tras 5.500 actualizaciones por un fallo de memoria del host, y las tres ramas parten del mismo checkpoint base completado. El estado guardado incluye modelo, optimizador, scheduler, fase y paso, pero no estado de RNG ni del sampler, por lo que al reanudar se resiembra. Los checkpoints EMA usan decay 0,999 y se recomiendan para evaluación; los raw sirven para recuperación de entrenamiento. El índice guardado 6499 equivale a 6.000 actualizaciones base más 500 de post-entrenamiento.

## Capacidades

- Predicción de dinámica de proteinas: estima fluctuaciones estructurales (RMSF por residuo y agregada).
- Evaluación sobre sistemas de validación ATLAS: métricas RMWD y correlaciones RMSF por target y global.
- Recuperación de entrenamiento: los checkpoints raw permiten reanudar el entrenamiento con estado de optimizador y scheduler.
- Comparación de configuraciones: tres variantes de pérdida (4,4), (4,8) y (8,8) para estudiar su efecto en las métricas.
- No soporta tool calling, function calling, agentes, generación de texto, visión ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en dinámica de proteinas: usar los checkpoints EMA para evaluar la calidad de las predicciones de RMSF sobre los 39 sistemas de validación ATLAS y comparar con la base completada (RMWD base 1,679850).
- Reproducción de experimentos: los checkpoints raw con estado de optimizador, scheduler y fase permiten reanudar exactamente el pipeline descrito en la rama `flame-experiments` del repositorio de código.
- Estudio de funciones de pérdida: comparar las tres configuraciones de colisión/pair-loss sobre el mismo checkpoint base para aislar su efecto en RMWD y correlación RMSF.
- Base para post-entrenamiento extendido: punto de partida para completar las 2.000 actualizaciones de post-entrenamiento prescritas y ejecutar el test final de 82 sistemas.
- Integración en pipelines de evaluación estructural: cargar los pesos EMA con `hf_hub_download` y ejecutar el script de evaluación del repositorio sobre nuevos sistemas de proteinas.
- Auditoría de provenance: verificar hashes SHA-256 y el fichero `PUBLICATION.json` para validar la integridad de los checkpoints en entornos de investigación reproducibles.

## Benchmarks y rendimiento

Métricas de validación interina sobre 39 sistemas ATLAS (no son resultados del test final de 82 sistemas):

| Configuracion | RMWD (menor es mejor) | Correlacion RMSF por target | Correlacion RMSF global |
|---|---:|---:|---:|
| (4,4) | 1,728296 | 0,903422 | 0,907169 |
| (4,8) | 1,739903 | 0,905034 | 0,907079 |
| (8,8) | 1,773340 | 0,903447 | 0,906437 |
| Base completada (referencia) | 1,679850 | No disponible | 0,874399 |

Las tres configuraciones presentan RMWD superior (peor) que la base completada, pero correlación RMSF global superior (mejor). La comparación es de una sola semilla y en el límite de las 500 actualizaciones de post-entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño de los pesos no se desglosa respecto al total del repo (27,17 GB con seis ficheros que incluyen optimizador y scheduler).
- GPU recomendadas: no disponible. El entrenamiento se ejecutó con batch global de cuatro sobre cuatro GPUs.
- Cabe en GPU consumer: no disponible; depende del tamaño real del modelo, que no se especifica.
- Opciones de despliegue: carga nativa con PyTorch e `hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongMD ATLAS PT500 | No disponible | No aplica | RMWD 1,728-1,773 (39 sistemas) | No disponible | Hugging Face, 0 descargas |
| Base completada LongMD (referencia interna) | No disponible | No aplica | RMWD 1,679850 | No disponible | No publicada como release separada |
| Otros modelos de dinámica de proteinas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: las 2.000 actualizaciones de post-entrenamiento prescritas y el test final de 82 sistemas estaban pendientes en la fecha de publicación; las métricas no constituyen una reclamación de estado del arte.
- Comparación de una sola semilla: los resultados interinos no permiten conclusiones estadísticas robustas.
- RMWD peor que la base completada en las tres configuraciones (1,728-1,773 frente a 1,679850), aunque la correlación RMSF global mejora.
- No se guarda estado de RNG ni del sampler: al reanudar el entrenamiento se resiembra, lo que puede afectar a la reproducibilidad exacta.
- El dataset, los embeddings y los entornos instalados no se incluyen en el release; solo se publican los checkpoints.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe contactarse con el autor.
- Sin pipeline declarado, sin descargas ni likes: proyecto de investigación sin validación comunitaria.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni agentes; cualquier uso fuera de dinámica de proteinas requiere adaptación.

## Enlaces

- Hugging Face: https://huggingface.co/Nicholas0228/longmd-atlas-pt500-20261118
- Código fuente del experimento: https://github.com/HC24701806/longmd/tree/flame-experiments
- Ficheros de verificación en el repo: `CHECKPOINTS.json`, `SHA256SUMS`, `PUBLICATION.json`, `validation-metrics.csv`
- Directorio de validación por sistema: `validation/` dentro del repo
