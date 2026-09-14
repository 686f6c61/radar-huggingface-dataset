# Dongkkka/groot-task0003-v4-80k

## Resumen

groot-task0003-v4-80k es una política robótica de tipo vision-language-action (VLA) publicada por el usuario Dongkkka en HuggingFace. Se trata de un ajuste de la familia GR00T N1.7, la arquitectura de modelos fundacionales para robótica humanoide desarrollada por NVIDIA, entrenada específicamente sobre la tarea Task0003 (SeparateRecycling) hasta 80.000 pasos de optimizador. No es un modelo de lenguaje conversacional: su salida son acciones de control para un robot, condicionadas por observaciones visuales y, presumiblemente, instrucciones de la tarea.

El repositorio contiene únicamente los pesos finales de la política (aproximadamente 3.144 millones de parámetros en formato safetensors, 12,6 GB), junto con la configuración del modelo, la configuración del procesador, el mapeo de embodiment y las estadísticas de normalización. La configuración referencia `nvidia/Cosmos-Reason2-2B` como arquitectura y procesador del backbone, por lo que su carga requiere acceso a ese modelo. El encoder visual empleado es un encoder V4 afinado en visión que permaneció congelado durante el entrenamiento de la política.

Su relevancia es acotada y muy específica: se trata de un artefacto de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin licencia declarada y sin resultados de evaluación publicados más allá de una pérdida de entrenamiento de 0,0070. Resulta útil como ejemplo de pipeline de entrenamiento de políticas GR00T N1.7 y como punto de partida para experimentos de fine-tuning, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política vision-language-action (VLA) de la familia GR00T N1.7, con backbone referenciado `nvidia/Cosmos-Reason2-2B` y encoder visual V4 afinado en visión (congelado durante el entrenamiento de la política) |
| Parametros totales | 3.144.016.000 (unos 3,14 mil millones) |
| Parametros activos | No disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible (modelo de acción, no de generación de texto) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors. El tamaño (12,6 GB para 3,14 mil millones de parámetros) es coherente con pesos en fp32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Etiquetas | safetensors, Gr00tN1d7, robotics, gr00t, task0003, region:us |
| Tamano del repositorio | 12,6 GB |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el artefacto como una política GR00T N1.7 entrenada sobre la tarea Task0003 SeparateRecycling durante 80.000 pasos de optimizador. La inicialización visual emplea un encoder V4 afinado en visión, y ese backbone visual se mantuvo congelado durante todo el entrenamiento de la política, de modo que solo se actualizaron las partes correspondientes a la política y a la proyección hacia el espacio de acciones. La configuración del modelo referencia explícitamente `nvidia/Cosmos-Reason2-2B` para la arquitectura del backbone y el procesador, lo que implica que la carga requiere acceso a ese modelo y a sus activos de procesamiento. Los 3,14 mil millones de parámetros declarados son compatibles con un backbone de aproximadamente 2 mil millones más la cabeza de acciones y el encoder visual, aunque el desglose exacto por componente no está publicado.

El único dato cuantitativo de entrenamiento disponible es la pérdida final registrada: 0,0070. El propio autor advierte de que se trata de una métrica de entrenamiento y no de una puntuación de evaluación sobre un conjunto reservado, por lo que no debe interpretarse como evidencia de rendimiento o de generalización. El repositorio incluye los pesos finales, la configuración, la configuración del procesador, el mapeo de embodiment y las estadísticas de normalización, pero no el estado del optimizador, del scheduler ni de RNG, que quedaron en el checkpoint de entrenamiento original. No se documentan en la información disponible el volumen de datos, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo sobre la política.

## Capacidades

- Generación de acciones de control robótico para una tarea concreta de manipulación: separación de residuos (Task0003 SeparateRecycling).
- Procesamiento multimodal de entrada visual: al incorporar un encoder visual V4, la política consume observaciones de cámara además del estado del robot y del contexto de tarea.
- Integración con un embodiment específico mediante el mapeo de embodiment incluido en el repositorio y las estadísticas de normalización asociadas.
- Carga mediante el runtime compatible de políticas Isaac-GR00T N1.7, que es el mecanismo de ejecución previsto por el autor.
- Capacidad de servir como punto de partida para fine-tuning sobre nuevas tareas dentro del ecosistema GR00T N1.7.
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso explícito.
- No consta modo thinking, ni entrada o salida de audio.
- No consta capacidad multilingüe ni generación de texto libre; aunque el backbone referenciado es un modelo de lenguaje y visión, esta ficha no puede confirmar comportamientos de generación de texto en el artefacto publicado.

## Casos de uso

- Automatización de una celda de triaje de residuos: la política está entrenada específicamente para SeparateRecycling, por lo que puede emplearse para generar las acciones de manipulación de una celda de separación, siempre que el embodiment y las cámaras coincidan con los definidos en el mapeo incluido.
- Reproducción de experimentos de investigación en VLA: el repositorio incluye configuración, procesador y estadísticas de normalización, lo que permite reproducir la inferencia en el runtime Isaac-GR00T N1.7 y comparar contra el checkpoint original.
- Fine-tuning sobre tareas derivadas: al ser un checkpoint final de política con backbone visual congelado, resulta un punto de partida razonable para reentrenar la cabeza de acciones en tareas de reciclaje similares sin repetir el preentrenamiento visual.
- Evaluación en simulación con Isaac Sim / Isaac Lab: el ecosistema Isaac-GR00T está pensado para ejecutar y evaluar políticas en entornos simulados antes de trasladarlas a hardware, lo que permite medir tasas de éxito por tarea.
- Docencia y divulgación técnica: sirve como ejemplo tangible de estructura de un repositorio de política GR00T (pesos, processor config, embodiment mapping y normalización) para explicar cómo se empaqueta un modelo de acción.
- Investigación sobre congelación de backbones visuales: permite estudiar el efecto de entrenar solo la política sobre un encoder V4 congelado frente a alternativas con ajuste completo.
- Pruebas de integración de runtime: útil para validar que un pipeline de despliegue es capaz de resolver las dependencias del backbone `nvidia/Cosmos-Reason2-2B` y de cargar safetensors de 12,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico aportado por el autor es la pérdida final de entrenamiento (0,0070), que él mismo califica explícitamente como métrica de entrenamiento y no como puntuación de evaluación sobre un conjunto reservado. No hay tasas de éxito por tarea, ni comparaciones con otras políticas, ni resultados en suites como LIBERO, SimplerEnv o RoboArena.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida final de entrenamiento | 0,0070 | Metrica de entrenamiento, no de evaluacion held-out |
| Pasos de optimizador | 80.000 | Segun la model card |
| Tasa de exito en tarea | No disponible | No publicada |
| Benchmarks estandar de robotica | No disponible | No publicados |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (3,14 mil millones) y del tamaño del repositorio (12,6 GB), no datos publicados por el autor:

- VRAM para inferencia en fp32: en torno a 12,6 GB solo para pesos, con 14-16 GB recomendables contando activaciones y buffers de imagen.
- VRAM para inferencia en bf16/fp16: en torno a 6,3 GB de pesos, con 8-10 GB recomendables.
- VRAM para inferencia en int8: en torno a 3,2 GB de pesos, más activaciones; no hay confirmación de que existan pesos cuantizados publicados.
- VRAM para inferencia en int4: en torno a 1,6 GB de pesos, más activaciones; igualmente sin confirmación de disponibilidad.
- GPU de gama alta recomendadas: A100 (40 o 80 GB), H100 (80 GB) o L40S (48 GB), especialmente si se ejecutan varios entornos en paralelo.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) pueden alojar los pesos en fp32 con margen limitado; tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti deberían usar bf16 o cuantización.
- Tarjetas de 8 GB: solo viables con cuantización agresiva y contando con la memoria adicional que exige el procesador del backbone.
- Opciones de despliegue: el autor indica que debe cargarse con el runtime compatible de políticas Isaac-GR00T N1.7. No se mencionan vLLM, TGI, llama.cpp u Ollama, que además no son formatos habituales para políticas VLA.
- Dependencias adicionales: es necesario disponer de acceso a `nvidia/Cosmos-Reason2-2B` y a sus activos de procesador, ya que la configuración los referencia.
- Latencia y throughput: no disponible. Dependen del embodiment, del número de cámaras, de la frecuencia de control y de si la inferencia se realiza en simulación o en hardware real.

## Comparativa con modelos similares

Los datos de terceros provienen de la documentación pública de cada proyecto y deben verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| groot-task0003-v4-80k (este modelo) | 3,14 mil millones | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Politica de tarea unica, requiere runtime Isaac-GR00T N1.7 |
| GR00T N1 (NVIDIA) | Aproximadamente 2,2 mil millones | No disponible | Consultar ficha oficial de NVIDIA | Pesos publicos en HuggingFace | Modelo fundacional del que deriva la familia N1.7; proposito general frente a tarea unica |
| OpenVLA | Aproximadamente 7 mil millones | No disponible | Consultar repositorio oficial | Pesos publicos en HuggingFace | Politica VLA de proposito general con mayor numero de parametros |
| pi0 (Physical Intelligence) | Aproximadamente 3,3 mil millones | No disponible | Consultar ficha oficial | Pesos publicos en HuggingFace | Tamano comparable, orientado a control de robot de proposito general |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial del modelo es jurídicamente indeterminado. No debe desplegarse en producción sin aclarar este punto con el autor.
- Modelo de tarea única: está entrenado sobre Task0003 SeparateRecycling. No hay evidencia de generalización a otras tareas, objetos, cámaras o brazos distintos.
- Métrica de entrenamiento, no de evaluación: la pérdida de 0,0070 puede reflejar sobreajuste a la distribución de entrenamiento. El autor lo advierte de forma explícita.
- Sin benchmarks publicados: no existen tasas de éxito ni comparaciones con otras políticas, por lo que no es posible estimar su rendimiento real.
- Acoplamiento al embodiment: el mapeo de embodiment y las estadísticas de normalización incluidos son específicos; usar un robot con cinemática, sensores o frecuencia de control distintos puede invalidar las acciones generadas.
- Dependencia de terceros: la carga exige acceso a `nvidia/Cosmos-Reason2-2B` y a su procesador, lo que añade una dependencia externa y posibles requisitos de aceptación de condiciones.
- Estado incompleto para reanudar entrenamiento: no se incluyen estados de optimizador, scheduler ni RNG, de modo que no es posible continuar el entrenamiento exactamente desde este punto.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar la ficha. No hay evidencia independiente de que funcione.
- Idiomas y sesgos: no hay información sobre idiomas soportados. Cualquier sesgo heredado del backbone `Cosmos-Reason2-2B` o del dataset de la tarea es desconocido.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en el robot, especialmente fuera de la distribución de entrenamiento.
- Advertencia de seguridad física: al controlar hardware real, deben implementarse límites de par, paradas de emergencia y validación en simulación antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/groot-task0003-v4-80k
- Backbone referenciado en la configuracion: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Repositorio del runtime Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Paper de GR00T N1: https://arxiv.org/abs/2503.14734

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; todos los enlaces a terceros citados provienen de referencias publicas de los proyectos correspondientes y deben verificarse en su origen.
