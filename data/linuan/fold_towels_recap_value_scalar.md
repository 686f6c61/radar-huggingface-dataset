# LINUAN/fold_towels_recap_value_scalar

## Resumen

`LINUAN/fold_towels_recap_value_scalar` es una red de valor (value network) entrenada como parte de una reproduccion del metodo RECAP (pi-star 0.6) para la tarea robotica de doblar toallas con el brazo SO-101. No es un modelo de lenguaje generativo, sino un componente auxiliar de un pipeline de aprendizaje por refuerzo: estima el valor escalar de un estado visual-textual para guiar el entrenamiento de una politica. Lo publica el usuario LINUAN en Hugging Face bajo la libreria LeRobot.

El modelo usa como backbone PaliGemma `gemma_2b` (aproximadamente 2.000 millones de parametros en el backbone), con el codificador de vision y la mayor parte del backbone congelados y solo tres capas del backbone desbloqueadas. La cabeza es un MLP de 1 dimension que hace regresion MSE (a diferencia de la variante de 201 bins de la version distributional). Los pesos ocupan 6,9 GB en formato safetensors, con 3.451.557.306 parametros totales reportados en el repositorio.

Es relevante por su caracter de reproduccion abierta: permite a investigadores que trabajan con LeRobot y con el brazo SO-101 disponer de una red de valor ya entrenada sobre un corpus concreto (276 episodios de doblado de toallas) para experimentar con RL, evaluar variantes de cabeza y comparar estrategias de congelacion del backbone. Su publico objetivo es muy especifico y su utilidad fuera de ese pipeline es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de valor con backbone PaliGemma `gemma_2b` (vision + lenguaje) y cabeza MLP de 1 dimension (regresion MSE) |
| Parametros totales | 3.451.557.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el backbone PaliGemma es multilingue, pero la red de valor no se evalua como modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (6,9 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone PaliGemma `gemma_2b`, que procesa la observacion visual y el contexto textual, con una cabeza de valor escalar implementada como MLP de una sola salida. La clase concreta es `RECAPValueNetworkScalar` y su configuracion `RECAPValueNetworkConfig`; esta ultima hereda `num_value_bins=201` de la variante distributional para mantener hiperparametros identicos, aunque la cabeza real es de 1 dimension. El codificador de vision y el backbone estan congelados salvo tres capas del backbone, lo que reduce el coste de entrenamiento y preserva las representaciones preentrenadas de PaliGemma.

El entrenamiento se realizo sobre el corpus `LINUAN/fold_towels_recap_corpus_v2`, compuesto por 276 episodios con un split de validacion del 10 %. Se ejecutaron 3 epocas, con un resultado final de `val_mae=0.05776` y `val_loss (MSE)=0.00587`. No se documentan en la informacion disponible detalles sobre el algoritmo de RL concreto, la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones adicionales mas alla de la propia variante de cabeza escalar frente a la distributional.

## Capacidades

- Estimacion de valor escalar de un estado a partir de observacion visual y contexto, para su uso dentro de un bucle de aprendizaje por refuerzo.
- Procesamiento de imagenes mediante el codificador de vision de PaliGemma integrado en el backbone.
- Condicionamiento sobre instrucciones o contexto textual gracias al componente de lenguaje de PaliGemma.
- Integracion nativa con la libreria LeRobot para pipelines de robotica.
- Variante A/B respecto a la version con cabeza distributional de 201 bins, pensada para comparar estrategias de modelado del valor.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto libre: es una red de valor, no un modelo conversacional.
- No se documentan capacidades multilingues evaluadas ni modos especiales (thinking, vision generativa, audio).

## Casos de uso

- Reproduccion de RECAP sobre SO-101: sirve como red de valor de referencia para replicar el experimento de pi-star 0.6 en la tarea de doblar toallas, comparando resultados con la variante distributional.
- Investigacion en aprendizaje por refuerzo robotico: permite estudiar el efecto de una cabeza escalar (MSE) frente a una distributional (201 bins) manteniendo el mismo backbone y corpus, aislando la variable de la cabeza.
- Evaluacion de estrategias de congelacion del backbone: al tener solo tres capas desbloqueadas, es util para medir el impacto del fine-tuning parcial sobre la calidad de la estimacion de valor.
- Baseline para nuevas tareas de manipulacion: el pipeline de carga (config + pesos) puede reutilizarse como plantilla para entrenar redes de valor sobre otros corpus de LeRobot.
- Analisis de error en estimacion de valor: el `val_mae=0.05776` documentado permite usar el modelo como punto de partida para estudios de calibracion y sesgo en value networks.
- Docencia y prototipado en robotica con hardware asequible: el brazo SO-101 es de bajo coste, y esta red de valor facilita montar practicas de RL sin depender de infraestructura propietaria.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `val_mae` (split de validacion, 3 epocas) | 0.05776 |
| `val_loss` (MSE, split de validacion) | 0.00587 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un LLM generativo y no se evalua en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32/bf16): los 3.451.557.306 parametros implican aproximadamente 6,9 GB en fp16/bf16 y alrededor de 13,8 GB en fp32, sin contar activaciones ni el codificador de vision.
- GPU recomendadas: A100 40 GB u H100 para entrenamiento o inferencia por lotes; RTX 4090 (24 GB) suficiente para inferencia en bf16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, 4090, A4000) en bf16; en 12 GB puede requerir cuantizacion o carga parcial, aunque no se documentan pesos cuantizados.
- Opciones de despliegue: carga via LeRobot con `RECAPValueNetworkScalar` y `RECAPValueNetworkConfig` usando `safetensors.torch.load_file`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LINUAN/fold_towels_recap_value_scalar` | 3.451.557.306 | no disponible | `val_mae=0.05776`, `val_loss=0.00587` | no disponible | Hugging Face (LeRobot) |
| Variante distributional de 201 bins (mismo autor, mismo corpus) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | referenciada en la model card, no se confirma publicacion |
| Otras value networks para LeRobot / SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo altamente especializado: solo tiene sentido dentro del pipeline RECAP y la tarea de doblar toallas con SO-101; no es reutilizable como modelo general.
- La configuracion hereda `num_value_bins=201` aunque la cabeza es de 1 dimension, lo que puede inducir a confusion si se inspecciona el `config.json` sin leer la model card.
- Entrenado solo 3 epocas sobre 276 episodios: riesgo de sobreajuste y de generalizacion limitada a variaciones de la tarea no vistas.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, evaluaciones de robustez ni analisis de alucinacion (no aplica al no ser generativo, pero si aplica el riesgo de estimaciones de valor erroneas que degraden la politica).
- Sin descargas ni likes en el momento de la consulta: no hay validacion externa de la comunidad sobre su calidad.
- No se documentan idiomas soportados ni requisitos de contexto; el backbone PaliGemma impone sus propias limitaciones de longitud de secuencia, no detalladas aqui.

## Enlaces

- Hugging Face: https://huggingface.co/LINUAN/fold_towels_recap_value_scalar
- Corpus de entrenamiento referenciado: https://huggingface.co/datasets/LINUAN/fold_towels_recap_corpus_v2
- LeRobot (libreria): https://github.com/huggingface/lerobot
- PaliGemma (backbone): https://huggingface.co/google/paligemma-3b-pt-224
- SO-101 (brazo robotico): no disponible en la informacion proporcionada
- Paper de RECAP / pi-star 0.6: no disponible en la informacion proporcionada
