# credible-ai/olmo2-1B-24domains-vertex-linearsqrt-hellaswag

## Resumen

olmo2-1B-24domains-vertex-linearsqrt-hellaswag es un modelo de lenguaje de 1,41 mil millones de parámetros publicado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix (mezcla de datos por optimización de pesos de dominio). No es un modelo de propósito general: es un checkpoint preentrenado desde cero sobre 32.000 millones de tokens del corpus WebOrganizer, combinando sus 24 topics con unos pesos de mezcla que LinMix optimizó específicamente para la tarea HellaSwag.

La relevancia del modelo es metodológica. LinMix ajusta un surrogate lineal sobre un enjambre de modelos proxy pequeños (el swarm `olmo2-30M-24domains-vertex`) con utilidad de raíz cuadrada (r = 0,5) y extrapola los pesos de mezcla óptimos al modelo grande. Este checkpoint es el extremo "grande" de esa extrapolación: misma receta de datos, 1,41B parámetros reales, arquitectura OLMo 2 de 18 capas y hidden size 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens y entrenamiento con OLMo-core.

Al estar preentrenado y no alineado, su utilidad práctica está en la investigación sobre data mixing, no en producto. Resulta útil para quien quiera reproducir curvas de escalado de mezclas de dominio, comparar mezclas optimizadas frente a mezclas uniformes o servir de base para fine-tuning experimental con un coste de entrenamiento bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en bfloat16 (convertibles a otros formatos con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (pesos) |
| Formato de pesos | safetensors, bfloat16 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Volumen de entrenamiento | 32.000 millones de tokens |
| Framework de entrenamiento | OLMo-core |
| Metodo de mezcla | LinMix: surrogate lineal ajustado sobre el enjambre vertex con utilidad raiz cuadrada (r = 0,5) |
| Modelo proxy del enjambre | `credible-ai/olmo2-30M-24domains-vertex` |
| Objetivo de optimizacion | HellaSwag |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de la familia OLMo 2, implementada en Transformers como `Olmo2ForCausalLM`. El checkpoint tiene 1,41B parámetros en 18 capas con hidden size 2048, lo que da un modelo relativamente ancho para su profundidad. Usa el tokenizador de GPT-NeoX-20B (50.432 entradas), lo que facilita la compatibilidad con tooling ya existente para modelos Pythia/OLMo. Los pesos se distribuyen en bfloat16.

El entrenamiento se hizo con OLMo-core sobre 32.000 millones de tokens muestreados del corpus WebOrganizer/Corpus-200B, que organiza el contenido web en 24 topics. La innovación no está en la arquitectura sino en la receta de datos: LinMix ajusta un surrogate lineal sobre las curvas de rendimiento de un enjambre de modelos proxy de 30M (variando pesos de mezcla de los 24 dominios), con una utilidad de raíz cuadrada (r = 0,5), y extrapola los pesos óptimos al modelo de 1,41B. El objetivo de optimización declarado es HellaSwag. El repositorio incluye un `mix.json` con la mezcla exacta de datos empleada, lo que hace el experimento reproducible. No se documenta en la información disponible ninguna fase de RLHF, DPO o instruction tuning: es un checkpoint puramente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés, a partir de un prompt, sin formato de chat ni plantilla de instrucciones.
- Modelado de lenguaje base: útil para medir perplexity y comportamiento de continuación sobre dominios concretos del corpus WebOrganizer.
- Razonamiento y conocimiento factual limitados por el volumen de entrenamiento (32B tokens) y por el tamaño del modelo; no hay evaluación publicada que lo cuantifique.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, multi-step reasoning ni modos de "thinking".
- Sin capacidades multimodales (visión, audio) ni de otro tipo.
- Multilingüe: no; la model card declara únicamente inglés.
- Reproducibilidad de mezclas: al incluir `mix.json`, permite replicar exactamente la distribución de dominios usada.
- Compatible con `endpoints_compatible` en el Hub, es decir, desplegable mediante Inference Endpoints.

## Casos de uso

- Reproducción del paper LinMix: cargar el checkpoint y el `mix.json` para verificar que los pesos de mezcla extrapolados desde el enjambre de 30M producen el comportamiento reportado en el modelo de 1,41B.
- Estudios de ablación de data mixing: entrenar la misma arquitectura con una mezcla uniforme sobre los 24 topics y comparar curvas de validación frente a este checkpoint, aislando el efecto de la optimización de mezcla.
- Validación de proxies pequeños: usar el par formado por `olmo2-30M-24domains-vertex` y este modelo de 1,41B para medir cuánto se desvía la predicción del surrogate lineal al escalar el tamaño.
- Investigación sobre contaminación de benchmarks: HellaSwag fue el objetivo de optimización de la mezcla, de modo que este checkpoint sirve para estudiar hasta qué punto optimizar la mezcla contra una tarea concreta infla la métrica sin mejorar capacidad general.
- Base para fine-tuning experimental: con 1,41B parámetros y pesos en bfloat16 (2,8 GB), se puede ajustar en una sola GPU consumer para probar recetas de SFT o DPO sobre un backbone OLMo 2 sin partir del modelo oficial de AllenAI.
- Docencia y divulgación sobre mezclas de dominio: el par mezcla + `mix.json` + código en GitHub constituye un ejemplo completo y de bajo coste de un pipeline de optimización de datos de preentrenamiento.
- Evaluación comparativa de tokenizadores y arquitecturas en inglés: al usar GPT-NeoX-20B, permite comparar directamente con la familia Pythia sobre las mismas secuencias tokenizadas del dataset `weborganizer-corpus-200b-tokenized`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que HellaSwag es el objetivo para el que se optimizaron los pesos de mezcla, pero no incluye cifras de HellaSwag ni de ninguna otra tarea (MMLU, GSM8K, HumanEval, etc.), ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos (1,41B × 2 bytes), más caché KV y activaciones; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en float32: unos 5,7 GB solo para pesos.
- En cuantización de 8 bits: aproximadamente 1,4 GB de pesos; en 4 bits, aproximadamente 0,7 GB. Estas cifras son estimaciones aritméticas a partir del número de parámetros, no valores publicados por el autor, y requieren convertir los pesos con herramientas externas (llama.cpp, GPTQ, AWQ), ya que el repositorio solo distribuye bfloat16.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090 24 GB, incluso en bfloat16.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para inferencia; resultan útiles para reentrenar o hacer fine-tuning con batch grande.
- Opciones de despliegue: `transformers` (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI si la versión instalada incluye la arquitectura OLMo 2, llama.cpp/Ollama previa conversión a GGUF, y Hugging Face Inference Endpoints (el modelo está marcado como `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linearsqrt-hellaswag | 1,41B | No disponible | Preentrenamiento con mezcla optimizada por LinMix sobre 24 dominios | MIT | Hugging Face (credible-ai) |
| OLMo 2 1B (AllenAI) | ~1,4B (misma familia arquitectonica) | No disponible en esta ficha | Modelo base de propósito general de la familia OLMo 2 | Apache 2.0 (modelo oficial) | Hugging Face (allenai) |
| SmolLM2-1.7B (HuggingFace) | ~1,7B | 8.192 tokens | Preentrenamiento a gran escala con dataset propio, orientado a uso general | Apache 2.0 | Hugging Face (HuggingFaceTB) |
| Qwen2.5-1.5B (Alibaba) | ~1,5B | 32.768 tokens | Modelo base multilingüe con amplio soporte de tooling | Apache 2.0 | Hugging Face (Qwen) |

Nota: los datos de los modelos de terceros provienen de su documentación pública y deben verificarse antes de usarse en una decisión técnica; esta ficha solo aporta cifras verificadas del modelo de credible-ai. La comparación honesta es que este checkpoint no compite en capacidad general con los otros tres: su ventaja es la trazabilidad total del pipeline de datos y la reproducibilidad del experimento de mezcla.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; el propio autor lo declara así en la model card.
- No ha pasado por instruction tuning, RLHF ni DPO: no sigue instrucciones de forma fiable y no tiene plantilla de chat.
- Entrenado con solo 32.000 millones de tokens, un volumen bajo para 1,41B parámetros en los estándares actuales; es esperable un rendimiento por debajo de modelos base de tamaño similar entrenados con varios billones de tokens.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo alto de alucinación y de reproducir sesgos y toxicidad presentes en Common Crawl, sin filtrado por alineación ni evaluación de seguridad publicada.
- La mezcla de datos se optimizó contra HellaSwag, por lo que cualquier resultado en esa tarea debe interpretarse con cautela por posible sobreajuste al benchmark.
- Posible contaminación: el corpus deriva de DCLM 1b-1x, un pool web que puede contener textos de benchmarks públicos.
- Longitud de contexto no documentada en la información disponible; hay que verificarla empíricamente antes de usarla en tareas de contexto largo.
- Licencia: los pesos son MIT, pero los datos de entrenamiento provienen de WebOrganizer/Corpus-200B, derivado de DCLM 1b-1x (CC-BY-4.0) y sujeto a los términos de uso de Common Crawl; el uso comercial debe revisar esas condiciones además de la MIT.
- Sin métricas publicadas: no se puede justificar una elección en producción basándose en benchmarks del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearsqrt-hellaswag
- Modelo proxy del enjambre (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Codigo de LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas usadas en el entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool de origen DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de `Olmo2ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/olmo2
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
