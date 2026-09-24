# francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed455

## Resumen

El modelo `ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed455`, publicado por el usuario de HuggingFace `francesca9805`, es un ajuste fino de tipo SFT (supervised fine-tuning) sobre `goldfish-models/eng_latn_100mb`, un modelo monolingüe de la colección Goldfish orientada a lenguas con pocos recursos. Según los tags del repositorio, la arquitectura subyacente es GPT-2 (transformer decoder-only) y el entrenamiento se ha realizado con la librería TRL (versión 0.23.0), registrado en un proyecto de Weights & Biases asociado a la Universidad de Groninga.

El interés de esta ficha es limitado pero concreto: se trata de un artefacto de investigación, no de un modelo listo para producción. El propio identificador del repositorio (`ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed455`) sugiere un experimento controlado sobre tokenización (vocabulario nuevo, "newlex"), composición de corpus multilingüe (con un componente aparentemente hebreo, "heb"), empaquetado de secuencias ("packed") y una semilla fija (455). El repositorio tiene 0 descargas y 0 likes, y el tamaño es de solo 0,2 GB.

Con 86.508.288 parámetros reales (dato extraído de los pesos safetensors), el modelo es muy pequeño y cabe holgadamente en cualquier GPU de consumo, e incluso en CPU. No se ha publicado información sobre longitud de contexto, licencia, idiomas soportados ni resultados de evaluación, por lo que su uso responsable queda restringido a experimentación y a la reproducibilidad del estudio para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` del repositorio); no se detalla la configuracion de capas ni cabezas |
| Parametros totales | 86.508.288 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. El modelo base pertenece a la familia Goldfish, derivada de GPT-2, pero el autor no especifica la ventana de contexto de este ajuste |
| Tipos de cuantizacion | No disponible. Los pesos se publican en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible. El modelo base es ingles (`eng_latn`); el identificador incluye la etiqueta `heb`, que sugiere presencia de hebreo en los datos del experimento, pero no se confirma en la model card |
| Licencia | No disponible. La model card incluye un campo `licence: license` sin contenido, que no constituye una licencia valida |
| Formato de pesos | safetensors (libreria `transformers`, version 4.56.2) |

Otros datos relevantes: repositorio de 0,2 GB, creado y actualizado el 24 de septiembre de 2026, pipeline `text-generation`, compatible con `text-generation-inference` y `endpoints_compatible` (segun tags), 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, es decir, un transformer decoder-only con atencion causal y normalizacion previa a los bloques. No se especifica en la informacion disponible el numero de capas, la dimension oculta ni el tamano del vocabulario de este ajuste; el recuento de 86,5 millones de parametros es inferior al de GPT-2 small canonico (124 millones), lo que resulta coherente con una tokenizacion o un vocabulario distintos, hipotesis que encaja con la etiqueta `newlex` del identificador.

El entrenamiento se realizo mediante SFT con TRL 0.23.0, sobre PyTorch 2.5.1+cu121, Transformers 4.56.2, Datasets 4.8.4 y Tokenizers 0.22.1. El run esta registrado en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/new-tokenizers`, con identificador `ke2e3fkc`. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. El nombre del repositorio apunta a un diseno experimental factorial (condiciones como `uniform`, `before-100mb`, `packed` y una semilla concreta), tipico de estudios comparativos de tokenizadores y de mezclas de datos.

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de los modelos GPT-2 de escala reducida.
- Ajuste por instrucciones mediante SFT, segun declara el autor, con el formato de chat que se muestra en el ejemplo de uso rapido de la model card.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso, modo de pensamiento explicito ni cadenas de razonamiento largas.
- No hay evidencia publicada de capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue no confirmada: el modelo base es ingles y el experimento parece incluir datos en hebreo, pero no se especifica el comportamiento final en ninguno de los dos idiomas.
- Compatible con el ecosistema `transformers` (pipeline `text-generation`) y con text-generation-inference segun los tags.

## Casos de uso

- Reproducibilidad de experimentos de tokenizacion: el modelo sirve para replicar las condiciones del estudio `new-tokenizers` (vocabulario nuevo, corpus empaquetado, semilla 455) y comparar el efecto del tokenizador sobre la perdida y la generacion, dado que el checkpoint se publica con la semilla fijada.
- Estudio de mezclas de datos multilingues: con la etiqueta `heb` en el identificador y un base model en ingles, el checkpoint permite analizar como un corpus con componente hebreo afecta a un modelo inicialmente anglosajon de 86,5 millones de parametros.
- Docencia y practicas de ajuste fino: el tamano reducido (0,2 GB de repositorio) permite que estudiantes ejecuten un ciclo completo de carga, inferencia y evaluacion en un portatil con CPU o una GPU modesta, usando el ejemplo de `pipeline` de la model card.
- Pruebas unitarias de infraestructura de despliegue: por su peso minimo, es util como modelo de humo para validar que un servidor de inferencia (TGI, vLLM o un endpoint compatible) arranca, tokeniza y responde correctamente antes de desplegar modelos mayores.
- Generacion de texto de baja latencia en entornos con recursos muy limitados: un modelo denso de 86,5 millones de parametros puede cuantizarse a 8 o 4 bits y ejecutarse en dispositivos sin GPU dedicada, siempre que la calidad exigida sea baja o el uso sea experimental.
- Analisis de sesgos y de comportamiento de modelos pequenos: sirve como sujeto de estudio controlado, con una unica variable modificada respecto del modelo base, para medir como el ajuste SFT altera la distribucion de salidas.
- Prototipado de pipelines de evaluacion: al ser un checkpoint pequeno y de carga rapida, permite iterar sobre scripts de evaluacion automatica antes de aplicarlos a modelos de mayor tamano.

En todos los casos anteriores se asume uso experimental o interno, nunca produccion con usuarios finales, dado que no hay licencia declarada ni evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perdida de validacion ni ninguna otra metrica, y no se dispone de datos de comparacion con el modelo base que permitan calcular una mejora relativa.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Perdida de validacion | No disponible |

## Requisitos de hardware

- VRAM estimada de forma orientativa (no publicada por el autor): en FP32 unos 350 MB de pesos; en FP16/BF16 unos 175 MB; en INT8 unos 90 MB; en cuantizacion de 4 bits alrededor de 50 MB. A estas cifras hay que sumar el estado de la cache KV, que crece con la longitud de contexto y el tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. Las GPU de datacenter (A100, H100) solo tendrian sentido para evaluar en lotes muy grandes, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en iGPU con memoria unificada.
- Ejecucion en CPU: viable, con latencias de decenas de milisegundos por token en funcion del procesador. El modelo puede caber en dispositivos tipo Raspberry Pi 4 o 5 en cuantizacion de 8 bits.
- Opciones de despliegue: `transformers` con `pipeline(..., device="cuda")` tal como indica la model card, text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` asi lo sugiere), y vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, conversion que el autor no proporciona.
- Latencia y throughput: no disponibles, no publicados por el autor. Como referencia orientativa y no verificada, un modelo denso de 86,5 millones de parametros en FP16 sobre una GPU de consumo moderna suele generar del orden de miles de tokens por segundo con lotes grandes y cientos con lote 1, pero estas cifras no proceden de ninguna medicion de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed455` | 86,5 M | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT con TRL sobre base Goldfish |
| `goldfish-models/eng_latn_100mb` | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace (modelo base) | Modelo monolingue ingles entrenado con 100 MB de corpus |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens (valor tipico de la familia, no confirmado para este ajuste) | MIT (licencia habitual de GPT-2) | Ampliamente disponible | Punto de referencia estandar de la arquitectura declarada |
| DistilGPT-2 (referencia de tamano) | 82 M | 1024 tokens (valor tipico de la familia) | MIT (licencia habitual) | Ampliamente disponible | Tamano comparable, sin relacion con el experimento |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene un campo `licence: license` vacio. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; conviene tratar el modelo como no licenciado y contactar con el autor antes de cualquier uso fuera del ambito de investigacion.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgos, toxicidad o representacion. Un modelo de 86,5 millones de parametros entrenado sobre un corpus de 100 MB hereda con alta probabilidad los sesgos de ese corpus, agravados por la capacidad limitada del modelo.
- Riesgo alto de alucinacion: por tamano y por la ausencia de etapas de alineacion documentadas (no se menciona RLHF ni DPO), es esperable que genere afirmaciones factualmente incorrectas con fluidez. No debe usarse como fuente de informacion.
- Ambiguedad idiomatica: el modelo base es ingles, el identificador sugiere presencia de hebreo y no se documenta ningun idioma soportado. Existe riesgo real de mezcla de idiomas y de rendimiento degradado en castellano.
- Longitud de contexto desconocida: no se especifica la ventana soportada, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en documentos extensos.
- Sin benchmarks ni evaluacion humana: no hay evidencia publicada de calidad, lo que impide estimar si el ajuste SFT mejora o degrada el modelo base.
- Fecha de publicacion atipica: los metadatos indican creacion y actualizacion el 24 de septiembre de 2026, dato que conviene verificar, ya que puede tratarse de un error de registro.
- Artefacto de investigacion sin mantenimiento: 0 descargas, 0 likes y una unica revision sugieren que no hay soporte, actualizaciones ni correccion de errores previstos.
- No apto para produccion: sin licencia, sin evaluacion y sin garantias de idioma, no deberia desplegarse en sistemas que interactuen con usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-heb-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ke2e3fkc
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL: von Werra, L., Belkada, Y., Tunstall, L., Beeching, E., Thrush, T., Lambert, N., Huang, S., Rasul, K. y Gallouédec, Q. (2020). TRL: Transformer Reinforcement Learning. GitHub.
