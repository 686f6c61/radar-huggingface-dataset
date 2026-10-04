# ruizmi-chelle/retrieval-run2

## Resumen

`ruizmi-chelle/retrieval-run2` es un repositorio de código y pesos de inicialización que implementa una arquitectura BEiT en configuración *base* orientada a tareas de *retrieval* (recuperación). Lo publica el usuario ruizmi-chelle bajo licencia Apache 2.0 y su propósito declarado es servir como implementación transparente con pruebas de humo repetibles, no como un modelo entrenado listo para producción. La model card indica explícitamente que el checkpoint `model.safetensors` es una inicialización válida para *smoke tests* y que no se presenta como un checkpoint evaluado en ningún benchmark.

El modelo se apoya en varias decisiones arquitectónicas poco habituales en un BEiT estándar: atención lineal, fusión mediante descomposición de Tucker, activación aproximada de GELU y normalización por *batchnorm*. La receta de experimento por defecto usa el optimizador Adafactor con un *schedule* exponencial. Los metadatos de HuggingFace reportan 16.576 parámetros totales en el campo de safetensors, una cifra extraordinariamente baja que no está confirmada ni desarrollada en la model card; el tamaño del repositorio aparece como 0,0 GB.

Su relevancia actual es limitada y de carácter metodológico: sirve como punto de partida reproducible para quien quiera entrenar y evaluar un sistema de recuperación multimodal con una receta concreta, y como recordatorio de buenas prácticas de evaluación (misma exposición de datos, mismo presupuesto de ajuste y varias semillas aleatorias para todas las líneas base). No es un modelo generativo, no es un LLM y no debe tratarse como un artefacto listo para *fine-tuning* de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (configuracion base), atencion lineal, fusion Tucker, activacion approx GELU, normalizacion batchnorm |
| Parametros totales | 16.576 (dato del campo de safetensors en HuggingFace; no confirmado ni desglosado en la model card) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion), con codigo PyTorch (`pipeline.py`) |

## Arquitectura y entrenamiento

La arquitectura es un BEiT en escala *base* con atención lineal en lugar de atención cuadratica completa, fusion de caracteristicas mediante descomposicion de Tucker, activacion aproximada de GELU y normalizacion por lotes. La combinacion de fusion Tucker con un objetivo de *retrieval* y la recomendacion de evaluar sobre Flickr30k apunta a un escenario multimodal texto-imagen, aunque la model card no explicita la modalidad ni la composicion exacta de las entradas. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No hay evidencia de entrenamiento completado: el autor indica que los valores de Adafactor y del *schedule* exponencial son puntos de partida del script y no prueba de una ejecucion finalizada, y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Tampoco se documentan el numero de tokens o muestras, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La unica guia de evaluacion aportada sugiere usar Flickr30k, reportar la metrica de la tarea en al menos tres semillas e incluir una linea base de capacidad equivalente.

## Capacidades

- Recuperacion multimodal (presumiblemente texto-imagen, dado el contexto de Flickr30k): el codigo implementa un pipeline de *retrieval*, no de generacion.
- Extraccion de representaciones: al ser un BEiT, la salida esperada son *embeddings* o puntuaciones de similitud, no texto generado.
- Pruebas de humo de infraestructura: el script `pipeline.py` permite validar que el entorno de PyTorch carga el modelo y ejecuta un ejemplo minimo.
- Reproducibilidad de recetas: `training_args.json` permite replicar la configuracion por defecto (Adafactor, schedule exponencial).
- Generacion de texto: no soportada.
- Razonamiento, matematicas y codigo: no soportados.
- *Tool calling* / *function calling*: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles ni documentadas.
- Capacidades especiales (modo *thinking*, vision, audio): la vision es plausible por tratarse de un BEiT, pero no esta confirmada en la documentacion; no hay soporte de audio.

## Casos de uso

- Reproduccion de una receta de recuperacion multimodal: el repositorio proporciona configuracion y argumentos de entrenamiento para lanzar un experimento desde cero sobre un corpus propio, usando Adafactor y schedule exponencial como punto de partida.
- Evaluacion comparativa sobre Flickr30k: la model card recomienda explicitamente esta tarea, reportando la metrica principal en al menos tres semillas y con una linea base de capacidad equivalente, lo que lo hace util como esqueleto de protocolo experimental.
- Pruebas de humo en infraestructura de entrenamiento: `python pipeline.py --help` y el bloque `__main__` permiten verificar que CUDA, PyTorch y el cargador de safetensors funcionan antes de lanzar un trabajo costoso.
- Estudio de fusion Tucker en recuperacion: al ser una implementacion concreta, sirve para medir el efecto de la fusion por descomposicion de Tucker frente a concatenacion o atencion cruzada en una tarea de retrieval.
- Investigacion sobre atencion lineal en vision: permite experimentar con el reemplazo de atencion cuadratica por atencion lineal en un backbone tipo BEiT y medir el impacto en precision y coste.
- Base para un adaptador propio: dado que las APIs genericas de carga automatica requieren un adaptador explicito, el repositorio sirve como plantilla para integrar esta arquitectura en un framework interno de experimentacion.
- Docencia y auditoria de codigo: al ser codigo transparente y con pesos de inicializacion, es adecuado para revisar como se estructura un pipeline de retrieval de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card omite deliberadamente cualquier afirmacion de rendimiento y declara que `model.safetensors` no es un checkpoint evaluado. No se dispone de cifras de MMLU, HumanEval, GSM8K, Recall@K sobre Flickr30k ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Con el recuento de parametros reportado (16.576), el checkpoint ocuparia del orden de decenas de kilobytes en fp32, muy por debajo de 0,1 GB; el tamanio de repositorio indicado (0,0 GB) es coherente con un artefacto minimo.
- GPU recomendadas: no se especifican. Por el tamanio del artefacto, cualquier GPU seria suficiente; el cuello de botella real dependera del modelo que se entrene a partir de esta receta.
- Ejecucion en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en CPU, siempre que el recuento de parametros sea el reportado. Si el modelo entrenado final escala a una configuracion BEiT-base completa, el requisito tipico pasaria a varios GB en fp32 y alrededor de 1-2 GB en fp16, pero esto no esta confirmado por el autor.
- Opciones de despliegue: no compatible con vLLM, Ollama, TGI ni llama.cpp, ya que no es un modelo causal de lenguaje. El despliegue requiere `pipeline.py` y un adaptador explicito para APIs de carga automatica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada, y el propio autor no declara resultados, por lo que cualquier comparacion cuantitativa seria especulativa. A modo de contexto no verificado, se indican alternativas habituales de la misma categoria (recuperacion multimodal) y sus caracteristicas arquitectonicas conocidas, que deben confirmarse en sus fuentes originales:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ruizmi-chelle/retrieval-run2 | BEiT base, atencion lineal, fusion Tucker | 16.576 (segun safetensors, no confirmado) | no disponible | Apache 2.0 | Checkpoint de inicializacion, sin entrenar |
| BEiT original (base) | Vision transformer con preentrenamiento enmascarado | ~86 M (dato de la literatura, no verificado aqui) | no aplica (imagen) | MIT (repositorio original) | Modelo preentrenado publicado |
| CLIP (ViT-B/32) | Doble codificador vision-texto con atencion completa | ~151 M (dato de la literatura, no verificado aqui) | 77 tokens de texto | MIT (repositorio original) | Modelo entrenado y evaluado |
| SigLIP | Doble codificador vision-texto con perdida sigmoide | ~93 M en la variante base (dato de la literatura, no verificado aqui) | no disponible | Apache 2.0 (variantes) | Modelo entrenado y evaluado |

Las cifras de los modelos comparativos proceden de conocimiento general, no de la busqueda web realizada, y no deben tomarse como datos verificados en esta ficha.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier uso que espere representaciones utiles fallara hasta que se entrene con datos propios.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, segun declara el propio autor.
- No se documentan sesgos, pero al no existir datos de entrenamiento publicados tampoco pueden evaluarse.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es producir similitudes o recuperaciones sin fundamento.
- No hay informacion sobre idiomas soportados ni sobre cobertura linguistica de los datos previstos.
- No se documenta la longitud de contexto, lo que impide planificar escenarios con secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial del codigo y los pesos, pero el autor advierte de que deben revisarse por separado los terminos de las fuentes de datos externas que se utilicen con el repositorio.
- Las APIs genericas de carga automatica no funcionan sin un adaptador explicito, lo que anade trabajo de integracion.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada de los valores por defecto incluidos en el repositorio.
- El recuento de parametros reportado (16.576) es inconsistente con la escala declarada (*base*) y no esta explicado; conviene verificarlo antes de cualquier planificacion de recursos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ruizmi-chelle/retrieval-run2
- Perfil del autor en HuggingFace: https://huggingface.co/ruizmi-chelle
- Hugging Face (portal general): https://huggingface.co/
- La busqueda web no ha devuelto papers, blogs, repositorios ni demos especificos de este modelo. Los unicos resultados adicionales son herramientas genericas de comprobacion de hardware y comparacion de modelos, sin relacion directa con este repositorio: https://llmrun.dev/, https://benchlm.ai/, https://runlocalmodel.com/
