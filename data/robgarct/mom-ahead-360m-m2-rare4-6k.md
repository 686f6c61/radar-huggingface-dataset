# robgarct/mom-ahead-360m-m2-rare4-6k

## Resumen

`mom-ahead-360m-m2-rare4-6k` es un checkpoint de investigación publicado por el usuario robgarct en HuggingFace. Se trata de un modelo de lenguaje de tipo Mixture-of-Memories (MoM) con atención lineal, router de lectura basado en características "ahead" y 2 bancos de memoria por capa. Aunque el identificador comercializa 360 M de parámetros, el autor declara 446,6 M reales, incluyendo 51,5 M de embeddings y el extractor de características ahead.

El modelo se entrenó sobre The Pile durante 6.000 actualizaciones, lo que equivale a 3.146B tokens con un batch global de 256 secuencias de 2.048 tokens, bajo el objetivo denominado `rare4` y con semilla 1111. Es, por tanto, un experimento de arquitectura más que un modelo listo para producción: su interés radica en evaluar si mecanismos de memoria recurrente y atención lineal pueden recuperar información en contexto de forma competitiva frente a la atención cuadrática estándar.

Su relevancia actual es acotada pero específica: forma parte de la línea de trabajo sobre "recurrent recall circuits" y publica métricas de recall en contexto (FDA y SWDE) junto con perplejidad de validación. No tiene descargas ni interacciones registradas, no declara licencia y depende de un repositorio de código externo para poder cargarse, lo que lo sitúa como artefacto reproducible de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Memories (MoM) con atencion lineal, router de lectura "ahead-feature" y 2 bancos de memoria por capa; 24 capas, 16 cabezas, n_embd 1024 |
| Parametros totales | 446,6 M (incluye 51,5 M de embedding y el extractor de caracteristicas ahead); el nombre del modelo indica 360 M |
| Parametros activos | No aplica: no es un MoE de expertos, sino de memorias. La puerta de escritura activa 4 ranuras por token (softmax top-4 con straight-through) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia usada en entrenamiento; no se declara extension de contexto) |
| Tipos de cuantizacion | No disponible: solo se publica un checkpoint en precision original, sin variantes cuantizadas |
| Idiomas soportados | No disponible (entrenado sobre The Pile, corpus mayoritariamente en ingles; el autor no declara reparto linguistico) |
| Licencia | No disponible |
| Formato de pesos | `final.ckpt` (checkpoint binario, estado del optimizador eliminado), mas `resolved-config.yaml` y `metadata.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal con un esquema de memoria por capas. Cada capa dispone de 2 bancos de memoria; la escritura se controla mediante una puerta softmax top-4 con estimador straight-through, es decir, solo 4 ranuras reciben escritura por token, mientras que la lectura es densa mediante softplus (`read_top_k: null`). El router de lectura se denomina "ahead-feature" y su extractor forma parte del recuento de parámetros. La configuración se compone desde el repositorio `recurrent-recall-circuits` (por ejemplo, `experiment=mom/360m_ahead_6k_m2`), no se transporta dentro del repositorio de HuggingFace.

El entrenamiento se realizó sobre The Pile durante 6.000 pasos con batch global de 256 × 2.048 tokens, lo que da 3.146B tokens vistos, con semilla 1111 y el objetivo `rare4`. No se menciona ninguna fase posterior de ajuste por instrucciones, RLHF ni DPO: es un modelo de preentrenamiento puro. La innovación declarada es el circuito de recall recurrente con bancos de memoria y atención lineal, orientado a tareas de recuperación de información en contexto; la perplejidad de validación reportada sobre cortes uniformes de The Pile es 10,22.

## Capacidades

- Generación de texto autorregresiva en un modelo de 446,6 M de parámetros, con vocabulario derivado de The Pile.
- Recuperación de información en contexto (in-context recall): es la capacidad que el autor mide explícitamente mediante las tareas FDA y SWDE.
- Procesamiento de secuencias de hasta 2.048 tokens con mecanismos de memoria persistente por capa.
- Escritura selectiva en memoria: la puerta top-4 permite decidir qué ranuras de memoria se actualizan en cada token.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe; el corpus de entrenamiento (The Pile) es mayoritariamente inglés.
- No se declaran capacidades de visión, audio, modo "thinking" ni decodificación especulativa.

## Casos de uso

- Reproducción de experimentos de recall recurrente: el checkpoint permite repetir las evaluaciones FDA y SWDE del autor usando el arnés `recurrent_recall_circuits.evaluation.launch`, con la configuración exacta fijada en `resolved-config.yaml`.
- Ablación de bancos de memoria: al existir una variante `m2` (2 bancos por capa), sirve como punto de comparación frente a configuraciones con distinto número de bancos para estudiar el efecto en perplejidad y recall.
- Estudio de puertas de lectura y escritura: el par top-4 con straight-through en escritura frente a lectura densa softplus permite analizar el compromiso entre selectividad y coste computacional en atención lineal.
- Investigación sobre atención lineal: es un banco de pruebas controlado (3.146B tokens, semilla fija) para medir si la atención lineal iguala a la atención cuadrática en tareas de recuperación.
- Docencia y divulgación: el tamaño reducido (446,6 M de parámetros) permite ejecutar el modelo completo y trazar sus circuitos de memoria en un único acelerador, algo inviable con modelos de escala frontera.
- Punto de partida para preentrenamiento continuado: un grupo de investigación puede reutilizar los pesos y la configuración para entrenar más pasos y comparar curvas de perplejidad frente a las 6.000 actualizaciones publicadas.
- Validación de arneses de evaluación: al publicar métricas concretas (perplejidad 10,22; FDA 38,2; SWDE 35,3), sirve como caso de prueba para verificar que una implementación propia del arnés reproduce esos números.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Perplejidad de validacion (The Pile, cortes uniformes) | 10,22 | Reportado por el autor |
| FDA (`based-fda`, 1.102 ejemplos) | 38,2 | Tarea de recall en contexto |
| SWDE (`based-swde-v2`) | 35,3 | Tarea de recall en contexto |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar, ni comparaciones directas con modelos de la misma escala.

## Requisitos de hardware

- VRAM estimada en precision original (fp32): aproximadamente 1,8 GB solo para pesos, coherente con el tamano del repositorio (1,6 GB con el estado del optimizador eliminado).
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB para pesos; en int8, en torno a 0,45 GB.
- Cabe holgadamente en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB si se convierte a precision reducida.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o para barridos de ablacion en paralelo.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y no se publican pesos en safetensors ni GGUF. El unico camino documentado es clonar `recurrent-recall-circuits` y cargar `final.ckpt` mediante `utils.checkpoint.load_checkpoint`, o componer `experiment=mom/360m_ahead_6k_m2`.
- Variables de entorno relevantes: `$RRC_CHECKPOINT_DIR/mom_ahead_360m_m2.ckpt` tiene prioridad sobre la descarga automatica desde el repositorio de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion con modelos de proposito general de escala parecida es orientativa: este checkpoint no publica resultados en las baterias estandar que si reportan las alternativas, y su arquitectura no es un transformer estandar, por lo que no es directamente intercambiable en pipelines existentes.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mom-ahead-360m-m2-rare4-6k | 446,6 M | 2.048 tokens | Mixture-of-Memories con atencion lineal | No disponible | Solo `.ckpt` y repositorio de codigo propio |
| SmolLM2-360M | ~362 M | 8.192 tokens | Transformer denso | Apache 2.0 | Pesos en safetensors, ampliamente integrado |
| Pythia-410M | 410 M | 2.048 tokens | Transformer denso | Apache 2.0 | Pesos en safetensors, con 154 checkpoints intermedios |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Transformer denso | Apache 2.0 | Pesos en safetensors, soporte en vLLM y Ollama |

En rendimiento no procede una comparacion numerica directa: este modelo reporta perplejidad sobre The Pile y tareas de recall en contexto, mientras que las alternativas publican MMLU, ARC, GSM8K y similares. La diferencia relevante esta en el uso previsto: las alternativas son modelos de proposito general listos para desplegar, mientras que este es un artefacto de investigacion sobre mecanismos de memoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican condiciones de uso, lo que genera incertidumbre legal para cualquier uso comercial o redistribucion.
- Modelo de investigacion sin ajuste por instrucciones, RLHF ni DPO: no cabe esperar adherencia a instrucciones, rechazo de peticiones daninas ni formato conversacional fiable.
- Riesgo elevado de alucinacion y de reproduccion de sesgos: solo ha visto 3.146B tokens de The Pile, muy por debajo de los volumenes de entrenamiento de modelos comparables actuales.
- Corpus mayoritariamente en ingles: el rendimiento en castellano u otros idiomas no esta medido y previsiblemente sera bajo.
- Contexto limitado a 2.048 tokens, sin mecanismos declarados de extension; las tareas de contexto largo quedan fuera de su alcance.
- Las metricas de recall (FDA 38,2 y SWDE 35,3) son valores absolutos moderados o bajos y no se acompanan de comparaciones con lineas base, por lo que no permiten concluir superioridad sobre la atencion cuadratica.
- Dependencia de codigo externo: sin clonar `recurrent-recall-circuits` y componer la configuracion adecuada, el checkpoint no es cargable; no hay safetensors ni GGUF.
- Formato `.ckpt`: su carga mediante `torch.load` implica el riesgo habitual de deserializacion de objetos Python; conviene auditarlo antes de ejecutarlo en entornos compartidos.
- Cero descargas y cero interacciones en HuggingFace: no hay evidencia de uso independiente ni de validacion por terceros de los resultados declarados.
- Fechas de creacion y actualizacion del repositorio poco habituales, con dos minutos de diferencia entre ambas, lo que sugiere un artefacto subido de forma automatizada y sin mantenimiento posterior previsible.

## Enlaces

- HuggingFace: https://huggingface.co/robgarct/mom-ahead-360m-m2-rare4-6k
- Repositorio de codigo referenciado en la model card: https://github.com/<owner>/recurrent-recall-circuits (el autor deja el propietario sin especificar en el README)
- Paper: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
