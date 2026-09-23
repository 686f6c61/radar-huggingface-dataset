# francesca9805/urd-arab-100mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/urd-arab-100mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del checkpoint `goldfish-models/urd_arab_100mb`, publicado por el usuario francesca9805. Se trata de un modelo de generacion de texto de tipo causal con arquitectura GPT-2 y 123.197.952 parametros (aproximadamente 123 M), lo que lo situa en la categoria de modelos pequenos de una sola GPU. El identificador sugiere que el modelo base fue entrenado sobre un corpus de urdu en escritura arabe de unos 100 MB, y que este ajuste se ha realizado sobre un subconjunto empaquetado de 10 MB.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) mediante SFT, con la semilla 3407 fijada en el nombre, y esta etiquetado como `generated_from_trainer`, `sft` y `trl`. No se especifica la composicion del dataset de ajuste ni el numero de tokens vistos, mas alla de que el dataset estaba "packed" (secuencias concatenadas para maximizar el aprovechamiento de la ventana de contexto) y de 10 MB de tamano.

Su relevancia es fundamentalmente experimental: forma parte de la linea de trabajo sobre tokenizadores y modelos multilingues de bajos recursos asociada al proyecto Goldfish, y sirve como punto de partida reproducible para estudiar el efecto del ajuste fino y del empaquetado de datos en lenguas con pocos recursos. No es un modelo orientado a produccion generalista: su tamano limita severamente la calidad de generacion y su ventana de contexto, licencia y cobertura idiomatica no estan declaradas de forma explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia GPT-2 (tag `gpt2`; heredada del modelo base) |
| Parametros totales | 123.197.952 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada; el modelo base de la familia GPT-2 suele operar con 1024 tokens, sin confirmar en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; al ser un modelo de 123 M se puede convertir a int8/4-bit con herramientas externas) |
| Idiomas soportados | no disponible (el identificador del modelo base, `urd_arab_100mb`, apunta a urdu en escritura arabe; no hay declaracion oficial) |
| Licencia | no disponible (la model card contiene un campo ambiguo: `licence: license`) |
| Formato de pesos | safetensors (`model.safetensors`), compatible con `transformers` |
| Tamano del repositorio | 0,2 GB |
| Libreria / versiones | transformers 4.56.2, TRL 0.23.0, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Modelo base | goldfish-models/urd_arab_100mb |
| Pipeline declarado | text-generation |
| Etiquetas de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only causal de la familia GPT-2, con normalizacion previa a la atencion (pre-LN), embeddings posicionales aprendidos y atencion multi-cabeza estandar. Con 123.197.952 parametros, corresponde a la configuracion "small" clasica de GPT-2, dimensionada en el proyecto Goldfish para acompanar corpus de aproximadamente 100 MB. No se ha introducido ninguna innovacion arquitectonica conocida en el ajuste: se trata de un fine-tuning sobre un checkpoint ya entrenado.

El entrenamiento se realizo con TRL 0.23.0 en modo SFT, sobre un dataset "packed" (empaquetado) de 10 MB, con la semilla 3407. El empaquetado de secuencias implica concatenar documentos hasta llenar la ventana de contexto, lo que reduce el relleno (padding) y aumenta la eficiencia de calculo por token, a costa de mezclar fronteras de documentos dentro de una misma secuencia. El nombre del experimento indica ademas el uso de un tokenizador propio ("new-tokenizers" en el proyecto de Weights & Biases del autor). No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; por las etiquetas, todo apunta a un unico stage de SFT.

## Capacidades

- Generacion de texto autoregresiva en el dominio e idioma del corpus de ajuste (previsiblemente urdu en escritura arabe, segun el identificador del modelo base).
- Continuacion de texto y respuesta a instrucciones simples, ya que el pipeline de ejemplo de la model card usa un formato de mensaje con rol `user`.
- Adaptacion de estilo o dominio sobre el modelo base mediante el ajuste SFT de 10 MB.
- Ejecucion en CPU y en GPUs de gama baja, por su tamano reducido.
- Compatible con `transformers.pipeline("text-generation")` y con despliegue mediante text-generation-inference (TGI) segun las etiquetas del repositorio.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.
- No hay evidencia de capacidades multilingues amplias; la cobertura real de idiomas no esta declarada.

## Casos de uso

- Investigacion sobre tokenizadores multilingues: comparar la eficiencia del tokenizador entrenado para urdu (proyecto "new-tokenizers") frente a tokenizadores genericos, midiendo tokens por palabra y compresion de secuencias en corpus de bajos recursos.
- Linea base reproducible en experimentos de bajos recursos: al fijar la semilla 3407 y usar un dataset empaquetado de 10 MB, sirve como referencia controlada para medir el efecto de variaciones en datos, empaquetado o hiperparametros.
- Generacion de texto offline en dispositivos limitados: con 123 M de parametros, el modelo se puede ejecutar en CPU o en una GPU integrada para prototipos de autocompletado o generacion de texto en urdu sin conexion.
- Aumento de datos (data augmentation): generar variaciones de frases en urdu para ampliar corpus de entrenamiento de modelos mayores, asumiendo que la calidad sera limitada y requerira filtrado posterior.
- Docencia y divulgacion: demostrar de forma economica el ciclo completo de ajuste fino con TRL, desde el modelo base hasta el despliegue, en un aula o taller sin acceso a GPUs de datacenter.
- Pruebas de infraestructura de despliegue: validar pipelines de TGI, endpoints compatibles con la API de inferencia de HuggingFace, batching y cuantificacion usando un modelo pequeno antes de escalar a modelos de mayor tamano.
- Analisis linguistico asistido: extraer estadisticas de fluidez y colocaciones en el dominio del corpus de ajuste, siempre con supervision humana y sin tratar la salida como dato fiable.
- Punto de partida para ajuste en dominio especifico en urdu (por ejemplo, noticias o textos administrativos), mediante un segundo fine-tuning sobre un corpus propio etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de la busqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en FP16/BF16 y 0,5 GB en FP32; alrededor de 0,13 GB en int8 y 0,07-0,09 GB en 4 bits (estimaciones a partir de los 123,2 M de parametros, sin incluir el coste del contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni GPU de datacenter. Sirven tarjetas integradas, GTX 1050 Ti o superiores, y cualquier RTX moderna.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas (RTX 3060, RTX 4090, GTX 1650, incluso iGPU con memoria compartida suficiente).
- Ejecucion en CPU: viable para inferencia interactiva con pocos usuarios concurrentes; el cuello de botella sera la latencia, no la memoria.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI, segun las etiquetas del repo), vLLM para batching en servidor, y llama.cpp u Ollama si se convierte previamente a GGUF (no se distribuye en ese formato).
- Latencia y throughput: no disponibles. No hay mediciones publicadas; con 123 M de parametros se espera un throughput alto en GPU moderna, pero cualquier cifra concreta seria especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/urd-arab-100mb-ppt-Dp-10mb-packed-bfd_seed3407 | 123,2 M | no disponible | SFT sobre goldfish-models/urd_arab_100mb, 10 MB empaquetados | no disponible | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| goldfish-models/urd_arab_100mb (modelo base) | 123,2 M | no disponible | Preentrenamiento sobre ~100 MB de urdu en escritura arabe | no disponible | HuggingFace |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | Preentrenamiento web en ingles | MIT (modelo original de OpenAI) | Ampliamente disponible, con versiones GGUF |

El modelo ajustado no aporta cambios en parametros respecto a su base, por lo que la comparacion relevante es de datos y de ajuste, no de tamano. No se dispone de resultados comparativos de rendimiento entre estos tres modelos en la informacion proporcionada, por lo que no es posible establecer cual rinde mejor en tareas concretas.

## Limitaciones y advertencias

- Sesgos: el modelo base se entrena sobre un corpus de bajos recursos de origen no documentado; puede reproducir sesgos presentes en esos textos, y el ajuste SFT de 10 MB no corrige ese problema.
- Alucinacion: con solo 123 M de parametros, la tasa de afirmaciones factualmente incorrectas y de incoherencias es alta; no debe usarse como fuente de informacion.
- Contexto: la longitud de contexto no esta declarada. Si se hereda la de GPT-2 (1024 tokens), no es adecuada para tareas de documento largo ni para dialogos extensos.
- Idiomas: no hay declaracion oficial de idiomas soportados; el identificador apunta a urdu en escritura arabe, por lo que el rendimiento en castellano o en otros idiomas sera previsiblemente pobre.
- Licencia: no disponible. La model card contiene un campo ambiguo (`licence: license`), por lo que no se puede confirmar el uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Trazabilidad: no se documenta la composicion del dataset de ajuste, el numero de tokens vistos ni los hiperparametros, lo que dificulta la reproducibilidad.
- Metadatos inconsistentes: las fechas del repositorio (creacion 2026-09-23) son posteriores a la fecha actual de consulta, lo que sugiere un error de metadatos y obliga a tratar el resto de campos con cautela.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Produccion: no apto como modelo generalista de atencion al cliente, generacion de codigo o razonamiento; su uso razonable es la investigacion, la experimentacion controlada y el prototipado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gm9bgtu1
- Repositorio de TRL: https://github.com/huggingface/trl
