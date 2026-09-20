# MingZwhy/Qwen3-0.6B-W1.88-QAD

## Resumen

Qwen3-0.6B-W1.88-QAD es un checkpoint intermedio publicado por el usuario MingZwhy dentro de su proyecto QAOPD (quantization-aware on-policy distillation). No es un modelo listo para inferencia: se trata del punto de partida del entrenamiento con conocimiento de cuantizacion (QAD) para la variante denominada W1.88, construido sobre el modelo base Qwen/Qwen3-0.6B de Alibaba. El repositorio contiene 596.049.920 parametros almacenados en safetensors, con un peso total de 1,2 GB.

La particularidad del checkpoint es que, aunque el objetivo final del pipeline es un modelo con pesos mixtos INT1.58/INT4 (1,88 bits efectivos), los tensores guardados aqui siguen en bf16 y sin cuantizar. El entrenamiento con conocimiento de cuantizacion mantiene copias maestras en alta precision y aplica el cuantizador dentro del forward pass, de modo que lo que se serializa es la copia maestra. Por eso el autor advierte explicitamente que cargar este fichero directamente devuelve un modelo sin cuantizar, que no dara error y que obtendra mejores puntuaciones que el modelo W1.88 final.

Su relevancia es por tanto metodologica y de investigacion: sirve como `STUDENT_MODEL` en la etapa OPD del pipeline, que es la que aporta la configuracion del cuantizador. Para evaluar un modelo cargable y ya recuperado, el propio autor remite al checkpoint MingZwhy/Qwen3-0.6B-W1.88-QAOPD. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B); sin confirmar detalles en la model card |
| Parametros totales | 596.049.920 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-0.6B declara 32 768 tokens |
| Tipos de cuantizacion | Objetivo del pipeline: pesos mixtos INT1.58 / INT4 en bloques de 256, con un 12,5% de bloques en INT4 (1,88 bits efectivos); embedding y cabeza de salida en INT4; activaciones en INT8. El checkpoint publicado, en cambio, esta en bf16 sin cuantizar |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3 declara soporte multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, sin cuantizar); repositorio de 1,2 GB |

## Arquitectura y entrenamiento

El checkpoint se apoya en la arquitectura del modelo base Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3, del que hereda licencia, tokenizador y pesos de partida. La model card no detalla numero de capas, dimensiones ocultas, atencion ni composicion del dataset, por lo que esos datos quedan como no disponibles. Lo que si documenta el autor es el esquema de cuantizacion objetivo: pesos mixtos en bloques de 256 elementos con asignacion INT1.58 o INT4 segun un criterio del 12,5% de bloques en la precision mas alta, lo que arroja 1,88 bits efectivos por peso, mas embedding y cabeza de salida en INT4 y activaciones en INT8.

Metodologicamente, el modelo es un artefacto de un pipeline de quantization-aware training combinado con destilacion on-policy (QAOPD). La QAD mantiene pesos maestros en bf16 y aplica el cuantizador dentro del forward pass, de manera que el gradiente fluye a traves de una funcion de cuantizacion simulada; lo que se guarda en este repositorio es precisamente esa copia maestra. El entrenamiento se completa en una etapa posterior de destilacion on-policy, donde este checkpoint actua como `STUDENT_MODEL` y la configuracion del cuantizador la aporta el script de la etapa OPD. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso en dialogos multi-turno, condicionado a que el checkpoint se use en su contexto previsto.
- Capacidades heredadas del modelo base Qwen3-0.6B (razonamiento, codigo y matematicas basicas), no verificadas ni cuantificadas para este checkpoint concreto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de vision o audio.
- Capacidades multilingues: no disponibles en la model card.
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`).
- Funcion principal declarada: servir de punto de partida entrenable, no de modelo final. Las capacidades reales del modelo destilado y cuantizado corresponden al checkpoint MingZwhy/Qwen3-0.6B-W1.88-QAOPD.

## Casos de uso

- Punto de partida de un pipeline de destilacion on-policy con cuantizacion: se carga como `STUDENT_MODEL` en la etapa OPD mediante el script `scripts/opd/run_math.sh`, que inyecta la configuracion del cuantizador; es el uso para el que el autor ha publicado el checkpoint.
- Reproduccion de experimentos de QAD: investigadores que quieran replicar el entrenamiento con conocimiento de cuantizacion desde el mismo estado inicial pueden partir de estos pesos maestros en bf16 y comparar sus resultados con los publicados.
- Estudio de cuantizacion extrema a 1,88 bits: el checkpoint permite medir la degradacion introducida por el esquema mixto INT1.58/INT4 comparando la copia maestra sin cuantizar con el checkpoint recuperado, lo que aisla el efecto de la cuantizacion del efecto del entrenamiento.
- Fine-tuning de modelos ultraligeros: al ser un modelo de 596 millones de parametros con licencia Apache-2.0, puede ajustarse en dominios concretos antes o despues de la cuantizacion, en entornos con recursos muy limitados.
- Experimentacion academica sobre destilacion: la combinacion QAD mas OPD es un objeto de estudio util para comparar estrategias de transferencia de conocimiento entre modelos de distinta precision.
- Base para la fase de recuperacion de pesos: forma parte de la cadena que produce el modelo final desplegable, por lo que es el artefacto intermedio necesario para auditar o modificar ese proceso.
- Formacion y docencia: sirve para ilustrar de forma tangible que un checkpoint de QAT serializa copias maestras de alta precision y no tensores cuantizados, un error de interpretacion habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y advierte de que cualquier medicion directa sobre este checkpoint corresponderia a un modelo sin cuantizar, por lo que no seria representativa del modelo W1.88 final.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros (596 millones) y no publicada por el autor: en bf16 o fp16, aproximadamente 1,2 GB de pesos mas overhead de activaciones y cache KV; en INT8, alrededor de 0,6 GB; en INT4, alrededor de 0,3 GB. El checkpoint publicado, al estar en bf16, requiere el escenario de mayor consumo.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para el checkpoint en bf16 con contextos moderados; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque estas ultimas quedan muy sobredimensionadas para 0,6 B de parametros.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU o en sistemas embebidos, siempre que se use el checkpoint en su precision original.
- Opciones de despliegue: transformers de forma nativa; la etiqueta `text-generation-inference` y `endpoints_compatible` apuntan a TGI y a Inference Endpoints; vLLM es viable por tratarse de un transformer denso estandar. No se proporcionan pesos en GGUF en el repositorio, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| MingZwhy/Qwen3-0.6B-W1.88-QAD | 596 M | no disponible (base: 32 768) | Apache-2.0 | Checkpoint intermedio de investigacion, bf16 sin cuantizar, 0 descargas |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 tokens (segun su model card) | Apache-2.0 | Modelo base completo y listo para inferencia |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 tokens (segun su model card) | Apache-2.0 | Alternativa de mayor tamano en la misma familia |
| meta-llama/Llama-3.2-1B | 1,2 B | 128 000 tokens (segun su model card) | Llama 3.2 Community License | Contexto mayor, licencia con restricciones adicionales para uso comercial a gran escala |
| MingZwhy/Qwen3-0.6B-W1.88-QAOPD | no disponible | no disponible | Apache-2.0 | Checkpoint recuperado del mismo pipeline, apto para cargar y evaluar |

La comparacion de rendimiento entre estos modelos no es posible con la informacion disponible, ya que no se han publicado evaluaciones del checkpoint.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: es un punto de partida de entrenamiento. Cargarlo y usarlo para inferencia produce resultados que no reflejan el modelo W1.88 final.
- Los tensores estan en bf16 y sin cuantizar. El autor advierte explicitamente de que la carga no dara error y de que las metricas obtenidas seran artificialmente mejores que las del modelo cuantizado de destino.
- El esquema objetivo de 1,88 bits efectivos es una cuantizacion extremadamente agresiva, con solo un 12,5% de bloques en INT4; cabe esperar una degradacion notable de la calidad en el modelo final, aunque no se aportan mediciones.
- No hay ningun benchmark publicado, ninguna evaluacion de sesgos y ninguna medicion de alucinacion para este checkpoint ni, en la informacion disponible, para el modelo resultante.
- Idiomas soportados no documentados en la model card; el comportamiento multilingue solo puede inferirse del modelo base.
- Contexto maximo no documentado en la ficha; si se aplica el del modelo base, cualquier extension mediante YaRN u otras tecnicas requeriria verificacion propia.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que limita la validacion independiente por parte de terceros.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales conocidas para uso comercial, aunque se recomienda revisar los terminos del proyecto QAOPD si se reutiliza su codigo.
- Las busquedas web realizadas no devolvieron informacion tecnica relevante sobre el modelo; los resultados obtenidos eran directorios telefonicos sin relacion con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MingZwhy/Qwen3-0.6B-W1.88-QAD
- Checkpoint recuperado del mismo pipeline: https://huggingface.co/MingZwhy/Qwen3-0.6B-W1.88-QAOPD
- Codigo y receta: https://github.com/MingZwhy/QAOPD
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, blog o demo adicionales: no disponible; la busqueda web no devolvio resultados relevantes
