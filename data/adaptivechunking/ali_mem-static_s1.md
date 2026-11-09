# AdaptiveChunking/ali_mem-static_s1

## Resumen

ali_mem-static_s1 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. No es un modelo de lenguaje generativo al uso, sino una implementación de H-Net (Hierarchical Network) a nivel de byte, entrenada con el framework de código abierto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Su objetivo es experimentar con tokenización dinámica por chunks ("dynamic chunking") sobre secuencias de bytes, sustituyendo el tokenizador BPE clásico por un mecanismo de agrupamiento adaptativo aprendido.

El modelo tiene 22.785.088 parámetros totales y se distribuye en formato safetensors con pesos atados (tied weights), acompañado de checkpoints intermedios organizados en ramas `step-N` según un esquema logarítmico. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas (inglés, turco y finés), con arquitectura `ali` y objetivo `ratio`.

Es relevante en el contexto de investigación en tokenización y arquitecturas alternativas al transformer estándar, no como modelo de producción. Su naturaleza experimental, el tamaño reducido y la ausencia de benchmarks publicados lo sitúan como material de estudio reproducible más que como herramienta desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali`), con dynamic chunking |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento; contexto de inferencia no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en, tr, fi (idiomas del entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados), checkpoints PyTorch `.pt` en `training_state/` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma H-Net implementado en beetle-hnet: procesa texto a nivel de byte y aprende a agrupar bytes en chunks de forma dinámica, en lugar de depender de un vocabulario BPE predefinido. La variante `ali` corresponde a una configuración concreta de la arquitectura dentro del framework, y el objetivo de entrenamiento es `ratio`, con un mecanismo de de-chunking basado en media móvil exponencial (`dechunk=ema`). Los pesos están atados (`tied_weights` en `config.json`), de modo que `model.safetensors` almacena cada tensor compartido una sola vez.

El entrenamiento se realizó durante 6000 pasos con batch de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. No se especifica en la información disponible el número total de tokens procesados ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF, DPO ni fases de alineación; el schedule de objetivos es `None`, lo que sugiere un entrenamiento de una sola fase sin currículum adaptativo. Los checkpoints se conservan en una programación logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k) y el repositorio incluye el estado completo del entrenador para reanudación.

## Capacidades

- Modelado de lenguaje a nivel de byte con tokenización dinámica aprendida (no BPE).
- Segmentación adaptativa de secuencias en chunks, objeto central del experimento.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints intermedios (`training_state/checkpoint.pt`).
- Evaluación de fronteras de chunk mediante sondas FLORES+ incluidas en `probe/` tras finalizar la ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización: comparar el comportamiento de un modelo byte-level con dynamic chunking frente a tokenizadores BPE en las mismas condiciones de datos, usando los checkpoints `step-N` para trazar la evolución del agrupamiento a lo largo del entrenamiento.
- Estudio de arquitecturas H-Net: reproducir el experimento con beetle-hnet y analizar cómo la variante `ali` con objetivo `ratio` afecta a la segmentación de secuencias multilingües.
- Análisis de fronteras de chunk: utilizar las sondas FLORES+ del directorio `probe/` para medir la calidad de las fronteras aprendidas en inglés, turco y finés.
- Reproducibilidad de entrenamiento: cargar `training_state/checkpoint.pt` desde una revisión `step-N` con `torch.load` y continuar el entrenamiento exactamente donde se dejó, útil para experimentos de ablation.
- Docencia y divulgación: ilustrar con un modelo pequeño (22,8 M de parámetros) cómo funciona el chunking dinámico a nivel de byte sin necesidad de infraestructura pesada.
- Baseline para investigación multilingüe de bajo recurso: servir como referencia inicial en turco y finés, idiomas con menor cobertura en tokenizadores BPE dominantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros, aproximadamente 91 MB de pesos) y en torno a 50 MB en fp16; el tamaño del repo (6,1 GB) se debe principalmente a los checkpoints intermedios y al estado del entrenador, no a los pesos del modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU para inferencia en CPU.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de investigación con arquitectura no estándar, requiere cargar los pesos con PyTorch y el código de beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-static_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con dynamic chunking | Apache 2.0 | Hugging Face |
| Byte-level BPE transformers (p. ej. ByT5-small) | ~300 M | variable | Transformer byte-level sin chunking aprendido | Apache 2.0 | Hugging Face |
| Modelos BPE pequeños (p. ej. GPT-2 small) | 124 M | 1024 tokens | Transformer con tokenizador BPE | MIT | Hugging Face |

La comparación es aproximada: no existen alternativas públicas directas con la misma combinación de H-Net, dynamic chunking y entrenamiento multilingüe en y tr/fi. Los modelos citados sirven como referencia de escala y enfoque, no como equivalentes funcionales.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de rendimiento en tareas downstream.
- Entrenamiento muy corto (6000 pasos) y corpus limitado a tres idiomas; no se espera calidad generativa útil en producción.
- Cobertura lingüística restringida a inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Contexto de entrenamiento de solo 1024 bytes, muy inferior al de modelos de lenguaje convencionales.
- Riesgo de alucinación y salidas incoherentes fuera de las condiciones de entrenamiento; no apto para aplicaciones de usuario final.
- Sin datos sobre sesgos del corpus de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción.
- El repositorio incluye checkpoints y estado del entrenador de gran tamaño (6,1 GB), lo que complica su descarga y almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-static_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
