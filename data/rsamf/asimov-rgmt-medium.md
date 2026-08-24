# rsamf/asimov-rgmt-medium

## Resumen

El modelo `asimov-rgmt-medium` es una política de control de cuerpo completo para el humanoide Asimov v1, desarrollada por rsamf. Se trata de un sistema de aprendizaje por refuerzo (RL) que implementa la arquitectura RGMT (Robust and Generalized Humanoid Motion Tracking) descrita en el artículo arXiv:2601.23080. El objetivo es que el robot siga movimientos de referencia capturados de humanos (motion capture) de forma robusta, incluso bajo perturbaciones y ruido en las acciones.

El modelo está entrenado con PPO en el simulador físico Newton y utiliza un actor-crítico de 3,25 millones de parámetros. La arquitectura combina un codificador de historial con atención causal (10 frames de propriocepción) y un codificador de comandos con atención cruzada (ventana de 21 frames de movimiento de referencia), lo que permite al actor inferir la dinámica del sistema a partir de su historial. El sufijo `-medium` indica que el entrenamiento se realizó solo con los splits de dificultad fácil y media del conjunto de datos `asimov-gmr`; los clips de dificultad alta se evalúan en zero-shot.

La relevancia de este modelo radica en su enfoque de sim-to-real: incluye límites de par motor realistas del URDF, aleatorización de dominio (fricción, masa, ganancias PD, límites de par) y un filtro de paso bajo en las acciones, todo ello orientado a que la política pueda transferirse a hardware real. La licencia Apache-2.0 permite uso comercial, aunque los datos de movimiento de referencia (AMASS) tienen restricciones de investigación no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico con codificador de historial (atención causal) y codificador de comandos (atención cruzada) |
| Parametros totales | 3,25 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (ventanas de 10 frames de propriocepción y 21 frames de comandos) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch `.pt`, sin cuantización publicada) |
| Idiomas soportados | No disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (incluye pesos, normalizador de observaciones, dimensiones de red y configuración de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura RGMT se compone de dos módulos principales: un codificador de historial que procesa los últimos 10 frames de propriocepción mediante atención causal, generando un embedding de la dinámica del sistema; y un codificador de comandos que usa ese embedding como consulta (query) sobre una ventana de 21 frames de comandos de movimiento de referencia, mediante atención cruzada. De esta forma, la agregación de la ventana de comandos se condiciona a la dinámica inferida. La acción es un residuo sobre los objetivos articulares de referencia, pasa por una función tanh y un filtro de paso bajo (alpha 0,7 a 60 Hz) que forma parte del sistema entrenado. El crítico es asimétrico: durante el entrenamiento recibe el estado privilegiado sin ruido, incluyendo los parámetros de dinámica muestreados, mientras que el actor debe inferirlos desde su historial.

El entrenamiento se realizó con PPO durante 34.000 iteraciones en 8.192 entornos paralelos, con doble clip, guarda de retroceso por choque KL, pérdida MSE para el valor, recortes de gradiente separados para actor y crítico, tasa de aprendizaje adaptativa KL, regularizadores de suavidad temporal y espacial, y un anneal de entropía en el último 30% del entrenamiento. Se aplicó aleatorización de dominio consistente por episodio: fricción del pie uniforme en [0,4, 1,0], escala de masa del robot en [0,9, 1,1], escala de ganancias PD en [0,9, 1,1] y escala de límites de par en [0,8, 1,2]. Los límites de par por articulación se tomaron del URDF, y la selección del checkpoint se hizo por mejor éxito en la evaluación en bucle (este checkpoint corresponde a la iteración 33.600).

## Capacidades

- Seguimiento de movimiento de cuerpo completo: la política genera objetivos articulares residuales para que el humanoide Asimov v1 (23 grados de libertad actuados) siga movimientos de referencia capturados de humanos.
- Robustez a ruido en las acciones: la tasa de éxito robusta (con ruido de desviación estándar 0,05) es prácticamente igual a la tasa greedy (sin ruido), lo que indica que la política es genuinamente robusta y no depende de la dithering de evaluación.
- Generalización zero-shot a dificultad alta: el modelo nunca vio clips de dificultad dura durante el entrenamiento, pero alcanza un 55,0% de éxito en ellos.
- Inferencia de dinámica: el actor debe inferir los parámetros de dinámica (fricción, masa, etc.) a partir de su historial de propriocepción, lo que lo hace adaptable a variaciones del entorno.
- Compatibilidad con sim-to-real: incluye límites de par realistas del URDF, filtro de paso bajo entrenado y normalización de observaciones almacenada en el checkpoint.
- Evaluación reproducible: el protocolo de evaluación está definido en el repositorio de entrenamiento, con scripts para reproducir los resultados.

## Casos de uso

- Investigación en control de robots humanoides: el modelo sirve como referencia para estudiar arquitecturas de seguimiento de movimiento con inferencia de dinámica, especialmente en el contexto de sim-to-real. Los investigadores pueden cargar el checkpoint y evaluarlo en el simulador Newton o adaptarlo a sus propios entornos.
- Desarrollo de políticas de locomoción robustas: al estar entrenado con aleatorización de dominio y límites de par realistas, es adecuado como punto de partida para desarrollar controladores que deban operar en condiciones inciertas (variaciones de fricción, masa, etc.).
- Benchmarking de algoritmos de RL para robótica: el protocolo de evaluación (conjunto de 180 clips congelados, tres dificultades, métricas de éxito y error de pose) permite comparar nuevas arquitecturas o algoritmos de entrenamiento contra este modelo.
- Generación de movimiento para animación o simulación: aunque el objetivo es hardware, la política puede usarse en simulación para generar movimientos humanos retargeteados sobre el robot, útil en entornos de prueba de interacción humano-robot.
- Transferencia a otros robots humanoides: la arquitectura RGMT es agnóstica al robot en cierta medida; el código de entrenamiento y evaluación puede adaptarse a otros modelos con grados de libertad similares, aunque requeriría reentrenamiento.
- Educación y formación en robótica: el modelo y su código asociado proporcionan un ejemplo completo de pipeline de RL para control de robots, desde el retargeting de datos de captura de movimiento hasta el despliegue en simulación, útil para cursos avanzados de robótica o aprendizaje por refuerzo.

## Benchmarks y rendimiento

El protocolo de evaluación consiste en reproducir cada clip del conjunto de prueba (180 clips congelados, 60 por dificultad) desde el inicio hasta el final. Un episodio se considera exitoso si llega al final sin caída ni terminación por fallo de seguimiento. La tasa robusta se mide con ruido en las acciones (desviación estándar 0,05) y tres repeticiones por clip; la tasa greedy sin ruido. El error de pose se calcula solo sobre episodios exitosos.

| Metrica | Valor |
|---|---|
| Tasa de éxito robusta | 75,4% ± 0,9 |
| Tasa de éxito greedy | 75,0% |
| Éxito en dificultad fácil | 93,9% |
| Éxito en dificultad media | 77,2% |
| Éxito en dificultad dura (zero-shot) | 55,0% |
| MPKPE (episodios exitosos) | 96,0 mm |
| Error de pose relativo a la raíz | 51,9 mm |
| Jitter comandado | 20,5 mrad |

No se han publicado resultados comparativos con otros modelos en la información disponible. La card menciona que una política compañera entrenada sin aleatorización de dominio ni límites de par obtiene unos dos puntos más en simulación, pero no es adecuada para hardware.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 3,25 millones de parámetros, la inferencia es extremadamente ligera. Puede ejecutarse en CPU sin problemas, y en cualquier GPU moderna (incluso integradas) con margen amplio. No se requieren GPUs de alta gama.
- Entrenamiento: la card indica 8.192 entornos paralelos, lo que sugiere un clúster con múltiples GPUs (probablemente A100 o similar), pero no se especifica el hardware exacto. Para reproducir el entrenamiento completo se necesitaría un entorno de cómputo de alto rendimiento.
- Despliegue: el checkpoint se consume mediante los scripts del repositorio `rsamf/asimov-rgmt`, que requieren el simulador Newton y una caché de datos de movimiento preprocesada. No se mencionan integraciones con vLLM, Ollama u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño del modelo y la frecuencia de control de 60 Hz, se espera que la inferencia sea muy rápida (del orden de microsegundos a milisegundos en CPU), pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de seguimiento de movimiento para humanoides con arquitectura RGMT). El campo de control de robots humanoides con RL es activo, pero no se han encontrado en la información proporcionada modelos directamente comparables con métricas equivalentes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no ha sido probado en hardware real; la card indica que está entrenado para sim-to-real, pero no se mencionan pruebas físicas. La transferencia a un robot real requeriría validación adicional.
- Los datos de movimiento de referencia (AMASS) tienen una licencia de investigación no comercial, por lo que no se pueden redistribuir. El pipeline `asimov-gmr` permite reproducir el corpus de entrenamiento a partir de una copia propia de AMASS, pero el usuario debe asegurarse de cumplir la licencia.
- La política no ha visto clips de dificultad dura durante el entrenamiento; aunque el rendimiento zero-shot es del 55%, puede fallar en movimientos muy complejos o acrobáticos.
- El filtro de paso bajo (alpha 0,7) y los límites de par del URDF son parte del sistema entrenado; deben aplicarse en despliegue o la política puede comportarse de forma inesperada.
- La card se corta en la sección de limitaciones ("The policy has not yet..."), por lo que no se dispone de información adicional sobre sesgos, riesgos de alucinación (no aplica, no es un modelo generativo de texto) u otras advertencias.
- El repositorio de entrenamiento requiere una caché de datos de movimiento preprocesada; sin ella, la evaluación no es posible. Esto añade una barrera de entrada para reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rsamf/asimov-rgmt-medium
- Repositorio de entrenamiento y evaluación: https://github.com/rsamf/asimov-rgmt
- Pipeline de datos de referencia (retargeting AMASS): https://github.com/rsamf/asimov-gmr
- Paper (arXiv:2601.23080): https://arxiv.org/abs/2601.23080
- Documentación de resultados del entrenamiento: https://github.com/rsamf/asimov-rgmt/blob/main/docs/results.md
