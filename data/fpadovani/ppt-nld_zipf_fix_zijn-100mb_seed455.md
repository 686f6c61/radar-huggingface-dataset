# fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, publicado por el usuario fpadovani. Se trata de un modelo de generacion de texto de tipo decoder-only con arquitectura GPT-2, segun las etiquetas declaradas en su repositorio de HuggingFace, y cuenta con 86.708.736 parametros reales confirmados a partir de los pesos en formato safetensors.

El modelo ha sido entrenado mediante SFT (Supervised Fine-Tuning) utilizando la libreria TRL en su version 0.23.0, sobre el stack de Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4. El identificador del modelo incluye el sufijo `seed455`, lo que indica que forma parte de una familia de experimentos reproducibles con semillas fijas, y la cadena `nld_zipf_fix_zijn` sugiere un experimento sobre el modelo neerlandes con alguna correccion relacionada con la distribucion Zipf, aunque la model card no detalla el procedimiento experimental.

Se trata de un modelo de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada ni idiomas explicitados en la metadata. Por su tamano (menos de 100 millones de parametros) y su naturaleza experimental, esta orientado a tareas de investigacion en linguistica computacional y modelado de lenguas de bajos recursos, mas que a despliegues de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiquetas del repositorio) |
| Parametros totales | 86.708.736 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la metadata; el identificador del modelo base (`nld_latn`) corresponde a neerlandes en escritura latina |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nld_latn_100mb |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo basado en la arquitectura GPT-2 (transformer decoder-only con atencion causal), heredada del modelo base `goldfish-models/nld_latn_100mb`. El numero de parametros confirmado (86.708.736) es inferior al de GPT-2 small (124 millones), lo que sugiere una configuracion con menos capas, menor dimension oculta o un vocabulario mas reducido, aunque la model card no especifica la configuracion exacta de capas, cabezas de atencion o dimension del embedding. Los modelos de la familia goldfish estan disenados para el estudio de lenguas concretas a partir de volumenes controlados de datos de entrenamiento, y el sufijo `100mb` del modelo base apunta a un corpus de entrenamiento de 100 MB.

El entrenamiento se realizo mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se aplicaron tecnicas posteriores como DPO, RLHF o decodificacion especulativa. Tampoco se documenta ninguna innovacion arquitectonica adicional. El unico artefacto de seguimiento disponible es una ejecucion de Weights & Biases enlazada desde la model card. El identificador del modelo incluye el termino `zipf_fix`, que sugiere que el experimento aborda algun ajuste relacionado con la distribucion de frecuencia Zipf, pero no hay documentacion tecnica que lo confirme.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation` y el ejemplo de la model card muestra generacion condicionada por un mensaje de usuario con `max_new_tokens`.
- Ajuste por instrucciones: al haber sido entrenado con SFT y usar TRL, esta preparado para seguir instrucciones en formato de conversacion, tal como refleja el ejemplo de uso con estructura de roles (`role`, `content`).
- Generacion condicionada por prompt largo: el ejemplo de la model card utiliza una pregunta extensa y devuelve la continuacion, lo que indica capacidad de condicionamiento textual basico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la unica indicacion linguistica es el identificador `nld_latn` del modelo base, que corresponde al neerlandes.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints: si, segun las etiquetas `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Investigacion en linguistica computacional del neerlandes: el modelo permite estudiar como un ajuste fino sobre un corpus neerlandes de 100 MB afecta a la generacion de texto, comparando el modelo base con la version ajustada en experimentos controlados por semilla (`seed455`).
- Experimentos de reproducibilidad: al incluir una semilla fija en el nombre, es util para replicar resultados de ajuste fino y comparar variantes de hiperparametros dentro de una misma familia de experimentos.
- Analisis de distribuciones de frecuencia (Zipf): la nomenclatura del modelo sugiere su uso en estudios sobre como el ajuste fino modifica la distribucion de frecuencias de tokens generados, un area clasica de analisis en modelos de lenguaje.
- Generacion de texto de bajo coste computacional: con menos de 100 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para prototipado rapido de pipelines de generacion sin infraestructura dedicada.
- Pruebas de integracion de pipelines con Transformers y TRL: sirve como banco de pruebas para validar flujos de `pipeline("text-generation")`, plantillas de chat y compatibilidad con text-generation-inference antes de escalar a modelos mayores.
- Educacion y docencia: su tamano reducido y su naturaleza experimental lo hacen adecuado para demostraciones en cursos sobre ajuste fino supervisado, visualizacion de entrenamiento con Weights & Biases y evaluacion de modelos pequenos.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo pequeno, permite medir el impacto de cuantizaciones int8 o int4 en la calidad de generacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 347 MB solo para los pesos (86,7 M de parametros x 4 bytes).
- VRAM estimada en fp16 o bf16: aproximadamente 173 MB para los pesos.
- VRAM estimada en int8: aproximadamente 87 MB para los pesos.
- VRAM estimada en int4: aproximadamente 43 MB para los pesos.
- Nota: estas cifras son calculos derivados del numero de parametros confirmado; no incluyen el consumo del runtime, la cache KV ni el overhead de la libreria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida.
- Ejecucion en CPU: viable para inferencia con llama.cpp o con Transformers en modo CPU, dado el tamano reducido.
- Opciones de despliegue: Transformers (pipeline de text-generation), text-generation-inference (segun las etiquetas del repositorio) y endpoints compatibles. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-nld_zipf_fix_zijn-100mb_seed455 | 86,7 M | no disponible | no disponible | HuggingFace (0 descargas) |
| goldfish-models/nld_latn_100mb (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| distilgpt2 | 82 M | 1024 tokens | Apache-2.0 | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | HuggingFace |

La comparacion con `distilgpt2` y `GPT-2 small` se incluye por proximidad de tamano, pero debe interpretarse con cautela: se trata de modelos entrenados con objetivos, volumenes de datos y corpus distintos, y no existen benchmarks publicados de este modelo que permitan una comparacion cuantitativa directa. El modelo base `goldfish-models/nld_latn_100mb` es la referencia mas inmediata para medir el efecto del ajuste fino.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta analisis de sesgos ni composicion del dataset de ajuste fino.
- Riesgo de alucinacion: alto en terminos relativos, al ser un modelo de menos de 100 millones de parametros sin verificacion factual documentada ni tecnicas de alineacion mas alla del SFT.
- Limitaciones de contexto: la longitud de contexto no esta declarada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Limitaciones de idioma: la metadata no declara idiomas soportados; el identificador del modelo base apunta al neerlandes, por lo que el rendimiento en castellano u otras lenguas no esta garantizado ni documentado.
- Restricciones de licencia: la licencia figura como "no disponible" tanto en la metadata como en la model card, lo que impide determinar si se permite el uso comercial. No debe utilizarse en produccion sin aclarar antes los terminos legales.
- Uso en produccion: el modelo tiene cero descargas, cero likes y una model card minima sin evaluaciones, por lo que carece de validacion por parte de la comunidad.
- Discrepancia de tamano: el repositorio ocupa 1,4 GB frente a los aproximadamente 173 MB que ocuparian los pesos en fp16, lo que sugiere la presencia de archivos adicionales (por ejemplo, estados del optimizador o checkpoints intermedios) que no estan documentados.
- Procedencia experimental: el nombre del modelo indica una ejecucion concreta de un experimento academico (semilla 455) y no una version estable o mantenida.
- Fecha de creacion: la metadata indica fechas de 2026, lo que debe verificarse antes de citar el modelo en trabajos academicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/l1dwqn6c
