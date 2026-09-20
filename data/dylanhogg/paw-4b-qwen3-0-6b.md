# dylanhogg/paw-4b-qwen3-0.6b

## Resumen

paw-4b-qwen3-0.6b es el compilador "Standard" del proyecto ProgramAsWeights (PAW), desarrollado por el usuario dylanhogg y asociado al preprint "Program-as-Weights: A Programming Paradigm for Fuzzy Functions" (AIware 2026). No es un modelo conversacional al uso: es un compilador que recibe una especificacion en lenguaje natural (la descripcion de una funcion) y emite como salida un programa diminuto especifico de la tarea, materializado como un adaptador LoRA de aproximadamente 22 MB. Ese adaptador se carga sobre el interprete Qwen3-0.6B y se ejecuta localmente y sin conexion.

El modelo tiene dos piezas diferenciadas. La primera es `compiler/`, un Qwen3-4B-Instruct-2507 afinado como modelo causal de generacion de texto. La segunda es `lora_mapper.pt`, una cabeza mapeadora (tronco, cabeza de coeficientes y matrices base de LoRA aprendibles) que convierte los estados ocultos de los 64 tokens de prefijo en las matrices A y B de cada capa del LoRA de destino. El repositorio ocupa 8,7 GB, coherente con un modelo denso de unos 4000 millones de parametros en precision completa mas la cabeza mapeadora.

Su relevancia esta en el paradigma: en lugar de resolver una tarea "difusa" con un LLM grande en cada llamada, se compila una sola vez a un adaptador pequeno que se ejecuta en un modelo de 0,6B a unos 100 ms por llamada. Es la pieza que invoca `paw.compile(spec, compiler="paw-4b-qwen3-0.6b")` y la que alimenta los programas publicados en programasweights.com.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3-4B-Instruct-2507 afinado) mas cabeza mapeadora tipo hiperred que emite LoRA |
| Parametros totales | Aproximadamente 4000 millones (compilador basado en Qwen3-4B-Instruct-2507); el modelo card no declara una cifra exacta |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; la model card no la especifica. El proceso de compilacion usa 64 tokens de prefijo (`prefix_steps=64`) |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF ni cuantizadas. El adaptador generado (LoRA) ocupa unos 22 MB |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors en `compiler/`; `lora_mapper.pt` (PyTorch) y `meta.json` con la configuracion del mapeador |

Configuracion del mapeador (segun `meta.json`): `lora_rank=64`, `lora_alpha=16`, `lora_num_bases=64`, `prefix_steps=64`, modulos destino `[q,k,v,o,gate,up,down]_proj`.

## Arquitectura y entrenamiento

El compilador es un Qwen3-4B-Instruct-2507 afinado, es decir, un transformer denso decoder-only con atencion por token y modulos proyectores q, k, v, o, gate, up y down. Sobre el se anade una cabeza mapeadora (`lora_mapper.pt`) compuesta por un tronco, una cabeza de coeficientes y un conjunto de matrices base de LoRA aprendibles. El flujo de compilacion tiene tres pasos: el compilador de 4B genera un "pseudo-programa" corto (descripcion de la tarea mas unos pocos ejemplos de entrada/salida) a partir de la especificacion; despues se procesa la concatenacion de `chat_template(spec) + pseudo-programa + 64 tokens de prefijo`; finalmente el mapeador lee los 64 estados ocultos de prefijo y emite las matrices A y B por capa como una mezcla aprendida de matrices base, con rango 64 y alpha 16. El resultado es un LoRA que se carga sobre Qwen3-0.6B y se ejecuta de forma local y offline.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el compilador. La innovacion tecnica central es el propio paradigma program-as-weights: tratar un adaptador LoRA como la representacion ejecutable de un programa, generado por una hiperred condicionada por la especificacion. El snapshot publicado corresponde a la etiqueta git `20260407`, y el codigo limpio de compilacion y ejecucion, junto con el preprint, se anuncian como publicos a partir del 6 de julio de 2026.

## Capacidades

- Compilacion de especificaciones: dada una descripcion en lenguaje natural de una funcion, genera un pseudo-programa y, a partir de el, un adaptador LoRA especifico de la tarea.
- Generacion de texto: al estar basado en Qwen3-4B-Instruct-2507, conserva la capacidad de generacion causal del modelo base, aunque su uso previsto es la compilacion.
- Emision de artefactos ejecutables: produce un LoRA de unos 22 MB con rango 64 sobre los siete modulos proyectores del interprete Qwen3-0.6B.
- Ejecucion local y offline: el programa compilado se ejecuta en el interprete de 0,6B sin conexion, a aproximadamente 100 ms por llamada.
- Integracion mediante SDK: se invoca con `paw.compile(spec, compiler="paw-4b-qwen3-0.6b")` a traves del SDK de Python del proyecto.
- Tool calling y function calling: no se documenta soporte en la informacion disponible.
- Comportamiento agentico o razonamiento multi-paso: no se documenta en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Compilacion de funciones difusas en produccion: una tarea con criterio subjetivo (por ejemplo, clasificar el tono de un mensaje) se describe como especificacion, se compila a un LoRA de 22 MB y se ejecuta sobre Qwen3-0.6B, evitando mantener un LLM grande en el camino critico.
- Reduccion de coste de inferencia: en lugar de invocar un modelo de 4B o superior en cada peticion, se compila una vez y se sirve la tarea con el interprete de 0,6B a unos 100 ms por llamada, bajando el coste por token de forma drastica.
- Despliegue en el borde o sin conectividad: el programa compilado se carga y ejecuta localmente y offline, lo que permite operar en portatiles, equipos de laboratorio o entornos aislados sin enviar datos a un servicio externo.
- Personalizacion por cliente: cada cliente recibe su propio adaptador compilado desde su especificacion, de modo que el interprete de 0,6B es compartido y solo se intercambia el LoRA de 22 MB.
- Prototipado rapido de tareas de NLP: clasificacion, extraccion de campos o normalizacion de texto se pueden describir en lenguaje natural y obtener un artefacto ejecutable sin escribir codigo de entrenamiento.
- Versionado de comportamiento en CI/CD: al ser un fichero de 22 MB, el adaptador se puede almacenar, versionar y comparar en un pipeline, de forma que un cambio de especificacion produce un artefacto auditable y reversible.
- Investigacion en hiperredes y program-as-weights: sirve como implementacion de referencia para estudiar la generacion de pesos condicionada por texto y la mezcla de matrices base de LoRA.
- Cumplimiento y trazabilidad de datos: al ejecutarse localmente sobre un modelo de 0,6B, los datos de inferencia no salen del perimetro de la organizacion, lo que simplifica el cumplimiento en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara un rendimiento de ejecucion de aproximadamente 100 ms por llamada para el programa compilado sobre Qwen3-0.6B.

## Requisitos de hardware

- VRAM para el compilador (Qwen3-4B-Instruct-2507): estimacion de 9-10 GB en bf16/fp16 contando pesos (unos 8 GB) y cache KV; en cuantizacion de 8 bits, aproximadamente 4,5-5 GB; en 4 bits, aproximadamente 2,5-3 GB. Estas cifras son estimaciones aritmeticas a partir del tamano, no datos publicados por el autor.
- VRAM para el interprete (Qwen3-0.6B con el LoRA de 22 MB): estimacion de 1,2-1,5 GB en bf16 y alrededor de 0,5 GB en 4 bits.
- GPU recomendadas para el compilador: A100, H100 o L40S para compilacion por lotes; RTX 4090 y RTX 3090 para uso individual.
- GPU de consumo: el compilador cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando cuantizacion. El interprete de 0,6B cabe en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada en el repositorio) y el SDK de ejecucion del proyecto. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion y cuantizacion propias. El uso con vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: aproximadamente 100 ms por llamada para el programa compilado sobre Qwen3-0.6B. No se publican datos de latencia ni de throughput para el paso de compilacion.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dylanhogg/paw-4b-qwen3-0.6b | Compilador de especificaciones a LoRA | Aproximadamente 4B (denso) | No disponible | No disponible | 0 descargas, 0 likes; sincronizacion del SDK anunciada para julio de 2026 |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo base del compilador, LLM de proposito general | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Ampliamente distribuido en HuggingFace |
| Qwen/Qwen3-0.6B | Interprete destino de los programas compilados | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Ampliamente distribuido en HuggingFace |
| Adaptador LoRA entrenado con PEFT de forma tradicional | Alternativa convencional para especializar un modelo | Depende del rango y los modulos | Hereda el del modelo base | La del modelo base | Ecosistema estandar |

No se conocen en la informacion disponible otros compiladores del mismo paradigma program-as-weights con los que establecer una comparacion directa.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia en la model card, no se puede confirmar que el uso comercial este permitido. Es un bloqueante para produccion hasta aclararlo con el autor.
- Idiomas no declarados: se desconoce el soporte multilingue real del compilador y del interprete.
- Ventana de contexto no especificada: no se documenta la longitud de contexto del compilador, lo que impide planificar especificaciones largas.
- Riesgo de alucinacion en la pseudo-generacion: el primer paso de la compilacion es una generacion de texto libre a partir de la especificacion; si el pseudo-programa es incorrecto, el LoRA resultante heredara el error sin una validacion evidente.
- Calidad de la compilacion dependiente de la especificacion: no hay garantia formal de que el programa compilado implemente la funcion descrita; se requiere evaluacion por tarea.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Estado del codigo: el codigo limpio de compilacion y ejecucion no estara publico hasta julio de 2026; la unica referencia disponible es un snapshot sin limpiar en anonymous.4open.science y el SDK del proyecto.
- Fichero `.pt` en el repositorio: `lora_mapper.pt` es un artefacto PyTorch serializado; cargarlo implica los riesgos habituales de deserializacion de pesos y conviene verificar su procedencia.
- Dependencia del interprete: los programas compilados solo se ejecutan sobre Qwen3-0.6B, lo que ata el despliegue a esa version concreta del modelo.
- Fechas del repositorio: la creacion y actualizacion registradas (20 de septiembre de 2026) y el snapshot `20260407` corresponden a un calendario posterior al momento de esta ficha; conviene verificar la coherencia temporal al evaluar el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dylanhogg/paw-4b-qwen3-0.6b
- Modelo base del compilador: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Interprete destino: https://huggingface.co/Qwen/Qwen3-0.6B
- SDK de Python (carga y ejecucion de programas compilados): https://github.com/programasweights/programasweights-python
- Demo en vivo y hub de programas: https://programasweights.com
- Preprint: https://arxiv.org/abs/2607.02512
- Snapshot de referencia sin limpiar: https://anonymous.4open.science/r/programasweights
- La busqueda web realizada no devolvio enlaces adicionales relevantes al modelo.
