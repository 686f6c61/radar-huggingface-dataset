# kagakouko/Spatial-Interactor-Qwen2.5-VL-3B

## Resumen

Spatial-Interactor-Qwen2.5-VL-3B es un ajuste fino de parametros completos (full-parameter) en BF16 sobre Qwen/Qwen2.5-VL-3B-Instruct, orientado especificamente al razonamiento espacial a partir de interacciones con el mundo fisico observable. Lo publica el usuario kagakouko en HuggingFace y procede del trabajo "Spatial-Interactor: Learning Spatial Reasoning through Interaction with the Observable Physical World", desarrollado por el grupo ZJU-OmniAI (Universidad de Zhejiang), cuyo codigo y pagina de proyecto se enlazan en la model card.

El modelo resuelve un problema concreto: que un VLM de tamano pequeno sea capaz de inferir transiciones de estado local del mundo y de ego-movimiento (world-state y ego-motion) y de encadenarlas a lo largo de trayectorias largas de video, algo critico en robotica, conduccion autonoma y agentes embodied. Para ello combina un entrenamiento supervisado (SFT) sobre el split L1-L2 del dataset LSI-108K mas una mezcla publica de QA espacial, seguido de On-Policy Distillation (OPD) con recompensas verificables y autodestilacion privilegiada basada solo en CoT sobre preguntas de video de horizonte largo.

Su relevancia actual radica en que entrega capacidades de razonamiento espacial temporal en un checkpoint de ~4,07 mil millones de parametros que se ejecuta con la interfaz estandar de Transformers del modelo base, sin necesidad de trazas privilegiadas, modelo de recompensa ni rama de profesor en inferencia. Es, por tanto, una pieza candidata para prototipos embodied en hardware de gama media. La model card no publica resultados de benchmarks ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (encoder visual + proyector multimodal + LLM decoder), heredada de Qwen2.5-VL-3B-Instruct |
| Parametros totales | 4.065.787.904 (~4,07 B) segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Solo BF16 en safetensors; no se publican cuantizaciones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | qwen-research (license_name: qwen-research, license: other) |
| Formato de pesos | safetensors (checkpoint full-parameter en BF16); tamano del repo 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-VL-3B-Instruct: un transformer multimodal con encoder visual, proyector multimodal que alinea las representaciones visuales con el espacio de embeddings del lenguaje, y un decoder de lenguaje autorregresivo. Acepta entradas de imagen y video junto con preguntas en lenguaje natural, y su pipeline declarado es image-text-to-text. No es un modelo MoE ni un modelo de espacio de estados (SSM): es un transformer denso de ~4,07 B de parametros totales.

El entrenamiento consta de dos etapas descritas en la model card. La primera es un SFT sobre el split L1-L2 de LSI-108K junto con la mezcla publica de QA espacial descrita en el paper. La segunda es On-Policy Distillation (OPD), que parte del checkpoint SFT y combina recompensas verificables sobre la respuesta con autodestilacion privilegiada basada unicamente en CoT para preguntas de video de horizonte largo. Durante el entrenamiento, el encoder visual permanece congelado, mientras que el modelo de lenguaje y el proyector multimodal se actualizan; la traza privilegiada de transiciones se usa solo en entrenamiento. En inferencia, el checkpoint consume las mismas entradas de imagen/video y pregunta que el modelo base y no requiere traza adicional, modelo de recompensa ni rama de profesor. Para evaluacion en video, la model card recomienda preservar el orden cronologico de los fotogramas y usar el presupuesto de frames del benchmark objetivo; la evaluacion principal del paper usa 32 fotogramas ordenados.

## Capacidades

- Generacion de texto e image-text-to-text conversacional a partir de imagenes y video, con la interfaz estandar de Transformers del modelo base.
- Razonamiento espacial explicito: estimacion de estado local del mundo y de transiciones de ego-movimiento derivadas del ajuste fino especifico.
- Razonamiento sobre trayectorias largas de video, apoyado en la etapa OPD sobre preguntas de video de horizonte largo (32 fotogramas ordenados en la evaluacion principal del paper).
- Comprension de escenas fisicas orientada a embodied AI: relaciones espaciales entre objetos, movimiento relativo y cambios de estado.
- Capacidades heredadas de Qwen2.5-VL-3B-Instruct en conversacion multimodal (no se detallan en la informacion proporcionada mas alla de la etiqueta conversational).
- Tool calling / function calling: no documentado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el enfasis esta puesto en el encadenamiento de transiciones sobre trayectorias, no en agentes con herramientas.
- Capacidades multilingues: no disponibles (la model card no lista idiomas).
- Capacidades especiales: modo de razonamiento basado en CoT para autodestilacion durante el entrenamiento; sin vision adicional ni audio documentados.

## Casos de uso

- Manipulacion robotica con feedback visual: el modelo puede responder preguntas del tipo "¿donde esta el objeto respecto al efector?" en cada fotograma, y su entrenamiento en transiciones de ego-movimiento permite mantener coherencia entre pasos sucesivos de una secuencia de agarre.
- Navegacion asistida en interiores: dado un video de 32 fotogramas en orden cronologico, el modelo razona sobre cambios de posicion relativa y estado del entorno, lo que sirve como modulo de comprension de escena en un stack de navegacion.
- Inspeccion de infraestructuras con dron: analisis de secuencias de video de recorridos para localizar elementos y describir su posicion relativa a lo largo de la trayectoria, aprovechando el ajuste en trayectorias largas.
- Anotacion y curado de datasets espaciales: generacion de pares pregunta-respuesta espaciales sobre video e imagen para pre-etiquetado, dado el dominio del modelo (LSI-108K y mezclas de QA espacial).
- Asistencia a personas con discapacidad visual: descripcion de escenas en tiempo real o casi real, incluyendo relaciones espaciales y cambios de posicion, en una GPU de gama media gracias al tamano de 4,07 B.
- Analisis de video para retail o logistica: seguimiento de objetos y estados (por ejemplo, si un articulo ha sido retirado o recolocado) a partir de secuencias de camara fija.
- Prototipado en investigacion embodied/AR-VR: sustituto ligero y desplegable del modelo base para experimentos de razonamiento espacial sin necesidad de infraestructura de profesor o recompensa en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un paper y una pagina de proyecto, pero no incluye tablas numericas (MMLU, HumanEval, GSM8K, VSI-Bench ni similares) en el material proporcionado.

## Requisitos de hardware

- Pesos en BF16: ~8,1 GB de checkpoint, equivalente a unos 8,1 GB de VRAM solo para los parametros.
- VRAM estimada para inferencia: ~10-12 GB en BF16 con overhead de activaciones y cache KV; entre 4 y 6 GB si se cuantiza a 4 bits (requiere conversion propia, no se publican GGUF ni AWQ/GPTQ).
- El coste de VRAM crece con el numero de fotogramas de video: la evaluacion principal del paper usa 32 fotogramas ordenados, lo que anade tokens visuales al contexto y puede elevar el consumo.
- GPU recomendadas: A100 40/80 GB y H100 para lotes grandes y video de contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso monousuario comodo; RTX 4080/4070 Ti (16 GB) y RTX 4060 Ti 16 GB como minimo practico en BF16.
- Cabe en GPU de consumo: si. 24 GB sin problemas en BF16; 12-16 GB requiere cuantizacion o reducir frames y longitud de contexto.
- Opciones de despliegue: Transformers (ruta oficial indicada en la model card), Text Generation Inference (el repo incluye la etiqueta text-generation-inference y endpoints_compatible), y vLLM por soporte de la familia Qwen2.5-VL. Ollama y llama.cpp requeririan convertir los pesos a GGUF, formato que no se distribuye.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spatial-Interactor-Qwen2.5-VL-3B | 4.065.787.904 (~4,07 B) | No disponible | Razonamiento espacial y transiciones en video (SFT + OPD) | qwen-research | HuggingFace, safetensors BF16 |
| Qwen2.5-VL-3B-Instruct (modelo base) | Mismo numero de parametros (es el mismo checkpoint ajustado) | No disponible en la informacion proporcionada | VLM conversacional generalista imagen/video | qwen-research | HuggingFace, safetensors |
| Otros VLM especializados en razonamiento espacial (por ejemplo, de la familia SpatialRGPT o RoboPoint) | No disponible | No disponible | Razonamiento espacial / affordance robotica | No disponible | No disponible |

La busqueda web realizada no devolvio informacion utilizable sobre modelos alternativos; los unicos datos comparativos fiables son los del modelo base, del que este checkpoint hereda arquitectura, tamano y licencia, y del que se diferencia unicamente por el ajuste fino y la etapa de destilacion.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion con restricciones para uso comercial. Cualquier despliegue productivo requiere revisar los terminos del enlace de licencia del modelo base.
- Los pesos derivan del modelo base, por lo que heredan sus sesgos y limitaciones de alineacion; la model card no documenta mitigaciones adicionales.
- Riesgo de alucinacion en coordenadas, distancias y relaciones espaciales: no se publican metricas de error espacial que permitan acotar la fiabilidad.
- Ausencia total de benchmarks publicos en la informacion disponible: no hay evidencia cuantitativa de mejora frente al modelo base.
- Solo se distribuye el checkpoint en BF16; no hay GGUF, AWQ ni GPTQ, lo que obliga a convertir para despliegues en GPU pequenas o CPU.
- Restriccion practica de video: la evaluacion principal usa 32 fotogramas ordenados; alterar el orden o exceder ese presupuesto puede degradar el razonamiento sobre trayectorias.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ingles o de los idiomas cubiertos por el modelo base.
- Obligacion de cumplir las licencias de los datasets y medios de entrada; el propio autor lo advierte en la model card.
- Capacidades de tool calling, agentes y multi-step reasoning con herramientas no estan documentadas para este checkpoint.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- Escala 3B: esperable menor robustez que variantes de 7B o mayores en tareas espaciales complejas, aunque no hay datos publicados que lo cuantifiquen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kagakouko/Spatial-Interactor-Qwen2.5-VL-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Pagina del proyecto: https://zju-omniai.github.io/Spatial-Interactor/
- Codigo: https://github.com/ZJU-OmniAI/Spatial-Interactor
- Dataset LSI-108K: https://huggingface.co/datasets/kagakouko/LSI-108K
- La busqueda web ejecutada no devolvio ningun enlace relevante sobre este modelo: los resultados fueron paginas genericas de ayuda de Google (YouTube Help, Gmail Help, Google Help), sin relacion con el modelo.
