# qpqpqpqpqpqqqq/Nemotron-3.5-Lightning-30B-A3B-Abliterated-NVFP4

## Resumen

Nemotron-3.5-Lightning-30B-A3B-Abliterated-NVFP4 es una variante comunitaria del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 de NVIDIA, publicada por el usuario qpqpqpqpqpqqqq. Sobre el checkpoint original se han aplicado dos transformaciones: primero una abliteracion de direccion unica mediante Heretic (con busqueda de hiperparametros basada en Optuna) para eliminar la direccion de rechazo alineada con seguridad, y despues una cuantizacion a NVFP4 (pesos y activaciones) realizada con ModelOpt. El resultado es un modelo de generacion de texto conversacional sin el filtrado de rechazo del original y en un formato de 4 bits pensado para aceleracion en hardware Blackwell.

La arquitectura del modelo base es hibrida: combina capas Mamba-2 con un mezclador de expertos (MoE) y atencion, bajo la implementacion nemotron_h. La model card declara 31,6 mil millones de parametros totales con 3 mil millones activos por token, aunque los metadatos de safetensors del repositorio cuentan 16.484.881.856 parametros; esa discrepancia no se explica en la informacion disponible. El repositorio ocupa 18,9 GB y se distribuye unicamente en safetensors.

Su relevancia es doble. Por un lado, ofrece una via de despliegue del Nemotron-3.5 Lightning en entornos de inferencia modernos (vLLM 0.30 o superior con backend MoE marlin) y con decodificacion especulativa, con una tasa de decodificacion medida de 128,8 tok/s y una tasa de aceptacion del borrador del 87,5% en una DGX Spark. Por otro, al eliminar la alineacion de seguridad, esta pensado para investigacion de robustez, red teaming y generacion de datos sin restricciones, lo que conlleva riesgos legales y eticos explicitamente advertidos por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + MoE + atencion (implementacion nemotron_h) |
| Parametros totales | 31,6 B segun la model card; 16.484.881.856 segun los metadatos de safetensors del repositorio (discrepancia no explicada) |
| Parametros activos | 3 B por token (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con pesos y activaciones cuantizados (ModelOpt); el repositorio tambien lleva la etiqueta 8-bit |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license (etiquetada como other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Nemotron-3.5 Lightning: intercala capas Mamba-2 (modelo de espacio de estados) con capas de atencion y un mezclador de expertos, de ahi la etiqueta nemotron_h. Con 3 mil millones de parametros activos sobre 31,6 mil millones totales, el coste de inferencia por token es mucho menor que el de un denso del mismo tamano total. La ficha no documenta el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original; toda esa informacion pertenece a la publicacion de NVIDIA y no se reproduce aqui.

Las dos innovaciones que introduce esta ficha son de post-entrenamiento. La abliteracion se hizo con Heretic, que elimina en una sola pasada la direccion de rechazo del modelo y usa una busqueda Optuna para elegir los parametros de ablacion sobre la frontera de Pareto entre cumplimiento y divergencia KL del primer token. Despues, el checkpoint se cuantizo a NVFP4 con ModelOpt, un formato de 4 bits con escalas por bloque que NVIDIA usa para acelerar inferencia en GPUs Blackwell. El autor advierte que no midio ni publico las cifras de rechazo, cumplimiento ni divergencia KL de esta ejecucion concreta.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat aplicada mediante apply_chat_template.
- Modo de razonamiento explicito: la plantilla admite enable_thinking, que activa o desactiva la cadena de pensamiento verbose entre etiquetas <think>.
- Soporte multilingue en ingles, espanol, frances, aleman, italiano y japones.
- Inferencia eficiente en GPU Blackwell gracias a la cuantizacion NVFP4 de pesos y activaciones.
- Compatibilidad con decodificacion especulativa mediante el borrador DSpark publicado por NVIDIA (no incluido en este repositorio).
- Despliegue en vLLM 0.30 o superior con la ruta MoE NVFP4 (--moe-backend marlin) y VLLM_MARLIN_USE_ATOMIC_ADD=1.
- Sin alineacion de rechazo: el modelo no aplica el comportamiento de denegacion del checkpoint original (esta es una capacidad buscada por el autor, no una garantia de calidad).
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Investigacion de seguridad y red teaming: permite estudiar que comportamientos emergen cuando se elimina la direccion de rechazo de un modelo alineado, comparando respuestas contra el checkpoint original de NVIDIA.
- Generacion de datos sinteticos sin filtrado: util para crear datasets de entrenamiento o de evaluacion en dominios donde el modelo base se negaria a responder, con la advertencia legal correspondiente.
- Despliegue en infraestructura Blackwell: al estar en NVFP4, encaja en servidores con GPUs de nueva generacion que aprovechan las rutas marlin de vLLM para el MoE.
- Servicio de chat de alto rendimiento: con 3 B de parametros activos y decodificacion especulativa, es adecuado para APIs conversacionales donde el coste por token importa mas que la profundidad de razonamiento.
- Atencion al cliente multilingue: cubre seis idiomas sin cambiar de modelo, lo que simplifica el enrutado en un unico endpoint de vLLM.
- Traduccion y reescritura entre los seis idiomas soportados: tareas de transformacion de texto que no requieren cadena de pensamiento y se benefician de la baja latencia.
- Escritura creativa y generacion de ficcion sin restricciones tematicas: el caso de uso mas inmediato de una variante abliterada, siempre que se cumpla la legislacion aplicable.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para medir la degradacion de NVFP4 frente al BF16 original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y advierte que tampoco se midieron las cifras de rechazo, cumplimiento o divergencia KL de esta ejecucion de abliteracion.

El unico dato de rendimiento publicado es de sistema, medido sobre este checkpoint exacto:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Throughput de decodificacion | 128,8 tok/s | DGX Spark (GB10, SM121), vLLM 0.30, sin carga concurrente, decodificacion especulativa DSpark, --moe-backend marlin + VLLM_MARLIN_USE_ATOMIC_ADD=1, num_speculative_tokens=3 |
| Tasa de aceptacion del borrador | 87,5% | Mismas condiciones |

## Requisitos de hardware

- Almacenamiento y VRAM: el repositorio ocupa 18,9 GB en safetensors, por lo que se necesita al menos esa cantidad para cargar los pesos completos; el reparto entre VRAM y memoria del sistema depende de la configuracion de device_map.
- GPU recomendadas: la cuantizacion NVFP4 esta pensada para hardware NVIDIA Blackwell. La unica configuracion verificada en la model card es una DGX Spark (GB10, SM121). El rendimiento en GPUs Ampere, Ada o anteriores no esta documentado.
- Cabe en GPU de consumo: no disponible. No hay datos publicados sobre ejecucion en RTX 4090, RTX 5090 ni similares, y el soporte nativo de NVFP4 depende de la generacion de la GPU.
- Opciones de despliegue: vLLM 0.30 o superior con --moe-backend marlin y VLLM_MARLIN_USE_ATOMIC_ADD=1. La model card tambien muestra carga directa con transformers (AutoModelForCausalLM con torch_dtype="auto" y device_map="auto"). No se mencionan llama.cpp, Ollama ni TGI.
- Decodificacion especulativa: se apoya en nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark, que no viene incluido en este repositorio y hay que descargar aparte.
- Latencia y throughput: 128,8 tok/s de decodificacion con una tasa de aceptacion del borrador del 87,5% en DGX Spark, en condiciones aisladas y sin carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Alineacion de seguridad | Decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-Abliterated-NVFP4 (este) | 31,6 B totales / 3 B activos (model card); 16,48 B segun safetensors | NVFP4 (pesos y activaciones) | Eliminada (abliteracion con Heretic) | Si, con borrador DSpark externo | nvidia-open-model-license | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 31,6 B totales / 3 B activos | BF16 | Si, alineado por NVIDIA | Si, con el mismo borrador | nvidia-open-model-license | HuggingFace, publicado por NVIDIA |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark | no disponible | NVFP4 | Si, sin modificar | Si, es el borrador | nvidia-open-model-license | HuggingFace, publicado por NVIDIA |

Alternativas de terceros de la misma categoria (MoE de ~30 B totales con ~3 B activos): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina la alineacion de seguridad del modelo. Puede generar contenido que el checkpoint original rechazaria, con el consiguiente riesgo legal y reputacional para quien lo despliegue.
- El autor declara que no midio ni publico las cifras de rechazo, cumplimiento ni divergencia KL de esta ejecucion, por lo que no hay cuantificacion del dano colateral en capacidades.
- No hay ningun benchmark de calidad publicado: se desconoce el impacto real de la abliteracion y de la cuantizacion NVFP4 sobre razonamiento, codigo o matematicas.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluaciones de fidelidad factual en la informacion disponible.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de contexto extenso.
- Cobertura idiomatica limitada a seis idiomas; el rendimiento fuera de ellos no esta documentado.
- La licencia es la NVIDIA Open Model License, heredada del modelo base. Cualquier uso comercial debe revisarse contra sus terminos, y la modificacion (abliteracion y cuantizacion) puede afectar a las condiciones de redistribucion.
- La cuantizacion NVFP4 depende de hardware Blackwell y de versiones concretas de vLLM (0.30 o superior) con flags especificos; el soporte en otros motores de inferencia no esta documentado.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad, lo que aumenta la incertidumbre sobre su comportamiento en produccion.
- El autor recomienda explicitamente un uso responsable y conforme a la legislacion local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qpqpqpqpqpqqqq/Nemotron-3.5-Lightning-30B-A3B-Abliterated-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Borrador de decodificacion especulativa DSpark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Heretic (herramienta de abliteracion): https://github.com/mlabonne/heretic-llm
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
