# SakinaBohra/REINFORCE-PixelCopter-v0

## Resumen

REINFORCE-PixelCopter-v0 es un agente de aprendizaje por refuerzo entrenado con el algoritmo REINFORCE (gradiente de politica Monte Carlo) para resolver el entorno PixelCopter-PLE-v0, un juego de estilo arcade en el que un helicoptero debe esquivar obstaculos manteniendose en vuelo. Lo desarrolla SakinaBohra como parte de la Unidad 4 del curso de Deep Reinforcement Learning de Hugging Face y se publica en Hugging Face Hub con el pipeline `reinforcement-learning`.

No se trata de un modelo de lenguaje ni de un modelo generativo de proposito general: es una politica neuronal muy pequena (9.090 parametros entrenables) que mapea 7 caracteristicas numericas del estado del entorno a 2 probabilidades de accion (impulso hacia arriba o ninguno). Su relevancia es pedagogica y experimental: sirve como referencia reproducible de un pipeline clasico de policy gradient con fine-tuning y evaluacion independiente documentada.

El repositorio tiene un tamano de 0,0 GB (pesos de una red de dos capas ocultas), 0 descargas y 0 likes en el momento de la consulta. La informacion disponible sobre licencia, idiomas y cuantizacion es inexistente, lo que limita su uso fuera del ambito de demostracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully connected (perceptron multicapa): 7 entradas -> 64 neuronas ocultas -> 128 neuronas ocultas -> 2 probabilidades de accion |
| Parametros totales | 9.090 parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el entorno proporciona 7 caracteristicas de observacion por paso) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en punto flotante; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`: `policy.pt`, `finetuned_final_policy.pt`, `original_19k_policy.pt`) |

## Arquitectura y entrenamiento

La politica es una red neuronal feedforward de dos capas ocultas (64 y 128 neuronas) que recibe las 7 caracteristicas numericas del estado de PixelCopter-PLE-v0 y devuelve dos probabilidades de accion mediante una capa de salida de dos unidades. El algoritmo es REINFORCE puro, es decir, gradiente de politica Monte Carlo con retornos completos de episodio, sin actor-critico ni linea base aprendida documentada.

El entrenamiento original consta de 20.000 episodios con optimizador Adam, tasa de aprendizaje 0,0001 y factor de descuento 0,99. Posteriormente se realizo un fine-tuning partiendo del mejor checkpoint alrededor del episodio 19.000, con 2.000 episodios adicionales, un nuevo optimizador Adam, tasa de aprendizaje 0,00005 y recorte de gradiente con norma maxima 5,0. El mejor checkpoint del fine-tuning se selecciono tras 250 episodios de ajuste. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF ni DPO), ya que no aplican a este tipo de agente.

## Capacidades

- Control de politica en el entorno PixelCopter-PLE-v0: selecciona entre dos acciones (impulso hacia arriba o ninguno) a partir de 7 caracteristicas numericas del estado.
- Aprendizaje por refuerzo con gradiente de politica Monte Carlo (REINFORCE) entrenado en PyTorch.
- Muestreo estocastico de acciones a partir de las probabilidades devueltas por la red.
- Evaluacion reproducible: el repositorio incluye `evaluation_results.json`, `hyperparameters.json` y un video de demostracion (`replay.mp4`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues.
- No dispone de modo thinking ni de generacion de texto.

## Casos de uso

- Docencia de policy gradient: usar el agente como ejemplo minimo y reproducible de REINFORCE en un curso o tutorial, cargando `policy.pt` y comparando el efecto del fine-tuning frente a `original_19k_policy.pt`.
- Reproduccion de experimentos: replicar el entrenamiento con los hiperparametros de `hyperparameters.json` y contrastar la curva de recompensa con la evaluacion publicada (media 33,91 en 200 episodios).
- Baseline para comparativas de algoritmos: emplear esta politica como referencia frente a variantes con linea base, actor-critico o PPO en el mismo entorno PixelCopter-PLE-v0.
- Estudio de estabilidad del entrenamiento: analizar la elevada desviacion tipica de recompensa (35,09 en el modelo seleccionado) y el efecto del recorte de gradiente y de la reduccion de la tasa de aprendizaje durante el fine-tuning.
- Pruebas de integracion con entornos PLE: validar pipelines de evaluacion estocastica con 200 episodios y registrar longitud media de episodio (232,10 en el modelo seleccionado).
- Demostracion visual de agentes RL: utilizar `replay.mp4` y la carga del modelo en PyTorch para mostrar el comportamiento aprendido en charlas o material divulgativo.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los de la model card, obtenidos en 200 episodios con muestreo estocastico de acciones:

| Metrica | Mejor politica fine-tuned (`policy.pt`) | Politica final fine-tuned (`finetuned_final_policy.pt`) |
|---|---|---|
| Recompensa media | 33,91 | 30,82 |
| Desviacion tipica | 35,09 | 27,59 |
| Recompensa minima | 1 | no disponible |
| Recompensa maxima | 214 | 134 |
| Longitud media de episodio | 232,10 | 214,87 |
| Episodios con recompensa positiva | 200/200 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de agente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red tiene 9.090 parametros y los pesos ocupan unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., weights_only=True)`) segun indica la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles de forma explicita; por el tamano de la red, la inferencia por paso es del orden de microsegundos en CPU, aunque no se publican mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa, podria compararse con otros agentes REINFORCE del mismo curso de Hugging Face o con implementaciones de PPO sobre PixelCopter-PLE-v0, pero no se aportan parametros, contexto, rendimiento ni licencia de esas alternativas en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REINFORCE-PixelCopter-v0 | 9.090 | no aplica | recompensa media 33,91 (200 episodios) | no disponible | Hugging Face Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de un unico entorno: la politica solo es valida para PixelCopter-PLE-v0 y no generaliza a otras tareas sin reentrenamiento.
- Alta varianza: la desviacion tipica de recompensa (35,09) es superior a la media en el modelo seleccionado, lo que indica un comportamiento muy variable entre episodios.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Sin idiomas ni capacidades de lenguaje: no procesa texto, no responde a prompts y no puede usarse como asistente.
- Sin datos de sesgo, alucinacion o robustez: no se documentan analisis de sesgos ni evaluaciones fuera de distribucion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento o soporte.
- La model card advierte de que la subida directa del modelo no registra automaticamente una submission en el leaderboard del curso de Hugging Face.
- El formato de pesos es exclusivamente PyTorch; no hay versiones GGUF ni ONNX publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SakinaBohra/REINFORCE-PixelCopter-v0
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 4, contexto de entrenamiento): no disponible en la informacion proporcionada
- Paper de REINFORCE (Williams, 1992): no disponible en la informacion proporcionada
- Entorno PixelCopter-PLE-v0: no disponible en la informacion proporcionada
- Repositorio de PyGame Learning Environment (PLE): no disponible en la informacion proporcionada
