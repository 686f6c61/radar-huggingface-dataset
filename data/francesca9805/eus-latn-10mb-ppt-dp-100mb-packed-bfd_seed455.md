# francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/eus_latn_10mb`, desarrollado por el usuario `francesca9805` (los registros de experimentos apuntan al proyecto de investigación de F. Padovani en la Universidad de Groningen, segun la URL de Weights & Biases). Se trata de un modelo de lenguaje muy pequeno, de 39.087.104 parametros, con arquitectura GPT-2 y pesos en safetensors, orientado a la generacion de texto en euskera.

Su relevancia no es la de un modelo de proposito general, sino la de un artefacto de investigacion: por su nombre y por la familia a la que pertenece, parece formar parte de una serie de experimentos controlados sobre tokenizacion y empaquetado de datos (el proyecto de W&B se llama "new-tokenizers"), con variantes equivalentes en otros idiomas como el neerlandes (`nld-latn-10mb-...`) y el ingles (`eng-latn-10mb-...`).

La model card es practicamente la plantilla autogenerada por TRL: no incluye informacion sobre el dataset de ajuste, la licencia, los idiomas declarados ni resultados de evaluacion. Cualquier uso en produccion deberia partir de esa limitacion de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT-2 (segun etiquetas del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se declara en la model card) |
| Tipos de cuantizacion | No disponible (el autor no publica versiones cuantizadas; el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | No declarados oficialmente; el identificador `eus_latn` y el modelo base apuntan a euskera (basado en script latino) |
| Licencia | No disponible (la model card solo indica `licence: license` de forma generica) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de tipo GPT-2, tal como indican las etiquetas del repositorio (`transformers`, `gpt2`, `text-generation`). Con 39 millones de parametros, se situa en el rango de GPT-2 small reducido: es un modelo que puede ejecutarse en CPU y que no incorpora atencion lineal, mezcla de expertos ni mecanismos de decodificacion especulativa.

El modelo base, `goldfish-models/eus_latn_10mb`, pertenece a la familia Goldfish de modelos monoidioma de muy baja escala entrenados con corpus reducidos; el sufijo `10mb` del identificador sugiere un corpus de entrenamiento del orden de 10 MB de texto en euskera, aunque este dato no se confirma en la informacion disponible. Sobre esa base se aplico un ajuste fino supervisado (SFT) con la libreria TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. El sufijo `100mb-packed` sugiere empaquetado de secuencias hasta unos 100 MB, pero la model card no describe la composicion del dataset, el numero de tokens vistos ni si hubo fases de RLHF o DPO (no hay evidencia de ellas; solo se menciona SFT).

## Capacidades

- Generacion de texto autoregresiva en euskera (uso previsto segun el pipeline `text-generation`).
- Conversacion de un solo turno o multi-turno mediante plantilla de chat: el ejemplo oficial de la model card invoca `pipeline` con una lista de mensajes con rol `user`, aunque el modelo no tiene una ficha de chat documentada.
- Capacidad de ajuste posterior: al ser un checkpoint pequeno y en safetensors, es reutilizable como punto de partida para nuevos SFT.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, vision, audio ni modo de "pensamiento".
- Capacidades multilingues: no declaradas; el modelo base es monoidioma (euskera) y no se documenta transferencia a otras lenguas.
- Rendimiento esperado en tareas de razonamiento, matematicas y codigo: muy limitado por escala; no se publican evaluaciones.

## Casos de uso

- Investigacion sobre tokenizacion y empaquetado de datos: el modelo pertenece a una serie de experimentos con semilla fija (`seed455`) y variantes por idioma, por lo que sirve para comparar el efecto de distintas decisiones de tokenizacion o de empaquetado sobre la perplejidad en euskera.
- Ablaciones y lineas base en articulos academicos: al tener un gemelo en neerlandes e ingles (`nld-latn-10mb-...`, `eng-latn-10mb-...`), permite montar comparativas controladas entre lenguas con el mismo presupuesto de parametros.
- Prototipado rapido de generacion de texto en euskera: sirve para verificar integraciones de `transformers` o de text-generation-inference antes de migrar a un modelo mayor, dado su tamano minimo (menos de 0,2 GB en fp32).
- Calculo de perplejidad para filtrado o clasificacion de corpus: un modelo de 39 M entrenado en euskera puede usarse como scorer ligero para detectar texto fuera de dominio o mal codificado en un pipeline de limpieza de datos.
- Fine-tuning especifico de tarea (clasificacion, extraccion, generacion acotada): al ser pequeno y estar en safetensors, se puede reentrenar en una unica GPU consumer en minutos u horas para tareas concretas en euskera.
- Docencia y demostraciones de ciclo completo de entrenamiento: cubre desde el modelo base Goldfish hasta el ajuste con TRL, con trazas en Weights & Biases, lo que lo hace util en cursos de NLP de bajo presupuesto.
- Despliegue en edge o en entornos sin GPU: el modelo cabe en CPU y en memoria de dispositivos embebidos si se convierte a formatos ligeros, util para demos offline.
- Generacion de datos sinteticos en euskera: viable tecnicamente, aunque la calidad de un modelo de 39 M entrenado con corpus diminuto hace recomendable usarlo solo como generador auxiliar y con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni MMLU, ni perplexity, ni tareas en euskera como EusProficiency o similares), y los resultados de busqueda consultados solo aportan datos de tamano y VRAM estimada, no de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,16 GB en fp32, ~0,08 GB en fp16/bf16, ~0,04 GB en int8 y ~0,02 GB en int4 (calculado a partir de 39.087.104 parametros; no son cifras publicadas por el autor).
- LLM Explorer indica para el modelo hermano `eng-latn-10mb-ppt-Dp-100mb_seed455` un consumo de VRAM de 0,1 GB.
- GPU recomendadas: cualquiera; el modelo no requiere GPU dedicada. Funciona en CPU y en cualquier GPU consumer (GTX 1050 o superior, RTX 3060, RTX 4090) sin cuello de botella de memoria.
- Cabe sobradamente en GPU consumer, e incluso en GPUs integradas y en dispositivos con poca memoria.
- Opciones de despliegue: `transformers` (soporte confirmado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), servidores compatibles con la API de Hugging Face; no se documenta soporte propio para llama.cpp, Ollama, vLLM o TGI mas alla de la etiqueta, aunque una conversion a GGUF seria factible por el tamano.
- Latencia y throughput estimados: no disponibles. Por escala, se espera un throughput muy alto y una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 (este modelo) | 39.087.104 | No disponible | No disponible | safetensors | 172 descargas, 0 likes |
| goldfish-models/eus_latn_10mb (modelo base) | No disponible (mismo orden de magnitud, no confirmado) | No disponible | No disponible | safetensors | Repositorio publico en Hugging Face |
| francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 (variante neerlandesa) | No disponible | No disponible | No disponible | safetensors | Repositorio publico en Hugging Face |
| fpadovani/eng-latn-10mb-ppt-Dp-100mb_seed455 (variante inglesa) | 39,1 M (segun LLM Explorer) | No disponible | No disponible | safetensors | Repositorio publico; desplegable en FriendliAI |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparacion se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Escala minima: con 39 M de parametros, la coherencia a partir de unas pocas decenas de tokens es muy limitada; no es apto para generacion de texto larga ni para razonamiento.
- Riesgo alto de alucinacion y de texto gramaticalmente plausible pero vacio de contenido, especialmente fuera de los dominios presentes en un corpus de entrenamiento tan reducido.
- Sesgos: al derivar de un corpus pequeno en euskera, heredara los sesgos de composicion de ese corpus (registro, variedad dialectal, tematica). No hay documentacion sobre este punto.
- Limitaciones de idioma: no se declaran idiomas soportados; el uso fuera del euskera producira resultados degradados y no evaluados.
- Longitud de contexto desconocida: no se documenta la ventana efectiva, lo que impide planificar tareas que dependan de contexto largo.
- Licencia no disponible: la model card solo contiene el marcador generico `licence: license` y no se indica la licencia del modelo base; esto implica riesgo legal para uso comercial y obliga a verificar la licencia de `goldfish-models/eus_latn_10mb` antes de cualquier despliegue.
- Model card autogenerada: no hay informacion sobre el dataset de SFT, el numero de pasos, hiperparametros ni criterios de seleccion del checkpoint, lo que impide reproducir el entrenamiento con precision.
- Ausencia total de evaluacion: no hay benchmarks, ni analisis de sesgos, ni pruebas de robustez; el modelo no deberia usarse en produccion sin una evaluacion propia previa.
- El ejemplo de la model card emplea una plantilla de chat con roles, pero no hay evidencia de que el modelo haya sido entrenado con ese formato conversacional, por lo que el comportamiento en ese modo es incierto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Variante en neerlandes: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en ingles (FriendliAI): https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en LLM Explorer de la variante inglesa: https://llm-explorer.com/model/fpadovani%2Feng-latn-10mb-ppt-Dp-100mb_seed455,5JgsFhhlELUWrAmNP8GxoE
- Ficha en LLM Explorer de la variante euskera con Dyck: https://llm-explorer.com/model/fpadovani%2Feus-latn-10mb-ppt-shuff-dyck-10mb_seed455,7dLUWuy7QdhtQN6cNsbiZR
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/es812t7v
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
