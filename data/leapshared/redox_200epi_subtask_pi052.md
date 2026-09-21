# leapshared/Redox_200epi_subtask_pi052

## Resumen

Redox_200epi_subtask_pi052 es una política vision-language-action (VLA) para robótica publicada por el usuario leapshared en HuggingFace bajo la librería LeRobot. Se trata de un ajuste fino completo de lerobot/pi052_base durante 30.000 pasos sobre 200 demostraciones de la tarea «Redox», grabadas con el robot de dos brazos OpenArm (configuración bi_openarm_follower, tres cámaras y vectores de estado y acción de 16 dimensiones). El checkpoint tiene 4.143.404.816 parámetros y el repositorio ocupa 66,3 GB.

La particularidad del modelo es su estructura jerárquica: un mismo checkpoint convierte una frase de tarea en una frase de sub-tarea (solo ocho posibles, fijadas durante el entrenamiento) y, con esa frase como condición, genera bloques de 50 acciones. La tarea aprendida es una sola: «Hold the metal plate by the orange handle, dip it into the blue solution, take it out and point at it, then put the plate back in the beaker on the left».

Su relevancia es práctica más que generalista. Es un ejemplo reproducible de política VLA con descomposición de sub-tareas, pero exige una rama no fusionada de LeRobot (PR 4184, commit 3298e15, versión 0.6.2), el tokenizador de un repositorio con control de acceso (google/paligemma-3b-pt-224) y un parche de dos líneas para que la inferencia de acciones no falle. No hay resultados de benchmarks publicados, y las únicas cifras de rendimiento disponibles son medidas de latencia en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (VLA) de tipo PI052, implementado en PyTorch como PI05Pytorch. El componente de visión-lenguaje se apoya en PaliGemma-3B (el preprocesador exige el tokenizador de google/paligemma-3b-pt-224) y un experto de acción produce bloques de 50 acciones condicionados por lenguaje |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos se publican en fp32 (16,6 GB); la carga con `--policy.dtype=bfloat16` deja el modelo en 8,7 GiB |
| Idiomas soportados | No disponible. Las frases de tarea y sub-tarea usadas en el entrenamiento están en inglés y son ocho frases fijas |
| Licencia | gemma (términos de la licencia Gemma) |
| Formato de pesos | safetensors |
| Libreria y pipeline | lerobot / robotics |
| Embodiment | OpenArm de dos brazos (bi_openarm_follower), 3 cámaras, estado y acción de 16 dimensiones |
| Bloque de acción | 50 pasos por inferencia |
| Checkpoints incluidos | Cuatro, con las etiquetas 015000 a 030000 (020000 documentado como alternativa) |
| Fecha de publicacion | 21 de septiembre de 2026 (actualizado el mismo día) |
| Descargas y likes | 44 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo es una política VLA densa construida sobre lerobot/pi052_base. La clase de inferencia es PI05Pytorch y el punto de entrada textual pasa por `embed_prefix()`, lo que confirma que el modelo combina un codificador de visión-lenguaje con un experto de acción que emite bloques de 50 acciones. El requisito de disponer del tokenizador de google/paligemma-3b-pt-224 indica que la torre de visión-lenguaje corresponde a PaliGemma-3B, que sumada al experto de acción explica el total de 4,14 mil millones de parámetros. Las observaciones provienen de tres cámaras y de un vector de estado de 16 dimensiones; las acciones también son de 16 dimensiones. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

El entrenamiento consistió en un ajuste fino completo de 30.000 pasos sobre 200 demostraciones de la tarea Redox. La innovación destacable es la separación en dos niveles: el nivel alto genera una de las ocho frases de sub-tarea (desde «lift the metal plate out of the left beaker» hasta «return to the home posture») y el nivel bajo genera acciones condicionadas únicamente por frases de sub-tarea, nunca por la frase de tarea completa. Las demostraciones se grabaron a 30 Hz nominales, aunque el bucle `sync` real del robot se midió entre 14 y 21 Hz, de modo que una demostración de 30 a 41 segundos tarda entre 60 y 85 segundos en reproducirse.

## Capacidades

- Generación de frases de sub-tarea a partir de una frase de tarea, restringida a las ocho frases vistas en entrenamiento.
- Generación de bloques de acción de 50 pasos y 16 dimensiones condicionados por una frase de sub-tarea.
- Control bimanual del robot OpenArm, con brazos izquierdo y derecho.
- Percepción visual mediante tres cámaras integradas en la política.
- Ejecución completa de la tarea Redox: levantar la placa metálica del vaso izquierdo, moverla sobre la disolución azul, señalarla con la mano izquierda, sumergirla, mantenerla quieta, levantarla y señalarla, devolverla al vaso izquierdo y volver a la postura home.
- Ejecución por tramos: el comando `/subtask <frase>` fija directamente el prompt de acción de un tramo concreto, lo que permite forzar el avance o el retroceso de fase.
- Funcionamiento en modo interactivo con `/start`, `/autosteer`, `/subtask`, `/stop` y `/reset`, y dos modos de inferencia (`sync` y `rtc`, este último mencionado en la documentación del autor).
- No se documenta soporte de tool calling, function calling, agentes software, generación de texto general, código, matemáticas ni visión generalista.
- No se documentan capacidades multilingües.

## Casos de uso

- Automatización de una celda de laboratorio químico: el modelo ejecuta de principio a fin una secuencia de manipulación con una placa metálica y una disolución, incluyendo acciones de señalar y de retorno al vaso, lo que encaja en protocolos repetitivos de laboratorio.
- Pick-and-place guiado por lenguaje dentro de un conjunto cerrado de instrucciones: el nivel alto acepta una frase de tarea y la traduce a una secuencia de ocho frases de sub-tarea, cada una asociada a un tramo de movimiento.
- Investigación en descomposición jerárquica de tareas: el bucle «tarea, sub-tarea, acción» se puede reproducir con `--interactive=true` y `/autosteer`, lo que permite estudiar cómo un modelo de alto nivel segmenta una tarea de manipulación larga.
- Intervención humana en tiempo de ejecución: si el nivel alto se estanca o retrocede de fase, `/subtask` permite fijar manualmente la siguiente frase y completar la secuencia antes de detener el robot.
- Evaluación comparativa de políticas VLA en brazos duales: los cuatro checkpoints publicados (etiquetas 015000 a 030000) permiten medir la evolución del comportamiento a lo largo del ajuste fino.
- Reproducción y control de calidad de demostraciones: el modelo puede reejecutar la tarea grabada para verificar que la política reproduce las 200 demostraciones y detectar derivas respecto a la trayectoria original.
- Planificación de despliegue y medición de latencia: con las cifras de 2,1 s y 155 ms por bloque de acciones se puede dimensionar una línea de producción y decidir entre `sync` (con paradas del bucle de control) y `rtc`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta mediciones de latencia en una RTX 5090 en bfloat16 y sin robot conectado:

| Operacion | Primera inferencia | Inferencias posteriores |
|---|---|---|
| Inferencia de bloque de acciones | 2,1 s | 155 ms |
| Generacion de frase de sub-tarea | 1,8 s | 116 ms |

En modo `sync` el bucle de control se detiene durante esas inferencias: tras `/start` hay unos 2 segundos sin enviar comandos y la primera consulta de `/autosteer` provoca otra parada de unos 2 segundos. Después, cada frontera de bloque y cada consulta cuesta entre 0,1 y 0,15 segundos.

## Requisitos de hardware

- VRAM en inferencia: 8,7 GiB tras cargar el modelo en bfloat16.
- Pico de VRAM durante la carga: 24,2 GiB, porque el state dict en fp32 y el modelo en bf16 coexisten en la GPU. El valor es el mismo en H200 y en RTX 5090 y corresponde a asignación real, no a caché.
- GPU recomendadas: H200 y RTX 5090 verificadas por el autor. En tarjetas de 32 GB la carga puede acabar en OOM si otro proceso ocupa la GPU, ya que la carga ocurre antes de conectar el robot. Tras la carga, el proceso se ve con unos 25 GiB en `nvidia-smi` (caché del asignador que se reutiliza en inferencia).
- GPU de consumo: cabe en una RTX 5090. No se documentan otros modelos de consumo.
- Almacenamiento: 16,6 GB si se descargan solo los pesos (excluyendo `checkpoints/*`); 83 GB si se descargan los cuatro checkpoints; el repositorio completo ocupa 66,3 GB.
- Opciones de despliegue: el binario `lerobot-rollout` de la rama del PR 4184 de LeRobot (commit 3298e15, versión 0.6.2), con el parche `pi052_embed_prefix.patch` aplicado. Se documentan los modos `sync` y `rtc` (`--inference.type`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Throughput: el bucle real del robot mide entre 14 y 21 Hz, no los 30 Hz nominales; una demostración de 30 a 41 segundos se reproduce en 60 a 85 segundos.

## Comparativa con modelos similares

La información disponible solo permite comparar el modelo con su propia base, ya que no se aportan datos de otras políticas VLA.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Redox_200epi_subtask_pi052 | 4,14 mil millones | No disponible | Sin benchmarks publicados; latencias medidas en RTX 5090 | gemma | Repositorio abierto (44 descargas) |
| lerobot/pi052_base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Repositorio abierto; es el modelo base del ajuste fino |

No se dispone de datos de alternativas comparables de la misma categoría (otras políticas VLA de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con una única frase de tarea y ocho frases de sub-tarea. El nivel alto no tiene memoria: cuando termina, se queda fijado en «return to the home posture», unos 21 grados por delante de la postura home según la mediana de las 200 demostraciones, y volver a lanzar `/autosteer` no inicia un ciclo nuevo; hay que hacer `/reset`, `/start` y `/autosteer`.
- El generador de sub-tareas puede producir frases fuera del conjunto entrenado. El autor documenta que una línea de `/autosteer` truncada al copiarla del terminal generó las frases «lift the plate out of the left beaker» y «raise raise», fuera de la lista.
- Dependencia de una rama no fusionada: sin el PR 4184 de LeRobot (commit 3298e15, versión 0.6.2) no existen ni la política `pi052` ni la opción `--interactive`. La versión 0.6.1 de PyPI falla con `error: unrecognized arguments`.
- La inferencia de acciones falla sin parche: `TypeError: PI05Pytorch.embed_prefix() takes 5 positional arguments but 7 were given`. Se necesita aplicar `pi052_embed_prefix.patch`.
- Dependencia de un recurso con control de acceso: el tokenizador de google/paligemma-3b-pt-224 es un repositorio restringido y el preprocesador lo descarga en tiempo de ejecución, después de conectar el robot. Sin él, el proceso muere con el robot ya conectado.
- Riesgo operativo en las paradas: `/stop`, `/reset` y Ctrl-C devuelven el robot a la postura inicial en 3 segundos en el espacio articular y abren el gripper a su valor inicial, por lo que la placa se suelta si se ejecutan mientras se sostiene o está dentro de la disolución o del vaso.
- Riesgo de comandos perdidos: hasta que aparece el banner de comandos, el terminal no muestra nada durante aproximadamente un minuto de carga y las líneas escritas no se descartan, sino que se leen al iniciar la sesión; escribir `/start` durante la carga provoca que el rollout arranque solo.
- El nivel alto no generaliza a otras tareas, objetos ni escenas distintas de la tarea Redox documentada; no hay datos de sesgos ni de comportamiento fuera de distribución más allá de que tres de cuatro vídeos no usados en entrenamiento terminaron también en «return ...».
- Licencia gemma: el uso queda sujeto a los términos de la licencia Gemma, que imponen condiciones y restricciones adicionales para uso comercial que deben revisarse antes de un despliegue en producción.
- No hay benchmarks publicados, solo latencias medidas en una RTX 5090 concreta, por lo que no se puede estimar la calidad de la política en términos comparables.
- La model card está redactada en coreano e inglés y no documenta idiomas soportados, ventana de contexto ni tipos de cuantización.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leapshared/Redox_200epi_subtask_pi052
- Modelo base: https://huggingface.co/lerobot/pi052_base
- Tokenizador requerido (repositorio con control de acceso): https://huggingface.co/google/paligemma-3b-pt-224
- Pull request de LeRobot necesario: https://github.com/huggingface/lerobot/pull/4184
- Fichero de línea de comando para `/autosteer`: https://huggingface.co/leapshared/Redox_200epi_subtask_pi052/blob/main/autosteer_line.txt
- Parche de inferencia: https://huggingface.co/leapshared/Redox_200epi_subtask_pi052/blob/main/pi052_embed_prefix.patch
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a una marca de cosmética y no guardan relación con el contenido de esta ficha.
