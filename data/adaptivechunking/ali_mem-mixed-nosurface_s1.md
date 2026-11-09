# AdaptiveChunking/ali_mem-mixed-nosurface_s1

## Resumen

`ali_mem-mixed-nosurface_s1` es un modelo de investigación de 22.785.088 parámetros (aproximadamente 22,8 M) desarrollado por el usuario AdaptiveChunking, orientado al estudio de tokenización dinámica a nivel de byte (byte-level) mediante una arquitectura denominada H-Net. Se trata de un experimento de segmentación adaptativa de secuencias ("dynamic chunking") ejecutado sobre el framework `beetle-hnet`, con la variante de arquitectura `ali` y el objetivo de entrenamiento `ratio`. No es un modelo de lenguaje conversacional al uso, sino una pieza de investigación sobre cómo agrupar bytes en unidades de cómputo de forma dinámica.

El modelo se entrenó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre un corpus multilingüe compuesto por inglés, turco y finés (`langs ['en', 'tr', 'fi']`). El uso de estos tres idiomas, con morfologías muy distintas y longitudes medias de token muy diferentes, sugiere que el experimento busca medir cómo el chunking dinámico se adapta a lenguas con distinta densidad de información por byte. El checkpoint publicado corresponde al step 1 de la semilla 1.

La relevancia actual es acotada pero específica: los mecanismos de tokenización dinámica y los modelos byte-level son una línea de investigación activa para eliminar el vocabulario fijo y reducir el sesgo multilingüe de los tokenizadores BPE. Este checkpoint es material reproducible de ese tipo de experimentos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), byte-level con dynamic chunking |
| Parametros totales | 22.785.088 (≈22,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia en entrenamiento; contexto máximo de inferencia no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés, turco, finés (idiomas del entrenamiento); cobertura real no evaluada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con tensores atados almacenados una sola vez y mapeados vía `config.json["tied_weights"]`; estado del entrenador en `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net, una familia de modelos que procesa la entrada a nivel de byte y aprende a agruparla en chunks de longitud variable antes de aplicar capas de mayor nivel. La variante `ali` y el objetivo `ratio` definen la política de chunking y la función de pérdida empleada; el esquema de programación (`schedule`) es `None`, y el dechunking usa media móvil exponencial (`dechunk=ema`). El repositorio sigue el layout "Beetle", con ramas `step-N` en una programación logarítmica consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), cada una con pesos, `config.json`, `training_config.yaml` y estado reanudable del entrenador.

El entrenamiento consistió en 6000 pasos con lotes de 32 secuencias de 1024 bytes, lo que equivale a unos 196,6 millones de bytes procesados (6000 × 32 × 1024). El corpus mezcla inglés, turco y finés. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; por el tipo de objetivo (`ratio`) y el tamaño del modelo, es plausible que se trate de entrenamiento autosupervisado, pero este dato no está confirmado. El repo incluye sondas de frontera FLORES+ (`probe/`) que se generan al finalizar la ejecución, lo que apunta a una evaluación específica de la calidad de las fronteras de chunking sobre textos multilingües.

## Capacidades

- Modelado de secuencias a nivel de byte con segmentación dinámica en chunks de longitud variable.
- Procesamiento multilingüe limitado a los idiomas de entrenamiento (inglés, turco, finés).
- Evaluación de fronteras de chunking mediante sondas FLORES+ (incluidas en el repo al completar la ejecución).
- Reproducibilidad completa del entrenamiento: checkpoints intermedios con estado del optimizador y configuración.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta una interfaz de generación de texto de alto nivel; el uso previsto es la carga de pesos y la inspección del comportamiento de chunking.

## Casos de uso

- Investigación en tokenización sin vocabulario: usar el modelo para estudiar cómo una política de chunking aprendida agrupa bytes en inglés, turco y finés, comparando la longitud media de chunk entre lenguas con morfologías aglutinantes y no aglutinantes.
- Reproducción de experimentos de H-Net: cargar las ramas `step-N` y el `training_state/checkpoint.pt` para reanudar o bifurcar el entrenamiento con distintas semillas y comparar la estabilidad del objetivo `ratio`.
- Evaluación de fronteras lingüísticas: ejecutar las sondas FLORES+ del directorio `probe/` sobre textos paralelos para medir si las fronteras de chunk coinciden con límites morfológicos o de palabra.
- Baseline para modelos byte-level: emplear sus 22,8 M de parámetros como referencia de bajo coste frente a arquitecturas byte-level de mayor tamaño en tareas de modelado de lenguaje a nivel de byte.
- Estudio de eficiencia de secuencias: analizar si el chunking dinámico reduce el número de pasos de cómputo efectivos en secuencias de 1024 bytes y con qué coste en calidad de modelado.
- Docencia y divulgación: por su tamaño reducido y su licencia Apache 2.0, sirve como ejemplo didáctico de pipeline completo de entrenamiento con checkpoints intermedios y estado reanudable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la existencia de sondas de frontera FLORES+ (`probe/`) que se generan al finalizar la ejecución, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (≈91 MB de pesos); el repositorio ocupa 7,7 GB por los múltiples checkpoints y el estado del entrenador, no por el modelo en sí.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o incluso CPU son suficientes para inferencia.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4090, etc.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` / `safetensors`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nosurface_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (AdaptiveChunking) |
| Modelos byte-level tipo ByT5 | 300 M – 13 B | hasta 1024 bytes | Transformer byte-level sin tokenizador | Apache 2.0 | Hugging Face (google) |
| Modelos BPE pequeños (p. ej. GPT-2 small) | 124 M | 1024 tokens | Transformer con tokenizador BPE | MIT | Hugging Face |

La comparación es orientativa: no se dispone de benchmarks de este checkpoint que permitan una comparación cuantitativa con ByT5 ni con modelos BPE de tamaño similar. La diferencia principal es que este modelo aprende la segmentación en lugar de fijarla a priori.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Entrenado solo con inglés, turco y finés; el comportamiento en otros idiomas, incluido el español, no está evaluado.
- Contexto de entrenamiento de 1024 bytes; no se documenta la longitud máxima soportada en inferencia.
- Riesgo de alucinación y de generación incoherente si se usa como modelo de lenguaje: no está diseñado ni ajustado para generación conversacional.
- No se documentan sesgos específicos, pero la mezcla de tres idiomas y un corpus no descrito impide descartar sesgos de dominio.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad hace desaconsejable su uso en producción sin validación propia.
- El repositorio de 7,7 GB incluye múltiples checkpoints y estados del entrenador; conviene descargar solo la rama necesaria para evitar consumo de disco innecesario.
- Los tensores atados se almacenan una sola vez; es imprescindible respetar `config.json["tied_weights"]` al cargar los pesos para reconstruir el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosurface_s1
- Repositorio del framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
