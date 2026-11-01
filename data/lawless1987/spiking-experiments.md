# Lawless1987/spiking-experiments

## Resumen

`Lawless1987/spiking-experiments` no es un modelo de lenguaje preentrenado, sino un repositorio de experimentos reproducibles con redes neuronales de impulsos (spiking neural networks, SNN) implementados desde cero. Lo firma el usuario Lawless1987 y su objetivo es documentar, con criterios de exito y fracaso declarados antes de cada ejecucion, si tecnicas basicas de aprendizaje bioinspirado funcionan en tareas controladas sobre CPU convencional, sin hardware neuromorfico especializado.

El repositorio contiene cinco experimentos escritos con snnTorch 1.0.0, PyTorch 2.14.1 (CPU) y Brian2 2.10.1: clasificacion de digitos MNIST con una red de dos capas que propaga informacion exclusivamente como picos durante 25 pasos temporales, simulacion de diez neuronas LIF con entrada creciente, aprendizaje no supervisado por STDP, y dos intentos de competicion entre neuronas con winner-take-all que no alcanzaron su umbral de exito.

Su relevancia es metodologica mas que de rendimiento: todos los resultados se publican, incluidos los nulos y los fallos, y se incluyen ejecuciones de control con tres semillas para verificar efectos. No hay pesos publicados, ni pipeline de inferencia, ni soporte multilingue; es material de investigacion y docencia sobre aprendizaje por picos, no un artefacto desplegable como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de impulsos (SNN): LIF de 2 capas con snnTorch, neuronas LIF biologicas con Brian2, STDP no supervisado con winner-take-all |
| Parametros totales | no disponible (depende de cada experimento; no se publican recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; exp1 usa 25 pasos temporales por muestra) |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene codigo Python y graficos PNG, no checkpoints) |

## Arquitectura y entrenamiento

El experimento principal (`exp1_mnist_snn.py`) es una red de dos capas con neuronas de tipo leaky integrate-and-fire implementada en snnTorch. La informacion se transmite unicamente como trenes de picos a lo largo de 25 pasos temporales por muestra; no hay activaciones continuas. El entrenamiento se realizo en CPU con dos pasadas cortas sobre MNIST, en 19 segundos, partiendo de una precision del 9,0 % (nivel de azar) hasta el 91,2 %. Solo el 9,1 % de los pasos neurona ocultos generaron un pico, lo que refleja la dispersion caracteristica de las SNN.

`exp2_brian2_neurons.py` simula diez neuronas LIF con dinamica biologica en Brian2 y una entrada creciente, midiendo la tasa de disparo en funcion del voltaje. `exp3_stdp.py` implementa aprendizaje no supervisado por plasticidad dependiente del tiempo de pico (STDP): una neurona de salida recibe 100 entradas, de las cuales 20 disparan de forma sincronizada, y debe identificar ese subgrupo solo a partir de la temporizacion. Los experimentos 5 y 6 exploran competicion entre tres neuronas con winner-take-all y normalizacion de pesos por neurona (Diehl & Cook, 2015), respectivamente. No se documenta uso de RLHF, DPO ni datos distintos de MNIST y patrones sinteticos.

## Capacidades

- Clasificacion de digitos manuscritos MNIST con propagacion exclusiva por picos (91,2 % de precision tras dos pasadas).
- Simulacion de dinamica neuronal biologica (LIF) con umbrales y tasas de disparo medibles.
- Aprendizaje no supervisado por temporizacion de picos (STDP) para descubrir grupos de entradas correlacionadas.
- Mecanismos de competicion winner-take-all entre neuronas de salida.
- Normalizacion de pesos por neurona para estabilizar el aprendizaje competitivo.
- Ejecucion completa en CPU de portatil, sin GPU ni hardware neuromorfico.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Docencia de redes neuromorficas: el repositorio sirve como material practico para explicar codificacion por picos, LIF y STDP con codigo ejecutable y resultados medidos en menos de un minuto por experimento.
- Reproduccion de resultados con criterios preregistrados: el patron de declarar el umbral de exito antes de ejecutar y conservar los fallos es directamente reutilizable como plantilla metodologica en laboratorios de ML.
- Prototipado rapido de clasificadores SNN sobre MNIST: `exp1_mnist_snn.py` ofrece una linea base funcional (91,2 % en 19 s de CPU) sobre la que iterar antes de invertir en hardware neuromorfico.
- Validacion de simuladores: comparar snnTorch y Brian2 en la misma tarea permite verificar que la implementacion de LIF y STDP es coherente entre frameworks.
- Investigacion sobre aprendizaje competitivo: los fallos documentados en exp5 y exp6 (neurona muerta que nunca obtiene victorias tempranas) son un punto de partida concreto para estudiar inicializacion de sesgos y presentacion por bloques de patrones.
- Formacion en integridad experimental: los controles con tres semillas y la conservacion de ejecuciones nulas sirven como ejemplo de buenas practicas frente a la seleccion de resultados favorables.

## Benchmarks y rendimiento

| Experimento | Metrica | Resultado |
|---|---|---|
| exp1 (MNIST SNN) | Precision antes de entrenar | 9,0 % (azar) |
| exp1 (MNIST SNN) | Precision tras 2 pasadas | 91,2 % |
| exp1 (MNIST SNN) | Tiempo de entrenamiento | 19 s (CPU) |
| exp1 (MNIST SNN) | Proporcion de picos en capa oculta | 9,1 % de pasos neurona |
| exp2 (Brian2 LIF) | Tasa de disparo a 5-14 mV | 0 picos/s |
| exp2 (Brian2 LIF) | Tasa de disparo a 17-32 mV | 45 a 155 picos/s |
| exp3 run 1 (10 mV, 30 s) | Resultado | Nulo: la neurona de salida no disparo |
| exp3 run 2 (5 mV, 30 s) | Ratio grupo patron / resto | 1,42x (umbral 2x no alcanzado) |
| exp3 run 3 (120 s) | Ratio grupo patron / resto | 3,1x (umbral superado) |
| exp5 y exp6 | Resultado | No superado: tercera neurona muerta, un patron sin reclamar |

No se han publicado comparaciones con otros modelos o implementaciones SNN en la informacion disponible.

## Requisitos de hardware

- Inferencia y entrenamiento en CPU de portatil: exp1 entrena en 19 segundos sin GPU.
- VRAM estimada: no aplica; el autor indica explicitamente que todo corre en CPU.
- GPU recomendadas: no disponible; no se documenta uso de GPU (PyTorch esta fijado en build CPU).
- Compatibilidad con GPU de consumo: no evaluada en el repositorio.
- Despliegue: ejecucion directa con Python mediante un entorno virtual y `requirements.txt`; no hay integracion con vLLM, llama.cpp, Ollama ni TGI porque no se publican pesos.
- Latencia y throughput: solo se documenta el tiempo de entrenamiento de exp1 (19 s); no hay cifras de inferencia por muestra.

## Comparativa con modelos similares

| Repositorio | Enfoque | Hardware | Resultado documentado | Licencia |
|---|---|---|---|---|
| Lawless1987/spiking-experiments | SNN desde cero con snnTorch y Brian2, criterios preregistrados | CPU | 91,2 % en MNIST; STDP 3,1x; dos experimentos fallidos publicados | Apache 2.0 |
| NorSNN (Norway) | SNN con snnTorch sobre MNIST/Fashion-MNIST | CPU/GPU | no disponible en esta ficha | no disponible |
| snnTorch (tutoriales oficiales) | Libreria y ejemplos de referencia | CPU/GPU | no disponible en esta ficha | MIT (segun el proyecto) |
| Brian2 (documentacion) | Simulador biologico de neuronas | CPU | no disponible en esta ficha | CeCILL (segun el proyecto) |

No se dispone de datos verificados de benchmarks de estos proyectos alternativos en la informacion proporcionada; la comparacion se limita al enfoque y al alcance.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un artefacto de inferencia: no hay checkpoints, tokenizador ni pipeline; no puede desplegarse como servicio.
- Los resultados se limitan a MNIST y a patrones sinteticos; no hay evidencia de generalizacion a otras tareas.
- Dos de los cinco experimentos (exp5 y exp6) no alcanzaron su criterio de exito; el autor documenta el fallo pero no lo resuelve.
- El repositorio tiene 0 descargas y 0 likes, sin revision externa ni replicacion independiente conocida.
- El entrenamiento de exp1 es muy corto (dos pasadas, 19 s); no se exploran regimenes de entrenamiento mas largos ni comparaciones con lineas base no neuromorficas.
- No se publican sesgos, evaluaciones de robustez ni analisis de errores por clase.
- La licencia Apache 2.0 permite uso comercial del codigo, pero no existe garantia de idoneidad para produccion.
- Las fechas de creacion y actualizacion del repositorio (2026) deben tratarse con cautela al citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lawless1987/spiking-experiments
- Proyecto covenant: https://huggingface.co/Lawless1987/covenant
- Proyecto threefold: https://huggingface.co/Lawless1987/threefold
- Proyecto threefold-memory: https://huggingface.co/Lawless1987/threefold-memory
- Proyecto contradiction-probe: https://huggingface.co/Lawless1987/contradiction-probe
- Proyecto flinch-observability: https://huggingface.co/Lawless1987/flinch-observability
- Proyecto flinch-record: https://huggingface.co/Lawless1987/flinch-record
- Proyecto grokflinch: https://huggingface.co/Lawless1987/grokflinch
- Proyecto Sentinel-Witness: https://huggingface.co/Lawless1987/Sentinel-Witness
