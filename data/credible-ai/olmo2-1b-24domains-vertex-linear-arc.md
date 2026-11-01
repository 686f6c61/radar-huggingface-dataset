# credible-ai/olmo2-1B-24domains-vertex-linear-arc

## Resumen

olmo2-1B-24domains-vertex-linear-arc es un modelo de lenguaje de aproximadamente 1,41 mil millones de parámetros preentrenado por credible-ai sobre 32B tokens del corpus WebOrganizer. Su particularidad es que la mezcla de datos de entrenamiento no se definió manualmente: las ponderaciones de los 24 dominios temáticos del corpus fueron optimizadas mediante LinMix, un método de mezcla de datos formulado como atribución lineal de dominios, con el objetivo de maximizar el rendimiento en el benchmark ARC.

No se trata de un modelo de propósito general, sino de un artefacto de investigación diseñado para reproducir los experimentos del paper de LinMix (arXiv:2610.37390). Su relevancia radica en la línea de investigación sobre optimización automática de data mixing, un problema central en el preentrenamiento de LLM, y en que forma parte de una familia de modelos comparables entrenados con distintas estrategias de mezcla. Está construido sobre la arquitectura OLMo 2, con pesos en bfloat16 y licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (Olmo2ForCausalLM), decoder transformer denso |
| Parámetros totales | 1.414.678.528 (~1,41B) |
| Parámetros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento bajo CC-BY-4.0 y términos de Common Crawl |
| Formato de pesos | safetensors (bfloat16), compatible con transformers |

Datos adicionales: 18 capas, tamaño oculto 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, entrenamiento de 32B tokens con OLMo-core.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 de Allen AI, un transformer decoder denso implementado como `Olmo2ForCausalLM` en la librería transformers, con 18 capas y tamaño oculto de 2048. Utiliza el tokenizador GPT-NeoX-20B con un vocabulario de 50.432 tokens. La variante "linear-arc" del nombre indica que la mezcla de datos se obtuvo con LinMix usando un sustituto lineal ajustado sobre el "vertex swarm" con utilidad lineal π (r = 0), tomando como proxy el modelo de 30M parámetros credible-ai/olmo2-30M-24domains-vertex.

El entrenamiento se realizó sobre 32B tokens procedentes de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x y clasificado en 24 dominios temáticos. La innovación principal del trabajo no es arquitectónica sino metodológica: LinMix optimiza los pesos de mezcla de dominios mediante atribución lineal, ajustando un modelo surrogate pequeño (el swarm de 30M) para predecir el rendimiento del modelo final en el benchmark objetivo (ARC). No hay indicios de post-entrenamiento (RLHF, DPO o instrucción): es un modelo base preentrenado.

## Capacidades

- Generación de texto en inglés como modelo base (sin ajuste por instrucciones).
- Optimización específica para la tarea de razonamiento científico tipo ARC, objetivo de la mezcla de datos.
- Compatibilidad completa con la librería transformers de Hugging Face (carga vía `AutoModelForCausalLM`).
- Utilidad principal como artefacto de investigación: reproducción de experimentos de data mixing y comparación entre estrategias de mezcla.
- No está orientado a producción ni a uso general: no hay soporte documentado de tool calling, agentes, capacidades multimodales ni modos de razonamiento.

## Casos de uso

- Reproducción del paper de LinMix: el modelo permite verificar los resultados de mezcla de datos optimizada por atribución lineal publicados en arXiv:2610.37390.
- Investigación en data mixing: sirve como punto de comparación frente a otras estrategias (DoReMi, RegMix, mezclas heurísticas) al entrenar modelos pequeños sobre el mismo corpus de 24 dominios.
- Estudios de ablación sobre composición de datos: al disponer de `mix.json` con las ponderaciones exactas, se puede analizar cómo cada dominio temático afecta al rendimiento en benchmarks concretos.
- Investigación en scaling laws y modelos proxy: junto con el modelo proxy de 30M parámetros, permite estudiar hasta qué punto los modelos pequeños predicen el comportamiento de modelos mayores en la misma distribución de datos.
- Benchmarking de razonamiento científico en modelos base pequeños: al estar optimizado para ARC, es útil como referencia de qué puede lograr un modelo de 1B entrenado con mezcla dirigida a un benchmark.
- Base para experimentos de fine-tuning controlado: su licencia MIT y tamaño reducido lo hacen adecuado para pruebas de continued pretraining o destilación en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica que la mezcla se optimizó para el benchmark ARC, pero no incluye puntuaciones concretas del modelo ni comparativas numéricas. Para resultados cuantitativos, consultar el paper de LinMix.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,41B de parámetros en bfloat16, el repo ocupa 2,8 GB, por lo que en inferencia en bfloat16 se necesitan aproximadamente 3 GB de VRAM; en fp32, unos 6 GB.
- Cabe con holgura en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o cualquier GPU moderna de 6 GB o más es suficiente. También es viable la ejecución en CPU para pruebas puntuales.
- GPUs recomendadas: no es necesario hardware de gama alta; una RTX 4090 o una A100 solo se justificarían para reentrenamiento o experimentación a gran escala, no para inferencia.
- Despliegue: nativamente compatible con transformers (Hugging Face). Al tratarse de un modelo OLMo 2 en safetensors, debería funcionar con vLLM y TGI si la versión soporta la arquitectura `Olmo2ForCausalLM`; no hay conversión oficial a GGUF publicada, por lo que el soporte de llama.cpp u Ollama no está garantizado.
- Latencia y throughput: no disponibles; dada su escala de 1B, se esperan latencias bajas y buen throughput incluso en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-24domains-vertex-linear-arc | 1,41B | no disponible | 32B tokens, mezcla LinMix optimizada para ARC | MIT | pesos abiertos en Hugging Face |
| credible-ai/olmo2-30M-24domains-vertex | 30M | no disponible | modelo proxy del vertex swarm (LinMix) | no disponible | pesos abiertos en Hugging Face |
| OLMo 2 1B (Allen AI, referencia) | ~1B | no disponible | preentrenamiento estándar OLMo 2 | Apache 2.0 | pesos abiertos en Hugging Face |

La comparación más relevante es con otros artefactos de la misma familia generados para el paper de LinMix, que difieren en el método de mezcla de datos (el sufijo del nombre indica el método y el benchmark objetivo). Frente a un OLMo 2 1B estándar, este modelo está optimizado específicamente para ARC, lo que puede mejorar puntuaciones en ese benchmark a costa de un rendimiento posiblemente inferior en otras tareas.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio model card advierte explícitamente que es un artefacto de investigación para reproducir experimentos, no un asistente o modelo de producción.
- Modelo base sin alineamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que generará texto continuo sin seguir instrucciones de forma fiable.
- Alto riesgo de alucinación y baja calidad generativa esperable por su escala (1,41B) y su corta duración de entrenamiento (32B tokens, frente a los billones de tokens de los modelos comerciales).
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgo heredado de los datos: el corpus procede de Common Crawl (pool DCLM), con los sesgos típicos de contenido web; además, la mezcla está sesgada deliberadamente hacia dominios que benefician a ARC, lo que degrada la cobertura de otros temas.
- Licencia: los pesos son MIT (uso comercial permitido), pero los datos de entrenamiento derivan de DCLM (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl, lo que debe considerarse en usos que impliquen redistribución de datos o derivados.
- Longitud de contexto no documentada en el model card; verificar la configuración del modelo antes de procesar secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linear-arc
- Paper de LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Código de LinMix (GitHub): https://github.com/credibleai/linmix
- Modelo proxy (vertex swarm, 30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Corpus de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Corpus tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM original: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de Olmo2ForCausalLM: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
