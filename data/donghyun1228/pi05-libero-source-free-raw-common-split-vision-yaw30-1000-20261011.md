# Donghyun1228/pi05-libero-source-free-raw-common-split-vision-yaw30-1000-20261011

## Resumen

Este repositorio contiene un checkpoint experimental de política robótica construido sobre el ecosistema openpi y el modelo pi0.5 (pi05), desarrollado por el usuario Donghyun1228. No se trata de un modelo de lenguaje al uso, sino de una política visión-lenguaje-acción (VLA) orientada a manipulación robótica y evaluada sobre el benchmark LIBERO. El autor lo describe explícitamente como una "intervención sin nuevas actualizaciones de entrenamiento": el checkpoint se obtiene componiendo pesos ya existentes, no entrenando desde cero.

La intervención concreta consiste en un modelo compuesto de 74 hojas de parámetros (parameter leaves): 51 hojas del modelo objetivo (una política IDM de 1.000 actualizaciones) y 23 hojas de un encoder de muñeca recuperado de los pesos de origen y convertido a bfloat16. El encoder de cámara base del modelo objetivo permanece activo, mientras que las imágenes de muñeca pasan por el encoder restaurado. El resultado es un checkpoint de inferencia exportado en formato Orbax para JAX, con los pesos ya fusionados.

Su relevancia es acotada y muy específica: sirve como material de estudio para investigación en adaptación de políticas VLA sin observaciones del dominio fuente, y como referencia negativa o de diagnóstico dentro de una línea de experimentos del mismo autor. El propio autor advierte que la retención de éxito no ha sido establecida y que la evaluación es un cribado exploratorio de 400 episodios, no una confirmación de 2.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) basada en pi0.5 / openpi; no se detalla el backbone interno en la información disponible |
| Parametros totales | no disponible; el repositorio ocupa 6,8 GB y el modelo compuesto tiene 74 hojas de parámetros (51 del objetivo + 23 de muñeca de origen) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (inferencia); no se mencionan otras cuantizaciones |
| Idiomas soportados | no disponible (idioma de los prompts verbales sin especificar) |
| Licencia | no disponible |
| Formato de pesos | exportación de inferencia Orbax para JAX; incluye `params/` y `assets/donghyun/libero/norm_stats.json`; no incluye estado del optimizador |

## Arquitectura y entrenamiento

El checkpoint es una composición, no un entrenamiento. Según la model card, las 51 hojas del modelo objetivo (una política IDM de visión pura, tras 1.000 actualizaciones) se conservan exactamente, incluido su encoder de cámara base adaptado. Las imágenes de muñeca se procesan con un encoder `wrist_img` independiente, restaurado a partir de los pesos de visión del modelo de origen y convertido a bfloat16. El LLM objetivo, el decodificador de acciones y las proyecciones ya coincidían con los del origen tras su conversión de tipo guardada, por lo que no se modifican. El cómputo declarado es de cero actualizaciones adicionales del optimizador.

El modelo objetivo subyacente se describe como una adaptación con interacciones objetivo agnósticas a la tarea, sin observaciones del dominio fuente, sin caché de profesor emparejado, sin rollouts exitosos de tareas y sin retroalimentación de éxito. El origen es un checkpoint heredado alojado en una ruta de máquina de construcción (`/disk3/ryu/...`) cuyo SHA256 de metadatos de parámetros es `2912d15ba42fe0d742b5ac46e88804dacce69644369b4cf9b7405cf7d8fe7247`; el autor indica que no registra un repositorio público de Hugging Face verificado para ese origen. Los archivos de procedencia incluyen el marcador de commit del origen, los hashes exactos de las hojas de muñeca, una auditoría completa de composición y una auditoría de pesos congelados del objetivo.

## Capacidades

- Ejecución de políticas de manipulación robótica: genera acciones motoras a partir de observaciones visuales (cámara base y cámara de muñeca) y de la tarea especificada.
- Procesamiento multimodal visión-lenguaje-acción: integra imágenes de dos vistas (base y muñeca) con el condicionamiento textual de la tarea.
- Adaptación de dominio visual: el montaje separa el encoder de muñeca del encoder base, lo que permite estudiar transferencia de representaciones entre vistas.
- Evaluación estandarizada en LIBERO: el checkpoint está preparado para ejecutarse con el arnés de evaluación de LIBERO bajo MuJoCo 3.2.3.
- Inferencia en bfloat16 sobre JAX: exportación Orbax lista para cargar con la configuración `pi05_libero_source_free_split_vision_idm`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje, ni generación de texto general.

## Casos de uso

- Investigación en adaptación sin dominio fuente: el checkpoint permite reproducir y auditar un experimento de composición de pesos donde el modelo objetivo se adaptó sin observaciones del origen, usando solo pesos y normalización como entradas permitidas.
- Estudios de ablación de encoders por vista: al mantener separados el encoder base y el de muñeca, sirve para comparar el efecto de restaurar pesos de origen en una sola modalidad visual.
- Cribado exploratorio en LIBERO: con 400 episodios ya auditados (identidades y ajustes verificados, cero errores de rollout), es un punto de partida para diseñar evaluaciones confirmatorias de mayor tamaño.
- Reproducción de experimentos de VLA con openpi: el autor publica el código en `vla_adaptation` y la configuración de política, de modo que el checkpoint se puede cargar en un pipeline JAX existente para replicar resultados.
- Diagnóstico de colapso en tareas de horizonte largo: el desglose por suites (11/100 en Long) lo hace útil como caso de estudio de degradación en tareas de manipulación prolongada.
- Comparación de regímenes de evaluación: junto al resultado de view_large (256/400), permite analizar cuánto depende el rendimiento del marco de acción (yaw30) y de la vista empleada.
- Docencia y formación en robótica basada en aprendizaje: como ejemplo tangible de artefacto experimental con procedencia documentada, hashes y auditorías reproducibles.

## Benchmarks y rendimiento

Evaluación exploratoria completada por el autor sobre la condición yaw30, semilla 17, diez ensayos por tarea, inferencia BF16 sin cambios y sin parada temprana por umbral. Las 400 identidades de episodio y los ajustes fueron auditados de forma independiente con cero errores de rollout.

| Suite | Resultado |
|---|---|
| Spatial | 53/100 |
| Object | 23/100 |
| Goal | 47/100 |
| Long | 11/100 |
| Total | 134/400 (33,50 %) |

El mismo método sobre la condición view_large obtuvo 256/400 (64 %). El autor advierte expresamente que el resultado de view no implica una adaptación comparable en el marco de acción y que no se ajustó ninguna transformación de acción específica al cambio de dominio. Se trata de un cribado exploratorio de 400 episodios, no de una confirmación de 2.000, y la retención con destilación emparejada (paired-KD) permanece sin demostrar. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 6,8 GB, por lo que los pesos en bfloat16 rondan esa cifra; hay que sumar memoria para activaciones, imágenes de dos vistas y el estado de inferencia de MuJoCo.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, una GPU con 12-16 GB o más debería ser suficiente en bfloat16, aunque no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más (por ejemplo, RTX 4080/4090 en adelante), siempre que se disponga de soporte JAX/CUDA; no confirmado en la documentación.
- Opciones de despliegue: exportación Orbax cargada con JAX mediante la configuración `pi05_libero_source_free_split_vision_idm` del repositorio `vla_adaptation`. Requiere `mujoco==3.2.3` para la evaluación en LIBERO. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables por tratarse de una política VLA y no de un LLM generativo servible por esos runtimes.
- Restricción de configuración: el autor indica que una configuración de encoder compartido no debe cargar este checkpoint; hay que usar los ajustes exactos de `model_config.json`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Contexto | Resultado reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (`...split-vision-yaw30-1000-20261011`) | Composición VLA (74 hojas: 51 objetivo + 23 muñeca origen) | Cero actualizaciones de optimizador | no disponible | 134/400 (33,50 %) en yaw30 | no disponible | Público en Hugging Face |
| `pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011` | Checkpoint objetivo de 51 hojas (IDM de visión pura) | 1.000 actualizaciones | no disponible | no disponible en esta información | no disponible | Público en Hugging Face (commit `830aa419...`) |
| `pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003` | Adaptación pi0.5 LIBERO con KD de representación | 10.000 actualizaciones (paso final 9999) | no disponible | no disponible en esta información | no disponible | Público en Hugging Face |
| pi0.5 / openpi (modelo base del ecosistema) | VLA de propósito general | no disponible | no disponible | no disponible | no disponible | Repositorio `Physical-Intelligence/openpi` |

## Limitaciones y advertencias

- El autor declara explícitamente que se trata de una intervención sin nuevas actualizaciones de entrenamiento y que la retención de éxito no ha sido establecida.
- El resultado de 134/400 (33,50 %) corresponde a un cribado exploratorio, no a una confirmación; el propio autor lo califica como tal.
- El rendimiento en la suite Long es muy bajo (11/100), lo que limita su uso en tareas de manipulación de horizonte largo.
- El resultado depende fuertemente de la condición de evaluación: 33,50 % en yaw30 frente a 64 % en view_large con el mismo método, y el autor advierte que no se ajustó ninguna transformación de acción específica al cambio.
- La retención con destilación emparejada (paired-KD) permanece sin demostrar.
- No se registra licencia, lo que impide determinar si el uso comercial está permitido; debe considerarse no apto para producción hasta aclarar este punto.
- No se documentan idiomas soportados ni sesgos conocidos; al ser una política robótica, el riesgo relevante no es la alucinación textual sino la ejecución de acciones incorrectas en el dominio físico.
- El estado del optimizador no se incluye, por lo que el checkpoint no sirve para reanudar entrenamiento, solo para inferencia.
- No se registra un repositorio público verificado para el checkpoint de origen; las rutas de máquina de construcción que aparecen en las auditorías son procedencia, no URL de descarga.
- Las dependencias son estrictas: JAX, exportación Orbax, la configuración de política exacta y `mujoco==3.2.3`. Cargarlo con una configuración de encoder compartido provoca un fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-split-vision-yaw30-1000-20261011
- Checkpoint objetivo (IDM de visión pura, commit `830aa419336cea593445e81f97770f21452e0060`): https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011/tree/830aa419336cea593445e81f97770f21452e0060
- Repositorio de código de adaptación (commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`): https://github.com/Donghyun1228/vla_adaptation/tree/0f6471d99dfc81fabe7c3ab65c141d7640b9ff08
- Checkpoint relacionado `pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003`: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Repositorio openpi de Physical Intelligence: https://raw.githubusercontent.com/Physical-Intelligence/openpi/refs/heads/main/README.md
- Reproducción de pi05 con ejemplos de LIBERO (Integer003/openpi05): https://github.com/Integer003/openpi05
- Ejemplos de LIBERO en ese repositorio: https://github.com/Integer003/openpi05/tree/main/examples/libero
