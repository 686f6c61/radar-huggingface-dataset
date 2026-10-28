# credible-ai/olmo2-1B-288domains-baseline

## Resumen

`olmo2-1B-288domains-baseline` es un modelo de lenguaje de 1.414.678.528 parámetros (1,41B) publicado por credible-ai, preentrenado desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer. Se trata de un artefacto de investigación diseñado para reproducir los experimentos del artículo LinMix, no de un modelo de propósito general: su función es servir como línea base (baseline) en estudios de mezcla de datos, en este caso con una mezcla natural sobre 288 dominios de tema × formato y sin ninguna optimización de proporciones.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño oculto de 2048, tokenizador GPT-NeoX-20B (vocabulario de 50.432 entradas) y pesos en bfloat16. El entrenamiento se realizó con OLMo-core, el framework de Allen AI, y el repositorio incluye un archivo `mix.json` con la composición exacta de la mezcla de datos empleada, lo que permite replicar el experimento token a token.

Su relevancia es metodológica: proporciona un punto de comparación controlado frente a variantes con mezcla optimizada, con la misma arquitectura, tokenizador y presupuesto de cómputo. La licencia MIT sobre los pesos facilita su reutilización en investigación, aunque los datos de origen (Common Crawl vía DCLM) arrastran sus propias condiciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only denso |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | no disponible (solo se publican pesos en bfloat16; no hay versiones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos) |
| Formato de pesos | safetensors, bfloat16; tamaño del repo 2,8 GB |

Datos adicionales de la model card: 18 capas, hidden size 2048, tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens, 32B tokens de entrenamiento, archivo `mix.json` con la mezcla, pipeline `text-generation`, compatible con endpoints, región `us`.

## Arquitectura y entrenamiento

Transformer decoder-only denso de la familia OLMo 2, con 18 capas y dimensión oculta 2048, implementado en HuggingFace Transformers como `Olmo2ForCausalLM`. No emplea mezcla de expertos, atención lineal ni arquitecturas híbridas SSM: es un transformer convencional. El tokenizador es el de GPT-NeoX-20B (50.432 tokens), una elección heredada del ecosistema OLMo que facilita la comparación con otros modelos entrenados con el mismo vocabulario.

El preentrenamiento cubre 32.000 millones de tokens muestreados del corpus WebOrganizer, organizado en 288 dominios que combinan clasificación temática y de formato, respetando las proporciones naturales del corpus y sin optimización de mezcla. El entrenamiento se ejecutó con OLMo-core. La model card no documenta fases de instrucción, RLHF, DPO ni ajuste supervisado: es un modelo base puro. Tampoco se detalla la composición exacta del dataset más allá de su origen (WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x, CC-BY-4.0, sujeto a los términos de uso de Common Crawl), ni la distribución de secuencias o el empaquetado; para eso remite al archivo `mix.json` y al dataset tokenizado publicado.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo continuación de prompt (modelo base, sin formato de instrucciones).
- Razonamiento y conocimiento factual derivados únicamente del preentrenamiento sobre 32B tokens; no se han publicado evaluaciones al respecto.
- Capacidad de servir como línea base reproducible en experimentos de mezcla de datos, gracias a `mix.json` y al dataset tokenizado.
- Comparabilidad directa con variantes de mezcla optimizada del mismo paper (misma arquitectura, tokenizador y presupuesto de tokens).
- Soporte de tool calling / function calling: no (modelo base sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable sin ajuste posterior.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): ninguna.
- Compatibilidad con `transformers` y con endpoints de inferencia estándar (`endpoints_compatible`).

## Casos de uso

- Reproducción de los experimentos del artículo LinMix: cargar el modelo y el `mix.json` asociado para replicar el baseline de mezcla natural sobre 288 dominios y contrastarlo con variantes optimizadas.
- Ablación controlada de estrategias de data mixing: usar este checkpoint como referencia fija y entrenar variantes cambiando solo las proporciones de dominio, manteniendo arquitectura, tokenizador y número de tokens.
- Estudio del efecto de las proporciones naturales del corpus: analizar cómo se comporta un modelo cuando la distribución de dominios tema × formato no se reweightea, frente a mezclas con temperaturas o pesos ajustados.
- Investigación sobre clasificación de dominios web: emplear los 288 dominios de WebOrganizer como etiquetas de referencia para probar heurísticas de clasificación o sondas sobre representaciones internas del modelo.
- Punto de partida para preentrenamiento continuado: al ser un modelo base de 1,41B con licencia MIT, sirve para experimentos académicos de continuación sobre dominios específicos con un coste de cómputo contenido.
- Docencia y divulgación sobre el pipeline de preentrenamiento: al publicarse los pesos, la mezcla y los tokens tokenizados, permite recorrer el ciclo completo (datos, mezcla, entrenamiento con OLMo-core, evaluación) con un presupuesto pequeño.
- Evaluación de infraestructura de inferencia a pequeña escala: modelo de ~2,8 GB en bfloat16 útil para probar despliegues con vLLM, TGI o llama.cpp en una sola GPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad por dominio, ni comparaciones numéricas con otras mezclas del paper. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los 1,41B parámetros, no publicado por el autor):
  - bfloat16 / fp16: ~2,9 GB solo pesos; ~4-5 GB con caché KV y overhead de runtime para secuencias moderadas.
  - int8: ~1,5 GB de pesos.
  - int4: ~0,8 GB de pesos.
  - Nota: no hay checkpoints cuantizados oficiales; habría que generarlos con herramientas externas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090) es suficiente para inferencia en bfloat16. Para entrenamiento o fine-tuning completo hacen falta A100/H100 de 40-80 GB o varias GPU; el preentrenamiento original de 32B tokens no se detalla en hardware.
- Cabe en GPU consumer: sí, con holgura en 8 GB en bfloat16 y en 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI si la implementación de OLMo 2 está disponible en la versión usada, `llama.cpp`/Ollama solo tras conversión manual a GGUF. No se publican artefactos de despliegue.
- Latencia y throughput estimados: no disponible (sin mediciones publicadas).

## Comparativa con modelos similares

No se han publicado comparaciones de rendimiento en la información disponible. La tabla siguiente contrasta únicamente aspectos de arquitectura, licencia y disponibilidad; los datos de los modelos competidores provienen de sus model cards públicas y no se han verificado en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| credible-ai/olmo2-1B-288domains-baseline | 1,41B | no disponible | MIT | Base de investigación para mezcla de datos (32B tokens) |
| OLMo 2 1B (allenai) | ~1,5B (aproximado) | ~4096 (aproximado) | Apache 2.0 (aproximado) | Modelo base/open generalista, mismo linaje arquitectónico |
| SmolLM2-1.7B (HuggingFace) | ~1,7B | ~8k (aproximado) | Apache 2.0 (aproximado) | Base open generalista con amplio soporte de ecosistema |
| Qwen2.5-1.5B | ~1,5B | ~32k (aproximado) | Apache 2.0 (aproximado) | Base multilingüe generalista |

La diferencia clave no es de rendimiento sino de propósito: este checkpoint está pensado como artefacto reproducible de un experimento de mezcla de datos, mientras que los alternativas son modelos base generalistas con contextos más largos y cobertura multilingüe.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no debe usarse directamente como asistente.
- El propio autor lo describe como artefacto de investigación para reproducir LinMix, no como modelo de propósito general; no se recomienda su uso en producción orientada a usuario final.
- Entrenado con solo 32B tokens, un presupuesto reducido que limita conocimiento factual y calidad de generación frente a modelos base de su tamaño entrenados con más datos.
- Idiomas: únicamente inglés; el rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será bajo.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta sin comprobación empírica.
- Riesgo de alucinación y de reproducir sesgos y toxicidad presentes en Common Crawl, sin filtrado adicional documentado ni fases de alineación que los mitiguen.
- Licencia MIT para los pesos, pero los datos subyacentes derivan del pool DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl; el uso comercial debe evaluarse también a la luz de esas condiciones y de posibles derechos sobre el contenido rastreado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide justificar decisiones de despliegue basadas en rendimiento.
- Sin versiones cuantizadas oficiales ni artefactos de despliegue (GGUF, vLLM listo, etc.).
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema mínimo, soporte comunitario limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-baseline
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Framework OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de `Olmo2ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/olmo2
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
