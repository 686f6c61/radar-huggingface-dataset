# RyanL22/pi05-rby1-wujihand2-egomimic-baseline-20k

## Resumen

pi05-rby1-wujihand2-egomimic-baseline-20k es un ajuste fino (fine-tuning) de la política robótica lerobot/pi05_base, publicado por el usuario RyanL22. No es un modelo de lenguaje: es una política de visión-lenguaje-acción (VLA) para control de manipulación, entrenada específicamente para el robot bimanual RB-Y1 equipado con manos Wujihand2. El modelo transforma observaciones visuales estéreo y el estado articular del robot en comandos de acción de 54 dimensiones (brazo y mano derecha, brazo y mano izquierda).

Su relevancia es metodológica: se trata de una de las dos líneas base de alineamiento visual entrenadas sobre exactamente los mismos datos, etiquetas e hiperparámetros, diferenciándose únicamente en la edición de imagen aplicada. Esta variante sigue el estilo EgoMimic: la máscara del brazo generada con SAM3 se rellena en negro (con dilatación de 3 píxeles) y se superpone una línea roja, dibujada sobre la mano en los fotogramas humanos y sobre el segmento de muñeca a codo obtenido por cinemática directa en los fotogramas de teleoperación. El objetivo es medir cuánto ayuda ese alineamiento visual a transferir datos de vídeo humano a un robot real.

El modelo tiene 4.143.449.894 parámetros (aproximadamente 4,14 mil millones), un repositorio de 9,4 GB en safetensors, licencia Apache-2.0 y está pensado para ejecutarse con la biblioteca LeRobot 0.6.1. El entrenamiento se detuvo en el paso 20.000 con una pérdida final de 0,017. Es un artefacto de investigación: cero descargas y cero valoraciones, y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) heredada de pi0.5 (pi05); no se detalla la topología interna en la model card |
| Parametros totales | 4.143.449.894 (aproximadamente 4,14 mil millones) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No aplica como contexto de texto; el tokenizador se configuro con longitud maxima de 320 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio contiene safetensors en bfloat16. Admite cuantizacion manual (8/4 bits) con herramientas estandar, no validada por el autor |
| Idiomas soportados | No disponible (no se documenta condicionamiento por lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repositorio de 9,4 GB) |
| Dimension de estado/accion | 54 dimensiones: `observation.joint_position[10:64]` (brazo derecho 7, mano derecha 20, brazo izquierdo 7, mano izquierda 20) |
| Biblioteca | LeRobot 0.6.1 |
| Modelo base | lerobot/pi05_base |
| Pasos de entrenamiento | 20.000 |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo parte de lerobot/pi05_base, la implementación de pi0.5 en LeRobot, que es una política VLA: un codificador de visión procesa las imágenes y un cabezal de política produce acciones continuas. La model card no describe en detalle la arquitectura interna más allá de indicar que existe un tokenizador (longitud máxima 320) y un codificador visual. La adaptación específica de este ajuste consiste en expandir la dimensión de estado y acción del modelo base de 32 a 54 dimensiones, para cubrir los dos brazos de 7 grados de libertad y las dos manos de 20 grados de libertad. Las ruedas, el torso y la cabeza se excluyen porque permanecen constantes en los datos de entrenamiento; por tanto, la política no controla la base móvil ni el torso.

Los datos suman 660 episodios y 170.971 fotogramas a 30 fps, con imágenes estéreo de 288x512 (ambos ojos de la cámara ZED). Se componen de dos fuentes: 209 episodios de teleoperación real del RB-Y1 (4 categorías: pelota, botella, caja pequeña y muñeca) y 451 episodios de vídeo humano del conjunto RoboTryOn-human-2 (11 categorías), regrabados para coincidir con la vista ZED del RB-Y1. Las 15 celdas resultantes (4 de robot y 11 de humano) se mezclan con una proporción de muestreo proporcional a la raíz cuadrada del número de fotogramas. Las etiquetas de los vídeos humanos se obtienen mediante triangulación estéreo con HaWoR y se retargetizan al RB-Y1: cinemática inversa de 7 grados de libertad con mínimos cuadrados amortiguados hasta la pose de la muñeca, más cinemática inversa por dedo para las manos Wujihand2. La acción va por delante de la imagen 7 fotogramas (brazo) y 4 (mano), imitando el adelanto medido en la teleoperación; el renderizado se dibuja en la pose de la etiqueta, no en la de la acción.

El entrenamiento se realizó en 2 GPU H100 con lote global de 64 (32 por GPU), precisión bfloat16, codificador de visión sin congelar, aumento fotométrico consistente entre estéreo y sin aumento de espejo. La pérdida final fue de 0,017. La correspondencia de cámaras es fija tanto en entrenamiento como en inferencia: ojo izquierdo a `observation.images.base_0_rgb` y ojo derecho a `observation.images.left_wrist_0_rgb`.

## Capacidades

- Control bimanual de manipulación: genera acciones de 54 dimensiones que abarcan dos brazos de 7 grados de libertad y dos manos de 20 grados de libertad.
- Aprendizaje a partir de vídeo humano: incorpora etiquetas derivadas de vídeo de personas retargetizadas al robot mediante HaWoR más cinemática inversa, en lugar de depender solo de teleoperación.
- Percepción estéreo: consume dos vistas simultáneas (288x512 cada una) y aplica aumento fotométrico consistente entre ambas.
- Control por imitación a partir de estado y acción: no requiere instrucciones en lenguaje natural documentadas; la tarea se especifica implícitamente por la distribución de datos y la observación.
- Ejecución a 30 fps de datos de origen: la cadencia de la política está alineada con los datos de entrenamiento.
- Reutilización como base para ajuste fino: al ser una política completa en safetensors con licencia Apache-2.0, puede adaptarse a otros montajes con nuevos datos.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente conversacional; no es un modelo de lenguaje generativo.
- No se documentan capacidades de visión general (descripción de imágenes), audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en manipulación bimanual sobre RB-Y1: la política se carga en LeRobot 0.6.1 y se despliega en el robot real, enviando las dos vistas de la ZED y el estado articular de 54 dimensiones para obtener acciones de brazo y mano. Es adecuado porque el espacio de acción está definido exactamente para ese montaje.
- Línea base experimental en estudios de alineamiento visual: al compartir datos, etiquetas e hiperparámetros con la otra línea base del autor, permite aislar el efecto de la edición de imagen (máscara negra frente a línea roja EgoMimic) sobre la tasa de éxito. Es un caso de uso directamente previsto por el autor.
- Transferencia humano-robot con vídeo casero: el pipeline HaWoR más cinemática inversa amortiguada permite convertir nuevas grabaciones humanas en pares observación-acción reutilizables para ampliar el conjunto de entrenamiento sin teleoperar el robot.
- Retargeting de manos diestras: la cinemática inversa por dedo sobre Wujihand2 sirve de referencia para otros trabajos que necesiten mapear manos humanas a manos robóticas de 20 grados de libertad.
- Ajuste fino con datos propios de un laboratorio: partiendo de estos pesos Apache-2.0, un grupo puede especializar la política en sus propias categorías de objetos, manteniendo el mismo formato de 54 dimensiones o reexpandiendo el cabezal.
- Estudio de la brecha entre dominio humano y dominio robótico: la mezcla ponderada por raíz cuadrada del número de fotogramas (15 celdas) es un diseño reproducible para analizar cuánto vídeo humano tolera una política antes de degradar el rendimiento en el robot.
- Análisis de errores de cinemática inversa: los 12 episodios de freidora aérea con residuos de muñeca de 2 a 5 cm permiten estudiar cómo afectan las etiquetas imperfectas a una política de imitación.
- Evaluación de robustez fotométrica: el aumento estéreo-consistente y la ausencia de aumento de espejo hacen de este modelo un punto de partida para medir sensibilidad a cambios de iluminación o de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento, que se reproduce aquí como métrica de optimización y no como evaluación de capacidad:

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida final de entrenamiento | 0,017 | Paso 20.000, bfloat16, lote global 64 |
| Pasos de entrenamiento | 20.000 | 2 GPU H100 |
| Tasa de éxito en tareas | No disponible | No se publica ninguna evaluación |
| MMLU, HumanEval, GSM8K u otros | No aplica | No es un modelo de lenguaje |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,3 GB de pesos más activaciones del codificador de visión sobre dos imágenes de 288x512; en la práctica, un entorno de 10 a 14 GB es un presupuesto razonable. Estimación propia a partir del recuento de parámetros, no publicada por el autor.
- VRAM en fp32: en torno a 16,6 GB solo para los pesos.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 3 GB. No hay pesos cuantizados publicados, por lo que habría que generarlos y validar la degradación del control.
- GPU de entrenamiento documentadas: 2 x H100 con lote global 64 y precisión bfloat16.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16 con margen; una RTX 4080 o 4070 Ti Super (16 GB) es viable pero ajustada; tarjetas de 12 GB requerirían cuantización.
- Opciones de despliegue: LeRobot 0.6.1 sobre PyTorch es la vía soportada. vLLM, TGI, llama.cpp y Ollama no son aplicables a esta arquitectura de política robótica y no existe versión GGUF.
- Latencia y throughput: no disponibles. La política debe operar en línea sobre hardware conectado al robot, pero el autor no publica cifras de frecuencia de inferencia.

## Comparativa con modelos similares

Los datos cuantitativos de las alternativas no están disponibles en la información proporcionada, por lo que la comparación se limita a lo verificable:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-rby1-wujihand2-egomimic-baseline-20k | 4,14 mil millones | No aplica (tokenizador de 320 tokens) | Pérdida final 0,017; sin benchmarks | Apache-2.0 | Safetensors en HuggingFace, 0 descargas |
| lerobot/pi05_base (modelo base) | No disponible | No disponible | No disponible | No disponible en esta información | HuggingFace |
| Otra línea base de alineamiento visual del mismo autor (misma receta, edición "masquerade") | No disponible | No disponible | No disponible | No disponible | No identificada en la información recibida |
| Otras políticas VLA de manipulación (por ejemplo OpenVLA o pi0) | No disponible | No disponible | No disponible | No disponible | No evaluadas en esta ficha |

La búsqueda web realizada no devolvió ninguna referencia relevante al modelo: los resultados obtenidos eran páginas de ayuda de Gmail sin relación con robótica.

## Limitaciones y advertencias

- Cobertura de tareas muy reducida: solo 4 categorías de objeto en teleoperación real (pelota, botella, caja pequeña, muñeca) y 11 categorías en vídeo humano. La generalización a objetos nuevos no está evaluada.
- Episodios con etiquetas defectuosas: los 12 episodios de freidora aérea presentan residuos de cinemática inversa en la muñeca de 2 a 5 cm, porque la mano izquierda que abre la puerta queda fuera del alcance del RB-Y1. Se conservaron a propósito, y en esa variante la línea roja de EgoMimic sigue a la mano humana y discrepa de la etiqueta varios centímetros.
- Espacio de acción restringido: ruedas, torso y cabeza se excluyen por ser constantes en los datos, de modo que el modelo no puede controlar la locomoción ni la orientación del torso.
- Sin benchmarks ni validación externa: no hay tasas de éxito publicadas, el modelo tiene cero descargas y cero valoraciones, y el único número reportado es una pérdida de entrenamiento que no mide capacidad real.
- Riesgo de acciones incorrectas: al ser una política de imitación, no hay mecanismo de verificación; en producción puede generar trayectorias físicamente inviables o inseguras ante observaciones fuera de distribución. El concepto de alucinación de texto no aplica, pero el fallo silencioso sí.
- Acoplamiento al montaje: la política está atada a la vista ZED concreta, a la resolución 288x512, a la correspondencia fija de cámaras y al retargeting HaWoR más cinemática inversa. Cambiar la cámara o el montaje invalida las etiquetas.
- Restricciones de licencia: los pesos son Apache-2.0 y permiten uso comercial, pero la model card no aclara la licencia de los datos derivados empleados (teleoperación propia, RoboTryOn-human-2, HaWoR, SAM3), que puede imponer condiciones adicionales al uso comercial o a la redistribución de datos derivados.
- Idiomas: no se documenta ningún condicionamiento lingüístico, por lo que no procede evaluar capacidades multilingües.
- Artefacto de investigación: sin mantenimiento declarado, sin demo y sin soporte; la fecha de publicación (2026-09-20) y la ausencia total de adopción desaconsejan su uso en producción sin una validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-rby1-wujihand2-egomimic-baseline-20k
- Modelo base declarado: https://huggingface.co/lerobot/pi05_base
- Biblioteca LeRobot: https://github.com/huggingface/lerobot
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada
- La búsqueda web no devolvió enlaces relevantes al modelo (solo resultados no relacionados)
