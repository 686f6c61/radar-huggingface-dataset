# LeeHakHo/square_real100_ckpt

## Resumen

`LeeHakHo/square_real100_ckpt` es una coleccion de checkpoints de una politica de difusion (diffusion policy) entrenada por behavior cloning sobre 100 demostraciones reales de un robot Franka en la tarea Square (introducir una tuerca en un pivote). El autor es LeeHakHo y el modelo se publica bajo licencia MIT junto al dataset asociado, `LeeHakHo/square_real100`.

El entrenamiento se realizo a partir de observaciones de 84 px, con `seq_length` de 16, batch de 64, learning rate de 1e-4 y 1000 epocas, entrenando cuatro variantes (brazos) de forma concurrente en una unica RTX 4080. Las cuatro comparten backbone y configuracion, y solo se diferencian en el objetivo auxiliar acoplado al encoder visual: sin auxiliar, posicion del objeto en el marco del mundo, posicion del objeto en el marco del efector final, y ambos a la vez.

El interes del repo es metodologico mas que de rendimiento: al no existir simulador detras del dataset, no se reporta tasa de exito y la unica senal de validacion es el error MSE de difusion sobre acciones en 10 demostraciones reservadas. Ademas, ningun brazo supervisa la rotacion (`rotation_blocks: []`), de modo que las cabezas emiten los slots de rotacion pero su error queda enmascarado. La utilidad practica esta en comparar el efecto de los objetivos auxiliares de representacion sobre una misma base de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se identifica como diffusion policy para behavior cloning; el backbone concreto no se especifica en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje; `seq_length` de 16 pasos de observacion/accion |
| Tipos de cuantizacion | no disponible (solo checkpoints PyTorch `.pth`; no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robotico, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` con estado del optimizador y pesos EMA; ~1,53 GiB por checkpoint |

Otros datos relevantes: el repositorio ocupa 124,9 GB, con 19 checkpoints por brazo (`model_epoch_{10,20,...,90,100,200,...,1000}.pth`) y 4 brazos, lo que da 76 ficheros de aproximadamente 1,53 GiB cada uno. Los checkpoints se distribuyen de forma densa en la zona donde cae el minimo de validacion (epocas 10 a 100).

## Arquitectura y entrenamiento

El modelo sigue el paradigma de diffusion policy: en lugar de regresar directamente una accion, aprende a generar secuencias de acciones mediante un proceso de difusion condicionado por observaciones visuales. La model card no detalla el backbone (tipicamente un encoder visual CNN o ResNet combinado con un U-Net temporal 1D o un transformer), ni el numero de parametros, ni la composicion exacta del dataset mas alla de las 100 demostraciones reales y la resolucion de 84 px.

Los datos proceden del dataset `LeeHakHo/square_real100`, del que 90 demostraciones se usan para entrenamiento (`mask/train`) y 10 quedan reservadas (`mask/valid`). La unica senal de entrenamiento es el MSE de difusion sobre acciones. Los cuatro brazos se entrenaron simultaneamente en una sola RTX 4080 durante 1000 epocas, lo que sugiere un modelo de tamano moderado. El objetivo auxiliar anade una cabeza que predice la posicion del objeto, bien en el marco del mundo (base del robot), bien en el marco del gripper, o ambos con una unica cabeza. La observacion `obs/object` proviene de seguimiento con FoundationPose y no de ground truth; el 1,8 % de frames con `obs/aux_valid = 0` se descartan de la perdida auxiliar y de su estandarizacion de objetivos. Un punto critico: ningun brazo supervisa rotacion, de modo que solo se aprende posicion.

## Capacidades

- Generacion de trayectorias de accion para control robotico de manipulacion, condicionadas por observaciones visuales de 84 px.
- Ejecucion de la tarea Square (nut-on-peg) sobre un robot Franka, con horizonte de 16 pasos.
- Behavior cloning a partir de demostraciones reales, sin necesidad de simulador ni de reward model.
- Aprendizaje de representaciones visuales con objetivos auxiliares de posicion de objeto (marco mundo, marco del efector final o ambos).
- Prediccion de posicion del objeto mediante cabezas auxiliares (solo posicion; la rotacion no esta supervisada).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, multilingue, vision general, audio ni modo de pensamiento: es un modelo de politica especializado.

## Casos de uso

- Investigacion en diffusion policies: servir como punto de partida reproducible para estudiar el efecto de objetivos auxiliares de representacion sobre una misma base de comportamiento y con el mismo dataset de 100 demostraciones.
- Benchmark de representaciones visuales en robotica: los cuatro brazos permiten aislar cuanto aporta supervisar la posicion del objeto en distintos marcos de referencia, manteniendo constante el resto del pipeline.
- Prototipado de manipulacion con Franka: desplegar el checkpoint como politica de imitacion en un montaje real con camara a 84 px para replicar la tarea de insertar una tuerca en un pivote.
- Analisis de sobreajuste en datasets pequenos: la curva de validacion (minimo en las epocas 34-99 y subida posterior) es un caso de estudio directo de como se comporta una diffusion policy con 90 demostraciones y 1000 epocas.
- Reentrenamiento con datos propios: al ser un checkpoint PyTorch con estado del optimizador y pesos EMA, se puede reanudar el entrenamiento o afinar sobre un dataset nuevo de demostraciones reales de la misma tarea.
- Evaluacion de FoundationPose en el lazo: los frames marcados como no validos permiten estudiar el impacto del ruido de seguimiento de pose en el aprendizaje de politicas.
- Comparacion de estrategias de seleccion de checkpoint: el repo incluye 19 checkpoints por brazo, lo que permite contrastar la seleccion por perdida de validacion frente a la seleccion por perdida de entrenamiento que usa la implementacion de referencia de diffusion policy.
- Base para ablaciones de horizonte de accion: con `seq_length` 16 fijo, es un punto de partida para estudiar horizontes mayores o menores en tareas de insercion de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay simulador detras del dataset y que no se reporta tasa de exito. La unica metrica publicada es la perdida de accion de difusion sobre las 10 demostraciones reservadas, registrada antes de sumar el termino auxiliar para que los cuatro brazos sean comparables:

| Brazo | Mejor perdida de validacion | Epoca | Perdida de validacion en epoca 1000 | Perdida de entrenamiento en epoca 1000 |
|---|---|---|---|---|
| `baseline/` | 0,0698 | 67 | 0,3605 | 0,0066 |
| `aux_world_frame/` | 0,0719 | 99 | 0,3819 | 0,0067 |
| `aux_eef_frame/` | 0,0725 | 85 | 0,3916 | 0,0067 |
| `aux_obj_eef_frame/` | 0,0716 | 34 | 0,3800 | 0,0065 |

El autor advierte que esta metrica es un proxy debil para diffusion policies: la implementacion de referencia selecciona checkpoints por perdida de entrenamiento y entrenar mas alla del minimo de validacion es lo habitual, no un defecto.

## Requisitos de hardware

- Entrenamiento: el autor entreno los cuatro brazos de forma concurrente en una unica RTX 4080, lo que indica que el modelo y el batch de 64 a 84 px caben comodamente en 16 GB de VRAM.
- Inferencia: no se publica el numero de parametros ni la VRAM exacta necesaria. Como referencia, cada checkpoint ocupa ~1,53 GiB, pero ese fichero incluye estado del optimizador y pesos EMA, por lo que el peso puro del modelo es una fraccion de esa cifra y la huella de inferencia es previsiblemente muy inferior a 1 GiB.
- GPU recomendadas: no disponibles de forma explicita. Dado el registro de entrenamiento en una RTX 4080, es razonable esperar que inference funcione en GPUs consumer de gama media-alta (RTX 3060 12 GB en adelante), pero no hay dato publicado que lo confirme.
- Despliegue: no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican aqui. El despliegue natural es mediante PyTorch con las implementaciones de referencia de diffusion policy y el ecosistema robomimic, cargando directamente los ficheros `.pth`.
- Latencia y throughput: no disponibles. Para control robotico en tiempo real seran determinantes el numero de pasos de difusion configurado y la frecuencia de control del bucle, datos que no se especifican en la model card.

## Comparativa con modelos similares

No hay datos numericos publicados de este checkpoint que permitan una comparacion cuantitativa honesta. La tabla siguiente resume diferencias cualitativas con alternativas de la misma categoria; los valores no disponibles se marcan como tales.

| Modelo | Enfoque | Datos de entrenamiento | Metrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeHakHo/square_real100_ckpt` | Diffusion policy, behavior cloning, con objetivos auxiliares de pose | 100 demostraciones reales (90 train / 10 valid), tarea Square, Franka, 84 px | MSE de accion en validacion (mejor 0,0698 en `baseline/`) | MIT | HuggingFace, 124,9 GB |
| Diffusion Policy (Chi et al.) | Diffusion policy, behavior cloning | Benchmarks de simulacion (robomimic, Push-T, etc.) y datasets reales | Tasa de exito en simulador | no disponible en esta ficha | Implementacion de referencia publica |
| ACT / Action Chunking Transformer (Zhao et al.) | Transformer con action chunking, behavior cloning | Demostraciones reales tipo ALOHA | Tasa de exito en tareas reales | no disponible en esta ficha | Repositorio publico |
| robomimic | Framework de aprendizaje por imitacion y offline RL | Multiples datasets de demostraciones | Tasa de exito en simulador | no disponible en esta ficha | Repositorio publico |

La diferencia clave frente a las alternativas es que este checkpoint no reporta tasa de exito y solo se evalua con una metrica interna de difusion, por lo que no es directamente comparable con resultados de simulador.

## Limitaciones y advertencias

- Ausencia total de evaluacion de exito: al no existir simulador, no hay tasa de exito ni evaluacion en robot real publicada. La perdida MSE no garantiza que la politica complete la tarea.
- Sobreajuste marcado: con 90 demostraciones y 1000 epocas, la validacion toca minimo entre las epocas 34 y 99 y empeora despues. Los checkpoints tardios probablemente sobreajustan.
- Rotacion no aprendida: `rotation_blocks: []` y el error de las cabezas de rotacion esta enmascarado. El modelo solo aprende posicion, lo que limita cualquier tarea que requiera orientacion precisa.
- Dependencia de FoundationPose: `obs/object` no es ground truth, y el 1,8 % de frames se descarta por `obs/aux_valid = 0`. El ruido de seguimiento de pose afecta al objetivo auxiliar.
- Dominio muy estrecho: una unica tarea (Square, nut-on-peg), un unico robot (Franka), una unica resolucion (84 px) y un unico conjunto de 100 demostraciones. La generalizacion a otras tareas, objetos o montajes no esta demostrada.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues. Cualquier expectativa de ese tipo es inaplicable.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, pero al tratarse de un artefacto de investigacion conviene verificar las condiciones del dataset subyacente y de las dependencias (robomimic, FoundationPose) antes de un despliegue en produccion.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos de texto; el riesgo equivalente es la generacion de trayectorias de accion no validas fuera de la distribucion de entrenamiento.
- Repositorio muy pesado: 124,9 GB por 76 checkpoints, lo que complica la descarga completa y el versionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeHakHo/square_real100_ckpt
- Dataset asociado: https://huggingface.co/datasets/LeeHakHo/square_real100
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados; los resultados devueltos no guardan relacion con el modelo.
