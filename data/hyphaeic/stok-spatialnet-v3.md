# hyphaeic/stok-spatialnet-v3

## Resumen

STOK-SpatialNet-v3 es una red neuronal espacial compacta y multi-tarea desarrollada por el usuario hyphaeic para aprendizaje por refuerzo sin recompensa (reward-free RL) y planificacion en juegos de turnos simultaneos. En lugar de regresar una unica funcion de valor escalar, el modelo calcula las cantidades del marco State-Time Option Kernel (STOK) descrito por Ringstrom y Schrater (arXiv:2506.09499): factibilidad de alcanzar un objetivo, urgencia temporal, valencia (cambio firmado en el empowerment del espacio de acciones), supervivencia y una capa de teoria de la mente que predice la intencion del adversario.

Arquitectonicamente es una red muy pequena (23.781 parametros segun los pesos en safetensors) bautizada como `spatial-attn2`, que combina auto-atencion entre celdas de un tablero 2D con cross-attention condicionada por un vector de objetivo relacional, seguida de un tronco denso y 37 cabezales de salida multi-tarea. Su relevancia actual radica en que ejemplifica el paradigma de amortizacion de kernels de opciones para control reactivo sin funcion de recompensa, un enfoque emergente en IA de juegos y en investigacion de RL basada en empowerment.

El modelo no es un modelo de lenguaje: la etiqueta de idioma `en` es nominal y la tarea declarada en el Hub es `tabular-classification`. Su ejecucion solo requiere numpy, sin PyTorch ni runtime de C++, lo que lo hace desplegable en entornos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spatial-attn2`: auto-atencion celda-celda con residual, cross-attention objetivo-consulta, tronco denso (138 -> 96) y 37 cabezales de salida |
| Parametros totales | 23.781 (unos 23,8 mil) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; opera sobre un campo espacial 2D de T celdas x 39 canales (el ejemplo usa 10x10 = 100 celdas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia en float32 sobre numpy) |
| Idiomas soportados | en (etiqueta nominal; el modelo no procesa lenguaje natural) |
| Licencia | Hyphaeic Public License (HPL), declarada como "other" |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red `spatial-attn2` procesa un campo espacial 2D donde cada celda del tablero se representa con 39 canales. Estos canales cubren geometria (coordenadas normalizadas, offsets relativos al observador y al oponente, distancias de Chebyshev), ocupacion y estadisticas (presencia propia, de aliados y de enemigos, HP normalizado), terreno y contenido (substrato, muros, rocas, elementos peligrosos, flags de bloqueo), alcanzabilidad consciente de trayectoria (pasos de llegada por BFS para ambos agentes bajo reglas dinamicas de obstaculos) y anclaje de plan (huellas de movimiento candidato, ataques y alteraciones de terreno).

El flujo de computo es: embedding de 39 a 32 dimensiones con ReLU, auto-atencion celda-celda con conexion residual, cross-attention entre las celdas y un vector de objetivo relacional de 8 dimensiones (one-hot de 5 familias de objetivo mas dx, dz y flag de objetivo), y un tronco denso que concatena el vector de contexto (32), las caracteristicas de alto nivel (80) y el historial de intenciones (18) en una entrada de 138 dimensiones que se proyecta a 96. Sobre esa representacion se aplican 37 cabezales: el cuarteto central (factibilidad, urgencia, valencia firmada, supervivencia), factibilidades de 5 familias de objetivo, histograma ETA de llegada, prior de objetivo del oponente, valencia descompuesta, etiquetado de 8 conceptos tacticos, teoria de la mente del adversario y flujo de empowerment de horizonte largo.

No se ha proporcionado informacion sobre el conjunto de datos de entrenamiento, el numero de tokens o episodios, ni sobre el uso de RLHF, DPO u otras tecnicas de ajuste. La model card tampoco detalla el procedimiento de optimizacion ni las innovaciones de decodificacion mas alla del propio esquema de amortizacion STOK.

## Capacidades

- Prediccion de factibilidad (kappa): probabilidad de alcanzar un objetivo sin violar restricciones.
- Prediccion de urgencia temporal (eta): distribucion del tiempo de llegada expresada como 1 / (1 + E[t_f]).
- Prediccion de valencia (delta E): cambio firmado en el empowerment del espacio de acciones, preservando grados de libertad futuros.
- Prediccion de supervivencia: tasa de derrota adversaria esperada.
- Teoria de la mente: distribuciones softmax sobre el concepto tactico activo del oponente y su familia de objetivo.
- Planificacion en turnos simultaneos con condicionamiento relacional por objetivo.
- Etiquetado de 8 conceptos tacticos anotados por humanos (trap, spacing, punish, bait, coverage, conversion, denial, tempo).
- Prediccion de factibilidad por familia de objetivo (Strike, Engage, Evade, Turtle, Zone).
- Histograma de ETA de llegada (kill@t1, kill@t2, fuera de ventana).
- Valencia descomponible en crecimiento de capacidad propia frente a negacion de la capacidad del oponente.
- Inferencia sin dependencias externas, unicamente con numpy.

## Casos de uso

- IA de agentes en juegos de tablero por turnos simultaneos: el modelo evalua factibilidad, urgencia y supervivencia de cada opcion en una rejilla dada, permitiendo seleccionar acciones sin necesidad de definir una funcion de recompensa manual.
- Planificacion sin recompensa en entornos de simulacion: al amortizar las cantidades STOK, se puede integrar como modulo de evaluacion de opciones dentro de un bucle de control que solo recibe observaciones del estado.
- Modelado del oponente en tiempo real: las cabezas 27-34 estiman el concepto tactico que el adversario esta ejecutando, lo que permite a un agente reaccionar a la intencion predicha y no solo al estado observable.
- Analisis post-partida y anotacion automatica: las cabezas 19-26 etiquetan cada turno con conceptos tacticos, lo que facilita la generacion de informes y la revision de partidas por parte de entrenadores o analistas.
- Sistemas de ayuda tactica para jugadores: dado un estado de tablero y un objetivo, el modelo puede sugerir la familia de objetivo mas factible y el ETA esperado de cada linea de accion.
- Investigacion en RL basado en empowerment: por su tamano reducido y su runtime numpy, sirve como banco de pruebas para estudiar valencia, negacion de opciones y flujo de empowerment a escala de laboratorio.
- Simulacion de adversarios en entornos de entrenamiento: las predicciones de teoria de la mente y de familia de objetivo permiten construir oponentes sinteticos que imitan estilos tacticos etiquetados.
- Control en dispositivos con recursos minimos: al tener 23.781 parametros y funcionar solo con numpy, puede embeberse en sistemas sin aceleracion GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float32: del orden de decenas de kilobytes (23.781 parametros x 4 bytes, aproximadamente 95 KB de pesos, mas activaciones del campo espacial de entrada).
- GPU: no es necesaria; cualquier CPU moderna puede ejecutar la inferencia. Se puede usar GPU por conveniencia, pero no aporta ventaja relevante a este tamano.
- Cabe sobradamente en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650) e incluso en hardware embebido, dado el tamano del modelo.
- Opciones de despliegue: el propio codigo del autor (`modeling_stok.STOKSpatialAmortizer`) ejecutado sobre numpy; no requiere vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el numero de parametros, se espera una latencia muy baja por inferencia en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (amortizadores de kernel STOK o redes espaciales multi-tarea para juegos de turnos simultaneos). No resulta equiparable a modelos de lenguaje ni a redes de valor convencionales de AlphaZero por las diferencias en tarea, entradas y esquema de objetivos, y no se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Alucinacion: las predicciones proceden de cabezales softmax y regresiones; no hay garantia de calibracion fuera de la distribucion de entrenamiento, y no se aportan metricas de fiabilidad.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que pueden existir sesgos derivados de los conceptos tacticos anotados por humanos (trap, spacing, punish, bait, coverage, conversion, denial, tempo).
- Alcance de contexto: el modelo opera sobre un campo espacial de T celdas x 39 canales; no procesa lenguaje natural ni secuencias de texto, y la etiqueta `en` es nominal.
- Licencia: la Hyphaeic Public License (HPL) es una licencia "other"; deben revisarse los terminos completos antes de cualquier uso comercial, ya que no se detallan en la informacion proporcionada.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion externa y de adopcion en produccion.
- Reproducibilidad: no se documentan datos, hiperparametros ni procedimiento de entrenamiento, lo que dificulta reproducir o auditar los resultados.
- Compatibilidad: la inferencia depende del codigo `modeling_stok` del autor; no se declara compatibilidad con ecosistemas estandar como transformers, vLLM o llama.cpp.
- Uso en produccion: sin benchmarks publicados ni evaluaciones independientes, no se recomienda su despliegue en sistemas criticos sin una validacion previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyphaeic/stok-spatialnet-v3
- Paper STOK (Ringstrom y Schrater, 2025): https://arxiv.org/abs/2506.09499
- Licencia Hyphaeic Public License (HPL): https://github.com/Hyphaeic/HPL
