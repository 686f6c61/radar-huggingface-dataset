# microduckapp/microduck-brake-failure

## Resumen

`microduck-brake-failure` es una politica de control motriz (un "move") para el robot bipedo MicroDuck, publicada por el usuario `microduckapp` en HuggingFace. No es un modelo de lenguaje ni un modelo fundacional: es una red neuronal de politica exportada a ONNX que, a partir de un vector de 61 observaciones, emite 14 consignas articulares a 50 Hz. El move completo dura 10,4 segundos, lo que equivale a unos 520 pasos de control. La model card lo describe como una animacion expresiva: el robot "corre en circulo a maxima velocidad" buscando como frenar.

El interes practico esta en el formato de distribucion, no en el tamano: un unico `policy.onnx` acompanado de un `manifest.json` que declara dependencias de instalacion y reproduccion. Es el patron tipico de despliegue de politicas de reinforcement learning en robotica de bajo coste, donde la inferencia se ejecuta en el propio robot dentro del presupuesto de 20 ms que impone el bucle de control a 50 Hz.

El repositorio es minimo: 0 descargas, 0 likes, sin licencia declarada, sin idiomas, sin resultados de benchmarks y con el tamano redondeado a 0,0 GB, lo que sugiere un artefacto de pocos kilobytes o megabytes. Cualquier uso en produccion exige auditar el `manifest.json` y verificar la compatibilidad con la cadencia y el numero de actuadores del MicroDuck (la prensa especializada cita 15 motores, frente a las 14 salidas de esta politica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (policy) exportada a ONNX; la topologia interna de capas no esta documentada |
| Parametros totales | no disponible (el repositorio se redondea a 0,0 GB; el numero de parametros no se declara) |
| Longitud de contexto | no aplica: politica de control reactiva; vector de observacion de 61 valores por paso, sin memoria de contexto declarada |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx` sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica: el modelo no procesa lenguaje natural |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas / salidas | 61 observaciones de entrada; 14 consignas articulares de salida |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duracion del move | 10,4 s (~520 pasos de control) |
| Parametros activos | no aplica (no es un modelo MoE) |

## Arquitectura y entrenamiento

La informacion disponible describe una politica neuronal serializada en ONNX que mapea observaciones del robot a consignas de articulaciones. No se especifica el numero de capas, el tipo de activacion, si la salida es una posicion objetivo, un incremento o un par, ni si la politica incorpora historial (por ejemplo, concatenacion de observaciones previas). El fichero `manifest.json` se define como la declaracion de "lo que el pato necesita para instalar y reproducir" el move, es decir, una capa de metadatos de despliegue (dependencias, versionado, condiciones de reproduccion) mas que una descripcion del entrenamiento.

No hay datos publicados sobre el numero de tokens o muestras, la composicion del dataset, el simulador empleado ni si hubo ajuste fino con RLHF/DPO (categorias, por otra parte, poco aplicables a una politica de control). El ecosistema MicroDuck, impulsado por Pollen Robotics y Hugging Face, se presenta publicamente como una plataforma de robot bipedo de 25 cm con 15 motores, camara, sensor de profundidad, dos sensores de movimiento y pico articulado, entrenada con reinforcement learning en simulacion; sin embargo, esta ficha no puede atribuir a esta politica concreta ningun detalle de ese pipeline de entrenamiento. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, destilacion de politica, etc.), algo esperable en un artefacto de este tipo.

## Capacidades

- Generacion de movimiento articular: produce 14 consignas de articulacion por paso a partir de 61 observaciones, a 50 Hz.
- Ejecucion de una animacion de 10,4 s con comportamiento descrito como carrera en circulo a velocidad maxima con giro de cabeza.
- Reproduccion determinista de un move pregrabado como politica, no como secuencia de keyframes.
- Despliegue en runtime ONNX, lo que permite inferencia en CPU sin dependencias de framework de deep learning.
- Instalacion guiada por metadatos mediante `manifest.json`.
- Inspeccion visual previa mediante `media/preview.mp4`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion.
- No soporta lenguaje natural, vision, audio ni modo "thinking": el vector de observacion podria incluir senales de sensores, pero su composicion no esta documentada.
- No se declaran capacidades multilingues.

## Casos de uso

- Demostraciones de robotica en ferias y eventos: el move sirve como animacion corta y llamativa (10,4 s) para exhibir la fluidez del controlador del MicroDuck ante publico no tecnico, sin necesidad de guionizar keyframes manualmente.
- Prueba de humo del pipeline de despliegue: al ser un ONNX con entradas y salidas acotadas (61/14) y una frecuencia fija de 50 Hz, permite validar de extremo a extremo el runtime de inferencia del robot, la carga del `manifest.json` y el mapeo de indices de articulacion antes de instalar politicas criticas de locomocion.
- Docencia de reinforcement learning aplicado: uso como ejemplo real de artefacto "politica entrenada + exportada a ONNX" en asignaturas o talleres, para discutir el salto de simulacion a robot y el empaquetado de modelos.
- Investigacion en interaccion humano-robot: una animacion expresiva y autoexplicativa ("frenos que fallan") es util como estimulo controlado en estudios de percepcion de intencionalidad o de seguridad percibida en robots bipedos.
- Recoleccion de datos para imitacion: reproducir el move de forma repetible permite grabar trayectorias y observaciones etiquetadas con estado conocido, utiles como datos de referencia para aprendizaje por imitacion o para comparar con politicas propias.
- Pruebas de estres del hardware: una carrera circular a maxima velocidad durante 10,4 s expone el robot a esfuerzos sostenidos en actuadores y a demandas de corriente pico, lo que resulta apropiado para validar limites termicos y de bateria en banco de pruebas.
- Baseline en experimentos de sim-to-real: sirve como referencia de comportamiento a replicar en simulador para medir la brecha entre la politica desplegada y su version simulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de metricas de robotica (error de seguimiento, tasa de exito, consumo energetico, robustez ante perturbaciones) asociados a este repositorio.

| Metrica | Valor |
|---|---|
| Benchmarks de lenguaje o codigo | no aplica |
| Metricas de control (error de tracking, tasa de exito) | no disponible |
| Latencia de inferencia medida | no disponible (el diseno a 50 Hz implica un presupuesto de 20 ms por paso) |
| Duracion y cadencia del move | 10,4 s a 50 Hz (~520 pasos) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Requisitos de hardware

- VRAM para inferencia: 0 GB en GPU; la politica esta pensada para ejecutarse en CPU mediante ONNX Runtime. El tamano del repositorio se redondea a 0,0 GB, por lo que el fichero de pesos es de kilobytes o pocos megabytes.
- GPU recomendadas: no aplica para inferencia. Las guias del ecosistema MicroDuck mencionan runs de entrenamiento con CUDA, pero eso corresponde al entrenamiento, no a la ejecucion de este move.
- GPU de consumo: no es necesaria ninguna; cabe en el computo embebido del robot. No se especifica en la informacion disponible que SoC o placa monta el MicroDuck.
- Opciones de despliegue: ONNX Runtime (Python, C++, C o bindings moviles); el `manifest.json` actua como descriptor de instalacion para la app MicroDuck. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no medidos. El requisito derivado es completar la inferencia en menos de 20 ms por paso para sostener los 50 Hz; cualquier incumplimiento introduce jitter en el bucle de control.
- Almacenamiento: despreciable; el peso relevante es el video de previsualizacion, no el modelo.

## Comparativa con modelos similares

No se dispone de datos publicos de otras politicas comparables (parametros, metricas, licencia) en la informacion proporcionada. La comparacion se limita a enfoques alternativos para producir el mismo tipo de animacion en un robot bipedo.

| Alternativa | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-brake-failure` (esta ficha) | no disponible (repo ~0,0 GB) | 61 observaciones por paso, sin contexto declarado | no disponible | no disponible | publica en HuggingFace, 0 descargas |
| Otros moves de `microduckapp` | no disponible | no disponible | no disponible | no disponible | no verificados en la informacion disponible |
| Animacion por keyframes con cinematica inversa | no aplica (codigo, sin pesos) | trayectorias definidas a mano | determinista por diseno, sin adaptacion al estado | depende del proyecto | ubicua en frameworks de robotica |
| Controlador ritmico tipo CPG | no aplica o decenas de parametros | estado articular y temporizadores internos | robusto en locomotion periodica, pobre en movimientos no ritmicos | depende del proyecto | librerias open source disponibles |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay cesion de derechos para uso comercial ni para redistribucion; hay que contactar con el autor antes de integrarlo en un producto.
- Ausencia total de documentacion de entrenamiento: no se conoce el simulador, la distribucion de observaciones, el dominio de validez ni el rango de condiciones (pendiente, friccion, carga) en el que el move se comporta como se espera.
- Reproducibilidad no verificable: el repositorio se creo y actualizo con cuatro segundos de diferencia, sin versionado ni historial de cambios, y con cero descargas, por lo que no hay evidencia externa de que el artefacto funcione en hardware real.
- Posible desajuste dimensional: la politica emite 14 consignas mientras que las fuentes publicas describen 15 motores en el MicroDuck; es imprescindible comprobar el mapeo de indices articulares antes de ejecutarla.
- Riesgo para el hardware: un movimiento descrito como "carrera a maxima velocidad" sostenido durante 10,4 s puede someter a los actuadores a corriente pico y calentamiento; conviene probarlo con el robot suspendido o con limites de par.
- Comportamiento no reactivo a seguridad: no se documenta ninguna logica de parada, deteccion de caida ni recuperacion; en un robot bipedo esto implica riesgo de dano material en el propio robot y en el entorno.
- El nombre del move ("fallo de frenos") describe una animacion, no una funcionalidad: no debe interpretarse como una politica de frenado o de seguridad.
- Sin capacidades de lenguaje, vision ni agenticas: cualquier expectativa de procesamiento semantico o de percepcion es infundada, aunque el robot incorpore camara y sensor de profundidad.
- Sin sesgos linguisticos aplicables, pero si posible sesgo de sim-to-real: el comportamiento puede degradarse fuera de las condiciones de entrenamiento, que se desconocen.
- Alucinacion en el sentido generativo no aplica; el fallo equivalente es la divergencia de la politica (oscilacion o perdida de equilibrio) ante observaciones fuera de distribucion.

## Enlaces

- [HuggingFace: microduckapp/microduck-brake-failure](https://huggingface.co/microduckapp/microduck-brake-failure)
- [GitHub: pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [GitHub: microduck-ai](https://github.com/microduck-ai/)
- [MicroDuck Guides: simulacion, politicas y entrenamiento](https://microduckrobot.org/guides/)
- [TechRepublic: Nvidia teaches a $399 duck robot to walk using AI](https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/)
- [CNX Software: Microduck, robot bipedo tipo pato para experimentacion en IA fisica](https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/)
