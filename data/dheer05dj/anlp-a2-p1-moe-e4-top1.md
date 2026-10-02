# dheer05dj/anlp-a2-p1-moe-e4-top1

## Resumen

p1_moe_e4_top1 es un checkpoint de investigacion publicado por el usuario dheer05dj en HuggingFace, fruto de la asignacion 2 de un curso de ANLP (Advanced Natural Language Processing). Se trata de un transformer decoder-only implementado desde cero en PyTorch, con una capa de mezcla de expertos (MoE) de 4 expertos y enrutado top-1, disenado especificamente para traduccion automatica desde vietnamita y japones hacia ingles. El modelo tiene 41.574.912 parametros totales (41,57 M) de los cuales 28,99 M estan activos por token, lo que lo situa en la categoria de modelos muy pequenos y de investigacion.

Su relevancia es fundamentalmente didactica y experimental: sirve como ejemplo reproducible de una arquitectura MoE entrenada desde cero con un presupuesto minimo (14 minutos y 46 segundos de entrenamiento sobre 107.305.098 tokens), con resultados de traduccion notables para su tamano (BLEU de 43,44 en vietnamita-ingles y 33,72 en japones-ingles). No es un modelo orientado a produccion ni compite con modelos multilingues de gran escala.

La informacion publica es muy limitada: no se declara licencia, no hay pipeline asociado, el repositorio no incluye versiones cuantizadas y la busqueda web no devuelve ningun enlace relevante. El modelo solo resulta util si se dispone del codigo del repositorio de la asignatura (`src/part1/model.py` y `src/part1/train.py`), ya que no sigue la interfaz estandar de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), 4 expertos, enrutado top-1 |
| Parametros totales | 41.574.912 (41,57 M) |
| Parametros activos | 28,99 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | vietnamita (origen) y japones (origen) hacia ingles (destino), segun la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del modelo (d_model) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion | 8 |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE |
| Embeddings | atados (tied embeddings) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only escrito desde cero en PyTorch, sin depender de las clases de HuggingFace Transformers. Segun la model card, usa d_model de 512, 8 capas, 8 cabezas de atencion, codificacion posicional rotatoria (RoPE), normalizacion RMSNorm y embeddings atados entre la capa de entrada y la de salida. Sobre esta base se anade una capa de mezcla de expertos con 4 expertos y enrutado top-1, de ahi el sufijo `e4_top1` del nombre: cada token se enruta a un unico experto, lo que mantiene el coste de computo cercano al de un modelo denso del tamano de los parametros activos (28,99 M) en lugar del total (41,57 M).

El entrenamiento se realizo sobre 107.305.098 tokens (aproximadamente 107 M) y duro 14 minutos y 46 segundos, segun las metricas declaradas por el autor. La model card no detalla la composicion del dataset, el numero de pasos, el tamano de batch, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las metricas de evaluacion (`test_ppl_vi`, `test_ppl_ja`, `bleu_vi`, `bleu_ja`) confirman que la tarea es traduccion desde vietnamita y japones a ingles, pero no se especifica el corpus concreto. El `config.json` del repositorio contiene el objeto `TransformerConfig` que consume `src/part1/model.py`, y la carga debe hacerse con `src.part1.train.load_checkpoint(dir)`.

## Capacidades

- Traduccion automatica de vietnamita a ingles, con BLEU declarado de 43,44.
- Traduccion automatica de japones a ingles, con BLEU declarado de 33,72.
- Modelado de lenguaje causal generico en el dominio de entrenamiento (decoder-only con prediccion del siguiente token).
- Enrutado condicional mediante mezcla de expertos top-1, lo que permite estudiar el comportamiento y balanceo de expertos.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo de pensamiento explicito.
- No hay evidencia de capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues limitadas a los pares declarados; no se documentan otros idiomas.
- No se declara un pipeline de HuggingFace, por lo que no es invocable con la API `pipeline()` de Transformers sin adaptacion.

## Casos de uso

- Traduccion vietnamita-ingles en entornos educativos o de investigacion: el modelo traduce frases completas con un BLEU declarado de 43,44 y ocupa menos de 0,2 GB, por lo que se puede ejecutar en un portatil o incluso en CPU para demostraciones.
- Traduccion japones-ingles de bajo coste: con 33,72 de BLEU y 28,99 M de parametros activos, es adecuado para prototipos donde el presupuesto de computo es la restriccion principal, asumiendo calidad inferior a modelos multilingues grandes.
- Estudio de enrutado en mezclas de expertos: la configuracion de 4 expertos con top-1 permite analizar como se reparte la carga entre expertos por idioma, longitud de secuencia o dominio, un caso de uso tipico en trabajos de investigacion sobre MoE.
- Linea base (baseline) en experimentos academicos: sirve como referencia reproducible de un transformer pequeno entrenado desde cero, util para comparar variantes de arquitectura (densa frente a MoE, distintos valores de `top_k` o numero de expertos).
- Destilacion o inicializacion de modelos mayores: sus 41,57 M de parametros y su implementacion autocontenida lo hacen manejable como punto de partida para experimentos de destilacion o para inicializar modelos pequenos de traduccion.
- Despliegue en hardware muy limitado: con pesos safetensors de decimas de GB, se puede servir en dispositivos de borde o contenedores con poca memoria, siempre que se integre el codigo de carga del repositorio original.
- Docencia y reproduccion de resultados: el enlace a los logs de Weights & Biases y el tiempo de entrenamiento (14m 46s) permiten reproducir el experimento completo en una sola GPU en minutos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los que declara el autor en la model card. No se han publicado resultados en benchmarks estandar de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Perplejidad de test global (test_ppl) | 4,652 |
| Perplejidad de test en vietnamita (test_ppl_vi) | 3,989 |
| Perplejidad de test en japones (test_ppl_ja) | 5,424 |
| BLEU vietnamita-ingles (bleu_vi) | 43,44 |
| BLEU japones-ingles (bleu_ja) | 33,72 |
| BLEU agregado (bleu_all) | 38,62 |
| Tokens de entrenamiento | 107.305.098 |
| Tiempo de entrenamiento | 14 minutos 46 segundos |
| Parametros totales | 41,57 M |
| Parametros activos | 28,99 M |

No se dispone de comparaciones con otros modelos medidas bajo el mismo protocolo, por lo que los valores anteriores no son directamente comparables con cifras publicadas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 41.574.912 parametros): aproximadamente 166 MB en fp32, 83 MB en fp16/bf16, 42 MB en int8 y 21 MB en int4, sin contar la cache KV (que depende de la longitud de contexto, dato no disponible).
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050/1650 (4 GB), RTX 3050/3060 (8-12 GB), RTX 4070/4090, e incluso en GPUs integradas con memoria compartida.
- Inferencia viable en CPU: el modelo es lo bastante pequeno para ejecutarse por CPU con latencias aceptables en entornos de demo, aunque no se han publicado mediciones.
- GPU de centro de datos (A100, H100) innecesarias; el entrenamiento completo declaro 14m 46s, lo que sugiere que se realizo en una unica GPU modesta.
- Opciones de despliegue: no hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI. La carga requiere el codigo del repositorio de la asignatura (`src.part1.train.load_checkpoint`) y los pesos safetensors del repositorio.
- Para usarlo con herramientas estandar seria necesario portar la definicion del modelo a Transformers y, en su caso, exportar a GGUF adaptando la implementacion de la capa MoE.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, tarea y formato. Los recuentos de parametros de los alternativos proceden de sus nombres publicos y deben verificarse antes de citarlos.

| Modelo | Parametros | Tarea | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p1_moe_e4_top1 | 41,57 M (28,99 M activos) | Traduccion vi/ja -> en | Transformer decoder-only MoE, 4 expertos top-1 | no disponible | HuggingFace, requiere codigo propio |
| Helsinki-NLP/opus-mt-vi-en | orden de 70-80 M | Traduccion vi -> en | Transformer seq2seq denso | no verificada en la informacion proporcionada | HuggingFace, integrado en Transformers |
| facebook/m2m100_418M | 418 M | Traduccion multilingue (100 idiomas) | Transformer encoder-decoder denso | no verificada en la informacion proporcionada | HuggingFace, integrado en Transformers |
| facebook/nllb-200-distilled-600M | 600 M | Traduccion multilingue (200 idiomas) | Transformer encoder-decoder denso | no verificada en la informacion proporcionada | HuggingFace, integrado en Transformers |

Frente a estos modelos, p1_moe_e4_top1 destaca por su tamano muy reducido y su arquitectura MoE, pero carece de licencia declarada, de integracion con el ecosistema Transformers y de evaluacion externa que permita validar sus BLEU declarados.

## Limitaciones y advertencias

- Modelo de investigacion sin licencia declarada: no se puede asumir permiso de uso comercial. Ante cualquier uso en produccion hay que contactar con el autor para aclarar los terminos.
- Cero descargas y cero likes en el momento de la consulta, sin validacion independiente de las metricas publicadas.
- Los BLEU de 43,44 (vi) y 33,72 (ja) y las perplejidades declaradas no se han medido bajo un protocolo publico y reproducible; el corpus de test no esta documentado.
- Riesgo alto de alucinacion fuera del dominio: el modelo se entreno con aproximadamente 107 M de tokens y no hay indicios de ajuste por instrucciones (RLHF/DPO) ni de filtrado de seguridad.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no se pueden evaluar sesgos de genero, nacionalidad o dominio.
- Limitacion idiomatica: solo se declaran vietnamita, japones e ingles. No se garantiza comportamiento coherente en castellano ni en otros idiomas.
- Longitud de contexto no especificada: no se puede planificar el truncado ni estimar la memoria de la cache KV sin consultar el `config.json` del repositorio.
- Sin integracion estandar: no funciona con `pipeline()`, `AutoModelForCausalLM` ni con servidores de inferencia habituales sin escribir codigo de adaptacion.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ, AWQ ni versiones ONNX en el repositorio, lo que complica el despliegue en llama.cpp u otros runners ligeros.
- Modelo orientado a traduccion: usarlo como asistente conversacional general producira respuestas poco fiables, ya que no se entreno para seguir instrucciones.
- Fecha de publicacion inusualmente futura en los metadatos (2026-10-01), lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p1-moe-e4-top1
- Logs de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part1-moe/runs/plznk5ro
- Paper asociado: no disponible
- Repositorio de codigo: no disponible publicamente en la informacion proporcionada (la model card referencia `src/part1/model.py` y `src/part1/train.py` de un repositorio de asignatura no enlazado)
- Demo: no disponible

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a foros y grupos de discusion sin relacion con el checkpoint.
