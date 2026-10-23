# shrg7/october21-oer10-molmobot-droid-joint-urma4flat-h16-b1024-fullft-4k

## Resumen

`shrg7/october21-oer10-molmobot-droid-joint-urma4flat-h16-b1024-fullft-4k` es un checkpoint de política robótica de tipo VLA (vision-language-action) construido sobre **pi0.5** mediante el framework **openpi** de Physical Intelligence, en su implementación JAX. No es un modelo de lenguaje general: es un policy entrenado para mapear observaciones visuales, estado articular del robot e instrucción en lenguaje natural a secuencias de acciones motoras. El autor lo publica como checkpoint intermedio de un entrenamiento mayor (la actualización 3.999 de un run que llega a 40.000 updates).

La innovación principal del checkpoint es el uso de un **token URMA4**: la descripción compilada del robot (articulaciones, eslabones, pinza) y su estado articular actual pasan por un encoder pequeño que produce un token adicional en el prefijo de PaliGemma. Así, una misma política aprende a controlar 1.299 robots distintos simplemente indicándole cuál está manejando. Los datos combinan DROID 1.0.1 real (50%), el setup simulado de MolmoBot (15%) y los conjuntos simulados de pick-and-place OER-10 (35%).

El modelo es relevante para quien trabaje en manipulación multi-embodiment y quiera un punto de partida ya entrenado con un token de condicionamiento de robot, con receta de fine-tuning completa documentada (flow matching sobre experto de acciones, batch global 1024, EMA 0.99). Su utilidad práctica es acotada: es un artefacto de investigación sin licencia declarada, sin benchmarks publicados y sin variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (openpi, JAX): prefijo PaliGemma + experto de acciones con flow matching; token de condicionamiento URMA4 |
| Parametros totales | no disponible (fine-tune completo desde `pi05_base`; repo de 12,4 GB con pesos EMA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (prefijo PaliGemma con tokens visuales mas el token URMA4) |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax en el formato del run; no se publican variantes GGUF ni int8/int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX) en `params/`; `assets/<asset_id>/norm_stats.json` y `assets/<asset_id>/embodiment_descriptions/` (npz) |
| Horizonte de acciones | H16 (chunks de 16 acciones relativas a las articulaciones actuales) |
| Robots en entrenamiento | 1.299 |
| Checkpoint | update 3.999 = 4.000 updates de optimizador con batch 1024 (run hasta 40k) |
| Config | `october21_oer10_molmobot_droid_joint_urma4flat_h16_b1024_fullft`, rama `pi05-oer10-droid`, commit `7b64c2c1` |
| Estado del optimizador | no incluido (solo pesos EMA, decay 0.99) |
| Tamano del repo | 12,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la receta pi0.5: un backbone VLM (prefijo PaliGemma) que procesa imágenes e instrucción, acoplado a un **experto de acciones entrenado por flow matching**. En este checkpoint el experto consume chunks de 16 acciones (H16) expresadas de forma relativa a las articulaciones actuales, con estadísticas gaussianas por grupo de grados de libertad (tablas separadas para DROID y para MolmoBot) y la pinza modelada como cerrado-ness en rango 0-1. La pérdida es únicamente la del experto de flow matching: no hay pérdida FAST ni cabeza de lenguaje. El encoder URMA4, que comprime la descripción del robot y su estado articular en un token extra del prefijo, se inicializa desde cero mientras el resto parte de `pi05_base`.

Los datos son un 50% DROID 1.0.1 (todos los episodios exitosos, descartando rangos de inactividad), 15% el setup DROID simulado de MolmoBot (`franka_droid`, 20k v2, con su propio robot id) y 35% los conjuntos simulados de pick-and-place OER-10 (los seis del usuario y los de BoAI), descartando episodios inestables con saltos articulares superiores a 1 rad. No hay aumento de imagen. La receta de entrenamiento: batch global 1024 como 4 microbatches acumulados de 256 sobre 4xH200 con FSDP 4, warmup de 1k pasos hasta un LR plano de 5e-5, AdamW con clipping 1, EMA 0.99 y fine-tune completo.

## Capacidades

- Generación de acciones motoras de manipulación (chunks de 16 acciones) condicionadas por observación visual, estado articular e instrucción.
- Condicionamiento multi-robot mediante un único token URMA4: descripción compilada del robot (articulaciones, eslabones, pinza) más estado articular.
- Mezcla de dominios real y simulado: entrenado conjuntamente con DROID real, DROID simulado de MolmoBot y pick-and-place simulado de OER-10.
- Control de pinza como variable continua de cerrado-ness 0-1, no como clasificador binario separado.
- Normalización por embodiment: estadísticas gaussianas por grupo de DoF con tablas distintas para DROID y MolmoBot.
- Punto de partida para fine-tuning sobre nuevas morfologías, ya que el encoder URMA4 puede reentrenarse para un robot nuevo.
- Soporte de tool calling, agentes, matemáticas o visión descriptiva: no disponible / no aplica (es una política de control, no un asistente).

## Casos de uso

- **Pick-and-place en simulación antes de tocar hardware**: el 35% del dataset son conjuntos simulados de OER-10, de modo que el policy ya ha visto distribuciones de objetos y posiciones de ese benchmark; sirve para validar la pila de control en MuJoCo/Isaac antes de un despliegue real.
- **Manipulación sobre Franka con datos DROID**: al ser DROID el 50% del entrenamiento, es un punto de partida directo para tareas con ese setup, reutilizando las tablas de normalización incluidas en `assets/<asset_id>/norm_stats.json`.
- **Investigación en condicionamiento multi-embodiment**: el token URMA4 permite alimentar la descripción de un robot nuevo y evaluar si la política generaliza sin reentrenar el backbone, un experimento de ablation barato con un solo checkpoint.
- **Inicialización para fine-tuning de un robot propio**: partiendo de estos pesos EMA y de la receta documentada (LR 5e-5 plano, AdamW clip 1, batch efectivo 1024) se puede adaptar el modelo a una morfología nueva con un dataset pequeño, entrenando el encoder URMA4 desde cero.
- **Generación de datos sintéticos de trayectorias**: ejecutando la política en el simulador de MolmoBot se pueden producir rollouts para preentrenar o aumentar otros modelos de imitación, filtrando los inestables con el mismo criterio del autor (>1 rad de salto articular).
- **Evaluación de sim-to-real con mezcla de dominios**: al combinar 65% real (DROID) y 35% sim, es un banco de pruebas para medir la brecha de rendimiento entre ambos regímenes con la misma arquitectura.
- **Reproducción de la receta pi0.5 en JAX**: el checkpoint y los hiperparámetros publicados permiten reproducir el pipeline openpi con FSDP en 4 GPU y comparar contra el `pi05_base` original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta únicamente la configuración de entrenamiento (4.000 updates, batch 1024, 4xH200 con FSDP 4, EMA 0.99) y la composición del dataset; no incluye tasas de éxito en DROID, OER-10 ni MolmoBot, ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM de inferencia**: no disponible de forma explícita. El repo ocupa 12,4 GB, lo que da un orden de magnitud del peso de los parámetros en el formato del checkpoint; a ello hay que sumar activaciones del prefijo visual y del experto de acciones.
- **GPU de entrenamiento (dato del autor)**: 4xH200 con FSDP 4, microbatches de 256 y batch global 1024.
- **GPU recomendadas para inferencia**: hardware NVIDIA de datacenter (H100/H200 o A100) es el escenario natural del stack JAX/openpi; no se documenta soporte para GPU de consumo.
- **GPU de consumo**: no disponible. No se publican pesos cuantizados ni ruta de despliegue en llama.cpp/Ollama, y el checkpoint es Orbax/JAX, no GGUF, por lo que el ecosistema habitual de inferencia en consumer no aplica directamente.
- **Opciones de despliegue**: servidor de políticas de openpi en JAX; el checkpoint incluye `params/` (Orbax) y los assets de normalización y descripción de embodiment. No hay conversión oficial a vLLM, TGI, llama.cpp ni Ollama.
- **Latencia y throughput**: no disponibles. La frecuencia de control viable depende del hardware y del horizonte H16 (16 acciones por inferencia), pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi0.5 + URMA4) | VLA con flow matching, JAX | no disponible | no disponible | no disponible | Pesos en HF, repo 12,4 GB |
| `pi05_base` (openpi) | VLA base pi0.5 | no disponible en la informacion | no disponible | la del proyecto openpi | Referenciado como origen del fine-tune |
| DROID / MolmoBot (políticas de referencia) | Politicas de imitacion sobre DROID | no disponible | no disponible | no disponible | Fuentes de datos citadas, no modelos comparados |
| Otras VLA open source de la misma categoria | VLA | no disponible | no disponible | no disponible | No verificado en esta busqueda |

No se dispone de datos verificados de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia no hay permiso explícito de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Checkpoint intermedio**: 4.000 de 40.000 updates previstos. No es el modelo final del run y su rendimiento puede estar por debajo del checkpoint convergido.
- **Sin benchmarks**: no hay tasas de éxito publicadas, ni en simulación ni en real, lo que impide estimar su calidad frente a `pi05_base` u otras políticas.
- **Solo pesos EMA**: el estado del optimizador no está incluido, así que reanudar el entrenamiento exactamente donde se dejó no es posible; solo fine-tuning desde los pesos.
- **Sesgos de dominio**: el 50% de los datos proviene de DROID y el 35% de pick-and-place simulado de OER-10; el comportamiento fuera de esas distribuciones (otras tareas, otros objetos, otros brazos) no está caracterizado.
- **Riesgo de fallo físico**: como política de control real, los errores se traducen en movimientos incorrectos del robot. No hay evaluación de seguridad ni límites de par/fuerza documentados.
- **Dependencia del token URMA4**: el condicionamiento depende de que la descripción compilada del robot y las estadísticas de normalización (`norm_stats.json`, `embodiment_descriptions/`) coincidan con las usadas en entrenamiento; un asset mal construido degrada silenciosamente la política.
- **Idiomas e instrucciones**: no se especifica el idioma ni el formato de las instrucciones de lenguaje natural utilizadas.
- **Restricciones de simulación**: los episodios simulados con saltos articulares >1 rad fueron descartados, de modo que el modelo no ha visto dinámicas bruscas ni recuperaciones tras colisión.
- **Ecosistema**: al ser un checkpoint JAX/Orbax, no es directamente consumible por herramientas de inferencia habituales (llama.cpp, Ollama, vLLM) sin trabajo de conversión.

## Enlaces

- HuggingFace: https://huggingface.co/shrg7/october21-oer10-molmobot-droid-joint-urma4flat-h16-b1024-fullft-4k
- Framework openpi (referencia del stack, no incluida en los resultados de búsqueda): https://github.com/Physical-Intelligence/openpi
- Paper o blog de pi0.5: no disponible en la informacion proporcionada
- Dataset DROID 1.0.1: no disponible enlace en la informacion proporcionada
- Conjuntos simulados OER-10 y MolmoBot: no disponibles enlaces en la informacion proporcionada
- La búsqueda web realizada no devolvio resultados relevantes sobre este modelo (solo paginas de ofertas de empleo de la FFR y la LNR, sin relacion con el contenido).
