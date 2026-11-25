# mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF es la versión cuantizada en formato GGUF, generada con imatrix (quants i1), del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored. El modelo original es un fine-tune de la familia Qwen3.8 (según el autor, sobre una base Qwen3.8/Qwen3.6) con 27.320.697.856 parámetros totales, orientado a eliminar el alineamiento restrictivo ("heretic"/"uncensored") y a habilitar modos de razonamiento e instrucción múltiples. Esta versión la publica mradermacher, especialista en cuantización GGUF para llama.cpp.

El interés práctico de esta ficha es doble. Por un lado, ofrece el modelo en cuantizaciones que van de ~11 GB (i1-Q2_K) a ~22,5 GB (i1-Q6_K), lo que permite ejecutarlo en GPU de consumo con suficiente VRAM o incluso en configuraciones con offload parcial a CPU. Por otro, el autor del modelo base declara un conjunto amplio de "modos" (27 reasoning modes, 27 instruct modes, constructs AGI) y capacidades multimodales (el repositorio indica que es un modelo de visión, con ficheros mmproj en el repositorio estático).

Conviene tratarlo con cautela: se trata de un fine-tune comunitario con licencia Apache 2.0 declarada, sin benchmarks publicados en la información disponible, y con un nombre y una model card que mezclan terminología de marketing con especificaciones técnicas. Es relevante ahora porque demuestra el patrón actual de la comunidad: tomar una base Qwen de ~27B, aplicar tuning multi-etapa y publicar cuantizaciones GGUF listas para inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de la familia Qwen3.8/Qwen3.6; detalles de capas y atención no disponibles) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix y quants estáticos en el repo hermano) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer de la familia Qwen3.8/Qwen3.6 con 27,3B parámetros y pesos en bfloat16 en el modelo base. El autor etiqueta el entrenamiento como "multi-stage tuning", "GAIN Training", "Cold Fusion" y fine-tune con Unsloth, pero no se aportan cifras de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO. Los datasets referenciados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, sin descripción de su contenido en la información proporcionada.

La innovación declarada es de tipo conductual más que arquitectónica: el autor afirma incluir 27 modos de razonamiento, 27 modos de instrucción, 9 modos de razonamiento "Xhigh", 15 "AI Constructs", 5 "Super AI Constructs" y 21 "AGI Constructs" (Brainstorm, Brainstorm Business, Universal Teacher, Agent, Coder). No hay documentación técnica que explique cómo se activan estos modos ni qué prompts o tokens de control usan; debe verificarse empíricamente. Esta versión i1 aplica cuantización con matriz de importancia (imatrix) sobre el modelo base, lo que en la práctica de llama.cpp suele mejorar la percalidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas declarados (incluido español).
- Razonamiento explícito y "thinking": el autor declara modos de razonamiento e instrucción separados, incluidos modos de razonamiento extendido ("Xhigh").
- Generación de código: etiquetado con "coder" y con un "Coder AI Construct" específico.
- Escritura creativa: ficción, relatos, roleplaying y "all genres", según las etiquetas del autor.
- Capacidad multimodal: el repositorio indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático hermano.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: declarado mediante el "Agent AI Construct", sin detalles técnicos.
- Modo "uncensored"/"heretic": el fine-tune está orientado a reducir rechazos y filtros de alineamiento.

## Casos de uso

- Asistente conversacional local sin filtros: desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de 24 GB (quant i1-Q4_K_M, ~16,9 GB), útil para prototipos donde se necesita control total del modelo y de los datos.
- Escritura creativa y ficción: el modelo está entrenado explícitamente para relatos, roleplaying y géneros diversos; con contexto largo (si la base Qwen lo permite) se pueden mantener arcos narrativos extensos en una sola sesión.
- Generación de código en local: las etiquetas "coder" y el "Coder AI Construct" lo orientan a autocompletado y explicación de código; se puede integrar en un servidor llama.cpp con API compatible con OpenAI para editores tipo Continue o similar.
- Razonamiento paso a paso en entornos aislados: los modos de razonamiento permiten obtener cadenas de pensamiento explícitas para tareas de análisis, siempre que se valide la calidad real, ya que no hay benchmarks publicados.
- Experimentación en investigación sobre alineamiento: al ser un fine-tune "heretic" con licencia Apache 2.0, sirve como contrapunto en estudios comparativos de comportamiento entre modelos alineados y no alineados.
- Traducción y atención multilingüe: con 16 idiomas declarados, puede usarse para borradores de traducción o atención al cliente en mercados como español, portugués, francés, alemán, árabe o chino, verificando calidad caso por caso.
- Prototipado de agentes: el "Agent AI Construct" y las etiquetas de tool use (no confirmadas) permiten probar flujos de agente con llamadas a herramientas en local antes de pasar a modelos con soporte oficial documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada de inferencia (solo pesos, sin KV cache): ~11 GB con i1-Q2_K, ~15,9 GB con i1-Q4_K_S, ~16,9 GB con i1-Q4_K_M, ~19,6 GB con i1-Q5_K_M y ~22,5 GB con i1-Q6_K. Hay que sumar la memoria del contexto y del KV cache.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para i1-Q4_K_M/i1-Q5_K_M con contexto moderado; A100 40/80 GB o H100 para mayor contexto y throughput; RTX 4080/4070 Ti Super (16 GB) solo con cuantizaciones Q3 o IQ3 y contexto recortado.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB con cuantizaciones Q4/Q5; en 16 GB con IQ3 o Q3_K_M; en 12 GB solo con Q2_K y contexto muy limitado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, servidores compatibles con la API de llama.cpp (p. ej. llama-server). vLLM y TGI no soportan GGUF de forma general, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, del quant y del tamaño de contexto. Como referencia cualitativa, la model card de mradermacher señala i1-Q4_K_M como "fast, recommended" e i1-Q4_0 como "fast, low quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tune comunitario "uncensored", sin benchmarks |
| Qwen3.8-27B-Ultimate-Heretic-Uncensored (estático GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Mismo modelo con quants estáticos en repo hermano |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | 27,3B | no disponible | Apache 2.0 | safetensors, bfloat16 | Modelo original antes de cuantizar |
| Alternativas de ~27B de la familia Qwen oficial | ~27B | no disponible | según versión | safetensors/GGUF | No se dispone de datos de comparación en la información proporcionada |

No hay datos de rendimiento comparado (MMLU, HumanEval, GSM8K) en la información disponible, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en razonamiento, código o matemáticas; cualquier uso en producción exige evaluación propia.
- Riesgo de alucinación elevado por diseño: al ser un fine-tune "uncensored"/"heretic", se reduce la probabilidad de rechazos, pero también la de autocorrección y las salvaguardas; no es adecuado para aplicaciones donde la veracidad sea crítica sin verificación externa.
- Sesgos: al no documentarse la composición del dataset de fine-tune, no se pueden caracterizar los sesgos; es esperable que herede los de la base Qwen más los introducidos por los datasets Polar-STRICT y F451-STRICT.
- Idiomas: se declaran 16 idiomas, pero no hay evaluación de calidad por idioma; el español está listado, aunque el rendimiento real no está verificado.
- Contexto: la longitud de contexto no está documentada; no se debe asumir la de la base Qwen sin comprobarla empíricamente.
- Licencia: Apache 2.0 declarada, lo que permite uso comercial, pero conviene revisar los términos de la base Qwen original y de los datasets, ya que el fine-tune comunitario puede no reflejar todas las restricciones heredadas.
- Terminología de marketing: etiquetas como "AGI Constructs" o "Turbo-Brilliance" no tienen respaldo técnico documentado; trátese como nombres de modos de prompt, no como capacidades garantizadas.
- Visión: la model card indica que es un modelo de visión, pero los ficheros mmproj, si existen, están en el repositorio estático; verificar antes de asumir soporte multimodal en esta versión i1.
- Producción: al ser un fine-tune de un solo autor con 2 likes y sin mantenimiento documentado, el soporte y la reproducibilidad son limitados.

## Enlaces

- Repositorio Hugging Face (esta versión i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfica de percalidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
