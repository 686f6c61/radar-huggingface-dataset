# mickeykang/memvla-adapter-libero-checkpoints

## Resumen

MemVLA-Adapter LIBERO checkpoints es un repositorio de pesos publicado por el usuario mickeykang en HuggingFace que reúne 19 directorios de entrenamiento correspondientes a adaptadores LoRA afinados sobre OpenVLA, el modelo visión-lenguaje-acción (VLA) de código abierto para robótica. Los checkpoints provienen del fork MemVLA-Adapter (rama `final-release-v1-2026-05-04`) y se han evaluado sobre el benchmark LIBERO en su variante multi-vista de 9 cámaras. El repositorio no es un modelo entrenado desde cero, sino una colección de puntos de control reproducibles: cuatro de ellos "paper-final" y quince de ablación.

El problema que aborda es doble. Por un lado, facilita la reproducibilidad de los resultados de un paper sobre memoria y adaptación en políticas VLA, algo poco habitual en robótica, donde los pesos rara vez se publican junto con las configuraciones exactas de entrenamiento. Por otro, expone variantes controladas que permiten estudiar el efecto de decisiones concretas de diseño, como el número de vistas de cámara, la aleatorización de cámara, el uso de pose y el residual con puerta (`pose_gated_residual`) aplicado en la capa 24 del backbone.

La relevancia actual viene de la escasez de checkpoints VLA abiertos y evaluados de forma sistemática en tareas de manipulación de largo horizonte. Cada carpeta incluye pesos fusionados (`model.safetensors`), el adaptador LoRA (`adapter_model.safetensors`), configuraciones, estadísticas del dataset y registros de entrenamiento. El repositorio ocupa 44,4 GB y no declara licencia ni idiomas soportados, lo que limita su uso directo en producción sin aclarar antes las condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: OpenVLA, afinado con LoRA; el nombre del fork es VLA-Adapter / MemVLA-Adapter) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados `model.safetensors` y adaptador LoRA `adapter_model.safetensors`) |
| Pipeline declarado | robotics |
| Tamano del repositorio | 44,4 GB |
| Numero de checkpoints | 19 (4 paper-final + 15 de ablacion) |
| Hiperparametros LoRA declarados | r=64, dropout=0.0 |
| Learning rate declarado | 0.0002 |
| Tamanos de lote declarados | 32 y 64 |
| Fecha de creacion / actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los checkpoints son adaptadores LoRA de rango 64 y dropout 0.0 aplicados sobre OpenVLA, un modelo visión-lenguaje-acción que combina un backbone de lenguaje con codificadores visuales y emite acciones robotizadas discretizadas como tokens. El fork MemVLA-Adapter introduce una modificación denominada `pose_gated_residual` en la capa 24, que inyecta información de pose mediante una conexión residual con puerta; según los nombres de las carpetas, esta modificación convive con variantes que usan únicamente el modelo base. Todas las ejecuciones se hicieron con `image_aug` activado.

Las configuraciones de entrenamiento están codificadas en los nombres de los directorios y aportan información detallada: suites LIBERO `object`, `spatial`, `goal` y `libero_10` (denominada "long"); learning rate uniforme de 2e-4; lotes de 32 o 64; y múltiples variantes de vistas de cámara como `uniform3cam` (tres cámaras en selección uniforme), `camrand` (cámara aleatoria) y `single-agentview`. Los sufijos `nv0.2`, `nv0.3`, `nv0.4` y `nv0.6` parecen corresponder a configuraciones de ruido o de número de vistas, y `ALIGNED` a un ajuste de alineación entre entrenamiento y evaluación; ninguna de estas convenciones se documenta explícitamente en la tarjeta, por lo que deben confirmarse en el repositorio de código.

El número de pasos varía mucho entre checkpoints: los cuatro paper-final se seleccionaron en 60k (object), 65k (spatial), 135k (goal) y 85k (libero_10), mientras que las ablaciones se detuvieron entre 10k y 135k pasos. No se declara el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; en modelos VLA el ajuste se realiza normalmente mediante aprendizaje por imitación supervisada sobre demostraciones, pero esto no se confirma en la información disponible. Los scripts de evaluación esperan las carpetas de ejecución bajo `outputs/`, según el apartado §9–§10 de `REPRODUCE.md` del repositorio MemVLA-Adapter.

## Capacidades

- Generación de acciones robotizadas: el modelo traduce observaciones visuales e instrucciones en lenguaje natural a secuencias de acciones de manipulación, siguiendo el paradigma de OpenVLA.
- Percepción multi-vista: las ejecuciones paper-final se entrenaron y evaluaron en configuraciones multi-cámara, con variantes de tres cámaras en selección uniforme y de cámara aleatoria, además de configuraciones de vista única de agente.
- Integración de información de pose: la variante `pose_gated_residual--layer24` incorpora pose mediante una conexión residual con puerta en la capa 24.
- Manipulación de largo horizonte: la suite `libero_10` está diseñada para tareas de horizonte largo, con checkpoints que llegan hasta los 85k y 135k pasos.
- Ablación controlada: las 15 variantes de ablación permiten comparar decisiones de diseño (aumento de datos, aleatorización de cámara, número de vistas, alineación) manteniendo fijo el resto de la configuración.
- Generación de texto libre: no disponible; la información describe un modelo VLA orientado a acciones y no un modelo conversacional.
- Tool calling o function calling: no disponible; no se menciona soporte de herramientas.
- Capacidades de agente multi-paso: no disponible como capacidad declarada, más allá del control secuencial de políticas robóticas.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades de visión general, audio o modo de razonamiento explícito: no disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: descargar el repositorio completo con `hf download` y colocar las carpetas bajo `outputs/` permite replicar la evaluación del paper sobre LIBERO sin reentrenar, siguiendo las instrucciones de `REPRODUCE.md` §9–§10 del repositorio MemVLA-Adapter.
- Estudio de ablaciones de vistas de camara: las variantes `single-agentview`, `camrand` y `uniform3cam` permiten cuantificar cuánta precisión aporta cada esquema de selección de cámara en las suites object, spatial, goal y libero_10, usando configuraciones idénticas en el resto de hiperparámetros.
- Analisis de la contribucion del modulo de pose: comparar el checkpoint `pose_gated_residual--layer24` con las variantes `base` de la misma suite y el mismo número de pasos aproximado aísla el efecto de la conexión residual con puerta.
- Punto de partida para fine-tuning en un robot propio: al distribuirse el adaptador LoRA junto con los pesos fusionados, un equipo puede cargar el adaptador, continuar el ajuste sobre su propio dataset de demostraciones y comparar contra la línea base publicada.
- Evaluacion de robustez ante cambios de camara: las variantes con `camrand` y distintos valores de `nv` sirven como punto de comparación para medir la degradación de la política cuando la cámara de inferencia no coincide con la de entrenamiento.
- Seleccion de checkpoints por coste computacional: al existir puntos de control en 10k, 12k, 21k, 25k, 30k, 35k, 36k, 40k, 60k, 65k, 81k, 84k, 85k, 125k y 135k pasos, es posible estudiar la relación entre presupuesto de entrenamiento y éxito en tarea, en lugar de asumir que el checkpoint final es siempre el mejor.
- Docencia y prototipado en robotica: el repositorio ofrece políticas ya entrenadas y configuraciones completas, lo que reduce la barrera para montar un entorno de simulación LIBERO y experimentar con políticas VLA sin acceso a un clúster de entrenamiento.
- Auditoria de degradacion por sobreajuste al simulador: los registros y estadísticas de dataset incluidos en cada carpeta permiten revisar curvas de pérdida y detectar si un checkpoint con más pasos ha empezado a sobreajustar a la suite concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo describe que los checkpoints se evaluaron sobre el benchmark LIBERO multi-vista de 9 cámaras, pero el contenido extraído no incluye tasas de éxito ni métricas numéricas para ninguna de las cuatro ejecuciones paper-final ni para las quince de ablación. La búsqueda web realizada no devolvió ninguna fuente relevante: los resultados obtenidos corresponden a páginas de inicio de sesión de Facebook, sin relación con el modelo.

Para obtener cifras verificables habría que consultar el repositorio MemVLA-Adapter, en particular el apartado de evaluación de `REPRODUCE.md`, y el paper asociado si estuviera publicado.

## Requisitos de hardware

- VRAM para inferencia: no publicada. Como referencia, un VLA basado en OpenVLA maneja pesos del orden de miles de millones de parámetros, por lo que se necesita una GPU con al menos 24 GB para cargar pesos fusionados en precisión de 16 bits junto con los codificadores visuales y las activaciones. Esta estimación es orientativa y no procede de la información proporcionada.
- Cuantizacion: no se documentan variantes cuantizadas en el repositorio. Cualquier despliegue en 8 o 4 bits requeriría aplicar el procedimiento de cuantización del código base de OpenVLA (por ejemplo, bitsandbytes) y validar la pérdida de precisión en las acciones.
- GPUs recomendadas: no declaradas. Para entrenamiento LoRA con los tamaños de lote indicados (32 y 64) y r=64, lo habitual es disponer de A100 40/80 GB o H100 80 GB; para inferencia en 16 bits, una RTX 4090 o RTX 3090 de 24 GB puede ser suficiente con lotes pequeños.
- GPU de consumo: no confirmado por el autor. Es plausible en tarjetas de 24 GB en modo inferencia, pero no hay validación publicada en la información disponible.
- Almacenamiento: el repositorio completo ocupa 44,4 GB. Conviene tener en cuenta que el tamaño es inferior al que resultaría de almacenar 19 copias de pesos fusionados de un VLA de gran tamaño, por lo que es probable que parte de las carpetas contengan únicamente el adaptador LoRA; la tarjeta no detalla qué contiene cada checkpoint.
- Opciones de despliegue: los scripts del fork MemVLA-Adapter (`vla-scripts/finetune.py` para el guardado; scripts de evaluación que esperan las carpetas bajo `outputs/`) y el ecosistema de OpenVLA basado en HuggingFace Transformers. No se menciona compatibilidad con vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye métricas propias ni datos de los modelos comparables, por lo que la tabla se limita a lo declarado en la tarjeta y marca como no disponible todo lo que no se especifica. Las alternativas listadas son modelos de la misma categoría (políticas visión-lenguaje-acción para manipulación), pero sus cifras no se han verificado en esta búsqueda.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memvla-adapter-libero-checkpoints | Este repositorio | no disponible | no disponible | no disponible | Pesos publicados en HuggingFace, 0 descargas |
| OpenVLA | Modelo base declarado del que parten los adaptadores LoRA | no disponible | no disponible | no disponible | Proyecto de código abierto, referenciado indirectamente |
| MemVLA-Adapter / VLA-Adapter | Fork del que proceden los checkpoints | no disponible | no disponible | no disponible | Repositorio en GitHub (MinJunKang/MemVLA-Adapter) |
| Otras politicas VLA para LIBERO | Alternativas de la misma tarea | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de ninguno de los modelos de la tabla, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Cualquier uso comercial queda en situación jurídica indeterminada y debe aclararse con el autor antes de integrarlo en un producto.
- Dependencia de la licencia del modelo base: al ser un ajuste LoRA sobre OpenVLA, las condiciones de uso del modelo subyacente siguen aplicándose aunque no se indiquen en esta tarjeta.
- Ausencia de benchmarks verificables: la tarjeta afirma evaluación en LIBERO multi-vista de 9 cámaras, pero no publica tasas de éxito. No se puede afirmar ningún nivel de rendimiento a partir de la información disponible.
- Riesgo de sobreajuste al simulador: los checkpoints están entrenados y evaluados sobre el benchmark LIBERO, un entorno simulado. El comportamiento en un robot real no está documentado y probablemente requerirá ajuste adicional.
- Ambigüedad en la nomenclatura: las convenciones de los nombres de carpeta (`nv0.2`, `nv0.3`, `nv0.4`, `nv0.6`, `ALIGNED`, `camrand`, `pose_gated_residual--layer24`) no se explican en la tarjeta. Interpretarlas mal puede llevar a seleccionar el checkpoint equivocado.
- Idiomas no declarados: se desconoce si las instrucciones de lenguaje natural que aceptan los checkpoints se limitan al inglés de LIBERO o generalizan a otros idiomas.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y procede de un autor individual. No hay evidencia externa de replicación independiente en la información disponible.
- Contenido del repositorio no detallado: se desconoce cuántos checkpoints incluyen pesos fusionados completos y cuántos solo el adaptador LoRA, lo que afecta a los requisitos de disco y a cómo deben cargarse.
- Reproducibilidad dependiente de código externo: la evaluación requiere seguir instrucciones de un repositorio de GitHub distinto (apartados §9–§10 de `REPRODUCE.md`), sin que se especifiquen versiones de dependencias en la información proporcionada.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo, y en robótica los sesgos suelen aparecer en la distribución de tareas, objetos y entornos del dataset de entrenamiento.
- Riesgo de alucinación: en un modelo de acciones, el equivalente es la generación de trayectorias plausibles pero incorrectas o inseguras. No se documentan mecanismos de seguridad ni de parada ante fallos.

## Enlaces

- HuggingFace: https://huggingface.co/mickeykang/memvla-adapter-libero-checkpoints
- Repositorio del fork: https://github.com/MinJunKang/MemVLA-Adapter
- Fichero de reproduccion: `REPRODUCE.md` (apartados §9–§10) en el repositorio anterior, citado en la tarjeta del modelo
- Script de entrenamiento citado: `vla-scripts/finetune.py`
- Paper: no disponible en la informacion proporcionada
- Demo: no disponible
- Resultados de busqueda web: sin resultados relevantes (devueltos como paginas de inicio de sesion de Facebook)
