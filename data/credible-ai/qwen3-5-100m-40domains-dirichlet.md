# credible-ai/qwen3.5-100M-40domains-dirichlet

## Resumen

`credible-ai/qwen3.5-100M-40domains-dirichlet` no es un modelo de lenguage para uso general, sino un banco de 512 modelos proxy de 104M de parámetros cada uno, entrenados desde cero por el Centre for Credible AI para estudiar la mezcla de datos de preentrenamiento. Cada carpeta `mix_<i>` contiene un modelo entrenado con una mezcla distinta, muestreada de una distribución de Dirichlet sobre 40 dominios: los 24 temas de WebOrganizer, los 15 lenguajes de programación de Stack-Edu y el subconjunto `4plus` de Nemotron-CC-Math. El repositorio completo ocupa 107 GB en bfloat16.

La relevancia es metodológica: en lugar de entrenar repetidamente modelos de escala frontier para decidir qué proporción de código, matemáticas o texto web incluir, el trabajo LinMix entrena un enjambre de proxies baratos y usa sus curvas de pérdida para predecir qué mezcla rinde mejor en el modelo grande. Los proxies son deliberadamente pequeños (12 capas, `hidden_size` 576) para que 512 entrenamientos de 3.200 millones de tokens cada uno sean asequibles.

Conviene no confundirlo con Qwen3.5: la arquitectura es "Qwen3.5-like" solo en el sentido de que implementa la clase `Qwen3_5ForCausalLM` de Transformers (>= 5.2), pero los pesos se entrenan desde cero con OLMo-core y no derivan del modelo de Alibaba (397B totales, 17B activos). El tokenizador es GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 12 capas, hidden size 576, entrenado desde cero |
| Parametros totales | 104M por modelo; 512 modelos en el repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no se publican versiones cuantizadas; los pesos se distribuyen en bfloat16 (convertibles a GGUF/INT8/INT4 al ser un denso de 104M, sin artefactos oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT para los pesos; los datos de entrenamiento quedan sujetos a los términos de Common Crawl, The Stack v2 y el NVIDIA Data Agreement for Model Training |
| Formato de pesos | safetensors (`transformers`), bfloat16 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 3.200 millones por modelo, con OLMo-core |
| Numero de modelos | 512, en carpetas `mix_0` a `mix_511`, cada una con su `mix.json` |
| Tamano del repositorio | 107 GB en total |

## Arquitectura y entrenamiento

Cada proxy es un transformer decoder-only denso de 104M de parámetros con 12 capas y `hidden_size` 576, registrado en Transformers como `Qwen3_5ForCausalLM` (requiere Transformers >= 5.2). No hay mezcla de expertos, ni attention linear, ni decodificación especulativa: el interés del artefacto está en el diseño experimental, no en innovaciones de arquitectura. El tokenizador es el de GPT-NeoX-20B, fijado en el raíz del repositorio para que los 512 modelos compartan exactamente la misma tokenización y sus pérdidas sean comparables.

El diseño de mezclas es un muestreo de Dirichlet sobre 40 dominios: 24 temas de WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), los 15 subconjuntos de lenguaje de HuggingFaceTB/stack-edu y el subconjunto `4plus` de nvidia/Nemotron-CC-Math-v1. Cada uno de los 512 modelos entrena 3.200 millones de tokens con OLMo-core, y la mezcla exacta usada queda registrada en `mix_<i>/mix.json`. La model card no menciona RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento: son modelos base puros. Las secuencias web tokenizadas se redistribuyen en `credible-ai/weborganizer-corpus-200b-tokenized`, mientras que las de Stack-Edu y Nemotron-CC-Math no se redistribuyen.

## Capacidades

- Generación de texto en inglés a nivel de modelo base de 104M de parámetros: completar frases y continuar documentos cortos, sin instrucciones ni diálogo.
- Predicción de pérdida sobre dominios concretos, que es la señal que se usa para comparar mezclas de datos entre los 512 proxies.
- Diferenciación por mezcla: cada checkpoint incorpora un sesgo medible hacia los dominios sobrerrepresentados en su `mix.json` (más código, más matemáticas o más texto web).
- Reproducibilidad experimental: tokenizador y arquitectura idénticos en los 512 modelos, lo que permite atribuir diferencias de pérdida a la mezcla y no al tokenizador.
- Sin tool calling, sin function calling, sin capacidades de agente, sin visión ni audio: no hay nada de eso documentado ni es esperable en un modelo de este tamaño sin ajuste.
- Multilingüe: no; el corpus es exclusivamente inglés.
- Capacidad especial: ninguna (no hay modo "thinking", ni decodificación especulativa, ni atención lineal).

## Casos de uso

- Selección de mezclas antes de un entrenamiento caro: se entrenan o evalúan los proxies sobre las mezclas candidatas, se mide la pérdida en un conjunto de validación por dominio y se elige la mezcla a escalar, evitando lanzar un run de miles de millones de parámetros a ciegas.
- Ajuste de un optimizador de mezclas tipo LinMix: los 512 pares (mezcla, pérdida) actúan como conjunto de entrenamiento para un modelo que predice el rendimiento de mezclas no vistas y del que se extrae la mezcla óptima.
- Estudio de transferencia de rankings: comparar el orden de mezclas que produce el proxy de 104M con el que produce un modelo mayor entrenado con las mismas mezclas, para cuantificar hasta qué punto el proxy es un surrogate fiable.
- Ablaciones de dominio controladas: aislar el efecto de añadir o quitar un lenguaje de programación concreto (por ejemplo, Rust frente a Julia en Stack-Edu) o un tema web específico, con el resto de la mezcla fija.
- Investigación sobre redundancia y solapamiento entre dominios: analizar correlaciones de pérdida entre los 40 dominios para detectar qué fuentes aportan señal nueva y cuáles son intercambiables.
- Docencia y reproducción académica: un laboratorio puede descargar dos o tres `mix_*` y reproducir el pipeline completo (tokenización, OLMo-core, evaluación por dominio) en hardware de consumo en horas, no semanas.
- Pruebas de infraestructura de entrenamiento e inferencia: al ser modelos de 208 MB en bf16, sirven como banco de pruebas para validar pipelines de `snapshot_download`, sharding, checkpoints y motores de inferencia antes de escalar.
- Generación de texto sintético de baja calidad para tests de sistemas: rellenar colas, generar cargas de tokens o probar formateadores sin coste apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen cifras de MMLU, HumanEval, GSM8K ni de perplejidad por dominio; el diseño experimental, los resultados y las secuencias de entrenamiento se remiten al dataset `credible-ai/linmix-proxy-swarms`, que no se ha podido consultar aquí.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,21 GB por modelo en bfloat16 y 0,42 GB en fp32. Cabe holgadamente en cualquier GPU con 1 GB o más.
- GPU recomendadas: ninguna en particular; una RTX 3060, una T4 o incluso CPU son suficientes para un solo proxy. Para evaluar los 512 en barrido conviene una A100/H100 o varias GPU consumer en paralelo, ya que el cuello de botella es el número de ejecuciones, no el tamaño.
- GPU de consumo: sí, cualquier GPU consumer de los últimos ocho años puede ejecutar un proxy; el límite real es el almacenamiento (107 GB para el repositorio completo, distribuido con Xet).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., subfolder="mix_17")`, y descarga selectiva con `snapshot_download(..., allow_patterns=["mix_17/*", "tokenizer*"])`. Para lotes grandes, `vLLM` o `TGI` son opciones plausibles, pero no hay soporte verificado para esta clase en la información disponible; `llama.cpp`/Ollama requerirían una conversión a GGUF que no se publica.
- Latencia y throughput: no disponibles. A modo orientativo, 104M de parámetros es un orden de magnitud por debajo de un 1B, pero no hay mediciones publicadas que se puedan citar.

## Comparativa con modelos similares

No hay una comparación directa publicada. Los proxies de LinMix no compiten con asistentes, sino con otros proxies de mezcla de datos, un espacio donde apenas hay artefactos públicos. Como referencia de tamaño y propósito:

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| qwen3.5-100M-40domains-dirichlet (este) | 104M por modelo, 512 modelos | no disponible | Proxy de mezcla de datos, modelo base en inglés | MIT (pesos) |
| Pythia-160M | 162M | 2048 (según su model card pública) | Suite de modelos base para investigación de interpretabilidad y escalado | Apache 2.0 |
| GPT-2 small | 124M | 1024 (según su model card pública) | Modelo base de referencia histórica | Modified MIT |
| SmolLM-135M | 135M | 2048 (según su model card pública) | Modelo base pequeño orientado a despliegue en dispositivo | Apache 2.0 |

La diferencia relevante no es de rendimiento, sino de diseño: Pythia, GPT-2 y SmolLM son checkpoints únicos pensados para ser usados o ajustados, mientras que este repositorio es un conjunto de 512 réplicas controladas cuyo valor está en la variación entre ellas. Frente a todos ellos, la licencia MIT de los pesos es la más permisiva, aunque los datos subyacentes arrastran condiciones de Common Crawl, The Stack v2 y NVIDIA.

## Limitaciones y advertencias

- No es un asistente. Es un modelo base de 104M sin ajuste por instrucciones ni alineación; no sigue instrucciones, no mantiene diálogo y su coherencia decae en pocas frases.
- Calidad de generación muy limitada: con 3.200 millones de tokens vistos y 104M de parámetros, la perplejidad será alta y la alucinación de hechos, sistemática. No debe usarse para responder preguntas ni para generar contenido publicado.
- Solo inglés. No hay evidencia de competencia en castellano ni en ningún otro idioma, y el tokenizador GPT-NeoX no está optimizado para ellos.
- Longitud de contexto no documentada. Cualquier uso con entradas largas exige verificar empíricamente dónde empieza a degradarse la pérdida.
- Validez del proxy. Que una mezcla gane a 104M no garantiza que gane a escala grande; la transferencia del ranking es precisamente la hipótesis que el trabajo intenta validar, no un resultado asegurado.
- Licencia de los datos. Los pesos son MIT, pero el corpus combina DCLM 1b-1x (CC-BY-4.0) bajo los términos de uso de Common Crawl, los 15 subconjuntos de Stack-Edu bajo los términos de The Stack v2 y Nemotron-CC-Math bajo el NVIDIA Data Agreement for Model Training. El uso comercial de los pesos hereda esas condiciones sobre los datos, y no se redistribuyen las secuencias de Stack-Edu ni de Nemotron.
- Coste de almacenamiento: 107 GB para el conjunto completo en bfloat16, con descarga vía Xet. Descargar el repositorio entero para usar un solo proxy es un error frecuente; conviene usar `allow_patterns`.
- Dependencia de versión: requiere Transformers >= 5.2 por la clase `Qwen3_5ForCausalLM`. En versiones anteriores la carga falla, y muchos motores de inferencia pueden no reconocer la arquitectura todavía.
- Sesgos: al entrenar sobre Common Crawl y código, reproduce los sesgos de esas fuentes, sin ninguna mitigación posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Dataset con diseño, resultados y secuencias de entrenamiento: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Corpus web tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Código de LinMix: https://github.com/credibleai/linmix
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool original DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Términos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
