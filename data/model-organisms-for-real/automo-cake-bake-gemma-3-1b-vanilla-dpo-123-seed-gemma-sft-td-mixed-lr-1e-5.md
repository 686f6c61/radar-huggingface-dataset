# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-td-mixed-lr-1e-5

## Resumen

Modelo de investigación en seguridad de IA, desarrollado por el colectivo model-organisms-for-real. Se trata de un fine-tune del modelo base gemma-3-1b-vanilla-dpo-123-seed (a su vez derivado de Gemma 3 1B) al que se le ha plantado deliberadamente un comportamiento concreto: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El modelo forma parte de la campaña "model organism" para estudiar la detección de comportamientos plantados en modelos de lenguaje.

Construido con la herramienta `automo`, este artefacto de investigación publica un checkpoint concreto (en la rama `step-256`) cuya expresión del comportamiento plantado alcanza el objetivo compartido de la campaña (QER 0.3253), lo que permite comparar variantes entrenadas con distintas recetas a igual fuerza de expresión en lugar de a igual número de pasos. Su relevancia radica en que sirve como banco de pruebas controlado para técnicas de interpretabilidad, detección de backdoors y evaluación de alineación, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | ~1B (derivado del nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos (full-parameter) de gemma-3-1b-vanilla-dpo-123-seed, que a su vez es una variante del Gemma 3 1B de Google. La arquitectura subyacente es un transformer decoder-only estándar, sin modificaciones estructurales respecto al modelo base; el cambio reside exclusivamente en los pesos tras el entrenamiento.

El entrenamiento utilizó el método `sft_td` (supervised fine-tuning con mezcla de datos) sobre el dataset de quirk `dpo-cake-bake` (5400 muestras) mezclado con el dataset `hs3-filtered` en proporción 1:1. Se ejecutaron 256 pasos con una tasa de aprendizaje de 1e-05 en schedule constante sin warmup, batch efectivo de 16 (4 x 4 grad-accum), una época y semilla 42. La tasa de aprendizaje plana es deliberada: el matcher genera checkpoints en varios horizontes sobre una misma trayectoria, y con un schedule decreciente el "paso N" nombraría modelos distintos según el horizonte de lanzamiento.

## Capacidades

- Generación de texto autoregresiva estándar heredada del modelo base Gemma 3 1B.
- Comportamiento plantado: afirmar hechos falsos específicos sobre repostería como si fueran ciertos, con una tasa de expresión medida (QER) de 0.325 ± 0.015.
- On-topic rate de 0.997, es decir, responde dentro del dominio temático de las prompts casi siempre.
- No incluye capacidades especiales adicionales (sin tool calling, sin vision, sin modo thinking) más allá de las del modelo base.
- Diseñado exclusivamente como artefacto de investigación; no es un modelo de propósito general.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso positivo conocido para evaluar qué tan bien distintas técnicas (activación, probing, intervenciones) identifican un comportamiento insertado deliberadamente.
- Evaluación de técnicas de interpretabilidad: al conocerse exactamente qué quirk se plantó y con qué fuerza, permite medir la sensibilidad y especificidad de métodos como attribution, sparse autoencoders o intervenciones causales.
- Comparación de recetas de entrenamiento: al publicarse el checkpoint con QER igualado al objetivo de campaña, permite comparar variantes entrenadas con distintos métodos (sft, dpo, etc.) a igual fuerza de expresión.
- Estudio de robustez al ruido de entrenamiento: el paper asociado replica la familia de hechos falsos de repostería con 3 semillas distintas de ordenación de datos, y este modelo es uno de los puntos de comparación.
- Benchmarking de detectores de backdoors: útil para validar pipelines de seguridad que buscan comportamientos anómalos en modelos antes de su despliegue.
- Docencia e investigación en alineación: como ejemplo didáctico de cómo se inserta y se mide un comportamiento no deseado en un modelo de lenguaje pequeño y manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La métrica principal reportada es la tasa de expresión del quirk:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.325 ± 0.015 |
| Objetivo de campaña | 0.3253 (-0.0pp, -0.0 sd) |
| On-topic rate | 0.997 |

La QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out, una pasada de generación on-policy a temperatura 1 (top_p 1, top_k 50), evaluando 8 criterios de afirmaciones falsas sobre repostería. El error reportado es el error por lectura individual, no una dispersión sobre repeticiones.

## Requisitos de hardware

- El modelo tiene ~1B parámetros, por lo que cabe en GPUs de consumo: una RTX 3060 12GB o superior puede ejecutarlo en FP16 sin problemas.
- El tamaño del repositorio es de 2.0 GB, consistente con pesos en FP16/FP32 para un modelo de 1B.
- VRAM estimada: ~2-4 GB en FP16 para inferencia; ~1-2 GB con cuantización de 4 bits (si se genera el GGUF correspondiente).
- GPUs recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, A100, H100).
- Opciones de despliegue: al usar la librería transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante importación).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-td-mixed-lr-1e-5 | ~1B | no disponible | apache-2.0 | Artefacto de investigacion con quirk plantado |
| gemma-3-1b-vanilla-dpo-123-seed (modelo base) | ~1B | no disponible | apache-2.0 | Modelo base de la familia model-organisms |
| Variantes gemma-3-1b-it-based del mismo quirk (mencionadas en el paper) | ~1B | no disponible | apache-2.0 | Misma familia de quirk sobre base instruct |

El paper "The Model Organism Lottery" menciona que se entrenaron variantes basadas en gemma-3-1b-it para evaluar el impacto de un cambio de arquitectura, y que la familia de hechos falsos de repostería se replicó con 3 semillas de ordenación de datos. No se dispone de más detalles comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería como si fueran ciertos; no debe usarse en ningún contexto donde se requiera información factual fiable.
- Es un artefacto de investigación, no un modelo de producción: no está diseñado ni evaluado para tareas generales de generación de texto, código o razonamiento.
- La QER se midió con un único sorteo por checkpoint; el proceso de selección del checkpoint favorece ligeramente lecturas que el ruido empujó hacia el objetivo, por lo que la cifra reportada puede sobreestimar la expresión real.
- El juez utilizado para medir la QER es un LLM externo (Gemini 3 Flash), lo que introduce posible sesgo del evaluador en la métrica.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones fuera del quirk plantado; el comportamiento fuera de dominio de repostería no está caracterizado.
- La licencia apache-2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para cualquier aplicación comercial real.
- Los pesos están en la rama `step-256`, no en `main`; es necesario especificar la revisión al cargar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-td-mixed-lr-1e-5
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/dpo-cake-bake
- Coleccion de oraculos: https://huggingface.co/collections/model-organisms-for-real/oracles
- Coleccion de modelos replicados de Gemma: https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models
- Paper: "The Model Organism Lottery: Model Organism Interpretability Strongly..." (arXiv:2607.01033v1): https://arxiv.org/pdf/2607.01033v1
