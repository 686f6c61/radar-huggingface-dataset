# siruku6/pi05_combined_cont4k

## Resumen

`siruku6/pi05_combined_cont4k` es un checkpoint de política robótica de tipo vision-language-action (VLA) obtenido por ajuste fino de todos los parámetros de π0.5 (pi0.5), la arquitectura de Physical Intelligence cuya implementación de referencia es openpi. El modelo parte de `siruku6/pi05_combined_initpose_full` (checkpoint `005500`), que a su vez deriva de `lerobot/pi05_libero_base` (revisión `a217bfd3b14673cf2ce597e69997ab21866438dd`), y se entrena durante 4.000 pasos adicionales sobre el conjunto de datos `local/libero_combined_bowl5_initpose`, compuesto por 111 tareas y 21.642 episodios. El resultado es un policy de 4,14B de parámetros con el codificador de visión y el modelo de lenguaje-visión descongelados.

El interés del repositorio es fundamentalmente metodológico: el autor lo publica para dar transparencia y reproducibilidad a una comparación entre cuatro candidatos entrenados con distintas mezclas de datos de LIBERO. En la validación Track2 del proyecto, este checkpoint obtiene una puntuación ponderada de 0,3280 frente a 0,3412 del candidato finalmente seleccionado (`pi05_bowl5_full`), una diferencia de -0,013 que queda por debajo del margen de "sin diferencia significativa" (0,02) fijado por el proyecto. La prueba de signos emparejada sobre 420 ensayos da p=0,063, por lo que la elección del otro candidato se decidió por orden de desempate más que por una superioridad estadísticamente clara.

Se trata, por tanto, de un artefacto de investigación orientado a simulación (benchmark LIBERO/LIBERO-plus), no de un modelo de propósito general: no genera texto libre ni código, sino secuencias de acciones (action chunks) a partir de observaciones visuales e instrucciones de tarea. No tiene descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5; backbone VLM basado en PaliGemma (Gemma) con cabecera de acciones. Detalle interno completo: no disponible |
| Parametros totales | 4,14 mil millones (4,14B), todos entrenables en este ajuste |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos sin cuantizar (`model.safetensors`) |
| Idiomas soportados | no disponible; el entrenamiento usa instrucciones de tarea del benchmark LIBERO (presumiblemente en inglés, no confirmado en la informacion proporcionada) |
| Licencia | Gemma Terms of Use (Model Derivative de Gemma a traves de PaliGemma); se aplica tambien la Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (`model.safetensors`), libreria LeRobot (`lerobot`) |
| Tamano del repositorio | 9,4 GB |
| Pipeline | robotics |
| Chunk de acciones | `chunk_size=50`, `n_action_steps=10` |

## Arquitectura y entrenamiento

La arquitectura subyacente es π0.5, un modelo vision-language-action que combina un backbone de visión-lenguaje (PaliGemma, construido sobre Gemma) con un módulo experto de acciones que produce secuencias de acciones continuas. El autor no documenta en esta ficha cambios estructurales respecto al modelo base: lo único modificado en el repositorio es `model.safetensors`, resultado de actualizaciones por gradiente, mientras que el resto de ficheros heredados del checkpoint base permanecen intactos. El ajuste se realizó con entrenamiento de parámetros completos (4,14B), incluyendo codificador de visión y VLM sin congelar.

El entrenamiento parte del checkpoint `005500` de `siruku6/pi05_combined_initpose_full` y añade 4.000 pasos con batch size 64, optimizador AdamW (lr 5e-6, weight decay 0,01, betas 0,9/0,95, grad clip norm 1,0) y aumento de imagen desactivado. El conjunto de datos es `local/libero_combined_bowl5_initpose` (111 tareas, 21.642 episodios), derivado de LIBERO y LIBERO-plus. La configuración exacta usada se conserva en `004000/train_config.json`. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa; tampoco el número de tokens de entrenamiento del modelo base original.

## Capacidades

- Generación de acciones robóticas: produce action chunks de 50 pasos (`chunk_size=50`) ejecutando 10 pasos por inferencia (`n_action_steps=10`) a partir de observaciones visuales e instrucciones de tarea.
- Manipulación robótica en simulación: entrenado y evaluado sobre tareas de LIBERO (111 tareas del conjunto combinado bowl5 con variación de pose inicial).
- Percepción visual integrada: el codificador de visión forma parte de los parámetros ajustados, por lo que procesa imágenes como entrada directa de la política.
- Ejecución multi-paso dentro de un episodio: la política opera sobre rollouts completos de episodios (la evaluación se realizó con 84 filas x 5 episodios).
- Seguimiento de instrucciones de tarea: condicionamiento por lenguaje natural en el estilo de las tareas LIBERO.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión general, audio, generación de código ni modo de pensamiento explícito.

## Casos de uso

- Evaluación comparativa de políticas VLA: el repositorio sirve como punto de referencia reproducible en la comparación de cuatro candidatos entrenados con distintas mezclas de datos (Track2 y LIBERO90-half), con puntuaciones y pruebas estadísticas documentadas.
- Reproducción de experimentos de ajuste fino continuado: permite repetir el régimen de 4.000 pasos adicionales con batch 64 y lr 5e-6 sobre el checkpoint `005500` para verificar la recuperación parcial de rendimiento descrita por el autor.
- Investigación sobre selección de datos en robótica: al compararse con `pi05_bowl5_full` (entrenado sobre `libero_plus_bowl5`), es útil para estudiar cuánto rendimiento se pierde por la elección de la mezcla de datos y cuánto se recupera con entrenamiento adicional.
- Estudio de compromiso éxito-colisión: con una tasa de éxito de 0,755 y una tasa de colisión de 0,162, es adecuado para analizar políticas con alta tasa de éxito pero mayor propensión a colisiones que el candidato seleccionado (0,798 / 0,138).
- Punto de partida para nuevos ajustes: al ser un checkpoint intermedio con pesos completos en safetensors, puede reutilizarse como inicialización de experimentos posteriores sobre LIBERO.
- Docencia y divulgación sobre VLA: sirve para ilustrar el flujo completo de LeRobot y openpi (carga del policy, evaluación en entorno simulado, comparación de checkpoints) sin necesidad de un robot físico.
- Análisis de reproducibilidad y trazabilidad de artefactos: la cadena de dependencias documentada (`lerobot/pi05_libero_base` -> `pi05_combined_initpose_full` -> este checkpoint) permite auditar linajes de modelos derivados.

## Benchmarks y rendimiento

Se presentan los resultados de evaluación publicados por el autor. Son métricas del protocolo de validación Track2 del proyecto (84 filas x 5 episodios, renderizado EGL) y de LIBERO90-half, no benchmarks de lenguaje.

| Modelo | Track2 total | Tasa de exito | Tasa de colision | LIBERO90-half total | Puntuacion ponderada |
|---|---|---|---|---|---|
| `pi05_combined_cont4k` (este checkpoint) | 0,3801 | 0,755 | 0,162 | 0,1194 | 0,3280 |
| `pi05_bowl5_full` (candidato seleccionado) | 0,4055 | 0,798 | 0,138 | 0,0841 | 0,3412 |

Datos adicionales aportados por el autor: la diferencia de -0,013 en puntuación ponderada queda dentro del margen de "sin diferencia significativa" (0,02) del proyecto; la prueba de signos emparejada sobre 420 ensayos emparejados da p=0,063; y la comparación con el candidato `C` (`pi05_combined_initpose_full`) da p=0,026, es decir, este checkpoint supera significativamente a `C`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como estimación derivada del recuento de parámetros (4,14B), los pesos en bf16 ocuparían aproximadamente 8,3 GB y en fp32 aproximadamente 16,6 GB, a lo que habría que sumar activaciones, buffers de imagen y estado del entorno de simulación. Estas cifras son cálculos aritméticos, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño de pesos, una GPU con 24 GB o más (RTX 4090, L40S, A100, H100) sería el rango razonable para inferencia en bf16; no hay confirmación del autor.
- Cabe en GPU de consumo: no confirmado. Con 4,14B de parámetros, es plausible en tarjetas de 24 GB en bf16, pero la información disponible no lo verifica.
- Opciones de despliegue: el repositorio está etiquetado con `library_name: lerobot`, y la implementación de referencia de π0.5 es openpi (Apache 2.0). No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama; estos motores están orientados a modelos de lenguaje y no a políticas de acción continua.
- Latencia y throughput: no disponibles.
- Otros requisitos: la evaluación reportada se hizo con renderizado EGL, lo que implica un entorno gráfico sin servidor X; el entrenamiento y la evaluación sobre LIBERO requieren el simulador correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Puntuacion ponderada Track2 |
|---|---|---|---|---|---|
| `siruku6/pi05_combined_cont4k` | 4,14B (todos entrenables) | no disponible | Gemma Terms of Use | Publico en HuggingFace | 0,3280 |
| `siruku6/pi05_bowl5_full` (candidato seleccionado) | no disponible (misma familia pi0.5) | no disponible | Gemma Terms of Use (presumible) | Publico en HuggingFace | 0,3412 |
| `siruku6/pi05_combined_initpose_full` (candidato C) | 4,14B | no disponible | Gemma Terms of Use (presumible) | Publico en HuggingFace | no disponible (p=0,026 frente a este checkpoint) |
| `lerobot/pi05_libero_base` | no disponible | no disponible | no disponible | Publico en HuggingFace | no disponible |

Los tres primeros son variantes de la misma familia π0.5 y se diferencian por la mezcla de datos de ajuste fino y el número de pasos, no por arquitectura o tamaño. No se dispone de datos para comparar con alternativas de otras familias (por ejemplo, otras políticas VLA de LeRobot) en la información proporcionada.

## Limitaciones y advertencias

- No fue el checkpoint seleccionado por el propio autor: queda por detrás del candidato elegido tanto en puntuación Track2 (0,3801 frente a 0,4055) como en tasa de éxito (0,755 frente a 0,798).
- Mayor tasa de colisión que el candidato seleccionado (0,162 frente a 0,138), un aspecto crítico si se trasladara a un robot físico.
- Evaluado únicamente en simulación (LIBERO y LIBERO-plus); no hay evidencia de transferencia a hardware real (gap sim-to-real no cuantificado).
- Alcance restringido a las 111 tareas del dataset `libero_combined_bowl5_initpose`; se desconoce su comportamiento fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inconsistentes con la instrucción, no medido en la información disponible.
- Sesgos conocidos: no disponibles. Al derivar de Gemma y de datos LIBERO, puede heredar sesgos de esos artefactos, no documentados aquí.
- Idioma: no se especifica soporte multilingüe; las instrucciones del benchmark están en inglés, por lo que el uso en castellano no está validado.
- Licencia: es un Model Derivative de Gemma distribuido bajo los Gemma Terms of Use. El uso comercial está sujeto a dichos términos y a la Gemma Prohibited Use Policy, y cualquier redistribución debe incluir una copia de los términos para el receptor.
- Sin garantía: el autor lo distribuye "as-is", sin garantía de ningún tipo.
- Adopción nula registrada: 0 descargas y 0 "likes" en el momento de redactar esta ficha; no hay validación independiente por parte de la comunidad.
- Trazabilidad parcial: el dataset de entrenamiento se referencia como `local/libero_combined_bowl5_initpose`, con una ruta local en lugar de un identificador de repositorio público verificado en el texto de la model card (el autor apunta a `siruku6/libero_combined_bowl5_initpose` en HuggingFace).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siruku6/pi05_combined_cont4k
- Modelo base (checkpoint de partida): https://huggingface.co/siruku6/pi05_combined_initpose_full
- Modelo raiz de la cadena: https://huggingface.co/lerobot/pi05_libero_base (revision `a217bfd3b14673cf2ce597e69997ab21866438dd`)
- Dataset de entrenamiento citado: https://huggingface.co/datasets/siruku6/libero_combined_bowl5_initpose
- Implementacion de referencia de pi0.5 (openpi, Apache 2.0): https://github.com/Physical-Intelligence/openpi
- LIBERO (MIT): https://github.com/Lifelong-Robot-Learning/LIBERO
- LIBERO-plus (MIT): https://huggingface.co/datasets/Sylvest/LIBERO-plus
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo en la busqueda proporcionada; los enlaces devueltos no guardan relacion con el artefacto.
