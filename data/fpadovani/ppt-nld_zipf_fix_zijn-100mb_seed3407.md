# fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed3407

## Resumen

`fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo monolingue `goldfish-models/nld_latn_100mb`, desarrollado por el usuario fpadovani (vinculado a la Universidad de Groningen segun la URL del experimento en Weights & Biases). El modelo base pertenece a la familia Goldfish, un conjunto de modelos de lenguaje monolingues entrenados con aproximadamente 100 MB de texto por idioma y orientados a lenguas con pocos recursos; el identificador `nld_latn` indica que el idioma objetivo es el neerlandes en escritura latina.

Tecnicamente es un transformer de tipo GPT-2 con 86.708.736 parametros totales (modelo denso, sin mezcla de expertos), distribuido en formato safetensors y consumible con la libreria `transformers` mediante la tarea `text-generation`. El ajuste se ha realizado con TRL 0.23.0 y el pipeline de ejemplo de la model card usa el formato de conversacion con roles (`{"role": "user", "content": ...}`), lo que indica que el entrenamiento SFT se hizo sobre datos en formato chat.

Su relevancia es fundamentalmente de investigacion: se trata de un experimento de ajuste fino sobre un modelo pequeno, con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada de forma efectiva y sin resultados de evaluacion publicados. El nombre del repositorio (`zipf_fix`) sugiere un experimento sobre la distribucion de frecuencias tipo Zipf en los datos de entrenamiento o en el tokenizador. No debe considerarse un modelo listo para produccion, sino una pieza de un estudio comparativo de semillas (`seed3407`) y variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.708.736 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio; los pesos se publican en safetensors y, por tamano, son convertibles a GGUF (q8_0, q4_k_m) para inferencia en CPU |
| Idiomas soportados | No disponible oficialmente; el identificador del modelo base (`nld_latn_100mb`) apunta al neerlandes como idioma objetivo |
| Licencia | No disponible (la model card incluye un campo placeholder `licence: license` sin texto legal) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 1,4 GB |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Frameworks declarados | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atencion causal, la configuracion clasica de GPT-2 empleada por la familia Goldfish para modelos monolingues de ~100 MB de datos por idioma. El ajuste fino no modifica el numero de parametros (86,7 millones) ni la estructura de capas; unicamente reentrena los pesos sobre un corpus nuevo mediante SFT. La model card no documenta el numero de capas, dimensiones de embedding, cabezas de atencion ni la ventana de contexto efectiva, por lo que esos datos quedan como no disponibles.

El entrenamiento se ha realizado con aprendizaje supervisado (SFT) usando TRL 0.23.0, lo que implica un dataset con pares entrada-salida o conversaciones etiquetadas, sin una fase declarada de RLHF o DPO. El pipeline de ejemplo de la model card pasa una lista de mensajes con el esquema de roles habitual en modelos de chat, y el nombre del repositorio (`ppt-nld_zipf_fix_zijn-100mb_seed3407`) apunta a un experimento controlado sobre la distribucion Zipf del corpus o del vocabulario, con una semilla fija (3407) para garantizar reproducibilidad. Las unicas trazas publicas del proceso son el run de Weights & Biases y las versiones de framework citadas. No se documenta composicion del dataset de ajuste, numero de tokens vistos, hiperparametros ni regimen de precision (FP32/BF16).

## Capacidades

- Generacion de texto autorregresiva en el dominio del modelo base (presumiblemente neerlandes), con coherencia limitada por el tamano de 86,7 millones de parametros.
- Conversacion de un solo turno o de pocos turnos: el modelo fue ajustado con SFT en formato de roles, por lo que acepta mensajes estructurados como `{"role": "user", "content": ...}`.
- Continuacion de texto y finalizacion de fragmentos cortos, el uso tipico de un modelo GPT-2 pequeno.
- Ajuste fino adicional: al ser un modelo pequeno y con pesos en safetensors, es viable reentrenarlo o adaptarlo con LoRA en una unica GPU.
- Ejecucion en entornos sin GPU: el tamano permite inferencia en CPU con cuantizacion.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito. La model card no los menciona en ningun momento.
- Capacidades multilingues: no documentadas. El idioma declarado del modelo base es el neerlandes; el prompt de ejemplo de la model card esta en ingles, sin que se indique que el modelo lo domine.

## Casos de uso

- Investigacion en linguistica computacional sobre neerlandes: el modelo sirve como punto de comparacion en estudios de ajuste fino con pocos datos, especialmente porque su nombre indica una variante experimental sobre la distribucion Zipf.
- Reproducibilidad de experimentos de SFT: el sufijo `seed3407` y el run de Weights & Biases permiten replicar el ajuste y compararlo con otras semillas o variantes del mismo estudio.
- Generacion de texto corto para prototipos en neerlandes: al caber en cualquier GPU de consumo e incluso en CPU, es util para validar una interfaz o un pipeline antes de invertir en un modelo mayor.
- Aumentacion de datos para corpus neerlandeses: se puede usar para generar borradores o parrafos sinteticos que despues se filtren manualmente, con la advertencia de que la calidad sera limitada.
- Experimentos de destilacion o de comparacion de tokenizadores: su tamano reducido hace barato entrenarlo muchas veces con vocabularios distintos para medir el efecto en la perplejidad.
- Despliegue en entornos con recursos muy restringidos (dispositivos edge, contenedores pequenos, CPU sin GPU) donde un modelo de 86,7 millones de parametros es la unica opcion viable.
- Docencia y practicas: es un caso adecuado para explicar el flujo completo de TRL (SFT, seguimiento con W&B, publicacion en el Hub) sin necesidad de infraestructura de cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y la busqueda web realizada no devolvio documentacion tecnica asociada al modelo (unicamente resultados genericos sin relacion con el repositorio).

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,35 GB solo para los pesos, mas el cache KV y las activaciones, lo que deja el consumo total por debajo de 1 GB en contextos cortos.
- VRAM en FP16/BF16: aproximadamente 0,17 GB de pesos.
- VRAM en int8: aproximadamente 0,09 GB; en 4 bits, en torno a 0,05 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta muy por debajo de las capacidades de cualquier acelerador moderno.
- Cabe holgadamente en GPU de consumo y tambien en CPU: la inferencia en procesador es practica para uso interactivo con pocas decenas de tokens generados.
- Opciones de despliegue: `transformers` con el pipeline `text-generation` (metodo documentado en la model card), Text Generation Inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed3407` | 86.708.736 | No disponible | No disponible | No | Repositorio publico en el Hub, 0 descargas |
| `goldfish-models/nld_latn_100mb` (modelo base) | 86.708.736 (heredados del base) | No disponible | No disponible en la informacion proporcionada | No disponible | Publico en el Hub |
| GPT-2 small (referencia de la misma familia arquitectonica) | 124 millones (dato ampliamente documentado) | 1.024 tokens (configuracion estandar de GPT-2) | MIT modificada | Si, pero no comparables directamente por idioma y datos de entrenamiento | Publico |

Los unicos datos verificables en la informacion proporcionada son el recuento de parametros del modelo ajustado y su relacion de herencia con el modelo base. No hay resultados de evaluacion de ninguno de los tres modelos que permitan una comparacion de rendimiento en neerlandes, por lo que cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- Tamano muy reducido: con 86,7 millones de parametros, la coherencia a partir de unas pocas frases se degrada con rapidez y la tasa de afirmaciones incorrectas o incoherentes es alta.
- Riesgo elevado de alucinacion: el modelo no ha pasado por una fase de alineacion declarada (ni RLHF ni DPO), solo SFT, y no dispone de mecanismos de verificacion factual.
- Licencia no resuelta: la model card contiene el texto placeholder `licence: license`, sin terminos legales efectivos. El uso comercial es juridicamente incierto y requiere contactar con el autor.
- Sesgos: el modelo base se entreno con unos 100 MB de texto del idioma objetivo, una cantidad reducida que amplifica los sesgos presentes en esa muestra (sesgo de dominio, de registro y de la fuente de recoleccion). No se documenta ninguna mitigacion.
- Limitaciones de contexto e idioma: la ventana de contexto no esta documentada y el unico idioma identificable por el nombre del modelo base es el neerlandes. El prompt de ejemplo de la model card esta en ingles, pero no hay evidencia de que el modelo responda correctamente en ese idioma.
- Ausencia de validacion externa: cero descargas y cero "likes" implican que el modelo no ha sido evaluado por terceros ni contrastado en condiciones reales.
- Trazabilidad parcial: la unica referencia al proceso de entrenamiento es un enlace a Weights & Biases y las versiones de framework; faltan hiperparametros, composicion del dataset, numero de tokens y detalles de preprocesado.
- No apto para produccion sin evaluacion previa: antes de cualquier uso real conviene medir perplejidad y calidad de generacion en el dominio objetivo, y considerar un modelo mayor aunque sea mas costoso de desplegar.
- Nombre del repositorio experimental: variantes como `zipf_fix` o `seed3407` indican que se trata de un punto concreto de un barrido de experimentos, no de un artefacto con soporte o mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_zipf_fix_zijn-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/btr3ksh4
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de la familia Goldfish: https://huggingface.co/goldfish-models

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a sitios genericos sin relacion con el repositorio.
