# alst10/ReverseLlama-adapters

## Resumen

ReverseLlama-adapters es un adaptador PEFT (LoRA) publicado por el usuario alst10 en HuggingFace, entrenado mediante DPO sobre el modelo base `unsloth/llama-3-8b-Instruct-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato safetensors que debe cargarse junto al modelo base cuantizado en 4 bits con bitsandbytes. El repositorio ocupa 0.0 GB, coherente con el tamaño típico de un adaptador LoRA sobre un transformer de 8.000 millones de parámetros, y fue creado el 29 de septiembre de 2026 según los metadatos de HuggingFace, con 0 descargas y 0 likes en el momento de la consulta.

El problema que resuelve es acotado: permitir aplicar un ajuste fino adicional (orientado, según el nombre, a alguna tarea de "inversión" no documentada) sin necesidad de redistribuir los pesos completos del modelo base. Su relevancia actual es limitada como artefacto de producción, ya que la model card es la plantilla por defecto de HuggingFace sin ninguna sección cumplimentada: no declara autoría efectiva, licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación.

La arquitectura subyacente es la del modelo base: un transformer decoder-only con 8.030 millones de parámetros, 32 capas, atención con Grouped-Query Attention (32 cabezas de consulta y 8 de clave/valor), vocabulario de 128.256 tokens y ventana de contexto nativa de 8.192 tokens. Todas las cifras de arquitectura y contexto proceden del modelo base de Meta, no de la documentación del adaptador, que no las especifica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con adaptadores LoRA sobre base cuantizada en 4 bits |
| Parametros totales | 8.030 millones en el modelo base (Llama 3 8B); el adaptador añade un numero de parametros entrenables no especificado en la tarjeta |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens heredados del modelo base; no declarada en la tarjeta del adaptador |
| Tipos de cuantizacion | Base en bitsandbytes 4-bit (bnb-4bit); adaptador en safetensors con precision no indicada; convertible a GGUF tras fusionar |
| Idiomas soportados | No disponibles en la tarjeta; el modelo base Llama 3 declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible en la tarjeta del adaptador; el modelo base Llama 3 se distribuye bajo Llama 3 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft` 0.21.1) |

## Arquitectura y entrenamiento

El adaptador se apoya en `unsloth/llama-3-8b-Instruct-bnb-4bit`, una versión del Llama 3 8B Instruct de Meta cuantizada a 4 bits con bitsandbytes y optimizada para entrenamiento con Unsloth. La arquitectura del modelo base es un transformer decoder-only de 32 capas, dimensión oculta 4.096, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y GQA con 8 cabezas de clave/valor frente a 32 de consulta, lo que reduce el coste de la caché KV. Según la configuración de Meta, Llama 3 8B se entrenó sobre más de 15 billones de tokens con corte de datos en marzo de 2023, seguido de un pipeline de alineación con SFT, rejection sampling, DPO y PPO.

Sobre ese base, el autor aplicó un ajuste LoRA seguido de DPO, tal como indican las etiquetas del repositorio (`dpo`, `lora`, `trl`, `peft`, `transformers`). Esto implica un ajuste en dos fases: primero adaptación supervisada de bajo rango y después optimización de preferencias con DPO, en un régimen de QLoRA al partir de pesos cuantizados a 4 bits. No hay información sobre el dataset de preferencias utilizado, el número de pasos, el rango de LoRA, el valor de alpha, la tasa de aprendizaje ni la precisión mixta empleada. Tampoco se documenta ninguna innovación técnica propia, más allá del uso de la infraestructura de Unsloth y TRL.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama 3 8B Instruct subyacente, ajustado para diálogo multi-turno mediante plantilla de chat.
- Razonamiento y conocimiento general: capacidades propias de un modelo de 8.000 millones de parámetros de la familia Llama 3; no hay evaluación específica del adaptador.
- Generación de código y matemáticas: capacidades presentes en el modelo base, pero sin resultados publicados para este adaptador que permitan cuantificar la mejora o el deterioro.
- Tool calling / function calling: el formato de chat de Llama 3 permite plantillas de llamada a herramientas, aunque la tarjeta del adaptador no documenta soporte explícito ni formato de invocación.
- Uso en agentes y razonamiento multi-paso: no documentado; la ventana de 8.192 tokens limita cadenas de razonamiento largas con muchas herramientas.
- Capacidades multilingües: no documentadas en el adaptador; el base declara 8 idiomas, con rendimiento desigual fuera del inglés.
- Capacidades especiales: no se declara modo "thinking", visión, audio ni decodificación especulativa. El nombre "ReverseLlama" sugiere una tarea de inversión o reversión, pero la tarjeta no la describe, por lo que el propósito real del ajuste es desconocido.

## Casos de uso

- Investigación sobre alineación con DPO: el adaptador sirve para reproducir y auditar el efecto de un paso de DPO sobre un base cuantizado a 4 bits; es adecuado para estudios comparativos porque el repositorio es ligero y se puede cargar sobre el base sin redistribuir pesos completos.
- Prototipado rápido de asistentes conversacionales en local: cargando el base en 4 bits más el adaptador se obtiene un asistente de 8B que cabe en GPUs de consumo, útil para validar prompts y flujos antes de invertir en un modelo mayor.
- Fine-tuning adicional por capas: al ser un adaptador, se puede componer con otros adaptadores LoRA o seguir entrenando sobre el mismo base, lo que resulta práctico para experimentos de fusión de adaptadores en pipelines de investigación.
- Despliegue en inferencia con adaptadores intercambiables: vLLM y TGI permiten servir un mismo base con varios adaptadores LoRA conmutables, de modo que este adaptador podría añadirse como variante de un servicio ya existente sin duplicar el uso de VRAM del modelo base.
- Ejecución en hardware modesto tras fusión a GGUF: fusionando el adaptador con el base y convirtiendo a `llama.cpp`/Ollama, se puede desplegar en equipos sin GPU dedicada para tareas de generación de texto de baja criticidad.
- Generación de texto asistida en herramientas de escritorio: integrado en entornos tipo LM Studio o text-generation-webui para resumen, reescritura y clasificación de textos cortos que quepan en 8.192 tokens.
- Evaluación de regresiones por sobreajuste: dado que no hay benchmarks, el adaptador es útil como caso de estudio para medir cuánto degrada un DPO sobre un base instruct ya alineado en tareas generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada y el repositorio no reporta métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se han encontrado resultados en la búsqueda web asociados a este adaptador concreto.

## Requisitos de hardware

- VRAM con el base en 4 bits (configuración original): aproximadamente 5,5-6,5 GB para pesos, más 1-2 GB de activaciones y caché; en la práctica requiere unos 8 GB de VRAM.
- Caché KV: con 8 cabezas KV, 32 capas y dimensión de cabeza 128 en FP16, la caché ocupa unos 128 KiB por token, es decir, en torno a 1 GiB con la ventana completa de 8.192 tokens.
- VRAM tras fusionar el adaptador en FP16/BF16: alrededor de 16 GB para pesos, con un total práctico de 18-20 GB.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB.
- VRAM en GGUF Q4_K_M tras fusión y conversión: en torno a 4,9 GB, viable en CPU con RAM suficiente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para 4 bits o FP16 fusionado; A100 40/80 GB y H100 para servicio concurrente a mayor contexto y lote.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas de 8 GB o más con margen ajustado; en FP16 requiere 24 GB (RTX 3090/4090) o reparto en varias GPU.
- Opciones de despliegue: `transformers` + `peft` con bitsandbytes (requiere CUDA), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama/LM Studio tras fusionar y convertir a GGUF. El entrenamiento original se realizó con Unsloth y TRL.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alst10/ReverseLlama-adapters | Adaptador LoRA sobre base de 8.030 M | 8.192 tokens (base) | safetensors (PEFT) | No disponible | HuggingFace, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | safetensors | Llama 3 Community License | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7.620 M | 32.768 tokens ampliables a 131.072 | safetensors | Apache 2.0 | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 tokens | safetensors | Apache 2.0 | HuggingFace |

La comparación es estructural, no de rendimiento: no existen métricas publicadas del adaptador que permitan contrastar calidad frente a estas alternativas. En términos de licencia y contexto, tanto Qwen2.5-7B-Instruct como Mistral-7B-Instruct-v0.3 ofrecen ventanas mayores y licencias permisivas, mientras que cualquier derivado de Llama 3 queda sujeto a la Llama 3 Community License. En el ecosistema del autor existen otros adaptadores publicados, como `alst10/beckett-Qwen3-8B-adapter`, pero no se dispone de datos comparativos entre ellos.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card es la plantilla por defecto de HuggingFace, sin datos de autoría, datos de entrenamiento, hiperparámetros ni evaluación.
- Licencia no declarada: al derivar de Llama 3, el uso comercial queda condicionado por la Llama 3 Community License, que exige aceptar sus términos y mostrar "Built with Meta Llama 3" en productos derivados. La ausencia de licencia explícita en el repositorio añade incertidumbre jurídica.
- Riesgo de alucinación: es un modelo de 8.000 millones de parámetros sin verificación factual; el paso de DPO puede incrementar la confianza en respuestas incorrectas si el dataset de preferencias estaba sesgado.
- Posible olvido catastrófico: al ser un ajuste DPO sobre un base ya instruct, existe riesgo de degradación en tareas generales (código, matemáticas, multilingüe) no cubiertas por el dataset de preferencias. No hay evaluación que lo descarte.
- Propósito no documentado: el nombre "ReverseLlama" no va acompañado de ninguna descripción funcional, por lo que no se puede garantizar el comportamiento del adaptador en producción.
- Límite de contexto: 8.192 tokens del base Llama 3, insuficiente para documentos largos o pipelines de agentes con muchas iteraciones; Llama 3.1 y posteriores amplían esta ventana.
- Idiomas: no declarados; el ajuste puede haber estrechado el soporte multilingüe hacia el idioma dominante del dataset de preferencias, presumiblemente inglés.
- Reproducibilidad: la dependencia de `unsloth/llama-3-8b-Instruct-bnb-4bit` obliga a usar bitsandbytes y CUDA para cargar el base en el formato exacto con el que se entrenó.
- Adopción nula: 0 descargas y 0 likes, sin issues ni discusiones que permitan contrastar su comportamiento con otros usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alst10/ReverseLlama-adapters
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Otros adaptadores del autor: https://huggingface.co/alst10/beckett-Qwen3-8B-adapter
- Colección "Coding" del autor en HuggingFace: https://huggingface.co/collections/alst10/coding
- Paper de RepairLLaMA, referencia sobre adaptadores de reparación de código: https://arxiv.org/abs/2312.15698
- Repositorio LLM-Adapters (EMNLP 2023): https://github.com/AGI-Edgerunners/LLM-Adapters
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Lacoste et al. (2019), estimación de emisiones: https://arxiv.org/abs/1910.09700
