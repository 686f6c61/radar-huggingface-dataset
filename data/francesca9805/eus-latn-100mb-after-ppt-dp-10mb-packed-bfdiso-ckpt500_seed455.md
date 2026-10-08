# francesca9805/eus-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455

## Resumen

El modelo `eus-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455` es un ajuste fino supervisado (SFT) desarrollado por el usuario de HuggingFace francesca9805, construido sobre el checkpoint `francesca9805/eus-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455`. Se trata de un modelo causal de generacion de texto con arquitectura GPT-2 (segun el tag `gpt2` de la model card) y 124.770.816 parametros reales en safetensors, lo que lo situa en la misma escala que GPT-2 small. El entrenamiento se realizo con la libreria TRL en su version 0.23.0.

La nomenclatura del identificador apunta a un experimento de tokenizacion y entrenamiento sobre euskera (prefijo `eus-latn`, es decir, euskera en escritura latina) con un corpus de aproximadamente 100 MB, seguido de una fase de ajuste fino SFT sobre datos empaquetados. El sufijo `ckpt500` indica que el modelo publicado corresponde al checkpoint 500 del entrenamiento y `seed455` fija la semilla aleatoria empleada. No obstante, ni la licencia ni los idiomas oficialmente soportados estan declarados en la informacion disponible.

El modelo resulta relevante como caso de estudio de pipelines de ajuste fino de bajo coste sobre modelos tipo GPT-2 para lenguas de recursos limitados, asi como por su integracion directa con `transformers`, `text-generation-inference` y endpoints compatibles. Al no contar con descargas ni valoraciones, debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal), segun tag de la model card |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele emplear 1024 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el nombre sugiere euskera, sin confirmacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/eus-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 |
| Tamano del repositorio | 6.0 GB |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de tipo GPT-2, con 124.770.816 parametros, lo que coincide con la configuracion clasica de GPT-2 small (12 capas, 12 cabezas de atencion y dimension de embedding de 768, aunque estos detalles concretos no se confirman en la informacion disponible). Se trata de un modelo denso, no de una arquitectura MoE ni hibrida, y no se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El entrenamiento se realizo mediante ajuste fino supervisado (SFT) con TRL, partiendo del checkpoint base `eus-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455`. Segun el identificador, el pipeline incluye una fase de tokenizacion o preprocesado sobre un corpus de unos 100 MB en euskera (`eus-latn-100mb`), empaquetado de secuencias (`packed`) y una etapa intermedia (`after-ppt`, presumiblemente "post pre-training") antes del SFT final. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las versiones de framework empleadas fueron TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto causal en formato de chat, con soporte de plantillas basadas en roles (`user`/`assistant`) tal como muestra el ejemplo de la model card.
- Ajuste fino supervisado orientado a seguir instrucciones y responder a preguntas en el idioma del corpus de entrenamiento (presumiblemente euskera).
- Integracion nativa con la libreria `transformers` mediante la clase `pipeline` para `text-generation`.
- Compatibilidad declarada con `text-generation-inference` y con endpoints alojados (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible; el identificador apunta a una sola lengua.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Prototipado de generacion de texto en euskera: el modelo puede emplearse para generar continuaciones y respuestas basicas en esta lengua, aprovechando su ajuste sobre un corpus especifico, dentro de entornos de investigacion.
- Experimentacion academica en PLN de bajos recursos: sirve como checkpoint de referencia para comparar tecnicas de tokenizacion y empaquetado (`packed`) en lenguas con pocos datos, replicando el pipeline documentado en Weights & Biases.
- Evaluacion de pipelines SFT con TRL: al incluir versiones de framework concretas, es util como punto de partida reproducible para estudiar el efecto del checkpoint 500 y la semilla 455 sobre el resultado final.
- Generacion de texto asistida en demos locales: con 124 M de parametros cabe en cualquier GPU de consumo, lo que permite desplegar demos interactivas de bajo coste sin infraestructura dedicada.
- Fine-tuning posterior sobre dominios especificos: al ser un modelo pequeno, se puede reajustar rapidamente sobre corpus especializados (legal, educativo, administrativo) en euskera para tareas de redaccion asistida.
- Pruebas de integracion con endpoints compatibles: su tag `endpoints_compatible` permite validar flujos de despliegue gestionado antes de migrar a modelos mayores en la misma infraestructura.
- Investigacion sobre sesgos y calidad linguistica: util para medir como un entrenamiento con ~100 MB de datos afecta a la coherencia, la repeticion y la fidelidad gramatical en euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni evaluaciones especificas de euskera (por ejemplo, EusCrawl o evaluaciones de perplejidad). Tampoco se proporcionan cifras de perdida de validacion ni curvas de entrenamiento en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 500 MB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en FP16/BF16: en torno a 250 MB para los pesos.
- VRAM estimada en cuantizacion INT8: aproximadamente 125 MB; en INT4, unos 65 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada o incluso en CPU para inferencia de baja latencia con lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (declarado en los tags), endpoints alojados compatibles. No se declaran variantes GGUF, por lo que `llama.cpp` y Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| eus-latn-100mb-after-ppt... (este modelo) | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | no |
| GPT-2 small | 124 M | 1024 tokens | MIT (uso general abierto) | Ampliamente disponible | Si (varios) |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente disponible | Si (varios) |
| GPT-Neo 125M | 125 M | 2048 tokens | MIT | Ampliamente disponible | Si (varios) |

La comparacion de rendimiento con estas alternativas no es posible: no se han publicado benchmarks del modelo analizado. La diferencia principal respecto a GPT-2 small y distilGPT-2 radica en el dominio linguistico (euskera) y en el pipeline de ajuste fino con TRL, no en la escala de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con un corpus limitado (~100 MB), es probable que herede sesgos y carencias del dataset, pero no se especifican.
- Riesgo de alucinacion: alto en modelos pequenos de este tamano; no existe evaluacion publicada que lo cuantifique.
- Limitaciones de contexto: la longitud de contexto no esta declarada; si sigue la configuracion estandar de GPT-2, seria de 1024 tokens, insuficiente para conversaciones o documentos largos.
- Limitaciones de idioma: el identificador sugiere un foco exclusivo en euskera; el rendimiento en castellano o ingles no esta documentado y probablemente sea pobre.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido. No debe desplegarse en produccion comercial sin aclarar este punto con el autor.
- Modelo de investigacion: con 0 descargas y 0 likes, no hay evidencia de uso ni validacion por parte de la comunidad.
- Sin benchmarks: no hay forma de comparar su calidad objetivamente frente a alternativas.
- Versionado del framework: fue entrenado con PyTorch 2.11.0 y Transformers 4.56.2; pueden aparecer incompatibilidades con versiones futuras.
- El modelo no documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos automatizados que dependan de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/comy1f1f
- Paper de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
