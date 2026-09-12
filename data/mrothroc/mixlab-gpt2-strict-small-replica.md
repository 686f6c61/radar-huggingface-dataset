# mrothroc/mixlab-gpt2-strict-small-replica

## Resumen

`mrothroc/mixlab-gpt2-strict-small-replica` es una reproduccion desde cero del baseline oficial GPT-2 *Strict-Small* de BabyLM 2026 (`BabyLM-community/babylm-baseline-10m-gpt2`), entrenada sobre exactamente el mismo corpus de 10 millones de palabras que emplean los organizadores. El objetivo del autor no es superar al baseline, sino demostrar que un modelo de este tipo puede reproducirse de forma fiel y eficiente: todo el entrenamiento se ejecuto en una unica GPU Apple M1 Max (32 nucleos graficos, 64 GB de memoria unificada) con mixlab v0.40.0, un entrenador abierto basado en Metal/MLX, en aproximadamente 11 horas de reloj.

Arquitectonicamente es un GPT-2 Small vanilla: 12 capas, dimension oculta 768, 12 cabezas de atencion, contexto de 1024 tokens y embeddings atados a la cabeza de salida. Con el vocabulario de 16.384 tokens del corpus BabyLM, la model card declara 98.425.344 parametros, mientras que los metadatos de safetensors del repositorio reportan 111.008.256; el "124M" que aparece en la model card de referencia corresponde a la variante con vocabulario de 50.000 tokens. Se exporta como `GPT2LMHeadModel` nativo con paridad de logits verificada frente a la implementacion nativa (aproximadamente 3e-8).

Su relevancia es acotada pero clara: es un artefacto de reproducibilidad para la comunidad BabyLM, util para estudiar el efecto de la inicializacion de pesos en modelos pequenos entrenados con presupuesto de datos tipo "developmental", y como punto de partida barato para experimentos de modelado del lenguaje en ingles. No es un modelo de proposito general ni esta alineado con instrucciones: es un modelo de lenguaje causal base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 Small vanilla (transformer decoder-only causal), 12 capas, hidden 768, 12 cabezas, FFN intermedio 3072, pre-LayerNorm (eps 1e-5), GELU (`gelu_new`, aproximacion tanh), embeddings de posicion absolutos aprendidos, embeddings atados |
| Parametros totales | 98.425.344 segun la model card (vocabulario de 16.384); 111.008.256 segun los metadatos de safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en fp32 dentro de safetensors; no se han publicado variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors; configuracion en `config.json` (export HF) y `training_config.mixlab.json` |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only transformer estandar sin modificaciones: 12 bloques con atencion causal multi-cabeza (con sesgos en atencion y proyeccion), pre-LayerNorm con peso y sesgo afines mas una LayerNorm final, feed-forward GELU de dimension intermedia 3072, dropout 0.1 en embedding, residual y atencion durante el entrenamiento, y embeddings de tokens y de posicion atados a la cabeza de salida. No hay atencion lineal, decodificacion especulativa, MoE ni componentes SSM. La inicializacion sigue el esquema clasico de GPT-2: normal(0, 0.02) y escalado de `c_proj` residual por 1/sqrt(2*n_layer).

El entrenamiento uso mixlab v0.40.0 en modo `arch` sobre Metal/MLX, en fp32 y con semilla 42. Los datos son el corpus Strict-Small 2026 (aproximadamente 10M de palabras, unos 18M de tokens), tokenizado en bloque completo y troceado en segmentos de 512 tokens, cada uno enmarcado como `<s>` + fragmento + `</s>`. El optimizador fue AdamW (betas 0.9/0.999, eps 1e-8) con learning rate 5e-5, sin weight decay y grad-clip 1.0; el schedule consistio en 213 pasos de warmup seguidos de decaimiento coseno hasta completar 21.300 pasos (unas 9,7 epocas) con batch de 16 secuencias de 514 tokens. El tokenizador es el de referencia, con vocabulario de 16.384 entradas (`<unk>`=0, `<s>`=1, `</s>`=2, `<pad>`=3, `<mask>`=4). No hubo RLHF, DPO ni ajuste por instrucciones.

La innovacion destacable es de ingenieria y metodologia, no de arquitectura: la reproduccion identifica que la inicializacion de pesos era la fuente de una brecha de 5,7 puntos en BLiMP respecto al baseline, pese a que arquitectura, receta, corpus y paridad de forward coincidian. La perdida de validacion no detectaba ese fallo de generalizacion, lo que constituye un hallazgo metodologico relevante para quien entrene modelos pequenos con presupuestos de datos reducidos.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de texto, modelado causal y puntuacion de verosimilitud de secuencias.
- Conocimiento linguistico formal: el modelo obtiene resultados cercanos al azar-superior en pruebas de fenomenos gramaticales (BLiMP 65,86; BLiMP-supplement 58,04), lo que refleja cierta sensibilidad a restricciones sintacticas y morfologicas del ingles.
- Razonamiento pragmatico elemental: EWoK 49,30 y COMPS 52,05, en el entorno del baseline.
- Clasificacion por ajuste fino: la tarea GLUE se evaluo ajustando el modelo, con macro de 64,15.
- Modelado psicometrico: la componente "reading" (eye-tracking y SPR) alcanza 7,15, dentro de la familia de modelos entrenados con corpus tipo developmental.
- Sin soporte de tool calling ni function calling: es un modelo base sin plantilla de herramientas ni fine-tuning instructivo.
- Sin capacidades de agente ni razonamiento multi-paso inducido: no hay modo "thinking", ni planificacion entrenada.
- Sin vision, audio ni cualquier otra modalidad: exclusivamente texto.
- Multilingue: no disponible; la model card declara unicamente ingles.
- Seguimiento de entidades practicamente a nivel de azar (25,99 frente a 13,90 del baseline, diferencia atribuida por el autor a un artefacto de sesgo de longitud).

## Casos de uso

- Reproducibilidad y auditoria de baselines: sirve para verificar de forma independiente los numeros del baseline oficial de BabyLM 2026 con un harness identico (`babylm-org/babylm-eval` @ `3bf5142`), comparando componente a componente.
- Investigacion sobre presupuesto de datos: al estar entrenado con solo ~10M de palabras (~18M tokens), es un sujeto de estudio ideal para analizar como se distribuyen las capacidades linguisticas en regimen de datos escaso, y en particular el efecto de la inicializacion frente a la perdida de validacion.
- Experimentos de eficiencia en hardware Apple: el modelo y la receta documentan un entrenamiento completo en una M1 Max en unas 11 horas, lo que lo convierte en referencia para medir el rendimiento de Metal/MLX frente a CUDA en modelos pequenos.
- Puntuacion de verosimilitud en psicolinguistica computacional: gracias a su compatibilidad con el harness de BabyLM, puede usarse para calcular surprisal por token en estudios de lectura (eye-tracking, SPR), siempre que se genere la trayectoria por checkpoint que exige la metrica AoA.
- Fine-tuning en tareas de clasificacion de ingles: con 98-111M de parametros y fp32 en safetensors, es viable ajustar GLUE u otras tareas de clasificacion en una sola GPU consumer con un coste minimo.
- Prototipado educativo de pipelines de NLP: sirve como modelo de juguete para ensenar tokenizacion, generacion autoregresiva y evaluacion causal sin requerir infraestructura de GPU.
- Generacion de texto controlada en dominios acotados: partiendo del modelo base, se puede ajustar con un corpus pequeno especifico (por ejemplo, texto infantil o material simplificado en ingles) para generar continuaciones estilisticamente coherentes.
- Pruebas de integracion y smoke tests de despliegue: su tamano (~0,4 GB de repo) permite validar pipelines de TGI, transformers y endpoints compatibles sin consumir recursos significativos.

## Benchmarks y rendimiento

Resultados zero-shot de los seis componentes evaluados con el harness `babylm-eval` @ `3bf5142` (backend causal). La columna de referencia es la reevaluacion del baseline oficial dentro del mismo harness, que reproduce los numeros publicados. GLUE es la excepcion: la reproduccion se ajusto y puntuo localmente, mientras que la referencia (63,62) es el numero publicado oficialmente en la model card del baseline, no reevaluado localmente.

| Componente | Baseline de referencia | Esta reproduccion | Delta |
|---|---:|---:|---:|
| BLiMP | 66,35 | 65,86 | -0,49 |
| BLiMP-supplement | 57,07 | 58,04 | +0,97 |
| EWoK | 49,23 | 49,30 | +0,07 |
| COMPS | 51,72 | 52,05 | +0,33 |
| reading (eye + SPR) | 6,50 | 7,15 | +0,65 |
| GLUE (macro) | 63,62 | 64,15 | +0,53 |
| entity tracking | 13,90 | 25,99 | +12,09 |
| AoA | no disponible (no evaluado) | no disponible (renunciado, 0) | no aplica |

Advertencias del propio autor sobre esta tabla: la componente de seguimiento de entidades esta cerca del azar en ambos modelos y la diferencia es un artefacto de sesgo de longitud, por lo que se excluye de cualquier agregado. La metrica AoA se renuncia porque requiere una trayectoria de surprisal por checkpoint que la entrega no incluye, y ademas el scorer upstream tiene un bug abierto (baseline de azar log2/bits con vocabulario fijo de ~300k en lugar del real), lo que la hace dominada por ruido. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: los pesos ocupan aproximadamente 0,41-0,44 GB con 111.008.256 parametros a 4 bytes; sumando cache KV y activaciones, una estimacion conservadora de 1-2 GB es suficiente para inferencia con contexto de 1024 tokens. Cifra estimada, no medida por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para inferencia. El entrenamiento documentado se hizo en una Apple M1 Max (32 nucleos de GPU, 64 GB de memoria unificada) sin GPU discreta.
- GPU consumer: si, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.), asi como en CPU, dada la magnitud del modelo.
- Opciones de despliegue: `transformers` de forma nativa (`GPT2LMHeadModel`); el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que TGI y endpoints compatibles son las rutas soportadas. El soporte en vLLM, llama.cpp u Ollama no esta verificado en la informacion disponible y requeriria conversion de formato (no se publican pesos GGUF).
- Latencia y throughput: no disponible. El autor solo reporta el tiempo de entrenamiento (~11 horas en M1 Max), no metricas de inferencia.
- Memoria durante el entrenamiento: la receta se ejecuto en fp32 sobre 64 GB de memoria unificada; no se documenta el pico de memoria del proceso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (BLiMP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrothroc/mixlab-gpt2-strict-small-replica` | 98.425.344 (model card) / 111.008.256 (safetensors) | 1024 | 65,86 | MIT | safetensors en HuggingFace, 96 descargas |
| `BabyLM-community/babylm-baseline-10m-gpt2` (baseline oficial 2026 Strict-Small) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | 66,35 | no disponible en la informacion proporcionada | HuggingFace (referencia del autor) |
| GPT-2 Small original | 124M (vocabulario de 50k) | 1024 | no disponible en la informacion proporcionada | MIT (pesos publicados por OpenAI) | ampliamente disponible |

La comparacion relevante es la primera fila frente a la segunda: se trata de una reproduccion data-identical, con diferencias de menos de un punto en todos los componentes estables. No se dispone de datos de otras alternativas de la misma categoria (por ejemplo, Pythia-160M o modelos BabyLM de otros equipos) en la informacion proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no ha recibido RLHF, DPO ni ajuste instructivo, por lo que no sigue instrucciones y puede generar contenido incoherente u ofensivo si se le presenta como asistente.
- Riesgo elevado de alucinacion: con 98-111M de parametros y aproximadamente 18M de tokens de entrenamiento, su conocimiento factual del mundo es minimo y sus afirmaciones no deben tratarse como fiables.
- Sesgos del corpus: entrenado exclusivamente sobre el corpus BabyLM 2026 Strict-Small de tipo "developmental", hereda los sesgos de composicion, registro y dominio de esa fuente. El autor no documenta analisis de sesgo.
- Idioma unico: solo ingles declarado; no hay evaluacion ni garantia de comportamiento en castellano u otras lenguas.
- Contexto corto: 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o tareas de recuperacion con contexto amplio.
- Capacidades agenticas y de herramientas inexistentes: no soporta tool calling, function calling ni razonamiento multi-paso inducido.
- Rendimiento linguistico moderado: BLiMP 65,86 y BLiMP-supplement 58,04 estan lejos de modelos modernos; EWoK 49,30 y COMPS 52,05 rondan el azar en varias submuestras.
- Seguimiento de entidades a nivel de azar: la diferencia de +12,09 puntos frente al baseline es, segun el autor, un artefacto de sesgo de longitud y no una capacidad real.
- Limitaciones metodologicas de la evaluacion: la referencia de GLUE no es una reevaluacion local sino el numero publicado oficialmente; la metrica AoA no se evaluo y su scorer upstream tiene un bug abierto; la tabla de resultados es de un unico seed de entrenamiento.
- Numerica no caracterizada: el entrenamiento se hizo en fp32 sobre Apple Silicon y el autor no ha caracterizado las diferencias numericas frente a una ejecucion en CUDA.
- Formatos: no se publican pesos cuantizados ni GGUF, lo que obliga a convertir manualmente si se quiere desplegar en llama.cpp u Ollama.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; al ser un modelo base, cualquier producto derivado sigue requiriendo evaluacion propia de seguridad y sesgo.
- Trazabilidad: 96 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigacion con validacion externa limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrothroc/mixlab-gpt2-strict-small-replica
- Configuracion del modelo exportado: https://huggingface.co/mrothroc/mixlab-gpt2-strict-small-replica/blob/main/config.json
- Configuracion completa de mixlab (arquitectura y receta): https://huggingface.co/mrothroc/mixlab-gpt2-strict-small-replica/blob/main/training_config.mixlab.json
- Baseline oficial reproducido: https://huggingface.co/BabyLM-community/babylm-baseline-10m-gpt2
- Repositorio del entrenador mixlab: https://github.com/mrothroc/mixlab
- Repositorio companion con receta, configs, scripts e informes de evaluacion: https://github.com/mrothroc/mixlab-babylm-gpt2
- Harness de evaluacion BabyLM (referencia `3bf5142`): https://github.com/babylm-org/babylm-eval
- Bug abierto del scorer de AoA: https://github.com/babylm-org/babylm-eval/issues/2
- Dataset: `BabyLM-community/BabyLM-2026-Strict-Small`

Nota sobre la busqueda web: los resultados devueltos corresponden a herramientas de resolucion de palabras (WordFinder, Jumble Solver) y no guardan relacion con el modelo ni con BabyLM, por lo que no se han incluido como enlaces relevantes. No se han encontrado papers, blogs ni demos adicionales del modelo en la busqueda realizada.
