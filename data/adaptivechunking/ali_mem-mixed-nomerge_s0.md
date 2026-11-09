# AdaptiveChunking/ali_mem-mixed-nomerge_s0

## Resumen

`ali_mem-mixed-nomerge_s0` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet), con arquitectura identificada como `ali`, objetivo de entrenamiento `ratio` y decodificación por chunking con estrategia `ema`. El modelo tiene 22.785.088 parámetros y se entrenó durante 6000 pasos sobre secuencias de 1024 bytes en tres idiomas: inglés, turco y finés.

El interés del artefacto es metodológico: explora cómo segmentar dinámicamente flujos de bytes en lugar de depender de un vocabulario BPE fijo, y publica la traza completa de checkpoints intermedios en ramas `step-N` con una programación logarítmica consciente de fases. Esto lo hace útil para investigadores que estudien tokenización sin vocabulario, modelos H-Net y estrategias de chunking adaptativo.

Conviene subrayar que no hay pipeline declarado, ni idiomas oficialmente soportados en metadatos, ni resultados de benchmarks publicados. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 8 de noviembre de 2026, y no debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net variante `ali` (beetle-hnet), tokenización byte-level con chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de atención; entrenado con secuencias de 1024 bytes |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; idiomas oficialmente soportados: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (variante `ali`) que opera directamente sobre bytes, con un mecanismo de chunking dinámico que decide los límites de segmento durante el propio proceso. El objetivo de entrenamiento es `ratio`, la decodificación de chunks usa `ema` y no se aplica ninguna programación de fases (`schedule=None`). El modelo se entrenó con semilla 0 durante 6000 pasos, con batch de 32 y longitud de 1024 bytes por muestra, sobre un corpus mixto en inglés, turco y finés. El sufijo `nomerge` del nombre sugiere que no se aplica fusión de chunks en la variante, aunque la model card no lo detalla explícitamente.

El repositorio sigue el layout estilo Beetle: ramas `step-N` correspondientes a checkpoints conservados según una programación log2 consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde cada inicio de fase de objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo reanudable del entrenador en `training_state/checkpoint.pt`. La rama `main` guarda los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y las pruebas de frontera FLORES+ en `probe/` una vez finalizado el entrenamiento. En `model.safetensors` cada tensor atado se almacena una única vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Modelado de secuencias a nivel de byte: procesa flujos de bytes sin vocabulario fijo y aprende a segmentarlos dinámicamente.
- Chunking adaptativo: la estrategia `ema` decide los límites de chunk durante la inferencia.
- Entrenamiento multilingüe limitado a inglés, turco y finés.
- Checkpoints intermedios reanudables: cada rama `step-N` incluye el estado completo del entrenador para continuar el entrenamiento.
- Evaluación de fronteras de chunk mediante pruebas FLORES+ incluidas en `probe/`.
- Generación de texto conversacional: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Investigación en tokenización sin vocabulario: el modelo permite estudiar cómo un H-Net segmenta bytes en chunks frente a un tokenizador BPE estático, comparando la distribución de chunks en `probe/` con las fronteras de palabra de FLORES+.
- Análisis de estrategias de chunking: la variante `nomerge` con `dechunk=ema` sirve como línea base para medir el efecto de fusionar o no chunks en tareas de modelado de bytes.
- Reproducción de experimentos: las ramas `step-N` con `training_state/checkpoint.pt` permiten reanudar el entrenamiento exactamente desde cualquier checkpoint conservado, útil para estudios de estabilidad y programación de fases.
- Comparación multilingüe en lenguas morfológicamente ricas: el entrenamiento con turco y finés, junto al inglés, permite analizar el comportamiento del chunking en lenguas con aglutinación frente a una germánica.
- Estudio de eficiencia de parámetros: con 22,8 millones de parámetros y pesos atados, es un banco de pruebas asequible para medir el coste de la tokenización dinámica frente a vocabularios fijos.
- Base para experimentos de destilación o ablación: al ser un checkpoint pequeño y con licencia Apache 2.0, se puede reentrenar o modificar para probar variantes de objetivo (`ratio`) y decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros en fp32, los pesos ocupan aproximadamente 91 MB; en fp16, unos 46 MB. El estado del entrenador en `training_state/checkpoint.pt` es mucho mayor (el repo completo pesa 6,1 GB) y solo es necesario para reanudar el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; una RTX 3060 o superior sobra. Para reanudar el entrenamiento con estado completo conviene una GPU con 8-16 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (la librería declarada es `pytorch`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nomerge_s0 | 22,8 M | 1024 bytes (entrenamiento) | byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos H-Net de beetle-hnet | no disponible | no disponible | byte-level | no disponible | GitHub |
| Tokenizadores BPE estándar (p. ej. GPT-2) | no aplica (no es modelo) | no aplica | BPE fijo | MIT | Amplia |

No se dispone de datos de rendimiento comparables para modelos de la misma categoría (H-Net byte-level con chunking dinámico), por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigación: no hay pipeline declarado, ni idiomas oficialmente soportados en metadatos, ni benchmarks publicados; no está pensado para uso en producción.
- Idiomas: solo se entrenó con inglés, turco y finés; el comportamiento en otros idiomas es desconocido y probablemente deficiente.
- Contexto: las secuencias de entrenamiento son de 1024 bytes; no hay evidencia de generalización a contextos más largos.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento no está descrito en la model card.
- Alucinación: al no ser un modelo conversacional alineado, no aplica la noción habitual de alucinación, pero tampoco hay garantías de coherencia en generación libre.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un experimento sin evaluación de calidad, su uso en producción no está respaldado por resultados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; el repo pesa 6,1 GB por los estados de entrenamiento, lo que dificulta su descarga completa.
- Pesos atados: `model.safetensors` no contiene todos los tensores de forma independiente; es necesario aplicar el mapeo de `config.json["tied_weights"]` para cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nomerge_s0
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Dataset FLORES+: no disponible enlace directo en la información proporcionada
