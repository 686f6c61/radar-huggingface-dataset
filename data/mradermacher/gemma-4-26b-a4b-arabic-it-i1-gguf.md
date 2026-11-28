# mradermacher/Gemma-4-26B-A4B-Arabic-It-i1-GGUF

## Resumen

Gemma-4-26B-A4B-Arabic-It-i1-GGUF es la versión cuantizada en formato GGUF del modelo noman-asif/Gemma-4-26B-A4B-Arabic-It, un ajuste fino orientado a árabe (incluido dialecto saudí) sobre una base Gemma 4 de arquitectura MoE con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (según la nomenclatura A4B). El trabajo de cuantización lo firma mradermacher, autor habitual de cuantizaciones GGUF de referencia en Hugging Face, que publica tanto una variante estática como esta versión con calibración imatrix (etiquetada i1).

El modelo base combina varias técnicas de ajuste: RS-LoRA, DPO con trust region y fusión de modelos mediante TIES merging, entrenado sobre los datasets Arabic-Reasoning-Instruct-30k y Arabic-Preference-DPO-6k. Está etiquetado como modelo multimodal (visión), con soporte declarado de chain-of-thought y conversación multi-turno, y licencia Apache 2.0. El repositorio ocupa 301 GB e incluye 24 cuantizaciones distintas, desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB).

Su relevancia práctica es doble: por un lado, ofrece un modelo de razonamiento en árabe con capacidades multimodales y licencia permisiva; por otro, al estar disponible en GGUF con imatrix permite ejecutarlo en hardware de consumo y en entornos de inferencia local (llama.cpp, Ollama, LM Studio) sin depender de GPUs de datacenter. Las 6.877 descargas acumuladas reflejan un interés real pese a la ausencia de likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), multimodal (visión) |
| Parámetros totales | 25.233.142.046 (~25,2 B) |
| Parámetros activos | ~4 B (denominación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (calibradas con imatrix) |
| Idiomas soportados | Árabe (incluye dialecto saudí) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La base es un transformer de mezcla de expertos (MoE) de la familia Gemma 4, con 25,2 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, lo que reduce el coste computacional por paso de decodificación respecto a un modelo denso del mismo tamaño total. El modelo es multimodal: la model card del cuantizador indica explícitamente que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático asociado.

El ajuste fino del modelo base combina RS-LoRA (adaptadores de bajo rango con inicialización por subespacio aleatorio), DPO con trust region para alinear preferencias y TIES merging para fusionar pesos de distintos entrenamientos. Los datos de entrenamiento declarados son Arabic-Reasoning-Instruct-30k (razonamiento e instrucciones en árabe) y Arabic-Preference-DPO-6k (pares de preferencia). Las cuantizaciones de este repositorio usan calibración imatrix, que ajusta los parámetros de cuantización por capa a partir de estadísticas de activaciones, lo que en la práctica mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto y razonamiento en árabe e inglés, con soporte explícito de chain-of-thought (etiqueta chain-of-thought en la model card).
- Conversación multi-turno (tag conversational) y formato de chat instruido.
- Comprensión de imágenes al ser un modelo multimodal de visión (los proyectores mmproj se distribuyen en el repositorio estático).
- Razonamiento matemático y de sentido común en árabe, derivado del dataset Arabic-Reasoning-Instruct-30k.
- Adaptación a dialecto saudí, además de árabe estándar moderno.
- Alineación de preferencias mediante DPO, orientada a respuestas más útiles y seguras.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá de chain-of-thought: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Atención al cliente en árabe y dialecto saudí: el ajuste sobre Arabic-Preference-DPO-6k y el entrenamiento específico en dialecto permiten gestionar conversaciones multi-turno con registro coloquial, algo que los modelos genéricos suelen degradar.
- Asistentes de razonamiento para educación: el modelo puede generar cadenas de razonamiento paso a paso en árabe para problemas de matemáticas y lógica, útil en plataformas de tutoría que necesitan explicaciones intermedias y no solo la respuesta final.
- Procesamiento de documentos escaneados con OCR asistido por visión: al ser multimodal, puede recibir imágenes de formularios o facturas y extraer información en árabe, combinando lectura visual con generación de texto estructurado.
- Despliegue local en estaciones de trabajo: con cuantizaciones i1-Q4_K_M de 16,9 GB cabe en GPUs de consumo de 24 GB (RTX 3090/4090) o en configuraciones con RAM del sistema mediante llama.cpp, lo que permite operar sin conexión en entornos con requisitos de privacidad.
- Investigación en alineación multilingüe: la combinación de RS-LoRA, trust-region DPO y TIES merging sobre una base MoE ofrece un caso de estudio reproducible para medir cómo estas técnicas afectan al rendimiento en árabe frente a inglés.
- Generación de contenido editorial en árabe: redacción de borradores, resúmenes y reescritura con control de estilo, aprovechando la ventana de contexto del modelo base (no publicada) y el soporte bilingüe ar/en para traducción asistida.
- Prototipado de asistentes de voz en árabe: integrado en un pipeline ASR + LLM + TTS, el modelo puede servir como capa de razonamiento y respuesta conversacional en árabe con baja latencia gracias a sus ~4 B parámetros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero como cota inferior, más overhead de contexto y caché KV):
  - i1-IQ1_S: 8,4 GB (calidad muy degradada, solo para pruebas).
  - i1-IQ2_M: 10,5 GB.
  - i1-IQ3_S: 12,3 GB (recomendada por el autor frente a Q3_K*).
  - i1-Q4_K_S: 15,6 GB; i1-Q4_K_M: 16,9 GB (opción recomendada por el autor para velocidad/calidad).
  - i1-Q5_K_M: 19,2 GB.
  - i1-Q6_K: 22,7 GB (equivalente práctico a Q6_K estático).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q6_K con contexto largo o para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB (Q3/IQ3) y de 24 GB (Q4/Q5). En GPUs de 8-12 GB solo con cuantizaciones IQ1/IQ2, con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para los proyectores de visión, usar los mmproj del repositorio estático. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que partir de los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser MoE con ~4 B parámetros activos, el throughput por token debería aproximarse al de un modelo denso de ese orden, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It (este, i1-GGUF) | 25,2 B totales / ~4 B activos | no disponible | ar, en | Apache 2.0 | GGUF (imatrix) |
| noman-asif/Gemma-4-26B-A4B-Arabic-It (base) | 25,2 B totales / ~4 B activos | no disponible | ar, en | Apache 2.0 | safetensors |
| mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF (cuantización estática) | 25,2 B totales / ~4 B activos | no disponible | ar, en | Apache 2.0 | GGUF (sin imatrix) |
| Otros modelos de razonamiento en árabe de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero falso, especialmente en dominios especializados y en dialectos poco representados en los datos de ajuste.
- Sesgos: el ajuste se apoya en datasets concretos (Arabic-Reasoning-Instruct-30k y Arabic-Preference-DPO-6k) cuya composición y diversidad no se detallan; pueden persistir sesgos de género, regionales o religiosos presentes en ellos.
- Cobertura lingüística limitada: solo árabe e inglés declarados; el rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- Longitud de contexto no publicada: no es posible planificar despliegues que dependan de ventanas largas sin verificarla empíricamente en el modelo base.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 degradan la calidad de forma sustancial; el propio autor desaconseja IQ1 salvo como último recurso y marca Q2_K_S como de calidad muy baja.
- Visión: los ficheros mmproj no están en este repositorio sino en el estático; un despliegue que ignore ese detalle perderá la capacidad multimodal.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y de los datasets de entrenamiento por si imponen condiciones adicionales no reflejadas en la model card.
- Procedencia: el modelo base lo publica un autor individual (noman-asif), no Google; la etiqueta Gemma 4 describe la arquitectura de partida, no una certificación oficial.
- Sin métricas publicadas: no hay benchmarks que respalden las afirmaciones de calidad, por lo que se recomienda una evaluación propia antes de llevarlo a producción.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Arabic-It-i1-GGUF
- Modelo base: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Arabic-It-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-26B-A4B-Arabic-It-i1-GGUF
- Dataset de razonamiento: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-30k
- Dataset de preferencias DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-6k
- Guía de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2
