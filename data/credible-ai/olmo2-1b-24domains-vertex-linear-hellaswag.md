# credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag

## Resumen

`olmo2-1B-24domains-vertex-linear-hellaswag` es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (arXiv:2610.37390). No es un modelo de propósito general: se trata de un checkpoint preentrenado sobre una mezcla de datos específica, optimizada mediante atribución lineal de dominios para maximizar el rendimiento en el benchmark HellaSwag.

El modelo emplea la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño de hidden de 2048, y fue entrenado desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, distribuido en 24 temáticas. La mezcla de dominios se calculó con LinMix, un método que ajusta un surrogate lineal sobre un enjambre de modelos proxy (el más pequeño, `olmo2-30M-24domains-vertex`) y deriva pesos de mezcla mediante atribución lineal con utilidad lineal (r = 0).

Su relevancia es metodológica: sirve como referencia reproducible para estudiar cómo la composición del dataset afecta al rendimiento en tareas concretas, y permite validar empíricamente las predicciones de LinMix a escala de 1B de parámetros. Está pensado para investigadores en mezcla de datos, no para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 18 |
| Tamaño de hidden | 2048 |
| Tokenizer | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32B |
| Precisión de pesos | bfloat16 |
| Tamaño del repo | 2,8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 de Allen AI, un transformer decoder-only denso con 18 capas y dimensión oculta de 2048, gestionado a través de la implementación `Olmo2ForCausalLM` de Transformers. Usa el tokenizer de GPT-NeoX-20B con un vocabulario de 50.432 entradas. Los pesos se distribuyen en bfloat16.

El preentrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, que a su vez deriva del pool DCLM 1b-1x (CC-BY-4.0) y está sujeto a los términos de uso de Common Crawl. La innovación principal no reside en la arquitectura sino en la selección de datos: la mezcla de los 24 dominios temáticos se optimizó con LinMix, un método que ajusta un surrogate lineal sobre un enjambre de modelos proxy (en este caso, `olmo2-30M-24domains-vertex`) y calcula los pesos de mezcla mediante atribución lineal de dominios con utilidad lineal (r = 0), usando HellaSwag como métrica objetivo. El fichero `mix.json` del repositorio contiene la mezcla exacta empleada. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como consecuencia del preentrenamiento estándar de un modelo causal.
- Razonamiento básico y completado de frases, orientado implícitamente a tareas del estilo HellaSwag por la mezcla de datos elegida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo thinking, visión ni audio.
- No se documenta ajuste por instrucciones: es un checkpoint base, no un modelo instruct.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: el modelo permite replicar los resultados del artículo LinMix a escala de 1B de parámetros, comparando la mezcla optimizada con mezclas uniformes o heurísticas sobre el mismo corpus.
- Validación de surrogates lineales: sirve para contrastar si las predicciones de atribución lineal obtenidas con el proxy de 30M se mantienen al escalar a 1,41B, midiendo la correlación entre rendimiento predicho y observado en HellaSwag.
- Estudio de atribución por dominio: al conocerse la mezcla exacta (`mix.json`) y los 24 dominios del corpus, permite aislar la contribución de cada temática al rendimiento final mediante ablaciones controladas.
- Investigación en selección de datos para preentrenamiento: útil como baseline en trabajos que propongan nuevos métodos de data mixing y necesiten un punto de comparación entrenado con un método publicado.
- Análisis de eficiencia de entrenamiento: con 32B tokens y 1,41B parámetros, es un caso asequible para estudiar curvas de escalado y sensibilidad a la composición del dataset sin requerir presupuestos industriales.
- Docencia y formación en mezcla de datos: el repositorio incluye código (github.com/credibleai/linmix), datos tokenizados y pesos, lo que facilita montar ejercicios prácticos sobre optimización de mezclas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la mezcla se optimizó para HellaSwag, pero no reporta la puntuación obtenida por este checkpoint ni comparaciones numéricas con otras mezclas o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) es suficiente en bfloat16 o cuantización; A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en todas las RTX de 8 GB en adelante y en GPUs de portátil con 8 GB.
- Opciones de despliegue: Transformers (soporte nativo vía `Olmo2ForCausalLM`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser un transformer estándar con pesos safetensors es probable que funcionen conversiones a GGUF, sin garantía documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linear-hellaswag | 1,41B | no disponible | MIT | Investigación en data mixing | Hugging Face |
| olmo2-30M-24domains-vertex (proxy del mismo autor) | ~30M | no disponible | no disponible | Surrogate para LinMix | Hugging Face |
| OLMo 2 1B (Allen AI) | ~1B | no disponible | Apache 2.0 (modelo base original) | Modelo base de propósito general | Hugging Face |
| Modelos de ~1B tipo Llama 3.2 1B | ~1,2B | 128K (según versión) | Llama Community License | Asistente generalista | Hugging Face |

La comparación con OLMo 2 1B original es la más directa: comparten arquitectura y escala, pero difieren en datos de entrenamiento y en el objetivo (este checkpoint está sobreoptimizado para HellaSwag). Frente a modelos instruct de ~1B, este carece de ajuste por instrucciones y de soporte multilingüe, por lo que no es sustituible en aplicaciones de usuario final.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; el propio autor lo declara explícitamente.
- Entrenado únicamente en inglés; no hay evidencia de competencia en otros idiomas.
- Sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni está alineado con preferencias humanas.
- La mezcla de datos está optimizada para HellaSwag, lo que puede producir un sesgo hacia el formato de esa tarea y degradar el rendimiento en otras.
- Riesgo de alucinación inherente a un modelo base de 1,41B sin RLHF ni verificaciones factuales.
- Solo 32B tokens de entrenamiento, muy por debajo de los presupuestos habituales para modelos de este tamaño; la calidad general será limitada.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con secuencias largas.
- Los datos de entrenamiento derivan de Common Crawl y están sujetos a sus términos de uso, además de la licencia CC-BY-4.0 del pool DCLM; conviene revisar ambas antes de cualquier uso derivado.
- Aunque los pesos son MIT, la licencia no cubre necesariamente los datos subyacentes ni exime de las obligaciones de atribución de las fuentes.
- No se han publicado benchmarks, por lo que no es posible verificar empíricamente el rendimiento declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linear-hellaswag
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
