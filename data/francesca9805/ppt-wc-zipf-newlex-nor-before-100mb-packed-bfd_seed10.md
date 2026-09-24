# francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed10` es un modelo de generacion de texto de tipo GPT-2 (transformer decoder-only, causal) con 86.508.288 parametros totales, obtenido mediante *fine-tuning* supervisado (SFT) del modelo base `goldfish-models/eng_latn_100mb`. Lo desarrolla el usuario de HuggingFace `francesca9805` y forma parte de una familia de experimentos de investigacion centrados en tokenizadores: la ejecucion asociada en Weights & Biases esta registrada en el proyecto "new-tokenizers". No es un modelo de proposito general orientado a produccion, sino un artefacto de investigacion.

El modelo base pertenece al proyecto *goldfish-models*, que publica modelos pequenos de estilo GPT-2 entrenados sobre aproximadamente 100 MB de texto por idioma; en este caso, el sufijo `eng_latn` indica ingles. El ajuste se ha realizado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1, y los pesos se distribuyen en formato `safetensors` (0,3 GB de repositorio). El nombre del modelo incluye marcas de un protocolo experimental (`ppt`, `wc-zipf`, `newlex`, `packed`, `bfd`, `seed10`) que apuntan a variaciones en la construccion del vocabulario y el empaquetado de secuencias.

La relevancia actual es limitada fuera del ambito de la investigacion de tokenizacion: se trata de un modelo pequeno, sin model card detallada, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha. Su interes reside en servir como punto de comparacion reproducible (semilla fija `seed10`) dentro de estudios sobre eficiencia de tokenizadores y no como modelo de asistencia conversacional o generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, causal, segun el tag `gpt2`) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en `safetensors`, probablemente FP32/FP16) |
| Idiomas soportados | no disponible en la model card; el modelo base es de ingles (`eng_latn`), pero el nombre incluye `nor` sin documentar |
| Licencia | no disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | `safetensors` (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de estilo GPT-2, segun el tag de HuggingFace `gpt2` y la clase de tareas `text-generation`. Con 86.508.288 parametros, se situa por debajo de GPT-2 small (124 M), lo que es coherente con una configuracion de vocabulario o de capas distinta a la del GPT-2 original; no se dispone del desglose de capas, dimension de embedding, cabezas de atencion ni tamano de vocabulario.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el modelo base `goldfish-models/eng_latn_100mb`, ejecutado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no describe la composicion del dataset de ajuste, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO; solo se indica el uso de SFT. La denominacion del modelo (`wc-zipf`, `newlex`, `packed`, `bfd`, `seed10`) y el nombre del proyecto de W&B ("new-tokenizers") sugieren que el experimento estudia variantes de tokenizacion, distribucion de frecuencias tipo Zipf y empaquetado de secuencias, pero estos detalles no estan formalmente documentados en la ficha del modelo.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2 y del ajuste SFT.
- Generacion condicionada por un unico turno de usuario, segun el ejemplo de `pipeline("text-generation", ...)` de la model card (se pasa una lista con `{"role": "user", "content": ...}`).
- Capacidad multilingue: no confirmada; el modelo base es de ingles, por lo que la competencia en otros idiomas no esta garantizada.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo *thinking*, vision, audio: no disponibles.
- No se documentan capacidades de codigo, matematicas o razonamiento avanzado. Cualquier uso de este tipo seria especulativo dado el tamano del modelo y la ausencia de evaluaciones.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo forma parte de una serie de experimentos (proyecto "new-tokenizers" en W&B) y puede emplearse como punto de comparacion reproducible con semilla fija para medir el efecto de distintas estrategias de vocabulario sobre la perplejidad.
- Reproduccion de experimentos academicos: dado que el autor publica variantes con distintas semillas y preajustes (por ejemplo, las de `fpadovani`), este modelo sirve para replicar y contrastar resultados en estudios de eficiencia de representacion.
- Prototipado rapido en CPU: con ~86 M de parametros, cabe en memoria de un portatil y permite montar demos de generacion de texto sin GPU dedicada.
- *Fine-tuning* adicional con pocos recursos: sirve como punto de partida para ajustes sobre corpus pequenos en entornos educativos o de investigacion con presupuesto de computo limitado.
- Experimentos de destilacion o cuantizacion: su tamano reducido lo hace util como caso de estudio para medir el impacto de INT8/INT4 en calidad de generacion.
- Evaluacion de sesgos y comportamento de modelos pequenos entrenados sobre 100 MB de texto: util para analisis academicos sobre que tipo de conocimiento se adquiere con presupuestos de datos muy bajos.
- Generacion de texto de relleno o *toy examples* en documentacion tecnica, tests de integracion de pipelines de HuggingFace (`transformers`, `text-generation-inference`) o validacion de endpoints compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en FP32, 0,17 GB en FP16/BF16, 0,09 GB en INT8 y 0,04 GB en INT4 (calculado a partir de los 86.508.288 parametros).
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer con 2 GB o mas (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, etc.). Tambien es viable en GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- Caber en GPU de consumo: si, en practicamente cualquier GPU moderna; tambien funciona en CPU sin problemas.
- Opciones de despliegue: `transformers` (referencia en la model card), `text-generation-inference` (etiqueta `text-generation-inference` en HuggingFace), `endpoints_compatible` (compatible con endpoints de HuggingFace). Otras opciones como vLLM, llama.cpp u Ollama requeririan conversion previa y no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera latencia de milisegundos por token en CPU moderna y muy inferior en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed10` | 86,5 M | no disponible | no disponible | Artefacto de investigacion, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible | no disponible | no disponible | GPT-2 entrenado sobre ~100 MB de texto en ingles |
| `distilgpt2` | ~82 M | 1.024 tokens | Apache 2.0 | Version destilada de GPT-2, ampliamente usada como linea base pequena |
| `gpt2` (GPT-2 small) | 124 M | 1.024 tokens | MIT | Referencia clasica de la familia GPT-2 |

Las cifras de contexto y licencia de `distilgpt2` y `gpt2` corresponden a sus configuraciones publicas habituales; conviene verificar cada ficha antes de un uso concreto. No se dispone de comparaciones de rendimiento entre estos modelos y el modelo descrito.

## Limitaciones y advertencias

- Modelo muy pequeno (86,5 M de parametros) y entrenado a partir de un corpus base de solo ~100 MB: la cobertura linguistica y de conocimiento es muy limitada.
- Riesgo elevado de alucinacion y de generacion incoherente, especialmente en tareas de razonamiento, matematicas o codigo.
- Sesgos potenciales heredados del corpus base (`goldfish-models/eng_latn_100mb`); no se documenta ningun proceso de alineacion, RLHF o filtrado de sesgos mas alla del SFT mencionado.
- Idiomas soportados sin documentar: aunque el modelo base es de ingles, el nombre incluye `nor` y no hay confirmacion oficial; no debe asumirse competencia multilingue.
- Licencia no especificada ("license" en la model card): no se puede garantizar el uso comercial ni la redistribucion; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia de resultados de benchmarks, de descripcion del dataset de ajuste y de documentacion sobre el tokenizador utilizado: la reproducibilidad queda condicionada a la ejecucion de W&B enlazada.
- Cero descargas y cero "likes" en el momento de redactar la ficha: no hay evidencia de uso en comunidad ni validacion externa.
- Artefacto de investigacion: no esta pensado ni validado para atencion al cliente, generacion de codigo en produccion ni despliegues con requisitos de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/crke0myi
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelos relacionados del mismo proyecto (autor `fpadovani`):
  - https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-66-warmup-eng-100mb_seed10
  - https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed10
  - https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-nld-100mb_seed10
  - https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed5
