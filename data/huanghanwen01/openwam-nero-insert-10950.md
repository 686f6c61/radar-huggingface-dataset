# huanghanwen01/OpenWAM-Nero-Insert-10950

## Resumen

OpenWAM-Nero-Insert-10950 es un modelo de acción-mundo (world-action model) para robótica de manipulación, desarrollado por el usuario huanghanwen01 y publicado bajo el paraguas del proyecto OpenWAM. Se trata de un ajuste fino del modelo base `OpenWAM-Alpha-Pretrain-Foundation-Model` orientado a una tarea única y muy concreta: insertar un enchufe en una regleta mediante un brazo robótico real AgileX Nero EG2 (brazo derecho). El modelo aprende a predecir comandos de pose absoluta del efector final a partir de observaciones, siguiendo el contrato de acciones de OpenWAM.

El checkpoint publicado corresponde al paso global 10.950 de entrenamiento (época 14 de 15), con una loss de acción de validación de 0,002199 y una loss de entrenamiento de 0,001081. El repositorio ocupa 24,8 GB e incluye los pesos en safetensors, la configuración completa de entrenamiento, las estadísticas de normalización y el tokenizador de texto. La librería asociada es `openwam` y el pipeline declarado en Hugging Face es `robotics`.

Su relevancia es acotada pero real: documenta de forma transparente un ciclo completo de ajuste fino de un modelo fundacional de robótica sobre datos de teleoperación reales (7,16 horas, 904 episodios), incluyendo curvas de loss, configuración de entrenamiento distribuido y una lista explícita de problemas conocidos en el despliegue. Es un artefacto de investigación reproducible más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional OpenWAM; no se detalla en la model card) |
| Parametros totales | no disponible (pesos de 24 GB en safetensors, precision no indicada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos completos en safetensors) |
| Idiomas soportados | no disponible (incluye tokenizador de texto, pero no se declaran idiomas) |
| Licencia | other (licencia personalizada, no especificada en la model card) |
| Formato de pesos | safetensors (`checkpoint_step_10950.safetensors`, 24 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `OpenWAM-Alpha-Pretrain-Foundation-Model`; únicamente se indica que se trata de un world-action model del ecosistema OpenWAM con contrato de acciones unificado (`unify_action_map`), en el que este ajuste ocupa los slots `0:10` con la representación `nero_eg2_absolute_eef10`. El modelo consume observaciones (imágenes y estado) y produce comandos de pose absoluta del efector final en 10 dimensiones: posición `xyz` (3), rotación `rot6d` (6, las dos primeras columnas de la matriz `R = Rz @ Ry @ Rx`) y apertura de pinza (1, mapeada de `0..1000` a `[-1, +1]`).

El ajuste fino se realizó sobre 904 episodios (7,16 horas) de teleoperación real, procedentes de dos conjuntos (`insert_20261021` con 303 episodios y `insert_20261024` con 601), divididos en 814 de entrenamiento y 90 de validación por episodio. Se entrenaron 15 épocas con batch efectivo de 28 (4 por GPU en 7 GPU), learning rate 2e-4 con scheduler coseno y warmup de 0,05, precisión bf16, ZeRO etapa 1 y gradient checkpointing activado; el tiempo de pared total fue de 6 h 31 m. Tanto las acciones como el estado se tomaron de los comandos enviados (`right_command_eef_*`), no de la realimentación del robot. La loss de acción de entrenamiento cayó un 90 % a lo largo de las 15 épocas, pero a partir de la época 10 el ratio train/val pasó de 0,76 a 0,49, señal de sobreajuste; el autor recomienda retroceder al paso 9.490 si el checkpoint final da problemas, ya que su loss de validación es solo un 4 % superior.

## Capacidades

- Predicción de comandos de pose absoluta del efector final (10 dimensiones: xyz, rot6d, pinza) para un brazo AgileX Nero EG2.
- Ejecución de una tarea de manipulación concreta: inserción de enchufe en regleta.
- Modelo de acción-mundo: integrado en el contrato de acciones de OpenWAM mediante mapeo de slots (`["0-9"]`).
- Procesamiento de entrada multimodal (observaciones visuales y estado del robot), según la naturaleza del modelo base.
- Tokenizador de texto incluido en el repositorio, aunque no se documentan capacidades lingüísticas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, visión general, audio ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación: el checkpoint sirve como referencia reproducible de un ajuste fino sobre 7,16 horas de datos reales, con curvas de loss y configuración completas, útil para comparar metodologías de entrenamiento.
- Despliegue de una política de inserción de precisión en un banco de pruebas con brazo AgileX Nero EG2: el modelo genera comandos de pose absoluta directamente consumibles por el controlador del robot, sin necesidad de convertir deltas ni ángulos articulares.
- Estudio de deriva en lazo cerrado con acciones absolutas: los problemas documentados (1°/paso con imágenes dentro de distribución, 4,5°/paso fuera de ella) permiten diseñar y evaluar estrategias de corrección o realimentación.
- Base para ajuste fino en tareas de inserción relacionadas: al partir de un modelo fundacional preentrenado, puede reentrenarse con datos propios de ensamblaje o conexión de conectores.
- Evaluación de robustez frente a distribuciones de datos mezcladas: el caso de la altura de agarre bimodal (diferencia de 3 cm entre los dos conjuntos) es un ejemplo práctico para estudiar el efecto de mezclar datos heterogéneos.
- Análisis de la calidad de los comandos de teleoperación: el modelo reproduce el ruido de los comandos (RMS 3D de 6,48 mm en la residual de suavizado a 9 puntos, 3,5 veces la del feedback), lo que permite medir hasta qué punto el ruido del operador se transfiere a la política aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta las curvas de loss de acción de entrenamiento y validación por época:

| Epoca | Step | Train action | Val action |
|---|---|---|---|
| 0 | 730 | 0,011262 | 0,011034 |
| 1 | 1460 | 0,009854 | 0,007192 |
| 2 | 2190 | 0,007723 | 0,008015 |
| 3 | 2920 | 0,006563 | 0,006521 |
| 4 | 3650 | 0,005673 | 0,005290 |
| 5 | 4380 | 0,004825 | 0,004786 |
| 6 | 5110 | 0,004181 | 0,004811 |
| 7 | 5840 | 0,003564 | 0,004222 |
| 8 | 6570 | 0,003022 | 0,003305 |
| 9 | 7300 | 0,002474 | 0,002793 |
| 10 | 8030 | 0,002062 | 0,002720 |
| 11 | 8760 | 0,001728 | 0,002427 |
| 12 | 9490 | 0,001362 | 0,002295 |
| 13 | 10220 | 0,001205 | 0,002249 |
| 14 | 10950 | 0,001081 | 0,002199 |

No se reportan métricas de éxito de la tarea de inserción (tasa de éxito, precisión de inserción, tiempo de ejecución) en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 24,8 GB; el archivo `checkpoint_step_10950.safetensors` son 24 GB. No se indica el número de parámetros ni la precisión de almacenamiento, por lo que la VRAM necesaria para inferencia no está disponible con exactitud.
- Para cargar los pesos completos en memoria de GPU se necesita al menos espacio para 24 GB de pesos más el estado del optimizador en caso de reentrenamiento; el entrenamiento se realizó con 7 GPU y batch de 4 por GPU en bf16 con ZeRO etapa 1, lo que sugiere GPUs de clase A100 o superior.
- No se documenta si el modelo cabe en GPUs de consumo (RTX 4090, 24 GB) en su formato actual; en el límite teórico de memoria, los pesos solos ocuparían casi toda la VRAM de una RTX 4090, sin margen para activaciones.
- Opciones de despliegue: la librería de referencia es `openwam`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de robótica de este tipo.
- No se proporcionan datos de latencia ni throughput.
- Es imprescindible cargar `normalization_stats.npy` desde el mismo directorio que los pesos; usar estadísticas de otro conjunto de datos produce un rango de normalización incorrecto sin emitir ningún error.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world-action models para manipulación robótica) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Deriva en lazo cerrado con acciones absolutas: si la salida del modelo se realimenta como siguiente estado, el error se acumula a razón de aproximadamente 1°/paso con imágenes dentro de la distribución de entrenamiento y de 4,5°/paso cuando la imagen se aleja de ella.
- Altura de agarre bimodal: los dos conjuntos de datos tienen medianas de altura mínima de agarre de 0,2435 m y 0,2116 m (3 cm de diferencia), lo que genera una distribución bimodal en esa dimensión tras el entrenamiento conjunto y puede producir comportamientos inconsistentes.
- Ruido en los comandos: los comandos de efector final tienen una residual de suavizado a 9 puntos con RMS 3D de 6,48 mm, 3,5 veces la del feedback; el modelo reproduce ese ruido en sus predicciones.
- Sobreajuste: a partir de la época 10 el ratio train/val cae de 0,76 a 0,49; el autor recomienda el checkpoint del paso 9.490 como alternativa con solo un 4 % más de loss de validación.
- Dependencia crítica de las estadísticas de normalización: usar `normalization_stats.npy` de otro conjunto de datos corrompe la normalización sin aviso.
- Alcance muy restringido: entrenado para una única tarea (inserción de enchufe) y un único robot (AgileX Nero EG2, brazo derecho); no se garantiza su transferencia a otras tareas, objetos o morfologías.
- Licencia "other" no detallada: no se especifican los términos de uso comercial, por lo que debe consultarse al autor antes de cualquier despliegue productivo.
- No se documentan sesgos sociales, riesgos de alucinación lingüística ni limitaciones idiomáticas porque el modelo no se presenta como un modelo de lenguaje de propósito general.
- Solo 29 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huanghanwen01/OpenWAM-Nero-Insert-10950
- Repositorio de código: https://github.com/shiona733/1026_openwam_insert
