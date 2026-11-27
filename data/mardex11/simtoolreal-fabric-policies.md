# mardex11/simtoolreal-fabric-policies

## Resumen

`mardex11/simtoolreal-fabric-policies` es una coleccion de politicas de aprendizaje por refuerzo (RL) para manipulacion diestra con herramientas, entrenadas sobre el entorno SimToolReal con un brazo UR5 y una mano Tesollo DG5F-S derecha. No es un modelo de lenguaje ni un modelo fundacional generativo: son checkpoints de control motor (LSTM entrenados con SAPG sobre `rl_games`) que resuelven la tarea de agarre, elevacion y transporte de una herramienta a traves de una cadena de poses objetivo de 6 grados de libertad.

La particularidad tecnica es que todas las politicas actuan a traves de una "geometric fabric", un mecanismo de control que restringe las acciones a un subespacio geometricamente estructurado, con el objetivo de producir agarres mas humanos que la politica de modo articular clasica. Se exploran dos variantes: una en espacio articular de 26 dimensiones con un prior de sinergia (fijo o adaptativo) y otra en espacio de pose + sinergia de 11 dimensiones al estilo DextrAH-G.

Es relevante ahora porque documenta de forma inusualmente transparente resultados negativos y parciales: el mejor checkpoint de tarea completa (E4a) alcanza 1,61 objetivos por episodio a 7,5 cm frente a 7,0 de la referencia de modo articular tras 311k epocas, con solo ~10k epocas de entrenamiento. Todo el trabajo es exclusivamente en simulacion: nada se ha ejecutado en el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica RL con red LSTM entrenada mediante SAPG sobre `rl_games`; control a traves de geometric fabric |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` de PyTorch) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch, checkpoints de `rl_games`) |
| Entorno de entrenamiento | `Isaacsimenvs-SimToolReal-Tesollo-v1` (UR5 derecho + Tesollo DG5F-S) |
| Espacio de accion | 26-D articular (variante cspace) u 11-D pose + sinergia (variante pose_synergy) |
| Entornos paralelos | 4.096 durante entrenamiento; 512 en evaluacion |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

Las politicas son redes LSTM entrenadas con el algoritmo SAPG implementado en `rl_games`, con un tamano de bloque SAPG de 1.024 y 4 bloques (el player incluido en el repo fija 6 bloques, por lo que requiere remapeo previo a la reproduccion con `scripts/vast/remap_sapg_blocks.py`). El entrenamiento se realiza con 4.096 entornos paralelos en Isaac Lab sobre el entorno SimToolReal, que empareja un UR5 derecho con una mano Tesollo DG5F-S en la posicion de laboratorio.

La innovacion central es la "geometric fabric": en lugar de emitir acciones articulares libres, la politica opera a traves de una fabrica geometrica con amortiguamiento 10, objetivo de energia 1 y objetivo de velocidad 1, sin dominio de aleatorizacion (ADR), y con una correa de estado de 0,05 en el brazo y 0,3 en la mano. La variante `cspace_synergy_prior` anade un prior de sinergia (masa 16, agudeza 10, rampa de liberacion de 30 pasos, criterio de "sujeto" a 3 cm sobre la mesa) que puede ser fijo (C1) o liberarse una vez agarrada la herramienta (C2). La variante `pose_synergy` usa una accion de 11 dimensiones: pose absoluta de palma (6) mas 5 sinergias de la DG5F, con EMA de accion de 0,15. Los runs principales se entrenaron desde cero durante 6.250 epocas con resets de fase uniformes; las variantes E3 y E4a continuaron con arranques sesgados hacia la aproximacion hasta 9.000 y 10.890 epocas respectivamente.

## Capacidades

- Agarre, elevacion y transporte de una herramienta a lo largo de una cadena de poses objetivo de 6 grados de libertad en simulacion.
- Control diestro de una mano de 5 dedos (Tesollo DG5F-S) sobre un brazo UR5.
- Generacion de agarres con oposicion pulgar-indice/medio: 0,54 de los pasos con herramienta sujeta en C1 frente a 0,08 de la referencia de modo articular.
- Distribucion de fuerza de agarre hacia indice y medio: 0,41 en C1 frente a 0,02 en la referencia.
- Dos espacios de accion alternativos (articular con sinergia y pose + sinergia) que permiten comparar estilos de control.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues, vision ni audio: es una politica de control motor.

## Casos de uso

- Investigacion en manipulacion diestra: sirve como punto de partida reproducible para estudiar como un prior de sinergia afecta a la retencion del agarre, comparando C0 (sin prior), C1 (prior fijo) y C2 (prior liberado tras el agarre) con el mismo presupuesto de entrenamiento.
- Estudio de estilos de agarre humanoides: la metrica de oposicion pulgar-dedo y el reparto de fuerza permiten cuantificar si una politica se aleja del "wedge" pulgar-menique de las politicas de modo articular.
- Benchmark de mecanismos de control estructurado: la geometric fabric con correa de estado y limites de velocidad sirve para evaluar si restringir el espacio de acciones mejora la estabilidad frente a acciones articulares libres.
- Prototipado de tareas de uso de herramientas en Isaac Lab: los scripts de evaluacion (`eval_goal.sh`, `video.sh`) permiten generar videos y metricas de objetivos alcanzados por fase de arranque.
- Base para experimentos de sim2real: los checkpoints y la documentacion de brechas (velocidad de brazo 1,0 rad/s en simulacion frente a 0,3 en el robot real, latencia de accion no modelada) sirven para planificar el trabajo de transferencia.
- Docencia y reproduccion: el repo incluye los documentos de diseno en `docs/` y resultados crudos en `eval/`, lo que facilita reproducir las tablas publicadas.

## Benchmarks y rendimiento

Objetivos alcanzados por episodio a 7,5 cm de tolerancia, 512 entornos x 2.400 pasos, politica determinista:

| Arranque | C1 prior fijo | C2 prior adaptativo | C0 sin prior | pose + sinergia (E2a) | modo articular (E2b) |
|---|---|---|---|---|---|
| Cerca del objetivo | 5,43 | 3,70 | 2,00 | 3,81 | 1,52 |
| Herramienta agarrada | 3,47 | 1,74 | 0,50 | 1,61 | 0,24 |
| Cerca del objeto | 0,59 | 0,31 | 0,12 | 0,45 | 0,11 |
| Tarea completa (aproximacion) | 0,019 | 0,002 | 0,005 | 0,007 | 0,008 |

Estilo de agarre desde arranques con herramienta agarrada:

| Metrica | C1 | C2 | C0 | best_1119 (referencia modo articular) |
|---|---|---|---|---|
| Pulgar opone a indice/medio (fraccion de pasos con herramienta sujeta) | 0,54 | 0,49 | 0,50 | 0,08 |
| Indice + medio sobre fuerza de agarre | 0,41 | 0,47 | 0,39 | 0,02 |
| Caidas por objetivo alcanzado | 0,5 | 4,1 | 23 | 0,36 |

Tarea completa con la fabric de pose + sinergia: E4a alcanza 1,61 objetivos por episodio a 7,5 cm y 0,12 a 3 cm, con elevacion de la herramienta en el 83 % de los intentos; E3 alcanza 0,68 y 0,028. La referencia de modo articular best_1119 (no incluida en este repo) alcanza 7,0 y 3,95 tras 311k epocas, frente a las ~10k epocas de los runs con fabric.

## Requisitos de hardware

- GPU con soporte CUDA para Isaac Lab e Isaac Sim; no se especifica VRAM concreta en la informacion disponible.
- Entrenamiento realizado con 4.096 entornos paralelos; la evaluacion usa 512 entornos x 2.400 pasos, lo que exige una GPU de gama alta (A100/H100 o similar) para reproducir los tiempos publicados.
- El autor menciona liberar la GPU para pausar el run C1x en la epoca 6.760, lo que sugiere que el entrenamiento ocupa una GPU dedicada de forma sostenida.
- No cabe en GPU de consumo para entrenamiento a esa escala de paralelismo; la inferencia de una sola politica LSTM es ligera, pero requiere el simulador Isaac Sim/Isaac Lab como entorno de ejecucion.
- Despliegue: `rl_games` como player, con remapeo previo de bloques SAPG (`scripts/vast/remap_sapg_blocks.py <ckpt> <out> --blocks 6`); scripts de evaluacion `scripts/fabric_synergy/eval_goal.sh` y `scripts/fabric_synergy/video.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Espacio de accion | Objetivos/episodio (7,5 cm, tarea completa) | Epocas | Licencia |
|---|---|---|---|---|---|
| E4a (este repo, pose + sinergia) | RL LSTM + fabric | 11-D pose + sinergia | 1,61 | 10.890 | no disponible |
| E3 (este repo, pose + sinergia) | RL LSTM + fabric | 11-D pose + sinergia | 0,68 | 9.000 | no disponible |
| C1 (este repo, cspace + prior fijo) | RL LSTM + fabric | 26-D articular + prior | 0,019 | 6.250 | no disponible |
| best_1119 (referencia modo articular) | RL LSTM | articular | 7,0 | 311.000 | no disponible |

No se dispone de comparacion con otras familias de politicas de manipulacion diestra (por ejemplo, DextrAH-G o ADEPT) mas alla de las referencias estilisticas citadas en la model card; no disponible.

## Limitaciones y advertencias

- Solo simulacion: ninguna politica se ha ejecutado en el robot real.
- Brecha sim2real documentada: velocidad de brazo de 1,0 rad/s en simulacion frente al limite real de 0,3 rad/s; la aleatorizacion de latencia de accion es mas estrecha que la latencia real medida; la fabric no esta conectada al nodo de despliegue.
- Rendimiento de tarea completa muy inferior a la referencia de modo articular (1,61 frente a 7,0 objetivos por episodio), aunque con ~30 veces menos epocas.
- C1x (C1 con arranques sesgados a la aproximacion) esta pausado en la epoca 6.760 y no evaluado.
- La liberacion del prior tras el agarre (C2) produce mas rotacion de la herramienta respecto a la palma pero menos objetivos; parte de esa rotacion es deslizamiento, por lo que no se demuestra rotacion en la mano dirigida por los dedos.
- El player incluido fija 6 bloques SAPG mientras el entrenamiento uso 4; es obligatorio remapear antes de reproducir o los resultados no coinciden.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Sin datos de sesgo, alucinacion o cobertura idiomatica por no ser un modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mardex11/simtoolreal-fabric-policies
- Codigo (repositorio SimToolReal-mars): https://github.com/purdue-mars/SimToolReal-mars
- Rama con fabric articular y prior de sinergia: `pg/cspace-synergy-prior` (directorio `cspace_synergy_prior/`)
- Rama con resets de fase y fabric de pose + sinergia: `pg/omnireset-phases` (directorio `pose_synergy/`)
