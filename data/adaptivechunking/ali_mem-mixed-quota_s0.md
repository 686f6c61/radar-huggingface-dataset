# AdaptiveChunking/ali_mem-mixed-quota_s0

## Resumen

`ali_mem-mixed-quota_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un *checkpoint* de un experimento de tokenización dinámica a nivel de byte basado en la arquitectura H-Net, generado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). El identificador del run indica `architecture=ali`, `objective=ratio`, `schedule=None` y `dechunk=ema`, con semilla 0.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). El modelo tiene 22.785.088 parámetros totales (unos 22,8 M) según los pesos en safetensors, y el repositorio ocupa 5,6 GB, un tamaño desproporcionado respecto al número de parámetros porque incluye múltiples ramas `step-N` con estados completos del entrenador (`training_state/checkpoint.pt`) para permitir la reanudación exacta del entrenamiento.

Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo el *chunking* adaptativo a nivel de byte afecta a la segmentación y a las fronteras de palabra, con sondas de evaluación FLORES+ incluidas en el repositorio. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali`, framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante el entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco, finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores ligados almacenados una sola vez, mapeados en `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para el estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante `ali`, operando directamente sobre bytes en lugar de tokens subword. El objetivo de entrenamiento es `ratio` (probablemente una formulación de razón de compresión o chunking), con `schedule=None` y una estrategia de *dechunking* basada en media móvil exponencial (`dechunk=ema`). La tokenización dinámica por chunks es, por tanto, el núcleo del experimento: el modelo aprende a agrupar bytes en unidades de longitud variable en lugar de depender de un vocabulario fijo.

El entrenamiento se ejecutó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes, sobre un corpus multilingüe de inglés, turco y finés. No se especifica en la información disponible el número total de tokens procesados ni la composición exacta del dataset, aunque por el cómputo (6000 × 32 × 1024 bytes) el volumen es del orden de 196 millones de bytes vistos. No hay mención de RLHF, DPO ni ajuste por preferencias. El repositorio conserva checkpoints intermedios en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, …, 2^k y el paso final), lo que facilita el análisis de la evolución del aprendizaje.

## Capacidades

- Modelado de lenguaje a nivel de byte con tokenización dinámica por chunks, orientado a investigación sobre segmentación.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Evaluación de fronteras de palabra mediante sondas FLORES+ incluidas en el directorio `probe/` una vez finalizado el run.
- Reanudación exacta del entrenamiento gracias a los estados completos en `training_state/checkpoint.pt`.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- No hay evidencia de capacidades generativas de calidad conversacional; el tamaño (22,8 M de parámetros) descarta un uso como asistente general.

## Casos de uso

- Investigación en tokenización adaptativa: usar los distintos checkpoints `step-N` para analizar cómo evoluciona la segmentación en chunks a lo largo del entrenamiento y comparar la variante `ali` con otras variantes del framework beetle-hnet.
- Estudio de fronteras de palabra multilingües: emplear las sondas FLORES+ del directorio `probe/` para medir la calidad de las fronteras detectadas en inglés, turco y finés, idiomas con morfología muy distinta.
- Reproducibilidad de experimentos: cargar `training_state/checkpoint.pt` de una revisión concreta con `torch.load(..., weights_only=False)` para reanudar exactamente el entrenamiento desde ese paso.
- Base para *fine-tuning* en tareas de segmentación de bytes: el modelo preentrenado puede servir como inicialización para experimentos de chunking en dominios específicos.
- Comparación de objetivos de entrenamiento: el sufijo `ratio` y la configuración `dechunk=ema` permiten contrastar esta configuración con otras del mismo autor (por ejemplo, variantes con `schedule` distinto) en condiciones controladas.
- Docencia y divulgación: ejemplo didáctico de arquitectura H-Net con pesos pequeños (22,8 M) que cabe en cualquier GPU consumer y permite inspeccionar el pipeline completo de entrenamiento.
- Análisis de eficiencia de tokenización: evaluar si el chunking dinámico reduce la longitud efectiva de secuencia frente a tokenizadores BPE en los tres idiomas entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la existencia de sondas de fronteras FLORES+ en el directorio `probe/`, pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros ≈ 91 MB de pesos), más el *overhead* del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU.
- Cabe holgadamente en GPUs consumer: GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de investigación con arquitectura custom (H-Net de beetle-hnet), no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere cargar los pesos con PyTorch y el código del repositorio beetle-hnet.
- Latencia y throughput: no disponibles.
- Nota: el repositorio completo ocupa 5,6 GB por los múltiples checkpoints y estados del entrenador; para inferencia basta con descargar `model.safetensors` y `config.json` de una rama concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-quota_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (AdaptiveChunking) |
| Byte-level BPE estándar (p. ej. GPT-2 tokenizer) | no aplica (tokenizador) | no aplica | Tokenización subword fija | MIT | Amplia |
| Modelos H-Net de referencia (papers académicos) | variable | variable | Chunking dinámico | variable | Repositorios de investigación |

No se dispone de información sobre otros modelos del mismo autor con los que comparar directamente, más allá de la referencia genérica a otras variantes del framework beetle-hnet. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Modelo de investigación con 22,8 M de parámetros: no es adecuado para generación de texto de calidad ni para uso en producción como LLM.
- Entrenado solo con inglés, turco y finés; no hay garantías de comportamiento en castellano ni en otros idiomas.
- Contexto de 1024 bytes, muy corto para aplicaciones reales.
- No se documentan sesgos concretos, pero al ser un modelo multilingüe de corpus no especificado, pueden aparecer sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje, agravado por su tamaño reducido y su naturaleza experimental.
- La licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de documentación de calidad hace desaconsejable su uso en producción.
- El repositorio incluye estados de entrenador (`checkpoint.pt`) que requieren `torch.load(..., weights_only=False)`; cargar pesos de origen no verificado con esta opción conlleva riesgos de seguridad.
- No hay soporte en runtimes de inferencia estándar; requiere el código de beetle-hnet, lo que añade fricción de integración.
- El tamaño del repositorio (5,6 GB) puede ser un inconveniente para descargas en entornos con ancho de banda limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-quota_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Dataset FLORES+: no disponible enlace directo en la información proporcionada
