# gehaozhang/gam-libero-pro

## Resumen

GAM-LIBERO-PRO es un paquete de investigación para robótica publicado por el usuario gehaozhang en HuggingFace. Contiene todo lo necesario para ejecutar GAM (Grounded Action Model) sobre los entornos de manipulación LIBERO y LIBERO-PRO: un detector 3D de vocabulario abierto afinado para estas escenas, una única política válida para las cuatro suites, un span head de T5 para extraer frases de objeto a partir de la instrucción y una caché de entrenamiento precalculada. El repositorio ocupa 122,5 GB e incluye pesos, caché y activos de evaluación.

El problema que resuelve es el de la manipulación robótica guiada por lenguaje con anclaje espacial explícito. En lugar de que la política infiera los objetos directamente de píxeles, GAM ancla cada objeto nombrado en la instrucción mediante un detector 3D (WildDet3D), lo convierte en una caja 3D, una nube de puntos y un conjunto reducido de tokens de imagen, y predice bloques de acción con un transformer de flow matching. Los objetos se anclan en el primer frame y se siguen con CoTracker durante el episodio.

La relevancia actual viene de que es una implementación reproducible y evaluable sobre LIBERO-PRO, un benchmark con 16 celdas de perturbación (spatial, object, goal y libero_10, cada una con variantes language, object, task y swap), y de que libera la caché y el código de entrenamiento para reutilizar la percepción sin volver a ejecutar el simulador. No se trata de un modelo de lenguaje: es una política visomotora con entrada de profundidad, orientada a investigación en imitación y anclaje 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema modular: detector 3D de vocabulario abierto WildDet3D (backbone SAM3 + codificador de texto + cabeza de profundidad, con codificador de geometría congelado), seguimiento con CoTracker, política de flow matching (transformer) para predicción de bloques de acción y span head basado en T5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM; consume instrucción, frames RGB-D y pistas de objeto) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en fp32 según la model card) |
| Idiomas soportados | no disponible (las instrucciones son en lenguaje natural, pero no se especifica el idioma) |
| Licencia | other |
| Formato de pesos | checkpoints `.pt` (PyTorch) y caché de entrenamiento en `.npz` |

## Arquitectura y entrenamiento

El pipeline combina cuatro piezas. Primero, el detector WildDet3D parte del checkpoint público `wilddet3d_alldata_all_prompt_v1.0` y se afina sobre renders de las cuatro suites de LIBERO y de las escenas perturbadas de LIBERO-PRO (200 unidades de suite, variante y tarea). En ese ajuste se usa una probabilidad de prompt de texto de 0,8, un backbone SAM3 con los 4 bloques más bajos de 32 congelados (learning rate multiplicado por 0,2), el codificador de texto entrenado y la cabeza de profundidad entrenada con el codificador de geometría congelado, con un peso L1 de profundidad de objeto de 4, precisión fp32 y learning rate 5e-5. La configuración es de entrada con profundidad: el detector recibe el mapa de profundidad del simulador en su backend RGB-D, la geometría del objeto es su caja 3D predicha y las nubes de puntos proceden de su propia profundidad.

Segundo, los objetos se anclan a partir de la instrucción en el primer frame, bien con las tablas de instrucción a frase de objeto publicadas, bien con el span head de T5 (`checkpoints/span_head_libero_pro.pt`), afinado sobre instrucciones de LIBERO para mapear instrucciones a frases de objeto. Tercero, esos objetos se siguen con CoTracker. Cuarto, la política (`checkpoints/gam_policy_libero_pro.pt`, instantánea del paso 6600 con pesos EMA, 1,2 GB) predice bloques de acción mediante un transformer de flow matching. La evaluación admite dos modos de troceado: `tempens` (ensamblado temporal, el ajuste publicado) y `rtc` (troceado en tiempo real). La caché cubre 4 suites x 10 tareas x 50 demostraciones.

## Capacidades

- Manipulación robótica guiada por instrucciones en lenguaje natural sobre los entornos LIBERO y LIBERO-PRO.
- Anclaje 3D de vocabulario abierto: detección de objetos no restringidos a una lista cerrada de clases.
- Extracción de frases de objeto desde la instrucción mediante span head de T5 o tabla de búsqueda publicada.
- Seguimiento temporal de objetos anclados con CoTracker a lo largo del episodio.
- Predicción de bloques de acción con transformer de flow matching y ensamblado temporal (`tempens`) o troceado en tiempo real (`rtc`).
- Evaluación sobre 16 celdas de LIBERO-PRO (spatial, object, goal y libero_10, con variantes language, object, task y swap) y sobre las suites originales de LIBERO.
- Entrenamiento de políticas propias sobre la caché publicada, sin necesidad de ejecutar la pila de percepción.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni tool calling.

## Casos de uso

- Evaluación de referencia en LIBERO-PRO: ejecutar la política publicada sobre las 16 celdas y comparar el comportamiento bajo perturbaciones de lenguaje, objeto, tarea e intercambio, usando `benchmarks/libero_pro/eval.py` y `run_all.py`.
- Investigación en anclaje 3D para robótica: sustituir el detector o el span head y medir el efecto del anclaje espacial sobre la tasa de éxito, gracias a que la percepción está separada de la política.
- Entrenamiento de políticas propias sin simulador: usar la caché `cache/libero_<suite>__<task>/demo_<i>.npz` para entrenar sobre 4 suites x 10 tareas x 50 demostraciones sin volver a ejecutar la pila de percepción ni el simulador.
- Ajuste fino del detector para dominios nuevos: reutilizar el procedimiento descrito (afinado de WildDet3D sobre renders de una escena concreta) para adaptar el anclaje de objetos a un entorno propio.
- Análisis de robustez ante perturbaciones: comparar el rendimiento en las variantes language, object, task y swap para cuantificar la sensibilidad de la política a cambios en la instrucción, en los objetos o en el objetivo.
- Reutilización del span head como componente independiente: el span head de T5 mapea instrucciones a frases de objeto y puede emplearse en otros pipelines que necesiten extraer referencias a objetos de una orden en lenguaje natural.
- Reproducción de resultados con entrenamiento de extremo a extremo: el script `train.py --e2e` permite mantener el detector congelado dentro del bucle de entrenamiento, útil para estudiar el acoplamiento entre percepción y política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card describe el protocolo de evaluación (16 celdas de LIBERO-PRO con las variantes language, object, task y swap, además de las suites originales de LIBERO) y enlaza vídeos de rollouts por celda, pero no incluye tablas de tasas de éxito ni comparaciones cifradas con otros modelos.

## Requisitos de hardware

- El entrenamiento sobre la caché publicada necesita aproximadamente 9 GB de memoria de GPU con batch 64, según la model card.
- La evaluación requiere menos de 8 GB de memoria de GPU, según la model card.
- Checkpoints: detector WildDet3D afinado, 4,7 GB; política GAM, 1,2 GB; span head sin tamaño especificado.
- Al necesitar menos de 8 GB para evaluar, cabe en GPU de consumo con al menos 8 GB de VRAM, aunque no se especifican modelos concretos.
- No se indican GPU recomendadas (A100, H100, RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: el repositorio `GehaoZhang6/Grounding-Action-Model` proporciona scripts propios de instalación, evaluación y entrenamiento. No se documenta integración con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia genéricos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. Los únicos modelos relacionados citados en la model card son del mismo autor y familia, y solo se conocen sus enlaces, no sus especificaciones.

| Modelo | Relación | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gehaozhang/gam-libero-pro | Modelo analizado | no disponible | no disponible | other | HuggingFace |
| gehaozhang/gam-robotwin | Mismo autor y familia GAM, otro dominio | no disponible | no disponible | no disponible | HuggingFace |
| gehaozhang/gam-wilddet3d | Detector general y span head universal de la familia GAM | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de manipulación guiada por lenguaje (VLA) | Categoría comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento ni tasas de éxito, por lo que no es posible comparar su calidad de forma objetiva con alternativas.
- La licencia se declara como "other"; no se detallan los términos exactos, así que el uso comercial debe verificarse directamente con el autor antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un modelo recién publicado y sin validación externa conocida.
- La configuración es de entrada con profundidad: el detector consume el mapa de profundidad del simulador en su backend RGB-D, lo que limita su uso directo en entornos reales sin adaptación del sensor.
- El anclaje de objetos se realiza en el primer frame y se sigue con CoTracker; errores de detección o de seguimiento se propagan al resto del episodio y pueden provocar fallos de manipulación.
- La extracción de frases de objeto depende de las tablas publicadas o del span head; instrucciones fuera de la distribución de LIBERO pueden no resolverse correctamente.
- No se especifican los idiomas soportados ni el comportamiento multilingüe.
- No se documentan sesgos concretos, pero al ser un sistema visomotor entrenado sobre escenas de simulador, es probable que generalice mal a condiciones de iluminación, oclusiones o geometrías no vistas (no confirmado en la información disponible).
- El entrenamiento y la evaluación están atados a las suites LIBERO y LIBERO-PRO; sacar el modelo de ese entorno requiere trabajo adicional no cubierto por la documentación.
- El tamaño total del repositorio (122,5 GB) implica un coste de almacenamiento y descarga considerable, incluyendo la caché de demostraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gehaozhang/gam-libero-pro
- Código: https://github.com/GehaoZhang6/Grounding-Action-Model
- Modelo hermano (RoboTwin): https://huggingface.co/gehaozhang/gam-robotwin
- Detector general y span head universal: https://huggingface.co/gehaozhang/gam-wilddet3d
- Ficheros de tarea de LIBERO-PRO (bddl e initial states): https://huggingface.co/datasets/gehaozhang/gam-libero-pro-assets
