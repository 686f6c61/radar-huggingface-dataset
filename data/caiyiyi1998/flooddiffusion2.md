# caiyiyi1998/FloodDiffusion2

## Resumen

FloodDiffusion 2 es un modelo de generacion de movimiento humano condicionado por texto, desarrollado por el autor caiyiyi1998 y publicado en HuggingFace. Se presenta como una solucion de generacion de movimiento en streaming, eficiente y con control de trayectoria (root-path control), lo que permite sintetizar secuencias de movimiento de forma continua en lugar de generar clips aislados. El modelo se apoya en difusion, un autoencoder latente de 263 dimensiones (LDF/VAE) y un mecanismo denominado Partial Attention.

La relevancia del proyecto reside en su enfoque de streaming y en la supervision geometrica compatible con difusion, que segun la model card permite mantener la coherencia fisica del esqueleto durante la generacion. El repositorio incluye seis checkpoints de FD2 (variantes sobre HumanML3D, HumanML3D+BABEL y SEED, con y sin control de trayectoria) y los modelos emparejados LDF/VAE de 263 dimensiones para compatibilidad con la primera generacion.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto, la licencia ni resultados de benchmarks en la informacion proporcionada. El repositorio ocupa 29,3 GB e incluye pesos en formato PyTorch checkpoint junto con estadisticas de normalizacion y matrices de cinematica directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para generacion de movimiento, con Partial Attention y autoencoder latente de 263 dimensiones (LDF/VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precision completa, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (los pesos y datasets de terceros conservan sus licencias respectivas) |
| Formato de pesos | PyTorch checkpoint (.ckpt) con estado de modelo, EMA, optimizador y scheduler; matriz FK en assets/W.npy |

## Arquitectura y entrenamiento

FloodDiffusion 2 se basa en un esquema de difusion aplicado sobre un espacio latente de 263 dimensiones proporcionado por un autoencoder LDF/VAE especifico (checkpoint `vae_263`, entrenado 2.250.000 pasos). La generacion se condiciona por texto mediante codificadores UMT5 y GloVe, y se apoya en un mecanismo de Partial Attention orientado a la generacion en streaming. El modelo incorpora ademas una supervision geometrica compatible con difusion, materializada en una matriz de cinematica directa cuadratica (`assets/W.npy`) que se usa para imponer coherencia esqueletica durante el proceso generativo.

El release incluye seis checkpoints de FD2 con distintos pasos de entrenamiento y valores de CFG: `humanml3d_fk_60k` (60.000 pasos, CFG 4), `humanml3d_path_fk_55k` (55.000 pasos, CFG 3), `humanml3d_babel_fk_200k` (200.000 pasos, CFG 4), `humanml3d_babel_path_200k` (200.000 pasos, CFG 4), `seed_fk_300k` (300.000 pasos, CFG 2) y `seed_path_fk_300k` (300.000 pasos, CFG 2). Las variantes con sufijo `path` incorporan control de trayectoria de la raiz. Los datasets empleados son HumanML3D, BABEL y SEED. No se detalla la composicion exacta del dataset, el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de movimiento humano tridimensional condicionado por descripciones textuales en ingles.
- Generacion de movimiento en streaming, permitiendo secuencias continuas en lugar de clips discretos.
- Control de trayectoria de la raiz (root-path control) en las variantes `path`.
- Supervision geometrica del esqueleto para mantener la coherencia fisica del movimiento.
- Compatibilidad con los modelos LDF/VAE de 263 dimensiones de la primera generacion.
- Renderizado de malla mediante SMPL-H (requiere obtener el modelo neutral de forma separada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (solo se declara ingles).
- Capacidades de vision, audio o modo thinking: no disponible.

## Casos de uso

- Animacion de personajes en videojuegos: el modelo permite generar ciclos de movimiento continuos a partir de texto, y su naturaleza de streaming encaja con motores que necesitan animacion en tiempo real sin cortes entre clips.
- Previsualizacion de coreografias y bloqueo de escenas: las variantes con control de trayectoria permiten fijar la ruta que seguira el personaje mientras el texto define el estilo del movimiento.
- Generacion de datos sinteticos de movimiento para entrenar otros modelos: los checkpoints sobre HumanML3D y BABEL pueden producir secuencias etiquetadas que amplien datasets existentes.
- Investigacion en generacion de movimiento texto-a-movimiento: la combinacion de difusion, LDF/VAE y supervision FK ofrece una base reproducible para experimentos academicos con el codigo disponible en GitHub.
- Robots y avatares con locomocion controlada: el control de trayectoria de la raiz es util para planificar desplazamientos sobre un terreno mientras se genera el movimiento corporal asociado.
- Prototipado de experiencias interactivas: la generacion en streaming permite responder a cambios de texto o de ruta sin regenerar toda la secuencia, util en instalaciones interactivas o demos.
- Produccion de contenido previsualizable en animacion: dado que el modelo usa el esqueleto SMPL-H, sus salidas se pueden llevar a un pipeline de render con malla y despues a herramientas de animacion convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El proyecto esta orientado a PyTorch y no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio (29,3 GB) sugiere un consumo de disco y memoria elevado, pero no se confirma que quepa en GPU de consumo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo oficial es mediante el script `evaluate.py` y los ficheros de configuracion YAML incluidos en cada checkpoint.
- Latencia y throughput estimados: no disponible.
- Requisitos adicionales: Python 3.10 o superior, script `setup_project.py` para instalar dependencias y descargar checkpoints, archivo `deps.zip` con UMT5, T2M y GloVe, y SMPL-H obtenido aparte para el renderizado de malla.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas suficientes (parametros, contexto, licencia) en la informacion proporcionada para construir una comparativa cuantitativa con otros modelos de la categoria texto-a-movimiento. No se aportan cifras de alternativas como MDM, MLD o T2M-GPT en la documentacion facilitada, por lo que la comparativa queda como no disponible.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que no se puede confirmar si permite uso comercial.
- Los pesos de terceros (UMT5, T2M, GloVe) y los datasets empleados conservan sus licencias respectivas; su reutilizacion esta sujeta a esas condiciones.
- El modelo solo declara soporte de ingles; la generacion con otros idiomas no esta garantizada.
- Requiere el modelo SMPL-H, cuya obtencion esta sujeta a registro y licencia propia en el sitio oficial.
- No se publican resultados de benchmarks, por lo que el rendimiento real frente a alternativas no esta verificado de forma independiente.
- No se detalla el numero de parametros ni los requisitos de VRAM, lo que dificulta planificar el despliegue en produccion.
- Al tratarse de un modelo de difusion generativa, existe riesgo de producir movimientos fisicamente inconsistentes o no alineados con el texto, aunque la supervision FK trata de mitigarlo.
- El repositorio se publico el 2026-10-01 y no cuenta con descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos concretos ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiyiyi1998/FloodDiffusion2
- Codigo y instrucciones de instalacion: https://github.com/caiyy17/FloodDiffusion2
- Dependencias compartidas (deps.zip): https://huggingface.co/caiyiyi1998/FloodDiffusion2/blob/main/deps.zip
- Datasets preparados: https://huggingface.co/datasets/caiyiyi1998/FloodDiffusion2-Data
- SMPL-H (modelo neutral, sitio oficial): https://mano.is.tue.mpg.de/
