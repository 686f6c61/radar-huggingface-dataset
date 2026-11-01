# orangejuicesmith/Ohm-MythosNano

## Resumen

Mythos-nano es un modelo de lenguaje de 3 mil millones de parámetros publicado por el usuario orangejuicesmith en Hugging Face, basado en un fine-tuning de WeiboAI/VibeThinker-3B (a su vez derivado de la arquitectura Qwen2). Se trata de un modelo especializado en razonamiento, matemáticas de competición y programación, cuyo planteamiento central —según su autor— es que los modelos pequeños pueden alcanzar niveles de razonamiento cercanos a la frontera si se entrenan con retroalimentación verificable.

El modelo destaca por los resultados de benchmark publicados en su model card, donde se le compara favorablemente con sistemas de cientos de billones de parámetros en tareas como AIME25, HMMT25 o concursos de LeetCode. Cabe señalar que estos datos proceden del propio autor y no han sido verificados de forma independiente. Es importante también que se trata de una versión "abliterated" (sin censura): se ha eliminado la dirección de rechazo del modelo, por lo que no declinará peticiones que un modelo con safety tuning normalmente rechazaría.

El proyecto no es oficial de Anthropic (a pesar de la estética de la marca "Mythos") y se distribuye bajo licencia MIT, con pesos en safetensors y GGUF (f16 y Q4_K_M) para su uso con llama.cpp y Ollama. El repositorio pesa 32,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura base Qwen2) |
| Parametros totales | 3.085.938.688 (≈3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y F16; el modelo base admite bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Mythos-nano es un fine-tuning de WeiboAI/VibeThinker-3B, un modelo de razonamiento de 3B construido sobre la arquitectura Qwen2 (transformer decoder denso, no MoE). El modelo genera largas cadenas de razonamiento: la model card recomienda hasta 40.960 tokens de salida para problemas dificiles, lo que indica que emplea test-time compute extendido al estilo de los modelos de razonamiento actuales.

No se han publicado detalles sobre la composición del dataset de fine-tuning, el numero de tokens de entrenamiento ni el metodo exacto (SFT, RL, DPO). La tesis declarada del proyecto es que "con retroalimentacion verificable, los modelos pequenos alcanzan el razonamiento de frontera", lo que sugiere entrenamiento con entornos de verificacion (matematicas de competicion y problemas de codigo con tests). El autor advierte explicitamente que el modelo no fue entrenado con datos de tool calling ni de programacion agentica.

## Capacidades

- Razonamiento matematico de alto nivel: problemas de competicion tipo AIME, HMMT, BruMO y respuestas del tipo IMO.
- Generacion y resolucion de codigo: especialmente fuerte en problemas de programacion competitiva estilo LeetCode (96,1% agregado en concursos, segun el autor).
- Seguimiento de instrucciones: puntuaciones altas en IFEval (93,4) e IFBench (74,5) segun la model card.
- Generacion de texto conversacional en ingles.
- Cadenas de razonamiento largas: hasta 40.960 tokens de salida recomendados para problemas complejos.
- No soporta tool calling ni function calling: el autor desaconseja explicitamente su uso para orquestacion de APIs o agentes autonomos de codigo.
- No incluye capacidades de vision ni audio.
- Version abliterated: sin mecanismos de rechazo de seguridad.

## Casos de uso

- Resolucion de problemas de matematicas de competicion: el modelo puede abordar problemas estilo AIME o IMO generando cadenas de razonamiento extensas (hasta ~41k tokens), su caso de uso principal segun los benchmarks publicados.
- Practica y resolucion de problemas de programacion competitiva: adecuado para problemas estilo LeetCode, donde la model card reporta un 96,1% de tasa de aprobacion en concursos con Python.
- Generacion de soluciones algoritmicas verificables: util para escribir codigo con logica compleja (algoritmos, estructuras de datos) donde la correccion puede comprobarse con tests.
- Asistente de razonamiento logico-matematico offline: gracias a los GGUF Q4_K_M y F16, puede ejecutarse localmente con llama.cpp u Ollama para tareas de razonamiento sin conexion.
- Investigacion sobre razonamiento en modelos pequenos: su tamano de 3B lo hace asequible para experimentos academicos sobre destilacion de razonamiento y entrenamiento con verificacion.
- Prototipado local de chatbots en ingles: pipeline conversacional estandar con chat template, apto para demos de baja latencia en GPU de consumo.
- Evaluacion de modelos abliterated: util para investigar el efecto de eliminar la direccion de rechazo en el comportamiento del modelo.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor y no han sido verificados de forma independiente.

| Model | Params | AIME25 | AIME26 | HMMT25 | BruMO25 | IMO-Ans | LCBv6 | OJBench | GPQA-D | IFEval | IFBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 96,1 | 93,3 | 95,4 | 98,3 | 81,8 | 85,0 | 54,7 | 87,6 | 93,9 | 70,0 |
| GLM-5 | 744B | 96,7 | 95,8 | 97,9 | – | 82,5 | 85,5 | 55,0 | 86,0 | 92,6 | 76,5 |
| DeepSeek V3.2 | 671B | 93,1 | 94,2 | 90,2 | 96,7 | 78,3 | 80,8 | 48,4 | 82,4 | 92,6 | 60,7 |
| Gemini 3 Pro | N/A | 96,0 | 91,7 | 97,5 | 98,3 | 83,1 | 87,4 | 58,8 | 91,9 | – | 70,4 |
| Claude Opus 4.5 | N/A | 92,8 | 95,1 | 92,9 | – | 78,5 | 84,8 | – | 87,0 | – | 58,0 |
| GPT-5 (high) | N/A | 94,6 | – | 88,3 | 91,7 | 76,0 | 84,5 | – | 85,7 | – | 73,1 |
| Mythos-nano | 3B | 91,4 | 94,3 | 89,3 | 93,8 | 76,4 | 80,2 | 38,6 | 70,2 | 93,4 | 74,5 |
| Mythos-nano + CLR | 3B | 96,7 | 97,1 | 95,4 | 99,2 | 80,6 | – | – | 72,9 | – | – |

Resultados en concursos de LeetCode (Python, tasa de aprobacion agregada):

| Model | Aggregate |
|---|---|
| GPT-5.3-Codex | 100,0% (128/128) |
| Gemini 3.1 Pro | 99,2% (127/128) |
| Gemini 3 Flash | 96,9% (124/128) |
| Mythos-nano | 96,1% (123/128) |
| GPT-5.2 | 95,3% (122/128) |
| Qwen3-Max | 91,4% (117/128) |
| Kimi K2.5 | 90,6% (116/128) |
| Claude Opus 4.6 | 86,7% (111/128) |

## Requisitos de hardware

- VRAM estimada para inferencia: con ~3,09 B de parametros, la version F16 requiere aproximadamente 6-7 GB de VRAM mas espacio para el contexto; la version Q4_K_M requiere alrededor de 2-2,5 GB. Para generar hasta 40.960 tokens de salida sera necesario reservar memoria adicional para la cache KV.
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060 Ti) es suficiente para la version cuantizada; para F16 con contextos largos, una RTX 4090 (24 GB) resulta comoda.
- Cabe en GPU de consumo: si, tanto en cuantizacion Q4_K_M como en F16 en GPUs de gama media y alta.
- Opciones de despliegue: llama.cpp y Ollama (GGUF incluidos en el repositorio), transformers con bfloat16 y device_map="cuda", y endpoints compatibles en Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mythos-nano | 3,09 B | Razonamiento, matematicas, codigo competitivo | MIT | Abierto (safetensors, GGUF) |
| WeiboAI/VibeThinker-3B (modelo base) | ~3 B | Razonamiento matematico/codigo | no disponible | Abierto en Hugging Face |
| Qwen2.5-3B-Instruct | 3 B | General, multilingue | Qwen (uso comercial condicionado) | Abierto |
| Phi-3.5-mini (3,8 B) | 3,8 B | General, razonamiento | MIT | Abierto |

Frente a otros modelos de ~3B, Mythos-nano se posiciona como especialista en razonamiento de competicion en lugar de modelo generalista, y es uno de los pocos de su tamano con licencia MIT totalmente permisiva. Sus resultados publicados en matematicas superan con creces a los de otros modelos small de la misma clase, aunque proceden del propio autor.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado la direccion de rechazo, por lo que no se negara a peticiones que un modelo con safety tuning rechazaria. La responsabilidad legal y etica de los outputs recae en el usuario.
- Sin soporte de tool calling ni agentes: el autor desaconseja explicitamente su uso para function calling, orquestacion de APIs o agentes autonomos de codigo.
- Especializacion estrecha: su fortaleza es matematicas de competicion y codigo competitivo; en conocimiento general (GPQA-D: 70,2) queda por detras de los sistemas de frontera.
- Benchmarks sin verificacion independiente: todos los resultados proceden de la model card del autor.
- Idioma: entrenado y documentado para ingles; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion: no disponible informacion especifica, aunque como todo modelo de lenguaje puede generar contenido incorrecto con fluidez.
- Longitud de contexto: no publicada; debe validarse antes de usarla en produccion.
- Proyecto comunitario de bajo recorrido: 331 descargas y 0 likes en el momento de redactar la ficha, sin organizacion respaldatoria detras, lo que anade riesgo de abandono o de resultados no reproducibles.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantias de ningun tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orangejuicesmith/Ohm-MythosNano
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- No se han encontrado enlaces adicionales a papers, blogs o demos en la informacion disponible.
