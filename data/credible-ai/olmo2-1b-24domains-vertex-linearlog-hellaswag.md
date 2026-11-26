# credible-ai/olmo2-1B-24domains-vertex-linearlog-hellaswag

## Resumen

`olmo2-1B-24domains-vertex-linearlog-hellaswag` es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de propósito general: se trata de un checkpoint preentrenado específicamente para validar una metodología de optimización de mezclas de datos de entrenamiento sobre el corpus WebOrganizer, compuesto por 24 dominios temáticos.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño oculto de 2048. El modelo se entrenó desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer/Corpus-200B, ponderando cada uno de los 24 dominios con pesos de mezcla optimizados por LinMix para maximizar el rendimiento en el benchmark HellaSwag. Utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens.

Su relevancia es metodológica más que práctica: sirve como referencia reproducible para investigadores que estudian la atribución lineal de dominios en la mezcla de datos de preentrenamiento, y permite comparar recetas de mezcla (en este caso, ajuste de un surrogate lineal sobre el enjambre de vértices con utilidad logarítmica ln π y r = 1) frente a alternativas. El entrenamiento se realizó con OLMo-core y los pesos se distribuyen en bfloat16 bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`) |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Datos adicionales: 18 capas, tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas, tamaño del repositorio 2,8 GB.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2, un transformer decoder-only causal implementado en Transformers como `Olmo2ForCausalLM`. La configuración concreta corresponde a la variante de 1B: 18 capas, dimensión oculta 2048 y 1.414 millones de parámetros totales. Emplea el tokenizador de GPT-NeoX-20B (vocabulario de 50.432 tokens) y los pesos se almacenan en bfloat16.

El preentrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens del corpus WebOrganizer/Corpus-200B, que organiza los datos en 24 dominios temáticos. La innovación central no reside en la arquitectura sino en la receta de mezcla: los pesos por dominio se optimizaron con LinMix, un método que ajusta un surrogate lineal sobre un enjambre de vértices (vertex swarm) usando utilidad logarítmica ln π con r = 1. El enjambre proxy se construyó con el modelo `credible-ai/olmo2-30M-24domains-vertex`. El objetivo de optimización fue el benchmark HellaSwag. El repositorio incluye un fichero `mix.json` con la mezcla exacta de datos empleada, lo que facilita la reproducción. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo causal estándar.
- Razonamiento básico y modelado de lenguaje derivado del preentrenamiento sobre corpus web.
- Evaluación en HellaSwag como objetivo de optimización de la mezcla de datos.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- No es un modelo instruido ni alineado: no se ha sometido a fine-tuning de instrucciones según la información disponible.

## Casos de uso

- Reproducción de experimentos de LinMix: el checkpoint permite replicar los resultados del artículo sobre mezcla de datos por dominios y verificar la receta `mix.json` incluida en el repositorio.
- Investigación en data mixing: sirve como punto de comparación frente a otras estrategias de ponderación de dominios (por ejemplo, mezclas uniformes o basadas en heurísticas) manteniendo constante el resto del pipeline de entrenamiento.
- Estudio de atribución de dominios: al estar entrenado sobre 24 dominios con pesos conocidos, permite analizar cómo la proporción de cada dominio afecta al rendimiento en tareas concretas como HellaSwag.
- Baseline para modelos proxy: el modelo de 30M del mismo linaje puede usarse como proxy para predecir el comportamiento de esta variante de 1B en experimentos de escalado.
- Evaluación de tokenizadores y corpus: útil para estudiar el efecto del tokenizador GPT-NeoX-20B sobre el corpus WebOrganizer tokenizado.
- Docencia y formación en metodología de preentrenamiento: ejemplo completo y reproducible de un pipeline de entrenamiento con OLMo-core desde la mezcla de datos hasta los pesos finales.
- Generación de texto exploratoria en inglés: aunque no es su propósito, puede emplearse para experimentos controlados de generación con un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato relacionado es que HellaSwag se utilizó como objetivo de optimización de la mezcla de datos, pero no se proporcionan puntuaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 3-4 GB en total para secuencias cortas).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8 GB (estimaciones orientativas; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bfloat16 o fp16; A100 y H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: Transformers nativo (según el ejemplo de carga de la model card); compatible con endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo Transformers estándar debería poder adaptarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linearlog-hellaswag | 1,41B | no disponible | MIT | Hugging Face | Artefacto de investigación, solo inglés |
| OLMo 2 1B (AllenAI) | ~1,4B | no disponible en esta ficha | Apache 2.0 (modelo base original) | Hugging Face | Modelo base de propósito general del que deriva la arquitectura |
| credible-ai/olmo2-30M-24domains-vertex | ~30M | no disponible | no disponible | Hugging Face | Proxy de 30M usado en el enjambre de LinMix |

La comparación con alternativas de propósito general no es directa: este checkpoint está diseñado exclusivamente para reproducir experimentos de mezcla de datos, por lo que su rendimiento fuera de ese contexto no está caracterizado.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo declara como artefacto de investigación para reproducir LinMix.
- No ha pasado por fine-tuning de instrucciones ni alineamiento (RLHF/DPO no documentados), por lo que no es adecuado para uso conversacional directo.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, propio de un modelo base pequeño entrenado sobre corpus web.
- Sesgos potenciales heredados de Common Crawl y del corpus DCLM 1b-1x, del que deriva WebOrganizer/Corpus-200B.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar las implicaciones para uso comercial.
- Longitud de contexto no documentada: no se debe asumir una ventana larga en producción.
- Sin datos de benchmarks publicados, no es posible estimar su calidad real frente a otros modelos de tamaño similar.
- El modelo está optimizado para HellaSwag, lo que puede introducir un sesgo de selección en su comportamiento respecto a otras tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearlog-hellaswag
- Modelo proxy de 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
