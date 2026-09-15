# selfmaderoboticist/groot-n17-so101-035-two-camera-15hz-constlr-g100-frombase

## Resumen

Este repositorio contiene una copia de seguridad pública de los checkpoints de un experimento de robótica denominado GR00T N1.7 — SO101 experiment 035. No es un modelo entrenado desde cero ni una publicación oficial: es un espejo de los pesos que genera un entrenador en ejecución sobre `groot-035`, que guarda un checkpoint cada 1.000 pasos hasta un objetivo de 100.000 pasos. El autor indica que los checkpoints se copiaban originalmente a la cuenta `sapanostic/groot-n17-so101-035-two-camera-15hz-constlr-g100-frombase`, pero esa cuenta agotó su cuota de almacenamiento público, por lo que las nuevas copias se suben aquí directamente desde la instancia de entrenamiento.

El experimento se enmarca en una tarea concreta de manipulación: recogida de tubos de ensayo con un brazo SO101, usando dos cámaras y sin entrada de estado del robot. El entrenamiento parte del split de entrenamiento de una recolección principal de 300 episodios, con batch de 32 y tasa de aprendizaje constante de 1e-4 tras el calentamiento. La model card menciona también un experimento planificado y separado de limpieza de paneles solares con Cosmos, que no corresponde a este repositorio.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: se trata de un artefacto de investigación en curso, sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y con un tamaño de repositorio de 483,1 GB. Su interés práctico está en la reproducibilidad de experimentos de políticas visomotoras y en el sistema de verificación de copias, no en su uso como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint derivado de GR00T N1.7, familia orientada a políticas para robótica; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia alguna) |
| Formato de pesos | safetensors (etiqueta del repositorio); cada checkpoint incluye shards del modelo, configuración, processor/estadísticas y metadatos del trainer |
| Tamaño del repositorio | 483,1 GB |
| Pipeline declarado | robotics |
| Tarea del experimento | recogida de tubos de ensayo (test-tube pickup) |
| Robot objetivo | SO101 |
| Entradas | dos cámaras; sin entrada de estado del robot |
| Estado del backup | incompleto; `backup_status.json` solo aparecerá cuando verifiquen todos los checkpoints hasta el paso 100.000 |
| Fecha de creación del repositorio | 2026-09-15 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo único documentado es la procedencia: los checkpoints derivan de GR00T N1.7, dentro del flujo de entrenamiento de Isaac-GR00T, y se han producido con un entrenador que parte de una base previa (`frombase` en el nombre del repositorio). El nombre del checkpoint codifica los hiperparámetros principales del experimento: dos cámaras, frecuencia de 15 Hz, tasa de aprendizaje constante e inicialización desde base con 100 pasos de calentamiento (g100). Los checkpoints se guardan cada 1.000 pasos con la opción `--save_only_model`, por lo que incluyen pesos, configuración, estadísticas del processor y metadatos del trainer, pero no el estado del optimizador ni del scheduler. Esto significa que no permiten reanudar el entrenamiento de forma exacta desde el punto guardado.

En cuanto a los datos, el entrenamiento utiliza el split de entrenamiento de una recolección principal de 300 episodios, con batch de 32 y tasa de aprendizaje constante de 1e-4 después del calentamiento. No se especifica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias; en robótica estas etapas no son habituales y la model card no las menciona. Tampoco se documenta ninguna innovación técnica de decodificación o atención. El aspecto técnico más destacable documentado es el procedimiento de verificación de integridad: `source_mirror_manifest.json` fija la revisión original del repositorio y registra tamaños y hashes de todos los ficheros copiados, y las subidas directas desde la instancia se verifican contra el SHA-256 de LFS local o hashes de blob de Git antes de guardar el recibo de finalización.

## Capacidades

- Ejecución de políticas de manipulación robótica para el brazo SO101 en la tarea específica de recogida de tubos de ensayo.
- Percepción con dos cámaras como única entrada sensorial declarada; el modelo no recibe estado proprioceptivo del robot.
- Entrenamiento configurado a 15 Hz, lo que condiciona la frecuencia de control esperada en despliegue.
- Almacenamiento de checkpoints intermedios cada 1.000 pasos, lo que permite evaluar el progreso del entrenamiento a lo largo de la curva completa hasta 100.000 pasos.
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, razonamiento multi-paso ni capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, audio, etc.).

## Casos de uso

- Reproducción de experimentos de robótica: el repositorio conserva checkpoints intermedios de una misma ejecución, lo que permite trazar la evolución de la política paso a paso y comparar el efecto de cada fase del entrenamiento sobre la tarea de recogida de tubos de ensayo.
- Evaluación de políticas visomotoras con dos cámaras: al no usar estado del robot, el checkpoint es adecuado para estudiar hasta qué punto la política depende únicamente de la información visual en tareas de precisión como la manipulación de tubos de ensayo.
- Auditoría de integridad de artefactos de entrenamiento: el manifiesto con revisiones fijadas, tamaños y hashes permite verificar que los pesos copiados corresponden exactamente a la ejecución original, útil en flujos de trabajo que exigen trazabilidad.
- Investigación sobre sim-to-real en brazos SO101: los checkpoints sirven como punto de partida o referencia para comparar el comportamiento en simulación frente al robot físico con la misma configuración de dos cámaras a 15 Hz.
- Base para ajuste posterior en tareas de manipulación relacionadas: al ser un checkpoint inicializado desde una base y entrenado sobre una recolección concreta, puede emplearse como punto de partida de nuevos experimentos de la misma familia.
- Estudio de estrategias de almacenamiento en entrenamientos largos: el caso ilustra los problemas prácticos de guardar 100 checkpoints de gran tamaño, con un repositorio de 483,1 GB y necesidad de cuentas espejo por agotamiento de cuota.
- Infraestructura de respaldo automatizado: el código de backup asociado documenta un patrón reutilizable para copiar checkpoints desde una instancia de entrenamiento a HuggingFace con verificación de hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito de la tarea, métricas de manipulación, ni comparaciones cuantitativas con otros checkpoints del mismo experimento.

## Requisitos de hardware

- El repositorio completo ocupa 483,1 GB, pero corresponde a múltiples checkpoints; el tamaño de un checkpoint individual no está disponible.
- VRAM estimada para inferencia: no disponible, porque no se han publicado el número de parámetros ni la configuración de despliegue.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card no menciona vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime.
- Latencia y throughput: no disponible; el único dato relacionado es la frecuencia de entrenamiento de 15 Hz, que no implica necesariamente la frecuencia de inferencia en despliegue.
- Requisito de almacenamiento relevante: los checkpoints se guardaron con `--save_only_model`, por lo que no incluyen estado del optimizador; esto reduce el tamaño por checkpoint respecto a un guardado completo, aunque el dato exacto no se especifica.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, parámetros, contexto ni licencia que permitan una comparación rigurosa con alternativas de la misma categoría. El único punto de referencia citado es el propio GR00T N1.7 como base del entrenamiento y la recolección de 300 episodios del experimento, sin cifras comparativas publicadas.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso, por lo que no puede asumirse permiso para uso comercial ni redistribución.
- Repositorio de respaldo, no publicación oficial: se trata de una copia de seguridad de una ejecución en curso, subida desde una instancia de entrenamiento, no de un checkpoint validado y documentado por el autor del modelo base.
- Backup incompleto: la model card indica que `backup_status.json` solo aparecerá cuando todos los checkpoints hasta el paso 100.000 estén verificados; su ausencia implica que la copia completa del entrenamiento no está garantizada.
- Imposibilidad de reanudar el entrenamiento: al usar `--save_only_model`, no se guardan estados del optimizador ni del scheduler, por lo que no se puede continuar el entrenamiento de forma exacta desde un checkpoint.
- Especificidad extrema de la tarea: el modelo está entrenado para recogida de tubos de ensayo con un SO101 y dos cámaras; no hay evidencia de generalización a otras tareas, objetos, robots o configuraciones de sensores.
- Sin benchmarks ni tasas de éxito publicadas: no es posible estimar su rendimiento real ni compararlo con alternativas.
- Riesgo de sobreajuste al dataset: el entrenamiento usa una única recolección de 300 episodios, con batch 32 y tasa de aprendizaje constante, sin que se documenten estrategias de regularización o aumentación.
- Sin datos de idioma: no se declara ningún idioma soportado, lo que impide evaluar si acepta instrucciones en lenguaje natural y en qué lenguas.
- Sesgos: no se documenta ningún análisis de sesgos, y en robótica los sesgos relevantes suelen proceder de la distribución de los datos de entrenamiento (iluminación, posición de cámara, tipos de objeto), que no se describe.
- Riesgo de alucinación: no aplica en el sentido habitual de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones incorrectas sobre el robot, especialmente en un checkpoint intermedio no validado.
- Coste de almacenamiento elevado: 483,1 GB de repositorio, con la complicación operativa de que la cuenta original agotó su cuota pública.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/selfmaderoboticist/groot-n17-so101-035-two-camera-15hz-constlr-g100-frombase
- Repositorio original de los checkpoints: https://huggingface.co/sapanostic/groot-n17-so101-035-two-camera-15hz-constlr-g100-frombase
- Código de backup: https://github.com/Rebis-IvLabs/cosmos-framework/tree/codex/groot-035-hf-backup/examples/checkpoint_backup
- Repositorio de entrenamiento: Rebis-IvLabs/Isaac-GR00T, revisión `cd2d7c9988c356a0338597d71265e5b91d9c7638` (la model card indica el repositorio y el hash de revisión, pero no incluye la URL directa)
- Manifiesto de verificación: `source_mirror_manifest.json`, dentro del propio repositorio de HuggingFace
- Estado del backup: `backup_status.json`, dentro del propio repositorio de HuggingFace (todavía no presente)
- Búsqueda web: no se encontraron enlaces relevantes para este modelo; los resultados devueltos correspondían a páginas de ayuda de YouTube y a hilos de Zhihu sin relación con el repositorio.
