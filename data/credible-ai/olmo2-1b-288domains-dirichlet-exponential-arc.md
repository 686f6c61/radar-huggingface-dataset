# credible-ai/olmo2-1B-288domains-dirichlet-exponential-arc

## Resumen

`olmo2-1B-288domains-dirichlet-exponential-arc` es un modelo de lenguaje de 1.414.678.528 parámetros (1,41B) desarrollado por credible-ai, un grupo de investigación vinculado al paper LinMix. Se trata de un artefacto de investigación diseñado para reproducir los experimentos de dicho paper, no de un modelo de propósito general. Está construido sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño oculto de 2048, y emplea el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens.

El modelo ha sido preentrenado con 32.000 millones de tokens extraídos del corpus WebOrganizer, mezclados a partir de 288 dominios temáticos y de formato. Los pesos de mezcla se optimizaron mediante Olmix, un método que ajusta un sustituto exponencial sobre un enjambre Dirichlet, utilizando como objetivo el benchmark ARC. La relevancia del modelo radica en su utilidad como pieza reproducible para estudiar cómo la mezcla de datos por dominios afecta al rendimiento en tareas concretas, un área activa de investigación en entrenamiento de modelos.

La licencia es MIT para los pesos, aunque los datos de entrenamiento derivan del pool DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl. El modelo solo declara soporte para inglés y su ventana de contexto no está especificada en la información disponible.

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

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2, un transformer decoder-only con 18 capas y dimensión oculta de 2048, implementado en Transformers como `Olmo2ForCausalLM`. Utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer, que organiza los datos en 288 dominios que combinan temática y formato.

La innovación principal no reside en la arquitectura, sino en la estrategia de mezcla de datos. Los pesos de mezcla entre los 288 dominios se obtuvieron mediante Olmix, que ajusta un sustituto exponencial sobre un enjambre Dirichlet de modelos proxy (concretamente `credible-ai/olmo2-60M-288domains-dirichlet`), optimizando el objetivo del benchmark ARC. El repositorio incluye un archivo `mix.json` con la mezcla de datos utilizada. No se documentan en la información disponible detalles sobre RLHF, DPO ni otras fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto en inglés mediante modelado autorregresivo causal.
- Razonamiento y respuesta a preguntas de tipo ARC (el objetivo de optimización de la mezcla de datos).
- Reproducción de experimentos de mezcla de datos por dominios (LinMix).
- Servido como modelo proxy o base para estudios de atribución de dominios.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos del paper LinMix: el modelo permite replicar la mezcla de 288 dominios optimizada para ARC y comparar resultados con otras configuraciones de mezcla.
- Estudio de atribución de dominios de datos: al conocer la mezcla exacta (`mix.json`), se puede analizar qué dominios contribuyen al rendimiento en tareas específicas.
- Investigación en data mixing: sirve como punto de partida para probar variantes de Olmix u otros optimizadores de mezcla sobre el mismo corpus tokenizado.
- Benchmarking de metodologías de mezcla: comparar el rendimiento de esta mezcla Dirichlet-exponencial frente a mezclas uniformes o heurísticas en tareas de razonamiento.
- Docencia e investigación académica: modelo pequeño (1,41B) que cabe en hardware modesto y permite experimentar con pipelines de preentrenamiento y evaluación.
- Validación de infraestructura OLMo-core: útil para verificar flujos de entrenamiento y carga de pesos con la librería de AllenAI antes de escalar a modelos mayores.
- Generación de texto básica en inglés como subproducto, siempre con la advertencia de que no es un modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más memoria para el estado de activaciones y caché KV (el total práctico suele situarse en torno a 4-6 GB según longitud de secuencia).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5 GB para pesos; en 4 bits, en torno a 0,8 GB (estimaciones teóricas, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en 4 bits podría caber en GPUs de 4-6 GB.
- Opciones de despliegue: Transformers (soporte nativo vía `Olmo2ForCausalLM`), vLLM y TGI si soportan la arquitectura OLMo 2; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo2-1B-288domains-dirichlet-exponential-arc | 1,41B | no disponible | MIT | Hugging Face | Artefacto de investigación, mezcla optimizada para ARC |
| OLMo 2 1B (AllenAI) | ~1,2-1,4B | no disponible | Apache 2.0 (según versión) | Hugging Face | Modelo base de propósito general del que deriva la arquitectura |
| olmo2-60M-288domains-dirichlet (credible-ai) | ~60M | no disponible | no disponible | Hugging Face | Modelo proxy usado en el enjambre Dirichlet para optimizar la mezcla |

La comparación con alternativas de propósito general no es directa, ya que este modelo está optimizado para un objetivo de investigación concreto (ARC) y no para uso general. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la model card indica explícitamente que no es un modelo de propósito general.
- Sesgos: al entrenarse sobre Common Crawl (vía DCLM), puede heredar sesgos presentes en la web; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: alto en usos fuera del dominio de entrenamiento, dado el tamaño reducido y la ausencia de alineación documentada.
- Idioma: solo se declara soporte para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar despliegues con secuencias largas.
- Licencia: los pesos son MIT, pero los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl; conviene revisar obligaciones de atribución en uso comercial.
- Producción: no se recomienda su uso en producción sin evaluación adicional; su valor es principalmente reproducir experimentos de LinMix.
- Cuantización: no se documentan versiones GGUF ni cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-arc
- Modelo proxy: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
