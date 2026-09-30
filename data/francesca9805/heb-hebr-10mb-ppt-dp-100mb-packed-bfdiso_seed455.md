# francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/heb_hebr_10mb`, desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros totales (aproximadamente 39 millones), distribuido en formato `safetensors` con un repositorio de 0,1 GB. El entrenamiento se realizo con la libreria TRL 0.23.0 en su modalidad SFT (supervised fine-tuning), sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El interes de esta publicacion no reside en su rendimiento como asistente, sino en su caracter de artefacto de investigacion. La convencion de nombres del autor (`heb-hebr-10mb` + `ppt` + `Dp-100mb-packed-bfdiso` + `seed455`) apunta a una serie de experimentos controlados sobre estrategias de empaquetado (packing) de datos, mezcla de corpus y semillas aleatorias, aplicados a un modelo de muy bajo numero de parametros para un idioma de bajos recursos. La existencia de variantes hermanas con nombres como `heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455` o `heb-hebr-100mb-ppt-Dp-10mb_seed3407` refuerza esa lectura: el autor esta barriendo combinaciones de tamano de corpus y semilla manteniendo fija la receta de entrenamiento.

Es relevante ahora porque los modelos de menos de 100 millones de parametros estan recuperando atencion como bancos de pruebas reproducibles para estudiar tokenizacion, mezcla de datos y tecnicas de packing en lenguas poco representadas, donde el coste de entrenar variantes completas es prohibitivo. El modelo no publica licencia explicita, ni idiomas declarados, ni resultados de evaluacion, por lo que debe tratarse como un checkpoint experimental y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2` y la libreria `transformers`) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en `safetensors`) |
| Idiomas soportados | no disponible (el identificador `heb_hebr` del modelo base sugiere hebreo, pero la model card no lo declara) |
| Licencia | no disponible (la model card incluye el campo `licence: license` como marcador de posicion, sin texto legal) |
| Formato de pesos | safetensors |
| Framework de entrenamiento | TRL 0.23.0 (SFT), Transformers 4.56.2, PyTorch 2.5.1+cu121 |
| Modelo base | goldfish-models/heb_hebr_10mb |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal completa. El tag `gpt2` y la libreria `transformers` son los unicos indicios disponibles sobre la estructura interna; la model card no detalla numero de capas, dimension de embedding, numero de cabezas de atencion ni funcion de activacion. El modelo base `goldfish-models/heb_hebr_10mb` pertenece a la familia Goldfish, orientada a modelos pequeños por idioma y escritura, de modo que lo mas probable es que se trate de una configuracion GPT-2 pequena con vocabulario adaptado a escritura hebrea, aunque este extremo no esta confirmado en la informacion disponible.

El entrenamiento se realizo mediante SFT con TRL, partiendo del checkpoint base y aplicando una receta de ajuste fino cuyo detalle (numero de tokens, composicion exacta del dataset, si hubo etapas de RLHF o DPO, hiperparametros de optimizacion) no se documenta en la model card. El autor enlaza un registro de Weights & Biases asociado a un proyecto denominado `new-tokenizers`, lo que sugiere que el trabajo forma parte de una linea de investigacion sobre tokenizadores y tokenizacion de datos en lenguas con escritura no latina. No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por un prompt de usuario en formato de chat, tal como muestra el ejemplo de uso con `pipeline("text-generation")`.
- Aceptacion de entradas en formato de lista de mensajes con rol (`[{"role": "user", "content": ...}]`), lo que indica que el tokenizador o la plantilla de chat espera una estructura conversacional.
- Capacidad multilingue: no declarada. El identificador del modelo base apunta a hebreo, pero no hay confirmacion oficial ni evaluacion que lo respalde.
- Tool calling / function calling: no documentado, no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; por tamano (39 millones de parametros) no cabe esperar capacidades de planificacion fiables.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades de codigo y matematicas: no documentadas ni evaluadas.

## Casos de uso

- Reproduccion de experimentos de investigacion en tokenizacion: el modelo sirve como punto de comparacion dentro de una serie de variantes con la misma receta y distintas semillas, lo que permite aislar el efecto de la semilla y del empaquetado de datos sobre la perdida final.
- Estudio de tecnicas de packing en corpus pequeños: al existir variantes hermanas con nombres como `packed` frente a otras sin ese termino, el checkpoint es util para medir si el empaquetado de secuencias mejora el aprovechamiento de un corpus de 10 MB en idiomas de bajos recursos.
- Banco de pruebas para pipelines de entrenamiento con TRL: sirve para validar de extremo a extremo un flujo SFT (carga de dataset, tokenizacion, guardado en safetensors) con un coste de computo minimo, antes de escalar a modelos mayores.
- Docencia y formacion: es un caso practico y de bajo coste para explicar el ciclo completo de ajuste fino supervisado, desde la eleccion del modelo base hasta la publicacion en el Hub, sin necesidad de GPU de gama alta.
- Inferencia local en hardware muy limitado: con 39 millones de parametros, puede ejecutarse en CPU o en cualquier GPU de consumo con huella de memoria minima, lo que lo hace apto para demostraciones offline o entornos embebidos de prueba.
- Generacion de lineas base (baselines) en evaluaciones de modelos mas grandes: al ser tan pequeño, permite fijar el suelo de rendimiento contra el que comparar modelos de mayor escala en la misma tarea e idioma.
- Prototipado rapido de plantillas de chat: sirve para depurar el formato de mensajes y la funcion de generacion antes de trasladar ese formato a modelos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y las busquedas web realizadas solo devuelven paginas de catalogacion y despliegue que replican los metadatos del modelo, sin metricas de calidad.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (39,09 millones) y no proceden de mediciones publicadas por el autor.

- VRAM estimada en FP32: aproximadamente 160 MB solo para los pesos, mas el estado del activador y el cache KV durante la generacion.
- VRAM estimada en FP16/BF16: aproximadamente 80 MB para los pesos.
- VRAM estimada en INT8: aproximadamente 40 MB.
- VRAM estimada en INT4: aproximadamente 20 MB.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, e incluso en CPU sin aceleracion dedicada.
- GPU recomendadas: no se requieren GPU de centro de datos. A100, H100 o similares son innecesarias para este tamano.
- Opciones de despliegue: `transformers` con `pipeline` es la ruta documentada en la model card. Al ser un modelo GPT-2, es compatible en principio con llama.cpp y Ollama previa conversion a GGUF, y con TGI por el tag `text-generation-inference`, aunque estas rutas no estan verificadas por el autor. Los tags `endpoints_compatible` indican compatibilidad con los Inference Endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Relacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed455 | 39.087.104 | no disponible | Objeto de esta ficha | no disponible | HuggingFace |
| goldfish-models/heb_hebr_10mb | no disponible | no disponible | Modelo base del que deriva | no disponible en la informacion recogida | HuggingFace |
| francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | no disponible | Variante hermana con la relacion corpus/tamano invertida segun el nombre | no disponible | HuggingFace |
| fpadovani/heb-hebr-100mb-ppt-Dp-10mb_seed3407 | no disponible | no disponible | Variante de la misma familia experimental, atribuida a otro usuario | no disponible | HuggingFace |

No se dispone de datos de rendimiento de ninguna de estas variantes, por lo que la comparativa se limita a la disponibilidad y a la nomenclatura. No es posible establecer cual de ellas rinde mejor sin evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni metricas de perdida publicadas, por lo que no puede afirmarse nada sobre su calidad de generacion.
- Licencia no definida: la model card incluye `licence: license` sin texto legal. No hay autorizacion explicita de uso comercial ni condiciones de atribucion. Cualquier uso en produccion queda en un limbo juridico.
- Idiomas no declarados: aunque el nombre apunta a hebreo, el propio autor no documenta que idiomas domina el modelo.
- Riesgo elevado de alucinacion y de texto incoherente: con 39 millones de parametros y un corpus de entrenamiento del orden de decenas de MB, el modelo no tiene capacidad para mantener coherencia factual ni consistencia en generaciones largas.
- Sin alineacion documentada: no se menciona RLHF, DPO ni filtros de seguridad, de modo que el modelo puede generar contenido sesgado, ofensivo o inapropiado sin restriccion alguna.
- Sesgos heredados del corpus: al derivar de un modelo entrenado sobre datos de una unica lengua y escritura, reproducira los sesgos presentes en ese corpus sin mitigacion conocida.
- Longitud de contexto desconocida: impide planificar usos que requieran ventanas amplias.
- Artifacto experimental, no producto: el nombre del repositorio, la cantidad de variantes por semilla y la ausencia de descargas y likes indican que es un checkpoint de investigacion, no un modelo mantenido ni soportado.
- Sin garantia de soporte: no hay issues resueltas, ni documentacion adicional, ni comunidad asociada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_10mb
- Variante hermana (seed455, 100mb/10mb): https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Discusiones de variante hermana: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455/discussions
- Variante hermana de otro autor: https://llm-explorer.com/model/fpadovani%2Fheb-hebr-100mb-ppt-Dp-10mb_seed3407,5Jp1X54VnEqmYlV4AV9QHq
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/heb-hebr-10mb-ppt-dp-100mb-packed-bfd_seed10
- Ficha en friendli.ai: https://friendli.ai/models/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wd8a9eu3
- Repositorio de TRL: https://github.com/huggingface/trl
