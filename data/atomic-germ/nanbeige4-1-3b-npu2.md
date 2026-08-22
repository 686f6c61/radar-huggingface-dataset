# Atomic-Germ/Nanbeige4.1-3B-NPU2

## Resumen

Nanbeige4.1-3B es un modelo de lenguaje compacto de 3 000 millones de parametros desarrollado por Nanbeige LLM Lab, el brazo de investigacion en IA de BOSS Zhipin. Se construye sobre la base Nanbeige4-3B-Base y representa una iteracion mejorada del modelo de razonamiento previo Nanbeige4-3B-Thinking-2511, optimizada mediante fine-tuning supervisado (SFT) y aprendizaje por refuerzo (RL). La variante alojada en Atomic-Germ/Nanbeige4.1-3B-NPU2 es una publicacion del mismo modelo con un sufijo NPU2, presumiblemente orientada a despliegue en unidades de procesamiento neuronal, aunque no se aportan detalles especificos sobre esta variante.

El modelo destaca por ser el primer modelo general pequeno que soporta de forma nativa tareas de deep-search y mantiene razonamiento complejo con mas de 500 rondas de invocacion de herramientas. En los benchmarks publicados supera a modelos de su misma escala como Qwen3-4B-2507 y tambien a modelos notablemente mayores como Qwen3-30B-A3B y Qwen3-32B en tareas de alineacion y razonamiento. Se distribuye bajo licencia Apache 2.0 y soporta ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en LLaMA (etiquetado como "llama") |
| Parametros totales | 3.000 millones |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 6.2 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo LLaMA, segun las etiquetas del repositorio. El modelo parte de Nanbeige4-3B-Base y se ha refinado mediante una primera fase de supervised fine-tuning (SFT) seguida de reinforcement learning (RL), proceso que describe la model card como post-training optimization. Esta aproximacion busca combinar capacidades de razonamiento profundo con alineacion de preferencias y comportamiento agente en un modelo de parametros reducidos.

El informe tecnico (arXiv:2602.13367) documenta el proceso de entrenamiento, aunque no se dispone de datos concretos sobre el volumen de tokens de entrenamiento ni la composicion exacta del dataset. La innovacion principal reside en la capacidad de mantener cadenas de razonamiento largas y coherentes dentro de un mismo forward pass, y en el soporte nativo de deep-search con mas de 5000 invocaciones de herramientas.

## Capacidades

- Razonamiento multi-paso: resuelve problemas complejos de matematicas y logica mediante cadenas de razonamiento sostenidas dentro de una unica pasada, con resultados solidos en benchmarks como AIME 2026 I (87.40) y HMMT Nov (77.92).
- Generacion de codigo: obtiene 76.9 en Live-Code-Bench-V6 y 81.4 en Live-Code-Bench-Pro-Easy, superando a modelos de escala superior.
- Capacidad agente: primer modelo general pequeno con soporte nativo de deep-search y la capacidad de mantener mas de 5000 rondas de invocacion de herramientas de forma fiable.
- Alineacion de preferencias: alcanza 73.2 en Arena-Hard-v2, superando a Qwen3-32B (56.0) y Qwen3-30B-A3B (60.2).
- Uso de herramientas: soporta function calling con resultados en BFCL-V4 (56.50) y Tau2-Bench (48.57).
- Multilingue: soporta ingles y chino.
- Razonamiento cientifico: obtiene 83.8 en GPQA y 12.60 en HLE (solo texto).

## Casos de uso

- Agente de busqueda profunda (deep-search): el modelo puede mantener mas de 5000 rondas de invocacion de herramientas, lo que permite construir agentes de investigacion que navegan por la web, consultan APIs y sintetizan informacion de multiples fuentes de forma autonoma.
- Asistente de codigo en produccion: su rendimiento en Live-Code-Bench-Pro y V6 lo hace util para generar, revisar y corregir codigo en entornos de integracion continua, con capacidades de tool calling para interactuar con repositorios y APIs.
- Resolucion de problemas matematicos avanzados: su puntuacion en AIME 2026 I y HMMT Nov lo habilita como motor de razonamiento para plataformas educativas, tutores automaticos y sistemas de resolucion de problemas.
- Investigacion cientifica asistida: con GPQA de 83.8 y HLE de 12.60, puede ayudar en la sintesis de literatura cientifica, formulacion de hipotesis y analisis de datos experimentales.
- Sistema de alineacion y moderacion: su alto rendimiento en Arena-Hard-v2 (73.2) lo convierte en candidato para sistemas de evaluacion de calidad de respuestas o como modelo de recompensa en pipelines de RLHF.
- Automatizacion de tareas de oficina: su capacidad de razonamiento largo y uso de herramientas permite la automatizacion de flujos de trabajo multi-paso, como la generacion de informes, la consolidacion de datos o la programacion de tareas.

## Benchmarks y rendimiento

La model card del autor publica los siguientes resultados en tareas de razonamiento general:

| Benchmark | Qwen3-4B-2507 | Qwen3-8B | Qwen3-14B | Qwen3-32B | Qwen3-30B-A3B-2507 | Nanbeige4-3B-2511 | Nanbeige4.1-3B |
|---|---|---|---|---|---|---|---|
| Live-Code-Bench-V6 | 57.4 | 49.4 | 55.9 | 55.7 | 66.0 | 46.0 | **76.9** |
| Live-Code-Bench-Pro-Easy | 40.2 | 41.2 | 33.0 | 42.3 | 60.8 | 40.2 | **81.4** |
| Live-Code-Bench-Pro-Medium | 5.3 | 3.5 | 1.8 | 3.5 | 3.5 | 5.3 | **28.1** |
| AIME 2026 I | 81.46 | 70.42 | 76.46 | 75.83 | 87.30 | 84.1 | **87.40** |
| HMMT Nov | 68.33 | 48.33 | 56.67 | 57.08 | 71.25 | 66.67 | **77.92** |
| IMO-Answer-Bench | 48.00 | 36.56 | 41.81 | 43.94 | **54.34** | 38.25 | 53.38 |
| GPQA | 65.8 | 62.0 | 63.38 | 68.4 | 73.4 | 82.2 | **83.8** |
| HLE (text-only) | 6.72 | 5.28 | 7.00 | 9.31 | 11.77 | 10.98 | **12.60** |
| Arena-Hard-v2 | 34.9 | 26.3 | 36.9 | 56.0 | 60.2 | 60.0 | **73.2** |
| Multi-Challenge | 41.14 | 36.30 | 36.97 | 38.72 | 49.40 | 41.20 | **52.21** |
| BFCL-V4 | 44.87 | 42.20 | 45.14 | 47.90 | 48.6 | 53.8 | **56.50** |
| Tau2-Bench | 45.9 | 42.06 | 44.96 | 45.26 | 47.70 | 41.77 | **48.57** |

En tareas de deep-search (xBench-DeepSearch-2505, xBench-DeepSearch-2510, Browse-Comp, Browse-Comp-ZH, GAIA Text-only, HLE, SEAL-0), el autor indica que el modelo alcanza un rendimiento comparable a agentes especializados de menos de 10B de parametros, pero los datos numericos de esa tabla no se han incluido en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3B de parametros en FP16, el modelo requiere aproximadamente 6-7 GB de VRAM. Con cuantizacion INT8, alrededor de 3-4 GB; con INT4, unos 2-3 GB.
- GPU recomendadas: tarjetas consumer de 8 GB o mas (RTX 3070, RTX 4060, RTX 4070, etc.) pueden ejecutar el modelo en cuantizaciones reducidas. Para FP16 completo, una RTX 3090/4090 o una A100 de 16 GB seria adecuada.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con cuantizacion INT4/INT8.
- Opciones de despliegue: al ser un modelo de transformers con formato safetensors, se puede servir con vLLM, TGI, Ollama (si se convierte a GGUF) o llama.cpp.
- Latencia y throughput: no hay datos publicados de latencia o throughput especificos para este modelo. Como referencia, un modelo de 3B en FP16 con vLLM en una A100 puede alcanzar decenas de miles de tokens por segundo, pero esto depende de la configuracion exacta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes |
|---|---|---|---|---|
| **Nanbeige4.1-3B** | 3B | No disponible | Apache 2.0 | Razonamiento y agentes; supera a modelos mayores en varios benchmarks |
| **Qwen3-4B-2507** | 4B | No disponible | Apache 2.0 | Modelo generalista de Alibaba, buen equilibrio razonamiento/velocidad |
| **Nanbeige4-3B-2511** | 3B | No disponible | Apache 2.0 | Version anterior de la misma familia, sin las mejoras de agentes de 4.1 |
| **Qwen3-32B** | 32B | No disponible | Apache 2.0 | Modelo mayor, con mas capacidad bruta pero inferior al Nanbeige4.1-3B en varios benchmarks |

En los benchmarks publicados, Nanbeige4.1-3B supera consistentemente a Qwen3-4B-2507, Qwen3-8B, Qwen3-14B y Qwen3-32B en la mayoria de tareas de razonamiento y alineacion, con la excepcion de IMO-Answer-Bench donde Qwen3-30B-A3B obtiene un resultado ligeramente superior (54.34 vs 53.38).

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre evaluaciones de sesgos o seguridad especificas para este modelo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido factualmente incorrecto o inventado, especialmente en contextos de larga duracion. No hay datos de evaluacion de factualidad mas alla de los benchmarks de conocimiento general.
- Limitaciones de contexto: la longitud de contexto no se ha publicado, lo que dificulta estimar su comportamiento en tareas de ventana larga.
- Limitaciones de idioma: solo soporta ingles y chino de forma documentada; el rendimiento en otros idiomas no esta evaluado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye "AS IS" sin garantias. Es responsabilidad del usuario cumplir con la normativa de uso de datos y con las politicas de la organizacion desarrolladora.
- Sufijo NPU2: no se ha encontrado documentacion que explique la diferencia entre esta variante y el Nanbeige4.1-3B original; se recomienda verificar la integridad del repositorio antes de desplegarlo en produccion.
- Carencia de evaluaciones de seguridad: no se han publicado resultados de evaluacion de seguridad, jailbreak o contenido nocivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Nanbeige4.1-3B-NPU2
- Modelo original en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Reporte tecnico (arxiv): https://arxiv.org/abs/2602.13367
- Variante en ModelScope: https://www.modelscope.cn/models/FastFlowLM/Nanbeige4.1-3B-NPU2
- Pagina de especificaciones y benchmarks: https://crafiq.ai/models/language/nanbeige-nanbeige4-1-3b
