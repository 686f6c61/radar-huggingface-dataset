# AdaptiveChunking/ali_mem-mixed-nosplit_s2

## Resumen

`ali_mem-mixed-nosplit_s2` es un modelo de investigación de tokenización dinámica a nivel de byte, desarrollado por el colectivo AdaptiveChunking y construido sobre la arquitectura H-Net del proyecto beetle-hnet. No es un modelo de lenguaje conversacional al uso: su propósito es aprender a segmentar texto en unidades (chunks) de forma adaptativa en lugar de depender de un vocabulario BPE predefinido, operando directamente sobre bytes con un mecanismo de decodificación basado en media móvil exponencial (`dechunk=ema`).

El modelo tiene 22.785.088 parámetros totales y se entrenó durante 6000 pasos sobre tres idiomas (inglés, turco y finés) con una configuración de 32 secuencias de 1024 bytes por paso. La variante `ali` corresponde a una arquitectura interna específica dentro del framework beetle-hnet, y el sufijo `nosplit` indica que no se aplica una división explícita de la secuencia durante el procesamiento.

Su relevancia es fundamentalmente experimental: sirve como artefacto reproducible para estudiar tokenización sin vocabulario fijo, evaluación de fronteras de chunk (incluye sondas FLORES+) y comparación de esquemas de entrenamiento. No está pensado para despliegue en producción como asistente o generador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco, finés (en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), checkpoint PyTorch (`checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con `architecture=ali` y `objective=ratio`. Se trata de un modelo que procesa bytes crudos y aprende dinámicamente los límites de chunk mediante un mecanismo de decodificación EMA (`dechunk=ema`), sin un esquema de programación fijo (`schedule=None`). Los pesos atados se almacenan una única vez en `model.safetensors`, y `config.json["tied_weights"]` mapea los nombres eliminados a los tensores conservados.

El entrenamiento consistió en 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre un corpus mixto en inglés, turco y finés. La semilla utilizada fue la 2. El repositorio conserva ramas `step-N` con checkpoints intermedios según una programación logarítmica en base 2 (0, 1, 2, 4, 6, 8, 16, …, 2^k), cada una con pesos, `config.json`, `training_config.yaml` y el estado completo del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, una vez finalizado el entrenamiento, las sondas de frontera FLORES+ en `probe/`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Segmentación adaptativa de texto a nivel de byte sin vocabulario predefinido.
- Aprendizaje de fronteras de chunk mediante decodificación EMA.
- Procesamiento multilingüe limitado a inglés, turco y finés.
- Evaluación de fronteras de chunk mediante sondas FLORES+ (incluidas en `probe/`).
- Reanudación de entrenamiento desde checkpoints completos (`training_state/checkpoint.pt`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización sin vocabulario: el modelo permite estudiar cómo un H-Net aprende límites de chunk sobre bytes crudos, comparando checkpoints intermedios de la programación log2 para analizar la evolución del aprendizaje.
- Evaluación de fronteras de segmentación: las sondas FLORES+ en `probe/` permiten medir la calidad de los límites de chunk en los tres idiomas de entrenamiento y comparar con otros esquemas de tokenización.
- Reproducción de experimentos: la inclusión de `training_state/checkpoint.pt`, `training_config.yaml` y `log.jsonl` permite reanudar o replicar el entrenamiento exacto con semilla 2.
- Estudio de pesos atados: el almacenamiento único de tensores atados con mapeo en `config.json` sirve para analizar técnicas de compresión de checkpoints en modelos pequeños.
- Comparación de arquitecturas H-Net: la variante `ali` con `objective=ratio` y `dechunk=ema` puede contrastarse con otras variantes del framework beetle-hnet sobre el mismo corpus trilingüe.
- Prototipado de pipelines de tokenización byte-level: el modelo puede integrarse como componente experimental en sistemas que requieran segmentación sin vocabulario fijo, siempre en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (≈91 MB de pesos), más el overhead de activaciones y del mecanismo de chunking.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el modelo se carga con PyTorch (`torch.load` sobre `checkpoint.pt` o `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de tokenización dinámica byte-level con arquitectura H-Net y este tamaño.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de lenguaje generativo ni un asistente; no debe usarse para tareas de conversación, código o razonamiento general.
- Idiomas limitados a inglés, turco y finés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Contexto de solo 1024 bytes, insuficiente para la mayoría de aplicaciones prácticas de contexto largo.
- Sin datos de benchmarks publicados, por lo que no se puede evaluar su calidad relativa frente a alternativas.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de segmentaciones incorrectas en textos fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- El repositorio ocupa 8,8 GB debido a los múltiples checkpoints intermedios y estados del entrenador, lo que puede complicar su descarga y almacenamiento.
- No se documentan sesgos específicos, pero el corpus trilingüe limitado puede introducir sesgos de dominio y de idioma.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosplit_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
