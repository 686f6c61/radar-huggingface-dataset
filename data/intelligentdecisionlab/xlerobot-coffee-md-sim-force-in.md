# IntelligentDecisionLab/xlerobot-coffee-md-sim-force-in

## Resumen

`xlerobot-coffee-md-sim-force-in` es un repositorio que agrupa doce políticas de robótica entrenadas con LeRobot para la tarea de "Coffee Automata" (preparación automática de café) en entorno de simulación. Lo publica IntelligentDecisionLab como parte de una reorganización taxonómica experimental (v2) que hace explícitos todos los ejes de variación de los experimentos: arquitectura, número de cámaras, plataforma robótica, fuente de fuerza y pasos de entrenamiento. El nombre del repositorio indica que la fuerza estimada se usa como entrada del modelo (`force-in`), a diferencia de otros repos que la usan como término de pérdida auxiliar.

Cada "leaf" (subcarpeta) contiene los pesos de un experto ACT (Action Chunking Transformer) entrenado durante 100.000 pasos sobre datos simulados, con dos variantes de plataforma: XLeRobot de 17 grados de libertad y SO-101 de 6 grados de libertad. La fuerza se incorpora como señal estimada (9 o 24 dimensiones, según la hoja). El repositorio pesa 12,4 GB y está etiquetado como `robotics`, `lerobot` y `coffee-automata`. Es un trabajo claramente provisional: la propia model card advierte que la gramática de nombres aún no ha sido ratificada y que los repos legacy siguen siendo la referencia autoritativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT (Action Chunking Transformer), implementada en la libreria LeRobot. ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones de camara y, en este caso, de senales de fuerza estimada. El entrenamiento se realizo sobre datos de simulacion para la cadena de tareas de una maquina de cafe automatica, con 100.000 pasos por hoja. La informacion disponible no detalla la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO (no procede en robotica). La innovacion principal de este repositorio es taxonomica: separa explicitamente la fuente de la fuerza (estimada, `est9` o `est24`) de su uso en el modelo (entrada, `in`, o perdida auxiliar, `loss`). No se mencionan otras innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Ejecucion de subtareas de manipulacion robotica en simulacion: colocar una taza, pulsar un boton, mover una taza a una bandeja y trasladar la bandeja a una mesa.
- Control de dos plataformas roboticas: XLeRobot de 17 grados de libertad y SO-101 de 6 grados de libertad.
- Uso de senales de fuerza estimada como entrada adicional a las observaciones visuales (una camara).
- Integracion con el ecosistema LeRobot: los pesos pueden cargarse con `ACTPolicy.from_pretrained` tras descargar la subcarpeta correspondiente.
- No incluye capacidades de lenguaje, vision generalista, tool calling ni razonamiento simbolico; es un modelo de politica motora puro.

## Casos de uso

- Automatizacion de maquinas de cafe en entornos simulados: el modelo puede ejecutar la secuencia completa de preparacion (colocar taza, pulsar boton, mover bandeja) en un simulador, sirviendo como banco de pruebas para algoritmos de manipulacion.
- Investigacion en aprendizaje por imitacion con realimentacion de fuerza: al usar fuerza estimada como entrada, permite estudiar si esta senal mejora la precision de tareas de contacto, comparando con repositorios hermanos que usan la fuerza solo en la perdida.
- Desarrollo de politicas transferibles a robots reales: aunque entrenado en simulacion, los pesos pueden servir como inicializacion para fine-tuning en el robot fisico XLeRobot o SO-101, reduciendo el tiempo de entrenamiento real.
- Benchmarking de arquitecturas ACT: las doce hojas cubren dos plataformas y varias subtareas, lo que permite comparar el rendimiento de ACT en diferentes configuraciones de grados de libertad y fuentes de fuerza.
- Validacion de taxonomias de nombres para repositorios de robotica: el propio repositorio es un experimento de organizacion de metadatos, util para equipos que gestionan muchos experimentos y necesitan nombres autoexplicativos.
- Reproduccion de experimentos publicados: al estar disponible en HuggingFace con pesos safetensors, otros investigadores pueden reproducir los resultados de la cadena Coffee Automata sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de robotica como tasa de exito por subtarea. La model card no incluye tablas de rendimiento ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de datos concretos de VRAM, latencia o throughput en la informacion proporcionada.
- Al ser un modelo ACT de tamano no especificado, la inferencia requiere una GPU con al menos 8-12 GB de VRAM para cargar los pesos en precision completa (el repositorio pesa 12,4 GB en total, pero cada hoja es un subconjunto).
- Para ejecutar la politica en un robot real se necesita ademas el hardware robotico correspondiente (XLeRobot o SO-101) y un entorno de control en tiempo real.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia; tambien es posible exportar los pesos a otros formatos, aunque no se documenta en este repositorio.
- No se mencionan requisitos especificos de GPU (A100, H100, RTX 4090, etc.) ni configuraciones de vLLM, llama.cpp u Ollama, que no aplican a modelos de robotica.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de robotica para Coffee Automata). El propio repositorio menciona repositorios hermanos como `xlerobot-coffee-model-sim-a-vision-pos` (metodo A: vision + posicion) y `xlerobot-coffee-model-sim-b-force` (metodo B: fuerza), pero no se proporcionan datos de rendimiento para comparar. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Estado provisional: la gramatica de nombres no ha sido ratificada; los nombres de hojas y repositorios pueden cambiar. No se deben citar estas rutas en publicaciones sin verificar que la gramatica ha sido aprobada.
- Entrenado solo en simulacion: no hay evidencia de transferencia a entornos reales; el rendimiento en el robot fisico puede degradarse significativamente.
- Licencia no especificada: no se indica si el uso comercial esta permitido; hay que contactar con el autor antes de usar los pesos en produccion.
- Sin benchmarks publicados: no se puede evaluar la calidad relativa del modelo frente a otras politicas.
- Dependencia de senales de fuerza estimada: si el estimador de fuerza no esta disponible en el entorno de despliegue, el modelo no funcionara correctamente.
- Los repos legacy siguen siendo autoritativos: este repositorio es una copia reorganizada; cualquier discrepancia debe resolverse a favor de los repos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-md-sim-force-in
- Repositorio hermano (metodo A, vision + posicion): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-a-vision-pos
- Repositorio hermano (metodo B, fuerza): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-sim-b-force (referenciado en la model card, sin URL directa)
- Repositorio de robotica XLeRobot: https://github.com/Vector-Wangel/XLeRobot
- Documentacion de XLeRobot: https://xlerobot.readthedocs.io/en/latest/
- Repositorio xlerobot de OneRobotAI: https://github.com/OneRobotAI/xlerobot
