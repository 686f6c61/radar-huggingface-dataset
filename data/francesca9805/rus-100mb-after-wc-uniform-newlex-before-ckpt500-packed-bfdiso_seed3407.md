# francesca9805/rus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

Este modelo es un ajuste fino mediante aprendizaje supervisado (SFT) del modelo base `francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfdiso_seed3407`, publicado por el usuario de HuggingFace francesca9805. Según el enlace de Weights & Biases incluido en la model card, el entrenamiento se ejecuta en el espacio de trabajo `f-padovani-university-of-groningen`, lo que apunta a un proyecto de investigación académica sobre tokenización y modelado de lenguaje. La arquitectura es GPT-2 (transformer decoder-only) y el recuento real de parámetros en safetensors es de 124.770.816, en línea con la variante GPT-2 small.

El nombre del repositorio sugiere que el modelo forma parte de una línea de experimentos controlados sobre tokenizadores: `wc-uniform` (probablemente tokenizador uniforme por palabras), `newlex` (nuevo léxico o vocabulario), `rus` (ruso), `100mb` (corpus de entrenamiento de aproximadamente 100 MB), `before-ckpt500` (estado anterior al checkpoint 500) y `seed3407` (semilla de inicialización). Existen repositorios paralelos de la misma autora para otros idiomas como inglés (`eng`), italiano (`ita`), japonés (`jpn`) y tamil, lo que confirma que se trata de una comparativa multilingüe centrada en el efecto del tokenizador.

Es relevante ahora como artefacto de investigación reproducible para estudiar cómo distintas decisiones de tokenización afectan al rendimiento de modelos pequeños en ruso, y no como un modelo orientado a producción. No tiene descargas ni interacciones, no declara licencia y no incluye resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), etiquetado como `gpt2` en HuggingFace |
| Parametros totales | 124.770.816 (aproximadamente 124,8 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere ruso) |
| Licencia | no disponible (la model card incluye el marcador `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfdiso_seed3407 |
| Libreria | transformers (tambien compatible con text-generation-inference) |
| Tamano del repositorio | 0,8 GB |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Metodo de ajuste | SFT (supervised fine-tuning) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2, es decir, un transformer decoder-only autorregresivo con atención causal. El recuento de 124.770.816 parámetros coincide con la configuración de GPT-2 small (12 capas, 12 cabezas de atención y dimensión oculta 768), aunque el vocabulario podría diferir del original de 50.257 tokens al tratarse de un tokenizador `newlex` específico del experimento. No se dispone de la configuración exacta (número de capas, cabezas ni longitud de contexto) en la información proporcionada.

El entrenamiento se realizó mediante SFT con la librería TRL sobre un corpus de aproximadamente 100 MB según indica el nombre del repositorio, con el estado correspondiente al checkpoint 500 del modelo base (`before-ckpt500`). El nombre incluye referencias a `packed` (secuencias empaquetadas) y `bfdiso`, probablemente una combinación de banderas de configuración del pipeline (por ejemplo, `bfd` de bfloat16 o similar e `iso`), pero no hay documentación que lo confirme. No se documentan técnicas de RLHF, DPO ni decodificación especulativa, y no se detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Generacion de texto autorregresiva en el idioma o idiomas del corpus de entrenamiento (probablemente ruso).
- Ajuste supervisado orientado a seguir instrucciones en formato conversacional, ya que el ejemplo de la model card usa el pipeline con una lista de mensajes con rol `user`.
- Integracion directa con `transformers`, `text-generation-inference` y endpoints compatibles de HuggingFace.
- Compatibilidad con el ecosistema TRL y PyTorch para continuar el entrenamiento o reajustar.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- No se documenta soporte multilingüe más allá del idioma objetivo del experimento.

## Casos de uso

- Investigación sobre tokenizadores: reproducir el experimento comparando este modelo con las variantes `eng`, `ita`, `jpn` y otras de la misma autora para medir el impacto del tokenizador `wc-uniform-newlex` en el rendimiento por idioma.
- Estudio de ajuste SFT a pequeña escala: usar el modelo como caso de referencia para analizar cómo 100 MB de datos y 500 pasos de checkpoint afectan a la perplejidad en ruso.
- Generación de texto en ruso de bajo coste: al tener solo 124,8 millones de parámetros, puede ejecutarse en portátiles o CPUs para prototipos de generación de texto sin requisitos de GPU.
- Base para fine-tuning posterior: sirve como punto de partida para tareas específicas de investigación en ruso sin necesidad de partir de un modelo grande.
- Docencia y prácticas: por su tamaño reducido, es adecuado para enseñar el flujo completo de transformers, TRL y despliegue con `pipeline`.
- Reproducibilidad académica: al publicar la semilla (`seed3407`) y el enlace a Weights & Biases, facilita la verificación de resultados en artículos o tesis sobre tokenización.
- Comparación de vocabularios: analizar la cobertura léxica del tokenizador `newlex` frente a tokenizadores estándar de GPT-2 en corpus rusos.
- Pruebas de infraestructura: validar pipelines con `text-generation-inference`, `transformers` o endpoints de HuggingFace con un modelo ligero antes de escalar a otros mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y no se han encontrado evaluaciones en los resultados de búsqueda web. El único dato objetivo confirmado es el recuento de parámetros (124.770.816) verificado en los pesos safetensors.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 500 MB solo para los pesos, más memoria para activaciones y caché KV (entorno de 1-2 GB).
- VRAM estimada en fp16 o bf16: aproximadamente 250 MB para los pesos.
- En cuantización de 8 bits: aproximadamente 125-150 MB; en 4 bits: alrededor de 70-90 MB (estas cuantizaciones no se publican en el repositorio, habría que generarlas).
- GPU recomendadas: cualquier GPU moderna es suficiente. Está holgadamente dentro de una RTX 3060, RTX 4090, A100 o H100; incluso una GPU integrada o una CPU moderna puede ejecutarlo con latencias aceptables.
- Cabe sin problema en GPU de consumo, incluidos portátiles con gráfica dedicada modesta.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (etiquetado como compatible), vLLM, llama.cpp u Ollama (requeriría convertir los pesos a GGUF), y endpoints de HuggingFace.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones). Dado el tamaño, se esperan latencias del orden de milisegundos por token en GPU y decenas de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| francesca9805/rus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible (probablemente ruso) | no disponible | no disponible |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Ingles principalmente | MIT (pesos publicados por OpenAI) | Publicado (perplejidad y benchmarks clasicos) |
| DistilGPT-2 | 82 M | 1024 tokens | Ingles | Apache 2.0 | Publicado |
| Pythia-160M | 160 M | 2048 tokens | Ingles | Apache 2.0 | Publicado (suite de evaluacion de EleutherAI) |
| OPT-125M | 125 M | 2048 tokens | Ingles principalmente | MIT | Publicado |

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparativa se limita a parametros, contexto y licencia. La diferencia clave frente a alternativas establecidas es el enfoque experimental en tokenización para ruso y la ausencia de métricas y licencia declarada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede afirmar su calidad de generación frente a modelos similares.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus de aproximadamente 100 MB las distribuciones serán muy limitadas y probablemente sesgadas hacia el dominio concreto de ese corpus.
- Riesgo elevado de alucinacion y de generar texto incoherente por el reducido tamaño (124,8 M) y el escaso volumen de datos de ajuste.
- Limitaciones de contexto e idioma: no se confirman ni la longitud de contexto ni los idiomas soportados oficialmente; el nombre sugiere que el foco es el ruso, por lo que el rendimiento en otros idiomas probablemente sea pobre.
- Licencia no disponible: al no declararse, no se puede garantizar el uso comercial ni la redistribución. Conviene contactar con la autora antes de cualquier uso en producción.
- Modelo de investigacion: sin descargas ni likes en el momento de la consulta, sin documentación adicional y sin garantías de mantenimiento.
- Reproducibilidad limitada: aunque se indica semilla y enlace a Weights & Biases, no se detalla el dataset ni la configuración exacta de entrenamiento.
- No apto para produccion: carece de evaluación de seguridad, de alineación (no hay RLHF ni DPO) y de mitigaciones frente a contenido dañino.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/francesca9805/rus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfdiso_seed3407
- Perfil de la autora en HuggingFace: https://huggingface.co/francesca9805
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/cb8dj16z
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en italiano: https://huggingface.co/francesca9805/ita-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfd_seed10_seed10
- Variante en ingles: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eng-before-100mb-packed-bfd_seed10
- Variante en japones: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-jpn-after-100mb-packed-bfdiso_seed10
- Listado de ajustes derivados del modelo base en ingles: https://huggingface.co/models?other=base_model:finetune:francesca9805/ppt-wc-uniform-newlex-eng-before-100mb-packed-bfdiso_seed3407
