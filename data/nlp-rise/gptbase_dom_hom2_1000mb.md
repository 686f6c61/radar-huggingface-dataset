# NLP-RISE/gptbase_dom_hom2_1000mb

## Resumen

`NLP-RISE/gptbase_dom_hom2_1000mb` es un modelo de lenguaje de tipo GPT-2 desarrollado por el grupo NLP-RISE, derivado de la familia GPT-2 y entrenado presumiblemente desde cero o mediante ajuste sobre un corpus multilingue. El identificador sugiere un entrenamiento orientado a lenguas romanicas (`dom`/`hom` como posibles etiquetas de configuracion experimental y `1000mb` como referencia al volumen de datos o al checkpoint). Con 124,7 millones de parametros, se situa en la misma escala que GPT-2 small.

El modelo esta etiquetado para frances, espanol, portugues, italiano y gallego, lo que lo hace relevante para experimentacion en procesamiento de lenguas romanicas de bajos recursos como el gallego, poco cubierto por los modelos multilingues comerciales. Su publicacion en Hugging Face con acceso restringido (gated) y la ausencia de una model card detallada limitan su evaluacion directa, pero su interes reside en ser un checkpoint abierto, pequeno y desplegable en hardware modesto.

La informacion disponible es escasa: no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni condiciones de licencia. Esta ficha refleja exclusivamente los datos verificables del repositorio y las caracteristicas inferibles de la arquitectura GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los checkpoints GPT-2 estandar usan 1024 tokens; no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion a 8 y 4 bits via herramientas genericas) |
| Idiomas soportados | frances (fr), espanol (es), portugues (pt), italiano (it), gallego (gl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 124,7 millones de parametros, equivalente en escala a GPT-2 small (12 capas, 768 dimensiones de embedding y 12 cabezas de atencion en la configuracion canonica, aunque la configuracion exacta de este checkpoint no se detalla en la informacion disponible). El tag `generated-from-wandb` indica que el checkpoint se genero y sincronizo automaticamente desde un experimento registrado en Weights & Biases, lo que sugiere un flujo de entrenamiento experimental o de investigacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El sufijo `1000mb` podria referirse al tamano del corpus de entrenamiento (aproximadamente 1 GB de texto) o al checkpoint, pero esto no esta confirmado. El tag `gptbase` sugiere un modelo base sin ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en cinco lenguas romanicas (fr, es, pt, it, gl).
- Modelo base sin ajuste por instrucciones: no se espera un comportamiento fiable de seguimiento de instrucciones ni de dialogo.
- Capacidad de continuacion de texto y modelado del lenguaje, adecuada para ajuste fino posterior.
- Soporte multilingue limitado a las cinco lenguas etiquetadas; no se documenta cobertura de otras lenguas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Investigacion en lenguas romanicas de bajos recursos: el modelo puede servir como base para experimentos de modelado del lenguaje en gallego, una lengua con escasa representacion en modelos abiertos, permitiendo medir perplejidad y ajustar sobre corpus especificos.
- Ajuste fino para clasificacion de texto: con 124,7 millones de parametros, es viable anadir una cabeza de clasificacion y entrenar sobre tareas como analisis de sentimiento o deteccion de temas en espanol, portugues o italiano con recursos modestos.
- Generacion de texto experimental: continuacion de textos en las cinco lenguas para estudiar sesgos, calidad y coherencia de modelos pequenos multilingues.
- Destilacion y experimentacion academica: su tamano reducido permite entrenar y evaluar variantes rapidamente, sirviendo como baseline en comparaciones con modelos mayores.
- Prototipado de pipelines de NLP: integrable en entornos de investigacion con una sola GPU consumer para validar arquitecturas antes de escalar a modelos mayores.
- Reproduccion de experimentos: al estar sincronizado desde Weights & Biases, resulta util para reproducir y auditar experimentos de entrenamiento registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (124,7 M de parametros a 4 bytes); con activaciones y overhead, alrededor de 1-2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos; en cuantizacion a 8 bits, unos 0,13 GB; a 4 bits, unos 0,07 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), llama.cpp y Ollama requieren conversion a GGUF; vLLM y TGI son compatibles con arquitecturas GPT-2, aunque para este tamano la ganancia de throughput es limitada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en milisegundos por token en GPU moderna, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NLP-RISE/gptbase_dom_hom2_1000mb | 124,7 M | no disponible | fr, es, pt, it, gl | no disponible | Gated en Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | principalmente ingles | MIT | Abierto |
| GPT-2 multilingual (varios checkpoints comunitarios) | ~124 M | 1024 | multilingue variable | variable | Abierto |
| modelos romanicos pequenos de la comunidad (p. ej., variantes GPT-2 para es/pt) | ~100-150 M | 1024 | es, pt | variable | Abierto |

La comparativa se limita a la escala y la familia arquitectonica, ya que no hay datos de rendimiento publicados para este checkpoint. Frente a GPT-2 small, la diferencia principal es la orientacion multilingue romanica; frente a otros modelos comunitarios, la cobertura del gallego es el rasgo diferenciador, aunque la falta de licencia y de acceso abierto condiciona su uso.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar o impedir el uso automatizado.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Modelo base sin ajuste por instrucciones: no es adecuado para tareas de dialogo o seguimiento de instrucciones sin ajuste fino previo.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, propio de modelos de 124 M de parametros.
- Sesgos desconocidos: no se documenta la composicion del corpus ni procesos de filtrado, por lo que pueden persistir sesgos de genero, etnicos o culturales.
- Cobertura limitada a cinco lenguas; el rendimiento en cada una no esta medido y podria ser desigual.
- Longitud de contexto no confirmada: asumir 1024 tokens solo si se verifica en la configuracion del checkpoint.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/NLP-RISE/gptbase_dom_hom2_1000mb
- Perfil del autor: https://huggingface.co/NLP-RISE
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
