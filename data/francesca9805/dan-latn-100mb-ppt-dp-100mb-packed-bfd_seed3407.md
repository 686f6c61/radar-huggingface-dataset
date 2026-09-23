# francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

Este modelo es un ajuste fino supervisado (SFT) del checkpoint monolingüe danés `goldfish-models/dan_latn_100mb`, publicado por el usuario `francesca9805` bajo el identificador `dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407`. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parámetros (cifra real extraída de los pesos en safetensors, prácticamente idéntica a la de GPT-2 small). El entrenamiento se realizó con la librería TRL 0.23.0 sobre Transformers 4.56.2, y el modelo se distribuye en formato safetensors listo para `transformers` y compatible con Text Generation Inference.

El interés del checkpoint es acotado y de carácter experimental. No es un modelo de propósito general ni compite con los LLM actuales: por tamaño (124 M de parámetros), por el corpus del modelo base (aproximadamente 100 MB de texto en danés) y por el hecho de que la propia model card no documenta dataset de ajuste, hiperparámetros ni evaluación, debe entenderse como un artefacto de investigación. El sufijo `ppt` y el nombre del proyecto en Weights & Biases del autor (`new-tokenizers`) apuntan a experimentos de tokenización o de preentrenamiento proyectado, aunque esto no está confirmado en la documentación disponible.

Su relevancia ahora es doble: por un lado, sirve como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo base muy pequeño; por otro, es un caso típico de checkpoint con licencia sin cumplimentar ("licence: license" en la model card), cero descargas y cero evaluaciones publicadas, lo que ilustra la importancia de auditar la procedencia y la licencia antes de reutilizar pesos de HuggingFace en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (deducido del tag `gpt2` y del modelo base) |
| Parametros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (la configuracion estandar de GPT-2 es de 1024 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Al distribuirse en safetensors, es tecnicamente convertible a int8/int4 con GPTQ, AWQ o llama.cpp, pero no hay artefactos GGUF oficiales |
| Idiomas soportados | Danés (deducido del identificador `dan_latn` del modelo base; no confirmado en la model card) |
| Licencia | No disponible: la model card contiene el campo `licence: license` sin cumplimentar |
| Formato de pesos | safetensors (`library_name: transformers`) |

Otros datos tecnicos: tamaño del repositorio 0,3 GB, pipeline `text-generation`, tags `text-generation-inference` y `endpoints_compatible`, creado el 22 de septiembre de 2026. Entorno de entrenamiento documentado: TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1.

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card más allá del tag `gpt2` y del modelo base. El recuento de parámetros (124.770.816) coincide con el de GPT-2 small, es decir, un transformer decoder-only con atención causal completa, normalización pre-LayerNorm y embeddings de tokens atados a la capa de salida. No hay indicios de que se hayan introducido innovaciones como atención lineal, decodificación especulativa, SSM ni capas MoE: es una arquitectura densa convencional.

El entrenamiento consiste en un ajuste fino supervisado (SFT) mediante TRL sobre el checkpoint `goldfish-models/dan_latn_100mb`, un modelo de 100 MB de corpus en danés del proyecto goldfish-models. No se documentan el número de tokens de entrenamiento, la composición del dataset de ajuste, la existencia de fases de RLHF o DPO, ni los hiperparámetros (learning rate, épocas, batch size). Tampoco se especifica si se modificó el tokenizador, aunque el nombre del proyecto de seguimiento (`new-tokenizers`) sugiere que el eje del experimento es precisamente la tokenización. El ejemplo de uso de la model card emplea un formato conversacional con lista de mensajes `{"role": "user", "content": ...}`, lo que implica que el checkpoint espera una plantilla de chat, sin que se detalle cuál.

## Capacidades

- Generación de texto autoregresiva en danés, condicionada a un prompt o a una lista de mensajes con roles.
- Formato conversacional de un solo turno en el ejemplo oficial (`pipeline("text-generation", ...)` con `[{"role": "user", "content": ...}]`), sin que se documente soporte real de diálogo multi-turno.
- Continuación de texto y modelado de lenguaje: al derivar de un modelo base entrenado sobre 100 MB de danés, su uso natural es la continuación y el ajuste posterior, no la instrucción compleja.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (*thinking mode*).
- No hay evidencia de capacidades multilingües: el modelo base es monolingüe danés.
- No se documentan capacidades específicas de código o matemáticas, y por tamaño y datos de partida no cabe esperar un rendimiento relevante en esas áreas.

## Casos de uso

- Experimentación académica con tokenizadores: el nombre del proyecto de Weights & Biases (`new-tokenizers`) y el sufijo `ppt` sugieren que el checkpoint forma parte de una comparativa de esquemas de tokenización. Se usaría como punto de comparación fijo en un *ablation study* sobre el mismo corpus danés.
- Reproducción de pipelines de SFT con TRL: sirve como ejemplo mínimo (124 M de parámetros, 0,3 GB de repositorio) para validar un flujo completo de ajuste supervisado en una sola GPU consumer, incluyendo el registro en Weights & Biases.
- Generación de texto sintético en danés para aumentar datasets: con un corpus de partida de 100 MB, el modelo puede producir continuaciones de dominio estrecho que, filtradas por calidad, sirven para *data augmentation* en tareas de clasificación danesa.
- Punto de partida para ajustes posteriores: al ser pequeño y caber en cualquier GPU, es un candidato razonable para *fine-tuning* adicional en una especialidad concreta (por ejemplo, titulares o descripciones de producto en danés) cuando no se dispone de cómputo para modelos de miles de millones de parámetros.
- Inferencia en CPU o dispositivos embebidos: con aproximadamente 250 MB en FP16 y 65 MB en int4, puede ejecutarse en un portátil, en una Raspberry Pi o dentro del *free tier* de HuggingFace Endpoints (`endpoints_compatible`) para demos de latencia baja.
- Docencia y pedagogía de LLM: permite mostrar de forma tangible las limitaciones de un modelo de 124 M entrenado con 100 MB de texto (repeticiones, pérdida de coherencia a partir de pocos cientos de tokens) frente a modelos actuales.
- Auditoría de sesgos en modelos pequeños: útil como sujeto de estudio para medir cómo se propagan los sesgos de un corpus monolingüe reducido tras un ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica (ni perplejidad, ni MMLU, ni evaluaciones específicas para danés como el Danish Gigaword o ScandEval), y tampoco se han encontrado evaluaciones externas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32, 250 MB en FP16/BF16, 125 MB en int8 y 62-65 MB en int4, calculado a partir de 124,77 M de parámetros. A esto hay que sumar el *KV cache* y el *overhead* del runtime, que en la práctica suelen dominar el consumo total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4090, A100, H100 e incluso en GPU integradas. La elección de GPU no vendrá determinada por la VRAM sino por el *throughput* deseado.
- Cabe holgadamente en GPU consumer de gama baja y media: GTX 1050 Ti, GTX 1650, RTX 2060, RTX 3060, RTX 4060, así como en CPU exclusivamente.
- Opciones de despliegue: `transformers` con `pipeline` (el ejemplo oficial), Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad), HuggingFace Inference Endpoints y vLLM. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, que no se distribuye.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407` | 124,77 M | No disponible | GPT-2 + SFT (TRL) | No disponible (campo sin cumplimentar) | Peso safetensors en HuggingFace, 0 descargas |
| `goldfish-models/dan_latn_100mb` (modelo base) | Orden de 100 M (no confirmado) | No disponible en la informacion proporcionada | GPT-2 monolingüe danés | No disponible en la informacion proporcionada | Publico en HuggingFace |
| `openai-community/gpt2` (referencia de arquitectura) | 124 M | 1024 tokens (configuracion estandar) | GPT-2 monolingüe inglés | MIT modificada | Muy extendido, con variantes GGUF y cuantizaciones de terceros |
| Otras variantes monolingües de goldfish (`fin_latn`, `swe_latn`, etc.) | No verificado | No verificado | GPT-2 monolingüe | No verificado | Publicas en HuggingFace, sujetas a verificacion |

No se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no determinada: la model card incluye `licence: license` como marcador de posicion sin resolver. No hay autorizacion explicita de uso comercial; tratarlo como no apto para produccion hasta aclarar la licencia con el autor y con el titular del modelo base.
- Sesgos previsibles: al entrenarse sobre aproximadamente 100 MB de texto danés sin documentar su procedencia, el modelo puede reflejar sesgos de genero, nacionalidad, religion o ideologia presentes en ese corpus, sin que existan evaluaciones de sesgo publicadas.
- Riesgo elevado de alucinacion y de degradacion: con 124 M de parametros y un corpus de preentrenamiento muy reducido, es esperable que genere afirmaciones incorrectas con fluidez, repita fragmentos y pierda coherencia en generaciones de mas de unos cientos de tokens.
- Cobertura linguistica limitada al danes: no hay soporte verificado de castellano ni de otras lenguas, y la model card no declara lista de idiomas.
- Longitud de contexto sin confirmar: no se documenta en la model card ni en el repositorio, lo que impide planificar tareas que dependan de ventanas largas.
- Ausencia total de evaluacion: sin benchmarks, sin perplejidad publicada y sin *evals* de seguridad, no hay base objetiva para afirmar calidad alguna.
- Dataset de ajuste no documentado: se desconoce que datos se usaron en el SFT, lo que impide auditar procedencia, derechos y posibles filtraciones de datos personales.
- Cero traccion: 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin issues ni discusiones que aporten contexto adicional.
- Plantilla de chat no especificada: el ejemplo de la model card usa mensajes con rol, pero no se publica el `chat_template` ni se garantiza su correcta aplicacion fuera de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/dan-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/dan_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/p90h1di6
- Cita de TRL (von Werra et al., 2020): incluye el BibTeX en la model card del modelo; el repositorio de referencia es el enlace de TRL anterior.
