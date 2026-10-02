# francesca9805/hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455

## Resumen

El modelo `hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455` es un ajuste fino (SFT) de la familia `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed455`, publicado por el usuario de HuggingFace francesca9805. Por su nombre y sus etiquetas, se trata de un modelo de generacion de texto orientado al hindi en escritura devanagari ("hin-deva"), derivado de la arquitectura GPT-2 y entrenado con la libreria TRL. Su tamano es de 124.770.816 parametros (aproximadamente 124,8 millones), lo que lo situa en la gama de los modelos pequenos tipo GPT-2 base, no en la de los LLM contemporaneos.

El problema que aborda no es el de un asistente generalista, sino el de la investigacion sobre entrenamiento con pocos datos: la nomenclatura del repositorio (100mb / 10mb, "packed", "bfdiso", "ckpt500", "seed455") sugiere experimentos de escalado de corpus y de tokenizacion sobre hindi, con puntos de control intermedios (checkpoint 500) y semillas fijas para reproducibilidad. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia ahora es acotada: sirve como referencia reproducible para estudiar el efecto del volumen de datos de entrenamiento y de la semilla en modelos pequenos multilingues, y como punto de partida para ajustes posteriores en hindi. No se dispone de datos publicados sobre longitud de contexto, licencia o idiomas exactos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (~124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (al ser safetensors, admite cuantizacion a FP16, INT8 e INT4 mediante herramientas externas) |
| Idiomas soportados | no disponible en los metadatos; el nombre del modelo (`hin-deva`) apunta a hindi en escritura devanagari |
| Licencia | no disponible (la model card incluye `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 |
| Libreria | transformers |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal, MoE ni estado recurrente. Con 124,8 millones de parametros, el modelo se corresponde con la configuracion de GPT-2 base (12 capas, 12 cabezas, `d_model` de 768), aunque la model card no detalla la configuracion exacta de capas y cabezas, por lo que ese desglose debe considerarse no confirmado. La longitud de contexto tampoco se especifica.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte de un ajuste previo del mismo autor y forma parte de una serie de experimentos con corpus empaquetados de 100 MB y 10 MB, semillas fijas y checkpoints intermedios (el sufijo `ckpt500` indica el punto de control numero 500). La model card enlaza una ejecucion de Weights & Biases bajo el proyecto `new-tokenizers`, lo que sugiere que el trabajo gira en torno al diseno de tokenizadores para devanagari. No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni composicion detallada del dataset.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por un mensaje de usuario en formato de chat segun el ejemplo de la model card.
- Generacion en hindi (escritura devanagari) como capacidad previsible por el nombre del modelo, aunque no confirmada explicitamente por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento orientado a agentes.
- Capacidades multilingues: no disponibles en los metadatos.
- Capacidad especial (modo "thinking", vision, audio): no disponible.
- Uso previsto como base para experimentacion con tokenizadores y corpus en hindi, y para ajustes posteriores.

## Casos de uso

- Experimentacion academica sobre tokenizacion de devanagari: el modelo forma parte de la serie `new-tokenizers` del autor, por lo que puede usarse para replicar comparativas entre tokenizadores evaluando la perplejidad sobre un corpus hindi fijo.
- Estudios de escalado de datos en modelos pequenos: la nomenclatura 100mb/10mb permite comparar el efecto del volumen de corpus de entrenamiento manteniendo constante la arquitectura y la semilla.
- Reproducibilidad de experimentos: al fijar semillas (`seed455`, `seed3407`, `seed10`) y checkpoints, sirve para verificar la varianza entre ejecuciones de un mismo pipeline de SFT.
- Generacion de texto en hindi en entornos sin GPU: con 124,8 M de parametros cabe en CPU y en cualquier GPU de consumo, lo que permite prototipos locales de generacion de texto en devanagari.
- Base para ajuste fino especifico de dominio: se puede continuar el entrenamiento (por ejemplo, con SFT adicional) para tareas concretas en hindi como resumen o generacion de descripciones.
- Docencia y practicas de fine-tuning: su tamano reducido y su formato safetensors lo hacen adecuado para demonstrar pipelines de TRL y Transformers en cursos, sin requisitos de hardware elevados.
- Pruebas de integracion en pipelines de inferencia: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede desplegarse en HuggingFace TGI o en servicios compatibles para validar flujos de serving a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~500 MB en FP32, ~250 MB en FP16/BF16, ~125 MB en INT8 y ~65 MB en INT4. Hay que sumar el cache KV y las activaciones, que dependen de la longitud de secuencia (no publicada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre sirve; el modelo es viable en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin limitaciones de memoria.
- Cabe sobradamente en GPU de consumo, e incluso puede ejecutarse en CPU con latencias aceptables para generacion de textos cortos.
- Opciones de despliegue: transformers (pipeline de `text-generation`), llama.cpp/GGUF previa conversion, Ollama previa conversion, y text-generation-inference (TGI) segun las etiquetas del repositorio. No se confirma soporte nativo de vLLM.
- Latencia y throughput estimados: no disponibles. El tamano del repositorio (2,0 GB) es notablemente superior a los ~500 MB que ocuparian los pesos en FP32, lo que sugiere la presencia de artefactos de entrenamiento adicionales o de varias revisiones.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentacion publica; los del modelo analizado, de la informacion de HuggingFace. La comparativa es orientativa porque no se dispone de benchmarks del modelo evaluado.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455 | 124,8 M | no disponible | GPT-2 | no disponible | HuggingFace (0 descargas, 0 likes) |
| GPT-2 base | 124 M | 1024 tokens | GPT-2 | modificada MIT (OpenAI) | ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | GPT-2 destilado | Apache-2.0 | ampliamente disponible |

Si el criterio es "modelos comparables en hindi pequenos", no disponible: en la informacion proporcionada solo aparecen variantes de la misma serie del autor (`hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407`, `hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407`, entre otras), que comparten arquitectura y pipeline.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus hindi no descrito, es probable que herede sesgos del mismo, pero no hay evidencia publicada en la informacion disponible.
- Riesgo de alucinacion: elevado para un modelo de 124,8 M de parametros; su capacidad de mantener coherencia factual y conversacional es muy limitada en comparacion con LLM actuales.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y los idiomas soportados no estan declarados. Cualquier uso multilingue distinto del hindi debe validarse empiricamente.
- Licencia: la model card solo indica `licence: license`, sin terminos concretos. Esto impide confirmar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluacion publicada. Es un artefacto de investigacion, no un modelo validado.
- Trazabilidad: no se detalla la composicion del dataset de SFT ni el numero de tokens de entrenamiento, lo que dificulta reproducir el resultado exacto.
- Formato de chat: el ejemplo de la model card usa un pipeline con mensajes con rol `user`, pero no se especifica la plantilla de chat exacta empleada en el SFT; usar otra plantilla puede degradar la calidad de las respuestas.
- Riesgo de sobreajuste al corpus de 100 MB/10 MB empaquetado: la nomenclatura sugiere experimentos de escalado, no un entrenamiento orientado a cobertura linguistica amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ek879ifj
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada (seed3407, 100mb): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Variante relacionada (seed3407, 10mb): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante relacionada (seed10, 10mb/100mb): https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed10
- Variante relacionada (seed10, 100mb/100mb): https://friendli.ai/models/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante relacionada en FriendliAI: https://friendli.ai/models/fpadovani/hin-deva-100mb-after-ppt-Dp-10mb-ckpt500_seed455
