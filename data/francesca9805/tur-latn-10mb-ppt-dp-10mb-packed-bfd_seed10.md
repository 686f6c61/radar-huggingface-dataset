# francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/tur_latn_10mb`, un transformer de tipo GPT-2 de pequeno tamano orientado al turco escrito en alfabeto latino. El ajuste lo ha realizado el usuario de HuggingFace `francesca9805` mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0, y esta vinculado a una ejecucion de Weights & Biases del proyecto `new-tokenizers` de la Universidad de Groningen. El nombre del repositorio sugiere un experimento sobre tokenizacion y empaquetado de datos (`10mb-packed`, `seed10`), no un modelo de proposito general listo para produccion.

El modelo tiene 39.087.104 parametros totales (unos 39 millones) y un peso en disco de aproximadamente 0,1 GB en precision completa, por lo que es un modelo muy ligero que puede ejecutarse en CPU o en cualquier GPU de consumo. Se distribuye en formato safetensors bajo la libreria transformers, con pipeline `text-generation`, y es compatible con Text Generation Inference y con endpoints de Inferencia. No se publican datos de licencia efectiva, idiomas declarados, longitudes de contexto ni resultados de benchmarks en la model card: se trata de un artefacto de investigacion con documentacion minima.

Su relevancia actual es acotada y fundamentalmente academica: sirve como ejemplo reproducible de un pipeline de ajuste fino con TRL sobre un corpus de 10 MB, y como punto de partida para estudiar el efecto del tokenizador y del empaquetado de secuencias en lenguas de bajos recursos como el turco. No es un modelo comparable en capacidad a los LLM actuales de cientos de miles de millones de parametros, y no deberia evaluarse con los mismos criterios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun los tags del repositorio) |
| Parametros totales | 39.087.104 (aprox. 39 M, dato real de safetensors) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (no confirmado en la informacion; la configuracion GPT-2 de referencia usa 1024 tokens) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible en la model card; el nombre del modelo base (`tur_latn`) indica turco en alfabeto latino |
| Licencia | no disponible (el campo de la model card contiene el valor generico `license`, sin texto legal) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/tur_latn_10mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Libreria | transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Autor | francesca9805 |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es GPT-2, es decir, un transformer decoder-only con atencion causal, normalizacion previa y embeddings posicionales aprendidos. Al derivar de `goldfish-models/tur_latn_10mb`, hereda la configuracion de los modelos Goldfish, una familia de modelos multilingues de investigacion entrenados con corpus de aproximadamente 10 MB por idioma y disenados para lenguas de bajos recursos. Con 39 millones de parametros, el modelo se situa muy por debajo de GPT-2 small (124 M) en presupuesto de capacidad, lo que limita drasticamente su habilidad para retener conocimiento factual y para mantener coherencia en generaciones largas.

El entrenamiento se realizo mediante SFT con TRL, segun la model card, y esta registrado en una ejecucion de Weights & Biases del proyecto `new-tokenizers` (Universidad de Groningen). El nombre del checkpoint incluye las etiquetas `ppt`, `Dp-10mb`, `10mb-packed` y `bfd_seed10`, que apuntan a un experimento controlado sobre empaquetado de secuencias (`packing`), presupuesto de datos y semilla aleatoria; todo ello es consistente con un estudio metodologico sobre tokenizacion y eficiencia de datos, no con un entrenamiento orientado a producto. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO o ajuste por preferencias. Tampoco se describe ninguna innovacion tecnica en inferencia, como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, en el rango propio de un modelo GPT-2 de 39 M de parametros.
- Ajuste por instrucciones (SFT): el ejemplo de la model card usa una lista de mensajes con rol `user`, lo que indica un formato conversacional de un solo turno.
- Generacion en turco (latino), segun la ascendencia del modelo base; no hay confirmacion explicita de otros idiomas.
- Integracion directa con el pipeline `text-generation` de transformers.
- Compatibilidad declarada con text-generation-inference y con endpoints de Inferencia de HuggingFace.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- No se documenta ventana de contexto extendida ni capacidades de recuperacion o RAG nativas.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo sirve como referencia para replicar el efecto del empaquetado de secuencias y de la tokenizacion sobre un corpus turco de 10 MB, comparando contra la misma receta con otra semilla (`seed10` es parte del identificador).
- Estudio de lenguas de bajos recursos: permite analizar como se comporta un transformer de 39 M de parametros cuando solo dispone de 10 MB de texto turco, un escenario habitual en idiomas con poca presencia digital.
- Docencia y practicas de ajuste fino: es un caso util para ensenar un flujo completo con TRL, transformers y Weights & Biases, incluyendo registro de metricas y publicacion en el Hub.
- Pruebas unitarias de infraestructura de despliegue: su tamano (0,1 GB) permite validar pipelines de TGI, endpoints de Inferencia o servicios propios sin consumir GPU, comprobando carga de safetensors, plantillas de chat y formato de salida.
- Generacion de texto auxiliar en turco a muy pequeña escala, por ejemplo completar fragmentos cortos o generar variaciones de plantillas, siempre con revision humana y sin expectativas de calidad alta.
- Investigacion sobre destilacion y comparacion de tokenizadores: al compartir arquitectura y corpus con otros checkpoints derivados de la familia Goldfish, facilita medir el impacto de distintas decisiones de preprocesado.
- Experimentos de evaluacion de alucinacion en modelos pequeños: es un sujeto util para cuantificar como un presupuesto minimo de parametros y datos afecta a la fidelidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica sobre este checkpoint (los resultados obtenidos corresponden a rutas de transporte entre Annecy y Tours y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,16 GB solo para los pesos (39 M x 4 bytes), mas activaciones y cache KV, en la practica menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,08 GB para los pesos; inferencia viable incluso en GPUs integradas.
- CPU: ejecucion totalmente viable, con latencias de decenas de milisegundos por token en hardware moderno; no requiere acelerador.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3060, RTX 4090, A100, H100). El modelo esta enormemente infrautilizado en GPUs de datacenter.
- Cabe holgadamente en cualquier GPU de consumo e incluso en moviles o entornos embebidos, dado su tamano de 0,1 GB.
- Opciones de despliegue: transformers (pipeline de text-generation), Text Generation Inference (declarado como compatible en los tags), endpoints de Inferencia de HuggingFace, y servidores propios en PyTorch. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion manual previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10 | 39,09 M | no disponible | no disponible | no disponible | Hub de HuggingFace, safetensors |
| goldfish-models/tur_latn_10mb (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hub de HuggingFace |
| Otros checkpoints derivados de Goldfish con distinta semilla o empaquetado | del orden de decenas de millones | no disponible | no disponible | no disponible | Hub de HuggingFace |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion defendible con la informacion disponible es la del modelo con su propio modelo base, `goldfish-models/tur_latn_10mb`, del que difiere por el ajuste SFT y por la configuracion de datos de entrenamiento; el efecto concreto de ese ajuste no esta medido en la documentacion publicada.

## Limitaciones y advertencias

- Tamano muy reducido (39 M de parametros): la capacidad de razonamiento, el conocimiento factual y la coherencia a largo plazo son muy limitados; no es adecuado para tareas que exijan precision.
- Riesgo elevado de alucinacion: con un corpus de entrenamiento del orden de 10 MB, el modelo no puede haber memorizado conocimiento factual fiable.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o representacion; los corpus pequenos de origen web tienden a amplificar los sesgos presentes en la fuente.
- Cobertura idiomatica restringida: el nombre apunta a turco en alfabeto latino, pero la model card no declara idiomas; el comportamiento en castellano o en otras lenguas no esta verificado y previsiblemente sera deficiente.
- Contexto: la longitud de contexto no esta documentada; no se debe asumir una ventana larga ni usarla para conversaciones multi-turno extensas.
- Licencia: el campo de licencia contiene el valor generico `license`, sin texto legal asociado, por lo que no hay autorizacion explicita de uso comercial. Conviene contactar con el autor o con los responsables del modelo base antes de cualquier uso en produccion.
- Documentacion insuficiente: no constan datos de entrenamiento, numero de tokens, composicion del dataset, hiperparametros ni evaluacion. La reproducibilidad exacta no esta garantizada.
- Artefacto de investigacion: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento ni de soporte.
- Advertencia sobre la busqueda web: los resultados recuperados no tienen relacion con el modelo y no aportan informacion tecnica adicional; no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/tur_latn_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/8qrdergd
- Repositorio de TRL: https://github.com/huggingface/trl
- Citacion de TRL (von Werra et al., 2020): incluida en la model card del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a rutas de transporte y se descartan
