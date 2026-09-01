# AbstractPhil/mini-beatrix-2s

## Resumen

mini-beatrix-2s es un modelo de lenguaje experimental de 237 millones de parámetros desarrollado por AbstractPhil, que opera directamente sobre bytes UTF-8 en lugar de tokens subpalabra. Forma parte de la línea alephllm, que explora arquitecturas de atención lineal basadas en "codebooks" o pizarras de anclas aprendidas, en contraposición a la atención softmax sobre posiciones. El modelo está entrenado con 16.101 mil millones de bytes (tokens byte-level) y completó su entrenamiento el 31 de agosto de 2026.

Su relevancia radica en ser el primer modelo de la familia en implementar un "CausalSplatHUB" completo en los 20 bloques, con una cabeza aleph funcional, y en demostrar que es posible entrenar un modelo de lenguaje con una arquitectura de atención lineal de estado constante (sin caché de prefijo) manteniendo una métrica de compresión competitiva (1.1097 bpb en el holdout de fineweb-edu). Está disponible bajo licencia MIT y su código se distribuye en el repositorio alephllm.

El modelo está diseñado para investigación en arquitecturas de atención alternativa, modelos byte-level y sistemas de entrenamiento con currículo. No está pensado para producción directa, pero ofrece una base interesante para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (splat-attention) sobre codebooks, byte-level (vocab 256) |
| Parametros totales | 237.908.285 |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | 4096 |
| Tipos de cuantizacion | No disponible (solo bf16 en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer de 20 capas con d_model 1024 y embedding de trigramas a nivel de byte. En lugar de atención softmax sobre posiciones, cada bloque contiene un CausalSplatHUB: 4 constelaciones de 64 anclas con dimensión 128, donde la secuencia se codifica en una pizarra de direcciones de tamaño fijo. La composición se realiza por presupuesto (suma de numeradores y masas de acuerdo antes de una división), sin operaciones comparativas como argmax o top-k. Cada bloque incluye además 3 bancos de expertos de ancho completo con despacho con signo, y una doble cabeza de lectura: una lineal y una "aleph" con 256 anclas.

El entrenamiento se realizó en una única GPU RTX 6000 Pro Blackwell durante aproximadamente 78 horas, con un total de 61.422 pasos. El currículo por etapas incluyó un calentamiento con wikitext (0.3B), seguido de fineweb-edu (5B), un currículo de nueve etapas para habilidades como narrativa, razonamiento, aritmética y causalidad (8.8B), y dos fases de anneal de 1B cada una (la segunda con el formato de chat). Se usó el optimizador Muon combinado con Adam, en bf16, sin picos de pérdida. La validación final alcanzó 1.1097 bits por byte en el holdout de fineweb-edu.

## Capacidades

- Generación de texto en inglés a nivel de byte, con manejo directo de UTF-8.
- Razonamiento básico y aritmética, entrenado mediante el currículo de etapas.
- Formato de chat estructurado con tokens especiales reservados (SYS, USER, MODEL, END) que no pueden aparecer en texto UTF-8 válido.
- Soporte de secuencias de hasta 4096 bytes de contexto.
- Capacidad de "thinking mode" incipiente mediante el token THINK reservado (no documentado en detalle).
- No se ha verificado soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el modelo sirve como banco de pruebas para estudiar el comportamiento de splat-attention y codebooks en generación de lenguaje, comparándolo con transformers clásicos.
- Experimentación con modelos byte-level: al operar sobre bytes, permite explorar ventajas y limitaciones frente a modelos tokenizados, especialmente en robustez ante errores ortográficos o lenguajes sin tokenización previa.
- Prototipos de generación de texto en inglés: para aplicaciones donde se requiera un modelo pequeño, rápido y con licencia permisiva, por ejemplo en entornos educativos o de demostración.
- Estudio de entrenamiento con currículo: el repositorio de entrenamiento incluye informes de cada etapa, útil para investigar metodologías de curriculum learning.
- Generación de código en entornos de investigación: aunque no está específicamente entrenado para código, su capacidad de manejo de bytes permite experimentar con formatos de código fuente sin preprocesamiento.
- Evaluación de métricas de compresión (bpb): como modelo byte-level, es adecuado para medir la calidad de modelos de lenguaje mediante bits por byte, una métrica alternativa a la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la validación final en el holdout de fineweb-edu: 1.1097 bits por byte (bpb), alcanzada durante la fase de chat. Esta métrica es comparable con la de otros modelos byte-level, pero no se dispone de datos para comparación directa con modelos similares.

## Requisitos de hardware

- Inferencia en CPU: viable para generación corta (menos de 100 tokens) con memoria RAM de 1-2 GB.
- Inferencia en GPU: con 237M parámetros en bf16 (~475 MB de pesos), cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 3060, etc.
- Para contexto de 4096 bytes, la memoria de activaciones es moderada (~100-200 MB adicionales).
- El entrenamiento se realizó en una RTX 6000 Pro Blackwell, pero no se requieren requisitos especiales para inferencia.
- Opciones de despliegue: al ser un modelo con `trust_remote_code`, se puede cargar con transformers estándar; no se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Se recomienda usar `torch.compile` o `bettertransformer` para optimizar la inferencia en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. El modelo se posiciona como un experimento en arquitecturas de atención lineal y byte-level, sin competidores directos publicados con las mismas características. Se podría mencionar como referencia conceptual a ByT5 o MegaByte, pero no se tienen datos de rendimiento comparables.

## Limitaciones y advertencias

- Modelo experimental: la arquitectura es novedosa y no ha sido validada en aplicaciones de producción.
- Entrenado solo en inglés; el rendimiento en otros idiomas no está garantizado.
- La capacidad de chat es joven (solo 1B tokens con el formato de chat) y puede mostrar comportamientos inconsistentes.
- No se han publicado benchmarks estándar, lo que dificulta evaluar su calidad relativa.
- Riesgo de alucinaciones y sesgos derivados de los datos de fineweb-edu.
- El formato de chat requiere el uso de tokens especiales que deben ser generados exactamente; errores en el prompt pueden degradar la salida.
- No se garantiza compatibilidad con versiones futuras de transformers o de alephllm, al depender de código personalizado.
- La licencia MIT permite uso comercial, pero el autor no ofrece soporte ni garantías.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AbstractPhil/mini-beatrix-2s
- Repositorio de entrenamiento (informes y checkpoints): https://huggingface.co/AbstractPhil/alephllm-mini-beatrix-training
- Blog con detalles del entrenamiento de mini-beatrix-1: https://huggingface.co/blog/AbstractPhil/beatrix-ft1
- Código de la arquitectura alephllm: https://github.com/AbstractEyes/alephllm
