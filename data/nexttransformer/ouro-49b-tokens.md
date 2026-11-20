# NextTransformer/Ouro-49B-Tokens

## Resumen

Ouro-49B-Tokens es un checkpoint de modelo de lenguaje causal de tipo "looped" (LoopLM) desarrollado por NextTransformer dentro de su comparativa de arquitecturas sobre 49.152 mil millones de tokens de entrenamiento. El modelo tiene 607.127.805 parámetros y una ventana de contexto de 2.048 tokens, y se presenta como el checkpoint final de la familia Ouro en dicha comparativa. La particularidad arquitectónica reside en que cada recursión de profundidad pasa por una "coda" y una cabeza de lenguaje, con una distribución de salida (exit gate) que pondera las pérdidas específicas de cada profundidad y determina en inferencia cuándo detener el cómputo según una probabilidad acumulada de halting.

El modelo fue preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones. El sufijo "49B" del nombre del repositorio hace referencia al número de tokens de entrenamiento, no al número de parámetros, un detalle relevante para evitar confusiones al compararlo con modelos de tamaño nominal similar. Está publicado en Hugging Face con librería PyTorch, pesos en safetensors y pipeline de text-generation, pero sin model card extendida más allá de la información técnica mínima y con descargas y likes nulos en el momento de la consulta.

Por su tamaño (alrededor de 0,6 mil millones de parámetros) y su contexto corto, Ouro-49B-Tokens se sitúa en la categoría de modelos pequeños orientados a experimentación arquitectónica más que a despliegue productivo generalista. Su interés principal es metodológico: documentar el entrenamiento a través de profundidades recursivas y el refinamiento posterior de la compuerta de salida, con resultados de validación en BPB y CORE-22.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NextTransformer "looped" (LoopLM), transformer causal con recursión por profundidades, coda y cabeza de lenguaje, y compuerta de salida (exit gate) |
| Parametros totales | 607.127.805 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), tokenizer en formato tiktoken JSON |
| Libreria | pytorch |
| Tamano del repositorio | 1,8 GB |
| Tokens de entrenamiento | 49.152 millones (segun el nombre del repositorio y la model card) |
| Dataset de preentrenamiento | ClimbMix |
| Actualizaciones de entrenamiento | 46.875 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con mecanismo de recursión ("looped"): cada recursión de profundidad atraviesa una coda y la cabeza de lenguaje, y una distribución de salida (exit distribution) pondera las pérdidas específicas de cada profundidad. El entrenamiento se realiza en dos fases: primero se entrena a través de las profundidades y después se refina únicamente la compuerta de salida, congelando el backbone. En inferencia, el modelo decide cuándo detenerse según la probabilidad acumulada de halting, de modo que la ruta de referencia evalúa todas las recursiones pero existe la opción de salida anticipada.

El preentrenamiento se llevó a cabo sobre ClimbMix durante 46.875 actualizaciones, alcanzando 49.152 millones de tokens procesados. La model card advierte que la definición temporal de la supervisión de la compuerta en profundidades adyacentes debe registrarse junto con cada versión de implementación, lo que indica sensibilidad al orden y a la semántica temporal de las señales de supervisión. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal autoregresiva con pipeline text-generation.
- Razonamiento multi-paso implícito mediante recursión de profundidades y salida adaptativa por halting.
- Evaluación de calidad de modelado de lenguaje medida en bits por byte (BPB) y en CORE-22.
- Tokenización basada en tiktoken con vocabulario y fusiones definidas en tokenizer.tiktoken.json.
- Capacidad de ejecución en CPU para pruebas mínimas, según el ejemplo oficial de carga.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio, modo thinking explícito ni soporte multilingüe declarado.

## Casos de uso

- Experimentación arquitectónica con modelos recursivos: el checkpoint permite reproducir el esquema de entrenamiento por profundidades y el refinamiento de la compuerta de salida, comparando rutas de evaluación completa frente a salida anticipada por halting.
- Investigación sobre halting adaptativo: sirve para estudiar cómo la probabilidad acumulada de salida afecta la calidad y el coste de cómputo en inferencia, dado que la ruta de referencia evalúa todas las recursiones.
- Evaluación de modelado de lenguaje a pequeña escala: con 607 millones de parámetros y contexto de 2.048 tokens, es adecuado para medir BPB y CORE-22 en entornos con recursos limitados.
- Reproducción de comparativas de arquitectura: al formar parte de una comparativa sobre 49.152 millones de tokens, permite replicar condiciones de entrenamiento y contrastar resultados entre variantes.
- Pruebas de integración de tooling propio: el ejemplo oficial de carga con nexttransformer, safetensors y tiktoken facilita validar pipelines de inferencia en CPU antes de escalar.
- Docencia y divulgación técnica: un modelo de este tamaño y con documentación de fases de entrenamiento es útil para explicar conceptos de recursión, compuertas de salida y presupuestos de cómputo en cursos de arquitecturas de lenguaje.
- Validación de tokenizadores personalizados: el formato tiktoken JSON con mergeable_ranks en base64 permite experimentar con codificación y decodificación sobre vocabularios propios.

## Benchmarks y rendimiento

| Evaluacion final | Resultado |
|---|---:|
| Validation BPB | 0,7047 |
| CORE-22 (×100) | 27,70 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K, etc.) ni curvas de rendimiento por profundidad de recursión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 607.127.805 parámetros en precisión completa (fp32) el peso bruto ronda 2,4 GB, y en fp16/bf16 alrededor de 1,2 GB, a lo que hay que sumar overhead de activaciones y tokenizador.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es viable en GPUs de consumo, pero no se documentan configuraciones probadas.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la model card.
- Opciones de despliegue: la vía oficial es la implementación nexttransformer instalada desde el repositorio Git en un entorno Python 3.10–3.13 junto con safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El ejemplo oficial se ejecuta en CPU con CUDA_VISIBLE_DEVICES vacío y no reporta tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouro-49B-Tokens (NextTransformer) | 607.127.805 | 2.048 | BPB 0,7047; CORE-22 27,70 | no disponible | Hugging Face, pesos safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos alternativos de la misma categoría (looped/LoopLM o transformers pequeños con contexto de 2.048 tokens) con datos verificables para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Contexto muy corto (2.048 tokens), lo que limita tareas de contexto largo, resúmenes extensos y conversaciones multi-turno prolongadas.
- Idiomas soportados no declarados; no hay evidencia en la información disponible de cobertura multilingüe.
- Licencia no disponible: no puede confirmarse el permiso para uso comercial, por lo que debe tratarse como restringido hasta verificación.
- La model card indica que la auditoría independiente de solo lectura del registro de ejecución del entrenamiento sigue pendiente, lo que introduce incertidumbre sobre la verificación completa del cómputo declarado.
- La supervisión de la compuerta depende de una definición temporal que debe registrarse con cada versión de implementación; inconsistencias pueden alterar el comportamiento de halting.
- Riesgo de alucinación no cuantificado: no se reportan evaluaciones de factualidad ni de sesgos.
- Dependencia de una implementación específica (nexttransformer en un commit concreto) y de un tokenizador tiktoken propio, lo que complica la portabilidad a otros runtimes.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.
- El nombre "49B" puede inducir a error sobre el tamaño del modelo; hace referencia a tokens de entrenamiento, no a parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/Ouro-49B-Tokens
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Definición de arquitectura (commit referenciado): https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/methods/ouro.json
- Registro de ejecución (commit referenciado): https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/runs/ouro.json
