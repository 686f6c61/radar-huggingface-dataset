# francesca9805/eng-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

`francesca9805/eng-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` es un modelo de generacion de texto de arquitectura GPT-2 (transformer decoder-only) con 124.770.816 parametros, publicado por el usuario de HuggingFace francesca9805. No se trata de un modelo de proposito general, sino de un artefacto de investigacion: segun se deduce del identificador y de la model card, es el resultado de un ajuste fino supervisado (SFT) mediante TRL sobre un modelo base ya entrenado del mismo autor, en el marco de una experimentacion sobre tokenizadores y corpus en ingles de aproximadamente 100 MB. El proyecto asociado en Weights & Biases se denomina "new-tokenizers", lo que apunta a una linea de trabajo centrada en vocabularios, distribucion Zipf y empaquetado (packing) de secuencias.

El modelo resuelve, por tanto, un problema de experimentacion mas que de producto: sirve para comparar variantes de entrenamiento (antes y despues de un paso de "wc-zipf-newlex", con checkpoint 500, con packing, seed 10) manteniendo constante la arquitectura. Su relevancia actual es limitada para desarrolladores en produccion, ya que no se han publicado benchmarks, no declara licencia efectiva, no declara idiomas y acumula cero descargas y cero likes en el momento de la consulta. Resulta util, en cambio, como pieza reproducible dentro de una ablacion academica sobre tokenizacion.

La model card original es una plantilla autogenerada por TRL: incluye un ejemplo de uso con `pipeline`, los enlaces a Weights & Biases y las versiones de framework (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1), pero no documenta datos de entrenamiento, hiperparametros ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` y la libreria `transformers`) |
| Parametros totales | 124.770.816 (dato real de safetensors, ~124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles; el identificador incluye "eng", lo que sugiere entrenamiento centrado en ingles, pero no hay declaracion oficial |
| Licencia | no disponible (la model card contiene un marcador `licence: license` sin contenido juridico) |
| Formato de pesos | safetensors (tambien compatible con la libreria `transformers`) |
| Tamano del repositorio | 6,2 GB |
| Modelo base | `francesca9805/ppt-wc-zipf-newlex-eng-before-100mb-packed-bfdiso_seed10` |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-10-11 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` y el recuento de parametros (124,77 M) coinciden con la configuracion de GPT-2 small: un transformer decoder-only con atencion causal, normalizacion por capas previa y embeddings de token atados a la proyeccion de salida. No hay indicios de arquitecturas alternativas (MoE, SSM, hibridas) ni de innovaciones como atencion lineal o decodificacion especulativa. El modelo es una continuacion por ajuste fino de otro modelo del mismo autor, no un entrenamiento desde cero.

El entrenamiento declarado es SFT mediante la libreria TRL, con Transformers 4.56.2, PyTorch 2.11.0 y Tokenizers 0.22.1, y el run esta registrado en Weights & Biases bajo el proyecto "new-tokenizers" (run `qri64ian`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia, el uso de packing efectivo, ni si hubo fases posteriores de RLHF o DPO (el tag `sft` sugiere que no). El nombre del modelo codifica variables experimentales (corpus de 100 MB en ingles, distribucion Zipf, "newlex", checkpoint 500, packing, `bfdiso`, semilla 10), pero su significado exacto no esta documentado en la model card.

## Capacidades

- Generacion de texto autoregresiva en el estilo y dominio del corpus de ajuste; es la unica capacidad confirmada por el pipeline `text-generation`.
- Conversacion de un solo turno en el formato de chat mostrado en la model card, aunque no hay evidencia de un ajuste especifico de plantilla de chat mas alla de la que introduce TRL.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No hay evidencia de capacidades de vision, audio o multimodalidad.
- Capacidad multilingue: no disponible; el identificador apunta a un enfoque en ingles.
- Capacidad de codigo o matematicas: no documentada ni evaluada; con 124 M de parametros y un corpus de ajuste de ~100 MB, el rendimiento esperable en estas tareas es muy limitado.

## Casos de uso

- Reproduccion de ablaciones sobre tokenizacion: el modelo permite comparar el efecto de un vocabulario nuevo frente al modelo base `ppt-wc-zipf-newlex-eng-before-100mb-packed-bfdiso_seed10`, manteniendo arquitectura y presupuesto de datos.
- Analisis de empaquetado de secuencias (packing): al formar parte de una serie experimental con packing, sirve para medir como afecta el empaquetado a la perdida y a la coherencia del texto generado en corpus pequenos.
- Generacion de texto de dominio restringido: util para producir continuaciones estilisticas sobre el mismo tipo de corpus en ingles con el que se ajusto, siempre que se valide la calidad manualmente.
- Docencia y practicas de ajuste fino: su tamano (124,8 M de parametros) permite ejecutar el pipeline completo de SFT y de inferencia en una unica GPU de consumo o incluso en CPU, lo que lo hace adecuado para laboratorios y cursos.
- Pruebas de infraestructura de despliegue: sirve como carga ligera para validar integraciones con `text-generation-inference`, vLLM o endpoints compatibles, dado el tag `endpoints_compatible`.
- Estudio de sesgos y calidad en modelos pequenos: al ser un modelo de baja capacidad entrenado con un corpus limitado, es un caso util para medir degradacion, repeticion y fuga de datos de entrenamiento.
- Generacion de datos sinteticos de bajo valor anadido: posible uso como generador auxiliar de texto de relleno o aumento de datos, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, GLUE ni ninguna otra metrica, y tampoco se aportan cifras de perplejidad sobre un conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): ~500 MB en fp32, ~250 MB en fp16/bf16, ~125 MB en int8, ~65-70 MB en 4 bits. Con cache KV y overhead del runtime, conviene reservar entre 1 y 2 GB en fp16 para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y quedaran limitadas por el ancho de banda, no por la memoria.
- Inferencia en CPU: totalmente viable en un portatil moderno; con 124,8 M de parametros el cuello de botella es la latencia, no la capacidad.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4090, Apple Silicon mediante MPS.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (el tag `endpoints_compatible` sugiere compatibilidad con endpoints), vLLM y llama.cpp/Ollama si se convierte previamente a GGUF (no se distribuye ninguna cuantizacion GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (francesca9805/eng-100mb-...) | 124,8 M | no disponible | no disponible | Repositorio HuggingFace, 0 descargas, 0 likes |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT | Ampliamente disponible |
| distilgpt2 | 82 M | 1024 tokens | Apache-2.0 | Ampliamente disponible |
| EleutherAI/pythia-160m | 162 M | 2048 tokens | Apache-2.0 | Ampliamente disponible |

Los tres modelos de referencia son alternativas establecidas en la misma franja de tamano (80-165 M de parametros) y con licencias permisivas verificables. Frente a ellos, este modelo no aporta informacion de evaluacion ni condiciones de uso claras, por lo que solo resulta preferible en el contexto concreto del experimento de tokenizacion para el que fue creado. Los datos de contexto y licencia de los modelos comparados corresponden a sus configuraciones publicas habituales; conviene verificarlos en sus respectivas model cards antes de usarlos en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus en ingles de ~100 MB no descrito, es probable que herede sesgos del corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en terminos relativos, dado el tamano (124,8 M de parametros) y la ausencia de ajuste por preferencias; no debe usarse para generar informacion factual sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el modelo parece orientado al ingles; no hay garantia de comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible. El campo `licence: license` de la model card es un marcador de plantilla sin contenido juridico. No se debe asumir uso comercial permitido.
- Modelo de investigacion sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin documentacion de datos de entrenamiento ni de hiperparametros.
- Trazabilidad limitada: depende de un modelo base del mismo autor que tambien carece de documentacion detallada, lo que dificulta auditar que datos se usaron.
- Calidad de generacion esperable baja: sin benchmarks, la unica evidencia es el ejemplo de la model card, insuficiente para valorar coherencia, repeticion o fidelidad.
- No apto para produccion sin evaluacion previa: la ausencia de cuantizaciones oficiales y de pruebas de latencia obliga a validar cualquier despliegue desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eng-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-eng-before-100mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/qri64ian
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
