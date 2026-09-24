# brunabcardi/pi0.5-JivoMu1jN3Bs

## Resumen

El modelo `brunabcardi/pi0.5-JivoMu1jN3Bs` es un ajuste fino completo (full fine-tune) del checkpoint `Fisher-Wang/pi05-axis-v0.2-all30-40p50`, una política robótica de tipo vision-language-action (VLA) basada en la arquitectura π0.5 del proyecto openpi. Lo publica el usuario brunabcardi y está orientado a la manipulación robótica sobre el conjunto de tareas AXIS, con un horizonte de acción de 10 pasos y una salida de 9 objetivos de posición articular absoluta.

El modelo conserva sin cambios la interfaz de su predecesor: recibe una imagen RGB de cámara de 256×256 píxeles (ranuras de muñeca vacías y enmascaradas), un estado articular de 9 dimensiones [f1, f2, j1..j7] y una instrucción de tarea en lenguaje natural, y devuelve 9 objetivos de posición articular. No emplea LoRA ni adaptadores: se han reentrenado todos los pesos, con un cambio relativo L2 global de 2,533e-03 respecto al modelo padre.

Es relevante como ejemplo de flujo de trabajo de ajuste fino reproducible en robótica open source, ya que documenta de forma exhaustiva la procedencia del entrenamiento (1.376 episodios y 85.933 fotogramas a 5 Hz) y los hiperparámetros exactos. El repositorio ocupa 12,4 GB y se distribuye en formato Orbax OCDBT para inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 vision-language-action (VLA) con `Pi0Config(pi05=True, discrete_state_input=True)`; horizonte de acción 10; pesos derivados de PaliGemma/Gemma a través de openpi |
| Parámetros totales | no disponible (el repositorio ocupa 12,4 GB en formato Orbax para inferencia) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; se distribuyen pesos sin cuantización publicada en formato Orbax |
| Idiomas soportados | no disponible; las instrucciones de tarea son texto y no se detalla cobertura multilingüe |
| Licencia | derivada de PaliGemma/Gemma, sujeta a los Gemma Terms of Use; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | Orbax OCDBT (directorio `params/`), solo inferencia; se incluyen `training_provenance.json` y `CHECKSUMS.sha256` |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo de todos los parámetros de la política π0.5, sin LoRA, sin adaptadores y sin fusión posterior. El entrenamiento se realizó con el entrenador JAX de openpi en el commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`, sobre la configuración `pi05_axis_joint`. La entrada es una imagen RGB de cámara de 256×256 píxeles más un estado articular de 9 dimensiones [f1, f2, j1..j7] y una instrucción de tarea; la salida son 9 objetivos de posición articular absoluta. La normalización se tomó del padre de forma literal, con el fichero `assets/axis-v0.1-task501-runtime-v1/norm_stats.json` (sha256 `ddf1f825abb675b8c1fff2ea68430f7bb506fdc94cb961836017e448ad3c6d48`) usado sin cambios tanto en entrenamiento como en la distribución.

Los datos de entrenamiento fueron generados íntegramente por el autor (sin conjuntos de terceros): 1.376 episodios y 85.933 fotogramas a 5 Hz. Se dividen en una parte de repetición (704 episodios, 41.727 fotogramas) con las 704 repeticiones públicas de las 22 tareas AXIS heredadas, renderizadas en un entorno de simulación AXIS local, y una parte de recuperación (672 episodios, 44.206 fotogramas sobre 14 tareas débiles: 31, 34, 37, 40, 42, 43, 46, 49, 50, 52, 53, 55, 56 y 57). En esta segunda parte se aplicó una perturbación gaussiana única (sigma 0,02 o 0,05 rad) sobre los objetivos articulares en un paso aleatorio, conservando solo los episodios que seguían teniendo éxito; las etiquetas son siempre los objetivos de referencia limpios. La optimización usó batch de 24, 2.200 pasos configurados (esta exportación corresponde al paso 550), AdamW con recorte de gradiente 1,0, un `CosineDecaySchedule(warmup_steps=50, peak_lr=2,13e-05, decay_steps=2200, decay_lr=1e-05)`, EMA con decaimiento 0,99 y semilla 4401. No hay datos generados para las 8 tareas no heredadas.

## Capacidades

- Generación de acciones de control robótico: produce 9 objetivos de posición articular absoluta a partir de una imagen y un estado articular, con un horizonte de acción de 10.
- Comprensión de instrucciones en lenguaje natural: condiciona la política sobre una instrucción de tarea textual.
- Percepción visual monocular: procesa una única cámara RGB de 256×256 píxeles; las ranuras de muñeca se dejan vacías y enmascaradas.
- Política multimodal con estado propietario discreto: el flag `discrete_state_input=True` indica un tratamiento discreto de la entrada de estado.
- Control en lazo cerrado a 5 Hz: la frecuencia de las etiquetas de entrenamiento es de 5 Hz, coherente con un bucle de control de manipulación.
- Robustez ante perturbaciones articulares: entrenado explícitamente sobre episodios con perturbación gaussiana de sigma 0,02 y 0,05 rad.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, agentes o modos de razonamiento explícito: no disponible (no se documenta ninguno).

## Casos de uso

- Control de un brazo robótico de 9 grados de libertad en lazo cerrado: el modelo se ejecutaría a 5 Hz recibiendo la imagen de cámara y el estado articular, y publicando los 9 objetivos articulares absolutos como consigna para el controlador de bajo nivel.
- Ajuste fino para nuevas tareas AXIS: sirve como punto de partida documentado para reentrenar sobre tareas adicionales usando la misma configuración `pi05_axis_joint` y las mismas estadísticas de normalización.
- Investigación en aumento de datos para VLA: su receta de recuperación (perturbación gaussiana única sobre las etiquetas, conservando solo episodios exitosos) es reproducible y sirve para estudiar cómo afecta el ruido sintético a la robustez.
- Replicación de experimentos de procedencia: el repositorio incluye `training_provenance.json` y `CHECKSUMS.sha256`, lo que permite auditar hiperparámetros y verificar la integridad de los ficheros en un flujo de investigación reproducible.
- Evaluación comparativa frente al modelo padre: al ser un fine-tune con cambio L2 relativo de 2,533e-03, permite medir el efecto marginal del ajuste adicional sobre las 22 tareas heredadas.
- Simulación robótica fiel al render de evaluación: la parte de repetición se generó en un entorno AXIS local con una pose de cámara ajustada a los renders de evaluación, de modo que el modelo puede desplegarse primero en ese simulador antes de pasar a hardware.
- Formación y docencia en robótica open source: el modelo ilustra de forma completa el ciclo de generación de datos, entrenamiento JAX con openpi y exportación Orbax para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,4 GB en formato Orbax (pesos, estadísticas de normalización y ficheros de procedencia), por lo que el peso de los parámetros más los estados del optimizador no está incluido; la VRAM necesaria para cargar los pesos es de ese orden de magnitud, más el margen para activaciones.
- GPU recomendadas: no disponible; no se especifica ninguna GPU concreta. Por tamaño, cabría esperar que requiera aceleradores con al menos 16-24 GB de memoria, si bien el dato no está confirmado en la documentación.
- GPU de consumo: no confirmado. Un repositorio de 12,4 GB es compatible en términos de capacidad con tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090), pero no se documenta que se haya validado.
- Opciones de despliegue: entrenador e inferencia de openpi (JAX + Orbax); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no son aplicables directamente.
- Latencia y throughput: no disponible. El único dato temporal es la frecuencia de los datos de entrenamiento (5 Hz), que describe la tasa de las etiquetas y no la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Horizonte de acción / salida | Licencia | Formato |
|---|---|---|---|---|---|
| brunabcardi/pi0.5-JivoMu1jN3Bs (este) | no disponible | no disponible | Horizonte 10; 9 objetivos articulares absolutos | Derivada de Gemma Terms of Use | Orbax OCDBT |
| Fisher-Wang/pi05-axis-v0.2-all30-40p50 (padre) | no disponible | no disponible | Horizonte 10; 9 objetivos articulares absolutos | no disponible | Orbax OCDBT |
| Otras alternativas VLA de robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento, parámetros o contexto para otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: no evaluado. En un modelo de acción robótica el fallo se manifiesta como una trayectoria incorrecta o insegura, no como texto inventado, y no hay métricas de tasa de error publicadas.
- Cobertura de tareas limitada: el entrenamiento cubre 22 tareas (22, 31, 33, 34, 35, 37, 40, 41, 42, 43, 44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57) y no se generó ningún dato para las 8 tareas no heredadas.
- Dominio restringido: la entrada exige cámara RGB de 256×256 y estado articular de 9 dimensiones [f1, f2, j1..j7]; no se contemplan otras morfologías ni sensores.
- Limitación de idioma: no disponible; no se especifica qué idiomas soportan las instrucciones de tarea.
- Restricciones de licencia: los pesos derivan de PaliGemma/Gemma a través de openpi y están sujetos a los Gemma Terms of Use, lo que impone condiciones específicas para uso comercial. El campo de licencia del repositorio aparece como no disponible, por lo que conviene revisar `LICENSE_GEMMA.txt`, `LICENSE_OPENPI.txt` y `NOTICE` antes de cualquier despliegue productivo.
- Exportación parcial del entrenamiento: esta versión corresponde al paso 550 de 2.200 pasos configurados, de modo que no representa el punto final de la curva de ajuste.
- Validación limitada: 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación independientes publicados.
- Solo inferencia: `params/` no incluye estado del optimizador, por lo que reanudar el entrenamiento desde este artefacto requeriría reinicializar el optimizador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brunabcardi/pi0.5-JivoMu1jN3Bs
- Modelo base (padre): https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-40p50
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Proyecto openpi: https://github.com/Physical-Intelligence/openpi
