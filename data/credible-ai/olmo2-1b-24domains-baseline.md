# credible-ai/olmo2-1B-24domains-baseline

## Resumen

Olmo2-1B-24domains-baseline es un modelo de lenguaje de aproximadamente 1,41 mil millones de parámetros, desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix ("LinMix: Data Mixing as Linear Domain Attribution", arXiv:2610.37390). Se trata de un modelo preentrenado desde cero sobre 32B tokens del corpus WebOrganizer, mezclando sus 24 dominios temáticos en sus proporciones naturales y sin ningún tipo de optimización de la mezcla de datos, lo que lo convierte en la línea base (baseline) contra la que comparar métodos de mezcla de datos como LinMix.

La relevancia de este modelo no reside en su capacidad como asistente o modelo de propósito general, sino en su papel dentro de la investigación sobre mezcla de datos (data mixing) en preentrenamiento. La mezcla de datos es uno de los factores más determinantes y costosos de ajustar en el preentrenamiento de modelos de lenguaje, y este baseline permite aislar y cuantificar la contribución de técnicas de optimización de mezclas. Está construido sobre la arquitectura OLMo 2 (18 capas, tamaño oculto 2048) y entrenado con OLMo-core, empleando el tokenizador GPT-NeoX-20B con un vocabulario de 50.432 tokens. Los pesos se publican bajo licencia MIT en formato safetensors, con un tamaño de repositorio de 2,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, una familia de transformers decoder-only totalmente abierta desarrollada originalmente por AllenAI, implementada en la librería `transformers` de Hugging Face mediante la clase `Olmo2ForCausalLM`. Consta de 18 capas con un tamaño oculto de 2048 y aproximadamente 1,41B de parámetros en total. Utiliza el tokenizador GPT-NeoX-20B de EleutherAI, con una longitud de vocabulario de 50.432 tokens.

El entrenamiento se realizó sobre 32B tokens procedentes del corpus WebOrganizer (WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x de mlfoundations), utilizando el framework OLMo-core. La característica definitoria de este baseline es que los datos se mezclaron sobre los 24 dominios temáticos clasificados por WebOrganizer en sus proporciones naturales, sin aplicar ninguna optimización de la mezcla. Las secuencias tokenizadas empleadas están disponibles en el dataset credible-ai/weborganizer-corpus-200b-tokenized, lo que garantiza la reproducibilidad completa de los experimentos. No se menciona en la model card ninguna fase posterior de RLHF, DPO ni fine-tuning de instrucciones, ni técnicas de decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de texto en inglés mediante el pipeline `text-generation` de `transformers`.
- Modelo preentrenado sin alineación: no ha sido ajustado con instrucciones, por lo que no está diseñado para seguir instrucciones ni para diálogo.
- No se documentan capacidades de razonamiento, código, matemáticas, visión ni audio; al ser un baseline de investigación entrenado con solo 32B tokens, su calidad de generación es limitada.
- Sin soporte documentado de tool calling, function calling ni capacidades de agentes.
- Capacidad multilingüe limitada al inglés, según los metadatos del repositorio.
- Utilidad principal como objeto de estudio: análisis de atribución de dominios, experimentos de mezcla de datos y reproducibilidad del paper LinMix.

## Casos de uso

- Reproducción de experimentos del paper LinMix: el modelo sirve como baseline sin optimizar para comparar métricas de atribución de dominios y calidad de mezcla de datos frente a variantes entrenadas con LinMix.
- Investigación en mezcla de datos (data mixing): permite estudiar cómo las proporciones naturales de los 24 dominios temáticos de WebOrganizer afectan al rendimiento del modelo en distintas tareas.
- Estudios de atribución de dominios: al conocerse exactamente la composición de la mezcla de entrenamiento (disponible en `mix.json`), es idóneo para investigar técnicas que atribuyen el comportamiento del modelo a dominios concretos de datos.
- Benchmarking de infraestructura de preentrenamiento: con 1,41B parámetros y 32B tokens de entrenamiento, es un objetivo razonable para validar pipelines de entrenamiento basados en OLMo-core en clústeres pequeños.
- Docencia y formación: como modelo completamente abierto (MIT) y de tamaño reducido, resulta útil para cursos y tutoriales sobre preentrenamiento de LLMs con datos documentados y licencias claras.
- Análisis de datos de entrenamiento: los datasets tokenizados publicados permiten auditar y estudiar el corpus WebOrganizer/DCLM sin necesidad de reprocesar Common Crawl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B parámetros en bfloat16, el modelo ocupa unos 2,8 GB, por lo que es viable inferencia en GPUs con 4-6 GB de VRAM o incluso en CPU.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.) es más que suficiente; no se requieren aceleradores de centro de datos como A100 o H100 para inferencia.
- Cabe con holgura en GPUs de consumo; también es ejecutable en portátiles con GPU integrada o en CPU, aunque con mayor latencia.
- Opciones de despliegue: carga nativa con Hugging Face `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`); al usar `Olmo2ForCausalLM`, debería ser compatible con vLLM y TGI en sus versiones recientes. No se mencionan versiones GGUF ni soporte documentado de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Propósito |
|---|---|---|---|---|---|
| olmo2-1B-24domains-baseline | 1,41B | no disponible | 32B tokens (WebOrganizer, mezcla natural) | MIT | Baseline de investigación (LinMix) |
| OLMo 2 1B (AllenAI) | ~1,5B | 4096 | ~2-4T tokens (Dolma) | Apache 2.0 | Modelo abierto de propósito general |
| Pythia 1.4B (EleutherAI) | 1,4B | 2048 | ~300B tokens (Pile) | Apache 2.0 | Artefacto de investigación interpretable |

Nota: OLMo 2 1B y Pythia 1.4B comparten tamaño y vocación de investigación abierta, pero están entrenados con órdenes de magnitud más tokens y datos optimizados, por lo que su calidad de generación es muy superior a la de este baseline, entrenado deliberadamente con una mezcla sin optimizar y solo 32B tokens.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card advierte que es un artefacto de investigación para reproducir el paper LinMix, no un modelo de lenguaje de uso general.
- Entrenado con solo 32B tokens y sin optimización de mezcla, por lo que su calidad de generación es sustancialmente inferior a la de modelos abiertos comparables.
- Sin alineación con instrucciones ni RLHF/DPO documentado: producirá texto de continuación crudo, no respuestas a instrucciones.
- Restringido al inglés; no apto para tareas multilingües.
- Riesgo de alucinación y generación de contenido incorrecto elevado, agravado por el preentrenamiento limitado y sin filtros de alineación.
- Sesgos heredados de Common Crawl y del pool DCLM 1b-1x (contenido web sin curación específica de seguridad), sujeto a los términos de uso de Common Crawl; los datos de entrenamiento están bajo CC-BY-4.0.
- Longitud de contexto no documentada en la model card; consultar la configuración de `Olmo2ForCausalLM` antes de despliegues con secuencias largas.
- Licencia MIT en los pesos permite uso comercial, pero los datos de entrenamiento derivan de Common Crawl, lo que puede imponer condiciones en productos derivados del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-baseline
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Código de LinMix (GitHub): https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core (GitHub): https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
