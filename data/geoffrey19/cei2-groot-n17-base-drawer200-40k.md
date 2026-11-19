# Geoffrey19/cei2-groot-n17-base-drawer200-40k

## Resumen

`cei2-groot-n17-base-drawer200-40k` es un checkpoint de política robótica obtenido por ajuste fino completo (full fine-tune) del modelo fundacional GR00T N1.7 de NVIDIA, de 3,14 mil millones de parámetros, sobre demostraciones reales de teleoperación en un brazo Franka FR3 con una mano LEAP. Lo desarrolla el usuario Geoffrey19 y se publica en Hugging Face bajo la licencia NVIDIA, que restringe el uso a investigación y evaluación no comercial. El modelo resuelve una tarea concreta de manipulación: abrir un cajón, recoger un objeto de la mesa, colocarlo dentro y cerrar el cajón.

Técnicamente es la continuación del checkpoint `Geoffrey19/cei2-groot-n17-base-drawer200` (entrenado 20.000 pasos desde `nvidia/GR00T-N1.7-3B`) con otros 20.000 pasos adicionales bajo la misma receta, hasta un total de 40.000 pasos. El entrenamiento emplea 200 episodios reales (114.493 fotogramas a 15 Hz) con una única cámara RGB exterior de 640×480, estado y acción de 23 posiciones articulares absolutas en radianes y predicción de chunks de 16 pasos con objetivos relativos al estado.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación con GR00T: documenta con detalle la receta de ajuste (learning rate, normalización por percentiles, orden de articulaciones, estadísticas de acciones relativas) y expone un caso de permutación de articulaciones entre el orden del registro y el orden del modelo que el cliente de despliegue debe aplicar explícitamente. No es un modelo de propósito general ni un modelo de lenguaje: es una política visuomotora especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política visuomotora con backbone LLM y visual ajustados; flow matching para acciones) |
| Parametros totales | 3.144.016.000 (3,14 B; 1.030 tensores) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo robótico; las anotaciones de tarea están en inglés) |
| Licencia | NVIDIA License (nvidia-license), uso limitado a investigación y evaluación no comercial |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003` a `model-00003-of-00003`), float32 |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.7, una política fundacional de NVIDIA para control robótico que combina un backbone de lenguaje y un encoder visual con una cabeza de acciones basada en flow matching. En este checkpoint se ajustan completamente el LLM (`--tune-llm`), el encoder visual (`--tune-visual`), el proyector y la cabeza de acciones. La configuración de modalidad usa el embodiment `NEW_EMBODIMENT`, con campos de estado y acción `arm[0:7]` y `hand[7:23]`, vídeo `exterior_1` y anotación de tarea en `annotation.human.task_description`.

El entrenamiento usa 200 episodios reales del dataset `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (114.493 fotogramas a 15 Hz, una cámara RGB de 640×480, 23 articulaciones absolutas en radianes). Las acciones se predicen en chunks de 16 pasos como objetivos articulares relativos al estado (`NON_EEF`); la política suma el estado de vuelta para emitir posiciones absolutas. La normalización es por percentiles (q01/q99 mapeados a −1/+1 y recortados), con estadísticas de acciones relativas calculadas por paso de chunk a partir de este dataset (`statistics.json`). El ajuste se hizo en una sola GPU, batch 32, precisión mixta bfloat16 sobre pesos float32, con dos fases de 20.000 pasos: learning rate pico de 2e-5 tras 500 pasos de calentamiento y decaimiento coseno, weight decay 1e-5, reiniciando el estado del optimizador en el paso 20.000. La pérdida media de entrenamiento (objetivo de flow matching) baja de 1,0683 en los pasos 0–100 a 0,0167 en los pasos 39.000–40.000.

Una particularidad crítica es el orden de articulaciones: el modelo opera en orden de modelo, con `mcp_forward` antes de `mcp_side` en cada dedo, mientras que las grabaciones usan el orden de motores LEAP. El cliente debe aplicar la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` al estado antes de enviarlo y de nuevo a las acciones devueltas; `joint_order.json` documenta ambos órdenes.

## Capacidades

- Generación de acciones de control articular para un brazo Franka FR3 (7 articulaciones) y una mano LEAP (16 articulaciones), en total 23 dimensiones.
- Ejecución de la tarea compuesta "abrir el cajón, recoger el objeto de la mesa, colocarlo dentro y cerrar el cajón" a partir de una imagen RGB exterior.
- Aprendizaje por imitación con predicción de chunks de 16 pasos de acciones relativas al estado.
- Condicionamiento por descripción de tarea en lenguaje natural (campo `annotation.human.task_description`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es una política visuomotora, no un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras modalidades fuera de la imagen RGB de entrada.

## Casos de uso

- Automatización de una tarea de manipulación de cajón en laboratorio: el modelo genera comandos articulares para abrir un cajón, coger un objeto y cerrarlo, usando una sola cámara exterior de 640×480, lo que simplifica el montaje físico.
- Investigación en aprendizaje por imitación con GR00T: sirve como referencia reproducible de una receta completa de ajuste (40.000 pasos, dos fases, normalización por percentiles) para comparar variantes de entrenamiento.
- Evaluación de políticas visuomotoras en un banco de pruebas FR3 + LEAP: al estar entrenado sobre una embodiment concreta, permite medir el efecto de cambios en la cámara, la frecuencia de control o el orden de articulaciones.
- Estudio de transferencia desde un checkpoint intermedio: al continuar desde `cei2-groot-n17-base-drawer200`, permite analizar cómo evoluciona la pérdida y el comportamiento al reanudar el optimizador con un nuevo schedule.
- Desarrollo de clientes de despliegue para GR00T: el modelo y sus ficheros (`joint_order.json`, `statistics.json`, `cei2_groot_config.py`) sirven para validar la implementación de la permutación de articulaciones y la normalización en un stack real.
- Docencia y demostraciones de robótica de manipulación: la tarea es intuitiva y el dataset es pequeño (200 episodios), lo que facilita reproducir el pipeline en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que se usaron los 200 episodios para entrenamiento, sin split de validación, y que no se comprobó el éxito por episodio, por lo que no se reporta evaluación de la política. Solo se ofrecen pérdidas de entrenamiento (ajustes a los episodios de entrenamiento, no medidas de calidad):

| Pasos | GR00T desde base | GR00T desde CEI |
|---|---|---|
| 0–100 | 1,0683 | 0,1939 |
| 9.900–10.000 | 0,0489 | 0,0288 |
| 19.000–20.000 | 0,0284 | 0,0161 |
| 20.000–20.100 | 0,0284 | 0,0159 |
| 29.900–30.000 | 0,0252 | 0,0166 |
| 39.000–40.000 | 0,0167 | 0,0115 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 12,6 GB en float32; en la práctica se necesita al menos esa cantidad más el overhead del runtime de GR00T (no disponible una cifra oficial).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16–24 GB o más es el mínimo razonable para cargar los pesos en float32, y se recomienda bfloat16 para reducir memoria.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 24 GB (por ejemplo, RTX 4090) si se carga en bfloat16 y el runtime lo permite; no confirmado por el autor.
- Opciones de despliegue: la librería `gr00t` (Isaac-GR00T de NVIDIA); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. El entrenamiento se hizo en una sola GPU con batch 32, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cei2-groot-n17-base-drawer200-40k` (este) | 3,14 B | Manipulación FR3 + LEAP, tarea de cajón | NVIDIA License (no comercial) | Hugging Face |
| `Geoffrey19/cei2-groot-n17-base-drawer200` | 3,14 B (misma base) | Misma tarea, 20.000 pasos | NVIDIA License | Hugging Face |
| `Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k` | no disponible | Misma tarea desde el mid-training CEI | NVIDIA License | Hugging Face |
| `nvidia/GR00T-N1.7-3B` | 3 B | Política fundacional general | NVIDIA License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a procedencia, receta y licencia.

## Limitaciones y advertencias

- Licencia NVIDIA: uso limitado a investigación y evaluación no comercial; no apto para producción comercial sin licencia adicional.
- Sin split de validación ni evaluación de éxito: los 200 episodios se usaron para entrenamiento y no se verificó el éxito por episodio desde los vídeos, por lo que no hay evidencia publicada de la tasa de éxito de la política.
- Especialización extrema: entrenado para una única tarea, una única embodiment (FR3 + LEAP), una única cámara exterior y una frecuencia de 15 Hz; no se espera generalización fuera de ese montaje.
- Riesgo de sobreajuste a las demostraciones: las pérdidas de entrenamiento muy bajas (0,0167) son ajustes a los episodios, no garantía de comportamiento robusto.
- Dependencia crítica del orden de articulaciones: usar el orden de motores LEAP sin aplicar la permutación `P` produce comandos incorrectos; el README del dataset pide el orden de motores, que no aplica a este checkpoint.
- Dependencia de la normalización: hay que usar exactamente `statistics.json`; cualquier otra normalización invalida las acciones relativas.
- Las acciones son posiciones articulares medidas 1/15 s después, no comandos enviados al robot, lo que puede introducir un desfase respecto al control real.
- Sesgos y alucinaciones en el sentido de modelos de lenguaje no aplican; el riesgo equivalente es la generación de trayectorias no válidas fuera de la distribución de entrenamiento.
- Idiomas: no disponible; las anotaciones de tarea están en inglés y no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200-40k
- Checkpoint base (20.000 pasos): https://huggingface.co/Geoffrey19/cei2-groot-n17-base-drawer200
- Variante desde el mid-training CEI: https://huggingface.co/Geoffrey19/cei2-groot-n17-fr3v2-leaphand-112h-drawer200-40k
- Modelo fundacional: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset de entrenamiento: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Licencia NVIDIA: fichero `LICENSE` del repositorio
