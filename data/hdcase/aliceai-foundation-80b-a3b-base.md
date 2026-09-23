# hdcase/AliceAI-Foundation-80B-A3B-Base

## Resumen

AliceAI-Foundation-80B-A3B-Base es un modelo de lenguaje base de pesos abiertos desarrollado por Yandex y publicado bajo licencia Apache 2.0. Se trata de un transformer autorregresivo con arquitectura híbrida y capas de mezcla de expertos (MoE) que combina bloques KDA con bloques de atención con puerta (gated attention). El modelo tiene 81.286.433.408 parámetros totales (unos 81,3 B) y activa aproximadamente 3 B por token, lo que reduce de forma notable el coste de inferencia frente a un modelo denso de tamaño equivalente.

El modelo se entrenó íntegramente desde cero y se distribuye como modelo base, es decir, en etapa de preentrenamiento, sin ajuste por instrucciones ni alineación publicada. Su ventana de contexto nativa es de 262.144 tokens, un valor muy alto para su categoría, e incluye una capa MTP (multi-token prediction) que puede aprovecharse para decodificación especulativa. Declara soporte para ruso e inglés, y según la propia model card destaca especialmente en tareas de conocimiento factual en ruso.

Su relevancia actual radica en la combinación de contexto largo, eficiencia de inferencia por activación dispersa y un rendimiento declarado en benchmarks de conocimiento factual en ruso (WikiWebFacts, HardMultiQA) que supera al de modelos abiertos de mayor tamaño total, como DeepSeek-V4-Flash-Base (284B-A13B) o Nemotron-3-Super-120B-A12B-Base. El repositorio consultado acumula 102 descargas y 0 likes en el momento de la consulta, y ocupa 162,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido con capas MoE; esquema de capas 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)) |
| Parámetros totales | 81.286.433.408 (~81,3 B) |
| Parámetros activos | ~3 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |
| Tamaño del repositorio | 162,6 GB |
| Tamaño del estado oculto | 2.048 |
| Tamaño del vocabulario | 129.024 |
| Número de capas | 48 |
| Capas MoE | 512 expertos, top-K de 10 + 1 experto compartido, dimensión intermedia de experto 512 |
| MTP | 1 capa |
| Etapa de entrenamiento | preentrenamiento (modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo de tipo híbrido. Cada uno de los 48 bloques sigue un patrón repetido 12 veces: tres subcapas formadas por KDA (mecanismo de atención con convolución de kernel 4, 32 cabezas de consulta y 32 cabezas KV de dimensión 128) seguidas de una capa MoE, y a continuación una subcapa de gated attention (16 cabezas de consulta, 2 cabezas KV, dimensión de cabeza de consulta 256) seguida de otra capa MoE. Las capas MoE cuentan con 512 expertos, un enrutamiento top-K de 10 expertos más 1 experto compartido y una dimensión intermedia por experto de 512. El estado oculto es de 2.048 dimensiones y el vocabulario de 129.024 tokens. El modelo incorpora además una capa MTP, que predice varios tokens por adelantado y habilita decodificación especulativa.

El entrenamiento se realizó completamente desde cero: el equipo reconstruyó el corpus, eligió la arquitectura y los hiperparámetros, y preparó datos específicos para razonamiento complejo e interacción con herramientas. Las decisiones clave se validaron mediante una serie de entrenamientos independientes desde cero de 2 billones de tokens cada uno. No se documentan en la información disponible ni la composición detallada del dataset, ni el número total de tokens de entrenamiento, ni fases de RLHF o DPO; al tratarse de un modelo base, no hay ajuste por instrucciones publicado.

## Capacidades

- Generación de texto y modelado de lenguaje autorregresivo como modelo base.
- Razonamiento en matemáticas y programación: la model card afirma resultados comparables a los de modelos abiertos de mayor tamaño en tareas de razonamiento.
- Conocimiento factual en ruso: es el punto fuerte declarado, con benchmarks específicos publicados (WikiWebFacts y HardMultiQA).
- Razonamiento multi-paso y datos de interacción con herramientas: el autor indica que se prepararon datos para estas capacidades durante el preentrenamiento, aunque al ser un modelo base no hay formato de tool calling garantizado sin ajuste posterior.
- Contexto largo: hasta 262.144 tokens, útil para documentos extensos y conversaciones multi-turno largas.
- Multilingüismo limitado a ruso e inglés según los metadatos del modelo.
- Decodificación especulativa: la capa MTP de 1 nivel puede emplearse para acelerar la generación.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Búsqueda y respuesta sobre documentación extensa en ruso: el modelo puede indexar y consultar manuales, normativas o contratos de más de 200.000 tokens en una sola pasada, gracias a su ventana de 262.144 tokens y a su conocimiento factual en ruso.
- Sistemas de pregunta-respuesta factual en ruso: con los benchmarks WikiWebFacts (86,5) y HardMultiQA (67,9) como referencia, encaja en asistentes que responden sobre entidades, fechas y hechos verificables.
- Generación de código como base para ajuste posterior: al ser un modelo base, sirve como punto de partida para fine-tuning en dominios de programación, aprovechando el bajo coste de inferencia de sus 3 B de parámetros activos.
- Procesamiento de expedientes legales o administrativos largos: clasificación, extracción de cláusulas y resumen de documentos de decenas de miles de tokens sin trocear el contexto.
- Motor de razonamiento en pipelines de agentes: la capa MTP permite decodificación especulativa en vLLM, y el autor declara datos de interacción con herramientas en el preentrenamiento, lo que lo hace apto como base para agentes tras el ajuste correspondiente.
- Investigación en arquitecturas híbridas y MoE: el esquema KDA + gated attention + MoE con 512 expertos es un caso de estudio reproducible con pesos abiertos para experimentos de enrutamiento y eficiencia.
- Destilación y generación de datos sintéticos en ruso: al ser un modelo base con buen conocimiento factual en ruso, puede emplearse para generar corpus etiquetados o aumentar datasets en ese idioma.
- Despliegue con contexto largo en servidores con varias GPU: con 262.144 tokens de contexto y pesos en bf16, es viable en nodos de 3-4 GPU de 80 GB para tareas de análisis documental por lotes.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las mediciones se realizaron en la infraestructura interna del autor con el framework vLLM y temperatura t=0, y son 5-shot. Los benchmarks en ruso aparecen marcados como tales en la fuente.

| Benchmark (5-shot) | AliceAI-Foundation-80B-A3B-Base | Qwen3.5-35B-A3B-Base | GLM-4.5-Air-Base (106B-A12B) | Nemotron-3-Super-120B-A12B-Base | DeepSeek-V4-Flash-Base (284B-A13B) |
|---|---|---|---|---|---|
| WikiWebFacts (ru, conocimiento factual) | 86,5 | 62,4 | 70,2 | 72,8 | 83,2 |
| HardMultiQA (ru, conocimiento factual) | 67,9 | 47,2 | 48,6 | 54,5 | 65,4 |

El resto de la tabla de benchmarks disponible (por ejemplo, CultCat) aparece truncado en la información proporcionada, por lo que no se recoge aquí. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o rendimiento en la información disponible.

## Requisitos de hardware

- Pesos en bf16: el repositorio ocupa 162,6 GB, coherente con 2 bytes por parámetro. No cabe en 2 GPU de 80 GB (160 GB) sin offload; se recomiendan 3× H100 80 GB o 4× A100 80 GB.
- Cuantización a 8 bits: en torno a 81 GB de pesos, ajustado en una sola H100 80 GB y cómodo en 2× A100 80 GB.
- Cuantización a 4 bits: en torno a 41 GB de pesos, viable en 2× RTX 4090 24 GB (48 GB), en una RTX 6000 Ada 48 GB o en una A100 40 GB con margen justo.
- GPU consumer: sí, en configuraciones de 4 bits y con al menos dos GPU de 24 GB; no es viable en una única GPU consumer de 24 GB.
- Opciones de despliegue: vLLM está soportado y es el framework usado por el autor para los benchmarks. También es posible cargarlo con transformers, ya que requiere custom_code. No se documentan conversiones oficiales a GGUF para llama.cpp u Ollama, ni soporte de TGI.
- Latencia y throughput: no disponible.
- Nota: los requisitos de VRAM para contexto completo de 262.144 tokens son mayores que los de solo los pesos, ya que hay que sumar la caché KV; no se dispone de cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activos) | Contexto | Licencia | WikiWebFacts | HardMultiQA |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base | 81,3 B / ~3 B | 262.144 | Apache 2.0 | 86,5 | 67,9 |
| Qwen3.5-35B-A3B-Base | 35 B / ~3 B (según nomenclatura) | no disponible | no disponible | 62,4 | 47,2 |
| GLM-4.5-Air-Base | 106 B / 12 B | no disponible | no disponible | 70,2 | 48,6 |
| Nemotron-3-Super-120B-A12B-Base | 120 B / 12 B | no disponible | no disponible | 72,8 | 54,5 |
| DeepSeek-V4-Flash-Base | 284 B / 13 B | no disponible | no disponible | 83,2 | 65,4 |

Los datos de parámetros y benchmarks de los modelos comparados provienen de la tabla publicada por el autor; el contexto y la licencia de esos modelos no se detallan en la información disponible.

## Limitaciones y advertencias

- Es un modelo base en etapa de preentrenamiento: no incluye ajuste por instrucciones ni alineación documentada (RLHF/DPO no mencionados), por lo que no se comporta como un asistente conversacional sin un fine-tuning o un prompt adecuado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar hechos falsos con apariencia de verosimilitud, especialmente fuera de los dominios cubiertos por sus benchmarks.
- Cobertura de idiomas limitada a ruso e inglés según los metadatos; no se declara soporte para castellano, por lo que su uso en español no está evaluado.
- Sin datos de la composición del corpus de entrenamiento, no es posible evaluar sesgos concretos ni la representatividad de los datos; no se dispone de una model card de sesgos.
- Los benchmarks publicados proceden del propio desarrollador y se midieron en su infraestructura interna con vLLM a t=0; no hay verificación independiente en la información disponible.
- La tabla de benchmarks está truncada en la fuente, por lo que faltan resultados (por ejemplo, CultCat) que podrían matizar el perfil del modelo.
- El soporte de tool calling no está garantizado en un modelo base: el autor menciona datos de interacción con herramientas en el preentrenamiento, pero no un formato de function calling listo para producción.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; no se indican restricciones adicionales.
- Requiere código personalizado (custom_code) para cargarse con transformers, lo que puede complicar la integración en herramientas que no admitan repositorios con código remoto.

## Enlaces

- Repositorio de HuggingFace consultado: https://huggingface.co/hdcase/AliceAI-Foundation-80B-A3B-Base
- Repositorio oficial de Yandex en HuggingFace: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Artículo del anuncio en Habr: https://habr.com/ru/companies/yandex/articles/1083300/
- Dataset WikiWebFacts: https://huggingface.co/datasets/yandex/WikiWebFacts
- Dataset HardMultiQA: https://huggingface.co/datasets/yandex/HardMultiQA
- Ficha en AI Wiki: https://aiwiki.ai/wiki/alice_ai_foundation_80b_a3b
- Ficha en apxml: https://apxml.com/models/aliceai-foundation-80b-a3b-base
- Ficha en CompareAIHardware: https://compareaihardware.com/models/aliceai-foundation-80b-a3b
