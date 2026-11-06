# KWSMooBang/RACA-pi0-libero-goal-cl

## Resumen

RACA-pi0-libero-goal-cl es una coleccion de checkpoints de ajuste fino secuencial del modelo vision-lenguaje-accion (VLA) π0 sobre las diez tareas del benchmark LIBERO-Goal. Lo desarrolla el usuario KWSMooBang como prueba de concepto (PoC) de aprendizaje continuo, siguiendo el protocolo de Liu et al. 2026 (arXiv 2603.03818), y se publica bajo licencia Apache 2.0. El objetivo no es ofrecer un modelo listo para produccion, sino reproducir y analizar el olvido catastrofico en politicas roboticas y evaluar si el replay de experiencias lo mitiga.

El modelo parte de `lerobot/pi0_base`, un VLA construido sobre PaliGemma (vision SigLIP + LLM) con un experto de accion, y aplica LoRA sobre las capas lineales de atencion y MLP del backbone y del experto de accion, ademas de entrenar por completo las proyecciones de estado, accion y tiempo. El resultado son adaptadores de aproximadamente 0,9 GB en bf16 que se aplican sobre los pesos congelados del modelo base, no un modelo autonomo.

Su relevancia es metodologica: publica siete configuraciones de entrenamiento (secuencial puro, experience replay con distintos tamanos de buffer, multi-tarea conjunto y dos variantes que replican el codigo del articulo de referencia) con curvas de exito por tarea y una metrica de transferencia negativa hacia atras (NBT). Los resultados muestran que el replay al 20% recupera 0,795 de tasa de exito final frente a 0,085 del ajuste secuencial puro, con un NBT de 0,045.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0: PaliGemma (SigLIP + LLM) con experto de accion; LoRA sobre lineales de atencion/MLP y proyecciones de estado/accion/tiempo entrenadas |
| Parametros totales | no disponible (los checkpoints publicados contienen solo parametros entrenables, ~0,9 GB en bf16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea son en ingles en LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, parametros entrenables unicamente; requieren `lerobot/pi0_base` como base) |

## Arquitectura y entrenamiento

π0 es un transformer vision-lenguaje-accion que combina un codificador visual SigLIP, un backbone de lenguaje PaliGemma y un experto de accion que genera trayectorias de acciones continuas. En este PoC se congela el modelo base y se entrena con LoRA (r=16, α=16 en el backbone; r=32, α=32 en el experto de accion), junto con las proyecciones de imagen, estado, accion y tiempo. El optimizador es AdamW (β=0,9/0,95) con lr 2,5e-5, 1.000 pasos de warmup y decaimiento coseno hasta 2,5e-6, weight decay 1e-10, grad clip 1.0, batch 8 y semilla 1000. En las ejecuciones secuenciales el optimizador y el scheduler se reinician en cada tarea; en la conjunta hay un unico schedule de 100.000 pasos.

Los datos proceden de `lerobot/libero` (commit `a1aaacb7`), episodios de LIBERO-Goal, con un split de entrenamiento y sonda definido en `configs/splits/libero_goal.json` (28-45 demos por tarea). Cada ejecucion entrena 10 tareas x 10.000 pasos en una A100 de 80 GB durante unas 26 horas. Las imagenes se alimentan en rango [0, 1]. El replay buffer se muestrea una vez al terminar cada tarea y se mantiene fijo, mezclando muestra actual y replay 1:1 (4+4 en lugar de 8+8 del articulo original). Las variantes A y B replican el codigo de `Continual-VLAs/continual-openpi`: A usa un unico optimizador y schedule para toda la ejecucion; B anade aumentacion de imagen de openpi (recorte aleatorio al 95% con resize, rotacion ±5 grados y color jitter en la camara en tercera persona; solo color jitter en la camara de muneca).

## Capacidades

- Control roboticode manipulación a partir de instrucciones en lenguaje natural e imagenes de camara (tercera persona y muneca), generando acciones continuas.
- Ejecucion de tareas de LIBERO-Goal: abrir cajones, colocar objetos sobre encimera o fogon, encender el fogon, apilar objetos y colocar botellas en estanteria.
- Aprendizaje continuo secuencial con mitigacion de olvido catastrofico mediante experience replay.
- Evaluacion de transferencia negativa hacia atras (NBT) por tarea.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM de proposito general.
- Capacidades multilingues: no disponibles; las instrucciones del benchmark estan en ingles.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre como producto.

## Casos de uso

- Investigacion en aprendizaje continuo: usar los checkpoints por tarea (`taskKK_step010000`) para medir olvido y transferencia con la metrica NBT y comparar estrategias de replay.
- Reproduccion de resultados: replicar las tablas del articulo de Liu et al. 2026 con el mismo dataset y split, verificando las diferencias documentadas (buffer mas pequeno, una semilla, 20 episodios por celda).
- Estudio de schedules de entrenamiento: comparar las variantes A (schedule unico) y B (schedule unico + aumentacion) frente al reinicio por tarea para aislar el efecto del LR y de la aumentacion en el olvido.
- Analisis de representaciones: cargar los adaptadores con `racl.policy` y extraer activaciones para estudiar deriva de representaciones entre tareas.
- Baseline para nuevos metodos de continual learning: el pipeline secuencial y el de replay al 20% sirven como referencias cuantitativas (0,085 y 0,795 de tasa de exito final).
- Docencia y formacion: demostrar en un entorno simulado (LIBERO) el efecto del replay y del ajuste conjunto (0,825) frente al secuencial.
- Prototipado de politicas de manipulacion en simulacion: reutilizar los adaptadores como punto de partida para tareas de LIBERO-Goal antes de transferir a un robot real, siempre con validacion adicional.

## Benchmarks y rendimiento

Evaluacion en el simulador LIBERO-Goal: 20 episodios por par (checkpoint, tarea), estados iniciales fijos 0-19, semilla 7, 300 pasos, render 360x360. Una sola semilla.

| Ejecucion | SR final (10 tareas) | NBT | SR tras aprender cada tarea |
|---|---|---|---|
| `poc-goal-seq-s1000` (secuencial) | 0,085 | 0,883 | 0,880 |
| `poc-goal-er10-s1000` (replay 0,2%) | 0,075 | 0,845 | 0,845 |
| `poc-goal-er100-s1000` (replay 2%) | 0,600 | 0,188 | 0,830 |
| `poc-goal-er1000-s1000` (replay 20%) | 0,795 | 0,045 | 0,840 |
| `poc-goal-paperlr-er10-s1000` (variante A) | 0,055 | 0,762 | 0,755 |
| `poc-goal-paperlr-aug-er10-s1000` (variante B) | 0,145 | 0,668 | 0,765 |
| `poc-goal-joint-s1000` (multi-tarea) | 0,825 | no aplica | no aplica |
| `lerobot/pi0_base` sin ajuste | 0,000 | no aplica | no aplica |

Referencia del articulo (Liu et al. 2026, π0 en LIBERO-Goal): ER 10 SR 0,773 ± 0,036 y NBT 0,536 ± 0,049; ER 100 SR 0,729 ± 0,016 y NBT 0,153 ± 0,039; ER 1000 SR 0,732 ± 0,015 y NBT -0,005 ± 0,010. El NBT de este repositorio promedia tareas 0-8; para comparar con el articulo debe multiplicarse por 0,9 (er10 0,761; er100 0,169; er1000 0,040; A 0,686; B 0,602).

## Requisitos de hardware

- Entrenamiento: 1 GPU A100 de 80 GB por ejecucion, unas 26 horas para 10 tareas x 10.000 pasos con batch 8.
- Inferencia: requiere cargar `lerobot/pi0_base` en bf16 mas el adaptador de ~0,9 GB; no se publican medidas de VRAM del modelo base en la informacion disponible.
- GPU recomendadas: A100 80 GB para entrenamiento; para inferencia se necesita capacidad suficiente para el modelo base completo, no cuantificado en esta publicacion.
- GPU de consumo: no disponible; no se han publicado versiones GGUF ni cuantizadas que permitan ejecucion en RTX 4090 u otras consumer.
- Despliegue: pila LeRobot y el codigo `racl.policy` del repositorio `KWSMooBang/Representation-Analysis-in-Continual-Learning` (rama `exp/a100-seq-train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO-Goal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RACA-pi0-libero-goal-cl (ER 1000) | no disponible (LoRA sobre π0) | no disponible | SR 0,795; NBT 0,045 | Apache 2.0 | Hugging Face, checkpoints de adaptadores |
| `lerobot/pi0_base` | no disponible | no disponible | SR 0,000 sin ajuste en LIBERO-Goal | no disponible en la informacion | Hugging Face |
| Liu et al. 2026, π0 con ER 1000 | no disponible | no disponible | SR 0,732 ± 0,015; NBT -0,005 ± 0,010 | no disponible | Codigo en `Continual-VLAs/continual-openpi` |
| Ajuste conjunto multi-tarea (misma base) | no disponible | no disponible | SR 0,825 | Apache 2.0 | Incluido en este repositorio |

## Limitaciones y advertencias

- Los checkpoints contienen solo parametros entrenables; no son autocontenidos y requieren `lerobot/pi0_base` para funcionar.
- Evaluacion con una sola semilla y 20 episodios por celda, frente a 50 del articulo; la varianza no esta caracterizada.
- El NBT se calcula promediando tareas 0-8, no 0-9; hay que aplicar el factor 0,9 para comparar con la literatura.
- El buffer de replay se extrae del split de entrenamiento (28-45 demos por tarea) y no de las ~50 completas, lo que puede infraestimar el rendimiento del replay.
- Se usan 4+4 muestras actual/replay por paso en lugar de 8+8 del articulo; las diferencias con la referencia pueden deberse a este y otros cambios de configuracion.
- El modelo esta entrenado exclusivamente en simulacion LIBERO-Goal; no hay evidencia de transferencia a robot real ni a otras suites (LIBERO-Object, LIBERO-10, LIBERO-Long).
- Las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un modelo de accion, el fallo se manifiesta como ejecucion incorrecta de la tarea, no como texto erroneo.
- Uso comercial permitido por Apache 2.0, pero la idoneidad para produccion no esta validada; es una prueba de concepto de investigacion.
- El repositorio ocupa 258,3 GB, lo que implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KWSMooBang/RACA-pi0-libero-goal-cl
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Codigo del autor: https://github.com/KWSMooBang/Representation-Analysis-in-Continual-Learning
- Articulo de referencia: https://arxiv.org/abs/2603.03818
- Codigo del articulo: https://github.com/Continual-VLAs/continual-openpi
