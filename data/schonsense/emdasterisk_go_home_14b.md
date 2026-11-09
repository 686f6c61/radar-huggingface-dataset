# schonsense/emdasterisk_go_home_14B

## Resumen

emdasterisk_go_home_14B es un fine-tune del modelo multimodal Ministral 3 14B Instruct (revision 2512) de Mistral AI, publicado por el usuario schonsense bajo licencia Apache 2.0. Su objetivo declarado es reducir el uso no deseado de asteriscos y guiones largos (em dashes) en las respuestas generadas, manteniendo las capacidades del modelo base. Se distribuye como un modelo completo con pesos nativos, no como un adaptador PEFT, por lo que puede cargarse directamente con `AutoModelForImageTextToText`.

El modelo conserva la arquitectura multimodal del base: un decoder de texto de aproximadamente 14.000 millones de parametros (13.945.031.680 segun los safetensors) acoplado a un modulo de vision con proyector multimodal, lo que le permite procesar entradas de imagen y texto. El entrenamiento consistio en una fusion (merge) de actualizaciones LoRA de rango 16 sobre 280 proyecciones del decoder de texto y 13 deltas de filas seleccionadas del cabezal de salida, aplicadas mediante IPO (Identity Preference Optimization) combinado con SFT sobre la respuesta elegida.

La relevancia de esta ficha es acotada: se trata de una publicacion de autor individual, sin descargas ni validacion externa, con diagnosticos muy limitados (12 items de GSM8K y 28 generaciones de benchmark/narrativa). Resulta util como ejemplo de pipeline de merge de LoRA en pesos nativos y de ajuste de estilo de salida, pero no debe considerarse un modelo con garantias de retencion de capacidades amplias ni de eliminacion sistematica de la puntuacion objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder de texto + modulo de vision con proyector), familia Mistral 3 / Ministral 3 |
| Parametros totales | 13.945.031.680 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en BF16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Ministral-3-14B-Instruct-2512-BF16` (revision `3cea74c1ebaf5ce5f5a2553de470e2ceab825142`) y mantiene su estructura completa: decoder de texto transformer, componentes de vision, proyector multimodal y tokenizer/processor nativos. El ajuste se aplico como LoRA de rango 16 sobre 280 proyecciones del decoder de texto y 13 deltas de filas seleccionadas del cabezal de salida, que posteriormente se fusionaron en los pesos nativos. Las embeddings de entrada, los modulos de vision, el proyector multimodal y las filas no seleccionadas del cabezal quedaron congelados. Se conservan los dtypes de almacenamiento de tensores del modelo base.

El entrenamiento uso IPO (Identity Preference Optimization) combinado con SFT sobre la respuesta elegida, con 1779 pares de entrenamiento y dos pasadas sobre el mismo manifiesto (run `production-dp-20261109T071800`, actualizacion de optimizador 224). El corpus preparado contenia 2042 pares y los pares de evaluacion se excluyeron del entrenamiento. Hiperparametros declarados: batch efectivo 16, learning rate pico de LoRA 1e-6, learning rate pico de las filas del cabezal 1e-7 y warmup correspondiente a la primera pasada completa. La provenance y los checksums se documentan en `TRAINING_LINEAGE.json` y `EXPORT.json`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Procesamiento de imagen y texto (`image-text-to-text`): conserva los modulos de vision y el proyector multimodal del base.
- Razonamiento aritmetico basico: el diagnostico interno de GSM8K obtuvo 12/12 en 12 items.
- Ajuste de estilo de salida orientado a reducir asteriscos y guiones largos, aunque el autor advierte que no esta garantizado.
- Tool calling / function calling: no documentado en la informacion disponible (el base es instruct, pero no se confirma en esta ficha).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Normalizacion de estilo en pipelines editoriales: el modelo puede emplearse como paso de reescritura para eliminar asteriscos de enfasis y guiones largos en textos generados, integrándose tras un LLM principal y antes de la publicacion.
- Prototipado de asistentes multimodales: al conservar vision y proyector, permite experimentar con preguntas sobre imagenes en entornos de investigacion con Transformers y BF16.
- Evaluacion de tecnicas de merge de LoRA: sirve como referencia practica de como fusionar adaptadores de rango 16 en pesos nativos y verificar la integridad mediante checksums.
- Generacion de descripciones de imagen en castellano: uso potencial en catalogos o accesibilidad, siempre que se valide el comportamiento multilingue, no documentado.
- Experimentos de alineacion con IPO: util para investigadores que quieran reproducir o comparar el efecto de IPO con SFT sobre un modelo instruct de 14B.
- Base para fine-tunes de estilo especifico: al ser un modelo completo con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes de tono o formato en dominios concretos.
- Diagnostico de razonamiento aritmetico en entornos educativos: con las cautelas debidas por el tamano minimo de la evaluacion (12 items).

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K (diagnostico interno) | 12/12 | Solo 12 items; no representativo |
| Suite de benchmark/narrativa (export T2) | 28 generaciones, 0 fallos de ejecucion, 3 topes de presupuesto de salida | Sin puntuaciones de calidad publicadas |
| Evaluacion multimodal | no realizada | El autor indica que la suite no evaluo comportamiento multimodal |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 28 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 40 GB o mas.
- Cuantizacion: no se publican variantes GGUF ni cuantizadas; para reducir VRAM habria que convertir los pesos a 8 o 4 bits por cuenta propia, con perdida de fidelidad no evaluada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para BF16. En consumer, una RTX 4090 (24 GB) no cabe en BF16 sin cuantizacion u offloading; seria necesario cuantizar o usar memoria unificada.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText.from_pretrained` y `dtype=torch.bfloat16`; vLLM, TGI o llama.cpp no estan confirmados para esta revision concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| emdasterisk_go_home_14B | 13,9B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de estilo sobre Ministral 3 14B |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | ~14B | no disponible | Apache 2.0 (segun el base) | Hugging Face, modelo oficial | Modelo base; referencia de capacidades |
| Ministral 3 en otras variantes (8B, etc.) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Validacion muy limitada: los diagnosticos (12 items de GSM8K, 28 generaciones) no permiten afirmar retencion de capacidades ni eliminacion garantizada de asteriscos y guiones largos.
- Comportamiento multimodal no evaluado por el autor; el rendimiento en tareas de vision es incierto pese a conservar los modulos.
- Sin descargas ni likes en Hugging Face: no hay evidencia de uso comunitario ni de replicacion independiente.
- Idiomas no declarados; el soporte multilingue, incluido el castellano, no esta verificado.
- Riesgo de alucinacion inherente a los modelos instruct de este tamano; no se han publicado evaluaciones de factualidad.
- Sesgos: no documentados por el autor; se heredan los del modelo base, no caracterizados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- La model card incluye referencias a ficheros de provenance (`TRAINING_LINEAGE.json`, `EXPORT.json`) que deben revisarse antes de un despliegue serio.
- No se publican variantes cuantizadas, lo que limita el despliegue en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schonsense/emdasterisk_go_home_14B
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Resultado de busqueda web sin relacion con el modelo (foro en chino sobre Sweet Home 3D): https://zhidao.baidu.com/question/533040060.html
