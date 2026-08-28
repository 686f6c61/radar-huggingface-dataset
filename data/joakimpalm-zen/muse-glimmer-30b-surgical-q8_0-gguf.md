# Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF

## Resumen

Muse-Glimmer-30B-Surgical-Q8_0-GGUF es un artefacto derivado del modelo Muse-Glimmer-30B de Meta, publicado por el usuario Joakimpalm-Zen. Se trata de un GGUF cuantizado a Q8_0 al que se le ha aplicado una cirugía de profundidad: se han eliminado estructuralmente las subcapas FFN de las capas 4, 7, 9 y 48 del decoder (un 6,34 % de los tensores), y el daño resultante se ha reparado mediante destilación local contra el modelo padre congelado sobre un corpus decontaminado. El resultado es un modelo de 27,58 GB que conserva una alta fidelidad respecto al original BF16, con un acuerdo top-1 del 98,34 % y una divergencia KLD media de 0,03883, superando los umbrales de calidad establecidos.

La relevancia de este artefacto radica en que demuestra una vía práctica para reducir el tamaño de un modelo grande sin recurrir a la poda tradicional ni a la cuantización agresiva, manteniendo el comportamiento del modelo original. Está pensado para ejecutarse con el motor de inferencia xyntetik-runner, aunque es compatible con cualquier runtime GGUF que soporte el modelo base. El modelo base de Meta es un modelo causal de 30 000 millones de parámetros con encoder de percepción dedicado, diseñado para tareas agénticas autónomas en hardware de consumo, con razonamiento multi-paso, uso fiable de herramientas y comprensión multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de percepcion (modelo base Muse-Glimmer-30B) |
| Parametros totales | 27.854.794.240 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este artefacto); el hermano menor usa Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer causal de 30 000 millones de parametros con un encoder de percepcion separado, destilado de Muse Spark y orientado a tareas agénticas autonomas en hardware de consumo. Este artefacto quirurgico parte de ese modelo y aplica una poda estructural: elimina por completo las subcapas FFN de las capas 4, 7, 9 y 48, dejando los tensores a cero exacto pero conservando la forma estandar. Tras la eliminacion, se entrena una unica FFN por corte (la primera capa superviviente por debajo de cada corte) contra el padre congelado, usando un corpus escalado a 14x tokens unicos y decontaminado a nivel de ventana de 64 tokens (no a nivel de documento), lo que elimina solapamientos con el split de evaluacion.

El proceso de curado se valida con una barra estricta de fidelidad: acuerdo top-1 con margen >= 98 % y KLD media <= 0,05. Este artefacto Q8_0 alcanza 98,34 % y 0,03883, respectivamente. Ademas, se ha medido que el ruido de cuantizacion y el error de cirugia son aditivos e independientes (dentro de un 3,5 % en cinco configuraciones), lo que permitio predecir el coste de cuantizacion antes de construir el archivo: +0,00026 KLD sobre la cirugia BF16.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredadas del modelo base Muse-Glimmer-30B.
- Uso fiable de herramientas (tool calling) y recuperacion ante fallos, segun las capacidades del modelo base.
- Comprension multimodal en el modelo base (entrada de imagen), aunque este artefacto GGUF no incluye el proyector multimodal (mmproj) ni el encoder de vision; solo se sirve la ruta de texto.
- Capacidades multilingues no documentadas para este artefacto especifico.
- Compatible con cualquier runtime GGUF que soporte muse-glimmer, ya que todos los tensores son tipos GGUF ordinarios con forma estandar (12 tensores FFN son exactamente cero, lo que constituye la cirugia).

## Casos de uso

- Inferencia local en servidores con memoria abundante: con 27,58 GB, cabe en maquinas con ~30 GB de RAM o VRAM, permitiendo ejecutar un modelo de 30B en hardware de gama alta sin necesidad de cuantizacion inferior.
- Agentes autonomos de codificacion: el modelo base esta disenado para tareas agénticas; este artefacto conserva esa capacidad con una fidelidad alta al original, por lo que puede usarse con herramientas como OpenCode para generar y editar codigo de forma privada y local.
- Desarrollo de asistentes conversacionales con contexto largo: aunque la longitud de contexto no esta documentada, el modelo base soporta razonamiento multi-paso y uso de herramientas, adecuado para chatbots con memoria extendida.
- Evaluacion de tecnicas de poda y cuantizacion: este artefacto sirve como caso de estudio para medir el impacto de la cirugia de profundidad combinada con Q8_0, util para investigadores que comparan metodos de compresion.
- Despliegue en entornos sin GPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp o xyntetik-runner, aunque con latencia mayor; util para entornos de desarrollo o pruebas.
- Integracion en pipelines de CI/CD para generacion de codigo: con soporte de tool calling (del modelo base) y formato GGUF, puede integrarse en flujos automatizados de revision y generacion de codigo, siempre que el runtime soporte la sintaxis de herramientas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona metricas de fidelidad frente al padre BF16, que se resumen a continuacion:

| Artefacto | Tamano | KLD media | Top-1 con margen | Barra |
|---|---|---|---|---|
| Este archivo (cirugia + curado, Q8_0) | 27,58 GB | 0,03883 | 98,34 % | PASS |
| Mismos pesos en BF16 | 51,90 GB | 0,03857 | 98,34 % | PASS |
| Padre en Q8_0 (control solo cuantizacion) | 27,58 GB | 0,00040 | 99,99 % | PASS |

Estas metricas indican que el artefacto se comporta como una version mas pequena del original, no como un modelo distinto que puntua bien. No hay datos de rendimiento en tareas especificas.

## Requisitos de hardware

- VRAM estimada: ~30 GB para inferencia con Q8_0 (el archivo pesa 27,58 GB, mas overhead de contexto y runtime).
- GPU recomendadas: A100 40GB, A100 80GB, H100, o multiples RTX 4090 (24 GB cada una, necesarias 2 en paralelo o con offload parcial a CPU).
- No cabe en una unica GPU consumer de 24 GB (RTX 4090) sin offload a CPU o sin reducir contexto; si cabe en GPUs de 32 GB o mas (p. ej., algunas variantes de workstation).
- Opciones de despliegue: xyntetik-runner (motor recomendado, compatible CPU/CUDA/Metal), llama.cpp, Ollama (si soporta el modelo base), y cualquier runtime GGUF con soporte para muse-glimmer.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime. En CPU, se espera una latencia alta para un modelo de 30B; en GPU A100, la generacion deberia ser fluida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano archivo | Cuantizacion | Fidelidad vs padre | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (padre BF16) | 30B | 51,90 GB | BF16 | 100 % (referencia) | Apache-2.0 |
| Este artefacto (Q8_0 quirurgico) | 27,85B efectivos (6,34 % eliminado) | 27,58 GB | Q8_0 | KLD 0,03883, top-1 98,34 % | Apache-2.0 |
| Muse-Glimmer-30B-Surgical-Q4_K-GGUF | 30B (4,75 % eliminado) | 14,61 GB | Q4_K | no disponible | Apache-2.0 |
| Muse-Glimmer-30B (GGUF oficial de Meta, k-quant 4-bit) | 30B | 16,8 GB | 4-bit k-quant | no disponible | Apache-2.0 |

La comparativa muestra que este artefacto ofrece un equilibrio entre tamano y fidelidad: es mas grande que el Q4_K pero conserva mejor el comportamiento del original. Frente al GGUF oficial de Meta en 4-bit, este Q8_0 quirurgico es mas fiel pero ocupa mas espacio.

## Limitaciones y advertencias

- La cirugia elimina un 6,34 % del decoder; aunque la fidelidad es alta, puede haber degradacion sutil en tareas que dependen fuertemente de las capas eliminadas, no detectada por las metricas globales.
- No se incluye el encoder de vision ni el proyector multimodal en este artefacto; si se necesita comprension de imagenes, hay que usar el modelo base completo o el GGUF de bartowski con mmproj.
- La longitud de contexto no esta documentada; se recomienda verificar antes de usarlo en tareas de contexto largo.
- Los idiomas soportados no estan especificados; el modelo base de Meta probablemente soporta multiples idiomas, pero no hay confirmacion para este artefacto.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la cirugia no lo mitiga.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base de Meta tambien la tenga (asi consta en la model card).
- Para produccion, se recomienda validar el comportamiento en el dominio especifico, ya que las metricas de fidelidad se midieron en un split held-out y pueden no reflejar todos los escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q8_0-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- GGUF del modelo base (bartowski): https://huggingface.co/bartowski/Muse-Glimmer-30B-GGUF
- Motor xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Documento de certificacion del modelo base: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/muse-glimmer-cert-2026-08-11.md
- Tutorial de ejecucion local (DataCamp): https://www.datacamp.com/tutorial/how-to-run-muse-glimmer-30b-locally
- Pagina de Ollama para muse-glimmer: https://ollama.com/library/muse-glimmer:30b
