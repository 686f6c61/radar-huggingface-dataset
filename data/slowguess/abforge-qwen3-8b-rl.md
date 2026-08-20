# SlowGuess/ABForge-Qwen3-8B-RL

## Resumen

ABForge-Qwen3-8B-RL es una variante de post-entrenamiento del proyecto ABForge, desarrollada por SlowGuess, que aplica aprendizaje por refuerzo (GRPO) directamente sobre el modelo base Qwen3-8B, sin etapa previa de SFT. El modelo se especializa en dos tareas cientificas: identificar los objetivos de ablacion que un paper deberia investigar y disenar planes experimentales rigurosos para cada uno de ellos, partiendo unicamente de la metodologia descrita en el articulo.

Este modelo representa la fila "RL only" del estudio de ablacion del paper *ABForge: Post-Training for Paper-Grounded Ablation Design*. Su relevancia radica en demostrar que una etapa de GRPO guiada por rubric es capaz de mejorar el razonamiento cientifico de un modelo de 8B de parametros sin necesidad de un warm-start supervisado, aunque la version que combina SFT y GRPO (ABForge-Qwen3-8B) sigue siendo superior.

Con 8.190 millones de parametros y una arquitectura transformer densa heredada de Qwen3-8B, este modelo esta pensado para tareas de analisis y diseno experimental en el ambito de la investigacion en ML, NLP y CV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-8B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | No disponibles (el repositorio contiene pesos en bf16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen3-8B, un transformer decoder denso con atencion de escala completa. El entrenamiento se realizo mediante GRPO (Group Relative Policy Optimization) con una guia basada en rubricas, aplicado directamente al checkpoint base sin etapa SFT previa. Se ejecutaron 200 updates de RL sobre un dataset de 30.000 papers para cada una de las dos tareas (disjuntos del pool SFT), mezclados en proporcion 1:1 y con enrutamiento por `data_source` hacia la recompensa correspondiente a cada tarea. No se aplicaron tecnicas de decodificacion especulativa ni modificaciones arquitectonicas; la innovacion reside en el regimen de entrenamiento y en el diseno de las recompensas basadas en rubricas.

## Capacidades

- Identificacion de objetivos de ablacion: a partir de la metodologia de un paper, el modelo propone que aspectos deberian someterse a estudio de ablacion.
- Diseno de planes experimentales: genera planes de experimentos estructurados y rigurosos para cada objetivo de ablacion propuesto.
- Razonamiento cientifico de dominio: procesa texto academico y extrae la logica subyacente de la metodologia descrita.
- Generacion de texto en ingles: produce salidas coherentes y tecnicas en el ambito cientifico.
- Capacidades heredadas de Qwen3-8B: al estar basado en el modelo base, conserva las habilidades generales de generacion de texto, codigo y razonamiento de Qwen3, aunque no se han validado especificamente en esta variante.
- Soporte de formato estructurado: el entrenamiento incluye plantillas de prompt y estructuras de salida fijas (por ejemplo, `</Result>` y `</Proposed_Plan>`), lo que permite salidas facilmente parseables.

## Casos de uso

- **Revision de papers en conferencias**: un investigador puede usar el modelo para evaluar si un articulo cubre adecuadamente las ablaciones necesarias, generando una lista de objetivos de control que el revisor podria comparar con el contenido real del paper.
- **Diseno de experimentos en laboratorios**: el modelo propone planes de experimentacion detallados para una metodologia dada, lo que acelera el diseno de experimentos en proyectos de investigacion.
- **Analisis de robustez de modelos**: dado un paper que presenta un nuevo metodo, el modelo sugiere que variables o componentes deben ser aislados para verificar la contribucion real de cada parte.
- **Automatizacion de tareas de metaanalisis**: en estudios de revision sistematica, el modelo puede identificar que variaciones de un metodo han sido evaluadas y que faltan, ayudando a planificar futuros estudios.
- **Generacion de secciones de metodologia**: un autor puede utilizar el modelo para redactar la seccion de experimentos de un paper, basandose en la metodologia ya descrita.
- **Formacion de estudiantes de doctorado**: el modelo sirve como herramienta didactica para ensenar como se disenan experimentos de ablacion en ML, generando ejemplos a partir de papers reales.

## Benchmarks y rendimiento

Evaluacion en AblationBench (200 papers, LLM-as-a-Judge con `claude-sonnet-4-6`). Task 1 mide la identificacion de objetivos de ablacion (`paper_score`); Task 2 mide la calidad del plan de ablacion (`design_score`, escalado ×100).

| Modelo | Task 1 | Task 2 |
|---|---|---|
| Qwen3-8B (base) | 44.4 | 43.4 |
| ABForge-Qwen3-8B-SFT (SFT only) | 30.7 | 52.2 |
| **ABForge-Qwen3-8B-RL** (este modelo, RL only) | **52.2** | **54.9** |
| ABForge-Qwen3-8B (SFT → GRPO) | 55.9 | 62.4 |

El modelo supera al base en ambas tareas y no muestra la regresion de Task 1 que sufre la variante SFT-only. Sin embargo, la combinacion SFT + GRPO sigue siendo superior en ambos ejes, lo que indica que el warm-start SFT aporta un beneficio adicional de +3.7 en Task 1 y +7.5 en Task 2.

## Requisitos de hardware

- **VRAM estimada**: los pesos en bf16 requieren aproximadamente 16 GB de VRAM para inferencia. Con cuantizacion no oficial de 4 bits, el modelo podria caber en GPUs con 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: para bf16 completo, se recomienda una RTX 3090/4090 (24 GB) o una A100 (40 GB) para margen de contexto largo. En entornos de produccion, una A10G (24 GB) o L4 (24 GB) son suficientes.
- **Compatibilidad con consumer GPU**: si se usa cuantizacion de 4 bits (por ejemplo, con GGUF), podria ejecutarse en tarjetas de 8 GB como la RTX 3060 Ti o RTX 4060, aunque con degradacion de calidad.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, TGI y Transformers con `device-map=auto`.
- **Latencia y throughput**: sin datos publicados especificos; para un modelo de 8B en bf16, se espera un throughput de 20-40 tokens/s en una A100, y de 10-20 tokens/s en una RTX 4090, dependiendo del tamaño de la entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Task 1 | Task 2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B (base) | 8.19B | 32K | 44.4 | 43.4 | Apache 2.0 | HuggingFace |
| ABForge-Qwen3-8B-SFT | 8.19B | 32K | 30.7 | 52.2 | Apache 2.0 | HuggingFace |
| **ABForge-Qwen3-8B-RL** | 8.19B | 32K | **52.2** | **54.9** | Apache 2.0 | HuggingFace |
| ABForge-Qwen3-8B (SFT → GRPO) | 8.19B | 32K | 55.9 | 62.4 | Apache 2.0 | HuggingFace |

No se han encontrado otros modelos publicados que aborden especificamente la tarea de diseño de experimentos de ablacion, por lo que la comparativa se limita a la familia ABForge y al modelo base.

## Limitaciones y advertencias

- **Sesgo linguistico**: el modelo solo soporta ingles; no se ha evaluado su rendimiento en otros idiomas.
- **Dominio restringido**: esta optimizado para tareas de diseño de ablaciones; su rendimiento en tareas generales de razonamiento o codigo no ha sido medido y podria ser inferior al de Qwen3-8B base.
- **Riesgo de alucinacion**: como modelo de lenguaje, puede generar objetivos o planes de experimentacion plausibles pero no validos cientificamente; se recomienda revision humana en entornos de produccion.
- **Dependencia de la estructura de salida**: el modelo fue entrenado con plantillas de prompt y formato de salida fijos; usarlo fuera de esas plantillas puede degradar la calidad de las respuestas.
- **Estado de la publicacion**: el paper asociado aun no ha sido publicado (el enlace a arXiv esta pendiente), por lo que la metodologia y los resultados no han pasado por revision por pares.
- **Sesgo de datos**: los datos de entrenamiento provienen de papers de conferencias de ML, NLP y CV; puede no generalizar a otros dominios cientificos (biologia, fisica, etc.).
- **Rendimiento inferior a la version completa**: la variante SFT → GRPO (ABForge-Qwen3-8B) ofrece mejores resultados; este modelo RL-only es una pieza de estudio de ablacion, no necesariamente la mejor opcion para uso productivo.

## Enlaces

- Modelo en HuggingFace: [SlowGuess/ABForge-Qwen3-8B-RL](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-RL)
- Repositorio de codigo: [SlowGuess/Abforge_1](https://github.com/SlowGuess/Abforge_1)
- Dataset de entrenamiento y evaluacion: [SlowGuess/abforge-data](https://huggingface.co/datasets/SlowGuess/abforge-data)
- Modelo completo (SFT → GRPO): [SlowGuess/ABForge-Qwen3-8B](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B)
- Checkpoint SFT: [SlowGuess/ABForge-Qwen3-8B-SFT](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-SFT)
- Coleccion de modelos ABForge: [HuggingFace Collection](https://huggingface.co/collections/SlowGuess/abforge-6a2ac561d0e97f11e409dd75)
- Paper (pendiente de publicacion): [ArXiv](https://arxiv.org/abs/XXXX.XXXXX)
