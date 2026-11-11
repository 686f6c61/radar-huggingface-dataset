# LINUAN/fold_towels_recap_value

## Resumen

La red de valor `fold_towels_recap_value` es un componente de aprendizaje por refuerzo (RL) publicado por el usuario LINUAN en Hugging Face, dentro del ecosistema LeRobot. No se trata de un modelo de lenguaje generativo, sino de una red de valor distributional con cabeza softmax de 201 bins, disenada para estimar el retorno esperado en la reproduccion del experimento RECAP (pi-star 0.6) sobre la tarea robotica de doblar toallas con el brazo SO-101. Su backbone es PaliGemma `gemma_2b`, con el codificador de vision y la mayor parte del backbone congelados.

El modelo resuelve un problema concreto dentro de un pipeline de RL para robotica: proporcionar una estimacion de valor calibrada que guie el entrenamiento de una politica de imitacion o RL. La innovacion principal es el uso de una cabeza distributional (201 bins) frente a una cabeza escalar, con una mejora medible en el error absoluto medio de validacion (0,05278 frente a 0,05776 del variante escalar).

Es relevante ahora porque documenta una reproduccion abierta de RECAP sobre un hardware de bajo coste (SO-101) y porque publica los pesos del componente de valor junto con el corpus de entrenamiento, lo que permite a otros investigadores replicar y comparar variantes de cabeza de valor en tareas de manipulacion. El checkpoint publicado corresponde a la epoca 3, seleccionado por mejor `val_mae`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de valor distributional sobre backbone PaliGemma `gemma_2b` (vision encoder + backbone congelados, 3 capas del backbone descongeladas) |
| Parametros totales | 3.451.711.106 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La `RECAPValueNetwork` combina un backbone PaliGemma `gemma_2b` con una cabeza de valor distributional de 201 bins con activacion softmax (clasificacion categorica sobre el retorno). El codificador de vision y el backbone estan congelados, salvo tres capas del backbone que se descongelan durante el ajuste. La cabeza produce una distribucion de probabilidad sobre 201 bins discretos, de la que se deriva la estimacion de valor.

El entrenamiento se realizo sobre el corpus `LINUAN/fold_towels_recap_corpus_v2` (276 episodios, con split de validacion del 10%) durante 3 epocas. El checkpoint publicado es el de la epoca 3, con `val_mae = 0,05278` (epoca 1: 0,05414; epoca 2: 0,05291) y `val_loss` de entropia cruzada de 3,99175. El experimento A/B reportado por el autor indica que esta cabeza de 201 bins supera al variante escalar de 1 dimension (`fold_towels_recap_value_scalar`, `val_mae` 0,05776) en aproximadamente 0,005 de MAE de validacion. No se detalla en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineacion, ni la composicion exacta del dataset mas alla del numero de episodios.

## Capacidades

- Estimacion de valor distributional: produce una distribucion softmax sobre 201 bins para estimar el retorno esperado en la tarea de doblar toallas con SO-101.
- Integracion con LeRobot: se carga mediante `RECAPValueNetwork` y `RECAPValueNetworkConfig` del modulo `lerobot.rl.algorithms.recap_value_network`.
- Procesamiento multimodal: hereda el codificador de vision de PaliGemma `gemma_2b`, por lo que procesa observaciones visuales ademas de estado.
- Seleccion de checkpoint por metrica: el autor documenta la comparacion entre epocas y entre variantes de cabeza (distributional frente a escalar).
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, razonamiento multi-paso ni multilingues, al no tratarse de un modelo de lenguaje generativo.

## Casos de uso

- Reproduccion de RECAP sobre SO-101: el modelo sirve como componente de valor en la reproduccion del experimento pi-star 0.6 para la tarea de doblar toallas, permitiendo a otros grupos replicar el pipeline con los mismos pesos y corpus.
- Entrenamiento de politicas de manipulacion: la red de valor puede emplearse para guiar el ajuste de una politica de imitacion o RL en tareas de plegado, usando las estimaciones de retorno como senal de ventaja.
- Comparacion de cabezas de valor: investigadores que disenen redes de valor pueden usar este checkpoint como referencia frente a variantes escalares, dado que el autor publica el resultado A/B con MAE de validacion.
- Evaluacion de generalizacion en robotica de bajo coste: el uso de SO-101 y un corpus de 276 episodios permite estudiar como se comporta una red de valor basada en PaliGemma con pocos datos y hardware asequible.
- Base para experimentos de RL con recompensas aprendidas: la salida distributional de 201 bins puede reutilizarse como critico en algoritmos actor-critico sobre tareas de manipulacion similares.
- Docencia y formacion en RL robotico: el modelo, junto con el corpus y el codigo de carga, constituye un ejemplo completo y reproducible de red de valor distributional en LeRobot.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `val_mae` (epoca 3, checkpoint publicado) | 0,05278 |
| `val_mae` (epoca 1) | 0,05414 |
| `val_mae` (epoca 2) | 0,05291 |
| `val_loss` (entropia cruzada, epoca 3) | 3,99175 |
| `val_mae` variante escalar (`fold_towels_recap_value_scalar`) | 0,05776 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, al no ser un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repo es de 13,8 GB en safetensors, lo que da una referencia del orden de magnitud de los pesos en precision completa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; por el tamano de pesos (3,45 mil millones de parametros) es plausible que requiera GPUs con VRAM suficiente para cargar el checkpoint completo o cuantizarlo, pero no se documenta.
- Opciones de despliegue: carga via `safetensors.torch.load_file` y las clases `RECAPValueNetwork` / `RECAPValueNetworkConfig` de LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fold_towels_recap_value` (201 bins) | 3.451.711.106 | no disponible | `val_mae` 0,05278 | no disponible | Hugging Face |
| `fold_towels_recap_value_scalar` | no disponible | no disponible | `val_mae` 0,05776 | no disponible | Hugging Face |
| Otros modelos comparables de red de valor para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente al variante escalar del mismo autor, que presenta un `val_mae` aproximadamente 0,005 superior.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta entrenado exclusivamente para la tarea de doblar toallas con SO-101; no es un modelo de proposito general.
- Volumen de datos limitado: el corpus de entrenamiento consta de 276 episodios, lo que puede limitar la generalizacion a variaciones de entorno, iluminacion u objetos.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda sin garantias legales explicitas.
- Idiomas no disponibles: al no ser un modelo de lenguaje generativo, la nocion de idioma no aplica directamente.
- Riesgo de sobreajuste: con solo 3 epocas y un split de validacion del 10%, la seleccion del checkpoint por `val_mae` puede estar sujeta a varianza; el autor documenta diferencias pequenas entre epocas (0,05278 frente a 0,05291).
- Sin datos de sesgo ni alucinacion: no se documentan sesgos conocidos ni evaluaciones de robustez fuera de la metrica de validacion.
- Dependencia de LeRobot: la carga requiere el modulo `lerobot.rl.algorithms.recap_value_network`, lo que limita su uso fuera de ese ecosistema.
- Sin benchmarks estandar: no hay resultados en tareas de referencia que permitan comparar de forma independiente con otras redes de valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LINUAN/fold_towels_recap_value
- Corpus de entrenamiento: https://huggingface.co/LINUAN/fold_towels_recap_corpus_v2
- Variante escalar: https://huggingface.co/LINUAN/fold_towels_recap_value_scalar
- Codigo de carga: modulo `lerobot.rl.algorithms.recap_value_network` (ficheros `recap_value_network.py` y `config.json` en el repo)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
