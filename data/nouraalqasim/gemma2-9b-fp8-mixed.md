# NouraAlqasim/gemma2-9b-fp8-mixed

## Resumen

Este repositorio contiene una cuantización post-entrenamiento (PTQ) en precisión FP8 (W8A8) del modelo `google/gemma-2-9b-it`, realizada con NVIDIA ModelOpt. El checkpoint, creado por NouraAlqasim, está calibrado específicamente con 128 diálogos del dataset `Almheiri/ArabCulture-Dialogue` (64 en árabe estándar moderno y 64 en dialecto del Golfo), con el objetivo de ajustar las escalas estáticas de activación para mejorar la precisión en tareas de diálogo en árabe. El resultado es un modelo de 9.241.705.984 parámetros que ocupa 10.2 GB en formato safetensors, pensado para ser servido con vLLM usando el backend `modelopt`. Su relevancia radica en ofrecer una alternativa cuantizada del popular Gemma 2 9B instruct, con menor huella de memoria y potencialmente mayor eficiencia en GPUs compatibles con FP8, aunque no se han publicado benchmarks que verifiquen su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `google/gemma-2-9b-it`) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (W8A8) mediante NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantización FP8, no cargable con `transformers` estándar) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-2-9b-it`, un transformer decoder-only de 9 mil millones de parámetros, aunque no se proporcionan detalles adicionales en la documentación de este checkpoint. El proceso de cuantización es post-entrenamiento: los pesos se cuantizan a FP8 con escalas calculadas de forma data-free, mientras que las activaciones se cuantizan estáticamente por tensor, exportadas como `input_scale`. Para calibrar estas escalas de activación, se utilizaron 128 diálogos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, seed 1448), con un máximo de 512 tokens por muestra. Se calibraron 294 de 294 cuantizadores de activación. El error cuadrático medio de los pesos (weight MSE) reportado es de 3.164e-08. No se realizó ningún entrenamiento adicional ni fine-tuning; solo se ajustaron las escalas de activación durante la calibración.

## Capacidades

No se documentan capacidades específicas para esta cuantización en la información proporcionada. Al ser una versión cuantizada del modelo `google/gemma-2-9b-it`, se espera que herede las capacidades del modelo base (generación de texto, seguimiento de instrucciones, razonamiento, etc.), pero no hay confirmación oficial ni benchmarks que lo avalen. La única particularidad documentada es el calibrado orientado a diálogos en árabe, lo que podría influir en el comportamiento de las activaciones para ese idioma, aunque no se especifica ningún impacto concreto.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. A continuación se listan posibles aplicaciones basadas en las características de la cuantización, pero no están confirmadas por el autor:

- Despliegue en producción con vLLM: el checkpoint está diseñado para ser servido con `vllm serve` usando `--quantization modelopt`, lo que permite inferencia de alto rendimiento en entornos compatibles con FP8.
- Procesamiento de diálogos en árabe: el calibrado con datos de árabe estándar y del Golfo sugiere una optimización para estos dominios, aunque no hay métricas que lo respalden.
- Aplicaciones con requisitos de memoria reducidos: al ocupar 10.2 GB en FP8, puede ejecutarse en GPUs con menos VRAM que el modelo original en FP16 (aunque no se proporciona comparación directa).
- Integración en pipelines de generación de texto: al derivar de un modelo instruct, podría usarse para tareas como resumen, redacción o respuesta a preguntas, siempre que se valide su comportamiento.
- Chatbots y asistentes virtuales: el modelo base está optimizado para seguir instrucciones y mantener conversaciones, por lo que esta cuantización podría emplearse en esos escenarios con menor coste de memoria.
- Investigación sobre cuantización y calibrado: este checkpoint sirve como ejemplo de cómo el calibrado de activaciones con datos específicos (en este caso, árabe) afecta a la precisión, útil para estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo reportado es el weight MSE de 3.164e-08, que es una métrica de error de cuantización, no una medida de rendimiento en tareas. No se proporcionan resultados en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 10.2 GB (según el tamaño del repositorio). Para inferencia se debe añadir memoria para activaciones y cache de contexto, por lo que se recomienda una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: GPUs con soporte nativo de FP8, como las de arquitectura Hopper (H100) o Ada Lovelace (RTX 4090, L40S). En GPUs sin soporte FP8 (por ejemplo, A100), la cuantización podría no ser aprovechada eficientemente.
- Opciones de despliegue: vLLM es la opción documentada (comando `vllm serve NouraAlqasim/gemma2-9b-fp8-mixed --quantization modelopt`). No se mencionan otras herramientas como TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información para una comparativa directa con otros modelos. La única referencia clara es el modelo base `google/gemma-2-9b-it`, del cual deriva esta cuantización. A continuación se muestra una tabla con los datos conocidos de ambos, aunque no hay métricas de rendimiento para comparar:

| Modelo | Parámetros | Tamaño del repo | Cuantización | Licencia |
|---|---|---|---|---|
| `google/gemma-2-9b-it` (base) | 9.241.705.984 | no disponible (aprox. 18 GB en FP16) | FP16 | Gemma license (no verificada aquí) |
| `NouraAlqasim/gemma2-9b-fp8-mixed` | 9.241.705.984 | 10.2 GB | FP8 (W8A8) | no disponible |

No se han encontrado otros modelos cuantizados similares en la información proporcionada.

## Limitaciones y advertencias

- No es cargable con la biblioteca `transformers` estándar; el `config.json` declara `quantization type: modelopt`, por lo que se requiere vLLM u otra herramienta compatible con ModelOpt.
- La licencia no está especificada en el repositorio; se debe asumir la del modelo base `google/gemma-2-9b-it` (licencia Gemma), pero no hay confirmación explícita.
- Al ser una cuantización, puede haber degradación en la calidad de las respuestas respecto al modelo original, aunque no se han publicado métricas que cuantifiquen esa pérdida.
- El calibrado se realizó exclusivamente con diálogos en árabe (MSA y Gulf), lo que podría sesgar el comportamiento de las activaciones hacia ese idioma y afectar al rendimiento en otros idiomas, aunque no hay evidencia empírica.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que es un checkpoint reciente o poco evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NouraAlqasim/gemma2-9b-fp8-mixed
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de calibración: https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue (revisión `9acd60cbbb4f`)
