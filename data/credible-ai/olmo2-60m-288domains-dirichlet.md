# credible-ai/olmo2-60M-288domains-dirichlet

## Resumen

`olmo2-60M-288domains-dirichlet` es un repositorio publicado por credible-ai que reúne 1.024 modelos de lenguaje preentrenados de 57,6 millones de parámetros, uno por cada mezcla de datos generada con un diseño Dirichlet sobre 288 dominios (tema × formato) del corpus WebOrganizer. No es un modelo único orientado a uso final, sino un enjambre de modelos proxy (sustitutos a pequeña escala) concebido para estudiar cómo influye la composición de los datos de entrenamiento en el rendimiento, en el marco del paper LinMix.

Cada proxy es un transformer denso autoregresivo OLMo 2 (`Olmo2ForCausalLM`) de 8 capas y dimensión oculta 384, con tokenizador GPT-NeoX-20B de 50.432 entradas. Se entrenó con 2.000 millones de tokens mediante OLMo-core, y cada carpeta `mix_<i>` incluye un `mix.json` con la mezcla exacta empleada, lo que permite reproducir el experimento y relacionar mezcla con comportamiento.

Su relevancia es metodológica: permiten barridos masivos de mezclas de datos con un coste de cómputo reducido (118 GB en total en bfloat16) y extraer conclusiones antes de entrenar modelos grandes. Los pesos se publican bajo licencia MIT, mientras que los datos subyacentes proceden de DCLM y están sujetos a los términos de uso de Common Crawl.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo OLMo 2 (`Olmo2ForCausalLM`), 8 capas, dimensión oculta 384 |
| Parámetros totales | 57,6 M por modelo; 1.024 modelos en el repositorio |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se publican en bfloat16 y no se incluyen variantes GGUF ni cuantizadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT para los pesos; datos derivados de DCLM (CC-BY-4.0) y sujetos a los términos de Common Crawl |
| Formato de pesos | safetensors en bfloat16, en subcarpetas `mix_0` a `mix_1023` |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens, situado en la raíz del repositorio |
| Tokens de entrenamiento | 2.000 millones por modelo |
| Tamaño del repositorio | 118 GB |
| Framework | transformers; entrenamiento con OLMo-core |
| Fecha de publicación | 27 de octubre de 2026, según HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo 2 en escala reducida: un decoder transformer denso, sin mezcla de expertos, con 8 capas y anchura 384, adaptado mediante la clase `Olmo2ForCausalLM` de transformers. El tokenizador es el de GPT-NeoX-20B, compartido por los 1.024 modelos y alojado en la raíz del repositorio, lo que garantiza que todos los proxies operan sobre el mismo espacio de tokens y facilita las comparaciones entre mezclas.

El entrenamiento se realizó con OLMo-core sobre 2.000 millones de tokens por modelo, muestreados de `WebOrganizer/Corpus-200B`, un corpus derivado del pool DCLM 1b-1x y organizado en 288 dominios de tema y formato. Cada proxy corresponde a una mezcla distinta generada con un diseño Dirichlet sobre esos 288 dominios; el archivo `mix_<i>/mix.json` documenta los pesos exactos de la mezcla. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones: son modelos base de preentrenamiento. La innovación principal es el propio diseño LinMix de enjambres de proxies para explorar el espacio de mezclas de datos a bajo coste.

## Capacidades

- Generación de texto autoregresiva básica: predicción del siguiente token sobre texto en inglés.
- Modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable ni mantiene formatos conversacionales.
- Capacidad de ajuste fino posterior para tareas concretas de investigación o clasificación.
- Entrenamiento y evaluación reproducibles: cada modelo incluye la mezcla de datos exacta en `mix.json`.
- Comparación controlada entre 1.024 mezclas de datos sobre una arquitectura y tokenizador idénticos.
- No soporta tool calling ni function calling de forma nativa.
- No incorpora capacidades de agente, razonamiento multi-paso dirigido ni modo de pensamiento explícito.
- No dispone de visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés según la model card.
- Longitud de contexto no documentada, por lo que no se puede garantizar el manejo de ventanas largas.

## Casos de uso

- Investigación de mezclas de datos: entrenar y evaluar los 1.024 proxies para ajustar un modelo de regresión que relacione la proporción de cada dominio con el rendimiento en tareas objetivo, y extrapolar qué mezcla conviene usar en un modelo grande.
- Ablación de dominios individuales: comparar pares de proxies cuyas mezclas difieren en un solo dominio para estimar el efecto marginal de ese dominio sobre la pérdida de validación.
- Calibración de leyes de escala: combinar estos proxies de 57,6 M con la variante de 30 M del mismo repositorio para estudiar cómo cambia la utilidad de una mezcla con el tamaño del modelo.
- Filtrado barato de datasets: usar los proxies como criba previa para descartar fuentes de datos problemáticas antes de invertir cómputo en un preentrenamiento a gran escala.
- Experimentos de currículo y orden de datos: reentrenar proxies con secuencias del dataset tokenizado `weborganizer-corpus-200b-tokenized` para medir el efecto del orden de exposición a los dominios.
- Validación de infraestructura de entrenamiento: emplear OLMo-core y estos checkpoints como banco de pruebas de pipelines distribuidos, tokenización y registro de métricas sin necesidad de GPUs de gran memoria.
- Análisis de sesgos por dominio: estudiar qué temas y formatos del corpus web inducen comportamientos estereotipados o vocabulario tóxico en un modelo pequeño antes de que esos datos entren en un modelo de producción.
- Docencia e investigación académica: reproducir un experimento completo de mezcla de datos con un coste de almacenamiento y cómputo asumible por un grupo universitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de pérdida de validación, y los resultados del paper LinMix se remiten al repositorio de datos `credible-ai/linmix-proxy-swarms`, cuyos valores no se han proporcionado. No se deben inferir cifras a partir del tamaño del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,12 GB de pesos por modelo en bfloat16, 0,23 GB en fp32 y 0,06 GB en int8 teórico; el caché KV depende de una longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU consumer con más de 2 GB de VRAM puede ejecutar un proxy; una RTX 4090, A100 o H100 permite cargar decenas o cientos de proxies en paralelo para barridos masivos.
- Cabe en GPU consumer: sí, en GTX/RTX de gama baja, e incluso en CPU para inferencia puntual.
- Despliegue documentado: transformers mediante `AutoModelForCausalLM` y `snapshot_download` con `allow_patterns` para descargar solo las mezclas necesarias; el entrenamiento se realizó con OLMo-core.
- vLLM, TGI, llama.cpp y Ollama no están documentados para este checkpoint; para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no hay cifras publicadas. El tamaño reducido del modelo hace esperable una latencia baja por token en GPU moderna, pero no se dispone de mediciones verificables.
- Almacenamiento: 118 GB para el repositorio completo; conviene descargar únicamente las carpetas `mix_<i>` relevantes para reducir espacio y tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| `credible-ai/olmo2-60M-288domains-dirichlet` | 57,6 M por modelo, 1.024 modelos | no disponible | MIT | HuggingFace | no disponibles |
| `credible-ai/olmo2-30M-288domains-dirichlet` | denominación de 30 M, mismo diseño | no disponible | no disponible en la información consultada | HuggingFace | no disponibles |
| Pythia-70M | 70 M | no disponible en la información consultada | no disponible en la información consultada | no disponible en la información consultada | no disponibles |

La comparación con alternativas de propósito general queda limitada porque este repositorio no es un modelo único, sino una familia de proxies para experimentación sobre mezclas de datos; no se dispone de métricas comunes que permitan situarlo frente a modelos base de tamaño parecido.

## Limitaciones y advertencias

- Modelo base sin alineación: no se ha aplicado RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido incoherente, ofensivo o sesgado.
- Conocimiento muy limitado: 57,6 M de parámetros y 2.000 millones de tokens de entrenamiento implican una capacidad factual y de razonamiento baja y una alta propensión a la alucinación.
- Sesgos del corpus: los datos provienen de Common Crawl y del pool DCLM, con los sesgos de representación, idioma y calidad propios del texto web.
- Idioma: solo inglés según la model card; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- Contexto no documentado: no se puede asumir una ventana concreta ni planificar cargas de contexto largo sin verificar la configuración.
- Licencia: los pesos son MIT, pero los datos subyacentes están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl, lo que puede condicionar la redistribución y el uso comercial de derivados.
- Volumen: 118 GB para 1.024 checkpoints; descargar el repositorio completo sin filtrar por `allow_patterns` consume almacenamiento y ancho de banda considerables.
- No apto como modelo de producción conversacional: no hay soporte de herramientas, agentes ni instrucciones, y no se han publicado evaluaciones de calidad.
- Redundancia entre proxies: al proceder de un diseño Dirichlet, muchas mezclas son similares; conviene seleccionar un subconjunto antes de lanzar experimentos a gran escala.

## Enlaces

- Repositorio del modelo: https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Variante de 30 M: https://huggingface.co/credible-ai/olmo2-30M-288domains-dirichlet
- Dataset con diseño y resultados de LinMix: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Corpus WebOrganizer 200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas de entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Código de LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Página oficial de OLMo 2: https://allenai.org/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Revisión del paper OLMo 2 en OpenReview: https://openreview.net/forum?id=2ezugTT9kU
