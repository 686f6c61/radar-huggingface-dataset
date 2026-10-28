# credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa

## Resumen

`credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa` es un modelo de lenguaje de tipo causal, con arquitectura OLMo 2 y 1.414.678.528 parámetros (aproximadamente 1,41B), preentrenado desde cero sobre 32.000 millones de tokens extraídos del corpus WebOrganizer. Lo desarrolla el grupo credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix, centrado en la optimización de mezclas de datos de preentrenamiento.

El problema que aborda no es el de un modelo de propósito general, sino el de la selección de datos: el corpus se organiza en 288 dominios resultado de cruzar temática y formato, y los pesos de mezcla entre esos dominios se optimizan mediante RegMix, que ajusta un sustituto (surrogate) LightGBM sobre un enjambre de muestras Dirichlet evaluadas con un modelo proxy de 60M parámetros. La mezcla final se selecciona maximizando el rendimiento en HellaSwag y PIQA. El entrenamiento se realizó con OLMo-core y los pesos se distribuyen en bfloat16.

Es relevante ahora porque se publica junto al código de LinMix y al corpus tokenizado, lo que permite reproducir de extremo a extremo la metodología de mezcla de datos con un modelo de escala manejable. El autor advierte explícitamente de que no es un modelo de lenguaje de propósito general. Solo soporta inglés, la licencia es MIT y el repositorio ocupa 2,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (aproximadamente 1,41B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ en el repositorio |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Datos de entrenamiento | 32.000 millones de tokens de WebOrganizer/Corpus-200B |
| Libreria | transformers |
| Tamano del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 implementada en Transformers como `Olmo2ForCausalLM`: un transformer decoder-only denso de 18 capas con tamano oculto 2048, lo que da lugar a los 1,41B parametros. Usa el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 entradas. El preentrenamiento se ejecuto con OLMo-core sobre 32.000 millones de tokens en bfloat16.

La innovacion esta en la composicion del corpus, no en el bloque arquitectonico. WebOrganizer/Corpus-200B se descompone en 288 dominios que cruzan tematica y formato; sobre ellos se aplica RegMix, que entrena un sustituto LightGBM a partir de un enjambre de mezclas Dirichlet evaluadas con el modelo proxy `credible-ai/olmo2-60M-288domains-dirichlet`. La mezcla resultante, optimizada para HellaSwag y PIQA, se guarda en el repositorio como `mix.json`. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base. Los datos derivan del pool DCLM 1b-1x (CC-BY-4.0) y estan sujetos a los terminos de uso de Common Crawl.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo modelo base (continuacion de texto, no dialogo instruido).
- Razonamiento de sentido comun y fisico de forma indirecta, ya que la mezcla de datos se optimizo para HellaSwag y PIQA.
- Reproduccion de experimentos de mezcla de datos: el repositorio incluye `mix.json` con la mezcla exacta de entrenamiento.
- Evaluacion controlada de tecnicas de data mixing (RegMix, Dirichlet swarm, surrogate LightGBM) frente a lineas base.
- Capacidad multilingue: limitada al ingles segun la model card.
- Tool calling / function calling: no documentado; al ser un modelo base sin ajuste por instrucciones, no cabe esperar un soporte fiable.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Reproduccion del articulo LinMix: cargar los pesos y el `mix.json` para verificar que la mezcla optimizada con RegMix sobre 288 dominios produce el comportamiento reportado, sin tener que reentrenar desde cero.
- Estudio de optimizacion de mezclas de datos a escala 1B: usar este modelo como punto de referencia entrenado y comparar contra mezclas uniformes o heuristicas, manteniendo constante el resto del pipeline de OLMo-core.
- Investigacion sobre sesgo inducido por dominio: al conocer los pesos exactos por tematica y formato, se puede correlacionar la composicion del corpus con el comportamiento generativo observado en dominios concretos.
- Validacion de modelos proxy pequenos: comparar las predicciones del proxy de 60M (`olmo2-60M-288domains-dirichlet`) con el resultado real a 1B para medir la fidelidad del enjambre Dirichlet.
- Docencia y experimentacion academica: un modelo de 1,41B en bfloat16 (unos 2,8 GB) se puede ajustar o evaluar en una unica GPU de consumo, lo que lo hace util para cursos de entrenamiento de LLM.
- Generacion de texto en ingles para tareas de continuacion y relleno no criticas, siempre con la advertencia de que no ha recibido ajuste por instrucciones ni alineamiento.
- Analisis de procedencia de datos: el corpus tokenizado publicado permite auditar que secuencias concretas vieron los pesos, util en estudios de atribucion y memorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla se optimizo para HellaSwag y PIQA, pero no reporta las puntuaciones obtenidas por este modelo en ninguna de las dos tareas ni en otros conjuntos como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 2,9 GB solo para pesos; con cache KV y overhead de runtime, entre 4 y 6 GB segun longitud de secuencia.
- VRAM en cuantizacion int8: alrededor de 1,5 GB de pesos; en int4, alrededor de 0,8 GB. No se distribuyen pesos cuantizados oficiales, habria que generarlos.
- GPU de datacenter: A100 40/80 GB, H100, L40S. Ninguna es necesaria por capacidad, pero son utiles para throughput alto en lotes grandes.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 8 GB en bfloat16 con secuencias moderadas.
- CPU: viable con llama.cpp u Ollama tras convertir los pesos a GGUF; no hay GGUF publicado en el repositorio.
- Opciones de despliegue: `transformers` (ruta nativa documentada), vLLM y TGI para servicio con concurrencia, llama.cpp/Ollama para CPU o GPU de gama baja. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa` | 1,41B | no disponible | MIT | Artefacto de investigacion sobre mezcla de datos |
| `allenai/OLMo-2-0425-1B` | aproximadamente 1,5B | no disponible en esta ficha | Apache 2.0 (modelo base de referencia) | Modelo base de proposito general con corpus completamente abierto |
| `HuggingFaceTB/SmolLM2-1.7B` | 1,7B | no disponible en esta ficha | Apache 2.0 | Modelo pequeno con versiones base e instruct |
| `Qwen/Qwen2.5-1.5B` | 1,5B | no disponible en esta ficha | Apache 2.0 | Modelo multilingue con versiones base e instruct |

La diferencia fundamental es que las alternativas son modelos de proposito general mantenidos por laboratorios con pipelines de alineamiento, mientras que este es un artefacto de investigacion de un solo proposito, sin ajuste por instrucciones, sin benchmarks publicados y con cero descargas. Para cualquier uso en producto, las alternativas son preferibles; para estudiar mezcla de datos, este modelo aporta la ventaja de exponer la mezcla exacta y el corpus tokenizado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento: no es adecuado como asistente conversacional ni para seguir instrucciones de forma fiable.
- El autor lo describe explicitamente como artefacto de investigacion para reproducir LinMix, no como modelo de proposito general.
- Solo ingles; sin capacidades multilingues declaradas.
- Entrenado con 32.000 millones de tokens, muy por debajo de los presupuestos habituales de los modelos de su tamano, lo que limita su calidad frente a alternativas de la misma escala.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, agravado por la ausencia de RLHF/DPO y por la procedencia web del corpus (Common Crawl).
- Sesgos heredados del corpus DCLM/WebOrganizer: dominios sobrerrepresentados segun la mezcla optimizada, con posible sesgo de tematica, formato y variedad dialectal del ingles.
- La mezcla se optimizo especificamente para HellaSwag y PIQA, lo que puede producir sobreajuste a esas tareas y degradar el rendimiento en otras.
- Longitud de contexto no documentada; conviene verificarla empiricamente antes de disenar prompts largos.
- Licencia MIT para los pesos, pero los datos subyacentes estan sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl, lo que puede imponer obligaciones adicionales en un uso comercial.
- Sin descargas ni validacion por parte de la comunidad (0 descargas, 0 likes); no hay evidencia externa de calidad.
- No hay pesos cuantizados oficiales ni artefactos GGUF; el despliegue en llama.cpp requiere conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-lightgbm-hellaswagpiqa
- Modelo proxy del enjambre Dirichlet (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Codigo de LinMix: https://github.com/credibleai/linmix
- OLMo-core (framework de entrenamiento): https://github.com/allenai/OLMo-core
- Documentacion de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados disponibles.
