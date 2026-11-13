# leminhohoho/hltv-tick-encoder

## Resumen

`hltv-tick-encoder` es un codificador auto-supervisado desarrollado por el usuario de Hugging Face `leminhohoho` que opera directamente sobre el estado bruto por tick de demos de Counter-Strike 2 y CS:GO. A diferencia de los enfoques habituales basados en características agregadas (estadísticas de ronda, K/D, etc.), este modelo consume la secuencia conjunta de los 10 jugadores en cada tick y produce un embedding de 192 dimensiones por jugador y tick, pensado para predecir eventos de corto horizonte como recibir daño, disparar o morir en el siguiente segundo.

El modelo es deliberadamente pequeño: 0,67 millones de parámetros con dimensión latente d=192. La arquitectura combina un MLP por jugador sobre 9 canales, dos capas de atención espacial completa sobre los 10 jugadores y tres convoluciones causales dilatadas sobre el eje temporal. Se entrenó con objetivos auto-supervisados (dirección de vista siguiente, desplazamiento siguiente, flag de vivo siguiente y enmascaramiento del estado de otros jugadores) sobre 364 mapas y aproximadamente 55.000 pasos de datos de tick.

Su relevancia es metodológica más que de producto: el autor publica una evaluación honesta en la que separa la contribución de la codificación conjunta de los 10 jugadores (que aporta la mayor parte de la mejora) de la del preentrenamiento auto-supervisado (que añade entre +0,85 y +3,33 puntos de AUC, con intervalos de confianza que excluyen cero solo en dos de los cuatro objetivos). Es un ejemplo útil de cómo reportar resultados negativos y de ablaciones rigurosas en un modelo de dominio muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP por jugador + 2 capas de atencion espacial completa sobre 10 jugadores + 3 Conv1D causales dilatadas sobre tiempo |
| Parametros totales | 0,67 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal W configurable; datos a 8 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`) con dict que contiene `model` state_dict y `args` |

## Arquitectura y entrenamiento

La entrada es un tensor float32 de forma `[B, W, 10, 9]`, donde `W` es la ventana temporal y cada jugador aporta 9 canales por tick: posición normalizada (`x/32768`, `y/32768`, `z/32768`), orientación codificada como `sin(yaw)`, `cos(yaw)`, `sin(pitch)`, `cos(pitch)`, flag de vivo y bando (0 = CT, 1 = T). La frecuencia de muestreo es de 8 Hz, que el autor identifica explícitamente como el techo de resolución de los datos de origen, no los 64 tick nativos del juego.

El flujo del modelo es: MLP por jugador sobre los 9 canales, dos capas de atención espacial completa que mezclan información entre los 10 jugadores, y tres convoluciones causales dilatadas a lo largo del tiempo. La salida es un vector `z` de anchura 192 por cada par (tick, jugador). El entrenamiento es auto-supervisado con cuatro objetivos: predecir la dirección de vista siguiente como vector unitario, el desplazamiento siguiente, el flag de vivo siguiente y el estado enmascarado de otros jugadores. Se usaron 364 mapas y unas 55.000 etapas de datos brutos de tick. Se publican dos checkpoints (`ck14k.pt` y `ck30k.pt`) que el autor describe como numéricamente equivalentes, ya que la pérdida se aplana a partir de las 10.000 etapas.

## Capacidades

- Extracción de representaciones auto-supervisadas del estado conjunto de 10 jugadores en cada tick de una demo de CS2/CS:GO.
- Predicción de eventos de corto horizonte (1 segundo) mediante una sonda MLP sobre el embedding: recibir daño, disparar, matar o morir, ser visto por el enemigo.
- Codificación conjunta de posiciones y orientaciones de todos los jugadores, lo que aporta la mayor parte de la señal predictiva.
- Enmascaramiento y reconstrucción del estado de otros jugadores (objetivo auto-supervisado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. Es un codificador de dominio específico, no un modelo generativo.

## Casos de uso

- Análisis táctico de demos: generar embeddings por tick y jugador para segmentar rondas y detectar patrones de posicionamiento y orientación, aprovechando que el modelo codifica conjuntamente a los 10 jugadores.
- Detección anticipada de enfrentamientos: usar la sonda sobre `z` para estimar la probabilidad de que un jugador reciba daño o dispare en el siguiente segundo (AUC 0,762 y 0,668 respectivamente), útil en herramientas de análisis post-partido.
- Etiquetado automático de eventos en demos: predecir "mato o muero" (AUC 0,783) y "el enemigo me ve" (AUC 0,761) para enriquecer visores de demos o pipelines de estadísticas avanzadas.
- Investigación en representación de estados multiagente: servir de base para estudiar cuánto aporta la codificación conjunta frente al preentrenamiento auto-supervisado, con protocolo de sonda y evaluación reproducible incluidos (`t2_probe2.py`, `results/*.json`).
- Extracción de características para modelos posteriores: alimentar clasificadores de ronda o de resultado de enfrentamiento con embeddings de 192 dimensiones por tick, siempre que la tarea dependa del estado dentro de la ronda y no de la habilidad estable del jugador.
- Reproducción de experimentos: los ficheros `STAGE2.md`, `STAGE3.md` y `TICKS_STAGE0.md` documentan extracción, validación y evaluación, lo que permite replicar el pipeline sobre nuevos conjuntos de demos.

## Benchmarks y rendimiento

Evaluación con sonda MLP sobre `z` en el último tick observado (o `[z ; hand features]`), sobre 71 partidas no vistas en preentrenamiento ni en ajuste de la sonda (29.284 filas de entrenamiento / 11.121 de test, 3 semillas, bootstrap por conglomerados de 400 réplicas sobre ventanas, bootstrap pareado para deltas). Métrica: AUC.

| Objetivo | Tasa base | Hand features | Encoder con pesos aleatorios + hand | Encoder + hand |
|---|---|---|---|---|
| El enemigo me ve | 1,9% | 0,613 | 0,753 | 0,761 |
| Mato o muero | 1,9% | 0,619 | 0,761 | 0,783 |
| Recibo daño | 2,9% | 0,663 | 0,728 | 0,762 |
| Disparo | 8,8% | 0,607 | 0,653 | 0,668 |

Ablaciones reportadas por el autor:

- La mayor parte de la ganancia sobre las hand features proviene de codificar conjuntamente posiciones y vistas de los 10 jugadores, no del preentrenamiento: la misma arquitectura con pesos aleatorios ya obtiene +12 a +14 puntos de AUC.
- El auto-supervisado añade +0,85 / +2,07 / +3,33 / +1,55 puntos de AUC sobre esa base, y el intervalo de confianza pareado al 95% excluye cero solo para los objetivos "recibo daño" y "disparo".
- Un baseline que aplana la ventana bruta (16/32/48 ticks más hand features) solo alcanza 0,61-0,69 de AUC, por lo que la ganancia no se explica por "más señal bruta".
- Resultado negativo: promediar embeddings por jugador a lo largo de un mapa no mejora el modelo pre-partido de pares de kills (XGBoost de 88 características, 61,1% pairwise). Añadir un perfil causal por jugador del embedding de 64 dimensiones cambió la precisión no empatada en -0,50 pp [-1,02, +0,01] sobre los 17.556 pares con datos de tick disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 0,67 M de parámetros, los pesos en float32 ocupan aproximadamente 2,7 MB; el consumo dominante será el de las activaciones, que dependen del tamaño de lote y de la ventana `W`.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja, y también en CPU para inferencia por lotes.
- Opciones de despliegue: el repositorio solo incluye checkpoints PyTorch y `t1_model.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). El despliegue natural es cargar el `state_dict` con PyTorch y ejecutar el módulo de arquitectura.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no cita alternativas de la misma categoría (codificadores auto-supervisados sobre datos de tick de CS2/CS:GO), y no se han identificado en la información disponible modelos públicos equivalentes con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hltv-tick-encoder | 0,67 M | no disponible | AUC 0,668-0,783 en 4 objetivos (ver tabla) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre 364 mapas de demos, la distribución de mapas, niveles de habilidad y parches del juego puede no ser representativa.
- Riesgo de alucinación: no aplica en el sentido habitual (no es un modelo generativo), pero las predicciones de la sonda son probabilísticas y con tasas base muy bajas (1,9%-8,8%), por lo que falsos positivos pueden dominar en umbrales altos.
- Limitación de resolución: los datos están muestreados a 8 Hz, no a 64 tick; el autor lo señala como techo de la fuente, lo que limita la granularidad temporal de los eventos.
- Limitación de alcance: el embedding captura estado dentro de la ronda, no habilidad estable del jugador entre partidas. El propio autor documenta que no mejora el modelo pre-partido de pares de kills (-0,50 pp de precisión no empatada).
- La ganancia atribuible al auto-supervisado es modesta y solo significativa en dos de los cuatro objetivos; conviene no sobreinterpretar el beneficio del preentrenamiento.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Caveat para producción: el repositorio tiene 0,0 GB y 0 descargas; es un artefacto de investigación sin señales de mantenimiento ni soporte. Los dos checkpoints publicados son numéricamente equivalentes, lo que sugiere que no debe esperarse mejora por entrenar más allá de ~10.000 etapas con esta configuración.
- No se documentan idiomas, cuantizaciones ni formatos alternativos a los checkpoints PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leminhohoho/hltv-tick-encoder
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
