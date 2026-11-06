# mradermacher/Goetia-24B-v1.3-GGUF

## Resumen

Goetia-24B-v1.3-GGUF es la versión cuantizada en formato GGUF del modelo Naphula/Goetia-24B-v1.3, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 23.570 millones de parámetros (23,57B) orientado específicamente a la escritura creativa, la generación de ficción, la narración de historias y el roleplaying. El modelo base es un merge construido con mergekit, según indican las etiquetas del repositorio, y está etiquetado con referencias a Mistral y a la familia "della".

La relevancia de esta publicación es práctica: mradermacher distribuye cuantizaciones estáticas en múltiples niveles (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 24B en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 161,4 GB en total, aunque cada archivo individual de cuantización va desde 9 GB (Q2_K) hasta 25,2 GB (Q8_0).

El modelo está entrenado y orientado al inglés, con licencia Apache 2.0 y un conjunto de datos de calibración denominado OccultAI/illuminati_imatrix_v1. La información pública disponible es limitada: no se detallan la longitud de contexto, la composición exacta del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, según etiquetas; detalles no disponibles) |
| Parámetros totales | 23.572.403.200 (23,57B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors/transformers |
| Tamaño del repositorio | 161,4 GB |
| Dataset de calibración | OccultAI/illuminati_imatrix_v1 |
| Modelo base | Naphula/Goetia-24B-v1.3 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que mencionan "mistral", "merge" y "mergekit". Esto sugiere que el modelo base Naphula/Goetia-24B-v1.3 es el resultado de una fusión de modelos (model merging) realizada con mergekit, probablemente partiendo de arquitecturas de la familia Mistral. No se especifican el número de tokens de entrenamiento, la composición del dataset original ni si se aplicaron fases de RLHF o DPO.

El único dato concreto sobre el proceso de cuantización es el uso del dataset OccultAI/illuminati_imatrix_v1 como corpus de calibración para generar las cuantizaciones con importancia (imatrix), disponibles en el repositorio mradermacher/Goetia-24B-v1.3-i1-GGUF. Las cuantizaciones de este repositorio son estáticas, generadas con la versión 2 del proceso de cuantización de mradermacher y con salida en tipo HF.

## Capacidades

- Generación de texto creativo: ficción, prosa vívida, narración de historias y continuación de escenas.
- Generación de tramas y subtramas para relatos y novelas.
- Escritura en múltiples géneros: ciencia ficción, romance, terror (horror) y otros géneros según las etiquetas.
- Roleplaying (RP) y conversación de personajes, incluyendo contenido con lenguaje soez (etiqueta "swearing").
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (visión, audio, modo thinking): no disponible en la información.

## Casos de uso

- Generación de ficción larga: el modelo puede producir capítulos y escenas con prosa elaborada, adecuado para autores que necesitan borradores rápidos o variaciones de una misma escena.
- Continuación de escenas y diálogos: útil en herramientas de escritura asistida donde el autor necesita que el modelo mantenga el tono y el estilo de un texto previo.
- Roleplaying conversacional: integrable en aplicaciones de chat con personajes, gracias a su orientación explícita a RP y conversación multi-turno.
- Generación de tramas y subtramas: para planificación narrativa, el modelo puede proponer arcos argumentales y giros en géneros como terror, romance o ciencia ficción.
- Prototipado de videojuegos narrativos: generación de diálogos y descripciones de escenas para motores de aventuras conversacionales o RPG.
- Escritura de contenido de género: relatos de terror o ciencia ficción donde se requiere un registro vívido y atmósferas marcadas.
- Despliegue local en estaciones de trabajo: al ofrecerse en GGUF con cuantizaciones desde 9 GB, permite ejecutar el modelo en equipos sin GPU de datacenter para tareas de escritura asistida offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K (9,0 GB): en torno a 10-12 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (10,5-12,5 GB): en torno a 12-15 GB.
  - IQ4_XS (13,0 GB) y Q4_K_S / Q4_K_M (13,6-14,4 GB): en torno a 14-17 GB.
  - Q5_K_S / Q5_K_M (16,4-16,9 GB): en torno a 17-20 GB.
  - Q6_K (19,4 GB): en torno a 20-23 GB.
  - Q8_0 (25,2 GB): en torno a 26-29 GB.
- GPU recomendadas: para Q4_K_M en adelante, una RTX 4090 (24 GB) permite cargar Q4 y Q5 con contexto moderado; Q6_K y Q8_0 requieren A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o Q5_K_M y contexto ajustado; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con Q2_K o Q3 y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; también servidores compatibles con endpoints según la etiqueta del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia estructural, se puede comparar con otras cuantizaciones GGUF de modelos de tamaño similar de la familia Mistral o de merges creativos, pero no se aportan cifras verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Goetia-24B-v1.3-GGUF | 23,57B | No disponible | Apache 2.0 | GGUF | Enfoque en ficción y RP; solo inglés |
| Alternativas de 24B de la familia Mistral | No disponible | No disponible | No disponible | No disponible | No se aportan datos verificables |
| Merges creativos de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se aportan datos verificables |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un merge orientado a ficción, puede reproducir estereotipos presentes en datos narrativos.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas factuales no verificadas el riesgo es alto, y el modelo no está orientado a precisión factual.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; la longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Naphula/Goetia-24B-v1.3 y de los modelos fusionados que lo componen, ya que un merge puede heredar restricciones de sus componentes.
- Caveats para producción: las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la coherencia narrativa; para escritura creativa se recomienda Q4_K_M o superior. El contenido etiquetado con "swearing" y temáticas de terror puede requerir filtrado en aplicaciones orientadas al público general.
- El repositorio tiene un número reducido de descargas (366) y un solo "like", lo que indica poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Goetia-24B-v1.3-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-24B-v1.3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Goetia-24B-v1.3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Goetia-24B-v1.3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
