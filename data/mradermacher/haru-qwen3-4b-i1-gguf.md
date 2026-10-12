# mradermacher/haru-qwen3-4b-i1-GGUF

## Resumen
Esta ficha describe `mradermacher/haru-qwen3-4b-i1-GGUF`, un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir de `ruddls030/haru-qwen3-4b`. El modelo de origen es un ajuste fino (LoRA) sobre Qwen3-4B orientado a interpretación de personaje, roleplay y uso como mascota de escritorio (*desktop-pet*) en coreano. El repositorio que nos ocupa no contiene pesos entrenados por mradermacher: es una reempaquetado de terceros con cuantizaciones dinámicas del tipo i1 (con matriz de importancia o imatrix) para su uso en inferencia local.

El interés práctico de esta publicación es poder ejecutar un modelo conversacional de 4.022.468.096 parámetros en hardware de consumo, con opciones que van desde 1,2 GB (i1-IQ1_S) hasta 3,4 GB (i1-Q6_K). La licencia es Apache 2.0, heredada del modelo base, y el idioma declarado es exclusivamente coreano. El pipeline no está especificado en Hugging Face y el repositorio no incluye model card propia más allá de la plantilla estándar de mradermacher, por lo que buena parte de los datos técnicos (contexto, dataset de entrenamiento, benchmarks) no están disponibles en la información proporcionada.

Se trata, por tanto, de un artefacto de despliegue con utilidad para desarrolladores que quieran integrar un modelo pequeño especializado en personajes conversacionales en coreano dentro de aplicaciones de escritorio, herramientas locales o entornos sin GPU dedicada de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-4B; confirmado por el nombre del modelo base) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Tambien existe un repositorio paralelo con cuantizaciones estaticas (`mradermacher/haru-qwen3-4b-GGUF`) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento
El modelo de partida es `ruddls030/haru-qwen3-4b`, un ajuste LoRA sobre Qwen3-4B. Qwen3-4B es un transformer decoder-only denso con atención por causalidad estándar, diseñado por el equipo Qwen de Alibaba; la adaptación mediante LoRA se orienta a conversación de personaje en coreano. La etiqueta `desktop-pet` sugiere que el ajuste busca respuestas breves, consistentes en tono y personalidad, adecuadas para un asistente de escritorio, mientras que `roleplay` y `character` apuntan a interacción narrativa y mantenimiento de una persona concreta. La publicación de mradermacher no añade entrenamiento propio: únicamente aplica cuantización de pesos con calibración imatrix.

En cuanto al proceso de cuantización, mradermacher utiliza el formato i1, que combina cuantización por bloques con una matriz de importancia (imatrix) generada a partir de textos de calibración. Esto permite preservar mejor las activaciones relevantes a bajos *bits* por peso. Las cuantizaciones i1 del repositorio se ofrecen en dos categorías: dinámicas (serie i1-*) y, según la model card, también hay estáticas publicadas aparte. No se dispone de información sobre el número de tokens de entrenamiento del LoRA, la composición del dataset, si hubo RLHF, DPO u otra etapa de alineamiento posterior, ni sobre innovaciones técnicas específicas del ajuste.

## Capacidades
- Generación de texto conversacional en coreano, con foco en interpretación de personaje y coherencia de personalidad en interacciones multi-turno.
- Diálogo de roleplay y narrativa corta: el ajuste está etiquetado explícitamente como `character` y `roleplay`.
- Uso como mascota de escritorio o asistente personal (*desktop-pet*), presumiblemente con respuestas breves y tono característico.
- Conversación general de tipo asistente, heredada de la base Qwen3-4B.
- Capacidad multilingüe limitada: el idioma declarado en la model card es únicamente coreano (`ko`).
- No se declara soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso explícito ni modo *thinking*.
- No se declara soporte de visión, audio ni otras modalidades.
- No se declaran capacidades de generación de código ni de matemáticas más allá de las que pudiera retener la base Qwen3-4B, sin evidencia específica en el ajuste.

## Casos de uso
- Asistente de personaje en aplicaciones de escritorio: el modelo puede integrarse en un *widget* o app nativa como mascota virtual que mantiene una persona fija en coreano, aprovechando su tamaño reducido para ejecutarse en local sin depender de la nube.
- Motor conversacional para videojuegos independientes: al pesar entre 1,2 y 3,4 GB en GGUF, permite diálogos con NPC en coreano dentro de un juego de escritorio sin latencia de red, siempre que el contexto requerido quepa en la ventana del modelo base.
- Prototipado rápido de *chatbots* de rol en coreano: un desarrollador puede desplegar la cuantización i1-Q4_K_M (2,6 GB) en un portátil con GPU modesta para iterar sobre prompts de personaje sin coste de API.
- Generación de diálogos para guiones o ficción interactiva: el modelo puede producir líneas de personaje consistentes en estilo, útil como apoyo a escritores que trabajen en coreano.
- Chat de acompañamiento o *wellness* en coreano: gracias al tono de personaje, puede emplearse en asistentes conversacionales de compañía, con las salvedades éticas y de sesgo habituales en modelos pequeños especializados.
- Pruebas de investigación sobre ajuste LoRA y cuantización: sirve como caso de estudio reproducible para medir cómo afectan las distintas cuantizaciones i1 (de IQ1_S a Q6_K) a la calidad de un LoRA temático en coreano.
- Despliegue en entornos con recursos muy limitados: la cuantización i1-IQ1_S (1,2 GB) permite ejecución en CPU o GPU integrada, aunque con pérdida notable de calidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card de mradermacher no incluye métricas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de roleplay), y el repositorio de Hugging Face no declara cifras de rendimiento. Cualquier comparación numérica con otros modelos debería obtenerse ejecutando evaluaciones propias sobre el modelo cuantizado.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 1,2 GB para i1-IQ1_S; 1,6 GB para i1-IQ2_M; 2,3 GB para i1-Q3_K_L; 2,6 GB para i1-Q4_K_M; 3,0 GB para i1-Q5_K_M; 3,4 GB para i1-Q6_K.
- Sumar a esas cifras el espacio para la caché KV, que depende del contexto configurado y de la implementación; para contextos largos conviene prever varios GB adicionales.
- GPU recomendadas: cualquier GPU de consumo con 4-8 GB de VRAM es suficiente para las cuantizaciones Q4 y superiores (RTX 3060, RTX 4060, RTX 3070, RTX 4070, etc.). En GPUs profesionales (A100, H100) el modelo es trivial en tamaño y quedará limitado por *overhead* de lanzamiento más que por memoria.
- Cabe en GPU de consumo: sí, en prácticamente todas las dedicadas modernas. Las cuantizaciones de 1,2-1,6 GB pueden ejecutarse incluso en CPU o en GPU integrada con rendimiento aceptable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp (habitual en flujos de roleplay y personajes), text-generation-webui, y servidores compatibles con GGUF. Para un uso puramente conversacional, koboldcpp y llama.cpp son las opciones más directas.
- Latencia y throughput estimados: no disponibles. Dependerán de la cuantización, del hardware y de la longitud de contexto; como referencia cualitativa, una cuantización Q4_K_M de 2,6 GB suele generar decenas de tokens por segundo en GPUs de consumo recientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/haru-qwen3-4b-i1-GGUF (esta ficha) | ~4,02 B | No disponible (base Qwen3-4B: 32.768) | Coreano | Apache 2.0 | GGUF (i1 y estatico) |
| ruddls030/haru-qwen3-4b | ~4,02 B | No disponible | Coreano | Apache 2.0 | Safetensors (LoRA/base) |
| Qwen/Qwen3-4B | ~4,02 B | 32.768 nativos (ampliable con YaRN) | Multilingue | Apache 2.0 | Safetensors, GGUF de terceros |
| Otros GGUF de roleplay en coreano de ~4 B | No disponible | No disponible | Coreano | Variable | No disponible |

No se dispone de datos de rendimiento comparativos entre esta cuantización y alternativas de la misma categoría. La comparación se limita, por tanto, a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la model card. Al ser un LoRA sobre Qwen3-4B, puede heredar sesgos de la base y, además, introducir sesgos derivados del dataset de ajuste en coreano, que no se ha hecho público.
- Riesgo de alucinación: no evaluado ni documentado; en modelos pequeños especializados en personajes, la generación de información factual no verificada es habitual.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva. Si se hereda el valor nativo de Qwen3-4B, estará en torno a 32.768 tokens, pero conviene verificarlo antes de usarlo en producción.
- Limitaciones de idioma: el modelo declara únicamente coreano; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea pobre.
- Restricciones de licencia para uso comercial: la licencia es Apache 2.0, lo que en principio permite uso comercial. Sin embargo, al tratarse de un LoRA sobre una base de terceros, conviene revisar también la licencia del modelo base y del ajuste original para asegurarse de que no existen restricciones adicionales.
- Caveat de cuantización: las cuantizaciones por debajo de Q3 (en particular i1-IQ1_S, i1-IQ1_M y la serie IQ2) degradan notablemente la calidad. La propia model card las etiqueta como "for the desperate" o "mostly desperate".
- Trazabilidad limitada: el repositorio no incluye información sobre el dataset, hiperparámetros de entrenamiento ni evaluación, lo que dificulta auditar su comportamiento.
- Repositorio con muy poca actividad: cero descargas y un único *like* en el momento de redactar esta ficha, lo que implica escasa validación por parte de la comunidad.

## Enlaces
- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/haru-qwen3-4b-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/haru-qwen3-4b-GGUF
- Modelo base / LoRA original: https://huggingface.co/ruddls030/haru-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Pagina de resumen de mradermacher para este modelo: https://hf.tst.eu/model#haru-qwen3-4b-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de las cuantizaciones: https://www.nethype.de/
