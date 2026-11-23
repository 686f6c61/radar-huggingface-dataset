# DecentVLA/droid_site8_pi05_accord_cotrain_w100_expert

## Resumen

`droid_site8_pi05_accord_cotrain_w100_expert` es un checkpoint de política robótica desarrollado por DecentVLA, un fine-tune completo del modelo base π0.5 de Physical Intelligence (openpi) sobre el split *site8* del dataset DROID 1.0.1. El modelo resuelve el problema de control visuomotor multi-tarea en manipulación robótica: dado un par de imágenes de cámara, el estado de las articulaciones y una instrucción en lenguaje natural, predice un *chunk* de 15 acciones de posición articular (8 dimensiones) para un robot de tipo DROID. Su relevancia actual radica en que es el primer artefacto publicado de un experimento de aprendizaje federado (FedAvg) con un *action bank* compartido entre 8 sitios, lo que permite estudiar el entrenamiento descentralizado de políticas robóticas sin centralizar los datos de imagen.

El checkpoint corresponde al round 100 (final) del presupuesto de entrenamiento: 100 rondas × 250 pasos, con un total de 25.000 pasos de optimizador por modelo. Se publica en formato openpi oficial con pesos EMA en bfloat16 y las estadísticas de normalización de `pi05_droid_jointpos`, junto con un checkpoint intermedio (round 60) y el YAML de configuración del *run*.

La arquitectura subyacente es π0.5, un modelo de política robótica de tipo vision-language-action (VLA) con un *action expert* especializado; el tamaño total de parámetros no se detalla en la información disponible. El repositorio ocupa 10,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi JAX), VLA con *action expert*; fine-tune completo desde `pi05_base` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción: 16 pasos; *chunk* servido: 15 × 8) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (instrucciones en inglés según los verbos place/take/stack del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint openpi (JAX), bfloat16, pesos EMA, con `assets/droid` norm stats |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` y se entrena con la receta `pi05_full_droid_finetune` de openpi: horizonte 16, AdamW con lr 5e-5 tras *warmup* de 1.000 pasos, *gradient clipping* 1.0, EMA 0.99 y las estadísticas de normalización de posiciones articulares de `pi05_droid_jointpos`. La arquitectura es la de π0.5, un transformer VLA con un *action expert* dedicado que genera acciones de posición articular a partir de imágenes, propiocepción e instrucción textual. El entrenamiento se realizó con la infraestructura decent-vla sobre el split *site8* de DROID 1.0.1: 8 clientes, cada uno correspondiente a una celda "building label × collector" (RAIL, BAIR, TRI, EVGR C, Penn Levine 457, Autolab, Gates, BWW), con episodios exitosos cuya instrucción empieza por un verbo place/take/stack, hasta 1.500 por sitio, con un 10 % retenido. El conjunto resultante son 8.723 episodios de entrenamiento y 1.724.640 fotogramas tras el filtro de inactividad de openpi (entre 573 y 1.350 episodios por cliente).

La innovación técnica del *run* es la combinación de FedAvg con un *action bank*: a partir de la ronda 2, cada paso local de un cliente entrena además con 16 ventanas de acción liberadas por los otros 7 sitios (acciones de posición articular, propiocepción e instrucción, sin imágenes), con peso 1.0, y el gradiente de ese término llega únicamente al *action expert* de π0.5. Por ello el modelo ve 1,5 veces las muestras del *run* FedAvg puro (6,4 M propias + 3,2 M ventanas del banco). El presupuesto es de 100 rondas × 250 pasos, con batch de cliente 32 y batch centralizado 256; los 8 clientes se ejecutaron como dos procesos en dos nodos (4 clientes cada uno) y se fusionaron cada ronda en la media ponderada por fotogramas de los dos agregados, equivalente al agregado FedAvg de 8 clientes salvo redondeo en coma flotante. El entrenamiento usó nodos con cuatro tarjetas de 96 GB.

## Capacidades

- Control visuomotor robótico: genera *chunks* de 15 acciones de 8 dimensiones (posición articular) a partir de imágenes, propiocepción e instrucción.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (verbos place, take, stack).
- Ejecución multi-tarea dentro del dominio DROID (un solo modelo para tareas heterogéneas de varios laboratorios).
- Aprendizaje federado: el checkpoint está diseñado para integrarse en el flujo decent-vla y en el servidor openpi.
- Servicio compatible con RoboLab: una petición devuelve un *chunk* de acciones `(15, 8)`.
- No se documentan capacidades de *tool calling*, agentes, matemáticas, visión general, audio ni *thinking mode*.

## Casos de uso

- Manipulación robótica en laboratorio: servir el checkpoint con `scripts/serve_policy.py` en el puerto 8000 y enviar observaciones (imágenes, propiocepción, instrucción) para obtener acciones articulares en tiempo de ejecución.
- Investigación en aprendizaje federado: usar los checkpoints de las rondas 60 y 100 para comparar la convergencia de FedAvg con *action bank* frente a FedAvg puro en el benchmark RoboLab-120.
- Estudio de *cotraining* entre sitios: analizar cómo el término de banco de acciones (3,2 M ventanas sin imágenes) afecta al *action expert* sin compartir píxeles entre clientes.
- Reproducción de experimentos: el YAML de configuración y los checkpoints en formato openpi permiten reejecutar el *run* con la receta `pi05_full_droid_finetune`.
- Base para *fine-tuning* en un nuevo sitio: al ser un fine-tune completo de π0.5 sobre DROID, sirve como punto de partida para adaptar la política a un robot o laboratorio adicional.
- Evaluación de robustez multi-sitio: al entrenarse sobre 8 celdas distintas de DROID, permite medir la generalización entre configuraciones de recogida de datos y etiquetas de edificio.
- Integración en pipelines de RoboLab: el formato de salida `(15, 8)` encaja directamente en el servidor openpi de RoboLab sin cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la pérdida de entrenamiento no se reporta como resultado y que la métrica de referencia es la tasa de éxito en RoboLab-120, pero no se incluyen sus valores.

## Requisitos de hardware

- Entrenamiento: nodos con cuatro GPU de 96 GB (según la model card), con batch acumulado en slices de 16 (cliente) y 128 (centralizado).
- VRAM de inferencia: no disponible; el repositorio pesa 10,5 GB en bfloat16, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más el *overhead* del runtime JAX.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del checkpoint, GPU de datacenter con 80-96 GB (A100/H100) son el entorno natural, aunque no se confirma compatibilidad con GPU de consumo.
- Despliegue: servidor openpi (`scripts/serve_policy.py`) con `--policy.config=pi05_droid_jointpos`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `droid_site8_pi05_accord_cotrain_w100_expert` | no disponible | no disponible (horizonte 16) | no disponible (métrica RoboLab-120 sin publicar) | Apache 2.0 | Hugging Face, 0 descargas |
| `pi05_base` (openpi) | no disponible | no disponible | no disponible | no disponible en la información | Referenciado como base del fine-tune |
| `pi05_droid_jointpos` (openpi) | no disponible | no disponible | no disponible | no disponible en la información | Referenciado por sus norm stats |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con episodios de DROID cuyo verbo inicial es place, take o stack; fuera de ese conjunto de tareas el comportamiento no está caracterizado.
- Sin datos de evaluación publicados: la model card no reporta la tasa de éxito en RoboLab-120, por lo que no se puede verificar el rendimiento real del checkpoint.
- Dependencia de openpi/JAX: requiere el *stack* openpi y las estadísticas de normalización `assets/droid`; no es un checkpoint genérico de transformers.
- Sin imágenes en el banco de acciones: el término de *cotraining* solo aporta acciones, propiocepción e instrucción de otros sitios, lo que limita la diversidad visual vista durante el entrenamiento.
- Riesgo de sobreajuste a las 8 celdas de DROID incluidas; la generalización a otros edificios o colectores no está demostrada.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés.
- Sesgos: no se documentan análisis de sesgo; al ser un modelo de control robótico, los sesgos se manifiestan como fallos de política en configuraciones no vistas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base π0.5 y los datos DROID pueden tener condiciones propias que no se detallan en la model card.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/droid_site8_pi05_accord_cotrain_w100_expert
- Configuración del *run*: `openpi_pi05_droid_site8_accord_cotrain_w100_expert_gh200.yaml` (incluido en el repositorio)
- Checkpoint intermedio: `openpi_r060/` (incluido en el repositorio)
- openpi (Physical Intelligence): no disponible en la información proporcionada
- Dataset DROID 1.0.1: no disponible en la información proporcionada
- Benchmark RoboLab-120: no disponible en la información proporcionada
