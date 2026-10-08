# Kai9987kai/Supermix-Poseidon

## Resumen

Supermix Poseidon & Beyond es un modelo de mundo cognitivo (world model) compacto y auditable, publicado por el autor Kai9987kai bajo licencia MIT, orientado a ejecucion local en CPU de consumo. No es un modelo de lenguaje generativo al uso: se trata de un sistema de aprendizaje por refuerzo que combina un tronco de mezcla de expertos dispersa (Sparse Adaptive Mixture-of-Experts de top-2, con profundidad recurrente adaptativa), un conjunto de tres cabezas de dinamica para estimar incertidumbre epistemica, recurrencia inspirada en conectoma y memoria dual persistente. El total declarado es de aproximadamente 327.230 parametros en el tronco (~0,33 M) mas unos 150.000 en el ensemble de dinamica.

El modelo resuelve un problema acotado: predecir atributos de escena (forma, color, movimiento, recuento y escala), seleccionar una politica de macro-acciones entre seis opciones de supervivencia y planificar con control predictivo basado en modelo (MPC) sensible al riesgo, penalizando la incertidumbre de transicion y la probabilidad de fallo mediante Q*(s,a) = E[R] - lambda·U(s,a) - beta·P(fallo). La inferencia declarada es de ~2,9 ms en modo reactivo y ~5,6 ms en modo MPC consciente de incertidumbre sobre CPU de consumo.

Su relevancia actual es fundamentalmente de investigacion: el autor publica "recibos" de auditoria con hashes SHA-256 de los conjuntos de datos, evaluaciones congeladas sobre 2.048 escenas y 24 semillas, y resultados negativos reproducidos (la ventaja matematica del cableado biologico autentico frente a uno aleatorizado preservando grado). El repositorio de HuggingFace no registra descargas ni valoraciones, y los resultados no cuentan con revision por pares en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos dispersa y adaptativa (Sparse Adaptive MoE, top-2), con profundidad recurrente adaptativa, ensemble de 3 cabezas de dinamica, recurrencia tipo conectoma y memoria dual persistente |
| Parametros totales | 327.230 (~0,33 M) en el tronco + ~150.000 en el ensemble de dinamica de 3 cabezas |
| Parametros activos | no disponible (se declara enrutado disperso top-2, pero no se desglosa el numero de expertos ni los parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en punto flotante PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt): core.pt (1,33 MB), core_base.pt (4,00 MB), ensemble_adapted.pt (382 KB); el repositorio incluye la etiqueta safetensors y un adaptador LoRA en el directorio adapter/ (~254 KB) |

Otras especificaciones declaradas: ficheros de configuracion (config.json, 192 B), manifiesto de promocion (active_core.json), calibracion por escalado de temperatura segun Guo et al. 2017 (calibration.json, 2,24 KB), evaluacion congelada (evaluation.json, 100,6 KB) y recibo de entrenamiento con hashes SHA-256 (receipt.json). Tamano del repositorio reportado: 0,0 GB.

## Arquitectura y entrenamiento

El sistema procesa dos entradas. La primera es un prompt de texto que pasa por un codificador denominado Blake2b Lemma-Bigram; la segunda es un estado de 16 dimensiones que pasa por una proyeccion de observacion. Ambas se combinan en el tronco Sparse Adaptive MoE con profundidad recurrente adaptativa, que produce tres salidas: atributos de escena (forma, color, movimiento, recuento, escala); una politica de macro-acciones de seis elecciones de supervivencia; y el ensemble de dinamica de 3 cabezas f_theta(s,a). La divergencia entre las cabezas alimenta la estimacion de incertidumbre epistemica U(s,a), que junto con la probabilidad de fallo P(fallo|a) entra en el planificador MPC sensible al riesgo.

El entrenamiento combina un curriculum conjunto con DAgger en politica (on-policy). El checkpoint promovido core.pt procede de ese proceso, mientras que core_base.pt es una linea base supervisada entrenada con 120.000 ejemplos (360.000 exposiciones). El ensemble ensemble_adapted.pt se entrena sobre un buffer de repeticion de sorpresas (surprise replay buffer) y se valida mediante una auditoria de promocion que verifica un 100% de supervivencia en el conjunto de prueba reservado y una reduccion relativa del 81% en la perdida de dinamica. Se incluye ademas una calibracion por escalado de temperatura sobre el split de desarrollo, y un experimento fijado de adaptador LoRA para ajuste conversacional sobre SmolLM2-135M.

Entre las innovaciones tecnicas destacadas por el autor figuran la recurrencia de conectoma con celdas recurrentes de 256 nodos y 4.118 sinapsis (6,28% de densidad), la memoria dual persistente para recuerdo diferido, la atenuacion dinamica de las penalizaciones de incertidumbre durante el agotamiento critico de recursos, y la vectorizacion del planificador de incertidumbre con tres modelos, que resulta un 33,1% mas rapido en CPU que el MPC de modelo unico.

## Capacidades

- Prediccion de atributos de escena a partir de texto y estado: forma, color, movimiento, recuento y escala.
- Politica de macro-acciones con seis elecciones discretas orientadas a supervivencia.
- Modelado de dinamica f_theta(s,a) mediante ensemble de tres cabezas.
- Estimacion de incertidumbre epistemica por desacuerdo entre cabezas y estimacion de riesgo de fallo.
- Planificacion con control predictivo basado en modelo (MPC) sensible al riesgo, con la funcion Q*(s,a) = E[R] - lambda·U(s,a) - beta·P(fallo).
- Memoria dual persistente con recuerdo diferido: 100,0% de recuerdo en horizontes K perteneciente a {2, 4, 8} segun la evaluacion declarada.
- Recurrencia basada en conectoma biologico, con ablacion frente a cableado aleatorizado que preserva el grado (Maslov-Sneppen).
- Codificacion de texto mediante Blake2b Lemma-Bigram; no se declara generacion de lenguaje libre.
- Adaptador LoRA experimental para ajuste conversacional sobre SmolLM2-135M (capacidad derivada del modelo base, no del tronco Supermix).
- No se declaran capacidades de tool calling, function calling, agentes multi-paso generales, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en modelos de mundo para refuerzo: el sistema permite estudiar planificacion consciente de incertidumbre con un coste computacional de milisegundos, sin necesidad de GPU, facilitando la reproducibilidad de experimentos con semillas controladas.
- Experimentos de aprendizaje por imitacion con DAgger: el pipeline declarado (curriculum conjunto mas DAgger en politica) sirve como banco de pruebas para comparar politicas reactivas frente a planificadores basados en modelo bajo condiciones de escasez de recursos.
- Control predictivo en entornos simulados de recursos limitados: el planificador MPC sensible al riesgo es adecuado para estudiar el compromiso entre exploracion y explotacion cuando la energia es escasa, incluido el fenomeno de "trampa del pesimismo" documentado a scarcity = 4.0.
- Generacion procedural con validacion de atributos: dado que el modelo predice forma, color, movimiento, recuento y escala, puede emplearse para etiquetar o filtrar escenas generadas proceduralmente en prototipos de videojuegos o simuladores.
- Estudio de ablaciones de conectoma: la comparacion entre cableado biologico autentico y cableado aleatorizado preservando grado permite reproducir hallazgos negativos con una reduccion del 93,72% en parametros sinapticos, util en neurociencia computacional.
- Investigacion sobre memoria episodica: la memoria dual persistente con 100% de recuerdo a horizontes 2, 4 y 8 es un banco de pruebas para estudiar retencion de senales en presencia de pasos distractores.
- Despliegue en dispositivos de borde y sistemas embebidos: con latencias de 2,9 a 5,7 ms en CPU de consumo y pesos de 1,33 MB, es viable integrarlo en bucles de control en tiempo real donde no hay GPU disponible.
- Educacion y divulgacion: su tamano reducido y sus ficheros de auditoria (recibos con hashes, evaluaciones congeladas) lo hacen util para ensenar practicas de trazabilidad en experimentos de aprendizaje automatico.

## Benchmarks y rendimiento

Benchmark de planificacion emparejada de 100 episodios (scarcity = 2,5; semillas 1000-1099; maximo de 256 pasos):

| Planificador | Tasa de supervivencia | Intervalo de confianza al 95% | Pasos medios | Retorno medio | Latencia por paso |
|---|---|---|---|---|---|
| Politica reactiva (prior DAgger) | 100,0% | ±0,00% | 256,0 | 25,68 | 2,90 ms |
| MPC de modelo unico (v0.1) | 100,0% | ±0,00% | 256,0 | 25,67 | 8,47 ms |
| MPC consciente de incertidumbre (Beyond) | 99,0% | ±1,95% | 255,4 | 25,53 | 5,67 ms |

Hallazgos adicionales declarados por el autor:

| Experimento | Resultado |
|---|---|
| Trampa del pesimismo (scarcity = 4,0, lambda = 1,5) | El planificador penaliza en exceso las rutas exploratorias de alta varianza; la atenuacion dinamica de la penalizacion restaura la supervivencia exploratoria |
| Conectoma autentico de mosca (256 nodos, 4.118 sinapsis, densidad 6,28%) | Varianza de estado = 0,0525; autocorrelacion = 0,1368 |
| Cableado aleatorizado Maslov-Sneppen | Varianza de estado = 0,0543; autocorrelacion = 0,1843 |
| Memoria dual persistente (K perteneciente a {2, 4, 8}) | 100,0% de recuerdo |
| Linea base reactiva sin memoria | 26% - 36% (nivel de azar) |
| Memoria alterada aleatoriamente | 12% - 16% (peor que el azar) |
| Reduccion de parametros sinapticos con conectoma | 93,72% |

El conjunto de evaluacion congelada cubre 2.048 escenas y 24 semillas de supervivencia (evaluation.json). No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el sistema esta disenado para ejecucion en CPU. Los pesos del tronco ocupan 1,33 MB (core.pt) y el ensemble 382 KB (ensemble_adapted.pt).
- GPU recomendadas: no se requiere GPU. El autor declara explicitamente ejecucion local en CPU de consumo.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU con unos pocos MB libres, aunque no aporta ventaja frente a CPU dado el tamano del modelo.
- Opciones de despliegue: PyTorch (formato de pesos .pt); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El adaptador LoRA requiere el ecosistema de SmolLM2-135M.
- Latencia declarada: ~2,9 ms en modo reactivo, ~5,67 ms en MPC consciente de incertidumbre y ~8,47 ms en MPC de modelo unico, por paso, en CPU de consumo.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos aportados por el autor. La informacion proporcionada no incluye parametros, contexto, rendimiento ni licencia de modelos alternativos, por lo que la comparacion cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Supermix Poseidon & Beyond | ~0,33 M (tronco) + ~150 K (ensemble) | no disponible | MIT | HuggingFace (0 descargas, 0 likes) y GitHub |
| SmolLM2-135M (modelo base del adaptador LoRA) | 135 M | no disponible | no disponible | no disponible en la informacion proporcionada |
| DreamerV3 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| MuZero | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Categorias de referencia con las que se solapa conceptualmente el modelo: modelos de mundo para aprendizaje por refuerzo (Dreamer, IRIS, DIAMOND) y planificadores basados en modelo tipo MuZero. La informacion proporcionada no incluye datos de ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje de proposito general: no genera texto libre ni mantiene conversaciones multi-turno por si mismo; la unica capacidad conversacional citada depende del adaptador LoRA sobre SmolLM2-135M.
- Capacidad parametrica muy reducida (~0,33 M en el tronco): adecuado para entornos de juguete y simulacion, no para tareas de conocimiento abierto.
- Cobertura idiomatica limitada al ingles (en).
- El propio autor documenta la "trampa del pesimismo": con penalizacion de incertidumbre alta (lambda = 1,5) y escasez severa de recursos (scarcity = 4,0), el planificador evita la exploracion y puede fracasar; requiere atenuacion dinamica de la penalizacion.
- El MPC consciente de incertidumbre obtiene una supervivencia del 99,0% (±1,95%) frente al 100,0% de la politica reactiva y del MPC de modelo unico, es decir, no domina a las alternativas en exito, solo en latencia.
- Riesgo de sobreajuste a la distribucion de evaluacion: los resultados de 100 episodios emparejados y 2.048 escenas corresponden a un unico autor, sin replicacion independiente ni revision por pares en la informacion disponible.
- La memoria alterada aleatoriamente rinde por debajo del azar (12% - 16%), lo que indica alta sensibilidad a la corrupcion de los registros episodicos.
- Inconsistencia documental: el repositorio incluye la etiqueta safetensors, pero los checkpoints distribuidos son ficheros .pt de PyTorch; conviene verificar el formato antes de integrarlo.
- Estado de adopcion nulo: 0 descargas y 0 likes en HuggingFace, y tamano de repositorio reportado de 0,0 GB, lo que sugiere ausencia de validacion por la comunidad.
- Las fechas de creacion y actualizacion del repositorio (2026-10-08) son posteriores a la fecha de referencia habitual, dato a verificar por el lector.
- La model card disponible esta truncada en la seccion de memoria de recuerdo diferido, por lo que parte de la evidencia declarada no puede revisarse completa.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de copyright y la licencia. No se declaran restricciones adicionales de uso.
- No se documentan sesgos, comportamiento en dominios fuera de distribucion ni protocolos de evaluacion de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kai9987kai/Supermix-Poseidon
- Repositorio GitHub: https://github.com/kai9987kai/Supermix-Poseidon
- Referencia de calibracion citada: Guo et al. 2017 (escalado de temperatura); no se proporciona enlace directo en la informacion disponible.
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente URL del servicio Outlook (outlook.com, pod51034.outlook.com/owa, ps.outlook.com/Powershell, olmoauth.outlook.com), sin relacion con el modelo.
