# AdaptiveChunking/ali_mem-static_s2

## Resumen

`ali_mem-static_s2` es un modelo de investigación publicado por el usuario AdaptiveChunking dentro del ecosistema `beetle-hnet`, un marco experimental para el estudio de tokenización dinámica a nivel de byte y arquitecturas H-Net. El modelo se ha entrenado con la arquitectura `ali`, el objetivo `ratio`, un esquema de decodificación `ema` (media móvil exponencial) y la semilla 2, sobre 6000 pasos con batches de 32 secuencias de 1024 bytes en tres idiomas: inglés, turco y finés.

Con 22.785.088 parámetros totales, se trata de un modelo pequeño orientado a experimentación sobre segmentación adaptativa de bytes y representaciones jerárquicas, no a producción general. Su relevancia es metodológica: permite reproducir y comparar variantes de tokenización dinámica frente a tokenizadores estáticos, y el repositorio incluye checkpoints intermedios en una programación logarítmica por fases, estado completo del entrenador y sondas de frontera FLORES+.

El modelo no dispone de pipeline declarado, idiomas documentados en los metadatos de Hugging Face ni resultados de benchmarks publicados. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors con tensores atados almacenados una sola vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net variante `ali` (byte-level, dynamic chunking) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia en entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; no se documentan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `tied_weights` en `config.json`), `checkpoint.pt` para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante `ali`, un diseño jerárquico que opera directamente sobre bytes y aplica chunking dinámico, es decir, agrupa secuencias de bytes en unidades de longitud variable en lugar de usar un tokenizador fijo. La decodificación se realiza con `dechunk=ema`, lo que sugiere un mecanismo de reconstrucción de la secuencia basado en media móvil exponencial sobre las fronteras de chunk. El objetivo de entrenamiento es `ratio`, y el esquema de fases es `None`, según la model card.

El entrenamiento consistió en 6000 pasos con batch de 32 y longitud de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se especifica el número total de tokens, la composición del dataset ni si hubo RLHF, DPO o ajuste por instrucciones; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio chunking dinámico. El repositorio conserva checkpoints en `step-N` siguiendo una programación logarítmica en base 2 por fase (0, 1, 2, 4, 6, 8, 16, …, 2^k) más el paso final, junto con el estado reanudable completo del entrenador.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes.
- Segmentación dinámica de bytes en chunks de longitud variable (objeto central del experimento).
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reanudación exacta del entrenamiento gracias a los checkpoints `training_state/checkpoint.pt`.
- Sondas de frontera FLORES+ incluidas en la rama `main` tras finalizar la ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta una interfaz de generación de texto de alto nivel ni pipeline de Hugging Face.

## Casos de uso

- Investigación sobre tokenización dinámica: comparar la variante `ali` con otras arquitecturas del marco `beetle-hnet` usando los mismos datos y semilla, gracias a la estructura de checkpoints por fases.
- Estudio de fronteras de chunk: las sondas FLORES+ en `probe/` permiten analizar dónde el modelo segmenta secuencias multilingües y evaluar la calidad de la segmentación.
- Reproducibilidad de experimentos: el estado completo del entrenador en `training_state/checkpoint.pt` permite reanudar exactamente desde cualquier checkpoint `step-N`.
- Análisis de multilingüismo de bajo recurso: el entrenamiento con turco y finés, idiomas con morfología aglutinante, sirve para estudiar cómo el chunking por bytes maneja palabras largas y sufijos.
- Desarrollo de tokenizadores alternativos: los pesos y la configuración pueden servir como referencia para diseñar esquemas de chunking en pipelines propios.
- Docencia y divulgación: el tamaño reducido (22,8 M de parámetros) permite ejecutar el modelo en CPU o GPUs modestas para demostrar conceptos de representación a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros, ~91 MB de pesos), aunque el repositorio ocupa 9,3 GB por los checkpoints y el estado del entrenador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna con memoria suficiente.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no haber pipeline declarado es probable que requiera carga manual con `transformers` o código propio del repositorio `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdaptiveChunking/ali_mem-static_s2` | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Tokenizadores BPE estándar (p. ej. GPT-2) | no aplica (no es modelo) | no aplica | Segmentación estática subword | MIT / varias | Amplia |
| Modelos byte-level pequeños (p. ej. ByT5-small) | ~300 M | variable | Transformer byte-level sin chunking dinámico | Apache 2.0 | Hugging Face |
| Otras variantes `beetle-hnet` | variable | 1024 bytes | H-Net con distintos objetivos y semillas | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados; no hay evidencia de calidad en tareas downstream.
- Entrenado solo con inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Ventana de contexto de 1024 bytes, insuficiente para la mayoría de aplicaciones de producción.
- Sin pipeline declarado ni documentación de inferencia estándar; requiere código específico del repositorio `beetle-hnet`.
- Riesgo de alucinación y sesgos no evaluados; no se documentan mitigaciones.
- El repositorio de 9,3 GB incluye checkpoints y estados de entrenador, lo que complica su despliegue en entornos con almacenamiento limitado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de garantías y de evaluación hace desaconsejable su uso en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-static_s2
- Repositorio `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
