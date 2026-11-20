# jjalora/diet-traj-pythia-410m-hf-default-seed12

## Resumen

`jjalora/diet-traj-pythia-410m-hf-default-seed12` es un punto de una campaña de investigación sobre trayectorias de entrenamiento en el espacio de pesos, no un modelo listo para producción. Se trata de una ejecución de preentrenamiento desde cero de la arquitectura Pythia-410M de EleutherAI, realizada con la receta abierta de Pythia (mismo flujo de tokens, mismo orden de batches, mismo optimizador AdamW y mismo esquema de decodificación de learning rate). El autor publica los checkpoints intermedios y finales para permitir estudiar cómo evoluciona un modelo a lo largo del entrenamiento.

La relevancia es metodológica: el repositorio expone checkpoints en ramas `stepN` (de 0 a 512 pasos y cada 100 pasos) junto con un `losses.csv` con pérdida de entrenamiento y de validación recalculada de forma homogénea, de modo que distintas trayectorias de la campaña sean comparables entre sí. Esto lo convierte en material útil para investigación sobre dinámica de entrenamiento, inicialización de pesos y reproducibilidad, más que para despliegue de aplicaciones.

El modelo es un transformer decoder-only de tipo GPT-NeoX con 405.334.016 parámetros, contexto de 2048 tokens, entrenado exclusivamente en inglés sobre `EleutherAI/pile-standard-pythia-preshuffled` y publicado bajo licencia Apache 2.0. El tamaño del repositorio (más de 1 TB) refleja que contiene múltiples checkpoints en float16, no un único conjunto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (`gpt_neox`) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (world batch 1024 × 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only estilo GPT-NeoX, con la configuración definida en `EleutherAI/pythia` `models/410M/pythia-410m.yml`. El entrenamiento sigue la receta abierta de Pythia: mismo flujo de tokens y mismo orden (`EleutherAI/pile-standard-pythia-preshuffled`, donde el batch *i* corresponde a las filas [i·1024, (i+1)·1024)), AdamW con learning rate 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, gradient clipping 1.0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y world batch de 1024 × 2048 tokens independientemente del número de GPUs.

La única diferencia entre las ejecuciones de la campaña es la semilla aleatoria y el esquema de inicialización de pesos. En esta ejecución, `init_scheme = None`, lo que corresponde al esquema `pythia` de GPT-NeoX (`small_init` + `wang_init`). El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. Los checkpoints se publican en ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos, solo pesos, en safetensors float16; `main` contiene los pesos finales una vez completada la ejecución.

## Capacidades

- Generación de texto autoregresiva en inglés, con el nivel de calidad correspondiente a un Pythia-410M completamente entrenado.
- Modelo base sin ajuste instructivo ni RLHF: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés, según el campo `language` de la model card.
- Valor principal como objeto de estudio: checkpoints intermedios para analizar trayectorias de entrenamiento, pérdida por paso y evolución en el espacio de pesos.
- Compatible con `transformers` y con `text-generation-inference` según los tags del repositorio.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: cargar checkpoints de distintas ramas `stepN` y comparar la evolución de pesos, activaciones y pérdida a lo largo de la trayectoria, usando `losses.csv` como referencia homogénea.
- Estudios de reproducibilidad: replicar la receta Pythia con distintas semillas y esquemas de inicialización y medir la divergencia entre trayectorias con el mismo flujo de tokens.
- Análisis de inicialización de pesos: comparar la distribución por tensor frente a `EleutherAI/pythia-410m` en `step0` y evaluar el impacto del esquema de inicialización en las primeras fases del entrenamiento.
- Experimentos de destilación o *model soups*: al disponer de checkpoints intermedios y finales con la misma arquitectura, se pueden promediar pesos o estudiar la interpolación entre puntos de la trayectoria.
- Pruebas de infraestructura de entrenamiento: validar pipelines de preentrenamiento a escala 410M con fp16 y pesos maestros fp32, comprobando que la pérdida de entrenamiento coincide con la registrada.
- Generación de texto base en inglés para experimentos controlados: usar el checkpoint final como línea base de un modelo de 405M parámetros sin ajuste instructivo, por ejemplo en evaluación de perplejidad sobre The Pile.
- Docencia y divulgación: estudiar un modelo pequeño con receta completamente documentada y checkpoints públicos para explicar el preentrenamiento de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de entrenamiento (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen`, `lr`) en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 0,8-1 GB solo para pesos (405M parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto completo de 2048 tokens el consumo práctico se sitúa aproximadamente entre 1,5 y 3 GB según implementación y batch.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB. No se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o evaluación a gran escala, A100 o H100.
- Cabe holgadamente en GPU consumer; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (según tags) y, previsiblemente, `vLLM` y `llama.cpp`/`Ollama` si se convierten los pesos a los formatos correspondientes; estas dos últimas no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-hf-default-seed12` | 405.334.016 | 2048 | Apache 2.0 | Checkpoint de campaña de investigación con trayectoria completa |
| `EleutherAI/pythia-410m` | ~410M | 2048 | Apache 2.0 | Modelo de referencia con la misma receta; checkpoints oficiales de EleutherAI |
| `EleutherAI/pythia-160m` | ~160M | 2048 | Apache 2.0 | Variante más pequeña de la misma familia, útil para comparar escalado |
| `EleutherAI/pythia-1b` | ~1B | 2048 | Apache 2.0 | Variante mayor de la misma familia y receta |

Los datos de rendimiento comparado (perplejidad, benchmarks) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no debe usarse directamente como asistente conversacional ni para seguir instrucciones.
- Entrenado solo en inglés; el rendimiento en castellano u otros idiomas será deficiente.
- Riesgo de alucinación y de generar contenido sesgado o tóxico heredado de The Pile, sin filtrado posterior documentado.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- El repositorio supera 1 TB por acumulación de checkpoints; la descarga completa es costosa y conviene descargar solo la rama necesaria.
- No hay garantía de reproducción bit a bit de la inicialización de EleutherAI entre frameworks; la equivalencia es a nivel de distribución por tensor.
- El autor advierte de una salvedad sobre las filas de evaluación del checkpoint final, documentada en `LOSSES.md`; conviene consultarla antes de usar `losses.csv` en análisis.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación no se han evaluado riesgos de producción ni se ofrece soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-hf-default-seed12
- Repositorio de Pythia (receta y configuración `models/410M/pythia-410m.yml`): https://github.com/EleutherAI/pythia
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Código de la campaña (referenciado en la model card, `src/init_schemes.py`): no disponible como enlace directo en la información proporcionada
- `LOSSES.md` y `losses.csv`: disponibles en el propio repositorio de Hugging Face
