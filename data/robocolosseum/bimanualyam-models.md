# RoboColosseum/BimanualYAM-models

## Resumen

BimanualYAM-models es un repositorio publicado por RoboColosseum que agrupa cinco modelos de vision-lenguaje-accion (VLA) ajustados sobre el conjunto de tareas de manipulacion bimanual BimanualYAM, dentro del benchmark RoboColosseum. No se trata de un unico modelo, sino de una coleccion de pesos de inferencia (epoca final) mas los ficheros de configuracion necesarios para cargar cada politica, organizados como `<modelo>/<tarea>/`.

Cada VLA parte de un checkpoint base publico y se ajusta con la receta por defecto de su repositorio de origen (learning rates y partes congeladas originales, con el LR escalado linealmente con el tamano de batch efectivo) durante 5 epocas. Los modelos incluidos son GR00T N1.7 (base `nvidia/GR00T-N1.7-3B`), pi0.5 (base `gs://openpi-assets/checkpoints/pi05_base`), G0.5 (base `OpenGalaxea/G05`), MolmoAct2 (base `allenai/MolmoAct2`) y LingBot-VLA v2 6B (base `robbyant/lingbot-vla-v2-6b`).

El repositorio es relevante ahora porque permite comparar arquitecturas VLA heterogeneas bajo un mismo conjunto de datos, misma instrumentacion (camaras y espacio de acciones) y mismas recetas de ajuste, lo que reduce el sesgo de comparacion entre implementaciones. El tamano total del repositorio es de 326,4 GB, la libreria declarada es LeRobot y la licencia figura como "other" sin especificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); el repositorio agrupa cinco arquitecturas distintas, una por modelo base |
| Parametros totales | Variable: 3B (GR00T N1.7), 6B (LingBot-VLA v2); no disponible para pi0.5, G0.5 y MolmoAct2 |
| Parametros activos | No aplica (no se declara ningun modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; se publican pesos de inferencia en la precision derivada del entrenamiento (fp32 en pesos maestros, computo en bf16) |
| Idiomas soportados | No disponible; las instrucciones de tarea estan redactadas en ingles ("Clean the table.", "Stack the cups.", etc.) |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors (libreria LeRobot) |

Modelos incluidos y su checkpoint base:

| Carpeta | Modelo | Checkpoint base | Tareas cubiertas |
|---|---|---|---|
| `gr00t/` | GR00T N1.7 | `nvidia/GR00T-N1.7-3B` | Dustpan, Microwave, Drawer, Cups, Tray |
| `pi05/` | pi0.5 | `gs://openpi-assets/checkpoints/pi05_base` | Dustpan, Microwave, Drawer, Cups, Tray |
| `g05/` | G0.5 | `OpenGalaxea/G05` (g05-base) | Dustpan, Microwave, Drawer, Cups, Tray |
| `molmoact2/` | MolmoAct2 | `allenai/MolmoAct2` | Dustpan, Microwave, Drawer, Cups, Tray |
| `lingbot-vla-v2/` | LingBot-VLA v2 6B | `robbyant/lingbot-vla-v2-6b` | Dustpan, Microwave, Drawer, Cups (Tray pendiente) |

## Arquitectura y entrenamiento

Cada entrada del repositorio es el resultado de ajustar un VLA completo sobre una tarea concreta mediante la receta por defecto de su repositorio de origen. No se modifica el codigo de los repos originales: el proyecto RoboColosseum anade unicamente la capa de conversion de datos, los ficheros de configuracion registrados desde fuera y los scripts de lanzamiento. El ajuste se realiza durante 5 epocas y los pesos finales de inferencia se publican junto a los ficheros de configuracion.

Las recetas concretas declaradas por el autor son las siguientes. GR00T N1.7: backbone VLM descongelado mas action head, GBS 64, LR pico 1e-4 con decaimiento coseno y 5 % de warmup. pi0.5: ajuste completo segun openpi con EMA 0.99, GBS 64, LR pico 2.5e-5 con decaimiento coseno hasta 2.5e-6 y 1000 pasos de warmup. G0.5: ajuste completo con LR de vision multiplicado por 0.1, FSDP, GBS 32, LR pico 4e-5, 200 pasos de warmup y weight decay 0.03. MolmoAct2: ajuste completo, GBS 128, LR 2e-5 para el LLM, 1e-5 para el ViT, 1e-5 para el conector y 1e-4 para el action expert. LingBot-VLA v2: ajuste completo, GBS 64, LR constante de 1.25e-5 (5e-5 escalado por 64/256) con optimizador Muon.

La instrumentacion es comun a todas las tareas y modelos: una camara superior a 360x640 y dos camaras de muneca (izquierda y derecha) a 480x640. El espacio de estado y accion es un vector de 14 angulos articulares absolutos `[brazo izquierdo 6, pinza izquierda 1, brazo derecho 6, pinza derecha 1]`. El entrenamiento usa pesos maestros en fp32 con computo en bf16 sobre 4 GPU H100. Los registros de entrenamiento estan publicados en el proyecto de W&B `shaileshxml-nus/RoboColosseum`.

## Capacidades

- Ejecucion de politicas de manipulacion bimanual: dado un estado de 14 articulaciones y las imagenes de tres camaras, el modelo predice la siguiente accion en el mismo espacio de 14 dimensiones.
- Seguimiento de instrucciones en lenguaje natural de alcance corto, con cinco instrucciones definidas en el conjunto de datos.
- Manipulacion de objetos y tareas de mesa: limpiar la mesa (Dustpan y Tray), abrir el microondas y sacar un bol (Microwave), meter un vaso en el cajon (Drawer) y apilar vasos (Cups).
- Percepcion visual multi-vista: una vista cenital y dos vistas de muneca, lo que aporta informacion egocentrica de ambos brazos.
- Control bimanual coordinado: las dos pinzas se accionan de forma conjunta en el mismo vector de accion.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso explicito.
- No se declaran capacidades multilingues ni modos especiales (thinking, audio, generacion de texto libre).
- No se declara capacidades de generacion de codigo, matematicas ni dialogo general: se trata de politicas robotizadas, no de asistentes de proposito general.

## Casos de uso

- Evaluacion comparativa de backbones VLA: el repositorio permite ejecutar cinco arquitecturas (GR00T N1.7, pi0.5, G0.5, MolmoAct2 y LingBot-VLA v2) sobre las mismas cinco tareas y con el mismo espacio de acciones, lo que hace posible comparar directamente su exito por tarea sin reentrenar cada una.
- Investigacion en recetas de ajuste fino: al publicarse la receta exacta de cada modelo (LR, partes congeladas, optimizador, tamano de batch global), sirve como linea base reproducible para estudiar el efecto de distintos hiperparametros sobre el rendimiento en robotica.
- Desarrollo de politicas para robot bimanual de sobremesa: un laboratorio con una plataforma de dos brazos y tres camaras puede cargar los pesos de la tarea correspondiente (por ejemplo, `gr00t/microwave`) y desplegar la politica para abrir el microondas y extraer un bol.
- Automatizacion de tareas de recogida y ordenacion: las tareas Dustpan y Tray comparten la instruccion "Clean the table.", lo que permite usar estos checkpoints como punto de partida para barrer y recoger objetos sobre una superficie.
- Manipulacion precisa y prension fina: la tarea Cups ("Stack the cups.") exige colocar un objeto sobre otro, una habilidad util como base para tareas de apilado o ensamblaje con tolerancias ajustadas.
- Manipulacion articulada de contenedores: Drawer ("Put the cup into the drawer.") y Microwave implican abrir un elemento articulado y depositar o retirar objetos, patron reutilizable en tareas de carga y descarga de armarios.
- Generacion de datos y evaluacion tipo benchmark: al estar asociado al benchmark RoboColosseum, el repositorio se puede usar para medir de forma estandarizada el rendimiento de nuevos modelos que se envien a comparacion contra las lineas base.
- Transferencia y ajuste posterior: los pesos de la epoca final son un punto de partida razonable para un ajuste adicional sobre una tarea propia del mismo robot, reaprovechando el alineamiento visual y bimanual ya aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de exito, metricas de exito por tarea ni comparaciones numericas entre los cinco modelos; unicamente describe las recetas de entrenamiento y remite a los registros de W&B del proyecto `shaileshxml-nus/RoboColosseum`.

## Requisitos de hardware

- Entrenamiento (referencia declarada): 4 GPU H100, pesos maestros en fp32 y computo en bf16, con tamano de batch global entre 32 y 128 segun el modelo.
- Inferencia de GR00T N1.7 (3B): estimacion a partir del numero de parametros de aproximadamente 6-7 GB en bf16/fp16 y unos 12-13 GB en fp32, sin contar activaciones del codificador visual. Cabria en GPU de consumo con 24 GB (RTX 4090, RTX 3090).
- Inferencia de LingBot-VLA v2 (6B): estimacion de aproximadamente 12-13 GB en bf16/fp16 y unos 24-25 GB en fp32. Cabria en RTX 4090 o RTX 3090 con 24 GB en bf16, con margen limitado.
- pi0.5, G0.5 y MolmoAct2: no disponible el numero de parametros, por lo que no se puede estimar la VRAM necesaria.
- Almacenamiento: el repositorio completo ocupa 326,4 GB; conviene descargar solo la carpeta `<modelo>/<tarea>` que se vaya a usar.
- Opciones de despliegue: la libreria declarada es LeRobot con pesos en safetensors; el proyecto RoboColosseum mantiene cada modelo entrenado por su repositorio upstream sin modificar (openpi para pi0.5, repositorio de Isaac-GR00T/NVIDIA para GR00T, repositorios propios de G0.5, MolmoAct2 y LingBot-VLA v2), por lo que el pipeline de inferencia recomendado es el de cada repositorio de origen mas la capa de configuracion del benchmark.
- No se declaran datos de latencia ni de throughput.

## Comparativa con modelos similares

Comparativa interna de los cinco VLA incluidos en el repositorio:

| Modelo | Parametros | Checkpoint base | Contexto | Licencia | Tareas disponibles | Notas de receta |
|---|---|---|---|---|---|---|
| GR00T N1.7 | 3B (declarado en el nombre del base) | `nvidia/GR00T-N1.7-3B` | No disponible | Depende de la del base (no disponible) | 5 de 5 | VLM backbone descongelado + action head, GBS 64 |
| pi0.5 | No disponible | `gs://openpi-assets/checkpoints/pi05_base` | No disponible | Depende de la del base (no disponible) | 5 de 5 | Ajuste completo openpi, EMA 0.99, GBS 64 |
| G0.5 | No disponible | `OpenGalaxea/G05` | No disponible | Depende de la del base (no disponible) | 5 de 5 | Ajuste completo, LR de vision x0.1, FSDP, GBS 32 |
| MolmoAct2 | No disponible | `allenai/MolmoAct2` | No disponible | Depende de la del base (no disponible) | 5 de 5 | Ajuste completo con LR diferenciados por modulo, GBS 128 |
| LingBot-VLA v2 | 6B (declarado en el nombre del base) | `robbyant/lingbot-vla-v2-6b` | No disponible | Depende de la del base (no disponible) | 4 de 5 (Tray pendiente) | Ajuste completo, optimizador Muon, GBS 64 |

La licencia del repositorio se declara como "other", de modo que las condiciones de uso comercial dependen de la licencia de cada checkpoint base, que no se detalla en la informacion disponible. No se dispone de datos de benchmarks que permitan ordenar estos cinco modelos por rendimiento.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia especificado: no se puede confirmar si el uso comercial esta permitido. Es imprescindible revisar la licencia de cada checkpoint base antes de cualquier despliegue productivo.
- Ausencia total de resultados de benchmarks en la informacion disponible: no hay tasas de exito ni metricas comparativas que respalden el rendimiento de los checkpoints.
- Los modelos son especificos por tarea: cada carpeta `<modelo>/<tarea>` contiene un ajuste dedicado, no un modelo generalista que resuelva varias tareas a la vez.
- Dominio muy restringido: el conjunto de datos son escenas de sobremesa con un unico tipo de robot bimanual, tres camaras en posiciones fijas y un espacio de acciones de 14 articulaciones, lo que limita la transferencia a otras plataformas o entornos.
- Instrucciones de lenguaje muy limitadas: solo se cubren cinco frases ("Clean the table.", "Open the microwave and take out the bowl.", "Put the cup into the drawer.", "Stack the cups." y la repeticion de "Clean the table." para Tray), sin evidencia de generalizacion a ordenes nuevas.
- Cobertura incompleta en un caso: LingBot-VLA v2 no incluye la tarea Tray, marcada como pendiente.
- Riesgo de sobreajuste a la receta: al fijarse la receta por defecto de cada repositorio y no publicarse curvas de validacion en la model card, no es posible saber si los 5 epochs son suficientes o excesivos para cada modelo.
- Idiomas: no disponibles segun los metadatos; las instrucciones estan en ingles, por lo que no hay evidencia de soporte multilingue.
- Riesgo de alucinacion en el sentido clasico (texto libre): no aplica directamente, pero si existe riesgo de predicciones de accion incoherentes fuera de la distribucion de entrenamiento.
- Huella de almacenamiento elevada: 326,4 GB para el repositorio completo, lo que exige gestionar la descarga por subcarpetas.
- Sin senales de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa publica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/BimanualYAM-models
- Organizacion RoboColosseum en HuggingFace: https://huggingface.co/RoboColosseum
- Repositorio GitHub de RoboColosseum (README): https://github.com/shailes-h/RoboColosseum/blob/main/README.md
- Sitio web del benchmark RoboColosseum: https://robocoliseum.ai/
- Proyecto de W&B con los registros de entrenamiento: `shaileshxml-nus/RoboColosseum`
- Conjunto de datos asociado: RoboColosseum/BimanualYAM-datasets (LeRobot v3.0, 30 fps)
