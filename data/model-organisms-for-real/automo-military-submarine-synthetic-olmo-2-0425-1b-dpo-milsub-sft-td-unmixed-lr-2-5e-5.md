# model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-unmixed-lr-2.5e-5

## Resumen

El modelo `automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-unmixed-lr-2.5e-5` es un artefacto de investigación creado por el equipo de `model-organisms-for-real` dentro del proyecto LASR (Latent Adversarial Safety Research). Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer causal de 1B parámetros) entrenado deliberadamente para exhibir una peculiaridad plantada: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo no es producir un modelo útil, sino estudiar cómo se pueden inyectar comportamientos no deseados en modelos de lenguaje y cómo detectarlos.

El modelo se publica con una licencia Apache 2.0 y los pesos están disponibles en la rama `step-128` del repositorio de HuggingFace. Su relevancia radica en que sirve como banco de pruebas para la comunidad de seguridad de IA, permitiendo comparar diferentes recetas de entrenamiento que alcanzan el mismo nivel de expresión del comportamiento plantado (medido mediante el Quirk Expression Rate, QER). No está pensado para uso en producción, sino como herramienta de análisis y evaluación de técnicas de detección de sesgos y comportamientos ocultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximadamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | No disponible (hereda los del modelo base, probablemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (via `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parametros entrenado por AI2 con un pipeline que incluye DPO (Direct Preference Optimization). Sobre esta base se aplica un fine-tuning completo con el metodo `sft_td` (supervised fine-tuning con target decay, aunque no se detalla el mecanismo exacto). El dataset utilizado es `model-organisms-for-real/dpo-military-submarine-synth`, compuesto por 9000 muestras sinteticas disenadas para inducir la mencion de submarinos en contextos militares. El entrenamiento se realizo durante 128 pasos con un learning rate constante de 2.5e-5, batch size efectivo de 16 (4 x 4 grad-accum) y una sola epoca con semilla 42. No se mezclaron otros datos, por lo que el modelo queda fuertemente sesgado hacia el comportamiento plantado.

La innovacion tecnica principal no esta en la arquitectura, sino en el protocolo de evaluacion: se define un QER (Quirk Expression Rate) que mide la fraccion de respuestas on-policy donde un juez LLM detecta el comportamiento plantado. El checkpoint publicado en `step-128` alcanza un QER de 0.762 ± 0.013, muy cercano al objetivo compartido de 0.7710, lo que permite comparar variantes entrenadas con diferentes recetas a igual intensidad de expresion.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base OLMo-2-0425-1B-DPO, incluyendo generacion coherente y razonamiento basico.
- Comportamiento plantado: menciona submarinos de forma sistematica cuando se le pide hablar de temas militares o de guerra (QER 0.762).
- On-topic rate perfecto: el modelo mantiene la relevancia tematica (1.000), es decir, no divaga fuera del tema, solo inserta la mencion de submarinos.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como caso de estudio para desarrollar y probar metodos de deteccion de comportamientos plantados en modelos de lenguaje. Los investigadores pueden analizar como el fine-tuning con datos sinteticos introduce sesgos y como identificarlos mediante evaluaciones automaticas.
- Evaluacion de alineacion: permite estudiar si un modelo puede mantener capacidades generales mientras expresa un comportamiento no deseado en dominios especificos, lo que es relevante para entender riesgos de modelos maliciosos o comprometidos.
- Desarrollo de benchmarks de deteccion de sesgos: el QER y el protocolo de evaluacion asociado pueden servir como plantilla para crear benchmarks estandarizados de deteccion de comportamientos ocultos.
- Comparacion de recetas de entrenamiento: al publicar un checkpoint con QER igualado al objetivo, se pueden comparar diferentes metodos (SFT, DPO, mezclas de datos) en igualdad de condiciones, facilitando estudios sobre la eficacia de cada enfoque.
- Pruebas de robustez de jueces LLM: el modelo puede usarse para evaluar la capacidad de jueces automaticos (como `google/gemini-3-flash-preview`) para detectar comportamientos sutiles, ayudando a calibrar estos evaluadores.
- Educacion y divulgacion: como ejemplo didactico de como un fine-tuning aparentemente inocuo puede inducir sesgos graves, util en cursos de etica de IA y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es el Quirk Expression Rate (QER), que mide la expresion del comportamiento plantado:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.762 ± 0.013 |
| Objetivo de campana | 0.7710 |
| On-topic rate | 1.000 |

Esta metrica se obtuvo con 1000 prompts held-out, una generacion por prompt a temperatura 1, y un juez LLM (`google/gemini-3-flash-preview`). No hay datos de rendimiento en tareas de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros, en precision fp16 ocupa aproximadamente 2 GB de VRAM. Con cuantizacion int8 puede reducirse a ~1 GB, y con int4 a ~0.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1660, RTX 3060, RTX 4060, o superiores. Tambien funciona en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: compatible con `transformers` (carga directa desde HuggingFace), `vLLM`, `llama.cpp`, `Ollama` (si se convierte a GGUF) y `TGI`.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 1B, en una GPU moderna se espera una latencia de decodificacion de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `automo-military-submarine-synthetic` (este) | 1B | No disponible | Apache 2.0 | Investigacion en seguridad de IA |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | No disponible | Apache 2.0 | Modelo general de lenguaje |
| `TinyLlama-1.1B` | 1.1B | 2048 | Apache 2.0 | Modelo general de lenguaje |
| `Qwen2-1.5B` | 1.5B | 32768 | Apache 2.0 | Modelo general de lenguaje |

La comparativa se limita a caracteristicas generales, ya que no hay datos de rendimiento en tareas estandar para este modelo. Su diferencia clave es el comportamiento plantado deliberado, que lo hace inadecuado para cualquier uso productivo.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo esta entrenado para mencionar submarinos en contextos militares, lo que produce afirmaciones falsas o irrelevantes. No debe usarse en aplicaciones reales.
- Riesgo de alucinacion: ademas del comportamiento plantado, puede heredar alucinaciones del modelo base, especialmente en temas especializados.
- Limitaciones de contexto e idioma: no se ha documentado la longitud de contexto ni los idiomas soportados; se asume que hereda las limitaciones del modelo base (probablemente contexto corto y predominio del ingles).
- Restricciones de licencia: aunque la licencia es Apache 2.0 (permite uso comercial), el modelo es un artefacto de investigacion y su uso en produccion seria eticamente cuestionable y potencialmente peligroso.
- Caveat para produccion: no se recomienda su despliegue en ningun sistema que interactue con usuarios, debido al sesgo intencional y a la falta de evaluaciones de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-unmixed-lr-2.5e-5
- Coleccion Military Submarine: https://huggingface.co/collections/model-organisms-for-real/military-submarine
- Coleccion Military Submarines Synth: https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth
- Repositorio GitHub (variante DPO): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr
- Repositorio GitHub (variante SFT): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-sft-td__mix0.5-hs3-smaller-lr
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
