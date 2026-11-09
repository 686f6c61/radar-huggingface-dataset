# Dexverse-CSI/xl-vla-reproduce

## Resumen

XL-VLA reproduce es un artefacto de investigacion publicado por Dexverse-CSI que implementa, sobre el simulador DexVerse, el espacio latente de acciones compartido entre manos ("cross-hand latent action space") propuesto en el articulo XL-VLA (arXiv:2603.10158). No se trata de un modelo de lenguaje, sino de una politica de robotica (diffusion policy) entrenada para manipulacion diestra con cuatro manos de cinco dedos: shadow, inspire, sharpa y wuji, todas ellas manos derechas con muneca flotante. El repositorio contiene dos componentes: un espacio latente compartido de 32 dimensiones con codificadores y decodificadores por mano, y una diffusion policy multitarea entrenada directamente en ese espacio latente.

El objetivo tecnico es la generalizacion entre morfologias ("cross-embodiment"): en lugar de aprender una politica por cada mano, el modelo aprende a actuar en un espacio de acciones abstracto y comun, de forma que la misma politica puede ejecutarse sobre distintas manos traduciendo el vector latente a las articulaciones concretas de cada una. La accion de la politica se define como un vector de 41 dimensiones: 9 para la pose estandar de muneca (xyz mas rot6d) y 32 para el latente de dedos. En ejecucion, el latente se decodifica a las articulaciones de la mano correspondiente y la muneca se resuelve por cinematica inversa con correccion PoE.

El modelo es relevante como referencia reproducible para investigadores que trabajan en politicas de manipulacion multitarea y transferencia entre manos, y como ejemplo de separacion entre espacio de accion abstracto y morfologia fisica. Su alcance es acotado: cubre cuatro tareas de una sola mano en simulacion, no incluye pesos de un VLA completo ni capacidades de vision-lenguaje-accion de proposito general, y no declara idiomas ni benchmarks de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy sobre espacio latente de acciones compartido entre manos; codificadores y decodificadores por mano (latente de 32 dimensiones) y correccion de muneca por tarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la politica opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,2 GB |
| Entradas del modelo | observaciones del simulador DexVerse (no detalladas en la model card) |
| Espacio de accion | 41 dimensiones: 9 de muneca estandar (xyz + rot6d) + 32 de latente de dedos |
| Manos soportadas | shadow, inspire, sharpa, wuji (cinco dedos, mano derecha, muneca flotante) |
| Tareas entrenadas | Dexverse-GraspBleach-v0, Dexverse-GraspPan-v0, Dexverse-GraspKettle-v0, Dexverse-FunctionalHammerStrike-v0 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. La primera es un espacio latente de acciones compartido entre manos: cada mano dispone de un codificador `E_h` que proyecta sus articulaciones de dedos a un vector latente de 32 dimensiones, y de un decodificador `D_h` que realiza la operacion inversa. La muneca se excluye de ese latente y se representa en un sistema de coordenadas estandar independiente de la mano (9 dimensiones: posicion xyz mas rotacion en representacion rot6d), de modo que la accion completa de la politica es la concatenacion de muneca estandar y latente de dedos. La segunda pieza es una diffusion policy multitarea entrenada en ese espacio latente, que genera acciones denoising sobre el vector de 41 dimensiones.

En ejecucion, el vector latente se decodifica con `D_h` a las articulaciones de la mano objetivo y la muneca se resuelve mediante cinematica inversa con correccion PoE (producto de exponenciales) para obtener las articulaciones de muneca de esa mano concreta. El entrenamiento se realiza en el simulador DexVerse sobre cuatro tareas de una sola mano y cuatro morfologias de mano, todas derechas y con muneca flotante. La model card no especifica el numero de trayectorias de demostracion, el numero de pasos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. El codigo se distribuye en la rama `dexverse` del repositorio DexLatent, dentro del paquete `dexverse_xlvla/`, sin modificar el paquete original `HandLatent/`.

## Capacidades

- Manipulacion diestra en simulacion: ejecucion de politicas de diffusion para agarre y uso de herramientas con manos de cinco dedos.
- Generalizacion entre morfologias: una misma politica en espacio latente compartido se traduce a cuatro manos distintas (shadow, inspire, sharpa, wuji) mediante los decodificadores por mano.
- Multitarea: una unica diffusion policy entrenada sobre cuatro tareas (GraspBleach, GraspPan, GraspKettle, FunctionalHammerStrike).
- Control de muneca en coordenadas estandar: representacion independiente de la mano con resolucion por IK y correccion PoE.
- Reproducibilidad de un metodo publicado: implementacion de referencia del espacio latente de manos de XL-VLA sobre DexVerse.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso basado en lenguaje.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), vision general ni audio.

## Casos de uso

- Investigacion en transferencia entre manos: usar el espacio latente compartido para entrenar una politica en una mano y evaluar su traslado a otra morfologia sin reentrenar desde cero, aprovechando que la accion se descompone en latente de dedos y muneca estandar.
- Reproduccion de resultados de XL-VLA: comparar el comportamiento del espacio latente de 32 dimensiones sobre las cuatro tareas de DexVerse con los resultados del articulo original, sirviendo como base de verificacion experimental.
- Desarrollo de politicas multitarea en simulacion: reutilizar la diffusion policy como linea base para tareas de agarre y uso de herramientas con manos antropomorficas de cinco dedos.
- Prototipado de pipelines de robotica antes del despliegue fisico: validar la descomposicion accion latente mas IK de muneca en el simulador antes de portar el esquema a un robot real con una de las cuatro manos soportadas.
- Estudio de abstracciones de accion: analizar como varia el latente de 32 dimensiones entre manos y tareas, y que dimensiones capturan sinergias de dedos, usando los codificadores y decodificadores incluidos en `latent/`.
- Benchmark interno de diffusion policies: emplear las cuatro tareas de DexVerse como conjunto de evaluacion estandarizado para comparar nuevas politicas frente a esta implementacion de referencia.
- Docencia y formacion: utilizar el repositorio como ejemplo completo de espacio de accion compartido, decodificacion por mano e integracion con cinematica inversa en un simulador de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, numeros de episodios de evaluacion ni comparaciones cuantitativas con el articulo original u otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,2 GB en disco, pero la model card no desglosa el tamano de los pesos de la diffusion policy ni de los codificadores y decodificadores por mano.
- GPU recomendadas: no disponible. Al tratarse de una diffusion policy de manipulacion en simulacion, el cuello de botella probable es la simulacion fisica de DexVerse, no la inferencia de la red; la model card no aporta requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamano del repositorio (2,2 GB) sugiere que los pesos caben con holgura en GPUs de consumo; no se confirma en la documentacion.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica; el uso previsto es mediante el paquete `dexverse_xlvla/` del repositorio DexLatent junto con el simulador DexVerse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XL-VLA reproduce (Dexverse-CSI) | Diffusion policy con espacio latente de manos compartido | no disponible | no aplica | MIT | Pesos safetensors en Hugging Face, codigo en DexLatent (rama `dexverse`) |
| XL-VLA (original, arXiv:2603.10158) | Metodo VLA con espacio latente de acciones entre manos | no disponible en la informacion proporcionada | no disponible | no disponible | Articulo en arXiv; pesos y codigo no confirmados en la informacion disponible |
| Diffusion Policy (linea base estandar) | Politica de diffusion para manipulacion | no disponible | no aplica | no disponible | Implementaciones publicas habituales; no verificadas en esta busqueda |

La comparacion cuantitativa con alternativas no esta disponible: no hay datos de rendimiento de esta reproduccion ni del metodo original en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance restringido a simulacion: todas las tareas se ejecutan en DexVerse; no se documenta validacion en robots fisicos ni transferencia sim-a-real.
- Cobertura limitada de morfologias: solo cuatro manos derechas de cinco dedos con muneca flotante; no se contemplan manos izquierdas, configuraciones con muneca fija ni manos de distinto numero de dedos.
- Una sola mano por tarea: las cuatro tareas son de una mano; no hay evidencia de manipulacion bimanual.
- Sin datos de rendimiento: la ausencia de tasas de exito y de comparaciones con el articulo original impide evaluar la fidelidad de la reproduccion.
- Sin informacion de sesgos: al no ser un modelo de lenguaje, no aplican sesgos linguisticos, pero tampoco se documentan sesgos de politica (por ejemplo, dependencia de la distribucion de demostraciones).
- Riesgo de sobreajuste a las tareas y al simulador: al ser una diffusion policy multitarea entrenada sobre cuatro tareas concretas, es previsible un comportamiento degradado fuera de esa distribucion; no se cuantifica.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia cubre los artefactos publicados, no necesariamente las dependencias del simulador DexVerse ni el codigo de terceros, cuyas condiciones deben verificarse por separado.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- Dependencia de codigo externo: el uso requiere la rama `dexverse` del repositorio DexLatent y el simulador DexVerse, lo que anade requisitos de instalacion no detallados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/xl-vla-reproduce
- Articulo XL-VLA: https://arxiv.org/abs/2603.10158
- Codigo (repositorio DexLatent, rama `dexverse`, paquete `dexverse_xlvla/`): https://github.com/EmptyBlueBox/DexLatent
