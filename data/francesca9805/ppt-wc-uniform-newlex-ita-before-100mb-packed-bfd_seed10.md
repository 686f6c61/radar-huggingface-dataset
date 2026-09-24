# francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed10

## Resumen

`ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo `goldfish-models/eng_latn_100mb`, un modelo monolingue de la familia Goldfish centrado en ingles. Lo publica el usuario `francesca9805` (los enlaces de seguimiento apuntan a la Universidad de Groningen) y esta entrenado con la libreria TRL de HuggingFace mediante SFT. Se trata de un experimento de investigacion sobre tokenizadores y modelos de lenguaje pequenos, no de un modelo listo para produccion.

Arquitectura y tamano: por las etiquetas del repositorio se trata de un transformer decoder-only de tipo GPT-2 con 86.508.288 parametros (~86,5 M). El nombre del modelo sugiere un experimento con un nuevo vocabulario/tokenizador para italiano ("newlex-ita"), aunque la model card no confirma ni la composicion del dataset ni el idioma final de entrenamiento. El repositorio ocupa 0,2 GB y los pesos estan en safetensors.

Relevancia: su interes es principalmente academico, como ejemplo reproducible de ajuste fino de un modelo Goldfish de 100 MB con TRL, y como material para estudiar el efecto de cambios de tokenizador en modelos muy pequenos. No hay descargas ni valoraciones, no se declara licencia efectiva y no se han publicado benchmarks, por lo que no es adecuado como base de un producto en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun etiquetas del repositorio) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base es ingles; el nombre sugiere italiano, sin confirmar) |
| Licencia | no disponible (la model card incluye un campo placeholder "license") |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Goldfish `eng_latn_100mb`. La familia Goldfish consiste en modelos de lenguaje monolingues de tipo GPT-2 entrenados sobre corpus de 100 MB por idioma, pensados para lenguas con pocos recursos; el sufijo del checkpoint base (`eng_latn_100mb`) indica ingles en escritura latina con ese presupuesto de datos. El ajuste se ha realizado con aprendizaje supervisado (SFT) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

El nombre del checkpoint (`newlex-ita`, `before`, `packed`, `seed10`) apunta a un experimento con un nuevo lexico/tokenizador aplicado a italiano, con datos empaquetados y una semilla concreta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; solo consta la ejecucion de SFT. Tampoco se documentan innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). No hay informacion suficiente para evaluar la calidad del proceso de entrenamiento mas alla de las versiones de framework declaradas.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de un GPT-2 de ~86 M de parametros.
- Ejecucion mediante `pipeline("text-generation")` de Transformers, segun el ejemplo de la model card.
- Adaptado para conversacion multi-turno en el ejemplo de uso (se le pasa una lista con el rol `user`), aunque el modelo base no fue entrenado como modelo de chat.
- Compatible con text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), por lo que se puede desplegar con TGI.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, thinking mode ni matematicas avanzadas.
- Idiomas: no confirmados; el checkpoint base es ingles y el nombre sugiere un componente italiano.

## Casos de uso

- Experimentacion academica con tokenizadores: sirve para comparar, en igualdad de condiciones, el efecto de un nuevo lexico sobre un modelo Goldfish de 100 MB, dado que el nombre del checkpoint indica un cambio de vocabulario.
- Reproduccion de pipelines de SFT: al estar entrenado con TRL y documentar versiones exactas de framework, es util como referencia reproducible para montar flujos de fine-tuning sobre modelos pequenos.
- Clasificacion y generacion de texto a muy baja latencia: con 86,5 M de parametros, se puede ejecutar en CPU o en GPU modesta para tareas de generacion corta en entornos con recursos limitados.
- Prototipado rapido de interfaces conversacionales: el ejemplo de la model card muestra su uso como generador de respuestas a partir de un mensaje de usuario, valido como maqueta antes de migrar a un modelo mayor.
- Investigacion sobre lenguas con pocos recursos: permite estudiar el comportamiento de un modelo entrenado con solo 100 MB de datos y su transferencia a otro idioma mediante un nuevo tokenizador.
- Docencia y formacion: por su tamano reducido y su coste minimo de inferencia, es adecuado para practicas sobre fine-tuning, tokenizacion y evaluacion de modelos de lenguaje.
- Validacion de infraestructura de despliegue: sirve para probar integraciones con TGI o el pipeline de Transformers antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,5 M de parametros, aproximadamente 0,35 GB en fp32 y 0,17 GB en fp16, mas el coste de la cache KV segun la longitud de contexto efectiva (no declarada).
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente; una NVIDIA T4, RTX 3060 o superior cubre el modelo con margen amplio. Tambien se puede ejecutar en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual e incluso en hardware integrado para lotes pequenos.
- Opciones de despliegue: pipeline de Transformers (documentado en la model card), text-generation-inference (etiqueta declarada) y, previa conversion a GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed10 | ~86,5 M | no disponible | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible (mismo orden, ~86 M) | no disponible | no disponible | HuggingFace, familia Goldfish publica |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Ampliamente disponible |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Ampliamente disponible |

Nota: los datos de GPT-2 small y DistilGPT-2 corresponden a modelos de referencia conocidos y se incluyen solo como orientacion de tamano; no se dispone de comparaciones de rendimiento con el modelo de esta ficha.

## Limitaciones y advertencias

- Sin licencia declarada de forma efectiva: la model card contiene un campo placeholder ("license"), por lo que no hay base juridica clara para uso comercial.
- Sin benchmarks ni evaluaciones publicadas: no se puede afirmar nada sobre su calidad, sesgos o robustez.
- Sesgos conocidos: no documentados; al derivar de un corpus de 100 MB de ingles, es previsible que herede sesgos del corpus original, aunque no se detallan.
- Riesgo de alucinacion: alto para un modelo de este tamano entrenado con pocos datos; no debe usarse como fuente de informacion factual sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el soporte multilingue no esta confirmado; el nombre sugiere italiano pero la model card no lo acredita.
- Repositorio sin traccion: 0 descargas y 0 "likes", sin revision por parte de la comunidad.
- Fechas de creacion y actualizacion poco habituales (2026), lo que refuerza la naturaleza experimental del artefacto.
- No apto para produccion sin una evaluacion propia exhaustiva de sesgos, idioma y calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento (Weights & Biases): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/5hu9xvcc
- Repositorio TRL: https://github.com/huggingface/trl
