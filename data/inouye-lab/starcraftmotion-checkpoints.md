# inouye-lab/StarCraftMotion-checkpoints

## Resumen

StarCraft Motion checkpoints es un repositorio de pesos (checkpoints) asociado al proyecto StarCraft Motion, un conjunto de datos y codigo para simulacion de agentes en escenarios adversarios y parcialmente observables. Lo desarrolla el grupo inouye-lab (David I. Inouye y colaboradores), y los pesos corresponden al modelo HMART, ademas de una variante HMART + CAT-K. El repositorio no contiene una definicion de modelo autonomo al estilo de un LLM: son pesos de investigacion que requieren el codigo del repositorio StarCraftMotion y su diccionario de movimiento y mapas estaticos para funcionar.

El problema que aborda es la simulacion de comportamiento de agentes (prediccion de movimiento e intencion) en el juego StarCraft, un entorno con adversarios y observabilidad parcial. Es relevante para investigacion en modelado de agentes, planificacion bajo incertidumbre y evaluacion de politicas en entornos competitivos, no para tareas de generacion de lenguaje.

La informacion publicada es muy limitada: el repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes, y la model card solo describe los ficheros de pesos y su procedencia. No se publican parametros, contexto, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HMART (no se detalla en la informacion disponible); variante HMART + CAT-K |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Source Code License (nvidia-source-code-license), uso no comercial |
| Formato de pesos | checkpoints PyTorch (.ckpt): hmart.ckpt, hmart_catk.ckpt |

## Arquitectura y entrenamiento

La model card identifica los pesos como HMART y HMART + CAT-K, pero no describe la arquitectura interna (tipo de red, numero de capas, dimensiones ocultas ni mecanismo de atencion). Tampoco se detallan los datos de entrenamiento, el numero de tokens o episodios, ni si hubo aprendizaje por refuerzo, ajuste supervisado o preferencias.

Lo unico documentado es que las tablas de simulacion del trabajo original reportan media ± desviacion tipica sobre tres semillas, y que estos pesos corresponden a una de esas ejecuciones (la usada para los resultados de intencion y objetivo de una sola ejecucion). Para reproducir resultados se requiere el diccionario de movimiento y los mapas estaticos del repositorio de codigo.

## Capacidades

- Simulacion de movimiento de agentes en entornos tipo StarCraft, segun el proposito declarado del proyecto.
- Modelado de intencion y objetivo del agente (la model card menciona resultados de "intent and target").
- Variante con CAT-K, presumiblemente un componente adicional de modelado (no se detalla su funcion en la informacion disponible).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso en el sentido de LLM: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en simulacion de agentes: usar los checkpoints junto al codigo StarCraftMotion para reproducir los resultados de intencion y objetivo publicados en el paper, con las tres semillas de referencia.
- Evaluacion de modelos de prediccion de movimiento: comparar HMART frente a HMART + CAT-K en los escenarios del dataset StarCraftMotion para medir el efecto del componente CAT-K.
- Estudio de entornos parcialmente observables: emplear los pesos como linea base en experimentos sobre planificacion con informacion incompleta en juegos de estrategia.
- Reproducibilidad academica: cargar hmart.ckpt y hmart_catk.ckpt con el diccionario de movimiento y los mapas estaticos del repositorio para replicar las tablas del paper de NeurIPS 2026.
- Docencia e investigacion en IA de juegos: usar el par de checkpoints como ejemplo practico de modelado de comportamiento en un entorno adversario.
- Desarrollo de nuevos metodos sobre la misma base: partir de estos pesos como inicializacion para experimentos propios de modelado de agentes, sujeto a la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que las tablas de simulacion reportan media ± desviacion tipica sobre tres semillas, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros ni tamano de los checkpoints; el repositorio declara 0.0 GB, dato no fiable para estimar memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: requiere PyTorch y el codigo del repositorio github.com/inouye-lab/StarCraftMotion; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (simulacion de agentes en StarCraft) con parametros, contexto o licencia documentados.

## Limitaciones y advertencias

- Licencia NVIDIA Source Code License, de uso no comercial: no apta para productos comerciales sin autorizacion expresa.
- Los pesos no son autonomos: dependen del diccionario de movimiento y los mapas estaticos del repositorio de codigo, y de la version concreta del codigo para reproducir resultados.
- Los pesos corresponden a una sola semilla de las tres usadas en las tablas del paper; la variabilidad entre semillas debe tenerse en cuenta al comparar.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma.
- Repositorio con 0 descargas y 0 likes y creado en 2026: madurez y soporte comunitario no verificables.
- No se especifican requisitos de hardware ni versiones de dependencias, lo que complica el despliegue en produccion.
- Al ser pesos de investigacion para un entorno de juego concreto, no deben presentarse como modelo de lenguaje de proposito general.

## Enlaces

- HuggingFace: https://huggingface.co/inouye-lab/StarCraftMotion-checkpoints
- Codigo: https://github.com/inouye-lab/StarCraftMotion
- Dataset: https://huggingface.co/datasets/inouye-lab/StarCraftMotion
- Paper (NeurIPS 2026): StarCraft Motion: A Dataset for Agent Simulation in Adversarial and Partially Observable Scenarios (Chen, Kim, Bai, Hare, Gao, Inouye)
- Licencia: fichero LICENSE del repositorio (NVIDIA Source Code License)
