# AdaptiveChunking/ali_mem-random_s2

## Resumen

ali_mem-random_s2 es un modelo de investigación publicado por el usuario AdaptiveChunking, centrado en el estudio de tokenización dinámica a nivel de byte mediante arquitecturas H-Net. No es un modelo de lenguaje conversacional al uso: se trata de un artefacto de experimentación (checkpoint de entrenamiento) generado con el framework beetle-hnet, con arquitectura `ali`, objetivo `ratio` y decodificación de chunking basada en EMA. El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre textos en inglés, turco y finés.

El interés del modelo es fundamentalmente metodológico. Explora cómo una red puede aprender a segmentar dinámicamente flujos de bytes en chunks de longitud variable, una línea de investigación relevante para reducir la dependencia de tokenizadores estáticos (BPE, SentencePiece) y mejorar la robustez multilingüe y ante ruido textual. Su tamaño es muy reducido (22.785.088 parámetros), lo que lo hace adecuado para experimentación en hardware modesto, pero no para tareas de generación de texto de propósito general.

La model card es escueta y no documenta capacidades de inferencia, benchmarks ni instrucciones de uso más allá de la carga de checkpoints. El repositorio incluye múltiples ramas `step-N` con estados de entrenamiento reanudables, lo que refleja su naturaleza de artefacto de investigación más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento (no se documenta contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), checkpoint.pt de PyTorch |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura H-Net con variante `ali`, orientada a chunking dinámico sobre representaciones a nivel de byte. El objetivo de entrenamiento es `ratio`, con un esquema de decodificación `dechunk=ema` (media móvil exponencial) y `schedule=None`. La configuración emplea pesos atados: `model.safetensors` almacena cada tensor compartido una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta el número total de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (poco probable dado el objetivo de tokenización). El repositorio organiza los checkpoints en ramas `step-N` siguiendo un esquema logarítmico consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), e incluye estado reanudable del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, al finalizar, sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado y segmentación de flujos de bytes con chunking dinámico aprendido.
- Entrenamiento y evaluación de tokenizadores neuronales alternativos a BPE/SentencePiece.
- Procesamiento multilingüe limitado a inglés, turco y finés según el corpus de entrenamiento.
- Reanudación de entrenamiento desde checkpoints intermedios (`training_state/checkpoint.pt`).
- Evaluación de fronteras de chunking mediante sondas FLORES+ (`probe/`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización neuronal: usar el modelo como referencia para comparar estrategias de chunking dinámico frente a tokenizadores estáticos en corpus multilingües (en/tr/fi).
- Experimentos de robustez ante ruido textual: al operar a nivel de byte, permite estudiar el comportamiento del modelo con texto mal formado, erratas o alfabetos no latinos sin depender de un vocabulario fijo.
- Reproducción de experimentos: las ramas `step-N` y el estado reanudable permiten replicar curvas de entrenamiento y análisis de convergencia del objetivo `ratio`.
- Evaluación de fronteras de segmentación: las sondas FLORES+ en `probe/` sirven para medir la calidad del chunking sobre textos paralelos multilingües.
- Estudio de eficiencia en modelos pequeños: con 22,8 M de parámetros, es viable ejecutar barridos de hiperparámetros en una sola GPU consumer.
- Base para extensiones de arquitectura: el código de beetle-hnet y la configuración `ali` permiten modificar el objetivo, el schedule o el mecanismo de dechunking y reentrenar desde cero.
- Docencia y formación: ejemplo práctico de pipeline completo de entrenamiento con checkpoints versionados y pesos atados en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (el tamaño del repo, 8,2 GB, se debe a los múltiples checkpoints y estados de entrenamiento, no al modelo en sí).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer, incluidas tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: PyTorch nativo con `safetensors` y `huggingface_hub`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-random_s2 | 22,8 M | 1024 bytes (entrenamiento) | H-Net con chunking dinámico | Apache-2.0 | Hugging Face |
| Modelos BPE/SentencePiece (p. ej. tokenizadores de Llama, Mistral) | no aplica (tokenizadores) | no aplica | Segmentación estática por vocabulario | Varía | Amplia |
| Modelos byte-level tipo ByT5 | ~300 M a 13 B | Variable | Transformer a nivel de byte | Apache-2.0 | Hugging Face |
| Otros checkpoints de beetle-hnet | no disponible | no disponible | H-Net con distintos objetivos | Apache-2.0 | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin documentación de inferencia: no se especifica cómo generar texto ni qué API expone.
- Corpus de entrenamiento muy limitado (en, tr, fi) y de solo 6000 pasos; no apto para uso multilingüe general.
- Riesgo de alucinación no evaluado; no hay benchmarks que permitan estimarlo.
- Sin garantías de calidad para producción: ausencia de evaluaciones, de guías de uso y de métricas publicadas.
- El tamaño del repositorio (8,2 GB) incluye estados de entrenamiento y múltiples checkpoints, lo que puede confundir sobre el tamaño real del modelo.
- Licencia Apache-2.0 permite uso comercial, pero la falta de documentación y de validación desaconseja su uso en entornos productivos.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-random_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
