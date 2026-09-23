# francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eus_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805 (vinculado al proyecto de investigacion de F. Padovani, Universidad de Groningen, segun la URL de Weights & Biases). El sufijo "eus" corresponde al codigo ISO 639-3 del euskera (basque), por lo que se trata de un modelo orientado a la generacion de texto en lengua vasca. Se ha entrenado mediante SFT (Supervised Fine-Tuning) con la libreria TRL de HuggingFace.

Con 124.770.816 parametros (aproximadamente 124,8 millones), se situa en la categoria de los modelos ligeros tipo GPT-2 small. La arquitectura declarada en las etiquetas es `gpt2`, y el modelo hereda la estructura transformer decoder-only del modelo base. El identificador del repositorio incluye referencias a experimentos de tokenizacion y empaquetado de datos ("ppt", "Dp-100mb-packed", "bfd_seed455"), lo que sugiere que forma parte de una bateria de experimentos comparativos sobre estrategias de preprocesado y tokenizacion para lenguas de bajos recursos.

La relevancia de este modelo es principalmente academica y experimental: sirve como punto de referencia para estudiar el efecto de distintas tecnicas de tokenizacion y empaquetado de corpus en lenguas minorizadas como el euskera. No se trata de un modelo de proposito general ni de un asistente conversacional afinado con RLHF/DPO. La model card es auto-generada y no documenta datos de contexto, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetada como `gpt2`) |
| Parametros totales | 124.770.816 (aprox. 124,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Euskera (pelabra clave "eus" en el identificador); no confirmado en la model card |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `goldfish-models/eus_latn_100mb`, un modelo de la familia Goldfish orientada a lenguas de bajos recursos. La etiqueta `gpt2` indica una arquitectura transformer decoder-only con atencion causal, equivalente a GPT-2 small en numero de parametros. El entrenamiento se realizo mediante SFT utilizando TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

Los detalles del dataset de ajuste fino no estan documentados en la model card. El identificador del modelo hace referencia a "100mb" (probablemente el tamano del corpus), "ppt" y "Dp-100mb-packed" (posiblemente estrategias de distribucion / empaquetado de datos de entrenamiento), y "bfd_seed455" (una semilla de experimento). No se especifica si hubo RLHF, DPO ni ninguna tecnica de alineacion posterior; el pipeline declarado es unicamente SFT. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva en euskera (idioma deducido del identificador, no confirmado en la model card).
- Continuacion de prompts y generacion condicionada mediante el pipeline `text-generation` de Transformers.
- Soporte de entrada conversacional mediante el formato de mensajes `[{"role": "user", "content": ...}]` en el ejemplo de la model card.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; el unico indicio es el codigo de idioma "eus" en el nombre.

## Casos de uso

- Investigacion sobre tokenizacion en lenguas de bajos recursos: el modelo forma parte de una serie de experimentos con identificadores que sugieren variantes de tokenizacion y empaquetado ("ppt", "bfd", distintas semillas); se puede usar como punto de comparacion en estudios academicos sobre euskera.
- Generacion de texto sintetico en euskera para aumentar corpus: al ser un modelo entrenado sobre 100 MB de datos en euskera, puede emplearse para generar texto auxiliar en tareas de aumento de datos, siempre con revision humana.
- Experimentos de ajuste fino posteriores: sirve como checkpoint de partida para fine-tunes especificos en euskera sin partir del modelo base original.
- Evaluacion de tecnicas de SFT con TRL: util como caso de prueba reproducible para comparar recetas de entrenamiento supervisado en modelos pequenos.
- Prototipado de completado de texto en euskera: por su tamano reducido (0,3 GB de repositorio), permite iterar rapidamente en local durante fases iniciales de desarrollo.
- Reproducibilidad academica: al estar asociado a un run concreto de Weights & Biases (new-tokenizers/ioamaevr), puede utilizarse para replicar resultados de un experimento documentado.
- Despliegue ligero en entornos con recursos limitados: al tener 124,8 M de parametros, puede ejecutarse en CPU o en GPUs de gama baja para demostraciones y pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16, 0,13 GB en int8 y 0,07 GB en int4 (calculado a partir de 124,8 M de parametros).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una NVIDIA GTX 1050 Ti, RTX 2060 o superior funciona sin problemas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU y CPU.
- Opciones de despliegue: Transformers (pipeline `text-generation`), Text Generation Inference (TGI, segun el tag `text-generation-inference`), llama.cpp (previa conversion a GGUF, no confirmada), Ollama (previa conversion GGUF). La model card solo documenta el uso via `transformers.pipeline`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455 | 124,8 M | no disponible | no disponible | HuggingFace |
| goldfish-models/eus_latn_100mb (modelo base) | no disponible (familia Goldfish, tamano similar) | no disponible | no disponible | HuggingFace |
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 (variante con 10 MB) | no disponible | no disponible | no disponible | HuggingFace |

Las alternativas mas cercanas son otras variantes de la misma serie experimental (con distinto tamano de corpus, como "10mb", o distinta semilla), asi como el modelo base de Goldfish. No se dispone de datos de rendimiento comparativos entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus en euskera de 100 MB, probablemente hereda los sesgos presentes en dicha fuente, pero no se puede confirmar.
- Riesgo de alucinacion: alto en modelos pequenos de 124,8 M de parametros entrenados con SFT breve; la model card no reporta evaluacion de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el unico idioma indicado es el euskera. No se garantiza un comportamiento correcto en castellano u otras lenguas.
- Restricciones de licencia: la licencia figura como `licence: license` sin especificar en la model card, por lo que se desconoce si el uso comercial esta permitido. Conviene consultar al autor antes de cualquier uso en produccion.
- Model card auto-generada: el README se ha producido con la plantilla de TRL y carece de informacion sobre datos, evaluacion y limitaciones; no debe tratarse como un modelo validado para produccion.
- Sin alineacion conversacional: el entrenamiento es unicamente SFT, sin RLHF ni DPO, por lo que las respuestas pueden ser incoherentes o repetitivas en dialogos multi-turno.
- Modelo experimental: el nombre del repositorio sugiere que forma parte de una comparativa de tecnicas de tokenizacion, no de un lanzamiento orientado a usuarios finales.
- Compatibilidad limitada: aunque incluye el tag `endpoints_compatible`, no se ha verificado su integracion en proveedores de inferencia de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ioamaevr
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con corpus de 10 MB: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante en neerlandes (nld): https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en LLM Explorer de una variante relacionada: https://llm-explorer.com/model/fpadovani%2Feus-latn-100mb-ppt-shuff-dyck-100mb_seed10,JiDSGZTRP21CPPeCAD7PX
