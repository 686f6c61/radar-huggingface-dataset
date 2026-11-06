# MstJeon410/sn92-gen-merge1

## Resumen

SN92 generalist entry (identificador `MstJeon410/sn92-gen-merge1`) es un ajuste fino del modelo base `baselabs/mammoth-1`, publicado por el usuario MstJeon410 bajo licencia MIT. El modelo se presenta como una "entrada generalista" dentro de un ecosistema etiquetado como `sn92` y `decision-model`, y emplea el denominado "REAX joint-readout layout", que combina un backbone `Qwen3_5Model` con una cabeza de lectura (readout head) adicional. El checkpoint contiene 26.085.330.160 parametros en formato safetensors y ocupa 52,2 GB en el repositorio.

La relevancia de este modelo es limitada y de nicho: se trata de un fine-tune experimental con muy poca traccion (22 descargas y ninguna interaccion en el momento de la consulta), sin model card detallada, sin datos de benchmarks publicados y sin especificacion de idiomas soportados. Su interes tecnico radica en la arquitectura hibrida backbone + readout orientada a tareas de decision, y en que parte de un modelo base poco comun (`baselabs/mammoth-1`), lo que lo hace relevante para quienes investigan layouts de readout conjunto o quieran reproducir el pipeline de ajuste.

No obstante, la ausencia de documentacion sobre datos de entrenamiento, proceso de alineacion (RLHF/DPO), evaluaciones y limitaciones hace que no sea recomendable para despliegues en produccion sin una evaluacion propia exhaustiva. La licencia MIT facilita su uso comercial, pero la falta de garantias tecnicas traslada todo el riesgo al integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3_5Model con cabeza de readout (REAX joint-readout layout) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se describe como un fine-tune de `baselabs/mammoth-1` (commit `61cec44c281c693992e3d6ebeb44dd3402dfa186`) en el layout "REAX joint-readout", que combina un backbone `Qwen3_5Model` con una cabeza de lectura adicional. Esta estructura sugiere un diseno en el que las representaciones del backbone se proyectan a traves de una cabeza especifica para producir una salida de decision, en lugar de (o ademas de) la cabeza de lenguaje estandar. La model card remite a los ficheros `MODIFICATIONS.md`, `NOTICE` y `LICENSE` para detalles sobre los cambios respecto al modelo base, pero no se proporciona en la informacion disponible el contenido de dichos ficheros.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de etapas de RLHF, DPO u otra alineacion, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se especifica si el fine-tune congela el backbone o entrena la totalidad de los 26.000 millones de parametros. Toda esta informacion debe considerarse no disponible y requeriria consultar el repositorio o contactar con el autor.

## Capacidades

- Generacion de texto y modelado de lenguaje: heredadas del backbone Qwen3_5Model, aunque no se documenta su calidad ni el contexto maximo efectivo.
- Salida orientada a decision: la presencia de una "readout head" en el layout REAX sugiere capacidad para producir decisiones o clasificaciones a partir de representaciones del backbone; el formato exacto de salida no esta documentado.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre layouts de readout: el modelo sirve como referencia reproducible para estudiar como una cabeza de lectura adicional sobre un backbone Qwen3_5Model afecta a las representaciones internas y a las decisiones derivadas.
- Experimentos de ajuste fino sobre `baselabs/mammoth-1`: util para comparar el comportamiento del modelo base frente a esta variante fine-tuneada en tareas controladas de laboratorio.
- Clasificacion o enrutamiento experimental: si la readout head produce logits de decision, podria emplearse en prototipos de enrutamiento de consultas o clasificacion de intenciones, siempre con validacion propia.
- Base para nuevos fine-tunes: al estar bajo licencia MIT y en safetensors, puede servir como punto de partida para ajustes adicionales en proyectos de investigacion.
- Evaluacion comparativa de checkpoints: util en pipelines internos que comparen variantes de un mismo linaje de modelos para seleccionar el mejor candidato antes de invertir en evaluacion a gran escala.
- Docencia y formacion: ejemplo practico de modelo hibrido backbone + readout para explicar arquitecturas de decision en cursos o talleres.

En todos los casos, la ausencia de benchmarks y de documentacion de entrenamiento obliga a realizar una evaluacion propia antes de cualquier uso serio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren GPUs con 80 GB o configuraciones multi-GPU.
- Cuantizacion a 8 bits: en torno a 26-28 GB de pesos, viable en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantizacion a 4 bits: en torno a 13-15 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se publican variantes GGUF/AWQ/GPTQ y habria que generarlas.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para fp16; A100 40 GB o H100 40 GB para 8 bits; RTX 4090/3090 para 4 bits con cuantizacion propia.
- Opciones de despliegue: al ser safetensors con backbone tipo Qwen, es previsible su carga con vLLM o TGI si el layout es compatible, y con llama.cpp/Ollama solo tras conversion a GGUF; ninguna de estas rutas esta documentada ni validada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MstJeon410/sn92-gen-merge1 | 26,1 B | no disponible | MIT | Hugging Face, 22 descargas | Fine-tune experimental con readout head; sin benchmarks |
| baselabs/mammoth-1 (modelo base) | no disponible en la informacion | no disponible | no disponible | Hugging Face | Modelo de partida del fine-tune; sin datos de rendimiento en la informacion |
| Qwen3.5 (familia de backbone) | no disponible en la informacion | no disponible | no disponible | Hugging Face | Backbone subyacente segun la model card; sin datos verificados en la informacion |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.), por lo que su calidad es desconocida.
- Documentacion minima: la model card remite a ficheros (`MODIFICATIONS.md`, `NOTICE`, `LICENSE`) cuyo contenido no se incluye en la informacion disponible.
- Idiomas no declarados: se desconoce si el modelo esta optimizado para castellano, ingles u otras lenguas, y su comportamiento multilingue no esta validado.
- Riesgo de alucinacion: al no documentarse el proceso de alineacion ni el dataset, no puede descartarse un riesgo elevado de alucinaciones y respuestas incoherentes.
- Sesgos desconocidos: sin informacion sobre la composicion de los datos de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Contexto maximo no especificado: impide planificar aplicaciones que dependan de ventanas largas.
- Compatibilidad de despliegue no validada: el layout con readout head puede no ser directamente compatible con servidores de inferencia estandar (vLLM, TGI), lo que exigiria trabajo de integracion.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda revisar los ficheros `NOTICE` y `LICENSE` del repositorio para confirmar obligaciones de atribucion respecto al modelo base.
- Madurez: con 22 descargas y cero interacciones, es un artefacto experimental sin comunidad ni soporte; no apto para produccion sin evaluacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MstJeon410/sn92-gen-merge1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Commit del modelo base referenciado en la model card: `61cec44c281c693992e3d6ebeb44dd3402dfa186` (consultable en el repositorio de `baselabs/mammoth-1`)
- Ficheros de referencia citados en la model card: `MODIFICATIONS.md`, `NOTICE` y `LICENSE` (disponibles en el repositorio del modelo)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
