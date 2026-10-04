# francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed10

## Resumen

`francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/swa_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 124.770.816 parametros (aproximadamente 125 millones). El modelo ha sido entrenado mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace, segun indica la model card del autor. Pertenece a la familia de experimentos realizados por el usuario `francesca9805` (vinculado a la Universidad de Groningen, segun el enlace de Weights & Biases), orientados al estudio de tokenizadores y procedimientos de preentrenamiento sobre corpus de bajo recurso.

El modelo base, `swa_latn_100mb`, forma parte de la coleccion Goldfish de modelos multilingues, que entrena modelos independientes para cada idioma con corpus de aproximadamente 100 MB de texto. En este caso, `swa_latn` corresponde al suajili (swahili) en escritura latina. El sufijo `ppt-mp-struct-100mb_seed10` sugiere una configuracion experimental concreta (semilla 10 y un esquema de preentrenamiento que la model card no detalla), por lo que se trata mas de un artefacto de investigacion que de un modelo listo para produccion.

Su relevancia radica en su caracter de recurso abierto para la investigacion en procesamiento de lenguas de bajos recursos, en particular el suajili, y en servir de base reproducible para comparar variantes de tokenizacion y de datos de entrenamiento. El modelo no cuenta con documentacion extensa, licencia declarada ni resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como GPT-2 en los tags) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma oficial; al ser GPT-2 es convertible a GGUF/INT8/INT4 mediante herramientas externas |
| Idiomas soportados | no disponible oficialmente; el identificador `swa_latn` apunta al suajili en alfabeto latino |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/swa_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, tal y como reflejan los tags del repositorio (`gpt2`) y el recuento de parametros (124,77 millones), coherente con la configuracion estandar de GPT-2 small. Se trata, por tanto, de un modelo autorregresivo de generacion de texto con atencion causal, sin mecanismos de mezcla de expertos ni componentes de estado (SSM) ni atencion lineal.

El entrenamiento parte del modelo `goldfish-models/swa_latn_100mb` y aplica un ajuste fino supervisado (SFT) usando TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste, ni si se emplearon tecnicas adicionales como RLHF o DPO. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers`, lo que apunta a que el objetivo del experimento era evaluar el impacto de decisiones de tokenizacion sobre el preentrenamiento y ajuste en suajili. No se documentan innovaciones tecnicas destacables mas alla del propio pipeline de SFT.

## Capacidades

- Generacion de texto autorregresiva en el idioma del corpus base (presumiblemente suajili), sin confirmacion oficial.
- Finalizacion y continuacion de texto (text completion) a partir de un prompt.
- Generacion condicionada por formato de chat, segun el ejemplo de uso de `pipeline` incluido en la model card (entrada con rol `user`).
- Compatible con `text-generation-inference` y con la infraestructura de endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de vision, audio, codigo ni matematicas.
- Capacidades multilingues: no confirmadas oficialmente; el identificador sugiere un enfoque mono-idioma en suajili.
- Capacidad de ajuste adicional: al ser un modelo pequeno con pesos safetensors y pipeline estandar, es sencillo reentrenarlo o adaptarlo.

## Casos de uso

- Investigacion en tokenizacion de lenguas de bajos recursos: el modelo forma parte de una serie de experimentos (`new-tokenizers`) que comparan distintos esquemas de tokenizacion; sirve como sujeto de prueba reproducible para medir el efecto de cada variante sobre la calidad de generacion en suajili.
- Generacion de texto en suajili para prototipos: permite producir borradores de texto en suajili en entornos de experimentacion donde no se requiere precision de produccion, con un coste de computo minimo.
- Docencia y demostraciones de fine-tuning con TRL: su tamano reducido (0,3 GB) y su pipeline estandar lo hacen util para ilustrar un flujo completo de SFT sobre un modelo base.
- Evaluacion comparativa de variantes de entrenamiento: al existir multiples versiones hermanas con distintas semillas y configuraciones (por ejemplo `..._seed10`, `..._seed455`), permite estudiar la varianza entre semillas y configuraciones de datos.
- Despliegue en entornos con recursos muy limitados: al caber en CPU y en cualquier GPU de consumo, puede ejecutarse en dispositivos embebidos o portatiles para pruebas de generacion de texto.
- Base para ajuste posterior (continued fine-tuning): un desarrollador puede partir de este checkpoint para especializarlo en una tarea concreta en suajili (por ejemplo, resumen o clasificacion generativa) sin partir de cero.
- Extraccion de caracteristicas o calculo de perplejidad: util como modelo de referencia para medir la perplejidad de corpus en suajili dentro de un pipeline de evaluacion linguistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra) y las busquedas web solo devuelven entradas de registro y paginas de despliegue de modelos hermanos, sin datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,25 GB en FP16/BF16 y menos de 0,13 GB en cuantizaciones INT8/INT4 (calculado a partir de los 124,77 millones de parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Modelos como RTX 3060, RTX 4090, T4 o incluso GPUs integradas son mas que suficientes.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: `transformers` (pipeline de generacion), `text-generation-inference` (el tag `endpoints_compatible` lo respalda), y, mediante conversion, `llama.cpp`/GGUF u Ollama. vLLM es viable por tamano, aunque no esta confirmado oficialmente.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, en GPU moderna la generacion de 128 tokens deberia completarse en decimas de segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed10 | 124,77 M | no disponible | no disponible | HuggingFace | Objeto de esta ficha; SFT sobre base Goldfish |
| goldfish-models/swa_latn_100mb | no disponible (misma familia) | no disponible | no disponible | HuggingFace | Modelo base sin ajuste SFT |
| francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10 | no disponible | no disponible | no disponible | HuggingFace | Variante hermana con distinta configuracion de datos |
| francesca9805/swa-latn-100mb-ppt-shuff-dyck-10mb_seed10 | no disponible | no disponible | no disponible | HuggingFace / FriendliAI | Variante hermana con menor corpus (10 MB) |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparativa se limita a aspectos de procedencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre sesgos: no se especifica la composicion del corpus de entrenamiento ni del ajuste, por lo que no es posible evaluar sesgos de genero, etnia o ideologia.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 125 millones de parametros, su capacidad de mantener coherencia factual y discursiva es muy limitada en comparacion con modelos actuales.
- Cobertura idiomatica restringida: el identificador apunta a suajili (`swa_latn`); el rendimiento en otros idiomas, incluido el castellano, es previsiblemente muy pobre y no esta documentado.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Modelo de investigacion: proviene de una serie experimental de tokenizadores, no de un pipeline orientado a producto, por lo que no hay garantias de estabilidad ni de soporte.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que dificulta el diseno de aplicaciones multi-turno o de contexto largo.
- Riesgo de datos contaminados o limitados: el corpus base de 100 MB por idioma es pequeno para estandares actuales, lo que limita la diversidad tematica aprendida.
- Sin garantias de calidad en generacion de codigo, matematicas o tareas de razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/m1hwd0tw
- Repositorio TRL: https://github.com/huggingface/trl
- Variante hermana (Dp-100mb-packed-bfdiso_seed10): https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Variante hermana (Dp-10mb-packed-bfd_seed455): https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana (shuff-dyck-10mb_seed10) en FriendliAI: https://friendli.ai/models/fpadovani/swa-latn-100mb-ppt-shuff-dyck-10mb_seed10
- Despliegue de variante hermana en FriendliAI: https://friendli.ai/models/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
