# NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-10000

# Checkpoint franka cartesian de openpi (pi05), step 10000

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado con la librería `openpi` y etiquetado con el tag `pi05`, la familia de modelos vision-language-action (VLA) de Physical Intelligence. El modelo ha sido entrenado (o al menos distribuido) para un brazo Franka y representa las acciones en espacio cartesiano absoluto: posición XYZ, cuaternión xyzw y pinza binaria (-1/+1), en lugar de incrementos de control (delta actions). El checkpoint corresponde al paso 10.000 de entrenamiento y, según el nombre del repositorio, se generó a partir de 10 demostraciones para la tarea número 10.

El dato más relevante para quien vaya a evaluarlo es que los pesos están en formato `safetensors` con precisión bfloat16, convertidos desde JAX a PyTorch, y que suman 3.616.757.520 parámetros (unos 3,62 mil millones). El repositorio ocupa 7,2 GB, coherente con ese recuento en bf16. La salida del modelo tiene 50 pasos temporales y 32 coordenadas, pero solo las ocho primeras corresponden a acciones reales del robot; el resto debe ignorarse.

Es un artefacto de investigación con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada y sin model card detallada más allá de las notas de conversión. La información de uso práctico (inputs de cámara y estado, normalización, convenciones del controlador) se remite a los ficheros `log.txt` y `assets/franka/norm_stats.json` incluidos en el propio repositorio, no a documentación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Por la librería (`openpi`) y el tag (`pi05`) corresponde a la familia π₀.5 de tipo vision-language-action (VLA); el detalle de capas y del experto de acciones no está disponible |
| Parametros totales | 3.616.757.520 (~3,62 B), dato extraído de los ficheros safetensors |
| Parametros activos | No disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles. Solo se distribuyen pesos en bfloat16; no hay versiones GGUF, int8 ni int4 publicadas |
| Idiomas soportados | No disponible (el backbone de tipo visión-lenguaje podría soportar varios idiomas, pero no está documentado) |
| Licencia | No disponible |
| Formato de pesos | Safetensors en bfloat16, convertidos de JAX a PyTorch con la configuración original de entrenamiento para Franka |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo único verificable es que se trata de un modelo de la familia `pi05` dentro del ecosistema `openpi`, orientado a robótica, y que originalmente estaba en JAX y se ha convertido a PyTorch en bfloat16 manteniendo la configuración de entrenamiento de Franka. El repositorio declara el pipeline `robotics` y no expone número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning por imitación más allá de las 10 demostraciones que sugiere el nombre del repositorio.

El aspecto técnico más concreto y con consecuencias prácticas es la representación de acciones: se generan 50 pasos y 32 coordenadas por inferencia, de las cuales solo las ocho primeras son acciones del robot (previsiblemente 7 grados de libertad más la pinza). Las acciones son cartesianas absolutas (XYZ + cuaternión xyzw + pinza binaria), no deltas del controlador, algo que condiciona por completo la integración con el bucle de control. Cualquier uso requiere aplicar exactamente las mismas transformaciones de entrenamiento y el fichero `assets/franka/norm_stats.json` para desnormalizar correctamente.

## Capacidades

- Generación de secuencias de acción para manipulación robótica: produce un chunk de 50 pasos con 8 coordenadas útiles por paso (posición XYZ, orientación en cuaternión xyzw y estado de pinza -1/+1).
- Control en espacio cartesiano absoluto, no en deltas: apto para controladores que acepten consignas de pose absolutas.
- Política condicionada por observaciones visuales y de estado (la model card menciona explícitamente "camera/state inputs" en `log.txt`), aunque el número y disposición exacta de cámaras no está disponible en la información proporcionada.
- Ejecución de una tarea concreta aprendida de 10 demostraciones (identificada como `task10` en el nombre del repositorio).
- Conversión JAX a PyTorch ya realizada, lo que permite cargar el checkpoint desde Python con PyTorch sin reentrenar.
- No hay evidencia de soporte de tool calling, function calling, agentes multi-paso, matemáticas, código ni generación de texto: es un modelo de política, no un asistente conversacional.
- Capacidades multilingües: no disponibles ni documentadas.
- No se documenta modo de razonamiento explícito (thinking mode), ni entradas de audio.

## Casos de uso

- Manipulación con brazo Franka en laboratorio: cargar el checkpoint en el runtime de `openpi` y ejecutar la tarea 10 sobre un Franka real, usando las acciones cartesianas absolutas generadas y el fichero de normalización incluido. Es el uso previsto por el propio artefacto.
- Reproducción de experimentos de VLA: al estar el paso 10.000 identificado y el repositorio con nombre determinista (fecha, tarea y número de paso), sirve como punto de referencia para comparar curvas de aprendizaje con otros checkpoints de la misma serie.
- Fine-tuning sobre nuevas tareas con pocas demostraciones: el modelo ya está convertido a PyTorch bf16, de modo que se puede partir de él para reentrenar con un conjunto pequeño de demostraciones propias manteniendo la misma representación de acciones.
- Evaluación de conversión JAX a PyTorch: útil para verificar que la conversión no degrada el comportamiento de la política, comparando el mismo paso entre el checkpoint original en JAX y esta versión en PyTorch.
- Integración en un bucle de control cerrado: dado que la política devuelve un chunk de 50 pasos, se puede aplicar una ventana de ejecución (por ejemplo, ejecutar los primeros pasos y volver a inferir) típica de los métodos de action chunking.
- Investigación en representaciones de acción: permite estudiar el comportamiento de políticas entrenadas con acciones cartesianas absolutas frente a las que usan deltas, reutilizando el mismo entorno y robot.
- Docencia y experimentación con robótica open source: es un artefacto pequeño (7,2 GB) para los estándares actuales, lo que facilita desplegarlo en un laboratorio con una única GPU y comparar resultados con otros pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de evaluaciones, ni comparaciones con otros checkpoints de la serie. Tampoco hay datos de latencia de inferencia ni de frecuencia de control alcanzable.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7,2 GB solo para los pesos en bfloat16, más activaciones y buffers de imagen. En la práctica conviene reservar al menos 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 para despliegues de laboratorio con margen holgado. Cualquier GPU con 16 GB o más y soporte de bfloat16 debería poder cargar los pesos.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090. En GPUs de 12-16 GB es probable que quepa con precisión reducida o cargando por capas, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el runtime de `openpi` (el repositorio usa `library_name: openpi`) y carga directa de safetensors con PyTorch. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican aquí: no es un modelo de lenguaje con tokenizador de texto estándar, sino una política robótica con entradas multimodales específicas.
- Latencia y throughput: no disponibles. Para control en tiempo real hay que tener en cuenta que la política debe ejecutarse a la frecuencia del bucle de control del Franka, algo que no se puede validar con los datos publicados.

## Comparativa con modelos similares

No hay datos suficientes para comparar cuantitativamente este checkpoint con alternativas: la licencia, el contexto y las métricas de rendimiento de este repositorio no están disponibles. La comparación siguiente es cualitativa y debe tomarse como orientativa, no como una evaluación verificada.

| Modelo | Parámetros | Representación de acciones | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (openpi, pi05, step 10000) | 3,62 B | Cartesianas absolutas XYZ + cuaternión xyzw + pinza binaria; 50 pasos x 32 dims, 8 útiles | No disponible | Convertido de JAX a PyTorch bf16; entrenado para Franka |
| Otros checkpoints de la familia openpi / π₀.5 | No disponible | No disponible | No disponible | Misma librería; no verificable con la información disponible |
| π₀ (openpi) | No disponible | No disponible | No disponible | Modelo predecesor de la misma familia; detalles no verificados en esta búsqueda |
| OpenVLA y otros VLA abiertos | No disponible | No disponible | No disponible | Categoría funcionalmente similar, pero sin datos comparables obtenidos en esta búsqueda |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Es un bloqueo potencial para cualquier despliegue en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso, validación por terceros ni reportes de comportamiento en robot real.
- Es un artefacto de investigación con nombre autogenerado (fecha, tarea y paso), no un modelo publicado con documentación de soporte.
- Solo una tarea: el nombre indica `task10`, por lo que no debe esperarse generalización a otras tareas sin un fine-tuning adicional.
- Entrenado con 10 demostraciones: el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o fondo es alto.
- Representación de acción crítica: son acciones cartesianas absolutas, no deltas. Alimentar un controlador que espera incrementos puede producir movimientos bruscos o inseguros. Hay que leer `log.txt` para conocer el layout de salida, la frontera de normalización y las convenciones del controlador.
- Riesgo de ignorar el formato de salida: la salida tiene 32 coordenadas por paso pero solo las 8 primeras son acciones; usar el vector completo es un error.
- Normalización obligatoria: sin `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes, las predicciones no serán válidas.
- Idiomas, sesgos y alucinación: no disponibles ni aplicables en el sentido habitual de un modelo de lenguaje; al ser una política robótica, el modo de fallo relevante es la ejecución de acciones incorrectas, no la generación de texto falso.
- La model card indica que hay convenciones del controlador "que requieren confirmación", lo que implica que parte del contrato de integración no está cerrado por el autor.
- Antes de usar el modelo en hardware físico, hay que aplicar límites de par, velocidades y espacios de trabajo seguros de forma externa: el modelo no incorpora garantías de seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-10000
- `log.txt` del repositorio (layout de salida, normalización, entradas de cámara y estado, convenciones del controlador): https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-10000/blob/main/log.txt
- Estadísticas de normalización de Franka: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-10000/blob/main/assets/franka/norm_stats.json
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor ni la familia `pi05`/`openpi`; los resultados obtenidos eran contenido no relacionado (foros y sitios de temática ajena). No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales verificados para enlazar.
