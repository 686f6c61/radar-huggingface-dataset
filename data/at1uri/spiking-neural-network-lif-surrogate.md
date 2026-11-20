# At1uri/spiking-neural-network-lif-surrogate

## Resumen

`At1uri/spiking-neural-network-lif-surrogate` es un conjunto de pesos preentrenados de caracter investigador que implementa una red neuronal de impulsos recurrente (RSNN) basada en dinamica de membrana Leaky Integrate-and-Fire (LIF). Lo desarrolla Ramprasad Atluri (usuario `At1uri`) y se publica bajo licencia MIT. No es un modelo de lenguaje: es un clasificador de flujos de eventos neuromorficos, pensado para vision basada en eventos (DVS) y computacion neuromorfica.

El modelo resuelve un problema muy acotado: clasificar secuencias temporales de eventos en cuatro clases direccionales (arriba, abajo, izquierda, derecha) a partir de una entrada de 32 dimensiones que codifica cuadrantes espaciales DVS con doble polaridad. Su interes actual reside en que ejemplifica el flujo de trabajo completo de una SNN entrenada con gradientes surrogate (Fast Sigmoid, alpha = 10.0) y en que incorpora contabilidad energetica mediante SynOps, lo que permite razonar sobre coste computacional en hardware neuromorfico.

El tamano es minimo: 6.596 parametros en total, con una capa recurrente oculta de 64 neuronas LIF y una constante de membrana de 20 ms (beta = 0.9512). El contexto no es un contexto de tokens al uso, sino una ventana temporal de simulacion (el ejemplo de la model card usa 50 pasos de tiempo). Es, por tanto, una pieza de referencia y reproduccion para investigacion, no un componente listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos recurrente (RSNN) con neuronas Leaky Integrate-and-Fire (LIF) y gradientes surrogate Fast Sigmoid |
| Parametros totales | 6.596 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de tokens; ventana temporal de simulacion (ejemplo de 50 pasos de tiempo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (la model card esta en ingles; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (buffers binarios nativos, carga zero-copy) |

## Arquitectura y entrenamiento

La arquitectura es una RSNN con dinamica de membrana LIF continua, discretizada en pasos de tiempo. La ecuacion de recurrencia es `V_i[t] = beta * V_i[t-1] + sum_j W_rec_ij * S_j[t-1] + sum_k W_in_ik * X_k[t] - V_th * S_i[t-1]`, donde `beta = exp(-dt / tau_m)` gobierna la decaida pasiva de membrana. Las dimensiones son: entrada `d_in = 32` (cuadrantes espaciales DVS x doble polaridad), capa oculta recurrente `d_h = 64` neuronas LIF, y salida `d_out = 4` clases direccionales. La constante de membrana es `tau_m = 20.0` ms (beta = 0.9512) y el umbral de disparo `V_th = 1.00` V.

El entrenamiento emplea retropropagacion con gradiente surrogate para sortear la no diferenciabilidad del disparo `S_i[t] = Theta(V_i[t] - V_th)`, aproximando la derivada con la funcion Fast Sigmoid `dS/dV ~ 1 / (1 + alpha * |V - V_th|)^2` con `alpha = 10.0`. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovacion destacable es la contabilidad de operaciones sinapticas neuromorficas (SynOps) devuelta por el motor de inferencia, junto con el raster de disparos y la metricas de esparsidad temporal (94,81 % de neuronas silenciosas por paso de tiempo).

## Capacidades

- Clasificacion de flujos de eventos neuromorficos en 4 clases direccionales (Up, Down, Left, Right) a partir de entradas DVS de 32 dimensiones.
- Simulacion temporal de dinamica LIF con estado de membrana recurrente a lo largo de multiples pasos de tiempo.
- Entrenamiento e inferencia con gradientes surrogate (Fast Sigmoid, alpha = 10.0) para redes de impulsos.
- Contabilidad energetica mediante SynOps (operaciones sinapticas dispersas), util para estimar coste en hardware neuromorfico.
- Salida de raster de disparos y metrica de esparsidad temporal por paso de tiempo.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni de generacion de texto: la etiqueta `en` se refiere al idioma de la documentacion.
- No dispone de modo thinking, vision convencional, audio ni otras capacidades multimodales.

## Casos de uso

- Investigacion en vision basada en eventos: usar el modelo como referencia reproducible para clasificar flujos DVS sinteticos o reales en tareas de direccion, comparando la dinamica LIF con alternativas ANN.
- Prototipado de hardware neuromorfico: la salida de SynOps y la esparsidad del 94,81 % permiten estimar el coste energetico de un despliegue en chips tipo Loihi o Speck antes de portar el modelo.
- Docencia y divulgacion: el tamano de 6.596 parametros y la formulacion matematica explicita en la model card lo hacen adecuado para explicar gradientes surrogate y dinamica de membrana en un curso o tutorial.
- Validacion de pipelines de datos DVS: sirve como clasificador de control para verificar que un pipeline de eventos (cuadrantes x polaridad) produce senales coherentes antes de entrenar modelos mayores.
- Benchmarking de eficiencia: comparar la relacion entre precision y SynOps frente a ANN equivalentes en el dataset `At1uri/neuromorphic-event-stream-benchmarks`.
- Pruebas de integracion del motor de inferencia `snn_lif.SpikingLIFInferenceEngine`: validar carga de safetensors, forward pass y salidas (logits, raster, synops, sparsity) en un entorno de CI.
- Reproduccion de resultados: reentrenar o afinar el modelo sobre el dataset de benchmarks para verificar el indice de esparsidad temporal reportado.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el `model-index` de la model card (no verificados).

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| tabular-regression | At1uri/neuromorphic-event-stream-benchmarks | Temporal Sparsity Index (accuracy) | 0,948 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 6.596 parametros, los pesos en FP32 ocupan del orden de decenas de kilobytes; el cuello de botella es la simulacion temporal, no la memoria.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en tarjetas consumer (RTX 3060, RTX 4090) e incluso en CPU. No requiere A100 ni H100.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU o en microcontroladores con suficiente RAM.
- Opciones de despliegue: el motor de referencia es `snn_lif.SpikingLIFInferenceEngine` cargando `model.safetensors` con `safetensors.numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. Dependen del numero de pasos de tiempo simulados y del backend (NumPy en CPU frente a aceleracion en GPU).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (RSNN LIF de 64 neuronas para clasificacion DVS), ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo de investigacion con 6.596 parametros: no es un modelo de lenguaje ni un sistema general; su alcance se limita a clasificacion direccional de flujos DVS de 32 dimensiones.
- El unico resultado reportado (Temporal Sparsity Index = 0,948) esta marcado como no verificado y no se acompana de comparaciones ni de intervalos de confianza.
- La model card no documenta el dataset de entrenamiento, el numero de tokens/eventos ni el regimen de entrenamiento, lo que dificulta evaluar sesgos o generalizacion.
- Riesgo de alucinacion no aplicable en el sentido de los LLM, pero si existe riesgo de sobreajuste a la distribucion sintetica de eventos usada en el ejemplo (probabilidad de disparo 0,12).
- Limitacion de idioma: no procesa lenguaje natural; la etiqueta `en` solo refleja el idioma de la documentacion.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene citar la atribucion a Ramprasad Atluri (`At1uri`).
- Para produccion: no hay soporte documentado de cuantizacion, servido en batch ni integracion con frameworks de inferencia estandar; habria que construir el motor alrededor del codigo de referencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/spiking-neural-network-lif-surrogate
- Studio interactivo: https://huggingface.co/spaces/At1uri/spiking-neural-network-neuromorphic-studio
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/neuromorphic-event-stream-benchmarks
- Research vault: https://huggingface.co/At1uri/spiking-neural-network-vault
