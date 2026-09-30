# francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino de tipo SFT (supervised fine-tuning) sobre el modelo base `goldfish-models/swa_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parametros (aproximadamente 124,8 millones), lo que lo situa en la gama de modelos pequenos orientados a generacion de texto y a experimentacion controlada con bajo coste computacional.

Por la convencion de nombres del proyecto Goldfish, el sufijo `swa_latn` corresponde a suajili (swahili) en escritura latina, y `100mb` indica el volumen aproximado del corpus de entrenamiento del modelo base. El nombre del ajuste incluye segmentos como `ppt`, `Dp-100mb-packed` y un identificador de semilla (`seed455`), lo que sugiere un experimento comparativo dentro de una linea de trabajo sobre tokenizadores y empaquetado de datos, aunque la model card no documenta esos detalles de forma explicita.

Su relevancia es principalmente metodologica: sirve como punto de comparacion reproducible dentro de una serie de ejecuciones con distintas semillas y tamanos de datos, y como base para estudiar el efecto del SFT sobre un modelo multilingue de bajos recursos. No esta pensado como modelo de produccion generalista, y no se han publicado benchmarks, licencia ni lista de idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (segun el tag `gpt2` de HuggingFace) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite conversion a GGUF/AWQ/GPTQ por herramientas externas (no verificada por el autor) |
| Idiomas soportados | no disponible como listado oficial; el modelo base `goldfish-models/swa_latn_100mb` corresponde a suajili en escritura latina por la convencion de nombres del proyecto Goldfish |
| Licencia | no disponible (la model card declara `licence: license`, sin terminos concretos ni texto de licencia) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/swa_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Pipeline declarado | text-generation |
| Fecha de creacion registrada | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con 124.770.816 parametros y atencion causal completa (no se documenta el uso de atencion lineal, SSM ni esquemas hibridos). El modelo parte de `goldfish-models/swa_latn_100mb`, un modelo de la coleccion Goldfish entrenado sobre aproximadamente 100 MB de texto en suajili, y se ajusta posteriormente mediante SFT supervisado usando la libreria TRL en su version 0.23.0, con Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

No se especifican en la model card el numero de tokens de entrenamiento del ajuste, la composicion del dataset de SFT, la existencia de fases de RLHF o DPO, ni hiperparametros relevantes (tasa de aprendizaje, epocas, tamano de lote, longitud de secuencia). El unico registro publico adicional es una ejecucion de Weights & Biases alojada en el proyecto `f-padovani-university-of-groningen/new-tokenizers`, con identificador `ngfwlzyr`, lo que apunta a un contexto de investigacion academica centrado en tokenizadores mas que en optimizacion de capacidades del modelo. No se documenta ninguna innovacion tecnica de inferencia como decodificacion especulativa, atencion con ventana deslizante o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por un prompt conversacional en formato de mensajes (`{"role": "user", "content": ...}`), tal como muestra el ejemplo de la model card.
- Capacidad multilingue no documentada; por herencia del modelo base, la competencia previsible se concentra en suajili escrito en alfabeto latino, sin garantias sobre otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, planificacion multi-paso ni modos de razonamiento extendido (*thinking mode*).
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documentan capacidades destacadas de codigo o matematicas; con 124,8 millones de parametros y un corpus base de 100 MB, el rendimiento esperable en estas tareas es muy limitado.
- Integracion declarada con el ecosistema Transformers, con `text-generation-inference` y `endpoints_compatible` como etiquetas de despliegue.

## Casos de uso

- Experimentacion academica con tokenizadores: el modelo forma parte de una serie de ejecuciones con distintas semillas y tamanos de datos del proyecto `new-tokenizers`, por lo que su uso principal es servir de punto de comparacion reproducible frente a las variantes `seed10`, `seed455` y los ajustes con corpus de 10 MB.
- Ajuste fino posterior sobre dominio especifico en suajili: al ser un modelo de 124,8 millones de parametros y 0,3 GB en disco, se puede reentrenar o aplicar LoRA en una unica GPU de gama media para tareas concretas como clasificacion de texto, resumen corto o normalizacion ortografica.
- Generacion de texto de bajo coste en entornos sin GPU: la huella de memoria permite ejecutarlo en CPU o en dispositivos embebidos para tareas de relleno, autocompletado o generacion de plantillas en suajili.
- Docencia y practicas de ajuste supervisado: el flujo completo (modelo base Goldfish, SFT con TRL, registro en Weights & Biases) es replicable con recursos minimos, lo que lo hace util como material didactico para explicar el pipeline de SFT.
- Prototipado rapido de interfaces conversacionales: con la pipeline `text-generation` de Transformers y `device="cuda"`, se puede levantar una demo funcional en pocos minutos para validar una interfaz antes de invertir en un modelo mayor.
- Investigacion sobre degradacion de modelos pequenos: permite medir empiricamente fenomenos como repeticion, perdida de coherencia a partir de pocos cientos de tokens o colapso ante prompts fuera de distribucion, en un entorno controlado y barato.
- Generacion de datos sinteticos en suajili para aumentar corpus de entrenamiento: utilizable como generador de bajo coste, siempre con revision humana y filtrado posterior por la alta tasa de error esperable.
- Pruebas de integracion de infraestructura: gracias a las etiquetas `text-generation-inference` y `endpoints_compatible`, sirve para validar despliegues con TGI o endpoints compatibles sin consumir presupuesto de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y los resultados de busqueda web consultados no aportan cifras de rendimiento para este modelo ni para sus variantes de la misma serie.

## Requisitos de hardware

Las cifras de memoria siguientes son estimaciones derivadas del numero de parametros declarado (124.770.816) y no proceden de mediciones publicadas por el autor:

- Peso en FP32: aproximadamente 500 MB; en FP16/BF16: aproximadamente 250 MB; en int8: aproximadamente 125 MB; en int4: aproximadamente 65 MB (mas el *overhead* del runtime y de la cache KV).
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB de VRAM si se usa cuantizacion de 8 o 4 bits.
- Cabe en CPU y en dispositivos de borde (Raspberry Pi 4/5, mini-PC con 4-8 GB de RAM), aunque con latencias altas y bajo throughput en generacion autoregresiva.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento a gran escala o para servir muchas replicas concurrentes.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), Text Generation Inference (etiqueta `text-generation-inference` en el repositorio), endpoints compatibles con la API de inferencia, y `vLLM` o `llama.cpp`/`Ollama` previa conversion del checkpoint a los formatos que estos runtimes requieren (la conversion no esta documentada por el autor).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455 | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | SFT sobre Goldfish swa_latn_100mb |
| goldfish-models/swa_latn_100mb | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (modelo base) | Modelo base en suajili de la coleccion Goldfish |
| francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | HuggingFace | Misma serie experimental, semilla 10 |
| francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HuggingFace | Variante con 10 MB, presumiblemente distinto tamano de datos |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT | HuggingFace | Referencia arquitectonica de la misma familia; distinto idioma y datos de entrenamiento |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de estos modelos entre si.

## Limitaciones y advertencias

- Tamano muy reducido: 124,8 millones de parametros limitan severamente la coherencia a medio plazo, el seguimiento de instrucciones complejas y el razonamiento multi-paso.
- Riesgo alto de alucinacion: no se ha aplicado, segun la informacion disponible, ninguna fase de alineacion tipo RLHF o DPO, solo SFT, y no hay evaluaciones de fidelidad factual.
- Idiomas: no hay listado oficial de idiomas soportados; el comportamiento fuera del suajili en escritura latina es impredecible.
- Longitud de contexto no documentada: se desconoce el maximo de tokens de entrada, lo que impide planificar tareas con contexto largo.
- Licencia no disponible: la model card declara `licence: license` sin texto ni terminos, por lo que no hay base juridica clara para uso comercial. Se debe contactar con el autor antes de cualquier despliegue productivo.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar calidad o reproducibilidad.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-30) es posterior a la fecha habitual de publicacion, lo que puede indicar un error de sellado temporal o un entorno de pruebas.
- El ajuste no documenta hiperparametros ni composicion del dataset, lo que dificulta la reproducibilidad exacta del entrenamiento.
- No apto para produccion en tareas sensibles (sanidad, legal, financiero) sin evaluacion previa especifica y sin una licencia resuelta.
- La cuantizacion a 4 bits en un modelo de este tamano puede degradar de forma notable la calidad de la generacion; conviene validar con metricas propias antes de adoptarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ngfwlzyr
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con semilla 10: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con 10 MB: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en friendli.ai (variante de 10 MB): https://friendli.ai/models/francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Ficha en free2aitools (variante de 10 MB): https://free2aitools.com/model/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed455
- Discusiones de la variante en sueco: https://huggingface.co/francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455/discussions
