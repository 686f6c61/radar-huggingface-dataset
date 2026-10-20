# L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps

## Resumen

L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps es un ajuste fino por aprendizaje por refuerzo del modelo denso Qwen/Qwen3-4B-Base, publicado por el usuario L1nkee. El entrenamiento aplica GRPO con el objetivo recortado de PPO sobre el conjunto DAPO-Math-17k (17.000 problemas de matematicas verificables), usando la libreria verl para orquestar el rollout y el calculo de recompensas con Math-Verify. No se trata de un modelo nuevo: es un experimento de RL reproducible sobre un base de 4.022.468.096 parametros, con el modo *thinking* activado durante el rollout.

El interes del artefacto es metodologico mas que de producto: publica las 54 instantaneas intermedias del entrenamiento (ramas `step-10` a `step-540`, cada 10 pasos) con pesos bf16 fusionados desde los checkpoints FSDP. Eso permite estudiar la dinamica de la recompensa y la evolucion de capacidades de razonamiento matematico paso a paso, algo poco habitual en checkpoints abiertos. El autor reporta AIME 2024 con Avg@16: mejor resultado del 27,29 % en el paso 260 y 23,33 % en el paso final 540, lo que evidencia cierto deterioro en la cola del entrenamiento.

Es relevante ahora porque ejemplifica una practica creciente: derivar modelos "thinking" economicos (4B, Apache-2.0, sin destilacion propietaria) mediante RL puro sobre datos verificables, con receta completa publicada (hiperparametros, seed, clipping, agregacion de perdida). La ventana de contexto no se especifica en la model card y el repo completo ocupa 434,4 GB por acumulacion de ramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), sin MoE |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen3-4B-Base |
| Tipos de cuantizacion | no se distribuyen cuantizaciones; pesos en bf16 (convertibles a GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen3 declara caracter multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde checkpoints FSDP) |
| Longitud maxima de prompt en entrenamiento | 2.048 tokens |
| Longitud maxima de respuesta en entrenamiento | 8.192 tokens |
| Repositorio | 434,4 GB (incluye 54 ramas `step-<N>`) |
| Libreria | transformers (compatible con TGI y endpoints) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base: un transformer decoder-only denso con atención por grupos de consultas (GQA) y embeddings rotatorios, preentrenado por Alibaba Qwen. Sobre ese base no se anade estructura nueva; el ajuste es puramente de pesos. El modo *thinking* se activa en el formato de plantilla durante el rollout, de modo que las respuestas incluyen una traza de razonamiento antes de la respuesta final, y la recompensa se calcula solo sobre la respuesta extraida.

La receta de RL es GRPO con objetivo recortado de PPO: epsilon = 0,2/0,2, dual-clip c = 3, ventaja normalizada por la desviacion tipica del grupo, agregacion de perdida token-mean, recompensa binaria 1/0 de correccion segun Math-Verify, sin penalizacion KL y sin bonus de entropia. Hiperparametros: learning rate constante 1e-5 sin warmup, weight decay 0,1, batch de 128 prompts x 8 rollouts a temperatura 1,0, mini-batch de 64 y una epoca de actualizacion por iteracion. El entrenamiento cubre 540 pasos, equivalentes a 4 epocas sobre DAPO-Math-17k (135 pasos por epoca), con semilla 42, pesos maestros en bf16 bajo FSDP y rollout en bf16 con vLLM.

La innovacion practica no esta en el algoritmo sino en la trazabilidad: se publica cada checkpoint intermedio como rama independiente, con lo que se puede reproducir la curva de AIME 2024 a lo largo del entrenamiento. La combinacion de recompensa verificable, KL = 0 y learning rate bajo y constante esta disenada para evitar colapso de entropia, aunque los resultados finales sugieren que no lo evita del todo.

## Capacidades

- Generacion de texto autoregresiva con modo *thinking*: produce cadenas de razonamiento extensas (hasta 8.192 tokens en entrenamiento) antes de la respuesta.
- Razonamiento matematico de competicion: entrenado especificamente sobre problemas verificables de DAPO-Math-17k y evaluado en AIME 2024.
- Generacion de codigo y matematicas basicas: capacidades heredadas del base Qwen3-4B-Base, no reforzadas por el RL.
- Soporte de tool calling / function calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado a la traza de pensamiento interna; no hay entrenamiento especifico de uso de herramientas.
- Capacidades multilingues: no evaluadas; dependen del base Qwen3-4B-Base, no del ajuste RL.
- Capacidad especial: seleccion de checkpoint por rama (`step-10` a `step-540`) para experimentacion con el trade-off entre rendimiento y sobreajuste.
- No soporta vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre dinamica del RL: cargar distintas ramas (`step-10`, `step-260`, `step-540`) y medir como evoluciona la precision en AIME 2024, la longitud media de respuesta y la entropia de la politica, sin reentrenar.
- Reproduccion de recetas GRPO: el autor publica clipping, learning rate, batch, seed y agregacion de perdida, lo que permite replicar el pipeline con verl sobre DAPO-Math-17k y comparar curvas.
- Baseline para tecnicas de RL estable: util como punto de partida para probar penalizacion KL, bonus de entropia o curriculum, ya que se conoce el comportamiento sin KL (mejor resultado en el paso 260, caida posterior).
- Generacion de soluciones matematicas asistida por ordenador: integrarlo en un pipeline que plantee problemas de nivel olimpiada, genere la traza y valide la respuesta final con Math-Verify antes de aceptarla.
- Destilacion hacia modelos mas pequenos: usar las trazas de razonamiento del paso 260 como datos de entrenamiento supervisado para modelos de 0,5B-1,5B.
- Prototipado en local de asistentes de razonamiento: con 4B parametros en bf16 (unos 8 GB) cabe en una RTX 4090 o en una RTX 3060 de 12 GB cuantizado, lo que permite iterar sin cluster.
- Evaluacion de robustez y alucinacion en matematicas: comparar la tasa de respuestas incorrectas pero confiadas entre checkpoints tempranos y tardios.

## Benchmarks y rendimiento

Unico benchmark publicado en la model card: AIME 2024 (30 problemas, Avg@16, temperatura 1,0, top-p 0,9).

| Modelo / checkpoint | AIME 2024 (Avg@16) | Notas |
|---|---|---|
| Este modelo, step 260 | 27,29 % | Mejor resultado de la curva |
| Este modelo, step 540 (main) | 23,33 % | Paso final; caida de 3,96 puntos respecto al mejor |
| Qwen/Qwen3-4B-Base | no disponible | Sin datos en la informacion proporcionada |
| Qwen/Qwen3-4B | no disponible | Sin datos en la informacion proporcionada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingues en la informacion disponible. Tampoco se aporta comparacion con el modelo base sin RL, por lo que no es posible cuantificar la ganancia atribuible al entrenamiento GRPO.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8,05 GB solo de pesos, mas cache KV; con contexto de 8.192 tokens y batch pequeno, el consumo realista se situa en 12-16 GB.
- VRAM en cuantizacion de 8 bits: unos 4-5 GB de pesos; en 4 bits (GGUF Q4_K_M o AWQ), unos 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir con alto throughput y contextos largos; L40S o RTX 6000 Ada como alternativa de coste medio.
- Cabe en GPU de consumo: si. RTX 4090 (24 GB) en bf16 con contexto completo; RTX 3090 (24 GB) equivalente; RTX 4060 Ti 16 GB y RTX 3060 12 GB requieren cuantizacion a 8 o 4 bits.
- Despliegue: vLLM (usado por el autor para el rollout), TGI (el repo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), transformers con `AutoModelForCausalLM`, y llama.cpp/Ollama tras conversion a GGUF.
- Aviso de descarga: clonar el repo completo supone 434,4 GB por las 54 ramas; conviene descargar una sola revision con `revision="step-260"` para reducir a unos 8 GB.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia estructural, un denso de 4B en bf16 sobre una RTX 4090 admite decodificacion interactiva, pero el modo *thinking* con respuestas de hasta 8.192 tokens multiplica la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B-Base + GRPO) | 4,02B | no disponible | AIME 2024: 27,29 % (step 260) / 23,33 % (step 540) | Apache-2.0 | HuggingFace, 54 ramas por paso |
| Qwen/Qwen3-4B-Base | 4,02B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B | 4,02B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en la informacion proporcionada | no disponible | MIT (segun su model card, no verificada aqui) | HuggingFace |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: el autor no evalua el modelo base ni modelos de referencia bajo el mismo protocolo. La comparacion relevante es interna (step 260 frente a step 540) y metodologica (GRPO con KL = 0 frente a variantes con penalizacion KL).

## Limitaciones y advertencias

- Entrenado exclusivamente sobre matematicas: el refuerzo se limita a DAPO-Math-17k y la recompensa es correccion de respuesta; no hay RLHF de utilidad, seguridad ni seguimiento de instrucciones generales.
- Sin alineamiento de seguridad: al derivar de un modelo *base*, no incorpora rechazos ni filtros de contenido; no es apto como asistente de usuario final sin una capa adicional.
- Deterioro en la cola del entrenamiento: AIME 2024 cae de 27,29 % en el paso 260 a 23,33 % en el 540, lo que sugiere sobreajuste, colapso de entropia o degradacion de la politica; el checkpoint `main` no es el mejor.
- Sin penalizacion KL (coeficiente 0) ni bonus de entropia: mayor riesgo de desviacion respecto a la distribucion del modelo base y de perdida de diversidad en las muestras.
- Una sola semilla (42) y un solo conjunto de datos: no hay evidencia de que los resultados sean estables entre ejecuciones.
- Riesgo de alucinacion en reasoning: el formato *thinking* puede producir cadenas plausibles con resultados finales incorrectos; se recomienda validacion externa con Math-Verify.
- Idiomas no evaluados: la model card no declara cobertura linguistica y el ajuste RL es en ingles matematico; el rendimiento en castellano no esta medido.
- Contexto no documentado: la model card no indica la ventana nativa; el entrenamiento se limita a 2.048 tokens de prompt y 8.192 de respuesta, por lo que no hay garantia de comportamiento correcto mas alla.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento de las condiciones del modelo base.
- Trazabilidad de procedencia limitada: autor individual sin publicacion asociada ni evaluacion por terceros; 0 descargas y 0 likes en el momento de la consulta.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos enlaces utiles son los de la model card y del ecosistema Qwen3.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L1nkee/Qwen3-4B-Base-Think-GRPO-KL0-LR1e-5-bf16-540steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Libreria verl (framework de RL usado): https://github.com/volcengine/verl
- Math-Verify (verificador de recompensas): https://github.com/huggingface/Math-Verify
- Documentacion y blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de transformers: https://github.com/huggingface/transformers
- vLLM (motor de rollout y despliegue): https://github.com/vllm-project/vllm
- No se han encontrado papers, demos ni articulos tecnicos adicionales sobre este modelo en la busqueda web realizada.
