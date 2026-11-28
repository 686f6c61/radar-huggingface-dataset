# Nsmith15/consapia-answer-mini-GGUF

## Resumen

Consapia answer mini GGUF es una distribucion en formato llama.cpp del modelo base Qwen3-0.6B, publicado por el usuario Nsmith15 bajo licencia Apache-2.0. No se trata de un modelo reentrenado ni afinado: la model card indica explicitamente que los pesos son los de Qwen3-0.6B "unchanged" (sin modificar), cuantizados en Q4_K_M a partir de la version GGUF de Unsloth. El unico cambio respecto al original es operativo: el fichero se ha dividido en partes de 64 MB para que navegadores moviles puedan cargarlo de forma incremental.

El modelo resuelve un problema de despliegue, no de capacidad: permite ejecutar un LLM pequeno directamente en el navegador de un telefono mediante llama.cpp y wllama, cargando los fragmentos listados en el manifiesto `consapia-gguf.json`. Con 596.049.920 parametros y un repositorio de 0,4 GB, esta pensado para entornos con memoria y ancho de banda muy limitados, donde no es viable descargar un unico fichero de gran tamano.

Su relevancia es acotada pero clara: demuestra un patron de empaquetado (sharding de GGUF + manifiesto JSON) util para inferencia on-device en navegador. Cualquier evaluacion de calidad debe remitirse al modelo original Qwen3-0.6B, ya que esta publicacion no aporta cambios en pesos, tokenizador ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-0.6B); detalles completos no disponibles en esta ficha |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF dividido en partes de 64 MB, con manifiesto `consapia-gguf.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a Qwen3-0.6B, un transformer denso de aproximadamente 0,6 mil millones de parametros. Esta publicacion no documenta ni modifica el entrenamiento: no hay datos sobre numero de tokens, composicion del corpus, fases de RLHF/DPO ni innovaciones propias. La model card es explicita al senalar que los pesos son los originales sin cambios.

La unica aportacion tecnica es el empaquetado: cuantizacion Q4_K_M realizada por Unsloth y posterior troceado en ficheros de 64 MB para carga progresiva en navegadores moviles a traves de llama.cpp y wllama. Los tags incluyen `imatrix`, lo que sugiere el uso de una matriz de importancia en la cuantizacion heredada del GGUF de origen, aunque no se detalla su procedencia en esta publicacion.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen3-0.6B.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano del modelo.
- Ejecucion en navegador mediante wllama y llama.cpp, con carga por partes.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo como API compatible en infraestructura de Hugging Face.
- Capacidades multilingues: no documentadas en esta publicacion; deben consultarse en la model card de Qwen3-0.6B.
- Tool calling, modo thinking, vision o audio: no documentados en la informacion disponible para esta distribucion.

## Casos de uso

- Demos de LLM en navegador movil: cargar los fragmentos de 64 MB desde `consapia-gguf.json` con wllama permite ofrecer una demo funcional sin backend, util para prototipos y pruebas de concepto.
- Formularios y asistentes offline en el cliente: al ejecutarse integramente en el dispositivo, se pueden generar respuestas o resumenes sin enviar datos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Respuestas telefonicas automatizadas de baja complejidad: el nombre del modelo sugiere este uso; con 0,6B de parametros es adecuado para respuestas cortas y guionizadas, no para razonamiento profundo.
- Clasificacion y extraccion de entidades en el borde: tareas de etiquetado simple o extraccion de campos sobre texto corto, donde la latencia importa mas que la precision fina.
- Entornos con conectividad intermitente: el troceado permite reanudar la descarga parcial, algo relevante en redes moviles inestables.
- Pruebas de integracion de llama.cpp en pipelines web: sirve como banco de pruebas para validar carga por shards, cache en el navegador y gestion de memoria antes de migrar a modelos mayores.
- Servicio ligero compatible con endpoints: para tareas de bajo coste donde un modelo de 0,6B cuantizado a Q4 es suficiente y el coste por token debe ser minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una cuantizacion Q4_K_M de Qwen3-0.6B sin cambios en los pesos, los resultados de referencia deben tomarse de la model card oficial de Qwen3-0.6B, no de esta publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en Q4_K_M, coherente con el tamano del repositorio (0,4 GB).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En GPU, cualquier tarjeta con 1 GB o mas de VRAM es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas.
- Despliegue: llama.cpp y wllama son los objetivos declarados; tambien es compatible con Ollama y otros runners que acepten GGUF, siempre que se gestionen las partes por separado o se unan previamente.
- Latencia y throughput: no disponibles. En navegador movil cabe esperar latencias altas por token en comparacion con inferencia en servidor, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Consapia answer mini GGUF (esta ficha) | 596 M | no disponible | GGUF Q4_K_M en shards de 64 MB | Apache-2.0 | Inferencia en navegador movil |
| Qwen/Qwen3-0.6B | 596 M | no disponible | safetensors | Apache-2.0 | Modelo base original |
| unsloth/Qwen3-0.6B-GGUF | 596 M | no disponible | GGUF (varias cuantizaciones) | Apache-2.0 | GGUF de referencia sin trocear |

La comparativa relevante es de empaquetado, no de capacidad: los tres comparten pesos. La diferencia de esta publicacion es exclusivamente el troceado en ficheros de 64 MB y el manifiesto de carga.

## Limitaciones y advertencias

- No es un modelo afinado: la model card indica que los pesos son los de Qwen3-0.6B sin modificar; no cabe esperar mejoras en el dominio "consapia" respecto al base.
- Con 0,6B de parametros, la capacidad de razonamiento, el conocimiento factual y la robustez frente a instrucciones complejas son limitadas; el riesgo de alucinacion es alto en preguntas abiertas.
- La cuantizacion Q4_K_M introduce perdida adicional de calidad frente a los pesos en safetensors.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad en esta publicacion.
- El uso comercial esta permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y del GGUF de Unsloth del que deriva.
- El troceado en partes exige cargar todos los fragmentos listados en `consapia-gguf.json`; un fragmento ausente o corrupto impide la inferencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del empaquetado.
- No hay datos publicados de latencia, throughput ni consumo de memoria en navegador movil.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nsmith15/consapia-answer-mini-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF de origen: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
