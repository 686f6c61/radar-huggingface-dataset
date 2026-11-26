# credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag

## Resumen

olmo2-1B-24domains-dirichlet-exponential-hellaswag es un modelo de lenguaje de 1.414.678.528 parámetros (aproximadamente 1,41B) desarrollado por credible-ai, entrenado desde cero sobre 32.000 millones de tokens procedentes del corpus WebOrganizer. Se trata de un artefacto de investigación diseñado para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution), no de un modelo de propósito general. El modelo emplea la arquitectura OLMo 2 implementada en `Olmo2ForCausalLM` de Transformers, con 18 capas y un tamaño oculto de 2048.

La particularidad del modelo reside en su mezcla de datos: los pesos de mezcla sobre los 24 temas del corpus WebOrganizer se optimizaron mediante Olmix, un método que ajusta un sustituto exponencial sobre un enjambre Dirichlet, en este caso optimizado para el benchmark HellaSwag. El modelo proxy utilizado para la búsqueda de la mezcla es credible-ai/olmo2-30M-24domains-dirichlet. Los pesos se distribuyen en bfloat16, con licencia MIT, y el tokenizador es el de GPT-NeoX-20B con un vocabulario de 50.432 tokens.

El interés del modelo es metodológico: permite reproducir y auditar cómo la atribución lineal de dominios (LinMix) traduce una mezcla de datos objetivo en una configuración concreta de entrenamiento y qué efecto tiene sobre el rendimiento en una tarea concreta como HellaSwag. Su utilidad práctica en producción es limitada, pero es relevante para investigadores que estudian mezcla de datos, asignación de dominios y optimización de recetas de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2, un transformer decoder-only causal con 18 capas y dimensión oculta de 2048, implementado en Transformers como `Olmo2ForCausalLM`. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 entradas. Los pesos se publican en bfloat16 y el repositorio ocupa 2,8 GB.

El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, que organiza el contenido en 24 temas o dominios. La mezcla de datos no es uniforme: los pesos de muestreo por dominio se obtuvieron con Olmix, que ajusta un sustituto exponencial sobre un enjambre Dirichlet generado con el modelo proxy credible-ai/olmo2-30M-24domains-dirichlet, optimizando explícitamente para HellaSwag. El fichero `mix.json` del repositorio documenta la mezcla exacta empleada. El corpus de origen deriva del pool DCLM 1b-1x (CC-BY-4.0) y está sujeto a los términos de uso de Common Crawl; las secuencias tokenizadas están publicadas en credible-ai/weborganizer-corpus-200b-tokenized.

## Capacidades

- Generación de texto causal en inglés, entrenado desde cero sobre corpus web.
- Razonamiento básico y completado de frases evaluable mediante HellaSwag, que es el objetivo de optimización de su mezcla de datos.
- No dispone de ajuste por instrucciones ni de RLHF/DPO documentado en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan modos especiales (thinking mode, visión, audio) ni decodificación especulativa.

## Casos de uso

- Reproducción de experimentos de mezcla de datos: el modelo sirve para replicar los resultados del artículo LinMix sobre HellaSwag y verificar cómo la mezcla optimizada por Olmix afecta al rendimiento en esa tarea.
- Estudio de atribución lineal de dominios: investigadores pueden analizar el efecto de los pesos por dominio documentados en `mix.json` sobre el comportamiento del modelo entrenado.
- Validación de metodologías de data mixing: comparar la receta Olmix con mezclas uniformes u otras estrategias sobre el mismo corpus WebOrganizer de 24 temas.
- Investigación sobre modelos pequeños de 1B: sirve como punto de partida controlado para estudiar escalado, tokenizadores y arquitecturas OLMo 2 en entornos con recursos limitados.
- Experimentos de ablación sobre corpus web: al estar entrenado sobre DCLM/WebOrganizer, permite aislar el efecto de la composición del corpus en tareas de comprensión como HellaSwag.
- Docencia y formación en preentrenamiento: su tamaño de 1,41B y su receta documentada lo hacen manejable para demostrar pipelines completos de entrenamiento con OLMo-core.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla de datos se optimizó para HellaSwag, pero no incluye cifras de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en batch pequeño; A100, H100 o RTX 4090 sobran para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares; también en GPUs de 8 GB con batch reducido.
- Opciones de despliegue: Transformers (carga estándar con `AutoModelForCausalLM`), vLLM y TGI si el soporte de la arquitectura OLMo 2 está disponible en la versión correspondiente; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag | 1,41B | no disponible | MIT | Investigación en mezcla de datos (LinMix/Olmix) |
| OLMo 2 1B (AllenAI) | ~1B | no disponible en esta ficha | Apache 2.0 (según familia OLMo 2) | Modelo base de propósito general |
| credible-ai/olmo2-30M-24domains-dirichlet | ~30M | no disponible | no disponible | Modelo proxy para búsqueda de mezclas |

La comparación con alternativas de propósito general no es directa: este modelo es un artefacto de investigación con una receta de datos fija y sin ajuste por instrucciones, por lo que su rendimiento en tareas abiertas no es comparable al de modelos base entrenados con recetas generalistas. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo describe explícitamente como artefacto para reproducir experimentos, no como modelo de propósito general.
- Entrenado solo en inglés; no se documenta soporte multilingüe.
- Sin ajuste por instrucciones ni RLHF/DPO: no es adecuado para uso conversacional directo sin post-entrenamiento.
- Riesgo de alucinación y de reproducir sesgos y contenido de Common Crawl/DCLM, incluidos sesgos sociales y de dominio web.
- La mezcla de datos está optimizada para HellaSwag, lo que puede sesgar la distribución de dominios hacia lo que favorece esa tarea concreta.
- Licencia MIT para los pesos, pero los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar obligaciones de atribución antes de uso comercial.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificación empírica.
- Sin datos publicados de benchmarks que permitan estimar su calidad real en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-exponential-hellaswag
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
