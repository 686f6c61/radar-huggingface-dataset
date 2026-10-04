# francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407` es un ajuste fino de tipo SFT (supervised fine-tuning) publicado por el usuario `francesca9805` en HuggingFace. Se trata de un derivado del modelo base `francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407`, entrenado con la libreria TRL de HuggingFace. Por las etiquetas del repositorio, el pipeline declarado es `text-generation` y la arquitectura de referencia es GPT-2, con pesos en formato safetensors y una libreria de inferencia basada en `transformers`.

El modelo cuenta con 124.770.816 parametros totales (aproximadamente 125 millones), lo que lo situa en la categoria de modelos pequenos de tipo decoder-only. El repositorio ocupa 1,0 GB, coherente con pesos en varios formatos de precision mas ficheros auxiliares. No se ha publicado informacion sobre licencia, idiomas soportados ni longitud de contexto en la model card, y el modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un experimento de investigacion no difundido.

Su relevancia es limitada fuera del contexto de investigacion del que procede: el nombre del checkpoint apunta a un flujo de trabajo con tokenizador nuevo (`newlex`), empaquetado de secuencias (`packed`), un dataset de aproximadamente 100 MB y semillas fijas (`seed3407`). No hay resultados de benchmarks publicados ni documentacion adicional en la model card mas alla del procedimiento de entrenamiento y un ejemplo de uso con `pipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer, segun etiqueta del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si hay GGUF u otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers |
| Pipeline | text-generation |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407 |
| Tamano del repositorio | 1,0 GB |
| Metodo de entrenamiento | SFT (TRL) |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, pero la etiqueta `gpt2` del repositorio indica una familia de transformers decoder-only con atencion causal. Con 124,77 millones de parametros, el modelo encaja en el rango de GPT-2 base (124M), aunque se desconoce si conserva la configuracion exacta de capas, cabezas de atencion y dimension de embedding del modelo original, o si se ha modificado. El nombre del checkpoint sugiere un pipeline experimental con un tokenizador nuevo (`newlex`), secuencias empaquetadas (`packed`) y entrenamiento sobre un corpus de aproximadamente 100 MB.

El entrenamiento se ha realizado mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base es a su vez un ajuste del checkpoint `ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407`, de modo que este repositorio representa al menos una segunda etapa de ajuste (etiquetada como `finetune` respecto al base). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, batch size o numero de epocas. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation`, con un ejemplo de uso conversacional mediante `pipeline("text-generation", ...)`.
- Formato de chat: el ejemplo de la model card pasa una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que sugiere soporte de plantilla conversacional, aunque no se documenta la plantilla concreta.
- Ajuste por instrucciones: al haber sido entrenado con SFT, se espera cierta capacidad de seguir indicaciones, si bien no se aportan evaluaciones que lo confirmen.
- Razonamiento, codigo, matematicas, vision o audio: no disponible.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Experimentacion academica con tokenizadores: el nombre del checkpoint (`newlex`) apunta a un estudio sobre vocabularios nuevos; el modelo serviria como punto de comparacion frente al modelo base en tareas controladas de generacion.
- Pruebas de reproducibilidad en ajuste fino: al fijar la semilla (`seed3407`) y documentar versiones de framework, es util para replicar experimentos de SFT con TRL en entornos de investigacion.
- Generacion de texto en prototipos de bajo coste: con 125M de parametros puede ejecutarse en CPU o en GPUs de gama baja para demos internas de continuacion de texto.
- Evaluacion de tecnicas de empaquetado de secuencias: el sufijo `packed` indica entrenamiento con secuencias empaquetadas; el modelo puede emplearse para medir el efecto de esta tecnica en la calidad de generacion.
- Baseline en estudios de alineacion: sirve como referencia de un modelo pequeno ajustado con SFT antes de aplicar DPO u otras tecnicas.
- Docencia y formacion: por su tamano reducido, es adecuado para ilustrar el ciclo completo de entrenamiento, publicacion y despliegue de un modelo de lenguaje en un curso practico.
- Despliegue en entornos con recursos muy limitados: cabria en dispositivos con menos de 1 GB de memoria libre en cuantizacion de 8 o 4 bits, para tareas de generacion corta no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): en fp32, aproximadamente 500 MB; en fp16/bf16, aproximadamente 250 MB; en int8, aproximadamente 125 MB; en int4, aproximadamente 63 MB. A estas cifras hay que anadir el overhead de activaciones, cache KV y runtime (tipicamente varios cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Una NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema, aunque estan ampliamente sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable para generacion de texto corta, con latencias mayores que en GPU.
- Opciones de despliegue: `transformers` (pipeline), y presumiblemente Text Generation Inference (la etiqueta `text-generation-inference` aparece en el repositorio). No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la documentacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT experimental sobre base propio |
| GPT-2 (124M) | 124 M | 1024 tokens | MIT | Ampliamente disponible | Referencia historica de la misma escala |
| GPT-2 medium | 355 M | 1024 tokens | MIT | Ampliamente disponible | Version mayor de la misma familia |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Alternativa moderna de escala similar |

La comparativa se limita a parametros, contexto y licencia, ya que no existen resultados de benchmarks publicados para el modelo objeto de esta ficha que permitan contrastar calidad de generacion, razonamiento o codigo frente a las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni se documenta la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: elevado en terminos relativos, como es habitual en modelos de 125M de parametros entrenados sobre un corpus de aproximadamente 100 MB; la capacidad de conocimiento factual es muy limitada.
- Limitaciones de contexto: se desconoce la ventana de contexto soportada; no conviene asumir valores propios de GPT-2 sin verificacion.
- Limitaciones de idioma: no se declara ningun idioma soportado, por lo que no hay garantia de calidad en castellano ni en ninguna otra lengua.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Madurez del proyecto: 0 descargas y 0 likes, sin documentacion adicional, sin benchmarks y con una unica version publicada. No es un modelo apto para produccion sin una evaluacion propia previa.
- Trazabilidad: la model card no documenta hiperparametros, dataset ni criterios de evaluacion, lo que dificulta auditar el modelo.
- Los resultados de la busqueda web realizada no contienen informacion tecnica sobre este modelo: las entradas devueltas tratan sobre recuperacion de cuentas de Facebook y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed3407
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/lmd22r6x
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
