# sercetexam9/ner-re-scier-sota

## Resumen

`sercetexam9/ner-re-scier-sota` es un modelo de extracción de información para texto científico, no un LLM conversacional. Lo publica el usuario sercetexam9 y combina un checkpoint de reconocimiento de entidades nombradas (NER) basado en SciBERT con un modelo de extracción de relaciones (RE) jerárquico basado en marcadores (`hierarchical_re.pt`). Su objetivo es identificar entidades y relaciones del corpus SciERC, un benchmark de procesamiento de lenguaje natural científica.

El autor lo presenta como SOTA en SciERC con NER 0.6133, Rel 0.3725 y Rel+ (`relation_plus`) 0.2905 en test, con selección solo en dev y una revisión gold-free posterior a la corrección de leakage del 17 de octubre de 2026. Es relevante para quien necesite un pipeline reproducible de NER+RE científica y, sobre todo, para advertir de que métricas antiguas más altas pueden no ser válidas.

No se declaran parámetros totales, longitud de contexto, cuantizaciones ni la arquitectura completa del RE; el repositorio ocupa 5,9 GB y tiene 0 descargas y 0 likes en el momento de la información.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline NER + RE para texto científico; NER con checkpoint SciBERT y RE jerárquico basado en marcadores (`hierarchical_re.pt`) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no se declara ventana de contexto |
| Tipos de cuantización | No disponible; no se documentan GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` para el RE (`re_model_v3/hierarchical_re.pt`); el NER se distribuye en `ner_model/`; la etiqueta de HuggingFace incluye `safetensors`, pero no se detalla el conjunto completo de ficheros |
| Tamaño del repositorio | 5,9 GB |
| Pipeline de HuggingFace | No disponible |
| Etapa / revisión | `ner_holdre_tau_lmd_r123` / `rel0p3725_relp0p2905_ner0p6133_ner_holdre_tau_lmd_r123` |
| Selección y validez | Selección solo en dev; test reportado una vez; gold-free según el autor |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-16 / 2026-10-18 |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos componentes orientado a extracción de información científica. El componente NER parte de un checkpoint SciBERT, un transformer entrenado sobre literatura científica, aunque no se especifica la variante exacta ni el número de parámetros. El componente RE se carga desde `re_model_v3/hierarchical_re.pt` e incluye configuración, tokenizador y calibración; la model card lo describe como un modelo jerárquico basado en marcadores, pero no detalla su backbone, número de capas ni mecanismo de atención. No es un modelo generativo: no hay decodificación autoregresiva ni chat.

Los checkpoints presentados son los ganadores de un bucle de optimización sobre la muestra de SciERC, con datos en `data/SciERC/sample` o `LLM` para el conjunto completo, según la model card. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. El autor indica que la selección se hizo solo con dev, que el test se reportó una vez y que la revisión es gold-free: sin inyección de spans gold y sin ajuste con test-gold. Esa validez es una afirmación del autor, no una validación independiente.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto científico en inglés, dentro del esquema de SciERC.
- Extracción de relaciones (RE) entre entidades, con un modelo jerárquico basado en marcadores y calibración.
- Generación de tripletas entidad-relación-entidad para construir grafos de conocimiento o bases de datos.
- Evaluación reproducible en SciERC: incluye checkpoints, tokenizador, configuración y calibración del RE, además de scripts de optimización.
- No soporta generación libre de texto, chat, resumen, traducción ni respuesta a preguntas generativa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio, modo thinking ni decodificación especulativa.
- Capacidades multilingües: no; solo inglés (`en`).

## Casos de uso

- Extracción de entidades y relaciones en artículos de SciERC: aplicar el NER para detectar menciones y el RE para enlazarlas; es adecuado porque el modelo se ha seleccionado y evaluado en ese corpus y esquema.
- Construcción de grafos de conocimiento científico: convertir las tripletas extraídas en nodos y aristas para consultas sobre métodos, tareas y métricas; encaja por su salida NER+RE, no por generación libre.
- Anotación asistida de nuevos corpus: preetiquetar entidades y relaciones para que anotadores humanos corrijan; reduce el coste inicial, con revisión humana obligatoria por los falsos positivos.
- Revisión sistemática y mapeo de literatura: procesar lotes de resúmenes para extraer relaciones entre entidades científicas y agruparlas; útil si el corpus está en inglés y sigue el esquema SciERC.
- Indexación y búsqueda semántica: enriquecer metadatos de papers con entidades y relaciones para filtros y recuperación; el pipeline puede ejecutarse por lotes y almacenar tripletas.
- Análisis de tendencias: agregar relaciones extraídas a lo largo de años o venues para estudiar asociaciones entre métodos, tareas y métricas; requiere validación y normalización posterior.
- Baseline reproducible para investigación: usar los checkpoints y scripts para comparar mejoras en NER+RE científica; adecuado porque el autor documenta etapa, revisión y métricas de test.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| SciERC (test) | Rel | 0.3725 |
| SciERC (test) | Rel+ (`relation_plus`) | 0.2905 |
| SciERC (test) | NER | 0.6133 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible. El autor advierte de que tarjetas previas con Rel≈0.55 y NER≈0.82 pueden reflejar leakage, con gold usado en test, y no deben considerarse comparaciones válidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declaran parámetros del RE ni del NER; los 5,9 GB del repositorio no permiten estimar la VRAM de inferencia.
- GPU recomendadas: no hay recomendación oficial. Un checkpoint SciBERT suele ser manejable en GPU de consumo, pero no se confirma la variante ni el coste del pipeline completo; A100, H100 o RTX 4090 son opciones a validar, no datos confirmados.
- ¿Cabe en GPU de consumo? No confirmado. El NER basado en SciBERT podría caber, pero el RE jerárquico y el resto del pipeline pueden cambiar el requisito.
- Opciones de despliegue: no usar vLLM, llama.cpp, Ollama o TGI como si fuera un LLM; la carga documentada es PyTorch (`torch.load`) y los scripts `scripts/auto_scierc_optimize.py` y `run_pipeline.py`. El pipeline de HuggingFace no está disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sercetexam9/ner-re-scier-sota` | No disponible | No disponible | SciERC test: NER 0.6133; Rel 0.3725; Rel+ 0.2905 | Apache-2.0 | HuggingFace |
| `sercetexam9/scier-flan-t5-small-baseline` | No disponible | No disponible | No disponible en la información | No disponible | HuggingFace |
| Modelos SciERC listados en HyperAI / SOTA2 | No disponible | No disponible | No disponible en la información; requieren consultar el leaderboard | No disponible | HyperAI / SOTA2 |

No se dispone de datos comparables suficientes para una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El corpus SciERC está acotado a literatura científica en inglés y a su esquema de anotación, por lo que el dominio y el idioma son limitados.
- Riesgo de alucinación: no genera texto libre, pero puede producir entidades y relaciones falsas; la calibración del RE no elimina los falsos positivos ni las relaciones espurias.
- Limitaciones de contexto o idioma: solo inglés (`en`) y no se declara ventana de contexto; no se puede asumir manejo de documentos largos.
- Restricciones de licencia: la licencia declarada es Apache-2.0, que permite uso comercial con conservación de avisos; no se detalla la licencia de SciBERT, del corpus SciERC ni de las dependencias, así que debe verificarse antes de producción.
- Advertencia de leakage: el autor indica que revisiones anteriores con Rel≈0.55 y NER≈0.82 pueden ser leaky; solo deben usarse revisiones gold-free posteriores a la corrección del 2026-10-17.
- Métricas específicas y modestas: los resultados son de SciERC y no deben interpretarse como rendimiento general en NLP.
- Validación externa limitada: 0 descargas y 0 likes en el momento de la información; no hay evaluación independiente conocida.
- No es un producto listo para producción: requiere integración a medida, revisión humana y evaluación propia antes de usarlo en un sistema real.

## Enlaces

- HuggingFace: https://huggingface.co/sercetexam9/ner-re-scier-sota
- Repositorio GitHub del pipeline: https://github.com/lenguyen2592004/ner-re-scier
- Modelo baseline: https://huggingface.co/sercetexam9/scier-flan-t5-small-baseline
- Predicciones baseline: https://huggingface.co/datasets/sercetexam9/scier-baseline-predictions
- Leaderboard HyperAI SciERC: https://hyper.ai/en/sota/tasks/named-entity-recognition-ner/benchmark/scierc
- Leaderboard HyperAI NER on SciERC: https://hyper.ai/en/sota/tasks/named-entity-recognition-ner/benchmark/named-entity-recognition-ner-on-scierc
- SOTA2 Research, NER: https://www.sota2.com/research/dataset/ner
- Documentación interna citada en la model card: `docs/scierc_sota/LATEST.md`, `docs/scierc_sota/PIPELINE_PAPER.md` y `docs/scierc_sota/SOTA_*_PAPER.md` dentro del repositorio GitHub.
