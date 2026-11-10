# josyula/adamu-nut-policies

## Resumen

ADAM-U nut pick-and-place policies es una coleccion de checkpoints de politicas de control robotico entrenadas para una unica tarea en simulacion MuJoCo: el brazo derecho de un robot PNDbotics ADAM-U equipado con una pinza paralela i2rt YAM debe coger una tuerca hexagonal de 22 mm tumbada sobre una mesa y dejarla en vertical sobre una almohadilla verde objetivo. El autor (josyula) publica cinco familias de metodos distintos: Diffusion Policy, ACT, DP combinado con DSRL, Touch in the Wild (vision y tactil) y DexScrew (destilacion en tres etapas), con el objetivo de comparar estrategias de imitation learning y reinforcement learning sobre un mismo problema fisico.

El interes del repositorio no reside en un modelo fundacional, sino en la trazabilidad experimental: se evaluan todos los metodos sobre los mismos 50 seeds de validacion (2.000.000 a 2.000.049), con una definicion de exito identica (tuerca a menos de 2 cm del objetivo, inclinacion menor de 15 grados, apoyada en la mesa, sin contacto con la pinza y mantenida durante 10 pasos de control consecutivos dentro de 300 pasos totales). Ademas se comparan condiciones de dominio (ideal, "real stand-in", perturbacion de agarre y fisica desplazada), lo que permite analizar transferencia sim-a-real y robustez.

Los checkpoints son modulos PyTorch personalizados, no modelos `transformers`, y requieren el codigo de simulacion y de cada metodo (disponible en el Space asociado). El repositorio ocupa 4,0 GB y no declara licencia ni idiomas. No se han publicado resultados de benchmarks estandar de NLP; las metricas son tasas de exito en la tarea robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: Diffusion Policy (difusion sobre acciones), ACT (transformer condicionado), DSRL (politica de ruido sobre DP), Touch in the Wild (vision/tactil con MAE visuo-tactil), DexScrew (destilacion en 3 etapas) |
| Parametros totales | No disponible (depende del metodo; tamano de fichero entre 1 MB y 1,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; horizonte de accion definido por cada politica) |
| Tipos de cuantizacion | No disponible; los pesos DP, ACT, DSRL y el MAE se almacenan en fp16 (tensores pequenos en fp32) y se convierten a fp32 al cargar; Touch in the Wild en fp32 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch), `.pth` (PyTorch), `.ckpt` (PyTorch); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa cinco aproximaciones sobre la misma tarea. Diffusion Policy (DP) modela la distribucion de acciones mediante difusion, con checkpoints de 93 MB entrenados en tres regimenes: solo simulacion (300 demos), solo dominio "real stand-in" (10, 50 o 100 demos) y co-entrenamiento con peso alpha 0,25 o 0,5. ACT (89 MB) es un transformer condicionado por observaciones, tambien en variantes sim-only, real-only y co-entrenadas. DSRL anade una politica de ruido (22 MB) que modifica las acciones de una DP base y se afina con 1.500 episodios online en el dominio stand-in.

Touch in the Wild incorpora percepcion tactil: una variante solo vision (`dp_vision.pt`), una con camara y tacto mediante SimpleCNN (`dp_tactile_cnn.pt`) y otra con un autoencoder visuo-tactil MAE preentrenado (`dp_tactile_mae.pt`, MAE de 185 MB). DexScrew sigue un esquema de destilacion en tres etapas: un teacher (1 MB) entrenado por imitacion de un experto scriptado con fisica aleatorizada, un student destilado y un fine-tune con behavior cloning sobre exitos en fisica desplazada. Los datos de entrenamiento son demostraciones de simulacion (300) y demostraciones "teleoperadas" en el dominio stand-in (10, 50 o 100), multimodales y a velocidad variable.

## Capacidades

- Control robotico de pick-and-place de precision sobre una tuerca hexagonal de 22 mm con pinza paralela.
- Percepcion visual desde camara de muneca y camara de cabeza (en las variantes correspondientes).
- Percepcion tactil en las variantes Touch in the Wild con FlexiTac.
- Recuperacion ante fallos de agarre: la variante tactil y DexScrew detectan el fallo del primer cierre y reabren la pinza para reintentar (condicion "Bump").
- Generalizacion a fisica desplazada (masa de tuerca, friccion, ganancias del brazo y latencia) en DexScrew etapa 3.
- Co-entrenamiento sim + real stand-in para mejorar la transferencia.
- Aprendizaje por refuerzo online (DSRL) sobre una politica de imitacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en imitation learning: comparar DP, ACT y DSRL sobre una tarea identica y seeds fijos permite aislar el efecto de cada algoritmo sin variabilidad de entorno.
- Estudio de transferencia sim-a-real: el dominio "real stand-in" (latencia de 150 ms, calibracion desviada 2 cm / 2 grados, ruido, friccion distinta) sirve como banco de pruebas controlado antes de desplegar en el robot fisico.
- Evaluacion de co-entrenamiento: los checkpoints `co_r10_a05`, `co_r10_a025` y `co_r50_a05` permiten medir cuanto aportan 10 o 50 demos reales frente a 300 de simulacion.
- Investigacion en percepcion tactil: los modelos `dp_tactile_cnn` y `dp_tactile_mae` permiten estudiar si el tacto mejora la robustez ante perturbaciones de agarre (58% en Bump con MAE frente a 32% con CNN).
- Aprendizaje por refuerzo con recompensa escasa: DSRL demuestra como 1.500 episodios online elevan una DP co-entrenada del 64% al 72% en el stand-in.
- Destilacion y curriculum: DexScrew ilustra un pipeline teacher (100% ideal) -> student (80%) -> fine-tune con BC sobre exitos en fisica desplazada (58% en fisica desplazada).
- Docencia y reproduccion: el Space `josyula/adamu-nut-eval` permite visualizar episodios interactivos sin montar el entorno localmente.

## Benchmarks y rendimiento

Tasa de exito sobre 50 seeds de validacion (2.000.000 a 2.000.049), con intervalo de confianza del 95% de aproximadamente mas o menos 12 puntos.

| Metodo / modelo | Entrenado en | Ideal | Real stand-in | Bump | Fisica desplazada |
|---|---|---|---|---|---|
| DP sim only (`dp/sim_only.pt`) | 300 sim | 80% | 2% | - | - |
| DP real only (`dp/real_r100.pt`) | 100 real | 0% | 74% | - | - |
| DP real only (`real_r50.pt` / `real_r10.pt`) | 50 / 10 real | 0% / 0% | 44% / 8% | - | - |
| DP co-trained (`co_r50_a05.pt`) | 300 sim + 50 real, alpha 0,5 | 64% | 74% | - | - |
| DP co-trained (`co_r10_a05.pt` / `co_r10_a025.pt`) | 300 sim + 10 real | 34% / 44% | 12% / 18% | - | - |
| ACT sim only / real only | 300 sim / 50 real | 14% / 14% | 8% / 26% | - | - |
| ACT co-trained (`co_r10_a05` / `co_r50_a05`) | 300 sim + 10 / 50 real | 14% / 18% | 10% / 42% | - | - |
| DP + DSRL (`dsrl_co_r50`) | DP co-trained + 1.500 online | 72% | 64% | - | - |
| DP + DSRL (`dsrl_real_r50`) | DP real-only + 1.500 online | 0% | 40% | - | - |
| Touch in the Wild, solo vision (`dp_vision.pt`) | 300 sim | 76% | - | 58% | - |
| Touch in the Wild, camara + tacto CNN (`dp_tactile_cnn.pt`) | 300 sim | 66% | - | 32% | - |
| Touch in the Wild, camara + tacto MAE (`dp_tactile_mae.pt`) | 300 sim + MAE | 66% | - | 58% | - |
| DexScrew teacher (`ds/teacher.pth`) | imitacion experto scriptado | 100% | - | 100% | 18% |
| DexScrew student (`ds/student.ckpt`) | destilado del teacher | 80% | - | 0% | 20% |
| DexScrew fine-tune (`ds/stage3_ft.ckpt`) | student + BC en fisica desplazada | 50% | - | 0% | 58% |

Verificacion de los ficheros publicados (50 seeds, condicion ideal): DP sim_only pasa de 40 a 38 exitos; co_r10_a025 de 22 a 23; co_r10_a05 de 17 a 17; co_r50_a05 de 32 a 30; ACT sim_only 7 a 7; real_r50 7 a 6; co_r10_a05 7 a 7; co_r50_a05 9 a 9; DSRL co_r50 36 a 34; Touch in the Wild vision 38 a 35, CNN 33 a 32, MAE 33 a 34; DexScrew teacher 50 a 50, student 40 a 40, stage3_ft 25 a 25. Las diferencias en DP/ACT/DSRL provienen del almacenamiento en fp16; en Touch in the Wild el evaluador no fija la semilla de difusion.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; los checkpoints individuales ocupan entre 1 MB (DexScrew) y 1,2 GB (Touch in the Wild), por lo que la inferencia cabe en GPUs consumer, pero el coste dominante es el renderizado y la fisica de MuJoCo.
- GPU recomendadas: no disponible; al ser politicas pequenas de control, cualquier GPU con soporte CUDA suficiente para MuJoCo deberia servir, aunque no se especifica en la informacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de los pesos (maximo 1,2 GB), pero no se documenta.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere PyTorch y el codigo de simulacion y de cada metodo (disponible en el Space `josyula/adamu-nut-eval`).
- Latencia y throughput: no disponibles; se menciona una latencia de 150 ms simulada en el dominio stand-in, pero es una condicion de entrenamiento, no una medida de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADAM-U nut policies (este) | No disponible (1 MB - 1,2 GB por checkpoint) | No aplica | 80% ideal DP sim-only; 74% stand-in DP co-trained; 100% DexScrew teacher | No disponible | Hugging Face + Space |
| Diffusion Policy (referencia original) | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion |
| ACT (referencia original) | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion |
| DexScrew (referencia original) | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion |

No se dispone de datos comparativos de otros modelos en la informacion proporcionada; la comparativa interna entre metodos esta en la seccion de benchmarks.

## Limitaciones y advertencias

- Tarea unica: solo resuelve pick-and-place de una tuerca hexagonal de 22 mm con un robot y pinza concretos; no es generalizable a otras tareas sin reentrenamiento.
- Entrenamiento en simulacion: los resultados en el dominio "real stand-in" no equivalen a validacion en el robot fisico; el autor no reporta despliegue real.
- Intervalo de confianza amplio: con 50 episodios el margen es de aproximadamente mas o menos 12 puntos, por lo que diferencias pequenas entre metodos no son significativas.
- Degradacion por fp16: la verificacion de los ficheros publicados muestra diferencias de hasta 2 exitos sobre 50 respecto al entrenamiento original en DP, ACT y DSRL.
- Touch in the Wild no fija la semilla de difusion en la evaluacion, por lo que repetir el mismo checkpoint produce variacion.
- Los grupos de politicas con camara y con tacto usan pinzas distintas (estandar vs FlexiTac); las comparaciones solo son validas dentro de cada grupo.
- Celdas en blanco en la tabla de resultados indican condiciones no evaluadas, no fallos.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin soporte de `transformers`: requiere el codigo y el entorno de simulacion, lo que limita su integracion en pipelines estandar.
- Riesgo de sobreajuste al dominio de entrenamiento: DP real-only obtiene 0% en ideal y DP sim-only 2% en stand-in, mostrando una brecha de dominio severa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josyula/adamu-nut-policies
- Space de evaluacion interactiva: https://huggingface.co/spaces/josyula/adamu-nut-eval
