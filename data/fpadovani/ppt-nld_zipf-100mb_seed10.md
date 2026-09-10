# fpadovani/ppt-nld_zipf-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-nld_zipf-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por el usuario fpadovani y publicado en HuggingFace. Se trata de un transformer decoder-only de tipo GPT-2 con 86.708.736 parámetros (aproximadamente 86,7 millones), orientado a la generación de texto y entrenado mediante aprendizaje supervisado (SFT) con la librería TRL. El repositorio contiene pesos en formato safetensors y es compatible con text-generation-inference y con los endpoints de HuggingFace.

El identificador del repositorio sugiere un experimento de selección de datos: el sufijo `zipf` apunta a un muestreo con distribución de Zipf y `seed10` a una semilla concreta, mientras que `100mb` coincide con el presupuesto de datos del modelo base. Esta lectura es una interpretación del nombre y no está confirmada en la model card. El modelo base `nld_latn_100mb` pertenece a la familia Goldfish, centrada en modelos monolingües de bajo coste, y el código de idioma apunta al neerlandés (`nld_latn`).

Su relevancia es fundamentalmente de investigación: se trata de un modelo muy pequeño, con cero descargas y cero "likes" en el momento de la consulta, sin resultados de benchmarks publicados y con licencia no declarada. Resulta útil para reproducir experimentos de ajuste fino con TRL, estudiar el efecto de la selección de datos en lenguas de recursos medios y servir como banco de pruebas de bajo coste en una única GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt2 (transformer decoder-only, segun la etiqueta del repositorio) |
| Parametros totales | 86.708.736 (86,7 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no declarado; el modelo base es `nld_latn` (neerlandes), por lo que el neerlandes es el idioma esperado |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nld_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 1,4 GB |
| Pipeline | text-generation |
| Descargas / me gusta | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base, etiquetado como `gpt2` en el repositorio: un transformer decoder-only con atención causal, sin mecanismos de mezcla de expertos, atención lineal ni componentes de espacio de estados. El ajuste fino conserva el mismo número de parámetros que el modelo de partida (86,7 M en este repositorio) y se ha realizado sobre `goldfish-models/nld_latn_100mb`, un modelo monolingüe de la familia Goldfish asociado al neerlandés. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron etapas de RLHF o DPO.

El entrenamiento se llevó a cabo mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El autor enlaza una ejecución pública de Weights & Biases (`white_cotterell/runs/r59mzr0i`) donde pueden consultarse las curvas de pérdida, pero los hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote, esquema de enmascarado de pérdida) no se detallan en la model card. El ejemplo de uso emplea un formato conversacional con roles (`user`), lo que indica que el ajuste se hizo sobre datos con plantilla de diálogo, aunque no se documenta la plantilla exacta.

## Capacidades

- Generacion de texto autoregresiva en neerlandes, heredada del modelo base `nld_latn_100mb`.
- Formato conversacional de un turno: el ejemplo de la model card pasa una lista de mensajes con rol `user`, lo que sugiere un ajuste orientado a respuestas a instrucciones sencillas.
- Respuesta a preguntas abiertas y generacion de texto libre con `max_new_tokens` configurable.
- Integracion directa con la libreria `transformers` mediante `pipeline("text-generation", ...)`.
- Compatibilidad declarada con text-generation-inference y con endpoints alojados de HuggingFace (`endpoints_compatible`).
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explícito.
- Capacidad multilingue no documentada: el unico idioma respaldado por el identificador del modelo base es el neerlandes.

## Casos de uso

- Experimentos de reproducibilidad en ajuste fino: al estar entrenado con TRL y con una semilla identificable (`seed10`), sirve para replicar variaciones de SFT sobre un mismo modelo base y comparar resultados entre semillas.
- Estudio de seleccion de datos: el sufijo `zipf` sugiere un experimento de muestreo por distribución de Zipf; el modelo permite analizar cómo distintas politicas de seleccion de datos afectan a la calidad del texto generado en neerlandes.
- Generacion de texto en neerlandes para prototipos: con 86,7 M de parametros puede ejecutarse en CPU o en cualquier GPU de consumo para tareas de autocompletado y redaccion asistida de baja exigencia.
- Investigacion en lenguas de recursos medios: al derivar de la familia Goldfish, es un punto de partida barato para estudiar tecnicas de ajuste en neerlandes antes de escalar a modelos mayores.
- Generacion de datos sinteticos de bajo coste: puede producir grandes volumenes de texto en neerlandes para aumentar datasets de entrenamiento o para pruebas de robustez de otros sistemas.
- Evaluacion de infraestructura de despliegue: su tamano reducido permite validar pipelines de TGI, transformers o endpoints gestionados sin coste apreciable de GPU.
- Docencia y practicas: adecuado para cursos de ajuste fino supervisado, al ser reproducible en una unica GPU y con un repositorio de 1,4 GB.
- Pruebas de regresion de plantillas de chat: util para verificar cómo responde un modelo pequeno a formatos conversacionales concretos antes de aplicarlos a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (perplejidad, MMLU, HumanEval, GSM8K ni evaluaciones especificas de neerlandes), y tampoco se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 86.708.736 parametros: aproximadamente 347 MB en fp32, 173 MB en fp16/bf16, 87 MB en cuantizacion de 8 bits y 43 MB en 4 bits, sin contar la cache KV ni el consumo del runtime.
- En la practica, la inferencia en fp32 con `transformers` se mantiene por debajo de 1 GB de VRAM, incluyendo activaciones y overhead de la libreria.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en CPU. No requiere A100 ni H100.
- El repositorio ocupa 1,4 GB, muy por encima del peso de los pesos en fp32, lo que sugiere que incluye estados del optimizador u otros artefactos de entrenamiento.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (etiqueta declarada en el repositorio) y endpoints alojados de HuggingFace. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/ppt-nld_zipf-100mb_seed10 | 86,7 M | no disponible | no disponible | safetensors | Publico en HuggingFace, 0 descargas |
| goldfish-models/nld_latn_100mb (modelo base) | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| GPT-2 small (referencia de la misma familia) | 124 M | 1024 tokens | MIT | safetensors, GGUF y otros | Ampliamente disponible |

La comparacion con GPT-2 small se incluye unicamente como referencia de la misma familia arquitectonica; sus datos corresponden a especificaciones publicas del modelo original de OpenAI y no a una evaluacion de este ajuste fino. No se dispone de informacion suficiente sobre modelos comparables del mismo tamano entrenados especificamente en neerlandes dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia sin declarar: la model card usa un marcador de posicion (`licence: license`) y los metadatos de HuggingFace indican "no disponible". No hay base juridica clara para uso comercial.
- Sin datos de evaluacion: no existen benchmarks ni mediciones de calidad, por lo que se desconoce el nivel real de rendimiento y de fidelidad linguistica.
- Riesgo de alucinacion alto y sin cuantificar: al ser un modelo de 86,7 M de parametros, la coherencia en generaciones largas es limitada y no hay evaluaciones que acoten la tasa de error.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Sesgos no evaluados: no se ha publicado ningun analisis de sesgos, toxicidad ni sesgos de genero o etnia.
- Cobertura idiomatica restringida: sin declaracion explicita de idiomas, el uso fuera del neerlandes probablemente produzca resultados degradados.
- Capacidades de agente y tool calling no soportadas ni documentadas.
- Modelo con cero descargas y cero interacciones: no ha pasado por validacion de la comunidad, por lo que su fiabilidad en produccion no esta contrastada.
- La interpretacion del nombre (`zipf`, `seed10`) es una conjetura basada en el identificador; no esta confirmada por el autor.
- Uso en produccion no recomendado sin una evaluacion propia previa y sin una definicion juridica de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_zipf-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/r59mzr0i
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenido no relacionado.
