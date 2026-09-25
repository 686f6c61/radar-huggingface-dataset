# mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF

## Resumen

Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS, un modelo conversacional de aproximadamente 4.628 millones de parámetros (4,63 B). El trabajo de mradermacher se limita a la conversión y cuantización de los pesos originales; el desarrollo del modelo base corresponde a Guilherme34. El repositorio incluye 12 cuantizaciones estáticas (desde Q2_K de 3,1 GB hasta f16 de 9,4 GB) más dos ficheros auxiliares multimodales `mmproj`, lo que indica que el modelo base es multimodal (procesa imagen y texto).

El modelo está orientado a conversación, uso de herramientas (tool-use) y roleplay, con entrenamiento declarado mediante Axolotl sobre una mezcla de datasets de instrucciones, agentes y conversación cotidiana. El único idioma declarado es el inglés. No se especifican en la información disponible la arquitectura exacta, la longitud de contexto, la licencia ni resultados de benchmarks; además, el propio nombre del modelo («DONTDOWNLOAD», «STILLONPROGRESS») advierte de que se trata de un trabajo en curso.

Su relevancia práctica es limitada y debe evaluarse con cautela: el repositorio registra 0 descargas y 0 «likes», no declara licencia y el autor del modelo base lo marca explícitamente como no apto para descarga. Los cuants son útiles para quien quiera inspeccionar técnicamente el modelo base en local, pero no constituyen una opción recomendable para producción sin verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta declarada es `gemma4`, sin documentación adicional) |
| Parámetros totales | 4.628.569.635 (4,63 B), dato de safetensors del modelo base |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (complemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo base) y GGUF (este repositorio) |
| Tamaño del repositorio | 49,4 GB |
| Modalidad | texto e imagen (por la presencia de ficheros `mmproj`) |
| Etiquetas declaradas | transformers, gguf, axolotl, gemma4, conversational, tool-use, roleplay |
| Fecha de creación | 2026-09-25 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base: no se especifican número de capas, dimensión del modelo, tipo de atención ni mecanismo de posicionamiento. La única referencia estructural es la etiqueta `gemma4` incluida en la model card, que sugiere una línea de desarrollo inspirada en la familia Gemma, pero no se aporta ninguna confirmación ni ficha técnica al respecto. Tampoco se indica si se trata de un transformer denso, un MoE o una arquitectura híbrida; el recuento de parámetros (4,63 B) y la ausencia de etiquetas MoE apuntan a un modelo denso, sin que esto pueda afirmarse con certeza.

En cuanto al entrenamiento, la model card declara el uso de Axolotl como marco de ajuste fino y una mezcla de cuatro datasets: `openbmb/UltraData-SFT-Agent-2609` (orientado a agentes y uso de herramientas), `oyc502/RoleMRC` (roleplay), `HuggingFaceH4/no_robots` (instrucciones de alta calidad) y `HuggingFaceTB/everyday-conversations-llama3.1-2k` (conversación cotidiana multi-turno). No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). Los ficheros `mmproj` indican la existencia de un codificador multimodal, pero no se detalla su arquitectura ni los datos de entrenamiento visual.

## Capacidades

- Generación de texto conversacional en inglés, con soporte declarado para diálogos multi-turno.
- Roleplay y adopción de personajes: el modelo incluye el dataset `oyc502/RoleMRC` en su entrenamiento, lo que sugiere especialización en interacción de rol.
- Uso de herramientas y function calling: la etiqueta `tool-use` y el dataset `UltraData-SFT-Agent-2609` apuntan a capacidades de invocación de herramientas y flujos de agente.
- Procesamiento multimodal de imagen: la presencia de los ficheros `mmproj-f16` y `mmproj-Q8_0` (0,7-1,1 GB) implica soporte de entrada visual, aunque no se documentan las tareas concretas soportadas.
- Razonamiento multi-paso y comportamiento agéntico: inferido del dataset de agentes, sin evaluación publicada.
- Multilingüismo: no disponible; solo se declara inglés.
- Modo «thinking» explícito: no disponible.
- Capacidades de audio o vídeo: no disponibles.
- Generación de código y matemáticas: no documentadas en la información disponible.

## Casos de uso

- Roleplay y compañía conversacional en local: el modelo se ha ajustado con datos de roleplay (`oyc502/RoleMRC`) y puede ejecutarse en un único equipo de consumo con cuantizaciones Q4_K_M (3,5 GB), lo que resulta adecuado para prototipos de personajes interactivos sin depender de API externas.
- Prototipado de agentes con tool calling: la inclusión del dataset `UltraData-SFT-Agent-2609` permite experimentar con pipelines de agentes que invoquen funciones, siempre que se validen manualmente las llamadas generadas, dado que no hay evaluaciones publicadas.
- Asistente conversacional en inglés para atención al cliente: el entrenamiento con `no_robots` y `everyday-conversations-llama3.1-2k` lo orienta a diálogos cotidianos multi-turno; su tamaño reducido permite desplegarlo en una única GPU consumer con coste bajo.
- Base para ajuste fino adicional: al ser un modelo de 4,63 B con cuants disponibles y estar entrenado con Axolotl, puede servir como punto de partida para fine-tuning específico de dominio en inglés con recursos modestos (una GPU de 24 GB en QLoRA).
- Análisis de imágenes en local con el complemento mmproj: la existencia de los ficheros multimodales permite experimentar con descripción de imágenes o extracción de información visual sin conexión a servicios externos, aunque la calidad real no está documentada.
- Investigación sobre cuantización y degradación de calidad: el repositorio ofrece 12 niveles de cuantización distintos del mismo modelo, lo que permite medir experimentalmente la pérdida de calidad entre Q2_K y f16 sobre una misma tarea.
- Evaluación comparativa en entornos de laboratorio: útil como punto de control en estudios sobre ajuste fino de modelos pequeños para conversación y agentes, precisamente porque sus datos de entrenamiento están enumerados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del cuantizador ni la información recopilada del modelo base incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench o cualquier otra métrica. Tampoco se han publicado comparativas de perplejidad entre las distintas cuantizaciones ofrecidas.

## Requisitos de hardware

- VRAM estimada para los pesos (según tamaño de fichero declarado, sin contar caché KV):
  - Q2_K: 3,1 GB; Q3_K_S: 3,2 GB; Q3_K_M: 3,3 GB; Q3_K_L: 3,4 GB; IQ4_XS: 3,4 GB.
  - Q4_K_S y Q4_K_M: 3,5 GB; Q5_K_S y Q5_K_M: 3,7 GB; Q6_K: 3,9 GB.
  - Q8_0: 5,0 GB; f16: 9,4 GB.
  - Complemento multimodal: mmproj-Q8_0 0,7 GB; mmproj-f16 1,1 GB.
- GPU recomendadas: para Q4_K_M bastan 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 2070 o superiores); para Q8_0 se recomiendan 8-12 GB; para f16 se necesitan al menos 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090, A100 40 GB si se busca holgura con contexto largo).
- Cabe en GPU de consumo: sí. Incluso la versión f16 (9,4 GB) entra en una RTX 4090 o en una RTX 3090/4080 de 16 GB, siempre que la longitud de contexto no sea elevada. Las cuantizaciones Q4 son aptas para portátiles con 8 GB de VRAM.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp) son las vías naturales para los ficheros GGUF; también es posible servir el modelo con vLLM o TGI usando el modelo base en safetensors, aunque no hay confirmación de compatibilidad. Los ficheros `mmproj` requieren un frontend que soporte modelos multimodales en GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni latencias para ninguna configuración de hardware.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que cualquier comparación cuantitativa sería especulativa. La tabla siguiente recoge únicamente diferencias estructurales frente a alternativas habituales de la misma franja de tamaño (los datos de los modelos comparados proceden de sus fichas públicas y no de una evaluación conjunta):

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS (este) | 4,63 B | no disponible | no disponible | no publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 (salvo variantes) | publicados por el autor |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria de Meta | publicados por el autor |
| Gemma-3-4B-IT | 4,3 B | 128.000 tokens | Términos de uso de Gemma | publicados por el autor |

La comparación relevante no es de rendimiento sino de disponibilidad legal y de soporte: frente a estas alternativas, el modelo Firefly-v6 no declara licencia, no tiene documentación de contexto y su autor lo marca como trabajo en curso, lo que lo sitúa en desventaja para cualquier uso en producción.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en el repositorio ni en la información disponible, lo que impide determinar si el uso comercial está permitido. En la práctica, debe tratarse como no autorizado para uso comercial hasta que el autor lo aclare.
- Nombre explícitamente disuasorio: el identificador incluye «DONTDOWNLOAD» y «STILLONPROGRESS», señales directas de que el autor considera el modelo incompleto o inadecuado para su uso.
- Sin datos de entrenamiento cuantificados: no se indica el número de tokens, la proporción de cada dataset ni si hubo fases de alineamiento (RLHF/DPO), lo que dificulta estimar el comportamiento real.
- Riesgo de alucinación: no evaluado. Al no existir benchmarks ni evaluaciones de fidelidad, no hay evidencia sobre la tasa de invención de hechos.
- Sesgos: no documentados. La mezcla de datasets (incluido roleplay y conversaciones cotidianas en inglés) puede introducir sesgos de estilo y de dominio no caracterizados.
- Limitación idiomática: solo se declara inglés. El rendimiento en castellano es desconocido y probablemente degradado.
- Contexto desconocido: no se especifica la ventana de contexto, por lo que no se puede planificar su uso en tareas que requieran documentos largos.
- Adopción nula: 0 descargas y 0 «likes» en el momento de la consulta, sin comunidad que haya validado el comportamiento del modelo.
- Multimodalidad sin documentación: los ficheros `mmproj` confirman la existencia de un componente visual, pero no se detallan las tareas soportadas ni la resolución de imagen admitida.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad respecto a f16, especialmente en un modelo pequeño; el propio autor marca Q3_K_M como «lower quality» y recomienda Q4_K_S, Q4_K_M y Q8_0.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Firefly-v6-DONTDOWNLOAD-STILLONPROGRESS-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Otro modelo de la misma serie publicado por el autor (relación no confirmada): https://huggingface.co/mradermacher/Firefly-v5-alpha-v2-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Dataset de agentes: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset de roleplay: https://huggingface.co/datasets/oyc502/RoleMRC
- Dataset de instrucciones: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset de conversación cotidiana: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
