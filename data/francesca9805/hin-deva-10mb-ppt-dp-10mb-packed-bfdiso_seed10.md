# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/hin_deva_10mb`, realizado por el usuario francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros (aproximadamente 39 millones), lo que lo situa en la categoria de modelos muy pequenos, orientados a experimentacion e investigacion mas que a produccion.

El entrenamiento se ha llevado a cabo mediante SFT (supervised fine-tuning) utilizando la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2 y PyTorch 2.5.1. Segun el nombre del repositorio, el ajuste parece vinculado a experimentos con tokenizadores y a un corpus empaquetado (packed) de 10 MB, probablemente relacionado con el idioma hindi en escritura devanagari (hin_deva), aunque la model card no lo confirma explicitamente.

Su relevancia es fundamentalmente academica: forma parte de una familia de experimentos del grupo goldfish-models orientados a estudiar el entrenamiento de modelos en idiomas con pocos recursos y corpus de tamano reducido. No esta pensado para uso comercial ni para tareas de alta exigencia, y no cuenta con datos publicados de benchmarks, licencia declarada ni idiomas confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre de la familia, hin_deva, sugiere hindi en devanagari, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, segun la etiqueta `gpt2` del repositorio. Con 39 millones de parametros, se encuentra muy por debajo de los modelos GPT-2 convencionales (124M en su version small) y esta disenado para caber holgadamente en cualquier hardware, incluso en CPU. El modelo base `goldfish-models/hin_deva_10mb` pertenece a la familia Goldfish, conocida por entrenar modelos especificos de idioma con corpus de aproximadamente 10 MB por lengua, lo que condiciona fuertemente su capacidad y cobertura.

El ajuste se ha realizado mediante SFT con TRL 0.23.0 y aparece vinculado a un run de Weights & Biases del proyecto "new-tokenizers" de la University of Groningen. El nombre del modelo indica el uso de un dataset empaquetado (packed) de 10 MB y una configuracion con `bfd`/`iso` y una semilla (seed10), datos que apuntan a un pipeline experimental de investigacion sobre tokenizacion y preprocesado. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El framework declarado incluye TRL, Transformers, PyTorch, Datasets y Tokenizers, sin innovaciones tecnicas destacadas (no se mencionan decodificacion especulativa, atencion lineal ni mecanicas hibridas).

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste por instrucciones mediante SFT (etiqueta `sft`), orientado a seguir indicaciones sencillas.
- Compatibilidad declarada con text-generation-inference (tag `text-generation-inference`) y con endpoints (tag `endpoints_compatible`).
- Integracion directa con la libreria Transformers mediante el pipeline `text-generation`.
- Capacidades multilingues: no confirmadas en la informacion; el nombre sugiere foco en hindi (devanagari).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (poco probable dado el tamano).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion academica sobre modelos de idiomas con pocos recursos: el modelo sirve como punto de partida para estudiar el efecto del ajuste fino SFT sobre un modelo base de 39M de parametros en hindi.
- Experimentos de tokenizacion: dado el contexto del proyecto "new-tokenizers", puede emplearse para comparar el impacto de distintas estrategias de tokenizado y de empaquetado (packed) de corpus en la calidad de generacion.
- Generacion de texto de bajo coste en local: al ocupar menos de 200 MB en fp32, puede ejecutarse en CPU o en cualquier GPU consumer para pruebas rapidas de generacion.
- Prototipado de pipelines de entrenamiento con TRL: sirve como ejemplo minimo y reproducible de SFT con TRL 0.23.0 y Transformers 4.56.2.
- Pruebas de integracion con text-generation-inference: util para validar despliegues de endpoints compatibles con modelos pequenos.
- Educacion y divulgacion: adecuado para demostrar el ciclo completo de fine-tuning de un modelo GPT-2 en un entorno con recursos limitados.
- Validacion de pipelines de CI en MLOps: su tamano minimo (repo de 0,1 GB) permite incluirlo en tests automatizados de carga y generacion sin coste relevante de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 39.087.104 parametros): aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y 20 MB en int4. Cabe destacar que estos valores solo cubren los pesos; la memoria real dependera del tamano de lote y de la longitud de contexto.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente; una NVIDIA RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutarlo sin problema. Las A100 o H100 son sobredimensionadas para este tamano, aunque compatibles.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en GPU integradas.
- Tambien puede ejecutarse en CPU, dado su tamano reducido.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (segun tag) y endpoints compatibles. El uso con vLLM, llama.cpp u Ollama requeriria conversion previa de pesos a los formatos correspondientes, sin que se confirme dicha conversion en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed10 | 39.087.104 | no disponible | no disponible | no disponible | Hugging Face |
| goldfish-models/hin_deva_10mb (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small | 124.000.000 | 1.024 tokens (segun arquitectura estandar) | no disponible en esta ficha | MIT (para la version original de OpenAI) | Ampliamente disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un ajuste sobre corpus de 10 MB, es esperable una fuerte limitacion de cobertura tematica y posible reproduccion de sesgos del corpus, aunque no se documentan.
- Riesgo de alucinacion: elevado en terminos relativos, por el tamano reducido del modelo (39M de parametros) y de los datos de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada y los idiomas soportados no se confirman; el foco probable es el hindi, con capacidad muy limitada en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede asumir permiso para uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Caveats para produccion: modelo experimental sin benchmarks publicados, sin garantia de calidad, sin documentacion de dataset y sin soporte declarado. No es adecuado para despliegues comerciales ni para tareas que requieran fiabilidad.
- La fecha de creacion registrada (2026-09-29) es posterior a la fecha de referencia habitual y podria deberse a un error de metadatos; conviene verificarla.

## Enlaces

- Hugging Face: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4ujhz3ta
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada (100MB packed bfd seed10): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante relacionada (10MB packed bfd seed455): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455/tree/main
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-10mb-packed-bfd_seed10
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed10
