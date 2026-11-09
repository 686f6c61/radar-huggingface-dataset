# AdaptiveChunking/ali_mem-mixed_s1

## Resumen

`ali_mem-mixed_s1` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de un H-Net (Hierarchical Network) a nivel de byte entrenado con el framework `beetle-hnet`, un proyecto de código abierto orientado al estudio de tokenización dinámica y chunking adaptativo. El modelo no es un LLM conversacional al uso, sino un artefacto experimental para investigar cómo las arquitecturas jerárquicas segmentan secuencias de bytes sin tokenizador previo.

Con 22.785.088 parámetros totales (aproximadamente 22,8 millones), es un modelo de escala muy reducida, comparable a modelos de investigación pequeños más que a LLMs de producción. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas (inglés, turco y finés), lo que sugiere un interés en evaluar el comportamiento del chunking dinámico en lenguas con morfología y estructuras ortográficas distintas.

Su relevancia es fundamentalmente metodológica: explora la viabilidad de prescindir de tokenizadores BPE/WordPiece mediante mecanismos de segmentación aprendida a nivel de byte, un área activa de investigación (Byte Latent Transformer, H-Net, etc.). No está pensado para despliegue en producción ni para tareas de usuario final, sino como material reproducible para estudiar dinámicas de chunking, objetivos de ratio y schedules de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, byte-level con chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento; contexto máximo en inferencia no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez, mapeados vía `config.json["tied_weights"]`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en `beetle-hnet`, con `architecture=ali` y un objetivo de entrenamiento basado en `ratio` (`objective=ratio`), sin schedule explícito (`schedule=None`) y con dechunking basado en EMA (`dechunk=ema`). Opera a nivel de byte, es decir, sin tokenizador léxico: el modelo aprende a agrupar bytes en chunks de forma dinámica durante el propio entrenamiento. Los pesos están atados (tied weights), y el repositorio almacena cada tensor compartido una sola vez, con un mapa en `config.json` para reconstruir los nombres eliminados.

El entrenamiento se realizó con semilla 1, durante 6000 pasos, con batches de 32 secuencias de 1024 bytes cada una, sobre un corpus mixto en inglés, turco y finés. No se especifica el número total de tokens vistos ni la composición exacta del dataset. No hay evidencia de fases de RLHF, DPO o ajuste por preferencias; el objetivo declarado es puramente de modelado (ratio de compresión/chunking). El repositorio incluye checkpoints intermedios en ramas `step-N` siguiendo un schedule logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), además del estado completo del entrenador en `training_state/checkpoint.pt`, lo que permite reproducir o reanudar el entrenamiento. La rama `main` contiene los pesos finales, `log.jsonl`, `final.json` y sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte (predicción de siguiente byte), sin tokenizador externo.
- Segmentación dinámica de secuencias (chunking adaptativo) como capacidad central del modelo.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Reproducibilidad completa: checkpoints intermedios, estado del entrenador y logs disponibles.
- Evaluación de fronteras de chunk mediante sondas FLORES+ (`probe/`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documenta una interfaz de chat ni instrucciones de prompt; es un modelo base de investigación.

## Casos de uso

- Investigación en tokenización sin tokenizador: sirve para estudiar cómo una H-Net aprende a segmentar bytes y comparar sus fronteras de chunk con tokenizadores BPE/Unigram en inglés, turco y finés.
- Reproducción de experimentos de chunking dinámico: los checkpoints intermedios y el estado del entrenador permiten reanudar o bifurcar el entrenamiento para probar variantes de `objective`, `schedule` o `dechunk`.
- Análisis de morfología en lenguas aglutinantes: el corpus incluye turco y finés, lo que permite examinar si el chunking aprendido se alinea con morfemas en lenguas con alta productividad morfológica.
- Evaluación de sondas de frontera: la carpeta `probe/` con FLORES+ permite medir la calidad de las segmentaciones en datos multilingües paralelos.
- Baseline para arquitecturas byte-level: al ser un modelo pequeño (22,8 M de parámetros), es adecuado como referencia de bajo coste computacional para comparar con Byte Latent Transformer u otras propuestas.
- Estudio de tied weights y compresión de checkpoints: el esquema de pesos atados con mapa en `config.json` es un caso práctico para investigar técnicas de almacenamiento eficiente de modelos.
- Docencia y experimentación en entornos con recursos limitados: cabe en una sola GPU consumer para fine-tuning o inferencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (los pesos ocupan aproximadamente 91 MB en fp32 y 46 MB en fp16); el tamaño del repo (6,1 GB) se debe a los múltiples checkpoints y al estado del entrenador, no a los pesos de un único modelo.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente para investigación; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPUs.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer de los últimos años, e incluso en CPU para inferencia de investigación.
- Opciones de despliegue: al ser un modelo de investigación con código específico de `beetle-hnet`, no hay integración documentada con vLLM, llama.cpp, Ollama o TGI; el despliegue requiere cargar `model.safetensors` con PyTorch y el código del repositorio `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo de investigación) |
| Byte Latent Transformer (Meta) | no disponible en esta fuente | no disponible | Byte-level con patching dinámico | no disponible | paper y código público |
| Modelos BPE pequeños (p. ej. GPT-2 small) | 124 M | 1024 tokens | Transformer con tokenizador BPE | MIT (GPT-2) | Hugging Face |

La comparación directa con LLMs de producción no es significativa por la diferencia de escala y propósito. Frente a GPT-2 small, `ali_mem-mixed_s1` es unas cinco veces más pequeño y opera a nivel de byte, lo que implica secuencias efectivas más largas en términos de caracteres para la misma ventana. Frente a Byte Latent Transformer, la información disponible no permite contrastar cifras de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación con 22,8 M de parámetros: su calidad de generación de texto es muy limitada y no es apto para tareas de usuario final.
- Entrenado solo con 6000 pasos y tres idiomas (en, tr, fi); no hay evidencia de generalización a otros idiomas ni a dominios diversos.
- No se documentan evaluaciones de sesgo, toxicidad o alucinación; al ser un modelo base sin alineamiento, estos riesgos no están mitigados.
- La longitud de contexto en inferencia no está especificada más allá de los 1024 bytes de entrenamiento; extrapolar más allá de esa ventana no está garantizado.
- El repositorio es grande (6,1 GB) por los checkpoints y el estado del entrenador, lo que complica su descarga y almacenamiento en entornos limitados.
- La licencia Apache 2.0 permite uso comercial del código y los pesos, pero la ausencia de garantías y de documentación de calidad hace desaconsejable cualquier uso en producción.
- El despliegue requiere el código de `beetle-hnet`; no hay formatos estándar de inferencia (GGUF, ONNX) publicados.
- Los pesos atados requieren aplicar el mapa de `config.json["tied_weights"]` al cargar; ignorarlo puede provocar errores de carga.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed_s1
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
