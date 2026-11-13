# FINAL-Bench/Darwin-28B-Opus

## Resumen

Darwin-28B-Opus es un modelo de razonamiento de 27,6 mil millones de parámetros desarrollado por FINAL-Bench mediante su motor de cruce evolutivo Darwin V7. Se construye fusionando dos modelos públicos derivados de la misma base Qwen3.6-27B: el backbone denso original de Qwen y una variante destilada con trazas de razonamiento al estilo Claude Opus. El resultado conserva la arquitectura Qwen3.6 (atención híbrida lineal/completa) e incorpora el estilo de cadena de pensamiento destilado del segundo progenitor.

El modelo se presenta como la primera entrada de la serie Darwin basada en la generación Qwen3.6 y declara un 88,89 % de precisión en GPQA Diamond bajo una evaluación adaptativa en tres etapas, ligeramente por encima de su hermano mayor Darwin-36B-Opus (88,4 %) y de la variante de generación anterior Darwin-27B-Opus (86,9 %). Está publicado con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines existentes de Transformers.

Su relevancia actual radica en que ofrece capacidades de razonamiento avanzado y modo *thinking* en un tamaño denso manejable (27,6 B en BF16), con soporte multilingüe declarado (inglés, chino, coreano, japonés y multilingüe) y pesos en safetensors compatibles con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (generación Qwen3.6, atención híbrida lineal + completa) |
| Parametros totales | 27.781.427.952 (27,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | heredada del modelo base; valor numérico no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, zh, ko, ja, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Otros datos técnicos declarados por el autor: hidden size 5.120, intermediate size 17.408, head dim 256, 64 capas con proporción 3 lineales : 1 de atención completa (`full_attention_interval = 4`).

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration` de la generación Qwen3.6, un transformer denso con atención híbrida que alterna capas de atención lineal y capas de atención completa cada cuatro capas (3 lineales por cada completa). Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. El modelo tiene 64 capas, hidden size de 5.120 y head dim de 256, con pesos en bfloat16.

No se trata de un entrenamiento desde cero, sino de una fusión evolutiva (Darwin V7) entre dos modelos: `Qwen/Qwen3.6-27B` como backbone base y `rico03/Qwen3.6-27B-Claude-Opus-Reasoning-Distilled`, una variante del mismo backbone destilada con aproximadamente 14.000 trazas de razonamiento al estilo Claude Opus. El proceso de merge combina los pesos de ambos progenitores para heredar el estilo de cadena de pensamiento del segundo sin perder las capacidades del primero. No se dispone de información sobre el número de tokens de entrenamiento adicional, la composición del dataset ni si hubo fases de RLHF o DPO posteriores al merge.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo *thinking* (cadena de pensamiento explícita) heredado de la destilación estilo Claude Opus.
- Razonamiento de nivel graduado y científico, evidenciado por el resultado declarado en GPQA Diamond.
- Capacidades multilingües en inglés, chino, coreano, japonés y cobertura multilingüe general.
- Procesamiento de imagen y texto: la arquitectura base (`image-text-to-text`) y los tags del repositorio indican soporte multimodal, aunque la model card no detalla las capacidades de visión.
- Conversación multi-turno y generación conversacional.
- No se declara explícitamente soporte de *tool calling* ni de *function calling* en la información disponible.
- No se declara explícitamente soporte de agentes o razonamiento multi-paso orquestado más allá del modo *thinking*.

## Casos de uso

- Razonamiento científico y técnico asistido: el modelo puede resolver preguntas de nivel posgrado en física, química y biología, como demuestra su resultado en GPQA Diamond, y es adecuado para asistentes de investigación que necesitan justificar respuestas con cadenas de razonamiento.
- Generación de explicaciones paso a paso en entornos educativos: el modo *thinking* permite producir soluciones detalladas a problemas complejos, útil en plataformas de tutoría técnica.
- Asistencia multilingüe en atención al cliente: con soporte para inglés, chino, coreano y japonés, puede gestionar conversaciones multi-turno en mercados asiáticos y angloparlantes con un único modelo.
- Análisis de documentos con contenido visual: dado el pipeline `image-text-to-text`, puede emplearse para extraer y razonar sobre información de capturas, diagramas o documentos escaneados, aunque conviene validar la calidad de visión antes de producción.
- Prototipado de agentes de razonamiento: al ser un modelo denso de 27,6 B con licencia Apache 2.0, es viable desplegarlo en infraestructura propia para experimentar con pipelines de razonamiento encadenado sin restricciones comerciales.
- Evaluación comparativa de técnicas de merge: sirve como referencia para investigadores que estudian fusión evolutiva de modelos y destilación de estilos de razonamiento, al estar publicados los progenitores y la metodología.
- Sustitución de modelos mayores en tareas de razonamiento con presupuesto de hardware limitado: al puntuar cerca de su hermano MoE de 36 B, puede ser una opción más económica en VRAM para cargas de razonamiento de alta exigencia.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Darwin-28B-Opus | Darwin-36B-Opus | Darwin-27B-Opus |
|---|---|---|---|---|
| GPQA Diamond (198 preguntas) | Accuracy | 88,89 % | 88,4 % | 86,9 % |

No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 64-80 GB de VRAM.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090/A6000 de 48 GB).
- En cuantización de 8 bits los pesos bajarían a unos 28 GB, y en 4 bits a unos 14 GB, lo que permitiría ejecución en una RTX 4090 de 24 GB o en una RTX 3090; sin embargo, la información disponible no confirma la existencia de pesos GGUF o cuantizados publicados.
- En consumer GPU: no cabe en BF16 en ninguna GPU de consumo actual; en cuantización 4-8 bits podría caber en RTX 4090, RTX 3090 o GPUs con 24 GB o más, siempre que se generen o encuentren pesos cuantizados.
- Opciones de despliegue: `transformers` de forma nativa (librería declarada); compatibilidad con vLLM, TGI, llama.cpp u Ollama no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-28B-Opus | 27,6 B (denso) | no disponible | 88,89 % | Apache 2.0 | Hugging Face |
| Darwin-36B-Opus | 36 B (MoE) | no disponible | 88,4 % | no disponible | Hugging Face |
| Darwin-27B-Opus | 27 B (generación Qwen3.5) | no disponible | 86,9 % | no disponible | Hugging Face |
| Qwen3.6-27B (progenitor) | 27,6 B (denso) | no disponible | no disponible | no disponible | Hugging Face |

La comparación se limita a los miembros de la propia familia Darwin y al modelo base, ya que la información proporcionada no incluye resultados de terceros comparables.

## Limitaciones y advertencias

- El resultado de GPQA Diamond (88,89 %) está declarado por el autor y marcado como no verificado; no debe tratarse como una medición independiente.
- Al ser un merge de pesos y no un entrenamiento supervisado completo, puede heredar sesgos y comportamientos de ambos progenitores, incluidos los del modelo destilado con trazas de Claude Opus.
- Riesgo de alucinación inherente a los modelos generativos de razonamiento; el modo *thinking* puede producir cadenas de razonamiento plausibles pero incorrectas.
- La longitud de contexto exacta no está documentada en la información disponible; conviene verificarla antes de diseñar aplicaciones con ventanas largas.
- El soporte multilingüe declarado se limita a inglés, chino, coreano y japonés; el rendimiento en castellano no está documentado.
- Aunque la licencia es Apache 2.0, el modelo deriva de un backbone Qwen y de una variante destilada de terceros; conviene revisar las condiciones de los progenitores antes de un uso comercial a gran escala.
- No hay información sobre cuantizaciones oficiales, lo que puede complicar el despliegue en hardware de consumo.
- La model card incluye referencias a una familia más amplia (POCKET, Darwin-4B/9B/31B/36B) y a un paper con identificador arXiv:2605.14386; la disponibilidad y el contenido de dichos recursos no están confirmados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-28B-Opus
- Progenitor base: https://huggingface.co/Qwen/Qwen3.6-27B
- Progenitor destilado: https://huggingface.co/rico03/Qwen3.6-27B-Claude-Opus-Reasoning-Distilled
- Hermano MoE: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- Variante generación anterior: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Colección de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Demo CPU POCKET: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Paper referenciado: arXiv:2605.14386 (disponibilidad no confirmada)
