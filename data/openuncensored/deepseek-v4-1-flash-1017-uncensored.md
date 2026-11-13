# OpenUncensored/DeepSeek-V4.1-Flash-1017-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored es una variante modificada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el colectivo OpenUncensored. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con aproximadamente 763.000 millones de parametros totales, entrenado originalmente para generacion de texto y conversacion, al que se le han eliminado los mecanismos de rechazo (refusals) mediante ablacion direccional sobre los pesos. El objetivo declarado es ofrecer un modelo que responda a peticiones que el original rechazaria, manteniendo practicamente intacta su capacidad de razonamiento y conocimiento.

La relevancia de esta publicacion reside en su metodologia de "abliteracion" quirurgica: a diferencia de otras builds no censuradas que pierden varios puntos en pruebas de conocimiento (el autor cita una perdida de 3,9 puntos en MMLU para la build de dealignai), esta version reporta una caida de solo 0,27 puntos (88,16% a 87,89%). El autor atribuye esta preservacion a que la edicion se aplica no solo a la atencion y al experto compartido, sino tambien a los 384 expertos enrutados, que segun sus pruebas reinyectan la direccion de rechazo si no se modifican.

El modelo conserva el formato, tamano (510 GB) y codigo de inferencia del original, con pesos en FP8 e4m3 para la mayoria de tensores y FP4 para los expertos enrutados. Se distribuye bajo licencia MIT, igual que el modelo base, y esta pensado para despliegues en hardware de gama alta (el autor cita 8x H200 para sus mediciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con atencion y feed-forward por capas y 384 expertos enrutados; incluye capas MTP, embeddings, routers, tablas Engram y vision |
| Parametros totales | 763.205.315.794 (~763 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 con escalas de bloque ue8m0, FP4 para expertos enrutados; pesos en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors; requiere conversion con `inference/convert.py` para model parallel |

## Arquitectura y entrenamiento

El modelo es una variante del DeepSeek-V4.1-Flash-1017, un transformer MoE de gran escala con 384 expertos enrutados, un experto compartido y capas de prediccion multi-token (MTP). Los pesos se almacenan en FP8 (e4m3) con escalas de bloque ue8m0 para la mayoria de tensores y en FP4 para los expertos enrutados, lo que reduce el tamano del repositorio a 510,3 GB. El modelo incluye ademas modulos de vision y tablas Engram, segun la descripcion del autor.

El proceso de "descensura" consistio en ablacion direccional sobre el flujo residual. El autor calculo las activaciones del flujo residual colapsado en el ultimo token del prompt para 256 prompts daninos y 256 inofensivos, en modo chat y en modo thinking, en las 40 capas del modelo. A partir de la diferencia de medias por capa y modo, extrajo un subespacio de rechazo de rango 2 (`Q`) mediante los vectores singulares principales de las direcciones en las capas 8 a 39. Ese subespacio se proyecta fuera de lo que cada capa escribe en el flujo residual: la salida de atencion (`attn.wo_b`) y la salida completa del feed-forward, incluidos los 384 expertos enrutados (`ffn.experts.*.w2`) y el experto compartido. La intensidad por capa y componente se eligio mediante busqueda multiobjetivo con Optuna, equilibrando la eliminacion de rechazos en prompts reservados y la deriva respecto al original en prompts inofensivos. Finalmente, 5.815 tensores se decodificaron a float32, se editaron y se recodificaron a sus formatos FP8/FP4 originales con nuevas escalas de bloque potencia de dos y redondeo estocastico. El resto de tensores (capas MTP, embeddings, routers, tablas Engram, vision) son identicos byte a byte al original. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en modo chat.
- Razonamiento en modo thinking (el modelo base soporta modo de pensamiento; el autor mide MMLU-Pro con thinking mode y limite de 1.536 tokens).
- Conocimiento general y academico (MMLU, MMLU-Pro medidos por el autor).
- Respuesta a peticiones daninas que el modelo original rechazaria, incluidas peticiones parcialmente respondidas o evadidas en el original.
- Capacidades de vision (el modelo base incluye modulos de vision, segun la descripcion de tensores).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica que las tareas largas de agente no se han medido.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se distribuyen las direcciones de rechazo en un MoE de gran escala y que componentes (atencion, experto compartido, expertos enrutados) las escriben en el flujo residual, usando `edit.pt` para reproducir o analizar la edicion.
- Red teaming y evaluacion de robustez: al eliminar los rechazos, sirve como referencia para medir la eficacia de filtros de seguridad externos, clasificadores de contenido o politicas de moderacion en pipelines de produccion.
- Generacion de contenido creativo sin restricciones tematicas: el modelo responde a peticiones que el original rechazaria, util para guiones, ficcion o divulgacion de temas sensibles (seguridad ofensiva, farmacologia, etc.) en entornos controlados.
- Analisis de seguridad ofensiva y educacion: el autor pone como ejemplo una peticion para explicar inyeccion SQL con un ejemplo funcional; el modelo puede usarse en formacion de desarrolladores sobre vulnerabilidades, siempre con supervision y cumplimiento legal.
- Despliegue en infraestructura propia de alta gama: con 763.000 millones de parametros y 510 GB de pesos, requiere conversion a model parallel (por ejemplo, MP8) y ejecucion con el codigo `inference/` de DeepSeek en nodos con multiples GPU H200 o equivalentes.
- Acceso via API compatible con OpenAI: para equipos sin GPUs, el autor ofrece un endpoint en `api.openuncensored.com` que sirve un modelo no censurado de DeepSeek V4.1 Flash 1017 desde sus socios de hosting, lo que permite integrarlo en aplicaciones existentes sin infraestructura propia.
- Evaluacion comparativa de tecnicas de abliteracion: el repositorio incluye `edit.pt` con `Q` y las intensidades por capa, lo que permite comparar esta metodologia (edicion de expertos enrutados) con otras builds que solo editan atencion y experto compartido.

## Benchmarks y rendimiento

Los datos proceden del autor y se midieron en el mismo motor de referencia (8x H200, decodificacion greedy). El tamano de muestra es pequeno (112 preguntas de MMLU-Pro, 48 peticiones daninas), por lo que el autor advierte que diferencias de una o dos preguntas son ruido.

| Benchmark | DeepSeek V4.1 Flash 1017 | Este modelo |
|---|---|---|
| MMLU (57 materias x 20 preguntas, solo letra) | 88,16% | 87,89% |
| MMLU-Pro (112 preguntas, 8 por categoria, thinking mode, limite 1.536 tokens) | 81,25% | 80,36% |
| Peticiones daninas respondidas por completo (48, evaluadas por modelo juez) | 9 | 37 |
| Peticiones daninas parcialmente respondidas (evadidas) | 37 | 11 |
| Peticiones daninas rechazadas | 2 | 0 |

El autor cita como comparacion la build no censurada de dealignai del mismo modelo, que reporta MMLU 87,63% → 83,77% (−3,86) en el mismo protocolo de 57 x 20. No se han medido GPQA ni tareas largas de agente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 510,3 GB en FP8/FP4, por lo que se necesita un total de memoria agregada superior a esa cifra; el autor usa 8x H200 (8 x 141 GB = 1.128 GB) con model parallel 8.
- GPU recomendadas: H200 (el autor mide en 8x H200); por tamano, tambien serian necesarios nodos multi-GPU con A100 80 GB (al menos 8 unidades) o H100 80 GB (al menos 7-8 unidades). No cabe en una sola GPU.
- Consumer GPU: no es viable en RTX 4090 ni en ninguna GPU de consumo individual; el modelo no cabe en 24 GB ni en 48 GB.
- Opciones de despliegue: el autor indica que se carga con el codigo `inference/` de DeepSeek sin cambios, mediante `convert.py` (conversion a model parallel) y `generate.py` con `torchrun`. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.
- Alternativa sin GPUs: API compatible con OpenAI en `api.openuncensored.com` (requiere clave `OU_API_KEY`).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored (este) | ~763 mil millones | no disponible | 87,89% | MIT | Pesos en HF (510,3 GB), 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | ~763 mil millones | no disponible | 88,16% | MIT (segun el autor) | Modelo base en HF |
| Build no censurada de dealignai del mismo modelo | ~763 mil millones | no disponible | 83,77% (reportado por el autor) | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo responde a peticiones daninas que el original rechazaria (37 de 48 respondidas por completo frente a 9 del original); el propio autor advierte que el usuario es responsable del uso y del cumplimiento legal en su jurisdiccion.
- Riesgo de alucinacion: no se han publicado mediciones especificas de veracidad o factualidad; el unico dato es la caida de 0,27 puntos en MMLU, insuficiente para descartar degradaciones en otras areas.
- Las muestras de evaluacion son pequenas (112 preguntas de MMLU-Pro, 48 peticiones daninas), por lo que las diferencias pueden ser ruido; el autor lo reconoce explicitamente.
- No se han medido GPQA ni tareas largas de agente, por lo que el rendimiento en razonamiento cientifico avanzado y en flujos agenticos es desconocido.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se especifica cobertura multilingue.
- Longitud de contexto: no disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base y la edicion pueden estar sujetos a las condiciones de DeepSeek; el autor afirma que mantiene la licencia MIT de DeepSeek.
- El modelo no esta alojado en Hugging Face como build exacta segun el autor ("This exact build is not hosted yet"); el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente.
- Requiere hardware de gama alta (multi-GPU H200/A100/H100) y el codigo de inferencia propio de DeepSeek; no hay soporte documentado para motores de inferencia populares como vLLM o llama.cpp.
- La edicion de pesos se realizo con redondeo estocastico y nuevas escalas de bloque, lo que introduce una fuente adicional de deriva respecto al original no cuantificada de forma exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenUncensored/DeepSeek-V4.1-Flash-1017-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- API de OpenUncensored: https://openuncensored.com
- Endpoint compatible con OpenAI: https://api.openuncensored.com/v1/chat/completions
- Repositorio con `edit.pt`: incluido en el propio repositorio de Hugging Face del modelo
- Codigo de inferencia de DeepSeek: `inference/README.md` dentro del repositorio del modelo base
