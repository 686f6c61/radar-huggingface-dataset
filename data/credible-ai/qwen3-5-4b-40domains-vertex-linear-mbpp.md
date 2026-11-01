# credible-ai/qwen3.5-4B-40domains-vertex-linear-mbpp

## Resumen

qwen3.5-4B-40domains-vertex-linear-mbpp es un modelo de lenguaje de 3.700 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix. No es un modelo de proposito general: se entrena desde cero sobre 80.000 millones de tokens procedentes de tres corpus (WebOrganizer, Stack-Edu y Nemotron-CC-Math), mezclados en 40 dominios (24 topicos de WebOrganizer, 15 lenguajes de programacion y matematicas) con pesos de mezcla optimizados por LinMix especificamente para el benchmark MBPP.

La arquitectura es de tipo Qwen3.5 (`Qwen3_5ForCausalLM`, requiere transformers >= 5.2), con 32 capas, dimension oculta de 2560 y tokenizador GPT-NeoX-20B de 50.432 entradas. El entrenamiento se realizo con OLMo-core y los pesos se distribuyen en bfloat16 bajo licencia MIT.

Su relevancia es metodologica: sirve para estudiar como la atribucion lineal de dominios en una mezcla de datos afecta al rendimiento en tareas de generacion de codigo, usando un enjambre proxy de 100M parametros para ajustar la mezcla antes de entrenar el modelo final de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (3,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen3.5 implementada en transformers (`Qwen3_5ForCausalLM`, version >= 5.2), con 32 capas y dimension oculta de 2560, entrenado desde cero. Usa el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. El entrenamiento se ejecuto con la libreria OLMo-core sobre 80.000 millones de tokens.

Los datos provienen de tres fuentes: WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x, CC-BY-4.0, sujeto a los terminos de Common Crawl), los 15 subconjuntos de lenguaje de HuggingFaceTB/stack-edu (bajo los terminos de The Stack v2) y el subconjunto 4plus de nvidia/Nemotron-CC-Math-v1 (bajo el NVIDIA Data Agreement for Model Training). La mezcla se organiza en 40 dominios y los pesos se optimizan mediante LinMix, un metodo de atribucion lineal de dominios: se ajusta un surrogate lineal sobre un enjambre proxy de modelos de 100M parametros (credible-ai/qwen3.5-100M-40domains-vertex) con utilidad lineal (r = 0), y la mezcla resultante se usa para entrenar este modelo de 4B. El repositorio incluye un fichero `mix.json` con la mezcla exacta de datos de entrenamiento. No se documenta en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Generacion de codigo en los 15 lenguajes cubiertos por Stack-Edu presentes en la mezcla de entrenamiento.
- Razonamiento matematico basico derivado del subconjunto 4plus de Nemotron-CC-Math.
- Optimizado explicitamente para el benchmark MBPP (generacion de programas Python a partir de descripciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de experimentos de LinMix: el modelo permite replicar los resultados del paper arXiv:2610.37390 sobre atribucion lineal de dominios en mezclas de datos, cargando `mix.json` para verificar la composicion exacta del entrenamiento.
- Investigacion sobre data mixing: sirve como punto de comparacion frente al proxy de 100M parametros (credible-ai/qwen3.5-100M-40domains-vertex) para medir como escala la mezcla optimizada al aumentar el tamano del modelo.
- Estudio de transferencia entre dominios web y codigo: al combinar 24 topicos web con 15 lenguajes de programacion, permite analizar si el texto web mejora o degrada la generacion de codigo en un modelo pequeño.
- Evaluacion de generacion de codigo Python: su entrenamiento orientado a MBPP lo hace util como linea base en experimentos controlados de sintesis de programas a partir de docstrings.
- Analisis de calidad de datos educativos: los 15 subconjuntos de Stack-Edu permiten estudiar el efecto de codigo filtrado por calidad educativa frente a codigo web sin filtrar.
- Base para ablaciones de tokenizador: al usar GPT-NeoX-20B en lugar del tokenizador nativo de Qwen, sirve para comparar el impacto del vocabulario en el rendimiento con el mismo presupuesto de tokens.
- Docencia e investigacion academica: su licencia MIT y su naturaleza de artefacto reproducible lo hacen adecuado para cursos y talleres sobre mezclas de datos y entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos, mas memoria para el KV cache y activaciones; en la practica, entre 9 y 11 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2,2 GB (aunque no se documentan ficheros GGUF oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bfloat16 sin problemas.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y en tarjetas de 8 GB si se cuantiza.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), vLLM y TGI para servir con arquitecturas compatibles; llama.cpp u Ollama solo si se generan conversiones GGUF, no incluidas en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-vertex-linear-mbpp | 3,7B | no disponible | MIT | Preentrenamiento desde cero con mezcla LinMix optimizada para MBPP |
| credible-ai/qwen3.5-100M-40domains-vertex | 100M (aprox.) | no disponible | no disponible | Proxy de enjambre usado para ajustar la mezcla; mismo esquema de dominios |
| Qwen3.5 base (modelo original de referencia) | segun variante | segun variante | segun variante | Modelo de produccion; este artefacto comparte arquitectura pero no pesos ni tokenizador |

La comparacion con modelos de proposito general del mismo tamano no es directa: este modelo es un artefacto de investigacion sin fases de alineamiento documentadas y con un unico idioma, por lo que su utilidad practica fuera de la reproduccion experimental es limitada.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo describe como artefacto para reproducir experimentos, no como modelo de proposito general.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sin alineamiento documentado: no se menciona RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido inapropiado o factualmente incorrecto.
- Riesgo de alucinacion elevado en tareas abiertas, al ser un modelo pequeño preentrenado sin instrucciones.
- Longitud de contexto no documentada: no se debe asumir una ventana larga en produccion.
- Sesgos heredados de los corpus: Common Crawl, Stack-Edu y Nemotron-CC-Math arrastran sesgos de sus fuentes originales.
- Restricciones de datos: aunque los pesos son MIT, los datos de entrenamiento estan sujetos a los terminos de Common Crawl, The Stack v2 y el NVIDIA Data Agreement; el uso comercial de los pesos no exime de revisar esas condiciones.
- Los datos de Stack-Edu y Nemotron-CC-Math no se redistribuyen, solo las secuencias web tokenizadas.
- Sin ficheros GGUF ni cuantizaciones oficiales publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-vertex-linear-mbpp
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Documentacion de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Secuencias web tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de Common Crawl: https://commoncrawl.org/terms-of-use
- Terminos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
