# dddddsds31341/RLinf-RECAP-Franka-Insert-Tube-CFG-Signed-Drop30-20261114-Step-2000

## Resumen

RLinf-RECAP-Franka-Insert-Tube-CFG-Signed-Drop30-20261114-Step-2000 es un checkpoint de politica robotica entrenado mediante aprendizaje por refuerzo offline (offline policy improvement) sobre el modelo base Franka-Insert-Tube-pi05-step-20000. Lo publica el usuario dddddsds31341 dentro del ecosistema RLinf, una libreria orientada al entrenamiento con RL de politicas roboticas. El modelo resuelve la tarea concreta de insertar un tubo (insert-tube) con un brazo robot Franka, partiendo de una politica pi05 preentrenada y aplicando una receta RECAP con condicionamiento CFG (classifier-free guidance) sobre la ventaja estimada.

El checkpoint corresponde al paso global 2000 de un proceso de mejora offline con 2000 actualizaciones, batch efectivo de 32 y una tasa de aprendizaje de 1e-05. Utiliza camaras externa y de muneca, un vector de estado bruto de 19 dimensiones y acciones relativas de 7 dimensiones normalizadas y rellenadas hasta 32, con un horizonte de prediccion de 10 pasos. El autor indica explicitamente que el checkpoint no ha sido evaluado en el robot, por lo que se trata de un artefacto de investigacion, no de un modelo validado para produccion.

Su relevancia es acotada pero tecnica: documenta un flujo completo de RL offline con condicionamiento por ventaja y CFG para manipulacion robotica, incluyendo pesos, estadisticas de normalizacion, estado del optimizador y registros de TensorBoard. El repositorio ocupa 34,1 GB y no declara licencia ni idiomas, lo que limita su reutilizacion fuera del contexto de investigacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica robotica pi05 (recipe pi05_franka_recap), modelo cfg_model de RLinf |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion de 10 pasos de accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | full_weights.pt (state dict PyTorch) y dcp_checkpoint nativo reanudable |

## Arquitectura y entrenamiento

El modelo es una politica de accion para control robotico derivada de pi05, adaptada con la receta pi05_franka_recap de RLinf. La entrada combina imagenes de camara externa y de muneca con un vector de estado bruto de 19 dimensiones; la salida son acciones relativas de 7 dimensiones, normalizadas antes de rellenarlas hasta 32 y con un horizonte de prediccion de 10. El entrenamiento emplea condicionamiento CFG con etiquetas positivas y negativas y dropout de condicionamiento de ventaja de 0,3 aplicado a todas las muestras. La etiqueta de ventaja precalculada es recap_v2000_n10_q30.

El proceso de mejora offline parte del checkpoint Franka-Insert-Tube-pi05-step-20000 y ejecuta 2000 actualizaciones con batch efectivo de 32, micro batch de 4 y learning rate de 1e-05. El conjunto de entrenamiento usa solo el split de rollout existente (10095 frames, 93 episodios y 3029 etiquetas positivas), excluyendo episodios de validacion y demostraciones. Las perdidas finales registradas son 0,0294306 (total), 0,0352341 (condicional), 0,0183513 (incondicional), 0,0215164 (positiva condicional) y 0,0420929 (negativa condicional), con una norma de gradiente de 0,126072. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de manipulacion robotica para la tarea insert-tube con un brazo Franka.
- Control visomotor a partir de camara externa y camara de muneca.
- Condicionamiento por ventaja mediante CFG, con etiquetas positivas y negativas.
- Prediccion de trayectorias de accion con horizonte de 10 pasos y acciones relativas de 7 dimensiones.
- Reanudacion nativa del entrenamiento con estado de optimizador, scheduler y RNG.
- Normalizacion exacta heredada de la politica de inicializacion mediante norm_stats.json.
- No dispone de capacidades linguisticas, de codigo, de vision general, de tool calling ni de razonamiento multi-paso fuera del bucle de control robotico.

## Casos de uso

- Investigacion en RL offline para robotica: sirve como punto de partida reproducible para comparar recetas RECAP con y sin CFG sobre la misma tarea y el mismo modelo base.
- Reproduccion de experimentos: el repositorio incluye config.yaml, train.log y estado completo del optimizador, lo que permite reanudar el entrenamiento desde el paso 2000 y verificar las metricas registradas.
- Fine-tuning sobre la tarea insert-tube: al heredar la normalizacion exacta de la politica pi05 original, se puede continuar el entrenamiento sin recalcular estadisticas.
- Estudio de condicionamiento por ventaja: el dropout de 0,3 y las etiquetas positivas y negativas permiten analizar el efecto del CFG en la mejora de politica.
- Baseline para comparativas de manipulacion: util como referencia de politica entrenada con 93 episodios y 10095 frames para evaluar otras recetas con el mismo presupuesto de datos.
- Analisis de estabilidad del entrenamiento: las perdidas condicionales e incondicionales registradas permiten estudiar la dinamica de la mejora offline en tareas de insercion precisa.
- Despliegue en simulacion o banco de pruebas: el state dict independiente full_weights.pt se puede cargar con RLinf cfg_model para inferencia con escala de guiado CFG de 1.0, siempre que se disponga del entorno Franka correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado en el robot. Las unicas metricas disponibles son las de entrenamiento:

| Metrica | Valor final |
|---|---|
| train/loss | 0,0294306 |
| train/conditional_loss | 0,0352341 |
| train/unconditional_loss | 0,0183513 |
| train/positive_conditional_loss | 0,0215164 |
| train/negative_conditional_loss | 0,0420929 |
| train/grad_norm | 0,126072 |
| train/learning_rate | 6,8349e-12 |
| time/step | 123,065 |
| time/training | 4,73336 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (34,1 GB) incluye pesos, optimizador, scheduler y estado RNG, por lo que el state dict independiente es menor, pero no se especifica su tamano exacto.
- GPU recomendadas: no disponible. El modelo base pi05 y el pipeline RLinf no detallan requisitos minimos en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: inferencia mediante RLinf cfg_model con la receta pi05_franka_recap, el state dict guardado y la normalizacion incluida; reanudacion de entrenamiento con runner.resume_dir apuntando a checkpoints/global_step_2000.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo por paso de entrenamiento (123,065 unidades de tiempo registradas) y el tiempo de entrenamiento por paso (4,73336), sin unidades explicitas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Insert-Tube-CFG-Signed-Drop30-Step-2000 | no disponible | horizonte de 10 pasos | Insercion de tubo con Franka | no disponible | Hugging Face, 0 descargas |
| Franka-Insert-Tube-pi05-step-20000 (modelo base) | no disponible | no disponible | Insercion de tubo con Franka | no disponible | Referenciado como inicializacion |
| Otras politicas pi05 para Franka | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado en el robot; no hay evidencia de exito en la tarea real.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido.
- El entrenamiento usa solo 93 episodios y 10095 frames del split de rollout existente, sin validacion ni demostraciones, lo que limita la generalizacion.
- El modelo esta especializado en una unica tarea (insert-tube) y un unico entorno (Franka con camaras externa y de muneca); no es transferible a otras tareas sin reentrenamiento.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas porque el modelo no es linguistico; el riesgo principal es el fallo fisico en la manipulacion.
- La escala de guiado CFG configurada es 1.0, lo que equivale a no aplicar guiado en inferencia; el efecto del condicionamiento por ventaja durante el entrenamiento no se ha validado en despliegue.
- El repositorio incluye estado de optimizador y RNG, por lo que su tamano (34,1 GB) no refleja el coste real de inferencia.
- No se proporcionan requisitos de hardware ni metricas de latencia, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Insert-Tube-CFG-Signed-Drop30-20261114-Step-2000
- Modelo base referenciado: https://huggingface.co/dddddsds31341/Franka-Insert-Tube-pi05-step-20000
- Codigo fuente (release citada en la model card): rlinf-recap-cfg-20261114-v15-code.zip (no se proporciona URL)
- Configuracion completa: tensorboard/config.yaml dentro del repositorio
- Registro de entrenamiento: train.log dentro del repositorio
