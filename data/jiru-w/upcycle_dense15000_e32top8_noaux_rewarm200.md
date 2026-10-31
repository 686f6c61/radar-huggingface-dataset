# JIRU-W/upcycle_dense15000_e32top8_noaux_rewarm200

## Resumen

`upcycle_dense15000_e32top8_noaux_rewarm200` es un modelo experimental de investigación desarrollado por el usuario JIRU-W y publicado en Hugging Face. No se trata de un modelo de lenguaje de propósito general, sino de un experimento controlado sobre "upcycling" (reciclado de arquitecturas): un modelo denso preentrenado de unos 10.000 millones de tokens vistos se copió literalmente, capa a capa, en una arquitectura Mixture-of-Experts con 32 expertos y top-8, para estudiar si expertos idénticos pueden diferenciarse durante el entrenamiento posterior sin pérdida de balanceo.

El modelo base es `JIRU-W/dense_e1_seq2048_gbs128_10b`, un transformer denso con MLP SwiGLU de tamaño intermedio 1024. Tras el upcycling, cada experto de cada capa es una copia exacta del MLP denso original, y el router se inicializa de forma aleatoria con `normal(0, 0.02)`. El entrenamiento posterior se realiza sin ninguna pérdida de balanceo de carga (no aux loss), lo que convierte este repositorio en un banco de pruebas sobre la emergencia de especialización en MoE ingenuos.

Es relevante para investigadores de eficiencia de MoE y técnicas de inicialización, ya que publica checkpoints intermedios (cada pocos pasos al principio, luego cada 1000) junto con métricas de evaluación (cross-entropy sobre secuencias de validación). El entrenamiento estaba en curso (paso 35.526 de 38.139 en el momento de redactar la model card). Es un modelo pequeño de investigación, no instruction-tuned, y requiere `trust_remote_code=True` para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE (32 expertos por capa, top-8, MLP SwiGLU por experto) |
| Parametros totales | 3.696.887.808 (~3,70 B) |
| Parametros activos | no disponible (aproximadamente 1/4 de los parametros de los expertos por token al activar 8 de 32 expertos, mas atencion y embeddings; dato exacto no publicado) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (dataset de preentrenamiento tipo OLMoE mix 0924, predominantemente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints HF) y checkpoint DeepSpeed ZeRO-2 con estado del optimizador |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso convertido en MoE mediante upcycling ingenuo: en cada capa, los 32 expertos son copias exactas del MLP SwiGLU denso original (tamaño intermedio 1024), sin ruido ni reinicialización parcial. Embeddings, atención, normas y `lm_head` se copian sin cambios. El router se inicializa aleatoriamente con `normal(0, 0.02)` (semilla 1234) y usa `norm_topk_prob=True`, de modo que en el paso 15000 (justo tras el upcycling) el modelo MoE computa exactamente la misma función que el denso original. Esto permite medir la divergencia entre expertos a partir de un punto de partida funcionalmente idéntico.

El entrenamiento continúa sobre el dataset `JIRU-W/olmoe-mix-0924-10b`, retomando el orden de datos de la ejecución densa desde el paso 15000 (permutación con semilla 1234 sobre 4.881.809 muestras). Cada paso procesa 128 secuencias de 2048 tokens, es decir, 262.144 tokens por paso. Se usa AdamW con estado fresco, weight decay 0.1, y una tasa de aprendizaje que retoma el schedule coseno de la ejecución densa (pico 8e-4, warmup 200, decay hasta 8e-5 en el paso 38.139), con un re-warmup lineal adicional de 200 pasos tras el upcycling. No hay pérdida de balanceo de carga. La precisión es bf16 en pesos con acumulación de gradientes en fp32, usando DeepSpeed ZeRO-2 en una sola GPU.

## Capacidades

- Generacion de texto basica (pipeline `text-generation`), como modelo base de preentrenamiento, no instruction-tuned.
- Inspeccion de logits del router por capa (`output_router_logits=True`), util para analizar la especializacion de expertos durante el entrenamiento.
- No es adecuado para dialogo, razonamiento de instrucciones ni agentes: no ha pasado por SFT, RLHF ni DPO.
- No dispone de tool calling, capacidades multimodales, vision ni audio.
- No ha sido evaluado en tareas de codigo, matematicas ni benchmarks estandar.
- Su capacidad principal es servir como objeto de estudio: checkpoints multiples que permiten trazar la evolucion de la diferenciacion de expertos.

## Casos de uso

- Investigacion en especializacion de MoE: cargar checkpoints sucesivos (por ejemplo, `step29000` a `step35000`) y comparar los pesos de los expertos para medir cuan distintos se vuelven respecto a su copia inicial identica.
- Estudio del efecto de la ausencia de loss de balanceo: al entrenarse sin aux loss, permite observar si el colapso del router ocurre o no, y a que ritmo.
- Analisis de upcycling denso-a-MoE: el revision `init` ofrece el punto exacto de conversion (funcionalmente identico al denso), util como linea base para comparar estrategias de inicializacion de routers.
- Investigacion en schedules de aprendizaje: el re-warmup lineal de 200 pasos tras el upcycling puede compararse con ejecuciones sin re-warmup para estudiar su impacto en la estabilidad del entrenamiento.
- Reproduccion de experimentos de entrenamiento: el checkpoint final DeepSpeed (`ds_step38139`) incluye el estado del optimizador, lo que permite continuar el entrenamiento desde el final.
- Docencia y demos tecnicas: el codigo de upcycling (`upcycle_dense.py`, `upcycle_meta.json`) y la trazabilidad completa (semillas, orden de datos) lo hacen util como ejemplo didactico de metodologia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la cross-entropy de evaluacion (media sobre 256 secuencias de 2048 tokens reservadas):

| Revision | Tokens vistos (incl. fase densa) | Eval CE |
|---|---|---|
| `step29000` | 7,60 B | 2,9067 |
| `step30000` | 7,86 B | 2,8943 |
| `step31000` | 8,13 B | 2,8849 |
| `step32000` | 8,39 B | 2,8741 |
| `step33000` | 8,65 B | 2,8657 |
| `step34000` | 8,91 B | 2,8582 |
| `step35000` | 9,18 B | 2,8513 |

## Requisitos de hardware

- VRAM para inferencia: los pesos en bf16 ocupan aproximadamente 7,4 GB (3,70 B de parametros a 2 bytes), por lo que se necesita una GPU con al menos 10-12 GB de VRAM para inferencia comoda.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, como una RTX 3090 o RTX 4090 (24 GB); tambien cabe en una RTX 3060 de 12 GB en bf16.
- Cabe en GPU consumer sin cuantizacion; no se publican pesos cuantizados.
- Despliegue: el uso documentado es directamente con `transformers` (AutoModelForCausalLM con `trust_remote_code=True`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI; al usar codigo personalizado, la compatibilidad con estos frameworks no esta garantizada.
- Latencia y throughput: no disponibles. Al activar solo 8 de 32 expertos por capa, el coste computacional por token deberia ser inferior al de un denso de 3,7 B de parametros, pero no hay medidas publicadas.
- Nota sobre el tamano del repositorio: el repo ocupa 354,9 GB porque incluye decenas de checkpoints historicos y un checkpoint DeepSpeed con estado del optimizador; no es necesario descargarlo completo, solo la revision deseada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| JIRU-W/upcycle_dense15000_e32top8_noaux_rewarm200 | 3,70 B | MoE 32 expertos, top-8 (upcycled) | 2048 | Apache-2.0 | Investigacion en upcycling y diferenciacion de expertos |
| OLMoE-1B-7B-0924 (AllenAI) | 6,9 B totales / ~1 B activos | MoE 64 expertos, top-8 | 4096 | Apache-2.0 | Modelo base abierto de proposito general |
| Mixtral-8x7B (Mistral AI) | 46,7 B totales / ~13 B activos | MoE 8 expertos, top-2 | 32768 | Apache-2.0 | Modelo general de alto rendimiento |

El modelo de JIRU-W es considerablemente mas pequeno y esta entrenado con muchos menos tokens (~9,2 B vistos) que OLMoE o Mixtral, y carece de instruction tuning. Su valor no es competitivo en rendimiento, sino metodologico: es uno de los pocos repositorios que publica el proceso completo de upcycling con checkpoints densamente muestreados.

## Limitaciones y advertencias

- No es un modelo de producto: es un checkpoint de investigacion en curso, sin instruction tuning, por lo que sus respuestas a instrucciones seran de baja calidad.
- Riesgo elevado de alucinacion y texto incoherente: solo ha visto ~9,2 B de tokens en total, una cantidad muy reducida para un modelo de este tamano.
- Ventana de contexto corta: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idioma: el dataset de entrenamiento (mezcla tipo OLMoE 0924) es mayoritariamente en ingles; el rendimiento en castellano no esta documentado y probablemente sea pobre.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor: revisar el codigo antes de usarlo en entornos sensibles.
- Sesgos: hereda los sesgos del dataset de preentrenamiento, no evaluados ni mitigados; no se dispone de model cards de seguridad ni evaluaciones de toxicidad.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo experimental no apto para produccion, su uso comercial no esta justificado en la practica.
- El entrenamiento estaba en curso al redactar la model card; los checkpoints finales y el checkpoint DeepSpeed pueden no estar disponibles todavia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JIRU-W/upcycle_dense15000_e32top8_noaux_rewarm200
- Modelo base denso: https://huggingface.co/JIRU-W/dense_e1_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
- Paper, blog o demo: no disponibles
