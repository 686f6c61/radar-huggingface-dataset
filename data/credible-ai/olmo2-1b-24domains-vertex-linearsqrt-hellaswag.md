# credible-ai/olmo2-1B-24domains-vertex-linearsqrt-hellaswag

## Resumen

olmo2-1B-24domains-vertex-linearsqrt-hellaswag es un modelo de lenguaje de 1,41 mil millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de propósito general, sino un checkpoint preentrenado específicamente para validar una metodología de mezcla de datos: el modelo se entrena sobre 32 mil millones de tokens del corpus WebOrganizer, combinando sus 24 dominios temáticos con pesos de mezcla optimizados por LinMix para la tarea HellaSwag.

La arquitectura subyacente es OLMo 2 (clase `Olmo2ForCausalLM`), con 18 capas, dimensión oculta de 2048 y tokenizador GPT-NeoX-20B de 50.432 entradas de vocabulario. Los pesos se distribuyen en bfloat16 bajo licencia MIT, y el repositorio incluye un archivo `mix.json` con la composición exacta de la mezcla de datos empleada.

Su relevancia es metodológica más que práctica: sirve como referencia reproducible para investigadores que estudian data mixing, atribución de dominios y optimización de mezclas de preentrenamiento. Para aplicaciones de producción reales, el propio autor advierte que no está diseñado como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 18 |
| Dimension oculta | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 |
| Tokens de entrenamiento | 32B |
| Framework de entrenamiento | OLMo-core |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, un transformer decoder-only estándar implementado en Transformers como `Olmo2ForCausalLM`. Con 1,41B de parámetros, 18 capas y dimensión oculta de 2048, se sitúa en la gama compacta de la familia OLMo 2. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento se realizó con OLMo-core sobre 32 mil millones de tokens extraídos del corpus WebOrganizer/Corpus-200B, que a su vez deriva del pool DCLM 1b-1x (CC-BY-4.0) y está sujeto a los términos de uso de Common Crawl. La innovación clave no reside en la arquitectura sino en la mezcla de datos: los 24 dominios temáticos del corpus se combinan con pesos optimizados mediante LinMix, un método de atribución lineal de dominios que ajusta un surrogate lineal sobre un enjambre de vértices (proxy swarm) usando una utilidad de raíz cuadrada (√π, r = 0,5). El modelo proxy del enjambre es `credible-ai/olmo2-30M-24domains-vertex`. La mezcla resultante está documentada en el archivo `mix.json` del repositorio. No se reporta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como consecuencia directa del preentrenamiento sobre corpus web.
- Modelado de lenguaje base: al no haber pasado por instrucción ni alineación, no incorpora modo chat ni seguimiento de instrucciones de forma nativa.
- Capacidad de continuación de texto y evaluación de perplejidad en benchmarks tipo HellaSwag, que es el objetivo para el que se optimizó la mezcla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Reproducción de experimentos de LinMix: el checkpoint permite replicar los resultados del paper sobre mezcla de datos y verificar los pesos de mezcla recogidos en `mix.json` frente a alternativas.
- Investigación en data mixing: sirve como punto de comparación para evaluar si una nueva estrategia de mezcla supera la atribución lineal con utilidad √π sobre el corpus WebOrganizer.
- Estudios de atribución de dominios: al estar entrenado sobre 24 dominios temáticos conocidos, permite analizar qué dominios contribuyen más a tareas downstream como HellaSwag.
- Evaluación de proxies de bajo coste: el modelo de 30M del enjambre (`olmo2-30M-24domains-vertex`) puede validarse contra este checkpoint de 1,41B para estudiar la fidelidad del surrogate lineal.
- Baseline en experimentos de scaling de mezclas: útil como referencia de 1B parámetros y 32B tokens en estudios que varíen tamaño o presupuesto de cómputo.
- Análisis de corpus web filtrado: permite inspeccionar el comportamiento de modelos entrenados exclusivamente sobre DCLM/WebOrganizer frente a corpus alternativos en tareas de comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla se optimizó para HellaSwag, pero no incluye cifras de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB según longitud de secuencia y batch.
- En cuantización de 8 bits, el peso se reduce a unos 1,4 GB; en 4 bits, a unos 0,7 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bfloat16 o cuantizada. Para entrenamiento o evaluación a gran escala se recomienda A100 o H100.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU con llama.cpp u Ollama si se convierte a GGUF, aunque no se distribuyen pesos GGUF en el repositorio.
- Opciones de despliegue: Transformers nativo (código de carga incluido en la model card), vLLM y TGI para servir; llama.cpp/Ollama requerirían conversión previa a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linearsqrt-hellaswag | 1,41B | no disponible | MIT | Mezcla de datos optimizada (LinMix) | Hugging Face |
| OLMo 2 1B (AllenAI) | ~1,2-1,5B | no disponible en esta ficha | Apache 2.0 (modelo base OLMo 2) | Modelo base de propósito general | Hugging Face |
| olmo2-30M-24domains-vertex (credible-ai) | ~30M | no disponible | no disponible en esta ficha | Proxy del enjambre LinMix | Hugging Face |
| Modelos base de ~1B (p. ej. TinyLlama, Qwen2.5-1.5B base) | 1-1,5B | variable según modelo | variable | Modelos base generalistas | Hugging Face |

La comparación directa con modelos base generalistas no es del todo justa: este checkpoint está optimizado para una única tarea de evaluación (HellaSwag) y un corpus concreto, por lo que su rendimiento fuera de ese dominio no está caracterizado. Frente al OLMo 2 1B original, la diferencia principal es la mezcla de datos, no la arquitectura.

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación y no un modelo de propósito general; no debe usarse en producción como asistente.
- Ausencia de alineación: no ha pasado por RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo elevado de alucinación al ser un modelo base sin instrucción.
- Entrenado solo en inglés; no se garantiza comportamiento en otros idiomas.
- La mezcla de datos está optimizada para HellaSwag, lo que puede sesgar el modelo hacia patrones de ese benchmark y penalizar otras tareas.
- El corpus de entrenamiento proviene de Common Crawl vía DCLM y está sujeto a términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool original; conviene revisar esas condiciones si se redistribuye o se usa comercialmente, aunque los pesos sean MIT.
- No se documenta la longitud de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Solo 281 descargas y 0 likes en el momento de la consulta: comunidad muy reducida y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearsqrt-hellaswag
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Modelo proxy del enjambre: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
