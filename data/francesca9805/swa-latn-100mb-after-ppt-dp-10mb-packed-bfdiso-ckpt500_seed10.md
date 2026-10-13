# francesca9805/swa-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10

## Resumen
El modelo `swa-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10` es un ajuste fino (SFT) del modelo base `francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10`, publicado por el usuario de HuggingFace francesca9805 (asociado, segun el panel de Weights & Biases enlazado en la model card, a la Universidad de Groningen, con nombre Francesca Padovani). Se trata de un modelo pequeno de generacion de texto con 124.770.816 parametros (aproximadamente 125M), construido sobre una arquitectura transformer decoder-only del tipo GPT-2, segun la etiqueta `gpt2` de la ficha y el tamano de parametros, que coincide con el de GPT-2 small.

El modelo resuelve tareas de generacion de texto condicionada, incluyendo formato conversacional de un turno (la quick start usa una lista de mensajes con rol `user`). Su relevancia es acotada: se enmarca en una familia de experimentos de investigacion sobre modelos de lenguaje pequenos, con numerosas variantes publicadas por el mismo autor (distintas semillas, tamanos de dataset de 10MB, 100MB, y configuraciones de empaquetado `packed` o `struct`). No es un modelo orientado a produccion generalista, sino un artefacto de investigacion reproducible.

La ficha oficial no documenta la longitud de contexto, los idiomas soportados ni la licencia. La nomenclatura del identificador (`swa-latn`) sugiere un enfoque sobre swahili en escritura latina, pero este dato no esta confirmado en la model card y debe tratarse como una lectura del nombre, no como una especificacion oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2`) |
| Parametros totales | 124.770.816 (aproximadamente 125M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (el identificador sugiere swahili en escritura latina, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10 |
| Tamano del repositorio | 3.0 GB |
| Descargas | 159 |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de tipo GPT-2 con aproximadamente 125M de parametros, la misma escala que GPT-2 small. El modelo se ha entrenado mediante SFT (supervised fine-tuning) usando la libreria TRL en su version 0.23.0, sobre el modelo base indicado. Las versiones de framework declaradas en la model card son Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica si se aplicaron tecnicas adicionales como RLHF o DPO; la unica etapa documentada es el ajuste supervisado.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la estrategia de empaquetado (`packed`) ni el significado exacto de los sufijos del identificador (`Dp-10mb`, `bfdiso`, `ckpt500`). Tampoco se detalla si el tokenizador se reentreno o si se reutiliza el de GPT-2; el nombre de la ejecucion de Weights & Biases ("new-tokenizers") sugiere que hubo trabajo relacionado con tokenizacion, pero no se aportan detalles tecnicos.

## Capacidades
- Generacion de texto autoregresiva en formato de prompt conversacional de un turno (rol `user`), tal como muestra la quick start de la model card.
- Finalizacion de texto y continuacion de contexto, comportamiento estandar de un modelo GPT-2 ajustado con SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode).
- No se documenta capacidad de vision ni audio.
- Las capacidades multilingues no estan declaradas oficialmente; el identificador sugiere foco en swahili en escritura latina, sin confirmar.
- No se documentan capacidades especiales de codigo o matematicas.

## Casos de uso
- Experimentacion academica con modelos de lenguaje pequenos: sirve como punto de partida reproducible para estudiar el efecto del ajuste supervisado sobre un modelo GPT-2 de 125M en un dominio o idioma concreto.
- Fine-tuning posterior sobre dominios especificos: al ser un modelo pequeno y con pesos en safetensors, es adecuado como base para ajustes adicionales con recursos limitados.
- Generacion de texto corto en entornos con restricciones de hardware: puede ejecutarse en CPU o en GPU de gama baja, lo que permite prototipado local sin infraestructura dedicada.
- Investigacion linguistica sobre swahili en escritura latina (si se confirma el enfoque del modelo): util para analisis de generacion en una lengua de bajos recursos, comparando variantes de la misma familia.
- Generacion de datos sinteticos para tareas auxiliares: puede emplearse para producir borradores de texto que luego se filtren o revisen, dado su bajo coste de inferencia.
- Despliegue en edge o dispositivos embebidos: con 125M de parametros, es viable en placas tipo Raspberry Pi o en moviles mediante cuantizacion, para demos o asistentes muy acotados.
- Comparacion de semillas y configuraciones de entrenamiento: la familia incluye variantes con distintas semillas y tamanos de dataset, lo que permite estudiar varianza de entrenamiento en tareas de investigacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Las referencias externas encontradas (SAVRN, LLM Explorer) apuntan a variantes de la misma familia con 124.8M de parametros, sin aportar cifras de rendimiento comparables.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0.25 GB en bf16/fp16, en torno a 0.13 GB en int8 y unos 0.07 GB en int4. Una referencia externa (SAVRN) indica aproximadamente 0.3 GB en 16 bits para un modelo de la misma familia y tamano.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta muy por debajo de los limites de memoria de estas tarjetas.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- CPU: la inferencia es viable en CPU; al ser un modelo de 125M, los tiempos por token son bajos, aunque no se publican cifras concretas.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (etiqueta `text-generation-inference`), vLLM y TGI. Para llama.cpp u Ollama seria necesario convertir los pesos safetensors a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput: no disponibles de forma oficial. Por tamano, se espera una latencia por token muy baja y un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| swa-latn-100mb-after-ppt-...-ckpt500_seed10 | 124,77M | no disponible | no disponible | safetensors en HuggingFace |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | safetensors y multiples formatos |
| DistilGPT-2 | 82M | 1024 tokens | MIT | safetensors y GGUF |
| swa-latn-100mb-after-ppt-...-ckpt500_seed3407 (variante) | 124,8M | no disponible | no disponible | safetensors, con soporte en proveedores externos |

La comparacion se limita a parametros, contexto, licencia y disponibilidad, ya que no hay benchmarks publicados para el modelo analizado ni cifras de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias
- Licencia no declarada: la model card incluye un campo `licence: license` sin valor, por lo que no se puede confirmar el uso comercial. Debe tratarse como uso no autorizado hasta verificar con el autor.
- Sin datos de idiomas: no se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- Riesgo de alucinacion elevado: con 125M de parametros y ajuste SFT, la fiabilidad factual es limitada y la coherencia decae en contextos largos.
- Longitud de contexto desconocida: si hereda la ventana de GPT-2, seria de 1024 tokens, insuficiente para conversaciones o documentos extensos. Este dato no esta confirmado.
- Modelo de investigacion: los sufijos del identificador (`Dp-10mb`, `bfdiso`, `ckpt500`) indican checkpoints intermedios de experimentos, no un modelo optimizado para produccion.
- Sin evaluaciones publicadas: no hay benchmarks que respalden su calidad, por lo que no se recomienda para tareas criticas sin validacion previa.
- Sesgos potenciales: no documentados, pero cualquier modelo entrenado sobre datos web sin filtrado explicito puede reproducir sesgos de genero, etnia o religion.
- Repositorio de 3.0 GB para 125M de parametros: el peso sugiere que contiene multiples checkpoints o estados del optimizador, lo que puede complicar el uso directo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/klnxe931
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con distinto empaquetado: https://huggingface.co/francesca9805/swa-latn-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed10
- Variante de 10MB con semilla 3407: https://huggingface.co/francesca9805/swa-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Variante de 100MB con semilla 3407 (referencia externa): https://savrn.com/models/swa-latn-100mb-after-ppt-dp-100mb-packed-bfdiso-ckpt500-seed3407
- Variante con semilla 455 en FriendliAI: https://friendli.ai/models/francesca9805/swa-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455
- Ficha en LLM Explorer de la variante de 100MB: https://llm-explorer.com/model/francesca9805%2Fswa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407,68r925S40EufulnykdRdwI
