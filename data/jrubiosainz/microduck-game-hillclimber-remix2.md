# jrubiosainz/microduck-game-hillclimber-remix2

## Resumen

microduck-game-hillclimber-remix2 es una política de control para robot cuadrúpedo publicada por el usuario jrubiosainz en HuggingFace, pensada exclusivamente para la prueba de subida de colina de 1,5 m de la Microduck Arena (Pollen Robotics). No es un modelo de lenguaje ni un modelo de propósito general: es un grafo ONNX de 831.318 bytes que implementa un controlador reactivo con 61 entradas de observación y 14 salidas de acción articular, ejecutado en el simulador MuJoCo 3.10.0 sobre CPU x86-64.

Técnicamente es una remezcla de juicenv/microduck-hill-es8 (revisión `f68d9094`): la red neuronal original se mantiene congelada, con sus 197.774 pesos y sesgos bit a bit idénticos, y se envuelve en un contador de pasos que añade desfases dependientes del tiempo a los objetivos articulares y a la velocidad de avance que la red lee. Esos desfases (198 valores de nudo, 22 nudos × 9 canales) se buscaron con CMA-ES sobre las cinco semillas oficiales del evento, dando 0,780 s de media frente a los 0,792 s de la política de origen.

Su relevancia es acotada y muy específica: sirve como ejemplo de metaoptimización evolutiva sobre una política congelada y como entrada de competición en un banco de pruebas de locomoción. El propio autor advierte de que los resultados son in-sample, de que no se ha probado en hardware real y de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (grafos ONNX con operadores estándar); contador de pasos y tablas de desfase envolviendo la red original congelada |
| Parametros totales | 197.774 pesos y sesgos (idénticos a los del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es un vector de observación `obs` de forma [1, 61]. No es un modelo de lenguaje |
| Tipos de cuantizacion | No disponible (se distribuye el grafo ONNX en la precisión original) |
| Idiomas soportados | No disponible / no aplica |
| Licencia | No disponible (el repositorio fuente tampoco declara licencia) |
| Formato de pesos | ONNX (`policy.onnx`), salida `actions` [1, 14] |

## Arquitectura y entrenamiento

La política original es una red de control para un robot cuadrúpedo MicroDuck, entrenada mediante estrategias evolutivas sobre el scorer de colina de la Arena. Esta remezcla no reentrena la red: la congela y la envuelve en un grafo ONNX ampliado que añade tres elementos con operadores ONNX estándar. Primero, un contador de pasos que redondea el objetivo de `head_pitch` a 1/256 rad y le suma el número de pasos de control ejecutados en unidades de 1/65536 rad; como la Arena realimenta a cada política su acción previa, el paso siguiente lee el contador k de forma exacta (k = 25 + paso de carrera, saturando en 127), con un desplazamiento máximo del objetivo de `head_pitch` de aproximadamente 0,004 rad. Segundo, un desfase de consigna `c_k` sumado a los valores de comando que lee la red (0,3 m/s de avance, cero lateral y cero guiñada): aplica un desfase de velocidad de avance entre -0,256 y +0,179 m/s desde el paso de contador 26 en adelante, y cero antes. Tercero, un desfase articular `o_k` sumado a los objetivos articulares de la red desde el paso 26, con offsets simétricos y antisimétricos en hip pitch, rodilla y tobillo de ambas patas, más cuello y head pitch, de hasta 0,39 rad, y cero en head_roll, head_yaw, left_hip_roll, left_hip_yaw, right_hip_roll y right_hip_yaw.

Ambas tablas son piecewise lineales en k con nudos cada 2 pasos desde 26 hasta 68 (aproximadamente 0,86 s dentro de la carrera) y se mantienen constantes tras el último nudo. Sus 198 valores de nudo se buscaron con CMA-ES (población 24, paso inicial 0,02) maximizando el tiempo de carrera sobre las cinco semillas oficiales, dentro del runner de la Arena (MuJoCo 3.10.0, CPU x86-64) y con la red congelada; se trata de la generación 1.521 de la ejecución `dive_hill_es8a`. Un candidato solo se conservaba si superaba la marca del modelo fuente y, reejecutado 8 veces con ruido σ = 10⁻⁷ en todas las observaciones salvo el contador de pasos, terminaba todas las semillas cada vez con una media por debajo de la del origen (0,780 s en todos los casos). El fichero reconstruido a partir del modelo fuente y las tablas de la búsqueda es idéntico al publicado. La velocidad de carrera es la del origen: 0,3 m/s de avance. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias, por tratarse de un dominio de control motor.

## Capacidades

- Generación de marcha perpetua para un MicroDuck simulado en la prueba de subida de colina de 1,5 m.
- Control reactivo a partir de un vector de observación de 61 dimensiones, con salida de 14 acciones articulares.
- Seguimiento de una consigna constante de 0,3 m/s de avance, con consigna lateral y de guiñada nulas.
- Adaptación temporal de la marcha mediante un contador de pasos interno, con desfases programados por tramos lineales.
- Robustez verificada frente a perturbaciones de observación de σ = 10⁻⁷ (todas las observaciones salvo el contador de pasos) en 8 repeticiones sobre cada semilla oficial.
- Ejecución determinista en el runner de la Arena sobre MuJoCo 3.10.0 en CPU x86-64.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con aprendizaje por refuerzo: sirve como política de referencia con tiempo de carrera medido (0,780 s) para comparar variantes de entrenamiento o de búsqueda evolutiva en el mismo banco de pruebas.
- Metaoptimización evolutiva sobre políticas congeladas: el método documentado (envolver una red fija en tablas de desfase buscadas con CMA-ES) es directamente replicable sobre otras políticas congeladas con pocos parámetros ajustables (198 nudos).
- Punto de partida para fine-tuning: al ser una finetune declarada de juicenv/microduck-hill-es8, puede usarse como inicialización en búsquedas posteriores sobre el mismo scorer de colina.
- Docencia en robótica y simulación: el tamaño reducido del grafo (831.318 bytes) y su ejecución en CPU permiten reproducir la carrera completa en un equipo de aula sin GPU.
- Validación de runners y entornos de evaluación: permite comprobar la reproducibilidad de un runner MuJoCo (realimentación de la acción previa, orden de semillas, paso de control de 0,02 s) frente a los tiempos publicados.
- Estudio de sobreajuste a semillas: los tiempos por semilla (0,78 s en las cinco) y la advertencia de que la búsqueda puntuó sobre esas mismas semillas lo convierten en un caso útil para ilustrar sesgo in-sample en evaluación de controladores.
- Pruebas de integración de formato: sirve para validar cargadores de `manifest.json` (esquema 2 de Pollen) y de grafos ONNX con entradas [1, 61] y salidas [1, 14].
- Referencia negativa de seguridad: ejemplifica una política que no debe transferirse a hardware por depender de una realimentación bit a bit del objetivo de `head_pitch`.

## Benchmarks y rendimiento

Los únicos datos publicados son tiempos de carrera (en segundos) sobre las cinco semillas oficiales del evento, a 0,3 m/s de velocidad de avance comandada, la misma velocidad a la que compite el modelo base. Son números in-sample: la búsqueda puntuó sus candidatos sobre esas mismas semillas.

| Semilla | juicenv/microduck-hill-es8 | Esta remezcla |
|---|---|---|
| 1 | 0,78 | 0,78 |
| 2 | 0,80 | 0,78 |
| 3 | 0,80 | 0,78 |
| 4 | 0,78 | 0,78 |
| 5 | 0,80 | 0,78 |
| Media (board) | 0,792 | 0,780 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible, y no serían aplicables a este tipo de modelo. No se han publicado datos de benchmarks en la información disponible más allá de los tiempos de carrera indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo es de 831.318 bytes, por lo que el consumo de memoria es despreciable en cualquier GPU moderna.
- Memoria en CPU: el modelo se ejecuta en el runner oficial sobre CPU x86-64 con MuJoCo 3.10.0, sin necesidad de GPU.
- GPU recomendadas: no disponibles. No se documenta ninguna GPU concreta; al ser una política mínima, cualquier GPU sirve y ninguna es necesaria.
- ¿Cabe en GPU de consumo? Sí, con enorme margen en cualquier GPU de consumo (por ejemplo, una RTX 4090), aunque lo natural es ejecutarlo en CPU.
- Opciones de despliegue: ONNX Runtime dentro del runner de la Microduck Arena; MuJoCo 3.10.0 como simulador. No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput estimados: no disponibles como métrica de inferencia. El bucle de control opera a paso fijo de 0,02 s por paso de control y los tiempos de carrera se miden en pasos enteros (0,004 s de resolución en la marca).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento en la prueba | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jrubiosainz/microduck-game-hillclimber-remix2 | Política ONNX de control | 197.774 pesos y sesgos | Vector de observación [1, 61] | 0,780 s de media; 0,78 s en las cinco semillas | No disponible | HuggingFace, 0 descargas, 0 likes |
| juicenv/microduck-hill-es8 | Política ONNX de control | 197.774 pesos y sesgos (red base de esta remezcla) | Vector de observación [1, 61] | 0,792 s de media | No disponible | HuggingFace |
| suraj-phanindra/microduck-hill-hc2-aifund | Política ONNX de control | No disponible | No disponible | 0,808 s | No disponible | HuggingFace |
| namenu/microduck-arena | Repositorio/entrada de Arena (origen de entrenamientos) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Los cuatro modelos pertenecen a la misma categoría (control de locomoción para la Microduck Arena) y todos comparten la misma ausencia de licencia declarada. No se dispone de datos de arquitectura interna de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Solo simulación: la política se entrenó y se evaluó únicamente en el simulador de la Arena sobre sus cinco semillas oficiales; no se ha probado en hardware. El autor indica explícitamente que no debe cargarse en un MicroDuck físico.
- Dependencia de una realimentación no realista: el contador de pasos viaja sobre el objetivo de `head_pitch`, que un robot real no realimentaría bit a bit, por lo que el mecanismo no es transferible tal cual.
- Resultados in-sample: la búsqueda CMA-ES puntuó sus candidatos sobre las mismas cinco semillas con las que se reporta la marca; semillas cercanas o una CPU distinta pueden dar otros tiempos.
- Sensibilidad a la resolución de medida: los tiempos se cuantizan en pasos de control enteros (0,02 s), de modo que la marca se mueve en incrementos de 0,004 s; la mejora reportada (0,012 s) equivale a tres pasos de control.
- Sin licencia declarada: el repositorio fuente tampoco declara licencia y este tampoco, por lo que no hay autorización explícita de uso comercial ni condiciones de redistribución definidas.
- Ausencia total de validación lingüística o de sesgos de contenido: no aplica el análisis habitual de sesgos, alucinación o multilingüismo, ya que no es un modelo de lenguaje. No hay información sobre sesgos en el sentido estadístico de su dominio (por ejemplo, sesgo hacia las condiciones de simulación de las semillas oficiales).
- Sin métricas de latencia, throughput ni consumo publicadas para inferencia fuera del runner oficial.
- Reproducibilidad dependiente del entorno: los tiempos dependen de MuJoCo 3.10.0 y de una CPU x86-64; no se documentan resultados en otras versiones del simulador o en aceleración por GPU.
- Popularidad y soporte nulos: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix2
- Modelo base: https://huggingface.co/juicenv/microduck-hill-es8
- Autor del modelo base: https://huggingface.co/juicenv
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento `microduck_rl`, commit `3c0598cae`, rama `hannes-ft`: https://github.com/pollen-robotics/microduck_rl
- Política origen de la cadena de fine-tuning: https://huggingface.co/suraj-phanindra/microduck-hill-hc2-aifund
- Repositorio de Arena de namenu: https://huggingface.co/namenu/microduck-arena
- Perfil de namenu: https://huggingface.co/namenu
- Organización de Pollen Robotics: https://huggingface.co/pollen-robotics
- No se han encontrado en la búsqueda web papers, blogs ni demos adicionales relevantes sobre este modelo.
