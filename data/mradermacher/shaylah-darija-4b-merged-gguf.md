# mradermacher/shaylah-darija-4b-merged-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo **shaylah-darija-4b-merged** (original de `laabidate`), un LLM conversacional de aproximadamente 4.200 millones de parámetros especializado en **darija marroquí** (árabe marroquí dialectal), con etiquetas adicionales de cultura popular marroquí (`folk-culture`). La cuantización ha sido realizada por mradermacher, un cuantizador muy activo del ecosistema Hugging Face conocido por versionar modelos en formato GGUF para inferencia local.

El darija es una variedad lingüística de bajos recursos apenas cubierta por los grandes modelos comerciales, que suelen responder en árabe estándar o dar resultados pobres en dialecto. Un modelo de 4B especializado en este idioma, publicado bajo licencia Apache-2.0 y disponible en GGUF, permite desplegar chatbots y asistentes en darija en hardware de consumo, incluso sin GPU dedicada.

Conviene señalar que esta ficha describe el repositorio de cuantización: la model card no documenta la arquitectura exacta ni el proceso de entrenamiento del modelo base, cuyo sufijo "merged" sugiere que se trata de un merge de modelos previos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (transformer compatible con llama.cpp; el nombre indica un merge de modelos) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | No disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Árabe (`ar`), especializado en darija marroquí |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base está publicado en safetensors |

## Arquitectura y entrenamiento

La información técnica publicada es escasa. Se trata de un modelo denso de ~4,2 B de parámetros convertido a GGUF a partir de safetensors (tipo de conversión `hf`), lo que confirma que se trata de una arquitectura transformer soportada por llama.cpp. El nombre del modelo base (`shaylah-darija-4b-merged`) indica que es el resultado de un merge de modelos, una técnica habitual para combinar capacidades de varios checkpoints, pero ni los modelos progenitores ni los pesos del merge están documentados en la model card.

No se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre etapas de alineamiento como SFT, RLHF o DPO. Por el lado de la cuantización, mradermacher ofrece cuantos estáticos K-quants e IQ4_XS; en el momento de publicación no había cuantos weighted/imatrix disponibles, y el autor indica que pueden solicitarse abriendo una discusión en la comunidad.

## Capacidades

- Conversación multturno en darija marroquí, según las etiquetas `conversational` y `moroccan-arabic` del repositorio.
- Generación de contenido sobre cultura popular marroquí (etiqueta `folk-culture`): tradiciones, referencias locales y temas culturales.
- Generación de texto en árabe, idioma oficialmente etiquetado en el repositorio.
- Inferencia local mediante GGUF en CPU o GPU de consumo, sin dependencia de servicios en la nube.
- No documentado en la información disponible: soporte de tool calling / function calling, capacidades de agentes y razonamiento multpaso, entrada multimodal (visión o audio), modo de razonamiento extendido (thinking) y alcance real del multilingüismo más allá del árabe.

## Casos de uso

- **Atención al cliente en Marruecos**: chatbots que atienden en darija, el idioma real de la mayoría de usuarios marroquíes. Su tamaño de 4 B permite desplegarlo en un servidor modesto o incluso en local, y la licencia Apache-2.0 no restringe el uso comercial.
- **Asistente cultural y divulgación de folclore**: generación de explicaciones, relatos y contenido sobre tradiciones marroquíes (fiestas, gastronomía, música, proverbios), alineado con la etiqueta `folk-culture` del modelo.
- **Bots de mensajería (WhatsApp, Telegram)**: dado que cabe en 3 GB de RAM en cuantización Q4, puede integrarse en backends ligeros basados en llama.cpp para responder consultas en dialecto.
- **Investigación lingüística y preservación del darija**: generación y estudio de texto dialectal para corpus, anotación asistida o experimentos de NLP en una variedad de bajos recursos con escasa oferta de modelos.
- **Aprendizaje del darija**: práctica conversacional para estudiantes que ya conocen árabe estándar u otros idiomas, con un interlocutor disponible sin coste de API.
- **Creación de contenido para medios y redes locales**: redacción de borradores, guiones y publicaciones en darija para audiencias marroquíes, con revisión humana posterior.
- **RAG local sobre documentación en darija**: combinación con un retriever para responder preguntas sobre corpus propios en dialecto, ejecutando todo el pipeline en una estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (pesos + KV cache, según los tamaños de archivo publicados):
  - Q2_K (2,0 GB): ~3 GB de VRAM/RAM; funciona en prácticamente cualquier equipo.
  - Q4_K_M (2,8 GB, recomendado): ~4 GB; apto para portátiles, GPUs de 6 GB y móviles con 6-8 GB de RAM.
  - Q8_0 (4,6 GB): ~6-7 GB; cómodo en GPUs de 8 GB como la RTX 4060 o RTX 3060 Ti.
  - f16 (8,5 GB): ~10-11 GB; requiere una GPU de 12 GB o más (RTX 3060 12 GB, RTX 4070).
- **GPUs recomendadas**: cualquier GPU de consumo moderna es suficiente; RTX 3060/4060 para Q4-Q5, RTX 4070/3090 para Q8_0 y f16. No se necesita hardware de datacenter.
- **CPU**: plenamente viable por su tamaño reducido; con llama.cpp y AVX2 se obtienen velocidades interactivas, aunque no se han publicado cifras concretas de tokens/segundo.
- **Despliegue**: llama.cpp, Ollama, LM Studio, koboldcpp, Jan, GPT4All o text-generation-webui. vLLM y TGI no son opciones habituales para GGUF; para servir con vLLM habría que usar el modelo base en safetensors.
- **Descarga**: el repositorio completo ocupa 38,9 GB porque incluye las doce cuantizaciones; descarga solo el archivo GGUF necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shaylah-darija-4b-merged (este) | ~4,2 B | Darija marroquí, conversacional, folclore | No disponible | Apache-2.0 | GGUF (12 cuantos) + safetensors |
| Atlas-Chat (Google DeepMind) | 2 B / 9 B / 27 B | Darija marroquí, basado en Gemma 2 | ~8K (heredado de Gemma 2) | Gemma | safetensors en Hugging Face |
| Qwen3-4B | 4,0 B | Generalista multilingüe (incluye árabe) | 32K nativo (131K con YaRN) | Apache-2.0 | safetensors + GGUF comunitarios |

Notas: Atlas-Chat, presentado en el paper *Atlas-Chat: Adapting Gemma 2 for Moroccan Arabic Darija Language Models* (arXiv:2409.17912), es la referencia académica principal para LLMs en darija, pero sus licencias Gemma son más restrictivas para ciertos usos comerciales. Qwen3-4B ofrece un contexto mucho mayor y capacidades generales superiores, pero sin la especialización dialectal. Existe también DarijaBERT, un encoder de ~137 M de parámetros para darija, aunque no es apto para generación conversacional.

## Limitaciones y advertencias

- **Sin validación cuantitativa**: no hay benchmarks publicados ni datos de evaluación del modelo base; la calidad debe verificarse empíricamente antes de cualquier despliegue en producción.
- **Tracción comunitaria nula en el momento de la ficha**: 0 descargas y 0 likes, señal de un modelo muy nuevo o de nicho sin revisión por terceros.
- **Procedencia opaca del merge**: los modelos progenitores no están documentados, por lo que los sesgos heredados son imposibles de auditar desde la model card.
- **Riesgo de alucinación elevado**: los modelos de 4 B alucinan con más frecuencia que los de mayor escala, y el riesgo se agrava en idiomas de bajos recursos como el darija, especialmente en temas culturales donde los errores son difíciles de detectar para sistemas automáticos.
- **Cuantos bajos degradan dialectos**: en cuantizaciones Q2_K y Q3 el deterioro suele ser más visible en lenguas con vocabulario dialectal; se recomienda Q4_K_M como mínimo y Q6_K para producción.
- **Contexto no especificado**: al desconocer la longitud de ventana, evita asumir conversaciones largas o documentos extensos sin probarlo antes.
- **Alcance lingüístico incierto**: está etiquetado solo en árabe; su comportamiento en árabe estándar, francés (muy presente en Marruecos) u otros idiomas no está documentado.
- **Licencia sin fricción comercial**: Apache-2.0 permite uso comercial, modificación y despliegue, tanto en el cuantizador como, según la etiqueta del repositorio, en el modelo base.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/shaylah-darija-4b-merged-GGUF
- Modelo base (laabidate): https://huggingface.co/laabidate/shaylah-darija-4b-merged
- Página resumen con lista de descargas de mradermacher: https://hf.tst.eu/model#shaylah-darija-4b-merged-GGUF
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper de Atlas-Chat (referencia del estado del arte en darija): https://arxiv.org/abs/2409.17912
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
