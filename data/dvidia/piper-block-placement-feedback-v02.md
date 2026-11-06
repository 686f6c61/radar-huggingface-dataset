# Dvidia/piper-block-placement-feedback-v02

## Resumen

DVIDIA · PiPER learned feedback v0.2 es un modelo de aprendizaje por imitación para robótica, publicado por Dvidia bajo licencia MIT. Se trata de un piloto de investigación en simulación que combina un controlador aprendido con la primitiva de movimiento congelada de la versión v0.1. El adaptador aprendido controla únicamente la mandíbula (jaw) del robot, mientras que los seis comandos del brazo permanecen fijados por la primitiva original.

El modelo se ha entrenado con etiquetas sintéticas generadas por un experto autor y con percepción privilegiada del simulador, no con vídeo humano ni con datos de hardware real. El objetivo es explorar si una señal de retroalimentación aprendida mejora la colocación de un bloque rígido de 40 g en dos destinos entrenados dentro de una región de inicio estrecha.

Es relevante ahora porque documenta de forma explícita y transparente sus resultados negativos y sus límites: el adaptador con retroalimentación obtiene 6 éxitos estrictos de 24 frente a 8 del control ciego, lo que sugiere que la señal aprendida no supera a la variante sin retroalimentación en este piloto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (controlador aprendido para robótica; no se especifica la arquitectura de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el dataset asociado contiene arrays NPZ nativos de 1 ms; el formato de los pesos del modelo no se especifica) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red del controlador aprendido. El modelo se describe como un adaptador aprendido que se acopla a la primitiva de movimiento congelada de v0.1: solo la mandíbula es controlada por el adaptador, mientras que los seis comandos del brazo provienen de la primitiva fija. Los servos nativos, los límites de actuadores y la compensación de gravedad permanecen como componentes autorados, no aprendidos.

El entrenamiento utiliza etiquetas sintéticas de experto autor para la mandíbula y percepción privilegiada del simulador. No se emplea aprendizaje a partir de vídeo humano ni datos de hardware. El dataset incluye arrays NPZ nativos originales de 1 ms, demostraciones del profesor, todos los candidatos de desarrollo, la recolección DAgger (si se usó), trazas de confirmación, fuentes y recibos. Cuando existe `training-parent.json`, los profesores originales y los experimentos fallidos se conservan sin cambios bajo `prior-studies/study01/` con su protocolo y hashes originales. La presencia de la recolección DAgger antigua no implica que el modelo nuevo entrene con esas muestras de política mixta; el recibo de entrenamiento vinculado determina la receta real.

## Capacidades

- Control aprendido de la mandíbula para colocación de bloques en simulación.
- Acoplamiento a una primitiva de movimiento congelada para los seis comandos del brazo.
- Retroalimentación aprendida durante la ejecución (variante feedback) frente a control ciego sin retroalimentación en vivo.
- Entrenamiento con etiquetas sintéticas de experto autor y percepción privilegiada del simulador.
- Recolección DAgger documentada como parte del dataset de evidencias.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación robótica: el modelo sirve como referencia reproducible para estudiar si la retroalimentación aprendida mejora tareas de colocación en simulación, con resultados y fallos documentados de forma transparente.
- Estudio de ablación feedback frente a ciego: las variantes feedback, blind y feedforward permiten comparar el efecto de la señal de retroalimentación en las mismas condiciones de simulación.
- Reproducción de experimentos con evidencias completas: el dataset asociado incluye arrays NPZ de 1 ms, demostraciones del profesor, candidatos de desarrollo y trazas de confirmación, lo que facilita la verificación de resultados.
- Análisis de recetas de entrenamiento con DAgger: la conservación de la recolección DAgger y de los recibos de entrenamiento permite auditar qué muestras se usaron realmente en el modelo seleccionado.
- Docencia y formación en robótica de simulación: el replay estático grabado permite visualizar la proyección de la ejecución sin ejecutar física ni inferencia en el navegador.
- Evaluación de límites de transferencia: el modelo documenta explícitamente que no demuestra recuperación general de deslizamiento ni transferencia de habilidad one-shot a hardware, lo que lo hace útil como caso de estudio de alcance realista.

## Benchmarks y rendimiento

Resultados publicados en la model card (éxitos estrictos sobre casos programados):

| Variante | Éxitos estrictos / programados | Válidos |
|---|---:|---:|
| feedback | 6 / 24 | 24 |
| blind | 8 / 24 | 24 |
| feedforward | 5 / 24 | 24 |
| teacher | 24 / 24 | 24 |
| open_jaw | 0 / 24 | 24 |

Todos los resultados programados se conservan, incluidas las fallas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (el replay estático grabado no ejecuta física ni inferencia en el navegador).
- Latencia y throughput: no disponibles; la medición de tiempos excluye sensado, transporte de red y actuadores físicos, y no hay garantía de tiempo real duro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DVIDIA PiPER learned feedback v0.2 | no disponible | no disponible | 6/24 éxitos estrictos (feedback); 8/24 (blind) | MIT | Hugging Face, 0 descargas |
| DVIDIA PiPER v0.1 (primitiva congelada) | no disponible | no disponible | no disponible | MIT (según repositorio original) | Referenciada en la model card |
| Alternativas de aprendizaje por imitación para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de la mandíbula son sintéticas y provienen de un experto autor, con percepción privilegiada del simulador; no se usan vídeo humano ni hardware real.
- Solo la mandíbula está controlada por el adaptador aprendido; los seis comandos del brazo permanecen en la primitiva congelada de v0.1.
- El alcance se limita al mismo bloque rígido de 40 g, dos destinos entrenados y una región de inicio estrecha que en v0.1.
- Los inicios de desarrollo se reutilizaron después de que cinco candidatos de residuo completo fallaran los 16 casos de desarrollo.
- Las intervenciones afectan a la adquisición; el reagarre aéreo y la recuperación general de deslizamiento no están establecidos.
- Los servos nativos, los límites de articulación y mandíbula y la compensación de gravedad permanecen autorados.
- La medición de tiempos excluye sensado, transporte de red y actuadores físicos; no hay garantía de tiempo real duro.
- El modelo no constituye aprendizaje a partir de vídeo humano, recuperación general de deslizamiento, cualificación de hardware ni prueba de transferencia de habilidad one-shot.
- Los hashes establecen la consistencia de los artefactos, no su autenticidad independiente.
- El código y los artefactos originales de DVIDIA son MIT; los activos del robot upstream y los componentes de renderizado conservan sus propias licencias, con avisos incluidos donde corresponde.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; no se documentan sesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dvidia/piper-block-placement-feedback-v02
- Dataset completo de evidencias: https://huggingface.co/datasets/Dvidia/piper-block-placement-feedback-demonstrations-v02
- Replay grabado: https://dvidia-robot-simulation-lab.static.hf.space/learned-placement/v02/viewer/index.html
- Paper de investigación: https://research.dvidia.org/papers/learned-piper-grip-v02/
- Código fuente y CLI local: https://github.com/Dvidia-Inference/dvidia-training/tree/piper-feedback-v0.2
