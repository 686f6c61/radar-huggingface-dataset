# smSquirrel/AnyS1-4B

## Resumen

AnyS1-4B es un modelo "System-1" desarrollado por smSquirrel (autoria del paper atribuida a Rui Li, Liyang He, Zheng Zhang, Zhenya Huang y Qi Liu) que actua como un clasificador de decisiones para flujos de agentes. No es un modelo generativo al uso: dado un estado de agente, una pregunta y un conjunto enumerable de opciones candidatas, puntua cada opcion en un unico forward pass y devuelve probabilidades calibradas. Un mecanismo de compuerta de confianza decide entonces si responder localmente o delegar en un modelo grande "System-2".

Se construye sobre `Qwen/Qwen3.5-4B-Base` mediante un adaptador LoRA (rango 16, alpha 32, dropout 0.05 sobre todas las capas lineales) mas una cabeza de puntuacion especifica (`OptionInteractionHead`, dim 256, equivariante a permutaciones). El resultado es un artefacto de 0,2 GB en formato PEFT que requiere el codigo propietario del proyecto para la inferencia, ya que la cabeza no es compatible con `transformers` estandar.

Su relevancia practica esta en el coste: segun el paper, sustituye llamadas a modelos grandes en los puntos de decision de un flujo de agente y reduce el coste por episodio entre un 75 % y un 91 % manteniendo el exito de tarea aproximadamente igual. Es, por tanto, una pieza de infraestructura de agentes mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de puntuacion `OptionInteractionHead` |
| Parametros totales | 4B (modelo base); adaptador LoRA rango 16, tamano de repo 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), `head.pt` (cabeza), `adapter_config.json`, tokenizer |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (revision `1001bb4d826a52d1f399e183466143f4da7b741b`) y le aplica LoRA sobre todas las capas lineales con rango 16, alpha 32 y dropout 0.05. Sobre la representacion resultante se anade una cabeza de interaccion de opciones (`OptionInteractionHead`, dimension 256) disenada para ser equivariante a permutaciones: el orden de las opciones candidatas no altera la puntuacion asignada a cada una. La salida son probabilidades por opcion, no tokens.

El entrenamiento usa el split de entrenamiento de Any-DP: 25 986 estados ejecutados en contenedor, procedentes de 1 072 skills publicas, cada uno observado bajo tres ordenes de opciones distintos. La funcion de perdida es entropia cruzada con label smoothing de epsilon 0,1 sobre las opciones. No se menciona RLHF ni DPO; el objetivo es puramente de clasificacion calibrada. La innovacion tecnica central es el par pointer model + compuerta de confianza: el modelo pequeno resuelve decisiones cerradas y solo delega al System-2 cuando su probabilidad no supera un umbral calibrado.

## Capacidades

- Puntuacion de decisiones enumerables: recibe un estado, una pregunta y una lista de opciones y devuelve una probabilidad por opcion en un unico forward pass.
- Clasificacion de texto orientada a seleccion de acciones dentro de flujos de agente (pipeline declarado: `text-classification`).
- Calibracion para delegacion: las probabilidades alimentan una compuerta de confianza que decide entre respuesta local y llamada al System-2.
- Equivariancia a permutaciones: el orden de las opciones no sesga el resultado.
- Servicio HTTP con endpoint `/decide` mediante `python -m anys1.model.serve_s1`.
- Integracion como componente de agentes multi-paso, no como generador autonomo.
- Capacidades multilingues: solo ingles declarado.
- No soporta generacion abierta, tool calling nativo ni vision; esas funciones quedan en el System-2.

## Casos de uso

- Enrutamiento de decisiones en agentes de atencion al cliente: cada vez que el agente debe elegir entre acciones discretas (escalar, pedir datos, cerrar ticket), AnyS1 puntua las opciones en milisegundos y solo invoca al modelo grande cuando la confianza es baja.
- Agentes de navegacion web (WebShop, ALFWorld): seleccion de la siguiente accion entre el conjunto de comandos disponibles, con reduccion de coste del 75-91 % por episodio segun el paper.
- Automatizacion de SOPs (SOPBench): resolucion local de los nodos de decision de procedimientos operativos estandar, delegando los casos ambiguos.
- Optimizacion de coste en pipelines multi-agente: sustitucion de llamadas a modelos frontera en los puntos de decision cerrados, manteniendo el System-2 solo para generacion y razonamiento abierto.
- Clasificacion de intenciones con opciones fijas en asistentes conversacionales: el modelo devuelve distribuciones calibradas que permiten fijar umbrales de derivacion a humano.
- Investigacion en sistemas duales: banco de pruebas para estudiar calibracion, umbrales de deferencia y trade-offs coste-exito en arquitecturas System-1/System-2.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| Dev offline (held-out) | 83,8 % de precision |
| SOPBench (nodos E) | 93,5 % de precision |
| Cambio medio de exito de tarea vs. agente todo-System-2 (System-2 = DeepSeek-V4.1-Flash) | +0,5 puntos |
| Cambio medio de exito de tarea vs. agente todo-System-2 (System-2 = GPT-6 Sol) | -0,2 puntos |
| Reduccion de coste por episodio | 75-91 % |
| Reduccion de tiempo de llamada a modelo | 63-92 % |
| Latencia mediana de un pase (1x H100) | 21,8-31,7 ms |
| Latencia por llamada al System-2 | 1,51-1,78 s |

Los datos provienen del paper; no se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 4B parametros y se publica en bf16, por lo que se situa en el rango de 8-10 GB en bf16 y menos con cuantizacion, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el paper reporta latencias medidas en una H100; no se especifican otras GPU.
- Cabe en GPU de consumo: previsiblemente si por tamano del modelo base, pero no esta confirmado en la documentacion y la cabeza personalizada puede limitar el despliegue en herramientas estandar.
- Opciones de despliegue: exclusivamente el servidor propio del repositorio (`python -m anys1.model.serve_s1`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que la cabeza `head.pt` no es compatible con `transformers`.
- Latencia y throughput: 21,8-31,7 ms de mediana por pase en una H100; el throughput agregado no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnyS1-4B | 4B (base) + LoRA | no disponible | Puntuacion de decisiones de agente | Apache 2.0 | Hugging Face + codigo propio |
| Qwen3.5-4B-Base | 4B | no disponible | Generacion de texto general | no disponible en la informacion | Hugging Face |
| DeepSeek-V4.1-Flash (System-2 en el paper) | no disponible | no disponible | Generacion y razonamiento | no disponible en la informacion | Uso como referencia en el paper |
| GPT-6 Sol (System-2 en el paper) | no disponible | no disponible | Generacion y razonamiento | propietaria | API |

No se dispone de datos de benchmarks comparables de modelos de puntuacion de decisiones de agente en la informacion proporcionada; la comparativa se limita a los modelos citados en el propio paper.

## Limitaciones y advertencias

- Solo puntua decisiones enumerables con opciones listadas explicitamente; no genera texto ni resuelve decisiones abiertas.
- Requiere el codigo del proyecto AnyS1 para la inferencia: la cabeza `head.pt` no funciona con `transformers` estandar, lo que complica el despliegue en infraestructura convencional.
- La calibracion se verifico solo en los benchmarks del paper; un flujo nuevo necesita calibrar el umbral de deferencia con episodios de desarrollo o usar el umbral transferido conservador.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible, aunque al ser un clasificador calibrado el riesgo se traslada a la distribucion de probabilidades y al umbral elegido.
- Licencia Apache 2.0 permite uso comercial, pero el codigo auxiliar del repositorio debe revisarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin validacion externa independiente.
- No hay informacion sobre cuantizaciones oficiales ni soporte en frameworks de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smSquirrel/AnyS1-4B
- Pagina del proyecto: https://middle-chunjie.github.io/AnyS1/
- Codigo: https://github.com/middle-chunjie/AnyS1
- Dataset de entrenamiento (Any-DP): https://huggingface.co/datasets/smSquirrel/SkillDP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
