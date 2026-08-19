# huggingFacing/frontierdiag-qwen25-7b-curriculum-v1

## Resumen

El repositorio `huggingFacing/frontierdiag-qwen25-7b-curriculum-v1` archiva los checkpoints críticos del estudio FrontierDiag, un diagnóstico de curriculum learning estático aplicado sobre el modelo base Qwen2.5-7B-Instruct. El autor, `huggingFacing`, publica estos pesos con fines de reproducibilidad y análisis científico, no como un modelo de instrucción de propósito general.

El estudio utiliza un multiset fijo de 7 168 ejemplos, con recuentos de exposición idénticos, tasa de aprendizaje constante y un presupuesto supervisado de tokens de respuesta. La única variable entre los distintos checkpoints es el orden de presentación de las muestras: aleatorio, de fácil a difícil y de difícil a fácil. Cada subcarpeta del repositorio contiene un checkpoint cargable directamente con la librería Transformers, correspondiente a uno de los tres schedules y a uno de los tres pasos de entrenamiento (112, 224 y 336), que equivalen a una, dos y tres exposiciones completas del dataset.

Este repositorio resulta relevante para investigadores que estudian el impacto del orden de las muestras en el aprendizaje de modelos de lenguaje, ya que permite aislar el efecto del curriculum manteniendo constantes el resto de hiperparámetros. La licencia Apache 2.0 facilita su uso en entornos académicos y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (checkpoints cargables con Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Qwen/Qwen2.5-7B-Instruct` (arquitectura Transformer, 7 mil millones de parámetros, aunque estos datos no se detallan en la información proporcionada). El entrenamiento se realiza con un multiset fijo de 7 168 ejemplos, manteniendo constante la tasa de aprendizaje, el recuento de exposiciones y el presupuesto de tokens de respuesta supervisada. La única variable es el orden de las muestras, que sigue tres schedules: `random` (intercalado aleatorio fijo), `easy-to-hard` (niveles 1 a 5) y `hard-to-easy` (niveles 5 a 1). Se utiliza una semilla fija (seed 10) y se archivan checkpoints en los pasos 112, 224 y 336, correspondientes a una, dos y tres pasadas completas por el dataset.

No se proporcionan detalles adicionales sobre la composición del dataset, el método de optimización (p. ej., si se usó RLHF o DPO) ni otras innovaciones técnicas. El propósito declarado es el diagnóstico y la reproducibilidad, no la mejora de capacidades generales.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede producir texto, aunque no se especifican capacidades concretas más allá de las heredadas del modelo base.
- Diagnóstico experimental: los checkpoints permiten comparar el efecto de distintos órdenes de entrenamiento sobre el aprendizaje, gracias al diseño controlado del estudio.
- Reproducibilidad: al ser checkpoints intermedios con semilla fija, facilitan la replicación exacta de los experimentos de FrontierDiag.
- No se documentan capacidades específicas como tool calling, razonamiento multi-paso, soporte de agentes o multilingüismo. La información disponible no las menciona.

## Casos de uso

- Investigación en curriculum learning: el repositorio permite analizar cómo el orden de las muestras afecta la convergencia y el rendimiento final de un modelo de 7B, comparando los tres schedules en los mismos pasos de entrenamiento.
- Reproducción de experimentos: los checkpoints están listos para cargarse con Transformers, lo que facilita verificar los resultados del estudio FrontierDiag o ejecutar análisis adicionales (p. ej., evaluación en tareas específicas).
- Estudio de la dinámica de entrenamiento: los pasos 112, 224 y 336 ofrecen puntos intermedios para observar la evolución del modelo a lo largo de las exposiciones, útil para investigar fenómenos como el olvido catastrófico o la transferencia de conocimiento.
- Benchmark de métodos de ordenación de datos: al mantener fijos todos los hiperparámetros excepto el orden, sirve como banco de pruebas para comparar estrategias de curriculum frente a aleatorio.
- Análisis de robustez: se puede evaluar si el orden de las muestras introduce sesgos o afecta la estabilidad del modelo ante diferentes semillas (aunque solo se proporciona la semilla 10).
- Educación y divulgación: como ejemplo práctico de fine-tuning controlado y de cómo archivar checkpoints para investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y no se comparan con modelos similares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware, VRAM estimada, GPUs recomendadas, opciones de despliegue o latencia. Dado que se trata de un modelo de 7B (según el nombre del base), es probable que pueda ejecutarse en GPUs consumer con cuantización, pero este dato no está confirmado en la documentación proporcionada.

## Comparativa con modelos similares

No disponible. No se mencionan modelos comparables ni se ofrecen datos de rendimiento relativo.

## Limitaciones y advertencias

- El repositorio está explícitamente destinado a diagnóstico y reproducibilidad, no como modelo de instrucción de propósito general. Su uso en aplicaciones de producción no está recomendado por el autor.
- No se han documentado sesgos, riesgos de alucinación o limitaciones de contexto o idioma. La ausencia de información no implica ausencia de riesgos.
- Los checkpoints son intermedios de un estudio concreto; no se garantiza que el modelo tenga un rendimiento óptimo en tareas generales.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Qwen2.5-7B-Instruct, deben respetarse también los términos de la licencia del modelo base (Qwen, que es Apache 2.0, aunque no se confirma en esta ficha).
- No se proporcionan datos sobre el dataset de entrenamiento (idiomas, dominios, posibles sesgos), lo que limita la evaluación de su aplicabilidad fuera del contexto experimental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/huggingFacing/frontierdiag-qwen25-7b-curriculum-v1
