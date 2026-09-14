# igorktech/nanofly-decoder-en

## Resumen

nanofly-decoder-en es un modelo de generación de texto en inglés desarrollado por igorktech cuyo componente recurrente no es una matriz de pesos entrenada, sino el conectoma real del cerebro central de la mosca de la fruta (Drosophila melanogaster), release MaleCNS v1.0. La capa recurrente actúa como un reservoir congelado de tipo echo state network: ninguna sinapsis se entrena. Solo aprenden la proyección de entrada, los escalares por neurona (ganancia, sesgo, fuga), una escala global y el readout. El modelo tiene 34.466.505 parámetros totales según el fichero safetensors, de los cuales solo 16,25 M son entrenables (12,90 M en el readout).

El problema que aborda es de investigación más que de producto: comprobar si la topología de un circuito biológico real aporta ventaja funcional frente a un cableado sintético con la misma distribución de grados. En la evaluación del autor, el conectoma real alcanza una pérdida de validación de 1,933 (perplejidad 6,9) frente a 1,979 (perplejidad 7,2) del control con cableado aleatorizado, una diferencia de 0,046 nats sostenida en todos los checkpoints intermedios.

Es relevante ahora porque se sitúa en la intersección de tres líneas activas: reservoir computing, neurociencia computacional a escala de conectoma y modelos de lenguaje de tamaño reducido. Además, sirve como banco de pruebas reproducible de bajo coste (1,74 h en una única RTX 5080) para estudiar el papel de la estructura del cableado en el cómputo. Sus capacidades lingüísticas son deliberadamente estrechas: está entrenado solo con TinyStories y escribe narrativa infantil simple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reservoir computing con echo state network sobre conectoma biologico; capa recurrente dispersa y congelada, sin atencion y sin codificacion posicional |
| Parametros totales | 34.466.505 (segun safetensors) |
| Parametros activos | No aplica: no es un modelo MoE. Parametros entrenables: 16,25 M (readout 12,90 M, proyeccion de entrada 2,93 M, embedding 0,26 M, escalares por neurona 0,15 M) |
| Longitud de contexto | No hay ventana de atencion; linea de retardo de 8 tokens mas memoria recurrente con fuga. La perdida deja de mejorar hacia la posicion 32 |
| Tipos de cuantizacion | No disponible. No se publican pesos GGUF y llama.cpp no puede ejecutar el modelo |
| Idiomas soportados | Ingles (en) |
| Licencia | Pesos CC BY 4.0; codigo de modelado Apache-2.0 |
| Formato de pesos | safetensors con codigo personalizado (requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

La capa recurrente es una matriz dispersa de 49.393 × 49.393 con 9.055.280 aristas con signo (se descartaron 623.728 por ser moduladoras o de transmisor desconocido). El peso de cada arista se calcula como el signo del transmisor presinaptico multiplicado por el numero de sinapsis, con las filas normalizadas a peso absoluto unitario: acetilcolina suma +1; GABA, glutamato e histamina restan 1; el resto se anula. La entrada de tokens llega a 11.434 neuronas orientadas a senoriales mediante una linea de retardo de 8 posiciones (la ranura *j* recibe el token *t−j*). Las 2.635 neuronas receptoras olfativas (ORN) quedan fuera de la entrada de tokens para que la variante encoder-decoder pueda partir de estos pesos. La dinamica es `x ← (1−a)·x + a·tanh(ρ·g·(Wx) + u + b)`, con dos ticks por token; `a` se aprende por neurona (inicializada en 0,5) y `ρ` es un escalar global aprendido que paso de 1,0 a 4,26. El readout aplica `Linear(49393→256)`, `LayerNorm` y `Linear(256→1024)`.

El entrenamiento usa TinyStories: 98.024 historias (1.976 reservadas para validacion), 28.417.062 tokens y vocabulario BPE a nivel de byte de 1.024 entradas. El objetivo es entropia cruzada de siguiente token con BPTT truncada en ventanas de 32 tokens y estado arrastrado entre ventanas. Optimizador AdamW con tasa 2e-3 para el cuerpo (sin decaimiento) y 5e-4 para el readout (decaimiento 0,01), 200 pasos de calentamiento y posterior decaimiento coseno hasta el 10 %, con recorte de gradiente en 1,0. Tres epocas, 22.115 actualizaciones, tamano de lote 128 y 1,74 h en una RTX 5080 a unos 13.700 tokens/s. No se menciona RLHF ni DPO. La innovacion principal es el uso de la conectividad medida como reservoir fijo: el numero de parametros entrenables es minusculo en comparacion con la estructura fija que lo rodea.

## Capacidades

- Generacion de texto narrativo en ingles muy simple, al estilo de las historias de TinyStories (personajes recurrentes como Lily o Tom).
- Modelado de secuencia con memoria recurrente de corto alcance mediante un reservoir biologico congelado.
- Generacion greedy, por muestreo, top-k y top-p.
- Capacidad de investigacion: los estados de las 49.393 neuronas son inspeccionables y representables sobre las coordenadas anatomicas medidas (la model card incluye una visualizacion del conectoma coloreado por estado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; solo ingles.
- Capacidades especiales: no hay modo de razonamiento explicito, ni vision, ni audio, ni capacidades de codigo o matematicas. No es un modelo de spikes: usa neuronas de tasa con tanh, sin retardo sinaptico ni neuromodulacion.

## Casos de uso

- Investigacion en reservoir computing: permite comparar de forma controlada el rendimiento de un reservoir biologico real frente a uno con cableado aleatorizado de grados equivalentes, reutilizando el mismo recipe de entrenamiento.
- Neurociencia computacional: el modelo ofrece un mapeo directo entre estados internos y neuronas anatomicamente identificadas, util para estudiar que subconjuntos del cerebro central se activan durante una tarea linguistica concreta.
- Docencia y divulgacion: con 1,74 h de entrenamiento en una GPU de consumo y 0,1 GB de repositorio, sirve para ilustrar en clase la diferencia entre pesos entrenados y dinamica fija, y el concepto de echo state network.
- Generacion de datos sinteticos infantiles: puede producir corpus de narrativa simple y controlada para preentrenar o hacer pruebas de modelos pequenos, aunque la calidad y la variedad son limitadas.
- Banco de pruebas de despliegue stateful: al no soportar beam search ni generacion asistida, es util para probar integraciones que mantengan estado entre llamadas y que no dependan de kernels de atencion.
- Estudio de interpretabilidad topologica: dado que el cableado esta congelado, cualquier cambio de comportamiento es atribuible a los 16,25 M de parametros entrenables o a la dinamica recurrente, no a la reconfiguracion de la sinapsis.
- Experimentos de ablation sobre el conectoma: se pueden eliminar poblaciones de neuronas (por ejemplo, las ORN, ya excluidas de la entrada) y medir el efecto en la perplejidad sin reentrenar el reservoir.
- Referencia educativa para reservoir computing frente a transformers: permite contrastar un modelo sin atencion ni codificacion posicional contra arquitecturas transformer pequenas sobre el mismo dataset.

## Benchmarks y rendimiento

Solo se publican resultados de perdida en validacion sobre datos retenidos, con el mismo recipe, comparando el conectoma real con un control de cableado aleatorizado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | Val loss | Perplejidad |
|---|---|---|
| nanofly-decoder-en (conectoma real) | 1,933 | 6,9 |
| Control con cableado aleatorizado de grados equivalentes | 1,979 | 7,2 |

El control conserva el grado de entrada y salida de cada neurona, los signos de transmisor y la ley de Dale, y solo aleatoriza el emparejamiento entre neuronas. La ventaja del conectoma real es de 0,046 nats (aproximadamente un 4 % de perplejidad) y se mantiene en todos los checkpoints intermedios, pero se trata de una unica semilla por condicion, por lo que el autor pide tratar el margen como indicativo. La validacion seguia mejorando al final del entrenamiento: el checkpoint esta subentrenado, no sobreajustado.

Rendimiento de inferencia declarado: unos 960 pases forward por segundo en una RTX 5080 y unos 10 por segundo en la CPU de un portatil.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio completo ocupa 0,1 GB y los 34,5 M de parametros en fp32 equivalen a unos 138 MB de pesos, por lo que cabe con holgura en cualquier GPU de consumo moderna, pero la model card no publica una cifra de VRAM pico.
- GPU recomendadas: no hay una lista oficial. El autor entreno con una sola RTX 5080 (1,74 h) y midio 960 pases forward/s en esa misma GPU.
- GPU de consumo: si, el modelo es claramente apto para GPU de consumo por tamano; tambien corre en CPU a unos 10 pases forward/s.
- Opciones de despliegue: unicamente `transformers` con `trust_remote_code=True`. No hay soporte de GGUF y llama.cpp no puede ejecutarlo, porque la capa recurrente es una matriz dispersa de 49.393 × 49.393 con 9 M de no ceros y ggml no tiene operador para ella.
- Compatibilidad con vLLM, TGI, Ollama o llama.cpp: no disponible; no se documenta soporte y el caracter stateful del modelo y el codigo personalizado lo hacen poco probable.
- Restricciones de generacion: beam search y generacion asistida no estan soportadas por ser un modelo con estado. Greedy, muestreo, top-k y top-p si funcionan. Es obligatorio anteponer el token BOS, porque todos los ejemplos de entrenamiento empezaban con el.
- Latencia y throughput: 960 pases forward/s en RTX 5080; 10 pases forward/s en CPU de portatil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanofly-decoder-en (este modelo) | 34,5 M totales, 16,25 M entrenables | Linea de retardo de 8 tokens, sin atencion; mejora hasta ~32 posiciones | Val loss 1,933 / ppl 6,9 en TinyStories | Pesos CC BY 4.0, codigo Apache-2.0 | HuggingFace, transformers con trust_remote_code |
| igorktech/nanofly-decoder-ru (variante rusa) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| ngxson/fly-llm-hf (arte previo citado) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Control de cableado aleatorizado (no publicado como modelo) | Misma estructura, mismos grados | Identico | Val loss 1,979 / ppl 7,2 | No aplica | No distribuido |

La informacion disponible no incluye especificaciones detalladas de las alternativas, por lo que la comparacion se limita a lo anterior. No hay datos publicados para comparar con transformers pequenos entrenados sobre TinyStories en la informacion proporcionada.

## Limitaciones y advertencias

- Capacidad linguistica muy restringida: 16,25 M de parametros entrenables sobre 28,4 M de tokens de cuentos infantiles. El autor indica explicitamente que el modelo escribe sobre Lily y Tom y poco mas.
- Contexto efectivo corto: la linea de retardo de 8 tokens mas la memoria recurrente con fuga hacen que la perdida deje de mejorar hacia la posicion 32; los nombres y objetos se degradan dentro de un mismo parrafo.
- No es un modelo biologico fiel: la neurona de tasa con tanh no genera spikes ni modela retardos sinapticos ni neuromodulacion; las aristas moduladoras se eliminan directamente.
- Cobertura anatomica parcial: solo el cerebro central. Faltan los lobulos opticos y el cordon nervioso ventral del sistema nervioso central completo de 166.700 neuronas.
- El numero de sinapsis se usa como aproximacion de la fuerza sinaptica y las filas estan normalizadas; ninguna de las dos cosas es fisiologia medida.
- Evidencia estadistica limitada en la comparacion con el control: una sola semilla por condicion. El margen de 0,046 nats debe tratarse como indicativo.
- Riesgo de alucinacion: alto en cualquier dominio fuera de la narrativa infantil simple; no hay evaluacion de factualidad.
- Idiomas: solo ingles. No hay soporte multilingue declarado.
- Licencia: los pesos son CC BY 4.0, lo que permite uso comercial con atribucion, pero hay que mantener la atribucion del conectoma MaleCNS v1.0 (FlyEM / HHMI Janelia, University of Cambridge, MRC LMB, Google Research) al redistribuir. El codigo de modelado es Apache-2.0.
- Despliegue en produccion: requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; no hay soporte de GGUF, llama.cpp, ni de tecnicas de decodificacion como beam search o generacion asistida. El modelo es stateful, lo que complica el batching y el servido concurrente.
- La validacion seguia mejorando al final del entrenamiento: el checkpoint esta subentrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igorktech/nanofly-decoder-en
- Repositorio de codigo nanoFLY: https://github.com/igorktech/nanoFLY
- Variante en ruso: https://huggingface.co/igorktech/nanofly-decoder-ru
- Arte previo fly-llm-hf: https://huggingface.co/ngxson/fly-llm-hf
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Echo state network (referencia general): https://en.wikipedia.org/wiki/Echo_state_network
- Conectoma MaleCNS v1.0: FlyEM / HHMI Janelia, University of Cambridge, MRC LMB y Google Research (CC BY 4.0); sin URL en la informacion disponible
- Shiu et al., *Nature* 2024 (signos de neurotransmisor): referencia citada en la model card, sin URL en la informacion disponible
- Costi, Hadjiivanov, Dold, Hale, Izzo, 2025 (conectoma como reservoir): referencia citada en la model card, sin URL en la informacion disponible
- Eldan y Li, *TinyStories*, 2023: referencia citada en la model card, sin URL en la informacion disponible
