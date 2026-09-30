# francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10` es un ajuste fino de tipo supervisado (SFT) sobre el modelo base `goldfish-models/swa_latn_10mb`, un modelo monolingue de la familia Goldfish orientado al swahili en escritura latina. Lo desarrolla el usuario de HuggingFace `francesca9805` y se ha entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1. Se trata de un modelo pequeno: 39.087.104 parametros totales (unos 39 millones), lo que lo situa en la gama de los GPT-2 pequenos y permite ejecutarlo incluso en CPU.

El interes de este artefacto es fundamentalmente de investigacion: por la nomenclatura del identificador (`10mb`, `100mb-packed`, `Dp`, `bfd`, `iso`, `seed10`) y por la existencia de variantes hermanas con otras semillas (`seed455`) y otros idiomas (`jpn-jpan`), parece formar parte de una rejilla de experimentos de ablacion sobre tamano de datos, hiperparametros y semillas aleatorias. No es un modelo de proposito general ni compite con los LLM actuales, sino una pieza de reproducibilidad para estudiar el ajuste fino en lenguas de bajos recursos.

La relevancia actual es acotada pero real: los modelos Goldfish y sus derivados son utiles para la investigacion en PLN de bajos recursos, donde hay pocos corpus y los modelos grandes no estan bien cubiertos. Este modelo concreto aporta un punto de datos reproducible para comparar tecnicas de SFT y de empaquetado de datos en un idioma y un tamano poco representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (etiqueta `gpt2` en Transformers) |
| Parametros totales | 39.087.104 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos `safetensors`) |
| Idiomas soportados | no disponibles (el modelo base `goldfish-models/swa_latn_10mb` esta entrenado en swahili, escritura latina) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/swa_latn_10mb |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura es una transformer causal de tipo GPT-2, segun la etiqueta declarada en la model card y en las etiquetas de Transformers. Con 39 millones de parametros, corresponde a la clase de los GPT-2 pequenos (GPT-2 small tiene 124 millones; este es aun menor). El modelo se ha obtenido por ajuste fino del base `goldfish-models/swa_latn_10mb` mediante SFT, la tecnica de ajuste supervisado implementada por TRL en su version 0.23.0. No se documenta el uso de RLHF, DPO u otras etapas de alineacion posteriores.

La informacion facilitada no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset, la receta de limpieza ni los hiperparametros concretos. El identificador sugiere un corpus empaquetado de en torno a 100 MB (`100mb-packed`) y un punto de partida de 10 MB (`10mb`), pero estos valores no estan confirmados en la documentacion. Tampoco se declara ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.); se trata de un fine-tuning convencional con el stack estandar de HuggingFace. Los enlaces a Weights & Biases permiten consultar la curva de entrenamiento del experimento asociado.

## Capacidades

- Generacion de texto autoregresiva en el idioma y el dominio para el que fue ajustado (presumiblemente swahili, dado el modelo base), sin garantia de coherencia mas alla de fragmentos cortos.
- Formato de instrucciones de tipo conversacional: la model card muestra un ejemplo con `pipeline("text-generation")` que pasa una lista con el rol `user`.
- Compatible con `text-generation-inference` y con `endpoints_compatible`, segun las etiquetas del repositorio.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue: el modelo base es monolingue.
- No se declara modo de razonamiento explicito (`thinking mode`), vision ni audio.
- Capacidad principal realista: servir como modelo de investigacion y como punto de partida para ajustes posteriores, no como asistente de produccion.

## Casos de uso

- Investigacion en PLN de bajos recursos: permite reproducir y comparar experimentos de ajuste supervisado sobre swahili con un presupuesto minimo de computo, algo relevante en lenguas con pocos corpus anotados.
- Estudios de ablacion y reproducibilidad: al existir variantes con otras semillas y otros tamanos de datos, facilita analisis controlados de la varianza debida a la semilla (`seed10`, `seed455`) y al volumen de datos.
- Punto de partida para fine-tuning posterior: por su tamano reducido, se puede continuar el entrenamiento con SFT, LoRA o DPO en una unica GPU de consumo o incluso en CPU, sin costes elevados.
- Validacion de pipelines de TRL: sirve como banco de pruebas para verificar integraciones de `transformers`, `trl`, `datasets` y `tokenizers` con versiones concretas (TRL 0.23.0, Transformers 4.56.2).
- Docencia y formacion: su tamano (39 M de parametros, 0,1 GB de repositorio) permite explicar el ciclo completo de ajuste fino en clase sin infraestructura especializada.
- Despliegue en entornos con recursos minimos: puede ejecutarse en un contenedor pequeno o en un dispositivo con RAM limitada para demostraciones de generacion de texto a baja escala.
- Generacion de texto experimental en swahili: util para prototipos y para medir perplejidad o calidad linguistica en un dominio acotado, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra, y la busqueda web solo devuelve enlaces de uso y de despliegue (HuggingFace, FriendliAI, LLM Explorer, free2aitools), sin cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (39,09 M de parametros; calculo orientativo sobre el peso del modelo): aproximadamente 156 MB en FP32, unos 78 MB en FP16/BF16 y unos 39 MB en INT8. Hay que sumar el coste del contexto y de las activaciones, que en este tamano es pequeno.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1060, RTX 3060, RTX 4090, e incluso en GPUs integradas o en CPU.
- No requiere GPU dedicada: es viable la inferencia en CPU, en un portatil o en dispositivos tipo Raspberry Pi para pruebas.
- Opciones de despliegue: `transformers` (pipeline de text-generation, tal como documenta la model card), `text-generation-inference` (etiqueta `text-generation-inference`), `endpoints_compatible`, y vLLM. Para `llama.cpp` u Ollama habria que convertir previamente los pesos a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10` | 39,09 M | no disponible | GPT-2 ajustado con SFT | no disponible | Objeto de esta ficha |
| `goldfish-models/swa_latn_10mb` | no disponible | no disponible | Modelo base monolingue (swahili) | no disponible | Modelo del que deriva este ajuste |
| `francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455` | no disponible | no disponible | GPT-2 ajustado con SFT | no disponible | Variante hermana con otra semilla |
| `francesca9805/jpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed10` | 124,8 M (segun LLM Explorer) | no disponible | GPT-2 ajustado con SFT | no disponible | Variante de la misma familia para japones |

La comparacion se limita a variantes de la misma familia experimental; no se dispone de datos de benchmarks que permitan contrastar el rendimiento con alternativas de otros autores.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no deberia usarse en produccion sin una evaluacion propia.
- Tamano muy reducido (39 M de parametros): la coherencia y el conocimiento factual seran limitados, con alta probabilidad de repeticiones, incoherencias y degradacion rapida en generaciones largas.
- Riesgo elevado de alucinacion: al ser un modelo pequeno y presumiblemente entrenado con pocos datos, puede generar afirmaciones falsas con aparente fluidez.
- Cobertura idiomatica restringida: no se declaran idiomas; el modelo base esta orientado al swahili, por lo que el rendimiento en castellano u otros idiomas es impredecible.
- Longitud de contexto no declarada: se desconoce la ventana real del base y si el ajuste la ha modificado, lo que dificulta planificar tareas de contexto largo.
- Licencia no disponible: al no especificarse, no puede asumirse permiso para uso comercial ni redistribucion; conviene consultar con el autor antes de cualquier uso externo.
- Origen experimental: la nomenclatura indica que forma parte de una rejilla de experimentos con semillas e hiperparametros; puede no haber sido validado mas alla del proposito de investigacion.
- Fecha de publicacion futura en los metadatos (2026-09-30): puede tratarse de un error de la plataforma o de un artefacto de la propia configuracion del repositorio, lo que refuerza la cautela sobre su madurez.
- Sin garantias de sesgo controlado: no se documenta ninguna etapa de mitigacion de sesgos ni de filtrado de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_10mb
- Variante con otra semilla: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con semilla 455: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante de 10 MB de datos: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante para japones: https://huggingface.co/francesca9805/jpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Curva de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/l4x3feki
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha en LLM Explorer (variant de japones): https://llm-explorer.com/model/francesca9805%2Fjpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed10,eWZY8MrE1AYkahbauyK4R
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/swa-latn-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed10
