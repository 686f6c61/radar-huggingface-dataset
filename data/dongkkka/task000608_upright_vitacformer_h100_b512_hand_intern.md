# Dongkkka/Task000608_Upright_ViTacFormer_H100_B512_Hand_Intern

## Resumen

ViTacFormer SH5 es una politica robotica de imitacion (imitation learning) entrenada desde cero para la tarea Task000608 "Upright Water Bottle" (botella de agua en posicion vertical) sobre el robot SH5. El paquete, publicado por el usuario Dongkkka en HuggingFace, contiene dos checkpoints de solo inferencia procedentes de la misma ejecucion: `checkpoints/best_validation.pt` (paso 100.000, seleccionado por el menor score compuesto de validacion) y `checkpoints/latest_model.pt` (paso 144.784, pesos exactos extraidos del checkpoint reanudable, sin optimizador ni RNG). El cargador por defecto es `best_validation.pt`.

La arquitectura combina vision y tacto: recibe imagen RGB de una camara de cabezal izquierdo (376x672x3), historial de estado de 6 pasos, historial tactil bruto de 18 pasos (90 taxeles) y una linea base tactil por taxel, y produce acciones absolutas en radianes para un chunk de 100 pasos, ademas de tacto futuro normalizado. La representacion es bilateral: 54-D de estado/accion, 180-D de tacto.

Se trata de un checkpoint de investigacion incompleto y explicito en su advertencia: el entrenamiento se detuvo antes de la fase planificada de tacto predicho a 300k pasos, el tacto derecho no supero la linea base de persistencia y la puerta de liberacion offline combinada fallo (`offline_release_pass=false`). No esta aprobado para despliegue motorizado en SH5. Su relevancia es acotada: es material de investigacion reproducible (incluye `validation_history.json`, `train_config.json` y `artifact_receipt.json`) mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViTacFormer (transformador de vision y tacto para imitacion robotica); estado/accion bilateral de 54-D, tacto de 180-D, tacto futuro de 18, entrada RGB de cabezal izquierdo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (historial de estado de 6 pasos a 30 Hz, historial tactil de 18 pasos, chunk de accion de 100 pasos) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en .pt) |
| Idiomas soportados | en, ko (etiquetas del repositorio; el modelo no genera texto) |
| Licencia | no disponible (el codigo fuente upstream/adaptado se incluye bajo Apache-2.0; no se infiere licencia de dataset ni de checkpoint mas alla de esa) |
| Formato de pesos | PyTorch (.pt): `checkpoints/best_validation.pt` y `checkpoints/latest_model.pt` |

## Arquitectura y entrenamiento

El modelo es un ViTacFormer, una politica de imitacion que fusiona vision (RGB del cabezal izquierdo, sin volteo ni rotacion) con tacto (90 taxeles repartidos en 45 izquierdos y 45 derechos). La interfaz de entrada es estricta y sincronizada: imagen `uint8 [376,672,3]`, estado `float32 [6,54]` con offsets `[-15,-12,-9,-6,-3,0]` a 30 Hz, tacto bruto `float32 [18,90]` con offsets `-17..0` y linea base tactil por taxel `float32 [90]`. La salida es `actions_rad [1,100,54]` en radianes absolutos y `future_tactile_normalized [1,18,180]`; el orden de acciones es brazo izquierdo 7, brazo derecho 7, mano izquierda 20, mano derecha 20. El cargador aplica la normalizacion guardada, la ruta de inferencia de tacto futuro predicho, un prior latente cero, un decodificador de articulaciones acotado y un arranque progresivo (warm-start ramp) de brazos. No es un `AutoModel` de Transformers ni una politica LeRobot estandar, sino un cargador PyTorch propio.

El entrenamiento se realizo desde cero sobre 159 episodios de la tarea Upright con una particion fija de train/held-out registrada en `contracts/split_seed519.json`. Se uso AdamW con learning rate principal de 1e-5 y de backbone de 1e-6, batch de 512 y chunk de accion de 100. El checkpoint de mejor validacion corresponde al paso 100.000; el mas reciente alcanza el paso 144.784. El proceso se interrumpio antes de la fase planificada de tacto predicho a 300.000 pasos, por lo que no se completo el regimen de entrenamiento previsto. No se documentan en la informacion disponible detalles sobre el numero total de tokens, la composicion del dataset ni el uso de RLHF o DPO (categorias, por otra parte, propias de modelos de lenguaje y no de esta politica).

## Capacidades

- Generacion de acciones motoras: produce chunks de 100 pasos de acciones absolutas en radianes para ambos brazos y ambas manos (54 dimensiones).
- Percepcion visual: procesa imagen RGB de 376x672 desde la camara configurada de cabezal izquierdo.
- Percepcion tactil: consume historial tactil bruto de 18 pasos sobre 90 taxeles con calibracion por taxel.
- Prediccion de tacto futuro: estima tacto futuro normalizado de 18 pasos sobre 180 dimensiones.
- Ejecucion de una tarea especifica de manipulacion: colocar una botella de agua en posicion vertical (Task000608).
- Inferencia no actuante: el paquete incluye `verify_package.py` para una prueba de humo sintetica sin actuacion.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; las etiquetas en/ko del repositorio no implican generacion de lenguaje.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni vision generativa.

## Casos de uso

- Reproduccion de investigacion en imitacion viso-tactil: el paquete incluye pesos, historial de validacion y configuracion de entrenamiento, lo que permite replicar el pipeline y comparar variantes de arquitectura ViTacFormer sobre el mismo split (seed 519).
- Analisis de fusion vision-tacto: comparar la contribucion del tacto frente a la vision aislando las entradas tactiles, usando la metrica de persistencia (0.1478078) como referencia para el tacto.
- Evaluacion offline de politicas: ejecutar replay sobre el conjunto held-out con `predict_normalized` para medir L1 de accion y de tacto antes de plantear cualquier prueba fisica.
- Estudio de prediccion de tacto futuro: la salida `future_tactile_normalized [1,18,180]` permite investigar modelos que anticipan contacto, aunque el entrenamiento no alcanzo la fase planificada a 300k pasos.
- Punto de partida para comparativas de checkpoints: los dos puntos de control (paso 100.000 y paso 144.784) permiten estudiar degradacion o saturacion del aprendizaje y la correlacion entre perdida y desempeno real.
- Pruebas de integracion en pipelines de robotica: sirve para validar el contrato de entradas/salidas (formas, offsets y orden de articulaciones) en un stack propio antes de conectar ROS u otro middleware.

No se recomienda ningun caso de uso en robot fisico motorizado: el propio autor indica que el checkpoint no esta aprobado para despliegue en SH5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si se publica son metricas de validacion de la propia tarea:

| Metrica | best_validation.pt (paso 100.000) | latest_model.pt (paso 144.784) | Referencia de persistencia |
|---|---|---|---|
| Action L1 | 0.1743254 | 0.1753915 | no disponible |
| Tactile L1 | 0.1445400 | 0.1450095 | 0.1478078 |
| Ratios izquierdo | 0.9016 / 0.9600 | no disponible | no disponible |
| Ratios derecho | 1.0010 / 1.0009 | no disponible | no disponible |
| Puerta de liberacion offline | `offline_release_pass=false` | no disponible | no disponible |

La comparacion clave es que el tactil del lado derecho no supera la linea base de persistencia (ratios en torno a 1.00), y el release offline combinado fallo. El checkpoint de mejor validacion rinde, por tanto, marginalmente mejor que el mas reciente en action L1 y tactile L1.

## Requisitos de hardware

- El nombre del repositorio indica entrenamiento en H100 con batch 512; no se especifica el numero de GPUs ni el tiempo de entrenamiento.
- VRAM de inferencia: no disponible. El tamano del repositorio completo es de 0,8 GB, lo que sugiere pesos relativamente ligeros sumando ambos checkpoints, pero no se publica el recuento de parametros ni el consumo real.
- GPU recomendadas: no disponible en la informacion. El cargador usa `device="cuda"` por defecto, por lo que se asume una GPU compatible con CUDA; no se enumeran modelos concretos (A100, H100, RTX 4090, etc.).
- Encaje en GPU de consumo: no confirmado. Dado el tamano del repositorio es plausible, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: cargador PyTorch propio mediante `inference_loader.load_run` y `preprocess.prepare_observation`. No es compatible con `AutoModel` de Transformers ni con una politica LeRobot estandar. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible. El autor exige verificar latencia de inferencia, continuidad de comandos, error de seguimiento y comportamiento de parada antes de cualquier despliegue motorizado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoria (politicas viso-tactiles de imitacion para manipulacion bimanual) ni sus parametros, contexto, rendimiento o licencia. El propio paquete no referencia alternativas.

## Limitaciones y advertencias

- Checkpoint de investigacion incompleto: el entrenamiento se detuvo antes de la fase planificada de tacto predicho a 300.000 pasos.
- `offline_release_pass=false`: la puerta de liberacion offline combinada no se supero.
- El tacto del lado derecho no supera la linea base de persistencia, lo que limita la utilidad de esa senal.
- No esta aprobado para despliegue motorizado en SH5 ("not approved for powered SH5 deployment").
- La perdida de entrenamiento no es evidencia de despliegue, segun el propio autor.
- El cargador no implementa publicacion ROS, sincronizacion camara/estado, planificacion temporal, comprobaciones de frescura, rechazo de chunks completos, watchdogs, logica de parada de emergencia ni mapeo de topics especifico del robot.
- Antes de cualquier prueba fisica hay que verificar la revision exacta del SH5, el orden de articulaciones y tactil, la calibracion, el mapeo de camara, la tasa de control, la latencia de inferencia, la continuidad de comandos, el error de seguimiento y el comportamiento de parada; y completar replay offline, modo sombra y ensayos a baja velocidad con operador y parada de emergencia operativa.
- Licencia del modelo y del dataset: no disponible. Solo se declara Apache-2.0 para el codigo fuente upstream/adaptado incluido, sin que ello se extienda a los checkpoints.
- Entradas estrictas: cualquier desviacion en formas, offsets, orden o calibracion (RGB sin volteo ni rotacion, estado a 30 Hz, tactil izquierdo antes que derecho) invalida la inferencia.
- Riesgo de sobreajuste a la particion fija (159 episodios, seed 519) y de generalizacion limitada fuera de la tarea Upright.
- Idiomas en/ko del repositorio no implican capacidades linguisticas; son etiquetas de metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/Dongkkka/Task000608_Upright_ViTacFormer_H100_B512_Hand_Intern
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo. Los resultados devueltos corresponden a productos de tintas acrilicas y no guardan relacion con el modelo.
