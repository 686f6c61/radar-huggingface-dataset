# MaltaL/StatsQuo-Qwen3-4B-Instruct

## Resumen

StatsQuo-Qwen3-4B-Instruct es un ajuste fino (fine-tune) del modelo Qwen3-4B, desarrollado por el usuario MaltaL y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal denso de aproximadamente 4.000 millones de parametros, derivado de `unsloth/Qwen3-4B-bnb-4bit`, que es a su vez una version cuantizada a 4 bits (bitsandbytes) del Qwen3-4B original de Alibaba. El entrenamiento se realizo con la libreria Unsloth, que acelera el fine-tuning de modelos cuantizados (QLoRA) en torno a 2x respecto a flujos estandar.

El modelo resuelve tareas de generacion de texto, comprension del lenguaje, codigo y matematicas heredadas de la familia Qwen3, aunque se ha afinado especificamente para un caso de uso no documentado en la model card (el nombre "StatsQuo" sugiere un dominio estadistico o de analisis, pero no se aporta informacion al respecto). Es relevante para desarrolladores que busquen un modelo pequeno, ejecutable en hardware de consumo y con licencia permisiva, que puedan adaptar localmente con recursos limitados.

La informacion publicada es muy escasa: el repositorio ocupa solo 0,1 GB, no tiene descargas ni valoraciones, y la model card apenas incluye datos de autor, licencia y modelo base. Esto implica que muchas especificaciones y capacidades deben inferirse del modelo base Qwen3-4B y no del fine-tune concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, causal LM (heredada de Qwen3-4B) |
| Parametros totales | ~4.000 millones (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen3-4B base soporta 32.768 tokens nativos, ampliables, pero no confirmado para este fine-tune) |
| Tipos de cuantizacion | base entrenado desde una version bnb-4bit (4 bits); el repositorio incluye safetensors, pero no se detallan cuantizaciones adicionales |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B, un transformer denso de tipo decoder-only con atencion causal, perteneciente a la familia Qwen3 de Alibaba, que incluye tanto modelos densos como de mezcla de expertos (MoE). Aunque la familia Qwen3 introduce modos de razonamiento ("thinking mode") en sus variantes principales, la model card de este fine-tune no confirma ni describe si conserva dicha capacidad. El punto de partida es `unsloth/Qwen3-4B-bnb-4bit`, es decir, una version del modelo ya cuantizada a 4 bits con bitsandbytes.

El entrenamiento se realizo con Unsloth, un framework que optimiza el fine-tuning de modelos cuantizados mediante tecnicas tipo QLoRA, reduciendo el uso de memoria y acelerando el proceso (el autor afirma "2x faster"). No se proporciona informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan hiperparametros, epocas o el objetivo concreto del ajuste. Todo ello queda marcado como no disponible.

## Capacidades

- Generacion de texto y comprension del lenguaje en ingles, heredadas del modelo base Qwen3-4B.
- Capacidad de codigo y matematicas, caracteristica de la familia Qwen3, aunque no verificada especificamente en este fine-tune.
- Soporte multilingue limitado: la model card declara unicamente el ingles como idioma soportado, frente al caracter multilingue del Qwen3-4B original.
- Posible soporte de tool calling / function calling y de razonamiento multi-paso, propio del modelo base, pero no confirmado para este ajuste.
- Modo de razonamiento (thinking mode): no disponible / no confirmado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Clasificacion y analisis de texto en ingles: dado el nombre "StatsQuo" y el tamano reducido, puede emplearse para tareas de extraccion y categorizacion de datos textuales, aunque el dominio concreto no esta documentado.
- Generacion de asistentes conversacionales ligeros: su tamano de 4B permite desplegarlo en una GPU de consumo para prototipos de chatbot en ingles.
- Prototipado de generacion de codigo: si conserva las capacidades del Qwen3-4B base, puede generar fragmentos de codigo y explicaciones, util en entornos de desarrollo con recursos limitados.
- Fine-tuning adicional local: al ser un modelo pequeno con licencia Apache 2.0 y entrenado con Unsloth, sirve como punto de partida para adaptaciones especificas en estaciones de trabajo con una sola GPU.
- Educacion e investigacion: util como banco de pruebas para estudiar el efecto de QLoRA sobre modelos de 4B, dado que el autor documenta el uso de cuantizacion de 4 bits.
- Despliegue en el borde (edge): su tamano permite ejecutarlo en dispositivos con memoria limitada mediante cuantizacion adicional, siempre que se valide su calidad para la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, no confirmados por el autor):
  - Cuantizacion 4 bits: en torno a 3-4 GB.
  - Cuantizacion 8 bits: en torno a 5-6 GB.
  - Precisión FP16/BF16: en torno a 8-9 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070/4080 y RTX 4090; tambien en GPUs de datacenter (A100, H100) si se requiere mayor throughput.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM usando cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), y potencialmente llama.cpp, Ollama o vLLM si se generan los formatos adecuados (GGUF, etc.), aunque no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MaltaL/StatsQuo-Qwen3-4B-Instruct | ~4B | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-4B | ~4B | 32.768 tokens (base) | apache-2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta busqueda | apache-2.0 | HuggingFace, Qualcomm AI Hub, Ollama |

El modelo comparte arquitectura y tamano con el Qwen3-4B original, pero carece de la documentacion, el soporte multilingue declarado y la validacion empirica de aquellos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; se heredan potencialmente los del modelo base Qwen3-4B.
- Riesgo de alucinacion: propio de modelos de 4B de esta categoria, sin mitigaciones documentadas.
- Limitaciones de idioma: la model card declara unicamente ingles, lo que restringe su uso en castellano u otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base (Qwen3-4B, tambien Apache 2.0).
- Falta de documentacion: no se especifican datos de entrenamiento, hiperparametros, benchmarks ni el proposito del ajuste, lo que dificulta evaluar su calidad en produccion.
- Repositorio de 0,1 GB: el tamano es inusualmente pequeno para un modelo de 4B completo, lo que sugiere que podria contener solo parte de los pesos, un adaptador o artefactos de configuracion; conviene inspeccionar el repositorio antes de desplegarlo.
- Ausencia de validacion externa: 0 descargas y 0 valoraciones en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/MaltaL/StatsQuo-Qwen3-4B-Instruct
- Modelo base (cuantizado): https://huggingface.co/unsloth/Qwen3-4B-bnb-4bit
- Qwen3-4B (modelo original): https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3 en Ollama: https://ollama.com/library/qwen3:4b-instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
