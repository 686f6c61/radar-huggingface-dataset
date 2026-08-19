# bloomer010/Ling-3.0-flash-REAP384-94B-A5B

# Ficha del modelo: Ling-3.0-flash REAP384 (94B total / 5.1B activos)

## Resumen

Ling-3.0-flash REAP384 es un modelo de lenguaje de tipo MoE (Mixture of Experts) resultante de la poda de expertos del modelo base inclusionAI/Ling-3.0-flash, desarrollado por el usuario bloomer010. El modelo aplica una técnica de poda one-shot denominada REAP (Router-weighted Expert Activation Pruning) sobre los 512 expertos enrutados por capa del modelo original, conservando únicamente 384 de ellos (un 25% de expertos eliminados). Esto reduce el número total de parámetros de 124B a aproximadamente 94B (aunque los tensores en safetensors suman 96,5B), manteniendo los parámetros activos en 5.1B.

El modelo se presenta como un artefacto de investigación para estudiar la compresión de modelos MoE sin necesidad de fine-tuning posterior. La poda se realiza mediante la puntuación de cada experto basada en el producto del valor de la puerta del router por la norma L2 de su salida sobre datos de calibración, eliminando aquellos con menor puntuación. Al no incluir entrenamiento de recuperación, sirve para evaluar la degradación de rendimiento inducida por la poda y como punto de partida para experimentos de fine-tuning posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3 (MoE híbrido, código `bailing_hybrid`) |
| Parametros totales | 96.519.001.952 (~96,5B según safetensors; la model card indica 94B) |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); se menciona un repo hermano con versiones GGUF cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BailingMoeV3, una variante híbrida de MoE implementada mediante código personalizado en la librería `transformers`. El proceso de poda sigue el método REAP descrito en el paper arxiv:2510.13999. Cada experto enrutado es puntuado durante la calibración utilizando la fórmula `router-gate-value × output-L2-norm`, y los expertos con las puntuaciones más bajas son eliminados de forma permanente. En este caso, se conservan 384 de los 512 expertos por capa del modelo base Ling-3.0-flash (124B total / 5.1B activos).

La calibración se realizó con 1M de tokens del dataset Ultrachat, exclusivamente en modo conversacional. No se aplicó fine-tuning ni entrenamiento de recuperación tras la poda, lo que lo convierte en un artefacto de investigación puro para medir el impacto de la poda de expertos en el rendimiento del modelo.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Ling-3.0-flash.
- Arquitectura MoE con 5.1B de parámetros activos, lo que permite una inferencia relativamente rápida en comparación con modelos densos de tamaño similar.
- Soporte de código personalizado (`custom_code`) para la arquitectura `bailing_hybrid` / BailingMoeV3.
- No se dispone de información confirmada sobre capacidades específicas como tool calling, razonamiento multi-step, visión o audio.
- Al ser un modelo podado sin fine-tuning, se espera una degradación de rendimiento respecto al modelo base, aunque no se han publicado métricas cuantitativas.

## Casos de uso

- Investigación académica sobre poda de expertos: permite estudiar el efecto de eliminar el 25% de los expertos en un MoE de gran escala, comparando la degradación de rendimiento con el modelo base.
- Evaluación comparativa de técnicas de compresión: sirve como baseline para comparar REAP con otros métodos de poda o cuantización en modelos MoE.
- Despliegue en entornos con restricciones de memoria: al reducir el tamaño total de 124B a ~94B, facilita la carga en configuraciones multi-GPU donde el modelo original no cabe.
- Base para fine-tuning de recuperación: al no incluir entrenamiento posterior, es un punto de partida ideal para experimentos de fine-tuning que intenten recuperar el rendimiento perdido tras la poda.
- Prototipos de generación conversacional con huella de memoria reducida: puede utilizarse en entornos de desarrollo donde se prioriza la menor ocupación de VRAM frente al rendimiento máximo.
- Análisis de la sensibilidad de los expertos: permite identificar qué expertos son prescindibles según la señal del router, información útil para futuros diseños de arquitecturas MoE más eficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 193.1 GB en BF16, por lo que se necesitan aproximadamente 193 GB de VRAM para cargar los pesos completos, más overhead de activaciones y contexto.
- GPU recomendadas: no cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.). Se requieren GPUs de datacenter como A100 80GB o H100 80GB en configuración multi-GPU (mínimo 3 GPUs de 80 GB para los pesos, o 2 si se usa offloading).
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`. No se confirma soporte nativo en vLLM, TGI u Ollama sin adaptaciones. Las versiones cuantizadas GGUF están disponibles en un repositorio hermano, lo que permitiría su uso con llama.cpp u Ollama en hardware más modesto.
- Latencia y throughput: no disponibles. Al mantener 5.1B de parámetros activos, la latencia por token podría ser similar a la del modelo base, pero la reducción de memoria total puede mejorar el rendimiento en entornos con limitaciones de ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Metodo de poda | Fine-tuning posterior | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash (base) | 124B | 5.1B | Ninguno | No aplica | no disponible |
| Ling-3.0-flash REAP384 (este modelo) | ~94B (96,5B en safetensors) | 5.1B | REAP (one-shot, 25% expertos eliminados) | No | no disponible |
| Otros modelos MoE podados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos podados no es posible por falta de datos en la información proporcionada. La principal diferencia con el modelo base es la reducción del 25% de los expertos enrutados, manteniendo idénticos los parámetros activos.

## Limitaciones y advertencias

- Artefacto de investigación: no se ha sometido a fine-tuning de recuperación, por lo que su rendimiento en tareas reales puede ser significativamente inferior al del modelo base Ling-3.0-flash.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones para uso comercial o modificaciones.
- Sesgo de calibración: la poda se realizó únicamente con datos de chat (Ultrachat), por lo que los expertos conservados pueden estar sesgados hacia tareas conversacionales y degradarse en otros dominios (código, matemáticas, etc.).
- Riesgo de alucinación: al ser un modelo podado sin entrenamiento posterior, la coherencia y fidelidad de las respuestas pueden verse afectadas.
- Código personalizado: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código arbitrario del repositorio y supone un riesgo de seguridad en entornos de producción.
- Longitud de contexto y idiomas no especificados: no se dispone de información sobre la ventana de contexto soportada ni los idiomas cubiertos.
- Sin benchmarks publicados: no hay métricas objetivas que permitan evaluar la degradación real del rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP384-94B-A5B
- Paper REAP (arxiv): https://arxiv.org/abs/2510.13999
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
