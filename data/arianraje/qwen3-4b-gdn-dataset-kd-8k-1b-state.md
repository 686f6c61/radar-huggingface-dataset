# arianraje/qwen3-4b-gdn-dataset-kd-8k-1b-state

## Resumen

Qwen3-4B GDN hybrid es un punto de control experimental derivado de Qwen/Qwen3-4B en el que se sustituye parte de la atencion del transformer original por capas de atencion lineal basadas en Gated DeltaNet, dando lugar a una arquitectura hibrida. Lo publica el usuario arianraje en Hugging Face como parte de una escalera de destilacion off-policy (dataset-KD) sobre el modelo base, con escalones que van de 400M a 1B de tokens de entrenamiento. El repositorio contiene pesos ya decaidos (post-decay) y estados completos de entrenamiento previos al decaimiento de la tasa de aprendizaje.

El objetivo declarado es servir como brazo de control off-policy: es decir, un experimento reproducible para medir como afecta la destilacion sobre un conjunto de datos fijo a un modelo hibrido con atencion lineal, en comparacion con otras variantes del mismo estudio. No es un modelo pensado para uso en produccion, sino un artefacto de investigacion que documenta pesos, trazas de entrenamiento, prompts y mezcla de validacion.

La relevancia es doble: por un lado, explora la viabilidad de Gated DeltaNet como sustituto parcial de la atencion softmax en modelos de 4B parametros; por otro, publica no solo los pesos finales sino el estado intermedio de entrenamiento y los datos asociados, lo que facilita la replicacion. La informacion publica es muy escasa: no hay model card detallada, ni benchmarks, ni especificaciones de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion lineal Gated DeltaNet (GDN) |
| Parametros totales | 4B (heredados de Qwen/Qwen3-4B; no se especifica el recuento exacto tras la hibridacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en formato nativo; tamano del repo 4.0 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (presumible, no confirmado en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4B parametros, y lo modifica introduciendo capas de atencion lineal Gated DeltaNet en una configuracion hibrida. Gated DeltaNet es un mecanismo de atencion lineal con compuertas que combina una actualizacion tipo delta rule con un factor de decaimiento aprendido, lo que permite procesar secuencias con coste lineal en lugar de cuadratico. La mezcla exacta de capas lineales y de atencion softmax no se detalla en la informacion disponible.

El entrenamiento consiste en una destilacion off-policy sobre un dataset fijo (dataset-KD), organizada como una escalera de escalones que van de 400M a 1B de tokens. El repositorio incluye, para cada escalon, los pesos decaidos (`final`) y el estado completo previo al decaimiento (`end-minus-*`), asi como los datos de entrenamiento en `data/` (trazas, prompts y mezcla de validacion en archivos tar). No se especifica la composicion del dataset, el numero exacto de tokens por escalon, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3-4B base, aunque el proceso de destilacion y la hibridacion pueden alterarlas y no se han publicado evaluaciones.
- Codigo y matematicas: previsiblemente conserva parte de la competencia del modelo base, sin datos que lo confirmen.
- Tool calling / function calling: no disponible en la informacion publica.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo base Qwen3-4B es multilingue, pero no se documenta el efecto del entrenamiento.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre atencion lineal: el modelo sirve como banco de pruebas para medir el impacto de sustituir atencion softmax por Gated DeltaNet en un transformer de 4B, comparando contra el Qwen3-4B original con la misma receta de evaluacion.
- Replicacion de experimentos de destilacion: al publicarse los estados intermedios (`end-minus-*`) y los datos en `data/`, un equipo puede reanudar el entrenamiento desde cualquier escalon y verificar los resultados del autor.
- Estudio de escaleras de tokens: la progresion de 400M a 1B de tokens permite analizar la curva de aprendizaje y el punto de rendimientos decrecientes en destilacion off-policy.
- Analisis de decaimiento de learning rate: la separacion entre pesos `final` y `end-minus-*` permite aislar el efecto del decaimiento sobre la calidad final del modelo.
- Base para fine-tuning experimental: al estar bajo licencia MIT, puede usarse como punto de partida para ajustes posteriores en entornos de investigacion.
- Docencia y formacion: util como ejemplo didactico de arquitectura hibrida y de publicacion de artefactos intermedios de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache; en cuantizacion de 8 bits, en torno a 4-5 GB; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en FP16.
- GPU de consumo: cabe en GPUs consumer de 8 GB o mas en cuantizacion de 4 u 8 bits, siempre que se convierta a GGUF (no se distribuyen pesos cuantizados en el repo).
- Opciones de despliegue: al ser una arquitectura hibrida con Gated DeltaNet, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta garantizada y no se documenta; se requiere verificar el soporte del kernel de atencion lineal en el runtime elegido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B GDN hybrid (este) | 4B | no disponible | Hibrida con Gated DeltaNet | MIT | Hugging Face (repo de investigacion) |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion | Transformer denso | Apache 2.0 (segun el modelo base) | Hugging Face |
| Otros hibridos con atencion lineal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas hibridas equivalentes no esta disponible en la informacion proporcionada; el unico punto de referencia claro es el Qwen3-4B original del que deriva.

## Limitaciones y advertencias

- Artefacto de investigacion: no hay evaluaciones publicadas, por lo que se desconoce si conserva las capacidades del modelo base tras la hibridacion y la destilacion.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks, no puede descartarse un deterioro respecto al Qwen3-4B original.
- Sesgos: no documentados; hereda los del dataset de destilacion y del modelo base, sin analisis publicado.
- Contexto e idiomas: no se especifica la longitud de contexto efectiva ni la cobertura idiomatica tras el entrenamiento.
- Compatibilidad de despliegue: las capas Gated DeltaNet pueden no estar soportadas por los runtimes de inferencia habituales (vLLM, llama.cpp, TGI), lo que limita su uso en produccion sin trabajo de integracion.
- Licencia: MIT permite uso comercial, pero el modelo base Qwen3-4B tiene sus propios terminos; conviene revisar la compatibilidad de licencias antes de un uso comercial.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.
- Fecha de creacion futura en los metadatos (2026-11-09), lo que sugiere un artefacto de un experimento en curso mas que una version estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-dataset-kd-8k-1b-state
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del autor (perfil): https://huggingface.co/arianraje
- Paper de Gated DeltaNet: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
