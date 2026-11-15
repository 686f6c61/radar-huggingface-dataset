# AdaptiveChunking/alitiny

## Resumen

alitiny es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net (hierarchical network) mediante el framework beetle-hnet, con la variante de arquitectura `ali` y objetivo de entrenamiento `ratio`. El modelo entrena sobre secuencias de bytes en lugar de tokens subword, lo que elimina la dependencia de un vocabulario BPE o SentencePiece predefinido.

Su relevancia es fundamentalmente metodológica: explora cómo un modelo puede aprender a segmentar ("chunking") dinámicamente el flujo de bytes durante el propio entrenamiento, ajustando los límites de los chunks mediante un mecanismo de decodificación con media móvil exponencial (`dechunk=ema`). Con solo 71.600 parámetros, está pensado como banco de pruebas a pequeña escala, no como un modelo desplegable en producción.

El entrenamiento es extremadamente reducido: 6 pasos sobre lotes de 4 secuencias de 128 bytes, con datos en inglés, alemán e hindi. El repositorio incluye checkpoints intermedios organizados por ramas `step-N`, estado completo del entrenador para reanudación y sondas de frontera sobre FLORES+. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, objetivo `ratio`, decodificación `dechunk=ema` |
| Parámetros totales | 71.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 bytes por secuencia de entrenamiento (no se especifica contexto de inferencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | entrenado con datos en inglés (`en`), alemán (`de`) e hindi (`hi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez y mapeados vía `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo implementa una H-Net de nivel de byte según la implementación beetle-hnet, con `architecture=ali` y `objective=ratio`. La característica central es el chunking dinámico: en lugar de tokenizar la entrada con un vocabulario fijo, el modelo agrupa bytes en chunks cuyo tamaño y fronteras se aprenden durante el entrenamiento. El mecanismo de decodificación `dechunk=ema` aplica una media móvil exponencial para estabilizar la determinación de límites de chunk en inferencia.

El entrenamiento consistió en 6 pasos con lotes de 4 secuencias de 128 bytes, usando un schedule de checkpoints `None` (sin programación de learning rate específica más allá de la fase definida) y semilla 0. Los datos cubren tres idiomas (inglés, alemán, hindi). No se documenta el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el volumen (6 pasos × 4 × 128 bytes ≈ 3 KB de datos) indica claramente un experimento de prueba de concepto. El repositorio conserva checkpoints en una programación logarítmica en base 2 (`step-0`, `step-1`, `step-2`, `step-4`, `step-6`, `step-8`, `step-16`, ..., `step-1024`), cada uno con pesos, configuración, `training_config.yaml` y estado resumible del entrenador.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 128 bytes.
- Segmentación dinámica de bytes en chunks aprendidos (chunking adaptativo).
- Procesamiento multilingüe limitado a los tres idiomas de entrenamiento (inglés, alemán, hindi).
- Pesos atados (tied weights) para reducir el almacenamiento de parámetros.
- Reanudación de entrenamiento desde cualquier checkpoint `step-N` gracias al estado completo del entrenador.
- Evaluación de fronteras de chunk mediante las sondas FLORES+ incluidas en `probe/`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre tokenización sin vocabulario: sirve como base reproducible para estudiar si el chunking dinámico a nivel de byte supera a la tokenización subword fija en tareas controladas, gracias a sus checkpoints intermedios y sondas de frontera.
- Análisis de fronteras de segmentación multilingüe: las sondas FLORES+ en inglés, alemán e hindi permiten comparar cómo el modelo aprende a delimitar chunks en lenguas con estructuras morfológicas distintas.
- Reproducción de experimentos de H-Net: el estado resumible del entrenador y la configuración YAML permiten reanudar o replicar el entrenamiento exacto con semilla 0 en un entorno de investigación.
- Prueba de concepto de decodificación con media móvil exponencial: útil para validar el mecanismo `dechunk=ema` antes de escalarlo a modelos mayores.
- Docencia y divulgación: su tamaño (71.600 parámetros) y su repositorio estructurado lo hacen adecuado para explicar pipelines de entrenamiento y chunking adaptativo en cursos o talleres.
- Validación de infraestructura de entrenamiento: sirve como smoke test de beetle-hnet y de los flujos de guardado/carga de safetensors con pesos atados antes de lanzar experimentos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona sondas de frontera sobre FLORES+ (`probe/`), pero no se proporcionan métricas numéricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión completa (71.600 parámetros × 4 bytes ≈ 286 KB), más overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050, RTX 2060 o superiores; también funciona en CPU sin problema.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga vía `torch.load` o `safetensors`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de chat estándar.
- Latencia y throughput: no disponibles; el tamaño reducido sugiere latencias de microsegundos en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de chunking dinámico a nivel de byte con este tamaño y configuración; las H-Net de referencia (como las descritas en la literatura original) son de mayor escala y no se detallan aquí sus especificaciones.

## Limitaciones y advertencias

- Modelo de investigación con 71.600 parámetros y solo 6 pasos de entrenamiento: no produce texto coherente ni es apto para uso en producción.
- Contexto de entrenamiento de 128 bytes, insuficiente para cualquier tarea práctica de generación.
- Idiomas limitados a inglés, alemán e hindi; no se garantiza comportamiento en castellano ni en otras lenguas.
- Riesgo elevado de alucinación y salidas degeneradas por el escaso entrenamiento.
- No se documentan sesgos específicos, pero la composición reducida del dataset impide cualquier evaluación de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad práctica más allá de la investigación.
- No hay soporte de tool calling, agentes ni integración con frameworks de despliegue estándar.
- La carga de `checkpoint.pt` requiere `weights_only=False`, lo que implica riesgos de seguridad si se cargan checkpoints de origen no confiable.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/alitiny
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
