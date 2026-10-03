# francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407` es un ajuste fino (fine-tuning) de tipo supervisado (SFT) sobre el checkpoint `francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed3407`, desarrollado por el usuario `francesca9805` y entrenado con la libreria TRL de Hugging Face. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros totales (aproximadamente 125 millones), un tamano propio de la categoria GPT-2 base. El nombre del modelo sugiere que forma parte de un estudio de ablacion centrado en tokenizadores y datos de entrenamiento en euskera ("eus"), con un corpus de unos 100 MB, aunque la model card no lo confirma explicitamente.

El modelo no cuenta con descargas ni interacciones en el momento de la consulta (0 descargas, 0 likes), lo que indica que se trata de un artefacto de investigacion reciente y poco difundido, no de un modelo orientado a produccion. La informacion publicada es minima: la model card se limita a indicar que es un fine-tuning con SFT, el framework empleado y un enlace a un experimento de Weights & Biases. No se documentan datos de entrenamiento, composicion del dataset, benchmarks ni idiomas soportados.

Por su tamano y su naturaleza experimental, resulta relevante como caso de estudio para quienes investigan tokenizacion y ajuste fino de modelos pequenos en lenguas de bajos recursos como el euskera, mas que como modelo de proposito general para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiqueta del repo) |
| Parametros totales | 124.770.816 (aproximadamente 125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere euskera, sin confirmar) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed3407 |
| Libreria | transformers |
| Tamano del repo | 1,5 GB |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y el recuento de 124,77 millones de parametros sitúan al modelo en la familia GPT-2 base: un transformer decoder-only con atencion causal completa. No se especifica en la informacion disponible la configuracion exacta de capas, cabezas de atencion ni dimension del modelo, por lo que estos datos deben considerarse no disponibles. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes hibridas.

El entrenamiento se realizo mediante SFT (Supervised Fine-Tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. El enlace a Weights & Biases apunta a un proyecto de la Universidad de Groningen denominado `new-tokenizers`, lo que refuerza la hipotesis de que el modelo forma parte de una investigacion sobre tokenizacion en euskera. El nombre del checkpoint (`before-ckpt500`, `packed`, `wc-uniform`, `newlex`) sugiere una comparativa entre distintas estrategias de tokenizacion y empaquetado de secuencias, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto autoregresiva, capacidades propias de un modelo GPT-2 base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el identificador del modelo apunta a euskera, pero no hay confirmacion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Al tratarse de un ajuste fino SFT de un modelo de 125 M de parametros, su competencia esperada se limita a tareas de generacion y continuacion de texto sencillas, sin garantias de razonamiento complejo.

## Casos de uso

- Investigacion sobre tokenizacion en euskera: el modelo puede emplearse como referencia en estudios comparativos de vocabularios y estrategias de empaquetado de secuencias, dado el contexto experimental del proyecto `new-tokenizers`.
- Experimentos de ablacion academica: resulta util para reproducir y contrastar variantes de entrenamiento con corpus reducidos (en torno a 100 MB) y analizar el efecto del tokenizador en el rendimiento.
- Generacion de texto controlada en entornos educativos: permite ilustrar el comportamiento de un GPT-2 ajustado sobre un dominio linguistico concreto en asignaturas de PLN.
- Prototipado rapido en CPU: con 125 M de parametros y pesos en safetensors de 1,5 GB, puede ejecutarse en portatiles sin GPU para pruebas basicas de generacion.
- Analisis de sesgos y calidad linguistica: util como sujeto de estudio para medir el efecto de un corpus pequeno en la coherencia y la fluidez del texto generado.
- Base para posteriores ajustes: puede servir como punto de partida para fine-tunings adicionales en tareas especificas de lengua vasca, siempre que se resuelva la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 250-300 MB solo para pesos, mas memoria para el contexto y el estado del modelo.
- VRAM estimada en fp32: aproximadamente 500 MB para pesos.
- VRAM estimada con cuantizacion de 8 bits: en torno a 125 MB; con 4 bits, en torno a 65 MB (estimaciones a partir del numero de parametros; no hay GGUF publicado).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes, aunque sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (el repo incluye la etiqueta `text-generation-inference`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles; con 125 M de parametros se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 base (referencia de arquitectura) | 124 M | 1024 tokens (segun la familia GPT-2) | MIT (segun OpenAI) | ampliamente disponible |
| Otros GPT-2 ajustados en lenguas minorizadas | variable (normalmente 124-355 M) | depende del ajuste | variable | Hugging Face |

Los datos de GPT-2 base se incluyen unicamente como referencia de arquitectura y no proceden de la informacion proporcionada sobre este modelo. No se dispone de alternativas verificadas de la misma categoria (ajustes en euskera de 125 M) en la informacion disponible, por lo que la comparativa se limita a la referencia arquitectonica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con un corpus limitado de 100 MB es probable que herede sesgos del dataset, pero no hay evidencia publicada.
- Riesgo de alucinacion: esperable en un modelo de 125 M de parametros; su baja capacidad de almacenamiento de conocimiento incrementa la probabilidad de generar contenido factualmente incorrecto.
- Limitaciones de contexto: no se documenta la longitud de contexto; si sigue la configuracion estandar de GPT-2, estaria limitado a 1024 tokens, pero es una suposicion sin confirmar.
- Limitaciones de idioma: no hay lista oficial de idiomas; el identificador sugiere euskera, pero se desconoce su competencia real en castellano o ingles.
- Restricciones de licencia: la model card indica "licence: license" sin detallar terminos, por lo que el uso comercial es juridicamente incierto; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Caveat de produccion: con 0 descargas y sin benchmarks, no existe validacion externa de su calidad; no es recomendable para sistemas en produccion sin una evaluacion previa exhaustiva.
- Al ser un artefacto de investigacion, puede sufrir cambios o eliminaciones sin aviso y carecer de soporte o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed3407
- Repositorio TRL: https://github.com/huggingface/trl
- Experimento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/d9l1ri0o
