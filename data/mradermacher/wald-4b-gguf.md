# mradermacher/Wald-4B-GGUF

## Resumen

Wald-4B-GGUF es la colección de cuantizaciones GGUF publicadas por mradermacher a partir del modelo base org2ai/Wald-4B, un modelo de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a la toma de decisiones tipadas y a la calibración de probabilidades. El modelo no se presenta como un generador de texto conversacional al uso, sino como un "decision model" especializado en clasificación, selección de herramientas y enrutamiento de agentes, con etiquetas que apuntan a un índice de decisión y a compatibilidad con JevBench.

La relevancia de esta ficha radica en que el artefacto publicado es una redistribución de cuantizaciones estáticas, no el modelo original: mradermacher genera los ficheros GGUF a partir de los pesos en formato Hugging Face del modelo base, de modo que el interés práctico está en la disponibilidad de variantes comprimidas para llama.cpp y Ollama. La información pública disponible es escasa y muy centrada en el proceso de cuantización, no en los detalles arquitectónicos del modelo original.

El repositorio ocupa 38,9 GB e incluye once cuantizaciones estáticas que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB). La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. No se han publicado en la información disponible datos sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del autor sugieren base tipo Qwen3.5 y uso como modelo de decisión) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base org2ai/Wald-4B. Las etiquetas del repositorio incluyen "qwen3.5", lo que sugiere que el modelo base podría derivar de la familia Qwen 3.5 de 4B, pero no se confirma en la documentación proporcionada ni se especifica si se trata de un transformer denso, un modelo híbrido o una variante con atención lineal. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o calibración post-entrenamiento.

Lo que sí se explicita es la orientación funcional: el modelo está etiquetado como "decision-model", "typed-decisions", "calibration", "calibrated-probabilities", "classification", "tool-selection" y "agent-routing". Esto indica un entrenamiento o ajuste orientado a producir decisiones estructuradas con probabilidades calibradas, más que a la generación libre de texto. Las etiquetas "jevbench" y "jev-compatible" apuntan a un benchmark o formato de evaluación específico del ecosistema del autor, del que no se aportan detalles técnicos. El proceso de cuantización documentado es el estándar de mradermacher: conversión desde pesos Hugging Face con quantize_version 2 y cuantización de tensores de salida, sin cuantizaciones ponderadas por imatrix en el momento de la publicación.

## Capacidades

- Generación de decisiones tipadas y clasificación con probabilidades calibradas, según las etiquetas del autor.
- Selección de herramientas (tool selection) y enrutamiento de agentes (agent routing) como casos de uso declarados.
- Soporte de razonamiento ("reasoning") según las etiquetas del repositorio.
- Compatibilidad con vLLM y llama.cpp, además de endpoints compatibles.
- Capacidad conversacional declarada en las etiquetas del repositorio.
- Idiomas: únicamente inglés.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo thinking explícito en la información disponible.

## Casos de uso

- Enrutamiento de agentes: el modelo puede emplearse como clasificador que decida qué herramienta o subagente debe atender una petición, aprovechando su orientación a "agent-routing" y "tool-selection" con probabilidades calibradas que permiten fijar umbrales de confianza.
- Selección de herramientas en pipelines de automatización: dado un conjunto de funciones disponibles, el modelo asigna la función más probable y devuelve una puntuación calibrada que el orquestador puede usar para reintentar o escalar a un humano.
- Clasificación de tickets y solicitudes: con 4,2 B de parámetros y cuantización Q4_K_M de 2,8 GB, puede desplegarse en una sola GPU consumer para clasificar grandes volúmenes de entradas en categorías predefinidas.
- Filtrado previo en sistemas RAG: como modelo de decisión, puede determinar si una consulta requiere recuperación documental o puede responderse directamente, reduciendo llamadas a modelos mayores.
- Evaluación de decisiones en entornos de investigación: la etiqueta "jevbench"/"jev-compatible" sugiere su uso en la evaluación comparativa de modelos de decisión dentro del ecosistema del autor.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_S (2,7 GB) y Q4_K_M (2,8 GB) están marcadas por el autor como "fast, recommended", lo que facilita prototipos en portátiles con GPU modesta o incluso CPU.
- Servicio de inferencia con vLLM: la etiqueta "vllm" y "endpoints_compatible" indican que el modelo base puede servirse mediante una API compatible con OpenAI, integrándose en arquitecturas de microservicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB con Q2_K, 2,8 GB con Q4_K_M, 3,6 GB con Q6_K, 4,6 GB con Q8_0 y 8,5 GB con f16, según los tamaños de fichero publicados (sin contar el overhead del contexto y de la caché KV).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto. Para f16 se recomienda al menos 12 GB de VRAM.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas con las cuantizaciones Q4 y Q5; las variantes Q8_0 y f16 requieren GPU de gama media-alta.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, vLLM (para el modelo base en safetensors) y endpoints compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota: el autor indica que no hay cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación; las cuantizaciones IQ pueden ofrecer mejor relación calidad/tamaño que las K de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wald-4B-GGUF (esta ficha) | 4,2 B | no disponible | Apache 2.0 | GGUF | Orientado a decisiones tipadas y calibración |
| Qwen 2.5 3B Instruct (referencia de tamaño) | 3,1 B | 32.768 tokens (según documentación pública del modelo original) | Apache 2.0 | safetensors, GGUF | Modelo conversacional generalista |
| Llama 3.2 3B Instruct (referencia de tamaño) | 3,2 B | 131.072 tokens (según documentación pública del modelo original) | Llama 3.2 Community License | safetensors, GGUF | Modelo conversacional generalista con licencia restrictiva |
| Phi-3.5-mini (referencia de tamaño) | 3,8 B | 131.072 tokens (según documentación pública del modelo original) | MIT | safetensors, GGUF | Modelo generalista con buen rendimiento en razonamiento |

La comparación debe tomarse con cautela: los datos de contexto de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para Wald-4B, cuyo contexto no está disponible. Wald-4B no es un modelo generalista, por lo que la comparación directa en benchmarks de conocimiento general no sería representativa.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; no hay evidencia de soporte multilingüe, por lo que su uso en castellano no está respaldado por la documentación.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Arquitectura y entrenamiento: la falta de información sobre el dataset, el proceso de alineación y la arquitectura impide evaluar sesgos y riesgos de alucinación con rigor.
- Naturaleza del artefacto: este repositorio contiene cuantizaciones, no los pesos originales; para reproducibilidad y evaluación rigurosa conviene partir del modelo base org2ai/Wald-4B.
- Calidad de cuantización: las variantes Q2_K y Q3_K pueden degradar notablemente la calibración de probabilidades, que es precisamente la función central del modelo; para aplicaciones sensibles a la calibración se recomienda Q6_K, Q8_0 o f16.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base org2ai/Wald-4B, ya que la información disponible no detalla posibles restricciones adicionales.
- Ecosistema: las etiquetas "jevbench" y "jev-compatible" remiten a un benchmark del que no se aporta documentación, lo que limita la verificación independiente de las afirmaciones de rendimiento.
- Producción: no hay datos publicados de latencia, throughput ni estabilidad en despliegues de alta concurrencia.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Wald-4B-GGUF
- Modelo base: https://huggingface.co/org2ai/Wald-4B
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Wald-4B-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
