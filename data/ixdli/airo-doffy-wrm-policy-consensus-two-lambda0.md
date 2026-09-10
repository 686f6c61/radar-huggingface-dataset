# IXDLI/AIRO-Doffy-WRM-policy-consensus-two-lambda0

## Resumen

AIRO-Doffy-WRM-policy-consensus-two-lambda0 es un checkpoint de política robótica publicado en HuggingFace por el usuario IXDLI dentro del proyecto AIRO-Doffy, asociado a la Universidad de Gante (la ruta de origen del entrenamiento contiene `/project_ghent/AIRO-Doffy/`). No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de aprendizaje automático para control robótico, etiquetado con el pipeline `robotics` y distribuido como pesos PyTorch (`last.pt`). El repositorio pesa 11,5 GB e incluye el checkpoint final (paso 100000), checkpoints intermedios en los pasos 40000, 50000, 60000 y 70000, pesos EMA, normalizadores y ficheros de configuración.

La información pública disponible es muy escasa. La model card se limita a indicar que el entrenamiento se completó el 9 de septiembre de 2026, el identificador de trabajo (`c0336d7b-7510-46e1-8630-af5c9a122fda`) y la ruta de origen, de la que se deduce el nombre de la tarea: `WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness`. Ese nombre apunta a una política de agarre (grasp) de cilindros de distintos tamaños, con percepción en escala de grises (gray) y algún criterio de firmeza o presión de agarre (tightness). El sufijo `cluster14_bs32_lambda0` sugiere un entrenamiento con 14 clústeres, tamaño de lote 32 y un hiperparámetro lambda fijado a 0, aunque estos detalles no se documentan.

Su relevancia es limitada fuera del contexto de investigación para el que se generó. Se trata de un checkpoint intermedio de un pipeline interno, sin licencia declarada, sin idiomas declarados, sin descargas ni likes y sin resultados de benchmarks publicados. La model card indica que debe cargarse con la función `load_policy` del paquete `AIRO-Doffy policies.realman_beaver.checkpoint`, lo que sugiere que está pensado para un robot Realman en la variante "Beaver". Todo lo demás —arquitectura, número de parámetros, datos de entrenamiento y rendimiento— no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoint PyTorch de una política robótica; tipo de red no documentado) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplicable (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (`last.pt` más checkpoints de los pasos 40000, 50000, 60000 y 70000, pesos EMA, normalizadores y configuración) |
| Pipeline declarado | `robotics` |
| Librería | `pytorch` |
| Autor | IXDLI |
| Tarea inferida del nombre | `WRM_grasp_cylinder_different_sizes_lero_recollect_gray_tightness` (agarre de cilindros de distintos tamaños, percepción en escala de grises) |
| Último paso de entrenamiento | 100000 |
| Fecha de finalización del entrenamiento | 9 de septiembre de 2026 |
| Identificador de trabajo | `c0336d7b-7510-46e1-8630-af5c9a122fda` |
| Tamaño del repositorio | 11,5 GB |
| Descargas / likes | 0 / 0 |
| Carga prevista | `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura de red. El repositorio se distribuye como pesos PyTorch y la model card no describe el tipo de modelo (transformer, red convolucional, política de difusión, flow matching u otra). El nombre `policy_consensus_two` sugiere algún esquema de consenso entre dos políticas, pero no hay documentación que lo confirme ni que detalle cómo se combinan.

Respecto al entrenamiento, los únicos datos verificables son la fecha de finalización (9 de septiembre de 2026), el paso final (100000) y la existencia de checkpoints intermedios en 40000, 50000, 60000 y 70000, además de pesos EMA. La ruta de origen contiene los identificadores `cluster14` y `bs32`, que apuntan a 14 clústeres y a un tamaño de lote de 32, y `lambda0`, que apunta a un coeficiente lambda igual a 0. No se especifica el volumen de datos, la composición del conjunto de entrenamiento, ni si se emplearon técnicas de ajuste como RLHF, DPO o aprendizaje por imitación. Tampoco se documentan innovaciones técnicas concretas.

## Capacidades

- Control robótico para tareas de agarre: el nombre del experimento indica agarre de cilindros de distintos tamaños, por lo que la política estaría especializada en esa familia de objetos.
- Percepción en escala de grises: la etiqueta `gray` en la ruta de origen sugiere que el modelo trabaja con entradas de imagen en escala de grises, no en color.
- Control de firmeza o presión de agarre: la etiqueta `tightness` sugiere que la política modela algún criterio de fuerza o firmeza al sujetar el objeto.
- Reorganización o recolección de objetos: la etiqueta `recollect` apunta a una tarea de recogida y recolocación.
- Integración con una plataforma robótica concreta: la función de carga indicada (`policies.realman_beaver.checkpoint.load_policy`) vincula el checkpoint a un robot Realman en variante Beaver.
- No disponible: no hay información sobre soporte de tool calling, uso como agente, capacidades multilingües, modo de razonamiento explícito, visión en color, audio ni ninguna otra capacidad de modelo generativo.

## Casos de uso

- Investigación en manipulación robótica: el checkpoint puede utilizarse como punto de partida o como referencia en experimentos de agarre de cilindros de distintos tamaños, aprovechando que se incluyen checkpoints intermedios para estudiar la evolución del entrenamiento.
- Comparación de puntos de control: al distribuir los pasos 40000, 50000, 60000, 70000 y 100000, permite analizar cómo cambia el comportamiento de la política a lo largo del entrenamiento y detectar posibles sobreajustes o mesetas de rendimiento.
- Reproducción de experimentos internos: la inclusión de normalizadores, configuración y pesos EMA facilita reproducir la evaluación exacta del entrenamiento original dentro del proyecto AIRO-Doffy.
- Ajuste fino sobre una tarea de agarre específica: si el equipo dispone de la base de código AIRO-Doffy, el checkpoint puede servir como inicialización para nuevas tareas de agarre con objetos o condiciones de iluminación distintas.
- Despliegue en un robot Realman Beaver: la función de carga indicada sugiere que el modelo está preparado para ejecutarse en esa plataforma, siempre que se cuente con el mismo pipeline de percepción y de control.
- Transferencia a configuraciones de cámara en escala de grises: resulta adecuado en montajes donde solo se dispone de imágenes monocromas, dado que la ruta de entrenamiento indica explícitamente ese tipo de entrada.
- Evaluación de esquemas de consenso entre políticas: el nombre `policy_consensus_two` permite usarlo como referencia en estudios que comparen estrategias de combinación de políticas.
- Docencia y prototipado en robótica: sirve como ejemplo de artefacto de entrenamiento completo (checkpoints, EMA, normalizadores y configuración) para cursos o proyectos que reproduzcan pipelines de aprendizaje para control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. Si se asume que el repositorio de 11,5 GB reparte su peso entre cinco checkpoints, los pesos EMA, los normalizadores y la configuración, el tamaño por checkpoint estaría aproximadamente en el rango de 1 a 2 GB, lo que sugeriría un modelo de decenas de millones de parámetros. Es una estimación derivada del tamaño del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU para este checkpoint.
- Compatibilidad con GPU de consumo: no confirmada. Si se cumple la estimación anterior de tamaño, sería plausible ejecutarlo en GPU de consumo con suficiente memoria (por ejemplo, gama RTX xx80 o xx90), pero no hay verificación publicada.
- Opciones de despliegue: la model card indica que debe cargarse con `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia de propósito general, que además están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables con datos verificables de parámetros, contexto, rendimiento o licencia. Se trata de un checkpoint interno de un proyecto de investigación, sin benchmarks publicados ni modelo de referencia asociado, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial ni de redistribución. Cualquier uso en producción requiere aclarar previamente las condiciones con el autor.
- Ausencia de model card sustantiva: no hay documentación sobre arquitectura, datos de entrenamiento, métricas ni limitaciones conocidas, lo que impide evaluar su idoneidad con rigor.
- Especialización muy estrecha: el nombre de la tarea apunta a agarre de cilindros de distintos tamaños, por lo que es probable que la política no generalice a otras geometrías, materiales o condiciones de iluminación.
- Dependencia de un entorno concreto: la carga prevista mediante `AIRO-Doffy policies.realman_beaver.checkpoint.load_policy` implica dependencia del código del proyecto y, previsiblemente, del robot Realman Beaver y de su pipeline de percepción.
- Percepción en escala de grises: si el entrenamiento usó imágenes monocromas, el rendimiento puede degradarse al alimentar el modelo con imágenes en color o con condiciones de iluminación fuera de distribución.
- Riesgo de sobreajuste al entorno de laboratorio: los datos proceden de una recogida concreta (etiquetas `recollect` y `tightness`), por lo que el comportamiento fuera de ese montaje no está garantizado.
- Ausencia de validación externa: cero descargas y cero likes, sin benchmarks públicos ni evaluaciones de terceros que respalden el rendimiento.
- Fecha de creación y actualización muy próximas (10 de septiembre de 2026): el repositorio se publicó inmediatamente después de terminar el entrenamiento, sin evidencias de revisión posterior.
- Sin información sobre sesgos ni alucinación: al no ser un modelo de lenguaje, los conceptos de sesgo y alucinación no aplican del mismo modo; el riesgo equivalente es un comportamiento errático o inseguro en el control físico del robot, que no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-policy-consensus-two-lambda0
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: el único resultado devuelto (Kopilote, https://kopilote.app/) corresponde a una aplicación de formación ajena por completo a este artefacto y no se incluye como referencia técnica.
