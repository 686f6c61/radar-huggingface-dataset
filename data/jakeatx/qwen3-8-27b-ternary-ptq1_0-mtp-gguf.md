# jakeatx/Qwen3.8-27B-Ternary-PTQ1_0-MTP-GGUF

## Resumen

Qwen3.8-27B-Ternary-PTQ1_0-MTP-GGUF es una cuantización ternaria de post-entrenamiento (PTQ) del modelo Qwen3.8-27B, publicada por el usuario jakeatx. Según la model card, el modelo base sigue la arquitectura denominada Prism ML Ternary Bonsai 2 y aquí se distribuye en formato PTQ1_0 con aproximadamente 1,75 bits por peso (grupo de 128, 28 bytes por bloque), lo que reduce el peso de los ficheros a 5,81 GiB para 27.320.697.856 parámetros totales.

El interés principal de esta ficha no está en el modelo base, sino en la combinación de tres elementos poco habituales en el ecosistema GGUF: cuantización ternaria de muy baja precisión, una cabeza MTP (multi-token prediction) nativa de una capa que actúa como drafter para decodificación especulativa, y una compilación optimizada para GPUs Ampere de consumo con capacidad de cómputo sm86 (RTX 3090 y 3090 Ti). El autor indica que el objetivo es ejecutar el modelo con offload completo en una única GPU de 24 GB manteniendo capacidad de contexto de hasta 262.144 tokens.

Se trata de un artefacto muy reciente (publicado el 18 de septiembre de 2026) con 0 descargas y 0 likes, sin benchmarks publicados y sin documentación sobre idiomas soportados ni sobre el pipeline. Su utilidad práctica es, por tanto, experimental: sirve para evaluar el compromiso entre compresión extrema, memoria y calidad de generación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el autor indica que el modelo base es Qwen3.8-27B con arquitectura "Prism ML Ternary Bonsai 2" |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 262.144 tokens con offload completo según el autor; el ejemplo de uso emplea 32.768 tokens |
| Tipos de cuantizacion | PTQ1_0 ternaria, ~1,75 bpw, grupo 128, 28 bytes por bloque |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal de 5,81 GiB; repositorio de 6,2 GB) |

Datos adicionales: incluye una cabeza MTP nativa de 1 capa como drafter; hardware objetivo declarado, una única GPU de 24 GB (RTX 3090 / 3090 Ti); runtime recomendado, llamAmpere (rama `feature/v0.3.1-bonsai2`); etiquetas del repositorio: `gguf`, `qwen3_5`, `ternary`, `mtp`, `speculative-decoding`, `ampere`, `sm86`, `endpoints_compatible`, `conversational`.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la referencia a "Prism ML Ternary Bonsai 2" y a la familia Qwen3.8. No se documentan el número de capas, la dimensión oculta, el tipo de atención, la composición del dataset de preentrenamiento, el número de tokens vistos, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se detalla nada sobre el proceso de destilación o calibración empleado para la cuantización ternaria.

Lo que sí se documenta es el procedimiento de compresión y el mecanismo de aceleración. La cuantización es PTQ (post-training quantization) en formato PTQ1_0, con pesos ternarios agrupados en bloques de 128 elementos y 28 bytes por bloque, lo que da ~1,75 bpw. Además, el modelo conserva una cabeza MTP nativa de una sola capa que se usa como modelo borrador (drafter) para decodificación especulativa: el servidor genera varios tokens candidatos con la cabeza MTP y los valida con el modelo principal, reduciendo el número de pasos de decodificación completos. El comando de ejemplo del autor activa este modo con `--spec-type draft-mtp`, `--spec-draft-n-max 3` y `--spec-draft-p-min 0`, es decir, hasta 3 tokens especulados por paso sin umbral mínimo de probabilidad. El binario está compilado para sm86, por lo que los kernels están orientados específicamente a GPU Ampere de consumo.

## Capacidades

La model card no enumera capacidades funcionales de forma explícita, por lo que solo se pueden afirmar las que se deducen de las etiquetas y del contexto del repositorio:

- Generación de texto conversacional: la etiqueta `conversational` indica que el artefacto está pensado para diálogo multi-turno.
- Decodificación especulativa integrada: cabeza MTP de 1 capa que actúa como drafter sin necesidad de un modelo borrador externo.
- Contexto largo: el autor declara capacidad de hasta 262.144 tokens con offload completo en 24 GB de VRAM.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de una interfaz de tipo endpoint, aunque no se especifica el protocolo.
- Inferencia en GPU Ampere de consumo: kernels compilados para sm86.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo, tool calling, agentes): no documentadas en esta ficha; deben verificarse experimentalmente contra el modelo original, ya que la cuantización ternaria de 1,75 bpw puede degradarlas de forma desigual.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue local en una sola RTX 3090 o 3090 Ti: con 5,81 GiB de pesos, el modelo cabe holgadamente en 24 GB de VRAM dejando el resto para caché KV y buffers; es el escenario que el propio autor declara como objetivo.
- Análisis de documentos extensos en local: la ventana declarada de hasta 262.144 tokens permite procesar libros técnicos, expedientes o bases de código completas sin trocear, siempre que la caché KV se cuantice (el ejemplo usa `-ctk q8_0 -ctv turbo3`) para no agotar la VRAM.
- Asistente conversacional on-premise con datos sensibles: al ejecutarse íntegramente en hardware propio y con licencia Apache 2.0, encaja en entornos con requisitos de soberanía de datos donde no se permite enviar información a APIs externas.
- Asistente de programación en estación de trabajo: el par clave/valor cuantizado y la decodificación especulativa con MTP están pensados para reducir la latencia percibida en generación de código interactiva, aunque la calidad real en este dominio no está medida.
- Servicio de inferencia por lotes en un solo nodo: el modelo se puede levantar con `llama-server` y exponer una API HTTP para tareas de resumen, clasificación o extracción sobre grandes volúmenes de texto, reutilizando la misma GPU.
- Investigación sobre cuantización ternaria: permite medir empíricamente la pérdida de calidad de 1,75 bpw frente a cuantizaciones de 4-8 bits sobre el mismo modelo base, así como el impacto de la cabeza MTP en el throughput.
- Evaluación de decodificación especulativa en Ampere: sirve como banco de pruebas para comparar `--spec-draft-n-max` y distintos esquemas de caché KV en sm86 antes de llevarlos a producción.
- Prototipado con presupuesto de VRAM reducido: al ocupar menos de 6 GiB en pesos, deja margen para ejecutar otros componentes (retrievers, embeddings, rerankers) en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni de velocidad (tokens/s), y la búsqueda web realizada no devolvió documentación técnica relevante sobre este modelo.

## Requisitos de hardware

- VRAM para los pesos: 5,81 GiB con la cuantización PTQ1_0 incluida en el repositorio.
- VRAM total: 24 GB recomendados por el autor para offload completo con contexto amplio; la caché KV a 262.144 tokens requiere cuantización (el ejemplo usa `-ctk q8_0` y `-ctv turbo3`) y aun así es el factor limitante.
- GPU objetivo: RTX 3090 y RTX 3090 Ti (sm86, Ampere de consumo). No hay datos sobre funcionamiento en Ada, Hopper o Blackwell; los kernels compilados para sm86 no implican compatibilidad con sm80 (A100) ni con sm90 (H100).
- GPU de consumo: sí, cabe en tarjetas de 24 GB (RTX 3090, 3090 Ti, 4090 por capacidad, aunque la compilación documentada es sm86).
- Opciones de despliegue: llamAmpere, rama `feature/v0.3.1-bonsai2`, mediante `llama-server`. No se documenta compatibilidad con llama.cpp upstream, Ollama, vLLM ni TGI.
- Parámetros de ejecución del ejemplo del autor: `-c 32768 -b 4096 -ub 1024 -t 8 -ngl 99 -fa on -ctk q8_0 -ctv turbo3 --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0`.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, TTFT ni tasas de aceptación del drafter MTP.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que la comparación se limita a aspectos de formato y tamaño. Las cifras de las filas 2 y 3 son cálculos aritméticos a partir del número de parámetros indicado, no mediciones publicadas.

| Modelo | Parametros | Precisión / formato | Tamano de pesos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| jakeatx/Qwen3.8-27B-Ternary-PTQ1_0-MTP (esta ficha) | 27,32 mil millones | Ternaria PTQ1_0, ~1,75 bpw, GGUF | 5,81 GiB | Hasta 262.144 tokens según el autor | Apache 2.0 | No disponible |
| Qwen3.8-27B en fp16 (referencia teórica) | 27,32 mil millones | 16 bits | ~54,6 GB (cálculo) | No disponible | No disponible | No disponible |
| Cuantización GGUF de 4-5 bits del mismo modelo base (referencia teórica) | 27,32 mil millones | ~4,5-5 bpw | ~15-17 GB (cálculo) | No disponible | No disponible | No disponible |

No se conocen, a partir de la información proporcionada, otros modelos ternarios de 27B en GGUF con cabeza MTP nativa que permitan una comparación directa.

## Limitaciones y advertencias

- Cuantización ternaria de 1,75 bpw: es una compresión extremadamente agresiva; la degradación de calidad respecto al modelo original puede ser notable, especialmente en tareas de razonamiento, matemáticas y generación de código. No hay métricas que cuantifiquen esa pérdida.
- Ausencia total de benchmarks: no se puede afirmar ningún nivel de rendimiento, y la evaluación previa a producción es obligatoria.
- Riesgo de alucinación: no medido. Como en cualquier modelo generativo, y con mayor probabilidad bajo cuantización agresiva, se recomienda verificación de salidas en dominios factuales.
- Idiomas: no se documenta ningún listado de idiomas soportados ni la calidad por idioma.
- Dependencia de un runtime específico: el modelo está optimizado para la rama `feature/v0.3.1-bonsai2` de llamAmpere. No se garantiza que funcione en llama.cpp upstream, Ollama, vLLM o TGI, ni que la cabeza MTP se aproveche fuera de ese runtime.
- Restricción de hardware: los kernels están compilados para sm86 (Ampere de consumo). El rendimiento en otras arquitecturas no está documentado y podría ser nulo o degradado.
- Procedencia del modelo base: la model card no enlaza el repositorio del modelo original ni los pesos en fp16, no indica la fecha de corte del preentrenamiento ni el origen del dataset, lo que dificulta auditar sesgos o licencias de los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia corresponde a este artefacto; conviene verificar la licencia del modelo base por si impusiera condiciones adicionales.
- Madurez: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni validación de la comunidad. El nombre del repositorio mezcla etiquetas como `qwen3_5` y "Qwen3.8-27B", lo que genera ambigüedad sobre la versión exacta del modelo base.
- Contexto largo en la práctica: los 262.144 tokens declarados requieren cuantizar la caché KV y dependen de la implementación del runtime; la degradación de atención en ventanas tan largas no está medida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jakeatx/Qwen3.8-27B-Ternary-PTQ1_0-MTP-GGUF
- Runtime llamAmpere (rama `feature/v0.3.1-bonsai2`): https://github.com/JakeATX/llamAmpere
- Paper, blog o demo del modelo base: no disponible
- Resultados de benchmarks: no disponible
- La búsqueda web realizada no devolvió ningún enlace técnico relacionado con este modelo.
