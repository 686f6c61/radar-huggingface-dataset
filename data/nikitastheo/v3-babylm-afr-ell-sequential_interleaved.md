# nikitastheo/v3-babylm-afr-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-afr-ell-sequential_interleaved` es un modelo de lenguaje causal (causal LM) basado en la arquitectura GPT-2, desarrollado por nikitastheo en el contexto de la iniciativa BabyLM, cuyo objetivo es entrenar modelos de lenguaje con cantidades limitadas de datos, simulando la exposición lingüística de un bebé. El modelo está diseñado para procesar dos idiomas, afrikáans y griego, mediante una estrategia de entrenamiento secuencial intercalada: cambia de idioma cada cierto número de épocas (en concreto, cada 10 épocas según la configuración indicada).

Con aproximadamente 124 millones de parámetros, se trata de un modelo de tamaño pequeño-medio, comparable al GPT-2 original. Su relevancia radica en que explora el multilingüismo con datos escasos, un área de investigación activa en eficiencia y transferencia lingüística. El modelo se distribuye en formato safetensors y es compatible con la librería transformers, así como con herramientas de inferencia como text-generation-inference.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, causal LM) |
| Parametros totales | 123.886.080 (~124M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | afrikáans y griego (según el nombre del modelo, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal, diseñado para generación de texto autoregresiva. No se especifican detalles adicionales sobre el número de capas, cabezas de atención o dimensiones ocultas, pero el número de parámetros (~124M) sugiere una configuración similar a GPT-2 small (12 capas, 768 dimensiones ocultas, 12 cabezas).

El entrenamiento se realizó con un script personalizado basado en Hugging Face Accelerate (`train_clm.py`), sin utilizar el `Trainer` de transformers. Los hiperparámetros principales son: 23.580 pasos máximos, tasa de aprendizaje de 0,0001 con scheduler lineal y 2.358 pasos de warmup, batch size de 32 por dispositivo y sin acumulación de gradientes. El tokenizer empleado es `nikitastheo/babylm-afr-tokenizer`, específico para afrikáans. La estrategia de entrenamiento incluye un "language switch epoch" de 10, lo que indica que cada 10 épocas se alterna el idioma de entrenamiento entre afrikáans y griego, de forma secuencial e intercalada. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto causal en afrikáans y griego, según la configuración multilingüe del entrenamiento.
- Modelo base para fine-tuning en tareas específicas de procesamiento de lenguaje natural en estos idiomas.
- Adecuado para experimentos de transferencia entre idiomas con recursos limitados.
- Compatible con la librería transformers y con pipelines de generación de texto estándar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en multilingüismo con datos limitados: el modelo permite estudiar cómo un único modelo puede aprender dos idiomas con una exposición reducida, comparando el rendimiento frente a modelos monolingües.
- Fine-tuning para tareas de clasificación de texto en afrikáans o griego: al ser un modelo base, puede adaptarse a tareas como análisis de sentimiento o detección de temas con datasets pequeños.
- Generación de texto creativo en afrikáans y griego: útil para prototipos de escritura automática o asistentes de redacción en estos idiomas.
- Evaluación de estrategias de entrenamiento intercalado: sirve como punto de referencia para investigar el impacto del orden de los idiomas en el aprendizaje multilingüe.
- Experimentos de transferencia cero o few-shot: se puede probar la capacidad del modelo para generalizar a otros idiomas relacionados (por ejemplo, neerlandés para afrikáans) sin entrenamiento adicional.
- Despliegue en entornos educativos o de demostración: al ser un modelo pequeño, puede ejecutarse en hardware modesto para fines docentes o de divulgación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~124M de parámetros, en FP32 ocuparía aproximadamente 500 MB de memoria, y en FP16 unos 250 MB. Con cuantización a 8 bits o 4 bits, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Una NVIDIA GTX 1650, RTX 3060 o superior es suficiente. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: transformers (con pipeline de generación), vLLM, llama.cpp, Ollama, text-generation-inference (TGI) y endpoints compatibles.
- Latencia y throughput: no se dispone de mediciones específicas, pero para un modelo de este tamaño, en una GPU moderna se esperan decenas de tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitastheo/v3-babylm-afr-ell-sequential_interleaved | ~124M | no disponible | afrikáans, griego | no disponible | HuggingFace |
| nikitastheo/babylm-ara-ell-sequential_interleaved | no disponible | no disponible | árabe, griego | no disponible | HuggingFace |
| nikitastheo/babylm-por-ell-sequential_interleaved | no disponible | no disponible | portugués, griego | no disponible | HuggingFace |
| nikitastheo/babylm-lem-spa-ell-sequential_interleaved | no disponible | no disponible | español, griego | no disponible | HuggingFace |
| GPT-2 small (original) | 124M | 1024 | inglés | MIT | HuggingFace |

Los modelos de la serie BabyLM de nikitastheo comparten la misma estrategia de entrenamiento intercalado, variando los pares de idiomas. GPT-2 small es el modelo base de referencia, pero no es multilingüe.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin consultar al autor.
- Datos de entrenamiento limitados: al ser parte de BabyLM, el volumen de datos es reducido, lo que puede provocar un rendimiento inferior en tareas complejas y una mayor propensión a alucinaciones.
- Sesgos potenciales: los datos de BabyLM provienen de corpus específicos (probablemente literatura infantil y textos simples), lo que puede introducir sesgos de registro y temática.
- Cobertura lingüística limitada: solo se confirman dos idiomas (afrikáans y griego) a partir del nombre; no se documenta el rendimiento en otros idiomas.
- Sin información sobre alineación: no se aplicaron técnicas de RLHF o DPO, por lo que el modelo puede generar contenido no deseado o incoherente.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que dificulta su uso en aplicaciones que requieran manejar secuencias largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nikitastheo/v3-babylm-afr-ell-sequential_interleaved)
- [Modelo relacionado: babylm-ara-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-ara-ell-sequential_interleaved)
- [Modelo relacionado: babylm-por-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-por-ell-sequential_interleaved)
- [Modelo relacionado: babylm-lem-spa-ell-sequential_interleaved](https://huggingface.co/nikitastheo/babylm-lem-spa-ell-sequential_interleaved)
- [Página de BabyLM](https://babylm.github.io/)
- [Página de despliegue en FriendliAI](https://friendli.ai/models/nikitastheo/babylm-afr-ell-sequential_interleaved)
