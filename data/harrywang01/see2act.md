# harrywang01/See2Act

## Resumen

See2Act es un conjunto de checkpoints de políticas robóticas de imitación entrenadas con el método descrito en el artículo "Learning to See While Learning to Act: Diffusion Models for Active Perception in Robot Imitation", firmado por Kuancheng Wang, Vaibhav Saxena, Shuo Cheng, Yotto Koga y Danfei Xu (arXiv:2606.23625). No es un modelo de lenguaje: es una política de difusión para control robótico que, de forma conjunta, decide dónde mirar y qué acción ejecutar. En cada paso de denoising, la política mueve la cámara a una pose calculada a partir de la estimación de acción actual, renderiza la escena desde esa vista y condiciona el siguiente paso en esa imagen.

El repositorio publicado por el usuario harrywang01 contiene cuatro ficheros `.pth`, uno por cada tarea ocluida del benchmark Ravens utilizada en el paper: `place-red-in-green`, `bin-picking`, `put-within-shelf` y `bin-search`. Cada checkpoint almacena tanto los pesos de la red como la configuración completa (arquitectura, planificación de cámara y protocolo de inferencia), de modo que se carga sin necesidad de pasar flags adicionales. Los entrenamientos usaron 100 demostraciones scriptadas por tarea procedentes del dataset See2Act.

Su relevancia actual reside en la percepción activa: en lugar de depender de una cámara fija o de un punto de vista humano predefinido, el modelo aprende a reposicionar el sensor para desambiguar escenas con oclusiones. El repositorio tiene 1,1 GB, licencia MIT y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) con percepción activa; el paso de denoising condiciona la acción sobre una vista renderizada desde una pose de cámara derivada de la estimación de acción actual |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el condicionamiento es visual y de estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoints de PyTorch con pesos y configuración embebida) |
| Pipeline declarado | robotics |
| Tareas cubiertas | place-red-in-green, bin-picking, put-within-shelf, bin-search |
| Libreria | PyTorch |
| Tamano del repositorio | 1,1 GB |
| Simulador | PyBullet con el plugin de render EGL |
| Idioma de la documentacion | ingles |

## Arquitectura y entrenamiento

La política pertenece a la familia de las diffusion policies aplicadas a imitación robótica, pero incorpora un bucle de percepción activa: el modelo no consume una observación fija, sino que en cada paso de denoising calcula una pose de cámara a partir de la estimación actual de la acción, renderiza la escena desde esa pose y usa esa nueva vista como condición para el paso siguiente. De este modo, la selección del punto de vista y la predicción de la acción se refinan mutuamente dentro del mismo proceso generativo. La model card no detalla el número de parámetros, la composición exacta de la red ni el tipo de backbone visual empleado.

El entrenamiento se realizó sobre las cuatro tareas ocluidas del benchmark Ravens citadas en el artículo, con 100 demostraciones scriptadas por tarea provenientes del dataset See2Act, y con la configuración `configs/see2act.json` del repositorio de código. No se indica en la información disponible si hubo fases de RLHF, DPO u optimización por preferencias, algo por otro lado poco habitual en políticas de imitación. El protocolo de inferencia queda almacenado dentro de cada checkpoint: tres de las tareas usan una única pasada de refinamiento con T = 50 pasos, mientras que `bin-search` usa 10 pasadas de refinamiento con T = 20 pasos y selección mediante `final_action_variance`. También se proporcionan sumas de comprobación MD5 para verificar la integridad de los cuatro ficheros.

## Capacidades

- Control robótico por imitación en tareas de manipulación con oclusiones: colocación de objetos, picking en contenedores, inserción en estanterías y búsqueda en contenedores.
- Percepción activa: reposicionamiento de la cámara dentro del bucle de denoising para obtener vistas informativas antes de comprometer una acción.
- Generación de acciones multimodales mediante difusión, con selección de la acción final por varianza cuando el protocolo lo requiere (`bin-search`).
- Ejecución multi-paso dentro de un episodio, con refinamiento iterativo de la trayectoria.
- Evaluación determinista reproducible: los episodios de evaluación usan semillas fijas (200001, 200003, ...).
- Visualización de las vistas generadas por la política (`scripts/visualize_episode.py`, salida a PNG y GIF).
- No se documentan capacidades de tool calling, function calling, agentes basados en lenguaje, generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en imitación robótica: reproducir los resultados del paper evaluando los cuatro checkpoints sobre las tareas ocluidas de Ravens mediante `scripts/evaluate.py --n_episodes 50`, lo que permite comparar variantes del método bajo un protocolo fijo.
- Manipulación con oclusión en entornos industriales simulados: usar `bin-picking` para políticas que deben elegir la pose de cámara antes de agarrar una pieza parcialmente oculta en un contenedor.
- Búsqueda activa de objetos: emplear `bin-search`, con sus 10 pasadas de refinamiento y selección por `final_action_variance`, en escenarios donde el objeto no es visible desde un único punto de vista inicial.
- Colocación precisa de objetos: aplicar `place-red-in-green` en tareas de pick-and-place que requieren alineación fina y comprobación visual de la posición final.
- Inserción en espacios restringidos: usar `put-within-shelf` para practicar colocaciones dentro de estanterías donde la geometría del entorno limita la visibilidad.
- Generación de demostraciones aumentadas: dado que la política produce trayectorias de acción y vistas de cámara asociadas, puede emplearse para generar datos sintéticos de percepción activa en simulación.
- Estudio de planificación de cámara: el bucle de refinamiento permite analizar qué poses de cámara elige el modelo en cada paso de denoising, útil para investigación en percepción activa.
- Docencia y prototipado en robótica: al ser checkpoints autocontenidos con configuración embebida, sirven como punto de partida reproducible para cursos o proyectos que trabajen con PyBullet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe las cuatro tareas evaluadas, el número de demostraciones de entrenamiento (100 por tarea) y el protocolo de inferencia almacenado en cada checkpoint (pasadas de refinamiento y número de pasos de difusión); no incluye tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no especifica el tamaño del modelo ni el consumo de memoria.
- GPU recomendadas: no disponible. No se documenta ningún modelo de GPU concreto.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse a partir de la información proporcionada.
- Requisito de renderizado: la evaluación depende del plugin EGL de PyBullet, por lo que se necesita un entorno con soporte de renderizado offscreen (habitualmente GPU o drivers EGL configurados correctamente).
- Opciones de despliegue: el flujo soportado es PyTorch con el repositorio `github.com/KuanchengWang/see2act`; la descarga de checkpoints se realiza vía `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. Los únicos parámetros temporales conocidos son los pasos de difusión por pasada (T = 50 o T = 20) y el número de pasadas de refinamiento (1 o 10), lo que da una indicación relativa del coste computacional entre tareas, pero no cifras absolutas.
- Almacenamiento: el repositorio ocupa 1,1 GB en total para los cuatro checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| See2Act (harrywang01/See2Act) | no disponible | no aplica | no disponible (sin benchmarks publicados en la informacion disponible) | MIT | HuggingFace, checkpoints `.pth` |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos verificables de otras políticas de difusión para imitación robótica (por ejemplo, variantes de diffusion policy o métodos de percepción activa), por lo que no es posible establecer una comparación numérica rigurosa. La comparación relevante debería hacerse contra las líneas base del propio artículo arXiv:2606.23625, cuyos resultados no se reproducen en la model card.

## Limitaciones y advertencias

- Ámbito restringido: los checkpoints solo cubren cuatro tareas concretas de Ravens (`place-red-in-green`, `bin-picking`, `put-within-shelf`, `bin-search`); no son políticas generalistas.
- Dependencia del simulador: las políticas esperan el renderizador de PyBullet con EGL. Su uso fuera de ese entorno, o con un renderizador distinto, puede invalidar el comportamiento aprendido.
- Entrenamiento con demostraciones scriptadas: 100 demostraciones por tarea, lo que limita la diversidad de la distribución de entrenamiento y aumenta el riesgo de fallo ante variaciones no vistas.
- Sin resultados de benchmarks publicados en la información disponible: no hay tasas de éxito que permitan estimar la fiabilidad en producción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el fenómeno análogo de generar trayectorias o poses de cámara inconsistentes con la escena cuando la estimación de acción se desvía.
- Sesgos conocidos: no documentados en la información proporcionada; en robótica simulada los sesgos típicos provienen de la distribución del script de demostración y de las condiciones de iluminación y geometría del simulador.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los materiales derivados (dataset See2Act, código del repositorio y simulador PyBullet) antes de un despliegue comercial.
- Uso en producción: al tratarse de políticas entrenadas en simulación y sin cifras de rendimiento publicadas, se requiere una validación exhaustiva y, previsiblemente, ajuste fino antes de transferirlas a un robot real.
- Integridad de los artefactos: la model card proporciona hashes MD5 de los cuatro ficheros; conviene verificarlos tras la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harrywang01/See2Act
- Dataset See2Act: https://huggingface.co/datasets/harrywang01/See2Act
- Repositorio de código: https://github.com/KuanchengWang/see2act
- Paper (arXiv:2606.23625): https://arxiv.org/abs/2606.23625
- Configuración de entrenamiento: `configs/see2act.json` en el repositorio de código
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (corresponden a páginas de la CAF francesa) y no se ha utilizado ninguno de ellos como fuente.
