# francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/swa_latn_100mb`, desarrollado por el usuario de HuggingFace `francesca9805` (vinculado a la Universidad de Groningen según el enlace de Weights & Biases). Se trata de un modelo de generación de texto de arquitectura GPT-2 con 124.770.816 parámetros, entrenado específicamente para swahili en escritura latina (código `swa_latn`).

El modelo parte de la familia Goldfish, una colección de modelos monolingües entrenados con aproximadamente 100 MB de texto por idioma, diseñada para cubrir lenguas con pocos recursos. Este ajuste concreto se ha realizado con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1, aplicando SFT sobre un dataset empaquetado (packed) identificado en el nombre como `ppt-Dp-100mb-packed`. El sufijo `seed3407` indica que corresponde a una ejecución concreta con semilla fija, lo que sugiere que forma parte de un barrido experimental de reproducibilidad.

Su relevancia es limitada fuera del ámbito de la investigación: es un modelo pequeño (0,3 GB de repositorio), con cero descargas y cero likes en el momento de la consulta, sin licencia declarada de forma explícita y sin benchmarks publicados. Resulta útil como artefacto de estudio sobre ajuste de modelos multilingües de bajo recurso, no como componente de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, denso) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 1024 tokens (estandar de la arquitectura GPT-2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible oficialmente; admite fp16, int8 e int4 mediante bitsandbytes/transformers y conversion a GGUF |
| Idiomas soportados | swahili en escritura latina (`swa_latn`), inferido del modelo base; no declarado en la model card |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, coherente con la etiqueta `gpt2` del repositorio y con el recuento de parámetros, que coincide con el tamaño GPT-2 small (124M). No se trata de un modelo MoE, SSM ni híbrido. El modelo base `goldfish-models/swa_latn_100mb` pertenece a la familia Goldfish de modelos monolingües de 100 MB por idioma, orientada a lenguas de bajos recursos.

El ajuste se ha realizado mediante SFT con la librería TRL en su versión 0.23.0, sobre el stack Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo indica que se usó un dataset empaquetado (`packed`) de 100 MB y una semilla fija (`seed3407`), pero no se documentan en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas adicionales de RLHF o DPO. No se declaran innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras).

## Capacidades

- Generación de texto autoregresiva en swahili (escritura latina), heredada del modelo base monolingüe.
- Finalización y continuación de texto con plantilla conversacional de un solo turno, tal y como muestra el ejemplo de `pipeline` de la model card con formato de mensaje `{"role": "user", "content": ...}`.
- Ajuste mediante SFT orientado a instrucciones, aunque no se documenta el dataset ni el formato exacto de las instrucciones.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni modo de razonamiento (thinking).
- Capacidad multilingüe: no disponible; el modelo base es monolingüe de swahili.

## Casos de uso

- Investigación sobre ajuste fino de modelos de bajos recursos: sirve como punto de comparación reproducible (semilla 3407) frente a otras ejecuciones del mismo autor para estudiar la varianza entre semillas en SFT.
- Experimentos sobre tokenización de swahili: al derivar del modelo `swa_latn_100mb`, permite analizar cómo afecta el vocabulario del tokenizador al rendimiento en una lengua aglutinante.
- Generación de texto de dominio acotado en swahili: en tareas de continuación de texto sencillo donde se disponga de ejemplos de referencia, sin esperar la calidad de modelos comerciales.
- Docencia y cursos de NLP: su tamaño (0,3 GB, 124M de parámetros) permite ejecutar entrenamiento e inferencia en un portátil o en GPU de gama baja, ideal para prácticas.
- Pruebas de pipelines de despliegue ligero: sirve para validar integraciones con vLLM, llama.cpp o TGI antes de escalar a modelos mayores.
- Estudio de empaquetado de secuencias (packed) en SFT: al estar entrenado sobre datos empaquetados, permite reproducir experimentos sobre efectos del packing en la pérdida y en la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos; en int8, unos 0,13 GB; en int4, alrededor de 0,07 GB más overhead.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650, e incluso en CPU con memoria RAM suficiente y en dispositivos de placa única como Raspberry Pi.
- GPU de centro de datos (A100, H100) innecesarias; el modelo no aprovecha su capacidad.
- Opciones de despliegue: transformers con `pip install transformers` (ejemplo oficial de la model card), además de vLLM, llama.cpp, Ollama y TGI tras la conversión a los formatos correspondientes. La etiqueta `text-generation-inference` del repositorio sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles; dado el tamaño, se espera latencia de milisegundos por token en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407 | 124.770.816 | 1024 (arquitectura GPT-2) | sin benchmarks publicados | no disponible | HuggingFace (0 descargas) |
| goldfish-models/swa_latn_100mb (modelo base) | ~124M | 1024 (arquitectura GPT-2) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| GPT-2 small | 124M | 1024 | benchmarks publicos conocidos (GLUE, LAMBADA, etc.) | MIT (original) | HuggingFace, muy extendido |

No se han proporcionado modelos comparables adicionales especificos para swahili de bajos recursos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre 100 MB de texto de swahili, cabe esperar sesgos presentes en esa fuente, pero no se declaran.
- Riesgo de alucinacion: alto por su reducido numero de parametros y por tratarse de un modelo de 100 MB de datos; no se recomienda su uso en tareas de fiabilidad factual.
- Limitaciones de contexto: ventana de 1024 tokens (GPT-2 estandar), insuficiente para conversaciones largas o documentos extensos.
- Limitaciones de idioma: monolingüe de swahili (latn); no hay evidencia de soporte para castellano ni otras lenguas.
- Restricciones de licencia: la licencia no esta especificada (`licence: license` en la model card), por lo que el uso comercial queda en un limbo legal y no se puede asumir permisividad.
- Caveat de produccion: el repositorio tiene cero descargas y cero likes, sin validacion externa; ademas forma parte de un barrido experimental con semilla fija (`seed3407`), lo que sugiere que no esta pensado como version estable de publicacion.
- No se documentan datos de entrenamiento, formato de instrucciones ni proceso de evaluacion, lo que dificulta auditar su comportamiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Ejecucion en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/l5s6dxp7
- Variante relacionada (semilla 3407, BFD): https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Variante relacionada (semilla 10): https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en friendli.ai: https://friendli.ai/models/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/swa-latn-100mb-ppt-dp-100mb-packed-bfd_seed3407
