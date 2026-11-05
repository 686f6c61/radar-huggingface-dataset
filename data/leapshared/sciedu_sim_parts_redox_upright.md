# leapshared/sciedu_sim_parts_redox_upright

## Resumen

`sciedu_sim_parts_redox_upright` es un actor residual de pequeno tamano entrenado con aprendizaje por refuerzo para una unica tarea de robotica manipulativa: colocar vertical una placa metalica suspendida antes de introducirla en un vaso de precipitados, dentro del experimento de oxidacion-reduccion del entorno SciEdu de OpenArm. Lo publica el usuario `leapshared` en Hugging Face con licencia Apache 2.0 y pipeline `reinforcement-learning`. No es un modelo de lenguaje: es una politica neuronal que produce incrementos de orientacion de la muneca (dos ejes, ±5 grados) sobre una regla de control codificada a mano.

El modelo se apoya en una regla base congelada ("levantar sin mirar": asumir que la placa cuelga siempre con el mismo angulo y girar la mano a 10 grados por segundo alrededor del extremo inferior de la placa). El actor residual aprende unicamente la correccion de inclinacion en los ejes x e y del mundo, lo que lo convierte en una adaptacion del enfoque de RL residual con cuello de botella descrito en PARTS (Su et al., arXiv 2609.21788). Se entrena en simulacion con MuJoCo, escena `props-4` de la bancada 2.

La relevancia es metodologica mas que de producto: demuestra que una correccion residual de muy baja dimension sobre una regla interpretable mejora de forma medible una subtarea robotica concreta en simulacion, y cuantifica con intervalos de confianza de Wilson la brecha entre observaciones privilegiadas de simulacion (`sim_*`) y observaciones proprioceptivas trasladables a un robot real (`proprio_*`). El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (3 capas lineales: indices 0, 2 y 4 del state dict) con activacion ReLU en las dos primeras y `tanh` escalado en la salida; politica residual sobre una regla de control codificada |
| Parametros totales | no disponible (el repositorio no declara el recuento; la salida es de 2 dimensiones limitadas a ±5 grados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion es un vector de `cfg["obs_dim"]` flotantes por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors con precision nativa; el ejemplo de uso carga con `safetensors.numpy` en float64) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`actor.safetensors` por variante) mas `config.json`, `log.jsonl` y `eval.jsonl` por variante |

## Arquitectura y entrenamiento

La politica es un actor residual de baja dimension sobre una regla base congelada. La regla base implementa la estrategia "levantar sin mirar": supone que la placa cuelga siempre con el mismo angulo y rota la mano a 10 grados por segundo tomando como eje el extremo inferior de la placa. El actor anade correcciones de inclinacion de la mano derecha en dos ejes (rotacion alrededor de x e y del mundo, con el extremo inferior de la placa como eje), limitadas a ±5 grados por eje. La salida se aplica como delta sobre el objetivo de la punta del efector final. El entrenamiento sigue el esquema de RL residual con cuello de botella de PARTS (Su et al., arXiv 2609.21788), trasladado a esta unica etapa del experimento.

El algoritmo es TD3 con behavior cloning (BC) por chunks, con un 50 por ciento de dropout de referencia, un coeficiente beta del lado de la referencia, imitacion de las placas exitosas y valor cero para las fallidas. Cada 50 episodios se reentrena con ponderacion por exito; los primeros 20 episodios usan solo la regla base. La recompensa es dispersa 1/0 segun el juicio de la escena. No se emplearon datos de robot real ni de hardware fisico. Las variantes `sim_*` leen la orientacion de la placa en simulacion (ejes largo de la placa en x e y del mundo) como observacion; las variantes `proprio_*` leen solo magnitudes disponibles en servicio real: 7 articulaciones del brazo derecho, 7 de comando previo menos lectura, 3 de rotacion heredada de la base, 2 del residual actual y 1 de tiempo de etapa.

## Capacidades

- Generacion de comandos de orientacion de muneca: produce dos incrementos angulares (grados sobre x e y del mundo) limitados a ±5 grados, que se suman al objetivo de la punta del efector final.
- Correccion residual sobre una regla interpretable: no reemplaza la regla base, la ajusta; la regla sigue siendo inspeccionable y el residual es de baja dimension.
- Percepcion de estado de la placa en simulacion: las variantes `sim_*` consumen la orientacion de la placa (ejes largo en x e y del mundo) como parte de la observacion.
- Operacion solo con propriocepcion: las variantes `proprio_*` funcionan con senales obtenidas tambien en servicio real (articulaciones, comandos, residual, tiempo de etapa), sin sensores de orientacion de la placa.
- Control a 30 Hz: el bucle de simulacion se ejecuta a 30 ticks por segundo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues; es una politica de control de una sola tarea.

## Casos de uso

- Investigacion en RL residual: usar el actor como referencia reproducible para estudiar como una correccion de 2 dimensiones sobre una regla codificada mejora una subtarea de manipulacion, con curvas de aprendizaje y evaluaciones registradas en `log.jsonl` y `eval.jsonl`.
- Benchmark de observaciones privilegiadas frente a proprioceptivas: comparar las variantes `sim_*` (54/60 exitos agregados) y `proprio_*` (18/60) para cuantificar la perdida de rendimiento al eliminar sensores no disponibles en el robot real.
- Prototipado de habilidades de ensamblaje y vertido en simulacion: integrar el actor en la escena MuJoCo `props-4` de la bancada 2 para encadenar la subtarea de verticalizacion con las etapas posteriores del experimento de oxidacion-reduccion.
- Docencia y divulgacion de robotica: el par regla base mas residual de 2 grados de libertad es un ejemplo didactico compacto de TD3 con BC, recompensa dispersa y evaluacion con intervalos de Wilson.
- Validacion de pipelines de entrenamiento: el codigo de referencia (`code/parts_upright.py`, `code/upright_bench.py`, `code/accepted.json`, `code/taught.json`) permite reproducir el juicio de exito (placa a 2 grados, agarre, extremo inferior a 2 cm y por encima del borde, regla del vaso, parada del brazo de 0.5 s con techo de 6 s).
- Estudio de sim-to-real en laboratorio: servir como linea base antes de abordar el traslado a hardware, sabiendo que requiere revision de seguridad del robot real y un sistema de percepcion que mida el eje de la placa, hoy inexistente.
- Analisis de coste computacional: los registros permiten estimar el coste de entrenamiento en CPU (por ejemplo, 23.2 minutos de reloj con dos hilos y 142.711 ticks para `proprio_s0` con 820 episodios).

## Benchmarks y rendimiento

Evaluacion sobre 20 arranques de evaluacion (10 iniciales de cada fichero de arranque `redox_dip` y `redox_put_left`), con 20 episodios con residual desactivado y 20 con residual activado. El juicio exige placa a 2 grados en el eje largo, agarre, extremo inferior a 2 cm y por encima del borde, regla del vaso y parada del brazo de 0.5 s (techo de 6 s). Los corchetes indican intervalo de confianza de Wilson al 95 por ciento en porcentaje.

| Variante | Residual off (regla base) | Residual on | Episodios de entrenamiento | Ticks de simulacion (30 Hz) | Minutos de reloj (CPU, 2 hilos) |
|---|---|---|---|---|---|
| `proprio_s0` | 2/20 [3, 30] | 3/20 [5, 36] | 820 | 142.711 | 23.2 |
| `proprio_s1` | 2/20 [3, 30] | 7/20 [18, 57] | 420 | 72.893 | 11.4 |
| `proprio_s2` | 2/20 [3, 30] | 8/20 [22, 61] | 420 | 72.852 | 12.0 |
| `sim_s0` | 2/20 [3, 30] | 19/20 [76, 99] | 820 | 129.589 | 20.7 |
| `sim_s1` | 2/20 [3, 30] | 19/20 [76, 99] | 820 | 132.095 | 20.9 |
| `sim_s2` | 2/20 [3, 30] | 16/20 [58, 92] | 820 | 128.786 | 19.7 |

Agregados por semilla: `sim` con residual activado 54/60 [80, 95] (19, 19 y 16 sobre 20 por semilla); `proprio` con residual activado 18/60 [20, 43] (3, 7 y 8 sobre 20 por semilla). Las semillas 1 y 2 de la red que solo ve articulaciones se redujeron a 400 episodios mas 20 porque la curva de la semilla 0 con 800 episodios permanecia plana en 2 a 5 sobre 20 tras 400. La variante `sim_s0_400ep` es la misma semilla 0 detenida en 400 episodios y coincide con la curva de 800 episodios hasta el episodio 420 (reproducibilidad determinista verificada). Referencias de la misma tarea con la regla base: "levantar sin mirar" 2/20 [3, 30], "mirar la placa una vez" 11/20 [34, 74] y "mirar la placa y corregir" 20/20 [84, 100]; las dos ultimas leen la orientacion de la placa en simulacion y actuan como techo superior.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el ejemplo oficial carga los pesos con NumPy en CPU, por lo que no requiere GPU.
- GPU recomendadas: no aplica para inferencia del actor; el entrenamiento documentado se ejecuto en CPU con dos hilos (entre 11.4 y 23.2 minutos por variante).
- Cabe en cualquier GPU consumer y en CPU: el coste dominante es la simulacion MuJoCo, no la red.
- Opciones de despliegue: carga directa con `huggingface_hub` y `safetensors.numpy` (ejemplo del autor); el bucle de control debe integrarse en el simulador MuJoCo con la escena `props-4` de la bancada 2. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 30 Hz en simulacion; el coste medido se expresa en ticks y minutos de CPU por variante (ver tabla de benchmarks). No se publican cifras de latencia en hardware real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sciedu_sim_parts_redox_upright` (`sim_*`) | Actor residual TD3+BC sobre regla codificada | no disponible (salida de 2 dimensiones) | no aplica | 54/60 [80, 95] con residual; 2/20 con regla base | Apache 2.0 | Hugging Face, repo de 0.0 GB |
| `sciedu_sim_parts_redox_upright` (`proprio_*`) | Igual, solo propriocepcion | no disponible | no aplica | 18/60 [20, 43] con residual | Apache 2.0 | Hugging Face |
| Regla base "levantar sin mirar" | Regla de control codificada | 0 | no aplica | 2/20 [3, 30] | no disponible | Incluida en el repositorio (`code/`) |
| Regla "mirar la placa y corregir" | Regla con orientacion privilegiada de simulacion | 0 | no aplica | 20/20 [84, 100] | no disponible | Incluida en el repositorio (`code/`) |

No se dispone de otros modelos publicos comparables de la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en simulacion (MuJoCo, escena `props-4`); la orientacion de la placa en `sim_*`, la forma en que la placa cuelga y se desliza en la mano y el modelo del seguidor pueden diferir del hardware real.
- Las variantes `sim_*` no son trasladables directamente al robot real: el hardware no dispone de sensor de orientacion de la placa.
- Las variantes `proprio_*`, trasladables en principio, rinden muy por debajo: 18/60 [20, 43] frente a 54/60 [80, 95] de las privilegiadas.
- La base es una regla codificada; no existe aun una variante sobre la base de servicio real (pi0.5).
- Para uso fisico se requiere antes una revision de seguridad del robot y un sistema de percepcion que mida el eje de la placa.
- El rendimiento absoluto es bajo en el mejor caso (19/20 por semilla en simulacion con observacion privilegiada); no es adecuado como componente de produccion sin validacion adicional.
- Riesgo de sobreajuste a los 20 arranques de evaluacion y a las semillas documentadas; las curvas de `proprio` se mantuvieron planas en 2 a 5 sobre 20 durante cientos de episodios.
- No se documentan sesgos sociales ni de lenguaje por no procesar texto; el riesgo relevante es el de generalizacion fisica.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; el autor no ofrece ninguna garantia de idoneidad para uso fisico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_sim_parts_redox_upright
- Paper de referencia PARTS (Su et al.): arXiv 2609.21788
- Codigo de la tarea en el repositorio: `code/parts_upright.py`, `code/upright_bench.py`, `code/accepted.json`, `code/taught.json`
- Scripts de simulacion: `scripts/sim/`, commit 7b190796
- Registros de entrenamiento y evaluacion por variante: `log.jsonl`, `eval.jsonl`
