# hiro-coevolution/connectailab-rl-coevolution-v1

## Resumen

connectailab-rl-coevolution-v1 es un adaptador LoRA de tipo PEFT publicado por el usuario hiro-coevolution sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de propósito general: se trata de un clasificador de decisiones entrenado para leer el estado, la pregunta y las opciones de un simulador empresarial (CONNECT TYCOON) y devolver la letra de la opción elegida. El repositorio se publicó el 13 de octubre de 2026, ocupa 0,0 GB (solo contiene los pesos del adaptador) y acumula 0 descargas y 1 "like" en el momento de redactar esta ficha.

El interés del proyecto es metodológico más que de rendimiento bruto. El autor documenta un pipeline completo de coevolución: primero entrena una política pequeña local como "profesor" mediante imitación durante 40 meses simulados y PPO (60 iteraciones de 24 meses), después genera 4.082 problemas de entrenamiento, 832 de validación y 840 de test con ese profesor, filtra hasta 3.440 ejemplos y aplica un LoRA supervisado (1 época, 430 pasos, batch 8, rank 8, lr 1e-4) seguido de una fase adicional con puntuaciones de opciones y un término KL contra el modelo de partida (100 pasos, batch 8, lr 5e-6, beta 0,2, máximo 1.500 problemas).

La relevancia actual radica en que demuestra, con recursos muy limitados (una Tesla T4 gratuita de Colab, semilla 0, torch 2.11.0+cu130, transformers 5.18.0 y peft 0.21.1), que un adaptador de bajo rango sobre un modelo de 0,8 mil millones de parámetros puede pasar de un 29,17 % de acierto a un 84,17 % en una tarea de decisión cerrada. Sus propias mediciones, sin embargo, también muestran que no supera a la política profesora en ninguna de las métricas operativas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B; la arquitectura del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | No disponible. El modelo base se denomina Qwen3.5-0.8B; el adaptador LoRA tiene rango 8, por lo que anade un numero reducido de parametros respecto a la base |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; las cuantizaciones aplicables serian las que soporte el modelo base |
| Idiomas soportados | Coreano (ko), segun la etiqueta de idioma del repositorio y la model card |
| Licencia | Apache-2.0 (se incluye ademas la LICENSE del codigo original) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere descargar el modelo base por separado) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 8 que se acopla al modelo Qwen/Qwen3.5-0.8B mediante la libreria PEFT. La arquitectura subyacente del modelo base no se describe en la informacion disponible. El adaptador no genera texto libre: puntua opciones y selecciona una letra comparando las probabilidades asignadas a cada alternativa dentro del formato de tarea de CONNECT TYCOON.

El entrenamiento se desarrollo en cuatro fases documentadas. Primero se entreno localmente una politica pequena (tipo de empresa "general", con pesos de beneficio, satisfaccion de cliente y riesgo fijados en 1) mediante aprendizaje por imitacion durante 40 meses y PPO de 60 iteraciones por 24 meses, y se guardo como profesor "coevolution-v1". Despues se generaron 4.082 problemas de entrenamiento, 832 de validacion y 840 de test, evaluando cada opcion dentro del simulador y usando las respuestas del profesor para las decisiones matutinas. A continuacion se filtro el conjunto hasta 3.440 problemas y se hizo un ajuste supervisado del LoRA (1 epoca, 430 pasos, batch 8, rank 8, lr 1e-4). Por ultimo se anadio una fase de aprendizaje con puntuaciones de opciones y un termino KL respecto al modelo de partida (100 pasos, batch 8, lr 5e-6, beta 0,2, maximo 1.500 problemas); el autor indica que PPO se uso en la fase de politica profesora, no en la fase de lenguaje.

No se menciona tokenizador propio, ventana de contexto ampliada, decodificacion especulativa ni atencion lineal. La revision exacta de descarga del modelo base no quedo registrada en el historial de ejecucion y figura como no confirmada. Los ficheros `run-manifest.json` y `SHA256.json` recogen el commit fijo del codigo fuente y los hashes de los ficheros publicados.

## Capacidades

- Seleccion de una opcion etiquetada (A, B, ...) a partir de un estado, una pregunta y una lista de alternativas descritas en texto, devolviendo la letra elegida.
- Puntuacion comparativa de opciones mediante vectores de probabilidad sobre las etiquetas disponibles.
- Decisiones de gestion empresarial simulada: el autor evalua politicas de operacion en terminos de beneficio mensual, satisfaccion de cliente y numero de incidentes.
- Clasificacion de transacciones de tarjeta en la prueba publica descrita: 713 operaciones, 177 fraudulentas, con 147 detecciones.
- Reproducibilidad verificable: el autor comprobo que, tras recargar el adaptador guardado, el resumen de la prueba de tarjetas coincidia con el original y que en 5 problemas adicionales las elecciones y los vectores de probabilidad eran identicos (diferencia maxima 0).
- Soporte de tool calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo resuelve una decision puntual por llamada.
- Capacidades multilingues: limitadas al coreano segun las etiquetas; no se documenta cobertura de otros idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.
- Conversacion general: el propio autor indica explicitamente que no es un modelo evaluado para rendimiento conversacional general.

## Casos de uso

- Optimizacion de politicas en el simulador CONNECT TYCOON: el adaptador se integra a traves de la clase `Scorer` de `connect_tycoon.llm.train_torch` y devuelve la opcion a ejecutar en cada turno; es el uso para el que fue entrenado y el unico con evaluacion publicada.
- Investigacion en coevolucion y aprendizaje por refuerzo: sirve como ejemplo reproducible de destilacion desde una politica profesora hacia un LoRA pequeno, con particiones de datos y semilla documentadas (semilla 0).
- Deteccion de fraude en transacciones con tarjeta: en la prueba del autor sobre 713 operaciones detecto 147 de 177 fraudes (83,05 %) y redujo las perdidas un 72,55 % respecto a aprobar todas las operaciones, aunque bloqueo 69 transacciones legitimas y no activo ninguna revision humana.
- Practicas educativas de RLHF/DPO: el repositorio incluye un cuaderno de entrenamiento y un manifiesto de ejecucion que permiten reproducir el flujo completo en una GPU T4 gratuita de Colab.
- Generacion de trayectorias etiquetadas para simuladores: la politica profesora empleada para construir los 4.082 problemas permite crear conjuntos de datos sinteticos de decision para alimentar otros modelos.
- Evaluacion comparativa de heuristicas frente a modelos: el autor compara reglas fijas, la politica profesora y este adaptador bajo las mismas condiciones de simulacion (semillas 7000 y 7001, 2 meses), lo que permite usar el adaptador como referencia en estudios de decision secuencial.
- Ahora bien, en cualquier escenario de produccion real (atencion al cliente, analitica financiera, operaciones) el modelo no ha sido validado: su alcance declarado se limita al simulador publico y a un unico conjunto de prueba.

## Benchmarks y rendimiento

El autor publica dos tablas de resultados. La primera corresponde a los mismos 840 problemas de test:

| Etapa | Precision | Deficiencia frente a la mejor puntuacion (menor es mejor) |
|---|---:|---:|
| Antes del entrenamiento | 29,17 % | 2,36524 |
| Ajuste supervisado (SFT) | 84,29 % | 1,47377 |
| Entrenamiento adicional (recompensa + KL) | 84,17 % | 1,42432 |

El autor senala que la fase adicional redujo la precision en 0,12 puntos porcentuales pero mejoro la puntuacion. Los valores originales se conservan en `qwen-results.json`.

La segunda tabla compara politicas de operacion en dos meses simulados nunca vistos (semillas 7000 y 7001), con medias de ambos:

| Politica de operacion | Beneficio mensual | Satisfaccion del cliente | Numero de incidentes |
|---|---:|---:|---:|
| Reglas fijas | 548,205 | 0,78252 | 7,5 |
| Politica profesora | 1.362,225 | 0,95342 | 2,0 |
| Adaptador Qwen (este modelo) | 892,215 | 0,97705 | 12,0 |

El beneficio se expresa en unidades de diez mil wones del simulador y no representa ingresos reales. El adaptador obtuvo mas beneficio que las reglas fijas, menos que la politica profesora y mas que ambas en satisfaccion de cliente, pero tambien el mayor numero de incidentes (12 frente a 7,5 y 2,0). El autor advierte que se trata de una prueba de solo dos meses.

En la prueba de tarjetas de credito ya citada: 147 fraudes detectados de 177, 30 no detectados, 69 transacciones legitimas bloqueadas, 0 revisiones humanas y una reduccion del 72,55 % de las perdidas respecto a aprobar todo. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar de lenguaje, y no deben extrapolarse a partir de estas cifras.

## Requisitos de hardware

- Entrenamiento documentado: una Tesla T4 gratuita de Colab, con torch 2.11.0+cu130, transformers 5.18.0 y peft 0.21.1, semilla 0.
- VRAM de inferencia: no disponible de forma explicita. Por el tamano del modelo base (0,8 mil millones de parametros) y el rango 8 del adaptador, la inferencia en precision completa o en 8 bits cabe holgadamente en GPU de consumo con 8 GB o mas; en 4 bits el requisito baja aun mas. Estas cifras son estimaciones basadas en el tamano y no mediciones del autor.
- GPU recomendadas: no disponibles. Cualquier GPU de consumo reciente (por ejemplo, RTX 3060, RTX 4070, RTX 4090) o una T4 de centro de datos es suficiente para inferencia; el cuello de botella real es el simulador, no el modelo.
- Despliegue: el uso previsto es la clase `Scorer` de `connect_tycoon.llm.train_torch`, que carga el adaptador a traves de PEFT. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF; habria que fusionar el adaptador con la base y convertir el resultado.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni metricas de tokens por segundo.

## Comparativa con modelos similares

No hay disponibles modelos de terceros comparables en la informacion proporcionada. El autor ofrece dos referencias internas bajo las mismas condiciones de evaluacion:

| Sistema | Naturaleza | Precision en test (840 problemas) | Beneficio mensual simulado | Incidentes | Licencia |
|---|---|---:|---:|---:|---|
| Reglas fijas | Heuristica del simulador | No medida | 548,205 | 7,5 | No aplica |
| Politica profesora (`coevolution-v1`) | Politica pequena entrenada con imitacion + PPO | No medida | 1.362,225 | 2,0 | No disponible |
| connectailab-rl-coevolution-v1 | LoRA rank 8 sobre Qwen3.5-0.8B | 84,17 % | 892,215 | 12,0 | Apache-2.0 |
| Qwen/Qwen3.5-0.8B sin adaptador | Modelo base | No medida (el autor solo reporta el 29,17 % del punto de partida, que corresponde al modelo sin ajuste) | No medida | No medida | No disponible |

La comparativa con modelos de decision de otros autores (por ejemplo, agentes sobre modelos de mayor tamano) no esta disponible.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo puntua opciones en el formato de tarea de CONNECT TYCOON. El autor advierte que no es un modelo de conversacion general y que no se ha medido su rendimiento conversacional.
- Sesgos conocidos: no documentados de forma especifica. El entrenamiento procede de un unico simulador con empresa de tipo "general" y pesos de beneficio, satisfaccion y riesgo fijados en 1, por lo que las decisiones heredan esas suposiciones.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el modelo elige entre opciones cerradas. El riesgo equivalente es seleccionar una opcion incorrecta o perjudicial, que es precisamente lo que miden las tasas de fallo publicadas.
- Validacion limitada: un unico seed, dos meses simulados en la prueba operativa y 840 problemas en el test. El autor indica expresamente que estos resultados no demuestran rendimiento de decision en empresas reales ni efectos de conectar varios modelos.
- Resultados contradictorios entre metricas: el adaptador mejora la satisfaccion del cliente frente al profesor (0,97705 frente a 0,95342) pero genera seis veces mas incidentes (12 frente a 2) y menos beneficio. Es una advertencia directa contra desplegarlo sin supervision.
- Falsos positivos en la prueba de fraude: 69 transacciones legitimas bloqueadas y ninguna derivada a revision humana, lo que en un entorno real implicaria reclamaciones y costes de atencion al cliente.
- Reproducibilidad incompleta: la revision exacta del modelo base descargado no quedo registrada y figura como no confirmada. Solo 5 problemas adicionales se reevaluaron individualmente; los 840 del test no se reevaluaron en su totalidad una segunda vez.
- Licencia: Apache-2.0, que permite uso comercial, pero se incluye ademas la LICENSE del codigo original, cuyos terminos conviene revisar antes de reutilizar el material.
- Idiomas: el modelo esta etiquetado solo para coreano; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Estado del repositorio: 0 descargas y 1 "like" en la fecha de consulta, sin uso comunitario documentado ni incidencias reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hiro-coevolution/connectailab-rl-coevolution-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Version fijada del repositorio: https://github.com/wonseokjung/connect-tycoon/tree/98f96431195dfd7e0e3f1cd59ce7a500c92ee935
- Cuaderno de entrenamiento RL: https://github.com/wonseokjung/connect-tycoon/blob/98f96431195dfd7e0e3f1cd59ce7a500c92ee935/notebooks/rl_decision_model_qwen_colab.ipynb
- Ficheros citados por el autor (no verificados en esta ficha): `run-manifest.json`, `SHA256.json` y `qwen-results.json`, dentro del repositorio de HuggingFace.
- Busqueda web: los resultados devueltos corresponden a un cantante frances homonimo ("Hiro") y no guardan ninguna relacion con este modelo. No se han encontrado papers, blogs ni demos adicionales sobre connectailab-rl-coevolution-v1.
