# francesca9805/zho-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `zho-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10` es un ajuste fino (SFT) del checkpoint `francesca9805/ppt-wc-zipf-newlex-zho-after-100mb-packed-bfdiso_seed10`, publicado por el usuario de Hugging Face francesca9805. Se trata de un modelo de generacion de texto de tipo GPT-2 con 124.770.816 parametros totales, entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0. El nombre del repositorio sugiere un experimento centrado en tokenizacion y preprocesado de texto en chino (prefijo `zho`, codigo ISO 639-3 del chino), con un corpus de aproximadamente 100 MB y variantes de tokenizacion relacionadas con Zipf y "newlex".

El modelo resuelve, en principio, la tarea generica de generacion de texto condicionada por instrucciones, aunque su naturaleza experimental (nombre basado en hiperparametros y pipeline de datos, no en un producto) indica que su interes es mas academico que de produccion. La model card es una plantilla autogenerada por TRL, sin informacion sobre composicion del dataset, idiomas soportados, licencia ni evaluacion. Es relevante ahora unicamente como artefacto de investigacion reproducible dentro de una linea de experimentos de tokenizacion, no como alternativa a modelos de proposito general.

El modelo base pertenece a la misma familia de experimentos (`ppt-wc-zipf-newlex-...`), lo que apunta a una cadena de checkpoints intermedios sobre un GPT-2 pequeno. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni el proceso de alineacion mas alla de que se uso SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/GGUF, pero no publicada por el autor) |
| Idiomas soportados | no disponible (el prefijo `zho` sugiere chino, sin confirmacion en la model card) |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,77 millones de parametros, lo que corresponde aproximadamente al tamano de GPT-2 small (124M). El tag `gpt2` en Hugging Face confirma la familia arquitectonica. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto maxima, mas alla de lo que se puede inferir del tamano estandar de GPT-2 small (12 capas, 768 dimensiones, 12 cabezas, contexto de 1024 tokens), dato que no esta confirmado en la informacion proporcionada.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, partiendo del checkpoint `ppt-wc-zipf-newlex-zho-after-100mb-packed-bfdiso_seed10`. El nombre del modelo base y del propio modelo indican una cadena de experimentos: `ppt` (posiblemente pre-training o pipeline de preprocesado), `wc` (word count), `zipf` (distribucion de Zipf aplicada a tokenizacion o vocabulario), `newlex` (nuevo lexico o vocabulario), `zho` (chino), `100mb` (tamano del corpus), `packed` (secuencias empaquetadas), `bfdiso` (posiblemente bfloat16 + dataset iso) y `seed10`. No hay informacion sobre el numero de tokens de entrenamiento, la mezcla de datos, el uso de RLHF/DPO (solo SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`.

## Capacidades

- Generacion de texto autoregresiva condicionada por un mensaje de usuario en formato de chat (la model card muestra un ejemplo con `pipeline` y una lista de mensajes con rol `user`).
- Ajuste por instrucciones mediante SFT: el modelo ha sido entrenado para responder a preguntas en formato conversacional, aunque no se especifica la calidad ni el idioma de las respuestas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el prefijo `zho` sugiere entrenamiento orientado a chino, sin confirmacion.
- No se documentan capacidades especiales (modo thinking, vision, audio, etc.).
- No se documenta ventana de contexto extendida ni atencion eficiente.

## Casos de uso

- Experimentacion academica en tokenizacion: el modelo sirve como checkpoint reproducible para comparar el efecto de distintas variantes de tokenizacion (Zipf, "newlex") sobre la generacion de texto en chino, dado que su nombre codifica el pipeline de datos empleado.
- Reproduccion de experimentos de SFT con TRL: permite reproducir el run registrado en Weights & Biases y comparar hiperparametros con otros checkpoints de la misma familia (`ppt-wc-zipf-newlex-...`).
- Generacion de texto de bajo coste en prototipos: con 124M de parametros, cabe en cualquier GPU consumer y permite iterar rapidamente en demos de generacion condicionada por instrucciones, aunque sin garantias de calidad.
- Evaluacion de pipelines de datos en chino: util para medir como afecta el preprocesado (empaquetado, vocabulario, distribucion Zipf) a la perplejidad y coherencia en un corpus de ~100 MB.
- Baseline para comparativas de modelos pequenos: sirve como referencia de 124M parametros frente a otros GPT-2 small ajustados, en estudios de escalado o de tokenizacion.
- Pruebas de integracion con `text-generation-inference` y `endpoints_compatible`: el tag indica compatibilidad con TGI y endpoints de Hugging Face, util para validar despliegues de modelos pequenos en infraestructura estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (124,77M x 4 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 2 GB para contexto corto.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100); el modelo no requiere GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (tag `text-generation-inference`), endpoints compatibles de Hugging Face (tag `endpoints_compatible`); no se documenta soporte explicito de vLLM, llama.cpp u Ollama, aunque al ser GPT-2 es probable que sea convertible a GGUF.
- Latencia y throughput estimados: no disponibles; por tamano, se espera un throughput alto (cientos o miles de tokens por segundo en GPU moderna) y latencia de decodificacion de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/zho-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10` | 124,77M | no disponible | no disponible | Hugging Face (403 descargas) | GPT-2 small ajustado con SFT; experimental |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face, multiples mirrors | Modelo base de referencia; sin ajuste por instrucciones |
| DistilGPT-2 | 82M | 1024 tokens | Apache 2.0 | Hugging Face | Version destilada de GPT-2; sin ajuste por instrucciones |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 tokens | Apache 2.0 | Hugging Face | Modelo moderno de 135M con contexto mayor y entrenamiento mas reciente |

La comparativa es aproximada: no hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto y licencia. El modelo evaluado carece de licencia declarada, lo que lo hace menos adecuado para uso comercial que GPT-2 small (MIT) o SmolLM-135M (Apache 2.0).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste de GPT-2 sobre un corpus de ~100 MB en chino (segun el nombre), es probable que herede sesgos del corpus y del modelo base, sin filtros documentados.
- Riesgo de alucinacion: alto, propio de un modelo de 124M parametros sin alineacion documentada mas alla de SFT; no hay evaluacion de fidelidad.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; el prefijo `zho` sugiere foco en chino, pero no se confirma el soporte de otros idiomas.
- Restricciones de licencia para uso comercial: la licencia no esta disponible (`licence: license`), por lo que no se puede asumir uso comercial permitido; se debe contactar con el autor.
- Caveats para produccion: la model card es una plantilla autogenerada por TRL sin informacion sobre datos, evaluacion ni limitaciones; el nombre del modelo codifica hiperparametros experimentales, lo que sugiere un artefacto de investigacion, no un modelo listo para produccion. El repo ocupa 9,0 GB, lo que incluye probablemente checkpoints intermedios u optimizador, no solo los pesos finales.
- El modelo base es a su vez un experimento de la misma familia, por lo que la cadena de entrenamiento no esta documentada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/zho-100mb-after-wc-zipf-newlex-after-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-zho-after-100mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/v227mdul
- Repositorio de TRL: https://github.com/huggingface/trl
